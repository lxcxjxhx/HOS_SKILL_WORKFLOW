#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据迁移工具
将现有的 JSON 进度文件迁移到 SQLite 数据库
"""

import json
import os
from pathlib import Path
from typing import List, Dict
from data.database import Database
from data.dao import QuestionDAO, AnswerDAO


class ProgressMigrator:
    """进度迁移器"""
    
    def __init__(self, db_path: str = None):
        """
        初始化迁移器
        
        Args:
            db_path: 数据库路径，默认为 data/quizmaster.db
        """
        self.db = Database(db_path)
        self.question_dao = QuestionDAO(self.db)
        self.answer_dao = AnswerDAO(self.db)
    
    def migrate_progress_file(self, progress_file: str, source_md: str = '') -> Dict:
        """
        迁移单个进度文件
        
        Args:
            progress_file: 进度文件路径 (.progress.json)
            source_md: 对应的题库文件路径
            
        Returns:
            迁移统计信息
        """
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            answers_data = data.get('answers', {})
            migrated_count = 0
            error_count = 0
            
            for idx_str, selected_options in answers_data.items():
                try:
                    idx = int(idx_str)
                    # 这里假设题目已经按顺序导入数据库
                    # 实际使用时需要根据 source_file 和 number 来匹配
                    question = self.question_dao.get_by_number(idx + 1, source_md)
                    
                    if question:
                        # 判断答案是否正确
                        correct_answer = list(question['answer'].replace(',', '').replace('，', ''))
                        is_correct = set(selected_options) == set(correct_answer)
                        
                        # 记录答案
                        self.answer_dao.record_answer(
                            question['id'],
                            selected_options,
                            is_correct
                        )
                        migrated_count += 1
                    else:
                        error_count += 1
                        
                except Exception as e:
                    print(f"迁移答案时出错 (索引 {idx_str}): {e}")
                    error_count += 1
            
            return {
                'file': progress_file,
                'migrated': migrated_count,
                'errors': error_count
            }
            
        except Exception as e:
            print(f"迁移文件失败 {progress_file}: {e}")
            return {
                'file': progress_file,
                'migrated': 0,
                'errors': -1,
                'error_message': str(e)
            }
    
    def migrate_all_progress_files(self, search_dir: str = '.') -> List[Dict]:
        """
        迁移目录下所有进度文件
        
        Args:
            search_dir: 搜索目录
            
        Returns:
            迁移结果列表
        """
        results = []
        search_path = Path(search_dir)
        
        # 查找所有 .progress.json 文件
        progress_files = list(search_path.glob('**/*.progress.json'))
        
        print(f"找到 {len(progress_files)} 个进度文件")
        
        for progress_file in progress_files:
            # 推断对应的题库文件
            # 例如: chapter1.progress.json -> chapter1.md
            base_name = progress_file.stem.replace('.progress', '')
            possible_md = progress_file.parent / f"{base_name}.md"
            
            source_md = str(possible_md) if possible_md.exists() else ''
            
            print(f"迁移: {progress_file.name}")
            result = self.migrate_progress_file(str(progress_file), source_md)
            results.append(result)
            
            print(f"  成功: {result['migrated']}, 错误: {result['errors']}")
        
        return results
    
    def migrate_questions_from_md(self, md_file: str) -> Dict:
        """
        从 Markdown 文件导入题目到数据库
        
        Args:
            md_file: Markdown 文件路径
            
        Returns:
            导入统计信息
        """
        try:
            # 导入解析器
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent))
            from parser.md_parser import MDParser
            
            parser = MDParser()
            questions = parser.parse_file(md_file)
            
            imported_count = 0
            error_count = 0
            
            for question in questions:
                try:
                    # 检查是否已存在
                    existing = self.question_dao.get_by_number(
                        question['number'],
                        md_file
                    )
                    
                    if existing:
                        # 更新现有题目
                        self.question_dao.update(existing['id'], {
                            **question,
                            'source_file': md_file
                        })
                    else:
                        # 创建新题目
                        self.question_dao.create({
                            **question,
                            'source_file': md_file
                        })
                    
                    imported_count += 1
                    
                except Exception as e:
                    print(f"导入题目 {question.get('number', '?')} 时出错: {e}")
                    error_count += 1
            
            return {
                'file': md_file,
                'imported': imported_count,
                'errors': error_count
            }
            
        except Exception as e:
            print(f"导入文件失败 {md_file}: {e}")
            return {
                'file': md_file,
                'imported': 0,
                'errors': -1,
                'error_message': str(e)
            }
    
    def migrate_all_md_files(self, search_dir: str = '.') -> List[Dict]:
        """
        迁移目录下所有 Markdown 题库文件
        
        Args:
            search_dir: 搜索目录
            
        Returns:
            迁移结果列表
        """
        results = []
        search_path = Path(search_dir)
        
        # 查找所有 .md 文件
        md_files = list(search_path.glob('**/*.md'))
        
        print(f"找到 {len(md_files)} 个 Markdown 文件")
        
        for md_file in md_files:
            print(f"导入: {md_file.name}")
            result = self.migrate_questions_from_md(str(md_file))
            results.append(result)
            
            print(f"  成功: {result['imported']}, 错误: {result['errors']}")
        
        return results
    
    def close(self):
        """关闭数据库连接"""
        self.db.close()


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description='数据迁移工具')
    parser.add_argument('--dir', default='.', help='搜索目录')
    parser.add_argument('--db', default=None, help='数据库路径')
    parser.add_argument('--questions-only', action='store_true', 
                       help='只导入题目，不导入进度')
    parser.add_argument('--progress-only', action='store_true',
                       help='只导入进度，不导入题目')
    
    args = parser.parse_args()
    
    migrator = ProgressMigrator(args.db)
    
    try:
        if not args.progress_only:
            print("\n=== 导入题目 ===")
            md_results = migrator.migrate_all_md_files(args.dir)
            total_imported = sum(r['imported'] for r in md_results if r['imported'] > 0)
            print(f"\n题目导入完成: 共 {total_imported} 题")
        
        if not args.questions_only:
            print("\n=== 导入进度 ===")
            progress_results = migrator.migrate_all_progress_files(args.dir)
            total_migrated = sum(r['migrated'] for r in progress_results if r['migrated'] > 0)
            print(f"\n进度导入完成: 共 {total_migrated} 条记录")
        
        print("\n迁移完成!")
        
    finally:
        migrator.close()


if __name__ == '__main__':
    main()
