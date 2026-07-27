# Global Settings — 全局配置

> 09-HOS-Content-Engine 的全局运行配置，包括频道信息、平台策略、API 密钥和系统参数。

---

## 1. 频道信息

```yaml
channel:
  name: "AI安全实验室"
  name_en: "AI Security Lab"
  positioning: "开源AI安全工程纪录片"
  tagline: "用工程视角解读AI安全，用开源方式参与AI安全"
  logo: "assets/logo/ai-security-lab.png"
  brand_colors:
    primary: "#1E90FF"    # 科技蓝
    secondary: "#00FF88"  # 安全绿
    accent: "#FF4444"     # 警告红
    background: "#1A1A2E" # 深色底
```

---

## 2. 平台策略

```yaml
platforms:
  primary:
    name: Bilibili
    type: video
    content_type: 中长视频 (8-25分钟)
    target_audience: 技术向B站用户
    publishing_tool: null  # 手动上传
    specs_ref: shared/bilibili-spec.md

  secondary:
    - name: CSDN
      type: blog
      content_type: 技术长文
      target_audience: 中文开发者社区
      adaptation_rules:
        - 增加代码示例
        - 添加 SEO 关键词
        - 使用 CSDN Markdown 格式

    - name: 掘金 (Juejin)
      type: blog
      content_type: 技术深度文
      target_audience: 前端/全栈/后端开发者
      adaptation_rules:
        - 突出工程实践
        - 添加可运行代码
        - 使用掘金 Markdown 格式

    - name: 知乎 (Zhihu)
      type: blog
      content_type: 知识科普/深度分析
      target_audience: 知识型用户
      adaptation_rules:
        - 增加背景解释
        - 使用知乎排版风格
        - 回答相关问题引流
```

---

## 3. 内容频率

```yaml
content_frequency:
  weekly-report:
    name: "世界AI安全周报"
    frequency: "每周 1 期"
    target_day: Friday
    target_time: "18:00"
    monthly_count: 4

  source-dive:
    name: "我把XX源码读完了"
    frequency: "每月 2-4 期"
    target_day: Wednesday
    target_time: "12:00"
    monthly_count: 3  # 取中间值

  dev-documentary:
    name: "AI真实开发纪录片"
    frequency: "持续系列"
    target_day: Saturday
    target_time: "10:00"
    monthly_count: 2

  pr-story:
    name: "我给世界项目提PR"
    frequency: "每月 1-2 期"
    target_day: Saturday
    target_time: "10:00"
    monthly_count: 1.5

  security-challenge:
    name: "AI安全挑战"
    frequency: "每月 1-2 期"
    target_day: Saturday
    target_time: "10:00"
    monthly_count: 1.5

  explained:
    name: "AI Security Explained"
    frequency: "每月 2-4 期"
    target_day: Sunday
    target_time: "20:00"
    monthly_count: 3

  total:
    weekly_avg: 2.5  # 平均每周 2-3 个视频
    monthly_avg: 15  # 平均每月约 15 个视频
```

---

## 4. API 密钥配置

```yaml
api_keys:
  # 所有密钥通过环境变量注入，不硬编码
  GITHUB_TOKEN:
    env_var: "GITHUB_TOKEN"
    required: true
    scopes: ["repo", "read:org", "read:user"]
    usage: "GitHub API (Trending, Search, Issues/PRs)"

  NVD_API_KEY:
    env_var: "NVD_API_KEY"
    required: false  # 无 key 也可使用，但速率限制更严格
    usage: "NVD CVE API (速率提升: 5→50 请求/30秒)"

  # 可选扩展
  OPENAI_API_KEY:
    env_var: "OPENAI_API_KEY"
    required: false
    usage: "LLM 辅助内容生成（可选）"

  BILIBILI_COOKIE:
    env_var: "BILIBILI_COOKIE"
    required: false
    usage: "B站数据采集（可选，用于获取更详细的趋势数据）"
```

---

## 5. 速率限制

```yaml
rate_limits:
  github:
    search_api: 30 requests/minute
    rest_api: 5000 requests/hour  # authenticated
    graphql: 5000 points/hour
    retry_on_429: true
    backoff_seconds: 60

  nvd:
    with_key: 50 requests/30seconds
    without_key: 5 requests/30seconds
    retry_on_429: true
    backoff_seconds: 30

  arxiv:
    recommended_interval: 3 seconds
    daily_limit: null  # 无明确限制
    polite_delay: 3 seconds

  github_advisories:
    limit: 5000 requests/hour  # 与 GitHub REST API 共享配额
```

---

## 6. 归档与保留

```yaml
archive:
  retention_days: 90  # 原始数据保留 90 天
  archive_after: 7    # 7 天后移入 archive/
  documentary_assets_retention: 180  # 纪录片素材保留 180 天
  large_file_threshold: 104857600  # 100MB，超过此大小优先清理

  compression:
    enabled: true
    algorithm: gzip
    archive_format: tar.gz

  cleanup_schedule:
    frequency: weekly
    day: Monday
    time: "03:00"
```

---

## 7. 技能依赖

```yaml
skill_dependencies:
  # 4D 引擎内部
  discover:
    skills: []  # 自研
  dissect:
    skills:
      - 00-HOS-Sec-Engine  # 安全审计引擎
  develop:
    skills: []  # 自研
  document:
    skills:
      - 06-HOS-Fuck-Demo       # Demo 视频生成
      - 07-HOS-IP-Writing/blog  # 博客写作

  # 外部工具
  external:
    - git          # 版本控制
    - gh           # GitHub CLI
    - python3      # 数据处理
    - ffmpeg       # 视频处理（可选）
```

---

## 8. 日志与监控

```yaml
logging:
  level: INFO
  format: "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
  output:
    - console
    - file: output/discover/{week-id}/pipeline.log
  rotation:
    max_size: 10MB
    max_files: 5

monitoring:
  pipeline_metrics:
    - stage_duration     # 各阶段耗时
    - gate_pass_rate     # 门禁通过率
    - content_output_count # 产出数量
    - error_count        # 错误计数
  report:
    frequency: weekly
    output: output/discover/{week-id}/pipeline-metrics.yaml
```
