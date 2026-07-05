#!/usr/bin/env node
/**
 * HOS-Sec-Engine V2 - 业务指导流程演示脚本
 *
 * 本脚本演示完整的业务指导流程：
 * 1. 展示可用流程模板
 * 2. 执行流程并显示每个阶段的业务指导信息
 * 3. 显示决策树如何根据结果动态调整流程
 * 4. 输出完整的流程执行报告
 *
 * 运行方式: npm run start
 * 或: node dist/examples/process-guidance.js
 */
import { HosSecEngine } from '../core/engine';
import { ReportGenerator } from '../core/report';
import { ProcessResult } from '../types/process';
import { adaptProcessResultToOrchestration } from '../core/report-adapter';

// ANSI 颜色常量
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function printBanner(): void {
  console.log(`
${COLORS.cyan}${COLORS.bright}
╔══════════════════════════════════════════════════════════════╗
║              HOS-Sec-Engine V2 业务指导流程引擎              ║
║        自适应渗透测试业务指导 · 决策树驱动 · 实时 CVE 富化    ║
╚══════════════════════════════════════════════════════════════╝
${COLORS.reset}`);
}

function printSection(title: string): void {
  console.log(`\n${COLORS.bright}${COLORS.blue}${'━'.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}  ${title}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}${'━'.repeat(70)}${COLORS.reset}`);
}

function printBox(title: string, content: string, color: string = COLORS.green): void {
  console.log(`\n${color}${COLORS.bright}┌─ ${title}${COLORS.reset}`);
  console.log(`${color}│${COLORS.reset} ${content}`);
  console.log(`${color}└${'─'.repeat(50)}${COLORS.reset}`);
}

/**
 * 业务指导流程演示主函数
 */
