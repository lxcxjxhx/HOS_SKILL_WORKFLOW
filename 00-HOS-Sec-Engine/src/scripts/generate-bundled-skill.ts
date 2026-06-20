/**
 * HOS-Sec-Engine - Bundled Skill Generator
 * 
 * Generates a unified `hos-sec-engine` skill that contains all 22 skills
 * merged into a single folder for clean IDE skill panel organization.
 * 
 * Output:
 *   - dist/skills/hos-sec-engine/ (nested, for TypeScript Engine)
 *   - skills/hos-sec-engine/ (flat, for npx skills / IDE installation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { allSkills } from '../skills';
import type { AttackDefenseSkill } from '../types/skill';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Nested output directory (dist/skills/) */
const NESTED_OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'dist', 'skills');

/** Flat output directory (skills/) */
const FLAT_OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'skills');

/** Project root */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Repo root (parent of 00-HOS-Sec-Engine) */
const REPO_ROOT = path.resolve(PROJECT_ROOT, '..');

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

const CATEGORY_NAMES: Record<string, string> = {
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
description: HOS-Sec-Engine 统一攻防引擎，包含 22 个实战安全技能。根据用户描述的场景自动匹配最合适的技能，支持 SQL 注入 WAF 绕过、XSS、SSRF、XXE、文件上传绕过、RCE、反序列化、JWT 攻击、OAuth 漏洞、IDOR、速率限制绕过、云配置错误、IAM 权限提升、元数据 SSRF、Windows/Linux 提权、AD 域信息收集、代码审计、Docker 容器逃逸、K8s 配置审计、Prompt 注入、Android APK 分析等攻防能力。
license: MIT
metadata:
  author: HOS Team
  version: "3.0.0"
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

> 包含 22 个攻防实战技能，根据场景自动路由到最合适的技能。

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
// Copy 0day-skills directory from source
// ---------------------------------------------------------------------------

function copyDirSync(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Generate 0day-skills placeholder structure (fallback)
// ---------------------------------------------------------------------------

function generate0daySkillsPlaceholder(): string {
  return `---
name: 0day-skills
description: HOS-Sec-Engine 0day 专属技能目录。由 /hos-sec-master 自主维护更新热门 0day 漏洞专属技能。
---

# 0day 专属技能

> 本目录由 AI 通过 /hos-sec-master 自主维护，包含最新热门 0day 漏洞的专属攻防技能。
>
> **维护流程**:
> 1. 在 \`src/skills/hos-sec-master/0day-skills/\` 下创建 .ts 文件
> 2. 参照现有 TS skill 模板的 AttackDefenseSkill 六层结构
> 3. 运行 \`npm run build\` 编译并生成 SKILL.md
> 4. 运行 \`npm run deploy\` 部署到 IDE
`;
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

  // 1. Generate main SKILL.md
  const bundledContent = generateBundledSkillMd(skills);

  // Nested: dist/skills/hos-sec-engine/SKILL.md
  const nestedDir = path.join(NESTED_OUTPUT_DIR, 'hos-sec-engine');
  const nestedMdPath = path.join(nestedDir, 'SKILL.md');
  writeOutput(nestedMdPath, bundledContent);
  generated.push(nestedMdPath);
  console.log(`  [NESTED] ${nestedMdPath}`);

  // Flat: skills/hos-sec-engine/SKILL.md
  const flatDir = path.join(FLAT_OUTPUT_DIR, 'hos-sec-engine');
  const flatMdPath = path.join(flatDir, 'SKILL.md');
  writeOutput(flatMdPath, bundledContent);
  generated.push(flatMdPath);
  console.log(`  [FLAT]   ${flatMdPath}`);

  // 2. Generate sub-skill detail files
  const nestedSkillsDir = path.join(nestedDir, 'skills');
  const flatSkillsDir = path.join(flatDir, 'skills');

  for (const skill of skills) {
    const subSkillContent = generateSubSkillMd(skill);
    const fileName = `${skill.metadata.id}.md`;

    const nestedSubPath = path.join(nestedSkillsDir, fileName);
    writeOutput(nestedSubPath, subSkillContent);
    generated.push(nestedSubPath);

    const flatSubPath = path.join(flatSkillsDir, fileName);
    writeOutput(flatSubPath, subSkillContent);
    generated.push(flatSubPath);
  }
  console.log(`  Generated ${skills.length} sub-skill detail files`);

  // 3. Sync 0day-skills directory from source
  const src0dayDir = path.join(PROJECT_ROOT, 'src', 'skills', 'hos-sec-master', '0day-skills');
  const nested0dayDir = path.join(nestedDir, '0day-skills');
  const flat0dayDir = path.join(flatDir, '0day-skills');

  if (fs.existsSync(src0dayDir)) {
    copyDirSync(src0dayDir, nested0dayDir);
    generated.push(nested0dayDir);
    console.log(`  [0DAY-NESTED] Copied 0day-skills to ${nested0dayDir}`);

    copyDirSync(src0dayDir, flat0dayDir);
    generated.push(flat0dayDir);
    console.log(`  [0DAY-FLAT] Copied 0day-skills to ${flat0dayDir}`);
  } else {
    writeOutput(path.join(nested0dayDir, 'README.md'), generate0daySkillsPlaceholder());
    writeOutput(path.join(flat0dayDir, 'README.md'), generate0daySkillsPlaceholder());
  }

  // 4. Sync references
  const nestedRefDir = path.join(nestedDir, 'references');
  const nestedRefPath = path.join(nestedRefDir, 'REFERENCE.md');
  // Copy from existing reference if available
  const existingRefPath = path.join(NESTED_OUTPUT_DIR, 'references', 'REFERENCE.md');
  if (fs.existsSync(existingRefPath)) {
    writeOutput(nestedRefPath, fs.readFileSync(existingRefPath, 'utf-8'));
    generated.push(nestedRefPath);
  }

  const flatRefDir = path.join(flatDir, 'references');
  const flatRefPath = path.join(flatRefDir, 'REFERENCE.md');
  const existingFlatRefPath = path.join(FLAT_OUTPUT_DIR, 'references', 'REFERENCE.md');
  if (fs.existsSync(existingFlatRefPath)) {
    writeOutput(flatRefPath, fs.readFileSync(existingFlatRefPath, 'utf-8'));
    generated.push(flatRefPath);
  }

  // 5. Sync to repo root skills/ directory
  const repoRootSkillsDir = path.join(REPO_ROOT, 'skills', 'hos-sec-engine');
  const repoMdPath = path.join(repoRootSkillsDir, 'SKILL.md');
  writeOutput(repoMdPath, bundledContent);
  generated.push(repoMdPath);

  const repoSkillsDir = path.join(repoRootSkillsDir, 'skills');
  for (const skill of skills) {
    const fileName = `${skill.metadata.id}.md`;
    const srcPath = path.join(flatSkillsDir, fileName);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(repoSkillsDir, fileName);
      writeOutput(destPath, fs.readFileSync(srcPath, 'utf-8'));
      generated.push(destPath);
    }
  }

  const repo0dayDir = path.join(repoRootSkillsDir, '0day-skills');
  if (fs.existsSync(src0dayDir)) {
    copyDirSync(src0dayDir, repo0dayDir);
    generated.push(repo0dayDir);
    console.log(`  [0DAY-ROOT] Copied 0day-skills to ${repo0dayDir}`);
  } else {
    const repo0dayPlaceholder = path.join(repo0dayDir, 'README.md');
    writeOutput(repo0dayPlaceholder, generate0daySkillsPlaceholder());
    generated.push(repo0dayPlaceholder);
  }

  const repoRefDir = path.join(repoRootSkillsDir, 'references');
  if (fs.existsSync(flatRefPath)) {
    const repoRefPath = path.join(repoRefDir, 'REFERENCE.md');
    writeOutput(repoRefPath, fs.readFileSync(flatRefPath, 'utf-8'));
    generated.push(repoRefPath);
  }

  console.log(`[bundled-skill] Done. Generated ${generated.length} file(s).`);
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
