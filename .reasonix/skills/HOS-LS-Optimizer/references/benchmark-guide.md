# 评测命令手册（benchmark-guide）

> 前置：Python 3.10+，hos-ls 克隆依赖已装；API key 在 `hos-ls.yaml`。
> cwd 一律 `HOS-LS-paper/bench-runs/`。

## 0. 目录速查

| 路径 | 内容 |
|------|------|
| `hos-ls/` | HOS-LS 克隆（改动与 PR 在这里） |
| `hos-ls/hos-ls.yaml` | 基线评测配置 |
| `hos-ls/hos-ls-opt.yaml` | 优化评测配置（门可消融） |
| `hosls-eval/opt_eval.py` | 统一评测入口 |
| `hosls-eval/vuln|patched/` | 100 pairs 函数级样本 |
| `hosls-eval/reports/` | 全部评测产物 JSON |
| `drea/data/repopairbench_100.jsonl` | 数据集 + manifest（commit_url） |
| `repo-eval/` | 仓库级评测（octoprint/kiwi/calibre-web 已 clone） |

## 1. 冒烟

```bash
python hosls-eval/opt_eval.py smoke hos-ls-opt.yaml ..\hosls-eval\vuln\00c73b6e__networking.py
```

## 2. 子集 A/B（迭代）

```bash
python hosls-eval/opt_eval.py subset hos-ls.yaml vuln 10 3
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml vuln 10 3
python hosls-eval/opt_eval.py subset hos-ls.yaml patched 10 3
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml patched 10 3
```

## 3. 全量终测（约 25-40 分钟/轮，4 并发）

```bash
python hosls-eval/opt_eval.py full hos-ls-opt.yaml vuln 4
python hosls-eval/opt_eval.py full hos-ls-opt.yaml patched 4
```

## 4. 仓库级子集（对齐 DREA 设定）

```bash
# 从 manifest 选 pairs（project_name 匹配 repo-eval/ 已有 clone）
python hosls-eval/repo_scan.py hos-ls-opt.yaml    # 该脚本由优化循环维护
```

## 5. 同 API 对比（10 样本三工具）

```bash
python hosls-eval/compute_compare.py   # 汇总 reports/ 下 cmp10/llm-* 产物
```

## 6. 台账与聚合

```bash
python hosls-eval/opt_eval.py summary <results.json>
python hosls-eval/opt_eval.py ledger <results.json> <tag>
```

## 7. 配置门速查（hos-ls-opt.yaml）

| 门 | 默认 | 说明 |
|----|------|------|
| deterministic_promote_enabled | true | 高危 + Agent-3 CONFIRMED → CONFIRMED |
| cpg_context_enabled | true | 深 CPG 注入（仓库级收益） |
| ast_evidence_enabled | false | M4 AST 证据（有扰动，A/B 后开） |
| cwe_guidance_enabled | false | M7 CWE 指引（+1K token） |
| sast_prefilter.enabled | true | [OPT-SASTR] SAST 深度前置过滤（pure-ai 不再绕过静态过滤） |
| sast_prefilter.skip_ai_if_no_hits | false | false=软门控（默认，保留盲区检出）；true=硬门控（hos-ls-opt-sast.yaml，零命中完全跳过 AI） |
| sast_prefilter.inject_evidence | true | SAST 候选命中注入 Agent-3 证据块 |

后端自动探测：codeql（仓库级底座，装好即用）> semgrep（功能探测，本机 X509 异常会跳过）> builtin（AST+CST，与静态层同源，始终可用）。

## 8. 缓存纪律

- 改 prompt/schema → 对应 llm-cache 键失效，重跑时自动 miss（无需手动清）。
- 改 Agent-0/1 prompt 或文件内容 → 清 `.cache/hos-ls/pure-ai/` 相关键。
- 禁用 NVD db 对照：临时改 `hos-ls-opt.yaml` 的 nvd 配置或环境隔离（历史经验：NVD 非 19% 根因）。
