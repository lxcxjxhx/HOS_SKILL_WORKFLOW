# Domain: Cloud Infrastructure Security

**Purpose**: Security assessment of cloud platforms and infrastructure

**Size Target**: 800-1200 lines
**Load Timing**: Dynamic (when auditing cloud)
**Token Cost**: ~800 tokens

## Scope

This domain covers:
- Cloud provider configurations (AWS, Azure, GCP, Alibaba, Tencent)
- IAM and identity management
- Network security (VPC, security groups, firewalls)
- Storage security (buckets, databases, encryption)
- Secrets management
- Compute security (instances, functions, containers)
- Monitoring and logging

## AWS Security Assessment

### 1. IAM (Identity & Access Management)

**Check**:
- [ ] Are least privilege policies applied?
- [ ] Are there overpermissive policies? (Admin*, s3:*)
- [ ] Are unused permissions granted?
- [ ] Cross-account access properly restricted?
- [ ] Root account used? (Should only for MFA/billing)
- [ ] MFA enforced?
- [ ] Access keys rotated regularly?
- [ ] Are service roles properly scoped?

**Common Issues**:
```
WRONG: Principal: "*" allowing anonymous access
WRONG: Effect: "Allow" with Action: "*" on Resource: "*"
WRONG: Wildcard permissions without restriction
WRONG: Old access keys not rotated
```

### 2. S3 (Simple Storage Service)

**Check**:
- [ ] Public block enabled? (Block all public access)
- [ ] Bucket policies restrict access properly?
- [ ] Object ACLs properly configured?
- [ ] Versioning enabled?
- [ ] MFA delete enabled?
- [ ] Server-side encryption enabled?
- [ ] Bucket logging enabled?
- [ ] Access denied properly logged?

**Critical Checks**:
```
✗ Bucket policy allows Principal: "*"
✗ Public access not blocked
✗ No encryption configured
✗ No versioning (data loss risk)
✗ No logging (audit trail missing)
```

### 3. Networking (VPC, Security Groups, NACLs)

**Check**:
- [ ] Databases in private subnets only?
- [ ] Security groups restrict to needed ports?
- [ ] NACLs properly configured?
- [ ] VPC Flow Logs enabled?
- [ ] Network segmentation enforced?
- [ ] Bastion hosts for private access?
- [ ] No direct internet routing for internal services?

**Network Visualization**:
```
Internet → API Gateway (TLS only)
         → ALB/NLB (port 443)
         → Private Subnet (EC2, no direct internet)
         → Private Subnet (RDS, security group restricted)
```

### 4. RDS (Relational Database Service)

**Check**:
- [ ] Public accessibility disabled?
- [ ] Security group restricts to application only?
- [ ] Encryption at rest enabled?
- [ ] TLS/SSL enforced for connections?
- [ ] Backups enabled and retained?
- [ ] Parameter groups secure? (no admin defaults)
- [ ] Database user separated from root?
- [ ] Database logs captured?

### 5. KMS (Key Management Service)

**Check**:
- [ ] Keys properly scoped (not public)?
- [ ] Key policies restrict to needed principals?
- [ ] Key rotation enabled?
- [ ] Key access logged in CloudTrail?
- [ ] Separate keys per environment?
- [ ] Keys in separate AWS account? (Optional but better)

### 6. Secrets Manager / Parameter Store

**Check**:
- [ ] Secrets encrypted?
- [ ] Access restricted by IAM?
- [ ] Rotation configured?
- [ ] Audit trail in CloudTrail?
- [ ] No hardcoded secrets in code?
- [ ] No secrets in CloudFormation parameters?

### 7. Lambda (Serverless Functions)

**Check**:
- [ ] Execution role properly scoped?
- [ ] Environment variables don't contain secrets?
- [ ] Function code reviewed?
- [ ] Dependencies scanned for vulnerabilities?
- [ ] Concurrency limits set?
- [ ] Logging configured?
- [ ] VPC properly configured (if needed)?

### 8. CloudTrail & Logging

