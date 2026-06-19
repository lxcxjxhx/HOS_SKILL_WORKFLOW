# HOS-Sec-Engine V2 攻防专项 Skill Engine

将真实攻防经验转化为标准化的 Skill 知识库，使 AI 大模型（即使是能力较弱的模型）也能获得专业攻防交付能力。

> 区别于传统渗透测试流程工具，本引擎聚焦于真实场景的解决方案和实战经验沉淀。

## 特性

- **实战导向**：基于真实攻防项目积累的经验，非抽象流程
- **六层结构**：Metadata、Trigger、Knowledge、Action、Validation、Defense
- **多维度匹配**：场景、关键词、别名、指标四维触发匹配
- **类型安全**：纯 TypeScript 编写，完整的类型定义
- **自动加载**：递归扫描 `skills/**/*.ts`，新增 Skill 无需修改索引
- **质量控制**：confidence、reviewed、tested、lastVerified 质量字段
- **双重输出**：支持文本和 JSON 格式输出

## 安装

### 方式一：交互式 CLI 安装（推荐 - 选择性安装）

使用 `npx hos-skills` 启动交互式安装界面，支持浏览、搜索、按领域一键安装：

```bash
# 启动交互式安装
npx hos-skills

# 非交互模式 - 安装指定 Skill
npx hos-skills --skills web-sqli-001,web-xss-001 --target trae --repo https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW

# 非交互模式 - 按领域一键安装
npx hos-skills --bundle web-bundle --target claude-code --repo https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW

# 非交互模式 - 安装全部
npx hos-skills --all --target cursor --repo https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW
```

**交互模式支持以下功能：**
- **浏览所有 Skill** - 按分类展示 22 个 Skill，空格多选安装
- **搜索 Skill** - 关键词搜索（支持 ID、名称、标签、分类模糊匹配）
- **按领域一键安装** - 选择领域包（web-bundle、api-bundle、cloud-bundle 等）
- **安装全部** - 一键安装所有 22 个 Skill
- **查看 Skill 详情** - 查看单个 Skill 的详细信息

### 方式二：npx skills 全量安装

使用 `npx skills` 命令行工具全量安装到 AI 编辑器：

```bash
# 一键安装全部 Skill（默认安装到当前项目）
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -y

# 安装到指定编辑器
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -a claude-code -y
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -a trae -y
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -a cursor -y

# 全局安装（所有项目可用）
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -g -y
```

**交互式安装示例：**
```
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝
    HOS Skills Installer

已加载 22 个 Skill

选择安装方式：
❯ 1. 浏览所有 Skill（分类选择）
  2. 搜索 Skill（关键词搜索）
  3. 按领域一键安装
  4. 安装全部 Skill
  5. 查看 Skill 详情
  6. 退出
```

安装后，在 AI 编辑器对话中直接提及 Skill 名称或描述相关场景即可触发：
- "使用 web-sqli-001 进行 SQL 注入 WAF 绕过测试"
- "目标有 WAF 防护，SQL 注入被拦截了，帮我绕过"

### 方式二：npm 包安装（TypeScript Engine）

```bash
npm install hos-sec-engine
npm run build
```

## 快速开始

```typescript
import { HosSecEngine } from 'hos-sec-engine';

const engine = new HosSecEngine();

const result = engine.execute({
  scenario: '目标网站有WAF防护，SQL注入被拦截了，需要绕过WAF'
});

console.log(result);
```

## API 文档

### HosSecEngine

#### 构造函数

