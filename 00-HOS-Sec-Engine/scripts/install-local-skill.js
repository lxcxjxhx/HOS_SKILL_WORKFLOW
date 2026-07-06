#!/usr/bin/env node
/**
 * HOS-Sec-Engine 本地 Skill 安装脚本
 * 
 * 从引擎源目录复制技能文件到 TRAE 项目级 skill 目录
 * 无需从 GitHub 下载，适用于本地开发环境
 * 
 * Usage:
 *   node scripts/install-local-skill.js
 *   node scripts/install-local-skill.js --target trae
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  gray: (t) => `\x1b[90m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
};

// 引擎根目录（脚本所在项目的 00-HOS-Sec-Engine 目录）
const ENGINE_DIR = path.resolve(__dirname, '..');
// 项目根目录（00-HOS-Sec-Engine 的父目录）
const PROJECT_DIR = path.resolve(ENGINE_DIR, '..');
// 源技能文件目录（引擎内的 .trae/skills）
const SOURCE_SKILL_DIR = path.join(ENGINE_DIR, '.trae', 'skills', 'hos-sec-engine');
// 目标 skill 目录（项目根目录的 .trae/skills）
const TARGET_SKILL_DIR = path.join(PROJECT_DIR, '.trae', 'skills', 'hos-sec-engine');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function generateMasterSkillMd() {
  return `---
name: hos-sec-engine
description: "HOS 攻防实战规则引擎 — 将实战经验转化为标准化、可执行的攻防流程，支持 Web/API/云/内网等多场景渗透测试"
license: MIT
metadata:
  author: HOS-Sec
  version: 0.5.1
  tags:
  - penetration-testing
  - security-audit
  - web-security
  - api-security
  - cloud-security
  - sql-injection
  - xss
  - ssrf
  - rce
  - jwt
  - waf-bypass
  - process-engine
  category: security
  subCategory: penetration-testing
  risk-level: high
  confidence: 0.95
---

# HOS-Sec-Engine: 攻防实战流程引擎

> 版本 **0.5.1** | 架构: Process Engine（流程引擎）
> 将实战经验转化为标准化、可执行的攻防规则

---

## 概述

HOS-Sec-Engine 是一个**流程驱动**的渗透测试引擎，以 YAML 流程模板为核心驱动力，通过决策树自动编排测试阶段，结合 MCP 工具注册表和 CVE 实时查询 API 实现自适应、可扩展的安全测试能力。

### 核心能力

- **流程驱动**: 加载 YAML 模板，自动按阶段执行渗透测试
- **决策树**: 根据阶段结果智能决定下一阶段
- **CVE 实时查询**: 动态关联已知漏洞，无需硬编码数据库
- **MCP 工具集成**: 通过工具注册表调用多种 MCP 工具
- **报告生成**: 输出 Markdown/HTML/JSON 格式的测试报告

---

## 何时使用

### 触发场景

- 需要对 Web 应用进行渗透测试（SQL注入、XSS、SSRF、文件上传、命令执行）
- 需要对 API 进行安全审计（JWT、OAuth、IDOR、速率限制）
- 需要对云配置进行安全审计（S3权限、IAM提权、元数据服务）
- 需要内网渗透和域信息收集
- 需要在渗透测试中绕WAF/过滤器
- 需要根据 CVE 实时关联已知漏洞

### 关键词

\`渗透测试\`, \`安全审计\`, \`SQL注入\`, \`XSS\`, \`SSRF\`, \`RCE\`, \`文件上传\`, \`JWT\`, \`OAuth\`, \`IDOR\`,
\`云安全\`, \`S3\`, \`IAM\`, \`容器逃逸\`, \`K8s\`, \`权限提升\`, \`内网渗透\`, \`AD域\`, \`代码审计\`,
\`waf bypass\`, \`penetration test\`, \`security audit\`, \`vulnerability assessment\`, \`pentest\`,
\`攻防演练\`, \`红蓝对抗\`, \`安全测试\`, \`漏洞扫描\`

---

## 工作流程

HOS-Sec-Engine 使用流程模板来驱动渗透测试。每个模板由多个阶段(phase)组成，每个阶段包含多个步骤(step)。

### Web 渗透测试流程

加载 \`web-pentest.yaml\` 模板，包含 7 个阶段：

| 阶段 | 内容 | 条件 |
|------|------|------|
| 1. reconnaissance | 首页采集、技术栈识别、敏感路径、API 发现 | 始终执行 |
| 2. sqli-detection | 报错注入、UNION、布尔盲注、时间盲注 | 始终执行 |
| 3. xss-detection | 反射型、img onerror、SVG、Unicode、CSP | 始终执行 |
| 4. ssrf-path-detection | 路径遍历、编码绕过、SSRF、元数据 | 始终执行 |
| 5. upload-rce-detection | 上传探测、扩展名绕过、命令注入 | 始终执行 |
| 6. exploitation | SQL 数据提取、SSRF 深入、XSS PoC | 条件执行 |
| 7. post-exploitation | 系统信息、敏感数据、数据库访问 | 条件执行 |

### API 安全审计流程

加载 \`api-security-audit.yaml\` 模板，包含 5 个阶段：

| 阶段 | 内容 |
|------|------|
| 1. jwt-auth-testing | None 算法、算法混淆、kid 注入 |
| 2. oauth-testing | CSRF、redirect_uri 绕过 |
| 3. idor-testing | 用户 IDOR、订单 IDOR、UUID 枚举 |
| 4. role-privilege-testing | 管理接口越权、HTTP 方法绕过 |
| 5. rate-limit-input-testing | 速率限制绕过、参数注入 |

### 云配置审计流程

加载 \`cloud-config-audit.yaml\` 模板，包含 5 个阶段：

| 阶段 | 内容 |
|------|------|
| 1. cloud-asset-discovery | S3 发现、CDN 识别、DNS 资产发现 |
| 2. s3-permission-testing | 列表读取、文件读取、写入权限 |
| 3. iam-permission-audit | PassRole、权限提升路径、服务角色 |
| 4. metadata-service-testing | IMDSv1、IAM 凭证提取、用户数据泄露 |
| 5. cloud-security-best-practices | 加密、日志、网络隔离 |

---

## 使用方式

### 命令行调用

\`\`\`bash
# 启动 Web 渗透测试
node dist/src/cli/index.js run --target http://example.com --template web-pentest

# 启动 API 安全审计
node dist/src/cli/index.js run --target http://api.example.com --template api-security-audit

# 启动云配置审计
node dist/src/cli/index.js run --target http://cloud.example.com --template cloud-config-audit
\`\`\`

### CLI 命令

- \`hos-sec-engine run\` — 运行渗透测试流程
  - \`--target\` / \`-t\`: 目标 URL
  - \`--template\` / \`-p\`: 流程模板 (web-pentest / api-security-audit / cloud-config-audit)
  - \`--output\` / \`-o\`: 报告输出目录
  - \`--verbose\` / \`-v\`: 详细输出模式

- \`hos-sec-engine server\` — 启动 Agent 通信服务器

### 编程调用

\`\`\`typescript
import { HosSecEngine } from 'hos-sec-engine';

const engine = new HosSecEngine();
const result = await engine.executeProcess({
  processId: 'web-pentest',
  target: 'http://example.com',
  variables: { target: 'http://example.com' }
});
console.log(result.summary);
\`\`\`

---

## 子技能列表

此 Skill 包含以下专项子技能，可根据场景自动匹配：

### Web 安全
- \`web-sqli-001\` — SQL 注入 WAF 绕过
- \`web-xss-001\` — XSS 过滤器绕过
- \`web-ssrf-001\` — SSRF 检测
- \`web-xxe-001\` — XXE 注入
- \`web-rce-001\` — 命令注入
- \`web-upload-001\` — 文件上传绕过
- \`web-deser-001\` — 反序列化漏洞

### API 安全
- \`api-jwt-001\` — JWT 攻击
- \`api-oauth-001\` — OAuth 攻击
- \`api-idor-001\` — IDOR 检测
- \`api-ratelimit-001\` — 速率限制绕过

### 云安全
- \`cloud-iam-001\` — IAM 权限提升
- \`cloud-meta-001\` — 云元数据 SSRF
- \`cloud-s3-001\` — S3 配置错误

### 系统安全
- \`linux-priv-esc-001\` — Linux 权限提升
- \`windows-priv-esc-001\` — Windows 权限提升
- \`ad-domain-enum-001\` — AD 域枚举
- \`container-docker-escape-001\` — Docker 容器逃逸
- \`k8s-misconfig-001\` — K8s 配置审计

### 其他
- \`code-review-java-deser-001\` — Java 反序列化代码审计
- \`mobile-android-apk-001\` — Android APK 逆向
- \`ai-prompt-injection-001\` — Prompt 注入绕过

---

## 核心机制

### 循环保护
- MAX_PHASE_ITERATIONS = 200 — 防止无限循环
- 自动检测阶段重复并终止

### 决策树
- 根据阶段结果动态决定下一阶段
- 支持条件跳转和跳过

### CVE 实时关联
- 自动查询最新 CVE 数据库
- 关联发现项与已知漏洞
- 24 小时缓存机制

### 报告生成
- Markdown 格式：阶段摘要、发现项、风险评级、建议
- 每个发现项包含：类型、描述、风险等级、CVE 关联、修复建议

---

## 参考

- [架构参考文档](./references/REFERENCE.md)
- 引擎源码: \`00-HOS-Sec-Engine/src/\`
- 流程模板: \`00-HOS-Sec-Engine/src/playbooks/process-templates/\`
`;
}

function main() {
  console.log(COLORS.cyan(`
+------------------------------------------+
|    HOS-Sec-Engine 本地 Skill 安装脚本     |
|    从本地源复制技能文件到 TRAE 项目级 skill |
+------------------------------------------+
`));

  console.log(`${COLORS.gray('Engine dir:')} ${ENGINE_DIR}`);
  console.log(`${COLORS.gray('Project dir:')} ${PROJECT_DIR}`);
  console.log('');

  // 检查源目录是否存在
  if (!fs.existsSync(SOURCE_SKILL_DIR)) {
    console.log(COLORS.red(`[Error] 源技能目录不存在: ${SOURCE_SKILL_DIR}`));
    console.log(COLORS.yellow('请确保在项目根目录下运行此脚本'));
    process.exit(1);
  }

  // 1. 创建目标目录并生成 SKILL.md
  console.log(COLORS.bold('Step 1: 创建 SKILL.md 入口文件...'));
  ensureDir(TARGET_SKILL_DIR);
  const skillMdPath = path.join(TARGET_SKILL_DIR, 'SKILL.md');
  fs.writeFileSync(skillMdPath, generateMasterSkillMd(), 'utf8');
  console.log(`  ${COLORS.green('✓')} SKILL.md -> ${skillMdPath}`);

  // 2. 复制参考文档
  console.log(COLORS.bold('Step 2: 复制参考文档...'));
  const refSrc = path.join(SOURCE_SKILL_DIR, 'references');
  const refDest = path.join(TARGET_SKILL_DIR, 'references');
  if (fs.existsSync(refSrc)) {
    const count = copyDir(refSrc, refDest);
    console.log(`  ${COLORS.green('✓')} references/ (${count} files)`);
  }

  // 3. 复制子技能文件（如果存在）
  console.log(COLORS.bold('Step 3: 复制子技能文件...'));
  const skillsSrc = path.join(SOURCE_SKILL_DIR, 'skills');
  const skillsDest = path.join(TARGET_SKILL_DIR, 'skills');
  if (fs.existsSync(skillsSrc)) {
    const count = copyDir(skillsSrc, skillsDest);
    console.log(`  ${COLORS.green('✓')} skills/ (${count} files)`);
  } else {
    console.log(`  ${COLORS.gray('⊘')} skills/ (不存在，流程引擎模式无需子技能文件)`);
  }

  // 4. 验证安装
  console.log(COLORS.bold('Step 4: 验证安装...'));
  const verifyFiles = [
    path.join(TARGET_SKILL_DIR, 'SKILL.md'),
  ];

  let allOk = true;
  for (const f of verifyFiles) {
    const exists = fs.existsSync(f);
    if (exists) {
      console.log(`  ${COLORS.green('✓')} ${path.relative(PROJECT_DIR, f)}`);
    } else {
      console.log(`  ${COLORS.red('✗')} ${path.relative(PROJECT_DIR, f)} (missing)`);
      allOk = false;
    }
  }

  console.log('');
  if (allOk) {
    console.log(COLORS.green(COLORS.bold('=== 安装完成 ===')));
    const relPath = path.relative(PROJECT_DIR, TARGET_SKILL_DIR);
    console.log(`Skill 已安装到: ${COLORS.cyan(relPath)}`);
    console.log(COLORS.gray('TRAE IDE 将自动识别此 project-level skill'));
  } else {
    console.log(COLORS.red(COLORS.bold('=== 安装不完整 ===')));
    console.log(COLORS.yellow('请检查源目录文件完整性'));
    process.exit(1);
  }
}

main();