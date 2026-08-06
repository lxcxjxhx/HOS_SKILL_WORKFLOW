# 工作流 01 · 定稿（3 张锚点图）

> 用途：让用户确认**起点 / 中点 / 终点**的气质、体型、画风，作为差分链与三视图的锚点。
> 命令：`python src/gen_still.py --config config.yaml`

## 1. 锚点语义

| 文件名 | t | 语义 | 气质 |
|--------|---|------|------|
| `000_male.png` | 0.0 | 纯男性 | 阳刚、克制 |
| `500_mid.png` | 0.5 | 半男半女 | 中性、过渡 |
| `1000_female.png` | 1.0 | 纯女性 | 柔美、完全体 |

## 2. 节点接线（ComfyUI）

```
Load Checkpoint ──────────────┬─→ CLIP Text Encode (正面, 槽填充) ─┐
                              ├─→ CLIP Text Encode (负面) ─────────┼─→ KSampler ─→ VAE Decode ─→ Save Image
                              └─→ Empty Latent Image (832×1472) ──┘
Load LoRA (Gender Swap / hair_length…) ──→ 挂到 CLIP + Model 之间
（可选）ControlNet OpenPose ──→ 锁侧身姿态
（可选）IPAdapter ──→ 参考图锁角色脸/画风
```

## 3. 关键参数（固化在 config.yaml）

- `denoise: 1.0`（文生图全量）；`seed` 固定（三张必须同 seed，只有槽不同）
- steps 28 / cfg 6.5 / euler_ancestral / normal

## 4. 槽位配置（三张的差异核心）

| 槽 | 000_male | 500_mid | 1000_female |
|----|----------|---------|-------------|
| gender | 1boy | 1boy, 1girl (androgynous) | 1girl |
| hair | short male hair | medium hair | very long hair |
| chest | flat chest | small chest | large breasts |
| waist/hips | masculine build | curvy | hourglass |
| clothes | male outfit | unisex | female outfit |
| expression | stern | neutral | gentle smile |

> 铁律：**只动需要变的槽**，其余槽（发色、瞳色、背景、画风）三张完全一致。

## 5. 验收标准

- [ ] 三张同 seed、同画风、同构图、同姿势
- [ ] 气质梯度符合"男 → 中 → 女"
- [ ] 无肢体崩坏（手/腿/五官），侧身立绘、白底
- [ ] 用户确认后才进入 [02-chain.md](02-chain.md)

## 6. 常见失败与修正

| 现象 | 修正 |
|------|------|
| 中图更像男/更像女 | 调 `androgynous` 权重或换 `500_mid` 的槽值 |
| 脸崩 | 固定 seed 后只动 face 槽；或加 IPAdapter 参考 |
| 姿态飘 | 开 ControlNet OpenPose 锁骨架 |
