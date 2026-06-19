/**
 * HOS-Sec-Engine V2 - Windows Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let windowsPrivEscSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./windows-privilege-escalation');
  windowsPrivEscSkills = mod.windowsPrivEscSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const windowsSkills: AttackDefenseSkill[] = [
  ...windowsPrivEscSkills,
];

export { windowsPrivEscSkills };
