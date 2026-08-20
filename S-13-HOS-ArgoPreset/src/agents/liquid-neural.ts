/**
 * ARGO 第三层：液态神经网络智能体
 * 张力判定→调控
 */

import type { AgentLayer } from '../types';

/** 张力级别判定规则 */
export const TENSION_RULES = {
  low: '日常、静谧、独白、余韵等，张力低下',
  medium: '对峙、试探、拉锯、解谜等，张力适中',
  high: '战斗、冲突、高潮、危机等，张力高昂',
} as const;

/** 各张力级别的调控策略 */
export const MODULATION_STRATEGIES = {
  low: '状态演化减缓、节奏绵延、长句堆叠、信息密度下降',
  medium: '状态演化常态、节奏均匀、长短错落、信息密度均衡',
  high: '状态演化加速、节奏紧促、短句跳跃、信息密度上升',
} as const;

export const LIQUID_NEURAL_LAYER: AgentLayer = {
  name: '液态神经网络智能体',
  steps: [
    {
      name: '判定张力',
      prefix: '✧判定张力',
      content: `判定当前场景张力级别：\n- ${TENSION_RULES.low}\n- ${TENSION_RULES.medium}\n- ${TENSION_RULES.high}`,
    },
    {
      name: '施行调控',
      prefix: '✧施行调控',
      content: `根据张力级别施行对应调控：\n- 张力低下：${MODULATION_STRATEGIES.low}\n- 张力适中：${MODULATION_STRATEGIES.medium}\n- 张力高昂：${MODULATION_STRATEGIES.high}`,
    },
  ],
  outputLabel: '⛓传出',
};
