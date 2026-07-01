#!/usr/bin/env node
/**
 * HOS-Sec-Engine .skill Package Builder
 *
 * 将所有必要文件打包为 .skill 文件（ZIP 格式）
 * 兼容 TRAE / CURSOR / CODEX / Claude Code 等 IDE
 *
 * Usage:
 *   node scripts/package-skill.js                    # 打包全部
 *   node scripts/package-skill.js --output ../       # 指定输出目录
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');

// ============================================================================
// Config
// ============================================================================

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(ROOT, '..');

const PACKAGE_NAME = 'hos-sec-engine';
const PACKAGE_VERSION = '4.0.0';

// 需要打包的核心目录和文件（相对于 ROOT）
const CORE_FILES = [
  'README.md',
  'package.json',
  'skills-index.json',
  'tsconfig.json',
  '.gitignore',
];

const CORE_DIRS = [
  'dist',
  'src',
  'config',
  'scripts',
  'docs',
  'templates',
  'tests',
];

// 需要排除的文件/目录模式
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.pyc$/,
  /__pycache__/,
  /\.claude/,
  /\.git/,
  /\.DS_Store/,
  /分成交/,
  /分成两半/,
];

// ============================================================================
// Helpers
// ============================================================================

function shouldExclude(name) {
  return EXCLUDE_PATTERNS.some(p => p.test(name));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, prefix = '') {
  if (!fs.existsSync(src)) return;
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const relPath = prefix ? `${prefix}/${item}` : item;
    if (shouldExclude(relPath)) continue;
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, path.join(dest, item), relPath);
    } else {
      copyFile(srcPath, path.join(dest, item));
    }
  }
}

function listFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (shouldExclude(item)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...listFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// ============================================================================
// ZIP functions (pure Node.js, no extra dependencies)
// ============================================================================

/**
 * 创建简单的 ZIP 文件 - 使用 deflate raw
 * 这是一个最小化 ZIP 实现，支持 Stored (no compression) 和 Deflate 方法
 */
