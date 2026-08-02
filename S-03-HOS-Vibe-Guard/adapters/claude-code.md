# Claude Code 集成指南

## 方法 1: 项目级 CLAUDE.md（推荐）

将本系统的 `SKILL.md` 核心内容与 `CLAUDE.md` 文件放在项目根目录。
Claude Code 启动时会自动从 `CLAUDE.md` 加载系统提示。

```bash
# 在目标项目中
cp /path/to/HOS-Vibe-Guard/CLAUDE.md ./CLAUDE.md
```

## 方法 2: Claude Code 配置 Hook

在 `.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "BeforeCommand": {
      "description": "HOS-Vibe-Guard: 检测开发请求",
      "command": "cat /path/to/HOS-Vibe-Guard/SKILL.md"
    }
  },
  "customInstructions": {
    "file": "/path/to/HOS-Vibe-Guard/SKILL.md"
  }
}
```

## 方法 3: 全局加载（推荐）

将 HOS-Vibe-Guard 注册为全局 Skill：

```bash
# 在 ~/.claude/settings.json 中添加
{
  "skills": {
    "vibe-guard": {
      "path": "/path/to/HOS-Vibe-Guard",
      "autoLoad": true,
      "trigger": "user:development_request"
    }
  }
}
```

## 方法 4: 手动引用

在对话中使用 `/vibe-guard` 命令加载，或要求 Claude「加载 HOS-Vibe-Guard 系统」。

## 兼容性

| 特性 | Claude Code | 备注 |
|------|------------|------|
| CLAUDE.md 自动加载 | ✅ | 推荐方式 |
| Hook 系统 | ✅ | 需要设置 |
| Global Skill | ✅ | 持续有效 |
| .env 配置 | ✅ | 支持环境变量 |

## 测试验证

```bash
# 测试是否加载成功
claude -p "检查 HOS-Vibe-Guard 是否激活"

# 手动触发检测
claude -p "帮我评估一个 TODO App 的工程价值"

# 安全检查
claude -p "扫描当前项目中的安全隐患"
```
