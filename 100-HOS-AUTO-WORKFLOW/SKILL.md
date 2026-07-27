---
name: HOS-AUTO-WORKFLOW
description: "HOS 自动化工作流 — 基于 Dify 平台的 AI 报告撰写自动化工具"
version: "0.1.0"
author: "HOS"
tags:
  - automation
  - workflow
  - dify
  - report-generation
  - ai-writing
category: "automation"
risk-level: low
confidence: 0.80
---

# HOS-AUTO-WORKFLOW：自动化工作流引擎

> 基于 Dify 平台的 AI 自动化报告撰写工具，支持多模型接入与工作流编排。

---

## 一、概述

HOS-AUTO-WORKFLOW 提供基于 Dify 平台的自动化工作流配置，用于 AI 报告的自动化撰写。支持 DeepSeek、OpenAI 等多种模型后端。

## 二、核心能力

1. **自动化报告生成** — 基于 AI 模型自动生成结构化报告
2. **多模型支持** — 集成 DeepSeek、OpenAI 等主流模型
3. **工作流编排** — 可视化工作流配置与调试
4. **数据集管理** — 支持数据集导入与管理

## 三、文件结构

```
100-HOS-AUTO-WORKFLOW/
├── SKILL.md                          # 本文件
├── README.md                         # 使用指南
├── HOS自动化报告撰写工具 v0.1.yml     # Dify 工作流配置
├── 自动化工作流配置手册.yml            # 配置手册
└── 数据集/
    └── 1.11.x.md                     # 数据集文档
```

## 四、使用指南

### 4.1 导入工作流

1. 登录 Dify 平台
2. 导入 `HOS自动化报告撰写工具 v0.1.yml`
3. 配置模型 API Key（DeepSeek / OpenAI）
4. 运行工作流

### 4.2 配置手册

参考 `自动化工作流配置手册.yml` 了解详细配置选项。

## 五、依赖

- Dify 平台（>= 0.5.0）
- DeepSeek 或 OpenAI API Key
- Markdown Exporter 插件

## 六、版本信息

| 项目 | 值 |
|------|-----|
| 版本 | 0.1.0 |
| 日期 | 2026-07-26 |
| 作者 | HOS |
| 许可证 | MIT |
