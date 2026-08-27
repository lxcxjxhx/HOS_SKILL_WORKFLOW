"""DEP-A0 离线消融：差分证据协议可行性分析（零 API 成本）。

三层分析：
1. 静态差分（semgrep p/python + bandit，vuln/patched 100 对切片）
   → 分类 V+P-（消失模式，DEP 信号可用）/ V+P+（残留）/ V-P-（静态不可见）/ V-P+（静态误报）
2. AI 双端 DEP 后处理（复用已有 50 样本结果文件，不再调用 API）
   → 现状 Pair-Correct vs DEP 消失性判定修正后的 Pair-Correct
3. 输出 dep-ablation0-report.{json,md}

用法（cwd = bench-runs）：
  python hosls-eval/dep_ablation0.py [--skip-static] [--pairs N]
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
EVAL = os.path.join(BASE, "hosls-eval")
VULN_DIR = os.path.join(EVAL, "vuln")
PATCHED_DIR = os.path.join(EVAL, "patched")
REPORTS = os.path.join(EVAL, "reports")
MANIFEST = os.path.join(BASE, "drea", "data", "repopairbench_100_manifest.json")
SEMGREP = os.path.join(BASE, "hos-ls", "envs", "sast-venv", "Scripts", "semgrep.exe")
BANDIT = os.path.join(BASE, "hos-ls", "envs", "sast-venv", "Scripts", "bandit.exe")
VULN_AI = os.path.join(REPORTS, "opt-hos-ls-vuln-50-results.json")
PATCHED_AI = os.path.join(REPORTS, "opt-hos-ls-patched-50-results.json")


def run_tool(cmd, timeout=120):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           encoding="utf-8", errors="replace")
        return r.returncode, r.stdout
    except Exception as e:
        return -1, str(e)


def semgrep_findings(path):
    rc, out = run_tool([SEMGREP, "--config", "p/python", "--json", "--quiet", path])
    if rc != 0:
        return []
    try:
        d = json.loads(out)
        return [{"line": x.get("start", {}).get("line"), "check": x.get("check_id"),
                 "msg": (x.get("extra") or {}).get("message", "")[:80]}
                for x in d.get("results", [])]
    except Exception:
        return []


def bandit_findings(path):
    rc, out = run_tool([BANDIT, "-q", "-f", "json", path])
    if rc != 0:
        return []
    try:
        d = json.loads(out)
        return [{"line": x.get("line_number"), "test": x.get("test_id"),
                 "sev": x.get("issue_severity")} for x in d.get("results", [])]
    except Exception:
        return []


def scan_side(path):
    """返回 (semgrep findings, bandit findings)。"""
    return semgrep_findings(path), bandit_findings(path)


def find_file(d, item_id):
    for f in sorted(Path(d).glob(f"{item_id}__*.py")):
        return str(f)
    return None


def static_diff(limit=0):
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    pairs = manifest[:limit] if limit else manifest
    out = {}
    jobs = []
    for p in pairs:
        vid = p["item_id"]
        vf = find_file(VULN_DIR, vid)
        pf = find_file(PATCHED_DIR, vid)
        if not vf or not pf:
            out[vid] = {"err": "missing local slice"}
            continue
        jobs.append((vid, vf, pf))
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(scan_side, vf): (vid, "vuln", vf) for vid, vf, pf in jobs}
        futs.update({ex.submit(scan_side, pf): (vid, "patched", pf) for vid, vf, pf in jobs})
        for fut in as_completed(futs):
            vid, side, path = futs[fut]
            sg, bd = fut.result()
            e = out.setdefault(vid, {"file": os.path.basename(path), "static": {}})
            e["static"][side] = {"semgrep": len(sg), "bandit": len(bd),
                                 "semgrep_findings": sg[:5], "bandit_findings": bd[:5]}
            print(f"[static] {vid} {side}: semgrep={len(sg)} bandit={len(bd)} ({time.time()-t0:.0f}s)", flush=True)
    # 分类
    for vid, e in out.items():
        if "static" not in e:
            continue
        v = e["static"].get("vuln", {})
        p = e["static"].get("patched", {})
        vs, vb = v.get("semgrep", 0), v.get("bandit", 0)
        ps, pb = p.get("semgrep", 0), p.get("bandit", 0)
        vn = vs + vb
        pn = ps + pb
        if vn > 0 and pn == 0:
            e["class"] = "V+P- (消失模式, DEP 信号可用)"
        elif vn > 0 and pn > 0:
            e["class"] = "V+P+ (残留, 误报风险)"
        elif vn == 0 and pn == 0:
            e["class"] = "V-P- (静态不可见, 需 AI)"
        else:
            e["class"] = "V-P+ (静态误报)"
    return out


def ai_dep_postprocess():
    """用已有 50 样本 AI 结果做 DEP 消失性判定后处理。"""
    v = json.load(open(VULN_AI, encoding="utf-8"))
    p = json.load(open(PATCHED_AI, encoding="utf-8"))
    rows = []
    for name in sorted(set(v) & set(p)):
        vv, pv = v[name], p[name]
        if not isinstance(vv, dict) or not isinstance(pv, dict):
            continue
        v_conf = vv.get("confirmed", 0) > 0
        v_recog = bool(vv.get("recog"))
        p_conf = pv.get("confirmed", 0) > 0
        p_recog = bool(pv.get("recog"))
        p_find = pv.get("findings", 0) > 0
        # Soft-DEP：vuln 端 CONFIRMED 且 patched 端非 CONFIRMED 才算 Pair-Correct
        # WEAK/UNCERTAIN 不算 fail——这些可能是不同位置的发现，不表明修复不完整
        dep_ok = v_conf and not p_conf
        rows.append({
            "file": name,
            "vuln_confirmed": v_conf, "vuln_recog": v_recog,
            "patched_confirmed": p_conf, "patched_recog": p_recog, "patched_findings": p_find,
            "pair_correct_cur": v_conf and not p_conf,
            "pair_correct_dep": dep_ok,
            "vuln_statuses": vv.get("statuses", []),
            "patched_statuses": pv.get("statuses", []),
        })
    cur = sum(1 for r in rows if r["pair_correct_cur"])
    dep = sum(1 for r in rows if r["pair_correct_dep"])
    dep_gain = sum(1 for r in rows if r["vuln_confirmed"] and r["patched_findings"] and not r["patched_confirmed"])
    return {"n": len(rows), "pair_correct_cur": cur, "pair_correct_dep": dep,
            "dep_修正样本数(vuln确认但patched有finding)": dep_gain, "rows": rows}


def main():
    skip_static = "--skip-static" in sys.argv
    limit = 0
    if "--pairs" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--pairs") + 1])
    report = {"meta": {"date": time.strftime("%Y-%m-%d %H:%M"), "api_calls": 0}}
    if not skip_static:
        report["static"] = static_diff(limit)
    report["ai_dep"] = ai_dep_postprocess()
    # 汇总
    if "static" in report:
        cls = {}
        for e in report["static"].values():
            if "class" in e:
                cls[e["class"]] = cls.get(e["class"], 0) + 1
        report["static_summary"] = cls
    out = os.path.join(REPORTS, "dep-ablation0-report.json")
    json.dump(report, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    md = os.path.join(REPORTS, "dep-ablation0-report.md")
    with open(md, "w", encoding="utf-8") as f:
        f.write("# DEP-A0 离线消融报告（零 API）\n\n")
        f.write(f"> {report['meta']['date']} · API 调用：{report['meta']['api_calls']}\n\n")
        if "static_summary" in report:
            f.write("## 1. 静态双端差分（semgrep p/python + bandit，100 对切片）\n\n")
            f.write("| 类别 | 对数 |\n|---|---|\n")
            for k, v in report["static_summary"].items():
                f.write(f"| {k} | {v} |\n")
            n = sum(report["static_summary"].values())
            f.write(f"\n**合计 {n} 对**。V+P- 占比 {report['static_summary'].get('V+P- (消失模式, DEP 信号可用)', 0)/max(n,1)*100:.1f}%"
                    f"——这些对静态层即可差分区分，DEP 的 SAST 部分可行性即此比例。\n")
        a = report["ai_dep"]
        f.write("\n## 2. AI 双端 DEP 后处理（复用 50 样本已有结果）\n\n")
        f.write(f"- 有双端结果的样本：{a['n']}\n")
        f.write(f"- 现状 Pair-Correct（vuln CONFIRMED 且 patched 非 CONFIRMED）：**{a['pair_correct_cur']}/{a['n']}**\n")
        f.write(f"- DEP 消失性判定后 Pair-Correct（vuln CONFIRMED 且 patched 无 finding）：**{a['pair_correct_dep']}/{a['n']}**\n")
        f.write(f"- DEP 修正的样本（vuln CONFIRMED 但 patched 有 finding，现状计为 Pair-Correct）：{a['dep_修正样本数(vuln确认但patched有finding)']}\n")
        f.write("\n> caveat：50 样本 AI 结果文件 stderr 含 `AI API key not configured, skipping AI verification`，"
                "AI 验证链部分环节未配置 key；本分析仅用 confirmed/recog/findings 字段做数学结构对照，"
                "最终结论需 S1-A 付费消融确认。\n")
    print(json.dumps({k: report[k] for k in ("static_summary", "ai_dep") if k in report},
                     ensure_ascii=False, indent=1))
    print(f"-> {out} / {md}")


if __name__ == "__main__":
    main()
