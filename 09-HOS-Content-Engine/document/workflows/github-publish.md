# GitHub 发布工作流

> 将项目/代码发布到 GitHub 的标准化工作流。

---

## 1. 工作流概览

```
生成仓库结构 → 创建 README → 添加 LICENSE → 添加 .gitignore → 添加源码/示例 → 推送到 GitHub → 在视频描述中链接
```

---

## 2. 详细步骤

### Step 1: 生成仓库结构

- **动作**:
  1. 创建项目根目录
  2. 生成标准目录结构：

```
[project-name]/
├── src/               # 源代码
│   └── __init__.py
├── tests/             # 测试代码
│   └── __init__.py
├── examples/          # 示例代码
├── docs/              # 文档
├── assets/            # 静态资源
├── requirements.txt   # Python 依赖
├── .gitignore         # Git 忽略规则
├── LICENSE            # 许可证
├── README.md          # 项目说明
└── CONTRIBUTING.md    # 贡献指南（可选）
```

  3. 创建各目录和初始文件

### Step 2: 创建 README

- **调用**: `github-readme.md` 模板
- **动作**:
  1. 从模板生成 README.md
  2. 填写项目信息
  3. 添加代码示例
  4. 更新 Badge 链接
  5. 添加架构图（如适用）
- **质量门**:
  - [ ] 所有占位符已替换
  - [ ] 代码示例可运行
  - [ ] Badge 链接有效

### Step 3: 添加 LICENSE

- **默认**: MIT License
- **动作**:
  1. 生成 MIT LICENSE 文件
  2. 填写年份和版权持有人

```
MIT License

Copyright (c) [YEAR] [COPYRIGHT HOLDER]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Step 4: 添加 .gitignore

- **动作**: 生成适合项目的 .gitignore

#### Python 项目 .gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
ENV/
env/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local

# Testing
.pytest_cache/
.coverage
htmlcov/
```

### Step 5: 添加源码和示例

- **动作**:
  1. 将核心源码放入 `src/`
  2. 添加使用示例到 `examples/`
  3. 确保示例可独立运行
  4. 添加必要的配置文件

### Step 6: 推送到 GitHub

- **动作**:
  1. 初始化 Git 仓库
  2. 创建 GitHub 远程仓库（使用 `gh` CLI 或手动）
  3. 添加远程仓库
  4. 提交所有文件
  5. 推送到 GitHub

```bash
# 初始化仓库
git init
git add .
git commit -m "Initial commit: [project-name]"

# 创建远程仓库（需要 gh CLI）
gh repo create [owner]/[repo-name] --public --source=. --push

# 或手动添加远程
git remote add origin https://github.com/[owner]/[repo-name].git
git branch -M main
git push -u origin main
```

- **质量门**:
  - [ ] 仓库可公开访问
  - [ ] README 正确渲染
  - [ ] 代码示例可运行
  - [ ] LICENSE 已包含

### Step 7: 在视频描述中链接

- **动作**:
  1. 获取仓库 URL
  2. 更新视频元数据中的"相关链接"
  3. 在视频简介中添加 GitHub 链接
  4. 在视频评论中置顶仓库链接

---

## 3. 产出物清单

| 产出物 | 说明 |
|--------|------|
| GitHub 仓库 | 完整可运行的项目仓库 |
| README.md | 项目说明文档 |
| LICENSE | MIT 许可证 |
| .gitignore | Git 忽略规则 |
| 源码 | 核心代码 |
| 示例 | 使用示例 |
| 视频描述链接 | 仓库 URL 已添加 |

---

## 4. 检查清单

发布前最终检查：

- [ ] README 完整且准确
- [ ] LICENSE 已添加
- [ ] .gitignore 配置正确
- [ ] 代码示例可运行
- [ ] 无敏感信息（密钥、密码等）
- [ ] 仓库设为 Public
- [ ] 视频描述已更新
