# TTS Presets — 语音预设配置

> 按场景预设 TTS 参数，方便 AI 快速选择。

---

## Voice Presets

| Preset | 引擎 | Voice | 速率 | 音调 | 适用 |
|--------|------|-------|------|------|------|
| `lecture` | edge-tts | zh-CN-XiaoxiaoNeural | +0% | 0 | 课程/知识讲解 |
| `calm-talk` | edge-tts | zh-CN-YunxiNeural | -5% | -2 | 价值观/深度内容 |
| `story` | edge-tts | zh-CN-YunjianNeural | +5% | +2 | 故事/有声书 |
| `hype` | edge-tts | zh-CN-YunxiNeural | +15% | +3 | 短视频/营销 |
| `speed-learn` | edge-tts | zh-CN-XiaoxiaoNeural | +30% | 0 | 速听/复习 |

---

## Style → Voice 映射

| style 参数 | 推荐 Preset | 说明 |
|-----------|------------|------|
| `academic` | `lecture` | 正式、清晰、语速适中 |
| `calm` | `calm-talk` | 沉稳、缓慢、有分量 |
| `storytelling` | `story` | 有起伏、叙事感 |
| `hype` | `hype` | 快节奏、有感染力 |

---

## Emotion → Voice 微调

| emotion | 在 Preset 基础上 |
|---------|-----------------|
| `anxiety` | 速率 +10%，音调 +2（紧迫感） |
| `hope` | 速率 -5%，音调 +1（温暖） |
| `identity` | 速率 0%，音调 -1（共鸣） |
| `elite` | 速率 -10%，音调 -3（权威） |

---

## Style → Rate 精确映射

用于 edge-tts `--rate` 参数，精确控制时长：

| style | `--rate` | 语速 | 预期时长影响 | 适用场景 |
|-------|---------|------|------------|---------|
| `academic` | `+0%` | ~190 字/分 | 标准 600s | 课程/知识 |
| `hype` | `+10%` | ~220 字/分 | 缩短 ~10%~540s | 营销/短视频 |
| `calm` | `-10%` | ~170 字/分 | 延长 ~10%~660s | 价值观/深度 |
| `storytelling` | `+0%` | 180~210 字/分 | 动态调节 | 故事/有声书 |

## 输出格式

AI 只需输出：

```yaml
tts_preset: lecture          # 选 preset
voice: zh-CN-XiaoxiaoNeural
rate: "+0%"                  # 按 style 映射（见上方）
pitch: "0Hz"
script: "..."                # 已短句化的音频稿
```
