/**
 * HOS-Sec-Engine V2 - S3 Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let s3MisconfigSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./s3-misconfig');
  s3MisconfigSkills = mod.s3MisconfigSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const s3Skills: AttackDefenseSkill[] = [
  ...s3MisconfigSkills,
];

export { s3MisconfigSkills };
