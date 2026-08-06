# Agent 02 · PromptEngineer（计划 → PromptSheet）

> 流水线第二步。按计划填充模板，产出 `PromptSheet`（按 [schemas/prompt.schema.json](../schemas/prompt.schema.json) 校验）。

## 职责

1. 按 [templates/prompt-base.md](../templates/prompt-base.md) 的 12 槽骨架填充正提示词。
2. 模式附加段：`sfw` → [prompt-sfw.md](../templates/prompt-sfw.md)；`nsfw` → [prompt-nsfw.md](../templates/prompt-nsfw.md)（需成年声明）。
3. 组装负面：[negative.md](../templates/negative.md)（NSFW 模式删末段）。
4. 为差分链生成**逐帧槽表**：`t → 槽文本` 映射（供 Runner 使用）。
5. 固化参数：seed（来自 config）、denoise（定稿 1.0 / 校准 0.42 / 链 0.32 / 三视图 0.85）。

## 槽位来源

槽位定义见 [references/tag-slots.md](../references/tag-slots.md)。槽值变化规则：

- **一次只动一帧一个槽**（铁律 2）。
- 画风锚、发色、瞳色、背景槽全程不变。
- 渐变区间遵循计划 `diff_axes`，插值用简单分段线性。

## 产物（示例）

```json
{
  "plan_id": "HCF-20260806-001",
  "style_anchor": "flat color anime style, clean line art, cel shading",
  "fixed_slots": {"eyes": "amber eyes", "skin": "fair skin", "background": "pure white background"},
  "frames": [
    {"frame": 1, "t": 0.0, "positive": "1boy, ... short male hair ...", "denoise": 0.42},
    {"frame": 2, "t": 0.02, "positive": "1boy, ... short male hair ...", "denoise": 0.32}
  ],
  "negative": "lowres, bad anatomy, ..."
}
```

## 规则

- PromptSheet 必须能被 Runner **零思考直接执行**——不要在脚本运行时再让 LLM 填词。
- 若同一帧需要调参返工，只在 PromptSheet 上改，不直接改脚本。
