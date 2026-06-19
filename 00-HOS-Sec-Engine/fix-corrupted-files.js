const fs = require('fs');
const path = require('path');

// Files to fix (all 20 corrupted files)
const filesToFix = [
  'skills/ad/domain-enumeration/domain-enum-skill.ts',
  'skills/ai-security/prompt-injection/prompt-injection-skill.ts',
  'skills/api/idor/idor-detection.ts',
  'skills/api/jwt/jwt-attacks.ts',
  'skills/api/oauth/oauth-attacks.ts',
  'skills/api/rate-limit/rate-limit-bypass.ts',
  'skills/cloud/iam/iam-privilege-escalation.ts',
  'skills/cloud/metadata/cloud-ssrf.ts',
  'skills/cloud/s3/s3-misconfig.ts',
  'skills/code-review/java-deser/java-deser-skill.ts',
  'skills/container/docker-escape/docker-escape-skill.ts',
  'skills/kubernetes/k8s-misconfig/k8s-misconfig-skill.ts',
  'skills/linux/linux-privilege-escalation/linux-priv-esc-skill.ts',
  'skills/mobile/android-apk/android-apk-skill.ts',
  'skills/web/deserialization/deserialization-exploit.ts',
  'skills/web/rce/command-injection.ts',
  'skills/web/ssrf/ssrf-detection.ts',
  'skills/web/upload/upload-bypass.ts',
  'skills/web/xxe/xxe-injection.ts',
  'skills/windows/windows-privilege-escalation/windows-priv-esc-skill.ts',
];

const baseDir = __dirname;

function fixContent(content) {
  // Remove JS artifacts: "exports.xxx = void 0;" lines  
  content = content.replace(/exports\.\w+\s*=\s*void\s+0;\s*\n?/g, '');
  
  // Fix the export line: change "exports.xxx = [" to "export const xxx: AttackDefenseSkill[] = ["
  content = content.replace(/exports\.(\w+)\s*=\s*\[/g, 'export const $1: AttackDefenseSkill[] = [');
  
  // Fix corrupted characters:  (U+FFFD) followed by any chars before closing quote
  // Pattern: ' followed by  and garbage until the closing '
  content = content.replace(/\ufffd[^']*/g, "'");
  
  // Also fix standalone replacement characters
  content = content.replace(/\ufffd/g, '');
  
  // Fix malformed strings that end with commas/quotes incorrectly
  // Pattern: text followed by ?,,, and closing quote
  content = content.replace(/\?,,+'/g, "'");
  content = content.replace(/\?,,\?/g, '?');
  content = content.replace(/\?\?/g, '?');
  
  // Fix strings that have invalid byte sequences - find and clean them
  // Look for strings that have non-string-terminating issues
  content = content.replace(/(\s+)'\s*,\s*\n/g, "$1'',\n");
  
  // Remove multiple consecutive empty lines (clean up)
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content;
}

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(baseDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${filePath} not found`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    content = fixContent(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`FIXED: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`NO CHANGES: ${filePath}`);
    }
  } catch (err) {
    console.log(`ERROR: ${filePath} - ${err.message}`);
    errorCount++;
  }
});

console.log(`\nDone: ${fixedCount} files fixed, ${errorCount} errors`);
