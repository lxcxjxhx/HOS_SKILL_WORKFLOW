import { test } from 'node:test';
import assert from 'node:assert/strict';
import { treeSitterDetector } from '../../scripts/detectors/tree-sitter.ts';
import { chunkText } from '../../scripts/chunker.ts';

const CODE = `import fs from 'node:fs';\n\nexport function validateJwt(token: string): string[] | null {\n  if (!token) return null;\n  return token.split('.');\n}\n\nclass AuthService {\n  private cache = new Map<string, unknown>();\n  async login(user: string) { return this.cache.get(user); }\n}\n\nexport const handler = (req: { body: string }) => req.body;`;

test('tree-sitter 检测器：可用性探测', () => {
  // npm 包已安装时应为 true（CI 无依赖时该测试应跳过逻辑由 available() 自身保证）
  assert.equal(typeof treeSitterDetector.available(), 'boolean');
});

test('tree-sitter 检测器：函数/类/箭头函数边界', async () => {
  if (!treeSitterDetector.available()) return; // 未安装 npm 包时跳过
  const blocks = await treeSitterDetector.detect({ type: 'repo', text: CODE, lang: 'ts' });
  const titles = blocks.map(b => b.title);
  assert.ok(titles.includes('validateJwt'), `应有 validateJwt，实际 ${titles.join(',')}`);
  assert.ok(titles.includes('AuthService'), '应有 AuthService');
  assert.ok(titles.includes('handler'), '应有 handler（箭头函数）');
  const cls = blocks.find(b => b.title === 'AuthService');
  assert.ok(cls!.endLine >= cls!.startLine, '行区间合法');
});

test('tree-sitter 检测器：注入泛化管线（外部检测器优先于内置 indent）', async () => {
  if (!treeSitterDetector.available()) return;
  const r = await chunkText(CODE, { type: 'repo', lang: 'ts', detectors: [treeSitterDetector] });
  assert.ok(r.strategy.includes('tree-sitter'), `strategy 应记录 tree-sitter，实际 ${r.strategy}`);
  const funcs = r.units.filter(u => u.kind === 'code-function');
  assert.ok(funcs.some(u => u.title === 'validateJwt'), '函数级单元');
  const cls = r.units.find(u => u.title === 'AuthService');
  assert.equal(cls?.kind, 'code-class', '类单元');
  // 规模与定位
  for (const u of r.units) assert.ok(u.tokens <= 4000, '不超限');
  assert.ok(r.units.every(u => u.source_range.start_line !== undefined), '全部带定位');
});

test('tree-sitter 不可用时管线仍可跑（内置 indent 兜底）', async () => {
  const mockUnavailable = { id: 'mock', available: () => false, detect: async () => [] as never[] };
  const r = await chunkText(CODE, { type: 'repo', lang: 'ts', detectors: [mockUnavailable] });
  assert.ok(r.units.length > 0, '无外部检测器仍产出单元');
  assert.ok(r.strategy.includes('indent'), '内置 indent 生效');
});
