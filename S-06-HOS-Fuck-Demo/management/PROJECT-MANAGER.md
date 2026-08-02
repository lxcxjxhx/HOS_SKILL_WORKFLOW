# HOS Project Manager — 主项目管理器

> **多项目管理系统** — 管理所有 Demo 项目和视频制作资产。
> 防止命名冲突、状态混乱、版本失控、出品不一致。
>
> 进入 `manage` 模式时**必须**读取本文件。

---

## 1. 核心概念 Core Concepts

### 项目类型

| 类型代码 | 名称 | 说明 |
|---------|------|------|
| `course` | 课程 | 系统化知识课程 |
| `value` | 价值观 | 观点/价值观类内容 |
| `demo` | 技术演示 | 技术 Demo 项目 |
| `audiobook` | 有声书 | 音频内容 |
| `short` | 短视频 | 短视频脚本素材 |

### 项目状态机

```
                    ┌─────────┐
                    │  draft  │ ← 初始状态
                    └────┬────┘
                         ↓
                    ┌──────────┐
                    │ planning │ ← 章程已填写
                    └────┬─────┘
                         ↓
                    ┌────────────┐
                    │ production │ ← 生成中/制作中
                    └────┬───────┘
                         ↓
                    ┌────────┐
                    │ review │ ← 内容审核
                    └───┬────┘
                    ┌───┴───┐
                    ↓       ↓
              ┌─────────┐ ┌──────┐
              │published│ │failed│
              └────┬────┘ └──┬───┘
                   ↓         ↓
              ┌─────────┐ ┌─────────┐
              │ archived│ │ archived│
              └─────────┘ └─────────┘
```

### 生命周期规则

| 规则 | 说明 |
|------|------|
| 一个项目一次只能在一个状态 | 不允许双重状态 |
| `production` 状态不可修改元信息 | 名称/类型/方向锁定 |
| `archived` 项目只读 | 不可恢复为活跃状态 |
| `failed` 的项目 | 需创建新卡片重新开始 |
| 超过 30 天未更新的 `draft` | 自动标记为 `stale` |

### 自动注册集成

流水线生成的项目自动通过 `management/auto-register.md` 流程注册：

```
create/demo/mvp pipeline 完成后
  → auto-register.md 自动执行
  → 生成 project-id
  → 写入 registry
  → 创建目录结构
  → 无需用户手动操作
```

---

## 2. 命名规范 Naming Convention

### 项目 ID 格式

```
{type}-{seq:03d}-{short-keyword}
```

| 部分 | 规则 | 示例 |
|------|------|------|
| type | 项目类型代码 | `course` |
| seq | 3 位序列号，自动递增 | `001` |
| short-keyword | 2~4 个英文单词，连字符连接 | `ai-security` |

**完整示例**: `course-001-ai-security`, `demo-003-rbac-system`, `short-007-fear-of-ai`

### 目录命名

```
/output/{project-id}/
```

### 文件名命名

```
{project-id}-{type}-{seq}.{ext}
```

示例：
```
course-001-ai-security-idea-1.md
course-001-ai-security-slide.json
course-001-ai-security-script.txt
course-001-ai-security-render-spec.json
```

### 禁止规则

| ❌ 禁止 | 原因 |
|---------|------|
| 两个项目同 ID | 唯一性约束 |
| 项目名含中文/空格/特殊字符 | 路径兼容 |
| 覆盖已有目录 | 数据安全 |
| ID 中 seq 重复 | 序列递增约束 |
| 超长文件名 (>120 字符) | Windows 路径限制 |

---

## 3. 项目注册表 Registry

### 事实来源

所有项目的权威数据存储在 `management/registry/project-registry.json`。

### 注册表结构

```json
{
  "meta": {
    "lastUpdate": "2026-06-30T12:00:00Z",
    "totalProjects": 5,
    "activeProjects": 3,
    "staleProjects": 1,
    "archivedProjects": 1
  },
  "seq": {
    "course": 3,
    "demo": 5,
    "short": 8,
    "value": 2,
    "audiobook": 1
  },
  "projects": [
    {
      "id": "course-001-ai-security",
      "name": "AI安全入门",
      "type": "course",
      "status": "production",
      "depth": "L2",
      "style": "academic",
      "emotion": null,
      "created": "2026-06-28",
      "updated": "2026-06-30",
      "version": "1.1.0",
      "direction": "AI安全意识教育",
      "description": "面向开发者的AI安全意识课程",
      "outputs": {
        "content": true,
        "ppt": true,
        "audio": false,
        "video": false
      },
      "tags": ["security", "beginner"]
    }
  ]
}
```

### 操作规则

- **新建（自动）** → 流水线完成后，`auto-register.md` 自动分配 seq、写入新条目、创建目录
- **新建（手动）** → `manage new project=X type=Y depth=Z` → 读取 `management/workflows/new-project.md` 执行
- **更新** → 修改字段 + 更新 `updated` + `meta.lastUpdate`
- **删除** → 设置 status = `archived`，不移除记录
- **seq 管理** → 按 type 自增，永不复用已归档的 seq

---

## 4. 状态管理 Status Management

### 状态转换表

| 当前 | → 可转为 | 条件 |
|------|---------|------|
| draft | planning | 项目章程已填写 |
| planning | production | 内容钩子已确认 + 模板已选 |
| production | review | 内容包已生成 |
| review | published | 审核通过 |
| review | failed | 审核不通过 |
| published | archived | 发布后或手动归档 |
| failed | archived | 确认放弃 |
| draft | archived | 直接废弃（超 30 天 stale） |

### 全局状态查询

用户输入 `manage status` 或 `status` 时：

```
📊 HOS Project Status Board
═══════════════════════════════
🟢 Published (2)
  • demo-001-cli-tool     v2.0.0  2026-06-25
  • course-001-ai-secu…   v1.0.0  2026-06-20

🟡 Production (2)
  • course-002-adv-sec    v1.1.0  2026-06-28
  • short-005-ai-future   v0.5.0  2026-06-29

🟠 Planning (1)
  • demo-004-rbac-system  —       2026-06-22  ← ⚠️ 超过 7 天未更新

⚪ Draft (1)
  • short-006-gpt-tips    —       2026-06-30

🔴 Failed (1)
  • course-003-web-crawl  —       2026-06-15  ← 已放弃，建议归档

📌 活跃: 3 / 总计: 7  |  ⚠️ stale: 1
```
