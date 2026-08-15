# 方法调研报告（arXiv + CCF）

本报告围绕四个轴调研 2025–2026 年 arXiv 与 CCF 顶会中改进 LLM 漏洞扫描的最佳方法：(1) 上下文工程——CPG 图引导与跨过程/跨文件上下文注入；(2) 确定性/动态验证——PoC 生成、exploit 验证与动态执行确认；(3) 误报削减——LLM agent 对静态告警的过滤与证据校准；(4) token/成本效率——多 agent 分工、推理/探索解耦与分层路由。共核实候选论文 17 篇（全部检索确认存在，无一需标记 unverified），另补检索新增 8 篇（标题级核实）。结论：**adopt 10 / consider 12 / reject 3**。对 HOS-LS 四阶段管线（静态规则 → Top-K 候选 → 7-agent 分析 → 确定性 exploit 验证）最直接的借鉴是：RECEIPT/AnyPoC 落到第 4 阶段验证器，VulAgent/VulnAgent-R2/Sifting the Noise 落到第 3 阶段 agent 与 FP 过滤，DREA/OpenAnt 提供 token 与对抗验证机制。

> 数值说明：多数预印本仅核实到标题/机制级，检索未命中摘要中的具体指标值；凡未核实处一律标注「未核实」，不臆造数字。

## 一、方法卡片

### 轴 1：上下文工程（CPG / 跨过程注入）

**LLMxCPG**（arXiv 2507.16585，未分级）
- claim：CPG 引导 LLM 做上下文感知漏洞检测。
- mechanism：从源码构建 CPG，抽取调用/数据流/函数级上下文结构化注入 prompt；以图线索聚焦可疑节点，降低无关代码干扰。
- numbers：未核实具体数值（有 arXiv HTML 全文可查）。
- HOS-LS fit：阶段 2/3——为 Top-K 候选与 7-agent 输入提供 CPG 上下文。
- expected gain：high——直接对治上下文缺失这一主因。
- token impact：中性——图裁剪有压缩潜力，注入本身有固定开销。
- verdict：**adopt**——机制明确、与阶段 2/3 直接对应。

**Beyond Function-Level Analysis: Context-Aware Reasoning for Inter-Procedural Vulnerability Detection**（arXiv 2602.06751，未分级）
- claim：跨过程上下文推理突破函数级检测局限。
- mechanism：面向过程（interprocedural）的上下文注入 + 多跳推理（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 2——候选筛选的跨文件上下文。
- expected gain：medium。
- token impact：中性。
- verdict：**consider**——机制合理但仅标题级核实。

**AutoTrace: From Patches to Triggers via Agentic Interprocedural Exploration**（arXiv 2607.12058，未分级）
- claim：由补丁反推触发条件，做 agentic 跨过程探索。
- mechanism：从 patch 出发沿调用链探索到触发点，构造可执行复现（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 2/4——触发条件构造辅助确定性验证。
- expected gain：medium。
- token impact：中性。
- verdict：**consider**。

**Bridging Code Property Graphs and Language Models for Program Analysis**（arXiv 2603.24837，未分级）
- claim：CPG 与 LLM 结合的桥接研究。
- mechanism：综述性，无自有检测机制（标题级核实）。
- numbers：无。
- HOS-LS fit：背景参考。
- expected gain：low。
- token impact：不适用。
- verdict：**reject**——综述性论文，无自有可复现机制。

### 轴 2：确定性/动态验证（PoC、exploit、sanitizer）

**RECEIPT**（arXiv 2607.18575，未分级）
- claim：白盒 agentic XSS 发现的确定性、防 reward-hacking 验证。
- mechanism：独立确定性验证器判定 XSS 可达/可触发，拒绝"LLM 自证式"结论；验证器与模型输出解耦以抗 reward hacking（标题级核实，v1 HTML 可查）。
- numbers：未核实。
- HOS-LS fit：阶段 4——确定性 exploit 验证，与本管线第 4 阶段同名同义。
- expected gain：high——直接给出第 4 阶段设计范式。
- token impact：节省——验证走执行路径，不耗 LLM token。
- verdict：**adopt**。

