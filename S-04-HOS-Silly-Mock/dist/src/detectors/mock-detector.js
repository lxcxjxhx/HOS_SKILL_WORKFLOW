"use strict";
/**
 * HOS-Silly-Mock — Layer 1: MOCK显性化强制器（Mock Exposure Layer）
 *
 * 检测所有未经显式标注的 mock 数据。
 * 任何 mock 必须标注 ⚠ MOCK_MODE: TRUE + reason 才被认为是合法的。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMockAnnotation = hasMockAnnotation;
exports.hasMockName = hasMockName;
exports.isCatchToMock = isCatchToMock;
exports.isLargeStaticData = isLargeStaticData;
exports.detectMockLeakage = detectMockLeakage;
const types_1 = require("../core/types");
/**
 * 检测单行是否包含 MOCK_MODE 标注
 */
function hasMockAnnotation(line) {
    const markers = types_1.DEFAULT_CONFIG.allowedMockMarkers;
    return markers.some(m => line.includes(m));
}
/**
 * 检测变量名是否暗示 mock
 */
function hasMockName(variableName) {
    const mockIndicators = [
        'mock', 'fake', 'dummy', 'sample', 'demo', 'testData',
        'test_data', 'placeholder', 'stub', 'fixture',
        // lowercase variants
        'Mock', 'Fake', 'Dummy', 'Sample',
    ];
    return mockIndicators.some(indicator => variableName.includes(indicator));
}
/**
 * 检查 catch → fallback 模式是否产生 mock
 */
function isCatchToMock(line) {
    // 模式: .catch(() => [...]) 或 .catch(() => {...})
    const catchMockPatterns = [
        /\.catch\s*\(\s*\(\s*\)\s*=>\s*\[/,
        /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{/,
        /\.catch\s*\(\s*\(?\w*\)?\s*=>\s*\(/,
    ];
    return catchMockPatterns.some(p => p.test(line));
}
/**
 * 是否为大型静态数据（多行数组/对象）
 */
function isLargeStaticData(lines, startIdx, threshold) {
    let braceCount = 0;
    let lineCount = 0;
    let inString = false;
    let charPrev = '';
    const start = lines[startIdx];
    // 检查是否为数组或对象字面量的开始
    const arrayMatch = start.match(/^(const|let|var)\s+\w+\s*=\s*\[\s*$/);
    const objectMatch = start.match(/^(const|let|var)\s+\w+\s*=\s*\{\s*$/);
    if (!arrayMatch && !objectMatch)
        return false;
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        for (const ch of line) {
            if (ch === '"' || ch === "'" || ch === '`') {
                if (!inString)
                    inString = true;
                else if (charPrev !== '\\')
                    inString = false;
            }
            if (!inString) {
                if (ch === '{' || ch === '[')
                    braceCount++;
                if (ch === '}' || ch === ']')
                    braceCount--;
            }
            charPrev = ch;
        }
        lineCount++;
        if (braceCount === 0 && lineCount > 1)
            break;
        if (lineCount > threshold * 2)
            return true;
    }
    return lineCount > threshold;
}
/**
 * Layer 1 检测入口
 */
function detectMockLeakage(file, lines, config = types_1.DEFAULT_CONFIG) {
    const findings = [];
    let inBlockComment = false;
    let hasAnnotationInScope = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // 追踪块注释
        if (trimmed.startsWith('/*')) {
            inBlockComment = true;
            // 检查 MOCK_MODE 标注
            if (hasMockAnnotation(trimmed)) {
                hasAnnotationInScope = true;
            }
        }
        if (inBlockComment) {
            if (hasMockAnnotation(trimmed)) {
                hasAnnotationInScope = true;
            }
            if (trimmed.includes('*/')) {
                inBlockComment = false;
                continue;
            }
            continue;
        }
        // 单行注释检查标注
        if (trimmed.startsWith('//') && hasMockAnnotation(trimmed)) {
            hasAnnotationInScope = true;
        }
        // 跳过测试豁免标记所在行
        if (config.allowTestExemption && trimmed.includes(config.testExemptionMarker)) {
            hasAnnotationInScope = true;
            continue;
        }
        // 检查 catch → fallback 模式
        if (config.mock.checkCatchFallback && isCatchToMock(trimmed)) {
            if (!hasAnnotationInScope) {
                findings.push({
                    layer: 'L1-MOCK',
                    type: 'mock-leakage',
                    severity: 'high',
                    file,
                    line: i + 1,
                    message: 'Catch block falls back to mock data without MOCK_MODE annotation',
                    snippet: trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed,
                    suggestion: 'Add /**\n * MOCK_MODE: TRUE\n * reason: <explain why mock is needed>\n */ before this catch block',
                });
            }
            continue;
        }
        // 检查变量名中的 mock 关键词
        if (config.mock.checkNamingConvention) {
            const varDeclMatch = trimmed.match(/^(const|let|var)\s+(\w+)\s*=/);
            if (varDeclMatch) {
                const varName = varDeclMatch[2];
                if (hasMockName(varName) && !hasAnnotationInScope) {
                    // 检查后面是否跟随大数组/对象
                    // 支持: const x = [  (next line starts)
                    //        const x = {  (current line ends with it)
                    let hasLargeData = false;
                    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                        hasLargeData = isLargeStaticData(lines, i, config.mock.largeDataThreshold);
                    }
                    else if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine.startsWith('[') || nextLine.startsWith('{')) {
                            hasLargeData = isLargeStaticData(lines, i + 1, config.mock.largeDataThreshold);
                        }
                    }
                    if (hasLargeData) {
                        findings.push({
                            layer: 'L1-MOCK',
                            type: 'mock-leakage',
                            severity: 'medium',
                            file,
                            line: i + 1,
                            message: `Variable "${varName}" has mock-indicating name with large static data`,
                            snippet: trimmed,
                            suggestion: `Add MOCK_MODE annotation or rename "${varName}" if it's real data`,
                        });
                    }
                }
            }
        }
        // 检查未标注的大型静态数据
        if (config.mock.checkUnannotatedData && !hasAnnotationInScope) {
            if (isLargeStaticData(lines, i, config.mock.largeDataThreshold)) {
                const varMatch = lines[i].match(/^(const|let|var)\s+(\w+)\s*=\s*[\[{]\s*$/);
                if (varMatch) {
                    findings.push({
                        layer: 'L1-MOCK',
                        type: 'mock-leakage',
                        severity: 'low',
                        file,
                        line: i + 1,
                        message: `Large static data structure without MOCK_MODE annotation: ${varMatch[2]}`,
                        snippet: varMatch[0],
                        suggestion: 'If this is mock data, add /**\n * MOCK_MODE: TRUE\n * reason: ...\n */ before it',
                    });
                }
            }
        }
        // 重置标注作用域（每行非注释代码后）
        if (!trimmed.startsWith('//') && !inBlockComment) {
            // 在代码行末尾重置（如果是空行或新的语句块）
            if (trimmed === '' || trimmed.endsWith(';') || trimmed.endsWith('}') || trimmed.endsWith(')')) {
                hasAnnotationInScope = false;
            }
        }
    }
    return findings;
}
//# sourceMappingURL=mock-detector.js.map