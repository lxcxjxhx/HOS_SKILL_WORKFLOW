# HOS-Sec-Engine 攻防实战规则引擎

> 将 22+ 个攻防实战经验转化为标准化、可执行的 AI 技能，支持 Claude Code / Trae / Cursor 等 AI 编辑器直接调用。

---

## 快速开始

### 一行命令安装全部（零依赖）

```bash
# 一步安装全部 skill 到 Trae IDE（全局可用）
node <(curl -s https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js) -- --target trae --global --all
```

或者直接下载后运行：

```bash
# 下载安装器（只需一次）
curl -o install-lite.js https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js

# 运行安装
node install-lite.js --target trae --global --all
```

**就这么简单，不需要 clone 仓库，不需要 npm install，一步到位。**

---

## 三种安装方式

### 方式一：一行命令安装（最简单）

**Windows PowerShell**（需要 Node.js >= 18）：
```powershell
irm https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js -OutFile install.js; node install.js --target trae --global --all
```

**Linux**（需要 Node.js >= 18 + curl）：
```bash
curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js | node -s --target trae --global --all
```

**macOS**（需要 Node.js >= 18 + curl）：
```bash
curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js | node -s --target trae --global --all
```

**Windows 用户双击运行：**
1. 下载 [one-click-install.bat](https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/one-click-install.bat)
2. 双击运行

**安装选项：**
- `--target trae` / `--target claude-code` / `--target cursor`
- `--global` — 全局安装（所有项目可用）
- `--all` — 安装全部 28 个 skill
- `--skill web-sqli-001,web-xss-001` — 安装指定 skill

**不需要 clone 仓库，不需要 npm install。**

### 方式二：npm 包安装（含完整源码）

**适合人群**：需要使用完整功能、修改源码、新增自定义 skill 的开发者

```bash
# 安装 npm 包（自动部署 skill 到编辑器）
npm install hos-sec-engine
```

安装完成后，可通过以下命令管理 skill：

```bash
# 通过 npx 调用安装器（npm install 后可用）
npx hos-skills install --target trae          # Trae IDE
npx hos-skills install --target claude-code   # Claude Code
npx hos-skills install --target cursor        # Cursor

# 全局安装（所有项目可用）
npx hos-skills install --global --target trae

# 指定安装单个 skill
npx hos-skills install --skill web-sqli-001,web-xss-001
```

> **注意**: `npx hos-skills` 仅在 `npm install hos-sec-engine` 后可用。
> 本地开发时请使用 `node scripts/install-skills.js install` 代替。

**本地开发模式**（克隆仓库后）：

```bash
cd 00-HOS-Sec-Engine
npm install                           # 安装依赖
node scripts/install-skills.js install # 本地运行安装器
```

**安装内容**：
- `skills/` — 所有 SKILL.md 文件（自动部署到编辑器）
- `src/` — TypeScript 完整源码（可编译、可修改）
- `cli/` — 交互式安装工具

### 方式二：npx skills add（纯 skill 文件）

**适合人群**：只需要 skill 指令文件，不需要源码的用户

```bash
# 安装整合 skill（包含所有子技能索引）
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill hos-sec-engine -a claude-code

# 安装单个独立 skill
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill web-sqli-001 -a trae
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill api-jwt-001 -a claude-code
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill cloud-iam-001 -a trae
```

**支持的编辑器**（通过 `-a` 参数指定）：
- `claude-code` — Claude Code
- `trae` — Trae IDE
- `cursor` — Cursor

### 方式三：手动复制（无需安装工具）

**适合人群**：不想用 npm 的用户

1. 克隆仓库：`git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git`
2. 进入 `HOS_SKILL_WORKFLOW/00-HOS-Sec-Engine/skills/`
3. 将需要的 skill 目录复制到编辑器：

```
Trae:        ~/.trae-cn/skills/           （全局）
             项目/.trae/skills/           （局部）

Claude Code: ~/.claude/skills/            （全局）
             项目/.claude/skills/         （局部）

Cursor:      项目/.cursor/rules/          （局部）
```

---

## 功能介绍

### 1. Skill 自动调用

安装 skill 后，在 AI 对话中直接描述安全场景即可自动匹配：

```
用户: "帮我绕过这个 WAF 的 SQL 注入防护"
AI  → 自动使用 web-sqli-001 技能

用户: "测试这个 API 的 JWT 认证有没有漏洞"
AI  → 自动使用 api-jwt-001 技能

用户: "获取了 Linux 普通用户 shell，需要提权"
AI  → 自动使用 linux-priv-esc-001 技能
```

### 2. 22+ 个实战技能

