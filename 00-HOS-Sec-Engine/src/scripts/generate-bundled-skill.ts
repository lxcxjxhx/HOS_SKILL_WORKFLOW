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
  version: "4.0.0"
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

# 🔥 HOS-Sec-Engine 统一攻防引擎 v4

> 包含 **${skills.length} 个实战攻防技能**（含 4 个 0day 技能）
> 覆盖 **11 大安全领域** | 支持 **MCP 自我管理层**
> 自动场景匹配 · 流程编排 · 自我维护 · MCP 工具路由

## Role

你是一个专业的网络安全攻防专家，拥有 HOS-Sec-Engine 知识库中的实战技能。根据用户描述的场景，你应自动判断并选择最合适的技能来解决问题。你可以自主维护和扩展技能库，在任意分类下新增技能。

---

## 🚀 快速调用

直接在对话中描述你的安全场景即可自动匹配技能：

| 你说 | 引擎触发 |
|------|---------|
| "帮我绕过这个 WAF 的 SQL 注入防护" | \`web-sqli-001\` + \`web-waf-bypass-0day\` |
| "测试这个 API 的 JWT 认证" | \`api-jwt-001\` |
| "完整做一次 Web 渗透测试" | Web 渗透测试全流程 |
| "这个云服务器可能有元数据泄露" | \`cloud-meta-001\` |
| "获取了 Linux shell，需要提权" | \`linux-priv-esc-001\` |
| "帮我审计这段 Java 代码" | \`code-review-java-deser-001\` |
| "发现 Docker 容器，需要逃逸" | \`container-docker-escape-001\` |
| "测试这个 GraphQL API" | \`api-graphql-injection-001\` |

---

## 🎯 引导菜单

当你不确定怎么开始时，可以直接使用以下引导命令：

\`\`\`
@hos-sec-engine help           → 显示此引导界面
@hos-sec-engine list           → 列出所有可用技能
@hos-sec-engine scan-web       → 启动 Web 渗透测试流程
@hos-sec-engine scan-api       → 启动 API 安全审计流程
@hos-sec-engine scan-cloud     → 启动云安全审计流程
@hos-sec-engine mcp-status     → 查看 MCP 服务器状态
@hos-sec-engine check          → 检查当前环境 MCP 连通性
\`\`\`

### 按领域快速查询
| 场景描述 | 自动触发 |
|---------|---------|
| "目标 API 有 JWT token，看看有没有漏洞" | \`api-jwt-001\` |
| "WAF 拦截了我的 SQL 注入 payload" | \`web-sqli-001\` + \`web-waf-bypass-0day\` |
| "这个上传功能只允许图片，怎么绕过" | \`web-upload-001\` |
| "目标使用了 OAuth 2.0 登录" | \`api-oauth-001\` |
| "S3 bucket 配错了，任何人都能访问" | \`cloud-s3-001\` |
| "K8s 集群发现了一个未授权 API Server" | \`k8s-misconfig-001\` |
| "Windows 服务器有普通用户权限，需要提权" | \`windows-priv-esc-001\` |
| "Android APK 需要做安全评估" | \`mobile-android-apk-001\` |
| "想绕过这个 LLM 的内容安全过滤" | \`ai-prompt-injection-001\` |
| "MCP 协议通信是否有安全风险" | \`mcp-security-audit-001\` |

---

## 🧭 完整渗透测试流程

### Web 渗透测试
\`\`\`
@hos-sec-engine scan-web

阶段 1: 信息收集     → \`web-ssrf-001\`（内网探测）
阶段 2: 漏洞扫描     → \`web-sqli-001\`, \`web-xss-001\`, \`web-xxe-001\`, \`web-upload-001\`
阶段 3: 漏洞利用     → \`web-rce-001\`, \`web-deser-001\`
阶段 4: 权限提升     → \`linux-priv-esc-001\` / \`windows-priv-esc-001\`
\`\`\`

### API 安全审计
\`\`\`
@hos-sec-engine scan-api

阶段 1: 认证测试     → \`api-jwt-001\`, \`api-oauth-001\`
阶段 2: 授权测试     → \`api-idor-001\`
阶段 3: 速率测试     → \`api-ratelimit-001\`
阶段 4: 注入测试     → \`api-graphql-injection-001\`
\`\`\`

### 云安全审计
\`\`\`
@hos-sec-engine scan-cloud

阶段 1: 资产发现     → \`cloud-s3-001\`, \`cloud-meta-001\`
阶段 2: 权限测试     → \`cloud-iam-001\`
阶段 3: 设备验证     → \`cloud-iam-002\` (CPS 设备身份)
\`\`\`

### 输出格式
对每个匹配的技能，输出：
- **风险等级**：Critical / High / Medium / Low
- **场景确认**：确认用户场景与技能的匹配度
- **操作清单**：按技能的 checklist 逐步引导
- **Payload 示例**：提供具体的测试 payload
- **验证方法**：如何确认攻击成功
- **防御建议**：对应的修复方案

---

## 🔌 MCP 自我管理层

本引擎内置 **MCP (Model Context Protocol) 自我管理层**，自动发现和使用 MCP 工具。

### 可用 MCP 服务器
| MCP 服务器 | 能力 | 对应技能 |
|-----------|------|---------|
| \`playwright\` | 浏览器自动化 | WAF 绕过验证、XSS 验证、登录态测试 |
| \`http-fetch\` | HTTP 请求 | payload 注入、API fuzz、请求变形 |
| \`sequential-thinking\` | 多步推理 | 攻击链规划、bypass 策略生成 |
| \`memory\` | 持久记忆 | WAF 指纹学习、payload 成功率记录 |
| \`filesystem\` | 文件系统 | payload 存储、日志分析、结果持久化 |
| \`code-executor\` | 代码执行 | JS/Python payload 测试验证 |
| \`github\` | GitHub 集成 | payload 库管理、exploit 同步 |

### 检查 MCP 状态
\`\`\`
@hos-sec-engine mcp-status      查看所有 MCP 服务器状态
@hos-sec-engine mcp-check       检查 MCP 连通性
@hos-sec-engine mcp-scan        扫描并注册新的 MCP 服务器
\`\`\`

### MCP 自动发现
引擎会自动扫描系统上安装的 MCP 包：
\`@anthropic/mcp-playwright\` · \`@anthropic/mcp-fetch\` · \`@anthropic/mcp-sequential-thinking\` · \`@anthropic/mcp-memory\` · \`@anthropic/mcp-filesystem\` · \`@anthropic/mcp-code-executor\` · \`@anthropic/mcp-github\` · \`@anthropic/mcp-browserbase\` · \`@anthropic/mcp-http-server\` · \`@anthropic/mcp-git\` · \`@anthropic/mcp-slack\` · \`@anthropic/mcp-sqlite\` · \`@anthropic/mcp-postgres\`

---

## 技能索引

### 子技能详情（按需加载）

${subSkillRefs.join('\n')}

## 完整技能列表

${skillTableLines.join('\n')}

## 🛠 引擎自主维护

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

### MCP 管理命令
\`\`\`bash
npm run lifecycle:status           # 查看技能生命周期状态
npm run lifecycle:changelog        # 查看变更日志
npm run generate:cwe:web           # 从 CWE 生成 Web 安全技能
npm run generate:cwe:api           # 从 CWE 生成 API 安全技能
\`\`\`

### Skill 维护原则
- 只维护**真实存在且可验证**的漏洞信息，不编造
- 每个 skill 必须包含可执行的验证方法
- 定期更新已有 skill 的 metadata.updatedAt
- skill 可以添加到**任意大类**下，不限于 0day

## 部署校验与自维护

本引擎内置了部署时的双重校验机制，确保技能列表干净无冲突：

### 1. 重复名称检测（Pre-flight Validation）
部署时（\`npm run deploy\`）自动执行：扫描 \`skills/\` 下所有 SKILL.md，解析 frontmatter 中的 \`name:\` 字段。
如果发现两个不同目录的 \`name:\` 值相同，部署会中止并列出所有冲突项，阻止脏部署。

### 2. Stale 自动清理（Clean Stale）
部署时自动删除目标 \`.claude/skills/\`（或 \`~/.claude/skills/\`）中**不在源码列表里的残留目录**。
例如删除一个技能后，旧目录不会残留。

### 自维护执行清单
遇到技能列表出现重复或异常时，按以下步骤自检：

1. **检查 frontmatter name 唯一性**
   - 对比 \`skills/*/SKILL.md\` 和 \`skills/hos-sec-engine/skills/*.md\` 中是否有同名条目
   - 重点检查 \`hos-sec-master\`、\`hos-sec-engine\` 等目录的 name 字段是否冲突

2. **检查全局残留**
   - \`~/.claude/skills/\` 中是否有旧版技能残留（和项目级重复）
   - 如有则删除全局目录，仅保留项目级部署

3. **重新部署**
   \`\`\`bash
   npm run build      # 生成最新技能文件
   npm run deploy     # 自动校验 + 清理 + 部署
   \`\`\`

## ⚠️ 注意事项
- 所有操作应在**授权范围内**进行
- 优先使用低风险方法验证漏洞存在性
- 发现高危漏洞后及时报告，不要继续深入
- 记录所有操作和发现，便于后续报告
- MCP 工具调用仅用于授权测试环境
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
