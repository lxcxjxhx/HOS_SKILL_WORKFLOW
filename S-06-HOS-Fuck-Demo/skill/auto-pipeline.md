# Auto Pipeline — 自动化执行引擎（10分钟标准版）

> **核心机制**：用户一条指令 → AI 自动执行所有 STEP → 输出完整资产 → 自动注册项目。
> **不中断、不确认、不跳过质量门禁。**

---

## 1. 执行模式

| 模式 | 触发词 | 行为 | 深度 |
|------|--------|------|------|
| **`create`** | 完整内容生成 | STEP1→2→3→按depth选4/5/6→注册 | L1/L2/L3 |
| **`batch`** | 批量生产 | 循环 N 次 create | L1 |
| **`demo`** | Demo 快速生成 | STEP1→2→3→4→5→6→7→注册 | 默认 L3 |
| **`mvp`** | MVP 介绍视频 | STEP1→2→3→5→6→注册 | L2（视频优先） |
| **`manage`** | 项目操作 | 读 PROJECT-MANAGER.md → 执行注册/更新/状态 | — |
| **`status`** | 状态查询 | 读 project-registry.json → 输出仪表板 | — |

### 执行原则

```
用户指令 → 自动模式匹配 → 环境预检 → auto-read 所需文件 → 全自动执行 → 输出汇总
                                                              ↓
                                              每一步自动 Write 文件到 output/
                                              每一步自动 validate 质量
                                              全部完成后 STEP8(文件验证) → auto-register
```

### 新增: 环境预检阶段 (首次运行或新环境)

```
进入任何 create/demo/mvp/batch 模式前，先执行:
  1. 运行 config/environment-check.py
  2. 检查返回结果:
     - 所有 PASS → 继续
     - 有 WARN → 继续（记录警告到最终报告）
     - 有 FAIL → 输出诊断建议，**仍继续**（降级模式）
  3. 根据检测结果选择渲染策略:
     - ffmpeg (imageio) → 用简化方案 (ffmpeg 直连)
     - ffmpeg (系统精简) → 触发 WARN + 降级
     - 无 ffmpeg → 输出数据文件，标注"需人工渲染"
```

---

## 2. 全局执行规则

### 2.1 自动读取规则

AI 收到指令后，按模式**自动读取**所需文件，**不等待用户确认**：

```
create/demo/mvp 模式:
  ├── 首次运行（或新环境）先执行：
  │   └── config/env-check.md           (运行环境检测 → 选渲染策略 → 存结果)
  │
  ├── 必须读
  │   ├── config/ide-capabilities.md    (IDE委派规则)
  │   ├── skill/core.flow.md            (STEP定义 + 质量门禁 + STEP8验证)
  │   └── config/levels-config.md       (深度约束)
  │
  ├── 环境预检（首次/新环境）
  │   └── config/environment-check.py       (运行依赖检测 → 选渲染策略)
  │
  ├── STEP2后读
  │   ├── skill/templates/content-pack.md  (如果depth≥L1)
  │   ├── skill/templates/audio-expander.md  (如果需要音频扩展)
  │   ├── skill/injectors/emotion-engine.md  (如果指定了emotion)
  │   └── skill/injectors/style-presets.md   (如果指定了style)
  │
  ├── STEP4前读
  │   ├── skill/templates/ppt-6page.md      (槽位定义, depth≥L2)
  │   └── skill/templates/ppt-visual-spec.md (视觉规范 — 解决"美化差"问题)
  │
  ├── STEP5前读
  │   ├── skill/templates/audio-script.md   (如果depth≥L1)
  │   ├── config/tts-presets.md             (TTS语音映射)
  │   └── config/api-gateway.md             (TTS/PPT/ffmpeg接口)
  │
  ├── STEP6前读
  │   ├── skill/templates/video-spec.md     (视频规格)
  │   └── skill/templates/video-render-ref.md  (渲染参考实现 + returncode检查规则)
  │
  └── 全部完成后读
      ├── skill/core.flow.md → STEP8       (文件验证 + returncode校验)
      ├── management/auto-register.md       (自动注册)
      ├── management/PROJECT-MANAGER.md     (项目状态管理)
      └── management/registry/project-registry.json  (写入)
```

### 2.2 静默执行规则

```
✅ 所有 STEP 自动执行，不询问"是否继续"、"是否满意"、"是否确认"
✅ 每个 STEP 的输出自动 Write 到 output/{project-id}/ 对应子目录
✅ 出错时自动尝试修复一次，第二次出错才停止并报告
❌ 不要求用户在每个 STEP 后做确认
❌ 不要求用户手动创建目录
❌ 不要求用户手动注册项目
```

### 2.3 输出写入规则

每个 STEP 执行后，立即用 IDE 的 Write 工具写入文件：

