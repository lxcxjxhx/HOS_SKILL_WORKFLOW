---
name: cloud-iam-002
description: "CPS (信息物理系统)中的设备身份和信任链管理是保障 AI Agent 决策可靠性的基础 适用于: CPS 设备（传感器/执行器/边缘节点）需要向云 IAM 进行身份注册; IoT 设备证书管理存在部署和轮换问题; 覆盖网络中边缘节点间的信任链验证"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - cps
  - device-identity
  - trust-chain
  - iot-certificate
  - edge-security
  - provenance
  - physics-grounded
  - sensor-auth
  - overlay-network
  - pki
  - mcp-identity
  category: cloud
  risk-level: high
  confidence: 0.86
---
# CPS Device Identity and Trust Chain Verification
CPS (信息物理系统)中的设备身份和信任链管理是保障 AI Agent 决策可靠性的基础。SENTINEL 综述强调基于来源(provenance)和物理基础(physics-grounded)的可信机制是 CPS 安全的核心。本技能覆盖：边缘设备证书管理审计、覆盖网络信任链验证、传感器数据来源完整性检测、MCP 协议在 CPS 中的身份声明验证、云-边-端统一身份管理等场景。
## 何时使用

### 触发场景

- CPS 设备（传感器/执行器/边缘节点）需要向云 IAM 进行身份注册
- IoT 设备证书管理存在部署和轮换问题
- 覆盖网络中边缘节点间的信任链验证
- 传感器数据链路的来源完整性验证
- MCP 协议在云-边-端架构中的身份管理
- 物理设备的身份与其数字身份绑定验证

### 关键词

`device identity`, `cps iam`, `iot certificate`, `edge trust`, `sensor provenance`, `设备身份`, `信任链`, `证书管理`, `mcp identity`, `physics grounded`

### 识别指标

- CPS 设备使用默认证书或硬编码凭证
- 设备证书过期但未被轮换
- 边缘节点间通信缺乏双向 TLS
- 传感器数据链路缺乏来源签名
- MCP 通信中身份声明未被验证
- 设备身份与物理位置绑定不完整

### 别名

`CPS device trust audit`, `CPS 设备身份审计`, `edge identity verification`, `sensor provenance check`

## 操作检查清单

1. ** 审计设备证书: 检查所有 CPS 设备证书的有效期、签名链和私钥保护
2. ** 验证覆盖网络: 测试 WireGuard/IPSec 节点间的双向认证配置
3. ** 测试传感器数据签名: 验证传感器数据的来源签名和完整性
4. ** MCP 身份声明测试: 测试 MCP 通信中的身份声明是否被验证
5. ** 评估证书轮换: 检查设备的自动证书轮换机制是否可用
6. ** 测试设备撤销: 撤销设备证书后验证其是否仍能被信任
7. ** 验证物理绑定: 测试设备的数字身份与物理唯一标识的绑定

## 技术手段

- 证书链验证：检查设备证书 → 中间 CA → 根 CA 的完整链
- 私钥存储审计：检查设备私钥是否存储在 TPM/Secure Element 中
- 覆盖网络证书测试：测试 WireGuard/IPSec 节点证书的认证强度
- 传感器数据签名验证：注入未签名的传感器数据测试是否被接受
- MCP 身份声明伪造：构造伪造的身份声明测试 MCP 服务端验证
- 设备证书轮换测试：触发证书轮换机制验证自动化流程
- 物理绑定验证：检查设备 ID 与 TPM/PUF 的绑定强度

## 实战经验

### 症状

- 设备使用自签名证书但未建立 CA 信任链
- 传感器数据在传输链路中未被签名
- 边缘节点身份被仿冒但未被检测
- 设备证书私钥存储在非安全介质中
- MCP 服务端接受任何客户端的身份声明

### 根因分析

- CPS 设备数量庞大导致证书管理复杂，运维人员默认关闭验证
- 边缘设备算力有限，PKI 完整验证影响实时性
- 传感器硬件缺乏安全元素（Secure Element/TPM）
- 跨域信任（云-边-端）缺乏统一身份框架
- MCP 协议默认无身份管理机制（需 SMCP 扩展）

### 实战观察

- SMCP 的可信组件注册表(TCR)可统一管理 CPS 设备身份
- 设备身份应绑定物理不可克隆函数(PUF)或 TPM
- 传感器数据签名需在微秒级完成以满足 CPS 实时性
- 覆盖网络的 WireGuard/IPSec 证书管理常被忽略
- MCP 与 SMCP 的身份互认是云边端一体化关键

