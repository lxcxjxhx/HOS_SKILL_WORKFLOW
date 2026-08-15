"""仓库级评测（对齐 DREA RepoPairBench 设定）— 用 git worktree 检出漏洞父 commit。

对 repo-eval/ 下已 clone 的项目（octoprint/kiwi/calibre-web），从 manifest 取 fix commit，
checkout 其父 commit（漏洞状态），对目标文件整文件扫描（保留仓库上下文 → CPG 注入生效）。

用法（cwd = bench-runs）：
  python hosls-eval/repo_scan.py <config> [pairs_上限]
"""
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOSLS = os.path.join(BASE, "hos-ls")
EVAL = os.path.join(BASE, "hosls-eval")
REPO_EVAL = os.path.join(BASE, "repo-eval")
MANIFEST = os.path.join(BASE, "drea", "data", "repopairbench_100_manifest.json")
REPORTS = os.path.join(EVAL, "reports")

# manifest 项目名 -> 本地 clone 目录名
PROJECTS = {"octoprint": "octoprint", "kiwi": "kiwi", "calibre-web": "calibre-web"}


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.returncode, r.stdout.strip(), r.stderr.strip()


def ensure_commit(repo, fix_sha):
    rc, out, err = git(repo, "cat-file", "-t", fix_sha)
    if rc == 0:
        return True
    # 浅克隆补取
    rc, out, err = git(repo, "fetch", "--depth", "1", "origin", fix_sha)
    return rc == 0


def scan_file(cfg, path, timeout=600):
    out = os.path.join(REPORTS, "_repo_tmp", os.path.basename(path) + f".{int(time.time())%100000}.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    try:
        r = subprocess.run(
            [sys.executable, "-m", "src.cli.main", "-c", cfg, "scan", path,
             "--pure-ai", "--format", "json", "--output", out],
            input="n\n", text=True, capture_output=True, timeout=timeout, cwd=HOSLS,
            encoding="utf-8", errors="replace",
        )
        if os.path.exists(out):
            d = json.load(open(out, encoding="utf-8"))
            fs = [f for rr in d.get("results", []) for f in rr.get("findings", [])]
            statuses = [str(f.get("status", "")).upper() for f in fs]
            sevs = [str(f.get("severity", "")).lower() for f in fs]
            confirmed = sum(1 for s in statuses if s == "CONFIRMED")
            recog = 1 if (confirmed > 0 or any(s in ("high", "critical") for s in sevs)) else 0
            tokens = 0
            for rr in d.get("results", []):
                for line in rr.get("debug_logs") or []:
                    m = re.search(r"(?:令牌使用|Token usage)[:：]\s*([\d,]+)", str(line))
                    if m:
                        tokens += int(m.group(1).replace(",", ""))
            return {"ok": True, "findings": len(fs), "confirmed": confirmed, "recog": recog, "tokens": tokens}
        return {"ok": False, "err": "no output"}
    except Exception as e:
        return {"ok": False, "err": str(e)[:120]}


def main():
    cfg = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 99
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    pairs = [p for p in manifest if p.get("project_name") in PROJECTS][:limit]
    results = {}
    t0 = time.time()
    for p in pairs:
        pid = p["item_id"]
        proj = p["project_name"]
        repo = os.path.join(REPO_EVAL, PROJECTS[proj])
        fix_url = p.get("commit_url", "")
        m = re.search(r"/commit/([0-9a-f]{40})", fix_url)
        if not m:
            results[pid] = {"ok": False, "err": "no fix commit url"}
            continue
        fix = m.group(1)
        if not ensure_commit(repo, fix):
            results[pid] = {"ok": False, "err": "fix commit unavailable"}
            continue
        wt = os.path.join(REPO_EVAL, f"_wt-{pid}")
        rc, out, err = git(repo, "worktree", "add", "--detach", wt, fix + "~1")
        if rc != 0:
            results[pid] = {"ok": False, "err": err[:120]}
            continue
        target = os.path.join(wt, p.get("file_path", ""))
        if os.path.exists(target):
            r = scan_file(cfg, target)
            r["cve"] = p.get("cve_ids", [])
            r["cwe"] = p.get("cwe_ids", [])
            r["file"] = p.get("file_path", "")
            results[pid] = r
        else:
            results[pid] = {"ok": False, "err": "target file missing in worktree"}
        git(repo, "worktree", "remove", "--force", wt)
        print(f"[repo] {pid} {proj} {str(p.get('file_path'))[-40:]}: confirmed={results[pid].get('confirmed', '?')} ({time.time()-t0:.0f}s)", flush=True)
    out = os.path.join(REPORTS, f"repo-{Path(cfg).stem}.json")
    json.dump(results, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = [r for r in results.values() if r.get("ok")]
    conf = sum(1 for r in ok if r.get("confirmed", 0) > 0)
    recog = sum(1 for r in ok if r.get("recog"))
    print(f"[repo] {len(ok)} pairs: CONFIRMED {conf} ({conf/max(len(ok),1)*100:.1f}%) | 识别 {recog} ({recog/max(len(ok),1)*100:.1f}%) | -> {out}")


if __name__ == "__main__":
    main()
