# L3 — Full Demo Pipeline Guide（10分钟标准版）

> **输出**: 10分钟内容包 + 12页PPT + 10分钟音频 + 10分钟视频规格 + GitHub 仓库结构
> **适用**: 完整 Demo、GitHub 发布、作品集、10分钟视频
> **batch**: 不建议 batch（一次一个）

---

## 执行流程

### 入口

```
create 方向=RBAC权限系统实战 depth=L3 style=academic project=rbac-demo
```

### Step-by-Step

```
1. STEP1 → 方向 → 3 个钩子
2. STEP2 → 6 个观点 + 3 层叙事弧 + 情绪曲线
3. STEP3 → 10分钟内容包（content-pack.md 10min版）
4. STEP4 → PPT 12页（ppt-6page.md 12页版，每页映射时间轴）
5. STEP5 → 10分钟音频稿（audio-script.md 10min版，4幕）
6. STEP6 → 10分钟视频合成规格（video-spec.md 10min版，600秒）
7. STEP7 → 仓库结构 + commit message
```

---

## 额外产出（vs L2）

### Demo 描述（L3 独有）

内容包中增加字段：
```yaml
demo:
  description: "一句话描述这个 demo 做什么"
  target_audience: "目标受众"
  tech_stack: "技术栈（如 python-pptx, edge-tts, ffmpeg）"
  duration: "10:00"
  estimated_generation_time: "生成预估时间（人工）"
```

### 仓库结构

由 STEP7 输出，格式：
```
/output/{project-id}/
├── 01_content/
│   ├── {project-id}-idea-1.md
│   ├── {project-id}-idea-2.md
│   └── {project-id}-idea-3.md
├── 02_ppt/
│   └── {project-id}-slide.json
├── 03_audio/
│   └── {project-id}-script.txt
└── 04_video/
    └── {project-id}-render-spec.json
```

### Commit Message

格式：
```
feat({project-id}): {English description}

- content: 6 ideas + 3-layer narrative for 10min
- ppt: 12-page timeline-mapped slides
- audio: 4-act 10min script (~2000 chars)
- video: 600s ffmpeg render spec
```

---

## 项目管理集成

L3 产出必须在 `management/` 中登记（自动执行）：

1. 读取 `management/PROJECT-MANAGER.md` 获取注册规则
2. 写入 `project-registry.json` 新条目
3. 生成 `project-charter.md` 项目章程

---

## Token 预算

| 项目 | 预算 |
|------|------|
| 方向解析 + 观点生成（STEP1+2） | ≤ 1200 tokens |
| 10分钟内容包（STEP3） | ≤ 800 tokens |
| PPT 12页数据（STEP4） | ≤ 1000 tokens |
| 10分钟音频稿（STEP5） | ≤ 2000 tokens |
| 视频合成规格（STEP6） | ≤ 1000 tokens |
| 仓库结构 + commit（STEP7） | ≤ 400 tokens |
| 项目管理登记 | ≤ 400 tokens |
| **总计** | **≤ 10000 tokens** |

---

## 时间轴对齐校验

L3 的核心约束是 **音频 ↔ PPT ↔ 视频** 三者时间轴严格对齐：

| 环节 | 时间段 | PPT页 | 音频幕 |
|------|--------|-------|--------|
| 开场 | 0:00~0:30 | 1 标题页 | 幕1 开场 |
| 问题冲击 | 0:30~1:20 | 2 问题冲击 | 幕1 问题 |
| 问题证据 | 1:20~2:15 | 3 证据 | 幕1 证据 |
| 常见误区 | 2:15~3:05 | 4 误区 | 幕2 误区 |
| 真相揭示 | 3:05~4:00 | 5 真相 | 幕2 翻转 |
| 观点1~2 | 4:00~4:55 | 6 观点1~2 | 幕2 观点 |
| 观点3~4 | 4:55~5:50 | 7 观点3~4 | 幕2 观点 |
| 观点5~6 | 5:50~6:45 | 8 观点5~6 | 幕2 观点 |
| 方法1~3 | 6:45~7:35 | 9 方法1~3 | 幕3 方法 |
| 方法4~5 | 7:35~8:20 | 10 方法4~5 | 幕3 进阶 |
| 案例 | 8:20~9:10 | 11 案例 | 幕3 案例 |
| 总结CTA | 9:10~10:00 | 12 总结 | 幕4 收尾 |

---

## 约束

- ❌ 不建议 batch（L3 每次一个项目）
- ❌ 不跳过任何 STEP
- ❌ 不省略项目管理登记
- ❌ 总时长不得偏离 600 秒超过 ±5%
- ✔️ 所有文件命名遵守 `management/` 中的命名规范
- ✔️ 前 6 个 STEP 与 L2 保持一致，只增加 STEP6+7 和 demo 描述
