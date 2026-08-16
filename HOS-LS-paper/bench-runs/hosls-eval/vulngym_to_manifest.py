"""vulngym_to_manifest.py — VulnGym entries.jsonl → 审计评测 manifest + 统计。

VulnGym（腾讯，arXiv 2608.02001）：408 条仓库级漏洞条目，源自 GitHub Advisory Database。
每条含：commit（fix commit）、critical_operation（sink file/line/code）、entry_point（source）、
trace（利用链）、verify、vuln_category_l1/l2、vuln_ids（CVE/GHSA）、repo_url。

转换规则：
- item_id = entry_id
- file_paths（ground truth）= critical_operation.file + entry_point.file + trace[].file（去重）
- sink_file = critical_operation.file（定位主目标）
- cwe_ids：L1 分类 → CWE 映射（业务逻辑类无单一 CWE，留空标记 semantic）
- fix_commit = commit；漏洞快照 = commit~1（DEP 双快照）

用法（cwd = bench-runs）：
  python hosls-eval/vulngym_to_manifest.py [--verify-only] [--max N]
"""
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VG = os.path.join(BASE, "framework-audit", "vulngym", "entries.jsonl")
OUT = os.path.join(BASE, "framework-audit", "manifest-vulngym.json")

# L1 分类 → CWE（中英双 key；业务逻辑/语义类无单一 CWE，置空）
L1_CWE = {
    "XSS": ["CWE-79"], "XSS（跨站脚本）": ["CWE-79"],
    "Command Injection": ["CWE-78"], "命令注入": ["CWE-78"],
    "Code Injection": ["CWE-94"], "代码注入": ["CWE-94"],
    "Deserialization": ["CWE-502"], "反序列化": ["CWE-502"], "反序列化漏洞": ["CWE-502"],
    "SSRF": ["CWE-918"],
    "Path Traversal": ["CWE-22"], "路径穿越": ["CWE-22"], "目录穿越": ["CWE-22"],
    "路径穿越 / 任意文件读取": ["CWE-22"], "路径穿越 / 沙箱逃逸": ["CWE-22"], "路径穿越 / 越权写入": ["CWE-22"],
    "SQL Injection": ["CWE-89"], "SQL注入": ["CWE-89"], "注入": ["CWE-89"], "注入攻击": ["CWE-89"],
    "模板注入": ["CWE-1336"], "注入与反序列化": ["CWE-94", "CWE-502"],
    "Authentication Bypass": ["CWE-287", "CWE-306"], "认证绕过": ["CWE-287", "CWE-306"],
    "Privilege Escalation": ["CWE-269"], "权限提升": ["CWE-269"],
    "Directory Traversal": ["CWE-22"],
    "File Upload": ["CWE-434"], "文件上传不安全": ["CWE-434"],
    "Open Redirect": ["CWE-601"],
    "XXE": ["CWE-611"],
    "CSRF": ["CWE-352"],
    "Information Disclosure": ["CWE-200"], "信息泄露": ["CWE-200"],
    "沙箱逃逸": ["CWE-250"], "越权文件读取": ["CWE-200"], "越权读取": ["CWE-200"],
    "越权写入": ["CWE-863"], "授权绕过": ["CWE-863"], "任意文件读取": ["CWE-22"],
    "原型污染": ["CWE-1321"], "响应欺骗": ["CWE-345"],
    "Business Logic": [], "业务逻辑": [],  # 语义类：SAL 无法锚定 sink，靠 AI 语义推理
}

LANG_EXT = {
    ".py": "python", ".js": "javascript", ".jsx": "javascript", ".ts": "typescript",
    ".tsx": "typescript", ".java": "java", ".go": "go", ".rb": "ruby",
    ".php": "php", ".c": "c", ".cpp": "cpp", ".cs": "csharp", ".svelte": "javascript",
    ".vue": "typescript", ".kt": "kotlin", ".rs": "rust",
}


def infer_lang(files):
    exts = Counter(Path(f).suffix.lower() for f in files if Path(f).suffix)
    for ext, cnt in exts.most_common():
        lang = LANG_EXT.get(ext)
        if lang:
            return lang
    return "unknown"


def main():
    verify_only = "--verify-only" in sys.argv
    max_n = 0
    if "--max" in sys.argv:
        max_n = int(sys.argv[sys.argv.index("--max") + 1])
    entries = [json.loads(l) for l in open(VG, encoding="utf-8") if l.strip()]
    print(f"total entries: {len(entries)}")
    print(f"verify=1: {sum(1 for e in entries if e.get('verify') == 1)}")
    print("L1 分布:", dict(Counter(e.get("vuln_category_l1", "?") for e in entries)))
    out = []
    kept = 0
    for e in entries:
        if verify_only and e.get("verify") != 1:
            continue
        commit = e.get("commit")
        if not commit:
            continue
        files = []
        for k in ("critical_operation", "entry_point"):
            v = e.get(k)
            if v and v.get("file"):
                files.append(v["file"])
        for t in e.get("trace") or []:
            if t.get("file"):
                files.append(t["file"])
        files = list(dict.fromkeys(files))  # 去重保序
        if not files:
            continue
        lang = infer_lang(files)
        l1 = e.get("vuln_category_l1", "")
        item = {
            "item_id": e.get("entry_id") or f"entry-{kept:05d}",
            "framework": e.get("project", "?"),
            "repo_url": e.get("repo_url", ""),
            "language": lang,
            "cve_ids": e.get("vuln_ids") or [],
            "cwe_ids": L1_CWE.get(l1, []),
            "description": e.get("vuln_title", ""),
            "fix_commit": commit,
            "file_paths": files,
            "sink_file": (e.get("critical_operation") or {}).get("file", files[0]),
            "sink_line": (e.get("critical_operation") or {}).get("line"),
            "vuln_category_l1": l1,
            "vuln_category_l2": e.get("vuln_category_l2", ""),
            "verify": e.get("verify"),
            "source_url": e.get("source_link", ""),
            "report_id": e.get("report_id", ""),
        }
        out.append(item)
        kept += 1
        if max_n and kept >= max_n:
            break
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"manifest: {len(out)} entries -> {OUT}")
    print("语言分布:", dict(Counter(i["language"] for i in out)))
    print("框架数:", len(set(i["framework"] for i in out)))
    # 多文件 ground truth 统计
    multi = sum(1 for i in out if len(i["file_paths"]) > 1)
    print(f"多文件 ground truth（sink+source+trace 去重>1）: {multi}/{len(out)}")


if __name__ == "__main__":
    main()
