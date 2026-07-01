/**
 * HOS-Sec-Engine V2 - Web XSS 0day Skills
 * XSS 过滤 0day 专项 Skill
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const xss0daySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-xss-0day',
      name: 'Web XSS Filter 0day',
      category: 'web',
      subCategory: 'xss',
      riskLevel: 'high',
      confidence: 0.89,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['xss', '0day', 'filter-bypass', 'csp-bypass', 'dom-xss', 'stored-xss'],
    },
    trigger: {
      scenarios: [
        '目标使用最新的 CSP 策略/WAF XSS 过滤，存在未公开的绕过方式',
        '发现用户输入反射到 HTML 页面中，但经典 XSS payload 无法触发',
        '前端框架（React、Vue、Angular）对模板注入有防护，需要绕过',
        'DOM-based XSS 场景，输入通过 JavaScript 动态插入 DOM',
        'CSP 策略限制了内联脚本执行，但仍存在反射点或 unsafe-eval',
      ],
      keywords: [
        'xss绕过',
        'xss bypass',
        'csp bypass',
        'filter bypass',
        '0day xss',
        'dom xss',
        'stored xss',
      ],
      aliases: [
        'XSS 0day',
        'xss filter bypass 0day',
        'csp 0day',
      ],
      indicators: [
        'Reflected input in HTML context',
        'CSP violation report',
        'XSS filter blocked payload',
        'unsafe-inline in CSP',
        'eval() or setTimeout with string argument',
        'innerHTML/dynamic DOM insertion',
      ],
    },
    knowledge: {
      description:
        'XSS (Cross-Site Scripting) 过滤 0day 涵盖跨站脚本攻击中绕过现代 WAF 过滤器、CSP 策略和前端框架防护的新型技术。随着 Web 安全的发展，传统的 <script>alert(1)</script> 已被广泛检测和拦截，但 XSS 攻击仍在持续演进。现代 XSS 0day 主要涉及以下方向：CSP (Content Security Policy) 绕过，包括利用 unsafe-inline、unsafe-eval、nonce 重用、base-uri 缺陷、strict-dynamic 绕过等技术；DOM-based XSS 绕过，通过寻找新的 XSS sink（如 Element.innerHTML、document.write、location.hash 处理器、postMessage handler）和利用 DOM 解析差异；前端框架模板绕过，利用 React 的 dangerouslySetInnerHTML、Vue 的 v-html、Angular 的 bypassSecurityTrustHtml 等功能的配置错误；Mutation XSS（mXSS），利用浏览器对 HTML 的规范化处理导致过滤失效；以及基于新型 HTML5 特性的 XSS，如 <webview>、<portal>、<iframe srcdoc>、Shadow DOM 等。XSS 的核心在于找到用户可控输入到危险执行点（XSS sink）的数据流，绕过中间的所有过滤和防护机制',
      symptoms: [
        '用户输入被反射到 HTML 页面中，但被编码或过滤后无法直接执行脚本',
        'CSP 响应头包含 script-src \'self\' 或 strict-dynamic，但未覆盖所有执行路径',
        '页面使用了 dangerouslySetInnerHTML (React)、v-html (Vue) 或 $sce.trustAsHtml (Angular)',
        'JavaScript 代码中使用 eval()、setTimeout/setInterval 字符串参数、Function 构造函数',
        'DOM XSS sink 存在：innerHTML、outerHTML、document.write、insertAdjacentHTML',
        'postMessage 事件处理器未验证消息来源，直接将消息内容插入 DOM',
        'SVG/MathML 标签未被正确过滤，可利用 onload/onerror 事件执行脚本',
      ],
      rootCauses: [
        '输出编码不完整：仅在 HTML 上下文编码，忽略了 JavaScript、URL、CSS 上下文',
        'CSP 策略配置过于宽松：包含 \'unsafe-inline\'、\'unsafe-eval\' 或通配符域名',
        'CSP nonce 重用或可预测：nonce 值在多个请求中重复使用，攻击者可复用',
        '前端框架的不安全使用：绕过框架的自动转义机制，直接使用危险 API',
        'DOM XSS 的根本原因是客户端 JavaScript 将不可信数据直接传递给危险 sink',
        'Mutation XSS 利用浏览器 HTML 解析器的规范化行为，导致服务端过滤被绕过',
        'JSONP 端点未验证 callback 参数，允许任意 JavaScript 代码执行',
        'postMessage 处理未验证 event.origin，接受来自任意来源的消息',
      ],
      observations: [
        'CSP 是最有效的 XSS 防护机制之一，但配置错误率超过 50%，常见问题包括 unsafe-inline、unsafe-eval、通配符域名',
        'DOM-based XSS 占所有 XSS 漏洞的比例逐年上升，因为现代 Web 应用大量使用客户端 JavaScript',
        'Mutation XSS (mXSS) 是最难防御的 XSS 变体，因为浏览器会重新解析和规范化 HTML，导致服务端过滤失效',
        'React 的 JSX 自动转义大部分 XSS 向量，但 dangerouslySetInnerHTML 和特定属性（如 href="javascript:..."）仍然危险',
        'Vue 的模板自动转义有效，但 v-html 指令和动态组件名（<component :is="...">）可能被滥用',
        'Angular 的 DomSanitizer 提供安全保护，但开发者可能错误地使用 bypassSecurityTrustHtml',
        'SVG 和 MathML 标签中的事件处理器是绕过 HTML 过滤的常用手段',
      ],
      commonMistakes: [
        '只测试 <script> 标签，忽略了 SVG、MathML、iframe、object、embed 等其他可执行脚本的标签',
        '未分析目标页面的 CSP 策略，盲目尝试绕过技术',
        '忽略了 DOM XSS 的可能性，只关注反射型和存储型 XSS',
        '未测试不同的 HTML 上下文（标签内容、属性值、JavaScript 字符串、注释）',
        '误认为前端框架（React、Vue、Angular）完全免疫 XSS，实际上配置错误仍可被利用',
        '未考虑 Mutation XSS 的可能性——浏览器对 HTML 的规范化可能导致过滤失效',
        '忽略了 CSP report-uri/report-to 端点可能被用于 XSS',
      ],
      notes: [
        'PortSwigger 的 XSS Cheat Sheet 是最全面的 XSS payload 参考',
        'CSP Evaluator 可用于分析 CSP 策略的安全性',
        'DOM XSS 测试工具：DOMPurify 测试套件、CodeQL DOM XSS 查询',
        'Mutation XSS 的经典案例：浏览器规范化后可能恢复被过滤的 onerror 属性',
        'XSS 测试的关键是理解注入点所在的 HTML 上下文：HTML 内容、HTML 属性、JavaScript 字符串、URL、CSS',
      ],
    },
    action: {
      checklist: [
        '识别 XSS 注入点所在的 HTML 上下文（HTML 内容、属性值、JS 字符串、注释、URL）',
        '分析目标的 CSP 策略（script-src、unsafe-inline、unsafe-eval、nonce、strict-dynamic）',
        '识别前端框架类型（React、Vue、Angular）及其自动转义机制',
        '测试经典 XSS payload 在不同上下文中的行为',
        '尝试 HTML 标签绕过：SVG、MathML、iframe、object、embed、video、audio、details',
        '尝试事件处理器绕过：onerror、onload、onfocus、onmouseover、ontoggle、onanimationend',
        '尝试编码绕过：HTML 实体编码、URL 编码、Unicode 编码、Base64、十六进制',
        '测试 CSP 绕过：JSONP 端点、nonce 重用、base-uri 修改、unsafe-eval 利用',
        '测试 DOM XSS：分析 JavaScript 源码中的 sink（innerHTML、document.write、location）',
        '测试 Mutation XSS：利用浏览器 HTML 规范化绕过服务端过滤',
        '测试 postMessage/JSONP/WebSocket 等现代 API 中的 XSS 向量',
        '使用 Burp Suite 的 DOM Invader 辅助检测 DOM-based XSS',
      ],
      techniques: [
        'SVG 标签注入：<svg onload=alert(1)>、<svg><script>alert(1)</script></svg>',
        '事件处理器注入：<img src=x onerror=alert(1)>、<details open ontoggle=alert(1)>',
        'JavaScript 协议：href="javascript:alert(1)"、formaction="javascript:alert(1)"',
        'data URI：<iframe src="data:text/html,<script>alert(1)</script>">',
        'CSP unsafe-eval 利用：eval()、Function()、setTimeout(string)、setInterval(string)',
        'CSP nonce 重用：捕获 nonce 值并在后续请求中复用',
        'JSONP CSP 绕过：利用允许的 JSONP 端点执行任意代码',
        'base-uri CSP 绕过：修改 <base href="..."> 改变相对 URL 解析',
        'Mutation XSS：利用浏览器规范化使过滤失效',
        'Angular bypass：使用 $sce.trustAsHtml() 或 [innerHTML] 绑定绕过模板转义',
        'React bypass：dangerouslySetInnerHTML、特定属性注入',
        'Vue bypass：v-html 指令、动态组件 <component :is="...">',
        'DOM XSS sink：document.write()、innerHTML、outerHTML、insertAdjacentHTML、eval()',
        'postMessage XSS：未验证 event.origin 直接处理消息内容',
      ],
      examples: [
        {
          name: 'CSP unsafe-inline 绕过',
          description: '当 CSP 包含 unsafe-inline 时，利用内联事件处理器和 JavaScript 协议执行 XSS',
          content:
            'CSP 策略示例: Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'\n\n' +
            '由于 unsafe-inline 存在，以下 payload 均可执行:\n\n' +
            'Payload 1 - 内联事件处理器:\n' +
            '<img src=x onerror=alert(document.cookie)>\n' +
            '<svg onload=alert(document.cookie)>\n' +
            '<details open ontoggle=alert(document.cookie)>\n\n' +
            'Payload 2 - JavaScript 协议:\n' +
            '<a href="javascript:alert(document.cookie)">click</a>\n' +
            '<iframe src="javascript:alert(document.cookie)">\n\n' +
            'Payload 3 - 内联 <script> 标签:\n' +
            '<script>alert(document.cookie)</script>\n\n' +
            '防御: 移除 unsafe-inline，使用 nonce 或 hash 机制',
          applicableScenarios: ['CSP 配置不当的网站', '遗留系统', '内部管理系统'],
        },
        {
          name: 'DOM-based XSS 利用',
          description: '通过分析客户端 JavaScript 源码，找到 DOM XSS sink 并构造利用 payload',
          content:
            '常见 DOM XSS sink:\n\n' +
            '1. document.write() / document.writeln():\n' +
            '   源码: document.write(location.hash.substring(1));\n' +
            '   Payload: #<img src=x onerror=alert(1)>\n\n' +
            '2. Element.innerHTML / outerHTML:\n' +
            '   源码: element.innerHTML = location.search.split("q=")[1];\n' +
            '   Payload: ?q=<img src=x onerror=alert(1)>\n\n' +
            '3. eval() / Function() / setTimeout(string):\n' +
            '   源码: eval(location.hash.substring(1));\n' +
            '   Payload: #alert(document.cookie)\n\n' +
            '4. postMessage handler:\n' +
            '   源码: window.addEventListener("message", function(e) {\n' +
            '     document.getElementById("output").innerHTML = e.data;\n' +
            '   });\n\n' +
            '防御: 使用 DOMPurify 清理 HTML 输入，避免使用 innerHTML/eval 等危险 sink',
          applicableScenarios: ['单页应用 (SPA)', '大量使用 JavaScript 的现代 Web 应用', '客户端路由应用'],
        },
        {
          name: 'Mutation XSS (mXSS) 利用',
          description: '利用浏览器 HTML 解析器的规范化行为，使服务端 XSS 过滤失效',
          content:
            'Mutation XSS 原理:\n' +
            '1. 攻击者提交包含 XSS 的 HTML 内容\n' +
            '2. 服务端进行过滤（如移除 onerror 属性）\n' +
            '3. 过滤后的内容存储到数据库\n' +
            '4. 浏览器解析 HTML 时进行规范化处理\n' +
            '5. 规范化后，某些被过滤的内容被恢复\n' +
            '6. 恢复后的内容包含可执行的 XSS payload\n\n' +
            '防御: 使用成熟的 HTML 清理库（DOMPurify 最新版），避免自定义过滤逻辑',
          applicableScenarios: ['富文本编辑器', '用户生成内容 (UGC)', '评论区/论坛', '使用自定义 HTML 过滤的应用'],
        },
      ],
    },
    validation: {
      indicators: [
        'XSS payload 在目标页面成功执行（alert 弹窗、console.log 输出、网络请求发出）',
        'CSP 违反报告未包含预期内容，说明 CSP 策略未能阻止 XSS',
        'DOM Invader 检测到 source-to-sink 数据流未被正确过滤',
        'Mutation XSS 中浏览器规范化后的 HTML 与服务端过滤后的 HTML 不一致',
        'postMessage 处理器接受了来自非预期来源的消息并插入 DOM',
      ],
      successSigns: [
        'XSS payload 在目标页面成功执行（弹窗、窃取 cookie、发起任意请求）',
        'CSP 策略被成功绕过，内联脚本或外部脚本被加载执行',
        'DOM XSS sink 接收了未过滤的用户输入',
        'Mutation XSS 中服务端过滤被浏览器规范化绕过',
        '前端框架的安全机制被配置错误绕过',
      ],
      falsePositiveSigns: [
        'alert() 被 CSP 拦截但实际是 CSP 配置问题而非 XSS 过滤问题',
        'payload 在浏览器 console 中可见但实际未执行',
        'innerHTML 赋值后显示为文本而非 HTML（框架自动转义生效）',
        'Mutation XSS 尝试中浏览器规范化未恢复被过滤的内容',
        'postMessage 来源验证生效，消息被拒绝处理',
      ],
    },
    defense: {
      recommendations: [
        '实施严格的 CSP 策略：移除 unsafe-inline 和 unsafe-eval，使用 nonce 或 hash 机制',
        'CSP 使用 script-src \'self\' 配合 nonce 值，每次请求生成随机 nonce',
        '对所有用户输出进行上下文相关的编码：HTML 编码、JavaScript 编码、URL 编码、CSS 编码',
        '使用现代前端框架的内置安全防护（React JSX 自动转义、Vue 模板自动转义、Angular DomSanitizer）',
        '避免使用危险 API：innerHTML、outerHTML、document.write、eval()、Function()',
        '如果必须使用 innerHTML，使用 DOMPurify 清理输入',
        'Angular 中避免使用 bypassSecurityTrustHtml/Url，优先使用内置的自动转义',
        'Vue 中避免使用 v-html，或使用 DOMPurify 管道清理',
        'React 中避免使用 dangerouslySetInnerHTML，或使用 DOMPurify 清理',
        'postMessage 处理器必须验证 event.origin，只接受可信来源的消息',
        'JSONP 端点必须验证 callback 参数，只允许字母数字字符',
      ],
      mitigations: [
        '使用 CSP 报告模式监控潜在的 XSS 尝试',
        '部署 WAF 检测常见 XSS payload 模式',
        '对前端 JavaScript 代码进行安全审计，特别关注 DOM sink 的使用',
        '使用 CodeQL 或 Semgrep 自动扫描 XSS 向量',
        '监控 CSP 违反报告，及时发现 CSP 策略配置问题',
      ],
      references: [
        'https://portswigger.net/web-security/cross-site-scripting',
        'https://portswigger.net/web-security/cross-site-scripting/cheat-sheet',
        'https://owasp.org/www-community/attacks/xss/',
        'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        'https://github.com/cure53/DOMPurify',
      ],
    },
    quality: {
      confidence: 0.89,
      reviewed: false,
      tested: false,
      lastVerified: '2026-06',
    },
    playbooks: ['web-pentest-full'],
    phase: 'exploitation',
    runtime: {
      ...DEFAULT_SKILL_RUNTIME,
      requiresNetwork: true,
      estimatedTokens: 3000,
    },
    enabled: true,
  },
];
