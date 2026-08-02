# AI Cost Optimization Skill System

Four integrated skills for AI-native software development, focusing on minimizing Token cost, context explosion, and maintenance burden.

## Skills Overview

### 1. 🔴 Token First Engineering (TFE)
**File**: `tfe-token-first-engineering.skill`

The foundational skill for all development.

**When to use**:
- Every coding task
- Before writing any code
- When optimizing existing solutions

**Core principle**: Minimize tokens, prompts, context, and files while maintaining code quality and maintainability.

**Key practices**:
- Prefer existing libraries/SDK/API over new implementations
- Structure prompts: `target: input: output: constraints:` (100 tokens max)
- Surgical context analysis (target specific directories)
- Keep files <500 lines
- Use configuration-driven design (YAML instead of if-else)

**Output before coding**:
```
Token Estimate: [X tokens]
Complexity: [Simple|Moderate|Complex]
Maintenance Cost: [Low|Medium|High]
Refactor Cost: [Low|Medium|High]
```

---

### 2. 🟢 AI Native Product Engineering (ANPE)
**File**: `anpe-ai-native-product-engineering.skill`

Design new projects from day 1 for AI maintainability.

**When to use**:
- Starting a new project
- Establishing project structure
- Creating architecture for future AI teams

**Six foundational principles**:
1. **Centralized configuration** → `project.yaml` (single source of truth)
2. **Business rules as data** → `config/` directory (rules, roles, workflows)
3. **Prompt asset management** → `prompts/` directory (reusable prompts)
4. **Skill asset management** → `skills/` directory (team expertise)
5. **Knowledge asset management** → `knowledge/` directory (architecture, API, workflows)
6. **AI-first module design** → Every module has `README.md` (Purpose/Input/Output/Dependencies/Risks format)

**Benefit for AI**:
- 2K tokens to understand entire project on first day
- Future refactoring requires reading only configuration
- No context thrashing when modifying different modules

**Project structure template**:
```
my-service/
├── project.yaml                # Single source of truth
├── config/                     # Business rules & workflows
│   ├── rules.yaml
│   ├── roles.yaml
│   └── workflows/
├── prompts/                    # Reusable prompts
│   ├── coding.md
│   ├── review.md
│   └── ...
├── skills/                     # Team expertise
│   └── backend.skill
├── knowledge/                  # Institutional memory
│   ├── architecture.md
│   ├── workflow.md
│   ├── api.md
│   └── decisions.md
└── src/
    └── [modules with README.md]
```

---

### 3. 🟠 Minimal Refactor Architecture (MRA)
**File**: `mra-minimal-refactor-architecture.skill`

Take over legacy systems without rewriting everything.

**When to use**:
- Inheriting old/messy projects
- Fixing critical bugs in legacy code
- Minimizing refactoring scope & cost

**Five-phase process**:
1. **System Mapping** → Dependency graph (no code reading)
2. **Identify Hotspots** → Modification frequency, bug frequency, dependency count
3. **Identify Core Paths** → Business-critical flows that must not break
4. **Refactor Only Hotspots** → Strangler pattern, adapter pattern, or compatibility layer
5. **Interface Compatibility** → Old API must continue working

**Core constraint**: Maximize code reuse, minimize Token consumption.

**Pre-refactoring output**:
```
Risk Level: [Low|Medium|High|Critical]
Impact Scope: [Localized|Module-Level|Service-Level|System-Wide]
Backward Compatibility: [Full|Partial|None]
Testing Scope: [Unit|Integration|Legacy integration tests]
Estimated Token Cost: [X tokens]
```

**Token compression strategy**:
- Never read: `node_modules/`, `vendor/`, `dist/`, `build/`, `coverage/`, `.git/`
- Analyze dependencies and git history first
- Only read hotspot code

**Example**: Legacy payment service with $100K monthly impact
- Traditional rewrite: 150K tokens
- MRA approach: 11K tokens (strangler pattern)
- Savings: 139K tokens (93%)

---

### 4. 🔵 Context Compression Engineering (CCE)
**File**: `cce-context-compression-engineering.skill`

Compress codebases >100K LOC into permanent memory structures.

