import type { Playbook } from '../../types/playbook';

/**
 * Java 代码审计流程
 * 针对 Java 应用的源代码安全审计流程
 */
export const codeReviewJava: Playbook = {
  id: 'code-review-java',
  name: 'Java 代码审计',
  description: '针对 Java 应用的源代码安全审计流程，覆盖依赖分析、反序列化审计、注入点审计等',
  category: 'audit',
  phases: [
    {
      id: 'dependency-analysis',
      name: '依赖分析',
      order: 1,
      description: '分析项目依赖，识别已知漏洞组件、过时库和不安全依赖',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['vulnerableDependencies', 'outdatedLibraries', 'licenseRisks', 'dependencyTree']
    },
    {
      id: 'deserialization-audit',
      name: '反序列化审计',
      order: 2,
      description: '审计 Java 反序列化漏洞，包括原生反序列化、JSON 反序列化、XML 反序列化等',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['deserializationVulns', 'unsafeGadgets', 'exploitChains'],
      nextPhaseCondition: 'deserializationVulns'
    },
    {
      id: 'injection-audit',
      name: '注入点审计',
      order: 3,
      description: '审计 SQL 注入、命令注入、表达式注入等注入类漏洞',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['injectionPoints', 'unsafeQueries', 'commandExecutions'],
      nextPhaseCondition: 'injectionPoints'
    },
    {
      id: 'auth-audit',
      name: '认证鉴权审计',
      order: 4,
      description: '审计认证逻辑、会话管理、权限控制等安全机制',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['authFlaws', 'sessionIssues', 'authorizationBypasses'],
      nextPhaseCondition: 'authFlaws'
    },
    {
      id: 'business-logic-audit',
      name: '业务逻辑审计',
      order: 5,
      description: '审计业务逻辑漏洞，包括并发问题、条件竞争、业务流程绕过等',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['logicVulns', 'raceConditions', 'bypassVectors']
    },
    {
      id: 'crypto-audit',
      name: '密码学审计',
      order: 6,
      description: '审计加密算法使用、密钥管理、随机数生成等密码学实现',
      skills: [
        'code-review-java-deser-001'
      ],
      outputSchema: ['weakAlgorithms', 'keyManagementIssues', 'cryptoMisuses']
    }
  ],
  metadata: {
    version: '1.0.0',
    difficulty: 'advanced',
    estimatedTime: '6-12小时',
    prerequisites: ['Java 源代码访问权限', 'Java 安全开发基础', '常见框架知识'],
    targetEnvironment: ['Spring Boot 应用', 'Java EE 应用', '微服务架构']
  }
};
