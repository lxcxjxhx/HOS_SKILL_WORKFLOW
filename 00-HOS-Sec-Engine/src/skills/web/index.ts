/**
 * HOS-Sec-Engine V2 - Web Security Skills Index
 *
 * 使用静态导入而非 dynamic require() 以获得更好的类型安全、
 * 编译时错误检测和 IDE 自动补全支持。
 *
 * AI 维护说明：
 * - 新增子分类只需导入新模块并添加到 webSkills 数组
 * - 禁用某个子分类只需注释掉对应行
 */

import { AttackDefenseSkill } from '../../types/skill';
import { sqliSkills as _sqliSkills } from './sqli';
import { xssSkills as _xssSkills } from './xss';
import { ssrfSkills as _ssrfSkills } from './ssrf';
import { xxeSkills as _xxeSkills } from './xxe';
import { uploadSkills as _uploadSkills } from './upload';
import { rceSkills as _rceSkills } from './rce';
import { deserializationSkills as _deserializationSkills } from './deserialization';
import { zeroDayWebSkills as _zeroDayWebSkills } from './0day';

export const webSkills: AttackDefenseSkill[] = [
  ..._sqliSkills,
  ..._xssSkills,
  ..._ssrfSkills,
  ..._xxeSkills,
  ..._uploadSkills,
  ..._rceSkills,
  ..._deserializationSkills,
  ..._zeroDayWebSkills,
];

// 重新导出供外部或测试引用
export { _sqliSkills as sqliSkills, _xssSkills as xssSkills, _ssrfSkills as ssrfSkills, _xxeSkills as xxeSkills };
export { _uploadSkills as uploadSkills, _rceSkills as rceSkills, _deserializationSkills as deserializationSkills, _zeroDayWebSkills as zeroDayWebSkills };
