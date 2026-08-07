# HOS-Chara-Sequence

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **ComfyUI Character Portrait Sequence Generator** — 同一角色逐帧渐进变化立绘,输出小游戏可用的 PNG 序列帧。

---

## Description

HOS-Chara-Sequence 是一个基于 ComfyUI + FLUX 的角色立绘序列生成框架。核心能力:**同一角色、画风统一、逐帧平滑渐变**。

覆盖场景:角色成长、宠物/怪物进化链、变身/形态变化、状态变化、换装。

**设计原则(踩坑沉淀)**:
- 纯文生图(T2I)驱动,不用 img2img/基础图 —— latent 会压制变化
- 展开式工作流,不用 Easy-Use 循环 —— ComfyUI 0.30.2 上有竞态 bug
- 固定 seed + 固定风格段保身份一致,SaveImage 唯一前缀防文件覆盖

## Quick Start

```bash
python scripts/gen_stage_prompts.py scenes/chara_growth.json   # 生成 100 帧渐进提示词
python scripts/gen_workflow_t2i.py 100 chara_sequence_100.json # 生成工作流
# 拖入 ComfyUI -> Queue -> 输出 chara_seq_<帧>_00001_.png
```

## Included Examples

| 场景 | 变化内容 |
|---|---|
| `scenes/chara_growth.json` | 幼年 → 成年(身高/面容/体格/气质) |
| `scenes/dragon_evolution.json` | 幼龙 → 巨龙(体型/角/翅膀/鳞甲) |
| `scenes/magical_girl_transform.json` | 少女 → 魔法少女(服装/发色/光环) |

## Docs

- [SKILL.md](SKILL.md) — 完整使用方案(配置规范、参数、坑、验证流程)
