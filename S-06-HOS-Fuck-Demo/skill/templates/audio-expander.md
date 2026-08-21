# Audio Expander — 内容包 → 10分钟音频稿扩展机制

> **问题**：内容包模板（~600-800 tokens）远不足以驱动 10 分钟视频（需 ~2800 字音频稿）。
> **解决**：本文件定义从短内容包到长音频稿的扩展规则。

---

## 1. 扩展概览

```
输入: 内容包 (600~800 tokens, ~400字)
  │
  ├─ 6个 key_ideas (每个 ≤15字)
  ├─ 6个 idea_details (每个 ≤30字)
  ├─ 3层叙事弧 (每层 ≤30字)
  ├─ 情绪曲线 (4段)
  └─ 2个事实素材
  │
  ▼ 扩展 (4~6x)
  │
输出: 10分钟音频稿 (~2800字 / ~4000 tokens)
  ├─ 幕1: ~120s → ~400字
  ├─ 幕2: ~210s → ~700字
  ├─ 幕3: ~180s → ~600字
  └─ 幕4: ~90s  → ~300字
       + 停顿标记占用 ~20% 时长
```

---

## 2. 扩展规则

### 2.1 扩展因子

| 内容包元素 | 扩展为音频稿 | 扩展因子 |
|-----------|-------------|---------|
| opening_hook (25字) | 幕1开场 (150字) | 6x |
| 6个 key_ideas (15字×6) | 6个完整段落 (300字×6) | 20x |
| 3层叙事弧 (30字×3) | 3个转折段 (150字×3) | 5x |
| 情绪曲线 (4词) | 4段语气指示 + 话术 | — |
| fact_1/fact_2 (70字) | 2个完整案例 (200字×2) | 6x |
| one_line_insight (20字) | 金句展开 + 升华 (150字) | 7x |

### 2.2 最小输入要求

扩展器要求内容包至少包含以下字段，否则无法扩展：

```
必需的:
  □ opening_hook        → 幕1开场
  □ key_ideas[1~6]       → 幕2 6个观点段落
  □ idea_details[1~6]    → 每个观点的展开素材
  □ layer1/2/3_core      → 3幕叙事结构
  □ one_line_insight     → 幕4金句
  □ fact_1 / fact_2      → 案例和证据

可选的:
  □ emotion_start/build/peak/end → 语气映射
  □ 用户提供的 extra_context     → 更多素材
```

---

## 3. 逐幕扩展模板

### 幕1: 开场 + 问题冲击 (~120s, ~400字)

```
从 opening_hook 扩展:
  → 开场句 (原文 opening_hook)
  → 重复强调 (换说法再说一遍)
  → 问题展开 (把 layer1_core 扩展为2~3句)
  → 数据引入 (fact_1 展开为完整陈述)
  → 过渡句 (引向幕2)

字数: ~400字 | 扩展因子: 6x
```

### 幕2: 认知翻转 (~210s, ~700字)

```
从 6个 key_ideas + layer2_core 扩展:
  → 过渡导入 (layer1→layer2) 50字
  → 观点1: key_idea_1 + idea_1_detail + 举例  120字
  → 观点2: key_idea_2 + idea_2_detail + 展开  120字
  → 观点3: key_idea_3 + idea_3_detail + 衔接  120字
  → 观点4: key_idea_4 + idea_4_detail + 举例  120字
  → 观点5: key_idea_5 + idea_5_detail + 展开  120字
  → 观点6: key_idea_6 + idea_6_detail + 升华  120字

字数: ~700字 | 每个观点展开至 3~4句
```

### 幕3: 方案路径 (~180s, ~600字)

```
从 layer3_core + fact_2 扩展:
  → 过渡句 (认知→行动) 30字
  → 方法1: 步骤+解释  100字
  → 方法2: 步骤+解释  100字
  → 方法3: 步骤+解释  100字
  → 案例故事 (fact_2 展开)  150字
  → 方法4: 步骤+解释  80字
  → 方法5: 步骤+解释  60字

字数: ~600字 | 每个步骤扩展为2~3句
```

