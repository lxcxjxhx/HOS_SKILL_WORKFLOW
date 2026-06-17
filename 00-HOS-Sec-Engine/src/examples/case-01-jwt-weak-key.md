# Case Study 1: JWT Weak Secret Key Detection

## 📋 Case Overview

**Target:** Spring Boot JWT Authentication Service  
**Vulnerability:** Weak JWT Secret Configuration  
**Rule Used:** AR-004 (Crypto Check)  
**Risk Level:** High  

---

## 🔴 Raw AI Output (Without Rules)

```
FINDING: JWT Secret Configuration Issue

Location: src/main/java/config/JwtConfig.java:45

Issue: The JWT secret is defined as a simple string.

Code:
public static final String SECRET = "secret";

Risk: Using weak secret compromises JWT security.

Solution: Use a strong key instead.

Confidence: Medium

Remediation: Change the secret to something more secure.
```

### ❌ Problems with Raw Output

- **Vague conclusion**: "Compromises JWT security" - how? why?
- **Unclear evidence**: No data flow analysis
- **Weak confidence**: "Medium" - why not high or low?
- **Generic remediation**: "Use something more secure" - too vague
- **No exploitation details**: What can attacker actually do?
- **No root cause**: Why did developer use weak key?

---

## ✅ Output After Loading Rules

### **AR-004: Crypto Check Analysis**

#### Step 1: Cryptographic Operation Identification

**Finding:** Cryptographic function used for JWT signing.

**Analysis:**
- Framework: Spring Security (JWT)
- Operation: Secret key for HMAC-SHA256 signing
- Configuration: Hard-coded in application.java source code
- Type: Symmetric key (shared secret)

**Evidence:**
```java
File: src/main/java/config/JwtConfig.java
Line: 44-46

Code:
public class JwtConfig {
  public static final String SECRET = "secret";  // <- HERE
  
  public static String generateToken(String username) {
    return Jwts.builder()
      .setSubject(username)
      .signWith(SignatureAlgorithm.HS256, SECRET)
      .compact();
  }
}
```

---

#### Step 2: Key Strength Evaluation

**Checking:** Secret key entropy and strength

**Questions Answered:**
- ❌ Is the key randomized? No - hard-coded literal string
- ❌ Is the key sufficient length? No - only 6 ASCII characters
- ❌ Is the key high entropy? No - simple English word
- ❌ Is the key cryptographically random? No - deterministic

**Entropy Analysis:**
```
Secret: "secret"
- Length: 6 characters (ASCII)
- Entropy: ~39 bits (log2(95^6) ≈ 39 bits)
- Target: ≥256 bits for secure JWT

Gap: 217 bits insufficient
⚠️ Brute-force attack possible with modern hardware:
   - Time to brute-force: Hours to days (GPU acceleration)
   - Cost: $10-50 of cloud computing
```

**Similar Vulnerable Patterns:**
```
password = "admin123"
key = "secret"
token_secret = "123456"
jwt_key = "key"
api_secret = "test"
```

---

#### Step 3: Key Management Review

**Checking:** Where key is stored and how it's managed

**Questions Answered:**
- ❌ Is key externalized? No - in source code
- ❌ Is key environment variable? No
- ❌ Is key in secure vault? No
- ❌ Is key rotated? No mechanism shown
- ❌ Is key access controlled? No - public static

**Configuration Found:**
```
- Key storage: Source code (WORST)
- Key visibility: Public static field (exposed)
- Key scope: Global application constant
- Key rotation: Not implemented
- Key backup/recovery: Not shown
```

**Version Check:**
- Spring Security version in pom.xml: 5.4.0 (2021-03)
- ⚠️ Outdated, should be 6.0+
- No recent security patches

---

#### Step 4: Cryptographic Algorithm Validation

**Checking:** Is algorithm itself weak?

**Questions Answered:**
- ✅ Algorithm: HS256 (HMAC-SHA256) - Strong
- ✅ Hash function: SHA256 - Strong
- ✅ Signature method: Symmetric HMAC - Appropriate for monolithic apps
- ❌ BUT: Algorithm strength irrelevant with weak key

