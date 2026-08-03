import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
// Windows 下 spawn 'node' 可能不在 PATH，用当前进程解释器保证可运行
const NODE = process.execPath;
// cwd 用绝对文件路径（fileURLToPath 处理 Windows 盘符）
const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/**
 * CLI render 缺省格式回归测试：
 * 默认输出必须是 html（config.yaml#output_format / scripts/cli.ts 缺省 --format），
 * --format auto 按 --out 后缀推断（无后缀默认 html），显式 --format md 仍可覆盖。
 * 覆盖 0.5.0 变更：默认输出从 md 反转为 html。
 */
async function render(args: string[]): Promise<{ stdout: string; outFile: string }> {
  const dir = await mkdtemp(join(tmpdir(), 'hcr-render-'));
  const outFile = join(dir, 'report' + (args[args.indexOf('--out') + 1]?.startsWith('--') ? '' : '.html'));
  const full = [...args, '--out', outFile];
  const { stdout } = await exec(NODE, ['scripts/cli.ts', 'render', 'examples/example-review.json', ...full], { cwd: ROOT });
  const content = await readFile(outFile, 'utf8');
  await rm(dir, { recursive: true, force: true });
  return { stdout, outFile: content };
}

test('render：缺省 --format 输出 HTML', async () => {
  const { outFile } = await render(['--mode', 'quick']);
  assert.ok(outFile.startsWith('<!DOCTYPE html>'));
  assert.ok(outFile.includes('</html>'));
});

test('render：--format auto 无后缀 --out 默认 HTML', async () => {
  const { outFile } = await render(['--mode', 'quick', '--format', 'auto']);
  assert.ok(outFile.startsWith('<!DOCTYPE html>'));
});

test('render：--format auto 按 .md 后缀推断 Markdown', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hcr-render-md-'));
  const outFile = join(dir, 'report.md');
  await exec(NODE, ['scripts/cli.ts', 'render', 'examples/example-review.json', '--mode', 'quick', '--format', 'auto', '--out', outFile], { cwd: ROOT });
  const content = await readFile(outFile, 'utf8');
  await rm(dir, { recursive: true, force: true });
  assert.ok(content.includes('# HOS-CRITIC-REVIEW') || content.includes('Score:'));
  assert.ok(!content.startsWith('<!DOCTYPE html>'));
});

test('render：显式 --format md 覆盖默认 HTML', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hcr-render-md2-'));
  const outFile = join(dir, 'report.txt');
  await exec(NODE, ['scripts/cli.ts', 'render', 'examples/example-review.json', '--mode', 'quick', '--format', 'md', '--out', outFile], { cwd: ROOT });
  const content = await readFile(outFile, 'utf8');
  await rm(dir, { recursive: true, force: true });
  assert.ok(!content.startsWith('<!DOCTYPE html>'));
});
