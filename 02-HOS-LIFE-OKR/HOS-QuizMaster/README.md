# HOS-QuizMaster V2

> 智能化刷题工具，支持多格式题库导入、AI 辅助学习、多模式刷题和知识点掌握度分析

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 启动 GUI
python main.py

# CLI 模式
python cli.py start                    # 启动交互式刷题
python cli.py quiz --mode random       # 随机模式刷题
python cli.py generate --topic "网络安全" --count 5  # AI 生成题目
python cli.py stats                    # 查看统计报告
```

## 核心功能

### 1. 多格式题库支持
- **智能解析器**：自动识别多种 Markdown 题库格式
- **图片处理**：支持图片提取、锐化增强
- **批量导入**：一次导入整个题库目录

```python
from parser.smart_parser import SmartParser

parser = SmartParser()
questions = parser.parse("path/to/quiz.md")
```

### 2. 多模式刷题
- **顺序模式**：按题目顺序依次作答
- **随机模式**：随机抽取题目
- **背题模式**：直接显示答案，快速记忆
- **测试模式**：限时答题，模拟考试
- **错题模式**：专注错题，针对性练习

```python
from core.quiz_manager import QuizManager

manager = QuizManager()
manager.load_from_file("quiz.md")
manager.set_mode('random')  # 切换模式
```

### 3. AI 智能助手
- **智能推荐**：基于学习情况推荐薄弱题目
- **题目生成**：按知识点和难度生成新题目
- **解析生成**：为缺少解析的题目自动生成详解
- **分析报告**：生成个人学习情况分析报告

```python
from ai.ai_service import AIServiceFactory
from ai.ai_features import AIFeatures

# 配置 AI 服务
ai_service = AIServiceFactory.create(config_manager)
ai_features = AIFeatures(ai_service, knowledge_manager, stats_analyzer)

# 智能推荐
recommendations = ai_features.recommend_questions(count=10)

# 生成题目
new_questions = ai_features.generate_questions(
    topic="防火墙技术",
    count=5,
    difficulty="medium"
)
```

### 4. 知识点管理
- **自动提取**：从题目中提取知识点
- **层级结构**：支持知识点的父子关系
- **掌握度计算**：基于答题情况计算掌握程度
- **可视化展示**：雷达图、柱状图展示掌握情况

```python
from core.knowledge_manager import KnowledgeManager

km = KnowledgeManager(database)
km.extract_from_questions(questions)
mastery = km.calculate_mastery("网络安全基础")
```

### 5. 统计分析
- **趋势分析**：正确率、答题速度变化趋势
- **题型分析**：各题型正确率对比
- **时间分析**：答题时间分布
- **导出报告**：生成 Markdown/HTML 报告

```python
from core.stats_analyzer import StatsAnalyzer

analyzer = StatsAnalyzer(database)
stats = analyzer.get_overall_stats()
trend = analyzer.get_accuracy_trend(days=30)
```

## 架构设计

```
HOS-QuizMaster/
├── main.py              # GUI 入口
├── cli.py               # CLI 入口（供 skill 调用）
├── core/                # 核心业务逻辑
│   ├── quiz_manager.py         # 刷题管理
│   ├── knowledge_manager.py    # 知识点管理
│   ├── stats_analyzer.py       # 统计分析
│   └── exam_generator.py       # 组卷引擎
├── parser/              # 题库解析
│   ├── md_parser.py            # Markdown 解析
│   └── smart_parser.py         # 智能格式识别
├── data/                # 数据层
│   ├── database.py             # 数据库管理
│   └── dao.py                  # 数据访问对象
├── ai/                  # AI 功能
│   ├── ai_service.py           # AI 服务抽象
│   ├── ai_features.py          # AI 功能实现
│   └── ai_config.py            # AI 配置管理
├── ui/                  # 用户界面
│   ├── main_window.py          # 主窗口
│   ├── views/                  # 视图组件
│   ├── widgets/                # UI 控件
│   └── dialogs/                # 对话框
└── utils/               # 工具类
    ├── config.py               # 配置管理
    ├── logger.py               # 日志系统
    └── error_handler.py        # 错误处理
```

## CLI 接口（Skill 集成）

HOS-QuizMaster 提供完整的 CLI 接口，便于被外部 skill 调用。详细集成指南请参考 [工作流集成文档](docs/workflow-integration.md)。

### 命令列表

```bash
# 启动 GUI
python cli/main.py start [--mode MODE] [--file FILE]

