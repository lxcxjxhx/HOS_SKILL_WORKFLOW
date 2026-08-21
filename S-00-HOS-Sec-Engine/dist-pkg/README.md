# HOS-Sec-Engine v0.5.1 预构建安装包

## 📦 包含内容

| 文件 | 说明 |
|------|------|
| `hos-sec-engine-0.5.1.tgz` | npm 打包产物，可直接 `npm install` |
| `hos-sec-engine-v0.5.1.zip` | 完整源码 + dist 产物压缩包 |
| `package-manifest.json` | 构建清单，包含版本、文件列表、命令说明 |

## 🚀 快速安装

### 方式一：npm 直接安装（推荐）

```bash
# 从 tgz 文件安装
npm install hos-sec-engine-0.5.1.tgz

# 全局安装命令行工具
npm install -g hos-sec-engine-0.5.1.tgz

# 验证安装
hos-sec-engine --version
```

### 方式二：源码 + 构建

```bash
# 解压 zip
unzip hos-sec-engine-v0.5.1.zip
cd S-00-HOS-Sec-Engine

# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 验证构建
node dist/src/examples/process-guidance.js
```

## 🎯 运行演练

```bash
# Web 渗透测试演练
npm run drill:web

# API 安全审计演练
npm run drill:api

# CN-SRC 漏洞赏金演练
npm run drill:src

# 运行所有演练
npm run drill:all
```

## 🔧 环境要求

- **Node.js ≥ 18**
- **Python ≥ 3.8**（CN-SRC-Hunter 工具链）
- npm 9+ 或 yarn 1.22+

## 📋 流程模板

| 模板 | 文件 | 说明 |
|------|------|------|
| Web 应用测试 | `web-pentest.yaml` | 信息收集 → 漏洞扫描 → 利用 → 后渗透 |
| API 接口审计 | `api-security-audit.yaml` | JWT/OAuth、IDOR、GraphQL、速率限制 |
| 云配置审计 | `cloud-config-audit.yaml` | IAM、元数据、S3/OSS 配置检测 |
| CN-SRC 赏金 | `cn-src-hunter.yaml` | 情报 → 评分 → 挖掘 → 验证 → 报告 |

## ⚠️ 使用声明

> **本工具仅限在你有权测试的系统上使用。**

1. **合法合规** — 仅在自己的系统或有书面授权的目标上使用
2. **人工复核** — 所有测试结果需经人工复核，AI 输出仅供参考
3. **数据保密** — 测试数据和漏洞信息不得向第三方泄露
4. **合理使用** — 遵循最小必要原则，避免破坏性影响

## 📞 售后支持

- **7 天答疑** — 购买后 7 天内提供安装与使用答疑
- **安装教程** — 覆盖 Windows / macOS / Linux 三平台
- **问题反馈** — 环境配置、安装报错、使用指导

## 🔗 相关文档

- `SKILL.md` — 技能描述与完整能力说明
- `README.md` — 项目文档
- `docs/cn-src-hunter-integration.md` — CN-SRC-Hunter 集成指南