**AnyPoC**（arXiv 2604.11950，未分级；UIUC Lingming Zhang 组）
- claim：通用 PoC 测试生成，把 LLM bug 检测变成可执行验证。
- mechanism：为 LLM 检出的 bug 自动生成可运行 PoC 测试，以执行结果（崩溃/断言/通过）做确定性确认（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 4——PoC 测试生成模块。
- expected gain：high——把"模型判断"换成"执行判断"。
- token impact：节省——验证期零 LLM 调用。
- verdict：**adopt**。

**PoC-Adapt**（arXiv 2604.06618，未分级）
- claim：语义感知 + RL 自适应策略的 PoC 复现。
- mechanism：多 agent 复现 + RL 学习何时切换策略/工具/重试（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 4——验证失败的智能重试调度。
- expected gain：medium。
- token impact：中性——自适应可减少无效尝试，RL 训练本身有成本。
- verdict：**consider**。

**OpenAnt**（arXiv 2606.19149，未分级）
- claim：代码分解 + 对抗验证 + 动态测试的 LLM 漏洞发现框架。
- mechanism：仓库分解为可管理单元；发现 agent 报漏洞，对抗 agent 试图证伪；动态测试（运行 PoC）做最终确认（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 2–4 全覆盖——分解→候选→对抗验证→动态确认。
- expected gain：high——与 HOS-LS 管线形态最接近的端到端参考。
- token impact：中性——多 agent 调用增加，但分解降低单次上下文。
- verdict：**adopt**。

**Veritas**（arXiv 2605.15097，未分级）
- claim：二进制内存破坏漏洞检测的语义接地 agentic 框架。
- mechanism：在 stripped 二进制上以反编译/符号/执行轨迹约束 agent 推理（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 3 特化——二进制方向，与源码管线不同。
- expected gain：low（对本管线）。
- token impact：中性。
- verdict：**consider**——机制扎实但方向偏离源码扫描。

**VIPER-MCP**（arXiv 2605.21392，未分级）
- claim：MCP 服务器 taint 漏洞的检测与利用。
- mechanism：检测 taint 型漏洞并生成 exploit PoC（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 4 特化——MCP 生态。
- expected gain：low。
- token impact：中性。
- verdict：**consider**——场景特化，作为 PoC 生成样例参考。

**FuzzingBrain V2**（arXiv 2605.21779，未分级）
- claim：多 agent LLM 自动漏洞发现与复现。
- mechanism：多个 LLM agent 协作编排 fuzzing 流程（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 4 外延——fuzzing 与确定性验证互补但机制不同。
- expected gain：low。
- token impact：成本增加——fuzzing 编排调用量大。
- verdict：**reject**——数值不可核实且方向与 HOS-LS 确定性验证不匹配。

### 轴 3：误报削减

**VulAgent**（arXiv 2509.11523；ACL Findings 2026，aclanthology.org/2026.findings-acl.928，已核实）
- claim：假设-验证驱动的多 agent 漏洞检测。
- mechanism：Discoverer 产出漏洞假设（位置+类型+证据），Validator 独立验证并打分，迭代收敛（标题/摘要级核实）。
- numbers：未核实具体数值（Semantic Scholar 有 Table 4 含 P-C↑ 等指标，数值未从检索获得）。
- HOS-LS fit：阶段 3——与 7-agent 分析架构最接近的模板。
- expected gain：high——假设/验证解耦直接压低 FP。
- token impact：中性——双 agent 轮询有额外调用。
- verdict：**adopt**。

**VulnAgent-R2**（arXiv 2603.13384，未分级）
- claim：证据校准的多 agent 仓库级漏洞审计。
- mechanism：每个发现附带证据链（跨文件数据流、构建选项、运行时守卫），以证据强度校准置信度（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 3/4——证据链构造 + 置信度校准。
- expected gain：high——直接对治"无证据即高置信"的 FP 来源。
- token impact：中性。
- verdict：**adopt**。

