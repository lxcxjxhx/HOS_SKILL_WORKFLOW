<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/AI_IDE-Compatible-green?style=for-the-badge" alt="AI IDE Compatible"/>
</p>

<h1 align="center">🎬 HOS-Content-Engine</h1>
<p align="center"><b>AI 安全实验室内容引擎 — 从安全洞察到全平台内容资产的全自动生产线</b></p>

---

## 📋 目录
- [简介](#-简介)
- [安装](#-安装)
- [使用](#-使用)
- [配置](#-配置)
- [示例](#-示例)
- [架构](#-架构)
- [许可证](#-许可证)

## 📖 简介

**HOS-Content-Engine**（09号技能）是 HOS 技能体系中的 **内容生产中枢**。它将安全研究、技术洞察转化为多平台、多格式的内容资产，包括：

- B站视频脚本（分镜级精度，10 分钟标准结构）
- 多平台博客文章（CSDN / 掘金 / 知乎）
- GitHub 开源仓库（README + 代码 + Demo）
- PPT / 音频 / 视频资产（通过 06-HOS-Fuck-Demo）

### 4D 内容模型

内容生产分为四个阶段，形成闭环：

| 阶段 | 名称 | 做什么 | 输出 |
|------|------|--------|------|
| D1 | **Discover** | 挖掘选题、分析趋势、定义受众 | 选题报告 + 核心洞察 |
| D2 | **Dissect** | 深度分析、安全审计、技术拆解 | 分析报告 + 漏洞详情 |
| D3 | **Develop** | 开发工具、编写代码、构建 Demo | 技术方案 + 代码 + Demo |
| D4 | **Document** | 多格式输出、平台适配、资产编排 | 视频脚本 + 博客 + 仓库 |

D4 发布后的反馈回流至 D1，驱动下一轮选题优化。

### 六大内容支柱

| 支柱 | 说明 | 发布频率 |
|------|------|----------|
| 漏洞复现 | CVE 分析 + PoC 开发 + 复现教程 | 2 次/月 |
| 工具开发 | 安全工具设计 + 开发 + 推广 | 2 次/月 |
| 攻防实战 | 渗透测试 + 靶场实战 + 攻击链分析 | 1 次/月 |
| 安全科普 | 概念解读 + 案例分析 + 入门教程 | 4 次/月 |
| 代码审计 | 源码分析 + 漏洞模式 + 审计方法论 | 2 次/月 |
| 行业观察 | 趋势分析 + 数据报告 + 观点输出 | 4 次/月 |

## 🚀 安装

### Claude Code

```bash
claude install /path/to/09-HOS-Content-Engine
```

### TRAE

在 TRAE 中打开技能目录，选择 `09-HOS-Content-Engine` 进行安装。

### Cursor

在 Cursor 设置中添加技能路径，指向 `09-HOS-Content-Engine` 目录。

## 💡 使用

### 触发词

- `发现安全选题` → 启动 D1 选题调研
- `深度分析这个漏洞` → 启动 D2 漏洞分析
- `编写PoC代码` → 启动 D3 工具开发
- `生成B站视频脚本` → 启动 D4 视频脚本生成
- `生成配套博客文章` → 启动 D4 博客生成
- `多格式输出` → 启动 D4 全格式输出

### 输出目录结构

所有内容输出到统一目录：

```
output/
├── discover/{project-id}/       # D1 选题报告
├── dissect/{project-id}/        # D2 分析报告
├── develop/{project-id}/        # D3 技术方案 + 代码
└── document/{project-id}/       # D4 多格式输出
    ├── bilibili-script.md       # B站分镜脚本
    ├── bilibili-metadata.md     # B站元数据
    ├── thumbnail-brief.md       # 封面图简报
    ├── blog/                    # 博客文章
    │   ├── csdn.md
    │   ├── juejin.md
    │   └── zhihu.md
    ├── assets/                  # Demo 资产
    │   ├── ppt.json
    │   ├── audio-script.md
    │   └── video-spec.md
    └── repo/                    # GitHub 仓库
        ├── README.md
        ├── LICENSE
        └── .gitignore
```

## ⚙️ 配置

### 外部技能集成

| 技能 | 用途 | 调用时机 |
|------|------|----------|
| 06-HOS-Fuck-Demo | PPT / 音频 / 视频资产生成 | D4 需要 Demo 资产时 |
| 07-HOS-IP-Writing/blog | 多平台博客文章生成 | D4 需要博客时 |
| 00-HOS-Sec-Engine | 安全审计引擎 | D2 需要代码审计时 |

## 📝 示例

### 场景 1：从选题到视频

```
输入：发现安全选题
      ↓
D1 自动调研 → D2 深度分析 → D3 方案开发 → D4 生成脚本
      ↓
输出：B站视频脚本 + 元数据 + 封面简报
```

**触发词**：`发现安全选题` → `生成B站视频脚本`

### 场景 2：漏洞复现全流程

```
输入：CVE-2026-XXXX
      ↓
D1 选题评估 → D2 漏洞分析 → D3 PoC开发 → D4 全格式输出
      ↓
输出：视频脚本 + 博客 + PoC GitHub仓库
```

**触发词**：`深度分析这个漏洞` → `编写PoC代码` → `多格式输出`

### 场景 3：安全科普快速产出

```
输入：安全科普方向
      ↓
D1 选题 → D4 直接生成（D2/D3 轻量参与）
      ↓
输出：视频脚本 + 科普博客
```

**触发词**：`分析安全趋势` → `生成B站视频脚本` + `生成配套博客文章`

## 🏗️ 架构

```
09-HOS-Content-Engine/
├── README.md                    # 本文件
├── SKILL.md                     # 技能定义
├── discover/                    # D1 选题调研模块
├── dissect/                     # D2 深度分析模块
├── develop/                     # D3 工具开发模块
└── document/                    # D4 多格式输出模块
```

## 📄 许可证

MIT

---

<p align="center">
  <b>版本</b>: 1.0.0 | <b>日期</b>: 2026-07-26 | <b>作者</b>: HOS
</p>
