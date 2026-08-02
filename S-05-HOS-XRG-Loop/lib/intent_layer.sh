#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Intent Layer (L0)
# 动态目标树管理器
# ============================================================================
# 功能: 加载目标树、更新权重、计算目标对齐度
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"

STATE_FILE="$SCRIPT_DIR_PY/state/goal_weights.json"
CONFIG_FILE="$SCRIPT_DIR_PY/config/goal_tree.yaml"

# ── 颜色定义 ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# 加载目标树（从 JSON 状态文件）
# ============================================================================
load_goal_tree() {
  if [ ! -f "$STATE_FILE" ]; then
    echo "{\"error\":\"state_file_not_found\",\"path\":\"$STATE_FILE\"}"
    return 1
  fi
  cat "$STATE_FILE"
}

# ============================================================================
# 获取指定分支的当前权重
# ============================================================================
get_branch_weight() {
  local branch_id="$1"
  local state
  state=$(load_goal_tree) || return 1

  echo "$state" | python3 -c "
import sys, json
data = json.load(sys.stdin)
branches = data.get('branches', {})
if '$branch_id' in branches:
    print(branches['$branch_id']['weight'])
else:
    print('ERROR:branch_not_found')
"
}

# ============================================================================
# 获取所有分支的权重映射
# ============================================================================
get_all_weights() {
  local state
  state=$(load_goal_tree) || return 1

  echo "$state" | python3 -c "
import sys, json
data = json.load(sys.stdin)
branches = data.get('branches', {})
for bid, bdata in branches.items():
    print(f'{bid}:{bdata[\"weight\"]}')
"
}

# ============================================================================
# 更新目标权重（指数平滑法）
# ============================================================================
# 参数:
#   $1: branch_id
#   $2: new_raw_weight (0~1, 来自 Reality Score 映射)
# ============================================================================
update_branch_weight() {
  local branch_id="$1"
  local new_raw="$2"

  if [ -z "$branch_id" ] || [ -z "$new_raw" ]; then
    echo -e "${RED}[INTENT] 错误: 缺少参数 branch_id 或 new_raw${NC}"
    return 1
  fi

  # 读取配置中的 alpha 值
  local alpha
  alpha=$(python3 -c "
import yaml
with open('$CONFIG_FILE') as f:
    config = yaml.safe_load(f)
print(config['goal_tree']['adjustment']['alpha'])
" 2>/dev/null || echo "0.3")

  local min_delta
  min_delta=$(python3 -c "
import yaml
with open('$CONFIG_FILE') as f:
    config = yaml.safe_load(f)
print(config['goal_tree']['adjustment']['min_delta'])
" 2>/dev/null || echo "0.02")

  local cooldown
  cooldown=$(python3 -c "
import yaml
with open('$CONFIG_FILE') as f:
    config = yaml.safe_load(f)
print(config['goal_tree']['adjustment']['cooldown'])
" 2>/dev/null || echo "3")

  python3 -c "
import sys, json

with open('$STATE_FILE') as f:
    data = json.load(f)

branches = data.get('branches', {})
if '$branch_id' not in branches:
    print(f'ERROR:branch_not_found:$branch_id')
    sys.exit(1)

branch = branches['$branch_id']
current = branch['weight']
min_w = branch['min_weight']
max_w = branch['max_weight']

alpha = $alpha
min_delta = $min_delta

# 检查冷却期
cooldown = data.get('iterations_since_adjustment', 0)
if cooldown < $cooldown:
    print(f'SKIP:cooldown_active ({cooldown}/$cooldown)')
    sys.exit(0)

# 指数平滑: new = alpha * raw + (1 - alpha) * current
raw_adjusted = $new_raw
adjusted = alpha * raw_adjusted + (1 - alpha) * current

# 钳制到 [min, max]
adjusted = max(min_w, min(max_w, adjusted))

# 最小调整幅度检查
delta = abs(adjusted - current)
if delta < min_delta:
    print(f'SKIP:delta_too_small ({delta:.4f} < {min_delta})')
    sys.exit(0)

# 写入新权重
branch['weight'] = round(adjusted, 4)
data['iterations_since_adjustment'] = 0

# 记录历史
data.setdefault('history', []).append({
    'branch': '$branch_id',
    'from': current,
    'to': round(adjusted, 4),
    'raw_input': raw_adjusted,
    'alpha': alpha
})

# 保留最近 50 条历史
data['history'] = data['history'][-50:]

with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'OK:{current:.4f}->{adjusted:.4f}')
" | while read -r line; do
    case "$line" in
      OK:*)
        echo -e "${GREEN}[INTENT] 权重已更新: $branch_id ${line#OK:}${NC}"
        ;;
      SKIP:*)
        echo -e "${YELLOW}[INTENT] 权重未更新: $branch_id (${line#SKIP:})${NC}"
        ;;
      ERROR:*)
        echo -e "${RED}[INTENT] ${line#ERROR:}${NC}"
        ;;
    esac
  done
}

