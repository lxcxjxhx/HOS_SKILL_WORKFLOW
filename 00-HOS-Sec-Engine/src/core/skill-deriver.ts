/**
 * HOS-Sec-Engine - Skill Deriver (Finding → New Skill)
 *
 * 从渗透测试中的 findings 自动衍生新技能的核心引擎。
 * 当流程执行过程中发现新的攻击模式或技术，该模块负责：
 * 1. 分析 finding 是否可抽象为独立技能
 * 2. 提取技术模式、检查清单、验证标准
 * 3. 生成技能骨架并注册到索引
 * 4. 部署到编辑器
 *
 * 这是实现"渗透测试过程本身即技能扩充过程"的核心模块。
 */

import * as fs from 'fs';
import * as path from 'path';
import { AttackDefenseSkill, Metadata, Trigger, Knowledge, Action, Validation, Defense, DEFAULT_SKILL_RUNTIME } from '../types/skill';
import { skillLifecycle, SkillLifecycleMeta } from './skill-lifecycle';
import { SkillValidator } from './validator';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');

/**
 * 可衍生技能的 finding 阈值
 */
const MIN_CONFIDENCE_TO_DERIVE = 0.6;
const MIN_TECHNIQUE_COUNT = 2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * 渗透测试中的发现
 * （复用 orchestrator 的 Finding 类型，保持兼容）
 */
export interface Finding {
  skillId: string;
  severity: string;
  description: string;
  evidence?: string;
  timestamp?: string;
}

/**
 * 技能衍生候选
 */
export interface DerivationCandidate {
  /** 建议的技能 ID */
  suggestedId: string;
  /** 建议的技能名称 */
  suggestedName: string;
  /** 置信度 0-1 */
  confidence: number;
  /** 衍生依据 */
  rationale: string;
  /** 源 findings */
  sourceFindings: Finding[];
  /** 抽取的技术模式 */
  extractedTechniques: string[];
  /** 建议的分类 */
  suggestedCategory: string;
  /** 建议的子分类 */
  suggestedSubCategory: string;
}

/**
 * 技能衍生结果
 */
export interface DerivationResult {
  success: boolean;
  skill?: AttackDefenseSkill;
  candidate?: DerivationCandidate;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Finding Analysis & Skill Derivation
// ---------------------------------------------------------------------------

export class SkillDeriver {
  /** 已衍生的技能跟踪（防止重复） */
  private derivedSkills: Map<string, { candidate: DerivationCandidate; timestamp: string }> = new Map();

  constructor() {
    this.loadDerivedSkills();
  }

  /**
   * 分析 findings 是否可衍生新技能
   *
   * @param findings 当前流程产生的 findings
   * @returns 衍生候选列表
   */
  analyzeFindings(findings: Finding[]): DerivationCandidate[] {
    const candidates: DerivationCandidate[] = [];

    // 按 severity 分组分析
    const highSeverityFindings = findings.filter(f =>
      f.severity === 'critical' || f.severity === 'high'
    );

    if (highSeverityFindings.length < MIN_TECHNIQUE_COUNT) {
      return candidates; // 不足以衍生
    }

    // 分析是否出现新的攻击模式
    const techniquePatterns = this.extractTechniquePatterns(highSeverityFindings);

    for (const pattern of techniquePatterns) {
      if (pattern.confidence >= MIN_CONFIDENCE_TO_DERIVE && pattern.extractedTechniques.length >= MIN_TECHNIQUE_COUNT) {
        candidates.push(pattern);
      }
    }

    return candidates;
  }

  /**
   * 从 finding 中提取技术模式
   */
  private extractTechniquePatterns(findings: Finding[]): DerivationCandidate[] {
    const patterns: DerivationCandidate[] = [];
    const techniqueMap = new Map<string, { findings: Finding[]; count: number }>();

    // 分析 finding 的 evidence 字段，提取技术关键词
    for (const finding of findings) {
      const evidence = (finding.evidence || finding.description || '').toLowerCase();
      const techniques = this.matchTechniques(evidence);

      for (const technique of techniques) {
        if (!techniqueMap.has(technique)) {
          techniqueMap.set(technique, { findings: [], count: 0 });
        }
        techniqueMap.get(technique)!.findings.push(finding);
        techniqueMap.get(technique)!.count++;
      }
    }

    // 对高频技术模式生成候选
    for (const [technique, data] of techniqueMap) {
      if (data.count >= MIN_TECHNIQUE_COUNT) {
        const category = this.inferCategory(technique, data.findings);
        const id = this.generateSkillId(category, technique);

        patterns.push({
          suggestedId: id,
          suggestedName: this.generateSkillName(technique, category),
          confidence: Math.min(0.5 + data.count * 0.1, 0.95),
          rationale: `从 ${data.count} 个 findings 中检测到 "${technique}" 模式`,
          sourceFindings: data.findings,
          extractedTechniques: [technique],
          suggestedCategory: category,
          suggestedSubCategory: technique,
        });
      }
    }

    return patterns;
  }

