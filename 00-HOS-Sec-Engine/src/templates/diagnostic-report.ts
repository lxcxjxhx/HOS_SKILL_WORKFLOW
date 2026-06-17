/**
 * Diagnostic Report Template
 * 
 * Standardized diagnostic report format for problem categorization and guided diagnosis.
 * Provides a structured way to present diagnostic findings, root cause analysis,
 * remediation plans, and verification steps.
 */

import { SeverityLevel, ProblemCategoryType } from '../schemas/types';

export interface DiagnosticReportInput {
  /** Problem ID */
  problemId: string;
  /** Problem name */
  name: string;
  /** Problem category */
  category: ProblemCategoryType;
  /** Severity level */
  severity: SeverityLevel;
  /** Problem description */
  description: string;
  /** Affected file path */
  file: string;
  /** Affected line number */
  line: number;
  /** Code snippet */
  snippet: string;
  /** Diagnostic process steps taken */
  diagnosticSteps: {
    stepNumber: number;
    stepName: string;
    finding: string;
    evidence: string;
  }[];
  /** Root cause analysis */
  rootCause: string;
  /** Remediation plan */
  remediation: string;
  /** Remediation code example */
  remediationCode?: string;
  /** Verification steps */
  verificationSteps: string[];
  /** Related audit rules */
  relatedAuditRules: string[];
  /** Related pentest rules */
  relatedPentestRules: string[];
}

/**
 * Generate a diagnostic report in Markdown format.
 */
export function generateDiagnosticReport(data: DiagnosticReportInput): string {
  const severityEmoji = {
    [SeverityLevel.Critical]: '🔴',
    [SeverityLevel.High]: '🟠',
    [SeverityLevel.Medium]: '🟡',
    [SeverityLevel.Low]: '🟢',
    [SeverityLevel.Info]: '⚪',
  };

  return `
## Diagnostic Report: ${data.name}

**Problem ID:** ${data.problemId}  
**Category:** ${data.category}  
**Severity:** ${severityEmoji[data.severity] || ''} ${data.severity}

---

### 📍 Affected Location

\`\`\`
File: ${data.file}
Line: ${data.line}
\`\`\`

Relevant Code:
\`\`\`
${data.snippet}
\`\`\`

---

### 📋 Problem Description

${data.description}

---

### 🔍 Diagnostic Process

${data.diagnosticSteps.map((step) => `
#### Step ${step.stepNumber}: ${step.stepName}

**Finding:** ${step.finding}

**Evidence:** ${step.evidence}
`).join('\n')}

---

### 🎯 Root Cause Analysis

${data.rootCause}

---

### 🔧 Remediation Plan

${data.remediation}

${data.remediationCode ? `
**Code Example:**
\`\`\`
${data.remediationCode}
\`\`\`
` : ''}

---

### ✅ Verification Steps

After applying the fix, verify:

${data.verificationSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

### 🔗 Related Rules

**Audit Rules:** ${data.relatedAuditRules.length > 0 ? data.relatedAuditRules.join(', ') : 'None'}

**Pentest Rules:** ${data.relatedPentestRules.length > 0 ? data.relatedPentestRules.join(', ') : 'None'}

---
`.trim();
}

/**
 * Generate a diagnostic report in JSON format.
 */
export function generateDiagnosticReportJSON(data: DiagnosticReportInput): string {
  return JSON.stringify({
    diagnostic: {
      problemId: data.problemId,
      name: data.name,
      category: data.category,
      severity: data.severity,
      location: {
        file: data.file,
        line: data.line,
        snippet: data.snippet,
      },
      description: data.description,
      diagnosticSteps: data.diagnosticSteps,
      rootCause: data.rootCause,
      remediation: {
        plan: data.remediation,
        code: data.remediationCode,
      },
      verificationSteps: data.verificationSteps,
      relatedRules: {
        audit: data.relatedAuditRules,
        pentest: data.relatedPentestRules,
      },
    },
  }, null, 2);
}
