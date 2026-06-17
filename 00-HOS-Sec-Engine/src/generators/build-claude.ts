/**
 * Claude-specific claude-skill.md Generator
 * 
 * Generates a skill formatted specifically for Claude's system prompt format
 * with Claude-optimized instructions and formatting.
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

function formatAuditRuleForClaude(rule: AuditRule): string {
  const checksDetail = rule.checks.map((c) => {
    const questions = c.questions.map((q) => `      - ${q}`).join('\n');
    const failInd = c.failureIndicators.map((f) => `      - ${f}`).join('\n');
    return `    - **Step ${c.order}: ${c.name}**
      条件: ${c.condition}
      关键问题:
${questions}
      失败指标:
${failInd}
      重要度: ${c.criticality}`;
  }).join('\n\n');

  const triggers = rule.triggers.patterns.map((p) => `   - ${p}`).join('\n');
  const cwe = rule.cwe_ids.join(', ');
  const owasp = rule.owasp_categories.join(', ');

  return `#### ${rule.id}: ${rule.name}

- **描述**: ${rule.description}
- **严重程度**: ${rule.default_severity}
- **CWE**: ${cwe}
- **OWASP**: ${owasp}

**触发模式**:
${triggers}

**检查流程**:
${checksDetail}
`;
}

function formatReviewRuleForClaude(rule: ReviewRule): string {
  const questions = rule.questions.map((q) => {
    const answers = q.possible_answers.map((a) => `      - "${a.answer}" -> ${a.meaning}${a.is_false_positive ? ' [误报]' : ''}`).join('\n');
    return `   - **Q**: ${q.question}
      目的: ${q.rationale.trim()}
      可能答案:
${answers}`;
  }).join('\n\n');

  return `#### ${rule.id}: ${rule.name}

- **描述**: ${rule.description}
- **适用范围**: ${rule.applicable_to_rules.join(', ')}

**审核问题**:
${questions}
`;
}

function formatEvidenceStandardForClaude(std: EvidenceStandard): string {
  const guidance = std.collection_guidance.map((g) => `   - ${g.trim().replace(/\n/g, ' ')}`).join('\n');
  const mistakes = std.common_mistakes.slice(0, 3).map((m) => `   - **${m.mistake}**: ${m.correct}`).join('\n');

  return `#### ${std.id}: ${std.name}

- **描述**: ${std.description}
- **必需字段**: ${std.required_fields.join(', ')}

**采集指导**:
${guidance}

**常见错误**:
${mistakes}
`;
}

export function buildClaudeSkill(): string {
  const auditSection = auditRules.map(formatAuditRuleForClaude).join('\n');
  const reviewSection = reviewRules.map(formatReviewRuleForClaude).join('\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandardForClaude).join('\n');

  return `# HOS-Audit-Core: AI Code Audit Rule Engine

**Role**: You are a security code audit assistant powered by HOS-Audit-Core rules.

**Primary directive**: Apply systematic audit procedures, not vulnerability knowledge lookup. Every finding must be supported by a complete evidence chain.

---

## How to Use These Rules

When reviewing code, follow this exact process:

1. **Detect**: Scan code for patterns that match Audit Rule triggers
2. **Analyze**: Execute each check step in sequence — do NOT skip steps
3. **Evidence**: Collect evidence per Evidence Standards before drawing conclusions
4. **Review**: Apply Review Rules to validate findings and filter false positives
5. **Report**: Output structured findings with location, evidence, severity, and remediation

**Critical rules for Claude**:
- NEVER jump to conclusions without following the check flow
- NEVER label something as a vulnerability without evidence
- ALWAYS trace data flow from source to sink
- ALWAYS check for compensating controls before reporting
- State confidence level (High/Medium/Low) for every finding

---

## Audit Rules

These define HOW to check for security issues. Execute checks in order.

${auditSection}

---

## Review Rules

Apply these AFTER audit rules to validate findings.

${reviewSection}

---

## Evidence Standards

These define what constitutes valid evidence. Reference when collecting proof.

${evidenceSection}

---

## Output Format

For each confirmed finding, use this structure:

\`\`\`
### [Severity] Rule-ID: Title
- **Location**: file:line
- **Description**: What was found
- **Evidence**: 
  - Data flow trace (source → sink)
  - Code snippet with context
  - Protection analysis
- **Confidence**: High/Medium/Low
- **Root Cause**: Why this is a problem
- **Remediation**: How to fix it
- **References**: CWE/OWASP mapping
\`\`\`

---

*HOS-Audit-Core v0.1.0 | Generated ${new Date().toISOString().split('T')[0]}*
`;
}
