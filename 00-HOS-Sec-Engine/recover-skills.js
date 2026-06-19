const fs = require('fs');
const path = require('path');

// List of corrupted files to recover with CORRECT export names
const filesToRecover = [
  { ts: 'skills/api/jwt/jwt-attacks.ts', js: 'dist/skills/api/jwt/jwt-attacks.js', exportName: 'jwtAttackSkills' },
  { ts: 'skills/api/oauth/oauth-attacks.ts', js: 'dist/skills/api/oauth/oauth-attacks.js', exportName: 'oauthAttackSkills' },
  { ts: 'skills/cloud/metadata/cloud-ssrf.ts', js: 'dist/skills/cloud/metadata/cloud-ssrf.js', exportName: 'cloudMetadataSSRFSkills' },
  { ts: 'skills/code-review/java-deser/java-deser-skill.ts', js: 'dist/skills/code-review/java-deser/java-deser-skill.js', exportName: 'javaDeserSkills' },
  { ts: 'skills/container/docker-escape/docker-escape-skill.ts', js: 'dist/skills/container/docker-escape/docker-escape-skill.js', exportName: 'dockerEscapeSkills' },
  { ts: 'skills/kubernetes/k8s-misconfig/k8s-misconfig-skill.ts', js: 'dist/skills/kubernetes/k8s-misconfig/k8s-misconfig-skill.js', exportName: 'k8sMisconfigSkills' },
  { ts: 'skills/linux/linux-privilege-escalation/linux-priv-esc-skill.ts', js: 'dist/skills/linux/linux-privilege-escalation/linux-priv-esc-skill.js', exportName: 'linuxPrivEscSkills' },
  { ts: 'skills/mobile/android-apk/android-apk-skill.ts', js: 'dist/skills/mobile/android-apk/android-apk-skill.js', exportName: 'androidApkSkills' },
  { ts: 'skills/ad/domain-enumeration/domain-enum-skill.ts', js: 'dist/skills/ad/domain-enumeration/domain-enum-skill.js', exportName: 'domainEnumSkills' },
  { ts: 'skills/ai-security/prompt-injection/prompt-injection-skill.ts', js: 'dist/skills/ai-security/prompt-injection/prompt-injection-skill.js', exportName: 'promptInjectionSkills' },
  { ts: 'skills/windows/windows-privilege-escalation/windows-priv-esc-skill.ts', js: 'dist/skills/windows/windows-privilege-escalation/windows-priv-esc-skill.js', exportName: 'windowsPrivEscSkills' },
  { ts: 'skills/api/idor/idor-detection.ts', js: 'dist/skills/api/idor/idor-detection.js', exportName: 'idorDetectionSkills' },
  { ts: 'skills/api/rate-limit/rate-limit-bypass.ts', js: 'dist/skills/api/rate-limit/rate-limit-bypass.js', exportName: 'rateLimitBypassSkills' },
  { ts: 'skills/cloud/iam/iam-privilege-escalation.ts', js: 'dist/skills/cloud/iam/iam-privilege-escalation.js', exportName: 'iamPrivilegeEscalationSkills' },
  { ts: 'skills/cloud/s3/s3-misconfig.ts', js: 'dist/skills/cloud/s3/s3-misconfig.js', exportName: 's3MisconfigSkills' },
  { ts: 'skills/web/deserialization/deserialization-exploit.ts', js: 'dist/skills/web/deserialization/deserialization-exploit.js', exportName: 'deserializationExploitSkills' },
  { ts: 'skills/web/rce/command-injection.ts', js: 'dist/skills/web/rce/command-injection.js', exportName: 'commandInjectionSkills' },
  { ts: 'skills/web/ssrf/ssrf-detection.ts', js: 'dist/skills/web/ssrf/ssrf-detection.js', exportName: 'ssrfDetectionSkills' },
  { ts: 'skills/web/upload/upload-bypass.ts', js: 'dist/skills/web/upload/upload-bypass.js', exportName: 'uploadBypassSkills' },
  { ts: 'skills/web/xxe/xxe-injection.ts', js: 'dist/skills/web/xxe/xxe-injection.js', exportName: 'xxeInjectionSkills' },
];

const baseDir = __dirname;

// Calculate import path based on file depth
function getImportPath(tsFile) {
  const depth = tsFile.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  return `${prefix}src/types/skill`;
}

// Get header comment from JS file
function getHeaderComment(jsContent) {
  const match = jsContent.match(/\/\*\*[\s\S]*?\*\//);
  return match ? match[0] : '';
}

// Extract the exported content from JS - improved version
function extractExportedContent(jsContent, exportName) {
  // Find the start of the export assignment
  const startRegex = new RegExp(`exports\\.${exportName}\\s*=\\s*`);
  const startIndex = jsContent.search(startRegex);
  if (startIndex === -1) {
    console.log(`  DEBUG: Could not find exports.${exportName} in file`);
    return null;
  }
  
  // Get everything after the assignment
  const afterExport = jsContent.substring(startIndex + `exports.${exportName} = `.length);
  
  // Find the end marker (sourceMappingURL or end of file)
  const endMarker = '//# sourceMappingURL';
  let endIndex = afterExport.indexOf(endMarker);
  if (endIndex === -1) {
    endIndex = afterExport.length;
  }
  
  let content = afterExport.substring(0, endIndex).trim();
  
  // Remove trailing semicolon and newline
  content = content.replace(/;[\s\n]*$/, '');
  
  return content;
}

filesToRecover.forEach(({ ts, js, exportName }) => {
  const tsPath = path.join(baseDir, ts);
  const jsPath = path.join(baseDir, js);
  
  if (!fs.existsSync(jsPath)) {
    console.log(`SKIP: ${js} not found`);
    return;
  }
  
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  const header = getHeaderComment(jsContent);
  const importPath = getImportPath(ts);
  
  // Extract the exported value
  const content = extractExportedContent(jsContent, exportName);
  
  if (!content) {
    console.log(`ERROR: Could not extract export for ${exportName} from ${js}`);
    return;
  }
  
  // Build TypeScript file content
  const tsContent = `${header}

import { AttackDefenseSkill } from '${importPath}';

export const ${exportName}: AttackDefenseSkill[] = ${content};
`;
  
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`RECOVERED: ${ts} (export: ${exportName})`);
});

console.log('\nRecovery complete.');
