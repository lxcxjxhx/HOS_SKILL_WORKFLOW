import type { Playbook } from '../../types/playbook';

/**
 * 云配置审计流程
 * 针对主流云平台（AWS、Azure、GCP）的配置安全审计
 */
export const cloudConfigAudit: Playbook = {
  id: 'cloud-config-audit',
  name: '云配置审计',
  description: '针对主流云平台的配置安全审计流程，覆盖资产发现、配置审计和权限测试',
  category: 'cloud',
  phases: [
    {
      id: 'cloud-discovery',
      name: '云资产发现',
      order: 1,
      description: '发现并枚举云环境中的所有资产，包括存储桶、IAM 角色、元数据服务等',
      skills: [
        'cloud-s3-001',
        'cloud-iam-001',
        'cloud-meta-001'
      ],
      outputSchema: ['storageBuckets', 'iamRoles', 'instances', 'services', 'networks']
    },
    {
      id: 'config-audit',
      name: '配置审计',
      order: 2,
      description: '审计云资源配置的安全性，识别公开访问、加密缺失、日志关闭等问题',
      skills: [
        'cloud-s3-001',
        'cloud-iam-001'
      ],
      outputSchema: ['misconfigurations', 'publicResources', 'unencryptedData', 'loggingGaps'],
      nextPhaseCondition: 'misconfigurations'
    },
    {
      id: 'iam-testing',
      name: '权限测试',
      order: 3,
      description: '测试 IAM 权限配置，识别权限过大、横向移动和提权路径',
      skills: [
        'cloud-iam-001'
      ],
      condition: 'misconfigurations',
      outputSchema: ['privilegeEscalationPaths', 'excessivePermissions', 'lateralMovements']
    },
    {
      id: 'serverless-testing',
      name: 'Serverless 安全测试',
      order: 4,
      description: '测试 Lambda、Functions 等 Serverless 服务的安全性',
      skills: [
        'cloud-meta-001'
      ],
      outputSchema: ['serverlessVulns', 'eventAbuse', 'environmentLeak']
    },
    {
      id: 'container-testing',
      name: '容器安全测试',
      order: 5,
      description: '测试 EKS、GKE、AKS 等容器服务的安全性',
      skills: [
        'cloud-meta-001'
      ],
      outputSchema: ['containerVulns', 'registryIssues', 'clusterMisconfigs']
    }
  ],
  metadata: {
    version: '1.0.0',
    difficulty: 'intermediate',
    estimatedTime: '4-6小时',
    prerequisites: ['云平台只读访问权限', '云安全基础知识'],
    targetEnvironment: ['AWS', 'Azure', 'GCP', '混合云环境']
  }
};
