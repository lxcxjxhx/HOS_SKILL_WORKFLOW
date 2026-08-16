"""audit_eval.py — 仓库级真实框架审计评测（Phase 3 基建）。

协议（DEP + SAL，见 dep-ablation0-report.md 的动机）：
- 任务：给定 CVE 描述 + CWE，系统在**漏洞快照（fix~1）**的全仓范围内定位漏洞代码（不给目标文件）。
- 验证链（DEP 差分证据）：
  1. 定位命中：系统报告的 finding 文件 ∈ manifest file_paths（fix diff 涉及文件，ground truth）
  2. 消失性判定：同一模式在 patched 快照（fix）同文件不应再报（防"修复不完整"假阳性）
  3. 证据链：AI 层 CONFIRMED 需验证链完整（沿用 hos-ls 语义）
- patched 端对照：fix 快照独立分析 → 应无 finding（FPR/Pair-Correct 口径）

用法（cwd = bench-runs）：
  python hosls-eval/audit_eval.py check <manifest>              # 校验：commit 存在 + 父 commit 目标文件存在
  python hosls-eval/audit_eval.py static <manifest> [n]         # 静态双端差分（semgrep p/<lang>，0 API）
  python hosls-eval/audit_eval.py ai <manifest> <n> [workers]   # AI 层（候选文件 --pure-ai，付费，需余额门槛）
  python hosls-eval/audit_eval.py report <results.json>         # 汇总指标

成本门槛：ai 子命令启动前检查 HOSLS_BALANCE_GATE（环境变量，单位元）；余额低于 2×预估拒绝。
"""
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # bench-runs
HOSLS = os.path.join(BASE, "hos-ls")
EVAL = os.path.join(BASE, "hosls-eval")
REPOS = os.path.join(BASE, "framework-audit", "repos")
REPORTS = os.path.join(EVAL, "reports")
SEMGREP = os.path.join(HOSLS, "envs", "sast-venv", "Scripts", "semgrep.exe")
SEMGREP_LANG = {"java": "p/java", "python": "p/python", "typescript": "p/typescript", "javascript": "p/javascript"}
SCAN_TIMEOUT = 900


def git(repo, *args, timeout=300):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", timeout=timeout)
    return r.returncode, r.stdout.strip(), r.stderr.strip()


def repo_name(repo_url):
    return repo_url.rstrip("/").split("/")[-1].replace(".git", "")


def ensure_repo(repo_url):
    """浅克隆（blob:none 过滤）。返回本地路径或 None。"""
    name = repo_name(repo_url)
    dst = os.path.join(REPOS, name)
    if os.path.isdir(os.path.join(dst, ".git")):
        return dst
    os.makedirs(REPOS, exist_ok=True)
    r = subprocess.run(["git", "clone", "--filter=blob:none", repo_url, dst],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=1800)
    if r.returncode != 0:
        print(f"[repo] clone {repo_url} failed: {r.stderr[-300:]}")
        return None
    print(f"[repo] cloned {repo_url} -> {dst}")
    return dst


def ensure_commit(repo, sha):
    rc, out, err = git(repo, "cat-file", "-t", sha)
    if rc == 0:
        return True
    rc, out, err = git(repo, "fetch", "--depth", "1", "origin", sha)
    return rc == 0


def load_json(path):
    """Windows 兼容读取（容忍 UTF-8 BOM）。"""
    return json.load(open(path, encoding="utf-8-sig"))


def load_pairs(path):
    """读取 manifest，兼容单对象/数组两种形态。"""
    d = load_json(path)
    if isinstance(d, dict):
        return [d]
    return d


