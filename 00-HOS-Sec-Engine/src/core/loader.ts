import * as fs from 'fs';
import * as path from 'path';
import { AttackDefenseSkill } from '../types/skill';

/**
 * Skill 文件递归加载器
 * 自动扫描 skills 目录下所有 .ts 文件并加载所有导出的 Skill 数组
 */
export class SkillLoader {
  /**
   * 从目录递归加载所有 Skill
   * 扫描所有 .ts 文件，查找导出的 Skill 数组
   */
  static loadFromDirectory(dirPath: string): AttackDefenseSkill[] {
    const absolutePath = path.resolve(dirPath);
    if (!fs.existsSync(absolutePath)) {
      return [];
    }

    const allSkills: AttackDefenseSkill[] = [];
    this.scanDirectory(absolutePath, allSkills);

    return allSkills;
  }

  /**
   * 递归扫描目录
   */
  private static scanDirectory(dirPath: string, allSkills: AttackDefenseSkill[]): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, allSkills);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.js.map')) {
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
      // 使用 require 加载已编译的 .js 文件
      const jsPath = filePath.replace(/\.ts$/, '.js');
      if (!fs.existsSync(jsPath)) {
        return; // 跳过未编译的文件
      }

      const moduleExports = require(jsPath);

      for (const key of Object.keys(moduleExports)) {
        const value = moduleExports[key];
        if (Array.isArray(value) && value.length > 0) {
          // 检查数组元素是否是有效的 Skill 对象（有 metadata 字段）
          if (value[0]?.metadata?.id) {
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

    for (const p of paths) {
      const absolutePath = path.resolve(p);
      if (fs.existsSync(absolutePath)) {
        const skills = this.loadFromDirectory(absolutePath);
        allSkills.push(...skills);
      }
    }

    return allSkills;
  }
}
