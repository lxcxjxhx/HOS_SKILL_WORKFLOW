---
name: hos-sec-engine
description: HOS-Sec-Engine 统一攻防引擎，包含 22 个实战安全技能。根据用户描述的场景自动匹配最合适的技能，支持 SQL 注入 WAF 绕过、XSS、SSRF、XXE、文件上传绕过、RCE、反序列化、JWT 攻击、OAuth 漏洞、IDOR、速率限制绕过、云配置错误、IAM 权限提升、元数据 SSRF、Windows/Linux 提权、AD 域信息收集、代码审计、Docker 容器逃逸、K8s 配置审计、Prompt 注入、Android APK 分析等攻防能力。
license: MIT
metadata:
  author: HOS Team
  version: "3.0.0"
  tags:
    - security
    - offense-defense
    - penetration-testing
    - waf-bypass
    - privilege-escalation
    - web-security
    - api-security
    - cloud-security
    - skill
  category: security
  risk-level: critical
  confidence: 0.95
---

# HOS-Sec-Engine 统一攻防引擎

> 包含 22 个攻防实战技能，根据场景自动路由到最合适的技能。

## 使用方式

当用户描述安全场景时，自动判断并选择最合适的技能。

### 快速调用示例
- "帮我绕过这个 WAF 的 SQL 注入防护" → 使用 `web-sqli-001`
- "测试这个 API 的 JWT 认证" → 使用 `api-jwt-001`
- "完整做一次 Web 渗透测试" → 执行 Web 渗透测试流程
- "这个云服务器可能有元数据泄露" → 使用 `cloud-meta-001`
- "帮我审计这段 Java 代码的反序列化问题" → 使用 `code-review-java-deser-001`
- "发现 Docker 容器，需要逃逸到宿主机" → 使用 `container-docker-escape-001`
- "获取了 Linux 普通用户 shell，需要提权" → 使用 `linux-priv-esc-001`

## 技能索引

### 子技能详情（按需加载）

- [ad-domain-enum-001](skills/ad-domain-enum-001.md) - Active Directory Domain Enumeration and Reconnaissance
- [ai-prompt-injection-001](skills/ai-prompt-injection-001.md) - Prompt Injection Bypass Techniques
- [api-graphql-injection-001](skills/api-graphql-injection-001.md) - GraphQL Injection Detection and Exploitation
- [api-idor-001](skills/api-idor-001.md) - IDOR Detection and Exploitation
- [api-jwt-001](skills/api-jwt-001.md) - JWT Attack and Bypass Techniques
- [api-oauth-001](skills/api-oauth-001.md) - OAuth Flow Attack Techniques
- [api-ratelimit-001](skills/api-ratelimit-001.md) - Rate Limit Bypass Techniques
- [cloud-iam-001](skills/cloud-iam-001.md) - IAM Privilege Escalation Techniques
- [cloud-meta-001](skills/cloud-meta-001.md) - Cloud Metadata SSRF Exploitation
- [cloud-s3-001](skills/cloud-s3-001.md) - S3/OSS Bucket Misconfiguration Exploitation
- [code-review-java-deser-001](skills/code-review-java-deser-001.md) - Java Deserialization Vulnerability Code Audit
- [container-docker-escape-001](skills/container-docker-escape-001.md) - Docker Container Escape Techniques
- [web-auth-bypass-0day](skills/web-auth-bypass-0day.md) - Web Authentication Bypass 0day
- [web-deser-0day](skills/web-deser-0day.md) - Web Deserialization 0day
- [web-waf-bypass-0day](skills/web-waf-bypass-0day.md) - Web WAF Bypass 0day
- [web-xss-0day](skills/web-xss-0day.md) - Web XSS Filter 0day
- [k8s-misconfig-001](skills/k8s-misconfig-001.md) - Kubernetes Cluster Misconfiguration Exploitation
- [linux-priv-esc-001](skills/linux-priv-esc-001.md) - Linux Privilege Escalation Techniques
- [mobile-android-apk-001](skills/mobile-android-apk-001.md) - Android APK Reverse Engineering and Security Analysis
- [web-deser-001](skills/web-deser-001.md) - Insecure Deserialization Exploitation
- [web-rce-001](skills/web-rce-001.md) - Command Injection Techniques
- [web-sqli-001](skills/web-sqli-001.md) - SQL Injection WAF Bypass Techniques
- [web-ssrf-001](skills/web-ssrf-001.md) - SSRF Detection and Exploitation
- [test-verify-001](skills/test-verify-001.md) - Test Verification Skill
- [web-xss-001](skills/web-xss-001.md) - XSS Filter Bypass Techniques
- [web-xxe-001](skills/web-xxe-001.md) - XXE Injection Techniques
- [windows-priv-esc-001](skills/windows-priv-esc-001.md) - Windows Privilege Escalation Techniques

## 完整技能列表

### 域安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `ad-domain-enum-001` | Active Directory Domain Enumeration and Reconnaissance | 成功获取域内主机访问权限后需要收集域信息 |

### AI 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `ai-prompt-injection-001` | Prompt Injection Bypass Techniques | AI 系统对输入内容进行安全过滤，需要绕过内容审 |