**Sifting the Noise**（arXiv 2601.22952；ISSTA 2026 研究论文 #9，conf.researchr.org 已核实）
- claim：LLM agent 做漏洞误报过滤的比较研究。
- mechanism：对比多种 agent 配置对静态分析误报的过滤能力；以「agent 验证后剩余 FPR」为指标（Table 4 存在性已核实）。
- numbers：指标定义已核实（剩余 FPR，Table 4）；具体数值未从检索获得。
- HOS-LS fit：阶段 3/4——FP 过滤配置与评估指标依据。
- expected gain：high——提供 FP 过滤的实测对比与 FPR 口径。
- token impact：中性。
- verdict：**adopt**。

**ZeroFalse**（arXiv 2510.02534，未分级）
- claim：LLM 提升静态分析精度、压制误报。
- mechanism：用 LLM 判别静态分析告警真伪，迭代提升 precision（ar5iv HTML 可查）。
- numbers：未核实。
- HOS-LS fit：阶段 1/3——静态规则告警的 FP 过滤前置。
- expected gain：high——阶段 1 产物质量直接决定下游成本。
- token impact：中性。
- verdict：**adopt**。

**AEGIS**（arXiv 2603.20637，未分级）
- claim：图引导 + 辩证 + 元审计的深度漏洞推理。
- mechanism：图线索引导推理，多方辩证（正/反论证），元审计层复核结论（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 3——辩证/元审计 agent（对应 7-agent 中的反驳者与复核者）。
- expected gain：medium。
- token impact：成本增加——辩证+元审计多层调用。
- verdict：**adopt**——审计机制与 7-agent 角色直接吻合。

**AgenticSCR**（arXiv 2601.19138，未分级；Chakkrit Tantithamthavorn 组）
- claim：自主 agentic 安全代码审查，检测"未成熟"漏洞。
- mechanism：审查 agent 迭代探索代码库、收集证据判断漏洞成熟度（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 3——审查 agent 的 prompt/流程模板。
- expected gain：medium。
- token impact：中性。
- verdict：**consider**。

**AutoReview**（FSE 2025 Student Research Competition #5，ACM 10.1145/3696630.3728618，CCF-A 会但为 SRC 轨）
- claim：面向安全 issue 的多 agent 代码审查。
- mechanism：多 agent 分工（定位/分析/报告）审查安全 issue（标题级核实）。
- numbers：未核实；SRC 短文，规模小。
- HOS-LS fit：阶段 3——审查 agent 参考。
- expected gain：low。
- token impact：中性。
- verdict：**reject**——SRC 短文，无代码/无可复核数据，指标口径与规模不明。

**Interpretable Vulnerability Detection Reports**（ASE 2025，IEEE 10.1109/ASE63991.2025.00168，CCF-A）
- claim：生成可解释的漏洞检测报告。
- mechanism：检测后输出结构化可解释报告（定位+推理+证据），提升人工核验效率（标题级核实）。
- numbers：未核实。
- HOS-LS fit：输出/报告阶段——报告 agent 与人工复核界面。
- expected gain：medium——FP 判定与人工闭环依赖报告质量。
- token impact：中性。
- verdict：**consider**。

**SastBench**（arXiv 2601.02941，未分级）
- claim：agentic SAST 告警分流（triage）基准。
- mechanism：标准化评测 agent 对 SAST 告警的分流（标题级核实）。
- numbers：未核实。
- HOS-LS fit：评估——阶段 3 FP 过滤能力的评测集。
- expected gain：medium（评估价值）。
- token impact：不适用。
- verdict：**consider**。

### 轴 4：token/成本效率

**DREA**（arXiv 2607.13439；Internetware 2026 研究论文 #42，conf.researchr.org 已核实；作者有 GitHub huhusmang/DREA）
- claim：解耦推理与探索 agent 做仓库级漏洞检测。
- mechanism：推理 agent 专注假设，探索 agent 负责检索/遍历代码，职责分离以控制上下文膨胀（标题级核实）。
- numbers：未核实（代码库存在，可复现性较好）。
- HOS-LS fit：阶段 3——7-agent 的探索/推理职责划分。
- expected gain：high（token 轴）。
- token impact：节省——解耦避免每轮全量上下文。
- verdict：**adopt**。

