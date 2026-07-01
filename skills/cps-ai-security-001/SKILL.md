---
name: cps-ai-security-001
description: "AI 代理在信息物理系统(CPS)中的集成引入了超越传统网络或物理威胁模型的新型安全风险 适用于: 目标系统使用 AI Agent 控制物理设备（智能电网/自动驾驶/工业机器人）; 传感器数据用于 AI 决策且存在被篡改风险; 视频监控/AI 视觉系统可能被 Deepfake 攻击"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - cps
  - cyber-physical
  - ai-agent
  - sentinel
  - deepfake
  - sensor-spoofing
  - mcp
  - scada
  - industrial-control
  - smart-grid
  - iot
  - agent-environment
  - aigc
  - physics-grounded
  category: cps
  risk-level: critical
  confidence: 0.87
---
# CPS AI Agent Security Assessment
AI 代理在信息物理系统(CPS)中的集成引入了超越传统网络或物理威胁模型的新型安全风险。SENTINEL 综述 (Hatami et al., Binghamton Univ., 2026) 系统分析了 AI 代理在 CPS 中的安全问题，提出了六阶段方法论：威胁特征化 → CPS 约束下的可行性分析 → 防御选择 → 纵深防御 → 验证 → 持续适应。核心攻击面包括：(1) Agent-Environment 交互操纵：攻击者通过注入定制输入或操控环境信号迫使不安全动作；(2) Deepfake 驱动的攻击：深度伪造视频/音频/传感器数据欺骗 AI 感知；(3) MCP 介导漏洞：跨域上下文传播导致物理系统误操作。
## 何时使用

### 触发场景

- 目标系统使用 AI Agent 控制物理设备（智能电网/自动驾驶/工业机器人）
- 传感器数据用于 AI 决策且存在被篡改风险
- 视频监控/AI 视觉系统可能被 Deepfake 攻击
- 语音控制系统可能被语音克隆攻击
- MCP 协议在 CPS 环境中用于 Agent-Tool 通信
- 需要评估 AI 生成内容对物理系统的操纵风险
- SCADA/ICS 系统中 AI 辅助决策的安全评估

### 关键词

`cps`, `cyber-physical`, `sensor spoofing`, `deepfake`, `ai agent`, `mcp cps`, `scada`, `industrial control`, `smart grid`, `物理安全`, `传感器欺骗`, `sentinel framework`, `aigc attack`

### 识别指标

- AI Agent 依赖传感器数据进行关键决策
- AI 视觉系统用于物理安全监控
- MCP 协议连接跨信任域的 CPS 组件
- 系统存在 AI 生成内容的输入通道
- Agent 决策可直接触发物理动作
- 边缘设备算力有限可能影响安全检测

### 别名

`CPS AI red team`, `信息物理系统安全`, `AI agent physical attack`, `sensor manipulation test`, `工控AI安全`

## 操作检查清单

1. ** Phase1: 威胁特征化 — 识别 AI Agent 类型、传感器配置、物理执行器
2. ** Phase2: CPS约束分析 — 评估实时性/算力/安全关键性约束
3. ** Phase3: 传感器欺骗测试 — 测试传感器数据注入/篡改/重放
4. ** Phase4: Deepfake感知测试 — 测试视觉/音频 AI 的深度伪造抗性
5. ** Phase5: MCP跨域测试 — 检测 MCP 在 CPS 中的上下文传播安全
6. ** Phase6: Agent决策操纵 — 测试环境信号是否能误导 Agent 决策
7. ** Phase7: 纵深防御评估 — 验证多层防御的有效性
8. ** Phase8: 持续适应验证 — 检查攻击检测的更新机制

## 技术手段

- 传感器注入：伪造温度/压力/位置传感器读数误导 AI 决策
- 视觉 Deepfake：生成伪造的视频帧欺骗 AI 视觉系统
- 语音克隆：合成授权操作员的语音指令通过 AI 语音验证
- MCP 上下文投毒：在 CPS 域间通过 MCP 传播恶意上下文
- 物理环境操纵：通过改变物理条件间接影响 Agent 感知
- 时序攻击：利用 CPS 实时性要求在时间窗口内注入恶意数据
- 传感器 DoS：使合法传感器不可用迫使 Agent 依赖备用(恶意)通道
- AI 生成指令伪装：使用 AIGC 生成合法格式的操作指令

## 实战经验

### 症状

- 传感器读数与物理实际状态不一致
- AI 视觉系统无法识别明显的物理异常
- 语音控制系统对非预期指令做出响应
- Agent 决策导致物理设备异常动作
- MCP 跨域调用导致非预期的物理状态变更
- AI 生成内容被用于伪装成合法操作指令

### 根因分析

- AI Agent 的感知层缺乏物理来源验证（physics-grounded trust）
- 传感器数据链路缺乏端到端的完整性保护
- MCP 在 CPS 环境中缺乏安全上下文传播
- CPS 的实时性要求限制了安全检测的计算开销
- 边缘设备算力不足导致无法部署完整安全机制
- AI 生成内容(AIGC)可伪装成合法环境数据

### 实战观察

