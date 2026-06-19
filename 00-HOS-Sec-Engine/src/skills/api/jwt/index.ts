/**
 * HOS-Sec-Engine V2 - JWT Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let jwtAttackSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./jwt-attacks');
  jwtAttackSkills = mod.jwtAttackSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const jwtSkills: AttackDefenseSkill[] = [
  ...jwtAttackSkills,
];

export { jwtAttackSkills };
