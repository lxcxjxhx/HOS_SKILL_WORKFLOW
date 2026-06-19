/**
 * HOS-Sec-Engine V2 - Windows Privilege Escalation Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let windowsPrivEscSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./windows-priv-esc-skill');
  windowsPrivEscSkillList = mod.windowsPrivEscSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const windowsPrivEscSkills: AttackDefenseSkill[] = [
  ...windowsPrivEscSkillList,
];
