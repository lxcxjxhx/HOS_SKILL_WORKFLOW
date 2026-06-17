---
name: diagnostics
description: >
  Problem diagnostics rules
  Use when reviewing code for security vulnerabilities, performing penetration testing,
  or diagnosing security defects in web applications.
---

# HOS-Audit-Core: Problems & Diagnostics Rules

> Systematic problem categorization and guided diagnosis for security findings.

---

## Core Philosophy

- **Diagnosis over Assertion** - Don't just identify the problem, diagnose the root cause
- **Process over Conclusion** - Follow structured diagnostic steps, not one-line judgments
- **Evidence over Speculation** - Every diagnostic conclusion requires evidence
- **Fix over Flag** - Provide actionable remediation, not just problem identification

---

## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Problem Diagnostics | 6 | PD-001 ~ PD-006 |

## Diagnostic Workflow

1. **Problem Identification**: Use AR/PT rules to discover potential issues
2. **Categorization**: Map findings to PD rules for problem classification
3. **Deep Diagnosis**: Follow diagnostic steps to identify root cause
4. **Remediation**: Apply specific fix guidance with code examples
5. **Verification**: Confirm the fix using verification steps

---

## Problem Categories (PD)

### PD-001: Input Validation Defects

**Category**: input-validation | **Severity**: High | **CWE**: CWE-20, CWE-138, CWE-74 | **OWASP**: A03:2021 - Injection, A05:2021 - Security Misconfiguration

**Trigger Patterns**:
   - `req\.body`
   - `req\.query`
   - `req\.params`
   - `request\.getParameter`
   - `request\.getInputStream`
   - `@RequestBody`
   - `@RequestParam`
   - `@PathVariable`
   - `\.parse\(`
   - `\.json\(`
   - `formData`
   - `body\(`
   - `form\(`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Input Source Identification**: Identify all external input sources that the application accepts, including HTTP request parameters, headers, cookies, file uploads, environment variables, and third-party API responses.
   - **Step 2: Validation Mechanism Analysis**: Analyze the validation patterns present for each input source, including type checking, format validation, length constraints, and range validation.
   - **Step 3: Bypass Possibility Assessment**: Evaluate whether existing validation mechanisms can be bypassed through encoding tricks, parameter pollution, alternative input formats, or race conditions.
   - **Step 4: Context-Aware Validation Check**: Verify that validation is appropriate for the specific context in which the data will be used, such as database queries, HTML output, file system operations, or command execution.

**Common Root Causes**:
   - [common] **Developer assumed input is trusted**: Developers often assume that inputs from internal systems, authenticated users, or specific sources are safe, leading to missing or incomplete validation. This assumption breaks down when internal systems are compromised or when trust boundaries change.
   - [common] **Validation only on client-side**: Client-side validation (JavaScript form validation, HTML5 constraints) provides a better user experience but offers zero security guarantee. Attackers can bypass client-side checks by crafting raw HTTP requests directly.
   - [common] **Blacklist approach instead of whitelist**: Using blacklists to block known-bad patterns is inherently incomplete. New attack vectors and encoding techniques constantly emerge, making blacklists a losing strategy. Whitelisting (only allowing known-good patterns) is more robust.
   - [occasional] **Missing type/format validation**: Developers often validate the presence of input without validating its type, format, or range. For example, accepting a string where a number is expected, or accepting arbitrarily long strings that can cause buffer issues or denial of service.

**Remediation**:
   - [High] Implement whitelist-based input validation with strict schemas (Difficulty: Medium)
   - [High] Apply context-appropriate input sanitization and encoding (Difficulty: Medium)
   - [Medium] Implement comprehensive type checking and format validation (Difficulty: Easy)

**Verification Steps**:
   1. Review all input entry points and confirm each has explicit validation defined with strict schemas or rules.
   2. Test validation bypass attempts including URL encoding, double encoding, unicode normalization, and parameter pollution to ensure they are properly rejected.
   3. Verify that server-side validation is enforced independently of any client-side validation by sending crafted requests directly to the API.
   4. Confirm that context-specific encoding/sanitization is applied at each data usage boundary (SQL queries, HTML output, file operations, command execution).
   5. Perform negative testing with malformed, oversized, and unexpected type inputs to ensure the application handles them gracefully without errors or data leakage.

**Related Audit Rules**: AR-001, AR-002, AR-009, AR-010

**Related Pentest Rules**: PT-005, PT-006
---

### PD-002: Authentication & Authorization Defects

**Category**: auth-authorization | **Severity**: Critical | **CWE**: CWE-287, CWE-306, CWE-384, CWE-613 | **OWASP**: A07:2021 - Identification and Authentication Failures, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `login`
   - `authenticate`
   - `authorization`
   - `jwt`
   - `token`
   - `session`
   - `passport`
   - `oauth`
   - `role`
   - `permission`
   - `grant`
   - `access_control`
   - `middleware.*auth`
   - `Bearer`
   - `Authorization.*header`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Authentication Method Analysis**: Identify and analyze all authentication mechanisms used in the application, including password-based, token-based, OAuth, SSO, and multi-factor authentication implementations.
   - **Step 2: Credential Security Assessment**: Evaluate how credentials are stored, transmitted, and managed, including password hashing algorithms, key strength, and secret management practices.
   - **Step 3: Session & Token Validation**: Check session management security including session fixation vulnerabilities, JWT validation completeness, expiration handling, and token storage practices.
   - **Step 4: Access Control Bypass Path Analysis**: Identify paths where access control can be bypassed, including IDOR (Insecure Direct Object References), horizontal privilege escalation, and vertical privilege escalation vulnerabilities.

