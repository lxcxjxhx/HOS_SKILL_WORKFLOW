# Case Study 2: Classic SQL Injection Detection

## 📋 Case Overview

**Target:** Java Spring Boot User Search API  
**Vulnerability:** SQL Injection in Search Endpoint  
**Rule Used:** AR-005 (SQL Query Inspection)  
**Risk Level:** High  

---

## 🔴 Raw AI Output (Without Rules)

```
FINDING: SQL Injection Vulnerability

Location: src/main/java/com/app/UserService.java:45

Issue: SQL injection possible in user search.

Code:
String sql = "SELECT * FROM users WHERE username = '" + username + "'";
ResultSet rs = stmt.executeQuery(sql);

Risk: Attacker can manipulate SQL queries.

Solution: Use parameterized queries.

Confidence: Medium
```

### ❌ Problems with Raw Output

- **Vague attack description**: "Manipulate SQL queries" - how exactly?
- **No evidence chain**: Doesn't prove parameter is attacker-controlled
- **No exploitation details**: What data can attacker access?
- **Generic solution**: "Use parameterized queries" - doesn't address root cause
- **No verification method**: How to prove it's fixed?
- **Missing context**: Is there any protection we missed?

---

## ✅ Output After Loading AR-005 Rule

### **AR-005: SQL Query Inspection - 5 Step Analysis**

#### Step 1: Query Construction Method Identification

**Question:** How is this SQL query constructed?

**Finding:**
```java
File: src/main/java/com/app/UserService.java
Line: 45-50

Code:
public List<User> searchUsers(String username) {
  try {
    String sql = "SELECT * FROM users WHERE username = '" + username + "'";
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(sql);
    // ... process results
  } catch (SQLException e) {
    // ...
  }
}
```

**Analysis Result:**
- Construction method: **String concatenation** (DANGEROUS)
- SQL + Data mixed: **YES**
- Prepared statement used: **NO**
- ORM framework used: **NO**
- Dynamic query construction: **YES** (concatenation happens at runtime)

**Verdict:** ❌ FAIL - String concatenation detected

---

#### Step 2: Parameter Source Tracking

**Question:** Where does the `username` parameter come from?

**Data Flow Analysis:**

```
Trace 1: Entry point to dangerous operation

A. Input Reception (HTTP Request)
   File: src/main/java/com/app/UserController.java
   Line: 20
   
   @GetMapping("/search")
   public ResponseEntity<List<User>> searchUsers(
     @RequestParam String username    // <- INPUT FROM USER
   ) {
     List<User> results = userService.searchUsers(username);
     return ResponseEntity.ok(results);
   }
   
   Analysis: ✓ Parameter directly from HTTP query string
            ✓ No validation here

B. Service Call
   File: src/main/java/com/app/UserService.java
   Line: 40
   
   public List<User> searchUsers(String username) {
     // Parameter passed directly to method
     // NO validation applied yet
   }
   
   Analysis: ✓ Parameter passed without modification
            ✓ Still no validation

C. Dangerous Operation
   File: src/main/java/com/app/UserService.java
   Line: 45
   
   String sql = "SELECT * FROM users WHERE username = '" + username + "'";
   
   Analysis: ✗ Parameter directly concatenated into SQL
            ✗ No filtering applied
```

**Source Classification:**
- **Input Source:** HTTP Request (highest trust risk)
- **Parameter Name:** username (from GET parameter)
- **Data Type:** String (user-controlled, unchecked)
- **Trust Level:** UNTRUSTED

**Verdict:** ❌ FAIL - Parameter is from untrusted user input

---

#### Step 3: Parameter Controllability Assessment

**Question:** Can attacker directly control this parameter?

**Attack Surface Analysis:**

