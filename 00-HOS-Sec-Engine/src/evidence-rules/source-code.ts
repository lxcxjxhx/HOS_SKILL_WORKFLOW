/**
 * ER-001: Source Code Evidence Standard
 * 
 * 功能: 规范源代码证据的采集和呈现
 * 焦点: 确保"发现 ≠ 结论"，每个结论都有完整的证据链
 * 
 * 核心原则:
 *  1. 精确的位置信息
 *  2. 完整的上下文
 *  3. 清晰的数据流
 *  4. 明确的利用条件
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const SourceCodeEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-001',
  type: EvidenceType.SourceCode,
  name: 'Source Code Evidence Standard',
  description: '规范源代码证据的采集和呈现方式，确保每个发现都有准确、完整的代码证据',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'file_path',           // 文件路径
    'line_number',         // 行号
    'code_snippet',        // 代码片段(危险行)
    'context',             // 前后代码上下文(前5行后5行)
    'dangerous_operation', // 危险操作描述
    'data_flow',           // 数据从输入到此处的流动
    'control_analysis',    // 是否有防护措施
    'conclusion'           // 最终结论(基于上述所有信息)
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'function_signature',  // 函数签名
    'parameter_flow',      // 参数如何传递
    'call_chain',          // 调用链
    'error_handling',      // 错误处理方式
    'related_code',        // 相关的防护代码位置
    'test_case'            // 可以复现问题的测试用例
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== SQL Injection Evidence (Good Example) ===

Location:
  File: src/main/java/com/app/UserService.java
  Lines: 45-55

Dangerous Code:
  Line 48: String sql = "SELECT * FROM users WHERE id = " + userId;

Context:
  45: public User findById(String userId) {
  46:   try {
  47:     // 直接拼接用户输入
  48:     String sql = "SELECT * FROM users WHERE id = " + userId;  // <- DANGEROUS
  49:     Statement stmt = conn.createStatement();
  50:     ResultSet rs = stmt.executeQuery(sql);
  51:     User user = new User();
  52:     user.setId(rs.getInt("id"));
  53:     return user;
  54:   } catch (SQLException e) {
  55:     throw new RuntimeException(e);

Data Flow:
  1. Input Entry: 
     - File: src/main/java/com/app/UserController.java
     - Line: 20
     - Code: String userId = request.getParameter("id");
  
  2. Parameter Passing:
     - Function call: User user = userService.findById(userId);
     - Location: UserController.java:21
  
  3. Dangerous Operation:
     - Query construction: String sql = "SELECT * FROM users WHERE id = " + userId;
     - Location: UserService.java:48
     - No validation between input and this point

Validation Analysis:
  ❌ No input validation before use
  ❌ No type checking
  ❌ Direct string concatenation
  ❌ No PreparedStatement usage

Protection Measures:
  ✗ No parameterized query
  ✗ No whitelist validation
  ✗ No WAF protection detected

Conclusion:
  Direct user input (userId from request parameter) is concatenated into SQL query
  without any validation or parameterization. Attacker can inject arbitrary SQL.
  
  Risk: HIGH - SQL Injection confirmed
  Confidence: HIGH - Direct code evidence + clear data flow
  
Remediation:
  Use PreparedStatement instead:
    String sql = "SELECT * FROM users WHERE id = ?";
    PreparedStatement stmt = conn.prepareStatement(sql);
    stmt.setInt(1, Integer.parseInt(userId));
    ResultSet rs = stmt.executeQuery();
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== SQL Injection Evidence (Bad Example) ✗ ===

Bad #1 - Missing Location:
  "Found SQL injection in UserService"
  ❌ 没有具体文件和行号，无法验证

Bad #2 - No Context:
  "Line 48: String sql = "SELECT * FROM users WHERE id = " + userId;"
  ❌ 没有前后代码上下文，无法理解背景

Bad #3 - Assumptions:
  "userId comes from user input"
  ❌ 假设而非追踪，没有证明数据流

Bad #4 - No Protection Analysis:
  "No parameterized query found"
  ❌ 没有检查是否有其他防护(验证、WAF、权限)

Bad #5 - Unclear Conclusion:
  "This could be exploited"
  ❌ "可能"而非"确认"，信心度不足

Bad #6 - All in One:
  "Found SQL injection at line 48 in UserService.java. 
   The code concatenates user input directly into SQL queries. 
   This is a critical vulnerability that needs immediate fixing."
  ❌ 混合了发现、分析、结论和建议，不清晰
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 确定危险代码位置
  - 使用IDE或代码审查工具精确定位
  - 记录: 文件路径 + 行号 + 列号
  - 示例: src/main/java/com/app/UserService.java:48:20
    `,

    `
步骤2: 获取完整代码上下文
  - 显示危险行前5行和后5行
  - 帮助理解代码的执行环境
  - 包括函数声明和错误处理
    `,

    `
步骤3: 追踪数据流
  - 参数从哪里来? (request? 数据库? 文件?)
  - 经过多少个函数? 在每个函数中被修改吗?
  - 最后如何被使用? (SQL? 命令行? 输出?)
  - 记录每一步的位置
    `,

    `
步骤4: 分析防护措施
  - 是否有输入验证?
  - 是否有类型强制?
  - 是否有参数化API?
  - 是否有外部防护(WAF)?
  - 结论: 是否所有防护都失效?
    `,

    `
步骤5: 形成明确结论
  - 基于所有上述证据
  - 使用具体而非假设语言
  - "用户输入直接拼接SQL" 而非 "可能存在注入"
  - 评估信心度: 是否100%确定这是漏洞?
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '没有具体位置信息',
      wrong: '"Found vulnerability in the codebase"',
      correct: '"Found in src/main/java/.../UserService.java:48"',
      why: '审核人需要复现和验证，必须有精确位置'
    },

    {
      mistake: '没有代码上下文',
      wrong: 'Line 48: String sql = "SELECT * FROM users WHERE id = " + userId;',
      correct: `Line 45-55:
        45: public User findById(String userId) {
        48:   String sql = "SELECT * FROM users WHERE id = " + userId;
        50:   ResultSet rs = stmt.executeQuery(sql);`,
      why: '上下文帮助理解这是否是真正的漏洞'
    },

    {
      mistake: '没有追踪数据流',
      wrong: '"userId parameter is tainted"',
      correct: `Data flow:
        1. request.getParameter("id") -> Controller:20
        2. findById(userId) -> Service:30
        3. SQL query -> Service:48`,
      why: '完整的数据流证明了参数确实可被攻击者控制'
    },

    {
      mistake: '忽视防护措施分析',
      wrong: '"String concatenation found, SQL injection"',
      correct: `"String concatenation found BUT:
        - Input validated with regex: ^[0-9]+$
        - Type converted: Integer.parseInt(userId)
        - Therefore injection is not possible"`,
      why: '可能有其他防护防止了真正的利用'
    },

    {
      mistake: '使用模糊的语言',
      wrong: '"Probably has SQL injection" "Could be vulnerable"',
      correct: '"Confirmed SQL injection: user input userId from HTTP request goes directly into SQL query without validation"',
      why: '结论应该是确定的，基于明确的证据'
    },

    {
      mistake: '混合发现和结论',
      wrong: `"Found potential security issue at line 48. This is a critical vulnerability 
              that needs immediate fixing. SQL injection can lead to data theft. 
              Use PreparedStatement instead."`,
      correct: `Finding: String concatenation with user input at line 48
              Evidence: userId from request → no validation → SQL query
              Conclusion: SQL Injection confirmed
              Severity: HIGH
              Remediation: Use PreparedStatement`,
      why: '清晰的结构让审核人容易理解和验证'
    },

    {
      mistake: '没有考虑信心度',
      wrong: '"SQL injection found"',
      correct: `"SQL injection confirmed
              Confidence: HIGH (direct code evidence + verified data flow)"`,
      why: '信心度帮助优先级排序和进一步审查'
    }
  ]
};

export default SourceCodeEvidenceStandard;
