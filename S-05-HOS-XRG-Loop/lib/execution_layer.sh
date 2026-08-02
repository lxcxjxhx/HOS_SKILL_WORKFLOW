#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Execution Layer (L1)
# CVS (Commit Value Score) 评分引擎
# ============================================================================
# 功能: 计算每次 commit 的 CVS 分数，评估价值密度
# CVS = Impact × Clarity × Reversibility ÷ Complexity
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"

STATE_FILE="$SCRIPT_DIR_PY/state/cvs_history.json"
SETTINGS_FILE="$SCRIPT_DIR_PY/config/settings.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# 计算 Impact 分数
# ============================================================================
# 参数: $1 — git diff 统计字符串（insertions, deletions, files changed）
# 参数: stdin — git diff 内容
# ============================================================================
score_impact() {
  local diff_stats="$1"
  local diff_content
  diff_content=$(cat)

  python3 -c "
import sys, json

diff = '''$diff_content'''
stats = '''$diff_stats'''

score = 0.0

# 因子1: 文件变更规模 — 适中为佳（1-5文件为理想范围）
try:
    files = int(stats.split(',')[0].strip().split()[0]) if stats else 0
except:
    files = 0

if files == 0:
    file_score = 0.0
elif files <= 3:
    file_score = 0.9    # 集中改动 — 高价值
elif files <= 8:
    file_score = 0.7    # 中等范围
elif files <= 15:
    file_score = 0.4    # 较大改动 — 可能有无关变更
else:
    file_score = 0.2    # 大范围改动 — 高漂移风险

# 因子2: 是否包含关键模式
critical_patterns = ['fix(', 'error', 'bug', 'crash', 'security', 'test', 'feature']
feature_patterns = ['add', 'implement', 'new', 'support', 'enable']
cleanup_patterns = ['refactor', 'clean', 'remove', 'simplify', 'rename']

msg_lower = diff[:500].lower()
critical_matches = sum(1 for p in critical_patterns if p in msg_lower)
feature_matches = sum(1 for p in feature_patterns if p in msg_lower)
cleanup_matches = sum(1 for p in cleanup_patterns if p in msg_lower)

pattern_score = 0.0
if critical_matches >= 2:
    pattern_score = 0.9
elif critical_matches >= 1:
    pattern_score = 0.7
elif feature_matches >= 2:
    pattern_score = 0.6
elif feature_matches >= 1:
    pattern_score = 0.4
elif cleanup_matches >= 1:
    pattern_score = 0.3

# 因子3: 变更大小（insertions + deletions）
try:
    ins = int(stats.split(',')[0].strip().split()[0]) if 'insertion' in stats else 0
    dels = int(stats.split(',')[1].strip().split()[0]) if 'deletion' in stats else 0
except:
    ins, dels = 0, 0

total_changes = ins + dels
if total_changes == 0:
    size_score = 0.0
elif total_changes <= 20:
    size_score = 0.5    # 小改动
elif total_changes <= 100:
    size_score = 0.8    # 中等 — 理想
elif total_changes <= 500:
    size_score = 0.6    # 较大
else:
    size_score = 0.3    # 超大改动

# 综合 Impact 分数
score = 0.4 * file_score + 0.35 * pattern_score + 0.25 * size_score
score = max(0.0, min(1.0, score))
print(f'{score:.4f}')
"
}

# ============================================================================
# 计算 Clarity 分数
# ============================================================================
# 参数: stdin — commit message
# ============================================================================
score_clarity() {
  local msg
  msg=$(cat)

  python3 -c "
import sys

msg = '''$msg'''
score = 0.0

if not msg or msg.strip() == '':
    print('0.0')
    sys.exit(0)

lines = msg.strip().split('\n')
first_line = lines[0].strip()

# 因子1: 标题长度（50-72字符为佳）
length = len(first_line)
if 10 <= length <= 72:
    length_score = 0.8
elif 5 <= length < 10:
    length_score = 0.5
elif length > 72:
    length_score = 0.4
else:
    length_score = 0.2

# 因子2: 动词开头（commit message 规范）
verbs = ['add', 'fix', 'update', 'remove', 'refactor', 'implement', 'change',
         'improve', 'rename', 'move', 'extract', 'introduce', 'bump', 'enable',
         'disable', 'support', 'clean', 'simplify', 'merge', 'revert', 'bump',
         'upgrade', 'downgrade', 'correct', 'optimize']

starts_with_verb = any(first_line.lower().startswith(v) for v in verbs)
verb_score = 0.8 if starts_with_verb else 0.3

# 因子3: 是否有具体描述（多行或标点表明）
has_detail = len(lines) > 1 or ':' in first_line or '#' in first_line
detail_score = 0.7 if has_detail else 0.4

# 因子4: 禁止无意义消息
meaningless = ['update', 'wip', 'fix', 'changes', 'stuff', 'temp', 'asdf',
               'test', 'temp', 'oops', 'minor', 'tweak', 'nit']
is_meaningless = first_line.lower().strip() in meaningless
if is_meaningless:
    print('0.1')
    sys.exit(0)

# 综合
score = 0.35 * length_score + 0.35 * verb_score + 0.30 * detail_score
score = max(0.0, min(1.0, score))
print(f'{score:.4f}')
"
}

