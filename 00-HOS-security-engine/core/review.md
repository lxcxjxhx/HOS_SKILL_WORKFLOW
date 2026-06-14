# Core: Review & Challenge Framework

**Purpose**: How to challenge conclusions and prevent false positives

**Size Target**: 250-350 lines
**Load Timing**: Always (Core)
**Token Cost**: Low

## Review Stages

### Stage 1: Self-Challenge

Before concluding an issue exists, ask:

**Counter-Evidence Questions**:
1. What could make this NOT a vulnerability?
2. What compensating controls exist?
3. What assumptions could be wrong?
4. What alternative explanations fit the evidence?
5. What would refute this finding?

**Example**:
```
Finding: No HTTPS
Counter-Challenge: Is this application internal-only? Is it behind WAF?
Result: If internal-only on trusted network, severity drops from High to Medium
```

### Stage 2: Perspective-Based Challenges

Different perspectives challenge differently:

**Security Researcher Challenge**:
- "Is this actually exploitable?"
- "Are there mitigating factors?"
- "Can this be chained into impact?"

**AppSec Engineer Challenge**:
- "Is this by design or oversight?"
- "Are there business logic constraints?"
- "Is this protected at application level?"

**Cloud Security Challenge**:
- "What IAM policy enables this?"
- "Are network controls in place?"
- "Is this properly encrypted?"

**Threat Hunter Challenge**:
- "Would this be detectable?"
- "Do we have logs of this?"
- "What's the forensic trail?"

**Security Architect Challenge**:
- "Is this an architectural problem?"
- "Do we need to redesign?"
- "What's the systemic risk?"

### Stage 3: False Positive Detection

Ask specifically:

1. **Compensating Control**: Does another control mitigate this?
2. **Context**: Is this only problematic in specific scenarios?
3. **Assumption**: Are we assuming worst-case configuration?
4. **Scope**: Does this apply to target assets?
5. **Impact**: Is actual business impact plausible?

---

## False Positive Patterns

### Pattern 1: Assumption Over Reality

```
FALSE: "No HTTPS found → MitM vulnerability"
REALITY: Check if application is:
  - Internal-only (no external traffic)
  - Behind API gateway with TLS
  - Protected by network security
  - In trusted network boundary

VERIFICATION: Confirm actual threat model applies
```

### Pattern 2: Theoretical vs. Practical

```
FALSE: "Weak password accepted → Account takeover"
REALITY: Check for:
  - Account lockout after N attempts
  - Rate limiting on auth endpoint
  - MFA required despite weak password
  - Admin audit logs of all logins

VERIFICATION: Complete attack chain from password to unauthorized access
```

### Pattern 3: Missing Context

```
FALSE: "Database publicly accessible"
REALITY: Check:
  - Is this development/staging environment?
  - Are there firewall rules blocking access?
  - Is this test data or production?
  - Are there audit logs of access?

VERIFICATION: Scope the actual risk to production/sensitive data
```

### Pattern 4: Unproven Assumption

```
FALSE: "Probably using weak encryption"
REALITY: Check actual implementation:
  - What cipher suite?
  - What key length?
  - How are keys managed?
  - Has it been audited?

VERIFICATION: Test or code review, not assumption
```

---

## Confidence Recalibration

After challenge phase, recalibrate confidence:

```
Initial Assessment: High Confidence - Clear SQLi vulnerability

Challenge Questions:
Q1: Is input actually unsanitized? ✓ Confirmed in code
Q2: Can attacker reach this code path? ✓ Yes, public API
Q3: Is there WAF protection? ✗ No WAF deployed
Q4: Can exploitation succeed in testing? ✓ Yes, exfiltrated data
Q5: Would this be detected? ✗ No application logging of queries
Q6: Any compensating control? ✗ None identified

Recalibrated: HIGH CONFIDENCE (no challenges sustained)

---

Initial Assessment: Medium Confidence - Missing network segmentation

Challenge Questions:
Q1: Is database actually public? ✓ Security group allows 0.0.0.0
Q2: Is this on internet-facing? ✗ Database in private subnet
Q3: Can app compromise lead to access? ✓ Compromise app → access DB
Q4: Probability of app compromise? ✗ App security excellent
Q5: Any network ACL restriction? ✗ None
Q6: Is this likely in practice? ✗ Unlikely given app security

Recalibrated: MEDIUM CONFIDENCE (practical risk lower than technical risk)
```

---

## Severity Adjustment

After challenge, adjust severity based on:

| Factor | Impact | Example |
|--------|--------|---------|
| **Exploitability** | Easy → High, Hard → Low | SQLi with test result proof → exploitable |
| **Discoverability** | Public → High, Hidden → Low | Public API endpoint → discoverable |
| **Impact** | Data loss → Critical, Cosmetic → Low | User data leak → high impact |
| **Prevalence** | Widespread → High, Rare → Low | Common misconfig → prevalent |
| **Detectability** | Unlogged → High risk, Logged → Lower | No login logging → high risk |
| **Remediability** | Hard fix → High, Easy fix → Medium | Needs redesign → harder remediation |

---

## False Negative Prevention

Ask the opposite question:

**What if we're WRONG about this being secure?**

```
Assumption: "Input validation works"
False Negative Risk: What if validation is bypassable?
  → Check for encoding bypasses: %00, Unicode, double encoding
  → Test with known bypass techniques
  → Review validation logic for edge cases

Assumption: "Authentication is enforced"
False Negative Risk: What if there's bypass path?
  → Check for unauthenticated endpoints
  → Test with direct object references
  → Review session management

Assumption: "Encryption is implemented"
False Negative Risk: What if it's weak?
  → Verify algorithm and key length
  → Check random number generation
  → Verify key management
```

---

## Review Checklist

For each finding, before finalizing:

**Evidence Review**
- [ ] Evidence location specified exactly
- [ ] Content shows the issue clearly
- [ ] Context provided
- [ ] Independently reproducible

**Assumption Review**
- [ ] Assumptions listed
- [ ] Assumptions challenged
- [ ] Counter-evidence sought
- [ ] Compensating controls checked

**Perspective Review**
- [ ] Multiple perspectives applied
- [ ] Contradictions documented
- [ ] Reconciliation provided
- [ ] Consensus on severity

**Confidence Review**
- [ ] Evidence matches confidence level
- [ ] False positive patterns checked
- [ ] Recalibration completed
- [ ] Uncertainty acknowledged

**Attack Chain Review**
- [ ] Complete chain provided
- [ ] Each step evidenced
- [ ] Practical exploitability verified
- [ ] Business impact clear

**Remediation Review**
- [ ] Specific fix proposed
- [ ] Fix actually resolves issue
- [ ] No secondary issues created
- [ ] Verification method clear

---

## Reviewer Assignments

### Evidence Reviewer
**Checks**:
- Is evidence sufficient?
- Is location specified?
- Is context clear?
- Can it be independently verified?

**Questions**: "Would a junior engineer see the issue from this evidence?"

### Adversarial Reviewer
**Checks**:
- Could this be something else?
- What mitigates this?
- What compensating controls exist?
- Is this really exploitable?

**Questions**: "What's the strongest counterargument?"

### False Positive Reviewer
**Checks**:
- Is this a known false positive pattern?
- Are we assuming worst-case?
- Is context missing?
- Is this actually in scope?

**Questions**: "Is this a real finding or a theory?"

### Architecture Reviewer
**Checks**:
- Is this a design flaw?
- What's the systemic implication?
- Does this need architectural fix?
- Is this part of larger pattern?

**Questions**: "Does this indicate we need to redesign this component?"