function createZip(files, outputPath) {
  const { crc32 } = require('buffer');
  const zlib = require('zlib');

  // ZIP file structure constants
  const LOCAL_FILE_HEADER_SIG = 0x04034b50;
  const CENTRAL_DIR_HEADER_SIG = 0x02014b50;
  const END_OF_CENTRAL_DIR_SIG = 0x06054b50;

  const localHeaders = [];
  const centralDirEntries = [];
  let offset = 0;

  for (const { name, data, isRaw } of files) {
    const utfName = Buffer.from(name, 'utf-8');
    let compressedData;
    let compressionMethod;
    let crc;

    if (isRaw) {
      // Use stored (no compression)
      compressedData = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
      compressionMethod = 0;
    } else {
      // Use deflate
      const raw = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
      crc = crc32(raw);
      compressedData = zlib.deflateRawSync(raw, { level: 9 });
      compressionMethod = 8;
    }

    // CRC
    if (!crc) {
      const raw = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
      crc = crc32(raw);
    }

    // Local file header
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER_SIG, 0);
    localHeader.writeUInt16LE(20, 4);    // version needed
    localHeader.writeUInt16LE(0x800, 6); // general purpose bit flag (UTF-8)
    localHeader.writeUInt16LE(compressionMethod, 8);
    localHeader.writeUInt16LE(0, 10);    // mod time
    localHeader.writeUInt16LE(0, 12);    // mod date
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(Buffer.from(data).length, 22);
    localHeader.writeUInt16LE(utfName.length, 26);

    localHeaders.push({
      header: localHeader,
      name: utfName,
      data: compressedData,
      crc,
      compressedSize: compressedData.length,
      uncompressedSize: Buffer.from(data).length,
      compressionMethod,
    });
  }

  // Write local files
  const chunks = [];
  offset = 0;
  const centralDirOffsets = [];

  for (const lh of localHeaders) {
    centralDirOffsets.push(offset);
    chunks.push(lh.header);
    chunks.push(lh.name);
    chunks.push(lh.data);
    offset += 30 + lh.name.length + lh.data.length;
  }

  // Central directory
  for (let i = 0; i < localHeaders.length; i++) {
    const lh = localHeaders[i];
    const cdEntry = Buffer.alloc(46);
    cdEntry.writeUInt32LE(CENTRAL_DIR_HEADER_SIG, 0);
    cdEntry.writeUInt16LE(20, 4);    // version made by
    cdEntry.writeUInt16LE(20, 6);    // version needed
    cdEntry.writeUInt16LE(0x800, 8); // UTF-8
    cdEntry.writeUInt16LE(lh.compressionMethod, 10);
    cdEntry.writeUInt16LE(0, 12);    // mod time
    cdEntry.writeUInt16LE(0, 14);    // mod date
    cdEntry.writeUInt32LE(lh.crc, 16);
    cdEntry.writeUInt32LE(lh.compressedSize, 20);
    cdEntry.writeUInt32LE(lh.uncompressedSize, 24);
    cdEntry.writeUInt16LE(lh.name.length, 28);
    cdEntry.writeUInt16LE(0, 30);    // extra field length
    cdEntry.writeUInt16LE(0, 32);    // file comment length
    cdEntry.writeUInt16LE(0, 34);    // disk number start
    cdEntry.writeUInt16LE(0, 36);    // internal file attributes
    cdEntry.writeUInt32LE(0, 38);    // external file attributes
    cdEntry.writeUInt32LE(centralDirOffsets[i], 42);

    chunks.push(cdEntry);
    chunks.push(lh.name);
  }

  // End of central directory
  const cdStart = Buffer.concat(chunks).length - (() => {
    let total = 0;
    for (let i = 0; i < localHeaders.length; i++) {
      total += 46 + localHeaders[i].name.length;
    }
    return total;
  })();

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(END_OF_CENTRAL_DIR_SIG, 0);
  eocd.writeUInt16LE(0, 4);     // disk number
  eocd.writeUInt16LE(0, 6);     // disk with CD
  eocd.writeUInt16LE(localHeaders.length, 8);
  eocd.writeUInt16LE(localHeaders.length, 10);
  const cdSize = Buffer.concat(chunks.slice(chunks.length - localHeaders.length * 2)).length;
  // Actually compute it properly
  const cdEntries = [];
  for (let i = 0; i < localHeaders.length; i++) {
    const lh = localHeaders[i];
    const entry = Buffer.alloc(46 + lh.name.length);
    entry.writeUInt32LE(CENTRAL_DIR_HEADER_SIG, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x800, 8);
    entry.writeUInt16LE(lh.compressionMethod, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(0, 14);
    entry.writeUInt32LE(lh.crc, 16);
    entry.writeUInt32LE(lh.compressedSize, 20);
    entry.writeUInt32LE(lh.uncompressedSize, 24);
    entry.writeUInt16LE(lh.name.length, 28);
    entry.writeUInt16LE(0, 30);
    entry.writeUInt16LE(0, 32);
    entry.writeUInt16LE(0, 34);
    entry.writeUInt16LE(0, 36);
    entry.writeUInt32LE(0, 38);
    entry.writeUInt32LE(centralDirOffsets[i], 42);
    lh.name.copy(entry, 46);
    cdEntries.push(entry);
  }

  const allChunks = [];
  for (const lh of localHeaders) {
    allChunks.push(lh.header);
    allChunks.push(lh.name);
    allChunks.push(lh.data);
  }

  const cdStartOffset = Buffer.concat(allChunks).length;
  for (const entry of cdEntries) {
    allChunks.push(entry);
  }

  const eocdBuffer = Buffer.alloc(22);
  eocdBuffer.writeUInt32LE(END_OF_CENTRAL_DIR_SIG, 0);
  eocdBuffer.writeUInt16LE(0, 4);
  eocdBuffer.writeUInt16LE(0, 6);
  eocdBuffer.writeUInt16LE(localHeaders.length, 8);
  eocdBuffer.writeUInt16LE(localHeaders.length, 10);
  const cdTotalSize = cdEntries.reduce((s, e) => s + e.length, 0);
  eocdBuffer.writeUInt32LE(cdTotalSize, 12);
  eocdBuffer.writeUInt32LE(cdStartOffset, 16);
  eocdBuffer.writeUInt16LE(0, 20);

  allChunks.push(eocdBuffer);

  const zipBuffer = Buffer.concat(allChunks);
  fs.writeFileSync(outputPath, zipBuffer);
  return zipBuffer;
}

