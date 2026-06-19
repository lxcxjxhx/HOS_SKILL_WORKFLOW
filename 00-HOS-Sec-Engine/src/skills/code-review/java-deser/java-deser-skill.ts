/**
 * HOS-Sec-Engine V2 - Java Deserialization Code Audit Skills
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const javaDeserSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'code-review-java-deser-001',
            name: 'Java Deserialization Vulnerability Code Audit',
            category: 'code-review',
            subCategory: 'java-deserialization',
            riskLevel: 'critical',
            confidence: 0.93,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['java', 'deserialization', 'code-audit', 'rce', 'gadget-chain', 'ysoserial'],
        },
        trigger: {
            scenarios: [
                '代码审计中发?Java 反序列化入口',
                '应用使用 ObjectInputStream.readObject()',
                '发现不安全的反序列化库配',
                '需要识?gadget chain 可利用的依赖',
                '发现 RMI/JMX 接口暴露',
            ],
            keywords: [
                'java deserialization',
                '反序列化漏洞',
                'objectinputstream',
                'readobject',
                'gadget chain',
                'ysoserial',
                'commons-collections',
                'java audit',
            ],
            aliases: [
                'Java serialization exploit',
                'Insecure deserialization',
                'Deserialization RCE',
                'Gadget chain',
            ],
            indicators: [
                'ObjectInputStream',
                'readObject()',
                'XMLDecoder',
                'XStream',
                'JSON.deserialize',
                'RMI registry',
            ],
        },
        knowledge: {
            description: 'Java 反序列化漏洞是代码审计中的高危发现。当应用对用户可控数据进行反序列化时，攻击者可构造恶意序列化数据，利用已?gadget chain 执行任意代码。Java 反序列化漏洞的关键在于找到反序列化入口点和可利用?gadget chain',
            symptoms: [
                '代码中使?ObjectInputStream 读取用户输入',
                'HTTP 请求 body 包含序列化对',
                'RMI/JMX 接口可被未授权访',
                '日志中出?ClassNotFoundException 后跟异常行为',
                '应用使用旧版 commons-collections 等已知危险库',
            ],
            rootCauses: [
                'ObjectInputStream.readObject() 未验证输入来',
                '使用了包含危?gadget 的第三方',
                '自定?readObject() 方法执行危险操作',
                'XML/JSON 反序列化库配置不安全',
                'RMI 注册表未绑定安全策略',
            ],
            observations: [
                'commons-collections 3.2.1 以下版本包含可利用的 gadget',
                'Spring Framework 某些版本存在反序列化 gadget',
                'WebLogic、JBoss 等中间件历史漏洞多与反序列化相关',
                'Modern 库如 Jackson 也需在安全配置下使用',
            ],
            commonMistakes: [
                '只检?ObjectInputStream 忽略其他反序列化入口',
                '未检查第三方库版本是否存在已?gadget',
                '忽略 XML 反序列化 (XMLDecoder, XStream)',
                '未考虑 RMI/JMX 接口的反序列化风?',
            ],
            notes: [
                'Java 反序列化审计需要结合依赖版本分',
                'ysoserial 是常用的 gadget chain 生成工具',
                '修复方案包括使用 SerialKiller 或白名单过滤',
            ],
        },
        action: {
            checklist: [
                '搜索 ObjectInputStream ?readObject() 调用',
                '检查反序列化数据来源是否可',
                '分析项目依赖中是否存在危?gadget ',
                '检?XML/JSON 反序列化库配',
                '检?RMI/JMX 接口安全',
                '使用工具扫描已知反序列化漏洞依赖',
                '验证是否实施了反序列化过?',
            ],
            techniques: [
                '静态代码搜索反序列化入口点',
                '依赖版本分析 (Maven/Gradle)',
                'Gadget chain 匹配分析',
                'ysoserial 生成 PoC',
                '动态调试验证反序列化流',
                '使用 SerialKiller 进行防护验证',
            ],
            examples: [
                {
                    name: 'ObjectInputStream 反序列化漏洞',
                    description: '经典的不安全反序列化代码示例',
                    content: '// 危险代码示例\n' +
                        'public Object deserialize(byte[] data) {\n' +
                        '    ByteArrayInputStream bis = new ByteArrayInputStream(data);\n' +
                        '    ObjectInputStream ois = new ObjectInputStream(bis);\n' +
                        '    return ois.readObject(); // 直接反序列化用户数据\n' +
                        '}\n' +
                        '\n' +
                        '// 修复方案：使?ObjectInputFilter\n' +
                        'public Object safeDeserialize(byte[] data) {\n' +
                        '    ObjectInputFilter filter = ObjectInputFilter.allowFilter(\n' +
                        '        clazz -> allowedClasses.contains(clazz.getName()),\n' +
                        '        ObjectInputFilter.Status.REJECTED\n' +
                        '    );\n' +
                        '    ois.setObjectInputFilter(filter);\n' +
                        '    return ois.readObject();\n' +
                        '}',
                },
                {
                    name: '依赖版本 Gadget 分析',
                    description: '通过依赖版本判断可利用的 gadget chain',
                    content: '# 使用 ysoserial 检查可?gadget\n' +
                        'java -jar ysoserial.jar CommonsCollections5 "calc"\n' +
                        '\n' +
                        '# 常见危险依赖版本:\n' +
                        '# - commons-collections <= 3.2.1\n' +
                        '# - commons-beanutils <= 1.9.2\n' +
                        '# - spring-aop <= 4.3.18\n' +
                        '# - groovy-all (所有版?',
                },
            ],
        },
        validation: {
            indicators: [
                '成功利用 gadget chain 执行命令',
                'ysoserial payload 触发异常',
                '网络回连成功',
                '应用日志中出?gadget chain 执行痕迹',
            ],
            successSigns: [
                '反序列化入口点可触发 gadget 执行',
                'Payload 导致预期命令执行',
                '应用崩溃或返回异常响?',
            ],
            falsePositiveSigns: [
                '反序列化失败但非 gadget chain 原因',
                '依赖版本存在?gadget 不可利用',
            ],
        },
        defense: {
            recommendations: [
                '避免反序列化不可信数',
                '使用 ObjectInputFilter 限制可反序列化的',
                '升级到无危险 gadget 的依赖版',
                '使用替代方案?JSON 替代 Java 序列',
                '实施网络层隔离限?RMI/JMX 访问',
            ],
            mitigations: [
                '部署 RASP 检测反序列化攻',
                '使用 WAF 规则拦截 ysoserial payload',
                '定期更新第三方依?',
            ],
            references: [
                'https://owasp.org/www-project-top-ten/2017/A8_2017-Insecure_Deserialization',
                'https://github.com/frohoff/ysoserial',
            ],
        },
        quality: {
            confidence: 0.93,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
