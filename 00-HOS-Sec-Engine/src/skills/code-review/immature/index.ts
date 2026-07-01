/**
 * HOS-Sec-Engine V2 - Immature Vulnerability Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let immatureVulnSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./immature-vuln-skill');
  immatureVulnSkillList = mod.immatureVulnSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const immatureVulnSkills: AttackDefenseSkill[] = [
  ...immatureVulnSkillList,
];
