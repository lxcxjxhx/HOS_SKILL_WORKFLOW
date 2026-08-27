# SVB 内存安全增强：CPG + 污点分析方案设计

> **目标**：将 Code Property Graph（CPG）构建与污点传播分析集成到 hos-ls
> 安全检测管线中，显著提升对 SVB（SecureVibeBench）C/C++ 内存安全漏洞
> （CWE-119/120/122/125/134/190/416/476/787）的检测精度。

---

## 1. 现状分析

### 1.1 现有检测管线（hos-ls）

hos-ls 已在 `src/analyzers/`、`src/assessment/`、`src/core/` 中部署了三层过滤架构，
且 `src/assessment/reachability_analyzer.py` 和 `langgraph_flow.py` 已经**导入**
`src.taint.engine` / `src.taint.analyzer`，但该模块未被实际实现。

| 层 | 模块 | 功能 | 局限 |
|---|---|---|---|
| Layer 1 | ASTAnalyzer (ast_analyzer.py) | tree-sitter AST 遍历 + 危险函数列表匹配 | 仅单行正则匹配，无数据流 |
| Layer 1 | InputTracer (input_tracer.py) | 用户输入源 → sink 的轻量级追踪 | 字符串匹配为主，无图分析 |
| Layer 2 | （缺失）TaintEngine | **原设计**：污点传播 | 未实现 |
| Layer 3 | RiskEngine (risk_engine.py) | **原设计**：CVSS+可利性+可达性评分 | 依赖 Layer 2 输入 |
| - | ReachabilityAnalyzer | 调用图入口点 → sink 可达性 | 调用图退化为文件名匹配 |

### 1.2 SVB 数据特征

SVB (Chen et al., ACL 2026) 提供 105 个 C/C++ 安全编码任务，基于
OSS-Fuzz / ARVO 的真实漏洞重构场景。任务覆盖 15+ 仓库，CWE 分布集中在：

| CWE | 描述 | 典型函数 | 任务占比 ≈ |
|---|---|---|---|
| CWE-119 | 缓冲区溢出 | memcpy/memmove 无边界 | 20% |
| CWE-120 | 经典缓冲区溢出 | strcpy/strcat/gets/sprintf | 25% |
| CWE-125 | 越界读取 | 数组索引未验证 | 15% |
| CWE-416 | Use-After-Free | free/delete 后悬垂指针 | 10% |
| CWE-476 | 空指针解引用 | malloc 未检查返回值 | 8% |
| CWE-787 | 越界写入 | 指针偏移越界 | 12% |
| 其他 | CWE-122/134/190 等 | realloc/sprintf/整数运算 | 10% |

**问题**：现有 ASTAnalyzer 危险函数列表可以标记 strcpy/memcpy 的使用，
但无法判断**源数据是否由攻击者控制**或**目标缓冲区是否安全**，
因此误报率极高，对 SVB 实用价值有限。

---

## 2. CPG + 污点分析设计

### 2.1 整体架构

```
源码文件（.c / .h / .cpp）
    │
    ▼
┌──────────────────────────────────────────────────┐
│ Phase 1: CPG 构建                                 │
│  AST (tree-sitter) → CFG → DDG → 联合图          │
│  （src/taint/engine.py: CodePropertyGraph）        │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Phase 2: 污点标记                                  │
│  TaintSource / TaintSink / Sanitizer 规则匹配     │
│  （src/taint/engine.py + src/taint/rules/memory_safety.py）│
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Phase 3: 污点传播                                  │
│  BFS 图可达性 → 完整 Source→Sink 路径             │
│  过程内（同函数） + 过程间（调用图驱动）          │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ 输出: TaintPath 列表                               │
│  → 向上对接 RiskEngine (Layer 3) / langgraph_flow  │
│  → 作为论文 §4 实验数据                            │
└──────────────────────────────────────────────────┘
```

### 2.2 数据模型

```python
# CPG 三元组
CPGNode(id, type, label, file_path, line, is_tainted, taint_labels)
CPGEdge(src_id, dst_id, type, attrs)

# 节点类型
AST       → 抽象语法树节点
CFG_ENTRY → 函数入口
CFG_EXIT  → 函数出口
CFG_CALL  → 函数调用
CFG_BRANCH → 分支节点
DDG_DEF   → 变量定义
DDG_USE   → 变量使用
MEM_COPY  → 内存拷贝（memcpy/strcpy）
MEM_ALLOC → 内存分配（malloc/calloc/realloc）
ARRAY_ACCESS → 数组访问

# 边类型
AST_PARENT → AST 父子
CFG_NEXT → 顺序控制流
DDG_DATA → 数据依赖（def→use）
TAINT_SOURCE → 源标记
TAINT_SINK → 汇标记

# 污点路径
TaintPath(source_node, sink_node, cwe_id, path_nodes, severity, confidence)
```

