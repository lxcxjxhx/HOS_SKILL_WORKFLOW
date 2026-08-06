# 工作流 05 · 变身动画合成（preview.webp）

> 用途：把 50 帧差分链合成可预览的 WEBP 动画，用于定稿验收与演示。
> 命令：`python src/anim.py --config config.yaml`
> 前置：`out/chain/01.png…50.png`（或透明版）已生成。

## 1. 合成逻辑

```
out/chain/01.png … 50.png ──→ 按序读取 ──→ 统一尺寸 ──→ 保存 out/anim/preview.webp
```

- 优先使用 `*_t.png` 透明版（透明背景更利于引擎预览）；无透明版则用原图。
- 帧间隔默认 80ms（约 12.5 FPS 渐变预览）；可用 `--fps` 覆盖。
- 循环播放（loop=0），适合变身循环演出。

## 2. 命令

```bash
python src/anim.py --config config.yaml            # 默认 80ms/帧
python src/anim.py --config config.yaml --fps 20   # 更快
python src/anim.py --config config.yaml --transparent
```

## 3. 验收标准

- [ ] preview.webp 可播放，变身过程顺滑无跳帧
- [ ] 帧序正确（男 → 女）
- [ ] 尺寸统一，无黑边/拉伸

## 4. 说明

- 若 WebP 编码缺失，`src/anim.py` 自动回退为 GIF（`preview.gif`）。
- 引擎内播放（如 Godot/Unity）建议直接序列帧引用 `out/chain/`，不依赖本预览。
