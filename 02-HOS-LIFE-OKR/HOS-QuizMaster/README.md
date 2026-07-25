# HOS-QuizMaster

智能化刷题工具，支持多格式题库导入、AI 辅助学习、多模式刷题和知识点掌握度分析。

## 功能特性

- **多格式题库导入**：支持标准格式、编号格式、简化格式等多种题库格式
- **多模式刷题**：顺序模式、随机模式、记忆模式、测试模式、错题模式
- **AI 辅助学习**：集成 OpenAI API 和 Ollama，支持智能答疑和知识点解析
- **统计分析**：答题趋势、题型分析、难度分析、薄弱知识点识别
- **模拟卷生成**：支持自定义题型分布、难度分布和知识点范围
- **进度导出**：支持 JSON 和 Markdown 格式的学习进度导出
- **Skill 化接口**：标准化 CLI 接口，可被 HOS_SKILL_WORKFLOW 调用

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 启动 GUI

```bash
python cli/main.py start
```

### 导入题库

```bash
python cli/main.py import path/to/quiz.md
```

### 命令行刷题

```bash
python cli/main.py quiz --mode random --count 10
```

### 生成模拟卷

```bash
python cli/main.py generate --type single:20,multi:10,judge:20
```

### 查看统计

```bash
python cli/main.py stats --type all
```

## CLI 接口

所有命令支持 `--json` 标志，返回标准化 JSON 格式：

| 命令 | 说明 | 用法 |
|------|------|------|
| `start` | 启动 GUI | `python cli/main.py start [--mode MODE] [--file FILE]` |
| `import` | 导入题库 | `python cli/main.py import FILE [--format FORMAT]` |
| `quiz` | 命令行刷题 | `python cli/main.py quiz [--mode MODE] [--type TYPE] [--count N]` |
| `generate` | 生成模拟卷 | `python cli/main.py generate [--type TYPE] [--difficulty DIFF]` |
| `stats` | 统计分析 | `python cli/main.py stats [--type TYPE] [--format FORMAT]` |
| `export` | 导出进度 | `python cli/main.py export OUTPUT [--format FORMAT]` |

### JSON 输出格式

**成功响应：**
```json
{
  "status": "success",
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应：**
```json
{
  "status": "error",
  "data": null,
  "message": "错误描述"
}
```

## Skill 集成

HOS-QuizMaster 可作为标准化 skill 被 HOS_SKILL_WORKFLOW 的 02-HOS-LIFE-OKR 模块调用。

### 工作流配置示例

```yaml
# 02-HOS-LIFE-OKR/workflows/daily-quiz.yaml
actions:
  - name: 每日刷题
    action: quizmaster
    command: "python cli/main.py quiz --mode random --count 10 --json"
    schedule: "0 9 * * *"
    working_dir: "./HOS-QuizMaster"
```

详细集成指南请参考 [docs/workflow-integration.md](docs/workflow-integration.md)

## 目录结构

```
HOS-QuizMaster/
├── cli/                  # CLI 接口
│   └── main.py          # CLI 主入口
├── core/                # 核心业务逻辑
│   ├── quiz_manager.py  # 刷题管理器
│   ├── stats_analyzer.py # 统计分析器
│   └── ai_assistant.py  # AI 助手
├── data/                # 数据层
│   ├── database.py      # 数据库连接
│   └── dao.py           # 数据访问对象
├── parser/              # 题库解析器
│   └── smart_parser.py  # 智能解析器
├── ui/                  # 用户界面
│   ├── main_window.py   # 主窗口
│   └── widgets/         # UI 组件
├── docs/                # 文档
│   └── workflow-integration.md  # 工作流集成指南
├── skill-manifest.yaml  # Skill 元数据
└── requirements.txt     # 项目依赖
```

## 兼容性

- **HOS_SKILL_WORKFLOW**: >= 0.5
- **Python**: >= 3.8
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

## 许可证

MIT License