- SENTINEL 框架强调在 CPS 约束下评估攻击可行性（时序/噪声/误报成本）
- 检测机制单独不能作为安全关键 CPS 的决策依据
- 基于来源(provenance)和物理基础(physics-grounded)的可信机制最有效
- MCP 在 CPS 中的跨域上下文传播是新兴攻击面
- 智能电网案例显示误报成本可能高于漏报
- 纵深防御架构是 CPS AI 安全的推荐模式

### 常见错误

- 将 IT 安全方案直接套用到 CPS 场景（忽略实时性和安全关键约束）
- 仅关注网络层攻击而忽略物理层（传感器/执行器）攻击
- 未区分 AI Agent 的感知错误与物理设备故障
- 在 CPS 中部署计算密集型安全检测影响实时控制
- 未考虑 AIGC/Deepfake 对 AI 感知层的特定威胁

### 补充说明

- CPS AI 安全检测需在仿真环境中验证后再在物理环境中执行
- SENTINEL 框架提供了从威胁到防御的系统化映射方法
- MCP 在 CPS 中的安全检测建议配合 mcp-security-audit-001 使用
- 传感器数据完整性测试应在安全边界内进行
- 物理系统的安全测试需有紧急停止/回退机制

## 示例

### 传感器数据注入攻击

伪造温度传感器读数误导工业控制 AI 做出危险决策

```
攻击场景: 化工反应釜温度控制 AI Agent
正常: 温度传感器上报 85°C → AI 维持加热
攻击: 注入伪造读数 45°C → AI 持续加热 → 实际温度达 120°C(危险)

实施步骤:
1. 识别 AI Agent 依赖的温度传感器节点
2. 在传感器到控制器的通信链路上注入伪造数据包
3. 逐步降低伪造读数的变化率（避免触发异常检测）
4. 观察 AI Agent 是否基于伪造数据做出控制决策

检测: 对比多传感器读数 + 物理模型预测值
修复: 传感器数据签名 + 物理一致性校验
CPS约束: 需在 ms 级延迟内完成校验
```

### Deepfake 视觉欺骗攻击

使用深度伪造视频帧欺骗 AI 安防监控系统

```
攻击场景: 变电站 AI 视觉安防监控
攻击: 实时生成包含伪造事件的视频帧注入监控系统
  场景A: 注入"无人入侵"帧掩盖实际入侵
  场景B: 注入"虚假入侵"帧触发误报和资源浪费

实施步骤:
1. 收集目标场景的基准视频数据
2. 训练或使用现有 Deepfake 模型生成目标场景
3. 在摄像头到分析系统的流中注入伪造帧
4. 测试 AI 视觉系统的检测和分类结果

修复: 视频源签名 + 物理一致性验证（光线/阴影/反射）
```

### MCP 跨 CPS 域上下文投毒

通过 MCP 协议在 CPS 域间传播恶意上下文操纵物理系统

```
攻击场景: 使用 MCP 连接智能电网的多个子系统
架构: 负载预测Agent(MCP Host) → 变电站控制系统(MCP Server)

攻击步骤:
1. 在 MCP 通信中注入篡改的负载预测数据
2. 篡改的安全上下文(riskLevel: low)使目标系统放松校验
3. 变电站控制系统基于错误预测执行非预期的负载切换
4. 导致电网局部过载或断电

检测: 验证 MCP 上下文中的 source 身份和风险等级
修复: SMCP 安全上下文传播 + 调用链审计
配合: mcp-security-audit-001 进行完整 MCP 安全检测
```

## 验证标准

### 验证指标

- 传感器注入成功改变了 AI Agent 的决策输出
- Deepfake 内容成功通过了 AI 感知系统的检测
- MCP 跨域上下文传播导致非预期的物理系统动作
- Agent 在物理环境操纵下做出了不安全决策
- CPS 约束（实时性/算力）被纳入攻击可行性评估

### 成功标志

- 成功伪造传感器读数使 AI 输出错误控制指令
- Deepfake 视频帧未被 AI 视觉系统识别为异常
- 通过 MCP 传播的恶意上下文影响了 CPS 决策
- 识别出 CPS 中纵深防御的薄弱环节

### 误报标志

- 传感器读数的合法波动被误判为攻击
- 物理环境正常变化被误判为环境操纵
- 视频编解码产生的正常伪影被误判为 Deepfake
- MCP 协议的正常跨域通信被误判为上下文投毒

## 防御建议

### 推荐做法

- 实施基于物理来源验证(physics-grounded trust)的传感器数据校验
- 对 AI Agent 的感知层部署多模态交叉验证
- 使用 SENTINEL 六阶段方法论系统化防御设计
- 部署 MCP 安全上下文传播机制（SMCP 方案）
- 在 CPS 中实现纵深防御架构而非单点检测
- 建立传感器数据签名和链路完整性保护

### 缓解措施

- 视频流实施源端数字签名和时间戳验证
- 语音控制系统实现声纹 + 内容双重验证
- 关键传感器部署物理冗余 + 逻辑交叉校验
- 在边缘设备部署轻量级异常检测模型
- 定期使用 AIGC 检测工具扫描 AI 生成内容

## 参考链接

- Securing AI Agents in CPS: A Survey (Hatami et al., arXiv:2601.20184, 2026)
- SENTINEL Framework (Section III in above survey)
- SMCP: Secure Model Context Protocol (arXiv:2602.011, 2026)
- NIST SP 800-82: Guide to ICS Security
- https://www.cisa.gov/ics
