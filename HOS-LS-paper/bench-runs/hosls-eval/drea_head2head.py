# -*- coding: utf-8 -*-
"""DREA 函数级基线 vs HOS-LS 头对头驱动（同数据同 API：RepoPairBench 10 样本子集 + deepseek-v4-flash）。
用法（cwd = drea/code）：python ../../hosls-eval/drea_head2head.py [limit]
"""
import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent  # bench-runs
HERE = BASE / "drea" / "code"
DATASET = BASE / "drea" / "data" / "repopairbench_100.jsonl"
PY = HERE / ".venv" / "Scripts" / "python.exe"
VULN10 = ["00c73b6e", "0294b9f1", "03e97308", "06fdf927", "08926a1a",
          "0a06f338", "0bb1aef8", "0c8d2aef", "0dc2e99d", "0f0215bf"]


def run_item(item_id, typ, timeout=320):
    cmd = [str(PY), "-u", "run_baseline.py", item_id,
           "--dataset-path", str(DATASET), "--type", typ,
           "--model", "deepseek-v4-flash", "--timeout", "280", "--max-retries", "1"]
    t0 = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                       encoding="utf-8", errors="replace", cwd=str(HERE))
    # 读最新日志（嵌套路径 logs-baseline/<proj>_<item>/<type>/<model>/<prompt>/<ts>.jsonl）
    verdict = None
    logdir = HERE / "logs-baseline"
    logs = sorted(logdir.rglob("*.jsonl"), key=lambda p: p.stat().st_mtime) if logdir.exists() else []
    if logs:
        latest = logs[-1]
        lines = [json.loads(l) for l in latest.read_text(encoding="utf-8").splitlines() if l.strip()]
        for entry in lines:
            if entry.get("role") == "assistant":
                content = entry.get("content")
                if isinstance(content, str):
                    verdict = content[-600:]
                elif isinstance(content, list):
                    verdict = str(content)[-600:]
                break
    return {"item": item_id, "type": typ, "exit": r.returncode,
            "secs": round(time.time() - t0, 1),
            "stdout_tail": (r.stdout or "")[-300:],
            "logfile": str(logs[-1].name) if logs else "",
            "verdict_tail": verdict}


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    results = []
    for item in VULN10[:limit]:
        for typ in ("vul", "sec"):
            res = run_item(item, typ)
            results.append(res)
            print(f"[drea] {item} {typ} exit={res['exit']} {res['secs']}s verdict={str(res['verdict_tail'])[-80:]!r}", flush=True)
    out = HERE.parent.parent / "hosls-eval" / "reports" / f"drea-baseline-{limit}.json"
    json.dump(results, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"[drea] -> {out}")


if __name__ == "__main__":
    main()