# ============================================================================
# 计算 Reversibility 分数
# ============================================================================
# 参数: $1 — git commit hash（如已提交），或空（未提交）
# ============================================================================
score_reversibility() {
  local commit_hash="$1"

  python3 -c "
import sys, subprocess, os

score = 0.5  # 默认中等可逆性

if '$commit_hash' and '$commit_hash' != '':
    # 已提交 — 检查是否容易 revert
    try:
        result = subprocess.run(
            ['git', 'diff', '--stat', '$commit_hash^..$commit_hash'],
            capture_output=True, text=True, timeout=5
        )
        stats = result.stdout

        # 解析文件数量
        lines = stats.strip().split('\n')
        file_count = len([l for l in lines if l.strip()])

        # 文件越少越容易回滚
        if file_count == 0:
            file_score = 0.0
        elif file_count <= 2:
            file_score = 0.9
        elif file_count <= 5:
            file_score = 0.7
        elif file_count <= 10:
            file_score = 0.5
        else:
            file_score = 0.3

        # 检查是否有 schema / migration / lockfile 变更
        try:
            diff_files = subprocess.run(
                ['git', 'diff', '--name-only', '$commit_hash^..$commit_hash'],
                capture_output=True, text=True, timeout=5
            )
            changed_files = diff_files.stdout.lower()
            has_breaking = any(kw in changed_files for kw in
                ['migration', 'schema', 'lock.json', 'yarn.lock', 'package-lock',
                 'database', 'db/', 'config/', '.env'])

            breaking_penalty = 0.3 if has_breaking else 0.0
        except:
            breaking_penalty = 0.0

        score = file_score - breaking_penalty
    except:
        score = 0.5
else:
    # 未提交 — 基于 staged 变更评估
    try:
        result = subprocess.run(
            ['git', 'diff', '--cached', '--stat'],
            capture_output=True, text=True, timeout=5
        )
        stats = result.stdout.strip()
        lines = [l for l in stats.split('\n') if l.strip()]
        file_count = len(lines)

        if file_count <= 2:
            score = 0.9
        elif file_count <= 5:
            score = 0.7
        elif file_count <= 10:
            score = 0.5
        else:
            score = 0.3
    except:
        score = 0.5

score = max(0.0, min(1.0, score))
print(f'{score:.4f}')
"
}

# ============================================================================
# 计算 Complexity 惩罚
# ============================================================================
# 参数: stdin — git diff 内容
# ============================================================================
score_complexity_penalty() {
  local diff_content
  diff_content=$(cat)

  python3 -c "
import sys, re

diff = '''$diff_content'''
penalty = 0.0

# 因子1: 新文件
new_files = re.findall(r'^\+\+\+ b/(\S+)', diff, re.MULTILINE)
new_file_count = len(new_files)
file_penalty = 0.08 * new_file_count

# 因子2: 新抽象模式（接口、抽象类、泛型、工厂）
abstraction_patterns = [
    r'^\+.*interface\s+\w+',
    r'^\+.*abstract\s+(class|method)',
    r'^\+.*new\s+interface',
    r'^\+.*factory',
    r'^\+.*provider',
    r'^\+.*delegate',
    r'^\+.*generic',
    r'^\+.*template',
    r'^\+.*middleware',
    r'^\+.*plugin',
    r'^\+.*adapter',
    r'^\+.*builder',
]

abstraction_count = 0
for pat in abstraction_patterns:
    matches = re.findall(pat, diff, re.MULTILINE)
    abstraction_count += len(matches)

abstraction_penalty = 0.04 * abstraction_count

# 因子3: 新依赖引入
dep_patterns = [
    r'^\+.*import\s+new',
    r'^\+.*require\(',
    r'^\+.*from\s+['\"]',
    r'^\+.*npm\s+install',
    r'^\+.*pip\s+install',
    r'^\+.*go\s+get',
    r'^\+.*dependency',
]

dep_count = 0
for pat in dep_patterns:
    matches = re.findall(pat, diff, re.MULTILINE)
    dep_count += len(matches)

dep_penalty = 0.05 * dep_count

# 因子4: 代码行数膨胀
added_lines = len(re.findall(r'^\+[^+]', diff, re.MULTILINE))
removed_lines = len(re.findall(r'^-[^-]', diff, re.MULTILINE))

if added_lines + removed_lines > 0:
    net_growth = (added_lines - removed_lines) / (added_lines + removed_lines)
    if net_growth > 0.3:
        growth_penalty = 0.08 * (net_growth - 0.3) * 2
    else:
        growth_penalty = 0.0
else:
    growth_penalty = 0.0

# 综合惩罚
penalty = file_penalty + abstraction_penalty + dep_penalty + growth_penalty
penalty = min(0.5, penalty)  # 最大惩罚 0.5
print(f'{penalty:.4f}')
"
}

