"""备用/补充 CVE 源拉取器
从多个备用源获取 CVE 数据，作为 NVD 的补充。

国内源现状（2026-07-01 实测）:
  ❌ CNVD (cnvd.org.cn) — HTTP 521 Cloudflare 拦截，不可达
  ❌ CNNVD (cnnvd.org.cn) — HTTP 301→405，接口已变更
  ❌ AVD (avd.aliyun.com) — 首页可达，子页面 WAF 保护，无可用的数据接口

备用源:
  ✅ cve.circl.lu — 免费 CVE REST API，无需认证，包含 CVSSv3/CWE/描述
"""

import json
import os
import re
import time
import hashlib
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "cve_db.json")

# ── 请求头 ──
HEADERS = {
    "User-Agent": "HOS-Sec-Engine/1.0 (CVE aggregator)",
    "Accept": "application/json",
}

# ── 源可用性状态 ──
SOURCE_HEALTH = {
    "cnvd": {"enabled": True, "fail_count": 0, "max_fails": 2},
    "cnnvd": {"enabled": True, "fail_count": 0, "max_fails": 2},
    "avd": {"enabled": True, "fail_count": 0, "max_fails": 2},
    "circl": {"enabled": True, "fail_count": 0, "max_fails": 3},
}


def load_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_db(db):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)


def fetch_json(url, timeout=30):
    """获取 JSON API 响应"""
    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        print(f"  [!] HTTP {e.code}: {url[:80]}...")
        return None
    except Exception as e:
        print(f"  [!] 请求失败: {e}")
        return None


# ─────────────────────────────────────────────
# 备用源: CVE.circl.lu API (免费，无需认证)
# 文档: https://github.com/CIRCL/Circlean
# ─────────────────────────────────────────────

CIRCL_API = "https://cve.circl.lu/api"

def pull_circl(days_back: int = 30) -> list:
    """从 CIRCL CVE API 拉取近期 CVE"""
    health = SOURCE_HEALTH["circl"]
    if not health["enabled"]:
        print(f"[CIRCL] 源已标记不可达，跳过")
        return []

    print("[CIRCL] 从 cve.circl.lu 拉取近期 CVE...")
    new_cves = []
    db = load_db()
    existing_ids = {c["id"] for c in db["cves"]}

    # 获取最近 N 天的所有 CVE
    url = f"{CIRCL_API}/last"
    data = fetch_json(url, timeout=60)
    if not data:
        health["fail_count"] += 1
        if health["fail_count"] >= health["max_fails"]:
            health["enabled"] = False
            print(f"[CIRCL] 连续 {health['fail_count']} 次失败，标记为不可达")
        return []

    health["fail_count"] = 0
    print(f"[CIRCL] API 返回 {len(data)} 条记录")

    # 按时间过滤（CIRCL 返回最近约 30 天数据）
    cutoff = datetime.now(timezone.utc) - timedelta(days=days_back)
    count = 0

    for item in data:
        try:
            cve_id = item.get("cveMetadata", {}).get("cveId", "")
            if not cve_id:
                continue

            if cve_id in existing_ids:
                continue

            # 检查发布日期
            date_pub = item.get("cveMetadata", {}).get("datePublished", "")
            if date_pub:
                try:
                    pub_dt = datetime.fromisoformat(date_pub.replace("Z", "+00:00"))
                    if pub_dt < cutoff:
                        continue
                except:
                    pass

            containers = item.get("containers", {})
            cna = containers.get("cna", {})
            adp = containers.get("adp", [{}])
            adp_metrics = adp[0].get("metrics", [{}]) if adp else [{}]

            # 描述
            descriptions = cna.get("descriptions", [])
            description = ""
            for d in descriptions:
                if d.get("lang") == "en":
                    description = d.get("value", "")
                    break
            if not description and descriptions:
                description = descriptions[0].get("value", "")

            # CVSS v3.1 评分
            cvss_score = 0.0
            severity = "UNKNOWN"
            for m in adp_metrics:
                cvss_data = m.get("cvssV3_1", {})
                if cvss_data:
                    cvss_score = cvss_data.get("baseScore", 0)
                    severity = cvss_data.get("baseSeverity", "UNKNOWN")
                    break
            # 兜底: 从 cna 信息尝试获取
            if not cvss_score:
                cna_metrics = cna.get("metrics", [])
                for m in cna_metrics:
                    for v in ["cvssV3_1", "cvssV3_0", "cvssV2_0"]:
                        cvss_data = m.get(v, {})
                        if cvss_data:
                            cvss_score = cvss_data.get("baseScore", 0)
                            severity = cvss_data.get("baseSeverity", "UNKNOWN")
                            break

            # CWE
            cwe_list = []
            for pt in cna.get("problemTypes", []):
                for desc in pt.get("descriptions", []):
                    cwe_id = desc.get("cweId", "")
                    if cwe_id:
                        cwe_list.append(cwe_id)
            cwe = cwe_list[0] if cwe_list else ""

            # 受影响产品
            products = {"vendor": "unknown", "product": "unknown", "versions": []}
            affected = cna.get("affected", [])
            if affected:
                first = affected[0]
                products["vendor"] = first.get("vendor", "unknown") or "unknown"
                products["product"] = first.get("product", "unknown") or "unknown"
                versions = first.get("versions", [])
                for v in versions:
                    ver = v.get("version", "")
                    if ver and ver not in products["versions"]:
                        products["versions"].append(ver)

            # 引用
            refs = []
            for r in cna.get("references", []):
                url = r.get("url", "")
                if url:
                    refs.append(url)

            # PoC 状态（CIRCL 无 PoC 信息，统一标记为 none）
            poc_status = "none"

            # 标签
            labels = extract_labels(description + " " + cve_id)

            # 严重等级映射
            sev_map = {
                "CRITICAL": "CRITICAL", "HIGH": "HIGH",
                "MEDIUM": "MEDIUM", "LOW": "LOW",
                "NONE": "NONE",
            }
            severity = sev_map.get(severity.upper(), "UNKNOWN")

            new_cves.append({
                "id": cve_id,
                "description": description[:500],
                "severity": severity,
                "cvss_score": cvss_score,
                "affected_products": products,
                "exploit_status": poc_status,
                "poc_references": refs[:10],
                "patch_version": "",
                "source": "circl",
                "cwe": cwe,
                "public_date": date_pub[:10] if date_pub else "",
                "added_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "relevance_tags": labels,
                "is_new_since_training": True,
            })
            existing_ids.add(cve_id)
            count += 1

        except Exception as e:
            print(f"  [!] 解析 {item.get('cveMetadata', {}).get('cveId', '?')} 失败: {e}")
            continue

    print(f"[CIRCL] 新增 {count} 条 CVE")
    return new_cves


