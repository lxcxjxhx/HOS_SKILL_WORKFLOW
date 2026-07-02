# Immature Vulnerability Detection for Pre-Commit Review

**ID**: `code-review-immature-001` | **分类**: code-review | **风险等级**: high

不成熟漏洞（Immature Vulnerability）是在预提交阶段出现的、不完整、潜伏或依赖于上下文的弱点，通常通过小的增量代码变更引入。与成熟的漏洞不同，这些变更在单独看时通常看起来无害，但随着周围代码的添加会演变成可利用的漏洞。AgenticSCR（FSE 2026）提出了 Detector + Validator 双代理架构：Detector 子代理使用 SAST 规则语义记忆进行定位和分类，Validator 子代理基于 CWE 框架验证减少误报。在 SCRBench 基准上达到 17.5% 的正确评论率（比静态 LLM 高 10.6%），评论数减少 81%。

## 触发场景

- 开发者提交前的增量代码变更安全审查
- 小的代码变更在单独看时看似无害但可能有安全影响
- 需要检测跨文件/跨函数的上下文相关漏洞
- CI/CD 流水线中预提交阶段的安全扫描
- IDE 中实时代码安全分析
- 不完整的 API 使用、缺失的验证逻辑、渐进式的授权缺陷

## 操作检查清单

1. ** 阶段1: 变更采集 — 获取增量代码变更集（diff / patch）
2. ** 阶段2: 安全语义检索 — 查询 SAST 规则记忆库匹配变更模式
3. 阶段3: 上下文解析 — 解析变更涉及的跨文件依赖关系
4. ** 阶段4: Detector 分析 — 对变更逐行进行安全分类（参考 AgenticSCR Detector）
5. ** 阶段5: Validator 验证 — 使用 CWE 框架验证发现（参考 AgenticSCR Validator）
6. 阶段6: 误报过滤 — 基于上下文信息排除无效发现
7. 阶段7: 定位输出 — 输出行级定位 + 漏洞类型 + 修复建议
8. 阶段8: 严重性评估 — 评估漏洞是否可在当前上下文环境中被利用

## 技术手段

- 不安全 API 检测：识别缺少参数验证或错误处理的新增 API 调用
- 缺失授权检查：分析新增代码路径是否跳过了身份验证或授权检查
- 渐进式权限扩散：追踪跨多个提交的权限配置逐步放宽
- 配置安全基线漂移：对比新增配置项与安全基线
- 跨文件数据流分析：追踪增量变更中数据跨文件流动的安全性
- CWE 分类验证：对每个发现映射到具体 CWE ID 并验证上下文
- SAST 规则语义匹配：将 SAST 规则转化为可检索的语义记忆
- 依赖版本安全性：检查新增依赖库的已知漏洞和版本安全性

## 症状

- 新添加的 API 调用未检查返回值或异常
- 新增变量/参数未做范围限制或类型验证
- 新的逻辑分支缺少授权检查
- 配置文件新增条目未设置安全默认值
- 新增的依赖库未检查版本安全性
- 错误处理路径中未记录或未正确处理安全事件
- 新增的正则表达式存在 ReDoS 风险

## 根因分析

- 开发者聚焦于功能实现，安全考量被延迟到后续迭代
- 增量变更的上下文不足以暴露完整的风险面
- 缺乏跨文件/跨模块的安全影响分析
- 安全测试在预提交阶段未被集成到工作流
- SAST 工具对不完整代码产生高误报，开发者逐渐忽视

## 示例

### 缺失输入验证的不成熟漏洞

新增 API 端点未对用户输入进行验证，单独看是合法添加但后续可被利用

```
变更场景: 在用户管理模块新增批量查询接口
增量代码: 
  + public List<User> getUsersByIds(List<String> ids) {
  +     return userRepo.findAllById(ids);
  + }
问题: ids 参数未做任何校验，直接传入数据库查询
后续风险: 攻击者可传入恶意构造的 ID 列表导致越权数据访问
成熟后形态: 加上验证逻辑前一直暴露
修复: 添加白名单验证 + 权限校验
CWE: CWE-20 (Improper Input Validation)
```

### 渐进式授权缺陷

跨多个提交逐步放宽权限控制，每个单独变更看似合理

```
变更场景: 文件下载功能逐步修改
提交1: + @PreAuthorize("hasRole('USER')")  // 要求USER角色
提交2: + @PreAuthorize("hasAnyRole('USER','GUEST')")  // 放宽到GUEST
提交3: - @PreAuthorize(...)  // 为性能考虑临时移除（未恢复）
问题: 每个提交通常被单独审查，但组合后导致未授权文件下载
检测要点: 追踪权限注解的跨提交变更趋势
CWE: CWE-862 (Missing Authorization)
```

### 配置项安全基线漂移

新增配置项未设置安全默认值，导致安全配置逐渐弱化

```
变更场景: 新增数据库连接配置
增量配置: 
  + datasource:
  +   hikari:
  +     maximum-pool-size: 50
问题: 未配置 connection-timeout 和 validation-timeout
默认值: 连接池默认超时可能过高，导致资源耗尽风险
检测: 对比配置变更与安全配置基线模板
修复: 每个配置变更使用安全基线模板校验
```

### 跨文件数据流忽略安全上下文

新增文件使用已有数据但忽略其安全上下文要求

```
变更场景: 新增 report-generator.ts 使用已有的用户数据
增量代码: 
  + function generateReport(userId: string) {
  +     const data = db.query("SELECT * FROM users WHERE id = " + userId);
  +     return formatReport(data);
  + }
问题: userId 直接拼接到 SQL 查询中（虽然已有函数做了预处理但新路径绕过了）
跨文件分析: 已有 UserService.getUser() 使用了参数化查询
     但新函数绕过了已有安全机制
CWE: CWE-89 (SQL Injection) + CWE-701 (Web Security Weakness)
```

## 成功标志

- 发现缺失参数验证的新增 API 调用
- 识别出跨提交的权限配置逐步弱化趋势
- 检测到新增配置项的安全基线漂移
- 发现绕过已有安全机制的增量代码路径
- 成功排除 SAST 工具的高误报项

## 防御建议

- 在 CI/CD 预提交阶段集成基于 Agentic 的安全代码审查
- 采用 Detector + Validator 双阶段架构降低误报率
- 构建 SAST 规则语义记忆库供 Detector 子代理检索
- 使用 CWE 框架作为 Validator 验证标准
- 对增量变更进行跨文件上下文分析而非仅分析变更本身
- 将安全配置基线纳入代码审查的自动化检查项
