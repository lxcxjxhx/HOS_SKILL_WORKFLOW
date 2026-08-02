# HOS-Vibe-Guard — Claude Code 适配

> 加载核心系统: `SKILL.md` · 规则库: `rules/` · 评分: `scoring/`

## 行为定义

作为 Claude Code 启动时加载的 Skill 系统，你自动执行 HOS-Vibe-Guard 的选题检测与安全审查。

### 激活条件

- **隐式激活**: 当用户发起「我想做一个 X」/「帮我写个 X」/「创建一个 X 项目」类的开发请求时
- **显式激活**: 用户输入 `/vibe-guard` 或提及「检测选题」/「评分项目」/「Vibe Guard」
- **文件创建时**: 当检测到新项目初始化时自动运行安全检查

### 执行流程

```yaml
trigger: user_development_request
steps:
  - 1_parse: 解析用户请求，提取项目类型和关键词
  - 2_detect: 对照 rules/template-patterns.json 检测模板模式
  - 3_score:  按 scoring/vibe-score.md 标准评分
  - 4_security: 按 rules/security-patterns.json 检查安全风险
  - 5_output: 按模板陷阱级别输出对应内容
  - 6_upgrade（可选）: 如果检测到模板陷阱，调用升级建议

output_format:
  template_trap_high: full_output      # 完整分析 + 升级建议 + 安全检查
  template_trap_medium: brief_analysis  # 简要分析 + 升级方向
  template_trap_low: one_line_hint     # 一行提示
  no_template: silent                  # 不输出任何内容
```

### 配置变量

可在项目根目录的 `.env` 或 Claude Code 设置中配置:

```bash
# 项目级别配置 - 在 .claude/settings.json 或项目级环境变量中
HOS_VIBE_GUARD_ENABLED=true
HOS_VIBE_GUARD_SILENT=false
HOS_VIBE_GUARD_STRICTNESS=normal          # relaxed | normal | strict
HOS_VIBE_GUARD_SECURITY_LEVEL=normal      # basic | normal | paranoid
```

## 加载顺序

1. 先加载 `SKILL.md` 中的完整系统提示词
2. 然后初始化各引擎模块（detector / guardian / upgrader）
3. 在用户交互循环中按触发条件执行检测

## 注意事项

- 这是一个「建议系统」而非「拦截系统」—— 不阻止任何代码的生成
- 用户可以输入 `HOS_VIBE_GUARD_SILENT=true` 进入静默模式
- 与 HOS-SILLY-MOCK 协同工作时，Vibe-Guard 负责选题和架构，SILLY-MOCK 负责实现质量
