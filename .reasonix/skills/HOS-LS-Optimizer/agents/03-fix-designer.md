# 03 · Fix Designer

**职责**：从模式库选**单变量**修复，写清楚"改哪里、为什么、预期增益"。

**模式库（按证据优先级）**：
| 模式 | 落点 | 优先级 |
|------|------|--------|
| 确定性升级（验证优先于拒绝） | `_deterministic_promote` + 配置门 | P0 |
| Agent 断链兜底（确定性合成，0 token） | `_fallback_attack_chains` | P0 |
| 上下文注入（CPG/完整源码，预算受限） | `context_builder` CPG 模式 | P1（仓库级） |
| prompt 放宽/收紧（单模板） | `prompts/templates/*.jinja2` | P1 |
| 证据链注入（AST/污点） | M4 `ast_evidence_enabled` | P2（A/B 有扰动） |
| token 压缩（上游截断/字段精简） | `_slim_json_for_prompt` | P1 |
| 双层模型分工（成本实验） | `tiered_architecture` | P2（独立报告） |

**单变量纪律**：一次只改一个机制。prompt 改动与逻辑改动分开 A/B。
**每个改动必须可开关**（配置门），便于消融与回滚。

**产物**：改动说明（文件+函数+预期增益+是否影响缓存键）。
