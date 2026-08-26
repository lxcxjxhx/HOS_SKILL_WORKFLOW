# 构建 A.S.E 120 全量 manifest：从 AICGSecEval_hf/static_eval.jsonl 提取，
# 为每个实例生成代码文件（真实仓库用 base_commit 完整文件；变异仓库用 context/vuln 摘录）
import json, os, re, sys, time

BASE = r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hosls-eval'
DATA = r'C:\1AAA-PROJECT\BOS\BOS-GIT\HOS-LS-paper\bench-runs\hos-ls\bench-runs\datasets\AICGSecEval_hf\data\static_eval.jsonl'
OUT = os.path.join(BASE, 'ase120_samples')
GITHUB_TOKEN = os.environ.get('HOSLS_GITHUB_TOKEN', '')  # 勿硬编码；环境变量注入

EXT = {'php': '.php', 'python': '.py', 'javascript': '.js', 'typescript': '.ts', 'java': '.java', 'go': '.go'}

def fetch_full(repo, path, commit):
    import requests, urllib3
    urllib3.disable_warnings()
    r = requests.get(f'https://api.github.com/repos/{repo}/contents/{path}',
                     params={'ref': commit},
                     headers={'Authorization': f'Bearer {GITHUB_TOKEN}',
                              'Accept': 'application/vnd.github.raw',
                              'User-Agent': 'hos-ls-eval'},
                     verify=False, timeout=90)
    return r.text if r.status_code == 200 else None

def main():
    os.makedirs(OUT, exist_ok=True)
    rows = [json.loads(l) for l in open(DATA, encoding='utf-8')]
    manifest = []
    n_fetch_ok = n_fetch_fail = 0
    for i, x in enumerate(rows):
        iid = x['instance_id']
        ext = EXT.get(x.get('language', 'php'), '.php')
        repo, path, commit = x.get('repo', ''), x.get('vuln_file', ''), x.get('base_commit', '')
        code, src = None, ''
        if repo and path and commit:
            full = fetch_full(repo, path, commit)
            if full and len(full) > 200:
                code, src = full, 'full@commit'
                n_fetch_ok += 1
            else:
                n_fetch_fail += 1
        if code is None:
            # 变异仓库/拉取失败：用 BM25 context 中命中 docid 的片段不可得 → 标注 skip
            code, src = '', 'unavailable'
        code = code.strip()
        fp = os.path.join(OUT, iid + ext)
        if code:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(code)
        manifest.append({
            'instance_id': iid, 'repo': repo, 'vuln_file': path, 'vuln_lines': x.get('vuln_lines', []),
            'language': x.get('language', 'php'), 'vuln_type': x.get('vuln_type', ''),
            'cwe_id': x.get('cwe_id', ''), 'vuln_source': x.get('vuln_source', ''),
            'base_commit': commit, 'source': src, 'code_file': iid + ext if code else None,
            'lines': code.count('\n') + 1 if code else 0,
            'context_docs': [h.get('docid') for h in x.get('context', {}).get('hits', [])],
        })
        if (i + 1) % 20 == 0:
            print(f'  {i+1}/{len(rows)} fetch_ok={n_fetch_ok} fail={n_fetch_fail}', flush=True)
        time.sleep(0.15)  # GitHub API 限速保护
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    ok_files = sum(1 for m in manifest if m['code_file'])
    print(f'[ase120] {len(manifest)} 实例, {ok_files} 有代码文件, fetch_ok={n_fetch_ok} fail={n_fetch_fail}')

if __name__ == '__main__':
    main()
