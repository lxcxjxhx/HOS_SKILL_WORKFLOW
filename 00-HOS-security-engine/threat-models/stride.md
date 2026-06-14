# Threat Model: STRIDE Framework

**Purpose**: Systematic threat analysis using STRIDE methodology

**Size Target**: 400-600 lines
**Load Timing**: On-demand (when threat modeling)
**Token Cost**: ~400 tokens

## Overview

STRIDE is a systematic approach to threat modeling developed by Microsoft. It provides a structured method to identify threats across six categories:

- **S**poofing Identity
- **T**ampering with Data
- **R**epudiation of Actions
- **I**nformation Disclosure
- **D**enial of Service
- **E**levation of Privilege

---

## S - Spoofing Identity

**Definition**: An attacker impersonates or poses as someone/something else

### Attack Scenarios

1. **User Spoofing**
   - Attack: Attacker logs in as legitimate user
   - Mechanism: Weak credentials, credential theft, session hijacking
   - Example: Brute force admin account

2. **Service Spoofing**
   - Attack: Attacker's service impersonates legitimate service
   - Mechanism: DNS spoofing, SSL certificate theft, ARP spoofing
   - Example: Attacker creates fake payment gateway

3. **Identity Provider Spoofing**
   - Attack: Fake SSO provider or OAUTH provider
   - Mechanism: Typosquatting domains, SSL interception
   - Example: oauth.attacker.com instead of oauth.legitimate.com

### Mitigation Controls

```
✓ Strong authentication (MFA, no passwords if possible)
✓ Certificate pinning
✓ DNS security (DNSSEC)
✓ TLS/SSL verification
✓ Identity provider validation
✓ Session token security (HTTPOnly, Secure, SameSite)
✓ Account lockout policies
✓ Audit logging of authentication
```

### Testing Questions

- [ ] Can user brute force credentials?
- [ ] Can session token be stolen/reused?
- [ ] Can service be impersonated?
- [ ] Can credentials be intercepted?
- [ ] Can account be taken over?
- [ ] Can identity be spoofed?

---

## T - Tampering with Data

**Definition**: An attacker modifies data in transit or at rest

### Attack Scenarios

1. **Data in Transit Tampering**
   - Attack: Modify data being transmitted
   - Mechanism: Man-in-the-middle, DNS poisoning
   - Example: Attacker intercepts bank transfer, changes amount

2. **Data at Rest Tampering**
   - Attack: Modify stored data
   - Mechanism: Database access, file system access
   - Example: Attacker changes user balance in database

3. **Log Tampering**
   - Attack: Delete or modify audit logs
   - Mechanism: Database access, direct file access
   - Example: Attacker removes evidence of malicious activity

4. **Code Tampering**
   - Attack: Modify application code or configuration
   - Mechanism: Source code access, CI/CD compromise
   - Example: Attacker injects malicious code into build

### Mitigation Controls

```
✓ TLS/SSL for data in transit
✓ Encryption at rest
✓ Data integrity checks (HMAC, digital signatures)
✓ File permissions and access controls
✓ Log integrity protection (append-only logs)
✓ Code signing and verification
✓ Input validation (prevents injection)
✓ Change detection systems
```

### Testing Questions

- [ ] Can data be modified in transit?
- [ ] Can data be modified at rest?
- [ ] Can logs be modified?
- [ ] Can configuration be changed?
- [ ] Can integrity be verified?
- [ ] Can changes be detected?

---

## R - Repudiation of Actions

**Definition**: An attacker denies they performed an action, or performs action and claims innocence

### Attack Scenarios

1. **Transaction Repudiation**
   - Attack: User claims they didn't make a purchase
   - Mechanism: Non-repudiation not implemented
   - Example: Customer denies online purchase

2. **Action Repudiation**
   - Attack: Admin claims they didn't delete data
   - Mechanism: No audit trail
   - Example: Malicious admin deletes logs then claims innocence

3. **Absence of Evidence**
   - Attack: No logs of attack occurring
   - Mechanism: Insufficient logging
   - Example: SQL injection occurs, no query logs

### Mitigation Controls

```
✓ Comprehensive audit logging
✓ Non-repudiation mechanisms (digital signatures)
✓ Immutable audit logs
✓ Centralized log aggregation
✓ Log monitoring and alerting
✓ User action logging with timestamps
✓ Digital signatures for critical actions
✓ Tamper detection for logs
```

### Testing Questions

