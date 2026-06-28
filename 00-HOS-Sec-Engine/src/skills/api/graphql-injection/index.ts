/**
 * HOS-Sec-Engine V2 - GraphQL Injection Skills Index
 */

import { AttackDefenseSkill } from '../../../types/skill';

let graphQLInjectionSkills: AttackDefenseSkill[] = [];
try {
  const mod = require('./graphql-injection-skill');
  graphQLInjectionSkills = mod.graphQLSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const graphQLSkills: AttackDefenseSkill[] = [
  ...graphQLInjectionSkills,
];

export { graphQLInjectionSkills };
