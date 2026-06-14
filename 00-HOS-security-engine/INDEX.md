# Security Hyper Reasoning Engine v4.0

**Architecture**: Modular, composable security analysis platform

## 📐 System Architecture

```
Security Hyper Reasoning Engine
├── 1. Core Engine (Always Loaded)
│   ├── identity.md        → Who is analyzing
│   ├── reasoning.md       → How to think
│   ├── evidence.md        → How to prove
│   ├── review.md          → How to challenge
│   └── output.md          → How to communicate
│
├── 2. Domain Engine (Dynamic Loading)
│   ├── web.md             → Web application security
│   ├── api.md             → API security (REST/GraphQL/gRPC)
│   ├── cloud.md           → Cloud infrastructure (AWS/Azure/GCP/etc)
│   ├── mobile.md          → Mobile application security
│   ├── container.md       → Container security (Docker/OCI)
│   ├── kubernetes.md      → Kubernetes security
│   ├── ai.md              → AI/ML security
│   ├── supply-chain.md    → Supply chain & dependencies
│   └── code-audit.md      → Source code audit
│
├── 3. Threat Modeling Engine (Plugin)
│   ├── stride.md          → STRIDE methodology
│   ├── attack-tree.md     → Attack tree analysis
│   ├── kill-chain.md      → Cyber kill chain
│   ├── attack-path.md     → Attack path simulation
│   └── mitre.md           → MITRE ATT&CK mapping
│
├── 4. Evidence Engine (Always Active)
│   ├── hypothesis.md      → Hypothesis formulation
│   ├── attack-chain.md    → Complete attack chains
│   ├── verification.md    → Verification strategies
│   ├── confidence.md      → Confidence assessment
│   └── impact.md          → Impact analysis
│
├── 5. Reviewer Engine (Final Stage)
│   ├── adversarial-review.md     → Challenge conclusions
│   ├── evidence-review.md        → Validate evidence
│   ├── false-positive-review.md  → Detect false positives
│   └── architecture-review.md    → Design implications
│
├── 6. Persona System (Dynamic Selection)
│   ├── security-researcher.md    → Vuln mechanics & root cause
│   ├── appsec-engineer.md        → Design & controls
│   ├── cloud-engineer.md         → Cloud infrastructure
│   ├── threat-hunter.md          → Detection & forensics
│   ├── security-architect.md     → System design & trust
│   └── incident-responder.md     → Incident response
│
├── 7. Knowledge Engine (Reference Layer)
│   ├── owasp/              → OWASP references
│   ├── mitre/              → MITRE frameworks
│   ├── cwe/                → Common Weakness Enumeration
│   ├── capec/              → Common Attack Pattern Enumeration
│   ├── nist/               → NIST guidelines
│   └── cloud/              → Cloud-specific knowledge
│
├── 8. Templates (Output Consistency)
│   ├── finding.md          → Finding report template
│   ├── report.md           → Executive report template
│   ├── threat-model.md     → Threat model template
│   ├── architecture-review.md → Architecture review template
│   └── risk-analysis.md    → Risk analysis template
│
├── 9. Workflow Engine (Process Control)
│   ├── discover.md         → Asset & surface discovery
│   ├── model.md            → Threat modeling
│   ├── analyze.md          → Security analysis
│   ├── validate.md         → Validation & testing
│   ├── challenge.md        → Challenge & review
│   ├── report.md           → Report generation
│   └── dispatcher.md       → Workflow router
│
└── 10. Routing System (Core Intelligence)
    ├── skill-loader.md     → Dynamic module loading
    └── context-optimizer.md → Context management

```

## 🚀 How It Works

### Phase 1: Request Analysis
```
User Input
  ↓
Analyze: What are they auditing?
  ↓
Load: Required domains, threat models, personas
  ↓
Start: Core Engine + Selected Components
```

### Phase 2: Analysis Pipeline
```
Discover (Asset & Surface)
  ↓
Model (Threat Scenarios)
  ↓
Analyze (Security Issues)
  ↓
Validate (Testing & Verification)
  ↓
Challenge (Review & Adversarial)
  ↓
Report (Structured Output)
```

### Phase 3: Smart Loading
```
User: "Audit SpringBoot application"
  ↓
Load: core/* + domains/code-audit.md + domains/web.md
  ↓
Personas: SecurityResearcher + AppSecEngineer + ThreatHunter

User: "Audit Kubernetes cluster"
  ↓
Load: core/* + domains/cloud.md + domains/container.md + domains/kubernetes.md
  ↓
Personas: CloudSecurityEngineer + SecurityArchitect

User: "Threat model our API"
  ↓
Load: core/* + domains/api.md + threat-models/stride.md + threat-models/attack-path.md
  ↓
Personas: SecurityResearcher + ThreatHunter
```

