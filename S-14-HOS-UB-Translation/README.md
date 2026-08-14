# HOS-UB-Translation · Upwork 翻译交付流水线

![UB](https://img.shields.io/badge/头标-UB-blue)　![S-14](https://img.shields.io/badge/编号-S--14-green)

> **头标：UB** · 编号：S-14 · 语言：Python/Markdown · 许可证：AGPLv3

## 简介

英→中翻译交付全流程技能：将英文合同/法律文档翻译为中文，产出 6 类交付物（保留原格式、专业排版、中英对照、条款摘要、通俗简化、润色），全部 Word + PDF 双版本；并按 Upwork 等平台"合同开始前政策"完成合规处理（联系方式脱敏、ZipCrypto 加密打包、Cover Letter 撰写）。

## 目录结构

```
S-14-HOS-UB-Translation/
├── SKILL.md                  # 主 playbook（完整流程 + 踩坑记录 + 校验清单）
└── scripts/
    ├── extract_docx.py       # 解析 docx：段落 + 表格 + 段内换行标注
    ├── replace_in_place.py   # 原地替换译文，保留原格式（pPr/rPr/表格/分页）
    ├── convert_pdf.py        # WPS COM 批量 docx → PDF
    ├── sanitize.py           # 联系方式脱敏（邮箱/电话 → ____）
    └── make_zip_crypto.py    # 标准 ZipCrypto 加密 zip（Windows 可直接解压）
```

## 快速开始

```bash
# 1. 解析源文档，规划译文
python scripts/extract_docx.py "input.docx"

# 2. 原地替换生成保留原格式版（译文映射写入 translation_map.py，见 SKILL.md）
python scripts/replace_in_place.py input.docx output.docx translation_map.py

# 3. 转 PDF
python scripts/convert_pdf.py output.docx

# 4. 平台合规：脱敏明文版 / 加密 zip（密码 HOS123 等自定）
python scripts/sanitize.py masked.docx
python scripts/make_zip_crypto.py --out Employment-Agreement-Chinese-Translation.zip \
    --password HOS123 --as "Employment Agreement (Chinese).docx,Employment Agreement (Chinese).pdf" \
    "完整版.docx" "完整版.pdf"
```

## 关键特性

- **格式统一**：保留原格式版基于原 docx 原地替换，不重排；页码位置跟随原文（页眉/页脚）
- **6 类版本**：保留原格式 / 专业排版 / 中英对照 / 条款摘要 / 通俗简化 / 润色
- **平台合规**：Upwork 明文附件禁止联系方式；加密 zip（ZipCrypto 传统加密，Windows/WinRAR/7-Zip 可解）内放完整未脱敏版
- **工程化脚本**：全部踩坑（PKWARE crc32、12 字节加密头、WPS COM、中文文件名编码等）已沉淀在 SKILL.md

## 维护

- 主 playbook：`SKILL.md`（唯一事实来源）
- 通用脚本：`scripts/`（冒烟测试通过：标准 zipfile 独立校验）
