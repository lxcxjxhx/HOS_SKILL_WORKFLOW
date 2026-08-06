"""HOS-CHAR-FACTORY · 阶段 3：三视图角色表。

以定稿为基准（img2img denoise 0.85），仅替换视图词，产出 side/back/front 三视图并拼表。

用法:
    python src/sheet.py --config config.yaml
    python src/sheet.py --config config.yaml --base out/still/500_mid.png
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys

from PIL import Image

from comfy_client import ComfyClient, load_config

def _stdout_utf8():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

NEGATIVE = ("lowres, bad anatomy, bad hands, missing fingers, deformed, blurry, "
            "jpeg artifacts, watermark, text, photorealistic, 3d render, "
            "worst quality, multiple views in one image")

VIEW_WORDS = {
    "side": "side view, profile, facing left",
    "back": "back view, seen from behind",
    "front": "front view, facing viewer",
}


def build_sheet_graph(cfg: dict, base_img: str, positive: str, view: str,
                      seed: int) -> dict:
    sp = cfg["sampler"]
    return {
        "10": {"class_type": "LoadImage", "inputs": {"image": os.path.basename(base_img)}},
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
                  "scheduler": sp["scheduler"], "denoise": sp["denoise"]["sheet"]}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage",
              "inputs": {"images": ["6", 0], "filename_prefix": f"hcf/sheet/{view}"}},
    }


def make_sheet(views: list[str], dirpath: str, out_path: str, label: bool = True) -> str:
    """三张横排拼表（可选视图标注）。"""
    images = [Image.open(os.path.join(dirpath, f"{v}.png")).convert("RGBA") for v in views]
    w = sum(im.width for im in images)
    h = max(im.height for im in images)
    canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    x = 0
    for im in images:
        canvas.paste(im, (x, 0))
        x += im.width
    if label:
        from PIL import ImageDraw
        d = ImageDraw.Draw(canvas)
        x = 0
        for v, im in zip(views, images):
            d.text((x + 8, 8), v, fill=(0, 0, 0, 255))
            x += im.width
    canvas.save(out_path)
    return out_path


def main() -> int:
    _stdout_utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--base", default=None, help="基准图（默认 1000_female 定稿）")
    args = ap.parse_args()

    cfg = load_config(args.config)
    out = cfg["output"]
    base = args.base or os.path.join(out["still"], "1000_female.png")
    if not os.path.exists(base):
        print(f"[!] 基准图不存在: {base}", file=sys.stderr)
        return 1

    sheet_dir = out["sheet"]
    os.makedirs(sheet_dir, exist_ok=True)

    # 基准图 prompt 槽：用中性描述，避免视图词冲突
    base_pos = ("1girl, flat color anime style, clean line art, cel shading, "
                "very long hair, amber eyes, gentle smile, hourglass figure, "
                "female dress, pure white background, masterpiece, best quality")

    # LoadImage 只读 ComfyUI input 目录：基准图复制进去供三视图引用
    input_dir = cfg.get("comfy", {}).get("input_dir") or ""
    if not os.path.isdir(input_dir):
        print(f"[!] ComfyUI input 目录不存在: {input_dir}（config.yaml 需配置 comfy.input_dir）",
              file=sys.stderr)
        return 1
    sheet_input = os.path.join(input_dir, "hcf_sheet")
    os.makedirs(sheet_input, exist_ok=True)
    base_input = os.path.join(sheet_input, "base.png")
    shutil.copy2(base, base_input)

    client = ComfyClient(cfg["comfy"]["host"], cfg["comfy"]["timeout"])

    client = ComfyClient(cfg["comfy"]["host"], cfg["comfy"]["timeout"])
    client.ping()
    seed = cfg["sampler"]["seed"]

    for view in VIEW_WORDS:
        pos = f"{base_pos}, {VIEW_WORDS[view]}"
        graph = build_sheet_graph(cfg, "hcf_sheet/base.png", pos, view, seed)
        pid = client.submit(graph)
        entry = client.wait(pid)
        images = client.images_of(entry)
        if not images:
            print(f"[!] {view} 无输出", file=sys.stderr)
            return 1
        sub, fn = images[0]
        client.fetch(fn, sub, dest=sheet_dir)
        print(f"    {view} -> {sheet_dir}/{view}.png")

    sheet_path = make_sheet(list(VIEW_WORDS), sheet_dir,
                            os.path.join(sheet_dir, "sheet.png"))
    print(f"[✓] 三视图完成 -> {sheet_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
