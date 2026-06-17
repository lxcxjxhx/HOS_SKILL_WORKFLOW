/**
 * Penetration Test Rules Index
 * 
 * Exports all penetration test rules (PT series).
 */

export { ReconnaissanceRule } from './reconnaissance';
export { AuthenticationBypassRule } from './auth-bypass';
export { PrivilegeEscalationRule } from './privilege-escalation';
export { BusinessLogicFlawsRule } from './business-logic';
export { APIAbuseRule } from './api-abuse';
export { SocialEngineeringRule } from './social-engineering';
export { InfrastructureAttackRule } from './infrastructure-attack';

/**
 * Complete penetration test rules collection
 */
export const PenetrationTestRules = [
  { id: 'PT-001', name: 'Information Gathering / Reconnaissance' },
  { id: 'PT-002', name: 'Authentication Bypass Testing' },
  { id: 'PT-003', name: 'Privilege Escalation Testing' },
  { id: 'PT-004', name: 'Business Logic Flaws' },
  { id: 'PT-005', name: 'API Abuse Testing' },
  { id: 'PT-006', name: 'Social Engineering Attack Surface' },
  { id: 'PT-007', name: 'Infrastructure Attack Vectors' },
];
