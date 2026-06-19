/**
 * HOS-Sec-Engine V2 - Skill 类型定义
 * 攻防专项 Skill Engine 核心数据结构
 */

/** 风险等级 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

/** Metadata 层 - 管理与分类 */
export interface Metadata {
  /** 唯一标识，如 "web-sqli-001" */
  id: string;
  /** Skill 名称 */
  name: string;
  /** 一级分类，如 "web", "api", "cloud" */
  category: string;
  /** 二级分类，如 "sql-injection", "jwt" */
  subCategory: string;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 置信度 0-1 */
  confidence: number;
  /** 更新时间，如 "2026-06" */
  updatedAt: string;
  /** 作者 */
  author?: string;
  /** 标签 */
  tags: string[];
}

/** Trigger 层 - 多维度触发条件 */
export interface Trigger {
  /** 触发场景描述 */
  scenarios: string[];
  /** 关键词 */
  keywords: string[];
  /** 别名/变体名称 */
  aliases: string[];
  /** 指标/信号（如 "403", "blocked"） */
  indicators: string[];
}

/** Knowledge 层 - 实战经验知识（核心） */
export interface Knowledge {
  /** 详细描述 */
  description: string;
  /** 症状/现象 */
  symptoms: string[];
  /** 根因分析 */
  rootCauses: string[];
  /** 实战观察 */
  observations: string[];
  /** 常见错误 */
  commonMistakes: string[];
  /** 补充说明 */
  notes: string[];
}

/** 具体示例 */
export interface Example {
  /** 示例名称 */
  name: string;
  /** 说明 */
  description: string;
  /** 内容 */
  content: string;
  /** 适用场景 */
  applicableScenarios?: string[];
}

/** Action 层 - 操作思路与技术 */
export interface Action {
  /** 操作检查清单 */
  checklist: string[];
  /** 技术手段 */
  techniques: string[];
  /** 具体示例 */
  examples: Example[];
}

/** Validation 层 - 结果验证标准 */
export interface Validation {
  /** 验证指标 */
  indicators: string[];
  /** 成功标志 */
  successSigns: string[];
  /** 误报标志 */
  falsePositiveSigns: string[];
}

/** Defense 层 - 防御建议 */
export interface Defense {
  /** 推荐做法 */
  recommendations: string[];
  /** 缓解措施 */
  mitigations: string[];
  /** 参考链接 */
  references: string[];
}

/** 质量控制 */
export interface Quality {
  /** 置信度 0-1 */
  confidence: number;
  /** 是否经过人工审查 */
  reviewed: boolean;
  /** 是否经过实战验证 */
  tested: boolean;
  /** 最后验证时间 */
  lastVerified: string;
}

/** 攻防 Skill 六层结构 */
export interface AttackDefenseSkill {
  /** 管理与分类 */
  metadata: Metadata;
  /** 多维度触发条件 */
  trigger: Trigger;
  /** 实战经验知识 */
  knowledge: Knowledge;
  /** 操作思路与技术 */
  action: Action;
  /** 结果验证标准 */
  validation: Validation;
  /** 防御建议 */
  defense: Defense;
  /** 质量控制 */
  quality?: Quality;
  /** 是否启用 */
  enabled?: boolean;
}
