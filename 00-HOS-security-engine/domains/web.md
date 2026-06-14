# Domain: Web Application Security

**Purpose**: Security assessment of web applications

**Size Target**: 700-1000 lines
**Load Timing**: Dynamic (when auditing web apps)
**Token Cost**: ~700 tokens

## Scope

This domain covers:
- Server-side rendering applications
- Client-side logic (JavaScript, etc.)
- HTTP protocol security
- Browser security features
- Session management
- CSRF protection
- XSS prevention
- Security headers
- Authentication flows
- File upload handling
- API endpoints (detailed API security see: api.md)

**Related Domains**: code-audit.md (if backend code review), api.md (if REST API)

## Web Application Security Checklist

### 1. HTTPS & Transport Security

**Check**:
- [ ] All pages served over HTTPS?
- [ ] HSTS header present? (`Strict-Transport-Security`)
- [ ] TLS version 1.2+?
- [ ] Strong cipher suites configured?
- [ ] Certificate valid and trusted?
- [ ] Mixed content (HTTP resources on HTTPS)? None?
- [ ] Certificate pinning (if applicable)?
- [ ] Downgrade attacks possible?

**Look For**:
- HTTP endpoints (not redirected to HTTPS)
- HSTS header missing (redirect possible)
- TLS 1.0/1.1 still supported
- Weak ciphers enabled
- Expired/self-signed certificates
- Mixed HTTP/HTTPS content

### 2. Cross-Site Scripting (XSS)

**Check**:
- [ ] User input reflected in responses?
- [ ] DOM updated from untrusted sources?
- [ ] Output encoding applied? (HTML, JavaScript, URL context)
- [ ] Content Security Policy (CSP) header?
- [ ] X-XSS-Protection header?
- [ ] X-Content-Type-Options: nosniff?
- [ ] Script execution prevention?

**XSS Types**:

**Reflected XSS**:
```
VULNERABLE: 
?search=<script>alert(1)</script>
→ Output: Results for <script>alert(1)</script>

SAFE:
Output: Results for &lt;script&gt;alert(1)&lt;/script&gt;
```

**Stored XSS**:
```
VULNERABLE:
User uploads: <img src=x onerror=alert(1)>
→ Stored in profile
→ All viewers executed

SAFE:
Stored as HTML entity, rendered safely
```

**DOM-based XSS**:
```
VULNERABLE:
document.location.hash → dangerous sink (eval, innerHTML, etc)

SAFE:
Sanitized → inserted into textContent
```

**Look For**:
- URL parameters in output (no encoding)
- User data in HTML (not escaped)
- User data in JavaScript (not quoted/escaped)
- DOM manipulation from user input
- Missing CSP header
- eval() or similar dangerous functions

### 3. Cross-Site Request Forgery (CSRF)

**Check**:
- [ ] State-changing requests protected?
- [ ] CSRF tokens present? (POST, PUT, DELETE)
- [ ] Token validation working?
- [ ] Tokens unique per request/session?
- [ ] SameSite cookie attribute set?
- [ ] Double-Submit cookie pattern (if used)?
- [ ] Referer header validation?

**CSRF Protection Methods**:

```
Method 1: CSRF Token
- Generate unique token per request
- Include in form/API call
- Server validates token matches session

Method 2: SameSite Cookie
- SameSite=Strict → No cross-site requests
- SameSite=Lax → Only safe methods cross-site
- SameSite=None → Requires Secure flag

Method 3: Double-Submit Cookie
- Client sends same value in cookie and body
- Server compares
- (Weaker than tokens)

Method 4: Custom Headers
- Only JavaScript can add custom headers
- Attacker can't include from other sites
```

**Look For**:
- Form submissions without CSRF tokens
- CSRF tokens not validated
- Tokens reused across requests
- No SameSite cookie attribute
- SameSite=None without Secure flag

### 4. Authentication Issues

