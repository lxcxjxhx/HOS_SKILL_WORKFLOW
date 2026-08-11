# tex 源码证据规范（Tex Evidence & Asset Pipeline）

> 本文件固化 16 篇全量重审（2026-08-12）的经验：**评审必须以 tex 源码为准，不得依赖 PDF 转换文本**。
> 每条 RVE 的根因物证（texQuotes）必须逐字复制自 tex 源码，并附 file:line。

---

## 一、为什么 tex 源码优先（教训案例）

| 教训 | 案例 | 结论 |
|------|------|------|
| PDF 转换会失真 | SAST-Genius（2509.15433）Table 1 的 TP 170 > 输入源 125 最初被**怀疑是转换失真**，后经 pdftotext 交叉验证确认为**原文自带逻辑错误** | 不读原文，无法区分「转换错误」与「原文错误」——两个结论完全不同 |
| 压缩包会截断 | CLEAR（2608.03134）e-print 首次下载仅 225KB（半截），inner.tar 报 Unexpected EOF | 必须验证压缩包完整性（gzip -t / 解压验证） |
| 双层 tar 结构 | Argus（2604.06633）、CLEAR 的源码包是 tar 套 tar（外层解出 inner.tar，main.tex 在内层） | 解压失败不要假设包坏了——先看 tar -tvf 是否嵌套 |

**铁律**：任何数字争议，先下 tex 源码核对；无 tex 源码的论文（仅 PDF）必须在每条 issue 的 evidence 注明「无 tex 源码（arXiv e-print 仅 PDF），数字以 PDF 原文为准」，并挂 RVE-REPRO。

---

## 二、tex 源码获取（Asset Pipeline）

### 2.1 arXiv e-print（tex 源码官方入口）

```
https://arxiv.org/e-print/<arXivID>          # 默认最新版
https://arxiv.org/e-print/<arXivID>v<版本号>  # 指定版本（评审应锁定评审时版本）
```

- 15/16 篇返回 `application/gzip`（tex 源码包）；仅 SAST-Genius 返回 `application/pdf`（无 tex）。
- **断点续传**（网络不稳时）：`curl -C -` 循环直到 `gzip -t` 通过：

```bash
# 对每个 .bin：不完整就续传，直到 gzip -t 通过
while ! gzip -t "$f" 2>/dev/null; do
  curl -sL -C - --max-time 240 "https://arxiv.org/e-print/$id" -o "$f"
done
```

- **完整性验证**：`gzip -t <file>` 全过才算完成；解压失败先 `tar -tvf` 检查是否双层 tar（外层 → inner.tar → 内层 tex）。
- **标准化落盘**：`assets/tex/<NN>-<论文>/raw/*.bin`（原始包）+ `assets/tex/<NN>-<论文>/`（解压目录，保留全部文件）。

### 2.2 GitHub 仓库（可复现性验证）

- **禁止浅克隆**：`git clone --depth 1` 会丢历史，导致 commit 数/历史无法核验。必须完整克隆。
- 已浅克隆的仓库用 `git fetch --unshallow` 补全（复用已下载对象，比重新 clone 省流量）。
- 落盘：`assets/repos/<NN>-<仓库名>/`，验证 `.git/shallow` 不存在 = FULL。
- 核验项：commit 数（`git rev-list --count HEAD`）、README、LICENSE、关键脚本（如 AEGIS 的 calculate_metrics.py 可逆向 FPR 公式）。

### 2.3 Zenodo artifact（数据集/实验制品）

- Zenodo 记录 API：`https://zenodo.org/api/records/<record_id>` → files[] 拿下载 URL 与大小。
- 旧 DOI 会 302 迁移到新 record（Sifting：18420284 → 21282004），两个 DOI 都有效，正文统一用新 DOI。
- 大文件（GB 级）用断点续传脚本后台慢慢下；**评审不必等大文件**——先下小文件（README/清单/源码包）即可核对声明。

---

## 三、逐字引用规范（texQuotes）

1. `code` 字段必须**逐字复制**自 tex 文件（用 read_file/grep -n 定位行号），禁止改写、删数字、补标点。
2. 引用时保留 LaTeX 命令原文（`\textbf{111}` 等），JSON 中做合法转义（`\\`）。
3. 一条 issue 可挂多个 texQuotes（如 MultiVer 表 3：Overall 行 + 全部分类行，证明加总矛盾）。
4. `note` 字段说明「这段为什么是证据」——让读者 3 秒理解关联。
5. 核对动作：grep 定位 → read_file 确认上下文 → 复制 → 转义 → 渲染 HTML 时人工复查。

---

## 四、无 tex / 无仓库标记规范（评审透明度）

| 状态 | 标记 | 处理 |
|------|------|------|
| 无 tex 源码（仅 PDF）| `❌仅PDF` | texQuotes 留空；每条 evidence 注明「以 PDF 原文为准」；挂 RVE-REPRO |
| 无仓库（未开源）| `❌无repo` | 必须有一条 RVE-REPRO（GitHub repo search 0 结果 + arXiv 无代码链接）|
| 仓库 404 | `⚠️repo404` | 挂 RVE-REPRO（如 T2L-Agent，RVE-0043）|
| 残废仓库 | `repo残废` | RVE-REPRO（star/commit/LICENSE 三项核验）|
| 可复现 | `repo✅` | 完整克隆核验 commit 数 |

> 汇总表（组会/总览）必须带 tex/repo 状态列——评审的底气来自「每篇都能指出证据在哪」。

---

## 五、数据核对工作流（每篇必做）

1. 下载 e-print → 解压 → 找主 tex 文件（main.tex / example_paper.tex / 分章节 sections/）。
2. 读已有评审（NN-<论文>.md）提取核心发现与争议数字。
3. 对每个争议数字 grep 定位 tex 行 → read_file 确认 → 判断：
   - **原文自带错误**（如 Table 3 分项 49 ≠ Overall 111）→ RVE-DATA/CRITICAL，引用全部相关行。
   - **口径问题**（如相对下降率与基线复算不符）→ RVE-EVAL，引用基线定义行 + 结果行。
   - **选择性报告**（如 22.25% 只在 Discussion）→ RVE-EVAL，引用摘要行 + 被隐藏数字所在行。
4. 仓库侧验证（如有）：README 数字 vs 正文、关键脚本逆向指标公式、报告文件互斥（AutoTrace RQ1.2 11.1% vs 93.75% 案例）。
5. 产出 review.json（evidenceChain 规范见 SKILL.md 五·五节）→ 渲染 HTML。

---

## 六、配套脚本与命令速查

```bash
# e-print 断点续传（tex）
curl -sL -C - --max-time 240 "https://arxiv.org/e-print/$id" -o "$name.bin"
gzip -t "$name.bin"          # 完整性
tar -xzf "$name.bin"         # 解压；失败先 tar -tvf 查双层结构

# 仓库补全历史（浅 → 完整）
git fetch --unshallow
git rev-list --count HEAD    # commit 数

# Zenodo
curl -sL "https://zenodo.org/api/records/$rid" | python -m json.tool
```
