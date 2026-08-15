# Token 记账协议

## 1. 计量来源

| 来源 | 内容 | 位置 |
|------|------|------|
| debug_logs | 每 Agent "令牌使用: NNNN" | 输出 JSON `results[].debug_logs` |
| token_records | TokenUsageRecord（JSON 序列化后不可解析，用 debug_logs 兜底） | 输出 JSON |
| llm-cache | 响应缓存命中统计（M6） | `.cache/hos-ls/llm-cache` |

`opt_eval.py` 的 `tokens_of()` 已从 debug_logs 聚合每文件 token 总和。

## 2. 报告口径（论文 §4.3/§4.7 用）

- **总 token / 文件**
- **每漏洞 token** = 总 token / CONFIRMED 检出数（识别口径另行标注分母）
- **分层成本对照**：静态层（0 token）→ AI 层（全量 vs Top-K 子集）→ 验证层
- **双层模型成本实验**（独立报告，不与检测主实验混用）：
  `tiered_architecture.enabled: true`（flash 预扫 + 强模型深析），
  与 DREA "token offload 93%" 叙事对账。

## 3. 已知的 token 杠杆

| 杠杆 | 位置 | 说明 |
|------|------|------|
| Agent-0/1 缓存 | `_get_cached_result` | 同内容文件跳过 2 次调用 |
| llm-cache | `token_tracker` | 同 prompt+model 响应缓存 |
| 早停 | `_should_early_exit` | Agent-2 零风险 + 静态门零命中 → 跳过 3-6 |
| token 预算跳过 | `_check_token_budget_and_warn` | 超预算跳过 Agent-4/5（牺牲精度换成本） |
| 输入压缩 | `_slim_structured_data` / `_slim_json_for_prompt` | Agent-1→2 字段精简；Agent-5/6 上游截断 |
| 上下文预算 | `cpg_max_chars`（默认 6000） | CPG 注入封顶 |
| 双层模型 | `tiered_architecture` | flash + 强模型分工（默认关） |

## 4. 纪律

- 优化前后的 token 对比必须在**同一批样本、同一缓存状态说明**下进行（缓存命中率影响总 token）。
- 全量无分层对照（全部文件跑 AI 层）作为成本上限参考，列入论文 §4.7。
- 生产化应去除"多轮并集"（3 倍开销）：靠确定性升级 + Agent-4 兜底提升单轮确定性。
