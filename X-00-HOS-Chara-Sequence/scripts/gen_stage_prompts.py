#!/usr/bin/env python3
"""通用角色立绘序列提示词生成器(框架核心)。
读场景配置 -> 生成 N 帧逐帧渐进提示词 -> 写 stage_prompts.json

场景配置文件格式(scenes/<场景>.json):
{
  "name": "场景名",
  "frames": 100,
  "template": "固定风格段,含 {subject} 占位。画风/构图/服装/背景放这里,保证帧间统一",
  "unique_suffix": "percent | frame",   // 每帧唯一性兜底: percent 用进度百分比, frame 用帧号
  "features": {
    "特征名": ["档位词0", "档位词1", ...],   // 档位数越多越细腻;不同特征档位数错开 -> 平滑
  }
}

用法: python gen_stage_prompts.py [场景配置.json] [输出.json]
"""
import json, sys

CONFIG = sys.argv[1] if len(sys.argv) > 1 else "scenes/chara_growth.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "stage_prompts.json"

cfg = json.load(open(CONFIG, encoding="utf-8"))
N = cfg.get("frames", 100)
TEMPLATE = cfg["template"]
FEATURES = cfg["features"]
UNIQUE = cfg.get("unique_suffix", "percent")


def tier(words, t):
    """按进度 t(0~1) 取档位,档位间均匀渐进。"""
    return words[min(len(words) - 1, int(t * len(words)))]


def features(i, N):
    t = i / (N - 1)
    parts = [tier(words, t) for words in FEATURES.values()]
    if UNIQUE == "percent":
        parts.append(f"{int(t * 100)} percent progressed")
    elif UNIQUE == "frame":
        parts.append(f"phase {i}")
    return ", ".join(parts)


prompts = []
for i in range(N):
    prompts.append({
        "stage": i,
        "progress": round(i / (N - 1), 3),
        "prompt": TEMPLATE.format(subject=features(i, N)),
    })

uniq = len({p["prompt"] for p in prompts})
print(f"[{cfg['name']}] 唯一提示词: {uniq}/{N}")
assert uniq == N, "提示词重复!增加特征档位或调整档位数错开"

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(prompts, f, ensure_ascii=False, indent=1)
print(f"已写入 {OUT}")
for p in prompts[:: N // 5 if N > 5 else 1]:
    print(f"[{p['stage']:>3}] {p['prompt'][-100:]}")
