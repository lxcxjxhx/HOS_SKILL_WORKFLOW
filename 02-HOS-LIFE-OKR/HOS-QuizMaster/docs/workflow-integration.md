# HOS-QuizMaster 工作流集成指南

本文档说明如何将 HOS-QuizMaster 集成到 HOS_SKILL_WORKFLOW 的 02-HOS-LIFE-OKR 模块中。

## 概述

HOS-QuizMaster 作为标准化 skill 被 02-HOS-LIFE-OKR 工作流调用，实现学习任务的自动化调度和执行。

## 前置条件

1. Python 3.8+ 已安装
2. HOS-QuizMaster 已克隆到本地
3. 依赖已安装：`pip install -r requirements.txt`
4. 题库已导入（通过 GUI 或 CLI `import` 命令）

## 在 02-HOS-LIFE-OKR 中配置

### 基本配置

在工作流 YAML 文件中添加 quizmaster action：

```yaml
# 02-HOS-LIFE-OKR/workflows/daily-quiz.yaml
actions:
  - name: 每日刷题
    action: quizmaster
    command: "python cli/main.py start --mode random --count 10"
    schedule: "0 9 * * *"
    working_dir: "./HOS-QuizMaster"
```

### 定时任务配置

#### 每日随机刷题

```yaml
- name: 每日刷题
  action: quizmaster
  command: "python cli/main.py quiz --mode random --count 10"
  schedule: "0 9 * * *"
  description: "每天 9 点随机刷 10 题"
```

#### 每周知识点复习

```yaml
- name: 每周复习
  action: quizmaster
  command: "python cli/main.py generate --type single:10,multi:5,judge:5"
  schedule: "0 20 * * 5"
  description: "每周五晚 8 点生成模拟卷"
```

#### 月度统计报告

```yaml
- name: 月度统计
  action: quizmaster
  command: "python cli/main.py stats --type all --format json"
  schedule: "0 21 1 * *"
  description: "每月 1 号生成统计报告"
```

### 触发式任务配置

#### 薄弱知识点强化

```yaml
- name: 知识点强化
  action: quizmaster
  trigger: "on_weak_point_detected"
  command: "python cli/main.py quiz --mode wrong --count 5"
  description: "检测到薄弱知识点时自动复习错题"
```

#### 模拟考试

```yaml
- name: 模拟考试
  action: quizmaster
  trigger: "weekly"
  command: "python cli/main.py quiz --mode test --count 50"
  description: "每周进行一次模拟考试"
```

## CLI 命令参考

| 命令 | 说明 | 用法 |
|------|------|------|
| `start` | 启动 GUI | `python cli/main.py start [--mode MODE] [--file FILE]` |
| `import` | 导入题库 | `python cli/main.py import FILE [--format FORMAT]` |
| `quiz` | 命令行刷题 | `python cli/main.py quiz [--mode MODE] [--type TYPE] [--count N]` |
| `generate` | 生成模拟卷 | `python cli/main.py generate [--type TYPE] [--difficulty DIFF]` |
| `stats` | 统计分析 | `python cli/main.py stats [--type TYPE] [--format FORMAT]` |
| `export` | 导出进度 | `python cli/main.py export OUTPUT [--format FORMAT]` |

### JSON 输出格式

所有命令支持 `--json` 标志，返回标准化 JSON：

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

## 故障排查

### 常见问题

**Q: CLI 命令返回 "题库为空"**
A: 请先导入题库：`python cli/main.py import path/to/quiz.md`

**Q: JSON 输出格式不正确**
A: 确保使用 `--json` 标志，并检查 Python 版本 >= 3.8

**Q: 工作流无法找到 quizmaster**
A: 检查 `working_dir` 配置是否指向 HOS-QuizMaster 根目录

**Q: 数据库文件找不到**
A: 使用 `--db` 参数指定数据库路径，默认为 `quizmaster.db`

### 日志查看

日志文件位于 `HOS-QuizMaster/logs/app.log`，可通过以下命令查看：

```bash
tail -f logs/app.log  # Linux/macOS
Get-Content logs/app.log -Wait  # Windows PowerShell
```

## 兼容性

- HOS_SKILL_WORKFLOW: >= 0.5
- Python: >= 3.8
- 操作系统: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
