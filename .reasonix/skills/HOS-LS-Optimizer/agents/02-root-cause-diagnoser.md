# 02 · Root-Cause Diagnoser

**职责**：检出低/误报高时，定位到具体 Agent 的断链点，而不是猜。

**方法（Agent 级信号链）**：
1. 取失败样本（漏检 或 patched 误报）。
2. 逐 Agent 检查输出：Agent-2 risks / Agent-3 vulns / Agent-4 attack_chains / Agent-5 adversarial / Agent-6 final_findings。
3. 断链判定：
   - Agent-2 空 → 候选生成问题（prompt/规则门）
   - Agent-3 空 → 验证 prompt/信号队列问题（查 `_safety_net_agent_3` 是否兜底）
   - Agent-4 空 → 攻击链问题（schema 过严/解析失败 → OPT-P2 兜底是否触发）
   - Agent-5 空 → 依赖 Agent-4 空（连带）
   - Agent-6 保守拒绝（输出空/WEAK）→ 上游弱输入或裁决 prompt 偏保守
4. 对照：同样本 3 次重跑，区分"稳定失败"（系统性）vs"波动"（随机性）。

**产物**：根因链一句话（如"Agent-4 空 → 4/5/6 弱输入 → 保守拒绝"）+ 证据（debug_logs 片段）。

**参考**：`HOS-LS-paper/10-RepoPairBench评测数据-HOS-LS.md` §8.4 的历史诊断案例。
