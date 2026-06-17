/**
 * OpenHands Rule Format Generator
 * 
 * Generates openhands-rule.md for OpenHands agent.
 * Formatted for OpenHands' code analysis capabilities.
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

function formatAuditRuleForOpenHands(rule: AuditRule): string {
  const checksXml = rule.checks.map((c) => {
    const questionsXml = c.questions.map((q) => `        <question>${q}</question>`).join('\n');
    const failXml = c.failureIndicators.map((f) => `        <indicator>${f}</indicator>`).join('\n');
    return `      <check>
        <order>${c.order}</order>
        <name>${c.name}</name>
        <condition>${c.condition}</condition>
        <questions>
${questionsXml}
        </questions>
        <failure_indicators>
${failXml}
        </failure_indicators>
        <criticality>${c.criticality}</criticality>
      </check>`;
  }).join('\n');

  const cwe = rule.cwe_ids.join(', ');
  const owasp = rule.owasp_categories.join(', ');

  return `## ${rule.id}: ${rule.name}

<rule>
  <id>${rule.id}</id>
  <name>${rule.name}</name>
  <description>${rule.description}</description>
  <severity>${rule.default_severity}</severity>
  <cwe>${cwe}</cwe>
  <owasp>${owasp}</owasp>
  <triggers>
${rule.triggers.patterns.map((p) => `    <pattern>${p}</pattern>`).join('\n')}
  </triggers>
  <languages>${rule.triggers.languages.join(', ')}</languages>
  <checks>
${checksXml}
  </checks>
  <evidence_requirements>
${rule.evidence_requirements.map((e) => `    <requirement type="${e.type}" required="${e.required}">${e.description}</requirement>`).join('\n')}
  </evidence_requirements>
  <remediations>
${rule.remediations.map((r) => `    <remediation priority="${r.priority}" difficulty="${r.difficulty}">${r.action}</remediation>`).join('\n')}
  </remediations>
</rule>
`;
}

function formatReviewRuleForOpenHands(rule: ReviewRule): string {
  const questionsXml = rule.questions.map((q) => {
    const answersXml = q.possible_answers.map((a) => `        <answer fp="${a.is_false_positive || false}">${a.answer}</answer>`).join('\n');
    return `      <question>
        <text>${q.question}</text>
        <rationale>${q.rationale.trim()}</rationale>
        <answers>
${answersXml}
        </answers>
      </question>`;
  }).join('\n');

  return `## ${rule.id}: ${rule.name}

<rule>
  <id>${rule.id}</id>
  <name>${rule.name}</name>
  <description>${rule.description}</description>
  <applicable_to>${rule.applicable_to_rules.join(', ')}</applicable_to>
  <questions>
${questionsXml}
  </questions>
</rule>
`;
}

function formatEvidenceStandardForOpenHands(std: EvidenceStandard): string {
  return `## ${std.id}: ${std.name}

<standard>
  <id>${std.id}</id>
  <name>${std.name}</name>
  <description>${std.description}</description>
  <required_fields>${std.required_fields.join(', ')}</required_fields>
  <collection_guidance>
${std.collection_guidance.map((g) => `    <step>${g.trim().replace(/\n/g, ' ')}</step>`).join('\n')}
  </collection_guidance>
</standard>
`;
}

export function buildOpenHandsRule(): string {
  const auditSection = auditRules.map(formatAuditRuleForOpenHands).join('\n');
  const reviewSection = reviewRules.map(formatReviewRuleForOpenHands).join('\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandardForOpenHands).join('\n');

  return `# HOS-Audit-Core Security Rules for OpenHands

**Purpose**: Security audit rule set for OpenHands agent code analysis.

**Instructions**: Apply rules systematically. For each finding, collect evidence before concluding.

---

## Audit Rules

${auditSection}

---

## Review Rules

${reviewSection}

---

## Evidence Standards

${evidenceSection}

---

## Agent Workflow

1. Scan code for Audit Rule trigger patterns
2. Execute check steps in order for each triggered rule
3. Collect evidence per Evidence Standards
4. Apply Review Rules to validate findings
5. Output structured findings with: location, evidence, severity, confidence, remediation

---

*HOS-Audit-Core v0.1.0 | Generated ${new Date().toISOString().split('T')[0]}*
`;
}
