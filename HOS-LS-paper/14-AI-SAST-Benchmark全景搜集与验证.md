# AI SAST Benchmark 全景搜集与验证报告（经典公认 + 最新最硬）

> **任务**：搜集「最经典、被公认」的 AI SAST benchmark 与「最新、最难」的 benchmark，逐项标注与 HOS-LS 评测的关系与验证状态。
> **日期**：2026-08-16 · **方法**：web_search 逐条核实（arXiv/venue/GitHub/HF）；凡未核实项标注；不与既有 08-经典评测集全景/12-方法调研重复叙述。
> **用途**：HOS-LS 论文评测集选型证据 + 后续 benchmark 验证清单（对应 §4.7 待补实验的「PrimeVul 函数级 + 仓库级协议」「Semgrep/CodeQL 同协议基线」等）。

---

## 一、经典公认 AI SAST benchmark（高引用/领域事实标准）

| # | 基准 | 出处 | 规模 | 语言 | 公认地位 | HOS-LS 验证状态 |
|---|------|------|------|------|----------|----------------|
| 1 | **PrimeVul** | ICSE 2025（[arXiv 2403.18624](https://arxiv.org/abs/2403.18624)）| 6,968 漏洞函数 + 228,800 良性 · 435 pair-wise 测试对 | C/C++ | 函数级事实标准；BigVul 68.26% F1 → 3.09% 的严格去重标杆 | 🟡 脚本可跑（`bench-runs/primevul/`，数据 GDrive 待下载）；§4.7 待补 |
| 2 | **BigVul** | MSR 2020 | 3,754 漏洞函数 / 179k | C/C++ | 深度学习时代最常用之一 | ⚠️ 泄漏 18.9%，HOS-LS 不裸用（仅作对照引用） |
| 3 | **Devign** | NeurIPS 2019（[GitHub](https://github.com/epicosy/devign)）| ~12k 函数（2.6k 漏洞）| C/C++ | GNN 检测代表作 + 数据集事实标准 | 引用锚点；非主评测 |
| 4 | **SARD / Juliet** | NIST SAMATE（[SARD](https://samate.nist.gov/SRD/)）| 数万参考程序（Juliet 约 64K CWE 场景）| C/C++/Java | 美国 NIST 官方软件保障基准；CWE 场景最全 | 未接入；可作 SAST 规则回归集 |
| 5 | **CWE-Bench-Java** | IRIS 团队（[GitHub iris-sast/cwe-bench-java](https://github.com/iris-sast/cwe-bench-java)）| 120 个 Java 漏洞（细粒度标注）| Java | LLM 静态分析评测的细粒度标准（IRIS 论文配套） | 未接入；可作 Java 侧补充 |
| 6 | **DiverseVul** | RAID 2023 | 33k+ 漏洞函数（18 语言）| 多语言 | 规模大、多语言 | 引用级；噪音多不主用 |
| 7 | **CVEfixes** | MSR 2021 | 5.5k+ CVE 修复 commit | 多语言 | 真实 CVE 修复（commit 级）| 引用级 |
| 8 | **SVEN** | 2023 | 安全代码生成受控评测 | Python | 安全代码生成基准 | 引用级（生成方向，非检测）|
| 9 | **FormAI** | 2023（[GitHub FormAI-Dataset](https://github.com/FormAI-Dataset/FormAI-dataset)）| ~300K AI 生成 C 程序（形式验证标注）| C | AI 生成代码安全的大规模基准 | 引用级；与 HOS-LS「AI 代码审查」定位契合 |

> **结论**：函数级经典三件套 = **PrimeVul（主）+ BigVul/Devign（对照引用）**；细粒度 = **CWE-Bench-Java**；官方 = **SARD/Juliet**。HOS-LS 已把 PrimeVul 列为 L1 主战场（对齐 AEGIS），其余作引用/回归集。

---

## 二、最新最硬 benchmark（2025-2026，仓库级/Agent 级）

| # | 基准 | 出处 | 规模 | 语言 | 为什么"最难" | HOS-LS 验证状态 |
|---|------|------|------|------|--------------|----------------|
| 1 | **RepoPairBench** | DREA（[arXiv 2607.13439](https://arxiv.org/abs/2607.13439)）| 100 漏洞-修复 pairs（200 实例）· 48 CWE | Python | 真实 CVE（2021-2025）+ 仓库级 + commit hash；manifest 公开可复跑 | ✅ **已跑通全量**（静态 76% / AI 双口径 35% / 49%）|
| 2 | **VulnGym** | Tencent（[arXiv 2608.02001](https://scirate.com/arxiv/2608.02001) · [GitHub](https://github.com/Tencent/VulnGym)）| **408 entries（实测 entries.jsonl）** | 多语言 | 腾讯规模最大的仓库级漏洞猎捕基准；业务逻辑盲点测试 | 🟢 **数据已验证可下载**（HF `data/entries.jsonl`，2026-08-16 实测）|
| 3 | **HoF-Bench** | AISLE（[arXiv 2607.27030](https://scirate.com/arxiv/2607.27030)）| AI 真实发现 CVE 集 | 多语言 | 验证「非 frontier 模型能否复现 AI 发现的 CVE」——可复现性最硬 | 未接入；评测参照（13-文档 adopt）|
| 4 | **SEC-bench Pro** | [arXiv 2605.26548](https://arxiv.org/abs/2605.26548) | 长程多步安全任务 | 多语言 | 单任务多步（发现→利用→修复）评测 LLM 长程能力 | 未接入；协议参照 |
| 5 | **FuzzingBrain-Bench** | FzB 配套（[2605.21779](https://scirate.com/arxiv/2605.21779)）| 40/63 漏洞 · 真实项目 | C/C++ | answer-free 密封防作弊 | 🔴 需 Docker + API key（09-文档）；场景 fuzzing |
| 6 | **SinkTrace-Bench** | AutoTrace（[2607.12058](https://arxiv.org/abs/2607.12058)）| 1,542 verifier-confirmed 样本 | 多语言 | 触发点定位；严格行命中仅 31.97%（宽松口径虚高教训）| 未接入；定位维度参照 |
| 7 | **ReposVul** | ICSE 2024（[arXiv 2401.13169](https://arxiv.org/abs/2401.13169)）| 仓库级高质量 | Python+Java | 仓库级数据集正式顶会论文 | 引用级 |
| 8 | **SecRepoBench** | [arXiv 2504.21205](https://arxiv.org/abs/2504.21205) · [GitHub ai-sec-lab/SecRepoBench](https://github.com/ai-sec-lab/SecRepoBench) | 真实仓库安全代码补全 | 多语言 | 真实仓库语境的代码 agent 评测 | 引用级 |

> **结论**：最新最硬 = **RepoPairBench（已主用）+ VulnGym（下一步最强验证）+ HoF-Bench（可复现性）+ SEC-bench Pro（长程任务）**。

---

## 三、验证矩阵（HOS-LS 实况 vs 各基准）

| 基准 | 可跑性 | 数据获取 | 建议优先级 | 对应论文 §4.7 |
|------|--------|----------|-----------|---------------|
| RepoPairBench | ✅ 完全跑通 | 本地已有 | P0（主战场）| — |
| PrimeVul | 🟡 脚本通 | GDrive 待下载 | P0（对齐 AEGIS）| ① |
| CWE-Bench-Java | 🟢 可下载 | GitHub/HF | P1（Java 细粒度）| ① 扩展 |
| VulnGym | 🟢 可下载 | HF（v0.1.1 已发布）| P1（仓库级最强）| ② 扩展 |

> **VulnGym 实测验证（2026-08-16）**：HF 数据集 `tencent/VulnGym` `data/entries.jsonl` 已下载解析——**408 条 entry，393 条 verify=1**，全部源自 GitHub Advisory Database (reviewed)；L1 分类以**业务逻辑 278/408（68%）** 为主（其余：代码注入 21、命令注入 14、反序列化 11、XSS 9、SSRF 9、路径穿越 8）。这印证 VulnGym 论文「仓库级业务逻辑盲点」定位——恰是 HOS-LS 语义检测（CWE 语义 + 多 Agent 推理）的目标类型，是下一个最强验证基准（P1）。
| SARD/Juliet | 🟢 公开 | NIST | P2（SAST 回归集）| ② |
| HoF-Bench | 🟡 待评估 | GitHub | P2（可复现性）| ③ 扩展 |
| SEC-bench Pro | 🟡 待评估 | arXiv | P2（长程协议）| ③ 扩展 |
| FuzzingBrain-Bench | 🔴 环境阻 | Docker+key | P3（场景声明）| — |

---

## 四、与「消费预估/余额」能力的衔接（本次新增）

本次新增的 `hos-ls estimate` 与 `hos-ls balance`（以及扫描前自动预估+余额告警）直接服务于上述基准验证：

- **跑大基准前先预估**：`hos-ls estimate bench/VulnGym/xxx` → 得到文件数 × 每文件 token × 单价 ≈ 预估费用（¥），避免账单失控；
- **扫描前自动查余额**：`hos-ls scan <target> --pure-ai` 自动查询 DeepSeek 余额，低于阈值（默认 5 CNY）告警；
- **历史校准**：`estimate` 的每文件 token 均值会随实际扫描记录（TokenTracker）自动校准，越跑越准。

> 基准验证成本示例（deepseek-v4-flash 单价）：RepoPairBench 100 pairs 实测 tokenΣ ≈ 100 万级；PrimeVul 435 pairs 函数级若全跑，预估见 `hos-ls estimate` 输出——先预估后执行。

---

## 五、来源汇总（全部经 web_search 核实存在）

- PrimeVul: [arXiv 2403.18624](https://arxiv.org/abs/2403.18624)（ICSE 2025）
- BigVul: MSR 2020 · Devign: [GitHub](https://github.com/epicosy/devign)（NeurIPS 2019）
- SARD/Juliet: [NIST SAMATE](https://samate.nist.gov/SRD/)
- CWE-Bench-Java: [GitHub iris-sast/cwe-bench-java](https://github.com/iris-sast/cwe-bench-java)（IRIS 配套）
- FormAI: [GitHub FormAI-Dataset](https://github.com/FormAI-Dataset/FormAI-dataset)
- RepoPairBench: [arXiv 2607.13439](https://arxiv.org/abs/2607.13439)（DREA）
- VulnGym: [arXiv 2608.02001](https://scirate.com/arxiv/2608.02001) · [GitHub](https://github.com/Tencent/VulnGym) · [HF 数据集](https://huggingface.co/datasets/tencent/VulnGym)
- HoF-Bench: [arXiv 2607.27030](https://scirate.com/arxiv/2607.27030)（AISLE）
- SEC-bench Pro: [arXiv 2605.26548](https://arxiv.org/abs/2605.26548)
- SecRepoBench: [arXiv 2504.21205](https://arxiv.org/abs/2504.21205) · [GitHub](https://github.com/ai-sec-lab/SecRepoBench)

*文件位置：`HOS-LS-paper/14-AI-SAST-Benchmark全景搜集与验证.md`（本文档），供论文评测集选型与后续验证引用。*
