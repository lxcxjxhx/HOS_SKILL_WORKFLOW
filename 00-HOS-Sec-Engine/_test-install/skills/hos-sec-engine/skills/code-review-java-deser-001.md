# Java Deserialization Vulnerability Code Audit

**ID**: `code-review-java-deser-001` | **分类**: code-review | **风险等级**: critical

Java 反序列化漏洞是代码审计中的高危发现。当应用对用户可控数据进行反序列化时，攻击者可构造恶意序列化数据，利用已?gadget chain 执行任意代码。Java 反序列化漏洞的关键在于找到反序列化入口点和可利用?gadget chain

## 触发场景

- 代码审计中发?Java 反序列化入口
- 应用使用 ObjectInputStream.readObject()
- 发现不安全的反序列化库配
- 需要识?gadget chain 可利用的依赖
- 发现 RMI/JMX 接口暴露

## 操作检查清单

1. 搜索 ObjectInputStream ?readObject() 调用
2. 检查反序列化数据来源是否可
3. 分析项目依赖中是否存在危?gadget 
4. 检?XML/JSON 反序列化库配
5. 检?RMI/JMX 接口安全
6. 使用工具扫描已知反序列化漏洞依赖
7. 验证是否实施了反序列化过?

## 技术手段

- 静态代码搜索反序列化入口点
- 依赖版本分析 (Maven/Gradle)
- Gadget chain 匹配分析
- ysoserial 生成 PoC
- 动态调试验证反序列化流
- 使用 SerialKiller 进行防护验证

## 症状

- 代码中使?ObjectInputStream 读取用户输入
- HTTP 请求 body 包含序列化对
- RMI/JMX 接口可被未授权访
- 日志中出?ClassNotFoundException 后跟异常行为
- 应用使用旧版 commons-collections 等已知危险库

## 根因分析

- ObjectInputStream.readObject() 未验证输入来
- 使用了包含危?gadget 的第三方
- 自定?readObject() 方法执行危险操作
- XML/JSON 反序列化库配置不安全
- RMI 注册表未绑定安全策略

## 示例

### ObjectInputStream 反序列化漏洞

经典的不安全反序列化代码示例

```
// 危险代码示例
public Object deserialize(byte[] data) {
    ByteArrayInputStream bis = new ByteArrayInputStream(data);
    ObjectInputStream ois = new ObjectInputStream(bis);
    return ois.readObject(); // 直接反序列化用户数据
}

// 修复方案：使?ObjectInputFilter
public Object safeDeserialize(byte[] data) {
    ObjectInputFilter filter = ObjectInputFilter.allowFilter(
        clazz -> allowedClasses.contains(clazz.getName()),
        ObjectInputFilter.Status.REJECTED
    );
    ois.setObjectInputFilter(filter);
    return ois.readObject();
}
```

### 依赖版本 Gadget 分析

通过依赖版本判断可利用的 gadget chain

```
# 使用 ysoserial 检查可?gadget
java -jar ysoserial.jar CommonsCollections5 "calc"

# 常见危险依赖版本:
# - commons-collections <= 3.2.1
# - commons-beanutils <= 1.9.2
# - spring-aop <= 4.3.18
# - groovy-all (所有版?
```

## 成功标志

- 反序列化入口点可触发 gadget 执行
- Payload 导致预期命令执行
- 应用崩溃或返回异常响?

## 防御建议

- 避免反序列化不可信数
- 使用 ObjectInputFilter 限制可反序列化的
- 升级到无危险 gadget 的依赖版
- 使用替代方案?JSON 替代 Java 序列
- 实施网络层隔离限?RMI/JMX 访问
