# L2 — PPT + Audio Generation Guide（10分钟标准版）

> **输出**: 内容包 + 12页PPT + 10分钟音频稿
> **适用**: 知识付费课件、培训材料、演讲 PPT、10分钟视频课程
> **最佳 batch 规模**: 1~3

---

## 执行流程

### 入口

```
create 方向=AI安全意识 education depth=L2 style=academic emotion=hope
```

### Step-by-Step

```
1. STEP1 → 方向 → 3 个钩子
2. STEP2 → 每个钩子 → title + 6 ideas + 3层叙事弧 + 情绪曲线
3. STEP3 → 填充 content-pack.md（10分钟版）→ 内容包
4. STEP4 → 填充 ppt-6page.md（12页版）→ PPT JSON 数据
5. STEP5 → 填充 audio-script.md（10分钟版）→ 4幕音频稿
```

### 核心差异（vs L1）

- 每个方向只生成 **1 套完整内容**（而非批量多个）
- 增加 STEP4（PPT 生成，12页）
- PPT 和音频稿共用同一套 key_ideas（6 个观点），**内容必须一致**
- 音频稿的 4 幕与 12 页 PPT 时间轴对齐

---

## PPT + Audio 对齐规则（10分钟/12页）

| PPT 页码 | 内容 | 音频幕 | 时长 |
|---------|------|--------|------|
| 1 标题 | title + subtitle | 幕1 开场 | 0:00~0:30 |
| 2 问题冲击 | problem_shock | 幕1 问题冲击 | 0:30~1:20 |
| 3 问题证据 | evidence | 幕1 证据 | 1:20~2:15 |
| 4 常见误区 | myth_1~3 | 幕2 误区 | 2:15~3:05 |
| 5 真相揭示 | truth_1~3 | 幕2 翻转 | 3:05~4:00 |
| 6 核心观点 1~2 | key_idea_1~2 | 幕2 观点 | 4:00~4:55 |
| 7 核心观点 3~4 | key_idea_3~4 | 幕2 观点 | 4:55~5:50 |
| 8 核心观点 5~6 | key_idea_5~6 | 幕2 观点 | 5:50~6:45 |
| 9 方法步骤 1~3 | method_step_1~3 | 幕3 方法 | 6:45~7:35 |
| 10 方法步骤 4~5 | method_step_4~5 | 幕3 进阶 | 7:35~8:20 |
| 11 案例/故事 | case_story | 幕3 案例 | 8:20~9:10 |
| 12 总结/金句 | takeaway + golden_sentence | 幕4 收尾 | 9:10~10:00 |

**对齐校验**: AI 必须检查 PPT 的内容与音频稿的对应段落在语义上一致，且时间轴对齐。

---

## Token 预算

| 项目 | 预算 |
|------|------|
| 方向解析 + 观点生成（STEP1+2） | ≤ 1000 tokens |
| 10分钟内容包填充（STEP3） | ≤ 800 tokens |
| PPT 12页数据（STEP4） | ≤ 1000 tokens |
| 10分钟音频稿（STEP5） | ≤ 2000 tokens |
| **总计** | **≤ 6000 tokens** |

---

## 输出结构

```markdown
## {title}

**元信息**
- 方向: {direction} | 深度: L2 | 风格: {style}
- 时长: 10分钟（600秒）
- 生成时间: {timestamp}

### 内容包
{content_pack}

### PPT 数据（12页）
```json
{ppt_json}
```

### 10分钟音频稿
{audio_script}
```

---

## 约束

- ❌ 不生成 video spec
- ❌ 不生成仓库结构
- ❌ 不跳过 STEP4
- ✔️ PPT 和音频必须内容+时间轴对齐
- ✔️ PPT 严格 12 页
- ✔️ 音频严格 10 分钟（4幕）
