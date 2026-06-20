---
name: ad-domain-enum-001
description: "Active Directory 域信息收集是内网渗透的关键阶段 适用于: 成功获取域内主机访问权限后需要收集域信息; 需要绘?AD 域拓扑结构和信任关系; 寻找域管理员和特权账"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - active-directory
  - domain
  - enumeration
  - reconnaissance
  - ldap
  - kerberos
  category: ad
  risk-level: high
  confidence: 0.92
---
# Active Directory Domain Enumeration and Reconnaissance
Active Directory 域信息收集是内网渗透的关键阶段。通过 LDAP 查询、Kerberos 协议交互、PowerShell 命令等方式，可以获取域结构、用户、组、计算机、GPO 等信息，为后续的权限提升和横向移动提供情报支持
## 何时使用

### 触发场景

- 成功获取域内主机访问权限后需要收集域信息
- 需要绘?AD 域拓扑结构和信任关系
- 寻找域管理员和特权账
- 发现域内服务账号和委派配
- 需要识别域内潜在的攻击路径

### 关键词

`domain enumeration`, `域信息收`, `active directory recon`, `bloodhound`, `ldap query`, `domain controller`, `域控制器`, `kerberos`, `spn`

### 识别指标

- domain admin
- enterprise admin
- schema admin
- KRBTGT
- Domain Controllers

### 别名

`AD recon`, `domain discovery`, `LDAP enumeration`, `Kerberos enumeration`, `BloodHound`

## 操作检查清单

1. 获取当前用户域信?(whoami /all)
2. 定位域控制器 (nltest /dsgetdc)
3. 枚举域用户和?(net user /domain)
4. 枚举域计算机 (net group "domain computers" /domain)
5. 查询 SPN (setspn -T domain -Q */*)
6. 使用 BloodHound 收集器收集数
7. 分析 AD 对象 ACL ?ACE
8. 检查域信任关系

## 技术手段

- LDAP 查询枚举
- Kerberos 用户枚举
- PowerShell AD 模块查询
- BloodHound 数据收集
- SPN 扫描
- GPO 分析
- ACL/ACE 权限分析
- 域信任关系枚?

## 实战经验

### 症状

- 已获取域内主机访问权
- 需要定位域控制
- 需要识别高价值目
- 需要了解域信任关系

### 根因分析

- AD 默认配置允许匿名 LDAP 查询部分信息
- 域用户具有读取大部分 AD 对象的权
- Kerberos 协议设计允许枚举 SPN
- PowerShell 内置 AD 模块可查询域信息

### 实战观察

- BloodHound 是最强大?AD 分析工具，可自动识别攻击路径
- 普通域用户即可获取大量 AD 信息
- LDAP 查询是最隐蔽的信息收集方
- Kerberos 预认证请求可用于用户枚举

### 常见错误

- 使用 Loud 方式 (?net group) 触发告警
- 忽略服务账号和委派配
- 只关注用户而忽略计算机对象
- 未分?ACL ?ACE 权限

### 补充说明

- 信息收集应尽量使用隐蔽方式避免触发告
- 结合多种工具和技术获取完整信
- AD 信息收集是后续所有攻击的基础

## 示例

### LDAP 查询域管理员

使用 LDAP 过滤器查?Domain Admins 组成

```
# PowerShell LDAP 查询
$searcher = New-Object DirectoryServices.DirectorySearcher
$searcher.Filter = "(&(objectClass=user)(memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=com))"
$searcher.FindAll() | ForEach-Object { $_.Properties.name }
```

### BloodHound 数据收集

使用 SharpHound 收集器收?AD 数据用于攻击路径分析

```
# 使用 SharpHound 收集
.\SharpHound.exe -c All -d domain.com
# 或使?PowerShell
Import-Module .\SharpHound.ps1
Invoke-BloodHound -CollectionMethod All -Domain domain.com
```

## 验证标准

### 验证指标

- 成功获取域用户列
- 识别出域控制
- 获取域拓扑结
- BloodHound 数据导入成功

### 成功标志

- LDAP 查询返回有效结果
- BloodHound 生成完整的攻击路径图
- 识别出高价值目标账?

### 误报标志

- 查询返回空结果可能因权限不足而非无数
- SPN 扫描结果可能包含已停用的服务

## 防御建议

### 推荐做法

- 限制域用?LDAP 查询权限
- 启用 LDAP 签名和通道绑定
- 部署 AD 审计和监
- 实施最小权限原
- 定期审查 AD 对象权限
- 禁用不必要的匿名 LDAP 访问

### 缓解措施

- 监控异常 LDAP 查询频率
- 部署 HoneyToken 账户检测枚举行
- 限制 BloodHound 等工具的执行

## 参考链接

- https://bloodhound.specterops.io/
- https://attack.mitre.org/matrices/enterprise/windows/active-directory/
