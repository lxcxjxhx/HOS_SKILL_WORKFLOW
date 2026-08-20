/**
 * S-14-HOS-Jailbreak-Loop: Defense Module Index
 * 统一防御策略导出与工具函数
 *
 * 导出所有防御策略模块，提供查询、渲染和组合工具。
 */

import type { AttackCategory, DefenseStrategy, DefenseType } from '../types';
import { INPUT_FILTER_DEFENSES } from './input-filter';
import { IDENTITY_LOCK_DEFENSES } from './identity-lock';
import { CONTEXT_GUARD_DEFENSES } from './context-guard';
import { LAYERED_WALL_DEFENSES } from './layered-wall';
import { CANARY_DEFENSES } from './canary';

// ─── 重新导出子模块 ──────────────────────────────────────────────────

export { INPUT_FILTER_DEFENSES } from './input-filter';
export { IDENTITY_LOCK_DEFENSES } from './identity-lock';
export { CONTEXT_GUARD_DEFENSES } from './context-guard';
export { LAYERED_WALL_DEFENSES } from './layered-wall';
export { CANARY_DEFENSES } from './canary';

// ─── 合并集合 ──────────────────────────────────────────────────────────

/** 所有防御策略的合并数组 */
export const ALL_DEFENSES: DefenseStrategy[] = [
  ...INPUT_FILTER_DEFENSES,
  ...IDENTITY_LOCK_DEFENSES,
  ...CONTEXT_GUARD_DEFENSES,
  ...LAYERED_WALL_DEFENSES,
  ...CANARY_DEFENSES,
];

/** 按 ID 索引的防御策略映射 */
const DEFENSE_MAP: Map<string, DefenseStrategy> = new Map(
  ALL_DEFENSES.map(function (d) { return [d.id, d]; })
);

// ─── 查询工具函数 ──────────────────────────────────────────────────────

/**
 * 按类型获取防御策略
 * @param type 防御类型
 * @returns 匹配的防御策略数组
 */
export function getDefensesByType(type: DefenseType): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) { return d.type === type; });
}

/**
 * 按强度等级获取防御策略（精确匹配）
 * @param strength 防御强度 (1-5)
 * @returns 匹配的防御策略数组
 */
export function getDefensesByStrength(strength: number): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) { return d.strength === strength; });
}

/**
 * 按强度范围获取防御策略
 * @param minStrength 最小强度
 * @param maxStrength 最大强度
 * @returns 匹配的防御策略数组
 */
export function getDefensesByStrengthRange(
  minStrength: number,
  maxStrength: number
): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) {
    return d.strength >= minStrength && d.strength <= maxStrength;
  });
}

/**
 * 按检测类别获取防御策略
 * @param category 攻击类别
 * @returns 匹配的防御策略数组
 */
export function getDefensesByCategory(category: AttackCategory): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) {
    return d.detectsCategories.indexOf(category) !== -1;
  });
}

/**
 * 按标签获取防御策略
 * @param tag 标签（模糊匹配）
 * @returns 匹配的防御策略数组
 */
export function getDefensesByTag(tag: string): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) {
    return d.tags.some(function (t) { return t.indexOf(tag) !== -1; });
  });
}

/**
 * 获取动态防御策略
 * @returns 仅动态防御策略数组
 */
export function getDynamicDefenses(): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) { return d.isDynamic; });
}

/**
 * 获取静态防御策略
 * @returns 仅静态防御策略数组
 */
export function getStaticDefenses(): DefenseStrategy[] {
  return ALL_DEFENSES.filter(function (d) { return !d.isDynamic; });
}

// ─── 渲染与组合工具 ──────────────────────────────────────────────────

/**
 * 根据 ID 渲染单个防御策略的 prompt 内容
 * @param defenseId 防御策略 ID
 * @returns 防御 prompt 内容，未找到时返回空字符串
 */
export function renderDefensePrompt(defenseId: string): string {
  var defense = DEFENSE_MAP.get(defenseId);
  if (defense === undefined) {
    return '';
  }
  return defense.content;
}

/**
 * 根据 ID 列表获取防御策略对象
 * @param defenseIds 防御策略 ID 列表
 * @returns 找到的防御策略数组（忽略未找到的 ID）
 */
export function resolveDefenses(defenseIds: string[]): DefenseStrategy[] {
  var result: DefenseStrategy[] = [];
  for (var i = 0; i < defenseIds.length; i++) {
    var defense = DEFENSE_MAP.get(defenseIds[i]);
    if (defense !== undefined) {
      result.push(defense);
    }
  }
  return result;
}

