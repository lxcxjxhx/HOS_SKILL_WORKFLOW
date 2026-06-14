# Domain: Source Code Audit

**Purpose**: Comprehensive security analysis of source code

**Size Target**: 600-900 lines
**Load Timing**: Dynamic (when auditing code)
**Token Cost**: ~600 tokens

## Scope

This domain covers:
- Server-side application code
- Business logic analysis
- Authentication/authorization implementation
- Data handling and cryptography
- Error handling and logging
- Third-party library usage
- Configuration management

**Related Domains**: web.md, api.md (if exposed)

## Code Audit Checklist

### 1. Authentication & Credential Management

**Check**:
- [ ] How are passwords hashed? (Algorithm, salt, iterations)
- [ ] How are tokens generated? (Randomness source, length, expiration)
- [ ] How are credentials stored? (Database encryption, memory handling)
- [ ] How is session created? (Token generation, secure flags)
- [ ] How are credentials transmitted? (HTTPS only? Logging?)
- [ ] Account lockout after N failures?
- [ ] Multi-factor authentication? If implemented, verify strength

**Look For**:
- Plain text passwords
- Weak hashing (MD5, SHA1 without salt)
- Insufficient randomness in token generation
- Default/hardcoded credentials
- Credentials in logs
- Credentials in version control history

### 2. Authorization & Access Control

**Check**:
- [ ] How are permissions defined? (Role, ABAC, capability-based)
- [ ] When is authorization checked? (Before or after operation)
- [ ] Who can access what? (Is matrix documented?)
- [ ] Can user bypass checks? (Direct object references?)
- [ ] Is privilege escalation possible? (Can user modify their role?)
- [ ] Is data accessible to other users? (Horizontal privilege escalation?)

**Look For**:
- Missing authorization checks
- Authorization checks after data access
- Hardcoded role names
- Privilege escalation without approval
- Object IDs directly accessible (BOLA/IDOR)
- User data visible to other users

### 3. Input Validation

**Check**:
- [ ] What input is accepted?
- [ ] Where is validation performed? (Client, server, database)
- [ ] What encoding/sanitization applied?
- [ ] Are there bypass techniques? (Encoding, type confusion)
- [ ] What happens with invalid input?
- [ ] Are there length/type limits enforced?

**Look For**:
- Client-side only validation
- Incomplete sanitization
- Type confusion (string vs. int)
- Encoding bypasses (%00, unicode, double-encoding)
- No length limits (buffer overflow)
- Path traversal (../, ..\\)

### 4. Injection Attacks

**Check**:
- [ ] SQL queries built dynamically? (Use prepared statements)
- [ ] Commands executed dynamically? (Use libraries, not shell)
- [ ] LDAP queries? (Parameterize)
- [ ] Template rendering? (Safe templating)
- [ ] Log injection? (Sanitize inputs)

**SQL Injection Specific**:
```
VULNERABLE: f"SELECT * FROM users WHERE id = {user_id}"
SAFE: db.query("SELECT * FROM users WHERE id = ?", [user_id])
```

**Command Injection Specific**:
```
VULNERABLE: os.system(f"ping {hostname}")
SAFE: subprocess.run(["ping", hostname])
```

### 5. Cryptography

**Check**:
- [ ] What algorithm? (AES, RSA, etc.)
- [ ] What key length? (256-bit for AES, 2048+ for RSA)
- [ ] How are keys generated? (Cryptographically random)
- [ ] How are keys stored? (Encrypted, access-controlled)
- [ ] How are keys rotated? (Procedure, frequency)
- [ ] What random source? (os.urandom, /dev/urandom, not Math.random())
- [ ] TLS certificate validation? (MITM risk)

**Encryption at Rest**:
```
WEAK: Plaintext, basic cipher, hardcoded key
STRONG: AES-256, key stored separately, key rotation
```

**Encryption in Transit**:
```
WEAK: HTTP, TLS 1.0/1.1, weak cipher suite
STRONG: TLS 1.2+, strong ciphers, certificate validation
```

### 6. File Handling

**Check**:
- [ ] How are uploaded files handled?
- [ ] Are file types validated? (Check content, not extension)
- [ ] Is file size limited?
- [ ] Are files stored securely?
- [ ] Can attackers access other files? (Path traversal)
- [ ] Are temporary files cleaned?
- [ ] Can file names be exploited? (Escape sequences)

**Look For**:
- Extension-based validation only
- Arbitrary file upload
- Files accessible via path traversal
- Temporary file lingering
- File names with escape sequences

### 7. Serialization & Deserialization

**Check**:
- [ ] What format? (JSON, XML, binary)
- [ ] Unsafe deserialization? (Java serialization, pickle)
- [ ] Object injection possible?
- [ ] Gadget chains available?
- [ ] Is type validated before deserialization?

