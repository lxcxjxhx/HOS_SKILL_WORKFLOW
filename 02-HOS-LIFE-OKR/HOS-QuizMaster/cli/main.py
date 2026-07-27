#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI 主入口 - HOS-QuizMaster V2
Phase 12: Skill 化接口
"""

import argparse
import json
import sys
import os
from typing import Optional, Dict, Any

# 添加项目根目录到路径
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)


class QuizMasterCLI:
    """HOS-QuizMaster CLI 主类"""
    
    def __init__(self):
        self.parser = self._create_parser()
    
    def _create_parser(self) -> argparse.ArgumentParser:
        """创建命令行解析器"""
        parser = argparse.ArgumentParser(
            prog='quizmaster',
            description='HOS-QuizMaster V2 - 智能刷题系统 CLI',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
示例:
  quizmaster start                           # 启动 GUI
  quizmaster start --mode=test               # 启动并进入测试模式
  quizmaster import quiz.md                  # 导入题库
  quizmaster quiz --mode=random              # 命令行刷题（随机模式）
  quizmaster generate --type single:20 multi:10  # 生成模拟卷
  quizmaster stats --format=json             # 输出统计信息（JSON 格式）
            """
        )
        
        # 全局选项
        parser.add_argument(
            '--version',
            action='version',
            version='HOS-QuizMaster V2.0.0'
        )
        parser.add_argument(
            '--db',
            default='quizmaster.db',
            help='数据库文件路径 (默认: quizmaster.db)'
        )
        parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # 子命令
        subparsers = parser.add_subparsers(dest='command', help='可用命令')
        
        # start 命令
        start_parser = subparsers.add_parser('start', help='启动 GUI 或指定模式')
        start_parser.add_argument(
            '--mode',
            choices=['sequential', 'random', 'memorize', 'test', 'wrong'],
            default='sequential',
            help='刷题模式 (默认: sequential)'
        )
        start_parser.add_argument(
            '--file',
            help='启动时加载的题库文件'
        )
        start_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # import 命令
        import_parser = subparsers.add_parser('import', help='导入题库')
        import_parser.add_argument('file', help='题库文件路径')
        import_parser.add_argument(
            '--format',
            choices=['auto', 'standard', 'numbered', 'simplified'],
            default='auto',
            help='题库格式 (默认: auto)'
        )
        import_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # quiz 命令
        quiz_parser = subparsers.add_parser('quiz', help='命令行刷题')
        quiz_parser.add_argument(
            '--mode',
            choices=['sequential', 'random', 'memorize', 'test', 'wrong'],
            default='sequential',
            help='刷题模式 (默认: sequential)'
        )
        quiz_parser.add_argument(
            '--type',
            choices=['all', '单选题', '多选题', '判断题'],
            default='all',
            help='题型筛选 (默认: all)'
        )
        quiz_parser.add_argument(
            '--count',
            type=int,
            help='答题数量限制'
        )
        quiz_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # generate 命令
        generate_parser = subparsers.add_parser('generate', help='生成模拟卷')
        generate_parser.add_argument(
            '--type',
            help='题型分布，如: single:20,multi:10,judge:20'
        )
        generate_parser.add_argument(
            '--difficulty',
            help='难度分布，如: easy:30,medium:50,hard:20'
        )
        generate_parser.add_argument(
            '--knowledge',
            help='知识点范围，逗号分隔'
        )
        generate_parser.add_argument(
            '--output',
            help='输出文件路径'
        )
        generate_parser.add_argument(
            '--format',
            choices=['markdown', 'json'],
            default='markdown',
            help='输出格式 (默认: markdown)'
        )
        generate_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # stats 命令
        stats_parser = subparsers.add_parser('stats', help='统计分析')
        stats_parser.add_argument(
            '--type',
            choices=['summary', 'trend', 'knowledge', 'all'],
            default='summary',
            help='统计类型 (默认: summary)'
        )
        stats_parser.add_argument(
            '--format',
            choices=['text', 'json'],
            default='text',
            help='输出格式 (默认: text)'
        )
        stats_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        # export 命令
        export_parser = subparsers.add_parser('export', help='导出进度')
        export_parser.add_argument('output', help='输出文件路径')
        export_parser.add_argument(
            '--format',
            choices=['json', 'markdown'],
            default='json',
            help='导出格式 (默认: json)'
        )
        export_parser.add_argument(
            '--json',
            action='store_true',
            help='以 JSON 格式输出结果'
        )
        
        return parser
    
    def run(self, args: Optional[list] = None) -> int:
        """运行 CLI"""
        parsed_args = self.parser.parse_args(args)
        
        if not parsed_args.command:
            self.parser.print_help()
            return 0
        
        # 根据命令分发
        command_map = {
            'start': self._cmd_start,
            'import': self._cmd_import,
            'quiz': self._cmd_quiz,
            'generate': self._cmd_generate,
            'stats': self._cmd_stats,
            'export': self._cmd_export,
        }
        
        handler = command_map.get(parsed_args.command)
        if handler:
            return handler(parsed_args)
        else:
            self.parser.print_help()
            return 1
    
    def _cmd_start(self, args) -> int:
        """启动命令"""
        try:
            if args.json:
                # JSON 模式：输出状态信息后启动 GUI
                result = {
                    'status': 'success',
                    'data': {
                        'mode': args.mode,
                        'file': args.file
                    },
                    'message': '启动 HOS-QuizMaster V2'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            
            # 启动 GUI
            from PyQt6.QtWidgets import QApplication
            from ui.main_window import MainWindow
            
            app = QApplication(sys.argv)
            window = MainWindow()
            
            # 如果指定了文件，加载
            if args.file:
                window.load_quiz_file(args.file)
            
            # 设置模式
            window.set_mode(args.mode)
            
            window.show()
            return app.exec()
            
        except Exception as e:
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'启动失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1
    
    def _cmd_import(self, args) -> int:
        """导入命令"""
        from parser.smart_parser import SmartParser
        from data.database import Database
        from data.dao import QuestionDAO
        
        if not os.path.exists(args.file):
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'文件不存在: {args.file}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: 文件不存在: {args.file}")
            return 1
        
        try:
            if not args.json:
                print(f"导入题库: {args.file}")
            
            # 解析题库
            parser = SmartParser()
            if args.format == 'auto':
                questions = parser.parse_file(args.file)
            else:
                # 使用指定格式解析器
                from parser.md_parser import MDParser
                parser = MDParser()
                questions = parser.parse_file(args.file)
            
            # 保存到数据库
            db = Database(args.db)
            dao = QuestionDAO(db)
            
            count = 0
            for q in questions:
                try:
                    dao.create(q)
                    count += 1
                except Exception as e:
                    # 题目可能已存在
                    pass
            
            if args.json:
                result = {
                    'status': 'success',
                    'data': {
                        'file': args.file,
                        'total': len(questions),
                        'imported': count
                    },
                    'message': f'成功导入 {count}/{len(questions)} 道题目'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"成功导入 {count}/{len(questions)} 道题目")
            
            return 0
            
        except Exception as e:
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'导入失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1
    
    def _cmd_quiz(self, args) -> int:
        """命令行刷题"""
        from data.database import Database
        from data.dao import QuestionDAO
        from core.quiz_manager import QuizManager
        
        try:
            db = Database(args.db)
            dao = QuestionDAO(db)
            
            # 获取所有题目
            all_questions = dao.list_all()
            
            if not all_questions:
                if args.json:
                    result = {
                        'status': 'error',
                        'data': None,
                        'message': '题库为空，请先导入题库'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print("错误: 题库为空，请先导入题库")
                return 1
            
            # 题型筛选
            if args.type != 'all':
                all_questions = [q for q in all_questions if q.get('type') == args.type]
            
            if not all_questions:
                if args.json:
                    result = {
                        'status': 'error',
                        'data': None,
                        'message': f'没有 {args.type} 类型的题目'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print(f"错误: 没有 {args.type} 类型的题目")
                return 1
            
            # 初始化 QuizManager
            manager = QuizManager()
            manager.load_questions(all_questions)
            manager.set_mode(args.mode)
            
            # 获取题目列表
            question_indices = manager.get_question_list()
            
            # 数量限制
            if args.count and args.count < len(question_indices):
                question_indices = question_indices[:args.count]
            
            if not args.json:
                print(f"开始刷题 (模式: {args.mode}, 题目数: {len(question_indices)})")
                print("=" * 60)
            
            correct = 0
            total = 0
            
            for idx in question_indices:
                question = manager.get_question(idx)
                if not question:
                    continue
                
                total += 1
                if not args.json:
                    print(f"\n第 {total} 题 [{question.get('type', '未知')}]")
                    print(f"{question.get('stem', '')}")
                    
                    # 显示选项
                    options = question.get('options', [])
                    for opt in options:
                        print(f"  {opt}")
                
                # 背题模式直接显示答案
                if args.mode == 'memorize':
                    if not args.json:
                        print(f"\n答案: {question.get('answer', '')}")
                        if question.get('explanation'):
                            print(f"解析: {question.get('explanation', '')}")
                        input("按回车继续...")
                    continue
                
                # 用户输入答案
                if not args.json:
                    user_answer = input("\n你的答案 (如: A, ABC): ").strip().upper()
                else:
                    # JSON 模式下跳过交互式输入
                    continue
                
                if not user_answer:
                    if not args.json:
                        print("跳过")
                    continue
                
                # 判断对错
                correct_answer = question.get('answer', '').replace(',', '').replace('，', '').upper()
                user_list = sorted(list(user_answer))
                correct_list = sorted(list(correct_answer))
                
                if user_list == correct_list:
                    if not args.json:
                        print("✓ 正确")
                    correct += 1
                else:
                    if not args.json:
                        print(f"✗ 错误")
                        print(f"  正确答案: {correct_answer}")
                        if question.get('explanation'):
                            print(f"  解析: {question.get('explanation', '')}")
            
            # 统计结果
            if total > 0:
                accuracy = (correct / total) * 100 if total > 0 else 0
                
                if args.json:
                    result = {
                        'status': 'success',
                        'data': {
                            'total': total,
                            'correct': correct,
                            'accuracy': accuracy,
                            'mode': args.mode
                        },
                        'message': '答题完成'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print("\n" + "=" * 60)
                    print(f"答题完成!")
                    print(f"总题数: {total}")
                    print(f"正确数: {correct}")
                    print(f"正确率: {accuracy:.1f}%")
            
            return 0
            
        except Exception as e:
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'刷题失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1
    
    def _cmd_generate(self, args) -> int:
        """生成模拟卷"""
        from core.exam_generator import ExamGenerator
        from data.database import Database
        from data.dao import QuestionDAO
        
        try:
            db = Database(args.db)
            dao = QuestionDAO(db)
            
            # 解析题型分布
            type_config = {}
            if args.type:
                for item in args.type.split(','):
                    parts = item.split(':')
                    if len(parts) == 2:
                        type_map = {
                            'single': '单选题',
                            'multi': '多选题',
                            'judge': '判断题'
                        }
                        q_type = type_map.get(parts[0], parts[0])
                        count = int(parts[1])
                        type_config[q_type] = count
            
            # 解析难度分布
            difficulty_config = {}
            if args.difficulty:
                for item in args.difficulty.split(','):
                    parts = item.split(':')
                    if len(parts) == 2:
                        difficulty_config[parts[0]] = int(parts[1])
            
            # 解析知识点
            knowledge_list = []
            if args.knowledge:
                knowledge_list = [k.strip() for k in args.knowledge.split(',')]
            
            if not args.json:
                print("生成模拟卷...")
            
            generator = ExamGenerator(dao)
            
            # 设置规则
            if type_config:
                generator.set_type_rule(type_config)
            if difficulty_config:
                generator.set_difficulty_rule(difficulty_config)
            if knowledge_list:
                generator.set_knowledge_rule(knowledge_list)
            
            # 生成试卷
            exam = generator.generate()
            
            if not exam:
                if args.json:
                    result = {
                        'status': 'error',
                        'data': None,
                        'message': '无法生成试卷，请检查题库和规则'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print("错误: 无法生成试卷，请检查题库和规则")
                return 1
            
            # 输出
            if args.format == 'markdown':
                output = exam.to_markdown()
            else:
                output = json.dumps(exam.to_dict(), ensure_ascii=False, indent=2)
            
            # 保存到文件或输出到控制台
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    f.write(output)
                
                if args.json:
                    result = {
                        'status': 'success',
                        'data': {
                            'file_path': args.output,
                            'format': args.format
                        },
                        'message': f'试卷已保存到: {args.output}'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print(f"试卷已保存到: {args.output}")
            else:
                if args.json:
                    result = {
                        'status': 'success',
                        'data': exam.to_dict(),
                        'message': '试卷生成成功'
                    }
                    print(json.dumps(result, ensure_ascii=False, indent=2))
                else:
                    print("\n" + "=" * 60)
                    print(output)
            
            return 0
            
        except Exception as e:
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'生成失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1
    
    def _cmd_stats(self, args) -> int:
        """统计分析"""
        from core.stats_analyzer import StatsAnalyzer
        from data.database import Database
        
        try:
            db = Database(args.db)
            analyzer = StatsAnalyzer(db)
            
            if args.type == 'summary':
                stats = analyzer.get_summary()
            elif args.type == 'trend':
                stats = analyzer.get_trend_analysis()
            elif args.type == 'knowledge':
                stats = analyzer.get_knowledge_stats()
            else:  # all
                stats = {
                    'summary': analyzer.get_summary(),
                    'trend': analyzer.get_trend_analysis(),
                    'knowledge': analyzer.get_knowledge_stats()
                }
            
            # 输出
            if args.format == 'json' or args.json:
                result = {
                    'status': 'success',
                    'data': stats,
                    'message': '统计信息获取成功'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                self._print_stats_text(stats)
            
            return 0
            
        except Exception as e:
            if args.json or args.format == 'json':
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'统计失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1
    
    def _print_stats_text(self, stats: Dict[str, Any], indent: int = 0):
        """文本格式输出统计"""
        prefix = "  " * indent
        for key, value in stats.items():
            if isinstance(value, dict):
                print(f"{prefix}{key}:")
                self._print_stats_text(value, indent + 1)
            elif isinstance(value, list):
                print(f"{prefix}{key}:")
                for item in value:
                    if isinstance(item, dict):
                        for k, v in item.items():
                            print(f"{prefix}  - {k}: {v}")
                    else:
                        print(f"{prefix}  - {item}")
            else:
                print(f"{prefix}{key}: {value}")
    
    def _cmd_export(self, args) -> int:
        """导出进度"""
        from core.quiz_manager import QuizManager
        
        try:
            manager = QuizManager()
            
            if args.format == 'json':
                manager.export_progress(args.output)
            else:
                # Markdown 格式导出
                manager.export_to_markdown(args.output)
            
            if args.json:
                result = {
                    'status': 'success',
                    'data': {
                        'file_path': args.output,
                        'format': args.format
                    },
                    'message': f'进度已导出到: {args.output}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"进度已导出到: {args.output}")
            
            return 0
            
        except Exception as e:
            if args.json:
                result = {
                    'status': 'error',
                    'data': None,
                    'message': f'导出失败: {str(e)}'
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
            else:
                print(f"错误: {e}")
            return 1


def main():
    """CLI 入口函数"""
    cli = QuizMasterCLI()
    sys.exit(cli.run())


if __name__ == '__main__':
    main()
