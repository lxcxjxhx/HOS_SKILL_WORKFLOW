/**
 * ER-005: Dependency Evidence Standard
 * 
 * 功能: 规范依赖库证据的采集和呈现
 * 焦点: 记录库版本、已知CVE、依赖树分析、许可证合规
 * 
 * 核心原则:
 *  1. 精确的版本锁定(不是范围而是确切版本)
 *  2. 已知CVE的时效性和影响范围评估
 *  3. 传递依赖的风险传递分析
 *  4. 区分直接依赖和间接依赖
 */

import {
  EvidenceStandard,
  EvidenceType
} from '../schemas/types';

export const DependencyEvidenceStandard: EvidenceStandard = {
  // ============================================================================
  // 基本信息
  // ============================================================================

  id: 'ER-005',
  type: EvidenceType.Dependency,
  name: 'Dependency Evidence Standard',
  description: '规范依赖层面证据的采集，确保库版本、CVE、依赖树分析等证据完整可追溯',

  // ============================================================================
  // 必需字段 (必须包含)
  // ============================================================================

  required_fields: [
    'dependency_name',           // 依赖包名称
    'installed_version',         // 当前安装的精确版本
    'version_constraint',        // 版本约束(^4.17.0, ~2.0, >=1.0等)
    'dependency_type',           // 直接依赖/间接依赖(传递依赖)
    'cve_list',                  // 已知CVE列表(CVE-ID + 严重程度 + 影响版本)
    'vulnerability_analysis',    // 漏洞影响分析(项目中是否使用了受影响的功能)
    'dependency_tree_path',      // 依赖树路径(谁引入了这个依赖)
    'conclusion'                 // 依赖安全性评估结论
  ],

  // ============================================================================
  // 推荐字段 (增加证据强度)
  // ============================================================================

  recommended_fields: [
    'latest_version',            // 最新可用版本
    'update_urgency',            // 更新紧急度(critical/high/medium/low)
    'affected_functionality',    // 项目中使用该依赖的哪些功能
    'patch_availability',        // 是否有补丁版本
    'license_type',              // 许可证类型和合规性
    'dependency_health',         // 维护状态(活跃/废弃/无人维护)
    '替代方案',                  // 可替代的安全库
    'lock_file_status',          // 版本锁定文件状态(package-lock.json/pom.xml等)
    'supply_chain_risk'          // 供应链风险评估(包维护者、下载量、发布时间)
  ],

  // ============================================================================
  // 好的证据示例 ✓
  // ============================================================================

  good_example: `
=== lodash Dependency Evidence (Good Example) ===

Dependency:
  Name: lodash
  Installed Version: 4.17.20 (exact from lock file)
  Version Constraint: ^4.17.0 (package.json)
  Dependency Type: Direct dependency
  Dependency Source: package.json:15 -> "lodash": "^4.17.0"

Lock File Status:
  package-lock.json: ✅ Present and committed
  Resolved Version: 4.17.20 (NOT latest ^4.17.x which would be 4.17.21)
  Integrity: sha512-WmK... (verified)

Dependency Tree Path:
  project-root
  └── lodash@4.17.20 (direct)
  
  Note: Also appears as transitive dependency of:
  └── babel-cli@6.26.0
      └── lodash@4.17.20 (deduplicated to root)

Known CVEs:
  CVE-2020-28500:
    Severity: Medium (CVSS 5.3)
    Description: Regular Expression Denial of Service (ReDoS) in lodash.trim()
    Affected Versions: < 4.17.21
    Patched Version: 4.17.21
    Published: 2021-02-15
    Reference: https://nvd.nist.gov/vuln/detail/CVE-2020-28500

Vulnerability Impact Analysis:
  Project Usage Scan:
    ✓ lodash.trim() NOT used in project code (grep found 0 matches)
    ✓ lodash.trimStart() NOT used
    ✓ lodash.trimEnd() NOT used
    ✓ lodash(4.17.20) used for: .map(), .filter(), .debounce(), .cloneDeep()
  
  Affected Functions Check:
    ❌ The vulnerable function (trim) exists in the installed version
    ✓ But project does NOT call the vulnerable function
  
  Risk Assessment:
    The CVE exists in the installed version, but the specific vulnerable
    function is NOT used by the project. Risk is theoretical only.

Update Urgency:
  Priority: LOW (vulnerable function not used)
  Latest Version: 4.17.21 (security patch only)
  Breaking Changes: None (patch version)
  Recommended Action: Update to 4.17.21 in next maintenance cycle

Dependency Health:
  Maintenance Status: Active (last release 2021-02-15)
  Weekly Downloads: 50M+ (high usage, well-tested)
  GitHub Stars: 58k
  Known Maintainers: 3 (active)
  Supply Chain Risk: LOW

License:
  Type: MIT
  Compliance: ✅ Compatible with project license

Conclusion:
  lodash@4.17.20 has 1 known CVE (CVE-2020-28500, Medium severity).
  However, project does NOT use the vulnerable function (trim/trimStart/trimEnd).
  Current risk: LOW - Theoretical vulnerability, not exploitable in current usage.
  
  Recommendation: Update to 4.17.21 when convenient (no breaking changes,
  eliminates the CVE from audit reports). Not an emergency update.
  `,

  // ============================================================================
  // 差的证据示例 ✗ (反面教材)
  // ============================================================================

  bad_example: `
=== lodash Dependency Evidence (Bad Example) ✗ ===

Bad #1 - Vague Version Info:
  "Using lodash version 4.x"
  ❌ 没有精确版本,无法判断CVE影响

Bad #2 - No CVE Impact Analysis:
  "lodash has CVE-2020-28500"
  ❌ 没有分析项目是否使用了受影响的功能

Bad #3 - Missing Dependency Type:
  "lodash is in the project"
  ❌ 没有说明是直接还是间接依赖

Bad #4 - No Update Assessment:
  "Should update lodash"
  ❌ 没有评估更新紧急度和是否有破坏性变更

Bad #5 - Ignoring Lock File:
  "package.json says ^4.17.0"
  ❌ 没有检查lock文件的实际锁定版本

Bad #6 - No Dependency Tree:
  "lodash dependency found"
  ❌ 没有分析依赖树,不知道是谁引入的
  `,

  // ============================================================================
  // 采集指导 (如何正确采集证据)
  // ============================================================================

  collection_guidance: [
    `
步骤1: 收集依赖清单
  - 读取包管理器文件: package.json, pom.xml, requirements.txt, go.mod等
  - 读取锁定文件: package-lock.json, yarn.lock, poetry.lock, go.sum等
  - 区分: 直接依赖(项目声明) vs 间接依赖(传递依赖)
  - 记录: 包名 + 精确版本 + 版本约束 + 依赖类型
    `,

    `
步骤2: 查询已知CVE
  - 使用工具: npm audit, Snyk, GitHub Dependabot, osv.dev
  - 查询每个依赖的已知CVE
  - 记录: CVE-ID + CVSS评分 + 影响版本范围 + 修复版本
  - 注意: 有些CVE可能需要特定条件才能触发
    `,

    `
步骤3: 分析CVE实际影响
  - 搜索项目代码: 是否使用了受CVE影响的函数/模块
  - 评估: 如果使用了受影响功能 → 实际风险
  - 评估: 如果没有使用受影响功能 → 理论风险
  - 注意: 即使未直接使用,间接调用也可能触发漏洞
    `,

    `
步骤4: 分析依赖树路径
  - 生成完整依赖树: npm ls, mvn dependency:tree, pipdeptree
  - 追踪: 谁引入了这个依赖(直接还是间接)
  - 注意: 版本冲突和重复依赖(同一包多个版本)
  - 评估: 能否通过更新直接依赖来消除有漏洞的间接依赖
    `,

    `
步骤5: 评估更新可行性
  - 检查最新版本: 是否有补丁版本可用
  - 评估破坏性变更: 主版本更新可能有breaking changes
  - 检查维护状态: 包是否还在维护、是否有替代方案
  - 优先级排序: critical → high → medium → low
    `,

    `
步骤6: 评估供应链风险
  - 检查包维护者信誉和社区活跃度
  - 评估: 下载量、stars、issues响应速度
  - 注意: 新维护者接管、废弃包、恶意包发布等风险
  - 记录: 供应链风险评级
    `
  ],

  // ============================================================================
  // 常见错误 (要避免)
  // ============================================================================

  common_mistakes: [
    {
      mistake: '没有使用精确版本',
      wrong: '"lodash: ^4.17.0"',
      correct: '"lodash: 4.17.20 (locked in package-lock.json)"',
      why: '版本范围^4.17.0可能解析到任何4.17.x版本,必须确认实际安装版本'
    },

    {
      mistake: '没有分析CVE实际影响',
      wrong: '"CVE-2020-28500 found in lodash, must update immediately"',
      correct: `"CVE-2020-28500 affects lodash.trim(), which is NOT used in project.
        Risk is theoretical, update priority: LOW"`,
      why: '不是所有CVE都实际影响项目,需要分析受影响的代码路径'
    },

    {
      mistake: '忽视间接依赖风险',
      wrong: '"Only direct dependencies have vulnerabilities"',
      correct: `"Indirect dependency: ansi-regex@5.0.0 (via chalk -> ansi-styles -> ansi-regex)
        CVE-2021-3807 (High) - ReDoS in ansi-regex"`,
      why: '间接依赖也可能有严重CVE,且更难发现和更新'
    },

    {
      mistake: '没有检查锁定文件',
      wrong: '"package.json says express@^4.17.1"',
      correct: `"package.json: express@^4.17.1
        package-lock.json: express@4.17.3 (resolved)
        Actual installed: 4.17.3"`,
      why: 'lock文件决定了实际安装的版本,不是package.json的范围'
    },

    {
      mistake: '没有评估更新可行性',
      wrong: '"Update react to v18"',
      correct: `"Current: react@16.14.0
        Latest: react@18.2.0
        Breaking changes: Concurrent rendering, strict mode changes, etc.
        Recommended: Update to 17.x first (compatibility layer)"`,
      why: '主要版本更新可能引入破坏性变更,需要谨慎评估'
    },

    {
      mistake: '忽视依赖维护状态',
      wrong: '"Using moment.js@2.29.4"',
      correct: `"moment.js@2.29.4: Project is in maintenance mode (no new features)
        Team recommends migrating to date-fns or dayjs
        Last feature release: 2020, only security patches since"`,
      why: '使用废弃或无人维护的库存在长期安全风险'
    },

    {
      mistake: '没有考虑依赖树冲突',
      wrong: '"Project uses lodash 4.17.21"',
      correct: `"Project root: lodash@4.17.21
        Via babel-cli: lodash@4.17.20 (nested, not deduplicated)
        Both versions present in node_modules
        Need to update babel-cli to deduplicate"`,
      why: '同一包可能有多个版本同时存在,需要全面分析'
    }
  ]
};

export default DependencyEvidenceStandard;
