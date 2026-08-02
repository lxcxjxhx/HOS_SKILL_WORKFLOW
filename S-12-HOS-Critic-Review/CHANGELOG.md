# HOS-CRITIC-REVIEW 变更记录

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
