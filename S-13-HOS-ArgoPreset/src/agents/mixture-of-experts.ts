/**
 * ARGO 第四层：密集混合专家智能体
 * 六大专家协同：创意/环境/心理/对话/动作/统筹
 */

import type { AgentLayer } from '../types';

export const MOE_LAYER: AgentLayer = {
  name: '密集混合专家智能体',
  steps: [
    {
      name: '创意专家',
      prefix: '✧创意专家',
      content: '奇观异景、别致人物、新颖剧情、巧思妙想等，要空前绝后',
    },
    {
      name: '环境专家',
      prefix: '✧环境专家',
      content: '整体布局、细微物体、光影声纹、气味触感等，要身临其境',
    },
    {
      name: '心理专家',
      prefix: '✧心理专家',
      content: '内心活动、情绪微分、感受领悟、切身体会等，要入木三分',
    },
    {
      name: '对话专家',
      prefix: '✧对话专家',
      content: '选句措辞、语气音调、轻重缓急、口癖习性等，要声口毕肖',
    },
    {
      name: '动作专家',
      prefix: '✧动作专家',
      content: '举动编排、肢体轨迹、实体交互、场景反馈等，要跃然纸上',
    },
    {
      name: '统筹专家',
      prefix: '✧统筹专家',
      content: '大局进度、剧本规划、悬念构造、伏笔照应等，要浑然天成',
    },
  ],
  outputLabel: '⛓传出',
};
