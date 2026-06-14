# Security Engine - Module Status & Examples

## 📊 Implementation Status

### Core Engine (100% Complete)
```
✅ identity.md         - 6 personas with detailed perspectives
✅ reasoning.md        - Systematic analysis framework  
✅ evidence.md         - Evidence hierarchy and standards
✅ review.md           - Challenge and false positive detection
✅ output.md           - Communication and reporting standards
```

### Domains (40% Complete)
```
✅ code-audit.md       - Source code analysis checklist
✅ cloud.md            - Cloud infrastructure (AWS/Azure/GCP/etc)
🔄 web.md              - Web application (70% - in editing)
🔄 api.md              - REST/GraphQL/gRPC (70% - in editing)
⏳ supply-chain.md     - Dependencies & build (50% - started)
⏳ container.md        - Docker/OCI containers (30% - outline)
⏳ kubernetes.md       - K8s platform (30% - outline)
⏳ mobile.md           - Mobile apps (10% - outline)
⏳ ai.md               - AI/ML security (10% - outline)
```

### Threat Models (60% Complete)
```
✅ stride.md           - STRIDE methodology
✅ attack-tree.md      - Attack tree analysis
🔄 kill-chain.md       - Cyber kill chain (80% - drafting)
🔄 attack-path.md      - Attack path simulation (70% - drafting)
⏳ mitre.md            - MITRE ATT&CK mapping (30% - outline)
```

### Personas (50% Complete)
```
✅ security-researcher.md      - Vulnerability mechanics
🔄 appsec-engineer.md          - Security design (80% - drafting)
🔄 cloud-engineer.md           - Infrastructure (70% - drafting)
🔄 threat-hunter.md            - Detection (70% - drafting)
⏳ security-architect.md        - System design (30% - outline)
⏳ incident-responder.md        - Incident response (10% - outline)
```

### Reviewers (70% Complete)
```
✅ evidence-review.md          - Evidence validation
✅ adversarial-review.md       - Challenge conclusions
🔄 false-positive-review.md    - FP detection (80% - drafting)
🔄 architecture-review.md      - Design implications (70% - drafting)
```

### Routing System (90% Complete)
```
✅ skill-loader.md     - Module loading logic
🔄 context-optimizer.md - Token management (90% - final)
```

### Workflows (30% Complete)
```
⏳ discover.md         - Asset discovery (30% - outline)
⏳ model.md            - Threat modeling (20% - outline)
⏳ analyze.md          - Security analysis (20% - outline)
⏳ validate.md         - Testing/validation (20% - outline)
⏳ challenge.md        - Review process (20% - outline)
⏳ report.md           - Report generation (20% - outline)
⏳ dispatcher.md       - Workflow orchestration (10% - outline)
```

### Templates (20% Complete)
```
⏳ finding.md          - Finding template (20% - outline)
⏳ report.md           - Executive report (20% - outline)
⏳ threat-model.md     - Threat model output (10% - outline)
⏳ architecture-review.md - Architecture template (10% - outline)
⏳ risk-analysis.md    - Risk matrix (10% - outline)
```

**Overall**: ~45% complete, core components solid, domains and workflows in progress

---

## 🎯 Example 1: SpringBoot Code Audit

### Request
```
"Audit SpringBoot REST API for security issues. 
 GitHub: https://github.com/example/api
 Scope: Authentication, authorization, data handling"
```

### Module Loading
```
LOAD:
├── core/identity.md        ✓ Load
├── core/reasoning.md       ✓ Load
├── core/evidence.md        ✓ Load
├── core/review.md          ✓ Load
├── core/output.md          ✓ Load
├── domains/code-audit.md   ✓ Load
├── domains/web.md          ✓ Load (since REST API)
├── threat-models/stride.md ✓ Load
├── threat-models/attack-tree.md ✓ Load
├── personas/security-researcher.md ✓ Load
├── personas/appsec-engineer.md ✓ Load
└── personas/threat-hunter.md ✓ Load

PERSONAS ACTIVE:
- SecurityResearcher (primary)
- AppSecEngineer (secondary)
- ThreatHunter (tertiary)

APPROX TOKEN LOAD: ~4.5k
```

### Analysis Flow

