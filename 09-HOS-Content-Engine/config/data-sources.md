# Data Sources Configuration — Discover 阶段数据源配置

> 定义 D1 Discover 阶段的 4 个数据源抓取配置，包括 API 端点、认证方式、速率限制和过滤规则。

---

## 1. GitHub Trending

### 1.1 基本信息

| 配置项 | 值 |
|--------|-----|
| 数据源名称 | github-trending |
| API 端点 | `https://api.github.com/search/repositories` |
| 备选端点 | `https://github.com/trending?since=weekly` (非官方，需爬取) |
| 认证方式 | Bearer Token (GITHUB_TOKEN) |
| 速率限制 | 5000 请求/小时 (authenticated), 60 请求/小时 (unauthenticated) |
| 扫描间隔 | 24 小时 |
| 超时设置 | 30 秒 |

### 1.2 扫描配置

```yaml
github_trending:
  languages:
    - Python
    - JavaScript
    - TypeScript
    - Rust
    - Go
    - C++
  keywords:
    # AI 安全核心
    - "AI security"
    - "LLM security"
    - "prompt injection"
    - "adversarial attack"
    - "model safety"
    - "AI red team"
    # 主流 AI 框架
    - "langchain"
    - "transformers"
    - "llama-index"
    - "deeplake"
    - "guardrails"
    # 安全工具
    - "vulnerability"
    - "exploit"
    - "penetration testing"
    - "security scanner"
  sort: stars
  order: desc
  created_filter: ">2024-01-01"  # 只关注 2024 后创建的项目
  min_stars: 100
  weekly_star_threshold: 50  # 周增 star ≥ 50 才入选
```

### 1.3 输出格式

```json
{
  "fetched_at": "2026-07-20T08:00:00Z",
  "source": "github-trending",
  "total_count": 150,
  "items": [
    {
      "full_name": "org/repo",
      "description": "...",
      "language": "Python",
      "stars": 12500,
      "weekly_stars": 320,
      "forks": 890,
      "topics": ["ai-security", "llm"],
      "created_at": "2024-06-01",
      "updated_at": "2026-07-19",
      "url": "https://github.com/org/repo"
    }
  ]
}
```

---

## 2. arXiv

### 2.1 基本信息

| 配置项 | 值 |
|--------|-----|
| 数据源名称 | arxiv |
| API 端点 | `http://export.arxiv.org/api/query` |
| 认证方式 | 无需认证 |
| 速率限制 | 建议间隔 3 秒，无严格限制 |
| 扫描间隔 | 24 小时 |
| 超时设置 | 60 秒 |

### 2.2 扫描配置

```yaml
arxiv:
  categories:
    - cs.CR    # 密码学与安全
    - cs.AI    # 人工智能
    - cs.LG    # 机器学习
    - cs.CL    # 计算语言学（NLP）
    - cs.SE    # 软件工程
  keywords:
    - "large language model security"
    - "prompt injection"
    - "adversarial machine learning"
    - "model extraction attack"
    - "data poisoning"
    - "backdoor attack"
    - "jailbreak"
    - "LLM alignment"
    - "AI safety"
    - "red teaming"
    - "vulnerability detection"
    - "fuzzing LLM"
  max_results: 100
  sort_by: submittedDate
  sort_order: descending
  date_window: 7  # 只取最近 7 天的论文
```

### 2.3 输出格式

```json
{
  "fetched_at": "2026-07-20T08:00:00Z",
  "source": "arxiv",
  "total_count": 45,
  "items": [
    {
      "id": "2607.12345",
      "title": "...",
      "abstract": "...",
      "authors": ["Author A", "Author B"],
      "categories": ["cs.CR", "cs.AI"],
      "published": "2026-07-18",
      "updated": "2026-07-19",
      "url": "https://arxiv.org/abs/2607.12345",
      "pdf_url": "https://arxiv.org/pdf/2607.12345"
    }
  ]
}
```

---

## 3. CVE / 漏洞告警

### 3.1 基本信息

