/**
 * HOS-Sec-Engine V2 - Test Verify Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let testVerify001Skills: AttackDefenseSkill[] = [];
try {
  const mod = require('./test-verify-001');
  testVerify001Skills = mod.testVerifySkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const testVerifySkills: AttackDefenseSkill[] = [
  ...testVerify001Skills,
];

export { testVerify001Skills };
