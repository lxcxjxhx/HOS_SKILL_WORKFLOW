---
name: upwork-translation-delivery
description: 英→中翻译交付流水线：6 类 docx 版本（保留原格式/专业排版/中英对照/摘要/简化/润色）+ PDF（WPS COM）+ Upwork 合规（脱敏/ZipCrypto 加密 zip/Cover Letter）
---

# HOS-UB-Translation · Upwork 翻译交付流水线（英→中多版本 + PDF + 平台合规打包）

![UB](https://img.shields.io/badge/头标-UB-blue)　![S-14](https://img.shields.io/badge/编号-S--14-green)　![Python/Markdown](https://img.shields.io/badge/语言-Python%2FMarkdown-lightgrey)

> **头标：UB** · 编号：S-14 · 名称：HOS-UB-Translation · 许可证：AGPLv3

将英文合同/法律文档翻译为中文，产出 6 类交付物（保留原格式、专业排版、中英对照、条款摘要、通俗简化、润色），全部 Word + PDF 双版本；并按 Upwork 等平台"合同开始前政策"做合规处理（联系方式脱敏、ZipCrypto 加密打包），生成 Cover Letter。

## 何时使用
- 收到 Upwork/外包平台的"英译中"翻译任务，需交付多个版本 Word/PDF
- 需要按平台政策脱敏联系方式、加密打包附件的任务
- 需要"格式统一 + 排版美观"双重要求的合同/法律文档处理

## 关键约束（先读，都是实测踩坑）
1. **保留原格式版**必须基于原 docx 原地替换文本，不得重排；用户常要求"格式统一、不得大量变动"
2. **页码位置**：原文页码在页眉就放页眉（居中 PAGE 字段），勿擅自移到页脚
3. **命令行传中文文件名**在 Windows 会被 GBK 转码损坏 → 一律把逻辑写进 .py 脚本文件运行（文件名用脚本内 UTF-8 字符串）
4. **ZipCrypto 加密**细节见 scripts/make_zip_crypto.py：密钥更新用 PKWARE crc32（无 0xFFFFFFFF 包裹）、csize 必须含 12 字节加密头、加密头第 12 字节 = CRC 高字节 (CRC>>24)&0xff、通用标志 = 0x0001|0x0800（加密+UTF-8 文件名）
5. **Upwork 明文附件**含邮箱/电话会被自动扫描拒绝；**加密 zip 内的未脱敏文件不受影响**
6. 文件被 Word/WPS 打开时无法覆盖（出现 `~$` 锁文件）→ 请用户关闭，或换新文件名
7. python-docx 的段落数 ≠ zipfile 的 w:p 数（差值=表格内段落）；遍历用 `d.paragraphs` + `d.tables[].rows[].cells[].paragraphs`

## 环境
- python + python-docx
- PDF 转换优先级：① LibreOffice `soffice --headless --convert-to pdf` ② Windows WPS COM `win32com.client.Dispatch('KWps.Application')`，`doc.SaveAs(path, 17)`（17=PDF）③ 其他
- 加密 zip 用自带 ZipCrypto 实现（标准传统加密，Windows 资源管理器/WinRAR/7-Zip 可直接解压），**不要用 pyzipper 写传统加密**（其 ZipFile 抛 NotImplementedError，AES 又无法被 Windows 资源管理器解压）

## 流程

### 阶段 1：解析源文档
```bash
python scripts/extract_docx.py "input.docx"
```
输出全部段落（含空段）与表格内段落，标注段内换行；据此逐段规划译文。

### 阶段 2：翻译
- 按段落逐段翻译（含表格内容），保留编号结构；段内换行（原文 w:br）在译文中用 `\n` 对应
- 法律名称保留原文编号 + 中文译名，如《遣散费法》（5723-1963）、《解雇与辞职事先通知法》（5761-2001）
- 原文明显笔误：按合理语义处理并加〔译注：…〕标注，另在交付说明中汇总
- 数字/编号/日期/姓名/公司名保持原文

### 阶段 3：生成各版本（Word）
1. **保留原格式版**：`scripts/replace_in_place.py`（原地替换：保留 pPr/rPr 格式、段内 `\n`→`w:br`、补 eastAsia 宋体）。唯一允许的排版调整：正文右对齐（RTL 残留）改两端对齐、标题保持居中——需向用户说明
2. **专业排版版**：重排（标题居中加粗、正文宋体两端对齐首行缩进、条款标题加粗、附录改为标签-值双列表格、页码在页眉居中）
3. **中英对照版**：英文（Times New Roman 灰色）+中文（宋体黑色）逐段上下对照，附录表格英中对照
4. **条款摘要版**：类别/条款/要点三列表格（表头底纹）+ 重要提示（不构成法律意见）
5. **通俗简化版**：通俗章节列表 + "签署前请特别留意"
6. **润色版**：统一术语、修正原文笔误（如条款引用错误、"except in"应为"only in"）、残缺句按上下文补全，文末附"润色说明"
（1-6 的生成器代码结构见下方"版本生成器模板"；具体译文/摘要/简化/润色文本由 AI 按阶段 2 生成）

### 阶段 4：转 PDF
```bash
python scripts/convert_pdf.py file1.docx file2.docx ...
```

### 阶段 5：Upwork 合规
1. 明文脱敏版（如需上传明文附件）：`scripts/sanitize.py` 将邮箱/电话替换为 `__________`
2. 完整未脱敏版：明文（本地查看）+ 加密 zip（提交附件）
3. 加密 zip：`python scripts/make_zip_crypto.py --out Employment-Agreement-Chinese-Translation.zip --password HOS123 --as "Employment Agreement (Chinese).docx,Employment Agreement (Chinese).pdf" a.docx b.pdf`；zip 内文件名用英文（客户看得懂，如 `Employment Agreement (Chinese).docx`）
4. Cover Letter（纯 txt）：**附件密码放最前面**（`Attachment password: XXX`），并解释"附件为加密压缩包，内含完整未脱敏版；因平台政策限制明文附件中的联系方式；也可通过平台消息直接提供"

### 阶段 6：校验（必须全过）
- 各 docx：全部条款标题 + 关键数据（金额、编号、日期、护照/注册号）抽查
- PDF：pypdf/pdfplumber 提取首页文本，确认中文渲染无乱码
- 脱敏版：正则确认无 `邮箱|@|电话.*\d{7,}` 残留
- 加密 zip：**标准 zipfile** `setpassword` 解压 → 解压内层 docx 用 python-docx 解析确认内容完整（含未脱敏信息）；错误密码必须拒绝
- 验证 zip 内文件名均为英文

## 版本生成器模板（python-docx 通用结构）
- 新建 Document，`sec.page_width/height = Cm(21)/Cm(29.7)`，页边距 Cm(2.54)
- Normal 样式：`font.name='Times New Roman'` + `element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')`（中文字体必须设 eastAsia）
- 助手 `set_font(run, size, bold)`；段落类型 title/subtitle/head/body/sign/note 分别控制对齐/缩进/间距
- 条款标题判定：`re.match(r'^\d+\.\s+\S', t)` 且非 `^\d+\.\d`
- 页眉页码（居中 PAGE 字段）用 `w:fldChar begin/instrText PAGE/fldChar end`
- 表格样式 `Table Grid`，`c.width = Cm(...)` 控制列宽

## 踩坑记录（本工作流实测，含根因）
1. **`zlib.crc32(bytes([b]), crc)` 是标准 CRC32（含 0xFFFFFFFF 包裹），不是 ZipCrypto 密钥更新算法**。ZipCrypto 用无包裹查表法 `(crc>>8) ^ table[(crc^ch)&0xFF]`（table 为 `_gen_crc` 标准表）。用错会导致标准 zipfile 解不开——注意"自己加密自己解密"的自洽测试会骗人，**必须用标准 zipfile 独立验证**
2. 传统加密 zip 的 **compressed size 必须含 12 字节加密头**，否则解压数据错位、CRC 失败
3. 加密头第 12 字节 = CRC 最高字节，zipfile/7-Zip 用它校验密码
4. WPS COM：`Dispatch('KWps.Application')` 返回 Word 兼容接口；`app.Visible=False`；一次打开一个文档转换后 Close
5. docx 是 zip 压缩格式，对原始字节 decode 后搜文本会漏（压缩流无明文连续串）；校验需先解压再解析
6. python-docx 读到的段内 `\n` 来自 `w:br`；重建时 `OxmlElement('w:br')`
7. 空段/含 BR 的空段（分页占位）尽量保留，勿删除，否则分页变化
8. 附件提交前检查目录 `~$` 锁文件，确认原文件未被 Word/WPS 打开

## 交付清单模板
- 雇佣协议（中文版）— 保留原格式.docx/.pdf
- 雇佣协议（专业排版版）.docx/.pdf
- 雇佣协议（中英对照版）.docx/.pdf
- 雇佣协议（条款摘要版）.docx/.pdf
- 雇佣协议（通俗简化版）.docx/.pdf
- 雇佣协议（润色版）.docx/.pdf
- `<英文名>.zip`（ZipCrypto 加密，密码在 Cover Letter 最前面）
- 求职信（Cover Letter）.txt（纯 txt，无格式符号）
