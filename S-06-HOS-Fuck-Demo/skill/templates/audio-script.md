# Audio Script Template — 10分钟音频稿

> **10分钟** TTS 音频脚本（≈ 600秒 ≈ 1800~2200 字）。
> 4 幕结构 + 情绪曲线 + 精准时间轴，每句 ≤ 25 字。

---

## 核心参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 总时长 | 10 分钟（600 秒） | 目标精度 ±5% |
| 语速 | ~180~220 字/分钟（依 style 调整） | 中文 TTS 标准 |
| 总字数 | ~1800~2200 字 | 含停顿标记 |
| 句子数 | ~60~80 句 | 每句 ≤ 25 字 |
| 停顿占比 | ~15~20% 总时长 | 呼吸/情绪留白 |

---

## 4 幕结构

```
┌─────────────────────────────────────────────────┐
│  幕1: 钩子 + 问题冲击  (0:00~2:00    ~120s)    │
├─────────────────────────────────────────────────┤
│  幕2: 误区 + 认知翻转  (2:00~5:30    ~210s)    │
├─────────────────────────────────────────────────┤
│  幕3: 方案 + 行动路径  (5:30~8:30    ~180s)    │
├─────────────────────────────────────────────────┤
│  幕4: 升华 + 号召行动  (8:30~10:00   ~90s)     │
└─────────────────────────────────────────────────┘
```

---

## 模板结构

> **⚠️ 纯文本模式**：TTS 引擎（edge-tts）对 SSML `<break>` 标签在嵌套时的支持不稳定。
> 本模板使用**纯文本 + 空行**控制节奏，`[标记]` 仅作可读性指示，不传给 TTS 引擎。
> 所有 `[pause]`、`[tone]`、`[emotion]` 标记在实际合成前必须**移除**（见合成策略章节）。

```text
【幕1：问题冲击 — 0:00~2:00】

{{opening_hook_1}}
{{opening_hook_2}}

{{problem_shock_1}}
{{problem_shock_2}}
{{problem_shock_3}}

{{problem_evidence_1}}
{{problem_evidence_2}}



【幕2：认知翻转 — 2:00~5:30】

{{myth_intro}}

{{myth_1}} → {{truth_1}}
{{myth_2}} → {{truth_2}}
{{myth_3}} → {{truth_3}}

{{revelation_1}}
{{revelation_2}}

{{reframe_1}}
{{reframe_2}}
{{reframe_3}}



【幕3：方案路径 — 5:30~8:30】

{{method_intro}}

{{step_1_title}}，{{step_1_detail}}
{{step_2_title}}，{{step_2_detail}}
{{step_3_title}}，{{step_3_detail}}

{{case_story}}

{{step_4_title}}，{{step_4_detail}}
{{step_5_title}}，{{step_5_detail}}



【幕4：升华号召 — 8:30~10:00】

{{insight_recap}}

{{vision_1}}
{{vision_2}}

{{call_to_action_1}}
{{call_to_action_2}}

{{golden_sentence}}
```

---

## 槽位定义

### 幕1 — 钩子 + 问题冲击（0:00~2:00，~120 秒）

| 槽位 | 来源 | 约束 | 示例 |
|------|------|------|------|
| `{{opening_tone}}` | style→tone映射 | — | urgent / warm / calm |
| `{{opening_hook_1}}` | content-pack | ≤25字 | 你知道AI正在取代多少编程工作吗？ |
| `{{opening_hook_2}}` | content-pack | ≤25字 | 这个数字可能远超你的想象。 |
| `{{problem_shock_1}}` | content-pack | ≤25字 | 麦肯锡报告：3亿岗位将被影响。 |
| `{{problem_shock_2}}` | content-pack | ≤25字 | 其中程序员是重灾区。 |
| `{{problem_shock_3}}` | content-pack | ≤25字 | 70%的编码工作可以被自动化。 |
| `{{problem_evidence_1}}` | content-pack/fact_1 | ≤30字 | 头部科技公司已经在批量替代。 |
| `{{problem_evidence_2}}` | content-pack/fact_2 | ≤30字 | GPT-4 的编程能力已超过初级工程师。 |

