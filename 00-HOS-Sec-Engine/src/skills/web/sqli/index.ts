/**
 * HOS-Sec-Engine V2 - SQL Injection Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

// 使用带类型守卫的动态加载：某些技能文件包含攻击 payload，
// 可能被安全软件隔离，捕获 ENOENT 即可，其他错误应记录警告
function loadSkillsSafely(path: string): AttackDefenseSkill[] {
  try {
    const mod = require(path);
    return mod.sqliWafBypassSkills || [];
  } catch (e: any) {
    if (e?.code === 'MODULE_NOT_FOUND') {
      // 技能文件被安全软件隔离或未编译
      return [];
    }
    console.warn(`[sqli/index] 加载 ${path} 时出现非预期错误:`, e?.message || e);
    return [];
  }
}

export const sqliWafBypassSkills = loadSkillsSafely('./sqli-waf-bypass');

export const sqliSkills: AttackDefenseSkill[] = [
  ...sqliWafBypassSkills,
];