def verify_manifest(manifest_path):
    """三重校验：fix commit 存在 / fix~1 存在 / fix~1 下 file_paths 全部存在。"""
    pairs = load_pairs(manifest_path)
    out = []
    for p in pairs:
        repo = ensure_repo(p["repo_url"])
        if not repo:
            out.append({**p, "verify": {"ok": False, "err": "clone failed"}})
            continue
        fix = p.get("fix_commit")
        v = {"fix_commit_exists": False, "parent_exists": False, "files_at_parent": [], "ok": False, "err": ""}
        if not fix:
            v["err"] = "no fix_commit"
        else:
            if ensure_commit(repo, fix):
                v["fix_commit_exists"] = True
                rc, _, _ = git(repo, "rev-parse", fix + "~1")
                if rc == 0:
                    v["parent_exists"] = True
                    for fp in p.get("file_paths", []):
                        rc2, _, _ = git(repo, "cat-file", "-e", fix + "~1:" + fp)
                        v["files_at_parent"].append({"path": fp, "exists": rc2 == 0})
                    v["ok"] = v["parent_exists"] and all(f["exists"] for f in v["files_at_parent"])
                else:
                    v["err"] = "parent commit missing (shallow?)"
            else:
                v["err"] = "fix commit unavailable"
        out.append({**p, "verify": v})
        print(f"[check] {p['framework']} {p.get('cve_ids', ['?'])[0]}: ok={v['ok']} {v.get('err', '')}", flush=True)
    ok = sum(1 for o in out if o["verify"]["ok"])
    print(f"[check] {ok}/{len(out)} pairs verified")
    return out


