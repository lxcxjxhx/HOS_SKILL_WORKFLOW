# HOS-LS 架构/方案变更记录

## v1.x → v2.0 架构变更

### 1. 入口收敛

**之前**: 多个独立入口脚本
```
hos-ls/scripts/run_comprehensive_experiment.py
hos-ls/scripts/run_stoploss_experiment.py
hos-ls/scripts/hosls_7agent_eval.py
hosls-eval/svb_cpg_scan.py
hosls-eval/svb_cpg_scan_v2.py
hosls-eval/svb_cpg_scan_v3.py
...
```

**之后**: 单一入口
```
python -m src.cli.main scan <target> --pure-ai
```

### 2. 能力下沉

**之前**: 功能分散在各独立脚本中
- SVB 扫描逻辑在 `hosls-eval/svb_cpg_scan*.py`
- 7-Agent 评估在 `hos-ls/scripts/hosls_7agent_eval.py`
- SAL 定位在 `hosls-eval/ai_patch_eval.py`
- CPG+taint 在 `src/taint/`

**之后**: 全部通过 `src.cli.main` → `SecurityScanner._analyze_files()` 统一调度:
- ConfigScanner (配置扫描)
- CodeVulnScanner (正则 CWE 检测)
- SastPrefilter (CodeQL + CPG+taint)
- PureAIAnalyzer (7-Agent LLM)
- DEP 后处理

### 3. CPG 引擎 v2.0 改进

| 特性 | v1.x | v2.0 |
|---|---|---|
| CWE-416 标记 | 所有 free() | free 后有指针使用路径 |
| CWE-120 严重度 | 全部 critical | 有 sizeof 保护 → medium |
| 源标记 | 参数+调用点 | +malloc/calloc/realloc |
| 交叉函数 | 不支持 | 沿调用图传播（实验） |
| DEP Pair-Correct | 14% | 26% |

### 4. 基线对比数据

| 基线 | 数据状态 |
|---|---|
| Semgrep | dep-ablation 报告: Python 零检出 |
| CodeQL | 通过 SastPrefilter 集成 |
| vuln-static (裸 AI) | 100 任务, 155 发现 |
| patched-static | 100 任务, 161 发现 |
| svb-ai-scans (SAL) | 21 文件, 14 发现 |
| CPG+taint | 15 任务, 896 发现 |
| SAL+DEP 消融 | Pair-Correct 13/50 (26%) |
| VulnGym | 26 文件, 27 发现 |
| A.S.E 120 | ~150 文件, ~130 发现 |

### 设计决策记录

**决策 1**: 为什么只有 `--pure-ai` 一个入口？
- 原因：多入口导致执行路径不确定、测试结果不可复现
- 影响：所有实验必须通过 CLI 调用，结果严格一致

**决策 2**: 为什么 CPG 引擎 v2.0 不改动 `src/taint/analyzer.py`？
- 原因：`TaintAnalyzer` 已经是对 `TaintEngine` 的标准封装
- 所有改进在 `TaintEngine` 内部，`TaintAnalyzer` 自动继承

**决策 3**: 为什么 DEP 改成 Soft-DEP？
- 原因：原策略把 patched 端 WEAK 作为 fail，但 WEAK 发现可能在不同位置
- 影响：Pair-Correct 从 14% 恢复到 26%（与 cur 持平）
- 后续：需要位置敏感的 DEP 来进一步区分