**Analysis:**
```
Even strong algorithm (HS256) cannot compensate for weak key.
This is like using a bank-grade lock on a door with a soft cardboard frame.
```

---

#### Step 5: Exploitation Path Verification

**Checking:** Can this weakness be exploited?

**Questions Answered:**
- ✅ Can attacker obtain the JWT? Yes (any user of the service)
- ✅ Can attacker brute-force the secret? Yes (effort: hours to days)
- ✅ Can attacker forge admin token? Yes (after finding secret)
- ✅ Is there detection? No JWT validation shown

**Exploitation Timeline:**
```
1. Attacker captures a valid JWT token from normal login
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIn0...

2. Attacker attempts to brute-force the secret
   Using: https://github.com/ticarpi/jwt_tool
   Time: 2-4 hours with GPU acceleration on common words
   
3. Secret found: "secret"

4. Attacker forges new token with admin claims:
   {
     "sub": "admin",
     "role": "ADMIN",
     "iat": 1234567890
   }

5. Attacker uses forged token to access admin functions
   GET /api/admin/users (Authorization: Bearer <forged-token>)
   
6. Result: Full application compromise

Total effort: ~5 hours + $20 in cloud computing
```

---

### 📊 Evidence Chain Summary

| Step | Status | Evidence |
|------|--------|----------|
| 1. Crypto operation | ❌ WEAK | Hard-coded string "secret" |
| 2. Key strength | ❌ FAIL | 39 bits entropy vs 256 bits required |
| 3. Key management | ❌ FAIL | In source code, public static, not rotated |
| 4. Algorithm | ✅ OK | HS256 is strong, but irrelevant |
| 5. Exploitation | ✅ POSSIBLE | Can brute-force and forge tokens |

**Conclusion:** Confirmed weak JWT secret key with confirmed exploitation path.

---

## 🎯 Remediation Plan

### Priority 1: Critical (Do First - Today)

**Action: Externalize key to environment variable**

```java
// BEFORE (Vulnerable)
public static final String SECRET = "secret";

// AFTER (Temporary fix - still not production ready)
public static final String SECRET = System.getenv("JWT_SECRET");

// In application.properties
jwt.secret=${JWT_SECRET}

// In config
@Value("${jwt.secret}")
private String jwtSecret;
```

**Why:** Prevents accidental exposure through code review, GitHub, etc.

**Test:**
```bash
# Test that app requires environment variable
unset JWT_SECRET
./mvn spring-boot:run  # Should fail or use fallback

# Set proper secret
export JWT_SECRET="thisis256bitscryptographicallyrandomjwtsecretkey123456789012345678901234"
./mvn spring-boot:run  # Should work
```

---

### Priority 2: High (Do This Week)

**Action: Generate cryptographically random key**

```bash
# Generate 256-bit random key
openssl rand -base64 32
# Example output: 
# thisis256bitscryptographicallyrandomjwtsecretkey123456789012345678

# Or in Java:
java -cp . -c "import java.security.*; byte[] key = new byte[32]; new SecureRandom().nextBytes(key); System.out.println(java.util.Base64.getEncoder().encodeToString(key));"
```

**Implementation:**

```java
@Configuration
public class JwtConfig {
  
  @Value("${jwt.secret}")
  private String jwtSecretString;
  
  private Key jwtSecret;
  
  @PostConstruct
  public void init() {
    byte[] keyBytes = Base64.getDecoder().decode(jwtSecretString);
    this.jwtSecret = new SecretKeySpec(keyBytes, 0, keyBytes.length, "HmacSHA256");
    
    // Validate key strength
    if (keyBytes.length < 32) {
      throw new SecurityException("JWT secret key must be at least 256 bits (32 bytes)");
    }
  }
  
  public String generateToken(String username) {
    return Jwts.builder()
      .setSubject(username)
      .setIssuedAt(new Date())
      .signWith(jwtSecret, SignatureAlgorithm.HS256)
      .compact();
  }
}
```

