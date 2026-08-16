# 对比实验设计 · 同数据同 API 受控对比（HOS-LS 论文核心）

> **回答**：HOS-LS 论文对比什么？—— 在**同样的评测数据 + 同样的模型 API**下，HOS-LS 架构是否跑出更好效果。
> **原则**（16 篇评审教训 #5）：基线必须同量级——控制模型与数据，比的才是架构/方法增量，不是"我模型新/数据集软"。
> **现状**：HOS-LS 只有自评（92/100、误报率 <5%），无第三方同协议数据 → 本设计即 W2/W3 的落地蓝图。
> 依据：06 文档对比矩阵 + 16 篇评审数据（AEGIS/DREA/FzB/AutoTrace/Revelio 的模型/基准/口径实况）。

---

## 一、结论先行：对比什么（3 层）

| 层 | 对比 | 回答的问题 |
|----|------|-----------|
| **L1 受控主对比**（论文核心）| HOS-LS vs AEGIS / DREA（同数据 + 同模型 API）| **同样的数据接入同样的 API，HOS-LS 的架构是否更好** |
| **L2 能力下限** | HOS-LS vs 裸 LLM（同模型零样本）| 多 Agent + 工具闭环的增量有多大 |
| **L3 工程基线** | HOS-LS vs Semgrep / CodeQL | 相对传统 SAST 的实用价值（PrimeVul 未回答的问题）|

> **一句话**：论文的主张 = "同数据同 API 下，HOS-LS 四阶段架构（规则→筛选→LLM→确定性验证）带来**更低的误报率 + 更高的定位精度 + 更省的 token**"——L1 就是验证这句话。

---

## 二、对比方实况（16 篇评审核验）

| 对比方 | 评测数据 | 论文模型 | 代码 | 同数据同 API 可行性 |
|--------|----------|----------|------|---------------------|
| **AEGIS** | PrimeVul（函数级 pair-wise）| deepseek-v3.1（Verifier/Audit 同模型）| ✅ secureai4code/Aegis | **🟢 最高**：数据公开 + 代码开源 + 同为 DeepSeek 族 |
| **DREA** | RepoPairBench（Python 仓库级）| GPT-5.5（闭源）| ✅ huhusmang/DREA | **🟢 高**：数据公开 + 代码开源；模型需处理（见 §四）|
| **FuzzingBrain V2** | AIxCC 场景（C/C++ + OSS-Fuzz）| litellm 多后端（可换）| ✅ o2lab/FuzzingBrain-V2 | 🟡 **场景不同**：fuzzing 动态 vs HOS-LS 静态验证，不能简单同数据（见 §四）|
| 裸 LLM | 同一评测集 | deepseek-v4-flash | — | 🟢 最干净的控制 |
| Semgrep / CodeQL | 同一评测集 | 无（规则引擎）| ✅ 开源 | 🟢 静态工具天然可同数据 |

---

## 三、受控对比协议（L1 核心）

### 3.1 变量定义

| 变量 | 设定 |
|------|------|
| **控制变量** | 评测数据（同一份）· 模型 API（同一模型，见 3.2）· 指标定义（同一口径）· 运行环境（同一容器/机器）· 成本计价（同一 API 价格表）|
| **自变量** | 架构/方法：HOS-LS（四阶段+7 Agent+确定性验证）vs AEGIS（四层管线+CPG）vs DREA（双 Agent 解耦）vs 裸 LLM vs SAST |
| **因变量** | ①检测：Pair-wise Correct @k=1/2、F1、Precision/Recall ②误报：FPR（**标准口径**，防 AEGIS 的 fp=P-V+P-R 翻车）③定位：严格行命中率（防 AutoTrace 宽松口径）④成本：token 总数/每漏洞 token/每漏洞美元 |

### 3.2 模型对齐策略（关键决策）

