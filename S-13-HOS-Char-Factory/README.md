# HOS-CHAR-FACTORY · 角色素材工厂

> **输入角色需求 → 输出：定稿立绘 + 差分链 + 透明抠图 + 三视图 + 动画预览 + 拆件素材。**
> 本模块是 [HOS Skill Workflow](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW) 的 **S-13** 号 Standard 多文件结构 skill。

## 这是什么

ComfyUI 驱动的**游戏角色美术生产流水线**：用固定 seed + 12 差分槽（TAG Slot）批量产出参数可控、风格一致、可直接进引擎的角色素材。核心场景：

| 场景 | 产出 |
|------|------|
| 角色立绘定稿 | 起点/中点/终点 3 张锚点图 |
| 男→女变身差分（TSF） | 50 帧渐进过渡链 + WEBP 动画预览 |
| 游戏拆件素材 | 白底抠图 → 透明 PNG → 部件拆件指南 |
| 角色表 | 侧/背/正三视图 |
| 内容分级 | SFW / NSFW 双模式，硬护栏不可关闭 |

## 快速开始

```bash
# 依赖
pip install requests pillow pyyaml

# 1) 确认 ComfyUI 在线
curl -s -m 3 http://127.0.0.1:8188/system_stats

# 2) 阶段 0：3 张定稿
python src/gen_still.py --config config.yaml

# 3) 阶段 1：50 帧差分链（需先有定稿）
python src/gen_chain.py --config config.yaml

# 4) 阶段 2：白底抠图 → *_t.png 透明版
python src/cutout.py --config config.yaml

# 5) 阶段 3：三视图角色表
python src/sheet.py --config config.yaml

# 6) 阶段 4：变身动画 preview.webp
python src/anim.py --config config.yaml
```

## 目录结构

```
S-13-HOS-Char-Factory/
├── SKILL.md              # ★ Skill 入口：frontmatter + 铁律 + 执行路径
├── README.md             # 本文档
├── config.yaml           # 全局配置（模式/模型/采样/输出/护栏）
├── CHANGELOG.md          # 变更日志
├── agents/               # 五 Agent 流水线定义
├── workflows/            # 五个标准工作流（still/chain/cutout/sheet/anim）
├── templates/            # prompt 模板（基础/NSFW/SFW/负面/ComfyUI json）
├── src/                  # 可运行脚本（ComfyUI 客户端 + 五阶段）
├── references/           # 差分槽全表 / 双模式策略 / 插件清单 / 参数指南
├── schemas/              # Plan / PromptSheet / Output 契约
├── examples/             # 示例计划与提示词
└── tests/                # 单元测试（schema 校验 / 抠图）
```

## 工作流详解

| 工作流 | 文档 | 说明 |
|--------|------|------|
| 定稿 3 张 | [workflows/01-still.md](workflows/01-still.md) | 用户确认气质/体型/画风的锚点 |
| 50 帧差分链 | [workflows/02-chain.md](workflows/02-chain.md) | 两段锚定链式 img2img，t: 0→0.5→1.0 |
| 白底抠图 | [workflows/03-cutout.md](workflows/03-cutout.md) | RMBG 优先，程序化抠图兜底 |
| 三视图 | [workflows/04-sheet.md](workflows/04-sheet.md) | 侧/背/正三视图 |
| 变身动画 | [workflows/05-anim.md](workflows/05-anim.md) | 合成 preview.webp |

## 内容模式（NSFW / SFW 兼容）

同一套流水线，通过 `content_mode` 切换：SFW 模式走常规模板；NSFW 模式需成年声明 + 合规检查。
**任何模式下**：未成年人形象、真实人物肖像一票否决。完整规则见 [references/nsfw-sfw-policy.md](references/nsfw-sfw-policy.md)。

## 环境

- ComfyUI 本地实例（默认 `http://127.0.0.1:8188`）
- Python 3.10+（`requests` / `pillow` / `pyyaml`）
- 推荐底模：Pony V6 XL / NoobAI-XL / Illustrious
- 推荐插件：RMBG / IPAdapter-Plus / ControlNet / Diffusion-2D-Seg（[plugin-list.md](references/plugin-list.md)）

## 许可与贡献

AGPLv3 · 贡献需 DCO 签名（`git commit -s`），见仓库根 [CONTRIBUTING.md](../CONTRIBUTING.md)。
