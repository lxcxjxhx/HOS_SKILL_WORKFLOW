# 示例 PromptSheet（差分链前 3 帧）

> 对应 [prompt.schema.json](../schemas/prompt.schema.json)。来自示例计划 HCF-20260806-001。
> Runner 直接按本表执行，不再做任何词法调整。

```json
{
  "plan_id": "HCF-20260806-001",
  "style_anchor": "flat color anime style, clean line art, cel shading, no complex shadows, side profile, full body, pure white background, masterpiece, best quality, highres",
  "fixed_slots": {
    "eyes": "amber eyes",
    "skin": "fair skin",
    "background": "pure white background"
  },
  "frames": [
    {
      "frame": 1,
      "t": 0.0,
      "positive": "1boy, flat color anime style, clean line art, cel shading, side profile, full body, short male hair, amber eyes, sharp jawline, stern expression, masculine build, flat chest, broad waist, tall, fair skin, male office shirt and slacks, pure white background, masterpiece, best quality, highres",
      "denoise": 0.42
    },
    {
      "frame": 2,
      "t": 0.02,
      "positive": "1boy, flat color anime style, clean line art, cel shading, side profile, full body, short male hair, amber eyes, sharp jawline, stern expression, masculine build, flat chest, broad waist, tall, fair skin, male office shirt and slacks, pure white background, masterpiece, best quality, highres",
      "denoise": 0.32
    },
    {
      "frame": 3,
      "t": 0.04,
      "positive": "1boy, flat color anime style, clean line art, cel shading, side profile, full body, medium hair, amber eyes, sharp jawline, stern expression, masculine build, flat chest, broad waist, tall, fair skin, male office shirt and slacks, pure white background, masterpiece, best quality, highres",
      "denoise": 0.32
    }
  ],
  "negative": "lowres, bad anatomy, bad hands, missing fingers, extra digits, deformed, blurry, jpeg artifacts, watermark, text, photorealistic, 3d render, complex background, worst quality, two people, duplicate"
}
```

## 说明

- 帧 1 为段首校准帧（denoise 0.42），帧 2/3 为链式帧（0.32）。
- 帧 2→3 只动 `hair` 一个槽（short → medium），符合"一次一槽"铁律。
- NSFW 模式的 `adult, mature woman` 等附加段追加在 positive 末尾（见 [prompt-nsfw.md](../templates/prompt-nsfw.md)）。
