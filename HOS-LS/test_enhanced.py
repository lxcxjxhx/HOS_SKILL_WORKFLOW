#!/usr/bin/env python3
"""测试增强扫描器功能"""

from src.enhanced_scanner import EnhancedSecurityScanner

print("=" * 60)
print("测试增强扫描器功能")
print("=" * 60)

# 创建扫描器实例
scanner = EnhancedSecurityScanner(target='tests/test-ai-tool')

# 执行扫描
results = scanner.scan()

# 获取摘要
summary = scanner.get_summary()

print('\n扫描摘要:')
print(f'  目标：{summary["target"]}')
print(f'  总问题数：{summary["total_issues"]}')
print(f'  高风险：{summary["high_risk"]}')
print(f'  中风险：{summary["medium_risk"]}')
print(f'  低风险：{summary["low_risk"]}')

print('\n各类别问题数:')
# 从 results 中统计各类别问题数
category_counts = {}
for issue in results:
    if isinstance(issue, dict):
        category = issue.get('category', 'unknown')
        category_counts[category] = category_counts.get(category, 0) + 1

for category, count in sorted(category_counts.items()):
    if count > 0:
        print(f'  {category}: {count}')

print('\n高风险问题:')
for issue in results:
    if isinstance(issue, dict) and issue.get('severity') == 'high':
        print(f'  [{issue["category"]}] {issue["file"]}:{issue["line_number"]}')
        print(f'    问题：{issue["issue"]}')
        print()

print('\n测试完成!')
print('=' * 60)
