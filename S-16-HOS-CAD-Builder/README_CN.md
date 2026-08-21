# S-16-HOS-CAD-Builder

MCP 智能体技能：AI 驱动的 CAD 模型生成、修改、验证与导出。

[![AGPL-3.0 许可证](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](../LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue.svg)](https://python.org)
[![build123d](https://img.shields.io/badge/build123d-%3E%3D0.6.0-orange.svg)](https://build123d.readthedocs.io)

## 🎯 设计理念

HOS-CAD-Builder 是一个 **MCP（模型上下文协议）智能体技能**，使 AI 智能体能够通过自然语言描述来创建、修改、验证和导出 3D CAD 模型。

用户无需学习复杂的 CAD 软件，只需用自然语言描述想要的模型，技能就会通过多阶段流水线生成可用于生产的 CAD 文件。

### 核心原则

| 原则 | 说明 |
|------|------|
| **自然语言优先** | 用文本描述模型，获取 3D CAD 文件 |
| **流水线架构** | 规格规划 → 几何设计 → 代码生成 → 执行 |
| **多格式导出** | STEP、STL、3MF、GLB、DXF — 一个提示，多种输出 |
| **制造感知** | 针对 3D 打印、CNC、注塑的验证检查 |
| **MCP 原生** | 兼容所有 MCP 兼容的 AI 智能体或 IDE |

## ✨ 功能

| 工具 | 说明 |
|------|------|
| `cad_generate` | 从自然语言生成 3D 模型 |
| `cad_modify` | 增量修改现有模型 |
| `cad_export` | 导出为 STEP/STL/3MF/GLB/DXF |
| `cad_validate` | 检查可打印性和壁厚 |
| `cad_parts_find` | 搜索标准件库 |
| `cad_robot_urdf` | 生成 URDF/SRDF 机器人描述 |

## 🏗️ 架构

```
用户提示
    │
    ▼
┌─────────────────────────────────────┐
│  1. 规格规划器（NL → CADBrief）     │  自然语言解析、
│     - 形状分类                       │  尺寸提取、
│     - 特征提取                       │  特征检测
│     - 材料检测                       │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  2. 几何架构师（Brief → Ops）       │  几何操作规划、
│     - 基础形状映射                   │  特征-操作映射、
│     - 特征操作                       │  装配体支持
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  3. 代码生成器（Ops → Python）      │  build123d 代码生成、
│     - 模板代码发射                   │  导出包装器注入、
│     - 导出格式处理                   │  测量钩子
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  4. Python 桥接（执行）             │  子进程管理、
│     - build123d 执行                 │  输出解析、
│     - 文件导出                       │  错误处理
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  5. 验证层                          │  壁厚检查、
│     - 壁厚验证                       │  可打印性分析、
│     - 可打印性检查                   │  制造约束
└──────────────────────┬──────────────┘
                       │
                       ▼
                   结果 + 文件
```

## 🚀 安装

### 前置条件

- **Node.js** ≥ 18.0.0
- **Python** ≥ 3.10
- **build123d** ≥ 0.6.0

### 设置

```bash
# 克隆或安装
npm install

# 编译 TypeScript
npm run build

# 安装 Python 依赖
pip install -r python/requirements.txt
```

### MCP 配置（Claude Desktop）

添加到你的 MCP 配置（如 `claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "cad-builder": {
      "command": "node",
      "args": ["/path/to/HOS-CAD-BUILDER/dist/index.js"],
      "env": {
        "CAD_BUILDER_PYTHON": "python",
        "CAD_BUILDER_OUTPUT_DIR": "/tmp/cad-output"
      }
    }
  }
}
```

### MCP 配置（Cursor / 其他 IDE）

```json
{
  "mcp": {
    "servers": {
      "cad-builder": {
        "command": "node",
        "args": ["dist/index.js"],
        "cwd": "/path/to/HOS-CAD-BUILDER"
      }
    }
  }
}
```

## 📖 使用

### 生成 CAD 模型

向你的 AI 智能体提问：

> "创建一个 100x50x30mm 的长方体，中心有一个 10mm 的通孔，所有边缘倒圆角 R2"

技能将：
1. 将描述解析为结构化 CAD 规格
2. 规划几何操作（长方体 → 通孔 → 倒角）
3. 生成 build123d Python 代码
4. 执行代码并导出为 STEP
5. 返回文件路径 + 体积/面积测量值

### 修改现有模型

> "在顶面添加一个 5mm 宽、3mm 深的槽"

### 搜索标准件

> "帮我找一个 M3 螺栓和一个 608 轴承"

### 制造验证

> "检查这个模型是否适合 PLA 打印"（提供模型的 Python 代码）

### 生成机器人 URDF

> "创建一个简单的 5 自由度机械臂 URDF"

## 📁 项目结构

```
S-16-HOS-CAD-Builder/
├── src/
│   ├── index.ts                    # MCP 服务器入口
│   ├── types.ts                    # 核心类型定义
│   ├── mcp/
│   │   ├── server.ts               # MCP 服务器设置
│   │   └── tools/
│   │       ├── index.ts            # 工具注册表
│   │       ├── generate.ts         # cad_generate 工具
│   │       ├── modify.ts           # cad_modify 工具
│   │       ├── export.ts           # cad_export 工具
│   │       ├── validate.ts         # cad_validate 工具
│   │       ├── parts.ts            # cad_parts_find 工具
│   │       └── robot.ts            # cad_robot_urdf 工具
│   ├── planners/
│   │   ├── spec-planner.ts         # NL → CADBrief
│   │   ├── geo-architect.ts        # CADBrief → 操作序列
│   │   └── code-generator.ts       # 操作序列 → Python
│   ├── execution/
│   │   ├── python-bridge.ts        # Node ↔ Python IPC
│   │   └── cad-engine.ts           # 流水线编排器
│   ├── validation/
│   │   ├── thickness.ts            # 壁厚验证器
│   │   └── printability.ts         # 可打印性验证器
│   └── utils/
│       ├── config.ts               # 配置管理
│       ├── logging.ts              # 结构化日志
│       └── temp-files.ts           # 临时文件管理
├── python/
│   ├── cad_engine.py               # Python 执行引擎
│   └── requirements.txt            # Python 依赖
├── bin/
│   └── cli.js                      # CLI 入口
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 支持的形状和特征

### 基础形状
- 长方体 (Box)
- 圆柱体 (Cylinder)
- 球体 (Sphere)
- 圆锥体 (Cone)
- 拉伸体 (Extrusion)
- 旋转体 (Revolution)
- 放样 (Loft)
- 扫掠 (Sweep)

### 特征
- 钻孔 (Holes) — 可配置直径和深度
- 倒圆角 (Fillets) — 可配置半径
- 倒角 (Chamfers) — 可配置距离
- 槽 (Slots) — 可配置宽度
- 抽壳 (Shells) — 可配置壁厚
- 阵列 (Patterns) — 圆形和线性
- 镜像 (Mirrors) — 可配置轴

### 导出格式
- **STEP** — 通用 CAD 交换格式
- **STL** — 3D 打印标准格式
- **3MF** — 现代 3D 打印格式（含材料）
- **GLB** — WebGL/Three.js 查看器格式
- **DXF** — 2D 图纸交换格式

## 🤖 标准件库

| ID | 名称 | 类别 |
|----|------|------|
| `spc-m3-bolt` | M3 六角螺栓 | 紧固件 |
| `spc-m3-nut` | M3 六角螺母 | 紧固件 |
| `spc-m3-washer` | M3 平垫圈 | 紧固件 |
| `spc-bearing-608` | 608 滑板轴承 | 轴承 |
| `spc-shaft-d8` | D8 光轴 | 轴 |
| `spc-nema17` | NEMA 17 电机安装座 | 电机 |
| `spc-hinge-25mm` | 25mm 柜门铰链 | 铰链 |

## 🤖 机器人模板

| 模板 | 说明 |
|------|------|
| `simple-arm` | 5 自由度机械臂（肩、肘、腕、夹爪） |
| `differential-drive` | 差速驱动两轮机器人（含传感器） |

## 📚 参考

- [build123d 文档](https://build123d.readthedocs.io/)
- [模型上下文协议](https://modelcontextprotocol.io/)
- [HOS_SKILL_WORKFLOW](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW)

## 📄 许可证

GNU Affero General Public License v3.0 (AGPLv3) — 详见 [LICENSE](../LICENSE)

## 🤝 贡献

参见 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解 DCO 签名要求。

---

**Made with ❤️ by the HOS Team**
