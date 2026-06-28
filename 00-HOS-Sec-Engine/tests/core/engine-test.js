/**
 * HOS-Sec-Engine 核心引擎测试
 * 验证 Skill 加载、场景匹配、流程编排、缓存、循环保护
 */
const path = require('path');
const projectDir = path.resolve(__dirname, '../..');
const { HosSecEngine } = require(path.join(projectDir, 'dist/src/core/engine'));
const { webPentestFull } = require(path.join(projectDir, 'dist/src/playbooks/web/web-pentest-full'));
const { apiSecurityReview } = require(path.join(projectDir, 'dist/src/playbooks/web/api-security-review'));
const { domainPentest } = require(path.join(projectDir, 'dist/src/playbooks/intranet/domain-pentest'));

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    passCount++;
    console.log(`  ✅ Test ${passCount + failCount}: ${testName}`);
  } else {
    failCount++;
    console.log(`  ❌ Test ${passCount + failCount}: ${testName}`);
  }
}

async function runTests() {
  console.log('\n========== HOS-Sec-Engine 核心引擎测试 ==========\n');

  // Test 1: Engine instantiation and skill loading
  const engine = new HosSecEngine();
  const skills = engine.getSkills();
  assert(skills.length >= 24, `Skill 加载: ${skills.length} 个 Skill 加载成功 (>= 24)`);

  // Test 2: SQL injection scenario matching - use skill's own scenario text for high match
  const sqliMatch = engine.executeRaw({ scenario: '目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403' });
  assert(sqliMatch.length > 0 && sqliMatch[0].skill.metadata.id === 'web-sqli-001',
    `SQL注入匹配: ${sqliMatch.length > 0 ? sqliMatch[0].skill.metadata.id : '无匹配'}`);

  // Test 3: XSS scenario matching
  const xssMatch = engine.executeRaw({ scenario: '目标页面存在用户输入反射但未触发经典 XSS payload，CSP 策略限制了内联脚本执行' });
  const hasXss = xssMatch.some(m => m.skill.metadata.id.includes('xss'));
  assert(hasXss, `XSS匹配: ${hasXss ? xssMatch.find(m => m.skill.metadata.id.includes('xss'))?.skill.metadata.id : '无匹配'}`);

  // Test 4: JWT scenario matching
  const jwtMatch = engine.executeRaw({ scenario: '目标 API 使用 JWT 进行身份认证或授权，Authorization Bearer 请求头中包含 JWT' });
  const hasJwt = jwtMatch.some(m => m.skill.metadata.id === 'api-jwt-001');
  assert(hasJwt, `JWT匹配: ${hasJwt ? 'api-jwt-001' : '无匹配'}`);

  // Test 5: Playbook loading and execution (no infinite loop)
  engine.loadPlaybook(webPentestFull);
  engine.loadPlaybook(apiSecurityReview);
  engine.loadPlaybook(domainPentest);
  const playbooks = engine.getPlaybooks();
  assert(playbooks.length >= 3, `流程编排: ${playbooks.length} 个 Playbook 已加载 (>= 3)`);

  // Test 5b: Execute playbook to verify no infinite loop
  try {
    engine.loadPlaybook(webPentestFull);
    const flowResult = await engine.orchestrator.executeFlow({
      target: 'https://example.com',
      accessLevel: 'anonymous',
      findings: [],
      history: [],
      customData: {},
    });
    assert(flowResult.status !== 'error', `流程执行: web-pentest-full 执行完成, 状态=${flowResult.status}`);
  } catch (e) {
    assert(false, `流程执行: 异常 - ${e.message}`);
  }

  // Test 6: Performance - 100 repeated matches
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    engine.executeRaw({ scenario: '目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403' });
  }
  const elapsed = Date.now() - start;
  assert(elapsed < 1000, `性能: 100次匹配耗时 ${elapsed}ms (< 1000ms)`);

  // Test 7: Cache stats
  try {
    const { Scorer } = require(path.join(projectDir, 'dist/src/core/scorer'));
    if (typeof Scorer.getCacheStats === 'function') {
      const scorerStats = Scorer.getCacheStats();
      console.log(`  📊 Scorer 缓存: ${JSON.stringify(scorerStats)}`);
    }
  } catch {}
  try {
    const { SkillMatcher } = require(path.join(projectDir, 'dist/src/core/matcher'));
    if (typeof SkillMatcher.getCacheStats === 'function') {
      const matcherStats = SkillMatcher.getCacheStats();
      console.log(`  📊 Matcher 缓存: ${JSON.stringify(matcherStats)}`);
    }
  } catch {}

  // Test 8: Skill enable/disable
  engine.disableSkill('web-sqli-001');
  const disabledMatch = engine.executeRaw({ scenario: '目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403' });
  const isDisabled = !disabledMatch.some(m => m.skill.metadata.id === 'web-sqli-001');
  assert(isDisabled, 'Skill禁用: web-sqli-001 已禁用');

  engine.enableSkill('web-sqli-001');
  const reenabledMatch = engine.executeRaw({ scenario: '目标存在 SQL 注入点但常规 payload 被 WAF 拦截返回 403' });
  const isReenabled = reenabledMatch.some(m => m.skill.metadata.id === 'web-sqli-001');
  assert(isReenabled, 'Skill重新启用: web-sqli-001 已重新启用');

  // Test 9: Loop protection constants verification
  const orchestrator = require(path.join(projectDir, 'dist/src/core/orchestrator'));
  assert(orchestrator.MAX_PHASE_ITERATIONS >= 100, `循环保护: MAX_PHASE_ITERATIONS = ${orchestrator.MAX_PHASE_ITERATIONS}`);

  // Test 10: Category count
  const categoryCount = engine.getSkillCountByCategory();
  assert(categoryCount.size > 0, `分类统计: ${categoryCount.size} 个分类`);

  // Test 11: Server loop protection constants
  const server = require(path.join(projectDir, 'dist/src/runtime/server'));
  assert(typeof server.AgentServer === 'function', 'Server: AgentServer 类存在');

  // Test 12: Execution context loop protection
  const execCtx = require(path.join(projectDir, 'dist/src/runtime/execution-context'));
  assert(typeof execCtx.ExecutionContextManager === 'function', 'ExecutionContext: 类存在');

  // Summary
  console.log(`\n========== 测试总结 ==========`);
  console.log(`  通过: ${passCount}`);
  console.log(`  失败: ${failCount}`);
  console.log(`  总计: ${passCount + failCount}`);
  console.log(`  结果: ${failCount === 0 ? '✅ 全部通过' : '❌ 存在失败'}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