**Common Root Causes**:
   - [common] **Weak password hashing algorithm (MD5/SHA1)**: Developers use fast cryptographic hash functions (MD5, SHA1) instead of adaptive password hashing functions. These algorithms are designed for speed, making them vulnerable to brute-force and rainbow table attacks. Without proper salting and key stretching, compromised password databases can be cracked in minutes.
   - [common] **Missing token validation/signature check**: JWT or session tokens are accepted without verifying their cryptographic signature, expiration, issuer, or audience. This allows attackers to forge tokens, use expired tokens, or replay tokens from other services. The alg:none attack is a classic example where the token header claims no algorithm is needed.
   - [occasional] **Session ID predictable or not regenerated after login**: Session identifiers are generated using predictable algorithms (e.g., sequential numbers, timestamps) or are not regenerated after the user authenticates. This enables session fixation attacks where an attacker sets a known session ID before the victim logs in, then hijacks the authenticated session.
   - [common] **Access control enforced only on client-side or UI layer**: Authorization checks are performed only in the frontend (hiding buttons, disabling routes) without server-side enforcement. Attackers can bypass UI restrictions by directly calling API endpoints, manipulating HTTP requests, or using tools like curl or Burp Suite to access restricted resources.

**Remediation**:
   - [Critical] Use strong adaptive password hashing (bcrypt or argon2) (Difficulty: Easy)
   - [Critical] Implement comprehensive JWT validation middleware (Difficulty: Easy)
   - [High] Implement secure session handling with proper lifecycle management (Difficulty: Easy)
   - [High] Enforce server-side access control on every endpoint (Difficulty: Medium)

**Verification Steps**:
   1. Verify that password hashes use bcrypt/argon2 with appropriate cost factors by inspecting the stored hash format and hashing configuration in code.
   2. Test JWT validation by attempting to access protected endpoints with expired tokens, modified signatures, and tokens with alg:none header. All should be rejected with 401.
   3. Confirm session IDs are regenerated after login by comparing session ID before and after authentication. Verify session is destroyed on logout.
   4. Attempt IDOR attacks by manipulating resource IDs (user IDs, order IDs) in API requests while authenticated as a different user. All unauthorized access attempts should return 403.
   5. Verify that admin-only endpoints reject requests from regular users even when the UI is bypassed (direct API calls with curl or Burp Suite).

**Related Audit Rules**: AR-003

**Related Pentest Rules**: PT-002, PT-003
---

### PD-003: Data Protection Defects

**Category**: data-protection | **Severity**: Critical | **CWE**: CWE-327, CWE-328, CWE-798, CWE-359 | **OWASP**: A02:2021 - Cryptographic Failures, A04:2021 - Insecure Design

**Trigger Patterns**:
   - `crypto\.encrypt|crypto\.decrypt|Cipher\.encrypt|Cipher\.decrypt`
   - `AES|DES|RSA|Blowfish|TripleDES|MD5|SHA1|SHA256|SHA512`
   - `password.*hash|hash.*password|bcrypt|argon2|pbkdf2|scrypt`
   - `encrypt.*at.*rest|encrypt.*in.*transit|encrypt.*data|decrypt.*data`
   - `secret.*key|private.*key|api.*key|access.*token|encryption.*key`
   - `pii|personal.*data|sensitive.*data|confidential.*data`
   - `mask.*data|redact.*data|anonymize|pseudonymize`
   - `key.*generate|key.*store|key.*rotate|key.*destroy|key.*exchange`
   - `kms|key.*management|key.*vault|hsm`
   - `data.*at.*rest|data.*in.*transit|data.*in.*use`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Data Classification**: Identify all sensitive data types handled by the application and their storage locations.
   - **Step 2: Encryption Algorithm Assessment**: Evaluate the cryptographic algorithms, key lengths, and modes of operation used for data protection.
   - **Step 3: Key Management Analysis**: Check cryptographic key generation, storage, rotation, and destruction practices.
   - **Step 4: Data Exposure & Masking Check**: Verify that sensitive data is not exposed in logs, API responses, error messages, or user interfaces.

**Common Root Causes**:
   - [common] **Deprecated or weak cryptographic algorithm (DES, MD5, SHA1)**: Developers may use outdated algorithms due to legacy code, lack of security awareness, or framework defaults. These algorithms have known vulnerabilities: DES has a 56-bit key that can be brute-forced, MD5 has collision attacks, and SHA1 is deprecated for cryptographic use.
   - [common] **Hardcoded encryption keys or secrets in source code**: Developers often embed keys directly in code for convenience during development and forget to externalize them. These keys become accessible to anyone with code repository access and are frequently committed to version control systems.
   - [occasional] **Missing encryption at rest for sensitive data storage**: Sensitive data may be stored in plaintext in databases, caches, or file systems because encryption was considered unnecessary for internal data, or the complexity of key management was avoided. This exposes data if storage media is compromised.
   - [common] **Sensitive data logged or returned in API responses without masking**: Verbose logging for debugging or overly permissive API serialization can expose passwords, tokens, PII, and other sensitive data. Developers may not realize that logging frameworks capture full objects or that API responses include all model fields by default.

**Remediation**:
   - [Critical] Replace weak cryptographic algorithms with AES-256-GCM for symmetric encryption and RSA-4096 or ECC for asymmetric encryption. (Difficulty: Medium)
   - [Critical] Implement secure key management using a Key Management Service (KMS) or secrets manager instead of hardcoded keys. (Difficulty: Medium)
   - [High] Implement data masking for sensitive fields in logs, API responses, and error messages. (Difficulty: Easy)
   - [Critical] Use Argon2id for password hashing with appropriate memory and iteration parameters. (Difficulty: Easy)

**Verification Steps**:
   1. Run static analysis to confirm no deprecated algorithms (DES, MD5, SHA1, RC4) remain in the codebase.
   2. Verify all encryption keys are stored in a KMS or secrets manager, not hardcoded or in version control.
   3. Test that sensitive data fields (passwords, tokens, PII) are masked or excluded from log output and API responses.
   4. Confirm password hashing uses Argon2id, bcrypt, or scrypt with appropriate work factors, and verify against rainbow table attacks.
   5. Perform a data flow review to ensure sensitive data is encrypted both at rest and in transit, with no plaintext exposure in caches, temp files, or error messages.

**Related Audit Rules**: AR-004

**Related Pentest Rules**: PT-005
---

### PD-004: Configuration & Deployment Defects

