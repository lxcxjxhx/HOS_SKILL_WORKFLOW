# HOS-XRG-Loop

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Compatibility](https://img.shields.io/badge/compatible-Claude%20Code%20%7C%20Cursor%20%7C%20Windsurf%20%7C%20GitHub%20Copilot%20%7C%20Trae--CN-orange.svg)

> **Self-Stabilizing Engineering System** — Extended Recursive Generation Loop with dynamic goal adjustment, value density control, and reality feedback loop

---

## Description

HOS-XRG-Loop is an advanced engineering workflow system that evolves from traditional rule-driven approaches to a **self-stabilizing system** powered by three core mechanisms:

1. **Dynamic Goal Adjustment** — Goals automatically re-weight based on reality feedback
2. **Value Density Control** — Every commit must pass Commit Value Score (CVS) evaluation
3. **Reality Feedback Loop** — Continuous validation with automatic rollback capability

---

## Features

### 🎯 Dynamic Goal Tree (L0: Intent Layer)

- Goals are not static — they form a **Goal Tree** with adjustable weights
- Top-level mission remains immutable while branches auto-tune
- Reality Score drives weight adjustments after each iteration

### 📊 Commit Value Score (L1: Execution Layer)

Every commit is evaluated using the CVS formula:

```
CVS = Impact × Clarity × Reversibility ÷ Complexity
```

- **Impact**: System capability changes, critical issue fixes
- **Clarity**: One-sentence explainability, clear I/O
- **Reversibility**: Easy rollback capability
- **Complexity Penalty**: New abstractions, dependency increases

**CVS < threshold → commit rejected**

### 🔍 Reality Validation (L2: Reality Layer)

Post-commit validation of three dimensions:

1. **Code Execution** — Does it run? Error reduction?
2. **Usage Behavior** — Is it being called? Actually usable?
3. **Structural Health** — Complexity trends? Coupling changes?

**Reality Score declining → automatic rollback**

### 🛡️ Safety Mechanisms

| Mechanism | Purpose |
|-----------|---------|
| **Anti-Drift Preemption** | Predict drift probability before commit |
| **Goal Weight Auto-Adjust** | Reality-driven dynamic weight adjustment |
| **Complexity Debt System** | Accumulate debt per commit; force CLEAN MODE at threshold |
| **Reality Rollback** | Auto-rollback on declining Reality Score |

---

## Architecture

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

### Iteration Flow

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

## Installation & Usage

### Prerequisites

- Git repository with bash support
- Shell environment (Linux/macOS/WSL)

### Setup

```bash
# Clone or navigate to the skill directory
cd 05-HOS-XRG-Loop

# Make the main script executable
chmod +x xrg_loop++.sh
```

### Commands

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

### AI IDE Integration

This skill is compatible with:

- **Claude Code** — Load SKILL.md to activate
- **Cursor** — Reference SKILL.md in context
- **Windsurf** — Use as workflow guide
- **GitHub Copilot** — Reference for code generation patterns
- **Trae-CN** — Load SKILL.md for full capability

---

## Directory Structure

```
05-HOS-XRG-Loop/
├── CLAUDE.md                    # Original skill definition
├── SKILL.md                     # Standardized skill entry (YAML front matter)
├── README.md                    # This file
├── xrg_loop++.sh                # Main entry script
├── config/
│   ├── goal_tree.yaml           # Initial goal tree definition
│   └── settings.yaml            # System config (thresholds, weights)
├── lib/
│   ├── intent_layer.sh          # L0: Goal tree management
│   ├── execution_layer.sh       # L1: CVS scoring
│   ├── reality_layer.sh         # L2: Reality validator
│   ├── anti_drift_preempt.sh    # Drift prevention engine
│   ├── complexity_debt.sh       # Complexity debt tracking
│   └── loop_controller.sh       # Git iteration controller
└── state/
    ├── goal_weights.json        # Current goal weights (real-time)
    ├── complexity_debt.json     # Complexity debt state
    ├── reality_history.json     # Reality Score history
    └── cvs_history.json         # CVS scoring history
```

---

## Design Principles

1. **Self-Stabilization** — System auto-corrects based on reality feedback
2. **Value-Driven** — Every change must demonstrate value density
3. **Preventive Control** — Predict and prevent drift before it happens
4. **Transparent Metrics** — All scores and decisions are logged and auditable
5. **Iterative Refinement** — Continuous improvement through feedback loops

---

## License

MIT

---

## Version

**2.0.0** — Self-Stabilizing Engineering System
