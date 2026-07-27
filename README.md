# HOS Skill Workflow

HOS 技能工作流管理系统 - 集成各类自动化工具和技能

## 仓库结构

```
HOS_SKILL_WORKFLOW/
├── 01-HOS-TECH-ARCH/      # 技术架构模块
├── 02-HOS-LIFE-OKR/       # 生活 OKR 模块
│   └── HOS-QuizMaster/    # 智能刷题工具
├── 03-HOS-DEV-OPS/        # 开发运维模块
└── .github/workflows/     # CI/CD 工作流
```

## 模块说明

### 01-HOS-TECH-ARCH
技术架构相关技能和工具

### 02-HOS-LIFE-OKR
生活 OKR 管理工具，包含：
- **HOS-QuizMaster**: 智能刷题系统，支持多格式题库、AI 辅助学习、多模式刷题

### 03-HOS-DEV-OPS
开发运维自动化工具

## Skill 集成规范

每个 skill 需要包含：
1. `skill-manifest.yaml` - skill 元数据和接口定义
2. `README.md` - 使用说明
3. CLI 接口（支持 JSON 输出）
4. 完整的文档和示例

## CI/CD

使用 GitHub Actions 进行自动化：
- 代码检查
- 单元测试
- 构建验证
- 自动部署

## 许可证

MIT License
