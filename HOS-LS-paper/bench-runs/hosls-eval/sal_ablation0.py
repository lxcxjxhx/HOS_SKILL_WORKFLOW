"""SAL-A0 离线消融：CWE→sink 锚定信号可用性分析（零 API）。

对 RepoPairBench 100 对切片：manifest 的 cwe_ids → 内置 CWE→sink 正则表 → 在
vuln/patched 切片上统计锚定命中率与消失性（vuln 命中且 patched 消失 = 锚定差分信号）。

输出：reports/sal-ablation0-report.{json,md}

用法（cwd = bench-runs）：
  python hosls-eval/sal_ablation0.py
"""
import json
import os
import re
import time
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVAL = os.path.join(BASE, "hosls-eval")
VULN_DIR = os.path.join(EVAL, "vuln")
PATCHED_DIR = os.path.join(EVAL, "patched")
REPORTS = os.path.join(EVAL, "reports")
MANIFEST = os.path.join(BASE, "drea", "data", "repopairbench_100_manifest.json")

# CWE -> sink 模式（覆盖 manifest 主要 CWE 类别；每个模式给出锚定解释）
CWE_SINKS = {
    "CWE-22": [r"open\s*\(", r"send_file\s*\(", r"os\.path\.join", r"Path\s*\(", r"zipfile\s*\(", r"tarfile\s*\("],
    "CWE-23": [r"open\s*\(", r"os\.path\.join", r"Path\s*\("],
    "CWE-29": [r"open\s*\(", r"Path\s*\("],
    "CWE-78": [r"subprocess\s*\.", r"os\.system\s*\(", r"os\.popen\s*\(", r"Popen\s*\(", r"eval\s*\(", r"exec\s*\("],
    "CWE-77": [r"subprocess\s*\.", r"os\.system\s*\(", r"os\.popen\s*\(", r"Popen\s*\("],
    "CWE-88": [r"subprocess\s*\.", r"os\.system\s*\(", r"Popen\s*\("],
    "CWE-94": [r"eval\s*\(", r"exec\s*\(", r"pickle\.loads", r"yaml\.load\s*\([^)]*Loader\s*=\s*(\w+Loader)", r"__import__\s*\(", r"compile\s*\("],
    "CWE-95": [r"eval\s*\(", r"exec\s*\("],
    "CWE-502": [r"pickle\.loads", r"pickle\.load\s*\(", r"yaml\.load", r"json\.loads", r"marshal\.loads", r"joblib\.load", r"torch\.load"],
    "CWE-611": [r"parse\s*\(", r"fromstring\s*\(", r"iterparse\s*\(", r"ElementTree\.parse", r"lxml\.etree\.parse", r"resolve_entities"],
    "CWE-79": [r"render_template", r"format\s*\(", r"innerHTML", r"mark_safe", r"Response\s*\(", r"\.write\s*\("],
    "CWE-89": [r"execute\s*\(", r"cursor\s*\.", r"raw\s*\(.*sql", r"\.query\s*\(", r"format\s*\(.*(SELECT|INSERT|UPDATE|DELETE)"],
    "CWE-601": [r"redirect\s*\(", r"next\s*=|url\s*="],
    "CWE-918": [r"urlopen\s*\(", r"requests\.(get|post|put|request)\s*\(", r"http\.client", r"urllib"],
    "CWE-434": [r"save\s*\(", r"upload", r"filename"],
    "CWE-306": [r"@login_required", r"permission", r"is_authenticated", r"require_role", r"authorize"],
    "CWE-287": [r"authenticate", r"login", r"password", r"token"],
    "CWE-20": [r"int\s*\(", r"float\s*\(", r"len\s*\(", r"\[.*:.*\]", r"re\.(match|search|findall)", r"assert"],
    "CWE-400": [r"while\s+", r"for\s+", r"recurs", r"\.read\s*\(", r"max_", r"limit"],
    "CWE-200": [r"send_file", r"open\s*\(", r"read\s*\(", r"logging", r"print\s*\("],
    "CWE-209": [r"traceback", r"str\s*\(e\)", r"error\s*=", r"raise\s+"],
    "CWE-377": [r"mktemp", r"tempfile", r"open\s*\([^)]*['\"][wa]"],
    "CWE-1333": [r"re\.(match|search|findall|compile)", r"\.group\s*\("],
    "CWE-354": [r"hmac", r"compare_digest", r"=="],
    "CWE-369": [r"/\s*[a-zA-Z_]", r"div", r"zero"],
    "CWE-617": [r"assert", r"index\s*\[", r"\[-?\d"],
    "CWE-276": [r"chmod", r"open\s*\(", r"permissions"],
    "CWE-295": [r"ssl\._create_unverified_context", r"verify=False", r"cert_reqs"],
    "CWE-311": [r"password", r"api_key", r"token", r"secret"],
    "CWE-346": [r"Origin", r"Access-Control", r"CORS"],
    "CWE-425": [r"@login_required", r"is_authenticated", r"permission"],
    "CWE-706": [r"os\.path\.join", r"open\s*\(", r"filename"],
    "CWE-707": [r"escape", r"html\.escape", r"quote", r"sanitize"],
    "CWE-754": [r"except\s*:", r"try:", r"isinstance"],
    "CWE-770": [r"while\s+", r"\.read\s*\(", r"chunk"],
    "CWE-863": [r"@login_required", r"permission", r"is_authenticated", r"authorize"],
    "CWE-862": [r"@login_required", r"permission", r"is_authenticated", r"authorize"],
    "CWE-1336": [r"render_template", r"Template\s*\(", r"format\s*\(", r"f['\"]"],
}