### 幕4: 升华 + 号召 (~90s, ~300字)

```
从 one_line_insight + 情绪曲线扩展:
  → 核心洞察 (one_line_insight 展开)  80字
  → 愿景描绘 (emotion_end 映射)  80字
  → 行动号召  70字
  → 金句收尾  40字

字数: ~300字 | 扩展因子 7x
```

---

## 4. 风格转换规则

### 4.1 各风格的话术特征

| style | 句子长度 | 修辞特征 | 过渡词 | 案例风格 |
|-------|---------|---------|-------|---------|
| `academic` | 15~25字 | 逻辑连接词、数据引用、客观陈述 | 因此/然而/值得注意的是 | 研究数据、统计报告 |
| `hype` | 8~15字 | 反问、对比、短促有力 | 你知道吗？/重点来了！/想象一下 | 真实用户案例、对比数据 |
| `calm` | 10~18字 | 留白、隐喻、克制 | 其实/慢慢来/不妨想一想 | 个人体悟、哲学思考 |
| `storytelling` | 5~30字 | 画面描写、对话感、悬念 | 这时/突然间/故事要从...开始 | 完整人物故事、场景还原 |

### 4.2 实例: 同一观点在不同风格下的扩展

```
原始 key_idea: "70%编码岗面临替代"

academic:
  → "根据麦肯锡全球研究院的报告，到2025年，生成式AI将影响约3亿个工作岗位，
     其中编程相关岗位占比最高。这并不意味着70%的程序员会失业，
     而是他们的工作方式将被重塑。"

hype:
  → "70%！你没看错。70%的编码岗位正在被AI吞噬。
     你还觉得这离你很远吗？你的同事可能已经在用AI工具了。"

calm:
  → "不妨想一想。当70%的编码工作可以由AI完成时，
     真正重要的是那些无法被替代的能力。理解、判断、创造。
     这些才是我们该专注的方向。"

storytelling:
  → "小张坐在工位上，看着屏幕上跳动的代码。
     他忽然想到，这些代码是不是有一天就不再需要他来写了？
     70%的编码工作正在被AI替代——这不是危言耸听，而是正在发生的事。"
```

### 4.3 情绪映射到话术

| emotion | 开场倾向 | 过渡倾向 | 收尾倾向 | 语气标记 |
|---------|---------|---------|---------|---------|
| `anxiety` | 紧迫感、倒计时 | 转折要快 | 紧迫行动指令 | urgent |
| `hope` | 温暖引入 | 鼓励式过渡 | 愿景式收尾 | warm |
| `identity` | 共鸣感、归属 | 共同视角 | 宣言式收尾 | resonant |
| `elite` | 高标准、门槛 | 分析视角 | 格言式收尾 | calm_authoritative |

---

## 5. 时长计算

### 5.1 字数→时长公式

```
中文朗读速度: ~3.5字/秒 (~210字/分钟) — 标准 pace
带停顿: 有效文字占比 ~80% (20%为停顿)

公式:
  总时长(秒) = 总字数 / 3.5 / 0.8
  
  示例:
    2800字 → 2800 / 3.5 / 0.8 = 1000秒 (16.7分钟) ← 太长!
    需要压缩

目标 600秒 时的字数:
  600 = 字数 / 3.5 / 0.8
  字数 = 600 × 3.5 × 0.8 = 1680字 ← 这是最低目标

带停顿标记的 1800~2200字 = 600±30秒 ✓
```

### 5.2 Style 调整系数

| style | 语速(字/秒) | 停顿占比 | 600秒对应字数 |
|-------|------------|---------|-------------|
| academic | 3.7 | 18% | 600×3.7×0.82 = ~1820字 |
| hype | 4.2 | 15% | 600×4.2×0.85 = ~2140字 |
| calm | 3.0 | 22% | 600×3.0×0.78 = ~1400字 |
| storytelling | 3.5 (动态) | 18% | 600×3.5×0.82 = ~1720字 |

