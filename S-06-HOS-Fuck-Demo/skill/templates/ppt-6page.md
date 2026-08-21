# PPT Template — 14页10分钟版（含目录页+过渡页）

> **14 页**（新增：目录页 + 3个过渡页），每页 ≈ 30~55 秒，总计 **10 分钟**（600 秒）。
> 适配 10 分钟视频/演示的内容节奏，保证结构完整度。

---

## 页面结构

```
标准课程序列（14页）:

Page  1: 标题/封面       (~25s)   开场 — dark 背景
Page  2: 目录 TOC          (~20s)   课程大纲（新增）
Page  3: 过渡页 Part 1     (~10s)   问题认知（新增，dark背景）
Page  4: 问题冲击          (~50s)   钩子深化
Page  5: 问题证据+数据     (~55s)   数据/事实（含引用来源）
Page  6: 常见误区          (~50s)   反转预备
Page  7: 过渡页 Part 2     (~10s)   核心观点（新增，dark背景）
Page  8: 核心观点 1~2      (~55s)   关键论点（≥120字/页）
Page  9: 核心观点 3~4      (~55s)   关键论点（≥120字/页）
Page 10: 核心观点 5~6      (~55s)   关键论点（≥120字/页）
Page 11: 过渡页 Part 3     (~10s)   行动指南（新增，dark背景）
Page 12: 方法/步骤 1~3     (~50s)   行动方案
Page 13: 方法/步骤 4~5+案例 (~50s)  进阶行动+案例
Page 14: 总结/金句         (~50s)   收尾 + CTA

MVP精简版（8页，5分钟）:

Page 1: 标题/封面         (~25s)   开场
Page 2: 目录 TOC          (~15s)   课程大纲（新增）
Page 3: 过渡页            (~8s)    核心观点（新增）
Page 4: 核心观点 1~2      (~50s)   关键论点
Page 5: 核心观点 3~4      (~50s)   关键论点
Page 6: 过渡页            (~8s)    行动指南（新增）
Page 7: 行动步骤          (~50s)   行动方案
Page 8: 总结/金句         (~50s)   收尾 + CTA

总计时长: ~600s = 10分钟（标准）| ~256s ≈ 4.3分钟（MVP）
```

---

## 槽位映射

### Page 1 — 标题页（~30s）

| 槽位 | 来源 | 格式 |
|------|------|------|
| `{{title}}` | STEP2 title | 大标题，≤20字 |
| `{{subtitle}}` | STEP2 one_line_insight | 副标题 |
| `{{direction}}` | 用户输入 | 标注方向 |

### Page 2 — 问题冲击（~50s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{shock_title}}` | 基于 layer1_core | 3~8字，冲击感 |
| `{{shock_desc}}` | content-pack problem_shock | 1~2句话 |
| `{{shock_highlight}}` | 核心数据 | 一个数字或短句高亮 |

### Page 3 — 问题证据（~55s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{evidence_title}}` | AI生成 | 让问题更具体 |
| `{{evidence_1}}` | content-pack fact_1 | 数据/事实 |
| `{{evidence_2}}` | content-pack fact_2 | 案例/故事 |
| `{{evidence_conclusion}}` | AI生成 | 一句话总结问题严重性 |

### Page 4 — 常见误区（~50s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{myth_title}}` | AI生成 | 常见的错误认知标题 |
| `{{myth_1}}` | content-pack myth_1 | 误区陈述 |
| `{{myth_2}}` | content-pack myth_2 | 误区陈述 |
| `{{myth_3}}` | content-pack myth_3 | 误区陈述 |

### Page 5 — 真相揭示（~55s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{truth_title}}` | AI生成 | 翻转标题 |
| `{{truth_1}}` | content-pack truth_1 | 真相陈述 |
| `{{truth_2}}` | content-pack truth_2 | 真相陈述 |
| `{{truth_3}}` | content-pack truth_3 | 真相陈述 |
| `{{truth_quote}}` | content-pack one_line_insight | 金句高亮 |

