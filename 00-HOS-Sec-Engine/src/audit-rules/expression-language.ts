/**
 * AR-010: Expression Language Injection Check Rule
 * 
 * 功能: 检查表达式语言(EL/SpEL/OGNL)的使用,识别表达式注入风险
 * 焦点: 不是告诉AI"什么是表达式注入"
 *      而是定义AI"如何检查表达式执行"的6步流程
 * 
 * 检查流程:
 *  1. 表达式引擎识别
 *  2. 表达式来源追踪
 *  3. 表达式构造分析
 *  4. 执行上下文检查
 *  5. 沙箱与限制验证
 *  6. 模板引擎安全检查
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const ExpressionLanguageRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-010',
  name: 'Expression Language Injection Check',
  description: '检查表达式语言(EL/SpEL/OGNL/MVEL)的使用,识别表达式注入风险',
  detail: `
本规则的目的是系统化地检查代码中表达式语言的执行是否存在注入风险。

核心理念:
- 不是问"这是表达式注入吗"
- 而是问"表达式是否由用户可控数据构造、执行上下文是否受限"

关键问题序列:
1. 代码中使用了哪些表达式引擎?
2. 表达式字符串来自何处?
3. 表达式是如何构造的(拼接、模板)?
4. 表达式执行时有哪些可用的类和方法?
5. 是否有沙箱或表达式限制?
6. 模板引擎的自动转义是否启用?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'Java SpEL: ExpressionParser.parseExpression() / SpelExpressionParser',
      'Java OGNL: Ognl.parseExpression() / Ognl.getValue()',
      'Java EL: ELProcessor.eval() / ExpressionFactory',
      'Spring: @Value("#{}") / #{...}',
      '模板引擎: Thymeleaf / FreeMarker / Velocity',
      'JavaScript: eval() / new Function() / setTimeout(string)',
      'Python: eval() / exec() / template.render()',
      '.NET: Eval() / DataTable.Compute() / NVelocity'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP
    ],
    frameworks: [
      'Spring',
      'Struts2',
      'Thymeleaf',
      'FreeMarker',
      'Velocity',
      'EJS',
      'Pug',
      'Jinja2',
      'ASP.NET Razor'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '表达式引擎识别',
      condition: '识别代码中使用的所有表达式引擎和动态代码执行API',
      questions: [
        '代码中使用了哪些表达式引擎?',
        '是否有动态代码执行(eval、new Function)?',
        '模板引擎是否支持表达式执行?',
        '是否有自定义表达式解析器?',
        '框架是否隐式支持表达式(如Spring @Value)?'
      ],
      failureIndicators: [
        'eval(userInput) / new Function(userInput)',
        'SpelExpressionParser.parseExpression(userInput)',
        'Ognl.parseExpression(userInput)',
        'TemplateEngine.process(userTemplate, context)',
        'DataTable.Compute(userExpression)',
        'Jinja2 template.from_string(userTemplate)',
        'FreeMarker Template(userTemplate)'
      ],
      successIndicators: [
        '表达式仅来自硬编码或配置',
        '使用了安全的表达式沙箱',
        '模板引擎仅用于渲染,不执行表达式'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '表达式来源追踪',
      condition: '追踪表达式字符串的来源是否可控',
      questions: [
        '表达式字符串来自哪里?',
        '是否来自用户输入(HTTP参数、请求体)?',
        '是否来自数据库存储(可能被注入)?',
        '是否来自配置文件(是否可被用户修改)?',
        '是否来自URL路径或Header?'
      ],
      failureIndicators: [
        '表达式来自请求参数: parser.parseExpression(req.query.filter)',
        '表达式来自请求体: parseExpression(req.body.expression)',
        '表达式来自数据库: parseExpression(row.expression)',
        '表达式来自Cookie/Header',
        '表达式拼接: parseExpression("user.name == " + userInput)'
      ],
      successIndicators: [
        '表达式来自硬编码',
        '表达式来自只读配置文件',
        '表达式由系统在安全上下文中生成'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '表达式构造分析',
      condition: '分析表达式是如何构造的,是否包含用户可控的拼接',
      questions: [
        '表达式是否通过字符串拼接构造?',
        '拼接部分是否来自用户输入?',
        '是否使用了模板构造表达式?',
        '表达式参数是否被正确转义?',
        '是否存在注入向量(引号绕过、编码绕过)?'
      ],
      failureIndicators: [
        '拼接构造: "T(java.lang.Runtime).getRuntime().exec(cmd)"',
        '模板注入: #{userInput}',
        "引号未转义: \"'\" + userInput + \"'\"",
        '表达式注入点: parser.parseExpression(filter + " && " + sort)',
        'EL表达式拼接: "${" + userInput + "}"'
      ],
      successIndicators: [
        '表达式使用参数化构造',
        '拼接部分经过严格验证',
        '使用预编译的表达式模板'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '执行上下文检查',
      condition: '检查表达式执行时可用的类、方法和变量范围',
      questions: [
        '表达式执行时可以访问哪些类和包?',
        '是否可以访问java.lang.Runtime或其他危险类?',
        '是否有可用的文件I/O、网络操作类?',
        'Root对象是否包含敏感数据?',
        '是否可以通过反射访问任意类?'
      ],
      failureIndicators: [
        '可访问T(java.lang.Runtime)',
        '可访问T(java.lang.ProcessBuilder)',
        '可访问new java.io.File()',
        '可通过反射调用任意方法',
        'Root对象包含数据库连接或系统信息',
        '无类型限制,可访问任何public类和方法'
      ],
      successIndicators: [
        '限制了可访问的类和包',
        '禁止反射和类加载',
        'Root对象仅包含必要数据',
        '使用自定义TypeLocator限制类访问'
      ],
      criticality: 'must-have'
    },

    {
      order: 5,
      name: '沙箱与限制验证',
      condition: '检查是否实施了表达式执行的沙箱或限制措施',
      questions: [
        '是否配置了表达式沙箱?',
        '是否限制了可执行的表达式类型?',
        '是否有超时限制(防止DoS)?',
        '是否限制了表达式复杂度?',
        '是否有黑名单或白名单机制?'
      ],
      failureIndicators: [
        '无沙箱配置',
        '无表达式类型限制',
        '无超时或递归深度限制',
        '黑名单过滤(不完整)',
        '可执行系统命令或创建进程',
        '可读写文件系统'
      ],
      successIndicators: [
        '配置了SpEL沙箱(SimpleEvaluationContext)',
        '仅允许属性访问和基本运算',
        '有超时和复杂度限制',
        '严格白名单限制可用类',
        '禁止反射和方法调用'
      ],
      criticality: 'must-have'
    },

    {
      order: 6,
      name: '模板引擎安全检查',
      condition: '检查模板引擎的配置和使用是否安全',
      questions: [
        '模板是否来自用户可控来源?',
        '自动转义(autoescape)是否启用?',
        '模板引擎是否允许执行代码?',
        '是否禁用了不安全的标签/函数?',
        '模板继承和包含是否受限?'
      ],
      failureIndicators: [
        '用户可上传或指定模板文件',
        'Jinja2 autoescape=False',
        'FreeMarker ObjectWrapper暴露所有Java方法',
        'Thymeleaf允许执行表达式',
        '模板中包含include/import危险标签',
        'SSTI(Server-Side Template Injection)向量: {{7*7}}'
      ],
      successIndicators: [
        '模板仅来自安全目录',
        '自动转义默认启用',
        '禁用了模板中的代码执行',
        '使用了SandboxedEnvironment(Jinja2)',
        '模板继承和包含有白名单限制'
      ],
      criticality: 'important'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '表达式解析和执行的代码位置及上下文',
      example: `
表达式注入:
  文件: src/main/java/com/app/FilterService.java
  行号: 30
  代码:
    ExpressionParser parser = new SpelExpressionParser();
    Expression exp = parser.parseExpression(req.getQuery("filter"));
    // <- 用户输入的表达式直接解析执行
    Object result = exp.getValue(context);

  eval注入:
  文件: src/utils/calculator.js
  行号: 5
  代码:
    function calculate(expression) {
      return eval(expression);  // <- 用户输入直接eval
    }
      `,
      collection_guidance: `标注表达式解析/执行调用的文件路径和行号，展示表达式来源和构造方式，高亮不安全的用法，包括上下文对象配置代码。`
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: '表达式引擎配置、模板引擎设置、沙箱配置',
      example: `
SpEL配置:
  文件: src/main/java/com/app/config/ExpressionConfig.java
  代码:
    // 不安全 - 使用StandardEvaluationContext
    EvaluationContext context = new StandardEvaluationContext();
    // 应使用 - SimpleEvaluationContext
    EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

Jinja2配置:
  文件: app.py
  代码:
    # 不安全
    env = Environment(loader=FileSystemLoader('templates'), autoescape=False)
    # 安全
    env = SandboxedEnvironment(loader=FileSystemLoader('templates'), autoescape=True)
      `,
      collection_guidance: `检查表达式引擎配置，检查模板引擎安全设置，检查沙箱和限制配置。`
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: '从用户输入到表达式执行的完整数据流',
      example: `
数据流:
  1. 输入: GET /api/data?filter=T(java.lang.Runtime).getRuntime().exec('id')
  2. 传递: req.getQuery("filter")
  3. 解析: parser.parseExpression(userFilter)
  4. 执行: exp.getValue(context)  <- 执行任意Java代码
  
  问题: 表达式全程无验证,StandardEvaluationContext允许任意类访问
      `,
      collection_guidance: `追踪表达式从入口到执行的完整路径，标记路径中的每个处理步骤，记录上下文对象配置。`
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '使用SimpleEvaluationContext替代StandardEvaluationContext (Java)',
      code: `
// Java Spring - 安全的SpEL使用
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.expression.spel.standard.SpelExpressionParser;

// 不安全:
EvaluationContext context = new StandardEvaluationContext();
// 允许访问所有类和方法,包括Runtime

// 安全 - 仅允许数据绑定和属性访问:
EvaluationContext context = SimpleEvaluationContext
    .forReadOnlyDataBinding()
    .build();

ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("user.name");
Object result = exp.getValue(context, user);

// 如果需要方法调用,仅限白名单:
EvaluationContext context = SimpleEvaluationContext
    .forDataBinding()
    .withMethodResolvers(List.of(safeMethodResolver))
    .build();
      `,
      description: 'SimpleEvaluationContext仅支持SpEL子集(属性访问、基本运算),禁止类型引用(T(...))和方法调用,从根本上防止RCE。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '避免eval,使用安全的替代方案',
      code: `
// Node.js - 安全的表达式计算
// 不安全:
eval(userExpression);

// 安全替代 - 使用mathjs进行数学计算:
import { evaluate } from 'mathjs';
const result = evaluate(expression, scope);

// 安全的JSON解析:
// 不安全: eval('(' + jsonStr + ')')
const obj = JSON.parse(jsonStr);

// 函数动态调用替代eval:
// 不安全: eval(fnName + '(' + args + ')')
// 安全:
const functions = { add: (a, b) => a + b, multiply: (a, b) => a * b };
if (functions[fnName]) {
  return functions[fnName](...args);
}

// Python - 安全的替代方案
# 不安全: eval(user_input)

# 安全 - ast.literal_eval (仅支持字面值):
import ast
result = ast.literal_eval(user_input)

# 安全 - numexpr (数学表达式):
import numexpr
result = numexpr.evaluate(expression)
      `,
      description: '永远不要对不可信输入使用eval。使用专用的解析库或白名单映射。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '模板引擎安全配置',
      code: `
// Python Jinja2 - 沙箱环境
from jinja2 import Environment, FileSystemLoader, SandboxedEnvironment

# 安全配置
env = SandboxedEnvironment(
    loader=FileSystemLoader('templates'),
    autoescape=True,  # 默认转义
    undefined=StrictUndefined  # 未定义变量报错
)

# 禁止不安全的过滤器和函数
env.globals = {}  # 清除全局变量
env.filters = {'safe': lambda x: x}  # 仅保留必要过滤器

// Java Thymeleaf - 安全配置
TemplateEngine templateEngine = new TemplateEngine();
templateEngine.setTemplateResolver(templateResolver);
// Thymeleaf默认不执行SpEL,但需确保不启用SpEL方言

// Node.js EJS - 安全配置
// 不使用 <% %> 执行代码,仅使用 <%= %> 输出
// 或使用 Pug 等不支持代码执行的模板引擎
      `,
      description: '使用沙箱模板引擎,启用自动转义,限制可用的全局变量和过滤器。',
      difficulty: 'Medium'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-94', 'CWE-917'],  // Improper Control of Generation of Code, Improper Neutralization of Special Elements used in an Expression Language Statement
  owasp_categories: [
    'A03:2021 - Injection',
    'A01:2017 - Injection'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default ExpressionLanguageRule;
