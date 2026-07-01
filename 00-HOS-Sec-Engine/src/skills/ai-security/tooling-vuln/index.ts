/**
 * HOS-Sec-Engine V2 - AI Tooling Vulnerability Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let aiToolingVulnSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./tooling-vuln-skill');
  aiToolingVulnSkillList = mod.aiToolingVulnSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const aiToolingVulnSkills: AttackDefenseSkill[] = [
  ...aiToolingVulnSkillList,
];
