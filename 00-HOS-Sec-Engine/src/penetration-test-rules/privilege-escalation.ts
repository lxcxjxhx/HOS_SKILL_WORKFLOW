/**
 * PT-003: Privilege Escalation Testing
 * 
 * Detects authorization weaknesses enabling horizontal/vertical privilege escalation.
 * Simulates attacker perspective for testing access controls.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const PrivilegeEscalationRule: AuditRule = {
  id: 'PT-003',
  name: 'Privilege Escalation Testing',
  description: 'Detect authorization weaknesses enabling horizontal/vertical privilege escalation.',
  detail: 'Checks for IDOR, missing authorization middleware, role-based access control flaws, admin endpoint exposure, and mass assignment vulnerabilities affecting authorization.',

  triggers: {
    patterns: [
      'Object access by ID: User.findById(req.params.id)',
      'Role-based checks: if (user.role === "admin")',
      'Authorization middleware: authMiddleware, requireRole',
      'Admin routes: router.get("/admin/*", adminOnly)',
      'Request body to object: Object.assign(user, req.body)',
      'Query parameter used directly: WHERE userId = req.query.userId',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['express', 'spring-security', 'django', 'asp.net'],
    keywords: ['role', 'admin', 'authorize', 'permission', 'access', 'policy', 'guard'],
  },

  checks: [
    {
      order: 1,
      name: 'Object-Level Access Control (IDOR)',
      condition: 'Check if objects are accessed by user-controllable ID without ownership verification',
      questions: [
        'Does the endpoint accept an ID from the request and directly use it to fetch data?',
        'Is there a check that the requesting user owns or has access to the requested object?',
        'Can a user access another user\'s data by changing the ID parameter?'
      ],
      failureIndicators: [
        'User.findById(req.params.id) without ownership check',
        'No authorization check after authentication',
        'Sequential or predictable IDs accessible to any authenticated user'
      ],
      successIndicators: [
        'Ownership verified: if (user.id === requestedUserId)',
        'Policy-based access control (e.g., CASL, ABAC) applied',
        'UUIDs instead of sequential IDs'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'Vertical Privilege Escalation',
      condition: 'Check if role-based access controls can be bypassed to access admin functionality',
      questions: [
        'Are admin endpoints protected by authorization middleware?',
        'Can a regular user access admin routes by directly accessing the URL?',
        'Is the role check performed on every admin request, not just at route registration?'
      ],
      failureIndicators: [
        'Admin routes without requireAdmin middleware',
        'Role check only at UI level, not at API level',
        'Admin functionality accessible via API even if UI hides it'
      ],
      successIndicators: [
        'Admin routes protected by requireRole("admin") middleware',
        'Role verification on every request server-side',
        'Principle of least privilege applied'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'Role Parameter Manipulation',
      condition: 'Check if role or permission fields can be modified by the user in requests',
      questions: [
        'Can a user modify their own role in a PUT/PATCH request?',
        'Is the request body filtered before applying to the user object?',
        'Are role/permission fields excluded from mass assignment?'
      ],
      failureIndicators: [
        'Object.assign(user, req.body) without field filtering',
        'User model.update(req.params.id, req.body) with no field whitelist',
        'Role field accepted from user input in profile update'
      ],
      successIndicators: [
        'Explicit field whitelist: pick(req.body, ["name", "email"])',
        'Role fields excluded from user-controlled endpoints',
        'Admin-only endpoints for role modifications'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'Horizontal Privilege Escalation',
      condition: 'Check if users can access or modify data belonging to other users at the same privilege level',
      questions: [
        'Can User A access User B\'s orders, messages, or profile by changing IDs?',
        'Is tenant isolation enforced in multi-tenant applications?',
        'Are shared resources properly scoped to the current user or organization?'
      ],
      failureIndicators: [
        'Order.find(req.params.orderId) without checking order.userId',
        'No tenant_id filter in multi-tenant queries',
        'Shared workspace resources accessible without membership verification'
      ],
      successIndicators: [
        'All queries scoped: Order.find({ id: req.params.id, userId: req.user.id })',
        'Tenant isolation enforced at database query level',
        'Resource access verified against user membership'
      ],
      criticality: 'must-have'
    },
    {
      order: 5,
      name: 'Authorization Middleware Placement',
      condition: 'Check if authorization checks are consistently applied across all protected endpoints',
      questions: [
        'Are all protected routes wrapped with authorization middleware?',
        'Are there any routes that skip authorization checks?',
        'Is authorization checked before or after the business logic?'
      ],
      failureIndicators: [
        'Some routes without auth/role middleware',
        'Authorization check after business logic (TOCTOU)',
        'Inconsistent middleware application across routes'
      ],
      successIndicators: [
        'All protected routes use auth middleware consistently',
        'Authorization checked before business logic',
        'Default-deny policy with explicit allow rules'
      ],
      criticality: 'important'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Authorization code location and access control implementation',
      example: 'File: src/routes/admin.ts:10 - router.get("/users", getUserList) // Missing auth middleware',
      collection_guidance: 'Check all route definitions for authorization middleware presence'
    },
    {
      type: EvidenceType.API,
      required: true,
      description: 'API endpoint definitions and access control requirements',
      example: 'GET /api/users/:id - no ownership check; PATCH /api/profile - accepts role field',
      collection_guidance: 'Map all API endpoints and their access control requirements'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response showing privilege escalation success',
      example: 'GET /api/admin/users as regular user → 200 OK with user list; PATCH /api/profile with {"role":"admin"} → 200 OK',
      collection_guidance: 'Send requests with modified IDs, roles, and paths to test access controls'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Implement object-level authorization for all data access',
      code: `async function getOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id  // Ownership check
  });
  if (!order) return res.status(403).json({ error: 'Access denied' });
}`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.Critical,
      action: 'Apply authorization middleware consistently to all protected routes',
      code: `router.get('/admin/*', requireRole('admin'), adminHandler);
router.get('/api/users/:id', authenticate, checkOwnership, userHandler);`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement field-level filtering to prevent mass assignment of role fields',
      code: `const allowedFields = ['name', 'email', 'avatar'];
const updates = pick(req.body, allowedFields);
await User.findByIdAndUpdate(req.user.id, updates);`,
      difficulty: 'Easy'
    }
  ],

  pentestValidation: {
    description: 'How to validate privilege escalation during penetration testing',
    attackSteps: [
      'Authenticate as a regular user and enumerate accessible endpoints',
      'Test IDOR: Access another user\'s resource by changing the ID parameter (e.g., /api/users/1 to /api/users/2)',
      'Test vertical escalation: Access admin endpoints directly (e.g., /api/admin/users, /api/admin/settings)',
      'Test role manipulation: Send PATCH /api/profile with {"role": "admin"} or {"isAdmin": true}',
      'Test JWT manipulation: Modify role claims in JWT token and replay',
      'Test tenant isolation: Access resources from another tenant by changing tenant_id in requests',
      'Test API method bypass: If GET /resource is protected, try POST, PUT, DELETE on the same endpoint'
    ],
    tools: [
      'Burp Suite AuthMatrix extension for authorization testing',
      'Autorize Burp plugin for automatic authorization bypass detection',
      'curl -H "Authorization: Bearer <user_token>" https://target/api/admin/users',
      'Postman collection with different user tokens for automated testing'
    ],
    expectedFindings: [
      'IDOR: User A can access User B\'s data by changing resource ID',
      'Vertical escalation: Admin endpoints accessible without admin role',
      'Mass assignment: User can elevate own role via profile update request',
      'Missing authorization: Some endpoints have no auth middleware',
      'JWT role manipulation: Changing role in JWT grants elevated privileges'
    ]
  },

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-269', 'CWE-285', 'CWE-639', 'CWE-862'],
  owasp_categories: ['A01:2021 - Broken Access Control'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