**Check**:
- [ ] How are users authenticated?
- [ ] Credentials transmitted over HTTPS?
- [ ] Password reset flow secure?
- [ ] Account enumeration possible? (timing attacks)
- [ ] Brute force prevention? (Rate limiting, lockout)
- [ ] Sessions created after successful auth?
- [ ] Default credentials removed?
- [ ] Weak passwords accepted?

**Password Reset Flow**:
```
VULNERABLE:
1. User enters email
2. Send reset link to email
3. Link contains: /reset?user_id=123
4. No expiration
5. Token reusable

SECURE:
1. User enters email
2. Generate cryptographically random token
3. Token stored server-side with expiration (15 min)
4. Send link: /reset?token=[random]
5. On reset, validate token and immediately expire
6. Change password
```

**Look For**:
- Passwords sent in plain text
- Account enumeration timing attacks
- No rate limiting on login
- Default credentials
- Password reset token reusable
- Password reset link expires too late/never

### 5. Session Management

**Check**:
- [ ] Session tokens generated securely?
- [ ] Session token length sufficient? (256+ bits)
- [ ] Session storage secure? (HttpOnly, Secure flags)
- [ ] Session timeout configured?
- [ ] Logout clears session?
- [ ] Session fixation possible? (New token after login?)
- [ ] Concurrent sessions allowed? (If yes, why?)
- [ ] Session token in URL? (No - use cookies)

**Session Security Flags**:

```
Cookie Attributes Needed:
✓ HttpOnly     - Prevent JavaScript access
✓ Secure       - HTTPS only
✓ SameSite     - CSRF protection
✓ Domain       - Restrict to domain only
✓ Path         - Restrict to application path
✓ Max-Age      - Session expiration

WRONG:
Set-Cookie: sessionid=abc123

RIGHT:
Set-Cookie: sessionid=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/; Domain=.example.com
```

**Look For**:
- Session tokens in URLs
- Cookies without HttpOnly flag
- Cookies without Secure flag on HTTPS site
- No SameSite attribute
- Long session timeouts
- Logout doesn't clear session
- Session reuse after login

### 6. Authorization Issues

**Check**:
- [ ] Are users restricted to their own data?
- [ ] Can user access other user's resources?
- [ ] Function-level authorization enforced? (Admin functions)
- [ ] Horizontal privilege escalation possible?
- [ ] Vertical privilege escalation possible?
- [ ] Direct object references (BOLA)?

**Authorization Test Cases**:

```
Test 1: Access Own Data
✓ User can view own profile

Test 2: Access Other User Data
✗ User CANNOT view other user profile

Test 3: Access Admin Functions
✗ Regular user CANNOT access admin panel

Test 4: Object References
✗ User A cannot access User B's /profile/B

Test 5: Function Authorization
✗ User cannot perform admin operations via direct calls
```

**Look For**:
- Missing authorization checks
- Authorization after data access
- User IDs guessable (1, 2, 3...)
- Same endpoint returns different data per user (no auth check)
- URL parameters dictate access (/admin, /user)

### 7. Security Headers

**Check**:
- [ ] Content-Security-Policy (CSP)?
- [ ] X-Content-Type-Options: nosniff?
- [ ] X-Frame-Options: DENY or SAMEORIGIN?
- [ ] Strict-Transport-Security (HSTS)?
- [ ] X-XSS-Protection (legacy, CSP preferred)?
- [ ] Referrer-Policy configured?
- [ ] Permissions-Policy configured?

**Security Headers Reference**:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
  → Controls what resources can be loaded

X-Content-Type-Options: nosniff
  → Browser won't sniff MIME type

X-Frame-Options: DENY
  → Cannot be embedded in iframes

Strict-Transport-Security: max-age=31536000; includeSubDomains
  → Force HTTPS for 1 year

Referrer-Policy: strict-origin-when-cross-origin
  → Control referrer information

Permissions-Policy: geolocation=(), microphone=()
  → Restrict browser API access
