/**
 * HOS-Sec-Engine - skills-index.json Generator
 * 
 * Scans all SKILL.md files and generates a searchable index for the CLI installer.
 * 
 * Output:
 *   - skills-index.json (at project root, for npx skills add to read)
 *   - dist/skills-index.json (for distribution)
 */

import * as fs from 'fs';
import * as path from 'path';
import { allSkills } from '../skills';
import type { AttackDefenseSkill } from '../types/skill';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Project root: go up 3 levels from dist/src/scripts/ */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Output path for skills-index.json */
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'skills-index.json');
const DIST_OUTPUT_PATH = path.join(PROJECT_ROOT, 'dist', 'skills-index.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a short description from a skill.
 */
function extractDescription(skill: AttackDefenseSkill): string {
  const desc = skill.knowledge.description;
  const firstSentence = desc.split(/[.。]/)[0].trim();
  if (firstSentence && firstSentence.length <= 200) {
    return firstSentence;
  }
  return firstSentence.slice(0, 200) + '...';
}

/**
 * Build the skills-index.json structure.
 */
function buildIndex(skills: AttackDefenseSkill[]): any {
  const skillEntries = skills.map(skill => ({
    id: skill.metadata.id,
    name: skill.metadata.name,
    category: skill.metadata.category,
    subCategory: skill.metadata.subCategory,
    tags: skill.metadata.tags,
    riskLevel: skill.metadata.riskLevel,
    confidence: skill.metadata.confidence,
    description: extractDescription(skill),
    updatedAt: skill.metadata.updatedAt,
    author: skill.metadata.author || 'HOS-Sec-Engine',
  }));

  // Auto-generate bundles by category
  const bundles: Record<string, any> = {};
  const byCategory = new Map<string, typeof skills>();

  for (const skill of skills) {
    const cat = skill.metadata.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  // Category name mapping for display
  const categoryNames: Record<string, string> = {
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

  const categoryDescriptions: Record<string, string> = {
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

  for (const [category, catSkills] of byCategory) {
    const bundleKey = `${category}-bundle`;
    bundles[bundleKey] = {
      name: categoryNames[category] || category,
      description: categoryDescriptions[category] || `${category} 相关 Skill`,
      skills: catSkills.map(s => s.metadata.id),
    };
  }

  // Also add "all" bundle
  bundles['all-bundle'] = {
    name: '全部 Skill',
    description: `所有 ${skills.length} 个攻防实战 Skill`,
    skills: skills.map(s => s.metadata.id),
  };

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalSkills: skills.length,
    skills: skillEntries,
    bundles,
  };
}

// ---------------------------------------------------------------------------
// Main Entry
// ---------------------------------------------------------------------------

/**
 * Generate skills-index.json files.
 */
export function generateSkillsIndex(skills?: AttackDefenseSkill[]): string {
  const targetSkills = skills || allSkills.filter(s => s.enabled !== false);

  if (targetSkills.length === 0) {
    console.warn('No skills available. Cannot generate index.');
    return '';
  }

  const index = buildIndex(targetSkills);
  const content = JSON.stringify(index, null, 2);

  // Write to project root
  fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');
  console.log(`Generated: ${OUTPUT_PATH}`);

  // Write to dist/
  try {
    fs.mkdirSync(path.dirname(DIST_OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(DIST_OUTPUT_PATH, content, 'utf-8');
    console.log(`Generated: ${DIST_OUTPUT_PATH}`);
  } catch {
    // dist/ may not exist yet if running before tsc
  }

  return OUTPUT_PATH;
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

if (require.main === module) {
  try {
    generateSkillsIndex();
    console.log(`Done. skills-index.json generated for ${allSkills.filter(s => s.enabled !== false).length} skill(s).`);
  } catch (error) {
    console.error('skills-index.json generation failed:', error);
    process.exit(1);
  }
}
