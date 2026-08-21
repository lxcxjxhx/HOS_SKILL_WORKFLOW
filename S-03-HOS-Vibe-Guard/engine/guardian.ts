/**
 * 🔐 HOS-Vibe-Guard · 安全护栏引擎
 *
 * 安全扫描执行规范 — AI 参考此逻辑执行安全检查。
 * 重点不是攻防渗透，而是常见安全反模式的检测和预防。
 *
 * 兼容: Claude Code / Cursor / Windsurf / GitHub Copilot
 */

// ============================================================
// 类型定义
// ============================================================

interface SecurityConfig {
  level: 'basic' | 'normal' | 'paranoid';
  scanScopes: string[];
}

interface SecurityMatch {
  patternId: string;
  severity: 'HARD_FAIL' | 'SOFT_WARN' | 'INFO';
  title: string;
  description: string;
  location?: {
    file: string;
    line?: number;
    snippet?: string;
  };
  risk: string;
  recommendation: string;
  codeExample?: string;
}

interface ContextualCheck {
  checkId: string;
  description: string;
  passed: boolean;
  evidence: string;
  recommendation: string;
}

interface SecurityReport {
  timestamp: string;
  config: SecurityConfig;
  findings: SecurityMatch[];
  contextualChecks: ContextualCheck[];
  passedChecks: { id: string; description: string }[];
  summary: {
    hardFailCount: number;
    softWarnCount: number;
    infoCount: number;
    criticalFindings: string[];
    overallRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

// ============================================================
// 安全扫描规范
// ============================================================

export class SecurityGuardian {
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      level: config.level || 'normal',
      scanScopes: config.scanScopes || [
        'source_files', 'env_files', 'config_files', 'dependencies',
      ],
    };
  }

  /**
   * 扫描文件中的安全风险模式
   *
   * 根据 rules/security-patterns.json 中的模式扫描文件内容。
   *
   * 扫描策略（按 severity level）:
   * - basic: 只扫描 HARD_FAIL 模式
   * - normal: 扫描 HARD_FAIL + SOFT_WARN
   * - paranoid: 扫描所有模式 + 上下文检查
   *
   * @param files - 要扫描的文件列表（路径+内容）
   */
  scanFiles(files: { path: string; content: string }[]): SecurityMatch[] {
    const findings: SecurityMatch[] = [];

    // === 实现指引 ===
    // AI 执行此步骤时应:
    //
    // 1. 对每个文件，按 security-patterns.json 中的 patterns 进行正则匹配
    //
    // 2. 硬编码检测模式（HARD_FAIL）:
    //    - api_key_hardcoded: 匹配 API Key 模式
    //      regex: api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9_-]{16,}['\"]
    //      也检查: sk-[a-zA-Z0-9]{20,} (OpenAI), AKIA[0-9A-Z]{16} (AWS)
    //
    //    - token_hardcoded: 匹配 Token 硬编码
    //      regex: token\s*[:=]\s*['\"][A-Za-z0-9._-]{8,}['\"]
    //
    //    - password_hardcoded: 匹配密码硬编码
    //      regex: password\s*[:=]\s*['\"][^'\"]+['\"]
    //      也检查连接串: postgres://user:pass@ / mysql://user:pass@
    //
    //    - env_in_git: 检查 .gitignore + git ls-files
    //
    //    - sql_injection_vulnerable: 检测 SQL 拼接模式
    //
    // 3. 软警告模式（SOFT_WARN）:
    //    - localstorage_token: localStorage.setItem('token', ...)
    //    - pii_in_code: 手机/邮箱/身份证模式
    //    - no_https: http:// 使用（排除 localhost）
    //    - no_input_validation: 直接拼接用户输入
    //    - weak_crypto: MD5/SHA1 使用
    //    - cors_wildcard_with_credentials: CORS 配置错误
    //
    // 4. 上下文过滤:
    //    - 注释中的 URL/Key 不触发警告（// example key）
    //    - 测试文件中的 mock 数据有标准前缀（test_, mock_）时降级

    return findings;
  }

