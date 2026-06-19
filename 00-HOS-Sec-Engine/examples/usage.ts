import { HosSecEngine, AttackDefenseSkill, Metadata, RiskLevel } from '../src/index';

// 创建引擎实例
const engine = new HosSecEngine({
  maxResults: 5,
  minMatchScore: 0.05,
  loadPresetSkills: true
});

console.log(`引擎已加载 ${engine.getSkillCount()} 个预设 Skill\n`);

// ==================== 示例 1: 查询 SQL 注入 WAF 绕过 ====================
console.log('\n========== 示例 1: 查询 SQL 注入 WAF 绕过 ==========\n');
const result1 = engine.execute({
  scenario: 'sql注入被waf拦截，需要绕过',
  categories: ['web']
});
console.log(result1);

// ==================== 示例 2: 按分类过滤查询 ====================
console.log('\n========== 示例 2: 按分类过滤查询 ==========\n');
const result2 = engine.execute({
  scenario: 'web 安全测试',
  categories: ['web']
});
console.log(result2);

// ==================== 示例 3: JSON 格式输出 ====================
console.log('\n========== 示例 3: JSON 格式输出 ==========\n');
const result3 = engine.execute({
  scenario: 'sql注入 waf 绕过',
  categories: ['web']
}, 'json');
console.log(result3);

// ==================== 示例 4: 自定义 Skill 注册 ====================
console.log('\n========== 示例 4: 自定义 Skill 注册 ==========\n');
const customSkill: AttackDefenseSkill = {
  metadata: {
    id: 'custom-api-idor-001',
    name: 'API 越权访问检测 (自定义)',
    category: 'api',
    subCategory: 'idor',
    riskLevel: 'high',
    confidence: 0.85,
    updatedAt: '2026-06',
    author: 'HOS Team',
    tags: ['api', 'idor', 'authorization']
  },
  trigger: {
    scenarios: ['API 接口存在越权访问', '修改用户ID可获取他人数据'],
    keywords: ['越权', 'idor', '未授权访问', '水平越权'],
    aliases: ['Insecure Direct Object Reference', 'IDOR'],
    indicators: ['200 OK with other user data', 'no auth error']
  },
  knowledge: {
    description: 'API 接口未对资源访问进行权限校验，攻击者可通过修改资源 ID 访问他人数据。',
    symptoms: ['修改 URL 中的用户 ID 可返回他人信息', 'API 响应中无权限校验逻辑'],
    rootCauses: ['未校验资源归属关系', '仅依赖前端权限控制'],
    observations: ['常见于 RESTful API 的 GET/PUT/DELETE 接口', 'REST API 设计时易忽略'],
    commonMistakes: ['仅测试登录用户的接口', '忽略批量查询接口', '忽略 GraphQL 嵌套查询'],
    notes: ['注意检查分页、搜索、过滤等间接访问路径']
  },
  action: {
    checklist: [
      '确认当前用户身份',
      '识别目标资源 ID 参数',
      '修改 ID 为其他用户资源',
      '观察是否返回数据'
    ],
    techniques: [
      '遍历用户 ID',
      '修改关联资源 ID',
      '测试批量查询接口'
    ],
    examples: [
      {
        name: '修改用户 ID',
        description: '将 URL 中的用户 ID 从自己的改为他人的',
        content: 'GET /api/users/123/profile -> GET /api/users/456/profile'
      }
    ]
  },
  validation: {
    indicators: ['返回 HTTP 200', '响应包含他人数据'],
    successSigns: ['成功获取非本人数据', '无权限拒绝提示'],
    falsePositiveSigns: ['返回脱敏数据', '返回空数据集']
  },
  defense: {
    recommendations: ['服务端校验资源归属关系', '使用 UUID 替代自增 ID'],
    mitigations: ['实施基于角色的访问控制 (RBAC)', '添加审计日志'],
    references: [
      'https://owasp.org/www-community/vulnerabilities/Insecure_Direct_Object_Reference'
    ]
  },
  quality: {
    confidence: 0.85,
    reviewed: true,
    tested: true,
    lastVerified: '2026-06'
  },
  enabled: true
};

engine.registerSkill(customSkill);
console.log(`已注册自定义 Skill: ${customSkill.metadata.name}`);
console.log(`当前 Skill 总数: ${engine.getSkillCount()}`);

const result4 = engine.execute({
  scenario: '越权访问测试 idor',
  categories: ['api']
});
console.log(result4);

// ==================== 示例 5: Skill 管理 ====================
console.log('\n========== 示例 5: Skill 管理 ==========\n');
engine.disableSkill('custom-api-idor-001');
console.log(`禁用 Skill custom-api-idor-001 后执行查询:`);
const result5 = engine.execute({
  scenario: '越权访问测试 idor',
  categories: ['api']
});
console.log(result5);

// ==================== 示例 6: 获取原始结果 ====================
console.log('\n========== 示例 6: 获取原始匹配结果 ==========\n');
const rawResults = engine.executeRaw({
  scenario: 'sql注入 waf bypass',
  categories: ['web']
});
for (const r of rawResults) {
  console.log(`Skill: ${r.skill.metadata.name}, Score: ${(r.matchScore * 100).toFixed(1)}%`);
  console.log(`  Keywords matched: ${r.matchDetails.matchedKeywords.join(', ') || 'none'}`);
}

console.log('\n========== 演示完成 ==========');
