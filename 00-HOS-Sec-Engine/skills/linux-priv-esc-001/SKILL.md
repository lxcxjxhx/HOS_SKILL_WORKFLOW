---
name: linux-priv-esc-001
description: "Linux 权限提升技术用于在获取普通用户访问权限后提升到 root 权限 适用于: 获取普通用户 shell 后需要提升到 root; 发现 sudo 配置不当可执行特权命; 发现 SUID 二进制文件可被滥"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - linux
  - privilege-escalation
  - sudo
  - capability
  - cron
  - suid
  - priv-esc
  category: linux
  risk-level: critical
  confidence: 0.93
---
# Linux Privilege Escalation Techniques
Linux 权限提升技术用于在获取普通用户访问权限后提升到 root 权限。Linux 系统存在多种提权路径：sudo 配置错误、SUID 二进制滥用、危险的 Capability 配置、可写cron 任务、内核漏洞等。提权成功取决于系统配置和用户权限
## 何时使用

### 触发场景

- 获取普通用户 shell 后需要提升到 root
- 发现 sudo 配置不当可执行特权命
- 发现 SUID 二进制文件可被滥
- 发现可写的 cron 任务或脚
- 发现危险的 Linux Capability 配置

### 关键词

`linux privilege escalation`, `linux 提权`, `sudo exploitation`, `suid binary`, `capability abuse`, `cron escalation`, `linpeas`, `gtfobins`

### 识别指标

- sudo -l
- SUID
- capabilities
- cron
- writable /etc/passwd
- docker group

### 别名

`priv esc`, `root escalation`, `local privilege escalation`, `LPE`

## 操作检查清单

1. 检查 sudo 权限 (sudo -l)
2. 查找 SUID 二进制(find / -perm -4000)
3. 检查用户组 (id)
4. 检查 cron 任务 (crontab -l, ls -la /etc/cron*)
5. 检查 Capability (getcap -r / 2>/dev/null)
6. 检查可写配置文件(/etc/passwd, /etc/shadow)
7. 检查环境变
8. 检查内核版本和可用 exploit
9. 使用 LinPEAS 自动化枚举

## 技术手段

- sudo 命令滥用 (GTFOBins)
- SUID 二进制利
- Capability 滥用 (cap_setuid, cap_sys_ptrace)
- cron 任务劫持
- 环境变量劫持 (PATH, LD_PRELOAD)
- Docker/LXD 组成员提
- 内核漏洞利用
- 可写 /etc/passwd 利用

## 实战经验

### 症状

- 用户可通过 sudo 执行特定命令
- 系统存在 SUID root 二进制文
- 用户具有危险的 Linux Capability
- cron 任务以 root 运行但脚本可
- 用户属于 docker 或其他特权组

### 根因分析

- sudoers 配置允许 NOPASSWD 执行危险命令
- SUID 二进制存在已知可利用行为
- Linux Capability 分配过于宽松
- cron 脚本权限配置不当
- 用户被加入特权组 (docker, lxd)
- 内核存在可利用的本地提权漏洞

### 实战观察

- sudo 配置是最常见的 Linux 提权路径
- GTFOBins 提供了大量 SUID 利用技术
- Docker/LXD 组成员身份等同于 root 访问
- Capability 滥用是较新但越来越常见的攻击
- 内核提权漏洞因版本而异且需要 PoC 适配

### 常见错误

- 忽略 sudo -l 的输出分
- 未检查所有 SUID 二进制文件
- 忽略 cron 任务的安全
- 未检查环境变量劫持(PATH, LD_PRELOAD)
- 忽略Capabilities 配置

### 补充说明

- 提权方法高度依赖系统配置
- 应使用 LinPEAS 等自动化枚举工具
- 内核提权需要精确匹配内核版本

## 示例

### sudo vim 提权

利用 sudo 允许运行 vim 的特权执行shell

```
# sudo 允许运行 vim
sudo vim -c ':!/bin/sh'

# 或使用 python
sudo python -c 'import os; os.system("/bin/sh")'

# 或使用 find
sudo find /etc/passwd -exec /bin/sh \;
```

### Capability cap_setuid 提权

利用 cap_setuid capability 获取 root

```
# 发现具有 cap_setuid 的二进制
getcap -r / 2>/dev/null
# 输出: /usr/bin/python3 = cap_setuid+ep

# 利用 python3 提权
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

### Docker 组成员提

利用 docker 组成员身份挂载宿主机文件系统

```
# docker 组成员可控制 docker daemon
docker run -v /:/mnt --rm -it alpine chroot /mnt sh

# 或使用特权容器
docker run --rm -it --privileged --pid=host \
  -v /:/mnt alpine nsenter -t 1 -m -u -n -i sh
```

## 验证标准

### 验证指标

- whoami 返回 root
- uid=0 在输出中
- 可以访问 /etc/shadow
- 可以执行 root 权限命令

### 成功标志

- 成功获取 root shell
- 可以修改系统配置
- 可以读取敏感文件

### 误报标志

- 命令执行成功但权限未提升
- sudo 密码未知无法实际利用

## 防御建议

### 推荐做法

- 严格配置 sudoers 使用 visudo
- 定期审计 SUID 二进
- 最小化 Linux Capability 分配
- 保护 cron 脚本权限
- 限制特权组成
- 及时更新内核和系统补
- 使用 AppArmor/SELinux 限制进程权限

### 缓解措施

- 部署审计日志监控异常提权行为
- 限制危险二进制的使用
- 实施最小权限原则

## 参考链接

- https://gtfobins.github.io/
- https://github.com/carlospolop/PEASS-ng
- https://book.hacktricks.xyz/linux-hardening/privilege-escalation
