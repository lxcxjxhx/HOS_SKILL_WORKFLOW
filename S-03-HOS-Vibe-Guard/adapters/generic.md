# 通用 AI IDE 集成指南

## 兼容性矩阵

| IDE | 配置文件 | 加载方式 | 支持级别 |
|-----|---------|---------|---------|
| Claude Code | CLAUDE.md | 自动加载 | 🟢 原生 |
| Cursor | .cursorrules | 自动加载 | 🟢 原生 |
| Windsurf | .windsurfrules | 自动加载 | 🟢 原生 |
| GitHub Copilot | .github/copilot-instructions.md | 自动加载 | 🟡 部分支持 |
| JetBrains AI | .idea/ai-rules.xml | 手动配置 | 🟡 部分支持 |
| Codeium / Supermaven | AI 设置 | 手动配置 | 🟡 部分支持 |
| VSCode Copilot Chat | .vscode/settings.json | 手动配置 | 🟡 部分支持 |
| Tabnine | 项目规则 | 手动配置 | 🔴 有限支持 |

## 快速适配指南

### GitHub Copilot

在项目根目录创建 `.github/copilot-instructions.md`：

```markdown
## HOS-Vibe-Guard 规则

当用户发起开发请求时，请按以下规则评估:

### 模板陷阱检测
以下类型的项目应被识别为"低工程价值"方向：
- Todo / Task Manager
- 番茄钟 / 计时器
- 贪吃蛇 / 2048 / Flappy Bird 克隆
- 标准 CRUD 管理系统
- 博客 / CMS
- 商城 Demo

### 安全检测
检查代码中是否有：
- API Key 硬编码
- Token 明文存储
- 测试数据使用真实个人信息

### 输出规则
- 检测到模板 → 提供升级建议
- 检测到安全风险 → 警告并推荐替代方案
- 高质量项目 → 静默通过
```

### JetBrains AI

1. 安装 AI Assistant 插件
2. 在 Settings → Tools → AI Assistant → Custom Rules 中添加：

```
Project rules: 应用 HOS-Vibe-Guard 系统规则
当用户发起新项目请求时，检查是否为模板陷阱项目。
如有需要，提供架构升级建议和安全检查。
检测规则参考 project 根目录下的 rules/template-patterns.json
```

### VSCode + Copilot Chat

在 `.vscode/settings.json` 中添加：

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "你运行了 HOS-Vibe-Guard 系统。当收到开发请求时，评估项目是否为低价值模板项目。"
    }
  ]
}
```

## 最小通用配置

如果 AI IDE 不支持高级配置，最小配置只需要告知 AI 三条规则：

```text
【三条规则】
1. 当我提出项目想法时，评估它是否属于 Todo / 番茄钟 / 贪吃蛇 / CRUD / 博客等模板项目
2. 如果是模板项目，建议一个更有工程深度的升级方向
3. 检查代码中是否有 API Key 硬编码等安全风险
```

## 配置检查清单

- [ ] IDE 是否支持自定义 AI 规则？
- [ ] 是否已配置对应的配置文件？
- [ ] 配置文件路径是否正确？
- [ ] 是否需要引用外部 JSON 规则文件？
- [ ] 是否设置了环境变量（如需）？
- [ ] 是否测试了触发条件？
