/**
 * HOS-Sec-Engine V2 - Deepfake Detection Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let deepfakeDetectionSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./deepfake-detection-skill');
  deepfakeDetectionSkillList = mod.deepfakeDetectionSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const deepfakeDetectionSkills: AttackDefenseSkill[] = [
  ...deepfakeDetectionSkillList,
];
