# Active Directory Domain Enumeration and Reconnaissance

**ID**: `ad-domain-enum-001` | **分类**: ad | **风险等级**: high

Active Directory 域信息收集是内网渗透的关键阶段。通过 LDAP 查询、Kerberos 协议交互、PowerShell 命令等方式，可以获取域结构、用户、组、计算机、GPO 等信息，为后续的权限提升和横向移动提供情报支持

## 触发场景

- 成功获取域内主机访问权限后需要收集域信息
- 需要绘制 AD 域拓扑结构和信任关系
- 寻找域管理员和特权账
- 发现域内服务账号和委派配
- 需要识别域内潜在的攻击路径

## 操作检查清单

1. 获取当前用户域信息(whoami /all)
2. 定位域控制器 (nltest /dsgetdc)
3. 枚举域用户和组(net user /domain)
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
- 域信任关系枚举

## 症状

- 已获取域内主机访问权
- 需要定位域控制
- 需要识别高价值目
- 需要了解域信任关系

## 根因分析

- AD 默认配置允许匿名 LDAP 查询部分信息
- 域用户具有读取大部分 AD 对象的权
- Kerberos 协议设计允许枚举 SPN
- PowerShell 内置 AD 模块可查询域信息

## 示例

### LDAP 查询域管理员

使用 LDAP 过滤器查询Domain Admins 组成

```
# PowerShell LDAP 查询
$searcher = New-Object DirectoryServices.DirectorySearcher
$searcher.Filter = "(&(objectClass=user)(memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=com))"
$searcher.FindAll() | ForEach-Object { $_.Properties.name }
```

### BloodHound 数据收集

使用 SharpHound 收集器收集AD 数据用于攻击路径分析

```
# 使用 SharpHound 收集
.\SharpHound.exe -c All -d domain.com
# 或使用 PowerShell
Import-Module .\SharpHound.ps1
Invoke-BloodHound -CollectionMethod All -Domain domain.com
```

## 成功标志

- LDAP 查询返回有效结果
- BloodHound 生成完整的攻击路径图
- 识别出高价值目标账号

## 防御建议

- 限制域用户的 LDAP 查询权限
- 启用 LDAP 签名和通道绑定
- 部署 AD 审计和监
- 实施最小权限原
- 定期审查 AD 对象权限
- 禁用不必要的匿名 LDAP 访问
