/**
 * AR-004: Cryptographic Check Rule
 * 
 * 功能: 检查加密算法、密钥管理、随机数生成的安全性
 * 焦点: 不是告诉AI"什么是加密"
 *      而是定义AI"如何检查加密实现"的6步流程
 * 
 * 检查流程:
 *  1. 加密算法识别
 *  2. 密钥管理检查
 *  3. 随机数生成审查
 *  4. 加密模式分析
 *  5. 哈希函数检查
 *  6. 证书与TLS配置
 */

import {
  AuditRule,
  SeverityLevel,
  EvidenceType,
  LanguageType
} from '../schemas/types';

export const CryptoCheckRule: AuditRule = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'AR-004',
  name: 'Cryptographic Check',
  description: '检查加密算法、密钥管理、随机数生成等密码学实现的安全性',
  detail: `
本规则的目的是系统化地检查代码中的密码学实现是否存在安全缺陷。

核心理念:
- 不是问"加密做得对不对"
- 而是问"使用的算法是否安全、密钥是否安全存储、随机数是否可预测"

关键问题序列:
1. 代码中使用了哪些加密/哈希算法?
2. 加密密钥如何生成、存储、轮换?
3. 随机数生成器是否密码学安全?
4. 加密模式是否正确(CBC/CTR/GCM)?
5. 哈希函数是否用于正确的场景?
6. TLS/SSL配置是否安全?
  `,

  // ============================================================================
  // 触发条件
  // ============================================================================

  triggers: {
    patterns: [
      '加密调用: crypto.encrypt() / Cipher.getInstance() / AES',
      '哈希调用: crypto.hash() / MessageDigest / hashlib.md5()',
      '密钥操作: generateKey() / SecretKeySpec / new Buffer(secret)',
      '随机数: Math.random() / Random() / crypto.randomBytes()',
      '签名: sign() / verify() / RSASSA',
      'TLS/SSL: createServer({ key, cert }) / SSLContext',
      '编码: Base64 / URL编码(被误认为加密)'
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
      'Node.js Crypto',
      'Java Cryptography',
      'Python cryptography',
      '.NET Cryptography',
      'OpenSSL',
      'libsodium'
    ]
  },

  // ============================================================================
  // 检查流程 (核心!) - 这才是AI需要学习的
  // ============================================================================

  checks: [
    {
      order: 1,
      name: '加密算法识别',
      condition: '识别代码中使用的所有加密、哈希、编码算法',
      questions: [
        '代码中使用了哪些加密算法?',
        '算法是否为当前推荐的安全算法?',
        '是否存在已废弃或不安全的算法?',
        '加密是否被误用为编码(Base64≠加密)?',
        '算法选择是否有文档说明?'
      ],
      failureIndicators: [
        'DES/3DES: DESede / TripleDES',
        'RC4: RC4 / ARC4',
        'MD5: md5() / MD5',
        'SHA1用于安全场景: sha1() / SHA-1',
        'ECB模式: AES/ECB',
        'Base64被用作"加密": base64Encode(secret)',
        'ROT13/Caesar等简单替换'
      ],
      successIndicators: [
        'AES-256-GCM / ChaCha20-Poly1305',
        'SHA-256 / SHA-3 / BLAKE2',
        'RSA-2048+ / ECDSA P-256+',
        'Ed25519 / X25519',
        'Argon2 / bcrypt / scrypt用于密码'
      ],
      criticality: 'must-have'
    },

    {
      order: 2,
      name: '密钥管理检查',
      condition: '检查加密密钥的生成、存储、传输和轮换机制',
      questions: [
        '密钥是如何生成的(随机性、长度)?',
        '密钥存储在哪里(代码、配置、环境变量、HSM)?',
        '密钥是否在版本控制中?',
        '密钥是否有轮换机制?',
        '密钥传输是否加密?',
        '不同环境是否使用不同密钥?'
      ],
      failureIndicators: [
        '硬编码密钥: const KEY = "my-secret-key-123"',
        '密钥在配置文件明文存储',
        '密钥提交到版本控制: .env in git',
        '短密钥: AES-128或更短',
        '密钥通过HTTP传输',
        '所有环境共用同一密钥',
        '密钥无过期或轮换机制'
      ],
      successIndicators: [
        '密钥由CSPRNG生成',
        '密钥存储在KMS/HSM/密钥库',
        '密钥通过环境变量或安全服务注入',
        '有自动化密钥轮换机制',
        '不同环境使用不同密钥',
        '密钥有明确的过期策略'
      ],
      criticality: 'must-have'
    },

    {
      order: 3,
      name: '随机数生成审查',
      condition: '检查随机数生成器的类型和使用场景是否匹配',
      questions: [
        '代码中哪些地方使用了随机数?',
        '使用了哪种随机数生成器(PRNG vs CSPRNG)?',
        '随机数是否用于安全敏感场景(Token、密钥、盐值)?',
        '随机数生成器是否正确初始化(seed)?',
        '是否存在随机数重用?'
      ],
      failureIndicators: [
        'Math.random()用于安全场景',
        'java.util.Random用于Token生成',
        'Python random模块用于密钥生成',
        '固定种子: srand(12345)',
        '时间戳作为随机源: seed = time()',
        'IV/Nonce重用'
      ],
      successIndicators: [
        'crypto.randomBytes() / crypto.getRandomValues()',
        'java.security.SecureRandom',
        'Python secrets模块',
        '/dev/urandom或getrandom系统调用',
        '每次加密使用新的IV/Nonce'
      ],
      criticality: 'must-have'
    },

    {
      order: 4,
      name: '加密模式分析',
      condition: '检查加密模式、填充方案、IV/Nonce的使用是否正确',
      questions: [
        '使用了什么加密模式(ECB/CBC/CTR/GCM)?',
        '填充方案是否安全(PKCS#7/PKCS#5)?',
        'IV/Nonce是否随机且唯一?',
        '是否使用了认证加密(AEAD)?',
        '填充Oracle攻击是否被防护?'
      ],
      failureIndicators: [
        'ECB模式(相同明文产生相同密文)',
        'CBC模式无完整性验证',
        'IV固定或可预测: iv = Buffer.alloc(16, 0)',
        'IV重用',
        'Padding Oracle: 解密错误区分不同padding错误',
        '密文无MAC验证'
      ],
      successIndicators: [
        'GCM/CCM/EAX认证加密模式',
        'ChaCha20-Poly1305',
        '每次加密使用随机IV',
        'IV通过prepend方式与密文一起存储',
        '解密时先验证MAC再处理',
        '统一的解密错误处理'
      ],
      criticality: 'must-have'
    },

    {
      order: 5,
      name: '哈希函数检查',
      condition: '检查哈希函数的使用场景是否合适',
      questions: [
        '哈希函数用于什么场景(密码存储、数据完整性、指纹)?',
        '选择的哈希函数是否适合该场景?',
        '是否添加了盐值(对于密码哈希)?',
        '是否使用了HMAC(对于消息认证)?',
        '是否存在哈希长度扩展攻击风险?'
      ],
      failureIndicators: [
        'MD5/SHA1用于密码存储',
        '无盐值哈希: sha256(password)',
        'SHA256用于HMAC: sha256(key + message)',
        '哈希用于加密目的',
        '碰撞攻击敏感场景使用MD5'
      ],
      successIndicators: [
        'Argon2id/bcrypt/scrypt用于密码',
        'SHA-256/SHA-3用于数据完整性',
        'HMAC-SHA256用于消息认证',
        '每个密码有独立的随机盐值',
        'BLAKE2/BLAKE3用于高性能场景'
      ],
      criticality: 'must-have'
    },

    {
      order: 6,
      name: '证书与TLS配置',
      condition: '检查TLS/SSL配置和证书管理是否安全',
      questions: [
        'HTTPS/TLS是否正确配置?',
        '是否禁用了不安全的协议版本(SSLv3、TLS1.0、TLS1.1)?',
        '证书验证是否被禁用?',
        '是否使用了弱加密套件?',
        '证书是否过期?'
      ],
      failureIndicators: [
        '禁用证书验证: rejectUnauthorized: false',
        '允许SSLv3/TLS1.0: minVersion: "TLSv1"',
        '弱加密套件: RC4/DES/MD5 in cipher list',
        '自签名证书用于生产环境',
        'curl -k / --insecure 等效设置',
        '证书过期未更新'
      ],
      successIndicators: [
        '强制TLS1.2+: minVersion: "TLSv1.2"',
        '完整的证书链验证',
        'HSTS header设置',
        '前向保密(Forward Secrecy)启用',
        '自动证书续期(Let\'s Encrypt)'
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
      description: '加密/哈希/随机数相关代码位置和上下文',
      example: `
不安全的加密:
  文件: src/services/encryptService.js
  行号: 15
  代码:
    const cipher = crypto.createCipheriv('aes-256-ecb', key, '');
    // <- ECB模式不安全,且ECB不需要IV但传了空值

硬编码密钥:
  文件: src/config/crypto.js
  行号: 5
  代码:
    const SECRET_KEY = 'hardcoded-secret-key-12345';
    // <- 密钥硬编码在源码中
      `,
      collection_guidance: '标注加密操作的代码位置，展示算法和参数配置，高亮不安全的算法或参数，包括密钥使用位置的上下文'
    },

    {
      type: EvidenceType.Configuration,
      required: true,
      description: '加密配置、TLS设置、密钥管理配置',
      example: `
TLS配置:
  文件: src/config/ssl.js
  代码:
    const options = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt'),
      minVersion: 'TLSv1',  // <- 应至少TLSv1.2
      ciphers: 'DEFAULT'    // <- 应明确指定强套件
    };
      `,
      collection_guidance: '检查TLS/SSL配置文件，检查加密算法配置，检查密钥存储方式，检查环境配置中的密钥管理'
    },

    {
      type: EvidenceType.Dependency,
      required: false,
      description: '加密相关依赖库及其版本',
      example: 'package.json / pom.xml 中的加密库: crypto-js@3.1.9-1 (有已知漏洞)',
      collection_guidance: '检查加密库版本是否有已知漏洞，检查是否使用了废弃的加密库，验证依赖完整性(防止供应链攻击)'
    }
  ],

  // ============================================================================
  // 修复建议
  // ============================================================================

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: '替换不安全的加密算法为现代推荐算法',
      code: `
// Node.js - 安全加密 (AES-256-GCM)
import crypto from 'crypto';

function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted, authTag: authTag.toString('hex') };
}

// Java - 安全加密
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
GCMParameterSpec spec = new GCMParameterSpec(128, iv);
cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

// Python - 安全哈希 (Argon2)
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)
      `,
      description: '使用AEAD模式(如GCM)的加密算法,同时提供保密性和完整性验证。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.High,
      action: '实施安全的密钥管理',
      code: `
// 密钥应从安全服务获取,而非硬编码
// Node.js - 从环境变量或KMS获取
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
if (!key || key.length !== 32) {
  throw new Error('Invalid encryption key');
}

// 使用KMS (AWS示例)
import { KMS } from '@aws-sdk/client-kms';
const kms = new KMS();
const { Plaintext } = await kms.decrypt({ CiphertextBlob: encryptedKey });

// Java - 密钥生成
KeyGenerator keyGen = KeyGenerator.getInstance("AES");
keyGen.init(256, SecureRandom.getInstanceStrong());
SecretKey key = keyGen.generateKey();
      `,
      description: '密钥应使用CSPRNG生成,通过KMS/HSM或安全环境变量管理,永不硬编码。',
      difficulty: 'Medium'
    },

    {
      priority: SeverityLevel.Medium,
      action: '使用安全的随机数生成器',
      code: `
// Node.js - 密码学安全随机数
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
const iv = crypto.randomBytes(16);

// Java - SecureRandom
SecureRandom secureRandom = SecureRandom.getInstanceStrong();
byte[] token = new byte[32];
secureRandom.nextBytes(token);

// Python - secrets模块
import secrets
token = secrets.token_hex(32)
iv = secrets.token_bytes(16)

// 绝对不要:
// Math.random() / java.util.Random / random.random()
      `,
      description: '对于任何安全敏感的场景(Token、密钥、IV、盐值),必须使用密码学安全的随机数生成器。',
      difficulty: 'Easy'
    }
  ],

  // ============================================================================
  // 元数据
  // ============================================================================

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-326', 'CWE-327', 'CWE-328', 'CWE-798'],  // Inadequate Encryption, Broken Crypto, Weak Hash, Hardcoded Credentials
  owasp_categories: [
    'A02:2021 - Cryptographic Failures',
    'A09:2021 - Security Logging and Monitoring Failures'
  ],
  created_date: '2026-06-16',
  last_updated: '2026-06-16'
};

export default CryptoCheckRule;
