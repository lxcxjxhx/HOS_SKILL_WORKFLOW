---
name: HOS-Release-Notes
description: "HOS Release Notes 生成器 — 从 git log / PRs / issues 自动生成高质量版本说明"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [release-notes, changelog, semver, GitHub-Release]
  category: content-production
  risk-level: low
---

# hos-release-notes

## Description
HOS 生态 Release Notes 生成器。从 git log、merged PRs、closed issues 中自动生成高质量的 Release Notes，格式对标主流开源项目（如 VS Code、Next.js），每个 Release 都像一篇完整的博客文章。

## Trigger
当用户提到以下关键词时激活：
- "release notes"、"版本说明"、"changelog"
- "发布"、"发版"、"新版本"
- "写 release"、"生成 changelog"

## Context

### HOS 生态版本策略
- **HOS-Forge**: 旗舰 IDE，版本号遵循 semver，major 版本对应架构升级
  - v1.0: AI Coding Agent
  - v2.0: Security Agent Framework
  - v3.0: AI Security Engineer
- **HOS-LS**: 分析引擎，minor 版本对应新语言/规则支持
- **HOS_SKILL_WORKFLOW**: 工作流库，patch 频率高，每个 workflow 可独立版本

### 仓库路径
- HOS-Forge: `c:\1AAA-PROJECT\HOS\HOS-Forge`
- HOS-LS: `c:\1AAA-PROJECT\HOS\HOS-LS`
- HOS_SKILL_WORKFLOW: `c:\1AAA-PROJECT\WORKFLOW`

## Workflow

### Step 1: 确定版本范围
```powershell
# 获取上一个 tag 到当前的所有变更
git -C "<repo_path>" log <last_tag>..HEAD --oneline

# 获取上一个 tag 的时间
git -C "<repo_path>" log -1 --format=%ai <last_tag>

# 获取 merged PRs
gh pr list --repo <owner/repo> --state merged --search "merged:>=<last_tag_date>"

# 获取 closed issues
gh issue list --repo <owner/repo> --state closed --search "closed:>=<last_tag_date>"
```

### Step 2: 分类变更
将每个 commit/PR 归入以下类别：

| 类别 | Emoji | 说明 |
|------|-------|------|
| **Breaking Changes** | ⚠️ | 不兼容的 API/配置变更 |
| **New Features** | ✨ | 新功能 |
| **Improvements** | ♻️ | 性能优化、体验改进 |
| **Bug Fixes** | 🐛 | Bug 修复 |
| **Security** | 🔒 | 安全相关修复/改进 |
| **Documentation** | 📚 | 文档更新 |
| **Internal** | 🔧 | 内部重构、CI/CD 改进 |
| **Upstream Sync** | 🔄 | 上游同步/贡献 |

### Step 3: 生成 Release Notes
使用以下模板：

```markdown
# <Project> <version> — <codename or tagline>

> 一句话总结这个版本的核心价值。

**Release Date**: <date>
**Compatibility**: <compatible_versions>

---

## Highlights

### <highlight_1_title>
<2-3 句描述，包含具体数据和用户价值>

### <highlight_2_title>
<2-3 句描述>

---

## What's New

### <feature_category>
- **<feature_name>**: <description> (<pr_number>)
- ...

## Improvements
- <improvement_description> (<pr_number>)
- ...

## Bug Fixes
- <fix_description> — fixes #<issue_number>
- ...

## Security
- <security_fix_description> — CVE-<id> (if applicable)

## Breaking Changes
> 如果有，详细说明迁移步骤

## Documentation
- <doc_update_description>

## Upstream Contributions
- <contribution_to_upstream>

---

## Stats
- **Commits**: <count>
- **Contributors**: <list>
- **Issues Closed**: <count>
- **PRs Merged**: <count>

## What's Next
<next_version_plans, 2-3 条>

---

**Full Changelog**: <compare_url>
```

### Step 4: 生成配套内容
每个 Release 同时产出：

| 配套内容 | 用途 |
|---------|------|
| **Discussion Post** | GitHub Discussions 公告帖 |
| **Social Media Thread** | X/Twitter 线程（每条 ≤ 280 字符） |
| **中文摘要** | CSDN/社交平台同步 |
| **Migration Guide** | 如果有 Breaking Changes |

## Rules
1. Release Notes 语言默认英文（面向国际开源社区）
2. 每个条目必须关联 PR 编号或 Issue 编号
3. Breaking Changes 必须在最前面，且提供迁移步骤
4. 必须包含 Stats 部分（commits、contributors、issues）
5. 必须包含 What's Next 部分，展示项目活跃度
6. Highlights 不超过 3 个，每个配具体数据
7. 输出保存到 `c:\1AAA-PROJECT\BOS\BOS-OPER\hos-skills\output\releases\` 目录

## Example

```markdown
# HOS-LS v0.4.0 — Java AST Era

> Java analysis gets 68% cheaper. 12 new OWASP rules. Windows fixed.

**Release Date**: 2026-07-27
**Compatibility**: Python 3.10+, Java 11+ (target)

---

## Highlights

### AST Pre-filtering: 68% Token Reduction
Java files no longer need to be fed whole. The new AST pre-filter extracts only security-relevant nodes (method declarations, input handling, crypto ops), reducing average token count from 28,000 to 9,000 per file.

### 12 New OWASP Top 10 Rules
Coverage expanded to include A01:2021–A10:2021 with refined detection logic.

### Windows Compatibility
Resolved encoding issues in YAML loader and error message fallback paths.

---

## What's New

### Analysis Engine
- **Java AST Pre-filter**: Extracts security-relevant nodes before LLM analysis (#45)
- **12 OWASP Rules**: A01 through A10 coverage with 2021 mapping (#43)
- **Prompt Cache**: Reusable prompt templates across analysis sessions (#41)

## Bug Fixes
- Windows YAML encoding — fixes #38
- Error message fallback in runner.py and models.py (#40)

## Stats
- **Commits**: 47
- **Issues Closed**: 8
- **PRs Merged**: 5

## What's Next
- Rust language support (parser scaffold)
- AI Review mode (automated PR security review)
```
