# Domain: API Security

**Purpose**: Security assessment of REST, GraphQL, and gRPC APIs

**Size Target**: 700-1000 lines
**Load Timing**: Dynamic (when auditing APIs)
**Token Cost**: ~700 tokens

## Scope

This domain covers:
- REST API security
- GraphQL-specific vulnerabilities
- gRPC security
- API authentication (API keys, OAuth, mTLS)
- Rate limiting and throttling
- Input validation for APIs
- Data exposure through APIs
- API versioning and deprecation
- OpenAPI/Swagger exposure

**Related Domains**: web.md (web APIs), cloud.md (cloud-hosted APIs)

## REST API Security

### 1. API Authentication

**Check**:
- [ ] How is API authenticated? (API key, OAuth, JWT, mTLS)
- [ ] Are credentials transmitted securely?
- [ ] Is authentication required for all endpoints?
- [ ] Are public endpoints intentionally public?
- [ ] Can credentials be reused?
- [ ] Do credentials expire?
- [ ] Is there credential rotation?

**Authentication Methods**:

```
API Key
✓ Simple for public APIs
✗ Can be leaked in client code
✗ No granular permissions
✓ Use: Public/read-only APIs only
- Include in header: Authorization: Bearer [key]

OAuth 2.0
✓ Delegated access
✓ Granular permissions (scopes)
✓ Token expiration
✗ Complex to implement
✓ Use: Third-party integrations

JWT (JSON Web Tokens)
✓ Stateless
✓ Self-contained
✓ Expiration built-in
✗ Token revocation difficult
✓ Use: Microservices, internal APIs

mTLS (Mutual TLS)
✓ Strongest: Client certificate required
✓ No token to steal
✗ Complex infrastructure
✓ Use: Service-to-service communication
```

**Look For**:
- API key in URL instead of header
- Credentials not encrypted in transit
- Credentials hard-coded in client code
- No authentication on sensitive endpoints
- Credentials that never expire
- No token refresh/rotation mechanism

### 2. API Authorization

**Check**:
- [ ] Does API verify user has permission?
- [ ] Can user access other user's data?
- [ ] Can user perform unauthorized operations?
- [ ] Are permissions enforced at operation level?
- [ ] Broken Object Level Authorization (BOLA)?
- [ ] Attribute-based access control (ABAC)?

**BOLA (Broken Object Level Authorization)**:

```
VULNERABLE:
GET /api/users/123 → Returns user 123's data (no permission check)
Attacker tries: GET /api/users/456 → Returns user 456's data

SECURE:
GET /api/users/123
1. Verify authentication
2. Verify user is 123 or admin
3. Return data only if authorized

OR

GET /api/users/me → Returns authenticated user's data only
```

**Look For**:
- Missing permission checks
- User IDs directly in URL (if permission not checked)
- Same endpoint returns different data per user (no auth)
- Admin operations available to regular users

### 3. Rate Limiting & Throttling

**Check**:
- [ ] Is rate limiting enforced?
- [ ] Per-user rate limit? Or per-IP?
- [ ] Limits reasonable? (Not too high)
- [ ] Can limits be bypassed? (Multiple IPs, credentials)
- [ ] Distributed rate limiting? (Across servers)
- [ ] Rate limit headers informative?

**Rate Limiting Strategy**:

```
Endpoint Risk | Rate Limit | Strategy
─────────────────────────────────────
Login        | 5/min/IP | Strict, prevents brute force
API read     | 100/min  | Moderate, per-user or IP
Data export  | 1/hour   | Strict, prevents bulk download
Search       | 30/min   | Moderate, prevents DoS
Upload       | 10/hour  | Strict, resource intensive
```

**HTTP Headers**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 45
RateLimit-Reset: 1623456789

Client sees: 45 requests remaining, resets at timestamp
```

**Look For**:
- No rate limiting on any endpoint
- Rate limit too high (unlimited effectively)
- Limit per-IP only (multiple IPs bypass)
- Distributed attack possible (bypass limit)
- Rate limit bypass via API key or authentication bypass

### 4. Input Validation

**Check**:
- [ ] All inputs validated?
- [ ] Input type validated?
- [ ] Input length limited?
- [ ] Input pattern validated?
- [ ] Injection possible? (SQL, command, template)
- [ ] XML External Entities (XXE) possible?
- [ ] JSON bomb (nested structure DoS)?

**Validation by Type**:

```
String Input:
✓ Max length enforced
✓ Allowed characters restricted
✓ Special characters escaped
✗ No validation (injection possible)

Number Input:
✓ Type validated (integer vs float)
✓ Range checked
✓ Negative values if appropriate
✗ No type check (string as ID)

Email Input:
✓ Format validated (basic regex)
✓ Length limited (254 chars max)
✗ Accept obviously wrong emails

