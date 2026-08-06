# Agent 03 · Runner（PromptSheet → RawImage[]）

> 流水线第三步。执行 `src/` 脚本驱动 ComfyUI，产出原始图。

## 职责

1. 按目标调用对应命令（见 [SKILL.md](../SKILL.md) 快速开始）：
   - 定稿：`python src/gen_still.py --config config.yaml`
   - 差分链：`python src/gen_chain.py --config config.yaml`
   - 三视图：`python src/sheet.py --config config.yaml`
2. 监控执行：提交 / 轮询 / 下载，异常时按 [04-inspector.md](04-inspector.md) 判定重跑。
3. 记录每次执行的 prompt_id 与产物路径（可追溯）。

## 前置检查（每条命令执行前）

| 检查 | 命令 |
|------|------|
| ComfyUI 在线 | `curl -s -m 3 <host>/system_stats` |
| 模型存在 | `/object_info/CheckpointLoaderSimple` 含 config 指定 ckpt |
| 插件可用 | 需要 RMBG 时查 `/object_info` 含 `RemoveBackground` |
| 定稿存在 | `out/still/000_male.png` 等（chain/sheet 前置） |

## 规则

- **降级不撒谎**：任何前置失败必须明确报告 + 给替代路径（如抠图无 RMBG → 程序化兜底），禁止静默跳过。
- 批量任务支持 `--frames` 覆盖总帧数（调试用）。
- 单帧失败：重跑该帧（同 seed），不整链重来。
