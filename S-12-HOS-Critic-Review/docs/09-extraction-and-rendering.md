# 09 · 输入提取与输出渲染（v0.4）

> 本章规格化两个升级点：**论文输入从哪来最干净**（tex 源优先 + PDF 多级降级链），
> **评审报告怎么交付最体面**（MD → 单文件 HTML → 本地脚本出 PDF，全程不额外消耗 LLM token）。

## 1. 论文输入：tex 源优先，PDF 按质量降级

### 1.1 优先级链

```
1. tex 源（arXiv e-print）    —— 最干净：公式保留 LaTeX 原文，无双栏/表格/乱码问题
2. PDF structured 提取        —— PyMuPDF 分栏重排 + 表格结构化 + 公式占位
3. PDF docx 中转              —— 复杂排版：PDF → docx（libreoffice）→ gfm（pandoc）
4. PDF OCR                    —— 扫描版：HOS_OCR_API（OpenAI 兼容视觉）→ tesseract
5. 原始 page.get_text()       —— v1 兼容，仅兜底
```

### 1.2 命令

```bash
# tex 源优先（arXiv id 或 URL）
python scripts/tools/tex-fetch.py 2306.00491 --out out/paper.json
node scripts/cli.ts extract pdf paper.pdf --arxiv 2306.00491   # tex 失败自动回退本地 PDF

# PDF 多级降级链
python scripts/tools/pdf-extract.py paper.pdf --mode auto --out out/paper-pdf.json
python scripts/tools/pdf-extract.py paper.pdf --mode docx --out out/paper-docx.json
python scripts/tools/pdf-extract.py paper.pdf --mode ocr  --out out/paper-ocr.json
node scripts/cli.ts extract pdf paper.pdf --mode auto --out out/
```

### 1.3 quality 自检字段（提取脚本输出）

| 字段 | 含义 | 宿主用法 |
|------|------|----------|
| `mode_used` | 实际生效模式（auto 可能降级） | 写入报告 degradations |
| `layout` | `two-column` / `single-column` | 分栏已自动重排，无需再处理 |
| `char_per_page` | 平均每页字符数 | <300 提示扫描版 |
| `scanned_pages` | 低文本密度页列表 | 图表/扫描页：内容缺失要明说，别假装读过 |
| `formula_count` | `[FORMULA]` 占位数量 | 公式密集论文：提醒 LLM 看 LaTeX/图 |
| `table_count` | 结构化表格数量 | 表格内容可信度提升 |
| `warnings` | 提取警告列表 | 逐条透传进报告 §6 |

**铁律**：`scanned_pages` 非空时，宿主必须在 degradations 里写明「第 N-M 页为图表/扫描页，
文本提取缺失，相关结论基于不完整证据」，禁止假装核验过这些页的内容。

## 2. 输出渲染：MD → HTML → PDF

### 2.1 三档输出

| 格式 | 生成方式 | 特点 |
|------|----------|------|
| `md` | `render.ts`（既有） | 纯文本，机器友好 |
| `html` | `render-html.ts`（新增） | 单文件内联 CSS，浏览器直开，评分卡/进度条/徽章 |
| `pdf` | `render-pdf.py`（新增） | HTML → PDF，**零 LLM token 消耗** |

### 2.2 命令

```bash
node scripts/cli.ts render review.json --mode expert --format html --out out/report.html
node scripts/cli.ts render review.json --mode expert --format pdf  --out out/report.pdf   # 自动先出 HTML 再转 PDF
node scripts/cli.ts render review.json --mode expert --format auto --out out/report.pdf   # 按后缀推断
python scripts/tools/render-pdf.py out/report.html --out out/report.pdf                  # 独立转换
```

### 2.3 render-pdf.py 后端降级链

```
weasyprint（python）→ playwright（chromium）→ msedge headless → chrome/chromium headless
```

- 全链不可用时输出清晰错误 + 安装提示，绝不静默产出坏 PDF；
- `--backend` 可强制指定；HTML 内 `@media print` 已做 A4 排版与颜色保留。

## 3. 为什么让 script 出 PDF，而不是 LLM 自己转

1. **省 token**：LLM 手动把 MD 排版成 PDF（或调转换库）会消耗大量输出 token，且结果不可控；
2. **可复现**：同一 ReviewReport JSON → 同一份 PDF，版本可控；
3. **可编程**：CI/批处理 8 篇论文 → 8 份 HTML + PDF，一行循环。