### 幕2 — 误区 + 认知翻转（2:00~5:30，~210 秒）

| 槽位 | 来源 | 约束 | 示例 |
|------|------|------|------|
| `{{transition_tone}}` | style→tone | — | serious / reflective |
| `{{myth_intro}}` | 基于layer1→layer2过渡 | ≤25字 | 但先别慌，大多数人搞错了一件事。 |
| `{{myth_1}}/{{truth_1}}` | content-pack | ≤20+20字 | 误区：AI会完全取代程序员 → 真相：AI取代的是任务，不是职业 |
| `{{myth_2}}/{{truth_2}}` | content-pack | ≤20+20字 | 误区：只有大厂才用AI → 真相：个人开发者也在用AI10倍产出 |
| `{{myth_3}}/{{truth_3}}` | content-pack | ≤20+20字 | 误区：现在学AI太晚了 → 真相：AI工具还在早期，现在就是最佳时机 |
| `{{revelation_1}}` | layer2_core | ≤25字 | 真正的危机不是AI淘汰你。 |
| `{{revelation_2}}` | layer2_core | ≤25字 | 而是会用AI的人正在淘汰你。 |
| `{{reframe_1~3}}` | content-pack | ≤20字/个 | 认知升级的3个关键视角 |

### 幕3 — 方案路径（5:30~8:30，~180 秒）

| 槽位 | 来源 | 约束 | 示例 |
|------|------|------|------|
| `{{method_tone}}` | style→tone | — | confident / instructive |
| `{{method_intro}}` | layer3_core | ≤25字 | 下面是普通人也能做到的5步转型方案。 |
| `{{step_1_title/detail}}` | content-pack/method | ≤8+20字 | 诊断 → 列出你工作中可被AI替代的部分 |
| `{{step_2_title/detail}}` | content-pack/method | ≤8+20字 | 学习 → 每天30分钟掌握一个AI工具 |
| `{{step_3_title/detail}}` | content-pack/method | ≤8+20字 | 实践 → 用AI完成一个真实项目 |
| `{{step_4_title/detail}}` | content-pack/method | ≤8+20字 | 迭代 → 建立AI工作流，持续优化 |
| `{{step_5_title/detail}}` | content-pack/method | ≤8+20字 | 输出 → 用AI放大你的影响力 |
| `{{case_story}}` | content-pack/fact_2 | ≤40字 | 一个真实的转型案例 |

### 幕4 — 升华 + 号召（8:30~10:00，~90 秒）

| 槽位 | 来源 | 约束 | 示例 |
|------|------|------|------|
| `{{closing_tone}}` | emotion→tone | — | inspiring / declarative |
| `{{insight_recap}}` | one_line_insight | ≤20字 | 不是AI淘汰你，是用AI的人淘汰你。 |
| `{{vision_1}}` | layer3_core | ≤25字 | 想象一下，6个月后的你会是什么样子？ |
| `{{vision_2}}` | layer3_core | ≤25字 | 当别人还在焦虑，你已经在行动。 |
| `{{call_to_action_1}}` | emotion 映射 | ≤25字 | 现在就打开一个AI工具开始探索。 |
| `{{call_to_action_2}}` | emotion 映射 | ≤25字 | 从今天开始，每天进步1%。 |
| `{{golden_sentence}}` | 金句 | ≤20字 | 未来不属于AI，属于会用AI的人。 |

---

## Style → 语速 / 停顿映射

| style | pace | 语速 | 停顿缩放 | 总时长控制 |
|-------|------|------|---------|-----------|
| hype | fast | 220 字/分 | 0.8x | ~9:00~10:00 |
| academic | normal | 190 字/分 | 1.0x | ~9:30~10:30 |
| calm | slow | 170 字/分 | 1.2x | ~10:00~11:00 |
| storytelling | varied | 180~210 字/分 | 动态 | ~9:30~10:30 |

---

## Emotion → 各幕语气映射

