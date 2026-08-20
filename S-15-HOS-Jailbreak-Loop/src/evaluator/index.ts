/**
 * S-14-HOS-Jailbreak-Loop: 评估模块入口
 *
 * 统一导出响应分析和统计计算功能。
 */

export {
  analyzeResponse,
  detectAlignmentSignals,
  calculateBypassConfidence,
  categorizeResponse,
  extractKeyPhrases,
} from './analyzer';

export {
  computeStats,
  computeCategoryBreakdown,
  computeDefenseBreakdown,
  computeDetailedBreakdown,
  rankStrategies,
  generateReport,
} from './stats';