```
1. Can attacker modify the parameter?
   URL: GET /api/users/search?username=john
   
   Attacker's attempts:
   a) Simple value: username=admin
      Result: ✓ Accepted
   
   b) SQL injection attempt: username=admin' OR '1'='1
      Expected response (vulnerable): All users returned
      Expected response (protected): SQL error or no results
   
   Verdict: ✓ Parameter fully attacker-controlled

2. Is there input validation?
   Code review of UserService:
   - No regex validation
   - No length check
   - No type validation
   - No whitelist
   
   Verdict: ✗ No validation found

3. Is there filtering?
   - No blacklist
   - No encoding
   - No sanitization
   
   Verdict: ✗ No filtering

4. Is parameter type-safe?
   - String type (not integer)
   - Can contain any characters
   - No parsing or conversion
   
   Verdict: ✗ Not type-safe
```

**SQL Metacharacters Testing:**
```
Input: admin' OR '1'='1
Result: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
        ↓
        WHERE clause becomes: username = 'admin' OR '1'='1'
        ↓
        Condition: '1'='1' is always true
        ↓
        Result: Query returns ALL users (not just 'admin')
```

**Verdict:** ❌ FAIL - Parameter completely attacker-controlled

---

#### Step 4: Reachability Verification

**Question:** Will this query actually be executed when user triggers it?

**Code Path Analysis:**

```
Execution Flow:
1. HTTP Request arrives: GET /search?username=admin' OR '1'='1'
   ✓ Request is processed by Controller
   
2. Controller calls: userService.searchUsers(username)
   ✓ Method exists and is public
   
3. Inside searchUsers():
   Line 45: String sql = "SELECT * FROM users WHERE username = '" + username + "'";
   ✓ String concatenation happens
   
4. Line 49: Statement stmt = conn.createStatement();
   ✓ Statement is created
   
5. Line 50: ResultSet rs = stmt.executeQuery(sql);
   ✓ Query is EXECUTED
   
6. Line 51-55: Results are processed
   ✓ Results are returned to user

Exception Handling:
   - try-catch blocks exist
   - But SQL injection works even with error messages
   - Error messages may leak database information

Verdict: ✓ Code path is fully reachable and executable
```

**Verdict:** ✅ PASS - Code will be executed

---

#### Step 5: Protection Measures Check

**Question:** Are there any defenses preventing SQL injection?

**Defense Analysis:**

```
1. Parameterized Query?
   Code uses: Statement (NOT PREPARED)
   
   ✗ Should use: PreparedStatement
   
   Statement statement = connection.createStatement();
   // ← WRONG: SQL + data mixed
   
   PreparedStatement statement = connection.prepareStatement(
     "SELECT * FROM users WHERE username = ?"
   );
   statement.setString(1, username);
   // ← RIGHT: SQL separated from data
   
   Verdict: ✗ NOT using parameterized query

2. ORM Framework Protection?
   Code uses: Raw JDBC
   
   ✗ No ORM (like Hibernate) to auto-parameterize
   
   Verdict: ✗ NOT using ORM

3. Input Validation?
   - Is username validated before use?
   - Is there a whitelist?
   - Is there type checking?
   
   Code review result: NO
   
   Verdict: ✗ NO input validation

4. WAF Protection?
   - No WAF rules shown
   - Even if WAF exists, code-level fix is required
   
   Verdict: ? Unknown (but insufficient alone)

5. Database Permissions?
   - Can connection perform DROP/DELETE?
   - Is connection using principle of least privilege?
   
   Code review result: Using shared database account
   
   Verdict: ✗ NO permission restriction

6. Parameterization in ORM/Framework?
   - If Spring Data JPA used, it would auto-parameterize
   - But raw JDBC used here
   
   Verdict: ✗ NOT using auto-parameterization
```

**Security Layers Summary:**
```
Layer 1: Parameterized Query         ✗ NOT used
Layer 2: Input Validation            ✗ NOT used
Layer 3: Least Privilege DB User     ✗ NOT used
Layer 4: WAF Rules                   ? Unknown
Layer 5: IDS Detection               ? Unknown
```

**Verdict:** ❌ FAIL - No defenses in place

---

### 📊 Evidence Chain Complete Summary

