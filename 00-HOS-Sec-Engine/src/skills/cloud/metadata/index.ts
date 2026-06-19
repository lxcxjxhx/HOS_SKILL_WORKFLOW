/**
 * HOS-Sec-Engine V2 - Cloud Metadata Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let cloudMetadataSSRFSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./cloud-ssrf');
  cloudMetadataSSRFSkills = mod.cloudMetadataSSRFSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const metadataSkills: AttackDefenseSkill[] = [
  ...cloudMetadataSSRFSkills,
];

export { cloudMetadataSSRFSkills };
