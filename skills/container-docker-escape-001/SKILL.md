---
name: container-docker-escape-001
description: "Docker 容器逃逸技术用于在获取容器访问权限后，突破容器隔离限制访问宿主机资源 适用于: 成功获取容器 shell 后需要逃逸到宿主; 容器以特权模式(--privileged) 运行; 容器挂载了宿主机敏感目录"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - docker
  - container-escape
  - privilege-escalation
  - namespace
  - cgroup
  category: container
  risk-level: critical
  confidence: 0.93
---
# Docker Container Escape Techniques
Docker 容器逃逸技术用于在获取容器访问权限后，突破容器隔离限制访问宿主机资源。容器安全依赖 Linux namespace 和 cgroup 隔离机制，但不当配置或内核漏洞可被利用实现逃逸
## 何时使用

### 触发场景

- 成功获取容器 shell 后需要逃逸到宿主
- 容器以特权模式(--privileged) 运行
- 容器挂载了宿主机敏感目录
- 容器使用了不安全的 Capability 配置
- Docker socket 被挂载到容器内

### 关键词

`docker escape`, `container escape`, `容器逃`, `privileged container`, `docker socket`, `namespace escape`, `cgroup release_agent`

### 识别指标

- /var/run/docker.sock
- proc/kcore
- sys/fs/cgroup
- dev/sda

### 别名

`break out container`, `container breakout`, `host access from container`

## 操作检查清单

1. 检查容器是否以特权模式运行 (cat /proc/1/status | grep Cap)
2. 检查 Docker socket 是否存在 (/var/run/docker.sock)
3. 检查挂载的宿主机目录 (mount, df -h)
4. 检查容器 Capability 配置 (capsh --print)
5. 检查内核版本和 Docker 版本
6. 检查 cgroup 配置
7. 根据配置选择合适的逃逸技术

## 技术手段

- 特权模式逃逸：挂载宿主机根文件系统
- Docker socket 逃逸：通过 API 创建特权容器
- cgroup release_agent 逃
- CVE-2019-5736 runc 逃
- 危险 Capability 利用 (SYS_MODULE 加载内核模块)
- procfs 逃逸 (通过 /proc 访问宿主机进程)

## 实战经验

### 症状

- 容器内发现 docker.sock 文件
- 容器以 --privileged 模式运行
- 敏感目录被挂载到容器
- 容器具有危险 Capability (SYS_ADMIN, SYS_PTRACE 等)

### 根因分析

- 特权模式 (--privileged) 授予所有 Linux Capability
- Docker socket 挂载使容器可控制宿主机 Docker daemon
- 危险 Capability 配置不当
- 宿主机内核存在容器逃逸相关漏洞 (CVE-2019-5736 等)
- 不安全的 cgroup 配置允许 release_agent 利用

### 实战观察

- 特权模式是最常见的逃逸入口点
- docker.sock 挂载等同于获得宿主机 root 权限
- 部分逃逸技术依赖特定内核版
- 现代 Docker 版本已修复多个已知逃逸路径

### 常见错误

- 仅检查 --privileged 标志而忽略 Capability 配置
- 忽略通过挂载目录间接逃逸的可能
- 未考虑内核漏洞 (runc/containerd 漏洞)

### 补充说明

- 逃逸技术需要结合容器具体配置进行分
- 部分技术需要特定内核版本或 Docker 版本
- 应在授权测试环境中进行验证

## 示例

### 特权模式挂载逃

利用 --privileged 容器的设备访问权限挂载宿主机根文件系

```
# 在特权容器内
mkdir -p /tmp/host
mount /dev/sda1 /tmp/host
# 或者挂载宿主机根目录
fdisk -l  # 查找宿主机根分区
mount /dev/vda1 /tmp/host
chroot /tmp/host  # 进入宿主机环境
```

### Docker Socket 逃

通过 docker.sock 创建特权容器访问宿主机

```
# 在容器内通过 docker socket 创建新容器
curl --unix-socket /var/run/docker.sock -X POST \
  http://localhost/containers/create \
  -H "Content-Type: application/json" \
  -d '{"Image":"alpine","Cmd":["cat","/host/etc/shadow"],
       "HostConfig":{"Binds":["/:/host:ro","/var/run/docker.sock:/var/run/docker.sock"]}}'
# 启动容器获取宿主机文件
```

## 验证标准

### 验证指标

- 成功读取宿主机敏感文件 (/etc/shadow)
- 可以执行宿主机命
- 容器外进程可访问

### 成功标志

- mount 操作成功
- chroot 进入宿主机环
- 通过 docker API 创建新容器

### 误报标志

- 读取的是容器内同名文件而非宿主机文
- mount 命令被 AppArmor/SELinux 阻止

## 防御建议

### 推荐做法

- 禁止使用 --privileged 模式
- 不要挂载 Docker socket 到容
- 使用最小必需 Capability 配置
- 实施 Seccomp ?AppArmor 策略
- 使用非 root 用户运行容器
- 限制挂载点范围

### 缓解措施

- 定期更新 Docker 和内核版
- 使用 rootless Docker
- 实施容器安全扫描
- 监控容器异常行为

## 参考链接

- https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
- https://github.com/carlospolop/hacktricks/blob/master/linux-unix/privilege-escalation/docker-breakout.md
