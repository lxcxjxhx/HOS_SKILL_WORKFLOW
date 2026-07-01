/**
 * HOS-Sec-Engine V2 - AI Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let promptInjectionSkills: AttackDefenseSkill[] = [];
let aiToolingVulnSkillList: AttackDefenseSkill[] = [];
let deepfakeDetectionSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./prompt-injection');
  promptInjectionSkills = mod.promptInjectionSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./tooling-vuln');
  aiToolingVulnSkillList = mod.aiToolingVulnSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./deepfake-detection');
  deepfakeDetectionSkillList = mod.deepfakeDetectionSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const aiSecuritySkills: AttackDefenseSkill[] = [
  ...promptInjectionSkills,
  ...aiToolingVulnSkillList,
  ...deepfakeDetectionSkillList,
];

export { promptInjectionSkills, aiToolingVulnSkillList, deepfakeDetectionSkillList };
