/**
 * HOS-Sec-Engine V2 - Kubernetes Misconfiguration Skills
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const k8sMisconfigSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'k8s-misconfig-001',
            name: 'Kubernetes Cluster Misconfiguration Exploitation',
            category: 'kubernetes',
            subCategory: 'k8s-misconfig',
            riskLevel: 'critical',
            confidence: 0.91,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['kubernetes', 'k8s', 'misconfiguration', 'rbac', 'pod-escape', 'cluster-admin'],
        },
        trigger: {
            scenarios: [
                '发现 Kubernetes API Server 未授权访',
                'ServiceAccount 权限配置过高',
                'Pod 以特权模式运',
                'ClusterRole 绑定过于宽松',
                'etcd 未加密或可匿名访?',
            ],
            keywords: [
                'kubernetes misconfig',
                'k8s 配置错误',
                'rbac privilege escalation',
                'cluster-admin',
                'serviceaccount token',
                'pod escape',
                'kubernetes api server',
            ],
            aliases: [
                'kube-apiserver',
                'kubectl exploit',
                'k8s privilege escalation',
                'kubelet anonymous',
            ],
            indicators: [
                'api-server unauthenticated',
                'cluster-admin role bound',
                'privileged pod',
                'hostPath mount',
                'automountServiceAccountToken: true',
            ],
        },
        knowledge: {
            description: 'Kubernetes 配置审计和利用技术用于发现集群中不安全的配置，并通过 RBAC 权限提升、Pod 逃逸等技术获取更高权限。K8s 配置复杂，常见错误包?API Server 暴露、RBAC 过度授权、Pod 安全策略缺失等',
            symptoms: [
                'API Server 可匿名访问或接受默认凭据',
                'ServiceAccount 自动挂载?Pod',
                'Pod ?root 用户运行',
                'ClusterRoleBinding 授予过宽权限',
                'NetworkPolicy 未限?Pod 间通信',
            ],
            rootCauses: [
                'RBAC 配置过于宽松，授予不必要的权',
                'API Server 未启用认证或授权',
                '缺少 Pod 安全策略 (PSP) ?PodSecurity Admission',
                'etcd 数据未加',
                'kubelet 启用了匿名认',
                '默认命名空间未做安全加固',
            ],
            observations: [
                '大多?K8s 安全问题源于配置错误而非软件漏洞',
                'ServiceAccount token 泄露是常见的权限提升路径',
                '特权 Pod 可挂载宿主机文件系统实现逃',
                'RBAC 权限提升需要精确分析角色绑定链',
            ],
            commonMistakes: [
                '只检查集群级配置而忽略命名空间级配置',
                '未检?ServiceAccount ?token 自动挂载设置',
                '忽略?Role ?ClusterRole 的区',
                '未验证网络策略是否实际生?',
            ],
            notes: [
                'K8s 安全需要多层防护：认证、授权、准入控制、网络策',
                '定期审计 RBAC 配置是必要的',
                '建议使用 kube-bench 等工具进行安全评?',
            ],
        },
        action: {
            checklist: [
                '检?API Server 认证和授权配',
                '检?RBAC 角色和角色绑',
                '检?ServiceAccount 配置?token 挂载',
                '检?Pod 安全配置 (securityContext)',
                '检查网络策?(NetworkPolicy)',
                '检?etcd 加密配置',
                '检?kubelet 配置',
                '检?admission controllers',
            ],
            techniques: [
                'ServiceAccount token 提取和使',
                'RBAC 权限提升 (escalate, bind, impersonate)',
                '特权 Pod 创建和宿主机挂载',
                'kubelet API 匿名访问利用',
                'etcd 数据提取',
                '网络策略绕过',
            ],
            examples: [
                {
                    name: 'ServiceAccount Token 权限提升',
                    description: '利用挂载?Pod ?ServiceAccount token 访问 K8s API',
                    content: '# 提取 token\n' +
                        'TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)\n' +
                        'NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)\n' +
                        '# 列出可访问的资源\n' +
                        'kubectl --token=$TOKEN auth can-i --list\n' +
                        '# 尝试创建新的 ClusterRoleBinding\n' +
                        'kubectl --token=$TOKEN create clusterrolebinding admin --clusterrole=cluster-admin --user=default',
                },
                {
                    name: '特权 Pod 逃',
                    description: '创建特权 Pod 挂载宿主机根文件系统',
                    content: 'apiVersion: v1\n' +
                        'kind: Pod\n' +
                        'metadata:\n' +
                        '  name: escape-pod\n' +
                        'spec:\n' +
                        '  containers:\n' +
                        '  - name: escape\n' +
                        '    image: alpine\n' +
                        '    command: ["chroot", "/host", "/bin/sh"]\n' +
                        '    volumeMounts:\n' +
                        '    - name: host-fs\n' +
                        '      mountPath: /host\n' +
                        '    securityContext:\n' +
                        '      privileged: true\n' +
                        '  volumes:\n' +
                        '  - name: host-fs\n' +
                        '    hostPath:\n' +
                        '      path: /\n',
                },
            ],
        },
        validation: {
            indicators: [
                '成功通过 API Server 认证',
                '可以列出或修改集群资',
                '可以创建特权 Pod',
                '可以访问 etcd 数据',
            ],
            successSigns: [
                'kubectl auth can-i 返回 yes',
                '成功创建 ClusterRoleBinding',
                'Pod 可以挂载宿主机文件系?',
            ],
            falsePositiveSigns: [
                'API 响应成功但权限不足实际无法操',
                '网络策略阻止?Pod 间通信',
            ],
        },
        defense: {
            recommendations: [
                '启用并配?RBAC 严格模式',
                '禁用匿名认证',
                '配置 PodSecurity Admission 限制特权 Pod',
                '加密 etcd 数据',
                '实施 NetworkPolicy 限制 Pod 通信',
                '禁用 ServiceAccount token 自动挂载',
                '定期审计 RBAC 配置',
            ],
            mitigations: [
                '使用最小权限原则配?ServiceAccount',
                '启用 audit logging',
                '部署 Falco 等运行时安全监控',
                '定期更新 K8s 版本',
            ],
            references: [
                'https://kubernetes.io/docs/concepts/security/',
                'https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html',
            ],
        },
        quality: {
            confidence: 0.91,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['cloud-config-audit'],
        phase: 'container-audit',
        enabled: true,
    },
];
