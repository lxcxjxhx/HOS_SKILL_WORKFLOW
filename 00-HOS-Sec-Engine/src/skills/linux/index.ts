/**
 * HOS-Sec-Engine V2 - Linux Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let linuxPrivEscSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./linux-privilege-escalation');
  linuxPrivEscSkills = mod.linuxPrivEscSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const linuxSkills: AttackDefenseSkill[] = [
  ...linuxPrivEscSkills,
];

export { linuxPrivEscSkills };
