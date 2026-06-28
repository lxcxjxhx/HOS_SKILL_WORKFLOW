/**
 * HOS-Sec-Engine - Skill-Category CWE Mapping
 *
 * 将 CWE (Common Weakness Enumeration) 分类映射到技能分类体系。
 * 作为从 CWE 数据批量生成技能的模板配置。
 */

import { AttackDefenseSkill, Metadata, Trigger, Knowledge, Action, Validation, Defense, DEFAULT_SKILL_RUNTIME } from '../types/skill';

/** Display names for skill categories (Chinese labels) */
export const CATEGORY_NAMES: Record<string, string> = {
  web: 'Web 安全',
  api: 'API 安全',
  cloud: '云安全',
  windows: 'Windows 安全',
  linux: 'Linux 安全',
  'ai-security': 'AI 安全',
  ad: '域安全',
  mobile: '移动安全',
  container: '容器安全',
  kubernetes: 'Kubernetes 安全',
  'code-review': '代码审计',
  reverse: '逆向工程',
  'malware-analysis': '恶意代码分析',
  'threat-hunting': '威胁狩猎',
  defense: '防御策略',
};

/** Category descriptions for skills-index.json bundles */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  web: 'Web 应用安全相关 Skill（SQLi, XSS, SSRF, XXE, 上传绕过, RCE 等）',
  api: 'API 安全相关 Skill（JWT, OAuth, IDOR, Rate Limit 等）',
  cloud: '云安全相关 Skill（S3/OSS, IAM, 元数据 SSRF 等）',
  windows: 'Windows 安全相关 Skill（权限提升, 服务配置, 凭据问题等）',
  linux: 'Linux 安全相关 Skill（Sudo, Capability, Cron, 容器逃逸等）',
  'ai-security': 'AI 安全相关 Skill（Prompt 注入, 模型绕过等）',
  ad: 'AD 域渗透相关 Skill（域信息收集, 权限提升等）',
  mobile: '移动端安全相关 Skill（Android APK 分析等）',
  container: '容器安全相关 Skill（Docker 逃逸等）',
  kubernetes: 'Kubernetes 安全相关 Skill（配置审计等）',
  'code-review': '代码审计相关 Skill（Java/PHP/Python 反序列化等）',
  reverse: '逆向工程相关 Skill',
  'malware-analysis': '恶意代码分析相关 Skill',
  'threat-hunting': '威胁狩猎相关 Skill',
  defense: '防御策略相关 Skill',
};
export interface CWEMappingEntry {
  cweId: string;                     // e.g. "CWE-79"
  cweName: string;                   // e.g. "Improper Neutralization of Input During Web Page Generation"
  category: string;                  // 映射到技能分类
  subCategory: string;               // 二级分类
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;                // 默认置信度 0-1
  tags: string[];                    // 默认标签
  templateId: string;                // 生成的技能 ID 模板（用 {cweId} 替换）
  templateName: string;              // 生成的技能名称模板
}

/**
 * CWE→Skill 分类映射表
 *
 * 覆盖 OWASP Top 10 + CWE Top 25 的常见漏洞类型。
 * AI 自动维护：发现新 CWE 分类需要映射时，直接在此添加条目。
 * 然后运行 npm run generate:cwe 批量生成技能。
 */