**Category**: config-deployment | **Severity**: High | **CWE**: CWE-16, CWE-209, CWE-614, CWE-942 | **OWASP**: A05:2021 - Security Misconfiguration, A09:2021 - Security Logging and Monitoring Failures

**Trigger Patterns**:
   - `app\.use\(.*cors`
   - `CORS|Access-Control`
   - `CSP|Content-Security-Policy`
   - `X-Frame-Options|X-XSS-Protection|X-Content-Type`
   - `HSTS|Strict-Transport-Security`
   - `debug.*true|DEBUG.*=.*true`
   - `stacktrace|stack_trace|traceback`
   - `app\.listen\(|server\.listen\(`
   - `environment.*variable|process\.env`
   - `secret.*key|SECRET_KEY`
   - `allowedHosts|ALLOWED_HOSTS`
   - `ssl|tls|https`
   - `certificate|cert`
   - `nginx|apache|iis`
   - `docker|container|kubernetes|k8s`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Configuration Review**: Audit all security-relevant configuration settings across the application, infrastructure, and deployment environment.
   - **Step 2: Default Settings Check**: Identify insecure default settings such as default credentials, debug mode enabled in production, verbose error messages, and framework defaults that are unsafe for production.
   - **Step 3: Exposure Surface Analysis**: Check for exposed endpoints, open ports, unnecessary services, and information disclosure that could provide attack vectors.
   - **Step 4: Transport Security Verification**: Verify TLS/SSL configuration, certificate validity, HSTS headers, and overall transport layer security settings.

**Common Root Causes**:
   - [common] **Debug mode enabled in production environment**: Developers enable debug mode during development for easier troubleshooting but fail to disable it before deploying to production. This exposes detailed error messages, stack traces, and potentially sensitive application internals to end users.
   - [common] **Default credentials not changed after deployment**: Software packages, databases, cloud services, and frameworks often ship with well-known default credentials (admin/admin, root/root). If these are not changed before or immediately after deployment, attackers can easily gain access using publicly available documentation of default credentials.
   - [common] **CORS configured with wildcard (*) allowing any origin**: Cross-Origin Resource Sharing (CORS) is configured to allow requests from any origin (Access-Control-Allow-Origin: *) rather than restricting to a specific allowlist of trusted domains. This removes the browser's same-origin protection and can enable cross-site request forgery and data exfiltration attacks.
   - [common] **Missing security headers (X-Frame-Options, CSP, X-Content-Type-Options)**: Web applications lack critical HTTP security headers that provide defense-in-depth protections. Without X-Frame-Options, the application is vulnerable to clickjacking. Without Content-Security-Policy (CSP), XSS attacks are more likely to succeed. Without X-Content-Type-Options, MIME type sniffing can lead to unexpected content execution.

**Remediation**:
   - [High] Disable debug mode in production environment (Difficulty: Easy)
   - [High] Enforce HTTPS with HSTS headers (Difficulty: Medium)
   - [High] Implement restrictive CORS policy (Difficulty: Easy)
   - [High] Configure security headers middleware (Difficulty: Easy)

**Verification Steps**:
   1. Confirm debug mode is disabled in production by checking that error responses return generic messages without stack traces or internal details.
   2. Verify HTTPS enforcement by accessing the application via HTTP and confirming automatic redirect to HTTPS with a 301 status code.
   3. Test CORS policy by sending a cross-origin request from an unauthorized domain and confirming the response lacks Access-Control-Allow-Origin header or is rejected.
   4. Scan HTTP response headers to verify all security headers are present (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Strict-Transport-Security) with correct values.
   5. Run a TLS configuration test (e.g., SSL Labs, testssl.sh) to confirm TLS 1.2+ is enforced, weak ciphers are disabled, and certificates are valid.

**Related Audit Rules**: AR-002, AR-003

**Related Pentest Rules**: PT-001, PT-007
---

### PD-005: Dependency & Supply Chain Defects

**Category**: dependency-supply-chain | **Severity**: High | **CWE**: CWE-829, CWE-1104, CWE-1395 | **OWASP**: A06:2021 - Vulnerable and Outdated Components, A08:2021 - Software and Data Integrity Failures

**Trigger Patterns**:
   - `package\.json|requirements\.txt|pom\.xml|Gemfile|Cargo\.toml`
   - `go\.mod|go\.sum|composer\.json|nuget\.config`
   - `import.*from.*|require\(|include`
   - `npm.*install|pip.*install|gem.*install|cargo.*add`
   - `vulnerability|CVE|advisory|security.*update`
   - `lockfile|package-lock|yarn\.lock|poetry\.lock`
   - `build.*pipeline|CI/CD|github.*actions|jenkinsfile`
   - `supply.*chain|dependency.*chain|third.*party`
   - `sbom|software.*bill.*of.*materials`
   - `signature.*verify|checksum|hash.*verify`
   - `registry.*config|npm.*registry|pypi.*index`
   - `submodule|vendor|external.*dependency`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Dependency Analysis**: Inventory all direct and transitive dependencies, their versions, and their role in the application. Identify outdated packages and understand the full dependency tree.
   - **Step 2: CVE Mapping**: Check dependencies against known vulnerability databases to identify packages with known CVEs. Assess the exploitability and impact of each vulnerability in the context of your application.
   - **Step 3: Supply Chain Risk Assessment**: Verify package authenticity, check for typosquatting packages, review maintainer trust, and assess the overall supply chain risk of dependencies.
   - **Step 4: Build Pipeline Integrity**: Verify lockfile integrity, build reproducibility, and CI/CD pipeline security to ensure the build process is protected against injection, tampering, and unauthorized modification.

