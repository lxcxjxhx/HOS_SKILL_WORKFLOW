/**
 * ARGO 第一层：主动推理框架智能体
 * 感知→预测→实行→更新
 */

import type { AgentLayer } from '../types';

export const ACTIVE_INFERENCE_LAYER: AgentLayer = {
  name: '主动推理框架智能体',
  steps: [
    { name: '感知当下', prefix: '✧感知当下', content: '同步当下情形，维护生成模型' },
    { name: '预测后续', prefix: '✧预测后续', content: '预计后续变化，推测未来走向' },
    { name: '实行计划', prefix: '✧实行计划', content: '设计纷繁计划，实行最佳方案' },
    { name: '更新学习', prefix: '✧更新学习', content: '实时动态更新，践行终身学习' },
  ],
  outputLabel: '⛓传出',
};
