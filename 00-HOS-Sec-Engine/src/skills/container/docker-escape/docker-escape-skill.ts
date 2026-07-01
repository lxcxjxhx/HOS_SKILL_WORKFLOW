/**
 * HOS-Sec-Engine V2 - Docker Container Escape Skills
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const dockerEscapeSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'container-docker-escape-001',
            name: 'Docker Container Escape Techniques',
            category: 'container',
            subCategory: 'docker-escape',
            riskLevel: 'critical',
            confidence: 0.93,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['docker', 'container-escape', 'privilege-escalation', 'namespace', 'cgroup'],
        },
        trigger: {
            scenarios: [
                '成功获取容器 shell 后需要逃逸到宿主',
                '容器以特权模式(--privileged) 运行',
                '容器挂载了宿主机敏感目录',
                '容器使用了不安全的 Capability 配置',
                'Docker socket 被挂载到容器内',
            ],
            keywords: [
                'docker escape',
                'container escape',
                '容器逃',
                'privileged container',
                'docker socket',
                'namespace escape',
                'cgroup release_agent',
            ],
            aliases: [
                'break out container',
                'container breakout',
                'host access from container',
            ],
            indicators: [
                '/var/run/docker.sock',
                'proc/kcore',
                'sys/fs/cgroup',
                'dev/sda',
            ],
        },
        knowledge: {
            description: 'Docker 容器逃逸技术用于在获取容器访问权限后，突破容器隔离限制访问宿主机资源。容器安全依赖 Linux namespace 和 cgroup 隔离机制，但不当配置或内核漏洞可被利用实现逃逸',
            symptoms: [
                '容器内发现 docker.sock 文件',
                '容器以 --privileged 模式运行',
                '敏感目录被挂载到容器',
                '容器具有危险 Capability (SYS_ADMIN, SYS_PTRACE 等)',
            ],
            rootCauses: [
                '特权模式 (--privileged) 授予所有 Linux Capability',
                'Docker socket 挂载使容器可控制宿主机 Docker daemon',
                '危险 Capability 配置不当',
                '宿主机内核存在容器逃逸相关漏洞 (CVE-2019-5736 等)',
                '不安全的 cgroup 配置允许 release_agent 利用',
            ],
            observations: [
                '特权模式是最常见的逃逸入口点',
                'docker.sock 挂载等同于获得宿主机 root 权限',
                '部分逃逸技术依赖特定内核版',
                '现代 Docker 版本已修复多个已知逃逸路径',
            ],
            commonMistakes: [
                '仅检查 --privileged 标志而忽略 Capability 配置',
                '忽略通过挂载目录间接逃逸的可能',
                '未考虑内核漏洞 (runc/containerd 漏洞)',
            ],
            notes: [
                '逃逸技术需要结合容器具体配置进行分',
                '部分技术需要特定内核版本或 Docker 版本',
                '应在授权测试环境中进行验证',
            ],
        },
        action: {
            checklist: [
                '检查容器是否以特权模式运行 (cat /proc/1/status | grep Cap)',
                '检查 Docker socket 是否存在 (/var/run/docker.sock)',
                '检查挂载的宿主机目录 (mount, df -h)',
                '检查容器 Capability 配置 (capsh --print)',
                '检查内核版本和 Docker 版本',
                '检查 cgroup 配置',
                '根据配置选择合适的逃逸技术',
            ],
            techniques: [
                '特权模式逃逸：挂载宿主机根文件系统',
                'Docker socket 逃逸：通过 API 创建特权容器',
                'cgroup release_agent 逃',
                'CVE-2019-5736 runc 逃',
                '危险 Capability 利用 (SYS_MODULE 加载内核模块)',
                'procfs 逃逸 (通过 /proc 访问宿主机进程)',
            ],
            examples: [
                {
                    name: '特权模式挂载逃',
                    description: '利用 --privileged 容器的设备访问权限挂载宿主机根文件系',
                    content: '# 在特权容器内\n' +
                        'mkdir -p /tmp/host\n' +
                        'mount /dev/sda1 /tmp/host\n' +
                        '# 或者挂载宿主机根目录\n' +
                        'fdisk -l  # 查找宿主机根分区\n' +
                        'mount /dev/vda1 /tmp/host\n' +
                        'chroot /tmp/host  # 进入宿主机环境',
                },
                {
                    name: 'Docker Socket 逃',
                    description: '通过 docker.sock 创建特权容器访问宿主机',
                    content: '# 在容器内通过 docker socket 创建新容器\n' +
                        'curl --unix-socket /var/run/docker.sock -X POST \\\n' +
                        '  http://localhost/containers/create \\\n' +
                        '  -H "Content-Type: application/json" \\\n' +
                        '  -d \'{"Image":"alpine","Cmd":["cat","/host/etc/shadow"],\n' +
                        '       "HostConfig":{"Binds":["/:/host:ro","/var/run/docker.sock:/var/run/docker.sock"]}}\'\n' +
                        '# 启动容器获取宿主机文件',
                },
            ],
        },
        validation: {
            indicators: [
                '成功读取宿主机敏感文件 (/etc/shadow)',
                '可以执行宿主机命',
                '容器外进程可访问',
            ],
            successSigns: [
                'mount 操作成功',
                'chroot 进入宿主机环',
                '通过 docker API 创建新容器',
            ],
            falsePositiveSigns: [
                '读取的是容器内同名文件而非宿主机文',
                'mount 命令被 AppArmor/SELinux 阻止',
            ],
        },
        defense: {
            recommendations: [
                '禁止使用 --privileged 模式',
                '不要挂载 Docker socket 到容',
                '使用最小必需 Capability 配置',
                '实施 Seccomp ?AppArmor 策略',
                '使用非 root 用户运行容器',
                '限制挂载点范围',
            ],
            mitigations: [
                '定期更新 Docker 和内核版',
                '使用 rootless Docker',
                '实施容器安全扫描',
                '监控容器异常行为',
            ],
            references: [
                'https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html',
                'https://github.com/carlospolop/hacktricks/blob/master/linux-unix/privilege-escalation/docker-breakout.md',
            ],
        },
        quality: {
            confidence: 0.93,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['cloud-config-audit'],
        phase: 'container-audit',
        runtime: {
          ...DEFAULT_SKILL_RUNTIME,
          requiresNetwork: false,
          estimatedTokens: 2000,
        },
        enabled: true,
    },
];
