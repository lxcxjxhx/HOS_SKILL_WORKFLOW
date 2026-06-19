/**
 * HOS-Sec-Engine V2 - IAM Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

let iamPrivilegeEscalationSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./iam-privilege-escalation');
  iamPrivilegeEscalationSkills = mod.iamPrivilegeEscalationSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const iamSkills: AttackDefenseSkill[] = [
  ...iamPrivilegeEscalationSkills,
];

export { iamPrivilegeEscalationSkills };
