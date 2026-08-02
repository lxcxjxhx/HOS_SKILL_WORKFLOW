#!/usr/bin/env python
"""PDF → JSON（HOS-CRITIC-REVIEW 论文 PDF 解析链 v2）。

v2 改进（相对 v1 的 page.get_text() 单模式）：
  1. structured 模式：按 text block 重建阅读顺序，检测并修复双栏/三栏布局，
     表格用 PyMuPDF find_tables() 结构化输出为 Markdown 表格，
     数学公式字体 span 与孤立数学符号行转为 [FORMULA] 占位（不再把公式拆成碎片）。
  2. docx 模式：PDF → docx（libreoffice/pandoc）→ gfm，适合复杂排版。
  3. ocr 模式：扫描版 PDF（文本密度过低）自动/手动走 OCR：
        a) 环境变量 HOS_OCR_API（OpenAI 兼容视觉接口）→ HTTP POST
        b) 本地 tesseract 命令行
  4. quality 自检：输出 layout / char_per_page / scanned_pages / formula_count /
     table_count / warnings，宿主据此在报告中如实记录 degradations（降级不撒谎）。

用法:
  python pdf-extract.py <input.pdf> [--out out.json] [--mode auto|text|structured|docx|ocr]
  python pdf-extract.py --arxiv <arxiv-id> [--out out.json]     # 优先 tex 源（调 tex-fetch.py）
输出:
  {"file","total_pages","text","pages":[{"page","text"}],"quality":{...}}
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import contextlib

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

FORMULA_FONT_HINTS = ("math", "stix", "cambria", "euclid", "asana", "latin modern", "lmmath", "symbol", "mt2", "msam", "msbm")
FORMULA_ONLY_RE = None  # 延迟导入 re

# 文本密度低于该值（字符/页）判定为扫描版/图像页
SCANNED_THRESHOLD = 300
# 双栏判定：左右半区各含文本块比例 ≥ 该值
COLUMN_MIN_RATIO = 0.28


def _import_re():
    global FORMULA_ONLY_RE
    if FORMULA_ONLY_RE is None:
        import re
        # 孤立数学符号行：只含符号/数字/希腊字母，无英文单词
        FORMULA_ONLY_RE = re.compile(
            r"^(?=.*[∈∉∑∏√∫∂∇→↦⇒⇔≤≥≠≈∞±×÷⊕⊗⋆⋀⋁⌊⌋⌈⌉│‖·⋯⋮⋱∘⋄□◇△▽◊φψχδγθλμπστωαβνξρ]+)"
            r"[^A-Za-z]{0,80}$"
        )
    return FORMULA_ONLY_RE


def _is_formula_span(span):
    font = (span.get("font") or "").lower()
    return any(h in font for h in FORMULA_FONT_HINTS)


def _detect_layout(page, blocks):
    """双栏检测：对文本块 bbox 中心 x 做左右分半统计。返回 'two-column' | 'single-column'。"""
    tb = [b for b in blocks if b.get("type", -1) == 0 and b.get("lines")]
    if len(tb) < 6:
        return "single-column"
    page_w = max(page.rect.width, 1)
    left = sum(1 for b in tb if (b["bbox"][0] + b["bbox"][2]) / 2 < page_w * 0.5)
    right = sum(1 for b in tb if (b["bbox"][0] + b["bbox"][2]) / 2 >= page_w * 0.5)
    n = len(tb)
    return "two-column" if (left / n >= COLUMN_MIN_RATIO and right / n >= COLUMN_MIN_RATIO) else "single-column"


def _blocks_to_text(page, blocks, tables, page_w):
    """按阅读顺序把 text block 拼成文本；跳过与表格重叠的 block；公式 span → [FORMULA]。"""
    tb = [b for b in blocks if b.get("type", -1) == 0 and b.get("lines")]
    if not tb:
        return ""
    layout = _detect_layout(page, tb)
    table_rects = []
    for t in tables:
        try:
            table_rects.append(fitz.Rect(t.bbox))
        except Exception:
            pass

    def inside_table(b):
        bx = fitz.Rect(b["bbox"])
        for tr in table_rects:
            inter = bx & tr
            if inter.is_empty or inter.get_area() < bx.get_area() * 0.6:
                continue
            return True
        return False

    if layout == "two-column":
        left = [b for b in tb if (b["bbox"][0] + b["bbox"][2]) / 2 < page_w * 0.5]
        right = [b for b in tb if (b["bbox"][0] + b["bbox"][2]) / 2 >= page_w * 0.5]
        ordered = sorted(left, key=lambda b: b["bbox"][1]) + sorted(right, key=lambda b: b["bbox"][1])
    else:
        ordered = sorted(tb, key=lambda b: b["bbox"][1])

    out_lines = []
    for b in ordered:
        if inside_table(b):
            continue
        line_parts = []
        for line in b.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            txt = ""
            for sp in spans:
                t = sp.get("text", "")
                if not t:
                    continue
                if _is_formula_span(sp):
                    txt += "[FORMULA]"
                else:
                    txt += t
            if txt.strip():
                line_parts.append(txt.strip())
        if line_parts:
            out_lines.append(" ".join(line_parts))
    return "\n".join(out_lines)


def _tables_to_markdown(page):
    """find_tables() → Markdown 表格列表。"""
    out = []
    try:
        tables = page.find_tables()
    except Exception:
        return []
    for t in tables.tables:
        try:
            rows = t.extract()
        except Exception:
            continue
        if not rows:
            continue
        cells = [[(c or "").replace("|", "\\|").replace("\n", " ").strip() for c in row] for row in rows]
        header = cells[0]
        md = ["| " + " | ".join(header) + " |", "|" + "|".join(["---"] * len(header)) + "|"]
        for row in cells[1:]:
            md.append("| " + " | ".join(row) + " |")
        out.append("\n".join(md))
    return out


def _mark_formula_only_lines(text):
    """把孤立数学符号行标为 [FORMULA] 占位，避免公式碎片污染正文。"""
    re_f = _import_re()
    out = []
    for ln in text.split("\n"):
        s = ln.strip()
        if s and len(s) <= 80 and re_f.match(s):
            out.append(f"[FORMULA: {s[:60]}]")
        else:
            out.append(ln)
    return "\n".join(out)


def extract_structured(doc):
    """v2 结构化提取：分栏重排 + 表格 + 公式占位。返回 (text, pages, formula_count, table_count, layouts, scanned_pages, warnings)。"""
    pages_out = []
    all_text = []
    formula_count = 0
    table_count = 0
    layouts = {}
    scanned_pages = []
    warnings = []
    for page in doc:
        page_w = page.rect.width
        try:
            blocks = page.get_text("dict")["blocks"]
        except Exception:
            blocks = []
        try:
            tables = page.find_tables().tables
        except Exception:
            tables = []
        table_count += len(tables)
        body = _blocks_to_text(page, blocks, tables, page_w) if blocks else ""
        body = _mark_formula_only_lines(body)
        formula_count += body.count("[FORMULA")
        layout = _detect_layout(page, blocks)
        layouts[layout] = layouts.get(layout, 0) + 1
        parts = []
        if body.strip():
            parts.append(body)
        for t in _tables_to_markdown(page):
            parts.append("\n[TABLE]\n" + t + "\n[/TABLE]")
        page_text = "\n\n".join(parts)
        pages_out.append({"page": page.number + 1, "text": page_text})
        all_text.append(page_text)
        if len(body) < SCANNED_THRESHOLD:
            scanned_pages.append(page.number + 1)
    return "\n".join(all_text), pages_out, formula_count, table_count, layouts, scanned_pages, warnings


def extract_plain(doc):
    """v1 兼容：page.get_text()。"""
    pages = []
    all_text = []
    scanned = []
    for page in doc:
        t = page.get_text()
        pages.append({"page": page.number + 1, "text": t})
        all_text.append(t)
        if len(t) < SCANNED_THRESHOLD:
            scanned.append(page.number + 1)
    return "\n".join(all_text), pages, scanned


def _try_ocr_api(pix, page_no):
    """HOS_OCR_API：OpenAI 兼容视觉接口。POST { image_url(base64 data URI) } → choices[0].message.content。"""
    import base64
    import urllib.request
    api = os.environ.get("HOS_OCR_API")
    if not api:
        return None, "HOS_OCR_API 未配置"
    b64 = base64.b64encode(pix.tobytes("png")).decode()
    payload = {
        "model": os.environ.get("HOS_OCR_MODEL", "gpt-4o"),
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": "Transcribe all text on this page verbatim. Keep reading order and line breaks. Output plain text only."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
            ],
        }],
    }
    req = urllib.request.Request(
        api, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {os.environ.get('HOS_OCR_API_KEY', '')}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode())
        return data["choices"][0]["message"]["content"], None
    except Exception as e:
        return None, f"OCR API 调用失败: {e}"


def _try_ocr_tesseract(pix):
    tesseract = shutil.which("tesseract")
    if not tesseract:
        return None, "tesseract 不可用"
    with tempfile.TemporaryDirectory() as d:
        img = os.path.join(d, "page.png")
        pix.save(img)
        r = subprocess.run([tesseract, img, "stdout", "-l", "eng"], capture_output=True, text=True, timeout=120)
        if r.returncode != 0:
            return None, f"tesseract 失败: {r.stderr[:120]}"
        return r.stdout, None


def extract_ocr(doc):
    """扫描版页面 OCR。返回 (text, pages_out, warnings)。"""
    pages_out = []
    all_text = []
    warnings = []
    for page in doc:
        text = page.get_text()
        if len(text) >= SCANNED_THRESHOLD:
            pages_out.append({"page": page.number + 1, "text": text})
            all_text.append(text)
            continue
        pix = page.get_pixmap(dpi=200)
        out, err = None, None
        if os.environ.get("HOS_OCR_API"):
            out, err = _try_ocr_api(pix, page.number + 1)
        if out is None and shutil.which("tesseract"):
            out, err = _try_ocr_tesseract(pix)
        if out is None:
            warnings.append(f"page {page.number + 1} 扫描版 OCR 失败（{err or '无可用 OCR 后端'}），保留原始低密度文本")
            pages_out.append({"page": page.number + 1, "text": text, "ocr": "failed"})
            all_text.append(text)
        else:
            pages_out.append({"page": page.number + 1, "text": out, "ocr": "ok"})
            all_text.append(out)
    return "\n".join(all_text), pages_out, warnings


def extract_docx(doc):
    """PDF → docx → gfm（libreoffice + pandoc）。返回 (text, warnings)；失败返回 (None, warnings)。"""
    warnings = []
    lo = shutil.which("libreoffice") or shutil.which("soffice")
    pandoc = shutil.which("pandoc")
    if not (lo and pandoc):
        return None, warnings + ["docx 模式需要 libreoffice 与 pandoc（不可用则回退 structured）"]
    with tempfile.TemporaryDirectory() as d:
        pdf = os.path.join(d, "input.pdf")
        doc.save(pdf)
        r = subprocess.run([lo, "--headless", "--convert-to", "docx", "--outdir", d, pdf], capture_output=True, text=True, timeout=300)
        if r.returncode != 0:
            return None, warnings + [f"libreoffice 转换失败: {r.stderr[:120]}"]
        r2 = subprocess.run([pandoc, "-f", "docx", "-t", "gfm", os.path.join(d, "input.docx")], capture_output=True, text=True, timeout=120)
        if r2.returncode == 0 and r2.stdout.strip():
            return r2.stdout, warnings
        return None, warnings + [f"pandoc 转换失败: {r2.stderr[:120]}"]


def build_quality(mode, total_pages, total_chars, layouts, formula_count, table_count, scanned_pages, warnings, sources):
    cpp = round(total_chars / total_pages, 1) if total_pages else 0
    n_two = layouts.get("two-column", 0)
    layout = "two-column" if (total_pages and n_two / total_pages > 0.5) else "single-column"
    return {
        "mode_used": mode,
        "layout": layout,
        "char_per_page": cpp,
        "scanned_pages": scanned_pages,
        "formula_count": formula_count,
        "table_count": table_count,
        "warnings": warnings,
        "sources": sources,
    }


def run_tex_fetch(arxiv_id, out):
    """优先 tex 源：调 tex-fetch.py（同目录）。"""
    here = os.path.dirname(os.path.abspath(__file__))
    tex_fetch = os.path.join(here, "tex-fetch.py")
    if not os.path.exists(tex_fetch):
        return {"error": "tex-fetch.py 缺失"}
    cmd = [sys.executable, tex_fetch, arxiv_id]
    if out:
        cmd += ["--out", out]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        return {"error": r.stderr.strip()[:300] or "tex-fetch 失败"}
    return json.loads(r.stdout)


def _finish(src, text, pages, quality, out, total_pages):
    result = {
        "file": src,
        "total_pages": total_pages,
        "text": text,
        "pages": pages,
        "quality": quality,
    }
    if out:
        os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps({"ok": True, "total_pages": len(pages), "quality": quality, "out": out}), flush=True)
    else:
        print(json.dumps(result, ensure_ascii=False), flush=True)


def _do_extract(src, mode):
    """打开文档并执行提取（调用方需已重定向 stdout；本函数不向 stdout 输出）。"""
    try:
        fitz.TOOLS.mupdf_display_errors(False)
    except Exception:
        pass
    doc = fitz.open(src)
    warnings = []
    sources = ["pymupdf"]
    effective = mode
    layouts = {}
    formula_count = table_count = 0

    if mode == "docx":
        text, w = extract_docx(doc)
        warnings += w
        if text is not None:
            pages_out = [{"page": i + 1, "text": t} for i, t in enumerate(text.split("\n\n")) if t.strip()]
            if not pages_out:
                pages_out = [{"page": 1, "text": text}]
            sources.append("docx(gfm)")
            quality = build_quality("docx", doc.page_count, len(text), layouts, 0, 0, [], warnings, sources)
            return text, pages_out, quality
        effective = "structured"
    if mode == "ocr":
        all_text, pages_out, w = extract_ocr(doc)
        warnings += w
        sources.append("ocr")
        scanned = [p["page"] for p in pages_out if p.get("ocr") == "failed"]
        quality = build_quality("ocr", doc.page_count, len(all_text), layouts, 0, 0, scanned, warnings, sources)
        return all_text, pages_out, quality
    if mode in ("auto", "structured"):
        all_text, pages_out, formula_count, table_count, layouts, scanned_pages, w = extract_structured(doc)
        warnings += w
        sources.append("structured")
        if mode == "auto" and doc.page_count and len(all_text) / doc.page_count < SCANNED_THRESHOLD:
            all_text, pages_out, w = extract_ocr(doc)
            warnings += w
            sources.append("ocr")
            effective = "ocr"
        quality = build_quality(effective, doc.page_count, len(all_text), layouts, formula_count, table_count, scanned_pages, warnings, sources)
        return all_text, pages_out, quality
    # text（v1 兼容）
    all_text, pages_out, scanned = extract_plain(doc)
    quality = build_quality("text", doc.page_count, len(all_text), layouts, 0, 0, scanned, warnings, sources)
    return all_text, pages_out, quality


def main():
    args = sys.argv[1:]
    src = None
    out = None
    mode = "auto"
    arxiv_id = None
    i = 0
    while i < len(args):
        if args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]
            i += 2
        elif args[i] == "--mode" and i + 1 < len(args):
            mode = args[i + 1]
            i += 2
        elif args[i] == "--arxiv" and i + 1 < len(args):
            arxiv_id = args[i + 1]
            i += 2
        else:
            src = args[i]
            i += 1
    if arxiv_id:
        result = run_tex_fetch(arxiv_id, out)
        if "error" not in result:
            if out:
                print(json.dumps({"ok": True, "source": "tex", "out": out}), flush=True)
            else:
                print(json.dumps(result, ensure_ascii=False), flush=True)
            return
        print(json.dumps({"error": result["error"], "hint": "tex 源不可用，请改用本地 PDF 走 pdf-extract（structured/docx/ocr 降级链）"}), flush=True)
        sys.exit(1)
    if not src:
        print(json.dumps({"error": "usage: pdf-extract.py <input.pdf> [--out out.json] [--mode auto|text|structured|docx|ocr]"}), flush=True)
        sys.exit(2)
    if fitz is None:
        print(json.dumps({"error": "需要 python + pymupdf（pip install pymupdf）"}), flush=True)
        sys.exit(2)

    # PyMuPDF 可能在 stdout 打印 layout 提示（如 "Consider using the pymupdf_layout…"），
    # 会污染 JSON 管道：提取全程重定向 stdout→stderr，stdout 只保留最终 JSON。
    with contextlib.redirect_stdout(sys.stderr):
        text, pages, quality = _do_extract(src, mode)
    _finish(src, text, pages, quality, out, len(pages))


if __name__ == "__main__":
    main()
