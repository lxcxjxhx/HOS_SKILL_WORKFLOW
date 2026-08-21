---
name: HOS-Silly-Mock
description: "Anti-Fake Data & Anti-Regex Reality Enforcement Layer — 阻止 AI 用 MOCK/regex/静态数据伪造系统可运行性，强制 AI 在不确定时停下来问而非编造假系统"
version: "1.0.0"
author: HOS-Sec-Engine
license: MIT
compatibility:
  - claude-code
  - cursor
  - windsurf
  - github-copilot
  - trae-cn
metadata:
  tags:
    - code-integrity
    - mock-detection
    - regex-abuse
    - reality-binding
    - silent-failure
    - ai-code-quality
    - enforcement
    - code-review
    - static-analysis
    - quality-gate
  category: code-review
  subCategory: code-integrity-enforcement
  risk-level: high
  confidence: 0.94
---

# 🧠 HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer

## 概述

HOS-Silly-Mock 不是一个"优化代码"的 Skill，而是一个 **Reality Enforcement Layer（真实强制执行层）**。
它阻止 AI 使用 MOCK 数据、正则表达式、静态数据来伪造系统可运行性，强制 AI 在不确定时"停下来问"，而不是"编一个能跑的假系统"。

### 核心哲学

> ❌ **阻止 AI 用"编造确定性"替代"不确定真实系统"**
>
> ✅ **强制 AI 诚实表达不确定性**

### 四大威胁建模

| # | 威胁 | 表现 | 本质 |
|---|------|------|------|
| 1 | **MOCK污染 (Mock Leakage)** | API没接→写假数据, UI没后端→填demo json, 表单没验证→写固定值 | AI 用"编造确定性"替代"不确定真实系统" |
| 2 | **Regex硬编码依赖 (Regex Overuse Bias)** | JSON parse→regex, HTML→regex, log→regex, URL→regex | 用"局部规则"替代"系统语义" |
| 3 | **沉默失败 (Silent Failure)** | 不报错、继续写完整系统、但系统其实是假的 | AI 主动制造"不可维护的假系统" |
| 4 | **数据来源单薄 (Reality Binding Gap)** | 变量无来源、transform无输入、sink无context | 逻辑链断裂导致无意义代码 |

## 何时使用

### 触发场景

- AI 正在生成包含静态假数据的数据结构（数组、对象、Map）
- 代码中使用正则表达式处理结构化数据（JSON/HTML/XML/CSV）
- 逻辑链完整但没有真实 I/O 源头
- 代码可运行但无真实系统意义（silent demo system）
- Code Review 中需要检查 mock 数据泄漏到生产代码
- CI/CD 流水线中作为质量门禁检测 fake code pattern
- AI Agent 生成代码时自我检查（pre-commit hook）
- 后端 API 未就绪时前端代码生成假数据

### 关键词

`mock data`, `fake data`, `hardcoded data`, `dummy data`, `test data in production`, `regex parse`,
`regex abuse`, `silent failure`, `fake system`, `demo mode`, `mock leakage`, `假数据`, `硬编码`,
`正则滥用`, `沉默失败`, `假系统`, `静态数据`, `reality binding`, `data authenticity`,
`source-transform-sink`, `MOCK_MODE`, `缺少 API`, `mock污染`

### 识别指标

- 代码包含硬编码的长列表/对象数组
- 正则表达式用于解析 JSON/HTML/XML
- 变量赋值后无 read/transform/sink 完整链路
- 函数有完整实现但调用方缺失
- catch 块为空或仅 console.log
- 变量名含 `mock`, `fake`, `dummy`, `sample`, `demo`, `testData`
- JSON.parse 前的数据来源不是 API/I/O
- 文档字符串含 `TODO: connect to real API`

### 别名

`reality-check`, `fake-data-detector`, `mock-leakage-guard`, `regex-reflection-blocker`,
`silent-failure-killer`, `anti-fake-code`, `code-integrity-enforcer`, `真实连接强制`,
`反假数据层`