# 导入题库
python cli/main.py import FILE [--format FORMAT]

# 命令行刷题
python cli/main.py quiz [--mode MODE] [--type TYPE] [--count N]

# 生成模拟卷
python cli/main.py generate [--type TYPE] [--difficulty DIFF] [--output PATH]

# 统计分析
python cli/main.py stats [--type TYPE] [--format FORMAT]

# 导出进度
python cli/main.py export OUTPUT [--format FORMAT]
```

所有命令支持 `--json` 标志，输出标准化 JSON 格式。

### 输出格式

使用 `--json` 标志时，所有命令返回统一 JSON 结构：

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

### 被 HOS_SKILL_WORKFLOW 调用示例

```yaml
# 在 02-HOS-LIFE-OKR 中调用
- name: 每日刷题
  action: quizmaster
  command: "python cli/main.py quiz --mode random --count 10 --json"
  schedule: "0 9 * * *"
  working_dir: "./HOS-QuizMaster"

- name: 生成模拟卷
  action: quizmaster
  command: "python cli/main.py generate --type single:20,multi:10 --json"
  trigger: "weekly"
```

完整的 Skill 清单定义见 [skill-manifest.yaml](skill-manifest.yaml)。

## 配置说明

### 数据库配置

默认使用 SQLite，数据库文件位于 `data/quizmaster.db`：

```python
from data.database import Database

db = Database("path/to/database.db")
```

### AI 配置

AI 功能支持 OpenAI API 和本地模型（Ollama）：

```json
{
  "ai_enabled": true,
  "active_provider": "openai",
  "providers": {
    "openai": {
      "api_key": "your-api-key",
      "base_url": "https://api.openai.com/v1",
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000
    },
    "local": {
      "base_url": "http://localhost:11434",
      "model": "llama2"
    }
  }
}
```

### 日志配置

```python
from utils.logger import Logger

logger = Logger(
    name="quizmaster",
    log_file="logs/app.log",
    level="INFO"
)
```

## 弹窗提示系统

系统在关键节点提供弹窗提示，确保用户及时发现配置问题：

### 启动检查
- AI 配置完整性检查
- 数据库连接状态检查
- 题库加载状态检查

### 配置验证
- API Key 必填项验证
- Base URL 格式验证
- 模型名称验证

### 模式切换提示
- 无错题时切换到错题模式的引导
- 背题模式直接显示答案的提示
- 测试模式计时器启动的提示

## 开发指南

### 添加新的题库格式

```python
from parser.format_adapter import FormatAdapter

class MyFormatAdapter(FormatAdapter):
    def detect(self, content: str) -> bool:
        # 检测是否为该格式
        return "特定标记" in content
    
    def parse(self, content: str) -> list:
        # 解析题目
        questions = []
        # ... 解析逻辑
        return questions
```

### 扩展 AI 功能

```python
from ai.ai_features import AIFeatures

class ExtendedAIFeatures(AIFeatures):
    def my_custom_feature(self, param):
        # 自定义 AI 功能
        prompt = self._build_prompt(param)
        response = self.ai_service.chat(prompt)
        return self._parse_response(response)
```

## 测试

```bash
# 运行端到端测试
python test_e2e.py

# 运行单元测试
python -m unittest discover tests/

# 运行集成测试
python test_integration.py
```

## 性能优化

### 数据库优化
- 使用索引加速查询
- 批量操作减少 I/O
- 连接池管理

### 图片处理
- 异步加载图片
- 缓存已处理图片
- 按需锐化增强

### AI 响应
- 流式输出（streaming）
- 后台线程处理
- 超时和重试机制

## 常见问题

**Q: 如何导入华为认证题库？**  
A: 点击「文件 → 导入题库」，选择整理后的 Markdown 文件即可。

**Q: AI 功能无法使用？**  
A: 检查「AI → AI 配置」，确保 API Key 和 Base URL 正确，点击「测试连接」验证。

**Q: 如何被外部 skill 调用？**  
A: 使用 CLI 接口，参考「CLI 接口」章节。

**Q: 数据库文件在哪里？**  
A: 默认位于 `data/quizmaster.db`，可在配置中修改。

## 技术栈

- **GUI**: PyQt6
- **数据库**: SQLite3
- **AI**: OpenAI API / Ollama
- **图片处理**: OpenCV, Pillow
- **日志**: logging

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request。

## 联系方式

- GitHub: https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW
- 项目路径: `02-HOS-LIFE-OKR` 集成模块
