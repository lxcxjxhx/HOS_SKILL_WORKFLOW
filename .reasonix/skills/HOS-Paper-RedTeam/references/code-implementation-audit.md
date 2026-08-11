# 代码实现审查规范（Code Implementation Audit）

> 论文声称「开源可复现」≠ 代码真的实现了论文。本规范定义：拿到仓库后怎么快速判断
> **实现深度**——是「自研工程实现」还是「开源框架 + AI 自调用包装」还是「概念展示/结果档案」。
> 沉淀自 2026-08-12 对 16 篇论文 10 个仓库的逐一审查。

---

## 一、为什么要审代码（动机）

16 篇论文的 10 个仓库审查结论：**论文吹的「玄乎」部分几乎都在代码里找不到，代码里真正有的是「确定性验证闭环」**。

| 论文声称的卖点 | 代码里实际存在 |
|----------------|---------------|
| CodeX-Verify「多 Agent 信息论验证」 | 0 处互信息计算；相关系数 ρ=0.05-0.25 是**硬编码常量**（THEORETICAL_FRAMEWORK.md 标注 "(estimated)"）|
| LLMPFA「94-98% 排除假阳」 | 核心方法 LLM4PFA **零实现代码**（仓库只有 5 个 baseline prompt 脚本 + 脱敏结果 JSON）|
| SAST-Genius「Semgrep + fine-tuned LLM 管线」 | **零可执行代码**（5 个散装文件：2 个 prompt + 10 条微调示例 + repos.csv）|
| AutoTrace「agentic interprocedural 探索 + admissibility gate」 | 仓库是 **artifact 仓库**（评估脚本 + 结果 + LFS 数据），核心 CPG/agent 实现**未开源** |
| Revelio「独立重执行防伪造」 | `verify_crash()` 是**死代码**（零调用），实际崩溃判定信任 LLM payload 布尔值 |
| FuzzingBrain-V2「29 零日 / 90% 检出」 | 仓库无任何 CVE/结果文件——数字只存在于论文文本 |

**结论**：审代码不是为了找茬，而是为了回答「论文的方法到底存不存在、能不能复算」——这是 RVE-REPRO 判断的核心证据。

---

## 二、五步快速审查法（每仓库 ~10 分钟）

### Step 1 定性仓库类型（决定后续动作）

| 类型 | 特征 | 判定 |
|------|------|------|
| **自研工程实现** | 有 src/ 包、依赖清单、测试、CI | 深度评分看 Step 2-5 |
| **artifact 仓库** | README 自称 artifact/evaluation/results，核心代码缺失 | **核心实现未开源** → RVE-REPRO |
| **概念展示** | 散装文件（prompt/示例/README），无入口 | 深度 ≤1 |
| **结果档案** | 只有结果 JSON + baseline 脚本 | 深度 ≤1，但结果可复算 |

### Step 2 技术栈与规模
```bash
# 依赖与语言
ls requirements*.txt pyproject.toml package.json
# 代码行数（排除 vendored/__pycache__）
find . -type f \( -name "*.py" -o -name "*.ts" \) -exec cat {} + | wc -l
```
- 关注：LLM SDK（openai/anthropic/litellm）、Agent 框架（LangChain/AutoGen？还是自研 loop）、开源工具（CodeQL/Semgrep/Joern/CPG/OSS-Fuzz/sanitizer）。

### Step 3 核心实现定位
- 找入口（main.py/CLI）→ 主流程 → agent 定义 → 工具调用。
- 论文声称的「关键机制」在代码里 grep 一下：如互信息、admissibility gate、sanitizer 判定、fuzzer 复现。

### Step 4 LLM 调用方式（回答「AI 自调用」问题）
| 形态 | 特征 |
|------|------|
| API 直调 | `openai.chat.completions` / `litellm.completion` |
| Agent 框架 | LangChain/AutoGen/Claude Code CLI 包装 |
| **自研 agent loop** | 自己实现 tool-calling 循环（最有工程含量）|
| 无 LLM | 纯规则引擎（如 CodeX-Verify——论文是 LLM 主题但验证器 100% 静态规则）|

### Step 5 论文声称 ↔ 代码证据对照
- **可核验**：论文数字能在代码/结果文件复算（如 LLMPFA 的 433 条 label/result 可精确复算出 98.2%）。
- **找不到**：论文核心声称在代码零痕迹（grep 0 结果）→ 记录为「声称无代码证据」，强化 RVE-REPRO。
- **死代码**：函数定义了但零调用（如 Revelio verify_crash）→ 论文声称的实现路径与代码实际路径不符。

---

## 三、深度评分（1-5）

| 分 | 判定 | 特征 |
|----|------|------|
| 5 | 完整工程 | 可运行管线 + 测试 + CI + 结果物齐全 |
| 4 | 扎实实现 | 核心机制真实落地、管线可跑，但结果物/部分声称缺失（AEGIS/Revelio/FuzzingBrain）|
| 3 | 半成品 | 工程骨架真实但卖点理论未实现（CodeX-Verify）|
| 2 | 薄实现 | artifact 仓库/核心未开源（AutoTrace）|
| 1 | 概念展示/档案 | 零代码或仅结果（SAST-Genius/LLMPFA）|

**评分与论文评分独立**：代码实现深度高（4/5）≠ 论文可信（AEGIS 66 分论文里有 FPR 口径问题）；代码浅（1/5）≠ 论文数字一定错（LLMPFA 结果可复算）。

---

## 四、数据模型（review.json 的 codeAudit 字段）

```json
{
  "codeAudit": {
    "present": true,
    "repoType": "自研工程实现 | artifact仓库 | 概念展示 | 结果档案",
    "language": "Python 3.10+",
    "loc": 15000,
    "llmIntegration": "litellm 直调 + 自研 agent loop",
    "frameworks": ["Clang sanitizer", "OSS-Fuzz", "tree-sitter"],
    "coreImplementations": ["确定性 sanitizer 崩溃判定", "Docker 隔离执行"],
    "verified": ["sanitizer 判定为纯代码非 LLM", "成本逐调用核算"],
    "missing": ["独立重执行（verify_crash 死代码）", "19 漏洞结果物"],
    "depthScore": 4,
    "verdict": "一句话结论"
  }
}
```

渲染：`src/report.ts` 检测 `codeAudit` 字段后输出「💻 代码实现审查」区块（深度评分条 + 可核验/缺失对照表）。

---

## 五、审查输出模板（汇总表用）

| 列 | 内容 |
|----|------|
| 仓库类型 | 自研实现 / artifact / 概念展示 / 结果档案 |
| 技术栈 | Python + litellm + OSS-Fuzz 等 |
| 规模 | 116 文件 / 4.8 万行 |
| LLM 集成 | API 直调 / 自研 agent loop / 无 LLM |
| 深度评分 | 1-5 |
| 一句话结论 | 「论文吹的 X 代码里没有；真正有的是 Y」 |
