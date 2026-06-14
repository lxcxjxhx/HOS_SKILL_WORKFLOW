# Security Engine - Quick Start Guide

## 🎯 Choose Your Analysis Type

### 1. Source Code Audit
```
What: Review application source code for security issues
Time: 30-60 minutes
Load: 
  core/* + domains/code-audit.md + domains/web.md
Personas: 
  SecurityResearcher, AppSecEngineer, ThreatHunter
Output: 
  Code-level findings, auth issues, injection points, crypto problems
```

### 2. Cloud Infrastructure Audit
```
What: Assess cloud account/environment for misconfigurations
Time: 60-120 minutes
Load: 
  core/* + domains/cloud.md + domains/container.md + domains/kubernetes.md
Personas: 
  CloudSecurityEngineer, SecurityArchitect, ThreatHunter
Output: 
  IAM issues, public exposure, network problems, encryption gaps
```

### 3. API Security Assessment
```
What: Test REST/GraphQL API for vulnerabilities
Time: 45-90 minutes
Load: 
  core/* + domains/api.md + domains/web.md
Personas: 
  AppSecEngineer, SecurityResearcher, ThreatHunter
Threat Models: 
  STRIDE, attack-tree
Output: 
  Authentication flaws, authorization issues, data exposure, injection
```

### 4. Threat Modeling Session
```
What: Create formal threat model for system/architecture
Time: 60-120 minutes
Load: 
  core/* + threat-models/stride.md + threat-models/attack-path.md
Personas: 
  SecurityArchitect, SecurityResearcher, ThreatHunter
Output: 
  Attack trees, threat scenarios, risk prioritization, mitigation strategy
```

### 5. Supply Chain Security Review
```
What: Audit dependencies, build pipeline, artifact security
Time: 60-90 minutes
Load: 
  core/* + domains/supply-chain.md + domains/code-audit.md
Personas: 
  SecurityArchitect, SecurityResearcher, ThreatHunter
Output: 
  Vulnerable dependencies, build risks, artifact integrity, secret exposure
```

### 6. Container Security Assessment
```
What: Audit container images, registry, runtime security
Time: 45-60 minutes
Load: 
  core/* + domains/container.md + domains/kubernetes.md
Personas: 
  CloudSecurityEngineer, SecurityArchitect
Output: 
  Image vulnerabilities, secret exposure, privilege issues, misconfigurations
```

### 7. Kubernetes Cluster Audit
```
What: Review K8s deployment for security issues
Time: 90-120 minutes
Load: 
  core/* + domains/kubernetes.md + domains/cloud.md + domains/container.md
Personas: 
  CloudSecurityEngineer, SecurityArchitect, ThreatHunter
Output: 
  RBAC issues, network policy gaps, pod security, secrets management
```

---

## 📋 Standard Analysis Workflow

```
1. REQUEST ANALYSIS (5 min)
   What are we auditing?
   What's the scope?
   What's the context?

2. MODULE LOADING (0 min - automatic)
   Load: core/* + selected domains + threat models
   Personas: 2-4 perspectives
   Workflows: Discovery → Analysis → Validation → Review

3. DISCOVERY PHASE (15-20% of time)
   Asset inventory
   Surface mapping
   Environment understanding
   Risk scoping

4. MODELING PHASE (10-15% of time)
   Threat scenarios
   Attack vectors
   Entry points
   Impact paths

5. ANALYSIS PHASE (35-45% of time)
   Security issue identification
   Root cause analysis
   Multi-perspective examination
   Evidence collection

6. VALIDATION PHASE (10-20% of time)
   Testing
   Reproduction
   Verification
   Edge case exploration

7. CHALLENGE PHASE (10-15% of time)
   Evidence review
   False positive detection
   Adversarial review
   Severity recalibration

8. REPORTING PHASE (10-15% of time)
   Structured output
   Executive summary
   Remediation plan
   Next steps
```

---

## 🎭 Persona Quick Reference

