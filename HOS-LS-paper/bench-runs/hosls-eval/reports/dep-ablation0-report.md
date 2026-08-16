# DEP-A0 离线消融报告（零 API）

> 2026-08-17 01:09 · API 调用：0

## 0. 结论速览

1. **函数级切片上，静态差分信号不可用**：HOS-LS 系统静态层 V+P-（消失模式）仅 **4/100**；semgrep 官方规则更差（1/100）。DEP 的 SAST 差分价值只能在**仓库级**实现（已有旁证：仓库级 CodeQL 9 对 5/9 硬命中，其中 d873de7f/ee76e0c9 是 AI 曾漏检样本）。
2. **现状 Pair-Correct 13/50 中有 6 个为"残留型假阳性"**（vuln 端 CONFIRMED 但 patched 端仍有 finding）——即 **Pair-Correct 的 46% 不可靠**，这正是 DEP 要修的协议缺陷（防"修复不完整"类误报被计入正确）。
3. **DEP 是诚实性收紧器，不是刷数字器**：在现有数据上 DEP 后处理 Pair-Correct 13→7；其论文价值是揭示 Pair-Correct 口径脆弱性 + 提供协议级修正。**数据提升必须来自仓库级上下文 + SAL 锚定**（表 7：0/4→3/4），DEP 保证提升后的数字可信可复现。

## 1. 静态双端差分

### 1a. 系统静态层（HOS-LS 自带规则，复用已有 100 文件全量结果）

| 类别 | 对数 | 占比 |
|---|---|---|
| V+P- (消失模式, DEP 信号可用) | 4 | 4.0% |
| V+P+ (残留, 误报风险) | 72 | 72.0% |
| V-P- (静态不可见, 需 AI) | 20 | 20.0% |
| V-P+ (静态误报) | 4 | 4.0% |

> 解读：静态规则是"危险模式匹配器"，vuln/patched 函数结构高度相似（补丁仅改数行）→ 72% 双端命中。**差分信号在切片粒度上不存在**；仓库级才有（文件粒度差异 + 真实代码结构下的 CodeQL 污点分析，cascade 9/9 对中 5 对硬命中）。

### 1b. 官方规则（semgrep p/python 151 条 + bandit，全量重跑）

| 类别 | 对数 |
|---|---|
| V+P- (消失模式, DEP 信号可用) | 1 |
| V+P+ (残留, 误报风险) | 3 |
| V-P- (静态不可见, 需 AI) | 96 |

> 解读：官方规则更精确 → 切片上几乎零命中。两者共同结论：**静态差分必须仓库级**。

## 2. AI 双端 DEP 后处理（复用 50 样本已有结果）

- 有双端结果的样本：50
- 现状 Pair-Correct（vuln CONFIRMED 且 patched 非 CONFIRMED）：**13/50**
- DEP 消失性判定后 Pair-Correct（vuln CONFIRMED 且 patched 无 finding）：**7/50**
- DEP 修正的样本（vuln CONFIRMED 但 patched 有 finding，现状计为 Pair-Correct）：**6/50（46% 的 Pair-Correct 为残留型假阳性）**

> caveat：50 样本 AI 结果文件 stderr 含 `AI API key not configured, skipping AI verification`，AI 验证链部分环节未配置 key；本分析仅用 confirmed/recog/findings 字段做数学结构对照，最终结论需 S1-A 付费消融确认。

## 3. 对后续阶段的指引

| 阶段 | 依据 |
|---|---|
| Phase 3 仓库级协议 | 静态差分需仓库级（本报告 1a/1b）；仓库级 CodeQL 硬命中已证 5/9 |
| SAL sink 锚定 | 待 sal-ablation0-report（锚定差分信号比例） |
| S1-A 付费消融 | DEP 收紧效应（13→7）需在完整验证链下重测；预期仓库级协议下定位率↑ + DEP 保真 |
| 论文叙事 | "Pair-Correct 口径 46% 残留假阳性"是可发表的机制发现，DEP 为协议级修正 |

