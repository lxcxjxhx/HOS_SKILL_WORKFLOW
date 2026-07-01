/**
 * HOS-Sec-Engine V2 - Active Directory Domain Enumeration Skills
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const domainEnumSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'ad-domain-enum-001',
            name: 'Active Directory Domain Enumeration and Reconnaissance',
            category: 'ad',
            subCategory: 'domain-enumeration',
            riskLevel: 'high',
            confidence: 0.95,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['active-directory', 'domain', 'enumeration', 'reconnaissance', 'ldap', 'kerberos'],
        },
        trigger: {
            scenarios: [
                '成功获取域内主机访问权限后需要收集域信息',
                '需要绘制 AD 域拓扑结构和信任关系',
                '寻找域管理员和特权账',
                '发现域内服务账号和委派配',
                '需要识别域内潜在的攻击路径',
            ],
            keywords: [
                'domain enumeration',
                '域信息收',
                'active directory recon',
                'bloodhound',
                'ldap query',
                'domain controller',
                '域控制器',
                'kerberos',
                'spn',
            ],
            aliases: [
                'AD recon',
                'domain discovery',
                'LDAP enumeration',
                'Kerberos enumeration',
                'BloodHound',
            ],
            indicators: [
                'domain admin',
                'enterprise admin',
                'schema admin',
                'KRBTGT',
                'Domain Controllers',
            ],
        },
        knowledge: {
            description: 'Active Directory 域信息收集是内网渗透的关键阶段。通过 LDAP 查询、Kerberos 协议交互、PowerShell 命令等方式，可以获取域结构、用户、组、计算机、GPO 等信息，为后续的权限提升和横向移动提供情报支持',
            symptoms: [
                '已获取域内主机访问权',
                '需要定位域控制',
                '需要识别高价值目',
                '需要了解域信任关系',
            ],
            rootCauses: [
                'AD 默认配置允许匿名 LDAP 查询部分信息',
                '域用户具有读取大部分 AD 对象的权',
                'Kerberos 协议设计允许枚举 SPN',
                'PowerShell 内置 AD 模块可查询域信息',
            ],
            observations: [
                'BloodHound 是最强大的 AD 分析工具，可自动识别攻击路径',
                '普通域用户即可获取大量 AD 信息',
                'LDAP 查询是最隐蔽的信息收集方',
                'Kerberos 预认证请求可用于用户枚举',
            ],
            commonMistakes: [
                '使用 Loud 方式 (?net group) 触发告警',
                '忽略服务账号和委派配',
                '只关注用户而忽略计算机对象',
                '未分析 ACL 和 ACE 权限',
            ],
            notes: [
                '信息收集应尽量使用隐蔽方式避免触发告',
                '结合多种工具和技术获取完整信',
                'AD 信息收集是后续所有攻击的基础',
            ],
        },
        action: {
            checklist: [
                '获取当前用户域信息(whoami /all)',
                '定位域控制器 (nltest /dsgetdc)',
                '枚举域用户和组(net user /domain)',
                '枚举域计算机 (net group "domain computers" /domain)',
                '查询 SPN (setspn -T domain -Q */*)',
                '使用 BloodHound 收集器收集数',
                '分析 AD 对象 ACL ?ACE',
                '检查域信任关系',
            ],
            techniques: [
                'LDAP 查询枚举',
                'Kerberos 用户枚举',
                'PowerShell AD 模块查询',
                'BloodHound 数据收集',
                'SPN 扫描',
                'GPO 分析',
                'ACL/ACE 权限分析',
                '域信任关系枚举',
            ],
            examples: [
                {
                    name: 'LDAP 查询域管理员',
                    description: '使用 LDAP 过滤器查询Domain Admins 组成',
                    content: '# PowerShell LDAP 查询\n' +
                        '$searcher = New-Object DirectoryServices.DirectorySearcher\n' +
                        '$searcher.Filter = "(&(objectClass=user)(memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=com))"\n' +
                        '$searcher.FindAll() | ForEach-Object { $_.Properties.name }',
                },
                {
                    name: 'BloodHound 数据收集',
                    description: '使用 SharpHound 收集器收集AD 数据用于攻击路径分析',
                    content: '# 使用 SharpHound 收集\n' +
                        '.\\SharpHound.exe -c All -d domain.com\n' +
                        '# 或使用 PowerShell\n' +
                        'Import-Module .\\SharpHound.ps1\n' +
                        'Invoke-BloodHound -CollectionMethod All -Domain domain.com',
                },
            ],
        },
        validation: {
            indicators: [
                '成功获取域用户列',
                '识别出域控制',
                '获取域拓扑结',
                'BloodHound 数据导入成功',
            ],
            successSigns: [
                'LDAP 查询返回有效结果',
                'BloodHound 生成完整的攻击路径图',
                '识别出高价值目标账号',
            ],
            falsePositiveSigns: [
                '查询返回空结果可能因权限不足而非无数',
                'SPN 扫描结果可能包含已停用的服务',
            ],
        },
        defense: {
            recommendations: [
                '限制域用户的 LDAP 查询权限',
                '启用 LDAP 签名和通道绑定',
                '部署 AD 审计和监',
                '实施最小权限原',
                '定期审查 AD 对象权限',
                '禁用不必要的匿名 LDAP 访问',
            ],
            mitigations: [
                '监控异常 LDAP 查询频率',
                '部署 HoneyToken 账户检测枚举行',
                '限制 BloodHound 等工具的执行',
            ],
            references: [
                'https://bloodhound.specterops.io/',
                'https://attack.mitre.org/matrices/enterprise/windows/active-directory/',
            ],
        },
        quality: {
            confidence: 0.95,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['domain-pentest'],
        phase: 'user-enumeration',
        runtime: {
          ...DEFAULT_SKILL_RUNTIME,
          requiresNetwork: true,
          estimatedTokens: 2500,
        },
        enabled: true,
    },
];
