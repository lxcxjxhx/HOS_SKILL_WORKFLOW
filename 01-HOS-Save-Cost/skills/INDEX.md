# Skill System Index & Quick Navigation

## 📚 Complete File Structure

```
.kiro/
├── skills/                                      # All skill files
│   ├── tfe-token-first-engineering.skill        # Foundation skill ⭐ START HERE
│   ├── anpe-ai-native-product-engineering.skill # New projects
│   ├── mra-minimal-refactor-architecture.skill  # Legacy systems
│   ├── cce-context-compression-engineering.skill # Large codebases
│   ├── README.md                                # Main orchestration guide
│   ├── OVERVIEW.md                              # High-level summary
│   ├── GETTING-STARTED.md                       # 5-min quick tour
│   ├── IMPLEMENTATION-GUIDE.md                  # Real-world examples
│   └── INDEX.md                                 # This file
├── settings/
│   └── skills.json                              # Skill configuration
└── hooks/
    └── activate-skills.json                     # Auto-activation hook
```

---

## 🎯 Where to Start Based on Your Situation

### "I have 5 minutes"
→ Read: **GETTING-STARTED.md**
- Quick overview of all four skills
- Key practices for each
- Simple examples

### "I want to understand the system"
→ Read: **OVERVIEW.md**
- Big picture (what problem does this solve?)
- All four skills at a glance
- Real-world token savings
- Decision flowchart

### "I need to get to work NOW"
→ Read: **README.md** (Table of Contents section)
- Which skill applies to your task?
- Quick summary of each skill
- Token budgeting guide
- Navigate to specific skill

### "I'm starting a new project"
→ Read: **ANPE skill** (anpe-ai-native-product-engineering.skill)
- Six foundational principles
- Project structure template
- Integration checklist
- Then apply TFE to development

### "I'm adding a feature to existing code"
→ Read: **TFE skill** (tfe-token-first-engineering.skill)
- Token estimation process
- Decision tree
- Pre-coding output format
- Minimal scope practices

### "I'm fixing a bug in legacy code"
→ Read: **MRA skill** (mra-minimal-refactor-architecture.skill)
- Five-phase process
- Hotspot identification
- Refactoring strategies
- Then apply TFE

### "My codebase is >100K lines"
→ Read: **CCE skill** (cce-context-compression-engineering.skill)
- Three-layer memory structure
- Architecture/Interface/Workflow maps
- Token savings calculations
- Implementation steps

### "I need real-world examples"
→ Read: **IMPLEMENTATION-GUIDE.md**
- New project (ANPE + TFE)
- Adding a feature (TFE in action)
- Legacy takeover (MRA + TFE)
- Large system optimization (CCE)
- Integrated workflow (all four skills)

---

## 🔍 Skills Quick Reference

### TFE (Token First Engineering)
**File**: `tfe-token-first-engineering.skill`

**Core principle**: Minimize tokens, prompts, context, files

**When to use**: EVERY TASK (foundation)

**Key output format**:
```
Token Estimate: X tokens
Complexity: [Simple|Moderate|Complex]
Maintenance Cost: [Low|Medium|High]
Refactor Cost: [Low|Medium|High]
```

**Time to learn**: 30 min
**ROI**: 30-50% token reduction per task (immediate)

---

### ANPE (AI Native Product Engineering)
**File**: `anpe-ai-native-product-engineering.skill`

**Core principle**: Design systems AI can understand instantly

**When to use**: New projects, architecture design

**Six principles**:
1. Centralized configuration (project.yaml)
2. Business rules as data (config/)
3. Reusable prompts (prompts/)
4. Skill assets (skills/)
5. Knowledge assets (knowledge/)
6. AI-first module design (README.md per module)

**Time to learn**: 1-2 hours
**Time to implement**: 4-8 hours (one-time)
**ROI**: 50-80% token reduction on modifications, 80% faster onboarding

---

### MRA (Minimal Refactor Architecture)
**File**: `mra-minimal-refactor-architecture.skill`

**Core principle**: Fix critical issues without full rewrite

**When to use**: Legacy systems, taking over old code

