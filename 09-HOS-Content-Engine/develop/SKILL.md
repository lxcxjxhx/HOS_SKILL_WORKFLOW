---
name: Develop
description: "D3 开发贡献子技能 — PR 工作流、源码修改、开发日志与 Review 响应"
version: "1.0.0"
author: "HOS Team"
tags:
  - pr-workflow
  - github-contribution
  - source-code-modification
  - dev-log
  - review-response
  - merge-celebration
category: "development"
risk-level: medium
confidence: 0.90
---

# D3 Develop：开发贡献子技能

> **一句话定位**：从定位贡献机会到 PR 合并的全流程管理。
> 覆盖 Fork → 开发 → PR → Review → 合并 → 回顾的完整闭环。

---

## 一、触发条件

| 触发场景 | 示例表达 |
|---------|---------|
| 规划 PR | `规划一个 PR`、`准备提交贡献` |
| 寻找贡献机会 | `有什么可以贡献的`、`找 good-first-issue` |
| 实现功能修改 | `实现这个功能`、`修复这个 bug` |
| 记录开发日志 | `记录开发日志`、`更新 dev log` |
| 处理 Review 意见 | `处理 review 意见`、`回复评论` |
| 庆祝合并 | `PR 合并了`、`庆祝一下` |
| 提 PR 给世界项目 | `给 XX 项目提 PR`、`向上游贡献` |
| 开始二次开发 | `开始二次开发`、`基于这个项目做改进` |

**不触发**：选题发现（→ D1 Discover）、源码分析（→ D2 Dissect）、内容输出（→ D4 Document）。

---

## 二、核心能力

### 2.1 PR 规划与执行工作流

