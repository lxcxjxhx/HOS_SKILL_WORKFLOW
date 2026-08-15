# HOS-LS-Optimizer Skill

HOS-LS 扫描优化流程技能：测量驱动的优化循环（基线 → 根因 → 单变量修复 → A/B 门控 → 台账 → 论文）。

## 目录

```
SKILL.md                 核心流程 + 铁律 + 命令速查
config/config.yaml       评测/门控/论文配置
agents/                  六步流水线 agent 提示
references/              口径协议 / token 记账 / 方法目录 / 既有修复 / 命令手册
workflows/               per-fix 与 weekly 编排
database/                优化台账（JSON）
```

## 快速开始

```bash
cd HOS-LS-paper/bench-runs
python hosls-eval/opt_eval.py smoke hos-ls-opt.yaml ..\hosls-eval\vuln\00c73b6e__networking.py
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml vuln 10 3
```

## 关联

- 方法调研：`HOS-LS-paper/12-方法调研-CCF与arXiv.md`
- 评测数据：`HOS-LS-paper/10-RepoPairBench评测数据-HOS-LS.md`
- 论文初稿：`HOS-LS论文初稿/11-论文初稿-标准版.md`
