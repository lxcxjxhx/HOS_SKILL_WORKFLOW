import type { Playbook } from '../../types/playbook';

/**
 * 云配置审计流程
 * 仅作为流程模板的元数据入口
 */
export const cloudConfigAudit: Playbook = {
  id: 'cloud-config-audit',
  name: '云配置审计',
  description: '针对主流云平台（AWS、Azure、GCP）的配置安全审计方法论框架',
  category: 'cloud',
  phases: [],  // 从 YAML 模板加载
  metadata: {
    version: '3.0.0',
    difficulty: 'intermediate',
    estimatedTime: '4-6小时',
    prerequisites: ['云平台只读访问权限', '云安全基础知识'],
    targetEnvironment: ['AWS', 'Azure', 'GCP', '混合云环境']
  }
};
