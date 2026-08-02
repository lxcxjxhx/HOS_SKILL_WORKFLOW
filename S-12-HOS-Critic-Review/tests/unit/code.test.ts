import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regexScan, mapSemgrepResults } from '../../scripts/analyzers/code.ts';

test('code-regex：硬编码密钥命中 HIGH/SEC', () => {
  const code = "const API_KEY = 'sk-prod-1234567890abcdef';\nconst x = 1;";
  const f = regexScan(code);
  assert.ok(f.some(x => x.class === 'SEC' && x.severity === 'HIGH' && x.title.includes('硬编码')), JSON.stringify(f));
});

test('code-regex：eval 动态执行命中', () => {
  const f = regexScan("function run(cmd) { return eval(cmd); }");
  assert.ok(f.some(x => x.severity === 'MEDIUM' && x.title.includes('动态执行')));
});

test('code-regex：innerHTML 赋值命中 XSS', () => {
  const f = regexScan("el.innerHTML = userInput;");
  assert.ok(f.some(x => x.title.includes('innerHTML')));
});

test('code-regex：TODO 命中 REPRO/LOW', () => {
  const f = regexScan("// TODO: 实现校验\nconst y = 1;");
  assert.ok(f.some(x => x.class === 'REPRO' && x.severity === 'LOW' && x.title.includes('TODO')));
});

test('code-regex：干净代码零命中', () => {
  const f = regexScan("export function add(a: number, b: number): number {\n  return a + b;\n}");
  assert.equal(f.length, 0, JSON.stringify(f));
});

test('code-regex：命中行号正确', () => {
  const f = regexScan("const a = 1;\nconst TOKEN = 'abcdef1234567890';");
  const hit = f.find(x => x.title.includes('硬编码'));
  assert.ok(hit, '应命中硬编码');
  assert.equal(hit.line, 2);
});

test('code-semgrep：JSON 结果映射（纯函数）', () => {
  const results = [
    {
      check_id: 'python.lang.security.audit.dangerous-eval', path: 'src/a.py', start: { line: 12 },
      extra: { message: 'Avoid using dangerous eval', severity: 'ERROR', metadata: {} },
    },
    {
      check_id: 'generic.secrets.security.detected-aws-key', path: 'src/a.py', start: { line: 40 },
      extra: { message: 'AWS key detected', severity: 'WARNING', metadata: {} },
    },
  ];
  const f = mapSemgrepResults(results as never);
  assert.equal(f.length, 2);
  assert.equal(f[0].severity, 'HIGH', 'ERROR → HIGH');
  assert.equal(f[0].tool, 'semgrep');
  assert.equal(f[0].class, 'SEC', 'eval → SEC');
  assert.equal(f[0].line, 12);
  assert.equal(f[1].severity, 'MEDIUM', 'WARNING → MEDIUM');
  assert.ok(f[1].title.includes('detected-aws-key'), 'title 取 check_id 末段');
});
