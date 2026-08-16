# 漏洞披露闭环（Disclosure Ledger，借鉴 Z.ai/GLM-5.3 实践）

> 目的：从「发现漏洞」到「协调披露」的完整、可核验闭环，形成数据闭环用于后续优化。
> 轻量流程（文档级，不侵入代码主链路）；复用现有 evidence_chain / CVE 挂编号能力。

## 流程

```
发现（扫描/CVE 匹配）→ 验证（确定性验证器/人工复核，evidence_chain）
→ 分类（公开细节 vs 保密期）→ 披露（协调披露给维护者）→ 账本登记 → 状态跟踪
```

## 账本字段（database/disclosure-ledger.json）

| 字段 | 说明 |
|------|------|
| vuln_id | HOS-VULN-YYYY-NNNN |
| cve / advisory | 可核验编号（CVE-xxx / GHSA-xxx），未公开则记 commit hash |
| repo / file / line | 位置 |
| evidence_ref | 证据链（PoC/确定性验证产物路径） |
| status | found / verified / disclosed / triaged / fixed / public |
| disclosure_date | 协调披露日期 |
| public_detail | 公开细节（修复后填）或 "hash-only" |

## 纪律

1. **验证优先**：未过确定性验证/人工复核的发现不进披露流程（防假漏洞伤信誉）。
2. **协调披露**：默认先通知维护者（90 天窗口），不抢跑公开。
3. **保密期只公开哈希**：供第三方核验，不泄露可利用细节。
4. **每一条可追溯**：账本行必须能指向评测产物/证据链文件（与论文口径一致）。

## 与论文/评测的衔接

- 发现的漏洞编号挂进论文「可核验声称」表（写作铁律 #2）。
- 修复后数据（patch 前后）回流评测集/知识库 → 供后续优化循环使用（数据闭环）。
