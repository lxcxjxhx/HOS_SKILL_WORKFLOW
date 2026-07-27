<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![AI IDE Compatible](https://img.shields.io/badge/AI%20IDE-Compatible-success.svg)

# 🤖 HOS-AUTO-WORKFLOW

**HOS 自动化工作流 — 基于 Dify 平台的 AI 报告撰写自动化工具**

[快速开始](#-快速开始) • [使用指南](#-使用指南) • [架构](#-架构) • [许可证](#-许可证)

</div>

---

## 📖 简介

HOS-AUTO-WORKFLOW 提供基于 Dify 平台的自动化工作流配置，用于 AI 报告的自动化撰写。支持 DeepSeek、OpenAI 等多种模型后端，通过可视化工作流编排实现智能报告生成。

### ✨ 核心特性

- **自动化报告生成**：基于 AI 模型自动生成结构化报告
- **多模型支持**：集成 DeepSeek、OpenAI 等主流模型
- **工作流编排**：可视化工作流配置与调试
- **数据集管理**：支持数据集导入与管理
- **灵活配置**：通过 YAML 文件定义工作流，易于维护和扩展

---

## 🚀 安装

### 前置条件

- Dify 平台（>= 0.5.0）
- DeepSeek 或 OpenAI API Key
- Markdown Exporter 插件

### 安装步骤

#### Claude Code

```bash
# 在 Claude Code 中直接使用
# 系统会自动识别并加载 HOS-AUTO-WORKFLOW 技能
```

#### TRAE

```bash
# TRAE IDE 已内置支持
# 通过技能市场安装 HOS-AUTO-WORKFLOW
```

#### Cursor

```bash
# 在 Cursor 中添加技能
# 导入 100-HOS-AUTO-WORKFLOW 目录
```

#### 通用安装

```bash
# 克隆仓库
git clone <repository-url>

# 进入技能目录
cd 100-HOS-AUTO-WORKFLOW

# 技能会自动被 AI IDE 识别和加载
```

---

## 📝 使用

### 导入工作流

1. 登录 Dify 平台
2. 导入 `HOS自动化报告撰写工具 v0.1.yml`
3. 配置模型 API Key（DeepSeek / OpenAI）
4. 运行工作流

### 配置手册

参考 `自动化工作流配置手册.yml` 了解详细配置选项。

### 使用示例

```
# 生成 AI 研究报告
帮我生成一份关于大语言模型最新进展的研究报

# 自定义报告模板
使用 HOS-AUTO-WORKFLOW 生成技术趋势分析报告

# 数据集管理
导入我的研究数据集并生成分析报告
```

---

## ⚙️ 配置

### 工作流配置

工作流通过 YAML 文件定义，主要配置项包括：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `model_provider` | 模型提供商 | `deepseek` / `openai` |
| `model_name` | 模型名称 | `deepseek-chat` / `gpt-4` |
| `temperature` | 生成温度 | `0.7` |
| `max_tokens` | 最大 token 数 | `4096` |
| `output_format` | 输出格式 | `markdown` / `pdf` |

### 环境变量

```bash
# Dify 平台配置
DIFY_API_ENDPOINT=https://api.dify.ai/v1
DIFY_API_KEY=your-api-key

# 模型配置
DEEPSEEK_API_KEY=your-deepseek-key
OPENAI_API_KEY=your-openai-key
```

---

## 🏗️ 架构

```
100-HOS-AUTO-WORKFLOW/
├── SKILL.md                          # 技能定义文件
├── README.md                         # 本文件 — 使用指南
├── HOS自动化报告撰写工具 v0.1.yml     # Dify 工作流配置
├── 自动化工作流配置手册.yml            # 配置手册
└── 数据集/
    └── 1.11.x.md                     # 数据集文档
```

### 工作流程

```
用户输入 → 意图识别 → 模型选择 → 报告生成 → 格式化输出
   ↓           ↓           ↓           ↓           ↓
 需求分析   路由决策   API 调用   内容生成   Markdown/PDF
```

### 核心组件

1. **工作流引擎**：基于 Dify 平台的可视化编排
2. **模型适配器**：支持多模型后端的统一接口
3. **数据集管理器**：数据导入、清洗、预处理
4. **输出生成器**：结构化报告格式化

---

## 📋 依赖

| 依赖项 | 版本要求 | 说明 |
|--------|---------|------|
| Dify 平台 | >= 0.5.0 | 工作流执行引擎 |
| DeepSeek API | 最新 | 模型后端（可选） |
| OpenAI API | 最新 | 模型后端（可选） |
| Markdown Exporter | 最新 | 报告导出插件 |

---

## 📄 许可证

- **版本**：0.1.0
- **创建日期**：2026-07-26
- **最后更新**：2026-07-26
- **维护者**：HOS Team
- **许可证**：MIT

### 文档导航

- [技能定义](SKILL.md) — 技能元数据与能力描述
- [工作流配置](HOS自动化报告撰写工具%20v0.1.yml) — Dify 工作流定义
- [配置手册](自动化工作流配置手册.yml) — 详细配置说明
- [数据集文档](数据集/1.11.x.md) — 数据集使用说明
