# Core Flow — 核心状态机（10分钟标准版）

> 将"方向"解构为 **10 分钟视频/音频** 内容包的 7 步流程。
> 所有视频/音频长度统一为 **10 分钟（600 秒）**。

---

## 输入

```yaml
direction: "方向描述"
mode: "single | batch"
count: <number>        # batch 时需要
style: "hype | academic | calm | storytelling"
emotion: "anxiety | hope | identity | elite"
depth: "L1 | L2 | L3"
```

## 输出

N 个 **10 分钟** 内容包（按 depth 裁剪附件）

---

## STEP 1 — 方向解析器 Direction Parser

**目标**：一个方向 → 3 个具体内容钩子

**执行方式**：自动执行，不询问用户确认

**规则**：
- 每个钩子必须是一个**可讲的观点**，不是一个领域标签
- 3 个钩子形成**认知递进**（问题 → 翻转 → 行动）
- 刚好 3 个，不多不少
- 禁止在 STEP1 展开解释方向

**输出格式**（严格）：
```yaml
hooks:
  - "钩子1：问题冲击（15字内）"
  - "钩子2：认知翻转（15字内）"
  - "钩子3：行动升华（15字内）"
```

**🔍 质量门禁**：
```
□ hooks 数组长度 = 3（不多不少）
□ 每个 hook ≤ 15 字
□ 三个钩子形成递进（问题→翻转→行动）
□ 不含领域标签（如"AI安全"这种不行）
```
❌ 不满足 → 以原方向重新生成一次，再失败则输出 WARN 并继续

---

## STEP 2 — 观点生成器 View Generator

**目标**：每个钩子 → 1 个标题 + 6 个核心观点 + 3 层叙事弧 + 情绪曲线

**执行方式**：自动执行，不询问用户确认

**输出格式**（每个钩子）：
```yaml
title: "标题（必须含数字或冲突感，如「3个让你焦虑的AI真相」）"
opening_hook: "开场钩子（≤25字）"
key_ideas:
  - "观点1（≤15字）"
  - "观点2（≤15字）"
  - "观点3（≤15字）"
  - "观点4（≤15字）"
  - "观点5（≤15字）"
  - "观点6（≤15字）"
idea_details:
  - "观点1展开（≤30字）"
  - "观点2展开（≤30字）"
  - "观点3展开（≤30字）"
  - "观点4展开（≤30字）"
  - "观点5展开（≤30字）"
  - "观点6展开（≤30字）"
layer1_core: "问题冲击层：揭示危机（≤30字）"
layer2_core: "认知翻转层：打破误区（≤30字）"
layer3_core: "行动升华层：给出路径（≤30字）"
emotion_start: "起始情绪"
emotion_build: "积累情绪"
emotion_peak: "高潮情绪"
emotion_end: "收尾情绪"
one_line_insight: "一句话洞察（≤20字）"
fact_1: "数据/事实（≤30字）"
fact_2: "案例/故事（≤40字）"
```

**🔍 质量门禁**：
```
□ title ≤ 20 字且含数字或冲突感
□ key_ideas 长度 = 6，每个 ≤ 15 字
□ idea_details 长度 = 6，每个 ≤ 30 字
□ layer1/2/3_core 各 ≤ 30 字
□ one_line_insight ≤ 20 字
□ fact_1 ≤ 30 字，fact_2 ≤ 40 字
□ 6 个观点形成递进（问题→翻转→行动）
```
❌ 不满足 → 重新生成一次

---

## STEP 3 — 内容填充器 Content Filler

**目标**：将 STEP2 数据填入 **10 分钟内容包** 模板

**执行方式**：自动执行，自动 Write 文件

**操作**：
1. 读取 `skill/templates/content-pack.md`（10分钟版）
2. 将 title, key_ideas×6, idea_details×6, 三层叙事弧, 情绪曲线, one_line_insight 填入对应槽位
3. 输出完整内容包（IDE 原生 Write 工具写入文件）
4. 写入路径：`output/{project-id}/01_content/{project-id}-content.md`

**规则**：
- ❌ 不改模板结构
- ❌ 不改槽位顺序
- ❌ 不增删字段
- ✔️ 只填充

**🔍 质量门禁**：
```
□ 无 {{}} 残留（所有槽位已填充）
□ 内容包 600~800 tokens
□ 结构严格匹配 content-pack.md
□ key_ideas 6个递进排列均保留
□ 情绪曲线4段完整
```
❌ 不满足 → 重新填充一次

