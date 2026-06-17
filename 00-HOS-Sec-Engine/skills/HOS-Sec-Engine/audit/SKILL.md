---
name: audit
description: >
  Code audit rules only
  Use when reviewing code for security vulnerabilities, performing penetration testing,
  or diagnosing security defects in web applications.
---

# HOS-Audit-Core: AI Code Audit Rules

> A rule-based system to enhance AI code audit quality.

---

## Core Philosophy

- **Rules over Knowledge** - Define audit procedures, not vulnerability definitions
- **Process over Conclusion** - Systematic check flows, not one-line judgments
- **Evidence over Assertion** - Every finding requires a complete evidence chain


## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Audit Rules | 10 | AR-001 ~ AR-010 |
| Review Rules | 5 | RR-001 ~ RR-005 |
| Evidence Standards | 6 | ER-001 ~ ER-006 |

---

## Audit Rules (AR)

### AR-001: Taint Analysis

**Description**: 追踪用户输入到敏感操作的数据流,识别未经净化的污染传播路径

**Severity**: High | **CWE**: CWE-20, CWE-74, CWE-79 | **OWASP**: A03:2021 - Injection, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `request.getParameter() / req.body / request.args`
   - `文件读取后用于敏感操作: readFile() -> exec()`
   - `环境变量读取: process.env / System.getenv()`
   - `外部API响应: fetch() -> database.query()`
   - `URL参数传播: ctx.query / req.query / request.query`
   - `用户输入存储后取出使用: DB.get() -> exec()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **污染源识别**: 识别代码中所有用户可控或外部来源的数据入口
   - **汇聚点识别**: 识别代码中所有可能因恶意输入导致危害的敏感操作
   - **数据流追踪**: 追踪污染数据从源到汇聚点的完整传递路径
   - **净化点检查**: 检查数据流路径中是否存在安全净化处理
   - **传播路径验证**: 验证污染数据是否确实能够通过完整路径到达汇聚点
   - **上下文分析**: 分析代码执行上下文是否存在间接防护措施

**Evidence Requirements**:
   - [Required] 污染源和汇聚点的代码位置及上下文
   - [Required] 从污染源到汇聚点的完整数据流路径
   - [Optional] 相关安全配置,如框架中间件、安全策略等
   - [Optional] 运行时行为观察,验证数据流是否实际触发

**Remediation**:
   - [Critical] 在输入边界实施严格验证 (Difficulty: Easy)
   - [High] 在汇聚点前实施净化处理 (Difficulty: Medium)
   - [Medium] 实施纵深防御策略 (Difficulty: Medium)

---

### AR-002: Input Validation

**Description**: 检查用户输入验证机制,识别验证缺失、不完整或可被绕过的情况

**Severity**: High | **CWE**: CWE-20, CWE-1395 | **OWASP**: A03:2021 - Injection, A04:2021 - Insecure Design

**Trigger Patterns**:
   - `HTTP参数读取: req.body / request.getParameter() / $_POST`
   - `URL参数: req.query / request.args / $_GET`
   - `文件上传: multer / MultipartFile / $_FILES`
   - `Header读取: req.headers / request.getHeader()`
   - `Cookie读取: req.cookies / request.getCookie()`
   - `路径参数: req.params / @PathVariable`
   - `GraphQL查询: args / variables`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **输入入口识别**: 识别代码中所有接收用户或外部数据的入口点
   - **验证机制检查**: 检查每个输入入口使用的验证方法和验证库
   - **验证完整性分析**: 分析验证规则是否覆盖了所有必要的安全维度
   - **验证绕过检测**: 检查验证逻辑是否存在可被攻击者绕过的缺陷
   - **错误处理审查**: 检查验证失败时的错误处理是否安全
   - **默认值与边界检查**: 检查输入未提供或为边界值时的处理逻辑

**Evidence Requirements**:
   - [Required] 输入入口和验证逻辑的代码位置及上下文
   - [Required] 验证库配置、框架验证设置、中间件配置
   - [Optional] 输入数据从入口到使用的传播路径

**Remediation**:
   - [Critical] 使用类型安全的验证库实施输入验证 (Difficulty: Easy)
   - [High] 实施全局输入验证中间件 (Difficulty: Easy)
   - [Medium] 输入规范化处理 (Difficulty: Medium)

---

### AR-003: Authentication Check

**Description**: 检查认证机制实现,识别认证绕过、弱认证凭证处理、会话管理缺陷

**Severity**: Critical | **CWE**: CWE-287, CWE-306, CWE-798 | **OWASP**: A07:2021 - Identification and Authentication Failures, A02:2021 - Cryptographic Failures

**Trigger Patterns**:
   - `登录处理: login() / authenticate() / signIn()`
   - `Token生成: jwt.sign() / generateToken() / createAccessToken()`
   - `密码处理: bcrypt.hash() / password.encode() / MD5()`
   - `会话管理: session.set() / req.session / cookie设置`
   - `权限检查: requireAuth() / isAuthenticated() / @PreAuthorize`
   - `密码重置: resetPassword() / forgotPassword()`
   - `OAuth处理: oauth.callback() / passport.authenticate()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **认证端点识别**: 识别所有与认证相关的API端点和处理逻辑
   - **凭证处理方式**: 检查用户凭证的存储、传输和验证方式
   - **会话管理机制**: 检查Token/Session的创建、验证、刷新和销毁机制
   - **认证绕过检测**: 检查是否存在可绕过认证的路径或逻辑缺陷
   - **密码策略检查**: 检查密码复杂度要求和账户保护机制
   - **多因素认证分析**: 检查是否实现了多因素认证及实现质量

**Evidence Requirements**:
   - [Required] 认证相关代码位置,包括登录、Token生成、验证逻辑
   - [Required] 认证相关配置,如JWT密钥、Session配置、Cookie设置
   - [Optional] 凭证从输入到验证的完整流程

**Remediation**:
   - [Critical] 使用安全的密码哈希算法 (Difficulty: Easy)
   - [High] 实施JWT安全最佳实践 (Difficulty: Easy)
   - [Medium] 实施登录速率限制和账户锁定 (Difficulty: Easy)

---

### AR-004: Cryptographic Check

**Description**: 检查加密算法、密钥管理、随机数生成等密码学实现的安全性

**Severity**: High | **CWE**: CWE-326, CWE-327, CWE-328, CWE-798 | **OWASP**: A02:2021 - Cryptographic Failures, A09:2021 - Security Logging and Monitoring Failures

**Trigger Patterns**:
   - `加密调用: crypto.encrypt() / Cipher.getInstance() / AES`
   - `哈希调用: crypto.hash() / MessageDigest / hashlib.md5()`
   - `密钥操作: generateKey() / SecretKeySpec / new Buffer(secret)`
   - `随机数: Math.random() / Random() / crypto.randomBytes()`
   - `签名: sign() / verify() / RSASSA`
   - `TLS/SSL: createServer({ key, cert }) / SSLContext`
   - `编码: Base64 / URL编码(被误认为加密)`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **加密算法识别**: 识别代码中使用的所有加密、哈希、编码算法
   - **密钥管理检查**: 检查加密密钥的生成、存储、传输和轮换机制
   - **随机数生成审查**: 检查随机数生成器的类型和使用场景是否匹配
   - **加密模式分析**: 检查加密模式、填充方案、IV/Nonce的使用是否正确
   - **哈希函数检查**: 检查哈希函数的使用场景是否合适
   - **证书与TLS配置**: 检查TLS/SSL配置和证书管理是否安全

**Evidence Requirements**:
   - [Required] 加密/哈希/随机数相关代码位置和上下文
   - [Required] 加密配置、TLS设置、密钥管理配置
   - [Optional] 加密相关依赖库及其版本

**Remediation**:
   - [Critical] 替换不安全的加密算法为现代推荐算法 (Difficulty: Medium)
   - [High] 实施安全的密钥管理 (Difficulty: Medium)
   - [Medium] 使用安全的随机数生成器 (Difficulty: Easy)

---

### AR-006: Deserialization Check

**Description**: 检查反序列化操作,识别不安全的反序列化导致的远程代码执行风险

**Severity**: Critical | **CWE**: CWE-502 | **OWASP**: A08:2021 - Software and Data Integrity Failures, A05:2017 - Broken Access Control

**Trigger Patterns**:
   - `Java反序列化: ObjectInputStream.readObject() / readUnshared()`
   - `Python反序列化: pickle.loads() / yaml.load() / marshal.loads()`
   - `Node.js反序列化: unserialize() / node-serialize / serialize-javascript`
   - `PHP反序列化: unserialize() / __wakeup() / __destruct()`
   - `.NET反序列化: BinaryFormatter.Deserialize() / NetDataContractSerializer`
   - `YAML加载: yaml.load() (无Loader参数)`
   - `XML反序列化: XMLDecoder / XStream`

**Supported Languages**: java, python, javascript, typescript, php, csharp

**Check Flow**:
   - **反序列化入口识别**: 识别代码中所有反序列化操作及其调用的库
   - **数据来源追踪**: 追踪被反序列化数据的来源是否可信
   - **类型约束检查**: 检查反序列化是否限制了可实例化的类型
   - **Gadget链分析**: 分析项目依赖中是否存在可利用的反序列化Gadget链
   - **替代方案检查**: 检查是否可以使用更安全的替代方案替换原生反序列化
   - **运行时防护检测**: 检查是否有运行时反序列化安全防护措施

**Evidence Requirements**:
   - [Required] 反序列化操作代码位置和上下文
   - [Required] 反序列化相关依赖库及其版本
   - [Optional] 从数据输入到反序列化的完整流程

**Remediation**:
   - [Critical] 使用安全的数据格式替代原生反序列化 (Difficulty: Medium)
   - [High] 实施严格的类型白名单过滤 (Difficulty: Medium)
   - [Medium] 数据签名和完整性验证 (Difficulty: Easy)

---

### AR-007: XXE Check

**Description**: 检查XML解析配置和处理逻辑,识别XML外部实体注入(XXE)风险

**Severity**: High | **CWE**: CWE-611 | **OWASP**: A05:2021 - Security Misconfiguration, A04:2017 - XML External Entities (XXE)

**Trigger Patterns**:
   - `Java XML解析: DocumentBuilderFactory / SAXParser / XMLReader`
   - `Java XML转换: TransformerFactory / XPathFactory`
   - `Python XML解析: xml.etree.ElementTree / lxml / xml.dom.minidom`
   - `Node.js XML解析: libxmljs / xmldom / xml2js`
   - `PHP XML解析: simplexml_load_string() / DOMDocument`
   - `.NET XML解析: XmlDocument / XmlReader / XDocument`
   - `SOAP处理: SOAPMessage / javax.xml.soap`

**Supported Languages**: java, python, javascript, typescript, php, csharp

**Check Flow**:
   - **XML解析入口识别**: 识别代码中所有XML解析相关的调用和API使用
   - **解析器配置检查**: 检查XML解析器的安全配置是否禁用了危险特性
   - **DTD与外部实体处理**: 检查DTD声明和外部实体引用的处理方式
   - **数据流追踪**: 追踪XML数据从输入到解析的完整路径
   - **输出处理检查**: 检查XML解析结果的使用方式和错误处理

**Evidence Requirements**:
   - [Required] XML解析代码位置和配置上下文
   - [Required] XML解析相关配置、框架设置、依赖库版本
   - [Optional] XML数据从输入到解析的完整路径

**Remediation**:
   - [Critical] 禁用DTD和外部实体解析 (Java) (Difficulty: Easy)
   - [High] 使用安全的XML解析库 (Python) (Difficulty: Easy)
   - [Medium] .NET安全XML解析配置 (Difficulty: Easy)

---

### AR-008: SSRF Check

**Description**: 检查服务端网络请求逻辑,识别服务端请求伪造(SSRF)风险

**Severity**: High | **CWE**: CWE-918 | **OWASP**: A10:2021 - Server-Side Request Forgery, A07:2021 - Identification and Authentication Failures

