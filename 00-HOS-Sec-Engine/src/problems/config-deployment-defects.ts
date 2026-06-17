/**
 * PD-004: Configuration & Deployment Defects
 * 
 * Systematic diagnosis of security configuration, deployment, and operational
 * weaknesses including insecure defaults, exposed endpoints, and misconfigured
 * security controls.
 */

import { DiagnosticGuide, ProblemCategoryType, SeverityLevel, LanguageType } from '../schemas/types';

export const ConfigDeploymentDefectsRule: DiagnosticGuide = {
  id: 'PD-004',
  category: ProblemCategoryType.ConfigDeployment,
  name: 'Configuration & Deployment Defects',
  description: 'Systematic diagnosis of security configuration weaknesses including insecure defaults, exposed debug endpoints, missing security headers, and deployment misconfigurations.',
  triggers: {
    patterns: [
      'app\\.use\\(.*cors',
      'CORS|Access-Control',
      'CSP|Content-Security-Policy',
      'X-Frame-Options|X-XSS-Protection|X-Content-Type',
      'HSTS|Strict-Transport-Security',
      'debug.*true|DEBUG.*=.*true',
      'stacktrace|stack_trace|traceback',
      'app\\.listen\\(|server\\.listen\\(',
      'environment.*variable|process\\.env',
      'secret.*key|SECRET_KEY',
      'allowedHosts|ALLOWED_HOSTS',
      'ssl|tls|https',
      'certificate|cert',
      'nginx|apache|iis',
      'docker|container|kubernetes|k8s'
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
      'config',
      'environment',
      'debug',
      'cors',
      'header',
      'ssl',
      'tls',
      'certificate',
      'docker',
      'nginx',
      'apache',
      'production'
    ]
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Configuration Review',
      description: 'Audit all security-relevant configuration settings across the application, infrastructure, and deployment environment.',
      questions: [
        'Are security headers configured (CSP, X-Frame-Options, X-Content-Type-Options, HSTS)?',
        'Is CORS configured with a restrictive allowlist rather than wildcard (* or all origins)?',
        'Is HTTPS enforced for all endpoints, not just login or sensitive pages?',
        'Are session cookie flags set (Secure, HttpOnly, SameSite)?',
        'Are logging and monitoring configured for security events?'
      ],
      defect_indicators: [
        'CORS configured with wildcard (*) or overly permissive origin allowlist',
        'Missing or incomplete security headers (no CSP, no X-Frame-Options, no HSTS)',
        'HTTP allowed for sensitive endpoints (login, API, admin)',
        'Session cookies without Secure, HttpOnly, or SameSite flags',
        'Security configuration differs between environments without documentation'
      ],
      secure_indicators: [
        'CORS restricted to specific trusted origins with credentials=false where possible',
        'All recommended security headers configured and verified',
        'HTTPS enforced globally with HSTS and automatic redirect from HTTP',
        'Session cookies configured with Secure, HttpOnly, and SameSite=Strict or Lax',
        'Security logging and monitoring configured for all security events'
      ]
    },
    {
      order: 2,
      name: 'Default Settings Check',
      description: 'Identify insecure default settings such as default credentials, debug mode enabled in production, verbose error messages, and framework defaults that are unsafe for production.',
      questions: [
        'Is debug mode disabled in production environments?',
        'Are default credentials or API keys changed before deployment?',
        'Are error messages generic in production (no stack traces or detailed errors)?',
        'Are default admin interfaces or endpoints disabled or protected?',
        'Are framework security defaults overridden for production use?'
      ],
      defect_indicators: [
        'Debug mode enabled in production (detailed error pages, stack traces exposed)',
        'Default credentials present (admin/admin, root/root, test/test)',
        'Verbose error messages exposing internal paths, query strings, or stack traces',
        'Default admin panels accessible without authentication',
        'Framework development settings active in production (hot reload, detailed logging)',
        'No rate limiting on login, registration, or API endpoints'
      ],
      secure_indicators: [
        'Debug mode disabled in production with generic error pages',
        'All default credentials changed before deployment',
        'Error messages are generic with detailed logging only in backend logs',
        'Admin interfaces restricted to specific IPs or behind VPN',
        'Rate limiting configured on all authentication and sensitive endpoints'
      ]
    },
    {
      order: 3,
      name: 'Exposure Surface Analysis',
      description: 'Check for exposed endpoints, open ports, unnecessary services, and information disclosure that could provide attack vectors.',
      questions: [
        'Are debug or diagnostic endpoints exposed in production (/debug, /trace, /actuator)?',
        'Are there unnecessary open ports or running services?',
        'Are internal services (databases, caches, message queues) accessible from external networks?',
        'Are API documentation endpoints (Swagger, OpenAPI) restricted to development?',
        'Are version control directories (.git/, .svn/) and backup files accessible via web?'
      ],
      defect_indicators: [
        'Debug endpoints (/debug, /trace, /actuator, /phpinfo) accessible without authentication',
        'Unnecessary open ports or services running on the server',
        'Database or cache ports (3306, 6379, 27017) accessible from external networks',
        'API documentation publicly accessible with full endpoint details',
        'Git repositories (.git/, .svn/) accessible via web',
        'Backup files (.bak, .sql, .env) accessible via web',
        'Server headers exposing framework version (X-Powered-By, Server)'
      ],
      secure_indicators: [
        'All debug and diagnostic endpoints disabled or restricted in production',
        'Only necessary ports are open with firewall rules in place',
        'Internal services firewalled with no external network access',
        'API documentation restricted to authenticated developers or development environments',
        'Version control directories and backup files blocked from web access',
        'Server headers stripped or set to generic values'
      ]
    },
    {
      order: 4,
      name: 'Transport Security Verification',
      description: 'Verify TLS/SSL configuration, certificate validity, HSTS headers, and overall transport layer security settings.',
      questions: [
        'Is TLS 1.2 or higher enforced (TLS 1.0 and 1.1 disabled)?',
        'Are SSL/TLS certificates valid, not expired, and from trusted Certificate Authorities?',
        'Is HSTS (HTTP Strict Transport Security) header configured with appropriate max-age?',
        'Are weak cipher suites disabled?',
        'Is certificate pinning considered for high-security applications?'
      ],
      defect_indicators: [
        'TLS 1.0 or 1.1 still supported',
        'SSL/TLS certificates expired or self-signed in production',
        'Missing or misconfigured HSTS header',
        'Weak cipher suites enabled (RC4, DES, 3DES, export ciphers)',
        'Mixed content warnings (HTTP resources loaded on HTTPS pages)',
        'No redirect from HTTP to HTTPS',
        'Certificate Common Name (CN) does not match domain'
      ],
      secure_indicators: [
        'TLS 1.2+ enforced with strong cipher suites only (AES-GCM, ChaCha20-Poly1305)',
        'Valid certificates from trusted CAs with automatic renewal configured',
        'HSTS header configured with max-age >= 31536000, includeSubDomains, and preload',
        'All weak cipher suites disabled',
        'No mixed content - all resources loaded over HTTPS',
        'Automatic HTTP to HTTPS redirect configured'
      ]
    }
  ],
  common_root_causes: [
    {
      cause: 'Debug mode enabled in production environment',
      explanation: 'Developers enable debug mode during development for easier troubleshooting but fail to disable it before deploying to production. This exposes detailed error messages, stack traces, and potentially sensitive application internals to end users.',
      frequency: 'common'
    },
    {
      cause: 'Default credentials not changed after deployment',
      explanation: 'Software packages, databases, cloud services, and frameworks often ship with well-known default credentials (admin/admin, root/root). If these are not changed before or immediately after deployment, attackers can easily gain access using publicly available documentation of default credentials.',
      frequency: 'common'
    },
    {
      cause: 'CORS configured with wildcard (*) allowing any origin',
      explanation: 'Cross-Origin Resource Sharing (CORS) is configured to allow requests from any origin (Access-Control-Allow-Origin: *) rather than restricting to a specific allowlist of trusted domains. This removes the browser\'s same-origin protection and can enable cross-site request forgery and data exfiltration attacks.',
      frequency: 'common'
    },
    {
      cause: 'Missing security headers (X-Frame-Options, CSP, X-Content-Type-Options)',
      explanation: 'Web applications lack critical HTTP security headers that provide defense-in-depth protections. Without X-Frame-Options, the application is vulnerable to clickjacking. Without Content-Security-Policy (CSP), XSS attacks are more likely to succeed. Without X-Content-Type-Options, MIME type sniffing can lead to unexpected content execution.',
      frequency: 'common'
    }
  ],
  remediations: [
    {
      priority: SeverityLevel.High,
      action: 'Disable debug mode in production environment',
      description: 'Ensure debug mode is disabled in production to prevent exposure of stack traces, detailed error messages, and sensitive application internals. Use environment-specific configuration to enable debug mode only in development.',
      code: `// TypeScript - Disable debug mode in production
import express from 'express';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: \`.env.\${env}\` });

const app = express();

// Ensure debug mode is disabled in production
const DEBUG = env === 'development';

if (env === 'production' && DEBUG) {
  throw new Error('FATAL: Debug mode must not be enabled in production!');
}

// Use generic error handler in production
if (env === 'production') {
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Log full error internally
    console.error('Internal error:', err);
    
    // Return generic error to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  });
} else {
  // Development: show detailed errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status || 500).json({
      error: err.name,
      message: err.message,
      stack: err.stack
    });
  });
}

export default app;`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Enforce HTTPS with HSTS headers',
      description: 'Enforce HTTPS for all endpoints and configure HTTP Strict Transport Security (HSTS) headers to prevent protocol downgrade attacks. Redirect all HTTP traffic to HTTPS automatically.',
      code: `// TypeScript - Enforce HTTPS with HSTS
import express from 'express';
import helmet from 'helmet';
import * as https from 'https';
import * as fs from 'fs';

const app = express();

// Configure HSTS with helmet
app.use(helmet({
  hsts: {
    maxAge: 31536000,           // 1 year
    includeSubDomains: true,    // Apply to all subdomains
    preload: true               // Enable HSTS preload
  }
}));

// Redirect HTTP to HTTPS
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.secure) {
    return res.redirect(301, \`https://\${req.hostname}\${req.originalUrl}\`);
  }
  next();
});

// HTTPS server configuration with strong TLS
const httpsOptions = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  // Disable weak protocols
  secureProtocol: 'TLS_method',
  secureOptions: 
    https.constants.SSL_OP_NO_TLSv1 |
    https.constants.SSL_OP_NO_TLSv1_1 |
    https.constants.SSL_OP_NO_SSLv2 |
    https.constants.SSL_OP_NO_SSLv3,
  // Use strong cipher suites only
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305'
  ].join(':')
};

https.createServer(httpsOptions, app).listen(443);`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement restrictive CORS policy',
      description: 'Replace wildcard CORS (*) with an explicit allowlist of trusted origins. Configure CORS credentials appropriately and restrict HTTP methods and headers.',
      code: `// TypeScript - Restrictive CORS policy
import cors from 'cors';
import express from 'express';

const app = express();

// Define allowed origins based on environment
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://www.example.com',
      'https://app.example.com'
    ])
  : ['http://localhost:3000', 'http://localhost:8080'];

// Validate origins at startup
if (process.env.NODE_ENV === 'production') {
  if (ALLOWED_ORIGINS.includes('*')) {
    throw new Error('FATAL: Wildcard CORS origin is not allowed in production!');
  }
}

// Configure CORS with restrictive policy
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,  // Allow cookies/auth headers
  maxAge: 86400       // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Alternative: Manual CORS for more control
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Configure security headers middleware',
      description: 'Use a security headers middleware to set all recommended HTTP security headers including X-Frame-Options, Content-Security-Policy, X-Content-Type-Options, and other protective headers.',
      code: `// TypeScript - Security headers middleware
import express from 'express';
import helmet from 'helmet';

const app = express();

// Comprehensive security headers with helmet
app.use(helmet({
  // Content Security Policy - controls resources the browser can load
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  
  // Prevent framing/clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // Cross-Origin policies
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  
  // Disable DNS prefetching
  dnsPrefetchControl: { allow: false },
  
  // Hide X-Powered-By header
  hidePoweredBy: true
}));

// Additional manual headers if needed
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Prevent caching of sensitive pages
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Additional protection headers
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
});`,
      difficulty: 'Easy'
    }
  ],
  verification_steps: [
    'Confirm debug mode is disabled in production by checking that error responses return generic messages without stack traces or internal details.',
    'Verify HTTPS enforcement by accessing the application via HTTP and confirming automatic redirect to HTTPS with a 301 status code.',
    'Test CORS policy by sending a cross-origin request from an unauthorized domain and confirming the response lacks Access-Control-Allow-Origin header or is rejected.',
    'Scan HTTP response headers to verify all security headers are present (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Strict-Transport-Security) with correct values.',
    'Run a TLS configuration test (e.g., SSL Labs, testssl.sh) to confirm TLS 1.2+ is enforced, weak ciphers are disabled, and certificates are valid.'
  ],
  related_audit_rules: ['AR-002', 'AR-003'],
  related_pentest_rules: ['PT-001', 'PT-007'],
  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-16', 'CWE-209', 'CWE-614', 'CWE-942'],
  owasp_categories: [
    'A05:2021 - Security Misconfiguration',
    'A09:2021 - Security Logging and Monitoring Failures'
  ],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