| STEP | 产出 | 写入路径 |
|------|------|---------|
| STEP1+2 | 观点数据 | 内存保留，传递给 STEP3 |
| STEP3 | 内容包 markdown | `output/{project-id}/01_content/{project-id}-content.md` |
| STEP3.5 | 扩展音频文本（如需要） | 内存保留，传递给 STEP5 |
| STEP4 | PPT JSON 数据（含 visual 字段） | `output/{project-id}/02_ppt/{project-id}-slide.json` |
| STEP5 | 音频脚本（已清理标记） | `output/{project-id}/03_audio/{project-id}-script.txt` |
| STEP6 | 视频渲染规格 JSON | `output/{project-id}/04_video/{project-id}-render-spec.json` |
| STEP7 | 仓库结构 | 在 auto-register 阶段输出 |
| STEP8 | 文件验证报告 + returncode 日志 | 在汇总报告中输出 |

---

## 3. 模式详解

### 3.1 `create` — 完整内容生成

**输入格式**：
```
create 方向=<方向描述> depth=<L1|L2|L3> [style=<风格>] [emotion=<情绪>] [project=<项目ID>]
```

**自动执行序列**（不中断）：

```
STEP1 → 方向解析器 → 3个钩子
  → auto-validate: 恰好3个钩子，每个≤15字
  → 失败则用方向重新生成一次

STEP2 → 观点生成器 → title + 6观点 + 3层叙事弧 + 情绪曲线
  → auto-validate: title含数字或冲突感，6个观点递进排列
  → 失败则重新生成

STEP3 → 内容填充器 → 读取 content-pack.md → 填入槽位 → Write 文件
  → auto-validate: 所有槽位已填，总长600~800 tokens
  → 失败则重新生成

[自动判断] STEP3.5 → 音频扩展器（如需要）
  → 读取 audio-expander.md → 将内容包扩展为4幕长文本
  → 按 style/emotion 转换话术
  → 触发条件: depth=L3-extended 或 内容包预计不足10分钟
  → 不询问用户，自动判断并执行

[depth ≥ L2] STEP4 → PPT生成器 → 读取 ppt-6page.md + ppt-visual-spec.md → 12页视觉数据 → Write JSON
  → auto-validate: 严格12页，每页时长合计600s
  → 失败则重新生成并修正页数

[depth ≥ L1] STEP5 → 音频稿生成器 → 读取 audio-script.md → 4幕脚本 → Write 文件
  → auto-validate: 4幕结构完整，每句≤25字，总长1800~2200字
  → 失败则重新生成并压缩/扩展内容

[depth = L3] STEP6 → 视频规格生成器 → 读取 video-spec.md → 渲染规格 → Write JSON
  → auto-validate: 总时长600s±5%，12页映射完整
  → 失败则重新生成

全部完成 → STEP8(文件验证) → auto-register → 输出汇总报告
```

### 3.2 `demo` — Demo 快速生成（L3 深度）

**输入格式**：
```
demo 方向=<方向描述> project=<项目ID> [style=<风格>] [emotion=<情绪>]
```

**与 create 的区别**：
- 默认 depth = L3（全栈输出：内容+PPT+音频+视频+仓库）
- **项目 ID 必须提供**（demo 通常需要特定命名）
- 内容包可精简为 **4 个核心观点**（非标准 6 个，节省 token）
- 音频稿可精简为 **3 幕**（省去幕2部分内容，但仍保持 10 分钟）
- 视频规格必须完整输出（因为 demo 的目标就是视频）
- PPT 保持 12 页不变（视频需要页面对齐）

**自动执行序列**：
```
STEP1(方向→3钩子) → STEP2(title+4观点+3层叙事弧+情绪) 
  → STEP3(填充4观点内容包) → STEP4(12页PPT) 
  → STEP5(10分钟3幕音频稿) → STEP6(600s视频规格) 
  → STEP7(仓库结构) → STEP8(文件验证) → auto-register
```

### 3.3 `mvp` — MVP 介绍视频（视频优先）

**输入格式**：
```
mvp 方向=<方向描述> [project=<项目ID>] [duration=5|10] [style=<风格>]
```

**特点**：
- **视频优先** — PPT + 视频规格是核心产出，内容包和音频作为支撑
- 支持两种时长：**5分钟**（快速MVP）和 **10分钟**（标准）
- **5分钟模式**：6页PPT + 3幕音频（~1000字）+ 300秒视频规格
- **10分钟模式**：12页PPT + 4幕音频（~2000字）+ 600秒视频规格
- 风格默认 `academic`，情绪默认 `neutral`
- 项目 ID 可选，不提供则自动生成 `mvp-{seq}-{keyword}`

**自动执行序列**：
```
STEP1(方向→2个钩子，简化) → STEP2(title+4要点+2层叙事弧)
  → STEP3(填充MVP内容包,4观点) → STEP4(按duration选6或12页PPT)
  → STEP5(按duration选3或4幕音频) → STEP6(视频规格,duration参数)
  → STEP8(文件验证) → auto-register
```

### 3.4 `manage` — 项目操作

**输入格式**：
```
manage <action> [params...]
```

