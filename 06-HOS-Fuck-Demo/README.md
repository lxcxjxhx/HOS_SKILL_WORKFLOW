<p align="center">
  <img src="https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/License-HOS_Internal-orange?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/AI_IDE-Compatible-green?style=for-the-badge" alt="AI IDE Compatible"/>
</p>

<h1 align="center">🎬 HOS-Fuck-Demo</h1>
<p align="center"><b>AI 内容工业流水线 — 一条指令，全自动输出内容包+PPT+音频+视频+项目注册</b></p>

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

HOS-Fuck-Demo 是一个 **AI 行为 Skill**：加载到 Claude Code / TRAE 后，AI 获得"全自动内容流水线"的执行能力。

**核心特性：**

- **自动执行** — 一条指令跑完所有 STEP，不中断不询问
- **6 种模式** — create / demo / mvp / batch / manage / status
- **质量门禁** — 每 STEP 自动验证，不满足自动重试
- **自动注册** — 项目自动写入 registry，目录自动创建
- **视频优先** — MVP 模式可输出 5/10 分钟介绍视频规格

## 🚀 安装

### 方式 1：直接加载（推荐）

将 `SKILL.md` 文件放置到你的项目根目录或 AI IDE 的技能目录中：

```bash
# Claude Code
cp SKILL.md ~/.claude/skills/

# TRAE
cp SKILL.md .trae/skills/

# Cursor
cp SKILL.md .cursor/skills/
```

### 方式 2：完整部署

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd HOS_SKILL_WORKFLOW/06-HOS-Fuck-Demo
```

## 💡 使用

### 快速入门

```bash
# 生成完整内容（内容包 + PPT + 音频）
create 方向=AI安全意识 depth=L2 style=academic

# Demo 全栈生成（内容 + PPT + 音频 + 视频规格 + 仓库）
demo 方向=RBAC权限系统 project=rbac-demo

# MVP 介绍视频（视频优先，5分钟快速版）
mvp 方向=AI安全 intro duration=5

# 批量生产
batch 方向=AI副业 count=3 depth=L1 style=hype

# 项目操作
manage new project=AI安全入门课 type=course depth=L2

# 状态查询
status
```

### 模式说明

| 模式 | 触发 | 输出 | 适用场景 |
|------|------|------|---------|
| **create** | `create 方向=X depth=Y` | 内容包+PPT+音频 | 标准内容生产 |
| **demo** | `demo 方向=X project=Y` | 全栈（含视频+仓库） | 技术演示、Demo |
| **mvp** | `mvp 方向=X duration=5\|10` | 视频规格优先 | MVP 介绍视频 |
| **batch** | `batch 方向=X count=N` | 批量内容包+音频 | 批量生产 |
| **manage** | `manage new/status/show` | 项目注册/状态管理 | 项目管理 |
| **status** | `status` | 仪表板 | 全局状态 |

### 三层输出深度

| 级别 | 输出 | 适用场景 |
|------|------|---------|
| **L1** | 内容包（6观点） + 10分钟音频稿（4幕~2000字） | 批量课程 / 播客 |
| **L2** | L1 + PPT 12页（时间轴对齐600秒） | 知识付费课件 / 培训视频 |
| **L3** | L2 + 10分钟视频合成规格 + 仓库结构 | 完整 Demo / 视频发布 |

**demo 模式** = L3 同等（全栈）  
**mvp 模式** = L2 视频优先（可 5/10 分钟）

### 输出目录

```
output/{project-id}/
├── 01_content/{project-id}-content.md      ← 内容包
├── 02_ppt/{project-id}-slide.json          ← PPT 数据
├── 03_audio/{project-id}-script.txt        ← 音频稿
├── 04_video/{project-id}-render-spec.json  ← 视频规格
└── README.md
```

## ⚙️ 配置

### 环境要求

- Python 3.8+（用于 TTS 和 ffmpeg 集成）
- Node.js 16+（用于 PPT 生成）
- ffmpeg（用于视频合成）

### 配置文件

| 文件 | 用途 |
|------|------|
| `config/ide-capabilities.md` | IDE 能力映射 |
| `config/api-gateway.md` | TTS/PPT/ffmpeg 接口 |
| `config/levels-config.md` | L1/L2/L3 定义 |
| `config/tts-presets.md` | TTS 语音预设 |

## 📝 示例

### 示例 1：生成 AI 安全意识课程

```bash
create 方向=AI安全意识 depth=L2 style=academic
```

输出：
- 内容包：6 个核心观点，600-800 tokens
- PPT：12 页，时间轴对齐 600 秒
- 音频稿：4 幕，1800-2200 字

### 示例 2：生成 RBAC 权限系统 Demo

```bash
demo 方向=RBAC权限系统 project=rbac-demo
```

输出：
- 完整 L3 输出
- 视频合成规格
- 项目仓库结构

### 示例 3：批量生成 AI 副业内容

```bash
batch 方向=AI副业 count=3 depth=L1 style=hype
```

输出：
- 3 套内容包
- 3 套音频稿
- 批量汇总报告

## 🏗️ 架构

```
HOS-Fuck-Demo/
│
├── SKILL.md                    ← 入口（加载此文件激活 Skill v3.0）
├── README.md                   ← 本文档
│
├── skill/
│   ├── auto-pipeline.md        ← 🔄 自动执行引擎（核心）
│   ├── core.flow.md            ← STEP1~7 + 质量门禁
│   ├── pipeline.md             ← 流水线编排
│   ├── templates/              ← 内容/PPT/音频/视频槽位模板
│   ├── levels/                 ← L1/L2/L3 级别指南
│   └── injectors/              ← 情绪引擎 + 风格预设
│
├── management/
│   ├── auto-register.md        ← 🔄 自动注册流程
│   ├── PROJECT-MANAGER.md      ← 项目管理器
│   ├── registry/               ← 项目注册表
│   ├── workflows/              ← 标准工作流
│   └── templates/              ← 章程/计划/日志模板
│
├── config/
│   ├── ide-capabilities.md     ← IDE 能力映射
│   ├── api-gateway.md          ← TTS/PPT/ffmpeg 接口
│   ├── levels-config.md        ← L1/L2/L3 定义
│   └── tts-presets.md          ← TTS 语音预设
│
└── output/                     ← AI 输出目录（自动生成）
```

## 🎯 设计原则

1. **自动优先** — 不中断、不确认、不手动推进
2. **质量内建** — 每 STEP quality gate，不满足自动重试
3. **IDE 委派** — 文件IO/git/Bash 直接调用，Skill 是薄层
4. **填槽不创作** — 模板 + 槽位，不自由发挥
5. **10分钟标准** — 所有视频/音频统一 600 秒
6. **管理自动** — 项目自动注册，无需手动维护

## 📄 许可证

HOS Internal

---

<p align="center">
  <b>HOS-Fuck-Demo</b> — 让 AI 成为你的内容工厂
</p>
