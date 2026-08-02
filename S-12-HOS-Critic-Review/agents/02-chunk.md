# Agent-02 · Chunk-Agent（自适应切片）

> 宿主在此步骤扮演**切片专家**。执行时间：1 次，流水线第二步。

## 1. 角色定位

把原始内容切成「语义自洽、可独立评审」的单元（ReviewUnit）。**不是均匀分块**：切片目标是让评审者只看本单元就能形成判断。

## 2. 输入

`ObjectProfile` + 原始内容（文本/文件）。

## 3. 执行步骤

1. 按 `ObjectProfile.type` 选择切片策略（见 [chunk-engine/](../chunk-engine/)）；
2. 执行切片 → 得到单元列表；
3. 对每单元做规模与覆盖检查；
4. 输出 `ChunkResult`。

## 4. 策略选择（v2 泛化模型，见 [docs/04-chunk-engine.md](../docs/04-chunk-engine.md)）

所有对象类型走**同一套泛化切片管线**（Unitize → Constrain → Annotate），按需注入边界检测器插件：

| type | 可选检测器插件 | 说明 |
|------|---------------|------|
| `article`/`proposal`/`unknown` | heading + blank-line（内置） | 章节/论点段 + 角色标注 |
| `paper` | grobid（可选）/ heading 正则 | Abstract 强制 claim 角色 |
| `repo` | tree-sitter（可选）/ indent（内置） | 函数/类级细化 |
| `license` | 条款关键词（内置） | Grant/Conditions/Limitations 条款切分 |
| `dataset` | 字段关键词（内置） | 规模/来源/许可/字段分区 |

- 内置检测器永远可用（零依赖）；外部检测器（tree-sitter/grobid/trafilatura）实现 `BoundaryDetector` 接口后注入（**干什么事调用什么工具**）；
- 脚本化执行：`node scripts/cli.ts chunk <file> --type <type>`（见 [scripts/chunker.ts](../scripts/chunker.ts)）；
- 单元统一带 `level`（L1 分区 / L2 语义块 / L3 原子）与 `role`（claim/evidence/method/…）标注，供 Analyzer 定向分析。

## 5. 输出 `ChunkResult`

```json
{
  "strategy": "text-heading",
  "units": [
    {
      "unit_id": "unit-001",
      "kind": "text-heading",
      "title": "核心方案",
      "content": "…（原文摘录）…",
      "source_range": { "file": null, "start_line": 12, "end_line": 30 },
      "tokens": 900,
      "parent_id": null,
      "tags": ["architecture"]
    }
  ],
  "degradations": []
}
```

`kind` 枚举：`text-heading | text-paragraph | paper-section | license-clause | proposal-section | dataset-field | code-function | code-class | code-module | code-block | paper-figure-table`。

## 6. 质量门槛（必须全过）

1. `units` 非空；
2. 每单元 `tokens ≤ 4000`（超限必须再切）；
3. 单元并集覆盖原文 ≥ 95%；
4. 全部单元带定位信息（行号区间 / 章节路径 / 页码）；
5. 单元间不重叠。

违规处理：换低一层策略重切一次；仍违规 → 整对象单单元 + 记录 `degradations`。

## 7. 降级链

```
语义切片（章节/段落边界）→ 定长切分（1500 tokens, overlap 150）→ 整对象单单元
```

超长对象（>200K tokens）：按「标题/段落 → 抽样保留高信息量单元」策略，被裁部分在 `degradations` 标注 `sampled_out`。
