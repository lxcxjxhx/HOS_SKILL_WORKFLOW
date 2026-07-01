#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Reality Layer (L2)
# 现实验证器 — 核心升级
# ============================================================================
# 功能:
#   每次 commit 后验证三件事:
#   1. 执行结果 — 能否运行？报错是否减少？
#   2. 使用行为 — 是否被调用？实际可用？
#   3. 结构健康度 — 复杂度增减？耦合度变化？
#
#   Reality Score 连续下降 → 自动触发 rollback
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"

STATE_FILE="$SCRIPT_DIR_PY/state/reality_history.json"
SETTINGS_FILE="$SCRIPT_DIR_PY/config/settings.yaml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================================================
# 维度1: 执行结果验证 (Execution)
# 验证代码能否正常运行，报错是否减少
# ============================================================================
validate_execution() {
  local repo_dir="${1:-.}"
  local score=0.0
  local details=()

  echo -e "${BLUE}[REALITY] 验证执行结果...${NC}"

  # 1.1 检查是否有测试
  if [ -d "$repo_dir/tests" ] || [ -d "$repo_dir/test" ] || [ -f "$repo_dir/Makefile" ] || [ -f "$repo_dir/package.json" ]; then
    # 尝试运行测试（如果有）
    if [ -f "$repo_dir/Makefile" ]; then
      if make test 2>/dev/null; then
        score=0.9
        details+=("测试通过")
      elif make check 2>/dev/null; then
        score=0.8
        details+=("make check 通过")
      else
        score=0.3
        details+=("测试执行失败")
      fi
    elif [ -f "$repo_dir/package.json" ]; then
      if npm test 2>/dev/null; then
        score=0.9
        details+=("npm test 通过")
      elif npm run test 2>/dev/null; then
        score=0.8
        details+=("npm run test 通过")
      else
        score=0.3
        details+=("npm test 失败")
      fi
    elif [ -f "$repo_dir/pyproject.toml" ] || [ -f "$repo_dir/setup.py" ]; then
      if python3 -m pytest tests/ 2>/dev/null; then
        score=0.9
        details+=("pytest 通过")
      else
        score=0.3
        details+=("pytest 失败")
      fi
    elif [ -f "$repo_dir/Cargo.toml" ]; then
      if cargo test 2>/dev/null; then
        score=0.9
        details+=("cargo test 通过")
      else
        score=0.3
        details+=("cargo test 失败")
      fi
    else
      # 有测试目录但无已知框架 — 尝试通用
      score=0.5
      details+=("有测试目录但无已知测试框架")
    fi
  else
    # 无测试 — 检查是否能至少解析语法
    if [ -d "$repo_dir" ]; then
      # 尝试基础语法检查
      local syntax_ok=true
      for f in $(find "$repo_dir" -name "*.py" -maxdepth 3 2>/dev/null | head -5); do
        if ! python3 -m py_compile "$f" 2>/dev/null; then
          syntax_ok=false
          break
        fi
      done
      for f in $(find "$repo_dir" -name "*.sh" -maxdepth 3 2>/dev/null | head -5); do
        if ! bash -n "$f" 2>/dev/null; then
          syntax_ok=false
          break
        fi
      done

      if $syntax_ok; then
        score=0.6
        details+=("语法检查通过（无测试）")
      else
        score=0.2
        details+=("语法检查失败")
      fi
    else
      score=0.1
      details+=("目录不存在")
    fi
  fi

  echo -e "  → 执行评分: ${score} (${details[*]})"
  echo "$score:$details"
}

