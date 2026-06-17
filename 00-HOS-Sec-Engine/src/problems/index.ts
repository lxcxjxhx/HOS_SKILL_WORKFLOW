/**
 * Problems & Diagnostics Module Index
 * 
 * Exports all diagnostic rules for problem categorization and guided diagnosis.
 */

export { InputValidationDefectsRule } from './input-validation-defects';
export { AuthAuthorizationDefectsRule } from './auth-authorization-defects';
export { DataProtectionDefectsRule } from './data-protection-defects';
export { ConfigDeploymentDefectsRule } from './config-deployment-defects';
export { DependencySupplyChainDefectsRule } from './dependency-supply-chain-defects';
export { BusinessLogicDefectsRule } from './business-logic-defects';

import { InputValidationDefectsRule } from './input-validation-defects';
import { AuthAuthorizationDefectsRule } from './auth-authorization-defects';
import { DataProtectionDefectsRule } from './data-protection-defects';
import { ConfigDeploymentDefectsRule } from './config-deployment-defects';
import { DependencySupplyChainDefectsRule } from './dependency-supply-chain-defects';
import { BusinessLogicDefectsRule } from './business-logic-defects';
import { DiagnosticGuide } from '../schemas/types';

export const allDiagnosticRules: DiagnosticGuide[] = [
  InputValidationDefectsRule,
  AuthAuthorizationDefectsRule,
  DataProtectionDefectsRule,
  ConfigDeploymentDefectsRule,
  DependencySupplyChainDefectsRule,
  BusinessLogicDefectsRule,
];