def find_file(d, item_id):
    for f in sorted(Path(d).glob(f"{item_id}__*.py")):
        return str(f)
    return None


def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    rows = []
    stats = {"n": 0, "vuln_hit": 0, "patched_hit": 0, "vuln_only": 0,
             "both": 0, "neither": 0, "no_cwe_map": 0}
    for p in manifest:
        vid = p["item_id"]
        vf = find_file(VULN_DIR, vid)
        pf = find_file(PATCHED_DIR, vid)
        if not vf or not pf:
            continue
        cwes = [c for c in p.get("cwe_ids", []) if c in CWE_SINKS]
        stats["n"] += 1
        if not cwes:
            stats["no_cwe_map"] += 1
            rows.append({"item_id": vid, "cwes": p.get("cwe_ids", []),
                         "mapped": [], "vuln_hit": False, "patched_hit": False, "vuln_only": False})
            continue
        vtext = open(vf, encoding="utf-8", errors="replace").read()
        ptext = open(pf, encoding="utf-8", errors="replace").read()
        mapped = []
        vhit = False
        phit = False
        for cwe in cwes:
            for pat in CWE_SINKS[cwe]:
                r = re.compile(pat, re.IGNORECASE)
                hv = bool(r.search(vtext))
                hp = bool(r.search(ptext))
                if hv or hp:
                    mapped.append({"cwe": cwe, "pattern": pat, "vuln": hv, "patched": hp})
                vhit = vhit or hv
                phit = phit or hp
        stats["vuln_hit"] += 1 if vhit else 0
        stats["patched_hit"] += 1 if phit else 0
        if vhit and not phit:
            stats["vuln_only"] += 1
        if vhit and phit:
            stats["both"] += 1
        if not vhit and not phit:
            stats["neither"] += 1
        rows.append({"item_id": vid, "cwes": p.get("cwe_ids", []), "mapped": mapped,
                     "vuln_hit": vhit, "patched_hit": phit,
                     "vuln_only": vhit and not phit})
    n = stats["n"] or 1
    out = os.path.join(REPORTS, "sal-ablation0-report.json")
    json.dump({"meta": {"date": time.strftime("%Y-%m-%d %H:%M"), "api_calls": 0},
               "stats": stats, "rows": rows}, open(out, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    md = os.path.join(REPORTS, "sal-ablation0-report.md")
    with open(md, "w", encoding="utf-8") as f:
        f.write("# SAL-A0 离线消融：CWE→sink 锚定信号可用性（零 API）\n\n")
        f.write(f"> {time.strftime('%Y-%m-%d %H:%M')} · 样本 {stats['n']} 对\n\n")
        f.write("| 指标 | 值 | 占比 |\n|---|---|---|\n")
        f.write(f"| vuln 端锚定命中 | {stats['vuln_hit']} | {stats['vuln_hit']/n*100:.1f}% |\n")
        f.write(f"| patched 端锚定命中 | {stats['patched_hit']} | {stats['patched_hit']/n*100:.1f}% |\n")
        f.write(f"| **锚定差分信号（vuln 命中且 patched 消失）** | **{stats['vuln_only']}** | **{stats['vuln_only']/n*100:.1f}%** |\n")
        f.write(f"| 双侧命中（残留风险） | {stats['both']} | {stats['both']/n*100:.1f}% |\n")
        f.write(f"| 双侧不命中（需 AI） | {stats['neither']} | {stats['neither']/n*100:.1f}% |\n")
        f.write(f"| CWE 无映射 | {stats['no_cwe_map']} | {stats['no_cwe_map']/n*100:.1f}% |\n")
        f.write("\n> 解读：锚定差分信号比例 = SAL（sink 锚定定位）+ DEP（消失性判定）在静态层的可行性上限。\n")
    print(json.dumps(stats, ensure_ascii=False, indent=1))
    print(f"-> {out} / {md}")


if __name__ == "__main__":
    main()
