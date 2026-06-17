# HOS-Sec-Engine

**A rule-based system for both white-box code audit and black-box penetration testing.**

---

## Install as AI Agent Skill

> Requires Node.js 18+. Supports 71+ agents: Claude Code, Cursor, Codex, GitHub Copilot, Cline, Trae, Windsurf, etc.

```bash
# Interactive install (recommended) - select skills and agents
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/00-HOS-Sec-Engine/skills

# Install to all supported agents (non-interactive)
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/00-HOS-Sec-Engine/skills --skill HOS-Sec-Engine -a '*' -y

# Install to a specific agent (e.g., Claude Code)
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/00-HOS-Sec-Engine/skills --skill HOS-Sec-Engine -a claude-code -y

# Global install (available across all projects)
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/00-HOS-Sec-Engine/skills --skill HOS-Sec-Engine -a '*' -g -y

# List available skills without installing
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/00-HOS-Sec-Engine/skills --list
```

### Installation Options

| Option | Flag | Example |
|--------|------|---------|
| Scope | (default) `-g` | Project-level (current) / Global (all projects) |
| Agent | `-a` | `claude-code`, `cursor`, `codex`, `copilot`, `trae`, `*` (all) |
| Skill | `--skill` | `HOS-Sec-Engine` (包含审计+渗透+诊断) |

### Installation Methods

| Method | Description |
|--------|-------------|
| **Symlink** (default) | Creates symlinks from each agent to a canonical copy. Single source of truth, easy updates. |
| **Copy** | Creates independent copies for each agent. Use when symlinks aren't supported. |

After installation, the skill will be automatically loaded by your AI agent when relevant security tasks are detected.

---

## Quick Start (Developer)

```bash
# Install dependencies
npm install

# Build the project (compiles TypeScript to dist/)
npm run build

# Generate all platform outputs + skills/ directory
npm run generate:all
```

Generated output files appear in the `dist/` directory. Skills are generated to the parent `skills/` directory.

---

## Core Philosophy

> **代码审计 (White Box)**: 从源码出发，系统化检查每一个安全控制点
> **渗透测试 (Black Box)**: 模拟攻击者视角，从外到内验证真实可利用性

- **Rules over Knowledge** - 定义审计流程，而非漏洞定义
- **Process over Conclusion** - 系统化检查流，而非一句话判断
- **Evidence over Assertion** - 每个发现都需要完整的证据链
- **Dual Core** - 白盒代码审计 + 黑盒渗透测试，互为补充
- **Multi-platform Output** - 一次编写，多端输出(Claude/Cursor/OpenHands/OpenCode)

---

## Architecture

项目采用7层结构，支持代码审计和渗透测试双模式：

```
HOS-Sec-Engine/
|
+-- Layer 1: schemas/            Core type definitions (AuditRule, ReviewRule, EvidenceStandard, AttackPath)
+-- Layer 2: audit-rules/        10 audit rules (AR-001~AR-010) - 白盒检查方法
+-- Layer 3: review-rules/       5 review rules (RR-001~RR-005) - 误报过滤
+-- Layer 4: evidence-rules/     6 evidence rules (ER-001~ER-006) - 证据链标准
+-- Layer 5: penetration-test/   7 pentest rules (PT-001~PT-007) - 黑盒攻击模拟
+-- Layer 5b: problems/          6 problem categories (PD-001~PD-006) - 问题分类与诊断
+-- Layer 6: templates/          Output templates (Finding, Report, PentestReport, PoC, DiagnosticReport)
+-- Layer 7: examples/           Real-world cases - Before/after comparisons
+-- Layer 8: generators/         Code generators - Multi-platform output (audit/pentest/combined/diagnostics)

dist/                            Generated output files (skill.md, skill-audit.md, skill-pentest.md, etc.)
```

---

## Rule Inventory

### Audit Rules (AR-001 ~ AR-010) - 白盒代码审计

| ID | Name | Description |
|----|------|-------------|
| AR-001 | Taint Analysis | 跟踪用户输入到敏感操作的数据流，识别未消毒的路径 |
| AR-002 | Input Validation | 检查输入验证机制，发现缺失、不完整或可绕过的验证 |
| AR-003 | Authentication Check | 检查认证实现，发现绕过、弱凭证、会话管理缺陷 |
| AR-004 | Cryptography Check | 识别弱算法、硬编码密钥、不安全的IV/Nonce、弱随机数 |
| AR-005 | SQL Query Inspection | 检查SQL查询构造和参数处理的注入风险（5步流程） |
| AR-006 | Deserialization Check | 检查反序列化操作，识别不安全的模式和小工具链风险 |
| AR-007 | XXE Check | 检查XML解析配置，识别外部实体注入和实体扩展攻击 |
| AR-008 | SSRF Check | 检查服务端请求伪造风险，识别不安全的URL请求和代理模式 |
| AR-009 | Command Injection | 检查OS命令注入风险，识别不安全的命令执行和Shell调用 |
| AR-010 | Expression Language Injection | 检查EL注入和SSTI风险，识别不安全的模板渲染 |

