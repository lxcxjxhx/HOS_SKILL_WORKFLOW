---
name: HOS-Chara-Sequence
version: "1.0.0"
description: "ComfyUI Character Portrait Sequence Generator — scene-config driven, outputs smooth frame-by-frame character progression portraits (growth / evolution / transformation / costume change) as PNG sequences for game assets"
author: HOS Team
tags:
  - comfyui
  - character-art
  - sprite-sequence
  - game-assets
  - portrait-generation
  - t2i
compatibility:
  - claude-code
  - cursor
  - windsurf
  - github-copilot
  - trae-cn
license: MIT
metadata:
  category: content-production
  subCategory: art-asset-pipeline
  risk-level: low
  confidence: 0.85
---

# HOS-Chara-Sequence — Character Portrait Sequence Generator

> **ComfyUI 角色立绘序列生成框架** — 同一角色逐帧渐进变化(成长 / 进化 / 变身 / 状态变化),输出可直接进游戏引擎的 PNG 序列帧。

---

## 1. What It Does

把「角色状态逐帧渐变立绘」做成可复用生成管线。适用于小游戏资源生产:

- 角色成长(幼年 → 少年 → 成年)
- 宠物/怪物进化链(幼体 → 成体,体型/角/翅膀逐帧长大)
- 变身 / 形态变化(魔法少女变身、觉醒、魔化)
- 状态变化(受伤、恢复、换装、季节服装)

**同一角色、画风统一、逐帧平滑** —— 这是核心能力,由「固定风格段 + 特征档位」双机制保证。

## 2. Why This Approach (Key Insights)

| 方案 | 结论 | 原因 |
|---|---|---|
| img2img / 基础图驱动 | ❌ 变化被压制 | FLUX latent 结构锁死特征,提示词改动几乎不生效,还会画风漂移 |
| Easy-Use forLoop 循环 | ❌ 不稳定 | ComfyUI 0.30.2 上 expand 递归有竞态,时灵时不灵 |
| **纯文生图(T2I)+ 展开式节点** | ✅ **采用** | 每帧完全由提示词驱动,变化忠实;展开式平铺节点可靠 |

## 3. Architecture

```
scenes/<场景>.json  ──►  gen_stage_prompts.py  ──►  stage_prompts.json(100帧渐进提示词)
                          (唯一性校验)                    │
                                                          ▼
                                                   gen_workflow_t2i.py
                                                          │
                     ComfyUI-Shared/output/ ◄── 执行 ──  workflow.json(展开式 T2I,405 节点)
```

## 4. Quick Start (新场景 3 步)

```bash
# 1. 写场景配置(模板见 scenes/*.json)
# 2. 生成 100 帧渐进提示词(自动唯一性校验)
python scripts/gen_stage_prompts.py scenes/chara_growth.json

# 3. 生成工作流并执行
python scripts/gen_workflow_t2i.py 100 chara_sequence_100.json
# 拖入 ComfyUI -> Queue Prompt -> 输出 ComfyUI-Shared/output/chara_seq_<帧号>_00001_.png
```

## 5. Scene Config Schema

```json
{
  "name": "场景名",
  "frames": 100,
  "template": "固定风格段(画风/构图/服装/背景),含 {subject} 占位 —— 所有帧共用,保证统一",
  "unique_suffix": "percent",
  "features": {
    "特征A": ["档位0", "档位1", "档位2", ...],
    "特征B": ["档位0", ...]
  }
}
```

### 特征档位设计规范(丝滑的关键)

- 每个特征 **8-25 档**;相邻档位词差异要小(`A-cup` → `full A-cup` → `barely B-cup`),整体渐进
- **各特征档位数错开**(12 / 15 / 22 / 6 ...),档位交界处不叠加突变 → 全程平滑
- 主特征(变化核心)档位最多,辅助特征少
- 会变化的属性**全部**放 features,固定段只放不变的(画风/姿势/服装/背景)
- `unique_suffix: percent` 兜底唯一性(每帧带进度百分比,FLUX 可忽略但不影响唯一性)

## 6. Key Parameters (Verified)

- **T2I**: `denoise 1.0`,`EmptyLatentImage` 512x768(竖版立绘)
- **身份一致性**: 固定 seed + 固定风格段(服装/姿势/背景不变) → 同角色
- `steps 20`(速度)~`28`(质量);`cfg 1.0`;`euler + simple`
- **SaveImage 每帧唯一前缀**(`chara_seq_{i:03d}`):ComfyUI 0.30 并发 SaveImage 共享计数器会互相覆盖

## 7. Known Pitfalls (ComfyUI 0.30.2)

1. **Easy-Use forLoop 竞态 bug** → 一律用展开式生成(`gen_workflow_t2i.py` 平铺节点)
2. **SaveImage 文件名冲突** → 唯一前缀(见 §6)
3. **模型下载**: HF 直连不稳时用 `hf-mirror.com` 镜像 + curl `-C -` 断点续传;gated 模型(如官方 VAE)从公开镜像仓库获取
4. **FLUX 不支持常见 IPAdapter 插件**(SD1.5/SDXL 专用) → 身份保持用固定 seed,不依赖 IPAdapter
5. **ComfyUI Desktop 改插件后**: `taskkill //F //IM python.exe` 后用原命令行参数重启

## 8. Environment Reference

- ComfyUI v0.30.2 + `city96/FLUX.1-dev-gguf`(Q8_0)+ SmartModelLoaders-MXD + ComfyUI-GGUF
- 模型目录 `ComfyUI-Shared/models/{unet,text_encoders,vae}`
- API: `http://127.0.0.1:8188`(`/object_info` 查节点 schema,`/prompt` 提交,`/history` 轮询)

## 9. Verification & Delivery

1. 提示词唯一性(脚本自动 assert)
2. 10 帧小规模测试(看画风/变化方向),再全量
3. 关键帧(0/25/50/75/99)MD5 唯一
4. 交付打包:工作流 JSON + 场景配置 + 生成脚本

## 10. Included Examples

| 场景 | 演示 |
|---|---|
| `scenes/chara_growth.json` | 角色成长:幼年 → 成年(身高/面容/体格/气质) |
| `scenes/dragon_evolution.json` | 怪物进化:幼龙 → 巨龙(体型/角/翅膀/鳞甲) |
| `scenes/magical_girl_transform.json` | 变身:普通少女 → 魔法少女(服装/发色/光环/眼睛) |
