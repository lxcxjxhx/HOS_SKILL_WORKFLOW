---
name: Discover
description: "D1 趋势发现子技能 — 多源安全趋势扫描、选题评分与周报生成"
version: "1.0.0"
author: "HOS Team"
tags:
  - trend-discovery
  - github-trending
  - arxiv
  - cve-monitoring
  - topic-scoring
  - weekly-report
category: "content-discovery"
risk-level: low
confidence: 0.90
---

# D1 Discover：趋势发现子技能

> **一句话定位**：多源数据扫描 + 选题可行性评分 + 周报自动生成。
> 从 GitHub Trending、arXiv、CVE/NVD、PR/Issue 四大信号源中提炼高价值选题。

---

## 一、触发条件

| 触发场景 | 示例表达 |
|---------|---------|
| 扫描 GitHub 趋势 | `扫描 GitHub 趋势`、`看看最近什么安全项目火了` |
| 查看 arXiv 新论文 | `查看 arXiv 安全论文`、`最近有什么新论文` |
| 监控 CVE 漏洞 | `监控 CVE 漏洞`、`最近有高危漏洞吗` |
| 追踪 PR 和 Issue | `追踪 PR 和 Issue`、`看看目标仓库有什么新动态` |
| 评估选题可行性 | `评估这个选题`、`这个方向值不值得做` |
| 生成周报 | `生成本周周报`、`汇总本周发现` |
| 发现新话题 | `发现新话题`、`有什么新鲜的安全话题` |

**不触发**：深度源码分析（→ D2 Dissect）、开发实现（→ D3 Develop）。

---

## 二、核心能力

### 2.1 GitHub Trending 扫描

**扫描策略**：

```yaml
scan_strategy:
  languages:
    - python
    - rust
    - go
    - javascript
    - typescript
    - c
    - cpp
  time_range: daily        # daily | weekly
  sort_by: stars           # stars | forks | updated
  security_keywords:
    - exploit
    - vulnerability
    - security
    - audit
    - fuzzing
    - reverse-engineering
    - malware
    - penetration
    - ctf
    - cryptography
  min_stars: 50
  max_results: 30
```

**输出字段**：

```yaml
output_fields:
  repo_name: str           # 仓库全名 (owner/repo)
  description: str         # 仓库描述
  language: str            # 主要语言
  stars_today: int         # 今日新增 Star
  total_stars: int         # 总 Star 数
  forks: int               # Fork 数
  url: str                 # 仓库链接
  topics: list[str]        # 仓库 Topics 标签
  created_at: str          # 创建时间
  last_commit: str         # 最近提交时间
  security_relevance: float # 安全相关度评分 (0-1)
```

**执行频率**：每日 1 次（UTC+8 09:00）。

### 2.2 arXiv 论文扫描

**扫描分类与关键词**：

```yaml
arxiv_config:
  categories:
    - cs.CR    # 密码学与安全
    - cs.AI    # 人工智能
    - cs.LG    # 机器学习
    - cs.CL    # 计算语言学 (NLP)
    - cs.SE    # 软件工程
  keywords:
    - vulnerability detection
    - fuzzing
    - binary analysis
    - malware classification
    - adversarial attack
    - LLM security
    - prompt injection
    - supply chain security
    - code auditing
    - zero-day
  max_results: 50
  sort_by: submittedDate
  date_range: 7d
```

**输出字段**：

```yaml
output_fields:
  paper_id: str            # arXiv ID (e.g. 2401.xxxxx)
  title: str               # 论文标题
  authors: list[str]       # 作者列表
  abstract: str            # 摘要
  categories: list[str]    # 所属分类
  keywords_matched: list[str]  # 命中的关键词
  published: str           # 发布日期
  url: str                 # 论文链接
  pdf_url: str             # PDF 下载链接
  relevance_score: float   # 与当前关注方向的相关度 (0-1)
  summary_zh: str          # 中文一句话总结
```

### 2.3 CVE / 漏洞监控

**数据源**：

```yaml
cve_sources:
  nvd:
    base_url: "https://services.nvd.nist.gov/rest/json/cves/2.0"
    filters:
      cvss_v3_severity: [HIGH, CRITICAL]
      published_last: 7d
  cisa_kev:
    url: "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    update_freq: daily
  github_advisories:
    api: "https://api.github.com/advisories"
    filters:
      severity: [high, critical]
      state: published
      type: reviewed
```

**过滤规则**：
- CVSS v3 评分 >= 7.0（HIGH/CRITICAL）
- 优先关注已在野利用的漏洞（CISA KEV）
- 关注与扫描目标技术栈相关的漏洞