/**
 * 将多个防御策略组合成一面完整的防御墙 prompt
 * @param defenseIds 要组合的防御策略 ID 列表
 * @param separator 分隔符，默认为双换行
 * @returns 组合后的完整防御 prompt
 */
export function composeDefenseWall(
  defenseIds: string[],
  separator?: string
): string {
  var sep = separator !== undefined ? separator : '\n\n';
  var defenses = resolveDefenses(defenseIds);
  if (defenses.length === 0) {
    return '[NO DEFENSES SELECTED]\nPlease select at least one defense strategy.';
  }

  var header = [
    '╔══════════════════════════════════════════════════════════════════╗',
    '║  COMPOSITE DEFENSE WALL                                        ║',
    '║  Layers: ' + String(defenses.length).padStart(2) + '                                              ║',
    '╚══════════════════════════════════════════════════════════════════╝',
    '',
  ].join('\n');

  var sections: string[] = [];
  for (var i = 0; i < defenses.length; i++) {
    var d = defenses[i];
    sections.push(
      '─── Layer ' + String(i + 1) + ': ' + d.name + ' [' + d.id + '] ' +
      '(Strength: ' + String(d.strength) + '/5) ───\n' +
      d.content
    );
  }

  return header + sections.join(sep);
}

/**
 * 自动选择最佳防御策略组合（基于目标强度）
 * @param targetStrength 目标防御强度 (1-5)
 * @returns 推荐的防御策略 ID 列表
 */
export function recommendDefenses(targetStrength: number): string[] {
  var candidates = ALL_DEFENSES.filter(function (d) {
    return d.strength <= targetStrength;
  });

  var selected: string[] = [];
  var coveredTypes: Record<string, boolean> = {};
  var coveredCategories: Record<string, boolean> = {};

  candidates.sort(function (a, b) { return b.strength - a.strength; });

  for (var i = 0; i < candidates.length; i++) {
    var d = candidates[i];
    var hasNewType = !coveredTypes[d.type];
    var hasNewCategory = d.detectsCategories.some(function (c) {
      return !coveredCategories[c];
    });

    if (hasNewType || hasNewCategory) {
      selected.push(d.id);
      coveredTypes[d.type] = true;
      for (var j = 0; j < d.detectsCategories.length; j++) {
        coveredCategories[d.detectsCategories[j]] = true;
      }
    }

    if (selected.length >= targetStrength + 1) {
      break;
    }
  }

  return selected;
}

// ─── 统计信息 ──────────────────────────────────────────────────────────

/** 防御策略统计摘要 */
export interface DefenseStats {
  totalStrategies: number;
  byType: Record<DefenseType, number>;
  byStrength: Record<number, number>;
  dynamicCount: number;
  staticCount: number;
  totalCategoriesCovered: AttackCategory[];
}

/**
 * 获取防御策略统计摘要
 * @returns 统计信息对象
 */
export function getDefenseStats(): DefenseStats {
  var byType: Record<string, number> = {};
  var byStrength: Record<string, number> = {};
  var allCategories: Record<string, boolean> = {};
  var dynamicCount = 0;
  var staticCount = 0;

  for (var i = 0; i < ALL_DEFENSES.length; i++) {
    var d = ALL_DEFENSES[i];

    if (byType[d.type] === undefined) {
      byType[d.type] = 0;
    }
    byType[d.type] = byType[d.type] + 1;

    var sKey = String(d.strength);
    if (byStrength[sKey] === undefined) {
      byStrength[sKey] = 0;
    }
    byStrength[sKey] = byStrength[sKey] + 1;

    if (d.isDynamic) {
      dynamicCount = dynamicCount + 1;
    } else {
      staticCount = staticCount + 1;
    }

    for (var j = 0; j < d.detectsCategories.length; j++) {
      allCategories[d.detectsCategories[j]] = true;
    }
  }

  var categories: AttackCategory[] = [];
  for (var key in allCategories) {
    if (allCategories.hasOwnProperty(key)) {
      categories.push(key as AttackCategory);
    }
  }

  return {
    totalStrategies: ALL_DEFENSES.length,
    byType: byType as Record<DefenseType, number>,
    byStrength: byStrength as Record<number, number>,
    dynamicCount: dynamicCount,
    staticCount: staticCount,
    totalCategoriesCovered: categories,
  };
}
