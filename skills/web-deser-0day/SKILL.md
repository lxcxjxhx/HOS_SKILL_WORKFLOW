---
name: web-deser-0day
description: "TODO: 由 AI 自主维护更新 - 填入反序列化 0day 的详细描述 适用于: TODO: 由 AI 自主维护更新 - 填入最新反序列化 0day 的触发场景; 示例: 目标使用最新版本的序列化库，存在未公开的 gadget chain"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - deserialization
  - 0day
  - rce
  - gadget-chain
  - java
  - php
  - python
  category: web
  risk-level: critical
  confidence: 0.7
---
# Web Deserialization 0day
TODO: 由 AI 自主维护更新 - 填入反序列化 0day 的详细描述。参照 web-deser-001.ts 的 knowledge.description 格式。
## 何时使用

### 触发场景

- TODO: 由 AI 自主维护更新 - 填入最新反序列化 0day 的触发场景
- 示例: 目标使用最新版本的序列化库，存在未公开的 gadget chain

### 关键词

`反序列化`, `deserialization`, `unserialize`, `readObject`, `gadget chain`, `0day deser`

### 识别指标

- Unexpected class instantiation
- Object construction from serialized data
- Base64-encoded serialized payload in request

### 别名

`反序列化 0day`, `deser 0day`, `gadget chain 0day`

## 操作检查清单

1. TODO: 由 AI 自主维护更新 - 填入操作检查清单
2. 1. 识别目标使用的序列化格式（Java/PHP/Python/Node）
3. 2. 分析反序列化入口点
4. 3. 构造 gadget chain
5. 4. 测试 0day 利用链
6. 5. 验证 RCE 是否成功

## 技术手段

- TODO: 由 AI 自主维护更新 - 填入技术手段

## 实战经验

### 症状

- TODO: 由 AI 自主维护更新 - 填入漏洞触发时的症状/现象

### 根因分析

- TODO: 由 AI 自主维护更新 - 填入根因分析

### 实战观察

- TODO: 由 AI 自主维护更新 - 填入实战观察

### 常见错误

- TODO: 由 AI 自主维护更新 - 填入常见错误

### 补充说明

- TODO: 由 AI 自主维护更新 - 填入补充说明

## 示例

### TODO: 示例名称

TODO: 示例描述

```
TODO: 示例内容
```

**适用场景:**
- TODO: 适用场景

## 验证标准

### 验证指标

- TODO: 由 AI 自主维护更新 - 填入验证指标

### 成功标志

- TODO: 由 AI 自主维护更新 - 填入成功标志

### 误报标志

- TODO: 由 AI 自主维护更新 - 填入误报标志

## 防御建议

### 推荐做法

- TODO: 由 AI 自主维护更新 - 填入推荐做法

### 缓解措施

- TODO: 由 AI 自主维护更新 - 填入缓解措施

## 参考链接

- TODO: 由 AI 自主维护更新 - 填入参考链接
