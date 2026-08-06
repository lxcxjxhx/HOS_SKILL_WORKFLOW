# 12 差分槽（TAG Slot）全表

> 槽 = 一个可在 t 轴渐变替换的语义单元。**固定 seed + 一次只动一个槽**是差分稳定性的全部来源。

## 槽位定义

| # | 槽 | 语义 | t 轴渐变示例（男→女） | 备注 |
|---|----|------|----------------------|------|
| 1 | `count/gender` | 数量与性别 | `1boy` → `1boy,1girl,androgynous` → `1girl` | 中段用 androgynous 桥接 |
| 2 | `hair` | 发型 | `short male hair` → `medium hair` → `very long hair` | 渐变最直观的槽 |
| 3 | `eyes` | 瞳色 | 全程固定 | 锚定角色识别度 |
| 4 | `face` | 脸型 | `sharp jawline` → `soft jawline` → `delicate face` | 骨相软化 |
| 5 | `expression` | 表情 | `stern` → `neutral` → `gentle smile` | 气质轴 |
| 6 | `body` | 整体体格 | `masculine build` → `slender build` → `hourglass figure` | 体型主轴 |
| 7 | `chest` | 胸部 | `flat chest` → `small chest` → `large breasts` | NSFW 重点槽 |
| 8 | `waist_hips` | 腰臀 | `broad waist` → `curving waist` → `narrow waist, wide hips` | 曲线轴 |
| 9 | `height` | 身高 | `tall` → `medium height` → `petite` | 比例轴 |
| 10 | `skin` | 肤质 | `fair skin`（固定） | 差分链可微调细腻度 |
| 11 | `clothes` | 服装 | 男装 → 中性 → 女装 | 与差分同步 |
| 12 | `aura/accessory` | 氛围/饰品 | `none` | 剧情向（如校服/镜子） |

## 使用规则

1. 每帧只动 **1 个槽**（铁律 2）；槽间用逗号分隔、顺序固定。
2. `eyes`、`skin`、`background`、`style_anchor` 四个槽**全程不动**。
3. 渐变区间来自计划 `diff_axes`；分段线性插值，区间外取端点值。
4. 一个槽的渐变区间可以错开（如 chest 0.2→0.9，hair 0.0→1.0），形成"身体先变、头发后变"的层次感——这是顺滑变身的关键技巧。

## 与 PromptSheet 的关系

PromptEngineer 按本表 + 计划 `diff_axes` 生成逐帧槽文本，Runner 零思考执行。
