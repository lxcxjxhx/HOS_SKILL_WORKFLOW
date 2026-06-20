/**
 * HOS-Sec-Engine V2 - Test Verification Skill
 * 用于验证 AI 自主创建技能能力的测试 skill
 */

import { AttackDefenseSkill } from '../../../types/skill';

export const testVerifySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'test-verify-001',
      name: 'Test Verification Skill',
      category: 'web',
      subCategory: 'test',
      riskLevel: 'low',
      confidence: 0.9,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['test', 'ai-auto-create', 'verification'],
    },
    trigger: {
      scenarios: [
        '用于验证 AI 自主创建技能能力',
        '测试 SKILL.md 模板编译流程',
        '验证 skill 注册和部署流程',
      ],
      keywords: [
        'test-verify',
        'ai-auto-create',
        'skill verification',
        '测试技能',
      ],
      aliases: [
        'test skill',
        'verification skill',
        'AI 创建测试',
      ],
      indicators: [
        '验证场景',
        'skill creation test',
      ],
    },
    knowledge: {
      description:
        '验证AI能否仅凭SKILL.md模板创建新skill。此skill是用于测试HOS-Sec-Engine技能创建、编译、部署全流程的模拟skill，不包含真实攻击技术。',
      symptoms: [
        '需要验证AI自主创建技能能力',
        '需要测试skill编译流程是否正常',
        '需要验证skill部署到IDE是否生效',
      ],
      rootCauses: [
        '测试流程验证',
        '验证编译系统能否正确处理新skill',
      ],
      observations: [
        '模拟AI自主维护',
        '验证skill从TS到SKILL.md的完整转换流程',
      ],
      commonMistakes: [
        '路径错误',
        '忘记注册到index.ts',
        '忘记重新编译',
      ],
      notes: [
        '此skill仅用于验证，验证后应删除',
        '不要在生产环境中使用',
      ],
    },
    action: {
      checklist: [
        'Step 1: 确认技能创建成功',
        'SKILL.md生成',
        '编译成功',
        '部署成功',
      ],
      techniques: [
        '验证TS文件语法正确',
        '验证编译输出目录结构',
        '验证SKILL.md内容完整性',
      ],
      examples: [
        {
          name: '技能创建验证',
          description: '验证AI创建的skill能否正常编译和部署',
          content:
            '1. 创建TS skill文件\n' +
            '2. 注册到对应index.ts\n' +
            '3. 运行npm run build\n' +
            '4. 检查dist/skills/输出\n' +
            '5. 运行npm run deploy\n' +
            '6. 验证IDE中可识别',
        },
      ],
    },
    validation: {
      indicators: [
        '编译无错误',
        'SKILL.md文件生成成功',
      ],
      successSigns: [
        'SKILL.md出现在dist/skills/和skills/中',
        '编译过程无TS错误',
        'deploy命令执行成功',
      ],
      falsePositiveSigns: [
        '编译警告但非错误',
        '缓存导致旧文件残留',
      ],
    },
    defense: {
      recommendations: [
        '仅用于验证',
        '验证完成后删除测试skill',
      ],
      mitigations: [
        '验证后删除',
        '不要提交到版本控制',
      ],
      references: [
        'dist/skills/master/hos-sec-master/SKILL.md - 技能扩展模板',
      ],
    },
    quality: {
      confidence: 0.9,
      reviewed: false,
      tested: false,
      lastVerified: '2026-06',
    },
    playbooks: [],
    phase: 'reconnaissance',
    enabled: true,
  },
];
