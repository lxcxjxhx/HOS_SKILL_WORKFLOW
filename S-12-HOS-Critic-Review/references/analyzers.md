# 内置分析器检查点（M1）

> Analyzer-Agent 在 M1（无外部工具）按以下检查点执行。每条检查点命中即产出一条 Finding（可多条）。
> M2/M3 起对应插件（GitHub/Paper/License/Code）接入真实工具后，本清单仍是兜底分析器。

## 1. 通用文本检查点（article / proposal / unknown / repo / dataset 的文本形态）

| # | 检查点 | 问什么 | 产出 class |
|---|--------|--------|-----------|
| T1 | 主张-证据匹配 | 文章/方案的核心宣称是否有正文支撑？ | `CLAIM` |
| T2 | 结构完整度 | 方案缺背景/计划/风险/度量等关键章节？ | `REPRO` |
| T3 | 隐藏成本 | 是否遗漏维护/算力/人力/迁移成本？ | `CLAIM` / `ARCH` |
| T4 | 概念包装 | 新名词是否只是既有概念重命名？ | `CLAIM` |
| T5 | 数字与单位 | 关键数字是否无来源、无口径说明？ | `DATA` |
| T6 | 依赖与外部服务 | 是否隐含必须的外部依赖且未声明？ | `SEC` / `REPRO` |
| T7 | 安全与隐私 | 是否涉及数据收集/处理却无隐私说明？ | `SEC` |

## 2. 论文检查点（paper）

| # | 检查点 | 问什么 | 产出 class |
|---|--------|--------|-----------|
| P1 | Novelty | 方法与已发表工作的差异；是否拼接物 | `CLAIM` / `ARCH` |
| P2 | Baseline | 对比对象；是否缺 SOTA 对比 | `EVAL` |
| P3 | Experiment | 指标完整性（P/R/F1）、消融、显著性 | `EVAL` |
| P4 | Data | 数据集来源/规模/污染 | `DATA` |
| P5 | Repro | 代码/数据/参数是否公开 | `REPRO` |
| P6 | Hype | 摘要 vs 正文的强度差 | `CLAIM` |

## 3. 许可检查点（license / repo 的 LICENSE）

| # | 检查点 | 问什么 | 产出 class |
|---|--------|--------|-----------|
| L1 | SPDX 识别 | 能否匹配标准许可证标识？ | — |
| L2 | 兼容性 | 与依赖/目标平台的许可证冲突？ | `LIC` |
| L3 | 商用风险 | copyleft、专利条款、免责缺失 | `LIC` |
| L4 | 声明一致性 | 仓库声明 vs 实际依赖许可证 | `LIC` |

## 4. 生态检查点（repo 文本形态，M3 起接 GitHub API）

| # | 检查点 | 问什么 | 产出 class |
|---|--------|--------|-----------|
| E1 | 活跃度 | 最近提交/发布时间距今多久？ | `ECO` |
| E2 | Issue 健康 | open issue 积压比例？ | `ECO` |
| E3 | 文档与 CI | 有无 README/LICENSE/CI？ | `REPRO` |
| E4 | Star 异常 | star 与内容是否匹配（营销/无人问津）？ | `CLAIM` / `ECO` |

## 5. 输出约定

- 每条 Finding：`claim` 非空、`evidence_draft` 指向具体单元/行/数字、`confidence` 0-1；
- 无命中 → 空数组（合法，走「无发现模式」）；
- 不确定的命中用低 `confidence` 并交给 Evidence-Agent 校验。