// Use a simpler approach - write a Node.js zip via the archiver if available, or shell out
function createZipSimple(files, outputPath) {
  // Write each file into a temp directory, then use system zip
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hos-skill-'));

  for (const { name, data } of files) {
    const filePath = path.join(tmpDir, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data, 'utf-8');
  }

  // Try to use 'zip' or '7z' or 'tar' + rename
  const { execSync } = require('child_process');

  try {
    // Try PowerShell Compress-Archive (Windows)
    if (process.platform === 'win32') {
      const tmpZip = path.join(tmpDir, 'package.zip');
      execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${tmpZip}' -Force"`,
        { stdio: 'pipe', timeout: 60000 }
      );
      fs.copyFileSync(tmpZip, outputPath);
      cleanup(tmpDir);
      return;
    }

    // Try zip command
    try {
      execSync(`cd "${tmpDir}" && zip -r "${outputPath}" .`, { stdio: 'pipe', timeout: 60000 });
      cleanup(tmpDir);
      return;
    } catch {
      // Fallback to tar
      execSync(`cd "${tmpDir}" && tar -czf "${outputPath}" .`, { stdio: 'pipe', timeout: 60000 });
      cleanup(tmpDir);
      return;
    }
  } catch (err) {
    cleanup(tmpDir);
    throw new Error(`Failed to create archive: ${err.message}`);
  }
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

// ============================================================================
// Generate Cursor .mdc files
// ============================================================================

function generateCursorMdc(skillId, skillName, description, content) {
  // Cursor .mdc format: YAML frontmatter + markdown body
  // description and globs are optional
  const shortDesc = description.length > 120
    ? description.substring(0, 117) + '...'
    : description;

  return `---
description: ${shortDesc}
globs:
---
# ${skillName}

${content}
`;
}

