# 指标口径协议（铁律，源自 16 篇论文评审教训）

> 口径是第一生命线：所有指标给完整定义（分子/分母/基线/数据），不许只报相对提升。
> 对齐：`HOS-LS-paper/07-对比实验设计-同数据同API受控对比.md` §3.3。

## 1. 检出口径（双口径，全部 pair_id 可追溯）

| 口径 | 定义 | 用途 |
|------|------|------|
| **CONFIRMED（严格）** | 顶层 finding `status == CONFIRMED`，验证链完整（Agent-3 验证 + 攻击链/对抗信号） | 反映"确定性验证"能力 |
| **识别（recognition）** | CONFIRMED 或存在 high/critical finding | 反映"语义理解深度"，不要求验证链完整 |

**为什么双口径**：22 个 WEAK/UNCERTAIN 样本的 high finding 几乎全是真实漏洞
（os.system 注入、Jinja2 无沙箱、不安全 yaml.load），只是验证链未走完。双口径
避免"软硬指标替换"的批评（评审教训：CLEAR 71.56% vs 96.9% 自相矛盾）。

## 2. 误报口径

- **标准 FPR** = FP / (FP + TN)，禁止 AEGIS 式 `fp = P-V + P-R` 逆向口径（评审 RVE）。
- patched 端误报判定：修复后文件仍有 CONFIRMED/识别 finding。
- **注意**：RepoPairBench 的 patched 仅针对特定 CVE 修复，"不代表完全安全"
  （DREA 原文声明）——patched 端 high 风险可能是"修复不完整"而非纯误报，
  判定时按目标 CVE/CWE 对账（`cwe_judge.py`）。

## 3. 判定明细（10 样本）

| 类型 | 定义 | 处理 |
|------|------|------|
| TP | vuln 检出且命中目标 CVE/CWE | 计数 |
| 修复不完整（误报） | patched 仍报同类风险，但描述有据 | 报告为"修复不完整"，非纯误报 |
| 类型错位 | 检出正确但 CWE 标签不同 | 用 LLM 裁判/细映射复核 |
| 漏检 | 未检出 | 归因：测试文件脏样本 / 跨函数 / 系统缺陷 |

## 4. 定位与成本

- 定位精度报严格行命中 + relaxed 双口径（防 AutoTrace 式宽松口径）。
- 成本报总 token + 每漏洞 token + 每漏洞美元双口径（防 Revelio 挑分母）。

## 5. 受控对比铁律

- 同数据 + 同模型 API（默认 deepseek-v4-flash）+ 同指标定义 + 同运行环境。
- 裸 LLM 基线一律同模型零样本；SAST 基线同协议同数据。
- 所有数字公开分子/分母/样本 ID；单次运行补多 seed 统计。
