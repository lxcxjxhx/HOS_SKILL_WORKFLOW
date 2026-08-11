// ============================================================
// HOS-Paper-RedTeam — 评分卡数据结构（通用于所有论文类型）
// 参考 ghfind.com 的 GitHub 开发者评分卡结构，映射到论文评审。
// Node 24+ 可直接运行 TS（node src/index.ts review.json）。
// ============================================================

/** 单个维度评分（满分 max 可任意，合计通常为 100） */
export interface DimensionScore {
  key: string;      // 维度 key，如 novelty / rigor / contribution
  label: string;    // 维度名，如「新颖性」
  score: number;    // 实际得分
  max: number;      // 满分
  note?: string;    // 一句话说明（渲染进维度说明表）
}

/** 牵涉的 tex 原文段落（根因证据：论文哪里写的、怎么写的） */
export interface TexQuote {
  file: string;      // tex 文件路径（如 main.tex / sections/5-evaluation.tex）
  line?: number;     // 起始行号（可空）
  code: string;      // tex 代码片段（原文）
  note?: string;     // 一句话说明这段为什么是证据
}

/** 单条问题（RVE）的完整证据链路：Claim → tex 原文 → 证据缺口 → RVE → Patch */
export interface EvidenceLink {
  rveId: string;           // HOS-RVE-2026-00XX
  category: string;        // RVE-DATA / RVE-BENCH / RVE-EVAL / RVE-SEC / RVE-REPRO
  severity: string;        // CRITICAL / HIGH / MEDIUM / LOW
  title: string;           // 问题标题（一句话点破根因）
  claim?: string;          // 论文声称（原文或转述，Claim Analyzer 编号）
  claimRef?: string;       // 声称位置（如「摘要」「§5.2」「Table 3」）
  rootCause: string;       // 根因：为什么这个声称站不住（详细解释）
  texQuotes: TexQuote[];   // 牵涉段落（tex 原文引用，根因的直接物证）
  gap?: string;            // 声称与证据之间的缺口（差距在哪）
  exploit: string;         // 影响：这个洞会被怎么利用/误导
  patch: string;           // 修复方案（怎么补）
  evidence?: string;       // 外部权威佐证（arXiv/OpenReview/PWC/S2 锚点）
}

/** 问题统计（渲染进报表统计面板；可自动从 issues 计算） */
export interface ReviewStats {
  total: number;                          // 问题总数
  bySeverity: { critical: number; high: number; medium: number; low: number };
  byCategory: Record<string, number>;     // RVE-DATA/RVE-EVAL/... 计数
  perDimension?: Record<string, number>;  // 各维度扣分点数（可选）
}

/** 论文评分卡完整数据 */
export interface PaperReviewData {
  // —— 头部（对应 ghfind 的账号信息）——
  title: string;          // 论文标题
  arxivId?: string;       // arXiv ID
  venue?: string;         // 会议/期刊
  authors?: string;       // 作者
  submitted?: string;     // 提交日期

  // —— 评分（对应 ghfind 的 82.70/100 🥇 顶级）——
  score: number;          // 综合评分 0-100
  rankEmoji: string;      // 评级 emoji，如 🟠
  rankLabel: string;      // 评级标签，如「画靶射箭型」
  tags: string[];         // #标签，如 #选择性报告 #拼接物

  // —— 排名（对应 ghfind 的 我的位置 / 击败 X% / 距升级差 X 分）——
  position?: { rank: number; total: number };      // 我的位置 #rank/共 total 篇
  beatPercent?: number;   // 击败了 X% 的已审论文（0-100）
  nextRank?: { label: string; diff: number };      // 距「{label}」还差 {diff} 分

  // —— 维度评分（对应 ghfind 的六维评分）——
  dimensions: DimensionScore[];

  // —— 正文区块（对应 ghfind 的 🏆/🛠/🧬）——
  highlights: string[];                             // 🏆 亮点/关键贡献
  methods: string[];                                // 🛠 关键方法/技术栈
  similarPapers: { title: string; score: number; tag?: string }[];  // 🧬 最像的论文

  // —— 毒舌点评（对应 ghfind 的 🔥 毒舌点评全文 + 一句话结论）——
  roastFull: string;      // 🔥 毒舌点评全文（一段）
  oneLiner: string;       // 一句话结论（≤40 字，可截图）

  // —— 尾部（对应 ghfind 的风险标记 / 建议 / 补充证据）——
  riskFlags: string[];    // 风险标记（通常引用 RVE 编号）
  suggestions: string[];  // 建议（Patch 方向）
  evidence: string[];     // 补充证据（可核验引用）

  // —— 新增：根因证据链 + 问题统计（完整审计报表）——
  issues?: EvidenceLink[];    // 逐条问题（含根因 + tex 原文引用）
  stats?: ReviewStats;        // 问题统计（缺失时渲染器自动从 issues 计算）
}

/** 通用六维（默认模板，满分合计 100，适用于所有论文类型） */
export const UNIVERSAL_DIMS: Omit<DimensionScore, 'score'>[] = [
  { key: 'novelty',       label: '新颖性',   max: 20, note: '方法/问题是否新，还是 A+B 拼接' },
  { key: 'rigor',         label: '严谨性',   max: 25, note: '论证/实验/统计是否站得住' },
  { key: 'contribution',  label: '贡献度',   max: 20, note: '实际贡献价值，结论是否被证据支撑' },
  { key: 'repro',         label: '可复现性', max: 15, note: '代码/数据/参数是否可得可复现' },
  { key: 'clarity',       label: '清晰度',   max: 10, note: '表达/结构/图表的清晰程度' },
  { key: 'impact',        label: '影响力',   max: 10, note: '领域相关度与潜在影响' },
];
