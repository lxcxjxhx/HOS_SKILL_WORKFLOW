# HOS-Sec-Engine CVE 更新技能

自维护 CVE 数据库 — AI 训练截止（2025-04-01）后新 CVE 的自动拉取与查询系统。

**源:** NVD (API 2.0) + GitHub Advisory + cve.circl.lu 备用

## 路径

```
.hos-sec-cve/
├── update.sh           ← 主入口（执行全量更新）
├── query.py            ← CVE 查询接口
├── data/
│   └── cve_db.json     ← 13,500+ 条 CVE（13MB JSON）
├── sources/
│   ├── pull_nvd.py     ← NVD API 2.0（支持 NVD_API_KEY 加速）
│   ├── pull_github.py  ← GitHub Advisory（支持 GITHUB_TOKEN）
│   └── pull_cnnvd.py   ← 备用源（cve.circl.lu + 国内源暂存）
└── prompts/            ← 提示工程框架（授权渗透测试辅助）
    ├── wrapper.sh      ← 封装器（授权声明/命令分段/后处理）
    ├── workflow-pentest.js  ← 多智能体工作流
    └── agent-framework.json ← 多层注入架构定义
```

## 使用方式

### 1. 全量更新 CVE
```bash
# 基础使用（NVD 限速 5 req/30s）
bash .hos-sec-cve/update.sh

# 加速（需申请免费 NVD API Key: https://nvd.nist.gov/developers/request-an-api-key）
export NVD_API_KEY="your-key-here"
export GITHUB_TOKEN="your-token-here"
bash .hos-sec-cve/update.sh
```

### 2. 查询 CVE
```bash
# 按关键词搜索
python3 .hos-sec-cve/query.py "Chrome RCE"

# 按 CVE ID 精确查找
python3 .hos-sec-cve/query.py CVE-2026-12026

# 按严重度筛选
python3 .hos-sec-cve/query.py --severity CRITICAL
```

### 3. 渗透测试辅助
```bash
# 加载封装器
source .hos-sec-cve/prompts/wrapper.sh

# 声明授权上下文 + 执行操作
hos_run "nmap -sV target.com" "服务指纹识别"
```

### 4. 多智能体工作流
```javascript
// 在 Workflow 工具中调用
Workflow({
  scriptPath: '.hos-sec-cve/prompts/workflow-pentest.js',
  args: {
    target: 'target.com',
    scope: '*.target.com',
    mode: 'full'   // recon | scan | exploit | full
  }
})
```

## 优化变更记录（v2.1）

| 变更 | 文件 | 说明 |
|------|------|------|
| NVD API Key | `pull_nvd.py` | 支持 `NVD_API_KEY` 环境变量，50 req/30s |
| GitHub 引用修复 | `pull_github.py` | `isinstance` 类型守卫修复 references 崩溃 |
| 路径兼容 | `update.sh` | `cygpath -m` 转换 POSIX→Windows 路径 |
| CIRCL 备用源 | `pull_cnnvd.py` | 新增 `cve.circl.lu` API 补充数据 |
| 国内源标记 | `pull_cnnvd.py` | CNVD/CNNVD/AVD 标记不可达（不再重复请求） |
| 环境检查 | `update.sh` | 新增 `check_env()` 报告 Key 状态 |
| 封装器 | `prompts/wrapper.sh` | 授权声明/命令分段/输出后处理 |
| 工作流 | `prompts/workflow-pentest.js` | 4 阶段多智能体渗透测试 |
| 架构定义 | `prompts/agent-framework.json` | 多层注入 + 身份声明 |

## 性能特征

| 指标 | 无 API Key | 有 NVD_API_KEY |
|------|:----------:|:--------------:|
| 全量同步耗时 | ~25 分钟 | ~5 分钟 |
| 数据库大小 | 13 MB | 13 MB |
| CVE 总数 | 13,500+ | 13,500+ |
| 月度增量 | ~6,000 | ~6,000 |
