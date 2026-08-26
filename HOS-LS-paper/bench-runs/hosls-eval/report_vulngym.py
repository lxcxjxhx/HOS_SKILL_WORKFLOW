"""report_vulngym.py — 汇总 VulnGym 仓库级 SAL-vs-baseline AI 扫描结果。

输入：reports/vulngym-ai-results.json（vulngym 子命令产物）
输出：定位率（SAL/baseline Locate@K）+ AI 检出（CONFIRMED 命中 GT 文件/行）+ 对照表
"""
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVAL = os.path.join(BASE, "hosls-eval")
REPORTS = os.path.join(EVAL, "reports")

CWE_KEYWORDS = {
    "78": ["command", "命令", "exec", "shell", "inject", "subprocess", "popen", "system(", "eval", "rce"],
    "22": ["path", "路径", "traversal", "directory", "穿越", "目录", "文件", "upload", "上传"],
    "89": ["sql", "注入", "query", "injection"],
    "79": ["xss", "dom", "innerhtml", "script", "跨站"],
    "94": ["code injection", "代码注入", "eval", "动态执行"],
    "918": ["ssrf", "request", "url", "服务端请求伪造"],
}


def main():
    p = os.path.join(REPORTS, "vulngym-ai-results.json")
    if not os.path.exists(p):
        print(f"[report-vulngym] {p} 不存在（vulngym 批次未完成）")
        return
    d = json.load(open(p, encoding="utf-8"))
    loc = d.get("localization", {})
    sal_l, base_l = loc.get("sal", {}), loc.get("baseline", {})
    scans = d.get("scans", {})

    print("=== 定位（静态，0 API）===")
    print(f"{'entry':14s} {'GT':22s} {'SAL_top3_hit':20s} {'base_top3_hit':20s}")
    for pid in sal_l:
        gt = ",".join(x.split("/")[-1] for x in sal_l[pid].get("gt", []))[:22]
        sh = ",".join(x.split("/")[-1] for x in sal_l[pid].get("sal_hit", []))[:20]
        bh = ",".join(x.split("/")[-1] for x in base_l.get(pid, {}).get("base_hit", []))[:20]
        print(f"{pid:14s} {gt:22s} {sh:20s} {bh:20s}")

    print()
    print("=== AI 检出（付费层）===")
    n_sal_conf, n_gt_hit, n_base_conf = 0, 0, 0
    n_sal_files = n_base_files = 0
    for pid, sc in sorted(scans.items()):
        for side in ("sal", "baseline"):
            for r in sc.get(side, []):
                conf = [f for f in r.get("findings", []) if f["status"] == "CONFIRMED"]
                fname = os.path.basename(r.get("file", ""))
                if side == "sal":
                    n_sal_files += 1
                    if conf:
                        n_sal_conf += 1
                    gt = set(sal_l.get(pid, {}).get("gt", []))
                    rel = r.get("file", "").replace("\\", "/")
                    hit = any(rel.endswith(g) for g in gt)
                    if conf and hit:
                        n_gt_hit += 1
                        print(f"  {pid} SAL GT-HIT: {fname} conf={len(conf)} rules="
                              + ";".join(f.get('rule','')[:30] for f in conf[:2]))
                    elif conf:
                        print(f"  {pid} SAL (非GT) conf: {fname} conf={len(conf)}")
                else:
                    n_base_files += 1
                    if conf:
                        n_base_conf += 1
    print(f"\nSAL 文件数={n_sal_files} 有CONFIRMED文件={n_sal_conf} GT命中且CONFIRMED={n_gt_hit}")
    print(f"baseline 文件数={n_base_files} 有CONFIRMED文件={n_base_conf}")

    n_entries = len(scans)
    sal_loc = sum(1 for pid in sal_l if sal_l[pid].get("sal_hit"))
    base_loc = sum(1 for pid in base_l if base_l[pid].get("base_hit"))
    print(f"\nLocate@K: SAL {sal_loc}/{len(sal_l)} | baseline {base_loc}/{len(base_l)}（{len(base_l)} 条做 baseline）")


if __name__ == "__main__":
    main()
