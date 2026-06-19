/**
 * HOS-Sec-Engine V2 - Kubernetes Security Skills Index
 */

import { AttackDefenseSkill } from '\.\./\.\./types/skill';

let k8sMisconfigSkills: AttackDefenseSkill[] = [];

try {
  const mod = require('./k8s-misconfig');
  k8sMisconfigSkills = mod.k8sMisconfigSkills || [];
} catch (e) {
  // Skill file unavailable
}

export const kubernetesSkills: AttackDefenseSkill[] = [
  ...k8sMisconfigSkills,
];

export { k8sMisconfigSkills };
