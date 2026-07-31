# ghfind 评分卡参考（内嵌版）

> 本文件把 ghfind.com（毒舌 GitHub 评分）的评分卡结构**内嵌**到 skill 里，作为评分卡模板的参考蓝本。**以后不需要再抓取 ghfind.com**——结构就在这里，且已用 TS 模板化（见 `src/render.ts`）。

## 一、ghfind 原始卡结构（GitHub 开发者版）

```
@账号 + 一句话简介
82.70/100  🥇 顶级            ← 综合评分 + 评级
#标签1 #标签2 #标签3          ← 画像标签
我的位置 #241/共 1499 人       ← 排行榜位置
击败了 83.9% 的开发者          ← 击败百分比
距「夯」还差 7.30 分           ← 距下一评级差多少分
⚔️ 拉人对线 / 🔄 重新检测
🏆 贡献过的明星项目            ← 高星仓库贡献列表
维度评分（六维）               ← 各维度得分（不同满分权重）
🛠 代表作                     ← 代表项目 + PR 详情
🧬 和 TA 最像的开发者          ← 相似账号对比
🧬 技术栈 & 领域               ← 语言占比
🔥 毒舌点评全文                ← 一段锐评
一句话结论                    ← 一句话总结
维度 | 得分 | 说明            ← 维度明细表
风险标记                      ← 风险标记（无/列表）
建议                         ← 改进建议
补充证据                     ← 可核验的额外证据
```

**核心设计意图**：一个决定性分数 + 排行榜/击败百分比制造可传播性（社交货币）+ 维度分解说明分数从哪来 + 一句话锐评压缩结论。分数、排名、标签让卡片 3 秒可扫，长文靠后。

## 二、论文版映射（本 skill 实现）

| ghfind 元素 | 论文版（HOS-Paper-RedTeam） | 对应字段 |
|------------|------------------------------|----------|
| @账号 | 论文标题 + 作者/venue | `title` `authors` `venue` |
| 82.70/100 🥇 顶级 | {score}/100 + 评级 | `score` `rankLabel` |
| #标签 | #拼接物 #选择性报告 #画靶射箭 | `tags` |
| 我的位置 #241/1499 | 已审论文中的排名 | `position` |
| 击败 83.9% 开发者 | 击败 X% 已审论文 | `beatPercent` |
| 距「夯」还差 7.30 分 | 距「硬核货」还差 X 分 | `nextRank` |
| 🏆 贡献过的明星项目 | 🏆 亮点/关键贡献 | `highlights` |
| 维度评分（六维） | 六维评分（通用） | `dimensions` |
| 🛠 代表作 | 🛠 关键方法/技术栈 | `methods` |
| 🧬 最像的开发者 | 🧬 最像的论文 | `similarPapers` |
| 技术栈 & 领域 | （并入 methods / dimensions） | — |
| 🔥 毒舌点评全文 | 🔥 毒舌点评全文 | `roastFull` |
| 一句话结论 | 一句话点评（≤40 字） | `oneLiner` |
| 维度/得分/说明表 | 维度/得分/说明表 | `dimensions[].note` |
| 风险标记 | 风险标记（引用 RVE） | `riskFlags` |
| 建议 | 建议（Patch） | `suggestions` |
| 补充证据 | 补充证据 | `evidence` |

## 三、TS 模板化

结构已固化到 `src/`：

| 文件 | 说明 |
|------|------|
| `src/types.ts` | `PaperReviewData` 接口 + 通用六维默认值 |
| `src/render.ts` | `renderCard()` 渲染器（唯一渲染逻辑） |
| `src/index.ts` | CLI：`node src/index.ts <review.json>` |
| `src/example-review.json` | 示例数据 |

**通用于所有论文类型**：渲染器只认 `PaperReviewData` 这个数据形状，维度是数据驱动传入的。默认通用六维（新颖性/严谨性/贡献度/可复现性/清晰度/影响力，满分合计 100）；AI/安全论文可传领域定制维度。渲染器不关心论文领域，喂什么数据出什么卡。

**用法**：
```bash
# 渲染一张卡（review.json 为 PaperReviewData 结构）
node src/index.ts review.json
# 跑示例
node src/index.ts src/example-review.json
```

## 四、评分卡在流程中的位置

1. Scorer（`agents/11-scorer.md`）汇总 RVE → 产出 `PaperReviewData`（JSON）。
2. 调用 `renderCard()` 渲染出 ghfind 式评分卡。
3. 评分卡置于所有输出最顶部（SKILL.md 铁律）。
4. 完整鞭尸局长文仅在 `output_mode: full` 时作为附录。
