/**
 * PT-001: Information Gathering / Reconnaissance
 * 
 * Detects information exposure patterns that enable attackers during reconnaissance phase.
 * Simulates attacker perspective for discovering system attack surface.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const ReconnaissanceRule: AuditRule = {
  id: 'PT-001',
  name: 'Information Gathering / Reconnaissance',
  description: 'Detect information exposure patterns that help attackers during the reconnaissance phase.',
  detail: 'Checks for sensitive data exposure through error messages, stack traces, API documentation, version headers, and configuration files that could help an attacker map the attack surface.',

  triggers: {
    patterns: [
      'Error message exposure: res.send(error.message)',
      'Stack trace in response: console.log(stack) to client',
      'Version headers: X-Powered-By, Server headers',
      'API documentation exposed: /swagger, /graphql, /api-docs',
      'Debug mode enabled: app.set("view options", { debug: true })',
      'Source maps in production: .map files accessible',
      'Environment files exposed: .env, .git, .DS_Store accessible',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    keywords: ['error', 'stack', 'trace', 'debug', 'powered-by', 'swagger', 'graphql'],
  },

  checks: [
    {
      order: 1,
      name: 'Error Message Exposure Detection',
      condition: 'Check if error messages or stack traces are exposed to end users',
      questions: [
        'Are error messages sent directly to HTTP responses?',
        'Do error responses contain file paths, SQL queries, or stack traces?',
        'Is there a global error handler that sanitizes error output?'
      ],
      failureIndicators: [
        'res.send(err.message) or res.json({ error: err })',
        'No error sanitization middleware',
        'Stack traces visible in production responses'
      ],
      successIndicators: [
        'Generic error messages returned to client',
        'Detailed errors logged server-side only',
        'Error handler strips sensitive details'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'HTTP Header Information Leakage',
      condition: 'Check if HTTP headers expose technology stack details',
      questions: [
        'Does the server send X-Powered-By, X-AspNet-Version, or Server headers?',
        'Are framework versions disclosed in responses?',
        'Is there middleware to remove or obfuscate identifying headers?'
      ],
      failureIndicators: [
        'X-Powered-By: Express or similar header present',
        'Server: nginx/1.18.0 (exact version disclosed)',
        'No helmet.js or equivalent security headers middleware'
      ],
      successIndicators: [
        'helmet() or equivalent middleware applied',
        'X-Powered-By header removed',
        'Server header generic or removed'
      ],
      criticality: 'important'
    },
    {
      order: 3,
      name: 'API Documentation Exposure',
      condition: 'Check if API documentation endpoints are accessible without authentication',
      questions: [
        'Are /swagger, /api-docs, /graphql endpoints publicly accessible?',
        'Is API documentation protected behind authentication?',
        'Are debug/test endpoints left exposed in production?'
      ],
      failureIndicators: [
        'swaggerUi.serve accessible without auth',
        '/graphql endpoint with introspection enabled in production',
        '/actuator, /metrics, /health endpoints publicly accessible'
      ],
      successIndicators: [
        'API docs require authentication',
        'GraphQL introspection disabled in production',
        'Admin endpoints restricted to internal network'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'Source Code and Configuration Exposure',
      condition: 'Check if sensitive files are accessible via web server',
      questions: [
        'Are .env, .git, .DS_Store, or .map files accessible?',
        'Does the web server configuration block access to hidden files?',
        'Are source map files deployed to production?'
      ],
      failureIndicators: [
        '.env file accessible at http://target/.env',
        '.git/ directory browsable',
        'Source maps (.js.map) deployed to production'
      ],
      successIndicators: [
        'Web server blocks access to dotfiles',
        'Source maps not deployed or require authentication',
        'Sensible default deny rules configured'
      ],
      criticality: 'must-have'
    },
    {
      order: 5,
      name: 'Debug Mode and Verbose Logging',
      condition: 'Check if debug mode or verbose logging is enabled in production',
      questions: [
        'Is debug mode enabled in production configuration?',
        'Are verbose logs written to client-facing responses?',
        'Is there a mechanism to disable debug features in production?'
      ],
      failureIndicators: [
        'NODE_ENV=debug or DEBUG=* in production',
        'app.set("trust proxy", true) without validation',
        'Verbose SQL logging in production responses'
      ],
      successIndicators: [
        'Debug features controlled by environment variables',
        'Production config disables all debug output',
        'Feature flags for debug functionality'
      ],
      criticality: 'important'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Location where information exposure occurs in code',
      example: 'File: src/middleware/errorHandler.ts:15 - res.status(500).json({ error: err.stack })',
      collection_guidance: 'Identify the exact line where sensitive data is sent to client response'
    },
    {
      type: EvidenceType.Configuration,
      required: true,
      description: 'Server and application configuration that controls information exposure',
      example: 'app.use(helmet()) or absence thereof; nginx config blocking dotfiles',
      collection_guidance: 'Check middleware setup, web server config, and environment settings'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP response headers and error responses that reveal information',
      example: 'HTTP/1.1 500 Internal Server Error\nX-Powered-By: Express\n{"error":"TypeError: Cannot read property..."}',
      collection_guidance: 'Capture actual HTTP responses, especially error responses, and inspect headers'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.High,
      action: 'Implement centralized error handling that sanitizes error messages',
      code: `app.use((err, req, res, next) => {
  logger.error(err); // Log detailed error server-side
  res.status(500).json({ error: 'Internal server error' }); // Generic message to client
});`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Remove or obfuscate identifying HTTP headers',
      code: `app.use(helmet());
// Or manually:
app.disable('x-powered-by');`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Protect API documentation and debug endpoints',
      code: `if (process.env.NODE_ENV === 'production') {
  app.disable('swagger');
  app.disable('graphql-introspection');
}`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Configure web server to block access to sensitive files',
      description: 'Add nginx/Apache rules to deny access to .env, .git, .map files',
      difficulty: 'Easy'
    }
  ],

  pentestValidation: {
    description: 'How to validate information exposure during penetration testing',
    attackSteps: [
      'Send a request to a non-existent endpoint to trigger error handling: GET /api/nonexistent',
      'Inspect the HTTP response headers for X-Powered-By, Server, and other identifying headers',
      'Send a malformed request to trigger error: GET /api/users?id=\'" OR 1=1--',
      'Try to access common sensitive files: GET /.env, GET /.git/config, GET /swagger.json',
      'Check if API documentation is accessible without authentication',
      'Use tools like builtwith, Wappalyzer, or custom scripts to fingerprint the technology stack'
    ],
    tools: [
      'curl -v https://target/api/endpoint (inspect headers)',
      'gobuster dir -u https://target -w common.txt (directory brute force)',
      'whatweb https://target (technology fingerprinting)',
      'Nuclei templates for information disclosure detection'
    ],
    expectedFindings: [
      'X-Powered-By header reveals framework and version',
      'Error responses contain stack traces or SQL queries',
      '.env file accessible containing database credentials',
      'Swagger UI accessible without authentication exposing full API schema'
    ]
  },

  default_severity: SeverityLevel.Medium,
  cwe_ids: ['CWE-200', 'CWE-209', 'CWE-215'],
  owasp_categories: ['A01:2021 - Broken Access Control', 'A05:2021 - Security Misconfiguration'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
