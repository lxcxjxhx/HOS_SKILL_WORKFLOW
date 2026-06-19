/**
 * HOS-Sec-Engine V2 - Container Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let dockerEscapeSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./docker-escape');
  dockerEscapeSkills = mod.dockerEscapeSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const containerSkills: AttackDefenseSkill[] = [
  ...dockerEscapeSkills,
];

export { dockerEscapeSkills };