### Penetration Test Rules (PT-001 ~ PT-007) - 黑盒渗透测试

| ID | Name | Description |
|----|------|-------------|
| PT-001 | Reconnaissance | 信息收集：检测信息泄露、API文档暴露、技术栈暴露 |
| PT-002 | Authentication Bypass | 认证绕过：弱密码、JWT篡改、Session固定、暴力破解 |
| PT-003 | Privilege Escalation | 权限提升：IDOR、水平/垂直越权、角色参数操纵 |
| PT-004 | Business Logic Flaws | 业务逻辑：竞态条件、状态机绕过、负数金额、优惠券滥用 |
| PT-005 | API Abuse | API滥用：批量赋值、过度数据暴露、GraphQL滥用、分页滥用 |
| PT-006 | Social Engineering | 社会工程：XSS、开放重定向、CSRF、邮件/SMS注入、文件上传 |
| PT-007 | Infrastructure Attack | 基础设施攻击：云凭证泄露、容器提权、CI/CD注入、供应链攻击 |

### Review Rules (RR-001 ~ RR-005) - 审核规则

| ID | Name | Description |
|----|------|-------------|
| RR-001 | False Positive Detection | 系统化问题清单，确认发现是否为真实漏洞 |
| RR-002 | Reachability Analysis | 控制流分析和调用链追踪，验证代码路径是否真正可达 |
| RR-003 | Exploitability Assessment | 从攻击者角度评估真实可利用性，分析攻击复杂度 |
| RR-004 | Severity Calibration | 基于业务上下文、技术环境和现有防御动态校准严重级别 |
| RR-005 | Context Analysis | 分析业务上下文、部署环境和架构，识别上下文特定风险 |

### Evidence Rules (ER-001 ~ ER-006) - 证据标准

| ID | Name | Description |
|----|------|-------------|
| ER-001 | Source Code Evidence | 规范源代码证据采集 - 准确文件路径、行号、代码上下文 |
| ER-002 | Data Flow Evidence | 规范数据流跟踪证据 - 从源头到目标的每一步都可追溯 |
| ER-003 | Configuration Evidence | 规范配置证据 - 框架设置、安全配置、环境变量 |
| ER-004 | API Evidence | 规范API级别证据 - API定义、认证、输入/输出、权限 |
| ER-005 | Dependency Evidence | 规范依赖证据 - 库版本、CVE映射、依赖树分析 |
| ER-006 | Runtime Evidence | 规范运行时行为证据 - 日志、网络流量、内存状态 |

### Problem Categories & Diagnostics (PD-001 ~ PD-006) - 问题分类与诊断

| ID | Category | Default Severity | Description |
|----|----------|------------------|-------------|
| PD-001 | Input Validation Defects | High | 系统化诊断输入验证缺陷，识别缺失、不完整或可绕过的验证 |
| PD-002 | Auth & Authorization Defects | Critical | 系统化诊断认证授权缺陷，包括凭证管理、会话处理、越权路径 |
| PD-003 | Data Protection Defects | Critical | 系统化诊断数据保护缺陷，弱加密、密钥管理、数据泄露 |
| PD-004 | Configuration & Deployment Defects | High | 系统化诊断安全配置缺陷，不安全默认设置、暴露面、部署问题 |
| PD-005 | Dependency & Supply Chain Defects | High | 系统化诊断依赖供应链缺陷，CVE映射、构建链完整性 |
| PD-006 | Business Logic Defects | High | 系统化诊断业务逻辑缺陷，工作流绕过、状态机、竞态条件 |

---

## Usage Scenarios

### 代码审计 (Code Audit) - 白盒

```
输入:   目标项目源代码
加载:   AR-001~AR-010 + RR-001~RR-005 + ER-001~ER-006
输出:   精确漏洞位置、低误报率、完整证据链、根因分析
```

### 渗透测试 (Penetration Testing) - 黑盒

```
输入:   目标系统（API端点、Web界面）
加载:   PT-001~PT-007 + 攻击路径分析
输出:   攻击面识别、漏洞利用链、影响范围评估、PoC
```

### 综合模式 (Combined) - 白盒+黑盒

```
输入:   目标项目源代码 + 运行环境
加载:   AR-001~AR-010 + PT-001~PT-007 + RR-001~RR-005
输出:   白盒发现引导黑盒测试，黑盒验证确认白盒发现
```

### 漏洞验证 (Vulnerability Verification)

