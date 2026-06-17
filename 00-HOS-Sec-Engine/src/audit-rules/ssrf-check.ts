/**
 * AR-008: SSRF (Server-Side Request Forgery) Check Rule
 * 
 * 功能: 检查服务端发起的HTTP/网络请求,识别SSRF注入风险
 * 焦点: 不是告诉AI"什么是SSRF"
 *      而是定义AI"如何检查SSRF"的6步流程
 * 
 * 检查流程:
 *  1. 网络请求入口识别
 *  2. URL来源追踪
 *  3. URL验证机制检查
 *  4. 重定向处理分析
 *  5. 协议与端口限制
 *  6. 内网资源保护
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const SSRFCheckRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-008',
  name: 'SSRF Check',
  description: '检查服务端网络请求逻辑,识别服务端请求伪造(SSRF)风险',
  detail: `
本规则的目的是系统化地检查代码中服务端发起的网络请求是否存在SSRF风险。

核心理念:
- 不是问"这段代码有SSRF吗"
- 而是问"用户能否控制服务端请求的目标地址、协议、端口"

关键问题序列:
1. 代码中有哪些服务端发起网络请求的地方?
2. 请求的目标URL/地址来自何处?
3. URL是否经过验证(域名白名单、IP范围)?
4. 重定向是否被正确处理?
5. 协议和端口是否有限制?
6. 是否能访问内网资源(127.0.0.1、169.254.169.254)?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'HTTP请求: fetch() / axios() / http.get() / requests.get()',
      'URL参数构造: new URL(userInput) / url.Parse()',
      'Webhook调用: webhook.send(url) / callback(url)',
      '图片/文件获取: Image.fromURL() / download(url)',
      'API代理: proxy.pass(url) / forward(url)',
      '邮件发送: smtp.connect(host)',
      'DNS查询: dns.resolve(host) / net.LookupHost()'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go
    ],
    frameworks: [
      'Spring',
      'Express',
      'Django',
      'Flask',
      'FastAPI',
      'Laravel',
      'ASP.NET'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '网络请求入口识别',
      condition: '识别代码中所有服务端发起的网络请求操作',
      questions: [
        '代码中有哪些地方服务端会发起网络请求?',
        '请求的目标地址是硬编码还是动态的?',
        '是否有Webhook、回调、URL预览功能?',
        '是否有文件/图片下载功能?',
        '是否有API代理或网关功能?'
      ],
      failureIndicators: [
        '动态URL: fetch(userProvidedUrl)',
        'Webhook端点: webhook.send(req.body.url)',
        'URL预览: screenshot(urlParameter)',
        '文件下载: download(req.query.fileUrl)',
        'API代理: proxy(req.query.target)',
        '图片加载: <img src={req.query.imgUrl}>'
      ],
      successIndicators: [
        '请求目标全部为硬编码',
        '请求目标来自安全配置',
        '网络请求在受控范围内执行'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: 'URL来源追踪',
      condition: '追踪网络请求目标URL的来源是否可控',
      questions: [
        'URL参数的原始来源是什么?',
        'URL是否来自用户输入(HTTP参数、请求体)?',
        'URL是否来自数据库存储(可能被污染)?',
        'URL是否来自外部API响应?',
        'URL在请求前经历了哪些变换?'
      ],
      failureIndicators: [
        'URL直接来自用户输入: req.query.url',
        'URL来自POST请求体: req.body.webhookUrl',
        'URL来自文件上传的内容',
        'URL来自缓存/Radis(可能被注入)',
        'URL经过编码但仍可控制: base64(userInput)'
      ],
      successIndicators: [
        'URL来自白名单配置',
        'URL来自管理员预设',
        'URL通过业务逻辑生成(非用户直接控制)'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: 'URL验证机制检查',
      condition: '检查目标URL是否有安全验证机制',
      questions: [
        'URL是否经过域名白名单验证?',
        '是否验证了IP地址范围(排除内网)?',
        '是否解析了域名并验证了IP?',
        '是否考虑了DNS重绑定攻击?',
        '是否验证了URL的格式和结构?'
      ],
      failureIndicators: [
        '仅验证URL格式,不验证目标',
        '黑名单过滤(容易绕过: 127.0.0.1 -> 0177.00.00.01)',
        '仅验证域名不验证解析IP',
        'DNS重绑定: 验证时解析一次,请求时再次解析可能不同',
        '不处理IPv6地址: ::1',
        '不处理URL编码绕过: %31%32%37.%30%2E%30%2E%31'
      ],
      successIndicators: [
        '严格域名白名单: only allow *.trusted.com',
        '解析域名后验证IP不在内网范围',
        'DNS重绑定防护: 请求前再次解析验证',
        'URL规范化后验证',
        '使用安全URL解析库'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '重定向处理分析',
      condition: '检查HTTP重定向是否可能被利用绕过验证',
      questions: [
        'HTTP请求是否跟随重定向?',
        '重定向后的URL是否重新验证?',
        '最大重定向次数是否有限制?',
        '重定向是否可能跳转到内网地址?',
        '是否区分了3xx重定向类型?'
      ],
      failureIndicators: [
        '自动跟随所有重定向',
        '重定向后不重新验证目标地址',
        '无重定向次数限制',
        '攻击者控制的服务器返回302指向内网',
        'Meta标签重定向未被处理: <meta http-equiv="refresh">'
      ],
      successIndicators: [
        '重定向后重新验证目标URL',
        '限制最大重定向次数(如3次)',
        '禁止跨域重定向',
        '重定向URL同样通过白名单检查'
      ],
      criticality: 'important'
    },

    {
      order: 5,
      name: '协议与端口限制',
      condition: '检查网络请求的协议和端口是否有限制',
      questions: [
        '是否限制了允许的协议(http/https)?',
        '是否阻止了file://、gopher://、dict://等协议?',
        '是否有端口限制?',
        '是否阻止了对常见内网服务端口的访问?',
        '是否限制了请求超时时间?'
      ],
      failureIndicators: [
        '允许任意协议: file:///etc/passwd',
        '允许gopher://、dict://协议',
        '无端口限制: 可访问22、3306、6379等',
        '允许ftp://协议',
        '超长超时时间(可用于延迟攻击)'
      ],
      successIndicators: [
        '仅允许http://和https://',
        '显式拒绝file://、gopher://、dict://等',
        '仅允许80、443端口',
        '合理的超时设置(如5秒)'
      ],
      criticality: 'must-have'
    },

    {
      order: 6,
      name: '内网资源保护',
      condition: '检查是否能通过请求访问内网敏感资源',
      questions: [
        '是否能访问本地回环地址(127.0.0.1、localhost、::1)?',
        '是否能访问云元数据服务(169.254.169.254)?',
        '是否能访问内网IP段(10.x、172.16-31.x、192.168.x)?',
        '是否能通过DNS解析绕过IP限制?',
        '请求响应是否泄露了内网信息?'
      ],
      failureIndicators: [
        '可访问127.0.0.1/localhost',
        '可访问AWS/Azure/GCP元数据服务',
        '可访问内网IP段',
        '响应中包含内网服务信息',
        '错误消息泄露内网拓扑',
        'Docker容器内可访问宿主机网络'
      ],
      successIndicators: [
        '内网IP段被完全阻止',
        '云元数据服务不可达',
        '请求在网络层隔离',
        '错误消息不泄露内部信息',
        '网络请求使用独立网络命名空间'
      ],
      criticality: 'important'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '网络请求代码位置和URL处理逻辑',
      example: `
无验证的SSRF:
  文件: src/services/webhookService.js
  行号: 15
  代码:
    async function sendWebhook(url, payload) {
      const response = await fetch(url, {  // <- url直接来自用户输入
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return response.json();
    }

  文件: src/routes/webhook.js
  行号: 8
  代码:
    app.post('/api/webhook', async (req, res) => {
      const result = await sendWebhook(req.body.url, req.body.data);
      // <- 用户直接控制请求目标
    });
      `,
      collection_guidance: `标注网络请求调用的文件路径和行号，展示URL来源和处理流程，高亮缺失的验证逻辑，包括错误处理代码。`
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: '网络请求相关配置,如代理设置、超时配置、允许的域名列表',
      example: `
配置检查:
  文件: src/config/network.js
  检查内容:
    - 是否有允许的域名白名单
    - 是否有代理配置
    - 超时设置
    - 最大重定向次数
      `,
      collection_guidance: `检查网络请求配置，检查代理和防火墙设置，检查DNS配置。`
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: '从用户输入到网络请求的完整数据流',
      example: `
数据流:
  1. 输入: POST /api/webhook { "url": "http://169.254.169.254/latest/meta-data/" }
  2. 传递: sendWebhook(req.body.url, data)
  3. 请求: fetch(url)  <- 无验证直接请求
  4. 响应: 返回云元数据
  
  问题: URL全程无验证,可访问任意地址
      `,
      collection_guidance: `追踪URL从入口到请求的完整路径，标记路径中的每个验证点，记录URL变换过程。`
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '实施域名白名单验证',
      code: `
// Node.js - 域名白名单
const ALLOWED_DOMAINS = ['api.trusted-service.com', 'hooks.slack.com'];

function validateUrl(urlString) {
  const url = new URL(urlString);
  // 仅允许http/https
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid protocol');
  }
  // 域名白名单
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    throw new Error('Domain not allowed');
  }
  return url.toString();
}

// 使用
const safeUrl = validateUrl(req.body.url);
const response = await fetch(safeUrl);

// Java - URL验证 + IP范围检查
public void validateUrl(String urlString) throws IOException {
  URL url = new URL(urlString);
  
  // 仅允许http/https
  if (!url.getProtocol().matches("https?")) {
    throw new SecurityException("Invalid protocol");
  }
  
  // 解析IP并检查
  InetAddress addr = InetAddress.getByName(url.getHost());
  if (addr.isSiteLocalAddress() || addr.isLoopbackAddress()) {
    throw new SecurityException("Internal addresses not allowed");
  }
}
      `,
      description: '使用严格的域名白名单控制可请求的目标,从根本上防止SSRF。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '实施IP范围验证和重定向保护',
      code: `
// Node.js - 完整SSRF防护
const net = require('net');
const http = require('http');

function isPrivateIP(ip) {
  // 检查内网IP范围
  const parts = ip.split('.').map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  if (ip === '0.0.0.0' || ip === '::1' || ip.startsWith('169.254.')) return true;
  return false;
}

async function safeFetch(url, maxRedirects = 3) {
  if (maxRedirects <= 0) throw new Error('Too many redirects');
  
  const parsed = new URL(url);
  
  // 验证协议
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  // 解析DNS并验证IP
  const { address } = await dns.lookup(parsed.hostname);
  if (isPrivateIP(address)) {
    throw new Error('Access to internal addresses is blocked');
  }
  
  const response = await fetch(url, { redirect: 'manual' });
  
  // 处理重定向
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    return safeFetch(location, maxRedirects - 1);
  }
  
  return response;
}
      `,
      description: '在发起请求前解析DNS并验证IP地址,同时处理重定向后的重新验证。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.Medium,
      action: '网络层隔离',
      code: `
// 使用专用网络命名空间或容器
// Docker示例: 限制容器网络访问
docker run --network=ssrf-restricted \\
  --dns=8.8.8.8 \\
  my-app

// 网络策略阻止内网访问
# iptables规则
iptables -A OUTPUT -d 10.0.0.0/8 -j DROP
iptables -A OUTPUT -d 172.16.0.0/12 -j DROP
iptables -A OUTPUT -d 192.168.0.0/16 -j DROP
iptables -A OUTPUT -d 169.254.0.0/16 -j DROP
iptables -A OUTPUT -d 127.0.0.0/8 -j DROP
      `,
      description: '在网络层限制出站连接,即使应用层验证被绕过,也无法访问内网资源。',
      difficulty: 'Hard'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-918'],  // Server-Side Request Forgery (SSRF)
  owasp_categories: [
    'A10:2021 - Server-Side Request Forgery',
    'A07:2021 - Identification and Authentication Failures'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default SSRFCheckRule;
