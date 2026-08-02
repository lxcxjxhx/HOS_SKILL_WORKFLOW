# Project Card Template — 项目卡片定义

> 新建项目时使用的元数据框架。
> AI 用此模板收集用户信息，生成注册条目。

---

## 项目卡片结构

```yaml
# === 基本信息 ===
id: "{auto}"              # 由注册表自动分配
name: "{{项目中文名}}"
type: "course | demo | value | audiobook | short"
direction: "{{内容方向}}"
description: "{{一句话描述}}"

# === 制作配置 ===
depth: "L1 | L2 | L3"
style: "academic | hype | calm | storytelling"
emotion: "anxiety | hope | identity | elite | null"
tags: ["{{标签1}}", "{{标签2}}"]

# === 时间计划 ===
target_publish: "{{目标发布日期}}"
estimated_days: {{预估天数}}

# === 内容钩子 ===
hooks:
  - "钩子1"
  - "钩子2"
  - "钩子3"
```

---

## 用户引导问题

当用户说 `manage new` 但信息不足时，AI 依次询问：

1. 项目中文名是什么？
2. 项目类型？（course / demo / value / audiobook / short）
3. 方向一句话描述？
4. 目标深度？（L1 / L2 / L3）
5. 风格偏好？（academic / hype / calm / storytelling）
6. 3 个内容钩子大致方向？

---

## 卡片预览（AI 展示给用户确认）

```markdown
## 📋 项目卡片预览

| 字段 | 值 |
|------|----|
| ID | `course-002-dev-ai` |
| 名称 | 开发者AI实战课 |
| 类型 | course |
| 方向 | 面向开发者的AI工具实战 |
| 深度 | L2 |
| 风格 | academic |
| 钩子 | ① AI编码助手 ② 提示词工程 ③ AI工作流 |

> 确认以上信息？(Y/N)
```