def semgrep_scan(src_dir, lang, timeout=SCAN_TIMEOUT):
    """对目录跑 semgrep p/<lang>，返回 {relpath: [finding]}。0 API。"""
    cfg = SEMGREP_LANG.get(lang, "p/python")
    r = subprocess.run([SEMGREP, "--config", cfg, "--json", "--quiet", src_dir],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    if r.returncode not in (0, 1):
        return {}
    try:
        d = json.loads(r.stdout)
    except Exception:
        return {}
    by_file = {}
    base = os.path.abspath(src_dir)
    for x in d.get("results", []):
        ap = os.path.abspath(x.get("path", ""))
        if ap.startswith(base):
            rel = os.path.relpath(ap, base).replace("\\", "/")
        else:
            rel = ap
        by_file.setdefault(rel, []).append({
            "line": x.get("start", {}).get("line"),
            "check": x.get("check_id"),
            "msg": ((x.get("extra") or {}).get("message") or "")[:120],
        })
    return by_file


def worktree_add(repo, commit, wt_path):
    rc, out, err = git(repo, "worktree", "add", "--detach", wt_path, commit)
    return rc == 0, err[:200]


SAL_SINKS = None


def load_sal_sinks():
    global SAL_SINKS
    if SAL_SINKS is None:
        p = os.path.join(EVAL, "sal_java_sinks.json")
        if os.path.exists(p):
            SAL_SINKS = json.load(open(p, encoding="utf-8-sig"))
        else:
            SAL_SINKS = {}
    return SAL_SINKS


def sal_candidates(repo_dir, lang, cwes, max_files=50):
    """Sink 锚定候选生成：在目录内用 CWE→sink 正则找候选文件（0 API）。"""
    sinks = load_sal_sinks()
    if lang != "java":
        return []  # Java 优先；python/ts 候选生成待扩展
    pats = []
    for cwe in cwes or []:
        entry = sinks.get(cwe)
        if entry:
            pats.extend(entry["sinks"])
    if not pats:
        return []
    cand = {}
    for root, _, files in os.walk(repo_dir):
        if ".git" in root:
            continue
        for f in files:
            if not f.endswith(".java"):
                continue
            fp = os.path.join(root, f)
            try:
                text = open(fp, encoding="utf-8", errors="replace").read()
            except Exception:
                continue
            hits = []
            for pat in pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    hits.append({"pattern": pat, "line": text[:m.start()].count("\n") + 1})
            if hits:
                rel = os.path.relpath(fp, repo_dir).replace("\\", "/")
                cand[rel] = hits[:5]
    # 按命中数排序，取前 max_files
    ranked = sorted(cand.items(), key=lambda kv: -len(kv[1]))[:max_files]
    return [{"file": f, "hits": h} for f, h in ranked]


def static_diff(pairs, n=0):
    """静态双端差分：vuln 快照（fix~1）vs patched 快照（fix）。"""
    results = {}
    for p in pairs[:n] if n else pairs:
        pid = p["item_id"]
        repo = ensure_repo(p["repo_url"])
        if not repo or not p.get("fix_commit"):
            results[pid] = {"ok": False, "err": "repo or commit missing"}
            continue
        fix = p["fix_commit"]
        vuln_wt = os.path.join(REPOS, f"_wt-{pid}-vuln")
        patch_wt = os.path.join(REPOS, f"_wt-{pid}-patch")
        try:
            ok, err = worktree_add(repo, fix + "~1", vuln_wt)
            if not ok:
                results[pid] = {"ok": False, "err": f"worktree vuln: {err}"}
                continue
            ok2, err2 = worktree_add(repo, fix, patch_wt)
            if not ok2:
                results[pid] = {"ok": False, "err": f"worktree patch: {err2}"}
                git(repo, "worktree", "remove", "--force", vuln_wt)
                continue
            t0 = time.time()
            v = semgrep_scan(vuln_wt, p.get("language", "python"))
            pv = semgrep_scan(patch_wt, p.get("language", "python"))
            v_files = set(v)
            p_files = set(pv)
            gt = set(p.get("file_paths", []))
            hit = sorted(gt & v_files)
            gone = [f for f in hit if f not in p_files]  # vuln 命中且 patched 消失
            resid = [f for f in hit if f in p_files]      # 残留（误报风险）
            sal = sal_candidates(vuln_wt, p.get("language", "python"), p.get("cwe_ids", []))
            sal_hit_gt = [c["file"] for c in sal if c["file"] in gt]
            results[pid] = {
                "ok": True, "framework": p["framework"], "cve": p.get("cve_ids", []),
                "vuln_files_found": len(v_files), "patched_files_found": len(p_files),
                "gt_hit": hit, "dep_gone": gone, "dep_residual": resid,
                "locate_static": len(hit) > 0,
                "sal_candidates": len(sal), "sal_top_hit_gt": sal_hit_gt[:10],
                "secs": round(time.time() - t0, 1),
            }
            print(f"[static] {pid} {p['framework']}: gt_hit={len(hit)} gone={len(gone)} resid={len(resid)} "
                  f"sal={len(sal)} sal_gt={len(sal_hit_gt)} ({results[pid]['secs']}s)", flush=True)
        finally:
            for wt in (vuln_wt, patch_wt):
                if os.path.isdir(wt):
                    git(repo, "worktree", "remove", "--force", wt)
    return results


def ai_run(pairs, n, workers, cfg="hos-ls.yaml"):
    """AI 层：对 vuln 快照候选文件跑 --pure-ai（付费）。候选 = SAST 命中 ∪ SAL 锚定文件。"""
    # 余额门槛（环境变量 HOSLS_BALANCE_GATE，元）
    gate = float(os.environ.get("HOSLS_BALANCE_GATE", "0"))
    # 预估：每文件 70,807 token 校准 × 单价（峰值输入 3/M + 输出 9/M，缓存 0.1/M）
    est_per_file = 70807 * (3 + 9) / 1e6  # 约 0.85 元（按全价，实际约 1/2-1/5）
    est = est_per_file * n * 3
    if gate > 0 and est * 2 > gate:
        print(f"[gate] 预估 {est:.2f} 元 > 余额门槛/2（{gate/2:.2f} 元），拒绝启动；设 HOSLS_BALANCE_GATE 或 HOSLS_FORCE=1")
        return None
    print("[ai] 候选文件生成（SAL 锚定 + SAST 命中）与 AI 扫描接口 — 待 manifest 数据落地后启用")
    return {}


def report(results, tag):
    ok = [r for r in results.values() if r.get("ok")]
    n = len(ok) or 1
    loc = sum(1 for r in ok if r.get("locate_static"))
    print(f"[report] n={len(ok)} | 静态定位命中 {loc}/{len(ok)} ({loc/n*100:.1f}%)")
    return {"n": len(ok), "locate_static": loc}


def main():
    cmd = sys.argv[1]
    if cmd == "check":
        out = verify_manifest(sys.argv[2])
        dst = os.path.join(REPORTS, "audit-manifest-check.json")
        json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"-> {dst}")
    elif cmd == "static":
        pairs = load_pairs(sys.argv[2])
        n = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        r = static_diff(pairs, n)
        dst = os.path.join(REPORTS, "audit-static-diff.json")
        json.dump(r, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        report(r, "static")
        print(f"-> {dst}")
    elif cmd == "ai":
        pairs = load_pairs(sys.argv[2])
        n = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        workers = int(sys.argv[4]) if len(sys.argv) > 4 else 2
        r = ai_run(pairs, n, workers)
        if r is not None:
            dst = os.path.join(REPORTS, "audit-ai.json")
            json.dump(r, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"-> {dst}")
    elif cmd == "report":
        d = json.load(open(sys.argv[2], encoding="utf-8"))
        print(json.dumps(report(d, "audit"), ensure_ascii=False, indent=1))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
