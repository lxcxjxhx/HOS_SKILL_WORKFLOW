/**
 * HOS-Sec-Engine V2 - CPS AI Agent Security Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let cpsAiAgentSecuritySkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./ai-agent-security-skill');
  cpsAiAgentSecuritySkillList = mod.cpsAiAgentSecuritySkills || [];
} catch (e) {
  // Skill file unavailable
}

export const cpsAiAgentSecuritySkills: AttackDefenseSkill[] = [
  ...cpsAiAgentSecuritySkillList,
];
