"""HOS-LS 优化评测统一入口（Phase B 基建）。

统一口径（与 10-RepoPairBench评测数据-HOS-LS.md / 论文 §4 一致）：
- 检出（CONFIRMED 口径）：顶层 finding status == CONFIRMED
- 检出（识别口径）：CONFIRMED 或 high/critical finding
- 误报（patched 端）：patched 文件仍有 finding
- token：results[].token_records 聚合（每 Agent 记录）

用法（cwd = bench-runs，config 相对 hos-ls 克隆）：
  python hosls-eval/opt_eval.py smoke <config> <file>            # 单文件冒烟
  python hosls-eval/opt_eval.py subset <config> <mode> <N> [workers]   # mode=vuln|patched
  python hosls-eval/opt_eval.py full <config> <mode> [workers]   # 全量 100
  python hosls-eval/opt_eval.py summary <results.json>           # 聚合统计
  python hosls-eval/opt_eval.py ledger <results.json> <tag>      # 追加台账
"""
import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # bench-runs
HOSLS = os.path.join(BASE, "hos-ls")
EVAL = os.path.join(BASE, "hosls-eval")
VULN_DIR = os.path.join(EVAL, "vuln")
PATCHED_DIR = os.path.join(EVAL, "patched")
REPORTS = os.path.join(EVAL, "reports")
LEDGER = os.path.join(EVAL, "opt-ledger.md")
VULN10 = ["00c73b6e__networking.py", "0294b9f1__svg.py", "03e97308__views.py",
          "06fdf927__models.py", "08926a1a__shared_func.py", "0a06f338__authentication.py",
          "0bb1aef8__quantization_ops_test.py", "0c8d2aef__connector_registry_service.py",
          "0dc2e99d__filtering.py", "0f0215bf__helper.py"]


def findings_of(d):
    out = []
    for r in d.get("results") or []:
        out.extend(r.get("findings") or [])
    return out


def tokens_of(d):
    """从 debug_logs 聚合每 Agent token（'令牌使用: NNNN'），兼顾 token_records dict。"""
    import re
    total = 0
    for r in d.get("results") or []:
        for rec in r.get("token_records") or []:
            if isinstance(rec, dict):
                total += rec.get("total_tokens", 0) or 0
        for line in r.get("debug_logs") or []:
            m = re.search(r"(?:令牌使用|Token usage)[:：]\s*([\d,]+)", str(line))
            if m:
                total += int(m.group(1).replace(",", ""))
    return total


def scan_one(cfg, path, timeout=600):
    out = os.path.join(REPORTS, "_opt_tmp", os.path.basename(path) + f".{int(time.time())%100000}.json")
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
            fs = findings_of(d)
            statuses = [str(f.get("status", "")).upper() for f in fs]
            sevs = [str(f.get("severity", "")).lower() for f in fs]
            confirmed = sum(1 for s in statuses if s == "CONFIRMED")
            recog = 1 if (confirmed > 0 or any(s in ("high", "critical") for s in sevs)) else 0
            return {
                "ok": True, "findings": len(fs), "confirmed": confirmed, "recog": recog,
                "statuses": statuses, "severities": sevs,
                "tokens": tokens_of(d), "stderr": (r.stderr or "")[-200:],
            }
        return {"ok": False, "err": "no output", "stderr": (r.stderr or "")[-200:]}
    except Exception as e:
        return {"ok": False, "err": str(e)[:120]}


