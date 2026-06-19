/**
 * HOS-Sec-Engine V2 - Cloud Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let s3Skills: AttackDefenseSkill[] = [];
let iamSkills: AttackDefenseSkill[] = [];
let metadataSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./s3');
  s3Skills = mod.s3Skills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./iam');
  iamSkills = mod.iamSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./metadata');
  metadataSkills = mod.metadataSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const cloudSkills: AttackDefenseSkill[] = [
  ...s3Skills,
  ...iamSkills,
  ...metadataSkills,
];

export { s3Skills, iamSkills, metadataSkills };
