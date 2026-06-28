---
name: web-auth-bypass-0day
description: "Web 认证绕过 0day 涵盖身份认证机制中尚未被广泛披露或厂商未修复的逻辑漏洞 适用于: 目标使用最新版本的 JWT/OAuth/Session 认证，存在未公开的绕过方式; OAuth 第三方登录流程中 state 参数校验不严或 redirect_uri 开放重定向; JWT 认证库存在算法混淆或 none 算法未禁用漏洞"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - authentication
  - bypass
  - 0day
  - login
  - session
  - token
  category: web
  risk-level: critical
  confidence: 0.85
---
# Web Authentication Bypass 0day
Web 认证绕过 0day 涵盖身份认证机制中尚未被广泛披露或厂商未修复的逻辑漏洞。这些漏洞不同于传统的暴力破解或弱口令，而是利用认证流程设计缺陷、状态机管理错误、第三方集成信任链断裂等方式，在未获取有效凭据的情况下获得认证状态。常见的 0day 认证绕过包括：OAuth redirect_uri 校验缺陷导致授权码泄露给攻击者控制的服务；JWT 库对特定算法组合的验证路径混乱，允许攻击者在不持有密钥的情况下通过签名验证；MFA 实现中认证状态与会话状态解耦不当，攻击者可在完成第一因素后通过竞态条件或参数操纵跳过第二因素；SSO/SAML 断言解析中对 Audience、NotBefore、NotOnOrAfter 等条件校验不严，允许伪造断言或重放断言；Magic Link / Passwordless 登录中一次性 token 的熵不足或缺乏时效/使用次数限制，导致 token 可预测或重放。这些漏洞的核心在于认证系统各组件之间的信任假设不一致，攻击者通过精准操控流程中的关键参数破坏安全假设
## 何时使用

### 触发场景

- 目标使用最新版本的 JWT/OAuth/Session 认证，存在未公开的绕过方式
- OAuth 第三方登录流程中 state 参数校验不严或 redirect_uri 开放重定向
- JWT 认证库存在算法混淆或 none 算法未禁用漏洞
- 多因素认证 (MFA/2FA) 实现存在时序竞争或会话固定缺陷
- SSO 单点登录流程中 SAML/OIDC 断言校验不严

### 关键词

`认证绕过`, `authentication bypass`, `login bypass`, `session hijack`, `token manipulation`, `0day auth`

### 识别指标

- 200 OK without valid credentials
- unexpected session creation
- token validation skipped
- MFA step skipped in response flow
- redirect to authenticated page without proper auth

### 别名

`认证绕过 0day`, `auth 0day`, `login 0day`

## 操作检查清单

1. 绘制目标认证状态机图，识别所有认证路径（密码登录、OAuth、MFA、SSO、Magic Link）
2. 对每条认证路径测试参数缺失、参数篡改、并发请求等异常场景
3. OAuth：测试 redirect_uri 精确匹配、state 随机性、PKCE 实施、授权码绑定
4. JWT：测试 none 算法、RS256→HS256 混淆、kid 注入、jku/x5u 控制、claim 篡改
5. MFA：测试验证码可预测、时序竞争、会话固定、MFA 状态与认证状态解耦
6. SAML/OIDC：测试断言重放、Audience 校验、签名算法降级、XML 注释注入
7. Magic Link/Passwordless：测试 token 熵、有效期、重放、跨用户复用
8. 密码重置：测试 token 与用户身份绑定、token 失效机制、Referer 泄露
9. 会话管理：测试会话固定、session ID 更换、跨域 session 泄露
10. 使用 Burp Suite 对认证请求进行自动化模糊测试和时序分析

## 技术手段

- OAuth redirect_uri 操纵：使用子域名通配、开放重定向链、CRLF 注入绕过精确匹配
- JWT 算法混淆：修改 alg 字段利用验证路径混乱，RS256 公钥作为 HS256 密钥
- MFA 时序竞争：并发发送 MFA 验证请求和认证完成请求，利用状态更新竞态
- SAML 断言重放：捕获有效断言后重放，利用未校验 NotOnOrAfter 或 Audience
- Magic Link token 预测：分析 token 生成模式，使用弱熵源时预测下一个 token
- 会话固定：预设 session cookie 诱导用户登录，认证后持有有效会话
- 参数注入：在认证请求中注入 role=admin、isAdmin=true 等声明绕过权限检查
- 签名验证绕过：利用 XML 注释、编码差异、算法降级跳过 SAML/JWT 签名验证