| 子命令 | 行为 |
|--------|------|
| `manage new project=<名称> type=<类型> depth=<L1|L2|L3>` | 新建项目 → 自动分配 ID → 写入 registry → 创建目录 |
| `manage status` | 输出项目状态仪表板 |
| `manage show <project-id>` | 显示单个项目详情 |
| `manage update <project-id> status=<新状态>` | 更新项目状态 |
| `manage archive <project-id>` | 归档项目 |
| `manage conflict-check` | 检查所有活跃项目是否有冲突 |

### 3.5 `status` — 状态查询

**自动行为**：
1. 读取 `management/registry/project-registry.json`
2. 按状态分组输出仪表板（published/production/planning/draft/archived/failed）
3. 输出活跃/总数统计

---

## 4. 质量门禁 (Quality Gates)

每个 STEP 执行后自动验证，不满足则**自动重新生成一次**，再不满足才停止报告。

### 4.1 通用门禁

```
□ direction 非空
□ depth ∈ {L1, L2, L3}
□ style ∈ {academic, hype, calm, storytelling} 或未指定(默认academic)
□ emotion ∈ {anxiety, hope, identity, elite} 或未指定(默认neutral)
```

### 4.2 内容门禁 (STEP1~3)

```
□ STEP1: hooks 恰好3个，每个≤15字
□ STEP2: title ≤20字且含数字或冲突感
□ STEP2: key_ideas 恰好6个，每个≤15字
□ STEP2: idea_details 恰好6个，每个≤30字
□ STEP2: layer1/2/3_core 各≤30字
□ STEP2: one_line_insight ≤20字
□ STEP3: 内容包 600~800 tokens
□ STEP3: 所有槽位已填充(无{{}}残留)
```

### 4.3 PPT 门禁 (STEP4)

```
□ pages 恰好12页（或MVP 5分钟模式的6页）
□ 每页时长合计 = 600s ±5%（或300s ±5%）
□ 每页 duration_sec ≥ 30s 且 ≤ 60s
□ 所有页面的 content 非空
```

### 4.4 音频门禁 (STEP5)

```
□ 4幕结构完整（或MVP 3幕）
□ 每句 ≤ 25字
□ 总字数 1800~2200字（或MVP 900~1200字）
□ 含 pause 节奏标记
□ 含 tone 语气标记
```

### 4.5 视频门禁 (STEP6)

```
□ slides 恰好12项（或6项）
□ total_duration_seconds = 600 ±30（或300 ±15）
□ 每项 slide 的 image/start_time/duration_seconds 完整
□ audio_segment 命名一致
□ ffmpeg 命令 valid
```

### 4.6 文件验证门禁 (STEP8)

```
□ 所有预期文件存在
□ 所有文件 size > 0（非空）
□ content 无 {{}} 残留
□ JSON 可解析且结构完整
□ 验证报告生成
```
❌ <3 FAIL → WARN 并继续；≥3 FAIL → 停止

### 4.7 注册门禁 (auto-register)

```
□ project-id 符合命名规范
□ 已写入 project-registry.json
□ 已创建 output/{project-id}/ 目录结构
□ seq 正确递增
□ 所有产出文件已写入
```

---

## 5. 错误处理

| 情况 | 处理 |
|------|------|
| STEPh 第一次质量门禁不通过 | 自动重新生成一次（同 STEP） |
| 重新生成后仍不通过 | 输出**黄色警告**但**继续执行**（不阻塞流水线） |
| 模板文件不存在 | 跳过该 STEP，记录到最终报告 |
| 外部工具不可用 | 输出数据文件 + 标注"需人工转换" |
| Write 写入失败 | 重试一次，失败则输出失败信息 |
| project-registry.json 无法写入 | 输出注册数据 + 标注"需人工注册" |

---

## 6. 输出汇总报告格式

所有模式执行完成后，输出统一汇总：

```markdown
━━━  HOS Pipeline Complete  ━━━

📦 Project: {project-id}
📌 Direction: {direction}
📊 Depth: {depth} | Style: {style} | Emotion: {emotion}
⏱️ Duration: {total_time}

✅ Quality Gate Results
  • Content:    PASS / WARN / FAIL
  • PPT:        PASS / WARN / SKIP
  • Audio:      PASS / WARN / SKIP
  • Video:      PASS / WARN / SKIP
  • Register:   PASS / WARN

📁 Output
  • Content:   output/{project-id}/01_content/{project-id}-content.md
  • PPT:       output/{project-id}/02_ppt/{project-id}-slide.json
  • Audio:     output/{project-id}/03_audio/{project-id}-script.txt
  • Video Spec: output/{project-id}/04_video/{project-id}-render-spec.json

📋 Next Steps
  • Run TTS:  edge-tts --voice zh-CN-XiaoxiaoNeural ...
  • Render PPT: python-pptx render slide.json
  • Compose Video: ffmpeg -i slide_%02d.png -i audio.mp3 ...
```