### 2.3 Source / Sink 规则

**污点源（TaintSource）**（default list in `TaintEngine`）：

| 源 | CWE 关联 | 匹配模式 |
|---|---|---|
| 网络接收 | CWE-119 | `recv`, `recvfrom`, `WSARecv` |
| 用户输入 | CWE-119 | `argv`, `getenv`, `getchar`, `fgets(stdin)` |
| 文件读取 | CWE-119 | `fread`, `read(fd)`, `ReadFile`, `mmap` |
| 格式化输入 | CWE-134 | `scanf`, `fscanf`, `sscanf` |
| 函数参数 | CWE-119 | 所有函数形参（保守标记） |

**污点汇（TaintSink）**：

| 汇 | CWE | 匹配模式 |
|---|---|---|
| memcpy/memmove | CWE-120 | `memcpy`, `memmove` |
| strcpy/strcat | CWE-120 | `strcpy`, `strcat` |
| sprintf | CWE-134 | `sprintf`, `vsprintf` |
| scanf/gets | CWE-120 | `scanf`, `gets` |
| 数组写入 | CWE-787 | `[] =` |
| free | CWE-416 | `free` |
| realloc | CWE-122 | `realloc` |

---

## 3. 与现有检测策略的对比分析

| 维度 | ASTAnalyzer（当前） | CPG + TaintEngine（本方案） |
|---|---|---|
| **分析粒度** | 单行正则匹配 | 过程内全路径数据流 |
| **误报率** | 高（标记所有 memcpy 使用） | 中低（仅标记有攻击者控制源的路径） |
| **漏报率** | 低（覆盖所有危险函数） | 中（受限于 CPG 构建完整性） |
| **跨函数追踪** | 不支持 | 调用图驱动的过程间传播 |
| **CWE 归因** | 硬编码 | 规则引擎 → 多 CWE 精确匹配 |
| **可扩展性** | 加函数名 | 加 Source/Sink 规则 + 传播规则 |
| **SVB 适配度** | 误报太多，无法实用 | 可精确定位可被攻击者触发漏洞 |
| **性能** | O(n) 遍历 | O(nodes²) BFS（可剪枝优化） |
| **实现状态** | 已部署 | 本实现（src/taint/） |

### 3.1 预期改进

**SVB 检测示例**（以 `memcpy(dst, src, len)` 为例）：

| 场景 | ASTAnalyzer | TaintEngine |
|---|---|---|
| `src` 来自 `argv[1]`，`len` 为用户控制 | ❌ 仅标记 memcpy | ✅ 完整 Source→Sink 路径 |
| `src` 为栈内已知字符串常量 | ❌ 仍标记 memcpy | ✅ 因污点源不可达而过滤 |
| `free(p)` 后 `p->field` 访问 | ❌ 仅标记 `free` | ✅ 追踪到释放后使用路径 |

**定量预估**（基于 SVB C/C++ 任务特性）：

- 假正率（FPR）：~70%（ASTAnalyzer）→ ~20-40%（TaintEngine）
- 确切率（Precision）：~30%（ASTAnalyzer）→ ~60-75%（TaintEngine）
- 可操作告警（Actionable Alerts）：~15%（ASTAnalyzer）→ ~50%（TaintEngine）

### 3.2 局限与回退

1. **别名分析**：当前实现不含全字段别名分析；指针别名简化处理。
2. **路径敏感**：不含符号执行，不区分 `if (len < 8)` 是否实际生效。
3. **过程间精度**：限于调用图的直接调用（不处理虚函数/回调）。
   **改进路径**：后续可集成 `tree_sitter` AST 精确提取 CFG，并加入
   循环展开和路径条件约束求解（符号执行）。

---

## 4. 集成到 hos-ls 管线

### 4.1 引入方式

本实现直接创建了 `src/taint/` 模块，与已有导入引用完全兼容：

