"use strict";
/**
 * HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer
 *
 * 类型定义 - 所有检测结果、配置和评分系统的类型
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
/** 默认配置 */
exports.DEFAULT_CONFIG = {
    mock: {
        checkCatchFallback: true,
        checkUnannotatedData: true,
        checkNamingConvention: true,
        largeDataThreshold: 3,
    },
    regex: {
        checkJsonParsing: true,
        checkHtmlParsing: true,
        checkXmlParsing: true,
        checkUrlParsing: true,
    },
    binding: {
        checkSource: true,
        checkSink: true,
        checkTransformInput: true,
    },
    silent: {
        checkEmptyCatch: true,
        checkMissingErrorPath: true,
        checkNoIOSystem: true,
    },
    scoreThreshold: 50,
    allowTestExemption: true,
    testExemptionMarker: '@silly-mock:allow',
    allowedMockMarkers: ['MOCK_MODE: TRUE', 'MOCK_MODE:TRUE', '@silly-mock:allow'],
};
//# sourceMappingURL=types.js.map