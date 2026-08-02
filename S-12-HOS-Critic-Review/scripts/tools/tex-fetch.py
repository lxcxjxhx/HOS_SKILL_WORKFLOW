#!/usr/bin/env python
"""arXiv tex 源优先获取（HOS-CRITIC-REVIEW 论文解析链 v2 的一部分）。

动机：PDF 直提（get_text）对双栏/公式/表格/扫描页会丢内容、拆碎片、错乱，
tex 源是最干净的文本形态（公式保留 LaTeX 原文，LLM 可读），应作为论文解析第一优先级。

功能：
  1. 解析 arXiv id（支持裸 id / abs 页 URL / pdf URL）；
  2. 下载 https://arxiv.org/e-print/<id>（tar.gz 或单 .tex 或 .gz）；
  3. 解包并定位主 .tex（含 \\documentclass 与 \\begin{document}）；
  4. 递归展开 \\input / \\include 子文件；
  5. LaTeX → 纯文本：去 preamble/注释，\\cite/\\ref 转占位，公式保留 LaTeX 原文
     （display 公式转 [FORMULA: ...]），表格/图保留 caption + [TABLE]/[FIGURE] 占位；
  6. 输出 quality 自检（来源文件数/公式数/表数/图数/warnings）。

用法:
  python tex-fetch.py <arxiv-id-or-url> [--out out.json]
输出:
  {"file","source":"tex","arxiv_id","title","text","quality":{...}}
失败时退出码非 0 并输出 {"error": ...}，宿主降级回 pdf-extract 管线。
"""
import json
import os
import re
import sys
import tarfile
import urllib.request

UA = {"User-Agent": "HOS-CRITIC-REVIEW/0.4 tex-fetch (academic review pipeline)"}

FORMULA_ENVS = re.compile(
    r"\\begin\{(equation|equation\*|align|align\*|alignat|alignat\*|gather|gather\*|multline|multline\*|eqnarray|eqnarray\*|displaymath)\}"
    r"(.*?)\\end\{\1\}", re.S)
TABLE_ENVS = re.compile(r"\\begin\{(tabular|tabularx|longtable|table|table\*|supertabular)\}(.*?)\\end\{\1\}", re.S)
FIGURE_ENVS = re.compile(r"\\begin\{(figure|figure\*)\}(.*?)\\end\{\1\}", re.S)
INPUT_RE = re.compile(r"\\input\{([^}]+)\}|\\include\{([^}]+)\}")
GRAPHICS_RE = re.compile(r"\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}")
CITE_RE = re.compile(r"\\(?:cite|citet|citep|citep\*|citet\*|nocite|autocite|textcite)(?:\[[^\]]*\])?(?:\[[^\]]*\])?\{[^}]*\}")
REF_RE = re.compile(r"\\(?:ref|eqref|pageref|autoref|cref|Cref)\{[^}]*\}")
LABEL_RE = re.compile(r"\\label\{[^}]*\}")
SEC_RE = re.compile(r"\\(?:part|chapter|section|subsection|subsubsection|paragraph|subparagraph|title|author|date)\*?\{(.*?)\}", re.S)
HREF_RE = re.compile(r"\\href\{[^}]*\}\{([^}]*)\}")
URL_RE = re.compile(r"\\url\{([^}]*)\}")
NOTE_RE = re.compile(r"\\footnote\{.*?\}", re.S)
MATH_INLINE_RE = re.compile(r"\\\((.+?)\\\)", re.S)  # \( ... \) → 保留为行内公式占位


def parse_arxiv_id(arg):
    """从裸 id / abs 页 / pdf 链接解析 arXiv id。"""
    s = arg.strip()
    m = re.search(r"arxiv\.org/(?:abs|pdf)/([^/?#]+)", s)
    if m:
        return m.group(1)
    m = re.search(r"(\d{4}\.\d{4,5}(?:v\d+)?)", s)
    if m:
        return m.group(1)
    if re.fullmatch(r"\d{4}\.\d{4,5}(?:v\d+)?", s):
        return s
    raise ValueError(f"无法识别 arXiv id: {arg}")


