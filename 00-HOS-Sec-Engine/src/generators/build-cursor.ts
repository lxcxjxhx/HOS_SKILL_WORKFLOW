/**
 * Cursor Rules Format Generator
 * 
 * Generates cursor-rule.md in Cursor's .cursorrules format.
 * Focus on concise, actionable rules that Cursor can use during code review.
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

function formatAuditRuleForCursor(rule: AuditRule): string {
  const checksShort = rule.checks.map((c) => `  ${c.order}. ${c.name}: ${c.condition}`).join('\n');
  const failInd = rule.checks.filter((c) => c.criticality === 'must-have').map((c) => c.failureIndicators[0]).join('; ');
  const cwe = rule.cwe_ids.join(', ');

  return `### ${rule.id} ${rule.name} (${rule.default_severity})

**触发**: ${rule.triggers.patterns[0]}

**检查步骤**:
${checksShort}

**关键失败指标**: ${failInd}

**CWE**: ${cwe} | **修复**: ${rule.remediations[0].action}
`;
}

function formatReviewRuleForCursor(rule: ReviewRule): string {
  const topQuestions = rule.questions.slice(0, 3).map((q) => `  - ${q.question}`).join('\n');

  return `### ${rule.id} ${rule.name}

**适用**: ${rule.applicable_to_rules.join(', ')}

**核心问题**:
${topQuestions}
`;
}

function formatEvidenceStandardForCursor(std: EvidenceStandard): string {
  const fields = std.required_fields.join(', ');

  return `### ${std.id} ${std.name}

**必需字段**: ${fields}
`;
}

export function buildCursorRule(): string {
  const auditSection = auditRules.map(formatAuditRuleForCursor).join('\n');
  const reviewSection = reviewRules.map(formatReviewRuleForCursor).join('\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandardForCursor).join('\n');

  return `# HOS-Audit-Core Security Rules for Cursor

## Security Audit Checklist

When reviewing code for security issues, follow these rules systematically.

### General Principles
- Always trace data flow from input source to sink
- Every finding requires evidence: file path, line number, code context
- Check for compensating controls before flagging a vulnerability
- State confidence level for every finding
- Apply Review Rules to filter false positives

---

## Audit Rules

${auditSection}

---

## Review Rules (False Positive Filtering)

Apply these rules AFTER audit rules to validate findings.

${reviewSection}

---

## Evidence Standards

Every security finding must meet these evidence standards.

${evidenceSection}

---

## Finding Report Template

When reporting a security issue:

\`\`\`
### [SEVERITY] Rule-ID: Finding Title
- **File**: path/to/file.ts:line
- **Issue**: Brief description
- **Evidence**: Code snippet + data flow
- **Confidence**: High/Medium/Low
- **Fix**: Recommended solution
\`\`\`
`;
}
