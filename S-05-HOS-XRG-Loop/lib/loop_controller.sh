#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++ — Git Loop Controller
# Git 迭代控制器
# ============================================================================
# 功能:
#   管理完整的 HOS-XRG-Loop++ 迭代循环
#   协调 Intent Layer → Execution Layer → Reality Layer 的三层闭环
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi
PYTHON_CMD="python3"


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# 引入各层
INTENT_LAYER="$SCRIPT_DIR_PY/lib/intent_layer.sh"
EXECUTION_LAYER="$SCRIPT_DIR_PY/lib/execution_layer.sh"
REALITY_LAYER="$SCRIPT_DIR_PY/lib/reality_layer.sh"
DRIFT_PREEMPT="$SCRIPT_DIR_PY/lib/anti_drift_preempt.sh"
COMPLEXITY_DEBT="$SCRIPT_DIR_PY/lib/complexity_debt.sh"

# ============================================================================
# 打印分隔线
# ============================================================================
separator() {
  local char="${1:-═}"
  echo -e "${CYAN}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${NC}"
}

# ============================================================================
# 头标
# ============================================================================
print_header() {
  echo ""
  separator "═"
  echo -e "${MAGENTA}  ██╗  ██╗ ██████╗ ███████╗        ██╗  ██╗██████╗  ██████╗ ██╗      ██████╗ ██████╗ ██████╗ ██╗  ██╗${NC}"
  echo -e "${MAGENTA}  ╚██╗██╔╝██╔═══██╗██╔════╝        ╚██╗██╔╝██╔══██╗██╔════╝ ██║     ██╔═══██╗██╔══██╗╚════██╗██║  ██║${NC}"
  echo -e "${MAGENTA}   ╚███╔╝ ██║   ██║███████╗         ╚███╔╝ ██████╔╝██║  ███╗██║     ██║   ██║██████╔╝ █████╔╝███████║${NC}"
  echo -e "${MAGENTA}   ██╔██╗ ██║   ██║╚════██║         ██╔██╗ ██╔══██╗██║   ██║██║     ██║   ██║██╔═══╝  ╚═══██╗╚════██║${NC}"
  echo -e "${MAGENTA}  ██╔╝ ██╗╚██████╔╝███████║        ██╔╝ ██╗██║  ██║╚██████╔╝███████╗╚██████╔╝██║     ██████╔╝     ██║${NC}"
  echo -e "${MAGENTA}  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝        ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═════╝      ╚═╝${NC}"
  separator "═"
  echo -e "  ${CYAN}Extended Recursive Generation Loop++${NC}"
  echo -e "  ${YELLOW}自我约束型开发系统 · 稳定工程化版本${NC}"
  echo ""
}

# ============================================================================
# 打印当前状态一览
# ============================================================================
status_overview() {
  separator "─"
  echo -e "${YELLOW}📊 当前状态总览${NC}"

  # 目标树状态
  echo -e "\n${BLUE}🎯 目标树:${NC}"
  if [ -f "$SCRIPT_DIR_PY/state/goal_weights.json" ]; then
    python3 -c "
import json
with open('$SCRIPT_DIR_PY/state/goal_weights.json') as f:
    data = json.load(f)
branches = data.get('branches', {})
sorted_b = sorted(branches.items(), key=lambda x: x[1]['weight'], reverse=True)
for bid, bdata in sorted_b:
    w = bdata['weight']
    bar = '█' * int(w * 20) + '░' * (20 - int(w * 20))
    print(f'  {bid:<12} {w:.4f}  {bar}')
"
  else
    echo "  (未初始化)"
  fi

  # 复杂度债务
  echo -e "\n${RED}📦 复杂度债务:${NC}"
  if [ -f "$SCRIPT_DIR_PY/state/complexity_debt.json" ]; then
    python3 -c "
import json
with open('$SCRIPT_DIR_PY/state/complexity_debt.json') as f:
    data = json.load(f)
ratio = data['total_debt'] / data['limit'] if data['limit'] > 0 else 0
bar = '█' * int(ratio * 25) + '░' * (25 - int(ratio * 25))
print(f'  {data[\"total_debt\"]:.4f} / {data[\"limit\"]:.2f}  {bar}')
"
  fi

  # CVS 统计
  echo -e "\n${GREEN}📈 CVS 统计:${NC}"
  if [ -f "$SCRIPT_DIR_PY/state/cvs_history.json" ]; then
    python3 -c "
import json
with open('$SCRIPT_DIR_PY/state/cvs_history.json') as f:
    data = json.load(f)
print(f'  总评分: {data[\"total_commits_scored\"]}  |  拒绝: {data[\"rejections\"]}  |  平均: {data[\"average_score\"] or \"N/A\"}')
"
  fi

  # Reality 状态
  echo -e "\n${MAGENTA}🌐 Reality 状态:${NC}"
  if [ -f "$SCRIPT_DIR_PY/state/reality_history.json" ]; then
    python3 -c "
import json
with open('$SCRIPT_DIR_PY/state/reality_history.json') as f:
    data = json.load(f)
scores = data.get('scores', [])
print(f'  记录数: {len(scores)}  |  连续下降: {data.get(\"consecutive_declines\", 0)}  |  趋势: {data.get(\"rolling_trend\", \"N/A\")}')
if scores:
    last = scores[-1]
    print(f'  最近综合分: {last[\"composite\"]:.4f} (E={last[\"execution\"]:.2f} M={last[\"maintainability\"]:.2f} U={last[\"usability\"]:.2f})')
"
  fi

  separator "─"
}

