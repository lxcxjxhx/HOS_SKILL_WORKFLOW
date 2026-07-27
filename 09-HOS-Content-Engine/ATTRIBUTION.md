# Open Source Attribution — 开源归属声明

> 09-HOS-Content-Engine 各模块的原创性声明和方法论引用。

---

## 模块归属

| 模块 | 归属 | 说明 |
|------|------|------|
| `discover/` | **完全自研** | 数据采集、趋势评分、选题筛选均为原创实现 |
| `dissect/` | **完全自研** | 安全审计视角集成 00-HOS-Sec-Engine，分析框架为原创 |
| `develop/` | **完全自研** | PR 规划、开发日志、review 管理均为原创实现 |
| `document/` | **完全自研** | 编排调用 06-HOS-Fuck-Demo 和 07-HOS-IP-Writing/blog |
| `shared/` | **完全自研** | Context Protocol、Quality Gates 等均为原创设计 |
| `pipelines/` | **完全自研** | 4D 流水线编排为原创设计 |
| `config/` | **完全自研** | 数据源配置和全局设置为原创设计 |

---

## 方法论引用

本项目在以下方面参考了外部方法论和框架：

### MITRE ATT&CK
- **引用位置**: `dissect/` 安全分析阶段
- **引用内容**: 攻击战术和技术编号映射框架
- **许可**: MITRE ATT&CK 由 MITRE Corporation 维护，公开可用
- **官网**: https://attack.mitre.org/

### B站创作者生态
- **引用位置**: `shared/bilibili-spec.md`
- **引用内容**: 平台内容规格、发布策略、标签体系参考 B 站创作者学院建议
- **说明**: 基于 B 站官方创作者指南和社区最佳实践总结

### Conventional Commits
- **引用位置**: `develop/` 开发阶段
- **引用内容**: Commit message 规范
- **许可**: ISC License
- **官网**: https://www.conventionalcommits.org/

### 内容营销 4H 模型
- **引用位置**: `shared/content-pillars.md` 内容支柱设计
- **引用内容**: 内容分类框架参考 4H 模型（Hero, Hub, Hygiene, Help）
- **说明**: 将 4H 模型适配至技术内容创作场景

---

## 技能依赖归属

| 依赖技能 | 用途 | 归属 |
|---------|------|------|
| 00-HOS-Sec-Engine | 安全审计分析引擎 | HOS 自研 |
| 06-HOS-Fuck-Demo | Demo 视频生成 | HOS 自研 |
| 07-HOS-IP-Writing/blog | 博客内容写作 | HOS 自研 |

---

## License

```
MIT License

Copyright (c) 2026 HOS

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
