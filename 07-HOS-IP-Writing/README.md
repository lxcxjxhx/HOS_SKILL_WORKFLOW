# HOS-IP-Writing：知识产权写作技能体系

覆盖论文、专利、软著、书籍、博客、润色六大场景的知识产权写作系统。

## 快速开始

### 选择你需要的技能

| 你想做什么？ | 使用技能 | 文档 |
|-------------|---------|------|
| 写学术论文 | paper | [查看文档](paper/SKILL.md) |
| 申请专利 | patent | [查看文档](patent/SKILL.md) |
| 申请软件著作权 | copyright | [查看文档](copyright/SKILL.md) |
| 写技术书籍 | book | [查看文档](book/SKILL.md) |
| 写技术博客 | blog | [查看文档](blog/SKILL.md) |
| 润色文本/去 AI 味 | review | [查看文档](review/SKILL.md) |

### 使用示例

```
# 论文
帮我写一篇关于 LLM 安全的论文，准备投稿 CCF A 类会议

# 专利
我有一个关于代码混淆的技术方案，帮我写发明专利申请

# 软著
帮我为这个 GitHub 仓库申请软件著作权：https://github.com/username/repo

# 博客
帮我写一篇关于 RAG 优化的技术博客，准备发 CSDN

# 润色
帮我润色这段文字，去除 AI 写作痕迹
```

## v2.0 新特性

- **统一路由**：主 SKILL.md 作为入口，根据用户意图自动路由到对应子技能
- **共享上下文层**：跨子技能信息传递协议（`shared/context-schema.md`）
- **质量门禁**：每个执行阶段都有明确的验收标准（`shared/quality-gates.md`）
- **跨技能管线**：预定义 4 条管线覆盖常见多技能协作场景
- **HOS 生态集成**：与 Sec-Engine、Fuck-Demo、Silly-Mock、Vibe-Guard 等模块的集成点

## 架构

```
07-HOS-IP-Writing/
├── SKILL.md              # 统一路由与编排入口
├── shared/               # 共享上下文层（数据协议/质量门禁/输出约定/生态集成）
├── pipelines/            # 跨技能管线（学术/影响力/知识产权/内容工厂）
├── paper/SKILL.md        # 论文写作（集成+二开）
├── patent/SKILL.md       # 专利写作（自研）
├── copyright/SKILL.md    # 软著写作（自研）
├── book/SKILL.md         # 书籍写作（自研）
├── blog/SKILL.md         # 博客写作（自研）
└── review/SKILL.md       # 文本润色（集成+二开）
```

## 跨技能管线

| 管线 | 链路 | 适用场景 |
|------|------|---------|
| 学术全流程 | paper → review → 投稿 | 写论文并润色 |
| 技术影响力 | blog → book → review | 系列文章整理成书 |
| 知识产权保护 | patent → copyright → paper | 技术创新全面保护 |
| 内容工厂 | blog(多篇) → review → book | 批量生产内容 |

## 开源声明

本技能体系部分功能基于开源项目二次开发：

- **论文写作**：基于 [SNL-UCSB/paper-writing-skill](https://github.com/SNL-UCSB/paper-writing-skill)（MIT）和 [kgraph57/paper-writer-skill](https://github.com/kgraph57/paper-writer-skill) 二次开发
- **文本润色**：基于 [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop) 二次开发
- **专利/软著/书籍/博客写作**：完全自研

详细开源来源标注见 [ATTRIBUTION.md](ATTRIBUTION.md)

## 文档导航

- [技能体系总览](SKILL.md) — 路由表、管线编排、约束
- [开源来源标注](ATTRIBUTION.md) — 集成项目详细信息
- [共享上下文协议](shared/context-schema.md) — 跨技能数据传递
- [质量门禁标准](shared/quality-gates.md) — 各阶段验收标准

## 版本信息

- **版本**：2.0.0
- **创建日期**：2026-07-21
- **最后更新**：2026-07-26
- **维护者**：HOS-IP-Writing Team
- **许可证**：MIT（自研部分）/ 遵循原项目许可证（集成部分）