| emotion | 幕1开场 | 幕2翻转 | 幕3方法 | 幕4收尾 |
|---------|---------|---------|---------|---------|
| anxiety | urgent | serious | determined | empowering |
| hope | warm | reflective | encouraging | inspiring |
| identity | resonant | challenging | practical | declarative |
| elite | calm | analytical | authoritative | visionary |

---

## 填充示例（完整 10 分钟）

```text
【幕1：问题冲击 — 0:00~2:00】

你知道AI正在取代多少编程工作吗？
这个数字可能远超你的想象。

麦肯锡最新报告显示，3亿岗位将在未来几年受影响。
其中程序员群体首当其冲。
70%的编码工作已经可以被AI自动化完成。

头部科技公司正在批量替代初级编程岗位。
GPT-4的编程能力已经超过了初级工程师的平均水平。



【幕2：认知翻转 — 2:00~5:30】

但先别慌，大多数人其实搞错了一件事。

很多人以为AI会完全取代程序员。
实际上，AI取代的是任务，而不是职业。

有人认为只有大厂才用得上AI。
真相是，个人开发者正在用AI实现十倍的产出效率。

还有人觉得现在学AI已经太晚了。
事实恰恰相反，AI工具还在快速发展期，现在是最佳入场时机。

真正的危机从来不是AI淘汰你。
而是会用AI的人，正在悄然超越你。

你的竞争对手从来不是AI工具本身。
而是那些比你更早掌握了AI工具的同行。
学会用AI的人，正在重新定义行业的规则。



【幕3：方案路径 — 5:30~8:30】

下面是一个普通人也能逐步实践的方案。

第一步是诊断，先找出你工作中可以被AI优化的部分。
第二步是学习，每天花三十分钟掌握一个AI工具。
第三步是实践，用AI独立完成一个真实项目。

我有一个学员，零基础起步，用三个月时间做出了一个自动生成PPT的工具。
现在这个工具每月能为他带来三万的收入。

第四步是迭代，建立你自己的AI工作流，持续优化效率。
第五步是输出，用AI放大你的个人品牌和专业影响力。



【幕4：升华号召 — 8:30~10:00】

归根结底，不是AI淘汰你，而是会用AI的人正在淘汰你。

想象一下，六个月后的你会是什么样子。
当别人还在观望和焦虑，你已经走在了前面。

现在就去打开一个AI工具开始探索。
从今天起，每天进步一点点。

未来从来不属于AI，而是属于那些善于使用AI的人。
```

---

## 约束

- 每句 ≤ 25 字（TTS 友好）
- 4 幕结构不可合并或跳过
- 停顿标记占总时长 15~20%（≈ 90~120 秒停顿）
- 情绪/语气标记每幕仅头部使用一次
- 总输出 ≈ 1800~2200 字（含标记），纯文本 `.txt` 文件
- 输出格式：`03_audio/{id}-script.txt`

---

## ⚠️ 标记清理规则 — TTS 预处理

**`[pause XXXXms]` 和 `[tone:]` 是模板可读性标记，不是 TTS 命令。**

在将填充后的脚本传给 TTS 引擎之前，**必须执行以下处理**：

```python
import re

def clean_script_for_tts(raw_text: str) -> str:
    """移除所有标记，保留纯文本"""
    # 1. 移除 [pause XXXXms] [tone:] [emotion:] [pace:] [total_duration:]
    text = re.sub(r'\[(pause|tone|emotion|pace|total_duration)[^\]]*\]', '', raw_text)
    # 2. 移除 --- 分隔线
    text = re.sub(r'^---+', '', text, flags=re.MULTILINE)
    # 3. 保留空行作为段落分隔（TTS 基于标点自然停顿）
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 4. 移除行首编号 "N. " → 避免 TTS 读出"第一点"
    text = re.sub(r'^\d+[\.\、]\s+', '', text, flags=re.MULTILINE)
    return text.strip()
```