**Common Root Causes**:
   - [common] **Dependencies with known critical CVEs not updated**: Teams often neglect dependency updates, especially for packages that "work fine." Over time, vulnerabilities are discovered in these packages. Without automated monitoring and update processes, applications accumulate known-vulnerable dependencies that attackers can exploit using public CVE information.
   - [common] **No lockfile committed allowing unpredictable dependency resolution**: Without lockfiles (package-lock.json, yarn.lock, Pipfile.lock), each installation may pull different versions of transitive dependencies. This creates inconsistent environments and allows vulnerable versions to be pulled in without awareness. A dependency that was safe yesterday may have a vulnerable update published today.
   - [occasional] **Unpinned version ranges (* or ^x.x.x) enabling malicious version injection**: Packages downloaded from public registries without integrity verification can be compromised through typosquatting, dependency confusion, or registry compromise. Without checksums, signatures, or SRI hashes, there is no guarantee that the downloaded package matches the expected content.
   - [occasional] **No dependency scanning in CI/CD pipeline**: CI/CD pipelines often have broad access to production environments, cloud infrastructure, and deployment credentials. If the pipeline is compromised through a vulnerable dependency or malicious contribution, the attacker gains access to everything the pipeline can access.

**Remediation**:
   - [Critical] Implement automated dependency scanning with npm audit and Snyk (Difficulty: Easy)
   - [High] Enforce lockfile usage and prevent builds without lockfiles (Difficulty: Easy)
   - [High] Pin all dependencies to exact versions with integrity hashes (Difficulty: Easy)
   - [Medium] Add CI/CD pipeline dependency verification step (Difficulty: Medium)

**Verification Steps**:
   1. Run automated vulnerability scanning (npm audit, Snyk, OSV-Scanner) and confirm no critical or high CVEs remain in production dependencies.
   2. Verify that all dependencies are pinned to exact versions (no ^, ~, or *) and lockfiles are committed to version control.
   3. Test that CI/CD pipeline blocks builds when critical vulnerabilities are introduced by adding a known-vulnerable dependency to a test branch and verifying the build fails.
   4. Verify that all CI/CD actions are pinned to commit SHAs instead of tags or branches by reviewing workflow configuration files.
   5. Confirm that dependency integrity hashes in lockfiles are valid by running npm audit signatures and verifying no tampered packages are detected.

**Related Audit Rules**: None

**Related Pentest Rules**: PT-007
---

### PD-006: Business Logic Defects

**Category**: business-logic | **Severity**: High | **CWE**: CWE-362, CWE-367, CWE-840, CWE-1336 | **OWASP**: A04:2021 - Insecure Design, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `payment.*process`
   - `order.*workflow`
   - `state.*transition`
   - `concurrent.*operation`
   - `checkout`
   - `refund`
   - `invoice`
   - `balance.*update`
   - `stock.*update`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Business Process Mapping**: Identify all critical business workflows and state transitions. Map the complete lifecycle of key entities such as orders, payments, and inventory.
   - **Step 2: Exception Path Analysis**: Check how the system handles invalid states, edge cases, and error conditions. Analyze whether error handling introduces security bypasses.
   - **Step 3: Race Condition Detection**: Identify TOCTOU (Time-of-Check to Time-of-Use) vulnerabilities, concurrent request handling issues, and atomicity problems in business operations.
   - **Step 4: Amount & Parameter Manipulation Check**: Verify handling of negative amounts, overflow/underflow, precision attacks, and coupon abuse patterns. Check whether all monetary calculations are secure.

**Common Root Causes**:
   - [common] **No server-side validation of business rules (e.g., negative quantity)**: Business rules such as minimum/maximum quantities, valid price ranges, or allowed discount combinations are only validated on the client side, allowing attackers to bypass them by crafting direct API requests.
   - [common] **Missing transaction isolation enabling race conditions**: Concurrent requests can exploit the gap between reading a value (e.g., inventory count, account balance) and writing the updated value, leading to double-spending, over-selling, or duplicate coupon usage.
   - [occasional] **State machine allows invalid transitions without validation**: The system does not enforce valid state transitions, allowing an attacker to skip required steps (e.g., jumping directly from "pending" to "completed" without payment) or reverse states inappropriately.
   - [occasional] **Floating point arithmetic used for monetary calculations causing precision issues**: Using float or double for currency values introduces rounding errors that can be exploited to manipulate prices, or simply cause incorrect financial calculations. Monetary values require exact decimal arithmetic.

**Remediation**:
   - [Critical] Implement server-side business rule validation for all critical parameters (Difficulty: Easy)
   - [Critical] Use database transactions with proper isolation levels for critical operations (Difficulty: Medium)
   - [High] Enforce state machine transitions with explicit validation (Difficulty: Medium)
   - [High] Use Decimal/BigDecimal types for all monetary calculations (Difficulty: Easy)

**Verification Steps**:
   1. Verify that all business-critical parameters (quantity, amount, price, discount) are validated server-side with explicit range and type checks before processing.
   2. Execute concurrent requests (e.g., 10+ parallel identical requests) against the same resource (e.g., apply coupon, purchase last item) and confirm no double-processing occurs.
   3. Attempt to submit negative quantities, negative amounts, and extremely large values to confirm they are rejected with appropriate error messages.
   4. Attempt to skip workflow steps by directly requesting state transitions (e.g., jump from pending to delivered) and verify the system rejects invalid transitions.
   5. Review all monetary calculations to confirm decimal types (BigDecimal, Decimal, decimal.js) are used instead of floating-point types, and verify precision is preserved throughout calculations.

**Related Audit Rules**: AR-001, AR-002

**Related Pentest Rules**: PT-004

---

## Usage

### How to Use Diagnostic Rules

1. When a finding is identified by an Audit Rule (AR) or Pentest Rule (PT), locate the matching Problem Diagnostic rule (PD)
2. Follow the diagnostic flow step by step to identify the specific defect
3. Check common root causes to understand why the defect exists
4. Apply the remediation guidance with provided code examples
5. Execute verification steps to confirm the fix is effective

### Example: Input Validation Finding

**Step 1**: AR-002 identifies missing input validation on user API endpoint
**Step 2**: Map to PD-001 (Input Validation Defects)
**Step 3**: Follow PD-001 diagnostic flow:
   - Identify all input sources (request body, query params, headers)
   - Check existing validation mechanisms (none found)
   - Assess bypass possibilities (all inputs unvalidated)
   - Verify context-appropriate validation (missing type checks)
**Step 4**: Apply remediation (whitelist validation with Zod/Bean Validation)
**Step 5**: Run verification steps (test all input paths with malicious payloads)

