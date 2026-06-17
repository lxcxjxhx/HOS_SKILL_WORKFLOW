# HOS-Audit-Core: Complete Index & Navigation Guide

**项目定位:** AI代码审计规则引擎（不是知识库）

---

## 📚 文档导航

### 🎯 快速入门 (5分钟)

1. **新手必读**: 
   - [`README-AUDIT-CORE.md`](./README-AUDIT-CORE.md) - 项目概览和定位
   - 了解项目与Hack-Skills的本质差异

2. **核心概念** (10分钟):
   - **审计规则 (Audit Rules)**: AR-001到AR-010 - "如何检查"
   - **审核规则 (Review Rules)**: RR-001到RR-005 - "如何避免误报"
   - **证据规则 (Evidence Rules)**: ER-001到ER-005 - "如何采集证据"

3. **精选案例** (15分钟):
   - 3个真实案例演示规则的实际效果
   - "原始输出 vs 加载规则后输出"的对比

---

## 📂 项目结构详解

```
HOS-Audit-Core/
│
├── 📄 README-AUDIT-CORE.md          ← 项目定位和架构 (START HERE)
├── 📄 INDEX.md                      ← 本文件，完整导航
│
├── 📂 src/                          ← 源代码 (TypeScript)
│   │
│   ├── 📂 schemas/
│   │   └── types.ts                 ← 核心数据结构和接口
│   │       - AuditRule 接口
│   │       - ReviewRule 接口
│   │       - EvidenceStandard 接口
│   │       - Finding 接口
│   │       - 等等...
│   │
│   ├── 📂 audit-rules/              ← 审计规则 (核心内容)
│   │   ├── sql-query-check.ts       ← AR-005: SQL注入检查
│   │   ├── taint-analysis.ts        ← AR-001: 污点分析 (计划中)
│   │   ├── input-validation.ts      ← AR-002: 输入验证 (计划中)
│   │   ├── auth-check.ts            ← AR-003: 认证检查 (计划中)
│   │   ├── crypto-check.ts          ← AR-004: 密码学检查 (计划中)
│   │   ├── deserialization-check.ts ← AR-006: 反序列化 (计划中)
│   │   ├── xxe-check.ts             ← AR-007: XXE检查 (计划中)
│   │   ├── ssrf-check.ts            ← AR-008: SSRF检查 (计划中)
│   │   ├── command-injection.ts     ← AR-009: 命令注入 (计划中)
│   │   ├── expression-language.ts   ← AR-010: 表达式语言 (计划中)
│   │   └── index.ts                 ← 规则集合导出
│   │
│   ├── 📂 review-rules/             ← 审核规则 (误报过滤)
│   │   ├── false-positive.ts        ← RR-001: 误报检测 ✅
│   │   ├── reachability.ts          ← RR-002: 可达性分析 (计划中)
│   │   ├── exploitability.ts        ← RR-003: 可利用性评估 (计划中)
│   │   ├── severity-calibration.ts  ← RR-004: 风险等级校准 (计划中)
│   │   ├── context-analysis.ts      ← RR-005: 上下文分析 (计划中)
│   │   └── index.ts                 ← 规则集合导出
│   │
│   ├── 📂 evidence-rules/           ← 证据规则 (差异化核心)
│   │   ├── source-code.ts           ← ER-001: 源代码证据 ✅
│   │   ├── data-flow.ts             ← ER-002: 数据流证据 (计划中)
│   │   ├── config.ts                ← ER-003: 配置证据 (计划中)
│   │   ├── api.ts                   ← ER-004: API证据 (计划中)
│   │   ├── dependency.ts            ← ER-005: 依赖证据 (计划中)
│   │   └── index.ts                 ← 规则集合导出
│   │
│   ├── 📂 templates/                ← 输出模板 (统一格式)
│   │   ├── finding.ts               ← Finding输出模板 ✅
│   │   ├── report.ts                ← 报告模板 (计划中)
│   │   ├── review.ts                ← 审核意见模板 (计划中)
│   │   └── index.ts                 ← 模板集合导出
│   │
│   ├── 📂 examples/                 ← 精选案例 (审核关键)
│   │   ├── case-01-jwt-weak-key.md  ← Case 1: JWT弱密钥 ✅
│   │   ├── case-02-sqli-classic.md  ← Case 2: SQL注入 ✅
│   │   ├── case-03-false-positive-filter.md ← Case 3: 误报过滤 ✅
│   │   └── index.md                 ← 案例导航 (计划中)
│   │
│   └── 📂 generators/               ← 代码生成器 (计划中)
│       ├── build-skill.ts
│       ├── build-claude.ts
│       ├── build-cursor.ts
│       ├── build-openhands.ts
│       ├── build-opencode.ts
│       └── index.ts
│
├── 📂 dist/                         ← 生成输出 (计划中)
│   ├── skill.md
│   ├── claude-skill.md
│   ├── cursor-rule.md
│   ├── openhands-rule.md
│   └── opencode-rule.md
│
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## 🔍 各层详解

### 第1层: Schemas (核心抽象)

**文件**: `src/schemas/types.ts`

**内容**:
- `AuditRule` - 审计规则的标准格式
- `ReviewRule` - 审核规则的标准格式
- `EvidenceStandard` - 证据规范的标准格式
- `Finding` - 发现报告的标准格式
- 等等...

**用途**: 统一所有规则和输出的格式，确保一致性

**学习时间**: 20分钟

---

### 第2层: Audit Rules (检查规则)

**目录**: `src/audit-rules/`

**关键概念**: 规则不是告诉AI"什么是漏洞"，而是定义"如何检查漏洞"

**已完成**:
- ✅ `AR-005: sql-query-check.ts` - SQL查询检查

**规划中**:
- AR-001: Taint Analysis (污点分析)
- AR-002: Input Validation (输入验证)
- AR-003: Authentication Check (认证检查)
- AR-004: Crypto Check (密码学检查)
- AR-006: Deserialization Check (反序列化)
- AR-007: XXE Check
- AR-008: SSRF Check
- AR-009: Command Injection
- AR-010: Expression Language

**每条规则包含**:
1. **检查步骤** (3-7步) - 系统化的检查流程
2. **证据要求** - 必须收集的证据类型
3. **修复建议** - 不同优先级的修复方案
4. **元数据** - CWE、OWASP映射

**示例** (`AR-005`):
```
Step 1: 查询构造方式识别
Step 2: 参数来源追踪
Step 3: 参数可控性判定
Step 4: 可达性验证
Step 5: 防护措施检查
```

**学习时间**: 30分钟 (per rule)

---

### 第3层: Review Rules (审核规则)

**目录**: `src/review-rules/`

**关键概念**: 降低误报的系统方法。给定一个发现，这些规则帮助确认它是否真的是漏洞

**已完成**:
- ✅ `RR-001: false-positive.ts` - 误报检测

**规划中**:
- RR-002: Reachability Analysis (可达性分析)
- RR-003: Exploitability Assessment (可利用性评估)
- RR-004: Severity Calibration (风险等级校准)
- RR-005: Context-Based Analysis (上下文分析)

**RR-001包含**:
- 6个关键审核问题
- 7个常见误报模式
- 每个模式的识别特征和验证步骤

**示例误报**:
1. 管理员功能误报
2. 框架自动参数化
3. 日志输出误报
4. 白名单防护
5. 多层防护
6. 代码死亡路径
7. TOCTOU假警报

**学习时间**: 30分钟 (per rule)

---

### 第4层: Evidence Rules (证据规则)

**目录**: `src/evidence-rules/`

**关键概念**: "发现 ≠ 结论"。每个结论必须有完整的证据链

**已完成**:
- ✅ `ER-001: source-code.ts` - 源代码证据标准

**规划中**:
- ER-002: Data Flow Evidence (数据流证据)
- ER-003: Configuration Evidence (配置证据)
- ER-004: API Evidence (API证据)
- ER-005: Dependency Evidence (依赖证据)

**ER-001包含**:
- 必需字段 (8个)
- 推荐字段 (6个)
- 好的证据示例
- 差的证据示例 (反面教材)
- 采集指导 (5个步骤)
- 常见错误 (7种)

**学习时间**: 20分钟 (per rule)

---

### 第5层: Templates (输出模板)

**目录**: `src/templates/`

**关键概念**: 统一的Finding格式，避免AI生成冗长废话

**已完成**:
- ✅ `finding.ts` - Finding输出模板

**规划中**:
- `report.ts` - 完整审计报告
- `review.ts` - 审核意见

**Finding模板包含**:
- Header (基本信息)
- Location (位置信息)
- Evidence Chain (证据链)
- Root Cause (根因分析)
- Exploitation (利用条件)
- Remediation (修复建议)
- Verification (验证方法)

**学习时间**: 10分钟

---

### 第6层: Examples (精选案例)

**目录**: `src/examples/`

**关键概念**: 这是审核人最关心的部分。展示规则的实际效果

**已完成**:
- ✅ `case-01-jwt-weak-key.md` - JWT弱密钥
- ✅ `case-02-sqli-classic.md` - SQL注入
- ✅ `case-03-false-positive-filter.md` - 误报过滤

**每个案例包含**:
1. **原始输出** - 不加载规则的AI输出
2. **问题分析** - 原始输出的缺点
3. **规则分析** - 加载规则后的完整分析
4. **对比展示** - 清晰的before/after
5. **学习点** - 这个案例教会我们什么

**案例1 (JWT)** - 展示AR-004密码学检查
**案例2 (SQLi)** - 展示AR-005 SQL检查
**案例3 (误报)** - 展示RR-001误报过滤

**审核人最喜欢看**: Case 3（误报过滤），因为它展示了规则的差异化价值

**学习时间**: 15分钟 (per case)

---

### 第7层: Generators (代码生成)

**目录**: `src/generators/`

**关键概念**: 一次维护，多端输出

**规划中**:
- `build-skill.ts` - 生成Claude Skill Markdown
- `build-claude.ts` - 生成Claude专用格式
- `build-cursor.ts` - 生成Cursor Rules
- `build-openhands.ts` - 生成OpenHands规则
- `build-opencode.ts` - 生成OpenCode规则

**学习时间**: 计划中

---

## 📊 当前进度

### 完成 ✅ (Phase 1)

- [x] 项目定位和架构 (README-AUDIT-CORE.md)
- [x] 核心接口定义 (schemas/types.ts)
- [x] AR-005 SQL查询检查 (audit-rules/sql-query-check.ts)
- [x] RR-001 误报检测 (review-rules/false-positive.ts)
- [x] ER-001 源代码证据 (evidence-rules/source-code.ts)
- [x] Finding输出模板 (templates/finding.ts)
- [x] 3个精选案例 (examples/)

### 规划中 📋 (Phase 2)

- [ ] AR-001 ~ AR-010 其他审计规则
- [ ] RR-002 ~ RR-005 其他审核规则
- [ ] ER-002 ~ ER-005 其他证据规则
- [ ] Report和Review模板
- [ ] 代码生成器
- [ ] 集成测试
- [ ] 文档完善

---

## 🎯 使用场景

### 场景1: 学习如何做代码审计

```
1. 阅读 README-AUDIT-CORE.md (5分钟)
2. 阅读 src/schemas/types.ts (20分钟)
3. 阅读 src/audit-rules/sql-query-check.ts (30分钟)
4. 阅读 src/examples/case-02-sqli-classic.md (15分钟)