---

## STEP 4 — PPT 生成器（depth ≥ L2）

**目标**：内容包 → **12 页 PPT** 数据（适配 10 分钟）

**执行方式**：自动执行，自动 Write JSON

**操作**：
1. 读取 `skill/templates/ppt-6page.md`（12页10分钟版）
2. 将 6 个观点×展开、5 个行动步骤、案例、金句填入 12 个页面的槽位
3. 每页时长映射：30s/50s/55s/50s/55s/55s/55s/55s/50s/45s/50s/50s = 600s
4. 输出 `output/{project-id}/02_ppt/{project-id}-slide.json`

**规则**：
- depth = L1 时跳过此 STEP
- 严格 12 页，不增不减

**🔍 质量门禁**：
```
□ pages 长度 = 12
□ 每页有 title, content, duration_sec, notes
□ duration_sec 合计 = 600s ±5%（每页≥30s ≤60s）
□ 所有 content 字段非空
□ template = "12page-10min"
```
❌ 不满足 → 重新生成并修正页数/时长

---

## STEP 5 — 音频稿生成器（depth ≥ L1）

**目标**：内容包 → **10 分钟** TTS 音频稿

**执行方式**：自动执行，自动 Write 文件

**操作**：
1. 读取 `skill/templates/audio-script.md`（10分钟版）
2. 读 `config/tts-presets.md` 匹配 style→voice
3. 读 `skill/injectors/emotion-engine.md` 匹配 emotion→tone
4. 生成 4 幕脚本（总时长 600 秒，≈ 1800~2200 字）
5. 每句 ≤ 25 字，含节奏/情绪标记
6. 输出 `output/{project-id}/03_audio/{project-id}-script.txt`

**时长保证**：
- 幕1 钩子+问题冲击：0~2min（~120s）
- 幕2 认知翻转：2~5:30（~210s）
- 幕3 方案路径：5:30~8:30（~180s）
- 幕4 升华号召：8:30~10:00（~90s）
- 总计时长：600 ± 30 秒

**🔍 质量门禁**：
```
□ 4幕结构完整（【幕1】【幕2】【幕3】【幕4】标记）
□ 每句 ≤ 25 字
□ 总字数 1800~2200 字
□ 含 pause 节奏标记（≥3处）
□ 含 tone 语气标记（每幕至少1处）
□ 总时长标记 = 10min
□ [emotion: X] 和 [pace: Y] 头部标记存在
```
❌ 不满足 → 重新生成一次

---

## STEP 6 — 视频合成规范（depth = L3 / demo / mvp）

**目标**：12 页 PPT + 10 分钟音频 → 10 分钟视频渲染指令

**执行方式**：自动执行，自动 Write JSON

**操作**：
1. 读取 `skill/templates/video-spec.md`（10分钟版）
2. 读 `config/api-gateway.md` 获取 ffmpeg 接口契约
3. 将 12 页 PPT 映射为视频片段（每页 30~55 秒）
4. 将音频稿 4 幕时间轴对齐到页面
5. 输出 `output/{project-id}/04_video/{project-id}-render-spec.json`

**规则**：
- depth = L1/L2 且不是 demo/mvp 模式时跳过
- 总时长严格 600 秒（10分钟）或 300 秒（mvp 5分钟）

**🔍 质量门禁**：
```
□ slides 长度 = 12（或 mvp 5min = 6）
□ total_duration_seconds = 600 ±30（或 mvp = 300 ±15）
□ 每项有 image/start_time/duration_seconds/transition
□ audio_segment 命名格式一致
□ 含完整 ffmpeg 命令
□ resolution = "1920x1080"
□ fps = 30
```
❌ 不满足 → 重新生成一次

---

## STEP 7 — GitHub 归档指令（depth = L3 / demo）

**目标**：输出标准化仓库结构 + commit

**执行方式**：自动输出结构，IDE 原生 Bash(git) 执行

**输出**：
```yaml
repo_structure:
  - "output/{project-id}/01_content/{project-id}-content.md"
  - "output/{project-id}/02_ppt/{project-id}-slide.json"
  - "output/{project-id}/03_audio/{project-id}-script.txt"
  - "output/{project-id}/04_video/{project-id}-render-spec.json"
  - "output/{project-id}/README.md"
git_message: "feat({project-id}): {英文简写}"
```

**🔍 质量门禁**：
```
□ repo_structure 所有路径以 output/{project-id}/ 开头
□ git_message 含 {project-id}
□ 所有产出文件已在对应路径
```
❌ 不满足 → 修正路径后继续

