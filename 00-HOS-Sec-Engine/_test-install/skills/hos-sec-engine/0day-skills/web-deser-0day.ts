/**
 * HOS-Sec-Engine V2 - Web Deserialization 0day Skills
 * 反序列化 0day 专项 Skill 模板
 * 
 * TODO: 由 AI 通过 hos-sec-master 自主维护更新具体内容
 * 使用 /hos-sec-master 指令，通过 web search 获取最新 0day 漏洞信息后填充
 */

import { AttackDefenseSkill } from '../../../types/skill';

export const deser0daySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-deser-0day',
      name: 'Web Deserialization 0day',
      category: 'web',
      subCategory: 'deserialization',
      riskLevel: 'critical',
      confidence: 0.7,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['deserialization', '0day', 'rce', 'gadget-chain', 'java', 'php', 'python'],
    },
    trigger: {
      scenarios: [
        'TODO: 由 AI 自主维护更新 - 填入最新反序列化 0day 的触发场景',
        '示例: 目标使用最新版本的序列化库，存在未公开的 gadget chain',
      ],
      keywords: [
        '反序列化',
        'deserialization',
        'unserialize',
        'readObject',
        'gadget chain',
        '0day deser',
      ],
      aliases: [
        '反序列化 0day',
        'deser 0day',
        'gadget chain 0day',
      ],
      indicators: [
        'Unexpected class instantiation',
        'Object construction from serialized data',
        'Base64-encoded serialized payload in request',
      ],
    },
    knowledge: {
      description:
        'TODO: 由 AI 自主维护更新 - 填入反序列化 0day 的详细描述。参照 web-deser-001.ts 的 knowledge.description 格式。',
      symptoms: [
        'TODO: 由 AI 自主维护更新 - 填入漏洞触发时的症状/现象',
      ],
      rootCauses: [
        'TODO: 由 AI 自主维护更新 - 填入根因分析',
      ],
      observations: [
        'TODO: 由 AI 自主维护更新 - 填入实战观察',
      ],
      commonMistakes: [
        'TODO: 由 AI 自主维护更新 - 填入常见错误',
      ],
      notes: [
        'TODO: 由 AI 自主维护更新 - 填入补充说明',
      ],
    },
    action: {
      checklist: [
        'TODO: 由 AI 自主维护更新 - 填入操作检查清单',
        '1. 识别目标使用的序列化格式（Java/PHP/Python/Node）',
        '2. 分析反序列化入口点',
        '3. 构造 gadget chain',
        '4. 测试 0day 利用链',
        '5. 验证 RCE 是否成功',
      ],
      techniques: [
        'TODO: 由 AI 自主维护更新 - 填入技术手段',
      ],
      examples: [
        {
          name: 'TODO: 示例名称',
          description: 'TODO: 示例描述',
          content: 'TODO: 示例内容',
          applicableScenarios: ['TODO: 适用场景'],
        },
      ],
    },
    validation: {
      indicators: [
        'TODO: 由 AI 自主维护更新 - 填入验证指标',
      ],
      successSigns: [
        'TODO: 由 AI 自主维护更新 - 填入成功标志',
      ],
      falsePositiveSigns: [
        'TODO: 由 AI 自主维护更新 - 填入误报标志',
      ],
    },
    defense: {
      recommendations: [
        'TODO: 由 AI 自主维护更新 - 填入推荐做法',
      ],
      mitigations: [
        'TODO: 由 AI 自主维护更新 - 填入缓解措施',
      ],
      references: [
        'TODO: 由 AI 自主维护更新 - 填入参考链接',
      ],
    },
    quality: {
      confidence: 0.7,
      reviewed: false,
      tested: false,
      lastVerified: '2026-06',
    },
    playbooks: ['web-pentest-full'],
    phase: 'exploitation',
    enabled: true,
  },
];
