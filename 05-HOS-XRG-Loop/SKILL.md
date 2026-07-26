---
name: HOS-XRG-Loop
version: "2.0.0"
description: "Self-Stabilizing Engineering System — Extended Recursive Generation Loop with dynamic goal adjustment, value density control, and reality feedback loop"
author: HOS Team
tags:
  - engineering-loop
  - goal-management
  - value-density
  - self-stabilization
  - git-workflow
compatibility:
  - claude-code
  - cursor
  - windsurf
  - github-copilot
  - trae-cn
license: MIT
metadata:
  category: engineering-workflow
  subCategory: development-loop
  risk-level: low
  confidence: 0.90
---

# HOS-XRG-Loop++ — Skill Entry (v2.0)

> **Self-Stabilizing Engineering System** — Extended Recursive Generation Loop++ (Engineering-Stable Edition)
> Core Philosophy: Upgrade from rule-driven to **goal dynamic adjustment + value density control + reality feedback loop** self-stabilizing engineering system.

---

## 1. System Architecture

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

## 2. Core Concepts

### L0: Intent Layer (动态目标树)

Goals are no longer static — they are a **Goal Tree** with weights that auto-adjust based on reality feedback:

- `root` — Top-level mission (immutable)
- `branches` — Goal branches with adjustable weights
- Weights auto-tune after each iteration based on Reality Score

### L1: Execution Layer (价值密度控制)

Every commit must pass **CVS (Commit Value Score)** evaluation:

```
CVS = Impact × Clarity × Reversibility ÷ Complexity
```

- **Impact**: Does it change system capability? Does it fix critical issues?
- **Clarity**: Can it be explained in one sentence? Clear input/output?
- **Reversibility**: Easy to rollback?
- **Complexity Penalty**: Introduces new abstraction layers? Increases dependencies?

**CVS < threshold → commit rejected**

### L2: Reality Layer (现实反馈层 — Core Upgrade)

After each commit, validate three things:
1. **Code execution results** — Does it run? Are errors decreasing?
2. **Usage behavior feedback** — Is it being called? Actually usable?
3. **Structural health** — Complexity increasing or decreasing? Coupling changes?

**Reality Score continuously declining → automatic rollback**

---

## 3. Full Iteration Flow

```
1. Read Goal Tree           → Load current goal weights
2. Analyze Git State        → Analyze repo state and drift
3. Generate Candidate Patch → Generate candidate changes
4. Compute CVS              → Value density scoring
5. If CVS < threshold       → Reject, regenerate
6. Apply Patch              → Execute changes
7. Run Reality Validator    → Reality validation
8. Update Goal Tree weight  → Goal weight self-adjustment
9. Check Complexity Debt    → Complexity debt check
10. Decide Next Iteration   → Continue or enter CLEAN MODE
```

---

## 4. Safety Mechanisms

| Mechanism | Description |
|-----------|-------------|
| **Anti-Drift Preemption** | Predict drift probability before commit, not post-detection |
| **Goal Weight Auto-Adjust** | Reality Score drives dynamic goal weight adjustment |
| **Complexity Debt System** | Each commit accumulates complexity debt; force CLEAN MODE when threshold exceeded |
| **Reality Rollback** | Reality Score continuously declining → automatic rollback |

---

## 5. Directory Structure

```
HOS-XRG-Loop/
├── CLAUDE.md                    # Skill definition
├── SKILL.md                     # This file — standardized skill entry
├── README.md                    # Project overview
├── xrg_loop++.sh                # Main entry script
├── config/
│   ├── goal_tree.yaml           # Initial goal tree definition
│   └── settings.yaml            # System config (thresholds, weights, etc.)
├── lib/
│   ├── intent_layer.sh          # L0: Goal tree management
│   ├── execution_layer.sh       # L1: CVS scoring
│   ├── reality_layer.sh         # L2: Reality validator
│   ├── anti_drift_preempt.sh    # Drift prevention engine
│   ├── complexity_debt.sh       # Complexity debt tracking
│   └── loop_controller.sh       # Git iteration controller
└── state/
    ├── goal_weights.json        # Current goal weights (real-time state)
    ├── complexity_debt.json     # Complexity debt state
    ├── reality_history.json     # Reality Score history
    └── cvs_history.json         # CVS scoring history
```

---

## 6. Usage

```bash
# Start full loop
./xrg_loop++.sh

# Single step execution
./xrg_loop++.sh --step

# Force enter CLEAN MODE
./xrg_loop++.sh --clean

# View current status
./xrg_loop++.sh --status

# View CVS history
./xrg_loop++.sh --cvs-history

# Manual rollback to specific commit
./xrg_loop++.sh --rollback <commit-hash>
```
