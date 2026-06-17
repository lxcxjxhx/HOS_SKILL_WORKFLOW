/**
 * RR-005: Context Analysis Rule
 * 
 * 功能: 分析业务上下文、部署环境和应用架构对安全评估的影响
 * 焦点: 理解系统在实际运行环境中的安全姿态，识别上下文相关的安全假设
 * 
 * 核心问题序列:
 *  1. 应用的业务类型和安全需求是什么?
 *  2. 部署环境的安全特性如何?
 *  3. 系统架构是否提供额外的安全边界?
 *  4. 系统的信任模型和威胁模型是什么?
 *  5. 外部依赖和集成的安全风险?
 */

import { ReviewRule } from '../schemas/types';

export const ContextAnalysisRule: ReviewRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'RR-005',
  name: 'Context Analysis',
  description: '分析业务上下文、部署环境和应用架构，识别上下文相关的安全假设和风险因素',

  // ============================================================================
  // 关键审核问题
  // ============================================================================

  questions: [
    {
      question: '该应用的业务类型和安全需求等级是什么?',
      rationale: `
不同业务类型对安全的要求不同。金融系统的安全标准远高于内部博客系统。
需要了解应用处理的业务类型、用户群体和数据敏感度，以正确评估风险的优先级。
同时考虑应用是否为面向互联网(高暴露)还是内部使用(低暴露)。
      `,
      possible_answers: [
        {
          answer: '金融/支付/医疗等高风险业务',
          meaning: '安全要求最高，任何漏洞都需要严肃对待',
          is_false_positive: false
        },
        {
          answer: '面向公众的商业应用',
          meaning: '安全要求高，需要考虑攻击面广泛',
          is_false_positive: false
        },
        {
          answer: '企业内部系统，不面向公众',
          meaning: '安全要求中等，内部用户有一定信任',
          is_false_positive: false
        },
        {
          answer: '开发/测试/内部工具',
          meaning: '安全要求较低，但不应完全忽略',
          is_false_positive: false
        }
      ]
    },

    {
      question: '部署环境提供了哪些安全基础设施?',
      rationale: `
现代云原生部署环境通常提供多层安全基础设施。
容器隔离、服务网格(mTLS)、云平台安全组、WAF等都提供了额外的安全层。
这些基础设施可能已经缓解了许多传统的安全问题。
      `,
      possible_answers: [
        {
          answer: '是，部署在受管理的云平台且有完善安全配置',
          meaning: '基础设施提供了额外的安全保护',
          is_false_positive: false
        },
        {
          answer: '是，使用容器编排(K8s)且有网络策略',
          meaning: '微服务隔离减少了横向移动风险',
          is_false_positive: false
        },
        {
          answer: '是，有WAF/CDN/Layer7防护',
          meaning: '常见攻击可能在到达应用前被拦截',
          is_false_positive: false
        },
        {
          answer: '否，部署在传统环境或缺乏安全基础设施',
          meaning: '应用层安全是唯一防线',
          is_false_positive: false
        }
      ]
    },

    {
      question: '系统架构是否定义了明确的安全边界?',
      rationale: `
良好的系统架构应该有明确定义的安全边界和信任区域(DMZ、内网、管理网)。
了解这些边界有助于判断: 一个从DMZ到内网的请求是否可信?
微服务架构中的服务间通信是否需要认证? API网关是否统一处理安全?
      `,
      possible_answers: [
        {
          answer: '是，有明确的网络分层和安全边界',
          meaning: '攻击需要跨越多个安全域，难度增加',
          is_false_positive: false
        },
        {
          answer: '是，使用API网关统一管理入口',
          meaning: '认证、限流、校验在网关层统一处理',
          is_false_positive: false
        },
        {
          answer: '是，微服务间使用mTLS认证',
          meaning: '服务间通信有加密和身份验证',
          is_false_positive: false
        },
        {
          answer: '否，扁平网络架构，缺乏安全边界',
          meaning: '一旦突破 perimeter，内部完全暴露',
          is_false_positive: false
        }
      ]
    },

    {
      question: '系统的信任模型是什么? 谁信任谁?',
      rationale: `
信任模型决定了哪些组件之间的通信可以假设是安全的。
如果内部服务之间默认互信，那么SSRF或内部服务调用的风险较低。
如果零信任模型，则所有通信都需要验证。
了解信任模型对于评估内部漏洞的风险至关重要。
      `,
      possible_answers: [
        {
          answer: '零信任模型，所有通信都需要验证',
          meaning: '内部漏洞风险高，因为不能假设内部安全',
          is_false_positive: false
        },
        {
          answer: '部分信任，内部服务间默认可信',
          meaning: '内部漏洞风险较低，但需要防范外部渗透',
          is_false_positive: false
        },
        {
          answer: '完全信任内部网络',
          meaning: '假设内网安全，可能低估内部威胁',
          is_false_positive: false
        },
        {
          answer: '基于角色的信任，不同角色有不同信任级别',
          meaning: '需要评估角色信任模型的正确性',
          is_false_positive: false
        }
      ]
    },

    {
      question: '系统依赖的外部服务或第三方组件引入了哪些风险?',
      rationale: `
现代应用大量依赖外部服务和第三方组件。
这些依赖可能引入供应链攻击、服务中断、数据泄露等风险。
需要评估外部依赖的安全性和可靠性，以及系统对外部依赖的信任程度。
      `,
      possible_answers: [
        {
          answer: '依赖少量成熟、可信的第三方服务',
          meaning: '供应链风险可控',
          is_false_positive: false
        },
        {
          answer: '依赖大量第三方库，缺乏安全审查',
          meaning: '供应链攻击风险高，需要SCA分析',
          is_false_positive: false
        },
        {
          answer: '依赖外部API，数据发送到第三方',
          meaning: '需要考虑数据隐私和第三方信任',
          is_false_positive: false
        },
        {
          answer: '使用自研组件，外部依赖少',
          meaning: '供应链风险低，但自研代码需要审查',
          is_false_positive: false
        }
      ]
    },

    {
      question: '应用的部署和发布流程是否包含安全控制?',
      rationale: `
CI/CD流程中的安全控制(如SAST、DAST、依赖扫描、密钥检测)可以在发布前捕获问题。
如果发布流程缺乏安全控制，漏洞可能直接进入生产环境。
了解发布流程有助于评估漏洞进入生产的可能性和修复速度。
      `,
      possible_answers: [
        {
          answer: '是，CI/CD包含完整的自动化安全扫描',
          meaning: '新问题更可能在发布前被发现',
          is_false_positive: false
        },
        {
          answer: '是，有基本的安全检查但不够全面',
          meaning: '部分漏洞可能遗漏到生产环境',
          is_false_positive: false
        },
        {
          answer: '否，发布流程缺乏自动化安全控制',
          meaning: '高度依赖人工审查，风险更高',
          is_false_positive: false
        },
        {
          answer: '有安全审查但流程不规范',
          meaning: '安全控制的有效性不一致',
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
      name: '忽略部署环境误报',
      indicators: [
        '漏洞报告未考虑生产环境的安全配置',
        '基于默认配置评估风险但生产已加固',
        '未考虑云安全组/防火墙的实际规则',
        '假设端口暴露但实际仅内网可访问'
      ],
      verification_steps: [
        '检查生产环境的实际安全配置',
        '验证云安全组和网络ACL规则',
        '确认服务的实际监听地址和端口',
        '对比报告假设与实际部署差异'
      ],
      related_rules: ['RR-003', 'RR-004']
    },

    {
      name: '忽略业务上下文误报',
      indicators: [
        '漏洞评估未考虑应用的实际情况',
        '假设所有用户都是恶意的但实际是内部系统',
        '未考虑数据已经是公开的',
        '假设高价值目标但实际是低价值系统'
      ],
      verification_steps: [
        '了解应用的业务用途和用户群体',
        '评估受影响数据的实际价值',
        '确认系统是否面向互联网',
        '了解业务对安全的具体要求'
      ],
      related_rules: ['RR-004']
    },

    {
      name: '架构安全假设误报',
      indicators: [
        '假设架构有安全防护但实际未部署',
        '报告假设服务间有认证但实际没有',
        '假设API网关处理了所有安全检查',
        '假设微服务隔离但实际共享数据库'
      ],
      verification_steps: [
        '确认架构文档与实际部署是否一致',
        '验证安全组件是否真的在生产环境运行',
        '检查服务间通信的实际认证机制',
        '确认数据隔离的实际实现方式'
      ],
      related_rules: ['RR-001', 'RR-003']
    },

    {
      name: '第三方组件信任误报',
      indicators: [
        '盲目信任第三方组件的安全性',
        '未检查依赖库的已知漏洞',
        '假设第三方API总是返回可信数据',
        '未考虑供应链攻击的可能性'
      ],
      verification_steps: [
        '运行SCA(软件组成分析)扫描依赖',
        '检查依赖库的安全维护历史',
        '验证第三方API返回数据的处理',
        '评估依赖更新策略和响应速度'
      ],
      related_rules: ['AR-001', 'AR-006']
    },

    {
      name: '合规要求忽略误报',
      indicators: [
        '漏洞评估未考虑行业合规要求',
        '未识别数据处理涉及的法规约束',
        '忽略了数据驻留和跨境传输要求',
        '未考虑审计日志和可追溯性需求'
      ],
      verification_steps: [
        '识别应用涉及的所有合规要求',
        '评估漏洞是否导致合规违规',
        '检查数据处理是否符合法规',
        '确认审计和日志是否满足要求'
      ],
      related_rules: ['RR-004']
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

export default ContextAnalysisRule;
