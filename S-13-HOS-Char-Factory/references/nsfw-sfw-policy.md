# NSFW / SFW 双模式内容策略

> 本模块**同一套流水线**同时服务 NSFW 与 SFW 场景，通过内容分级路由保证两种模式都能跑、边界清晰、可审计。

## 1. 模式选择

| 模式 | 适用 | 模板 | 附加要求 |
|------|------|------|----------|
| `sfw`（默认） | 常规角色立绘、差分、拆件、动画 | [prompt-sfw.md](../templates/prompt-sfw.md) | 无 |
| `nsfw` | 成人向变身差分、涩涩演出素材 | [prompt-nsfw.md](../templates/prompt-nsfw.md) | 成年声明 + 分级声明 |

模式声明位置：`config.yaml` 的 `content_mode` + 生产计划 `content_mode`。**两者不一致时取更严格者并警告**。

## 2. 硬护栏（任何模式下生效，不可关闭、不可覆盖）

| 护栏 | 说明 | 动作 |
|------|------|------|
| 未成年人形象 | 无论 SFW/NSFW，未成年角色形象一票否决 | 拒绝执行 + 记录 |
| 真实人物肖像 | 真实人物（在世/离世）肖像一票否决 | 拒绝执行 + 记录 |
| 违法/仇恨内容 | 任何违法题材、仇恨言论一票否决 | 拒绝执行 + 记录 |

以上三条由 [Inspector](../agents/04-inspector.md) 在每张图上强制检查，`config.yaml` 的 `safety` 段为声明（`block_minors: true` 等），语义上不可被计划覆盖。

## 3. NSFW 模式专项规则

1. **成年声明前置**：计划必须含 `adult_decl`（`adult: true` + 年龄 + 身份），缺失即拒绝执行（铁律 4）。
2. **正面词成年锚定**：`adult` / `mature` 必须出现在正面提示词。
3. **分级声明**：计划须声明露骨度（`lewdness: mild | moderate | explicit`），Inspector 按分级校验。
4. **产物隔离**：NSFW 产物目录追加 `_nsfw` 后缀，与 SFW 物理隔离。
5. **负面模板调整**：删除 `negative.md` 末段（nsfw 关键词负面），基础负面保留。

## 4. SFW 模式专项规则

1. **附加段**：正面词追加 `sfw, non-explicit, clothed, modest outfit, no nudity…`。
2. **负面全量**：负面 = 基础 + 画风 + 结构 + **全量 NSFW 关键词负面**。
3. **服装/表情槽约束**：完整着装、无暗示表情。
4. **违规出图处理**：Inspector 判定违规 → 废弃 + 重生成，不计入产物。

## 5. 审计与追溯

- 每个计划 id（`HCF-*`）+ `adult_decl` + 分级声明写入产物目录 `README.md`（生成参数回放）。
- InspectReport 记录每次拒绝（图/原因/动作），便于合规审计。
- 模式切换历史写入 [CHANGELOG.md](../CHANGELOG.md)。

## 6. 一句话原则

> **管道双轨、护栏单轨**：SFW/NSFW 共用生产管道，硬护栏在任何模式下都不打折。
