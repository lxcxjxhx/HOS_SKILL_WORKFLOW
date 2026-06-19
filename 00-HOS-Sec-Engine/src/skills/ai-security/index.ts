/**
 * HOS-Sec-Engine V2 - AI Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let promptInjectionSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./prompt-injection');
  promptInjectionSkills = mod.promptInjectionSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const aiSecuritySkills: AttackDefenseSkill[] = [
  ...promptInjectionSkills,
];

export { promptInjectionSkills };
