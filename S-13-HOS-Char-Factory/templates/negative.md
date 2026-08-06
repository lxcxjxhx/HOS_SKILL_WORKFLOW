# 负面 Prompt 模板

> 全部场景共用。NSFW 模式删除最后一段（nsfw 关键词负面），其余保留。

## 基础负面（永远保留）

```text
lowres, bad anatomy, bad hands, missing fingers, extra digits, fused fingers,
extra limbs, deformed, disfigured, mutated, blurry, jpeg artifacts, watermark,
text, signature, cropped, out of frame, worst quality, low quality, normal quality
```

## 画风负面（平涂风专用）

```text
photorealistic, 3d render, painting, sketch, monochrome, grayscale, complex background,
detailed shading, harsh lighting, realistic skin texture
```

## 结构负面（差分链专用）

```text
two people, duplicate, multiple views in one image, inconsistent body,
asymmetrical features, mixed gender clothing on wrong body
```

## NSFW 关键词负面（仅 SFW 模式追加）

```text
nudity, nude, explicit, nsfw, porn, xxx, sex, hentai, naked, topless, bottomless,
visible genitals, lewd, seductive, suggestive, provocative pose, erotic, revealing clothes
```
