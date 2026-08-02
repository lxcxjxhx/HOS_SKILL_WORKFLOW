# HOS-CRITIC-REVIEW · Academic Decision

Target: CAMEL-GRU：基于门控循环单元的轻量级恶意软件分类框架
Decision: **Reject**
Score: 54/100 · 风险

## 0. 评分卡
- One-liner: 三个弱基线撑起 SOTA 宣称，代码数据全锁柜。
- Six Dimension: Technical 6 · Innovation 5 · Engineering 5 · Ecosystem 5 · Risk 5 · Strategic 6

## 1. Reviewer Summary
### reviewer2
- 99.2% 的 SOTA 宣称建立在三个弱基线上，等于回避竞争 —— §3.2 只跟 TF-IDF+SVM、RF、MLP 比——三个方法都是十年前的主流；拿它们衬托『全面超越』，等于没跟任何近年深度方法比过
- 复现成本被隐藏：代码、数据、超参、有效引用全部缺位 —— Abstract 明示不开源；超参『正式版本中给出』；参考文献 [1] 链接失效。审稿视角下，这不是『未来工作』，是当前不可复现的免责声明
### experiment-auditor
- 只报准确率与 F1 汇总值，细粒度指标缺失，无消融无法归因 —— §3.2 未报告按类别/恶意软件家族的细粒度指标；§3.3 无消融，99.2% 到底是哪一层贡献的，读者无从判断
- 轻量级定位与延迟指标是有价值的工程视角 —— 以 2.1M 参数和推理延迟 -47% 为目标而非单纯堆准确率，方向符合端点部署现实，这部分动机是成立的

## 2. Critical Blocking Issues
- [HIGH] HCR-EVAL-2026-0001 · SOTA 宣称缺乏强基线对比 —— Abstract 宣称全面超越所有现有方法（SOTA），但实验仅对比 TF-IDF+SVM、随机森林、MLP 三个弱基线，未对比任何近年深度方法

## 3. Strengths
- 轻量级定位与延迟指标是有价值的工程视角 —— 以 2.1M 参数和推理延迟 -47% 为目标而非单纯堆准确率，方向符合端点部署现实，这部分动机是成立的

## 4. Suggested Revision
- [ ] 补充与 ≥2 个近年深度检测方法（如 Transformer 类）的对比，或删除 SOTA 表述（HCR-EVAL-2026-0001）
- [ ] 公开数据样本/脱敏说明，补充近年公开数据集（HCR-DATA-2026-0002）
- [ ] 开源代码与数据（至少匿名仓库），补全超参与有效引用（HCR-REPRO-2026-0003）
- [ ] 补充消融：逐层移除特征哈希/自注意力并报告指标变化（HCR-EVAL-2026-0004）
- [ ] 补充与轻量级基线（如 MobileNet 风格时序模型、轻量 Transformer）的架构对比（HCR-CLAIM-2026-0005）

## 5. Decision Rationale
- Score: 54/100 · Rationale: technical 6：架构为哈希+GRU+注意力常见组合，描述清楚但无深度（finding-005 partial -0.4）；innovation 5：「核心创新」表述无对比支撑，无实质新技术（finding-005 partial -0.35, finding-001 verified -1.0）；engineering 5：代码/超参/数据均未公开（finding-003 verified -1.0）；ecosystem 5：未发表、引用为零、参考链接失效；risk 5：基线弱、无消融、自建数据不可得，结论可信度低（finding-001 -0.75, finding-002 -0.5, finding-004 -0.5）；strategic 6：轻量级端点检测方向有价值但本文贡献存疑。
