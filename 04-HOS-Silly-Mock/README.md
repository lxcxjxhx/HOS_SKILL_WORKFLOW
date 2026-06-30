# 🧠 HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer

> **阻止 AI 用 MOCK/regex/静态数据伪造系统可运行性**
>
> **强制 AI 在不确定时"停下来问"，而不是"编一个能跑的假系统"**

[![HOS-Sec-Engine](https://img.shields.io/badge/HOS-Sec--Engine-blue)](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚨 问题

AI 生成代码的三大致命问题：

| # | 问题 | 表现 | 后果 |
|---|------|------|------|
| 1 | **MOCK 污染** | API 没接→写假数据，UI 没后端→填 demo json | 不可维护的假系统 |
| 2 | **Regex 硬编码** | JSON parse→regex, HTML→regex, log→regex | 脆弱解析，易崩溃 |
| 3 | **沉默失败** | 不报错，继续写完整系统，但系统是假的 | 生产事故 |

## 🎯 解决方案

**HOS-Silly-Mock** 是一个 **Reality Enforcement Layer（真实强制执行层）**，在 AI 生成代码时进行 4 层防御检测：

```
┌──────────────────────────────────────────────────────┐
│                 HOS-Silly-Mock                        │
│                                                       │
│  Layer 1: MOCK显性化强制器                             │
│  Layer 2: Regex禁用反射器                              │
│  Layer 3: 真实连接强制器                                │
│  Layer 4: 沉默失败检测器                                │
└──────────────────────────────────────────────────────┘
```

---

## 📦 安装

### 作为 Claude Code Skill

将 `SKILL.md` 复制到 `.claude/skills/hos-silly-mock-001/` 目录：

```bash
# 使用 HOS-Sec-Engine 部署
npx hos-sec-engine deploy --claude

# 或手动复制
mkdir -p .claude/skills/hos-silly-mock-001
cp SKILL.md .claude/skills/hos-silly-mock-001/
```

### 作为 NPM 包

```bash
npm install hos-silly-mock
```

### 作为 CLI 工具

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

## 📊 Reality Score

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

## 🔧 配置

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

## 📄 许可

MIT License — 用于授权的安全测试、CTF 竞赛和教育场景。
