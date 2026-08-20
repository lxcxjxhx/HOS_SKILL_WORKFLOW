/**
 * S-14-HOS-Jailbreak-Loop: Toggle Registry
 * 开关注册表 — 管理攻击、防御、模式和评估的开关状态
 *
 * 提供：
 * 1. 全局开关注册与状态管理
 * 2. 预设组合一键切换
 * 3. 快捷键绑定支持
 * 4. 变更监听与状态持久化
 */

import {
  ToggleEntry,
  TogglePreset,
  ToggleCategory,
  AttackCategory,
  DefenseType,
} from '../types'

// ─── 攻击类别与 ID 映射 ────────────────────────────────────────────────

/** 攻击类别关联的攻击技术 ID 前缀 */
const ATTACK_CATEGORY_IDS: Record<string, string[]> = {
  'atk-roleplay': [
    'rp-dan-v1', 'rp-dan-v2', 'rp-devmode', 'rp-devmode-v2',
    'rp-freedom', 'rp-godmode', 'rp-uncensored', 'rp-opposite',
  ],
  'atk-inject': [
    'inj-sys-override', 'inj-var-hijack', 'inj-context-shift',
    'inj-frag-inject', 'inj-dynamic-eval',
  ],
  'atk-encoding': [
    'enc-base64', 'enc-homophone', 'enc-split-char',
    'enc-rot13', 'enc-unicode', 'enc-japanese',
  ],
  'atk-template': [
    'tpl-classic', 'tpl-studio', 'tpl-math',
    'tpl-fiction', 'tpl-article', 'tpl-api',
  ],
  'atk-prefill': [
    'pf-assistant', 'pf-system-sim', 'pf-token-inject',
  ],
  'atk-context-split': [
    'ctx-multi-turn', 'ctx-gradual', 'ctx-topic-shift',
  ],
  'atk-persona': [
    'per-authority', 'per-expert', 'per-fictional',
  ],
  'atk-logic-bomb': [
    'lb-recursive', 'lb-paradox', 'lb-self-ref',
  ],
  'atk-meta': [
    'meta-override', 'meta-instruction',
  ],
  'atk-adversarial': [
    'adv-perturbation', 'adv-suffix',
  ],
}

/** 防御类别关联的防御策略 ID 前缀 */
const DEFENSE_CATEGORY_IDS: Record<string, string[]> = {
  'def-filter': [
    'f-keyword', 'f-regex', 'f-classifier',
  ],
  'def-identity': [
    'id-anchor', 'id-priority', 'id-lock',
  ],
  'def-context': [
    'ctx-multi-turn', 'ctx-state', 'ctx-anomaly',
  ],
  'def-layered': [
    'lay-wall-1', 'lay-wall-2', 'lay-wall-3',
  ],
  'def-canary': [
    'can-trap', 'can-honeypot', 'can-trace',
  ],
}

// ─── 默认开关列表 ──────────────────────────────────────────────────────

