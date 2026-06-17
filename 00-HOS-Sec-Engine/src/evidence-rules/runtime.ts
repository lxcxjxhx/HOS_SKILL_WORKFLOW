/**
 * ER-006: Runtime Evidence Standard
 * 
 * 功能: 规范运行时行为证据的采集和呈现
 * 焦点: 收集日志、网络流量、内存状态、执行行为等运行时证据
 * 
 * 核心原则:
 *  1. 可复现的运行时证据(日志时间戳、请求ID、会话ID)
 *  2. 区分正常行为和异常行为
 *  3. 记录环境和条件(什么条件下出现了什么行为)
 *  4. 关联多个证据源(日志+网络+内存)形成完整证据链
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const RuntimeEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-006',
  type: EvidenceType.Runtime,
  name: 'Runtime Evidence Standard',
  description: '规范运行时行为证据的采集，确保日志、网络流量、内存状态等运行时证据完整可追溯',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'evidence_type',             // 证据类型(log/network/memory/process/config_change)
    'timestamp',                 // 时间戳(ISO8601格式)
    'source',                    // 证据来源(日志文件/抓包文件/调试器输出等)
    'observed_behavior',         // 观察到的具体行为描述
    'reproduction_steps',        // 复现步骤(如何触发该行为)
    'environment_context',       // 运行环境(OS/版本/配置/部署方式)
    'normal_vs_abnormal',        // 与正常行为的对比分析
    'conclusion'                 // 基于运行时证据的结论
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'request_id',                // 请求追踪ID(用于关联多个日志)
    'session_id',                // 会话ID
    'user_context',              // 触发行为的用户/角色
    'network_capture',           // 网络抓包数据(pcap/HAR文件)
    'memory_dump',               // 内存转储(如适用)
    'stack_trace',               // 调用堆栈
    'log_correlation',           // 关联的日志条目列表
    'performance_metrics',       // 性能指标(响应时间/CPU/内存)
    'security_events',           // 安全相关事件(防火墙/IDS/WAF日志)
    'before_after_state'         // 行为前后的状态对比
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== SQL Injection Runtime Evidence (Good Example) ===

Evidence Type: Network Traffic + Application Logs

Timestamp: 2024-03-15T14:32:18.456Z
Source:
  - Application Log: /var/log/app/production.log
  - Database Log: /var/log/mysql/slow-query.log
  - Network Capture: capture_20240315_143200.pcap

Environment Context:
  Application: Node.js 18.17.0, Express 4.18.2
  Database: MySQL 8.0.32
  Deployment: Docker container on AWS ECS
  Load Balancer: ALB with WAF (WAF rules not blocking this request)

Request Details:
  Request ID: req-8f3a9c2d-1e4b-4a5c-9d7e-f2b8c4a6e0d1
  Session ID: sess-user-admin-20240315
  User Context: admin (role: administrator)
  Source IP: 203.0.113.42

Reproduction Steps:
  1. Navigate to: GET /api/v1/users/search?q=admin
  2. Modify query parameter to: q=admin' OR '1'='1
  3. Observe: Response returns ALL users instead of filtered results
  4. Confirm: Database query log shows unparameterized query

Observed Behavior:
  ──── Network Layer ────
  HTTP Request:
    GET /api/v1/users/search?q=admin'%20OR%20'1'%3D'1 HTTP/1.1
    Host: api.example.com
    Authorization: Bearer <admin_token>
  
  HTTP Response:
    HTTP/1.1 200 OK
    Content-Type: application/json
    X-Response-Time: 234ms
    Body: { "users": [/* ALL 15,000 users returned */], "count": 15000 }
  
  ──── Application Log ────
  [2024-03-15T14:32:18.456Z] INFO  req-8f3a9c2d: Search request received
    userId: admin-001, query: "admin' OR '1'='1"
  [2024-03-15T14:32:18.460Z] WARN  req-8f3a9c2d: Query returned 15000 results
    (normal range: 1-50 results)
  [2024-03-15T14:32:18.470Z] INFO  req-8f3a9c2d: Response sent (234ms)
  
  ──── Database Log ────
  [2024-03-15T14:32:18.458Z] Query: SELECT * FROM users WHERE name LIKE 
    'admin' OR '1'='1'
  Time: 0.120s (slow query threshold: 0.100s)
  Rows Examined: 15000 (Full table scan - no index used)

