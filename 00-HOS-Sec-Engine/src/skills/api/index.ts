/**
 * HOS-Sec-Engine V2 - API Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let jwtSkills: AttackDefenseSkill[] = [];
let idorSkills: AttackDefenseSkill[] = [];
let oauthSkills: AttackDefenseSkill[] = [];
let rateLimitSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./jwt');
  jwtSkills = mod.jwtSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./idor');
  idorSkills = mod.idorSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./oauth');
  oauthSkills = mod.oauthSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./rate-limit');
  rateLimitSkills = mod.rateLimitSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const apiSkills: AttackDefenseSkill[] = [
  ...jwtSkills,
  ...idorSkills,
  ...oauthSkills,
  ...rateLimitSkills,
];

export { jwtSkills, idorSkills, oauthSkills, rateLimitSkills };
