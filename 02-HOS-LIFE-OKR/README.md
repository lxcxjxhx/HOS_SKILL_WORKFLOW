# 02-HOS-LIFE-OKR

生活 OKR 管理模块

## 包含工具

### HOS-QuizMaster
智能刷题系统

**功能特性：**
- 多格式题库支持（Markdown 智能解析）
- 多模式刷题（顺序/随机/背题/测试/错题）
- AI 智能助手（推荐/生成/解析/分析）
- 知识点管理与掌握度分析
- 统计分析与可视化
- 模拟考试与试卷生成
- 图片处理与增强
- 数据导出功能

**快速开始：**
```bash
cd HOS-QuizMaster
pip install -r requirements.txt
python main.py
```

**CLI 使用：**
```bash
python cli/main.py start                    # 启动 GUI
python cli/main.py import quiz.md           # 导入题库
python cli/main.py quiz --mode random       # 随机模式刷题
python cli/main.py generate --count 5       # 生成题目
python cli/main.py stats --format json      # 查看统计
```

## 状态

✅ HOS-QuizMaster V2.0.0 已集成