**Check**:
- [ ] CloudTrail enabled in all regions?
- [ ] Logs not readable by non-admin?
- [ ] Log file validation enabled?
- [ ] S3 bucket logging enabled?
- [ ] Multi-region trail?
- [ ] Organization trail (if applicable)?
- [ ] CloudWatch alarms for suspicious activity?

---

## Azure Security Assessment

### 1. RBAC (Role-Based Access Control)

**Check**:
- [ ] Owner roles minimized?
- [ ] Custom roles audited?
- [ ] Service principal permissions scoped?
- [ ] MFA required for elevated roles?
- [ ] Access reviews conducted?
- [ ] PIM (Privileged Identity Management) used?

### 2. Storage (Azure Storage Accounts)

**Check**:
- [ ] Public access disabled? (Deny public access)
- [ ] HTTPS enforced?
- [ ] Storage encryption enabled?
- [ ] Access keys rotated regularly?
- [ ] SAS tokens properly scoped?
- [ ] Blob access policies reviewed?
- [ ] Storage logging enabled?

### 3. Key Vault

**Check**:
- [ ] Access policies properly scoped?
- [ ] RBAC used instead of access policies?
- [ ] Soft-delete enabled?
- [ ] Purge protection enabled?
- [ ] Key rotation automated?
- [ ] Audit logs retained?

### 4. Networking (Virtual Networks)

**Check**:
- [ ] Network Security Groups (NSGs) properly configured?
- [ ] Service endpoints used (vs. public endpoints)?
- [ ] Private Link configured where possible?
- [ ] No "Allow all inbound"?
- [ ] DDoS protection enabled (standard)?

### 5. Azure AD (now Entra ID)

**Check**:
- [ ] MFA enforced?
- [ ] Conditional Access policies?
- [ ] Legacy authentication blocked?
- [ ] Unused applications removed?
- [ ] Service principals audited?
- [ ] Sign-in logs monitored?

---

## GCP Security Assessment

### 1. IAM (Identity and Access Management)

**Check**:
- [ ] Least privilege roles applied?
- [ ] Custom roles minimized?
- [ ] Service accounts properly scoped?
- [ ] Service account impersonation restricted?
- [ ] Unused service accounts removed?

### 2. Cloud Storage (GCS)

**Check**:
- [ ] Uniform bucket-level access enabled?
- [ ] Public access prevented? (allUsers removed)
- [ ] Encryption enabled?
- [ ] Bucket versioning enabled?
- [ ] Access logs enabled?
- [ ] Object lifecycle rules configured?

### 3. Cloud SQL

**Check**:
- [ ] Public IP disabled or restricted?
- [ ] Cloud SQL proxy used?
- [ ] SSL enforced?
- [ ] Backups automated?
- [ ] Automated backups retained?
- [ ] Flag database.flags reviewed?

### 4. Cloud KMS

**Check**:
- [ ] Key policies restrict access?
- [ ] Key rotation enabled?
- [ ] Access logs enabled?
- [ ] Keys not shared between projects?

### 5. VPC

**Check**:
- [ ] Firewall rules minimized?
- [ ] No "allow all ingress"?
- [ ] Private Google access enabled?
- [ ] VPC Flow Logs enabled?
- [ ] Hierarchical firewall policies?

---

## Alibaba Cloud Security Assessment

### 1. RAM (Resource Access Management)

**Check**:
- [ ] Least privilege policies?
- [ ] MFA enforced?
- [ ] Temporary access credentials used?
- [ ] Access keys rotated?
- [ ] Resource groups used for separation?

### 2. OSS (Object Storage Service)

**Check**:
- [ ] Bucket ACLs private only?
- [ ] Server-side encryption enabled?
- [ ] Access control lists reviewed?
- [ ] Versioning enabled?
- [ ] Logging enabled?

### 3. Database (RDS)

**Check**:
- [ ] Whitelist restrictive?
- [ ] SSL/TLS enforced?
- [ ] Encryption at rest enabled?
- [ ] Backups automated?
- [ ] Backup encryption enabled?

---

## Tencent Cloud Security Assessment

### 1. CAM (Cloud Access Management)

