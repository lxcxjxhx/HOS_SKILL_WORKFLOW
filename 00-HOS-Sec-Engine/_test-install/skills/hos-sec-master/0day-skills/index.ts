/**
 * HOS-Sec-Engine V2 - 0day Skills Index
 * 
 * 0day 专属 Skill 加载入口。
 * 
 * 自动发现机制：SkillLoader 会递归扫描此目录下的所有 .ts 文件
 * 并加载所有导出的 Skill 数组。
 * 
 * AI 维护说明：
 * - 新增 0day Skill 只需在此目录下创建 .ts 文件并导出 skill 数组
 * - 文件命名：{领域}-{子类}-0day.ts
 * - 编译后 SkillLoader 自动发现，无需修改此文件
 */

import { AttackDefenseSkill } from '../../../types/skill';

let authBypassSkills: AttackDefenseSkill[] = [];
let deserSkills: AttackDefenseSkill[] = [];
let wafBypassSkills: AttackDefenseSkill[] = [];
let xssSkills: AttackDefenseSkill[] = [];

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
  xssSkills = mod.xss0daySkills || [];
} catch (e) {
  // Skill file unavailable
}

export const zeroDaySkills: AttackDefenseSkill[] = [
  ...authBypassSkills,
  ...deserSkills,
  ...wafBypassSkills,
  ...xssSkills,
];

export { authBypassSkills, deserSkills, wafBypassSkills, xssSkills };
