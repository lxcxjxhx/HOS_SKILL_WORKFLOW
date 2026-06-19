/**
 * HOS-Sec-Engine V2 - Web Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let sqliSkills: AttackDefenseSkill[] = [];
let xssSkills: AttackDefenseSkill[] = [];
let ssrfSkills: AttackDefenseSkill[] = [];
let xxeSkills: AttackDefenseSkill[] = [];
let uploadSkills: AttackDefenseSkill[] = [];
let rceSkills: AttackDefenseSkill[] = [];
let deserializationSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./sqli');
  sqliSkills = mod.sqliSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./xss');
  xssSkills = mod.xssSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./ssrf');
  ssrfSkills = mod.ssrfSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./xxe');
  xxeSkills = mod.xxeSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./upload');
  uploadSkills = mod.uploadSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./rce');
  rceSkills = mod.rceSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

try {
  const mod = require('./deserialization');
  deserializationSkills = mod.deserializationSkills || [];
} catch (e) {
  // Skill file unavailable (may be blocked by security software)
}

export const webSkills: AttackDefenseSkill[] = [
  ...sqliSkills,
  ...xssSkills,
  ...ssrfSkills,
  ...xxeSkills,
  ...uploadSkills,
  ...rceSkills,
  ...deserializationSkills,
];

export { sqliSkills, xssSkills, ssrfSkills, xxeSkills, uploadSkills, rceSkills, deserializationSkills };
