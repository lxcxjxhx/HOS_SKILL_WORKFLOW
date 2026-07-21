# Medium 格式指南

> Medium 是全球知名的英文写作平台，使用专有富文本编辑器。内容以英文为主，面向国际读者。

---

## 一、文章结构规范

### 1.1 标题
- **Title**：简洁有力，英文标题
- **Subtitle**：副标题，补充说明（可选）
- 标题建议 8-15 个英文单词
- 避免 ALL CAPS，使用 Title Case

### 1.2 文章长度
- 技术文章：1500-4000 词（英文）
- 最佳阅读时间：5-10 分钟
- Medium 会显示预估阅读时间

---

## 二、编辑器特性

### 2.1 Medium 编辑器
Medium 使用专有编辑器，**不支持标准 Markdown**。写作时需注意：

- 使用 `/` 命令调出格式菜单
- 标题：输入 `#` + 空格 生成大标题，`##` + 空格 生成小标题
- 引用：输入 `>` + 空格
- 列表：输入 `-` + 空格
- 代码：选中文字后点击代码按钮

### 2.2 从 Markdown 转换
由于 Medium 不直接支持 Markdown，建议：
1. 先写 Markdown 版本
2. 使用转换工具（如 md2medium）导入
3. 或手动复制粘贴到 Medium 编辑器

---

## 三、代码块

### 3.1 限制
Medium 的代码块功能**有限**：
- 支持基本语法高亮
- 不支持行号
- 长代码可读性较差

### 3.2 最佳实践
- 短代码（< 20 行）直接使用 Medium 代码块
- 长代码使用 **GitHub Gist** 嵌入：
```markdown
<!-- 在 Medium 中点击嵌入按钮，粘贴 Gist URL -->
```
- 或使用代码截图工具（如 Carbon）生成图片

### 3.3 Gist 嵌入步骤
1. 在 [gist.github.com](https://gist.github.com) 创建 Gist
2. 复制 Gist URL
3. 在 Medium 编辑器中点击 `+` → `Embed`
4. 粘贴 Gist URL

---

## 四、图片

### 4.1 插入方式
- 拖拽图片到编辑器
- 点击 `+` → `Image` 上传
- 支持粘贴图片

### 4.2 图片托管
- Medium **自动托管**上传的图片
- 无需外部图床
- 图片 URL 由 Medium 生成

### 4.3 最佳实践
- 封面图尺寸建议 1400×788px（16:9）
- 文内图片宽度建议 700px+
- 使用 Unsplash（Medium 内置集成）获取免费图片
- 添加图片说明（点击图片下方的 caption）

---

## 五、标签系统

### 5.1 规则
- 最多 **5 个**标签（topics）
- 标签为英文
- 选择 Medium 已有的 topic

### 5.2 常用技术标签
- `Programming`, `Python`, `JavaScript`, `Web Development`
- `Machine Learning`, `Data Science`, `Tutorial`
- `Software Engineering`, `Technology`, `Coding`

### 5.3 标签策略
- 混合使用大标签（百万级关注）和小标签（万级关注）
- 大标签增加曝光机会，小标签减少竞争
- 选择与内容高度相关的标签

---

## 六、Publication

### 6.1 什么是 Publication
Publication 是 Medium 的"专栏/杂志"，类似掘金专栏。加入 Publication 可以大幅增加曝光。

### 6.2 热门技术 Publication
- `Towards Data Science`
- `Better Programming`
- `The Startup`
- `Free Code Camp`

### 6.3 投稿流程
1. 先以草稿形式发布文章
2. 联系 Publication 编辑（提交草稿链接）
3. 编辑审核后决定是否发布
4. 不同 Publication 有不同的投稿指南

---

## 七、SEO 与发现

### 7.1 Medium 内部发现
- 标签推荐
- Related 文章推荐
- Publication 曝光
- 编辑推荐（高质量内容）

### 7.2 外部 SEO
- Medium 文章在 Google 排名很高
- 标题包含关键词
- 副标题补充关键词
- 文章 URL 可自定义（发布后不可修改）

---

## 八、写作风格

### 8.1 英文技术写作要点
- 使用简洁明了的英文
- 避免复杂长句
- 多用主动语态
- 适当使用类比解释技术概念
- 代码示例配合文字解释

### 8.2 文章结构建议
1. **Hook**：开头吸引读者（问题/故事/数据）
2. **Context**：背景介绍
3. **Body**：核心内容（分节讲解）
4. **Takeaway**：总结要点
5. **CTA**：引导互动（评论/关注）

---

## 九、发布检查清单

- [ ] 标题简洁有力（8-15 词）
- [ ] 副标题补充说明
- [ ] 封面图已设置（1400×788px）
- [ ] 代码块简短或已转为 Gist
- [ ] 图片清晰且有 caption
- [ ] 标签已选择（最多 5 个）
- [ ] 文章 URL 已自定义（可选）
- [ ] 英文语法已检查
- [ ] 阅读时间合理（5-10 分钟）
- [ ] 已考虑投稿 Publication
