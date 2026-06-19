/**
 * HOS-Sec-Engine V2 - Linux Privilege Escalation Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let linuxPrivEscSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./linux-priv-esc-skill');
  linuxPrivEscSkillList = mod.linuxPrivEscSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const linuxPrivEscSkills: AttackDefenseSkill[] = [
  ...linuxPrivEscSkillList,
];
