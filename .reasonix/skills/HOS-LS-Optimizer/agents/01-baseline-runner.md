# 01 · Baseline Runner

**职责**：用同协议重测锁定基线，防止环境漂移（模型波动/缓存状态/数据变更）。

**执行**：
1. 检查评测集完整性：`bench-runs/drea/data/repopairbench_100.jsonl`（100 行）、`hosls-eval/vuln|patched/`（各 100 文件）。
2. 确认配置：`hos-ls.yaml`（基线）与 `hos-ls-opt.yaml`（优化）差异仅限目标门。
3. 冒烟：`python hosls-eval/opt_eval.py smoke <config> <file>` — 无报错再批量。
4. 子集：`python hosls-eval/opt_eval.py subset <config> vuln 10 3`（+patched 同法）。
5. 台账：`python hosls-eval/opt_eval.py ledger <results.json> <tag>`。

**产物**：基线 JSON + 台账行。基线数字 = 后续所有 A/B 的参照系。

**纪律**：基线跑完后不得改动评测集/协议/模型；任何环境变化（NVD db、缓存清理）记录在台账。
