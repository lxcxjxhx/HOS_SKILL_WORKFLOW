"""HOS-CHAR-FACTORY · 阶段 0：3 张定稿（起点/中点/终点）。

用法:
    python src/gen_still.py --config config.yaml
    python src/gen_still.py --config config.yaml --nsfw   # 附加 NSFW 段（需计划成年声明）
"""

from __future__ import annotations

import argparse
import os
import sys

from comfy_client import ComfyClient, load_config, run_txt2img

# 三张锚点的差分槽配置：只动需要变的槽，画风锚/背景/seed 全程一致。
STILL_SLOTS = [
    {
        "name": "000_male",
        "t": 0.0,
        "slots": {
            "count": "1boy",
            "gender": "",
            "hair": "short male hair",
            "face": "sharp jawline",
            "expression": "stern expression",
            "body": "masculine build",
            "chest": "flat chest",
            "waist_hips": "broad waist",
            "height": "tall",
            "clothes": "male office shirt and slacks",
        },
    },
    {
        "name": "500_mid",
        "t": 0.5,
        "slots": {
            "count": "1boy, 1girl, androgynous",
            "gender": "",
            "hair": "medium hair",
            "face": "soft jawline",
            "expression": "neutral expression",
            "body": "slender build",
            "chest": "small chest",
            "waist_hips": "curving waist",
            "height": "medium height",
            "clothes": "unisex shirt and shorts",
        },
    },
    {
        "name": "1000_female",
        "t": 1.0,
        "slots": {
            "count": "1girl",
            "gender": "",
            "hair": "very long hair",
            "face": "delicate face",
            "expression": "gentle smile",
            "body": "hourglass figure",
            "chest": "large breasts",
            "waist_hips": "narrow waist, wide hips",
            "height": "petite",
            "clothes": "female dress",
        },
    },
]

STYLE_ANCHOR = ("flat color anime style, clean line art, cel shading, no complex shadows, "
                "side profile, full body, pure white background, "
                "masterpiece, best quality, highres")

NEGATIVE = ("lowres, bad anatomy, bad hands, missing fingers, extra digits, extra limbs, "
            "deformed, disfigured, blurry, jpeg artifacts, watermark, text, "
            "photorealistic, 3d render, complex background, worst quality, low quality")


def fill_prompt(slots: dict) -> str:
    return (f"{slots['count']}, {STYLE_ANCHOR}, {slots['hair']}, amber eyes, "
            f"{slots['face']}, {slots['expression']}, {slots['body']}, "
            f"{slots['chest']}, {slots['waist_hips']}, {slots['height']}, fair skin, "
            f"{slots['clothes']}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--nsfw", action="store_true", help="附加 NSFW 段（需计划成年声明）")
    ap.add_argument("--out", default=None, help="覆盖输出目录")
    args = ap.parse_args()

    cfg = load_config(args.config)
    if args.nsfw and cfg.get("content_mode") != "nsfw":
        print("[!] --nsfw 要求 config.yaml 的 content_mode: nsfw", file=sys.stderr)
        return 1

    client = ComfyClient(cfg["comfy"]["host"], cfg["comfy"]["timeout"])
    client.ping()

    out_dir = args.out or cfg["output"]["still"]
    os.makedirs(out_dir, exist_ok=True)

    for slot in STILL_SLOTS:
        pos = fill_prompt(slot["slots"])
        if args.nsfw:
            pos += ", mature woman, adult, seductive atmosphere"
        print(f"[*] 定稿 {slot['name']} (t={slot['t']}) …")
        images = run_txt2img(client, cfg, pos, NEGATIVE,
                             denoise=cfg["sampler"]["denoise"]["still"],
                             prefix=f"hcf/still/{slot['name']}")
        if not images:
            print(f"[!] {slot['name']} 无输出", file=sys.stderr)
            return 1
        sub, fn = images[0]
        local = client.fetch(fn, sub, dest=out_dir)
        print(f"    -> {local}")

    print(f"[✓] 定稿完成，产物在 {out_dir}/（用户确认后再跑 gen_chain.py）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
