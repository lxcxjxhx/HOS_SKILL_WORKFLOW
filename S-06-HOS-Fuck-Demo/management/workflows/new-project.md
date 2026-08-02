# Workflow: New Project — 新建项目标准流程

> 当用户输入 `manage new` 时执行此流程。
> 必须完成所有步骤才能视为项目注册成功。

---

## 流程步骤

### Step 1: 收集信息

使用 `management/registry/project-card.md` 中的引导问题：
1. 项目中文名
2. 类型
3. 方向描述
4. 深度
5. 风格
6. 钩子（可选，可之后补充）

### Step 2: 生成 ID

1. 读取 `project-registry.json` 的 `seq` 字段
2. 按 type 获取当前 seq + 1
3. 生成 ID: `{type}-{seq:03d}-{keyword}`
4. keyword: 从项目名中提取 2~3 个英文关键词

### Step 3: 预览确认

展示卡片预览（格式见 project-card.md）  
等待用户确认：

- Y → 继续
- N → 重新收集，修改字段
- 用户手动修改 → 按用户输入调整

### Step 4: 写入注册表

1. 读取 `project-registry.json`
2. 追加新项目条目
3. 更新 `seq[{type}]` +1
4. 更新 `lastUpdate`
5. 更新 `totalProjects` +1, `activeProjects` +1
6. 写回文件

### Step 5: 创建输出目录

```
output/{project-id}/
├── 01_content/
├── 02_ppt/        # depth ≥ L2
├── 03_audio/      # depth ≥ L1
└── 04_video/      # depth = L3
```

### Step 6: 生成项目章程

使用 `management/templates/project-charter.md` 模板  
写入 `output/{project-id}/project-charter.md`

---

## 完成通知

```markdown
✅ 项目注册完成！

📁 项目: {name} ({id})
📂 目录: output/{id}/
📊 状态: draft

后续步骤:
- 运行 `create direction=... depth=...` 开始生产内容
- 或运行 `manage update {id} status=planning` 进入规划阶段
```