def download_e_print(arxiv_id):
    """下载 e-print；返回 (bytes, content_type)。"""
    url = f"https://arxiv.org/e-print/{arxiv_id}"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
        ctype = resp.headers.get("Content-Type", "")
    return data, ctype


def extract_tex_files(data, ctype):
    """把 e-print 内容解成 {相对路径: 文本}。支持 tar.gz / tar / .gz / 裸 .tex。"""
    import gzip
    files = {}
    # 裸 tex（content-type 含 tex 或内容以 \documentclass / % 开头）
    head = data[:2000].decode("utf-8", "replace").lstrip()
    if "tex" in ctype.lower() or head.startswith("\\documentclass") or head.startswith("%") or head.startswith("\\documentstyle"):
        files["main.tex"] = data.decode("utf-8", "replace")
        return files, "single-tex"
    # gzip 压缩的单文件（.tex.gz）
    if data[:2] == b"\x1f\x8b":
        try:
            plain = gzip.decompress(data)
            if plain[:1] == b"\\" or b"\\documentclass" in plain[:4000]:
                files["main.tex"] = plain.decode("utf-8", "replace")
                return files, "single-gz-tex"
        except Exception:
            pass
    # tar 包（含 tar.gz）
    try:
        tf = tarfile.open(fileobj=__import__("io").BytesIO(data), mode="r:*")
        for m in tf.getmembers():
            if not m.isfile():
                continue
            name = m.name
            if not name.endswith((".tex", ".bbl", ".sty", ".cls")):
                continue
            try:
                content = tf.extractfile(m).read().decode("utf-8", "replace")
            except Exception:
                continue
            files[name] = content
        tf.close()
        if files:
            return files, "tar"
    except Exception:
        pass
    return files, "unknown"


def find_main_tex(files):
    """定位主 .tex：优先含 \\begin{document} 的；其次文件路径层级最浅、名最接近 main。"""
    candidates = [n for n, c in files.items() if n.endswith(".tex") and "\\begin{document}" in c]
    if not candidates:
        candidates = [n for n, c in files.items() if n.endswith(".tex")]
    if not candidates:
        return None
    def score(n):
        base = os.path.basename(n).lower()
        s = 0
        if "main" in base or "paper" in base or "ms" == base.replace(".tex", ""):
            s -= 10
        s += n.count("/")
        return s
    candidates.sort(key=score)
    return candidates[0]


def strip_comments(text):
    """去 LaTeX 注释（保留 \\% 与 \\url{...} 内 %）。"""
    out = []
    i = 0
    n = len(text)
    while i < n:
        c = text[i]
        if c == "\\" and i + 1 < n:
            out.append(c)
            out.append(text[i + 1])
            i += 2
            continue
        if c == "%":
            while i < n and text[i] != "\n":
                i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


def clean_tex(main_path, files):
    """递归展开 \\input/\\include → 单文本；返回 (text, used_files)。"""
    seen = set()
    parts = []

    def expand(path):
        if path in seen:
            return
        seen.add(path)
        content = files.get(path, "")
        # 去掉 preamble（\begin{document} 之前）
        body = content
        for m in re.finditer(r"\\begin\{document\}", body):
            body = body[m.end():]
            break
        for m in re.finditer(r"\\end\{document\}", body):
            body = body[:m.start()]
            break
        for inc in INPUT_RE.finditer(body):
            rel = inc.group(1) or inc.group(2)
            target = rel if rel.endswith(".tex") else rel + ".tex"
            if target in files:
                expand(target)  # 子文件内容直接 append 进 parts
        parts.append(body)

    expand(main_path)
    return "\n".join(parts), sorted(seen)


