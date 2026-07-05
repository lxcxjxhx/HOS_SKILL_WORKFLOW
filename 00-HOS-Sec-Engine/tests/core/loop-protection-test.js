/**
 * HOS-Sec-Engine Loop Protection Tests
 *
 * Verifies that infinite loop safeguards in core modules function correctly.
 */
const assert = require('assert');

// Test 1: MAX_PHASE_ITERATIONS exists and is a reasonable value
try {
  const orchestrator = require('../../dist/src/core/orchestrator');
  // Check that the orchestrator has iteration limits
  const source = require('fs').readFileSync(
    require('path').join(__dirname, '..', '..', 'src', 'core', 'orchestrator.ts'),
    'utf-8'
  );
  const match = source.match(/MAX_PHASE_ITERATIONS\s*[:=]\s*(\d+)/);
  assert.ok(match, 'MAX_PHASE_ITERATIONS constant must exist');
  const value = parseInt(match[1], 10);
  assert.ok(value >= 50 && value <= 500, `MAX_PHASE_ITERATIONS (${value}) should be between 50 and 500`);
  console.log(`  [PASS] MAX_PHASE_ITERATIONS = ${value}`);
} catch (e) {
  console.log(`  [FAIL] ${e.message}`);
  process.exitCode = 1;
}

// Test 2: MAX_SCAN_DEPTH exists in fs-safe (single source of truth)
try {
  const fsSafe = require('../../dist/src/utils/fs-safe');
  assert.ok(fsSafe.MAX_SCAN_DEPTH !== undefined, 'MAX_SCAN_DEPTH constant must exist');
  const value = fsSafe.MAX_SCAN_DEPTH;
  assert.ok(typeof value === 'number', 'MAX_SCAN_DEPTH must be a number');
  assert.ok(value >= 10 && value <= 50, `MAX_SCAN_DEPTH (${value}) should be between 10 and 50`);
  console.log(`  [PASS] MAX_SCAN_DEPTH = ${value}`);
} catch (e) {
  console.log(`  [FAIL] ${e.message}`);
  process.exitCode = 1;
}

// Test 3: MAX_SCAN_DEPTH in fs-safe shared utility
try {
  const fsSafe = require('../../dist/src/utils/fs-safe');
  assert.ok(fsSafe.MAX_SCAN_DEPTH, 'fs-safe MAX_SCAN_DEPTH must exist');
  assert.ok(typeof fsSafe.MAX_SCAN_DEPTH === 'number', 'MAX_SCAN_DEPTH must be a number');
  console.log(`  [PASS] fs-safe.MAX_SCAN_DEPTH = ${fsSafe.MAX_SCAN_DEPTH}`);
} catch (e) {
  console.log(`  [FAIL] fs-safe.MAX_SCAN_DEPTH: ${e.message}`);
  process.exitCode = 1;
}

// Test 4: isSafeToTraverse works correctly
try {
  const fsSafe = require('../../dist/src/utils/fs-safe');
  const visited = new Set();

  // Non-existent path should return false
  const result1 = fsSafe.isSafeToTraverse('/nonexistent/path', 0, visited, 'test');
  assert.strictEqual(result1, false, 'Non-existent path should not be safe');

  // Existent path at depth 0 should return true
  const result2 = fsSafe.isSafeToTraverse(__dirname, 0, new Set(), 'test');
  assert.strictEqual(result2, true, 'Existing path at depth 0 should be safe');

  // Path beyond MAX_SCAN_DEPTH should return false
  const result3 = fsSafe.isSafeToTraverse(__dirname, 999, new Set(), 'test');
  assert.strictEqual(result3, false, 'Path beyond max depth should not be safe');

  console.log('  [PASS] isSafeToTraverse works correctly');
} catch (e) {
  console.log(`  [FAIL] isSafeToTraverse: ${e.message}`);
  process.exitCode = 1;
}

// Test 5: Check deploy-skills and generate-skills-md also reference MAX_SCAN_DEPTH from fs-safe
const deployPath = require('path').join(__dirname, '..', '..', 'src', 'scripts', 'deploy-skills.ts');
if (require('fs').existsSync(deployPath)) {
  try {
    const deploySource = require('fs').readFileSync(deployPath, 'utf-8');
    // Should import from fs-safe now
    assert.ok(
      deploySource.includes("from '../utils/fs-safe'"),
      'deploy-skills.ts must import from fs-safe'
    );
    console.log('  [PASS] deploy-skills.ts imports from fs-safe');
  } catch (e) {
    console.log(`  [FAIL] deploy-skills fs-safe check: ${e.message}`);
    process.exitCode = 1;
  }
} else {
  console.log('  [SKIP] deploy-skills.ts not found (deleted during refactoring)');
}

console.log('\nLoop protection tests:', process.exitCode ? 'FAILED' : 'ALL PASSED');
