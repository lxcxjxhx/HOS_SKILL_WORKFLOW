/**
 * Review Opinion Template
 * 
 * 生成标准化的审核意见 Markdown 文档
 * 用于对已发现的漏洞进行人工审核和确认
 */

/**
 * 审核意见接口
 */
export interface ReviewOpinion {
  /** 发现标题 */
  findingTitle: string;

  /** 审核人 */
  reviewer: string;

  /** 审核日期 */
  date: string;

  /** 审核状态 */
  reviewStatus: 'Confirmed' | 'False Positive' | 'Needs More Evidence' | 'Downgraded' | 'Upgraded';

  /** 审核过程中提出的问题列表 */
  questions: {
    question: string;
    answer: string;
  }[];

  /** 审核结论 */
  conclusion: string;

  /** 备注信息 */
  notes?: string;
}

/**
 * 生成审核意见 Markdown
 * 
 * @param opinion - ReviewOpinion 数据
 * @returns Markdown 格式的审核意见
 */
export function generateReviewOpinionMarkdown(opinion: ReviewOpinion): string {
  const statusEmoji: Record<ReviewOpinion['reviewStatus'], string> = {
    'Confirmed': '✅',
    'False Positive': '❌',
    'Needs More Evidence': '⚠️',
    'Downgraded': '⬇️',
    'Upgraded': '⬆️'
  };

  const questionsSection = opinion.questions.length > 0
    ? `### Questions & Answers

${opinion.questions.map((q, i) => `**Q${i + 1}:** ${q.question}

**A${i + 1}:** ${q.answer}

---`).join('\n')}`
    : '';

  const notesSection = opinion.notes
    ? `### Notes

${opinion.notes}`
    : '';

  const template = `# Review Opinion: ${opinion.findingTitle}

## Review Information

| Item | Details |
|------|---------|
| **Finding** | ${opinion.findingTitle} |
| **Reviewer** | ${opinion.reviewer} |
| **Date** | ${opinion.date} |
| **Status** | ${statusEmoji[opinion.reviewStatus]} **${opinion.reviewStatus}** |

---

${questionsSection}

---

## Conclusion

${opinion.conclusion}

${notesSection ? `---

${notesSection}` : ''}

---

*Reviewed by ${opinion.reviewer} on ${opinion.date}*
`;

  return template.trim();
}

export default { generateReviewOpinionMarkdown };
