/**
 * PT-005: API Abuse Testing
 * 
 * Detects API abuse patterns that automated scanners typically miss.
 * Simulates attacker perspective for exploiting API design flaws.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const APIAbuseRule: AuditRule = {
  id: 'PT-005',
  name: 'API Abuse Testing',
  description: 'Detect API abuse patterns that automated scanners typically miss.',
  detail: 'Checks for mass assignment, over-exposed data, rate limit bypass, GraphQL abuse, parameter pollution, and batch request abuse in API endpoints.',

  triggers: {
    patterns: [
      'Mass assignment: User.create(req.body)',
      'Response data: res.json(user) without field filtering',
      'GraphQL endpoint: app.use("/graphql", graphqlHTTP)',
      'Batch operations: Promise.all(requests.map(fn))',
      'Pagination without limit: Model.find().skip(offset)',
      'API key validation: if (req.query.api_key)',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['express', 'apollo-graphql', 'spring-boot', 'fastapi', 'django-rest'],
    keywords: ['graphql', 'batch', 'pagination', 'api-key', 'rate-limit', 'throttle', 'query'],
  },

  checks: [
    {
      order: 1,
      name: 'Mass Assignment Detection',
      condition: 'Check if request body is directly passed to model creation or update without field filtering',
      questions: [
        'Is req.body or equivalent directly passed to model.create() or model.update()?',
        'Are sensitive fields (role, isAdmin, balance) excluded from user input?',
        'Is there an explicit whitelist of allowed fields for each endpoint?'
      ],
      failureIndicators: [
        'User.create(req.body) or User.update(req.params.id, req.body)',
        'No field filtering or sanitization before database operations',
        'Sensitive fields accepted from user input without admin privileges'
      ],
      successIndicators: [
        'Explicit field selection: pick(req.body, ["name", "email", "bio"])',
        'Schema validation with allowed fields only',
        'Separate DTOs for input vs output'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'Response Data Over-Exposure',
      condition: 'Check if API responses include more data than necessary',
      questions: [
        'Does the API return the full object including sensitive fields (password, email, phone)?',
        'Is there response field filtering or DTO transformation?',
        'Can users access other users\' data through list endpoints?'
      ],
      failureIndicators: [
        'res.json(user) returns password hash, email, phone, etc.',
        'List endpoints return full objects instead of summary data',
        'No response transformation layer'
      ],
      successIndicators: [
        'Response DTOs or serializers used',
        'Sensitive fields excluded: omit(user, ["password", "resetToken"])',
        'Different response schemas for list vs detail endpoints'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'Rate Limit Bypass',
      condition: 'Check if rate limiting can be bypassed through various techniques',
      questions: [
        'Is rate limiting based on IP, user ID, or API key?',
        'Can rate limits be bypassed by changing IP (X-Forwarded-For header)?',
        'Are there different rate limits for different endpoints based on sensitivity?'
      ],
      failureIndicators: [
        'Rate limiter only uses req.ip (can be spoofed via X-Forwarded-For)',
        'No rate limiting on authentication endpoints',
        'Same rate limit for all endpoints regardless of sensitivity'
      ],
      successIndicators: [
        'Rate limiter uses multiple identifiers (IP + user ID)',
        'Trust proxy configured correctly for X-Forwarded-For',
        'Stricter limits on sensitive endpoints (login, password reset)'
      ],
      criticality: 'important'
    },
    {
      order: 4,
      name: 'GraphQL Abuse',
      condition: 'Check if GraphQL endpoints are vulnerable to query complexity attacks',
      questions: [
        'Is GraphQL introspection enabled in production?',
        'Is there query depth limiting or complexity analysis?',
        'Can a single query request excessive nested data?'
      ],
      failureIndicators: [
        'GraphQL Playground or introspection enabled in production',
        'No query depth limit (e.g., 10+ levels of nesting possible)',
        'No query complexity scoring or timeout'
      ],
      successIndicators: [
        'Introspection disabled in production',
        'Query depth limit enforced (e.g., maxDepth: 5)',
        'Query complexity analysis with maximum cost'
      ],
      criticality: 'important'
    },
    {
      order: 5,
      name: 'Pagination Abuse',
      condition: 'Check if pagination can be abused to extract excessive data',
      questions: [
        'Is there a maximum limit on pagination size?',
        'Can an attacker request all records by setting a very high limit?',
        'Is cursor-based pagination used for large datasets?'
      ],
      failureIndicators: [
        'No limit parameter validation: Model.find().limit(req.query.limit)',
        'Default limit is very high or unlimited',
        'Offset-based pagination allowing full data extraction'
      ],
      successIndicators: [
        'Maximum limit enforced: Math.min(req.query.limit, 100)',
        'Default limit is reasonable (e.g., 20)',
        'Cursor-based pagination for large datasets'
      ],
      criticality: 'important'
    },
    {
      order: 6,
      name: 'Parameter Pollution',
      condition: 'Check if duplicate or conflicting parameters can cause unexpected behavior',
      questions: [
        'How does the API handle duplicate query parameters (e.g., ?id=1&id=2)?',
        'Can array parameters be exploited for injection?',
        'Are conflicting parameters (e.g., sort=asc&sort=desc) handled safely?'
      ],
      failureIndicators: [
        'Duplicate parameters result in array injection',
        'No validation of parameter count or type',
        'Conflicting parameters cause undefined behavior'
      ],
      successIndicators: [
        'Duplicate parameters detected and rejected',
        'Array parameters validated for type and length',
        'Clear precedence rules for conflicting parameters'
      ],
      criticality: 'nice-to-have'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'API endpoint code with request handling and response generation',
      example: 'File: src/routes/users.ts:15 - const user = await User.create(req.body)',
      collection_guidance: 'Identify all endpoints that accept user input and return data'
    },
    {
      type: EvidenceType.API,
      required: true,
      description: 'API endpoint definitions, request/response schemas, and rate limit configuration',
      example: 'POST /api/users accepts any field; GET /api/users returns full user objects',
      collection_guidance: 'Map all API endpoints and their input/output schemas'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response showing API abuse success',
      example: 'POST /api/users with {"role":"admin"} creates admin user; GET /api/users returns password hashes',
      collection_guidance: 'Test endpoints with unexpected fields, excessive pagination, and duplicate parameters'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Implement strict field whitelisting for all input operations',
      code: `const allowedFields = ['name', 'email', 'bio'];
const input = pick(req.body, allowedFields);
const user = await User.create(input);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement response DTOs to filter output data',
      code: `const userDto = {
  id: user.id,
  name: user.name,
  email: user.email
  // password, resetToken, etc. excluded
};
res.json(userDto);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Implement comprehensive rate limiting with multiple identifiers',
      code: `const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip,
  trustProxy: true
});`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Add GraphQL security configuration',
      code: `const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [depthLimit(5), complexityLimit(1000)]
});`,
      difficulty: 'Medium'
    }
  ],

  pentestValidation: {
    description: 'How to validate API abuse during penetration testing',
    attackSteps: [
      'Mass assignment testing: Send POST /api/users with {"role":"admin","isAdmin":true} in addition to normal fields',
      'Response data analysis: Inspect all API responses for sensitive fields like password hashes, internal IDs, email addresses',
      'Rate limit bypass testing: Send requests with different X-Forwarded-For headers to test IP-based rate limiting',
      'GraphQL introspection: Query __schema to get full API structure in production',
      'GraphQL depth attack: Send deeply nested query to test for complexity limits',
      'Pagination abuse: Request 10000 records with ?limit=10000 to test for data extraction',
      'Parameter pollution: Send ?id=1&id=2&role=user&role=admin to test parameter handling'
    ],
    tools: [
      'curl -X POST /api/users -H "Content-Type: application/json" -d \'{"name":"test","role":"admin"}\'',
      'GraphQL Voyager for schema visualization',
      'InQL Burp extension for GraphQL security testing',
      'Custom scripts for parameter pollution testing'
    ],
    expectedFindings: [
      'Mass assignment: Creating user with role=admin grants admin privileges',
      'Over-exposure: GET /api/users returns password hashes and internal tokens',
      'Rate limit bypass: Changing X-Forwarded-For header bypasses IP-based limits',
      'GraphQL introspection: Full schema exposed in production environment',
      'Pagination abuse: All records extractable with high limit parameter'
    ]
  },

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-915', 'CWE-20', 'CWE-770', 'CWE-307'],
  owasp_categories: ['A04:2021 - Insecure Design', 'A08:2021 - Software and Data Integrity Failures'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
