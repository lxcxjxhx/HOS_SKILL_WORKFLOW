/**
 * PT-006: Social Engineering Attack Surface
 * 
 * Detects vectors that enable social engineering attacks against users.
 * Simulates attacker perspective for exploiting user trust and interaction points.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const SocialEngineeringRule: AuditRule = {
  id: 'PT-006',
  name: 'Social Engineering Attack Surface',
  description: 'Detect vectors enabling social engineering attacks against users.',
  detail: 'Checks for XSS vectors, open redirect vulnerabilities, phishing opportunities, CSRF weaknesses, email/SMS template injection, and file upload without validation that could be exploited in social engineering scenarios.',

  triggers: {
    patterns: [
      'URL redirect: res.redirect(req.query.url) or Response.redirect(url)',
      'HTML output: res.send(`<div>${userInput}</div>`)',
      'Email template: sendEmail(to, `Hello ${name}`)',
      'File upload: multer().single("file") without validation',
      'CSRF: POST endpoint without CSRF token validation',
      'Link generation: `<a href="${userUrl}">Click here</a>`',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['express', 'spring', 'django', 'flask', 'laravel', 'rails'],
    keywords: ['redirect', 'xss', 'csrf', 'upload', 'template', 'email', 'sms', 'link'],
  },

  checks: [
    {
      order: 1,
      name: 'Stored and Reflected XSS Detection',
      condition: 'Check if user input is rendered in HTML/JS without proper escaping',
      questions: [
        'Is user input directly embedded in HTML responses without escaping?',
        'Is innerHTML or equivalent used with user-controlled data?',
        'Are rich text inputs sanitized before storage and display?'
      ],
      failureIndicators: [
        'res.send(`<div>${req.body.comment}</div>`)',
        'element.innerHTML = userContent',
        'No sanitization library used (e.g., DOMPurify, xss)'
      ],
      successIndicators: [
        'Template engine auto-escapes output (e.g., EJS, Pug)',
        'Sanitization library applied to rich text',
        'Content Security Policy (CSP) headers configured'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'Open Redirect Vulnerability',
      condition: 'Check if redirect URLs are derived from user input without validation',
      questions: [
        'Does the application redirect to URLs provided by the user?',
        'Is there a whitelist of allowed redirect destinations?',
        'Can an attacker craft a link that appears to be from the trusted domain but redirects elsewhere?'
      ],
      failureIndicators: [
        'res.redirect(req.query.redirectUrl) without validation',
        'window.location.href = params.next without checking domain',
        'No allowlist for redirect destinations'
      ],
      successIndicators: [
        'Redirect URL validated against allowlist',
        'Only relative paths or known domains allowed',
        'User warned before external redirect'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'CSRF Protection',
      condition: 'Check if state-changing operations are protected against CSRF attacks',
      questions: [
        'Are POST/PUT/DELETE endpoints protected with CSRF tokens?',
        'Is SameSite cookie attribute set on session cookies?',
        'Are custom headers required for API requests?'
      ],
      failureIndicators: [
        'POST /api/users/update accepts request without CSRF token',
        'Session cookie without SameSite attribute',
        'No CORS policy restricting cross-origin requests'
      ],
      successIndicators: [
        'CSRF token required and validated on state-changing requests',
        'SameSite=Strict or Lax on session cookies',
        'CORS policy restricts allowed origins'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'Email/SMS Template Injection',
      condition: 'Check if email/SMS templates can be manipulated by user input',
      questions: [
        'Can user input affect the content of emails sent to other users?',
        'Can an attacker inject links to phishing sites in notification emails?',
        'Are email templates rendered with user-controlled data safely?'
      ],
      failureIndicators: [
        'sendEmail(admin, `New message from ${userInput}: ${message}`)',
        'User-controlled URLs in email links without validation',
        'Template rendering with user input as template variables'
      ],
      successIndicators: [
        'User input escaped in email templates',
        'Links in emails use application domain only',
        'Email content reviewed for injection patterns'
      ],
      criticality: 'important'
    },
    {
      order: 5,
      name: 'File Upload Abuse',
      condition: 'Check if file uploads can be used for phishing or malware distribution',
      questions: [
        'Are uploaded files validated for type and content?',
        'Can users upload HTML/JS files that other users will view?',
        'Are uploaded files served with appropriate Content-Type headers?'
      ],
      failureIndicators: [
        'File upload without content-type or extension validation',
        'HTML files uploaded and served as text/html',
        'Uploaded files served from same domain as application'
      ],
      successIndicators: [
        'File type validated by content (not just extension)',
        'Uploaded files served from separate domain or CDN',
        'Content-Disposition: attachment header on downloaded files'
      ],
      criticality: 'important'
    },
    {
      order: 6,
      name: 'Phishing-Prone Features',
      condition: 'Check if application features can be exploited for phishing attacks',
      questions: [
        'Can users send messages/emails to other users through the platform?',
        'Is there a feature that sends emails appearing to come from the platform?',
        'Can external links in user-generated content be distinguished from internal links?'
      ],
      failureIndicators: [
        'Platform sends user-defined messages to other users without attribution',
        'External links in user content look identical to internal links',
        'No indication that content is user-generated vs platform-generated'
      ],
      successIndicators: [
        'User-generated content clearly labeled',
        'External links open in new tabs with warning',
        'Platform emails have clear sender attribution'
      ],
      criticality: 'nice-to-have'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Code locations where user input is rendered or redirected',
      example: 'File: src/controllers/redirect.ts:10 - res.redirect(req.query.url)',
      collection_guidance: 'Identify all endpoints that render user input or redirect to user-provided URLs'
    },
    {
      type: EvidenceType.Configuration,
      required: true,
      description: 'Security headers configuration (CSP, CORS, SameSite cookies)',
      example: 'CSP header missing or too permissive; CORS allows all origins',
      collection_guidance: 'Check middleware for security headers, cookie settings, and CORS configuration'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response showing XSS, open redirect, or CSRF success',
      example: 'GET /redirect?url=https://evil.com → 302 to evil.com; POST /update without CSRF token → 200 OK',
      collection_guidance: 'Test redirect endpoints with external URLs, inject XSS payloads in inputs, and send POST requests without CSRF tokens'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.High,
      action: 'Implement output encoding for all user-generated content',
      code: `// Use template engine auto-escaping
res.render('profile', { comment: userComment }); // Auto-escaped

// Or manual escaping:
const escaped = escapeHtml(userInput);
res.send(\`<div>\${escaped}</div>\`);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Validate redirect URLs against an allowlist',
      code: `const allowedDomains = ['example.com', 'app.example.com'];
const redirectUrl = req.query.url;
const parsed = new URL(redirectUrl);
if (!allowedDomains.includes(parsed.hostname)) {
  return res.status(400).json({ error: 'Invalid redirect URL' });
}
res.redirect(redirectUrl);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Implement CSRF protection for all state-changing endpoints',
      code: `import csurf from 'csurf';
app.use(csurf({ cookie: true }));
app.post('/api/update', csrfProtection, updateHandler);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Serve uploaded files from a separate domain with safe headers',
      code: `// Set headers for uploaded files
res.setHeader('Content-Disposition', 'attachment');
res.setHeader('Content-Type', 'application/octet-stream');
res.setHeader('X-Content-Type-Options', 'nosniff');`,
      difficulty: 'Medium'
    }
  ],

  pentestValidation: {
    description: 'How to validate social engineering attack surface during penetration testing',
    attackSteps: [
      'XSS testing: Inject <script>alert(1)</script> and <img src=x onerror=alert(1)> into all input fields',
      'Open redirect testing: Send GET /redirect?url=https://evil.com and check if redirect occurs',
      'CSRF testing: Create a form on an external page that submits to a state-changing endpoint without CSRF token',
      'Email injection: Send a message with a phishing link through the platform and check if it appears legitimate',
      'File upload testing: Upload an HTML file with JavaScript and check if it executes when accessed',
      'Link injection: Post a comment with a disguised external link and check if it appears as internal'
    ],
    tools: [
      'XSS detection with DOMPurify test payloads',
      'curl -I "https://target/redirect?url=https://evil.com" to check redirect behavior',
      'CSRF PoC page hosted externally to test cross-site request forgery',
      'Burp Suite for intercepting and modifying requests'
    ],
    expectedFindings: [
      'XSS: User input reflected in HTML without escaping allows JavaScript execution',
      'Open redirect: /redirect?url=https://evil.com successfully redirects to attacker domain',
      'CSRF: POST /api/update can be triggered from external page without token',
      'Email injection: User can send phishing messages through platform email feature',
      'File upload: HTML file uploaded and served as text/html executes JavaScript'
    ]
  },

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-79', 'CWE-601', 'CWE-352', 'CWE-97'],
  owasp_categories: ['A03:2021 - Injection', 'A01:2021 - Broken Access Control'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
