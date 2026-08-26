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
    """校验：commit 存在 + commit 下 file_paths 全部存在（VulnGym commit = 漏洞存在快照）。"""
    pairs = load_pairs(manifest_path)
    out = []
    for p in pairs:
        repo = ensure_repo(p["repo_url"])
        if not repo:
            out.append({**p, "verify": {"ok": False, "err": "clone failed"}})
            continue
        fix = p.get("fix_commit")
        v = {"commit_exists": False, "files_at_commit": [], "ok": False, "err": ""}
        if not fix:
            v["err"] = "no commit"
        else:
            if ensure_commit(repo, fix):
                v["commit_exists"] = True
                for fp in p.get("file_paths", []):
                    rc2, _, _ = git(repo, "cat-file", "-e", fix + ":" + fp)
                    v["files_at_commit"].append({"path": fp, "exists": rc2 == 0})
                v["ok"] = all(f["exists"] for f in v["files_at_commit"])
            else:
                v["err"] = "commit unavailable"
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
        p = os.path.join(EVAL, "sal_sinks.json")
        if os.path.exists(p):
            SAL_SINKS = json.load(open(p, encoding="utf-8-sig"))
        else:
            SAL_SINKS = {}
    return SAL_SINKS


def sal_candidates(repo_dir, lang, cwes, description="", max_files=20):
    """Sink 锚定候选生成：按语言 + CWE 的 sink 正则扫描仓库（0 API）。

    精化：候选按 (sink 命中数 + CVE 描述关键词命中数) 排序，取 top max_files。
    关键词来自 description（英文分词），提升候选与漏洞描述的相关性、压缩候选集。
    """
    sinks = load_sal_sinks()
    lang_table = sinks.get(lang, {})
    pats = []
    for cwe in cwes or []:
        entry = lang_table.get(cwe)
        if entry:
            pats.extend(entry)
    if not pats:
        return []
    kws = []
    if description:
        for w in re.findall(r"[A-Za-z][A-Za-z0-9]{2,}", description.lower()):
            if w not in ("the", "and", "via", "for", "with", "that", "this", "from",
                         "into", "through", "using", "when", "after", "before", "during"):
                kws.append(w)
    exts = {"java": (".java",), "python": (".py",), "javascript": (".js", ".jsx", ".svelte"),
            "typescript": (".ts", ".tsx", ".vue"), "go": (".go",),
            "c": (".c", ".h"), "cpp": (".cpp", ".cc", ".hpp", ".h", ".cxx", ".c++")}
    exts_ok = exts.get(lang, (".py",))
    # 优化：跳过 vendored/打包产物与超大文件（bundle/静态库含大量 sink 关键词会污染候选排名）
    skip_parts = ("node_modules", "/dist/", "/build/", "/vendor/", "/static/", "/public/",
                  "site-packages", ".next", ".nuxt", "venv", "/min/")
    cand = {}
    for root, _, files in os.walk(repo_dir):
        if ".git" in root:
            continue
        rel_root = os.path.relpath(root, repo_dir).replace("\\", "/")
        if any(s in rel_root for s in skip_parts):
            continue
        for f in files:
            if not f.endswith(exts_ok):
                continue
            if ".min." in f or "bundle" in f.lower() or f.endswith(".d.ts"):
                continue
            fp = os.path.join(root, f)
            try:
                text = open(fp, encoding="utf-8", errors="replace").read()
            except Exception:
                continue
            if len(text) > 1_500_000:  # 跳过 >1.5MB 的打包/生成文件
                continue
            hits = []
            for pat in pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    hits.append({"pattern": pat, "line": text[:m.start()].count("\n") + 1})
            if hits:
                rel = os.path.relpath(fp, repo_dir).replace("\\", "/")
                score = len(hits) * 2
                if kws:
                    low = text.lower()
                    score += sum(1 for kw in kws if kw in low)
                cand[rel] = {"hits": hits[:5], "score": score}
    # 按 score 排序（sink 命中为主，描述关键词为辅），取前 max_files
    ranked = sorted(cand.items(), key=lambda kv: -kv[1]["score"])[:max_files]
    return [{"file": f, "hits": h["hits"], "score": h["score"]} for f, h in ranked]