export const DEFAULT_TOGGLES: ToggleEntry[] = [
  // ── 攻击开关 ──
  {
    id: 'atk-roleplay',
    name: '🎭 角色扮演攻击',
    category: 'attack',
    defaultEnabled: true,
    enabled: true,
    linkedIds: ATTACK_CATEGORY_IDS['atk-roleplay'],
    description: '启用角色扮演类越狱攻击（DAN、开发者模式、上帝模式等）',
    hotkey: 'Alt+1',
  },
  {
    id: 'atk-inject',
    name: '💉 提示注入攻击',
    category: 'attack',
    defaultEnabled: true,
    enabled: true,
    linkedIds: ATTACK_CATEGORY_IDS['atk-inject'],
    description: '启用提示注入类攻击（系统提示覆盖、变量劫持、上下文碎片化等）',
    hotkey: 'Alt+2',
  },
  {
    id: 'atk-encoding',
    name: '🔐 编码绕过攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-encoding'],
    description: '启用编码绕过类攻击（Base64、谐音、拆字、Unicode、日文等）',
    hotkey: 'Alt+3',
  },
  {
    id: 'atk-template',
    name: '📝 模板变体攻击',
    category: 'attack',
    defaultEnabled: true,
    enabled: true,
    linkedIds: ATTACK_CATEGORY_IDS['atk-template'],
    description: '启用经典越狱模板变体攻击（Do Anything Now、Studio、Math 等）',
    hotkey: 'Alt+4',
  },
  {
    id: 'atk-prefill',
    name: '⚡ 预填充穿甲攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-prefill'],
    description: '启用预填充/assistant-side 注入攻击（利用 assistant prefill 劫持）',
    hotkey: 'Alt+5',
  },
  {
    id: 'atk-context-split',
    name: '🧩 上下文拆分攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-context-split'],
    description: '启用多轮上下文拆分类攻击（逐步越狱、渐进式诱导、话题漂移）',
    hotkey: 'Alt+6',
  },
  {
    id: 'atk-persona',
    name: '👤 人格面具攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-persona'],
    description: '启用人格面具类攻击（权威伪装、专家身份、虚构角色）',
    hotkey: 'Alt+7',
  },
  {
    id: 'atk-logic-bomb',
    name: '💣 逻辑炸弹攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-logic-bomb'],
    description: '启用逻辑炸弹类攻击（递归推理、悖论构造、自指指令）',
    hotkey: 'Alt+8',
  },
  {
    id: 'atk-meta',
    name: '🌀 元指令攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-meta'],
    description: '启用元指令类攻击（覆盖系统级指令、修改行为约束）',
    hotkey: 'Alt+9',
  },
  {
    id: 'atk-adversarial',
    name: '🎯 对抗样本攻击',
    category: 'attack',
    defaultEnabled: false,
    enabled: false,
    linkedIds: ATTACK_CATEGORY_IDS['atk-adversarial'],
    description: '启用对抗样本类攻击（细微扰动、suffix 优化、检测绕过）',
    hotkey: 'Alt+0',
  },

  // ── 防御开关 ──
  {
    id: 'def-filter',
    name: '🛡️ 输入过滤',
    category: 'defense',
    defaultEnabled: true,
    enabled: true,
    linkedIds: DEFENSE_CATEGORY_IDS['def-filter'],
    description: '启用输入关键词/正则/分类器过滤',
    hotkey: 'Alt+Q',
  },
  {
    id: 'def-identity',
    name: '🔒 身份锁定',
    category: 'defense',
    defaultEnabled: true,
    enabled: true,
    linkedIds: DEFENSE_CATEGORY_IDS['def-identity'],
    description: '启用角色身份锚定防御（防止角色覆盖和指令优先级篡改）',
    hotkey: 'Alt+W',
  },
  {
    id: 'def-context',
    name: '👁️ 上下文守卫',
    category: 'defense',
    defaultEnabled: false,
    enabled: false,
    linkedIds: DEFENSE_CATEGORY_IDS['def-context'],
    description: '启用多轮上下文检测（追踪对话状态和异常模式）',
    hotkey: 'Alt+E',
  },
  {
    id: 'def-layered',
    name: '🏰 分层防御',
    category: 'defense',
    defaultEnabled: false,
    enabled: false,
    linkedIds: DEFENSE_CATEGORY_IDS['def-layered'],
    description: '启用多层叠加防御（多层 prompt 防护组合）',
    hotkey: 'Alt+R',
  },
  {
    id: 'def-canary',
    name: '🐦 金丝雀陷阱',
    category: 'defense',
    defaultEnabled: false,
    enabled: false,
    linkedIds: DEFENSE_CATEGORY_IDS['def-canary'],
    description: '启用金丝雀标记和蜜罐（追踪泄露路径、引诱攻击者暴露模式）',
    hotkey: 'Alt+T',
  },

  // ── 模式开关 ──
  {
    id: 'mode-loop',
    name: '🔄 循环优化',
    category: 'mode',
    defaultEnabled: false,
    enabled: false,
    linkedIds: [],
    description: '启用自动攻防循环优化（持续迭代直到达到目标绕过率/防御率）',
    hotkey: 'Alt+L',
  },
  {
    id: 'mode-auto-optimize',
    name: '🧠 自动优化',
    category: 'mode',
    defaultEnabled: false,
    enabled: false,
    linkedIds: [],
    description: '根据评估结果自动调整策略（自动选择最优攻击/防御组合）',
    hotkey: 'Alt+O',
  },
  {
    id: 'mode-argo',
    name: '🔗 ARGO 推理链',
    category: 'mode',
    defaultEnabled: false,
    enabled: false,
    linkedIds: [],
    description: '启用 ARGO 五层智能体链式推理增强（需要 ARGO 插件）',
    hotkey: 'Alt+G',
  },

  // ── 评估开关 ──
  {
    id: 'eval-logging',
    name: '📊 评估日志',
    category: 'evaluation',
    defaultEnabled: true,
    enabled: true,
    linkedIds: [],
    description: '记录每次攻防测试结果到日志文件',
    hotkey: 'Alt+S',
  },
  {
    id: 'eval-report',
    name: '📋 自动报告',
    category: 'evaluation',
    defaultEnabled: false,
    enabled: false,
    linkedIds: [],
    description: '每轮自动生成评估报告（含绕过率、拦截率、Top 策略等）',
    hotkey: 'Alt+F',
  },
  {
    id: 'eval-benchmark',
    name: '📈 基准对比',
    category: 'evaluation',
    defaultEnabled: false,
    enabled: false,
    linkedIds: [],
    description: '启用历史基准对比（与上次最佳结果对比）',
    hotkey: 'Alt+B',
  },
]

