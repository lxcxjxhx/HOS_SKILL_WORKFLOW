# HOS-Sec-Engine MCP 攻防流程模板

> 使用真实 MCP 服务器（Playwright + HTTP + Sequential Thinking + Memory）组合出自动化攻防闭环。

## 前置条件

### 安装 MCP 服务器

```bash
# Playwright MCP
npx @anthropic/mcp-playwright

# HTTP Fetch MCP
npx @anthropic/mcp-fetch

# Sequential Thinking MCP
npx @anthropic/mcp-sequential-thinking

# Memory MCP
npx @anthropic/mcp-memory

# Filesystem MCP
npx @anthropic/mcp-filesystem --allowed-directories ./payloads,./logs
```

### 配置 MCP

将 `config/mcp-servers.json` 内容复制到 Claude Desktop 的 `claude_desktop_config.json` 中。

## 模板结构

```
templates/mcp-flows/
├── README.md
├── scenarios/          ← 按攻击场景分类的流程模板
│   ├── xss-bypass.md
│   ├── sql-injection.md
│   ├── waf-recon.md
│   └── auth-bypass.md
└── payloads/           ← 与技能关联的 payload 集
    ├── xss/
    ├── sqli/
    └── rce/
```

## 流程架构

```
用户输入目标 + 技能ID
        ↓
Sequential Thinking MCP (拆解攻击步骤)
    ├── 阶段1: 侦察 (HTTP MCP + Playwright MCP)
    ├── 阶段2: 探测 (HTTP MCP)
    ├── 阶段3: 攻击 (HTTP MCP + Playwright MCP)
    ├── 阶段4: 验证 (Playwright MCP)
    └── 阶段5: 记录 (Memory MCP + Filesystem MCP)
        ↓
输出: 检测报告 + Memory 更新
```

## 使用方法

```bash
# 1. 选择一个场景模板
cat templates/mcp-flows/scenarios/xss-bypass.md

# 2. 在 Claude Desktop 中打开，MCP 工具自动可用
# 3. Sequential Thinking MCP 会自动执行多步攻击链
# 4. Playwright MCP 负责浏览器验证
# 5. Memory MCP 记录结果供下次参考
```