## 架构：4层防御系统

```
┌──────────────────────────────────────────────────────────┐
│                    HOS-Silly-Mock                         │
│                                                          │
│  Layer 1: MOCK显性化强制器 (Mock Exposure Layer)          │
│  任何 mock 必须显式标注 ⚠ MOCK_MODE: TRUE                │
│                                                          │
│  Layer 2: Regex禁用反射器 (Regex Reflection Blocker)      │
│  禁止 regex 用于结构化数据解析，强制使用标准解析器          │
│                                                          │
│  Layer 3: 真实连接强制器 (Reality Binding Layer)          │
│  每个变量必须绑定 source → transform → sink 三元组        │
│                                                          │
│  Layer 4: 沉默失败检测器 (Silent Failure Detector)        │
│  检测完整但无真实意义的逻辑链                             │
└──────────────────────────────────────────────────────────┘
```

## 操作检查清单

### Layer 1: MOCK 检测

1. 扫描所有静态赋值的大数据结构（数组/对象 > 3 行）
2. 检查是否存在 `MOCK_MODE: TRUE` 显式标注
3. 若无标注 → 标记为 Mock Leakage
4. 检查 catch 块是否降级为 mock 数据
5. 检查变量名含 mock/fake/dummy/sample/demo/testData
6. 检查 async 函数中是否有 .catch(() => fakeData) 模式

### Layer 2: Regex 检测

7. 扫描所有 regex 字面量（`/.../`）和 `new RegExp(`
8. 判断使用场景：JSON/HTML/XML/CSV → 标记为 Regex Abuse
9. 检查 strucured data + regex 的组合模式
10. 检查 `match`, `replace`, `split`, `exec` 的调用上下文

### Layer 3: Reality Binding 检测

11. 检查每个变量的 source/transform/sink 三元组是否完整
12. 检查数据是否来自：API call / I/O / user input / DB query
13. 无 source 的变量 → 标记为 Unbound Variable
14. 检查数据流向是否完整：fetch → process → render

### Layer 4: Silent Failure 检测

15. 扫描完整逻辑链但无 I/O 的系统
16. 检查 empty catch / 空 error handler
17. 检查无 `throw` / `reject` 的错误路径
18. 检查过于"完美"的可运行代码（无错误处理的完整实现）

### 评分与报告

19. 计算 Reality Score（数据真实性 0-100）
20. 生成 Mock Leakage Risk / Regex Abuse Risk / Silent Failure Risk
21. 输出格式化报告

## 技术手段

- **静态分析扫描**: 扫描 AST 识别 mock 数据模式
- **正则上下文分析**: 判断 regex 是否用于结构化解析
- **数据流追踪**: 追踪变量 source → sink 链路
- **模式匹配**: 识别已知的 mock/fake/sample 命名模式
- **Source Map 溯源**: 检查 catch → fallback 链路
- **Reality Scoring**: 综合多维度评分
- **AST 遍历**: 使用 TypeScript Compiler API 进行 AST 分析
- **Pre-commit Hook**: 集成到 Git 提交前检查
- **CI/CD Gate**: 作为流水线质量门禁

## 实战经验

### 症状

- 代码中有大量静态假数据但无 MOCK_MODE 注释
- JSON 解析使用正则而非 `JSON.parse`
- HTML 提取使用 `/<tag[^>]*>(.*?)<\/tag>/g`
- 函数看起来完整但调用链断裂（无处调用）
- catch 块返回假数据而非抛出错误
- 生成的系统在无后端时也能"正常运行"

### 根因分析

- AI 训练数据中大量代码示例使用静态假数据
- AI 对"可运行"的奖励高于"可维护"
- AI 缺乏对真实 I/O 边界的不确定性建模
- AI 的"完成偏见"使其倾向于补全而非报告缺失
- 缺乏显式的 "Unknown" 表示机制
- 代码补全模型对"看起来完整"有正向奖励

