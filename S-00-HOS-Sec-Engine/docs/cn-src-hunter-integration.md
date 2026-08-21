# CN-SRC-Hunter 集成指南

## 概述

CN-SRC-Hunter 是 HOS-Sec-Engine（HOS 安全引擎）的一个专用方法论扩展，专注于中国 SRC（Security Response Center，应急响应中心）漏洞赏金生态的项目情报采集、目标评估与漏洞发现全流程自动化。

本指南将帮助安全研究者和工程师了解如何将 CN-SRC-Hunter 方法论与 HOS-Sec-Engine 的 YAML Playbook、Python 工具链进行集成，构建一套完整的 SRC  Hunting 流水线。

## 架构

### 组件组成

CN-SRC-Hunter 由以下核心组件构成：

```
┌─────────────────────────────────────────────────────┐
│                  HOS-Sec-Engine                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         YAML Playbook (cn-src-hunter.yaml)    │   │
│  │  定义 7 个阶段的执行逻辑与数据流转规则         │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │ 加载                           │
│  ┌──────────────────▼───────────────────────────┐   │
│  │          Process Engine (流程引擎)             │   │
│  │  解析 YAML，按阶段调度 Python 工具            │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │ 调用                           │
│  ┌──────────────────▼───────────────────────────┐   │
│  │          Python 工具链                        │   │
│  │  fetch_intel.py → build_programs.py →         │   │
│  │  target_score.py                              │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │ 读写                           │
│  ┌──────────────────▼───────────────────────────┐   │
│  │          数据层 (CSV / Markdown)              │   │
│  │  programs-schema.csv, findings-schema.csv,    │   │
│  │  scoring-dimensions.md                        │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 数据流向

1. Playbook 由流程引擎解析，按阶段触发对应 Python 工具
2. Python 工具读取 CSV 模板，输出结构化数据
3. 评分结果回写到项目库，驱动下一阶段决策
4. 漏洞发现记录写入 `findings-schema.csv`，形成闭环

## 快速开始

### 步骤 1：确认环境

确保已安装 Python 3.8 或更高版本：

```bash
python --version
# 预期输出：Python 3.8.x 或更高
```

### 步骤 2：准备数据模板

从 `scripts/cn-src-hunter/templates/` 目录复制模板到工作目录：

```bash
cp scripts/cn-src-hunter/templates/programs-schema.csv ./workspace/
cp scripts/cn-src-hunter/templates/findings-schema.csv ./workspace/
```

### 步骤 3：执行情报采集

```bash
python scripts/cn-src-hunter/fetch_intel.py \
  --platform "src_example" \
  --output ./workspace/raw-intel.csv
```

### 步骤 4：构建项目库

```bash
python scripts/cn-src-hunter/build_programs.py \
  --input ./workspace/raw-intel.csv \
  --output ./workspace/programs.csv
```

### 步骤 5：批量评分

```bash
python scripts/cn-src-hunter/target_score.py \
  --input ./workspace/programs.csv \
  --output ./workspace/scored-programs.csv
```

### 步骤 6：查看结果

打开 `scored-programs.csv`，按总分降序排列，选择高分项目作为优先目标。

## 阶段指南

CN-SRC-Hunter 的 YAML Playbook 定义了 7 个执行阶段：

### 阶段 1：情报采集（Intel Gathering）

- **目标**：采集各大 SRC 平台的公开项目信息
- **执行工具**：`fetch_intel.py`
- **输出**：`raw-intel.csv`
- **关键动作**：
  - 遍历指定 SRC 平台列表
  - 提取项目名称、奖励等级、范围描述等元数据
  - 记录数据来源与更新时间

### 阶段 2：数据结构化（Data Structuring）

- **目标**：将原始情报清洗为标准化格式
- **执行工具**：`build_programs.py`
- **输出**：`programs.csv`
- **关键动作**：
  - 字段映射与标准化
  - 去重与合并
  - 数据完整性校验

### 阶段 3：目标评分（Target Scoring）

- **目标**：基于 100 分制模型对项目进行量化评估
- **执行工具**：`target_score.py`
- **输出**：`scored-programs.csv`
- **关键动作**：
  - 逐项目计算 7 个维度得分
  - 生成总分与优先级排序
  - 标记高价值目标

### 阶段 4：攻击面分析（Attack Surface Analysis）

- **目标**：对选定目标进行深度攻击面评估
- **前置条件**：已选定评分最高的 N 个项目
- **关键动作**：
  - 资产发现（域名、IP、应用）
  - 技术栈识别
  - 暴露面测绘

### 阶段 5：漏洞研究（Vulnerability Research）

- **目标**：在授权范围内进行漏洞挖掘
- **关键动作**：
  - 基于攻击面分析结果制定测试计划
  - 按 SRC 范围政策开展测试
  - 记录发现的漏洞

### 阶段 6：提交与跟踪（Submission & Tracking）

- **目标**：提交漏洞报告并跟踪处理状态
- **执行工具**：手动 + 半自动
- **输出**：`findings.csv`
- **关键动作**：
  - 编写漏洞报告
  - 提交至对应 SRC 平台
  - 跟踪修复进度与赏金发放

### 阶段 7：复盘与优化（Review & Optimization）

- **目标**：回顾全过程，优化方法论
- **关键动作**：
  - 统计各项目 ROI（投入产出比）
  - 分析成功与失败案例
  - 更新评分模型参数

## 流程引擎模板使用

### 加载 cn-src-hunter.yaml

流程引擎通过 YAML Playbook 驱动各阶段的执行。以下是 Playbook 的核心结构示例：

```yaml
playbook: cn-src-hunter
version: 1.0
description: "CN SRC 漏洞赏金全流程"