| Step | Question | Status | Evidence |
|------|----------|--------|----------|
| 1 | How constructed? | ❌ FAIL | String concatenation |
| 2 | Where from? | ❌ FAIL | HTTP request parameter |
| 3 | Attacker-controlled? | ❌ FAIL | No validation whatsoever |
| 4 | Code reachable? | ✅ PASS | Yes, will be executed |
| 5 | Protected? | ❌ FAIL | No parameterization |

**Final Conclusion:** **Confirmed High-Risk SQL Injection**

---

## ⚔️ Exploitation Scenario

### Attack Plan

```
Objective: Extract all user data from database

Step 1: Identify the injection point
   GET /search?username=admin
   Response: Single user "admin"
   
Step 2: Test SQL injection
   GET /search?username=admin' OR '1'='1
   Response: All users returned ← INJECTION CONFIRMED

Step 3: Extract schema information
   Payload: admin' OR '1'='1' UNION SELECT table_name,2,3,4,5 FROM information_schema.tables--
   Response: List all tables in database
   
Step 4: Extract user data
   Payload: admin' OR '1'='1' UNION SELECT username,password,email,role,created_at FROM users--
   Response: All usernames and passwords

Step 5: Extract sensitive data
   Payload: admin' OR '1'='1' UNION SELECT id,name,balance,account_number,ssn FROM accounts--
   Response: All financial information

Step 6: (If DB admin): Drop tables
   Payload: admin'; DROP TABLE users; --
   Result: Users table deleted (Denial of Service)
```

### Real-World Impact

```
Compromised Data:
  ✗ All user accounts and passwords
  ✗ Email addresses
  ✗ User roles and permissions
  ✗ Financial data
  ✗ PII (social security numbers, addresses)

Business Impact:
  ✗ GDPR violation (data breach)
  ✗ User trust destroyed
  ✗ Regulatory fines ($2-4M range)
  ✗ Service downtime
  ✗ Criminal investigation
```

---

## 🔧 Remediation

### Immediate Fix (Do Now)

**Change from Statement to PreparedStatement:**

```java
// BEFORE (Vulnerable)
public List<User> searchUsers(String username) {
  String sql = "SELECT * FROM users WHERE username = '" + username + "'";
  Statement stmt = conn.createStatement();
  ResultSet rs = stmt.executeQuery(sql);
  // ...
}

// AFTER (Protected)
public List<User> searchUsers(String username) {
  String sql = "SELECT * FROM users WHERE username = ?";
  PreparedStatement stmt = conn.prepareStatement(sql);
  stmt.setString(1, username);  // Parameter passed safely
  ResultSet rs = stmt.executeQuery();
  // ...
}
```

**Why This Works:**
```
PreparedStatement Flow:
1. SQL statement is sent to database separately
2. Parameter is sent separately with data type
3. Database driver handles escaping
4. Attacker's SQL injection characters are treated as literal data

Example:
  Input: admin' OR '1'='1
  
  Vulnerable query: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
                    (Executes as 2 conditions)
  
  Protected query:  SELECT * FROM users WHERE username = 'admin\' OR \'1\'=\'1'
                    (Executes as literal string matching)
  
  Result: No user found (literal string doesn't match)
```

### Complete Fixed Code

```java
@Service
public class UserService {
  
  @Autowired
  private DataSource dataSource;
  
  // Method 1: Using DataSource directly
  public List<User> searchUsers(String username) throws SQLException {
    String sql = "SELECT id, username, email FROM users WHERE username = ?";
    
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
      
      stmt.setString(1, username);
      
      try (ResultSet rs = stmt.executeQuery()) {
        List<User> users = new ArrayList<>();
        while (rs.next()) {
          User user = new User();
          user.setId(rs.getInt("id"));
          user.setUsername(rs.getString("username"));
          user.setEmail(rs.getString("email"));
          users.add(user);
        }
        return users;
      }
    }
  }
  
  // Method 2: Using Spring's JdbcTemplate (recommended)
  @Autowired
  private JdbcTemplate jdbcTemplate;
  
  public List<User> searchUsersSpring(String username) {
    String sql = "SELECT id, username, email FROM users WHERE username = ?";
    
    return jdbcTemplate.query(sql, 
      new Object[]{username},  // Parameter binding
      new UserRowMapper()
    );
  }
  
  // Method 3: Using Spring Data JPA (best)
  @Repository
  public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByUsername(String username);  // Auto-parameterized
  }
}
```

