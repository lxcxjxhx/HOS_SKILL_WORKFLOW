# HOS-CRITIC-REVIEW 变更记录

## [0.4.0] - 2026-08-02（输入质量 + 输出渲染升级）

### 新增
- **论文 tex 源优先**（`scripts/tools/tex-fetch.py`）：arXiv id/URL → e-print → 主 .tex → 纯文本；
  公式保留 LaTeX 原文（`[FORMULA: …]`）、表格/图保留 caption 占位、`\input/\include` 递归展开；
  最干净的论文文本形态，优先于 PDF 提取（pdf-extract `--arxiv` 自动调用）
- **PDF 解析链 v2**（`scripts/tools/pdf-extract.py` 重写）：
  - `structured` 模式：按 text block 重建阅读顺序 + 双栏/单栏自动检测重排
  - 表格 `find_tables()` → Markdown 表格块（`[TABLE] … [/TABLE]`）
  - 数学公式字体 span / 孤立符号行 → `[FORMULA]` 占位，不再把公式拆成碎片
  - `docx` 模式：PDF → docx（libreoffice + pandoc）→ gfm
  - `ocr` 模式：扫描版页面走 `HOS_OCR_API`（OpenAI 兼容视觉接口）或本地 tesseract
  - **quality 自检**：layout / char_per_page / scanned_pages / formula_count / table_count /
    warnings 写入输出，宿主据此在报告中如实记录 degradations（降级不撒谎）
- **HTML 渲染器**（`scripts/render-html.ts`）：ReviewReport JSON → 单文件美观 HTML
  （内联 CSS：评分卡大卡片、六维进度条、severity 徽章、critique 分组、`@media print` A4 样式、HTML 转义防注入）
- **HTML → PDF 导出**（`scripts/tools/render-pdf.py`）：零 LLM token 消耗；
  降级链 weasyprint → playwright(chromium) → msedge headless → chrome headless，自动探测
- CLI：`render --format md|html|pdf|auto`（按 `--out` 后缀推断）；`extract pdf` 子命令暴露 v2 管线

### 修复
- PyMuPDF 1.27 在 stdout 打印 layout 提示污染 JSON 管道（提取全程 stdout→stderr 重定向 +
  CLI 端 JSON 容错解析）
- 扫描版/图密集 PDF（如 T2L-Agent 后半 21 页）此前静默丢内容，现通过 `scanned_pages` 显式暴露

### 测试
- 新增 `tests/unit/render-html.test.ts`（5 个：结构/评分卡/quick 裁剪/HTML 转义防注入/徽章），全套 54 通过

## [0.3.0] - 2026-08-02（M3 完成 + M4 主体）

### 新增
- **泛化切片引擎 v2**（docs/04 重写 + `scripts/chunker.ts`）：统一管线 Unitize→Constrain→Annotate 适用全部对象类型；单元三层级（L1 分区/L2 语义块/L3 原子）+ 语义角色标注（claim/evidence/method/config/risk/outcome…）；边界检测器插件接口（`BoundaryDetector`）
- **tree-sitter 边界检测器**（`scripts/detectors/tree-sitter.ts`）：AST 精确函数/类/箭头函数边界，export 包装展开；不可用时 indent 启发式兜底
- **Code Analyzer**（`scripts/analyzers/code.ts`）：semgrep 真实扫描（Windows GBK 规避）+ 内置正则（硬编码密钥/eval/innerHTML/TODO）+ 结果合并去重
- **License Analyzer**（`scripts/analyzers/license.ts`）：SPDX 双路识别 + 条款检测 + copyleft/免责/无声明判定
- **Dataset Analyzer**（`scripts/analyzers/dataset.ts`）：规模/来源/许可/字段/时效/收集方式六类检查点
- **论文 PDF 解析链**：`scripts/tools/pdf-extract.py`（PyMuPDF）+ PDF fixture 生成器 + CLI 自动识别 `.pdf`
- **run 命令 + `--until` 截断**（docs/07 §7.4 契约）：discovery→chunk→analyze 编排，critic/judge/report 交宿主
- **事件流**：`--events` 输出 JSON 行事件（review.started→…→review.finished）
- **基准集**（`benchmark/`）：10 对象覆盖 7 类 + 人工预评锚点 + 校准脚本 `scripts/calibrate.ts`
- CLI：`fetch code|dataset`、`chunk`、`--no-tree-sitter`、`--events`

### 修复
- bus factor 口径（top5→top100）、issue_health 用不存在的字段、paper `citations` 未解构、CLI 参数位置、缓存命中变量未定义
- semgrep Windows GBK 崩溃（PYTHONIOENCODING）
- tree-sitter export_statement 包装层展开
- 论文章节编号前缀标题识别

### 打磨（v0.3.0 尾）
- **semgrep 本地规则集**（`.semgrep/rules/hos-code.yml`）：硬编码凭据/eval/innerHTML/TODO，确定性、无网络依赖；semgrep exit=2（有 blocking findings）不再误判失败
- **MCP server 基础版**（`scripts/mcp-server.ts`）：JSON-RPC 2.0 over stdio，expose `review` 工具（initialize/tools/list/tools/call 冒烟通过）
- **上下文预算实测**：`chunk` 输出 `TOKENS`/`BUDGET_USE`（对照 `config.yaml` pre-critic 60K 预算）

## [0.2.0] - 2026-08-02（M2）

- scripts/ 骨架：CLI（fetch github/paper、validate、render、store）、Review Store（幂等 + HCR 编号）
- GitHub/Paper Analyzer（真实 API + 1h 缓存 + 429 降级链）
- 单元测试 19 个；实跑 react（87/A）与论文（54/D）评审

## [0.1.0] - 2026-08-01（M1）

- SKILL.md + 七 Agent 规格 + 三报告模板 + references（评分/编号/风格/检查点）
- 泛化切片引擎 v1（按类型 Router）与 docs/ 规格集
- 零依赖全链实跑（article 62/C）