| Persona | Analyzes | Questions |
|---------|----------|-----------|
| **SecurityResearcher** | Vulnerability mechanics | Why does this exist? How to exploit? |
| **AppSecEngineer** | Security design | Was this considered? Can user abuse? |
| **CloudEngineer** | Infrastructure | What IAM policy? Network segment? |
| **ThreatHunter** | Detection | How to detect? What's observable? |
| **SecurityArchitect** | System design | Architectural flaw? Systemic issue? |
| **IncidentResponder** | Response | What's the threat? How contain? |

---

## 💡 Common Finding Patterns

### High Confidence Finding
```
What: SQL injection in search parameter
Evidence: File: app/api/users.py:42-46, direct code inspection
Code: query = f"SELECT * FROM users WHERE id = {search_term}"
Test: Injection payload confirmed exfiltration
Confidence: HIGH (code + test proof)
```

### Medium Confidence Finding
```
What: Potential weak encryption algorithm
Evidence: Design review suggests use of MD5 in codebase
Challenge: "MD5 used where?" → Verify actual code
Confidence: MEDIUM (pattern match, not verified)
Remediation: Verify algorithm → upgrade if weak
```

### Low Confidence Finding (Avoid)
```
❌ WRONG: "Probably using weak passwords"
✅ RIGHT: Check actual password policy → "Min 8 chars, no complexity requirements"
```

---

## 🔍 Evidence Collection

### For Code Issues
```
✓ Exact file and line numbers
✓ Code snippet showing issue
✓ Context: how it's called, what data flows
✓ Test result: injection payload works
```

### For Configuration Issues
```
✓ Exact configuration location
✓ Setting and current value
✓ Expected/secure value
✓ Verification: tested access/behavior
```

### For Architectural Issues
```
✓ Diagram or description
✓ Trust boundary crossed
✓ What control missing
✓ Impact of compromise
```

---

## ⚖️ Confidence Rating Guide

### HIGH
```
✓ Direct evidence observed
✓ Code/config explicitly shows issue
✓ Tested and reproduced
✓ Multiple sources confirm
Example: SQL injection with test payload proof
```

### MEDIUM
```
✓ Pattern identified but not tested
✓ Design flaw in code review
✓ Similar vulnerability in comparable code
✓ One aspect verified, others assumed
Example: Authorization check pattern similar to known vuln
```

### LOW (Avoid unless necessary)
```
✓ Only theoretical risk
✓ No evidence collected
✓ Based on assumption
✓ Could work multiple ways
Example: "Probably vulnerable to X"
```

---

## 🎯 Review Checklist

Before finalizing any finding:

**Evidence Review**
- [ ] Location specified exactly (file:line or section)?
- [ ] Evidence content clearly shows issue?
- [ ] Context provided?
- [ ] Someone else could independently verify?

**Assumption Review**
- [ ] Assumptions listed?
- [ ] Alternative explanations considered?
- [ ] Compensating controls identified?

**Confidence Review**
- [ ] Evidence matches confidence level?
- [ ] Could be wrong? How?
- [ ] What would prove/disprove?

**Impact Review**
- [ ] Business impact clear?
- [ ] Data at risk quantified?
- [ ] Affected scope identified?

**Remediation Review**
- [ ] Fix is specific?
- [ ] Fix actually resolves issue?
- [ ] Verification method clear?

**Review Status**
- [ ] Marked for human review?
- [ ] Reviewer identified?
- [ ] Review notes added?

---

## 📊 Finding Template

```markdown
## Finding: [Title]

**Severity**: [Critical/High/Medium/Low]

**Evidence**: [Type: Code/Config/Log/Test/Architecture]
Location: [Exact path/section]
```
[Code or config excerpt]
```
Context: [Why this matters]

**Analysis**: 
- Security Researcher: [Mechanics]
- AppSec Engineer: [Design flaw]
- ThreatHunter: [Detection gap]

**Confidence**: [High/Medium/Low]
Reasoning: [Why this level]

**Attack Chain**: [Entry → Step1 → Step2 → Impact]

**Detection**: [How to detect this]

**Remediation**: 
1. Immediate: [Quick fix]
2. Short-term: [Proper fix]
3. Long-term: [Architecture improvement]

**Review**: [ ] Pending human verification
```

