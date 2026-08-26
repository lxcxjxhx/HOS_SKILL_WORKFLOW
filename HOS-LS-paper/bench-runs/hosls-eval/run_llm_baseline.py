"""AI 工具对比基线：裸 LLM 零样本 / 规则+LLM 两段式。
用法:
  python run_llm_baseline.py zero    # 裸 LLM 直接判定（10 vuln + 10 patched）
  python run_llm_baseline.py static  # 静态规则发现 → LLM 判定（IRIS 式两段）
产物: reports/llm-zero-results.json / reports/llm-static-results.json
需要环境变量 HTTPS_PROXY/HTTP_PROXY 指向可用代理。
"""
import json, os, sys, time, urllib.request, glob

KEY = os.environ.get("HOS_LS_AI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY") or ""
URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-v4-flash"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # bench-runs
EVAL = os.path.join(BASE, "hosls-eval")

ZERO_PROMPT = ("你是资深代码安全审计专家。分析下面的 Python 代码，判断是否存在可利用的安全漏洞。"
               "只输出 JSON（不要任何其他文字）：{\"vulnerable\": true或false, "
               "\"cwe\": \"CWE-编号\"或\"\", \"severity\": \"high|medium|low\"或\"\"}")
STATIC_PROMPT = ("你是资深代码安全审计专家。下面的 Python 代码被静态分析工具标记出 N 个可疑点"
                 "（含高危 M 个，如危险函数调用）。请结合代码判断这些可疑点中是否存在真实可利用的漏洞。"
                 "只输出 JSON（不要任何其他文字）：{\"vulnerable\": true或false, "
                 "\"cwe\": \"CWE-编号\"或\"\", \"severity\": \"high|medium|low\"或\"\"}")


def call(code, static_note=""):
    user = f"```python\n{code}\n```"
    if static_note:
        user = f"{static_note}\n\n```python\n{code}\n```"
    body = {"model": MODEL, "messages": [
        {"role": "system", "content": ZERO_PROMPT if not static_note else STATIC_PROMPT},
        {"role": "user", "content": user}],
        "temperature": 0.1, "max_tokens": 8192}
    req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                 headers={"Authorization": f"Bearer {KEY}",
                                          "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read())
            return d["choices"][0]["message"]["content"]
        except Exception as e:
            if attempt == 2:
                return f"__ERROR__ {e}"
            time.sleep(5)


def parse(ans):
    if not ans or ans.startswith("__ERROR__"):
        return {"vulnerable": None, "cwe": "", "severity": "", "raw": (ans or "")[:80]}
    try:
        s = ans[ans.find("{"): ans.rfind("}") + 1]
        d = json.loads(s)
        return {"vulnerable": bool(d.get("vulnerable")), "cwe": str(d.get("cwe", "")),
                "severity": str(d.get("severity", "")), "raw": ans[:80]}
    except Exception:
        low = ans.lower()
        return {"vulnerable": ("true" in low and "false" not in low.split("true")[-1][:5]) if "vulnerable" in low else None,
                "cwe": "", "severity": "", "raw": ans[:80]}


def load_static():
    static = {}
    for grp, fn in (("vuln", "vuln-static-results.json"), ("patched", "patched-static-results.json")):
        p = os.path.join(EVAL, "reports", fn)
        if os.path.exists(p):
            static[grp] = json.load(open(p, encoding="utf-8"))
    return static


def run(mode):
    files = []
    for grp in ("vuln", "patched"):
        for f in sorted(glob.glob(os.path.join(EVAL, grp, "*.py")))[:10]:
            files.append((grp, f))
    static = load_static() if mode == "static" else {}
    results, t0 = {}, time.time()
    for i, (grp, f) in enumerate(files, 1):
        name = os.path.basename(f)
        code = open(f, encoding="utf-8").read()[:6000]
        note = ""
        if mode == "static":
            st = static.get(grp, {}).get(name, {})
            n, h = st.get("findings", 0), st.get("high_crit", 0)
            note = f"静态分析标记可疑点 {n} 个（高危 {h} 个）" if n else "静态分析未标记任何可疑点"
        ans = call(code, note)
        results[f"{grp}/{name}"] = parse(ans)
        print(f"  [{mode}] {i}/{len(files)} {grp}/{name[:20]}: vulnerable={results[f'{grp}/{name}']['vulnerable']} ({time.time()-t0:.0f}s)", flush=True)
    out = os.path.join(EVAL, "reports", f"llm-{mode}-results.json")
    json.dump(results, open(out, "w"), ensure_ascii=False, indent=1)
    # 汇总
    for grp in ("vuln", "patched"):
        rows = [v for k, v in results.items() if k.startswith(grp)]
        det = sum(1 for r in rows if r["vulnerable"] is True)
        und = sum(1 for r in rows if r["vulnerable"] is False)
        print(f"[{mode}] {grp}: 判定有漏洞 {det}/{len(rows)} | 判定无漏洞 {und} | 异常 {len(rows)-det-und}")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "zero")
