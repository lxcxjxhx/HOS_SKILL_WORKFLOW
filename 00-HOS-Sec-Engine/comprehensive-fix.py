#!/usr/bin/env python3
"""
Comprehensive fix script for corrupted TypeScript files in skills/
Handles: 
1. JS artifacts (exports.xxx = void 0)
2. UTF-8 replacement characters (U+FFFD)
3. Malformed strings ending with ?,,, or similar
4. Unterminated string literals
5. Broken Chinese characters replaced with ?
"""

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

def fix_terminations(content):
    """Fix unterminated string literals by analyzing line by line."""
    lines = content.split('\n')
    result = []
    
    for i, line in enumerate(lines):
        # Skip empty/comment lines
        stripped = line.strip()
        if not stripped or stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            result.append(line)
            continue
            
        # Count single quotes in the line (not escaped)
        # Need to handle multi-line strings properly
        quote_count = 0
        escaped = False
        for char in line:
            if char == '\\' and not escaped:
                escaped = True
                continue
            if char == "'" and not escaped:
                quote_count += 1
            escaped = False
        
        # If odd number of single quotes, string is not terminated
        if quote_count % 2 == 1:
            # Find where to add the closing quote
            # Usually at the end of the line, before trailing whitespace
            # But need to handle lines ending with + (concatenation)
            stripped_right = line.rstrip()
            
            if stripped_right.endswith('+'):
                # String concatenation: close before the +
                before_plus = stripped_right[:-1].rstrip()
                if before_plus.endswith("'"):
                    # Already ends with quote, shouldn't happen if count is odd
                    line = stripped_right
                else:
                    line = before_plus + "'" + '+'
            elif stripped_right.endswith(','):
                # End with comma: close before comma
                before_comma = stripped_right[:-1].rstrip()
                line = before_comma + "',"
            elif stripped_right.endswith('"'):
                # This is a double-quoted string on same line
                # The single quote must be part of content, not string delimiter
                line = stripped_right + "'"
            else:
                # Just add closing quote at end
                line = stripped_right + "'"
        
        result.append(line)
    
    return '\n'.join(result)


def fix_content(content):
    """Main fix function."""
    # 1. Remove JS artifacts
    content = re.sub(r'exports\.\w+\s*=\s*void\s+0;\s*\n?', '', content)
    content = re.sub(r'exports\.(\w+)\s*=\s*\[', r'export const \1: AttackDefenseSkill[] = [', content)
    
    # 2. Fix UTF-8 replacement characters and everything after them until quote
    content = re.sub(r'\ufffd[^\'"]*\'', "'", content)
    content = re.sub(r'\ufffd[^\'"]*$', '', content)
    content = re.sub(r'\ufffd', '', content)
    
    # 3. Fix malformed strings with ?,,, patterns
    content = re.sub(r'\?,,+\'', "'", content)
    content = re.sub(r'\?+,\?+', '?', content)
    
    # 4. Fix unterminated strings
    content = fix_terminations(content)
    
    # 5. Clean up extra blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content

fixed_count = 0
error_count = 0

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
        error_count += 1

print(f"\nDone: {fixed_count} files fixed, {error_count} errors")
