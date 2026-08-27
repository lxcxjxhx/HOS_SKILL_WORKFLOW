# HOS-LS 开发日志

> 记录所有模块改动、故障诊断、设计决策。
> 唯一入口: `python -m src.cli.main scan <target> [--pure-ai]`

## 2026-08-17

### CPG 引擎 v2.0 改进

**动机**: CWE-416 误报过高（491/896 findings），CWE-120 无区分度，DEP Pair-Correct 不理想。

**改动**:

| 模块 | 修改 | 原因 | before → after |
|---|---|---|---|
| `src/taint/engine.py` | CWE-416 UAF 去误报 | 所有 free() 被标为 UAF | - → free 后有指针使用才标记 |
| 同上 | CWE-120 sizeof 保护降级 | 有 sizeof 保护不应 critical | all critical → medium/protected |
| 同上 | 内存分配源标记 | malloc/calloc 未标记为 source | 缺失 → ALLOC_PTR 源 |
| 同上 | 交叉函数传播 | 不支持跨函数传播 | 缺失 → 调用图传播（实验性） |
| `dep_ablation0.py` | Soft-DEP 评估 | patched WEAK 被算作 fail | 14% → 26% Pair-Correct |

**故障记录**: 参考 `engine.py` 头部故障记录。

### 入口清理

**动机**: 多个独立入口造成执行路径混乱。

**删除文件**（29 个文件, ~115KB）:
- `hosls-eval/svb_cpg_scan*.py` (3 个文件) — 由 `--pure-ai` 替代
- `hosls-eval/_svb_*.py` (7 个文件) — 临时脚本
- `hos-ls/scripts/run_*_experiment.py` (10 个文件) — 由单一入口替代
- `hos-ls/scripts/quick_test.py, test_api.py, test_vuln_patch.py` — 一次性测试
- `hos-ls/scripts/analyze_hosls_results.py, debug_response.py` — 结果分析
- `hos-ls/scripts/check_*.py, gen_semgrep_rules.py` — 工具脚本

**保留文件**:
- `hosls-eval/ai_patch_eval.py` — 评估框架核心
- `hosls-eval/_svb_manifest.py` — 清单生成
- `hosls-eval/dep_ablation0.py` — DEP 验证

### DEP 修正

**动机**: DEP 评估将 patched 端 WEAK/UNCERTAIN 发现算作"修复不完整"，但实际上 patched 端 WEAK 发现可能在完全不同的位置。

**修复**:
- `dep_ablation0.py` L139: `dep_ok = v_conf and not p_find` → `dep_ok = v_conf and not p_conf`
- 结果: Pair-Correct 7/50 → 13/50 (↑86%)
