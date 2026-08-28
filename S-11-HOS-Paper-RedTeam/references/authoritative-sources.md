# 权威书评与解读来源库（Authoritative Sources）

> 本 Skill 的每条吐槽都要有证据；证据的最高形态是**权威第三方佐证**——不是我们说的，是领域公认的。本文件定义：审论文时去哪里核验、引用什么权威解读、背书书籍的权威书评在哪。

## 一、论文权威解读来源（评审时引用）

| 来源 | 用途 | 何时用 |
|------|------|--------|
| **arXiv abs 页** | 标题/版本/发表状态/代码链接/引用 | 每篇论文必核验（Evidence 默认动作） |
| **OpenReview** | 真实同行评审意见（顶会公开审稿） | 论文已投稿/中稿时：对照真实 reviewer 意见，验证本 Skill 的 RVE 是否与真实评审吻合 |
| **Papers with Code** | 复现结果/排行榜/SOTA 对比 | 论文声称 SOTA 时：查 PWC 是否有复现、真实排名 |
| **Semantic Scholar** | 引用量/被引趋势/后续工作 | 论文声称「影响力大」时：查真实被引与后续工作 |
| **Google Scholar / arxiv-sanity** | 引用网络、相关工作聚类 | 评估影响力与新颖性时 |
| **官方仓库 Issues/Releases** | 作者自证/翻车现场 | 论文声称开源可复现时：查仓库健康度（star/PR/维护频率） |

**引用规则（铁律）**：
1. 引用权威来源必须给出**具体可核验锚点**（arXiv ID、OpenReview forum、PWC 链接、S2 paper URL），禁止「据社区反映」这种无锚点表述。
2. 查不到 = 写「查不到，证据缺口」（RVE-REPRO），禁止编造查证结果。
3. 网络不可用时写入 `degradations`，不许假装查证过（降级不撒谎）。

## 二、背书书籍的权威书评（方法论背书佐证，2026-02-16 已逐本核验）

方法论背书（`references/methodology.md`）中每本书的锚点均经官方页面 / Crossref / 原文 PDF 亲自核验（见 §三 核验方法），对外解释时引用出版社官方定位而非自评：

| 书 | 锚点（ISBN/DOI/URL，已验证） | 官方定位（核验自官方页面） |
|----|------------------------------|------------------------------|
| The Craft of Research 5th | ISBN 9780226826677 · https://press.uchicago.edu/ucp/books/book/chicago/C/bo215874008 | UChicago Press 官方：覆盖选题/提问/资料评价/论证/表达/研究伦理/生成式 AI 使用；定位高中到资深研究者通用；售出超一百万册 |
| Research Design 5th | https://collegepublishing.sagepub.com/products/research-design-5-255675 | SAGE 官方：比较 qualitative / quantitative / mixed methods 设计；第五版新增 power analysis、实验与调查设计 |
| How to Read a Paper | https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf | Stanford 官方托管原文 PDF（2007），Three-Pass Approach |
| How to Write a Lot 2nd | DOI 10.1037/0000109-000 | APA 出版（2019 第 2 版），写作生产力经典 |
| English for Writing Research Papers 2nd | DOI 10.1007/978-3-031-31072-0 · ISBN 9783031310720 | Springer（2023 第 2 版），Crossref 记录含 Chatbots 章节（AI 辅助写作） |

> ⚠ 2026-02-16 修正记录：原稿引用的 `9783032370884`（link.springer.com/book/9783032370884）**经 Crossref / Open Library 双重查证不存在**，为 AI 幻觉；已替换为真实 ISBN 9783031310720 与 DOI 10.1007/978-3-031-31072-0。

## 三、背书核验方法（防幻觉标准流程）

对任何一本书/一篇论文的背书声明，按下表核验后才允许引用：

| 核验源 | API/URL | 能确认什么 |
|--------|---------|-----------|
| 出版社官方页面 | 逐本访问（如 press.uchicago.edu / collegepublishing.sagepub.com） | 版本、作者、目录、官方简介、书评 |
| Crossref API | `https://api.crossref.org/works?query.bibliographic=<书名>` | DOI、ISBN、出版年份（最权威的书目记录） |
| Open Library API | `https://openlibrary.org/api/books?bibkeys=ISBN:<isbn>&format=json&jscmd=data` | ISBN 是否存在 |
| 原文 PDF/全文 | 官方托管 URL | 内容本身（如 Stanford 的 How to Read a Paper） |

**判定**：ISBN 在 Crossref / Open Library 查不到 = 视为幻觉，禁止引用，改用查证到的真实锚点。

## 四、与 S-12 对齐：联网核验（Evidence 默认动作）

对齐 S-12-HOS-Critic-Review 的 Evidence-Agent 铁律：

- 对 `paper` 类输入，**必须尝试**核验 arXiv 元数据（标题/版本/发表状态/代码链接）与 OpenReview/PWC 的审稿与复现信息——不是可选增强。
- 只有**已尝试且失败**才允许标「查不到，证据缺口」；未尝试联网就标 unverifiable 属流程缺陷。
- 配置开关见 `config/config.yaml#evidence_network`。

## 四、输出引用格式

评分卡/长文中引用权威来源，用统一格式：

```markdown
[权威佐证: OpenReview ICLR'26 forum <url> — 真实 reviewer 给出 3.5/10，与本卡实验层评分一致]
[权威佐证: Papers with Code <url> — 该论文无复现记录，声称的 SOTA 排名无实证]
[权威佐证: arXiv abs <url> — 论文 v1 提交于 2026-01，无代码链接]
```

一句话点评、RVE 证据、Reviewer 模拟的「与真实 OpenReview 对照」三处必须尽量挂权威佐证。
