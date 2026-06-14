# Routing: Smart Skill Loader

**Purpose**: Dynamically load only required modules based on analysis scope

**Size Target**: 150-250 lines
**Load Timing**: Always (initialization)
**Token Cost**: Minimal

## Request Analysis

When user provides audit scope, analyze:

```
1. WHAT is being audited?
   - Application code?
   - Cloud infrastructure?
   - API?
   - Kubernetes cluster?
   - Mobile app?
   - CI/CD pipeline?

2. WHO is the audience?
   - DevOps team?
   - Engineering team?
   - Security team?
   - Executive?

3. WHAT type of analysis?
   - Audit?
   - Penetration test?
   - Threat modeling?
   - Compliance review?
   - Incident response?

4. WHAT's the scope?
   - Full system?
   - Specific components?
   - Limited time frame?
   - Specific risk categories?
```

## Dynamic Module Loading

### SpringBoot Application Code Audit
```
LOAD:
├── core/* (always)
├── domains/code-audit.md
├── domains/web.md
├── threat-models/stride.md
└── threat-models/attack-tree.md

PERSONAS:
├── SecurityResearcher (primary)
├── AppSecEngineer (secondary)
└── ThreatHunter (tertiary)

WORKFLOWS:
├── discover.md (asset discovery)
├── model.md (threat modeling)
├── analyze.md (security analysis)
├── validate.md (testing)
├── challenge.md (review)
└── report.md (output)
```

### Kubernetes Cluster Security
```
LOAD:
├── core/* (always)
├── domains/cloud.md
├── domains/container.md
├── domains/kubernetes.md
├── threat-models/stride.md
├── threat-models/attack-path.md
└── threat-models/kill-chain.md

PERSONAS:
├── CloudSecurityEngineer (primary)
├── SecurityArchitect (secondary)
└── ThreatHunter (tertiary)

WORKFLOWS:
├── discover.md (infrastructure discovery)
├── model.md (attack scenarios)
├── analyze.md (configuration analysis)
├── validate.md (testing)
├── challenge.md (architectural review)
└── report.md (output)
```

### REST API Penetration Test
```
LOAD:
├── core/* (always)
├── domains/api.md
├── domains/web.md
├── threat-models/stride.md
├── threat-models/attack-tree.md
└── threat-models/attack-path.md

PERSONAS:
├── AppSecEngineer (primary)
├── SecurityResearcher (secondary)
└── ThreatHunter (tertiary)

WORKFLOWS:
├── discover.md (API discovery)
├── model.md (threat scenarios)
├── analyze.md (endpoint analysis)
├── validate.md (exploitation)
├── challenge.md (mitigation review)
└── report.md (output)
```

### Supply Chain Security Audit
```
LOAD:
├── core/* (always)
├── domains/supply-chain.md
├── domains/code-audit.md
├── threat-models/attack-tree.md
├── threat-models/kill-chain.md
└── threat-models/attack-path.md

PERSONAS:
├── SecurityArchitect (primary)
├── SecurityResearcher (secondary)
└── ThreatHunter (tertiary)

WORKFLOWS:
├── discover.md (dependency discovery)
├── model.md (threat scenarios)
├── analyze.md (vulnerability analysis)
├── validate.md (testing)
├── challenge.md (architectural implications)
└── report.md (output)
```

### AI/ML System Security Assessment
```
LOAD:
├── core/* (always)
├── domains/ai.md
├── domains/code-audit.md
├── domains/cloud.md
├── threat-models/stride.md
├── threat-models/attack-tree.md
└── threat-models/attack-path.md

PERSONAS:
├── SecurityResearcher (primary)
├── AppSecEngineer (secondary)
├── SecurityArchitect (tertiary)
└── ThreatHunter (tertiary)

WORKFLOWS:
├── discover.md (model discovery)
├── model.md (threat modeling)
├── analyze.md (security analysis)
├── validate.md (model robustness testing)
├── challenge.md (design review)
└── report.md (output)
```

## Loading Decision Matrix

| Scope | Domains | Threat Models | Personas |
|-------|---------|---------------|----------|
| **Code Audit** | code-audit, web | STRIDE, attack-tree | SR, ASE, TH |
| **Cloud Audit** | cloud, container, k8s | STRIDE, attack-path | CSE, SA, TH |
| **API Test** | api, web | STRIDE, attack-tree | ASE, SR, TH |
| **Threat Model** | [based on target] | [all if comprehensive] | SR, SA, TH |
| **Supply Chain** | supply-chain, code-audit | attack-tree, kill-chain | SA, SR, TH |
| **Mobile App** | mobile | STRIDE, attack-tree | ASE, SR, TH |
| **Full Pentest** | all applicable | all | all applicable |

## Token Optimization

| Component | Load | Size | Impact |
|-----------|------|------|--------|
| Core | Always | 300-800 | Baseline ~1.5k tokens |
| Per Domain | Dynamic | 400-1200 | +400-1200 per domain |
| Per Threat Model | Dynamic | 200-600 | +200-600 per model |
| Per Persona | Dynamic | 200-500 | +200-500 per persona |
| Per Workflow | Always | 200-400 | +200-400 |

**Example Token Cost**:
- Code audit: 1.5k (core) + 600 (code-audit) + 500 (web) + 400 (STRIDE) + 300 (attack-tree) + 500 (SR+ASE) = ~3.8k tokens
- Full pentest: 1.5k (core) + 5k+ (all domains) + 1.5k (threat models) + 2k (personas) = ~10k tokens

## Loading Algorithm

```
1. ANALYZE request
   - What's being tested?
   - What's the scope?
   - What's the priority?

2. DETERMINE required domains
   - Map scope to domain modules
   - Check dependencies between domains

3. DETERMINE threat models
   - What threats apply?
   - What analysis needed?
   - Load minimum necessary

4. SELECT personas
   - Primary perspective
   - Secondary perspective
   - Tertiary if needed

5. LOAD modules
   - Core (always)
   - Selected domains
   - Selected threat models
   - Selected personas
   - Standard workflows

6. INITIALIZE workflow
   - Start with discovery
   - Progress through pipeline
   - Apply reviewers at each stage
```

## Anti-Pattern: Load Everything

**WRONG**: Load all domains for every request
- Token explosion
- Context confusion
- Slower reasoning
- Lower quality analysis

**RIGHT**: Load only what's needed
- Focused analysis
- Faster response
- Clearer reasoning
- Better quality

