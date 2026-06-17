/**
 * RR-004: Severity Calibration Rule
 * 
 * 功能: 根据上下文、访问控制和缓解措施调整漏洞的严重程度评级
 * 焦点: 综合业务影响、技术影响和现有防护措施进行严重程度的动态校准
 * 
 * 核心问题序列:
 *  1. 受影响数据的敏感程度如何?
 *  2. 现有防护措施能否降低影响?
 *  3. 漏洞对业务连续性的影响?
 *  4. 是否有合规或法规要求?
 *  5. 修复的紧急程度和成本?
 */

import { ReviewRule } from '../schemas/types';

export const SeverityCalibrationRule: ReviewRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'RR-004',
  name: 'Severity Calibration',
  description: '综合业务上下文、技术环境和现有防护措施，对漏洞严重程度进行动态校准',

  // ============================================================================
  // 关键审核问题
  // ============================================================================

  questions: [
    {
      question: '受影响的数据或资源的敏感程度如何?',
      rationale: `
漏洞的严重程度很大程度上取决于受影响数据的价值。
泄露用户密码比泄露公开新闻内容严重得多。
需要根据数据分类(公开、内部、机密、绝密)来评估影响。
同时考虑数据量级: 影响10条记录和100万条记录的影响完全不同。
      `,
      possible_answers: [
        {
          answer: '涉及敏感数据(密码、密钥、支付信息、个人身份信息)',
          meaning: '最高影响级别，可能导致数据泄露合规问题',
          is_false_positive: false
        },
        {
          answer: '涉及业务敏感数据(财务、商业机密、内部配置)',
          meaning: '高影响级别，可能造成商业损失',
          is_false_positive: false
        },
        {
          answer: '涉及一般用户数据(用户名、邮箱、偏好设置)',
          meaning: '中等影响级别，需要关注但不紧急',
          is_false_positive: false
        },
        {
          answer: '仅涉及公开或非敏感数据',
          meaning: '低影响级别，严重程度应该下调',
          is_false_positive: false
        }
      ]
    },

    {
      question: '是否有纵深防御(Depth of Defense)措施可以缓解影响?',
      rationale: `
即使单点存在漏洞，多层安全措施可以显著降低实际风险。
例如: 即使存在SQL注入，如果数据库使用只读账号且数据已加密，影响被大幅限制。
需要评估每层防护的有效性和独立性。
      `,
      possible_answers: [
        {
          answer: '是，有多层独立防护措施',
          meaning: '即使单点被突破，整体风险仍然可控',
          is_false_positive: false
        },
        {
          answer: '是，但防护措施间存在依赖关系',
          meaning: '需要评估共同失效模式',
          is_false_positive: false
        },
        {
          answer: '只有单一防护措施',
          meaning: '该防护被绕过即完全暴露',
          is_false_positive: false
        },
        {
          answer: '否，没有额外的防护措施',
          meaning: '漏洞直接影响系统，风险最高',
          is_false_positive: false
        }
      ]
    },

    {
      question: '漏洞被利用后是否影响业务连续性?',
      rationale: `
某些漏洞允许攻击者破坏服务的可用性。
影响业务连续性的漏洞(如DoS、数据破坏)通常比纯信息泄露更紧急。
需要考虑系统的关键程度: 核心支付系统的漏洞比内部报表系统的漏洞更紧急。
      `,
      possible_answers: [
        {
          answer: '是，可能导致服务完全中断',
          meaning: '最高紧急程度，影响业务可用性',
          is_false_positive: false
        },
        {
          answer: '是，可能导致部分功能不可用',
          meaning: '高紧急程度，影响用户体验',
          is_false_positive: false
        },
        {
          answer: '否，不影响服务可用性',
          meaning: '主要关注数据安全性而非可用性',
          is_false_positive: false
        },
        {
          answer: '仅影响非核心功能',
          meaning: '严重程度可以降低',
          is_false_positive: false
        }
      ]
    },

    {
      question: '该漏洞是否违反合规或法规要求?',
      rationale: `
某些漏洞直接导致合规违规(GDPR、PCI DSS、HIPAA、等保2.0等)。
合规违规可能带来法律后果和巨额罚款，需要提升优先级。
即使技术上风险较低，合规要求可能强制要求修复。
      `,
      possible_answers: [
        {
          answer: '是，违反数据保护法规(GDPR、个人信息保护法等)',
          meaning: '必须修复以避免法律后果和罚款',
          is_false_positive: false
        },
        {
          answer: '是，违反行业标准(PCI DSS、HIPAA等)',
          meaning: '可能影响认证和业务合作',
          is_false_positive: false
        },
        {
          answer: '是，违反内部安全策略',
          meaning: '需要按内部流程处理',
          is_false_positive: false
        },
        {
          answer: '否，不涉及合规问题',
          meaning: '仅基于技术风险评估优先级',
          is_false_positive: false
        }
      ]
    },

    {
      question: '修复该漏洞的难度和成本如何?',
      rationale: `
修复成本影响优先级排序。
如果修复非常简单(一行代码改动)，即使风险较低也应该立即修复。
如果修复需要重大重构，可能需要评估临时缓解措施。
      `,
      possible_answers: [
        {
          answer: '修复简单，少量代码改动',
          meaning: '应该立即修复，成本低',
          is_false_positive: false
        },
        {
          answer: '修复中等，需要修改多个文件或模块',
          meaning: '需要合理安排修复计划',
          is_false_positive: false
        },
        {
          answer: '修复复杂，需要架构改动或重大重构',
          meaning: '可能需要临时缓解措施和长期修复计划',
          is_false_positive: false
        },
        {
          answer: '修复困难，涉及第三方依赖或遗留系统',
          meaning: '需要评估替代方案和风险接受',
          is_false_positive: false
        }
      ]
    },

    {
      question: '是否存在可接受的临时缓解措施?',
      rationale: `
在完整修复之前，临时缓解措施可以显著降低风险。
例如: WAF规则可以阻止已知攻击模式，速率限制可以减少暴力破解的影响。
有效的临时缓解措施可以降低修复的紧急程度。
      `,
      possible_answers: [
        {
          answer: '是，可以部署WAF规则立即防护',
          meaning: '风险已临时降低，可以安排计划性修复',
          is_false_positive: false
        },
        {
          answer: '是，可以通过配置变更缓解',
          meaning: '临时措施有效，需要验证覆盖范围',
          is_false_positive: false
        },
        {
          answer: '是，可以限制访问或功能降级',
          meaning: '需要评估业务影响',
          is_false_positive: false
        },
        {
          answer: '否，没有有效的临时缓解措施',
          meaning: '必须通过代码修复才能降低风险',
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
      name: '过度评级-只读操作误报',
      indicators: [
        '漏洞仅影响只读操作(SELECT查询)',
        '无法修改或删除数据',
        '受影响数据已经是公开的',
        '操作不涉及写入或状态变更'
      ],
      verification_steps: [
        '确认数据库操作的权限级别(只读vs读写)',
        '评估可读取数据的敏感程度',
        '检查是否有数据量限制',
        '判断信息泄露的实际影响'
      ],
      related_rules: ['AR-005', 'RR-003']
    },

    {
      name: '过度评级-局部影响误报',
      indicators: [
        '漏洞仅影响单个用户的数据',
        '无法横向移动或影响其他用户',
        '影响范围被严格隔离',
        '不涉及共享资源或全局状态'
      ],
      verification_steps: [
        '确认影响范围是否真的局限',
        '检查是否存在横向移动路径',
        '验证隔离机制的有效性',
        '评估批量利用的可能性'
      ],
      related_rules: ['AR-001', 'AR-003']
    },

    {
      name: '过度评级-低价值目标误报',
      indicators: [
        '受影响的是测试/预发环境',
        '数据是模拟或脱敏数据',
        '功能仅用于开发调试',
        '系统不处理真实业务数据'
      ],
      verification_steps: [
        '确认受影响环境是否处理真实数据',
        '检查环境是否可从外部访问',
        '评估测试数据泄露的实际影响',
        '验证环境配置是否与生产一致'
      ],
      related_rules: ['RR-002', 'RR-005']
    },

    {
      name: '忽略缓解措施的评级误报',
      indicators: [
        '评级未考虑已有的WAF/IPS规则',
        '忽略了数据库权限最小化配置',
        '未考虑加密存储的额外保护',
        '评级基于最坏情况而非实际情况'
      ],
      verification_steps: [
        '列出所有现有的安全控制措施',
        '评估每项控制在漏洞利用路径上的作用',
        '重新计算考虑缓解措施后的风险',
        '与CVSS环境评分进行对比'
      ],
      related_rules: ['RR-001', 'RR-003']
    },

    {
      name: 'CVSS基准评分误用',
      indicators: [
        '直接使用CVSS基准评分而忽略环境因素',
        '未调整攻击复杂度(AV/AC)的环境值',
        '未考虑实际部署的权限要求',
        '未评估受影响资产的实际价值'
      ],
      verification_steps: [
        '使用CVSS环境评分组调整基准分数',
        '根据实际部署调整攻击向量(AV)',
        '根据访问控制调整权限要求(PR)',
        '根据数据敏感性调整影响(I/C/A)'
      ],
      related_rules: ['RR-001', 'RR-003', 'RR-005']
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

export default SeverityCalibrationRule;