# ============================================================================
# 步骤1: 读取目标树
# ============================================================================
step_read_goal_tree() {
  echo -e "\n${BLUE}[Step 1/9] 加载目标树...${NC}"
  bash "$INTENT_LAYER" report 2>/dev/null || echo -e "${YELLOW}  目标树未初始化${NC}"
}

# ============================================================================
# 步骤2: 分析 Git 状态
# ============================================================================
step_analyze_git() {
  echo -e "\n${BLUE}[Step 2/9] 分析 Git 状态...${NC}"

  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}  当前目录不是 Git 仓库${NC}"
    return 1
  fi

  local branch
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  echo -e "  当前分支: ${CYAN}${branch}${NC}"

  local status_count
  status_count=$(git status --porcelain 2>/dev/null | wc -l)
  if [ "$status_count" -gt 0 ]; then
    echo -e "  ${YELLOW}未提交变更: ${status_count} 个文件${NC}"
  else
    echo -e "  ${GREEN}工作区干净${NC}"
  fi

  local commit_count
  commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  echo -e "  历史 commit 数: ${commit_count}"

  # 检查最近的 drifts（从 CVS 历史）
  if [ -f "$SCRIPT_DIR_PY/state/cvs_history.json" ]; then
    python3 -c "
import json
with open('$SCRIPT_DIR_PY/state/cvs_history.json') as f:
    data = json.load(f)
scores = [s for s in data.get('scores', []) if not s.get('approved', True)]
if scores:
    recent = scores[-3:]
    print(f'  最近拒绝: {len(scores)} 次')
    for s in recent:
        print(f'    ❌ CVS={s[\"cvs\"]:.4f} {s[\"commit_message\"][:40]}')
"
  fi
}

# ============================================================================
# 步骤3: 生成候选 Patch（仅分析，实际内容从 stdin 或参数读入）
# ============================================================================
step_generate_candidate() {
  echo -e "\n${BLUE}[Step 3/9] 生成候选 Patch...${NC}"

  local patch_file="$1"

  if [ -n "$patch_file" ] && [ -f "$patch_file" ]; then
    echo -e "  从文件加载: ${patch_file}"
    cat "$patch_file"
  else
    # 从 git diff 获取
    local diff_content
    diff_content=$(git diff --cached 2>/dev/null || git diff 2>/dev/null)

    if [ -z "$diff_content" ]; then
      echo -e "${YELLOW}  没有 staged 或 unstaged 变更${NC}"
      echo -e "${YELLOW}  提示: 需要先有变更来分析${NC}"
      return 1
    fi
    echo -e "  从 git diff (cached) 加载"
    echo "$diff_content"
  fi
}

# ============================================================================
# 步骤4: 计算 CVS
# ============================================================================
step_compute_cvs() {
  local diff_content="$1"
  local diff_stats="$2"

  echo -e "\n${BLUE}[Step 4/9] 计算 CVS (Commit Value Score)...${NC}"

  if [ -z "$diff_content" ]; then
    echo -e "${YELLOW}  无 diff 内容，跳过 CVS${NC}"
    return 1
  fi

  echo "$diff_content" | bash "$EXECUTION_LAYER" compute "$diff_stats"
}

# ============================================================================
# 步骤5: Ant-Drift Preemption
# ============================================================================
step_anti_drift() {
  local diff_content="$1"
  local commit_msg="$2"

  echo -e "\n${BLUE}[Step 5/9] 漂移预防分析 (Anti-Drift Preemption)...${NC}"

  if [ -z "$diff_content" ]; then
    echo -e "${YELLOW}  无 diff 内容，跳过漂移分析${NC}"
    return 1
  fi

  echo "$diff_content" | bash "$DRIFT_PREEMPT" predict "$commit_msg"
}