Date Input:
✓ Format validated
✓ Future dates rejected if not appropriate
✗ Accept invalid dates
```

**Look For**:
- No input validation
- Type confusion attacks
- Excessive input lengths
- Injection points (SQL, command, LDAP)
- XXE in XML endpoints
- JSON bomb attacks

### 5. Excessive Data Exposure (OWASP API2)

**Check**:
- [ ] Does API return only necessary fields?
- [ ] Does API expose internal IDs?
- [ ] Does API expose sensitive attributes?
- [ ] Is pagination data consistent?
- [ ] Error messages expose too much?
- [ ] Can user extract large amounts of data?

**Data Exposure Examples**:

```
VULNERABLE API:
GET /api/users/123
{
  "id": 123,
  "username": "alice",
  "email": "alice@example.com",
  "password_hash": "bcrypt_hash_here",
  "credit_card": "1234-5678-9012-3456",
  "salary": 100000,
  "social_security": "123-45-6789",
  "internal_user_id": "db_12345_internal"
}

SECURE API:
GET /api/users/123/profile
{
  "username": "alice",
  "email": "alice@example.com",
  "profile_picture": "url"
}
```

**Data Exposure Vectors**:
1. **Field exposure** - Returning unnecessary fields
2. **List endpoints** - Returning full objects instead of summaries
3. **Error messages** - Revealing sensitive data in errors
4. **Pagination** - Allowing extraction of all records
5. **Filtering** - Allowing inference of hidden data
6. **Resource expansion** - Nested objects with sensitive data

**Look For**:
- API returning full objects
- Sensitive fields in API responses
- Internal system data exposed
- Password hashes in responses
- Can extract entire database through API

### 6. Broken Function Level Authorization

**Check**:
- [ ] Are admin operations protected?
- [ ] Can regular user call admin endpoints?
- [ ] Is authorization checked before operation?
- [ ] Are operations hidden or just not protected?

**Examples**:

```
VULNERABLE:
GET /api/admin/users → No auth check, returns all users
DELETE /api/accounts/123 → Any user can delete any account
POST /api/users → Any user can create admin account

SECURE:
GET /api/admin/users → Checks admin role first
DELETE /api/accounts/{id} → Checks user owns account
POST /api/users → Checks admin role, validates fields
```

**Look For**:
- Admin functions accessible without admin role
- Operations that don't check authorization
- No difference in error messages between forbidden vs not found

### 7. GraphQL-Specific Vulnerabilities

**Check** (if GraphQL API):
- [ ] Query complexity limits? (DoS prevention)
- [ ] Introspection disabled in production?
- [ ] Deeply nested queries allowed?
- [ ] Batch queries allowed? (Rate limit bypass)
- [ ] Field-level authorization?
- [ ] Query timeout configured?

**GraphQL Vulnerabilities**:

```
Query Complexity DoS:
query {
  user(id: 1) {
    friends {
      friends {
        friends {
          friends {
            ... (deeply nested)
          }
        }
      }
    }
  }
}
→ Can crash server

Introspection Abuse:
query {
  __schema {
    types {
      name
      fields {
        name
        type
      }
    }
  }
}
→ Can discover entire API structure

Batch Query DoS:
[
  query1,
  query2,
  query3,
  ... (many queries)
]
→ Can bypass rate limits

Field-Level Auth Bypass:
query {
  user(id: 1) {
    email    # Protected field
    password # Protected field
  }
}
→ Field auth not enforced
```

**Look For**:
- GraphQL introspection enabled in production
- No query complexity limits
- Unbounded nested queries allowed
- Batch queries allowed
- Missing field-level authorization
- No query timeouts

### 8. API Versioning & Deprecation

**Check**:
- [ ] How are API versions managed?
- [ ] Are old versions still supported?
- [ ] Security patches in old versions?
- [ ] Is upgrade path clear?
- [ ] Deprecated endpoints removed?
- [ ] Breaking changes documented?

**Versioning Strategies**:

```
URL Path:
GET /api/v1/users → Version in URL
GET /api/v2/users → Upgrade requires code change

Header:
GET /api/users
Accept-Version: v1 → Version in header

Query Parameter:
GET /api/users?version=1 → Version in query

Default Behavior:
GET /api/users → Use latest by default
→ Forces API users to stay current
```

**Look For**:
- Old versions still supported (maintenance burden)
- Old versions have unpatched security issues
- No migration path for users
- API breaking changes without warning

### 9. OpenAPI/Swagger Exposure

**Check**:
- [ ] Is OpenAPI specification exposed?
- [ ] Is Swagger UI accessible?
- [ ] Does it reveal internal structure?
- [ ] Does it contain credentials?
- [ ] Is it documented enough to exploit?

**OpenAPI Security**:

```
VULNERABLE:
GET /swagger.json → Entire API structure exposed
/api-docs → All endpoints documented
/swagger-ui.html → Interactive UI accessible