| 配置项 | 值 |
|--------|-----|
| 数据源名称 | cve |
| 主 API | NVD: `https://services.nvd.nist.gov/rest/json/cves/2.0` |
| 辅助 API 1 | CISA KEV: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog` |
| 辅助 API 2 | GitHub Advisories: `https://api.github.com/advisories` |
| 认证方式 | NVD_API_KEY (可选但推荐), GITHUB_TOKEN |
| 速率限制 | NVD: 50 请求/30秒 (with API key), 5 请求/30秒 (without) |
| 扫描间隔 | 24 小时 |
| 超时设置 | 60 秒 |

### 3.2 扫描配置

```yaml
cve:
  severity_filter:
    - HIGH
    - CRITICAL
  cvss_min_score: 7.0
  date_window: 7  # 只取最近 7 天发布的
  keywords:
    - "artificial intelligence"
    - "machine learning"
    - "large language model"
    - "python"
    - "tensorflow"
    - "pytorch"
    - "huggingface"
    - "langchain"
    - "transformers"
    - "numpy"
    - "flask"
    - "fastapi"
  cisa_kev:
    enabled: true
    filter: "ai OR ml OR llm OR language model"
  github_advisories:
    ecosystem:
      - pip
      - npm
      - go
      - crates
      - maven
```

### 3.3 输出格式

```json
{
  "fetched_at": "2026-07-20T08:00:00Z",
  "source": "cve",
  "total_count": 23,
  "items": [
    {
      "cve_id": "CVE-2026-12345",
      "severity": "CRITICAL",
      "cvss_score": 9.8,
      "description": "...",
      "affected_products": ["langchain < 0.2.5"],
      "published_date": "2026-07-18",
      "references": ["https://..."],
      "is_kev": true
    }
  ]
}
```

---

## 4. PR/Issue Tracker

### 4.1 基本信息

| 配置项 | 值 |
|--------|-----|
| 数据源名称 | pr-tracker |
| API 端点 | `https://api.github.com/search/issues` |
| 认证方式 | GITHUB_TOKEN |
| 速率限制 | 30 请求/分钟 (search API) |
| 扫描间隔 | 24 小时 |
| 超时设置 | 30 秒 |

### 4.2 追踪仓库列表

```yaml
pr_tracker:
  tracked_repos:
    # 主流 AI 框架
    - langchain-ai/langchain
    - huggingface/transformers
    - openai/openai-python
    - microsoft/DeepSpeed
    - ray-project/ray
    - vllm-project/vllm
    - lm-sys/FastChat
    # AI 安全专项
    - OWASP/llm-top-10
    - NVIDIA/NeMo-Guardrails
    - AI-secure/guardrails-ai
    - Trusted-AI/adversarial-robustness-toolbox
    # LLM 工具链
    - run-llama/llama_index
    - chromadb-core/chromadb
    - pinecone-io/pinecone-python-client
    - weaviate/weaviate
    # 基础设施
    - mlflow/mlflow
    - wandb/wandb
    - gradio-app/gradio
    - streamlit/streamlit
  filter_rules:
    labels_include:
      - "security"
      - "vulnerability"
      - "bug"
      - "good first issue"
      - "help wanted"
      - "enhancement"
    labels_exclude:
      - "wontfix"
      - "duplicate"
      - "question"
    state:
      - open
      - recently_closed  # 7 天内关闭的
    min_comments: 2  # 至少有 2 条评论（说明有讨论）
    date_window: 7
```

### 4.3 输出格式

```json
{
  "fetched_at": "2026-07-20T08:00:00Z",
  "source": "pr-tracker",
  "total_count": 78,
  "items": [
    {
      "number": 12345,
      "title": "...",
      "repo": "langchain-ai/langchain",
      "state": "open",
      "labels": ["security", "bug"],
      "comments": 8,
      "created_at": "2026-07-15",
      "updated_at": "2026-07-19",
      "url": "https://github.com/langchain-ai/langchain/issues/12345",
      "is_pr": false
    }
  ]
}
```

---

## 5. 通用配置

```yaml
global:
  retry:
    max_retries: 3
    backoff_factor: 2  # 指数退避
    retry_statuses: [429, 500, 502, 503, 504]
  cache:
    enabled: true
    ttl: 3600  # 1 小时缓存
    backend: local  # local filesystem
  proxy:
    enabled: false
    http_proxy: ""
    https_proxy: ""
  logging:
    level: INFO
    file: output/discover/{week-id}/fetch.log
```