# ============================================================================
# 计算完整的 CVS
# CVS = Impact × Clarity × Reversibility ÷ Complexity
# 实际: cvs = max(0, impact_score * clarity_score * reversibility - complexity_penalty)
# ============================================================================
compute_cvs() {
  local diff_stats="$1"
  local commit_hash="${2:-}"
  local diff_content
  diff_content=$(cat)

  # 计算各维度
  local impact
  impact=$(echo "$diff_content" | score_impact "$diff_stats")

  local clarity
  # 从 diff 中提取 commit message（如果可用）
  if [ -n "$commit_hash" ]; then
    clarity=$(git log --format="%B" -n 1 "$commit_hash" 2>/dev/null | score_clarity)
  else
    clarity=$(git log --format="%B" -n 1 HEAD 2>/dev/null | score_clarity)
  fi

  local reversibility
  reversibility=$(score_reversibility "$commit_hash")

  local complexity
  complexity=$(echo "$diff_content" | score_complexity_penalty)

  # 计算最终 CVS
  python3 -c "
impact = float('$impact')
clarity = float('$clarity')
reversibility = float('$reversibility')
complexity = float('$complexity')

# CVS = max(0, Impact * Clarity * Reversibility - Complexity)
raw_cvs = impact * clarity * reversibility
cvs = max(0.0, raw_cvs - complexity)

print(f'{cvs:.4f}')
print(f'IMPACT:{impact}')
print(f'CLARITY:{clarity}')
print(f'REVERSIBILITY:{reversibility}')
print(f'COMPLEXITY_PENALTY:{complexity}')
" | while IFS=: read -r key value; do
    case "$key" in
      IMPACT)     impact_score="$value" ;;
      CLARITY)    clarity_score="$value" ;;
      REVERSIBILITY) reversibility_score="$value" ;;
      COMPLEXITY_PENALTY) complexity_penalty="$value" ;;
      *)
        if [[ "$key" =~ ^[0-9] ]]; then
          cvs_score="$key"
          echo "$cvs_score:$impact_score:$clarity_score:$reversibility_score:$complexity_penalty"
        fi
        ;;
    esac
  done
}

# ============================================================================
# 判断 CVS 是否通过阈值
# ============================================================================
is_cvs_approved() {
  local cvs_score="$1"

  local threshold
  threshold=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    config = yaml.safe_load(f)
print(config['cvs']['threshold'])
" 2>/dev/null || echo "0.50")

  if python3 -c "exit(0 if $cvs_score >= $threshold else 1)" 2>/dev/null; then
    return 0  # 通过
  else
    return 1  # 拒绝
  fi
}

# ============================================================================
# 记录 CVS 到历史
# ============================================================================
record_cvs() {
  local cvs_score="$1"
  local impact="$2"
  local clarity="$3"
  local reversibility="$4"
  local complexity="$5"
  local commit_msg="$6"
  local approved="$7"

  python3 -c "
import sys, json, datetime

with open('$STATE_FILE') as f:
    data = json.load(f)

record = {
    'timestamp': datetime.datetime.now().isoformat(),
    'cvs': float('$cvs_score'),
    'impact': float('$impact'),
    'clarity': float('$clarity'),
    'reversibility': float('$reversibility'),
    'complexity_penalty': float('$complexity'),
    'commit_message': '''$commit_msg'''.strip()[:100],
    'approved': $approved
}

data['scores'].append(record)
data['total_commits_scored'] += 1

if not $approved:
    data['rejections'] += 1

# 保留最近 200 条
data['scores'] = data['scores'][-200:]

# 更新平均分
all_scores = [s['cvs'] for s in data['scores']]
data['average_score'] = round(sum(all_scores) / len(all_scores), 4) if all_scores else None

data['last_updated'] = datetime.datetime.now().isoformat()

with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('OK')
"
}

