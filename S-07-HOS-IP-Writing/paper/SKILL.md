---
name: HOS-Paper-Writing
description: "学术论文写作系统 — 五阶段写作流程 + IMRAD 格式 + 多投稿类型适配"
license: MIT
metadata:
  author: HOS Team
  version: "2.0.0"
  tags: [paper-writing, academic-writing, IMRAD, SCI, EI, CCF, arXiv, IEEE]
  category: academic
  risk-level: low
sources:
  - name: SNL-UCSB/paper-writing-skill
    license: MIT
    url: https://github.com/SNL-UCSB/paper-writing-skill
    contribution: "五阶段写作流程（Brainstorm → Architecture → Draft → Integration → Compression）、编辑原则、声音规则"
  - name: kgraph57/paper-writer-skill
    license: MIT
    url: https://github.com/kgraph57/paper-writer-skill
    contribution: "完整论文项目管理、IMRAD 格式规范、文献管理、质量检查清单"
  - note: "HOS 二次开发：添加中文支持、多投稿类型适配、审稿回复工作流、共享上下文集成、质量门禁"
---

# 学术论文写作系统

> 将论文写作从「混乱的线性过程」转化为「可控的五阶段迭代系统」。

---

## 触发条件

| 触发场景 | 示例表达 |
|---------|---------|
| 开始写论文 | "写一篇论文"、"准备投稿 XX 会议/期刊" |
| 论文结构规划 | "论文大纲"、"IMRAD 格式" |
| 论文章节撰写 | "写 Introduction"、"帮我写 Methods" |
| 论文优化 | "压缩论文篇幅"、"改善论文逻辑" |
| 审稿回复 | "回复 reviewer"、"rebuttal" |
| 文献管理 | "整理参考文献"、"related work" |
| 投稿选择 | "投哪个会议"、"SCI vs EI" |

**不触发**：非论文类写作（博客 → `blog`，书籍 → `book`，专利 → `patent`）。

---

## 执行流程

### Stage 1: Brainstorm（头脑风暴）

**目标**：明确研究问题、贡献点、目标读者。

**操作步骤**：
1. 引导用户用一句话描述研究问题
2. 追问：你的方法与现有方法有什么不同？
3. 追问：读者读完论文后应该记住什么？
4. 整理为结构化 Brainstorm 文档
5. 确认目标投稿类型 → 加载对应配置

**质量门禁**：研究问题可用一句话表述；贡献点 3-5 个；目标投稿类型已确定。

### Stage 2: Architecture（架构设计）

**目标**：设计论文整体结构与各章节逻辑链。

**操作步骤**：
1. 基于 Brainstorm 产出生成 IMRAD 大纲
2. 为每个章节写出 2-3 句要点摘要
3. 设计图表清单（图 X：展示 XX 对比）
4. 检查逻辑链：Introduction 的 gap → Methods 的方案 → Results 的验证 → Discussion 的解读
5. 根据投稿类型调整篇幅分配

**质量门禁**：大纲覆盖 IMRAD 所有章节；逻辑链完整（gap → method → result → interpretation）。

### Stage 3: Draft（初稿撰写）

**目标**：完成各章节初稿。

**操作步骤**：
1. 按顺序撰写：Methods → Results → Discussion → Introduction → Conclusion → Abstract
2. 每个段落遵循：主题句 → 支撑证据 → 小结/过渡
3. Methods 要足够详细让他人复现
4. Results 只陈述事实，不做解读
5. Discussion 解读结果含义，与 Related Work 对比
6. Introduction 按"漏斗结构"：大背景 → 具体问题 → 现有不足 → 你的贡献
7. Abstract 最后写：背景(1句) → 问题(1句) → 方法(1-2句) → 结果(1-2句) → 意义(1句)

**质量门禁**：每章节初稿完成；引用列表非空；Methods 可复现。

### Stage 4: Integration（整合审查）

**目标**：确保论文整体连贯、逻辑自洽。

**操作步骤**：
1. 通读全文检查：Abstract 是否准确概括全文？Introduction 的 promise 是否被 Conclusion 兑现？
2. 检查术语一致性（同一概念不用不同名称）
3. 检查数学符号一致性
4. 检查图表是否在正文中被引用和解读
5. 检查引用格式是否统一

**质量门禁**：术语一致性 100%；图表全部在正文中引用；Abstract 准确概括全文。

### Stage 5: Compression（压缩精炼）

**目标**：在不丢失关键信息的前提下精炼表达。

**操作步骤**：
1. 逐段检查：删除不增加信息量的文字
2. 将被动语态改为主动语态（"We propose" 而非 "It is proposed"）
3. 删除冗余副词（very, quite, rather, basically）
4. 长句拆短句（目标：每句 <= 25 词）
5. 检查是否满足投稿篇幅要求

**质量门禁**：篇幅在目标范围 +/-10%；每句 <= 25 词（英文）；无冗余副词。

---

## 投稿类型适配

| 类型 | 典型篇幅 | 格式要求 | 特殊注意 |
|------|---------|---------|---------|
| SCI 期刊 | 8000-12000 词 | 期刊模板、双栏 | 需要详细的 Related Work 和 Limitation |
| EI 期刊/会议 | 6000-10000 词 | IEEE/ACM 模板 | 偏重工程应用，强调实验验证 |
| CCF 推荐会议 | 8-10 页 | LNCS/ACM 模板 | 严格页数限制，需要理论/实验贡献 |
| arXiv 预印本 | 不限 | 自由格式 | 快速发布，后续可投期刊/会议 |
| IEEE 期刊/会议 | 6-8 页（双栏） | IEEE 模板 | 强调技术创新与实验对比 |
| 中文核心 | 6000-10000 字 | 期刊模板 | 中文写作规范，摘要需中英双语 |

---

## 审稿回复工作流

当用户提供审稿意见时：
1. 逐条分析审稿意见，分类为：接受 / 部分接受 / 礼貌反驳
2. 对每条意见制定回复策略
3. 撰写回复信（Response Letter）：先感谢 → 逐条回复 → 标注修改位置
4. 修改论文对应部分
5. 生成修改对照表（Changes Summary）

---

## 输出规范

遵循 `shared/output-conventions.md` 中的 paper 部分：
- 输出目录：`paper/output/`
- 文件命名：`{project-name}-{stage}.md`
- 必需产出：brainstorm → outline → draft → final

---

## 约束

1. **不虚构数据**：所有实验数据必须由用户提供
2. **不虚构引用**：不编造不存在的参考文献
3. **不保证录用**：系统辅助写作，不保证论文被接收
4. **学术诚信**：用户对论文内容的学术诚信负最终责任
5. **格式限制**：生成 Markdown 格式，最终排版需用户按投稿模板调整

---

## 上下文接口

**读取**（从 `shared/context-schema.md`）：
- `project.*`：项目名称、描述、技术栈、创新点
- `author.*`：作者信息（用于致谢、通讯作者等）
- `output.*`：目标投稿类型、语言偏好

**写入**（供下游技能使用）：
- `paper.outline`：论文大纲（可传递给 `book` 作为章节基础）
- `paper.draft`：论文草稿（可传递给 `review` 进行润色）

---

## 生态集成

| 集成模块 | 触发条件 | 集成方式 |
|---------|---------|---------|
| `review` | 论文初稿完成后 | 传递给 review 进行学术润色 |
| HOS-Silly-Mock | 撰写 Results 部分时 | 检测实验数据是否为用户真实提供 |
| hos-skills（运营） | 论文发表后 | 通过 hos-content-adapt 生成科普博客 |
