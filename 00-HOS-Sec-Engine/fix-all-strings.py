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
    
    # Fix replacement characters and anything after them until closing quote
    content = re.sub(r'\ufffd[^\'"]*\'', "'", content)
    content = re.sub(r'\ufffd[^\'"]*$', '', content)
    content = re.sub(r'\ufffd', '', content)
    
    # Fix malformed strings
    content = re.sub(r'\?,,+\'', "'", content)
    content = re.sub(r'\?+,\?+', '?', content)
    
    # Process line by line to fix unterminated strings
    lines = content.split('\n')
    fixed_lines = []
    in_multiline_string = False
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip empty lines, comments
        if not stripped or stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            fixed_lines.append(line)
            continue
        
        # Track if we're inside a multiline string
        # Count quotes excluding escaped ones
        i = 0
        line_has_unterminated = False
        fixed_line = ''
        prev_char = ''
        
        while i < len(line):
            char = line[i]
            next_char = line[i+1] if i+1 < len(line) else ''
            
            # Skip escaped quotes
            if prev_char == '\\' and char in ["'", '"']:
                fixed_line += char
                prev_char = char
                i += 1
                continue
            
            # Track string state
            if char == "'" and not in_multiline_string:
                # Start of string
                in_multiline_string = True
                fixed_line += char
            elif char == "'" and in_multiline_string:
                # End of string
                in_multiline_string = False
                fixed_line += char
            else:
                fixed_line += char
            
            prev_char = char
            i += 1
        
        # If line ends with unterminated string, close it
        if in_multiline_string:
            fixed_line = fixed_line.rstrip()
            if fixed_line.endswith('+'):
                # This is a multiline string concatenation
                # Close the current string, but keep the +
                fixed_line = fixed_line[:-1].rstrip() + "'" + '+'
            elif fixed_line.endswith(','):
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
