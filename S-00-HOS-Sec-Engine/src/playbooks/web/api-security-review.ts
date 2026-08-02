import type { Playbook } from '../../types/playbook';

/**
 * API 安全审计流程
 * 仅作为流程模板的元数据入口
 */
export const apiSecurityReview: Playbook = {
  id: 'api-security-review',
  name: 'API 安全审计',
  description: '针对 RESTful API 和 GraphQL 接口的全面安全审计方法论框架',
  category: 'api',
  phases: [],  // 从 YAML 模板加载
  metadata: {
    version: '3.0.0',
    difficulty: 'intermediate',
    estimatedTime: '2-4小时',
    prerequisites: ['API 接口文档或端点列表', '测试账号（不同权限级别）'],
    targetEnvironment: ['RESTful API', 'GraphQL API', 'gRPC 服务']
  }
};
