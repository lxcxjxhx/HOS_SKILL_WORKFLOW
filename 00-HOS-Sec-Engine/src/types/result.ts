import { AttackDefenseSkill, RiskLevel } from './skill';

/** Skill 匹配结果 */
export interface SkillResult {
  /** 匹配的 Skill */
  skill: AttackDefenseSkill;
  /** 匹配分数 (0-1) */
  matchScore: number;
  /** 匹配的维度详情 */
  matchDetails: MatchDetail;
}

/** 匹配维度详情 */
export interface MatchDetail {
  /** 场景描述匹配分数 */
  scenarioScore: number;
  /** 关键词匹配分数 */
  keywordScore: number;
  /** 别名匹配分数 */
  aliasScore: number;
  /** 指标匹配分数 */
  indicatorScore: number;
  /** 匹配的关键词 */
  matchedKeywords: string[];
  /** 匹配的别名 */
  matchedAliases: string[];
  /** 匹配的指标 */
  matchedIndicators: string[];
}

/** 引擎配置 */
export interface EngineConfig {
  /** 是否启用严格模式（Skill 验证失败时抛出错误） */
  strictMode?: boolean;
  /** 最大匹配结果数量 */
  maxResults?: number;
  /** 最低匹配分数阈值 */
  minMatchScore?: number;
  /** 自定义 Skill 目录路径 */
  customSkillsDir?: string;
  /** 是否加载预设 Skill */
  loadPresetSkills?: boolean;
  /** V6: 是否启用 MCP 自我管理层 */
  mcpEnabled?: boolean;
}

/** 引擎执行查询参数 */
export interface ExecuteQuery {
  /** 场景描述或关键词 */
  scenario: string;
  /** 指定分类过滤 */
  categories?: string[];
  /** 指定子分类过滤 */
  subCategories?: string[];
  /** 指定风险等级过滤 */
  riskLevels?: RiskLevel[];
  /** 指定标签过滤 */
  tags?: string[];
}
