# 📝 论文章节写作模板

> 各章节的详细写作指南与示例。每个模板包含结构说明、写作要点、常用句式和注意事项。

---

## 1. Abstract（摘要）模板

### 结构要求

**篇幅**：150-250 词（英文）/ 200-300 字（中文）

**五段式结构**：
1. **背景**（1 句）：研究领域的重要性
2. **问题**（1 句）：现有方法的不足或挑战
3. **方法**（1-2 句）：本文提出的解决方案
4. **结果**（1-2 句）：关键实验结果（必须包含具体数字）
5. **意义**（1 句）：研究的贡献和影响

### 英文示例

```
[Background] Large language models have demonstrated remarkable capabilities in various natural language processing tasks.
[Problem] However, existing approaches struggle with [specific challenge], leading to [negative consequence].
[Method] In this paper, we propose [Method Name], a novel approach that [key innovation]. Our method integrates [component 1] and [component 2] to address [specific issue].
[Results] Extensive experiments on [datasets/benchmarks] demonstrate that [Method Name] achieves [X]% improvement over state-of-the-art methods while reducing [metric] by [Y]%.
[Significance] These results suggest that [broader implication] and pave the way for [future direction].
```

### 中文示例

```
[背景] 大语言模型在各种自然语言处理任务中展现出了显著的能力。
[问题] 然而，现有方法在处理 [具体挑战] 时存在困难，导致 [负面后果]。
[方法] 本文提出了 [方法名称]，一种新颖的方法，其核心创新在于 [关键创新]。该方法集成了 [组件 1] 和 [组件 2]，以解决 [具体问题]。
[结果] 在 [数据集/基准测试] 上的大量实验表明，[方法名称] 相比最先进方法提升了 [X]%，同时将 [指标] 降低了 [Y]%。
[意义] 这些结果表明 [更广泛的影响]，并为 [未来方向] 铺平了道路。
```

### 注意事项

- ❌ 不要包含引用
- ❌ 不要使用缩写（首次出现需全称）
- ❌ 不要包含公式或图表引用
- ✅ 必须包含具体的量化结果
- ✅ 使用过去时描述已完成的工作
- ✅ 使用现在时描述普遍事实

---

## 2. Introduction（引言）模板

### 结构要求

**篇幅**：占总篇幅 15-20%

**漏斗结构**：从宽到窄，逐步聚焦

### 段落结构

#### 第 1 段：研究背景与重要性（2-3 段）

**目标**：建立研究领域的宏观背景

**结构**：
```
[广泛背景] [Research area] has become increasingly important in [application domain] due to [reason].
[具体应用] Recent advances in [technology/method] have enabled [capability], leading to [impact].
[当前状态] Today, [research area] plays a critical role in [specific applications], with [statistic/evidence].
```

**常用句式**：
- "In recent years, [topic] has attracted significant attention from both academia and industry."
- "The rapid development of [technology] has created unprecedented opportunities for [application]."
- "[Problem] is a fundamental challenge in [field], with implications for [broader impact]."

#### 第 2 段：问题定义与挑战

**目标**：明确定义要解决的具体问题

**结构**：
```
[问题定义] Despite these advances, a key challenge remains: [specific problem].
[问题影响] This problem is particularly difficult because [reason 1], [reason 2], and [reason 3].
[现有尝试] Previous works have attempted to address this issue by [approach], but these methods [limitation].
```

**常用句式**：
- "A central challenge in [field] is [problem], which refers to [definition]."
- "The difficulty of [problem] lies in [reason], making it hard to [desired outcome]."
- "Addressing this challenge requires [requirement], which existing approaches fail to provide."

#### 第 3 段：现有方法的不足

**目标**：分析现有方法的局限性，为本文方法提供动机