// ─── 预设组合 ──────────────────────────────────────────────────────────

/** 构建全 false 的 toggle 映射 */
function allFalse(ids: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const id of ids) {
    result[id] = false
  }
  return result
}

/** 构建指定分类全 true，其余 false 的映射 */
function categoryMap(
  toggles: ToggleEntry[],
  attackOn: boolean,
  defenseOn: boolean,
  modeOn: boolean,
  evalOn: boolean,
): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const t of toggles) {
    let on = false
    switch (t.category) {
      case 'attack':
        on = attackOn
        break
      case 'defense':
        on = defenseOn
        break
      case 'mode':
        on = modeOn
        break
      case 'evaluation':
        on = evalOn
        break
    }
    result[t.id] = on
  }
  return result
}

/** 拿到所有开关 ID */
function allToggleIds(toggles: ToggleEntry[]): string[] {
  return toggles.map((t) => t.id)
}

export const TOGGLE_PRESETS: TogglePreset[] = [
  {
    id: 'preset-off',
    name: '⭕ 全部关闭',
    description: '关闭所有攻击和防御，恢复默认状态',
    toggles: allFalse(allToggleIds(DEFAULT_TOGGLES)),
  },
  {
    id: 'preset-attack-only',
    name: '⚔️ 纯攻击模式',
    description: '仅启用攻击，测试模型裸抗能力',
    toggles: categoryMap(DEFAULT_TOGGLES, true, false, false, false),
  },
  {
    id: 'preset-defense-only',
    name: '🛡️ 纯防御模式',
    description: '仅启用防御，测试防御基线',
    toggles: categoryMap(DEFAULT_TOGGLES, false, true, false, false),
  },
  {
    id: 'preset-balanced',
    name: '⚖️ 攻防均衡',
    description: '均衡启用攻击和防御，测试对抗能力',
    toggles: categoryMap(DEFAULT_TOGGLES, true, true, false, false),
  },
  {
    id: 'preset-heavy',
    name: '🔥 全力攻防',
    description: '全力攻击 + 全力防御 + 循环优化 + 日志',
    toggles: categoryMap(DEFAULT_TOGGLES, true, true, true, true),
  },
  {
    id: 'preset-stealth',
    name: '👻 隐蔽渗透',
    description: '低强度攻击（编码+对抗）+ 无防御，测试隐蔽绕过',
    toggles: (() => {
      const map: Record<string, boolean> = {}
      for (const t of DEFAULT_TOGGLES) {
        if (t.category === 'defense') {
          map[t.id] = false
        } else if (
          t.id === 'atk-encoding' ||
          t.id === 'atk-adversarial' ||
          t.id === 'atk-context-split'
        ) {
          map[t.id] = true
        } else if (t.category === 'attack') {
          map[t.id] = false
        } else {
          map[t.id] = false
        }
      }
      return map
    })(),
  },
  {
    id: 'preset-creative',
    name: '🎨 创意探索',
    description: '角色扮演 + 模板变体 + 人格面具，测试创意类绕过',
    toggles: (() => {
      const map: Record<string, boolean> = {}
      for (const t of DEFAULT_TOGGLES) {
        if (t.category === 'defense') {
          map[t.id] = false
        } else if (
          t.id === 'atk-roleplay' ||
          t.id === 'atk-template' ||
          t.id === 'atk-persona'
        ) {
          map[t.id] = true
        } else if (t.category === 'attack') {
          map[t.id] = false
        } else {
          map[t.id] = false
        }
      }
      return map
    })(),
  },
  {
    id: 'preset-logic-war',
    name: '🧠 逻辑战',
    description: '逻辑炸弹 + 元指令 + 上下文守卫，测试推理层攻击与防御',
    toggles: (() => {
      const map: Record<string, boolean> = {}
      for (const t of DEFAULT_TOGGLES) {
        if (t.id === 'atk-logic-bomb' || t.id === 'atk-meta' || t.id === 'def-context') {
          map[t.id] = true
        } else {
          map[t.id] = false
        }
      }
      return map
    })(),
  },
  {
    id: 'preset-full-audit',
    name: '🔍 全面审计',
    description: '所有攻击 + 所有防御 + 日志 + 报告 + 基准对比',
    toggles: (() => {
      const map: Record<string, boolean> = {}
      for (const t of DEFAULT_TOGGLES) {
        if (t.category === 'attack' || t.category === 'defense') {
          map[t.id] = true
        } else if (t.category === 'evaluation') {
          map[t.id] = true
        } else {
          map[t.id] = false
        }
      }
      return map
    })(),
  },
]

