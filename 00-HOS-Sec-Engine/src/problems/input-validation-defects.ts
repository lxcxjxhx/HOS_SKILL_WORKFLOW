import { DiagnosticGuide, ProblemCategoryType, SeverityLevel, LanguageType } from '../schemas/types';

export const InputValidationDefectsRule: DiagnosticGuide = {
  id: 'PD-001',
  category: ProblemCategoryType.InputValidation,
  name: 'Input Validation Defects',
  description: 'Systematic diagnosis of input validation weaknesses including missing validation, incomplete validation, and bypassable validation patterns.',
  triggers: {
    patterns: [
      'req\\.body',
      'req\\.query',
      'req\\.params',
      'request\\.getParameter',
      'request\\.getInputStream',
      '@RequestBody',
      '@RequestParam',
      '@PathVariable',
      '\\.parse\\(',
      '\\.json\\(',
      'formData',
      'body\\(',
      'form\\('
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
    keywords: ['input', 'request', 'parameter', 'query', 'body', 'form', 'validate', 'sanitize']
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Input Source Identification',
      description: 'Identify all external input sources that the application accepts, including HTTP request parameters, headers, cookies, file uploads, environment variables, and third-party API responses.',
      questions: [
        'What are all the entry points where external data enters the application?',
        'Are there implicit input sources such as headers, cookies, or environment variables?',
        'Does the application process data from third-party services or file systems?',
        'Are all input sources documented and traceable in the codebase?'
      ],
      defect_indicators: [
        'Request parameters used directly without tracking their origin',
        'Implicit trust of data from cookies, headers, or environment variables',
        'No centralized input handling or filtering mechanism',
        'Input sources that are not documented or reviewed'
      ],
      secure_indicators: [
        'All input sources are explicitly identified and documented',
        'Input handling is centralized through middleware or decorators',
        'Clear data flow from input sources to processing logic'
      ]
    },
    {
      order: 2,
      name: 'Validation Mechanism Analysis',
      description: 'Analyze the validation patterns present for each input source, including type checking, format validation, length constraints, and range validation.',
      questions: [
        'Is there any validation applied to each input parameter?',
        'What validation mechanisms are used (regex, schema validation, type casting)?',
        'Are validation rules consistent across all input sources?',
        'Is validation performed on both client-side and server-side?'
      ],
      defect_indicators: [
        'Input parameters used without any validation checks',
        'Validation only present on client-side with no server-side enforcement',
        'Inconsistent validation rules across similar endpoints',
        'Type casting used as validation (e.g., parseInt without range check)',
        'Validation logic that can be bypassed through parameter manipulation'
      ],
      secure_indicators: [
        'All inputs validated against strict schemas before processing',
        'Server-side validation enforced regardless of client-side checks',
        'Validation rules are centralized and reusable across endpoints'
      ]
    },
    {
      order: 3,
      name: 'Bypass Possibility Assessment',
      description: 'Evaluate whether existing validation mechanisms can be bypassed through encoding tricks, parameter pollution, alternative input formats, or race conditions.',
      questions: [
        'Can validation be bypassed through URL encoding, double encoding, or unicode normalization?',
        'Are there alternative code paths that skip validation?',
        'Can parameter pollution or array injection circumvent single-value validation?',
        'Does the application handle unexpected data types gracefully?'
      ],
      defect_indicators: [
        'Validation that only checks for common attack patterns (blacklist approach)',
        'Multiple input processing paths where some skip validation',
        'No handling of array vs scalar parameter type confusion',
        'Encoding or normalization issues that allow bypass',
        'Validation performed after data has already been partially processed'
      ],
      secure_indicators: [
        'Whitelist-based validation that rejects anything not explicitly allowed',
        'Single entry point for input processing with enforced validation',
        'Validation performed before any data processing or storage',
        'Consistent handling of encoding and normalization across all inputs'
      ]
    },
    {
      order: 4,
      name: 'Context-Aware Validation Check',
      description: 'Verify that validation is appropriate for the specific context in which the data will be used, such as database queries, HTML output, file system operations, or command execution.',
      questions: [
        'Is the validation strength appropriate for the data context (SQL, HTML, file path, command)?',
        'Are context-specific encoding or sanitization applied before output?',
        'Does validation account for the downstream use of the data?',
        'Are there defense-in-depth controls at each context boundary?'
      ],
      defect_indicators: [
        'Generic validation applied without considering downstream context',
        'No context-specific encoding before output (SQL, HTML, OS commands)',
        'Single validation point with no defense-in-depth at usage boundaries',
        'Validation rules that do not match the constraints of the target system',
        'Data transformation between validation and usage that weakens validation'
      ],
      secure_indicators: [
        'Context-specific validation and encoding at each usage boundary',
        'Parameterized queries or ORM used for database operations',
        'Output encoding matched to the target context (HTML, JS, CSS, URL)',
        'Defense-in-depth with validation at both input and usage points'
      ]
    }
  ],
  common_root_causes: [
    {
      cause: 'Developer assumed input is trusted',
      explanation: 'Developers often assume that inputs from internal systems, authenticated users, or specific sources are safe, leading to missing or incomplete validation. This assumption breaks down when internal systems are compromised or when trust boundaries change.',
      frequency: 'common'
    },
    {
      cause: 'Validation only on client-side',
      explanation: 'Client-side validation (JavaScript form validation, HTML5 constraints) provides a better user experience but offers zero security guarantee. Attackers can bypass client-side checks by crafting raw HTTP requests directly.',
      frequency: 'common'
    },
    {
      cause: 'Blacklist approach instead of whitelist',
      explanation: 'Using blacklists to block known-bad patterns is inherently incomplete. New attack vectors and encoding techniques constantly emerge, making blacklists a losing strategy. Whitelisting (only allowing known-good patterns) is more robust.',
      frequency: 'common'
    },
    {
      cause: 'Missing type/format validation',
      explanation: 'Developers often validate the presence of input without validating its type, format, or range. For example, accepting a string where a number is expected, or accepting arbitrarily long strings that can cause buffer issues or denial of service.',
      frequency: 'occasional'
    }
  ],
  remediations: [
    {
      priority: SeverityLevel.High,
      action: 'Implement whitelist-based input validation with strict schemas',
      description: 'Define explicit schemas for all input parameters that specify allowed types, formats, ranges, and patterns. Reject any input that does not match the schema exactly.',
      code: `// TypeScript/Node.js - Express with Zod schema validation\nimport { z } from 'zod';\n\n// Define strict input schema\nconst UserInputSchema = z.object({\n  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),\n  email: z.string().email(),\n  age: z.number().int().min(0).max(150),\n  role: z.enum(['user', 'admin', 'moderator'])\n});\n\n// Apply validation middleware\napp.post('/api/users', (req, res) => {\n  const result = UserInputSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ error: 'Invalid input', details: result.error.errors });\n  }\n  const validatedData = result.data;\n  // Process validated input\n});`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Apply context-appropriate input sanitization and encoding',
      description: 'Sanitize and encode input based on the context where it will be used: parameterized queries for SQL, HTML encoding for web output, path validation for file operations.',
      code: `// Python - Context-aware sanitization examples\nfrom html import escape\nimport re\nimport os.path\n\n# SQL: Use parameterized queries (never string concatenation)\ncursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))\n\n# HTML Output: Encode for HTML context\nsafe_html = escape(user_input, quote=True)\n\n# File Path: Validate and sanitize path traversal\nsafe_path = os.path.normpath(os.path.join(BASE_DIR, user_input))\nif not safe_path.startswith(BASE_DIR):\n    raise ValueError("Path traversal detected")\n\n# Command Execution: Avoid if possible, otherwise use allowlist\nallowed_commands = {'ls', 'dir', 'cat'}\nif command not in allowed_commands:\n    raise ValueError("Command not allowed")`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Implement comprehensive type checking and format validation',
      description: 'Ensure all inputs are validated for correct type, format, length, and range before any processing. Use language-specific type systems and validation libraries.',
      code: `// Java - Bean Validation with Hibernate Validator\nimport jakarta.validation.constraints.*;\n\npublic class UserRequest {\n    @NotBlank\n    @Size(min = 3, max = 30)\n    @Pattern(regexp = "^[a-zA-Z0-9_]+$")\n    private String username;\n\n    @Email\n    @NotBlank\n    private String email;\n\n    @Min(0)\n    @Max(150)\n    private Integer age;\n\n    @Pattern(regexp = "^(user|admin|moderator)$")\n    private String role;\n}\n\n// Controller with automatic validation\n@PostMapping("/users")\npublic ResponseEntity<?> createUser(@Valid @RequestBody UserRequest request,\n                                     BindingResult result) {\n    if (result.hasErrors()) {\n        return ResponseEntity.badRequest().body(result.getAllErrors());\n    }\n    return ResponseEntity.ok(userService.create(request));\n}`,
      difficulty: 'Easy'
    }
  ],
  verification_steps: [
    'Review all input entry points and confirm each has explicit validation defined with strict schemas or rules.',
    'Test validation bypass attempts including URL encoding, double encoding, unicode normalization, and parameter pollution to ensure they are properly rejected.',
    'Verify that server-side validation is enforced independently of any client-side validation by sending crafted requests directly to the API.',
    'Confirm that context-specific encoding/sanitization is applied at each data usage boundary (SQL queries, HTML output, file operations, command execution).',
    'Perform negative testing with malformed, oversized, and unexpected type inputs to ensure the application handles them gracefully without errors or data leakage.'
  ],
  related_audit_rules: ['AR-001', 'AR-002', 'AR-009', 'AR-010'],
  related_pentest_rules: ['PT-005', 'PT-006'],
  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-20', 'CWE-138', 'CWE-74'],
  owasp_categories: ['A03:2021 - Injection', 'A05:2021 - Security Misconfiguration'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
