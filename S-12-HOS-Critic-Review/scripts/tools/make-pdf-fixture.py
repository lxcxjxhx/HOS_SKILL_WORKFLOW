#!/usr/bin/env python
"""生成演示用论文 PDF fixture（HOS-CRITIC-REVIEW 论文 PDF 解析链验证）。
用法: python make-pdf-fixture.py <out.pdf>
内容: 构造一篇有典型问题的论文（弱基线 / 小样本 / 无消融 / 未开源）。
"""
import sys
import fitz  # PyMuPDF

SECTIONS = [
    ("Abstract", "We propose CAMEL-GRU, a lightweight malware classification framework combining feature hashing, GRU and self-attention, with only 2.1M parameters. Experiments on 3 datasets show CAMEL-GRU achieves 99.2% average accuracy, outperforming all existing methods (SOTA) while reducing inference latency by 47%."),
    ("1 Introduction", "Deep malware detection models based on Transformers achieve good results but 200M+ parameters are impractical on endpoints. This paper focuses on lightweight architecture design."),
    ("2 Method", "CAMEL-GRU consists of three layers: a feature hashing layer mapping raw API call sequences to fixed-dimension vectors, a GRU encoder, and a self-attention pooling layer. This hashing plus recurrent plus attention three-stage structure is our core innovation. We use AdamW optimizer with learning rate 3e-4 and batch size 64. Hyper-parameter grid search details will be provided in the final version."),
    ("3 Experiments", "We evaluate on 3 datasets: API-Seq-2017 (public, 2017, 10,000 samples), Corp-Real-A (private enterprise telemetry, 4,300 samples), Corp-Real-B (private, 3,100 samples). Baseline comparison: TF-IDF+SVM 91.8%, Random Forest 93.5%, MLP 94.1%, CAMEL-GRU 99.2%. We report accuracy, F1 and inference latency. Due to space limits, per-class metrics are not reported. Ablation study: (not conducted)."),
    ("4 Conclusion", "CAMEL-GRU validates the feasibility of lightweight architecture for malware detection with 2.1M parameters and 99.2% accuracy on 3 datasets. Code and data will be open-sourced in the future."),
    ("References", "[1] API call sequence dataset (link unavailable). [2] Transformer-based malware detection (2023)."),
]


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "sample-paper.pdf"
    doc = fitz.open()
    for title, body in SECTIONS:
        page = doc.new_page()
        page.insert_text((72, 72), title, fontsize=14)
        y = 110
        for chunk in [body[i:i + 78] for i in range(0, len(body), 78)]:
            page.insert_text((72, y), chunk, fontsize=10)
            y += 16
    doc.save(out)
    doc.close()
    print(f"PDF written: {out} ({len(SECTIONS)} pages)")


if __name__ == "__main__":
    main()
