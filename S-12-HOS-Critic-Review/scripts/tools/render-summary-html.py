#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HOS-CRITIC-REVIEW · 多篇 Expert 报告 → 单文件汇总 HTML（通用批处理工具）

将 N 份 markdown 格式的 expert 报告渲染为一份带「总览评分卡 + 每篇详情」的单文件 HTML。
每篇详情顶部可插入「联网核验补充」块（arXiv/GitHub/Zenodo 官方源核验结果与对原报告的判定影响）。

用法:
  python scripts/tools/render-summary-html.py \
      --manifest papers-manifest.json \
      --reports <expert 报告目录> \
      --out <输出 .html 文件> \
      [--paper-count N]           # 缺省取清单长度
      [--verify-badge "标题文本"]  # 覆盖核验块标题（清单无 verify_badge 时可用）

清单 JSON 结构（papers-manifest.json 为示例）:
{
  "report_title": "…汇总标题",
  "report_subtitle": "…副标题",
  "stats": ["chip1", "chip2"],
  "verify_badge": "🌐 联网核验补充（日期 · 官方源）",
  "papers": [
    {
      "file": "xxx-expert.md",          # 相对 --reports 目录
      "title": "论文全名",
      "arxiv": "arXiv:xxxx.xxxxx (cs.XX)",
      "verified": [["核验项", "结果文本"], ...],     // 可空数组
      "corrections": ["判定影响1", ...]              // 可空数组
    }
  ]
}

依赖: python-markdown（`pip install markdown`）。渲染零额外 LLM token。
"""
import argparse
import html as html_mod
import io
import json
import re
import sys
from pathlib import Path

import markdown

MD_EXT = ["tables", "fenced_code", "toc", "sane_lists"]

GRADE_COLOR = {"S": "#137333", "A": "#1a73e8", "B": "#e8710a", "C": "#f9ab00", "D": "#d93025", "F": "#b31412"}


def esc(s: object) -> str:
    return html_mod.escape(str(s if s is not None else ""), quote=True)


def md_inline(s: str) -> str:
    """对一段文本做安全的内联渲染：先转义 HTML（防注入），再处理 **加粗** 与 `代码`。

    顺序保证：`` **修正** `` 这类 markdown 标记能渲染为 <strong>，而正文中的
    <script> 等原始 HTML 一律转义为纯文本。
    """
    out = esc(s)
    # `code` → <code>（先处理，避免代码内 ** 被加粗）
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    # **bold** → <strong>（须在转义之后、且不匹配 <code> 内部；用两步：先保护 code 内容）
    protected: list[str] = []

    def hold(m: re.Match) -> str:
        protected.append(m.group(0))
        return f"\x00{len(protected)-1}\x00"

    out = re.sub(r"<code>.*?</code>", hold, out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)

    def restore(m: re.Match) -> str:
        return protected[int(m.group(1))]

    out = re.sub(r"\x00(\d+)\x00", restore, out)
    return out


def score_from_md(text: str) -> dict:
    """从 expert 报告 markdown 的 Executive Summary 提取分数/评级/one-liner/verdict/decision。"""

    def clean(x: str) -> str:
        return x.strip().strip("*").strip()

    def line_field(pat: str) -> str:
        # 按行匹配，取匹配行内 `label: 值` 之后的部分（避免 $ 吞到文件尾）
        for ln in text.splitlines():
            m = re.match(rf".*?\*{{0,2}}{pat}[:：]\*{{0,2}}\s*(.+?)\s*$", ln)
            if m:
                return clean(m.group(1))
        return "n/a"

    m = re.search(r"\*\*Score[:：]\s*(\d+)\s*/\s*100\s*[·•]\s*(.+?)(?:\*\*|$)", text)
    grade_label = clean(m.group(2)) if m else "n/a"
    return {
        "score": m.group(1) if m else "n/a",
        "grade_label": grade_label,
        "one_liner": line_field("One-liner"),
        "verdict": line_field("Verdict"),
        "decision": line_field("Decision"),
    }


def render_md(text: str) -> str:
    return markdown.markdown(text, extensions=MD_EXT)


def build_html(manifest: dict, reports_dir: Path, paper_count: int, verify_badge: str) -> str:
    papers = manifest.get("papers", [])[:paper_count]
    cards = []
    for p in papers:
        md_path = reports_dir / p["file"]
        md_text = md_path.read_text(encoding="utf-8")
        cards.append({**p, **score_from_md(md_text), "body_html": render_md(md_text)})

    # 总览表
    rows = []
    for i, c in enumerate(cards):
        grade_color = GRADE_COLOR.get(str(c["grade_label"])[:1], "#5f6368")
        corr_badge = ('<span class="badge corr">⚠ 核验修正</span>' if c.get("corrections")
                      else '<span class="badge ok">核验一致</span>')
        rows.append(f"""<tr>
      <td class="rank">#{i+1}</td>
      <td><a class="plink" href="#paper-{i}">{esc(c['title'])}</a><div class="pfile">{esc(c['file'])}</div></td>
      <td><span class="grade" style="color:{grade_color}">{esc(c['grade_label'])}</span><div class="score-num-sm">{c['score']}</div></td>
      <td class="oneliner">{esc(c['one_liner'])}</td>
      <td class="dec">{esc(c['decision'])}</td>
      <td>{corr_badge}<div class="arxiv">{esc(c['arxiv'])}</div></td>
    </tr>""")
    overview_table = f"""<table class="overview">
