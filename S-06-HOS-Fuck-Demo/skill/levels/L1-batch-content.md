# L1 — Batch Content Generation Guide（10分钟标准版）

> **输出**: 内容包 + 10分钟音频稿
> **适用**: 批量课程、播客、音频专栏、有声内容
> **最佳 batch 规模**: 3~5

---

## 执行流程

### 入口

用户指令示例：
```
batch 方向=AI副业 副业方向 count=5 depth=L1 style=hype emotion=anxiety
```

### Step-by-Step

```
for i in range(count):
  1. 从方向中提取第 i 个可用钩子
     - 方向本身提供多个子方向时，轮询取子方向
     - 方向只有一个时，从 STEP1 的 3 个钩子中循环取
  
  2. 运行 STEP1~STEP3（core.flow.md，10分钟版）
     → 内容包（content-pack.md 填充，6观点+3层叙事弧）
  
  3. 运行 STEP5（core.flow.md，10分钟版）
     → 音频稿（audio-script.md 填充，4幕~2000字）
  
  4. 输出到 markdown 块
```

### 输出格式

```markdown
## Batch Report — {direction} × {count}

**批量元信息**
- 方向: {direction}
- 生成数: {count}
- 深度: L1 | 时长: 10分钟/条
- 风格: {style} | 情绪: {emotion}
- 生成时间: {timestamp}

---

### {i+1}. {title}

**内容包**
{content_pack}

**10分钟音频稿**
{audio_script}

---
```

---

## Token 预算

| 项目 | 预算 |
|------|------|
| 每个方向背景 | ≤ 50 tokens |
| 每个 STEP1 解析 | ≤ 200 tokens |
| 每个内容包（STEP2+3，6观点） | ≤ 1000 tokens |
| 每个10分钟音频稿（STEP5，4幕） | ≤ 2000 tokens |
| **每条内容总计** | **≤ 3500 tokens** |
| **batch × 5 总计** | **~17500 tokens** |

---

## 降级策略

如果 token 预算不足：
1. 优先保证**内容包**（核心产出，6个观点）
2. 其次生成**音频稿**（可省略，→ 纯文案——但不再建议，因10分钟音频稿是 L1 核心产出）

---

## 输出约束

- ❌ 不生成 PPT
- ❌ 不生成 video spec
- ❌ 不生成仓库结构
- ✔️ 所有内容包结构一致（同模板）
- ✔️ 每个音频稿独立可配音，固定 10 分钟
- ✔️ 6 个 key ideas 递进排列
