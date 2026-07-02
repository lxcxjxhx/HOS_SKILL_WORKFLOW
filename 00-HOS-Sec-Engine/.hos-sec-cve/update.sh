#!/bin/bash
# ============================================================
# HOS-Sec-Engine CVE 数据库更新脚本
# 自动拉取 NVD / GitHub Advisory / CNNVD 等多源 CVE 数据
# 用法: bash update.sh [--force]
# ============================================================
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_FILE="$BASE_DIR/data/cve_db.json"
LOG_FILE="$BASE_DIR/data/update.log"

echo "============================================" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] CVE 更新开始" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"

# ── 前置检查 ──
check_python() {
    if command -v python3 &>/dev/null; then
        PY=python3
    elif command -v python &>/dev/null; then
        PY=python
    else
        echo "[!] 需要 Python 3.6+" | tee -a "$LOG_FILE"
        exit 1
    fi
    echo "[✓] Python: $($PY --version 2>&1)" | tee -a "$LOG_FILE"
}

check_env() {
    if [ -n "$NVD_API_KEY" ]; then
        echo "[✓] NVD_API_KEY 已设置，NVD 限速 50 req/30s" | tee -a "$LOG_FILE"
    else
        echo "[!] NVD_API_KEY 未设置，NVD 限速 5 req/30s（建议申请免费 key）" | tee -a "$LOG_FILE"
    fi
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "[✓] GITHUB_TOKEN 已设置" | tee -a "$LOG_FILE"
    else
        echo "[!] GITHUB_TOKEN 未设置，GitHub API 限速 60 req/h" | tee -a "$LOG_FILE"
    fi
}

check_db() {
    if [ ! -f "$DB_FILE" ]; then
        echo "[!] 数据库不存在，创建初始化文件" | tee -a "$LOG_FILE"
        mkdir -p "$BASE_DIR/data"
        cat > "$DB_FILE" << 'JSONEOF'
{
  "metadata": {
    "name": "hos-sec-cve-db",
    "version": "0.5.0",
    "last_updated": null,
    "total_cves": 0,
    "sources": {
      "nvd": {"enabled": true, "last_sync": null},
      "github_advisory": {"enabled": true, "last_sync": null},
      "cnnvd": {"enabled": true, "last_sync": null}
    },
    "training_data_cutoff": "2025-04-01"
  },
  "cves": [],
  "query_index": {
    "by_product": {},
    "by_cwe": {},
    "by_severity": {"CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": []},
    "by_poc_status": {"available": [], "proof_of_concept": [], "none": []},
    "by_source": {}
  }
}
JSONEOF
        echo "[✓] 数据库已初始化" | tee -a "$LOG_FILE"
    fi
}

# ── 运行 source 拉取器 ──
run_puller() {
    local name="$1"
    local script="$2"
    echo "" | tee -a "$LOG_FILE"
    echo "─── $name ───" | tee -a "$LOG_FILE"

    if [ ! -f "$script" ]; then
        echo "[!] 脚本不存在: $script" | tee -a "$LOG_FILE"
        return
    fi

    $PY "$script" 2>&1 | tee -a "$LOG_FILE"
    local exit_code=${PIPESTATUS[0]}
    if [ $exit_code -eq 0 ]; then
        echo "[✓] $name 完成" | tee -a "$LOG_FILE"
    else
        echo "[!] $name 退出码: $exit_code" | tee -a "$LOG_FILE"
    fi
}

# ── 生成统计报告 ──
generate_report() {
    echo "" | tee -a "$LOG_FILE"
    echo "─── 数据库统计 ───" | tee -a "$LOG_FILE"

    if [ -f "$DB_FILE" ]; then
        # 转换 POSIX 路径为 Windows 路径（兼容 Git Bash / MSYS2）
        # 使用 -m (mixed) 模式避免反斜杠被 Python 解释为转义字符
        local db_file_win
        if command -v cygpath &>/dev/null; then
            db_file_win="$(cygpath -m "$DB_FILE")"
        else
            db_file_win="$DB_FILE"
        fi
        $PY -c "
import json, os
try:
    db_path = '$db_file_win'
    # cygpath -m 已转为 C:/... 格式；若无 cygpath 则尝试 Python 侧转换
    if os.name == 'nt' and db_path.startswith('/') and ':' not in db_path:
        db_path = os.path.abspath(db_path)
    with open(db_path, 'r', encoding='utf-8') as f:
        db = json.load(f)
    m = db['metadata']
    print(f\"  总 CVE 数: {m['total_cves']}\")
    print(f\"  上次更新: {m['last_updated'] or '从未'}\")
    srcs = m.get('sources', {})
    for s, info in srcs.items():
        sync = info.get('last_sync', '从未')
        print(f\"  源 [{s}]: 最后同步 {sync}\")
    idx = db.get('query_index', {})
    sev = idx.get('by_severity', {})
    for s in ['CRITICAL','HIGH','MEDIUM','LOW']:
        print(f\"  [{s}]: {len(sev.get(s, []))} 条\")
    poc = idx.get('by_poc_status', {})
    for p in ['available','proof_of_concept','none']:
        print(f\"  [PoC {p}]: {len(poc.get(p, []))} 条\")
except Exception as e:
    print(f'  [!] 读取数据库失败: {e}')
" 2>&1 | tee -a "$LOG_FILE"
    else:
        echo "[!] 数据库文件不存在" | tee -a "$LOG_FILE"
    fi
}

# ── 主流程 ──
FORCE="${1:-}"

check_python
check_env
check_db

run_puller "NVD"         "$BASE_DIR/sources/pull_nvd.py"
run_puller "GitHub"      "$BASE_DIR/sources/pull_github.py"
run_puller "备用源/CIRCL"  "$BASE_DIR/sources/pull_cnnvd.py"

generate_report

echo "" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] CVE 更新完成" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"

# 返回新增总数给 cron 调用
$PY -c "
import json, os
db_path = os.environ.get('DB_FILE', '$DB_FILE')
# cygpath -m 转换为 C:/... 格式避免反斜杠转义问题
if os.name == 'nt' and db_path.startswith('/') and ':' not in db_path:
    try:
        db_path = os.path.abspath(db_path)
    except:
        pass
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)
print(f'数据库共 {db[\"metadata\"][\"total_cves\"]} 条 CVE')
" 2>&1