- [ ] Can actions be attributed to specific users?
- [ ] Are actions logged?
- [ ] Can logs be modified/deleted?
- [ ] Is there proof of transaction?
- [ ] Can user deny participation?
- [ ] Can user deny knowledge of action?

---

## I - Information Disclosure

**Definition**: An attacker gains access to confidential information

### Attack Scenarios

1. **Sensitive Data Exposure**
   - Attack: Attacker accesses user PII, passwords, credit cards
   - Mechanism: Broken access control, insecure storage
   - Example: Attacker reads all customer data via BOLA

2. **Source Code Exposure**
   - Attack: Attacker obtains proprietary code
   - Mechanism: Git repository exposure, leaked credentials
   - Example: .git directory publicly accessible

3. **Configuration Exposure**
   - Attack: Attacker obtains secrets in configuration
   - Mechanism: Cloud storage misconfiguration, version control
   - Example: AWS credentials in S3 bucket

4. **Traffic Analysis**
   - Attack: Attacker infers information from encrypted traffic
   - Mechanism: Timing, size analysis
   - Example: Infer user location from HTTP request patterns

### Mitigation Controls

```
✓ Encryption at rest
✓ Encryption in transit (TLS)
✓ Access control (RBAC, ABAC)
✓ Data classification and handling
✓ Secret management (no hardcoded secrets)
✓ Secure configuration
✓ Version control protection (.git not accessible)
✓ Minimal API responses (only necessary fields)
✓ Error message sanitization
```

### Testing Questions

- [ ] Can attacker access sensitive data?
- [ ] Is sensitive data encrypted?
- [ ] Can attacker infer information from traffic?
- [ ] Are secrets hardcoded?
- [ ] Is source code accessible?
- [ ] Are error messages revealing?

---

## D - Denial of Service

**Definition**: An attacker prevents legitimate users from accessing the system

### Attack Scenarios

1. **Resource Exhaustion**
   - Attack: Consume all available resources
   - Mechanism: Unbounded loops, memory leaks, connection exhaustion
   - Example: Send 1M requests to server per second

2. **Logic Bombs**
   - Attack: Trigger expensive operations
   - Mechanism: Crafted input that triggers computation
   - Example: Complex regex that causes ReDoS

3. **Network Flooding**
   - Attack: Flood network with traffic
   - Mechanism: DDoS amplification, UDP floods
   - Example: Botnet sends packets faster than server can handle

4. **Service Crash**
   - Attack: Crash the service
   - Mechanism: Null pointer dereference, integer overflow
   - Example: Malformed input causes segmentation fault

### Mitigation Controls

```
✓ Rate limiting
✓ Input validation (prevent resource exhaustion)
✓ Resource limits (CPU, memory, connections)
✓ Query complexity limits
✓ Timeout enforcement
✓ DDoS protection services
✓ Load balancing
✓ Circuit breakers
✓ Graceful degradation
```

### Testing Questions

- [ ] Can service be crashed?
- [ ] Can resources be exhausted?
- [ ] Can DoS be triggered with specific input?
- [ ] Is rate limiting enforced?
- [ ] Are resource limits set?
- [ ] Can attacker cause outage?

---

## E - Elevation of Privilege

**Definition**: An attacker gains higher privileges than authorized

### Attack Scenarios

1. **Vertical Privilege Escalation**
   - Attack: Regular user becomes admin
   - Mechanism: Authorization bypass, logic flaw
   - Example: Non-admin user accesses /admin endpoint

2. **Horizontal Privilege Escalation**
   - Attack: User A accesses User B's resources
   - Mechanism: BOLA, missing authorization checks
   - Example: User 1 can view User 2's profile

3. **Cross-Level Privilege Escalation**
   - Attack: Compromise guest account, escalate to admin
   - Mechanism: Chained vulnerabilities
   - Example: SQLi to RCE to OS shell

4. **Role-Based Escalation**
   - Attack: User assumes role they shouldn't have
   - Mechanism: Role assignment bypass, JWT tampering
   - Example: Attacker adds themselves to admin group

### Mitigation Controls

```
✓ Principle of least privilege
✓ Strong access control
✓ Role-based access control (RBAC)
✓ Separation of duties
✓ Privilege boundary enforcement
✓ Session security
✓ Token validation
✓ Authorization checks (before data access)
✓ Audit logging of privilege changes
```

### Testing Questions

- [ ] Can user perform admin operations?
- [ ] Can user escalate privileges?
- [ ] Can user modify their role?
- [ ] Can user access other users' data?
- [ ] Are privilege changes audited?
- [ ] Can privileges be temporarily elevated?

