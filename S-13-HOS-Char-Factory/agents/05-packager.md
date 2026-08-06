# Agent 05 · Packager（RawImage[] → AssetBundle）

> 流水线最后一步。把通过质检的图打包成引擎可直接用的资产。

## 职责（按计划 target 执行）

| 产物 | 来源 | 输出 |
|------|------|------|
| 透明抠图 | `out/still/` + `out/chain/` | `out/cutout/*_t.png`（[workflows/03-cutout.md](../workflows/03-cutout.md)） |
| 三视图 | 定稿基准 | `out/sheet/{front,side,back}.png` + `sheet.png` |
| 动画预览 | `out/chain/` | `out/anim/preview.webp` |
| 拆件包 | 抠图产物 | 部件拆分指南 + 遮罩（半自动） |

## 拆件打包（游戏引擎前置）

透明底 ≠ 可拆件。AI 输出是整体像素图，绑骨骼（Spine/DragonBones）前需拆件：

1. **平涂风**：Photoshop 魔棒/快速选择按图层拆（头/左臂/右臂/裙/鞋/上身）；
2. **半自动**：ComfyUI-Diffusion-2D-Seg 按 头发/皮肤/衣服/鞋 分色遮罩；
3. **手动微调**：部件边缘清理是横版开发无法避免的步骤。

拆件产物建议结构：

```
out/assets/
├── head/  arm_l/  arm_r/  torso/  skirt/  shoes/
│   └── 000_male.png / 500_mid.png / 1000_female.png ...
└── parts_manifest.json      # 部件清单：名称/路径/层序/锚点
```

## 产物清单（验收）

- [ ] `out/` 全 ASCII 路径（铁律 7）
- [ ] 命名规范：`000_male / 500_mid / 1000_female`、帧 `01.png…50.png`、透明版 `*_t.png`
- [ ] `parts_manifest.json`（拆件时）可被引擎工具链读取
- [ ] 每个目录附 `README.md`（生成参数回放：seed/prompt/denoise）

## 规则

- NSFW 产物物理隔离：输出根目录追加 `_nsfw` 后缀（如 `out_nsfw/`）。
- 打包不重新生成任何图——只整理、转换、标注。
