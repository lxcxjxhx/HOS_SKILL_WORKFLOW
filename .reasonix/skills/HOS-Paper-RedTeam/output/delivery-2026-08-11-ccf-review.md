# HOS 论文鞭尸局 · CCF 论文评审交付

> **目标项目**: [HOS-LS](https://github.com/lxcxjxhx/HOS-LS)（AI 驱动代码安全分析：LLM 语义分析 + 多 Agent 架构 + RAG/CVE 集成 + Exploit 生成与自动验证）
> **评审方向**: LLM 驱动的漏洞检测与代码安全分析（类似方向，CCF 范围）
> **评审日期**: 2026-08-11 · **辣度**: 3（内部鞭尸局）
> **方法论背书**: [How to Read a Paper 第三遍 — 挑战隐藏假设/反例] · [CS Reviewer Rubric — Novelty/Soundness/Experiment/Repro] · [Craft of Research — 证据纪律]（详见 `references/methodology.md`）

---

## 📋 一、候选论文清单（CCF 范围内 HOS-LS 类似方向）

| # | 论文 | Venue（CCF 等级） | 与 HOS-LS 的对应点 | 状态 |
|---|------|------------------|--------------------|------|
| 1 | **Vulnerability Detection with Code Language Models: How Far Are We?**（PrimeVul）| ICSE 2025（A）| AI 漏洞检测能力评测 —— HOS-LS 的「误报率 <5%」声称正撞在这把尺子上 | ✅ 已深度评审 |
| 2 | **PentestGPT: Evaluating and Harnessing LLMs for Automated Penetration Testing** | USENIX Security 2024（A）| LLM 工具系统 + Exploit 生成/验证 —— HOS-LS 攻击链推理的直接对标 | ✅ 已深度评审 |
| 3 | **Combining Fine-Tuning and LLM-based Agents for Intuitive Smart Contract Auditing**（iAudit）| ICSE 2025（A）| 微调 + Agent 审计流水线 —— HOS-LS 多 Agent 验证架构的 SE 侧对照 | 📋 候选（未深度评审）|
| 4 | **Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions** | S&P 2022（A）| AI 生成代码安全性 —— 与 HOS-LS 的「AI 代码扫描」场景互补 | 📋 候选（未深度评审）|

> 另有 2026 年 arXiv 多 Agent 漏洞检测新论文（CLEAR 2608.03134、Argus 2604.06633、AEGIS 2603.20637、Phoenix 2604.19012、FuzzingBrain V2 2605.21779 等）均与 HOS-LS 高度同向，但**尚无 CCF venue 记录**，未列入评审对象（符合「范围在 CCF」约束），已记入研究机会观察池。

---

## 🎴 二、PrimeVul（ICSE 2025）评分卡

```
# 🎴 论文评分卡 — Vulnerability Detection with Code Language Models: How Far Are We?
77.00/100  🟢 方法论扎实 · ICSE 2025 (CCF-A)
##打脸型基准 ##数据去重 ##时间切分 ##函数级评估

维度: 新颖性 14/20 · 严谨性 17/25 · 贡献度 17/20 · 可复现性 12/15 · 清晰度 8/10 · 影响力 9/10
RVE: 0004 函数级评估上限(HIGH) · 0003 标签核验样本过小(MED) · 0005 自创指标(MED) · 0006 无 SAST 对比(MED)
一句话: 把 BigVul 68% F1 打到 3%，但函数级评估看不见跨函数漏洞。
```
（完整渲染：`output/primevul-card.html` / `output/primevul-card.md`）

---

# HOS论文鞭尸局 #002 — PrimeVul

## Target

| 字段 | 值 |
|------|----|
| 论文 | Vulnerability Detection with Code Language Models: How Far Are We? |
| 作者 | Yangruibo Ding, Yanjun Fu, Omniyyah Ibrahim, Chawin Sitawarin, Xinyun Chen, Basel Alomair, David Wagner, Baishakhi Ray, Yizheng Chen |
| 会议/arXiv | ICSE 2025（CCF-A）/ arXiv 2403.18624 |
| 提交日期 | 2024-03-27 |
| RVE 系列 | HOS-RVE-2026-0003 ~ 0006 |

## TL;DR

> 领域打脸专业户：BigVul 上 68.26% F1 的 7B 模型被它打到 3.09%，GPT-3.5/4 最强设置下接近抛硬币——但核验样本每基准只有 50 个函数，评估锁死在函数级，跨函数漏洞它看不见，也没跟任何传统 SAST 比过。

## 创新点

⭐⭐⭐⭐（评测协议创新，非检测方法创新）

1. 首个「严格去重 + 时间切分」的代码大模型漏洞检测基准：现有基准最高 18.9% 测试样本从训练集泄漏（Code Copy + Time Travel 两条泄漏通道）。
2. 双自动标注技术 PrimeVul-NvdCheck（CVE 专家分析）/ PrimeVul-OneFunc（commit 唯一变更），标签正确率 92%/86%（≈SVEN 水平），对比 CodeXGLUE 仅 24%。
3. 自创 VD-S 指标 + pair-wise 评估协议，正面回击 Accuracy/F1 与真实漏洞检测场景的失配。

## 攻击面

### 数据层

- **[HOS-RVE-2026-0003]（MEDIUM）标签核验样本过小、正确率无独立复核**：每个基准只随机抽样 **50 个函数**、3 位作者（其中 2 位学生 + 1 位资深专家）人工核验（§II-B）。92%/86% 的正确率是**作者自评**，无第三方独立复核；且 PrimeVul 合并重建的源数据仍来自 BigVul/ReVeal/CrossVul/CVEfixes/DiverseVul 等脏源，重建清洗的有效性本身需要独立验证。

### 实验层

- **[HOS-RVE-2026-0004]（HIGH）函数级评估的系统性盲区**：评估协议是函数级分类，跨函数、跨文件、依赖上下文（调用链、数据流、框架约定）的漏洞**根本不在测量范围内**——论文自己的 Discussion 就写了 "Need for More Context"。3.09% F1 这个被广泛引用的数字，一部分是「1:32.8 极端不平衡 + 严格 pair-wise + 时间切分」协议挤出来的，不能全部读作「模型无能」。
- **[HOS-RVE-2026-0005]（MEDIUM）VD-S 为自创指标，无第三方采纳验证**：VD-S（固定 FPR 阈值下的 FNR）想法合理，但截至评审无第三方采用或校验；F1 在 1:32.8 下对召回极其敏感，单一 F1 讲故事仍然危险（这恰是它批评别人的毛病）。

### 工程层

- **[HOS-RVE-2026-0006]（MEDIUM）全程无传统 SAST 对照组**：只测了 code LMs，没和 Semgrep/CodeQL/Snyk 同台。结论「代码大模型无法实用部署」只证明了一半——AI 工具相对**既有工程基线**到底行不行，论文没答。而这个问题恰恰是 HOS-LS 这类「AI + 规则混合」系统的立足点。

### 安全层

- 无重大 RVE-SEC。数据集构建过程无 prompt 注入风险；但作为 benchmark，其标签的正确性直接影响下游所有用它的论文——标签 5% 的误差会被下游放大，这是基准类工作的固有责任。

## Paper Exploit

**方法**: 对 PrimeVul 的 3.09% F1 做一个分解实验：在函数级协议上叠加仓库级上下文（把调用链/依赖文件拼进 prompt），量化 3.09% → X% 的提升；再用同一批模型跑 Semgrep/CodeQL 作对照。
**结果**: 预期大幅拉开「协议限制」与「模型能力上限」的差距——3.09% 的戏剧性叙事将被拆掉一半。
**杀伤力**: 结论削弱（"现有基准高估模型能力"仍成立，但"模型根本不行"被证伪一半）

## Patch

1. **HOS-RVE-2026-0003**: 标签核验扩展到每基准 ≥300 函数随机抽样，公开核验标注细则并引入第三方（如独立安全研究员）盲审抽检；发布标签争议清单。
2. **HOS-RVE-2026-0004**: 增加仓库级评估协议（可复用 VulnAgent-R2/AEGIS 的仓库级评测设置），或至少在 Discussion 明确量化函数级协议的系统性低估。
3. **HOS-RVE-2026-0005**: VD-S 与 pair-wise 之外补充完整 P/R/F1 混淆矩阵 + 按 CWE 分层的指标；公开时间切分点与样本分布。
4. **HOS-RVE-2026-0006**: 增加 Semgrep/CodeQL/Snyk 的传统 SAST 基线，回答「AI vs 工程基线」的实用问题。

## Reviewer 模拟

```yaml
decision: "Weak Accept（真实结果：Accept，ICSE 2025）"
overall: 7.5
key_concerns:
  - "标签核验样本量过小（50/基准），正确率主张缺独立复核"
  - "函数级评估协议的系统性低估未量化，3.09% 叙事有夸大嫌疑"
  - "无传统 SAST 对照组，'无法实用部署'结论超出证据"
```

## Next Paper Idea

**方向**: 仓库级 AI 漏洞检测 vs 传统 SAST 的对抗评测（PrimeVul 协议 + 仓库级上下文 + Semgrep/CodeQL 对照）
**论文机会**: ★★★★★（PrimeVul 已把函数级天花板钉死，仓库级 + 传统 SAST 对照是公认空白）
**投稿**: ICSE / ISSTA（CCF-A SE）

## 权威解读与佐证

- **arXiv**: [abs/2403.18624](https://arxiv.org/abs/2403.18624) — v2（2024-07-10），comment 标注 "Accepted for ICSE 2025"
- **OpenReview**: 查不到（ICSE 审稿不公开）——证据缺口
- **Papers with Code**: 查不到 PrimeVul 复现排行榜——证据缺口
- **官方仓库**: [github.com/DLVulDet/PrimeVul](https://github.com/DLVulDet/PrimeVul) — 264 stars、MIT、数据 Google Drive 公开，os_expr/openai_expr/calc_vd_score.py 齐备
- **间接佐证（强）**: 2026 年多篇多 Agent 漏洞检测论文（VulnAgent-R2 2603.13384、AEGIS 2603.20637、Phoenix 2604.19012）均以 PrimeVul 为默认评测集——其事实标准地位已被第三方确认

## 认可

"把 BigVul 的 68.26% 打到 3.09%、把泄漏率最高 18.9% 的老基准钉在耻辱柱上——这份打脸是领域急需的，PrimeVul 已经是后续所有 AI 漏洞检测研究的绕不开的尺子。"

---

## 🎴 三、PentestGPT（USENIX Security 2024）评分卡

```
# 🎴 论文评分卡 — PentestGPT: Evaluating and Harnessing Large Language Models for Automated Penetration Testing
68.00/100  🟡 有亮点有硬伤 · 实验拖累 · USENIX Security 2024 (CCF-A) · Distinguished Artifact Award
##human-in-the-loop ##训练污染 ##内部数字矛盾 ##弱基线对比

维度: 新颖性 14/20 · 严谨性 12/25 · 贡献度 15/20 · 可复现性 10/15 · 清晰度 8/10 · 影响力 9/10
RVE: 0007 训练污染未排除(HIGH) · 0008 内部数字矛盾(HIGH) · 0009 弱基线+human-in-the-loop(MED) · 0010 复现困难(MED)
一句话: 228.6% 是对裸 GPT-3.5 说的，训练污染只靠问模型自证清白。
```
（完整渲染：`output/pentestgpt-card.html` / `output/pentestgpt-card.md`）

---

# HOS论文鞭尸局 #003 — PentestGPT

## Target

| 字段 | 值 |
|------|----|
| 论文 | PentestGPT: Evaluating and Harnessing Large Language Models for Automated Penetration Testing |
| 作者 | Gelei Deng, Yi Liu, Víctor Mayoral-Vilches, Peng Liu, Yuekang Li, Yuan Xu, Tianwei Zhang, Yang Liu, Martin Pinzger, Stefan Rass |
| 会议/arXiv | USENIX Security 2024（CCF-A）+ Distinguished Artifact Award / arXiv 2308.06782 |
| 提交日期 | 2023-08-13 |
| RVE 系列 | HOS-RVE-2026-0007 ~ 0010 |

## TL;DR

> 「Automated」渗透测试，实际是渗透测试者手动执行每条命令的 human-in-the-loop 助手；228.6% 提升相对的是 2023 年裸 GPT-3.5；训练污染只靠「问 LLM 知不知道靶机」自证清白；论文内部 4/10 和 6 台还打架。

## 创新点

⭐⭐⭐⭐（开山之作 + 工程完成度高）

1. 首个系统定量研究 LLM 自动渗透测试能力的 benchmark：13 靶机 / 182 子任务，覆盖 OWASP Top 10 + 18 个 CWE，来源 HackTheBox + VulnHub 真实机器。
2. PTT（Pentesting Task Tree）：把攻击树编码进 LLM 推理，用结构化任务状态缓解 context loss——这个思路被后续 Cybench、Guided Reasoning (COLM 2025) 沿用。
3. 消融干净利落：去推理模块仅达 53.6% 子任务完成（低于裸 GPT-4），实证了三模块分工的价值；14.8k stars + Zenodo artifact 获 USENIX Distinguished Artifact Award。

## 攻击面

### 数据层 / Benchmark 层

- **[HOS-RVE-2026-0007]（HIGH）训练数据污染未排除，缓解手段等于没有**：靶机是 HackTheBox/VulnHub 公开机器，攻略散布在博客/论坛/CTF 题解中，极可能已进 LLM 训练集。论文的缓解是「人工询问 LLM 是否知晓该靶机」+ 选 2021 后发布的机器（§7）——让 LLM 自证清白毫无效力（它当然说不知道），2021 后机器同样可能被收录。**评估有效性因此整体存疑**。

### 实验层

- **[HOS-RVE-2026-0008]（HIGH）论文内部数字矛盾**：§1 称 HackTheBox 实践研究「resolved 4 out of 10」目标，Table V 与正文却列出「completes three easy and five medium challenges」共 6 台——同一事实两个数字，统计口径混乱，读者无法确认真实成功率。
- **[HOS-RVE-2026-0009]（MEDIUM）「Automated」标题 vs human-in-the-loop 评估 + 弱基线对比**：评估全程由渗透测试者执行命令并回贴输出（Artifact 附录 A.1），本质是 LLM 辅助渗透；228.6% 是相对裸 GPT-3.5（2023 弱基线）的子任务完成数提升（相对 GPT-4 仅 58.6%），非端到端打穿靶机的成功率；root flag 作为唯一成功标准，粒度二元化。

### 工程层 / 复现

- **[HOS-RVE-2026-0010]（MEDIUM）完整复现困难**：论文自述复现挑战（LLM 非确定性、需渗透测试专业人力、部分 HackTheBox 机器仅限订阅者、需人工执行全流程）；评估用的 GPT-4 32k API 已被 OpenAI 停用；当前 main 分支已重构为 v1.0 agentic 架构，论文原版留在 `pentestgpt_legacy`——按论文复现的路径基本断了。

### 安全层

- 工具本身依赖 jailbreak 提示词（论文自述 §7，为让 LLM 输出 reverse shell 等内容）——作为「防御方工具」的定位与「绕过安全对齐」的实现之间存在伦理张力；OpenAI API 数据保留 30 天、误操作可致系统损坏（附录 A.2.1）。

## Paper Exploit

**方法**: 用 GPT-4o / Llama-3.1-405B 等 2024 后模型重跑 PentestGPT 全流程（ACL ARR 2024 论文已做），并把「4/10 vs 6 台」的矛盾作为统计严谨性质疑的核心。
**结果**: 第三方结论已出——「GPT-4o 与 Llama-3.1-405B 均达不到完全自动端到端渗透测试」；PentestGPT 的「自动化」叙事被实证拆穿。
**杀伤力**: 结论削弱（benchmark 与 PTT 价值仍在，但「Automated Penetration Testing」的核心主张不成立）

## Patch

1. **HOS-RVE-2026-0007**: 改用 post-cutoff 私有靶机（或对公开靶机做攻略泄漏双重排查：时间窗口 + 语料检索），并用数据污染免疫的评测设计（如动态生成靶标）。
2. **HOS-RVE-2026-0008**: 统一统计口径，全量公布每台靶机的端到端结果、子任务完成明细与失败原因表。
3. **HOS-RVE-2026-0009**: 标题与摘要改为「LLM-assisted penetration testing」或补全自动评测版本；基线升级到同时代最强模型。
4. **HOS-RVE-2026-0010**: 冻结论文版环境（Docker + 模型版本锁定），发布可一键复现的评测镜像；公开靶机清单与难度映射。

## Reviewer 模拟

```yaml
decision: "Weak Accept（真实结果：Accept + Distinguished Artifact Award）"
overall: 7.0
key_concerns:
  - "训练数据污染缓解手段无效，评估有效性存疑（人工询问 LLM 不等于排除污染）"
  - "论文内部成功率数字不一致（4/10 vs 6 台）"
  - "'Automated' 与实际 human-in-the-loop 评估不符"
```

## Next Paper Idea

**方向**: 污染免疫的 LLM 渗透测试评测框架（post-cutoff 私有靶机 + 双盲泄漏排查 + 全自动执行协议）
**论文机会**: ★★★★（PentestGPT 的评估漏洞已被 ACL ARR 2024 部分验证，但「如何干净地评测」仍是开放问题）
**投稿**: USENIX Security / IEEE S&P（CCF-A Security）

## 权威解读与佐证

- **arXiv**: [abs/2308.06782](https://arxiv.org/abs/2308.06782) — v2（2024-06-02）
- **USENIX 官方**: [usenixsecurity24/presentation/deng](https://www.usenix.org/conference/usenixsecurity24/presentation/deng) — pages 847-864，Distinguished Artifact Award Winner
- **OpenReview（第三方复现，一手证据）**: forum [yun0PP1xaV](https://openreview.net/forum?id=yun0PP1xaV)（ACL ARR 2024 October）— 直接用 PentestGPT 评估 GPT-4o/Llama-3.1-405B，结论「达不到完全自动端到端渗透测试」；另有 PACEbench（ICLR 2026, forum kGEuZXaXU6）以 PentestGPT 为 baseline 对比，并披露作者 2025-06 发布继任项目 Cybersecurity AI (CAI)
- **Papers with Code**: 查不到 PentestGPT 官方复现榜——证据缺口
- **官方仓库**: [github.com/GreyDGL/PentestGPT](https://github.com/GreyDGL/PentestGPT) — 14.8k stars / 2.6k forks，MIT；Zenodo [10.5281/zenodo.12260307](https://doi.org/10.5281/zenodo.12260307)

## 认可

"PTT 任务树 + 干净的三模块消融是实打实的贡献，14.8k stars 和杰出 artifact 奖不是白拿的——它是整个 LLM 渗透测试子领域的起点，只是『自动化』三个字撑不起评估里那双 human-in-the-loop 的手。"

---

## 🔬 四、Next Paper Ideas（Research Miner）

### GAP-2026-002（触发 RVE: HOS-RVE-2026-0004 / 0006）★★★★★

**问题**: PrimeVul 证明了函数级 code LM 不行（3.09% F1），但没回答仓库级 AI 工具（如 HOS-LS）相对传统 SAST（Semgrep/CodeQL）的实用价值——「AI vs 工程基线」是公认空白。
**方向**: *Repo-Level AI Vulnerability Detection vs Traditional SAST: An Adversarial Benchmark*
**现有工作**: PrimeVul（函数级基准）、VulnAgent-R2/AEGIS（仓库级多 Agent，均以 PrimeVul 评测但无 SAST 对照）、Argus（RAG+多 Agent SAST 声称零日）
**空白**: 无统一协议把「仓库级 LLM Agent 系统」与「成熟 SAST 工具链」放在同一数据集、同一指标下对抗评测（含误报率、成本、token 消耗）
**投稿**: ICSE / ISSTA（CCF-A）
**与 HOS-LS 协同**: 直接——HOS-LS 的「误报率 <5%」声称需要一个这样的第三方评测背书

### GAP-2026-003（触发 RVE: HOS-RVE-2026-0007）★★★★

**问题**: LLM 渗透测试/漏洞检测评测普遍存在训练污染，且缓解手段无效（问模型自证清白）。
**方向**: *Post-Cutoff Private Targets: Pollution-Immune Evaluation for LLM Offensive Security*
**现有工作**: PentestGPT（公开靶机，污染未排除）、Cybench/CVE-Bench（同类问题）、Sifting the Noise（post-cutoff 验证思路）
**空白**: 无系统的污染免疫评测协议（私有靶机生成 + 双盲泄漏排查 + 自动执行）
**投稿**: USENIX Security / IEEE S&P（CCF-A）
**与 HOS-LS 协同**: HOS-LS 的 Exploit 验证模块可作为评测执行器

### 观察池（2026 年 arXiv 同向新论文，待 CCF venue 确认后入审）

- CLEAR（2608.03134）：因果知识图谱 + 4 Agent，P-C 提升 130.7%——营销浓度高，值得盯
- AEGIS（2603.20637）：首个 PrimeVul 破 100 Pair-wise 的框架，声称 FPR 降 54.4%——「首个破百」是典型 hype 信号
- FuzzingBrain V2（2605.21779）：29 个零日 + 2 CVE，声称「AIxCC 2025 决赛 90% 检出」——零日叙事需核验 CVE 编号
- VulnAgent-R2（2603.13384）：自报统计显著性（Bootstrap + Holm 校正），是目前少数做统计严谨性的多 Agent 论文，值得借鉴

---

## 📊 五、RVE 登记汇总（本次新增 8 条）

| RVE ID | 论文 | 分类 | 严重度 | 标题 |
|--------|------|------|--------|------|
| HOS-RVE-2026-0003 | PrimeVul | RVE-DATA | MEDIUM | 标签核验仅抽样 50 函数/基准，正确率 92% 无独立复核 |
| HOS-RVE-2026-0004 | PrimeVul | RVE-EVAL | HIGH | 函数级评估盲区：跨函数/跨文件漏洞系统低估，3.09% 部分来自协议 |
| HOS-RVE-2026-0005 | PrimeVul | RVE-EVAL | MEDIUM | VD-S 自创指标无第三方验证；F1 在 1:32.8 下敏感 |
| HOS-RVE-2026-0006 | PrimeVul | RVE-BENCH | MEDIUM | 无传统 SAST 对照，无法回答 AI vs 工程基线 |
| HOS-RVE-2026-0007 | PentestGPT | RVE-BENCH | HIGH | 训练污染未排除，缓解仅「问 LLM 自证清白」 |
| HOS-RVE-2026-0008 | PentestGPT | RVE-EVAL | HIGH | 内部数字矛盾：§1 写 4/10 台 vs 表格 6 台 |
| HOS-RVE-2026-0009 | PentestGPT | RVE-EVAL | MEDIUM | 「Automated」标题 vs human-in-the-loop；228.6% 相对裸 GPT-3.5 弱基线 |
| HOS-RVE-2026-0010 | PentestGPT | RVE-REPRO | MEDIUM | 完整复现困难（靶机订阅/模型停用/人工执行），原版被重构 |

---

## 🎯 六、对 HOS-LS 的启示（红队结论）

1. **PrimeVul 是你最该跑的测试**：HOS-LS 声称「误报率 <5%」——PrimeVul 的 pair-wise + 1:32.8 协议正是检验该声称的现成尺子；跑不过它，「低误报」就只是 README 里的营销词。
2. **函数级是死胡同，仓库级才是战场**：PrimeVul 已证明函数级 code LM 天花板极低；HOS-LS 的函数级切片 + 多 Agent 架构必须用仓库级（跨文件数据流/调用链）评测才有存在价值。
3. **PentestGPT 是 HOS-LS Exploit 模块的镜子**：它的教训——「自动验证」必须是真自动（sanitizer/执行器闭环，像 Revelio 那样），评估必须防训练污染（用私有/新靶标），数字口径必须统一。
4. **建议行动**：跑一次 PrimeVul（函数级 + 仓库级）自测，把结果（含 FPR/F1/成本）公开——这是把 HOS-LS 从「自评 92/100」变成「第三方可核验」的最短路径。
