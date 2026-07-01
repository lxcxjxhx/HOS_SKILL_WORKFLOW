# GraphQL Injection Detection and Exploitation

**ID**: `api-graphql-injection-001` | **分类**: api | **风险等级**: high

GraphQL 注入利用 GraphQL 查询语言的灵活性，通过 introspection 获取完整 schema 后构造恶意查询，实现数据越权访问、DoS 攻击或 resolver 层注入。与传统 REST API 不同，GraphQL 的单一端点特性使得传统 WAF 规则往往覆盖不足。

## 触发场景

- 目标 API 使用 GraphQL 端点（/graphql, /graphiql, /api/graphql）
- 存在 GraphQL introspection 查询可获取完整 schema
- GraphQL 查询中用户输入未经过滤直接拼接到 resolver 逻辑
- 支持批量查询（batching）可能导致 DoS 或权限绕过

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

## 症状

- GraphQL 端点返回 errors 字段包含数据库错误信息
- Introspection 查询返回完整 schema 结构
- 嵌套查询导致响应时间显著增加（DoS 特征）
- alias 特性可绕过速率限制或字段级权限控制

## 根因分析

- GraphQL introspection 在生产环境未禁用
- Resolver 层未对用户输入进行安全校验
- 查询复杂度限制（depth/complexity）未配置
- 字段级权限控制依赖客户端而非服务端

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

## 成功标志

- 获取到完整的 schema 定义
- 敏感数据通过 GraphQL 查询泄露
- DoS 攻击导致服务响应缓慢或超时

## 防御建议

- 生产环境禁用 introspection
- 配置查询深度限制（建议 max depth 5-10）
- 配置查询复杂度限制（max complexity）
- 对 resolver 层输入进行安全校验
- 实施字段级权限控制
- 限制 batch query 数量和大小
