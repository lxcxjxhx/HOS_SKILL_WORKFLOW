/**
 * HOS-Sec-Engine V2 - Prompt Injection Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let promptInjectionSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./prompt-injection-skill');
  promptInjectionSkillList = mod.promptInjectionSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const promptInjectionSkills: AttackDefenseSkill[] = [
  ...promptInjectionSkillList,
];
