# Prompt NSFW 模式附加段

> 在 `content_mode: nsfw` 且**成年声明已通过**时，追加到 [prompt-base.md](prompt-base.md) 模板末尾。
> 前置：计划含 `adult: true` + 角色年龄/身份声明（见 [nsfw-sfw-policy.md](../references/nsfw-sfw-policy.md)）。缺失即拒绝执行。

## 附加段（追加在质量词之后）

```text
{adult_descriptor}, {nsfw_body_tags}, {nsfw_expression}, {nsfw_atmosphere}
```

其中：

| 占位 | 说明 | 示例 |
|------|------|------|
| `{adult_descriptor}` | 成年标识（必填，锚定角色为成年人） | `mature woman, adult` |
| `{nsfw_body_tags}` | 差分轴关注的身体渐变标签 | `large breasts, hourglass figure` |
| `{nsfw_expression}` | 符合剧情气质的表情 | `blushing, aroused expression` |
| `{nsfw_atmosphere}` | 氛围词（克制使用） | `seductive, erotic atmosphere` |

## 规则（铁律）

1. **成年锚定不可省略**：`adult` / `mature` 必须出现在正面提示词，与年龄声明一致。
2. **差分优先于露骨**：NSFW 模式的核心仍是 TSF 差分演出；露骨度按计划分级，避免纯贴皮涩图。
3. **负面必须保留**：负面模板即使 NSFW 模式也不删除基础负面（崩坏/畸形防护），仅删除"nsfw 关键词负面"段。
4. **输出标注**：NSFW 产物目录追加 `nsfw` 后缀（如 `out_nsfw/still/`），与 SFW 产物物理隔离。
5. **拒绝清单**：未成年人、真实人物、违法题材在任何情况下不进入本模板。

## 与 SFW 的互斥

同一生产计划只能声明一种模式；`config.yaml` 的 `content_mode` 与计划声明不一致时以**更严格者**为准并警告。