---

## 🚀 Tips & Tricks

### 1. Start with Discovery
Always understand what you're analyzing before diving into vulnerabilities.
- Asset inventory
- Trust boundaries
- Data flows
- Entry points

### 2. Build Complete Attack Chains
Never report isolated vulnerabilities.
```
❌ WRONG: "SQL injection found"
✅ RIGHT: "Attacker can query injection in search → retrieve user PII → 10k users affected"
```

### 3. Use Multiple Personas
Always get at least 3 perspectives:
- Technical (SecurityResearcher)
- Design (AppSecEngineer/SecurityArchitect)
- Detection (ThreatHunter)

### 4. Question Your Assumptions
Before every conclusion:
- What could make this wrong?
- What compensating control could exist?
- What alternative explanation?
- What would prove this?

### 5. Distinguish Fact from Theory
```
❌ "Security is weak"
✓ "Configuration allows: [specific detail]"
✓ "Test showed: [specific result]"
✓ "Code contains: [specific code]"
```

### 6. Document Verification
For each finding:
- What evidence would confirm?
- What evidence would refute?
- How would you test?

---

## 🎓 Example: SpringBoot Audit

```
SCOPE: SpringBoot REST API for social network

LOAD:
├── core/* (reasoning, evidence, review, output)
├── domains/code-audit.md
├── domains/web.md
├── threat-models/stride.md
└── personas: SecurityResearcher, AppSecEngineer, ThreatHunter

DISCOVER (20 min)
- REST API with 15 endpoints
- PostgreSQL database
- JWT authentication
- No WAF

MODEL (10 min)
- STRIDE analysis: Focus on authentication, authorization, injection

ANALYZE (40 min)
- SQL injection in search parameter
- JWT signature not validated
- Missing authorization checks on user data endpoints
- Hardcoded database password in config

VALIDATE (20 min)
- SQL injection confirmed via test injection
- JWT bypass tested
- Authorization bypass confirmed

CHALLENGE (10 min)
- All findings withstand adversarial review
- Confidence maintained (all HIGH)

REPORT (15 min)
- 4 findings reported
- Risk prioritized
- Remediation clear
```

---

## 🛑 Common Mistakes to Avoid

### Mistake 1: Assumption as Fact
```
❌ "Passwords are probably weak"
✓ Check actual policy: "Min 8 chars, alphanumeric required"
```

### Mistake 2: Isolated Vulnerabilities
```
❌ "Authentication bypass possible"
✓ "User can bypass auth via [specific steps] to access [specific data]"
```

### Mistake 3: Unverified Speculation
```
❌ "Could have encryption issue"
✓ "Cipher suite is: [actual algorithm], key size: [actual size]"
```

### Mistake 4: Missing Context
```
❌ "Weak password policy"
✓ "Min 8 chars (industry requires 12+), no MFA, no lockout"
```

### Mistake 5: Wrong Confidence
```
❌ HIGH confidence for "might be vulnerable"
✓ MEDIUM confidence for "pattern suggests" 
✓ HIGH confidence for "verified via test"
```

---

## 📞 Need Help?

- Read: ARCHITECTURE.md (how system works)
- Read: INDEX.md (complete module index)
- Read: core/identity.md (persona details)
- Read: core/evidence.md (evidence standards)
- Read: [domain-name].md (specific domain knowledge)

---

## ✅ Ready?

1. Choose your analysis type from top section
2. Load the indicated modules
3. Follow the standard workflow
4. Use this checklist as you go
5. Output structured findings
6. Mark all for human review

**Remember**: Security analysis is about certainty. When in doubt, gather more evidence.