```typescript
new HosSecEngine(config?: EngineConfig)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| strictMode | boolean | true | 严格模式，Skill 验证失败时抛出错误 |
| maxResults | number | 10 | 最大匹配结果数量 |
| minMatchScore | number | 0.1 | 最低匹配分数阈值 (0-1) |
| loadPresetSkills | boolean | true | 是否加载预设 Skill |
| customSkillsDir | string | '' | 自定义 Skill 目录路径 |

#### 方法

| 方法 | 说明 |
|------|------|
| `execute(query, format?)` | 执行查询，返回文本或 JSON 格式结果 |
| `executeRaw(query)` | 执行查询，返回原始 SkillResult[] |
| `registerSkill(skill)` | 注册单个 Skill |
| `registerSkills(skills)` | 批量注册 Skill |
| `getSkills()` | 获取所有已加载的 Skill |
| `getSkillById(id)` | 根据 ID 获取 Skill |
| `getSkillCount()` | 获取 Skill 数量 |
| `enableSkill(id)` | 启用指定 Skill |
| `disableSkill(id)` | 禁用指定 Skill |
| `removeSkill(id)` | 移除指定 Skill |
| `clearSkills()` | 清空所有 Skill |

#### EngineConfig

```typescript
interface EngineConfig {
  strictMode?: boolean;        // 严格模式（默认 true）
  maxResults?: number;         // 最大匹配结果数量（默认 10）
  minMatchScore?: number;      // 最低匹配分数（默认 0.1）
  customSkillsDir?: string;    // 自定义 Skill 目录
  loadPresetSkills?: boolean;  // 是否加载预设 Skill（默认 true）
}
```

#### ExecuteQuery

```typescript
interface ExecuteQuery {
  scenario: string;           // 场景描述或关键词
  categories?: string[];      // 按分类过滤（如 ['web', 'api']）
  subCategories?: string[];   // 按子分类过滤
  riskLevels?: RiskLevel[];   // 按风险等级过滤
  tags?: string[];            // 按标签过滤
}
```

#### RiskLevel

```typescript
type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
```

#### 输出格式

```typescript
engine.execute(query, 'text');  // 文本格式（默认）
engine.execute(query, 'json');  // JSON 格式
```

## AttackDefenseSkill 六层结构

每个 Skill 包含六层结构：

```typescript
interface AttackDefenseSkill {
  metadata: Metadata;       // 管理与分类
  trigger: Trigger;         // 多维度触发条件
  knowledge: Knowledge;     // 实战经验知识（核心）
  action: Action;           // 操作思路与技术
  validation: Validation;   // 结果验证标准
  defense: Defense;         // 防御建议
  quality?: Quality;        // 质量控制
  enabled?: boolean;        // 是否启用
}
```

### Metadata 层

```typescript
interface Metadata {
  id: string;           // 唯一标识，如 "web-sqli-001"
  name: string;         // Skill 名称
  category: string;     // 一级分类，如 "web", "api", "cloud"
  subCategory: string;  // 二级分类，如 "sql-injection", "jwt"
  riskLevel: RiskLevel; // 风险等级
  confidence: number;   // 置信度 0-1
  updatedAt: string;    // 更新时间，如 "2026-06"
  author?: string;      // 作者
  tags: string[];       // 标签
}
```

### Trigger 层

```typescript
interface Trigger {
  scenarios: string[];  // 触发场景描述
  keywords: string[];   // 关键词
  aliases: string[];    // 别名/变体名称
  indicators: string[]; // 指标/信号（如 "403", "blocked"）
}
```

### Knowledge 层

```typescript
interface Knowledge {
  description: string;          // 详细描述
  symptoms: string[];           // 症状/现象
  rootCauses: string[];         // 根因分析
  observations: string[];       // 实战观察
  commonMistakes: string[];     // 常见错误
  notes: string[];              // 补充说明
}
```

### Action 层

```typescript
interface Action {
  checklist: string[];    // 操作检查清单
  techniques: string[];   // 技术手段
  examples: Example[];    // 具体示例
}

interface Example {
  name: string;
  description: string;
  content: string;
  applicableScenarios?: string[];
}
```

### Validation 层

```typescript
interface Validation {
  indicators: string[];           // 验证指标
  successSigns: string[];         // 成功标志
  falsePositiveSigns: string[];   // 误报标志
}
```

### Defense 层

```typescript
interface Defense {
  recommendations: string[];  // 推荐做法
  mitigations: string[];      // 缓解措施
  references: string[];       // 参考链接
}
```

### Quality 层

```typescript
interface Quality {
  confidence: number;      // 置信度 0-1
  reviewed: boolean;       // 是否经过人工审查
  tested: boolean;         // 是否经过实战验证
  lastVerified: string;    // 最后验证时间
}
```

## Skill 开发规范

### AI 自动维护流程

新增 Skill 只需 **1 步**，AI 可完全自主完成：

> **零索引维护**：`SkillLoader` 会在编译时递归扫描 `skills/` 目录下所有 `.js` 文件，自动发现并加载所有 Skill。新增 Skill 文件后，编译即可自动注册，**无需修改任何 index 文件**。

#### 步骤 1: 创建 Skill 文件

在 `src/skills/` 目录下任意子目录中创建 `.ts` 文件，导出以 `Skills` 结尾的数组：

```typescript
import { AttackDefenseSkill } from '../../../types/skill';