<thead><tr><th>#</th><th>论文</th><th>评分</th><th>一句话结论</th><th>决策四问</th><th>核验</th></tr></thead>
<tbody>{''.join(rows)}</tbody>
</table>"""

    # 每篇详情
    sections = []
    for i, c in enumerate(cards):
        verified_items = "".join(
            f'<div class="v-item"><span class="v-tag">{esc(k)}</span><span>{md_inline(v)}</span></div>'
            for k, v in c.get("verified", []))
        corr_items = ("".join(f"<li>{md_inline(x)}</li>" for x in c.get("corrections", []))
                      if c.get("corrections") else "<li class='muted'>无判定变化（官方源核验与原报告一致）。</li>")
        sections.append(f"""
<section class="paper" id="paper-{i}">
  <div class="paper-head">
    <span class="paper-num">Paper {i+1}/{len(cards)}</span>
    <h2>{esc(c['title'])}</h2>
    <div class="paper-meta">{esc(c['arxiv'])} · {esc(c['file'])}</div>
  </div>

  <div class="verify-block">
    <div class="verify-title">{esc(verify_badge)}</div>
    {verified_items}
    <div class="corr-block">
      <strong>对原报告的判定影响：</strong>
      <ul>{corr_items}</ul>
    </div>
  </div>

  {c['body_html']}
