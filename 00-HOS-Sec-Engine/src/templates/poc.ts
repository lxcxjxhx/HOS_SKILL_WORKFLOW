/**
 * Proof of Concept (PoC) Template
 * 
 * Standardized format for documenting vulnerability exploitation steps.
 */

export interface PoCTemplate {
  // ────── PoC Header ──────

  /** PoC identifier */
  id: string;

  /** Related finding title */
  findingTitle: string;

  /** Vulnerability type */
  vulnerabilityType: string;

  /** Severity */
  severity: 'Critical' | 'High' | 'Medium' | 'Low';

  // ────── Prerequisites ──────

  /** What is needed before executing the PoC */
  prerequisites: {
    /** Access level required */
    accessLevel: 'None' | 'Authenticated' | 'Admin';

    /** Tools required */
    tools: string[];

    /** Environment setup */
    setupSteps: string[];
  };

  // ────── Exploitation Steps ──────

  /** Step-by-step exploitation instructions */
  steps: {
    /** Step number */
    step: number;

    /** Action description */
    action: string;

    /** Command or request to execute */
    command?: string;

    /** Expected response */
    expectedResponse: string;

    /** Success indicator */
    successIndicator: string;
  }[];

  // ────── Impact Demonstration ──────

  /** What was achieved */
  impactDemonstrated: string;

  /** Evidence collected */
  evidence: string[];

  // ────── Cleanup ──────

  /** Steps to clean up after PoC */
  cleanupSteps?: string[];

  // ────── Remediation Verification ──────

  /** How to verify the fix works */
  verificationSteps: string[];
}

/**
 * Create a PoC template for a finding
 */
export function createPoC(
  id: string,
  findingTitle: string,
  vulnerabilityType: string,
  severity: 'Critical' | 'High' | 'Medium' | 'Low',
  steps: PoCTemplate['steps'],
  impactDemonstrated: string
): PoCTemplate {
  return {
    id,
    findingTitle,
    vulnerabilityType,
    severity,
    prerequisites: {
      accessLevel: 'None',
      tools: [],
      setupSteps: []
    },
    steps,
    impactDemonstrated,
    evidence: [],
    verificationSteps: [
      'Apply the recommended remediation',
      'Repeat the exploitation steps',
      'Verify the attack no longer succeeds',
      'Document the verification result'
    ]
  };
}
