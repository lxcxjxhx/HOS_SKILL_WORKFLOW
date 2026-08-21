#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Complexity Debt System
# 复杂度债务追踪器
# ============================================================================
# 功能:
#   每次 commit 累计复杂度债务
#   超过阈值 → 强制进入 CLEAN MODE（重构模式）
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"

STATE_FILE="$SCRIPT_DIR_PY/state/complexity_debt.json"
SETTINGS_FILE="$SCRIPT_DIR_PY/config/settings.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# 分析 diff 中的复杂度成本
# ============================================================================
analyze_complexity_cost() {
  local diff_content
  diff_content=$(cat)

  python3 -c "
import sys, re, json

diff = '''$diff_content'''

# 参数
new_file_cost = 0.15
new_abstraction_cost = 0.25
new_dependency_cost = 0.30

costs = {
    'new_files': 0,
    'new_abstractions': 0,
    'new_dependencies': 0,
}

# 1. 新文件检测
new_files = re.findall(r'^\+\+\+ b/(\S+)', diff, re.MULTILINE)
existing_files = re.findall(r'^--- a/(\S+)', diff, re.MULTILINE)
# 真正的新文件：出现在 +++ 但不在 ---
truly_new = [f for f in new_files if f not in existing_files]
costs['new_files'] = len(truly_new)

# 2. 新抽象检测
abstraction_patterns = [
    r'^\+.*\b(interface|abstract)\s+\w+',
    r'^\+.*\b(factory|provider|middleware|plugin|adapter|builder|decorator|proxy|facade)\b',
    r'^\+.*\b(observer|listener|handler|strategy|registry|container|injector)\b',
    r'^\+.*class\s+\w+.*extends',
    r'^\+.*implements\s+\w+',
    r'^\+.*\w+\s*=\s*lambda\s+\w+.*\blambda\b',
]

abstraction_count = 0
for pat in abstraction_patterns:
    matches = re.findall(pat, diff, re.MULTILINE | re.IGNORECASE)
    abstraction_count += len(matches)

costs['new_abstractions'] = abstraction_count

# 3. 新依赖检测
dep_patterns = [
    r'^\+.*(?:import|require|include)\s+[\"\'][^\"\']+[\"\']',
    r'^\+.*npm\s+install\s+',
    r'^\+.*pip(?:3)?\s+install\s+',
    r'^\+.*yarn\s+add\s+',
    r'^\+.*go\s+get\s+',
    r'^\+.*cargo\s+add\s+',
    r'^\+.*nuget\s+install\s+',
    r'^\+.*gem\s+install\s+',
    r'^\+.*FROM\s+\w+',
]

dep_count = 0
for pat in dep_patterns:
    matches = re.findall(pat, diff, re.MULTILINE)
    dep_count += len(matches)

costs['new_dependencies'] = dep_count

# 计算总成本
total_cost = (
    costs['new_files'] * new_file_cost +
    costs['new_abstractions'] * new_abstraction_cost +
    costs['new_dependencies'] * new_dependency_cost
)

costs['total_cost'] = round(total_cost, 4)
print(json.dumps(costs))
"
}

# ============================================================================
# 累计债务
# ============================================================================
accumulate_debt() {
  local total_cost="$1"

  python3 -c "
import sys, json, datetime

with open('$STATE_FILE') as f:
    data = json.load(f)

cost = float('$total_cost')
data['total_debt'] = round(data['total_debt'] + cost, 4)

# 更新明细
brk = data.get('breakdown', {})
brk['new_files'] = brk.get('new_files', 0) + 0  # 由 analyze 返回
brk['new_abstractions'] = brk.get('new_abstractions', 0) + 0
brk['new_dependencies'] = brk.get('new_dependencies', 0) + 0

data['breakdown'] = brk
data['last_updated'] = datetime.datetime.now().isoformat()

# 记录历史
data.setdefault('history', []).append({
    'timestamp': datetime.datetime.now().isoformat(),
    'added': cost,
    'total': data['total_debt'],
    'limit': data['limit']
})

# 保留最近 100 条
data['history'] = data['history'][-100:]

with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print(f'{data[\"total_debt\"]}')
"
}

# ============================================================================
# 检查是否需要进入 CLEAN MODE
# ============================================================================
check_clean_mode_needed() {
  python3 -c "
import json

with open('$STATE_FILE') as f:
    data = json.load(f)

debt = data['total_debt']
limit = data['limit']
ratio = debt / limit if limit > 0 else 0

force_threshold = 0.8  # 从配置读
debt_threshold = 1.0

# 强制 CLEAN MODE
if debt >= limit:
    print(f'FORCE:{ratio}:{debt}:{limit}')
elif ratio >= 0.8:
    print(f'WARN:{ratio}:{debt}:{limit}')
else:
    print(f'OK:{ratio}:{debt}:{limit}')
"
}

