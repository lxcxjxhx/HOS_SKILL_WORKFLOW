import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chunkText } from '../../scripts/chunker.ts';

test('泛化切片：文章 → 标题分区 + 段落细化 + 角色标注', async () => {
  const text = await readFile('examples/fixtures/sample-article.md', 'utf8');
  const r = await chunkText(text, { type: 'article' });
  assert.ok(r.units.length >= 8, `单元数应 ≥8（L1 分区 + L2 块），实际 ${r.units.length}`);

  const l1 = r.units.filter(u => u.level === 1);
  assert.ok(l1.length >= 6, `L1 分区应覆盖主要章节，实际 ${l1.length}`);
  const titles = l1.map(u => u.title);
  assert.ok(titles.some(t => t.includes('核心方案')), '核心方案分区存在');
  assert.ok(titles.some(t => t.includes('部署')), '部署分区存在');

  // 角色标注
  const roles = new Set(r.units.map(u => u.role));
  assert.ok(roles.has('claim'), `应有 claim 角色，实际 roles=${[...roles].join(',')}`);
  assert.ok(roles.has('config') || roles.has('evidence'), '应有 config/evidence 角色');
  const unknownRatio = r.units.filter(u => u.role === 'unknown').length / r.units.length;
  assert.ok(unknownRatio <= 0.2, `role unknown 占比应 ≤20%，实际 ${(unknownRatio * 100).toFixed(0)}%`);

  // 规模与覆盖
  for (const u of r.units) assert.ok(u.tokens <= 4000, `单元超限: ${u.unit_id} ${u.tokens}`);
  assert.ok(r.units.every(u => u.source_range.start_line !== undefined), '全部单元带定位');
});

test('泛化切片：论文 → Abstract 为 claim、Experiments 为 evidence', async () => {
  const text = await readFile('examples/fixtures/sample-paper.md', 'utf8');
  const r = await chunkText(text, { type: 'paper' });
  const abstract = r.units.find(u => u.title.toLowerCase().includes('abstract'));
  assert.ok(abstract, 'Abstract 分区存在');
  assert.equal(abstract.role, 'claim', 'Abstract 角色应为 claim');
  const exp = r.units.find(u => u.title.toLowerCase().includes('experiments') || u.title.includes('实验'));
  assert.equal(exp?.role, 'evidence', '实验分区角色应为 evidence');
});

test('泛化切片：代码 → 函数级细化', async () => {
  const code = `import fs from 'node:fs';\n\nfunction validateJwt(token) {\n  if (!token) return null;\n  return token.split('.');\n}\n\nclass AuthService {\n  constructor() { this.cache = new Map(); }\n  async login(user) { return this.cache.get(user); }\n}\n\nexport const handler = (req) => req.body;`;
  const r = await chunkText(code, { type: 'repo', lang: 'ts' });
  const funcs = r.units.filter(u => u.kind === 'code-function');
  assert.ok(funcs.length >= 1, `应检出函数，实际 ${funcs.length}`);
  assert.ok(r.units.some(u => u.kind === 'code-class'), '应检出类');
  assert.ok(funcs[0].title === 'validateJwt', `函数名应为 validateJwt，实际 ${funcs[0].title}`);
  assert.ok(r.units.some(u => u.kind === 'code-block' || u.kind === 'module'), '应有前置代码/文件头块');
});

test('泛化切片：License → 条款级细化', async () => {
  const license = `MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software...\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...\n\nConditions: The above copyright notice and this permission notice shall be included in all copies.`;
  const r = await chunkText(license, { type: 'license' });
  const clauses = r.units.filter(u => u.kind === 'license-clause');
  assert.ok(clauses.length >= 2, `应切出多条许可条款，实际 ${clauses.length}`);
});

test('泛化切片：超限块下钻到片段（L3/约束）', async () => {
  const longPara = '这是一段很长的话。'.repeat(900); // > 4000 tokens
  const r = await chunkText(longPara, { type: 'article' });
  for (const u of r.units) assert.ok(u.tokens <= 4000, `下钻后仍超限: ${u.tokens}`);
  assert.ok(r.degradations.some(d => d.includes('下钻')), '应记录下钻降级');
});

test('泛化切片：外部检测器插件注入（mock）', async () => {
  const text = '第一节内容\n\n第二节内容';
  const mockDetector = {
    id: 'mock-detector',
    available: () => true,
    detect: async () => [{ kind: 'section', title: 'MOCK区', startLine: 0, endLine: 1 }],
  };
  const r = await chunkText(text, { type: 'article', detectors: [mockDetector] });
  assert.ok(r.strategy.includes('mock-detector'), `strategy 应记录插件，实际 ${r.strategy}`);
  assert.ok(r.units.some(u => u.title === 'MOCK区'), '插件块应进入单元列表');
});

test('泛化切片：proposal → proposal-section 分区', async () => {
  const proposal = `# 背景\n公司知识分散。\n\n## 核心方案\n构建统一检索平台。\n\n# 风险\n成本未知。`;
  const r = await chunkText(proposal, { type: 'proposal' });
  const l1 = r.units.filter(u => u.level === 1);
  assert.ok(l1.every(u => u.kind === 'proposal-section'), 'L1 应为 proposal-section');
  assert.ok(l1.some(u => u.role === 'context'), '背景分区 role=context');
  assert.ok(l1.some(u => u.role === 'method'), '方案分区 role=method');
});