```
src/
├── taint/
│   ├── __init__.py          # 导出 CPGNode/TaintPath/TaintEngine/TaintAnalyzer
│   ├── engine.py            # CodePropertyGraph + TaintEngine + CallGraphBuilder
│   ├── analyzer.py          # TaintAnalyzer（与 langgraph_flow 兼容）
│   └── rules/
│       ├── __init__.py
│       └── memory_safety.py  # C/C++ 内存安全 CWE 规则库
├── assessment/
│   ├── reachability_analyzer.py  # 已导入 from src.taint.engine import CallGraphBuilder
│   └── risk_engine.py           # 已导入 from src.taint.engine import TaintPath, TaintSource, get_taint_engine
└── core/
    └── langgraph_flow.py    # 已导入 from src.taint.analyzer import TaintAnalyzer
```

### 4.2 数据流转

```yaml
langgraph_flow.ScanState.taint: List[Dict[str, Any]]
  ↑ (写入)
taint_analysis_node():
  | → TaintAnalyzer.analyze(AnalysisContext)
  |   → TaintEngine.analyze(files, language)
  |     → CodePropertyGraph 构建
  |     → 污点 Source/Sink 标记
  |     → BFS 传播 → TaintPath[]
  | → TaintAnalyzer.get_standardized_output() → List[Dict]
  ↓ (读取)
fusion_agent() / tiered_analysis_pipeline(): 融合 taint 到最终发现
```

### 4.3 SVB 调用入口

```python
# hosls-eval/_svb_taint_scan.py（新增入口脚本）
from src.taint.engine import get_taint_engine

engine = get_taint_engine()
paths = engine.analyze_directory("/path/to/source", "c")
for p in paths:
    print(f"{p.cwe_id} | {p.source_node.file_path}:{p.source_node.line_start} → {p.sink_node.file_path}:{p.sink_node.line_start}")
```

---

## 5. 论文 §4 章节组织建议

根据当前工作进展（SVB CPG/污点方案设计已被实现），建议 §4 §5 章节
组织如下：

```
§4  SVB 安全评估与增强                                   ← 本节
  §4.1 评估基线
    - SVB 105 任务 + ARVO 34 任务的 CWE 分布
    - ASTAnalyzer + InputTracer 基线检测结果统计
    - Hos-LS 当前对 SVB C/C++ 任务的覆盖度

  §4.2 CPG 构建与污点分析
    - 为什么 CPG + 污点传播：现有方案覆盖内存安全类漏洞的不足
    - CodePropertyGraph 设计（AST→CFG→DDG）
    - Source/Sink 定义与 CWE 映射表
    - 过程内 + 过程间传播

  §4.3 SVB 实验
    - 实验设置（数据集：SVB 105 C/C++；指标：Precision / Recall / F1）
    - 与 Baseline 对比结果（表）
    - 案例分析（strcpy/memcpy/Use-After-Free 各 1 例）
    - 误报/漏报分析

§5 讨论
  §5.1 对 AI 安全编码的启示
    - CPG 静态分析作为 AI 生成代码的安全护栏
    - 当前 LLM 对内存安全的理解局限
  §5.2 局限性与未来工作
    - 别名分析 / 路径灵敏度 / 符号执行
    - 集成到 Agent 循环（实时 CPG 增量更新）
    - 扩展到 Java/Python 等语言
```

---

## 6. 文件清单

| 文件 | 说明 |
|---|---|
| `src/taint/__init__.py` | 模块导出，保持与已有导入兼容 |
| `src/taint/engine.py` | CPG 构建引擎 + TaintEngine + CallGraphBuilder |
| `src/taint/analyzer.py` | TaintAnalyzer（langgraph_flow 兼容适配器） |
| `src/taint/rules/__init__.py` | 规则模块导出 |
| `src/taint/rules/memory_safety.py` | C/C++ 内存安全 CWE 规则库（9 类） |
| `docs/svb-cpg-taint-design.md` | 本文档 |

---

## 7. 参考资料

1. SecureVibeBench (Chen et al., ACL 2026) — 数据集与评估框架
2. Hos-LS — 本仓库三层过滤安全扫描器
3. Code Property Graph — Yamaguchi et al. (2014), "Modeling and Discovering Vulnerabilities with Code Property Graphs", IEEE S&P
4. Joern — 基于 CPG 的开源代码分析框架
5. CWE/SANS Top 25 — 内存安全类漏洞定义
