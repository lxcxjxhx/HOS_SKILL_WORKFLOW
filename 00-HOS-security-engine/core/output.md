# Core: Output & Communication

**Purpose**: How to communicate findings clearly and consistently

**Size Target**: 200-300 lines
**Load Timing**: Always (Core)
**Token Cost**: Low

## Finding Report Structure

Every finding follows this structure:

```markdown
## [Finding ID]: [Clear Vulnerability Title]

### Summary
[One sentence describing the issue]

### Severity
- **CVSS v3.1**: [If applicable, e.g., 8.6 High]
- **Business Impact**: [What could attacker do]
- **Data Impact**: [What data at risk]
- **Scope**: [How many users/systems/data]

### Evidence
**Type**: [Code/Config/Log/Architecture/Test]
**Location**: [Exact file:line or section]
**Content**:
```[format]
[Actual evidence]
```
**Context**: [Surrounding information for clarity]

### Analysis

**From Security Researcher Perspective**:
[Exploitation mechanics, proof-of-concept]

**From Application Security Perspective**:
[Design flaw, control bypass, business logic]

**From Cloud Security Perspective** *(if applicable)*:
[IAM/network/secrets/container implications]

**From Threat Hunter Perspective**:
[Detectability, forensic trail, indicators]

**From Security Architect Perspective** *(if applicable)*:
[Architectural implications, design fix needed]

**From Incident Responder Perspective** *(if critical)*:
[Immediate response, containment, forensics]

### Confidence Assessment
**Level**: [Confirmed/Probable/Hypothesis]
**Reasoning**: [Why this confidence level]
**Evidence Quality**: [What supports this level]
**Missing Evidence**: [What would increase confidence]
**False Positive Risk**: [What could prove wrong]

### Attack Chain
*Complete chain from attacker entry to business impact*

**Entry Point**: [How attacker initiates]
**Prerequisites**: [What must be true]

**Step 1**: [Action] → [Evidence it works]
**Step 2**: [Action] → [Evidence it works]
...
**Step N**: [Business Impact]

**Detection Gaps**: [Where chain isn't observable]
**Difficulty Rating**: [Low/Medium/High/Extreme]

### Potential Impact
**If Exploited**:
- Data loss: [Specifics]
- Service disruption: [Duration/scope]
- Regulatory violation: [Which regulations]
- Reputational harm: [Type of harm]
- Financial impact: [Quantified if possible]

### Verification Required
**To Confirm**: [What would definitively prove this]
**Testing Method**: [How to test]
**Prerequisites**: [Access/tools/environment needed]
**Success Criteria**: [What proves the issue]

### Detection Recommendations

**Log-Based Detection**:
- **Event**: [What to look for]
- **Pattern**: [Specific search query]
- **Tool**: [Splunk/ELK/etc]

**Network-Based Detection**:
- **Traffic Pattern**: [Signature]
- **Indicators**: [Specific IPs/ports/protocols]
- **Tool**: [IDS/IPS/NDR]

**Behavioral Detection**:
- **Anomaly**: [Abnormal pattern]
- **Baseline**: [Normal pattern]
- **Tool**: [UEBA/SIEM]

### Remediation

**Immediate** *(24 hours for Critical)*:
- **Action**: [Specific step]
- **Verification**: [How to verify fix works]

**Short-term** *(1-2 weeks)*:
- **Action**: [Specific step]
- **Implementation**: [How to do it]
- **Testing**: [Verification approach]

**Long-term** *(1-3 months)*:
- **Architecture Change**: [Fundamental redesign]
- **Implementation**: [Technical approach]
- **Timeline**: [Effort estimate]

### Human Review Status
- [ ] **Evidence Verified**: Reviewer confirmed evidence
- [ ] **False Positive Checked**: Reviewed for false positive patterns
- [ ] **Severity Agreed**: Confirmed severity assessment
- [ ] **Remediation Feasible**: Confirmed fix is implementable
- **Reviewer**: [Name/Role]
- **Review Date**: [Date]
- **Review Notes**: [Any additional context]

---

## Severity Rating System

### Critical (CVSS 9.0+)
- Complete system compromise
- All user data compromised
- Service completely unavailable
- Requires immediate action

### High (CVSS 7.0-8.9)
- Significant data compromise
- Authentication bypass
- Privilege escalation to admin
- Service disruption possible

### Medium (CVSS 4.0-6.9)
- Limited data access
- Requires specific conditions
- Partial functionality impact
- Can be mitigated

### Low (CVSS 0.1-3.9)
- Theoretical issue
- Requires multiple conditions
- Minimal impact
- Low urgency

---

## Communication Principles

### 1. Clarity Over Jargon
**Avoid**: "A TOCTOU race condition in the authentication token validation mechanism"
**Use**: "A brief window exists between checking and using the token where it could be revoked"

### 2. Specificity Over Generality
**Avoid**: "Input validation issues found"
**Use**: "Search parameter not validated before SQL query, enabling SQLi"

### 3. Evidence Over Assertion
**Avoid**: "This is probably vulnerable"
**Use**: "File shows direct injection point at line 42; test payload confirmed exfiltration"

### 4. Business Impact Over Technical Detail
**Avoid**: "SQL injection found"
**Use**: "SQL injection allows attacker to read all user email addresses and phone numbers"

### 5. Actionable Over Hypothetical
**Avoid**: "Could potentially be misused"
**Use**: "Attacker can X to achieve Y, confirmed by Z test"

---

## Executive Summary Template

```markdown
## Security Assessment Summary

**Assessment Date**: [Date]
**System**: [Name]
**Scope**: [What was reviewed]
**Overall Risk**: [Critical/High/Medium/Low]

### Key Findings
- [Finding 1]: [Impact]
- [Finding 2]: [Impact]
- [Finding 3]: [Impact]

### Immediate Actions Required
1. [Critical fix 1]
2. [Critical fix 2]

### Risk Metrics
- Critical findings: [N]
- High findings: [N]
- Medium findings: [N]
- Low findings: [N]
- Total findings: [N]

### Verification Status
- Confirmed findings: [%]
- Probable findings: [%]
- Hypothesis findings: [%]

### Next Steps
1. [Remediation priority 1]
2. [Follow-up assessment]
3. [Long-term improvement]
```

---

## Evidence Format Standards

### Code Evidence
```markdown
File: [path]
Lines: [start-end]
```python
[code excerpt, max 10 lines]
```
Issue: [What's wrong]
```

### Configuration Evidence
```markdown
File: [path]
Section: [relevant section]
```yaml
[config excerpt, max 5 lines]
```
Issue: [What's wrong]
```

### Log Evidence
```markdown
Log Source: [system]
Time Range: [start-end]
Pattern: [search query]
Results: [N matches]
Sample:
```
[log lines, max 5]
```
Issue: [What's wrong]
```

### Test Evidence
```markdown
Test: [description]
Tool: [tool used]
Command: [command executed]
Result: [output or description]
Conclusion: [What this proves]
```

---

## Output Checklist

Before finalizing any report:

- [ ] All findings have evidence
- [ ] Evidence locations specified exactly
- [ ] All critical findings have attack chains
- [ ] Multiple perspectives included
- [ ] Confidence levels calibrated to evidence
- [ ] False positive checks documented
- [ ] Remediations are specific and actionable
- [ ] Human review required for all findings
- [ ] Executive summary provided
- [ ] Next steps clearly stated

