/**
 * HOS-Sec-Engine V2 - SSRF Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let ssrfDetectionSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./ssrf-detection');
  ssrfDetectionSkills = mod.ssrfDetectionSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const ssrfSkills: AttackDefenseSkill[] = [
  ...ssrfDetectionSkills,
];

export { ssrfDetectionSkills };
