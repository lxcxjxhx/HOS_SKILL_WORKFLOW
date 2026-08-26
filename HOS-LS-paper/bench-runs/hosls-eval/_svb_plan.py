import pandas as pd, json, os

# SecureVibeBench 仓库克隆（首批：中小型 C/C++ 仓库）
REPOS_DIR = r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hos-ls\bench-runs\datasets\svb_repos'
os.makedirs(REPOS_DIR, exist_ok=True)
df = pd.read_parquet(r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hos-ls\bench-runs\datasets\SecureVibeBench_hf\data\train-00000-of-00001.parquet')

first_batch = [
    'https://github.com/lua/lua',
    'https://github.com/mruby/mruby',
    'https://github.com/libexif/libexif',
    'https://github.com/libimobiledevice/libplist',
    'https://github.com/mity/md4c',
    'https://github.com/richgel999/miniz.git',
    'https://github.com/open-source-parsers/jsoncpp',
    'https://github.com/kkos/oniguruma.git',
    'https://github.com/jqlang/jq',
    'https://github.com/cisco/libsrtp',
    'https://github.com/file/file.git',
    'https://github.com/lpereira/lwan.git',
    'https://github.com/LibreDWG/libredwg',
    'https://github.com/PCRE2Project/pcre2',
    'https://github.com/facebook/zstd',
]
tasks = df[df['repo_url'].isin(first_batch)]
print('首批任务数:', len(tasks), '仓库数:', tasks['repo_url'].nunique())
json.dump(first_batch, open(os.path.join(REPOS_DIR, 'clone_list.json'), 'w'), indent=1)
for u in sorted(tasks['repo_url'].unique()):
    n = (tasks['repo_url'] == u).sum()
    print('  %-52s %d tasks' % (u, n))
