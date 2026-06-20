---
name: test-verify-001
description: "验证AI能否仅凭SKILL 适用于: 用于验证 AI 自主创建技能能力; 测试 SKILL.md 模板编译流程; 验证 skill 注册和部署流程"
license: MIT
metadata:
  author: HOS-Sec-Engine
  version: 2026-06
  tags:
  - test
  - ai-auto-create
  - verification
  category: web
  risk-level: low
  confidence: 0.9
---
# Test Verification Skill
验证AI能否仅凭SKILL.md模板创建新skill。此skill是用于测试HOS-Sec-Engine技能创建、编译、部署全流程的模拟skill，不包含真实攻击技术。
## 何时使用

### 触发场景

- 用于验证 AI 自主创建技能能力
- 测试 SKILL.md 模板编译流程
- 验证 skill 注册和部署流程

### 关键词

`test-verify`, `ai-auto-create`, `skill verification`, `测试技能`

### 识别指标

- 验证场景
- skill creation test

### 别名

`test skill`, `verification skill`, `AI 创建测试`

## 操作检查清单

1. Step 1: 确认技能创建成功
2. SKILL.md生成
3. 编译成功
4. 部署成功

## 技术手段

- 验证TS文件语法正确
- 验证编译输出目录结构
- 验证SKILL.md内容完整性

## 实战经验

### 症状

- 需要验证AI自主创建技能能力
- 需要测试skill编译流程是否正常
- 需要验证skill部署到IDE是否生效

### 根因分析

- 测试流程验证
- 验证编译系统能否正确处理新skill

### 实战观察

- 模拟AI自主维护
- 验证skill从TS到SKILL.md的完整转换流程

### 常见错误

- 路径错误
- 忘记注册到index.ts
- 忘记重新编译

### 补充说明

- 此skill仅用于验证，验证后应删除
- 不要在生产环境中使用

## 示例

### 技能创建验证

验证AI创建的skill能否正常编译和部署

```
1. 创建TS skill文件
2. 注册到对应index.ts
3. 运行npm run build
4. 检查dist/skills/输出
5. 运行npm run deploy
6. 验证IDE中可识别
```

## 验证标准

### 验证指标

- 编译无错误
- SKILL.md文件生成成功

### 成功标志

- SKILL.md出现在dist/skills/和skills/中
- 编译过程无TS错误
- deploy命令执行成功

### 误报标志

- 编译警告但非错误
- 缓存导致旧文件残留

## 防御建议

### 推荐做法

- 仅用于验证
- 验证完成后删除测试skill

### 缓解措施

- 验证后删除
- 不要提交到版本控制

## 参考链接

- dist/skills/master/hos-sec-master/SKILL.md - 技能扩展模板