**Five phases**:
1. System Mapping (dependencies)
2. Identify Hotspots (frequency, bugs, criticality)
3. Identify Core Paths (what can't break)
4. Refactor Only Hotspots (strangler, adapter, compatibility)
5. Guarantee Compatibility (old API continues working)

**Time to learn**: 1 hour
**Time to implement**: 2-4 hours (per refactoring)
**ROI**: 80-90% token reduction vs full rewrite, 75% less risk

---

### CCE (Context Compression Engineering)
**File**: `cce-context-compression-engineering.skill`

**Core principle**: Compress large codebases into permanent memory

**When to use**: >100K LOC, multiple AI agents, large teams

**Three maps**:
1. Architecture Map (components, dependencies, data layer)
2. Interface Map (all APIs, schemas, database)
3. Workflow Map (business processes, state machines, code locations)

**Time to learn**: 1-2 hours
**Time to implement**: 50K tokens, 15 hours (one-time)
**ROI**: 75-90% token reduction at scale, 80% faster team onboarding

---

## 📊 Quick Decision Matrix

| Situation | Skill(s) | Why | Result |
|-----------|----------|-----|--------|
| Starting new project | ANPE + TFE | Structure from day 1 | 50-80% savings |
| Adding feature | TFE | Every task | 30-50% savings |
| Fixing bug in old code | MRA + TFE | Surgical fixes | 80-90% savings |
| Codebase >100K LOC | CCE + TFE | Avoid context explosion | 75-90% savings |
| Taking over legacy system | MRA + TFE + ANPE | Multi-phase transformation | 80-90% savings |
| Onboarding AI agents | ANPE + CCE + TFE | Efficient from day 1 | 70-90% savings |
| Rapid prototyping | TFE | Minimal overhead | 30-50% savings |
| Scaling existing project | ANPE (retrofit) + CCE | Structure for growth | 50-80% savings |

---

## ✅ Implementation Checklist

### Week 1: Learn & Understand
- [ ] Read GETTING-STARTED.md (5 min)
- [ ] Read OVERVIEW.md (15 min)
- [ ] Read skill file for your situation (30-60 min)
- [ ] Share with team

### Week 2: Apply Foundation (TFE)
- [ ] For next task, output token estimate before coding
- [ ] Apply TFE principles (prefer libraries, minimal prompts, focused context)
- [ ] Track token cost for validation

### Month 1: Structure (if new project)
- [ ] Create project.yaml
- [ ] Set up config/, prompts/, skills/, knowledge/ directories
- [ ] Create README.md for each module
- [ ] Document architecture in knowledge/

### Month 1-3: Growth (apply TFE + ANPE)
- [ ] Maintain configuration-driven approach
- [ ] All new features follow ANPE + TFE
- [ ] Update documentation as you build

### Month 6+: Scale Preparation (add CCE if needed)
- [ ] If codebase approaches 100K LOC or team >10 people
- [ ] Create Architecture Map (4-6 hours)
- [ ] Create Interface Map (6-8 hours)
- [ ] Create Workflow Map (4-5 hours)
- [ ] Share maps with team

### Ongoing: Maintain & Optimize
- [ ] Update project.yaml when adding new services/rules
- [ ] Update documentation when architecture changes
- [ ] Apply TFE during development (habit)
- [ ] Review token metrics monthly

---

## 🎓 Learning Path

### Path A: Fast Track (Individual)
1. GETTING-STARTED.md (5 min)
2. TFE skill (30 min)
3. Apply TFE to next task
4. Total: 35 min to start saving 30-50% on token cost

### Path B: Project Setup (New Project, 1-2 people)
1. OVERVIEW.md (10 min)
2. ANPE skill (1-2 hours)
3. README.md (15 min)
4. IMPLEMENTATION-GUIDE.md (Part 1: New Project, 20 min)
5. Implement ANPE structure (4-8 hours)
6. Apply TFE during development
7. Total: 7-10 hours to setup, saving 50-80% on modifications

### Path C: Legacy Takeover (Team + Old Code)
1. OVERVIEW.md (10 min)
2. MRA skill (1 hour)
3. IMPLEMENTATION-GUIDE.md (Part 3: Legacy Takeover, 20 min)
4. Execute MRA phases (2-4 hours analysis)
5. Execute minimal refactoring with TFE (10-30 hours depending on scope)
6. Total: 13-36 hours, saving 80-90% vs full rewrite

### Path D: Complete Mastery (Team)
1. README.md (15 min)
2. All four skills (4-6 hours)
3. IMPLEMENTATION-GUIDE.md (1 hour)
4. OVERVIEW.md (15 min)
5. Total: 6-8 hours for complete understanding
6. Start applying incrementally

---

## 🚀 Getting Started Now

### Option 1: "Tell me what to read" (You are here)
→ Use this INDEX.md to find relevant files

### Option 2: "Show me examples"
→ Read IMPLEMENTATION-GUIDE.md
→ Find scenario matching your situation
→ Follow step-by-step

### Option 3: "What do I do right now?"
→ Next task? Read TFE skill (30 min)
→ New project? Read ANPE skill (1-2 hours)
→ Old code? Read MRA skill (1 hour)
→ Large project? Read CCE skill (1-2 hours)

### Option 4: "Explain like I'm learning programming"
→ Read GETTING-STARTED.md (5 min)
→ This gives you the gist, then pick a skill

---

## 📞 FAQ Quick Links

**Q: Which skill should I learn first?**
→ TFE. It applies to every task. (30 min)

**Q: Can I use these skills independently?**
→ Yes, but together they're more powerful. TFE is foundation.

**Q: How long until I see Token savings?**
→ TFE: Immediately on next task (30-50%)
→ ANPE: After 2-3 features (50-80%)
→ MRA: After first hotspot refactoring (80-90%)
→ CCE: After 4 modifications (75-90%)

**Q: What if my project doesn't match any pattern?**
→ TFE always applies. Add others as needed.

**Q: Can I add these skills to an existing project?**
→ Yes. Start with TFE (now). Add ANPE structure gradually. Add CCE at 100K LOC.

**Q: How do I measure success?**
→ Track tokens per task. Compare before/after. See OVERVIEW.md for metrics.

---

## 💡 Pro Tips

1. **Start with TFE**: It's the foundation. Everything builds on top.
2. **Document early**: If starting new project, implement ANPE structure now.
3. **Map before refactoring**: Always do MRA hotspot analysis before touching legacy code.
4. **Create CCE maps early**: At 100K LOC or when onboarding new team members.
5. **Version control everything**: project.yaml, config/, prompts/, skills/, knowledge/ all go to git.
6. **Make maps canonical**: They become the single source of truth for AI agents and humans.
7. **Measure & share**: Track savings, share results, build team buy-in.

---

## 📈 Expected Outcomes

### Individual Developer
- 30-50% fewer tokens per task
- Features implemented 40-50% faster
- Cleaner code, fewer bugs

### Small Team (3-5 people)
- 50-80% fewer tokens overall
- New members productive in 1 day (vs 2 weeks)
- Architecture misunderstandings < 5%
- Maintenance cost decreasing over time

### Growing Team (5-15 people)
- 70-90% fewer tokens with all skills applied
- New members productive in 1 day
- AI agents work autonomously
- Production incidents down 50%+
- Annual savings: 5M+ tokens

---

## 🔗 File Dependencies

```
To understand:              Read these files (in order):
─────────────────────────────────────────────────────
Foundations                 GETTING-STARTED.md
Big picture                 OVERVIEW.md
All four skills             README.md
How to pick a skill         README.md (Decision Tree)
Token optimization          TFE skill
Project structure           ANPE skill
Legacy code fixes           MRA skill
Large systems               CCE skill
Real examples               IMPLEMENTATION-GUIDE.md
Everything                  All files
```

---

## ⚡ Power User Flow

1. **Read** OVERVIEW.md (understand the system)
2. **Skim** all four skills (know what each does)
3. **Master** TFE (use every task)
4. **Apply** others as needed (ANPE for new projects, MRA for old code, CCE at scale)
5. **Measure** results (track tokens, time, quality metrics)
6. **Share** with team (build adoption)

---

## 🎯 Next Step

**Choose your entry point**:

- [ ] **5 min intro?** → Read GETTING-STARTED.md
- [ ] **High-level overview?** → Read OVERVIEW.md  
- [ ] **Full system guide?** → Read README.md
- [ ] **Learn TFE now?** → Read tfe-token-first-engineering.skill
- [ ] **Learn ANPE now?** → Read anpe-ai-native-product-engineering.skill
- [ ] **Learn MRA now?** → Read mra-minimal-refactor-architecture.skill
- [ ] **Learn CCE now?** → Read cce-context-compression-engineering.skill
- [ ] **See examples?** → Read IMPLEMENTATION-GUIDE.md
- [ ] **Quick reference?** → You're reading it (INDEX.md)

---

**Pick one. Start now. Track results. Build momentum. 🚀**

*Remember: The goal is sustainable software that gets cheaper to maintain over time, not more expensive.*
