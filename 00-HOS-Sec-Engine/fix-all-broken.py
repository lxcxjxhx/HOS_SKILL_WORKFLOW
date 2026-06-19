#!/usr/bin/env python3
import re, os

files = [
    'skills/api/jwt/jwt-attacks.ts',
    'skills/api/oauth/oauth-attacks.ts',
    'skills/web/deserialization/deserialization-exploit.ts',
    'skills/web/rce/command-injection.ts',
    'skills/web/upload/upload-bypass.ts',
    'skills/web/xxe/xxe-injection.ts',
]

base = os.path.dirname(os.path.abspath(__file__))

def count_q(line, q):
    c, e = 0, False
    for ch in line:
        if ch == '\\' and not e: e = True; continue
        if ch == q and not e: c += 1
        e = False
    return c

fixed = 0
for f in files:
    p = os.path.join(base, f)
    if not os.path.exists(p): continue
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        lines = fh.readlines()
    
    new = []
    changed = False
    for line in lines:
        # Fix replacement chars
        if '\ufffd' in line:
            line = re.sub(r'\ufffd[^\'"]*\'', "'", line)
            line = re.sub(r'\ufffd[^\'"]*$', '', line)
        
        # Fix single quote balance
        sq = count_q(line, "'")
        if sq % 2 == 1:
            s = line.rstrip()
            if s.endswith('+'):
                b = s[:-1].rstrip()
                if not b.endswith("'"):
                    line = b + "'+\n"
                    changed = True
            elif s.endswith(','):
                b = s[:-1].rstrip()
                if not b.endswith("'"):
                    line = b + "',\n"
                    changed = True
            elif not s.endswith("'"):
                line = s + "'\n"
                changed = True
        
        # Fix double quote balance
        dq = count_q(line, '"')
        if dq % 2 == 1:
            s = line.rstrip()
            if s.endswith('+'):
                b = s[:-1].rstrip()
                if not b.endswith('"'):
                    line = b + '"+' + '\n'
                    changed = True
            elif s.endswith(','):
                b = s[:-1].rstrip()
                if not b.endswith('"'):
                    line = b + '",\n'
                    changed = True
            elif not s.endswith('"'):
                line = s + '"\n'
                changed = True
        
        new.append(line)
    
    if changed:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.writelines(new)
        print(f"FIXED {f}")
        fixed += 1
    else:
        print(f"OK {f}")

print(f"\nFixed {fixed} files")