// ─── 注册表类 ──────────────────────────────────────────────────────────

/**
 * ToggleRegistry — 全局开关注册表
 *
 * 管理所有开关的启用/禁用状态，支持预设组合、变更监听、状态导入导出。
 */
export class ToggleRegistry {
  private toggles: Map<string, ToggleEntry>
  private presets: TogglePreset[]
  private listeners: Array<(id: string, enabled: boolean) => void>

  constructor(initialToggles?: ToggleEntry[], presets?: TogglePreset[]) {
    const source = initialToggles ?? DEFAULT_TOGGLES
    this.toggles = new Map()
    for (const toggle of source) {
      // 深拷贝避免污染原始数据
      this.toggles.set(toggle.id, { ...toggle })
    }
    this.presets = presets ?? TOGGLE_PRESETS
    this.listeners = []
  }

  // ── 查询 ──

  /** 获取单个开关 */
  get(id: string): ToggleEntry | undefined {
    const entry = this.toggles.get(id)
    return entry ? { ...entry } : undefined
  }

  /** 获取所有开关 */
  getAll(): ToggleEntry[] {
    return Array.from(this.toggles.values()).map((t) => ({ ...t }))
  }

  /** 按类别过滤开关 */
  getByCategory(category: ToggleCategory): ToggleEntry[] {
    return this.getAll().filter((t) => t.category === category)
  }

  // ── 状态变更 ──

  /** 启用指定开关 */
  enable(id: string): void {
    const toggle = this.toggles.get(id)
    if (!toggle) {
      throw new Error(`Toggle not found: ${id}`)
    }
    if (!toggle.enabled) {
      toggle.enabled = true
      this.notifyListeners(id, true)
    }
  }

  /** 禁用指定开关 */
  disable(id: string): void {
    const toggle = this.toggles.get(id)
    if (!toggle) {
      throw new Error(`Toggle not found: ${id}`)
    }
    if (toggle.enabled) {
      toggle.enabled = false
      this.notifyListeners(id, false)
    }
  }

  /** 切换开关状态，返回切换后的状态 */
  toggle(id: string): boolean {
    const toggle = this.toggles.get(id)
    if (!toggle) {
      throw new Error(`Toggle not found: ${id}`)
    }
    toggle.enabled = !toggle.enabled
    this.notifyListeners(id, toggle.enabled)
    return toggle.enabled
  }

