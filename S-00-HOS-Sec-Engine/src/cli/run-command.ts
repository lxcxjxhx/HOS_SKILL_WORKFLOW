#!/usr/bin/env node
/**
 * HOS-Sec-Engine V4 - Run Command
 * Executes Skills independently from IDE
 * Usage: npx hos-sec-engine run --skill web-sqli-001 --target "https://example.com"
 */

import { HosSecEngine } from '../core/engine';
import { ConfigLoader } from '../config/config-loader';

interface RunArgs {
  skill?: string;
  skills?: string[];
  target: string;
  parallel: boolean;
  config?: string;
  output?: string;
  format: 'text' | 'json';
}

function parseArgs(): RunArgs {
  const args = process.argv.slice(2);
  const result: RunArgs = {
    target: '',
    parallel: false,
    format: 'text',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--skill':
        result.skill = args[++i];
        break;
      case '--skills':
        result.skills = args[++i].split(',');
        break;
      case '--target':
        result.target = args[++i];
        break;
      case '--parallel':
        result.parallel = true;
        break;
      case '--config':
        result.config = args[++i];
        break;
      case '--output':
        result.output = args[++i];
        break;
      case '--format':
        result.format = args[++i] as 'text' | 'json';
        break;
      case '--help':
        console.log(`
HOS-Sec-Engine V4 - Run Command

Usage:
  npx hos-sec-engine run --skill <id> --target <url>
  npx hos-sec-engine run --skills <id1,id2> --target <url> --parallel

Options:
  --skill <id>        Single Skill ID to execute
  --skills <ids>      Multiple Skill IDs (comma-separated)
  --target <url>      Target for Skill execution
  --parallel          Execute Skills in parallel
  --config <path>     Custom config file path
  --output <path>     Output file path for results
  --format <type>     Output format: text (default) or json
  --help              Show this help message
        `);
        process.exit(0);
    }
  }

  // Fallback to env
  if (!result.target) {
    result.target = process.env.HOS_SEC_TARGET || '';
  }

  return result;
}

async function main() {
  const args = parseArgs();

  if (!args.skill && !args.skills?.length) {
    console.error('Error: --skill or --skills is required');
    process.exit(1);
  }

  if (!args.target) {
    console.error('Error: --target is required');
    process.exit(1);
  }

  console.log('HOS-Sec-Engine V4 - Skill Runner');
  console.log('================================');
  console.log(`Target: ${args.target}`);
  console.log(`Skills: ${args.skill || args.skills?.join(', ')}`);
  console.log(`Parallel: ${args.parallel}`);
  console.log('');

  const engine = new HosSecEngine();

  // Load runtime config
  const runtimeConfig = ConfigLoader.loadRuntimeConfig(args.config);
  await engine.initializeRuntime(runtimeConfig);

  // Get skills to execute
  const skillIds = args.skill ? [args.skill] : args.skills!;

  // Execute skills
  if (args.parallel) {
    const promises = skillIds.map(id => engine.executeProcess(args.target, id));
    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        console.log(`[OK] ${result.value.templateId}: ${result.value.summary.totalFindings} 个发现`);
      } else {
        console.log(`[FAIL] ${result.reason}`);
      }
    }
  } else {
    for (const skillId of skillIds) {
      try {
        const result = await engine.executeProcess(args.target, skillId);
        console.log(`[${result.status}] ${result.templateId}: ${result.summary.totalFindings} 个发现`);
        if (result.summary.totalFindings > 0) {
          console.log(`  Critical: ${result.summary.criticalCount}, High: ${result.summary.highCount}, Medium: ${result.summary.mediumCount}, Low: ${result.summary.lowCount}`);
        }
      } catch (err) {
        console.error(`Error executing ${skillId}:`, err instanceof Error ? err.message : String(err));
      }
    }
  }
}

main().catch(console.error);

export {};
