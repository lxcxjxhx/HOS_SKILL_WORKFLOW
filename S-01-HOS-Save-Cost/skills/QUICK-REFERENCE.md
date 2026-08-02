# Quick Reference Card - Print This! 📋

## The Four Skills at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                   TFE - FOUNDATION (ALWAYS USE)                 │
│  Token First Engineering                                        │
│  ────────────────────────────────────────────────────────────  │
│  WHEN: Every coding task                                       │
│  GOAL: Minimize tokens, prompts, context, files                │
│  KEY: Estimate tokens BEFORE writing code                      │
│  LEARN: 30 min | USE: Always | SAVE: 30-50% per task          │
│                                                                 │
│  Output this before coding:                                    │
│    Token Estimate: X tokens                                    │
│    Complexity: Simple|Moderate|Complex                         │
│    Maintenance Cost: Low|Medium|High                           │
│    Refactor Cost: Low|Medium|High                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ANPE - NEW PROJECTS & ARCHITECTURE                 │
│  AI Native Product Engineering                                 │
│  ────────────────────────────────────────────────────────────  │
│  WHEN: Starting new projects                                   │
│  GOAL: Design systems AI can understand instantly              │
│  KEY: Six principles for structure                             │
│  LEARN: 1-2 hours | SETUP: 4-8 hours | SAVE: 50-80%           │
│                                                                 │
│  Create these:                                                 │
│    1. project.yaml (single source of truth)                   │
│    2. config/ (business rules as data)                        │
│    3. prompts/ (reusable prompts)                             │
│    4. skills/ (team expertise)                                │
│    5. knowledge/ (architecture, API, workflows)               │
│    6. README.md per module (AI-first docs)                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              MRA - LEGACY SYSTEMS & BUGS                        │
│  Minimal Refactor Architecture                                 │
│  ────────────────────────────────────────────────────────────  │
│  WHEN: Taking over old code, fixing bugs                      │
│  GOAL: Surgical fixes without full rewrite                    │
│  KEY: Five-phase process for minimal scope                    │
│  LEARN: 1 hour | ANALYZE: 2-4 hours | SAVE: 80-90%           │
│                                                                 │
│  Five phases:                                                  │
│    1. Map dependencies (git history, no code reading)         │
│    2. Identify hotspots (modification frequency, bugs)        │
│    3. Identify core paths (critical business flows)           │
│    4. Refactor hotspots (strangler, adapter, compatibility)   │
│    5. Guarantee compatibility (old API continues working)     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│           CCE - LARGE SYSTEMS (100K+ LOC)                       │
│  Context Compression Engineering                              │
│  ────────────────────────────────────────────────────────────  │
│  WHEN: Codebase >100K lines or multiple AI agents             │
│  GOAL: Compress into permanent memory structures              │
│  KEY: Three maps instead of rereading code                    │
│  LEARN: 1-2 hours | CREATE: 15 hours (1x) | SAVE: 75-90%     │
│                                                                 │
│  Create three maps:                                           │
│    1. Architecture Map (5K tokens)                            │
│       → Components, dependencies, data layer                  │
│    2. Interface Map (10K tokens)                              │
│       → APIs, schemas, database                               │
│    3. Workflow Map (7K tokens)                                │
│       → Business processes, state machines                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Decision Matrix: Which Skill(s) to Use?

```
Are you writing code?
├─ YES → Always use TFE (30-50% savings)
│
├─ Is this a NEW project?
│  ├─ YES → Also use ANPE (50-80% savings)
│  │   Setup: project.yaml, config/, prompts/, skills/, knowledge/
│  └─ NO → Continue...
│
├─ Is this LEGACY code?
│  ├─ YES → Also use MRA (80-90% savings vs rewrite)
│  │   Do: Map → Hotspots → Core paths → Refactor hotspots
│  └─ NO → Continue...
│
└─ Is codebase >100K LOC?
   ├─ YES → Also use CCE (75-90% savings at scale)
   │   Do: Create Architecture/Interface/Workflow maps
   └─ NO → TFE is enough
```

---

## Skill Selection by Task Type

| Task | Skill(s) | Time to Learn | ROI |
|------|----------|---|---|
| Add feature | TFE | 30 min | 30-50% tokens |
| Fix bug | TFE (+MRA if legacy) | 30 min (+1h) | 30-90% tokens |
| Start new project | ANPE + TFE | 1-2h | 50-80% tokens |
| Refactor old code | MRA + TFE | 1-2h | 80-90% vs rewrite |
| Onboard team member | ANPE + CCE | 1-2h | 80% faster onboarding |
| Deploy AI agent | ANPE + TFE + CCE | 3-4h | 70-90% tokens |
| Scale to 100K LOC | Add CCE | 1-2h learn | 75-90% tokens |

