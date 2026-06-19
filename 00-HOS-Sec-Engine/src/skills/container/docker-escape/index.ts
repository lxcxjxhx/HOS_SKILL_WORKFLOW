/**
 * HOS-Sec-Engine V2 - Docker Escape Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let dockerEscapeSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./docker-escape-skill');
  dockerEscapeSkillList = mod.dockerEscapeSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const dockerEscapeSkills: AttackDefenseSkill[] = [
  ...dockerEscapeSkillList,
];
