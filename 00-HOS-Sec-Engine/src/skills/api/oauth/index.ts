/**
 * HOS-Sec-Engine V2 - OAuth Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let oauthAttackSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./oauth-attacks');
  oauthAttackSkills = mod.oauthAttackSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const oauthSkills: AttackDefenseSkill[] = [
  ...oauthAttackSkills,
];

export { oauthAttackSkills };