async function main(): Promise<void> {
  printBanner();

  // ==================== 初始化引擎 ====================
  printSection('STEP 1: 初始化引擎 & 加载流程模板');
  console.log('正在初始化 HOS-Sec-Engine...');

  const engine = new HosSecEngine();
  const templates = engine.getProcessTemplates();

  console.log(`${COLORS.green}✓${COLORS.reset} 引擎初始化完成`);
  console.log(`${COLORS.green}✓${COLORS.reset} 已加载流程模板:`);
  for (const tpl of templates) {
    console.log(`  ${COLORS.cyan}•${COLORS.reset} ${tpl}`);
  }

  // ==================== 展示可用流程模板 ====================
  printSection('STEP 2: 可用业务指导流程一览');

  const templateDetails: Record<string, any> = {};
  for (const id of templates) {
    const tpl = (engine as any).processEngine?.getTemplate(id);
    if (tpl) {
      templateDetails[id] = tpl;
      console.log(`\n${COLORS.yellow}${COLORS.bright}[${tpl.id}]${COLORS.reset} ${COLORS.bright}${tpl.name}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}描述:${COLORS.reset} ${tpl.description}`);
      console.log(`  ${COLORS.dim}版本:${COLORS.reset} ${tpl.version}`);
      console.log(`  ${COLORS.dim}阶段数:${COLORS.reset} ${tpl.phases.length}`);
      console.log(`  ${COLORS.dim}阶段列表:${COLORS.reset}`);
      for (const phase of tpl.phases) {
        const stepCount = phase.steps?.length || 0;
        console.log(`    ${COLORS.cyan}${phase.id}${COLORS.reset} - ${phase.name} (${stepCount} 个步骤)`);
        if (phase.condition) {
          console.log(`      ${COLORS.yellow}条件: ${phase.condition}${COLORS.reset}`);
        }
      }
    }
  }

  // ==================== 展示决策树逻辑 ====================
  printSection('STEP 3: 自适应决策树逻辑说明');

  console.log(`${COLORS.bright}什么是自适应决策树？${COLORS.reset}`);
  console.log(`  传统渗透测试按照固定流程执行，缺乏灵活性。`);
  console.log(`  自适应决策树根据每个阶段的执行结果，动态决定下一步：`);
  console.log(`\n  ${COLORS.cyan}•${COLORS.reset} 如果发现高危漏洞 → 进入深入利用阶段`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 如果未发现漏洞 → 切换测试方向`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 如果获取访问权限 → 进入后渗透阶段`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 支持条件分支和并行执行策略`);
  console.log(`\n  ${COLORS.dim}例如: Web 渗透测试决策树${COLORS.reset}`);
  console.log(`  ${COLORS.dim}  信息收集 → SQL注入检测 → XSS检测 → SSRF/路径遍历${COLORS.reset}`);
  console.log(`  ${COLORS.dim}  → 文件上传/命令注入 → 漏洞利用 → 后渗透${COLORS.reset}`);

  // ==================== 执行业务指导流程 ====================
  printSection('STEP 4: 执行完整业务指导流程');

  const target = 'https://example.com';
  const processType = 'web-pentest';

  console.log(`${COLORS.yellow}目标:${COLORS.reset} ${target}`);
  console.log(`${COLORS.yellow}流程类型:${COLORS.reset} ${processType}`);
  console.log(`${COLORS.yellow}启动时间:${COLORS.reset} ${new Date().toISOString()}`);
  console.log(`\n${COLORS.dim}正在执行业务指导流程，请关注每个阶段的业务目标和操作说明...${COLORS.reset}\n`);

  let result: ProcessResult;
  try {
    result = await engine.executeProcess(target, processType);
    console.log(`\n${COLORS.green}${COLORS.bright}✓ 流程执行完成${COLORS.reset}`);
  } catch (error) {
    console.log(`\n${COLORS.red}${COLORS.bright}✗ 流程执行异常: ${error}${COLORS.reset}`);
    // 即使执行失败，也展示流程模板信息
    return;
  }

  // ==================== 展示执行结果 ====================
  printSection('STEP 5: 流程执行结果报告');

  // 阶段执行摘要
  console.log(`${COLORS.bright}阶段执行摘要:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`);

  for (const phaseResult of result.phaseResults) {
    const statusIcon = phaseResult.status === 'success' ? `${COLORS.green}✓${COLORS.reset}` :
      phaseResult.status === 'failure' ? `${COLORS.red}✗${COLORS.reset}` :
      phaseResult.status === 'skipped' ? `${COLORS.yellow}⊘${COLORS.reset}` :
      `${COLORS.yellow}~${COLORS.reset}`;

    const phaseName = result.context.completedPhases.includes(phaseResult.phaseId) ?
      `[${COLORS.green}完成${COLORS.reset}]` : `[${COLORS.yellow}未执行${COLORS.reset}]`;

    console.log(`  ${statusIcon} ${phaseResult.phaseId}: ${phaseResult.status} (${phaseResult.duration}ms)`);
    if (phaseResult.findings.length > 0) {
      console.log(`    ${COLORS.yellow}发现 ${phaseResult.findings.length} 个问题:${COLORS.reset}`);
      for (const f of phaseResult.findings) {
        const severityColor = f.severity === 'critical' ? COLORS.red :
          f.severity === 'high' ? COLORS.yellow : COLORS.blue;
        console.log(`    ${severityColor}• [${f.severity}] ${f.type} - ${f.description}${COLORS.reset}`);
        if (f.cveMatches.length > 0) {
          for (const cve of f.cveMatches) {
            console.log(`      ${COLORS.magenta}关联 CVE: ${cve.cveId} (${cve.severity})${COLORS.reset}`);
          }
        }
      }
    }
    console.log();
  }

  // 汇总统计
  const summary = result.summary;
  console.log(`\n${COLORS.bright}汇总统计:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`);
  console.log(`  总发现数:     ${summary.totalFindings}`);
  if (summary.criticalCount > 0) console.log(`  ${COLORS.red}严重:         ${summary.criticalCount}${COLORS.reset}`);
  if (summary.highCount > 0) console.log(`  ${COLORS.yellow}高危:         ${summary.highCount}${COLORS.reset}`);
  if (summary.mediumCount > 0) console.log(`  ${COLORS.blue}中危:         ${summary.mediumCount}${COLORS.reset}`);
  if (summary.lowCount > 0) console.log(`  ${COLORS.green}低危:         ${summary.lowCount}${COLORS.reset}`);
  console.log(`  CVE 引用:     ${summary.cveReferences}`);
  console.log(`  总耗时:       ${summary.duration}ms`);

  // ==================== 生成报告 ====================
  printSection('STEP 6: 生成报告');

  // 将 ProcessResult 转换为 OrchestrationResult 以兼容报告生成器
  const orchestrationResult = adaptProcessResultToOrchestration(result);

  // 生成 Markdown 报告
  const markdownReport = ReportGenerator.generateMarkdown(orchestrationResult);
  console.log(`${COLORS.green}✓${COLORS.reset} Markdown 报告已生成`);
  console.log(`\n${COLORS.dim}${markdownReport.slice(0, 500)}...${COLORS.reset}`);

  // 生成 HTML 报告
  const htmlReport = ReportGenerator.generateHTML(orchestrationResult);
  console.log(`\n${COLORS.green}✓${COLORS.reset} HTML 报告已生成 (${htmlReport.length} 字符)`);

  // ==================== 完整业务指导流程总结 ====================
  printSection('业务流程指导总结');

  const template = templateDetails[processType];
  if (template) {
    console.log(`\n${COLORS.bright}${template.name}${COLORS.reset}`);
    console.log(`\n${COLORS.bright}执行阶段总览:${COLORS.reset}`);
    for (let i = 0; i < template.phases.length; i++) {
      const phase = template.phases[i];
      const completed = result.phaseResults.find(r => r.phaseId === phase.id);
      const status = completed ?
        (completed.status === 'success' ? `${COLORS.green}✓ 完成${COLORS.reset}` :
         completed.status === 'skipped' ? `${COLORS.yellow}⊘ 跳过${COLORS.reset}` :
         `${COLORS.red}✗ 失败${COLORS.reset}`) :
        `${COLORS.dim}未执行${COLORS.reset}`;

      console.log(`\n  ${COLORS.cyan}阶段 ${i + 1}: ${phase.name}${COLORS.reset} ${status}`);
      console.log(`  ${COLORS.dim}业务目标: ${phase.description}${COLORS.reset}`);

      if (completed && completed.findings.length > 0) {
        console.log(`  ${COLORS.yellow}发现: ${completed.findings.length} 个问题${COLORS.reset}`);
      }
    }
  }

  // 决策树路径总结
  console.log(`\n\n${COLORS.bright}决策树执行路径:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`);
  const completedPhases = result.phaseResults.map(r => r.phaseId);
  for (let i = 0; i < completedPhases.length; i++) {
    const arrow = i < completedPhases.length - 1 ? `${COLORS.green} → ${COLORS.reset}` : '';
    console.log(`  ${COLORS.cyan}${i + 1}. ${completedPhases[i]}${COLORS.reset}${arrow}`);
  }

  console.log(`\n\n${COLORS.bright}${COLORS.green}业务指导流程执行完毕！${COLORS.reset}`);
  console.log(`${COLORS.dim}本流程展示了 HOS-Sec-Engine 的自适应业务指导能力：${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 每个阶段都有明确的业务目标和成功标准`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 每个步骤都有操作说明和预期输出`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 决策树根据实际发现动态调整流程`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} CVE 数据库实时富化发现`);
  console.log(`  ${COLORS.cyan}•${COLORS.reset} 完整报告支持 Markdown/HTML/JSON`);
}

main().catch(console.error);