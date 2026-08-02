/**
 * HOS-Silly-Mock: Console Reporter
 *
 * 格式化输出检测报告到控制台。
 * 支持 ANSI 颜色、结构化表格、JSON 输出。
 */

import { EnforcementResult } from '../core/types';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

/**
 * 格式化风险等级
 */
function formatRisk(level: string, value?: string): string {
  const color = level === 'critical' ? RED :
    level === 'high' ? RED :
    level === 'medium' ? YELLOW :
    level === 'low' ? BLUE : GREEN;
  const display = value || level.toUpperCase();
  return `${color}${display}${RESET}`;
}

/**
 * 绘制进度条
 */
function bar(value: number, max: number, width: number = 16): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const blocks = '█'.repeat(filled) + '░'.repeat(Math.max(0, empty));
  const color = value < 50 ? RED : value < 70 ? YELLOW : GREEN;
  return `${color}${blocks}${RESET}  ${value}/${max}`;
}

/**
 * 控制台报告
 */
export function printReport(result: EnforcementResult, format: 'pretty' | 'json' = 'pretty'): void {
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const d = result.dimensions;
  const s = result.summary;

  console.log();
  console.log(`${BOLD}╔══════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}║       HOS-Silly-Mock Reality Report                ║${RESET}`);
  console.log(`${BOLD}╚══════════════════════════════════════════════════════╝${RESET}`);
  console.log();

  // Score
  console.log(`  ${BOLD}Reality Score:${RESET}       ${bar(result.realityScore, 100)}`);
  console.log(`  ${BOLD}Data Authenticity:${RESET}   ${bar(d.dataAuthenticity, 100)}`);
  console.log(`  ${DIM}${'─'.repeat(50)}${RESET}`);

  // Dimensions
  console.log(`  ${BOLD}Mock Leakage Risk:${RESET}    ${formatRisk(d.mockLeakageRisk)}`);
  console.log(`  ${BOLD}Regex Abuse Risk:${RESET}     ${formatRisk(d.regexAbuseRisk)}`);
  console.log(`  ${BOLD}Silent Failure Risk:${RESET}  ${d.silentFailureRisk === 'YES' ? formatRisk('critical', 'YES') : formatRisk('info', 'NO')}`);
  console.log(`  ${BOLD}Reality Binding:${RESET}      ${d.realityBinding === 'PASS' ? formatRisk('info', 'PASS') : formatRisk('high', 'FAIL')}`);
  console.log(`  ${DIM}${'─'.repeat(50)}${RESET}`);

  // Summary
  const statusIcon = result.passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`  ${BOLD}Status:${RESET} ${statusIcon} ${result.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  ${BOLD}Findings:${RESET} ${s.totalFindings} (${s.errors > 0 ? RED + s.errors + ' errors' + RESET : '0 errors'}, ${s.warnings > 0 ? YELLOW + s.warnings + ' warnings' + RESET : '0 warnings'}, ${s.info} info)`);
  console.log();

  // Findings detail
  if (result.findings.length > 0) {
    console.log(`  ${BOLD}Detailed Findings:${RESET}`);
    console.log();

    for (const f of result.findings) {
      const sevColor = f.severity === 'critical' ? RED :
        f.severity === 'high' ? RED :
        f.severity === 'medium' ? YELLOW :
        f.severity === 'low' ? BLUE : DIM;

      console.log(`  ${sevColor}[${f.layer}]${RESET} ${BOLD}${f.message}${RESET}`);
      console.log(`       File: ${f.file}:${f.line}`);
      if (f.snippet) console.log(`       Code: ${DIM}${f.snippet}${RESET}`);
      if (f.suggestion) console.log(`       Fix:  ${CYAN}${f.suggestion}${RESET}`);
      console.log();
    }
  } else {
    console.log(`  ${GREEN}✓ No issues found. Code reality is intact.${RESET}`);
    console.log();
  }
}

/**
 * Markdown 报告
 */
export function printMarkdownReport(result: EnforcementResult): void {
  const d = result.dimensions;

  console.log('## HOS-Silly-Mock Reality Report');
  console.log();
  console.log(`| Metric | Value |`);
  console.log(`|--------|-------|`);
  console.log(`| Reality Score | ${result.realityScore}/100 |`);
  console.log(`| Data Authenticity | ${d.dataAuthenticity}/100 |`);
  console.log(`| Mock Leakage Risk | ${d.mockLeakageRisk.toUpperCase()} |`);
  console.log(`| Regex Abuse Risk | ${d.regexAbuseRisk.toUpperCase()} |`);
  console.log(`| Silent Failure Risk | ${d.silentFailureRisk} |`);
  console.log(`| Reality Binding | ${d.realityBinding} |`);
  console.log(`| **Status** | **${result.passed ? 'PASSED' : 'FAILED'}** |`);
  console.log();
  console.log(`### Findings (${result.summary.totalFindings})`);
  console.log();

  for (const f of result.findings) {
    console.log(`- **[${f.layer}]** ${f.message} (${f.file}:${f.line})`);
    if (f.suggestion) console.log(`  - *Fix:* ${f.suggestion}`);
  }
  console.log();
}
