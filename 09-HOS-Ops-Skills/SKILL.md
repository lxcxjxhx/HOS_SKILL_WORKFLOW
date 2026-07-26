---
name: HOS-Ops-Skills
description: "HOS 生态运营技能集 — 9 个专用 Skill 覆盖从内容生产、社区运营到微商技术服务的全链路"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [operations, weekly-update, dev-log, release-notes, content-adapt, community, roadmap, demo, brand, micro-biz]
  category: operations
  risk-level: low
---

# HOS-Ops-Skills：HOS 生态运营技能集

> 9 个专用 Skill 覆盖内容生产、社区运营、品牌守护、微商技术服务的全链路。用户只需描述意图，系统自动路由到对应 Skill。

---

## 路由表

| 用户意图 | 激活 Skill | 触发词示例 | 文档 |
|---------|-----------|-----------|------|
| 生成周报 | `hos-weekly-update` | "周报"、"weekly update"、"本周总结" | [hos-weekly-update.md](hos-weekly-update.md) |
| 写技术日志 | `hos-dev-log` | "开发日志"、"dev log"、"技术博客" | [hos-dev-log.md](hos-dev-log.md) |
| 生成 Release Notes | `hos-release-notes` | "release notes"、"changelog"、"版本说明" | [hos-release-notes.md](hos-release-notes.md) |
| 多平台内容适配 | `hos-content-adapt` | "适配"、"多平台"、"cross-post" | [hos-content-adapt.md](hos-content-adapt.md) |
| GitHub 社区运营 | `hos-community-ops` | "Discussion"、"good first issue"、"社区" | [hos-community-ops.md](hos-community-ops.md) |
| 生成 Roadmap | `hos-roadmap-gen` | "roadmap"、"路线图"、"月度计划" | [hos-roadmap-gen.md](hos-roadmap-gen.md) |
| 生成 Demo 脚本 | `hos-demo-script` | "demo"、"演示"、"录屏"、"视频脚本" | [hos-demo-script.md](hos-demo-script.md) |
| 品牌一致性检查 | `hos-brand-guard` | "品牌"、"一致性"、"生态图" | [hos-brand-guard.md](hos-brand-guard.md) |
| 微商技术服务运营 | `hos-micro-biz` | "微商"、"接单"、"私域"、"技术服务" | [hos-micro-biz.md](hos-micro-biz.md) |

**路由规则**：
1. 意图明确 → 直接激活对应 Skill
2. 意图模糊 → 列出匹配的 Skill 供用户选择
3. 跨 Skill 意图 → 按流水线顺序依次激活

---

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

## 微商技术服务流水线

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

---

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

---

## HOS 生态品牌

```
HOS（Hyacinth Open Security）
AI Native Open Source Security Ecosystem

├── HOS-Forge        → AI Security IDE（旗舰）
├── HOS-LS           → AI Static Analysis Engine
└── HOS_SKILL_WORKFLOW → AI Workflow & Prompt Library
```

---

## 约束

1. **品牌一致性**：所有输出遵循 HOS 品牌命名规范
2. **真实性**：技术内容基于真实开发过程，不编造数据或功能
3. **多语言**：GitHub 核心内容英文，中文社区内容中文
4. **开源合规**：MIT License

---

## 版本信息

- **版本**：1.0.0
- **创建日期**：2026-07-26
- **维护者**：HOS Ops Team
- **许可证**：MIT