# ============================================================================
# 维度2: 结构健康度 (Maintainability)
# 评估代码复杂度变化、耦合度
# ============================================================================
validate_maintainability() {
  local repo_dir="${1:-.}"
  local score=0.0
  local details=()

  echo -e "${BLUE}[REALITY] 验证结构健康度...${NC}"

  # 2.1 统计文件数量变化
  local file_count
  file_count=$(find "$repo_dir" -type f -name "*.sh" -o -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.yaml" -o -name "*.json" 2>/dev/null | wc -l)

  # 2.2 检查层级深度（间接衡量复杂度）
  local max_depth
  max_depth=$(find "$repo_dir" -type d -not -path '*/\.*' 2>/dev/null | awk -F'/' '{if(NF>max) max=NF}END{print max}')
  max_depth="${max_depth:-0}"

  # 2.3 检查超大文件
  local large_files
  large_files=$(find "$repo_dir" -type f \( -name "*.sh" -o -name "*.py" -o -name "*.js" -o -name "*.ts" \) -not -path '*/\.*' 2>/dev/null | xargs wc -l 2>/dev/null | sort -rn | head -3 || echo "")

  # 评分逻辑
  # 文件数过多或过少都是信号
  if [ "$file_count" -eq 0 ]; then
    score=0.3
    details+=("无源文件")
  elif [ "$file_count" -le 3 ]; then
    score=0.5
    details+=("文件较少")
  elif [ "$file_count" -le 30 ]; then
    score=0.9
    details+=("文件数适中")
  elif [ "$file_count" -le 100 ]; then
    score=0.7
    details+=("文件数较多")
  else
    score=0.4
    details+=("文件数过多")
  fi

  # 目录深度惩罚
  if [ "$max_depth" -gt 8 ]; then
    depth_penalty=0.2
  elif [ "$max_depth" -gt 5 ]; then
    depth_penalty=0.1
  else
    depth_penalty=0.0
  fi

  if python3 -c "exit(0 if $depth_penalty > 0.0 else 1)" 2>/dev/null; then
    details+=("目录深度 ${max_depth}（惩罚 ${depth_penalty}）")
  fi

  score=$(python3 -c "print(max(0.0, $score - $depth_penalty))")

  # 2.4 检查是否出现不必要的拷贝（重复代码信号）
  local dup_penalty=0.0
  if [ "$file_count" -gt 5 ]; then
    # 检查同名函数/类定义出现次数（粗略重复检测）
    local func_count
    func_count=$(grep -r "^function " "$repo_dir" 2>/dev/null | sort | uniq -d | wc -l)
    func_count=$((func_count + $(grep -r "^def " "$repo_dir" 2>/dev/null | sort | uniq -d | wc -l)))
    if [ "$func_count" -gt 0 ]; then
      dup_penalty=$(python3 -c "print(min(0.2, $func_count * 0.05))")
      details+=("检测到 ${func_count} 个重复定义")
    fi
  fi

  score=$(python3 -c "print(max(0.0, $score - $dup_penalty))")
  score=$(python3 -c "print(min(1.0, $score))")

  echo -e "  → 结构健康评分: ${score} (${details[*]})"
  echo "$score:$details"
}

# ============================================================================
# 维度3: 可用性验证 (Usability)
# 检查新代码是否可用、是否被实际使用
# ============================================================================
validate_usability() {
  local repo_dir="${1:-.}"
  local score=0.0
  local details=()

  echo -e "${BLUE}[REALITY] 验证可用性...${NC}"

  # 3.1 检查是否有 README 或文档
  local has_docs=false
  if [ -f "$repo_dir/README.md" ] || [ -f "$repo_dir/README.txt" ] || [ -f "$repo_dir/README" ]; then
    has_docs=true
    details+=("有 README")
  fi

  # 3.2 检查是否可执行（有主入口）
  local has_entry=false
  if ls "$repo_dir"/*.sh 2>/dev/null | head -1 >/dev/null; then
    has_entry=true
    details+=("有 shell 入口")
  elif [ -f "$repo_dir/main.py" ] || [ -f "$repo_dir/index.js" ] || [ -f "$repo_dir/main.ts" ]; then
    has_entry=true
    details+=("有入口文件")
  fi

  # 3.3 检查是否有使用示例
  local has_examples=false
  if [ -d "$repo_dir/examples" ] || [ -d "$repo_dir/example" ] || [ -f "$repo_dir/USAGE.md" ]; then
    has_examples=true
    details+=("有使用示例")
  fi

  # 评分
  local doc_score=0.3
  $has_docs && doc_score=0.8 || doc_score=0.2

  local entry_score=0.3
  $has_entry && entry_score=0.9 || entry_score=0.1

  local example_score=0.3
  $has_examples && example_score=0.8 || example_score=0.3

  score=$(python3 -c "print(0.35 * $doc_score + 0.40 * $entry_score + 0.25 * $example_score)")
  score=$(python3 -c "print(min(1.0, max(0.1, $score)))")

  echo -e "  → 可用性评分: ${score} (${details[*]})"
  echo "$score:$details"
}

# ============================================================================
# 计算综合 Reality Score
# ============================================================================
compute_reality_score() {
  local repo_dir="${1:-.}"
  local execution_weight usability_weight maintainability_weight

  # 从配置加载权重
  local config
  config=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    c = yaml.safe_load(f)
r = c['reality']['dimensions']
print(f\"{r['execution']['weight']}:{r['usability']['weight']}:{r['maintainability']['weight']}\")
" 2>/dev/null || echo "0.40:0.30:0.30")

  IFS=':' read -r execution_weight usability_weight maintainability_weight <<< "$config"

  # 执行三个维度的验证
  local exec_result maint_result usability_result
  exec_result=$(validate_execution "$repo_dir")
  maint_result=$(validate_maintainability "$repo_dir")
  usability_result=$(validate_usability "$repo_dir")

  local exec_score="${exec_result%%:*}"
  local maint_score="${maint_result%%:*}"
  local usability_score="${usability_result%%:*}"

  # 综合评分
  local composite
  composite=$(python3 -c "
e = float('$exec_score')
m = float('$maint_score')
u = float('$usability_score')
ew = $execution_weight
mw = $maintainability_weight
uw = $usability_weight

total = e * ew + m * mw + u * uw
print(f'{total:.4f}')
")

  local details="${exec_result#*:} | ${maint_result#*:} | ${usability_result#*:}"

  echo "$composite:$exec_score:$maint_score:$usability_score:$details"
}

# ============================================================================
# 记录 Reality Score 并检查 rollback 条件
# ============================================================================
record_and_check_reality() {
  local composite="$1"
  local exec_score="$2"
  local maint_score="$3"
  local usability_score="$4"
  local details="$5"
  local commit_hash="$6"

  python3 -c "
import sys, json, datetime

with open('$STATE_FILE') as f:
    data = json.load(f)

record = {
    'timestamp': datetime.datetime.now().isoformat(),
    'composite': float('$composite'),
    'execution': float('$exec_score'),
    'maintainability': float('$maint_score'),
    'usability': float('$usability_score'),
    'commit_hash': '$commit_hash',
    'details': '''$details'''
}

data['scores'].append(record)
data['last_updated'] = datetime.datetime.now().isoformat()

# 计算趋势
scores = [s['composite'] for s in data['scores']]
if len(scores) >= 3:
    # 最近 N 个点的线性回归斜率
    n = min(5, len(scores))
    recent = scores[-n:]
    x_avg = (n - 1) / 2
    y_avg = sum(recent) / n
    numerator = sum((i - x_avg) * (y - y_avg) for i, y in enumerate(recent))
    denominator = sum((i - x_avg)**2 for i in range(n))
    trend = numerator / denominator if denominator != 0 else 0
    data['rolling_trend'] = round(trend, 4)
else:
    trend = 0
    data['rolling_trend'] = None

# 检查连续下降
if len(scores) >= 2:
    if scores[-1] < scores[-2]:
        data['consecutive_declines'] = data.get('consecutive_declines', 0) + 1
    else:
        data['consecutive_declines'] = 0

consecutive = data['consecutive_declines']

# 保留最近 200 条
data['scores'] = data['scores'][-200:]

with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print(f'{trend}:{consecutive}')
"
}

# ============================================================================
# 检查是否需要 rollback
# ============================================================================
check_rollback_needed() {
  local threshold
  threshold=$(python3 -c "
import yaml
with open('$SETTINGS_FILE') as f:
    config = yaml.safe_load(f)
print(config['reality']['thresholds']['rollback_sequence'])
" 2>/dev/null || echo "2")

  local consecutive
  consecutive=$(python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(data.get('consecutive_declines', 0))
")

  if [ "$consecutive" -ge "$threshold" ] 2>/dev/null; then
    echo "ROLLBACK_NEEDED:$consecutive"
    return 0
  else
    echo "OK:$consecutive"
    return 0
  fi
}

# ============================================================================
# 执行 rollback
# ============================================================================
execute_rollback() {
  local repo_dir="${1:-.}"
  echo -e "${RED}═══════════════════════════════════════════${NC}"
  echo -e "${RED}  🔄 执行 Reality Rollback${NC}"
  echo -e "${RED}═══════════════════════════════════════════${NC}"

  cd "$repo_dir" || return 1

  # 找到最近一个好的 commit（上一次 Reality Score 未下降的点）
  local good_commit
  good_commit=$(python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
scores = data['scores']
# 找到最后一个非下降的历史点
for i in range(len(scores)-2, -1, -1):
    if scores[i]['composite'] >= scores[i+1]['composite']:
        print(scores[i]['commit_hash'])
        break
else:
    print('NONE')
")

  if [ "$good_commit" = "NONE" ] || [ -z "$good_commit" ]; then
    echo -e "${YELLOW}[REALITY] 未找到稳定的 commit，回滚到 HEAD~1${NC}"
    git revert --no-edit HEAD 2>/dev/null || {
      echo -e "${RED}[REALITY] Rollback 失败，请手动处理${NC}"
      return 1
    }
  else
    echo -e "${YELLOW}[REALITY] 回滚到: ${good_commit}${NC}"
    git revert --no-edit HEAD.."$good_commit" 2>/dev/null || {
      # 如果 revert 范围不可用，尝试 reset
      git reset --hard "$good_commit" 2>/dev/null || {
        echo -e "${RED}[REALITY] Rollback 失败${NC}"
        return 1
      }
    }
  fi

  # 记录 rollback
  python3 -c "
import json, datetime
with open('$STATE_FILE') as f:
    data = json.load(f)
data['last_rollback_commit'] = '$good_commit'
data['consecutive_declines'] = 0
with open('$STATE_FILE', 'w') as f:
    json.dump(data, f, indent=2)
"

  echo -e "${GREEN}[REALITY] Rollback 完成${NC}"
  return 0
}

# ============================================================================
# 生成 Reality Score 报告
# ============================================================================
report_reality() {
  local composite="$1"
  local exec_score="$2"
  local maint_score="$3"
  local usability_score="$4"

  echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
  echo -e "${MAGENTA}  🌐 Reality Score Report (现实验证报告)${NC}"
  echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
  echo ""
  printf "  执行结果    (execution):     %.4f  %s\n" "$exec_score" "$(bar "$exec_score")"
  printf "  结构健康度  (maintainability): %.4f  %s\n" "$maint_score" "$(bar "$maint_score")"
  printf "  可用性      (usability):     %.4f  %s\n" "$usability_score" "$(bar "$usability_score")"
  echo ""
  printf "  ${CYAN}Composite Score: %.4f${NC}  %s\n" "$composite" "$(bar "$composite")"
  echo ""
  echo -e "${MAGENTA}───────────────────────────────────────────${NC}"

  # 检查趋势
  local trend
  trend=$(python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(data.get('rolling_trend', 'N/A'))
" 2>/dev/null)

  if [ "$trend" != "N/A" ] && [ -n "$trend" ]; then
    if python3 -c "exit(0 if $trend > 0 else 1)" 2>/dev/null; then
      echo -e "  ${GREEN}趋势: ↑ 上升 (${trend})${NC}"
    elif python3 -c "exit(0 if $trend < 0 else 1)" 2>/dev/null; then
      echo -e "  ${RED}趋势: ↓ 下降 (${trend}) ⚠️${NC}"
    else
      echo -e "  ${YELLOW}趋势: → 平稳${NC}"
    fi
  fi

  local consecutive
  consecutive=$(python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(data.get('consecutive_declines', 0))
" 2>/dev/null)

  if [ "$consecutive" -gt 0 ]; then
    echo -e "  ${YELLOW}连续下降: ${consecutive} 次${NC}"
  fi

  local rollback_hash
  rollback_hash=$(python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(data.get('last_rollback_commit', 'N/A'))
")

  if [ "$rollback_hash" != "N/A" ] && [ "$rollback_hash" != "None" ]; then
    echo -e "  ${CYAN}上次 Rollback: ${rollback_hash}${NC}"
  fi

  echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
}

# ── 辅助：字符条 ──
bar() {
  local val="$1"
  local width=25
  local filled
  filled=$(python3 -c "print(int(min(1.0, max(0.0, $val)) * $width))")
  local empty=$((width - filled))
  printf "${GREEN}%s${NC}%s" "$(python3 -c "print('█' * $filled)")" "$(python3 -c "print('░' * $empty)")"
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  validate)
    compute_reality_score "${2:-.}"
    ;;
  validate-exec)
    validate_execution "${2:-.}"
    ;;
  validate-maint)
    validate_maintainability "${2:-.}"
    ;;
  validate-usability)
    validate_usability "${2:-.}"
    ;;
  check)
    check_rollback_needed
    ;;
  rollback)
    execute_rollback "${2:-.}"
    ;;
  record)
    record_and_check_reality "$2" "$3" "$4" "$5" "$6" "$7"
    ;;
  report)
    report_reality "$2" "$3" "$4" "$5"
    ;;
  history)
    python3 -c "
import json
with open('$STATE_FILE') as f:
    data = json.load(f)
print(f'记录数: {len(data[\"scores\"])}')
print(f'连续下降: {data.get(\"consecutive_declines\", 0)}')
print(f'趋势: {data.get(\"rolling_trend\", \"N/A\")}')
print()
for s in data['scores'][-10:]:
    ts = s['timestamp'][:19]
    mark = '⬆' if s.get('trend', 0) >= 0 else '⬇'
    print(f'  {mark} [{ts}] C={s[\"composite\"]:.4f} E={s[\"execution\"]:.2f} M={s[\"maintainability\"]:.2f} U={s[\"usability\"]:.2f}')
"
    ;;
  *)
    echo "Usage: reality_layer.sh <command>"
    echo "  validate     — 运行完整现实验证"
    echo "  validate-exec   — 仅验证执行结果"
    echo "  validate-maint  — 仅验证结构健康度"
    echo "  validate-usable — 仅验证可用性"
    echo "  check        — 检查是否需要 rollback"
    echo "  rollback     — 执行 rollback"
    echo "  record       — 记录并检查评分"
    echo "  report       — 生成报告"
    echo "  history      — 查看历史"
    ;;
esac