**Check**:
- [ ] Least privilege policies?
- [ ] MFA enabled?
- [ ] Sub-accounts for separation?
- [ ] Temporary credentials used?

### 2. COS (Cloud Object Storage)

**Check**:
- [ ] ACLs restrictive?
- [ ] Encryption enabled?
- [ ] Public access prevented?
- [ ] Versioning enabled?
- [ ] Access logging enabled?

### 3. CDB (TencentDB)

**Check**:
- [ ] Security group restrictive?
- [ ] Public access disabled?
- [ ] SSL enabled?
- [ ] Encryption at rest?
- [ ] Backups automated?

---

## Cross-Cloud Security Patterns

### 1. IAM Assessment Across Clouds

| Aspect | AWS | Azure | GCP | Alibaba | Tencent |
|--------|-----|-------|-----|---------|---------|
| **Least Privilege** | IAM policies | RBAC | IAM roles | RAM policies | CAM policies |
| **MFA** | Required | Conditional Access | Available | Available | Available |
| **Audit** | CloudTrail | Activity Log | Cloud Audit Logs | ActionTrail | CloudAudit |
| **Key Management** | KMS | Key Vault | Cloud KMS | KMS | KMS |

### 2. Network Assessment Across Clouds

| Aspect | AWS | Azure | GCP | Alibaba | Tencent |
|--------|-----|-------|-----|---------|---------|
| **Network** | VPC | Virtual Network | VPC | VPC | VPC |
| **Firewalling** | Security Groups | NSGs | Firewall Rules | Security Groups | Security Groups |
| **Segmentation** | Subnets | Subnets | Subnets | vSwitches | Subnets |
| **Secrets** | Secrets Manager | Key Vault | Secret Manager | Secrets Manager | KMS |

### 3. Storage Assessment Across Clouds

| Aspect | AWS | Azure | GCP | Alibaba | Tencent |
|--------|-----|-------|-----|---------|---------|
| **Storage** | S3 | Storage Acct | Cloud Storage | OSS | COS |
| **Encryption** | SSE-S3/KMS | Storage encryption | Customer-managed | Server-side | KMS |
| **Access Control** | Bucket Policy + ACL | RBAC | IAM | RAM policy | CAM policy |
| **Logging** | Server access logs | Storage logging | Cloud Audit Logs | Access logs | Access logs |

---

## Cloud Security Audit Workflow

```
1. DISCOVER cloud assets
   - Services used
   - Resources deployed
   - Configuration state

2. EXAMINE IAM
   - Policies review
   - Service accounts
   - Permission scoping

3. EXAMINE networking
   - VPC configuration
   - Security group rules
   - Network segmentation

4. EXAMINE storage
   - Bucket/container access
   - Encryption settings
   - Public exposure

5. EXAMINE encryption
   - At-rest encryption
   - In-transit encryption
   - Key management

6. EXAMINE logging
   - Audit trails
   - Access logs
   - CloudTrail/equivalent

7. BUILD attack chains
   - Lateral movement paths
   - Data access paths
   - Privilege escalation paths

8. DOCUMENT findings
   - Evidence from console/config
   - Confidence assessment
   - Remediation specific to cloud provider
```

---

## Evidence Collection

### AWS
```
# Get bucket policy
aws s3api get-bucket-policy --bucket bucket-name

# Get IAM policy
aws iam get-role-policy --role-name role-name --policy-name policy-name

# Get security group rules
aws ec2 describe-security-groups --group-ids sg-xxx

# Get CloudTrail events
aws cloudtrail lookup-events --max-results 50
```

### Azure
```
# Get role assignments
az role assignment list

# Get storage account settings
az storage account show --name account-name

# Get Key Vault access policies
az keyvault list-access-policy --name vault-name

# Get activity logs
az monitor activity-log list
```

### GCP
```
# Get IAM policy
gcloud projects get-iam-policy PROJECT_ID

# Get storage bucket policy
gsutil iam get gs://bucket-name

# Get Cloud Audit Logs
gcloud logging read "resource.type=gce_instance"
```

