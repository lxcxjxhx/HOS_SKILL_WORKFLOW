/**
 * HOS-Audit-Core Schema Definitions
 * 
 * 核心数据结构定义，所有规则和输出基于这些类型
 */

// ============================================================================
// 枚举定义
// ============================================================================

export enum SeverityLevel {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Info = 'Info'
}

export enum ConfidenceLevel {
  High = 'High',      // 直接代码证据 + 验证
  Medium = 'Medium',  // 代码审查 + 模式匹配
  Low = 'Low'         // 推测 + 假设
}

export enum EvidenceType {
  SourceCode = 'source-code',    // 源代码位置和上下文
  DataFlow = 'data-flow',        // 数据流追踪
  Configuration = 'configuration', // 配置文件
  API = 'api',                   // API定义和调用
  Dependency = 'dependency',     // 依赖库版本
  Runtime = 'runtime',           // 运行时行为
  Blackbox = 'blackbox-evidence' // 黑盒证据(HTTP请求/响应、网络流量)
}

export enum LanguageType {
  Java = 'java',
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  CSharp = 'csharp',
  PHP = 'php',
  Go = 'go',
  Rust = 'rust'
}

// ============================================================================
// 检查步骤定义
// ============================================================================

export interface CheckStep {
  /** 执行顺序 */
  order: number;

  /** 检查步骤名称 */
  name: string;

  /** 检查条件的自然语言描述 */
  condition: string;

  /** AI需要回答的关键问题 */
  questions: string[];

  /** 失败指标 - 如果出现这些，通常表示漏洞存在 */
  failureIndicators: string[];

  /** 成功指标 - 如果出现这些，通常表示漏洞不存在 */
  successIndicators?: string[];

  /** 这一步的重要程度 */
  criticality: 'must-have' | 'important' | 'nice-to-have';
}

// ============================================================================
// 证据要求定义
// ============================================================================

export interface EvidenceRequirement {
  /** 证据类型 */
  type: EvidenceType;

  /** 是否必需 */
  required: boolean;

  /** 证据描述 */
  description: string;

  /** 证据示例 */
  example: string;

  /** 采集指导 */
  collection_guidance: string | string[];
}

// ============================================================================
// 修复建议定义
// ============================================================================

export interface RemediationGuide {
  /** 优先级 */
  priority: SeverityLevel;

  /** 修复行为 */
  action: string;

  /** 具体代码示例 */
  code?: string;

  /** 文字描述 */
  description?: string;

  /** 相关资源链接 */
  references?: string[];

  /** 修复难度 */
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// ============================================================================
// 触发条件定义
// ============================================================================

export interface TriggerCondition {
  /** 代码模式 */
  patterns: string[];

  /** 支持的编程语言 */
  languages: LanguageType[];

  /** 目标框架 (可选) */
  frameworks?: string[];

  /** 触发关键字 */
  keywords?: string[];
}

// ============================================================================
// 审计规则定义 (核心)
// ============================================================================

export interface AuditRule {
  // ────── 规则基本信息 ──────

  /** 规则ID: AR-001, AR-002 等 */
  id: string;

  /** 规则名称 */
  name: string;

  /** 规则描述 */
  description: string;

  /** 详细用途说明 */
  detail?: string;

  // ────── 触发条件 ──────

  /** 何时触发这条规则 */
  triggers: TriggerCondition;

  // ────── 检查流程 (关键！) ──────

  /** 按顺序执行的检查步骤 */
  checks: CheckStep[];

  // ────── 证据收集 ──────

  /** 需要收集的证据 */
  evidence_requirements: EvidenceRequirement[];

  // ────── 修复方案 ──────

  /** 修复建议列表 */
  remediations: RemediationGuide[];

  // ────── 元数据 ──────

  /** 默认严重级别 */
  default_severity: SeverityLevel;

  /** CWE映射 */
  cwe_ids: string[];

  /** OWASP映射 */
  owasp_categories: string[];

  /** 创建日期 */
  created_date?: string;