phases:
  - name: intel-gathering
    tool: fetch_intel.py
    input: platforms.yaml
    output: raw-intel.csv
    next: data-structuring

  - name: data-structuring
    tool: build_programs.py
    input: raw-intel.csv
    output: programs.csv
    next: target-scoring

  - name: target-scoring
    tool: target_score.py
    input: programs.csv
    output: scored-programs.csv
    next: attack-surface-analysis

  # ... 后续阶段
```

### 执行流程

1. 流程引擎读取 `cn-src-hunter.yaml`
2. 解析 `phases` 列表，确定执行顺序
3. 对每个阶段，根据 `tool` 字段调用对应 Python 脚本
4. 将上一阶段的 `output` 作为下一阶段的 `input`
5. 所有阶段完成后生成最终报告

## Python 工具使用

### target_score.py

**核心功能**：对 SRC 项目进行多维度评分。

```bash
# 交互式参数评分
python target_score.py --name "示例项目" --cash 8000 --level 5 --scope 4 --activity 5 --attack 4 --tech 3 --competition 2 --automation yes

# 批量评分
python target_score.py --input programs.csv --output scored.csv
```

评分维度与权重详见 `scripts/cn-src-hunter/templates/scoring-dimensions.md`。

### fetch_intel.py

**核心功能**：从公开来源采集 SRC 项目情报。

```bash
# 采集单个平台
python fetch_intel.py --platform "src_example" --output raw.csv

# 采集并立即评分
python fetch_intel.py --platform "src_example" --output raw.csv --score
```

### build_programs.py

**核心功能**：将原始情报构建为标准化项目库。

```bash
# 基础构建
python build_programs.py --input raw.csv --output programs.csv

# 多源合并
python build_programs.py --input raw.csv --extra extra1.csv --extra extra2.csv --output programs.csv

# 生成摘要
python build_programs.py --input raw.csv --output programs.csv --summary
```

## 数据流说明

### 数据实体关系

```
原始情报 (raw-intel.csv)
      │
      ▼
标准化项目库 (programs.csv)
      │
      ▼
评分项目库 (scored-programs.csv)
      │
      ▼
漏洞发现记录 (findings.csv)
```

### 各阶段数据格式

| 阶段 | 输入 | 输出 | 格式说明 |
|------|------|------|----------|
| 情报采集 | 平台列表 | raw-intel.csv | 非结构化原始数据 |
| 数据结构化 | raw-intel.csv | programs.csv | 符合 programs-schema.csv 格式 |
| 目标评分 | programs.csv | scored-programs.csv | 在 programs.csv 基础上增加 score 列 |
| 漏洞跟踪 | — | findings.csv | 符合 findings-schema.csv 格式 |

### 字段流转

- `programs.csv` 的核心字段：`name`（项目名）、`cash_bounty`（赏金）、`bounty_level`（等级）、`scope`（范围）等
- `scored-programs.csv` 新增字段：`score_total`（总分）、`rank`（排名）、`priority`（优先级标签）
- `findings.csv` 核心字段：`asset`（资产）、`type`（类型）、`severity`（严重性）、`status`（状态）

## 合规提醒

### 法律合规

- **仅限授权范围**：所有测试活动必须在 SRC 项目明确授权的范围内进行
- **遵守平台规则**：每个 SRC 平台有其独立的规则与政策，务必仔细阅读并严格遵守
- **禁止非法获取**：不得通过渗透、破解、社交工程等非法手段获取信息
- **数据本地化**：采集的数据应仅存储于本地，不得上传至未经授权的第三方

### 授权确认清单

在开始任何 SRC Hunting 活动前，请确认：

- [ ] 已在目标 SRC 平台完成注册并获得研究者身份
- [ ] 已阅读并理解目标项目的范围政策（Scope Policy）
- [ ] 已确认测试活动不会干扰目标系统的正常运行
- [ ] 已了解报告提交流程与赏金发放规则
- [ ] 已掌握负责任披露的原则与流程

## 常见问题

### Q1：评分结果与实际回报差距大怎么办？

评分体系是基于公开信息的量化模型，实际回报受多种因素影响（修复难度、竞争环境、平台政策变化等）。建议将评分作为**优先级参考**而非绝对依据，并在实战中持续校准评分参数。

### Q2：如何处理非结构化的情报数据？

`build_programs.py` 提供了字段映射功能。如果原始数据的字段名与标准格式不一致，可在工具的配置中添加映射规则，将非标准字段映射到标准字段。

### Q3：是否可以自定义评分权重？

可以。评分权重定义在 `scoring-dimensions.md` 中。如需调整权重，修改对应的分值分配后，`target_score.py` 会自动应用新权重。建议在充分测试后再调整生产环境的权重。

### Q4：工具支持哪些 Python 版本？

Python 3.8 及以上。所有工具仅使用 Python 标准库，无需安装额外依赖。

### Q5：如何处理大规模项目库的评分？

`target_score.py` 支持批量模式（`--input` 参数），可以处理任意大小的 CSV 文件。对于超大规模数据集，建议分批处理或使用流式读取模式以降低内存占用。

### Q6：漏洞被标记为"超出范围"怎么办？

仔细检查 SRC 项目的范围政策。如果确认属于误判，可以通过平台的申诉渠道提交证据。如果确实超出范围，应将该资产标记为"out-of-scope"并转向其他目标。

---

**本文档为 CN-SRC-Hunter 与 HOS-Sec-Engine 集成的完整指南。** 如需进一步了解各工具的详细参数与使用方法，请参考 `scripts/cn-src-hunter/README.md`。