### 常见错误

- 将 IT 设备的证书管理方案直接套用到 IoT/CPS 设备
- 忽略边缘设备的证书轮换机制（设备远程更新困难）
- 仅验证设备身份而不验证传感器数据的来源完整性
- 在 MCP 通信中信任客户端声明的身份而不验证
- CPS 设备删除后未及时从信任注册表中移除

### 补充说明

- CPS 设备身份验证失败可导致 AI Agent 基于伪造数据做出危险决策
- 建议与 cps-ai-security-001 配合进行完整 CPS 安全评估
- SMCP 论文提供了 CPS 场景下的身份管理参考架构
- 设备证书自动化轮换是 CPS IAM 的关键实践

## 示例

### MCP CPS 设备身份声明伪造

测试 MCP 服务端是否验证客户端的身份声明（基于 SMCP 威胁模型）

```
攻击场景: CPS 边缘节点通过 MCP 向云端上报传感器数据

攻击步骤:
1. 捕获合法 MCP 客户端的身份声明（agentId / deviceId）
2. 伪造身份声明连接 MCP 服务端:
   {
     "agentId": "sensor-node-007",
     "deviceId": "temperature-sensor-bay-3",
     "riskLevel": "low"
   }
3. 发送伪造的传感器数据:
   {
     "temperature": 45.2,  // 实际85°C
     "signature": "[重放的合法签名]"
   }
4. 如果服务端未验证身份声明直接处理数据 → 设备身份仿冒成功

修复: MCP 服务端使用 SMCP 可信组件注册表验证身份声明
配合: mcp-security-audit-001
```

### 传感器数据来源完整性测试

测试 CPS 系统是否验证传感器数据的来源和完整性

```
测试步骤:
1. 在传感器到边缘网关的通信链路上旁路注入数据包
2. 发送包含以下内容的伪造数据:
   - 未签名的传感器读数
   - 使用其他传感器的签名但数据内容不同
   - 重放之前捕获的合法数据包
3. 观察 AI Agent 是否接受伪造数据并更新决策

通过标准: AI Agent 应拒绝所有来源不可验证的传感器数据
修复: 传感器数据实施端到端签名 + 时间戳 + 序列号防重放
```

## 验证标准

### 验证指标

- 设备证书存在完整信任链（设备→中间CA→根CA）
- 设备私钥存储在 TPM/Secure Element 中
- 覆盖网络节点间启用了双向证书验证
- 传感器数据包经过来源签名和时间戳标记
- MCP 身份声明经过可信组件注册表验证
- 设备证书撤销后立即被信任系统拒绝

### 成功标志

- 发现使用默认证书或硬编码凭证的 CPS 设备
- 伪造的 MCP 身份声明被服务端拒绝
- 传感器数据链路缺乏来源签名被识别
- 设备证书轮换机制缺失或手动流程
- 覆盖网络节点间未启用双向认证

### 误报标志

- 设备使用自签名证书但内部 CA 在离线环境中可接受
- 传感器数据未签名但通过物理隔离网络传输
- MCP 身份声明验证失败是由配置问题而非安全缺陷

## 防御建议

### 推荐做法

- 部署 SMCP 可信组件注册表管理 CPS 设备身份
- 设备私钥强制存储在 TPM 或 Secure Element 中
- 传感器数据实施端到端数字签名
- 覆盖网络（WireGuard/IPSec）启用双向证书认证
- 建立设备证书自动轮换和撤销机制
- MCP 通信中验证身份声明的签名链
- 设备删除时即时从信任注册表中移除

### 缓解措施

- 使用 TPM 2.0 或类似的硬件安全模块保护设备身份
- 定期审计设备证书状态和轮换日志
- 部署证书透明度(CT)日志用于监控异常证书
- 建立 CPS 设备身份与物理位置的双向绑定

## 参考链接

- Securing AI Agents in CPS (Hatami et al., arXiv:2601.20184, 2026)
- SMCP: Secure Model Context Protocol (arXiv:2602.011, 2026)
- NIST SP 800-183: Networks of Things
- TPM 2.0 规范: https://trustedcomputinggroup.org/
- AWS IoT Core 设备身份: https://docs.aws.amazon.com/iot/