export const CWE_SKILL_MAPPING: CWEMappingEntry[] = [
  // ========== Web 安全 ==========
  { cweId: 'CWE-79',  cweName: 'Cross-site Scripting',           category: 'web', subCategory: 'xss',              riskLevel: 'critical', confidence: 0.92, tags: ['xss', 'cross-site-scripting', 'cwe-79'],             templateId: 'web-xss-{num}',       templateName: 'XSS Filter Bypass Techniques' },
  { cweId: 'CWE-89',  cweName: 'SQL Injection',                  category: 'web', subCategory: 'sql-injection',     riskLevel: 'critical', confidence: 0.92, tags: ['sqli', 'sql-injection', 'cwe-89'],                  templateId: 'web-sqli-{num}',       templateName: 'SQL Injection Techniques' },
  { cweId: 'CWE-22',  cweName: 'Path Traversal',                 category: 'web', subCategory: 'lfi',               riskLevel: 'high',    confidence: 0.91, tags: ['lfi', 'path-traversal', 'cwe-22'],                    templateId: 'web-lfi-{num}',        templateName: 'Local File Inclusion Techniques' },
  { cweId: 'CWE-78',  cweName: 'OS Command Injection',           category: 'web', subCategory: 'command-injection',  riskLevel: 'critical', confidence: 0.93, tags: ['rce', 'command-injection', 'cwe-78'],                templateId: 'web-rce-{num}',        templateName: 'Command Injection Techniques' },
  { cweId: 'CWE-918', cweName: 'Server-Side Request Forgery',    category: 'web', subCategory: 'ssrf',              riskLevel: 'critical', confidence: 0.90, tags: ['ssrf', 'server-side-request-forgery', 'cwe-918'],   templateId: 'web-ssrf-{num}',       templateName: 'SSRF Detection and Exploitation' },
  { cweId: 'CWE-611', cweName: 'XXE',                            category: 'web', subCategory: 'xxe',               riskLevel: 'critical', confidence: 0.90, tags: ['xxe', 'xml-external-entity', 'cwe-611'],             templateId: 'web-xxe-{num}',        templateName: 'XXE Injection Techniques' },
  { cweId: 'CWE-434', cweName: 'Unrestricted File Upload',       category: 'web', subCategory: 'file-upload',       riskLevel: 'critical', confidence: 0.93, tags: ['upload', 'file-upload', 'cwe-434'],                   templateId: 'web-upload-{num}',     templateName: 'File Upload Restriction Bypass' },
  { cweId: 'CWE-352', cweName: 'CSRF',                           category: 'web', subCategory: 'csrf',              riskLevel: 'high',    confidence: 0.90, tags: ['csrf', 'cross-site-request-forgery', 'cwe-352'],     templateId: 'web-csrf-{num}',       templateName: 'Cross-Site Request Forgery Detection' },
  { cweId: 'CWE-502', cweName: 'Deserialization of Untrusted Data', category: 'web', subCategory: 'deserialization', riskLevel: 'critical', confidence: 0.91, tags: ['deserialization', 'insecure-deserialization', 'cwe-502'], templateId: 'web-deser-{num}', templateName: 'Insecure Deserialization Exploitation' },
  { cweId: 'CWE-94',  cweName: 'Code Injection',                 category: 'web', subCategory: 'code-injection',    riskLevel: 'critical', confidence: 0.88, tags: ['code-injection', 'rce', 'cwe-94'],                    templateId: 'web-code-injection-{num}', templateName: 'Code Injection Techniques' },
  { cweId: 'CWE-1336', cweName: 'SSTI',                          category: 'web', subCategory: 'ssti',              riskLevel: 'critical', confidence: 0.89, tags: ['ssti', 'template-injection', 'cwe-1336'],            templateId: 'web-ssti-{num}',       templateName: 'Server-Side Template Injection' },

  // ========== API 安全 ==========
  { cweId: 'CWE-287', cweName: 'Improper Authentication',        category: 'api',  subCategory: 'authentication',   riskLevel: 'critical', confidence: 0.91, tags: ['authentication', 'jwt', 'cwe-287'],                   templateId: 'api-auth-{num}',       templateName: 'API Authentication Bypass' },
  { cweId: 'CWE-862', cweName: 'Missing Authorization',          category: 'api',  subCategory: 'authorization',    riskLevel: 'high',    confidence: 0.90, tags: ['authorization', 'idor', 'cwe-862'],                   templateId: 'api-idor-{num}',       templateName: 'IDOR / Broken Object Level Authorization' },
  { cweId: 'CWE-200', cweName: 'Information Exposure',           category: 'api',  subCategory: 'information-disclosure', riskLevel: 'medium', confidence: 0.85, tags: ['information-disclosure', 'cwe-200'],                templateId: 'api-info-disclosure-{num}', templateName: 'API Information Disclosure' },

  // ========== 云安全 ==========
  { cweId: 'CWE-284', cweName: 'Improper Access Control',        category: 'cloud', subCategory: 'iam',             riskLevel: 'critical', confidence: 0.93, tags: ['iam', 'access-control', 'cwe-284'],                  templateId: 'cloud-iam-{num}',      templateName: 'Cloud IAM Privilege Escalation' },
  { cweId: 'CWE-538', cweName: 'File and Directory Info Exposure', category: 'cloud', subCategory: 's3',           riskLevel: 'high',    confidence: 0.92, tags: ['s3', 'bucket-misconfiguration', 'cwe-538'],         templateId: 'cloud-s3-{num}',       templateName: 'Cloud Storage Misconfiguration' },

  // ========== 容器/K8s 安全 ==========
  { cweId: 'CWE-250', cweName: 'Execution with Unnecessary Privileges', category: 'container', subCategory: 'docker-escape', riskLevel: 'critical', confidence: 0.90, tags: ['docker', 'privilege-escalation', 'cwe-250'], templateId: 'container-docker-{num}', templateName: 'Docker Container Escape' },
  { cweId: 'CWE-269', cweName: 'Improper Privilege Management',  category: 'container', subCategory: 'privilege-management', riskLevel: 'critical', confidence: 0.91, tags: ['privilege-escalation', 'cwe-269'],                  templateId: 'container-privesc-{num}', templateName: 'Container Privilege Escalation' },
];

