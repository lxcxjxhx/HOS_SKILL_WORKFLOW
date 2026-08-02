#!/usr/bin/env python
"""HTML → PDF（HOS-CRITIC-REVIEW 报告导出，零 LLM token 消耗）。

动机：评审报告最终以美观 PDF 交付，但让宿主 LLM 手动转换（或让 CLI 重复调 LLM）既贵又慢。
本脚本把 render-html.ts 生成的单文件 HTML 直接渲染为 PDF，降级链按可用性自动选择：

  weasyprint（python）→ playwright（chromium）→ msedge headless → chrome/chromium headless

用法:
  python render-pdf.py <input.html> [--out out.pdf]
  python render-pdf.py <input.html> --out out.pdf --backend weasyprint|playwright|edge|chrome

退出码：0 成功；非 0 失败（输出清晰错误与安装提示）。
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile


def to_file_uri(path):
    abspath = os.path.abspath(path)
    if sys.platform.startswith("win"):
        return "file:///" + abspath.replace("\\", "/").lstrip("/")
    return "file://" + abspath


def try_weasyprint(html_path, out_path):
    try:
        from weasyprint import HTML  # type: ignore
        HTML(filename=html_path).write_pdf(out_path)
        return True, "weasyprint"
    except Exception as e:
        return False, f"weasyprint: {e}"


def try_playwright(html_path, out_path):
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
    except Exception as e:
        return False, f"playwright 未安装: {e}"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox"])
            page = browser.new_page()
            page.goto(to_file_uri(html_path))
            page.pdf(path=out_path, format="A4", print_background=True)
            browser.close()
        return True, "playwright(chromium)"
    except Exception as e:
        return False, f"playwright: {e}"


def find_browser(names, win_paths):
    for name in names:
        p = shutil.which(name)
        if p:
            return p
    if sys.platform.startswith("win"):
        for base in win_paths:
            for name in names:
                p = os.path.join(base, name)
                if os.path.exists(p):
                    return p
    return None


def try_headless(html_path, out_path, exe, name):
    if not exe:
        return False, f"{name} 未找到"
    cmd = [exe, "--headless", "--disable-gpu", "--no-sandbox",
           f"--print-to-pdf={os.path.abspath(out_path)}", to_file_uri(html_path)]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0 and os.path.exists(out_path) and os.path.getsize(out_path) > 0:
            return True, name
        return False, f"{name}: rc={r.returncode} {r.stderr[:150]}"
    except Exception as e:
        return False, f"{name}: {e}"


def main():
    args = sys.argv[1:]
    src = None
    out = None
    backend = None
    i = 0
    while i < len(args):
        if args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]
            i += 2
        elif args[i] == "--backend" and i + 1 < len(args):
            backend = args[i + 1]
            i += 2
        else:
            src = args[i]
            i += 1
    if not src:
        print(json.dumps({"error": "usage: render-pdf.py <input.html> [--out out.pdf] [--backend weasyprint|playwright|edge|chrome]"}), flush=True)
        sys.exit(2)
    if not os.path.exists(src):
        print(json.dumps({"error": f"HTML 不存在: {src}"}), flush=True)
        sys.exit(2)
    if out is None:
        out = os.path.splitext(src)[0] + ".pdf"
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)

    edge_paths = [
        os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)") + "\\Microsoft\\Edge\\Application",
        os.environ.get("PROGRAMFILES", "C:\\Program Files") + "\\Microsoft\\Edge\\Application",
    ]
    chrome_paths = [
        os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)") + "\\Google\\Chrome\\Application",
        os.environ.get("PROGRAMFILES", "C:\\Program Files") + "\\Google\\Chrome\\Application",
        os.environ.get("LOCALAPPDATA", "") + "\\Google\\Chrome\\Application",
    ]

    chain = []
    if backend:
        chain = [backend]
    else:
        chain = ["weasyprint", "playwright", "edge", "chrome"]

    errors = []
    for b in chain:
        if b == "weasyprint":
            ok, msg = try_weasyprint(src, out)
        elif b == "playwright":
            ok, msg = try_playwright(src, out)
        elif b == "edge":
            exe = find_browser(["msedge.exe", "msedge"], edge_paths)
            ok, msg = try_headless(src, out, exe, "msedge")
        elif b == "chrome":
            exe = find_browser(["chrome.exe", "google-chrome", "chromium", "chromium-browser"], chrome_paths)
            ok, msg = try_headless(src, out, exe, "chrome")
        else:
            ok, msg = False, f"未知后端 {b}"
        if ok:
            print(json.dumps({"ok": True, "backend": msg, "out": os.path.abspath(out)}), flush=True)
            return
        errors.append(msg)

    print(json.dumps({
        "error": "所有 PDF 后端均不可用",
        "tried": chain,
        "details": errors,
        "hint": "任选其一：pip install weasyprint；或 pip install playwright && playwright install chromium；"
                "或安装 Microsoft Edge / Google Chrome（Windows 下自动探测）。",
    }, ensure_ascii=False), flush=True)
    sys.exit(1)


if __name__ == "__main__":
    main()
