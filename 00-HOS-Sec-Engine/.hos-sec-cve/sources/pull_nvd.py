"""NVD (National Vulnerability Database) CVE Puller
从 NVD API 2.0 拉取 CVE 数据，筛选训练截止日期后的新漏洞。

源: https://services.nvd.nist.gov/rest/json/cves/2.0
限制: 免费 API 无 key 每分钟 5 次请求，有 key 每分钟 50 次
"""

import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from calendar import monthrange
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ── 路径 ──
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "cve_db.json")

# ── 配置 ──
TRAINING_CUTOFF = "2025-04-01"  # AI 训练数据截止
NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"
PAGE_SIZE = 50  # 每页最大 200
NVD_API_KEY = os.environ.get("NVD_API_KEY", "")
if NVD_API_KEY:
    print(f"[NVD] 使用 API Key 认证 (50 req/30s)")
else:
    print(f"[NVD] 未设置 NVD_API_KEY，受限 (5 req/30s)")
# NVD API 硬限制: 单次查询最多返回 10000 条，超出返回 404
# 按月分段确保每段 < 10000

def load_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def build_nvd_url(start_date: str, end_date: str, page: int = 0):
    """构造 NVD API 请求 URL"""
    params = (
        f"?pubStartDate={start_date}T00:00:00.000Z"
        f"&pubEndDate={end_date}T23:59:59.999Z"
        f"&resultsPerPage={PAGE_SIZE}"
        f"&startIndex={page * PAGE_SIZE}"
    )
    return NVD_API + params

def nvd_severity_to_level(severity: str) -> str:
    mapping = {
        "CRITICAL": "CRITICAL",
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW",
        "NONE": "NONE"
    }
    return mapping.get(severity, "UNKNOWN")

def extract_affected_products(vuln):
    """从 NVD 数据中提取受影响产品信息"""
    products = json.loads('{"vendor": "unknown", "product": "unknown", "versions": []}')
    try:
        nodes = vuln.get("configurations", {}).get("nodes", [])
        for node in nodes:
            for match in node.get("cpeMatch", []):
                cpe = match.get("criteria", "")
                parts = cpe.split(":")
                if len(parts) >= 5:
                    vendor = parts[3]
                    product = parts[4]
                    version = parts[5] if len(parts) > 5 else "*"
                    products["vendor"] = vendor
                    products["product"] = product
                    if version and version != "*" and version not in products["versions"]:
                        products["versions"].append(version)
    except:
        pass
    return products

def extract_poc_refs(vuln):
    """提取 PoC 引用链接"""
    refs = []
    try:
        for ref in vuln.get("references", {}).get("reference_data", []):
            url = ref.get("url", "")
            tags = ref.get("tags", [])
            if "Exploit" in tags or "Patch" in tags or "Vendor Advisory" in tags:
                refs.append({"url": url, "tags": tags})
    except:
        pass
    return refs if refs else []

def extract_labels(vuln_data):
    """根据描述和 CWE 打标签"""
    labels = set()
    desc = json.dumps(vuln_data).lower()

    # 标签规则
    rules = {
        "rce": ["remote code execution", "code execution", "arbitrary code", "rce"],
        "sqli": ["sql injection", "sqli"],
        "xss": ["cross-site scripting", "xss"],
        "ssrf": ["server-side request forgery", "ssrf"],
        "deser": ["deserialization", "deserialize"],
        "privilege-escalation": ["privilege escalation", "privilege elevation", "lpe"],
        "bypass": ["bypass", "authentication bypass", "security bypass"],
        "dos": ["denial of service", "dos", "resource exhaustion"],
        "information-disclosure": ["information disclosure", "information leak", "info leak"],
        "memory-corruption": ["buffer overflow", "memory corruption", "heap overflow", "stack overflow"],
        "web": ["web", "http", "xss", "sqli", "csrf", "ssrf"],
        "network": ["network", "tcp", "udp", "protocol"],
        "cloud": ["cloud", "aws", "azure", "gcp", "kubernetes", "k8s", "docker"],
        "linux": ["linux", "unix"],
        "windows": ["windows", "win32"],
        "mobile": ["android", "ios", "mobile"],
        "ai": ["llm", "prompt injection", "ai", "machine learning"],
    }

    for label, keywords in rules.items():
        if any(kw in desc for kw in keywords):
            labels.add(label)

    return sorted(labels) if labels else ["general"]

def parse_nvd_cve(vuln):
    """解析单条 NVD CVE 数据"""
    try:
        cve_data = vuln.get("cve", vuln)
        cve_id = cve_data["id"]
        desc_data = cve_data.get("descriptions", [{}])
        description = ""
        for d in desc_data:
            if d.get("lang") == "en":
                description = d.get("value", "")
                break
        if not description:
            description = desc_data[0].get("value", "") if desc_data else ""

        metrics = cve_data.get("metrics", {})
        cvss_score = 0.0
        severity = "UNKNOWN"
        for metric_key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
            if metrics.get(metric_key):
                cvss_data = metrics[metric_key][0]
                cvss_score = cvss_data.get("cvssData", {}).get("baseScore", 0)
                severity = cvss_data.get("cvssData", {}).get("baseSeverity", "UNKNOWN")
                break

        products = extract_affected_products(cve_data)
        poc_refs = extract_poc_refs(cve_data)
        labels = extract_labels(cve_data)

        pub_date = cve_data.get("published", TRAINING_CUTOFF)
        # 判断 PoC 状态
        poc_status = "none"
        tags_flat = []
        for ref in poc_refs:
            tags_flat.extend(ref.get("tags", []))
        if "Exploit" in tags_flat:
            poc_status = "available"
        elif poc_refs:
            poc_status = "proof_of_concept"

        return {
            "id": cve_id,
            "description": description[:500],
            "severity": nvd_severity_to_level(severity),
            "cvss_score": cvss_score,
            "affected_products": products,
            "exploit_status": poc_status,
            "poc_references": [r["url"] for r in poc_refs[:10]],
            "patch_version": "",
            "source": "nvd",
            "cwe": "",
            "public_date": pub_date[:10] if pub_date else "",
            "added_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "relevance_tags": labels,
        }
    except Exception as e:
        print(f"  [!] 解析 CVE 失败: {e}")
        return None

