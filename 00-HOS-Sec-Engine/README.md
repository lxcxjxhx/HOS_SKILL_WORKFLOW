# HOS-Sec-Engine 攻防技能引擎

> 22+ 个标准化攻防实战技能，支持 Claude Code / Trae / Cursor 等多平台

## 快速安装

### 方案 A: npm 包安装（推荐，含完整源码）
```bash
npm install hos-sec-engine
npx hos-skills install --target trae     # 安装到 Trae
npx hos-skills install --target claude-code  # 安装到 Claude Code
```

### 方案 B: npx skills add（纯 skill 文件）
```bash
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill hos-sec-engine -a claude-code
npx skills add lxcxjxhx/HOS_SKILL_WORKFLOW --skill web-sqli-001 -a trae
```

### 方案 C: 直接使用（无需安装）
复制本仓库 `00-HOS-Sec-Engine/skills/` 目录到：
- Trae: `~/.trae-cn/skills/` 或 项目 `.trae/skills/`
- Claude Code: `~/.claude/skills/` 或 项目 `.claude/skills/`
- Cursor: 项目 `.cursor/rules/`

## 技能列表

| 分类 | 数量 | 代表技能 |
|------|------|----------|
| Web 安全 | 11 | web-sqli-001, web-xss-001, web-rce-001 |
| API 安全 | 5 | api-jwt-001, api-oauth-001, api-idor-001 |
| 云安全 | 3 | cloud-iam-001, cloud-meta-001, cloud-s3-001 |
| 系统安全 | 3 | linux-priv-esc-001, windows-priv-esc-001, ad-domain-enum-001 |
| 其他 | 6 | k8s-misconfig-001, web-xxe-001, mobile-android-apk-001 |

## 项目结构

```
00-HOS-Sec-Engine/
├── src/                    # TypeScript 源码（可编译、可修改）
│   ├── core/               # 引擎核心（匹配、评分、编排）
│   ├── skills/             # 技能源码
│   ├── playbooks/          # 渗透测试流程编排
│   └── scripts/            # 构建和部署脚本
├── skills/                 # 生成的 skill 文件（npx skills add 兼容）
│   ├── hos-sec-engine/     # 整合 skill 入口
│   ├── web-sqli-001/       # 独立 skill
│   └── ...
├── cli/                    # 交互式安装 CLI
├── package.json
└── tsconfig.json
```

## AI 自主维护

AI Agent 可以：
1. **阅读 skill**: 直接读取 `skills/*/SKILL.md` 文件
2. **新增 skill**: 在 `skills/hos-sec-engine/skills/` 下创建 `.md` 文件
3. **修改源码**: 编辑 `src/skills/` 下的 TypeScript 文件后运行 `npm run build`
4. **编译部署**: `npm install && npm run build && npm run deploy`

## License

MIT