**Trigger Patterns**:
   - `HTTP请求: fetch() / axios() / http.get() / requests.get()`
   - `URL参数构造: new URL(userInput) / url.Parse()`
   - `Webhook调用: webhook.send(url) / callback(url)`
   - `图片/文件获取: Image.fromURL() / download(url)`
   - `API代理: proxy.pass(url) / forward(url)`
   - `邮件发送: smtp.connect(host)`
   - `DNS查询: dns.resolve(host) / net.LookupHost()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **网络请求入口识别**: 识别代码中所有服务端发起的网络请求操作
   - **URL来源追踪**: 追踪网络请求目标URL的来源是否可控
   - **URL验证机制检查**: 检查目标URL是否有安全验证机制
   - **重定向处理分析**: 检查HTTP重定向是否可能被利用绕过验证
   - **协议与端口限制**: 检查网络请求的协议和端口是否有限制
   - **内网资源保护**: 检查是否能通过请求访问内网敏感资源

**Evidence Requirements**:
   - [Required] 网络请求代码位置和URL处理逻辑
   - [Required] 网络请求相关配置,如代理设置、超时配置、允许的域名列表
   - [Optional] 从用户输入到网络请求的完整数据流

**Remediation**:
   - [Critical] 实施域名白名单验证 (Difficulty: Easy)
   - [High] 实施IP范围验证和重定向保护 (Difficulty: Medium)
   - [Medium] 网络层隔离 (Difficulty: Hard)

---

### AR-009: Command Injection Check

**Description**: 检查操作系统命令构造和执行逻辑,识别命令注入风险

**Severity**: Critical | **CWE**: CWE-78 | **OWASP**: A03:2021 - Injection, A01:2017 - Injection

**Trigger Patterns**:
   - `Java命令执行: Runtime.getRuntime().exec() / ProcessBuilder`
   - `Node.js命令执行: child_process.exec() / execSync() / spawn()`
   - `Python命令执行: os.system() / subprocess.call() / subprocess.Popen()`
   - `PHP命令执行: exec() / system() / passthru() / shell_exec() / backtick运算符`
   - `Go命令执行: exec.Command() / exec.CommandContext()`
   - `C#命令执行: Process.Start() / ProcessStartInfo`
   - `反引号命令: `command $variable``

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **命令执行入口识别**: 识别代码中所有调用操作系统命令的入口点
   - **命令构造方式分析**: 分析命令是如何构造的,是否包含动态拼接
   - **参数来源追踪**: 追踪命令中动态参数的来源是否可控
   - **参数净化检查**: 检查命令参数是否有安全净化处理
   - **Shell元字符处理**: 检查是否正确处理了Shell元字符和注入向量
   - **执行环境分析**: 分析命令执行环境的权限和限制

**Evidence Requirements**:
   - [Required] 命令执行代码位置和参数构造逻辑
   - [Required] 从用户输入到命令执行的完整数据流
   - [Optional] 执行环境配置,如用户权限、容器设置、安全策略

**Remediation**:
   - [Critical] 避免Shell执行,使用参数数组方式 (Difficulty: Easy)
   - [High] 使用白名单验证和转义函数 (Difficulty: Easy)
   - [Medium] 使用高级API替代系统命令 (Difficulty: Medium)

---

### AR-010: Expression Language Injection Check

**Description**: 检查表达式语言(EL/SpEL/OGNL/MVEL)的使用,识别表达式注入风险

**Severity**: Critical | **CWE**: CWE-94, CWE-917 | **OWASP**: A03:2021 - Injection, A01:2017 - Injection

**Trigger Patterns**:
   - `Java SpEL: ExpressionParser.parseExpression() / SpelExpressionParser`
   - `Java OGNL: Ognl.parseExpression() / Ognl.getValue()`
   - `Java EL: ELProcessor.eval() / ExpressionFactory`
   - `Spring: @Value("#{}") / #{...}`
   - `模板引擎: Thymeleaf / FreeMarker / Velocity`
   - `JavaScript: eval() / new Function() / setTimeout(string)`
   - `Python: eval() / exec() / template.render()`
   - `.NET: Eval() / DataTable.Compute() / NVelocity`

**Supported Languages**: java, javascript, typescript, python, csharp, php

**Check Flow**:
   - **表达式引擎识别**: 识别代码中使用的所有表达式引擎和动态代码执行API
   - **表达式来源追踪**: 追踪表达式字符串的来源是否可控
   - **表达式构造分析**: 分析表达式是如何构造的,是否包含用户可控的拼接
   - **执行上下文检查**: 检查表达式执行时可用的类、方法和变量范围
   - **沙箱与限制验证**: 检查是否实施了表达式执行的沙箱或限制措施
   - **模板引擎安全检查**: 检查模板引擎的配置和使用是否安全

**Evidence Requirements**:
   - [Required] 表达式解析和执行的代码位置及上下文
   - [Required] 表达式引擎配置、模板引擎设置、沙箱配置
   - [Optional] 从用户输入到表达式执行的完整数据流

**Remediation**:
   - [Critical] 使用SimpleEvaluationContext替代StandardEvaluationContext (Java) (Difficulty: Easy)
   - [High] 避免eval,使用安全的替代方案 (Difficulty: Easy)
   - [Medium] 模板引擎安全配置 (Difficulty: Medium)

---

### AR-005: SQL Query Inspection

**Description**: 检查SQL查询的构造方式和参数处理，识别注入风险

**Severity**: High | **CWE**: CWE-89 | **OWASP**: A03:2021 - Injection, A1:2017 - Injection

**Trigger Patterns**:
   - `字符串拼接: "SELECT * FROM users WHERE id=" + input`
   - `模板字符串: `SELECT * FROM ${table}``
   - `格式化字符串: sprintf("SELECT * FROM %s", table)`
   - `追加操作: query.append(variable)`
   - `动态查询构造: new Query().select().from().where()`

**Supported Languages**: java, javascript, python, csharp, php, go, rust

**Check Flow**:
   - **查询构造方式识别**: 识别SQL查询是通过什么方式构造的
   - **参数来源追踪**: 追踪SQL查询中的每个动态参数来自何处
   - **参数可控性判定**: 判定攻击者是否能够通过输入直接控制这个参数
   - **可达性验证**: 验证这个查询是否真的会被用户输入触发执行
   - **防护措施检查**: 检查是否有防护措施来防止SQL注入

**Evidence Requirements**:
   - [Required] 准确的代码位置和完整上下文(前5行后5行)
   - [Required] 参数从输入源到SQL查询的完整数据流
   - [Optional] ORM或数据库配置，如存在

**Remediation**:
   - [Critical] 使用参数化查询 (最优方案) (Difficulty: Easy)
   - [High] 输入白名单验证 (辅助防护) (Difficulty: Easy)
   - [Medium] 黑名单过滤 (不推荐，但可作为额外防护) (Difficulty: Easy)


---

## Review Rules (RR)

### RR-001: False Positive Detection

**Description**: 通过系统化的问题检查，确认一个发现是否是真实的漏洞

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **是否存在补偿性控制(Compensating Controls)?**: 许多看似存在漏洞的代码实际上有其他防护措施防止被利用。
例如: 虽然有SQL注入点，但参数被WAF过滤、被IDS检测或被其他层防护。
   - **是否只有特定角色(如管理员)能访问这个功能?**: 如果一个漏洞只能由管理员触发，其风险等级应该降低。
虽然仍是漏洞，但利用难度很高。
   - **参数是否被严格的白名单限制?**: 即使代码看起来可能存在注入漏洞，如果参数被严格限制，实际风险可能很低。
例如: 用户ID必须是1-999999之间的数字，黑客无法注入SQL语句。
   - **这是否是框架的自动安全特性(如自动参数化)?**: 现代框架(ORM、Web框架)经常自动实现安全措施。
看起来不安全的代码实际上可能被框架自动参数化。
例如: Hibernate自动参数化、Express模板引擎自动转义。
   - **这个代码路径是否真的会被执行?**: 有些代码看起来危险但实际上是死代码、被禁用、或在异常处理块中。
这些情况下是否是漏洞需要重新评估。
   - **这个"漏洞"是否涉及真实的安全边界?**: 有些发现涉及不跨越安全边界的操作，因此不构成真实威胁。
例如: 日志输出中的拼接、内部系统之间的通信、测试代码。

**False Positive Patterns**:
   - **管理员功能误报**
     Indicators: 函数路径: admin* / management* / internal*, 访问控制: 需要 ROLE_ADMIN / isAdmin() 检查, 代码注释中提到 "admin only" / "internal use", 错误处理: 非管理员返回403/401
     Verification:
     - 确认是否有访问控制检查
     - 追踪权限检查的位置和方式
     - 验证权限检查是否在危险操作之前
     - 测试: 用普通用户能否访问此功能?
   - **框架自动参数化误报**
     Indicators: 使用了ORM框架: Hibernate, JPA, Sequelize, SQLAlchemy, 使用框架查询API: .find(), .where(), .query(), 代码中看起来有拼接但实际使用框架, IDE提示使用了安全API
     Verification:
     - 查看框架文档关于参数化的说明
     - 检查框架配置是否启用了安全特性
     - 查看框架源代码或生成的SQL日志
     - 运行测试: 尝试SQL注入是否成功?
   - **日志输出误报**
     Indicators: 函数名包含: log* / print* / debug* / trace*, 代码调用: logger.* / console.* / println, 拼接内容不涉及数据库查询, 这是事后日志而非执行前操作
     Verification:
     - 确认这是日志输出而非SQL/命令执行
     - 验证输出内容是否会被命令执行
     - 确认这不会导致CRLF注入或日志注入
     - 检查日志是否被进一步处理
   - **白名单防护误报**
     Indicators: 参数值在固定列表中: enums / switch / 硬编码列表, 参数验证代码: if (value in [...]) / switch/case, 类型强制转换: (int) / Integer.parseInt() / atoi(), 正则表达式验证: matches("^[0-9]+$")
     Verification:
     - 分析白名单是否真的限制了参数
     - 检查白名单是否被绕过的可能性
     - 验证类型转换是否足够安全
     - 进行渗透测试: 能否绕过这个防护?
   - **多层防护误报**
     Indicators: 代码中有多个安全措施, 通过: 输入验证 + 参数化 + WAF + 权限检查, 任何一层防护都足以防止漏洞, 漏洞仅在绕过所有防护才会出现
     Verification:
     - 列出每一层防护
     - 评估每层防护的有效性
     - 检查是否存在绕过所有防护的方式
     - 计算总体风险: 单层风险 vs 需绕过多层风险
   - **代码死亡路径误报**
     Indicators: 函数被注释: // function(), 代码被 #ifdef 禁用, 代码被 if (false) 保护, 被 @Deprecated 标记且未使用, 代码在异常处理: catch / finally 块中永远无法正常到达
     Verification:
     - 确认代码是否真的不会被执行
     - 检查是否有其他代码路径调用此函数
     - 验证注释/禁用是否是永久的
     - 代码扫描: 这个函数在哪里被调用?
   - **TOCTOU (Time Of Check, Time Of Use) 假警报**
     Indicators: 代码看起来有竞态条件但实际上不存在, 变量在检查后立即使用, 单线程环境被误认为多线程, 状态验证后立即操作
     Verification:
     - 分析是否真的存在时间窗口
     - 检查是否使用了锁/原子操作
     - 验证执行环境是否真的多线程
     - 评估实际的利用可能性

---

### RR-002: Reachability Analysis

**Description**: 通过控制流分析和调用链追踪，验证被标记的代码路径是否真正可达且可执行

**Scope**: AR-001, AR-002, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **该代码路径是否从外部用户输入可达?**: 安全漏洞必须能够从攻击者控制的输入源触发。
如果危险代码无法从任何外部输入到达(如内部工具函数未被调用)，则不构成实际威胁。
需要追踪从API入口、HTTP端点、消息队列消费者等外部入口到目标代码的完整路径。
   - **是否存在阻止代码执行的前置条件?**: 危险代码可能被条件语句保护，这些条件在实际运行中永远不会满足。
例如: 需要特定环境变量、配置文件开关、或运行时状态。
如果这些前置条件无法满足，代码实际上是死代码。
   - **包含漏洞的函数是否被其他代码调用?**: 即使函数本身有漏洞，如果没有被调用或调用链已断开，则不构成风险。
需要通过静态分析查找所有调用点，确认是否存在活跃的调用路径。
注意间接调用(如反射、回调、事件监听器)可能被遗漏。
   - **代码路径中是否存在中间过滤或拦截器?**: 即使代码路径可达，中间层(如中间件、拦截器、过滤器)可能在数据到达危险代码前进行处理。
例如: Spring Security拦截器、Express中间件、输入验证过滤器。
这些中间层可能已经对输入进行了清理或拒绝。
   - **该代码是否仅在异常/错误处理路径中?**: 位于异常处理块中的代码通常只在出错时执行，触发条件更为苛刻。
虽然仍可能构成漏洞，但利用难度显著增加。
需要区分正常的错误处理和可能被利用的异常路径。
   - **代码是否依赖已废弃或已移除的功能?**: 标记的漏洞可能存在于已被废弃但尚未删除的代码中。
这些代码可能在生产环境中已被禁用或通过路由移除。
需要确认代码是否仍在活跃使用。

