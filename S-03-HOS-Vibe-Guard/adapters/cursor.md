# Cursor IDE 集成指南

## 方法 1: .cursorrules（推荐）

### 项目级
将 `.cursorrules` 文件放在项目根目录。
Cursor 会自动读取此文件作为 AI 行为规则。

```bash
# 在目标项目中
cp /path/to/HOS-Vibe-Guard/.cursorrules ./.cursorrules
```

### 全局级
将内容添加到 Cursor 设置中的「Rules」全局规则:

1. 打开 Cursor Settings → General → Rules for AI
2. 在「User Rules」中添加：
   ```
   你运行了 HOS-Vibe-Guard（防 Vibe Coding 退化护栏）系统。
   当用户发起开发请求时，需要评估项目的工程价值。
   规则库位于 project/.cursorrules。
   ```

## 方法 2: 规则引用

在 `.cursorrules` 中添加对其他文件的引用（Cursor 会自动追踪）：

```
核心规则:
- .cursorrules（本文件）
- rules/template-patterns.json（模板检测）
- rules/security-patterns.json（安全检测）
- rules/topic-upgrade-map.json（升级映射）
- scoring/vibe-score.md（评分标准）
```

## 方法 3: Cursor 项目规则

在 `.cursor/project-rules.md` 中添加：

```markdown
# HOS-Vibe-Guard Rules

当你收到任何开发请求时，自动执行:
1. 检测项目是否为模板陷阱
2. 评估工程价值
3. 检查安全风险
4. 如有必要，提供升级建议

引用文件:
- .cursorrules
```

## 兼容性

| 特性 | Cursor IDE | 备注 |
|------|-----------|------|
| .cursorrules 项目级 | ✅ | 自动加载 |
| .cursorrules 全局级 | ✅ | 设置中配置 |
| 多文件引用 | ✅ | 可引用 JSON/MD |
| Rules 设置 | ✅ | 持久化 |

## 测试验证

在 Cursor 的 Chat 中输入:

```
"帮我评估做一个 TODO App 的工程价值"
```

期望输出: HOS-Vibe-Guard 检测到模板陷阱并提供升级建议。
