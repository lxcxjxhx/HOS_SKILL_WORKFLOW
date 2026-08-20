import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricFindings } from '../../scripts/analyzers/github.ts';
import { paperFindings } from '../../scripts/analyzers/paper.ts';
import type { GitHubData, PaperData } from '../../scripts/analyzers/github.ts';

test('metricFindings：超一年无提交 + issue 积压 + bus factor 高 → 命中多条', () => {
  const data: GitHubData = {
    owner: 'a', repo: 'b', fetched_at: '', url: '', license: null, description: null,
    metrics: {
      days_since_push: 400, days_since_created: 8000, stars: 10, forks: 2,
      open_issues: 15, archived: false, issue_health: 0.6,
      pr_merge_median_hours: 200, bus_factor_pct: 90, release_pace: null, star_per_year: 0.5,
    },
  };
  const f = metricFindings(data);
  assert.ok(f.some(x => x.severity === 'HIGH' && x.class === 'ECO'), '超一年无提交应为 HIGH/ECO');
  assert.ok(f.some(x => x.class === 'ECO' && x.title.includes('Issue')), 'issue 积压');
  assert.ok(f.some(x => x.title.includes('Bus factor')), 'bus factor');
  assert.ok(f.some(x => x.title.includes('release')), '无 release');
});

test('metricFindings：归档仓库 → CRITICAL', () => {
  const data: GitHubData = {
    owner: 'a', repo: 'b', fetched_at: '', url: '', license: null, description: null,
    metrics: {
      days_since_push: 10, days_since_created: 1000, stars: 1, forks: 0,
      open_issues: 0, archived: true, issue_health: 0,
      pr_merge_median_hours: 1, bus_factor_pct: null, release_pace: 2, star_per_year: 0.1,
    },
  };
  const f = metricFindings(data);
  assert.ok(f.some(x => x.severity === 'CRITICAL' && x.title.includes('归档')), '归档 → CRITICAL');
});

test('metricFindings：活跃健康仓库 → 空或仅 LOW', () => {
  const data: GitHubData = {
    owner: 'a', repo: 'b', fetched_at: '', url: '', license: 'MIT', description: null,
    metrics: {
      days_since_push: 3, days_since_created: 500, stars: 100, forks: 20,
      open_issues: 3, archived: false, issue_health: 0.03,
      pr_merge_median_hours: 12, bus_factor_pct: 40, release_pace: 4, star_per_year: 73,
    },
  };
  const f = metricFindings(data);
  assert.equal(f.length, 0, '健康仓库不应产生发现');
});

test('paperFindings：2 年以上零引用 → MEDIUM 发现', () => {
  const data: PaperData = {
    query: 'x', fetched_at: '',
    paper: {
      paperId: 'p1', title: 't', abstract: 'a', year: 2023, venue: null,
      citationCount: 0, authors: [], externalIds: null,
    },
    citations: [], searchResults: [],
  };
  const f = paperFindings(data);
  assert.ok(f.some(x => x.class === 'ECO' && x.title.includes('零引用')), '零引用');
});

test('paperFindings：查不到论文 → REPRO 发现', () => {
  const data: PaperData = { query: 'nonexistent', fetched_at: '', paper: null, citations: [], searchResults: [] };
  const f = paperFindings(data);
  assert.ok(f.some(x => x.class === 'REPRO' && x.title.includes('定位论文')), '无法定位');
});