def run_batch(cfg, mode, limit, workers, tag):
    d = VULN_DIR if mode == "vuln" else PATCHED_DIR
    files = sorted(Path(d).glob("*.py"))
    if limit:
        files = files[:limit]
    jobs = [(cfg, str(f)) for f in files]
    results = {}
    t0 = time.time()
    # 线程并发（子进程 I/O 等待期不占 GIL）；沙箱下禁用 multiprocessing 命名管道
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(scan_one, *j): j[1] for j in jobs}
        for i, fut in enumerate(as_completed(futs), 1):
            name = Path(futs[fut]).name
            results[name] = fut.result()
            c = results[name].get("confirmed", "?")
            print(f"  [{tag}] {i}/{len(files)} {name[:28]}: confirmed={c} ({time.time()-t0:.0f}s)", flush=True)
    out = os.path.join(REPORTS, f"{tag}-results.json")
    json.dump(results, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print_summary(results, f"{mode}@{cfg} (n={len(results)})", tag)
    return out


def print_summary(results, label, tag=None):
    ok = [r for r in results.values() if r.get("ok")]
    n = len(ok) or 1
    conf = sum(1 for r in ok if r.get("confirmed", 0) > 0)
    recog = sum(1 for r in ok if r.get("recog"))
    anyf = sum(1 for r in ok if r.get("findings", 0) > 0)
    toks = sum(r.get("tokens", 0) for r in ok)
    print(f"[{tag or label}] {label}: CONFIRMED {conf}/{len(ok)} ({conf/n*100:.1f}%) | 识别 {recog}/{len(ok)} | 有finding {anyf} | token Σ{toks}")


def main():
    cmd = sys.argv[1]
    if cmd == "smoke":
        cfg, path = sys.argv[2], sys.argv[3]
        r = scan_one(cfg, path)
        print(json.dumps(r, ensure_ascii=False, indent=1))
    elif cmd == "subset":
        cfg, mode, n = sys.argv[2], sys.argv[3], int(sys.argv[4])
        workers = int(sys.argv[5]) if len(sys.argv) > 5 else 3
        tag = f"opt-{Path(cfg).stem}-{mode}-{n}"
        run_batch(cfg, mode, n, workers, tag)
    elif cmd == "full":
        cfg, mode = sys.argv[2], sys.argv[3]
        workers = int(sys.argv[4]) if len(sys.argv) > 4 else 4
        tag = f"opt-{Path(cfg).stem}-{mode}-full"
        run_batch(cfg, mode, 0, workers, tag)
    elif cmd == "summary":
        d = json.load(open(sys.argv[2], encoding="utf-8"))
        print_summary(d, sys.argv[2])
    elif cmd == "static-gate":
        """静态门控经济账（零 API 成本，用已有产物算）：
        python opt_eval.py static-gate <static_results.json> <ai_results.json>
        输出：静态命中/0召回、硬门控 AI 层 token 节省率、AI-CONFIRMED 但静态 0 召回（硬门控会丢的真阳性）。"""
        static = json.load(open(sys.argv[2], encoding="utf-8"))
        ai = json.load(open(sys.argv[3], encoding="utf-8"))
        s_ok = {k: v for k, v in static.items() if v.get("ok")}
        flagged = {k for k, v in s_ok.items() if v.get("findings", 0) > 0}
        miss = set(s_ok) - flagged
        ai_conf = {k for k, v in ai.items() if isinstance(v, dict) and v.get("confirmed", 0) > 0}
        a_ok = {k: v for k, v in ai.items() if isinstance(v, dict) and v.get("ok", True)}
        toks = sum(v.get("tokens", 0) for v in a_ok.values())
        gate_toks = sum(v.get("tokens", 0) for k, v in a_ok.items() if k in flagged)
        save = (1 - gate_toks / toks) * 100 if toks else 0
        lost = sorted(ai_conf & miss)
        print(f"静态命中: {len(flagged)}/{len(s_ok)} | 静态0召回: {len(miss)}")
        print(f"AI 层 token 合计: {toks:,} | 硬门控后: {gate_toks:,} | 节省 {save:.1f}%")
        print(f"AI-CONFIRMED 但静态0召回（硬门控会丢的真阳性）: {len(lost)} {lost}")
    elif cmd == "cascade":
        """三级 cascade 分层测量（S1 semgrep/bandit + S2 codeql → AI 盲区划分，0 AI token）：
        python opt_eval.py cascade <dir> <out.json>
        产出：按文件三层命中表 + hard_files（codeql 确认，免 AI）+ ai_files（需 AI）。"""
        import sys as _s
        _s.path.insert(0, os.path.join(BASE, "hos-ls"))
        from src.analyzers.sast_prefilter import SastPrefilter

        src = sys.argv[2]
        out = os.path.join(REPORTS, sys.argv[3] if len(sys.argv) > 3 else "cascade-report.json")
        files = sorted(str(f) for f in Path(src).rglob("*.py"))
        sast = SastPrefilter({"enabled": True, "mode": "cascade",
                              "codeql_pack_dir": os.path.join(BASE, "hos-ls", "envs", "codeql-packs"),
                              "semgrep_rules_dir": os.path.join(BASE, "hos-ls", "envs", "semgrep-rules", "python")})
        c = sast.cascade(src, files)
        s1 = {k: len(v) for k, v in c["s1_by_file"].items()}
        s2 = {k: len(v) for k, v in c["s2_by_file"].items()}
        print(f"[cascade] 文件 {len(files)} | S1 命中 {len(s1)} | S2 codeql 确认 {len(c['hard_files'])} | AI 盲区 {len(c['ai_files'])}")
        print("[cascade] 硬检出（免 AI）:", c["hard_files"][:10])
        json.dump({"files": files, "s1_by_file": s1, "s2_by_file": s2,
                   "hard_files": c["hard_files"], "ai_files": c["ai_files"], "note": c["note"]},
                  open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"[cascade] -> {out}")
    elif cmd == "ledger":
        d = json.load(open(sys.argv[2], encoding="utf-8"))
        tag = sys.argv[3]
        ok = [r for r in d.values() if r.get("ok")]
        conf = sum(1 for r in ok if r.get("confirmed", 0) > 0)
        recog = sum(1 for r in ok if r.get("recog"))
        toks = sum(r.get("tokens", 0) for r in ok)
        line = (f"| {tag} | {len(ok)} | {conf} ({conf/len(ok)*100:.1f}%) | "
                f"{recog} ({recog/len(ok)*100:.1f}%) | {toks:,} | {time.strftime('%Y-%m-%d %H:%M')} |\n")
        if not os.path.exists(LEDGER):
            open(LEDGER, "w", encoding="utf-8").write(
                "# HOS-LS 优化台账\n\n| 标签 | n | CONFIRMED | 识别 | tokenΣ | 时间 |\n|---|---|---|---|---|---|\n")
        with open(LEDGER, "a", encoding="utf-8") as f:
            f.write(line)
        print("台账已更新:", line.strip())
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
