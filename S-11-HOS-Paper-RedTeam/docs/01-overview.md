# 01 · Overview（概览）

> 本目录是 S-11-HOS-Paper-RedTeam 的正式规格文档，对齐 S-12-HOS-Critic-Review 的 docs/ 体系。当前为概览；其余细节直接指向各权威文件，避免重复维护。

## 这是什么

HOS 论文鞭尸局（Academic Red Teaming System）：以安全红队攻击思维审 AI/安全领域论文——拆解主张、攻击实验漏洞、输出毒舌点评、给出修复方案、挖掘下一篇论文方向。

**不是**论文总结器/翻译器；**是**科研漏洞扫描器。

## 核心链路

```
Paper → Audit → Exploit → Patch → Research Idea
```

## 方法论立场（本 Skill 与「AI 自创清单」的区别）

本 Skill 的评审规则有权威方法论背书（`references/methodology.md`）：

| 权威来源 | 提供什么 |
|----------|----------|
| The Craft of Research 5th（UChicago Press） | 研究总纲：Topic→Problem→Question→Evidence→Argument→Contribution |
| Research Design 5th（SAGE） | 设计顺序：先问题后方法，防「先定方法再硬找问题」 |
| How to Read a Paper（Keshav） | 三遍阅读法，第三遍=挑战隐藏假设 |
| CS Reviewer Rubric | 同行评审判断标准（Novelty/Soundness/Baseline/Experiment/Repro…） |

权威第三方解读/书评来源见 `references/authoritative-sources.md`。

## 十步流水线（速查）

1. Paper Hunter（抓取）→ 2. Hype Detector（营销浓度）→ 3. Claim Analyzer（主张拆解）→ 4. Experiment Auditor（实验审计）→ 5. Security Auditor（安全审计）→ 6. Reproduction Agent（复现评估）→ 7. Reviewer Simulator（审稿模拟）→ 8. Paper Autopsy（鞭尸局正文）→ 8b. Scorer（评分卡置顶）→ 9. Research Miner（下一篇论文）→ 10. Blogger Agent（公开内容）

最小可用路径：只给一篇论文时，从第 3 步跑到第 9 步（Autopsy + Scorer + Miner 必输出）。

## 文件地图

| 路径 | 说明 |
|------|------|
| `SKILL.md` | 主入口，完整规格（含方法论背书章节） |
| `README.md` | 快速上手 |
| `config/config.yaml` | 全局配置（含 methodology / evidence_network） |
| `references/methodology.md` | 方法论背书（书单 + Operationalization 映射） |
| `references/authoritative-sources.md` | 权威书评/解读来源库 |
| `references/rve-catalog.md` / `score-model.md` / `style-guide.md` / `ghfind-card.md` | 编号/评分/风格/卡片规范 |
| `agents/` | 11 个 Agent 定义 |
| `templates/` | 输出模板（均含权威解读区块） |
| `database/` | 论文/RVE/研究机会持久化 |
| `workflows/` | daily / weekly / monthly 自动化节奏 |
| `src/` | TS 评分卡渲染器 |
| `CHANGELOG.md` | 变更记录 |
