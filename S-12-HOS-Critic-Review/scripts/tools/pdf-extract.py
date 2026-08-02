#!/usr/bin/env python
"""PDF → JSON（HOS-CRITIC-REVIEW 论文 PDF 解析链，PyMuPDF）。
用法: python pdf-extract.py <input.pdf> [--out out.json]
输出: {"file","total_pages","text","pages":[{"page","text"}]}
"""
import json
import sys
import fitz  # PyMuPDF


def main():
    args = sys.argv[1:]
    src = None
    out = None
    i = 0
    while i < len(args):
        if args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]
            i += 2
        else:
            src = args[i]
            i += 1
    if not src:
        print(json.dumps({"error": "usage: pdf-extract.py <input.pdf> [--out out.json]"}), flush=True)
        sys.exit(2)

    doc = fitz.open(src)
    pages = []
    text_parts = []
    for page in doc:
        t = page.get_text()
        pages.append({"page": page.number + 1, "text": t})
        text_parts.append(t)
    result = {
        "file": src,
        "total_pages": len(doc),
        "text": "\n".join(text_parts),
        "pages": pages,
    }
    doc.close()
    if out:
        with open(out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps({"ok": True, "total_pages": len(pages), "out": out}), flush=True)
    else:
        print(json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
