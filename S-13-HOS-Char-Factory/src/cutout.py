"""HOS-CHAR-FACTORY · 阶段 2：白底抠图 → 透明 PNG。

路径 B（程序化兜底，本脚本默认）：
    > hard(248) 全透明；soft(235)~hard 之间按亮度渐变去白边（防白圈）。
    仅适用于纯白平涂底；灰底/花底请走 ComfyUI RMBG 节点（见 workflows/03-cutout.md）。

用法:
    python src/cutout.py --config config.yaml             # 定稿 + 差分链全部
    python src/cutout.py --config config.yaml --scope still
"""

from __future__ import annotations

import argparse
import glob
import os
import sys

from PIL import Image

def _stdout_utf8():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def make_transparent(src: str, dst: str, hard: int = 248, soft: int = 235) -> None:
    """白底 PNG -> 透明 PNG。大于 hard 全透明，soft~hard 渐变。"""
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            m = min(r, g, b)
            if m >= hard:
                px[x, y] = (r, g, b, 0)
            elif m >= soft:
                alpha = int((hard - m) / (hard - soft) * 255)
                px[x, y] = (r, g, b, min(a, alpha))
    im.save(dst, "PNG")


def process_dir(src_dir: str, dst_dir: str) -> int:
    os.makedirs(dst_dir, exist_ok=True)
    n = 0
    for p in sorted(glob.glob(os.path.join(src_dir, "*.png"))):
        name = os.path.basename(p)
        if name.endswith("_t.png"):
            continue
        dst = os.path.join(dst_dir, name[:-4] + "_t.png")
        make_transparent(p, dst)
        n += 1
    return n


def main() -> int:
    _stdout_utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--scope", choices=["still", "chain", "all"], default="all")
    args = ap.parse_args()

    from comfy_client import load_config
    cfg = load_config(args.config)
    out = cfg["output"]

    total = 0
    if args.scope in ("still", "all"):
        total += process_dir(out["still"], out["cutout"])
    if args.scope in ("chain", "all"):
        total += process_dir(out["chain"], out["cutout"])

    if total == 0:
        print("[!] 未找到可处理的 PNG（先跑 gen_still.py / gen_chain.py）", file=sys.stderr)
        return 1
    print(f"[✓] 抠图完成：{total} 张 -> {out['cutout']}/（*_t.png 透明版）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