---

*Generated by HOS-Audit-Core | Problems & Diagnostics Module | 2026-06-17*

# HOS-Audit-Core: Problems & Diagnostics Rules

> Systematic problem categorization and guided diagnosis for security findings.

---

## Core Philosophy

- **Diagnosis over Assertion** - Don't just identify the problem, diagnose the root cause
- **Process over Conclusion** - Follow structured diagnostic steps, not one-line judgments
- **Evidence over Speculation** - Every diagnostic conclusion requires evidence
- **Fix over Flag** - Provide actionable remediation, not just problem identification

---

## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Problem Diagnostics | 6 | PD-001 ~ PD-006 |

## Diagnostic Workflow

1. **Problem Identification**: Use AR/PT rules to discover potential issues
2. **Categorization**: Map findings to PD rules for problem classification
3. **Deep Diagnosis**: Follow diagnostic steps to identify root cause
4. **Remediation**: Apply specific fix guidance with code examples
5. **Verification**: Confirm the fix using verification steps

---

## Problem Categories (PD)

### PD-001: Input Validation Defects

**Category**: input-validation | **Severity**: High | **CWE**: CWE-20, CWE-138, CWE-74 | **OWASP**: A03:2021 - Injection, A05:2021 - Security Misconfiguration

**Trigger Patterns**:
   - `req\.body`
   - `req\.query`
   - `req\.params`
   - `request\.getParameter`
   - `request\.getInputStream`
   - `@RequestBody`
   - `@RequestParam`
   - `@PathVariable`
   - `\.parse\(`
   - `\.json\(`
   - `formData`
   - `body\(`
   - `form\(`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Input Source Identification**: Identify all external input sources that the application accepts, including HTTP request parameters, headers, cookies, file uploads, environment variables, and third-party API responses.
   - **Step 2: Validation Mechanism Analysis**: Analyze the validation patterns present for each input source, including type checking, format validation, length constraints, and range validation.
   - **Step 3: Bypass Possibility Assessment**: Evaluate whether existing validation mechanisms can be bypassed through encoding tricks, parameter pollution, alternative input formats, or race conditions.
   - **Step 4: Context-Aware Validation Check**: Verify that validation is appropriate for the specific context in which the data will be used, such as database queries, HTML output, file system operations, or command execution.

**Common Root Causes**:
   - [common] **Developer assumed input is trusted**: Developers often assume that inputs from internal systems, authenticated users, or specific sources are safe, leading to missing or incomplete validation. This assumption breaks down when internal systems are compromised or when trust boundaries change.
   - [common] **Validation only on client-side**: Client-side validation (JavaScript form validation, HTML5 constraints) provides a better user experience but offers zero security guarantee. Attackers can bypass client-side checks by crafting raw HTTP requests directly.
   - [common] **Blacklist approach instead of whitelist**: Using blacklists to block known-bad patterns is inherently incomplete. New attack vectors and encoding techniques constantly emerge, making blacklists a losing strategy. Whitelisting (only allowing known-good patterns) is more robust.
   - [occasional] **Missing type/format validation**: Developers often validate the presence of input without validating its type, format, or range. For example, accepting a string where a number is expected, or accepting arbitrarily long strings that can cause buffer issues or denial of service.

**Remediation**:
   - [High] Implement whitelist-based input validation with strict schemas (Difficulty: Medium)
   - [High] Apply context-appropriate input sanitization and encoding (Difficulty: Medium)
   - [Medium] Implement comprehensive type checking and format validation (Difficulty: Easy)

**Verification Steps**:
   1. Review all input entry points and confirm each has explicit validation defined with strict schemas or rules.
   2. Test validation bypass attempts including URL encoding, double encoding, unicode normalization, and parameter pollution to ensure they are properly rejected.
   3. Verify that server-side validation is enforced independently of any client-side validation by sending crafted requests directly to the API.
   4. Confirm that context-specific encoding/sanitization is applied at each data usage boundary (SQL queries, HTML output, file operations, command execution).
   5. Perform negative testing with malformed, oversized, and unexpected type inputs to ensure the application handles them gracefully without errors or data leakage.

**Related Audit Rules**: AR-001, AR-002, AR-009, AR-010

**Related Pentest Rules**: PT-005, PT-006
---

### PD-002: Authentication & Authorization Defects

**Category**: auth-authorization | **Severity**: Critical | **CWE**: CWE-287, CWE-306, CWE-384, CWE-613 | **OWASP**: A07:2021 - Identification and Authentication Failures, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `login`
   - `authenticate`
   - `authorization`
   - `jwt`
   - `token`
   - `session`
   - `passport`
   - `oauth`
   - `role`
   - `permission`
   - `grant`
   - `access_control`
   - `middleware.*auth`
   - `Bearer`
   - `Authorization.*header`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Authentication Method Analysis**: Identify and analyze all authentication mechanisms used in the application, including password-based, token-based, OAuth, SSO, and multi-factor authentication implementations.
   - **Step 2: Credential Security Assessment**: Evaluate how credentials are stored, transmitted, and managed, including password hashing algorithms, key strength, and secret management practices.
   - **Step 3: Session & Token Validation**: Check session management security including session fixation vulnerabilities, JWT validation completeness, expiration handling, and token storage practices.
   - **Step 4: Access Control Bypass Path Analysis**: Identify paths where access control can be bypassed, including IDOR (Insecure Direct Object References), horizontal privilege escalation, and vertical privilege escalation vulnerabilities.

**Common Root Causes**:
   - [common] **Weak password hashing algorithm (MD5/SHA1)**: Developers use fast cryptographic hash functions (MD5, SHA1) instead of adaptive password hashing functions. These algorithms are designed for speed, making them vulnerable to brute-force and rainbow table attacks. Without proper salting and key stretching, compromised password databases can be cracked in minutes.
   - [common] **Missing token validation/signature check**: JWT or session tokens are accepted without verifying their cryptographic signature, expiration, issuer, or audience. This allows attackers to forge tokens, use expired tokens, or replay tokens from other services. The alg:none attack is a classic example where the token header claims no algorithm is needed.
   - [occasional] **Session ID predictable or not regenerated after login**: Session identifiers are generated using predictable algorithms (e.g., sequential numbers, timestamps) or are not regenerated after the user authenticates. This enables session fixation attacks where an attacker sets a known session ID before the victim logs in, then hijacks the authenticated session.
   - [common] **Access control enforced only on client-side or UI layer**: Authorization checks are performed only in the frontend (hiding buttons, disabling routes) without server-side enforcement. Attackers can bypass UI restrictions by directly calling API endpoints, manipulating HTTP requests, or using tools like curl or Burp Suite to access restricted resources.

