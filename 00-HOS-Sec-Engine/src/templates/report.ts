/**
 * Audit Report Template
 * 
 * 生成标准化的审计报告 Markdown 文档
 * 基于 AuditReport 接口定义
 */

import { AuditReport, SeverityLevel } from '../schemas/types';

/**
 * 生成完整的审计报告 Markdown
 * 
 * @param report - AuditReport 数据
 * @returns Markdown 格式的审计报告
 */
export function generateAuditReportMarkdown(report: AuditReport): string {
  const severityOrder = [
    SeverityLevel.Critical,
    SeverityLevel.High,
    SeverityLevel.Medium,
    SeverityLevel.Low,
    SeverityLevel.Info
  ];

  // 按严重程度组织发现
  const findingsBySeverity: Record<string, typeof report.findings> = {};
  for (const severity of severityOrder) {
    findingsBySeverity[severity] = report.findings.filter(
      f => f.severity === severity
    );
  }

  // 生成发现列表
  const findingsSections = severityOrder
    .filter(severity => findingsBySeverity[severity].length > 0)
    .map(severity => {
      const findings = findingsBySeverity[severity];
      return `### ${severity} (${findings.length})

${findings.map((f, i) => `#### ${severity.toLowerCase()}-${i + 1}: ${f.title}

**Rule ID:** ${f.rule_id}  
**Location:** \`${f.location.file}:${f.location.line}\`  
**Confidence:** ${f.confidence}

**Description:**
${f.description}

**Root Cause:**
${f.root_cause}

**Remediation:**
${f.remediation}${f.remediation_code ? `

**Code Example:**
\`\`\`
${f.remediation_code}
\`\`\`` : ''}

**Verification:**
${f.verification}${f.exploitation ? `

**Exploitation:**
- Prerequisites: ${f.exploitation.prerequisites.join(', ')}
- Steps: ${f.exploitation.steps.join(' → ')}
- Impact: ${f.exploitation.impact}` : ''}

---`).join('\n')}`;
    })
    .join('\n');

  const template = `# ${report.title}

## Executive Summary

${report.executive_summary}

---

## Audit Information

| Item | Details |
|------|---------|
| **Scope** | ${report.scope} |
| **Audit Date** | ${report.audit_date} |

---

## Statistics

### Findings by Severity

| Severity | Count |
|----------|-------|
| Critical | ${report.statistics.by_severity.critical} |
| High | ${report.statistics.by_severity.high} |
| Medium | ${report.statistics.by_severity.medium} |
| Low | ${report.statistics.by_severity.low} |
| Info | ${report.statistics.by_severity.info} |
| **Total** | **${report.statistics.total_findings}** |

### Findings by Confidence

| Confidence | Count |
|------------|-------|
| High | ${report.statistics.by_confidence.high} |
| Medium | ${report.statistics.by_confidence.medium} |
| Low | ${report.statistics.by_confidence.low} |

---

## Findings

${findingsSections}

---

## Recommendations

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

*Report generated on ${report.audit_date}*
`;

  return template.trim();
}

export default { generateAuditReportMarkdown };