**Test:**
```java
@Test
public void testJwtKeyStrength() {
  byte[] key = Base64.getDecoder().decode(jwtSecretKey);
  assertEquals(32, key.length);  // 256 bits
  // Key should not contain common words
}
```

---

### Priority 3: Medium (Do This Month)

**Action: Implement key rotation strategy**

```java
@Configuration
public class KeyRotationConfig {
  
  @Scheduled(fixedRate = 86400000)  // Every 24 hours
  public void rotateJwtSecret() {
    // Generate new key
    byte[] newKey = new byte[32];
    new SecureRandom().nextBytes(newKey);
    String newKeyEncoded = Base64.getEncoder().encodeToString(newKey);
    
    // Store in vault
    vaultService.storeSecret("jwt.secret", newKeyEncoded);
    
    // Notify
    logger.warn("JWT secret rotated");
  }
  
  @Scheduled(fixedRate = 604800000)  // Every 7 days
  public void expireOldTokens() {
    // Invalidate tokens issued with old key
    tokenBlacklist.addPattern("before:" + keysLastRotatedTime);
  }
}
```

---

### Priority 4: Long-term (Do This Quarter)

**Action: Migrate to asymmetric key (RS256)**

```java
@Configuration
public class AsymmetricJwtConfig {
  
  @Bean
  public KeyPair rsaKeyPair() {
    // Generate RSA key pair
    KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
    kpg.initialize(2048);
    return kpg.generateKeyPair();
  }
  
  public String generateToken(String username, KeyPair keyPair) {
    return Jwts.builder()
      .setSubject(username)
      .signWith(keyPair.getPrivate(), SignatureAlgorithm.RS256)
      .compact();
  }
}
```

**Benefits:**
- Private key only on auth server
- Public key shared for verification
- No secret exposure in distributed systems
- Better for microservices

---

## ✅ Verification Checklist

After remediation, verify:

```
Post-Fix Verification:
□ JWT secret is NOT in source code
□ JWT secret is loaded from environment variable or vault
□ JWT secret length ≥ 32 bytes (256 bits)
□ Key validation in application startup
□ Attempt to brute-force secret should fail
□ Token issued with old "secret" should not be accepted
□ Logs show no hardcoded secret strings
□ Code review confirms fix
□ Penetration test confirms token forgery prevented

Security Scanning:
□ Dependency check for known CVEs
□ SAST scan shows no hardcoded secrets
□ DAST scan confirms token validation works
```

---

## 📈 Impact Assessment

### Before Fix
```
Risk Level: HIGH
Exploitability: EASY (hours of work)
Impact: CRITICAL (full system compromise)
CVSS Score: 9.1 (Critical)
```

### After Fix
```
Risk Level: LOW
Exploitability: VERY HARD (years of work with current hardware)
Impact: MITIGATED
CVSS Score: 3.7 (Low)
```

---

## 🔍 Review Notes

### Why This Finding is NOT a False Positive

1. ✅ **Code evidence:** Direct hard-coded secret in source
2. ✅ **Entropy analysis:** Mathematically proven weak
3. ✅ **Exploitation path:** Clearly demonstrated attack scenario
4. ✅ **Real world impact:** Confirmed token forgery possible
5. ✅ **No compensating controls:** No WAF/IDS shown

### Why This Finding Is High Confidence

- Direct source code evidence (not speculation)
- Clear data flow (source → use)
- Mathematical proof of weakness
- Published attack tools available
- No uncertainty in analysis

---

## 📚 References

- JWT Security Best Practices: https://tools.ietf.org/html/rfc7518
- CWE-326: Inadequate Encryption Strength
- OWASP: Broken Authentication
- JWT Tool (attack tool): https://github.com/ticarpi/jwt_tool

---

**Case Status:** ✅ Completed  
**Difficulty Level:** Medium  
**Learning Value:** High - demonstrates crypto weakness detection  
