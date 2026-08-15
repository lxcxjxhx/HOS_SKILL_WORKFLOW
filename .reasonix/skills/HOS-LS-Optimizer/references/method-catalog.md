# 方法目录（调研成果 → 落地映射）

> 完整调研报告：`HOS-LS-paper/12-方法调研-CCF与arXiv.md`（25 张卡片，adopt 10 / consider 12 / reject 3）。

## 采纳（adopt）— 已落地或直接可抄

| 论文 | venue/arXiv | 落点 | 状态 |
|------|-------------|------|------|
| LLMxCPG | arXiv 2507.16585 | 阶段 2/3 CPG 上下文注入 | ✅ context_builder CPG 模式 |
| OpenAnt | arXiv 2606.19149 | 分解 + 对抗验证 + 动态测试 | 部分（对抗验证已有 Agent-5） |
| RECEIPT | arXiv 2607.18575 | 阶段 4 确定性验证范式 | 部分（`_deterministic_promote`） |
| AnyPoC | arXiv 2604.11950 | 自动 PoC 测试生成 | 待仓库级 |
| VulAgent | ACL Findings 2026 (2509.11523) | 假设-验证多 agent 模板 | 架构对齐（现有 7-agent） |
| VulnAgent-R2 | arXiv 2603.13384 | 证据链 + 置信度校准 | 证据链 tracker |
| AEGIS | arXiv 2603.20637 | 辩证 + 元审计 | 7-agent 角色已有 |
| DREA | Internetware 2026 (2607.13439) | 推理/探索解耦 token 效率 | 双层架构成本实验 |
| Sifting the Noise | ISSTA 2026 | FPR 口径 + FP 过滤 | metric-protocol |
| ZeroFalse | arXiv 2510.02534 | 阶段 1 静态告警预过滤 | 待评估 |

## Consider（12 篇）— 方向对但缺实测数字，不承诺收益

PoC-Adapt (2604.06618) / Strategic Heterogeneous (2604.21282) / AgenticSCR (2601.19138) /
Veritas (2605.15097) / VulnGym (2608.02001) / Interpretable Reports (ASE 2025) /
Beyond Function-Level (2602.06751) / SastBench (2601.02941) / Revelio (2606.22263) /
TitanCA (2604.17860) / VIPER-MCP (2605.21392) / AutoTrace (2607.12058)

## Reject（3 篇）— 不进正文

AutoReview（FSE 2025 SRC，无可复核证据）/ FuzzingBrain V2（数值不可核实，fuzzing 方向不匹配）/
Bridging CPG+LLM（综述无机制）

## 引用进论文的条件

每条引用必须：arXiv 号/venue 核验 + 一句话贡献 + 一句话问题 + 与 HOS-LS 的差异；
预印本标注状态，不把预印本说成顶会（写作要求 3）。
