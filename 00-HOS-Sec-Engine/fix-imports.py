#!/usr/bin/env python3
"""Fix import paths in skills/ index.ts files"""
import os

base = os.path.dirname(os.path.abspath(__file__))

def get_correct_import(file_path):
    """Calculate correct import path to src/types/skill"""
    # file_path is relative to skills/ directory
    parts = file_path.split('/')
    # Remove the filename
    depth = len(parts) - 1
    
    # From skills/, we need to go up depth+1 times to get to root, then into src
    prefix = '../' * (depth + 1)
    return prefix + 'src/types/skill'

# Find all index.ts files in skills/
import glob
index_files = glob.glob(os.path.join(base, 'skills', '**', 'index.ts'), recursive=True)

for index_file in index_files:
    rel_path = os.path.relpath(index_file, os.path.join(base, 'skills'))
    
    # Calculate correct import
    parts = rel_path.replace('\\', '/').split('/')
    depth = len(parts) - 1  # depth from skills/ directory
    
    # From skills/subdir/index.ts, go up (depth) times to reach skills/, 
    # then one more time to reach root, then into src/types/skill
    correct_import = '../' * depth + '../src/types/skill'
    
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the import
    import re
    old_import = re.search(r"from\s+'[^']*types/skill'", content)
    if old_import:
        old_str = old_import.group()
        new_str = f"from '{correct_import}'"
        
        if old_str != new_str:
            content = content.replace(old_str, new_str)
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"FIXED: {rel_path}")
            print(f"  {old_str} -> {new_str}")
        else:
            print(f"OK: {rel_path}")
    else:
        print(f"NO IMPORT FOUND: {rel_path}")
