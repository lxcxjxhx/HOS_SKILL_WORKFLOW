/**
 * AR-006: Deserialization Check Rule
 * 
 * 功能: 检查反序列化操作,识别不安全的反序列化漏洞
 * 焦点: 不是告诉AI"什么是反序列化漏洞"
 *      而是定义AI"如何检查反序列化"的6步流程
 * 
 * 检查流程:
 *  1. 反序列化入口识别
 *  2. 数据来源追踪
 *  3. 类型约束检查
 *  4. Gadget链分析
 *  5. 替代方案检查
 *  6. 运行时防护检测
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const DeserializationCheckRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-006',
  name: 'Deserialization Check',
  description: '检查反序列化操作,识别不安全的反序列化导致的远程代码执行风险',
  detail: `
本规则的目的是系统化地检查代码中的反序列化操作是否存在安全隐患。

核心理念:
- 不是问"这是反序列化漏洞吗"
- 而是问"反序列化的数据来源是否可信、类型是否受限、是否有防护"

关键问题序列:
1. 代码中有哪些反序列化操作?
2. 被反序列化的数据来自何处?
3. 反序列化是否有类型约束(allowlist)?
4. 依赖库中是否存在已知Gadget链?
5. 是否可以使用更安全的替代方案(JSON)?
6. 是否有运行时反序列化防护?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      'Java反序列化: ObjectInputStream.readObject() / readUnshared()',
      'Python反序列化: pickle.loads() / yaml.load() / marshal.loads()',
      'Node.js反序列化: unserialize() / node-serialize / serialize-javascript',
      'PHP反序列化: unserialize() / __wakeup() / __destruct()',
      '.NET反序列化: BinaryFormatter.Deserialize() / NetDataContractSerializer',
      'YAML加载: yaml.load() (无Loader参数)',
      'XML反序列化: XMLDecoder / XStream'
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
      'Jackson',
      'XStream',
      'Flask',
      'Django',
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
      name: '反序列化入口识别',
      condition: '识别代码中所有反序列化操作及其调用的库',
      questions: [
        '代码中有哪些反序列化调用?',
        '使用了什么反序列化库或API?',
        '这些调用是在什么场景下触发的?',
        '是否有自定义的反序列化逻辑?',
        '是否使用了隐式反序列化(框架自动处理)?'
      ],
      failureIndicators: [
        'ObjectInputStream.readObject() 直接调用',
        'pickle.loads(user_data) 无安全Loader',
        'yaml.load(data) 无SafeLoader',
        'unserialize($_COOKIE["data"]) 用户可控输入',
        'BinaryFormatter.Deserialize(stream)',
        'JSON.parse()后动态eval/Function执行',
        '框架自动反序列化: @RequestBody 无类型限制'
      ],
      successIndicators: [
        '使用JSON.parse() / json.loads()等安全格式',
        'YAML使用yaml.safe_load()',
        '反序列化有明确的类型白名单',
        '自定义反序列化有安全控制'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '数据来源追踪',
      condition: '追踪被反序列化数据的来源是否可信',
      questions: [
        '被反序列化的数据来自哪里?',
        '数据是否直接来自用户输入(HTTP请求、Cookie、Header)?',
        '数据是否来自外部系统(消息队列、API)?',
        '数据在反序列化前是否经过验证或签名?',
        '数据是否存储在可被篡改的位置(数据库、缓存)?'
      ],
      failureIndicators: [
        '数据来自HTTP请求体/参数',
        '数据来自Cookie: unserialize($_COOKIE["session"])',
        '数据来自Redis/缓存未签名',
        '数据来自消息队列未验证',
        '数据来自文件上传',
        '数据来自URL参数(Base64编码)'
      ],
      successIndicators: [
        '数据来自内部系统且经过签名验证',
        '数据有HMAC签名且验证通过',
        '数据来自安全的只读存储',
        '数据在反序列化前经过完整性检查'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '类型约束检查',
      condition: '检查反序列化是否限制了可实例化的类型',
      questions: [
        '反序列化是否限制了允许的类型?',
        '使用了什么类型的过滤机制(白名单/黑名单)?',
        '黑名单是否完整(已知Gadget类)?',
        '白名单是否足够严格?',
        '是否有自定义ObjectInputFilter/LookAheadObjectInputStream?'
      ],
      failureIndicators: [
        '无类型过滤: ObjectInputStream 直接读取',
        '黑名单过滤(容易遗漏新Gadget)',
        '白名单过于宽松: 允许java.util.*',
        '自定义反序列化Hook未限制类型: resolveClass()',
        'PHP unserialize() 无allowed_classes参数'
      ],
      successIndicators: [
        '严格白名单: 仅允许特定业务类',
        'Java ObjectInputFilter 配置严格',
        'Python pickle with Unpickler subclass 限制',
        'PHP unserialize($data, ["allowed_classes" => [MyClass::class]])',
        '.NET SerializationBinder 类型过滤'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: 'Gadget链分析',
      condition: '分析项目依赖中是否存在可利用的反序列化Gadget链',
      questions: [
        '项目使用了哪些可能被利用为Gadget的库?',
        '依赖库版本是否有已知反序列化漏洞?',
        '是否存在CommonsCollections、SpringAOP等常见Gadget?',
        '是否有反序列化后自动触发的方法(如readObject、__wakeup)?',
        '类路径中是否有危险的类组合?'
      ],
      failureIndicators: [
        'commons-collections:3.x 在classpath中',
        'Spring AOP 旧版本',
        '自定义类有危险readObject实现',
        '依赖中有已知的反序列化CVE',
        'PHP类有__wakeup/__destruct危险操作'
      ],
      successIndicators: [
        '依赖库均为最新版本',
        '无已知Gadget链依赖',
        '依赖扫描无CVE告警',
        '自定义类无自动触发的危险方法'
      ],
      criticality: 'important'
    },

    {
      order: 5,
      name: '替代方案检查',
      condition: '检查是否可以使用更安全的替代方案替换原生反序列化',
      questions: [
        '为什么需要使用原生反序列化?',
        '是否可以使用JSON等结构化数据格式替代?',
        '是否可以使用Protocol Buffers/MessagePack等安全序列化?',
        '是否可以将反序列化限制在受控范围内?',
        '数据格式是否可以设计为无执行能力?'
      ],
      failureIndicators: [
        '使用原生序列化仅因为方便',
        '可以使用JSON但选择了序列化对象',
        '跨语言传输使用原生序列化',
        '持久化存储使用序列化对象'
      ],
      successIndicators: [
        '使用JSON/XML等数据交换格式',
        '使用Protocol Buffers/Avro等安全格式',
        '仅在受控内部环境使用原生序列化',
        '序列化数据有签名和完整性校验'
      ],
      criticality: 'important'
    },

    {
      order: 6,
      name: '运行时防护检测',
      condition: '检查是否有运行时反序列化安全防护措施',
      questions: [
        '是否部署了反序列化运行时防护?',
        '是否有RASP(Runetime Application Self-Protection)?',
        '是否有异常行为检测(如反序列化后执行系统命令)?',
        '是否有安全日志记录反序列化操作?',
        '是否有进程隔离限制反序列化影响?'
      ],
      failureIndicators: [
        '无反序列化运行时防护',
        '无异常行为监控',
        '反序列化失败无告警',
        '反序列化在关键进程主线程执行'
      ],
      successIndicators: [
        'RASP监控反序列化行为',
        '异常行为告警和自动阻断',
        '反序列化在沙箱/受限容器执行',
        '完整的反序列化操作审计日志'
      ],
      criticality: 'nice-to-have'
    }
  ],

  // ============================================================================
  // 证据要求 - 每个发现都必须提供
  // ============================================================================

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: '反序列化操作代码位置和上下文',
      example: `
不安全的反序列化:
  文件: src/main/java/com/app/SessionManager.java
  行号: 35
  代码:
    public Object deserializeSession(byte[] data) {
      ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
      return ois.readObject();  // <- 无类型过滤,直接反序列化
    }

  文件: app.py
  行号: 20
  代码:
    @app.route('/load')
    def load_data():
        data = base64.b64decode(request.args.get('data'))
        obj = pickle.loads(data)  // <- 用户可控数据直接反序列化
      `,
      collection_guidance: '标注反序列化调用的文件路径和行号，展示数据来源和处理流程，高亮缺失的安全控制，包括自定义反序列化逻辑的完整代码'
    },

    {
      type: EvidenceType.Dependency,
      required: true,
      description: '反序列化相关依赖库及其版本',
      example: `
依赖检查:
  commons-collections:3.2.1  -> 已知Gadget链 CVE-2015-6420
  commons-beanutils:1.9.2    -> 已知Gadget链
  spring-aop:4.3.0           -> 已知Gadget链
      `,
      collection_guidance: '检查依赖中是否存在已知Gadget库，检查依赖版本是否有反序列化CVE，运行依赖安全扫描工具'
    },

    {
      type: EvidenceType.DataFlow,
      required: false,
      description: '从数据输入到反序列化的完整流程',
      example: `
数据流:
  1. 用户输入: GET /load?data=<base64>
  2. Base64解码: base64.b64decode(request.args['data'])
  3. 直接反序列化: pickle.loads(decoded_data)
  4. 对象使用: obj.method()  <- 可能触发恶意代码
  
  问题: 数据全程无验证、无签名、无类型限制
      `,
      collection_guidance: '追踪数据从入口到反序列化的完整路径，标记路径中的每个处理步骤，记录是否有验证或签名'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '使用安全的数据格式替代原生反序列化',
      code: `
// Java - 使用JSON替代
ObjectMapper mapper = new ObjectMapper();
MyDTO obj = mapper.readValue(jsonString, MyDTO.class);

// Python - 使用JSON替代
import json
obj = json.loads(data)  // 安全,不会执行代码

// Python - YAML安全加载
import yaml
obj = yaml.safe_load(data)  // 使用SafeLoader

// PHP - 使用JSON替代
$obj = json_decode($data, true);  // 返回数组而非对象
      `,
      description: '优先使用JSON、Protocol Buffers等安全数据格式替代原生对象序列化。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.High,
      action: '实施严格的类型白名单过滤',
      code: `
// Java - ObjectInputFilter
ObjectInputStream ois = new ObjectInputStream(inputStream);
ois.setObjectInputFilter(ObjectInputFilter.Config.createFilter(
  "java.base/java.util.*;java.base/java.lang.*;com.app.model.*;!*")
);
return ois.readObject();

// Python - 安全的Unpickler
import pickle
import io

class RestrictedUnpickler(pickle.Unpickler):
    SAFE_MODULES = {"math", "collections"}
    
    def find_class(self, module, name):
        if module in self.SAFE_MODULES:
            return super().find_class(module, name)
        raise pickle.UnpicklingError(f"Disallowed: {module}.{name}")

obj = RestrictedUnpickler(io.BytesIO(data)).load()

// PHP - allowed_classes
$obj = unserialize($data, ["allowed_classes" => [MySafeClass::class]]);
      `,
      description: '通过类型白名单严格限制反序列化允许实例化的类。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.Medium,
      action: '数据签名和完整性验证',
      code: `
// 在序列化时添加HMAC签名
const crypto = require('crypto');

function serializeWithSign(obj, secret) {
  const data = JSON.stringify(obj);
  const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return { data, signature: hmac };
}

function deserializeWithSign(signed, secret) {
  const expected = crypto.createHmac('sha256', secret).update(signed.data).digest('hex');
  if (expected !== signed.signature) {
    throw new Error('Data tampered');
  }
  return JSON.parse(signed.data);
}
      `,
      description: '为序列化数据添加HMAC签名,在反序列化前验证数据完整性,防止篡改。',
      difficulty: 'Easy'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-502'],  // Deserialization of Untrusted Data
  owasp_categories: [
    'A08:2021 - Software and Data Integrity Failures',
    'A05:2017 - Broken Access Control'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default DeserializationCheckRule;
