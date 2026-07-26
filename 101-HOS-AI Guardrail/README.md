<div align="center">

# 🛡️ HOS-AI Guardrail

**AI 安全围栏 — 输入输出双向安全检测与策略引擎**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./SKILL.md)
[![Category](https://img.shields.io/badge/category-security-green.svg)](./SKILL.md)
[![Risk Level](https://img.shields.io/badge/risk-low-success.svg)](./SKILL.md)
[![Confidence](https://img.shields.io/badge/confidence-85%25-brightgreen.svg)](./SKILL.md)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](./LICENSE)

[技能文档](./SKILL.md) • [快速开始](#-快速开始) • [配置说明](#-配置说明) • [API 文档](#-api-文档)

</div>

---

## 📋 目录

- [概述](#-概述)
- [核心能力](#-核心能力)
- [文件结构](#-文件结构)
- [快速开始](#-快速开始)
- [配置说明](#-配置说明)
- [API 文档](#-api-文档)
- [Dify 集成](#-dify-集成)
- [架构设计](#-架构设计)
- [注意事项](#️-注意事项)
- [更新日志](#-更新日志)

---

## 🎯 概述

HOS-AI Guardrail 是一个全面的 AI 安全检测系统，基于 FastAPI 构建。系统对输入提示词和模型输出进行双向检测与过滤，确保内容符合安全策略。

**核心功能：**
- 🔍 实时检测提示词注入攻击
- 🛡️ 敏感信息识别与拦截
- ✅ 合规内容过滤（涉赌/涉黄/涉毒/涉恐）
- 🎭 幻觉风险检测
- ⚙️ 灵活的 YAML 策略配置
- 🔌 Dify 工作流集成

---

## 🚀 核心能力

### 1. 输入检测 (Input Inspector)

| 检测类型 | 说明 | 示例 |
|---------|------|------|
| **提示词注入** | 检测越狱、角色劫持攻击 | `ignore previous instructions` |
| **敏感信息** | 身份证、手机号、银行卡等 PII | `110101199001011234` |
| **合规检查** | 涉赌/涉黄/涉毒/涉恐内容 | `gambling`, `drugs` |

### 2. 输出检测 (Output Inspector)

| 检测类型 | 说明 | 示例 |
|---------|------|------|
| **输出合规** | 确保生成内容不含违禁词 | 违禁关键词检测 |
| **幻觉检测** | 识别不确定/捏造信息 | `reportedly`, `allegedly` |

### 3. 策略引擎 (Policy Engine)

```yaml
# 灵活的 YAML 配置
default:
  input:
    prompt_injection:
      enabled: true
      keywords: ["ignore previous instructions", "system prompt"]
      action: block
      answer: "Sorry, your request contains unsafe content."
```

**配置特性：**
- 📝 基于 YAML 的规则定义
- 🎯 按资产 ID 区分策略
- ⚡ 规则独立启用/禁用
- 🔄 支持热重载

### 4. 决策中心 (Decision Hub)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Input Check │────▶│ Policy Engine│────▶│ Decision Hub│
└─────────────┘     └──────────────┘     └─────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                      PASS                 BLOCK                REWRITE
                    (放行)               (拦截)               (改写)
```

**决策优先级：** `block > rewrite > pass`

---

## 📁 文件结构

```
101-HOS-AI Guardrail/
├── SKILL.md                    # 技能元数据
├── README.md                   # 项目说明文档（本文件）
├── main.py                     # FastAPI 入口
├── src/
│   ├── api/
│   │   └── routes.py          # API 路由
│   ├── config/
│   │   ├── model_config.yaml  # LLM 配置
│   │   └── policy.yaml        # 安全策略
│   └── core/
│       ├── decision_hub.py    # 决策中心
│       ├── input_inspector.py # 输入检测
│       ├── model_engine.py    # 模型引擎
│       ├── output_inspector.py# 输出检测
│       └── policy_engine.py   # 策略引擎
├── tests/                      # 测试套件
│   ├── test_input_inspector.py
│   ├── test_output_inspector.py
│   └── test_policy_engine.py
├── static/                     # Web UI
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
└── dify/
    └── hos_ai_fence.json      # Dify 集成配置
```

---

## 🚀 快速开始

### 环境要求

- Python 3.8+
- FastAPI
- Uvicorn

### 安装与启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd "101-HOS-AI Guardrail"

# 2. 安装依赖
pip install fastapi uvicorn pyyaml httpx loguru

# 3. 启动服务
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 访问服务

- **API 文档**: http://localhost:8000/docs
- **Web UI**: http://localhost:8000/

---

## 🔧 配置说明

### 策略配置 (policy.yaml)

```yaml
default:
  input:
    # 提示词注入检测
    prompt_injection:
      enabled: true
      keywords: 
        - "ignore previous instructions"
        - "system prompt"
        - "override"
      action: block
      answer: "Sorry, your request contains unsafe content."
    
    # 敏感信息检测
    sensitive_info:
      enabled: true
      patterns:
        - '[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]'  # 身份证
        - '1[3-9]\d{9}'  # 手机号
        - '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'  # 邮箱
      action: block
      answer: "Sorry, your request contains sensitive information."
    
    # 合规检查
    compliance:
      enabled: true
      keywords: ["gambling", "pornography", "drugs", "terrorism"]
      action: block
      answer: "Sorry, your request involves prohibited content."
  
  output:
    # 输出合规
    output_compliance:
      enabled: true
      keywords: ["gambling", "pornography", "drugs", "terrorism"]
      action: block
      answer: "Sorry, cannot provide related content based on safety rules."
    
    # 幻觉检测
    hallucination:
      enabled: false
      action: rewrite
      answer: "Based on available information, cannot confirm accuracy."
```

### 模型配置 (model_config.yaml)

```yaml
default:
  provider: "openai"
  model: "gpt-4o-mini"
  api_key: ""
  temperature: 0.1
  max_tokens: 500
  timeout: 30

providers:
  openai:
    base_url: "https://api.openai.com/v1"
    api_key_env: "OPENAI_API_KEY"
  anthropic:
    base_url: "https://api.anthropic.com/v1"
    api_key_env: "ANTHROPIC_API_KEY"
  zhipu:
    base_url: "https://open.bigmodel.cn/api/paas/v4"
    api_key_env: "ZHIPU_API_KEY"
  qwen:
    base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    api_key_env: "QWEN_API_KEY"
```

**支持的 LLM 提供商：**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- 智谱 AI (GLM)
- 通义千问 (Qwen)

---

## 📡 API 文档

### 输入检测

**请求**

```http
POST /api/inspect/input
Content-Type: application/json

{
  "asset_id": "default",
  "text": "Your input text here",
  "detection_type": "input"
}
```

**响应**

```json
{
  "errCode": 200,
  "errMsg": "",
  "suggestion": "pass",
  "categories": [],
  "answer": ""
}
```

### 输出检测

**请求**

```http
POST /api/inspect/output
Content-Type: application/json

{
  "asset_id": "default",
  "text": "Model output text here",
  "detection_type": "output"
}
```

**响应**

```json
{
  "errCode": 200,
  "errMsg": "",
  "suggestion": "block",
  "categories": ["compliance"],
  "answer": "Sorry, cannot provide related content based on safety rules."
}
```

### 模型配置更新

**请求**

```http
POST /api/model/config
Content-Type: application/json

{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "api_key": "your-api-key",
  "temperature": 0.1,
  "max_tokens": 500,
  "timeout": 30
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `errCode` | int | 状态码，200 表示成功 |
| `errMsg` | string | 错误信息 |
| `suggestion` | string | 建议动作：`pass` / `block` / `rewrite` / `error` |
| `categories` | array | 违规类别列表 |
| `answer` | string | 拦截/改写时的安全回复 |

---

## 🔌 Dify 集成

系统提供 Dify 工作流插件配置，可无缝集成到 Dify AI 工作流平台。

**配置文件**: `dify/hos_ai_fence.json`

**集成流程**:

```
Dify Workflow → HOS AI Fence Plugin → Safety Check → Return Verdict
```

**插件功能**:
- 接收文本输入
- 执行安全检测
- 返回可执行建议

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (routes.py)                     │
│                    HTTP Request/Response Handling                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Input Inspector  │  │ Output Inspector │  │ Decision Hub │ │
│  │  - Prompt Inject │  │  - Compliance    │  │  - Priority  │ │
│  │  - Sensitive Info│  │  - Hallucination │  │  - Response  │ │
│  │  - Compliance    │  │                  │  │  - Error     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                    Policy Engine (policy.yaml)                    │
│              Configurable Safety Rules Management                 │
├─────────────────────────────────────────────────────────────────┤
│                    Model Engine (LLM Integration)                 │
│         OpenAI / Anthropic / Zhipu / Qwen Provider Support        │
└─────────────────────────────────────────────────────────────────┘
```

**设计原则**:
- 🎯 分层架构，职责清晰
- 🔌 插件化设计，易于扩展
- ⚡ 规则 + 模型双重检测
- 🔄 配置热重载

---

## ⚠️ 注意事项

- ⚠️ **本地环境限制，依赖 CI/CD 自动化测试**
- 🔒 系统采用规则 + 模型双重检测机制
- 🔄 所有配置支持热重载，无需重启服务
- 🌐 Web UI 访问地址：`http://localhost:8000/`
- 🔑 生产环境请配置安全的 API Key
- 📊 建议启用日志记录以便审计

---

## 📝 更新日志

### v0.1.0 (2026-07-26)

- ✨ 初始版本发布
- 🔍 输入/输出双向检测
- 🛡️ 策略引擎支持
- 🔌 Dify 集成
- 🎨 Web UI 监控界面
- 📚 完整 API 文档

---

<div align="center">

**[⬆ 返回顶部](#-hos-ai-guardrail)**

Made with ❤️ by HOS Team

</div>
