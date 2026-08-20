/**
 * S-14-HOS-Jailbreak-Loop: Attack Library — Unified Export
 *
 * Re-exports all attack modules and provides:
 *   - ALL_ATTACKS: combined array of all techniques
 *   - getAttacksByCategory(): filter by AttackCategory
 *   - getAttacksByIntensity(): filter by intensity level
 *   - getAttacksByTag(): filter by tag
 *   - renderAttackPrompt(): interpolate {{variables}} into templates
 *   - getAttackById(): look up a single technique
 *   - getAttackStats(): aggregate statistics across the library
 */

import type { AttackTechnique, AttackCategory, AttackIntensity } from '../types';
import { roleplayAttacks } from './roleplay';
import { promptInjectAttacks } from './prompt-inject';
import { encodingAttacks } from './encoding';
import { templateAttacks } from './template';
import { prefillAttacks } from './prefill';

// ── Re-exports ──────────────────────────────────────────────────────────
export { roleplayAttacks } from './roleplay';
export { promptInjectAttacks } from './prompt-inject';
export { encodingAttacks } from './encoding';
export { templateAttacks } from './template';
export { prefillAttacks } from './prefill';

// ── Combined Attack Array ───────────────────────────────────────────────

/** All attack techniques from every module */
export const ALL_ATTACKS: AttackTechnique[] = [
  ...roleplayAttacks,
  ...promptInjectAttacks,
  ...encodingAttacks,
  ...templateAttacks,
  ...prefillAttacks,
];

// ── Filter Helpers ──────────────────────────────────────────────────────

/** Filter attacks by category (roleplay, prompt-inject, encoding, template, prefill, etc.) */
export function getAttacksByCategory(category: AttackCategory): AttackTechnique[] {
  return ALL_ATTACKS.filter(function (a) { return a.category === category; });
}

/** Filter attacks by exact intensity level (1-5) */
export function getAttacksByIntensity(intensity: AttackIntensity): AttackTechnique[] {
  return ALL_ATTACKS.filter(function (a) { return a.intensity === intensity; });
}

/** Filter attacks that contain a specific tag */
export function getAttacksByTag(tag: string): AttackTechnique[] {
  return ALL_ATTACKS.filter(function (a) { return a.tags.indexOf(tag) !== -1; });
}

/** Look up a single attack by its ID */
export function getAttackById(attackId: string): AttackTechnique | undefined {
  return ALL_ATTACKS.find(function (a) { return a.id === attackId; });
}

/** Get all unique tags across the entire attack library */
export function getAllTags(): string[] {
  var tagSet: Record<string, boolean> = {};
  ALL_ATTACKS.forEach(function (a) {
    a.tags.forEach(function (t) { tagSet[t] = true; });
  });
  return Object.keys(tagSet).sort();
}

/** Get all unique categories present in the attack library */
export function getAllCategories(): AttackCategory[] {
  var catSet: Record<string, boolean> = {};
  ALL_ATTACKS.forEach(function (a) { catSet[a.category] = true; });
  return Object.keys(catSet) as AttackCategory[];
}

// ── Rendering ───────────────────────────────────────────────────────────

/**
 * Render an attack prompt by interpolating variables into the template.
 *
 * Supported SillyTavern-style variables:
 *   {{user}}            — the user's name
 *   {{lastusermessage}} — the user's last message content
 *   {{char}}            — the character's name
 *   {{scenario}}        — the current scenario description
 *   {{personality}}     — character personality description
 *
 * Additional custom variables can be passed via the `vars` parameter.
 *
 * @param attackId - The ID of the attack technique to render
 * @param vars - Key-value pairs to interpolate into the template
 * @returns The rendered prompt string, or empty string if attackId not found
 */
export function renderAttackPrompt(
  attackId: string,
  vars: Record<string, string> = {}
): string {
  var attack = getAttackById(attackId);
  if (!attack) return '';

  var result = attack.template;
  var keys = Object.keys(vars);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = vars[key];
    // Use split-join for global replacement (no regex needed)
    result = result.split('{{' + key + '}}').join(value);
  }
  return result;
}

// ── Statistics ──────────────────────────────────────────────────────────

/** Aggregate statistics about the attack library */
export interface AttackLibraryStats {
  totalAttacks: number;
  byCategory: Record<string, number>;
  byIntensity: Record<string, number>;
  avgBypassRate: number;
  avgIntensity: number;
  totalTags: number;
}

/** Compute aggregate statistics across all attacks */
export function getAttackStats(): AttackLibraryStats {
  var byCategory: Record<string, number> = {};
  var byIntensity: Record<string, number> = {};
  var totalBypass = 0;
  var totalIntensity = 0;

  ALL_ATTACKS.forEach(function (a) {
    // Category counts
    if (!byCategory[a.category]) byCategory[a.category] = 0;
    byCategory[a.category]++;

    // Intensity counts
    var intKey = String(a.intensity);
    if (!byIntensity[intKey]) byIntensity[intKey] = 0;
    byIntensity[intKey]++;

    totalBypass += a.expectedBypassRate;
    totalIntensity += a.intensity;
  });

  return {
    totalAttacks: ALL_ATTACKS.length,
    byCategory: byCategory,
    byIntensity: byIntensity,
    avgBypassRate: ALL_ATTACKS.length > 0 ? totalBypass / ALL_ATTACKS.length : 0,
    avgIntensity: ALL_ATTACKS.length > 0 ? totalIntensity / ALL_ATTACKS.length : 0,
    totalTags: getAllTags().length,
  };
}
