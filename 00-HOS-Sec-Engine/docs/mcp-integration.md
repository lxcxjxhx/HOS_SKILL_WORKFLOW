# HOS-Sec-Engine V2 + MCP 集成指南

> HOS-Sec-Engine V2 通过 Process Engine 流程引擎编排安全测试流程，流程模板中的每个步骤通过 ToolRegistry 调用 MCP 工具执行具体操作。

---

## 一、架构总览

```
流程模板 (YAML)
  │
  ├── 阶段 1: 信息收集
  │     ├── 步骤 1: toolCall → web_fetch
  │     ├── 步骤 2: toolCall → web_fetch
  │     └── 步骤 3: toolCall → search_google
  │
  ├── 阶段 2: 漏洞检测
  │     ├── 步骤 1: toolCall → web_fetch (SQL 注入 payload)
  │     └── 步骤 2: toolCall → web_fetch (XSS payload)
  │
  └── 决策树 → 动态决定下一阶段

Process Engine
        │
        ▼
PhaseExecutor
        │
        ├── 解析模板变量 ({{target}} → 实际值)
        ├── 调用 registry.callTool(toolName, params)
        ▼
  ┌─────────────────┐
  │   ToolRegistry   │  ← 统一工具注册表
  ├─────────────────┤
  │ web_fetch       │  → HTTP 请求（内置 fetch）
  │ search_google   │  → 搜索引擎（MCP 代理）
  │ cve_query       │  → CVE 漏洞查询
  │ ...             │
  └─────────────────┘
        │
        ▼
  ┌──────────────────────────────┐
  │   MCP 自我管理层（可选）      │
  ├──────────────────────────────┤
  │ MCPRegistry  ← 服务器注册    │
  │ MCPDiscovery ← 自动发现      │
  │ MCPRouter    ← 工具路由      │
  │ MCPHealthMonitor ← 健康监控  │
  └──────────────────────────────┘
```

### 调用链说明

1. **流程模板（YAML）** 定义阶段和步骤，每个步骤指定 `toolCall` 中的工具名称和参数
2. **ProcessEngine** 加载模板，按阶段顺序驱动执行，每个阶段结束后通过决策树决定下一阶段
3. **PhaseExecutor** 执行单个阶段的所有步骤，解析模板变量（如 `{{target}}`），调用 ToolRegistry
4. **ToolRegistry** 作为统一工具注册表，根据工具名称查找已注册的处理器并执行
5. **MCP 自我管理层**（可选模块）提供 MCP 服务器的自动发现、注册、健康监控和路由能力

---

## 二、Process Engine 中的 MCP 调用流程

### 2.1 流程引擎启动

```typescript
// 创建流程引擎（自动注册内置工具）
const engine = new ProcessEngine({
  enableCveEnrichment: true,
  continueOnPhaseFailure: true,
  autoRegisterTools: true,
});

// 加载流程模板
engine.loadTemplates();  // 从 src/playbooks/process-templates/ 加载所有 .yaml 文件

// 执行流程
const result = await engine.execute('https://target.com', 'web-pentest-full');
```

### 2.2 ToolRegistry 工具注册

所有可调用的工具都通过 ToolRegistry 注册，支持内置工具和 MCP 扩展工具：

```typescript
// 工具注册表（全局单例）
import { toolRegistry, ToolRegistry } from '../core/tool-registry';

// 注册内置工具
toolRegistry.register({
  name: 'web_fetch',               // 工具名称，在 YAML 模板中引用
  description: '获取网页内容',
  handler: async (params) => {
    const response = await fetch(params.url);
    const text = await response.text();
    return { tool: 'web_fetch', params, output: text, success: true, duration: 0 };
  },
  timeout: 30000,
});
```

### 2.3 阶段执行流程

PhaseExecutor 执行单个阶段时，对每个步骤执行以下流程：

```typescript
// phase-executor.ts 中的核心执行逻辑
async execute(phase: Phase, context: Record<string, any>): Promise<PhaseResult> {
  for (const step of phase.steps) {
    // 1. 解析模板变量：将 {{target}} 替换为实际 URL
    const resolvedParams = this.resolveTemplateVariables(step.toolCall.params, context);

    // 2. 通过 ToolRegistry 调用工具
    const toolResult = await this.registry.callTool(step.toolCall.tool, resolvedParams);

    // 3. 从工具输出中提取发现（漏洞特征匹配）
    const stepFindings = this.extractFindings(step, toolResult);
    findings.push(...stepFindings);
  }
}
```

