/**
 * ER-004: API Evidence Standard
 * 
 * 功能: 规范API定义和调用证据的采集和呈现
 * 焦点: 文档化API端点、认证方式、输入输出格式、权限控制
 * 
 * 核心原则:
 *  1. 完整的API定义(HTTP方法、路径、参数、响应)
 *  2. 明确的认证和授权机制
 *  3. 输入验证和输出编码的说明
 *  4. API变更历史和版本控制
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const APIEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-004',
  type: EvidenceType.API,
  name: 'API Evidence Standard',
  description: '规范API层面证据的采集，确保API定义、认证、输入输出、权限等证据完整可追溯',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'endpoint_definition',       // API端点定义(方法+路径+版本)
    'handler_location',          // 处理函数位置(文件+行号)
    'authentication_method',     // 认证方式(none/jwt/session/oauth/api_key)
    'authorization_rules',       // 权限控制规则(角色/权限检查)
    'input_parameters',          // 输入参数列表(名称+类型+验证+来源)
    'response_format',           // 响应格式(状态码+数据结构)
    'security_controls',         // 安全控制措施(验证/限流/审计)
    'conclusion'                 // API安全性评估结论
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'api_version',               // API版本号
    'rate_limiting',             // 限流策略
    'input_validation_schema',   // 输入验证schema(Joi/Zod/class-validator等)
    'output_encoding',           // 输出编码方式(JSON/XML/HTML)
    'error_handling',            // 错误处理方式(是否泄露敏感信息)
    'api_documentation',         // API文档位置(Swagger/OpenAPI等)
    'deprecation_status',        // 是否已废弃
    'related_endpoints',         // 关联的API端点
    'idempotency'                // 幂等性保证
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== User Profile Update API Evidence (Good Example) ===

Endpoint Definition:
  Method: PUT
  Path: /api/v1/users/:userId/profile
  Handler: src/routes/userRoutes.js -> UserController.updateProfile
  API Version: v1
  Deprecation: No

Handler Location:
  File: src/controllers/UserController.js
  Line: 45-78
  Route Registration: src/routes/userRoutes.js:12
  
  // src/routes/userRoutes.js:12
  router.put('/users/:userId/profile',
    authMiddleware,           // JWT authentication
    rateLimiter,              // 100 requests/minute
    validate(updateProfileSchema),  // Input validation
    UserController.updateProfile
  );

Authentication:
  Method: JWT Bearer Token
  Validation: authMiddleware checks token signature, expiry, issuer
  Token Source: Authorization header (Bearer <token>)
  Evidence: src/middleware/auth.js:15-30

Authorization Rules:
  Rule: Users can only update their own profile
  Check: req.user.id === req.params.userId
  Location: UserController.js:48
  // UserController.js:48
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  Admin Override: Users with role='admin' can update any profile
  Location: UserController.js:51

Input Parameters:
  Path Parameters:
    - userId: string (UUID format, validated by route param middleware)
  
  Request Body (application/json):
    - displayName: string, 1-50 chars, alphanumeric + spaces
      Validation: Joi.string().alphanum().min(1).max(50)
      Schema Location: src/validators/userSchema.js:5
    - email: string, email format, unique check in DB
      Validation: Joi.string().email()
      Schema Location: src/validators/userSchema.js:8
    - bio: string, max 500 chars, HTML stripped
      Validation: Joi.string().max(500), sanitized with DOMPurify
      Sanitization Location: src/middleware/sanitize.js:10
  
  ❌ No validation on userId path parameter format
  ✓ All body fields have schema validation
  ✓ Bio field is sanitized before storage

Response Format:
  Success (200):
    {
      "id": "uuid",
      "displayName": "string",
      "email": "string",
      "bio": "string",
      "updatedAt": "ISO8601 timestamp"
    }
  Error (400): { "error": "Validation failed", "details": [...] }
  Error (401): { "error": "Unauthorized" }
  Error (403): { "error": "Forbidden" }
  Error (404): { "error": "User not found" }
  
  ⚠ Error responses include field names - minor information leakage

Security Controls:
  ✓ JWT Authentication required
  ✓ Ownership check (user can only update own profile)
  ✓ Input validation with Joi schema
  ✓ HTML sanitization on bio field
  ✓ Rate limiting: 100 req/min per IP
  ✓ Audit log: UserUpdateEvent logged to audit service
  ⚠ No CSRF protection (but API is JSON-only, mitigates CSRF)
  ⚠ Error messages reveal field names

Rate Limiting:
  Strategy: Sliding window, per IP
  Limit: 100 requests/minute
  Location: src/middleware/rateLimiter.js
  Evidence: rate-limiter-redis configured with windowMs: 60000

Conclusion:
  API has GOOD security posture with multiple defense layers.
  Authentication, authorization, input validation, and rate limiting are in place.
  
  Minor Issues:
  1. Error responses expose internal field names (low risk)
  2. No CSRF protection (mitigated by JSON-only content type)
  
  Risk: LOW - Well-secured API endpoint
  Confidence: HIGH - Complete API evidence with code references
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== User Profile Update API Evidence (Bad Example) ✗ ===

Bad #1 - Incomplete Endpoint Definition:
  "There's an API to update user profiles"
  ❌ 没有HTTP方法、路径、版本信息

Bad #2 - Missing Authentication Details:
  "The API requires authentication"
  ❌ 没有说明认证方式(JWT/session/其他)，无法评估强度

Bad #3 - No Input Validation Evidence:
  "Input is validated before processing"
  ❌ 没有提供验证schema或验证代码位置

Bad #4 - No Authorization Analysis:
  "Users can update their profiles"
  ❌ 没有检查是否能更新他人的profile(水平越权)

Bad #5 - Missing Response Analysis:
  "Returns user data"
  ❌ 没有分析响应是否包含敏感信息(密码hash、内部ID等)

Bad #6 - No Error Handling Review:
  "Errors are handled properly"
  ❌ 没有检查错误响应是否泄露堆栈跟踪或敏感信息
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 定位API端点定义
  - 查找路由注册: Express router.*, Spring @RequestMapping, Django urls.py等
  - 记录: HTTP方法 + 完整路径 + API版本 + 处理函数位置
  - 识别: 中间件链(认证、验证、限流等中间件)
  - 注意: 动态路由参数(:id, {id})和查询参数
    `,

    `
步骤2: 分析认证机制
  - 确定认证方式: JWT、Session、OAuth2、API Key、None
  - 检查认证中间件/装饰器的实现
  - 验证: token是否校验签名、有效期、issuer
  - 记录: 认证失败时的响应(是否泄露信息)
    `,

    `
步骤3: 检查授权控制
  - 分析: 谁能访问这个API(角色/权限/ownership)
  - 检查水平越权: 用户A能否操作用户B的资源
  - 检查垂直越权: 普通用户能否执行管理员操作
  - 记录: 权限检查的位置和逻辑
    `,

    `
步骤4: 审查输入参数
  - 列出所有输入: 路径参数、查询参数、请求体、headers
  - 检查每个参数的验证: 类型、长度、格式、范围
  - 识别: 是否有schema验证(Joi/Zod/class-validator等)
  - 注意: 未验证的参数是潜在的攻击入口
    `,

    `
步骤5: 分析响应和错误处理
  - 检查响应格式: 是否包含敏感数据(密码、token、内部ID)
  - 分析错误响应: 是否泄露堆栈跟踪、SQL错误、内部路径
  - 评估: 错误信息是否过于详细
  - 记录: 所有可能的HTTP状态码和对应响应
    `,

    `
步骤6: 评估整体安全措施
  - 限流: 是否有rate limiting策略
  - 审计: 是否有操作日志记录
  - CSRF: 是否有CSRF防护(对于非纯API)
  - CORS: 跨域配置是否安全
  - 形成结论: API的整体安全状态和具体改进建议
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '没有完整的API定义',
      wrong: '"User update endpoint"',
      correct: '"PUT /api/v1/users/:userId/profile -> UserController.updateProfile"',
      why: '审核人需要准确的API信息来验证和测试'
    },

    {
      mistake: '忽视认证细节',
      wrong: '"API is authenticated"',
      correct: `"JWT authentication via authMiddleware
        Token validation: signature + expiry + issuer
        Location: src/middleware/auth.js:15"`,
      why: '不同的认证方式有不同的安全风险'
    },

    {
      mistake: '没有检查越权漏洞',
      wrong: '"Users can update their profile"',
      correct: `"Ownership check: req.user.id === req.params.userId
        Admin override: role === 'admin'
        No BOLA vulnerability found"`,
      why: '水平/垂直越权是API最常见的漏洞之一'
    },

    {
      mistake: '没有验证输入参数的实际验证',
      wrong: '"Email parameter is validated"',
      correct: `"Email validation: Joi.string().email() at userSchema.js:8
        ✅ Validates format
        ⚠ Does NOT check for disposable email domains
        ⚠ Does NOT verify email ownership"`,
      why: '声明验证不等于实际有效的验证'
    },

    {
      mistake: '没有分析错误信息泄露',
      wrong: '"Errors are returned to client"',
      correct: `"Error response includes:
        ✅ Generic error message
        ❌ Internal field names exposed
        ❌ Database error details in development mode"`,
      why: '错误响应可能泄露敏感的系统信息'
    },

    {
      mistake: '忽视API版本和废弃状态',
      wrong: '"This is the user API"',
      correct: `"API v1: /api/v1/users (CURRENT)
        API v2: /api/v2/users (BETA)
        Legacy: /users (DEPRECATED - remove by 2025-01)
        Security patches applied to v1 and v2 only"`,
      why: '废弃的API可能不再接收安全更新'
    },

    {
      mistake: '没有检查关联安全措施',
      wrong: '"API has authentication"',
      correct: `"Security layers:
        1. JWT Auth ✓
        2. Rate Limiting ✓ (100/min)
        3. Input Validation ✓ (Joi)
        4. Audit Logging ✓
        5. CSRF: N/A (JSON API)
        6. CORS: Whitelist only ✓"`,
      why: '安全措施需要多层防御，单一措施不足'
    }
  ]
};

export default APIEvidenceStandard;
