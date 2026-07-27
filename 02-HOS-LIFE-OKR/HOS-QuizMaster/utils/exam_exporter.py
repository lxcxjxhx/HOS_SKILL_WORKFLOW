#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
试卷导出工具 - HOS-QuizMaster V2
Phase 6: 考试系统
"""

import os
from typing import Optional
from datetime import datetime

from core.exam_paper import ExamPaper


class ExamExporter:
    """
    试卷导出器
    
    支持导出为 Markdown、PDF、Word 等格式。
    当前仅实现 Markdown 导出，PDF 和 Word 为占位符。
    """
    
    def __init__(self):
        pass
    
    def export_to_markdown(
        self,
        exam_paper: ExamPaper,
        output_path: str,
        include_answers: bool = False,
    ) -> str:
        """
        导出试卷为 Markdown 格式
        
        Args:
            exam_paper: 试卷对象
            output_path: 输出文件路径
            include_answers: 是否包含答案（默认 False，生成纯试卷）
            
        Returns:
            输出文件路径
            
        Raises:
            IOError: 文件写入失败
        """
        lines = []
        
        # 标题
        lines.append(f"# {exam_paper.title}")
        lines.append("")
        
        # 元数据
        stats = exam_paper.get_statistics()
        lines.append(f"**总分**: {stats['total_score']} 分")
        if exam_paper.time_limit > 0:
            lines.append(f"**考试时长**: {exam_paper.time_limit} 分钟")
        lines.append(f"**题目数量**: {stats['question_count']} 题")
        lines.append(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append("")
        
        # 题型分布
        lines.append("## 题型分布")
        lines.append("")
        for q_type, count in stats['type_distribution'].items():
            lines.append(f"- {q_type}: {count} 题")
        lines.append("")
        
        # 难度分布
        if stats['difficulty_distribution']:
            lines.append("## 难度分布")
            lines.append("")
            for diff, count in stats['difficulty_distribution'].items():
                lines.append(f"- {diff}: {count} 题")
            lines.append("")
        
        lines.append("---")
        lines.append("")
        
        # 按题型分组题目
        questions_by_type = {}
        for idx, q in enumerate(exam_paper.questions):
            q_type = q.get('type', '未知')
            if q_type not in questions_by_type:
                questions_by_type[q_type] = []
            questions_by_type[q_type].append((idx, q))
        
        # 输出各题型
        question_num = 1
        for q_type in ['单选题', '多选题', '判断题', '填空题', '简答题']:
            if q_type not in questions_by_type:
                continue
            
            lines.append(f"## {q_type}")
            lines.append("")
            
            for idx, q in questions_by_type[q_type]:
                # 题干
                lines.append(f"**{question_num}.** {q['stem']}")
                lines.append("")
                
                # 选项
                for opt in q.get('options', []):
                    lines.append(f"- {opt['label']}. {opt['text']}")
                lines.append("")
                
                # 分值提示
                score = exam_paper.scoring_rules.get(q_type, 1)
                lines.append(f"*({score} 分)*")
                lines.append("")
                
                question_num += 1
        
        # 答案部分
        if include_answers:
            lines.append("---")
            lines.append("")
            lines.append("## 参考答案")
            lines.append("")
            
            question_num = 1
            for idx, q in enumerate(exam_paper.questions):
                q_type = q.get('type', '未知')
                answer = q.get('answer', '')
                
                lines.append(f"**{question_num}.** {answer}")
                
                # 解析
                explanation = q.get('explanation', '')
                if explanation:
                    lines.append(f"   *解析: {explanation}*")
                
                lines.append("")
                question_num += 1
        
        # 写入文件
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
            return output_path
        except IOError as e:
            raise IOError(f"写入文件失败: {e}")
    
    def export_to_pdf(
        self,
        exam_paper: ExamPaper,
        output_path: str,
        include_answers: bool = False,
    ) -> str:
        """
        导出试卷为 PDF 格式（占位符）
        
        当前实现: 先导出为 Markdown，提示用户手动转换。
        未来可集成 reportlab、weasyprint 等库实现真正的 PDF 导出。
        
        Args:
            exam_paper: 试卷对象
            output_path: 输出文件路径
            include_answers: 是否包含答案
            
        Returns:
            输出文件路径
        """
        # 占位符实现：导出为 Markdown 并重命名
        md_path = output_path.replace('.pdf', '.md')
        self.export_to_markdown(exam_paper, md_path, include_answers)
        
        # TODO: 集成 PDF 生成库
        # 当前仅提示用户
        print(f"[提示] PDF 导出功能尚未完全实现。")
        print(f"已生成 Markdown 文件: {md_path}")
        print(f"请使用 Markdown 编辑器或在线工具转换为 PDF。")
        
        return md_path
    
    def export_to_word(
        self,
        exam_paper: ExamPaper,
        output_path: str,
        include_answers: bool = False,
    ) -> str:
        """
        导出试卷为 Word 格式（占位符）
        
        当前实现: 先导出为 Markdown，提示用户手动转换。
        未来可集成 python-docx 库实现真正的 Word 导出。
        
        Args:
            exam_paper: 试卷对象
            output_path: 输出文件路径
            include_answers: 是否包含答案
            
        Returns:
            输出文件路径
        """
        # 占位符实现：导出为 Markdown 并重命名
        md_path = output_path.replace('.docx', '.md')
        self.export_to_markdown(exam_paper, md_path, include_answers)
        
        # TODO: 集成 python-docx
        # 当前仅提示用户
        print(f"[提示] Word 导出功能尚未完全实现。")
        print(f"已生成 Markdown 文件: {md_path}")
        print(f"请使用 Markdown 编辑器或在线工具转换为 Word。")
        
        return md_path
    
    def export_results_to_markdown(
        self,
        exam_paper: ExamPaper,
        output_path: str,
    ) -> str:
        """
        导出考试结果为 Markdown 格式
        
        Args:
            exam_paper: 已评分的试卷对象
            output_path: 输出文件路径
            
        Returns:
            输出文件路径
        """
        lines = []
        
        # 标题
        lines.append(f"# {exam_paper.title} - 考试结果")
        lines.append("")
        
        # 成绩概览
        score_result = exam_paper.calculate_score()
        lines.append("## 成绩概览")
        lines.append("")
        lines.append(f"- **得分**: {score_result['user_score']} / {score_result['total_score']}")
        lines.append(f"- **正确率**: {score_result['accuracy']:.1f}%")
        lines.append(f"- **答对**: {score_result['correct']} 题")
        lines.append(f"- **答错**: {score_result['incorrect']} 题")
        lines.append(f"- **未答**: {score_result['unanswered']} 题")
        lines.append("")
        
        # 详细答题记录
        lines.append("## 详细答题记录")
        lines.append("")
        
        for detail in score_result['details']:
            idx = detail['index']
            q = exam_paper.questions[idx]
            
            # 题号和题干
            lines.append(f"**{idx + 1}.** {q['stem']}")
            lines.append("")
            
            # 用户答案
            user_ans = detail['user_answer']
            if user_ans:
                lines.append(f"- **你的答案**: {', '.join(user_ans)}")
            else:
                lines.append(f"- **你的答案**: *未作答*")
            
            # 正确答案
            correct_ans = detail['correct_answer']
            lines.append(f"- **正确答案**: {', '.join(correct_ans)}")
            
            # 结果
            if detail['is_correct']:
                lines.append(f"- **结果**: ✓ 正确 ({detail['score']}/{detail['max_score']} 分)")
            elif user_ans:
                lines.append(f"- **结果**: ✗ 错误 (0/{detail['max_score']} 分)")
            else:
                lines.append(f"- **结果**: - 未作答 (0/{detail['max_score']} 分)")
            
            # 解析
            explanation = q.get('explanation', '')
            if explanation:
                lines.append(f"- **解析**: {explanation}")
            
            lines.append("")
        
        # 写入文件
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
            return output_path
        except IOError as e:
            raise IOError(f"写入文件失败: {e}")
