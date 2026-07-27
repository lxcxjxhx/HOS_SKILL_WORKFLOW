# 🧠 HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer

> **阻止 AI 用 MOCK/regex/静态数据伪造系统可运行性**
>
> **强制 AI 在不确定时"停下来问"，而不是"编一个能跑的假系统"**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Compatibility](https://img.shields.io/badge/compatible-Claude%20Code%20%7C%20Cursor%20%7C%20Windsurf%20%7C%20GitHub%20Copilot%20%7C%20Trae--CN-orange)

---

## 📋 概述

HOS-Silly-Mock 是一个 **Reality Enforcement Layer（真实强制执行层）**，专门用于检测和阻止 AI 生成代码中的虚假确定性。

### 核心哲学

```
❌ 阻止 AI 用"编造确定性"替代"不确定真实系统"
✅ 强制 AI 诚实表达不确定性
```

---

## ✨ 特性

### 4 层防御系统

| 层级 | 名称 | 功能 |
|------|------|------|
| **Layer 1** | MOCK 显性化强制器 | 检测未经标注的 mock 数据、catch→mock 模式 |
| **Layer 2** | Regex 禁用反射器 | 禁止 regex 用于结构化数据解析（JSON/HTML/XML） |
| **Layer 3** | 真实连接强制器 | 强制每个变量绑定 source → transform → sink 三元组 |
| **Layer 4** | 沉默失败检测器 | 检测"完整但不真实"的逻辑链 |

### 核心能力

- ✅ **静态分析扫描**: AST 级别识别 mock 数据模式
- ✅ **正则上下文分析**: 判断 regex 是否用于结构化解析
- ✅ **数据流追踪**: 追踪变量 source → sink 链路完整性
- ✅ **Reality Score 评分**: 0-100 分量化数据真实性
- ✅ **多格式输出**: JSON / Markdown / Console 报告
- ✅ **CI/CD 集成**: 作为质量门禁阻断低分代码

---

## 📦 安装

### 作为 AI IDE Skill

#### Claude Code

```bash
# 复制到 Claude Code skills 目录
mkdir -p .claude/skills/hos-silly-mock
cp SKILL.md .claude/skills/hos-silly-mock/
```

#### Cursor

```bash
# 复制到 Cursor rules 目录
mkdir -p .cursor/rules
cp SKILL.md .cursor/rules/hos-silly-mock.md
```

#### Windsurf

```bash
# 复制到 Windsurf rules 目录
mkdir -p .windsurf/rules
cp SKILL.md .windsurf/rules/hos-silly-mock.md
```

#### GitHub Copilot

```bash
# 复制到 GitHub Copilot instructions
mkdir -p .github/copilot-instructions
cp SKILL.md .github/copilot-instructions/hos-silly-mock.md
```

#### Trae-CN

```bash
# 复制到 Trae skills 目录
mkdir -p .trae/skills
cp SKILL.md .trae/skills/hos-silly-mock.md
```

### 作为 NPM 包（开发中）

```bash
npm install hos-silly-mock
```

### 作为 CLI 工具（开发中）

```bash
npx hos-silly-mock analyze src/**/*.ts
```

---

## 🚀 使用

### TypeScript API

```typescript
import { enforce, enforceCode, enforceText } from 'hos-silly-mock';

// 分析文件
const result = enforce('/path/to/your/file.ts');
console.log(`Reality Score: ${result.realityScore}/100`);

// 分析代码字符串
const code = `
const users = [
  { id: 1, name: 'Alice' },  // ← MOCK!
];
`;
const result2 = enforceCode(code, 'example.ts');

// 检查结果
if (!result2.passed) {
  for (const finding of result2.findings) {
    console.log(`[${finding.layer}] ${finding.message}`);
    console.log(`  Fix: ${finding.suggestion}`);
  }
}
```

### CLI 使用

```bash
# 分析单个文件
npx hos-silly-mock src/app.ts

# 分析多个文件
npx hos-silly-mock src/**/*.ts

# JSON 输出
npx hos-silly-mock --json src/app.ts

# Markdown 输出
npx hos-silly-mock --markdown src/app.ts
```

---

## 🧱 4 层防御详解

### Layer 1: MOCK 显性化强制器

检测未经标注的 mock 数据、catch→mock 模式、mock 命名模式。

```typescript
// ❌ 错误 — 无标注 mock
const users = [{ id: 1, name: 'Alice' }];

// ✅ 正确 — 显式标注
/**
 * MOCK_MODE: TRUE
 * reason: /api/users not deployed yet
 */
const users = await fetch('/api/users').catch(() => []);
```

### Layer 2: Regex 禁用反射器

检测 regex 用于 JSON/HTML/XML/CSV/URL 解析。

```typescript
// ❌ 错误 — regex 解析 JSON
const name = jsonStr.match(/"name"\s*:\s*"([^"]+)"/)?.[1];

// ✅ 正确 — 标准解析器
const data = JSON.parse(jsonStr);
const name = data.name;
```

### Layer 3: 真实连接强制器

强制每个变量绑定 source → transform → sink 三元组。

```typescript
// ❌ 错误 — 变量无 source
const users = transformData(someData);

// ✅ 正确 — 完整链路
const rawUsers = await api.getUsers();         // source
const processed = rawUsers.map(normalize);     // transform
renderUserList(processed);                     // sink
```

### Layer 4: 沉默失败检测器

检测"完整但不真实"的系统。

```typescript
// ❌ 错误 — 沉默失败
function processOrders() {
  const orders = getOrders();      // 可能失败但不处理
  return { total, updated };       // 无错误路径
}

// ✅ 正确 — 错误显式化
async function processOrders() {
  try {
    const orders = await getOrders();
    if (!orders.length) throw new Error('No orders');
    return process(orders);
  } catch (err) {
    throw err;
  }
}
```

---

## 📊 Reality Score 报告

每次分析输出 Reality Score 报告：

```
╔═══════════════════════════════════════════════╗
║      HOS-Silly-Mock Reality Report            ║
╠═══════════════════════════════════════════════╣
║  Reality Score:        ████████░░  82/100     ║
║  Data Authenticity:    ███████░░░  75/100     ║
║  ═══════════════════════════════════════════  ║
║  Mock Leakage Risk:    LOW                    ║
║  Regex Abuse Risk:     LOW                    ║
║  Silent Failure Risk:  NO                     ║
║  Reality Binding:      PASS                   ║
╠═══════════════════════════════════════════════╣
║  Findings: 3 warnings, 0 errors               ║
╚═══════════════════════════════════════════════╝
```

### 评分阈值建议

| 环境 | Reality Score 阈值 | 含义 |
|------|-------------------|------|
| 开发 | ≥ 50 | 允许有标注的 mock |
| 预发布 | ≥ 70 | 大部分 mock 应移除 |
| 生产 | ≥ 80 | 禁止未经标注的 mock |
| CI 阻断 | < 50 | 拒绝提交 |

---

## ⚙️ 配置

```typescript
import { enforce, DEFAULT_CONFIG } from 'hos-silly-mock';

const config = {
  ...DEFAULT_CONFIG,
  scoreThreshold: 70,           // 生产环境更严格
  mock: {
    ...DEFAULT_CONFIG.mock,
    largeDataThreshold: 5,      // 5 行以上才算大数组
  },
  allowTestExemption: true,
  testExemptionMarker: '@silly-mock:allow',
};

const result = enforce('/path/to/file.ts', config);
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `scoreThreshold` | number | 60 | Reality Score 阈值 |
| `mock.largeDataThreshold` | number | 3 | 大数据结构行数阈值 |
| `allowTestExemption` | boolean | true | 测试文件豁免 |
| `testExemptionMarker` | string | '@silly-mock:allow' | 豁免标记 |

---

## 🤖 AI Agent 集成

在 AI Agent 的 system prompt 中注入：

```
You are HOS-Silly-Mock Enforcement Engine.

Rules:
1. NEVER use mock data unless explicitly marked MOCK_MODE: TRUE
2. NEVER use regex for structured parsing
3. NEVER continue logic without real I/O source
4. NEVER silently simulate system completeness

If any check fails → STOP → Request real input or system boundary clarification.

You must prefer:
- HALT over hallucination
- INCOMPLETE over fake completeness
- ERROR over silent fake success
```

---

## 🧪 运行测试

```bash
npm test
npm run test:manual  # 交互式手动测试
```

---

## 🔗 与 HOS-Sec-Engine 集成

此 Skill 可被 HOS-Sec-Engine 自动发现：

```bash
# 构建
npm run build

# 部署到 Claude
npx hos-sec-engine deploy --claude

# 部署到全局
npx hos-sec-engine deploy --global
```

---

## 📚 参考

- [HOS-Sec-Engine](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW)
- OWASP Code Review Guide
- "AI Completeness Bias" — O'Reilly AI Engineering 2025
- CWE-1104: Use of Unmaintainable Code for Input Validation

---

## 📄 许可

MIT License - 用于授权的安全测试、CTF 竞赛和教育场景。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ by HOS-Sec-Engine**
