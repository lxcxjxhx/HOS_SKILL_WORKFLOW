/**
 * AR-003: Authentication Check Rule
 * 
 * 功能: 检查认证机制的实现,识别认证绕过、弱认证、会话管理缺陷
 * 焦点: 不是告诉AI"什么是认证"
 *      而是定义AI"如何检查认证实现"的6步流程
 * 
 * 检查流程:
 *  1. 认证端点识别
 *  2. 凭证处理方式
 *  3. 会话管理机制
 *  4. 认证绕过检测
 *  5. 密码策略检查
 *  6. 多因素认证分析
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';
export const AuthCheckRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-003',
  name: 'Authentication Check',
  description: '检查认证机制实现,识别认证绕过、弱认证凭证处理、会话管理缺陷',
  detail: `
本规则的目的是系统化地检查代码中的认证实现是否安全。

核心理念:
- 不是问"认证机制安全吗"
- 而是问"认证流程的每个环节是否存在可被利用的缺陷"

关键问题序列:
1. 代码中有哪些认证相关的端点和逻辑?
2. 用户凭证(密码、token)如何存储和验证?
3. 会话/Token如何创建、验证、销毁?
4. 是否存在认证绕过路径(直接访问、参数篡改、逻辑缺陷)?
5. 密码策略是否足够强?
6. 是否实现了多因素认证?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      '登录处理: login() / authenticate() / signIn()',
      'Token生成: jwt.sign() / generateToken() / createAccessToken()',
      '密码处理: bcrypt.hash() / password.encode() / MD5()',
      '会话管理: session.set() / req.session / cookie设置',
      '权限检查: requireAuth() / isAuthenticated() / @PreAuthorize',
      '密码重置: resetPassword() / forgotPassword()',
      'OAuth处理: oauth.callback() / passport.authenticate()'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go
    ],
    frameworks: [
      'Spring Security',
      'Passport.js',
      'JWT',
      'OAuth2',
      'Django Auth',
      'ASP.NET Identity',
      'Laravel Sanctum'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '认证端点识别',
      condition: '识别所有与认证相关的API端点和处理逻辑',
      questions: [
        '代码中定义了哪些认证相关的端点?',
        '登录、注册、密码重置、Token刷新等端点是否都存在?',
        '是否有管理员专用认证端点?',
        '第三方认证(OAuth、SSO)如何处理?',
        'API认证和Web页面认证是否共用逻辑?'
      ],
      failureIndicators: [
        '存在无速率限制的登录端点',
        '密码重置端点无验证码或时效限制',
        '注册端点无邮箱验证',
        '管理员端点与普通端点共用认证逻辑',
        '存在未文档化的认证端点'
      ],
      successIndicators: [
        '所有认证端点都有速率限制',
        '认证流程完整(登录、重置、注销)',
        '管理端点有独立的认证和授权',
        '第三方认证有状态验证'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '凭证处理方式',
      condition: '检查用户凭证的存储、传输和验证方式',
      questions: [
        '密码使用什么算法存储(明文、哈希、加盐哈希)?',
        '哈希算法是否安全(MD5/SHA1 vs bcrypt/Argon2)?',
        '密码验证时是否存在时间侧信道?',
        '传输过程中凭证是否加密(HTTPS)?',
        '日志中是否可能泄露凭证?'
      ],
      failureIndicators: [
        '明文存储密码',
        '使用MD5/SHA1: md5(password) / sha1(password)',
        '无盐值哈希: sha256(password)',
        '密码验证使用==而非恒定时间比较',
        '错误信息区分"用户不存在"和"密码错误"',
        '日志中记录了密码或token'
      ],
      successIndicators: [
        '使用bcrypt/Argon2/scrypt',
        '每个用户有独立的随机盐值',
        '恒定时间比较: timingSafeEqual()',
        '统一错误信息: "Invalid credentials"',
        '日志中脱敏处理'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '会话管理机制',
      condition: '检查Token/Session的创建、验证、刷新和销毁机制',
      questions: [
        'Token使用什么算法签名(HS256/RS256)?',
        'Token是否有合理的过期时间?',
        'Token刷新机制是否安全?',
        '注销后Token是否立即失效?',
        'Cookie是否设置了安全属性(Secure、HttpOnly、SameSite)?',
        '是否存在Token固定攻击风险?'
      ],
      failureIndicators: [
        '使用HS256且密钥弱: jwt.sign(data, "secret")',
        'Token无过期时间: expiresIn: 0',
        'Token过期时间过长(>24小时)',
        '注销不使Token失效',
        'Cookie无Secure/HttpOnly属性',
        'JWT算法未验证: jwt.verify(token) 无algorithm选项',
        '刷新Token可无限次使用'
      ],
      successIndicators: [
        '使用RS256或强密钥的HS256',
        'Access Token短过期(15-30分钟)',
        'Refresh Token有使用次数限制',
        '注销后Token加入黑名单',
        'Cookie设置Secure、HttpOnly、SameSite=Strict',
        'JWT验证明确指定算法'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '认证绕过检测',
      condition: '检查是否存在可绕过认证的路径或逻辑缺陷',
      questions: [
        '是否有端点缺少认证中间件?',
        '认证检查是否在业务逻辑之后执行?',
        '是否存在认证中间件被跳过的情形?',
        '错误处理是否会绕过认证?',
        '是否存在认证状态可被客户端控制的情况?',
        'API版本切换是否会绕过认证?'
      ],
      failureIndicators: [
        '路由定义无认证中间件: app.get("/admin/users", handler)',
        '认证检查在敏感操作之后',
        '异常处理跳过认证: try { auth() } catch(e) { proceed() }',
        '客户端可设置认证状态: req.isAuthenticated = true',
        '不同API版本认证逻辑不一致',
        'CORS配置允许任意来源携带凭证'
      ],
      successIndicators: [
        '所有敏感端点都有认证中间件',
        '认证在路由层统一拦截',
        '异常不会绕过安全检查',
        '认证状态由服务端控制'
      ],
      criticality: 'must-have'
    },

    {
      order: 5,
      name: '密码策略检查',
      condition: '检查密码复杂度要求和账户保护机制',
      questions: [
        '是否有密码复杂度要求(长度、字符类型)?',
        '是否有登录失败锁定机制?',
        '是否有常见密码黑名单?',
        '密码修改是否需要旧密码验证?',
        '是否有账户异常登录检测?'
      ],
      failureIndicators: [
        '无密码复杂度要求',
        '允许弱密码: password/123456/admin',
        '无登录失败限制(可暴力破解)',
        '密码修改无需旧密码',
        '无异常登录检测',
        '密码可被明文查看'
      ],
      successIndicators: [
        '密码最小长度>=8,要求大小写+数字+特殊字符',
        '登录失败N次后锁定账户',
        '常见密码黑名单检查',
        '密码修改需要旧密码+邮箱验证',
        '异常登录告警'
      ],
      criticality: 'important'
    },

    {
      order: 6,
      name: '多因素认证分析',
      condition: '检查是否实现了多因素认证及实现质量',
      questions: [
        '是否支持多因素认证(MFA/2FA)?',
        'MFA实现使用什么方式(TOTP、SMS、Email、WebAuthn)?',
        'MFA绕过是否被正确处理?',
        'MFA备用码(Recovery Code)如何管理?',
        'MFA设备绑定是否安全?'
      ],
      failureIndicators: [
        '无多因素认证支持',
        'MFA可被跳过: ?skip_mfa=true',
        'TOTP密钥存储未加密',
        '备用码明文存储',
        'SMS验证无速率限制',
        'MFA设备绑定无验证'
      ],
      successIndicators: [
        '支持TOTP或WebAuthn',
        'MFA强制开启(特定角色/操作)',
        'TOTP密钥加密存储',
        '备用码哈希存储且一次性使用',
        'MFA有速率限制和锁定机制'
      ],
      criticality: 'nice-to-have'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '认证相关代码位置,包括登录、Token生成、验证逻辑',
      example: `
弱密码哈希:
  文件: src/services/authService.js
  行号: 30
  代码:
    const hash = crypto.createHash('md5').update(password).digest('hex');
    // <- 使用MD5,不安全的哈希算法

无速率限制的登录:
  文件: src/routes/auth.js
  行号: 10
  代码:
    app.post('/api/login', async (req, res) => {
      // <- 无速率限制中间件
      const user = await User.findOne({ email: req.body.email });
    });
      `,
      collection_guidance: '标注认证处理逻辑的文件路径和行号，展示密码处理和Token生成的完整代码，高亮不安全的实现方式，包括错误处理和异常处理代码'
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: '认证相关配置,如JWT密钥、Session配置、Cookie设置',
      example: `
JWT配置:
  文件: src/config/auth.js
  代码:
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';  // <- 弱密钥
    const JWT_EXPIRY = '365d';  // <- 过期时间过长
      `,
      collection_guidance: '检查JWT/Session配置，检查密钥管理方式，检查Cookie安全属性，检查认证中间件配置'
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: '凭证从输入到验证的完整流程',
      example: `
认证数据流:
  1. 用户输入: { email, password }
  2. 查找用户: User.findOne({ email })
  3. 密码验证: bcrypt.compare(password, user.hash)
  4. Token生成: jwt.sign({ id: user.id }, secret)
  5. 返回Token: { accessToken, refreshToken }
  
  问题: 步骤3使用bcrypt(OK),但步骤2在密码错误前暴露用户是否存在
      `,
      collection_guidance: '追踪完整的认证流程，标记每个步骤的安全控制，记录凭证处理方式和存储格式'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '使用安全的密码哈希算法',
      code: `
// Node.js - bcrypt
import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);  // 恒定时间比较
};

// Java - BCrypt
@Autowired
private PasswordEncoder passwordEncoder;

String hashed = passwordEncoder.encode(rawPassword);
boolean matches = passwordEncoder.matches(rawPassword, hashed);

// Python - Argon2
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)
ph.verify(hash, password)
      `,
      description: '使用bcrypt、Argon2或scrypt等专门为密码设计的慢哈希算法,增加暴力破解成本。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '实施JWT安全最佳实践',
      code: `
// Node.js - 安全JWT配置
import jwt from 'jsonwebtoken';

const tokenConfig = {
  algorithm: 'RS256',           // 非对称加密
  expiresIn: '15m',             // 短期Access Token
  issuer: 'my-app',
  audience: 'my-app-users'
};

// 验证时明确指定算法
jwt.verify(token, publicKey, { algorithms: ['RS256'] });

// Cookie安全设置
res.cookie('token', tokenValue, {
  httpOnly: true,      // 防止XSS读取
  secure: true,        // 仅HTTPS传输
  sameSite: 'strict',  // 防止CSRF
  maxAge: 15 * 60 * 1000
});
      `,
      description: '使用强算法、短期Token、安全Cookie属性,确保Token在传输和存储中的安全。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '实施登录速率限制和账户锁定',
      code: `
// Express - 速率限制
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分钟
  max: 5,                     // 最多5次尝试
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/login', loginLimiter, loginHandler);

// 账户锁定
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;  // 30分钟

if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
  if (Date.now() - user.lockedAt < LOCKOUT_DURATION) {
    return res.status(429).json({ error: 'Account locked' });
  }
  user.failedAttempts = 0;
  user.lockedAt = null;
}
      `,
      description: '通过速率限制和账户锁定机制防止暴力破解和凭证填充攻击。',
      difficulty: 'Easy'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-287', 'CWE-306', 'CWE-798'],  // Improper Authentication, Missing Authentication, Hardcoded Credentials
  owasp_categories: [
    'A07:2021 - Identification and Authentication Failures',
    'A02:2021 - Cryptographic Failures'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default AuthCheckRule;
