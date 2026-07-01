/**
 * HOS-Sec-Engine V2 - MCP Security Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let mcpSecuritySkillList: AttackDefenseSkill[] = [];

try {
  const mod = require('./mcp-security-skill');
  mcpSecuritySkillList = mod.mcpSecuritySkills || [];
} catch (e) {
  // Skill file unavailable
}

export const mcpSecuritySkills: AttackDefenseSkill[] = [
  ...mcpSecuritySkillList,
];
