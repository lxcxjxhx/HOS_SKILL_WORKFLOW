import { DiagnosticGuide, ProblemCategoryType, SeverityLevel, LanguageType } from '../schemas/types';

export const DataProtectionDefectsRule: DiagnosticGuide = {
  id: 'PD-003',
  category: ProblemCategoryType.DataProtection,
  name: 'Data Protection Defects',
  description:
    'Systematic diagnosis of data protection weaknesses including weak encryption algorithms, improper key management, sensitive data exposure, and missing data masking patterns.',
  triggers: {
    patterns: [
      'crypto\\.encrypt|crypto\\.decrypt|Cipher\\.encrypt|Cipher\\.decrypt',
      'AES|DES|RSA|Blowfish|TripleDES|MD5|SHA1|SHA256|SHA512',
      'password.*hash|hash.*password|bcrypt|argon2|pbkdf2|scrypt',
      'encrypt.*at.*rest|encrypt.*in.*transit|encrypt.*data|decrypt.*data',
      'secret.*key|private.*key|api.*key|access.*token|encryption.*key',
      'pii|personal.*data|sensitive.*data|confidential.*data',
      'mask.*data|redact.*data|anonymize|pseudonymize',
      'key.*generate|key.*store|key.*rotate|key.*destroy|key.*exchange',
      'kms|key.*management|key.*vault|hsm',
      'data.*at.*rest|data.*in.*transit|data.*in.*use',
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go,
      LanguageType.Rust,
    ],
    keywords: [
      'encrypt',
      'decrypt',
      'cipher',
      'hash',
      'aes',
      'rsa',
      'crypto',
      'secret',
      'pii',
      'sensitive',
      'mask',
      'redact',
    ],
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Data Classification',
      description:
        'Identify all sensitive data types handled by the application and their storage locations.',
      questions: [
        'What types of sensitive data does the application process (PII, credentials, financial data, health data)?',
        'Where is sensitive data stored (database, cache, filesystem, memory, logs)?',
        'How does sensitive data flow through the system (ingestion, processing, storage, output)?',
        'Are there data classification labels or tags applied to sensitive data fields?',
      ],
      defect_indicators: [
        'Sensitive data stored without classification or labeling',
        'No data inventory or data flow documentation exists',
        'Sensitive data stored in unstructured formats or mixed with non-sensitive data',
        'Missing data retention or deletion policies for sensitive data',
      ],
      secure_indicators: [
        'All sensitive data types are documented and classified',
        'Data flow diagrams exist showing where sensitive data travels',
        'Sensitive data storage locations are explicitly documented and reviewed',
        'Data retention and secure deletion policies are in place',
      ],
    },
    {
      order: 2,
      name: 'Encryption Algorithm Assessment',
      description:
        'Evaluate the cryptographic algorithms, key lengths, and modes of operation used for data protection.',
      questions: [
        'Which encryption algorithms are used (AES, DES, RSA, ChaCha20, etc.)?',
        'What key lengths are configured (128-bit, 192-bit, 256-bit)?',
        'Which modes of operation are used for block ciphers (ECB, CBC, GCM, CTR)?',
        'Which hashing algorithms are used for data integrity or password storage?',
        'Are deprecated or weak algorithms (MD5, SHA1, DES, RC4) present in the codebase?',
      ],
      defect_indicators: [
        'Use of DES, TripleDES, RC4, or other deprecated ciphers',
        'Use of MD5 or SHA1 for security-sensitive hashing',
        'AES in ECB mode (deterministic output reveals data patterns)',
        'AES-CBC without proper IV generation or without authentication (no HMAC)',
        'Key lengths below industry minimums (e.g., RSA < 2048 bits, AES < 128 bits)',
        'Custom or proprietary encryption algorithms instead of well-vetted standards',
      ],
      secure_indicators: [
        'AES-256-GCM or ChaCha20-Poly1305 used for symmetric encryption',
        'RSA-4096 or ECC used for asymmetric encryption',
        'Argon2, bcrypt, or scrypt used for password hashing',
        'SHA-256 or SHA-3 used for integrity hashing',
        'All cryptographic operations use well-vetted libraries, not custom implementations',
      ],
      tools: ['cryptographic linters', 'dependency vulnerability scanners', 'static analysis rules'],
    },
    {
      order: 3,
      name: 'Key Management Analysis',
      description:
        'Check cryptographic key generation, storage, rotation, and destruction practices.',
      questions: [
        'How are cryptographic keys generated (random number generator, CSPRNG)?',
        'Where are encryption keys stored (hardcoded, environment variables, KMS, HSM)?',
        'Is there a key rotation policy and is it automated?',
        'How are keys destroyed when no longer needed?',
        'Are keys separated by environment (dev, staging, production)?',
        'Who has access to encryption keys and how is access controlled?',
      ],
      defect_indicators: [
        'Hardcoded encryption keys, secrets, or passwords in source code',
        'Keys stored in plaintext configuration files or version control',
        'No key rotation policy or manual/infrequent rotation',
        'Same key used across multiple environments or services',
        'Keys logged or printed during debugging',
        'Use of predictable or weak random number generators for key generation',
        'No secure key destruction process (keys persist after data deletion)',
      ],
      secure_indicators: [
        'Keys generated using cryptographically secure random number generators (CSPRNG)',
        'Keys stored in a dedicated KMS (AWS KMS, Azure Key Vault, HashiCorp Vault)',
        'Automated key rotation with defined lifecycle policies',
        'Keys are environment-specific and access-controlled',
        'Secure key zeroing/destruction after use',
        'Key usage is logged and audited',
      ],
      tools: [
        'secret scanning tools (git-secrets, trufflehog, gitleaks)',
        'KMS audit logs review',
        'configuration file analysis',
      ],
    },
    {
      order: 4,
      name: 'Data Exposure & Masking Check',
      description:
        'Verify that sensitive data is not exposed in logs, API responses, error messages, or user interfaces.',
      questions: [
        'Is sensitive data (passwords, tokens, PII) written to application logs?',
        'Do API responses return sensitive fields that are not needed by the client?',
        'Are error messages or stack traces exposing sensitive data or internal details?',
        'Is sensitive data masked or redacted in user interfaces and reports?',
        'Are there data masking rules for non-production environments?',
      ],
      defect_indicators: [
        'Passwords, tokens, or API keys visible in log files or console output',
        'PII (SSN, credit card, email, phone) returned in full in API responses',
        'Database connection strings or credentials in error messages',
        'Stack traces exposed to end users in production',
        'Sensitive data visible in browser DevTools network payloads without need',
        'No data masking applied in test/staging environments using production data',
        'Credit card numbers or SSNs logged during debugging or exception handling',
      ],
      secure_indicators: [
        'Structured logging with sensitive field filtering/masking',
        'API responses only return fields required by the client (DTO pattern)',
        'Generic error messages shown to users; detailed errors logged securely',
        'Data masking applied in non-production environments',
        'PII redacted in logs using allowlist-based log sanitization',
        'Audit logging for access to sensitive data fields',
      ],
      tools: ['log analysis tools', 'API response inspection', 'data loss prevention (DLP) scanners'],
    },
  ],
  common_root_causes: [
    {
      cause: 'Deprecated or weak cryptographic algorithm (DES, MD5, SHA1)',
      explanation:
        'Developers may use outdated algorithms due to legacy code, lack of security awareness, or framework defaults. These algorithms have known vulnerabilities: DES has a 56-bit key that can be brute-forced, MD5 has collision attacks, and SHA1 is deprecated for cryptographic use.',
      frequency: 'common',
    },
    {
      cause: 'Hardcoded encryption keys or secrets in source code',
      explanation:
        'Developers often embed keys directly in code for convenience during development and forget to externalize them. These keys become accessible to anyone with code repository access and are frequently committed to version control systems.',
      frequency: 'common',
    },
    {
      cause: 'Missing encryption at rest for sensitive data storage',
      explanation:
        'Sensitive data may be stored in plaintext in databases, caches, or file systems because encryption was considered unnecessary for internal data, or the complexity of key management was avoided. This exposes data if storage media is compromised.',
      frequency: 'occasional',
    },
    {
      cause: 'Sensitive data logged or returned in API responses without masking',
      explanation:
        'Verbose logging for debugging or overly permissive API serialization can expose passwords, tokens, PII, and other sensitive data. Developers may not realize that logging frameworks capture full objects or that API responses include all model fields by default.',
      frequency: 'common',
    },
  ],
  remediations: [
    {
      priority: SeverityLevel.Critical,
      action:
        'Replace weak cryptographic algorithms with AES-256-GCM for symmetric encryption and RSA-4096 or ECC for asymmetric encryption.',
      description:
        'Migrate all encryption operations to AES-256 in GCM mode, which provides both confidentiality and integrity (authenticated encryption). GCM mode eliminates padding oracle attacks and does not require a separate MAC.',
      code: `// TypeScript - AES-256-GCM Encryption Example
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;

function encrypt(plaintext: string, key: Buffer): { ciphertext: string; iv: string; tag: string } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    tag: authTag.toString('base64'),
  };
}

function decrypt(
  ciphertext: string,
  key: Buffer,
  iv: string,
  tag: string,
): string {
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}`,
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
        'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf',
      ],
      difficulty: 'Medium',
    },
    {
      priority: SeverityLevel.Critical,
      action:
        'Implement secure key management using a Key Management Service (KMS) or secrets manager instead of hardcoded keys.',
      description:
        'Use a dedicated KMS (AWS KMS, Azure Key Vault, HashiCorp Vault) to generate, store, rotate, and audit access to encryption keys. Never hardcode keys in source code or configuration files.',
      code: `// TypeScript - Secure Key Management with AWS KMS Example
import { KMS } from '@aws-sdk/client-kms';

const kms = new KMS({ region: 'us-east-1' });

async function generateDataKey(keyId: string): Promise<{
  plaintextKey: Buffer;
  encryptedKey: Buffer;
}> {
  const response = await kms.generateDataKey({
    KeyId: keyId,
    KeySpec: 'AES_256',
  });
  
  return {
    plaintextKey: Buffer.from(response.Plaintext!),
    encryptedKey: Buffer.from(response.CiphertextBlob!),
  };
}

async function decryptDataKey(encryptedKey: Buffer): Promise<Buffer> {
  const response = await kms.decrypt({
    CiphertextBlob: encryptedKey,
  });
  
  return Buffer.from(response.Plaintext!);
}

// Usage: encrypt data with plaintext key, then store encrypted key
// Never persist the plaintext key to disk or logs`,
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html',
        'https://docs.aws.amazon.com/kms/latest/developerguide/overview.html',
      ],
      difficulty: 'Medium',
    },
    {
      priority: SeverityLevel.High,
      action:
        'Implement data masking for sensitive fields in logs, API responses, and error messages.',
      description:
        'Apply consistent data masking rules to ensure sensitive data (PII, credentials, tokens) is never exposed in logs, API responses, or error outputs. Use allowlist-based approaches rather than blocklist.',
      code: `// TypeScript - Data Masking in Logs and Responses Example

// Mask sensitive fields in logging
const SENSITIVE_FIELDS = ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard'];

function maskSensitiveData(obj: Record<string, any>): Record<string, any> {
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  return masked;
}

// Mask PII in API responses
function maskPII(data: any): any {
  if (typeof data === 'string') {
    // Mask email: j***@example.com
    if (data.includes('@')) {
      const [user, domain] = data.split('@');
      return user[0] + '***@' + domain;
    }
    // Mask credit card: ****-****-****-1234
    if (/\\d{16}/.test(data.replace(/\\D/g, ''))) {
      return '****-****-****-' + data.slice(-4);
    }
    // Mask SSN: ***-**-1234
    if (/\\d{3}-\\d{2}-\\d{4}/.test(data)) {
      return '***-**-' + data.slice(-4);
    }
  }
  return data;
}

// Logger wrapper with automatic masking
const logger = {
  info: (msg: string, data?: Record<string, any>) => {
    console.log(msg, data ? maskSensitiveData(data) : '');
  },
  error: (msg: string, data?: Record<string, any>) => {
    console.error(msg, data ? maskSensitiveData(data) : '');
  },
};`,
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
        'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
      ],
      difficulty: 'Easy',
    },
    {
      priority: SeverityLevel.Critical,
      action:
        'Use Argon2id for password hashing with appropriate memory and iteration parameters.',
      description:
        'Replace any plaintext password storage or weak hashing (MD5, SHA1) with Argon2id, the recommended password hashing algorithm. Argon2id provides resistance against GPU-based attacks and side-channel attacks.',
      code: `// TypeScript - Password Hashing with Argon2 Example
import argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,    // 64 MB
  timeCost: 3,            // 3 iterations
  parallelism: 1,         // 1 thread
  saltLength: 16,         // 128-bit salt
  hashLength: 32,         // 256-bit hash
};

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password, ARGON2_OPTIONS);
  } catch (err) {
    return false;
  }
}

// Usage
const hashed = await hashPassword('user_password_123');
const isValid = await verifyPassword('user_password_123', hashed);`,
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
        'https://www.rfc-editor.org/rfc/rfc9106.html',
      ],
      difficulty: 'Easy',
    },
  ],
  verification_steps: [
    'Run static analysis to confirm no deprecated algorithms (DES, MD5, SHA1, RC4) remain in the codebase.',
    'Verify all encryption keys are stored in a KMS or secrets manager, not hardcoded or in version control.',
    'Test that sensitive data fields (passwords, tokens, PII) are masked or excluded from log output and API responses.',
    'Confirm password hashing uses Argon2id, bcrypt, or scrypt with appropriate work factors, and verify against rainbow table attacks.',
    'Perform a data flow review to ensure sensitive data is encrypted both at rest and in transit, with no plaintext exposure in caches, temp files, or error messages.',
  ],
  related_audit_rules: ['AR-004'],
  related_pentest_rules: ['PT-005'],
  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-327', 'CWE-328', 'CWE-798', 'CWE-359'],
  owasp_categories: [
    'A02:2021 - Cryptographic Failures',
    'A04:2021 - Insecure Design',
  ],
  created_date: '2026-06-17',
  last_updated: '2026-06-17',
};