def date_range_months(start_date: str, end_date: str):
    """按月份切分日期范围，返回 [(month_start, month_end), ...]"""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    ranges = []
    current = start
    while current < end:
        # 该月最后一天
        last_day = monthrange(current.year, current.month)[1]
        month_end = current.replace(day=last_day)
        if month_end > end:
            month_end = end
        ranges.append((
            current.strftime("%Y-%m-%d"),
            month_end.strftime("%Y-%m-%d")
        ))
        # 下个月第一天
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1, day=1)
        else:
            current = current.replace(month=current.month + 1, day=1)
    return ranges

def pull_nvd_month(start_date: str, end_date: str, existing_ids: set) -> list:
    """拉取单个月份范围的 CVE 数据"""
    new_cves = []
    page = 0

    while True:
        url = build_nvd_url(start_date, end_date, page)
        print(f"  [NVD] 页 {page+1}...", end="")

        try:
            headers = {"User-Agent": "HOS-Sec-Engine/1.0"}
            if NVD_API_KEY:
                headers["apiKey"] = NVD_API_KEY
            req = Request(url, headers=headers)
            with urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            if e.code == 404:
                print(" 404 (可能超过 10000 条上限，跳过)")
            else:
                print(f" HTTP {e.code}")
            return new_cves
        except Exception as e:
            err_str = str(e)
            if "timeout" in err_str.lower() or "timed out" in err_str.lower():
                print(f" 超时，暂停 10s 后重试")
                time.sleep(10)
                # 重试同一页
                continue
            print(f" 请求失败: {err_str[:80]}")
            return new_cves

        vulns = data.get("vulnerabilities", [])
        if not vulns:
            print(" 无数据")
            break

        total_results = data.get("totalResults", 0)
        print(f" {len(vulns)} 条 (共 {total_results} 条)")

        for vuln in vulns:
            parsed = parse_nvd_cve(vuln)
            if parsed and parsed["id"] not in existing_ids:
                parsed["is_new_since_training"] = True
                new_cves.append(parsed)
                existing_ids.add(parsed["id"])

        page += 1
        if page * 50 >= total_results:
            break

        # API 限速: 有 key 1.2s (≈50/min), 无 key 6s (≈10/min, 留余量)
        time.sleep(1.2 if NVD_API_KEY else 6)

    return new_cves

def pull_nvd(since_date: str = TRAINING_CUTOFF, to_date: str = None):
    """从 NVD 拉取 CVE 数据，按月分段避免 404"""
    if to_date is None:
        to_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    db = load_db()
    existing_ids = {c["id"] for c in db["cves"]}
    all_new = []

    months = date_range_months(since_date, to_date)
    print(f"[NVD] 拉取 {since_date} ~ {to_date}，按月分段共 {len(months)} 段")

    for i, (ms, me) in enumerate(months, 1):
        print(f"[NVD] 段 {i}/{len(months)}: {ms} ~ {me}")
        chunk = pull_nvd_month(ms, me, existing_ids)
        all_new.extend(chunk)
        print(f"  -> 本段新增 {len(chunk)} 条")
        time.sleep(2 if NVD_API_KEY else 6)  # 段间间隔

    print(f"[NVD] 共新增 {len(all_new)} 条 CVE")
    return all_new

def update_index(db):
    """更新查询索引"""
    index = db["query_index"]
    index["by_severity"] = {"CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": []}
    index["by_poc_status"] = {"available": [], "proof_of_concept": [], "none": []}

    for cve in db["cves"]:
        sev = cve.get("severity", "UNKNOWN")
        if sev in index["by_severity"]:
            index["by_severity"][sev].append(cve["id"])

        poc = cve.get("exploit_status", "none")
        if poc in index["by_poc_status"]:
            index["by_poc_status"][poc].append(cve["id"])

    return index

def main():
    print("=" * 50)
    print("NVD CVE Puller - HOS-Sec-Engine")
    print("=" * 50)

    new_cves = pull_nvd()

    if not new_cves:
        print("[NVD] 没有新增 CVE")
        return

    db = load_db()
    db["cves"].extend(new_cves)
    db["metadata"]["total_cves"] = len(db["cves"])
    db["metadata"]["sources"]["nvd"]["last_sync"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    db["metadata"]["last_updated"] = db["metadata"]["sources"]["nvd"]["last_sync"]
    db["query_index"] = update_index(db)

    save_db(db)
    print(f"[NVD] 完成! 数据库共 {len(db['cves'])} 条 CVE")

if __name__ == "__main__":
    main()