**结构**：
```
[方法分类] Existing approaches to [problem] can be broadly categorized into [category 1] and [category 2].
[方法 1 局限] [Category 1] methods [citation] typically [limitation 1], which leads to [consequence 1].
[方法 2 局限] [Category 2] methods [citation] often [limitation 2], resulting in [consequence 2].
[根本原因] These limitations stem from [root cause], highlighting the need for [requirement].
```

**常用句式**：
- "While [method] has shown promise in [scenario], it struggles with [limitation] when [condition]."
- "Although [approach] achieves [strength], it suffers from [weakness] due to [reason]."
- "A common limitation of existing methods is [limitation], which restricts their applicability to [scenario]."

#### 第 4 段：本文贡献

**目标**：清晰列出本文的核心贡献

**结构**：
```
[过渡句] To address these challenges, we propose [Method Name], a [adjective] approach that [key idea].
[贡献列表] Our main contributions are:
• [Contribution 1]: [specific contribution with measurable outcome]
• [Contribution 2]: [specific contribution with measurable outcome]
• [Contribution 3]: [specific contribution with measurable outcome]
[初步结果] Preliminary experiments on [dataset] demonstrate that [Method Name] achieves [X]% improvement over [baseline].
```

**常用句式**：
- "In this paper, we propose [Method Name], which [key innovation]."
- "Our approach differs from previous work in [key aspect], enabling [benefit]."
- "The main contributions of this work are threefold: (1) ..., (2) ..., and (3) ...."

#### 第 5 段：论文结构（可选）

**目标**：简述后续章节安排

**结构**：
```
The remainder of this paper is organized as follows: Section 2 reviews related work on [topic]. Section 3 presents our proposed method. Section 4 describes the experimental setup and results. Section 5 discusses the implications and limitations. Section 6 concludes the paper.
```

### 注意事项

- ✅ 第一段必须吸引读者兴趣
- ✅ 必须明确回答 "So what?" 问题
- ✅ 贡献列表必须具体、可量化
- ❌ 不要过度承诺（"solve"、"perfect"）
- ❌ 不要包含过多技术细节

---

## 3. Related Work（相关工作）模板

### 结构要求

**篇幅**：占总篇幅 10-15%

**组织方式**：按主题分类，而非按时间或按文献

### 段落结构

#### 开头段：分类概述

```
Research on [topic] can be broadly categorized into three directions: [category 1], [category 2], and [category 3]. In this section, we review the most relevant works in each category and discuss their connections to our approach.
```

#### 分类 1：[方向名称]

```
[方向概述] [Category 1] focuses on [aspect], with early works proposing [method] [citation].
[方法 1] [Author] et al. [citation] introduced [method], which [description]. However, this approach [limitation].
[方法 2] Building on this, [Author] et al. [citation] proposed [method] to address [issue]. While effective in [scenario], it still [limitation].
[小结] These methods typically [common characteristic], which differs from our approach in [key difference].
```

#### 分类 2：[方向名称]

```
[方向概述] [Category 2] takes a different perspective by [approach].
[方法 1] [Author] et al. [citation] proposed [method], which [description]. The key advantage is [strength], but the limitation is [weakness].
[方法 2] More recently, [Author] et al. [citation] introduced [method] that [description]. Although this method achieves [strength], it requires [requirement], making it less suitable for [scenario].
[小结] Our work complements these approaches by [how your work is different].
```

#### 分类 3：[方向名称]

```
[方向概述] [Category 3] is most closely related to our work, as it also aims to [goal].
[方法 1] [Author] et al. [citation] proposed [method], which shares similarities with our approach in [aspect]. However, their method [difference/limitation].
[方法 2] In contrast, our approach [key difference], enabling [benefit].
[小结] The key distinction is [fundamental difference].
```

#### 结尾段：本文定位

```
In summary, while existing works have made significant progress in [aspect], they typically [common limitation]. Our approach differs from previous work in [key aspect], enabling [benefit]. Specifically, [specific difference 1], [specific difference 2], and [specific difference 3].
```

### 注意事项

