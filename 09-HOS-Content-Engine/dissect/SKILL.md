---
name: Dissect
description: "D2 源码深读子技能 — 架构分析、设计决策解读、安全审计与技术对比"
version: "1.0.0"
author: "HOS Team"
tags:
  - source-code-analysis
  - architecture
  - design-decision
  - security-audit
  - comparison
category: "deep-analysis"
risk-level: low
confidence: 0.90
---

# D2 Dissect：源码深读子技能

> **一句话定位**：接收 D1 选题，深入源码级分析，输出架构图谱、设计决策文档与安全审计报告。
> 集成 00-HOS-Sec-Engine，实现分析即审计。

---

## 一、触发条件

| 触发场景 | 示例表达 |
|---------|---------|
| 读 XX 源码 | `读一下 Trivy 的源码`、`分析 Grype 架构` |
| 分析架构 | `分析这个项目的架构`、`拆解模块结构` |
| 理解设计决策 | `为什么这样设计`、`这个 trade-off 是什么` |
| 安全审计分析 | `审计这段代码`、`分析攻击面` |
| 技术对比 | `对比 Trivy 和 Grype`、`A vs B 哪个好` |

**不触发**：选题发现（→ D1 Discover）、代码修改/开发（→ D3 Develop）。

---

## 二、核心能力

### 2.1 架构分析

**四维分析模型**：

```yaml
architecture_analysis:
  module_decomposition:
    description: "模块拆解与职责划分"
    output:
      - module_list          # 模块清单 (名称、职责、代码行数)
      - module_hierarchy     # 模块层级关系
      - responsibility_map   # 职责矩阵
    tools:
      - cloc                 # 代码行数统计
      - dependency-cruiser   # JS/TS 依赖分析
      - pydeps               # Python 依赖分析
      - go-callvis           # Go 调用图

  dependency_graph:
    description: "依赖关系图谱"
    output:
      - internal_deps        # 内部模块依赖图 (Mermaid)
      - external_deps        # 外部依赖清单
      - dep_depth            # 依赖深度/环检测
      - supply_chain_risk    # 供应链风险评估
    tools:
      - pipdeptree           # Python 依赖树
      - npm ls               # Node.js 依赖树
      - go mod graph         # Go 依赖图
      - cargo tree           # Rust 依赖树

  data_flow:
    description: "数据流分析"
    output:
      - input_sources        # 输入源 (API/CLI/配置文件)
      - processing_pipeline  # 处理管线
      - output_sinks         # 输出汇 (报告/数据库/网络)
      - data_transformations # 数据变换节点
    method: "静态分析 + 动态追踪"

  deployment_topology:
    description: "部署拓扑分析"
    output:
      - component_map        # 组件部署图
      - network_interfaces   # 网络接口清单
      - storage_backends     # 存储后端
      - external_services    # 外部服务依赖
```

### 2.2 设计决策解读

**分析框架**：

```yaml
design_decision_analysis:
  why_this_design:
    - 问题背景与约束条件
    - 设计目标的优先级排序
    - 核心设计模式识别

  trade_offs:
    dimensions:
      - performance vs simplicity
      - security vs usability
      - flexibility vs complexity
      - consistency vs availability
    output: "每个 trade-off 的选择理由与代价"

  alternatives_considered:
    - 列出被否决的替代方案
    - 每个方案的优劣分析
    - 最终选择的理由
    - 在什么条件下替代方案可能更好
```

### 2.3 安全审计分析

**集成 00-HOS-Sec-Engine**：

```yaml
security_audit:
  integration:
    engine: "00-HOS-Sec-Engine"
    mode: "full-scan"
    output_format: "sarif + markdown"

  vulnerability_pattern_detection:
    patterns:
      - name: "注入类"
        subtypes: [SQL注入, 命令注入, XSS, 模板注入, LDAP注入]
      - name: "认证授权类"
        subtypes: [硬编码凭证, 权限绕过, Session固定, JWT缺陷]
      - name: "加密类"
        subtypes: [弱算法, ECB模式, 硬编码密钥, 不安全随机数]
      - name: "内存安全类"
        subtypes: [缓冲区溢出, UAF, 整数溢出, 格式化字符串]
      - name: "供应链类"
        subtypes: [已知漏洞依赖, Typosquatting, 恶意包]

  attack_surface_analysis:
    entry_points:          # 攻击入口
      - network_interfaces
      - cli_inputs
      - file_inputs
      - environment_variables
    trust_boundaries:      # 信任边界
      - user_to_system
      - external_to_internal
      - privileged_to_unprivileged
    data_flows_at_risk:    # 高风险数据流
      - user_input_to_sink
      - deserialization_points
      - crypto_operations
```