### 2.4 决策树驱动

每个阶段执行完成后，ProcessEngine 通过决策树决定下一阶段：

```typescript
// 决策树评估
const decision = this.decisionTree.evaluate(phase.id, phaseResult);
if (decision.nextPhase) {
  // 进入下一阶段
  currentPhaseIndex = template.phases.findIndex(p => p.id === decision.nextPhase);
}
```

---

## 三、流程模板中的 MCP 工具调用

### 3.1 模板结构

YAML 流程模板定义阶段和步骤，步骤中通过 `toolCall` 指定要调用的工具：

```yaml
id: web-pentest-full
name: Web 渗透测试完整业务指导流程
description: 从信息收集到后渗透的完整 Web 渗透测试流程
category: web
version: 2.0.0

phases:
  - id: reconnaissance
    name: 信息收集与资产测绘
    steps:
      - id: step-fetch-homepage
        name: 首页信息采集
        toolCall:
          tool: web_fetch            # 工具名称，对应 ToolRegistry 中注册的工具
          params:
            url: "{{target}}"        # 模板变量，执行时替换
        expectedOutput: HTML 页面内容

    condition: null
    successCriteria:
      - 已识别目标 Web 服务器类型和版本
    maxRetries: 2
    timeout: 300

decisionTree:
  - id: decide-after-recon
    sourcePhase: reconnaissance
    conditions:
      - rule: "result.hasFindings()"
        nextPhase: sqli-detection
    defaultNext: sqli-detection
```

### 3.2 工具调用参数

每个步骤的 `toolCall` 包含两个核心字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `tool` | string | 工具名称，对应 ToolRegistry 中注册的工具标识 |
| `params` | object | 工具参数，支持 `{{variable}}` 模板变量语法 |

### 3.3 模板变量解析

PhaseExecutor 在执行步骤时自动解析模板变量：

```typescript
// 上下文中可用的变量
const execContext = {
  target: 'https://target.com',          // 目标 URL
  target_host: 'target.com',             // 目标主机名
  ...processContext.state,               // 流程自定义状态
};

// 模板变量 {{target}} 会被自动替换为 https://target.com
```

---

## 四、已配置的流程模板

| 模板文件 | 模板 ID | 所需工具 | 适用场景 |
|---------|---------|---------|---------|
| `web-pentest.yaml` | `web-pentest-full` | web_fetch（HTTP 请求） | Web 渗透测试完整流程 |
| `api-security-audit.yaml` | `api-security-audit` | web_fetch | API 安全审计 |
| `cloud-config-audit.yaml` | `cloud-config-audit` | web_fetch | 云配置安全审计 |

模板文件位于 `src/playbooks/process-templates/` 目录下。

---

## 五、扩展 MCP 工具

### 5.1 注册自定义工具

通过 ToolRegistry 注册新的工具，使其可在流程模板中被调用：

```typescript
import { toolRegistry } from '../core/tool-registry';

toolRegistry.register({
  name: 'my_custom_tool',
  description: '自定义工具描述',
  handler: async (params) => {
    // 实现工具逻辑
    return { tool: 'my_custom_tool', params, output: '...', success: true, duration: 0 };
  },
  timeout: 15000,
});
```

### 5.2 使用 MCP 自我管理层

对于需要自动发现和管理的外部 MCP 服务器，可使用 MCP 自我管理层：

```typescript
import { mcpDiscovery, mcpRegistry, mcpRouter } from '../mcp';

// 自动发现 MCP 服务器
await mcpDiscovery.discover();

// 注册 MCP 服务器
mcpRegistry.register({
  identity: { name: 'my-mcp-server', version: '1.0.0' },
  tools: [
    { name: 'custom_tool', description: '...', inputSchema: {} }
  ],
  status: 'active',
});

// 路由查询
const route = mcpRouter.findRoute({ toolName: 'custom_tool' });
```

---

## 六、效果验证

验证流程引擎 + MCP 工具集成的正确性：

1. 启动流程引擎：`node dist/index.js`
2. 加载流程模板：引擎自动加载 `src/playbooks/process-templates/` 下的所有模板
3. 执行流程：`engine.execute('https://example.com', 'web-pentest-full')`
4. 观察执行日志：
   - ProcessEngine 输出阶段信息和决策结果
   - PhaseExecutor 输出每个步骤的工具调用详情
   - ToolRegistry 输出工具调用统计
5. 查看结果：`result.summary` 包含发现总数、严重级别分布、CVE 引用等