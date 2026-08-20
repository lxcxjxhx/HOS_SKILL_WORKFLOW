# 🤖 W-03-HOS-Human-Pass

> Human Verification Testing Skill for Security Assessment

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Category](https://img.shields.io/badge/category-security--testing-orange.svg)
![Risk Level](https://img.shields.io/badge/risk-medium-yellow.svg)
![Confidence](https://img.shields.io/badge/confidence-70%25-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

[技能文档](./SKILL.md) • [快速开始](#快速开始) • [使用指南](#使用指南) • [配置说明](#配置说明)

</div>

---

## 📋 目录

- [概述](#概述)
- [核心能力](#核心能力)
- [文件结构](#文件结构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [配置说明](#配置说明)
- [测试方法论](#测试方法论)
- [道德考量](#道德考量)
- [注意事项](#注意事项)
- [更新日志](#更新日志)

---

## 🎯 概述

HOS-Human-Pass 是一个专注于人机验证机制和机器人检测系统的安全测试技能。本技能提供 CAPTCHA 系统、行为生物特征、设备指纹和风险控制的全面分析，帮助安全团队评估和改进其人机验证防御能力。

**目的**：在安全环境中研究和测试人机验证机制，帮助组织了解其机器人检测能力并识别潜在漏洞。

---

## 🚀 核心能力

### 1. CAPTCHA 分析

全面分析各种 CAPTCHA 系统及其有效性：

| CAPTCHA 类型 | 分析内容 |
|-------------|---------|
| **文本 CAPTCHA** | OCR 抗性测试、字符分割分析、失真效果评估 |
| **图像 CAPTCHA** | 图像识别测试、目标检测能力、视觉谜题分析 |
| **reCAPTCHA v2/v3** | Token 分析、行为评分评估、Cookie/会话检查 |
| **hCaptcha** | 挑战难度评估、隐私保护验证测试 |
| **自定义 CAPTCHA** | 专有系统分析、弱点识别、绕过可行性评估 |

**分析指标**：
- 解决时间分布
- 不同攻击向量的成功率
- 资源消耗（CPU/GPU/内存）
- 自动化解决方法的可扩展性

### 2. 行为分析

高级行为生物特征分析以区分人类和机器人：

- **鼠标移动模式**：轨迹分析、速度变化、加速度曲线、微动作
- **键盘动态**：按键时序、打字节奏、压力模式（如可用）
- **触摸手势**：滑动模式、点击压力、多点触控行为（移动端）
- **滚动行为**：滚动速度、方向变化、动量模式
- **导航模式**：页面转换时序、点击序列、交互流程

**检测规避测试**：
- 行为模式模拟
- 机器学习模型指纹识别
- 时间模式分析
- 异常检测绕过技术

### 3. 设备指纹识别

全面的设备指纹分析和规避测试：

- **浏览器指纹**：Canvas 指纹、WebGL 渲染、AudioContext 分析、字体枚举
- **硬件指纹**：屏幕分辨率、GPU 信息、CPU 特性、电池 API
- **网络指纹**：IP 信誉、代理/VPN 检测、TLS 指纹、HTTP/2 指纹
- **存储指纹**：LocalStorage、SessionStorage、IndexedDB、Cookie 行为
- **插件/扩展检测**：已安装插件枚举、扩展指纹识别

**规避技术**：
- 指纹随机化
- 浏览器配置文件欺骗
- 虚拟环境检测绕过
- 反检测浏览器测试（Puppeteer、Playwright、Selenium）

### 4. 风险控制评估

风险控制系统和决策引擎的评估：

- **风险评分模型**：风险计算算法分析、权重分布、阈值调整
- **决策引擎测试**：规则系统分析、ML 模型推理、集成方法评估
- **会话分析**：会话有效性检查、异常检测、会话劫持抗性
- **速率限制**：节流有效性、分布式攻击抗性、自适应限制
- **地理位置验证**：IP 地理位置准确性、GPS 欺骗检测、时区一致性

**评估领域**：
- 假阳性/假阴性率
- 自适应阈值有效性
- 实时决策延迟
- 攻击向量覆盖范围

---

## 📁 文件结构

```
W-03-HOS-Human-Pass/
├── SKILL.md                      # 技能元数据（本文件）
├── README.md                     # 项目文档
├── src/
│   ├── captcha/
│   │   ├── text_captcha.py       # 文本 CAPTCHA 分析
│   │   ├── image_captcha.py      # 图像 CAPTCHA 测试
│   │   ├── recaptcha.py          # reCAPTCHA v2/v3 分析
│   │   ├── hcaptcha.py           # hCaptcha 测试
│   │   └── custom_captcha.py     # 自定义系统分析
│   ├── behavioral/
│   │   ├── mouse_analysis.py     # 鼠标移动模式
│   │   ├── keyboard_dynamics.py  # 按键时序分析
│   │   ├── touch_gestures.py     # 触摸手势分析
│   │   └── scroll_behavior.py    # 滚动模式分析
│   ├── fingerprint/
│   │   ├── browser_fp.py         # 浏览器指纹
│   │   ├── hardware_fp.py        # 硬件指纹
│   │   ├── network_fp.py         # 网络指纹
│   │   └── evasion.py            # 指纹规避技术
│   ├── risk_control/
│   │   ├── risk_scoring.py       # 风险评分分析
│   │   ├── decision_engine.py    # 决策引擎测试
│   │   ├── session_analysis.py   # 会话安全分析
│   │   └── rate_limiting.py      # 速率限制评估
│   └── utils/
│       ├── http_client.py        # HTTP 客户端工具
│       ├── browser_automation.py # 浏览器自动化助手
│       └── data_collector.py     # 数据收集工具
├── tests/
│   ├── test_captcha.py           # CAPTCHA 分析测试
│   ├── test_behavioral.py        # 行为分析测试
│   ├── test_fingerprint.py       # 指纹测试
│   └── test_risk_control.py      # 风险控制测试
├── config/
│   ├── targets.yaml              # 目标配置
│   └── detection_rules.yaml      # 检测规则定义
└── reports/
    └── assessment_template.md    # 评估报告模板
```

---

## 🚀 快速开始

### 环境要求

- Python 3.8+
- 必需包：`requests`, `selenium`, `playwright`, `numpy`, `scikit-learn`
- 浏览器驱动程序（ChromeDriver、GeckoDriver）用于自动化测试

### 安装

```bash
# 安装依赖
pip install requests selenium playwright numpy scikit-learn Pillow

# 安装浏览器二进制文件
playwright install
```

---

## 📖 使用指南

### CAPTCHA 分析

```python
from src.captcha import text_captcha, image_captcha, recaptcha

# 分析文本 CAPTCHA
text_result = text_captcha.analyze(
    target_url="https://example.com/captcha",
    sample_count=100
)

# 测试图像 CAPTCHA
image_result = image_captcha.analyze(
    target_url="https://example.com/image-captcha",
    attack_vectors=["ocr", "ml_recognition", "segmentation"]
)

# 评估 reCAPTCHA v3
recaptcha_result = recaptcha.analyze_v3(
    site_key="your-site-key",
    action="login",
    min_score=0.5
)
```

### 行为分析

```python
from src.behavioral import mouse_analysis, keyboard_dynamics

# 分析鼠标移动模式
mouse_result = mouse_analysis.collect_patterns(
    session_duration=300,  # 5 分钟
    sample_interval=0.01   # 10ms
)

# 测试键盘动态
keyboard_result = keyboard_dynamics.analyze_typing(
    text_samples=["sample1", "sample2"],
    detect_rhythm=True
)
```

### 设备指纹识别

```python
from src.fingerprint import browser_fp, evasion

# 收集浏览器指纹
fingerprint = browser_fp.collect_fingerprint(
    browser="chrome",
    include_canvas=True,
    include_webgl=True,
    include_audio=True
)

# 测试指纹规避
evasion_result = evasion.test_randomization(
    fingerprint=fingerprint,
    iterations=100
)
```

### 风险控制评估

```python
from src.risk_control import risk_scoring, decision_engine

# 分析风险评分模型
risk_result = risk_scoring.analyze_model(
    target_url="https://example.com/api/risk",
    test_cases="config/test_cases.yaml"
)

# 测试决策引擎
decision_result = decision_engine.test_rules(
    rule_set="config/detection_rules.yaml",
    simulate_attacks=True
)
```

---

## ⚙️ 配置说明

### 目标配置 (targets.yaml)

```yaml
targets:
  - name: "example_login"
    url: "https://example.com/login"
    captcha_type: "recaptcha_v3"
    site_key: "6Le..."
    rate_limit: 10  # 每分钟请求数
    
  - name: "example_signup"
    url: "https://example.com/signup"
    captcha_type: "hcaptcha"
    behavioral_analysis: true
    fingerprint_check: true
```

### 检测规则 (detection_rules.yaml)

```yaml
detection_rules:
  mouse_patterns:
    - name: "linear_movement"
      threshold: 0.8
      action: "flag"
    - name: "instant_teleport"
      max_time_ms: 50
      action: "block"
      
  fingerprint_changes:
    - name: "canvas_change"
      check_interval: 60
      action: "alert"
```

### 生成评估报告

```python
from src.utils import report_generator

report = report_generator.generate_assessment(
    target="example_login",
    captcha_results=text_result,
    behavioral_results=mouse_result,
    fingerprint_results=fingerprint,
    risk_results=risk_result,
    output_format="markdown"
)

# 保存报告
with open("reports/assessment_example_login.md", "w") as f:
    f.write(report)
```

---

## 🔬 测试方法论

### 1. 基线评估

- 记录当前验证机制
- 识别所有保护层面
- 建立基线指标

### 2. 攻击模拟

- 自动化解决尝试
- 行为模式模拟
- 指纹操作
- 分布式攻击测试

### 3. 漏洞分析

- 识别弱点
- 计算绕过可行性
- 评估攻击可扩展性
- 评估资源需求

### 4. 建议生成

- 按风险优先级排序漏洞
- 建议缓解策略
- 提供实施指导
- 估计改进指标

---

## ⚖️ 道德考量

**重要**：本技能仅用于**授权安全测试**。

- ✅ 仅测试您拥有或已获得明确权限测试的系统
- ✅ 遵循负责任的披露实践
- ✅ 遵守适用的法律法规
- ✅ 记录所有测试活动
- ❌ 不要用于未授权访问
- ❌ 不要破坏生产系统
- ❌ 不要违反服务条款

---

## ⚠️ 注意事项

- **本地环境限制，依赖 CI/CD 自动化测试**
- 某些 CAPTCHA 系统可能有限制或 IP 阻止
- 行为分析需要足够的样本量以达到统计显著性
- 指纹识别效果因浏览器和平台而异
- 风险控制评估可能需要访问内部系统才能进行全面分析

---

## 📝 更新日志

### v0.1.0 (2026-07-26)

- ✨ 初始版本发布
- 🔍 CAPTCHA 分析能力
- 🎯 行为分析模块
- 🖥️ 设备指纹识别
- 🛡️ 风险控制评估
- 📚 完整使用指南

---

<div align="center">

**[⬆ 返回顶部](#-300-human-pass)**

Made with ❤️ by HOS Team

</div>
