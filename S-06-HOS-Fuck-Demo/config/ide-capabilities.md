# IDE Capabilities — 原生能力映射

> Skill 的运行环境（TRAE / Claude Code）本身提供大量能力。
> **Skill 只做 IDE 做不到的事**——模板、约束、编排、项目管理。
> IDE 已提供的，直接委派，绝不重复实现。

---

## 1. IDE 检测

Skill 启动时识别运行环境：

| 特征 | 判定为 |
|------|--------|
| Claude Code CLI 可用 | Claude Code |
| TRAE MCP 服务可访问 | TRAE |
| 以上均不可识别 | 通用 AI IDE 模式 |

识别结果影响委派策略：相同能力在不同 IDE 中可能有不同工具名。

---

## 2. 能力映射表

### ✅ IDE 原生提供 — Skill 只调用，不实现

| 能力 | Claude Code 工具 | TRAE 工具 | Skill 只要做 |
|------|-----------------|-----------|-------------|
| **文件读写** | Read / Write / Edit | 同左 | 提供**内容**，不关心 IO |
| **文件搜索** | Glob / Grep | 同左 | 提供**模式**，不实现搜索 |
| **目录操作** | Bash (mkdir / ls) | 同左 | 提供**路径结构** |
| **命令执行** | Bash | 同左 | 提供**命令**，不包装执行 |
| **Git 操作** | Bash (git) | 同左 | 提供**commit message + 结构** |
| **Web 搜索** | WebSearch / WebFetch | 同左 | 搜索由用户判断，不内置 |
| **文本推理** | AI 模型（内置） | 同左 | 提供**模板+约束**引导 |
| **json 操作** | AI 模型（内置） | 同左 | 提供**schema**，不写 parser |
| **子代理编排** | Agent / Workflow | 同左 | 复杂任务才用，默认不启动 |

### 📋 Skill 专属提供 — IDE 没有，Skill 补上

| 能力 | 文件 | 为什么 IDE 做不到 |
|------|------|-----------------|
| **自动流水线引擎** | `skill/auto-pipeline.md` | IDE 不会自动编排 STEP1→7 |
| **自动项目注册** | `management/auto-register.md` | IDE 不会管理项目状态机 |
| **内容槽位模板** | `skill/templates/content-pack.md` | IDE 不知道你的内容结构 |
| **PPT 12页结构（10分钟版）** | `skill/templates/ppt-6page.md` | IDE 不知道你的演示框架 |
| **音频稿短句化** | `skill/templates/audio-script.md` | IDE 不知道 TTS 节奏要求 |
| **视频合成规格** | `skill/templates/video-spec.md` | IDE 不知道你的转场/时长偏好 |
| **情绪注入矩阵** | `skill/injectors/emotion-engine.md` | IDE 不知道焦虑/希望的话术差异 |
| **风格预设** | `skill/injectors/style-presets.md` | IDE 不知道 academic/hype 的区别 |
| **项目状态机** | `management/PROJECT-MANAGER.md` | IDE 没有多项目管理概念 |
| **项目注册表** | `management/registry/project-registry.json` | 持久化状态，IDE 不会替你维护 |
| **新建项目流程** | `management/workflows/new-project.md` | IDE 不知道你的项目规范 |
| **内容审核标准** | `management/workflows/content-review.md` | IDE 不知道你的质量门禁 |
| **批量编排循环** | `skill/levels/L1-batch-content.md` | IDE 能 loop，但不知道 loop 什么 |
| **L1/L2/L3 深度定义** | `config/levels-config.md` | IDE 不知道你的三级输出契约 |
| **TTS 预设映射** | `config/tts-presets.md` | IDE 不知道 style→voice 对应 |
| **API 接口契约** | `config/api-gateway.md` | IDE 不知道你的工具链 |

---

## 3. 调用优先级规则

```
用户指令
  │
  ├─ IDE 有原生能力？──→ 直接调用 IDE 工具（如 Read / Bash / git）
  │     │
  │     └─ 需要模板约束？──→ 读取 Skill 模板 → IDE 工具写入
  │
  └─ IDE 没有原生能力？
        │
        └─ Skill 提供完整定义（模板/状态机/流程）→ AI 按 Skill 执行
```

### 具体规则

| 场景 | 行为 |
|------|------|
| 需要创建文件 | Skill 提供**内容**，IDE 的 Write 工具写入 |
| 需要运行 git | Skill 输出 commit message，IDE 的 Bash(git) 执行 |
| 需要批量循环 | Skill 提供**循环体**（每轮做什么），IDE 的 for 循环执行 |
| 需要安装依赖 | Skill 不写安装脚本，IDE 的 Bash(pip) 执行 |
| 需要搜索文件 | Skill 提供 Glob 模式，IDE 的 Glob 工具执行 |
| 生成内容 | Skill 提供**模板+槽位**，AI 模型填充 |
| 项目管理 | Skill 提供**状态机+注册表**，AI 按规则操作 |
| 情绪/风格控制 | Skill 提供**映射矩阵**，AI 按映射调整措辞 |

---

## 4. "Skill 薄层"原则

本 Skill 的每一层都应该问自己：

> 这个能力 IDE 已经有了吗？

- ✅ 有 → 只输出**内容/命令/结构**，调用 IDE 执行
- ❌ 没有 → 提供**完整的定义/模板/约束**，让 AI 按规则执行
- ⚠️ 部分有 → 提供**缺失的部分**，与 IDE 能力拼接

### 薄层检查清单

```
□ 文件操作 → 只提供内容，不自己实现 IO
□ 命令执行 → 只输出命令，不包装执行环境  
□ 内容生成 → 只提供模板+槽位，不由 AI 自由创作
□ 项目管理 → 只提供状态机+注册表，不由 AI 记忆
□ 批量循环 → 只提供循环体逻辑，不由 AI 手动重复
```
