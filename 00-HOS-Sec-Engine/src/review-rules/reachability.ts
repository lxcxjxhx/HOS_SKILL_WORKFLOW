/**
 * RR-002: Reachability Analysis Rule
 * 
 * 功能: 验证被标记的代码路径是否真正可达且可执行
 * 焦点: 通过控制流分析、调用链追踪和条件评估来确认代码执行可能性
 * 
 * 核心问题序列:
 *  1. 该代码路径是否从用户输入可达?
 *  2. 是否存在阻止执行的条件?
 *  3. 函数是否被实际调用?
 *  4. 是否依赖不可满足的前置条件?
 *  5. 是否存在中间过滤或拦截?
 */

import { ReviewRule } from '../schemas/types';

export const ReachabilityRule: ReviewRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'RR-002',
  name: 'Reachability Analysis',
  description: '通过控制流分析和调用链追踪，验证被标记的代码路径是否真正可达且可执行',

  // ============================================================================
  // 关键审核问题
  // ============================================================================

  questions: [
    {
      question: '该代码路径是否从外部用户输入可达?',
      rationale: `
安全漏洞必须能够从攻击者控制的输入源触发。
如果危险代码无法从任何外部输入到达(如内部工具函数未被调用)，则不构成实际威胁。
需要追踪从API入口、HTTP端点、消息队列消费者等外部入口到目标代码的完整路径。
      `,
      possible_answers: [
        {
          answer: '是，可以从公开API/端点直接调用',
          meaning: '代码路径完全可达，风险最高',
          is_false_positive: false
        },
        {
          answer: '是，但需要特定内部服务调用',
          meaning: '可达但受限于服务间通信，需要评估信任边界',
          is_false_positive: false
        },
        {
          answer: '否，没有找到从外部输入到该代码的调用路径',
          meaning: '代码可能不可达，需要进一步验证',
          is_false_positive: true
        },
        {
          answer: '部分可达，仅在特定配置或模式下',
          meaning: '需要验证该配置是否在生产环境启用',
          is_false_positive: false
        }
      ]
    },

    {
      question: '是否存在阻止代码执行的前置条件?',
      rationale: `
危险代码可能被条件语句保护，这些条件在实际运行中永远不会满足。
例如: 需要特定环境变量、配置文件开关、或运行时状态。
如果这些前置条件无法满足，代码实际上是死代码。
      `,
      possible_answers: [
        {
          answer: '是，需要特定环境变量或配置开关',
          meaning: '需要验证生产环境是否启用该配置',
          is_false_positive: true
        },
        {
          answer: '是，需要特定的运行时状态或权限',
          meaning: '需要评估这些状态是否可能被触发',
          is_false_positive: false
        },
        {
          answer: '否，没有特殊前置条件',
          meaning: '代码路径完全可达',
          is_false_positive: false
        },
        {
          answer: '条件复杂，需要深入分析控制流',
          meaning: '需要绘制控制流图确认可达性',
          is_false_positive: false
        }
      ]
    },

    {
      question: '包含漏洞的函数是否被其他代码调用?',
      rationale: `
即使函数本身有漏洞，如果没有被调用或调用链已断开，则不构成风险。
需要通过静态分析查找所有调用点，确认是否存在活跃的调用路径。
注意间接调用(如反射、回调、事件监听器)可能被遗漏。
      `,
      possible_answers: [
        {
          answer: '是，有多个活跃的调用点',
          meaning: '函数被广泛使用，风险高',
          is_false_positive: false
        },
        {
          answer: '是，但调用点本身不可达',
          meaning: '调用链断裂，需要验证调用点可达性',
          is_false_positive: true
        },
        {
          answer: '否，没有找到任何调用点',
          meaning: '可能是死代码或未被使用的库函数',
          is_false_positive: true
        },
        {
          answer: '通过反射/动态方式调用',
          meaning: '需要分析动态调用路径，风险不确定',
          is_false_positive: false
        }
      ]
    },

    {
      question: '代码路径中是否存在中间过滤或拦截器?',
      rationale: `
即使代码路径可达，中间层(如中间件、拦截器、过滤器)可能在数据到达危险代码前进行处理。
例如: Spring Security拦截器、Express中间件、输入验证过滤器。
这些中间层可能已经对输入进行了清理或拒绝。
      `,
      possible_answers: [
        {
          answer: '是，存在输入验证中间件',
          meaning: '输入可能在到达前被清理或拒绝',
          is_false_positive: true
        },
        {
          answer: '是，存在安全过滤器/拦截器',
          meaning: '需要验证过滤器是否覆盖此路径',
          is_false_positive: false
        },
        {
          answer: '否，没有发现中间过滤',
          meaning: '输入直接到达危险代码',
          is_false_positive: false
        },
        {
          answer: '有部分过滤但不完整',
          meaning: '需要评估过滤是否足够防止攻击',
          is_false_positive: false
        }
      ]
    },

    {
      question: '该代码是否仅在异常/错误处理路径中?',
      rationale: `
位于异常处理块中的代码通常只在出错时执行，触发条件更为苛刻。
虽然仍可能构成漏洞，但利用难度显著增加。
需要区分正常的错误处理和可能被利用的异常路径。
      `,
      possible_answers: [
        {
          answer: '是，仅在catch/finally块中',
          meaning: '需要先触发异常才能执行，利用难度高',
          is_false_positive: true
        },
        {
          answer: '是，但在可控制的错误条件中',
          meaning: '如果错误条件可被触发，仍可利用',
          is_false_positive: false
        },
        {
          answer: '否，在正常执行路径中',
          meaning: '正常流程可达，风险高',
          is_false_positive: false
        },
        {
          answer: '部分在错误路径，部分在正常路径',
          meaning: '需要分别评估各路径的可达性',
          is_false_positive: false
        }
      ]
    },

    {
      question: '代码是否依赖已废弃或已移除的功能?',
      rationale: `
标记的漏洞可能存在于已被废弃但尚未删除的代码中。
这些代码可能在生产环境中已被禁用或通过路由移除。
需要确认代码是否仍在活跃使用。
      `,
      possible_answers: [
        {
          answer: '是，功能已被标记为废弃(@Deprecated)',
          meaning: '可能在未来版本移除，当前仍可能执行',
          is_false_positive: false
        },
        {
          answer: '是，路由/端点已从配置中移除',
          meaning: '代码存在但不可达',
          is_false_positive: true
        },
        {
          answer: '否，功能仍在活跃使用',
          meaning: '代码正常执行，风险高',
          is_false_positive: false
        },
        {
          answer: '功能被Feature Flag控制',
          meaning: '需要检查Feature Flag在生产环境的状态',
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
      name: '未调用工具函数误报',
      indicators: [
        '函数定义在utils/helpers/common模块中',
        'grep/代码搜索显示零调用点',
        '函数可能是为未来功能预留',
        '来自第三方库但项目中未使用'
      ],
      verification_steps: [
        '使用IDE的"查找引用"功能确认调用点',
        '检查动态调用(反射、eval、回调注册)',
        '确认是否被测试代码专用',
        '验证函数是否被导出但未使用'
      ],
      related_rules: ['AR-001', 'AR-005', 'AR-009']
    },

    {
      name: 'Feature Flag控制误报',
      indicators: [
        '代码被if(featureEnabled)或类似检查保护',
        '配置文件中有功能开关',
        '环境变量控制功能启用',
        'A/B测试或灰度发布相关代码'
      ],
      verification_steps: [
        '检查生产环境配置中该Feature Flag的状态',
        '确认Flag是否默认为关闭',
        '验证是否有管理界面控制Flag',
        '评估Flag被意外启用的可能性'
      ],
      related_rules: ['AR-001', 'AR-002']
    },

    {
      name: '废弃端点误报',
      indicators: [
        '路由被注释或从路由表中移除',
        '有@Deprecated或@Deprecated标记',
        'API文档中已标注废弃',
        '返回410 Gone或404 Not Found'
      ],
      verification_steps: [
        '确认路由是否真的从配置中移除',
        '检查是否有其他路由指向同一处理函数',
        '验证废弃代码是否仍被某些客户端调用',
        '确认生产环境是否真的不响应此端点'
      ],
      related_rules: ['AR-001', 'AR-003']
    },

    {
      name: '测试/模拟代码误报',
      indicators: [
        '文件路径包含test/mock/stub/fake',
        '在__tests__/tests/spec目录中',
        '函数名包含Mock/Stub/Test',
        '仅在测试依赖中使用的代码'
      ],
      verification_steps: [
        '确认代码是否在测试目录',
        '检查生产构建是否排除测试代码',
        '验证代码是否仅在测试配置中加载',
        '确认测试代码不会被生产环境执行'
      ],
      related_rules: ['AR-001', 'AR-005', 'AR-009']
    },

    {
      name: '条件编译误报',
      indicators: [
        '#ifdef / #if DEBUG 等预处理指令',
        'process.env.NODE_ENV === "development"',
        'BUILD_TYPE或类似编译时条件',
        '平台特定代码(如#ifdef WIN32)'
      ],
      verification_steps: [
        '确认生产构建使用的编译条件',
        '检查条件是否在生产环境中满足',
        '验证代码是否被编译进最终产物',
        '分析不同构建配置的差异'
      ],
      related_rules: ['AR-001']
    }
  ],

  // ============================================================================
  // 适用范围
  // ============================================================================

  applicable_to_rules: [
    'AR-001',  // Taint Analysis
    'AR-002',  // Input Validation
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

export default ReachabilityRule;
