/**
 * OpenCode Rule Format Generator
 * 
 * Generates opencode-rule.md for OpenCode.
 * Compact rule format optimized for OpenCode's processing.
 */

import {
  TaintAnalysisRule,
  InputValidationRule,
  AuthCheckRule,
  CryptoCheckRule,
  DeserializationCheckRule,
  XXECheckRule,
  SSRFCheckRule,
  CommandInjectionCheckRule,
  ExpressionLanguageCheckRule,
  SQLQueryRule
} from '../audit-rules';

import {
  FalsePositiveRule,
  ReachabilityRule,
  ExploitabilityRule,
  SeverityCalibrationRule,
  ContextAnalysisRule
} from '../review-rules';

import {
  SourceCodeEvidenceStandard,
  DataFlowEvidenceStandard,
  ConfigEvidenceStandard,
  APIEvidenceStandard,
  DependencyEvidenceStandard,
  RuntimeEvidenceStandard
} from '../evidence-rules';

import type { AuditRule, ReviewRule, EvidenceStandard } from '../schemas/types';

const auditRules: AuditRule[] = [
  TaintAnalysisRule,
  InputValidationRule,
  AuthCheckRule,
  CryptoCheckRule,
  DeserializationCheckRule,
  XXECheckRule,
  SSRFCheckRule,
  CommandInjectionCheckRule,
  ExpressionLanguageCheckRule,
  SQLQueryRule
];

const reviewRules: ReviewRule[] = [
  FalsePositiveRule,
  ReachabilityRule,
  ExploitabilityRule,
  SeverityCalibrationRule,
  ContextAnalysisRule
];

const evidenceStandards: EvidenceStandard[] = [
  SourceCodeEvidenceStandard,
  DataFlowEvidenceStandard,
  ConfigEvidenceStandard,
  APIEvidenceStandard,
  DependencyEvidenceStandard,
  RuntimeEvidenceStandard
];

function formatAuditRuleForOpenCode(rule: AuditRule): string {
  const checks = rule.checks.map((c) => `[${c.order}] ${c.name} - ${c.condition}`).join('\n');
  const failIndicators = rule.checks.map((c) => `  - ${c.failureIndicators[0]}`).join('\n');
  const remediation = rule.remediations[0].action;
  const cwe = rule.cwe_ids.join(', ');

  return `## ${rule.id}: ${rule.name}

- **Severity**: ${rule.default_severity}
- **CWE**: ${cwe}
- **OWASP**: ${rule.owasp_categories.join(', ')}
- **Triggers**: ${rule.triggers.patterns.slice(0, 2).join(' | ')}
- **Languages**: ${rule.triggers.languages.join(', ')}

### Checks
${checks}

### Failure Indicators
${failIndicators}

### Remediation
${remediation}
`;
}

function formatReviewRuleForOpenCode(rule: ReviewRule): string {
  const questions = rule.questions.map((q) => `- ${q.question}`).join('\n');

  return `## ${rule.id}: ${rule.name}

- **Applies to**: ${rule.applicable_to_rules.join(', ')}
- **Description**: ${rule.description}

### Questions
${questions}
`;
}

function formatEvidenceStandardForOpenCode(std: EvidenceStandard): string {
  return `## ${std.id}: ${std.name}

- **Description**: ${std.description}
- **Required fields**: ${std.required_fields.join(', ')}
- **Common mistakes**: ${std.common_mistakes.slice(0, 2).map((m) => m.mistake).join(', ')}
`;
}

export function buildOpenCodeRule(): string {
  const auditSection = auditRules.map(formatAuditRuleForOpenCode).join('\n');
  const reviewSection = reviewRules.map(formatReviewRuleForOpenCode).join('\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandardForOpenCode).join('\n');

  return `# HOS-Audit-Core Rules for OpenCode

## Security Audit Rules

### Principles
- **Process over Conclusion**: Follow check flows, don't jump to conclusions
- **Evidence over Assertion**: Every finding needs file path, line number, code context
- **Rules over Knowledge**: Apply audit procedures, not vulnerability definitions

---

## Audit Rules (Detection)

${auditSection}

---

## Review Rules (Validation)

${reviewSection}

---

## Evidence Standards

${evidenceSection}

---

## Output Template

\`\`\`
[FINDING]
rule: AR-XXX
severity: Critical/High/Medium/Low
confidence: High/Medium/Low
location: file:line
issue: description
evidence: code context + data flow
root_cause: why this is a problem
fix: remediation
\`\`\`

---

*HOS-Audit-Core v0.1.0 | Generated ${new Date().toISOString().split('T')[0]}*
`;
}
