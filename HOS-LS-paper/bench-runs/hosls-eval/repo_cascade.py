"""仓库级三级 cascade 实测（token 节省主场的证明）。

对 repo-eval/ 下已 clone 的项目（octoprint/kiwi/calibre-web），按 manifest 取 fix commit，
git worktree 检出漏洞父 commit → CodeQL 建库+安全套件分析 → 判断每个目标文件是否
被 CodeQL 确认（→ 硬检出，免 AI）还是盲区（→ 需 AI）。

用法（cwd = bench-runs，完整权限下运行）：
  python hosls-eval/repo_cascade.py
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
CQ = os.path.join(HOSLS, "envs", "codeql", "codeql.exe")
PACKS = os.path.join(HOSLS, "envs", "codeql-packs")
SUITE = os.path.join(PACKS, "codeql", "python-queries", "1.8.8",
                     "codeql-suites", "python-code-scanning.qls")
# 注意：硬层必须用 code-scanning（security-only）；security-and-quality 混入质量类查询
# （mixed-returns/empty-except 等），会把非漏洞文件误判为硬检出。
PROJECTS = {"octoprint": "octoprint", "kiwi": "kiwi", "calibre-web": "calibre-web"}


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.returncode, r.stdout.strip(), r.stderr.strip()


def ensure_commit(repo, sha):
    rc, *_ = git(repo, "cat-file", "-t", sha)
    if rc == 0:
        # 确认父 commit 可用（浅克隆需 depth 2）
        rc2, *_ = git(repo, "cat-file", "-t", sha + "~1")
        if rc2 == 0:
            return True
        rc, _, _ = git(repo, "fetch", "--depth", "2", "origin", sha)
        return rc == 0
    rc, _, _ = git(repo, "fetch", "--depth", "2", "origin", sha)
    return rc == 0


def rm_tree_force(path):
    """删除残留 worktree（含 .codeql-db 深层路径，处理 Windows 长路径）。"""
    if not os.path.exists(path):
        return
    try:
        import shutil
        shutil.rmtree("\\\\?\\" + os.path.abspath(path), ignore_errors=True)
    except Exception:
        pass
    try:
        import subprocess as sp
        sp.run(["cmd", "/c", "rmdir", "/s", "/q", os.path.abspath(path)],
               capture_output=True, timeout=60)
    except Exception:
        pass


def codeql_analyze(repo_root):
    db = os.path.join(repo_root, ".codeql-db")
    r = subprocess.run([CQ, "database", "create", db, "--language=python",
                        f"--source-root={repo_root}", "--overwrite"],
                       capture_output=True, text=True, timeout=1800,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        return {"ok": False, "note": "create: " + r.stderr[-200:]}
    sarif = os.path.join(repo_root, ".codeql-results.sarif")
    r = subprocess.run([CQ, "database", "analyze", db, "--format=sarif-latest",
                        f"--output={sarif}", "--search-path", PACKS, SUITE],
                       capture_output=True, text=True, timeout=1800,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0 or not os.path.exists(sarif):
        return {"ok": False, "note": "analyze: " + r.stderr[-200:]}
    data = json.load(open(sarif, encoding="utf-8"))
    hits = []
    for run in data.get("runs", []):
        for res in run.get("results", []):
            loc = ((res.get("locations") or [{}])[0].get("physicalLocation") or {})
            uri = str(loc.get("artifactLocation", {}).get("uri", "")).replace("file://", "")
            hits.append({"file": uri, "rule": str(res.get("ruleId", "")),
                         "line": int((loc.get("region") or {}).get("startLine", 0) or 0),
                         "msg": str((res.get("message") or {}).get("text", ""))[:120]})
    return {"ok": True, "hits": hits, "note": f"codeql 命中 {len(hits)} 条"}


def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    pairs = [p for p in manifest if p.get("project_name") in PROJECTS]
    results = {}
    t0 = time.time()
    for p in pairs:
        pid = p["item_id"]
        proj = p["project_name"]
        repo = os.path.join(REPO_EVAL, PROJECTS[proj])
        m = re.search(r"/commit/([0-9a-f]{40})", p.get("commit_url", ""))
        if not m:
            results[pid] = {"ok": False, "err": "no commit url"}
            continue
        fix = m.group(1)
        if not ensure_commit(repo, fix):
            results[pid] = {"ok": False, "err": "commit unavailable"}
            continue
        wt = os.path.join(REPO_EVAL, f"_casc-{pid}")
        rm_tree_force(wt)
        rc, _, err = git(repo, "worktree", "add", "--detach", wt, fix + "~1")
        if rc != 0:
            results[pid] = {"ok": False, "err": err[:160]}
            continue
        target = os.path.join(wt, p.get("file_path", ""))
        cq = codeql_analyze(wt)
        target_hits = []
        if cq.get("ok"):
            rel_target = str(Path(p.get("file_path", "")).as_posix())
            for h in cq["hits"]:
                hf = h["file"].replace("\\", "/")
                if hf.endswith(rel_target) or rel_target.endswith(hf):
                    target_hits.append(h)
        results[pid] = {
            "project": proj, "cve": p.get("cve_ids", []),
            "file": p.get("file_path", ""),
            "codeql_ok": cq.get("ok", False),
            "codeql_target_hits": target_hits,
            "codeql_note": cq.get("note", ""),
            "target_exists": os.path.exists(target),
        }
        git(repo, "worktree", "remove", "--force", wt)
        rm_tree_force(wt)
        print(f"[casc] {pid} {proj} target={str(p.get('file_path'))[-36:]} "
              f"codeql确认={len(target_hits)} ({time.time()-t0:.0f}s)", flush=True)
    out = os.path.join(REPORTS, "repo-cascade.json")
    json.dump(results, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    hard = [k for k, v in results.items() if v.get("codeql_target_hits")]
    ai = [k for k, v in results.items() if not v.get("codeql_target_hits")]
    print(f"[casc] 共 {len(results)} pairs | CodeQL 硬确认 {len(hard)}（免 AI）{hard} | 盲区需 AI {len(ai)} {ai}")
    print(f"[casc] -> {out}")


if __name__ == "__main__":
    main()
