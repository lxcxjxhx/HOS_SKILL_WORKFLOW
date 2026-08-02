/**
 * HOS-Silly-Mock: Manual Interactive Test
 *
 * 手动运行测试以验证功能。
 * 运行: npx ts-node tests/manual.ts 或 node tests/manual.js
 *
 * 这个文件模拟了实际代码分析场景，展示 4 层检测的输出。
 */

// 使用 ts-node 或直接运行编译后的 JS
// 这里使用纯 JS 以便直接运行

const path = require('path');

// 测试场景 1: 无标注的 mock
const code1 = `
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
  { id: 4, name: "Diana", email: "diana@example.com" },
];

function displayUsers() {
  return users.map(u => \`\${u.name}: \${u.email}\`);
}
`;

// 测试场景 2: regex 滥用
const code2 = `
function parseUserName(html: string): string {
  const match = html.match(/<div class="user-name">([^<]*)<\\/div>/);
  return match ? match[1] : '';
}

function extractJsonField(json: string, field: string): string {
  const regex = new RegExp('"' + field + '":\\s*"([^"]+)"');
  const match = json.match(regex);
  return match ? match[1] : '';
}
`;

// 测试场景 3: 无 error path 的 I/O 函数
const code3 = `
async function loadDashboardData() {
  const users = await fetch('/api/users');
  const userData = await users.json();

  const orders = await fetch('/api/orders');
  const orderData = await orders.json();

  const analytics = await fetch('/api/analytics');
  const analyticsData = await analytics.json();

  return { users: userData, orders: orderData, analytics: analyticsData };
}
`;

// 测试场景 4: 正确代码（带标注和错误处理）
const code4 = `
/**
 * MOCK_MODE: TRUE
 * reason: Backend not deployed, using static data for UI development
 * @silly-mock:allow
 */
const products = [
  { id: 1, name: "Widget", price: 9.99 },
  { id: 2, name: "Gadget", price: 19.99 },
];

async function loadUserProfile(userId: string) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: Failed to load user\`);
    }
    return await response.json();
  } catch (err) {
    console.error("User load failed:", err);
    throw err;
  }
}

function renderProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;
  products.forEach(p => {
    const el = document.createElement('div');
    el.textContent = \`\${p.name} - $\${p.price}\`;
    container.appendChild(el);
  });
}
`;

async function main() {
  const { enforceCode, printReport } = await import('../src/index');

  console.log('='.repeat(70));
  console.log('  HOS-Silly-Mock Manual Test');
  console.log('='.repeat(70));

  console.log('\n--- Scenario 1: Unannotated Mock Data ---');
  let result = enforceCode(code1, 'mock-data.ts');
  printReport(result);

  console.log('\n--- Scenario 2: Regex Abuse ---');
  result = enforceCode(code2, 'regex-abuse.ts');
  printReport(result);

  console.log('\n--- Scenario 3: Silent Failure (No Error Path) ---');
  result = enforceCode(code3, 'silent-failure.ts');
  printReport(result);

  console.log('\n--- Scenario 4: Correct Code (Annotated + Error Handling) ---');
  result = enforceCode(code4, 'correct-code.ts');
  printReport(result);

  console.log('\n' + '='.repeat(70));
  console.log('  Manual test complete');
  console.log('='.repeat(70));
}

main().catch(console.error);
