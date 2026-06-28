/**
 * HOS-Sec-Engine V2 - Web Security Skills Index
 */

import { AttackDefenseSkill } from '../../types/skill';

let sqliSkills: AttackDefenseSkill[] = [];
let xssSkills: AttackDefenseSkill[] = [];
let ssrfSkills: AttackDefenseSkill[] = [];
let xxeSkills: AttackDefenseSkill[] = [];
let uploadSkills: AttackDefenseSkill[] = [];
let rceSkills: AttackDefenseSkill[] = [];
let deserializationSkills: AttackDefenseSkill[] = [];
let zeroDayWebSkills: AttackDefenseSkill[] = [];
let testVerifySkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./sqli');
  sqliSkills = mod.sqliSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./xss');
  xssSkills = mod.xssSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./ssrf');
  ssrfSkills = mod.ssrfSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./xxe');
  xxeSkills = mod.xxeSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./upload');
  uploadSkills = mod.uploadSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./rce');
  rceSkills = mod.rceSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./deserialization');
  deserializationSkills = mod.deserializationSkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./0day');
  zeroDayWebSkills = mod.zeroDayWebSkills || [];
} catch (e) {
  // 0day skill file unavailable
}

try {
  const mod = require('./test-verify');
  testVerifySkills = mod.testVerifySkills || [];
} catch (e) {
  // Test verify skill file unavailable
}

export const webSkills: AttackDefenseSkill[] = [
  ...sqliSkills,
  ...xssSkills,
  ...ssrfSkills,
  ...xxeSkills,
  ...uploadSkills,
  ...rceSkills,
  ...deserializationSkills,
  ...zeroDayWebSkills,
  ...testVerifySkills,
];

export { sqliSkills, xssSkills, ssrfSkills, xxeSkills, uploadSkills, rceSkills, deserializationSkills, zeroDayWebSkills, testVerifySkills };