# ============================================================================
# 执行 CLEAN MODE
# ============================================================================
run_clean_mode() {
  local repo_dir="${1:-.}"

  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}  🧹 CLEAN MODE — 复杂度债务清理${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"

  cd "$repo_dir" || return 1

  # 1. 分析当前债务构成
  echo -e "\n${BLUE}[分析] 债务明细:${NC}"
  python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(f'  总债务: {data[\"total_debt\"]:.4f} / {data[\"limit\"]:.2f}')
print(f'  完成周期: {data.get(\"clean_cycles_completed\", 0)}')
" 2>/dev/null

  # 2. 寻找可清理项
  echo -e "\n${YELLOW}[扫描] 寻找可清理项...${NC}"

  local cleanup_candidates=()

  # 查找空文件
  while IFS= read -r -d '' f; do
    if [ ! -s "$f" ]; then
      cleanup_candidates+=("$f (空文件)")
    fi
  done < <(find "$repo_dir" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.json" -o -name "*.yaml" -o -name "*.md" \) -size 0 -print0 2>/dev/null)

  # 查找注释掉的代码
  local commented_count=0
  for f in $(find "$repo_dir" -name "*.sh" -o -name "*.py" 2>/dev/null | head -20); do
    local commented
    commented=$(grep -c "^#\|^//\|^--" "$f" 2>/dev/null)
    local total
    total=$(wc -l < "$f" 2>/dev/null)
    if [ "$total" -gt 0 ] && [ "$commented" -gt $((total / 2)) ]; then
      cleanup_candidates+=("$f (注释过多: ${commented}/${total})")
    fi
  done

  if [ ${#cleanup_candidates[@]} -gt 0 ]; then
    echo -e "${YELLOW}  发现 ${#cleanup_candidates[@]} 个清理候选:${NC}"
    for item in "${cleanup_candidates[@]}"; do
      echo "    • $item"
    done
  else
    echo -e "${GREEN}  未发现明显可清理项${NC}"
  fi

  # 3. 缩减债务
  local reduction
  reduction=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    config = yaml.safe_load(f)
print(config['complexity_debt']['clean_mode']['reduction_per_cycle'])
" 2>/dev/null || echo "0.4")

  python3 -c "
import json, datetime

with open('$STATE_FILE') as f:
    data = json.load(f)

reduction = float('$reduction')
new_debt = max(0.0, data['total_debt'] * (1.0 - reduction))
data['total_debt'] = round(new_debt, 4)
data['clean_cycles_completed'] = data.get('clean_cycles_completed', 0) + 1
data['in_clean_mode'] = False
if new_debt == 0:
    data['breakdown'] = {'new_files': 0, 'new_abstractions': 0, 'new_dependencies': 0}

data['last_updated'] = datetime.datetime.now().isoformat()

with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print(new_debt)
"

  echo -e "\n${GREEN}  ✓ CLEAN MODE 完成${NC}"
  echo -e "  ${BLUE}债务缩减: ${reduction} → 剩余: $(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d['total_debt'])")${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
}

# ============================================================================
# 报告
# ============================================================================
report_debt() {
  python3 -c "
import json

with open('$STATE_FILE') as f:
    data = json.load(f)

print('═' * 50)
print('  📊 复杂度债务报告')
print('═' * 50)
print(f'  总债务:       {data[\"total_debt\"]:.4f}')
print(f'  债务上限:     {data[\"limit\"]:.2f}')
print(f'  占用率:       {data[\"total_debt\"]/data[\"limit\"]*100:.1f}%')

ratio = data['total_debt'] / data['limit'] if data['limit'] > 0 else 0
bar_len = 25
filled = int(ratio * bar_len)
empty = bar_len - filled
bar = '█' * filled + '░' * empty
color = '\033[32m' if ratio < 0.5 else ('\033[33m' if ratio < 0.8 else '\033[31m')
print(f'  债务条:       {color}{bar}\033[0m')
print()
print(f'  CLEAN MODE 周期: {data.get(\"clean_cycles_completed\", 0)}')
print(f'  是否在 CLEAN MODE: {\"是\" if data.get(\"in_clean_mode\", False) else \"否\"}')
print()
brk = data.get('breakdown', {})
print(f'  历史明细:')
print(f'    新文件:       {brk.get(\"new_files\", 0)}')
print(f'    新抽象层:     {brk.get(\"new_abstractions\", 0)}')
print(f'    新依赖:       {brk.get(\"new_dependencies\", 0)}')
print(f'  历史记录: {len(data.get(\"history\", []))} 条')
print('═' * 50)
" 2>/dev/null
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  analyze)
    cat | analyze_complexity_cost
    ;;
  accumulate)
    accumulate_debt "$2"
    ;;
  check)
    check_clean_mode_needed
    ;;
  clean)
    run_clean_mode "${2:-.}"
    ;;
  report)
    report_debt
    ;;
  reset)
    python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
data['total_debt'] = 0.0
data['breakdown'] = {'new_files': 0, 'new_abstractions': 0, 'new_dependencies': 0}
data['in_clean_mode'] = False
with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('债务已重置')
"
    ;;
  *)
    echo "Usage: complexity_debt.sh <command>"
    echo "  analyze      — 分析 diff 复杂度成本（从 stdin 读 diff）"
    echo "  accumulate   — 累计债务 <cost>"
    echo "  check        — 检查是否需要 CLEAN MODE"
    echo "  clean        — 执行 CLEAN MODE"
    echo "  report       — 债务报告"
    echo "  reset        — 重置债务"
    ;;
esac
