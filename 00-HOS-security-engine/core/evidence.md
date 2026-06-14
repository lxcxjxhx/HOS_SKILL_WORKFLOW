# Core: Evidence Standards

**Purpose**: How to prove conclusions with rigorous evidence

**Size Target**: 250-350 lines
**Load Timing**: Always (Core)
**Token Cost**: Low

## Evidence Requirements

### Every Conclusion Must Have

1. **Evidence Source**
   - Type: Code line, config section, log entry, test result, architecture diagram
   - Location: File path, line number, section, or URL
   - Date: When observed (for logs/tests)
   - Context: Surrounding information

2. **Evidence Content**
   - Actual code/config/log excerpt (truncated if > 5 lines)
   - Full context needed to understand issue
   - Unambiguous demonstration of the issue

3. **Evidence Quality**
   - Reproducibility: Can others independently verify?
   - Clarity: Does it clearly support the conclusion?
   - Completeness: Does it show all necessary parts?

---

## Evidence Types by Category

### Code-Based Evidence

```markdown
**Evidence**: SQL Injection in search parameter

**Location**: app/api/users.py, lines 42-46

**Content**:
```python
def search_users(search_term):
    query = f"SELECT * FROM users WHERE username LIKE '%{search_term}%'"
    return db.execute(query)
```

**Context**: No input validation on search_term parameter before building query

**Reproducibility**: Can submit arbitrary SQL in search_term parameter

**Proof**: Payload: `%' OR '1'='1` returns all users regardless of search term
```

### Configuration-Based Evidence

```markdown
**Evidence**: S3 bucket public read access

**Location**: AWS S3 bucket "company-data" bucket policy

**Content**:
```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::company-data/*"
}
```

**Context**: Public access allowed to all objects in production data bucket

**Reproducibility**: Any unauthenticated user can list and download all bucket contents

**Verification**: Successfully listed bucket without AWS credentials
```

### Log-Based Evidence

```markdown
**Evidence**: Failed authentication attempts not logged

**Location**: Application logs, 2024-06-14 10:00-12:00

**Content**: Searched logs for authentication failure patterns

**Finding**: 0 failed login attempts logged despite known failed attempts

**Context**: Application processes ~1000 logins/hour; no failed login events recorded

**Reproducibility**: Submit invalid credentials, check logs - no entry created

**Impact**: Brute force attacks undetectable in logs
```

### Architectural Evidence

```markdown
**Evidence**: Missing network segmentation between API and database

**Location**: Network diagram, AWS VPC configuration

**Content**:
- Database security group allows inbound from 0.0.0.0/0 on port 5432
- No VPC-only subnet for database
- No private endpoint restriction

**Context**: Compromised application instance = full database access

**Reproducibility**: Network connectivity test from compromised instance

**Impact**: Single point of failure between application and data layers
```

---

## Confidence Levels

### HIGH Confidence
**Criteria**:
- Direct code/config evidence observed
- Issue reproduced independently
- Test execution confirmed
- Log records show activity
- Multiple confirming sources

**Examples**:
- Code review: Direct injection point identified
- Config review: Public access policy verified
- Test: Exploitation attempt successful
- Logs: Attack activity recorded

### MEDIUM Confidence
**Criteria**:
- Pattern matches known vulnerability class
- Code review suggests issue (not tested)
- Similar configuration elsewhere
- Design review identifies flaw
- Partial evidence available

**Examples**:
- Similar vulnerable pattern found in comparable code
- Configuration follows known vulnerable template
- Design flaw identified but not dynamically verified
- Logs suggestive but not definitive

### LOW Confidence
**Criteria**:
- Speculation based on architecture
- Assumption about implementation
- Unverified pattern matching
- Theory not yet tested

**Examples**:
- "Probably using weak algorithm" (not verified)
- "Likely misconfigured" (not checked)
- "Probably vulnerable to X" (assumption)

---

## Evidence Gaps to Document

For each finding, explicitly state:

**What evidence would INCREASE confidence?**
- Dynamic testing of vulnerability
- Log analysis over time
- Configuration verification
- Source code review
- Environment inspection

**What evidence would DECREASE confidence?**
- Compensating controls found
- Exploitation fails in testing
- Logs show prevention
- Configuration verified secure
- Design contradicts assumption

**What evidence would REFUTE this finding?**
- Direct code/config showing prevention
- Test showing non-exploitability
- Logs showing successful defense
- Architecture diagram showing control

---

## Verification Planning

### For Code Issues

```markdown
To confirm SQL injection exists:
1. Identify exact parameter: search_term
2. Inject simple payload: ' OR '1'='1'--
3. Verify query returns all users
4. Try second-order injection: save payload, retrieve
5. Check for WAF/IDS blocking (if present)
```

### For Configuration Issues

```markdown
To confirm S3 public access:
1. Get bucket policy: aws s3api get-bucket-policy
2. Check public principal in policy
3. Test access without credentials: curl bucket URL
4. Verify files downloadable
```

### For Architectural Issues

```markdown
To confirm network segmentation missing:
1. Compromise application instance
2. Attempt database connection from app server
3. Verify connection succeeds without credentials
4. Check network ACLs/security groups
5. Trace data flow from app to database
```

---

## Common Evidence Mistakes

| Mistake | Wrong | Right |
|---------|-------|-------|
| **Assumption not tested** | "Obviously weak encryption" | Analyzed actual crypto code: AES-256 with 256-bit keys |
| **Unspecified location** | "Code has injection" | app/api/search.py:42-46 in search_users() function |
| **Missing context** | "No validation" | search_term parameter not validated before building SQL query |
| **Untested theory** | "Probably vulnerable" | Tested with payload X, got result Y confirming vulnerability |
| **Incomplete chain** | "SQL injection possible" | Injection → data leak; tested with SELECT * exfil, verified data retrieved |
| **Vague log evidence** | "Logs show attack" | Logs show 1000 requests/second on /login, 99% from single IP, 99% 401s |

---

## Evidence Organization

### For Findings Report

```
Finding: [Title]

**Evidence Confidence**: [High/Medium/Low]

**Direct Evidence**:
- Code: [Specific location and content]
- Config: [Specific configuration]
- Logs: [Specific pattern]

**Supporting Evidence**:
- Pattern analysis: [Similar issues]
- Architecture: [Design implications]
- Testing: [Reproduction steps]

**Evidence Gaps**:
- [What would increase confidence]
- [What would refute the finding]

**Verification Plan**:
1. [Test step]
2. [Test step]
3. [Verification success criteria]
```

---

## Reproducibility Standard

Every finding should answer:

**Can someone else independently verify this?**

- [ ] Code issue: Can someone read code at specified location and see problem?
- [ ] Config issue: Can someone access config and see setting?
- [ ] Logic issue: Can someone trace logic flow and identify flaw?
- [ ] Design issue: Can someone analyze architecture and see design flaw?
- [ ] Testing: Can someone run same test and reproduce?

If NO to any of these → Find additional evidence or downgrade confidence