# ─────────────────────────────────────────────
# 国内源（尽力而为，已知当前均不可用）
# ─────────────────────────────────────────────

def pull_cnvd(max_pages=2):
    """CNVD — 已知 HTTP 521 (Cloudflare 拦截)，保留逻辑待恢复"""
    health = SOURCE_HEALTH["cnvd"]
    if not health["enabled"]:
        return []
    print("[CNVD] CNVD 当前不可达 (HTTP 521 Cloudflare)，跳过")
    health["enabled"] = False
    return []


def pull_cnnvd(max_pages=2):
    """CNNVD — 已知接口已变更，保留逻辑待恢复"""
    health = SOURCE_HEALTH["cnnvd"]
    if not health["enabled"]:
        return []
    print("[CNNVD] CNNVD 接口已变更 (HTTP 301→405)，跳过")
    health["enabled"] = False
    return []


def pull_avd():
    """AVD (阿里云) — 已知 WAF 保护，保留逻辑待恢复"""
    health = SOURCE_HEALTH["avd"]
    if not health["enabled"]:
        return []
    print("[AVD] AVD 子页面 WAF 保护 (JS Challenge)，跳过")
    health["enabled"] = False
    return []


def extract_labels(text: str) -> list:
    """从文本提取标签"""
    text = text.lower()
    labels = set()
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
        if any(kw in text for kw in keywords):
            labels.add(label)
    return sorted(labels) if labels else ["general"]


def deduplicate(cves: list) -> list:
    seen = set()
    result = []
    for cve in cves:
        if cve["id"] not in seen:
            seen.add(cve["id"])
            result.append(cve)
    return result


def update_index(db):
    idx = db["query_index"]
    idx["by_severity"] = {"CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": []}
    idx["by_poc_status"] = {"available": [], "proof_of_concept": [], "none": []}
    idx["by_source"] = {}
    for cve in db["cves"]:
        sev = cve.get("severity", "UNKNOWN")
        if sev in idx["by_severity"]:
            idx["by_severity"][sev].append(cve["id"])
        poc = cve.get("exploit_status", "none")
        if poc in idx["by_poc_status"]:
            idx["by_poc_status"][poc].append(cve["id"])
        src = cve.get("source", "unknown")
        idx["by_source"].setdefault(src, []).append(cve["id"])
    return idx


def main():
    print("=" * 55)
    print("备用 CVE Puller - HOS-Sec-Engine")
    print("=" * 55)
    print("国内源状态: CNVD(✗ Cloudflare) CNNVD(✗ 接口变更) AVD(✗ WAF)")
    print("备用源: CIRCL(✔ cve.circl.lu)")
    print("=" * 55)

    all_cves = []

    # 1. CIRCL 备用 API
    try:
        circl = pull_circl(days_back=30)
        print(f"[CIRCL] 获取 {len(circl)} 条")
        all_cves.extend(circl)
    except Exception as e:
        print(f"[CIRCL] 失败: {e}")

    # 2. CNVD（尽力而为）
    try:
        cnvd = pull_cnvd()
        print(f"[CNVD] 获取 {len(cnvd)} 条")
        all_cves.extend(cnvd)
    except Exception as e:
        print(f"[CNVD] 失败: {e}")

    # 3. CNNVD（尽力而为）
    try:
        cnnvd = pull_cnnvd()
        print(f"[CNNVD] 获取 {len(cnnvd)} 条")
        all_cves.extend(cnnvd)
    except Exception as e:
        print(f"[CNNVD] 失败: {e}")

    # 4. AVD（尽力而为）
    try:
        avd = pull_avd()
        print(f"[AVD] 获取 {len(avd)} 条")
        all_cves.extend(avd)
    except Exception as e:
        print(f"[AVD] 失败: {e}")

    # 去重
    all_cves = deduplicate(all_cves)
    if not all_cves:
        print("[备用源] 没有新数据")
        return

    # 合并到数据库
    db = load_db()
    existing_ids = {c["id"] for c in db["cves"]}
    truly_new = [c for c in all_cves if c["id"] not in existing_ids]

    if not truly_new:
        print("[备用源] 全部已在数据库中")
        return

    db["cves"].extend(truly_new)
    db["metadata"]["total_cves"] = len(db["cves"])
    db["metadata"]["sources"]["cnnvd"]["last_sync"] = (
        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    db["query_index"] = update_index(db)
    save_db(db)

    print(f"[备用源] 完成! 新增 {len(truly_new)} 条, 共 {len(db['cves'])} 条 CVE")


if __name__ == "__main__":
    main()
