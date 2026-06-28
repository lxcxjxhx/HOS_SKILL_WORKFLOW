import * as fs from 'fs';
import * as path from 'path';
import { AttackDefenseSkill } from '../types/skill';
import { isSafeToTraverse } from '../utils/fs-safe';

/**
 * Skill 文件递归加载器
 * 自动扫描 skills 目录下所有已编译的 .js 文件并加载所有导出的 Skill 数组
 */
export class SkillLoader {

  /**
   * 从目录递归加载所有 Skill
   * 扫描所有已编译的 .js 文件，查找导出的 Skill 数组
   */
  static loadFromDirectory(dirPath: string): AttackDefenseSkill[] {
    const absolutePath = path.resolve(dirPath);
    if (!fs.existsSync(absolutePath)) {
      return [];
    }

    const allSkills: AttackDefenseSkill[] = [];
    this.scanDirectory(absolutePath, allSkills, 0, new Set<string>());

    // 去重：防止同一 Skill ID 被多次加载
    const seenIds = new Set<string>();
    const deduplicated: AttackDefenseSkill[] = [];
    for (const skill of allSkills) {
      const id = skill.metadata?.id;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        deduplicated.push(skill);
      }
    }

    return deduplicated;
  }

  /**
   * 递归扫描目录
   * @param dirPath 目录路径
   * @param allSkills 收集所有 Skill 的数组
   * @param depth 当前递归深度
   * @param visitedDirs 已访问目录的 realpath 集合，用于检测循环符号链接
   */
  private static scanDirectory(dirPath: string, allSkills: AttackDefenseSkill[], depth: number = 0, visitedDirs: Set<string> = new Set()): void {
    if (!isSafeToTraverse(dirPath, depth, visitedDirs, 'SkillLoader')) {
      return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, allSkills, depth + 1, visitedDirs);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.js.map')) {
        // 跳过 index.js 避免循环加载和重复
        if (entry.name === 'index.js') {
          continue;
        }
        this.loadSkillsFromFile(fullPath, allSkills);
      }
    }
  }

  /**
   * 从单个文件加载 Skill
   * 使用 require 加载并提取所有以 "Skills" 结尾的导出数组
   */
  private static loadSkillsFromFile(filePath: string, allSkills: AttackDefenseSkill[]): void {
    try {
      // Clear require cache to ensure fresh module code is loaded during hot reload
      try {
        delete require.cache[require.resolve(filePath)];
      } catch {
        // Module not in cache, ignore
      }

      // 使用 require 加载已编译的 .js 文件
      const moduleExports = require(filePath);

      for (const key of Object.keys(moduleExports)) {
        const value = moduleExports[key];
        if (Array.isArray(value) && value.length > 0) {
          // 验证数组中所有元素都是有效的 Skill 对象（有 metadata.id 字段）
          const allValid = value.every((item: any) => item?.metadata?.id);
          if (allValid) {
            allSkills.push(...value);
          }
        }
      }
    } catch (error) {
      console.warn(`加载 Skill 文件失败 [${filePath}]: ${error}`);
    }
  }

  /**
   * 从多个路径加载 Skill
   */
  static loadFromPaths(paths: string[]): AttackDefenseSkill[] {
    const allSkills: AttackDefenseSkill[] = [];
    const seenFiles = new Set<string>();

    for (const p of paths) {
      const absolutePath = path.resolve(p);
      if (!fs.existsSync(absolutePath)) {
        continue;
      }
      const canonicalPath = fs.realpathSync(absolutePath);
      if (seenFiles.has(canonicalPath)) {
        continue;
      }
      seenFiles.add(canonicalPath);
      const skills = this.loadFromDirectory(absolutePath);
      allSkills.push(...skills);
    }

    return allSkills;
  }
}
