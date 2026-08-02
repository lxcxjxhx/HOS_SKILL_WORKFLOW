# Workflow: Publish Check — 发布前检查清单

> status = published 之前执行的最终检查。
> 确保项目资产完整、可消费。

---

## 最终检查清单

### 产出完整性

```
□ 01_content/  — 所有 .md 文件可读
□ 02_ppt/      — slide.json 可被 python-pptx 消费
□ 03_audio/    — script.txt 可被 edge-tts 消费
□ 04_video/    — render-spec.json 可被 ffmpeg 消费
□ 项目章程     — project-charter.md 存在
```

### 外部可消费性

```
□ 内容包无占位符  — 所有 {{slot}} 已被填充
□ PPT 数据无占位符 — slide.json 无 {{}}
□ 音频稿无占位符  — script.txt 无 {{}}
□ JSON 语法正确   — 可解析
```

### 元信息完整性

```
□ 项目注册表已更新   — project-registry.json 包含此项目
□ version 已递增     — 如 v1.0.0 → v1.1.0
□ updated 时间已更新  — 格式 ISO 8601
```

### Git 准备（L3）

```
□ commit message 格式正确  — feat({id}): ...
□ 仓库结构符合规范
□ README 含项目说明
```

---

## 发布后操作

1. 注册表 status → `published`
2. 记录版本日志（`version-log.md`）
3. 输出发布摘要：

```markdown
🚀 发布完成 — {id}

📦 资产包:
  ├── 3 个内容包
  ├── 6 页 PPT 数据
  ├── 1 份音频稿（~{n} 秒）
  └── 1 份视频渲染规格

📂 output/{id}/
📊 v{version}
```
