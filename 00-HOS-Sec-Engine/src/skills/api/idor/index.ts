/**
 * HOS-Sec-Engine V2 - IDOR Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let idorDetectionSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./idor-detection');
  idorDetectionSkills = mod.idorDetectionSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const idorSkills: AttackDefenseSkill[] = [
  ...idorDetectionSkills,
];

export { idorDetectionSkills };
