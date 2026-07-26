---
name: HOS-IP-Writing
description: "知识产权写作技能体系 — 覆盖论文、专利、软著、书籍、博客、润色六大场景的统一路由与跨技能编排"
license: MIT
metadata:
  author: HOS Team
  version: "2.0.0"
  tags: [ip-writing, paper, patent, copyright, book, blog, review, orchestration]
  category: writing-system
  risk-level: low
---

# HOS-IP-Writing：知识产权写作技能体系

> 统一路由 + 6 个子技能 + 共享上下文 + 跨技能管线。用户只需描述意图，系统自动路由到对应子技能并协调执行。

---

## 路由表

根据用户意图自动激活对应子技能：

| 用户意图 | 激活技能 | 触发词示例 | 文档 |
|---------|---------|-----------|------|
| 写学术论文 | `paper` | "写论文"、"paper writing"、"投稿 SCI/CCF" | [paper/SKILL.md](paper/SKILL.md) |
| 申请专利 | `patent` | "写专利"、"申请发明专利"、"技术交底书" | [patent/SKILL.md](patent/SKILL.md) |
| 申请软著 | `copyright` | "申请软著"、"软件著作权"、"版权登记" | [copyright/SKILL.md](copyright/SKILL.md) |
| 写技术书籍 | `book` | "写书"、"写技术书"、"写教程" | [book/SKILL.md](book/SKILL.md) |
| 写技术博客 | `blog` | "写博客"、"发 CSDN"、"写技术文章" | [blog/SKILL.md](blog/SKILL.md) |
| 润色文本 | `review` | "润色"、"去 AI 味"、"deslop" | [review/SKILL.md](review/SKILL.md) |

**路由规则**：
1. 意图明确 → 直接激活对应子技能
2. 意图模糊 → 列出匹配的子技能供用户选择
3. 意图跨多个子技能 → 激活对应管线（见下方「管线编排」）

---

## 共享上下文层

所有子技能共享统一的上下文数据结构，定义在 `shared/` 目录：

| 文件 | 作用 |
|------|------|
| [shared/context-schema.md](shared/context-schema.md) | 跨子技能信息传递协议（project / author / output 三大字段） |
| [shared/quality-gates.md](shared/quality-gates.md) | 每个子技能每个阶段的质量门禁标准 |
| [shared/output-conventions.md](shared/output-conventions.md) | 统一输出格式与文件命名规范 |
| [shared/hos-integration.md](shared/hos-integration.md) | 与 HOS 生态其他模块的集成点 |

**上下文传递机制**：
- **会话内传递**：同一对话中 AI 记住之前子技能产出的核心信息
- **文件传递**：各子技能将产出写入约定路径，后续子技能读取
- **显式摘要**：切换子技能时输出 `[IP-Context 摘要]`，确保信息不丢失

---

## 管线编排

当用户意图涉及多个子技能协作时，激活预定义管线：

| 管线 | 链路 | 适用场景 | 文档 |
|------|------|---------|------|
| 学术全流程 | paper → review → 投稿 | "写论文并润色" | [pipelines/academic-paper.md](pipelines/academic-paper.md) |
| 技术影响力 | blog → book → review | "系列文章整理成书" | [pipelines/tech-influence.md](pipelines/tech-influence.md) |
| 知识产权保护 | patent → copyright → paper | "技术创新全面保护" | [pipelines/ip-protection.md](pipelines/ip-protection.md) |
| 内容工厂 | blog(多篇) → review → book | "批量生产内容" | [pipelines/content-factory.md](pipelines/content-factory.md) |

**管线执行规则**：
1. 按链路顺序依次激活子技能
2. 每个子技能完成后，输出 `[IP-Context 摘要]` 传递给下一个
3. 每个阶段必须通过对应的质量门禁才能进入下一阶段
4. 用户可在任意阶段暂停或修改

---

## 子技能概览

### paper — 论文写作
五阶段写作流程（Brainstorm → Architecture → Draft → Integration → Compression），支持 SCI/EI/CCF/arXiv/IEEE/中文核心多类型投稿。基于 SNL-UCSB/paper-writing-skill 和 kgraph57/paper-writer-skill 二次开发。

### patent — 专利写作
支持发明专利、实用新型、外观设计三种类型，符合 CNIPA 格式规范。完整工作流：技术方案收集 → 权利要求书 → 说明书 → 摘要。含 OA 回复策略。HOS 自研。

### copyright — 软著写作
从 GitHub 仓库自动分析生成符合版权保护中心要求的申请材料。输入 Repo URL 即可产出软件说明书、源代码文档等。HOS 自研。

### book — 书籍写作
支持技术书籍、教程、博客合集等类型，提供从大纲到出版的全流程支持。HOS 自研。

### blog — 博客写作
支持 CSDN、掘金、知乎、Medium、Dev.to 多平台格式适配与 SEO 优化。HOS 自研。

### review — 文本润色
基于 skill-deslop 的 AI 写作去套路化 + 中文学术写作润色。去除填充短语、公式化结构、被动语态滥用等 AI 痕迹。

---

## 目录结构

```
07-HOS-IP-Writing/
├── SKILL.md                     # 本文件 — 统一路由与编排
├── README.md                    # 快速入门
├── ATTRIBUTION.md               # 开源来源标注
│
├── shared/                      # 共享上下文层
│   ├── context-schema.md        # 跨技能数据协议
│   ├── quality-gates.md         # 质量门禁标准
│   ├── output-conventions.md    # 输出格式约定
│   └── hos-integration.md       # HOS 生态集成点
│
├── pipelines/                   # 跨技能管线
│   ├── academic-paper.md        # 学术全流程
│   ├── tech-influence.md        # 技术影响力建设
│   ├── ip-protection.md         # 知识产权保护
│   └── content-factory.md       # 内容工厂
│
├── paper/SKILL.md               # 论文写作子技能
├── patent/SKILL.md              # 专利写作子技能
├── copyright/SKILL.md           # 软著写作子技能
├── book/SKILL.md                # 书籍写作子技能
├── blog/SKILL.md                # 博客写作子技能
└── review/SKILL.md              # 文本润色子技能
```

---

## 约束

1. **无虚构内容**：不编造数据、引用、代码、实验结果
2. **格式合规**：所有输出符合目标格式规范（见 shared/output-conventions.md）
3. **质量门禁**：每个阶段必须通过质量门禁才能进入下一阶段
4. **上下文传递**：跨子技能切换时必须输出 `[IP-Context 摘要]`
5. **开源合规**：集成部分遵循原项目许可证，自研部分 MIT License

---

## 版本信息

- **版本**：2.0.0
- **创建日期**：2026-07-21
- **最后更新**：2026-07-26
- **维护者**：HOS-IP-Writing Team
- **许可证**：MIT（自研部分）/ 遵循原项目许可证（集成部分）
