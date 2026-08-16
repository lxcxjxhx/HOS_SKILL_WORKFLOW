# 经典评测集全景 · HOS-LS 评测集选型（W1 落地）

> **任务**：梳理 FuzzingBrain V2 / AEGIS / DREA 及其引用网络使用的经典评测集，供 HOS-LS 论文 W1 评测协议选型。
> **数据**：三篇 tex 源码 Evaluation 章节实测 + 16 篇评审（基准/泄漏/口径实况）+ 06/07 文档。
> **铁律**：评测集选择决定论文可信度——防泄漏、防污染、口径透明（16 篇评审教训）。

---

## 一、三篇对比文章实际用的评测集（tex 实测）

| 论文 | 评测集 | 规模（tex 原文）| 语言 | 特点 |
|------|--------|-----------------|------|------|
| **AEGIS** | **PrimeVul** | 6,968 vulnerable + 228,800 benign 函数 · 140 CWE · 测试集 **435 pair-wise pairs**（≥80% 字符串相似）| C/C++ | 函数级事实标准；严格去重+时间切分防泄漏 |
| **DREA** | **RepoPairBench**（自建）| **100 漏洞-修复 pairs** = 200 实例 · 48 CWE · 2021-2025 Python CVE | Python | 仓库级（函数+仓库快照+commit hash）；CVE 链接 |
| **FuzzingBrain V2** | **AFC**（AIxCC 2025 Final Challenge）| **40 漏洞 / 12 项目**（curl/Wireshark/systemd/libxml2）· 20 Full-scan + 20 Delta-scan | C/C++ | sanitizer 崩溃验证；真实比赛场景 |
| FuzzingBrain V2（补充）| 真实开源项目零日 + **FuzzingBrain-Bench** | 41 零日 / 19 项目 · Bench 40/63 漏洞口径 | C/C++ | 现实场景 + answer-free 密封评测 |

---

## 二、经典评测集全景（HOS-LS 选型候选池）

### A 类 · 函数级经典（深度学习/LLM 函数分类）

| 评测集 | venue | 规模 | 语言 | 谁在用 | 红队点评（口径/泄漏）|
|--------|-------|------|------|--------|----------------------|
| **PrimeVul** | ICSE 2025 | 6,968 vuln + 228,800 benign · 435 pairs | C/C++ | AEGIS（破百）、VulAgentRL、Phoenix、VulnAgent-R2 | **最严格**；标签核验仅抽 50 函数/基准（RVE-0003）；函数级盲区（RVE-0004）|
| **BigVul** | MSR 2020 | 3,754 漏洞函数 / 179k | C/C++ | 大量旧论文 | **泄漏重灾区**：最高 18.9% 训练泄漏（Code Copy + Time Travel）——被 PrimeVul 钉在耻辱柱 |
| **Devign** | NeurIPS 2019 | ~12k 函数（2.6k 漏洞）| C/C++ | 三篇对比文章都引 | 人工标注较干净；函数级；GNN 时代标准 |
| **ReVeal** | ICSE 2021 | ~2k 函数（去重后）| C/C++ | 评测协议参照 | 去重意识早；规模小 |
| **DiverseVul** | **RAID 2023** | 33k+ 漏洞函数（18 语言，约值）| 多语言 | 基准数据引用 | 规模大但噪音多（自动收集）|
| **CVEfixes** | **MSR 2021** | 5.5k+ CVE 修复（约值）| 多语言 | 基准数据引用 | 真实 CVE 修复（commit 级）|

### B 类 · 仓库级/Agent 级（2026 主流战场）

| 评测集 | 出处 | 规模 | 语言 | 谁在用 | 特点 |
|--------|------|------|------|--------|------|
| **RepoPairBench** | DREA（Internetware 2026）| 100 pairs = 200 实例 · 48 CWE | Python | DREA | 仓库级；2021-2025 CVE；**manifest 公开可复跑**（评审 RVE：部分"修复"落在测试文件/commit 与安全无关——需清洗）|
| **FuzzingBrain-Bench** | FzB 配套 | 40/63 漏洞口径 | C/C++ 等 | FuzzingBrain | answer-free 密封防作弊；40/63 口径不可查（RVE-0034）|
| **AFC**（AIxCC Final）| DARPA 2025 | 40 漏洞 / 12 项目 | C/C++ | FuzzingBrain + 6 决赛队 | 比赛场景；sanitizer 验证；**FzB 现场 44% vs 回测 90% 是口径教训** |
| **SinkTrace-Bench** | AutoTrace | 1,542 verifier-confirmed 样本 | 多语言 | AutoTrace | 触发点定位；严格行命中仅 31.97%（RVE-0027）|
| **ReposVul** | **ICSE 2024**（arXiv 2401.13169）| 仓库级高质量（规模以原文为准）| Python+Java | 引用网络 | 仓库级数据集（正式顶会论文）|
| **VulEval** | 2024 | 仓库级 | 多语言 | 引用网络 | 仓库级评测先驱 |
| **SecVulEval** | **2026**（ACM 3rd Intl Conf，DOI 10.1145/3805760.3814932）| 真实 C/C++ 仓库级（规模以原文为准）| C/C++ | 引用网络 | 真实世界 C/C++（DREA 亦引）|
| **CleanVul** | 2025 | 自动清洗函数级 | 多语言 | 引用网络 | 修复 commit 验证清洗 |
| **RealVul** | 2024 | web 应用真实漏洞 | Java/PHP | 引用网络 | 真实项目 |
| **SV-TrustEval-C** | 2025 | 结构+语义推理 | C | 引用网络 | 推理能力评测 |

