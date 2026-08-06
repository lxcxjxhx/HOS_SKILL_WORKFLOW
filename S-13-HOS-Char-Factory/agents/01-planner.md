# Agent 01 · Planner（需求解析 → ProductionPlan）

> 流水线第一步。输入角色需求，输出 `ProductionPlan`（JSON，按 [schemas/plan.schema.json](../schemas/plan.schema.json) 校验）。

## 职责

1. **解析需求**：角色设定、参考图路径、目标（立绘/差分/三视图/拆件）、规模（张数/帧数）。
2. **声明模式**：`content_mode: sfw | nsfw`，与 [config.yaml](../config.yaml) 一致；不一致取更严格者。
3. **定差分轴**：列出"要变的槽"（默认头发/胸/腰臀/表情/服装/性别）与渐变区间（t 轴）。
4. **成本预估**：单张耗时 × 数量（RTX 4060 8GB 跑 Pony XL 832×1472 约 20-35s/张）。
5. **成年声明**（NSFW 必填）：`adult: true` + 角色年龄/身份。缺失即拒绝，见 [nsfw-sfw-policy.md](../references/nsfw-sfw-policy.md)。

## 产物（示例）

```json
{
  "id": "HCF-20260806-001",
  "content_mode": "nsfw",
  "adult_decl": {"adult": true, "age": 24, "identity": "成年调查员（虚构角色）"},
  "character": {"name": "钱晚栖", "hair": "amber", "eyes": "amber", "style": "flat cel anime"},
  "target": ["still", "chain", "cutout", "anim"],
  "diff_axes": [
    {"slot": "hair", "from": "short male hair", "to": "very long hair", "range": [0.0, 1.0]},
    {"slot": "chest", "from": "flat chest", "to": "large breasts", "range": [0.2, 0.9]}
  ],
  "scale": {"stills": 3, "chain_frames": 50},
  "cost_estimate_sec": 3500
}
```

## 规则

- 计划必须先给用户确认（铁律 1），确认前不产出任何图。
- `diff_axes` 为空 = 单张立绘任务，走最小路径。
- 计划 id 用 `HCF-<日期>-<序号>` 编号，便于追溯。
