"use strict";
/**
 * HOS-Silly-Mock: 4-Layer Enforcement Engine
 *
 * 主引擎 — 协调 4 层检测器，汇总结果，生成 Reality Score。
 *
 * 支持:
 *   - enforce(filePath)     — 分析文件
 *   - enforceCode(code)     — 分析代码字符串
 *   - enforceText(lines)    — 分析已分割的行数组
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforce = enforce;
exports.enforceCode = enforceCode;
exports.enforceText = enforceText;
const fs = __importStar(require("fs"));
const types_1 = require("./types");
const scorer_1 = require("./scorer");
const mock_detector_1 = require("../detectors/mock-detector");
const regex_detector_1 = require("../detectors/regex-detector");
const reality_binder_1 = require("../detectors/reality-binder");
const silent_failure_1 = require("../detectors/silent-failure");
/**
 * 分析单个文件
 * @param filePath 文件绝对路径
 * @param config 可选配置（默认使用 DEFAULT_CONFIG）
 */
function enforce(filePath, config = types_1.DEFAULT_CONFIG) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    return analyzeLines(filePath, lines, config);
}
/**
 * 分析代码字符串
 * @param code 源代码字符串
 * @param filename 文件名（用于报告）
 * @param config 可选配置
 */
function enforceCode(code, filename = '<anonymous>', config = types_1.DEFAULT_CONFIG) {
    const lines = code.split('\n');
    return analyzeLines(filename, lines, config);
}
/**
 * 分析已分割的行
 * @param lines 代码行数组
 * @param filename 文件名
 * @param config 可选配置
 */
function enforceText(lines, filename = '<anonymous>', config = types_1.DEFAULT_CONFIG) {
    return analyzeLines(filename, lines, config);
}
/**
 * 核心分析逻辑
 */
function analyzeLines(file, lines, config) {
    const allFindings = [];
    // Layer 1: MOCK 显性化检测
    const mockFindings = (0, mock_detector_1.detectMockLeakage)(file, lines, config);
    allFindings.push(...mockFindings);
    // Layer 2: Regex 滥用检测
    const regexFindings = (0, regex_detector_1.detectRegexAbuse)(file, lines, config);
    allFindings.push(...regexFindings);
    // Layer 3: Reality Binding 检测
    const bindingFindings = (0, reality_binder_1.detectRealityBinding)(file, lines, config);
    allFindings.push(...bindingFindings);
    // Layer 4: Silent Failure 检测
    const silentFindings = (0, silent_failure_1.detectSilentFailure)(file, lines, config);
    allFindings.push(...silentFindings);
    // 构建并返回结果
    return (0, scorer_1.buildResult)(allFindings);
}
//# sourceMappingURL=engine.js.map