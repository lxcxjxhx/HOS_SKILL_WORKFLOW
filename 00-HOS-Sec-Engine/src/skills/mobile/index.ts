/**
 * HOS-Sec-Engine V2 - Mobile Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let androidApkSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./android-apk');
  androidApkSkills = mod.androidApkSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const mobileSkills: AttackDefenseSkill[] = [
  ...androidApkSkills,
];

export { androidApkSkills };
