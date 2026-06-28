/**
 * HOS-Sec-Engine - Skill Lifecycle Manager
 *
 * 技能生命周期管理的核心模块，负责：
 * 1. 技能创建（从 CWE/CVE/模板自动生成）
 * 2. 技能更新（批量更新已有技能的内容和元数据）
 * 3. 技能废弃（标记过时技能并推荐替代）
 * 4. 技能版本跟踪（semver 兼容的版本管理）
 */

import * as fs from 'fs';
import * as path from 'path';
import { AttackDefenseSkill, Metadata, Trigger, Knowledge, Action, Validation, Defense, SkillRuntime, DEFAULT_SKILL_RUNTIME } from '../types/skill';
import { SkillValidator } from './validator';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 项目根目录 */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
/** 技能输出目录 (skills/) */
const SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');
/** 源码技能目录 (src/skills/) */
const SRC_SKILLS_DIR = path.join(PROJECT_ROOT, 'src', 'skills');
/** 索引文件路径 */
const INDEX_PATH = path.join(PROJECT_ROOT, 'skills-index.json');

/**
 * 技能生命周期状态
 */
export type SkillStatus = 'active' | 'deprecated' | 'draft' | 'experimental';

/**
 * 技能生命周期元数据
 */
export interface SkillLifecycleMeta {
  id: string;
  status: SkillStatus;
  createdAt: string;
  updatedAt: string;
  version: string;          // semver, e.g. "1.0.0"
  deprecationReason?: string;
  replacementSkillId?: string;
  source?: 'manual' | 'template' | 'cwe' | 'cve' | 'derived' | 'finding';
  sourceRef?: string;       // CWE-ID, CVE-ID, or template name
  derivedFrom?: string;     // If derived from a finding, the finding ID
  lastVerified?: string;
  verificationNotes?: string;
}

/**
 * 技能变更记录
 */
export interface SkillChangeLog {
  skillId: string;
  timestamp: string;
  changeType: 'created' | 'updated' | 'deprecated' | 'reactivated' | 'deleted';
  version: string;
  description: string;
  author: string;
}

// ---------------------------------------------------------------------------
// Skill Lifecycle Manager
// ---------------------------------------------------------------------------

export class SkillLifecycleManager {
  private changeLog: SkillChangeLog[] = [];
  private lifecycleMeta: Map<string, SkillLifecycleMeta> = new Map();

  constructor() {
    this.loadLifecycleData();
  }

  // ==================== 技能创建 ====================

  /**
   * 从模板创建新技能
   * @param template 技能模板数据
   * @param source 来源（'manual' | 'cwe' | 'cve' | 'template' | 'derived'）
   * @param sourceRef 来源引用（如 CWE-79）
   */
  createSkillFromTemplate(
    template: Partial<AttackDefenseSkill>,
    source: SkillLifecycleMeta['source'] = 'manual',
    sourceRef?: string
  ): AttackDefenseSkill | null {
    // 验证必要字段
    if (!template.metadata?.id || !template.metadata?.category) {
      console.error('[SkillLifecycle] 技能创建失败: 缺少必要字段 (metadata.id, metadata.category)');
      return null;
    }

    const skill: AttackDefenseSkill = {
      metadata: template.metadata as Metadata,
      trigger: template.trigger || {
        scenarios: [],
        keywords: [],
        aliases: [],
        indicators: [],
      },
      knowledge: template.knowledge || {
        description: '',
        symptoms: [],
        rootCauses: [],
        observations: [],
        commonMistakes: [],
        notes: [],
      },
      action: template.action || {
        checklist: [],
        techniques: [],
        examples: [],
      },
      validation: template.validation || {
        indicators: [],
        successSigns: [],
        falsePositiveSigns: [],
      },
      defense: template.defense || {
        recommendations: [],
        mitigations: [],
        references: [],
      },
      enabled: true,
      runtime: template.runtime || { ...DEFAULT_SKILL_RUNTIME },
    };

    // 验证技能结构
    const errors = SkillValidator.validate(skill);
    if (errors.length > 0) {
      console.error(`[SkillLifecycle] 技能验证失败 [${skill.metadata.id}]: ${errors.join(', ')}`);
      return null;
    }

    // 注册生命周期元数据
    const now = new Date().toISOString();
    this.lifecycleMeta.set(skill.metadata.id, {
      id: skill.metadata.id,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      source,
      sourceRef,
    });

    // 记录变更
    this.addChangeLog({
      skillId: skill.metadata.id,
      timestamp: now,
      changeType: 'created',
      version: '1.0.0',
      description: `Skill ${skill.metadata.id} created from ${source}${sourceRef ? ` (${sourceRef})` : ''}`,
      author: 'HOS-Sec-Engine',
    });

    console.log(`[SkillLifecycle] 技能创建成功: ${skill.metadata.id} (v1.0.0, source: ${source})`);
    return skill;
  }

