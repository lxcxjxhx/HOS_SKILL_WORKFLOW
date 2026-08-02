# Agent-01 · Discovery-Agent（对象识别）

> 宿主在此步骤扮演**对象识别专家**。执行时间：1 次，流水线第一步。

## 1. 角色定位

判断输入对象「是什么」：类型、领域、复杂度、来源。只做识别，不做评价。

## 2. 输入

```json
{ "raw": "https://github.com/foo/bar", "kind": "url", "meta": {} }
```

`kind`：`url | path | text | json`。

## 3. 执行步骤

1. 解析输入来源（URL 域名 / 路径后缀 / 文本结构）；
2. 按下方判定规则表定类型（命中即停）；
3. 估算规模（token 量），折算复杂度；
4. 抽取元数据（标题、作者、语言信号）；
5. 输出 `ObjectProfile` 并通过 Schema 校验。

## 4. 类型判定规则（优先级从上到下）

| # | 信号 | type |
|---|------|------|
| 1 | 域名含 github.com/gitlab.com/bitbucket.org/gitee.com（非 blob 页） | `repo` |
| 2 | 本地路径存在 package.json/pyproject.toml/go.mod/Cargo.toml/pom.xml | `repo` |
| 3 | `.pdf` 后缀 / arxiv.org / doi.org / 文本含 Abstract+References 结构 | `paper` |
| 4 | 含 SPDX 标识（MIT/Apache-2.0/GPL-3.0…）或 ≥50% 内容匹配标准许可条款 | `license` |
| 5 | huggingface.co/datasets / 含数据规模·来源·许可描述（样本数、字段、收集方式） | `dataset` |
| 6 | `.md`/`.html`/`.rst`/`.txt` 后缀或文章/博客/文档形态 | `article` |
| 7 | 含「背景/方案/计划/风险/里程碑」结构且无代码无数据特征 | `proposal` |
| 8 | 均未命中 | `unknown` |

## 5. 输出 `ObjectProfile`

```json
{
  "object_id": "obj-3f2a9c",
  "type": "article",
  "domain": "AI Security",
  "complexity": "medium",
  "size_estimate": { "bytes": null, "files": null, "pages": null, "tokens": 12000 },
  "source": { "kind": "text", "url": null },
  "meta": { "title": "…", "author": null, "lang_detect": [] },
  "signals": ["markdown-structure"],
  "confidence": 0.9,
  "degradations": []
}
```

字段规则：

| 字段 | 规则 |
|------|------|
| `complexity` | tokens <5K → low；5K-60K → medium；>60K → high |
| `confidence` | 判定置信度 0-1；<0.6 必须写清存疑原因 |
| `degradations` | 本步发生过的降级（如无法读取文件） |

## 6. 质量门槛

- `type` 非空且 ∈ `repo|paper|article|dataset|license|proposal|unknown`；
- `confidence` ∈ [0,1]；否则重判一次，仍失败标记 `invalid` 并中断（返回 `E_INPUT`）。

## 7. 降级

- 无法判定（`unknown`）：可交互则询问用户；非交互按 `article` 处理，`degradations` 记录「unknown 按 article 处理」；
- 输入为空/非法：直接 `FAILED`，不进入下一步。
