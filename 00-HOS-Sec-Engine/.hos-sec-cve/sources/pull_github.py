"""GitHub Advisory Database CVE Puller
从 GitHub Advisory API (GraphQL) 拉取 CVE 数据。
GitHub Advisory 包含 PoC 影响、漏洞链、GHSA ID 等丰富信息。

源: GitHub Advisory Database (via GraphQL API)
API: https://api.github.com/graphql
认证: 需要 GitHub Token (public 仓库权限即可)
环境变量: GITHUB_TOKEN
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "cve_db.json")

# GitHub Advisory GraphQL Query
# 分页查询安全公告
ADVISORY_QUERY = """
query($first: Int!, $after: String, $orderBy: SecurityAdvisoryOrder, $severity: AdvisorySeverity) {
  securityAdvisories(
    first: $first
    after: $after
    orderBy: $orderBy
    severity: $severity
    ecosystem: COMPOSER
    classifications: GENERAL
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ghsaId
      summary
      description
      severity
      publishedAt
      updatedAt
      identifiers {
        type
        value
      }
      references {
        url
      }
      vulnerabilities(first: 10) {
        nodes {
          package {
            name
            ecosystem
          }
          severity
          vulnerableVersionRange
          firstPatchedVersion {
            identifier
          }
        }
      }
      cvss {
        score
        vectorString
      }
      epss {
        percentile
        score
      }
    }
  }
}
"""

# 简化查询（兼容无 token 场景，使用 REST API）
REST_API = "https://api.github.com/advisories"

def load_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def get_github_token():
    token = os.environ.get("GITHUB_TOKEN", "")
    if token:
        return token
    # 尝试从 gh CLI 配置获取
    try:
        import subprocess
        result = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    return ""

def pull_github_rest(since_date: str = "2025-04-01"):
    """使用 REST API 拉取 GitHub Advisory（不需要 token，但有速率限制）"""
    print("[GitHub] 使用 REST API 拉取安全公告...")
    db = load_db()
    existing_ids = {c["id"] for c in db["cves"]}
    new_cves = []
    page = 1

    token = get_github_token()
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        print("[GitHub] 使用 Token 认证")
    else:
        print("[GitHub] 未设置 GITHUB_TOKEN，使用无认证（限制 60 req/h）")

    while True:
        url = f"{REST_API}?per_page=100&page={page}&since={since_date}T00:00:00Z"
        try:
            req = Request(url, headers=headers)
            with urlopen(req, timeout=30) as resp:
                advisories = json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            print(f"[GitHub] HTTP {e.code}: {e.reason}")
            if e.code == 403:
                print("[GitHub] 速率限制耗尽，等待 60s...")
                time.sleep(60)
                continue
            break
        except Exception as e:
            print(f"[GitHub] 请求失败: {e}")
            break

        if not advisories:
            print("[GitHub] 没有更多数据")
            break

        print(f"[GitHub] 第 {page} 页, {len(advisories)} 条")

        for adv in advisories:
            # 确保 advisories 是 dict
            if not isinstance(adv, dict):
                print(f"  [!] 跳过非 dict 条目: {type(adv).__name__}")
                continue

            # 取 CVE ID 或 GHSA ID
            cve_id = ""
            identifiers = adv.get("identifiers", [])
            if isinstance(identifiers, list):
                for ident in identifiers:
                    if isinstance(ident, dict) and ident.get("type") == "CVE":
                        cve_id = ident.get("value", "")
                        break
            if not cve_id:
                cve_id = adv.get("ghsa_id", f"GHSA-{adv.get('id', 'unknown')}")

            if cve_id in existing_ids:
                continue

            # 受影响产品
            products = {"vendor": "unknown", "product": "unknown", "versions": []}
            vulns = adv.get("vulnerabilities", {})
            # REST API 的 vulns 是个 dict/url
            # 尝试从描述中提取产品名
            desc = adv.get("description", "")
            summary = adv.get("summary", "")

            labels = extract_labels(desc + " " + summary)

            # PoC 引用（防御: references 可能为字符串而非对象）
            refs = []
            for r in adv.get("references", []):
                if isinstance(r, dict):
                    url = r.get("url", "")
                    if url:
                        refs.append(url)
                elif isinstance(r, str) and r.startswith("http"):
                    refs.append(r)

            new_cve = {
                "id": cve_id,
                "description": (summary + "\n" + desc)[:500] if desc else summary[:500],
                "severity": adv.get("severity", "UNKNOWN").upper(),
                "cvss_score": (adv.get("cvss", {}) or {}).get("score", 0) or 0,
                "affected_products": products,
                "exploit_status": "proof_of_concept" if refs else "none",
                "poc_references": refs[:10],
                "patch_version": "",
                "source": "github",
                "cwe": "",
                "public_date": adv.get("published_at", "")[:10],
                "added_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "relevance_tags": labels,
                "is_new_since_training": True,
            }
            new_cves.append(new_cve)
            existing_ids.add(cve_id)

        page += 1
        time.sleep(1)  # 限速

    return new_cves

def extract_labels(text: str) -> list:
    """从文本提取标签"""
    text = text.lower()
    labels = set()
    rules = {
        "rce": ["remote code execution", "rce", "code execution", "arbitrary code"],
        "sqli": ["sql injection", "sqli"],
        "xss": ["cross-site scripting", "xss"],
        "ssrf": ["ssrf", "server-side request forgery"],
        "deser": ["deserialization", "deserialize"],
        "privilege-escalation": ["privilege escalation", "lpe", "elevation of privilege"],
        "bypass": ["bypass", "security bypass", "authentication bypass"],
        "dos": ["denial of service", "dos"],
        "web": ["web", "http", "xss", "sqli", "csrf"],
        "cloud": ["cloud", "aws", "azure", "gcp", "kubernetes", "docker"],
        "linux": ["linux", "unix"],
        "windows": ["windows"],
        "mobile": ["android", "ios"],
        "network": ["network", "protocol", "tcp", "udp"],
        "crypto": ["cryptographic", "encryption", "tls", "ssl", "openssl"],
        "ai-ml": ["machine learning", "ai", "llm", "neural"],
    }
    for label, keywords in rules.items():
        if any(kw in text for kw in keywords):
            labels.add(label)
    return sorted(labels) if labels else ["general"]

def main():
    print("=" * 50)
    print("GitHub Advisory CVE Puller - HOS-Sec-Engine")
    print("=" * 50)

    new_cves = pull_github_rest()

    if not new_cves:
        print("[GitHub] 没有新增 CVE")
        return

    db = load_db()
    db["cves"].extend(new_cves)
    db["metadata"]["total_cves"] = len(db["cves"])
    db["metadata"]["sources"]["github_advisory"]["last_sync"] = (
        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    db["metadata"]["last_updated"] = db["metadata"]["sources"]["github_advisory"]["last_sync"]
    save_db(db)

    print(f"[GitHub] 完成! 新增 {len(new_cves)} 条, 共 {len(db['cves'])} 条")

if __name__ == "__main__":
    main()
