import type { Playbook } from '../../types/playbook';

/**
 * API 安全审计流程
 * 针对 RESTful API、GraphQL 等接口的安全测试流程
 * 注意: 所有引用的 skill ID 必须已定义在 src/skills/ 中
 */
export const apiSecurityReview: Playbook = {
  id: 'api-security-review',
  name: 'API 安全审计',
  description: '针对 RESTful API 和 GraphQL 接口的全面安全审计，覆盖认证、鉴权、越权、速率限制、注入等测试',
  category: 'api',
  phases: [
    {
      id: 'auth-testing',
      name: '认证鉴权测试',
      order: 1,
      description: '测试 JWT、OAuth 2.0、API Key 等认证机制的安全性',
      skills: [
        'api-jwt-001',
        'api-oauth-001'
      ],
      outputSchema: ['authFlaws', 'tokenWeaknesses', 'sessionIssues'],
      nextPhaseCondition: 'authFlaws'
    },
    {
      id: 'authorization-testing',
      name: '越权测试',
      order: 2,
      description: '测试水平越权（IDOR）和垂直越权（BOLA），验证访问控制是否有效',
      skills: [
        'api-idor-001'
      ],
      condition: 'findings',
      outputSchema: ['idorFindings', 'privilegeEscalations', 'accessControlFlaws'],
      nextPhaseCondition: 'findings'
    },
    {
      id: 'rate-limit-testing',
      name: '速率限制测试',
      order: 3,
      description: '测试 API 的速率限制、暴力破解防护和拒绝服务防护',
      skills: [
        'api-ratelimit-001'
      ],
      outputSchema: ['rateLimitBypasses', 'bruteForceResults', 'dosVectors']
    },
    {
      id: 'graphql-testing',
      name: 'GraphQL 安全测试',
      order: 4,
      description: '测试 GraphQL 端点注入、深度查询和 schema 信息泄露',
      skills: [
        'api-graphql-injection-001'
      ],
      outputSchema: ['graphqlVulns', 'introspectionLeak', 'depthQueryIssues']
    },
    {
      id: 'input-validation',
      name: '输入验证测试',
      order: 5,
      description: '测试 API 输入参数验证，包括 SQL 注入、XSS、命令注入、XXE 等',
      skills: [
        'web-sqli-001',
        'web-xss-001',
        'web-rce-001',
        'web-xxe-001',
        'web-upload-001'
      ],
      condition: 'vulnerabilities',
      outputSchema: ['injectionFindings', 'validationFlaws', 'inputAbuse']
    }
  ],
  metadata: {
    version: '1.1.0',
    difficulty: 'intermediate',
    estimatedTime: '2-4小时',
    prerequisites: ['API 接口文档或端点列表', '测试账号（不同权限级别）'],
    targetEnvironment: ['RESTful API', 'GraphQL API', 'gRPC 服务']
  }
};
