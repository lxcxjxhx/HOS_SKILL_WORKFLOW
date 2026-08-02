# PR 描述模板（含强制 AI Disclosure）

> 复制本模板，填写后作为 PR 描述。**AI Disclosure 段为强制项，不得删除。**

```markdown
## Motivation
[问题背景和重要性，使用具体数据和示例，说明"为什么需要这个改动"]

## Changes
[改动内容，按文件/模块列出具体改动]

## Testing
[测试方法和结果，提供可复现的步骤]

## Checklist
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated (if applicable)
- [ ] No new dependencies introduced (or justified)
- [ ] Changes are backward compatible

## AI Disclosure（强制，不得省略）
This PR was drafted with the assistance of an AI skill (HOS-GH-ContribOS) and has been **manually reviewed line-by-line by the human author** before submission — every diff was read, tests were run, and the semantics of the change are understood by the author, who takes full responsibility for the content.
```

> **真实底线**：披露必须与事实一致。人工未实际逐条审核 → 先补审核再提交。诚实披露 + 展示理解 = 诚恳；隐瞒 + 机械改动 = 被判定"纯 AI PR"进黑名单。