**Remediation**:
   - [Critical] Use strong adaptive password hashing (bcrypt or argon2) (Difficulty: Easy)
   - [Critical] Implement comprehensive JWT validation middleware (Difficulty: Easy)
   - [High] Implement secure session handling with proper lifecycle management (Difficulty: Easy)
   - [High] Enforce server-side access control on every endpoint (Difficulty: Medium)

**Verification Steps**:
   1. Verify that password hashes use bcrypt/argon2 with appropriate cost factors by inspecting the stored hash format and hashing configuration in code.
   2. Test JWT validation by attempting to access protected endpoints with expired tokens, modified signatures, and tokens with alg:none header. All should be rejected with 401.
   3. Confirm session IDs are regenerated after login by comparing session ID before and after authentication. Verify session is destroyed on logout.
   4. Attempt IDOR attacks by manipulating resource IDs (user IDs, order IDs) in API requests while authenticated as a different user. All unauthorized access attempts should return 403.
   5. Verify that admin-only endpoints reject requests from regular users even when the UI is bypassed (direct API calls with curl or Burp Suite).

**Related Audit Rules**: AR-003

**Related Pentest Rules**: PT-002, PT-003
---

### PD-003: Data Protection Defects

**Category**: data-protection | **Severity**: Critical | **CWE**: CWE-327, CWE-328, CWE-798, CWE-359 | **OWASP**: A02:2021 - Cryptographic Failures, A04:2021 - Insecure Design

**Trigger Patterns**:
   - `crypto\.encrypt|crypto\.decrypt|Cipher\.encrypt|Cipher\.decrypt`
   - `AES|DES|RSA|Blowfish|TripleDES|MD5|SHA1|SHA256|SHA512`
   - `password.*hash|hash.*password|bcrypt|argon2|pbkdf2|scrypt`
   - `encrypt.*at.*rest|encrypt.*in.*transit|encrypt.*data|decrypt.*data`
   - `secret.*key|private.*key|api.*key|access.*token|encryption.*key`
   - `pii|personal.*data|sensitive.*data|confidential.*data`
   - `mask.*data|redact.*data|anonymize|pseudonymize`
   - `key.*generate|key.*store|key.*rotate|key.*destroy|key.*exchange`
   - `kms|key.*management|key.*vault|hsm`
   - `data.*at.*rest|data.*in.*transit|data.*in.*use`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Data Classification**: Identify all sensitive data types handled by the application and their storage locations.
   - **Step 2: Encryption Algorithm Assessment**: Evaluate the cryptographic algorithms, key lengths, and modes of operation used for data protection.
   - **Step 3: Key Management Analysis**: Check cryptographic key generation, storage, rotation, and destruction practices.
   - **Step 4: Data Exposure & Masking Check**: Verify that sensitive data is not exposed in logs, API responses, error messages, or user interfaces.

**Common Root Causes**:
   - [common] **Deprecated or weak cryptographic algorithm (DES, MD5, SHA1)**: Developers may use outdated algorithms due to legacy code, lack of security awareness, or framework defaults. These algorithms have known vulnerabilities: DES has a 56-bit key that can be brute-forced, MD5 has collision attacks, and SHA1 is deprecated for cryptographic use.
   - [common] **Hardcoded encryption keys or secrets in source code**: Developers often embed keys directly in code for convenience during development and forget to externalize them. These keys become accessible to anyone with code repository access and are frequently committed to version control systems.
   - [occasional] **Missing encryption at rest for sensitive data storage**: Sensitive data may be stored in plaintext in databases, caches, or file systems because encryption was considered unnecessary for internal data, or the complexity of key management was avoided. This exposes data if storage media is compromised.
   - [common] **Sensitive data logged or returned in API responses without masking**: Verbose logging for debugging or overly permissive API serialization can expose passwords, tokens, PII, and other sensitive data. Developers may not realize that logging frameworks capture full objects or that API responses include all model fields by default.

**Remediation**:
   - [Critical] Replace weak cryptographic algorithms with AES-256-GCM for symmetric encryption and RSA-4096 or ECC for asymmetric encryption. (Difficulty: Medium)
   - [Critical] Implement secure key management using a Key Management Service (KMS) or secrets manager instead of hardcoded keys. (Difficulty: Medium)
   - [High] Implement data masking for sensitive fields in logs, API responses, and error messages. (Difficulty: Easy)
   - [Critical] Use Argon2id for password hashing with appropriate memory and iteration parameters. (Difficulty: Easy)

**Verification Steps**:
   1. Run static analysis to confirm no deprecated algorithms (DES, MD5, SHA1, RC4) remain in the codebase.
   2. Verify all encryption keys are stored in a KMS or secrets manager, not hardcoded or in version control.
   3. Test that sensitive data fields (passwords, tokens, PII) are masked or excluded from log output and API responses.
   4. Confirm password hashing uses Argon2id, bcrypt, or scrypt with appropriate work factors, and verify against rainbow table attacks.
   5. Perform a data flow review to ensure sensitive data is encrypted both at rest and in transit, with no plaintext exposure in caches, temp files, or error messages.

**Related Audit Rules**: AR-004

**Related Pentest Rules**: PT-005
---

### PD-004: Configuration & Deployment Defects

**Category**: config-deployment | **Severity**: High | **CWE**: CWE-16, CWE-209, CWE-614, CWE-942 | **OWASP**: A05:2021 - Security Misconfiguration, A09:2021 - Security Logging and Monitoring Failures

