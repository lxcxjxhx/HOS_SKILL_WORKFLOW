# CN-SRC-Hunter 工具集

## 概述

CN-SRC-Hunter 是一组用于中国 SRC（Security Response Center，应急响应中心）漏洞赏金项目情报收集与目标评分的 Python 工具。

核心能力：
- **项目情报采集**：自动采集各大 SRC 平台的项目信息、奖励等级、活动状态等元数据
- **目标优先级评分**：基于 100 分制多维度评分模型，对目标项目进行量化评估，帮助研究者确定最优投入方向
- **数据结构化管理**：将分散的项目信息整理为标准化 CSV 数据集，支持后续分析与自动化处理

## 工具列表

### 1. `target_score.py` — 目标评分

对指定的 SRC 项目进行多维度评分，输出优先级排序。

```bash
# 对单个项目进行评分
python target_score.py --name "某SRC项目" --cash 5000 --level 4 --scope 4 --activity 5 --attack 3 --tech 3 --competition 2 --automation yes

# 批量评分（从 CSV 读取）
python target_score.py --input programs.csv --output scored-programs.csv
```

**参数说明：**

| 参数 | 说明 | 取值范围 |
|------|------|----------|
| `--name` | 项目名称 | 字符串 |
| `--cash` | 现金奖励金额（元） | 整数 |
| `--level` | 赏金等级 | 1-5 |
| `--scope` | 范围广度 | 1-5 |
| `--activity` | 活动活跃度 | 1-5 |
| `--attack` | 攻击面大小 | 1-5 |
| `--tech` | 技术栈复杂度 | 1-5 |
| `--competition` | 竞争程度（越低越好） | 1-5 |
| `--automation` | 是否支持自动化 | yes/no |
| `--input` | 批量输入 CSV 文件 | 文件路径 |
| `--output` | 评分结果输出文件 | 文件路径 |

### 2. `fetch_intel.py` — 情报采集

从指定来源采集 SRC 项目的公开情报信息。

```bash
# 采集指定平台的项目列表
python fetch_intel.py --platform "src_example" --output raw-intel.csv

# 采集并自动评分
python fetch_intel.py --platform "src_example" --output programs.csv --score
```

**参数说明：**

| 参数 | 说明 | 取值范围 |
|------|------|----------|
| `--platform` | 目标 SRC 平台标识 | 字符串 |
| `--output` | 采集结果输出路径 | 文件路径 |
| `--score` | 采集完成后自动评分 | 开关 |

### 3. `build_programs.py` — 构建项目库

基于采集的情报数据，构建标准化的 SRC 项目数据库。

```bash
# 从原始数据构建项目库
python build_programs.py --input raw-intel.csv --output programs.csv

# 合并多个数据源
python build_programs.py --input raw-intel.csv --extra more-intel.csv --output programs.csv

# 构建并生成统计摘要
python build_programs.py --input raw-intel.csv --output programs.csv --summary
```

**参数说明：**

| 参数 | 说明 | 取值范围 |
|------|------|----------|
| `--input` | 原始情报输入文件 | 文件路径 |
| `--extra` | 额外输入文件（可多次指定） | 文件路径 |
| `--output` | 构建完成的项目库输出 | 文件路径 |
| `--summary` | 生成统计摘要 | 开关 |

## 数据文件

| 文件 | 说明 |
|------|------|
| `templates/programs-schema.csv` | 项目数据库标准格式模板，包含所有字段的表头 |
| `templates/findings-schema.csv` | 漏洞发现跟踪表模板，用于记录提交状态与结果 |
| `templates/scoring-dimensions.md` | 100 分制评分体系详细说明，包含各维度的评分标准 |

## 工作流程

三个工具按以下顺序协同工作：

```
fetch_intel.py  →  build_programs.py  →  target_score.py
  (情报采集)        (数据结构化)          (优先级评分)
```

1. **`fetch_intel.py`** 从各 SRC 平台采集原始情报，输出非结构化的初始数据
2. **`build_programs.py`** 将原始数据清洗、标准化，生成符合 `programs-schema.csv` 格式的结构化项目库
3. **`target_score.py`** 对项目库中的每个条目进行多维度评分，输出排序后的优先级列表

## 前置条件

- **Python 3.x**：需要 Python 3.8 或更高版本
- **无第三方依赖**：所有工具均使用 Python 标准库实现，无需 `pip install` 任何额外包

## 注意事项

### 法律合规

- 本工具仅用于**合法授权范围内**的安全研究活动
- 采集的情报信息仅限**公开可访问**的 SRC 平台公告页面，不得通过任何非法手段获取
- 使用本工具产生的任何行为，责任由使用者自行承担

### 授权要求

- 在对任何 SRC 项目进行测试前，务必确认已获得该项目的正式授权
- 严格遵守各 SRC 平台的规则与范围政策
- 不得超出授权范围进行测试，不得对未授权资产进行扫描或攻击