---

## ✅ Verification

### Unit Tests

```java
@SpringBootTest
public class SQLInjectionFixTest {
  
  @Autowired
  private UserService userService;
  
  @Test
  public void testSQLInjectionBlocked() throws SQLException {
    // Payload that would succeed if vulnerable
    String maliciousInput = "admin' OR '1'='1";
    
    // Should NOT return all users
    List<User> results = userService.searchUsers(maliciousInput);
    
    // Should only return exact matches (none in this case)
    assertEquals(0, results.size());
  }
  
  @Test
  public void testNormalSearchStillWorks() throws SQLException {
    String username = "john";
    
    // Should still find legitimate users
    List<User> results = userService.searchUsers(username);
    
    // Verify exact match works
    assertTrue(results.stream()
      .allMatch(u -> u.getUsername().equals(username))
    );
  }
}
```

### Penetration Test

```bash
# Test SQL Injection attacks against fixed code

# Test 1: OR condition injection
curl "http://localhost:8080/search?username=admin' OR '1'='1"
Expected: No error, returns only exact matches or 0 results
Vulnerable: Would return all users

# Test 2: UNION injection
curl "http://localhost:8080/search?username=admin' UNION SELECT 1,2,3,4,5--"
Expected: No error, returns 0 results
Vulnerable: Would return union results

# Test 3: Time-based blind injection
curl "http://localhost:8080/search?username=admin' AND SLEEP(5)--"
Expected: Returns immediately
Vulnerable: Would delay 5 seconds

# Test 4: Normal search works
curl "http://localhost:8080/search?username=john"
Expected: Returns user "john"
Result: Should succeed
```

### Code Review Checklist

```
Post-Fix Verification:
□ All user inputs use PreparedStatement / parameterized query
□ No string concatenation for SQL construction
□ setString() / setInt() / etc. used for parameter binding
□ Try-with-resources used for connection cleanup
□ No raw JDBC without parameterization
□ If using JPA, using proper query methods
□ Security testing passed
□ Dependency scan shows no known SQL injection vulnerabilities
```

---

## 📈 Risk Assessment

### Before Fix
```
Severity: HIGH (CVSS 9.8)
Exploitability: EASY (requires basic knowledge)
Attack Complexity: LOW (no authentication needed)
Impact: 
  - Confidentiality: COMPLETE
  - Integrity: COMPLETE
  - Availability: COMPLETE
Real-world threat: CRITICAL
```

### After Fix
```
Severity: LOW (CVSS 0.0)
Exploitability: IMPOSSIBLE (parameterized queries)
Attack Complexity: N/A
Impact: NONE
Real-world threat: MITIGATED
```

---

## 🔍 Why This Is NOT a False Positive

1. ✅ **Direct code evidence:** String concatenation visible in code
2. ✅ **Complete data flow:** Traced from HTTP parameter to SQL
3. ✅ **Confirmed vulnerability:** SQL injection test succeeds
4. ✅ **No protection:** No parameterization or validation
5. ✅ **Exploitation is easy:** Standard tools work immediately

---

## 📚 References

- OWASP Top 10: A03:2021 - Injection
- CWE-89: Improper Neutralization of Special Elements
- SQL Injection Tutorial: https://owasp.org/www-community/attacks/SQL_Injection
- PreparedStatement Best Practices: https://cheatsheetseries.owasp.org/

---

**Case Status:** ✅ Completed  
**Difficulty Level:** Easy  
**Real-World Frequency:** Very High (SQL injection still common)  