Normal vs Abnormal Comparison:
  Normal Request (q=admin):
    - Query: SELECT * FROM users WHERE name LIKE 'admin'
    - Results: 3 users (admin, admin2, admin_test)
    - Response Time: 12ms
    - Rows Examined: 3 (index used)
  
  Abnormal Request (q=admin' OR '1'='1):
    - Query: SELECT * FROM users WHERE name LIKE 'admin' OR '1'='1'
    - Results: 15000 users (ALL rows)
    - Response Time: 234ms (20x slower)
    - Rows Examined: 15000 (full table scan)

Stack Trace:
  at buildSearchQuery (src/services/UserService.js:45:20)
  at searchUsers (src/services/UserService.js:30:18)
  at UserController.search (src/controllers/UserController.js:55:32)
  at Layer.handle (node_modules/express/lib/router/layer.js:95:5)

Security Events:
  WAF: No alerts triggered (WAF rule not covering this pattern)
  IDS: No alerts (internal traffic only)
  Rate Limiter: Not triggered (single request)

Log Correlation:
  req-8f3a9c2d timeline:
    14:32:18.456 → Request received (UserController)
    14:32:18.457 → Input passed to UserService.buildSearchQuery
    14:32:18.458 → Raw SQL constructed (NO parameterization)
    14:32:18.458 → Query sent to MySQL
    14:32:18.470 → Response returned to client

Performance Metrics:
  CPU: 2% → 45% during query execution (spike)
  Memory: 128MB → 256MB (result set buffering)
  DB Connections: 5 → 6 (temporary increase)

Conclusion:
  SQL Injection CONFIRMED via runtime evidence.
  User input from query parameter is directly concatenated into SQL query
  without parameterization. The injected payload ' OR '1'='1 caused the
  query to return ALL 15,000 user records instead of filtered results.
  
  Evidence chain:
    HTTP Request → Application Log → DB Query Log → Full Data Exposure
  
  Risk: CRITICAL - Complete database exposure possible
  Confidence: HIGH - Runtime evidence with complete correlation
  Impact: 15,000 user records exposed (including email, phone, hashed passwords)
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== SQL Injection Runtime Evidence (Bad Example) ✗ ===

Bad #1 - No Timestamp or Source:
  "The application returned all users when we injected SQL"
  ❌ 没有时间戳、日志来源,无法复现和验证

Bad #2 - No Reproduction Steps:
  "SQL injection worked"
  ❌ 没有说明如何复现,审核人无法确认

Bad #3 - No Environment Context:
  "The query was slow"
  ❌ 没有说明环境(开发/生产),不同环境行为可能不同

Bad #4 - No Normal Comparison:
  "15000 users returned"
  ❌ 没有对比正常情况,不清楚是否异常

Bad #5 - No Evidence Correlation:
  "Found SQL injection in the logs"
  ❌ 没有关联多个证据源(网络+日志+DB),证据链不完整

Bad #6 - No Request/Session Tracking:
  "Someone tested the search endpoint"
  ❌ 没有request ID或session ID,无法追踪完整请求生命周期
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 确定证据类型和来源
  - 识别可用的证据源: 应用日志、数据库日志、网络抓包、系统监控等
  - 确定证据类型: 日志(log)、网络(network)、内存(memory)、进程(process)等
  - 记录: 每个证据源的位置、格式、访问方式
  - 注意: 确保日志级别足够详细(debug/info,不是error only)
    `,

    `