  /**
   * 从文本中匹配已知技术模式
   */
  private matchTechniques(text: string): string[] {
    const techniques: string[] = [];
    const patterns: [RegExp, string][] = [
      // Web 技术
      [/sql\s*injection|sqli/i, 'sql-injection'],
      [/cross.?site.?script|xss/i, 'xss'],
      [/ssrf|server.?side.?request.?forgery/i, 'ssrf'],
      [/xxe|xml.?external.?entity/i, 'xxe'],
      [/rce|remote.?code.?execution|command.?injection/i, 'command-injection'],
      [/lfi|local.?file.?inclusion|path.?traversal/i, 'lfi'],
      [/csrf|cross.?site.?request.?forgery/i, 'csrf'],
      [/ssti|template.?injection/i, 'template-injection'],
      [/upload|file.?upload|webshell/i, 'file-upload'],
      [/nosql|mongodb.*injection/i, 'nosql-injection'],
      [/cors|cross.?origin/i, 'cors'],
      [/host.?header/i, 'host-header-injection'],
      [/smuggling|request.?smuggling/i, 'request-smuggling'],
      [/deserialization|unserialize|pickle/i, 'deserialization'],
      [/graphql.*introspection|graphql.*injection/i, 'graphql'],
      [/jwt|json.?web.?token/i, 'jwt'],
      [/oauth|openid|oidc/i, 'oauth'],
      [/idor|insecure.?direct.?object.?reference|bola/i, 'idor'],
      [/rate.?limit|ratelimit/i, 'rate-limit'],
      [/prototype.?pollution/i, 'prototype-pollution'],
      [/http.*splitting/i, 'http-splitting'],
      // 系统技术
      [/privilege.?escalation|提权|privesc/i, 'privilege-escalation'],
      [/container.*escape|docker.*escape/i, 'container-escape'],
      [/token.*impersonat|seimpersonate|potato/i, 'token-theft'],
      [/dll.?hijack|dll.*injection/i, 'dll-hijacking'],
      [/uac.*bypass|bypass.*uac/i, 'uac-bypass'],
      [/kerberos|golden.*ticket|silver.*ticket|pass.*the.*hash/i, 'kerberos-attack'],
      [/ldap.*injection/i, 'ldap-injection'],
      [/server.?side.?include|ssi/i, 'ssi-injection'],
      // 云技术
      [/iam.*escalation|iam.*passrole|assume.?role/i, 'iam-privilege-escalation'],
      [/metadata.*ssrf|imds|169\.254\.169\.254/i, 'cloud-metadata'],
      [/s3.*bucket|bucket.*misconfig/i, 's3-misconfiguration'],
      // 其他
      [/prompt.*injection|jailbreak|llm.*bypass/i, 'prompt-injection'],
      [/reverse.*engineering|apk.*decompile|frida/i, 'reverse-engineering'],
    ];

    for (const [regex, technique] of patterns) {
      if (regex.test(text) && !techniques.includes(technique)) {
        techniques.push(technique);
      }
    }

    return techniques;
  }

  /**
   * 推断技能分类
   */
  private inferCategory(technique: string, findings: Finding[]): string {
    const webTechniques = ['xss', 'sqli', 'ssrf', 'xxe', 'csrf', 'lfi', 'ssti', 'file-upload',
      'command-injection', 'nosql-injection', 'cors', 'host-header-injection', 'request-smuggling',
      'deserialization', 'prototype-pollution', 'http-splitting'];
    const apiTechniques = ['jwt', 'oauth', 'idor', 'rate-limit', 'graphql'];
    const cloudTechniques = ['iam-privilege-escalation', 'cloud-metadata', 's3-misconfiguration'];
    const containerTechniques = ['container-escape'];
    const systemTechniques = ['privilege-escalation', 'token-theft', 'dll-hijacking', 'uac-bypass'];

    if (webTechniques.includes(technique)) return 'web';
    if (apiTechniques.includes(technique)) return 'api';
    if (cloudTechniques.includes(technique)) return 'cloud';
    if (containerTechniques.includes(technique)) return 'container';
    if (systemTechniques.includes(technique)) return 'linux'; // default for system

    // Fallback: check findings' original categories
    const firstFinding = findings[0];
    if (firstFinding?.skillId) {
      const cat = firstFinding.skillId.split('-')[0];
      if (['web', 'api', 'cloud', 'linux', 'windows', 'container'].includes(cat)) return cat;
    }

    return 'web'; // default
  }