```
输入:   已有漏洞报告
加载:   RR-001 (False Positive Detection) + ER-001~ER-006 (Evidence Verification)
输出:   误报过滤、证据完整性验证、根因确认
```

### 问题诊断 (Problems & Diagnostics) - 发现→诊断→修复→验证

```
输入:   AR/PT规则发现的潜在问题
加载:   PD-001~PD-006 (问题分类与诊断规则)
输出:   系统化诊断流程、根因分析、修复方案、验证步骤
流程:   问题识别 → 分类定级 → 深度诊断 → 修复指导 → 验证确认
```

---

## Dual Core Value Proposition

| 维度 | 仅代码审计 | 仅渗透测试 | HOS-Sec-Engine 双引擎 |
|------|-----------|-----------|----------------------|
| **覆盖范围** | 仅源码可见问题 | 仅运行时可见问题 | 全部覆盖 |
| **误报率** | 可能较高 | 较低（已验证） | 白盒发现+黑盒验证=低误报 |
| **漏报率** | 较低 | 可能较高 | 系统化检查=低漏报 |
| **根因分析** | 深入（有源码） | 表面（无源码） | 源码级根因+运行时验证 |
| **利用验证** | 推测 | 实际验证 | 推测+实际验证 |

**核心优势**: 白盒发现引导黑盒测试方向，黑盒验证确认白盒发现，两者互补形成完整的安全评估。

---

## Output Formats

规则一次维护，多端输出：

| Format | File | Target Platform |
|--------|------|-----------------|
| Combined Skill | `dist/skill.md` | 综合模式（审计+渗透） |
| Audit Skill | `dist/skill-audit.md` | 仅代码审计 |
| Pentest Skill | `dist/skill-pentest.md` | 仅渗透测试 |
| Diagnostics | `dist/skill-diagnostics.md` | 问题分类与诊断规则 |
| Claude Skill | `dist/claude-skill.md` | Claude (Anthropic) |
| Cursor Rules | `dist/cursor-rule.md` | Cursor IDE |
| OpenHands | `dist/openhands-rule.md` | OpenHands Agent |
| OpenCode | `dist/opencode-rule.md` | OpenCode |

---

## Key Design Principles

**1. Rules over Knowledge**
- 错误: "SQL注入是当用户输入未经处理直接拼接到SQL查询时..."
- 正确: "检查查询是否使用字符串拼接，参数是否可控，是否使用参数化查询"

**2. Process over Conclusion**
- 错误: "发现SQL注入 -> 危险 -> 修复"
- 正确: "发现 -> 验证参数来源 -> 检查可控性 -> 检查防护 -> 结论"

**3. Evidence over Assertion**
- 错误: "检测到Runtime.exec() -> RCE漏洞"
- 正确: "XYZ.java:45的Runtime.exec(cmd) -> 参数来自请求 -> 无验证 -> 高风险RCE"

**4. Dual Core**
- 白盒代码审计发现源码级问题
- 黑盒渗透测试验证真实可利用性
- 两者互补，形成完整安全评估

**5. Multi-platform, Single Source**
- 规则一次维护，生成Claude、Cursor、OpenHands、OpenCode等多端输出

**6. Discovery → Diagnosis → Remediation → Verification**
- 白盒/黑盒发现潜在问题后，自动匹配问题分类规则（PD）
- 系统化诊断流程引导深入分析根因
- 提供具体修复方案和验证步骤，形成完整闭环

---

## Adding New Rules

1. 复制现有规则文件作为模板 (如 `src/audit-rules/sql-query-check.ts`)
2. 使用标准schema定义规则: `id`, `name`, `description`, `checks`, `evidence_requirements`, `remediations`
3. 每条规则应包含3-7个检查步骤，每个步骤有具体问题和失败指标
4. 从对应的 `index.ts` 导出规则
5. 在 `src/examples/` 创建匹配的案例演示规则效果

典型时间: 每条规则2-3小时。

---

## Project Metrics

| Metric | Target | Status |
|--------|--------|--------|
| **Audit Rules** | 10 | Implemented |
| **Pentest Rules** | 7 | Implemented |
| **Review Rules** | 5 | Implemented |
| **Evidence Rules** | 6 | Implemented |
| **Problem Categories** | 6 | Implemented |
| **Code Size** | < 8000 lines | In progress |
| **Case Studies** | 3-5 | 3 completed |
| **Output Formats** | 8 | Implemented |
| **Version** | 0.3.0 | Beta - Dual Core + Diagnostics |

---

## License

This project is for authorized security audit and penetration testing use.

**All security conclusions require human expert review.**

---

**Version:** 0.3.0 (Dual Core + Diagnostics) | **Author:** HOS Team | **Date:** June 17, 2026
