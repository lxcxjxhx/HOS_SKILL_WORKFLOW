/**
 * HOS-Sec-Engine V2 - Java Deserialization Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let javaDeserSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./java-deser-skill');
  javaDeserSkillList = mod.javaDeserSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const javaDeserSkills: AttackDefenseSkill[] = [
  ...javaDeserSkillList,
];
