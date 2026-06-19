#!/usr/bin/env python3
"""Comprehensive fix for ALL unterminated strings in skills files"""
import re
import os

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

def count_unescaped_quotes(line, q="'"):
    c = 0
    esc = False
    for ch in line:
        if ch == '\\' and not esc:
            esc = True
            continue
        if ch == q and not esc:
            c += 1
        esc = False
    return c

total_fixed = 0
for f in files:
    p = os.path.join(base_dir, f)
    if not os.path.exists(p):
        continue
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        content = fh.read()
    original = content
    
    # Fix 1: Replace replacement chars
    content = re.sub(r'\ufffd[^\'"]*\'', "'", content)
    content = re.sub(r'\ufffd[^\'"]*$', '', content)
    content = re.sub(r'\ufffd', '', content)
    
    # Fix 2: Fix ?,,, patterns
    content = re.sub(r'\?,,+\'', "'", content)
    
    # Fix 3: Process line by line for quote balancing
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.rstrip()
        
        # Count single quotes
        sq = count_unescaped_quotes(line)
        
        if sq % 2 == 1:
            # Unterminated single-quote string
            if stripped.endswith('+'):
                before = stripped[:-1].rstrip()
                if not before.endswith("'"):
                    line = before + "'+"
            elif stripped.endswith(','):
                before = stripped[:-1].rstrip()
                if not before.endswith("'"):
                    line = before + "',"
            elif not stripped.endswith("'"):
                line = stripped + "'"
        
        # Count double quotes
        dq = count_unescaped_quotes(line, '"')
        if dq % 2 == 1:
            if stripped.endswith('+'):
                before = stripped[:-1].rstrip()
                if not before.endswith('"'):
                    line = before + '"+'
            elif stripped.endswith(','):
                before = stripped[:-1].rstrip()
                if not before.endswith('"'):
                    line = before + '",
            elif not stripped.endswith('"'):
                line = stripped + '"'
        
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Fix 4: Clean up
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f"FIXED: {f}")
        total_fixed += 1
    else:
        print(f"OK: {f}")

print(f"\nTotal files fixed: {total_fixed}")
