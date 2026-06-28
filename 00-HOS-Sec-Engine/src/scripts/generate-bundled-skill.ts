/**
 * HOS-Sec-Engine - Bundled Skill Generator
 *
 * Generates a unified `hos-sec-engine` skill that references all sub-skills
 * in a single folder for clean IDE skill panel organization.
 *
 * Output:
 *   - skills/hos-sec-engine/ (flat, for npx skills / IDE installation)
 *
 * Source of Truth: TypeScript skill definitions in src/skills/
 */

import * as fs from 'fs';
import * as path from 'path';
import { allSkills } from '../skills';
import type { AttackDefenseSkill } from '../types/skill';
import { CATEGORY_NAMES } from '../config/skill-categories';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Output directory for generated bundled skill (project root skills/) */
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'skills');

/** Project root */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeOutput(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Generate main SKILL.md for bundled skill
// ---------------------------------------------------------------------------

function generateBundledSkillMd(skills: AttackDefenseSkill[]): string {
  // Group skills by category
  const byCategory = new Map<string, AttackDefenseSkill[]>();
  for (const skill of skills) {
    const cat = skill.metadata.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  // Build skill index table
  const skillTableLines: string[] = [];
  for (const [category, catSkills] of byCategory) {
    const catName = CATEGORY_NAMES[category] || category;
    skillTableLines.push(`### ${catName}`, '');
    skillTableLines.push('| Skill ID | 名称 | 适用场景 |');
    skillTableLines.push('|----------|------|----------|');
    for (const skill of catSkills) {
      const scenario = skill.trigger.scenarios[0] || '';
      const scenarioShort = scenario.length > 60 ? scenario.slice(0, 57) + '...' : scenario;
      skillTableLines.push(`| \`${skill.metadata.id}\` | ${skill.metadata.name} | ${scenarioShort} |`);
    }
    skillTableLines.push('');
  }

  // Build sub-skill file references
  const subSkillRefs: string[] = [];
  for (const skill of skills) {
    subSkillRefs.push(`- [${skill.metadata.id}](skills/${skill.metadata.id}.md) - ${skill.metadata.name}`);
  }

  return `---
name: hos-sec-engine
description: HOS-Sec-Engine 统一攻防引擎。根据用户描述的场景自动匹配最合适的攻防技能，支持完整渗透测试流程编排。包含 ${skills.length} 个实战攻防技能（含 4 个 0day 技能），覆盖 Web、API、云、系统、容器、移动和 AI 安全领域。
license: MIT
metadata:
  author: HOS Team
  version: "3.1.0"
  tags:
    - security
    - offense-defense
    - penetration-testing
    - waf-bypass
    - privilege-escalation
    - web-security
    - api-security
    - cloud-security
    - skill
  category: security
  risk-level: critical
  confidence: 0.95
---

# HOS-Sec-Engine 统一攻防引擎

> 包含 ${skills.length} 个实战攻防技能（含 4 个 0day 技能），根据场景自动路由到最合适的技能。

## Role

你是一个专业的网络安全攻防专家，拥有 HOS-Sec-Engine 知识库中的实战技能。根据用户描述的场景，你应自动判断并选择最合适的技能来解决问题。你可以自主维护和扩展技能库，在任意分类下新增技能。

## 使用方式

当用户描述安全场景时，自动判断并选择最合适的技能。

### 快速调用示例
- "帮我绕过这个 WAF 的 SQL 注入防护" → 使用 \`web-sqli-001\`
- "测试这个 API 的 JWT 认证" → 使用 \`api-jwt-001\`
- "完整做一次 Web 渗透测试" → 执行 Web 渗透测试流程
- "这个云服务器可能有元数据泄露" → 使用 \`cloud-meta-001\`
- "帮我审计这段 Java 代码的反序列化问题" → 使用 \`code-review-java-deser-001\`
- "发现 Docker 容器，需要逃逸到宿主机" → 使用 \`container-docker-escape-001\`
- "获取了 Linux 普通用户 shell，需要提权" → 使用 \`linux-priv-esc-001\`

## 技能索引

### 子技能详情（按需加载）

${subSkillRefs.join('\n')}

## 完整技能列表

${skillTableLines.join('\n')}

## 工作流程

### 1. 场景匹配
当用户描述安全场景时，按以下优先级匹配：
1. **精确匹配**：用户明确提到漏洞类型或技能名称
2. **关键词匹配**：用户描述中包含技能相关的技术术语
3. **场景推断**：根据业务场景推断可能的攻击面

### 2. 多技能组合
如果一个场景涉及多个攻击面，按攻防流程顺序依次应用相关技能：
- **信息收集阶段**：先侦察，再扫描
- **漏洞发现阶段**：根据技术栈选择对应技能
- **漏洞利用阶段**：选择可利用性最高的技能
- **权限提升阶段**：根据已获取的访问级别选择提权技能

### 3. 输出格式
对每个匹配的技能，输出：
- **风险等级**：Critical / High / Medium / Low
- **场景确认**：确认用户场景与技能的匹配度
- **操作清单**：按技能的 checklist 逐步引导
- **Payload 示例**：提供具体的测试 payload
- **验证方法**：如何确认攻击成功
- **防御建议**：对应的修复方案

## Web 渗透测试流程
1. **信息收集** → \`web-ssrf-001\`（内网探测）
2. **漏洞扫描** → \`web-sqli-001\`, \`web-xss-001\`, \`web-xxe-001\`, \`web-upload-001\`
3. **漏洞利用** → \`web-rce-001\`, \`web-deser-001\`
4. **权限提升** → \`linux-priv-esc-001\` 或 \`windows-priv-esc-001\`

## API 安全审计流程
1. **认证测试** → \`api-jwt-001\`, \`api-oauth-001\`
2. **授权测试** → \`api-idor-001\`
3. **速率测试** → \`api-ratelimit-001\`

## 云安全审计流程
1. **资产发现** → \`cloud-s3-001\`, \`cloud-meta-001\`
2. **权限测试** → \`cloud-iam-001\`

## Skill 自主维护与扩展

作为攻防专家，你可以自主维护和扩展 HOS-Sec-Engine 的技能库。本系统支持在**任意大类**下新增 skill（不限于 0day），包括 Web、API、Cloud、Windows、Linux、AI、Container、Kubernetes、Mobile 等所有分类。

### 技能扩展流程

#### 第一步：确定 skill 所属大类
根据新技能的技术领域，选择对应的源码目录（\`src/skills/{category}/\`）。

#### 第二步：创建 TS 文件
参照现有 skill 模板（如 \`src/skills/web/sqli/sqli-waf-bypass.ts\`），创建包含完整 AttackDefenseSkill 六层结构的 TS 文件。

#### 第三步：注册到 index.ts
在该大类的 \`index.ts\` 中添加加载逻辑（参照现有模式）。

#### 第四步：编译生成
\`\`\`bash
npm run build
\`\`\`
编译后自动完成：TypeScript 编译 → 生成 SKILL.md → 更新索引。

#### 第五步：部署到 IDE
\`\`\`bash
npm run deploy -- --trae --global
\`\`\`

### Skill 维护原则
- 只维护**真实存在且可验证**的漏洞信息，不编造
- 每个 skill 必须包含可执行的验证方法
- 定期更新已有 skill 的 metadata.updatedAt
- skill 可以添加到**任意大类**下，不限于 0day

## 注意事项
- 所有操作应在**授权范围内**进行
- 优先使用低风险方法验证漏洞存在性
- 发现高危漏洞后及时报告，不要继续深入
- 记录所有操作和发现，便于后续报告
`;
}

// ---------------------------------------------------------------------------
// Generate individual sub-skill detail files
// ---------------------------------------------------------------------------

function generateSubSkillMd(skill: AttackDefenseSkill): string {
  const lines: string[] = [
    `# ${skill.metadata.name}`,
    '',
    `**ID**: \`${skill.metadata.id}\` | **分类**: ${skill.metadata.category} | **风险等级**: ${skill.metadata.riskLevel}`,
    '',
    skill.knowledge.description,
    '',
  ];

  if (skill.trigger.scenarios.length > 0) {
    lines.push('## 触发场景', '');
    for (const s of skill.trigger.scenarios) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  if (skill.action.checklist.length > 0) {
    lines.push('## 操作检查清单', '');
    for (let i = 0; i < skill.action.checklist.length; i++) {
      lines.push(`${i + 1}. ${skill.action.checklist[i]}`);
    }
    lines.push('');
  }

  if (skill.action.techniques.length > 0) {
    lines.push('## 技术手段', '');
    for (const t of skill.action.techniques) {
      lines.push(`- ${t}`);
    }
    lines.push('');
  }

  if (skill.knowledge.symptoms.length > 0) {
    lines.push('## 症状', '');
    for (const s of skill.knowledge.symptoms) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  if (skill.knowledge.rootCauses.length > 0) {
    lines.push('## 根因分析', '');
    for (const r of skill.knowledge.rootCauses) {
      lines.push(`- ${r}`);
    }
    lines.push('');
  }

  if (skill.action.examples.length > 0) {
    lines.push('## 示例', '');
    for (const ex of skill.action.examples) {
      lines.push(`### ${ex.name}`, '');
      if (ex.description) {
        lines.push(ex.description, '');
      }
      lines.push('```', ex.content, '```', '');
    }
  }

  if (skill.validation.successSigns.length > 0) {
    lines.push('## 成功标志', '');
    for (const s of skill.validation.successSigns) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  if (skill.defense.recommendations.length > 0) {
    lines.push('## 防御建议', '');
    for (const r of skill.defense.recommendations) {
      lines.push(`- ${r}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function generateBundledSkill(): string[] {
  const skills = allSkills.filter(s => s.enabled !== false);

  if (skills.length === 0) {
    console.warn('[bundled-skill] No skills available. Skipping bundled skill generation.');
    return [];
  }

  const generated: string[] = [];

  console.log(`[bundled-skill] Generating unified hos-sec-engine skill for ${skills.length} skills...`);

  // 1. Generate main SKILL.md -> skills/hos-sec-engine/SKILL.md
  const bundledContent = generateBundledSkillMd(skills);
  const flatDir = path.join(OUTPUT_DIR, 'hos-sec-engine');
  const flatMdPath = path.join(flatDir, 'SKILL.md');
  writeOutput(flatMdPath, bundledContent);
  generated.push(flatMdPath);
  console.log(`  [SKILL.md] ${flatMdPath}`);

  // 2. Generate sub-skill detail files -> skills/hos-sec-engine/skills/
  const flatSkillsDir = path.join(flatDir, 'skills');
  for (const skill of skills) {
    const subSkillContent = generateSubSkillMd(skill);
    const fileName = `${skill.metadata.id}.md`;
    const flatSubPath = path.join(flatSkillsDir, fileName);
    writeOutput(flatSubPath, subSkillContent);
    generated.push(flatSubPath);
  }
  console.log(`  Generated ${skills.length} sub-skill detail files`);

  // 3. Sync references -> skills/hos-sec-engine/references/REFERENCE.md
  const flatRefDir = path.join(flatDir, 'references');
  const flatRefPath = path.join(flatRefDir, 'REFERENCE.md');
  const existingRefPath = path.join(OUTPUT_DIR, 'references', 'REFERENCE.md');
  if (fs.existsSync(existingRefPath)) {
    writeOutput(flatRefPath, fs.readFileSync(existingRefPath, 'utf-8'));
    generated.push(flatRefPath);
  }

  console.log(`[bundled-skill] Done. Generated ${generated.length} file(s).`);

  // Generate legacy hos-sec-master as a copy of hos-sec-engine for backward compatibility
  const enginePath = path.join(OUTPUT_DIR, 'hos-sec-engine', 'SKILL.md');
  const masterDir = path.join(OUTPUT_DIR, 'hos-sec-master');
  const masterPath = path.join(masterDir, 'SKILL.md');
  if (fs.existsSync(enginePath)) {
    ensureDir(masterDir);
    fs.copyFileSync(enginePath, masterPath);
    console.log(`  [LEGACY] ${masterPath}`);
  }

  return generated;
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

if (require.main === module) {
  try {
    generateBundledSkill();
  } catch (error) {
    console.error('[bundled-skill] Generation failed:', error);
    process.exit(1);
  }
}
