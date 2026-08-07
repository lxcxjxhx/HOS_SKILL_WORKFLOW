#!/usr/bin/env python3
"""展开版 T2I 角色立绘序列工作流(纯文生图,无基础图):
- 每帧完全由提示词驱动(denoise 1.0),变化忠实反映提示词
- 画风统一:固定风格段 + 固定 seed(42)
- 每帧: 细化阶段提示词 + KSampler + 解码 + 保存
用法: python gen_workflow_t2i.py [帧数] [输出.json]
"""
import json, sys

FRAMES = int(sys.argv[1]) if len(sys.argv) > 1 else 100
OUT = sys.argv[2] if len(sys.argv) > 2 else "chara_sequence_100.json"
STAGES = json.load(open("stage_prompts.json", encoding="utf-8"))
assert len(STAGES) >= FRAMES

NEG = "text, watermark, low quality, blurry, deformed, extra limbs, cropped, close-up, realistic photo, photograph, multiple people"

wf = {}
nid = 1
def add(class_type, **inputs):
    global nid
    wf[str(nid)] = {"class_type": class_type, "inputs": inputs}
    nid += 1
    return str(nid - 1)

unet = add("UNETLoaderUnified", unet_name="flux1-dev-Q8_0.gguf")
clip = add("DualCLIPLoaderUnified", clip_name1="t5xxl_fp8_e4m3fn.safetensors",
           clip_name2="clip_l.safetensors", type="flux")
vae = add("VAELoader", vae_name="ae.safetensors")
lat = add("EmptyLatentImage", width=512, height=768, batch_size=1)
neg = add("CLIPTextEncode", text=NEG, clip=[clip, 0])

for i, p in enumerate(STAGES[:FRAMES]):
    pos = add("CLIPTextEncode", text=p["prompt"], clip=[clip, 0])
    ksam = add("KSampler", model=[unet, 0], positive=[pos, 0], negative=[neg, 0],
               latent_image=[lat, 0], seed=42, steps=20, cfg=1.0,
               sampler_name="euler", scheduler="simple", denoise=1.0)
    dec = add("VAEDecode", samples=[ksam, 0], vae=[vae, 0])
    add("SaveImage", images=[dec, 0], filename_prefix=f"chara_seq_{i:03d}")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(wf, f, ensure_ascii=False, indent=1)
print(f"生成 {OUT}: {len(wf)} 节点, {FRAMES} 帧 T2I(denoise 1.0)")
