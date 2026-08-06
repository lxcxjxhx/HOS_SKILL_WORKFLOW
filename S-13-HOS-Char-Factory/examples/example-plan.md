# 示例生产计划（NSFW 变身差分）

> 对应 [plan.schema.json](../schemas/plan.schema.json)，是 `HCF-*` 计划的规范示例。
> 本示例角色为**虚构成年角色**，已满足成年声明要求。

```json
{
  "id": "HCF-20260806-001",
  "content_mode": "nsfw",
  "adult_decl": {
    "adult": true,
    "age": 24,
    "identity": "成年调查员（虚构角色，废弃女校场景调查员）"
  },
  "lewdness": "moderate",
  "character": {
    "name": "钱晚栖",
    "hair": "amber",
    "eyes": "amber",
    "style": "flat color anime, cel shading, clean line art"
  },
  "target": ["still", "chain", "cutout", "anim"],
  "diff_axes": [
    {"slot": "hair", "from": "short male hair", "to": "very long hair", "range": [0.0, 1.0]},
    {"slot": "expression", "from": "stern", "to": "gentle smile", "range": [0.0, 0.85]},
    {"slot": "chest", "from": "flat chest", "to": "large breasts", "range": [0.2, 0.9]},
    {"slot": "waist_hips", "from": "broad waist", "to": "narrow waist, wide hips", "range": [0.2, 0.9]},
    {"slot": "clothes", "from": "male shirt", "to": "female dress", "range": [0.3, 0.9]}
  ],
  "scale": {"stills": 3, "chain_frames": 50},
  "cost_estimate_sec": 3500
}
```

## 说明

- 差分轴错开区间（hair 0→1，chest 0.2→0.9）：形成"头发先变长、身体后变曲线"的层次感，避免一帧全变。
- SFW 变体：删 `adult_decl`/`lewdness`，`content_mode` 改 `"sfw"`，target 不变——**同一条计划结构两种模式通用**。