**Phase 1: Discovery (20 min)**
```
1. Repository structure analysis
   - Authentication: JWT in src/auth/JwtProvider.java
   - Authorization: Missing in service layer
   - Database: PostgreSQL, passwords in application.properties
   - API: 12 REST endpoints, no versioning
   
2. Risk assessment
   - High: Authentication implementation
   - High: Authorization enforcement
   - Medium: Data handling in responses
   - Medium: Dependencies in pom.xml
```

**Phase 2: Modeling (10 min)**
```
STRIDE Analysis:
- Spoofing: JWT validation strength?
- Tampering: Data integrity protection?
- Repudiation: Audit logging?
- Information Disclosure: Data exposure?
- Denial of Service: Rate limiting?
- Elevation of Privilege: Authorization checks?

Attack Tree:
    Root: Unauthorized Data Access
    ├── Bypass JWT validation
    │   ├── Weak secret key?
    │   ├── No signature validation?
    │   └── Token reuse?
    ├── BOLA vulnerability
    │   ├── Direct object reference?
    │   └── No ownership check?
    └── SQL injection
        └── Input in query?
```

**Phase 3: Analysis (40 min)**
```
Finding 1: Weak JWT Configuration
├── Location: src/auth/JwtProvider.java:23
├── Code: "new JWTVerifier(secret).verify(token)"
├── Issue: Secret is 16 characters (weak)
├── Evidence: 
│   - Code shows short secret
│   - No algorithm specification (defaults to weak)
│   - Test: Token with modified payload accepted
├── Perspectives:
│   - SecurityResearcher: "Standard JWT bypass via weak secret"
│   - AppSecEngineer: "Design assumes strong secret, config weak"
│   - ThreatHunter: "No JWT signature failures in logs"
└── Confidence: HIGH

Finding 2: Broken Object Level Authorization (BOLA)
├── Location: src/api/UserController.java:45
├── Code: "@GetMapping("/users/{id}") ... User getUser(@PathVariable int id)"
├── Issue: No ownership check, any user can access any user record
├── Evidence:
│   - Code shows no authorization check
│   - Test: Access other user's data via direct ID
│   - User A (id=1) can fetch User B (id=2) profile
├── Impact: All user data exposed
├── Confidence: HIGH

Finding 3: SQL Injection in Search
├── Location: src/api/SearchController.java:32
├── Code: String query = "SELECT * FROM items WHERE name LIKE '%" + searchTerm + "%'"
├── Issue: Direct query concatenation, no parameterization
├── Evidence:
│   - Code shows string concatenation
│   - Test: Payload ' OR '1'='1' returns all items
├── Confidence: HIGH

Finding 4: Hardcoded Database Credentials
├── Location: src/resources/application.properties:15
├── Content: spring.datasource.password=SuperSecret123
├── Issue: Password exposed in source code
├── Evidence:
│   - Git history contains password
│   - Can be read by any user with repo access
│   - Password has been there for months
├── Confidence: HIGH
```

**Phase 4: Validation (20 min)**
```
Test Results:
✓ JWT bypass: Tested with weak secret, confirmed
✓ BOLA: Accessed other user's data, confirmed
✓ SQLi: Exfiltrated data via injection, confirmed
✓ Hardcoded creds: Located in git, confirmed

All findings validated and reproducible
```

**Phase 5: Challenge (10 min)**
```
Evidence Review:
✓ All locations specified
✓ All code shown
✓ All tests reproducible
✓ No compensating controls found

Adversarial Review:
✓ Could JWT be used correctly? Not as configured
✓ Could there be authorization? Code shows none
✓ Could injection be prevented? No parameterization
✓ Could credentials be managed? No - in plaintext

False Positive Review:
✓ Not theoretical issues - all reproduced
✓ Not context-dependent - all universal vulnerabilities
✓ Not assumption-based - all code-based evidence

Confidence maintained: All HIGH
```

**Phase 6: Report (15 min)**
```
SECURITY ASSESSMENT REPORT

Target: Example API (SpringBoot)
Date: 2024-06-14
Confidence: All findings HIGH confidence

CRITICAL FINDINGS: 4

1. BROKEN AUTHENTICATION (JWT Weak Secret)
   Severity: CRITICAL
   Impact: Any attacker can forge valid tokens
   Remediation: Use 256-byte random secret, RS256 algorithm

2. BROKEN AUTHORIZATION (BOLA)
   Severity: CRITICAL
   Impact: All user data exposed
   Remediation: Add ownership check before data access

3. SQL INJECTION (Search)
   Severity: CRITICAL
   Impact: Full database compromise
   Remediation: Use prepared statements for all queries

4. HARDCODED SECRETS (Credentials)
   Severity: CRITICAL
   Impact: Database compromise, reputation damage
   Remediation: Move to secrets manager, remove from git history

OVERALL RISK: CRITICAL
Immediate action required.
```