### 2.4 技术对比分析

**对比维度**：

```yaml
comparison_dimensions:
  functional:
    - 核心功能覆盖度
    - 插件/扩展生态
    - 支持的格式/协议
  technical:
    - 架构设计优劣
    - 性能基准测试
    - 代码质量 (复杂度、测试覆盖率)
  security:
    - 安全审计结果对比
    - 漏洞响应速度
    - 安全特性完备性
  community:
    - 社区活跃度 (Star/Fork/Contributor)
    - 文档完善度
    - 发版频率与稳定性
  operational:
    - 部署复杂度
    - 资源消耗
    - 运维友好度
```

**评分矩阵**：

```yaml
scoring_matrix:
  method: "加权评分"
  scale: 1-5
  weights:
    functional: 0.25
    technical: 0.25
    security: 0.25
    community: 0.15
    operational: 0.10
  output:
    - comparison_table      # 对比表格
    - radar_chart_data      # 雷达图数据 (Mermaid)
    - recommendation        # 推荐结论与理由
```

---

## 三、工作流程

```
接收 D1 选题
     │
     ▼
┌─────────────────┐
│ 1. 仓库克隆     │  git clone --depth=1
│    & 环境准备    │  安装依赖、构建索引
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. 静态分析     │  代码结构扫描、依赖分析、
│                 │  复杂度计算、模式匹配
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. 动态分析     │  运行测试、性能基准、
│                 │  数据流追踪、API 探索
└────────┬────────┘
         ▼
┌─────────────────┐
│ 4. 安全审计     │  调用 00-HOS-Sec-Engine
│                 │  漏洞模式检测、攻击面分析
└────────┬────────┘
         ▼
┌─────────────────┐
│ 5. 综合报告     │  架构图谱 + 设计决策 +
│   生成          │  安全审计 + 对比结论
└────────┬────────┘
         ▼
  输出到 output/dissect/{project-id}/
         │
         ▼
  传递给 D3 Develop (如需开发)
  或传递给 D4 Document (如需内容输出)
```

---

## 四、质量门禁

```yaml
quality_gates:
  architecture_diagram:
    description: "架构图完整性"
    condition: "所有核心模块在图中有表示"
    check: "module_coverage == 1.0"
  security_coverage:
    description: "安全分析覆盖率 >= 80%"
    condition: "analyzed_attack_surface / total_attack_surface >= 0.80"
  dependency_audit:
    description: "外部依赖全部经过审计"
    condition: "audited_deps == total_external_deps"
  design_rationale:
    description: "每个核心设计决策有文档化的理由"
    condition: "documented_decisions / core_decisions >= 0.90"
  comparison_fairness:
    description: "对比分析中每个方案使用相同评估标准"
    condition: "same_criteria_applied_to_all"
```

---

## 五、输出规范

```
output/dissect/{project-id}/
├── architecture/
│   ├── module-map.md          # 模块地图
│   ├── dependency-graph.md    # 依赖图谱 (含 Mermaid)
│   ├── data-flow.md           # 数据流分析
│   └── deployment.md          # 部署拓扑
├── design-decisions/
│   ├── decisions.md           # 设计决策文档
│   └── trade-offs.md          # Trade-off 分析
├── security-audit/
│   ├── audit-report.md        # 安全审计报告
│   ├── findings.yaml          # 发现列表 (结构化)
│   ├── attack-surface.md      # 攻击面分析
│   └── audit.sarif            # SARIF 格式结果
├── comparison/                # 仅对比分析时生成
│   ├── comparison-table.md    # 对比表格
│   ├── scoring-matrix.yaml    # 评分矩阵
│   └── recommendation.md      # 推荐结论
├── summary.md                 # 分析总结
└── metadata.json              # 元数据
```

---

## 六、依赖关系

| 依赖目标 | 依赖原因 | 调用方式 |
|----------|----------|----------|
| D1 Discover | 接收选题输入 | 内部传递 |
| D3 Develop | 分析结果传递给开发阶段 | 内部传递 |
| 00-HOS-Sec-Engine | 提供安全审计能力 | API/本地调用 |