## 实战经验

### 症状

- 修改认证请求参数（如 redirect_uri、state、alg）后服务端接受了非常规的认证凭据
- 在未提供密码或 MFA 验证码的情况下，服务端返回了有效的 session cookie 或 token
- SAML/OIDC 断言中的签名验证被跳过或使用了弱签名算法（如 SHA-1）
- MFA 流程中通过并发请求或修改响应状态码跳过了验证步骤
- Magic Link 或 Password Reset Token 可被预测、重放或跨用户复用
- OAuth 授权码在未绑定 PKCE 或客户端的情况下被跨会话使用
- JWT token 的 signature 部分被移除或替换后服务端仍然接受

### 根因分析

- 认证流程中各步骤之间的状态管理不原子，允许攻击者通过竞态条件或参数注入跳过关键步骤
- OAuth/OIDC 实现未严格校验 redirect_uri 的精确匹配，使用子域名通配或前缀匹配
- JWT 验证库未区分对称算法 (HS256) 和非对称算法 (RS256) 的验证路径，导致算法混淆
- SAML 解析器未强制验证断言中的 AudienceRestriction 条件，允许断言跨服务重用
- MFA 验证成功后未将 MFA 状态绑定到会话，后续请求仅检查认证状态而不检查 MFA 状态
- 一次性 token（Magic Link、重置密码）生成算法熵不足（如使用 Math.random 而非 crypto.randomBytes）
- 密码重置流程中 token 未在服务端与用户身份强绑定，可通过篡改参数重置任意用户密码
- 会话固定漏洞：认证前后未更换 session ID，攻击者可通过预设 session 劫持认证状态

### 实战观察

- OAuth redirect_uri 开放重定向是最常见的认证绕过入口，占比超过 40% 的 OAuth 相关漏洞
- MFA 绕过在移动应用中尤为常见，因为移动客户端的认证状态检查通常弱于服务端
- JWT none 算法攻击在 PyJWT < 2.0 和 jsonwebtoken < 9.0 中普遍存在，新版库已默认禁用但仍有很多系统使用旧版
- SAML 断言重放攻击在 SSO 集成中常见，尤其是未启用 OneTimeUse 条件或 NotOnOrAfter 校验的系统
- Magic Link token 重用漏洞在多个流行框架（如 Devise、NextAuth）中曾被披露，核心问题是 token 使用后未及时失效
- 密码重置 token 泄露通过 Referer 头是真实世界中被广泛利用的攻击向量
- 认证绕过 0day 的测试需要深入理解目标系统的认证架构，建议绘制完整的认证状态机图

### 常见错误

- 认为使用了 OAuth/MFA 就绝对安全，忽略了实现层面的配置错误和逻辑缺陷
- 只测试正常的认证流程，未测试异常路径（如缺少参数、并发请求、参数注入）
- 忽略认证流程中的中间状态（如 OAuth code 到 token 的兑换过程），这些中间步骤往往是薄弱环节
- 未考虑时序攻击和竞态条件，很多认证绕过依赖于并发请求的竞争窗口
- 假设 JWT 库会自动处理所有安全场景，实际上很多库需要显式配置算法白名单和验证选项
- 认为 SAML 断言有签名就无法伪造，忽略了签名验证绕过、XML 注释注入、算法降级等攻击向量
- 忽略认证 token 的生命周期管理（签发、刷新、撤销），过长的有效期和缺乏撤销机制是常见缺陷

### 补充说明

- OAuth 2.1 已将 PKCE 设为强制要求，不再支持 Implicit Grant，升级可减少一类认证绕过
- JWT 验证时应始终使用 libraries 的 options 参数明确指定 allowedAlgorithms，不接受 header 中的 alg 自动推断
- SAML 2.0 规范强制要求验证 AudienceRestriction 和 NotOnOrAfter，但很多实现库默认不检查
- MFA 实现应遵循"零信任"原则：每个敏感操作都重新验证 MFA，而非依赖初始认证的 MFA 状态

## 示例

### OAuth redirect_uri 子域名绕过

利用 OAuth 服务提供商对 redirect_uri 的子域名通配校验缺陷，将授权码发送到攻击者控制的子域名

