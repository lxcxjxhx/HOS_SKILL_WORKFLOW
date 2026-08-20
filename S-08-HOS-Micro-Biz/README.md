# HOS Operations Skill Suite

> HOS（Hyacinth Open Security）生态运营工具集 — 9 个专用 Skill 覆盖从内容生产、社区运营到微商技术服务的全链路。

## Skill 总览

| Skill | 定位 | 触发关键词 | 输出目录 |
|-------|------|-----------|---------|
| **hos-weekly-update** | 周报自动生成 | 周报、weekly update、本周总结 | `output/weekly/` |
| **hos-dev-log** | 技术日志写作 | 开发日志、dev log、技术博客 | `output/devlog/` |
| **hos-release-notes** | Release Notes 生成 | release notes、发版、changelog | `output/releases/` |
| **hos-content-adapt** | 多平台内容适配 | 适配、改写、多平台、cross-post | `output/adapted/` |
| **hos-community-ops** | GitHub 社区运营 | Discussion、good first issue、社区 | `output/community/` |
| **hos-roadmap-gen** | 月度 Roadmap 生成 | roadmap、路线图、月度计划 | `output/roadmap/` |
| **hos-demo-script** | Demo 视频脚本 | demo、演示、录屏、GIF | `output/demos/` |
| **hos-brand-guard** | 品牌一致性守护 | 品牌、一致性、生态图、命名 | `output/brand/` |
| **hos-micro-biz** | 微商技术服务运营 | 微商、接单、私域、闲鱼、技术服务 | `output/micro-biz/` |

## 内容生产流水线

```
开发 → commit → PR → merge
                ↓
    hos-weekly-update（周报）
    hos-dev-log（技术日志）
    hos-release-notes（版本说明）
                ↓
    hos-content-adapt（多平台适配）
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
  CSDN       Dev.to      X/Twitter
  FreeBuf    Medium      Reddit/HN
  Bilibili   YouTube     LinkedIn
                ↓
    hos-demo-script（视频脚本 + GIF）
```

## 社区运营流水线

```
hos-roadmap-gen（月度规划）
        ↓
hos-community-ops（Discussion + Issue 运营）
        ↓
hos-brand-guard（品牌一致性检查）
        ↓
持续活跃 → 新贡献者 → 下一轮开发
```

## 微商技术服务运营流水线

```
hos-micro-biz（服务设计 + 定价 + 获客文案）
        ↓
┌───────┼───────┐
↓       ↓       ↓
朋友圈  闲鱼   小红书/社群
        ↓
  客户咨询 → 需求确认 → 报价 → 交付
        ↓
  hos-content-adapt（案例包装 → 多平台分发）
```

## 推荐使用节奏

| 频率 | Skill | 说明 |
|------|-------|------|
| **每周** | hos-weekly-update | 周一生成上周周报，发布到 GitHub Discussions |
| **每周** | hos-dev-log | 至少 1 篇技术日志，同步到 CSDN + Dev.to |
| **每次发版** | hos-release-notes | 生成 Release Notes + Discussion Post + 社交线程 |
| **每次发版** | hos-demo-script | 录制 3 分钟 Demo，截取 README GIF |
| **每篇内容** | hos-content-adapt | 一次创作，多平台分发 |
| **每月** | hos-roadmap-gen | 生成月度 Roadmap + 上月回顾 |
| **每月** | hos-community-ops | 创建 good first issue、更新 Discussion |
| **每季度** | hos-brand-guard | 全面品牌一致性检查 |
| **持续** | hos-micro-biz | 微商技术服务接单、获客、交付全流程 |

## 覆盖的传播矩阵

| 层级 | 平台 | 对应 Skill |
|------|------|-----------|
| GitHub 核心 | Repo / Release / Discussion | weekly-update, release-notes, community-ops |
| 中文开发者 | CSDN / 博客园 / 掘金 | dev-log, content-adapt |
| 安全社区 | FreeBuf / 看雪 / 先知 | dev-log, content-adapt |
| 国际开发者 | Dev.to / Medium | dev-log, content-adapt |
| 国际曝光 | Reddit / Hacker News | content-adapt |
| 社交平台 | X/Twitter / LinkedIn | content-adapt |
| 视频平台 | Bilibili / YouTube | demo-script, content-adapt |
| AI 生态 | HuggingFace / ModelScope | content-adapt |
| 微商/私域 | 微信朋友圈 / 社群 / 闲鱼 / 小红书 | micro-biz, content-adapt |

## 目录结构

```
hos-skills/
├── README.md                    ← 本文件
├── hos-weekly-update.md
├── hos-dev-log.md
├── hos-release-notes.md
├── hos-content-adapt.md
├── hos-community-ops.md
├── hos-roadmap-gen.md
├── hos-demo-script.md
├── hos-brand-guard.md
├── hos-micro-biz.md             ← 微商技术服务运营
└── output/
    ├── weekly/                  ← 周报输出
    ├── devlog/                  ← 技术日志输出
    ├── releases/                ← Release Notes 输出
    ├── adapted/                 ← 多平台适配输出
    ├── community/               ← 社区运营内容输出
    ├── roadmap/                 ← Roadmap 输出
    ├── demos/                   ← 视频脚本输出
    ├── brand/                   ← 品牌检查报告输出
    └── micro-biz/               ← 微商技术服务输出
        ├── catalog/             ← 服务目录和定价
        ├── marketing/           ← 获客文案
        ├── templates/           ← 沟通模板和 SOP
        ├── orders/              ← 订单和财务模板
        ├── compliance/          ← 合规风控（红线/风险防控/决策流/退款）
        └── design/              ← 对外获客可视化素材
            ├── design-system/   ← 视觉系统基线（token/字体/prompt 模板/样板图）
            ├── pdp/             ← 详情页 KV + 八模块 HTML 长图
            ├── main-and-posters/← 主图/海报/引流图
            ├── landing-pages/   ← 精装 H5 落地页
            ├── cases/           ← 案例展示信任外壳页
            └── packs/           ← 全套素材包（pack 内仅存私域配图）
```

## 仓库路径配置

所有 Skill 默认使用以下仓库路径：

| 项目 | 路径 |
|------|------|
| HOS-Forge | `c:\1AAA-PROJECT\HOS\HOS-Forge` |
| HOS-LS | `c:\1AAA-PROJECT\HOS\HOS-LS` |
| HOS_SKILL_WORKFLOW | `c:\1AAA-PROJECT\WORKFLOW` |

如路径变更，更新各 Skill 文件中的"仓库路径"部分即可。
