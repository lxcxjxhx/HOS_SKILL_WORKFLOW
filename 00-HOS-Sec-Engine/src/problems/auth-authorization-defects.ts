/**
 * PD-002: Authentication & Authorization Defects
 * 
 * Systematic diagnosis of authentication and authorization weaknesses
 * including credential management, session handling, token validation,
 * and access control bypass patterns.
 */

import { DiagnosticGuide, ProblemCategoryType, SeverityLevel, LanguageType } from '../schemas/types';

export const AuthAuthorizationDefectsRule: DiagnosticGuide = {
  id: 'PD-002',
  category: ProblemCategoryType.AuthAuthorization,
  name: 'Authentication & Authorization Defects',
  description: 'Systematic diagnosis of authentication and authorization weaknesses including credential management, session handling, token validation, and access control bypass patterns.',
  triggers: {
    patterns: [
      'login',
      'authenticate',
      'authorization',
      'jwt',
      'token',
      'session',
      'passport',
      'oauth',
      'role',
      'permission',
      'grant',
      'access_control',
      'middleware.*auth',
      'Bearer',
      'Authorization.*header'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go,
      LanguageType.Rust
    ],
    keywords: [
      'auth',
      'login',
      'token',
      'jwt',
      'session',
      'role',
      'permission',
      'access',
      'credential',
      'password'
    ]
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Authentication Method Analysis',
      description: 'Identify and analyze all authentication mechanisms used in the application, including password-based, token-based, OAuth, SSO, and multi-factor authentication implementations.',
      questions: [
        'What authentication methods are implemented (form-based, token, OAuth, biometric)?',
        'Is multi-factor authentication (MFA) enforced for sensitive operations?',
        'Are there multiple authentication entry points that may have inconsistent security?',
        'How is user identity established and maintained throughout the application?'
      ],
      defect_indicators: [
        'Hardcoded credentials in source code or configuration files',
        'Authentication bypass via direct URL access or parameter manipulation',
        'No rate limiting on login attempts allowing brute-force attacks',
        'Weak or default credentials accepted',
        'Authentication logic implemented inconsistently across modules'
      ],
      secure_indicators: [
        'Strong authentication mechanism enforced consistently',
        'MFA implemented for privileged accounts',
        'Rate limiting and account lockout policies in place',
        'Centralized authentication module reused across the application'
      ]
    },
    {
      order: 2,
      name: 'Credential Security Assessment',
      description: 'Evaluate how credentials are stored, transmitted, and managed, including password hashing algorithms, key strength, and secret management practices.',
      questions: [
        'What hashing algorithm is used for password storage?',
        'Are secrets (API keys, database passwords) stored securely?',
        'Is there a key rotation policy for cryptographic materials?',
        'How are credentials transmitted between client and server?'
      ],
      defect_indicators: [
        'Passwords stored in plaintext or using weak hashing (MD5, SHA1, unsalted SHA256)',
        'Secrets committed to version control or stored in client-side code',
        'No salting or weak salting strategy for password hashing',
        'Hardcoded API keys or tokens in source code',
        'Credentials logged or exposed in error messages'
      ],
      secure_indicators: [
        'Strong adaptive hashing algorithm used (bcrypt, argon2, scrypt) with appropriate work factors',
        'Secrets managed via dedicated secret management system',
        'Credentials never logged or exposed in responses',
        'Regular key rotation policy enforced'
      ]
    },
    {
      order: 3,
      name: 'Session & Token Validation',
      description: 'Check session management security including session fixation vulnerabilities, JWT validation completeness, expiration handling, and token storage practices.',
      questions: [
        'Are sessions properly invalidated after logout and on password change?',
        'Is JWT signature verified on every protected request?',
        'Are session IDs regenerated after authentication state changes?',
        'How are tokens stored on the client side (localStorage, cookies, memory)?'
      ],
      defect_indicators: [
        'Session ID not regenerated after login (session fixation vulnerability)',
        'JWT signature not validated or validation can be bypassed (alg:none attack)',
        'Token expiration not checked or expired tokens still accepted',
        'Sensitive tokens stored in localStorage accessible to XSS attacks',
        'No secure, HttpOnly, SameSite flags on session cookies',
        'Concurrent sessions not managed or limited'
      ],
      secure_indicators: [
        'Session ID regenerated on every authentication state change',
        'JWT signature, expiration, issuer, and audience validated on every request',
        'Tokens stored in HttpOnly, Secure, SameSite cookies',
        'Proper session timeout and idle timeout configured',
        'Logout invalidates all sessions across devices'
      ]
    },
    {
      order: 4,
      name: 'Access Control Bypass Path Analysis',
      description: 'Identify paths where access control can be bypassed, including IDOR (Insecure Direct Object References), horizontal privilege escalation, and vertical privilege escalation vulnerabilities.',
      questions: [
        'Is access control enforced on every server-side endpoint?',
        'Can users access resources belonging to other users by manipulating IDs?',
        'Are there admin functions accessible to regular users via direct API calls?',
        'Is authorization checked before every sensitive operation, not just UI rendering?'
      ],
      defect_indicators: [
        'Access control enforced only on client-side or UI layer',
        'Direct object references without ownership verification (IDOR)',
        'Role checks missing on API endpoints or performed after business logic',
        'Horizontal privilege escalation: accessing other users\' data via ID manipulation',
        'Vertical privilege escalation: accessing admin functions via direct URL or API',
        'Missing authorization on CRUD operations for sensitive resources'
      ],
      secure_indicators: [
        'Server-side access control enforced on every endpoint via middleware or interceptors',
        'Resource ownership verified before every data access operation',
        'Role-based or attribute-based access control (RBAC/ABAC) consistently applied',
        'Principle of least privilege followed in permission design',
        'Authorization checks performed before business logic execution'
      ]
    }
  ],
  common_root_causes: [
    {
      cause: 'Weak password hashing algorithm (MD5/SHA1)',
      explanation: 'Developers use fast cryptographic hash functions (MD5, SHA1) instead of adaptive password hashing functions. These algorithms are designed for speed, making them vulnerable to brute-force and rainbow table attacks. Without proper salting and key stretching, compromised password databases can be cracked in minutes.',
      frequency: 'common'
    },
    {
      cause: 'Missing token validation/signature check',
      explanation: 'JWT or session tokens are accepted without verifying their cryptographic signature, expiration, issuer, or audience. This allows attackers to forge tokens, use expired tokens, or replay tokens from other services. The alg:none attack is a classic example where the token header claims no algorithm is needed.',
      frequency: 'common'
    },
    {
      cause: 'Session ID predictable or not regenerated after login',
      explanation: 'Session identifiers are generated using predictable algorithms (e.g., sequential numbers, timestamps) or are not regenerated after the user authenticates. This enables session fixation attacks where an attacker sets a known session ID before the victim logs in, then hijacks the authenticated session.',
      frequency: 'occasional'
    },
    {
      cause: 'Access control enforced only on client-side or UI layer',
      explanation: 'Authorization checks are performed only in the frontend (hiding buttons, disabling routes) without server-side enforcement. Attackers can bypass UI restrictions by directly calling API endpoints, manipulating HTTP requests, or using tools like curl or Burp Suite to access restricted resources.',
      frequency: 'common'
    }
  ],
  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Use strong adaptive password hashing (bcrypt or argon2)',
      description: 'Replace weak hashing algorithms (MD5, SHA1) with bcrypt or argon2. Configure appropriate work factors (cost factor >= 12 for bcrypt) and always use unique per-user salts. These functions are intentionally slow to resist brute-force attacks.',
      code: `// bcrypt example (Node.js)
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash password during registration
async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

// Verify password during login
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Critical,
      action: 'Implement comprehensive JWT validation middleware',
      description: 'Create middleware that validates JWT signature, expiration, issuer, and audience on every protected request. Use a well-maintained library and never trust token contents without cryptographic verification.',
      code: `// JWT validation middleware (Express.js)
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = 'your-app';
const JWT_AUDIENCE = 'your-app-api';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],          // Only allow specific algorithms
      issuer: JWT_ISSUER,             // Validate issuer
      audience: JWT_AUDIENCE,         // Validate audience
      clockTolerance: 30              // Allow 30s clock skew
    });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement secure session handling with proper lifecycle management',
      description: 'Regenerate session IDs after authentication state changes, set secure cookie flags, configure appropriate timeouts, and ensure complete session invalidation on logout.',
      code: `// Secure session configuration (Express.js with express-session)
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // Prevent XSS access
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 30 * 60 * 1000  // 30 minutes
  },
  name: '__Host-session-id',  // Secure cookie prefix
  rolling: true          // Reset expiry on each request
}));

// Regenerate session on login
app.post('/login', (req, res) => {
  // ... authenticate user ...
  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    req.session.userId = user.id;
    req.session.save();
    res.json({ success: true });
  });
});

// Complete session invalidation on logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Logout error');
    res.clearCookie('__Host-session-id');
    res.json({ success: true });
  });
});`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Enforce server-side access control on every endpoint',
      description: 'Implement middleware or interceptors that verify user permissions before executing any protected operation. Never rely on client-side authorization. Use RBAC or ABAC patterns consistently.',
      code: `// Server-side access control middleware (Express.js)
import { Request, Response, NextFunction } from 'express';

interface UserWithRole {
  userId: string;
  role: 'admin' | 'user' | 'moderator';
}

// Role-based access control
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserWithRole | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Resource ownership check (prevent IDOR)
export function requireOwnership(resourceOwnerIdField: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserWithRole | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin bypass
    if (user.role === 'admin') {
      return next();
    }

    const resourceOwnerId = req.params[resourceOwnerIdField] || req.body[resourceOwnerIdField];

    if (user.userId !== resourceOwnerId) {
      return res.status(403).json({ error: 'Access denied: resource not owned' });
    }

    next();
  };
}

// Usage
app.get('/api/users/:userId/profile',
  authMiddleware,
  requireOwnership('userId'),
  getUserProfile
);

app.delete('/api/admin/users/:userId',
  authMiddleware,
  requireRole('admin'),
  deleteUser
);`,
      difficulty: 'Medium'
    }
  ],
  verification_steps: [
    'Verify that password hashes use bcrypt/argon2 with appropriate cost factors by inspecting the stored hash format and hashing configuration in code.',
    'Test JWT validation by attempting to access protected endpoints with expired tokens, modified signatures, and tokens with alg:none header. All should be rejected with 401.',
    'Confirm session IDs are regenerated after login by comparing session ID before and after authentication. Verify session is destroyed on logout.',
    'Attempt IDOR attacks by manipulating resource IDs (user IDs, order IDs) in API requests while authenticated as a different user. All unauthorized access attempts should return 403.',
    'Verify that admin-only endpoints reject requests from regular users even when the UI is bypassed (direct API calls with curl or Burp Suite).'
  ],
  related_audit_rules: ['AR-003'],
  related_pentest_rules: ['PT-002', 'PT-003'],
  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-287', 'CWE-306', 'CWE-384', 'CWE-613'],
  owasp_categories: [
    'A07:2021 - Identification and Authentication Failures',
    'A01:2021 - Broken Access Control'
  ],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