```
合法 redirect_uri: https://app.example.com/callback
攻击 redirect_uri: https://attacker.example.com/callback

步骤 1: 确认目标 OAuth 服务提供商对 redirect_uri 的校验规则
步骤 2: 构造恶意 OAuth 授权请求，redirect_uri 指向攻击者控制的子域名
步骤 3: 用户授权后，授权码发送到 attacker.example.com/callback
步骤 4: 攻击者使用授权码兑换 access_token
```

**适用场景:**
- OAuth 第三方登录
- 社交登录集成
- 企业 SSO

### JWT none 算法认证绕过

将 JWT header 中的 alg 修改为 "none" 并移除签名，利用服务端未显式禁用 none 算法接受无签名 token

```
原始 JWT header: {"alg":"HS256","typ":"JWT"}
修改为: {"alg":"none","typ":"JWT"}
修改 payload 提升权限: {"sub":"admin","role":"superadmin"}
构造最终 token (移除签名): eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.

原理: JWT 规范 (RFC 7519) 支持 "none" 算法用于调试
     部分服务端库默认接受 alg=none 且不对签名进行验证
     适用于使用旧版 JWT 库（PyJWT < 2.0, jsonwebtoken < 9.0）的系统
```

**适用场景:**
- JWT 认证 API
- 微服务间 JWT 认证
- API Gateway JWT 验证

### MFA 时序竞争绕过

利用 MFA 验证状态与会话状态更新的竞态条件，在 MFA 验证完成前发起认证完成请求

```
正常流程: 用户名密码 → pending_mfa → MFA 验证 → authenticated

攻击: 并发发送 MFA 验证请求和认证完成请求
Thread 1: POST /api/mfa/verify {"code":"000000","session_id":"temp_session"}
Thread 2: POST /api/mfa/complete {"session_id":"temp_session"}

如果 Thread 2 在 Thread 1 的状态更新之前执行，
服务端可能将 pending_mfa 状态误判为已验证，返回完整 session cookie

防御: MFA 验证必须使用原子操作更新状态，会话升级应在服务端同步完成
```

**适用场景:**
- MFA/2FA 登录流程
- 企业身份认证
- 银行/金融应用

## 验证标准

### 验证指标

- 使用修改后的认证参数（alg=none、伪造 redirect_uri）成功获取有效 session/token
- 在未提供 MFA 验证码的情况下获得了完整认证状态
- SAML 断言重放后服务端接受并建立了认证会话
- Magic Link token 在已使用后仍可重复登录
- JWT token 签名被移除或替换后，API 返回 200 而非 401

### 成功标志

- 服务端接受伪造或篡改的认证凭据并返回有效 session/token
- 能够以任意用户身份登录（包括管理员）
- MFA 验证步骤被成功跳过，直接进入认证后页面
- 认证绕过在多次测试中稳定复现

### 误报标志

- 服务端返回 200 但实际上是缓存响应或默认错误页面
- 修改参数后返回 401/403，说明认证校验正常工作
- MFA 跳过后服务端要求重新认证，说明状态检查正确
- token 被接受但对应的是匿名用户而非目标用户

## 防御建议

### 推荐做法

- OAuth: redirect_uri 必须精确匹配预注册的完整 URI，不接受通配符或模式匹配
- OAuth: 强制实施 PKCE，授权码必须绑定客户端和 redirect_uri
- JWT: 显式禁用 "none" 算法，使用 allowedAlgorithms 白名单配置验证器
- JWT: RS256 和 HS256 使用独立的验证路径，禁止从 token header 自动推断算法
- MFA: 使用原子操作更新认证状态，避免竞态条件
- MFA: 每个敏感操作重新验证 MFA 状态，不依赖初始认证的 MFA 标记
- SAML: 强制验证 AudienceRestriction、NotOnOrAfter、OneTimeUse 条件
- Magic Link/Passwordless: 使用 crypto-random 生成 token，设置短有效期，使用后立即可失效
- 会话: 认证前后必须更换 session ID，防止会话固定攻击

### 缓解措施

- 定期审计认证流程的实现代码，特别关注状态机转换和边界条件
- 使用自动化安全测试工具测试认证端点
- 对认证相关的第三方库保持更新，关注 CVE 公告和安全补丁
- 实施认证事件日志和告警，及时发现异常认证模式

## 参考链接

- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/
- https://portswigger.net/web-security/oauth
- https://portswigger.net/web-security/jwt
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
