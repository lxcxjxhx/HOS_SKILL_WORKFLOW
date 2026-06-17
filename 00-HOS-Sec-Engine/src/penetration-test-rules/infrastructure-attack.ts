/**
 * PT-007: Infrastructure Attack Vectors
 * 
 * Detects infrastructure-level attack vectors that enable system compromise.
 * Simulates attacker perspective for exploiting deployment and operational weaknesses.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const InfrastructureAttackRule: AuditRule = {
  id: 'PT-007',
  name: 'Infrastructure Attack Vectors',
  description: 'Detect infrastructure-level attack vectors enabling system compromise.',
  detail: 'Checks for hardcoded cloud credentials, container privilege escalation, CI/CD pipeline injection, DNS resolution without validation, and dependency supply chain vulnerabilities.',

  triggers: {
    patterns: [
      'Credential hardcoding: const AWS_KEY = "AKIA..."',
      'Dockerfile: FROM node:latest (unpinned base image)',
      'Container: privileged: true or --privileged flag',
      'CI/CD: ${{ github.event.issue.body }} in workflow',
      'DNS resolution: dns.resolve(req.query.domain)',
      'Dependency: package.json with * or latest version',
      'SSRF in cloud metadata: fetch("http://169.254.169.254/...")',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['docker', 'kubernetes', 'github-actions', 'jenkins', 'aws-sdk', 'azure-sdk'],
    keywords: ['credential', 'docker', 'container', 'pipeline', 'ci-cd', 'dns', 'metadata', 'supply-chain'],
  },

  checks: [
    {
      order: 1,
      name: 'Hardcoded Credential Detection',
      condition: 'Check if cloud credentials, API keys, or secrets are hardcoded in source code',
      questions: [
        'Are AWS access keys, API tokens, or database passwords hardcoded in the codebase?',
        'Are secrets stored in environment files committed to version control?',
        'Is there a secrets management solution (Vault, AWS Secrets Manager) being used?'
      ],
      failureIndicators: [
        'const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"',
        'process.env.DB_PASSWORD || "default_password"',
        'credentials.json or .env committed to repository'
      ],
      successIndicators: [
        'All secrets loaded from secure key management',
        '.env files in .gitignore',
        'Secrets scanning in CI pipeline (e.g., git-secrets, gitleaks)'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'Container Privilege Escalation',
      condition: 'Check if containers run with excessive privileges enabling escape',
      questions: [
        'Does the container run in privileged mode?',
        'Are dangerous capabilities added (SYS_ADMIN, NET_ADMIN)?',
        'Is the container running as root user?'
      ],
      failureIndicators: [
        'docker run --privileged or privileged: true in docker-compose',
        'cap_add: [SYS_ADMIN, NET_ADMIN]',
        'USER root or no USER directive in Dockerfile'
      ],
      successIndicators: [
        'Non-root user specified: USER appuser',
        'Minimal capabilities with cap_drop: [ALL]',
        'Read-only filesystem with tmpfs for writable paths'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'CI/CD Pipeline Injection',
      condition: 'Check if CI/CD pipelines process untrusted input without sanitization',
      questions: [
        'Are GitHub Actions/Jenkins workflows using untrusted input in run commands?',
        'Can pull request titles or comments inject commands into the pipeline?',
        'Are secrets exposed in pipeline logs?'
      ],
      failureIndicators: [
        '${{ github.event.issue.title }} used in run: command',
        'PR description directly used in shell commands',
        'Secrets printed in logs: echo $SECRET'
      ],
      successIndicators: [
        'Untrusted input sanitized before use in scripts',
        'Pull request workflows use limited permissions',
        'Secrets masked in logs'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'DNS Hijacking and Rebinding',
      condition: 'Check if DNS resolution is trusted without validation',
      questions: [
        'Does the application make requests to user-provided hostnames?',
        'Is DNS rebinding protection implemented?',
        'Are internal IP ranges blocked for external requests?'
      ],
      failureIndicators: [
        'fetch(req.query.url) without hostname validation',
        'No check for private IP ranges (10.x, 172.16.x, 192.168.x, 127.x)',
        'DNS resolution performed after initial hostname check'
      ],
      successIndicators: [
        'Hostname resolved and IP validated before request',
        'Private IP ranges blocked',
        'DNS rebinding protection with time-of-check-time-of-use mitigation'
      ],
      criticality: 'important'
    },
    {
      order: 5,
      name: 'Dependency Supply Chain',
      condition: 'Check if dependencies have known vulnerabilities or supply chain risks',
      questions: [
        'Are dependencies regularly scanned for known vulnerabilities?',
        'Is there a lockfile (package-lock.json, yarn.lock) ensuring reproducible builds?',
        'Can an attacker publish a malicious version of a dependency (typosquatting)?'
      ],
      failureIndicators: [
        'No dependency scanning in CI pipeline',
        'No lockfile committed to repository',
        'Dependencies with * or latest version ranges'
      ],
      successIndicators: [
        'Automated dependency scanning (Dependabot, Snyk)',
        'Lockfile committed and enforced',
        'Pinned dependency versions with hash verification'
      ],
      criticality: 'important'
    },
    {
      order: 6,
      name: 'Cloud Metadata Exposure',
      condition: 'Check if cloud instance metadata is accessible to the application',
      questions: [
        'Can the application access cloud provider metadata endpoints?',
        'Is SSRF exploitable to access metadata service (169.254.169.254)?',
        'Is IMDSv2 (token-based) enforced for AWS?'
      ],
      failureIndicators: [
        'No SSRF protection allowing access to 169.254.169.254',
        'IMDSv1 enabled (tokenless metadata access)',
        'No network policy blocking metadata endpoint from application pods'
      ],
      successIndicators: [
        'IMDSv2 enforced (requires token)',
        'Network policies block metadata endpoint',
        'SSRF protection validates destination IPs'
      ],
      criticality: 'must-have'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Code locations where credentials, container config, or CI/CD workflows are defined',
      example: 'File: src/config/aws.ts:5 - accessKeyId: "AKIA...", secretAccessKey: "..."',
      collection_guidance: 'Scan source code and configuration files for hardcoded credentials and insecure settings'
    },
    {
      type: EvidenceType.Configuration,
      required: true,
      description: 'Docker, Kubernetes, CI/CD, and cloud configuration files',
      example: 'Dockerfile with USER root; docker-compose with privileged: true; GitHub Actions with untrusted input',
      collection_guidance: 'Review infrastructure-as-code, container configs, and CI/CD pipeline definitions'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response or network evidence of infrastructure access',
      example: 'SSRF to http://169.254.169.254/latest/meta-data/iam/security-credentials/ returns IAM credentials',
      collection_guidance: 'Test for SSRF to metadata endpoints, DNS resolution behavior, and credential exposure in responses'
    },
    {
      type: EvidenceType.Dependency,
      required: true,
      description: 'Dependency versions and known vulnerabilities',
      example: 'lodash@4.17.15 has prototype pollution vulnerability (CVE-2020-8203)',
      collection_guidance: 'Run npm audit, Snyk, or similar tools to identify vulnerable dependencies'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Remove all hardcoded credentials and use secrets management',
      code: `// Before (BAD):
const aws = new AWS.S3({ accessKeyId: 'AKIA...', secretAccessKey: '...' });

// After (GOOD):
const aws = new AWS.S3(); // Uses IAM role or environment variables
// Or use AWS Secrets Manager:
const secret = await secretsManager.getSecretValue({ SecretId: 'prod/db/credentials' }).promise();`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Harden container security configuration',
      code: `# Dockerfile
FROM node:18-alpine
USER appuser
RUN chmod -R 0555 /app

# docker-compose.yml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Critical,
      action: 'Sanitize untrusted input in CI/CD pipelines',
      code: `# GitHub Actions: Use environment variables instead of direct interpolation
- name: Process PR
  env:
    PR_TITLE: \${{ github.event.pull_request.title }}
  run: |
    echo "\$PR_TITLE" | jq -R . # Sanitize before use`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement dependency scanning and lockfile enforcement',
      description: 'Add npm audit, Dependabot, or Snyk to CI pipeline. Commit and enforce lockfiles.',
      difficulty: 'Easy'
    }
  ],

  pentestValidation: {
    description: 'How to validate infrastructure attack vectors during penetration testing',
    attackSteps: [
      'Credential scanning: Search source code for AWS keys, API tokens, and passwords using regex patterns',
      'Container privilege testing: Check if container runs as root or has SYS_ADMIN capability',
      'CI/CD injection: Create a PR with a title containing $(whoami) or ; ls -la to test for command injection',
      'SSRF to metadata: Send GET /api/proxy?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      'DNS rebinding: Test if application makes requests to user-provided hostnames that can be controlled',
      'Supply chain analysis: Check for outdated dependencies with known CVEs using npm audit or Snyk'
    ],
    tools: [
      'gitleaks or truffleHog for secret scanning',
      'docker inspect <container> for privilege analysis',
      'curl http://169.254.169.254/latest/meta-data/ (from within cloud instance)',
      'npm audit, yarn audit, or Snyk for dependency vulnerability scanning',
      'Container Scanner (Trivy, Grype) for container image analysis'
    ],
    expectedFindings: [
      'Hardcoded AWS credentials found in source code repository',
      'Container running in privileged mode enabling escape to host',
      'CI/CD pipeline executes untrusted input from PR descriptions',
      'SSRF allows access to cloud metadata service returning IAM credentials',
      'Multiple dependencies with known critical vulnerabilities'
    ]
  },

  default_severity: SeverityLevel.Critical,
  cwe_ids: ['CWE-798', 'CWE-250', 'CWE-94', 'CWE-441', 'CWE-829', 'CWE-918'],
  owasp_categories: ['A05:2021 - Security Misconfiguration', 'A06:2021 - Vulnerable and Outdated Components', 'A01:2021 - Broken Access Control'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