**False Positive Patterns**:
   - **未调用工具函数误报**
     Indicators: 函数定义在utils/helpers/common模块中, grep/代码搜索显示零调用点, 函数可能是为未来功能预留, 来自第三方库但项目中未使用
     Verification:
     - 使用IDE的"查找引用"功能确认调用点
     - 检查动态调用(反射、eval、回调注册)
     - 确认是否被测试代码专用
     - 验证函数是否被导出但未使用
   - **Feature Flag控制误报**
     Indicators: 代码被if(featureEnabled)或类似检查保护, 配置文件中有功能开关, 环境变量控制功能启用, A/B测试或灰度发布相关代码
     Verification:
     - 检查生产环境配置中该Feature Flag的状态
     - 确认Flag是否默认为关闭
     - 验证是否有管理界面控制Flag
     - 评估Flag被意外启用的可能性
   - **废弃端点误报**
     Indicators: 路由被注释或从路由表中移除, 有@Deprecated或@Deprecated标记, API文档中已标注废弃, 返回410 Gone或404 Not Found
     Verification:
     - 确认路由是否真的从配置中移除
     - 检查是否有其他路由指向同一处理函数
     - 验证废弃代码是否仍被某些客户端调用
     - 确认生产环境是否真的不响应此端点
   - **测试/模拟代码误报**
     Indicators: 文件路径包含test/mock/stub/fake, 在__tests__/tests/spec目录中, 函数名包含Mock/Stub/Test, 仅在测试依赖中使用的代码
     Verification:
     - 确认代码是否在测试目录
     - 检查生产构建是否排除测试代码
     - 验证代码是否仅在测试配置中加载
     - 确认测试代码不会被生产环境执行
   - **条件编译误报**
     Indicators: #ifdef / #if DEBUG 等预处理指令, process.env.NODE_ENV === "development", BUILD_TYPE或类似编译时条件, 平台特定代码(如#ifdef WIN32)
     Verification:
     - 确认生产构建使用的编译条件
     - 检查条件是否在生产环境中满足
     - 验证代码是否被编译进最终产物
     - 分析不同构建配置的差异

---

### RR-003: Exploitability Assessment

**Description**: 从攻击者视角评估已确认漏洞的真实可利用性，分析攻击复杂度和技术可行性

**Scope**: AR-001, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **攻击者能否可靠地构造出有效的攻击载荷?**: 理论上存在漏洞不等于可以被可靠利用。
某些漏洞需要精确控制输入的长度、编码、时序或特定值，这在现实攻击中可能不可行。
例如: 需要特定内存地址对齐、需要绕过ASLR、需要精确的编码转换。
   - **利用该漏洞是否需要认证或特殊权限?**: 需要认证或高权限才能利用的漏洞，其攻击面显著缩小。
未认证可利用的漏洞风险远高于需要管理员权限的漏洞。
需要明确区分匿名、认证用户、管理员等不同角色的利用条件。
   - **利用是否依赖特定的运行环境或配置?**: 某些漏洞仅在特定的操作系统、库版本、配置参数或部署模式下才能被利用。
如果目标环境不满足这些条件，漏洞虽然存在但不可利用。
例如: 仅影响Windows的漏洞在Linux部署中不可利用。
   - **利用过程是否稳定可靠?**: 不稳定的漏洞利用可能导致服务崩溃但无法获得控制权，或者需要大量尝试才能成功。
竞争条件、时序漏洞和内存破坏类漏洞往往具有不确定性。
利用的稳定性直接影响其实际威胁等级。
   - **是否存在已知的公开利用代码或工具?**: 公开可用的exploit代码大幅降低了利用门槛。
即使漏洞本身利用难度高，公开的利用工具也会使其成为高危。
需要检查CVE数据库、exploit-db、GitHub等来源。
   - **成功利用后能造成什么实际影响?**: 漏洞的实际危害取决于利用后能做什么。
读取少量非敏感数据的漏洞与执行远程代码的漏洞危害级别完全不同。
需要区分信息泄露、权限提升、远程代码执行等影响等级。

**False Positive Patterns**:
   - **理论攻击链误报**
     Indicators: 漏洞利用需要超过5个步骤的完整攻击链, 每个步骤都有独立的防护机制, 需要同时满足多个独立条件, 攻击链中存在不可控环节
     Verification:
     - 列出完整的攻击链步骤
     - 评估每个步骤的成功率
     - 计算整体攻击成功率(各步骤相乘)
     - 判断是否有更简单的替代攻击路径
   - **编码/转换障碍误报**
     Indicators: 输入经过多层编码(HTML编码、URL编码、Base64), 需要绕过编码转换才能构造有效载荷, 目标系统使用不兼容的字符集, 编码过程破坏了攻击载荷的关键字符
     Verification:
     - 追踪输入的完整编码/解码链
     - 确认编码过程是否破坏攻击载荷
     - 测试是否能找到编码绕过方法
     - 验证目标端点期望的编码格式
   - **长度/大小限制误报**
     Indicators: 输入字段有严格的长度限制(如<50字符), 载荷大小超过允许的缓冲区, 数据库字段长度限制了注入内容, 文件名或路径长度限制
     Verification:
     - 确认实际的长度限制值
     - 评估最小有效载荷大小
     - 检查是否存在截断或绕过方式
     - 测试在限制范围内是否能构造有效攻击
   - **网络隔离误报**
     Indicators: 漏洞服务仅在内网可访问, 服务绑定到localhost/127.0.0.1, 防火墙规则限制访问源IP, 服务在VPC或私有网络中
     Verification:
     - 确认服务的网络监听地址
     - 检查防火墙和安全组规则
     - 评估从外部网络到该服务的路径
     - 考虑是否存在SSRF等绕过网络隔离的方式
   - **竞争条件利用难度误报**
     Indicators: 漏洞需要精确的时序控制, 时间窗口极短(毫秒级), 需要并发请求精确定位, 依赖系统负载或响应时间
     Verification:
     - 测量实际的时间窗口大小
     - 评估在现实网络条件下的利用可行性
     - 检查是否有同步机制减少竞争可能
     - 测试在典型服务器负载下的可重复性

---

### RR-004: Severity Calibration

**Description**: 综合业务上下文、技术环境和现有防护措施，对漏洞严重程度进行动态校准

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **受影响的数据或资源的敏感程度如何?**: 漏洞的严重程度很大程度上取决于受影响数据的价值。
泄露用户密码比泄露公开新闻内容严重得多。
需要根据数据分类(公开、内部、机密、绝密)来评估影响。
同时考虑数据量级: 影响10条记录和100万条记录的影响完全不同。
   - **是否有纵深防御(Depth of Defense)措施可以缓解影响?**: 即使单点存在漏洞，多层安全措施可以显著降低实际风险。
例如: 即使存在SQL注入，如果数据库使用只读账号且数据已加密，影响被大幅限制。
需要评估每层防护的有效性和独立性。
   - **漏洞被利用后是否影响业务连续性?**: 某些漏洞允许攻击者破坏服务的可用性。
影响业务连续性的漏洞(如DoS、数据破坏)通常比纯信息泄露更紧急。
需要考虑系统的关键程度: 核心支付系统的漏洞比内部报表系统的漏洞更紧急。
   - **该漏洞是否违反合规或法规要求?**: 某些漏洞直接导致合规违规(GDPR、PCI DSS、HIPAA、等保2.0等)。
合规违规可能带来法律后果和巨额罚款，需要提升优先级。
即使技术上风险较低，合规要求可能强制要求修复。
   - **修复该漏洞的难度和成本如何?**: 修复成本影响优先级排序。
如果修复非常简单(一行代码改动)，即使风险较低也应该立即修复。
如果修复需要重大重构，可能需要评估临时缓解措施。
   - **是否存在可接受的临时缓解措施?**: 在完整修复之前，临时缓解措施可以显著降低风险。
例如: WAF规则可以阻止已知攻击模式，速率限制可以减少暴力破解的影响。
有效的临时缓解措施可以降低修复的紧急程度。

**False Positive Patterns**:
   - **过度评级-只读操作误报**
     Indicators: 漏洞仅影响只读操作(SELECT查询), 无法修改或删除数据, 受影响数据已经是公开的, 操作不涉及写入或状态变更
     Verification:
     - 确认数据库操作的权限级别(只读vs读写)
     - 评估可读取数据的敏感程度
     - 检查是否有数据量限制
     - 判断信息泄露的实际影响
   - **过度评级-局部影响误报**
     Indicators: 漏洞仅影响单个用户的数据, 无法横向移动或影响其他用户, 影响范围被严格隔离, 不涉及共享资源或全局状态
     Verification:
     - 确认影响范围是否真的局限
     - 检查是否存在横向移动路径
     - 验证隔离机制的有效性
     - 评估批量利用的可能性
   - **过度评级-低价值目标误报**
     Indicators: 受影响的是测试/预发环境, 数据是模拟或脱敏数据, 功能仅用于开发调试, 系统不处理真实业务数据
     Verification:
     - 确认受影响环境是否处理真实数据
     - 检查环境是否可从外部访问
     - 评估测试数据泄露的实际影响
     - 验证环境配置是否与生产一致
   - **忽略缓解措施的评级误报**
     Indicators: 评级未考虑已有的WAF/IPS规则, 忽略了数据库权限最小化配置, 未考虑加密存储的额外保护, 评级基于最坏情况而非实际情况
     Verification:
     - 列出所有现有的安全控制措施
     - 评估每项控制在漏洞利用路径上的作用
     - 重新计算考虑缓解措施后的风险
     - 与CVSS环境评分进行对比
   - **CVSS基准评分误用**
     Indicators: 直接使用CVSS基准评分而忽略环境因素, 未调整攻击复杂度(AV/AC)的环境值, 未考虑实际部署的权限要求, 未评估受影响资产的实际价值
     Verification:
     - 使用CVSS环境评分组调整基准分数
     - 根据实际部署调整攻击向量(AV)
     - 根据访问控制调整权限要求(PR)
     - 根据数据敏感性调整影响(I/C/A)

---

### RR-005: Context Analysis

**Description**: 分析业务上下文、部署环境和应用架构，识别上下文相关的安全假设和风险因素

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **该应用的业务类型和安全需求等级是什么?**: 不同业务类型对安全的要求不同。金融系统的安全标准远高于内部博客系统。
需要了解应用处理的业务类型、用户群体和数据敏感度，以正确评估风险的优先级。
同时考虑应用是否为面向互联网(高暴露)还是内部使用(低暴露)。
   - **部署环境提供了哪些安全基础设施?**: 现代云原生部署环境通常提供多层安全基础设施。
容器隔离、服务网格(mTLS)、云平台安全组、WAF等都提供了额外的安全层。
这些基础设施可能已经缓解了许多传统的安全问题。
   - **系统架构是否定义了明确的安全边界?**: 良好的系统架构应该有明确定义的安全边界和信任区域(DMZ、内网、管理网)。
了解这些边界有助于判断: 一个从DMZ到内网的请求是否可信?
微服务架构中的服务间通信是否需要认证? API网关是否统一处理安全?
   - **系统的信任模型是什么? 谁信任谁?**: 信任模型决定了哪些组件之间的通信可以假设是安全的。
如果内部服务之间默认互信，那么SSRF或内部服务调用的风险较低。
如果零信任模型，则所有通信都需要验证。
了解信任模型对于评估内部漏洞的风险至关重要。
   - **系统依赖的外部服务或第三方组件引入了哪些风险?**: 现代应用大量依赖外部服务和第三方组件。
这些依赖可能引入供应链攻击、服务中断、数据泄露等风险。
需要评估外部依赖的安全性和可靠性，以及系统对外部依赖的信任程度。
   - **应用的部署和发布流程是否包含安全控制?**: CI/CD流程中的安全控制(如SAST、DAST、依赖扫描、密钥检测)可以在发布前捕获问题。
如果发布流程缺乏安全控制，漏洞可能直接进入生产环境。
了解发布流程有助于评估漏洞进入生产的可能性和修复速度。

**False Positive Patterns**:
   - **忽略部署环境误报**
     Indicators: 漏洞报告未考虑生产环境的安全配置, 基于默认配置评估风险但生产已加固, 未考虑云安全组/防火墙的实际规则, 假设端口暴露但实际仅内网可访问
     Verification:
     - 检查生产环境的实际安全配置
     - 验证云安全组和网络ACL规则
     - 确认服务的实际监听地址和端口
     - 对比报告假设与实际部署差异
   - **忽略业务上下文误报**
     Indicators: 漏洞评估未考虑应用的实际情况, 假设所有用户都是恶意的但实际是内部系统, 未考虑数据已经是公开的, 假设高价值目标但实际是低价值系统
     Verification:
     - 了解应用的业务用途和用户群体
     - 评估受影响数据的实际价值
     - 确认系统是否面向互联网
     - 了解业务对安全的具体要求
   - **架构安全假设误报**
     Indicators: 假设架构有安全防护但实际未部署, 报告假设服务间有认证但实际没有, 假设API网关处理了所有安全检查, 假设微服务隔离但实际共享数据库
     Verification:
     - 确认架构文档与实际部署是否一致
     - 验证安全组件是否真的在生产环境运行
     - 检查服务间通信的实际认证机制
     - 确认数据隔离的实际实现方式
   - **第三方组件信任误报**
     Indicators: 盲目信任第三方组件的安全性, 未检查依赖库的已知漏洞, 假设第三方API总是返回可信数据, 未考虑供应链攻击的可能性
     Verification:
     - 运行SCA(软件组成分析)扫描依赖
     - 检查依赖库的安全维护历史
     - 验证第三方API返回数据的处理
     - 评估依赖更新策略和响应速度
   - **合规要求忽略误报**
     Indicators: 漏洞评估未考虑行业合规要求, 未识别数据处理涉及的法规约束, 忽略了数据驻留和跨境传输要求, 未考虑审计日志和可追溯性需求
     Verification:
     - 识别应用涉及的所有合规要求
     - 评估漏洞是否导致合规违规
     - 检查数据处理是否符合法规
     - 确认审计和日志是否满足要求


