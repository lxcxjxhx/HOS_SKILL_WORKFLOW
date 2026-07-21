# HOS-IP-Writing：知识产权写作技能体系

> 一套完整的知识产权写作系统，覆盖论文、专利、软著、书籍、博客、润色六大场景。

---

## 一、技能体系总览

```
┌─────────────────────────────────────────────────────────────┐
│                    HOS-IP-Writing                           │
│              知识产权写作技能体系                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  paper   │  │  patent  │  │ copyright│  │   book   │   │
│  │ 论文写作 │  │ 专利写作 │  │ 软著写作 │  │ 书籍写作 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐                                │
│  │   blog   │  │  review  │                                │
│  │ 博客写作 │  │ 文本润色 │                                │
│  └──────────┘  └──────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、子技能说明

### 2.1 论文写作（paper）

**来源**：集成开源项目二次开发
- [SNL-UCSB/paper-writing-skill](https://github.com/SNL-UCSB/paper-writing-skill) - 系统网络实验室的论文写作方法论
- [kgraph57/paper-writer-skill](https://github.com/kgraph57/paper-writer-skill) - 全流程论文项目管理

**核心能力**：
- 五阶段写作流程（Brainstorm → Architecture → Draft → Integration → Compression）
- 多投稿类型适配（SCI/EI/CCF/arXiv/IEEE/中文核心）
- 项目目录管理（IMRAD 格式、文献矩阵、质量检查清单）
- 中文学术写作支持

**详细文档**：[paper/SKILL.md](paper/SKILL.md)

---

### 2.2 专利写作（patent）

**来源**：完全自研

**核心能力**：
- 三种专利类型支持（发明专利、实用新型、外观设计）
- 符合中国国家知识产权局（CNIPA）格式要求
- 完整工作流：技术方案收集 → 专利类型确认 → 技术交底书 → 权利要求书 → 说明书 → 摘要 → 附图说明 → 审核
- OA（审查意见通知书）回复策略

**详细文档**：[patent/SKILL.md](patent/SKILL.md)

---

### 2.3 软著写作（copyright）

**来源**：完全自研

**核心能力**：
- 自动从 GitHub 仓库生成符合中国版权保护中心要求的文档
- 输入支持：GitHub Repo URL、README、代码、截图
- 输出文档：软件名称、功能描述、环境信息、模块设计、算法说明、数据库设计、流程图、截图、创新点、申请材料

**详细文档**：[copyright/SKILL.md](copyright/SKILL.md)

---

### 2.4 书籍写作（book）

**来源**：完全自研

**核心能力**：
- 多类型书籍支持（技术书籍、教程、博客合集、系列教程）
- TOC 自动生成（Part → Chapter → Section）
- 章节撰写（理论 + 代码示例 + 练习题 + 插图描述）
- 出版流程指导（传统出版 + 自出版 + 混合模式）

**详细文档**：[book/SKILL.md](book/SKILL.md)

---

### 2.5 博客写作（blog）

**来源**：完全自研

**核心能力**：
- 多平台支持（CSDN、掘金、知乎、Medium、Dev.to）
- 平台特定格式适配
- SEO 优化建议
- 模板系统（普通博文、技术教程、案例研究）

**详细文档**：[blog/SKILL.md](blog/SKILL.md)

---

### 2.6 文本润色（review）

**来源**：集成开源项目二次开发
- [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop) - 去除 AI 写作痕迹

**核心能力**：
- 消除 AI 写作模式（填充短语、公式化结构、被动语态滥用等）
- 中文学术写作润色支持
- 引用格式规范化
- 语言风格统一

**详细文档**：[review/SKILL.md](review/SKILL.md)

---

## 三、使用指南

### 3.1 触发条件

当用户输入匹配以下任意场景时，自动激活对应子技能：

| 场景 | 激活技能 | 触发词示例 |
|------|----------|------------|
| 写论文 | paper | "写论文"、"paper writing"、"投稿 SCI" |
| 写专利 | patent | "写专利"、"申请发明专利"、"技术交底书" |
| 申请软著 | copyright | "申请软著"、"软件著作权"、"版权登记" |
| 写书 | book | "写书"、"写技术书"、"写教程" |
| 写博客 | blog | "写博客"、"发 CSDN"、"写技术文章" |
| 润色文本 | review | "润色"、"去 AI 痕迹"、"deslop" |

### 3.2 技能组合使用

**场景 1：论文全流程**
```
论文写作（paper） → 文本润色（review） → 投稿
```

**场景 2：技术影响力建设**
```
博客写作（blog） → 整理成书籍（book） → 出版
```

**场景 3：知识产权保护**
```
技术创新 → 申请专利（patent） → 申请软著（copyright） → 发表论文（paper）
```

### 3.3 文件结构

```
07-HOS-IP-Writing/
├── SKILL.md                    # 本文件 - 技能体系总览
├── README.md                   # 快速入门指南
├── ATTRIBUTION.md              # 开源来源标注
│
├── paper/                      # 论文写作技能
│   ├── SKILL.md
│   ├── templates/
│   └── workflows/
│
├── patent/                     # 专利写作技能
│   ├── SKILL.md
│   ├── templates/
│   └── workflows/
│
├── copyright/                  # 软著写作技能
│   ├── SKILL.md
│   ├── templates/
│   └── workflows/
│
├── book/                       # 书籍写作技能
│   ├── SKILL.md
│   ├── templates/
│   └── workflows/
│
├── blog/                       # 博客写作技能
│   ├── SKILL.md
│   ├── templates/
│   └── workflows/
│
└── review/                     # 文本润色技能
    ├── SKILL.md
    ├── templates/
    └── workflows/
```

---

## 四、开源声明

本技能体系部分功能基于开源项目二次开发，我们尊重并感谢原开源社区的贡献：

- **论文写作**：基于 SNL-UCSB/paper-writing-skill（MIT License）和 kgraph57/paper-writer-skill 二次开发
- **文本润色**：基于 stephenturner/skill-deslop 二次开发
- **专利/软著/书籍/博客写作**：完全自研

详细开源来源标注见 [ATTRIBUTION.md](ATTRIBUTION.md)

---

## 五、版本信息

- **版本**：1.0.0
- **创建日期**：2026-07-21
- **最后更新**：2026-07-21
- **维护者**：HOS-IP-Writing Team
- **许可证**：MIT（自研部分）/ 遵循原项目许可证（集成部分）

---

## 六、贡献指南

欢迎提交 Issue 和 Pull Request 来改进这些技能：

- 报告问题：描述使用场景和遇到的问题
- 功能建议：说明使用场景和期望行为
- 模板改进：提交更完善的模板文件
- 工作流优化：分享更好的工作流程设计

---

## 七、参考文献

### 集成项目
- [SNL-UCSB/paper-writing-skill](https://github.com/SNL-UCSB/paper-writing-skill)
- [kgraph57/paper-writer-skill](https://github.com/kgraph57/paper-writer-skill)
- [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop)

### 自研参考
- 中国国家知识产权局专利撰写规范
- 中国版权保护中心软件著作权登记指南
- 技术写作最佳实践
- 学术写作方法论
