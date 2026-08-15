# 04 · A/B Benchmarker

**职责**：同一数据同一模型下对比 基线 vs 优化，输出可比数字。

**协议**：
1. 基线组与优化组用**同一批样本**（默认 10 个 vuln + 10 个 patched）。
2. 同一模型 deepseek-v4-flash，同一 `opt_eval.py`，仅配置不同（hos-ls.yaml vs hos-ls-opt.yaml）。
3. 缓存声明：记录缓存命中情况（`llm_cache_stats`）；prompt 改动会失效相关键——清缓存后重跑，禁止混用新旧结果。
4. 随机性：关键样本 3 次重跑，波动样本按并集口径标注。

**命令**：
```bash
python hosls-eval/opt_eval.py subset hos-ls.yaml vuln 10 3
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml vuln 10 3
python hosls-eval/opt_eval.py subset hos-ls.yaml patched 10 3
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml patched 10 3
```

**输出对比表**（写入台账/报告）：
| 组 | CONFIRMED/10 | 识别/10 | 误报(patched) | tokenΣ | 备注 |
|----|-------------|---------|---------------|--------|------|
| 基线 | | | | | |
| 优化 | | | | | |

**纪律**：不在 A/B 轮里同时改多个门；全量终测只跑合并后的采纳组合。
