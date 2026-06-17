/**
 * RR-001: False Positive Detection Rule
 * 
 * 功能: 审核一个发现，确保它是真实的漏洞而不是误报
 * 焦点: 降低误报的系统方法
 * 
 * 核心问题序列:
 *  1. 是否有补偿性控制?
 *  2. 是否访问受限?
 *  3. 是否有其他防护?
 *  4. 是否是框架特性?
 *  5. 是否真的被执行?
 */

import { ReviewRule } from '../schemas/types';

export const FalsePositiveRule: ReviewRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'RR-001',
  name: 'False Positive Detection',
  description: '通过系统化的问题检查，确认一个发现是否是真实的漏洞',
  
  // ============================================================================
  // 关键审核问题
  // ============================================================================

  questions: [
    {
      question: '是否存在补偿性控制(Compensating Controls)?',
      rationale: `
许多看似存在漏洞的代码实际上有其他防护措施防止被利用。
例如: 虽然有SQL注入点，但参数被WAF过滤、被IDS检测或被其他层防护。
      `,
      possible_answers: [
        {
          answer: '是，存在WAF规则过滤此类攻击',
          meaning: '这可能是误报，因为WAF提供了补偿性防护',
          is_false_positive: true
        },
        {
          answer: '是，存在输入验证规则',
          meaning: '需要检查验证规则是否充分',
          is_false_positive: false
        },
        {
          answer: '是，存在IDS告警规则',
          meaning: '检测到但可能不完全防护，需要深入分析',
          is_false_positive: false
        },
        {
          answer: '否，没有发现任何补偿性控制',
          meaning: '风险更高，需要立即修复',
          is_false_positive: false
        }
      ]
    },

    {
      question: '是否只有特定角色(如管理员)能访问这个功能?',
      rationale: `
如果一个漏洞只能由管理员触发，其风险等级应该降低。
虽然仍是漏洞，但利用难度很高。
      `,
      possible_answers: [
        {
          answer: '是，仅管理员能访问',
          meaning: '严重程度应该降低，但仍需修复',
          is_false_positive: false
        },
        {
          answer: '是，但认证用户都能访问',
          meaning: '风险中等，需要修复',
          is_false_positive: false
        },
        {
          answer: '否，任何人都能访问',
          meaning: '风险最高',
          is_false_positive: false
        },
        {
          answer: '功能需要特定权限组',
          meaning: '需要验证权限检查是否正确实现',
          is_false_positive: false
        }
      ]
    },

    {
      question: '参数是否被严格的白名单限制?',
      rationale: `
即使代码看起来可能存在注入漏洞，如果参数被严格限制，实际风险可能很低。
例如: 用户ID必须是1-999999之间的数字，黑客无法注入SQL语句。
      `,
      possible_answers: [
        {
          answer: '是，使用严格的白名单(如正则表达式)',
          meaning: '这可能防止了漏洞利用，需要评估白名单充分性',
          is_false_positive: true
        },
        {
          answer: '是，但白名单可能不够严格',
          meaning: '白名单可能被绕过，需要进一步审查',
          is_false_positive: false
        },
        {
          answer: '否，没有白名单限制',
          meaning: '参数完全可控，风险高',
          is_false_positive: false
        },
        {
          answer: '有黑名单但没有白名单',
          meaning: '黑名单容易被绕过',
          is_false_positive: false
        }
      ]
    },

    {
      question: '这是否是框架的自动安全特性(如自动参数化)?',
      rationale: `
现代框架(ORM、Web框架)经常自动实现安全措施。
看起来不安全的代码实际上可能被框架自动参数化。
例如: Hibernate自动参数化、Express模板引擎自动转义。
      `,
      possible_answers: [
        {
          answer: '是，框架自动参数化了此查询',
          meaning: '这很可能是误报，框架已处理安全问题',
          is_false_positive: true
        },
        {
          answer: '是，但需要特定配置启用',
          meaning: '需要验证配置是否正确',
          is_false_positive: false
        },
        {
          answer: '否，框架不提供自动防护',
          meaning: '必须手动处理安全',
          is_false_positive: false
        },
        {
          answer: '不确定，需要检查框架文档',
          meaning: '需要进一步研究框架行为',
          is_false_positive: false
        }
      ]
    },

    {
      question: '这个代码路径是否真的会被执行?',
      rationale: `
有些代码看起来危险但实际上是死代码、被禁用、或在异常处理块中。
这些情况下是否是漏洞需要重新评估。
      `,
      possible_answers: [
        {
          answer: '代码被注释或#ifdef禁用',
          meaning: '不会被执行，这是误报',
          is_false_positive: true
        },
        {
          answer: '代码在异常处理块中',
          meaning: '正常情况下不执行，误报可能性高',
          is_false_positive: true
        },
        {
          answer: '代码被 if (false) 保护',
          meaning: '死代码，误报',
          is_false_positive: true
        },
        {
          answer: '代码有可能不执行的条件',
          meaning: '需要分析条件分支',
          is_false_positive: false
        },
        {
          answer: '代码会被正常执行',
          meaning: '如果危险，这是真实漏洞',
          is_false_positive: false
        }
      ]
    },

    {
      question: '这个"漏洞"是否涉及真实的安全边界?',
      rationale: `
有些发现涉及不跨越安全边界的操作，因此不构成真实威胁。
例如: 日志输出中的拼接、内部系统之间的通信、测试代码。
      `,
      possible_answers: [
        {
          answer: '是，这只是日志或错误输出',
          meaning: '不涉及实际系统功能，可能是误报',
          is_false_positive: true
        },
        {
          answer: '是，这是内部系统间的通信',
          meaning: '取决于内部系统的信任程度，可能是误报',
          is_false_positive: false
        },
        {
          answer: '是，这是测试或开发代码',
          meaning: '如果在生产环境，这是真实漏洞',
          is_false_positive: true
        },
        {
          answer: '否，这涉及真实的安全边界',
          meaning: '如果有漏洞，这是真实威胁',
          is_false_positive: false
        }
      ]
    }
  ],

  // ============================================================================
  // 常见误报模式
  // ============================================================================

  false_positive_patterns: [
    {
      name: '管理员功能误报',
      indicators: [
        '函数路径: admin* / management* / internal*',
        '访问控制: 需要 ROLE_ADMIN / isAdmin() 检查',
        '代码注释中提到 "admin only" / "internal use"',
        '错误处理: 非管理员返回403/401'
      ],
      verification_steps: [
        '确认是否有访问控制检查',
        '追踪权限检查的位置和方式',
        '验证权限检查是否在危险操作之前',
        '测试: 用普通用户能否访问此功能?'
      ],
      related_rules: ['AR-003']  // Authentication Check
    },

    {
      name: '框架自动参数化误报',
      indicators: [
        '使用了ORM框架: Hibernate, JPA, Sequelize, SQLAlchemy',
        '使用框架查询API: .find(), .where(), .query()',
        '代码中看起来有拼接但实际使用框架',
        'IDE提示使用了安全API'
      ],
      verification_steps: [
        '查看框架文档关于参数化的说明',
        '检查框架配置是否启用了安全特性',
        '查看框架源代码或生成的SQL日志',
        '运行测试: 尝试SQL注入是否成功?'
      ],
      related_rules: ['AR-005']  // SQL Query Check
    },

    {
      name: '日志输出误报',
      indicators: [
        '函数名包含: log* / print* / debug* / trace*',
        '代码调用: logger.* / console.* / println',
        '拼接内容不涉及数据库查询',
        '这是事后日志而非执行前操作'
      ],
      verification_steps: [
        '确认这是日志输出而非SQL/命令执行',
        '验证输出内容是否会被命令执行',
        '确认这不会导致CRLF注入或日志注入',
        '检查日志是否被进一步处理'
      ],
      related_rules: ['AR-009']  // Command Injection
    },

    {
      name: '白名单防护误报',
      indicators: [
        '参数值在固定列表中: enums / switch / 硬编码列表',
        '参数验证代码: if (value in [...]) / switch/case',
        '类型强制转换: (int) / Integer.parseInt() / atoi()',
        '正则表达式验证: matches("^[0-9]+$")'
      ],
      verification_steps: [
        '分析白名单是否真的限制了参数',
        '检查白名单是否被绕过的可能性',
        '验证类型转换是否足够安全',
        '进行渗透测试: 能否绕过这个防护?'
      ],
      related_rules: ['AR-002']  // Input Validation
    },

    {
      name: '多层防护误报',
      indicators: [
        '代码中有多个安全措施',
        '通过: 输入验证 + 参数化 + WAF + 权限检查',
        '任何一层防护都足以防止漏洞',
        '漏洞仅在绕过所有防护才会出现'
      ],
      verification_steps: [
        '列出每一层防护',
        '评估每层防护的有效性',
        '检查是否存在绕过所有防护的方式',
        '计算总体风险: 单层风险 vs 需绕过多层风险'
      ],
      related_rules: ['RR-002', 'RR-003', 'RR-004']
    },

    {
      name: '代码死亡路径误报',
      indicators: [
        '函数被注释: // function()',
        '代码被 #ifdef 禁用',
        '代码被 if (false) 保护',
        '被 @Deprecated 标记且未使用',
        '代码在异常处理: catch / finally 块中永远无法正常到达'
      ],
      verification_steps: [
        '确认代码是否真的不会被执行',
        '检查是否有其他代码路径调用此函数',
        '验证注释/禁用是否是永久的',
        '代码扫描: 这个函数在哪里被调用?'
      ],
      related_rules: ['RR-002']  // Reachability
    },

    {
      name: 'TOCTOU (Time Of Check, Time Of Use) 假警报',
      indicators: [
        '代码看起来有竞态条件但实际上不存在',
        '变量在检查后立即使用',
        '单线程环境被误认为多线程',
        '状态验证后立即操作'
      ],
      verification_steps: [
        '分析是否真的存在时间窗口',
        '检查是否使用了锁/原子操作',
        '验证执行环境是否真的多线程',
        '评估实际的利用可能性'
      ],
      related_rules: ['AR-001']  // Taint Analysis
    }
  ],

  // ============================================================================
  // 适用范围
  // ============================================================================

  applicable_to_rules: [
    'AR-001',  // Taint Analysis
    'AR-002',  // Input Validation
    'AR-003',  // Authentication Check
    'AR-004',  // Crypto Check
    'AR-005',  // SQL Query Check
    'AR-006',  // Deserialization Check
    'AR-007',  // XXE Check
    'AR-008',  // SSRF Check
    'AR-009',  // Command Injection
    'AR-010'   // Expression Language
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  created_date: '2026-06-16'
};

export default FalsePositiveRule;
