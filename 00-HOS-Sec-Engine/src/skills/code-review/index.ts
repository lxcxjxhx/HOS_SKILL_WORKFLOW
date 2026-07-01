/**
 * HOS-Sec-Engine V2 - Code Review Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let javaDeserSkills: AttackDefenseSkill[] = [];
let immatureVulnSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./java-deser');
  javaDeserSkills = mod.javaDeserSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./immature');
  immatureVulnSkillList = mod.immatureVulnSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const codeReviewSkills: AttackDefenseSkill[] = [
  ...javaDeserSkills,
  ...immatureVulnSkillList,
];

export { javaDeserSkills, immatureVulnSkillList };