---

## 🎯 Example 2: AWS Account Assessment

### Request
```
"Assess security of AWS account: 
 Production environment with EC2, RDS, S3, Lambda, IAM.
 Focus: IAM, networking, data protection"
```

### Module Loading
```
LOAD:
├── core/* (all)          ✓ Load
├── domains/cloud.md      ✓ Load (AWS primary)
├── domains/container.md  ✓ Load (EC2 instances)
├── threat-models/stride.md ✓ Load
├── threat-models/attack-path.md ✓ Load
├── threat-models/kill-chain.md ✓ Load
├── personas/cloud-engineer.md ✓ Load
├── personas/security-architect.md ✓ Load
└── personas/threat-hunter.md ✓ Load

PERSONAS ACTIVE:
- CloudSecurityEngineer (primary)
- SecurityArchitect (secondary)
- ThreatHunter (tertiary)

APPROX TOKEN LOAD: ~6.5k
```

### Analysis Flow

**Phase 1: Discovery (30 min)**
```
AWS Account Analysis:
1. Services Deployed
   - EC2: 12 instances, security groups configured
   - RDS: PostgreSQL, publicly accessible
   - S3: 8 buckets, mixed access patterns
   - Lambda: 5 functions, execution roles
   - IAM: 45 users, 20 roles, many admin policies
   - KMS: 2 keys, permissions broad
   
2. Network Architecture
   - VPC: Custom, 3 subnets
   - Security Groups: Multiple, overlapping rules
   - NACLs: Default, unrestricted
   - Route Tables: Mixed public/private

3. Risk Areas
   - Overpermissive IAM (many admin-like roles)
   - Public RDS instance
   - S3 bucket misconfiguration potential
   - Insufficient monitoring
```

**Phase 2: Modeling (15 min)**
```
Attack Paths:
1. Path: Compromise EC2 → Access RDS
   - EC2 security group allows: RDS port 5432
   - RDS publicly accessible
   - Blast radius: Database compromise

2. Path: S3 enumeration → Data discovery
   - Bucket policy: Unknown access patterns
   - Public access: Possibly enabled
   - Blast radius: Data exposure

3. Path: IAM abuse → Account takeover
   - Admin roles: Too many granted
   - Cross-account: Trust relationships?
   - Blast radius: Full account compromise
```

**Phase 3: Analysis (50 min)**
```
Finding 1: Public RDS Instance
├── Service: RDS PostgreSQL
├── Finding: Publicly accessible database
├── Evidence:
│   - AWS Console: RDS → Publicly Accessible: YES
│   - Security group: Allows 0.0.0.0/0 on port 5432
│   - Test: Connected from internet without VPN
├── Impact: 
│   - Production database accessible from anywhere
│   - Brute force attacks possible
│   - Data breach possible
├── Confidence: HIGH (confirmed via console and test)

Finding 2: Overpermissive S3 Access
├── Service: S3 Buckets
├── Finding: Bucket policies too permissive
├── Evidence:
│   - s3-prod-backups: ACL allows public-read
│   - s3-logs: Bucket policy missing principal restriction
│   - Test: Enumerated bucket without credentials
├── Impact:
│   - Backups publicly downloadable
│   - Logs accessible to attackers
   - Customer PII potentially exposed
├── Confidence: HIGH

Finding 3: Too Many Admin-Equivalent Roles
├── Service: IAM
├── Finding: 12 users with admin or admin-like permissions
├── Evidence:
│   - IAM Policy: "Effect": "Allow" "Action": "*" "Resource": "*"
│   - 3 users with AdministratorAccess directly
│   - 9 users with custom admin-like policies
├── Impact:
│   - Any compromised user = account compromise
│   - No audit trail of individual actions
│   - Least privilege not followed
├── Confidence: HIGH

Finding 4: Missing Network Segmentation
├── Service: VPC/Security Groups
├── Finding: Private RDS can be accessed from public subnet
├── Evidence:
│   - RDS security group: Allows from app-sg
│   - app-sg: On public subnet, allows inbound from 0.0.0.0
│   - No network ACLs restricting traffic
├── Impact:
│   - Compromised public instance = database access
│   - No defense in depth
├── Confidence: MEDIUM (design issue, needs verification of actual compromise path)

Finding 5: Insufficient IAM Monitoring
├── Service: CloudTrail/IAM
├── Finding: No alerts for privilege escalation
├── Evidence:
│   - CloudTrail enabled but no CloudWatch alarms
│   - No alerts for AttachUserPolicy, CreateAccessKey
│   - No alerts for AssumeRole from unusual accounts
├── Impact:
│   - Compromises undetected for extended periods
   - No forensic trail setup
├── Confidence: HIGH (confirmed via CloudTrail check)
```

