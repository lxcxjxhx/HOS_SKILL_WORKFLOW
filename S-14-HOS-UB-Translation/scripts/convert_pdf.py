# -*- coding: utf-8 -*-
"""docx -> PDF 批量转换（Windows WPS COM；若装了 LibreOffice 可改用 soffice --headless）。
用法: python convert_pdf.py a.docx [b.docx ...]"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def convert(files):
    import win32com.client as w
    app = w.Dispatch('KWps.Application')  # WPS 兼容 Word COM
    try:
        app.Visible = False
    except Exception:
        pass
    try:
        for f in files:
            src = os.path.abspath(f)
            dst = os.path.abspath(os.path.splitext(f)[0] + '.pdf')
            doc = app.Documents.Open(src, ReadOnly=True)
            doc.SaveAs(dst, 17)  # 17 = wdFormatPDF
            doc.Close(False)
            print('OK', f, os.path.getsize(dst))
    finally:
        app.Quit()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    convert(sys.argv[1:])
