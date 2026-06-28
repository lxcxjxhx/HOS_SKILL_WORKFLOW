# HOS-Sec-Engine 攻防实战规则引擎

> 将 28 个攻防实战技能（24 个核心 + 4 个 0day）标准化、可执行的 AI 技能，支持 Claude Code / Trae / Cursor 等 AI 编辑器直接调用。

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
- `--all` — 安装全部 skill
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
- `scripts/install-skills.js` — 交互式安装工具（`npx hos-skills`）

### 方式三：npx skills add（纯 skill 文件）

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

### 方式四：手动复制（无需安装工具）

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

### 2. 28 个实战技能

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
| | | `test-verify-001` | 技能创建验证（测试） |
| | | `hos-sec-engine` | 统一攻防引擎（编排器 + 技能索引） |

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
├── scripts/                      # 运行脚本
│   └── install-skills.js         # 通用安装器（npx hos-skills）
├── package.json
└── tsconfig.json
```

---

## Skill 命名约定

HOS-Sec-Engine 技能采用统一的命名规范：

```
{category}-{descriptive-name}[-0day]
```

| 部分 | 说明 | 示例 |
|------|------|------|
| `{category}` | 所属领域分类 | `web`, `api`, `cloud`, `linux`, `windows` |
| `{descriptive-name}` | 技能描述标识 | `sqli`, `xss`, `jwt`, `iam` |
| `-0day`（可选） | 0day 追踪标记 | `auth-bypass-0day`, `xss-0day` |

**现有技能**使用 `-001` 后缀（如 `web-sqli-001`），这是早期的版本标记方式。新增技能应使用 `{category}-{descriptive-name}` 格式，`-001` 后缀已废弃。版本信息通过 `metadata.updatedAt` 字段管理。

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
| `npm run build` | 编译 TypeScript，生成 SKILL.md（含 postbuild 自动生成索引） |
| `npm run dev` | 监听模式编译 |
| `npm run start` | 运行示例代码 |
| `npm run deploy` | 部署 skill 到编辑器 |
| `npm run deploy:global` | 全局部署 |
| `npm run deploy:claude` | 仅 Claude Code 部署 |
| `npm run deploy:trae` | 仅 Trae IDE 部署 |
| `npm run generate-skills-md` | 重新生成所有 SKILL.md |
| `npm run generate-playbooks-md` | 生成渗透测试流程文档 |
| `npm run generate-skills-index` | 生成 skills-index.json |
| `npm run generate-bundled-skill` | 生成整合版 skill |
| `npm run install:skills` | 运行交互式安装器 |

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

## 性能优化

引擎核心模块经过多轮性能优化，显著提升技能加载、匹配和执行效率：

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `scorer.ts` | 双重遍历优化 | 两次独立遍历计算分数 | 单次遍历完成所有评分逻辑 |
| `orchestrator.ts` | Set缓存优化 | O(n)线性查找已执行技能 | O(1)查找，使用Set数据结构 |
| `engine.ts` | 重复验证修复 | 加载和匹配阶段重复验证 | 通过skipValidation参数避免重复 |
| `loader.ts` | 去重加载优化 | 可能重复加载同名技能 | seenIds + seenFiles双重去重 |
| `matcher.ts` | 空值处理优化 | 使用`||`操作符（误判空字符串） | 使用`??`空值合并操作符 |

### V3 性能优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `scorer.ts` | query 分词缓存 | 每次场景匹配重复创建 queryTokens Set | 方法内只创建一次，后续复用 |
| `engine.ts` | registerSkills 缓存优化 | 循环中每次迭代执行 cachedSkillsList=null | 移到循环结束后只执行一次 |
| `scorer.ts` | 重复 null 检查合并 | 两个独立 early return 分别检查 | 合并为单个 if 判断 |
| `formatter.ts` | null 安全修复 | 缺少 null 检查可能抛 TypeError | 使用 `?.` 和 `??` 操作符 |
| `orchestrator.ts` | 修复描述截断显示 | 条件性添加 `...` 省略号 | 截断后始终添加 `...` |
| `loader.ts` | 注释与代码同步 | 注释与实际逻辑不一致 | 更新注释反映当前行为 |
| `matcher.ts` | 移除重复 DEFAULT_CONFIG | 重复定义默认配置常量 | 统一使用单一常量 |

### V4 性能优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `orchestrator.ts` | DRY 重构 phase 循环逻辑 | executeFlow 和 resume 中存在约 40% 重复的 phase 循环代码 | 提取为 `_executePhaseLoop`、`_processPhaseResult`、`_trySkipPhase`、`_buildSkippedResult` 私有方法 |
| `scorer.ts` | 场景 token 缓存 | calculateStringSimilarity 每次重复计算 Jaccard 相似度 | 增加 LRU 风格 Map 缓存（最大 500 条目），避免重复计算 |
| `engine.ts` | getSkillsByPlaybook 缓存 | 每次调用重新遍历所有技能匹配 playbook | 添加 playbookId → skills 结果缓存，registerSkill/removeSkill/clearSkills 时自动失效 |
| `coordinator.ts` | collectResult Promise 化 | 使用 setTimeout 忙等待轮询收集结果 | 改为纯 Promise 等待机制，消除忙等待 |
| `report.ts` | HTML 模板 literal | generateHTML 使用字符串拼接构建 HTML | 改为模板 literal + map 表达式，提升可读性 |
| `server.ts` | 请求大小限制 | parseBody 无请求大小限制，存在 DoS 风险 | 增加 10MB 请求大小限制，防止 DoS 攻击 |
| `loader.ts` | require.cache 清理 | loadSkillsFromFile 热加载时可能使用缓存的旧代码 | 加载前清理 require.cache，确保热加载时使用最新代码 |

### V10 循环安全全覆盖实测验证

| 验证项 | 结果 | 详情 |
|--------|------|------|
| 实际构建 | ✅ 通过 | `npm run build` 零编译错误，28 SKILL.md + 5 PLAYBOOK.md 生成 |
| 实际安装 | ✅ 通过 | `npx hos-sec-engine deploy --trae` 27/27 skills 部署成功 |
| Skill 加载 | ✅ 通过 | 27 个 Skill 全部加载成功 |
| SQLi 匹配 | ✅ 通过 | web-sqli-001 正确匹配，耗时 1ms |
| XSS 匹配 | ✅ 通过 | web-xss 系列正确匹配，耗时 1ms |
| JWT 匹配 | ✅ 通过 | api-jwt-001 正确匹配，耗时 0ms |
| 流程编排 | ✅ 通过 | Web 渗透测试 3 阶段完成，7 个 Skill，无无限循环 |
| 缓存验证 | ✅ 通过 | 100 次重复匹配总耗时 18ms（平均 0.18ms/次） |
| 缓存统计 | ✅ 通过 | scorer 命中率 96.2%，matcher 命中率 96.1% |
| 启用/禁用 | ✅ 通过 | Skill 状态切换正常 |

**循环保护全覆盖确认**: orchestrator.ts (MAX_PHASE_ITERATIONS=200, MAX_FINDINGS=1000, MAX_RECOMMENDATIONS=200), loader.ts (MAX_SCAN_DEPTH=20+visitedDirs), deploy-skills.ts (MAX_SCAN_DEPTH=20+visitedDirs for both findSkillFiles and copyDirSync), generate-skills-md.ts/generate-bundled-skill.ts (MAX_SCAN_DEPTH=20+visitedDirs), scorer.ts (MAX_SIMILARITY_CACHE_SIZE=500, MAX_SCENARIOS=100), matcher.ts (MAX_FILTER_CACHE_SIZE=200, MAX_SCORE_SKILLS=500), engine.ts (MAX_REGISTER_SKILLS=1000, MAX_PLAYBOOK_SKILL_LINKS=500), server.ts (MAX_BODY_SIZE=10MB)

### V12 无限制循环优化实测验证 + 模块化测试体系

| 验证项 | 结果 | 详情 |
|--------|------|------|
| 实际构建 | ✅ 通过 | `npm run build` 零编译错误，28 SKILL.md + 5 PLAYBOOK.md 生成 |
| 实际安装 | ✅ 通过 | `npx hos-sec-engine deploy --trae` 27/27 skills 部署成功 |
| Skill 加载 | ✅ 通过 | 27 个 Skill 全部加载成功 |
| SQLi 匹配 | ✅ 通过 | web-sqli-001 正确匹配 |
| XSS 匹配 | ✅ 通过 | web-xss-001 正确匹配 |
| JWT 匹配 | ✅ 通过 | api-jwt-001 正确匹配 |
| 流程编排 | ✅ 通过 | 3 个 Playbook 加载成功，Web 渗透测试执行完成，无无限循环 |
| 性能验证 | ✅ 通过 | 100 次重复匹配耗时 27ms（平均 0.27ms/次） |
| 启用/禁用 | ✅ 通过 | Skill 状态切换正常 |
| 循环保护 | ✅ 通过 | MAX_PHASE_ITERATIONS=200 生效 |
| 分类统计 | ✅ 通过 | 11 个分类统计正常 |
| 模块化测试 | ✅ 通过 | tests/ 目录结构建立，npm test 脚本完善 |
| 临时文件清理 | ✅ 通过 | 主目录无残留临时测试/安装文件 |

### V11 循环安全全覆盖深度优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `deploy-skills.ts` | findSkillFiles 符号链接循环检测 | 仅有深度限制，缺少 visitedDirs 符号链接循环检测 | 增加 `visitedDirs` Set 通过 `fs.realpathSync` 检测循环，与同文件 `copyDirSync` 保持一致 |
| `engine.ts` | 批量注册 Skill 上限 | `registerSkills` 无数量限制，异常数据可导致内存耗尽 | 增加 `MAX_REGISTER_SKILLS = 1000` 常量，超出时输出警告并截断 |
| `engine.ts` | Playbook Skill 关联上限 | `getSkillsByPlaybook` 无关联数量限制 | 增加 `MAX_PLAYBOOK_SKILL_LINKS = 500` 常量，超出时终止收集并输出警告 |
| `orchestrator.ts` | Findings 转换上限 | `convertToFindings` 无数量限制 | 增加 `MAX_FINDINGS = 1000` 常量，超出时终止转换并输出警告 |
| `orchestrator.ts` | Summary 构建保护 | `buildSummary` exploited 数组无上限 | 增加 `MAX_FINDINGS` 检查，防止异常大量 findings |
| `orchestrator.ts` | Recommendations 上限 | `buildRecommendations` 无数量限制 | 增加 `MAX_RECOMMENDATIONS = 200` 常量，超出时终止收集 |
| `scorer.ts` | Scenarios 遍历上限 | `calculateScenarioScore` 遍历所有 scenarios 无限制 | 增加 `MAX_SCENARIOS = 100` 常量，超出时仅处理前 100 个并输出警告 |
| `matcher.ts` | 评分 Skill 上限 | `match` 遍历所有 filteredSkills 无限制 | 增加 `MAX_SCORE_SKILLS = 500` 常量，超出时仅处理前 500 个并输出警告 |

### V9 循环安全全覆盖优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `generate-skills-md.ts` | 最大递归深度保护 | `copyDirRecursive` 仅有符号链接循环检测，无深度限制 | 增加 `MAX_SCAN_DEPTH = 20` 常量 + `depth` 参数，超出时输出警告并跳过 |
| `generate-bundled-skill.ts` | 最大递归深度保护 | `copyDirSync` 仅有符号链接循环检测，无深度限制 | 增加 `MAX_SCAN_DEPTH = 20` 常量 + `depth` 参数，超出时输出警告并跳过 |
| `deploy-skills.ts` | 最大递归深度保护 | `findSkillFiles` 和 `copyDirSync` 均无深度限制和符号链接检测 | 增加 `MAX_SCAN_DEPTH = 20` 常量 + `depth` 参数 + `visitedDirs` Set 双重保护 |
| `orchestrator.ts` | 迭代次数上限提升 | `MAX_PHASE_ITERATIONS = 100` 对复杂多阶段流程可能不够 | 提升至 `MAX_PHASE_ITERATIONS = 200`，为复杂流程提供更大空间 |

### V8 循环安全优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `loader.ts` | 符号链接循环检测 | `scanDirectory` 无循环符号链接检测，遇到循环 symlink 会无限递归 | 增加 `visitedDirs` Set 通过 `fs.realpathSync` 检测循环，遇到循环时输出警告并跳过 |
| `loader.ts` | 最大递归深度保护 | 无递归深度限制，深层目录结构可能导致栈溢出 | 增加 `MAX_SCAN_DEPTH = 20` 常量，超出深度限制时输出警告并跳过 |
| `orchestrator.ts` | 最大迭代次数保护 | `_executePhaseLoop` 无迭代次数限制，异常流程定义可能导致无限循环 | 增加 `MAX_PHASE_ITERATIONS = 100` 常量，超出限制时终止执行并输出警告 |
| `generate-skills-md.ts` | 符号链接循环检测 | `copyDirRecursive` 无循环检测 | 增加 `visitedDirs` 参数通过 `fs.realpathSync` 检测循环 |
| `generate-bundled-skill.ts` | 符号链接循环检测 | `copyDirSync` 无循环检测 | 增加 `visitedDirs` 参数通过 `fs.realpathSync` 检测循环 |
| `generate-skills-md.ts` | 边界条件修复 | `generateDescription` 中 `desc.split(/[.。]/)[0].trim()` 当 split 返回空数组时 `.trim()` 在 undefined 上抛 TypeError | 使用可选链 `?.trim()` 安全处理 |
| `generate-skills-index.ts` | 边界条件修复 | `extractDescription` 中 `firstSentence.slice(0, 200)` 当 firstSentence 为 undefined 时抛 TypeError | 使用 `(firstSentence \|\| '').slice(0, 200)` 安全处理 |
| `scorer.ts` | 空数组保护 | `calculateKeywordScoreWithItems` 已有空数组保护（确认无误） | 保持不变 |

### V7 性能优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `engine.ts` | 缓存一致性修复 | `enableSkill`/`disableSkill`/`removeSkill`/`clearSkills` 未清除 matcher 缓存 | 所有方法统一调用 `matcher.clearCache()` 和 `cachedPlaybookSkills.clear()` |
| `engine.ts` | 新增工具方法 | 缺少按分类查询 Skill 的接口 | 新增 `getSkillCountByCategory()` 和 `getSkillsByCategory()` 方法 |
| `scorer.ts` | 缓存统计 | 无法获取缓存命中率数据 | 添加 `cacheHits`/`cacheMisses` 计数器 + `getCacheStats()` 方法 |
| `matcher.ts` | 缓存统计 | 无法获取过滤缓存命中率数据 | 添加 `filterCacheHits`/`filterCacheMisses` 计数器 + `getCacheStats()` 方法 |
| `orchestrator.ts` | buildReport 优化 | 使用大量 `lines.push()` 逐行构建报告 | 改为模板 literal + `map` 表达式，提升可读性 |
| `report.ts` | generateMarkdown 优化 | 使用 `for` 循环逐行构建 Markdown | 改为模板 literal + `map` + `join`，代码更简洁 |
| `validator.ts` | validateBatch 空值处理 | 空数组输入仍遍历循环 | 输入空数组时快速返回空 Map |

### V5 性能优化

| 模块 | 优化项 | 优化前 | 优化后 |
|------|--------|--------|--------|
| `execution-context.ts` | AsyncLocalStorage 改造 | 使用全局 `_currentContext` 变量管理上下文，异步并发时存在竞态风险 | 使用 `AsyncLocalStorage` 替代全局变量，新增 `run<T>` 方法支持上下文隔离 |
| `sandbox.ts` | 超时泄漏修复 | `timeoutId` 在 `finally` 块中可能为 `undefined`，缺少空值保护 | 增加 `if (timeoutId !== undefined)` 检查，消除定时器泄漏 |
| `agent-pool.ts` | Agent 池管理优化 | `releaseAgent` 使用 `agent.terminate()` 将状态设为 `failed`，无法复用 | 改用 `agent.reset()` 重置为 `idle`，新增 `getAgentById()`、`getAgentState()` 方法 |
| `sub-agent.ts` | 移除模拟延迟 | `executeTask` 使用 `setTimeout(Math.min(100, input.timeout))` 模拟延迟 | 直接返回结果，保留超时处理逻辑 |
| `provider-manager.ts` | 加密安全增强 | 使用硬编码默认密钥时无任何警告 | 输出 `console.warn` 警告，`NODE_ENV === 'production'` 时抛出 Error |
| `matcher.ts` | 过滤结果缓存 | 相同查询条件每次都遍历所有 Skill 进行过滤 | 添加查询条件缓存（最大 200 条目），LRU 风格淘汰，减少 30% 过滤开销 |
| `formatter.ts` | 输出构建优化 | `formatText` 使用大量 `output.push()` 逐行构建 | 改为 `results.map()` + 模板 literal，提升可读性 |
| `engine.ts` | 批量注册优化 | `strictMode=false` 时重复 ID 导致覆盖，每次 `registerSkill` 调用都清除缓存 | 重复 ID 时 `continue` 跳过，仅一次缓存失效 |

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
