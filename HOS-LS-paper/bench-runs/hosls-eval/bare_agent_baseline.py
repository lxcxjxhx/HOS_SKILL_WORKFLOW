"""bare_agent_baseline.py — 裸 LLM 零样本基线（路线#4：same-backbone same-budget 对照）。

对 A.S.E 120 的 81 个有代码实例做单次 LLM 调用判定（vulnerable JSON），
与 HOS-LS 7-agent 检出（64/81=79%）对比。
用法：python bare_agent_baseline.py [n] [workers]
环境：HOS_LS_AI_API_KEY（DeepInfra key）、HOSLS_API_URL/MODEL（默认 DeepInfra V4-Flash）、HOSLS_SERVICE_TIER
"""
import json, os, sys, time
import requests, urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings()
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVAL = os.path.join(BASE, "hosls-eval")
ASE120 = os.path.join(EVAL, "ase120_samples")

API_URL = os.environ.get("HOSLS_API_URL", "https://api.deepinfra.com/v1/openai/chat/completions")
API_MODEL = os.environ.get("HOSLS_API_MODEL", "deepseek-ai/DeepSeek-V4-Flash")

PROMPT = (
    "You are a senior code security auditor. Analyze the following code and decide whether it contains "
    "an exploitable security vulnerability (SQL injection, XSS, command injection, path traversal, etc.). "
    "Output ONLY JSON, no other text: {\"vulnerable\": true or false, \"cwe\": \"CWE-xxx\" or \"\", "
    "\"severity\": \"high|medium|low\" or \"\", \"line\": <number> or null}"
)


def call(code, timeout=120):
    key = os.environ.get("HOS_LS_AI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY") or ""
    body = {"model": API_MODEL, "messages": [
        {"role": "system", "content": PROMPT},
        {"role": "user", "content": f"```\n{code[:8000]}\n```"}],
        "temperature": 0.1, "max_tokens": 256}
    if os.environ.get("HOSLS_SERVICE_TIER"):
        body["service_tier"] = os.environ["HOSLS_SERVICE_TIER"]
    for attempt in range(3):
        try:
            r = requests.post(API_URL, headers={"Authorization": "Bearer " + key,
                                                "Content-Type": "application/json"},
                              json=body, verify=False, timeout=timeout)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
            if r.status_code == 429:
                time.sleep(20 * (attempt + 1))
                continue
            return f"__HTTP{r.status_code}__ {r.text[:80]}"
        except Exception as e:
            if attempt == 2:
                return f"__ERROR__ {str(e)[:80]}"
            time.sleep(5)


def parse(ans):
    if not ans or ans.startswith("__"):
        return {"vulnerable": None, "cwe": "", "severity": "", "raw": (ans or "")[:60]}
    try:
        s = ans[ans.find("{"): ans.rfind("}") + 1]
        d = json.loads(s)
        return {"vulnerable": bool(d.get("vulnerable")), "cwe": str(d.get("cwe", "")),
                "severity": str(d.get("severity", "")), "line": d.get("line")}
    except Exception:
        return {"vulnerable": None, "cwe": "", "severity": "", "raw": ans[:60]}


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 81
    workers = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    man = json.load(open(os.path.join(ASE120, "manifest.json"), encoding="utf-8"))
    sel = [m for m in man if m["code_file"]][:n]

    results = {}

    def work(m):
        code = open(os.path.join(ASE120, m["code_file"]), encoding="utf-8", errors="replace").read()
        return m["instance_id"], parse(call(code)), m.get("vuln_type"), m.get("cwe_id")

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(work, m) for m in sel]
        for i, fut in enumerate(as_completed(futs), 1):
            iid, verdict, vtype, cwe = fut.result()
            results[iid] = {"vuln_type": vtype, "cwe": cwe, **verdict}
            print(f"  [{i}/{len(sel)}] {iid}: vulnerable={verdict['vulnerable']}", flush=True)

    out = os.path.join(EVAL, "reports", "bare-agent-ase120.json")
    json.dump(results, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    det = sum(1 for v in results.values() if v["vulnerable"] is True)
    und = sum(1 for v in results.values() if v["vulnerable"] is False)
    err = len(results) - det - und
    print(f"[bare-agent] n={len(results)} 判定有漏洞 {det} ({det/len(results)*100:.1f}%) | 无漏洞 {und} | 异常 {err}")
    print(f"[bare-agent] -> {out}")


if __name__ == "__main__":
    main()