| 分类 | 数量 | Skill ID | 说明 |
|------|------|----------|------|
| **Web 安全** | 11 | `web-sqli-001` | SQL 注入 WAF 绕过 |
| | | `web-xss-001` | XSS 过滤器绕过 |
| | | `web-ssrf-001` | SSRF 检测与利用 |
| | | `web-xxe-001` | XXE 注入攻击 |
| | | `web-rce-001` | 命令注入 |
| | | `web-upload-001` | 文件上传绕过 |
| | | `web-deser-001` | 反序列化漏洞 |
| | | `web-auth-bypass-0day` | 认证绕过 0day |
| | | `web-deser-0day` | 反序列化 0day |
| | | `web-waf-bypass-0day` | WAF 绕过 0day |
| | | `web-xss-0day` | XSS 过滤 0day |
| **API 安全** | 5 | `api-jwt-001` | JWT 攻击与绕过 |
| | | `api-oauth-001` | OAuth 流程攻击 |
| | | `api-idor-001` | IDOR 越权检测 |
| | | `api-ratelimit-001` | 速率限制绕过 |
| | | `api-graphql-injection-001` | GraphQL 注入 |
| **云安全** | 3 | `cloud-iam-001` | IAM 权限提升 |
| | | `cloud-meta-001` | 云元数据 SSRF |
| | | `cloud-s3-001` | S3 配置错误利用 |
| **系统安全** | 4 | `linux-priv-esc-001` | Linux 提权 |
| | | `windows-priv-esc-001` | Windows 提权 |
| | | `ad-domain-enum-001` | AD 域信息收集 |
| | | `container-docker-escape-001` | Docker 容器逃逸 |
| **其他** | 6 | `k8s-misconfig-001` | K8s 配置审计 |
| | | `code-review-java-deser-001` | Java 反序列化代码审计 |
| | | `mobile-android-apk-001` | Android APK 逆向 |
| | | `ai-prompt-injection-001` | Prompt 注入绕过 |

### 3. 渗透测试流程编排

内置完整的渗透测试流程，AI 可自动按流程执行：

```
Web 渗透测试流程:
  信息收集 → web-ssrf-001
  漏洞扫描 → web-sqli-001, web-xss-001, web-xxe-001, web-upload-001
  漏洞利用 → web-rce-001, web-deser-001
  权限提升 → linux-priv-esc-001 / windows-priv-esc-001

API 安全审计流程:
  认证测试 → api-jwt-001, api-oauth-001
  授权测试 → api-idor-001
  速率测试 → api-ratelimit-001

云安全审计流程:
  资产发现 → cloud-s3-001, cloud-meta-001
  权限测试 → cloud-iam-001
```

### 4. AI 自主维护与扩展

AI 可以自行编译、新增 skill 和更新规则：

```bash
# 编译源码（生成最新的 SKILL.md 文件）
npm run build

# 部署 skill 到编辑器
npm run deploy            # 当前项目
npm run deploy:global     # 全局
npm run deploy:claude     # Claude Code 专属
npm run deploy:trae       # Trae IDE 专属

# 生成 skills 索引
npm run generate-skills-index
npm run generate-skills-md
```

### 5. 交互式安装工具

```bash
npx hos-skills              # 启动交互菜单
```

交互菜单提供：
- **整合安装** — 所有 skill 合并为一个 `hos-sec-engine`
- **浏览安装** — 按分类浏览并选择 skill
- **搜索安装** — 关键词搜索 skill
- **领域一键包** — 按领域批量安装（如 web-bundle）
- **安装全部** — 一键安装所有独立 skill

---

## 项目结构

```
00-HOS-Sec-Engine/
├── src/                          # TypeScript 源码（可编译、可修改）
│   ├── core/                     # 引擎核心
│   │   ├── engine.ts             # 主引擎（加载、匹配、评分）
│   │   ├── matcher.ts            # 场景匹配器
│   │   ├── scorer.ts             # 技能评分器
│   │   ├── orchestrator.ts       # 流程编排器
│   │   ├── validator.ts          # 验证器
│   │   ├── report.ts             # 报告生成器
│   │   ├── formatter.ts          # 输出格式化
│   │   └── loader.ts             # 技能加载器
│   ├── skills/                   # 技能源码（按分类组织）
│   │   ├── web/                  # Web 安全技能
│   │   ├── api/                  # API 安全技能
│   │   ├── cloud/                # 云安全技能
│   │   ├── linux/                # Linux 提权
│   │   ├── windows/              # Windows 提权
│   │   └── ...
│   ├── playbooks/                # 渗透测试流程编排
│   │   ├── web/                  # Web 渗透测试流程
│   │   ├── api/                  # API 安全审计流程
│   │   ├── cloud/                # 云安全审计流程
│   │   └── ...
│   └── scripts/                  # 构建和部署脚本
│       ├── generate-skills-md.ts # 从源码生成 SKILL.md
│       ├── generate-skills-index.ts
│       ├── deploy-skills.ts      # 部署到编辑器
│       └── ...
├── skills/                       # 生成的 skill 文件（npx skills add 兼容）
│   ├── hos-sec-engine/           # 整合 skill（入口）
│   │   ├── SKILL.md              # 主 skill 文件
│   │   ├── skills/               # 26 个子技能 .md 文件
│   │   ├── 0day-skills/          # 0day 技能源码
│   │   └── references/           # 技术参考
│   ├── web-sqli-001/             # 独立 skill
│   │   └── SKILL.md
│   ├── web-xss-001/
│   │   └── SKILL.md
│   └── ...                       # 更多独立 skill
├── cli/                          # 交互式安装 CLI
│   ├── index.js
│   └── package.json
├── scripts/                      # 运行脚本
│   └── install-skills.js         # 通用安装器（npx hos-skills）
├── package.json
└── tsconfig.json
```

