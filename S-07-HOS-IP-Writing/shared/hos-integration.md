# HOS 生态集成点

> 定义 HOS-IP-Writing 与 HOS_SKILL_WORKFLOW 其他模块的集成方式。

---

## 集成总览

```
HOS-IP-Writing ←→ HOS-Sec-Engine      (代码安全审查)
HOS-IP-Writing ←→ HOS-Fuck-Demo       (内容包素材)
HOS-IP-Writing ←→ HOS-Silly-Mock      (假数据检测)
HOS-IP-Writing ←→ HOS-Vibe-Guard      (代码质量守护)
HOS-IP-Writing ←→ hos-skills (运营)   (多平台分发)
```

---

## 各模块集成详情

### HOS-Sec-Engine（安全测试引擎）

| 集成点 | 触发条件 | 集成方式 |
|--------|---------|---------|
| 代码示例安全审查 | paper/copyright 输出中包含代码片段 > 20 行 | 调用 Sec-Engine 扫描代码中的安全漏洞、硬编码密钥、不安全依赖 |
| 依赖漏洞检查 | copyright 分析项目依赖时 | 调用 Sec-Engine 检查已知 CVE |

### HOS-Fuck-Demo（内容工业流水线）

| 集成点 | 触发条件 | 集成方式 |
|--------|---------|---------|
| 内容包 → blog 素材 | 用户使用 Fuck-Demo 产出内容包后 | Fuck-Demo 的内容包作为 blog 子技能的输入素材，自动转换为博文草稿 |
| Demo 脚本 → 博客教程 | 用户生成 Demo 视频脚本后 | 将脚本转化为图文教程格式 |

### HOS-Silly-Mock（反假数据检测）

| 集成点 | 触发条件 | 集成方式 |
|--------|---------|---------|
| 代码真实性验证 | review 润色包含代码示例的文本时 | 调用 Silly-Mock 检测代码是否为 Mock/伪代码 |
| 数据真实性验证 | paper 撰写 Results 部分时 | 检测实验数据是否为用户真实提供 |

### HOS-Vibe-Guard（防 Vibe Coding 护栏）

| 集成点 | 触发条件 | 集成方式 |
|--------|---------|---------|
| 代码示例质量守护 | book/blog 生成代码示例时 | 检测代码是否属于"Vibe Coding"（表面可运行但无实质逻辑） |
| 技术深度检查 | patent 撰写具体实施方式时 | 确保技术方案描述有足够技术深度 |

### hos-skills（运营技能集）

| 集成点 | 触发条件 | 集成方式 |
|--------|---------|---------|
| 多平台内容分发 | blog 文章完成后 | 通过 hos-content-adapt 将博文适配到 CSDN/掘金/知乎/Medium/Dev.to |
| 周报素材 | 任一子技能完成产出后 | 通过 hos-weekly-update 将产出纳入周报 |
| 品牌一致性 | 所有输出 | 通过 hos-brand-guard 检查 HOS 品牌命名规范 |
