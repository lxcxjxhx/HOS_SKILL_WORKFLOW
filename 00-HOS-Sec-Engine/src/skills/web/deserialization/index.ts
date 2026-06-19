/**
 * HOS-Sec-Engine V2 - Deserialization Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let deserializationExploitSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./deserialization-exploit');
  deserializationExploitSkills = mod.deserializationExploitSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const deserializationSkills: AttackDefenseSkill[] = [
  ...deserializationExploitSkills,
];

export { deserializationExploitSkills };
