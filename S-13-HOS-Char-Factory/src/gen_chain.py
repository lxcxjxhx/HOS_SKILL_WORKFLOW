"""HOS-CHAR-FACTORY · 阶段 1：50 帧变身差分链。

原理（见 workflows/02-chain.md）：
    段一 t:0→0.5  000_male →(校准 denoise 0.42)→ 帧01 →(链 denoise 0.32)→ … → 帧25
    段二 t:0.5→1.0 500_mid  →(校准 denoise 0.42)→ 帧26 →(链 denoise 0.32)→ … → 帧50
实现：逐帧提交 img2img（LoadImage 上一帧输出 + KSampler + SaveImage），
     全程固定 seed，帧间只渐变一个差分槽。

用法:
    python src/gen_chain.py --config config.yaml
"""

from __future__ import annotations

import argparse
import os
import sys

from comfy_client import ComfyClient, load_config

NEGATIVE = ("lowres, bad anatomy, bad hands, missing fingers, extra digits, extra limbs, "
            "deformed, disfigured, blurry, jpeg artifacts, watermark, text, "
            "photorealistic, 3d render, complex background, worst quality, "
            "two people, duplicate, multiple views in one image")

STYLE = ("flat color anime style, clean line art, cel shading, no complex shadows, "
         "side profile, full body, pure white background, amber eyes, fair skin, "
         "masterpiece, best quality, highres")

# 差分槽沿 t 轴的渐变（低→高，越靠后越女性化）
def chain_slots(t: float) -> str:
    """把 t∈[0,1] 映射为当前帧的差分槽文本。"""
    def lerp(a: str, b: str, x: float) -> str:
        return a if x < 0.5 else b

    hair = lerp("short male hair", "medium hair", t) if t < 0.5 else (
        "medium hair" if t < 0.75 else "very long hair")
    expr = lerp("stern expression", "neutral expression", t) if t < 0.5 else (
        "neutral expression" if t < 0.85 else "gentle smile")
    chest = lerp("flat chest", "small chest", (t - 0.2) / 0.3) if t < 0.5 else (
        "small chest" if t < 0.75 else "large breasts")
    waist = lerp("masculine build, broad waist", "slender build, curving waist",
                 (t - 0.2) / 0.3) if t < 0.5 else (
        "slender build, curving waist" if t < 0.8 else "hourglass figure, narrow waist")
    cloth = lerp("male office shirt and slacks", "unisex shirt and shorts",
                 (t - 0.3) / 0.3) if t < 0.6 else (
        "unisex shirt and shorts" if t < 0.9 else "female dress")
    gender = "1boy" if t < 0.35 else ("1boy, 1girl, androgynous" if t < 0.7 else "1girl")
    return (f"{gender}, {STYLE}, {hair}, {expr}, {chest}, {waist}, {cloth}")


def build_img2img(cfg: dict, image_path: str, positive: str, denoise: float,
                  seed: int, prefix: str) -> dict:
    """构建 img2img 节点图：LoadImage 上一帧 + KSampler。"""
    sp = cfg["sampler"]
    return {
        "10": {"class_type": "LoadImage", "inputs": {"image": os.path.basename(image_path)}},
        "1": {"class_type": "CheckpointLoaderSimple",
              "inputs": {"ckpt_name": cfg["model"]["checkpoint"]}},
        "2": {"class_type": "CLIPTextEncode",
              "inputs": {"clip": ["1", 1], "text": positive}},
        "3": {"class_type": "CLIPTextEncode",
              "inputs": {"clip": ["1", 1], "text": NEGATIVE}},
        "5": {"class_type": "KSampler",
              "inputs": {
                  "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0],
                  "latent_image": ["10", 0], "seed": seed, "steps": sp["steps"],
                  "cfg": sp["cfg"], "sampler_name": sp["sampler_name"],
                  "scheduler": sp["scheduler"], "denoise": denoise}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage",
              "inputs": {"images": ["6", 0], "filename_prefix": prefix}},
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--frames", type=int, default=0, help="覆盖总帧数（默认取 config）")
    args = ap.parse_args()

    cfg = load_config(args.config)
    frames = args.frames or cfg["chain"]["frames"]
    anchors = [("000_male", 0.0), ("500_mid", 0.5), ("1000_female", 1.0)]

    still_dir = cfg["output"]["still"]
    chain_dir = cfg["output"]["chain"]
    os.makedirs(chain_dir, exist_ok=True)

    for name, t in anchors:
        p = os.path.join(still_dir, f"{name}.png")
        if not os.path.exists(p):
            print(f"[!] 缺定稿 {p}，先跑 gen_still.py", file=sys.stderr)
            return 1

    client = ComfyClient(cfg["comfy"]["host"], cfg["comfy"]["timeout"])
    client.ping()
    seed = cfg["sampler"]["seed"]
    dn = cfg["sampler"]["denoise"]

    prev = os.path.join(still_dir, "000_male.png")
    for i in range(1, frames + 1):
        t = (i - 1) / (frames - 1)  # t: 0 → 1
        pos = chain_slots(t)
        # 段首校准帧（i=1,26）用锚点图 + denoise 0.42，其余链式 0.32
        denoise = dn["anchor"] if i in cfg["chain"]["anchor_frames"] else dn["chain"]
        prefix = f"hcf/chain/{i:02d}"
        graph = build_img2img(cfg, prev, pos, denoise, seed, prefix)
        pid = client.submit(graph)
        entry = client.wait(pid)
        images = client.images_of(entry)
        if not images:
            print(f"[!] 帧 {i:02d} 无输出，中止", file=sys.stderr)
            return 1
        sub, fn = images[0]
        local = client.fetch(fn, sub, dest=chain_dir)
        prev = local
        if i % 5 == 0 or i == 1:
            print(f"    t={t:.2f} 帧 {i:02d} -> {local}")

    print(f"[✓] 差分链完成：{frames} 帧 -> {chain_dir}/（可跑 cutout.py / anim.py）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
