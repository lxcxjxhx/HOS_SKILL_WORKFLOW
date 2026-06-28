/**
 * HOS-Sec-Engine V2 - 0day Web Skills Index
 *
 * Zero-day web security skills loaded at build/compile time.
 */

import { AttackDefenseSkill } from '../../../types/skill';

let authBypassSkills: AttackDefenseSkill[] = [];
let deserSkills: AttackDefenseSkill[] = [];
let wafBypassSkills: AttackDefenseSkill[] = [];
let xss0daySkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./web-auth-bypass-0day');
  authBypassSkills = mod.authBypass0daySkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./web-deser-0day');
  deserSkills = mod.deser0daySkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./web-waf-bypass-0day');
  wafBypassSkills = mod.wafBypass0daySkills || [];
} catch (e) {
  // Skill file unavailable
}

try {
  const mod = require('./web-xss-0day');
  xss0daySkills = mod.xss0daySkills || [];
} catch (e) {
  // Skill file unavailable
}

export const zeroDayWebSkills: AttackDefenseSkill[] = [
  ...authBypassSkills,
  ...deserSkills,
  ...wafBypassSkills,
  ...xss0daySkills,
];
