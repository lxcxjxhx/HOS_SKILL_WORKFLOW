# per-fix 工作流（单次优化）

> 一次"假设 → 验证 → 采纳/排除"循环的编排说明。给执行 agent 的路线图。

## 流程

```
[1] Baseline Runner   跑子集基线（10 vuln + 10 patched）→ 台账
[2] Root-Cause Diagnoser  对低检出/高误报样本做 Agent 级信号链诊断
[3] Fix Designer      选单变量修复（配置门开关 + 代码/prompt 改动）→ 提交
[4] A/B Benchmarker   同协议跑 优化组（+基线组若有漂移）→ 对比表
[5] Result Gater      门控裁决：采纳 / 排除（记录理由）
[6] （采纳后）全量终测 → Paper Updater 候选池
```

## 每轮固定产物

1. 台账行（`opt-ledger.md`）：标签 / n / CONFIRMED / 识别 / tokenΣ / 时间
2. 排除或采纳记录（`references/prior-fixes.md` 对应表追加）
3. 若采纳且涉及论文数字：论文候选池记录（pair_id 级产物路径）

## 单轮 token 预算

- 子集 A/B：10×2（vuln+patched）×2 组 ≈ 40 次扫描（缓存命中后实际 API 调用减半）
- 全量：100×2 组 ≈ 200 次扫描（仅采纳后跑）