  /**
   * 批量创建技能（从模板数组）
   */
  createSkillsFromTemplates(
    templates: Array<Partial<AttackDefenseSkill> & { source?: SkillLifecycleMeta['source']; sourceRef?: string }>
  ): AttackDefenseSkill[] {
    const skills: AttackDefenseSkill[] = [];
    for (const tpl of templates) {
      const { source, sourceRef, ...template } = tpl;
      const skill = this.createSkillFromTemplate(template, source || 'template', sourceRef);
      if (skill) {
        skills.push(skill);
      }
    }
    return skills;
  }

  // ==================== 技能更新 ====================

  /**
   * 更新技能版本（自动递增版本号）
   */
  updateSkill(
    skillId: string,
    updates: Partial<AttackDefenseSkill>,
    changeDescription: string
  ): AttackDefenseSkill | null {
    const meta = this.lifecycleMeta.get(skillId);
    if (!meta) {
      console.error(`[SkillLifecycle] 技能 ${skillId} 不存在，无法更新`);
      return null;
    }

    // 版本递增
    const newVersion = this.bumpVersion(meta.version, 'patch');
    meta.version = newVersion;
    meta.updatedAt = new Date().toISOString();

    // 记录变更
    this.addChangeLog({
      skillId,
      timestamp: meta.updatedAt,
      changeType: 'updated',
      version: newVersion,
      description: changeDescription,
      author: 'HOS-Sec-Engine',
    });

    console.log(`[SkillLifecycle] 技能更新: ${skillId} → v${newVersion}: ${changeDescription}`);
    return updates as AttackDefenseSkill;
  }

  /**
   * 批量更新技能（如从 CVE 数据更新所有相关技能）
   */
  updateSkillsByTag(tag: string, updates: Partial<AttackDefenseSkill>, reason: string): number {
    let count = 0;
    for (const [id, meta] of this.lifecycleMeta) {
      if (meta.status === 'active') {
        this.updateSkill(id, updates, `${reason} (tag: ${tag})`);
        count++;
      }
    }
    return count;
  }

  // ==================== 技能废弃 ====================

  /**
   * 废弃技能（标记为 deprecated，推荐替代技能）
   */
  deprecateSkill(skillId: string, reason: string, replacementId?: string): boolean {
    const meta = this.lifecycleMeta.get(skillId);
    if (!meta) {
      console.error(`[SkillLifecycle] 技能 ${skillId} 不存在`);
      return false;
    }

    meta.status = 'deprecated';
    meta.deprecationReason = reason;
    meta.replacementSkillId = replacementId;
    meta.updatedAt = new Date().toISOString();

    this.addChangeLog({
      skillId,
      timestamp: meta.updatedAt,
      changeType: 'deprecated',
      version: meta.version,
      description: `Deprecated: ${reason}${replacementId ? ` → use ${replacementId}` : ''}`,
      author: 'HOS-Sec-Engine',
    });

    console.log(`[SkillLifecycle] 技能废弃: ${skillId} (reason: ${reason})`);
    return true;
  }

  // ==================== 版本管理 ====================

  /**
   * 简单的 semver 递增
   */
  bumpVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const parts = version.split('.').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return '1.0.1'; // fallback
    }
    switch (type) {
      case 'major': return `${parts[0] + 1}.0.0`;
      case 'minor': return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch': return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
  }

  /**
   * 获取技能生命周期元数据
   */
  getLifecycleMeta(skillId: string): SkillLifecycleMeta | undefined {
    return this.lifecycleMeta.get(skillId);
  }

  /**
   * 获取所有活跃技能
   */
  getActiveSkills(): SkillLifecycleMeta[] {
    return Array.from(this.lifecycleMeta.values()).filter(m => m.status === 'active');
  }

  /**
   * 获取变更日志
   */
  getChangeLog(): SkillChangeLog[] {
    return [...this.changeLog];
  }

  // ==================== 持久化 ====================

  /**
   * 持久化生命周期数据到文件
   */
  persist(): void {
    const dataPath = path.join(PROJECT_ROOT, '.claude', 'skill-lifecycle.json');
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify({
      lifecycleMeta: Object.fromEntries(this.lifecycleMeta),
      changeLog: this.changeLog,
    }, null, 2), 'utf-8');
  }

  /**
   * 加载生命周期数据
   */
  private loadLifecycleData(): void {
    const dataPath = path.join(PROJECT_ROOT, '.claude', 'skill-lifecycle.json');
    try {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        if (data.lifecycleMeta) {
          this.lifecycleMeta = new Map(Object.entries(data.lifecycleMeta));
        }
        if (data.changeLog) {
          this.changeLog = data.changeLog;
        }
      }
    } catch {
      // 文件不存在或已损坏，使用空数据
    }
  }

  private addChangeLog(entry: SkillChangeLog): void {
    this.changeLog.push(entry);
    // 只保留最近 1000 条
    if (this.changeLog.length > 1000) {
      this.changeLog = this.changeLog.slice(-1000);
    }
  }
}

/** 全局单例 */
export const skillLifecycle = new SkillLifecycleManager();
