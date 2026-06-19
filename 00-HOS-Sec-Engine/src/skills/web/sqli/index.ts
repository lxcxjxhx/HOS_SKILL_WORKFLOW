/**
 * HOS-Sec-Engine V2 - SQL Injection Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let sqliWafBypassSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./sqli-waf-bypass');
  sqliWafBypassSkills = mod.sqliWafBypassSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const sqliSkills: AttackDefenseSkill[] = [
  ...sqliWafBypassSkills,
];

export { sqliWafBypassSkills };
