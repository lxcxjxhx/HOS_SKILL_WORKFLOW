---
name: api-graphql-injection-001
description: "GraphQL 注入利用 GraphQL 查询语言的灵活性，通过 introspection 获取完整 schema 后构造恶意查询，实现数据越权访问、DoS 攻击或 resolver 层注入 适用于: 目标 API 使用 GraphQL 端点（/graphql, /graphiql, /api/graphql）; 存在 GraphQL introspection 查询可获取完整 schema; GraphQL 查询中用户输入未经过滤直接拼接到 resolver 逻辑"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - graphql
  - injection
  - api
  - introspection
  - dos
  - batching
  category: api
  risk-level: high
  confidence: 0.89
---
# GraphQL Injection Detection and Exploitation
GraphQL 注入利用 GraphQL 查询语言的灵活性，通过 introspection 获取完整 schema 后构造恶意查询，实现数据越权访问、DoS 攻击或 resolver 层注入。与传统 REST API 不同，GraphQL 的单一端点特性使得传统 WAF 规则往往覆盖不足。
## 何时使用

### 触发场景

- 目标 API 使用 GraphQL 端点（/graphql, /graphiql, /api/graphql）
- 存在 GraphQL introspection 查询可获取完整 schema
- GraphQL 查询中用户输入未经过滤直接拼接到 resolver 逻辑
- 支持批量查询（batching）可能导致 DoS 或权限绕过

### 关键词

`graphql`, `graphiql`, `graphql injection`, `introspection`, `graphql query`, `apollo`, `relay`

### 识别指标

- __typename
- __schema
- __type
- errors
- extensions

### 别名

`GraphQL 注入`, `graphql security`, `graphql bypass`

## 操作检查清单

1. 探测 GraphQL 端点路径（/graphql, /graphiql, /api/graphql）
2. 测试 introspection 是否可用
3. 获取完整 schema 结构
4. 分析敏感字段和 mutation 操作
5. 测试嵌套查询 DoS 攻击
6. 测试 alias 绕过速率限制
7. 测试 batch query 绕过
8. 检查 resolver 层注入可能性

## 技术手段

- Introspection 查询获取完整 schema
- 嵌套查询深度攻击（depth-first DoS）
- Alias 批量绕过字段限制
- Batch query 绕过速率限制
- Resolver 层 SQL/NoSQL 注入测试

## 实战经验

### 症状

- GraphQL 端点返回 errors 字段包含数据库错误信息
- Introspection 查询返回完整 schema 结构
- 嵌套查询导致响应时间显著增加（DoS 特征）
- alias 特性可绕过速率限制或字段级权限控制

### 根因分析

- GraphQL introspection 在生产环境未禁用
- Resolver 层未对用户输入进行安全校验
- 查询复杂度限制（depth/complexity）未配置
- 字段级权限控制依赖客户端而非服务端

### 实战观察

- 大部分 GraphQL 实现默认开启 introspection
- 嵌套查询深度限制通常设置为 10-20，可通过 alias 绕过
- Batch query 特性常被用于绕过单请求速率限制

### 常见错误

- 仅检测 /graphql 路径，忽略 /api/graphql 等变体
- 未考虑 alias 特性对速率限制的绕过能力
- 误认为 GraphQL 自动防注入，resolver 层仍需安全校验

### 补充说明

- GraphQL 安全测试需关注 schema 设计和 resolver 实现
- Apollo Server 和 GraphQL Yoga 的安全配置差异较大

## 示例

### Introspection 查询获取 Schema

通过标准 introspection 查询获取完整 GraphQL schema

```
query IntrospectionQuery {
  __schema {
    types {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```

**适用场景:**
- 所有 GraphQL 端点，默认开启 introspection 时

### 嵌套查询 DoS 攻击

利用深层嵌套查询消耗服务器资源

```
query DoSAttack {
  users {
    posts {
      comments {
        author {
          posts {
            comments {
              # 继续嵌套...
            }
          }
        }
      }
    }
  }
}
```

**适用场景:**
- 未配置查询复杂度限制的 GraphQL 服务

## 验证标准

### 验证指标

- Introspection 查询返回有效 schema 结构
- 嵌套查询导致响应时间超过 5 秒
- errors 字段暴露内部实现细节
- Alias 查询成功绕过字段限制

### 成功标志

- 获取到完整的 schema 定义
- 敏感数据通过 GraphQL 查询泄露
- DoS 攻击导致服务响应缓慢或超时

### 误报标志

- 响应包含 errors 但为 GraphQL 正常校验错误
- 响应时间增加由网络波动导致

## 防御建议

### 推荐做法

- 生产环境禁用 introspection
- 配置查询深度限制（建议 max depth 5-10）
- 配置查询复杂度限制（max complexity）
- 对 resolver 层输入进行安全校验
- 实施字段级权限控制
- 限制 batch query 数量和大小

### 缓解措施

- 使用 GraphQL 安全中间件（如 graphql-shield）
- 实施查询超时机制
- 对敏感 mutation 操作实施额外认证
- 启用 GraphQL 审计日志

## 参考链接

- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-API_Testing/01-Testing_GraphQL
- https://github.com/doyensec/graph-ql
- https://www.apollographql.com/docs/graphql-tools/resolvers