SECURE:
/swagger.json → Protected behind authentication
/api-docs → Not in production
/swagger-ui.html → Only for internal developers
Internal only: VPN restricted
```

**Look For**:
- Swagger/OpenAPI publicly accessible
- Documentation reveals implementation details
- Credentials in documentation
- All endpoints documented

### 10. API Key Management

**Check** (if using API keys):
- [ ] Are API keys transmitted securely?
- [ ] Can API keys be leaked? (Client code, logs)
- [ ] Can API keys be revoked?
- [ ] Do API keys expire?
- [ ] Can API keys be rotated?
- [ ] Are API keys properly scoped?

**API Key Security**:

```
WRONG:
- Hardcoded in frontend code
- Sent in URL: /api/users?key=abc123
- Stored in plaintext logs
- Never rotate/expire
- Universal key (all permissions)

RIGHT:
- Stored in secure backend
- Sent in Authorization header
- Masked in logs
- Rotate regularly (90 days)
- Scoped to specific permissions
- Can be revoked immediately
- Different keys for different environments
```

**Look For**:
- API keys in client-side code
- Keys in logs
- Keys in version control
- Keys never expire
- No key rotation policy

---

## gRPC API Security

### 1. gRPC Authentication

**Check**:
- [ ] Transport security (TLS)?
- [ ] Mutual authentication (mTLS)?
- [ ] Authentication per-call?
- [ ] Credentials transmitted securely?

### 2. gRPC Authorization

**Check**:
- [ ] Role-based access control?
- [ ] Per-method authorization?
- [ ] Context propagation?

---

## API Security Testing

### Manual Testing Checklist

```
Authentication:
[ ] Can access without credentials?
[ ] Can use expired credentials?
[ ] Can use invalid credentials?
[ ] Can guess API keys?

Authorization:
[ ] Can access other user's resources?
[ ] Can perform privileged operations?
[ ] Can modify other users' data?
[ ] Can escalate privileges?

Input Validation:
[ ] Can inject SQL?
[ ] Can execute commands?
[ ] Can cause XXE?
[ ] Can send oversized input?

Rate Limiting:
[ ] Can exceed rate limit?
[ ] Can bypass rate limit?
[ ] Can cause DoS?

Data Exposure:
[ ] Does API leak sensitive data?
[ ] Can extract large datasets?
[ ] Can infer hidden data?

API Behavior:
[ ] Do error messages reveal information?
[ ] Can discover API structure?
[ ] Are responses consistent?
```

### API Scanning Tools

```
Automated Tools:
- OWASP ZAP (REST APIs)
- Burp Suite (REST APIs)
- Postman (REST APIs)
- Apollo Studio (GraphQL)
- GraphQL Voyager (GraphQL)

Manual Testing:
- curl / Postman / Insomnia
- Browser DevTools (XHR/Fetch)
- Proxy (OWASP ZAP / Burp Suite)
- Custom scripts (Python, JavaScript)
```

---

## API Audit Workflow

```
1. DISCOVER API
   Endpoints? Methods? Authentication? Format?

2. AUTHENTICATE
   How to authenticate? Do we have credentials?
   What permissions do our credentials have?

3. ENUMERATE
   What endpoints exist?
   What objects/resources?
   What operations?

4. ANALYZE inputs
   What is required?
   What is optional?
   What formats accepted?

5. ANALYZE outputs
   What data returned?
   What fields exposed?
   Any sensitive data?

6. TEST authorization
   Can access other user's data?
   Can perform privileged operations?

7. TEST inputs
   Injection possible?
   Rate limits enforced?
   Bounds checking?

8. DOCUMENT findings
   Evidence from requests/responses?
   Confidence assessment?
   Remediation clear?
```

---

## Common API Vulnerabilities

| Vulnerability | Example | Impact |
|---------------|---------|--------|
| **Broken Auth** | No auth required, expired tokens accepted | Unauthorized access |
| **Broken Authz** | Can access other user's data | Data breach |
| **Excessive Data** | API returns full objects | Data exposure |
| **Rate Limit** | 1000s of requests/sec possible | Brute force, DoS |
| **Injection** | SQL injection in filter | Database compromise |
| **Broken Function Auth** | Admin operations without admin | Privilege escalation |
| **Mass Assignment** | Can modify admin fields | Privilege escalation |
| **XXE** | XML parser exploitable | Data exposure, RCE |
| **CORS** | Misconfigured CORS | XSS, data exposure |
| **Mass Assignment** | Can modify sensitive fields | Unauthorized changes |

