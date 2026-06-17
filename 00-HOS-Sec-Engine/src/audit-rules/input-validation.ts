/**
 * AR-002: Input Validation Rule
 * 
 * 功能: 检查用户输入验证机制的完整性和有效性
 * 焦点: 不是告诉AI"什么是输入验证"
 *      而是定义AI"如何检查输入验证"的6步流程
 * 
 * 检查流程:
 *  1. 输入入口识别
 *  2. 验证机制检查
 *  3. 验证完整性分析
 *  4. 验证绕过检测
 *  5. 错误处理审查
 *  6. 默认值与边界检查
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const InputValidationRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-002',
  name: 'Input Validation',
  description: '检查用户输入验证机制,识别验证缺失、不完整或可被绕过的情况',
  detail: `
本规则的目的是系统化地检查代码中对用户输入的验证是否充分。

核心理念:
- 不是问"输入验证做得好不好"
- 而是问"每个输入入口是否有验证、验证是否完整、是否可被绕过"

关键问题序列:
1. 代码中有哪些输入入口? (HTTP参数、文件上传、Header、Cookie?)
2. 每个入口是否有验证逻辑?
3. 验证覆盖了哪些维度? (类型、长度、格式、范围?)
4. 验证逻辑是否可以被绕过? (编码绕过、截断绕过、竞态条件?)
5. 验证失败时的错误处理是否安全?
6. 未提供输入时是否有安全的默认值?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'HTTP参数读取: req.body / request.getParameter() / $_POST',
      'URL参数: req.query / request.args / $_GET',
      '文件上传: multer / MultipartFile / $_FILES',
      'Header读取: req.headers / request.getHeader()',
      'Cookie读取: req.cookies / request.getCookie()',
      '路径参数: req.params / @PathVariable',
      'GraphQL查询: args / variables'
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
      'ASP.NET',
      'Fastify'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '输入入口识别',
      condition: '识别代码中所有接收用户或外部数据的入口点',
      questions: [
        '代码定义了哪些API端点或接收外部数据的接口?',
        '每个端点接收哪些参数(路径、查询、请求体、Header、Cookie)?',
        '是否有文件上传功能?',
        '是否有批量/数组输入处理?',
        '是否有WebSocket或实时通信输入?'
      ],
      failureIndicators: [
        '存在接收用户输入但无验证的端点',
        '请求体直接解构使用: const { name, email } = req.body',
        '文件上传无类型/大小限制',
        '数组输入无长度限制',
        '通配符路由: app.get("/*", handler)'
      ],
      successIndicators: [
        '每个输入点都有明确的验证逻辑',
        '使用了DTO/Schema定义输入结构',
        '文件上传有严格的类型和大小限制'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '验证机制检查',
      condition: '检查每个输入入口使用的验证方法和验证库',
      questions: [
        '输入是否经过验证?',
        '使用了什么验证方法(框架内置、第三方库、自定义)?',
        '验证是在哪个层级执行的(路由层、控制器层、服务层)?',
        '验证规则是否定义了类型约束?',
        '是否使用了类型安全的验证库(如Joi、Zod、Pydantic)?'
      ],
      failureIndicators: [
        '无验证: 直接使用req.body.xxx',
        '自定义验证: if (input.length > 0) 简单检查',
        '仅在客户端验证',
        '验证在业务逻辑之后执行',
        '使用eval()或动态代码处理输入'
      ],
      successIndicators: [
        '使用成熟的验证库(Joi/Zod/Yup/Pydantic)',
        '框架级验证(@Valid / dataclass / DTO)',
        '验证在路由/控制器层拦截',
        '有类型安全保证'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '验证完整性分析',
      condition: '分析验证规则是否覆盖了所有必要的安全维度',
      questions: [
        '验证是否检查了数据类型?',
        '验证是否检查了长度/范围限制?',
        '验证是否检查了格式/模式(如email、URL)?',
        '验证是否检查了特殊字符?',
        '验证是否处理了空值/null/undefined?',
        '对于文件输入,是否检查了MIME类型和扩展名?'
      ],
      failureIndicators: [
        '仅检查类型不检查长度',
        '仅检查长度不检查内容',
        '未处理null/undefined情况',
        '文件上传仅检查扩展名不检查MIME类型',
        '数组输入无最大长度限制',
        '数字输入无范围限制'
      ],
      successIndicators: [
        '验证覆盖类型、长度、格式、范围',
        '对每个字段有明确的安全约束',
        '文件上传检查MIME类型、扩展名、大小',
        '数组/集合有最大长度限制'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '验证绕过检测',
      condition: '检查验证逻辑是否存在可被攻击者绕过的缺陷',
      questions: [
        '验证是否区分了不同的字符编码(UTF-8、UTF-16)?',
        '是否存在URL编码绕过可能?',
        '是否存在双重编码绕过?',
        '验证是否在截断前执行(如null字节截断)?',
        '是否存在类型转换绕过(如"1abc"转为数字1)?',
        '数组输入是否可以绕过单个元素的验证?'
      ],
      failureIndicators: [
        '验证前未规范化编码',
        '字符串验证后直接转换类型',
        '文件名验证不处理null字节',
        'JSON解析后类型自动转换',
        '验证在数据解码前执行',
        '批量验证中存在部分失败仍继续处理'
      ],
      successIndicators: [
        '验证前先规范化输入(解码、统一编码)',
        '严格的类型检查拒绝隐式转换',
        '文件名安全检查处理了所有截断向量',
        '验证在任何数据处理之前执行'
      ],
      criticality: 'important'
    },

    {
      order: 5,
      name: '错误处理审查',
      condition: '检查验证失败时的错误处理是否安全',
      questions: [
        '验证失败时返回什么错误信息?',
        '错误信息是否泄露了内部实现细节?',
        '验证失败是否记录了安全日志?',
        '是否存在验证失败后仍继续执行的情况?',
        '错误响应是否包含堆栈跟踪?'
      ],
      failureIndicators: [
        '错误信息暴露数据库结构: "column xxx not found"',
        '返回完整堆栈跟踪',
        '验证失败后日志中记录了敏感输入',
        '验证异常被捕获但未阻止请求继续',
        '错误响应包含内部路径信息'
      ],
      successIndicators: [
        '通用错误信息: "Invalid input"',
        '验证失败立即中断请求处理',
        '安全日志记录不包含敏感数据',
        '统一错误处理中间件'
      ],
      criticality: 'important'
    },

    {
      order: 6,
      name: '默认值与边界检查',
      condition: '检查输入未提供或为边界值时的处理逻辑',
      questions: [
        '当必需参数缺失时,是否有默认值?',
        '默认值是否安全?',
        '边界值(空字符串、0、null、undefined)是否被正确处理?',
        '超大输入是否会导致拒绝服务?',
        '嵌套对象深度是否有限制?'
      ],
      failureIndicators: [
        '缺失参数使用空字符串作为默认值',
        '数字输入未处理NaN/Infinity',
        '无输入大小限制(可被DoS攻击)',
        '嵌套JSON无深度限制',
        '递归处理无终止条件'
      ],
      successIndicators: [
        '必需参数缺失时返回明确错误',
        '默认值为安全的最小权限值',
        '有输入大小和复杂度限制',
        '边界值有专门处理逻辑'
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
      description: '输入入口和验证逻辑的代码位置及上下文',
      example: `
输入入口(无验证):
  文件: src/controllers/userController.ts
  行号: 20-25
  代码:
    app.post('/api/users', (req, res) => {
      const { email, name } = req.body;  // <- 无验证直接使用
      userService.create({ email, name });
    });
      `,
      collection_guidance: '标注输入入口的文件路径和行号，展示完整的处理逻辑上下文，标注验证逻辑缺失或不足的位置，高亮直接使用的用户输入'
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: '验证库配置、框架验证设置、中间件配置',
      example: `
验证配置:
  文件: src/config/validation.ts
  内容:
    export const userSchema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(1).max(100).required()
    });
      `,
      collection_guidance: '检查是否存在全局验证中间件，检查验证schema定义，检查验证错误处理配置'
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: '输入数据从入口到使用的传播路径',
      example: `
数据流:
  1. 入口: req.body.email
  2. 传递给: userService.create({ email })
  3. 使用于: db.query(\`INSERT INTO users ...\`)
  结论: email未经格式验证直接进入数据库
      `,
      collection_guidance: '追踪输入参数的完整传递路径，标记路径中每个验证点，记录是否有数据变换'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '使用类型安全的验证库实施输入验证',
      code: `
// Node.js - Zod验证
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\\s-]+$/),
  age: z.number().int().min(0).max(150)
});

// 在路由中使用
app.post('/api/users', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // 使用验证后的数据 result.data
});

// Java - Bean Validation
public class UserDTO {
  @Email @NotBlank @Size(max = 255)
  private String email;
  
  @NotBlank @Size(max = 100) @Pattern(regexp = "^[a-zA-Z0-9\\\\s-]+$")
  private String name;
  
  @Min(0) @Max(150)
  private Integer age;
}
      `,
      description: '使用成熟的验证库在输入入口处实施严格验证,确保所有输入都符合预期格式。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '实施全局输入验证中间件',
      code: `
// Express - 全局验证中间件
const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

app.post('/api/users', validationMiddleware(userSchema), handler);
      `,
      description: '在路由层统一实施验证中间件,避免每个handler重复编写验证逻辑。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '输入规范化处理',
      code: `
// 输入规范化函数
const normalizeInput = (input) => {
  return input
    .trim()                                    // 去除首尾空白
    .normalize('NFC')                          // Unicode规范化
    .replace(/\\0/g, '')                       // 移除null字节
    .substring(0, 10000);                      // 限制最大长度
};

// 在验证前规范化
app.post('/api/users', (req, res) => {
  req.body = normalizeInput(req.body);
  // 然后执行验证...
});
      `,
      description: '在验证前对输入进行规范化处理,防止编码绕过和特殊字符攻击。',
      difficulty: 'Medium'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-20', 'CWE-1395'],  // Improper Input Validation, Dependency on Vulnerable Component
  owasp_categories: [
    'A03:2021 - Injection',
    'A04:2021 - Insecure Design'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default InputValidationRule;
