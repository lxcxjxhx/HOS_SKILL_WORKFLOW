# Prompt 基础模板（12 差分槽系统）

> 槽 = 一个可在 t 轴上渐变替换的语义单元。**固定 seed + 一次只动一个槽**是全部稳定性的来源。
> 完整槽位定义见 [references/tag-slots.md](../references/tag-slots.md)。

## 结构

```
[数量+主体] [画风锚] [视图/构图] [12 个差分槽按序填充] [背景] [质量词]
```

## 模板骨架

```text
{count} {gender}, {style_anchor}, {view}, {hair}, {eyes}, {face}, {expression},
{body}, {chest}, {waist_hips}, {height}, {skin}, {clothes}, {accessory},
{aura}, {background}, {quality_tags}
```

## 示例填充（000_male 定稿）

```text
1boy, flat color anime style, clean line art, cel shading, no complex shadows,
side profile, full body, short male hair, amber eyes, sharp jawline, stern expression,
masculine build, flat chest, broad waist, tall, fair skin, male office shirt and slacks,
none, pure white background, masterpiece, best quality, highres
```

## 差分槽变更示例（t=0.5 中图）

```text
1boy, 1girl, androgynous, flat color anime style, clean line art, cel shading,
side profile, full body, medium hair, amber eyes, soft jawline, neutral expression,
slender build, small chest, curving waist, medium height, fair skin,
unisex shirt and shorts, none, pure white background, masterpiece, best quality, highres
```

## 使用规则

1. 槽内文本变更时**保留槽间逗号结构与顺序**，模型对"槽位语义"敏感。
2. 画风锚 `style_anchor` 三张定稿 + 全链**永远不变**。
3. 质量词固化：`masterpiece, best quality, highres`。
4. 负面模板固定见 [negative.md](negative.md)。
5. NSFW 场景在此模板末尾追加 [prompt-nsfw.md](prompt-nsfw.md) 附加段，SFW 场景追加 [prompt-sfw.md](prompt-sfw.md)。
