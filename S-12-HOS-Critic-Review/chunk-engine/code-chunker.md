# Code Chunker · 代码切片规则（M3 落地）

> 适用对象：`repo`。
> 状态：**占位规格**。M1/M2 对 `repo` 对象按 [text-chunker.md](text-chunker.md) 兜底；M3 落地 Tree-sitter 后启用本规则。

## 1. 目标

代码不是按文件切，而是按**理解单元**切：函数 / 类 / 模块（语法实体），保留继承链与源码定位。

## 2. 首选方案（M3）

Tree-sitter（AST 级解析）：

| 实体 | 单元 kind | AST 节点 |
|------|-----------|----------|
| 顶层函数 | `code-function` | function_definition / function_declaration / method_definition |
| 顶层类 | `code-class` | class_definition / class_declaration |
| 文件头 | `code-module` | imports、常量、配置 |
| 长函数内部 | `code-block` | 超 4K tokens 时按块切 |

规则：遍历顶层节点 → 实体单元；超限实体递归下沉到子节点；每单元带 `source_range(file, start_line, end_line)` 与 `parent_id`（方法→类→文件）。

## 3. 降级链（无 Tree-sitter）

```
Tree-sitter → 语言启发式（2+ 空行分段；def/function/class 行作边界；超限按括号深度折半）→ 整文件成单元
```

## 4. 超大仓库（>200K tokens）

抽样：README/LICENSE/CI（必选）→ 核心包（按被引用次数）→ 其余随机；被跳过文件在报告标注 `sampled_out`。

## 5. 质量门槛

- 单元并集覆盖纳入范围 ≥ 95%；全部单元可定位；不重叠；超限再切。
