# ContentProject Context Protocol

> 定义 4D 阶段间传递数据的标准 schema，确保 Discover → Dissect → Develop → Document 全链路数据一致。

---

## 1. YAML Schema 定义

```yaml
# ContentProject Schema v1.0
ContentProject:
  # === 基础标识 ===
  id: string            # 格式: {pillar}-{YYYY}{WW}-{seq}
                        # 示例: report-202630-001, source-202630-002
                        # pillar 缩写: report/source/dev/pr/challenge/explained
  pillar: enum          # 6 大内容支柱
    - weekly-report     # 世界AI安全周报
    - source-dive       # 我把XX源码读完了
    - dev-documentary   # AI真实开发纪录片
    - pr-story          # 我给世界项目提PR
    - security-challenge # AI安全挑战
    - explained         # AI Security Explained
  status: enum          # 项目状态
    - draft             # 草稿（已创建未启动）
    - in-progress       # 进行中（当前阶段执行中）
    - review            # 审核中（阶段产出待审核）
    - ready             # 就绪（可发布）
    - published         # 已发布
  created_at: datetime
  updated_at: datetime
  current_stage: enum   # 当前所在阶段
    - D1-discover
    - D2-dissect
    - D3-develop
    - D4-document

  # === D1: Discover 阶段 ===
  discover:
    sources:            # 数据来源列表
      - name: string    # 数据源名称 (github-trending/arxiv/cve/pr-tracker)
        url: string     # 抓取 URL
        fetched_at: datetime
        record_count: int
    trend_scores:       # 趋势评分
      github_stars_delta: int
      arxiv_mentions: int
      cve_count: int
      community_heat: float  # 0.0-1.0
    selected_topics:    # 筛选后的选题列表
      - topic: string
        score: float    # 综合评分 0-100
        rationale: string
        pillar_fit: enum  # 匹配的内容支柱
    raw_data_path: string  # 原始数据存放路径

  # === D2: Dissect 阶段 ===
  dissect:
    target_repo: string  # 目标仓库 (org/repo)
    architecture:
      components: list   # 核心组件列表
      data_flow: string  # 数据流描述
      dependencies: list # 关键依赖
      diagram_path: string # 架构图路径
    design_decisions:    # 设计决策分析
      - decision: string
        tradeoff: string
        alternative: string
    security_analysis:
      attack_surface: list  # 攻击面
      cve_history: list     # 历史 CVE
      mitre_mapping: list   # MITRE ATT&CK 映射
      risk_level: enum      # CRITICAL/HIGH/MEDIUM/LOW
      findings: list        # 安全发现

  # === D3: Develop 阶段 ===
  develop:
    target_issue:
      repo: string
      issue_number: int
      title: string
      url: string
      labels: list
    pr_plan:
      branch_name: string
      files_to_change: list
      approach: string
      estimated_complexity: enum  # S/M/L/XL
    dev_log:
      - timestamp: datetime
        action: string
        file: string
        description: string
    review_responses:
      - reviewer: string
        comment: string
        response: string
        resolved: boolean

  # === D4: Document 阶段 ===
  document:
    bilibili:
      script: string       # 视频脚本路径
      metadata:
        title: string      # ≤80 字符
        description: string # ≤2000 字符
        tags: list         # ≤12 个标签
        partition: string  # 分区
        cover_brief: string # 封面设计说明
    blog:
      csdn: string         # CSDN 文章路径
      juejin: string       # 掘金文章路径
      zhihu: string        # 知乎文章路径
    assets:
      ppt: string          # PPT 规格文件
      audio_script: string # 音频脚本
      video_spec: string   # 视频规格
    github_repo:
      readme: string       # README 路径
      license: string      # LICENSE 类型
      gitignore: string    # .gitignore 路径
```

---

## 2. 阶段间数据传递规则

### 2.1 传递原则

| 规则 | 说明 |
|------|------|
| **只追加不覆盖** | 下游阶段只能读取上游产出，不可修改上游数据 |
| **引用不复制** | 大文件通过路径引用，不在 YAML 中内嵌内容 |
| **状态同步** | 阶段完成后更新 `status` 和 `current_stage` |
| **校验通过才传递** | 必须通过当前阶段 Quality Gate 才能进入下一阶段 |

### 2.2 传递矩阵

| 上游 → 下游 | 传递字段 | 用途 |
|-------------|---------|------|
| D1 → D2 | `discover.selected_topics[]` | 确定 Dissect 目标 |
| D1 → D2 | `discover.trend_scores` | 优先级排序 |
| D2 → D3 | `dissect.security_analysis.findings` | 确定可贡献方向 |
| D2 → D3 | `dissect.architecture` | 理解代码结构 |
| D2 → D4 | `dissect.*` (全部) | 文档内容素材 |
| D3 → D4 | `develop.pr_plan` | PR 故事线 |
| D3 → D4 | `develop.dev_log` | 开发过程记录 |
| D3 → D4 | `develop.review_responses` | Review 互动素材 |

