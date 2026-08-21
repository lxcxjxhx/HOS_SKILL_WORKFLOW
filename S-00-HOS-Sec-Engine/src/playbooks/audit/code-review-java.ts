import type { Playbook } from '../../types/playbook';

/**
 * Java 代码审计流程
 * 仅作为流程模板的元数据入口
 */
export const codeReviewJava: Playbook = {
  id: 'code-review-java',
  name: 'Java 代码审计',
  description: '针对 Java 应用的源代码安全审计方法论框架',
  category: 'audit',
  phases: [],  // 从 YAML 模板加载
  metadata: {
    version: '3.0.0',
    difficulty: 'advanced',
    estimatedTime: '6-12小时',
    prerequisites: ['Java 源代码访问权限', 'Java 安全开发基础', '常见框架知识'],
    targetEnvironment: ['Spring Boot 应用', 'Java EE 应用', '微服务架构']
  }
};