**When to use**:
- Projects exceeding 100K lines of code
- Large systems with multiple microservices
- Reducing AI agent context thrashing

**Three-layer memory structure**:

#### Layer 1: Architecture Map
- **File**: `knowledge/architecture-map.md`
- **Content**: Complete system topology (all components, dependencies, data layer)
- **Size**: ~5K tokens
- **Purpose**: Agent understands the entire system in 10 minutes

#### Layer 2: Interface Map
- **File**: `knowledge/interface-map.md`
- **Content**: All API contracts, request/response formats, database schema
- **Size**: ~10K tokens
- **Purpose**: Agent knows API contracts without reading source code

#### Layer 3: Workflow Map
- **File**: `knowledge/workflow-map.md`
- **Content**: Business processes, state machines, code location references
- **Size**: ~7K tokens
- **Purpose**: Agent understands business logic without reading implementation

**Token savings**:
```
Without CCE: 100K LOC project × 0.5 tokens/line = 50K tokens per AI session
With CCE: 22K tokens (maps) + 2K tokens (per task) = 24K total for first task

Savings: 26K tokens per task (52% reduction)
At 10 tasks: 260K tokens saved (88% reduction)
```

**Usage example**:
- New agent joins → Reads 3 maps (15 min, 22K tokens)
- First 10 tasks → Average 2K tokens each (reference maps, read only target code)
- Without CCE → Same 10 tasks would cost 160K tokens total

---

## Integration Guide

### New Project Setup

**Step 1**: Apply ANPE
- Create `project.yaml` with all configuration
- Set up `config/`, `prompts/`, `skills/`, `knowledge/` directories
- Define `project structure.md`

**Step 2**: Apply TFE during development
- Use token estimation before each task
- Structure prompts minimally
- Keep files <500 lines
- Prefer configuration over code

**Step 3**: As project grows (>100K LOC), apply CCE
- Create Architecture Map
- Create Interface Map
- Create Workflow Map
- Maintain maps as code evolves

---

### Legacy Project Takeover

**Step 1**: Apply MRA Phase 1-2
- Map system dependencies
- Identify hotspots (modification frequency, bugs, criticality)

**Step 2**: Apply TFE for refactoring
- Estimate token cost for each refactoring phase
- Minimize context (read only hotspot modules)

**Step 3**: After refactoring, apply ANPE
- Establish project.yaml
- Set up configuration directories
- Document architecture, API, workflows

**Step 4**: At scale (>100K LOC), apply CCE
- Create compression layers
- Maintain maps

---

### AI Agent Development

**Step 1**: Base project on ANPE
- Configuration-driven architecture
- Reusable prompt and skill assets

**Step 2**: When deploying agents, apply TFE
- Agent prompts structured minimally
- Agent context scanning uses TFE principles

**Step 3**: Large codebases, deploy CCE
- Agents use Architecture + Interface + Workflow maps
- Agents reference maps instead of reading files

---

## Decision Tree: Which Skill to Use Now?

```
START
├─ Am I starting a new project?
│  └─ YES → Use ANPE (apply TFE during coding)
├─ Am I taking over a legacy system?
│  └─ YES → Use MRA Phase 1 (identify hotspots)
├─ Am I writing or modifying code?
│  └─ YES → Use TFE (token estimate before coding)
├─ Is my codebase >100K LOC?
│  └─ YES → Use CCE (create compression layers)
└─ Am I optimizing AI agent efficiency?
   └─ YES → Use ANPE + TFE + CCE (depending on project stage)
```

---

## Skill Usage Patterns

### Pattern 1: Full-Stack New Project (ANPE + TFE)
```
1. Apply ANPE
   - Create project.yaml
   - Set up config/, prompts/, skills/, knowledge/
   - Plan module structure
2. For each module:
   - Apply TFE (estimate tokens before coding)
   - Write code with TFE principles
   - Create module README.md
3. Result: AI-ready project from day 1
```