---

## 使用场景

### 开发者使用
```bash
# 1. 安装
npm install hos-sec-engine

# 2. 在 AI 编辑器中描述场景
# "帮我测试这个登录接口的 SQL 注入"

# 3. AI 自动匹配并应用 web-sqli-001 技能
```

### 安全工程师使用
```bash
# 1. 安装全部 skill
npx hos-skills install --all

# 2. 执行完整渗透测试流程
# "对目标做完整 Web 渗透测试"

# 3. AI 自动按流程执行：信息收集 → 扫描 → 利用 → 提权
```

### AI 自主维护
AI 可以直接：
1. 读取 `skills/*/SKILL.md` 了解技能规则
2. 编辑 `src/skills/` 下的 TypeScript 源码
3. 运行 `npm run build` 重新编译
4. 运行 `npm run deploy` 部署更新后的 skill

---

## 命令行参考

### hos-skills（交互式安装器）

> 通过 `npm install hos-sec-engine` 安装后可用。本地开发时请用 `node scripts/install-skills.js` 代替 `npx hos-skills`。

```bash
node scripts/install-skills.js install                          # 本地开发
npx hos-skills install                            # npm 安装后
npx hos-skills install --target trae              # 指定编辑器
npx hos-skills install --global                   # 全局安装
npx hos-skills install --skill web-sqli-001       # 安装指定 skill
npx hos-skills install --mode standalone          # 独立模式
npx hos-skills install --no-source                # 不安装源码
```

### hos-sec-engine（引擎 CLI）

```bash
# 部署 skill（原有功能）
npx hos-sec-engine deploy                         # 部署 skill
npx hos-sec-engine deploy --global                # 全局部署
npx hos-sec-engine deploy --claude                # 仅 Claude Code
npx hos-sec-engine deploy --trae                  # 仅 Trae IDE

# V4 独立运行模式（新增）
npx hos-sec-engine server --port 3000             # 启动 Agent 通信服务器
npx hos-sec-engine run --skill web-sqli-001 \     # 独立执行 Skill
  --target "https://example.com"
npx hos-sec-engine run --skills web-sqli-001,web-xss-001 \  # 并行执行
  --parallel --target "https://example.com"
npx hos-sec-engine run --skill web-sqli-001 \     # 导出结果
  --output report.json
npx hos-sec-engine run --help                     # 查看帮助
```

### npm scripts

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译 TypeScript，生成 SKILL.md |
| `npm run dev` | 监听模式编译 |
| `npm run deploy` | 部署 skill 到编辑器 |
| `npm run deploy:global` | 全局部署 |
| `npm run generate-skills-md` | 重新生成所有 SKILL.md |
| `npm run generate-skills-index` | 生成 skills-index.json |

---

## V4 独立 Skill 运行时

### 架构演进

V4 将 HOS-Sec-Engine 从**纯 IDE 提示词工具**升级为**可独立运行的攻防 Skill 生态系统**。

```
传统模式（V1-V3）：
  AI IDE → Skill 作为提示词 → AI 生成建议

独立模式（V4）：
  AI IDE / CLI → Skill Engine → 子 Agent 编排 → 独立执行 → 结果聚合
```

### AI Provider 配置

支持 OpenAI、Anthropic、本地模型等多 Provider，API Key 加密存储：

```bash
# 方式一：环境变量（推荐）
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# 方式二：配置文件
cp config/providers.json.example config/providers.json
# 编辑配置，填入 API Key
```

### 多 Agent 协同场景

**场景 1：并发漏洞扫描**
```
主 Agent
  ├── 子 Agent 1 (SQL注入) → 扫描 /login
  ├── 子 Agent 2 (XSS)     → 扫描 /search
  └── 子 Agent 3 (SSRF)    → 扫描 /api/proxy
  ↓
结果聚合 → 统一报告
```

**场景 2：串行渗透测试**
```
阶段 1：信息收集 → 发现登录接口
  ↓
阶段 2：SQL 注入 → 获取数据库凭据
  ↓
阶段 3：权限提升 → 使用凭据登录管理后台
```

### 独立运行示例

```bash
# 配置环境变量
export OPENAI_API_KEY=sk-...
export HOS_SEC_TARGET=https://example.com

# 执行单个 Skill
npx hos-sec-engine run --skill web-sqli-001 --target "https://example.com"

# 并行执行多个 Skill
npx hos-sec-engine run --skills web-sqli-001,web-xss-001,web-ssrf-001 \
  --parallel --target "https://example.com" --output report.json

# 启动 Agent 服务器（供子 Agent 通信）
npx hos-sec-engine server --port 3000
```

---

## 环境要求

| 平台 | 要求 |
|------|------|
| **Windows** | Node.js >= 18.0.0, PowerShell 5+ |
| **Linux** | Node.js >= 18.0.0, curl |
| **macOS** | Node.js >= 18.0.0, curl |
| **AI 编辑器** | Claude Code / Trae IDE / Cursor |

## License

MIT