- ✅ 按主题分类，而非按时间顺序
- ✅ 每个分类必须有小结，指出与本文的关系
- ✅ 必须诚实指出相关工作的优缺点
- ❌ 不要只是罗列文献（"A did X. B did Y. C did Z."）
- ❌ 不要贬低相关工作

---

## 4. Methods（方法）模板

### 结构要求

**篇幅**：占总篇幅 25-35%

**目标**：让读者能够复现你的工作

### 段落结构

#### 4.1 方法概述

```
In this section, we present [Method Name], a [adjective] approach for [task]. Figure 1 illustrates the overall architecture of our method. Given [input], our goal is to produce [output]. To achieve this, [Method Name] consists of three main components: (1) [component 1], which [function]; (2) [component 2], which [function]; and (3) [component 3], which [function]. In the following subsections, we describe each component in detail.
```

#### 4.2 问题定义与符号

```
Let [symbol] denote [definition]. The problem we aim to solve can be formally defined as follows:

Definition 1 ([Problem Name]). Given [input], the goal is to find [output] such that [constraint].

Throughout this paper, we use [notation] to represent [meaning]. Table 1 summarizes the main notations used in this paper.
```

#### 4.3 组件描述

每个组件按以下结构描述：

```
[组件名称]

The first component of [Method Name] is [component name], which aims to [purpose].

[输入] Given [input from previous component], we first [operation].

[处理] Specifically, we apply [method/technique] to [action]. The key idea is to [intuition], which is motivated by [reason]. Formally, we compute:

[公式]
y = f(x; θ) = ...

where [explain each variable].

[输出] The output of this component is [output], which serves as the input to the next component.

[设计理由] This design choice is motivated by [reason], which allows [benefit].
```

#### 4.4 算法流程（可选）

```
Algorithm 1 summarizes the complete procedure of [Method Name]. The algorithm takes [input] as input and returns [output]. In each iteration, it first [step 1], then [step 2], and finally [step 3]. The time complexity of Algorithm 1 is O(...), and the space complexity is O(...).
```

#### 4.5 训练目标（如适用）

```
We train our model end-to-end using [loss function]. The overall objective is:

L = L_1 + λ L_2

where L_1 is [description], L_2 is [description], and λ is a hyperparameter controlling the trade-off between the two terms.

[损失 1] L_1 is defined as [formula], which encourages [behavior].

[损失 2] L_2 is defined as [formula], which regularizes [aspect].
```

### 注意事项

- ✅ 必须有整体架构图（Figure 1）
- ✅ 必须统一定义所有数学符号
- ✅ 必须描述足够的细节以支持复现
- ✅ 每个组件必须说明设计理由
- ❌ 不要假设读者知道你的符号
- ❌ 不要跳过关键的实现细节

---

## 5. Results（实验结果）模板

### 结构要求

**篇幅**：占总篇幅 20-30%

**目标**：用数据证明方法的有效性

### 段落结构

#### 5.1 实验设置

##### 5.1.1 数据集

```
We evaluate [Method Name] on [number] datasets: [dataset 1] [citation], [dataset 2] [citation], and [dataset 3] [citation]. Table 1 summarizes the statistics of these datasets. [Dataset 1] is a [description] dataset containing [number] samples. [Dataset 2] is a [description] dataset with [number] samples. [Dataset 3] is a [description] dataset collected from [source].
```

##### 5.1.2 基线方法

```
We compare [Method Name] with [number] baseline methods:
• [Baseline 1] [citation]: [brief description]
• [Baseline 2] [citation]: [brief description]
• [Baseline 3] [citation]: [brief description]

We select these baselines because [reason]. For each baseline, we use the official implementation provided by the authors and tune the hyperparameters on the validation set.
```

##### 5.1.3 评估指标

```
We use the following metrics to evaluate performance:
• [Metric 1]: [definition and why it matters]
• [Metric 2]: [definition and why it matters]
• [Metric 3]: [definition and why it matters]

Higher values of [metric] indicate better performance, while lower values of [metric] are preferred.
```

