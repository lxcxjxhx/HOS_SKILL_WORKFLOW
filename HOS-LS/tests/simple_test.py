#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HOS-LS 简单测试脚本 - 针对 test-ai-tool 项目
测试所有安全检测功能并生成测试报告
"""

import os
import sys
import json
import time
from datetime import datetime
from colorama import init, Fore, Style

# 初始化 colorama
init(autoreset=True)

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))

from enhanced_scanner import EnhancedSecurityScanner
from ast_scanner import ASTScanner
from taint_analyzer import TaintAnalyzer
from encoding_detector import EncodingDetector
from ai_suggestion_generator import AISuggestionGenerator
from attack_simulator import AttackSimulator
from report_generator import ReportGenerator


def run_simple_test():
    """运行简单测试"""
    # 配置路径
    target_dir = r"c:\1AAA_PROJECT\HOS\HOS-LS\HOS-LS\tests\test-ai-tool"
    output_dir = r"c:\1AAA_PROJECT\HOS\HOS-LS\HOS-LS\tests\test-simple"
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*80}")
    print(f"HOS-LS v2.0 简单测试")
    print(f"目标项目：{target_dir}")
    print(f"输出目录：{output_dir}")
    print(f"{'='*80}\n")
    
    start_time = time.time()
    
    try:
        # 1. 增强扫描器测试
        print(f"{Fore.CYAN}[1/4] 增强规则扫描...{Style.RESET_ALL}")
        scanner = EnhancedSecurityScanner(
            target=target_dir,
            silent=False
        )
        rule_results = scanner.scan()
        rule_summary = scanner.get_summary()
        print(f"  [OK] 完成，发现问题数：{rule_summary['total_issues']}")
        
        # 2. AST 分析测试
        print(f"{Fore.CYAN}[2/4] AST 抽象语法树分析...{Style.RESET_ALL}")
        ast_scanner = ASTScanner()
        ast_results = ast_scanner.analyze(target_dir)
        print(f"  [OK] 完成，发现问题数：{len(ast_results)}")
        
        # 3. 数据流分析测试
        print(f"{Fore.CYAN}[3/4] 数据流分析（污点追踪）...{Style.RESET_ALL}")
        taint_analyzer = TaintAnalyzer()
        taint_results = taint_analyzer.analyze(target_dir)
        print(f"  [OK] 完成，发现问题数：{len(taint_results)}")
        
        # 4. 编码检测测试
        print(f"{Fore.CYAN}[4/4] 编码检测...{Style.RESET_ALL}")
        detector = EncodingDetector()
        encoding_issues = []
        
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        results = detector.scan(content)
                        if results:
                            for result in results:
                                result['file'] = file_path
                                encoding_issues.append(result)
                    except Exception as e:
                        pass
        
        print(f"  [OK] 完成，发现问题数：{len(encoding_issues)}")
        
        # 5. AI 建议生成测试
        print(f"{Fore.CYAN}[5/7] AI 安全建议生成...{Style.RESET_ALL}")
        ai_generator = AISuggestionGenerator()
        ai_advice = ai_generator.generate_security_advice(rule_results)
        ai_prompt = ai_generator.generate_security_prompts(tool_name='cursor')
        print(f"  [OK] 完成，已生成 AI 安全建议")
        
        # 6. 攻击模拟测试
        print(f"{Fore.CYAN}[6/7] 攻击模拟测试...{Style.RESET_ALL}")
        attack_sim = AttackSimulator()
        attack_scenarios = attack_sim.get_agent_scenarios()
        scenario_count = len(attack_scenarios) if isinstance(attack_scenarios, dict) else len(attack_scenarios) if isinstance(attack_scenarios, list) else 0
        print(f"  [OK] 完成，加载 {scenario_count} 个攻击场景")
        
        # 7. 沙盒分析测试
        print(f"{Fore.CYAN}[7/7] 沙盒分析...{Style.RESET_ALL}")
        from sandbox_analyzer import SandboxAnalyzer
        sandbox = SandboxAnalyzer()
        sandbox_results = []
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        result = sandbox.analyze_code(content)
                        if result:
                            result['file'] = file_path
                            sandbox_results.append(result)
                    except:
                        pass
        print(f"  [OK] 完成，沙盒检测发现 {len(sandbox_results)} 个问题")
        
        # 合并所有结果
        full_results = rule_results.copy()
        full_results['ast_analysis'] = ast_results
        full_results['taint_analysis'] = taint_results
        full_results['encoding_detection'] = encoding_issues
        full_results['ai_advice'] = ai_advice
        full_results['ai_prompt'] = ai_prompt
        full_results['attack_scenarios'] = attack_scenarios
        full_results['sandbox_analysis'] = sandbox_results
        
        # 合并统计信息
        full_summary = rule_summary.copy()
        full_summary['ast_issues'] = len(ast_results)
        full_summary['taint_issues'] = len(taint_results)
        full_summary['encoding_issues'] = len(encoding_issues)
        full_summary['sandbox_issues'] = len(sandbox_results)
        full_summary['attack_scenarios'] = scenario_count
        full_summary['total_issues'] += len(ast_results) + len(taint_results) + len(encoding_issues) + len(sandbox_results)
        
        elapsed_time = time.time() - start_time
        
        # 使用 ReportGenerator 生成报告
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # 准备报告数据
        report_results = full_results.copy()
        report_results['ai_suggestions'] = {
            'risk_assessment': ai_advice[:500] if ai_advice else '正在生成...',
            'specific_suggestions': ['使用环境变量管理敏感信息', '避免使用危险函数', '定期更新依赖'],
            'best_practices': ['最小权限原则', '输入验证', '输出编码'],
            'cursor_prompt': ai_prompt[:1000] if ai_prompt else '正在生成...',
            'trae_prompt': ai_prompt[:1000] if ai_prompt else '正在生成...',
            'kiro_prompt': ai_prompt[:1000] if ai_prompt else '正在生成...'
        }
        
        # 创建报告生成器
        report_gen = ReportGenerator(
            results=report_results,
            target=target_dir,
            output_dir=output_dir
        )
        
        # 生成多种格式报告
        html_report = report_gen.generate_html(filename=f'simple_test_report_{timestamp}.html')
        md_report = report_gen.generate_md(filename=f'simple_test_report_{timestamp}.md')
        
        # 生成 JSON 报告
        json_report_file = os.path.join(output_dir, f'simple_test_report_{timestamp}.json')
        with open(json_report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'target': target_dir,
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'duration': elapsed_time
                },
                'summary': full_summary,
                'results': full_results,
                'ai_advice': ai_advice,
                'ai_prompt': ai_prompt,
                'attack_scenarios': attack_scenarios if isinstance(attack_scenarios, dict) else {}
            }, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"\n{'='*80}")
        print(f"{Fore.GREEN}[SUCCESS] 测试完成！{Style.RESET_ALL}")
        print(f"  耗时：{elapsed_time:.2f} 秒")
        print(f"  总问题数：{full_summary['total_issues']}")
        print(f"  高风险：{full_summary['high_risk']}")
        print(f"  中风险：{full_summary['medium_risk']}")
        print(f"  低风险：{full_summary['low_risk']}")
        print(f"  AST 问题：{full_summary['ast_issues']}")
        print(f"  数据流问题：{full_summary['taint_issues']}")
        print(f"  沙盒问题：{full_summary['sandbox_issues']}")
        print(f"  攻击场景：{full_summary['attack_scenarios']}")
        print(f"  HTML 报告：{html_report}")
        print(f"  MD 报告：{md_report}")
        print(f"  JSON 报告：{json_report_file}")
        print(f"{'='*80}\n")
        
        return 0
        
    except Exception as e:
        print(f"\n{Fore.RED}[ERROR] 测试失败：{e}{Style.RESET_ALL}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(run_simple_test())
