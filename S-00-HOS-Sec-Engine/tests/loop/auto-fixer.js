/**
 * HOS-Sec-Engine Loop Test System — AutoFixer
 *
 * 自动修复模块：解析构建/测试错误，尝试自动修复常见问题，
 * 并在每次修复前备份原始文件。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.resolve(__dirname, 'backups');

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * 生成备份文件名：原始文件名 + 时间戳，防止重名覆盖
 */
function backupPath(originalFile) {
  const ts = Date.now();
  const base = path.basename(originalFile);
  const dir = path.dirname(originalFile).replace(/[:<>"\/\\|?*]/g, '_');
  const name = `${ts}_${dir}_${base}`;
  return path.join(BACKUP_DIR, name);
}

// ------------------------------------------------------------------
// AutoFixer
// ------------------------------------------------------------------
class AutoFixer {
  constructor(options = {}) {
    this.fixHistory = [];
    this.backupEnabled = options.backupEnabled !== false;
  }

  // ================================================================
  // parseBuildErrors
  // ================================================================
  /**
   * 解析 npm run build 的 TypeScript 编译错误输出
   *
   * 支持的格式：
   *   src/file.ts:line:col - error TSxxxx: message
   *
   * @param {string} stderr
   * @returns {Array<{file: string, line: number, col: number, code: string, message: string}>}
   */
  parseBuildErrors(stderr) {
    if (!stderr || typeof stderr !== 'string') return [];

    const errors = [];
    const pattern = /^(.+?):(\d+):(\d+)\s*-\s*error\s+(TS\d+)\s*:\s*(.+)$/gm;
    let match;

    while ((match = pattern.exec(stderr)) !== null) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2], 10),
        col: parseInt(match[3], 10),
        code: match[4],
        message: match[5].trim(),
      });
    }

    return errors;
  }

  // ================================================================
  // parseTestErrors
  // ================================================================
  /**
   * 解析测试失败输出，提取失败的测试名称和断言信息
   *
   * 支持的格式：
   *   ❌ Test N: name
   *
   * @param {string} stderr
   * @returns {Array<{testName: string, errorMessage: string}>}
   */
  parseTestErrors(stderr) {
    if (!stderr || typeof stderr !== 'string') return [];

    const errors = [];

    // 匹配 ❌ Test N: name 格式
    const namePattern = /❌\s+Test\s+\d+\s*:\s*(.+?)(?:\n|$)/g;
    let match;
    while ((match = namePattern.exec(stderr)) !== null) {
      errors.push({
        testName: match[1].trim(),
        errorMessage: '',
      });
    }

    // 尝试关联错误信息（紧跟 test name 的下几行）
    if (errors.length > 0) {
      const lines = stderr.split('\n');
      for (let i = 0; i < errors.length; i++) {
        const err = errors[i];
        const nameIndex = stderr.indexOf(`❌ Test `);
        if (nameIndex === -1) continue;

        // 从 test 行之后查找第一个非空行作为错误信息
        const afterTest = stderr.slice(nameIndex);
        const msgLines = afterTest.split('\n').slice(1);
        for (const line of msgLines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('❌') && !trimmed.startsWith('✅') && !trimmed.startsWith('=')) {
            err.errorMessage = trimmed;
            break;
          }
        }
      }
    }

    return errors;
  }

  // ================================================================
  // attemptFix
  // ================================================================
  /**
   * 对常见错误尝试自动修复
   *
   * @param {Array} errors - 由 parseBuildErrors 或 parseTestErrors 返回的错误数组
   * @returns {{fixed: boolean, changes: Array<{file, original, replacement}>, failed: Array<{file, reason}>}}
   */
  attemptFix(errors) {
    const changes = [];
    const failed = [];

    for (const err of errors) {
      if (!err.file) {
        failed.push({ file: '(unknown)', reason: '错误条目缺少 file 字段' });
        continue;
      }

      const absFile = path.resolve(err.file);
      if (!fs.existsSync(absFile)) {
        failed.push({ file: err.file, reason: `文件不存在: ${absFile}` });
        continue;
      }

      // --- 类型错误（TypeScript type errors）-> 记录并跳过 ---
      if (err.code && err.code.startsWith('TS') && err.code !== 'TS2307') {
        failed.push({ file: err.file, reason: `类型错误 ${err.code}，需要人工介入: ${err.message}` });
        continue;
      }

      // --- 导入错误（Cannot find module）---
      if (err.code === 'TS2307' || /cannot find module/i.test(err.message)) {
        failed.push({ file: err.file, reason: `导入错误，需手动安装依赖或调整路径: ${err.message}` });
        continue;
      }

      // --- 空值检查：尝试为可能为 null 的表达式添加空值保护 ---
      const fixResult = this._attemptNullCheckFix(absFile, err);
      if (fixResult) {
        changes.push(fixResult);
        continue;
      }

      failed.push({ file: err.file, reason: `无法自动修复: ${err.code ? err.code + ': ' : ''}${err.message}` });
    }

    const fixed = changes.length > 0;

    if (fixed) {
      this.fixHistory.push({
        timestamp: new Date().toISOString(),
        changes: [...changes],
        failed: [...failed],
      });
    }

    return { fixed, changes, failed };
  }

  /**
   * 尝试对空值相关错误进行自动修复
   * 检测文件中的 Object is possibly 'null'/'undefined' 等错误
   */
  _attemptNullCheckFix(absFile, err) {
    const nullPatterns = [
      /object is possibly '?(null|undefined)'?/i,
      /cannot read properties of (null|undefined)/i,
      /possibly (null|undefined)/i,
    ];

    const isNullError = nullPatterns.some(p => p.test(err.message));
    if (!isNullError || !err.line) return null;

    const content = fs.readFileSync(absFile, 'utf-8');
    const lines = content.split('\n');
    const targetIdx = err.line - 1;

    if (targetIdx < 0 || targetIdx >= lines.length) return null;

    const originalLine = lines[targetIdx];
    const trimmed = originalLine.trim();

    // 跳过已经带有空值保护的表达式
    if (trimmed.includes('?.') || trimmed.includes('??') || trimmed.startsWith('if (') || trimmed.startsWith('if(')) {
      return null;
    }

    // 尝试识别变量名（简化处理：取第一个标识符）
    const varMatch = trimmed.match(/^\s*(const|let|var)\s+(\w+)\s*=\s*(.+);?$/);
    if (varMatch) {
      const varName = varMatch[2];
      const valueExpr = varMatch[3];
      const replacement = `${varMatch[1]} ${varName} = ${valueExpr} ?? /* auto-fix: default */ null;`;
      lines[targetIdx] = originalLine.replace(trimmed, replacement);

      // 在赋值后添加空值检查
      const guardLine = `if (${varName} === null || ${varName} === undefined) { /* auto-fix: skipped null check */ }`;
      lines.splice(targetIdx + 1, 0, guardLine);

      const newContent = lines.join('\n');

      // 备份
      if (this.backupEnabled) {
        ensureBackupDir();
        fs.copyFileSync(absFile, backupPath(absFile));
      }

      fs.writeFileSync(absFile, newContent, 'utf-8');

      return {
        file: absFile,
        original: originalLine,
        replacement: lines[targetIdx],
      };
    }

    return null;
  }

  // ================================================================
  // rollback
  // ================================================================
  /**
   * 从备份恢复文件
   *
   * @param {Object} change - attemptFix 返回的 changes 数组中的一项 {file}
   * @returns {boolean} 是否成功恢复
   */
  rollback(change) {
    if (!change || !change.file) return false;

    const originalFile = change.file;
    const base = path.basename(originalFile);

    // 在 backup 目录中查找属于该文件的最新备份
    if (!fs.existsSync(BACKUP_DIR)) return false;

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(base))
      .sort()
      .reverse();

    if (backups.length === 0) return false;

    const latestBackup = path.join(BACKUP_DIR, backups[0]);
    fs.copyFileSync(latestBackup, originalFile);

    this.fixHistory.push({
      timestamp: new Date().toISOString(),
      rollback: true,
      file: originalFile,
      restoredFrom: latestBackup,
    });

    return true;
  }

  // ================================================================
  // getFixHistory
  // ================================================================
  /**
   * 返回修复历史记录
   *
   * @returns {Array}
   */
  getFixHistory() {
    return [...this.fixHistory];
  }
}

// ------------------------------------------------------------------
// exports
// ------------------------------------------------------------------
module.exports = { AutoFixer };