---

## Evidence Standards (ER)

### ER-001: Source Code Evidence Standard

**Description**: 规范源代码证据的采集和呈现方式，确保每个发现都有准确、完整的代码证据

**Required Fields**: file_path, line_number, code_snippet, context, dangerous_operation, data_flow, control_analysis, conclusion

**Collection Guidance**:
   - 步骤1: 确定危险代码位置
  - 使用IDE或代码审查工具精确定位
  - 记录: 文件路径 + 行号 + 列号
  - 示例: src/main/java/com/app/UserService.java:48:20
   - 步骤2: 获取完整代码上下文
  - 显示危险行前5行和后5行
  - 帮助理解代码的执行环境
  - 包括函数声明和错误处理
   - 步骤3: 追踪数据流
  - 参数从哪里来? (request? 数据库? 文件?)
  - 经过多少个函数? 在每个函数中被修改吗?
  - 最后如何被使用? (SQL? 命令行? 输出?)
  - 记录每一步的位置
   - 步骤4: 分析防护措施
  - 是否有输入验证?
  - 是否有类型强制?
  - 是否有参数化API?
  - 是否有外部防护(WAF)?
  - 结论: 是否所有防护都失效?
   - 步骤5: 形成明确结论
  - 基于所有上述证据
  - 使用具体而非假设语言
  - "用户输入直接拼接SQL" 而非 "可能存在注入"
  - 评估信心度: 是否100%确定这是漏洞?

---

### ER-002: Data Flow Evidence Standard

**Description**: 规范数据流追踪证据的采集，确保参数从source到sink的每一步都有据可查

**Required Fields**: source_location, sink_location, flow_steps, parameter_name, validation_points, taint_status, conclusion

**Collection Guidance**:
   - 步骤1: 确定数据来源(Source)
  - 识别参数入口: HTTP参数、文件读取、数据库查询、API响应等
  - 记录: 文件路径 + 行号 + 具体的接收代码
  - 标注来源类型: user_input / database / file / config / external_api
  - 初始污染状态: TAINTED (对于用户输入)
   - 步骤2: 逐层追踪参数传递
  - 跟随参数: 每个函数调用都要追踪
  - 记录每一步: 文件位置 + 操作类型 + 参数是否被修改
  - 注意别名: 参数可能被赋值给新变量(var cleanData = dirtyInput)
  - 不要跳过中间层: 即使只是传递也要记录
   - 步骤3: 识别所有验证/净化点
  - 搜索净化函数: escapeHtml(), sanitize(), validate(), trim()等
  - 检查框架自动防护: 模板引擎自动转义、ORM参数化等
  - 记录每个防护点: 位置 + 防护方式 + 是否有效
  - 注意: 部分防护(如trim、toLowerCase)不能防止注入
   - 步骤4: 分析数据变换
  - 记录所有数据变换: 编码、拼接、格式化、类型转换
  - 评估变换是否改变污染状态: encodeURIComponent()可能净化某些注入
  - 注意上下文: 同样的数据在SQL vs HTML vs CLI中有不同风险
   - 步骤5: 确认汇聚点(Sink)
  - 识别危险操作: SQL执行、HTML渲染、系统命令、文件写入等
  - 记录: 文件位置 + 危险代码 + 操作上下文
  - 确认污染参数是否到达此点
  - 评估: 到达sink时的污染状态
   - 步骤6: 形成完整结论
  - 汇总: Source → Flow → Sink 完整路径
  - 明确标注: 每一步的污染状态
  - 结论应该基于追踪到的证据，而非推测
  - 如果某段路径无法确定，标注为 "unknown" 而非假设

---

### ER-003: Configuration Evidence Standard

**Description**: 规范配置层面证据的采集，确保框架设置、安全配置、环境变量等配置证据完整可追溯

**Required Fields**: config_file_path, config_section, setting_name, current_value, expected_secure_value, environment, impact_analysis, conclusion

