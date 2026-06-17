/**
 * Generic skill.md Generator - Dual Mode Support
 * 
 * Generates skill files combining audit rules, review rules, evidence rules,
 * and penetration test rules into a comprehensive Markdown document.
 * 
 * Supports three modes:
 * - 'audit': Code audit only (AR + RR + ER)
 * - 'pentest': Penetration test only (PT + Attack Paths)
 * - 'combined': Both audit and pentest rules (default)
 * 
 * Output format: Anthropic Skills compatible (SKILL.md with YAML frontmatter)
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

import {
  ReconnaissanceRule,
  AuthenticationBypassRule,
  PrivilegeEscalationRule,
  BusinessLogicFlawsRule,
  APIAbuseRule,
  SocialEngineeringRule,
  InfrastructureAttackRule
} from '../penetration-test-rules';

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

const pentestRules: AuditRule[] = [
  ReconnaissanceRule,
  AuthenticationBypassRule,
  PrivilegeEscalationRule,
  BusinessLogicFlawsRule,
  APIAbuseRule,
  SocialEngineeringRule,
  InfrastructureAttackRule
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

function formatAuditRule(rule: AuditRule): string {
  const checks = rule.checks.map((c) => `   - **${c.name}**: ${c.condition}`).join('\n');
  const evidence = rule.evidence_requirements.map((e) => `   - [${e.required ? 'Required' : 'Optional'}] ${e.description}`).join('\n');
  const remediations = rule.remediations.map((r) => `   - [${r.priority}] ${r.action} (Difficulty: ${r.difficulty})`).join('\n');
  const triggers = rule.triggers.patterns.map((p) => `   - \`${p}\``).join('\n');
  const langs = rule.triggers.languages.join(', ');
  const cwe = rule.cwe_ids.join(', ');
  const owasp = rule.owasp_categories.join(', ');

  let pentestSection = '';
  if (rule.pentestValidation) {
    pentestSection = `
**Pentest Validation**:
${rule.pentestValidation.description}
  - Attack Steps: ${rule.pentestValidation.attackSteps.join('\n  - ')}
  - Tools: ${rule.pentestValidation.tools.join(', ')}
`;
  }

  return `### ${rule.id}: ${rule.name}

**Description**: ${rule.description}

**Severity**: ${rule.default_severity} | **CWE**: ${cwe} | **OWASP**: ${owasp}

**Trigger Patterns**:
${triggers}

**Supported Languages**: ${langs}

**Check Flow**:
${checks}

**Evidence Requirements**:
${evidence}

**Remediation**:
${remediations}
${pentestSection}`;
}

function formatReviewRule(rule: ReviewRule): string {
  const questions = rule.questions.map((q) => `   - **${q.question}**: ${q.rationale.trim()}`).join('\n');
  const applicable = rule.applicable_to_rules.join(', ');

  let fpPatterns = '';
  if (rule.false_positive_patterns && rule.false_positive_patterns.length > 0) {
    fpPatterns = rule.false_positive_patterns.map((fp) => {
      const steps = fp.verification_steps.map((s) => `     - ${s}`).join('\n');
      return `   - **${fp.name}**
     Indicators: ${fp.indicators.join(', ')}
     Verification:
${steps}`;
    }).join('\n');
  }

  return `### ${rule.id}: ${rule.name}

**Description**: ${rule.description}

**Scope**: ${applicable}

**Key Questions**:
${questions}

**False Positive Patterns**:
${fpPatterns || '   - (None)'}
`;
}

function formatEvidenceStandard(std: EvidenceStandard): string {
  const collectionGuidance = Array.isArray(std.collection_guidance) ? std.collection_guidance : [std.collection_guidance];
  const guidance = collectionGuidance.map((g) => `   - ${g.trim()}`).join('\n');
  const required = std.required_fields.join(', ');

  return `### ${std.id}: ${std.name}

**Description**: ${std.description}

**Required Fields**: ${required}

**Collection Guidance**:
${guidance}
`;
}

interface SkillOutput {
  dirName: string;
  filename: string;
  content: string;
  description: string;
}

/**
 * Generate all skill outputs in Anthropic Skills format.
 * Each output is a SKILL.md with YAML frontmatter in a subdirectory.
 */
export function buildAllSkills(): SkillOutput[] {
  const outputs: SkillOutput[] = [];

  // 1. Combined skill (audit + pentest)
  outputs.push({
    dirName: 'HOS-Sec-Engine',
    filename: 'SKILL.md',
    content: buildCombinedSkill(),
    description: 'Combined code audit + pentest rules'
  });

  // 2. Audit-only skill
  outputs.push({
    dirName: 'HOS-Sec-Engine/audit',
    filename: 'SKILL.md',
    content: buildAuditSkill(),
    description: 'Code audit rules only'
  });

  // 3. Pentest-only skill
  outputs.push({
    dirName: 'HOS-Sec-Engine/pentest',
    filename: 'SKILL.md',
    content: buildPentestSkill(),
    description: 'Penetration test rules only'
  });

  // 4. Diagnostics skill
  outputs.push({
    dirName: 'HOS-Sec-Engine/diagnostics',
    filename: 'SKILL.md',
    content: buildDiagnosticsSkillContent(),
    description: 'Problem diagnostics rules'
  });

  return outputs;
}

/**
 * Generate skill for backward compatibility (old lowercase skill.md format)
 */
