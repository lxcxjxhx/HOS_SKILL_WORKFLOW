/**
 * HOS-Sec-Engine V2 - Active Directory Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let domainEnumSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./domain-enumeration');
  domainEnumSkills = mod.domainEnumSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const adSkills: AttackDefenseSkill[] = [
  ...domainEnumSkills,
];

export { domainEnumSkills };
