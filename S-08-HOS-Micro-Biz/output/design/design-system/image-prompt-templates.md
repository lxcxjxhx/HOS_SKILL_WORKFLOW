# HOS 对外获客 — GenerateImage Prompt 模板库

> 所有 prompt 遵循风信子视觉系统：深紫罗兰(#5B2C91/#7C3AED) + 勃艮第红(#8B1A3C) + 青铜绿(#3D5A4C) + 暗背景高对比。
> 配色占比校验：暗背景≥55% / 紫系25-30% / 红≤10% / 绿≤10% / 金≤3%。
> GenerateImage 生成的图片文字不可靠，文字一律在 .design 画布上叠加文字图层。

---

## 一、风信子质感描述词库（通用插入段）

```
dark background #0F0A1F, close-up hyacinth flower petals texture,
deep violet #5B2C91 to #7C3AED gradient petals, burgundy red #8B1A3C accents,
bronze green #3D5A4C stems and leaves, water droplets on petals,
organic botanical macro photography, high contrast, premium tech aesthetic,
moody cinematic lighting, 4k, no text, no watermark
```

**按场景裁剪**：
- 背景肌理用：`hyacinth petal texture overlay 10% opacity, subtle, as background`
- 主视觉用：`full hyacinth inflorescence, dewy petals, dramatic side light`
- 图标点缀用：`single hyacinth petal as icon shape, minimalist, bronze green outline`

---

## 二、四类 Prompt 模板

### 1. 主视觉（Hero / KV 区背景）

```
[PURPOSE]: 电商详情页顶部主视觉背景图
dark background #0F0A1F, close-up hyacinth flower inflorescence in full bloom,
deep violet #5B2C91 to #7C3AED gradient petals with dewdrops,
burgundy red #8B1A3C petal edges, bronze green #3D5A4C stem,
moody cinematic side lighting, high contrast, premium technology aesthetic,
botanical macro photography style, subtle violet glow on petals,
centered composition with darker negative space around edges for text overlay,
4k, no text, no watermark, no human
```

**尺寸建议**：750×1000 px（详情页 KV）/ 1080×1440 px（小红书封面）

---

### 2. 详情页模块图（功能说明/服务流程/案例展示背景）

```
[PURPOSE]: 详情页模块区背景图
dark violet background #1A1129, minimalist tech illustration style,
[具体内容：如 abstract code editor screen / data flow lines / shield icon],
bronze green #3D5A4C iconography and line art,
burgundy red #8B1A3C highlight accents on key elements,
subtle hyacinth petal texture at 8% opacity in corners,
premium dark UI dashboard aesthetic, soft violet ambient glow,
high contrast, no text, no watermark, 4k
```

**按产品线替换 `[具体内容]`**：
- 课设毕设：`abstract code editor with syntax highlighting glow, floating code brackets`
- AI 应用：`neural network nodes with data flow lines, abstract brain-like structure`
- 信息安全：`stylized shield with lock icon, cyber defense abstract`
- 全四类：`four-quadrant composition, code/AI/security/computer icons in each quadrant`

---

### 3. 商品主图（闲鱼首图/拼多多主图背景）

```
[PURPOSE]: 电商商品主图背景，需留白叠加 HOS logo + 大字标题 + 价格
dark background #0F0A1F, single hyacinth stem rising from bottom right corner,
deep violet petals with dewdrops catching light,
bronze green leaves, burgundy red petal tips,
large empty negative space in upper-left and center for text overlay,
premium product photography lighting, soft violet ambient glow,
high contrast, minimal composition, 4k, no text, no watermark
```

**尺寸建议**：800×800 px（主图）/ 750×1000 px（引流图）

---

### 4. 促销海报背景

```
[PURPOSE]: 促销海报背景，需留白叠加折扣/限时/二维码
dark violet gradient background #0F0A1F to #241638,
dramatic hyacinth petals arranged as vertical frame on left and right edges,
deep violet and burgundy red petals with bronze green stems,
central empty space for promotional text,
golden #FFB347 light particles scattered subtly,
cinematic moody lighting, premium sale poster aesthetic,
high contrast, 4k, no text, no watermark
```

**尺寸建议**：1080×1920 px（海报）

---

## 三、按产品线定制化词库

### 课设/毕设代做
- 场景词：`university campus ambient, student desk with laptop, code on screen glow`
- 技术词：`Python/Java code snippets abstract, syntax highlighting purple/green`
- 情绪词：`focused, academic, supportive, mentor-like`
- 禁用词：`exam, cheating, ghost writing（红线）`

### AI 应用开发
- 场景词：`abstract data center, server room blue-violet glow, neural network visualization`
- 技术词：`LLM tokens flowing, RAG knowledge graph nodes, agent decision tree`
- 情绪词：`futuristic, intelligent, powerful, cutting-edge`
- 禁用词：`specific brand logos, copyrighted character`

### 信息安全服务
- 场景词：`digital fortress, cyber shield barrier, locked server room`
- 技术词：`authorization badge icon, penetration testing scope diagram, encrypted data stream`
- 情绪词：`professional, authorized, defensive, trustworthy`
- 禁用词：`hacker hooded figure, illegal attack scene, real vulnerability payload（红线）`

### 全四类综合
- 场景词：`four-quadrant split composition, HOS ecosystem constellation`
- 技术词：`code bracket + AI node + shield + computer chip, connected by violet lines`
- 情绪词：`comprehensive, one-stop, ecosystem, authoritative`
- 禁用词：`cluttered chaos, more than four domains`

---

## 四、文字叠加规范（在 .design 画布完成，非 GenerateImage）

| 元素 | 字体 | 颜色 | 字号(移动端) |
|------|------|------|-------------|
| HOS Logo | `--font-display` | `--ink-primary` #F5F0FF | 28px |
| 主标题 | `--font-display` | `--ink-primary` | 36-48px |
| 卖点短句 | `--font-body` | `--ink-secondary` #C4B5E0 | 18px |
| 价格数字 | `--font-mono` | `--price-anchor` #FFB347 | 32px |
| 红线声明 | `--font-body` | `--hos-burgundy` #8B1A3C | 14px |
| CTA 按钮 | `--font-body` | `--ink-on-violet` 白 | 18px，紫底 |

**三色色带**：所有图片顶部/底部叠加 4px 高 `--brand-band-gradient`（紫-红-绿三等分）。

---

## 五、质量校验清单

- [ ] 暗背景占比 ≥55%（肉眼比对，深色区域为主）
- [ ] 紫系色彩 25-30%（风信子紫为主视觉）
- [ ] 勃艮第红 ≤10%（仅警示/价格前缀）
- [ ] 青铜绿 ≤10%（仅图标/流程）
- [ ] 金色 ≤3%（仅价格数字）
- [ ] 无 GenerateImage 残留文字（如有，视为背景肌理，文字以画布叠加为准）
- [ ] 含风信子有机质感（花瓣/水珠/茎叶至少一项）
- [ ] 移动端可读（文字叠加后对比度 ≥4.5:1）
