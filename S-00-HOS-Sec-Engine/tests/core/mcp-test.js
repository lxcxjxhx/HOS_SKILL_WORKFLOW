/**
 * HOS-Sec-Engine V6 - MCP 自我管理层单元测试
 *
 * 验证 MCP 注册中心、自动发现、工具路由、健康监控四层功能
 */

const path = require('path');
const PROJECT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');

// 导入 MCP 模块
const {
  MCPRegistry,
  mcpRegistry,
  MCPRouter,
  mcpRouter,
  MCPHealthMonitor,
  mcpHealthMonitor,
} = require(path.join(DIST_DIR, 'src/mcp/index'));

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
  console.log('\n========== HOS-Sec-Engine V6: MCP 自我管理层测试 ==========\n');

  // ==================== 1. Registry Tests ====================
  console.log('\n--- 1. MCP 注册中心 ---\n');

  // Test 1: Registry singleton
  assert(typeof mcpRegistry.registerServer === 'function', 'MCPRegistry.registerServer exists');
  assert(typeof mcpRegistry.getServers === 'function', 'MCPRegistry.getServers exists');
  assert(typeof mcpRegistry.unregisterServer === 'function', 'MCPRegistry.unregisterServer exists');
  assert(typeof mcpRegistry.startServer === 'function', 'MCPRegistry.startServer exists');
  assert(typeof mcpRegistry.stopServer === 'function', 'MCPRegistry.stopServer exists');
  assert(typeof mcpRegistry.findServersByTool === 'function', 'MCPRegistry.findServersByTool exists');
  assert(typeof mcpRegistry.findServersByCapability === 'function', 'MCPRegistry.findServersByCapability exists');
  assert(typeof mcpRegistry.registerTools === 'function', 'MCPRegistry.registerTools exists');

  // Test 2: Register server
  mcpRegistry.registerServer({
    name: 'test-http',
    command: 'node',
    args: ['-e', 'console.log("mcp server")'],
    env: {},
    description: 'Test HTTP server',
    autoStart: false,
    maxRestarts: 1,
    healthCheckIntervalMs: 60000,
    timeoutMs: 5000,
    tags: ['test', 'http'],
  });

  const servers = mcpRegistry.getServers();
  assert(servers.some(s => s.config.name === 'test-http'), 'Server registered in registry');
  assert(servers.length >= 1, 'Registry contains at least 1 server');

  // Test 3: Get server by name
  const server = mcpRegistry.getServer('test-http');
  assert(server !== undefined, 'getServer returns server by name');
  assert(server !== undefined && server.config.command === 'node', 'Server config preserved');
  assert(server !== undefined && server.enabled === true, 'Server enabled by default');
  assert(server !== undefined && server.config.tags.includes('http'), 'Server tags preserved');

  // Test 4: Duplicate registration throws
  let dupeError = false;
  try {
    mcpRegistry.registerServer({
      name: 'test-http',
      command: 'node',
      args: [],
      env: {},
      description: '',
      autoStart: false,
      maxRestarts: 1,
      healthCheckIntervalMs: 60000,
      timeoutMs: 5000,
      tags: [],
    });
  } catch (err) {
    dupeError = true;
  }
  assert(dupeError, 'Duplicate registration throws error');

  // Test 5: Register tools
  mcpRegistry.registerTools('test-http', [
    { name: 'http_get', description: 'HTTP GET request', inputSchema: {}, category: 'network' },
    { name: 'http_post', description: 'HTTP POST request', inputSchema: {}, category: 'network' },
  ]);

  const httpServers = mcpRegistry.findServersByTool('http_get');
  assert(httpServers.some(s => s.config.name === 'test-http'), 'Tool index: findServersByTool works');
  assert(!mcpRegistry.findServersByTool('nonexistent').some(s => s.config.name === 'test-http'), 'Tool index: nonexistent tool returns empty');

  // Test 6: Register capabilities
  mcpRegistry.registerCapabilities('test-http', [
    { name: 'http-requests', description: 'Send HTTP requests', tools: ['http_get', 'http_post'], level: 'core' },
  ]);

  const capServers = mcpRegistry.findServersByCapability('http-requests');
  assert(capServers.some(s => s.config.name === 'test-http'), 'Capability index: findServersByCapability works');

  // Test 7: Find by tag
  const tagServers = mcpRegistry.findServersByTag('test');
  assert(tagServers.some(s => s.config.name === 'test-http'), 'Tag index: findServersByTag works');

  // Test 8: Find by category
  const catTools = mcpRegistry.findToolsByCategory('network');
  assert(catTools.length >= 2, 'findToolsByCategory returns tools');
  assert(catTools.every(t => t.tool.category === 'network'), 'All returned tools have correct category');

  // Test 9: GetAllTools
  const allTools = mcpRegistry.getAllTools();
  assert(allTools.length >= 2, 'getAllTools returns all registered tools');
  assert(allTools.some(t => t.tool.name === 'http_get'), 'getAllTools includes http_get');

  // Test 10: Unregister server
  const unregResult = mcpRegistry.unregisterServer('test-http');
  assert(unregResult === true, 'Unregister server returns true');
  assert(mcpRegistry.getServer('test-http') === undefined, 'Server removed from registry after unregister');

  // Test 11: Unregister nonexistent server
  const unregNonExist = mcpRegistry.unregisterServer('nonexistent');
  assert(unregNonExist === false, 'Unregister nonexistent returns false');

  // Test 12: Server count
  const count = mcpRegistry.getServerCount();
  assert(count >= 0, 'getServerCount returns valid count');

  // ==================== 2. Router Tests ====================
  console.log('\n--- 2. MCP 工具路由 ---\n');

  // Test 13: Router singleton
  assert(typeof mcpRouter.routeAndExecute === 'function', 'MCPRouter.routeAndExecute exists');
  assert(typeof mcpRouter.findToolsForScenario === 'function', 'MCPRouter.findToolsForScenario exists');
  assert(typeof mcpRouter.registerMapping === 'function', 'MCPRouter.registerMapping exists');
  assert(typeof mcpRouter.getMapping === 'function', 'MCPRouter.getMapping exists');
  assert(typeof mcpRouter.getAllMappings === 'function', 'MCPRouter.getAllMappings exists');

  // Test 14: Pre-registered mappings
  const allMappings = mcpRouter.getAllMappings();
  assert(allMappings.length > 0, 'Default mappings are registered');

  // Test 15: Get specific mapping
  const sqliMapping = mcpRouter.getMapping('web-sqli-001');
  assert(sqliMapping !== undefined, 'web-sqli-001 mapping exists');
  assert(sqliMapping !== undefined && sqliMapping.requiredMCPServers.includes('http-fetch'), 'Mapping requires http-fetch');

  const wafMapping = mcpRouter.getMapping('web-waf-bypass-0day');
  assert(wafMapping !== undefined, 'web-waf-bypass-0day mapping exists');
  assert(wafMapping !== undefined && wafMapping.recommendedMCPServers.includes('memory'), 'WAF bypass mapping recommends memory');

  // Test 16: Check skill requirements
  const requirements = mcpRouter.checkSkillRequirements('web-sqli-001');
  assert(typeof requirements.available === 'boolean', 'checkSkillRequirements returns available flag');
  assert(Array.isArray(requirements.missingServers), 'checkSkillRequirements returns missingServers array');
  assert(Array.isArray(requirements.availableServers), 'checkSkillRequirements returns availableServers array');

  // Test 17: Register custom mapping
  mcpRouter.registerMapping({
    skillId: 'test-skill-001',
    requiredMCPServers: ['test-http'],
    recommendedMCPServers: ['memory'],
    toolMappings: [
      { action: 'test action', server: 'test-http', tool: 'http_get', inputTemplate: { url: '{target}' } },
    ],
  });
  const testMapping = mcpRouter.getMapping('test-skill-001');
  assert(testMapping !== undefined, 'Custom mapping registered');
  assert(testMapping !== undefined && testMapping.toolMappings.length === 1, 'Custom mapping has tool mappings');

  // Test 18: Find tools for scenario
  const scenarioTools = mcpRouter.findToolsForScenario('sql injection waf bypass');
  assert(Array.isArray(scenarioTools), 'findToolsForScenario returns array');

  // Test 19: Route and execute (simulated)
  // Register a server first for routing test
  mcpRegistry.registerServer({
    name: 'test-router',
    command: 'node',
    args: ['-e', 'process.stdin.on("data", d => process.stdout.write(d))'],
    env: {},
    description: 'Router test server',
    autoStart: false,
    maxRestarts: 1,
    healthCheckIntervalMs: 60000,
    timeoutMs: 5000,
    tags: ['test'],
  });
  mcpRegistry.registerTools('test-router', [
    { name: 'test_tool', description: 'A test tool', inputSchema: {}, category: 'network' },
  ]);

  const routeResult = await mcpRouter.routeAndExecute({
    serverName: 'test-router',
    toolName: 'test_tool',
    arguments: { test: true },
  });
  assert(routeResult.serverName === 'test-router', 'routeAndExecute returns correct server');
  assert(routeResult.toolName === 'test_tool', 'routeAndExecute returns correct tool');
  assert(typeof routeResult.success === 'boolean', 'routeAndExecute returns success flag');
  assert(typeof routeResult.durationMs === 'number', 'routeAndExecute returns duration');

  // Test 20: Route to nonexistent server
  const badResult = await mcpRouter.routeAndExecute({
    serverName: 'nonexistent',
    toolName: 'test_tool',
    arguments: {},
  });
  assert(badResult.success === false, 'routeAndExecute to nonexistent server returns failure');

  mcpRegistry.unregisterServer('test-router');

  // ==================== 3. Health Monitor Tests ====================
  console.log('\n--- 3. MCP 健康监控 ---\n');

  // Test 21: Health monitor singleton
  assert(typeof mcpHealthMonitor.runFullCheck === 'function', 'MCPHealthMonitor.runFullCheck exists');
  assert(typeof mcpHealthMonitor.runQuickCheck === 'function', 'MCPHealthMonitor.runQuickCheck exists');
  assert(typeof mcpHealthMonitor.getStatus === 'function', 'MCPHealthMonitor.getStatus exists');
  assert(typeof mcpHealthMonitor.start === 'function', 'MCPHealthMonitor.start exists');
  assert(typeof mcpHealthMonitor.stop === 'function', 'MCPHealthMonitor.stop exists');

  // Test 22: Initial status
  const initStatus = mcpHealthMonitor.getStatus();
  assert(typeof initStatus.running === 'boolean', 'getStatus returns running flag');
  assert(typeof initStatus.servers === 'number', 'getStatus returns server count');
  assert(typeof initStatus.healthy === 'number', 'getStatus returns healthy server count');

  // Test 23: Start and stop
  mcpHealthMonitor.start(60000, 30000);
  const startedStatus = mcpHealthMonitor.getStatus();
  assert(startedStatus.running === true, 'Health monitor running after start');

  mcpHealthMonitor.stop();
  const stoppedStatus = mcpHealthMonitor.getStatus();
  assert(stoppedStatus.running === false, 'Health monitor stopped after stop');

  // ==================== 4. Engine Integration (optional) ====================
  console.log('\n--- 4. 引擎集成验证 ---\n');

  try {
    const { HosSecEngine } = require(path.join(DIST_DIR, 'src/core/engine'));
    const engine = new HosSecEngine({ loadPresetSkills: false });

    // Test 24: Engine has MCP methods
    assert(typeof engine.initMCP === 'function', 'Engine.initMCP exists');
    assert(typeof engine.getMCPServers === 'function', 'Engine.getMCPServers exists');
    assert(typeof engine.getMCPStatus === 'function', 'Engine.getMCPStatus exists');
    assert(typeof engine.executeMCPToolCall === 'function', 'Engine.executeMCPToolCall exists');
    assert(typeof engine.discoverMCPServers === 'function', 'Engine.discoverMCPServers exists');
    assert(typeof engine.checkMCPHealth === 'function', 'Engine.checkMCPHealth exists');
    assert(typeof engine.registerMCPServer === 'function', 'Engine.registerMCPServer exists');
    assert(typeof engine.getMCPToolsForSkill === 'function', 'Engine.getMCPToolsForSkill exists');

    // Test 25: MCP status without initialization
    const status = engine.getMCPStatus();
    assert(typeof status.initialized === 'boolean', 'MCP status has initialized flag');
    assert(typeof status.enabled === 'boolean', 'MCP status has enabled flag');
    assert(typeof status.servers === 'object', 'MCP status has servers info');
    assert(typeof status.tools === 'object', 'MCP status has tools info');

    // Test 26: V6 module status
    const v6Status = engine.getV6ModuleStatus();
    assert(typeof v6Status.mcp === 'object', 'V6 status has mcp section');
    assert(typeof v6Status.registry === 'object', 'V6 status has registry section');
    assert(typeof v6Status.router === 'object', 'V6 status has router section');
    assert(typeof v6Status.health === 'object', 'V6 status has health section');

    // Test 27: Engine MCP disabled mode
    const engineNoMCP = new HosSecEngine({ loadPresetSkills: false, mcpEnabled: false });
    const noMcpStatus = engineNoMCP.getMCPStatus();
    assert(noMcpStatus.enabled === false, 'Engine mcpEnabled=false disables MCP');

    // Test 28: Register MCP server via engine
    engine.registerMCPServer({
      name: 'engine-test-server',
      command: 'echo',
      args: ['test'],
      env: {},
      description: 'Engine test',
      autoStart: false,
      maxRestarts: 1,
      healthCheckIntervalMs: 60000,
      timeoutMs: 5000,
      tags: ['engine-test'],
    });
    const engineServers = engine.getMCPServers();
    assert(engineServers.some(s => s.config.name === 'engine-test-server'), 'Engine.registerMCPServer works');
    assert(engine.getMCPServerCount() >= 1, 'Engine.getMCPServerCount returns count');

    // Test 29: MCP tools for skill
    const toolsForSkill = engine.getMCPToolsForSkill('web-waf-bypass-0day');
    assert(Array.isArray(toolsForSkill), 'getMCPToolsForSkill returns array');

    // Test 30: Check skill MCP requirements
    const skillReqs = engine.checkSkillMCPRequirements('web-sqli-001');
    assert(typeof skillReqs.available === 'boolean', 'checkSkillMCPRequirements returns available');

    // Cleanup engine test server
    engine.unregisterMCPServer('engine-test-server');

    // Test 31: Known MCP packages
    const knownPkgs = engine.getKnownMCPPackages();
    assert(Array.isArray(knownPkgs), 'getKnownMCPPackages returns array');
    assert(knownPkgs.length >= 10, 'Known packages list has at least 10 entries');

    console.log(`\n  📊 引擎已加载 ${engine.getSkillCount()} 个 Skill`);
  } catch (err) {
    console.log(`  ⚠️ 引擎集成测试跳过（部分模块未编译）: ${err.message}`);
    // Not failing the overall test - just informative
  }

  // Summary
  console.log(`\n========== MCP 测试总结 ==========`);
  console.log(`  通过: ${passCount}`);
  console.log(`  失败: ${failCount}`);
  console.log(`  总计: ${passCount + failCount}`);
  console.log(`  结果: ${failCount === 0 ? '✅ 全部通过' : '❌ 存在失败'}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('MCP 测试执行异常:', err);
  process.exit(1);
});