function parseSkillInfo(skillDir) {
  const skMdPath = path.join(skillDir, 'SKILL.md');
  const content = readFile(skMdPath);
  if (!content) return null;

  // Extract frontmatter
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*"?(.+?)"?$/m);

  const name = nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, '') : path.basename(skillDir);
  const description = descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : '';

  // Get body (after frontmatter)
  const bodyMatch = content.match(/^---\s*\n[\s\S]*?\n---\n\n?([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1] : '';

  // Get the knowledge part for Cursor content
  // Cursor .mdc files work best with the core description + trigger + checklist

  return { name, description, body, content };
}

// ============================================================================
// Collect all skills
// ============================================================================

function collectSkills() {
  const skillsDir = path.join(ROOT, 'skills');
  const skills = [];

  if (!fs.existsSync(skillsDir)) return skills;

  const items = fs.readdirSync(skillsDir);
  for (const item of items) {
    const skillDir = path.join(skillsDir, item);
    if (!fs.statSync(skillDir).isDirectory()) continue;
    if (item.startsWith('.')) continue;
    if (!fs.existsSync(path.join(skillDir, 'SKILL.md'))) continue;

    const info = parseSkillInfo(skillDir);
    if (info) {
      skills.push({ id: item, ...info, dir: skillDir });
    }
  }

  return skills;
}

// ============================================================================
// Build Package
// ============================================================================

function buildPackage() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     HOS-Sec-Engine .skill Package Builder       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  const timestamp = new Date().toISOString();
  const files = [];
  const skills = collectSkills();

  console.log(`📦 Found ${skills.length} skills`);
  console.log();

  // 1. Manifest
  const manifest = {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    description: 'HOS-Sec-Engine 攻防实战规则引擎 - 33个实战攻防技能覆盖11大安全领域',
    author: 'HOS Team',
    license: 'MIT',
    timestamp,
    skills: skills.map(s => ({ id: s.id, name: s.name })),
    compatible: ['trae', 'cursor', 'claude-code', 'codex', 'windsurf'],
    formats: {
      trae: '.trae/skills/<id>/SKILL.md',
      cursor: 'cursor-rules/<id>.mdc',
      claude: 'skills/<id>/SKILL.md',
      codex: 'cursor-rules/<id>.mdc',
    },
    install: {
      trae: 'Copy skills/ directory to .trae/skills/ in your project',
      cursor: 'Copy cursor-rules/*.mdc to .cursor/rules/ in your project',
      'claude-code': 'Copy skills/ directory to .claude/skills/ in your project',
      codex: 'Copy cursor-rules/*.mdc to .cursor/rules/ in your project',
    },
  };

  files.push({ name: 'manifest.json', data: JSON.stringify(manifest, null, 2) });
  console.log('  ✓ manifest.json');

  // 2. README
  const readme = readFile(path.join(ROOT, 'README.md'));
  if (readme) {
    files.push({ name: 'README.md', data: readme });
    console.log('  ✓ README.md');
  }

  // 3. package.json
  const pkg = readFile(path.join(ROOT, 'package.json'));
  if (pkg) {
    files.push({ name: 'package.json', data: pkg });
    console.log('  ✓ package.json');
  }

  // 4. skills-index.json
  const index = readFile(path.join(ROOT, 'skills-index.json'));
  if (index) {
    files.push({ name: 'skills-index.json', data: index });
    console.log('  ✓ skills-index.json');
  }

  // 5. Core engine files
  for (const dir of CORE_DIRS) {
    const srcDir = path.join(ROOT, dir);
    if (!fs.existsSync(srcDir)) continue;
    const dirFiles = listFiles(srcDir);
    for (const file of dirFiles) {
      const relPath = path.relative(ROOT, file);
      if (shouldExclude(relPath)) continue;
      try {
        const data = readFile(file);
        if (data !== null) {
          files.push({ name: `engine/${relPath.replace(/\\/g, '/')}`, data });
        }
      } catch {}
    }
    console.log(`  ✓ engine/${dir}/`);
  }

  // 6. Skill files (TRAE / Claude Code format)
  for (const skill of skills) {
    const skContent = readFile(path.join(skill.dir, 'SKILL.md'));
    if (skContent) {
      files.push({ name: `skills/${skill.id}/SKILL.md`, data: skContent });
    }
  }
  console.log(`  ✓ skills/ (${skills.length} skills for TRAE/Claude Code)`);

  // 7. hos-sec-engine master skill
  const engineSkillDir = path.join(ROOT, 'skills', 'hos-sec-engine');
  if (fs.existsSync(engineSkillDir)) {
    const engineFiles = listFiles(engineSkillDir);
    for (const file of engineFiles) {
      const relPath = path.relative(path.join(ROOT, 'skills'), file);
      try {
        const data = readFile(file);
        if (data !== null) {
          files.push({ name: `skills/${relPath.replace(/\\/g, '/')}`, data });
        }
      } catch {}
    }
    console.log('  ✓ skills/hos-sec-engine/ (master engine skill)');
  }

  // 8. Cursor .mdc rules
  for (const skill of skills) {
    const mdcContent = generateCursorMdc(
      skill.id,
      skill.name,
      skill.description,
      skill.content || skill.body
    );
    files.push({ name: `cursor-rules/${skill.id}.mdc`, data: mdcContent });
    console.log(`  ✓ cursor-rules/${skill.id}.mdc`);
  }

  // 9. Cursor master rule
  const masterMdcContent = generateCursorMdc(
    'hos-sec-engine',
    'HOS-Sec-Engine 统一攻防引擎',
    'HOS-Sec-Engine 攻防实战规则引擎 - 根据用户描述的场景自动匹配最合适的攻防技能',
    readFile(path.join(ROOT, 'skills', 'hos-sec-engine', 'SKILL.md')) || ''
  );
  files.push({ name: 'cursor-rules/hos-sec-engine.mdc', data: masterMdcContent });
  console.log('  ✓ cursor-rules/hos-sec-engine.mdc (master Cursor rule)');

  // 10. Config files
  const configDir = path.join(ROOT, 'config');
  if (fs.existsSync(configDir)) {
    const configFiles = listFiles(configDir);
    for (const file of configFiles) {
      const relPath = path.relative(ROOT, file);
      if (shouldExclude(relPath)) continue;
      try {
        const data = readFile(file);
        if (data !== null) {
          files.push({ name: relPath.replace(/\\/g, '/'), data });
        }
      } catch {}
    }
    console.log('  ✓ config/');
  }

  // 11. Install script for cross-IDE
  const installScript = generateInstallScript(skills);
  files.push({ name: 'install.js', data: installScript });
  console.log('  ✓ install.js (cross-IDE installer)');

  // 12. .hos-sec-cve (CVE database)
  const cveDir = path.join(ROOT, '.hos-sec-cve');
  if (fs.existsSync(cveDir)) {
    const cveFiles = listFiles(cveDir);
    for (const file of cveFiles) {
      const relPath = path.relative(ROOT, file);
      if (shouldExclude(relPath)) continue;
      try {
        const data = readFile(file);
        if (data !== null) {
          files.push({ name: relPath.replace(/\\/g, '/'), data });
        }
      } catch {}
    }
    console.log('  ✓ .hos-sec-cve/ (CVE database)');
  }

  // ============================================================================
  // Write package
  // ============================================================================
  console.log();
  console.log(`📝 Total files to package: ${files.length}`);
  console.log();

  // Output path (use .zip for creation, then rename to .skill)
  const outputFileName = `${PACKAGE_NAME}-v${PACKAGE_VERSION}.skill`;
  const zipPath = path.join(OUTPUT_DIR, `${PACKAGE_NAME}-v${PACKAGE_VERSION}.zip`);
  const outputPath = path.join(OUTPUT_DIR, outputFileName);

  console.log(`🔨 Creating package: ${outputFileName}`);
  console.log();

  // Create the ZIP file
  try {
    // Try using PowerShell Compress-Archive first (Windows)
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hos-skill-'));

    // Write all files to temp directory
    for (const { name, data } of files) {
      const filePath = path.join(tmpDir, name);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data, 'utf-8');
    }

    const { execSync } = require('child_process');
    let archiveCreated = false;

    // Method 1: PowerShell Compress-Archive (use .zip extension, then rename to .skill)
    if (process.platform === 'win32') {
      try {
        console.log('  Using PowerShell Compress-Archive...');
        execSync(
          `powershell -NoProfile -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${zipPath}' -Force"`,
          { stdio: 'pipe', timeout: 120000 }
        );
        if (fs.existsSync(zipPath)) {
          fs.renameSync(zipPath, outputPath);
          archiveCreated = true;
          console.log('  ✓ Archive created via PowerShell');
        }
      } catch (e) {
        console.log(`  ⚠ PowerShell failed: ${e.message}`);
      }
    }

    // Method 2: Try 7z
    if (!archiveCreated) {
      try {
        console.log('  Trying 7z...');
        execSync(`7z a -tzip "${zipPath}" "${tmpDir}\\*"`, { stdio: 'pipe', timeout: 120000 });
        if (fs.existsSync(zipPath)) {
          fs.renameSync(zipPath, outputPath);
          archiveCreated = true;
          console.log('  ✓ Archive created via 7z');
        }
      } catch {}
    }

    // Method 3: Try zip command
    if (!archiveCreated) {
      try {
        console.log('  Trying zip...');
        execSync(`cd "${tmpDir}" && zip -r "${zipPath}" .`, { stdio: 'pipe', timeout: 120000 });
        if (fs.existsSync(zipPath)) {
          fs.renameSync(zipPath, outputPath);
          archiveCreated = true;
          console.log('  ✓ Archive created via zip');
        }
      } catch {}
    }

    // Method 4: Try tar + rename
    if (!archiveCreated) {
      try {
        console.log('  Trying tar...');
        execSync(`cd "${tmpDir}" && tar -czf "${zipPath}" .`, { stdio: 'pipe', timeout: 120000 });
        if (fs.existsSync(zipPath)) {
          fs.renameSync(zipPath, outputPath);
          archiveCreated = true;
          console.log('  ✓ Archive created via tar');
        }
      } catch {}
    }

    // Cleanup temp
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

    if (!archiveCreated) {
      throw new Error('Could not create archive. Install zip/7z or use PowerShell.');
    }

    // Verify
    const stat = fs.statSync(outputPath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

    console.log();
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║             ✅ Package Created!                  ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log();
    console.log(`  📁 ${outputFileName}`);
    console.log(`  📏 ${sizeMB} MB`);
    console.log(`  📍 ${outputPath}`);
    console.log();
    console.log('  Compatible with:');
    console.log('    • TRAE       → .trae/skills/');
    console.log('    • Cursor     → .cursor/rules/');
    console.log('    • Claude Code → .claude/skills/');
    console.log('    • CODEX      → .cursor/rules/');
    console.log('    • Windsurf   → .windsurf/rules/');
    console.log();
    console.log('  Quick install:');
    console.log(`    node "${outputPath.replace(/\\/g, '/')}"`);
    console.log();

  } catch (err) {
    console.error(`\n❌ Package creation failed: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// Generate cross-IDE install script (embedded in package)
// ============================================================================

function generateInstallScript(skills) {
  return `#!/usr/bin/env node
/**
 * HOS-Sec-Engine Skill Installer
 *
 * Usage:
 *   node install.js                          # Interactive
 *   node install.js --target trae            # Install to Trae
 *   node install.js --target cursor          # Install to Cursor
 *   node install.js --target claude-code     # Install to Claude Code
 *   node install.js --target all             # Install to all detected IDEs
 *   node install.js --target trae --global   # Global install
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS = ${JSON.stringify(skills.map(s => ({ id: s.id, name: s.name })), null, 2)};

function getTargetDir(target, isGlobal) {
  const home = os.homedir();
  const cwd = process.cwd();
  const dirs = {
    trae: isGlobal
      ? path.join(home, '.trae-cn', 'skills')
      : path.join(cwd, '.trae', 'skills'),
    cursor: isGlobal
      ? path.join(home, '.cursor', 'rules')
      : path.join(cwd, '.cursor', 'rules'),
    'claude-code': isGlobal
      ? path.join(home, '.claude', 'skills')
      : path.join(cwd, '.claude', 'skills'),
    codex: isGlobal
      ? path.join(home, '.cursor', 'rules')
      : path.join(cwd, '.cursor', 'rules'),
    windsurf: isGlobal
      ? path.join(home, '.windsurf', 'rules')
      : path.join(cwd, '.windsurf', 'rules'),
  };
  return dirs[target] || dirs.trae;
}

function installTo(srcDir, targetDir, format) {
  if (!fs.existsSync(srcDir)) {
    console.error(\`  ⚠ Source not found: \${srcDir}\`);
    return 0;
  }

  fs.mkdirSync(targetDir, { recursive: true });
  let count = 0;

  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    if (!fs.statSync(srcPath).isDirectory()) continue;

    if (format === 'cursor' || format === 'codex' || format === 'windsurf') {
      // Copy .mdc files to target
      const mdcFiles = fs.readdirSync(srcPath).filter(f => f.endsWith('.mdc'));
      for (const mdc of mdcFiles) {
        const dest = path.join(targetDir, mdc);
        fs.copyFileSync(path.join(srcPath, mdc), dest);
        count++;
      }
    } else {
      // Copy full skill directory (SKILL.md + sub-skills)
      const dest = path.join(targetDir, entry);
      copyRecursive(srcPath, dest);
      count++;
    }
  }

  return count;
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opt = { target: null, global: false, help: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target': opt.target = args[++i]; break;
      case '--global': case '-g': opt.global = true; break;
      case '--help': case '-h': opt.help = true; break;
    }
  }
  return opt;
}

function printHelp() {
  console.log(\`
HOS-Sec-Engine Skill Installer v${PACKAGE_VERSION}

Usage:
  node install.js [options]

Options:
  --target <name>   Install target: trae, cursor, claude-code, codex, windsurf, all
  --global, -g      Install globally (available to all projects)
  --help, -h        Show this help

Examples:
  node install.js --target trae
  node install.js --target cursor --global
  node install.js --target all
\`);
}

function main() {
  const opt = parseArgs();

  if (opt.help) {
    printHelp();
    return;
  }

  const pkgDir = __dirname;
  const targets = opt.target === 'all'
    ? ['trae', 'cursor', 'claude-code', 'codex', 'windsurf']
    : [opt.target || 'trae'];

  console.log('╔════════════════════════════════════════════╗');
  console.log('║     HOS-Sec-Engine Skill Installer        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log();

  let totalInstalled = 0;

  for (const target of targets) {
    const targetDir = getTargetDir(target, opt.global);
    const isRulesTarget = ['cursor', 'codex', 'windsurf'].includes(target);

    // Source directory within the package
    const srcDir = isRulesTarget
      ? path.join(pkgDir, 'cursor-rules')
      : path.join(pkgDir, 'skills');

    console.log(\`📦 Installing to \${target}: \${targetDir}\`);

    if (!fs.existsSync(srcDir)) {
      console.log(\`  ⚠ Source directory not found: \${srcDir}\`);
      continue;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    let count = 0;

    if (isRulesTarget) {
      // For Cursor/CODEX/Windsurf: copy .mdc files directly
      const files = fs.readdirSync(srcDir);
      for (const file of files) {
        if (file.endsWith('.mdc')) {
          fs.copyFileSync(path.join(srcDir, file), path.join(targetDir, file));
          count++;
        }
      }
    } else {
      // For TRAE/Claude Code: copy skill directories
      const entries = fs.readdirSync(srcDir);
      for (const entry of entries) {
        const srcPath = path.join(srcDir, entry);
        if (fs.statSync(srcPath).isDirectory()) {
          copyRecursive(srcPath, path.join(targetDir, entry));
          count++;
        }
      }
    }

    console.log(\`  ✅ Installed \${count} skills to \${targetDir}\`);
    totalInstalled += count;
  }

  console.log();
  console.log(\`✅ Total: \${totalInstalled} skills installed\`);
  console.log('🎯 Restart your IDE to activate the skills');
}

main();
`;
}

// ============================================================================
// Main
// ============================================================================

buildPackage();