| 情况 | 处理 |
|------|------|
| AEGIS 已用 deepseek-v3.1（开源可重跑）| **用 deepseek-v4-flash 重跑 AEGIS 代码**（同模型同数据）→ 最严受控；若重跑成本高，退而用"各自声明模型 + 同数据"并显式声明模型代差 |
| DREA 用 GPT-5.5（闭源不可重跑）| 同数据（RepoPairBench）对比；模型维度如实标注"跨模型"，**同时补跑 DREA 代码换国产模型**（DREA 代码开源、agent-framework 可换模型）若可行 |
| 裸 LLM 基线 | 一律 deepseek-v4-flash 零样本（与 HOS-LS 主模型一致）|

### 3.3 指标口径铁律（16 篇评审的坑全部规避）

1. FPR 用标准定义（FP/(FP+TN)），AEGIS 的 fp=P-V+P-R 逆向翻车是反面教材
2. 定位精度报**严格行命中 + relaxed 双口径**，隐藏基线条（patch-function 启发式）必须同台
3. 成本报**总成本 + 每漏洞成本**双口径（防 Revelio 挑分母）
4. 所有数字公开：分子/分母/样本 ID/单次运行补多 seed 统计检验

---

## 四、每对对比的公平性分析

### 4.1 HOS-LS vs AEGIS（PrimeVul，同数据同模型）—— 主战场 🟢

- **公平性**：数据同（PrimeVul pair-wise 协议）+ 模型同（v4-flash 重跑）→ 比的就是架构
- **预期优势**（架构分析）：
  - AEGIS 弱点：FPR 口径混乱（实际 21.96-54.40% 取最有利）、Audit 单向否决、Verifier 与 Audit 同模型（自证偏置）→ HOS-LS 的确定性验证（validator/sanitizer 仲裁）+ 对抗验证 Agent 直接对位
  - HOS-LS 预期：同数据下 FPR 更低（规则保下限）、Pair-wise 相当或更高（7 Agent 覆盖度 ≥50% 强制切换）
- **风险**：AEGIS 已有 122 pair-wise @k=2（PrimeVul 首个破百）——HOS-LS 若破不了百，**拆维度叙事**（FPR/成本/定位精度分项领先也成立）

### 4.2 HOS-LS vs DREA（RepoPairBench）—— 仓库级 🟢

- **公平性**：数据同（RepoPairBench manifest 公开）+ 模型尽力对齐（DREA 代码换国产模型重跑；不行则声明跨模型）
- **预期优势**：
  - DREA 短板（评审 RVE）：基准样本修在测试文件、训练记忆污染未排除、**无外部 agent SOTA 对比**——HOS-LS 正好做它的"外部 agent 对照"
  - 成本：DREA 声称 token offload 93%——HOS-LS 分层扫描省 50-80% token + Search Agent Top-K，直接对账
- **风险**：RepoPairBench 偏 Python 仓库级，HOS-LS 多语言优势在此数据集测不出 → 补充自建多语言样本

### 4.3 HOS-LS vs FuzzingBrain V2 —— 场景差异处理 🟡

- **问题**：FzB 是 fuzzing 动态验证（C/C++ 崩溃型），HOS-LS 是静态+确定性验证（多语言非崩溃型）——**同数据不公平**
- **处理**：
  1. **不硬比端到端**；在公共交集（如 OSS-Fuzz 项目集的**检测+定位**维度）对比"漏洞发现能力"，fuzzing 复现维度各自声明
  2. 或引 FzB 已公开的 AIxCC 现场成绩（44%）作参照，说明 HOS-LS 无需 fuzzing 基础设施也能发现同类漏洞（用可核验 CVE 对账）
  3. 对比表标注场景差异（fuzzing vs 静态），不假装同台
- **预期优势**：FzB 零日口径矛盾（29 vs 41）+ 39/41 不可核验 → HOS-LS 每个漏洞挂 CVE/issue 编号 = 直接对位其短板