```

**Look For**:
- Missing Security headers
- CSP too permissive ('unsafe-inline')
- X-Frame-Options missing
- HSTS not set
- Referrer-Policy not set

### 8. File Upload Security

**Check**:
- [ ] File type validated? (Content check, not just extension)
- [ ] File size limited?
- [ ] Files stored outside web root?
- [ ] Direct file access prevented?
- [ ] File permissions restricted?
- [ ] Virus scanning? (If applicable)
- [ ] Filename sanitized?
- [ ] Double extension tricks prevented? (file.php.jpg)

**File Upload Checklist**:

```
✓ Validate content (read bytes, not just extension)
✓ Rename uploaded file (random name)
✓ Store outside web root
✓ Serve via script (not direct access)
✓ Limit file size (reasonable limit)
✓ Restrict file types (whitelist)
✓ Check for polyglots (e.g., image + PHP)
✓ Remove metadata
✗ Don't allow .exe, .sh, .php, etc
✗ Don't use user-supplied filename
✗ Don't store in web-accessible directory
```

**Look For**:
- Extension-only validation
- Large files allowed (DoS)
- Uploaded files directly accessible
- Double extensions (bypass filters)
- Executable types allowed
- Metadata not stripped

### 9. Information Disclosure

**Check**:
- [ ] Stack traces visible to users?
- [ ] Detailed error messages? (Path disclosure)
- [ ] Server headers revealing technologies?
- [ ] Debug information in HTML comments?
- [ ] API responses leaking sensitive data?
- [ ] Passwords/tokens in logs?
- [ ] Unnecessary verbose output?

**Information Leakage Points**:

```
Error Messages:
✗ Database connection error showing credentials
✗ File path disclosure in errors
✓ Generic error message: "An error occurred"

HTTP Headers:
✗ Server: Apache/2.4.1 (Ubuntu)
✗ X-Powered-By: PHP/7.4
✓ Minimal headers, version removed

HTML Comments:
✗ <!-- TODO: Fix bug in database query -->
✗ <!-- Debug: variable = xxx -->
✓ No sensitive comments

API Responses:
✗ "User not found" vs "Password incorrect" (user enumeration)
✗ Include full user objects in responses
✓ Consistent error messages
✓ Minimal data in responses
```

**Look For**:
- Stack traces in error pages
- Detailed database errors
- Directory listings
- Debug information
- Version disclosure
- Path disclosure
- Unnecessary API fields

### 10. Security Functionality

**Check**:
- [ ] Logout clears session properly?
- [ ] Timeout log out inactive users?
- [ ] "Remember me" secure? (If provided)
- [ ] Password change requires current password?
- [ ] Email change requires verification?
- [ ] Account deletion irreversible? (Or recoverable for period)
- [ ] Multi-factor authentication (if sensitive app)?

**"Remember Me" Implementation**:

```
VULNERABLE:
Remember me cookie = username + password hash

SECURE:
1. Generate random token
2. Store: token → username + random selector
3. Cookie: [token]:[selector]
4. On load: Verify token + selector match
5. Generate new token on use
6. Expire token after N days
```

**Look For**:
- Logout doesn't clear session/cookies
- "Remember me" stores credentials
- No multi-factor authentication (for sensitive data)
- Account deletion instant (no recovery period)

### 11. Input Validation in Web Context

**Check**:
- [ ] All inputs validated server-side?
- [ ] Client-side validation bypassed?
- [ ] Dangerous characters escaped?
- [ ] Encoding context-aware?
- [ ] File upload filename validated?
- [ ] Path traversal prevented? (../, ..\)

**Context-Aware Encoding**:

```
HTML Context:
< → &lt;
> → &gt;
& → &amp;
" → &quot;
' → &#x27;

JavaScript Context:
Wrap in quotes + escape quotes
"string" vs 'string' vs backticks

URL Context:
Percent encoding (%20, %3C, etc)