步骤2: 记录完整的时间线
  - 所有时间戳使用ISO8601格式,统一时区(UTC)
  - 使用请求ID/会话ID关联多个日志条目
  - 构建完整的时间线: 请求进入 → 处理 → 响应 → 后续影响
  - 标注关键事件点和时间间隔
    `,

    `
步骤3: 详细记录复现步骤
  - 一步一步记录如何触发该行为
  - 包含: 输入数据、环境状态、前置条件
  - 确保: 其他人在相同条件下可以复现
  - 记录: 复现次数和一致性(是否每次都能复现)
    `,

    `
步骤4: 对比正常与异常行为
  - 记录正常请求的行为(基线)
  - 对比异常请求与正常请求的差异
  - 关注: 响应时间、返回数据量、错误率、资源消耗
  - 量化差异: "慢20倍" 而非 "明显慢很多"
    `,

    `
步骤5: 收集多维度证据
  - 应用层: 日志、堆栈跟踪、错误信息
  - 网络层: HTTP请求/响应、抓包数据、TLS信息
  - 数据层: SQL查询、查询计划、结果集大小
  - 系统层: CPU、内存、磁盘、网络IO
  - 安全层: WAF日志、IDS/IPS告警、认证日志
    `,

    `
步骤6: 形成关联证据链
  - 将所有证据源按时间线关联
  - 使用request ID、session ID等追踪标识符
  - 形成完整链条: 入口 → 处理 → 影响 → 结果
  - 结论应该基于多维度证据的一致性
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '没有时间戳和来源信息',
      wrong: '"The application crashed"',
      correct: `"[2024-03-15T14:32:18.456Z] ERROR app.log: Unhandled exception
        at UserService.js:45 (req-8f3a9c2d)"`,
      why: '没有时间戳和来源,审核人无法定位和验证问题'
    },

    {
      mistake: '没有复现步骤',
      wrong: '"SQL injection was successful"',
      correct: `"Step 1: GET /search?q=test' OR 1=1--
        Step 2: Response contained all records
        Step 3: Verified with DB log showing unparameterized query"`,
      why: '没有复现步骤,无法确认问题真实存在'
    },

    {
      mistake: '没有正常行为基线',
      wrong: '"Response was 234ms"',
      correct: `"Normal: 12ms (avg over 1000 requests)
        Abnormal: 234ms (20x slower, full table scan triggered)"`,
      why: '没有基线对比,无法判断行为是否异常'
    },

    {
      mistake: '没有关联多个证据源',
      wrong: '"The log shows an error"',
      correct: `"App log: Query execution failed at 14:32:18.456
        DB log: Syntax error in SQL at 14:32:18.458
        Network: 500 response at 14:32:18.470
        All correlated via req-8f3a9c2d"`,
      why: '单一证据源可能不完整,多维度证据增强可信度'
    },

    {
      mistake: '没有记录环境上下文',
      wrong: '"Memory usage spiked"',
      correct: `"Production environment (AWS ECS, 2GB container limit)
        Normal memory: 128MB (6% of limit)
        Spike: 256MB (12% of limit, still within limit)"`,
      why: '不同环境下同样的行为可能有不同的影响'
    },

    {
      mistake: '没有追踪请求生命周期',
      wrong: '"There was an error in the search"',
      correct: `"req-8f3a9c2d lifecycle:
        14:32:18.456 → Received (Gateway)
        14:32:18.457 → Processed (API)
        14:32:18.458 → Queried (DB)
        14:32:18.470 → Returned (API)
        14:32:18.471 → Logged (Audit)"`,
      why: '完整的请求生命周期帮助定位问题发生的具体环节'
    },

    {
      mistake: '没有量化影响',
      wrong: '"A lot of data was exposed"',
      correct: `"15,000 user records exposed:
        - 15,000 email addresses
        - 15,000 phone numbers
        - 15,000 password hashes (bcrypt)
        Total data: ~4.5MB of JSON response"`,
      why: '量化影响帮助准确评估风险和优先级'
    }
  ]
};

export default RuntimeEvidenceStandard;
