# -*- coding: utf-8 -*-
"""提取 DREA 基线判定并汇总（verdict 提取器）。"""
import glob
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # bench-runs
LOGS = os.path.join(BASE, "drea", "code", "logs-baseline")


def main():
    files = glob.glob(os.path.join(LOGS, "**", "*.jsonl"), recursive=True)
    res = {}
    for f in files:
        parts = f.replace("\\", "/").split("/")
        # .../logs-baseline/<proj>_<item>/<type>/<model>/<prompt>/<ts>.jsonl
        try:
            item = parts[-5]
            typ = parts[-4]
        except IndexError:
            continue
        for line in open(f, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
            except Exception:
                continue
            if e.get("role") == "assistant":
                c = str(e.get("content"))
                m = re.search(r"<security_assessment>\s*(\w+)\s*</security_assessment>", c)
                v = m.group(1) if m else "?"
                res.setdefault(item, {})[typ] = v
                break
    for k in sorted(res):
        print(k, "| vul:", res[k].get("vul", "-"), "| sec:", res[k].get("sec", "-"))
    print("total items:", len(res))


if __name__ == "__main__":
    main()