---

## Token Estimation Template (TFE)

Use this BEFORE writing any code:

```
═════════════════════════════════════════════════════════
TASK: [Brief description]

TARGET: [What specifically are we building?]
INPUT:  [What goes in?]
OUTPUT: [What comes out?]
CONSTRAINTS: [Limits and requirements]

TOKEN ESTIMATE:
  - Research/Analysis:    ___ tokens
  - Implementation:       ___ tokens
  - Testing:              ___ tokens
  - Documentation:        ___ tokens
  ─────────────────────────────────
  TOTAL:                  ___ tokens

COMPLEXITY: Simple [ ] Moderate [ ] Complex [ ]
MAINTENANCE COST: Low [ ] Medium [ ] High [ ]
REFACTOR COST: Low [ ] Medium [ ] High [ ]

ACTION PLAN:
  1. [Step with token cost]
  2. [Step with token cost]
  3. [Step with token cost]
  ...

QUESTION: Is this estimate reasonable?
  Sanity check: [comparison to similar tasks]
═════════════════════════════════════════════════════════
```

---

## ANPE Project Setup Checklist

```
□ Create project.yaml
  └─ Add: models, api, database, cache, workflows, agents

□ Create config/
  ├─ discount-rules.yaml (business rules)
  ├─ roles.yaml (permissions)
  └─ workflows/ (process definitions)

□ Create prompts/
  ├─ coding.md
  ├─ review.md
  ├─ refactor.md
  ├─ test.md
  └─ security.md

□ Create skills/
  └─ [domain].skill (document team patterns)

□ Create knowledge/
  ├─ architecture.md (components & dependencies)
  ├─ workflow.md (business processes)
  ├─ api.md (all endpoints)
  └─ decisions.md (ADRs)

□ Create src/ structure
  └─ Every module has README.md with:
     - Purpose: [What does this do?]
     - Input: [What goes in?]
     - Output: [What comes out?]
     - Dependencies: [What does it use?]
     - Risks: [What can go wrong?]

□ Add to Git & share with team
```

---

## MRA Hotspot Analysis Checklist

```
□ Map Dependencies (no code reading)
  git log --all -- src/
  grep -r "^import\|^require" src/

□ Identify Hotspots
  git log --oneline --all -- src/ | wc -l  (modification frequency)
  git log --grep="fix\|bug" -- src/ | wc -l (bug frequency)
  grep -r "require.*module" src/ | wc -l    (dependency count)

□ Identify Core Paths
  What business flows must NOT break?
  - Login → Session → API access
  - Order → Payment → Fulfillment
  - [Your critical path]

□ Choose Refactoring Strategy
  □ Strangler pattern (new service parallel)
  □ Adapter pattern (extract to new module)
  □ Compatibility layer (wrap old API)

□ Ensure Backward Compatibility
  old_api() must continue working
  All legacy tests must pass

□ Measure Scope
  - Modules affected: __
  - Tests to update: __
  - Rollback difficulty: Easy [ ] Medium [ ] Hard [ ]
```

---

## CCE Map Creation Checklist

```
□ Architecture Map (4-6 hours)
  ├─ All services/components
  ├─ Dependency graph
  ├─ Data layer (databases, caches)
  ├─ Critical paths
  ├─ Failure modes
  └─ Scaling strategy

□ Interface Map (6-8 hours)
  ├─ All API endpoints (method, path, format)
  ├─ Request/response schemas
  ├─ Error codes & meanings
  ├─ Database schema
  ├─ Authentication flows
  └─ Rate limiting rules

□ Workflow Map (4-5 hours)
  ├─ State machines for each process
  ├─ Step-by-step flows
  ├─ Code location references
  ├─ Event/queue relationships
  └─ Async/sync decision points

□ Review & Validate
  □ Maps reviewed for accuracy
  □ Maps added to version control
  □ Team briefed on maps
  □ Hook created to remind using maps
```

---

## Token Savings Calculator

