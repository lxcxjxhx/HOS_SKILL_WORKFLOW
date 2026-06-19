import re
import os

files_to_fix = [
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
]

base_dir = os.path.dirname(os.path.abspath(__file__))

def fix_content(content):
    # Remove JS artifacts
    content = re.sub(r'exports\.\w+\s*=\s*void\s+0;\s*\n?', '', content)
    content = re.sub(r'exports\.(\w+)\s*=\s*\[', r'export const \1: AttackDefenseSkill[] = [', content)
    
    # Fix strings with replacement character (U+FFFD) - remove them and anything after until closing quote
    content = re.sub(r'\ufffd[^\'"]*\'', "'", content)
    content = re.sub(r'\ufffd[^\'"]*$', '', content)
    content = re.sub(r'\ufffd', '', content)
    
    # Fix malformed strings ending with ?,,, or similar patterns
    content = re.sub(r'\?,,+\'', "'", content)
    content = re.sub(r'\?+,\?+', '?', content)
    
    # CRITICAL FIX: Fix unterminated single-quoted strings
    # Process line by line, looking for lines where single-quoted strings aren't properly closed
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Skip lines that are purely code (import, export, etc.)
        stripped = line.strip()
        if not stripped or stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            fixed_lines.append(line)
            continue
            
        # Count single quotes in the line (excluding escaped ones)
        # We need to handle the full line context
        in_string = False
        escaped = False
        fixed_line = ''
        i = 0
        while i < len(line):
            char = line[i]
            if escaped:
                fixed_line += char
                escaped = False
                i += 1
                continue
            
            if char == '\\':
                fixed_line += char
                escaped = True
                i += 1
                continue
            
            if char == "'":
                in_string = not in_string
                fixed_line += char
            elif char == '"' and not in_string:
                fixed_line += char
            else:
                fixed_line += char
            i += 1
        
        # If we end with an open string, close it
        if in_string:
            # Find where the string started and try to close it properly
            # Usually the string ends at end of meaningful content
            # Add closing quote before trailing whitespace/comma
            fixed_line = fixed_line.rstrip()
            if fixed_line.endswith(','):
                fixed_line = fixed_line[:-1] + "',"
            else:
                fixed_line += "'"
        
        fixed_lines.append(fixed_line)
    
    content = '\n'.join(fixed_lines)
    
    # Clean up extra blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content

fixed_count = 0
for file_path in files_to_fix:
    full_path = os.path.join(base_dir, file_path)
    if not os.path.exists(full_path):
        print(f"SKIP: {file_path} not found")
        continue
    
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        original = content
        content = fix_content(content)
        
        if content != original:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"FIXED: {file_path}")
            fixed_count += 1
        else:
            print(f"NO CHANGES: {file_path}")
    except Exception as e:
        print(f"ERROR: {file_path} - {e}")

print(f"\nDone: {fixed_count} files fixed")
