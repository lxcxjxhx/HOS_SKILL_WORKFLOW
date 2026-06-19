const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, results = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, pattern, results);
    } else if (item.match(pattern)) {
      results.push(fullPath);
    }
  }
  return results;
}

const baseDir = __dirname;
const skillsDir = path.join(baseDir, 'skills');
const files = findFiles(skillsDir, /^index\.ts$/);

files.forEach(filePath => {
  const relPath = path.relative(skillsDir, filePath);
  const parts = relPath.split(path.sep);
  const depth = parts.length - 1;
  
  // Calculate correct import path
  const prefix = '../'.repeat(depth);
  const correctImport = `${prefix}../src/types/skill`;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and replace the import
  const importRegex = /from\s+'[^']*types\/skill'/;
  const match = content.match(importRegex);
  
  if (match) {
    const oldImport = match[0];
    const newImport = `from '${correctImport}'`;
    
    if (oldImport !== newImport) {
      content = content.replace(oldImport, newImport);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`FIXED: ${relPath}`);
      console.log(`  ${oldImport} -> ${newImport}`);
    } else {
      console.log(`OK: ${relPath}`);
    }
  } else {
    console.log(`NO IMPORT: ${relPath}`);
  }
});
