# ComfyUI 插件清单（出图 + 抠图一体化）

> 核心思路：**生成 → 抠图 → 拆件**三段式。以下插件按用途分组，安装后在 [comfyui-workflow.json](../templates/comfyui-workflow.json) 的链路上对应。

## 1. 自动抠图（剥离白色背景）

| 插件 | 仓库 | 特点 |
|------|------|------|
| ComfyUI-RMBG | [Acly/ComfyUI-RMBG](https://github.com/Acly/ComfyUI-RMBG) | ★ 最推荐。基于 RMBG-1.4，速度快，平涂风边缘抠得干净 |
| ComfyUI-Inspyrenet-Rembg | [john-mnz/ComfyUI-Inspyrenet-Rembg](https://github.com/john-mnz/ComfyUI-Inspyrenet-Rembg) | 基于 InSPyReNet，细节保留更好，略慢 |

作用：生成的图片输出后直接过 `RemoveBackground` 节点 → 得到带 Alpha 通道的透明背景 PNG。

## 2. 形象统一与姿势控制

| 插件 | 仓库 | 特点 |
|------|------|------|
| ComfyUI-IPAdapter-Plus | [cubiq/ComfyUI_IPAdapter_plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus) | ★ 角色特征迁移：放参考图，生成姿势不同但长得一样的图（锁脸/锁画风） |
| ComfyUI-ControlNet | ComfyUI 内置 + [comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI) 模型库 | 配合 OpenPose 姿态节点精准控制站姿/侧身/奔跑 |

## 3. 拆件辅助

| 插件 | 仓库 | 特点 |
|------|------|------|
| ComfyUI-Diffusion-2D-Seg | [Lercan/ComfyUI-Diffusion-2D-Seg](https://github.com/Lercan/ComfyUI-Diffusion-2D-Seg) | 自动把图按 头发/皮肤/衣服/鞋 分成不同颜色遮罩，半自动拆件 |

## 4. 底模与 LoRA（非插件，Civitai 下载）

- 推荐底模：**MeinaMix / Anything V5 / GhostMix**（SFW 平涂）；**Pony V6 XL / NoobAI-XL / Illustrious**（NSFW 差分强、LoRA 生态全）。
- 平涂感提示词：`flat color, cel shading, no complex shadows`。
- 差分 LoRA：Gender Swap / hair_length_slider / very_long_hair 等，权重随 t 轴渐变。

## 5. 标准节点链路（含抠图）

```
Load Checkpoint ──┬─→ CLIP Encode(正) ─┐
                  ├─→ CLIP Encode(负) ─┼─→ KSampler ─→ VAE Decode ─→ RMBG(RemoveBackground)
                  └─→ Empty Latent ────┘                                        │
                                                        ┌───────────┬───────────┘
                                                        ▼           ▼
                                                   Save PNG   Save PNG(with alpha)
```

⚠ **避坑**：ComfyUI 直接连 `Save Image` 有时丢透明底。必须：保存格式为 PNG；或加 `Image Composite Alpha` 手动拼透明底；或使用自定义 `Save PNG with Alpha` 节点。

## 6. 拆件红线提醒

透明底 ≠ 可拆件。AI 输出是整体像素图，绑骨骼前必须拆件（见 [agents/05-packager.md](../agents/05-packager.md)）：

1. 平涂风 → PS 魔棒/快速选择拆图层；
2. 半自动 → Diffusion-2D-Seg 分色遮罩；
3. 手动微调部件边缘——横版开发无法避免的一步。