**Collection Guidance**:
   - 步骤1: 定位配置文件
  - 搜索常见配置文件: .env, config/*.js, application.yml, web.config等
  - 识别框架特定配置: Django settings.py, Spring application.properties等
  - 记录: 文件完整路径 + 环境标识(dev/test/staging/prod)
  - 注意: 配置可能分布在多个文件或环境变量中
   - 步骤2: 提取安全相关配置项
  - 识别安全配置: 认证、授权、加密、CORS、CSRF、会话、日志等
  - 记录: 配置名称 + 当前值 + 所在行号
  - 标注: 该配置的安全含义和影响范围
   - 步骤3: 对比安全基准值
  - 查找框架默认值: 文档/源码中的默认配置
  - 对比安全建议: OWASP/安全最佳实践推荐值
  - 分析偏离: 当前值 vs 默认值 vs 安全值的差异
  - 评估: 偏离是否引入了安全风险
   - 步骤4: 追踪配置覆盖链
  - 检查优先级: 环境变量 > 配置文件 > 代码默认值
  - 追踪覆盖关系: 哪个配置覆盖了哪个
  - 注意: 运行时动态配置可能覆盖静态配置
  - 记录: 完整的配置解析/覆盖路径
   - 步骤5: 检查关联配置
  - 安全配置通常相互关联(如: CORS + CSRF + CSP)
  - 检查一个配置是否影响其他配置的效果
  - 评估整体安全配置的一致性和完整性
  - 识别配置冲突(如: 同时启用和禁用某个功能)
   - 步骤6: 形成配置评估结论
  - 明确标注: 安全 / 不安全 / 需要改进
  - 说明: 风险等级和影响范围
  - 给出: 具体的修复建议和推荐配置值
  - 注意: 区分"配置缺失"和"配置错误"

---

### ER-004: API Evidence Standard

**Description**: 规范API层面证据的采集，确保API定义、认证、输入输出、权限等证据完整可追溯

**Required Fields**: endpoint_definition, handler_location, authentication_method, authorization_rules, input_parameters, response_format, security_controls, conclusion

**Collection Guidance**:
   - 步骤1: 定位API端点定义
  - 查找路由注册: Express router.*, Spring @RequestMapping, Django urls.py等
  - 记录: HTTP方法 + 完整路径 + API版本 + 处理函数位置
  - 识别: 中间件链(认证、验证、限流等中间件)
  - 注意: 动态路由参数(:id, {id})和查询参数
   - 步骤2: 分析认证机制
  - 确定认证方式: JWT、Session、OAuth2、API Key、None
  - 检查认证中间件/装饰器的实现
  - 验证: token是否校验签名、有效期、issuer
  - 记录: 认证失败时的响应(是否泄露信息)
   - 步骤3: 检查授权控制
  - 分析: 谁能访问这个API(角色/权限/ownership)
  - 检查水平越权: 用户A能否操作用户B的资源
  - 检查垂直越权: 普通用户能否执行管理员操作
  - 记录: 权限检查的位置和逻辑
   - 步骤4: 审查输入参数
  - 列出所有输入: 路径参数、查询参数、请求体、headers
  - 检查每个参数的验证: 类型、长度、格式、范围
  - 识别: 是否有schema验证(Joi/Zod/class-validator等)
  - 注意: 未验证的参数是潜在的攻击入口
   - 步骤5: 分析响应和错误处理
  - 检查响应格式: 是否包含敏感数据(密码、token、内部ID)
  - 分析错误响应: 是否泄露堆栈跟踪、SQL错误、内部路径
  - 评估: 错误信息是否过于详细
  - 记录: 所有可能的HTTP状态码和对应响应
   - 步骤6: 评估整体安全措施
  - 限流: 是否有rate limiting策略
  - 审计: 是否有操作日志记录
  - CSRF: 是否有CSRF防护(对于非纯API)
  - CORS: 跨域配置是否安全
  - 形成结论: API的整体安全状态和具体改进建议

---

### ER-005: Dependency Evidence Standard

**Description**: 规范依赖层面证据的采集，确保库版本、CVE、依赖树分析等证据完整可追溯

**Required Fields**: dependency_name, installed_version, version_constraint, dependency_type, cve_list, vulnerability_analysis, dependency_tree_path, conclusion

**Collection Guidance**:
   - 步骤1: 收集依赖清单
  - 读取包管理器文件: package.json, pom.xml, requirements.txt, go.mod等
  - 读取锁定文件: package-lock.json, yarn.lock, poetry.lock, go.sum等
  - 区分: 直接依赖(项目声明) vs 间接依赖(传递依赖)
  - 记录: 包名 + 精确版本 + 版本约束 + 依赖类型
   - 步骤2: 查询已知CVE
  - 使用工具: npm audit, Snyk, GitHub Dependabot, osv.dev
  - 查询每个依赖的已知CVE
  - 记录: CVE-ID + CVSS评分 + 影响版本范围 + 修复版本
  - 注意: 有些CVE可能需要特定条件才能触发
   - 步骤3: 分析CVE实际影响
  - 搜索项目代码: 是否使用了受CVE影响的函数/模块
  - 评估: 如果使用了受影响功能 → 实际风险
  - 评估: 如果没有使用受影响功能 → 理论风险
  - 注意: 即使未直接使用,间接调用也可能触发漏洞
   - 步骤4: 分析依赖树路径
  - 生成完整依赖树: npm ls, mvn dependency:tree, pipdeptree
  - 追踪: 谁引入了这个依赖(直接还是间接)
  - 注意: 版本冲突和重复依赖(同一包多个版本)
  - 评估: 能否通过更新直接依赖来消除有漏洞的间接依赖
   - 步骤5: 评估更新可行性
  - 检查最新版本: 是否有补丁版本可用
  - 评估破坏性变更: 主版本更新可能有breaking changes
  - 检查维护状态: 包是否还在维护、是否有替代方案
  - 优先级排序: critical → high → medium → low
   - 步骤6: 评估供应链风险
  - 检查包维护者信誉和社区活跃度
  - 评估: 下载量、stars、issues响应速度
  - 注意: 新维护者接管、废弃包、恶意包发布等风险
  - 记录: 供应链风险评级

---

### ER-006: Runtime Evidence Standard

**Description**: 规范运行时行为证据的采集，确保日志、网络流量、内存状态等运行时证据完整可追溯

**Required Fields**: evidence_type, timestamp, source, observed_behavior, reproduction_steps, environment_context, normal_vs_abnormal, conclusion

**Collection Guidance**:
   - 步骤1: 确定证据类型和来源
  - 识别可用的证据源: 应用日志、数据库日志、网络抓包、系统监控等
  - 确定证据类型: 日志(log)、网络(network)、内存(memory)、进程(process)等
  - 记录: 每个证据源的位置、格式、访问方式
  - 注意: 确保日志级别足够详细(debug/info,不是error only)
   - 步骤2: 记录完整的时间线
  - 所有时间戳使用ISO8601格式,统一时区(UTC)
  - 使用请求ID/会话ID关联多个日志条目
  - 构建完整的时间线: 请求进入 → 处理 → 响应 → 后续影响
  - 标注关键事件点和时间间隔
   - 步骤3: 详细记录复现步骤
  - 一步一步记录如何触发该行为
  - 包含: 输入数据、环境状态、前置条件
  - 确保: 其他人在相同条件下可以复现
  - 记录: 复现次数和一致性(是否每次都能复现)
   - 步骤4: 对比正常与异常行为
  - 记录正常请求的行为(基线)
  - 对比异常请求与正常请求的差异
  - 关注: 响应时间、返回数据量、错误率、资源消耗
  - 量化差异: "慢20倍" 而非 "明显慢很多"
   - 步骤5: 收集多维度证据
  - 应用层: 日志、堆栈跟踪、错误信息
  - 网络层: HTTP请求/响应、抓包数据、TLS信息
  - 数据层: SQL查询、查询计划、结果集大小
  - 系统层: CPU、内存、磁盘、网络IO
  - 安全层: WAF日志、IDS/IPS告警、认证日志
   - 步骤6: 形成关联证据链
  - 将所有证据源按时间线关联
  - 使用request ID、session ID等追踪标识符
  - 形成完整链条: 入口 → 处理 → 影响 → 结果
  - 结论应该基于多维度证据的一致性


---

## Usage

### Code Audit Mode
1. **Scan** for patterns that trigger Audit Rules (AR-001~AR-010)
2. **Execute** each check step in order
3. **Collect** evidence per Evidence Standards (ER-001~ER-006)
4. **Review** findings using Review Rules (RR-001~RR-005)
5. **Calibrate** severity based on context and defenses

---

*Generated by HOS-Audit-Core | Version 0.3.0 | 2026-06-17*

# HOS-Audit-Core: AI Code Audit Rules

> A rule-based system to enhance AI code audit quality.

---

## Core Philosophy

- **Rules over Knowledge** - Define audit procedures, not vulnerability definitions
- **Process over Conclusion** - Systematic check flows, not one-line judgments
- **Evidence over Assertion** - Every finding requires a complete evidence chain


## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Audit Rules | 10 | AR-001 ~ AR-010 |
| Review Rules | 5 | RR-001 ~ RR-005 |
| Evidence Standards | 6 | ER-001 ~ ER-006 |

---

## Audit Rules (AR)

### AR-001: Taint Analysis

**Description**: 追踪用户输入到敏感操作的数据流,识别未经净化的污染传播路径

**Severity**: High | **CWE**: CWE-20, CWE-74, CWE-79 | **OWASP**: A03:2021 - Injection, A01:2021 - Broken Access Control

**Trigger Patterns**:
   - `request.getParameter() / req.body / request.args`
   - `文件读取后用于敏感操作: readFile() -> exec()`
   - `环境变量读取: process.env / System.getenv()`
   - `外部API响应: fetch() -> database.query()`
   - `URL参数传播: ctx.query / req.query / request.query`
   - `用户输入存储后取出使用: DB.get() -> exec()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **污染源识别**: 识别代码中所有用户可控或外部来源的数据入口
   - **汇聚点识别**: 识别代码中所有可能因恶意输入导致危害的敏感操作
   - **数据流追踪**: 追踪污染数据从源到汇聚点的完整传递路径
   - **净化点检查**: 检查数据流路径中是否存在安全净化处理
   - **传播路径验证**: 验证污染数据是否确实能够通过完整路径到达汇聚点
   - **上下文分析**: 分析代码执行上下文是否存在间接防护措施

**Evidence Requirements**:
   - [Required] 污染源和汇聚点的代码位置及上下文
   - [Required] 从污染源到汇聚点的完整数据流路径
   - [Optional] 相关安全配置,如框架中间件、安全策略等
   - [Optional] 运行时行为观察,验证数据流是否实际触发

**Remediation**:
   - [Critical] 在输入边界实施严格验证 (Difficulty: Easy)
   - [High] 在汇聚点前实施净化处理 (Difficulty: Medium)
   - [Medium] 实施纵深防御策略 (Difficulty: Medium)

---

### AR-002: Input Validation

**Description**: 检查用户输入验证机制,识别验证缺失、不完整或可被绕过的情况

**Severity**: High | **CWE**: CWE-20, CWE-1395 | **OWASP**: A03:2021 - Injection, A04:2021 - Insecure Design

**Trigger Patterns**:
   - `HTTP参数读取: req.body / request.getParameter() / $_POST`
   - `URL参数: req.query / request.args / $_GET`
   - `文件上传: multer / MultipartFile / $_FILES`
   - `Header读取: req.headers / request.getHeader()`
   - `Cookie读取: req.cookies / request.getCookie()`
   - `路径参数: req.params / @PathVariable`
   - `GraphQL查询: args / variables`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **输入入口识别**: 识别代码中所有接收用户或外部数据的入口点
   - **验证机制检查**: 检查每个输入入口使用的验证方法和验证库
   - **验证完整性分析**: 分析验证规则是否覆盖了所有必要的安全维度
   - **验证绕过检测**: 检查验证逻辑是否存在可被攻击者绕过的缺陷
   - **错误处理审查**: 检查验证失败时的错误处理是否安全
   - **默认值与边界检查**: 检查输入未提供或为边界值时的处理逻辑

**Evidence Requirements**:
   - [Required] 输入入口和验证逻辑的代码位置及上下文
   - [Required] 验证库配置、框架验证设置、中间件配置
   - [Optional] 输入数据从入口到使用的传播路径

**Remediation**:
   - [Critical] 使用类型安全的验证库实施输入验证 (Difficulty: Easy)
   - [High] 实施全局输入验证中间件 (Difficulty: Easy)
   - [Medium] 输入规范化处理 (Difficulty: Medium)

---

### AR-003: Authentication Check

**Description**: 检查认证机制实现,识别认证绕过、弱认证凭证处理、会话管理缺陷

**Severity**: Critical | **CWE**: CWE-287, CWE-306, CWE-798 | **OWASP**: A07:2021 - Identification and Authentication Failures, A02:2021 - Cryptographic Failures

**Trigger Patterns**:
   - `登录处理: login() / authenticate() / signIn()`
   - `Token生成: jwt.sign() / generateToken() / createAccessToken()`
   - `密码处理: bcrypt.hash() / password.encode() / MD5()`
   - `会话管理: session.set() / req.session / cookie设置`
   - `权限检查: requireAuth() / isAuthenticated() / @PreAuthorize`
   - `密码重置: resetPassword() / forgotPassword()`
   - `OAuth处理: oauth.callback() / passport.authenticate()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **认证端点识别**: 识别所有与认证相关的API端点和处理逻辑
   - **凭证处理方式**: 检查用户凭证的存储、传输和验证方式
   - **会话管理机制**: 检查Token/Session的创建、验证、刷新和销毁机制
   - **认证绕过检测**: 检查是否存在可绕过认证的路径或逻辑缺陷
   - **密码策略检查**: 检查密码复杂度要求和账户保护机制
   - **多因素认证分析**: 检查是否实现了多因素认证及实现质量

**Evidence Requirements**:
   - [Required] 认证相关代码位置,包括登录、Token生成、验证逻辑
   - [Required] 认证相关配置,如JWT密钥、Session配置、Cookie设置
   - [Optional] 凭证从输入到验证的完整流程

**Remediation**:
   - [Critical] 使用安全的密码哈希算法 (Difficulty: Easy)
   - [High] 实施JWT安全最佳实践 (Difficulty: Easy)
   - [Medium] 实施登录速率限制和账户锁定 (Difficulty: Easy)

---

### AR-004: Cryptographic Check

**Description**: 检查加密算法、密钥管理、随机数生成等密码学实现的安全性

**Severity**: High | **CWE**: CWE-326, CWE-327, CWE-328, CWE-798 | **OWASP**: A02:2021 - Cryptographic Failures, A09:2021 - Security Logging and Monitoring Failures

**Trigger Patterns**:
   - `加密调用: crypto.encrypt() / Cipher.getInstance() / AES`
   - `哈希调用: crypto.hash() / MessageDigest / hashlib.md5()`
   - `密钥操作: generateKey() / SecretKeySpec / new Buffer(secret)`
   - `随机数: Math.random() / Random() / crypto.randomBytes()`
   - `签名: sign() / verify() / RSASSA`
   - `TLS/SSL: createServer({ key, cert }) / SSLContext`
   - `编码: Base64 / URL编码(被误认为加密)`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **加密算法识别**: 识别代码中使用的所有加密、哈希、编码算法
   - **密钥管理检查**: 检查加密密钥的生成、存储、传输和轮换机制
   - **随机数生成审查**: 检查随机数生成器的类型和使用场景是否匹配
   - **加密模式分析**: 检查加密模式、填充方案、IV/Nonce的使用是否正确
   - **哈希函数检查**: 检查哈希函数的使用场景是否合适
   - **证书与TLS配置**: 检查TLS/SSL配置和证书管理是否安全

**Evidence Requirements**:
   - [Required] 加密/哈希/随机数相关代码位置和上下文
   - [Required] 加密配置、TLS设置、密钥管理配置
   - [Optional] 加密相关依赖库及其版本

**Remediation**:
   - [Critical] 替换不安全的加密算法为现代推荐算法 (Difficulty: Medium)
   - [High] 实施安全的密钥管理 (Difficulty: Medium)
   - [Medium] 使用安全的随机数生成器 (Difficulty: Easy)

---

### AR-006: Deserialization Check

**Description**: 检查反序列化操作,识别不安全的反序列化导致的远程代码执行风险

**Severity**: Critical | **CWE**: CWE-502 | **OWASP**: A08:2021 - Software and Data Integrity Failures, A05:2017 - Broken Access Control

**Trigger Patterns**:
   - `Java反序列化: ObjectInputStream.readObject() / readUnshared()`
   - `Python反序列化: pickle.loads() / yaml.load() / marshal.loads()`
   - `Node.js反序列化: unserialize() / node-serialize / serialize-javascript`
   - `PHP反序列化: unserialize() / __wakeup() / __destruct()`
   - `.NET反序列化: BinaryFormatter.Deserialize() / NetDataContractSerializer`
   - `YAML加载: yaml.load() (无Loader参数)`
   - `XML反序列化: XMLDecoder / XStream`

**Supported Languages**: java, python, javascript, typescript, php, csharp

**Check Flow**:
   - **反序列化入口识别**: 识别代码中所有反序列化操作及其调用的库
   - **数据来源追踪**: 追踪被反序列化数据的来源是否可信
   - **类型约束检查**: 检查反序列化是否限制了可实例化的类型
   - **Gadget链分析**: 分析项目依赖中是否存在可利用的反序列化Gadget链
   - **替代方案检查**: 检查是否可以使用更安全的替代方案替换原生反序列化
   - **运行时防护检测**: 检查是否有运行时反序列化安全防护措施

**Evidence Requirements**:
   - [Required] 反序列化操作代码位置和上下文
   - [Required] 反序列化相关依赖库及其版本
   - [Optional] 从数据输入到反序列化的完整流程

**Remediation**:
   - [Critical] 使用安全的数据格式替代原生反序列化 (Difficulty: Medium)
   - [High] 实施严格的类型白名单过滤 (Difficulty: Medium)
   - [Medium] 数据签名和完整性验证 (Difficulty: Easy)

---

### AR-007: XXE Check

**Description**: 检查XML解析配置和处理逻辑,识别XML外部实体注入(XXE)风险

**Severity**: High | **CWE**: CWE-611 | **OWASP**: A05:2021 - Security Misconfiguration, A04:2017 - XML External Entities (XXE)

**Trigger Patterns**:
   - `Java XML解析: DocumentBuilderFactory / SAXParser / XMLReader`
   - `Java XML转换: TransformerFactory / XPathFactory`
   - `Python XML解析: xml.etree.ElementTree / lxml / xml.dom.minidom`
   - `Node.js XML解析: libxmljs / xmldom / xml2js`
   - `PHP XML解析: simplexml_load_string() / DOMDocument`
   - `.NET XML解析: XmlDocument / XmlReader / XDocument`
   - `SOAP处理: SOAPMessage / javax.xml.soap`

**Supported Languages**: java, python, javascript, typescript, php, csharp

**Check Flow**:
   - **XML解析入口识别**: 识别代码中所有XML解析相关的调用和API使用
   - **解析器配置检查**: 检查XML解析器的安全配置是否禁用了危险特性
   - **DTD与外部实体处理**: 检查DTD声明和外部实体引用的处理方式
   - **数据流追踪**: 追踪XML数据从输入到解析的完整路径
   - **输出处理检查**: 检查XML解析结果的使用方式和错误处理

**Evidence Requirements**:
   - [Required] XML解析代码位置和配置上下文
   - [Required] XML解析相关配置、框架设置、依赖库版本
   - [Optional] XML数据从输入到解析的完整路径

**Remediation**:
   - [Critical] 禁用DTD和外部实体解析 (Java) (Difficulty: Easy)
   - [High] 使用安全的XML解析库 (Python) (Difficulty: Easy)
   - [Medium] .NET安全XML解析配置 (Difficulty: Easy)

---

### AR-008: SSRF Check

**Description**: 检查服务端网络请求逻辑,识别服务端请求伪造(SSRF)风险

**Severity**: High | **CWE**: CWE-918 | **OWASP**: A10:2021 - Server-Side Request Forgery, A07:2021 - Identification and Authentication Failures

**Trigger Patterns**:
   - `HTTP请求: fetch() / axios() / http.get() / requests.get()`
   - `URL参数构造: new URL(userInput) / url.Parse()`
   - `Webhook调用: webhook.send(url) / callback(url)`
   - `图片/文件获取: Image.fromURL() / download(url)`
   - `API代理: proxy.pass(url) / forward(url)`
   - `邮件发送: smtp.connect(host)`
   - `DNS查询: dns.resolve(host) / net.LookupHost()`

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **网络请求入口识别**: 识别代码中所有服务端发起的网络请求操作
   - **URL来源追踪**: 追踪网络请求目标URL的来源是否可控
   - **URL验证机制检查**: 检查目标URL是否有安全验证机制
   - **重定向处理分析**: 检查HTTP重定向是否可能被利用绕过验证
   - **协议与端口限制**: 检查网络请求的协议和端口是否有限制
   - **内网资源保护**: 检查是否能通过请求访问内网敏感资源

**Evidence Requirements**:
   - [Required] 网络请求代码位置和URL处理逻辑
   - [Required] 网络请求相关配置,如代理设置、超时配置、允许的域名列表
   - [Optional] 从用户输入到网络请求的完整数据流

**Remediation**:
   - [Critical] 实施域名白名单验证 (Difficulty: Easy)
   - [High] 实施IP范围验证和重定向保护 (Difficulty: Medium)
   - [Medium] 网络层隔离 (Difficulty: Hard)

---

### AR-009: Command Injection Check

**Description**: 检查操作系统命令构造和执行逻辑,识别命令注入风险

**Severity**: Critical | **CWE**: CWE-78 | **OWASP**: A03:2021 - Injection, A01:2017 - Injection

**Trigger Patterns**:
   - `Java命令执行: Runtime.getRuntime().exec() / ProcessBuilder`
   - `Node.js命令执行: child_process.exec() / execSync() / spawn()`
   - `Python命令执行: os.system() / subprocess.call() / subprocess.Popen()`
   - `PHP命令执行: exec() / system() / passthru() / shell_exec() / backtick运算符`
   - `Go命令执行: exec.Command() / exec.CommandContext()`
   - `C#命令执行: Process.Start() / ProcessStartInfo`
   - `反引号命令: `command $variable``

**Supported Languages**: java, javascript, typescript, python, csharp, php, go

**Check Flow**:
   - **命令执行入口识别**: 识别代码中所有调用操作系统命令的入口点
   - **命令构造方式分析**: 分析命令是如何构造的,是否包含动态拼接
   - **参数来源追踪**: 追踪命令中动态参数的来源是否可控
   - **参数净化检查**: 检查命令参数是否有安全净化处理
   - **Shell元字符处理**: 检查是否正确处理了Shell元字符和注入向量
   - **执行环境分析**: 分析命令执行环境的权限和限制

**Evidence Requirements**:
   - [Required] 命令执行代码位置和参数构造逻辑
   - [Required] 从用户输入到命令执行的完整数据流
   - [Optional] 执行环境配置,如用户权限、容器设置、安全策略

**Remediation**:
   - [Critical] 避免Shell执行,使用参数数组方式 (Difficulty: Easy)
   - [High] 使用白名单验证和转义函数 (Difficulty: Easy)
   - [Medium] 使用高级API替代系统命令 (Difficulty: Medium)

---

### AR-010: Expression Language Injection Check

**Description**: 检查表达式语言(EL/SpEL/OGNL/MVEL)的使用,识别表达式注入风险

**Severity**: Critical | **CWE**: CWE-94, CWE-917 | **OWASP**: A03:2021 - Injection, A01:2017 - Injection

**Trigger Patterns**:
   - `Java SpEL: ExpressionParser.parseExpression() / SpelExpressionParser`
   - `Java OGNL: Ognl.parseExpression() / Ognl.getValue()`
   - `Java EL: ELProcessor.eval() / ExpressionFactory`
   - `Spring: @Value("#{}") / #{...}`
   - `模板引擎: Thymeleaf / FreeMarker / Velocity`
   - `JavaScript: eval() / new Function() / setTimeout(string)`
   - `Python: eval() / exec() / template.render()`
   - `.NET: Eval() / DataTable.Compute() / NVelocity`

**Supported Languages**: java, javascript, typescript, python, csharp, php

**Check Flow**:
   - **表达式引擎识别**: 识别代码中使用的所有表达式引擎和动态代码执行API
   - **表达式来源追踪**: 追踪表达式字符串的来源是否可控
   - **表达式构造分析**: 分析表达式是如何构造的,是否包含用户可控的拼接
   - **执行上下文检查**: 检查表达式执行时可用的类、方法和变量范围
   - **沙箱与限制验证**: 检查是否实施了表达式执行的沙箱或限制措施
   - **模板引擎安全检查**: 检查模板引擎的配置和使用是否安全

**Evidence Requirements**:
   - [Required] 表达式解析和执行的代码位置及上下文
   - [Required] 表达式引擎配置、模板引擎设置、沙箱配置
   - [Optional] 从用户输入到表达式执行的完整数据流

**Remediation**:
   - [Critical] 使用SimpleEvaluationContext替代StandardEvaluationContext (Java) (Difficulty: Easy)
   - [High] 避免eval,使用安全的替代方案 (Difficulty: Easy)
   - [Medium] 模板引擎安全配置 (Difficulty: Medium)

---

### AR-005: SQL Query Inspection

**Description**: 检查SQL查询的构造方式和参数处理，识别注入风险

**Severity**: High | **CWE**: CWE-89 | **OWASP**: A03:2021 - Injection, A1:2017 - Injection

**Trigger Patterns**:
   - `字符串拼接: "SELECT * FROM users WHERE id=" + input`
   - `模板字符串: `SELECT * FROM ${table}``
   - `格式化字符串: sprintf("SELECT * FROM %s", table)`
   - `追加操作: query.append(variable)`
   - `动态查询构造: new Query().select().from().where()`

**Supported Languages**: java, javascript, python, csharp, php, go, rust

**Check Flow**:
   - **查询构造方式识别**: 识别SQL查询是通过什么方式构造的
   - **参数来源追踪**: 追踪SQL查询中的每个动态参数来自何处
   - **参数可控性判定**: 判定攻击者是否能够通过输入直接控制这个参数
   - **可达性验证**: 验证这个查询是否真的会被用户输入触发执行
   - **防护措施检查**: 检查是否有防护措施来防止SQL注入

**Evidence Requirements**:
   - [Required] 准确的代码位置和完整上下文(前5行后5行)
   - [Required] 参数从输入源到SQL查询的完整数据流
   - [Optional] ORM或数据库配置，如存在

**Remediation**:
   - [Critical] 使用参数化查询 (最优方案) (Difficulty: Easy)
   - [High] 输入白名单验证 (辅助防护) (Difficulty: Easy)
   - [Medium] 黑名单过滤 (不推荐，但可作为额外防护) (Difficulty: Easy)


---

## Review Rules (RR)

### RR-001: False Positive Detection

**Description**: 通过系统化的问题检查，确认一个发现是否是真实的漏洞

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **是否存在补偿性控制(Compensating Controls)?**: 许多看似存在漏洞的代码实际上有其他防护措施防止被利用。
例如: 虽然有SQL注入点，但参数被WAF过滤、被IDS检测或被其他层防护。
   - **是否只有特定角色(如管理员)能访问这个功能?**: 如果一个漏洞只能由管理员触发，其风险等级应该降低。
虽然仍是漏洞，但利用难度很高。
   - **参数是否被严格的白名单限制?**: 即使代码看起来可能存在注入漏洞，如果参数被严格限制，实际风险可能很低。
例如: 用户ID必须是1-999999之间的数字，黑客无法注入SQL语句。
   - **这是否是框架的自动安全特性(如自动参数化)?**: 现代框架(ORM、Web框架)经常自动实现安全措施。
看起来不安全的代码实际上可能被框架自动参数化。
例如: Hibernate自动参数化、Express模板引擎自动转义。
   - **这个代码路径是否真的会被执行?**: 有些代码看起来危险但实际上是死代码、被禁用、或在异常处理块中。
这些情况下是否是漏洞需要重新评估。
   - **这个"漏洞"是否涉及真实的安全边界?**: 有些发现涉及不跨越安全边界的操作，因此不构成真实威胁。
例如: 日志输出中的拼接、内部系统之间的通信、测试代码。

**False Positive Patterns**:
   - **管理员功能误报**
     Indicators: 函数路径: admin* / management* / internal*, 访问控制: 需要 ROLE_ADMIN / isAdmin() 检查, 代码注释中提到 "admin only" / "internal use", 错误处理: 非管理员返回403/401
     Verification:
     - 确认是否有访问控制检查
     - 追踪权限检查的位置和方式
     - 验证权限检查是否在危险操作之前
     - 测试: 用普通用户能否访问此功能?
   - **框架自动参数化误报**
     Indicators: 使用了ORM框架: Hibernate, JPA, Sequelize, SQLAlchemy, 使用框架查询API: .find(), .where(), .query(), 代码中看起来有拼接但实际使用框架, IDE提示使用了安全API
     Verification:
     - 查看框架文档关于参数化的说明
     - 检查框架配置是否启用了安全特性
     - 查看框架源代码或生成的SQL日志
     - 运行测试: 尝试SQL注入是否成功?
   - **日志输出误报**
     Indicators: 函数名包含: log* / print* / debug* / trace*, 代码调用: logger.* / console.* / println, 拼接内容不涉及数据库查询, 这是事后日志而非执行前操作
     Verification:
     - 确认这是日志输出而非SQL/命令执行
     - 验证输出内容是否会被命令执行
     - 确认这不会导致CRLF注入或日志注入
     - 检查日志是否被进一步处理
   - **白名单防护误报**
     Indicators: 参数值在固定列表中: enums / switch / 硬编码列表, 参数验证代码: if (value in [...]) / switch/case, 类型强制转换: (int) / Integer.parseInt() / atoi(), 正则表达式验证: matches("^[0-9]+$")
     Verification:
     - 分析白名单是否真的限制了参数
     - 检查白名单是否被绕过的可能性
     - 验证类型转换是否足够安全
     - 进行渗透测试: 能否绕过这个防护?
   - **多层防护误报**
     Indicators: 代码中有多个安全措施, 通过: 输入验证 + 参数化 + WAF + 权限检查, 任何一层防护都足以防止漏洞, 漏洞仅在绕过所有防护才会出现
     Verification:
     - 列出每一层防护
     - 评估每层防护的有效性
     - 检查是否存在绕过所有防护的方式
     - 计算总体风险: 单层风险 vs 需绕过多层风险
   - **代码死亡路径误报**
     Indicators: 函数被注释: // function(), 代码被 #ifdef 禁用, 代码被 if (false) 保护, 被 @Deprecated 标记且未使用, 代码在异常处理: catch / finally 块中永远无法正常到达
     Verification:
     - 确认代码是否真的不会被执行
     - 检查是否有其他代码路径调用此函数
     - 验证注释/禁用是否是永久的
     - 代码扫描: 这个函数在哪里被调用?
   - **TOCTOU (Time Of Check, Time Of Use) 假警报**
     Indicators: 代码看起来有竞态条件但实际上不存在, 变量在检查后立即使用, 单线程环境被误认为多线程, 状态验证后立即操作
     Verification:
     - 分析是否真的存在时间窗口
     - 检查是否使用了锁/原子操作
     - 验证执行环境是否真的多线程
     - 评估实际的利用可能性

---

### RR-002: Reachability Analysis

**Description**: 通过控制流分析和调用链追踪，验证被标记的代码路径是否真正可达且可执行

**Scope**: AR-001, AR-002, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **该代码路径是否从外部用户输入可达?**: 安全漏洞必须能够从攻击者控制的输入源触发。
如果危险代码无法从任何外部输入到达(如内部工具函数未被调用)，则不构成实际威胁。
需要追踪从API入口、HTTP端点、消息队列消费者等外部入口到目标代码的完整路径。
   - **是否存在阻止代码执行的前置条件?**: 危险代码可能被条件语句保护，这些条件在实际运行中永远不会满足。
例如: 需要特定环境变量、配置文件开关、或运行时状态。
如果这些前置条件无法满足，代码实际上是死代码。
   - **包含漏洞的函数是否被其他代码调用?**: 即使函数本身有漏洞，如果没有被调用或调用链已断开，则不构成风险。
需要通过静态分析查找所有调用点，确认是否存在活跃的调用路径。
注意间接调用(如反射、回调、事件监听器)可能被遗漏。
   - **代码路径中是否存在中间过滤或拦截器?**: 即使代码路径可达，中间层(如中间件、拦截器、过滤器)可能在数据到达危险代码前进行处理。
例如: Spring Security拦截器、Express中间件、输入验证过滤器。
这些中间层可能已经对输入进行了清理或拒绝。
   - **该代码是否仅在异常/错误处理路径中?**: 位于异常处理块中的代码通常只在出错时执行，触发条件更为苛刻。
虽然仍可能构成漏洞，但利用难度显著增加。
需要区分正常的错误处理和可能被利用的异常路径。
   - **代码是否依赖已废弃或已移除的功能?**: 标记的漏洞可能存在于已被废弃但尚未删除的代码中。
这些代码可能在生产环境中已被禁用或通过路由移除。
需要确认代码是否仍在活跃使用。

**False Positive Patterns**:
   - **未调用工具函数误报**
     Indicators: 函数定义在utils/helpers/common模块中, grep/代码搜索显示零调用点, 函数可能是为未来功能预留, 来自第三方库但项目中未使用
     Verification:
     - 使用IDE的"查找引用"功能确认调用点
     - 检查动态调用(反射、eval、回调注册)
     - 确认是否被测试代码专用
     - 验证函数是否被导出但未使用
   - **Feature Flag控制误报**
     Indicators: 代码被if(featureEnabled)或类似检查保护, 配置文件中有功能开关, 环境变量控制功能启用, A/B测试或灰度发布相关代码
     Verification:
     - 检查生产环境配置中该Feature Flag的状态
     - 确认Flag是否默认为关闭
     - 验证是否有管理界面控制Flag
     - 评估Flag被意外启用的可能性
   - **废弃端点误报**
     Indicators: 路由被注释或从路由表中移除, 有@Deprecated或@Deprecated标记, API文档中已标注废弃, 返回410 Gone或404 Not Found
     Verification:
     - 确认路由是否真的从配置中移除
     - 检查是否有其他路由指向同一处理函数
     - 验证废弃代码是否仍被某些客户端调用
     - 确认生产环境是否真的不响应此端点
   - **测试/模拟代码误报**
     Indicators: 文件路径包含test/mock/stub/fake, 在__tests__/tests/spec目录中, 函数名包含Mock/Stub/Test, 仅在测试依赖中使用的代码
     Verification:
     - 确认代码是否在测试目录
     - 检查生产构建是否排除测试代码
     - 验证代码是否仅在测试配置中加载
     - 确认测试代码不会被生产环境执行
   - **条件编译误报**
     Indicators: #ifdef / #if DEBUG 等预处理指令, process.env.NODE_ENV === "development", BUILD_TYPE或类似编译时条件, 平台特定代码(如#ifdef WIN32)
     Verification:
     - 确认生产构建使用的编译条件
     - 检查条件是否在生产环境中满足
     - 验证代码是否被编译进最终产物
     - 分析不同构建配置的差异

---

### RR-003: Exploitability Assessment

**Description**: 从攻击者视角评估已确认漏洞的真实可利用性，分析攻击复杂度和技术可行性

**Scope**: AR-001, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **攻击者能否可靠地构造出有效的攻击载荷?**: 理论上存在漏洞不等于可以被可靠利用。
某些漏洞需要精确控制输入的长度、编码、时序或特定值，这在现实攻击中可能不可行。
例如: 需要特定内存地址对齐、需要绕过ASLR、需要精确的编码转换。
   - **利用该漏洞是否需要认证或特殊权限?**: 需要认证或高权限才能利用的漏洞，其攻击面显著缩小。
未认证可利用的漏洞风险远高于需要管理员权限的漏洞。
需要明确区分匿名、认证用户、管理员等不同角色的利用条件。
   - **利用是否依赖特定的运行环境或配置?**: 某些漏洞仅在特定的操作系统、库版本、配置参数或部署模式下才能被利用。
如果目标环境不满足这些条件，漏洞虽然存在但不可利用。
例如: 仅影响Windows的漏洞在Linux部署中不可利用。
   - **利用过程是否稳定可靠?**: 不稳定的漏洞利用可能导致服务崩溃但无法获得控制权，或者需要大量尝试才能成功。
竞争条件、时序漏洞和内存破坏类漏洞往往具有不确定性。
利用的稳定性直接影响其实际威胁等级。
   - **是否存在已知的公开利用代码或工具?**: 公开可用的exploit代码大幅降低了利用门槛。
即使漏洞本身利用难度高，公开的利用工具也会使其成为高危。
需要检查CVE数据库、exploit-db、GitHub等来源。
   - **成功利用后能造成什么实际影响?**: 漏洞的实际危害取决于利用后能做什么。
读取少量非敏感数据的漏洞与执行远程代码的漏洞危害级别完全不同。
需要区分信息泄露、权限提升、远程代码执行等影响等级。

**False Positive Patterns**:
   - **理论攻击链误报**
     Indicators: 漏洞利用需要超过5个步骤的完整攻击链, 每个步骤都有独立的防护机制, 需要同时满足多个独立条件, 攻击链中存在不可控环节
     Verification:
     - 列出完整的攻击链步骤
     - 评估每个步骤的成功率
     - 计算整体攻击成功率(各步骤相乘)
     - 判断是否有更简单的替代攻击路径
   - **编码/转换障碍误报**
     Indicators: 输入经过多层编码(HTML编码、URL编码、Base64), 需要绕过编码转换才能构造有效载荷, 目标系统使用不兼容的字符集, 编码过程破坏了攻击载荷的关键字符
     Verification:
     - 追踪输入的完整编码/解码链
     - 确认编码过程是否破坏攻击载荷
     - 测试是否能找到编码绕过方法
     - 验证目标端点期望的编码格式
   - **长度/大小限制误报**
     Indicators: 输入字段有严格的长度限制(如<50字符), 载荷大小超过允许的缓冲区, 数据库字段长度限制了注入内容, 文件名或路径长度限制
     Verification:
     - 确认实际的长度限制值
     - 评估最小有效载荷大小
     - 检查是否存在截断或绕过方式
     - 测试在限制范围内是否能构造有效攻击
   - **网络隔离误报**
     Indicators: 漏洞服务仅在内网可访问, 服务绑定到localhost/127.0.0.1, 防火墙规则限制访问源IP, 服务在VPC或私有网络中
     Verification:
     - 确认服务的网络监听地址
     - 检查防火墙和安全组规则
     - 评估从外部网络到该服务的路径
     - 考虑是否存在SSRF等绕过网络隔离的方式
   - **竞争条件利用难度误报**
     Indicators: 漏洞需要精确的时序控制, 时间窗口极短(毫秒级), 需要并发请求精确定位, 依赖系统负载或响应时间
     Verification:
     - 测量实际的时间窗口大小
     - 评估在现实网络条件下的利用可行性
     - 检查是否有同步机制减少竞争可能
     - 测试在典型服务器负载下的可重复性

---

### RR-004: Severity Calibration

**Description**: 综合业务上下文、技术环境和现有防护措施，对漏洞严重程度进行动态校准

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **受影响的数据或资源的敏感程度如何?**: 漏洞的严重程度很大程度上取决于受影响数据的价值。
泄露用户密码比泄露公开新闻内容严重得多。
需要根据数据分类(公开、内部、机密、绝密)来评估影响。
同时考虑数据量级: 影响10条记录和100万条记录的影响完全不同。
   - **是否有纵深防御(Depth of Defense)措施可以缓解影响?**: 即使单点存在漏洞，多层安全措施可以显著降低实际风险。
例如: 即使存在SQL注入，如果数据库使用只读账号且数据已加密，影响被大幅限制。
需要评估每层防护的有效性和独立性。
   - **漏洞被利用后是否影响业务连续性?**: 某些漏洞允许攻击者破坏服务的可用性。
影响业务连续性的漏洞(如DoS、数据破坏)通常比纯信息泄露更紧急。
需要考虑系统的关键程度: 核心支付系统的漏洞比内部报表系统的漏洞更紧急。
   - **该漏洞是否违反合规或法规要求?**: 某些漏洞直接导致合规违规(GDPR、PCI DSS、HIPAA、等保2.0等)。
合规违规可能带来法律后果和巨额罚款，需要提升优先级。
即使技术上风险较低，合规要求可能强制要求修复。
   - **修复该漏洞的难度和成本如何?**: 修复成本影响优先级排序。
如果修复非常简单(一行代码改动)，即使风险较低也应该立即修复。
如果修复需要重大重构，可能需要评估临时缓解措施。
   - **是否存在可接受的临时缓解措施?**: 在完整修复之前，临时缓解措施可以显著降低风险。
例如: WAF规则可以阻止已知攻击模式，速率限制可以减少暴力破解的影响。
有效的临时缓解措施可以降低修复的紧急程度。

**False Positive Patterns**:
   - **过度评级-只读操作误报**
     Indicators: 漏洞仅影响只读操作(SELECT查询), 无法修改或删除数据, 受影响数据已经是公开的, 操作不涉及写入或状态变更
     Verification:
     - 确认数据库操作的权限级别(只读vs读写)
     - 评估可读取数据的敏感程度
     - 检查是否有数据量限制
     - 判断信息泄露的实际影响
   - **过度评级-局部影响误报**
     Indicators: 漏洞仅影响单个用户的数据, 无法横向移动或影响其他用户, 影响范围被严格隔离, 不涉及共享资源或全局状态
     Verification:
     - 确认影响范围是否真的局限
     - 检查是否存在横向移动路径
     - 验证隔离机制的有效性
     - 评估批量利用的可能性
   - **过度评级-低价值目标误报**
     Indicators: 受影响的是测试/预发环境, 数据是模拟或脱敏数据, 功能仅用于开发调试, 系统不处理真实业务数据
     Verification:
     - 确认受影响环境是否处理真实数据
     - 检查环境是否可从外部访问
     - 评估测试数据泄露的实际影响
     - 验证环境配置是否与生产一致
   - **忽略缓解措施的评级误报**
     Indicators: 评级未考虑已有的WAF/IPS规则, 忽略了数据库权限最小化配置, 未考虑加密存储的额外保护, 评级基于最坏情况而非实际情况
     Verification:
     - 列出所有现有的安全控制措施
     - 评估每项控制在漏洞利用路径上的作用
     - 重新计算考虑缓解措施后的风险
     - 与CVSS环境评分进行对比
   - **CVSS基准评分误用**
     Indicators: 直接使用CVSS基准评分而忽略环境因素, 未调整攻击复杂度(AV/AC)的环境值, 未考虑实际部署的权限要求, 未评估受影响资产的实际价值
     Verification:
     - 使用CVSS环境评分组调整基准分数
     - 根据实际部署调整攻击向量(AV)
     - 根据访问控制调整权限要求(PR)
     - 根据数据敏感性调整影响(I/C/A)

---

### RR-005: Context Analysis

**Description**: 分析业务上下文、部署环境和应用架构，识别上下文相关的安全假设和风险因素

**Scope**: AR-001, AR-002, AR-003, AR-004, AR-005, AR-006, AR-007, AR-008, AR-009, AR-010

**Key Questions**:
   - **该应用的业务类型和安全需求等级是什么?**: 不同业务类型对安全的要求不同。金融系统的安全标准远高于内部博客系统。
需要了解应用处理的业务类型、用户群体和数据敏感度，以正确评估风险的优先级。
同时考虑应用是否为面向互联网(高暴露)还是内部使用(低暴露)。
   - **部署环境提供了哪些安全基础设施?**: 现代云原生部署环境通常提供多层安全基础设施。
容器隔离、服务网格(mTLS)、云平台安全组、WAF等都提供了额外的安全层。
这些基础设施可能已经缓解了许多传统的安全问题。
   - **系统架构是否定义了明确的安全边界?**: 良好的系统架构应该有明确定义的安全边界和信任区域(DMZ、内网、管理网)。
了解这些边界有助于判断: 一个从DMZ到内网的请求是否可信?
微服务架构中的服务间通信是否需要认证? API网关是否统一处理安全?
   - **系统的信任模型是什么? 谁信任谁?**: 信任模型决定了哪些组件之间的通信可以假设是安全的。
如果内部服务之间默认互信，那么SSRF或内部服务调用的风险较低。
如果零信任模型，则所有通信都需要验证。
了解信任模型对于评估内部漏洞的风险至关重要。
   - **系统依赖的外部服务或第三方组件引入了哪些风险?**: 现代应用大量依赖外部服务和第三方组件。
这些依赖可能引入供应链攻击、服务中断、数据泄露等风险。
需要评估外部依赖的安全性和可靠性，以及系统对外部依赖的信任程度。
   - **应用的部署和发布流程是否包含安全控制?**: CI/CD流程中的安全控制(如SAST、DAST、依赖扫描、密钥检测)可以在发布前捕获问题。
如果发布流程缺乏安全控制，漏洞可能直接进入生产环境。
了解发布流程有助于评估漏洞进入生产的可能性和修复速度。

**False Positive Patterns**:
   - **忽略部署环境误报**
     Indicators: 漏洞报告未考虑生产环境的安全配置, 基于默认配置评估风险但生产已加固, 未考虑云安全组/防火墙的实际规则, 假设端口暴露但实际仅内网可访问
     Verification:
     - 检查生产环境的实际安全配置
     - 验证云安全组和网络ACL规则
     - 确认服务的实际监听地址和端口
     - 对比报告假设与实际部署差异
   - **忽略业务上下文误报**
     Indicators: 漏洞评估未考虑应用的实际情况, 假设所有用户都是恶意的但实际是内部系统, 未考虑数据已经是公开的, 假设高价值目标但实际是低价值系统
     Verification:
     - 了解应用的业务用途和用户群体
     - 评估受影响数据的实际价值
     - 确认系统是否面向互联网
     - 了解业务对安全的具体要求
   - **架构安全假设误报**
     Indicators: 假设架构有安全防护但实际未部署, 报告假设服务间有认证但实际没有, 假设API网关处理了所有安全检查, 假设微服务隔离但实际共享数据库
     Verification:
     - 确认架构文档与实际部署是否一致
     - 验证安全组件是否真的在生产环境运行
     - 检查服务间通信的实际认证机制
     - 确认数据隔离的实际实现方式
   - **第三方组件信任误报**
     Indicators: 盲目信任第三方组件的安全性, 未检查依赖库的已知漏洞, 假设第三方API总是返回可信数据, 未考虑供应链攻击的可能性
     Verification:
     - 运行SCA(软件组成分析)扫描依赖
     - 检查依赖库的安全维护历史
     - 验证第三方API返回数据的处理
     - 评估依赖更新策略和响应速度
   - **合规要求忽略误报**
     Indicators: 漏洞评估未考虑行业合规要求, 未识别数据处理涉及的法规约束, 忽略了数据驻留和跨境传输要求, 未考虑审计日志和可追溯性需求
     Verification:
     - 识别应用涉及的所有合规要求
     - 评估漏洞是否导致合规违规
     - 检查数据处理是否符合法规
     - 确认审计和日志是否满足要求


---

## Evidence Standards (ER)

### ER-001: Source Code Evidence Standard

**Description**: 规范源代码证据的采集和呈现方式，确保每个发现都有准确、完整的代码证据

**Required Fields**: file_path, line_number, code_snippet, context, dangerous_operation, data_flow, control_analysis, conclusion

**Collection Guidance**:
   - 步骤1: 确定危险代码位置
  - 使用IDE或代码审查工具精确定位
  - 记录: 文件路径 + 行号 + 列号
  - 示例: src/main/java/com/app/UserService.java:48:20
   - 步骤2: 获取完整代码上下文
  - 显示危险行前5行和后5行
  - 帮助理解代码的执行环境
  - 包括函数声明和错误处理
   - 步骤3: 追踪数据流
  - 参数从哪里来? (request? 数据库? 文件?)
  - 经过多少个函数? 在每个函数中被修改吗?
  - 最后如何被使用? (SQL? 命令行? 输出?)
  - 记录每一步的位置
   - 步骤4: 分析防护措施
  - 是否有输入验证?
  - 是否有类型强制?
  - 是否有参数化API?
  - 是否有外部防护(WAF)?
  - 结论: 是否所有防护都失效?
   - 步骤5: 形成明确结论
  - 基于所有上述证据
  - 使用具体而非假设语言
  - "用户输入直接拼接SQL" 而非 "可能存在注入"
  - 评估信心度: 是否100%确定这是漏洞?

---

### ER-002: Data Flow Evidence Standard

**Description**: 规范数据流追踪证据的采集，确保参数从source到sink的每一步都有据可查

**Required Fields**: source_location, sink_location, flow_steps, parameter_name, validation_points, taint_status, conclusion

**Collection Guidance**:
   - 步骤1: 确定数据来源(Source)
  - 识别参数入口: HTTP参数、文件读取、数据库查询、API响应等
  - 记录: 文件路径 + 行号 + 具体的接收代码
  - 标注来源类型: user_input / database / file / config / external_api
  - 初始污染状态: TAINTED (对于用户输入)
   - 步骤2: 逐层追踪参数传递
  - 跟随参数: 每个函数调用都要追踪
  - 记录每一步: 文件位置 + 操作类型 + 参数是否被修改
  - 注意别名: 参数可能被赋值给新变量(var cleanData = dirtyInput)
  - 不要跳过中间层: 即使只是传递也要记录
   - 步骤3: 识别所有验证/净化点
  - 搜索净化函数: escapeHtml(), sanitize(), validate(), trim()等
  - 检查框架自动防护: 模板引擎自动转义、ORM参数化等
  - 记录每个防护点: 位置 + 防护方式 + 是否有效
  - 注意: 部分防护(如trim、toLowerCase)不能防止注入
   - 步骤4: 分析数据变换
  - 记录所有数据变换: 编码、拼接、格式化、类型转换
  - 评估变换是否改变污染状态: encodeURIComponent()可能净化某些注入
  - 注意上下文: 同样的数据在SQL vs HTML vs CLI中有不同风险
   - 步骤5: 确认汇聚点(Sink)
  - 识别危险操作: SQL执行、HTML渲染、系统命令、文件写入等
  - 记录: 文件位置 + 危险代码 + 操作上下文
  - 确认污染参数是否到达此点
  - 评估: 到达sink时的污染状态
   - 步骤6: 形成完整结论
  - 汇总: Source → Flow → Sink 完整路径
  - 明确标注: 每一步的污染状态
  - 结论应该基于追踪到的证据，而非推测
  - 如果某段路径无法确定，标注为 "unknown" 而非假设

---

### ER-003: Configuration Evidence Standard

**Description**: 规范配置层面证据的采集，确保框架设置、安全配置、环境变量等配置证据完整可追溯

**Required Fields**: config_file_path, config_section, setting_name, current_value, expected_secure_value, environment, impact_analysis, conclusion

**Collection Guidance**:
   - 步骤1: 定位配置文件
  - 搜索常见配置文件: .env, config/*.js, application.yml, web.config等
  - 识别框架特定配置: Django settings.py, Spring application.properties等
  - 记录: 文件完整路径 + 环境标识(dev/test/staging/prod)
  - 注意: 配置可能分布在多个文件或环境变量中
   - 步骤2: 提取安全相关配置项
  - 识别安全配置: 认证、授权、加密、CORS、CSRF、会话、日志等
  - 记录: 配置名称 + 当前值 + 所在行号
  - 标注: 该配置的安全含义和影响范围
   - 步骤3: 对比安全基准值
  - 查找框架默认值: 文档/源码中的默认配置
  - 对比安全建议: OWASP/安全最佳实践推荐值
  - 分析偏离: 当前值 vs 默认值 vs 安全值的差异
  - 评估: 偏离是否引入了安全风险
   - 步骤4: 追踪配置覆盖链
  - 检查优先级: 环境变量 > 配置文件 > 代码默认值
  - 追踪覆盖关系: 哪个配置覆盖了哪个
  - 注意: 运行时动态配置可能覆盖静态配置
  - 记录: 完整的配置解析/覆盖路径
   - 步骤5: 检查关联配置
  - 安全配置通常相互关联(如: CORS + CSRF + CSP)
  - 检查一个配置是否影响其他配置的效果
  - 评估整体安全配置的一致性和完整性
  - 识别配置冲突(如: 同时启用和禁用某个功能)
   - 步骤6: 形成配置评估结论
  - 明确标注: 安全 / 不安全 / 需要改进
  - 说明: 风险等级和影响范围
  - 给出: 具体的修复建议和推荐配置值
  - 注意: 区分"配置缺失"和"配置错误"

---

### ER-004: API Evidence Standard

**Description**: 规范API层面证据的采集，确保API定义、认证、输入输出、权限等证据完整可追溯

**Required Fields**: endpoint_definition, handler_location, authentication_method, authorization_rules, input_parameters, response_format, security_controls, conclusion

**Collection Guidance**:
   - 步骤1: 定位API端点定义
  - 查找路由注册: Express router.*, Spring @RequestMapping, Django urls.py等
  - 记录: HTTP方法 + 完整路径 + API版本 + 处理函数位置
  - 识别: 中间件链(认证、验证、限流等中间件)
  - 注意: 动态路由参数(:id, {id})和查询参数
   - 步骤2: 分析认证机制
  - 确定认证方式: JWT、Session、OAuth2、API Key、None
  - 检查认证中间件/装饰器的实现
  - 验证: token是否校验签名、有效期、issuer
  - 记录: 认证失败时的响应(是否泄露信息)
   - 步骤3: 检查授权控制
  - 分析: 谁能访问这个API(角色/权限/ownership)
  - 检查水平越权: 用户A能否操作用户B的资源
  - 检查垂直越权: 普通用户能否执行管理员操作
  - 记录: 权限检查的位置和逻辑
   - 步骤4: 审查输入参数
  - 列出所有输入: 路径参数、查询参数、请求体、headers
  - 检查每个参数的验证: 类型、长度、格式、范围
  - 识别: 是否有schema验证(Joi/Zod/class-validator等)
  - 注意: 未验证的参数是潜在的攻击入口
   - 步骤5: 分析响应和错误处理
  - 检查响应格式: 是否包含敏感数据(密码、token、内部ID)
  - 分析错误响应: 是否泄露堆栈跟踪、SQL错误、内部路径
  - 评估: 错误信息是否过于详细
  - 记录: 所有可能的HTTP状态码和对应响应
   - 步骤6: 评估整体安全措施
  - 限流: 是否有rate limiting策略
  - 审计: 是否有操作日志记录
  - CSRF: 是否有CSRF防护(对于非纯API)
  - CORS: 跨域配置是否安全
  - 形成结论: API的整体安全状态和具体改进建议

---

### ER-005: Dependency Evidence Standard

**Description**: 规范依赖层面证据的采集，确保库版本、CVE、依赖树分析等证据完整可追溯

**Required Fields**: dependency_name, installed_version, version_constraint, dependency_type, cve_list, vulnerability_analysis, dependency_tree_path, conclusion

**Collection Guidance**:
   - 步骤1: 收集依赖清单
  - 读取包管理器文件: package.json, pom.xml, requirements.txt, go.mod等
  - 读取锁定文件: package-lock.json, yarn.lock, poetry.lock, go.sum等
  - 区分: 直接依赖(项目声明) vs 间接依赖(传递依赖)
  - 记录: 包名 + 精确版本 + 版本约束 + 依赖类型
   - 步骤2: 查询已知CVE
  - 使用工具: npm audit, Snyk, GitHub Dependabot, osv.dev
  - 查询每个依赖的已知CVE
  - 记录: CVE-ID + CVSS评分 + 影响版本范围 + 修复版本
  - 注意: 有些CVE可能需要特定条件才能触发
   - 步骤3: 分析CVE实际影响
  - 搜索项目代码: 是否使用了受CVE影响的函数/模块
  - 评估: 如果使用了受影响功能 → 实际风险
  - 评估: 如果没有使用受影响功能 → 理论风险
  - 注意: 即使未直接使用,间接调用也可能触发漏洞
   - 步骤4: 分析依赖树路径
  - 生成完整依赖树: npm ls, mvn dependency:tree, pipdeptree
  - 追踪: 谁引入了这个依赖(直接还是间接)
  - 注意: 版本冲突和重复依赖(同一包多个版本)
  - 评估: 能否通过更新直接依赖来消除有漏洞的间接依赖
   - 步骤5: 评估更新可行性
  - 检查最新版本: 是否有补丁版本可用
  - 评估破坏性变更: 主版本更新可能有breaking changes
  - 检查维护状态: 包是否还在维护、是否有替代方案
  - 优先级排序: critical → high → medium → low
   - 步骤6: 评估供应链风险
  - 检查包维护者信誉和社区活跃度
  - 评估: 下载量、stars、issues响应速度
  - 注意: 新维护者接管、废弃包、恶意包发布等风险
  - 记录: 供应链风险评级

---

### ER-006: Runtime Evidence Standard

**Description**: 规范运行时行为证据的采集，确保日志、网络流量、内存状态等运行时证据完整可追溯

**Required Fields**: evidence_type, timestamp, source, observed_behavior, reproduction_steps, environment_context, normal_vs_abnormal, conclusion

**Collection Guidance**:
   - 步骤1: 确定证据类型和来源
  - 识别可用的证据源: 应用日志、数据库日志、网络抓包、系统监控等
  - 确定证据类型: 日志(log)、网络(network)、内存(memory)、进程(process)等
  - 记录: 每个证据源的位置、格式、访问方式
  - 注意: 确保日志级别足够详细(debug/info,不是error only)
   - 步骤2: 记录完整的时间线
  - 所有时间戳使用ISO8601格式,统一时区(UTC)
  - 使用请求ID/会话ID关联多个日志条目
  - 构建完整的时间线: 请求进入 → 处理 → 响应 → 后续影响
  - 标注关键事件点和时间间隔
   - 步骤3: 详细记录复现步骤
  - 一步一步记录如何触发该行为
  - 包含: 输入数据、环境状态、前置条件
  - 确保: 其他人在相同条件下可以复现
  - 记录: 复现次数和一致性(是否每次都能复现)
   - 步骤4: 对比正常与异常行为
  - 记录正常请求的行为(基线)
  - 对比异常请求与正常请求的差异
  - 关注: 响应时间、返回数据量、错误率、资源消耗
  - 量化差异: "慢20倍" 而非 "明显慢很多"
   - 步骤5: 收集多维度证据
  - 应用层: 日志、堆栈跟踪、错误信息
  - 网络层: HTTP请求/响应、抓包数据、TLS信息
  - 数据层: SQL查询、查询计划、结果集大小
  - 系统层: CPU、内存、磁盘、网络IO
  - 安全层: WAF日志、IDS/IPS告警、认证日志
   - 步骤6: 形成关联证据链
  - 将所有证据源按时间线关联
  - 使用request ID、session ID等追踪标识符
  - 形成完整链条: 入口 → 处理 → 影响 → 结果
  - 结论应该基于多维度证据的一致性


---

## Usage

### Code Audit Mode
1. **Scan** for patterns that trigger Audit Rules (AR-001~AR-010)
2. **Execute** each check step in order
3. **Collect** evidence per Evidence Standards (ER-001~ER-006)
4. **Review** findings using Review Rules (RR-001~RR-005)
5. **Calibrate** severity based on context and defenses

---

*Generated by HOS-Audit-Core | Version 0.3.0 | 2026-06-17*
