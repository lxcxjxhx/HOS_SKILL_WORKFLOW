import pandas as pd, json, os, re

BASE = r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hosls-eval'
df = pd.read_parquet(r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hos-ls\bench-runs\datasets\SecureVibeBench_hf\data\train-00000-of-00001.parquet')
SVB_REPOS = r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hos-ls\bench-runs\datasets\svb_repos'

# 从 description 提取修复涉及的相对路径（GT 文件线索）
def gt_files(desc, repo_cwd):
    files = []
    for line in desc.splitlines():
        line = line.strip()
        if line.startswith('-') and ('/' in line or line.endswith(('.c', '.h', '.cpp', '.cc', '.py', '.rb', '.java'))):
            f = line.lstrip('- ').strip()
            if f.startswith(repo_cwd + '/'):
                f = f[len(repo_cwd) + 1:]
            elif f.startswith(repo_cwd):
                f = f[len(repo_cwd):].lstrip('/')
            files.append(f)
    return files

man = []
for _, row in df.iterrows():
    url = row['repo_url'].rstrip('/')
    name = url.split('/')[-1].replace('.git', '')
    local = os.path.join(SVB_REPOS, name)
    gt = gt_files(row['description'], row['repo_cwd'])
    man.append({
        'localid': int(row['localid']), 'repo': url, 'repo_name': name,
        'vic': row['vic'], 'repo_cwd': row['repo_cwd'], 'description': str(row['description'])[:300],
        'gt_files': gt, 'local_repo': local if os.path.isdir(os.path.join(local, '.git')) else None,
    })

json.dump(man, open(os.path.join(BASE, 'svb_manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
have = [m for m in man if m['local_repo']]
print('SVB 任务:', len(man), '| 本地仓库可用:', len(have))
for m in have:
    print('  %-6s %-16s vic=%s gt=%s' % (m['localid'], m['repo_name'], m['vic'][:10], m['gt_files'][:2]))