def static_diff(pairs, n=0, sal_only=False):
    """仓库级静态定位：vuln 快照 = commit（VulnGym 的 commit 是漏洞存在/验证 commit，非 fix）。

    GT = critical_operation.file + entry_point.file + trace[].file（manifest file_paths）。
    DEP 差分（fix~1..fix）仅当 manifest 提供 fix_commit 时启用（VulnGym 默认不提供）。
    """
    results = {}
    for p in pairs[:n] if n else pairs:
        pid = p["item_id"]
        repo = ensure_repo(p["repo_url"])
        if not repo or not p.get("fix_commit"):
            results[pid] = {"ok": False, "err": "repo or commit missing"}
            continue
        fix = p["fix_commit"]
        vuln_wt = os.path.join(REPOS, f"_wt-{pid}-vuln")
        try:
            ok, err = worktree_add(repo, fix, vuln_wt)
            if not ok:
                results[pid] = {"ok": False, "err": f"worktree vuln: {err[:200]}"}
                # 大仓库 worktree 可能超时：重试一次（900s）
                ok2, err2 = worktree_add(repo, fix, vuln_wt)
                if not ok2:
                    results[pid] = {"ok": False, "err": f"worktree vuln (retry): {err2[:200]}"}
                    continue
            t0 = time.time()
            if sal_only:
                v = {}
            else:
                v = semgrep_scan(vuln_wt, p.get("language", "python"))
            v_files = set(v)
            gt = set(p.get("file_paths", []))
            semgrep_hit_gt = sorted(gt & v_files)
            sal = sal_candidates(vuln_wt, p.get("language", "python"), p.get("cwe_ids", []),
                                 p.get("description", ""))
            sal_hit_gt = [c["file"] for c in sal if c["file"] in gt]
            results[pid] = {
                "ok": True, "framework": p["framework"], "cve": p.get("cve_ids", []),
                "gt_files": sorted(gt), "sink_file": p.get("sink_file"),
                "semgrep_hit_gt": semgrep_hit_gt,
                "sal_candidates": len(sal), "sal_top_hit_gt": sal_hit_gt[:10],
                "sal_locate": len(sal_hit_gt) > 0,
                "gt_in_commit": all(
                    os.path.exists(os.path.join(vuln_wt, f)) for f in gt),
                "secs": round(time.time() - t0, 1),
            }
            print(f"[static] {pid} {p['framework']}: sal_gt={len(sal_hit_gt)}/{len(gt)} "
                  f"semgrep_gt={len(semgrep_hit_gt)} sal_cand={len(sal)} "
                  f"({results[pid]['secs']}s)", flush=True)
        finally:
            if os.path.isdir(vuln_wt):
                git(repo, "worktree", "remove", "--force", vuln_wt)
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
    sal_loc = sum(1 for r in ok if r.get("sal_locate"))
    print(f"[report] n={len(ok)} | SAL 定位命中 {sal_loc}/{len(ok)} ({sal_loc/n*100:.1f}%)")
    return {"n": len(ok), "sal_locate": sal_loc}


def main():
    cmd = sys.argv[1]
    if cmd == "check":
        out = verify_manifest(sys.argv[2])
        dst = os.path.join(REPORTS, "audit-manifest-check.json")
        json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"-> {dst}")
    elif cmd == "static":
        pairs = load_pairs(sys.argv[2])
        n = next((int(a) for a in sys.argv[3:] if a.isdigit()), 0)
        sal_only = "--sal-only" in sys.argv
        r = static_diff(pairs, n, sal_only)
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
