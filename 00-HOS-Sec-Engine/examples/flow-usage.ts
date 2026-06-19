/**
 * HOS-Sec-Engine V3 - 流程编排使用示例
 * 演示如何使用预定义 Playbook 进行标准化攻防流程执行
 */

import { HosSecEngine, allPlaybooks, getPlaybookById, FlowOrchestrator } from '../src/index';

async function main() {
  const engine = new HosSecEngine({
    maxResults: 5,
    minMatchScore: 0.05,
    loadPresetSkills: true
  });

  console.log(`引擎已加载 ${engine.getSkillCount()} 个预设 Skill`);
  console.log(`可用流程: ${allPlaybooks.length} 个\n`);

  // ==================== 示例 1: 查看所有预定义流程 ====================
  console.log('\n========== 示例 1: 查看所有预定义流程 ==========\n');
  for (const pb of allPlaybooks) {
    console.log(`- ${pb.name} (${pb.id})`);
    console.log(`  分类: ${pb.category}, 难度: ${pb.metadata.difficulty}, 时间: ${pb.metadata.estimatedTime}`);
    console.log(`  阶段: ${pb.phases.length} 个`);
    console.log('');
  }

  // ==================== 示例 2: 加载并执行流程 ====================
  console.log('\n========== 示例 2: 执行 Web 渗透测试流程 ==========\n');
  const playbook = getPlaybookById('web-pentest-full');
  if (!playbook) {
    console.error('流程 web-pentest-full 未找到');
    return;
  }

  console.log(`流程: ${playbook.name}`);
  console.log(`描述: ${playbook.description}`);
  console.log(`阶段:`);
  for (const phase of playbook.phases) {
    console.log(`  ${phase.order}. ${phase.name} (${phase.id})`);
    console.log(`     Skill 数: ${phase.skills.length}`);
  }

  engine.loadPlaybook(playbook);
  const orchestrator = engine.getOrchestrator();
  console.log(`\n流程已加载，状态: ${orchestrator.visualizeStatus()}`);

  // ==================== 示例 3: 流程执行 ====================
  console.log('\n========== 示例 3: 执行流程 ==========');
  try {
    const result = await engine.executeFlow({
      target: 'https://target.example.com',
      findings: [],
      accessLevel: 'anonymous',
      history: [],
      customData: {}
    });

    console.log('\n--- 执行摘要 ---');
    console.log(`状态: ${result.status}`);
    console.log(`总执行 Skill: ${result.summary.totalSkillsExecuted}`);
    console.log(`Critical: ${result.summary.criticalFindings}`);
    console.log(`High: ${result.summary.highFindings}`);
    console.log(`Medium: ${result.summary.mediumFindings}`);
    console.log(`Low: ${result.summary.lowFindings}`);

    console.log('\n--- 阶段详情 ---');
    for (const pr of result.phaseResults) {
      console.log(`[${pr.status}] ${pr.phaseName} - 持续时间: ${pr.duration}`);
      console.log(`  执行 Skill: ${pr.skillsExecuted.length}`);
      console.log(`  发现: ${pr.findings.length}`);
    }

    console.log('\n--- 修复建议 ---');
    for (const rec of result.recommendations) {
      console.log(`- ${rec}`);
    }
  } catch (error) {
    console.log(`流程执行结果: ${error}`);
  }

  // ==================== 示例 4: 流程控制演示 ====================
  console.log('\n========== 示例 4: 流程控制 ==========\n');
  const cloudPlaybook = getPlaybookById('cloud-config-audit');
  if (cloudPlaybook) {
    engine.loadPlaybook(cloudPlaybook);
    const status = engine.getOrchestrator().getStatus();
    console.log(`加载流程: ${cloudPlaybook.name}`);
    console.log(`当前状态: ${status.status}`);
    console.log(`已完成阶段: ${status.completedPhases.join(', ') || '无'}`);
  }

  console.log('\n========== 演示完成 ==========');
}

main().catch(console.error);