  /**
   * 生成技能 ID
   */
  private generateSkillId(category: string, technique: string): string {
    const base = `${category}-${technique}`;
    // 检查是否已存在
    if (fs.existsSync(path.join(SKILLS_DIR, base))) {
      // 找下一个可用编号
      for (let i = 2; i < 100; i++) {
        const candidate = `${base}-${String(i).padStart(3, '0')}`;
        if (!fs.existsSync(path.join(SKILLS_DIR, candidate))) {
          return candidate;
        }
      }
    }
    return `${base}-001`;
  }

  /**
   * 生成技能名称
   */
  private generateSkillName(technique: string, category: string): string {
    const nameMap: Record<string, string> = {
      'sql-injection': 'SQL Injection Detection and Exploitation',
      'xss': 'Cross-Site Scripting Detection and Exploitation',
      'ssrf': 'Server-Side Request Forgery Detection',
      'xxe': 'XXE Injection Detection and Exploitation',
      'csrf': 'Cross-Site Request Forgery Detection',
      'lfi': 'Local File Inclusion Detection',
      'ssti': 'Server-Side Template Injection Detection',
      'file-upload': 'File Upload Vulnerability Detection',
      'command-injection': 'Command Injection Detection and Exploitation',
      'nosql-injection': 'NoSQL Injection Detection',
      'cors': 'CORS Misconfiguration Detection',
      'host-header-injection': 'Host Header Injection Detection',
      'request-smuggling': 'HTTP Request Smuggling Detection',
      'deserialization': 'Insecure Deserialization Detection',
      'prototype-pollution': 'Prototype Pollution Detection',
      'jwt': 'JWT Attack and Bypass Techniques',
      'oauth': 'OAuth Flow Attack Techniques',
      'idor': 'IDOR / Broken Object Level Authorization',
      'rate-limit': 'Rate Limit Bypass Techniques',
      'graphql': 'GraphQL Injection Detection',
      'iam-privilege-escalation': 'IAM Privilege Escalation Techniques',
      'cloud-metadata': 'Cloud Metadata SSRF Exploitation',
      's3-misconfiguration': 'S3/OSS Bucket Misconfiguration',
      'container-escape': 'Container Escape Techniques',
      'privilege-escalation': 'Privilege Escalation Techniques',
      'token-theft': 'Token Theft and Impersonation',
      'dll-hijacking': 'DLL Hijacking Techniques',
      'uac-bypass': 'UAC Bypass Techniques',
      'prompt-injection': 'Prompt Injection Bypass Techniques',
    };

    return nameMap[technique] || `${technique.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Techniques`;
  }

  // ==================== 技能衍生执行 ====================

  /**
   * 从候选衍生技能
   *
   * @param candidate 衍生候选
   * @returns 衍生结果
   */
  deriveSkill(candidate: DerivationCandidate): DerivationResult {
    const errors: string[] = [];

    // 检查是否已衍生
    if (this.derivedSkills.has(candidate.suggestedId)) {
      return {
        success: false,
        candidate,
        errors: [`技能 ${candidate.suggestedId} 已从之前的 findings 衍生过`],
      };
    }

    // 构建技能骨架
    const description = this.buildDescription(candidate);
    const techniques = [...new Set(candidate.extractedTechniques)];
    const examples = this.buildExamples(candidate);
    const references = this.buildReferences(candidate);

    const metadata: Metadata = {
      id: candidate.suggestedId,
      name: candidate.suggestedName,
      category: candidate.suggestedCategory,
      subCategory: candidate.suggestedSubCategory,
      riskLevel: 'high',
      confidence: candidate.confidence,
      updatedAt: new Date().toISOString().slice(0, 7),
      author: 'HOS-Sec-Engine (auto-derived)',
      tags: [candidate.suggestedCategory, candidate.suggestedSubCategory, ...candidate.extractedTechniques],
    };

    const skill: AttackDefenseSkill = {
      metadata,
      trigger: {
        scenarios: [
          ...candidate.sourceFindings.map(f => f.description),
          `渗透测试中发现 ${candidate.suggestedName} 相关特征`,
        ],
        keywords: candidate.extractedTechniques,
        aliases: [candidate.suggestedId],
        indicators: [],
      },
      knowledge: {
        description,
        symptoms: candidate.sourceFindings.map(f => f.description || ''),
        rootCauses: [],
        observations: [],
        commonMistakes: [],
        notes: [`此技能由 SkillDeriver 从 ${candidate.sourceFindings.length} 个 findings 自动衍生`],
      },
      action: {
        checklist: [
          `确认 ${candidate.suggestedCategory} 应用是否受此漏洞影响`,
          `收集相关技术栈信息`,
          `测试漏洞的基本存在性`,
          `验证漏洞的可利用性`,
          `评估影响范围和风险等级`,
        ],
        techniques,
        examples,
      },
      validation: {
        indicators: [],
        successSigns: [],
        falsePositiveSigns: [],
      },
      defense: {
        recommendations: [
          `修复 ${candidate.suggestedName} 相关的安全弱点`,
          `实施输入验证和输出编码`,
          `遵循最小权限原则`,
        ],
        mitigations: [],
        references,
      },
      enabled: true,
      runtime: { ...DEFAULT_SKILL_RUNTIME },
    };

    // 验证技能
    const validationErrors = SkillValidator.validate(skill);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
      return { success: false, candidate, errors };
    }

