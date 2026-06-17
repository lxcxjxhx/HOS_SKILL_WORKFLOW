/**
 * Attack Path Analysis Schema Definitions
 * 
 * Structures for building and analyzing attack paths during penetration testing.
 * Connects individual findings into complete attack chains.
 */

import { SeverityLevel } from './types';

// ============================================================================
// Entry Point Definition
// ============================================================================

export interface EntryPoint {
  /** Unique identifier for this entry point */
  id: string;

  /** Entry point type */
  type: 'public-api' | 'web-form' | 'file-upload' | 'api-key' | 'auth-endpoint' | 'third-party-integration';

  /** Description of how an attacker enters the system */
  description: string;

  /** URL or endpoint path */
  endpoint?: string;

  /** Required conditions to use this entry point */
  prerequisites: string[];

  /** Initial access complexity */
  complexity: 'Low' | 'Medium' | 'High';

  /** Authentication required */
  requiresAuth: boolean;

  /** Related findings that can be initiated from this entry point */
  relatedFindings: string[];
}

// ============================================================================
// Vulnerability Chain Definition
// ============================================================================

export interface VulnChainLink {
  /** Order in the chain */
  step: number;

  /** Finding ID that this step uses */
  findingId: string;

  /** What this step achieves */
  objective: string;

  /** How this step is performed */
  technique: string;

  /** Prerequisites from previous steps */
  dependsOn: number[];

  /** Output that enables next steps */
  output: string;

  /** Estimated effort */
  effort: 'Trivial' | 'Easy' | 'Moderate' | 'Difficult';
}

export interface VulnerabilityChain {
  /** Chain identifier */
  id: string;

  /** Chain name/description */
  name: string;

  /** Entry point that starts this chain */
  entryPointId: string;

  /** Sequence of vulnerability steps */
  links: VulnChainLink[];

  /** Final impact of completing this chain */
  finalImpact: string;

  /** Overall chain complexity */
  overallComplexity: 'Low' | 'Medium' | 'High' | 'Critical';

  /** Estimated time to complete */
  estimatedTime: string;
}

// ============================================================================
// Impact Assessment Definition
// ============================================================================

export interface ImpactAssessment {
  /** Assessment identifier */
  id: string;

  /** Related vulnerability chain */
  chainId: string;

  // ────── CIA Triad Impact ──────

  /** Confidentiality impact */
  confidentialityImpact: {
    level: 'None' | 'Low' | 'High';
    description: string;
    dataAffected: string[];
  };

  /** Integrity impact */
  integrityImpact: {
    level: 'None' | 'Low' | 'High';
    description: string;
    systemsAffected: string[];
  };

  /** Availability impact */
  availabilityImpact: {
    level: 'None' | 'Low' | 'High';
    description: string;
    servicesAffected: string[];
  };

  // ────── CVSS Scoring ──────

  /** CVSS v3.1 base score */
  cvssScore?: number;

  /** CVSS vector string */
  cvssVector?: string;

  // ────── Business Impact ──────

  /** Business impact description */
  businessImpact: string;

  /** Potential financial impact */
  financialImpact?: string;

  /** Regulatory impact (GDPR, PCI-DSS, etc.) */
  regulatoryImpact?: string[];

  // ────── Scope ──────

  /** Does the impact extend beyond the vulnerable component */
  scopeChanged: boolean;

  /** Description of scope expansion */
  scopeDescription?: string;
}

// ============================================================================
// Attack Path Definition (Complete)
// ============================================================================

export interface AttackPath {
  /** Attack path identifier */
  id: string;

  /** Path title */
  title: string;

  /** Path description */
  description: string;

  /** Starting entry point */
  entryPoint: EntryPoint;

  /** Vulnerability chain */
  chain: VulnerabilityChain;

  /** Impact assessment */
  impact: ImpactAssessment;

  /** Attack complexity rating */
  complexity: 'Low' | 'Medium' | 'High';

  /** Privileges required */
  privilegesRequired: 'None' | 'Low' | 'High';

  /** User interaction required */
  userInteraction: 'None' | 'Required';

  /** Overall severity */
  severity: SeverityLevel;

  /** Mitigation recommendations */
  mitigations: string[];

  /** Visual representation (ASCII or markdown diagram) */
  diagram?: string;
}

// ============================================================================
// Attack Path Collection
// ============================================================================

export interface AttackPathCollection {
  /** Collection name */
  name: string;

  /** Target system being analyzed */
  target: string;

  /** Analysis date */
  analysisDate: string;

  /** All identified entry points */
  entryPoints: EntryPoint[];

  /** All vulnerability chains */
  chains: VulnerabilityChain[];

  /** All impact assessments */
  impacts: ImpactAssessment[];

  /** Complete attack paths */
  paths: AttackPath[];

  /** Executive summary */
  executiveSummary: string;

  /** Overall risk rating */
  overallRisk: 'Critical' | 'High' | 'Medium' | 'Low';
}
