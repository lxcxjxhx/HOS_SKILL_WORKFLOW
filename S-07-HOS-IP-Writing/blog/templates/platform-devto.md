# Dev.to 格式指南

> Dev.to 是面向开发者的开源社区平台，使用 Markdown 编辑器，支持 Liquid 标签和 Front Matter。

---

## 一、Front Matter（元数据）

### 1.1 必填字段
每篇 Dev.to 文章必须以 YAML Front Matter 开头：

```yaml
---
title: "文章标题"
published: true
cover_image: "封面图URL（可选）"
description: "文章描述（用于SEO和社交分享）"
tags: [tag1, tag2, tag3, tag4]
series: "系列名称（可选）"
---
```

### 1.2 字段说明
| 字段 | 说明 | 限制 |
|------|------|------|
| `title` | 文章标题 | 必填 |
| `published` | 是否发布 | `true` / `false` |
| `cover_image` | 封面图 URL | 可选，建议 1000×420px |
| `description` | 文章描述 | 用于 SEO 和社交分享卡片 |
| `tags` | 标签列表 | **最多 4 个**，逗号分隔 |
| `series` | 系列名称 | 可选，同系列文章使用相同名称 |

---

## 二、标签系统

### 2.1 规则
- 最多 **4 个**标签
- 标签为小写英文
- 使用 Dev.to 已有的标签
- 标签之间用逗号分隔

### 2.2 常用标签
- `javascript`, `python`, `webdev`, `programming`
- `tutorial`, `beginners`, `devops`, `opensource`
- `react`, `node`, `css`, `api`

### 2.3 标签策略
- 选择与内容高度相关的标签
- 混合使用大标签和小标签
- 第一个标签影响文章分类

---

## 三、代码块

### 3.1 标准代码块
````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

### 3.2 带文件名的代码块
Dev.to 支持在代码块中标注文件名：

````markdown
```javascript:app.js
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

### 3.3 支持的语言
与标准 Markdown 一致，支持主流编程语言。

---

## 四、Liquid 标签

Dev.to 支持 **Liquid** 模板语法，可以嵌入丰富的内容：

### 4.1 嵌入链接
```liquid
{% embed https://example.com %}
```

### 4.2 嵌入 Twitter
```liquid
{% twitter tweet_id %}
```

### 4.3 嵌入 YouTube
```liquid
{% youtube video_id %}
```

### 4.4 嵌入 GitHub
```liquid
{% github https://github.com/user/repo %}
```

### 4.5 嵌入 CodePen
```liquid
{% codepen https://codepen.io/user/pen/id %}
```

### 4.6 嵌入 SlideShare
```liquid
{% slideshare key %}
```

### 4.7 用户提及
```liquid
{% user username %}
```

### 4.8 标签提及
```liquid
{% tag javascript %}
```

---

## 五、系列文章

### 5.1 创建系列
在 Front Matter 中设置 `series` 字段：

```yaml
---
title: "Part 1: Getting Started"
tags: [python, tutorial, beginners]
series: "Python Masterclass"
---
```

### 5.2 系列自动关联
- 同一 `series` 名称的文章会自动关联
- 文章底部自动显示系列目录
- 读者可以按顺序阅读

### 5.3 系列命名建议
- 使用清晰的系列名称
- 每篇文章标题包含 Part N
- 系列文章按顺序发布

---

## 六、图片

### 6.1 插入方式
```markdown
![图片描述](图片URL)
```

### 6.2 图片上传
- 直接在编辑器中拖拽或粘贴图片
- Dev.to 自动托管图片
- 也可使用外部图片链接

### 6.3 最佳实践
- 封面图建议 1000×420px
- 文内图片宽度建议 800px+
- 添加有意义的 alt 描述

---

## 七、特殊格式

### 7.1 提示框（使用 Liquid）
```liquid
{% info %}
这是一条信息提示
{% endinfo %}

{% warning %}
这是一条警告提示
{% endwarning %}
```

### 7.2 分割线
```markdown
---
```

### 7.3 表格
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据 | 数据 | 数据 |
```

---

## 八、内容规范

### 8.1 Dev.to 社区文化
- ✅ 开源友好，鼓励分享学习经验
- ✅ 包容性社区，欢迎各水平开发者
- ✅ 鼓励互动和讨论
- ✅ 支持个人品牌建设

### 8.2 注意事项
- ✅ 原创内容或注明出处
- ✅ 代码示例可运行
- ✅ 结构清晰，有代码有讲解
- ❌ 避免纯营销内容
- ❌ 避免过于基础的内容（如 Hello World）

---

## 九、SEO 与发现

### 9.1 Dev.to 内部
- 标签推荐
- 系列文章自动关联
- 社区互动（点赞、评论、收藏）

### 9.2 外部 SEO
- Dev.to 文章在 Google 排名良好
- Front Matter 的 `description` 用于 meta description
- 标题包含关键词

---

## 十、发布检查清单

- [ ] Front Matter 格式正确
- [ ] 标题清晰，包含关键词
- [ ] description 已填写（用于 SEO）
- [ ] 标签已选择（最多 4 个）
- [ ] 封面图已设置（可选）
- [ ] 代码块标注了语言
- [ ] Liquid 标签语法正确
- [ ] 系列名称已设置（如适用）
- [ ] 文章已预览确认格式正确
- [ ] published 设为 true
