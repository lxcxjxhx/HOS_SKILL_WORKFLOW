# Workflow: Content Review — 内容审核标准流程

> 项目 status = production → review 时执行的审核流程。
> 审核不通过 → status = failed + 记录原因。
> 审核通过 → status = published。

---

## 审核清单

### 1. 结构完整性

| 检查项 | 通过条件 |
|--------|---------|
| 内容包存在 | `01_content/{id}-idea-*.md` 存在 |
| 内容包数 = 3 | 刚好 3 个钩子 |
| PPT 存在（L2+） | `02_ppt/{id}-slide.json` 存在 |
| PPT 页数 = 6 | 刚好 6 页 |
| 音频稿存在（L1+） | `03_audio/{id}-script.txt` 存在 |
| 音频稿短句化 | 每句 ≤ 25 字 |
| 视频规格存在（L3） | `04_video/{id}-render-spec.json` 存在 |
| 项目章程存在 | `project-charter.md` 存在 |

### 2. 内容一致性

| 检查项 | 通过条件 |
|--------|---------|
| 标题 vs 内容匹配 | PPT 标题与音频稿开场一致 |
| 核心观点一致 | PPT Page4 与音频稿 point_1~3 一致 |
| 金句一致 | PPT Page6 与音频稿 insight 一致 |
| 情绪锚点一致 | 内容包 emotion 与音频稿 tone 一致 |

### 3. 命名规范

| 检查项 | 通过条件 |
|--------|---------|
| ID 格式正确 | {type}-{seq}-{keyword} |
| 文件名前缀正确 | 全部以 {id} 开头 |
| 无中文路径 | 路径和文件名无中文 |
| 大小写一致 | 全部小写 |

### 4. 情绪/风格检查

| 检查项 | 通过条件 |
|--------|---------|
| 标题符合 style 预设 | 如 academic 不出现 hype 式夸张 |
| 情绪基调与 emotion 一致 | anxiety 不出现 hope 式鼓励 |
| 措辞符合 style 指南 | 参照 style-presets.md |

---

## 审核结果

### 通过 → published

```markdown
✅ 审核通过 — {id}

项目已发布。后续操作:
- `manage archive {id}` — 归档
- 或继续生产新内容
```

### 不通过 → failed

```markdown
❌ 审核不通过 — {id}

未通过项:
1. {问题1}
2. {问题2}

建议:
- 重新生成内容包
- 修复后运行 `manage update {id} status=production`
```

---

## 审核记录

每次审核的结果应记录在 `version-log.md` 中：
```
2026-06-30 | {id} | review | pass/fail | 审核人: AI
```