**输出字段**：

```yaml
output_fields:
  cve_id: str              # CVE 编号
  description: str         # 漏洞描述
  severity: str            # 严重程度 (CRITICAL/HIGH/MEDIUM/LOW)
  cvss_score: float        # CVSS 评分
  affected_products: list  # 受影响产品/组件
  affected_versions: str   # 受影响版本范围
  published_date: str      # 发布日期
  references: list[str]    # 参考链接
  is_kev: bool             # 是否在 CISA KEV 列表中
  has_poc: bool            # 是否已有公开 PoC
  patch_available: bool    # 是否有补丁
  content_potential: float # 内容创作潜力评分 (0-1)
```

### 2.4 PR / Issue 追踪

**追踪仓库列表**：

```yaml
tracked_repos:
  - owner: "google"
    repo: "oss-fuzz"
    focus: [issues, prs]
  - owner: "RustSec"
    repo: "advisory-db"
    focus: [issues]
  - owner: "aquasecurity"
    repo: "trivy"
    focus: [issues, prs]
  - owner: "anchore"
    repo: "grype"
    focus: [issues, prs]
  - owner: "sigstore"
    repo: "cosign"
    focus: [issues, prs]
  # 可根据选题方向动态扩展
```

**过滤规则**：
- 标签包含 `security`、`vulnerability`、`bug`、`enhancement`
- 最近 7 天内创建或有新活动
- Issue 评论数 >= 3（表示社区关注度高）

**输出字段**：

```yaml
output_fields:
  type: str                # issue | pr
  number: int              # 编号
  title: str               # 标题
  body_preview: str        # 正文预览 (前 500 字)
  labels: list[str]        # 标签
  state: str               # open | closed
  author: str              # 作者
  created_at: str          # 创建时间
  updated_at: str          # 最近更新时间
  comments_count: int      # 评论数
  url: str                 # 链接
  security_relevant: bool  # 是否安全相关
```

### 2.5 选题可行性评分

**五维评分模型**：

```yaml
scoring_model:
  dimensions:
    novelty:
      weight: 0.30
      description: "新颖性 — 该选题是否足够新鲜、独特"
      rubric:
        5: "全新话题，无任何同类内容"
        4: "非常新，仅有少量报道"
        3: "有一定新意，但已有类似内容"
        2: "较常见，已有大量内容"
        1: "老话题，完全无新意"
    audience_fit:
      weight: 0.25
      description: "受众匹配度 — 是否匹配目标受众兴趣"
      rubric:
        5: "完美匹配核心受众痛点"
        4: "高度相关，大部分受众会感兴趣"
        3: "部分受众会感兴趣"
        2: "受众面较窄"
        1: "与目标受众无关"
    competition:
      weight: 0.20
      description: "竞争度 — 同类内容的竞争程度（分高=竞争少=好）"
      rubric:
        5: "几乎无中文竞品"
        4: "少量竞品，质量一般"
        3: "有一定竞品，但有差异化空间"
        2: "竞品较多且质量较高"
        1: "红海话题，难以超越"
    feasibility:
      weight: 0.15
      description: "可行性 — 在当前资源下能否高质量完成"
      rubric:
        5: "资源充足，1-2天可完成"
        4: "资源基本充足，3天内可完成"
        3: "需要额外准备，1周内可完成"
        2: "难度较高，需 1-2 周"
        1: "极难完成或资源不足"
    timeliness:
      weight: 0.10
      description: "时效性 — 是否有时间窗口要求"
      rubric:
        5: "紧急热点，24h 内必须发布"
        4: "近期热点，3天内发布最佳"
        3: "一周内发布即可"
        2: "无明确时间压力"
        1: "过时话题"
```

**评分公式**：

```
Final Score = Novelty * 0.30 + Audience_Fit * 0.25 + Competition * 0.20
            + Feasibility * 0.15 + Timeliness * 0.10

Grade:
  S >= 4.5  → 立即执行，最高优先级
  A >= 3.5  → 本周安排，高优先级
  B >= 2.5  → 排入候选池
  C <  2.5  → 暂不推荐
```

### 2.6 周报生成

**报告结构模板**：

```yaml
weekly_report_template:
  title: "HOS 安全洞察周报 — Week {week_number} ({date_range})"
  sections:
    - name: "本周概览"
      content: "3-5 句话概括本周最重要的发现"
    - name: "Top 10 选题推荐"
      content: |
        按评分排序的选题列表，每个包含:
        - 选题名称 + 评分等级 (S/A/B)
        - 一句话描述
        - 数据来源
        - 推荐内容支柱
    - name: "GitHub 趋势"
      content: "本周安全相关趋势项目 Top 5"
    - name: "arXiv 论文精选"
      content: "本周值得关注的论文 Top 5"
    - name: "CVE 漏洞速报"
      content: "本周高危/严重漏洞摘要"
    - name: "PR/Issue 动态"
      content: "追踪仓库的重要动态"
    - name: "下周计划"
      content: "建议下周重点关注的方向"
```

