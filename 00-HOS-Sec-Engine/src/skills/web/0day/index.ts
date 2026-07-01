/**
 * HOS-Sec-Engine V2 - 0day Web Skills Index
 *
 * Zero-day web security skills — use safe loading to handle
 * potential security software interference.
 */

import { AttackDefenseSkill } from '../../../types/skill';

function loadSkillsSafely(path: string, exportName: string): AttackDefenseSkill[] {
  try {
    const mod = require(path);
    return mod[exportName] || [];
  } catch (e: any) {
    if (e?.code !== 'MODULE_NOT_FOUND') {
      console.warn(`[0day/index] 加载 ${path} 时出现非预期错误:`, e?.message || e);
    }
    return [];
  }
}

const authBypassSkills = loadSkillsSafely('./web-auth-bypass-0day', 'authBypass0daySkills');
const deserSkills = loadSkillsSafely('./web-deser-0day', 'deser0daySkills');
const wafBypassSkills = loadSkillsSafely('./web-waf-bypass-0day', 'wafBypass0daySkills');
const xss0daySkills = loadSkillsSafely('./web-xss-0day', 'xss0daySkills');

export const zeroDayWebSkills: AttackDefenseSkill[] = [
  ...authBypassSkills,
  ...deserSkills,
  ...wafBypassSkills,
  ...xss0daySkills,
];
