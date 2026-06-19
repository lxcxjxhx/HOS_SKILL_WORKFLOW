import { OrchestrationResult, Finding } from '../types/playbook';

/**
 * 安全审计报告生成器
 * 将 OrchestrationResult 转换为 Markdown、HTML、JSON 和管理层摘要格式
 */
export class ReportGenerator {

  /**
   * 生成 Markdown 格式审计报告
   * @param result 流程执行结果
   * @returns Markdown 格式审计报告
   */
  static generateMarkdown(result: OrchestrationResult): string {
    const lines: string[] = [];

    // 标题
    lines.push('# 安全审计报告');
    lines.push('');

    // 执行概况
    lines.push('## 执行概况');
    lines.push(`- **流程名称**: ${result.playbookName}`);
    lines.push(`- **目标**: ${result.target}`);
    lines.push(`- **执行时间**: ${result.startTime} - ${result.endTime}`);
    lines.push(`- **状态**: ${this.translateStatus(result.status)}`);
    lines.push('');

    // 发现摘要
    lines.push('## 发现摘要');
    const summary = result.summary;
    lines.push('| 级别 | 数量 |');
    lines.push('|------|------|');
    lines.push(`| Critical | ${summary.criticalFindings} |`);
    lines.push(`| High | ${summary.highFindings} |`);
    lines.push(`| Medium | ${summary.mediumFindings} |`);
    lines.push(`| Low | ${summary.lowFindings} |`);
    lines.push(`| **总计** | **${summary.criticalFindings + summary.highFindings + summary.mediumFindings + summary.lowFindings}** |`);
    lines.push('');

    // 阶段执行详情
    lines.push('## 阶段执行详情');
    lines.push('');
    for (const phase of result.phaseResults) {
      const statusIcon = phase.status === 'completed' ? '✅ 完成'
        : phase.status === 'skipped' ? '⏭ 跳过' : '❌ 失败';
      lines.push(`### Phase ${phase.phaseId}: ${phase.phaseName} [${statusIcon}]`);
      lines.push(`- **执行 Skill 数**: ${phase.skillsExecuted.length}`);
      lines.push(`- **持续时间**: ${phase.duration}`);
      lines.push('');

      if (phase.findings.length > 0) {
        lines.push('- **发现**:\n');
        for (const finding of phase.findings) {
          const severityBadge = this.severityBadge(finding.severity);
          lines.push(`  - [${severityBadge}] ${finding.description}`);
        }
        lines.push('');
      }
    }

    // 详细发现
    const allFindings = this.collectAllFindings(result);
    if (allFindings.length > 0) {
      lines.push('## 详细发现');
      lines.push('');
      for (let i = 0; i < allFindings.length; i++) {
        const f = allFindings[i];
        lines.push(`### 发现 ${i + 1}`);
        lines.push(`- **来源**: ${f.skillId}`);
        lines.push(`- **严重程度**: ${f.severity}`);
        lines.push(`- **描述**: ${f.description}`);
        lines.push(`- **证据**: ${f.evidence}`);
        lines.push(`- **时间**: ${f.timestamp}`);
        lines.push('');
      }
    }

    // 修复建议
    if (result.recommendations.length > 0) {
      lines.push('## 修复建议');
      for (let i = 0; i < result.recommendations.length; i++) {
        lines.push(`${i + 1}. ${result.recommendations[i]}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 生成 HTML 格式报告
   * @param result 流程执行结果
   * @returns HTML 格式报告
   */
  static generateHTML(result: OrchestrationResult): string {
    const summary = result.summary;
    const totalFindings = summary.criticalFindings + summary.highFindings +
      summary.mediumFindings + summary.lowFindings;
    const allFindings = this.collectAllFindings(result);

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>安全审计报告 - ${result.playbookName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; color: #333; }
    h1 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #2c3e50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .summary-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .severity-critical { color: #e74c3c; font-weight: bold; }
    .severity-high { color: #e67e22; font-weight: bold; }
    .severity-medium { color: #f1c40f; font-weight: bold; }
    .severity-low { color: #3498db; }
    .finding-card { background-color: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .phase { margin-bottom: 20px; }
    ol { padding-left: 20px; }
  </style>
</head>
<body>
`;

    // 标题
    html += `<h1>安全审计报告</h1>\n`;

    // 执行概况
    html += `<h2>执行概况</h2>
<div class="summary-box">
  <p><strong>流程名称:</strong> ${result.playbookName}</p>
  <p><strong>目标:</strong> ${result.target}</p>
  <p><strong>执行时间:</strong> ${result.startTime} - ${result.endTime}</p>
  <p><strong>状态:</strong> ${this.translateStatus(result.status)}</p>
  <p><strong>共执行 Skill:</strong> ${summary.totalSkillsExecuted}</p>
  <p><strong>发现总数:</strong> ${totalFindings}</p>
</div>
`;

    // 发现摘要表格
    html += `<h2>发现摘要</h2>
<table>
  <tr><th>级别</th><th>数量</th></tr>
  <tr><td class="severity-critical">Critical</td><td>${summary.criticalFindings}</td></tr>
  <tr><td class="severity-high">High</td><td>${summary.highFindings}</td></tr>
  <tr><td class="severity-medium">Medium</td><td>${summary.mediumFindings}</td></tr>
  <tr><td class="severity-low">Low</td><td>${summary.lowFindings}</td></tr>
  <tr><td><strong>总计</strong></td><td><strong>${totalFindings}</strong></td></tr>
</table>
`;

    // 阶段执行详情
    html += `<h2>阶段执行详情</h2>\n`;
    for (const phase of result.phaseResults) {
      const statusText = phase.status === 'completed' ? '✅ 完成'
        : phase.status === 'skipped' ? '⏭ 跳过' : '❌ 失败';
      html += `<div class="phase">
  <h3>Phase ${phase.phaseId}: ${phase.phaseName} [${statusText}]</h3>
  <p>执行 Skill 数: ${phase.skillsExecuted.length} | 持续时间: ${phase.duration}</p>
`;
      if (phase.findings.length > 0) {
        html += `  <ul>\n`;
        for (const finding of phase.findings) {
          html += `    <li class="severity-${finding.severity.toLowerCase()}">${finding.severity}: ${finding.description}</li>\n`;
        }
        html += `  </ul>\n`;
      }
      html += `</div>\n`;
    }

    // 详细发现
    if (allFindings.length > 0) {
      html += `<h2>详细发现</h2>\n`;
      for (let i = 0; i < allFindings.length; i++) {
        const f = allFindings[i];
        html += `<div class="finding-card">
  <h3>发现 ${i + 1} <span class="severity-${f.severity.toLowerCase()}">[${f.severity}]</span></h3>
  <p><strong>来源:</strong> ${f.skillId}</p>
  <p><strong>描述:</strong> ${f.description}</p>
  <p><strong>证据:</strong> ${f.evidence}</p>
  <p><strong>时间:</strong> ${f.timestamp}</p>
</div>\n`;
      }
    }

    // 修复建议
    if (result.recommendations.length > 0) {
      html += `<h2>修复建议</h2>\n<ol>\n`;
      for (const rec of result.recommendations) {
        html += `  <li>${rec}</li>\n`;
      }
      html += `</ol>\n`;
    }

    html += `</body>\n</html>`;

    return html;
  }

  /**
   * 生成 JSON 格式数据
   * @param result 流程执行结果
   * @returns JSON 格式数据
   */
  static generateJSON(result: OrchestrationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * 生成管理层摘要（简短的执行概览）
   * @param result 流程执行结果
   * @returns 管理层摘要文本
   */
  static generateExecutiveSummary(result: OrchestrationResult): string {
    const summary = result.summary;
    const totalFindings = summary.criticalFindings + summary.highFindings +
      summary.mediumFindings + summary.lowFindings;
    const allFindings = this.collectAllFindings(result);
    const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

    // 第一段：执行概览
    let text = `本次「${result.playbookName}」安全审计于 ${result.startTime} 至 ${result.endTime} 执行，目标为 ${result.target}。`;
    text += ` 流程执行状态为「${this.translateStatus(result.status)}」，共执行 ${summary.totalSkillsExecuted} 项安全检查，`;
    text += `累计发现 ${totalFindings} 个安全问题。`;

    // 第二段：风险分布
    if (totalFindings > 0) {
      text += ` 在发现的安全问题中，`;
      text += `严重级别（Critical）${summary.criticalFindings} 项，`;
      text += `高级别（High）${summary.highFindings} 项，`;
      text += `中级别（Medium）${summary.mediumFindings} 项，`;
      text += `低级别（Low）${summary.lowFindings} 项。`;

      if (summary.criticalFindings > 0 || summary.highFindings > 0) {
        text += ` 建议立即优先处理严重和高级别漏洞。`;
      }
    } else {
      text += ` 本次审计未发现安全问题，系统安全状况良好。`;
    }

    // 第三段：核心发现和修复建议
    if (allFindings.length > 0) {
      const topFindings = allFindings
        .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
        .slice(0, 3);

      text += `\n\n**核心发现**：\n`;
      for (const f of topFindings) {
        text += `- [${f.severity}] ${f.description}\n`;
      }
    }

    if (result.recommendations.length > 0) {
      text += `\n**建议措施**：共提出 ${result.recommendations.length} 项修复建议，`;
      text += `建议按照严重程度优先顺序逐步实施。`;
    }

    return text;
  }

  /**
   * 收集所有阶段的发现结果
   * @param result 流程执行结果
   * @returns 所有发现列表
   */
  private static collectAllFindings(result: OrchestrationResult): Finding[] {
    const findings: Finding[] = [];
    for (const phase of result.phaseResults) {
      findings.push(...phase.findings);
    }
    return findings;
  }

  /**
   * 翻译执行状态为中文
   * @param status 执行状态
   * @returns 中文状态文本
   */
  private static translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': '已完成',
      'paused': '已暂停',
      'failed': '失败',
      'partial': '部分完成',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取严重程度显示文本
   * @param severity 严重程度
   * @returns 严重程度徽章文本
   */
  private static severityBadge(severity: string): string {
    return severity.toUpperCase();
  }
}
