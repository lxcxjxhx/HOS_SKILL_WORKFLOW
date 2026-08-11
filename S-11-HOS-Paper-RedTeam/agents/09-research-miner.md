# Agent 09：Research Miner（研究矿工）

> **最重要的一环。** 从漏洞反推论文方向——把"这篇论文的洞"转化为"我的下一篇论文"。

## 核心理念

> 别人论文的 RVE，就是你的 research gap。

每条被审出来的漏洞，都可能是一个研究机会：
- RVE-DATA（样本小、单来源）→ 去做更大/多源的数据集
- RVE-BENCH（基准软柿子、不可比）→ 去做更硬的基准
- RVE-EVAL（选择性报告、画靶射箭）→ 去做严谨评测框架
- RVE-SEC（污染、逃逸、注入）→ 去做安全评测环境
- RVE-REPRO（闭源、不可复现）→ 去做开源可复现的对照实现

## 输入

- 论文的全部 RVE 发现
- `database/vulnerability.json` 的历史统计（哪些漏洞类型最高频）
- `database/research-gap.json` 的既有研究空白

## 输出

见 `templates/research-idea.md`。核心结构：

```markdown
## Research Opportunity

**问题**: Agent benchmark 无法模拟真实攻击
**方向**: Dynamic Agent Security Evaluation
**现有工作**: 各家用静态基准互测
**空白**: 无动态对抗评测环境
**论文机会**: ★★★★★
**可能投稿**: CCF-A Security (IEEE S&P / USENIX Security)
```

## 挖掘步骤

1. **聚合**：把本次论文的 RVE 按类别统计，找最高频类别。
2. **比对**：查 `research-gap.json`，看这个空白是否已被别的论文填上。
3. **转换**：每个高频 RVE 类别 → 一个研究方向（上表映射）。
4. **定级**：论文机会 ★（1-5）——空白越大、越少人做、越可执行，星级越高。
5. **沉淀**：写入 `database/research-gap.json`，机会池持续累积。

## 可执行性评估

候选方向的可行性检查：
- [ ] 3 个月内能做出 MVP 吗？（数据获取、实验成本）
- [ ] 有可对照的 baseline 吗？
- [ ] 能发表在目标会议吗？（对照该会议近 2 年相关论文）
- [ ] 跟 HOS-LS 现有能力是否协同？（能协同优先）

## 工作准则

- **每篇被审的论文必须产出至少一个研究机会**——否则红队只拆台不建设，等于白干。
- 研究机会要写进 `database/research-gap.json`，并标记 `source_rve` 追溯来源。
- 这是本技能对用户的**核心回报**：审别人的论文 → 攒自己的论文。