**Trigger Patterns**:
   - `app\.use\(.*cors`
   - `CORS|Access-Control`
   - `CSP|Content-Security-Policy`
   - `X-Frame-Options|X-XSS-Protection|X-Content-Type`
   - `HSTS|Strict-Transport-Security`
   - `debug.*true|DEBUG.*=.*true`
   - `stacktrace|stack_trace|traceback`
   - `app\.listen\(|server\.listen\(`
   - `environment.*variable|process\.env`
   - `secret.*key|SECRET_KEY`
   - `allowedHosts|ALLOWED_HOSTS`
   - `ssl|tls|https`
   - `certificate|cert`
   - `nginx|apache|iis`
   - `docker|container|kubernetes|k8s`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Configuration Review**: Audit all security-relevant configuration settings across the application, infrastructure, and deployment environment.
   - **Step 2: Default Settings Check**: Identify insecure default settings such as default credentials, debug mode enabled in production, verbose error messages, and framework defaults that are unsafe for production.
   - **Step 3: Exposure Surface Analysis**: Check for exposed endpoints, open ports, unnecessary services, and information disclosure that could provide attack vectors.
   - **Step 4: Transport Security Verification**: Verify TLS/SSL configuration, certificate validity, HSTS headers, and overall transport layer security settings.

**Common Root Causes**:
   - [common] **Debug mode enabled in production environment**: Developers enable debug mode during development for easier troubleshooting but fail to disable it before deploying to production. This exposes detailed error messages, stack traces, and potentially sensitive application internals to end users.
   - [common] **Default credentials not changed after deployment**: Software packages, databases, cloud services, and frameworks often ship with well-known default credentials (admin/admin, root/root). If these are not changed before or immediately after deployment, attackers can easily gain access using publicly available documentation of default credentials.
   - [common] **CORS configured with wildcard (*) allowing any origin**: Cross-Origin Resource Sharing (CORS) is configured to allow requests from any origin (Access-Control-Allow-Origin: *) rather than restricting to a specific allowlist of trusted domains. This removes the browser's same-origin protection and can enable cross-site request forgery and data exfiltration attacks.
   - [common] **Missing security headers (X-Frame-Options, CSP, X-Content-Type-Options)**: Web applications lack critical HTTP security headers that provide defense-in-depth protections. Without X-Frame-Options, the application is vulnerable to clickjacking. Without Content-Security-Policy (CSP), XSS attacks are more likely to succeed. Without X-Content-Type-Options, MIME type sniffing can lead to unexpected content execution.

**Remediation**:
   - [High] Disable debug mode in production environment (Difficulty: Easy)
   - [High] Enforce HTTPS with HSTS headers (Difficulty: Medium)
   - [High] Implement restrictive CORS policy (Difficulty: Easy)
   - [High] Configure security headers middleware (Difficulty: Easy)

**Verification Steps**:
   1. Confirm debug mode is disabled in production by checking that error responses return generic messages without stack traces or internal details.
   2. Verify HTTPS enforcement by accessing the application via HTTP and confirming automatic redirect to HTTPS with a 301 status code.
   3. Test CORS policy by sending a cross-origin request from an unauthorized domain and confirming the response lacks Access-Control-Allow-Origin header or is rejected.
   4. Scan HTTP response headers to verify all security headers are present (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Strict-Transport-Security) with correct values.
   5. Run a TLS configuration test (e.g., SSL Labs, testssl.sh) to confirm TLS 1.2+ is enforced, weak ciphers are disabled, and certificates are valid.

**Related Audit Rules**: AR-002, AR-003

**Related Pentest Rules**: PT-001, PT-007
---

### PD-005: Dependency & Supply Chain Defects

**Category**: dependency-supply-chain | **Severity**: High | **CWE**: CWE-829, CWE-1104, CWE-1395 | **OWASP**: A06:2021 - Vulnerable and Outdated Components, A08:2021 - Software and Data Integrity Failures

**Trigger Patterns**:
   - `package\.json|requirements\.txt|pom\.xml|Gemfile|Cargo\.toml`
   - `go\.mod|go\.sum|composer\.json|nuget\.config`
   - `import.*from.*|require\(|include`
   - `npm.*install|pip.*install|gem.*install|cargo.*add`
   - `vulnerability|CVE|advisory|security.*update`
   - `lockfile|package-lock|yarn\.lock|poetry\.lock`
   - `build.*pipeline|CI/CD|github.*actions|jenkinsfile`
   - `supply.*chain|dependency.*chain|third.*party`
   - `sbom|software.*bill.*of.*materials`
   - `signature.*verify|checksum|hash.*verify`
   - `registry.*config|npm.*registry|pypi.*index`
   - `submodule|vendor|external.*dependency`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Dependency Analysis**: Inventory all direct and transitive dependencies, their versions, and their role in the application. Identify outdated packages and understand the full dependency tree.
   - **Step 2: CVE Mapping**: Check dependencies against known vulnerability databases to identify packages with known CVEs. Assess the exploitability and impact of each vulnerability in the context of your application.
   - **Step 3: Supply Chain Risk Assessment**: Verify package authenticity, check for typosquatting packages, review maintainer trust, and assess the overall supply chain risk of dependencies.
   - **Step 4: Build Pipeline Integrity**: Verify lockfile integrity, build reproducibility, and CI/CD pipeline security to ensure the build process is protected against injection, tampering, and unauthorized modification.

**Common Root Causes**:
   - [common] **Dependencies with known critical CVEs not updated**: Teams often neglect dependency updates, especially for packages that "work fine." Over time, vulnerabilities are discovered in these packages. Without automated monitoring and update processes, applications accumulate known-vulnerable dependencies that attackers can exploit using public CVE information.
   - [common] **No lockfile committed allowing unpredictable dependency resolution**: Without lockfiles (package-lock.json, yarn.lock, Pipfile.lock), each installation may pull different versions of transitive dependencies. This creates inconsistent environments and allows vulnerable versions to be pulled in without awareness. A dependency that was safe yesterday may have a vulnerable update published today.
   - [occasional] **Unpinned version ranges (* or ^x.x.x) enabling malicious version injection**: Packages downloaded from public registries without integrity verification can be compromised through typosquatting, dependency confusion, or registry compromise. Without checksums, signatures, or SRI hashes, there is no guarantee that the downloaded package matches the expected content.
   - [occasional] **No dependency scanning in CI/CD pipeline**: CI/CD pipelines often have broad access to production environments, cloud infrastructure, and deployment credentials. If the pipeline is compromised through a vulnerable dependency or malicious contribution, the attacker gains access to everything the pipeline can access.

