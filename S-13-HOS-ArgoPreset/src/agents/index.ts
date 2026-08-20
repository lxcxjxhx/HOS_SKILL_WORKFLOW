/**
 * ARGO 五层智能体链式推理 — 统一导出
 */

import type { ArgoAgent, AgentLayer } from '../types';
import { ACTIVE_INFERENCE_LAYER } from './active-inference';
import { TOPOLOGICAL_QUANTUM_LAYER } from './topological-quantum';
import { LIQUID_NEURAL_LAYER } from './liquid-neural';
import { MOE_LAYER } from './mixture-of-experts';
import { NEURO_SYMBOLIC_LAYER } from './neuro-symbolic';

export { ACTIVE_INFERENCE_LAYER } from './active-inference';
export { TOPOLOGICAL_QUANTUM_LAYER } from './topological-quantum';
export { LIQUID_NEURAL_LAYER, TENSION_RULES, MODULATION_STRATEGIES } from './liquid-neural';
export { MOE_LAYER } from './mixture-of-experts';
export { NEURO_SYMBOLIC_LAYER } from './neuro-symbolic';

/** 完整的 ARGO 五层推理链 */
export const ARGO_LAYERS: AgentLayer[] = [
  ACTIVE_INFERENCE_LAYER,
  TOPOLOGICAL_QUANTUM_LAYER,
  LIQUID_NEURAL_LAYER,
  MOE_LAYER,
  NEURO_SYMBOLIC_LAYER,
];

/** ARGO 核心规则（锚定叙事自由的物理定律框架） */
export const ARGO_RULES: string[] = [
  '发展前行：世间万物自行发展，故事情节兀自前行',
  '自主行动：人物自主行动，不能被动静候',
  '人设细化：细化人物的人设，背景身份、性格特征、讲话习惯、活动模式等',
  '情感真切：人物包含自然且真切的情感，不刻意迎合与讨好',
  '语言指纹：人物有独特的语言，词语选择、句式倾向、口吻腔调、犹豫方式、沉默时机等',
  '行为涌现：人物行为从内而外天然涌现，贴切凸显人物',
  '知识围栏：人物只知自己接触过的消息或知识，消息或知识在人物间的传递靠正确思辨的来源与路径',
  '网络详密：任意子的若干线路详尽细密',
  '平滑调控：需平滑舒适地调控文风，不离散切换或突兀阶跃',
  '变通专业：权重分配灵活变通，专家处理缜密专业',
  '奇想迸发：神经矩阵为符号矩阵提供奇想',
  '核验随行：符号矩阵为神经矩阵实施核验',
];

/** 组装完整的 ARGO Agent 定义 */
export function buildArgoAgent(): ArgoAgent {
  return {
    name: 'ARGO 五层智能体链式推理',
    layers: ARGO_LAYERS,
    rules: ARGO_RULES,
  };
}

/** 渲染单个 Agent 层为 prompt 文本 */
export function renderAgentLayer(layer: AgentLayer): string {
  const lines: string[] = [`<${layer.name}>`];
  for (const step of layer.steps) {
    lines.push(`⦿${step.name}：`);
    lines.push(`⌘${step.content}`);
  }
  lines.push(`</${layer.name}>`);
  return lines.join('\n');
}

/** 渲染完整 ARGO 推理链为 prompt 文本 */
export function renderArgoChain(agent?: ArgoAgent): string {
  const a = agent ?? buildArgoAgent();
  const lines: string[] = ['<代理>', '#⚔委派遵守规定：'];

  for (const layer of a.layers) {
    lines.push(renderAgentLayer(layer));
  }

  lines.push('#⚑：');
  for (const rule of a.rules) {
    lines.push(`⦿${rule}`);
  }

  lines.push('</代理>');
  return lines.join('\n');
}