    // 注册到生命周期
    const created = skillLifecycle.createSkillFromTemplate(skill, 'derived', candidate.suggestedId);
    if (!created) {
      errors.push('技能注册到生命周期失败');
      return { success: false, candidate, errors };
    }

    // 跟踪已衍生
    this.derivedSkills.set(candidate.suggestedId, {
      candidate,
      timestamp: new Date().toISOString(),
    });

    console.log(`[SkillDeriver] 🧬 新技能衍生: ${candidate.suggestedId} (conf: ${candidate.confidence})`);
    return { success: true, skill: created, candidate, errors };
  }

  /**
   * 批量衍生技能
   */
  deriveSkills(candidates: DerivationCandidate[]): DerivationResult[] {
    return candidates.map(c => this.deriveSkill(c));
  }

  /**
   * 从 Finding 列表自动分析和衍生
   */
  analyzeAndDerive(findings: Finding[]): DerivationResult[] {
    const candidates = this.analyzeFindings(findings);
    if (candidates.length === 0) {
      console.log('[SkillDeriver] 没有可衍生的技能模式');
      return [];
    }
    console.log(`[SkillDeriver] 发现 ${candidates.length} 个潜在的技能衍生模式`);
    return this.deriveSkills(candidates);
  }

  // ==================== 辅助方法 ====================

  private buildDescription(candidate: DerivationCandidate): string {
    const findingDescs = candidate.sourceFindings.map(f => f.description).join('; ');
    return `从渗透测试发现中自动衍生的技能。`
         + `基于 ${candidate.sourceFindings.length} 个 findings 的模式分析。`
         + `核心技术: ${candidate.extractedTechniques.join(', ')}。`
         + `源 findings: ${findingDescs.slice(0, 300)}`;
  }

  private buildExamples(candidate: DerivationCandidate): { name: string; description: string; content: string }[] {
    return candidate.sourceFindings.slice(0, 3).map((f, i) => ({
      name: `衍生示例 ${i + 1}`,
      description: f.description.slice(0, 150),
      content: f.evidence || f.description,
    }));
  }

  private buildReferences(candidate: DerivationCandidate): string[] {
    return [
      `https://cwe.mitre.org/`,
      `https://owasp.org/www-project-top-ten/`,
      `https://portswigger.net/web-security`,
    ];
  }

  /**
   * 持久化衍生记录
   */
  persist(): void {
    const dataPath = path.join(PROJECT_ROOT, '.claude', 'skill-deriver.json');
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify({
      derivedSkills: Array.from(this.derivedSkills.entries()).map(([id, data]) => ({
        id,
        timestamp: data.timestamp,
        candidate: data.candidate,
      })),
    }, null, 2), 'utf-8');
  }

  private loadDerivedSkills(): void {
    const dataPath = path.join(PROJECT_ROOT, '.claude', 'skill-deriver.json');
    try {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        if (Array.isArray(data.derivedSkills)) {
          for (const entry of data.derivedSkills) {
            this.derivedSkills.set(entry.id, {
              candidate: entry.candidate,
              timestamp: entry.timestamp,
            });
          }
        }
      }
    } catch {
      // 忽略加载错误
    }
  }
}

/** 全局单例 */
export const skillDeriver = new SkillDeriver();
