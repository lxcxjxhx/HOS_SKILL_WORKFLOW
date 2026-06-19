/**
 * HOS-Sec-Engine V2 - All Skills Index (Auto-Discovery)
 * 攻防专项 Skill 统一入口
 *
 * 自动发现机制：使用 SkillLoader 递归扫描 skills/ 目录下所有已编译的 .js 文件
 * 自动提取所有导出的 Skill 数组
 *
 * AI 维护说明：
 * - 新增 Skill 只需在 skills/ 任意子目录下创建 .ts 文件
 * - 编译后 SkillLoader 自动发现，无需修改此文件
 */

import { AttackDefenseSkill } from '../types/skill';
import { SkillLoader } from '../core/loader';

// 自动扫描加载所有 Skill
let autoDiscoveredSkills: AttackDefenseSkill[] = [];

try {
  // 在编译后，从 dist/skills/ 目录中自动扫描
  const skillsDir = require('path').resolve(__dirname);
  autoDiscoveredSkills = SkillLoader.loadFromDirectory(skillsDir);
} catch (e) {
  console.warn('自动发现 Skills 失败:', e);
}

export const allSkills: AttackDefenseSkill[] = autoDiscoveredSkills;

// 按领域分类导出（便捷访问）
export const webSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'web');
export const apiSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'api');
export const cloudSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'cloud');
export const windowsSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'windows');
export const linuxSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'linux');
export const aiSecuritySkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'ai-security');
export const adSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'ad');
export const mobileSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'mobile');
export const containerSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'container');
export const kubernetesSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'kubernetes');
export const codeReviewSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'code-review');
export const reverseSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'reverse');
export const malwareAnalysisSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'malware-analysis');
export const threatHuntingSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'threat-hunting');
export const defenseSkills = autoDiscoveredSkills.filter(s => s.metadata.category === 'defense');
