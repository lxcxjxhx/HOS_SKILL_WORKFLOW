import { AttackDefenseSkill } from '../types/skill';
import { SkillResult, ExecuteQuery, EngineConfig } from '../types/result';
import { Playbook, FlowContext, OrchestrationResult } from '../types/playbook';
import { SkillValidator } from './validator';
import { SkillMatcher } from './matcher';
import { SkillFormatter } from './formatter';
import { SkillLoader } from './loader';
import { FlowOrchestrator } from './orchestrator';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<EngineConfig> = {
  strictMode: true,
  maxResults: 10,
  minMatchScore: 0.1,
  customSkillsDir: '',
  loadPresetSkills: true
};

/**
 * HOS-Sec-Engine V2 - Skill Engine
 * 攻防专项 Skill 引擎
 */
export class HosSecEngine {
  private config: Required<EngineConfig>;
  private skills: Map<string, AttackDefenseSkill>;
  private matcher: SkillMatcher;
  private orchestrator: FlowOrchestrator;
  private playbooks: Map<string, Playbook>;

  constructor(config: EngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.skills = new Map();
    this.playbooks = new Map();
    this.matcher = new SkillMatcher(this.config);
    this.orchestrator = new FlowOrchestrator(this);

    if (this.config.loadPresetSkills) {
      this.loadPresetSkills();
    }

    if (this.config.customSkillsDir) {
      this.loadCustomSkills();
    }
  }

  /**
   * 加载预设 Skill
   * 从 skills/ 目录递归加载所有 Skill 文件
   * AI 维护：新增 Skill 只需在 skills/ 子目录下创建文件，无需修改此文件
   */
  private loadPresetSkills(): void {
    try {
      // __dirname = dist/src/core, need to go up to dist/src/skills
      const skillsDir = require('path').resolve(__dirname, '..', 'skills');
      const skills = SkillLoader.loadFromDirectory(skillsDir);
      this.registerSkills(skills);
    } catch (error) {
      // 预设 Skill 目录不存在时不报错
    }
  }

  /**
   * 加载自定义 Skill
   */
  private loadCustomSkills(): void {
    const skills = SkillLoader.loadFromDirectory(this.config.customSkillsDir);
    this.registerSkills(skills);
  }

  /**
   * 注册单个 Skill
   */
  registerSkill(skill: AttackDefenseSkill): void {
    const errors = SkillValidator.validate(skill);
    if (errors.length > 0) {
      if (this.config.strictMode) {
        throw new Error(`Skill 验证失败 [${skill.metadata.id}]: ${errors.join(', ')}`);
      }
      return;
    }

    if (this.skills.has(skill.metadata.id)) {
      if (this.config.strictMode) {
        throw new Error(`Skill ID 重复: ${skill.metadata.id}`);
      }
    }

    if (skill.enabled === undefined) {
      skill.enabled = true;
    }

    this.skills.set(skill.metadata.id, skill);
  }

  /**
   * 批量注册 Skill
   */
  registerSkills(skills: AttackDefenseSkill[]): void {
    const validationResults = SkillValidator.validateBatch(skills);
    if (validationResults.size > 0) {
      const errorMessages: string[] = [];
      for (const [id, errors] of validationResults) {
        errorMessages.push(`[${id}]: ${errors.join(', ')}`);
      }
      if (this.config.strictMode) {
        throw new Error(`Skill 验证失败:\n${errorMessages.join('\n')}`);
      }
    }

    for (const skill of skills) {
      if (validationResults.has(skill.metadata.id)) {
        continue;
      }
      this.registerSkill(skill);
    }
  }

  /**
   * 执行查询
   */
  execute(query: ExecuteQuery, format: 'text' | 'json' = 'text'): string {
    const allSkills = Array.from(this.skills.values());
    const results = this.matcher.match(query, allSkills);

    if (format === 'json') {
      return SkillFormatter.formatJson(results);
    }
    return SkillFormatter.formatText(results);
  }

  /**
   * 获取原始匹配结果
   */
  executeRaw(query: ExecuteQuery): SkillResult[] {
    const allSkills = Array.from(this.skills.values());
    return this.matcher.match(query, allSkills);
  }

  /**
   * 获取所有已加载的 Skill
   */
  getSkills(): AttackDefenseSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 根据 ID 获取 Skill
   */
  getSkillById(id: string): AttackDefenseSkill | undefined {
    return this.skills.get(id);
  }

  /**
   * 获取 Skill 数量
   */
  getSkillCount(): number {
    return this.skills.size;
  }

  /**
   * 启用/禁用 Skill
   */
  enableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = true;
      return true;
    }
    return false;
  }

  disableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 移除 Skill
   */
  removeSkill(id: string): boolean {
    return this.skills.delete(id);
  }

  /**
   * 清空所有 Skill
   */
  clearSkills(): void {
    this.skills.clear();
  }

  // ==================== 流程编排能力 ====================

  /**
   * 加载流程定义
   * @param playbook 流程定义对象
   */
  loadPlaybook(playbook: Playbook): void {
    this.playbooks.set(playbook.id, playbook);
    this.orchestrator.loadPlaybook(playbook);
  }

  /**
   * 获取所有已加载的流程
   * @returns 流程列表
   */
  getPlaybooks(): Playbook[] {
    return Array.from(this.playbooks.values());
  }

  /**
   * 根据 ID 获取已加载的流程
   * @param id 流程 ID
   * @returns 流程定义或 undefined
   */
  getPlaybookById(id: string): Playbook | undefined {
    return this.playbooks.get(id);
  }

  /**
   * 获取流程关联的 Skill 列表
   * @param playbookId 流程 ID
   * @returns 关联的 Skill 列表
   */
  getSkillsByPlaybook(playbookId: string): AttackDefenseSkill[] {
    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      return [];
    }

    const skillIds = new Set<string>();
    for (const phase of playbook.phases) {
      for (const skillId of phase.skills) {
        skillIds.add(skillId);
      }
    }

    const result: AttackDefenseSkill[] = [];
    for (const skillId of skillIds) {
      const skill = this.skills.get(skillId);
      if (skill) {
        result.push(skill);
      }
    }

    return result;
  }

  /**
   * 执行流程
   * @param context 流程上下文
   * @returns 流程执行结果
   */
  async executeFlow(context: FlowContext): Promise<OrchestrationResult> {
    return this.orchestrator.executeFlow(context);
  }

  /**
   * 获取流程编排器实例
   * @returns FlowOrchestrator 实例
   */
  getOrchestrator(): FlowOrchestrator {
    return this.orchestrator;
  }
}
