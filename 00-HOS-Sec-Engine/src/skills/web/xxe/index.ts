/**
 * HOS-Sec-Engine V2 - XXE Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let xxeInjectionSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./xxe-injection');
  xxeInjectionSkills = mod.xxeInjectionSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const xxeSkills: AttackDefenseSkill[] = [
  ...xxeInjectionSkills,
];

export { xxeInjectionSkills };