CSS Context:
Escape special characters
Avoid url() with user input
```

**Look For**:
- Input not validated
- Generic encoding (not context-aware)
- Client-side only validation
- Directory traversal paths allowed
- User input in dangerous sinks

### 12. API Endpoint Security

**Check** (for web APIs):
- [ ] API authentication required?
- [ ] API rate limited?
- [ ] API CORS properly configured?
- [ ] JSONP disabled (if not needed)?
- [ ] API versioning handled?
- [ ] Deprecated endpoints removed?

**CORS Misconfiguration**:

```
VULNERABLE:
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
(Both together = CORS bypass)

VULNERABLE:
Access-Control-Allow-Origin: *.attacker.com
(Regex not escaped, .* matches anything)

SAFE:
Access-Control-Allow-Origin: https://trusted.example.com
(Specific domain only)
```

**Look For**:
- CORS allow *
- CORS allow with credentials true
- Regex-based CORS without proper escaping
- API not rate limited
- No API authentication

---

## Web Application Audit Workflow

```
1. IDENTIFY infrastructure
   What framework? (React, Angular, Django, etc)
   What backend? (Node, Python, Java, PHP, etc)
   What architecture? (SPA, SSR, API+frontend, etc)

2. EXAMINE transport security
   HTTPS everywhere?
   Certificate valid?
   HSTS configured?

3. EXAMINE session management
   How are sessions created?
   How are sessions stored?
   Are sessions secure?

4. EXAMINE authentication
   How do users authenticate?
   Password requirements?
   Account lockout?

5. EXAMINE authorization
   Can user access other user data?
   Can user perform unauthorized actions?

6. EXAMINE input handling
   Where does user input go?
   How is it encoded/escaped?
   Could this be injection?

7. EXAMINE output handling
   Is data properly escaped for context?
   Could XSS be possible?

8. EXAMINE security headers
   What headers present?
   CSP restrictive?

9. BUILD attack chains
   How to access unauthorized data?
   How to bypass authentication?
   How to execute malicious code?

10. DOCUMENT findings
    Evidence clear?
    Confidence appropriate?
    Remediation specific?
```

---

## Common Web Vulnerabilities by Framework

### React/Angular (JavaScript Frontend)
- XSS from dangerous string rendering
- CSRF if no token validation
- Path traversal in routing
- Sensitive data in localStorage
- API key exposure in frontend code

### Django (Python Backend)
- CSRF tokens missing or not validated
- SQL injection via ORM misuse
- Insecure deserialization (pickle)
- Debug mode enabled in production
- Secret key in settings file

### Rails (Ruby Backend)
- SQL injection via string interpolation
- CSRF token validation missing
- Session fixation
- Mass assignment vulnerabilities
- Exposed private keys

### Laravel (PHP Backend)
- CSRF token validation
- SQL injection via raw queries
- Cross-site scripting
- Debug information exposure
- Configuration file exposure

### ASP.NET
- ViewState deserialization
- Anti-CSRF tokens
- Authorization attribute missing
- Information disclosure via errors
- Dependency injection misuse

---

## Security Testing Checklist

For EVERY web application:

- [ ] **Authentication**
  - [ ] Can login with weak password?
  - [ ] Can bypass password reset?
  - [ ] Can use other user's session?

- [ ] **Authorization**
  - [ ] Can access other user's data?
  - [ ] Can perform privileged operations?
  - [ ] Can modify other user's profile?

- [ ] **XSS**
  - [ ] Can inject script in search?
  - [ ] Can inject script in profile?
  - [ ] Can escape HTML encoding?

- [ ] **CSRF**
  - [ ] Can perform action without token?
  - [ ] Can reuse token?
  - [ ] Can bypass SameSite?

- [ ] **Injection**
  - [ ] Can inject SQL?
  - [ ] Can inject commands?
  - [ ] Can inject template code?

- [ ] **File Upload**
  - [ ] Can upload executable?
  - [ ] Can access uploaded file?
  - [ ] Can overwrite existing files?

- [ ] **Information Disclosure**
  - [ ] Are stack traces visible?
  - [ ] Are error messages detailed?
  - [ ] Are debug comments in HTML?

- [ ] **Session**
  - [ ] Are session tokens secure?
  - [ ] Can fixate session?
  - [ ] Can reuse old session?

