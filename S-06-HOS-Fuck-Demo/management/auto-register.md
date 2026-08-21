# Auto Register — 自动项目注册流程

> 流水线完成后，**自动**将项目注册到 `project-registry.json`。
> 不询问用户，不中断。

---

## 1. 触发条件

所有模式（create / demo / mvp / batch / manage new）的全部 STEP 执行完成后，**立即触发自动注册**。

---

## 2. 注册流程

```
全部 STEP 完成
  │
  1. 生成 project-id（规则见下文）
  2. 创建 output/{project-id}/ 目录结构
  3. 读取 project-registry.json
  4. 写入新项目条目
  5. 更新 meta 计数
  6. 创建项目目录结构（各子目录）
  7. 输出注册结果
```

### 2.1 Project ID 生成

```
格式: {type}-{seq:03d}-{keyword}

规则:
  type  = 来自模式或用户指定
          create → 按 direction 推断
          demo   → "demo"
          mvp    → "mvp"
          manage new → 用户指定
          batch  → 每个项目独立 type

  seq   = 从 project-registry.json 读取该 type 当前 seq，+1

  keyword = 从 direction 提取 2~3 个英文关键词
            连字符连接，小写
            例: "AI安全意识" → ai-safety
                "RBAC权限系统" → rbac-system
```

### 2.2 type 推断规则

| 用户指令 | type 推断 |
|---------|----------|
| direction 含"安全/安全/security" | `course` |
| direction 含"课/教程/课程" | `course` |
| direction 含"副业/赚钱" | `value` |
| direction 含"Demo/demo/演示" | `demo` |
| project 参数已含 type 前缀 | 取前缀（如 `course-002-xxx` → `course`）|
| 用户指定 type= | 取指定值 |
| 以上都不匹配 | `value` |

### 2.3 目录结构创建

自动用 IDE 原生 Bash(Mkdir) 创建：

```
output/{project-id}/
├── 01_content/
├── 02_ppt/
├── 03_audio/
├── 04_video/
└── README.md (由 auto-pipeline 生成)
```

---

## 3. Registry 写入

### 3.1 读取当前 registry

```yaml
操作:
  1. Read management/registry/project-registry.json
  2. 解析当前 meta 和 seq
```

### 3.2 生成新条目

```json
{
  "id": "{type}-{seq:03d}-{keyword}",
  "name": "{direction}",
  "type": "{type}",
  "status": "production",
  "depth": "{depth}",
  "style": "{style}",
  "emotion": "{emotion}",
  "created": "{today_date}",
  "updated": "{today_date}",
  "version": "1.0.0",
  "direction": "{direction}",
  "description": "{auto_summary}",
  "outputs": {
    "content": true,
    "ppt": {ppt_generated},
    "audio": {audio_generated},
    "video": {video_generated}
  },
  "tags": ["{type}", "{depth}"]
}
```

### 3.3 更新 meta

```json
{
  "lastUpdate": "{today_date}",
  "totalProjects": {previous_total + 1},
  "activeProjects": {previous_active + 1},
  "staleProjects": 0,
  "archivedProjects": {previous_archived}
}
```

### 3.4 递增 seq

```yaml
操作:
  seq.{type} = seq.{type} + 1
  例: seq.course 从 3 变为 4
```

---

## 4. Write 操作

全部计算完成后，用 IDE 原生 Write 工具 **一次写入新的 registry**：

```yaml
Write: management/registry/project-registry.json
内容: 完整更新的 JSON（meta + seq + projects[]）
```

---

## 5. 输出注册结果

注册完成后，在最终汇总报告中加入：

```markdown
📋 Project Registration
  • ID:     {project-id}
  • Type:   {type}
  • Status: production
  • Seq:    {type}-{seq:03d}
  • Files:  output/{project-id}/01_content/ ...
```

---

## 6. 注意事项

- ✅ 注册是自动的，不询问用户
- ✅ 旧 registry 先 Read 再 Write，不覆盖他人修改
- ✅ seq 永不复用（即使项目被 archived）
- ❌ 不修改已存在项目的数据（除非 manage update）
- ⚠️ 如果 registry 文件无法写入，输出注册数据并标注"需人工注册"