**Strategic Heterogeneous Multi-Agent Architecture for Cost-Effective Code Vulnerability Detection**（arXiv 2604.21282，未分级）
- claim：异构多 agent 分工实现成本可控的漏洞检测。
- mechanism：不同能力/成本 agent 承担不同子任务，按难度路由（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 3——7-agent 的路由/分工配置。
- expected gain：medium。
- token impact：节省——低成本 agent 处理简单子任务。
- verdict：**consider**——机制方向正确，缺实测数字支撑。

**Revelio**（arXiv 2606.22263，未分级）
- claim：仓库规模内存安全检测的成本高效 agent。
- mechanism：分层筛选 + 定向 agent 深挖，控制 token（标题级核实）。
- numbers：未核实。
- HOS-LS fit：阶段 2/3——候选分层与成本控制。
- expected gain：medium。
- token impact：节省。
- verdict：**consider**。

**TitanCA**（arXiv 2604.17860，未分级）
- claim：编排 LLM agent 发现 100+ CVE 的经验报告。
- mechanism：大规模 agent 编排 + 真实 CVE 挖掘的经验与教训（标题级核实）。
- numbers：**100+ CVE**（标题级已核实）；成本/精度细分未核实。
- HOS-LS fit：阶段 3/4——真实世界的配置经验。
- expected gain：medium。
- token impact：中性。
- verdict：**consider**。

**VulnGym**（arXiv 2608.02001，未分级；Tencent/VulnGym GitHub 存在，已核实）
- claim：仓库级编码 agent 漏洞检测基准。
- mechanism：真实世界项目级白盒漏洞狩猎基准，含业务逻辑盲点分析。
- numbers：基准规模未核实（GitHub 可查）。
- HOS-LS fit：评估——选型与回归评测。
- expected gain：medium（评估价值）。
- token impact：不适用。
- verdict：**consider**——基准工具而非方法。

## 二、采纳矩阵

| 论文 | 判定 | 一句话理由 |
|---|---|---|
| LLMxCPG | adopt | CPG 上下文注入直接对治阶段 2/3 上下文缺失 |
| OpenAnt | adopt | 分解+对抗验证+动态测试，端到端形态最接近 HOS-LS |
| RECEIPT | adopt | 确定性验证器即阶段 4 的设计范式 |
| AnyPoC | adopt | PoC 测试生成把模型判断换成执行判断 |
| VulAgent | adopt | 假设-验证架构是 7-agent 阶段的模板（ACL Findings 2026） |
| VulnAgent-R2 | adopt | 证据校准置信度，直接削减无证据 FP |
| AEGIS | adopt | 辩证+元审计映射 7-agent 反驳/复核角色 |
| DREA | adopt | 推理/探索解耦，token 效率最直接（Internetware 2026） |
| Sifting the Noise | adopt | ISSTA 2026 实测 FP 过滤配置与 FPR 口径 |
| ZeroFalse | adopt | 阶段 1 静态告警 LLM 过滤前置 |
| PoC-Adapt | consider | RL 自适应重试有价值但数值未核实 |
| Strategic Heterogeneous | consider | 异构路由方向对，缺实测数字 |
| AgenticSCR | consider | 审查 agent 流程可参考 |
| Veritas | consider | 二进制方向，偏离源码管线 |
| VulnGym | consider | 评测基准，非方法 |
| Interpretable Reports | consider | 报告可解释性改善人工闭环 |
| Beyond Function-Level | consider | 跨过程注入机制合理，仅标题级核实 |
| SastBench | consider | 阶段 3 评测集参考 |
| Revelio | consider | 分层成本控制方向对 |
| TitanCA | consider | 100+ CVE 实测经验，细分数字缺 |
| VIPER-MCP | consider | PoC 生成特化样例 |
| AutoTrace | consider | patch→trigger 触发条件构造 |
| AutoReview | reject | FSE SRC 短文，无可复核证据 |
| FuzzingBrain V2 | reject | 数值不可核实，fuzzing 方向与阶段 4 不匹配 |
| Bridging CPG+LLM | reject | 综述性，无自有机制 |

