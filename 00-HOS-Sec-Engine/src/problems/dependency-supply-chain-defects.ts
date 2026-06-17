/**
 * PD-005: Dependency & Supply Chain Defects
 *
 * Systematic diagnosis of dependency and supply chain risks including
 * vulnerable libraries, typosquatting packages, unpinned versions,
 * and compromised build pipelines.
 */

import { DiagnosticGuide, ProblemCategoryType, SeverityLevel, LanguageType } from '../schemas/types';

export const DependencySupplyChainDefectsRule: DiagnosticGuide = {
  id: 'PD-005',
  category: ProblemCategoryType.DependencySupplyChain,
  name: 'Dependency & Supply Chain Defects',
  description: 'Systematic diagnosis of dependency and supply chain risks including vulnerable libraries, typosquatting packages, unpinned versions, and compromised build pipelines.',
  triggers: {
    patterns: [
      'package\\.json|requirements\\.txt|pom\\.xml|Gemfile|Cargo\\.toml',
      'go\\.mod|go\\.sum|composer\\.json|nuget\\.config',
      'import.*from.*|require\\(|include',
      'npm.*install|pip.*install|gem.*install|cargo.*add',
      'vulnerability|CVE|advisory|security.*update',
      'lockfile|package-lock|yarn\\.lock|poetry\\.lock',
      'build.*pipeline|CI/CD|github.*actions|jenkinsfile',
      'supply.*chain|dependency.*chain|third.*party',
      'sbom|software.*bill.*of.*materials',
      'signature.*verify|checksum|hash.*verify',
      'registry.*config|npm.*registry|pypi.*index',
      'submodule|vendor|external.*dependency'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go,
      LanguageType.Rust
    ],
    keywords: [
      'import',
      'require',
      'package',
      'dependency',
      'npm',
      'pip',
      'maven',
      'gradle',
      'gem',
      'cargo',
      'build',
      'ci-cd'
    ]
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Dependency Analysis',
      description: 'Inventory all direct and transitive dependencies, their versions, and their role in the application. Identify outdated packages and understand the full dependency tree.',
      questions: [
        'Is there a complete, up-to-date inventory of all direct and transitive dependencies?',
        'Are all dependencies pinned to specific versions rather than using version ranges?',
        'Are there dependencies that have not been updated in over 2 years?',
        'Are there unused dependencies that increase the attack surface?',
        'Is there a Software Bill of Materials (SBOM) generated for the application?'
      ],
      defect_indicators: [
        'Dependencies using version ranges (^, ~, *) allowing automatic updates to potentially vulnerable versions',
        'No lockfile (package-lock.json, yarn.lock, Pipfile.lock) committed to version control',
        'Dependencies not updated for over 2 years with no review',
        'Large number of transitive dependencies (hundreds) without awareness',
        'No SBOM generated or maintained',
        'Dependencies with known CVEs still in use',
        'Unused dependencies not removed'
      ],
      secure_indicators: [
        'All dependencies pinned to exact versions with lockfiles committed',
        'Regular dependency review and update cycle (monthly or quarterly)',
        'Unused dependencies identified and removed',
        'SBOM generated and maintained for each release',
        'Dependency tree reviewed for unnecessary depth or duplication'
      ],
      tools: ['npm audit', 'pip-audit', 'snyk', 'dependency-check', 'cargo-audit']
    },
    {
      order: 2,
      name: 'CVE Mapping',
      description: 'Check dependencies against known vulnerability databases to identify packages with known CVEs. Assess the exploitability and impact of each vulnerability in the context of your application.',
      questions: [
        'Are any dependencies affected by known CVEs?',
        'What is the CVSS score of each vulnerability?',
        'Is the vulnerable function actually called in your application?',
        'Are there available patches or workarounds for each vulnerability?',
        'Are there critical vulnerabilities in production dependencies (not dev-only)?'
      ],
      defect_indicators: [
        'Critical (CVSS >= 9.0) or High (CVSS >= 7.0) CVEs in production dependencies',
        'Known vulnerabilities in core framework or runtime libraries',
        'No automated vulnerability scanning in CI/CD pipeline',
        'Vulnerabilities discovered but not patched for over 30 days',
        'Dev dependencies with vulnerabilities that could affect build integrity',
        'No process for monitoring new CVEs in dependencies'
      ],
      secure_indicators: [
        'No known critical or high CVEs in production dependencies',
        'Automated vulnerability scanning in CI/CD blocks builds with critical CVEs',
        'Known vulnerabilities patched within 7 days of discovery',
        'Dependency vulnerability monitoring with automated alerts (Dependabot, Renovate)',
        'Context-aware vulnerability assessment (not all CVEs affect every application)'
      ],
      tools: ['npm audit', 'OSV-Scanner', 'Snyk', 'GitHub Dependabot', 'Renovate']
    },
    {
      order: 3,
      name: 'Supply Chain Risk Assessment',
      description: 'Verify package authenticity, check for typosquatting packages, review maintainer trust, and assess the overall supply chain risk of dependencies.',
      questions: [
        'Are packages verified against known typosquatting patterns?',
        'Do dependencies come from trusted maintainers with good security practices?',
        'Are package integrity checks performed (checksums, signatures, SRI hashes)?',
        'Is the build process protected from supply chain injection?',
        'Are CI/CD pipeline dependencies (actions, plugins) from verified sources?'
      ],
      defect_indicators: [
        'Packages with suspicious names similar to popular packages (typosquatting)',
        'Dependencies from abandoned or compromised maintainer accounts',
        'No package integrity verification (checksums, signatures, Subresource Integrity)',
        'Build process downloads dependencies without verification',
        'CI/CD actions or plugins from unknown or unverified sources',
        'npm/pip configured to use untrusted registries',
        'No pinning of CI/CD action versions (using @latest or @master)',
        'No verification of downloaded artifacts or checksums'
      ],
      secure_indicators: [
        'All dependencies from verified, well-maintained packages with active communities',
        'Package integrity verified via checksums, signatures, or SRI hashes',
        'CI/CD actions pinned to specific commit SHAs, not tags or branches',
        'Private registry (Artifactory, Nexus) with vetted package allowlist',
        'Build process reproducible and verified',
        'Supply chain security tools in place (Sigstore, in-toto)'
      ],
      tools: ['npm audit signatures', 'Sigstore/cosign', 'in-toto', 'SLSA framework', 'Socket.dev']
    },
    {
      order: 4,
      name: 'Build Pipeline Integrity',
      description: 'Verify lockfile integrity, build reproducibility, and CI/CD pipeline security to ensure the build process is protected against injection, tampering, and unauthorized modification.',
      questions: [
        'Are CI/CD pipeline secrets (tokens, credentials) properly scoped and protected?',
        'Is the build environment isolated and reproducible?',
        'Are build artifacts signed and verified before deployment?',
        'Are pull requests required for all code changes including dependency updates?',
        'Is there branch protection preventing direct pushes to main/master?'
      ],
      defect_indicators: [
        'CI/CD secrets (tokens, API keys) with excessive permissions',
        'Build environment not isolated (shared runners, cached credentials)',
        'Build artifacts not signed or verified before deployment',
        'Dependency auto-merge enabled without review for critical packages',
        'No branch protection on main/master branch',
        'CI/CD pipeline scripts vulnerable to injection (unquoted variables)',
        'Build process can be triggered by external contributors without review'
      ],
      secure_indicators: [
        'CI/CD secrets scoped to minimum required permissions with rotation',
        'Build environment isolated with ephemeral runners',
        'Build artifacts signed with verified signatures before deployment',
        'All dependency updates require pull request review before merge',
        'Branch protection enforced on main/master with required reviews',
        'CI/CD pipeline validated against injection attacks',
        'External contributor changes run in restricted environments'
      ],
      tools: ['GitHub CodeQL', 'SLSA provenance', 'Sigstore', 'CI/CD security scanners']
    }
  ],
  common_root_causes: [
    {
      cause: 'Dependencies with known critical CVEs not updated',
      explanation: 'Teams often neglect dependency updates, especially for packages that "work fine." Over time, vulnerabilities are discovered in these packages. Without automated monitoring and update processes, applications accumulate known-vulnerable dependencies that attackers can exploit using public CVE information.',
      frequency: 'common'
    },
    {
      cause: 'No lockfile committed allowing unpredictable dependency resolution',
      explanation: 'Without lockfiles (package-lock.json, yarn.lock, Pipfile.lock), each installation may pull different versions of transitive dependencies. This creates inconsistent environments and allows vulnerable versions to be pulled in without awareness. A dependency that was safe yesterday may have a vulnerable update published today.',
      frequency: 'common'
    },
    {
      cause: 'Unpinned version ranges (* or ^x.x.x) enabling malicious version injection',
      explanation: 'Packages downloaded from public registries without integrity verification can be compromised through typosquatting, dependency confusion, or registry compromise. Without checksums, signatures, or SRI hashes, there is no guarantee that the downloaded package matches the expected content.',
      frequency: 'occasional'
    },
    {
      cause: 'No dependency scanning in CI/CD pipeline',
      explanation: 'CI/CD pipelines often have broad access to production environments, cloud infrastructure, and deployment credentials. If the pipeline is compromised through a vulnerable dependency or malicious contribution, the attacker gains access to everything the pipeline can access.',
      frequency: 'occasional'
    }
  ],
  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Implement automated dependency scanning with npm audit and Snyk',
      description: 'Integrate vulnerability scanning into CI/CD pipeline to detect and block builds with critical/high CVEs. Use tools like Dependabot, Renovate, or Snyk for automated monitoring and update suggestions.',
      code: `# GitHub Actions - Automated Dependency Scanning
name: Dependency Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly scan

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608  # Pin to SHA

      - name: Setup Node.js
        uses: actions/setup-node@b39b52d1213e96004bfcb1c61a87f8fd176bb51
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --ignore-scripts  # Prevent post-install scripts

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: false  # Fail build on high+ vulnerabilities

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run OSV-Scanner
        uses: google/osv-scanner-action@be4991807f8a96d006a416daa07a5468a548675
        with:
          scan-args: |-
            --lockfile=package-lock.json
            --severity=high

      - name: Generate SBOM
        run: |
          npm install -g @cyclonedx/cyclonedx-npm
          cyclonedx-npm --output-file sbom.json --output-format JSON`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Enforce lockfile usage and prevent builds without lockfiles',
      description: 'Ensure lockfiles are always committed and used during installation. Configure package managers to require lockfiles and fail builds when they are missing.',
      code: `# .npmrc - Enforce lockfile usage
package-lock=true
ignore-scripts=true
engine-strict=true

# package.json - Require npm ci in CI (fails if lockfile is missing)
# CI script:
# npm ci  # Will fail if package-lock.json is missing or out of sync

# Pipenv - Enforce Pipfile.lock
pipenv sync  # Install exactly what's in Pipfile.lock

# Ensure lockfile is committed and used in CI
# Add pre-commit hook to verify lockfile:
#!/bin/bash
if [ ! -f "package-lock.json" ]; then
  echo "ERROR: package-lock.json is missing. Run 'npm install' to generate it."
  exit 1
fi

# For Go projects - enforce go.sum
go mod verify  # Verify dependencies against checksum database`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.High,
      action: 'Pin all dependencies to exact versions with integrity hashes',
      description: 'Use exact version pins (no ^, ~, or *) for all dependencies and verify package integrity through integrity hashes in lockfiles.',
      code: `// package.json - Pin exact versions (no ^, ~, or *)
{
  "dependencies": {
    "express": "4.18.2",
    "helmet": "7.1.0",
    "jsonwebtoken": "9.0.2"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "jest": "29.7.0"
  }
}

# package-lock.json example with integrity hashes:
{
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ=="
    }
  }
}

# GitHub Actions - Pin to commit SHA, not tags
- uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608  # v4.1.1
- uses: actions/setup-node@b39b52d1213e96004bfcb1c61a87f8fd176bb51  # v4.0.1

# Verify package integrity
npm audit signatures  # Verify npm package signatures`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Medium,
      action: 'Add CI/CD pipeline dependency verification step',
      description: 'Add a mandatory verification step in CI/CD that validates all dependencies before build, blocks unauthorized packages, and ensures build reproducibility.',
      code: `# GitHub Actions - CI/CD Dependency Verification
name: CI Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608

      - name: Setup Node.js
        uses: actions/setup-node@b39b52d1213e96004bfcb1c61a87f8fd176bb51
        with:
          node-version: '20'

      - name: Verify lockfile integrity
        run: npm ci --ignore-scripts  # Fails if lockfile missing/invalid

      - name: Run dependency audit
        run: npm audit --audit-level=high

      - name: Check for unauthorized packages
        run: |
          ALLOWED_PACKAGES="express helmet jsonwebtoken"
          npm ls --json | jq -r '.dependencies | keys[]' | while read pkg; do
            echo "Checking: $pkg"
            if [[ ! " $ALLOWED_PACKAGES " =~ " $pkg " ]]; then
              echo "WARNING: Unauthorized package detected: $pkg"
            fi
          done

      - name: Verify build reproducibility
        run: |
          npm ci && npm run build
          cp -r dist /tmp/build1
          rm -rf node_modules dist
          npm ci && npm run build
          diff -r /tmp/build1 dist || echo "BUILD NOT REPRODUCIBLE"

      - name: Build
        if: success()
        run: npm ci && npm run build`,
      difficulty: 'Medium'
    }
  ],
  verification_steps: [
    'Run automated vulnerability scanning (npm audit, Snyk, OSV-Scanner) and confirm no critical or high CVEs remain in production dependencies.',
    'Verify that all dependencies are pinned to exact versions (no ^, ~, or *) and lockfiles are committed to version control.',
    'Test that CI/CD pipeline blocks builds when critical vulnerabilities are introduced by adding a known-vulnerable dependency to a test branch and verifying the build fails.',
    'Verify that all CI/CD actions are pinned to commit SHAs instead of tags or branches by reviewing workflow configuration files.',
    'Confirm that dependency integrity hashes in lockfiles are valid by running npm audit signatures and verifying no tampered packages are detected.'
  ],
  related_audit_rules: [],
  related_pentest_rules: ['PT-007'],
  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-829', 'CWE-1104', 'CWE-1395'],
  owasp_categories: [
    'A06:2021 - Vulnerable and Outdated Components',
    'A08:2021 - Software and Data Integrity Failures'
  ],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