# ============================================================================
# 生成 CVS 报告
# ============================================================================
report_cvs() {
  local cvs_score="$1"
  local impact="$2"
  local clarity="$3"
  local reversibility="$4"
  local complexity="$5"

  echo -e "${CYAN}────── CVS 评分报告 ──────${NC}"
  printf "${BLUE}  Impact:         ${NC}%-8.4f %s\n" "$impact" "$(bar_chart "$impact")"
  printf "${BLUE}  Clarity:        ${NC}%-8.4f %s\n" "$clarity" "$(bar_chart "$clarity")"
  printf "${BLUE}  Reversibility:  ${NC}%-8.4f %s\n" "$reversibility" "$(bar_chart "$reversibility")"
  printf "${BLUE}  Complexity:     ${NC}%-8.4f %s（惩罚）\n" "$complexity" "$(bar_chart "$complexity" 1)"

  local effective
  effective=$(python3 -c "print(max(0.0, $impact * $clarity * $reversibility - $complexity))")

  echo ""
  printf "${CYAN}  CVS = %.4f × %.4f × %.4f - %.4f = ${NC}" "$impact" "$clarity" "$reversibility" "$complexity"
  if python3 -c "exit(0 if $cvs_score >= 0.50 else 1)" 2>/dev/null; then
    echo -e "${GREEN}${cvs_score} ✅${NC}"
  elif python3 -c "exit(0 if $cvs_score >= 0.30 else 1)" 2>/dev/null; then
    echo -e "${YELLOW}${cvs_score} ⚠️${NC}"
  else
    echo -e "${RED}${cvs_score} ❌${NC}"
  fi

  local threshold
  threshold=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    config = yaml.safe_load(f)
print(config['cvs']['threshold'])
" 2>/dev/null || echo "0.50")

  echo ""
  printf "  阈值: %.2f  |  " "$threshold"
  if python3 -c "exit(0 if $cvs_score >= $threshold else 1)" 2>/dev/null; then
    echo -e "${GREEN}✓ 已通过 CVS 门禁${NC}"
  else
    echo -e "${RED}✗ 低于阈值 — 禁止 commit${NC}"
  fi
  echo -e "${CYAN}──────────────────────────${NC}"
}

# ── 辅助：生成字符进度条 ──
bar_chart() {
  local val="$1"
  local inverted="${2:-0}"
  local width=20
  local filled
  filled=$(python3 -c "print(int(min(1.0, max(0.0, $val)) * $width))")
  local empty=$((width - filled))

  if [ "$inverted" = "1" ]; then
    # 复杂度：越高越差
    printf "${RED}%s${NC}%s" "$(python3 -c "print('█' * $filled)")" "$(python3 -c "print('░' * $empty)")"
  else
    printf "${GREEN}%s${NC}%s" "$(python3 -c "print('█' * $filled)")" "$(python3 -c "print('░' * $empty)")"
  fi
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  compute)
    diff_stats="${2:-}"
    commit_hash="${3:-}"
    cat | compute_cvs "$diff_stats" "$commit_hash"
    ;;
  approve)
    is_cvs_approved "$2" && echo "APPROVED" || echo "REJECTED"
    ;;
  record)
    record_cvs "$2" "$3" "$4" "$5" "$6" "$7" "$8"
    ;;
  report)
    report_cvs "$2" "$3" "$4" "$5" "$6"
    ;;
  history)
    python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(f'总评分次数: {data[\"total_commits_scored\"]}')
print(f'拒绝次数: {data[\"rejections\"]}')
print(f'平均分: {data[\"average_score\"]}')
print(f'最近评分:')
for s in data['scores'][-10:]:
    ts = s['timestamp'][:19]
    mark = '✅' if s['approved'] else '❌'
    print(f'  {mark} [{ts}] CVS={s[\"cvs\"]:.4f} {s[\"commit_message\"][:50]}')
"
    ;;
  *)
    echo "Usage: execution_layer.sh <command>"
    echo "  compute   — 计算 CVS（从 stdin 读 diff）"
    echo "  approve   — 判断 CVS 是否通过 <score>"
    echo "  record    — 记录 CVS 到历史"
    echo "  report    — 生成评分报告"
    echo "  history   — 查看历史评分"
    ;;
esac