  /**
   * 执行上下文检查
   *
   * 检查项目级的配置和状态，而非单个文件。
   * 这些检查需要理解项目整体结构。
   */
  runContextualChecks(
    projectFiles: string[],
    gitFiles?: string[]
  ): ContextualCheck[] {
    const checks: ContextualCheck[] = [];

    // === 实现指引 ===
    // AI 执行以下检查:
    //
    // test_data_real_pii:
    //   检查测试数据中是否包含:
    //   - 真实姓名（张三、李四、王五等）
    //   - 真实手机号段（13x/15x/18x/17x...）
    //   - 完整身份证号（18 位 + 校验位）
    //   如果发现，建议使用 Faker
    //
    // env_file_git_tracked:
    //   检查 .gitignore 是否包含 .env / .env.*
    //   如果有 .env 文件但在 .gitignore 中 → pass
    //   如果有 .env 文件且不在 .gitignore 中 → fail

    return checks;
  }

  /**
   * 生成安全检查报告
   */
  generateReport(
    config: SecurityConfig,
    findings: SecurityMatch[],
    contextualChecks: ContextualCheck[]
  ): SecurityReport {
    const hardFail = findings.filter(f => f.severity === 'HARD_FAIL');
    const softWarn = findings.filter(f => f.severity === 'SOFT_WARN');
    const info = findings.filter(f => f.severity === 'INFO');
    const passed = contextualChecks.filter(c => c.passed).map(c => ({
      id: c.checkId,
      description: c.description,
    }));

    let overallRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'NONE';
    if (hardFail.length > 2) overallRisk = 'CRITICAL';
    else if (hardFail.length > 0) overallRisk = 'HIGH';
    else if (softWarn.length > 3) overallRisk = 'MEDIUM';
    else if (softWarn.length > 0) overallRisk = 'LOW';

    return {
      timestamp: new Date().toISOString(),
      config,
      findings,
      contextualChecks,
      passedChecks: passed,
      summary: {
        hardFailCount: hardFail.length,
        softWarnCount: softWarn.length,
        infoCount: info.length,
        criticalFindings: hardFail.map(f => f.title),
        overallRisk,
      },
    };
  }
}

// ============================================================
// 安全检查输出模板
// ============================================================

/**
 * 当检测到安全问题时，使用以下格式输出:
 *
 * 🔐 HOS-Vibe-Guard · 安全检查
 * ──────────────────────────────────────
 * [风险] {CRITICAL|HIGH|MEDIUM|LOW}
 *
 * ❌ 严重问题: {count}
 *   • {title} — {location}
 *     {recommendation}
 *
 * ⚠️ 建议修复: {count}
 *   • {title} — {location}
 *     {recommendation}
 *
 * ✅ 已通过检查: {count}
 *   • {description}
 *   • {description}
 *
 * 安全评分: {secureChecksPassed}/{totalChecks}
 *
 * 当没有安全问题时，仅输出:
 *
 * ✅ HOS-Vibe-Guard: 安全检查通过
 */

// ============================================================
// 代码升级示例
// ============================================================

/**
 * ❌ API Key 硬编码 → ✅ 环境变量方案
 *
 * // Before (不安全)
 * const OPENAI_API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
 * const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
 *
 * // After (安全)
 * const openai = new OpenAI({
 *   apiKey: process.env.OPENAI_API_KEY,
 * });
 *
 * // .env 文件（不提交到 git）
 * OPENAI_API_KEY=sk-xxxxxxxxx
 *
 * // .env.example（提交到 git，作为模板）
 * OPENAI_API_KEY=your-api-key-here
 *
 * // .gitignore
 * .env
 * .env.local
 */

/**
 * ❌ Token 存 localStorage → ✅ httpOnly Cookie
 *
 * // Before (不安全 — 可被 XSS 窃取)
 * localStorage.setItem('auth_token', jwt);
 * const token = localStorage.getItem('auth_token');
 *
 * // After (安全 — httpOnly cookie 不可被 JavaScript 访问)
 * // 后端设置:
 * Set-Cookie: auth_token={jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
 *
 * // 或使用 BFF (Backend for Frontend) 模式:
 * // 前端 → BFF → 外部 API（前端不持有 token）
 * const response = await fetch('/api/bff/proxy', { /* 前端无需 token */ });
 */

/**
 * ❌ 测试数据含真实 PII → ✅ Faker 生成
 *
 * // Before (不安全 — 真实个人信息)
 * const testUser = {
 *   name: '张三',
 *   phone: '13800138000',
 *   email: 'zhangsan@example.com',
 *   idCard: '110101199001011234',
 * };
 *
 * // After (安全 — 使用 Faker)
 * import { faker } from '@faker-js/faker';
 *
 * const testUser = {
 *   name: faker.person.fullName(),
 *   phone: faker.phone.number(),
 *   email: faker.internet.email(),
 *   idCard: faker.string.numeric(18),
 * };
 */