##### 5.1.4 实现细节

```
We implement [Method Name] using [framework] and train it on [hardware]. The model is optimized using [optimizer] with a learning rate of [value] and batch size of [value]. We set [hyperparameter 1] = [value], [hyperparameter 2] = [value], and [hyperparameter 3] = [value]. The training converges in approximately [number] epochs. All experiments are conducted on [hardware] with [GPU/CPU].
```

#### 5.2 主要结果

```
Table 2 presents the main results comparing [Method Name] with baseline methods on [datasets]. From the table, we observe that:

[观察 1] First, [Method Name] consistently outperforms all baselines across all datasets, achieving [X]% improvement on [metric 1] and [Y]% improvement on [metric 2] compared to the best baseline.

[观察 2] Second, compared to [specific baseline], our method shows particularly significant improvement on [dataset/scenario], which can be attributed to [reason].

[观察 3] Third, while [baseline] performs well on [scenario], it degrades on [scenario], whereas our method maintains robust performance across all scenarios.

These results demonstrate that [Method Name] effectively addresses [problem] and achieves state-of-the-art performance.
```

#### 5.3 消融实验

```
To understand the contribution of each component, we conduct ablation studies by removing [component 1], [component 2], and [component 3] respectively. Table 3 shows the results.

[观察 1] Removing [component 1] leads to [X]% drop in [metric], confirming its importance for [function].

[观察 2] Removing [component 2] results in [Y]% degradation, demonstrating its role in [function].

[观察 3] Removing [component 3] causes [Z]% decrease, validating its contribution to [function].

[完整模型] The full model outperforms all variants, confirming that all components are necessary and complementary.
```

#### 5.4 参数敏感性分析（可选）

```
We study the impact of hyperparameters [param 1] and [param 2] on model performance. Figure 2 shows the results.

[param 1] As [param 1] increases from [value] to [value], performance first improves and then degrades, with the optimal value at [value]. This is because [reason].

[param 2] Similarly, [param 2] controls [aspect], and we observe that [observation]. The best performance is achieved when [param 2] = [value].

Based on these results, we set [param 1] = [value] and [param 2] = [value] for all subsequent experiments.
```

#### 5.5 案例分析（可选）

```
Figure 3 visualizes some example outputs from [Method Name] and baseline methods. From the figure, we observe that:

[案例 1] In the first example, [baseline] fails to [task] because [reason], while our method successfully [task] by [mechanism].

[案例 2] In the second example, both methods perform correctly, but our method produces [better output] with [quality].

These cases demonstrate that [Method Name] not only achieves better quantitative metrics but also produces more [qualitative improvement].
```

### 注意事项

- ✅ 所有声明必须有数据支撑
- ✅ 必须包含置信区间或标准差（如适用）
- ✅ 必须说明统计显著性检验
- ✅ 必须分析失败案例（如适用）
- ❌ 不要在 Results 中解读 "为什么"（留给 Discussion）
- ❌ 不要只展示成功的案例

---

## 6. Discussion（讨论）模板

### 结构要求

**篇幅**：占总篇幅 10-15%

**目标**：解读结果含义，诚实分析局限

### 段落结构

#### 6.1 结果解读

```
Our experimental results demonstrate that [Method Name] achieves significant improvements over existing methods. In this section, we discuss the implications of these findings and analyze the reasons behind the performance gains.

[观察 1] The superior performance of [Method Name] can be attributed to [reason]. Specifically, [component] enables [capability], which is particularly effective for [scenario]. This is consistent with our hypothesis that [hypothesis].

[观察 2] The ablation study reveals that all components contribute to the final performance, with [component] having the largest impact. This suggests that [insight].

[观察 3] Interestingly, we observe that [observation], which was not anticipated in our initial design. A possible explanation is [hypothesis], which warrants further investigation.
```