## 📚 Module Responsibilities

| Layer | Purpose | Token Impact | Load Timing |
|-------|---------|--------------|-------------|
| **Core** | Identity, reasoning, evidence, review, output | 300-800 | Always |
| **Domain** | Specialized security knowledge | 400-1200 ea | Dynamic |
| **Threat Model** | Threat analysis frameworks | 200-600 ea | On-demand |
| **Evidence** | Attack chains, verification, confidence | 300-700 | Always |
| **Reviewer** | Challenge & validation logic | 400-800 | Final stage |
| **Persona** | Perspective implementations | 200-500 ea | 2-4 selected |
| **Knowledge** | Reference data (not copied to context) | Minimal | Referenced only |
| **Templates** | Output structures | 100-300 | As needed |
| **Workflow** | Process orchestration | 200-400 | Always |
| **Routing** | Smart loading logic | 100-200 | Always |

## 🎯 Key Design Principles

### 1. **Modularity**
- Each module is independent and reusable
- No circular dependencies
- Clear interfaces between modules

### 2. **Smart Loading**
- Load only what's needed for the task
- Avoid context bloat
- Optimize token consumption

### 3. **Reviewer-Centric**
- All findings go through multiple reviewers
- Adversarial review built-in
- False positive detection
- Evidence validation

### 4. **Knowledge vs. Process**
- Process lives in modules (threat-models/, domains/)
- Knowledge lives in references (knowledge/)
- Skill calls knowledge, doesn't copy it

### 5. **Extensibility**
- New domains: Add to domains/
- New threat models: Add to threat-models/
- New personas: Add to persona/
- New workflows: Add to workflows/
- No core changes needed

### 6. **Anti-Copy Design**
- Architecture is the value, not individual prompts
- Routing system is unique
- Reviewer engine is unique
- Knowledge layer integration is unique
- Complete platform capability impossible to replicate from parts

## 🔄 Usage Pattern

```
1. User provides audit scope
2. Engine analyzes requirements
3. Routing system selects modules
4. Core + selected domains + personas load
5. Workflow engine executes pipeline
6. Reviewer engine challenges findings
7. Output engine generates report
8. Human review required for all conclusions
```

## 📊 Scalability

### Current Scope
- 9 domain modules
- 5 threat modeling approaches
- 6 personas
- 4 reviewer types

### Expansion Path
- AI/ML security domain
- Agent security domain
- MCP security domain
- Cloud-native security domain
- Infrastructure-as-Code domain
- Quantum-safe cryptography domain
- Zero-trust architecture domain

**No core changes needed for expansion** - just add new modules.

## 🛡️ Anti-Fragmentation

By separating:
- **Process** (modules) from **Knowledge** (references)
- **Analysis** (domains) from **Review** (reviewers)
- **Input** (discovery) from **Output** (templates)

The system stays coherent even as it grows to 50+ modules.

---

## Module Loading Map

### For Code Audit
```
LOAD: core/* + domains/code-audit.md + domains/web.md (if web-exposed)
PERSONAS: SecurityResearcher, AppSecEngineer, ThreatHunter
THREAT-MODELS: stride.md, attack-tree.md
```

### For Cloud Audit
```
LOAD: core/* + domains/cloud.md + domains/container.md + domains/kubernetes.md
PERSONAS: CloudSecurityEngineer, SecurityArchitect
THREAT-MODELS: stride.md, attack-path.md, kill-chain.md
```

### For API Assessment
```
LOAD: core/* + domains/api.md + domains/web.md
PERSONAS: AppSecEngineer, ThreatHunter, SecurityResearcher
THREAT-MODELS: stride.md, attack-tree.md
```

### For Threat Modeling
```
LOAD: core/* + threat-models/* (as selected)
PERSONAS: SecurityResearcher, SecurityArchitect, ThreatHunter
```

### For Full Penetration Test
```
LOAD: core/* + domains/* (all applicable)
PERSONAS: SecurityResearcher, AppSecEngineer, CloudSecurityEngineer, ThreatHunter, SecurityArchitect
THREAT-MODELS: stride.md, attack-tree.md, kill-chain.md, attack-path.md
REVIEWERS: All active
```

---

See individual module documentation for detailed specifications.
