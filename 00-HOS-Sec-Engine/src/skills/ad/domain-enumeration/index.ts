/**
 * HOS-Sec-Engine V2 - Domain Enumeration Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let domainEnumSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./domain-enum-skill');
  domainEnumSkillList = mod.domainEnumSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const domainEnumSkills: AttackDefenseSkill[] = [
  ...domainEnumSkillList,
];
