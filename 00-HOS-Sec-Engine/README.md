<p align="center">
  <img src="https://img.shields.io/badge/Version-4.0.0-blue?style=for-the-badge" alt="Version 4.0.0"/>
  <img src="https://img.shields.io/badge/Skills-33-brightgreen?style=for-the-badge" alt="33 Skills"/>
  <img src="https://img.shields.io/badge/MCP-Enabled-purple?style=for-the-badge" alt="MCP Enabled"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">🔥 HOS-Sec-Engine</h1>
<p align="center"><b>攻防实战规则引擎 · AI 原生安全技能系统</b></p>
<p align="center">
  33 个实战技能 · 11 大安全领域 · 4 个 0day · MCP 自我管理层
</p>

<p align="center">
  <i>将攻防专家经验转化为 AI 可执行的标准化技能 — 秒级匹配，开箱即用</i>
</p>

---

## 📋 目录

- [🚀 一分钟开始](#-一分钟开始)
- [🎯 能力全景](#-能力全景)
- [📦 安装指南](#-安装指南)
- [🔌 MCP 自我管理层](#-mcp-自我管理层)
- [🧭 使用指南](#-使用指南)
- [📚 技能全景](#-技能全景)
- [🔧 引擎维护](#-引擎维护)
- [🏗 项目架构](#-项目架构)
- [📊 测试与质量](#-测试与质量)
- [📖 学术引用](#-学术引用)

---

## 🚀 一分钟开始

```bash
# 一行命令安装全部技能（零依赖）
node <(curl -s https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js) -- --target trae --global --all
```

安装后，在 AI 编辑器中描述安全场景即可自动匹配技能：

```
你: "帮我绕过这个 WAF 的 SQL 注入防护"
AI → 自动使用 web-sqli-001 + web-waf-bypass-0day 技能

你: "完整做一次 Web 渗透测试"
AI → 自动编排 Web 渗透测试全流程

你: "测试这个 API 的 JWT 认证有没有漏洞"
AI → 自动使用 api-jwt-001 技能
```

> **就是这么简单**：不需要 clone 仓库，不需要 npm install，一步到位。

---

## 🎯 能力全景

### 引擎核心能力

| 能力 | 说明 |
|------|------|
| **场景自动匹配** | AI 根据对话描述自动匹配最合适的攻防技能 |
| **流程编排** | 内置 Web/API/云 完整渗透测试流程 |
| **MCP 自我管理** | 自动发现、注册、健康监控 MCP 工具服务器 |
| **自我维护** | AI 可自行编译、新增、更新技能 |
| **多 Agent 集成** | Ensemble 多 Agent 并行/串行执行（V5） |
| **AI 裁判验证** | 三证据模型过滤误报（V5） |
| **技能自动衍生** | 从渗透测试发现自动生成新技能 |

### 支持的安全领域

```
Web 安全 ───┬─ SQL 注入 WAF 绕过    ──  web-sqli-001
            ├─ XSS 过滤器绕过        ──  web-xss-001
            ├─ SSRF 检测与利用       ──  web-ssrf-001
            ├─ 文件上传绕过          ──  web-upload-001
            ├─ 命令注入              ──  web-rce-001
            └─ 4 个 0day 技能       ──  web-waf-bypass-0day ...

API 安全 ───┬─ JWT 攻击              ──  api-jwt-001
            ├─ OAuth 流程攻击        ──  api-oauth-001
            ├─ IDOR 越权检测         ──  api-idor-001
            ├─ GraphQL 注入          ──  api-graphql-injection-001
            ├─ 速率限制绕过          ──  api-ratelimit-001
            └─ MCP 协议安全审计      ──  mcp-security-audit-001

云安全 ─────┬─ IAM 权限提升          ──  cloud-iam-001
            ├─ 云元数据 SSRF         ──  cloud-meta-001
            └─ S3 配置错误利用       ──  cloud-s3-001

系统安全 ───┬─ Linux 提权            ──  linux-priv-esc-001
            ├─ Windows 提权          ──  windows-priv-esc-001
            ├─ AD 域信息收集         ──  ad-domain-enum-001
            └─ Docker 容器逃逸       ──  container-docker-escape-001

AI 安全 ────┬─ Prompt 注入绕过       ──  ai-prompt-injection-001
            ├─ AI 工具链漏洞检测     ──  ai-tooling-vuln-001
            └─ Deepfake 检测         ──  deepfake-detection-001

更多 ───────┬─ K8s 配置审计          ──  k8s-misconfig-001
            ├─ Java 反序列化审计     ──  code-review-java-deser-001
            ├─ Android APK 逆向      ──  mobile-android-apk-001
            ├─ CPS AI Agent 安全     ──  cps-ai-security-001
            └─ 预提交安全审查        ──  code-review-immature-001
```

---

## 📦 安装指南

### 方式一：一行命令安装（推荐）

**Windows PowerShell：**
```powershell
irm https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js -OutFile install.js; node install.js --target trae --global --all
```

**Linux / macOS：**
```bash
curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js | node -s --target trae --global --all
```

**安装选项：**
| 参数 | 说明 |
|------|------|
| `--target trae` | Trae IDE |
| `--target claude-code` | Claude Code |
| `--target cursor` | Cursor |
| `--global` | 全局安装（所有项目可用） |
| `--all` | 安装全部技能 |
| `--skill web-sqli-001,web-xss-001` | 安装指定技能 |
| `--mode standalone` | 独立模式（仅技能文件） |

### 方式二：npm 包安装（含完整源码）

```bash
npm install hos-sec-engine

# 部署到编辑器
npx hos-skills install --target trae
npx hos-skills install --target claude-code
npx hos-skills install --target cursor
```

### 方式三：源码开发

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd 00-HOS-Sec-Engine
npm install
npm run build && npm run deploy
```

---

## 🔌 MCP 自我管理层

> **V6 核心能力**：引擎内置完整的 MCP (Model Context Protocol) 自我管理层，支持 MCP 服务器的自动发现、注册、健康监控和工具路由。

### 什么是 MCP 管理层？

MCP 管理层让引擎能够**自动发现**系统上安装的 MCP 工具服务器，**自动注册**到引擎运行时，**自动路由**技能执行到合适的 MCP 工具 — 全程无需人工配置。

### 架构

```
initMCP()  [首次使用时懒加载]
  ├─ loadMCPServersFromConfig()    ← config/mcp-servers.json
  ├─ mcpDiscovery.discoverAll()    ← 自动扫描已安装的 MCP 包
  ├─ mcpRegistry.registerServer()  ← 注册中心管理生命周期
  ├─ mcpHealthMonitor.start()      ← 健康监控 + 自动恢复
  └─ buildSkillMCPMappings()       ← 19 个 Skill 自动映射到 MCP
```

### 组件

| 组件 | 文件 | 职责 |
|------|------|------|
| **MCPRegistry** | `src/mcp/registry.ts` | MCP 服务器注册中心，管理生命周期（注册/启动/停止/注销） |
| **MCPDiscovery** | `src/mcp/discovery.ts` | 自动发现：扫描 13 个已知包、npm 全局/本地安装、配置文件 |
| **MCPRouter** | `src/mcp/router.ts` | 工具路由：4 种策略（best_match/round_robin/parallel_first/specific）、Skill-MCP 映射 |
| **MCPHealthMonitor** | `src/mcp/health.ts` | 健康监控：定时全量/增量检查、自动恢复（全局上限 50 次） |

### 自动发现的 MCP 包

| 包名 | 能力 | 用途 |
|------|------|------|
| `@anthropic/mcp-playwright` | 浏览器自动化 | WAF 绕过验证、XSS 执行验证、登录态测试 |
| `@anthropic/mcp-fetch` | HTTP 请求 | payload 注入、API fuzz、请求变形 |
| `@anthropic/mcp-sequential-thinking` | 多步推理 | 攻击链规划、bypass 策略生成 |
| `@anthropic/mcp-memory` | 持久记忆 | WAF 指纹学习、payload 成功率记录 |
| `@anthropic/mcp-filesystem` | 文件系统 | payload 存储、日志分析、结果持久化 |
| `@anthropic/mcp-code-executor` | 代码执行 | JS/Python payload 测试验证 |
| `@anthropic/mcp-github` | GitHub 集成 | payload 库管理、exploit 同步 |
| 更多... | browserbase / http-server / git / slack / sqlite / postgres |

### 路由策略

| 策略 | 说明 |
|------|------|
| `best_match` | 选择延迟最低的服务器（默认） |
| `round_robin` | 轮询所有可用服务器 |
| `parallel_first` | 所有服务器并行执行，取第一个成功结果 |
| `specific` | 强制使用指定服务器 |

### Skill-MCP 映射

引擎会自动将 19 个核心技能映射到 MCP 工具。例如：
- `web-sqli-001` → `http-fetch`（发送 payload）+ `playwright`（浏览器验证）
- `web-waf-bypass-0day` → `sequential-thinking`（规划策略）+ `http-fetch` + `playwright` + `memory`
- `ai-prompt-injection-001` → `http-fetch` + `sequential-thinking` + `memory`

---

## 🧭 使用指南

### 在 AI 编辑器中

安装后，直接在对话中描述安全场景：

```
你: "帮我看看这个上传功能怎么绕过"
AI → 自动使用 web-upload-001 技能
├─ 风险等级: Critical
├─ 场景确认: 应用提供文件上传功能
├─ 操作清单:
│  1. 确认文件扩展名过滤规则
│  2. 尝试修改 Content-Type
│  3. 测试双扩展名绕过
│  4. 尝试 .htaccess 配置
├─ Payload 示例: shell.php.jpg, .htaccess
├─ 验证方法: 访问上传的文件是否能执行
└─ 防御建议: 白名单扩展名 + 内容检测
```

### 引导命令

```
/hos-sec-engine help            → 显示引导界面
/hos-sec-engine list            → 列出所有可用技能
/hos-sec-engine scan-web        → 启动 Web 渗透测试流程
/hos-sec-engine scan-api        → 启动 API 安全审计流程
/hos-sec-engine scan-cloud      → 启动云安全审计流程
/hos-sec-engine mcp-status      → 查看 MCP 服务器状态
```

### 交互式安装工具

```bash
npx hos-skills              # 启动交互菜单
```

菜单提供：整合安装 · 分类浏览 · 关键词搜索 · 领域一键包 · 安装全部

---

## 📚 技能全景

### Web 安全（11 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `web-sqli-001` | SQL 注入 WAF 绕过 | 0.95 | 🔴 Critical |
| `web-xss-001` | XSS 过滤器绕过 | 0.95 | 🔴 Critical |
| `web-ssrf-001` | SSRF 检测与利用 | 0.93 | 🔴 Critical |
| `web-xxe-001` | XXE 注入攻击 | 0.93 | 🔴 Critical |
| `web-rce-001` | 命令注入 | 0.96 | 🔴 Critical |
| `web-upload-001` | 文件上传绕过 | 0.96 | 🔴 Critical |
| `web-deser-001` | 反序列化漏洞 | 0.94 | 🔴 Critical |
| `web-auth-bypass-0day` | 认证绕过 0day | 0.89 | 🔴 Critical |
| `web-deser-0day` | 反序列化 0day | 0.89 | 🔴 Critical |
| `web-waf-bypass-0day` | WAF 绕过 0day | 0.89 | 🟠 High |
| `web-xss-0day` | XSS 过滤 0day | 0.89 | 🟠 High |

### API 安全（6 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `api-jwt-001` | JWT 攻击与绕过 | 0.95 | 🔴 Critical |
| `api-oauth-001` | OAuth 流程攻击 | 0.94 | 🔴 Critical |
| `api-idor-001` | IDOR 越权检测 | 0.93 | 🟠 High |
| `api-ratelimit-001` | 速率限制绕过 | 0.92 | 🟠 High |
| `api-graphql-injection-001` | GraphQL 注入 | 0.89 | 🟠 High |
| `mcp-security-audit-001` | MCP 协议安全审计 | 0.90 | 🔴 Critical |

### 云安全（4 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `cloud-iam-001` | IAM 权限提升 | 0.96 | 🔴 Critical |
| `cloud-iam-002` | CPS 设备身份验证 | 0.86 | 🟠 High |
| `cloud-meta-001` | 云元数据 SSRF | 0.97 | 🔴 Critical |
| `cloud-s3-001` | S3 配置错误利用 | 0.95 | 🔴 Critical |

### 系统安全（4 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `linux-priv-esc-001` | Linux 提权 | 0.96 | 🔴 Critical |
| `windows-priv-esc-001` | Windows 提权 | 0.97 | 🔴 Critical |
| `ad-domain-enum-001` | AD 域信息收集 | 0.95 | 🟠 High |
| `container-docker-escape-001` | Docker 容器逃逸 | 0.93 | 🔴 Critical |

### AI 安全（3 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `ai-prompt-injection-001` | Prompt 注入绕过 | 0.92 | 🟠 High |
| `ai-tooling-vuln-001` | AI 工具链漏洞检测 | 0.88 | 🔴 Critical |
| `deepfake-detection-001` | Deepfake 检测评估 | 0.85 | 🟠 High |

### 其他（5 个）

| ID | 名称 | 置信度 | 风险 |
|----|------|:------:|:----:|
| `k8s-misconfig-001` | K8s 配置审计 | 0.94 | 🔴 Critical |
| `code-review-java-deser-001` | Java 反序列化审计 | 0.96 | 🔴 Critical |
| `code-review-immature-001` | 预提交安全审查 | 0.88 | 🟠 High |
| `mobile-android-apk-001` | Android APK 逆向 | 0.91 | 🟡 Medium |
| `cps-ai-security-001` | CPS AI Agent 安全 | 0.87 | 🔴 Critical |

> 所有技能置信度 0.85–0.97，经过 LLM Judge 裁判验证和多 Agent 共识检测。

---

## 🔧 引擎维护

### 自主维护

AI 可以自行完成：
1. 读取 `skills/*/SKILL.md` 了解技能规则
2. 编辑 `src/skills/` 下的 TypeScript 源码
3. 运行 `npm run build` 重新编译
4. 运行 `npm run deploy` 部署更新后的技能

### 编译和部署

```bash
npm run build                       # 完整的构建流程
npm run dev                         # 监听模式编译
npm run deploy                      # 部署到编辑器
npm run deploy:global               # 全局部署
npm run deploy:claude               # Claude Code 部署
npm run deploy:trae                 # Trae IDE 部署
```

### 技能衍生

引擎可以从渗透测试过程中发现的 finding 自动衍生新技能：
```
渗透测试发现 → SkillDeriver → 新技能注册 → 部署到编辑器
```

### MCP 管理

```bash
npm run lifecycle:status            # 查看技能生命周期状态
npm run lifecycle:changelog         # 查看变更日志
npm run generate:cwe:web           # 从 CWE 生成 Web 安全技能
npm run generate:cwe:api           # 从 CWE 生成 API 安全技能
```

---

## 🏗 项目架构

```
00-HOS-Sec-Engine/
├── src/                            # TypeScript 完整源码
│   ├── core/                       # 引擎核心
│   │   ├── engine.ts               # 主引擎（V6: MCP 集成）
│   │   ├── matcher.ts              # 场景匹配器
│   │   ├── scorer.ts               # 技能评分器
│   │   ├── orchestrator.ts         # 流程编排器
│   │   ├── judge.ts                # LLM 裁判（V5）
│   │   ├── poc-validator.ts        # PoC 验证器（V5）
│   │   ├── skill-lifecycle.ts      # 技能生命周期
│   │   └── skill-deriver.ts        # 技能自动衍生
│   ├── mcp/                        # MCP 自我管理层（V6 新增）
│   │   ├── types.ts                # MCP 类型系统
│   │   ├── registry.ts             # MCP 注册中心
│   │   ├── discovery.ts            # MCP 自动发现
│   │   ├── router.ts               # MCP 工具路由
│   │   └── health.ts               # MCP 健康监控
│   ├── agents/                     # 多 Agent 系统（V4/V5）
│   │   ├── coordinator.ts          # Agent 协调器
│   │   ├── ensemble.ts             # Ensemble 多 Agent 集成
│   │   └── sub-agent.ts            # 子 Agent 实现
│   ├── skills/                     # 技能源码
│   ├── playbooks/                  # 渗透测试流程编排
│   └── scripts/                    # 构建和部署脚本
├── skills/                         # 生成的技能文件
│   ├── hos-sec-engine/             # 整合技能入口
│   └── {skill-id}/                 # 33 个独立技能
├── config/                         # 配置文件
│   ├── mcp-servers.json            # MCP 服务器配置（V6）
│   └── providers.json.example      # AI Provider 配置
├── tests/                          # 测试套件
│   ├── core/
│   │   ├── engine-test.js           # 核心引擎 13 项测试
│   │   └── mcp-test.js             # MCP 管理层 81 项测试（V6 新增）
│   └── integration/
│       └── full-verification.js    # 完整集成验证
└── package.json
```

---

## 📊 测试与质量

### 测试结果（当前版本 4.0.0）

| 测试套件 | 测试数 | 通过率 | 状态 |
|---------|:------:|:------:|:----:|
| 核心引擎测试 | 13 | 100% | ✅ |
| MCP 自我管理层测试 | 81 | 100% | ✅ |
| 构建验证 | - | 100% | ✅ |
| 安装验证 | 34 skills | 100% | ✅ |

### 引擎性能

| 指标 | 数据 |
|------|:----:|
| 技能加载 | 33 个 / < 100ms |
| 场景匹配 | 平均 0.7ms / 次 |
| 缓存命中率 | Matcher 99% / Scorer 96% |
| 流程执行 | Web 渗透测试完整流程 < 1s |

### 循环安全保护

| 常量 | 值 | 用途 |
|------|:--:|------|
| MAX_REGISTER_SKILLS | 1000 | 防止技能注册溢出 |
| MAX_PHASE_ITERATIONS | 200 | 防止流程无限循环 |
| MAX_FINDINGS | 1000 | 防止 findings 溢出 |
| MAX_RECOMMENDATIONS | 200 | 防止建议溢出 |
| MAX_SCORE_SKILLS | 500 | 防止匹配评分溢出 |
| MAX_SCAN_DEPTH | 20 | 防止目录递归溢出 |
| GLOBAL_MAX_RECOVERY_LIFETIME | 50 | MCP 全局恢复上限（V6） |

---

## 📖 学术引用

V5 版本基于 **SEC-bench Pro** (Lee et al., UIUC, 2026, arXiv:2605.26548) 的前沿研究成果：

```bibtex
@article{lee2026secbenchpro,
  title={SEC-bench Pro: Can Language Models Solve Long-Horizon Software Security Tasks?},
  author={Lee, Hwiwon and Liu, Jiawei and Kim, Dongjun and Zhang, Ziqi and
          Xia, Chunqiu Steven and Zhang, Lingming},
  journal={arXiv preprint arXiv:2605.26548},
  year={2026}
}
```

| 引用来源 | 应用模块 |
|----------|----------|
| SEC-bench Pro §3.5 三证据裁判 | `src/core/judge.ts` |
| SEC-bench Pro §4.2 RQ1 多 Agent 集成 | `src/agents/ensemble.ts` |
| SEC-bench Pro §3.3 Oracle 验证 | `src/core/poc-validator.ts` |
| SEC-bench Pro §4.3 Token 效率 | `src/utils/token-efficiency.ts` |
| SEC-bench Pro §4.3.2 失败模式追踪 | `src/utils/failure-tracker.ts` |

---

## License

MIT © HOS Team
