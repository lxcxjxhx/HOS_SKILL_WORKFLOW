/**
 * AR-005: SQL Query Inspection Rule
 * 
 * 功能: 检查SQL查询构造方式，识别注入风险
 * 焦点: 不是告诉AI"什么是SQL注入"
 *      而是定义AI"如何检查SQL查询"的5步流程
 * 
 * 检查流程:
 *  1. 查询构造方式识别
 *  2. 参数来源追踪
 *  3. 参数可控性判定
 *  4. 可达性验证
 *  5. 防护措施检查
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const SQLQueryRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-005',
  name: 'SQL Query Inspection',
  description: '检查SQL查询的构造方式和参数处理，识别注入风险',
  detail: `
本规则的目的是系统化地检查SQL查询构造方式。关键是通过5步检查流程，
从代码实现层面识别是否存在注入风险。

核心理念:
- 不是问"这是SQL注入吗"
- 而是问"如何检查是否存在SQL注入"

关键问题序列:
1. 查询如何构造? (字符串拼接? 参数化? ORM?)
2. 参数来自何处? (用户输入? 硬编码? 数据库?)
3. 参数是否可控? (用户能否修改?)
4. 查询是否会被执行? (是否可达?)
5. 是否有防护措施? (参数化? 白名单?)
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      '字符串拼接: "SELECT * FROM users WHERE id=" + input',
      '模板字符串: `SELECT * FROM ${table}`',
      '格式化字符串: sprintf("SELECT * FROM %s", table)',
      '追加操作: query.append(variable)',
      '动态查询构造: new Query().select().from().where()'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go,
      LanguageType.Rust
    ],
    frameworks: [
      'Spring',
      'Hibernate',
      'MyBatis',
      'Express',
      'Django',
      'Sequelize',
      'Laravel'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '查询构造方式识别',
      condition: '识别SQL查询是通过什么方式构造的',
      questions: [
        '这个SQL查询使用了什么构造方式?',
        '是字符串拼接、模板字符串、格式化、还是ORM?',
        '是否涉及动态字符串构造?',
        '代码中是否混合了SQL语句和数据?'
      ],
      failureIndicators: [
        '字符串拼接: + / .concat() / f-string',
        '模板字符串: ${variable} / %s / {0}',
        '直接append(): query.append()',
        'SQL和数据混合: "...WHERE id=" + userId'
      ],
      successIndicators: [
        '使用了PreparedStatement / ParameterizedQuery',
        '使用了ORM框架的参数化API',
        '使用了安全的查询构造库'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '参数来源追踪',
      condition: '追踪SQL查询中的每个动态参数来自何处',
      questions: [
        '查询中有哪些动态参数?',
        '每个参数的原始来源是什么?',
        '是否来自HTTP请求 (GET/POST/JSON)?',
        '是否来自数据库查询结果?',
        '是否来自配置文件或硬编码?',
        '参数经历了多少层函数调用?'
      ],
      failureIndicators: [
        'request.getParameter() / request.body',
        'URL路径参数: /api/users/{id}',
        'HTTP Header: Authorization',
        '任何来自用户输入的变量',
        '参数通过深层函数调用传递'
      ],
      successIndicators: [
        '参数来自硬编码常量',
        '参数来自配置文件(非用户可编辑)',
        '参数来自内部系统生成',
        '参数来自数据库并且已验证'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '参数可控性判定',
      condition: '判定攻击者是否能够通过输入直接控制这个参数',
      questions: [
        '攻击者能否直接修改这个参数?',
        '参数是否经过任何验证或过滤?',
        '是否有黑名单检查? (是否足够?)',
        '是否有白名单检查? (是否严格?)',
        '是否有长度限制?',
        '是否有编码处理? (是否足够?)',
        '是否有类型强制? (例如: (int) cast)'
      ],
      failureIndicators: [
        '无任何验证',
        '仅有格式检查(如长度)(不足以防SQLi)',
        '黑名单检查(容易绕过)',
        'HTML编码(对SQL无效)',
        '客户端验证(可被绕过)'
      ],
      successIndicators: [
        '严格的白名单验证',
        '强类型转换(如整数ID必须是int)',
        '参数被参数化API处理',
        '多层防护'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '可达性验证',
      condition: '验证这个查询是否真的会被用户输入触发执行',
      questions: [
        '这个查询代码路径是否会被用户请求触发?',
        '是否存在某些条件可能导致这个查询不被执行?',
        '这段代码是否是死代码(已被注释或移除)?',
        '是否需要特殊权限或条件才能到达这个代码?',
        '是否在异常处理块中(永不执行)?'
      ],
      failureIndicators: [
        '代码可被用户请求直接触发',
        '代码路径在try块中正常执行',
        '代码不依赖特殊条件'
      ],
      successIndicators: [
        '代码被注释',
        '代码在异常处理块中',
        '代码被if (false)保护',
        '需要管理员权限才能执行'
      ],
      criticality: 'important'
    },

    {
      order: 5,
      name: '防护措施检查',
      condition: '检查是否有防护措施来防止SQL注入',
      questions: [
        '是否使用了参数化查询? (PreparedStatement)',
        '是否使用了ORM框架的安全API?',
        '参数是否通过setString() / setInt()等API传入?',
        'SQL语句和参数是否完全分离?',
        '是否有WAF规则保护?',
        '是否有SQL注入检测IDS?'
      ],
      failureIndicators: [
        '没有使用参数化查询',
        '使用了参数化但后来又拼接',
        '参数通过字符串连接进入SQL',
        '动态SQL构造无参数化'
      ],
      successIndicators: [
        '正确使用PreparedStatement / ParameterizedQuery',
        '参数通过addParameter() / bind()等安全API',
        'SQL语句和参数完全分离',
        '使用了ORM框架的查询API'
      ],
      criticality: 'must-have'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '准确的代码位置和完整上下文(前5行后5行)',
      example: `
文件: src/main/java/com/app/UserService.java
行号: 45-55
代码:
  private User findById(String userId) {
    String sql = "SELECT * FROM users WHERE id = " + userId;  // <- 危险行
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(sql);
    ...
  }
      `,
      collection_guidance: '提供完整文件路径，提供精确行号范围，包括前后代码上下文，高亮关键代码行'
    },

    {
      type: EvidenceType.DataFlow,
      required: true,
      description: '参数从输入源到SQL查询的完整数据流',
      example: `
数据流追踪:
  1. 输入源: request.getParameter("id")
     位置: UserController.java:20
  
  2. 参数传递: userId 通过getUser(userId)传入
     位置: UserController.java:21
  
  3. 查询构造: "SELECT * FROM users WHERE id = " + userId
     位置: UserService.java:45
  
  4. 查询执行: stmt.executeQuery(sql)
     位置: UserService.java:50
  
结论: 用户输入 -> 无验证 -> 直接拼接SQL
      `,
      collection_guidance: '追踪每个函数调用，记录每一步的文件和行号，标记参数是否被修改，确认是否有验证步骤'
    },

    {
      type: EvidenceType.Configuration,
      required: false,
      description: 'ORM或数据库配置，如存在',
      example: 'application.properties / web.xml / pom.xml',
      collection_guidance: '检查ORM配置，验证数据库驱动版本，检查连接池配置'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '使用参数化查询 (最优方案)',
      code: `
// Java - PreparedStatement
String sql = "SELECT * FROM users WHERE id = ?";
PreparedStatement stmt = conn.prepareStatement(sql);
stmt.setInt(1, userId);  // 参数安全传入
ResultSet rs = stmt.executeQuery();

// Java - ORM
User user = userRepository.findById(userId);

// Node.js - Parameterized Query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// Python - Parameterized Query
cursor.execute("SELECT * FROM users WHERE id = %s", (userId,))

// .NET - SqlParameter
SqlCommand cmd = new SqlCommand("SELECT * FROM users WHERE id = @id", conn);
cmd.Parameters.AddWithValue("@id", userId);
      `,
      description: '这是最有效的防护方式。参数和SQL完全分离，数据库驱动负责安全处理。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '输入白名单验证 (辅助防护)',
      code: `
// Java
if (!userId.matches("^[0-9]+$")) {
  throw new IllegalArgumentException("Invalid userId");
}
int id = Integer.parseInt(userId);  // 强类型转换

// Node.js
const id = parseInt(userId, 10);
if (isNaN(id) || id <= 0) {
  throw new Error('Invalid userId');
}

// Python
try:
  id = int(userId)
  if id <= 0:
    raise ValueError("Invalid userId")
except ValueError:
  raise ValueError("Invalid userId")
      `,
      description: '对于某些情况（如整数ID），强类型转换可以确保参数安全。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '黑名单过滤 (不推荐，但可作为额外防护)',
      code: `
// 黑名单示例 (容易绕过，仅作参考)
String[] dangerous = {";\", \"'\", \"--\", \"/*\", \"*/\"};
for (String dang : dangerous) {
  if (userId.contains(dang)) {
    throw new IllegalArgumentException("Invalid characters");
  }
}
      `,
      description: '黑名单容易被绕过，仅应作为多层防护的一部分，不应单独使用。',
      difficulty: 'Easy'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-89'],  // Improper Neutralization of Special Elements used in an SQL Command
  owasp_categories: [
    'A03:2021 - Injection',
    'A1:2017 - Injection'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default SQLQueryRule;
