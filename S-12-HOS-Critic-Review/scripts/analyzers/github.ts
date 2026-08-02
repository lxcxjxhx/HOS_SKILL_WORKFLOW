/**
 * GitHub Analyzer：拉取仓库公开数据并计算生态/健康指标。
 * 对应 docs/05 §5.3。零依赖（Node 内建 fetch）。未认证限流 60 req/h。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const API = 'https://api.github.com';
const UA = 'hos-critic-review';

export interface GitHubRaw {
  repo: Record<string, unknown>;
  issues: Array<Record<string, unknown>>;
  pulls: Array<Record<string, unknown>>;
  contributors: Array<Record<string, unknown>>;
  releases: Array<Record<string, unknown>>;
}

export interface GitHubMetrics {
  days_since_push: number;
  days_since_created: number;
  stars: number;
  forks: number;
  open_issues: number;
  archived: boolean;
  issue_health: number;            // open_issues / stars（千分比），>0.05 预警
  pr_merge_median_hours: number | null;
  bus_factor_pct: number | null;   // 前 3 贡献者提交占比
  release_pace: number | null;     // releases/年（近 3 年），null 表示无 release
  star_per_year: number;
}

export interface GitHubData {
  owner: string;
  repo: string;
  fetched_at: string;
  url: string;
  license: string | null;
  description: string | null;
  metrics: GitHubMetrics;
}

async function gh(path: string): Promise<Record<string, unknown> | Array<Record<string, unknown>>> {
  const res = await fetch(`${API}${path}`, { headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json() as never;
}

function medianHours(dates: Array<{ created_at: string; merged_at: string | null }>): number | null {
  const hours = dates
    .filter(d => d.merged_at)
    .map(d => (Date.parse(d.merged_at) - Date.parse(d.created_at)) / 3_600_000)
    .sort((a, b) => a - b);
  if (hours.length === 0) return null;
  const mid = Math.floor(hours.length / 2);
  return hours.length % 2 ? hours[mid] : (hours[mid - 1] + hours[mid]) / 2;
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubData> {
  const r = await gh(`/repos/${owner}/${repo}`) as Record<string, unknown>;
  const [issues, pulls, contributors, releases] = await Promise.all([
    gh(`/repos/${owner}/${repo}/issues?state=open&per_page=30`) as Promise<Array<Record<string, unknown>>>,
    gh(`/repos/${owner}/${repo}/pulls?state=closed&per_page=30`) as Promise<Array<Record<string, unknown>>>,
    gh(`/repos/${owner}/${repo}/contributors?per_page=100`) as Promise<Array<Record<string, unknown>>>,
    gh(`/repos/${owner}/${repo}/releases?per_page=5`) as Promise<Array<Record<string, unknown>>>,
  ]);

  const pushedAt = new Date(r.pushed_at as string).getTime();
  const createdAt = new Date(r.created_at as string).getTime();
  const now = Date.now();
  const years = Math.max(1, (now - createdAt) / (365.25 * 24 * 3600 * 1000));
  const stars = Number(r.stargazers_count ?? 0);

  const totalCommits = contributors.reduce((s: number, c) => s + Number((c as { contributions: number }).contributions ?? 0), 0);
  const top3 = totalCommits ? (contributors as Array<{ contributions: number }>)
    .slice(0, 3).reduce((s, c) => s + c.contributions, 0) / totalCommits * 100 : null;

  const releaseYears = releases
    .filter(rl => rl.published_at)
    .map(rl => new Date(rl.published_at as string).getFullYear())
    .filter(y => y >= new Date().getFullYear() - 2);
  const releasePace = releaseYears.length > 0 ? releases.filter(rl => rl.published_at).length / Math.max(1, Math.max(...releaseYears) - Math.min(...releaseYears) + 1) : null;

  const data: GitHubData = {
    owner, repo,
    fetched_at: new Date().toISOString(),
    url: `https://github.com/${owner}/${repo}`,
    license: (r.license as { spdx_id?: string } | null)?.spdx_id ?? null,
    description: (r.description as string | null) ?? null,
    metrics: {
      days_since_push: Math.round((now - pushedAt) / 86_400_000),
      days_since_created: Math.round((now - createdAt) / 86_400_000),
      stars,
      forks: Number(r.forks_count ?? 0),
      open_issues: Number(r.open_issues_count ?? 0),
      archived: Boolean(r.archived),
      issue_health: Math.round((Number(r.open_issues_count ?? 0) / Math.max(1, stars)) * 1000) / 1000,
      pr_merge_median_hours: medianHours(pulls as Array<{ created_at: string; merged_at: string | null }>),
      bus_factor_pct: top3 ? Math.round(top3) : null,
      release_pace: releasePace === null ? null : Math.round(releasePace * 10) / 10,
      star_per_year: Math.round(stars / years * 10) / 10,
    },
  };
  return data;
}

/** 指标 → 健康判定（对应 docs/05 §5.3.2） */
export function metricFindings(data: GitHubData): Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> {
  const m = data.metrics;
  const out: Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> = [];
  if (m.days_since_push > 365) out.push({ class: 'ECO', severity: 'HIGH', title: '仓库超过一年无提交', claim: '项目可能已停止维护', evidence_draft: `最近提交距今 ${m.days_since_push} 天` });
  else if (m.days_since_push > 90) out.push({ class: 'ECO', severity: 'MEDIUM', title: '仓库三个月无提交，活跃度存疑', claim: '维护活跃度下降', evidence_draft: `最近提交距今 ${m.days_since_push} 天` });
  if (m.archived) out.push({ class: 'ECO', severity: 'CRITICAL', title: '仓库已被归档（read-only）', claim: '官方已停止维护', evidence_draft: 'GitHub archived=true' });
  if (m.issue_health > 0.05) out.push({ class: 'ECO', severity: 'MEDIUM', title: 'Issue 相对 star 规模积压偏多', claim: '问题处理可能不及时', evidence_draft: `open issues ${m.open_issues} / stars ${m.stars} = ${Math.round(m.issue_health * 1000) / 10}‰（阈值 50‰）` });
  if (m.pr_merge_median_hours !== null && m.pr_merge_median_hours > 168) out.push({ class: 'ECO', severity: 'MEDIUM', title: 'PR 合并速度慢', claim: '协作效率低', evidence_draft: `中位合并时长 ${Math.round(m.pr_merge_median_hours)}h（>7 天）` });
  if (m.bus_factor_pct !== null && m.bus_factor_pct > 80) out.push({ class: 'ECO', severity: 'MEDIUM', title: 'Bus factor 风险：前 3 贡献者占比过高', claim: '维护集中在少数人，单点风险', evidence_draft: `前 3 贡献者 ${m.bus_factor_pct}%` });
  if (m.release_pace === null && m.days_since_created > 365) out.push({ class: 'ECO', severity: 'LOW', title: '无 release 发布记录', claim: '版本管理缺失', evidence_draft: 'releases 为空' });
  return out;
}

export async function saveGitHubData(data: GitHubData, outFile: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
