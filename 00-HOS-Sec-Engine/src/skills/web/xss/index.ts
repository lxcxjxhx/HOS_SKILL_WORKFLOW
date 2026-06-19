/**
 * HOS-Sec-Engine V2 - XSS Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let xssFilterBypassSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./xss-filter-bypass');
  xssFilterBypassSkills = mod.xssFilterBypassSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const xssSkills: AttackDefenseSkill[] = [
  ...xssFilterBypassSkills,
];

export { xssFilterBypassSkills };