总计: 70分钟

学到: 如何系统化地检查SQL注入
```

---

### 场景2: 了解误报过滤

```
1. 阅读 src/review-rules/false-positive.ts (30分钟)
2. 阅读 src/examples/case-03-false-positive-filter.md (20分钟)

总计: 50分钟

学到: 如何确认一个发现是否真的是漏洞
```

---

### 场景3: 为审核人解释项目价值

```
Show them:
1. README-AUDIT-CORE.md - 定位和价值
2. case-02-sqli-classic.md - SQL检查的完整性
3. case-03-false-positive-filter.md - 误报过滤的价值

Time: 30分钟

Result: 审核人理解这是"规则引擎"而非"知识库"
```

---

### 场景4: 添加新规则

```
1. 复制 src/audit-rules/sql-query-check.ts 作为模板
2. 修改为新的检查规则
3. 在 src/audit-rules/index.ts 中导出
4. 创建相应的案例在 src/examples/

时间: 2-3小时 (per rule)
```

---

## 🔗 快速链接

### 核心文档
- [项目定位](./README-AUDIT-CORE.md)
- [核心数据类型](./src/schemas/types.ts)

### 审计规则
- [AR-005 SQL Query Check](./src/audit-rules/sql-query-check.ts)

### 审核规则
- [RR-001 False Positive Detection](./src/review-rules/false-positive.ts)

### 证据规则
- [ER-001 Source Code Evidence](./src/evidence-rules/source-code.ts)

### 案例学习
- [Case 1: JWT Weak Key](./src/examples/case-01-jwt-weak-key.md) - 密码学检查
- [Case 2: SQL Injection](./src/examples/case-02-sqli-classic.md) - SQL检查
- [Case 3: False Positive Filter](./src/examples/case-03-false-positive-filter.md) - 误报过滤

### 模板
- [Finding Template](./src/templates/finding.ts)

---

## ❓ FAQ

### Q1: 这与Hack-Skills有什么区别？

**A:** 
- Hack-Skills: 安全知识库 ("什么是SQLi?")
- HOS-Audit-Core: 审计规则引擎 ("如何检查SQLi?")

前者是知识积累，后者是AI行为约束。

### Q2: 我应该从哪里开始？

**A:**
1. 新手: 从 README-AUDIT-CORE.md 开始
2. 代码审计师: 从 src/audit-rules/sql-query-check.ts 开始
3. 安全审核人: 从 case-03-false-positive-filter.md 开始

### Q3: 规则越多越好吗？

**A:** 
不是。目标是20-30条高质量规则，而不是100+低质量规则。
质量 > 数量。

### Q4: 如何贡献新规则？

**A:**
1. 按 sql-query-check.ts 的格式创建新规则
2. 包含完整的检查步骤、证据要求、修复建议
3. 创建相应的案例
4. 提交PR进行审核

### Q5: 可以用于渗透测试吗？

**A:**
是的。审计规则可以应用于渗透测试。
例如: AR-008 (SSRF检查) 对API渗透测试很有用。

### Q6: 这个项目会持续更新吗？

**A:**
是的。计划在Phase 2中添加AR-001到AR-010、RR-002到RR-005等。

---

## 📞 Support

- 问题: 提交Issue
- 建议: 提交Discussion
- 贡献: 提交PR

---

## 📄 License

本项目用于授权安全审计和渗透测试。

**所有安全结论需要人工专家审核。**

---

**最后更新**: 2026年6月16日  
**项目版本**: 0.1.0 (Alpha - Phase 1完成)  
**维护者**: HOS Team  

**下一步**: 进入Phase 2，实现AR-001到AR-010其他规则