### 4.4 HOS-LS vs 裸 LLM（同模型）—— 能力下限 🟢

- 同一评测集 + deepseek-v4-flash 零样本 vs HOS-LS 完整版 → **最干净的架构增量证明**（VulAgentRL 拿裸 LLM 当基线的正确用法）
- 预期：裸 LLM F1 低 + 无定位 + 无验证 → HOS-LS 全面领先（这是确定性结论，风险最低的一对）

### 4.5 HOS-LS vs Semgrep / CodeQL —— 工程基线 🟢

- 同数据（PrimeVul/RepoPairBench）跑 Semgrep/CodeQL 规则 → 回答"AI+规则混合系统相对传统 SAST 的实用价值"（PrimeVul 未回答的空白，HOS-LS 立足点）
- 预期：SAST 召回低（Sifting 数据背书 22.25% 真漏洞被吞）+ 误报高 → HOS-LS 在误报率与语义漏洞上领先；SAST 在速度/确定性上领先（诚实报告）

---

## 五、HOS-LS 预期优势总表（架构推导，待实验验证）

| 维度 | 预期优势 | 依据（架构）| 对应对比方短板 |
|------|----------|-------------|----------------|
| 误报率 | 更低 | 规则保下限 + ContextAnalyzer/InputTracer + 确定性验证兜底 | AEGIS FPR 口径混乱（21.96-54.40%）|
| 定位精度 | 更高（严格行命中）| 函数级切片 + 行号验证 + Agent-3 覆盖度强制切换 | AutoTrace 严格命中仅 31.97% |
| 成本 | 更低（每漏洞 token/美元）| 分层扫描省 50-80% token + Search Agent Top-K | Revelio 4.6 倍成本 / DREA token offload |
| 可核验性 | 全漏洞挂编号 | 验证闭环 + 报告输出 | FzB 39/41 零日不可核验 |
| 多语言 | 8 语言 | AST/CST 多语言支持 | AEGIS/FzB 限 C/C++（PrimeVul）|

> ⚠️ **诚实声明**：以上是**架构推导的预期**，不是结论。"同数据同 API 跑出来效果更好"必须用 L1 实验数据说话——如果跑不出整体领先，分维度叙事（误报率/成本/定位）仍是有效贡献（DREA 的负结果先例）。

---

## 六、落地（对应 06 文档 W2/W3）

| 工作 | 内容 | 依赖 |
|------|------|------|
| W2 基线跑通 | PrimeVul + RepoPairBench 上跑：HOS-LS 两种模式 / 裸 LLM（v4-flash）/ Semgrep / CodeQL | 评测集公开 ✅ |
| W3 对比复测 | 同数据同模型重跑 AEGIS（v4-flash 换模型）→ 对账表；DREA 同数据对比（跨模型声明）；FzB 场景声明对比 | AEGIS/DREA 代码开源 ✅ |
| W3b 模型对齐 | 尝试用 v4-flash 重跑 DREA（agent-framework 可换模型）→ 若成功即"同数据同 API"全对齐 | DREA 代码 ✅ |
| 输出 | 「声称值 vs 复测值」对账表 + 受控对比表（数据/模型/指标三列全公开）| W2+W3 |

---

## 七、一句话总结

> **HOS-LS 论文对比的核心问题 = 你的问题**：同样的数据、接入同样的 API，HOS-LS 跑出来是不是更好。答案靠 L1 受控实验（PrimeVul 同模型 vs AEGIS、RepoPairBench vs DREA）给出——**比架构不比模型，比口径不比嗓门**。跑赢了是"方法增量"的铁证，跑不赢也是负结果贡献，但必须跑。

---

*依据：06 文档对比矩阵 + 16 篇评审（AEGIS RVE-0039/0041、DREA RVE-0023/0025、FzB RVE-0031/0032/0033、AutoTrace RVE-0027/0028、Revelio RVE-0036）+ GitHub API 开源核验*
