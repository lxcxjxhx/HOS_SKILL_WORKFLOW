"""HOS-CHAR-FACTORY · 阶段 4：变身动画合成（preview.webp，回退 GIF）。

用法:
    python src/anim.py --config config.yaml
    python src/anim.py --config config.yaml --fps 20
    python src/anim.py --config config.yaml --transparent   # 用 *_t.png 透明版
"""

from __future__ import annotations

import argparse
import glob
import os
import sys

from PIL import Image

from comfy_client import load_config


def load_frames(chain_dir: str, transparent: bool) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for p in sorted(glob.glob(os.path.join(chain_dir, "*.png"))):
        name = os.path.basename(p)
        if transparent:
            if not name.endswith("_t.png"):
                continue
        else:
            if name.endswith("_t.png"):
                continue
        frames.append(Image.open(p).convert("RGBA"))
    return frames


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--fps", type=int, default=12)
    ap.add_argument("--transparent", action="store_true")
    args = ap.parse_args()

    cfg = load_config(args.config)
    out = cfg["output"]
    frames = load_frames(out["chain"], args.transparent)
    if not frames:
        print(f"[!] {out['chain']}/ 下无帧，先跑 gen_chain.py", file=sys.stderr)
        return 1

    # 统一尺寸（取最大，居中贴透明底）
    w = max(f.width for f in frames)
    h = max(f.height for f in frames)
    norm: list[Image.Image] = []
    for f in frames:
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        canvas.paste(f, ((w - f.width) // 2, (h - f.height) // 2))
        norm.append(canvas)

    os.makedirs(out["anim"], exist_ok=True)
    duration = max(20, int(1000 / args.fps))
    webp_path = os.path.join(out["anim"], "preview.webp")
    try:
        norm[0].save(webp_path, save_all=True, append_images=norm[1:],
                     duration=duration, loop=0, lossless=False)
        print(f"[✓] 动画完成 -> {webp_path} ({len(norm)} 帧, {duration}ms/帧)")
        return 0
    except Exception as e:  # WebP 编码缺失时回退 GIF
        print(f"[!] WebP 失败（{e}），回退 GIF")
        gif_path = os.path.join(out["anim"], "preview.gif")
        norm[0].save(gif_path, save_all=True, append_images=norm[1:],
                     duration=duration, loop=0)
        print(f"[✓] 动画完成 -> {gif_path} ({len(norm)} 帧)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
