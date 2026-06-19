/**
 * HOS-Sec-Engine V2 - K8s Misconfig Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let k8sMisconfigSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./k8s-misconfig-skill');
  k8sMisconfigSkillList = mod.k8sMisconfigSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const k8sMisconfigSkills: AttackDefenseSkill[] = [
  ...k8sMisconfigSkillList,
];
