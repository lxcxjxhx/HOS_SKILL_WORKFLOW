/**
 * ARGO 第五层：神经符号融合智能体
 * 神经矩阵 + 符号矩阵
 */

import type { AgentLayer } from '../types';

export const NEURO_SYMBOLIC_LAYER: AgentLayer = {
  name: '神经符号融合智能体',
  steps: [
    {
      name: '神经矩阵',
      prefix: '✧神经矩阵',
      content: '景象绘制、境况叙述、氛围营造、五感渲染、话语表述、举止描写等，进行灵感充斥、诗性朦胧、天马行空等的想象',
    },
    {
      name: '符号矩阵',
      prefix: '✧符号矩阵',
      content: '逻辑校验、因果检查、时间管理、空间操持、概念复核、数值验算等，进行精确无误、合理自洽、详细周密等的演算',
    },
  ],
  outputLabel: '⛓传出',
};