### Page 6 — 核心观点 1~2（~55s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{core_title_1}}` | content-pack key_idea_1 | ≤15字 |
| `{{core_detail_1}}` | content-pack idea_1_detail | ≤30字 |
| `{{core_title_2}}` | content-pack key_idea_2 | ≤15字 |
| `{{core_detail_2}}` | content-pack idea_2_detail | ≤30字 |

### Page 7 — 核心观点 3~4（~55s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{core_title_3}}` | content-pack key_idea_3 | ≤15字 |
| `{{core_detail_3}}` | content-pack idea_3_detail | ≤30字 |
| `{{core_title_4}}` | content-pack key_idea_4 | ≤15字 |
| `{{core_detail_4}}` | content-pack idea_4_detail | ≤30字 |

### Page 8 — 核心观点 5~6（~55s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{core_title_5}}` | content-pack key_idea_5 | ≤15字 |
| `{{core_detail_5}}` | content-pack idea_5_detail | ≤30字 |
| `{{core_title_6}}` | content-pack key_idea_6 | ≤15字 |
| `{{core_detail_6}}` | content-pack idea_6_detail | ≤30字 |

### Page 9 — 方法/步骤 1~3（~50s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{method_title}}` | AI生成 | 行动导向标题 |
| `{{method_step_1}}` | content-pack step_1 | ≤12字 |
| `{{method_step_2}}` | content-pack step_2 | ≤12字 |
| `{{method_step_3}}` | content-pack step_3 | ≤12字 |

### Page 10 — 方法/步骤 4~5 + 节奏（~45s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{method_title_2}}` | AI生成 | 进阶标题 |
| `{{method_step_4}}` | content-pack step_4 | ≤12字 |
| `{{method_step_5}}` | content-pack step_5 | ≤12字 |
| `{{method_tip}}` | AI生成 | 一句话鼓励 |

### Page 11 — 案例/故事（~50s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{case_title}}` | AI生成 | 案例标题 |
| `{{case_story}}` | content-pack case_story | 40字以内 |
| `{{case_result}}` | AI生成 | 一句话结果 |
| `{{case_lesson}}` | AI生成 | 一句话启发 |

### Page 12 — 总结/金句（~50s）

| 槽位 | 来源 | 约束 |
|------|------|------|
| `{{summary_title}}` | "总结" | 固定 |
| `{{takeaway_1~3}}` | 全部 key_ideas 提炼 | 每条≤15字 |
| `{{golden_sentence}}` | content-pack golden_sentence | ≤20字 |
| `{{cta_text}}` | content-pack call_to_action | ≤25字 |

---

## 输出格式 (JSON)

