/**
 * HOS-Sec-Engine V3 - 预定义流程模板导出
 * 提供各场景的标准攻防流程编排模板
 */

// Web 安全流程
export { webPentestFull } from './web/web-pentest-full';
export { apiSecurityReview } from './web/api-security-review';

// 内网安全流程
export { domainPentest } from './intranet/domain-pentest';

// 云安全流程
export { cloudConfigAudit } from './cloud/cloud-config-audit';

// 代码审计流程
export { codeReviewJava } from './audit/code-review-java';

import type { Playbook } from '../types/playbook';
import { webPentestFull } from './web/web-pentest-full';
import { apiSecurityReview } from './web/api-security-review';
import { domainPentest } from './intranet/domain-pentest';
import { cloudConfigAudit } from './cloud/cloud-config-audit';
import { codeReviewJava } from './audit/code-review-java';

/**
 * 所有预定义流程列表
 */
export const allPlaybooks: Playbook[] = [
  webPentestFull,
  apiSecurityReview,
  domainPentest,
  cloudConfigAudit,
  codeReviewJava
];

/**
 * 按分类获取流程
 */
export function getPlaybooksByCategory(category: string): Playbook[] {
  return allPlaybooks.filter(p => p.category === category);
}

/**
 * 根据 ID 获取流程
 */
export function getPlaybookById(id: string): Playbook | undefined {
  return allPlaybooks.find(p => p.id === id);
}
