# HOS-XRG-Loop++

> **Status**: V2 — Self-Stabilizing Engineering System  
> **Full Name**: HOS XRG Loop++ (Extended Recursive Generation Loop++, Engineering-Stable Edition)  
> **Core Philosophy**: 从「规则驱动」升级为「目标动态调节 + 价值密度控制 + 现实反馈闭环」的自稳定工程系统

---

## 🧠 系统架构

```
                ┌────────────────────┐
                │   Goal Tree Layer   │   L0: Intent Layer
                │  (动态目标树)       │
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │ Execution Engine    │   L1: Execution Layer
                │ (CVS Scoring)       │   (Commit Value Score)
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │ Reality Validator   │   L2: Reality Layer
                │ (Execution Score)   │   (现实反馈闭环)
                └────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │ Git Loop Controller │   迭代控制器
                └────────────────────┘
```

---

## 🔄 核心概念

### L0: Intent Layer（意图层 — 动态目标树）

目标不再是静态写死的，而是随现实反馈自动调整权重的「目标树」：

- `root` — 顶层使命（不变）
- `branches` — 权重可变的目标分支
- 每次迭代后根据 Reality Score 自动调权

### L1: Execution Layer（执行层 — 价值密度控制）

每次 commit 必须通过 **CVS (Commit Value Score)** 评分：

```
CVS = Impact × Clarity × Reversibility ÷ Complexity
```

- **Impact**: 是否改变系统能力？是否修复关键问题？
- **Clarity**: 是否能一句话解释？有无明确输入输出？
- **Reversibility**: 是否容易 rollback？
- **Complexity Penalty**: 是否引入新抽象层？是否增加依赖？

**CVS < threshold → 禁止 commit**

### L2: Reality Layer（现实反馈层 — 核心升级）

每次 commit 后验证三件事：
1. **代码执行结果** — 能否运行？报错是否减少？
2. **使用行为反馈** — 是否被调用？实际可用？
3. **结构健康度** — 复杂度增减？耦合度变化？

**Reality Score 连续下降 → 自动 rollback**

---

## 🚦 完整迭代流程

```
1. Read Goal Tree           → 加载当前目标权重
2. Analyze Git State        → 分析仓库状态和 drift
3. Generate Candidate Patch → 生成候选改动
4. Compute CVS              → 价值密度评分
5. If CVS < threshold       → 拒绝，重新生成
6. Apply Patch              → 执行变更
7. Run Reality Validator    → 现实验证
8. Update Goal Tree weight  → 目标权重自调整
9. Check Complexity Debt    → 复杂度债务检查
10. Decide Next Iteration   → 继续或进入 CLEAN MODE
```

---

## 🧯 新增安全机制

| 机制 | 说明 |
|------|------|
| **Anti-Drift Preemption** | commit 前预测漂移概率，而非事后检测 |
| **Goal Weight Auto-Adjust** | Reality Score 驱动目标权重动态调整 |
| **Complexity Debt System** | 每次 commit 累计复杂度债务，超阈值强制 CLEAN MODE |
| **Reality Rollback** | Reality Score 连续下降 → 自动回滚 |

---

## 📁 目录结构

```
HOS-XRG-Loop/
├── CLAUDE.md                    # 本文件 — Skill 定义
├── xrg_loop++.sh                # 主入口脚本
├── config/
│   ├── goal_tree.yaml           # 初始目标树定义
│   └── settings.yaml            # 系统配置（阈值、权重等）
├── lib/
│   ├── intent_layer.sh          # L0: 目标树管理
│   ├── execution_layer.sh       # L1: CVS 评分引擎
│   ├── reality_layer.sh         # L2: 现实验证器
│   ├── anti_drift_preempt.sh    # 漂移预防引擎
│   ├── complexity_debt.sh       # 复杂度债务追踪
│   └── loop_controller.sh       # Git 迭代控制器
└── state/
    ├── goal_weights.json        # 当前目标权重的实时状态
    ├── complexity_debt.json     # 复杂度债务状态
    ├── reality_history.json     # Reality Score 历史记录
    └── cvs_history.json         # CVS 评分历史
```

---

## 🧭 使用方式

```bash
# 启动完整循环
./xrg_loop++.sh

# 单步执行
./xrg_loop++.sh --step

# 强制进入 CLEAN MODE
./xrg_loop++.sh --clean

# 查看当前状态
./xrg_loop++.sh --status

# 查看 CVS 历史
./xrg_loop++.sh --cvs-history

# 手动 rollback 到指定 commit
./xrg_loop++.sh --rollback <commit-hash>
```
