#!/usr/bin/env node

/**
 * HOS-Sec-Engine - CWE/CVE Data-Driven Skill Generator
 *
 * 从 CWE/CVE 结构化数据源批量生成 AttackDefenseSkill，包括：
 * 1. 从 CWE_SKILL_MAPPING 配置生成技能骨架
 * 2. 可选：从本地 CVE JSON 数据填充示例和引用
 * 3. 自动注册到所有分类索引和 bundle
 *
 * 运行方式:
 *   npm run generate:cwe                    # 从 CWE 映射生成全部技能
 *   npm run generate:cwe -- --category web  # 仅生成指定分类
 *   npm run generate:cwe -- --cwe CWE-79    # 仅生成指定 CWE
 *   npm run generate:cwe -- --cve ./cve-data.json # 从 CVE 数据增强
 *
 * AI 自维护说明:
 * - 在 skill-categories.ts 的 CWE_SKILL_MAPPING 中添加新条目
 * - 运行 npm run generate:cwe 即可生成技能骨架
 * - 生成的技能缺少具体内容（示例、技术手段），需 AI 后续补充
 * - 或使用 --fulll 模式从已知 CVE 数据自动抽取内容填充
 */

import * as fs from 'fs';
import * as path from 'path';
import { AttackDefenseSkill } from '../types/skill';
import { SkillLifecycleManager, skillLifecycle } from '../core/skill-lifecycle';
import { generateSkillsMdFiles } from './generate-skills-md';
import { generateSkillsIndex } from './generate-skills-index';
import { CWE_SKILL_MAPPING, createSkillFromCWEMapping, CWEMappingEntry } from '../config/skill-categories';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');
const CACHE_DIR = path.join(PROJECT_ROOT, '.claude', 'cache');

// ---------------------------------------------------------------------------
// CLI Arguments
// ---------------------------------------------------------------------------