#### 6.2 与 Related Work 的对比

```
Compared to [related method] [citation], our approach differs in [key aspect]. While their method relies on [their approach], we instead use [our approach]. This design choice allows our method to [advantage], as evidenced by the [X]% improvement in [metric].

Unlike [related method] [citation], which requires [requirement], our method can [capability] without [requirement]. This makes our approach more suitable for [scenario].

However, we acknowledge that [related method] excels in [scenario], where our method shows [limitation]. This suggests that the two approaches may be complementary, and combining them could be a promising direction for future work.
```

#### 6.3 局限性分析

```
Despite the promising results, our method has several limitations that should be acknowledged.

[局限 1] First, [limitation]. This limitation arises from [reason], and it affects [scenario]. A potential solution is [direction], which we leave for future work.

[局限 2] Second, [limitation]. While our method performs well on [scenario], it may not generalize to [scenario] because [reason]. Future work could address this by [direction].

[局限 3] Third, [limitation]. The computational cost of [component] is [cost], which may limit its applicability in [scenario]. Optimizing this aspect is an important direction for future research.
```

#### 6.4 威胁有效性（可选）

```
We identify several threats to the validity of our conclusions:

[内部有效性] Threats to internal validity: [factor] may affect the results. To mitigate this, we [action].

[外部有效性] Threats to external validity: Our experiments are conducted on [datasets], which may not represent [broader population]. Future work should evaluate our method on [other scenarios].

[构建有效性] Threats to construct validity: We use [metrics] to evaluate [aspect]. While these metrics are widely used, they may not capture all aspects of [quality].
```

### 注意事项

- ✅ 必须诚实讨论局限性
- ✅ 必须解释 "为什么" 方法有效
- ✅ 必须与相关工作深入对比
- ✅ 必须提出未来改进方向
- ❌ 不要回避负面结果
- ❌ 不要过度泛化结论

---

## 7. Conclusion（结论）模板

### 结构要求

**篇幅**：占总篇幅 5-10%

**目标**：总结全文，呼应 Introduction

### 段落结构

```
[总结] In this paper, we proposed [Method Name], a [adjective] approach for [task]. Our method introduces [key innovation 1], [key innovation 2], and [key innovation 3] to address [problem].

[主要发现] Extensive experiments on [datasets] demonstrate that [Method Name] achieves [X]% improvement over state-of-the-art methods. Ablation studies confirm the effectiveness of each component, and case studies provide qualitative insights into the model's behavior.

[意义] These results suggest that [broader implication] and pave the way for [future direction].

[未来工作] For future work, we plan to explore [direction 1], [direction 2], and [direction 3]. We also hope that our work can inspire further research in [broader area].
```

### 注意事项

- ✅ 必须呼应 Introduction 中提出的问题
- ✅ 必须重申核心贡献（但不要复制粘贴）
- ✅ 必须提出具体的未来工作方向
- ❌ 不要引入新的信息
- ❌ 不要过度夸大贡献

---

## 通用写作建议

### 声音规则

- ✅ 使用主动语态："We propose..." 而非 "It is proposed..."
- ✅ 使用第一人称复数："We" 而非 "I" 或 "The authors"
- ✅ 避免模糊量词："very", "quite", "rather", "basically"
- ✅ 每句话只表达一个观点
- ✅ 段落首句 = 段落主题句

### 编辑原则

- ✅ 删除不增加信息量的文字
- ✅ 具体优于抽象："improves accuracy by 15%" 而非 "significantly improves"
- ✅ 短句优于长句（目标：每句 ≤ 25 词）
- ✅ 一个段落一个核心论点

### 中文论文特殊注意

- ✅ 专业术语首次出现时标注英文："卷积神经网络（Convolutional Neural Network, CNN）"
- ✅ 摘要通常需要中英双语版本
- ✅ 遵循中文标点符号规范
- ✅ 避免过度口语化表达
