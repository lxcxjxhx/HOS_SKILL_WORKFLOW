# Pipeline — 流水线编排（10分钟标准版）

> 定义 STEP 之间的协作规则、数据传递和异常处理。
> 所有视频/音频统一 **10 分钟（600 秒）** 标准长度。
>
> **⚠️ 自动执行集成**：本文件定义了 STEP 间数据依赖关系。
> `auto-pipeline.md` 是本文件的执行引擎，所有 STEP 自动编排执行。

---

## 数据传递契约

每个 STEP 的输出是下一个 STEP 的部分输入：

```
STEP1(hooks) → STEP2(title+6ideas+narrative+emotion) → STEP3(content pack) → STEP4(12ppt) → STEP5(10min audio) → STEP6(600s video) → STEP7(repo)
```

| 字段 | 产生于 | 消费于 | 格式约束 |
|------|-------|-------|---------|
| hooks[] | STEP1 | STEP2 | yaml array of 3 strings |
| title | STEP2 | STEP3, STEP4 | string, ≤20 字 |
| opening_hook | STEP2 | STEP3, STEP5 | string, ≤25字 |
| key_ideas[] | STEP2 | STEP3, STEP4 | array of **6** strings, ≤15字/个 |
| idea_details[] | STEP2 | STEP3, STEP4 | array of **6** strings, ≤30字/个 |
| layer1_core | STEP2 | STEP3, STEP5 | string, ≤30字，问题冲击层 |
| layer2_core | STEP2 | STEP3, STEP5 | string, ≤30字，认知翻转层 |
| layer3_core | STEP2 | STEP3, STEP5 | string, ≤30字，行动升华层 |
| emotion_start/build/peak/end | STEP2 | STEP3, STEP5 | 情绪曲线 4 段 |
| one_line_insight | STEP2 | STEP3, STEP4(页12) | string, ≤20字 |
| fact_1 | STEP2 | STEP3, STEP4(页3) | string, ≤30字，数据 |
| fact_2 | STEP2 | STEP3, STEP4(页11) | string, ≤40字，案例 |
| content_pack | STEP3 | STEP4, STEP5, STEP6 | 10分钟模板填充体 |
| ppt_data | STEP4 | STEP6 | **12-page** JSON（总600s） |
| audio_script | STEP5 | STEP6 | **10分钟** 4幕脚本 |
| render_spec | STEP6 | — | **600秒** ffmpeg JSON |

---

## 并行规则

当 mode=batch 时：
- 不同 count 之间 **串行**（一个完成再下一个）
- 一个 count 内部的 STEP **串行**（依赖上一步输出）
- 原因：保持输出顺序一致，避免交叉引用

---

## 异常处理

| 异常 | 行为 |
|------|------|
| STEP1 产出不足 3 个钩子 | 停止，提示"方向不够具体，请补充方向描述" |
| STEP2 标题不满足含数字/冲突感 | 重新生成，强制规则 |
| STEP3 槽位不匹配 | 输出模板和填充数据的 diff，不改模板 |
| 外部工具不可用（TTS/PPT/ffmpeg） | 输出数据文件，标注"需人工转换" |
| batch 中途中断 | 输出已完成的 n/N 个，标记断点 |

---

## 版本一致性

- 所有文件遵守当前模板版本
- 模板更新时，旧的已填充内容**不**回溯修改
- 新生成的内容**必须**使用当前模板