def tex_to_text(tex):
    """LaTeX → 纯文本（公式/表格/图占位，cite/ref 精简）。"""
    formula_count = 0
    table_count = 0
    figure_count = 0

    def fmt(m):
        nonlocal formula_count
        formula_count += 1
        inner = re.sub(r"\s+", " ", m.group(2)).strip()[:200]
        return f"\n[FORMULA: {inner}]\n"

    def tbl(m):
        nonlocal table_count
        table_count += 1
        inner = m.group(2)
        cap = re.search(r"\\caption\{([^}]*)\}", inner)
        cap_txt = cap.group(1) if cap else ""
        return f"\n[TABLE: {cap_txt}]\n"

    def fig(m):
        nonlocal figure_count
        figure_count += 1
        inner = m.group(2)
        cap = re.search(r"\\caption\{([^}]*)\}", inner)
        cap_txt = cap.group(1) if cap else ""
        img = GRAPHICS_RE.search(inner)
        img_txt = img.group(1) if img else ""
        return f"\n[FIGURE: {cap_txt} {img_txt}]\n"

    t = tex
    t = FORMULA_ENVS.sub(fmt, t)
    t = TABLE_ENVS.sub(tbl, t)
    t = FIGURE_ENVS.sub(fig, t)
    t = MATH_INLINE_RE.sub(lambda m: f"[INLINE: {m.group(1).strip()[:80]}]", t)
    t = GRAPHICS_RE.sub(lambda m: f"[FIGURE: {m.group(1)}]", t)
    t = CITE_RE.sub("[CITE]", t)
    t = REF_RE.sub("[REF]", t)
    t = LABEL_RE.sub("", t)
    t = HREF_RE.sub(r"\1", t)
    t = URL_RE.sub(r"\1", t)
    t = NOTE_RE.sub("", t)
    # 标题类命令保留文本
    t = SEC_RE.sub(r"\n\n# \1\n\n", t)
    # 去除剩余 LaTeX 控制序列（\command 及可选参数），保留花括号内文本
    t = re.sub(r"\\[a-zA-Z@]+\*?", "", t)
    t = re.sub(r"\\[^\s{a-zA-Z]", "", t)
    t = re.sub(r"[{}]", "", t)
    # 清理多余空白
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip(), formula_count, table_count, figure_count


def main():
    args = sys.argv[1:]
    target = None
    out = None
    i = 0
    while i < len(args):
        if args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]
            i += 2
        else:
            target = args[i]
            i += 1
    if not target:
        print(json.dumps({"error": "usage: tex-fetch.py <arxiv-id-or-url> [--out out.json]"}), flush=True)
        sys.exit(2)
    try:
        arxiv_id = parse_arxiv_id(target)
    except ValueError as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(2)
    try:
        data, ctype = download_e_print(arxiv_id)
    except Exception as e:
        print(json.dumps({"error": f"e-print 下载失败: {e}", "arxiv_id": arxiv_id}), flush=True)
        sys.exit(1)
    files, kind = extract_tex_files(data, ctype)
    if not files:
        print(json.dumps({"error": f"e-print 内容无法解析（{kind}）", "arxiv_id": arxiv_id}), flush=True)
        sys.exit(1)
    main_tex = find_main_tex(files)
    if not main_tex:
        print(json.dumps({"error": "未找到主 .tex 文件", "arxiv_id": arxiv_id}), flush=True)
        sys.exit(1)
    tex, used = clean_tex(main_tex, files)
    text, formula_count, table_count, figure_count = tex_to_text(tex)
    title_m = re.search(r"\\title\{([^}]*)\}", files.get(main_tex, ""))
    quality = {
        "mode_used": "tex",
        "arxiv_id": arxiv_id,
        "source_files": len(used),
        "main_tex": main_tex,
        "formula_count": formula_count,
        "table_count": table_count,
        "figure_count": figure_count,
        "warnings": [],
    }
    result = {
        "file": target,
        "source": "tex",
        "arxiv_id": arxiv_id,
        "title": title_m.group(1) if title_m else None,
        "text": text,
        "quality": quality,
    }
    if out:
        os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps({"ok": True, "source": "tex", "arxiv_id": arxiv_id, "quality": quality, "out": out}), flush=True)
    else:
        print(json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