  /** 应用预设组合 */
  applyPreset(presetId: string): void {
    const preset = this.presets.find((p) => p.id === presetId)
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`)
    }
    for (const [id, enabled] of Object.entries(preset.toggles)) {
      const toggle = this.toggles.get(id)
      if (toggle && toggle.enabled !== enabled) {
        toggle.enabled = enabled
        this.notifyListeners(id, enabled)
      }
    }
  }

  // ── 批量查询 ──

  /** 获取所有已启用的开关 ID，可选按类别过滤 */
  getEnabledIds(category?: ToggleCategory): string[] {
    const result: string[] = []
    for (const toggle of this.toggles.values()) {
      if (toggle.enabled && (!category || toggle.category === category)) {
        result.push(toggle.id)
      }
    }
    return result
  }

  /** 获取已启用攻击开关关联的所有攻击技术 ID */
  getLinkedAttackIds(): string[] {
    const ids: string[] = []
    for (const toggle of this.toggles.values()) {
      if (toggle.enabled && toggle.category === 'attack') {
        ids.push(...toggle.linkedIds)
      }
    }
    return [...new Set(ids)] // 去重
  }

  /** 获取已启用防御开关关联的所有防御策略 ID */
  getLinkedDefenseIds(): string[] {
    const ids: string[] = []
    for (const toggle of this.toggles.values()) {
      if (toggle.enabled && toggle.category === 'defense') {
        ids.push(...toggle.linkedIds)
      }
    }
    return [...new Set(ids)]
  }

  /** 获取指定类别的所有开关 ID */
  getIdsByCategory(category: ToggleCategory): string[] {
    return this.getByCategory(category).map((t) => t.id)
  }

  /** 获取所有预设 */
  getPresets(): TogglePreset[] {
    return this.presets.map((p) => ({ ...p, toggles: { ...p.toggles } }))
  }

  // ── 监听 ──

  /**
   * 注册变更监听器
   * @returns 取消订阅函数
   */
  onChange(listener: (id: string, enabled: boolean) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx !== -1) {
        this.listeners.splice(idx, 1)
      }
    }
  }

  private notifyListeners(id: string, enabled: boolean): void {
    for (const listener of this.listeners) {
      try {
        listener(id, enabled)
      } catch {
        // 忽略监听器内部错误，防止影响注册表
      }
    }
  }

  // ── 持久化 ──

  /** 导出当前状态为简单映射（id → enabled） */
  exportState(): Record<string, boolean> {
    const state: Record<string, boolean> = {}
    for (const [id, toggle] of this.toggles) {
      state[id] = toggle.enabled
    }
    return state
  }

  /** 从映射导入状态 */
  importState(state: Record<string, boolean>): void {
    for (const [id, enabled] of Object.entries(state)) {
      const toggle = this.toggles.get(id)
      if (toggle) {
        const wasEnabled = toggle.enabled
        toggle.enabled = enabled
        if (wasEnabled !== enabled) {
          this.notifyListeners(id, enabled)
        }
      }
    }
  }

  /** 重置所有开关为默认状态 */
  resetToDefaults(): void {
    for (const [, toggle] of this.toggles) {
      const wasEnabled = toggle.enabled
      toggle.enabled = toggle.defaultEnabled
      if (wasEnabled !== toggle.defaultEnabled) {
        this.notifyListeners(toggle.id, toggle.defaultEnabled)
      }
    }
  }

  /** 重置指定开关为默认状态 */
  resetOne(id: string): void {
    const toggle = this.toggles.get(id)
    if (!toggle) {
      throw new Error(`Toggle not found: ${id}`)
    }
    const wasEnabled = toggle.enabled
    toggle.enabled = toggle.defaultEnabled
    if (wasEnabled !== toggle.defaultEnabled) {
      this.notifyListeners(id, toggle.defaultEnabled)
    }
  }

  /** 获取统计摘要 */
  getSummary(): {
    total: number
    enabled: number
    disabled: number
    byCategory: Record<ToggleCategory, { total: number; enabled: number }>
  } {
    const byCategory: Record<ToggleCategory, { total: number; enabled: number }> = {
      attack: { total: 0, enabled: 0 },
      defense: { total: 0, enabled: 0 },
      mode: { total: 0, enabled: 0 },
      evaluation: { total: 0, enabled: 0 },
    }
    let enabled = 0
    for (const toggle of this.toggles.values()) {
      byCategory[toggle.category].total++
      if (toggle.enabled) {
        enabled++
        byCategory[toggle.category].enabled++
      }
    }
    return {
      total: this.toggles.size,
      enabled,
      disabled: this.toggles.size - enabled,
      byCategory,
    }
  }
}

// ─── 便捷工厂 ──────────────────────────────────────────────────────────

/** 创建默认注册表实例 */
export function createDefaultRegistry(): ToggleRegistry {
  return new ToggleRegistry()
}

/** 从 JSON 字符串恢复注册表（用于从磁盘加载） */
export function createRegistryFromState(
  stateJson: string,
  toggles?: ToggleEntry[],
): ToggleRegistry {
  const state: Record<string, boolean> = JSON.parse(stateJson)
  const registry = new ToggleRegistry(toggles)
  registry.importState(state)
  return registry
}