  /** 最后更新 */
  last_updated?: string;

  // ────── 渗透测试验证 ──────

  /** 渗透测试验证指南 */
  pentestValidation?: {
    /** 验证描述 */
    description: string;
    /** 攻击步骤 */
    attackSteps: string[];
    /** 使用的工具 */
    tools: string[];
    /** 期望发现 */
    expectedFindings: string[];
  };
}

// ============================================================================
// 审核规则定义
// ============================================================================

export interface ReviewQuestion {
  /** 问题描述 */
  question: string;

  /** 为什么要问这个问题 */
  rationale: string;

  /** 可能的答案及其含义 */
  possible_answers: {
    answer: string;
    meaning: string;
    is_false_positive?: boolean;
  }[];
}

export interface FalsePositivePattern {
  /** 误报模式名称 */
  name: string;

  /** 识别特征 */
  indicators: string[];

  /** 如何验证这不是真实漏洞 */
  verification_steps: string[];

  /** 相关的审计规则 */
  related_rules: string[];
}

export interface ReviewRule {
  // ────── 基本信息 ──────

  /** 规则ID: RR-001, RR-002 等 */
  id: string;

  /** 规则名称 */
  name: string;

  /** 规则描述 */
  description: string;

  // ────── 审核流程 ──────

  /** 关键问题列表 */
  questions: ReviewQuestion[];

  // ────── 误报检测 ──────

  /** 常见的误报模式 */
  false_positive_patterns?: FalsePositivePattern[];

  // ────── 应用范围 ──────

  /** 这个审核规则适用于哪些审计规则 */
  applicable_to_rules: string[];

  // ────── 元数据 ──────

  /** 创建日期 */
  created_date?: string;
}

// ============================================================================
// 证据规则定义
// ============================================================================

export interface EvidenceStandard {
  /** 证据标准ID */
  id: string;

  /** 证据类型 */
  type: EvidenceType;

  /** 标准名称 */
  name: string;

  /** 标准描述 */
  description: string;

  // ────── 采集标准 ──────

  /** 必需的字段 */
  required_fields: string[];

  /** 推荐的字段 */
  recommended_fields?: string[];

  // ────── 正确示例 ──────

  /** 好的证据示例 */
  good_example: string;

  /** 差的证据示例 */
  bad_example: string;

  // ────── 指导 ──────

  /** 采集指导 */
  collection_guidance: string[];

  /** 常见错误 */
  common_mistakes: {
    mistake: string;
    wrong: string;
    correct: string;
    why: string;
  }[];

  // ────── 元数据 ──────

  created_date?: string;
}

// ============================================================================
// 发现定义 (输出)
// ============================================================================

export interface CodeLocation {
  /** 文件路径 */
  file: string;

  /** 行号 */
  line: number;

  /** 列号 (可选) */
  column?: number;

  /** 代码片段 */
  snippet: string;
}

export interface Finding {
  // ────── 基本信息 ──────

  /** 发现的标题 */
  title: string;

  /** 详细描述 */
  description: string;

  /** 发现的类型 (对应的审计规则ID) */
  rule_id: string;

  // ────── 位置信息 ──────

  /** 代码位置 */
  location: CodeLocation;

  // ────── 证据 ──────

  /** 发现的证据 */
  evidence_chain: {
    discovery: string;           // 发现了什么
    parameter_source: string;    // 参数来源
    validation_check: string;    // 是否有验证
    control_analysis: string;    // 防护措施分析
    conclusion: string;          // 最终结论
  };

  // ────── 严重程度 ──────

  /** 严重级别 */
  severity: SeverityLevel;

  /** 信心度 */
  confidence: ConfidenceLevel;

  // ────── 利用条件 ──────

  exploitation?: {
    prerequisites: string[];
    steps: string[];
    impact: string;
  };

  // ────── 根因分析 ──────

  root_cause: string;

  // ────── 修复建议 ──────

  remediation: string;

  /** 修复示例代码 */
  remediation_code?: string;

  // ────── 验证方法 ──────