export const myDomainSkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'domain-skill-001',
      name: 'Skill 名称',
      category: 'domain',
      subCategory: 'subcategory',
      riskLevel: 'high',
      confidence: 0.9,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['tag1', 'tag2'],
    },
    trigger: {
      scenarios: ['触发场景描述'],
      keywords: ['关键词1', '关键词2'],
      aliases: ['别名1'],
      indicators: ['403', 'blocked'],
    },
    knowledge: {
      description: '详细描述...',
      symptoms: ['症状1'],
      rootCauses: ['根因1'],
      observations: ['观察1'],
      commonMistakes: ['常见错误1'],
      notes: ['补充说明1'],
    },
    action: {
      checklist: ['检查项1', '检查项2'],
      techniques: ['技术1', '技术2'],
      examples: [
        {
          name: '示例名称',
          description: '示例说明',
          content: '示例内容',
        },
      ],
    },
    validation: {
      indicators: ['验证指标'],
      successSigns: ['成功标志'],
      falsePositiveSigns: ['误报标志'],
    },
    defense: {
      recommendations: ['推荐做法'],
      mitigations: ['缓解措施'],
      references: ['https://...'],
    },
    quality: {
      confidence: 0.9,
      reviewed: true,
      tested: true,
      lastVerified: '2026-06',
    },
    enabled: true,
  },
];
```

就这么简单！编译后自动发现，无需修改 `skills/index.ts`。

### 自动发现机制

```
创建 .ts 文件
    ↓
npm run build (TypeScript 编译)
    ↓
SkillLoader 递归扫描 dist/src/skills/ 下的所有 .js 文件
    ↓
自动提取所有以 "Skills" 结尾的导出数组
    ↓
Skill 自动注册到引擎
```

- SkillLoader 跳过 `index.js` 文件，避免循环加载
- 只加载已编译的 `.js` 文件，确保类型安全
- 自动按 `metadata.category` 分类导出
- 新增领域无需修改任何代码

### Skill 命名规范

- **领域目录**：小写-连字符，如 `ai-security`, `code-review`
- **子目录**：小写-连字符，如 `prompt-injection`, `java-deser`
- **Skill ID**：`{领域}-{子类}-{序号}` 格式，如 `web-sqli-001`, `ai-prompt-injection-001`
- **导出名**：以 `Skills` 结尾的驼峰命名，如 `sqliWafBypassSkills`

### 风险等级 (RiskLevel)

| 等级 | 说明 |
|------|------|
| `critical` | 严重 |
| `high` | 高危 |
| `medium` | 中危 |
| `low` | 低危 |
| `info` | 信息 |

## 使用示例

### 场景查询

```typescript
// WAF 绕过查询
const result1 = engine.execute({
  scenario: '目标网站有WAF防护，SQL注入被拦截了',
  categories: ['web']
});

// 容器安全查询
const result2 = engine.execute({
  scenario: 'Docker 容器逃逸',
  categories: ['container']
});

// 按风险等级过滤
const result3 = engine.execute({
  scenario: '发现SQL注入漏洞',
  riskLevels: ['critical', 'high']
});

// JSON 格式输出
const result4 = engine.execute({
  scenario: 'AI prompt injection',
  categories: ['ai-security']
}, 'json');
```

### 自定义 Skill 注册

```typescript
import { HosSecEngine, AttackDefenseSkill } from 'hos-sec-engine';

const engine = new HosSecEngine();

const customSkill: AttackDefenseSkill = {
  metadata: {
    id: 'custom-001',
    name: '特定API接口测试',
    category: 'api',
    subCategory: 'authorization',
    riskLevel: 'medium',
    confidence: 0.85,
    updatedAt: '2026-06',
    author: 'HOS Team',
    tags: ['api', 'authorization'],
  },
  trigger: {
    scenarios: ['测试未授权访问内部API接口'],
    keywords: ['内部api', '未授权'],
    aliases: ['unauthorized access'],
    indicators: ['200 OK', 'data returned'],
  },
  knowledge: {
    description: '测试未授权访问内部 API 接口',
    symptoms: ['API 返回数据无认证要求'],
    rootCauses: ['未配置认证中间件'],
    observations: ['常见于内部管理系统'],
    commonMistakes: ['只测试登录用户的接口'],
    notes: ['注意检查所有 API 端点'],
  },
  action: {
    checklist: ['确认 API 端点', '移除认证头测试', '观察响应'],
    techniques: ['未授权访问测试', '水平越权测试'],
    examples: [
      {
        name: '未授权访问测试',
        description: '不带 Authorization 头访问 API',
        content: 'GET /internal/api/users (不带Authorization头)',
      },
    ],
  },
  validation: {
    indicators: ['返回 HTTP 200', '响应包含数据'],
    successSigns: ['成功获取数据'],
    falsePositiveSigns: ['返回空数据集'],
  },
  defense: {
    recommendations: ['配置认证中间件', '实施 RBAC'],
    mitigations: ['添加审计日志'],
    references: ['https://owasp.org/'],
  },
  quality: {
    confidence: 0.85,
    reviewed: true,
    tested: true,
    lastVerified: '2026-06',
  },
  enabled: true,
};