### 2.3 ID 编码规则

```
格式: {pillar缩写}-{YYYY}{WW}-{seq}

pillar 缩写映射:
  weekly-report      → report
  source-dive        → source
  dev-documentary    → dev
  pr-story           → pr
  security-challenge → challenge
  explained          → explained

示例:
  report-202630-001   # 2026年第30周，第1个周报项目
  source-202630-002   # 2026年第30周，第2个源码解读项目
  pr-202631-001       # 2026年第31周，第1个PR故事
```

---

## 3. 各内容支柱示例实例

### 3.1 世界AI安全周报

```yaml
id: report-202630-001
pillar: weekly-report
status: published
current_stage: D4-document
discover:
  sources:
    - name: github-trending
      url: https://github.com/trending?since=weekly
      fetched_at: "2026-07-20T08:00:00Z"
      record_count: 150
    - name: arxiv
      url: https://arxiv.org/list/cs.CR/recent
      fetched_at: "2026-07-20T08:00:00Z"
      record_count: 45
    - name: cve
      url: https://services.nvd.nist.gov/rest/json/cves/2.0
      fetched_at: "2026-07-20T08:00:00Z"
      record_count: 23
    - name: pr-tracker
      url: https://api.github.com/search/issues
      fetched_at: "2026-07-20T08:00:00Z"
      record_count: 78
  trend_scores:
    github_stars_delta: 1250
    arxiv_mentions: 12
    cve_count: 5
    community_heat: 0.82
  selected_topics:
    - topic: "LangChain Prompt Injection 新攻击面"
      score: 92.5
      rationale: "本周GitHub star增长最快，伴随新CVE"
      pillar_fit: weekly-report
```

### 3.2 我把XX源码读完了

```yaml
id: source-202630-002
pillar: source-dive
status: in-progress
current_stage: D2-dissect
dissect:
  target_repo: "langchain-ai/langchain"
  architecture:
    components:
      - name: "Chain Engine"
        role: "核心编排引擎，负责 Chain 的构建和执行"
      - name: "Agent Executor"
        role: "Agent 执行器，处理工具调用循环"
      - name: "Memory Module"
        role: "记忆管理，支持多种后端"
    data_flow: "User Input → Chain → LLM → Tool → Memory → Output"
    dependencies:
      - "openai-python: LLM 调用"
      - "pydantic: 数据验证"
      - "SQLAlchemy: Memory 后端"
  security_analysis:
    attack_surface:
      - "Prompt Injection via user input"
      - "Tool execution sandbox escape"
      - "Memory poisoning"
    risk_level: HIGH
```

### 3.3 AI真实开发纪录片

```yaml
id: dev-202631-001
pillar: dev-documentary
status: in-progress
current_stage: D3-develop
develop:
  target_issue:
    repo: "huggingface/transformers"
    issue_number: 28456
    title: "Add input validation for pipeline API"
    url: "https://github.com/huggingface/transformers/issues/28456"
    labels: ["good first issue", "security"]
  pr_plan:
    branch_name: "fix/pipeline-input-validation"
    files_to_change:
      - "src/transformers/pipelines/base.py"
      - "tests/pipelines/test_validation.py"
    approach: "在 pipeline 入口添加输入类型和范围校验"
    estimated_complexity: M
```

### 3.4 我给世界项目提PR

```yaml
id: pr-202631-001
pillar: pr-story
status: ready
current_stage: D4-document
develop:
  target_issue:
    repo: "microsoft/DeepSpeed"
    issue_number: 4521
    title: "Fix memory leak in ZeRO-3 optimizer"
    url: "https://github.com/microsoft/DeepSpeed/issues/4521"
    labels: ["bug", "performance"]
  review_responses:
    - reviewer: "maintainer-X"
      comment: "Please add benchmark comparison"
      response: "Added benchmark results in PR description"
      resolved: true
```

### 3.5 AI安全挑战

```yaml
id: challenge-202632-001
pillar: security-challenge
status: draft
current_stage: D1-discover
discover:
  selected_topics:
    - topic: "GPT-4 vs Claude vs Gemini 对抗性攻击防御对比"
      score: 88.0
      rationale: "多模型安全对比是高热度话题"
      pillar_fit: security-challenge
```

### 3.6 AI Security Explained

```yaml
id: explained-202632-001
pillar: explained
status: in-progress
current_stage: D2-dissect
dissect:
  target_repo: "OWASP/llm-top-10"
  architecture:
    components:
      - name: "LLM Top 10 Categories"
        role: "OWASP 大模型安全风险十大分类"
    data_flow: "Threat Classification → Risk Assessment → Mitigation Guide"
  security_analysis:
    attack_surface:
      - "Prompt Injection"
      - "Insecure Output Handling"
      - "Training Data Poisoning"
    risk_level: CRITICAL
```

---

## 4. 版本与变更

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2026-07-20 | 初始版本，定义完整 schema 和传递规则 |