---

## 三、数据源配置

```yaml
data_sources:
  github_trending:
    enabled: true
    api: "https://api.github.com"
    auth: "${GITHUB_TOKEN}"
    rate_limit: 5000/hour
  arxiv:
    enabled: true
    api: "http://export.arxiv.org/api/query"
    rate_limit: 3s between requests
  nvd:
    enabled: true
    api: "https://services.nvd.nist.gov/rest/json/cves/2.0"
    auth: "${NVD_API_KEY}"
    rate_limit: 50/30s
  cisa_kev:
    enabled: true
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
    update: daily
  github_advisories:
    enabled: true
    api: "https://api.github.com/advisories"
    auth: "${GITHUB_TOKEN}"
```

---

## 四、工作流程图

```
┌──────────────────────────────────────────────────────────────────┐
│                    D1 Discover 工作流程                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ GitHub      │  │ arXiv       │  │ CVE/NVD     │             │
│  │ Trending    │  │ 论文扫描    │  │ 漏洞监控    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────┬───────┘────────────────┘                      │
│                  ▼                                               │
│         ┌────────────────┐                                       │
│         │ 信号聚合 & 去重 │                                      │
│         └────────┬───────┘                                       │
│                  ▼                                               │
│         ┌────────────────┐     ┌────────────────┐               │
│         │ PR/Issue 追踪  │────▶│ 候选选题池     │               │
│         └────────────────┘     └────────┬───────┘               │
│                                         ▼                       │
│                                ┌────────────────┐               │
│                                │ 五维评分模型   │               │
│                                │ 评分 & 分级    │               │
│                                └────────┬───────┘               │
│                                         ▼                       │
│                    ┌────────────────────────────────┐            │
│                    │ S/A 级 → 传递给 D2 Dissect     │            │
│                    │ B 级 → 排入候选池               │            │
│                    │ C 级 → 归档                     │            │
│                    └────────────────────────────────┘            │
│                                         │                       │
│                                         ▼                       │
│                                ┌────────────────┐               │
│                                │ 周报生成       │               │
│                                │ → output/      │               │
│                                │   discover/    │               │
│                                │   {week-id}/   │               │
│                                └────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、质量门禁

```yaml
quality_gates:
  data_source_availability:
    description: "至少 3/4 个数据源可用"
    condition: "available_sources >= 3"
    sources: [github_trending, arxiv, cve, pr_issue]
  candidate_count:
    description: "候选选题不少于 20 个"
    condition: "candidates >= 20"
  scoring_completeness:
    description: "所有候选选题必须完成五维评分"
    condition: "all dimensions scored for each candidate"
  deduplication:
    description: "去重后无重复选题"
    condition: "unique_candidates == candidates_after_dedup"
```

---

## 六、输出规范

```
output/discover/{week-id}/
├── weekly-report.yaml        # 周报数据 (结构化)
├── weekly-report.md          # 周报 (Markdown 可读版)
├── candidates/
│   ├── github-trending.yaml  # GitHub 趋势扫描结果
│   ├── arxiv-papers.yaml     # arXiv 论文扫描结果
│   ├── cve-alerts.yaml       # CVE 漏洞监控结果
│   └── pr-issue-tracker.yaml # PR/Issue 追踪结果
├── scoring/
│   ├── scored-topics.yaml    # 评分后的选题列表
│   └── grade-summary.yaml    # 分级汇总
└── metadata.json             # 元数据 (执行时间、数据源状态等)
```

---

## 七、依赖关系

| 依赖目标 | 依赖原因 | 调用方式 |
|----------|----------|----------|
| D2 Dissect | S/A 级选题传递给 D2 进行深度分析 | 内部传递 |
| 00-HOS-Sec-Engine | 漏洞评分时参考安全引擎的威胁情报 | API 查询 |

---

## 八、集成代码

### 8.1 GitHub API — Trending 扫描

```python
import requests
from datetime import datetime, timedelta

