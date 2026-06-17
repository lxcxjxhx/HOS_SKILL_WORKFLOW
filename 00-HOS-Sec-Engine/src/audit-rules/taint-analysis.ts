/**
 * AR-001: Taint Analysis Rule
 * 
 * 功能: 检查用户输入(污染源)到敏感操作(汇聚点)的数据流,识别未经净化的传播路径
 * 焦点: 不是告诉AI"什么是污染传播"
 *      而是定义AI"如何检查数据流"的6步流程
 * 
 * 检查流程:
 *  1. 污染源识别 - 哪些输入是用户可控的
 *  2. 汇聚点识别 - 哪些操作是危险的
 *  3. 数据流追踪 - 污染数据如何传递
 *  4. 净化点检查 - 是否存在安全处理
 *  5. 传播路径验证 - 污染是否到达汇聚点
 *  6. 上下文分析 - 是否存在间接防护
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const TaintAnalysisRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-001',
  name: 'Taint Analysis',
  description: '追踪用户输入到敏感操作的数据流,识别未经净化的污染传播路径',
  detail: `
本规则的目的是系统化地追踪污染数据从输入源到敏感操作的完整传播路径。

核心理念:
- 不是问"这段代码有漏洞吗"
- 而是问"污染数据是否未经净化到达了危险操作"

关键问题序列:
1. 污染源是什么? (用户输入、外部数据、环境变量?)
2. 汇聚点是什么? (数据库查询、命令执行、文件操作?)
3. 污染数据如何在函数/变量间传递?
4. 传递过程中是否有净化处理?
5. 污染数据是否最终到达了汇聚点?
6. 是否存在间接防护措施?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'request.getParameter() / req.body / request.args',
      '文件读取后用于敏感操作: readFile() -> exec()',
      '环境变量读取: process.env / System.getenv()',
      '外部API响应: fetch() -> database.query()',
      'URL参数传播: ctx.query / req.query / request.query',
      '用户输入存储后取出使用: DB.get() -> exec()'
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
      'Spring',
      'Express',
      'Django',
      'Flask',
      'FastAPI',
      'Laravel',
      'ASP.NET'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '污染源识别',
      condition: '识别代码中所有用户可控或外部来源的数据入口',
      questions: [
        '代码中有哪些数据来源?',
        '哪些数据直接或间接来自用户输入?',
        '是否存在外部API调用返回的数据?',
        '环境变量是否被用户可控?',
        '文件内容是否来自用户上传?'
      ],
      failureIndicators: [
        'request.getParameter() / req.body / req.query',
        '文件上传处理: multipart/form-data',
        '外部HTTP请求响应: fetch() / axios()',
        '环境变量: process.env / os.environ',
        '数据库查询结果包含用户输入',
        'Redis/Cache中存储的用户数据'
      ],
      successIndicators: [
        '数据来源均为硬编码常量',
        '数据来自内部系统生成且已验证',
        '数据来自只读配置文件'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '汇聚点识别',
      condition: '识别代码中所有可能因恶意输入导致危害的敏感操作',
      questions: [
        '代码中有哪些敏感操作?',
        '这些操作是否接受动态参数?',
        '如果参数被恶意控制会产生什么后果?',
        '是否涉及数据库、文件系统、网络、命令执行?'
      ],
      failureIndicators: [
        '数据库查询: executeQuery() / .query()',
        '命令执行: exec() / system() / Runtime.exec()',
        '文件操作: readFile() / writeFile() / include()',
        'HTTP请求: fetch() / http.get()',
        'XML解析: parse() / XMLDocument()',
        '序列化/反序列化: unserialize() / pickle.load()'
      ],
      successIndicators: [
        '敏感操作的参数全部为硬编码',
        '操作不涉及外部系统交互',
        '操作有严格的权限控制'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '数据流追踪',
      condition: '追踪污染数据从源到汇聚点的完整传递路径',
      questions: [
        '污染数据经过了多少层函数调用?',
        '数据是否通过参数、返回值、全局变量传播?',
        '是否存在数据格式转换?',
        '数据在传递过程中是否被拆分或重组?',
        '数据是否跨越了安全边界(如从前端到后端)?'
      ],
      failureIndicators: [
        '污染数据通过多层函数传递未净化',
        '用户输入直接赋值给变量后用于敏感操作',
        '数据通过全局变量/共享状态传播',
        '数据通过对象属性链式传播: obj.input.method()'
      ],
      successIndicators: [
        '数据传递路径短(1-2层调用)',
        '数据在传递中被类型转换或验证',
        '数据传播路径清晰可追踪'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '净化点检查',
      condition: '检查数据流路径中是否存在安全净化处理',
      questions: [
        '污染数据在到达汇聚点前是否被净化?',
        '净化方法是否适用于当前攻击类型?',
        '净化是在哪个层级执行的(输入层/业务层/输出层)?',
        '净化逻辑是否可以被绕过?',
        '是否存在多层净化?',
        '净化是否使用了安全库而非自定义实现?'
      ],
      failureIndicators: [
        '无任何净化处理',
        '仅有简单的字符串替换(易被绕过)',
        '客户端验证(可被绕过)',
        '自定义净化逻辑(不可靠)',
        '净化在错误的位置(如仅在日志中)'
      ],
      successIndicators: [
        '使用了框架/库提供的净化方法',
        '多层防护(输入验证+输出编码)',
        '净化逻辑经过安全审计',
        '白名单验证而非黑名单'
      ],
      criticality: 'must-have'
    },

    {
      order: 5,
      name: '传播路径验证',
      condition: '验证污染数据是否确实能够通过完整路径到达汇聚点',
      questions: [
        '从污染源到汇聚点的路径是否完整可达?',
        '路径中是否存在条件分支可能中断传播?',
        '是否存在类型不兼容导致传播中断?',
        '异常处理是否会阻止传播?',
        '是否需要特定条件才能触发完整路径?'
      ],
      failureIndicators: [
        '污染源到汇聚点路径完整无阻断',
        '所有条件分支均可被用户输入控制',
        '无类型检查或转换',
        '异常处理不阻止数据传播'
      ],
      successIndicators: [
        '路径中存在不可绕过的条件检查',
        '类型不匹配导致传播中断',
        '需要特殊权限才能到达汇聚点',
        '代码为死代码或已被废弃'
      ],
      criticality: 'important'
    },

    {
      order: 6,
      name: '上下文分析',
      condition: '分析代码执行上下文是否存在间接防护措施',
      questions: [
        '代码是否在受控环境中执行(如沙箱)?',
        '是否存在访问控制或权限检查?',
        '运行时是否有安全策略(如CSP、WAF)?',
        '是否有审计日志记录异常行为?',
        '系统是否部署了运行时保护(如RASP)?'
      ],
      failureIndicators: [
        '代码在普通用户权限下执行',
        '无访问控制检查',
        '无运行时安全策略',
        '无审计日志'
      ],
      successIndicators: [
        '代码在沙箱环境中执行',
        '有严格的访问控制层',
        '部署了WAF或RASP',
        '有完整的审计日志'
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
      description: '污染源和汇聚点的代码位置及上下文',
      example: `
污染源:
  文件: src/controllers/userController.js
  行号: 15
  代码: const username = req.body.username;

汇聚点:
  文件: src/services/dbService.js
  行号: 42
  代码: db.query(\`SELECT * FROM users WHERE name = '\${username}'\`);
      `,
      collection_guidance: '分别标注污染源和汇聚点的文件路径，提供精确行号，包括前后代码上下文，高亮污染数据使用位置'
    },

    {
      type: EvidenceType.DataFlow,
      required: true,
      description: '从污染源到汇聚点的完整数据流路径',
      example: `
数据流路径:
  1. 输入源: req.body.username
     位置: userController.js:15
  
  2. 参数传递: processUser(username)
     位置: userController.js:18
  
  3. 内部传递: findUser(name)
     位置: userService.js:30
  
  4. 汇聚点: db.query() 使用 name 参数
     位置: dbService.js:42
  
结论: 用户输入未经净化直接到达数据库查询
      `,
      collection_guidance: '追踪每个函数调用和参数传递，记录每一步的文件和行号，标记每步是否有净化处理，绘制完整的数据流路径'
    },

    {
      type: EvidenceType.Configuration,
      required: false,
      description: '相关安全配置,如框架中间件、安全策略等',
      example: 'Express中间件配置 / Spring Security配置 / 输入验证库配置',
      collection_guidance: '检查是否配置了全局输入验证中间件，检查框架安全配置，检查是否存在全局净化策略'
    },

    {
      type: EvidenceType.Runtime,
      required: false,
      description: '运行时行为观察,验证数据流是否实际触发',
      example: '请求日志、数据库查询日志、执行追踪',
      collection_guidance: '发送测试请求观察数据流，检查日志确认路径可达，验证汇聚点是否实际执行'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '在输入边界实施严格验证',
      code: `
// Java - 输入验证
@Valid
public class UserInput {
  @NotBlank @Size(max = 50)
  private String username;
}

// Node.js - 输入验证中间件
const validateInput = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  next();
};

// Python - Pydantic验证
class UserInput(BaseModel):
  username: str = Field(..., min_length=1, max_length=50)
      `,
      description: '在数据进入系统的入口处实施严格的类型和格式验证,阻止非法输入进入系统。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '在汇聚点前实施净化处理',
      code: `
// Java - 输出编码
String safe = HtmlUtils.htmlEscape(userInput);

// Node.js - DOMPurify
const sanitized = DOMPurify.sanitize(userInput);

// Python - bleach
import bleach
safe = bleach.clean(userInput)
      `,
      description: '在数据到达敏感操作前,使用安全库进行上下文相关的编码或净化。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.Medium,
      action: '实施纵深防御策略',
      code: `
// 多层防护示例:
// 1. 输入验证 (类型、格式、长度)
// 2. 业务逻辑验证 (权限、业务规则)
// 3. 输出净化 (编码、转义)
// 4. 框架级防护 (参数化查询、CSP)

// Node.js - 多层中间件
app.use(helmet());           // 安全header
app.use(express.json());     // 请求体解析
app.use(rateLimit());        // 速率限制
app.use(validateInput());    // 输入验证
      `,
      description: '不依赖单一防护点,在输入、处理、输出多个层级实施防护。',
      difficulty: 'Medium'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-20', 'CWE-74', 'CWE-79'],  // Improper Input Validation, Improper Neutralization, XSS
  owasp_categories: [
    'A03:2021 - Injection',
    'A01:2021 - Broken Access Control'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default TaintAnalysisRule;
