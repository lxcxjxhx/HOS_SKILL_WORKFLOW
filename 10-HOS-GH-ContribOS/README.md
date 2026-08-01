# HOS-GH-ContribOS

**GitHub 贡献操作系统** — 一个统一框架，覆盖从项目创建到 PR 合并的完整开源贡献生命周期。内置两个核心引擎、六个角色视图、一套经验循环 + 场景记忆。

## 快速开始

- **主入口**：[SKILL.md](SKILL.md) — 架构总览、角色视图、双模式运行、典型使用场景。
- **引擎一 CI/CD**：[engines/ci-cd-intelligence.md](engines/ci-cd-intelligence.md) — Workflow AST、安全审查、CI 调试与自动修复。
- **引擎二 贡献**：[engines/contribution-intelligence.md](engines/contribution-intelligence.md) — 项目评估、源码分析、PR 规范、审核者视角自检门、跟进策略。
- **模板**：[templates/](templates/) — 自检门工作底稿、PR 描述模板（含 AI Disclosure）、维护者沟通模板。
- **经验**：[experience/](experience/) — 经验循环与场景记忆协议、失败模式库与案例。
- **记忆**：[memory/](memory/) — 场景记忆协议（实际记录存用户本地）。

## 核心承诺

1. **审核者视角自检门**：提交 PR 前必须通过 G1–G5 五道强制闸门，任一红灯即返回源码分析。
2. **AI 诚实披露**：每次 PR 标注"skill 协助撰写 + 人工逐条审核"，避免"纯 AI PR"标签。
3. **场景记忆**：skill 从每个真实 PR 场景自动学习，无需等待被批评才改进。

## 版本

v3.1.0（2026-08-01）— 新增审核者视角自检门、场景记忆协议、失败模式第 7 类、AI 披露强制规范。
