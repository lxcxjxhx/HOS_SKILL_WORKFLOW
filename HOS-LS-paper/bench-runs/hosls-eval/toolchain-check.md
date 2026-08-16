# 工具链体检报告（Phase 0.2 · 2026-08-16）

> 目的：跑任何付费评测前确认本地 SAST/规则/密钥状态。全部零 API 成本。

## 1. 结论速览

| 组件 | 状态 | 说明 |
|---|---|---|
| semgrep | ✅ 1.159.0（sast-venv） | `--config p/python` 在线规则 151 条可下载运行（已实测） |
| bandit | ✅ 1.9.4（sast-venv） | 已实测可跑 JSON 输出 |
| codeql CLI | ⛔ 缺失 | 全仓与常见路径无 `codeql.exe`；`envs/codeql` 为 junction → `BOS-GIT\codeql`，仅含 javascript/python 语言目录，无 java |
| semgrep-rules 本地目录 | ⚠️ 仅 auto/yaml | 缺 `python/`、`java/` 官方规则目录；在线 `p/python` 可替代 Python 阶段 |
| 泄露 key | ✅ 已清理 | 4 个 yaml 的 `sk-ada1f16…` 已改为 `<env:HOS_LS_ALIYUN_API_KEY>` 引用（提交见 git log） |
| 测试夹具 | ✅ 确认无害 | `tests/fixtures/vulnerable_code/hardcoded_secrets.py` 为标准示例占位符（`sk-1234567890abcdef`/`AKIAIOSFODNN7EXAMPLE`），保留 |

## 2. 对后续阶段的影响

- **DEP-A0（Phase 1，零 API）**：不依赖 codeql —— 用 bandit + semgrep（`p/python`）在 100 对 vuln/patched 切片上做双端差分扫描即可完成"消失性判定"可行性分析。**不阻塞。**
- **新基准 Java 框架（Phase 2–4）**：codeql 硬证据层暂缺。
  - 降级路径：SAL 用 semgrep `p/java` 在线规则 + AI 证据链 + patch 差分验证（不依赖 codeql）。
  - 升级选项（0 API，仅网络下载）：从 GitHub Releases 下载 codeql CLI zip + `codeql pack download codeql/java-security-and-quality`（~数百 MB，耗时）。**决策点**：S2-S0 冒烟前由预算/磁盘评估是否安装。
- **API key 注入（Phase 4 前置）**：会话环境无 `HOS_LS_AI_API_KEY`/`DEEPSEEK_API_KEY` 系统级变量（17 号报告已记录"无 key 时扫描在 LLM 调用处挂起"）。付费阶段前必须确认 harness 侧 `DEEPSEEK_API_KEY` 能被子进程读取，否则需显式注入。

## 3. 遗留行动

- [ ] 用户：阿里云百炼控制台吊销/轮换 `sk-ada1f16…`（历史 commit 已公开暴露，清理工作树无法撤回）
- [ ] Java 阶段前：决定 codeql CLI 安装（升级）或 semgrep p/java 降级（默认）
- [ ] Phase 4 前：验证 API key 子进程注入路径