interface CLIOptions {
  category?: string;
  cwe?: string;
  cveFile?: string;
  full?: boolean;
  dryRun?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const opts: CLIOptions = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--category': opts.category = args[++i]; break;
      case '--cwe':      opts.cwe = args[++i]; break;
      case '--cve':      opts.cveFile = args[++i]; break;
      case '--full':     opts.full = true; break;
      case '--dry-run':  opts.dryRun = true; break;
      case '--help':
        console.log(`
CWE/CVE Skill Generator

Usage:
  npm run generate:cwe [options]

Options:
  --category <cat>  仅生成指定分类 (web/api/cloud/container/kubernetes/...)
  --cwe <id>        仅生成指定 CWE (如 CWE-79)
  --cve <file>      从 CVE JSON 数据文件增强技能内容
  --full            从 CVE 数据自动完整填充（可能消耗大量 token）
  --dry-run         仅显示将要生成的技能，不实际输出
  --help            显示帮助
        `);
        process.exit(0);
        break;
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// CVE Data Parser
// ---------------------------------------------------------------------------

interface CVEEntry {
  id: string;              // CVE-2024-12345
  description: string;
  cweIds: string[];        // ["CWE-79", "CWE-89"]
  severity?: string;
  cvss?: number;
  references: string[];
  affectedVersions?: string;
}

/**
 * 从 JSON 文件加载 CVE 数据
 * 格式: [{ "id": "CVE-2024-...", "description": "...", "cweIds": ["CWE-79"], ... }]
 */
function loadCVEData(filePath: string): CVEEntry[] {
  try {
    const absPath = path.resolve(PROJECT_ROOT, filePath);
    if (!fs.existsSync(absPath)) {
      console.warn(`[CWE-Gen] CVE 数据文件不存在: ${absPath}`);
      return [];
    }
    const raw = fs.readFileSync(absPath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : data.vulnerabilities || data.cveItems || [];
  } catch (err) {
    console.error(`[CWE-Gen] CVE 数据加载失败:`, err);
    return [];
  }
}

/**
 * 从 CVE 条目生成技能示例
 */
function generateExamplesFromCVE(cve: CVEEntry): { name: string; description: string; content: string; applicableScenarios?: string[] }[] {
  return [{
    name: `${cve.id} 实例`,
    description: cve.description.slice(0, 200),
    content: `CVE: ${cve.id}\nCVSS: ${cve.cvss || 'N/A'}\nSeverity: ${cve.severity || 'N/A'}\n\n${cve.description}\n\nAffected: ${cve.affectedVersions || 'See references'}`,
    applicableScenarios: [`${cve.id} 相关的漏洞利用`],
  }];
}

// ========== CWE-Skill Mapping ==========
// These entries define how CWE categories map to skill categories.
// The CWE_SKILL_MAPPING is now imported from config/skill-categories.ts

// ========== Skill Template Generator ==========

/**
 * 从 CWE 映射生成并保存技能文件
 */
function generateSkillsFromCWEMapping(opts: CLIOptions): AttackDefenseSkill[] {
  // 过滤 CWE 映射
  let mappings = [...CWE_SKILL_MAPPING];

  if (opts.category) {
    mappings = mappings.filter(m => m.category === opts.category);
  }
  if (opts.cwe) {
    mappings = mappings.filter(m => m.cweId.toUpperCase() === (opts.cwe as string).toUpperCase());
  }

  if (mappings.length === 0) {
    console.warn('[CWE-Gen] 没有匹配的 CWE 映射条目');
    return [];
  }

  // 加载 CVE 数据（可选）
  let cveData: CVEEntry[] = [];
  if (opts.cveFile) {
    cveData = loadCVEData(opts.cveFile);
    console.log(`[CWE-Gen] 加载了 ${cveData.length} 条 CVE 数据`);
  }

  console.log(`\n[CWE-Gen] 从 ${mappings.length} 个 CWE 条目生成技能...\n`);

  const generatedSkills: AttackDefenseSkill[] = [];

  for (const entry of mappings) {
    const skillPartial = createSkillFromCWEMapping(entry);
    const skill = skillLifecycle.createSkillFromTemplate(skillPartial, 'cwe', entry.cweId);
    if (!skill) continue;

    // 增强：从 CVE 数据填充示例
    if (cveData.length > 0) {
      const relatedCVEs = cveData.filter(cve =>
        cve.cweIds.some(cid => cid.toUpperCase() === entry.cweId.toUpperCase())
      );
      for (const cve of relatedCVEs) {
        const examples = generateExamplesFromCVE(cve);
        skill.action.examples.push(...examples);
        skill.defense.references.push(...cve.references.filter(r => !skill.defense.references.includes(r)));
      }
      if (relatedCVEs.length > 0) {
        console.log(`  [CVE] ${entry.cweId}: 追加 ${relatedCVEs.length} 条 CVE 示例`);
      }
    }

    generatedSkills.push(skill);

    if (!opts.dryRun) {
      // 确保技能目录存在
      const skillDir = path.join(SKILLS_DIR, skill.metadata.id);
      if (!fs.existsSync(skillDir)) {
        fs.mkdirSync(skillDir, { recursive: true });
      }
    }

    console.log(`  [GEN] ${skill.metadata.id} ← ${entry.cweId} (${entry.cweName})`);
  }

  // 持久化生命周期数据
  if (!opts.dryRun) {
    skillLifecycle.persist();
    console.log(`\n[CWE-Gen] 生命周期数据已持久化`);
  }

  return generatedSkills;
}

// ========== 从互联网源自动拉取 CVE 数据 ==========

/**
 * 从 CVE 数据源（NVD、cveprebuilt 等）拉取最新 CVE 条目
 *
 * 支持的源:
 * - nvd: NIST NVD API (需要 API Key)
 * - cvelist: CVE Project 的 cvelist 仓库 (GitHub)
 * - prebuilt: 预构建的 CVE 索引(https://cveprebuilt.circl.lu/)
 *
 * TODO: 在后续版本中实现自动爬取
 */
async function fetchCVEData(): Promise<void> {
  console.log('[CWE-Gen] CVE 自动拉取功能将在后续版本实现');
  console.log('[CWE-Gen] 当前可使用预下载的 CVE JSON 文件通过 --cve 参数指定');
  console.log('');
  console.log('  推荐 CVE 数据源:');
  console.log('  1. NVD API:    https://nvd.nist.gov/developers');
  console.log('  2. CVE Project: https://github.com/CVEProject/cvelist');
  console.log('  3. Prebuilt:    https://cveprebuilt.circl.lu/');
}

// ========== 主入口 ==========

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  HOS-Sec-Engine CWE/CVE Skill Generator  ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const opts = parseArgs();

  // 1. 从 CWE 映射生成技能
  const skills = generateSkillsFromCWEMapping(opts);

  if (skills.length === 0) {
    console.log('\n[CWE-Gen] 没有新技能生成。');
    return;
  }

  // 2. 可选：生成 SKILL.md 文件
  if (!opts.dryRun) {
    console.log(`\n[CWE-Gen] 生成 SKILL.md 文件...`);
    try {
      // 使用 lifecycle 中的技能生成 MD
      const generatedFiles = generateSkillsMdFiles();
      console.log(`[CWE-Gen] 生成了 ${generatedFiles.length} 个 SKILL.md 文件`);
    } catch (err) {
      console.error('[CWE-Gen] SKILL.md 生成失败:', err);
    }
  }

  // 3. 更新索引
  if (!opts.dryRun) {
    console.log(`\n[CWE-Gen] 更新 skills-index.json...`);
    try {
      generateSkillsIndex();
    } catch (err) {
      console.error('[CWE-Gen] 索引更新失败:', err);
    }
  }

  // 总结
  console.log(`\n✅ 完成! 生成了 ${skills.length} 个技能:`);
  for (const skill of skills) {
    console.log(`   - ${skill.metadata.id} (${skill.metadata.category}/${skill.metadata.subCategory})`);
  }
  console.log(`\n下一步: 运行 npm run deploy 部署到编辑器`);
  console.log(`       或 AI 自动补充技能的具体内容（示例、技术手段等）`);
}

main().catch(err => {
  console.error('[CWE-Gen] 致命错误:', err);
  process.exit(1);
});
