# 工作流 04 · 三视图角色表

> 用途：产出侧 / 背 / 正三视图，供设定集、3D 建模参考或立绘库索引。
> 命令：`python src/sheet.py --config config.yaml`
> 前置：定稿确认（或指定某 t 值的角色形态）。

## 1. 节点接线

```
Load Checkpoint ──┬─→ CLIP Encode(正面 + 视图词) ─┐
                  ├─→ CLIP Encode(负面) ──────────┼─→ KSampler ─→ VAE Decode ─→ Save
                  └─→ Empty Latent (1216×832 横版)┘
ControlNet OpenPose（侧/背/正 三张骨架图）──→ 锁三视图姿态
IPAdapter（用定稿图）──→ 锁同一角色
```

- 三张用**同一角色 prompt**，仅视图词不同：`side view, profile` / `back view` / `front view, facing viewer`。
- `denoise: 0.85`（img2img，以定稿为底图保证角色一致）。
- 平涂风格提示词保持与定稿完全一致（flat color, cel shading, pure white background）。

## 2. 命令

```bash
# 默认：以 1000_female（最终形态）为基准出三视图
python src/sheet.py --config config.yaml

# 指定基准形态
python src/sheet.py --config config.yaml --base out/still/500_mid.png
```

## 3. 产物

```
out/sheet/
├── front.png / side.png / back.png     # 三张独立透明底（抠图后）
└── sheet.png                           # 横排拼表（标视图名）
```

## 4. 验收标准

- [ ] 三张同一角色（脸/发色/服装一致，靠 IPAdapter + 同 seed + 同 prompt 保证）
- [ ] 侧/背/正姿态明确（OpenPose 骨架正确）
- [ ] 同画风、同白底
- [ ] 拼表标注 `front / side / back`
