/**
 * HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer
 *
 * 类型定义 - 所有检测结果、配置和评分系统的类型
 */
/** 风险等级 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
/** 检测层级 */
export type LayerId = 'L1-MOCK' | 'L2-REGEX' | 'L3-BINDING' | 'L4-SILENT';
/** 检测结果类型 */
export type FindingType = 'mock-leakage' | 'regex-abuse' | 'unbound-variable' | 'silent-failure' | 'missing-error-handling';
/** 单个检测发现 */
export interface Finding {
    /** 所属层级 */
    layer: LayerId;
    /** 结果类型 */
    type: FindingType;
    /** 严重程度 */
    severity: RiskLevel;
    /** 文件名（相对路径） */
    file: string;
    /** 行号 */
    line: number;
    /** 列号 */
    column?: number;
    /** 发现摘要 */
    message: string;
    /** 具体代码片段 */
    snippet?: string;
    /** 建议修复 */
    suggestion?: string;
}
/** MOCK 模式的检测配置 */
export interface MockDetectionOptions {
    /** 检查 catch → fallback 模式 */
    checkCatchFallback: boolean;
    /** 检查无标注的静态数据 */
    checkUnannotatedData: boolean;
    /** 检查变量名中的 mock 关键词 */
    checkNamingConvention: boolean;
    /** 大型数组/对象的阈值行数 */
    largeDataThreshold: number;
}
/** Regex 检测的配置 */
export interface RegexDetectionOptions {
    /** 检查 JSON 解析场景 */
    checkJsonParsing: boolean;
    /** 检查 HTML 解析场景 */
    checkHtmlParsing: boolean;
    /** 检查 XML 解析场景 */
    checkXmlParsing: boolean;
    /** 检查 URL 解析场景 */
    checkUrlParsing: boolean;
}
/** Reality Binding 检测配置 */
export interface BindingOptions {
    /** 检查 source 是否存在 */
    checkSource: boolean;
    /** 检查 sink 是否存在 */
    checkSink: boolean;
    /** 检查 transform 是否有输入 */
    checkTransformInput: boolean;
}
/** Silent Failure 检测配置 */
export interface SilentFailureOptions {
    /** 检查空 catch 块 */
    checkEmptyCatch: boolean;
    /** 检查缺失 error path */
    checkMissingErrorPath: boolean;
    /** 检查无 I/O 的完整逻辑链 */
    checkNoIOSystem: boolean;
}
/** 整体引擎配置 */
export interface EnforcementConfig {
    mock: MockDetectionOptions;
    regex: RegexDetectionOptions;
    binding: BindingOptions;
    silent: SilentFailureOptions;
    /** Reality Score 阈值（低于此值报错） */
    scoreThreshold: number;
    /** 是否启用测试豁免 */
    allowTestExemption: boolean;
    /** 测试豁免标记 */
    testExemptionMarker: string;
    /** 允许的 MOCK_MODE 标注模式 */
    allowedMockMarkers: string[];
}
/** 引擎执行结果 */
export interface EnforcementResult {
    /** 是否通过检查 */
    passed: boolean;
    /** Reality Score (0-100) */
    realityScore: number;
    /** 各维度评分 */
    dimensions: {
        dataAuthenticity: number;
        mockLeakageRisk: RiskLevel;
        regexAbuseRisk: RiskLevel;
        silentFailureRisk: 'YES' | 'NO';
        realityBinding: 'PASS' | 'FAIL';
    };
    /** 所有发现 */
    findings: Finding[];
    /** 各层统计 */
    summary: {
        totalFindings: number;
        errors: number;
        warnings: number;
        info: number;
    };
}
/** Mock 标注检查结果 */
export interface MockAnnotation {
    hasAnnotation: boolean;
    validFormat: boolean;
    hasReason: boolean;
    reason?: string;
}
/** Reality Binding 三元组 */
export interface SourceTransformSink {
    name: string;
    source?: string;
    transform?: string[];
    sink?: string;
    complete: boolean;
}
/** 默认配置 */
export declare const DEFAULT_CONFIG: EnforcementConfig;
//# sourceMappingURL=types.d.ts.map