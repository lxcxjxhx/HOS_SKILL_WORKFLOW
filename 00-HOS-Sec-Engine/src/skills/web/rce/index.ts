/**
 * HOS-Sec-Engine V2 - RCE Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let commandInjectionSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./command-injection');
  commandInjectionSkills = mod.commandInjectionSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const rceSkills: AttackDefenseSkill[] = [
  ...commandInjectionSkills,
];

export { commandInjectionSkills };
