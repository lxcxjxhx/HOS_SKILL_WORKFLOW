# HOS-Critic-Review（HOS 六维批判式评审）

> **AI 原生六维毒舌专家评审 Skill** — 输入任意技术对象，分钟级输出可追溯、带证据、可决策的专家级评审。

```
对象识别 → 自适应切片 → 领域分析 → 证据校验 → 多角色攻击 → 六维评分 → 报告
```

## 这是什么

一个以 **Agent Skill** 形态交付的多 Agent 批判式评审引擎：模拟领域专家（Reviewer #2 / 主程 / 安全审计 / 产品思维）对任意技术对象做高强度审查，回答的不是「它是什么」，而是**「它到底值不值得相信、投入、使用？」**。

**它不是**总结器 / 评论机器人 / 独立 CLI 工具。**它是**证据驱动的评审引擎——`No Evidence No Criticism`，每条发现挂证据链（证实/证伪/查不到），评分可复核。

## 支持的评审对象

| 类型 | 示例输入 | 分析器 |
|------|----------|--------|
| GitHub 仓库 | `facebook/react` | GitHub API 生态指标 + 代码扫描 |
| 论文 | PDF / Markdown | Semantic Scholar + 论文检查点 + PyMuPDF 解析 |
| 技术文章 / 方案 | Markdown | 文本启发式 + 泛化语义切片 |
| License | LICENSE 文件 | SPDX 识别 + copyleft 判定 |
| 数据集 | 数据说明 | 规模/来源/许可/时效检查 |

## 快速开始

### 1. 加载 Skill

在 Claude Code / Cursor / Codex / Trae 中引用本目录的 `SKILL.md`，或把整个 `S-12-HOS-Critic-Review/` 放进你的 skills 目录。智能环节（批判/评分/毒舌点评）由宿主 LLM 执行，**零外部依赖即可出报告**。

### 2. 三句话上手

```text
# 评审一个 GitHub 仓库
帮我毒舌评审一下 github.com/facebook/react，值不值得学？

# 评审一篇论文
点评 examples/fixtures/sample-paper.pdf，正经点（辣度 0）

# 评审一份方案
这份技术方案靠谱吗？往死里骂（辣度 5）
```

### 3. 脚本工具（可选增强）

```bash
npm install            # 安装 tree-sitter（代码切片增强）
pip install pymupdf    # 安装 PyMuPDF（论文 PDF 解析）
node scripts/cli.ts --help
node scripts/cli.ts run license LICENSE.txt --until analyze --events
node scripts/calibrate.ts --online    # 基准集校准
```

## 核心能力

- **七 Agent 流水线**：Discovery → Chunk → Analyzer → Evidence → Critic → Judge → Report
- **泛化切片引擎 v2**：一套语义管线适用全部对象类型，单元细化到语义块并带角色标注（claim/evidence/method/…）；tree-sitter / PyMuPDF 等工具按需注入（**干什么事调用什么工具**）
- **六维评分**：Technical / Innovation / Engineering / Ecosystem / Risk / Strategic，跨对象可比
- **独立编号体系**：`HCR-<CLASS>-YYYY-NNNN`，评审记录持久化 Review Store
- **可编程输出**：Quick / Expert / Academic 三报告模板 + 机器 JSON + 事件流（`--events`）+ MCP server

## 文档

规格见 `docs/`（01-overview 起）；版本历史见 `CHANGELOG.md`；基准集见 `benchmark/`。
