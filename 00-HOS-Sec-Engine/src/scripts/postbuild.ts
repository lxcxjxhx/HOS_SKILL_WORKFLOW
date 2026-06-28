/**
 * HOS-Sec-Engine Postbuild Orchestrator
 *
 * Runs all postbuild generators. Scripts that are independent run via
 * Promise.all for faster overall build time.
 */

import { execSync } from 'child_process';
import * as path from 'path';

const SCRIPTS_DIR = __dirname;

function run(label: string, script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    try {
      execSync(`node ${script}`, { stdio: 'inherit', cwd: path.resolve(SCRIPTS_DIR, '..', '..', '..') });
      console.log(`[postbuild] ${label} completed in ${Date.now() - start}ms`);
      resolve();
    } catch (err) {
      console.error(`[postbuild] ${label} FAILED in ${Date.now() - start}ms`);
      reject(err);
    }
  });
}

async function main() {
  console.log('[postbuild] Starting generation...');

  // generate-skills-md must run first (creates skills/references/)
  await run('SKILL.md', path.join(SCRIPTS_DIR, 'generate-skills-md.js'));

  // CWE/CVE 技能生成（静默模式：无 CVE 数据时仅生成骨架）
  try {
    await run('CWE skills', `node ${path.join(SCRIPTS_DIR, 'generate-skills-from-cwe.js')} --dry-run`);
  } catch {
    console.log('[postbuild] CWE skill generation skipped (no CVE data)');
  }

  // Remaining three are independent of each other
  await Promise.all([
    run('Bundled skill', path.join(SCRIPTS_DIR, 'generate-bundled-skill.js')),
    run('Skills index', path.join(SCRIPTS_DIR, 'generate-skills-index.js')),
    run('Playbooks MD', path.join(SCRIPTS_DIR, 'generate-playbooks-md.js')),
  ]);

  console.log('[postbuild] All generators completed successfully.');
}

main().catch((err) => {
  console.error('[postbuild] Fatal error:', err);
  process.exit(1);
});
