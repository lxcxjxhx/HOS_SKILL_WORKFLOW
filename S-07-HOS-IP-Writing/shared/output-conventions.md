# 输出格式约定

> 统一所有子技能的输出格式标准，确保跨技能协作时产物可被下游技能正确读取。

---

## 通用规则

1. **文件格式**：所有输出默认使用 Markdown（`.md`）格式
2. **编码**：UTF-8
3. **换行符**：LF（`\n`）
4. **标题层级**：从 `##` 开始（`#` 保留给文档标题）
5. **代码块**：必须标注语言（如 ` ```python `）
6. **中文排版**：中英文之间加空格；全角标点；数字与中文之间加空格

---

## 各子技能输出规范

### paper

```
输出目录: paper/output/
文件命名: {project-name}-{stage}.md
必需文件:
  - {project-name}-brainstorm.md    # Stage 1 产出
  - {project-name}-outline.md       # Stage 2 产出
  - {project-name}-draft.md         # Stage 3 产出
  - {project-name}-final.md         # Stage 5 终稿
```

### patent

```
输出目录: patent/output/
文件命名: {project-name}-{document-type}.md
必需文件:
  - {project-name}-disclosure.md    # 技术交底书
  - {project-name}-claims.md        # 权利要求书
  - {project-name}-description.md   # 说明书
  - {project-name}-abstract.md      # 摘要
```

### copyright

```
输出目录: copyright/output/
文件命名: {software-name}-{document-type}.md
必需文件:
  - {software-name}-info.md         # 软件基本信息
  - {software-name}-description.md  # 软件说明书
  - {software-name}-source-code.md  # 源代码文档（前后各30页）
```

### book

```
输出目录: book/output/
文件命名: {book-name}/
目录结构:
  - {book-name}/
    - README.md                     # 书籍概览
    - toc.md                        # 目录
    - chapters/
      - ch01-{title}.md
      - ch02-{title}.md
      - ...
    - appendix/
      - references.md
      - glossary.md
```

### blog

```
输出目录: blog/output/
文件命名: {date}-{slug}.md
文件头（front matter）:
  ---
  title: "{标题}"
  date: {YYYY-MM-DD}
  tags: [{标签1}, {标签2}]
  platform: {目标平台}
  ---
```

### review

```
输出格式:
  1. 润色后文本（完整输出）
  2. 修改说明（逐条列出修改内容及理由）
  3. 质量评分（1-10 分，含评分依据）
```

---

## 跨技能产物传递

当从子技能 A 切换到子技能 B 时，A 的最终产出应作为 B 的输入。传递格式：

```markdown
[产物传递]
来源技能: {A}
目标技能: {B}
传递文件:
  - {文件路径1}
  - {文件路径2}
关键信息摘要:
  - {核心要点1}
  - {核心要点2}
```