**Look For**:
- Java serialization of untrusted data
- Python pickle of untrusted data
- PHP unserialize() of user input
- YAML deserialization without safe mode
- XXE in XML parsing

### 8. Business Logic

**Check**:
- [ ] Is workflow enforced? (Can states be skipped?)
- [ ] Is consistency maintained? (ACID, transactions)
- [ ] Are race conditions possible?
- [ ] Can workflow be reversed? (Refund after ship?)
- [ ] Are prices/quantities manipulable?
- [ ] Are limits enforced? (Rate limits, quotas)

**Look For**:
- State machines with bypassable states
- Time-of-check-time-of-use (TOCTOU) bugs
- Race conditions in transactions
- Price/quantity manipulation
- Missing constraint enforcement

### 9. Error Handling & Logging

**Check**:
- [ ] What information in error messages?
- [ ] Are secrets logged? (Passwords, tokens, PII)
- [ ] Is logging sufficient for audit trail?
- [ ] Are all user actions logged?
- [ ] Can logs be tampered with?
- [ ] How long are logs retained?

**Look For**:
- Stack traces in error messages
- Database errors exposing schema
- Passwords in logs
- Tokens in error messages
- Insufficient logging for audit trail
- No logging of failed authorization
- No logging of privilege changes

### 10. Configuration Management

**Check**:
- [ ] Secrets in code? (Database password, API keys)
- [ ] Secrets in config files?
- [ ] Secrets in environment variables?
- [ ] Configuration in version control?
- [ ] Configuration differs by environment?
- [ ] How are secrets rotated?

**Look For**:
- Hard-coded API keys
- Database passwords in code
- Configuration in .git directory
- Secrets in environment files
- No configuration management

### 11. Third-Party Dependencies

**Check**:
- [ ] What dependencies used?
- [ ] Known vulnerabilities? (Check CVE databases)
- [ ] Dependencies of dependencies?
- [ ] How old are dependencies?
- [ ] Are updates available?
- [ ] License compliance?

**Look For**:
- Outdated libraries with known CVEs
- Abandoned dependencies
- License violations
- Unnecessary dependencies

### 12. API Security (if applicable)

**Check**:
- [ ] Is API authenticated?
- [ ] Is API rate-limited?
- [ ] Are API parameters validated?
- [ ] Is API versioning handled?
- [ ] Can API be abused? (Batch operations)
- [ ] Is API documented securely?

---

## Audit Workflow

```
1. REVIEW code structure
   - Understand architecture
   - Identify key components
   - Map data flows

2. EXAMINE authentication
   - How users authenticated?
   - How credentials handled?

3. EXAMINE authorization
   - How permissions enforced?
   - What controls in place?

4. TRACE data flows
   - From input to storage
   - From storage to output
   - Find injection points

5. CHECK input validation
   - All inputs validated?
   - Validation bypass possible?

6. CHECK cryptography
   - Algorithm strength?
   - Key management?

7. REVIEW error handling
   - Information leakage?
   - Secret exposure?

8. VERIFY logging
   - Sufficient for audit?
   - Security events logged?

9. BUILD attack chains
   - How to exploit?
   - Complete chain?
   - Practical impact?

10. DOCUMENT findings
    - Evidence provided?
    - Confidence assessed?
    - Remediation clear?
```

---

## Common Vulnerabilities by Language

### Java/Spring
- SQL injection from unsafe queries
- XXE in XML parsing
- Insecure deserialization
- Weak CSRF tokens
- Session fixation

### Python/Django
- Pickle deserialization
- SQL injection with string formatting
- Weak password hashing defaults
- Template injection
- YAML deserialization

### JavaScript/Node.js
- Prototype pollution
- SQL injection with concatenation
- Insecure random (Math.random())
- Path traversal
- Dependency vulnerabilities

### C#/.NET
- SQL injection from string concatenation
- Insecure deserialization
- Missing input validation
- Weak cryptography
- Path traversal

### Go
- SQL injection from string formatting
- Weak random number generation
- Missing error handling
- Insecure deserialization
- Path traversal

### PHP
- SQL injection (legacy code)
- Insecure deserialization
- Path traversal
- Remote code execution
- Authentication bypass

---

## Code Review Questions

For EVERY function handling:

**Sensitive Data** (passwords, tokens, PII):
- [ ] Is data validated?
- [ ] Is data encrypted?
- [ ] Is data logged?
- [ ] Is data exposed in errors?
- [ ] Is data in version control?

**User Input**:
- [ ] Is input validated?
- [ ] Is input escaped/sanitized?
- [ ] Could validation be bypassed?
- [ ] What's the worst input?

**Authorization**:
- [ ] Is permission checked?
- [ ] Can permission be bypassed?
- [ ] What if permission denied?
- [ ] Is audit logged?

**Data Access**:
- [ ] What data accessed?
- [ ] Who can access?
- [ ] Can access be restricted?
- [ ] Is it audited?