### C 类 · 评测设计参照（非数据集，但影响 HOS-LS 协议）

| 参照 | 出处 | 作用 |
|------|------|------|
| **LLM4Vuln** | arXiv 2024 | 评测框架（LLM 推理能力解耦）|
| **Sifting the Noise** | ISSTA 2026 | LLM Agent 对比协议（16 篇评审唯一 CCF-A）|
| **risse（Top Score Wrong Exam）** | 2025 | benchmark 可信度批评 |
| **Mono** | 2025 | 数据集"可解性"批评（清洗验证）|
| **OSS-Fuzz** | Google | 真实项目持续 fuzzing 基础设施（FzB/Revelio 的验证环境）|

---

## 三、评测集红队点评（选型避坑）

| 坑 | 评测集 | 证据（16 篇评审）|
|----|--------|------------------|
| 训练泄漏 | BigVul 最高 18.9% | PrimeVul 泄漏分析（Code Copy + Time Travel 两通道）|
| 基准污染 | RepoPairBench 部分样本修在测试文件、commit 与安全无关 | DREA RVE-0023（HIGH）|
| 口径矛盾 | FuzzingBrain-Bench 40/63 漏洞口径不可查 | FzB RVE-0034（MED）|
| 赛后回测冒充现场 | AFC：FzB 现场 28/63≈44% vs 回测 90% | FzB RVE-0032（HIGH）|
| 宽松命中虚高 | SinkTrace-Bench：严格行命中 31.97% vs relaxed | AutoTrace RVE-0027（HIGH）|
| 标签核验不足 | PrimeVul 每基准仅抽 50 函数 | PrimeVul RVE-0003（MED）|
| 函数级盲区 | PrimeVul 跨函数漏洞看不见 | PrimeVul RVE-0004（HIGH）|

---

## 四、HOS-LS 评测集选型建议（W1 落地）

### 4.1 主评测集（与 07 文档 L1 对比对齐）

| 用途 | 选型 | 理由 |
|------|------|------|
| **函数级主战场** | **PrimeVul** | 与 AEGIS 同台（435 pair-wise 协议直接引用）；领域事实标准 |
| **仓库级主战场** | **RepoPairBench** | 与 DREA 同台（manifest 公开可复跑）；仓库级定位匹配 HOS-LS |
| **动态侧交集** | **OSS-Fuzz 项目集**（静态检测维度）| 与 FzB 公共交集，场景声明对比 |
| **多语言补充** | 自建 post-cutoff 样本（8 语言）| 防污染底线 + 发挥 HOS-LS 多语言优势（PrimeVul/RepoPairBench 单/双语测不出）|

### 4.2 选型纪律（每条对应避坑）

1. **防泄漏**：主评测用 PrimeVul（已时间切分）或自建 post-cutoff 样本——**禁用 BigVul 裸用**（18.9% 泄漏）
2. **防污染**：RepoPairBench 用前先做样本清洗（剔除落在测试文件的"修复"）——DREA 自己都没洗
3. **双口径**：定位精度报严格行命中 + relaxed（防 AutoTrace 式虚高）
4. **双成本**：总成本 + 每漏洞成本（防 Revelio 挑分母）
5. **可核验**：每个漏洞挂 CVE/issue/commit 编号（防 FzB 39/41 查不到）
6. **数据集可解性自检**：自建样本做 Mono 式可解性验证（防"数据集本身就能区分"）

### 4.3 不建议用

| 评测集 | 原因 |
|--------|------|
| BigVul（裸用）| 泄漏 18.9%，被 PrimeVul 钉死 |
| AFC（直接对比 FzB）| 场景不同（fuzzing）+ FzB 口径混乱（40 vs 63），只作参照不作主战场 |
| SinkTrace-Bench | 定位场景，可作补充但口径已证实宽松 |

---

## 五、一句话总结

> HOS-LS 评测 = **PrimeVul（函数级，对齐 AEGIS）+ RepoPairBench（仓库级，对齐 DREA）+ OSS-Fuzz 项目集（动态交集，对齐 FzB）+ 自建 post-cutoff 多语言样本（防污染 + 差异化）**——四件套覆盖三个对比对象，每件都带口径铁律。

---

*依据：AEGIS/DREA/FzB tex Evaluation 章节实测 + 16 篇评审（RVE-0003/0004/0023/0027/0032/0034）+ 06/07 文档 + Crossref 核验（2026-08-12：DiverseVul=RAID'23、CVEfixes=MSR'21、ReposVul=ICSE'24、SecVulEval=2026，DOI 均已确认）。精确规模数字以各论文原文为准。*