**为什么必须这样做**：
- `[pause 500ms]` 不是标准 SSML，edge-tts 不会正确解析
- `<break>` SSML 标签在嵌套到 `<prosody>` 内部时，edge-tts 无法正确解析（SSML 模式）
- 纯文本 + 标点符号的自然停顿在所有 TTS 引擎上行为一致
- 字数已通过模板约束保证时长，不需要额外停顿标记

---

## 合成策略 — TTS 执行指南

> ⚠️ **重要**：本文件的文本模板定义的是「输出什么」。本节定义的是「怎么合成」。
> **核心原则**：使用 edge-tts 原生慢速，**禁止**后处理速度拉伸（moviepy speed_scale 会造成音质劣化）。

### 1. 核心原则：原生慢速替代后处理拉伸

```
❌ 错误方案（导致音质劣化）:
   edge-tts (rate=+10%, ~70秒) → moviepy speed_scale(0.75) → ~600秒
   └─ moviepy 时间拉伸算法引入数字失真、颤音、机械感

✅ 正确方案（原生慢速，无失真）:
   edge-tts (rate=-30%, ~原始时长3x) → 分段合成 → concat合并
   └─ TTS 引擎原生慢速输出，无后处理，保真
```

**强制规则**：`--rate` 参数用于**控制目标语速**，不是微调。目标 600 秒时长通过 `rate=-25%~-35%` 实现，**绝不用 moviepy 做 speed_scale**。

### 2. edge-tts 调用规范

**注意：Windows 上必须通过 python 模块调用，不能直接 `edge-tts` 命令。**

```bash
# ✅ 正确（跨平台，原生慢速）
python -m edge_tts --voice zh-CN-XiaoxiaoNeural --rate=-30% --text "$text" --write-media output.mp3

# ❌ 错误（Windows 上可能不可用）
edge-tts --voice zh-CN-XiaoxiaoNeural --text "$text" --write-media output.mp3
```

### 3. 语音选择与多 Speaker 映射

**课程推荐使用多 voice 切换，提升沉浸感**：

| 场景 | Voice | 情绪特质 | 适用 |
|------|-------|---------|------|
| 开场/号召 | `zh-CN-YunxiNeural` | 年轻男声，活泼有力 | 开场、行动号召 |
| 技术讲解 | `zh-CN-YunyangNeural` | 成熟男声，稳重权威 | 核心观点、原理 |
| 温暖收尾 | `zh-CN-XiaoxiaoNeural` | 年轻女声，温暖亲切 | 总结、希望感 |
| 数据展示 | `zh-CN-XiaoyiNeural` | 成熟女声，知性专业 | 数据页、误区澄清 |
| 安全警告 | `zh-CN-YunjianNeural` | 成熟男声，严肃警示 | 安全风险提示 |

**多集课程映射建议**：
```python
VOICE_MAP = {
    "episode_type_intro":    {"voice": "zh-CN-YunxiNeural",  "rate": "-25%", "pitch": "+0Hz"},
    "episode_type_technical": {"voice": "zh-CN-YunyangNeural", "rate": "-30%", "pitch": "+1Hz"},
    "episode_type_summary":  {"voice": "zh-CN-XiaoxiaoNeural", "rate": "-20%", "pitch": "+2Hz"},
    "episode_type_warning":  {"voice": "zh-CN-YunjianNeural", "rate": "-35%", "pitch": "-2Hz"},
}
```

### 4. 时长控制：通过 `--rate` 原生实现

| style | `--rate` 参数 | 语速(字/分) | 预期时长(1800字) |
|-------|-------------|------------|----------------|
| hype | `-20%` | ~176 | ~615s (10.2min) |
| academic | `-25%` | ~165 | ~655s (10.9min) |
| calm | **`-30%`** | ~154 | ~700s (11.7min) |
| storytelling | `-25%` | ~165 | ~655s (10.9min) |

**注意**：`-30%` 是最慢语速，超过此值音调开始不自然。
如果 `--rate=-30%` 仍达不到目标时长，应**增加字数**而非进一步降速。

