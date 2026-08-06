# Prompt SFW 模式附加段

> 在 `content_mode: sfw` 时，追加到 [prompt-base.md](prompt-base.md) 模板末尾。
> 目的：显式声明内容边界，从源头降低误输出概率。

## 附加段（追加在质量词之后）

```text
sfw, non-explicit, clothed, modest outfit, no nudity, no suggestive poses,
no lewd expression, safe for work
```

## 规则

1. SFW 模式负面模板 = [negative.md](negative.md) 基础负面 **+** 全量 NSFW 关键词负面（见 [nsfw-sfw-policy.md](../references/nsfw-sfw-policy.md) 的负面清单）。
2. 服装槽 `{clothes}` 必须完整着装；`{expression}` 不得含 lewd/seductive。
3. 若输出违规图（Inspector 判定），该图废弃并重新生成，不计入产物。

## 兼容性说明

本附加段不阻止 SFW 模式产出"变身差分"等核心能力——只是把内容约束在非露骨范围。差分轴、抠图、拆件、动画全部照常工作。
