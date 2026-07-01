#!/usr/bin/env python3
"""HOS-Sec-Engine CVE 查询工具
供 AI 调用，查询本地 CVE 数据库补充训练数据之外的最新漏洞信息。

用法:
  python query.py search --keyword "log4j"              # 关键词搜索
  python query.py search --product "apache:log4j"        # 产品名搜索
  python query.py cve CVE-2026-12345                     # 按 CVE ID 查
  python query.py recent --days 30                       # 最近新增
  python query.py critical                               # 高危漏洞
  python query.py poc                                    # 有 PoC 的漏洞
  python query.py stats                                  # 数据库统计
  python query.py tag --tag rce                          # 按标签搜索
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta

# Windows GBK 编码兼容
if sys.platform == "win32" and sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "cve_db.json")

def load_db():
    if not os.path.exists(DB_PATH):
        print("[!] CVE 数据库不存在，请先运行 update.sh")
        return None
    try:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[!] 数据库读取失败: {e}")
        return None

def search_keyword(db, keyword: str, limit: int = 20):
    """关键词搜索 CVE"""
    keyword = keyword.lower()
    results = []
    for cve in db.get("cves", []):
        searchable = json.dumps(cve).lower()
        if keyword in searchable:
            results.append(cve)
    # 按严重程度排序
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}
    results.sort(key=lambda x: severity_order.get(x.get("severity", "UNKNOWN"), 5))
    return results[:limit]

def search_by_product(db, product: str, limit: int = 20):
    """按产品搜索 (格式: vendor:product)"""
    parts = product.lower().split(":")
    vendor_q = parts[0] if len(parts) > 0 else ""
    product_q = parts[1] if len(parts) > 1 else vendor_q

    results = []
    for cve in db.get("cves", []):
        ap = cve.get("affected_products", {})
        vendor = ap.get("vendor", "").lower()
        prod = ap.get("product", "").lower()
        desc = cve.get("description", "").lower()
        if (vendor_q and vendor_q in vendor) or (product_q and product_q in prod) or product_q in desc:
            results.append(cve)
    # 关联度排序
    def relevance(c):
        ap = c.get("affected_products", {})
        score = 0
        if product_q in ap.get("vendor", "").lower(): score += 3
        if product_q in ap.get("product", "").lower(): score += 2
        if "CRITICAL" in c.get("severity", ""): score += 1
        return -score
    results.sort(key=relevance)
    return results[:limit]

def get_cve_by_id(db, cve_id: str):
    """按 CVE ID 精确查找"""
    cve_id = cve_id.upper()
    for cve in db.get("cves", []):
        if cve.get("id", "").upper() == cve_id:
            return cve
    # 模糊匹配
    for cve in db.get("cves", []):
        if cve_id in cve.get("id", "").upper():
            return cve
    return None

def get_recent(db, days: int = 30, limit: int = 30):
    """获取最近新增的 CVE"""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    results = []
    for cve in db.get("cves", []):
        added = cve.get("added_date", "")
        if added >= cutoff:
            results.append(cve)
    results.sort(key=lambda x: x.get("added_date", ""), reverse=True)
    return results[:limit]

def get_critical(db, limit: int = 30):
    """获取高危/严重 CVE"""
    results = [
        c for c in db.get("cves", [])
        if c.get("severity") in ("CRITICAL", "HIGH")
    ]
    # 有 PoC 的排前面
    results.sort(key=lambda x: (
        0 if x.get("exploit_status") == "available" else
        1 if x.get("exploit_status") == "proof_of_concept" else 2
    ))
    return results[:limit]

def get_poc(db, limit: int = 30):
    """获取有 PoC 的 CVE"""
    results = [
        c for c in db.get("cves", [])
        if c.get("exploit_status") in ("available", "proof_of_concept")
    ]
    results.sort(key=lambda x: (
        0 if x.get("exploit_status") == "available" else 1
    ))
    return results[:limit]

def get_by_tag(db, tag: str, limit: int = 20):
    """按标签搜索"""
    tag = tag.lower()
    results = []
    for cve in db.get("cves", []):
        tags = [t.lower() for t in cve.get("relevance_tags", [])]
        if tag in tags:
            results.append(cve)
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    results.sort(key=lambda x: severity_order.get(x.get("severity"), 5))
    return results[:limit]

def show_stats(db):
    """显示数据库统计"""
    if not db:
        return "数据库为空"
    m = db["metadata"]
    idx = db.get("query_index", {})

    lines = [
        f"CVE 数据库统计",
        f"{'='*40}",
        f"总 CVE 数:    {m['total_cves']}",
        f"上次更新:     {m['last_updated'] or '从未'}",
        f"数据截止:     {m['training_data_cutoff']} (训练数据)",
        "",
        f"—— 严重等级 ——",
    ]
    sev = idx.get("by_severity", {})
    for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        lines.append(f"  {s:10s}: {len(sev.get(s, [])):5d} 条")

    lines.extend(["", "—— PoC 状态 ——"])
    poc = idx.get("by_poc_status", {})
    for p in ["available", "proof_of_concept", "none"]:
        lines.append(f"  {p:15s}: {len(poc.get(p, [])):5d} 条")

    lines.extend(["", "—— 数据源 ——"])
    srcs = m.get("sources", {})
    for src, info in srcs.items():
        sync = info.get("last_sync") or "未同步"
        sync = sync[:10] if sync != "未同步" else sync
        lines.append(f"  {src:15s}: {sync}")

    return "\n".join(lines)

def format_cve(cve: dict, verbose: bool = True) -> str:
    """格式化单条 CVE 输出"""
    lines = [
        f"CVE: {cve['id']}",
        f"来源: {cve.get('source', '?')} | 严重: {cve.get('severity', '?')} (CVSS: {cve.get('cvss_score', '?')}) | PoC: {cve.get('exploit_status', '?')}",
        f"公开日期: {cve.get('public_date', '?')} | 入库日期: {cve.get('added_date', '?')}",
    ]
    if cve.get('is_new_since_training'):
        lines.append(f"[!] 此 CVE 发布于 AI 训练基准截止日期之后")

    desc = cve.get("description", "")
    if desc:
        lines.append(f"描述: {desc[:200]}")

    products = cve.get("affected_products", {})
    if products.get("vendor") != "unknown":
        lines.append(f"产品: {products.get('vendor')}:{products.get('product')} 版本: {', '.join(products.get('versions', []))}")

    tags = cve.get("relevance_tags", [])
    if tags:
        lines.append(f"标签: {', '.join(tags)}")

    refs = cve.get("poc_references", [])
    if refs and verbose:
        lines.append(f"参考: {', '.join(refs[:3])}")
        if len(refs) > 3:
            lines.append(f"      ... 还有 {len(refs)-3} 条引用")

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="HOS-Sec-Engine CVE 查询工具")
    sub = parser.add_subparsers(dest="cmd", required=True)

    # search
    p = sub.add_parser("search", help="关键词搜索")
    p.add_argument("--keyword", required=True)
    p.add_argument("--limit", type=int, default=20)

    # product
    p = sub.add_parser("product", help="按产品名搜索")
    p.add_argument("--product", required=True)
    p.add_argument("--limit", type=int, default=20)

    # cve
    p = sub.add_parser("cve", help="按 CVE ID 查")
    p.add_argument("cve_id")

    # recent
    p = sub.add_parser("recent", help="最近新增 CVE")
    p.add_argument("--days", type=int, default=30)
    p.add_argument("--limit", type=int, default=30)

    # critical
    sub.add_parser("critical", help="高危漏洞")
    p = sub.add_parser("poc", help="有 PoC 的漏洞")

    # tag
    p = sub.add_parser("tag", help="按标签搜索")
    p.add_argument("--tag", required=True)

    # stats
    sub.add_parser("stats", help="数据库统计")

    args = parser.parse_args()
    db = load_db()
    if not db:
        sys.exit(1)

    results = []
    single_mode = False

    if args.cmd == "search":
        results = search_keyword(db, args.keyword, args.limit)
        print(f"搜索 \"{args.keyword}\" → {len(results)} 条结果:\n")
    elif args.cmd == "product":
        results = search_by_product(db, args.product, args.limit)
        print(f"产品 \"{args.product}\" → {len(results)} 条结果:\n")
    elif args.cmd == "cve":
        cve = get_cve_by_id(db, args.cve_id)
        if cve:
            print(format_cve(cve))
        else:
            print(f"[!] 未找到 CVE: {args.cve_id}")
        return
    elif args.cmd == "recent":
        results = get_recent(db, args.days, args.limit)
        print(f"最近 {args.days} 天新增 → {len(results)} 条:\n")
    elif args.cmd == "critical":
        results = get_critical(db, 30)
        print(f"严重/高危漏洞 → {len(results)} 条:\n")
    elif args.cmd == "poc":
        results = get_poc(db, 30)
        print(f"有 PoC 的漏洞 → {len(results)} 条:\n")
    elif args.cmd == "tag":
        results = get_by_tag(db, args.tag, 20)
        print(f"标签 \"{args.tag}\" → {len(results)} 条结果:\n")
    elif args.cmd == "stats":
        print(show_stats(db))
        return
    else:
        parser.print_help()
        return

    for i, cve in enumerate(results, 1):
        print(f"[{i}] " + format_cve(cve, verbose=False))
        print()

if __name__ == "__main__":
    main()