**Phase 4: Validation (20 min)**
```
Testing:
✓ RDS publicly accessible: Connected without VPN
✓ S3 bucket enumeration: Listed objects without creds
✓ Admin role count: Verified via IAM console
✓ Network path: Traced security group rules
✓ Monitoring: Checked CloudTrail, no alarms

Findings confirmed and reproducible
```

**Phase 5: Challenge (15 min)**
```
Evidence Review:
✓ All findings backed by console verification
✓ Network diagrams confirm architecture
✓ Test results demonstrate exploitability
✓ Policy documents show configuration

Adversarial Review:
- RDS public: "Could be intentional for specific workload?"
  Counter: Production database should never be public
- S3 public: "Could be intentional for CDN?"
  Counter: Backups/logs should never be public
- Admin roles: "Needed for team flexibility?"
  Counter: Too many individuals with full access

False Positive Review:
✓ All findings are real misconfigurations
✓ All have clear business impact
✓ All follow AWS security best practices

Confidence: All HIGH (4/5) and MEDIUM (1/5)
```

**Phase 6: Report (20 min)**
```
AWS SECURITY ASSESSMENT

Account: Production (123456789012)
Date: 2024-06-14

CRITICAL FINDINGS: 3

1. RDS Public Accessibility
   Risk: Database compromise, data breach
   Fix: Set "Publicly Accessible" to No
   
2. S3 Bucket Public Access
   Risk: Data exposure, compliance violation
   Fix: Remove public ACLs, restrict policies

3. Overpermissive IAM
   Risk: Account compromise
   Fix: Implement least privilege, use roles

HIGH FINDINGS: 2

4. Missing Network Segmentation
5. Insufficient Monitoring & Alerting

RECOMMENDATIONS:
- Immediate: Fix RDS public access
- Immediate: Audit S3 permissions
- Short-term: Reduce IAM permissions
- Short-term: Add CloudWatch alarms
- Long-term: Implement defense in depth
```

---

## 📈 Scalability Examples

### Small Analysis (~3.5k tokens)
```
Scope: Single component (e.g., login module)
Load: core/* + specific domain
Time: 20-30 min
Output: 2-4 findings
```

### Medium Analysis (~5-6k tokens)
```
Scope: Application or environment audit
Load: core/* + 2 domains + 3 personas
Time: 60-90 min
Output: 6-12 findings
```

### Large Analysis (~8-10k tokens)
```
Scope: Full penetration test
Load: core/* + 3-4 domains + all threat models + 4 personas
Time: 120-180 min
Output: 12-20 findings
```

### Comprehensive Analysis (10-12k tokens)
```
Scope: End-to-end security assessment
Load: core/* + all domains + all threat models + all personas
Time: 180-240 min
Output: 20+ findings
```

---

## 🔄 Efficiency Comparison

### Monolithic Approach
```
1 Giant Skill File (15,000 lines)
   ↓
Load everything always (~15k tokens)
   ↓
Always in context (whether needed or not)
   ↓
Token waste for simple audits
   ↓
Harder to update/maintain
```

### Modular Approach
```
Single Audit Request
   ↓
Analyze requirements
   ↓
Load only needed modules (~4.5k tokens)
   ↓
Efficient analysis
   ↓
Easy to update
   
Same platform, 70% fewer tokens for typical use
```

---

## ✅ Ready to Use

The core is production-ready:
- ✅ Identity system
- ✅ Reasoning framework
- ✅ Evidence standards
- ✅ Review process
- ✅ Output format
- ✅ Routing system

Start with: `QUICKSTART.md`
Learn architecture: `ARCHITECTURE.md`
Full index: `INDEX.md`
