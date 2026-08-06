---
name: HOS-CHAR-FACTORY
description: ComfyUI 驱动的游戏角色美术素材工厂——批量定稿立绘、50 帧变身/差分链、白底自动抠图、三视图角色表、WEBP 变身动画合成、部件拆件指南，NSFW/SFW 双模式内容分级路由。触发时机：用户要求生成/批量生产角色立绘、男女变身差分、TSF 形态过渡图、角色三视图、白底抠图、拆件素材、变身动画预览，或提到 ComfyUI 出图、RMBG 抠图、IPAdapter 锁脸、ControlNet 控姿势，或调用 hos-char-factory。
---

# HOS-CHAR-FACTORY · 角色素材工厂

> **输入角色需求 → 输出：定稿立绘 + 差分链 + 透明抠图 + 三视图 + 动画预览 + 拆件素材。**

ComfyUI 驱动的游戏角色美术生产流水线。核心不是"画一张图"，而是**用固定 seed + 差分槽（TAG Slot）系统批量产出"参数可控、风格一致、可直接进引擎"的角色素材**——尤其擅长"男→女变身差分"这类渐进式形态变化。

- **不是** 通用文生图玩具、不是纯提示词词典。它是**有状态的生产线**：计划（Plan）→ 模板（Prompt）→ 执行（Run）→ 质检（Inspect）→ 打包（Pack）。
- 智能环节（需求解析、prompt 槽填充、质检判断）由宿主 LLM 执行；`src/` 脚本负责 ComfyUI API 通信与文件后处理，二者通过 [schemas/](schemas/) 契约对接。
- 完全独立体系：编号 `HCF-*`、五 Agent 流水线、双内容模式（SFW/NSFW）均为本项目自建。

## 一、五 Agent 流水线

```
Planner → PromptEngineer → Runner → Inspector → Packager
```

| 步 | Agent | 产物 | 说明 |
|----|-------|------|------|
| 1 | [Planner](agents/01-planner.md) | `ProductionPlan` | 需求解析：角色设定 / 模式(SFW·NSFW) / 差分轴 / 规模 |
| 2 | [PromptEngineer](agents/02-prompt-engineer.md) | `PromptSheet` | 按 12 差分槽生成提示词 + 负面 + 参数 |
| 3 | [Runner](agents/03-runner.md) | `RawImage[]` | `src/` 脚本驱动 ComfyUI API 批量出图 |
| 4 | [Inspector](agents/04-inspector.md) | `InspectReport` | 姿态 / 气质 / 差分一致性 / 内容模式合规检查 |
| 5 | [Packager](agents/05-packager.md) | `AssetBundle` | 抠图 / 拆件 / 三视图 / 动画合成，输出到 `out/` |

**最小可用路径**：仅需单张立绘时，可从 PromptEngineer + Runner 起步（跳过差分轴与打包），但内容模式合规检查（Inspector）必跑。

## 二、执行规则（铁律）

1. **先计划后出图**：任何批量任务必须先产出 `ProductionPlan`（含模式、差分轴、规模、成本预估）给用户确认，禁止直接闷头刷图。
2. **seed 固定、一次一槽**：差分必须"固定 seed + 每帧只动一个槽"，否则变化不可控。违反此条 = 返工。
3. **内容模式双轨**：`content_mode: sfw | nsfw` 由 [config.yaml](config.yaml) 与计划声明。两条硬护栏**任何模式下都生效**：未成年人形象一票否决；真实人物肖像一票否决。详见 [references/nsfw-sfw-policy.md](references/nsfw-sfw-policy.md)。
4. **角色成年声明**：NSFW 模式必须记录角色成年设定（`adult: true` + 年龄/身份），写入计划并存档；缺失则拒绝执行。
5. **定稿先行**：差分链 / 三视图等批量任务前，必须先出 3 张定稿（起点/中点/终点）让用户确认气质与画风。
6. **降级不撒谎**：ComfyUI 离线、模型缺失、节点缺插件时必须明确告知并给出替代路径（如程序化抠图兜底），禁止假装已生成。
7. **全 ASCII 输出路径**：产物统一输出到 `out/`（全 ASCII），杜绝中文路径导致引擎/引擎链断裂。

