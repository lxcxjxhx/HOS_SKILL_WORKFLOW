# HOS-IP-Writing：知识产权写作技能体系

一套完整的知识产权写作系统，覆盖论文、专利、软著、书籍、博客、润色六大场景。

## 快速开始

### 1. 选择你需要的技能

| 你想做什么？ | 使用技能 | 文档链接 |
|-------------|---------|----------|
| 写学术论文 | paper | [查看文档](paper/SKILL.md) |
| 申请专利 | patent | [查看文档](patent/SKILL.md) |
| 申请软件著作权 | copyright | [查看文档](copyright/SKILL.md) |
| 写技术书籍 | book | [查看文档](book/SKILL.md) |
| 写技术博客 | blog | [查看文档](blog/SKILL.md) |
| 润色文本 | review | [查看文档](review/SKILL.md) |

### 2. 使用示例

#### 写论文
```
帮我写一篇关于 LLM 安全的论文，准备投稿 CCF A 类会议
```

#### 申请专利
```
我有一个关于代码混淆的技术方案，帮我写发明专利申请
```

#### 申请软著
```
帮我为这个 GitHub 仓库申请软件著作权：https://github.com/username/repo
```

#### 写书
```
帮我写一本关于 Python 异步编程的技术书籍
```

#### 写博客
```
帮我写一篇关于 RAG 优化的技术博客，准备发 CSDN
```

#### 润色文本
```
帮我润色这段文字，去除 AI 写作痕迹
```

## 技能体系架构

```
HOS-IP-Writing
├── paper      - 论文写作（集成 + 二开）
├── patent     - 专利写作（自研）
├── copyright  - 软著写作（自研）
├── book       - 书籍写作（自研）
├── blog       - 博客写作（自研）
└── review     - 文本润色（集成 + 二开）
```

## 开源声明

本技能体系部分功能基于开源项目二次开发：

- **论文写作**：基于 [SNL-UCSB/paper-writing-skill](https://github.com/SNL-UCSB/paper-writing-skill)（MIT License）和 [kgraph57/paper-writer-skill](https://github.com/kgraph57/paper-writer-skill) 二次开发
- **文本润色**：基于 [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop) 二次开发
- **专利/软著/书籍/博客写作**：完全自研

详细开源来源标注见 [ATTRIBUTION.md](ATTRIBUTION.md)

## 文档导航

- [技能体系总览](SKILL.md) - 完整的技能体系说明
- [开源来源标注](ATTRIBUTION.md) - 集成项目的详细信息
- 各子技能文档：
  - [论文写作](paper/SKILL.md)
  - [专利写作](patent/SKILL.md)
  - [软著写作](copyright/SKILL.md)
  - [书籍写作](book/SKILL.md)
  - [博客写作](blog/SKILL.md)
  - [文本润色](review/SKILL.md)

## 版本信息

- **版本**：1.0.0
- **创建日期**：2026-07-21
- **维护者**：HOS-IP-Writing Team

## 许可证

- 自研部分：MIT License
- 集成部分：遵循原项目许可证
