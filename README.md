###### 我的简历 https://github.com/lxcxjxhx/HOS-Qian-jia-hong-resume
# HOS工作流提示词工厂

[![GitHub Repo](https://img.shields.io/badge/Repo-lxcxjxhx/HOS_SKILL_WORKFLOW-blue?style=flat-square&logo=github)](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square)](https://www.python.org)

**HOS 团队专属提示词工厂** —— 一站式构建、优化、管理 AI 工作流提示词与安全防护体系。

---

## 🎯 项目简介

**HOS工作流提示词工厂** 是 HOS 团队打造的提示词生态系统，专注于将零散的提示词转化为**结构化、可复用、自动化执行**的工作流。

仓库包含四大核心模块，覆盖从提示词生成、自动化工作流、AI 安全防护，到完整 AI 代码安全审计的全链路能力。

### 核心价值
- **结构化输出**：JSON 模板确保每一次提示结果都规范、可解析
- **自动化工作流**：一键生成完整、可直接运行的工作流
- **安全闭环**：内置 AI Guardrail + 专业安全审计平台（HOS-LS）
- **团队级落地**：已实际应用于 HOS 团队内部开发、考试、项目、文章等场景

---

## 📦 核心模块

### 1. HOS-AUTO-WORKFLOW（开发中）
**目标**：快速生成可用 AI 工作流

- **v0.5**：支持一键生成完整、可直接运行的工作流
- **v0.1**：全流程跑通（从提示词 → 执行 → 输出结构化结果）

**适用场景**：需要快速搭建复杂多步骤 AI 任务的用户。

### 2. HOS-AI Guardrail（开发中）
**目标**：为 AI 系统提供安全防护层

- **v0.1**：基础框架完成，模型引用自 [lxcxjxhx 的 Hugging Face Space](https://huggingface.co/lxcxjxhx)
- 核心功能：提示词注入防御、越狱攻击阻断、输出安全校验

**适用场景**：任何需要将 AI 能力对外暴露的生产环境。

### 3. HOS-LS v2.0 —— AI 安全审计平台

#### 转移到单独仓库：https://github.com/lxcxjxhx/HOS-LS