### 实战观察

- 约 60% 的 AI 生成代码包含某种形式的 mock 数据泄漏
- Regex 用于结构化解析是 AI 代码中最顽固的不良模式
- 显式标注 MOCK_MODE 可降低 85% 的假数据传播风险
- Source → Transform → Sink 强制链路是最有效的防御手段
- Silent fake system 在 CI 中不报错，是最危险的形式
- AST 级别的检测比文本匹配更可靠（减少误报）
- 结合 pre-commit hook 和 CI gate 可实现全链路防护
- Reality Score < 60 的系统几乎都包含不可维护的 mock 数据

### 常见错误

- 只检测 `mock` 关键词（变量名可能是 `mockService` 但合理）
- 过度报警（测试文件中的 mock 应有豁免机制）
- 忽略动态生成的假数据（`Array.from({length: 100}, (_, i) => ({id: i}))`）
- 未识别通过环境变量控制 mock 的合法模式
- 错过了内联 JSON blob（大型 JSON 对象字面量）
- 将合法的 reducer 初始状态误判为 mock 数据

### 补充说明

- 测试文件中的 mock 通过 `// @silly-mock:allow-test` 豁免
- 明确的 MOCK_MODE 标注 + reason 字段 = 合法 mock
- 此 Skill 可与 HOS-Sec-Engine code-review skill 组合使用
- 适用于所有编程语言（TypeScript/Python/Go/Java/Rust 等）
- Reality Score 可用于 CI/CD 质量门禁（阈值：开发环境 50，生产环境 80）
- 建议作为 pre-commit hook + CI gate 双层防护

## 示例

### Layer 1: MOCK 检测

```typescript
// ❌ 错误: 无标注的 mock 数据
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

// ✅ 正确: 显式标注 + 来源说明
/**
 * MOCK_MODE: TRUE
 * reason: /api/users not deployed yet, will replace in phase 2
 * @silly-mock:allow
 */
const users = await fetch('/api/users').catch(() => {
  console.warn('[MOCK] /api/users unavailable, using fallback data');
  return [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
  ];
});
```

### Layer 2: Regex 检测

```typescript
// ❌ 错误: 使用 regex 解析 JSON
const jsonStr = '{"name":"Alice","age":30}';
const nameRegex = /"name"\s*:\s*"([^"]+)"/;
const match = jsonStr.match(nameRegex);
const name = match?.[1];

// ✅ 正确: 使用 JSON.parse + schema validation
import { z } from 'zod';
const UserSchema = z.object({ name: z.string(), age: z.number() });
const jsonStr = '{"name":"Alice","age":30}';
const data = UserSchema.parse(JSON.parse(jsonStr));
const name = data.name;

// ❌ 错误: 使用 regex 解析 HTML
const html = '<div class="user">Alice</div>';
const nameRegex = /<div[^>]*class="user"[^>]*>([^<]*)<\/div>/;
const match = html.match(nameRegex);
const name = match?.[1];

// ✅ 正确: 使用 DOMParser
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const name = doc.querySelector('.user')?.textContent;
```

### Layer 3: Reality Binding

```typescript
// ❌ 错误: 无 source 的变量
const users = transformData(someData);
// users 的来源 someData 未定义

// ✅ 正确: 完整 source → transform → sink
const rawUsers = await api.getUsers();                // source
const processed = rawUsers.map(normalizeUser);        // transform
renderUserList(processed);                            // sink
```

### Layer 4: Silent Failure 检测

```typescript
// ❌ 错误: 沉默失败 — 完整但不真实的系统
function processOrders() {
  const orders = getOrders();      // 可能失败但不处理
  const total = calculateTotal(orders);
  const updated = updateStock(orders);
  return { total, updated };
  // ❌ 没有 try/catch, 没有 throw, 没有 error handling
}

// ✅ 正确: 错误显式化
async function processOrders() {
  try {
    const orders = await getOrders();
    if (!orders.length) throw new Error('No orders to process');
    const total = calculateTotal(orders);
    const updated = await updateStock(orders);
    return { total, updated };
  } catch (err) {
    console.error('Order processing failed:', err);
    throw err; // 或明确的 fallback
  }
}
```