# ============================================================================
# 步骤6: 应用 Patch（执行 commit）
# ============================================================================
step_apply_patch() {
  local commit_msg="$1"

  echo -e "\n${BLUE}[Step 6/9] 应用 Patch...${NC}"

  if [ -z "$commit_msg" ]; then
    echo -e "${YELLOW}  未提供 commit message${NC}"
    return 1
  fi

  # Stage 所有变更
  if git diff --quiet 2>/dev/null; then
    echo -e "${YELLOW}  无变更需要提交${NC}"
    return 1
  fi

  git add -A 2>/dev/null || true

  # 提交
  if git commit -m "$commit_msg" 2>/dev/null; then
    local commit_hash
    commit_hash=$(git rev-parse HEAD)
    echo -e "${GREEN}  ✓ Commit 成功: ${commit_hash:0:8}${NC}"
    echo "$commit_hash"
  else
    echo -e "${RED}  ✗ Commit 失败${NC}"
    return 1
  fi
}

# ============================================================================
# 步骤7: Reality Validator
# ============================================================================
step_reality_validate() {
  local commit_hash="$1"

  echo -e "\n${BLUE}[Step 7/9] 现实验证 (Reality Validator)...${NC}"
  echo -e "  commit: ${commit_hash:-HEAD}"

  local result
  result=$(bash "$REALITY_LAYER" validate 2>/dev/null)

  IFS=':' read -r composite exec_score maint_score usability_score details <<< "$result"

  bash "$REALITY_LAYER" report "$composite" "$exec_score" "$maint_score" "$usability_score" 2>/dev/null

  # 记录
  if [ -n "$composite" ] && [ -n "$commit_hash" ]; then
    bash "$REALITY_LAYER" record "$composite" "$exec_score" "$maint_score" "$usability_score" "$details" "$commit_hash" 2>/dev/null
  fi

  # 检查是否要 rollback
  local rollback_check
  rollback_check=$(bash "$REALITY_LAYER" check 2>/dev/null)
  if echo "$rollback_check" | grep -q "ROLLBACK_NEEDED"; then
    echo -e "${RED}  ⚠ Reality Score 连续下降，准备 rollback...${NC}"
    bash "$REALITY_LAYER" rollback 2>/dev/null
    return 2
  fi

  echo "$composite:$exec_score:$maint_score:$usability_score"
}

