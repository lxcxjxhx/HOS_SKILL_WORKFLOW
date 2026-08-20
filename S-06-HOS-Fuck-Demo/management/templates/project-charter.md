# Project Charter — 项目章程模板

> 每个项目注册时生成此文件，记录项目目标和范围。
> 存放位置：`output/{project-id}/project-charter.md`

---

```markdown
# 项目章程: {{project_name}}

| 字段 | 值 |
|------|----|
| 项目 ID | `{{project_id}}` |
| 类型 | {{type}} |
| 状态 | draft |
| 创建日期 | {{created_date}} |
| 版本 | v1.0.0 |

## 项目描述

{{description}}

## 目标受众

{{target_audience}}

## 内容方向

{{direction}}

## 制作规格

- 深度: {{depth}}
- 风格: {{style}}
- 情绪基调: {{emotion | "无"}}

## 内容钩子

1. {{hook_1}}
2. {{hook_2}}
3. {{hook_3}}

## 产出清单

- [ ] 01_content/ — 3 个内容包
- [ ] 02_ppt/ — 6 页 PPT 数据 {{#if depth >= "L2"}}
- [ ] 03_audio/ — 音频稿 {{#if depth >= "L1"}}
- [ ] 04_video/ — 视频渲染规格 {{#if depth == "L3"}}

## 里程碑

| 阶段 | 日期 | 状态 |
|------|------|------|
| 启动 | {{created_date}} | ✔️ |
| 内容生产 | — | ⏳ |
| 审核 | — | ⏳ |
| 发布 | — | ⏳ |
```