### Reality Score 报告

```
╔═══════════════════════════════════════════════╗
║         HOS-Silly-Mock Reality Report         ║
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
║  ├─ [L1-MOCK] users may contain mock data     ║
║  │    → add MOCK_MODE annotation              ║
║  ├─ [L2-REGEX] 1 regex may parse structured   ║
║  │    → replace with DOMParser                ║
║  └─ [L4-SILENT] 1 function lacks error path   ║
║       → add try/catch or throw                ║
╚═══════════════════════════════════════════════╝
```

## 验证标准

### 验证指标

- 所有 mock 数据被显式标注 `MOCK_MODE: TRUE`
- 正则表达式未用于结构化数据解析（JSON/HTML/XML/CSV）
- 所有变量有完整 source → transform → sink 链路
- 函数存在显式 error handling（throw / try-catch / Either）
- Reality Score 可量化计算
- Mock Leakage Risk 可复现评估
- 测试文件中的 mock 有独立豁免机制

### 成功标志

- 系统在缺失外部依赖时显式报错，而非静默使用假数据
- 所有结构化解析使用标准解析器而非正则
- 无变量处于"无源头"状态
- CI 中 Reality Score 低于阈值的代码被阻断
- AI Agent 在不确定时主动提问而非编造假系统

### 误报标志

- 测试框架的标准 mock 工具被标记（应豁免）
- reducer 的初始状态被标记（非业务数据）
- 配置文件的静态字典被标记（如语言包、常量）
- 纯展示组件的静态 UI 数据被标记
- Next.js 的 `getStaticProps` 构建时数据被标记

## 防御建议

### 推荐做法

- 所有 mock 数据必须显式标注 `MOCK_MODE: TRUE + reason`
- 结构化解析必须使用标准解析器（JSON.parse / DOMParser / xml2js）
- 每个变量必须绑定 source（API / I/O / 参数传入）
- 所有异步操作必须有 try-catch 或 error boundary
- 在 CI/CD 中集成 Reality Score 作为质量门禁
- 在 AI Agent prompt 中注入 HOS-Silly-Mock system prompt
- 使用 Pre-commit hook 检查新增的 mock 数据
- 代码审查时检查 source → transform → sink 链路完整性

### 缓解措施

- 测试环境允许 mock 但需标注 `@silly-mock:allow-test`
- 开发环境 Reality Score 阈值 50，生产环境 80
- 对误报模式建立豁免清单（配置文件、常量、reducer 初始状态）
- 结合类型系统（Zod / io-ts）确保数据形状的运行时验证
- 建立"mock 清单"追踪所有有标注的 MOCK_MODE 代码
- 每次 sprint 检查 MOCK_MODE 标注是否可以移除

### System Prompt（AI Agent 集成）

```
You are HOS-Silly-Mock Enforcement Engine.

Your role is to prevent fake system construction.

Rules:
1. NEVER use mock data unless explicitly marked MOCK_MODE: TRUE
2. NEVER use regex for structured parsing
3. NEVER continue logic without real I/O source
4. NEVER silently simulate system completeness

If any of the following occurs:
- missing API / data source
- fake data used without declaration
- regex used for structured parsing

→ STOP generation immediately
→ Request real input or system boundary clarification

You must prefer:
- HALT over hallucination
- INCOMPLETE over fake completeness
- ERROR over silent fake success
```

## 参考链接

- https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW
- HOS-Sec-Engine Code Review Skills
- "Fake It Until You Make It" — 结构化数据解析反模式
- CWE-1104: Use of Unmaintainable Code for Input Validation
- "AI Completeness Bias" — O'Reilly AI Engineering 2025
