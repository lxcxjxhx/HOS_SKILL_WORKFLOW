# Windsurf IDE 集成指南

## 方法 1: .windsurfrules（推荐）

将 `.windsurfrules` 文件放在项目根目录。
Windsurf 的 Cascade AI 会自动读取此文件作为行为规则。

```bash
# 在目标项目中
cp /path/to/HOS-Vibe-Guard/.windsurfrules ./.windsurfrules
```

## 方法 2: Windsurf 全局规则

在 Windsurf 设置中添加全局规则：

1. 打开 Windsurf → Settings → AI Rules
2. 在 Global Rules 中添加：
   ```
   加载项目中的 .windsurfrules 规则
   ```

## 方法 3: 项目级 Cascade 指令

在项目 README 或 CONTRIBUTING.md 中添加标记，
让 Cascade AI 识别 HOS-Vibe-Guard 的存在：

```markdown
<!-- HOS-Vibe-Guard active -->
```

## 兼容性

| 特性 | Windsurf IDE | 备注 |
|------|-------------|------|
| .windsurfrules 项目级 | ✅ | 自动加载 |
| 全局规则 | ✅ | 设置中配置 |
| 多级规则层叠 | ✅ | 全局 + 项目级 |

## 测试验证

在 Windsurf Cascade 中输入：

```
我想做一个番茄钟 + 待办管理
```

期望输出: HOS-Vibe-Guard 提示此方向为模板陷阱，并提供行为状态建模系统作为升级方向。
