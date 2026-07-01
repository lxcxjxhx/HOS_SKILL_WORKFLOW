#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Anti-Drift Preemption Engine
# 漂移预防引擎 — 在 commit 前预测是否会漂移
# ============================================================================
# 核心思想:
#   不是事后检测漂移，而是在 commit 前预测漂移概率
#   通过分析变更的主题、范围、复杂度三个维度
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"

SETTINGS_FILE="$SCRIPT_DIR_PY/config/settings.yaml"
STATE_FILE="$SCRIPT_DIR_PY/state/goal_weights.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# 指标1: Topic Shift — 检测主题漂移
# 比较当前变更与历史 commit 的主题一致性
# ============================================================================
detect_topic_shift() {
  local diff_content
  diff_content=$(cat)
  local sensitivity="${1:-0.6}"

  python3 -c "
import sys, re, json

diff = '''$diff_content'''
risk = 0.0
reasons = []

# 提取变更文件
changed_files = re.findall(r'^--- a/(\S+)|^\+\+\+ b/(\S+)', diff, re.MULTILINE)
changed_files = set(c for pair in changed_files for c in pair if c)

# 检查是否包含项目核心文件与边缘文件混合
core_patterns = ['claude.md', 'readme', 'config', 'makefile', 'package.json', 'main', 'index']
edge_patterns = ['example', 'demo', 'test_', 'spec_', 'tmp', 'backup', 'deprecated', 'archive']

core_hits = sum(1 for f in changed_files for p in core_patterns if p in f.lower())
edge_hits = sum(1 for f in changed_files for p in edge_patterns if p in f.lower())

if core_hits > 0 and edge_hits > 0:
    risk += 0.15
    reasons.append('核心文件与边缘文件混合修改')

# 提取 diff 中的关键词分布
added_lines = re.findall(r'^\+[^+](.*)', diff, re.MULTILINE)
all_text = ' '.join(added_lines).lower()

# 检测主题分散度
topics = {
    'infrastructure': ['config', 'setup', 'build', 'deploy', 'ci', 'docker', 'env'],
    'business_logic': ['process', 'handle', 'compute', 'transform', 'validate', 'parse'],
    'ui': ['display', 'render', 'show', 'format', 'print', 'output', 'view'],
    'data': ['store', 'save', 'load', 'read', 'write', 'cache', 'database', 'file'],
    'testing': ['test', 'assert', 'mock', 'spec', 'should', 'expect'],
}

topic_matches = {}
for topic, keywords in topics.items():
    matches = sum(1 for kw in keywords if kw in all_text)
    if matches > 0:
        topic_matches[topic] = matches

# 如果触及 3 个以上主题，有漂移风险
active_topics = len(topic_matches)
if active_topics >= 3:
    risk += 0.2 * min(1.0, (active_topics - 2) / 3)
    reasons.append(f'涉及过多主题 ({active_topics}: {list(topic_matches.keys())})')

# 检测无主题（纯随机关键词）
if active_topics == 0:
    risk += 0.3
    reasons.append('无法识别变更主题')

# 检测大量新增但很少删除（累积模式）
added = len(added_lines)
removed = len(re.findall(r'^-[^-](.*)', diff, re.MULTILINE))

if added > 0 and removed > 0:
    ratio = added / (added + removed)
    if ratio > 0.9:
        risk += 0.1
        reasons.append('几乎只有新增（累积倾向）')

# 应用敏感度
adjusted_risk = min(1.0, risk * (1.0 + float($sensitivity) - 0.5))
is_drifting = adjusted_risk > 0.35

print(json.dumps({
    'risk_score': round(adjusted_risk, 4),
    'is_drifting': is_drifting,
    'reasons': reasons,
    'active_topics': active_topics,
    'changed_files': list(changed_files)
}))
"
}

