"use strict";
/**
 * HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer
 *
 * 主入口 - 4层防御引擎
 *
 * 用法:
 *   import { enforce } from './src/index';
 *   const result = enforce('/path/to/file.ts');
 *   console.log(result.realityScore);
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printMarkdownReport = exports.printReport = exports.detectSilentFailure = exports.detectRealityBinding = exports.detectRegexAbuse = exports.detectMockLeakage = exports.calculateRealityScore = exports.DEFAULT_CONFIG = exports.enforceText = exports.enforceCode = exports.enforce = void 0;
exports.enforceAndReport = enforceAndReport;
exports.cli = cli;
var engine_1 = require("./core/engine");
Object.defineProperty(exports, "enforce", { enumerable: true, get: function () { return engine_1.enforce; } });
Object.defineProperty(exports, "enforceCode", { enumerable: true, get: function () { return engine_1.enforceCode; } });
Object.defineProperty(exports, "enforceText", { enumerable: true, get: function () { return engine_1.enforceText; } });
var types_1 = require("./core/types");
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return types_1.DEFAULT_CONFIG; } });
var scorer_1 = require("./core/scorer");
Object.defineProperty(exports, "calculateRealityScore", { enumerable: true, get: function () { return scorer_1.calculateRealityScore; } });
var mock_detector_1 = require("./detectors/mock-detector");
Object.defineProperty(exports, "detectMockLeakage", { enumerable: true, get: function () { return mock_detector_1.detectMockLeakage; } });
var regex_detector_1 = require("./detectors/regex-detector");
Object.defineProperty(exports, "detectRegexAbuse", { enumerable: true, get: function () { return regex_detector_1.detectRegexAbuse; } });
var reality_binder_1 = require("./detectors/reality-binder");
Object.defineProperty(exports, "detectRealityBinding", { enumerable: true, get: function () { return reality_binder_1.detectRealityBinding; } });
var silent_failure_1 = require("./detectors/silent-failure");
Object.defineProperty(exports, "detectSilentFailure", { enumerable: true, get: function () { return silent_failure_1.detectSilentFailure; } });
var console_1 = require("./reporters/console");
Object.defineProperty(exports, "printReport", { enumerable: true, get: function () { return console_1.printReport; } });
Object.defineProperty(exports, "printMarkdownReport", { enumerable: true, get: function () { return console_1.printMarkdownReport; } });
/**
 * 快捷入口: 分析文件并打印报告
 */
function enforceAndReport(filePath) {
    const { printReport, enforce } = require('./core/engine');
    const result = enforce(filePath);
    printReport(result);
}
/**
 * CLI 友好接口
 */
function cli(args) {
    const { enforce } = require('./core/engine');
    const { printReport, printMarkdownReport } = require('./reporters/console');
    const files = args.filter(a => !a.startsWith('-'));
    const formatFlag = args.includes('--json') ? 'json' :
        args.includes('--markdown') ? 'markdown' : 'pretty';
    let overallPassed = true;
    for (const file of files) {
        console.log(`\nAnalyzing: ${file}`);
        const result = enforce(file);
        if (formatFlag === 'markdown') {
            printMarkdownReport(result);
        }
        else {
            printReport(result, formatFlag === 'json' ? 'json' : 'pretty');
        }
        if (!result.passed)
            overallPassed = false;
    }
    if (!overallPassed) {
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map