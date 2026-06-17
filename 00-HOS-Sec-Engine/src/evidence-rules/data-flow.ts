/**
 * ER-002: Data Flow Evidence Standard
 * 
 * 功能: 规范数据流追踪证据的采集和呈现
 * 焦点: 追踪参数从来源(source)到汇聚点(sink)的完整流转路径
 * 
 * 核心原则:
 *  1. 每个步骤都要有文件位置和代码片段
 *  2. 记录参数在每一步是否被修改或验证
 *  3. 明确标注污染源(taint)和净化点(sanitize)
 *  4. 区分"追踪到的"和"推测的"流转
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const DataFlowEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-002',
  type: EvidenceType.DataFlow,
  name: 'Data Flow Evidence Standard',
  description: '规范数据流追踪证据的采集，确保参数从source到sink的每一步都有据可查',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'source_location',         // 数据来源位置(文件+行号+代码)
    'sink_location',           // 危险操作位置(文件+行号+代码)
    'flow_steps',              // 流转步骤数组(每步含位置、操作、是否修改)
    'parameter_name',          // 被追踪的参数名称
    'validation_points',       // 路径上所有验证/净化点的位置和方式
    'taint_status',            // 参数在各步骤的污染状态(tainted/cleaned/unknown)
    'conclusion'               // 数据流是否构成完整攻击路径
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'source_type',             // 来源类型(user_input/database/file/config/external_api)
    'data_type',               // 数据类型(string/int/object/file等)
    'sanitization_functions',  // 经过的净化函数列表
    'transformation_steps',    // 数据转换步骤(编码、拼接、格式化等)
    'conditional_paths',       // 条件分支(哪些条件下数据流会/不会到达sink)
    'call_graph',              // 完整的调用图
    'framework_interceptors'   // 框架拦截器/中间件对数据的影响
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== XSS Data Flow Evidence (Good Example) ===

Parameter Tracked: userInput (search query)

Source:
  File: src/controllers/SearchController.js
  Line: 15
  Code: const userInput = req.query.q;
  Source Type: User Input (HTTP GET parameter)
  Taint Status: TAINTED ✓

Flow Steps:
  Step 1 → Step 2 → Step 3 → Sink
  
  Step 1: Parameter Extraction
    File: src/controllers/SearchController.js
    Line: 15
    Code: const userInput = req.query.q;
    Operation: Extract query parameter
    Modification: None (raw input)
    Taint Status: TAINTED

  Step 2: Service Layer Call
    File: src/controllers/SearchController.js
    Line: 18
    Code: const results = searchService.process(userInput);
    Operation: Pass to service layer
    Modification: None (pass-through)
    Taint Status: TAINTED

  Step 3: Template Construction
    File: src/services/SearchService.js
    Line: 42
    Code: const html = '<div class="result">' + processedInput + '</div>';
    Operation: String concatenation into HTML
    Modification: processedInput (lowercase conversion only, no sanitization)
    Taint Status: TAINTED ✓

Validation Points:
  ❌ No XSS sanitization between Step 1 and Sink
  ❌ No HTML encoding applied
  ❌ No Content Security Policy header detected
  Note: toLowerCase() at Line 38 does NOT prevent XSS

Sink:
  File: src/services/SearchService.js
  Line: 42
  Code: const html = '<div class="result">' + processedInput + '</div>';
  Dangerous Operation: Direct insertion of user input into HTML context
  Taint Status: TAINTED (reaches sink without sanitization)

Conclusion:
  Complete attack path confirmed: user input → no validation → HTML injection point
  The parameter userInput flows from HTTP request query parameter to HTML output
  without any XSS sanitization. Only toLowerCase() is applied which does not prevent XSS.
  
  Attack Vector: GET /search?q=<script>alert(1)</script>
  Risk: HIGH - Stored/Reflected XSS confirmed
  Confidence: HIGH - Complete data flow traced with code evidence
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== XSS Data Flow Evidence (Bad Example) ✗ ===

Bad #1 - Incomplete Flow:
  "User input goes to HTML output, causing XSS"
  ❌ 没有记录中间经过的步骤和文件位置

Bad #2 - Missing Validation Analysis:
  "No sanitization found"
  ❌ 没有检查所有可能的净化点，可能遗漏了框架层面的防护

Bad #3 - Assumed Flow:
  "The search parameter is passed to the template"
  ❌ 没有追踪实际的参数传递路径，属于推测

Bad #4 - No Sink Context:
  "innerHTML is set with user data"
  ❌ 没有说明HTML上下文(是attribute? text? script?)，不同类型的sink风险不同

Bad #5 - Ignoring Transformations:
  "User input goes directly to output"
  ❌ 如果中间有encodeURIComponent()或escapeHtml()，则可能不是漏洞

Bad #6 - No Conditional Analysis:
  "Always vulnerable"
  ❌ 可能存在条件分支(如: 只在特定条件下到达sink)，需要分析
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 确定数据来源(Source)
  - 识别参数入口: HTTP参数、文件读取、数据库查询、API响应等
  - 记录: 文件路径 + 行号 + 具体的接收代码
  - 标注来源类型: user_input / database / file / config / external_api
  - 初始污染状态: TAINTED (对于用户输入)
    `,

    `
步骤2: 逐层追踪参数传递
  - 跟随参数: 每个函数调用都要追踪
  - 记录每一步: 文件位置 + 操作类型 + 参数是否被修改
  - 注意别名: 参数可能被赋值给新变量(var cleanData = dirtyInput)
  - 不要跳过中间层: 即使只是传递也要记录
    `,

    `
步骤3: 识别所有验证/净化点
  - 搜索净化函数: escapeHtml(), sanitize(), validate(), trim()等
  - 检查框架自动防护: 模板引擎自动转义、ORM参数化等
  - 记录每个防护点: 位置 + 防护方式 + 是否有效
  - 注意: 部分防护(如trim、toLowerCase)不能防止注入
    `,

    `
步骤4: 分析数据变换
  - 记录所有数据变换: 编码、拼接、格式化、类型转换
  - 评估变换是否改变污染状态: encodeURIComponent()可能净化某些注入
  - 注意上下文: 同样的数据在SQL vs HTML vs CLI中有不同风险
    `,

    `
步骤5: 确认汇聚点(Sink)
  - 识别危险操作: SQL执行、HTML渲染、系统命令、文件写入等
  - 记录: 文件位置 + 危险代码 + 操作上下文
  - 确认污染参数是否到达此点
  - 评估: 到达sink时的污染状态
    `,

    `
步骤6: 形成完整结论
  - 汇总: Source → Flow → Sink 完整路径
  - 明确标注: 每一步的污染状态
  - 结论应该基于追踪到的证据，而非推测
  - 如果某段路径无法确定，标注为 "unknown" 而非假设
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '跳过中间步骤',
      wrong: '"User input goes to SQL query"',
      correct: `User input → Controller.extract() → Service.validate() → 
        Service.buildQuery() → SQL execution
        (each step with file:line evidence)`,
      why: '跳过步骤可能遗漏关键的验证或净化点'
    },

    {
      mistake: '没有区分推测和追踪',
      wrong: '"The parameter probably reaches the database"',
      correct: '"Traced: param → buildQuery() at Service:45 → db.execute() at Service:52"',
      why: '推测不等于证据，审核需要确定的数据流'
    },

    {
      mistake: '忽视条件分支',
      wrong: '"Always vulnerable to XSS"',
      correct: `"Vulnerable when user.isPremium === true (Line 30 branch)
        Clean path when isPremium === false (uses sanitized template)"`,
      why: '条件分支可能导致不同的安全结果'
    },

    {
      mistake: '把数据变换误认为净化',
      wrong: '"Input is cleaned with toLowerCase()"',
      correct: '"toLowerCase() applied at Line 38, but does NOT prevent XSS injection"',
      why: '不是所有数据变换都能防止注入攻击'
    },

    {
      mistake: '没有分析sink上下文',
      wrong: '"User input written to output"',
      correct: `"User input inserted into HTML attribute context:
        <input value="\${userInput}"> - vulnerable to attribute injection"`,
      why: '不同的sink上下文需要不同的防护措施'
    },

    {
      mistake: '没有标注污染状态变化',
      wrong: '"Data flows from A to B to C"',
      correct: `"A(tainted) → B(encoded→cleaned) → C(clean)
        vs
        A(tainted) → B(no change→tainted) → C(tainted)"`,
      why: '污染状态决定了是否构成真正的漏洞'
    },

    {
      mistake: '没有记录别名/重命名',
      wrong: '"Cannot find where userInput goes"',
      correct: `"userInput (Controller:15) → renamed to query (Controller:20) 
        → passed as options.query (Service:30)"`,
      why: '参数常被重命名，需要跟踪别名关系'
    }
  ]
};

export default DataFlowEvidenceStandard;