# ============================================================================
# 指标2: Complexity Spike — 检测复杂度突增
# ============================================================================
detect_complexity_spike() {
  local diff_content
  diff_content=$(cat)

  python3 -c "
import sys, re, json

diff = '''$diff_content'''
risk = 0.0
reasons = []

added_lines = re.findall(r'^\+[^+](.*)', diff, re.MULTILINE)
text = ' '.join(added_lines)

# 检测圈复杂度信号
complex_patterns = [
    (r'\bif\s+.*\band\b.*\bor\b', '多重条件'),
    (r'\bfor\b.*\bfor\b', '嵌套循环'),
    (r'\btry\b.*\bexcept\b.*\btry\b', '嵌套异常'),
    (r'\b(lambda|=>)\s*\{', '复杂 lambda'),
    (r'\bgoto\b', 'goto 语句'),
    (r'\beval\b', '危险 eval'),
    (r'\bexec\b', '危险 exec'),
    (r'\b反射\b', '反射使用'),
    (r'\b__import__\b', '动态导入'),
    (r'#\s*(TODO|FIXME|HACK|XXX)', '技术债务标记'),
]

for pattern, reason in complex_patterns:
    matches = re.findall(pattern, text, re.IGNORECASE)
    if len(matches) > 0:
        risk += 0.08 * len(matches)
        if len(matches) <= 2:
            reasons.append(f'{reason} x{len(matches)}')

# 检测单行过长（复杂度信号）
long_lines = [l for l in added_lines if len(l) > 120]
if long_lines:
    risk += 0.05 * len(long_lines)
    reasons.append(f'{len(long_lines)} 行超长代码')

# 检测函数/方法定义过多
function_defs = re.findall(r'^\+.*(?:def |function |=>|class )', diff, re.MULTILINE)
if len(function_defs) > 3:
    risk += 0.1
    reasons.append('单次变更定义过多函数/方法')

adjusted_risk = min(1.0, risk)
is_spiking = adjusted_risk > 0.3

print(json.dumps({
    'risk_score': round(adjusted_risk, 4),
    'is_spiking': is_spiking,
    'reasons': reasons,
    'function_count': len(function_defs)
}))
"
}

# ============================================================================
# 指标3: Goal Mismatch — 检测目标不匹配
# ============================================================================
detect_goal_mismatch() {
  local commit_msg
  commit_msg=$(cat)

  python3 -c "
import sys, json

with open('$STATE_FILE') as f:
    data = json.load(f)

branches = data.get('branches', {})
msg = '''$commit_msg'''.lower()

# 对每个目标分支计算匹配度
results = {}
for bid, bdata in branches.items():
    kw_map = {
        'stability': ['fix', 'bug', 'stable', 'drift', 'test', 'refactor', 'clean', 'error', 'protect'],
        'usefulness': ['feature', 'add', 'support', 'enable', 'implement', 'value', 'function', 'capability'],
        'simplicity': ['simplify', 'remove', 'reduce', 'refactor', 'clean', 'delete', 'merge', 'dedup']
    }
    keywords = kw_map.get(bid, [])
    matches = sum(1 for k in keywords if k in msg)
    weight = bdata['weight']
    results[bid] = {
        'keyword_matches': matches,
        'weight': weight,
        'match_score': min(1.0, matches / 3.0)
    }

# 计算加权匹配度
weighted_sum = sum(r['weight'] * r['match_score'] for r in results.values())
total_weight = sum(r['weight'] for r in results.values())

alignment = weighted_sum / total_weight if total_weight > 0 else 0.0

# 检测 mismatch
mismatch_risk = max(0.0, 1.0 - alignment * 2)
is_mismatch = mismatch_risk > 0.4

print(json.dumps({
    'alignment': round(alignment, 4),
    'mismatch_risk': round(mismatch_risk, 4),
    'is_mismatch': is_mismatch,
    'details': results,
    'message': msg[:80]
}))
"
}