## 三、执行路径

1. 读入需求（角色描述 / 参考图路径 / 模式声明），走 [Planner](agents/01-planner.md)；
2. 产出 `ProductionPlan`（JSON，按 [schemas/plan.schema.json](schemas/plan.schema.json) 校验），用户确认后继续；
3. [PromptEngineer](agents/02-prompt-engineer.md) 按 [tag-slots.md](references/tag-slots.md) 填充 [templates/](templates/) 模板，产出 `PromptSheet`；
4. [Runner](agents/03-runner.md) 调用 `src/` 脚本执行对应 [workflows/](workflows/) 工作流（still / chain / cutout / sheet / anim）；
5. [Inspector](agents/04-inspector.md) 逐张质检（含模式合规），不合格打回重跑对应帧；
6. [Packager](agents/05-packager.md) 汇总到 `out/`：定稿 + 差分链 + `_t` 透明版 + preview.webp + 拆件包。

**输出语言跟随用户，默认中文。**

## 四、快速开始

```bash
# 1) 确认 ComfyUI 在线（默认 http://127.0.0.1:8188）
curl -s -m 3 http://127.0.0.1:8188/system_stats

# 2) 阶段 0：3 张定稿（起点/中点/终点）
python src/gen_still.py --config config.yaml

# 3) 阶段 1：50 帧差分链（需先有定稿）
python src/gen_chain.py --config config.yaml

# 4) 阶段 2：全部白底抠图（生成 *_t.png 透明版）
python src/cutout.py --config config.yaml

# 5) 阶段 3：三视图角色表
python src/sheet.py --config config.yaml

# 6) 阶段 4：合成 preview.webp 变身动画预览
python src/anim.py --config config.yaml
```

详细参数与节点接线见 [workflows/](workflows/) 与 [references/parameter-guide.md](references/parameter-guide.md)。

## 五、工作流矩阵

| 工作流 | 命令 | 产物 | 对应文档 |
|--------|------|------|----------|
| 定稿 | `gen_still.py` | `000_male / 500_mid / 1000_female` | [workflows/01-still.md](workflows/01-still.md) |
| 差分链 | `gen_chain.py` | 50 帧 `01.png..50.png` | [workflows/02-chain.md](workflows/02-chain.md) |
| 抠图 | `cutout.py` | `*_t.png` 透明版 | [workflows/03-cutout.md](workflows/03-cutout.md) |
| 三视图 | `sheet.py` | 侧/背/正 三视图 + 拼表 | [workflows/04-sheet.md](workflows/04-sheet.md) |
| 动画 | `anim.py` | `preview.webp` | [workflows/05-anim.md](workflows/05-anim.md) |

## 六、输出模式

| 模式 | 用途 | 关键产出 |
|------|------|----------|
| `sfw`（默认） | 常规角色立绘 / 差分 / 拆件 | 全套，无额外审核 |
| `nsfw` | 成人向变身差分、涩涩演出素材 | 需成年声明 + 模式合规检查，见 [nsfw-sfw-policy.md](references/nsfw-sfw-policy.md) |

## 七、环境与依赖

- 引擎：本地 ComfyUI（`http://127.0.0.1:8188`），Python 3.10+，`requests` + `Pillow`。
- 推荐底模：Pony Diffusion V6 XL / NoobAI-XL / Illustrious（NSFW 与差分 LoRA 生态全）。
- 推荐插件：ComfyUI-RMBG（抠图）、ComfyUI-IPAdapter-Plus（锁脸/风格迁移）、ComfyUI-ControlNet（姿势）、ComfyUI-Diffusion-2D-Seg（拆件辅助）。详见 [references/plugin-list.md](references/plugin-list.md)。
- 许可：本模块属 HOS Skill Workflow（AGPLv3），贡献需 DCO 签名。
