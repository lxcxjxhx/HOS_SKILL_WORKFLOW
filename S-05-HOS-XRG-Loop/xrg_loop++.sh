#!/bin/bash
# ============================================================================
# HOS-XRG-Loop++
# 自我约束型开发系统主入口
# ============================================================================
# 用法:
#   ./xrg_loop++.sh              — 运行完整迭代
#   ./xrg_loop++.sh --step       — 单步分析（不提交）
#   ./xrg_loop++.sh --clean      — 强制进入 CLEAN MODE
#   ./xrg_loop++.sh --status     — 查看系统状态
#   ./xrg_loop++.sh --cvs-history     — 查看 CVS 评分历史
#   ./xrg_loop++.sh --reality-history — 查看现实验证历史
#   ./xrg_loop++.sh --rollback <hash> — 手动 rollback
#   ./xrg_loop++.sh --goal-report     — 目标树报告
#   ./xrg_loop++.sh --debt-report     — 复杂度债务报告
#   ./xrg_loop++.sh --init            — 初始化状态文件
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Convert to Windows path for Python compatibility
if command -v cygpath > /dev/null 2>&1; then
  SCRIPT_DIR_PY=$(cygpath -m "$SCRIPT_DIR")
else
  SCRIPT_DIR_PY="$SCRIPT_DIR"
fi

CONTROLLER="$SCRIPT_DIR_PY/lib/loop_controller.sh"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# 初始化状态文件（在首次使用前调用）
# ============================================================================
init_state() {
  echo -e "${CYAN}初始化 HOS-XRG-Loop++ 状态文件...${NC}"

  local state_dir="$SCRIPT_DIR_PY/state"
  mkdir -p "$state_dir"

  # 初始化各个状态文件（如尚未存在）
  local files=(
    "goal_weights.json:{\"version\":1,\"root\":\"构建稳定的 GitHub AI 迭代系统\",\"last_updated\":null,\"iterations_since_adjustment\":0,\"branches\":{\"stability\":{\"weight\":0.40,\"min_weight\":0.15,\"max_weight\":0.70},\"usefulness\":{\"weight\":0.40,\"min_weight\":0.15,\"max_weight\":0.70},\"simplicity\":{\"weight\":0.20,\"min_weight\":0.10,\"max_weight\":0.50}},\"history\":[]}"
    "complexity_debt.json:{\"version\":1,\"total_debt\":0.0,\"limit\":1.0,\"in_clean_mode\":false,\"clean_cycles_completed\":0,\"breakdown\":{\"new_files\":0,\"new_abstractions\":0,\"new_dependencies\":0},\"history\":[],\"last_updated\":null}"
    "reality_history.json:{\"version\":1,\"scores\":[],\"rolling_trend\":null,\"consecutive_declines\":0,\"last_rollback_commit\":null,\"last_updated\":null}"
    "cvs_history.json:{\"version\":1,\"scores\":[],\"rejections\":0,\"total_commits_scored\":0,\"average_score\":null,\"last_updated\":null}"
  )

  for entry in "${files[@]}"; do
    local file="${entry%%:*}"
    local content="${entry#*:}"
    if [ ! -f "$state_dir/$file" ]; then
      echo "$content" > "$state_dir/$file"
      echo -e "  ${GREEN}✓${NC} $file"
    else
      echo -e "  ${CYAN}•${NC} $file 已存在"
    fi
  done

  # 设置可执行权限
  chmod +x "$SCRIPT_DIR"/lib/*.sh 2>/dev/null
  chmod +x "$SCRIPT_DIR_PY/xrg_loop++.sh" 2>/dev/null

  echo -e "${GREEN}初始化完成${NC}"
}

# ============================================================================
# 验证依赖
# ============================================================================
check_dependencies() {
  local missing=0

  for cmd in python3 git; do
    if ! command -v "$cmd" > /dev/null 2>&1; then
      echo -e "${RED}缺少依赖: $cmd${NC}"
      missing=1
    fi
  done

  # 检查 yaml 模块
  if ! python3 -c "import yaml" 2>/dev/null; then
    echo -e "${YELLOW}提示: Python yaml 模块未安装（某些功能降级）${NC}"
    echo -e "${YELLOW}  安装: pip install pyyaml${NC}"
  fi

  if [ "$missing" -eq 1 ]; then
    echo -e "${RED}请安装缺失的依赖后再试${NC}"
    exit 1
  fi
}

# ============================================================================
# 打印帮助
# ============================================================================
print_usage() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║       HOS-XRG-Loop++ — 使用帮助            ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  用法:"
  echo "    ./xrg_loop++.sh                   运行完整迭代循环"
  echo "    ./xrg_loop++.sh <command>         执行特定命令"
  echo ""
  echo "  命令:"
  echo "    --init            初始化状态文件"
  echo "    --status          查看系统状态总览"
  echo "    --step            单步分析（分析当前变更但不提交）"
  echo "    --clean [目录]    强制进入 CLEAN MODE（重构模式）"
  echo "    --cvs-history     查看 CVS 评分历史"
  echo "    --reality-history 查看现实验证历史"
  echo "    --rollback [hash] 手动回滚到指定 commit"
  echo "    --goal-report     查看目标树报告"
  echo "    --debt-report     查看复杂度债务报告"
  echo "    --help            显示此帮助"
  echo ""
  echo "  示例:"
  echo "    ./xrg_loop++.sh --init"
  echo "    ./xrg_loop++.sh --status"
  echo "    ./xrg_loop++.sh --step"
  echo "    ./xrg_loop++.sh"
}

# ============================================================================
# 主入口
# ============================================================================
main() {
  case "${1:-}" in
    --init)
      check_dependencies
      init_state
      ;;
    --status)
      bash "$CONTROLLER" status
      ;;
    --step)
      bash "$CONTROLLER" step
      ;;
    --clean)
      bash "$CONTROLLER" clean "${2:-.}"
      ;;
    --cvs-history)
      bash "$CONTROLLER" cvs-history
      ;;
    --reality-history)
      bash "$CONTROLLER" reality-history
      ;;
    --rollback)
      bash "$CONTROLLER" rollback "${2:-.}"
      ;;
    --goal-report)
      bash "$CONTROLLER" goal-report
      ;;
    --debt-report)
      bash "$CONTROLLER" debt-report
      ;;
    --help|-h)
      print_usage
      ;;
    "")
      check_dependencies
      # 确保状态文件存在
      if [ ! -f "$SCRIPT_DIR_PY/state/goal_weights.json" ]; then
        init_state
      fi
      bash "$CONTROLLER" run "${2:-.}" "${3:-}"
      ;;
    *)
      echo -e "${RED}未知命令: ${1}${NC}"
      print_usage
      exit 1
      ;;
  esac
}

main "$@"