---

## 6. 扩展器参考实现

```python
def expand_to_audio(content_pack: dict, style: str = "academic",
                    emotion: str = "neutral") -> list:
    """
    内容包 → 4幕音频稿文本数组

    参数:
      content_pack: 内容包字典 (必须含 key_ideas, idea_details, layer*_core 等)
      style: 风格 (影响话术和语速)
      emotion: 情绪 (影响语气)

    返回:
      [act1_text, act2_text, act3_text, act4_text]
    """
    style_rules = {
        "academic": {
            "sent_len": (15, 25), "transition": "因此/然而/值得注意的是",
            "example_style": "数据报告",
        },
        "hype": {
            "sent_len": (8, 15), "transition": "你知道吗？/重点来了！",
            "example_style": "用户案例",
        },
        "calm": {
            "sent_len": (10, 18), "transition": "其实/不妨想一想",
            "example_style": "个人体悟",
        },
        "storytelling": {
            "sent_len": (5, 30), "transition": "这时/故事要从...开始",
            "example_style": "人物故事",
        },
    }[style]

    ideas = content_pack.get("key_ideas", [])
    details = content_pack.get("idea_details", [])

    # ── 幕1: 开场 + 问题冲击 ──
    act1 = (
        f"{content_pack['opening_hook']} "
        f"{_restate(content_pack['opening_hook'], style)} "
        f"{_expand_layer(content_pack.get('layer1_core', ''), style, 2)} "
        f"{_expand_fact(content_pack.get('fact_1', ''), style)}"
    )

    # ── 幕2: 认知翻转 ──
    act2_parts = [_get_transition("layer1→layer2", style)]
    for i, (idea, detail) in enumerate(zip(ideas, details)):
        act2_parts.append(_expand_idea(idea, detail, style, emotion))
    act2 = " ".join(act2_parts)

    # ── 幕3: 方案路径 ──
    act3_parts = [_get_transition("layer2→layer3", style)]
    act3_parts.append(_expand_layer(content_pack.get('layer3_core', ''), style, 3))
    act3_parts.append(_expand_fact(content_pack.get('fact_2', ''), style, as_story=True))
    act3 = " ".join(act3_parts)

    # ── 幕4: 升华 + 号召 ──
    act4 = (
        f"{_expand_insight(content_pack.get('one_line_insight', ''), style)} "
        f"{_get_vision(emotion, style)} "
        f"{_get_cta(emotion)} "
        f"{content_pack.get('golden_sentence', '')}"
    )

    return [act1.strip(), act2.strip(), act3.strip(), act4.strip()]


def _expand_idea(idea, detail, style, emotion):
    """单个观点扩展为 3~4 句"""
    # 实现略：按风格规则扩展
    return f"{idea}，{detail}。{_get_example(idea, style)}"


def _restate(text, style):
    """换说法再说一遍"""
    rules = {
        "academic": f"换句话说，{text}。",
        "hype": f"是的，{text}！",
        "calm": f"{text}。慢慢想想这个事实。",
        "storytelling": f"你没听错，{text}。",
    }
    return rules[style]
```

---

## 7. 与流水线的集成

```
create/demo/mvp 流水线中:

  STEP3 (内容包, 600~800 tokens)
    │
    ▼
  [新增] 扩展步骤 (audio-expander):
    输入: 内容包 (短)
    输出: 4幕扩展文本 (每幕200~700字)
    规则: 按 style/emotion 自动选择话术
    │
    ▼
  STEP5 (填充 audio-script.md 模板)
    输入: 4幕扩展文本
    输出: 完整 TTS 音频稿 (~2800字)
```

**自动执行规则**：扩展步骤在 STEP3 之后、STEP5 之前自动执行，不询问用户。