# ============================================================================
# 综合漂移预测
# ============================================================================
predict_drift() {
  local diff_content
  diff_content=$(cat)
  local commit_msg="${1:-}"

  # 检测所有维度
  local topic_result
  local complexity_result
  local goal_result

  topic_result=$(echo "$diff_content" | detect_topic_shift)
  complexity_result=$(echo "$diff_content" | detect_complexity_spike)
  goal_result=$(echo "$commit_msg" | detect_goal_mismatch)

  # 从配置读取敏感度
  local sensitivity
  sensitivity=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    config = yaml.safe_load(f)
print(config['drift']['preemption']['sensitivity'])
" 2>/dev/null || echo "0.6")

  python3 -c "
import json, sys

topic = json.loads('''$topic_result''')
complexity = json.loads('''$complexity_result''')
goal = json.loads('''$goal_result''')

sensitivity = $sensitivity

# 权重: topic=0.35, complexity=0.30, goal=0.35
weighted_risk = (
    0.35 * topic['risk_score'] +
    0.30 * complexity['risk_score'] +
    0.35 * goal['mismatch_risk']
)

# 应用敏感度
adjusted_risk = min(1.0, weighted_risk * (0.5 + sensitivity))
should_preempt = adjusted_risk > 0.4

# 汇总所有原因
all_reasons = []
all_reasons.extend(topic.get('reasons', []))
all_reasons.extend(complexity.get('reasons', []))
if goal.get('is_mismatch'):
    all_reasons.append('与当前目标树不匹配')

result = {
    'drift_probability': round(adjusted_risk, 4),
    'should_preempt': should_preempt,
    'contributors': {
        'topic_shift': round(topic['risk_score'], 4),
        'complexity_spike': round(complexity['risk_score'], 4),
        'goal_mismatch': round(goal['mismatch_risk'], 4),
    },
    'reasons': all_reasons,
    'sensitivity_used': sensitivity
}

print(json.dumps(result, indent=2))
"
}

# ============================================================================
# 漂移预防建议
# ============================================================================
preempt_advice() {
  local drift_report="$1"

  python3 -c "
import json, sys

report = json.loads('''$drift_report''')
reasons = report.get('reasons', [])
contributors = report.get('contributors', {})
prob = report.get('drift_probability', 0)

print()
print('═' * 50)
print('  🛡️  漂移预防分析')
print('═' * 50)
print(f'  漂移概率: {prob:.1%}')
print()

# 找出主要贡献者
if contributors:
    sorted_c = sorted(contributors.items(), key=lambda x: x[1], reverse=True)
    print('  风险贡献:')
    label_map = {
        'topic_shift': '主题漂移',
        'complexity_spike': '复杂度突增',
        'goal_mismatch': '目标不匹配'
    }
    for key, val in sorted_c:
        l = label_map.get(key, key)
        bar = '█' * int(val * 20) + '░' * (20 - int(val * 20))
        print(f'    {l:<12} {val:.2f}  {bar}')

print()
if reasons:
    print('  风险因素:')
    for r in reasons:
        print(f'    • {r}')
print()

if report.get('should_preempt'):
    print('  🚨 建议: 暂缓当前 commit，考虑以下方案:')
    print('    1. 拆分变更 — 将无关修改分离到不同 commit')
    print('    2. 明确信息 — 在 message 中关联目标树分支')
    print('    3. 降低复杂度 — 简化新增抽象')
else:
    print('  ✅ 漂移风险可控，可以继续')
print('═' * 50)
"
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  topic-shift)
    shift
    cat | detect_topic_shift "$1"
    ;;
  complexity-spike)
    cat | detect_complexity_spike
    ;;
  goal-mismatch)
    cat | detect_goal_mismatch
    ;;
  predict)
    shift
    local msg="${1:-}"
    if [ -n "$msg" ]; then
      cat | predict_drift "$msg"
    else
      predict_drift ""
    fi
    ;;
  advise)
    shift
    preempt_advice "$1"
    ;;
  full)
    # 完整分析：从 stdin 读 diff，从参数读 commit message
    shift
    local commit_msg="${1:-}"
    local diff_content
    diff_content=$(cat)
    local result
    result=$(echo "$diff_content" | predict_drift "$commit_msg")
    echo "$result"
    echo "---"
    echo "$result" | preempt_advice
    ;;
  *)
    echo "Usage: anti_drift_preempt.sh <command>"
    echo "  topic-shift      — 检测主题漂移（从 stdin 读 diff）"
    echo "  complexity-spike  — 检测复杂度突增（从 stdin 读 diff）"
    echo "  goal-mismatch    — 检测目标不匹配（从 stdin 读 message）"
    echo "  predict          — 综合漂移预测"
    echo "  advise           — 生成预防建议"
    echo "  full             — 完整分析并给出建议"
    ;;
esac
