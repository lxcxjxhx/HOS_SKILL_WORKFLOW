/**
 * HOS-Sec-Engine V2 - Web XSS 0day Skills
 * XSS 过滤 0day 专项 Skill 模板
 * 
 * TODO: 由 AI 通过 hos-sec-master 自主维护更新具体内容
 * 使用 /hos-sec-master 指令，通过 web search 获取最新 0day 漏洞信息后填充
 */

import { AttackDefenseSkill } from '../../../types/skill';

export const xss0daySkills: AttackDefenseSkill[] = [
  {
    metadata: {
      id: 'web-xss-0day',
      name: 'Web XSS Filter 0day',
      category: 'web',
      subCategory: 'xss',
      riskLevel: 'high',
      confidence: 0.7,
      updatedAt: '2026-06',
      author: 'HOS-Sec-Engine',
      tags: ['xss', '0day', 'filter-bypass', 'csp-bypass', 'dom-xss', 'stored-xss'],
    },
    trigger: {
      scenarios: [
        'TODO: 由 AI 自主维护更新 - 填入最新 XSS 过滤 0day 的触发场景',
        '示例: 目标使用最新的 CSP 策略/WAF XSS 过滤，存在未公开的绕过方式',
      ],
      keywords: [
        'xss绕过',
        'xss bypass',
        'csp bypass',
        'filter bypass',
        '0day xss',
        'dom xss',
        'stored xss',
      ],
      aliases: [
        'XSS 0day',
        'xss filter bypass 0day',
        'csp 0day',
      ],
      indicators: [
        'Reflected input in HTML context',
        'CSP violation report',
        'XSS filter blocked payload',
      ],
    },
    knowledge: {
      description:
        'TODO: 由 AI 自主维护更新 - 填入 XSS 过滤 0day 的详细描述。参照 web-xss-001.ts 的 knowledge.description 格式。',
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
        '1. 确定 XSS 注入点上下文（HTML/Attribute/JS/CSS）',
        '2. 分析过滤规则和 CSP 策略',
        '3. 测试 0day 绕过 payload',
        '4. 验证 XSS 是否成功执行',
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
