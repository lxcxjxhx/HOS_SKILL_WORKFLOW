/**
 * HOS-Sec-Engine V2 - Web Authentication Bypass 0day Skills
 * 认证绕过 0day 专项 Skill 模板
 * 
 * TODO: 由 AI 通过 hos-sec-master 自主维护更新具体内容
 * 使用 /hos-sec-master 指令，通过 web search 获取最新 0day 漏洞信息后填充
 */

import { AttackDefenseSkill } from '../../../types/skill';

export const authBypass0daySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-auth-bypass-0day',
      name: 'Web Authentication Bypass 0day',
      category: 'web',
      subCategory: 'authentication',
      riskLevel: 'critical',
      confidence: 0.7,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['authentication', 'bypass', '0day', 'login', 'session', 'token'],
    },
    trigger: {
      scenarios: [
        'TODO: 由 AI 自主维护更新 - 填入最新认证绕过 0day 的触发场景',
        '示例: 目标使用最新版本的 JWT/OAuth/Session 认证，存在未公开的绕过方式',
      ],
      keywords: [
        '认证绕过',
        'authentication bypass',
        'login bypass',
        'session hijack',
        'token manipulation',
        '0day auth',
      ],
      aliases: [
        '认证绕过 0day',
        'auth 0day',
        'login 0day',
      ],
      indicators: [
        '200 OK without valid credentials',
        'unexpected session creation',
        'token validation skipped',
      ],
    },
    knowledge: {
      description:
        'TODO: 由 AI 自主维护更新 - 填入认证绕过 0day 的详细描述。参照 web-sqli-001.ts 的 knowledge.description 格式。',
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
        '1. 识别目标认证机制类型（JWT/OAuth/Session/Basic）',
        '2. 分析认证流程中的关键节点',
        '3. 测试 0day 绕过技术',
        '4. 验证绕过是否在应用层生效',
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