  verification: string;

  // ────── 元数据 ──────

  created_date: string;
}

// ============================================================================
// 审计报告定义 (输出)
// ============================================================================

export interface AuditReport {
  /** 报告标题 */
  title: string;

  /** 审计范围 */
  scope: string;

  /** 审计时间 */
  audit_date: string;

  /** 发现列表 */
  findings: Finding[];

  /** 统计信息 */
  statistics: {
    total_findings: number;
    by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
    by_confidence: {
      high: number;
      medium: number;
      low: number;
    };
  };

  /** 执行摘要 */
  executive_summary: string;

  /** 建议 */
  recommendations: string[];
}

// ============================================================================
// 规则集合定义
// ============================================================================

export interface RuleSet {
  /** 规则集名称 */
  name: string;

  /** 规则集描述 */
  description: string;

  /** 审计规则 */
  audit_rules: AuditRule[];

  /** 审核规则 */
  review_rules: ReviewRule[];

  /** 证据规则 */
  evidence_standards: EvidenceStandard[];

  /** 版本 */
  version: string;

  /** 创建日期 */
  created_date: string;
}

// ============================================================================
// 配置定义
// ============================================================================

export interface AuditConfig {
  /** 要加载的规则集 */
  rule_sets: string[];

  /** 最小信心度 */
  min_confidence: ConfidenceLevel;

  /** 最小严重级别 */
  min_severity: SeverityLevel;

  /** 启用的语言 */
  enabled_languages: LanguageType[];

  /** 启用的框架 */
  enabled_frameworks: string[];

  /** 自定义参数 */
  custom_parameters?: Record<string, any>;
}

// ============================================================================
// 问题分类定义 (Problems & Diagnostics)
// ============================================================================

export enum ProblemCategoryType {
  InputValidation = 'input-validation',
  AuthAuthorization = 'auth-authorization',
  DataProtection = 'data-protection',
  ConfigDeployment = 'config-deployment',
  DependencySupplyChain = 'dependency-supply-chain',
  BusinessLogic = 'business-logic'
}

export interface DiagnosticStep {
  /** 执行顺序 */
  order: number;

  /** 诊断步骤名称 */
  name: string;

  /** 步骤描述 */
  description: string;

  /** 关键检查问题 */
  questions: string[];

  /** 发现问题的指标 */
  defect_indicators: string[];

  /** 安全状态的指标 */
  secure_indicators?: string[];

  /** 相关工具或技术 */
  tools?: string[];
}

export interface DiagnosticGuide {
  // ────── 基本信息 ──────

  /** 问题ID: PD-001, PD-002 等 */
  id: string;

  /** 问题类别 */
  category: ProblemCategoryType;

  /** 问题名称 */
  name: string;

  /** 问题描述 */
  description: string;

  /** 详细说明 */
  detail?: string;

  // ────── 触发条件 ──────

  /** 何时触发此诊断 */
  triggers: TriggerCondition;

  // ────── 诊断流程 ──────

  /** 诊断步骤列表 */
  diagnostic_steps: DiagnosticStep[];

  // ────── 根因分析 ──────

  /** 常见根因 */
  common_root_causes: {
    cause: string;
    explanation: string;
    frequency: 'common' | 'occasional' | 'rare';
  }[];

  // ────── 修复方案 ──────

  /** 修复建议 */
  remediations: RemediationGuide[];

  // ────── 验证步骤 ──────

  /** 修复后验证步骤 */
  verification_steps: string[];

  // ────── 关联规则 ──────

  /** 相关的审计规则ID */
  related_audit_rules: string[];

  /** 相关的渗透测试规则ID */
  related_pentest_rules: string[];

  // ────── 元数据 ──────

  /** 默认严重级别 */
  default_severity: SeverityLevel;

  /** CWE映射 */
  cwe_ids: string[];

  /** OWASP映射 */
  owasp_categories: string[];

  /** 创建日期 */
  created_date?: string;

  /** 最后更新 */
  last_updated?: string;
}
