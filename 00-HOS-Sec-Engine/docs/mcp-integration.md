# HOS-Sec-Engine + MCP 集成指南

> 将 33 个攻防技能通过真实 MCP 工具（Playwright / HTTP / Memory / Sequential Thinking）转化为可执行的自动化攻防闭环。

---

## 一、架构总览

```
用户请求 ("测试 target.com 的 XSS 防护")
        │
┌───────┴──────────────────────────────────┐
│           Sequential Thinking MCP         │
│   ┌────────────────────────────────────┐  │
│   │ 自动拆解攻击步骤:                    │  │
│   │ 1. 发送探测 payload                 │  │
│   │ 2. 识别 WAF 类型                    │  │
│   │ 3. 选择绕过策略（参考 SKILL.md）     │  │
│   │ 4. 执行攻击                          │  │
│   │ 5. 验证结果                          │  │
│   │ 6. 记录到 Memory                     │  │
│   └────────────────────────────────────┘  │
└───────────────────┬──────────────────────┘
                    │
    ┌───────────────┼───────────────────┐
    │               │                   │
┌───▼───┐     ┌────▼────┐     ┌───────▼──┐
│ HTTP  │     │Playwright│     │  Memory  │
│ Fetch │     │   MCP    │     │   MCP    │
│  MCP  │     │          │     │          │
├───────┤     ├──────────┤     ├──────────┤
│ 请求  │     │ 浏览器   │     │ WAF指纹  │
│ 变形  │     │ 验证     │     │ 学习     │
│       │     │          │     │          │
│ injec-│     │ DOM XSS  │     │ payload  │
│ tion  │     │ 验证     │     │ 成功率   │
│ send  │     │          │     │ 记忆     │
└───────┘     └──────────┘     └──────────┘
```

---

## 二、Skill → MCP 工具映射矩阵

每个 HOS-Sec-Engine 技能的知识层（knowledge）、操作层（action）和验证层（validation）
通过以下 MCP 工具执行：

| HOS 技能组件 | MCP 工具 | 说明 |
|-------------|---------|------|
| **trigger.scenarios** | Sequential Thinking | 自动匹配场景 → 规划策略 |
| **action.checklist** | Sequential Thinking | 拆解为可执行步骤 |
| **action.techniques** | HTTP Fetch / Playwright | 执行具体攻击技术 |
| **action.examples** | HTTP Fetch + Playwright | 运行示例 payload |
| **validation.indicators** | Playwright / HTTP | 验证是否成功 |
| **validation.successSigns** | Playwright evaluate | 检查执行结果 |
| **defense.mitigations** | Memory MCP | 记录有效防御 |
| **knowledge.observations** | Memory MCP | 存储实战经验 |

---

## 三、Claude Desktop 配置

### 1. 安装 MCP 服务器

```bash
# 核心 MCP（必须）
npx @anthropic/mcp-playwright          # 浏览器自动化
npx @anthropic/mcp-fetch               # HTTP 请求
npx @anthropic/mcp-sequential-thinking  # 多步推理
npx @anthropic/mcp-memory              # 持久记忆
npx @anthropic/mcp-filesystem          # 文件系统
```

### 2. 配置 claude_desktop_config.json

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    },
    "http-fetch": {
      "command": "npx",
      "args": ["@anthropic/mcp-fetch"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["@anthropic/mcp-sequential-thinking"]
    },
    "memory": {
      "command": "npx",
      "args": ["@anthropic/mcp-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@anthropic/mcp-filesystem", "--allowed-directories", "./payloads,./logs,./results"]
    }
  }
}
```

### 3. 使用方式

在 Claude Desktop 中加载技能后，直接调用 MCP 工具：

```
加载技能: /load-skill web-xss-001
执行流程: 使用 templates/mcp-flows/scenarios/xss-bypass.md 中的 MCP 调用序列
验证结果: 使用 Playwright 截图和 evaluate
记录结果: 使用 Memory MCP 持久化
```

---

## 四、HOS-Sec-Engine 技能调用 MCP 的统一格式

所有技能的 action.techniques 现在映射到 MCP 工具调用：

```typescript
// 标准 MCP 调用接口
interface MCPAttackCall {
  mcpServer: 'http-fetch' | 'playwright' | 'sequential-thinking' | 'memory' | 'filesystem';
  action: string;
  params: Record<string, any>;
  
  // 可选: 关联的 SKILL.md 中的技术/示例 ID
  skillRef?: {
    skillId: string;
    technique?: string;
    example?: string;
  };
}
```

---

## 五、已配置的 MCP 流程模板

| 模板 | 关联技能 | 所需 MCP |
|------|---------|---------|
| `xss-bypass.md` | `web-xss-001`, `web-xss-0day` | HTTP + Playwright + Memory |
| `sql-injection.md` | `web-sqli-001` | HTTP + Memory + Sequential Thinking |
| `waf-recon-bypass.md` | `web-waf-bypass-0day` | HTTP + Playwright + Sequential Thinking + Memory |

---

## 六、效果验证

配置完成后，在 Claude Desktop 中尝试：

1. `加载 web-xss-001 技能`
2. `对 https://example.com/search?q=test 进行 XSS 绕过测试`
3. Sequential Thinking MCP 自动拆解步骤
4. HTTP Fetch MCP 发送 payload
5. Playwright MCP 浏览器验证
6. Memory MCP 记录结果
