/**
 * PT-002: Authentication Bypass Testing
 * 
 * Detects authentication weaknesses that could be exploited to bypass login mechanisms.
 * Simulates attacker perspective for testing authentication controls.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const AuthenticationBypassRule: AuditRule = {
  id: 'PT-002',
  name: 'Authentication Bypass Testing',
  description: 'Detect authentication weaknesses exploitable to bypass login mechanisms.',
  detail: 'Checks for weak password policies, JWT manipulation vulnerabilities, session fixation, credential stuffing susceptibility, and multi-factor authentication bypass patterns.',

  triggers: {
    patterns: [
      'JWT verification: jwt.verify(token, secret)',
      'Password comparison: bcrypt.compare(password, hash)',
      'Session management: req.session.user = user',
      'Token generation: jwt.sign(payload, secret)',
      'Login endpoint: POST /login, POST /auth',
      'Password reset: POST /reset-password',
      'OAuth callback: /auth/callback',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['express', 'spring-security', 'django-auth', 'asp.net-identity'],
    keywords: ['jwt', 'token', 'session', 'login', 'auth', 'password', 'oauth'],
  },

  checks: [
    {
      order: 1,
      name: 'JWT Weak Secret Detection',
      condition: 'Check if JWT signing secret is weak or hard-coded',
      questions: [
        'Is the JWT secret a hard-coded string in the source code?',
        'Is the secret less than 32 characters of entropy?',
        'Is the secret shared across environments (dev/prod)?'
      ],
      failureIndicators: [
        'jwt.sign(payload, "secret") or jwt.sign(payload, process.env.JWT_SECRET || "fallback")',
        'Secret is a common word or short string',
        'Same secret used in development and production'
      ],
      successIndicators: [
        'Secret loaded from secure key management (HSM, Vault)',
        'Secret is cryptographically random (256+ bits)',
        'Different secrets per environment'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'JWT Algorithm Confusion',
      condition: 'Check if JWT algorithm can be manipulated by attacker',
      questions: [
        'Does the server accept the algorithm specified in the JWT header?',
        'Is the "none" algorithm accepted?',
        'Is the algorithm explicitly verified server-side?'
      ],
      failureIndicators: [
        'jwt.verify(token, secret) without specifying algorithm option',
        'No algorithm whitelist enforced',
        'Header algorithm trusted without validation'
      ],
      successIndicators: [
        'jwt.verify(token, secret, { algorithms: ["HS256"] })',
        'Algorithm explicitly specified in verification options',
        'Only expected algorithms accepted'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'Session Fixation Vulnerability',
      condition: 'Check if session ID is regenerated after authentication',
      questions: [
        'Is the session ID regenerated after successful login?',
        'Can an attacker pre-set a session ID before login?',
        'Are session IDs predictable or sequential?'
      ],
      failureIndicators: [
        'req.session.user = user without regenerating session ID',
        'No session fixation protection',
        'Session ID visible in URL parameters'
      ],
      successIndicators: [
        'req.session.regenerate() called after login',
        'Session cookie has HttpOnly, Secure, SameSite flags',
        'Session ID is cryptographically random'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'Brute Force and Credential Stuffing',
      condition: 'Check if login endpoint has rate limiting and account lockout',
      questions: [
        'Is there rate limiting on the login endpoint?',
        'Is there account lockout after failed attempts?',
        'Are CAPTCHAs or MFA implemented for suspicious logins?'
      ],
      failureIndicators: [
        'No rate limiting on POST /login',
        'No account lockout mechanism',
        'No CAPTCHA after failed attempts'
      ],
      successIndicators: [
        'Rate limiter applied to auth endpoints (e.g., express-rate-limit)',
        'Account lockout after N failed attempts',
        'Progressive delay or CAPTCHA after failures'
      ],
      criticality: 'important'
    },
    {
      order: 5,
      name: 'Password Reset Logic Flaws',
      condition: 'Check if password reset flow has logic vulnerabilities',
      questions: [
        'Can the password reset token be predicted or brute-forced?',
        'Does the reset token expire?',
        'Can an attacker reset another user\'s password?'
      ],
      failureIndicators: [
        'Reset token is sequential or based on timestamp',
        'No expiration on reset tokens',
        'User ID controllable in reset request'
      ],
      successIndicators: [
        'Reset token is cryptographically random',
        'Token expires after short time (15-30 minutes)',
        'Token is single-use and invalidated after use'
      ],
      criticality: 'must-have'
    },
    {
      order: 6,
      name: 'Multi-Factor Authentication Bypass',
      condition: 'Check if MFA can be bypassed or skipped',
      questions: [
        'Is MFA enforcement checked on every sensitive request?',
        'Can MFA be bypassed by manipulating the response?',
        'Are backup codes or recovery flows secure?'
      ],
      failureIndicators: [
        'MFA check only on login, not on subsequent requests',
        'mfa_verified flag in client-controllable session data',
        'Recovery codes not rate-limited or rotated'
      ],
      successIndicators: [
        'MFA status verified server-side on each request',
        'MFA state stored in server-only session',
        'Recovery codes are single-use and audited'
      ],
      criticality: 'important'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Authentication code location and implementation details',
      example: 'File: src/auth/jwt.ts:45 - jwt.sign(payload, process.env.JWT_SECRET)',
      collection_guidance: 'Identify JWT secret source, algorithm specification, and verification logic'
    },
    {
      type: EvidenceType.Configuration,
      required: true,
      description: 'Authentication configuration including token expiry, rate limits, session settings',
      example: 'JWT expiry: 1h, session cookie flags, rate limit config',
      collection_guidance: 'Check auth middleware config, session store settings, and security headers'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response evidence of authentication behavior',
      example: 'POST /login with weak password → 200 OK with JWT; JWT decoded showing HS256',
      collection_guidance: 'Capture login flow requests, JWT tokens, and responses to malformed auth attempts'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Use cryptographically strong JWT secrets from key management',
      code: `const jwtSecret = crypto.randomBytes(64).toString('hex');
// Store in AWS Secrets Manager or HashiCorp Vault
const token = jwt.sign(payload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Critical,
      action: 'Enforce algorithm whitelist in JWT verification',
      code: `jwt.verify(token, secret, { algorithms: ['HS256'] });`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Regenerate session ID after authentication',
      code: `req.session.regenerate((err) => {
  req.session.user = user;
  req.session.mfaVerified = false;
});`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement rate limiting and account lockout',
      code: `const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});
app.post('/login', limiter, loginHandler);`,
      difficulty: 'Easy'
    }
  ],

  pentestValidation: {
    description: 'How to validate authentication bypass during penetration testing',
    attackSteps: [
      'Attempt login with common credentials: admin/admin, admin/password, root/root',
      'Capture a valid JWT and attempt to decode it: jwt.io',
      'Try JWT algorithm confusion: change algorithm to "none" and remove signature',
      'Try JWT algorithm downgrade: change RS256 to HS256 and sign with public key',
      'Brute-force JWT secret if weak: hashcat -m 16500 jwt.txt wordlist.txt',
      'Attempt session fixation: set session cookie before login and verify if it persists',
      'Test password reset: check if token is predictable or if user enumeration is possible',
      'Attempt to bypass MFA by manipulating session flags or replaying MFA codes'
    ],
    tools: [
      'jwt_tool.py -T jwt_token -C wordlist.txt (JWT brute force)',
      'hashcat -m 16500 for JWT secret cracking',
      'Burp Suite Intruder for credential stuffing and brute force',
      'curl -X POST /login -d "username=admin&password=test" (manual testing)'
    ],
    expectedFindings: [
      'JWT signed with weak secret "secret" or "password"',
      'JWT accepts "none" algorithm allowing unsigned tokens',
      'Session ID not regenerated after login enabling fixation',
      'No rate limiting allows unlimited login attempts',
      'Password reset tokens are predictable (timestamp-based)'
    ]
  },

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-287', 'CWE-307', 'CWE-384', 'CWE-798'],
  owasp_categories: ['A07:2021 - Identification and Authentication Failures'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
