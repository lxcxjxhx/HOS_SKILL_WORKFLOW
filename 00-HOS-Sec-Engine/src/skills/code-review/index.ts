/**
 * HOS-Sec-Engine V2 - Code Review Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let javaDeserSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./java-deser');
  javaDeserSkills = mod.javaDeserSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const codeReviewSkills: AttackDefenseSkill[] = [
  ...javaDeserSkills,
];

export { javaDeserSkills };