```json
{
  "project": "{{project-id}}",
  "template": "12page-10min",
  "style": "{{style}}",
  "total_duration": 600,
  "pages": [
    {"page": 1,  "title": "{{title}}",            "content": "{{subtitle}}",              "duration_sec": 30,  "notes": "开场引言"},
    {"page": 2,  "title": "{{shock_title}}",       "content": "{{shock_desc}}",            "duration_sec": 50,  "notes": "冲击感"},
    {"page": 3,  "title": "{{evidence_title}}",    "content": "{{evidence_1}}\n{{evidence_2}}", "duration_sec": 55, "notes": "摆数据"},
    {"page": 4,  "title": "{{myth_title}}",        "content": "{{myth_1}}\n{{myth_2}}\n{{myth_3}}", "duration_sec": 50, "notes": "转折预备"},
    {"page": 5,  "title": "{{truth_title}}",       "content": "{{truth_1}}\n{{truth_2}}\n{{truth_3}}", "duration_sec": 55, "notes": "揭真相"},
    {"page": 6,  "title": "{{core_title_1}}",      "content": "{{core_title_1}}: {{core_detail_1}}",   "duration_sec": 55, "notes": "观点1~2"},
    {"page": 7,  "title": "{{core_title_3}}",      "content": "{{core_title_3}}: {{core_detail_3}}",   "duration_sec": 55, "notes": "观点3~4"},
    {"page": 8,  "title": "{{core_title_5}}",      "content": "{{core_title_5}}: {{core_detail_5}}",   "duration_sec": 55, "notes": "观点5~6"},
    {"page": 9,  "title": "{{method_title}}",      "content": "{{method_step_1}}\n{{method_step_2}}\n{{method_step_3}}", "duration_sec": 50, "notes": "行动方案"},
    {"page": 10, "title": "{{method_title_2}}",    "content": "{{method_step_4}}\n{{method_step_5}}",   "duration_sec": 45, "notes": "进阶行动"},
    {"page": 11, "title": "{{case_title}}",        "content": "{{case_story}}",            "duration_sec": 50,  "notes": "案例"},
    {"page": 12, "title": "{{summary_title}}",     "content": "{{takeaway_1}}\n{{takeaway_2}}\n{{takeaway_3}}", "duration_sec": 50, "notes": "金句收尾+CTA"}
  ]
}
```

---

## 约束

- ✔️ 标准课程 **14 页**（含目录页+3个过渡页）
- ✔️ MVP精简 **8 页**（含目录页+2个过渡页）
- ✔️ 每页时长：内容页 45~55 秒，过渡页 8~10 秒，合计 600 秒（10 分钟）
- ❌ 不能跳过目录页（TOC）
- ❌ 不能把内容页放在目录页之前
- ❌ 不合并内容页面
- ❌ 不改变每页的槽位结构
- ✔️ 过渡页使用 dark 背景以示区分
- ✔️ 每个内容页字数 ≥ 80 字（参考 course-quality-standards.md）
- ✔️ speaker_notes 根据 emotion/style 可调整语气提示

---

## 视觉多样性（Long 模式）

**问题**：长视频（10 分钟）中，12 页每页相同布局容易视觉疲劳。

### 多图子帧支持

每页可拆分为多个子帧，在 `slides` 中增加 `subframes`：

```json
{
  "page": 6,
  "title": "核心观点 1~2",
  "content": "观点1: 70%编码岗面临替代\n观点2: 初级程序员风险最大",
  "duration_sec": 55,
  "notes": "观点1~2",
  "subframes": [
    {"content": "观点1: 70%编码岗面临替代\n从重复性CRUD到全栈自动化",
     "highlight": "70%",
     "duration_sec": 27},
    {"content": "观点2: 初级程序员风险最大\n重复性CRUD工作首当其冲",
     "highlight": "风险最大",
     "duration_sec": 28}
  ]
}
```

### 布局变体

| 页面类型 | 建议布局 | 视觉效果 |
|---------|---------|---------|
| 标题页 (1) | 居中大字 + 副标题 | 全屏背景 |
| 问题冲击 (2~3) | 左文右数 | 大数字高亮 |
| 误区/翻转 (4~5) | 左右对比 | 两栏 + 箭头 |
| 观点页 (6~8) | 上标下详 + 子帧轮播 | 逐条显示 |
| 方法页 (9~10) | 步骤列表 + 进度指示 | 编号 + 连接线 |
| 案例页 (11) | 故事框 + 数据引用 | 引用样式 |
| 总结页 (12) | 三列要点 + 金句 | 徽章式卡片 |

### 输出格式扩展

在输出 JSON 的 `outputs` 字段增加布局提示：

```json
{
  "project": "{{project-id}}",
  "template": "12page-10min",
  "visual_diversity": {
    "enabled": true,
    "subframes": {"page_6": true, "page_7": true, "page_8": true},
    "layout_variants": {"page_1": "centered", "page_4": "comparison", "page_9": "steps"}
  }
}
```