### API 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `api-graphql-injection-001` | GraphQL Injection Detection and Exploitation | 目标 API 使用 GraphQL 端点（/graphql, /graphiql, /api/graphql） |
| `api-idor-001` | IDOR Detection and Exploitation | API 端点使用数字 ID、UUID/GUID 或用户名作为对象引用参数 |
| `api-jwt-001` | JWT Attack and Bypass Techniques | 目标 API 使用 JWT (JSON Web Token) 进行身份认证或授 |
| `api-oauth-001` | OAuth Flow Attack Techniques | 目标应用使用 OAuth 2.0 ?OpenID Connect (OIDC) 进行第三方登录或 API 授权 |
| `api-ratelimit-001` | Rate Limit Bypass Techniques | 目标 API 对登录、注册、密码重置等接口实施了速率限制 |

### 云安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `cloud-iam-001` | IAM Privilege Escalation Techniques | 已获?AWS IAM 用户的低权限凭证（AccessKey/SecretKey），需要提升到管理员权 |
| `cloud-meta-001` | Cloud Metadata SSRF Exploitation | 目标应用部署?AWS EC2、GCP Compute Engine、Azure VM 等云实例 |
| `cloud-s3-001` | S3/OSS Bucket Misconfiguration Exploitation | 目标使用 AWS S3、阿里云 OSS、腾讯云 COS 等云存储服务作为静态资源托 |

### 代码审计

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `code-review-java-deser-001` | Java Deserialization Vulnerability Code Audit | 代码审计中发?Java 反序列化入口 |

### 容器安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `container-docker-escape-001` | Docker Container Escape Techniques | 成功获取容器 shell 后需要逃逸到宿主 |

### Web 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `web-auth-bypass-0day` | Web Authentication Bypass 0day | TODO: 由 AI 自主维护更新 - 填入最新认证绕过 0day 的触发场景 |
| `web-deser-0day` | Web Deserialization 0day | TODO: 由 AI 自主维护更新 - 填入最新反序列化 0day 的触发场景 |
| `web-waf-bypass-0day` | Web WAF Bypass 0day | TODO: 由 AI 自主维护更新 - 填入最新 WAF 绕过 0day 的触发场景 |
| `web-xss-0day` | Web XSS Filter 0day | TODO: 由 AI 自主维护更新 - 填入最新 XSS 过滤 0day 的触发场景 |
| `web-deser-001` | Insecure Deserialization Exploitation | 应用接收序列化的对象数据（Cookie、Session、Token、API 请求体） |
| `web-rce-001` | Command Injection Techniques | 应用调用系统命令处理用户输入（如 ping、nslookup、tracert、convert、ffmpeg |
| `web-sqli-001` | SQL Injection WAF Bypass Techniques | 目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403 |
| `web-ssrf-001` | SSRF Detection and Exploitation | 应用存在 URL 参数用于获取远程资源（如图片下载、PDF 生成、Webhook 回调 |
| `test-verify-001` | Test Verification Skill | 用于验证 AI 自主创建技能能力 |
| `web-xss-001` | XSS Filter Bypass Techniques | 目标页面存在用户输入反射但未触发经典 XSS payload |
| `web-xxe-001` | XXE Injection Techniques | 应用接收 XML 格式的请求体（如 SOAP API、XML-RPC、SAML |

### Kubernetes 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `k8s-misconfig-001` | Kubernetes Cluster Misconfiguration Exploitation | 发现 Kubernetes API Server 未授权访 |

### Linux 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `linux-priv-esc-001` | Linux Privilege Escalation Techniques | 获取普通用?shell 后需要提升到 root |

### 移动安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `mobile-android-apk-001` | Android APK Reverse Engineering and Security Analysis | 需要对 Android APK 进行安全审计 |

### Windows 安全

| Skill ID | 名称 | 适用场景 |
|----------|------|----------|
| `windows-priv-esc-001` | Windows Privilege Escalation Techniques | 获取普通用户权限后需要提升到 SYSTEM ?Administrator |


## 工作流程

### 1. 场景匹配
当用户描述安全场景时，按以下优先级匹配：
1. **精确匹配**：用户明确提到漏洞类型或技能名称
2. **关键词匹配**：用户描述中包含技能相关的技术术语
3. **场景推断**：根据业务场景推断可能的攻击面

### 2. 多技能组合
如果一个场景涉及多个攻击面，按攻防流程顺序依次应用相关技能：
- **信息收集阶段**：先侦察，再扫描
- **漏洞发现阶段**：根据技术栈选择对应技能
- **漏洞利用阶段**：选择可利用性最高的技能
- **权限提升阶段**：根据已获取的访问级别选择提权技能

### 3. 输出格式
对每个匹配的技能，输出：
- **风险等级**：Critical / High / Medium / Low
- **场景确认**：确认用户场景与技能的匹配度
- **操作清单**：按技能的 checklist 逐步引导
- **Payload 示例**：提供具体的测试 payload
- **验证方法**：如何确认攻击成功
- **防御建议**：对应的修复方案

## Web 渗透测试流程
1. **信息收集** → `web-ssrf-001`（内网探测）
2. **漏洞扫描** → `web-sqli-001`, `web-xss-001`, `web-xxe-001`, `web-upload-001`
3. **漏洞利用** → `web-rce-001`, `web-deser-001`
4. **权限提升** → `linux-priv-esc-001` 或 `windows-priv-esc-001`

## API 安全审计流程
1. **认证测试** → `api-jwt-001`, `api-oauth-001`
2. **授权测试** → `api-idor-001`
3. **速率测试** → `api-ratelimit-001`

## 云安全审计流程
1. **资产发现** → `cloud-s3-001`, `cloud-meta-001`
2. **权限测试** → `cloud-iam-001`

## 注意事项
- 所有操作应在**授权范围内**进行
- 优先使用低风险方法验证漏洞存在性
- 发现高危漏洞后及时报告，不要继续深入
- 记录所有操作和发现，便于后续报告