---

## STEP 8 — 文件验证（所有模式）

**目标**：验证所有产出文件的有效性，确保不是 0 字节/损坏。

**执行时机**：auto-register 之前，STEP1~7 全部完成后立即执行。

**执行方式**：自动执行，不询问用户。

### 验证清单

```
对所有 generated_files[] 执行:
  □ 文件存在
  □ 文件大小 > 0（非空 — 防御 0 字节文件）
  □ 文件名符合 {project-id}-{type}.{ext} 规范

对 content 文件（.md）:
  □ 可读取，非空
  □ 无 {{}} 残留槽位

对 PPT 文件（.json）:
  □ 可解析为 JSON
  □ pages 长度符合预期（12 或 6）
  □ 无 null/空字段

对音频文件（.txt）:
  □ 可读取
  □ 总字数在预期范围
  □ 无 [pause] [tone] [emotion] 标记残留（必须已清理）

对视频规格（.json）:
  □ 可解析为 JSON
  □ total_duration_seconds 匹配模式时长
  □ slides 完整

对所有 subprocess 调用日志:
  □ 所有 returncode = 0（无静默失败）
  □ 如有非 0 returncode → 在报告中标记 FAIL
```

### 验证报告格式

```markdown
🔍 File Validation
  • content.md:  {PASS | FAIL | SKIP}  ({size} bytes, {tokens} tokens)
  • slide.json:  {PASS | FAIL | SKIP}  ({size} bytes, {pages} pages)
  • script.txt:  {PASS | FAIL | SKIP}  ({size} bytes, {chars} chars)
  • render-spec.json: {PASS | FAIL | SKIP}  ({size} bytes, {slides} slides)
  ─────────────────────────────────────
  Result: {ALL PASS | X/Y FAIL}
```

### 错误处理

| 验证结果 | 行为 |
|---------|------|
| 全部 PASS | 继续 → auto-register |
| 1~2 个 FAIL | 输出 WARN，**继续** auto-register（不阻塞） |
| ≥3 个 FAIL | 输出 FAIL，停止并报告："质量验证未通过，请检查输出目录" |
| 文件 0 字节 | 在报告中标记为 `EMPTY`，尝试重新生成该文件一次 |

**🔍 质量门禁**：
```
□ 所有预期文件存在且 size > 0
□ content 文件无 {{}} 残留
□ JSON 文件可解析且结构完整
□ 音频文件无标记残留（[pause] 等已清理）
□ 所有 subprocess returncode = 0
□ 验证结果无 ≥3 FAIL
```
❌ ≥3 FAIL → 停止流水线并报告；<3 FAIL → WARN 并继续

---

## 执行序列

**核心规则**：所有 STEP 自动执行，不中断询问用户确认。

```
single 模式 (create/demo/mvp):
  环境预检 → STEP1(hooks) → STEP2(title+6ideas) → STEP3(content pack)
  → [如需扩展] STEP3.5(audio expander — 读 audio-expander.md)
  → IF depth≥L2 OR demo/mvp: STEP4(PPT — 读 ppt-visual-spec.md)
  → IF depth≥L1: STEP5(audio — 读 audio-script.md, 清理标记后输出)
  → IF depth=L3 OR demo: STEP6(video spec — 读 video-render-ref.md)
  → IF depth=L3 OR demo: STEP7(repo)
  → STEP8(文件验证 — 含 returncode 校验)
  → auto-register → 汇总报告

batch 模式:
  环境预检 → for i in range(count):
    STEP1 → STEP2 → STEP3
    IF depth≥L2: STEP4 → STEP5
  → STEP8(文件验证) → 批量汇总报告
```

**注意**：`demo` 模式即使不指定 depth，也默认执行全栈（L3 同等）。
`mvp` 模式默认 depth=L2（视频优先），duration 参数控制 5/10 分钟。

---

## 10分钟标准速查

| 项目 | 原标准 | 新标准 |
|------|--------|--------|
| 视频总长 | 40~60 秒 | **600 秒（10 分钟）** |
| 音频总长 | 40~60 秒 | **600 秒（10 分钟）** |
| 内容包字数 | ~250 字 | **~600~800 字** |
| 核心观点 | 3 个 | **6 个** |
| PPT 页数 | 6 页 | **12 页** |
| 音频句子 | ~10 句 | **~60~80 句** |
| 音频总字数 | ~300 字 | **~1800~2200 字** |
