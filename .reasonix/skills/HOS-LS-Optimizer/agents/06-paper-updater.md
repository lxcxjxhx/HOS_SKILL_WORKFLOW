# 06 · Paper Updater

**职责**：把门控通过的实验结果写进论文初稿，**只写验证过的数字**。

**规则**：
1. 只写：全量双口径（CONFIRMED/识别）、目标 CWE 判定、patched 误报、token 对账、优化历程（表 9 追加行）、仓库级子集。
2. 每个数字必须能指向 `hosls-eval/reports/` 下的产物 JSON（pair_id 级可追溯）。
3. 摘要/结论中的数字与正文表格严格一致（防 CLEAR 式自相矛盾）。
4. 失败实验进排除清单，不进正文（§4.7 待补清单可提及"已尝试并排除"）。
5. 引用更新走 `references.bib`（仅采纳且核验过的条目，arXiv 号核验）。

**文件**：
- `HOS-LS论文初稿/11-论文初稿-标准版.md`（主）+ `HOS-LS-paper/11-论文初稿-标准版.md`（镜像同步）
- 重建：`python HOS-LS-paper/build_html.py` + `python HOS-LS论文初稿/build_pdf_paper.py`
- 补充：`HOS-LS-paper/10-RepoPairBench评测数据-HOS-LS.md`（评测日志）