### Pattern 2: Legacy Takeover (MRA + TFE + ANPE)
```
1. Apply MRA Phase 1-2
   - Map dependencies
   - Identify hotspots
2. For each hotspot:
   - Apply TFE (minimize refactor scope)
   - Use strangler/adapter pattern
3. After stabilization:
   - Apply ANPE (restructure for future)
   - Create project.yaml, config/, knowledge/
```

### Pattern 3: Large-Scale Optimization (CCE + TFE)
```
1. Identify when codebase exceeds 100K LOC
2. Apply CCE
   - Create Architecture Map
   - Create Interface Map
   - Create Workflow Map
3. Future modifications:
   - Apply TFE (reference maps first)
   - Agent reads only target code
```

### Pattern 4: AI Agent Deployment (ANPE + TFE + CCE)
```
1. Base project on ANPE
2. Implement agent with TFE principles
3. For large codebases, provide CCE maps
4. Agent can work autonomously with:
   - project.yaml (configuration)
   - prompts/ (behavioral guidance)
   - skills/ (expertise assets)
   - knowledge/ (system understanding via maps)
```

---

## Quick Reference: When to Apply Each Skill

| Situation | Skill | Why |
|-----------|-------|-----|
| Starting new project | ANPE | Set up for AI from day 1 |
| Writing code | TFE | Minimize token cost |
| Refactoring legacy code | MRA | Surgical fixes only |
| Modifying large system | CCE | Avoid context explosion |
| Optimizing AI agents | TFE + ANPE + CCE | Comprehensive optimization |
| Onboarding new AI agent | ANPE + CCE | Fast understanding |
| Debugging production issue | MRA + TFE | Minimal refactoring, efficient analysis |
| Adding new feature | TFE + ANPE | Efficient + maintainable |
| Improving performance | MRA (identify hotspots) + TFE | Surgical optimization |

---

## Token Budgeting by Skill

| Skill | Typical Token Cost | When Worth It |
|-------|-------------------|---------------|
| TFE | 5K - 50K per task | Every task (always) |
| ANPE setup | 20K (one-time) | Every new project |
| MRA analysis | 5K - 15K | Every legacy takeover |
| CCE creation | 50K (one-time) | At 100K+ LOC or 10+ modules |

**ROI**: ANPE setup (20K) breaks even after 2 TFE-optimized tasks. CCE setup (50K) breaks even after 3 large tasks.

---

## Best Practices

1. **Always start with TFE** — It's the foundation for all other skills
2. **Apply ANPE early** — Retrofitting is harder than building-in from the start
3. **Use MRA for legacy** — Don't rewrite, refactor only hotspots
4. **Deploy CCE at scale** — 100K LOC is the breakeven point
5. **Maintain knowledge maps** — Update when architecture changes
6. **Version control everything** — Config, prompts, skills, knowledge maps all go into git
7. **Make maps canonical** — They become the first source of truth for AI agents

---

## FAQ

**Q: Which skill should I use first?**
A: Always TFE. It's universal. Then layer in ANPE (new projects), MRA (legacy projects), or CCE (large codebases).

**Q: Can I use these skills independently?**
A: Yes, but they work better together. TFE is the foundation. ANPE, MRA, CCE build on top.

**Q: How much time to set up ANPE for a new project?**
A: 4-8 hours for a medium project (5-10 modules). Pays off after 2-3 tasks.

**Q: When should I create CCE layers?**
A: When codebase exceeds 100K LOC or you have 8+ modules. Earlier if you have multiple AI agents working on the same project.

**Q: Can I add CCE to an existing project?**
A: Yes. Audit existing project, create the three maps. Takes 4-6 hours. Immediately reduces AI token costs by 50%+.

**Q: What if my project doesn't follow ANPE structure?**
A: Retrofit it. Create project.yaml, extract config/, organize prompts/, skills/, knowledge/. You can do this incrementally.

---

## Related Documentation

- Individual skill files for detailed guidance
- Your project's `project.yaml` for configuration
- Your project's `knowledge/` directory for architecture, workflows, API
- Your project's `prompts/` directory for reusable prompts
- Your project's `skills/` directory for team expertise

---

**These four skills together form a comprehensive system for AI-era software development.**

Choose the right skill for the right situation, and watch your Token efficiency, code maintainability, and AI agent productivity improve dramatically.
