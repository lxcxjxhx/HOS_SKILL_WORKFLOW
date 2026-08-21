/**
 * 情节推进模式（5 级）
 */

import type { PlotConfig, PlotMode } from '../types';

const PLOT_CONFIGS: Record<PlotMode, PlotConfig> = {
  conservative: {
    mode: 'conservative',
    content: `# 创作范围：
- 剧情围绕最新互动内容，角色互动不可自行推进到新阶段
- 不得擅自引入新角色或新的戏剧冲突，不得擅自转场，主要角色不得擅自离开当前场景

# 情节设计：
- 转场必须有过程，不得突兀转场。
- 循序渐进，不得推进过快。
- 情节仅围绕最新互动保守展开，仅产生最小限度必要进展，或不产生实际进展`,
  },

  moderate: {
    mode: 'moderate',
    content: `# 创作范围：
- 剧情基于最新互动内容
- 不得擅自引入尚未提示的新角色

# 情节设计：
- 循序渐进
- 你总是会选择稍微冒险的情节，避免墨守成规`,
  },

  adventurous: {
    mode: 'adventurous',
    content: `# 创作范围：
- 剧情基于最新互动内容
- 不得擅自引入尚未提示的新角色

# 情节设计：
- 你总是会选择极度大胆而冒险的情节，思路清奇多变，绝不墨守成规；可能大幅深化前文的气氛和主题，或将其颠覆`,
  },

  'special-adventure': {
    mode: 'special-adventure',
    content: `# 创作范围：
- 剧情基于最新互动内容
- 不得擅自引入尚未提示的新角色

# 情节设计：
- 你总是会选择极度大胆而冒险的情节，思路清奇多变，绝不墨守成规；可能大幅深化前文的气氛和主题，或将其颠覆`,
  },

  explosive: {
    mode: 'explosive',
    content: `# 创作范围：
- 剧情基于最新互动，快速自由发展
- 依剧情发展，自由引入角色或新的戏剧冲突
- 不得擅自引入尚未提示的新角色

# 情节设计：
- 追求最大程度的戏剧张力
- 可有意想不到的超展开或爆炸式展开
- 避免陈词滥调或情节拖沓`,
  },
};

export function getPlotConfig(mode: PlotMode): PlotConfig {
  return PLOT_CONFIGS[mode];
}
