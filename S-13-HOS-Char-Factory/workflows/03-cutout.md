# 工作流 03 · 白底抠图（自动去底 → 透明 PNG）

> 用途：把白底立绘/差分帧转为带 Alpha 通道的透明 PNG，供引擎/拆件直接使用。
> 命令：`python src/cutout.py --config config.yaml`
> 输入：`out/still/` 与 `out/chain/` 全部 PNG → 输出 `*_t.png`

## 1. 两条路径（优先级从上到下）

### 路径 A：ComfyUI RMBG 节点（推荐，需插件）

```
Load Image ─→ RemoveBackground (RMBG-1.4) ─→ Save Image (PNG)
```

- 插件：[ComfyUI-RMBG](https://github.com/Acly/ComfyUI-RMBG)（平涂风边缘极干净、快）或 ComfyUI-Inspyrenet-Rembg（细节保留更好、略慢）。
- ⚠ **避坑**：ComfyUI 直接连 `Save Image` 有时会丢透明底。必须：
  1. 确保保存格式为 PNG；
  2. 或加 `Image Composite Alpha` 节点手动拼透明底；
  3. 或使用自定义 `Save PNG with Alpha` 节点。

### 路径 B：程序化抠图兜底（无插件/离线时）

`src/cutout.py` 内置硬阈值去白底：

- `> hard(248)` 全透明；`soft(235) ~ hard` 之间按距离做渐变去白边（防白圈）；
- 仅适用于**纯白平涂底**；灰底/花底必须走路径 A。

## 2. 命令

```bash
# 全部（定稿 + 差分链）
python src/cutout.py --config config.yaml

# 只处理定稿
python src/cutout.py --config config.yaml --scope still
```

## 3. 验收标准

- [ ] 每个源图都有对应 `*_t.png`（如 `1000_female_t.png`）
- [ ] 边缘无残留白边/白圈（放大 200% 检查发丝、裙摆）
- [ ] Alpha 通道真实存在（非全不透明）
- [ ] 平涂内部无破洞（衣服/皮肤区域不透）

## 4. 拆件提醒（绑定引擎的下一步）

透明底 ≠ 可拆件。AI 一次输出的是**整体像素图**，绑骨骼（Spine/DragonBones）前需拆出头/左臂/右臂/裙/鞋/上身等部件：

1. 平涂风 → Photoshop 魔棒 / 快速选择 按图层拆；
2. 半自动 → ComfyUI-Diffusion-2D-Seg 节点把图按 头发/皮肤/衣服/鞋 分成不同色遮罩；
3. 最终手动微调部件边缘是横板游戏开发无法避免的一步。

详见 [references/plugin-list.md](../references/plugin-list.md) 与 [agents/05-packager.md](../agents/05-packager.md)。
