# Changelog

## [1.0.0] - 2026-08-07

### Added
- 初始版本:ComfyUI 角色立绘序列生成框架
- 场景配置驱动提示词生成器(`gen_stage_prompts.py`),自动唯一性校验
- 展开式 T2I 工作流生成器(`gen_workflow_t2i.py`),规避 Easy-Use 循环竞态 bug
- 3 个示例场景:角色成长 / 怪物进化 / 魔法少女变身
- 验证流程:10 帧小测 → 全量 → 关键帧 MD5 唯一