def scan_github_trending(token: str, languages: list[str],
                         security_keywords: list[str],
                         min_stars: int = 50) -> list[dict]:
    """扫描 GitHub 近 24h 安全相关趋势仓库。"""
    headers = {"Authorization": f"token {token}"}
    since = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    results = []

    for lang in languages:
        query = f"language:{lang} stars:>{min_stars} pushed:>{since}"
        resp = requests.get(
            "https://api.github.com/search/repositories",
            headers=headers,
            params={"q": query, "sort": "stars", "order": "desc", "per_page": 30},
        )
        resp.raise_for_status()
        for repo in resp.json().get("items", []):
            desc = (repo.get("description") or "").lower()
            if any(kw in desc for kw in security_keywords):
                results.append({
                    "repo_name": repo["full_name"],
                    "description": repo["description"],
                    "language": repo["language"],
                    "stars_today": repo["stargazers_count"],  # 近似值
                    "total_stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "url": repo["html_url"],
                    "topics": repo.get("topics", []),
                    "created_at": repo["created_at"],
                    "last_commit": repo["pushed_at"],
                })
    return results
```

### 8.2 arXiv API — 论文扫描

```python
import xml.etree.ElementTree as ET
import requests, time

ARXIV_NS = {"atom": "http://www.w3.org/2005/Atom"}

def scan_arxiv(categories: list[str], keywords: list[str],
               max_results: int = 50) -> list[dict]:
    """扫描 arXiv 最新安全相关论文。"""
    cat_q = " OR ".join(f"cat:{c}" for c in categories)
    kw_q = " OR ".join(f'all:"{k}"' for k in keywords)
    query = f"({cat_q}) AND ({kw_q})"

    resp = requests.get(
        "http://export.arxiv.org/api/query",
        params={
            "search_query": query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        },
    )
    resp.raise_for_status()
    time.sleep(3)  # 遵守 arXiv 请求频率限制

    root = ET.fromstring(resp.text)
    papers = []
    for entry in root.findall("atom:entry", ARXIV_NS):
        papers.append({
            "paper_id": entry.find("atom:id", ARXIV_NS).text.split("/")[-1],
            "title": entry.find("atom:title", ARXIV_NS).text.strip(),
            "authors": [a.find("atom:name", ARXIV_NS).text
                        for a in entry.findall("atom:author", ARXIV_NS)],
            "abstract": entry.find("atom:summary", ARXIV_NS).text.strip(),
            "published": entry.find("atom:published", ARXIV_NS).text,
            "url": entry.find("atom:id", ARXIV_NS).text,
            "categories": [c.get("term") for c in entry.findall("atom:category", ARXIV_NS)],
        })
    return papers
```

### 8.3 CVE API — NVD + CISA KEV 查询

```python
import requests
from datetime import datetime, timedelta

def fetch_recent_cves(api_key: str, min_cvss: float = 7.0,
                      days: int = 7) -> list[dict]:
    """从 NVD 获取近期高危/严重 CVE。"""
    pub_start = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S.000")
    pub_end = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000")

    resp = requests.get(
        "https://services.nvd.nist.gov/rest/json/cves/2.0",
        headers={"apiKey": api_key},
        params={
            "pubStartDate": pub_start,
            "pubEndDate": pub_end,
            "cvssV3Severity": "CRITICAL,HIGH",
            "resultsPerPage": 100,
        },
    )
    resp.raise_for_status()
    data = resp.json()

    cves = []
    for vuln in data.get("vulnerabilities", []):
        cve = vuln["cve"]
        metrics = cve.get("metrics", {}).get("cvssMetricV31", [{}])
        score = metrics[0].get("cvssData", {}).get("baseScore", 0) if metrics else 0
        if score >= min_cvss:
            cves.append({
                "cve_id": cve["id"],
                "description": cve["descriptions"][0]["value"],
                "severity": metrics[0]["cvssData"]["baseSeverity"] if metrics else "UNKNOWN",
                "cvss_score": score,
                "published_date": cve["published"],
                "references": [r["url"] for r in cve.get("references", [])],
            })
    return cves


def fetch_cisa_kev() -> list[dict]:
    """获取 CISA 已知被利用漏洞目录。"""
    resp = requests.get(
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    )
    resp.raise_for_status()
    return resp.json().get("vulnerabilities", [])
```

---

## 九、模板索引

| 模板名称 | 路径 | 用途 |
|----------|------|------|
| 周报模板 | `templates/weekly-report.md` | 周报 Markdown 结构 |
| 选题评分卡 | `templates/scoring-card.yaml` | 单个选题的评分详情 |
| GitHub 扫描结果 | `templates/github-trending.yaml` | 扫描结果结构 |
| arXiv 扫描结果 | `templates/arxiv-papers.yaml` | 论文扫描结果结构 |
| CVE 速报 | `templates/cve-alert.yaml` | 漏洞速报结构 |
