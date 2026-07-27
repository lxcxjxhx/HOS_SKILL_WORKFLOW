# Output Directory Specification

> 定义 4D Content Engine 所有产出的标准目录结构。每个项目按 `output/{stage}/{project-id}/` 组织。

---

## 目录结构

```
output/
├── discover/{week-id}/
│   ├── trend-report.md          # 趋势分析报告（Markdown）
│   ├── topic-ranking.yaml       # 选题排名（YAML，含评分）
│   ├── raw-data/                # 原始抓取数据
│   │   ├── github-trending.json # GitHub Trending 数据
│   │   ├── arxiv-papers.json    # arXiv 论文数据
│   │   ├── cve-alerts.json      # CVE 告警数据
│   │   └── pr-issues.json       # PR/Issue 追踪数据
│   └── archive/                 # 历史归档（超过 7 天的数据）
│
├── dissect/{project-id}/
│   ├── architecture-analysis.md # 架构分析文档
│   ├── design-decisions.md      # 设计决策分析
│   ├── security-analysis.md     # 安全分析报告
│   └── comparison.md            # 同类项目对比
│
├── develop/{project-id}/
│   ├── pr-plan.md               # PR 计划文档
│   ├── dev-log.yaml             # 开发日志（结构化）
│   ├── code-changes/            # 代码变更（diff/patch）
│   ├── review-responses.md      # Review 回复记录
│   ├── merge-retrospective.yaml # 合并回溯总结
│   └── documentary-assets/      # 纪录片素材
│       ├── screen-recordings/   # 录屏文件
│       ├── screenshots/         # 截图
│       └── transcripts/         # 对话记录
│
└── document/{project-id}/
    ├── bilibili-script.md       # B站视频脚本
    ├── bilibili-metadata.md     # B站元数据（标题/描述/标签）
    ├── thumbnail-brief.md       # 封面设计说明
    ├── blog/                    # 博客文章（多平台适配）
    │   ├── csdn.md              # CSDN 版本
    │   ├── juejin.md            # 掘金版本
    │   └── zhihu.md             # 知乎版本
    ├── assets/                  # 多媒体资产规格
    │   ├── ppt.json             # PPT 结构定义
    │   ├── audio-script.md      # 音频/旁白脚本
    │   └── video-spec.md        # 视频渲染规格
    └── repo/                    # GitHub 仓库文件
        ├── README.md            # 项目 README
        ├── LICENSE              # 开源协议
        └── .gitignore           # Git 忽略规则
```

---

## 命名规则

### week-id
```
格式: {YYYY}W{WW}
示例: 2026W30, 2026W31
说明: ISO 周编号
```

### project-id
```
格式: 与 ContentProject.id 一致
示例: report-202630-001, source-202630-002
说明: {pillar缩写}-{YYYY}{WW}-{seq}
```

---

## 文件规格

### 原始数据 (raw-data/)

| 文件 | 格式 | 内容 | 大小限制 |
|------|------|------|---------|
| github-trending.json | JSON Array | 项目列表含 stars/forks/description | ≤ 5MB |
| arxiv-papers.json | JSON Array | 论文列表含 title/abstract/authors | ≤ 3MB |
| cve-alerts.json | JSON Array | CVE 列表含 id/severity/description | ≤ 2MB |
| pr-issues.json | JSON Array | Issue/PR 列表含 title/state/labels | ≤ 3MB |

### 分析文档 (dissect/)

| 文件 | 格式 | 最小字数 | 必需章节 |
|------|------|---------|---------|
| architecture-analysis.md | Markdown | 2000 字 | 组件列表, 数据流, 依赖分析 |
| design-decisions.md | Markdown | 1500 字 | 决策列表, tradeoff, 替代方案 |
| security-analysis.md | Markdown | 2000 字 | 攻击面, CVE历史, MITRE映射 |
| comparison.md | Markdown | 500 字 | 对比表格, 优劣分析 |

### 开发产出 (develop/)

| 文件 | 格式 | 说明 |
|------|------|------|
| pr-plan.md | Markdown | 包含目标 issue、变更文件、实现方案 |
| dev-log.yaml | YAML | 时间戳+动作+文件+描述 |
| code-changes/ | 目录 | .diff 或 .patch 文件 |
| review-responses.md | Markdown | 逐条 review 回复 |
| merge-retrospective.yaml | YAML | 经验总结、耗时、难度评估 |

### 内容产出 (document/)

| 文件 | 格式 | 规格 |
|------|------|------|
| bilibili-script.md | Markdown | 含时间戳标记，8-15分钟内容量 |
| bilibili-metadata.md | YAML | 标题/描述/标签/分区 |
| thumbnail-brief.md | Markdown | 封面设计说明，含文字和配色 |
| blog/csdn.md | Markdown | CSDN 平台适配版本 |
| blog/juejin.md | Markdown | 掘金平台适配版本 |
| blog/zhihu.md | Markdown | 知乎平台适配版本 |
| assets/ppt.json | JSON | PPT 页面结构和内容 |
| assets/audio-script.md | Markdown | 旁白/配音脚本 |
| assets/video-spec.md | YAML | 视频渲染参数 |
| repo/README.md | Markdown | GitHub 仓库首页 |
| repo/LICENSE | Text | MIT License |
| repo/.gitignore | Text | 标准 Git 忽略规则 |

---

## 清理策略

| 目录 | 保留期 | 清理方式 |
|------|--------|---------|
| discover/raw-data/ | 90 天 | 超期移入 archive/ |
| discover/archive/ | 永久 | 不自动清理 |
| develop/documentary-assets/ | 180 天 | 大文件（>100MB）优先清理 |
| 其他 | 永久 | 不自动清理 |
