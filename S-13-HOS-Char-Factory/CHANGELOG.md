# Changelog

本模块版本遵循语义化版本（SemVer）。

## [0.1.0] - 2026-08-06

### Added
- 首个正式版本：五 Agent 流水线（Planner → PromptEngineer → Runner → Inspector → Packager）
- 五个标准工作流：定稿 / 50 帧差分链 / 白底抠图 / 三视图 / 变身动画
- 12 差分槽 TAG 系统（references/tag-slots.md）
- NSFW/SFW 双内容模式 + 硬护栏（references/nsfw-sfw-policy.md）
- 可运行 `src/` 脚本：ComfyUI 客户端 + 五阶段命令
- 插件清单收录 ComfyUI-RMBG / IPAdapter-Plus / ControlNet / Diffusion-2D-Seg
- Plan / PromptSheet / Output 三份 JSON schema 契约
- 单元测试：schema 校验 + 程序化抠图
