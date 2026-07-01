/**
 * HOS-Sec-Engine V2 - Android APK Security Skills
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const androidApkSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'mobile-android-apk-001',
            name: 'Android APK Reverse Engineering and Security Analysis',
            category: 'mobile',
            subCategory: 'android-apk',
            riskLevel: 'medium',
            confidence: 0.91,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['android', 'apk', 'reverse-engineering', 'mobile-security', 'deobfuscation', 'frida'],
        },
        trigger: {
            scenarios: [
                '需要对 Android APK 进行安全审计',
                '发现可疑应用需要逆向分析',
                'API 接口加密需要提取密',
                '应用存在数据泄露风险需要验',
                '需要绕过应用的安全检测机制',
            ],
            keywords: [
                'apk reverse',
                'android security',
                'apk analysis',
                'frida',
                'dex decompile',
                'smali',
                'apk 逆向',
                'mobile security test',
            ],
            aliases: [
                'apk decompile',
                'dex analysis',
                'android pentest',
                'mobile app security',
            ],
            indicators: [
                'classes.dex',
                'AndroidManifest.xml',
                'lib/armeabi',
                'assets/',
            ],
        },
        knowledge: {
            description: 'Android APK 安全分析技术用于评估移动应用的安全性。通过反编译、动态调试、Hook 等技术，可以发现应用中的硬编码密钥、不安全的通信、组件暴露等问题。移动应用安全测试需要结合静态分析和动态分析',
            symptoms: [
                'APK 文件中包含硬编码 API 密钥',
                '应用使用不安全的 HTTP 通信',
                'Android 组件 (Activity, Service, Receiver) 未设置导出限',
                '应用未启用代码混淆或混淆强度不足',
                '敏感数据存储在明文中',
            ],
            rootCauses: [
                '开发者将密钥硬编码在代码或资源文件中',
                '未正确配置 AndroidManifest.xml 中的 exported 属性',
                '未使用 HTTPS 或证书验证不完整',
                '缺少代码混淆或仅使用 ProGuard 基础规则',
                '未对敏感数据进行加密存储',
            ],
            observations: [
                '大多数 APK 可以通过工具轻松反编',
                '代码混淆不能阻止逆向，只增加分析难度',
                'Frida 是最强大的 Android 动态 Hook 框架',
                '许多应用忽略 SSL Pinning 或实现不完整',
            ],
            commonMistakes: [
                '仅做静态分析忽略动态行',
                '忽略 Native 库(so 文件) 的安全分',
                '未检查 Intent 劫持风险',
                '忽略 Deep Link 安全配置',
            ],
            notes: [
                'APK 分析需要结合静态和动态方',
                '注意应用的 Anti-Debug ?Anti-Hook 机制',
                'Android 12+ 引入了新的安全特性',
            ],
        },
        action: {
            checklist: [
                '解压 APK 文件分析目录结构',
                '反编译 classes.dex 获取 Java 代码',
                '分析 AndroidManifest.xml 组件配置',
                '搜索硬编码密钥和敏感信息',
                '检查网络通信安全',
                '检查数据存储安全',
                '使用 Frida 进行动态 Hook 测试',
                '检查 Root 检测和模拟器检测',
            ],
            techniques: [
                'APK 反编译(jadx, apktool)',
                'Smali 代码分析',
                'Frida 动态 Hook',
                'SSL Pinning Bypass',
                'Root Detection Bypass',
                'Intent 劫持测试',
                'Deep Link 安全测试',
                'Native 库分析',
            ],
            examples: [
                {
                    name: 'APK 反编译分',
                    description: '使用 jadx 反编译APK 获取 Java 源码',
                    content: '# 使用 jadx 反编译\n' +
                        'jadx -d output_dir target.apk\n' +
                        '# 使用 apktool 反编译\n' +
                        'apktool d target.apk -o output_dir\n' +
                        '# 搜索硬编码密钥\n' +
                        'grep -r "API_KEY\|secret\|password\|token" output_dir/',
                },
                {
                    name: 'Frida SSL Pinning Bypass',
                    description: '使用 Frida 脚本绕过 SSL Pinning 检测',
                    content: '# Frida SSL Pinning Bypass 脚本\n' +
                        'frida -U -f com.target.app \\\n' +
                        '  --no-pause \\\n' +
                        '  -l ssl_pinning_bypass.js\n' +
                        '# ssl_pinning_bypass.js 内容:\n' +
                        'Java.perform(function() {\n' +
                        '  var TrustManager = Java.registerClass({\n' +
                        '    name: "custom.TrustManager",\n' +
                        '    implements: [X509TrustManager],\n' +
                        '    methods: { checkClientTrusted: function() {}, checkServerTrusted: function() {} }\n' +
                        '  });\n' +
                        '  // Trust all certificates\n' +
                        '});',
                },
            ],
        },
        validation: {
            indicators: [
                '成功反编译 APK 并获取可读代码',
                '发现硬编码密钥或敏感信息',
                '成功绕过安全检测机',
                '可以拦截和修改应用网络请求',
            ],
            successSigns: [
                '反编译代码可读性良',
                'Frida Hook 成功执行',
                'SSL Pinning 被绕过可拦截 HTTPS 流量',
                'Root 检测被绕过应用正常运行',
            ],
            falsePositiveSigns: [
                '反编译代码因混淆难以理解但安全机制仍',
                'Hook 成功但应用检测到 Hook 并退出',
            ],
        },
        defense: {
            recommendations: [
                '使用代码混淆 (ProGuard/R8) 增加逆向难度',
                '不要在代码中硬编码密',
                '实施 SSL Pinning',
                '正确配置 AndroidManifest.xml ?exported 属性',
                '使用 Android Keystore 存储敏感数据',
                '实施 Root 和模拟器检',
                '使用 Integrity API 验证应用完整性',
            ],
            mitigations: [
                '实施 Anti-Tampering 检',
                '使用 SafetyNet/Play Integrity 验证',
                '定期更新安全依赖',
            ],
            references: [
                'https://owasp.org/www-project-mobile-top-10/',
                'https://frida.re/docs/android/',
            ],
        },
        quality: {
            confidence: 0.91,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: [],
        phase: undefined,
        runtime: {
          ...DEFAULT_SKILL_RUNTIME,
          requiresNetwork: false,
          estimatedTokens: 3000,
        },
        enabled: true,
    },
];
