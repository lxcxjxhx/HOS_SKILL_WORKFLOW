/**
 * HOS-Sec-Engine V2 - Rate Limit Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let rateLimitBypassSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./rate-limit-bypass');
  rateLimitBypassSkills = mod.rateLimitBypassSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const rateLimitSkills: AttackDefenseSkill[] = [
  ...rateLimitBypassSkills,
];

export { rateLimitBypassSkills };