/**
 * 获取指定分类的 CWE 映射
 */
export function getCWEMappingByCategory(category: string): CWEMappingEntry[] {
  return CWE_SKILL_MAPPING.filter(m => m.category === category);
}

/**
 * 获取指定 CWE ID 的映射
 */
export function getCWEMappingById(cweId: string): CWEMappingEntry | undefined {
  return CWE_SKILL_MAPPING.find(m => m.cweId === cweId);
}

/**
 * 从 CWE 映射生成技能模板的默认描述
 */
export function generateDefaultDescription(entry: CWEMappingEntry): string {
  return `${entry.cweName} (${entry.cweId}) 是 ${entry.category} 领域的常见安全弱点。`
       + ` 适用于检测和利用 ${entry.cweName} 漏洞。`
       + ` 包含 ${entry.subCategory} 相关的检查清单、技术手段和防御建议。`;
}

/**
 * 从 CWE 映射生成默认标签
 */
export function generateDefaultTags(entry: CWEMappingEntry): string[] {
  return [...new Set([...entry.tags, entry.category, entry.subCategory, entry.cweId.toLowerCase()])];
}

// ========== 技能模板工厂 ==========

/**
 * 从 CWE 映射条目生成完整的 AttackDefenseSkill 骨架
 *
 * @param entry CWE 映射条目
 * @param num 技能编号（用于 templateId 中的 {num} 占位符）
 * @returns 技能骨架对象（需要补充具体内容）
 */
export function createSkillFromCWEMapping(entry: CWEMappingEntry, num: number = 1): Partial<AttackDefenseSkill> {
  const id = entry.templateId.replace('{num}', String(num).padStart(3, '0'));

  const metadata: Metadata = {
    id,
    name: entry.templateName,
    category: entry.category,
    subCategory: entry.subCategory,
    riskLevel: entry.riskLevel,
    confidence: entry.confidence,
    updatedAt: new Date().toISOString().slice(0, 7),
    author: 'HOS-Sec-Engine',
    tags: generateDefaultTags(entry),
  };

  const trigger: Trigger = {
    scenarios: [
      `目标存在 ${entry.cweName} 漏洞特征`,
      `需要检测 ${entry.cweName} 类型的 ${entry.category} 安全问题`,
      `渗透测试中发现疑似 ${entry.cweName} 的漏洞迹象`,
    ],
    keywords: [entry.cweName.toLowerCase(), entry.cweId.toLowerCase(), entry.subCategory.toLowerCase()],
    aliases: [entry.cweId, `${entry.category} ${entry.subCategory}`],
    indicators: [],
  };

  const knowledge: Knowledge = {
    description: generateDefaultDescription(entry),
    symptoms: [],
    rootCauses: [],
    observations: [],
    commonMistakes: [],
    notes: [`基于 ${entry.cweId} (${entry.cweName}) 标准分类生成的技能框架`],
  };

  const action: Action = {
    checklist: [
      `确认目标是否受 ${entry.cweName} 影响`,
      `收集 ${entry.category} 相关的技术栈信息`,
      `测试 ${entry.subCategory} 漏洞的基本存在性`,
      `验证漏洞的可利用性和影响范围`,
    ],
    techniques: [],
    examples: [],
  };

  const validation: Validation = {
    indicators: [],
    successSigns: [],
    falsePositiveSigns: [],
  };

  const defense: Defense = {
    recommendations: [
      `修复 ${entry.cweName} 相关的安全弱点`,
      `实施 ${entry.category} 安全最佳实践`,
      `参考 OWASP 对 ${entry.cweId} 的修复指南`,
    ],
    mitigations: [],
    references: [
      `https://cwe.mitre.org/data/definitions/${entry.cweId.split('-')[1]}.html`,
      `https://owasp.org/www-project-top-ten/`,
    ],
  };

  return {
    metadata,
    trigger,
    knowledge,
    action,
    validation,
    defense,
    runtime: { ...DEFAULT_SKILL_RUNTIME },
  };
}