**六步工作流**：

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PR 规划与执行工作流                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: 定位目标                                                    │
│  ├── 从 D1 候选池中选取选题                                          │
│  ├── 确认目标仓库 & 贡献类型 (feat/fix/security/docs)                │
│  └── 检查仓库 CONTRIBUTING.md 指南                                   │
│         │                                                            │
│         ▼                                                            │
│  Step 2: Fork & Branch                                               │
│  ├── Fork 目标仓库 (如未 Fork)                                       │
│  ├── 创建特性分支 (遵循命名规范)                                     │
│  └── 同步上游最新代码                                                │
│         │                                                            │
│         ▼                                                            │
│  Step 3: 实现                                                        │
│  ├── 编码实现 (遵循项目代码风格)                                     │
│  ├── 编写/更新测试                                                   │
│  ├── 更新文档                                                        │
│  └── 本地验证 (测试通过 + lint 通过)                                 │
│         │                                                            │
│         ▼                                                            │
│  Step 4: 提交 PR                                                     │
│  ├── 编写 PR 描述 (使用模板)                                         │
│  ├── 关联 Issue (Fixes #xxx)                                         │
│  ├── 指定 Reviewer                                                   │
│  └── 添加标签                                                        │
│         │                                                            │
│         ▼                                                            │
│  Step 5: Review 响应                                                 │
│  ├── 监控 Review 评论                                                │
│  ├── 逐条响应 & 修改                                                 │
│  ├── 推送更新                                                        │
│  └── 请求 Re-review                                                  │
│         │                                                            │
│         ▼                                                            │
│  Step 6: 合并回顾                                                    │
│  ├── 确认合并                                                        │
│  ├── 记录开发日志                                                    │
│  ├── 提取可复用资产                                                  │
│  └── 庆祝 & 社交分享                                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 PR 分支命名规范

```yaml
branch_naming:
  pattern: "{type}/{short-description}"
  types:
    fix: "修复 Bug"
    feat: "新功能"
    security: "安全修复"
    docs: "文档更新"
    test: "测试相关"
    refactor: "重构"
  examples:
    - "fix/null-pointer-in-parser"
    - "feat/add-yaml-output-format"
    - "security/patch-xss-in-report"
    - "docs/update-install-guide"
    - "test/add-coverage-for-scanner"
    - "refactor/extract-validator"
  rules:
    - 使用小写字母和连字符
    - 简短但有描述性
    - 不超过 50 字符
```

### 2.3 PR 描述模板

```markdown
## 概述
<!-- 一句话描述这个 PR 做了什么 -->

## 变更类型
- [ ] Bug 修复 (fix)
- [ ] 新功能 (feat)
- [ ] 安全修复 (security)
- [ ] 文档更新 (docs)
- [ ] 重构 (refactor)
- [ ] 测试 (test)

## 变更详情
<!-- 详细描述变更内容、动机和实现方式 -->

## 关联 Issue
Fixes #

## 测试
<!-- 描述如何验证这些变更 -->
- [ ] 新增/更新了测试用例
- [ ] 本地测试通过
- [ ] CI 通过

## 检查清单
- [ ] 代码遵循项目编码规范
- [ ] 已更新相关文档
- [ ] 无引入新的 lint 警告
- [ ] 变更已自查

## 截图/日志 (如适用)
<!-- 添加截图或日志输出 -->
```

### 2.4 Issue 定位与贡献目标选择

**筛选策略**：

```yaml
issue_screening:
  sources:
    - label: "good first issue"
      priority: high
    - label: "help wanted"
      priority: high
    - label: "bug"
      priority: medium
    - label: "enhancement"
      priority: medium
    - label: "security"
      priority: high
  filters:
    state: open
    no_assignee: true
    created_within: 90d
    comments_gte: 0
```

**评估矩阵**：

```yaml
evaluation_matrix:
  dimensions:
    skill_match:
      weight: 0.30
      description: "与当前技术栈的匹配度"
    impact:
      weight: 0.25
      description: "对项目/社区的影响力"
    difficulty:
      weight: 0.20
      description: "实现难度 (反向评分: 越简单分越高)"
    content_value:
      weight: 0.15
      description: "作为内容素材的价值"
    maintainer_responsiveness:
      weight: 0.10
      description: "维护者响应速度"
```

### 2.5 源码修改与功能实现

**开发流程图**：

```
理解需求 (Issue/选题)
       │
       ▼
┌─────────────┐
│ 阅读相关代码 │ ← D2 Dissect 分析结果
└──────┬──────┘
       ▼
┌─────────────┐
│ 设计方案     │ → 记录到 dev-log
└──────┬──────┘
       ▼
┌─────────────┐
│ 编码实现     │ → 遵循项目风格 + commit 规范
└──────┬──────┘
       ▼
┌─────────────┐
│ 编写测试     │ → 单元测试 + 集成测试
└──────┬──────┘
       ▼
┌─────────────┐
│ 本地验证     │ → test + lint + build
└──────┬──────┘
       ▼
┌─────────────┐
│ 提交 & 推送  │ → 规范化 commit message
└─────────────┘
```

**Commit Message 规范**：

```yaml
commit_convention:
  format: "{type}({scope}): {subject}"
  types: [feat, fix, docs, style, refactor, perf, test, build, ci, chore]
  rules:
    - subject 不超过 72 字符
    - 使用祈使语气
    - 首字母不大写
    - 末尾不加句号
    - body 解释 why，不是 what
  examples:
    - "fix(parser): handle null byte in input stream"
    - "feat(scanner): add support for SPDX 3.0 format"
    - "security(auth): patch token validation bypass"
```

### 2.6 开发日志记录

**DevLog YAML Schema**：

```yaml
dev_log_schema:
  project_id: str            # 项目标识
  session_id: str            # 会话标识 (UUID)
  date: str                  # 日期 (ISO 8601)
  duration_hours: float      # 本次开发时长
  branch: str                # 工作分支
  commit_range: str          # 提交范围 (abc1234..def5678)

  sessions:
    - goal: str              # 本次目标
      achieved: bool         # 是否达成
      blockers: list[str]    # 遇到的阻碍
      solutions: list[str]   # 解决方案

  highlights:
    - type: str              # breakthrough | learning | gotcha | decision
      description: str       # 描述
      code_snippet: str      # 相关代码片段 (可选)

  metrics:
    lines_added: int
    lines_removed: int
    files_changed: int
    tests_added: int
    tests_passed: int
    coverage_delta: float    # 覆盖率变化

  documentary_assets:
    - type: str              # screenshot | diagram | log | benchmark
      path: str              # 资产路径
      description: str       # 描述
      reusable_in: list[str] # 可复用于 (video/blog/demo)
```

### 2.7 Review 响应处理

**响应流程**：

```
收到 Review 评论
       │
       ▼
┌─────────────────┐
│ 分类评论类型     │
│ ├── 代码修改请求 │ → 修改代码
│ ├── 疑问/讨论    │ → 回复解释
│ ├── 风格建议     │ → 采纳并修改
│ └── 设计分歧     │ → 讨论协商
└──────┬──────────┘
       ▼
┌─────────────────┐
│ 逐条响应         │
│ ├── 感谢反馈     │
│ ├── 说明修改方案 │
│ ├── 推送修改     │
│ └── 请求确认     │
└──────┬──────────┘
       ▼
┌─────────────────┐
│ 全部 Resolve 后  │
│ 请求 Re-review   │
└─────────────────┘
```

**响应模板**：

```yaml
response_templates:
  code_change_requested:
    template: |
      感谢指出！已按照建议修改:
      - {具体修改内容}
      - 提交: {commit_hash}
      请再看一下是否 OK。

  question:
    template: |
      好问题！这里的设计考虑是:
      {详细解释}
      你觉得需要调整吗？

  style_suggestion:
    template: |
      已采纳，修改见 {commit_hash}。谢谢！

  design_disagreement:
    template: |
      理解你的考虑。我的想法是:
      {理由}
      是否可以折中方案: {建议}？
```

### 2.8 合并庆祝与回顾

**回顾 YAML Schema**：

```yaml
merge_retrospective:
  project_id: str
  pr_url: str
  pr_number: int
  merged_at: str
  time_to_merge: str         # 从开 PR 到合并的时间
  reviewer_count: int
  review_rounds: int         # Review 轮次

  outcomes:
    - what_went_well: list[str]
    - what_can_improve: list[str]
    - lessons_learned: list[str]

  content_extraction:
    video_clips: list[str]   # 可用于视频的片段
    blog_topics: list[str]   # 可用于博客的话题
    demo_materials: list[str] # 可用于 Demo 的素材

  stats:
    total_commits: int
    total_files_changed: int
    total_lines_changed: int
    review_comments_resolved: int
```

---

## 三、质量门禁

```yaml
quality_gates:
  tests_pass:
    description: "所有测试通过"
    condition: "test_result == 'all_passed'"
    blocking: true
  code_style:
    description: "代码风格检查通过"
    condition: "lint_errors == 0"
    blocking: true
  pr_description:
    description: "PR 描述完整性"
    condition: "has_overview && has_test_plan && has_checklist"
    blocking: true
  dev_log_completeness:
    description: "开发日志完整性"
    condition: "has_sessions && has_highlights && has_metrics"
    blocking: false
  security_fix_verification:
    description: "安全修复需额外验证"
    condition: "security_fix_verified == true (仅 security 类型 PR)"
    blocking: true
```

---

## 四、输出规范

```
output/develop/{project-id}/
├── pr/
│   ├── pr-plan.yaml           # PR 规划
│   ├── pr-description.md      # PR 描述
│   └── review-responses.md    # Review 响应记录
├── dev-log/
│   ├── sessions/
│   │   └── {session-id}.yaml  # 各开发会话日志
│   └── summary.yaml           # 开发日志汇总
├── code/
│   ├── patches/               # 补丁文件
│   └── test-results/          # 测试结果
├── retrospective/
│   └── merge-retro.yaml       # 合并回顾
└── assets/
    ├── screenshots/           # 截图
    ├── diagrams/              # 图表
    └── logs/                  # 日志片段
```

---

## 五、依赖关系

| 依赖目标 | 依赖原因 | 调用方式 |
|----------|----------|----------|
| D1 Discover | 获取选题和贡献机会 | 内部传递 |
| D2 Dissect | 获取源码分析结果指导开发 | 内部传递 |
| 00-HOS-Sec-Engine | 安全修复验证 | API/本地调用 |
| D4 Document | 开发成果传递给内容输出 | 内部传递 |

---

## 六、集成代码

### 6.1 GitHub API — PR 管理器

```python
import requests

class GitHubPRManager:
    """GitHub PR 全生命周期管理。"""

    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.base = f"https://api.github.com/repos/{owner}/{repo}"

    def create_pr(self, title: str, body: str, head: str,
                  base: str = "main", draft: bool = False) -> dict:
        """创建 Pull Request。"""
        resp = requests.post(
            f"{self.base}/pulls",
            headers=self.headers,
            json={
                "title": title,
                "body": body,
                "head": head,
                "base": base,
                "draft": draft,
            },
        )
        resp.raise_for_status()
        return resp.json()

    def list_review_comments(self, pr_number: int) -> list[dict]:
        """获取 PR 的 Review 评论。"""
        resp = requests.get(
            f"{self.base}/pulls/{pr_number}/comments",
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()

    def reply_comment(self, comment_id: int, body: str) -> dict:
        """回复 Review 评论。"""
        resp = requests.post(
            f"{self.base}/pulls/comments/{comment_id}/replies",
            headers=self.headers,
            json={"body": body},
        )
        resp.raise_for_status()
        return resp.json()

    def check_ci_status(self, pr_number: int) -> dict:
        """检查 PR 的 CI 状态。"""
        resp = requests.get(
            f"{self.base}/commits/pr-{pr_number}/status",
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()
```

### 6.2 DevLog 记录器

```python
import yaml, uuid
from datetime import datetime
from pathlib import Path

class DevLogRecorder:
    """开发日志记录器。"""

    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.sessions_dir = self.output_dir / "dev-log" / "sessions"
        self.sessions_dir.mkdir(parents=True, exist_ok=True)

    def create_session(self, project_id: str, goal: str,
                       branch: str) -> dict:
        """创建新的开发会话。"""
        session = {
            "project_id": project_id,
            "session_id": str(uuid.uuid4())[:8],
            "date": datetime.now().isoformat(),
            "branch": branch,
            "sessions": [{"goal": goal, "achieved": False,
                          "blockers": [], "solutions": []}],
            "highlights": [],
            "metrics": {
                "lines_added": 0, "lines_removed": 0,
                "files_changed": 0, "tests_added": 0,
                "tests_passed": 0, "coverage_delta": 0.0,
            },
            "documentary_assets": [],
        }
        path = self.sessions_dir / f"{session['session_id']}.yaml"
        path.write_text(yaml.dump(session, allow_unicode=True),
                        encoding="utf-8")
        return session

    def add_highlight(self, session_file: str, htype: str,
                      description: str, code_snippet: str = ""):
        """添加开发亮点。"""
        path = self.sessions_dir / session_file
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        data["highlights"].append({
            "type": htype,
            "description": description,
            "code_snippet": code_snippet,
        })
        path.write_text(yaml.dump(data, allow_unicode=True),
                        encoding="utf-8")

    def update_metrics(self, session_file: str, **kwargs):
        """更新开发指标。"""
        path = self.sessions_dir / session_file
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        data["metrics"].update(kwargs)
        path.write_text(yaml.dump(data, allow_unicode=True),
                        encoding="utf-8")
```

### 6.3 Git 操作封装

```python
import subprocess

class GitOps:
    """Git 操作封装。"""

    def __init__(self, repo_path: str):
        self.repo_path = repo_path

    def _run(self, *args: str) -> str:
        result = subprocess.run(
            ["git"] + list(args),
            cwd=self.repo_path,
            capture_output=True, text=True, check=True,
        )
        return result.stdout.strip()

    def create_branch(self, branch_name: str) -> str:
        """创建并切换到新分支。"""
        return self._run("checkout", "-b", branch_name)

    def commit(self, message: str) -> str:
        """提交变更。"""
        self._run("add", "-A")
        return self._run("commit", "-m", message)

    def push(self, remote: str = "origin",
             branch: str = None) -> str:
        """推送到远程。"""
        args = ["push", remote]
        if branch:
            args.append(branch)
        return self._run(*args)

    def sync_upstream(self, upstream: str = "upstream",
                      branch: str = "main") -> str:
        """同步上游最新代码。"""
        self._run("fetch", upstream)
        return self._run("rebase", f"{upstream}/{branch}")

    def get_diff_stats(self, base: str = "main") -> dict:
        """获取当前分支与 base 的差异统计。"""
        stat = self._run("diff", "--stat", base)
        lines = self._run("diff", "--numstat", base)
        added = sum(int(l.split()[0]) for l in lines.splitlines() if l.split()[0] != "-")
        removed = sum(int(l.split()[1]) for l in lines.splitlines() if l.split()[1] != "-")
        return {"stat": stat, "lines_added": added, "lines_removed": removed}
```