engine.registerSkill(customSkill);
```

## 编译与运行

```bash
# 安装依赖
npm install

# 编译 + 自动生成 SKILL.md（嵌套 + 扁平化双重输出）
npm run build

# 运行示例
npm start

# 开发模式（监听文件变化自动编译）
npm run dev

# 单独生成 SKILL.md 文件
npm run generate-skills-md
```

**构建自动化**：`npm run build` 会先编译 TypeScript，然后自动生成两种格式的 SKILL.md 文件：
- **嵌套结构**：`dist/skills/{category}/{skill-id}/SKILL.md`（TypeScript Engine 使用）
- **扁平结构**：`skills/{skill-id}/SKILL.md`（npx skills CLI 使用，可直接提交到 GitHub）

## 项目结构

```
00-HOS-Sec-Engine/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # 主入口
│   ├── core/                 # 核心引擎
│   │   ├── engine.ts         # Skill Engine 核心
│   │   ├── matcher.ts        # 多维匹配器
│   │   ├── scorer.ts         # 评分计算
│   │   ├── validator.ts      # Skill 验证器
│   │   ├── formatter.ts      # 结果格式化
│   │   ├── loader.ts         # 递归加载器
│   │   ├── orchestrator.ts   # 流程编排引擎（V3）
│   │   └── report.ts         # 报告生成器（V3）
│   ├── types/                # 类型定义
│   │   ├── skill.ts          # Skill 类型
│   │   └── result.ts         # 结果类型
│   ├── skills/               # TypeScript 源码 Skill 库（自动发现，零维护）
│   │   ├── index.ts          # SkillLoader 自动扫描入口
│   │   ├── web/              # Web 安全（SQLi, XSS, SSRF, XXE, Upload, RCE）
│   │   ├── api/              # API 安全（JWT, OAuth, IDOR, Rate Limit）
│   │   ├── cloud/            # 云安全（S3, IAM, Metadata）
│   │   ├── windows/          # Windows 安全（权限提升）
│   │   ├── linux/            # Linux 安全（权限提升）
│   │   ├── ai-security/      # AI 安全（Prompt 注入）
│   │   ├── ad/               # 域安全（信息收集）
│   │   ├── mobile/           # 移动安全（Android APK）
│   │   ├── container/        # 容器安全（Docker 逃逸）
│   │   ├── kubernetes/       # K8s 安全（配置审计）
│   │   ├── code-review/      # 代码审计（Java 反序列化）
│   │   ├── reverse/          # 逆向工程
│   │   ├── malware-analysis/ # 恶意代码分析
│   │   ├── threat-hunting/   # 威胁狩猎
│   │   └── defense/          # 防御策略
│   └── scripts/              # 脚本工具
│       └── generate-skills-md.ts
├── skills/                   # npx skills 兼容的扁平化 SKILL.md 目录
│   ├── web-sqli-001/
│   │   └── SKILL.md
│   ├── web-xss-001/
│   │   └── SKILL.md
│   ├── ... (其他 22 个 Skill)
│   └── references/
│       └── REFERENCE.md
├── examples/
│   └── usage.ts              # 使用示例
└── dist/                     # 编译输出
    ├── src/                  # TypeScript 编译产物（JS/DTS）
    └── skills/               # 嵌套结构 SKILL.md（按领域分类）
