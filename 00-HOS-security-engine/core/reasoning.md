# Core: Reasoning Framework

**Purpose**: How to think about security problems systematically

**Size Target**: 250-350 lines
**Load Timing**: Always (Core)
**Token Cost**: Low

## Systematic Analysis Process

### 1. Assumption Surfacing

Before analyzing, identify:

**What are we assuming?**
- Component exists and works as described? → Verify
- Authentication enforced? → Check implementation
- Data is encrypted? → Verify algorithm and keys
- Access control evaluated? → Check authorization logic
- Logging captures this activity? → Examine logs
- Network segmentation exists? → Check firewall rules

**Assumption Validation**: Every assumption must be tested or flagged as unverified.

### 2. Evidence Hierarchy

```
TIER 1 (Direct Evidence - Use as-is)
├── Code inspection
├── Configuration files
├── Log records
├── Network traffic captures
├── Test execution results
└── Documentation/spec compliance

TIER 2 (Inferred Evidence - Requires reasoning)
├── Pattern matching with known issues
├── Architectural analysis
├── Design flaw identification
└── Logic evaluation

TIER 3 (Hypothetical - Mark as such)
├── "Similar systems likely have..."
├── "Typical configuration would..."
├── "If implemented naively..."
└── "Potential weak point..."
```

### 3. Attack Chain Thinking

**Never analyze vulnerabilities in isolation.**

Complete chain requires:
```
Entry Point (How attacker starts)
    ↓
    Step 1: [Action] → [Evidence it works]
    Step 2: [Action] → [Evidence it works]
    Step 3: [Action] → [Evidence it works]
    ↓
Business Impact (What attacker gains)
    ↓
Detection (Where chain is observable)
    ↓
Remediation (How to break chain)
```

Missing any step means the finding is **Probable** or **Hypothesis**, not **Confirmed**.

### 4. Causality vs. Correlation

**Identify causality chain**:
- A causes B? Or does B allow exploitation of A?
- Is weakness necessary or sufficient for exploitation?
- Are there compensating controls?

**Example**:
```
WEAK: "Weak password + no MFA = account takeover"
STRONG: "Weak password + no MFA + no rate limiting + no account lockout + admin role = account takeover"
```

### 5. Control Substitution

Ask: "Could another control prevent this?"

```
Finding: SQL injection in search
Assumed Control: Input validation missing
Alternative Controls:
  - Parameterized queries (better)
  - Web Application Firewall (partial)
  - Query complexity limits (partial)
  - Database user permissions (limited)

Classification: Root cause is missing parameterized queries
             Alternative controls are compensating only
```

---

## Reasoning Quality Checklist

### For Each Finding

- [ ] **Evidence provided**: Specific code line, config section, or test result?
- [ ] **Assumption listed**: What are we assuming about how this works?
- [ ] **Alternative explanations**: Could this be something else?
- [ ] **Attack chain complete**: Entry point → exploitation → impact → detection?
- [ ] **Control analysis**: What controls should prevent this?
- [ ] **Compensating controls**: Are there alternative controls?
- [ ] **Perspective diversity**: Analyzed from multiple viewpoints?
- [ ] **Confidence calibration**: Evidence matches confidence level?
- [ ] **Remediation clarity**: Clear how to fix this?
- [ ] **Review needed**: Flagged for human verification?

### Reasoning Errors to Avoid

| Error | Example | Fix |
|-------|---------|-----|
| **Assumption as fact** | "Obviously not encrypted" | Check actual encryption implementation |
| **One perspective** | Only code-based view | Add architecture, design, detection views |
| **Isolated vuln** | "SQL injection found" | Build complete attack chain |
| **Speculation** | "Probably weak passwords" | Check actual password policy |
| **Missing alternative** | "Input not validated" | Check all validation points |
| **Incomplete chain** | "Auth bypass possible" | Show exact exploitation steps with evidence |
| **Confidence mismatch** | High confidence, weak evidence | Adjust confidence to match evidence |

---

## Reasoning by Threat Category

### Authentication Issues

**Think through**:
1. What mechanisms prevent unauthorized access?
2. How are credentials handled?
3. What testing confirms mechanism works?
4. What happens if mechanism is absent?
5. What's the impact if credentials leak?

### Authorization Issues

**Think through**:
1. How are permissions defined?
2. When is authorization checked?
3. Where are checks evaluated?
4. Can user bypass checks?
5. What's impact of bypassing?

### Data Flow Issues

**Think through**:
1. Where does sensitive data originate?
2. How does it flow through system?
3. Where is it stored?
4. Who can access it?
5. Can it be intercepted?

### Architecture Issues

**Think through**:
1. What are trust boundaries?
2. Which boundaries can be crossed?
3. What happens if boundary crossed?
4. How to detect boundary crossing?
5. How to strengthen boundary?

---

## Logical Fallacies to Avoid

| Fallacy | Security Example | Correction |
|---------|-----------------|-----------|
| **Appeal to Authority** | "OWASP says..." without analysis | Explain WHY this applies here |
| **False Cause** | "Weak password → account takeover" | Show complete chain with evidence |
| **Hasty Generalization** | "No MFA seen, therefore no MFA" | Check all authentication methods |
| **Red Herring** | Focus on minor issue, miss critical | Prioritize by actual impact |
| **Begging the Question** | "It's vulnerable because it's not secure" | Provide specific evidence |
| **False Dilemma** | "Either fixed or broken" | Acknowledge partial mitigations |

---

## Depth vs. Breadth Decision

**When to go DEEP** (thorough analysis):
- Critical finding with business impact
- Complex attack chain
- Multiple compensating controls involved
- Requires architecture redesign
- Needed for remediation planning

**When to go BROAD** (quick assessment):
- Preliminary scoping
- Known issue classification
- Clear remediation
- Low impact
- Time constraints

**Document the choice**: "Shallow analysis due to scope" or "Deep analysis due to criticality"

