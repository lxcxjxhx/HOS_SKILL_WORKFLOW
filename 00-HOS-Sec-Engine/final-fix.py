#!/usr/bin/env python3
"""Fix all corrupted strings in skills/ files"""

import re
import os
import sys

files = [
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

def count_quotes(line, quote_char="'"):
    """Count unescaped quotes in line."""
    count = 0
    escaped = False
    for ch in line:
        if ch == '\\' and not escaped:
            escaped = True
            continue
        if ch == quote_char and not escaped:
            count += 1
        escaped = False
    return count

def fix_line(line):
    """Fix a single line with potential string termination issues."""
    # Fix replacement characters
    if '\ufffd' in line:
        # Remove replacement char and everything after it until closing quote
        line = re.sub(r'\ufffd[^\'"]*\'', "'", line)
        line = re.sub(r'\ufffd[^\'"]*$', '', line)
    
    # Fix lines ending with ?,, or similar before quote
    line = re.sub(r'\?,,+\'', "'", line)
    line = re.sub(r'\?+,\?+', '?', line)
    
    # Count single quotes
    sq_count = count_quotes(line)
    
    if sq_count % 2 == 1:
        # Odd number of single quotes = unterminated string
        stripped = line.rstrip()
        
        if stripped.endswith('+'):
            # String concat: close quote before +
            before = stripped[:-1].rstrip()
            line = before + "'+"
        elif stripped.endswith(','):
            # End with comma: close quote before comma
            before = stripped[:-1].rstrip()
            line = before + "',"
        else:
            # Just add closing quote
            line = stripped + "'"
    
    return line

total_fixes = 0
for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8', errors='replace') as fh:
        lines = fh.readlines()
    
    new_lines = []
    changed = False
    for i, line in enumerate(lines):
        new_line = fix_line(line)
        if new_line != line:
            changed = True
            total_fixes += 1
        new_lines.append(new_line)
    
    if changed:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.writelines(new_lines)
        print(f"FIXED {f} ({total_fixes} lines fixed so far)")
    else:
        print(f"OK {f}")

print(f"\nTotal lines fixed: {total_fixes}")