</section>""")

    # 汇总页面
    stats = "".join(f'<span class="stat-chip">{esc(s)}</span>' for s in manifest.get("stats", []))
    toc = ''.join(f'<a href="#paper-{i}">#{i+1} {esc(c["title"][:26])}…</a>' for i, c in enumerate(cards))
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(manifest.get('report_title', 'HOS-CRITIC-REVIEW 汇总'))}</title>
<style>
  :root {{ --bg:#f4f6f8; --card:#fff; --ink:#202124; --sub:#5f6368; --line:#e8eaed; --accent:#1a73e8; --navy:#1a237e; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink); font-family:"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif; line-height:1.65; }}
  .wrap {{ max-width:1080px; margin:0 auto; padding:24px 16px 80px; }}
  .hero {{ background:linear-gradient(135deg,#1a237e,#283593); color:#fff; border-radius:16px; padding:30px 34px; margin-bottom:22px; box-shadow:0 4px 14px rgba(26,35,126,.25); }}
  .hero .kicker {{ font-size:12px; letter-spacing:2px; opacity:.75; text-transform:uppercase; }}
  .hero h1 {{ margin:6px 0 4px; font-size:24px; }}
  .hero .sub {{ font-size:14px; opacity:.85; }}
  .hero .stats {{ display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }}
  .stat-chip {{ background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.3); padding:5px 12px; border-radius:999px; font-size:13px; }}
  .toc {{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px 18px; margin:16px 0 26px; }}
  .toc a {{ color:var(--navy); text-decoration:none; margin-right:14px; font-size:13.5px; }}
  .toc a:hover {{ text-decoration:underline; }}
  table.overview {{ width:100%; border-collapse:collapse; background:var(--card); border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(60,64,67,.08); font-size:13.5px; }}
  table.overview th {{ background:#1a237e; color:#fff; text-align:left; padding:10px 12px; font-size:13px; }}
  table.overview td {{ padding:10px 12px; border-bottom:1px solid var(--line); vertical-align:top; }}
  table.overview tr:hover td {{ background:#f8f9fb; }}
  .rank {{ font-weight:800; color:var(--sub); }}
  .plink {{ color:var(--navy); font-weight:600; text-decoration:none; }}
  .pfile {{ font-size:11.5px; color:var(--sub); font-family:Consolas,monospace; margin-top:2px; }}
  .grade {{ font-weight:800; font-size:15px; }}
  .score-num-sm {{ font-size:20px; font-weight:800; }}
  .oneliner {{ max-width:340px; }}
  .dec {{ font-size:12px; }}
  .badge {{ display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; }}
  .badge.ok {{ background:#e6f4ea; color:#137333; }}
  .badge.corr {{ background:#fef7e0; color:#e8710a; }}
  .arxiv {{ font-size:11px; color:var(--sub); margin-top:3px; }}
  section.paper {{ background:var(--card); border:1px solid var(--line); border-radius:14px; padding:24px 26px; margin:30px 0; box-shadow:0 1px 3px rgba(60,64,67,.08); }}
  .paper-head {{ border-bottom:2px solid var(--navy); padding-bottom:10px; margin-bottom:14px; }}
  .paper-num {{ font-size:11px; letter-spacing:1.5px; color:var(--accent); font-weight:700; }}
  .paper-head h2 {{ margin:4px 0 4px; font-size:19px; color:var(--navy); }}
  .paper-meta {{ font-size:12.5px; color:var(--sub); }}
  .verify-block {{ background:#eef3fb; border:1px solid #c9d8f0; border-radius:10px; padding:14px 16px; margin:14px 0 20px; font-size:13.5px; }}
  .verify-title {{ font-weight:800; color:var(--navy); margin-bottom:8px; }}
  .v-item {{ display:flex; gap:8px; margin:5px 0; }}
  .v-tag {{ flex:0 0 110px; font-weight:700; color:#37474f; font-size:12.5px; }}
  .corr-block {{ margin-top:10px; padding-top:10px; border-top:1px dashed #b8c9e4; }}
  .corr-block ul {{ margin:6px 0 0; padding-left:20px; }}
  section.paper h1 {{ font-size:21px; color:var(--navy); }}
  section.paper h2 {{ font-size:17px; color:var(--navy); border-left:4px solid var(--accent); padding-left:9px; margin:24px 0 8px; }}
  section.paper h3 {{ font-size:14.5px; color:#37474f; margin:16px 0 6px; }}
  section.paper table {{ border-collapse:collapse; width:100%; margin:10px 0; font-size:13px; }}
  section.paper th {{ background:#eceff1; text-align:left; padding:6px 9px; border:1px solid var(--line); }}
  section.paper td {{ padding:6px 9px; border:1px solid var(--line); vertical-align:top; }}
  section.paper code {{ background:#f1f3f4; padding:1px 5px; border-radius:4px; font-size:12px; font-family:Consolas,monospace; }}
  section.paper blockquote {{ margin:8px 0; padding:8px 14px; background:#f8f9fb; border-left:4px solid #9aa5b1; color:#3c4043; font-size:13.5px; }}
  .muted {{ color:var(--sub); }}
  .footer {{ margin-top:36px; text-align:center; color:var(--sub); font-size:12px; }}
  @media print {{ body {{ background:#fff; }} .hero {{ box-shadow:none; -webkit-print-color-adjust:exact; print-color-adjust:exact; }} section.paper {{ page-break-inside:auto; }} }}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="kicker">HOS-CRITIC-REVIEW · 六维批判式评审引擎</div>
    <h1>{esc(manifest.get('report_title', 'HOS-CRITIC-REVIEW 汇总'))}</h1>
    <div class="sub">{esc(manifest.get('report_subtitle', ''))}</div>
    <div class="stats">{stats}</div>
  </div>

  <div class="toc">
    <strong>目录：</strong>
    <a href="#overview">总览评分卡</a>
    {toc}
  </div>

  <h2 id="overview" style="color:#1a237e;border-left:4px solid #1a73e8;padding-left:10px;">总览评分卡</h2>
  {overview_table}

  {''.join(sections)}

  <div class="footer">
    HOS-CRITIC-REVIEW · 汇总报告由 {esc(reports_dir.name)}/*-expert.md 渲染生成（render 零额外 LLM token）·
    每篇详情含完整六维评分推导、HCR 编号 Findings、Critiques、Degradations 与 Recommendation ·
    schema_version 1.0
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    ap = argparse.ArgumentParser(description="多篇 expert 报告 → 单文件汇总 HTML（HOS-CRITIC-REVIEW）")
    ap.add_argument("--manifest", required=True, help="论文清单 JSON（含 papers 数组，结构见文件头注释）")
    ap.add_argument("--reports", required=True, help="expert 报告目录（清单中 file 相对此目录）")
    ap.add_argument("--out", required=True, help="输出 HTML 文件路径")
    ap.add_argument("--paper-count", type=int, default=None, help="渲染前 N 篇（缺省全部）")
    ap.add_argument("--verify-badge", default=None, help="覆盖核验块标题（缺省取清单 verify_badge）")
    args = ap.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    reports_dir = Path(args.reports)
    out_path = Path(args.out)
    paper_count = args.paper_count or len(manifest.get("papers", []))
    verify_badge = args.verify_badge or manifest.get("verify_badge", "🌐 联网核验补充")

    html_out = build_html(manifest, reports_dir, paper_count, verify_badge)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html_out, encoding="utf-8")
    print(f"OK → {out_path} ({out_path.stat().st_size / 1024:.0f} KB, {paper_count} papers)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