export function buildGenericSkill(mode: 'audit' | 'pentest' | 'combined' = 'combined'): string {
  if (mode === 'audit') return buildAuditSkill();
  if (mode === 'pentest') return buildPentestSkill();
  return buildCombinedSkill();
}

function buildAuditSkill(): string {
  const auditSection = auditRules.map(formatAuditRule).join('\n---\n\n');
  const reviewSection = reviewRules.map(formatReviewRule).join('\n---\n\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandard).join('\n---\n\n');

  const body = `
## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Audit Rules | ${auditRules.length} | AR-001 ~ AR-010 |
| Review Rules | ${reviewRules.length} | RR-001 ~ RR-005 |
| Evidence Standards | ${evidenceStandards.length} | ER-001 ~ ER-006 |

---

## Audit Rules (AR)

${auditSection}

---

## Review Rules (RR)

${reviewSection}

---

## Evidence Standards (ER)

${evidenceSection}

---

## Usage

### Code Audit Mode
1. **Scan** for patterns that trigger Audit Rules (AR-001~AR-010)
2. **Execute** each check step in order
3. **Collect** evidence per Evidence Standards (ER-001~ER-006)
4. **Review** findings using Review Rules (RR-001~RR-005)
5. **Calibrate** severity based on context and defenses

---

*Generated by HOS-Audit-Core | Version 0.3.0 | ${new Date().toISOString().split('T')[0]}*
`;

  return `# HOS-Audit-Core: AI Code Audit Rules

> A rule-based system to enhance AI code audit quality.

---

## Core Philosophy

- **Rules over Knowledge** - Define audit procedures, not vulnerability definitions
- **Process over Conclusion** - Systematic check flows, not one-line judgments
- **Evidence over Assertion** - Every finding requires a complete evidence chain

${body}`;
}

function buildPentestSkill(): string {
  const pentestSection = pentestRules.map(formatAuditRule).join('\n---\n\n');

  return `# HOS-Audit-Core: Penetration Testing Rules

> Attack-focused rules simulating real attacker behavior.

---

## Core Philosophy

- **Attack over Defense** - Think like an attacker, not a defender
- **Chain over Isolate** - Vulnerabilities combine into attack paths
- **Validate over Assume** - Real exploitation confirms theoretical findings

---

## Penetration Test Rules (PT)

${pentestSection}

---

## Usage

### Penetration Test Mode
1. **Recon** using PT-001 to map the attack surface
2. **Test** auth (PT-002), access (PT-003), logic (PT-004), API (PT-005), social (PT-006), infra (PT-007)
3. **Chain** vulnerabilities into attack paths
4. **Validate** audit findings with real exploitation

---

*Generated by HOS-Audit-Core | Version 0.3.0 | ${new Date().toISOString().split('T')[0]}*
`;
}

function buildCombinedSkill(): string {
  const auditSection = auditRules.map(formatAuditRule).join('\n---\n\n');
  const pentestSection = pentestRules.map(formatAuditRule).join('\n---\n\n');
  const reviewSection = reviewRules.map(formatReviewRule).join('\n---\n\n');
  const evidenceSection = evidenceStandards.map(formatEvidenceStandard).join('\n---\n\n');

  const body = `
## Rule Inventory

| Category | Count | IDs |
|----------|-------|-----|
| Audit Rules | ${auditRules.length} | AR-001 ~ AR-010 |
| Penetration Test Rules | ${pentestRules.length} | PT-001 ~ PT-007 |
| Review Rules | ${reviewRules.length} | RR-001 ~ RR-005 |
| Evidence Standards | ${evidenceStandards.length} | ER-001 ~ ER-006 |

---

## Audit Rules (AR) - White Box

${auditSection}

---

## Penetration Test Rules (PT) - Black Box

${pentestSection}

---

## Review Rules (RR)

${reviewSection}

---

## Evidence Standards (ER)

${evidenceSection}

---

## Usage

### Code Audit Mode (White Box)
1. **Scan** for patterns that trigger Audit Rules (AR-001~AR-010)
2. **Execute** each check step in order
3. **Collect** evidence per Evidence Standards (ER-001~ER-006)
4. **Review** findings using Review Rules (RR-001~RR-005)
5. **Calibrate** severity based on context and defenses

### Penetration Test Mode (Black Box)
1. **Recon** using PT-001 to map the attack surface
2. **Test** auth (PT-002), access (PT-003), logic (PT-004), API (PT-005), social (PT-006), infra (PT-007)
3. **Chain** vulnerabilities into attack paths
4. **Validate** audit findings with real exploitation

### Combined Mode
- Run both audit and pentest rules simultaneously
- Use audit findings to guide pentest focus
- Use pentest validation to confirm audit findings

---

*Generated by HOS-Audit-Core | Version 0.3.0 (Dual Core) | ${new Date().toISOString().split('T')[0]}*
`;

  return `# HOS-Audit-Core: AI Code Audit & Penetration Testing Dual Engine

> Not a vulnerability knowledge base. A rule-based system for both white-box code audit and black-box penetration testing.

---

## Core Philosophy

- **Rules over Knowledge** - Define audit procedures, not vulnerability definitions
- **Process over Conclusion** - Systematic check flows, not one-line judgments
- **Evidence over Assertion** - Every finding requires a complete evidence chain
- **Dual Mode** - White-box code audit + Black-box penetration testing

${body}`;
}

function buildDiagnosticsSkillContent(): string {
  const { buildDiagnosticsSkill } = require('./build-diagnostics');
  return buildDiagnosticsSkill();
}