# ============================================================================
# 步骤8: 更新目标权重
# ============================================================================
step_update_goals() {
  local reality_composite="$1"

  echo -e "\n${BLUE}[Step 8/9] 更新目标树权重...${NC}"

  if [ -z "$reality_composite" ]; then
    echo -e "${YELLOW}  无 Reality Score，跳过权重更新${NC}"
    return 1
  fi

  # 从 Reality Score 映射到各分支的 raw score
  # stability ← maintainability
  # usefulness ← usability
  # simplicity ← maintainability + usability

  local reality_data
  reality_data=$(cat "$SCRIPT_DIR_PY/state/reality_history.json" 2>/dev/null)
  local last_score
  last_score=$(echo "$reality_data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
s = data['scores'][-1] if data['scores'] else {}
print(f\"{s.get('maintainability', 0.5)}:{s.get('usability', 0.5)}:{s.get('execution', 0.5)}\")
" 2>/dev/null || echo "0.5:0.5:0.5")

  IFS=':' read -r maint_score usability_score exec_score <<< "$last_score"

  bash "$INTENT_LAYER" update "stability" "$maint_score" 2>/dev/null
  bash "$INTENT_LAYER" update "usefulness" "$usability_score" 2>/dev/null
  bash "$INTENT_LAYER" update "simplicity" "$(python3 -c "print(($maint_score + $usability_score) / 2)")" 2>/dev/null

  echo -e "${GREEN}  ✓ 目标树权重已更新${NC}"
}

# ============================================================================
# 步骤9: 复杂度债务检查 & 决定下一步
# ============================================================================
step_check_debt() {
  echo -e "\n${BLUE}[Step 9/9] 复杂度债务检查...${NC}"

  local debt_status
  debt_status=$(bash "$COMPLEXITY_DEBT" check 2>/dev/null)

  echo "$debt_status" | awk -F: '{
    if ($1 == "FORCE") printf "  %s 债务 %.0f%% — 达到上限，必须进入 CLEAN MODE\n", "\033[31m⚠\033[0m", $2*100;
    else if ($1 == "WARN") printf "  %s 债务 %.0f%% — 接近上限\n", "\033[33m⚡\033[0m", $2*100;
    else printf "  %s 债务 %.0f%% — 健康\n", "\033[32m✓\033[0m", $2*100;
  }'

  if echo "$debt_status" | grep -q "^FORCE"; then
    echo -e "${RED}  强制进入 CLEAN MODE${NC}"
    bash "$COMPLEXITY_DEBT" clean 2>/dev/null
    echo -e "${YELLOW}  建议: 在下个迭代开始重构${NC}"
    return 0
  fi

  # 决定下一步
  echo ""
  echo -e "${GREEN}  本轮迭代完成${NC}"
  echo -e "  ${CYAN}建议下一步:${NC}"

  if echo "$debt_status" | grep -q "^WARN"; then
    echo -e "  • ${YELLOW}考虑进入 CLEAN MODE 降低复杂度债务${NC}"
  fi

  echo -e "  • ${GREEN}继续下一轮迭代 (xrg_loop++.sh --continue)${NC}"
  echo -e "  • ${CYAN}查看状态 (xrg_loop++.sh --status)${NC}"
  echo -e "  • ${MAGENTA}查看 CVS 历史 (xrg_loop++.sh --cvs-history)${NC}"
}

# ============================================================================
# 完整迭代循环
# ============================================================================
run_full_loop() {
  local repo_dir="${1:-.}"
  local patch_source="$2"

  print_header

  cd "$repo_dir" || {
    echo -e "${RED}无法进入目录: $repo_dir${NC}"
    return 1
  }

  # Step 1-2: 加载目标树 & 分析 Git
  step_read_goal_tree
  step_analyze_git

  # Step 3: 生成候选 patch
  local diff_content
  diff_content=$(step_generate_candidate "$patch_source")
  if [ $? -ne 0 ] || [ -z "$diff_content" ]; then
    # 无变更，提示后退出
    echo -e "${YELLOW}\n没有待处理变更。${NC}"
    echo -e "${YELLOW}提示: 请先在工作区做一些修改，或提供 patch 文件路径作为参数。${NC}"
    status_overview
    return 0
  fi

  # 获取 diff stats
  local diff_stats
  diff_stats=$(git diff --cached --stat 2>/dev/null || echo "")

  # Step 4: CVS 评分
  local cvs_output
  cvs_output=$(step_compute_cvs "$diff_content" "$diff_stats")
  if [ $? -ne 0 ]; then
    echo -e "${RED}CVS 计算失败${NC}"
    return 1
  fi

  # 解析 CVS 结果（第一行是分数，后面是各维度）
  local cvs_score
  cvs_score=$(echo "$cvs_output" | head -1 | cut -d: -f1)

  local impact clarity reversibility complexity
  impact=$(echo "$cvs_output" | grep "^IMPACT" | cut -d: -f2)
  clarity=$(echo "$cvs_output" | grep "^CLARITY" | cut -d: -f2)
  reversibility=$(echo "$cvs_output" | grep "^REVERSIBILITY" | cut -d: -f2)
  complexity=$(echo "$cvs_output" | grep "^COMPLEXITY_PENALTY" | cut -d: -f2)

  bash "$EXECUTION_LAYER" report "$cvs_score" "$impact" "$clarity" "$reversibility" "$complexity" 2>/dev/null

  # 检查 CVS 是否通过
  if ! bash "$EXECUTION_LAYER" approve "$cvs_score" 2>/dev/null; then
    echo -e "${RED}\n❌ CVS 评分为 ${cvs_score}，低于阈值 — 禁止 commit${NC}"

    # 记录拒绝
    local commit_msg
    commit_msg=$(git log --format="%B" -n 1 HEAD 2>/dev/null || echo "")
    bash "$EXECUTION_LAYER" record "$cvs_score" "$impact" "$clarity" "$reversibility" "$complexity" "$commit_msg" "false" 2>/dev/null

    echo -e "${YELLOW}提示: 需要改进当前变更后再试${NC}"
    echo -e "${YELLOW}  - 拆分较大的 diff${NC}"
    echo -e "${YELLOW}  - 编写更有描述性的 commit message${NC}"
    echo -e "${YELLOW}  - 减少新增抽象和依赖${NC}"
    return 0
  fi

  # Step 5: 漂移预防
  local commit_msg
  commit_msg=$(git log --format="%B" -n 1 HEAD 2>/dev/null || echo "迭代更新")
  local drift_result
  drift_result=$(step_anti_drift "$diff_content" "$commit_msg")

  # 检查是否应阻止
  if echo "$drift_result" | python3 -c "
import sys, json
try:
    r = json.loads(sys.stdin.read())
    if r.get('should_preempt'):
        sys.exit(0)
    sys.exit(1)
except:
    sys.exit(1)
" 2>/dev/null; then
    echo -e "${RED}\n🛑 漂移预防引擎阻止本次 commit${NC}"
    echo -e "${YELLOW}理由: $(echo "$drift_result" | python3 -c "import sys,json; r=json.load(sys.stdin); print('; '.join(r.get('reasons',[])))")${NC}"
    return 0
  fi

  # Step 6: 应用 Patch
  local commit_hash
  commit_hash=$(step_apply_patch "$commit_msg")
  if [ $? -ne 0 ]; then
    return 1
  fi

  # 记录 CVS
  bash "$EXECUTION_LAYER" record "$cvs_score" "$impact" "$clarity" "$reversibility" "$complexity" "$commit_msg" "true" 2>/dev/null

  # 计算并记录复杂度债务
  local debt_data
  debt_data=$(echo "$diff_content" | bash "$COMPLEXITY_DEBT" analyze 2>/dev/null)
  local total_cost
  total_cost=$(echo "$debt_data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['total_cost'])" 2>/dev/null || echo "0")
  if python3 -c "exit(0 if $total_cost > 0 else 1)" 2>/dev/null; then
    bash "$COMPLEXITY_DEBT" accumulate "$total_cost" 2>/dev/null
  fi

  # Step 7: 现实验证
  local reality_result
  reality_result=$(step_reality_validate "$commit_hash")
  local rv=$?

  if [ $rv -eq 2 ]; then
    # Rollback 已执行
    echo -e "${RED}Reality Rollback 已执行${NC}"
    return 0
  fi

  local reality_composite
  reality_composite=$(echo "$reality_result" | head -1)

  # Step 8: 更新目标树
  step_update_goals "$reality_composite"

  # Step 9: 复杂度债务检查
  step_check_debt

  separator "═"
  echo -e "${GREEN}✅ 本轮迭代完成${NC}"
  separator "═"

  status_overview
}

# ============================================================================
# 显示 CVS 历史
# ============================================================================
show_cvs_history() {
  bash "$EXECUTION_LAYER" history 2>/dev/null
}

# ============================================================================
# 显示 Reality 历史
# ============================================================================
show_reality_history() {
  bash "$REALITY_LAYER" history 2>/dev/null
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  run|continue)
    run_full_loop "${2:-.}" "${3:-}"
    ;;
  step)
    # 单步模式 — 仅分析不提交
    print_header
    step_read_goal_tree
    step_analyze_git
    local diff_content
    diff_content=$(git diff --cached 2>/dev/null || git diff 2>/dev/null || echo "")
    if [ -n "$diff_content" ]; then
      local diff_stats
      diff_stats=$(git diff --cached --stat 2>/dev/null || echo "")
      step_compute_cvs "$diff_content" "$diff_stats"
      step_anti_drift "$diff_content" ""
    fi
    echo -e "\n${GREEN}单步分析完成（未提交任何内容）${NC}"
    ;;
  clean)
    bash "$COMPLEXITY_DEBT" clean "${2:-.}" 2>/dev/null
    ;;
  status)
    print_header
    status_overview
    ;;
  cvs-history)
    show_cvs_history
    ;;
  reality-history)
    show_reality_history
    ;;
  rollback)
    bash "$REALITY_LAYER" rollback "${2:-.}" 2>/dev/null
    ;;
  goal-report)
    bash "$INTENT_LAYER" report 2>/dev/null
    ;;
  debt-report)
    bash "$COMPLEXITY_DEBT" report 2>/dev/null
    ;;
  *)
    echo "HOS-XRG-Loop++ — Git 迭代控制器"
    echo ""
    echo "用法:"
    echo "  loop_controller.sh run [目录] [patch文件]   — 运行完整迭代"
    echo "  loop_controller.sh step                     — 单步分析（不提交）"
    echo "  loop_controller.sh clean [目录]             — 进入 CLEAN MODE"
    echo "  loop_controller.sh status                   — 查看系统状态"
    echo "  loop_controller.sh cvs-history              — 查看 CVS 历史"
    echo "  loop_controller.sh reality-history          — 查看 Reality 历史"
    echo "  loop_controller.sh rollback [目录]          — 手动 rollback"
    echo "  loop_controller.sh goal-report              — 目标树报告"
    echo "  loop_controller.sh debt-report              — 债务报告"
    ;;
esac
