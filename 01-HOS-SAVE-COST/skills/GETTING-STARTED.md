# Getting Started with the Four Skill System

## The Four Skills at a Glance

You now have access to four integrated skills designed to minimize Token cost, reduce context explosion, and create AI-native software:

| Skill | Focus | Use When |
|-------|-------|----------|
| **TFE** (Token First Engineering) | Minimizing token cost per task | Always (foundation) |
| **ANPE** (AI Native Product Engineering) | Designing AI-ready projects | Starting new projects |
| **MRA** (Minimal Refactor Architecture) | Surgical refactoring of legacy code | Taking over old systems |
| **CCE** (Context Compression Engineering) | Managing large codebases | >100K lines of code |

---

## Quick Start: 5-Minute Tour

### 1. Understand TFE (Foundation Skill)

**What it does**: Teaches you to estimate and minimize token cost for every task.

**Key practice**: Before writing ANY code, output this:
```
Token Estimate: [X tokens]
Complexity: [Simple|Moderate|Complex]
Maintenance Cost: [Low|Medium|High]
Refactor Cost: [Low|Medium|High]
```

**Example task**:
```
Task: Add rate limiting to API

Token Assessment:
  Token Estimate: 3.2K tokens
  Complexity: Simple
  Maintenance Cost: Low (using express-rate-limit library)
  Refactor Cost: Low (isolated middleware)

Action Plan:
  1. Search NPM for rate-limit solution (200 tokens)
  2. Add express-rate-limit dependency (100 tokens)
  3. Configure in project.yaml (300 tokens)
  4. Create middleware (1.5K tokens)
  5. Write tests (800 tokens)
```

**Benefit**: 3.2K tokens for a robust solution, instead of 15K+ from scratch.

---

### 2. Understand ANPE (For New Projects)

**What it does**: Structures your project so AI can understand it in minimal time.

**Key files to create** (templates ready in `knowledge/`):
- `project.yaml` — Single source of truth for all configuration
- `config/` — Business rules, workflows, roles
- `prompts/` — Reusable prompts for AI agents
- `skills/` — Team expertise documentation
- `knowledge/` — Architecture, API, workflows

**Example**: New project setup
```bash
# 1. Create project.yaml
project:
  name: my-service
  version: 1.0.0
  aiNative: true

# 2. Create config/rules.yaml (business rules instead of code)
discount_rules:
  premium_user_100plus:
    condition: "isPremium && total > 100"
    discount: 0.2

# 3. Every module gets README.md with:
# - Purpose: What does this do?
# - Input: What goes in?
# - Output: What comes out?
# - Dependencies: What does it use?
# - Risks: What can go wrong?
```

**Benefit**: New AI agent joins → reads 3 files (15 min, 22K tokens) → understands entire project.

---

### 3. Understand MRA (For Legacy Projects)

**What it does**: Fixes broken old systems without rewriting everything.