**Remediation**:
   - [Critical] Implement automated dependency scanning with npm audit and Snyk (Difficulty: Easy)
   - [High] Enforce lockfile usage and prevent builds without lockfiles (Difficulty: Easy)
   - [High] Pin all dependencies to exact versions with integrity hashes (Difficulty: Easy)
   - [Medium] Add CI/CD pipeline dependency verification step (Difficulty: Medium)

**Verification Steps**:
   1. Run automated vulnerability scanning (npm audit, Snyk, OSV-Scanner) and confirm no critical or high CVEs remain in production dependencies.
   2. Verify that all dependencies are pinned to exact versions (no ^, ~, or *) and lockfiles are committed to version control.
   3. Test that CI/CD pipeline blocks builds when critical vulnerabilities are introduced by adding a known-vulnerable dependency to a test branch and verifying the build fails.
   4. Verify that all CI/CD actions are pinned to commit SHAs instead of tags or branches by reviewing workflow configuration files.
   5. Confirm that dependency integrity hashes in lockfiles are valid by running npm audit signatures and verifying no tampered packages are detected.

**Related Audit Rules**: None

**Related Pentest Rules**: PT-007
---

### PD-006: Business Logic Defects

**Category**: business-logic | **Severity**: High | **CWE**: CWE-362, CWE-367, CWE-840, CWE-1336 | **OWASP**: A04:2021 - Insecure Design, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `payment.*process`
   - `order.*workflow`
   - `state.*transition`
   - `concurrent.*operation`
   - `checkout`
   - `refund`
   - `invoice`
   - `balance.*update`
   - `stock.*update`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go, rust

**Diagnostic Flow**:
   - **Step 1: Business Process Mapping**: Identify all critical business workflows and state transitions. Map the complete lifecycle of key entities such as orders, payments, and inventory.
   - **Step 2: Exception Path Analysis**: Check how the system handles invalid states, edge cases, and error conditions. Analyze whether error handling introduces security bypasses.
   - **Step 3: Race Condition Detection**: Identify TOCTOU (Time-of-Check to Time-of-Use) vulnerabilities, concurrent request handling issues, and atomicity problems in business operations.
   - **Step 4: Amount & Parameter Manipulation Check**: Verify handling of negative amounts, overflow/underflow, precision attacks, and coupon abuse patterns. Check whether all monetary calculations are secure.

**Common Root Causes**:
   - [common] **No server-side validation of business rules (e.g., negative quantity)**: Business rules such as minimum/maximum quantities, valid price ranges, or allowed discount combinations are only validated on the client side, allowing attackers to bypass them by crafting direct API requests.
   - [common] **Missing transaction isolation enabling race conditions**: Concurrent requests can exploit the gap between reading a value (e.g., inventory count, account balance) and writing the updated value, leading to double-spending, over-selling, or duplicate coupon usage.
   - [occasional] **State machine allows invalid transitions without validation**: The system does not enforce valid state transitions, allowing an attacker to skip required steps (e.g., jumping directly from "pending" to "completed" without payment) or reverse states inappropriately.
   - [occasional] **Floating point arithmetic used for monetary calculations causing precision issues**: Using float or double for currency values introduces rounding errors that can be exploited to manipulate prices, or simply cause incorrect financial calculations. Monetary values require exact decimal arithmetic.

**Remediation**:
   - [Critical] Implement server-side business rule validation for all critical parameters (Difficulty: Easy)
   - [Critical] Use database transactions with proper isolation levels for critical operations (Difficulty: Medium)
   - [High] Enforce state machine transitions with explicit validation (Difficulty: Medium)
   - [High] Use Decimal/BigDecimal types for all monetary calculations (Difficulty: Easy)

**Verification Steps**:
   1. Verify that all business-critical parameters (quantity, amount, price, discount) are validated server-side with explicit range and type checks before processing.
   2. Execute concurrent requests (e.g., 10+ parallel identical requests) against the same resource (e.g., apply coupon, purchase last item) and confirm no double-processing occurs.
   3. Attempt to submit negative quantities, negative amounts, and extremely large values to confirm they are rejected with appropriate error messages.
   4. Attempt to skip workflow steps by directly requesting state transitions (e.g., jump from pending to delivered) and verify the system rejects invalid transitions.
   5. Review all monetary calculations to confirm decimal types (BigDecimal, Decimal, decimal.js) are used instead of floating-point types, and verify precision is preserved throughout calculations.

**Related Audit Rules**: AR-001, AR-002

**Related Pentest Rules**: PT-004

---

## Usage

### How to Use Diagnostic Rules

1. When a finding is identified by an Audit Rule (AR) or Pentest Rule (PT), locate the matching Problem Diagnostic rule (PD)
2. Follow the diagnostic flow step by step to identify the specific defect
3. Check common root causes to understand why the defect exists
4. Apply the remediation guidance with provided code examples
5. Execute verification steps to confirm the fix is effective

### Example: Input Validation Finding

**Step 1**: AR-002 identifies missing input validation on user API endpoint
**Step 2**: Map to PD-001 (Input Validation Defects)
**Step 3**: Follow PD-001 diagnostic flow:
   - Identify all input sources (request body, query params, headers)
   - Check existing validation mechanisms (none found)
   - Assess bypass possibilities (all inputs unvalidated)
   - Verify context-appropriate validation (missing type checks)
**Step 4**: Apply remediation (whitelist validation with Zod/Bean Validation)
**Step 5**: Run verification steps (test all input paths with malicious payloads)

---

*Generated by HOS-Audit-Core | Problems & Diagnostics Module | 2026-06-17*
