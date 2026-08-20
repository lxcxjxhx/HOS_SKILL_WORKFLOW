# 🎯 JSON Structured Prompts Framework

> **Version**: 1.0.0 · **License**: MIT · **Author**: HOS
>
> A comprehensive prompt engineering framework using JSON templates for generating standardized, reusable AI prompts across diverse scenarios.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./SKILL.md)
[![Prompt Engineering](https://img.shields.io/badge/category-prompt--engineering-green.svg)](./SKILL.md)

---

## 📖 简介

JSON Structured Prompts 是一个结构化的提示词工程框架，通过 15 个专用 JSON 模板覆盖从文章写作到安全审计的多种场景。该系统确保 AI 输出的一致性、可复用性和高质量。

### 核心特性

- ✅ **自适应指令**：动态调整提示词结构以适应用户需求
- ✅ **标准化模板**：统一的 JSON 结构确保一致性
- ✅ **写作标准**：客观简洁、零冗余、逻辑递进
- ✅ **文件管理**：版本控制、批量处理、摘要索引
- ✅ **多场景覆盖**：文章、考试、项目、安全、运维等

---

## 📦 安装

### 前置要求

- JSON 解析工具（任意编程语言）
- AI 模型 API 访问权限
- 文本编辑器或 IDE

### 快速开始

```bash
# 克隆仓库
git clone <repository-url>
cd W-02-HOS-JSON-Prompts

# 选择模板
ls *.json
```

无需额外依赖，所有模板均为纯 JSON 格式。

---

## 🚀 使用

### 基本流程

1. **选择模板**：根据使用场景选择合适的 JSON 模板
2. **自定义输入**：提供场景描述作为主要输入源
3. **生成提示词**：使用模板结构生成标准化提示词
4. **迭代优化**：根据输出质量持续改进

### 模板选择指南

| 模板 | 使用场景 | 核心特性 |
|------|----------|----------|
| `AAA-develop-template.json` | 主参考模板 | 完整框架，包含所有组件 |
| `develop-article.json` | 内容写作 | 文章结构、SEO 优化 |
| `develop-article-code.json` | 技术文章 | 代码示例集成 |
| `develop-auto-skill.json` | 技能自动化 | 自动化工作流生成 |
| `develop-exam.json` | 通用评估 | 测验/考试生成 |
| `develop-exam-CT.json` | CTF 挑战 | 安全竞赛格式 |
| `develop-exam-SG.json` | SG 评估 | 专业考试格式 |
| `develop-merged.json` | 多用途 | 灵活使用的组合模板 |
| `develop-model.json` | 模型开发 | AI/ML 模型训练提示词 |
| `develop-operations.json` | 运维操作 | 运维工作流自动化 |
| `develop-operations-report.json` | 报告生成 | 运维报告生成 |
| `develop-project.json` | 项目管理 | 项目规划与跟踪 |
| `develop-security.json` | 安全审计 | 安全评估与审计 |
| `develop-test.json` | 测试用例 | 测试用例生成 |
| `develop-token-save.json` | 优化节省 | Token 高效提示词设计 |

---

## ⚙️ 配置

### 模板结构

每个 JSON 模板遵循标准化结构：

```json
{
  "adaptive_instruction": [
    "仅将本模板作为参考框架，而非固定输出结构",
    "优先根据用户输入动态重组结构",
    "允许删减、重排或替换任意模块"
  ],
  "prompt": {
    "title": "...",
    "author": "...",
    "role": "...",
    "core_constraints": [...],
    "generation_strategy": {...},
    "writing_standards": {...},
    "file_management": {...},
    "final_goal": "..."
  }
}
```

### 核心组件

| 组件 | 说明 |
|------|------|
| **Role Definition** | 定义 AI 角色与核心能力 |
| **Core Constraints** | 输入源限制与原创性要求 |
| **Generation Strategy** | 规划与执行步骤 |
| **Writing Standards** | 风格、结构与格式指南 |
| **File Management** | 输出组织与版本控制规则 |

---

## 💡 示例

### 示例 1：生成技术文章

```json
// 使用 develop-article-code.json
{
  "topic": "如何使用 Python 实现 RESTful API",
  "audience": "中级开发者",
  "code_examples": true,
  "length": "1500-2000 words"
}
```

**输出**：
- 结构化技术文章
- 包含代码示例
- 符合写作标准
- 支持自定义扩展

### 示例 2：生成安全审计提示词

```json
// 使用 develop-security.json
{
  "target": "Web 应用安全审计",
  "scope": ["SQL注入", "XSS", "CSRF"],
  "compliance": "OWASP Top 10"
}
```

**输出**：
- 安全检查清单
- 漏洞检测提示词
- 修复建议模板
- 合规性报告框架

### 示例 3：Token 优化

```json
// 使用 develop-token-save.json
{
  "original_prompt": "...(长提示词)...",
  "optimization_target": "reduce_tokens_by_30_percent"
}
```

**输出**：
- 精简版提示词
- 保持核心语义
- Token 使用减少 30%+

---

## 🏗️ 架构

### 系统架构

```
┌─────────────────────────────────────────┐
│         JSON Structured Prompts         │
├─────────────────────────────────────────┤
│  Adaptive Instructions Layer            │
│  ├─ Dynamic Restructuring               │
│  ├─ Semantic Reconstruction             │
│  └─ User-Centric Priority               │
├─────────────────────────────────────────┤
│  Template Structure Layer               │
│  ├─ Master Template (AAA)               │
│  ├─ Specialized Templates (15 files)    │
│  └─ Template Selection Guide            │
├─────────────────────────────────────────┤
│  Writing Standards Layer                │
│  ├─ Style Guidelines                    │
│  ├─ Structure Rules                     │
│  └─ Quality Metrics                     │
├─────────────────────────────────────────┤
│  File Management Layer                  │
│  ├─ Version Control                     │
│  ├─ Batch Processing                    │
│  └─ Summary Indexing                    │
└─────────────────────────────────────────┘
```

### 与 HOS 生态集成

```
JSON Structured Prompts
    ↓
HOS-Sec-Engine (安全验证)
    ↓
HOS-Vibe-Guard (质量评估)
    ↓
HOS-Silly-Mock (防假数据)
```

---

## 📋 文件结构

```
W-02-HOS-JSON-Prompts/
├── README.md                          # 本文件
├── SKILL.md                           # 技能定义文档
├── AAA-develop-template.json          # 主模板（参考框架）
├── develop-article.json               # 文章写作模板
├── develop-article-code.json          # 技术文章模板
├── develop-auto-skill.json            # 技能自动化模板
├── develop-exam.json                  # 通用考试模板
├── develop-exam-CT.json               # CTF 考试模板
├── develop-exam-SG.json               # SG 考试模板
├── develop-merged.json                # 合并多用途模板
├── develop-model.json                 # 模型开发模板
├── develop-operations.json            # 运维工作流模板
├── develop-operations-report.json     # 运维报告模板
├── develop-project.json               # 项目管理模板
├── develop-security.json              # 安全审计模板
├── develop-test.json                  # 测试用例模板
└── develop-token-save.json            # Token 优化模板
```

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](https://opensource.org/licenses/MIT) 文件

---

## 🔗 相关资源

- **SKILL.md**: [技能定义文档](./SKILL.md)
- **HOS 生态**: HOS-Sec-Engine, HOS-Vibe-Guard, HOS-Silly-Mock
- **提示词工程最佳实践**: 参考 AAA-develop-template.json

---

## 📝 最佳实践

1. **从主模板开始**：使用 `AAA-develop-template.json` 理解框架
2. **适配而非复制**：将模板视为框架，而非 rigid 结构
3. **聚焦用户输入**：主要内容应来自用户场景描述
4. **保持标准**：遵循写作标准确保一致性
5. **迭代改进**：根据输出质量持续优化模板

---

## ⚠️ 注意事项

**本地环境限制**：本项目依赖 CI/CD 自动化测试进行验证。

---

> *"不是所有提示词都值得写，但所有提示词都可以启发更好的提示词"*
