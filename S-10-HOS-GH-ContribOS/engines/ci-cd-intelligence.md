# 引擎一：CI/CD Intelligence Engine

> 本文件是 HOS-GH-ContribOS 引擎一的完整内容，由 `SKILL.md` 引用。负责 GitHub Actions 工作流的解析、安全审查、失败调试与自动修复。

## 1.1 Workflow AST 解析

将 GitHub Actions workflow YAML 解析为可操作的抽象语法树，支持解析、修改、生成与 diff。

**输入**：`.github/workflows/*.yml`  
**输出**：结构化 Workflow 对象

```python
# 解析流程
yaml_content → PyYAML → raw_dict → WorkflowAST → Workflow Object

# 关键数据结构
Workflow(
  name="CI",
  trigger=TriggerConfig(
    push=PushTrigger(branches=["main"]),
    pull_request=PRTrigger(types=["opened", "synchronize"])
  ),
  permissions=PermissionConfig(default="read", jobs={...}),
  jobs={
    "build": Job(
      runs_on="ubuntu-latest",
      permissions=JobPermission(...),
      steps=[
        Step(name="Checkout", uses="actions/checkout@v4"),
        Step(name="Test", run="pytest --cov=src")
      ],
      env={"PYTHON_VERSION": "3.11"}
    )
  }
)
```

**已知陷阱与修复**：
- PyYAML 将 `on:` 键解析为布尔值 `True`，必须同时检查 `data.get("on")` 和 `data.get(True)`
- `permissions: write-all` 是高危配置，需标记为 CRITICAL
- `pull_request_target` 存在安全风险（可访问 secrets），需标记为 HIGH

## 1.2 安全审查规则（7 条）

| 规则 ID | 名称 | 级别 | 检测内容 | 修复建议 |
|---------|------|------|---------|---------|
| E001 | 废弃命令 | ERROR | `::set-env`、`::set-output` 等已废弃的 workflow command | 迁移到 `$GITHUB_ENV`、`$GITHUB_OUTPUT` |
| E002 | 硬编码密钥 | ERROR | token/password/api_key/secret 等硬编码值 | 使用 `${{ secrets.XXX }}` |
| W001 | 根权限缺失 | WARNING | workflow 级别缺少 `permissions` 配置 | 添加 `permissions: contents: read` |
| S001 | Step 命名缺失 | WARNING | step 缺少 `name` 字段 | 添加描述性 name |
| SEC001 | write-all 权限 | CRITICAL | `permissions: write-all` | 替换为最小权限 |
| SEC002 | pull_request_target | HIGH | 使用 `pull_request_target` 触发器 | 评估是否可替换为 `pull_request` |
| SEC003 | Action 版本未锁定 | MEDIUM | 第三方 Action 使用 `@main` | 锁定到具体版本标签 `@v4` |

## 1.3 CI 调试知识库

基于实战积累的 CI 失败模式 → 修复映射：

| 失败类型 | 根因 | 修复方法 | 预防手段 |
|---------|------|---------|---------|
| Lint 失败 | 代码格式不符合规范 | `pre-commit run --all-files` | 本地安装 pre-commit hooks |
| 测试失败 | 测试用例逻辑错误 | 检查断言和 mock 设置 | 本地先跑通 `pytest -v` |
| 构建失败 | 依赖冲突或版本不兼容 | 检查 requirements/setup 文件 | 使用 lock 文件锁定版本 |
| CLA 未签署 | 项目要求 CLA 但未签 | 签署 CLA（个人/企业） | 提交前检查项目 CLA 要求 |
| codecov 失败 | 覆盖率下降 | 补充测试用例 | 确保新代码有测试覆盖 |
| 首次贡献者 CI 阻塞 | 维护者需手动批准 | 等待维护者在线 | 选择有自动 CI 的项目 |
| Node 版本不兼容 | Action 要求更高 Node 版本 | 升级 runner 或 Action 版本 | 使用 `@v4` 以上版本 |

## 1.4 自动修复引擎

```
CI 失败日志
  ↓
错误模式匹配（正则 + 关键词）
  ↓
知识库查询 → 匹配修复方案
  ↓
生成修复 patch
  ↓
本地验证 → 通过 → 提交修复 commit
         → 失败 → 标记为需人工介入
```

## 1.5 权限分级系统

| 级别 | 名称 | 适用角色 | 能力边界 |
|------|------|----------|---------|
| Level 0 | 只读分析 | 所有人 | 分析仓库、生成报告、查看数据 |
| Level 1 | 建议模式 | 初次贡献者 | 生成 PR 草稿和 CI/CD 建议，需人工确认 |
| Level 2 | 半自动 | 贡献者 | 低风险操作自动执行，中高风险需审批 |
| Level 3 | 高度自动 | 维护者 | 中低风险自动操作，支持自动合并 |
| Level 4 | 完全自主 | Project Owner | 所有操作自动执行，仅 CRITICAL 需审批 |
