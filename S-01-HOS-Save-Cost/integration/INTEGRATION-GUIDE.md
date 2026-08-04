# 四层集成完整指南（INTEGRATION-GUIDE）

> HOS-Save-Cost 与工具链的分工：**工作流层管上下文，工具层管压缩，互不重叠。**

## 一、本质：工作流层面降本

HOS-Save-Cost 的核心不是"压缩工具"，而是 **"任务拆分 + 交接文档 + 监控反馈"** 的工作流机制——一个轻量级的 **Token 管家**。

| 步骤 | 动作 | 具体内容 |
|------|------|----------|
| 1. 需求识别 | 识别成本敏感场景 | 大任务、长上下文、重复性高、探索性任务 |
| 2. 任务拆分 | 大任务 → 多个独立小任务 | 每个子任务**独立上下文**，避免上下文爆炸 |
| 3. Token 压缩 | 输入压缩 + 输出精简 | 去除冗余、极简 diff、精简上下文 |
| 4. 任务交接 | 交接文档传递状态 | 子任务完成 → 输出交接文档 → 下一子任务加载 → 不重复加载历史 |
| 5. 监控反馈 | 监控 Token 消耗 | 超阈值时提醒用户切换模型或开启缓存 |

## 二、与工具链的四层互补

| 层级 | 工具/Skill | 作用 |
|------|-----------|------|
| **MCP 压缩层** | `mcp-compressor` / `4q-tokenz` | 压缩 40+ 个 MCP 工具定义到 2 个入口 |
| **输出精简层** | `caveman` Skill | 让 AI 回复极简，只保留核心内容 |
| **输入压缩层** | `RTK` / `CodeGraph` | 压缩终端输出和代码探索消耗 |
| **工作流管理层** | **HOS-Save-Cost** | 大任务拆小 + 交接文档 + 监控反馈 |

**四层互补，不重叠。**

## 三、整合方案

### 3.1 reasonix.toml（MCP 层面）

见 [`reasonix.toml`](./reasonix.toml)。核心：所有 MCP 通过 `mcp-compressor` 代理，只暴露 2 个工具。

### 3.2 Skill 体系（三层）

| Skill | 功能 | 触发方式 |
|-------|------|----------|
| **caveman** | AI 输出精简（穴居人模式） | 会话中输入 `/caveman` |
| **HOS-Save-Cost** | 任务拆分 + 上下文管理 + Token 监控 | 会话中输入 `/hos` |
| **skill-handler** | 按需加载/卸载 Skill，避免无关 Skill 的 description 占用上下文 | 会话中输入 `/skill` |

### 3.3 skill-handler：管理 Skill 本身，避免 Skill 也吃掉 Token

- 启动时只加载 **skill-handler** 这一个 Skill（~50 tokens）
- 需要用某个功能时，通过 `/skill load <name>` 动态加载
- 用完后通过 `/skill unload <name>` 卸载，释放上下文
- 使用 `/skill list` 查看已安装的 Skill（不加载 description）

**所有 Skill 的 description 不再常驻上下文，只有 skill-handler 这一个入口常驻。**

## 四、完整使用流程

### 日常会话工作流

```text
1. 启动 Reasonix：npx reasonix code

2. 【常驻】只有 skill-handler 在上下文中
   - 约 50 tokens，可忽略

3. 需要省钱的复杂任务时：
   → /skill load hos         # 加载 HOS-Save-Cost
   → /hos                     # 激活省钱模式
   → 描述你的任务             # HOS 自动拆分为子任务
   → 每个子任务独立执行       # 每步输出交接文档
   → 完成后 /skill unload hos # 卸载，释放上下文

4. 需要精简 AI 回复时：
   → /skill load caveman      # 加载穴居人模式
   → /caveman                 # 激活
   → 继续对话                 # 所有回复自动精简
   → /skill unload caveman    # 用完卸载

5. 需要代码图谱时：
   → skill-handler 不介入 MCP 层面
   → MCP 工具已被 mcp-compressor 压缩成 2 个入口
   → AI 按需调用 get_tool_schema + invoke_tool
```

### 成本对比

| 场景 | 无优化 | 有优化 |
|------|--------|--------|
| 40 个 MCP 工具 schema | ~20,000 tokens | ~500 tokens（mcp-compressor） |
| 5 个 Skill description | ~5,000 tokens | ~50 tokens（skill-handler） |
| 大任务单次上下文 | ~100,000 tokens | ~15,000 tokens（HOS 拆分） |
| AI 回复 | ~5,000 tokens/次 | ~1,250 tokens/次（caveman） |
| 终端输出 | ~10,000 tokens | ~2,000 tokens（RTK） |

**综合估算：原来 4 天 60 元 → 压至 0.2-0.5 元。**

## 五、一句话总结

**四层优化，各司其职，互不重叠：**

1. **MCP 压缩**（`mcp-compressor`）→ 工具定义省 95%
2. **Skill 管理**（`skill-handler`）→ Skill 描述省 90%
3. **工作流拆分**（`HOS-Save-Cost`）→ 上下文省 80%
4. **输入/输出压缩**（`RTK` + `caveman`）→ 内容省 75%

四层叠加，4 天 60 元 → **不到 1 元**。
