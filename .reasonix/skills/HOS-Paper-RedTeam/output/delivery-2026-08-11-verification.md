# HOS 论文真实性核验报告（2026-08-11 复核）

> 针对「2026 最新顶配」8 篇评审对象的**最新性 + 真实存在性**逐篇复核。
> 核验方式：arXiv API 元数据（`export.arxiv.org`）+ GitHub API（`api.github.com`）+ doi.org handle API。

## 一、arXiv 存在性核验（8/8 ✅ 全部真实存在，均为 v1 最新版）

| arXiv ID | 标题 | 提交日期 | 最新版本 | 作者（arXiv 官方） | 与评审一致 |
|----------|------|----------|----------|-------------------|-----------|
| 2608.03134 | CLEAR: Causal Context-Based Agentic Reasoning… | 2026-08-04 | v1 | Sungju Yun, Sijune Hwang, Yeonjoon Lee, Kyungtae Kang, Sungbin Park | ✅ |
| 2607.26656 | Graph Is the Verifier: Agentic RL…（VulAgentRL） | 2026-07-29 | v1 | Yikun Li 等 12 人（含 David Lo） | ✅ |
| 2607.24964 | ALIBI: Adaptive Agentic Attacks… | 2026-07-27 | v1 | Zixuan Wu, Cristina Nita-Rotaru | ✅ |
| 2607.13439 | DREA: Decoupled Reasoning and Exploration Agents… | 2026-07-15 | v1 | Mingyang Sun, Guozhu Meng（Internetware 2026 comment） | ✅ |
| 2607.12058 | AutoTrace: From Patches to Triggers… | 2026-07-13 | v1 | **Arastoo Zibaeirad, Marco Vieira, Thomas Zimmermann** | ⚠️ 见修正记录 |
| 2605.21779 | FuzzingBrain V2: A Multi-Agent LLM System… | 2026-05-20 | v1 | Ze Sheng, Zhicheng Chen, Qingxiao Xu, Kewen Zhu, Jeff Huang | ✅ |
| 2606.22263 | Revelio: Cost-Efficient Agentic Memory Safety… | 2026-06-20 | v1 | Yiwei Hou 等 9 人（含 Koushik Sen, Dawn Song, David Wagner） | ✅ |
| 2603.20637 | AEGIS: From Clues to Verdicts… | 2026-03-21 | v1 | Sen Fang, Weiyuan Ding, Zhezhen Cao, Zhou Yang, Bowen Xu | ✅ |

**结论：8 篇论文全部真实存在于 arXiv，且评审时均为最新版本（v1，无更新版本遗漏）。**

## 二、GitHub 仓库核验（6/6 ✅ 真实存在）

| 论文 | 仓库 | 核验结果 |
|------|------|----------|
| AutoTrace | `Erroristotle/AutoTrace` | ✅ 存在：3 stars、0 forks、language C、created 2026-04-25、**pushed 2026-07-13（与论文同日）**、1 open issue |
| AEGIS | `secureai4code/Aegis` | ✅ 存在：3 stars、MIT、created 2025-10-02、**pushed 2026-03-21（与论文同日）** |
| DREA | `huhusmang/DREA` | ✅ 存在：1 star、created 2026-06-02 |
| Revelio | `m1-llie/Revelio` | ✅ 存在：8 stars、**homepage 直指 arXiv PDF 2606.22263**、description「AI Agent for cost-efficient and trustworthy memory-safety vulnerability detection」与论文完全吻合、pushed 2026-07-20 |
| FuzzingBrain V2 | `o2lab/FuzzingBrain-V2` + `fuzzingbrain/FuzzingBrain-Bench` | ✅ 都存在：V2 仓库 8 stars；Bench 仓库 4 stars、3 forks、23 open issues、**2026-08-10 仍在活跃**（desc：68 real zero-day bugs across 40 projects） |
| VulAgentRL | GitHub 搜索 `VulAgentRL` | ❌ **确认无公开仓库**（total_count=0）——维持 RVE-0018「声称 release 但查不到」 |

## 三、关键声称独立复核

| 声称 | 复核方式 | 结果 |
|------|----------|------|
| CLEAR 数据仓库 figshare DOI `10.6084/m9.figshare.33016343` | doi.org handle API | ❌ **404（responseCode 100）确认不存在** → RVE-0012 成立，CLEAR 复现链路断裂实锤 |
| FuzzingBrain 2 个 CVE（CVE-2026-23874 / CVE-2026-23952） | MITRE API（上轮子代理核验） | ✅ 真实存在，GHSA-9vj4-wc7r-p844 署名 Team FuzzingBrain @ Texas A&M |
| VulAgentRL 模型名 GPT-5.5 / Claude Opus 4.7/4.8 | 公开记录 | ⚠️ 无法独立核实（证据缺口，未下造假结论） |

## 四、修正记录（本轮发现并修复）

1. **AutoTrace 作者张冠李戴（已修正）**：原评审写「Andrew Stoltman 等」，实为 **Arastoo Zibaeirad / Marco Vieira / Thomas Zimmermann**（Andrew Stoltman 是另一篇 RepBench 2606.25356 论文的作者，属跨论文混淆）。已同步修正 `2607.12058-review.json`、`paper.json`，并重新渲染评分卡。
2. **Revelio 复现证据更新**：上轮子代理报告「GitHub 0 forks 无第三方复现」——本轮确认官方仓库 `m1-llie/Revelio` 真实存在（8 stars），已更新评分卡 evidence（repro 维度依据不变：仍无第三方复现、论文正文细节抓取受限）。
3. **FuzzingBrain 仓库证据更新**：确认 `o2lab/FuzzingBrain-V2`（8 stars）与 `fuzzingbrain/FuzzingBrain-Bench`（2026-08-10 仍活跃）双仓库存在，已更新评分卡 evidence。
4. **CLEAR 复现断裂实锤**：DOI 404 经 doi.org 官方 handle API 独立复核，RVE-0012（HIGH）从「子代理报告」升级为「主链路复核确认」。

## 五、遗留证据缺口（如实标注，未编造）

- VulAgentRL 的 GPT-5.5 / Claude Opus 4.7/4.8 模型名无法在公开记录独立核实；
- Revelio 的 19 零日逐条证据、AEGIS 论文 §3/§4 正文、CLEAR 完整结果表：因抓取服务对超长文档中段截断，未能直接核验（评审中已标注「证据缺口」）；
- FuzzingBrain 39/41 个零日无 CVE/issue 编号可独立核验。

## 六、结论

- **8 篇论文 100% 真实存在、全部为 arXiv 最新版本（v1）**，无虚构论文、无过期版本。
- 6/8 篇有真实公开仓库（AutoTrace/AEGIS/DREA/Revelio/FuzzingBrain×2），2 篇无（CLEAR 的 DOI 断裂、VulAgentRL 声称 release 但查不到）——这两篇的「复现问题」RVE 均经本轮复核成立。
- 唯一实质性错误（AutoTrace 作者）已修正，评分与 RVE 结论不受影响。
