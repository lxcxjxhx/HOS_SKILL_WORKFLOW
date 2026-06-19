#!/usr/bin/env python3
"""Fix all unterminated strings in skills files"""
import re, os

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

base = os.path.dirname(os.path.abspath(__file__))

def count_quotes(line, q):
    count = 0
    escaped = False
    for ch in line:
        if ch == '\\' and not escaped:
            escaped = True
            continue
        if ch == q and not escaped:
            count += 1
        escaped = False
    return count

total_fixed = 0
for f in files:
    p = os.path.join(base, f)
    if not os.path.exists(p):
        continue
    
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        content = fh.read()
    original = content
    
    # Fix replacement characters (U+FFFD)
    content = re.sub(r'\ufffd[^\'"]*\'', "'", content)
    content = re.sub(r'\ufffd[^\'"]*$', '', content)
    content = re.sub(r'\ufffd', '', content)
    
    # Fix ?,,, patterns
    content = re.sub(r'\?,,+\'', "'", content)
    
    # Process line by line
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        s = line.rstrip()
        
        # Fix single quote balance
        sq = count_quotes(line, "'")
        if sq % 2 == 1:
            if s.endswith('+'):
                b = s[:-1].rstrip()
                if not b.endswith("'"):
                    s = b + "'" + '+'
            elif s.endswith(','):
                b = s[:-1].rstrip()
                if not b.endswith("'"):
                    s = b + "',"
            elif not s.endswith("'"):
                s = s + "'"
        
        # Fix double quote balance
        dq = count_quotes(line, '"')
        if dq % 2 == 1:
            if s.endswith('+'):
                b = s[:-1].rstrip()
                if not b.endswith('"'):
                    s = b + '"' + '+'
            elif s.endswith(','):
                b = s[:-1].rstrip()
                if not b.endswith('"'):
                    s = b + '",
            elif not s.endswith('"'):
                s = s + '"'
        
        new_lines.append(s)
    
    content = '\n'.join(new_lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f"FIXED {f}")
        total_fixed += 1
    else:
        print(f"OK {f}")

print(f"\nTotal fixed: {total_fixed}")