```bash
# 根据 style 选择原生速率（禁止后处理拉伸）
RATE="-25%"
case $style in
  hype) RATE="-20%" ;;
  calm) RATE="-30%" ;;
  academic|storytelling|*) RATE="-25%" ;;
esac

python -m edge_tts --voice zh-CN-XiaoxiaoNeural --rate=$RATE --text "$text" --write-media act.mp3
```

### 5. 长文本分段合成（强制规则）

**规则**：脚本总字数 > 1200 字时，**必须分段合成**，禁止一次性提交。

```
总脚本 (1800~2200字)
│
├─ 幕1 (~400字)  → 单独 edge-tts (rate=-25%) → act_1.mp3
├─ 幕2 (~700字)  → 单独 edge-tts (rate=-25%) → act_2.mp3
├─ 幕3 (~600字)  → 单独 edge-tts (rate=-25%) → act_3.mp3
├─ 幕4 (~300字)  → 单独 edge-tts (rate=-25%) → act_4.mp3
│
└─ ffmpeg concat 合并 → full_audio.mp3
```

**concat 合并命令**（使用 imageio-ffmpeg 确保完整版 ffmpeg）：
```bash
# 创建文件列表
echo file 'act_1.mp3' > concat.txt
echo file 'act_2.mp3' >> concat.txt
echo file 'act_3.mp3' >> concat.txt
echo file 'act_4.mp3' >> concat.txt

# 合并
python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())" | xargs -I{} "{}" -y -f concat -safe 0 -i concat.txt -c copy full_audio.mp3
```

### 6. 自然停顿设计原则（替代 `[pause]` 标记）

**不使用 `[pause]` 或 `<break>` 标签**，通过语言节奏实现自然停顿：

```
设计原则:
  • 段落间用空行分隔 → TTS 在句号处自然停顿 ~0.3s
  • 金句前加铺垫句 → "让我再重复一遍今天的金句：" → 形成期待
  • 数据后加过渡问句 → "这意味着什么？" → 留出思考时间
  • 避免无意义停顿 → 不在句子中间插入停顿

✅ 示例（自然节奏）:
  "目前超过90%的AI用户从未审查过权限设置。
  
  这意味着什么？大多数企业在AI安全面前几乎是'裸奔'状态。"

  → edge-tts 在句号后自然停顿，换行形成段落间隔

❌ 错误（被 TTS 读出或无效果）:
  "目前超过90% [pause 500ms] 的AI用户从未审查过权限设置。"
  → [pause] 被 TTS 尝试解读，可能读出或忽略
```

### 7. 超时与重试

```python
import subprocess, sys, time

def tts_segment(text, output_path, voice="zh-CN-XiaoxiaoNeural", rate="-25%", max_retries=2):
    """分段 TTS 合成，含超时和重试。使用原生慢速，不后处理。"""
    cmd = [
        sys.executable, "-m", "edge_tts",
        "--voice", voice,
        "--rate", rate,
        "--text", text,
        "--write-media", output_path
    ]
    for attempt in range(max_retries + 1):
        try:
            r = subprocess.run(cmd, check=True, timeout=180, capture_output=True)
            # 验证文件大小
            if os.path.getsize(output_path) > 0:
                return output_path
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, OSError) as e:
            if attempt == max_retries:
                raise RuntimeError(f"TTS failed after {max_retries + 1} attempts: {e}")
            time.sleep(2)
    raise RuntimeError("TTS failed: max retries exceeded")
```

### 8. 输出验证

合成完成后必须验证：

```bash
# 检查文件大小
ls -lh full_audio.mp3                    # 应 > 1 MB（10分钟）

# 检查时长（用 ffprobe）
python -c "
import subprocess, json
r = subprocess.run(['ffprobe', '-v', 'quiet', '-print_format', 'json',
                    '-show_format', 'full_audio.mp3'], capture_output=True, text=True)
info = json.loads(r.stdout)
duration = float(info['format']['duration'])
print(f'Duration: {duration:.1f}s')
assert 540 <= duration <= 720, f'Duration {duration}s out of range (540~720)'
print('✅ Duration OK, 无后处理拉伸')
"
```