# ============================================================================
# 计算目标对齐度 — 某次 commit 与目标树的匹配程度
# ============================================================================
# 参数:
#   stdin: commit message
# 输出: alignment_score (0~1)
# ============================================================================
compute_goal_alignment() {
  local commit_msg
  commit_msg=$(cat)

  if [ -z "$commit_msg" ]; then
    echo "0.0"
    return 0
  fi

  python3 -c "
import sys, json

with open('$STATE_FILE') as f:
    data = json.load(f)

branches = data.get('branches', {})
msg = '''$commit_msg'''.lower()

# 每个分支的关键词
keywords = {
    'stability': ['fix', 'bug', 'stable', 'drift', 'test', 'refactor', 'clean', 'error', 'protect', 'guard'],
    'usefulness': ['feature', 'add', 'support', 'enable', 'implement', 'value', 'use', 'function', 'capability', 'improve'],
    'simplicity': ['simplify', 'remove', 'reduce', 'refactor', 'clean', 'delete', 'merge', 'dedup', 'extract', 'inline']
}

total_weight = sum(b['weight'] for b in branches.values())
if total_weight == 0:
    print('0.0')
    sys.exit(0)

weighted_sum = 0.0
for bid, bdata in branches.items():
    kw = keywords.get(bid, [])
    matches = sum(1 for k in kw if k in msg)
    # 匹配度: 0~1, 3个以上关键词命中即满分
    match_score = min(1.0, matches / 3.0)
    weighted_sum += bdata['weight'] * match_score

score = weighted_sum / total_weight
print(f'{score:.4f}')
"
}

# ============================================================================
# 生成目标树摘要报告
# ============================================================================
report_goal_tree() {
  local state
  state=$(load_goal_tree) || return 1

  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}  🎯 Goal Tree Report (目标树报告)${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"

  echo "$state" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  根目标: {data[\"root\"]}')
print(f'  迭代冷却: {data.get(\"iterations_since_adjustment\", \"N/A\")}')
print()
branches = data.get('branches', {})
print(f'  {\"分支\":<15} {\"当前权重\":<12} {\"范围\":<16}')
print(f'  {\"─\"*15} {\"─\"*12} {\"─\"*16}')
sorted_b = sorted(branches.items(), key=lambda x: x[1]['weight'], reverse=True)
for bid, bdata in sorted_b:
    w = bdata['weight']
    bar = '█' * int(w * 20) + '░' * (20 - int(w * 20))
    print(f'  {bid:<15} {w:<8.4f}  {bar}')
print()
print(f'  历史记录: {len(data.get(\"history\", []))} 次调整')
"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  load)
    load_goal_tree
    ;;
  weight)
    get_branch_weight "$2"
    ;;
  weights)
    get_all_weights
    ;;
  update)
    update_branch_weight "$2" "$3"
    ;;
  alignment)
    compute_goal_alignment
    ;;
  report)
    report_goal_tree
    ;;
  *)
    echo "Usage: intent_layer.sh <command>"
    echo "  load      — 加载目标树"
    echo "  weight    — 获取分支权重 <branch_id>"
    echo "  weights   — 获取所有分支权重"
    echo "  update    — 更新分支权重 <branch_id> <raw_score>"
    echo "  alignment — 计算 commit 对齐度（从 stdin 读消息）"
    echo "  report    — 生成目标树报告"
    ;;
esac