---

## STRIDE Analysis Worksheet

For each component/flow, ask:

### Component: [Name]

**Spoofing**:
- Can identity be spoofed?
- Is authentication strong?

**Tampering**:
- Can data be modified?
- Are changes detected?

**Repudiation**:
- Are actions audited?
- Can attacker deny actions?

**Information Disclosure**:
- Can data be accessed?
- Is sensitive data protected?

**Denial of Service**:
- Can resources be exhausted?
- Are limits enforced?

**Elevation of Privilege**:
- Can privileges be escalated?
- Are permissions checked?

---

## STRIDE Application Workflow

```
1. DEFINE boundary
   What are we analyzing?
   System components?
   Trust boundaries?

2. IDENTIFY assets
   What data/functions to protect?
   What's most valuable?

3. APPLY STRIDE to each component
   Spoofing Identity?
   Tampering with Data?
   Repudiation?
   Information Disclosure?
   Denial of Service?
   Elevation of Privilege?

4. IDENTIFY mitigations
   What controls prevent each threat?
   What controls are missing?

5. PRIORITIZE by risk
   Likelihood × Impact
   Effort to exploit?

6. DOCUMENT threats
   One threat per finding
   Attack scenario
   Impact
   Mitigation
```

---

## STRIDE Priority Matrix

| Threat | Likelihood | Impact | Priority |
|--------|-----------|--------|----------|
| **Spoofing** | High if weak auth | Critical | CRITICAL |
| **Tampering** | Medium if no encryption | High | HIGH |
| **Repudiation** | High if no logs | Medium | MEDIUM |
| **Info Disclosure** | High if public API | Critical | CRITICAL |
| **DoS** | Medium | High | HIGH |
| **Privilege Escalation** | High if flawed access control | Critical | CRITICAL |

---

## Output: STRIDE Threat List

```markdown
## System: [Name]

### S - Spoofing Identity Threats
- Threat 1: [Description]
  Likelihood: [Low/Medium/High]
  Impact: [Low/Medium/High/Critical]
  Mitigation: [Control needed]

- Threat 2: [Description]
  ...

### T - Tampering with Data Threats
- Threat 1: [Description]
  ...

### R - Repudiation of Actions Threats
- Threat 1: [Description]
  ...

### I - Information Disclosure Threats
- Threat 1: [Description]
  ...

### D - Denial of Service Threats
- Threat 1: [Description]
  ...

### E - Elevation of Privilege Threats
- Threat 1: [Description]
  ...

### Risk Summary
- Critical: N threats
- High: N threats
- Medium: N threats
- Low: N threats
```

---

## Real Example: Web API STRIDE Analysis

```
System: REST API for E-Commerce

SPOOFING IDENTITY
├─ Threat: Account takeover via weak password
│  └─ Mitigation: Enforce strong passwords, MFA
├─ Threat: API key compromise
│  └─ Mitigation: Rotate keys, monitor usage
└─ Threat: Session hijacking
   └─ Mitigation: HTTPOnly cookies, HTTPS

TAMPERING
├─ Threat: Order amount tampered during transit
│  └─ Mitigation: TLS/SSL for all traffic
├─ Threat: Database records modified
│  └─ Mitigation: Access control, encryption
└─ Threat: Logs deleted by attacker
   └─ Mitigation: Append-only logs, centralized storage

REPUDIATION
├─ Threat: User denies order placement
│  └─ Mitigation: Digital signature, order confirmation
└─ Threat: Admin denies data deletion
   └─ Mitigation: Audit logs, immutable records

INFORMATION DISCLOSURE
├─ Threat: Customer data leaked
│  └─ Mitigation: RBAC, data minimization
├─ Threat: Credit cards exposed
│  └─ Mitigation: PCI DSS compliance, tokenization
└─ Threat: API structure enumerable
   └─ Mitigation: Disable introspection, rate limit

DENIAL OF SERVICE
├─ Threat: Bulk order creation exhausts system
│  └─ Mitigation: Rate limiting, quota enforcement
└─ Threat: Complex search DoS
   └─ Mitigation: Query limits, timeout enforcement

ELEVATION OF PRIVILEGE
├─ Threat: Regular user accesses admin endpoint
│  └─ Mitigation: Authorization checks per endpoint
└─ Threat: User modifies another user's order
   └─ Mitigation: Authorization checks per object
```

