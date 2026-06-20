# Android APK Reverse Engineering and Security Analysis

**ID**: `mobile-android-apk-001` | **分类**: mobile | **风险等级**: medium

Android APK 安全分析技术用于评估移动应用的安全性。通过反编译、动态调试、Hook 等技术，可以发现应用中的硬编码密钥、不安全的通信、组件暴露等问题。移动应用安全测试需要结合静态分析和动态分析

## 触发场景

- 需要对 Android APK 进行安全审计
- 发现可疑应用需要逆向分析
- API 接口加密需要提取密
- 应用存在数据泄露风险需要验
- 需要绕过应用的安全检测机?

## 操作检查清单

1. 解压 APK 文件分析目录结构
2. 反编?classes.dex 获取 Java 代码
3. 分析 AndroidManifest.xml 组件配置
4. 搜索硬编码密钥和敏感信息
5. 检查网络通信安全
6. 检查数据存储安全
7. 使用 Frida 进行动?Hook 测试
8. 检?Root 检测和模拟器检?

## 技术手段

- APK 反编?(jadx, apktool)
- Smali 代码分析
- Frida 动?Hook
- SSL Pinning Bypass
- Root Detection Bypass
- Intent 劫持测试
- Deep Link 安全测试
- Native 库分?

## 症状

- APK 文件中包含硬编码 API 密钥
- 应用使用不安全的 HTTP 通信
- Android 组件 (Activity, Service, Receiver) 未设置导出限
- 应用未启用代码混淆或混淆强度不足
- 敏感数据存储在明文中

## 根因分析

- 开发者将密钥硬编码在代码或资源文件中
- 未正确配?AndroidManifest.xml 中的 exported 属
- 未使?HTTPS 或证书验证不完整
- 缺少代码混淆或仅使用 ProGuard 基础规则
- 未对敏感数据进行加密存储

## 示例

### APK 反编译分

使用 jadx 反编?APK 获取 Java 源码

```
# 使用 jadx 反编译
jadx -d output_dir target.apk
# 使用 apktool 反编译
apktool d target.apk -o output_dir
# 搜索硬编码密钥
grep -r "API_KEY|secret|password|token" output_dir/
```

### Frida SSL Pinning Bypass

使用 Frida 脚本绕过 SSL Pinning 检

```
# Frida SSL Pinning Bypass 脚本
frida -U -f com.target.app \
  --no-pause \
  -l ssl_pinning_bypass.js
# ssl_pinning_bypass.js 内容:
Java.perform(function() {
  var TrustManager = Java.registerClass({
    name: "custom.TrustManager",
    implements: [X509TrustManager],
    methods: { checkClientTrusted: function() {}, checkServerTrusted: function() {} }
  });
  // Trust all certificates
});
```

## 成功标志

- 反编译代码可读性良
- Frida Hook 成功执行
- SSL Pinning 被绕过可拦截 HTTPS 流量
- Root 检测被绕过应用正常运行

## 防御建议

- 使用代码混淆 (ProGuard/R8) 增加逆向难度
- 不要在代码中硬编码密
- 实施 SSL Pinning
- 正确配置 AndroidManifest.xml ?exported 属
- 使用 Android Keystore 存储敏感数据
- 实施 Root 和模拟器检
- 使用 Integrity API 验证应用完整?