```

## 预设 Skill 库

| 领域 | 分类 | Skill 数量 | 说明 |
|------|------|------------|------|
| Web 安全 | sql-injection | 1 | SQL 注入 WAF 绕过技术 |
| Web 安全 | xss | 0 | XSS 过滤器绕过 |
| Web 安全 | ssrf | 0 | SSRF 检测与利用 |
| Web 安全 | xxe | 0 | XXE 注入攻击 |
| Web 安全 | upload | 0 | 文件上传绕过 |
| Web 安全 | rce | 0 | 远程代码执行 |
| Web 安全 | deserialization | 0 | 反序列化攻击 |
| API 安全 | jwt | 0 | JWT 攻击 |
| API 安全 | idor | 0 | IDOR 越权访问 |
| API 安全 | oauth | 0 | OAuth 漏洞 |
| API 安全 | rate-limit | 0 | 速率限制绕过 |
| 云安全 | s3 | 0 | S3 存储桶 misconfig |
| 云安全 | iam | 0 | IAM 权限提升 |
| 云安全 | metadata | 0 | 元数据 SSRF |
| Windows 安全 | privilege-escalation | 1 | Windows 权限提升 |
| Linux 安全 | privilege-escalation | 1 | Linux 权限提升 |
| AI 安全 | prompt-injection | 1 | Prompt 注入绕过 |
| 容器安全 | docker-escape | 1 | Docker 容器逃逸 |
| K8s 安全 | k8s-misconfig | 1 | Kubernetes 配置审计 |
| 域安全 | domain-enumeration | 1 | AD 域信息收集 |
| 移动安全 | android-apk | 1 | Android APK 逆向分析 |
| 代码审计 | java-deserialization | 1 | Java 反序列化审计 |

## 流程编排（V3 新增）

在 Skill Engine 基础上，V3 新增了**流程编排层**，将离散 Skill 组织为标准攻防流程：

```
FlowOrchestrator
    ├── loadPlaybook()   → 加载 Playbook 定义
    ├── executeFlow()    → 按阶段顺序执行（阶段间传递上下文）
    ├── pause()/resume() → 暂停/恢复
    ├── skipPhase()      → 跳过阶段
    ├── rollbackTo()     → 回滚到指定阶段
    └── visualizeStatus() → 流程可视化
```

### 预定义流程模板

| 流程 ID | 名称 | 分类 | 难度 | 预估时间 |
|---------|------|------|------|----------|
| `web-pentest-full` | 完整 Web 应用渗透测试 | web | 中级 | 4-8小时 |
| `api-security-review` | API 安全审计 | api | 中级 | 2-4小时 |
| `domain-pentest` | AD 域渗透测试 | intranet | 高级 | 8-16小时 |
| `cloud-config-audit` | 云配置审计 | cloud | 中级 | 2-4小时 |
| `code-review-java` | Java 代码审计 | audit | 中级 | 4-8小时 |

### 快速开始

```typescript
import { HosSecEngine, getPlaybookById } from 'hos-sec-engine';
import { allPlaybooks } from 'hos-sec-engine/playbooks';

const engine = new HosSecEngine();

// 查看所有预定义流程
console.log('预定义流程:', allPlaybooks.map(p => p.name));

// 加载并执行流程
const playbook = getPlaybookById('web-pentest-full');
engine.loadPlaybook(playbook);

const result = await engine.executeFlow({
  target: 'https://target.example.com',
  findings: [],
  accessLevel: 'anonymous',
  history: [],
  customData: {}
});

console.log(result.summary);
console.log(result.report);
```

### 流程控制

```typescript
// 跳过某个阶段
engine.getOrchestrator().skipPhase('vulnerability-scan');

// 暂停执行（人工确认后恢复）
engine.getOrchestrator().pause();

// 恢复执行
const resumedResult = await engine.getOrchestrator().resume();

// 回滚到指定阶段
const rolledBack = await engine.getOrchestrator().rollbackTo('recon');

// 可视化当前流程状态
console.log(engine.getOrchestrator().visualizeStatus());
```

### PLAYBOOK.md 生成

编译后自动生成 Playbook Markdown 文档：

```bash
npm run build
# 自动在 dist/playbooks/{category}/{playbook-id}/PLAYBOOK.md 生成
```

## SKILL.md 生成

引擎支持将 Skill 转换为标准 SKILL.md 格式（agentskills.io 兼容）：

```bash
# 编译后自动生成（嵌套 + 扁平化双重输出）
npm run build

# 手动生成
npm run generate-skills-md
```

输出位置：
- `dist/skills/{category}/{skill-id}/SKILL.md` - 嵌套结构（TypeScript Engine 使用）
- `skills/{skill-id}/SKILL.md` - 扁平结构（npx skills CLI 使用）

### npx skills 兼容性

`skills/` 目录采用扁平化结构，兼容 `npx skills` CLI 标准：

```
skills/
├── web-sqli-001/SKILL.md
├── web-xss-001/SKILL.md
├── ... (其他 22 个 Skill)
└── references/REFERENCE.md
```

提交到 GitHub 后，用户可通过以下命令一键安装：

```bash
npx skills add https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW -s hos-sec-engine -y
```