```
WITHOUT SKILLS:
  Feature:     15K tokens
  Bug fix:     10K tokens  
  Refactoring: 30K tokens
  Onboarding:  100K tokens (new engineer reading codebase)
  
WITH TFE:
  Feature:     5K tokens (-67%)
  Bug fix:     2K tokens (-80%)
  Refactoring: 8K tokens (-73%)
  Onboarding:  100K tokens (unchanged)
  
WITH ANPE:
  Feature:     2K tokens (-87%)
  Bug fix:     1K tokens (-90%)
  Onboarding:  22K tokens (-78%)
  
WITH MRA:
  Refactoring: 8K tokens vs 120K rewrite (-93%)
  
WITH CCE:
  At 100K LOC: -75-90% vs without maps
```

---

## File Locations Quick Reference

```
Documentation to read:
.kiro/skills/README.md                    ← Main guide (start here)
.kiro/skills/GETTING-STARTED.md           ← 5-min intro
.kiro/skills/OVERVIEW.md                  ← Big picture
.kiro/skills/IMPLEMENTATION-GUIDE.md      ← Real examples
.kiro/skills/INDEX.md                     ← Navigation

Skill details:
.kiro/skills/tfe-token-first-engineering.skill
.kiro/skills/anpe-ai-native-product-engineering.skill
.kiro/skills/mra-minimal-refactor-architecture.skill
.kiro/skills/cce-context-compression-engineering.skill

Configuration:
.kiro/settings/skills.json                ← Skill config
.kiro/hooks/activate-skills.json          ← Auto-activation

This file:
.kiro/skills/QUICK-REFERENCE.md           ← You are here
```

---

## Emergency Quick Start

**I have 10 minutes and need to start NOW:**

1. Read TFE skill's "Core Principles" section (5 min)
2. Use token estimation template above before your next task (3 min)
3. Apply TFE principles (prefer libraries, minimal context, config)
4. Done! Save 30-50% on tokens. 2 min.

**I have 1 hour:**

1. Read GETTING-STARTED.md (5 min)
2. Read TFE skill (30 min)
3. Read ANPE or MRA skill based on your situation (20 min)
4. Plan first use (5 min)

**I have 4 hours:**

1. Read README.md (15 min)
2. Read all four skills (2-3 hours)
3. Read IMPLEMENTATION-GUIDE.md (30 min)
4. Choose your project and plan implementation (30 min)

---

## Common Mistakes to Avoid

```
❌ Skip token estimation
✓ Always output estimate BEFORE coding

❌ Try to use all four skills immediately
✓ Start with TFE (foundation), add others as needed

❌ Ignore project structure
✓ Implement ANPE structure early (retrofitting is harder)

❌ Rewrite entire legacy system
✓ Use MRA to refactor only hotspots

❌ Ignore CCE maps for large projects
✓ Create maps at 100K LOC (breaks even in 4 modifications)

❌ Make ANPE structure but not maintain it
✓ Treat project.yaml, config/, knowledge/ like code (version control, review)

❌ Create CCE maps once and forget
✓ Update maps when architecture changes
```

---

## Print This / Bookmark This 🔖

**Keep this card handy during development. Reference it when:**
- Starting new task → Use decision matrix
- Before coding → Use token estimation template
- Taking over old project → Use MRA checklist
- Setting up new project → Use ANPE checklist
- Project reaches 100K LOC → Use CCE checklist

---

## Success Metrics Dashboard

```
Track these to measure success:

Tokens per task:      Before: ___ After: ___ Target: <5K
Feature time:         Before: ___ After: ___ Target: <3h
Bug fix time:         Before: ___ After: ___ Target: <2h
New engineer ramp:    Before: 2w After: ___ Target: 1d
Architecture bugs:    Before: 40% After: ___ Target: <5%
Prod incidents:       Before: ___ After: ___ Target: <1/mo
Code review cycles:   Before: 4   After: ___ Target: 1
Tech debt:            Before: 📈 After: ___ Target: 📉
```

---

## Quick Links to Resources

| Need | Go To |
|------|-------|
| Foundation | TFE skill (30 min) |
| New project | ANPE skill (1-2h) |
| Legacy project | MRA skill (1h) |
| Large system | CCE skill (1-2h) |
| Examples | IMPLEMENTATION-GUIDE.md |
| Overview | OVERVIEW.md |
| Navigation | INDEX.md |

---

**Last Updated**: June 13, 2026
**Status**: Ready for use
**Suggested Review**: Weekly first month, then monthly

---

*Print this card. Keep it on your desk. Reference it constantly. Track results. Share with team. Build momentum. 🚀*

**Your mission: Sustainable, AI-native software that costs less to maintain, not more.**

*You've got this! 💪*
