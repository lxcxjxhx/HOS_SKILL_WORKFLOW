/**
 * HOS-Silly-Mock: 综合测试套件
 *
 * 测试所有 4 层检测器 + 评分系统。
 * 运行: node --experimental-vm-modules node_modules/.bin/jest --config jest.config.js
 * 或:   npx ts-node tests/all.test.ts
 */

import { enforceCode, enforceText } from '../src/core/engine';
import { detectMockLeakage } from '../src/detectors/mock-detector';
import { detectRegexAbuse } from '../src/detectors/regex-detector';
import { detectRealityBinding } from '../src/detectors/reality-binder';
import { detectSilentFailure } from '../src/detectors/silent-failure';
import { calculateRealityScore, buildResult } from '../src/core/scorer';
import { Finding, DEFAULT_CONFIG } from '../src/core/types';

// ============================================================
// Layer 1: MOCK 检测测试
// ============================================================

function testMockDetector() {
  console.log('\n🧪 [L1-MOCK] Mock Detector Tests');
  let passed = 0, failed = 0;

  // Test 1: 检测无标注的大型静态数据
  {
    const code = [
      'const users = [',
      '  { id: 1, name: "Alice" },',
      '  { id: 2, name: "Bob" },',
      '  { id: 3, name: "Charlie" },',
      '  { id: 4, name: "Diana" },',
      '];',
    ];
    const findings = detectMockLeakage('test.ts', code);
    const hasFinding = findings.some(f => f.layer === 'L1-MOCK');
    console.log(`  ${hasFinding ? '✓' : '✗'} Test 1: Detect unannotated large static data`);
    if (hasFinding) passed++; else failed++;
  }

  // Test 2: 带 MOCK_MODE 标注的数据不应触发
  {
    const code = [
      '/**',
      ' * MOCK_MODE: TRUE',
      ' * reason: API not deployed',
      ' */',
      'const users = [',
      '  { id: 1, name: "Alice" },',
      '];',
    ];
    const findings = detectMockLeakage('test.ts', code);
    const mockFindings = findings.filter(f => f.layer === 'L1-MOCK');
    // 可能有 low level 的 large data warning，但不应有 high/medium
    const seriousFindings = mockFindings.filter(f => f.severity === 'high' || f.severity === 'medium');
    console.log(`  ${seriousFindings.length === 0 ? '✓' : '✗'} Test 2: Annotated mock is allowed (${seriousFindings.length} false positives)`);
    if (seriousFindings.length === 0) passed++; else failed++;
  }

  // Test 3: 检测 catch → mock 模式
  {
    const code = [
      'const data = await fetch("/api/users").catch(() => [',
      '  { id: 1, name: "Alice" }',
      ']);',
    ];
    const findings = detectMockLeakage('test.ts', code);
    const hasCatchFinding = findings.some(f => f.type === 'mock-leakage');
    console.log(`  ${hasCatchFinding ? '✓' : '✗'} Test 3: Detect catch-to-mock pattern`);
    if (hasCatchFinding) passed++; else failed++;
  }

  // Test 4: 检测 mock 命名变量
  {
    const code = [
      'const mockData = {',
      '  id: 1,',
      '  name: "test",',
      '};',
    ];
    const findings = detectMockLeakage('test.ts', code);
    const nameFinding = findings.some(f => f.type === 'mock-leakage');
    console.log(`  ${nameFinding ? '✓' : '✗'} Test 4: Detect mock-indicating variable name (${findings.length} findings)`);
    if (nameFinding) passed++; else failed++;
  }

  // Test 5: @silly-mock:allow 豁免
  {
    const code = [
      '// @silly-mock:allow',
      'const users = [',
      '  { id: 1, name: "Alice" },',
      '];',
    ];
    const findings = detectMockLeakage('test.ts', code, {
      ...DEFAULT_CONFIG,
      allowTestExemption: true,
      testExemptionMarker: '@silly-mock:allow',
      allowedMockMarkers: ['MOCK_MODE: TRUE', '@silly-mock:allow'],
    });
    const mockFindings = findings.filter(f => f.layer === 'L1-MOCK');
    console.log(`  ${mockFindings.length === 0 ? '✓' : '✗'} Test 5: Exemption marker suppresses findings (${mockFindings.length} false positives)`);
    if (mockFindings.length === 0) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 5;
}

// ============================================================
// Layer 2: Regex 检测测试
// ============================================================

function testRegexDetector() {
  console.log('\n🧪 [L2-REGEX] Regex Detector Tests');
  let passed = 0, failed = 0;

  // Test 1: 检测 JSON 解析场景的 regex
  {
    const code = [
      'const jsonStr = \'{"name":"Alice"}\';',
      'const nameRegex = /"name"\\s*:\\s*"([^"]+)"/;',
      'const match = jsonStr.match(nameRegex);',
    ];
    const findings = detectRegexAbuse('test.ts', code);
    const hasJsonFinding = findings.some(f => f.message.includes('JSON'));
    console.log(`  ${hasJsonFinding ? '✓' : '✗'} Test 1: Detect regex for JSON parsing`);
    if (hasJsonFinding) passed++; else failed++;
  }

  // Test 2: 检测 HTML 解析场景的 regex
  {
    const code = [
      'const html = \'<div class="user">Alice</div>\';',
      'const nameRegex = /<div[^>]*>([^<]*)<\\/div>/;',
      'const match = html.match(nameRegex);',
    ];
    const findings = detectRegexAbuse('test.ts', code);
    const hasHtmlFinding = findings.some(f => f.message.includes('HTML'));
    console.log(`  ${hasHtmlFinding ? '✓' : '✗'} Test 2: Detect regex for HTML parsing`);
    if (hasHtmlFinding) passed++; else failed++;
  }

  // Test 3: 非结构化场景的正则不应触发
  {
    const code = [
      'const emailRegex = /^[\\w.-]+@[\\w.-]+\\.\\w+$/;',
      'const isValid = emailRegex.test(email);',
    ];
    const findings = detectRegexAbuse('test.ts', code);
    console.log(`  ${findings.length === 0 ? '✓' : '✗'} Test 3: Email validation regex not flagged`);
    if (findings.length === 0) passed++; else failed++;
  }

  // Test 4: 检测 new RegExp 创建
  {
    const code = [
      'const pattern = "\\\\d+";',
      'const regex = new RegExp(pattern); // parsing JSON fields',
      'const result = str.match(regex);',
    ];
    const findings = detectRegexAbuse('test.ts', code);
    console.log(`  ${findings.length > 0 ? '✓' : '✗'} Test 4: Detect new RegExp in structural context`);
    if (findings.length > 0) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 4;
}

// ============================================================
// Layer 3: Reality Binding 测试
// ============================================================

function testRealityBinder() {
  console.log('\n🧪 [L3-BINDING] Reality Binding Tests');
  let passed = 0, failed = 0;

  // Test 1: 检测无 source 的变量
  {
    const code = [
      'const users = transformData(someData);',
      'render(users);',
    ];
    const findings = detectRealityBinding('test.ts', code);
    const unboundFinding = findings.some(f => f.type === 'unbound-variable');
    console.log(`  ${unboundFinding ? '✓' : '✗'} Test 1: Detect unbound variable (no source)`);
    if (unboundFinding) passed++; else failed++;
  }

  // Test 2: 完整 source → sink 不应触发
  {
    const code = [
      'const users = await api.getUsers();',
      'render(users);',
    ];
    const findings = detectRealityBinding('test.ts', code);
    console.log(`  ${findings.length === 0 ? '✓' : '✗'} Test 2: Complete source→sink not flagged`);
    if (findings.length === 0) passed++; else failed++;
  }

  // Test 3: 变量有 source 无 sink
  {
    const code = [
      'const users = await fetch("/api/users");',
      '// never used...',
    ];
    const findings = detectRealityBinding('test.ts', code);
    const sinkFinding = findings.some(f => f.type === 'unbound-variable' && f.message.includes('sink'));
    console.log(`  ${sinkFinding ? '✓' : '✗'} Test 3: Detect source without sink`);
    if (sinkFinding) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 3;
}

// ============================================================
// Layer 4: Silent Failure 测试
// ============================================================

function testSilentFailureDetector() {
  console.log('\n🧪 [L4-SILENT] Silent Failure Detector Tests');
  let passed = 0, failed = 0;

  // Test 1: 检测空 catch 块
  {
    const code = [
      'try {',
      '  const data = JSON.parse(input);',
      '} catch (e) {',
      '  // ignore',
      '}',
    ];
    const findings = detectSilentFailure('test.ts', code);
    const emptyCatch = findings.some(f => f.message.includes('Empty catch'));
    console.log(`  ${emptyCatch ? '✓' : '✗'} Test 1: Detect empty catch block`);
    if (emptyCatch) passed++; else failed++;
  }

  // Test 2: 检测 I/O 函数无错误路径
  {
    const code = [
      'async function fetchUserData(userId: string) {',
      '  const response = await fetch(`/api/users/${userId}`);',
      '  const data = await response.json();',
      '  return data;',
      '}',
    ];
    const findings = detectSilentFailure('test.ts', code);
    const noErrorPath = findings.some(f => f.message.includes('error handling'));
    console.log(`  ${noErrorPath ? '✓' : '✗'} Test 2: Detect I/O function without error path`);
    if (noErrorPath) passed++; else failed++;
  }

  // Test 3: 完整错误处理不应触发
  {
    const code = [
      'async function fetchUserData(userId: string) {',
      '  try {',
      '    const response = await fetch(`/api/users/${userId}`);',
      '    if (!response.ok) throw new Error("HTTP " + response.status);',
      '    return await response.json();',
      '  } catch (err) {',
      '    console.error("Failed to fetch user:", err);',
      '    throw err;',
      '  }',
      '}',
    ];
    const findings = detectSilentFailure('test.ts', code);
    const falsePositive = findings.some(f => f.layer === 'L4-SILENT' && f.message.includes('error handling'));
    console.log(`  ${!falsePositive ? '✓' : '✗'} Test 3: Proper error handling not flagged`);
    if (!falsePositive) passed++; else failed++;
  }

  // Test 4: 检测 silent mock system
  {
    const code = Array(35).fill('').map((_, i) => {
      if (i === 0) return 'function processEverything() {';
      if (i === 34) return '}';
      return '  const x = ' + i + ';';
    });
    const findings = detectSilentFailure('test.ts', code);
    const silentMock = findings.some(f => f.message.includes('SILENT MOCK SYSTEM'));
    console.log(`  ${silentMock ? '✓' : '✗'} Test 4: Detect silent mock system`);
    if (silentMock) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 4;
}

// ============================================================
// Scorer 测试
// ============================================================

function testScorer() {
  console.log('\n🧪 [SCORE] Reality Score Tests');
  let passed = 0, failed = 0;

  // Test 1: 空 findings → 100 分
  {
    const score = calculateRealityScore([]);
    console.log(`  ${score === 100 ? '✓' : '✗'} Test 1: Empty findings = 100 (got ${score})`);
    if (score === 100) passed++; else failed++;
  }

  // Test 2: 严重发现 → 低分
  {
    const findings: Finding[] = [
      { layer: 'L1-MOCK', type: 'mock-leakage', severity: 'critical', file: 'test.ts', line: 1, message: 'test' },
      { layer: 'L4-SILENT', type: 'silent-failure', severity: 'critical', file: 'test.ts', line: 1, message: 'test' },
    ];
    const score = calculateRealityScore(findings);
    console.log(`  ${score < 90 ? '✓' : '✗'} Test 2: Critical findings reduce score (got ${score})`);
    if (score < 90) passed++; else failed++;
  }

  // Test 3: 低风险发现 → 少量扣分
  {
    const findings: Finding[] = [
      { layer: 'L1-MOCK', type: 'mock-leakage', severity: 'low', file: 'test.ts', line: 1, message: 'test' },
    ];
    const score = calculateRealityScore(findings);
    console.log(`  ${score >= 95 ? '✓' : '✗'} Test 3: Low severity minimal impact (got ${score})`);
    if (score >= 95) passed++; else failed++;
  }

  // Test 4: buildResult 集成测试
  {
    const findings: Finding[] = [
      { layer: 'L1-MOCK', type: 'mock-leakage', severity: 'high', file: 'test.ts', line: 1, message: 'mock data' },
      { layer: 'L2-REGEX', type: 'regex-abuse', severity: 'medium', file: 'test.ts', line: 5, message: 'regex' },
      { layer: 'L3-BINDING', type: 'unbound-variable', severity: 'medium', file: 'test.ts', line: 10, message: 'unbound' },
      { layer: 'L4-SILENT', type: 'silent-failure', severity: 'high', file: 'test.ts', line: 15, message: 'silent' },
    ];
    const result = buildResult(findings);
    const checks = [
      result.realityScore > 0 && result.realityScore <= 100,
      result.dimensions.mockLeakageRisk !== undefined,
      result.dimensions.regexAbuseRisk !== undefined,
      result.dimensions.realityBinding === 'FAIL',
      result.summary.totalFindings === 4,
      result.summary.errors > 0,
    ];
    const allPassed = checks.every(c => c);
    console.log(`  ${allPassed ? '✓' : '✗'} Test 4: buildResult coherent`);
    if (allPassed) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 4;
}

// ============================================================
// 集成测试
// ============================================================

function testIntegration() {
  console.log('\n🧪 [INTEGRATION] Full Pipeline Tests');
  let passed = 0, failed = 0;

  // Test 1: 干净的代码 → 高评分
  {
    const code = `/**
 * MOCK_MODE: TRUE
 * reason: API not available in dev
 */
const data = await fetch("/api/data").catch(() => {
  console.warn("[MOCK] Using fallback data");
  return [];
});

function processItems(items: string[]) {
  const result = items.map(item => item.toUpperCase());
  displayResults(result);
}
`;
    const result = enforceCode(code, 'clean.ts');
    console.log(`  ${result.passed ? '✓' : '✗'} Test 1: Clean code passes (score: ${result.realityScore})`);
    if (result.passed) passed++; else failed++;
  }

  // Test 2: 有问题的代码 → 低评分 + findings
  {
    const code = `const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

function processAll() {
  return users.map(u => u.name);
}
`;
    const result = enforceCode(code, 'dirty.ts');
    const hasFindings = result.findings.length > 0;
    console.log(`  ${hasFindings ? '✓' : '✗'} Test 2: Dirty code generates findings`);
    if (hasFindings) passed++; else failed++;
  }

  console.log(`  Results: ${passed}/${passed + failed} passed`);
  return passed === 2;
}

// ============================================================
// 主入口
// ============================================================

function main() {
  console.log('='.repeat(60));
  console.log('  HOS-Silly-Mock Test Suite');
  console.log('='.repeat(60));

  const results = [
    testMockDetector(),
    testRegexDetector(),
    testRealityBinder(),
    testSilentFailureDetector(),
    testScorer(),
    testIntegration(),
  ];

  const totalPassed = results.filter(r => r).length;
  const totalFailed = results.length - totalPassed;

  console.log('\n' + '='.repeat(60));
  console.log(`  Overall: ${totalPassed}/${results.length} test groups passed`);
  if (totalFailed > 0) {
    console.log(`  ${totalFailed} test group(s) FAILED`);
    process.exit(1);
  } else {
    console.log('  All tests PASSED ✓');
  }
  console.log('='.repeat(60));
}

main();