**Process**:
1. Map the system (find dependencies)
2. Identify hotspots (what's broken/changed most?)
3. Identify core paths (what business logic can't break?)
4. Refactor only hotspots (not everything)
5. Maintain old API compatibility

**Example**: Payment service is broken (2000 lines, messy)

```
WITHOUT MRA: Rewrite entire service = 150K tokens + 2 weeks

WITH MRA:
  1. Identify hotspot: processor.js (800 lines, 42 recent commits)
  2. Use strangler pattern: Deploy new service parallel to old
  3. Route 5% traffic to new → 50% → 100%
  4. Keep old API working (new implementation delegates to it)
  5. Decommission old after 2 weeks
  
  Token cost: 11K tokens
  Timeline: 2 weeks (safe, not rushed)
  Risk: Low (old service always available as fallback)
```

**Benefit**: 139K tokens saved (93% reduction).

---

### 4. Understand CCE (For Large Codebases)

**What it does**: Compresses large codebases (>100K LOC) into three "memory maps" that replace rereading code.

**The three maps**:
1. **Architecture Map** (5K tokens)
   - What are all the components?
   - How do they connect?
   - Where is data stored?

2. **Interface Map** (10K tokens)
   - What are all the API endpoints?
   - Request/response formats?
   - Database schema?

3. **Workflow Map** (7K tokens)
   - What are the business processes?
   - State machines?
   - Where is code located?

**Example**: 100K LOC project

```
WITHOUT CCE:
  Agent reads entire codebase = 50K tokens
  Agent modifies one feature = re-reads affected files = 15K tokens
  5 features = 50K + (5 × 15K) = 125K tokens

WITH CCE:
  Create maps once = 22K tokens (one-time)
  Agent reads maps = 22K tokens
  Agent modifies feature = references map, reads only target file = 2K tokens
  5 features = 22K + (5 × 2K) = 32K tokens
  
  SAVINGS: 93K tokens (75% reduction)
```

**Benefit**: Large projects don't become more expensive to modify.

---

## How to Use These Skills Immediately

### Scenario 1: "I'm starting a new project"

**Action**:
1. Read: `anpe-ai-native-product-engineering.skill`
2. Create: `project.yaml` with your project configuration
3. Create: `config/`, `prompts/`, `skills/`, `knowledge/` directories
4. For each feature: Use TFE before coding

**Expected outcome**: Project that any AI agent can understand in <30 min.

---

### Scenario 2: "I'm adding a feature to existing project"

**Action**:
1. Before writing code: Apply TFE
   - Estimate tokens
   - Minimize context
   - Check for existing libraries
2. Write code with TFE principles
3. If project is large (>50K LOC): Create CCE maps

**Expected outcome**: Feature implemented at 50-70% lower Token cost than traditional approach.

---

### Scenario 3: "I'm fixing a bug in legacy code"

**Action**:
1. Read: `mra-minimal-refactor-architecture.skill`
2. Apply MRA Phase 1-2:
   - Map system dependencies
   - Identify which module is the bug hotspot
3. Apply TFE: Estimate token cost for minimal fix
4. Fix only the hotspot, not entire system

**Expected outcome**: Bug fixed faster, cheaper, with less risk.

---

### Scenario 4: "My project is >100K LOC and slow to modify"

**Action**:
1. Read: `cce-context-compression-engineering.skill`
2. Create three maps:
   - Architecture Map: `knowledge/architecture-map.md`
   - Interface Map: `knowledge/interface-map.md`
   - Workflow Map: `knowledge/workflow-map.md`
3. Share maps with AI agents
4. Future modifications reference maps instead of rereading code

**Expected outcome**: Modifications 5-10x cheaper in Token cost.

---

## Integration with Your Workflow

### For Individual Developers

**Before each task**:
1. Check applicable skills: "Is this new code (ANPE+TFE)? Legacy code (MRA+TFE)? Large system (CCE+TFE)?"
2. Apply appropriate skill principles
3. Always include TFE's token estimation

### For Teams

**Project setup** (Day 1):
- Apply ANPE: Create project structure, configuration, knowledge base
- All team members follow this structure

**During development** (Every day):
- Apply TFE: Estimate tokens before coding
- Prefer configuration over code
- Keep modules <500 lines

**When scaling** (100K+ LOC):
- Apply CCE: Create architecture/interface/workflow maps
- New developers/agents read maps, not entire codebase

**When maintaining legacy code**:
- Apply MRA: Map dependencies, identify hotspots
- Refactor only critical modules
- Maintain backward compatibility

### For AI Agents

**Activation happens automatically**:
1. Agent analyzes project structure
2. Detects applicable skills (ANPE structure? Large size? Legacy patterns?)
3. Loads appropriate skill file into context
4. Follows skill principles for the task

---

## Token Savings by Skill

| Skill | Savings | Effort |
|-------|---------|--------|
| TFE | 30-50% per task | None (change mindset) |
| ANPE | 50-80% for projects | 4-8 hours setup |
| MRA | 80-90% for legacy | 2-4 hours analysis |
| CCE | 75-90% for large systems | 6-10 hours setup |

**Combined effect** (all four skills on medium project):
- Traditional approach: 500K tokens
- With skills: 120K tokens
- Savings: 380K tokens (76% reduction)

---

## Key Files to Read Next

1. **For immediate use**: Start with `README.md` in this skills directory
2. **For token optimization**: Read `tfe-token-first-engineering.skill` fully
3. **For project setup**: Read `anpe-ai-native-product-engineering.skill` fully
4. **For legacy takeover**: Read `mra-minimal-refactor-architecture.skill` fully
5. **For large systems**: Read `cce-context-compression-engineering.skill` fully

---

## Common Questions

**Q: Should I use all four skills?**
A: No. Use what fits:
- New project? → ANPE + TFE
- Legacy project? → MRA + TFE
- Large project? → CCE + TFE
- Small focused task? → TFE only

**Q: What if my project doesn't match any pattern?**
A: TFE always applies. It's the foundation. Add others as your project grows.

**Q: How do I get started with ANPE on an existing project?**
A: Incrementally. Start with `project.yaml`, then build config/, then knowledge/, then refactor existing modules. No need to do it all at once.

**Q: How often should I update ANPE files (config, prompts, skills, knowledge)?**
A: As your project evolves. Treat them like code: version control, review, test. Update Architecture Map when you add services. Update Interface Map when APIs change.

**Q: What's the ROI on setting up ANPE/CCE?**
A: 
- ANPE setup (20K tokens) breaks even after ~2-3 features
- CCE setup (50K tokens) breaks even after ~3-5 large modifications
- Both compound over time as project grows

---

## Next Steps

1. **Read**: `README.md` (orchestration guide for all four skills)
2. **Choose**: Which skill applies to your current situation?
3. **Apply**: Follow the principles in that skill file
4. **Report**: Track token savings and share results

---

## Support & Resources

- **Individual skill files**: Detailed guidance for each skill
- **Your project's knowledge/**: Where architecture, workflows, and API documentation lives
- **Your project's config/**: Where business rules and workflows are defined
- **Your project's prompts/**: Where reusable prompts live
- **Your project's skills/**: Where team expertise is documented

---

**Remember**: These skills are designed to work together. Start with TFE, layer in the others as your needs grow.

The goal: **Sustainable, AI-friendly software that gets cheaper to maintain over time, not more expensive.**

Good luck! 🚀
