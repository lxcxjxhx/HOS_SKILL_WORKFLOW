# 并行批量重审工作流（Batch Review Workflow）

> 适用：一次审 N 篇论文（如 16 篇全量重审）。
> 沉淀自 2026-08-12 的 16 篇全量重审：**编号冲突**（0052/0060 双用）与 **write_paths 隔离**教训。

---

## 一、流程总览

```
① 准备（主线程）
   ├─ 建输出目录 16篇评审汇总-RE/
   ├─ 读 database/vulnerability.json → 提取每篇已有 RVE 编号（沿用集合）
   └─ 为无编号论文预分配号段（0044 起，按论文顺序）

② 并行评审（fleet，每篇一个子代理）
   ├─ write_paths 声明非重叠输出目录（每篇一个）
   ├─ 子代理只读素材：已有评审 md + tex 源码 + 仓库 + vulnerability.json
   └─ 产出 review.json（evidenceChain 规范，含逐字 tex 引用）

③ 主线程收尾
   ├─ 校验 16 篇 JSON + 编号全局唯一（防冲突）
   ├─ 统一渲染 HTML（node src/index.ts）
   ├─ 新 RVE 登记 vulnerability.json（next 推进）
   └─ 生成跨篇汇总 + 组会汇报
```

---

## 二、编号预分配（防冲突铁律——血泪教训）

**教训**：并行子代理自行编号导致 **0052 双用**（04-Argus 与 05-LLMPFA）与 **0060 双用**（06-SAST-Genius 与 07-ZeroFalse）。原因：主线程给相邻论文分配了重叠号段，子代理之间无法通信。

**规则**：
1. **主线程预分配**：按论文顺序 01→16，把「该篇需要的新编号号段」写死在每个子代理的 prompt 里（如 04 用 0048-0052、05 用 0053-0056），号段不重叠。
2. **沿用编号不动**：已有 RVE（vulnerability.json 中该论文的记录）直接沿用，子代理必须先从登记库读出并一一对应。
3. **pending 机制**：子代理发现新问题但不确定编号 → 写 `pending-<NN>-XX`，**不许自编号**；主线程统一分配。
4. **重编号脚本兜底**：并行结束后主线程跑一遍全局唯一性检查，冲突则按论文顺序重新连续分配（脚本见下文）。

```python
# 重编号：沿用集合保持，其余按论文顺序连续分配
keep = {f'HOS-RVE-2026-{n:04d}' for n in range(1, 44)}  # 已登记号段
next_seq = 44
for name in order:
    for issue in load(f'{name}/review.json')['issues']:
        if issue['rveId'] in keep: continue
        issue['rveId'] = f'HOS-RVE-2026-{next_seq:04d}'; next_seq += 1
```

---

## 三、子代理任务规范（prompt 模板要点）

每个子代理 prompt 必须自包含（子代理看不到主线程上下文）：

1. **论文标识**：标题 + arXiv ID + 编号（NN）。
2. **只读素材路径**（绝对路径）：
   - 已有评审：`16篇评审汇总/<NN>-<论文>.md`
   - tex 源码：`16篇评审汇总/assets/tex/<NN>-<论文>/`（主文件提示）
   - 仓库：`16篇评审汇总/assets/repos/<...>/`（或无）
   - 登记库：`.reasonix/skills/HOS-Paper-RedTeam/database/vulnerability.json`
3. **铁律清单**：score 沿用不重打 / texQuotes 逐字复制 / 无 tex 留空+注明 / 每条有 patch / 至少一条权威佐证 / 不写 stats。
4. **编号规则**：沿用哪些、新号段起止、pending 命名。
5. **交付**：review.json 路径 + 问题数 + 每条 rveId/category/severity/title 列表。

---

## 四、fleet 配置要点

```jsonc
// 16 个子代理并行
{
  "tasks": [
    { "write_paths": ["C:\\...\\16篇评审汇总-RE\\01-CodeX-Verify"], "max_steps": 40, "prompt": "..." },
    // 每篇一个，write_paths 互不重叠（重叠会 preflight 失败）
  ]
}
```

- **write_paths 必须非重叠**：每篇一个独立输出目录；缺省会声明整个工作区导致全部串行/失败。
- **主线程被 write_paths 阻断**：fleet 运行期间主线程不能写同路径——用只读工具（ls/grep）检查进度。
- **max_steps 给足**：每篇读 tex + 核对数字 + 写 JSON，40 步左右。
- 完成后主线程统一渲染（保证渲染器版本一致）+ 统一登记（保证编号顺序一致）。

---

## 五、收尾产物

| 产物 | 位置 | 内容 |
|------|------|------|
| review.json × N | `16篇评审汇总-RE/<NN>-<论文>/` | 新版审计数据（evidenceChain）|
| HTML 报表 × N | 同上 `审计报表-<NN>-<论文>.html` | 评分卡 + 统计 + 根因证据链 |
| 跨篇汇总 | `16篇评审汇总-RE/00-总览-统计.md` | 77 条问题分布、tex/repo 状态、无 tex/无仓库标记 |
| 组会汇报 | 工作区根 `2026-08-13-组会-16篇重审汇报.md` | 一页纸结论 + 通病统计 + 精选深挖 + 可复现性分布 |
| RVE 登记 | `database/vulnerability.json` | 新编号追加，next 推进 |

---

## 六、常见坑

1. **编号冲突**：见第二节，主线程预分配 + 重编号脚本兜底。
2. **子代理编号与登记库不一致**（如 severity/category 标注偏差）：子代理在最终答复中**显式报告偏差**，主线程决定是否同步登记库——保证 review.json 与 vulnerability.json 两处一致。
3. **tex 解压失败**：先 tar -tvf 查双层结构，再判断是否下载截断（重下 + 断点续传）。
4. **Windows 路径**：子代理用绝对路径 + 正斜杠/反斜杠统一；heredoc 脚本避免复杂引号（写 .py 文件再执行）。
5. **bash 被 write_paths 阻断**：fleet 运行时主线程用只读工具观察，不用 bash 写同路径。
