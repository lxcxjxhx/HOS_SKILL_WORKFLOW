# Security Hyper Reasoning Engine v4.0

A modular, scalable security analysis platform designed for enterprise-grade security assessments, penetration testing, threat modeling, and security research.

**Architecture Philosophy**: Process over Prompt | Extensibility over Monolith | Review over Report

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   User Request Analysis                     │
├─────────────────────────────────────────────────────────────┤
│  Analyze Scope → Determine Modules → Select Personas        │
├─────────────────────────────────────────────────────────────┤
│                    Smart Skill Loader                       │
│              (Load only what's needed)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┬────────────────┬──────────────────┐   │
│  │  Core Engine     │  Domain Engine │ Threat Modeling  │   │
│  │ (Always Loaded)  │ (Dynamic Load) │   (On-Demand)    │   │
│  │                  │                │                  │   │
│  │ • Identity       │ • Code Audit   │ • STRIDE         │   │
│  │ • Reasoning      │ • Web          │ • Attack Tree    │   │
│  │ • Evidence       │ • API          │ • Kill Chain     │   │
│  │ • Review         │ • Cloud        │ • Attack Path    │   │
│  │ • Output         │ • Mobile       │ • MITRE ATT&CK   │   │
│  │                  │ • Container    │                  │   │
│  │                  │ • Kubernetes   │                  │   │
│  │                  │ • AI           │                  │   │
│  │                  │ • Supply Chain │                  │   │
│  └──────────────────┴────────────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  Analysis Pipeline                          │
│   Discover → Model → Analyze → Validate → Challenge → Report│
├─────────────────────────────────────────────────────────────┤
│               Reviewer Engine (Final Stage)                 │
│    • Evidence Reviewer  • Adversarial Reviewer             │
│    • False Positive Review • Architecture Review            │
├─────────────────────────────────────────────────────────────┤
│                      Output Engine                          │
│          (Structured, Evidence-Based Reports)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Directory Structure

```
security-engine/
├── INDEX.md                    ← Start here for system overview
├── README.md                   ← This file
│
├── core/                       ← Always loaded (300-800 tokens)
│   ├── identity.md            ← Who is analyzing? (6 personas)
│   ├── reasoning.md           ← How to think systematically
│   ├── evidence.md            ← Evidence standards & hierarchy
│   ├── review.md              ← Challenge & false positive detection
│   └── output.md              ← Communication standards
│
├── domains/                    ← Dynamic loading (~400-1200 ea)
│   ├── code-audit.md          ← Source code security analysis
│   ├── web.md                 ← Web application security
│   ├── api.md                 ← REST/GraphQL/gRPC API security
│   ├── cloud.md               ← Cloud infrastructure (AWS/Azure/GCP/etc)
│   ├── mobile.md              ← Mobile application security
│   ├── container.md           ← Docker/OCI container security
│   ├── kubernetes.md          ← Kubernetes platform security
│   ├── ai.md                  ← AI/ML model and system security
│   ├── supply-chain.md        ← Dependencies, build pipeline, artifacts
│   └── iac.md                 ← Infrastructure-as-Code security
│
├── threat-models/             ← Threat analysis frameworks (~200-600 ea)
│   ├── stride.md              ← STRIDE methodology
│   ├── attack-tree.md         ← Attack tree analysis
│   ├── kill-chain.md          ← Cyber kill chain
│   ├── attack-path.md         ← Attack path simulation
│   └── mitre.md               ← MITRE ATT&CK mapping
│
├── reviewers/                 ← Reviewer implementations
│   ├── evidence-review.md     ← Evidence validation
│   ├── adversarial-review.md  ← Challenging conclusions
│   ├── false-positive-review.md ← FP detection patterns
│   └── architecture-review.md ← Design implications
│
├── personas/                  ← Analyst perspectives (~200-500 ea)
│   ├── security-researcher.md ← Vulnerability mechanics
│   ├── appsec-engineer.md     ← Security design & controls
│   ├── cloud-engineer.md      ← Cloud infrastructure
│   ├── threat-hunter.md       ← Detection & forensics
│   ├── security-architect.md  ← System design & trust
│   └── incident-responder.md  ← Incident response
│
├── templates/                 ← Output structures
│   ├── finding.md             ← Finding report template
│   ├── report.md              ← Executive report
│   ├── threat-model.md        ← Threat model report
│   ├── architecture-review.md ← Architecture assessment
│   └── risk-analysis.md       ← Risk matrix & analysis
│
├── workflows/                 ← Process orchestration
│   ├── discover.md            ← Asset & surface discovery
│   ├── model.md               ← Threat scenario modeling
│   ├── analyze.md             ← Security analysis execution
│   ├── validate.md            ← Testing & verification
│   ├── challenge.md           ← Review & challenge
│   ├── report.md              ← Report generation
│   └── dispatcher.md          ← Workflow router & orchestrator
│
├── routing/                   ← Smart loading system
│   ├── skill-loader.md        ← Dynamic module loading
│   └── context-optimizer.md   ← Token & context management
│
└── knowledge/                 ← Reference resources (not copied to context)
    ├── owasp/
    ├── mitre/
    ├── cwe/
    ├── capec/
    ├── nist/
    └── cloud/
```

---

## 🚀 Quick Start

### For Code Audit
```
Load: core/* + domains/code-audit.md + domains/web.md
Personas: SecurityResearcher, AppSecEngineer, ThreatHunter
Threat Models: STRIDE, attack-tree.md
Time: ~30-60 min for medium app
```

### For Cloud Audit
```
Load: core/* + domains/cloud.md + domains/container.md + domains/kubernetes.md
Personas: CloudSecurityEngineer, SecurityArchitect
Threat Models: STRIDE, attack-path.md, kill-chain.md
Time: ~60-120 min for infrastructure review
```

### For API Penetration Test
```
Load: core/* + domains/api.md + domains/web.md
Personas: AppSecEngineer, SecurityResearcher, ThreatHunter
Threat Models: STRIDE, attack-tree.md, attack-path.md
Time: ~45-90 min for API assessment
```

### For Supply Chain Security
```
Load: core/* + domains/supply-chain.md + domains/code-audit.md
Personas: SecurityArchitect, SecurityResearcher, ThreatHunter
Threat Models: attack-tree.md, kill-chain.md
Time: ~60-90 min for dependency analysis
```

---

## 🎯 How It Works

### Phase 1: Request Analysis
1. User provides audit scope (e.g., "Audit SpringBoot application")
2. Engine analyzes: What are they testing? What's the scope? What type of analysis?
3. Skill loader determines required modules

### Phase 2: Module Loading
1. Load **core/** (always) - Identity, reasoning, evidence, review, output
2. Load **domain/** (dynamic) - code-audit.md, web.md based on scope
3. Load **threat-models/** (on-demand) - STRIDE, attack-tree
4. Load **personas/** - SecurityResearcher, AppSecEngineer, ThreatHunter
5. Load **workflows/** - Discovery → Modeling → Analysis → Validation → Challenge → Report

### Phase 3: Analysis Pipeline
```
1. DISCOVER (20-30%)
   Asset discovery, surface mapping, environment understanding

2. MODEL (15-20%)
   Threat scenarios, attack vectors, entry points

3. ANALYZE (35-45%)
   Security issue identification, root cause analysis,
   multi-perspective examination

4. VALIDATE (10-20%)
   Testing, reproduction, verification

5. CHALLENGE (10-15%)
   Evidence review, false positive detection,
   adversarial review, severity recalibration

6. REPORT (10-15%)
   Structured output, executive summary, remediation plan
```

### Phase 4: Review Pipeline
- **Evidence Reviewer**: Is evidence sufficient?
- **Adversarial Reviewer**: What's the counterargument?
- **False Positive Reviewer**: Is this a real finding?
- **Architecture Reviewer**: Does this indicate design change needed?

### Phase 5: Output
- Finding reports with multi-perspective analysis
- Attack chains from entry point to business impact
- Confidence levels calibrated to evidence
- Detection recommendations
- Specific remediation guidance
- Executive summary with risk metrics

---

## 🎭 Persona System

The engine dynamically selects 2-4 personas based on scope:

### Security Researcher
**Lens**: Vulnerability mechanics and root cause
- How is this vulnerability formed?
- What's the exploitation technique?
- What's the underlying weakness?

### Application Security Engineer
**Lens**: Security design and business logic
- Was this considered in design?
- What control should prevent this?
- Can malicious user abuse this?

### Cloud Security Engineer
**Lens**: Infrastructure and cloud-native risks
- What IAM policies enable this?
- Is network segmentation in place?
- What cloud property caused this?

### Threat Hunter
**Lens**: Detection and forensics
- How would we detect this?
- What's the forensic trail?
- What alerts should fire?

### Security Architect
**Lens**: System design and trust boundaries
- What architectural pattern caused this?
- Is this a trust boundary violation?
- Should we redesign this component?

### Incident Responder
**Lens**: Response and containment
- What's the immediate threat?
- How do we contain this?
- What evidence needs preservation?

---

## 📊 Evidence Requirements

Every conclusion must include:

1. **Evidence** - Code, config, log, test, or architecture proof
2. **Source** - Exact location: file:line, section, config path
3. **Confidence** - High (direct), Medium (inferred), Low (hypothesis)
4. **Context** - Surrounding information explaining why it matters
5. **Verification** - How to test/validate the finding
6. **Remediation** - Specific, actionable fix

---

## ⚖️ Confidence Levels

### HIGH Confidence
- Direct code/config evidence observed
- Issue reproduced independently  
- Test execution confirmed
- Multiple confirming sources

**Example**: SQL injection confirmed via test payload, verified in code

### MEDIUM Confidence
- Pattern matches known vulnerability
- Code review suggests issue (not tested)
- Design flaw identified but not verified
- Partial evidence available

**Example**: Similar vulnerable pattern found; design flaw identified but not dynamically tested

### LOW Confidence
- Speculation based on patterns
- Assumption about implementation
- Theory not yet tested

**Example**: "Probably using weak encryption" without verification

---

## 🛡️ Review Engine

The Review Engine prevents false positives and false negatives:

### False Positive Detection
Asks: What could make this NOT a vulnerability?
- Compensating controls?
- Context-specific configuration?
- Alternative explanations?
- Unproven assumptions?

### Adversarial Review
Asks: What's the strongest counterargument?
- Can this be exploited?
- How likely in practice?
- What mitigates this?
- Is this really in scope?

### Evidence Validation
Asks: Is evidence sufficient?
- Can someone independently verify?
- Is location specified exactly?
- Is context provided?
- Is it reproducible?

---

## 💾 Token Optimization

| Component | Load | Size | Cost |
|-----------|------|------|------|
| Core | Always | 300-800 | ~1.5k |
| Code Audit | Dynamic | 600-900 | ~700 |
| Cloud | Dynamic | 800-1200 | ~900 |
| API | Dynamic | 500-800 | ~600 |
| STRIDE | Dynamic | 300-500 | ~400 |
| Personas (4) | Dynamic | 800-2000 | ~1.5k |
| Workflows | Always | 200-400 | ~300 |

**Total for code audit**: ~5.5k tokens
**Total for full pentest**: ~8-10k tokens

Compare to monolithic 15k+ token skill - **60% token savings** for typical audits!

---

## 🔄 Extensibility

### Adding New Domain
```
1. Create domains/new-domain.md (600-1200 lines)
2. Define scope and checklist
3. Add to skill-loader.md routing rules
4. No changes to core required
```

### Adding New Threat Model
```
1. Create threat-models/new-model.md (200-600 lines)
2. Define methodology and analysis approach
3. Add to skill-loader.md routing rules
4. No changes to core required
```

### Adding New Persona
```
1. Create personas/new-persona.md (200-500 lines)
2. Define perspective and focus areas
3. Add to identity.md
4. Add to skill-loader.md selection logic
5. No changes to core required
```

### Future Expansion
- `domains/iac.md` - Infrastructure-as-Code security
- `domains/agent-security.md` - AI Agent security
- `domains/mcp-security.md` - Model Context Protocol security
- `domains/quantum.md` - Quantum-safe cryptography
- `threat-models/zero-trust.md` - Zero-trust architecture analysis
- `personas/compliance-officer.md` - Regulatory perspective

---

## 🎓 Usage Examples

### Example 1: SpringBoot Code Audit
```
Request: "Audit SpringBoot API project for security issues"

Load:
├── core/* (identity, reasoning, evidence, review, output)
├── domains/code-audit.md
├── domains/web.md (if web-exposed)
├── threat-models/stride.md
├── threat-models/attack-tree.md
└── personas/security-researcher.md + appsec-engineer.md + threat-hunter.md

Output: Code review with findings like SQL injection, auth bypass, serialization issues
```

### Example 2: AWS Account Assessment
```
Request: "Assess security of AWS account - EC2, RDS, S3, Lambda, IAM"

Load:
├── core/* (identity, reasoning, evidence, review, output)
├── domains/cloud.md
├── domains/container.md (EC2 → containers often)
├── threat-models/stride.md
├── threat-models/attack-path.md
└── personas/cloud-engineer.md + security-architect.md + threat-hunter.md

Output: Infrastructure assessment with findings like public S3, overpermissive IAM, exposed RDS
```

### Example 3: Threat Model Session
```
Request: "Create threat model for our microservices architecture"

Load:
├── core/* (identity, reasoning, evidence, review, output)
├── domains/api.md
├── threat-models/stride.md
├── threat-models/attack-path.md
├── threat-models/kill-chain.md
└── personas/security-architect.md + security-researcher.md

Output: Threat model with attack chains, attack trees, STRIDE analysis
```

---

## ✅ Quality Assurance

Every finding must pass:

- [ ] **Evidence Check** - Is evidence sufficient and specific?
- [ ] **Assumption Check** - What could prove this wrong?
- [ ] **Perspective Check** - Analyzed from multiple viewpoints?
- [ ] **Confidence Check** - Does evidence match confidence level?
- [ ] **Chain Check** - Complete attack chain documented?
- [ ] **Remediation Check** - Clear, actionable fix provided?
- [ ] **Review Check** - Human review required explicitly?

---

## 🚫 What This Is NOT

This is NOT:
- Vulnerability scanner (no automated scanning)
- SAST tool (no code scanning tools)
- WAF rules generator
- Compliance checklist (though it can inform compliance)
- Magic solution (human expertise required)

This IS:
- A framework for expert security analysis
- A system for organizing security knowledge
- A methodology for thorough reasoning
- A platform for multi-perspective analysis
- A reviewer system for quality assurance

---

## 📞 Support & Contribution

### Current Modules
- Core: ✅ Complete
- Domains: ~40% (code-audit, web, cloud, api, supply-chain, mobile in progress)
- Threat Models: ~60% (STRIDE, attack-tree complete; kill-chain, attack-path in progress)
- Personas: ~50% (All 6 personas defined)
- Reviewers: ~70% (Evidence, adversarial, FP reviewers defined)

### Roadmap
- [ ] Complete domains (container, kubernetes, ai, iac, mobile)
- [ ] Complete threat models (kill-chain, attack-path, mitre mapping)
- [ ] Persona implementations
- [ ] Reviewer implementations
- [ ] Knowledge base (OWASP, MITRE, CWE, CAPEC links)
- [ ] Workflow implementations
- [ ] Template implementations

---

## 📄 License

This skill is designed for authorized security testing and assessment only.

**All security conclusions require human expert review before finalization.**

---

## 🙏 Credits

Design inspired by:
- OWASP Testing Guide
- NIST Cybersecurity Framework
- MITRE ATT&CK Framework
- Cyber Kill Chain
- Threat Modeling Manifesto
- Security Storytelling principles

---

Start with `INDEX.md` for system overview, then choose appropriate domain for your task.
