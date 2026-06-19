/**
 * HOS-Sec-Engine V2 - File Upload Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let uploadBypassSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./upload-bypass');
  uploadBypassSkills = mod.uploadBypassSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const uploadSkills: AttackDefenseSkill[] = [
  ...uploadBypassSkills,
];

export { uploadBypassSkills };
