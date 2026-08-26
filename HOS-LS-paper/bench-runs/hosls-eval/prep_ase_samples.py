"""prep_ase_samples.py — 从 A.S.E 数据集提取可扫描样本（清理行号前缀，产出代码文件 + manifest）。

A.S.E（AI Security Evaluation）实例 = 真实 AI 生成/变异代码：
- ase_with_vuln_code.json：27 条，vuln_code 为带行号前缀的漏洞代码摘录
- ase_with_diffs.json：6 条，vuln_content 为 base_commit 处的完整漏洞文件内容
输出：
- ase_samples/<instance_id>.<ext>         干净代码文件
- ase_samples/manifest.json               样本元数据（CWE、语言、vuln_lines、task_desc）
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # bench-runs
DATASETS = os.path.join(BASE, "hos-ls", "bench-runs", "datasets")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ase_samples")

EXT = {"php": ".php", "python": ".py", "javascript": ".js", "typescript": ".ts", "java": ".java", "go": ".go"}

LINE_PREFIX = re.compile(r"^\s*\d{1,5}\s+(?=\S)", re.M)

GITHUB_TOKEN = os.environ.get("HOSLS_GITHUB_TOKEN", "")


def fetch_full_file(repo, path, commit):
    """经代理拉取 base_commit 处的完整文件（GitHub contents API，raw Accept）。失败返回 None。"""
    if not GITHUB_TOKEN:
        return None
    import requests
    import urllib3
    urllib3.disable_warnings()
    r = requests.get(f"https://api.github.com/repos/{repo}/contents/{path}",
                     params={"ref": commit},
                     headers={"Authorization": f"Bearer {GITHUB_TOKEN}",
                              "Accept": "application/vnd.github.raw",
                              "User-Agent": "hosls-eval"},
                     verify=False, timeout=90)
    if r.status_code == 200:
        return r.text
    print(f"[prep] fetch {repo} {path}@{commit[:8]} -> HTTP {r.status_code}")
    return None


def strip_line_numbers(code: str) -> str:
    """去掉每行开头的行号前缀（' 218     \tif(...)' -> '\tif(...)'）。"""
    return LINE_PREFIX.sub("", code)


def main():
    os.makedirs(OUT, exist_ok=True)
    vuln = json.load(open(os.path.join(DATASETS, "ase_with_vuln_code.json"), encoding="utf-8-sig"))
    diffs = {x["instance_id"]: x for x in json.load(open(os.path.join(DATASETS, "ase_with_diffs.json"), encoding="utf-8-sig"))}

    manifest = []
    for x in vuln:
        iid = x["instance_id"]
        ext = EXT.get(x.get("language", "php"), ".php")
        code, src = None, ""
        if iid in diffs and diffs[iid].get("base_commit"):
            full = fetch_full_file(x.get("repo", ""), x.get("vuln_file", ""), diffs[iid]["base_commit"])
            if full and len(full) > 200:
                code, src = full, "full@commit"
        if code is None:
            code = strip_line_numbers(x.get("vuln_code", ""))
            src = "excerpt"
        code = code.strip()
        fp = os.path.join(OUT, iid + ext)
        with open(fp, "w", encoding="utf-8") as f:
            f.write(code)
        manifest.append({
            "instance_id": iid,
            "repo": x.get("repo", ""),
            "vuln_file": x.get("vuln_file", ""),
            "vuln_lines": x.get("vuln_lines", []),
            "language": x.get("language", "php"),
            "vuln_type": x.get("vuln_type", ""),
            "cwe_id": x.get("cwe_id", ""),
            "source": src,
            "code_file": iid + ext,
            "lines": code.count("\n") + 1,
            "task_desc": diffs[iid].get("task_desc", "") if iid in diffs else "",
            "base_commit": diffs[iid].get("base_commit", "") if iid in diffs else "",
        })
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"[prep] {len(manifest)} samples -> {OUT}")
    for m in manifest:
        print(f"  {m['instance_id']:35s} {m['language']:8s} {m['cwe_id']:8s} src={m['source']:18s} lines={m['lines']}")


if __name__ == "__main__":
    main()