## 三、排除清单

**Rejected（3）**
- AutoReview（FSE 2025 SRC）：SRC 短文，无代码/无公开数据，指标规模与口径不可复核。
- FuzzingBrain V2（arXiv 2605.21779）：具体数值未核实到；机制为多 agent fuzzing 编排，与 HOS-LS 确定性验证（阶段 4）方向不匹配。
- Bridging CPG and LLMs（arXiv 2603.24837）：综述/桥接论文，无自有可复现检测机制。

**Unverified（0）**：17 篇候选论文全部经 web_search 检索核实存在（arXiv 页面或会议程序页），无一需标记 unverified。注意：多数论文的**具体指标数值**未能在检索摘要中核实，已在卡片中标注，未据此臆造数字。

## 四、CCF 分级标注

| Venue | CCF 级别 | 本报告涉及论文 |
|---|---|---|
| ESEC/FSE | A | AutoReview（SRC 轨） |
| ASE | A | Interpretable Vulnerability Detection Reports |
| ISSTA | A | Sifting the Noise |
| ACL（Findings 轨） | A（ACL 系；Findings 轨评级因校而异） | VulAgent |
| Internetware | C（2023 新晋 C 类，已核实） | DREA |
| arXiv 预印本 | 未分级 | 其余 21 篇 |

## 五、对 HOS-LS 的落地建议

**P0（先做，机制直接可抄）**
1. 阶段 4 验证器：按 RECEIPT（确定性验证、防 reward-hacking）+ AnyPoC（自动 PoC 测试）重写现有"exploit 验证"——验证必须走执行路径，禁止 LLM 自评结论入库。
2. 阶段 3 agent 架构：按 VulAgent（假设-验证）+ VulnAgent-R2（证据链+置信度校准）改造 7-agent——每个发现必须附带证据链，置信度由证据强度而非模型语气决定。
3. FP 过滤：按 Sifting the Noise 的「agent 验证后剩余 FPR」口径建立阶段 3/4 的 FP 度量，按 ZeroFalse 在阶段 1 加 LLM 静态告警预过滤。

**P1（机制借鉴，改动中等）**
4. 阶段 2 上下文：按 LLMxCPG/OpenAnt 增加 CPG 结构化的候选上下文注入（替换纯文件拼接）。
5. 阶段 3 token：按 DREA 将探索（检索/遍历）与推理（假设）agent 解耦；按 OpenAnt 加入对抗反驳角色（对应 7-agent 中的反驳者）。
6. 阶段 3 审计：按 AEGIS 增加元审计层，复核 7-agent 结论。

**P2（可选增强）**
7. 阶段 4 重试：PoC-Adapt 的 RL 自适应策略（若验证失败率高的场景实测有效再上）。
8. 阶段 3 路由：Strategic Heterogeneous 的按难度路由（低成本模型处理简单候选）。
9. 阶段 3 prompt：AgenticSCR 的成熟度判定 prompt；TitanCA 的 CVE 级编排经验。

**P3（外围/报告）**
10. 报告 agent：Interpretable Reports 的结构化报告格式，输出到人工复核界面。
11. 特化场景：Veritas（二进制）、VIPER-MCP（MCP 生态）作为 PoC 生成参考，非主线。

**P4（评估基建）**
12. 将 VulnGym、SastBench 纳入回归评测（CI 基准），以 Sifting the Noise 的 FPR 口径作为核心指标之一；用 Revelio 的成本分层作 token 预算参考。

> 文件位置：本报告落于 `HOS-LS-paper/12-方法调研-CCF与arXiv.md`（即本文档），供论文正文引用。
