# 共享上下文数据结构（IP-Context）

> 定义跨子技能的信息传递协议。当用户在任意子技能中提供了核心技术信息后，该信息写入共享上下文，其他子技能可直接读取。

---

## 数据结构

### project（项目信息）

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| project.name | string | 用户输入 | 项目/技术名称 |
| project.description | string | 用户输入 | 技术方案描述（200字以内） |
| project.tech-stack | list | 用户输入/自动提取 | 技术栈列表 |
| project.innovations | list | 用户输入 | 创新点列表（3-5个） |
| project.code-repo | string | 用户输入 | 代码仓库 URL |

### author（作者信息）

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| author.name | string | 用户输入 | 作者姓名 |
| author.affiliation | string | 用户输入 | 所属机构 |
| author.email | string | 用户输入 | 联系邮箱 |
| author.bio | string | 用户输入 | 作者简介（100字以内） |

### output（输出偏好）

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| output.target-venues | list | 用户输入 | 目标投稿/发布平台 |
| output.language | enum | 用户输入 | zh / en |
| output.style | enum | 用户输入 | academic / technical / casual |

---

## 各子技能读写权限

| 子技能 | 读取 | 写入 |
|--------|------|------|
| paper | project.*, author.*, output.* | paper.outline, paper.draft |
| patent | project.* | patent.disclosure, patent.claims |
| copyright | project.*, project.code-repo | copyright.documents |
| book | project.*, output.* | book.toc, book.chapters |
| blog | project.*, output.* | blog.articles |
| review | （直接操作文本） | review.polished |

---

## 传递机制

由于 Markdown Skill 无法实现编程级状态管理，上下文传递通过以下三重机制：

1. **会话内传递**：同一对话中，AI 记住之前子技能产出的核心信息
2. **文件传递**：各子技能将产出写入约定路径的文件，后续子技能读取
3. **显式摘要**：主 SKILL.md 在激活下一个子技能前，明确传递上下文摘要

### 上下文摘要模板

当从一个子技能切换到另一个时，输出以下格式的摘要：

```
[IP-Context 摘要]
- 项目名称: {project.name}
- 核心技术: {project.description}
- 创新点: {project.innovations}
- 技术栈: {project.tech-stack}
- 当前阶段: {当前子技能} → {下一个子技能}
- 传递产物: {具体产出文件列表}
```
