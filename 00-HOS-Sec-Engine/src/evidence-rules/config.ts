/**
 * ER-003: Configuration Evidence Standard
 * 
 * 功能: 规范配置证据的采集和呈现
 * 焦点: 收集框架设置、安全配置、环境变量等配置层面的证据
 * 
 * 核心原则:
 *  1. 记录配置文件的确切位置和完整内容
 *  2. 标注安全相关配置项及其默认值 vs 实际值
 *  3. 区分开发/测试/生产环境的配置差异
 *  4. 识别配置缺失和配置错误两种情况
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const ConfigEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-003',
  type: EvidenceType.Configuration,
  name: 'Configuration Evidence Standard',
  description: '规范配置层面证据的采集，确保框架设置、安全配置、环境变量等配置证据完整可追溯',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'config_file_path',        // 配置文件路径
    'config_section',          // 配置项所在的部分/节点
    'setting_name',            // 配置项名称
    'current_value',           // 当前配置值
    'expected_secure_value',   // 安全建议值
    'environment',             // 适用环境(dev/test/prod/all)
    'impact_analysis',         // 此配置对安全的影响分析
    'conclusion'               // 配置是否安全/是否存在风险
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'default_value',           // 框架/库的默认配置值
    'config_source',           // 配置来源(代码硬编码/配置文件/环境变量/数据库)
    'override_chain',          // 配置覆盖链(哪个配置覆盖了哪个)
    'related_settings',        // 相关联的其他配置项
    'framework_version',       // 框架版本(影响默认安全行为)
    'deployment_context',      // 部署环境信息(容器/云平台/物理机)
    'audit_log'                // 配置变更审计记录
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== CORS Configuration Evidence (Good Example) ===

Configuration File:
  Path: config/security/cors.js
  Environment: Production
  Framework: Express.js 4.18.2

Security Setting:
  Setting: cors.origin
  Current Value: '*' (allow all origins)
  Default Value: Same-origin (if not configured)
  Expected Secure Value: ['https://trusted-domain.com']

Full Config Context:
  // config/security/cors.js
  module.exports = {
    origin: '*',                    // <- INSECURE: allows any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: true,              // <- DANGEROUS combined with origin: '*'
    maxAge: 86400
  };

Override Chain:
  1. Default: Express cors middleware (same-origin)
  2. Override: config/security/cors.js (sets origin: '*')
  3. Environment Variable: CORS_ORIGIN (not set, uses config file)

Impact Analysis:
  ❌ origin: '*' allows any website to make cross-origin requests
  ❌ credentials: true with wildcard origin is blocked by browsers,
     but misconfigured servers may still accept them
  ❌ No origin whitelist or pattern validation
  ✓ Methods are restricted (no PATCH, OPTIONS not listed)
  ⚠ maxAge: 86400 (24h) - preflight cache too long

Related Settings:
  - CSRF Protection: NOT enabled (middleware not configured)
  - Content-Security-Policy: Not set in response headers
  - X-Frame-Options: Not configured

Conclusion:
  CORS configuration is INSECURE in production.
  Wildcard origin (*) combined with credentials: true creates a high-risk
  configuration. Even though browsers block this specific combination,
  the intent to allow all origins indicates a misunderstanding of CORS.
  
  Risk: MEDIUM - May expose APIs to unauthorized cross-origin access
  Confidence: HIGH - Direct config file evidence
  
  Remediation:
    Replace origin: '*' with explicit whitelist:
    origin: ['https://app.trusted-domain.com', 'https://admin.trusted-domain.com']
    credentials: true  // OK with explicit origin whitelist
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== CORS Configuration Evidence (Bad Example) ✗ ===

Bad #1 - Missing Config File Location:
  "CORS is not properly configured"
  ❌ 没有说明配置文件位置和具体配置项

Bad #2 - No Current Value:
  "CORS origin is too permissive"
  ❌ 没有给出实际的配置值，无法确认风险

Bad #3 - Ignoring Context:
  "origin: '*' is bad"
  ❌ 没有分析整体上下文(如: 是否同时设置了credentials)

Bad #4 - No Environment Distinction:
  "The CORS config is wrong"
  ❌ 没有说明是哪个环境的配置，开发环境可能可以接受宽松配置

Bad #5 - No Default Comparison:
  "You should change the CORS setting"
  ❌ 没有对比默认值，不清楚实际偏离了多少

Bad #6 - Missing Related Settings:
  "CORS is misconfigured"
  ❌ 没有检查CSRF、CSP等关联安全配置的整体情况
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 定位配置文件
  - 搜索常见配置文件: .env, config/*.js, application.yml, web.config等
  - 识别框架特定配置: Django settings.py, Spring application.properties等
  - 记录: 文件完整路径 + 环境标识(dev/test/staging/prod)
  - 注意: 配置可能分布在多个文件或环境变量中
    `,

    `
步骤2: 提取安全相关配置项
  - 识别安全配置: 认证、授权、加密、CORS、CSRF、会话、日志等
  - 记录: 配置名称 + 当前值 + 所在行号
  - 标注: 该配置的安全含义和影响范围
    `,

    `
步骤3: 对比安全基准值
  - 查找框架默认值: 文档/源码中的默认配置
  - 对比安全建议: OWASP/安全最佳实践推荐值
  - 分析偏离: 当前值 vs 默认值 vs 安全值的差异
  - 评估: 偏离是否引入了安全风险
    `,

    `
步骤4: 追踪配置覆盖链
  - 检查优先级: 环境变量 > 配置文件 > 代码默认值
  - 追踪覆盖关系: 哪个配置覆盖了哪个
  - 注意: 运行时动态配置可能覆盖静态配置
  - 记录: 完整的配置解析/覆盖路径
    `,

    `
步骤5: 检查关联配置
  - 安全配置通常相互关联(如: CORS + CSRF + CSP)
  - 检查一个配置是否影响其他配置的效果
  - 评估整体安全配置的一致性和完整性
  - 识别配置冲突(如: 同时启用和禁用某个功能)
    `,

    `
步骤6: 形成配置评估结论
  - 明确标注: 安全 / 不安全 / 需要改进
  - 说明: 风险等级和影响范围
  - 给出: 具体的修复建议和推荐配置值
  - 注意: 区分"配置缺失"和"配置错误"
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '没有指定配置文件位置',
      wrong: '"CORS is misconfigured"',
      correct: '"config/security/cors.js: Line 3 - origin: \'*\'"',
      why: '审核人需要找到并验证具体的配置项'
    },

    {
      mistake: '没有对比默认值和安全值',
      wrong: '"session timeout is too short"',
      correct: `"Current: 5min | Default: 30min | Recommended: 15-30min
        Impact: May cause UX issues but increases security"`,
      why: '没有基准对比，无法判断配置是否真的不合理'
    },

    {
      mistake: '忽视环境差异',
      wrong: '"DEBUG mode is enabled"',
      correct: `"DEBUG=true in .env.development (acceptable)
        DEBUG=false in .env.production (correct)
        Verified: Production deployment has DEBUG disabled"`,
      why: '开发环境的安全宽松配置可能是合理的'
    },

    {
      mistake: '没有追踪配置覆盖',
      wrong: '"The config file says origin: *"',
      correct: `"Config file sets origin: '*' BUT
        Environment variable CORS_ORIGIN=https://app.example.com
        Runtime value is https://app.example.com (env overrides file)"`,
      why: '最终生效的配置可能被环境变量或运行时设置覆盖'
    },

    {
      mistake: '孤立分析单个配置',
      wrong: '"CSRF token setting is correct"',
      correct: `"CSRF token enabled ✓ BUT
        CORS origin: '*' allows cross-origin requests ✗
        Combined effect: CSRF protection may be bypassed via CORS"`,
      why: '配置之间可能相互影响，需要整体评估'
    },

    {
      mistake: '没有验证配置是否生效',
      wrong: '"Security header X-Frame-Options is set in config"',
      correct: `"Config sets X-Frame-Options: DENY ✓
        Verified: Response headers include X-Frame-Options: DENY ✓
        Config is effective and working as expected"`,
      why: '配置存在不代表生效，需要验证运行时效果'
    },

    {
      mistake: '混淆配置缺失和配置错误',
      wrong: '"No CSRF protection found"',
      correct: `"Two possible issues:
        1. Config missing: No CSRF middleware configured
        2. Config wrong: CSRF enabled but with incorrect token validation
        Investigation: Case 1 confirmed - middleware not added to pipeline"`,
      why: '两种情况的风险和修复方式不同'
    }
  ]
};

export default ConfigEvidenceStandard;
