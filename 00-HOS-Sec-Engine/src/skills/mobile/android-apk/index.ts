/**
 * HOS-Sec-Engine V2 - Android APK Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let androidApkSkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./android-apk-skill');
  androidApkSkillList = mod.androidApkSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const androidApkSkills: AttackDefenseSkill[] = [
  ...androidApkSkillList,
];
