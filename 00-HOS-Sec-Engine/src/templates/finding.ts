/**
 * Finding Template
 * 
 * 统一的安全发现输出格式
 * 避免AI生成冗长、重复或不清晰的内容
 */

/**
 * 生成一个标准化的Finding Markdown
 * 
 * @param data - Finding数据
 * @returns Markdown格式的Finding报告
 */
export function generateFindingMarkdown(data: {
  title: string;
  ruleId: string;
  file: string;
  line: number;
  snippet: string;
  context: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  discovery: string;
  parameterSource: string;
  validationCheck: string;
  controlAnalysis: string;
  conclusion: string;
  rootCause: string;
  exploitation?: {
    prerequisites: string[];
    steps: string[];
    impact: string;
  };
  remediation: string;
  remediationCode?: string;
  verification: string;
}): string {
  const template = `
## ${data.title}

**Finding ID:** ${data.ruleId}  
**Severity:** ${data.severity}  
**Confidence:** ${data.confidence}

---

### 📍 Location

\`\`\`
File: ${data.file}
Line: ${data.line}
\`\`\`

Dangerous Code:
\`\`\`
${data.snippet}
\`\`\`

Context (surrounding code):
\`\`\`
${data.context}
\`\`\`

---

### 🔍 Evidence Chain

**1. Discovery**
${data.discovery}

**2. Parameter Source**
${data.parameterSource}

**3. Validation Check**
${data.validationCheck}

**4. Control Analysis**
${data.controlAnalysis}

**5. Conclusion**
${data.conclusion}

---

### 🎯 Root Cause

${data.rootCause}

---

${data.exploitation ? `
### ⚔️ Exploitation Conditions

**Prerequisites:**
${data.exploitation.prerequisites.map(p => `- ${p}`).join('\n')}

**Attack Steps:**
${data.exploitation.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Impact:**
${data.exploitation.impact}

---
` : ''}

### 🔧 Remediation

**Primary Solution:**
${data.remediation}

${data.remediationCode ? `
**Code Example:**
\`\`\`
${data.remediationCode}
\`\`\`
` : ''}

---

### ✅ Verification

After applying the fix:
${data.verification}

---
`;

  return template.trim();
}

/**
 * 生成一个简洁的Finding JSON
 */
export function generateFindingJSON(data: {
  title: string;
  ruleId: string;
  file: string;
  line: number;
  severity: string;
  confidence: string;
  discovery: string;
  rootCause: string;
  remediation: string;
}): string {
  return JSON.stringify({
    finding: {
      title: data.title,
      ruleId: data.ruleId,
      location: {
        file: data.file,
        line: data.line
      },
      severity: data.severity,
      confidence: data.confidence,
      analysis: {
        discovery: data.discovery,
        rootCause: data.rootCause
      },
      remediation: data.remediation
    }
  }, null, 2);
}

/**
 * Finding模板使用指南
 */
export const FindingTemplateGuide = `
# Finding Template Usage Guide

## 核心原则

1. **清晰的结构** - 每个Finding遵循相同的格式，便于阅读
2. **完整的证据链** - 从发现到结论的完整逻辑
3. **避免废话** - 每一句都有意义，没有冗余
4. **可验证性** - 审核人可以按照信息独立验证

## 模板结构

### 1. Header (基本信息)
- 标题: 明确的漏洞描述
- Rule ID: 使用的审计规则
- 严重程度和信心度

### 2. Location (位置信息)
- 精确的文件路径
- 精确的行号
- 危险代码片段
- 前后代码上下文

### 3. Evidence Chain (证据链)
这是最关键的部分，按顺序展示:
1. 发现了什么? (具体的代码)
2. 参数来自何处? (输入源)
3. 是否有验证? (防护措施)
4. 是否有防护? (其他控制)
5. 最终结论是什么? (综合判定)

这种结构让审核人可以在任何地方质疑证据

### 4. Root Cause (根因)
为什么会有这个漏洞?
- 开发者是否理解了风险?
- 是否使用了不安全的API?
- 是否忽视了验证?

### 5. Exploitation (利用条件)
什么情况下才能被利用?
- 需要什么前提条件?
- 具体的攻击步骤是什么?
- 实际的业务影响是什么?

### 6. Remediation (修复)
如何修复?
- 具体的修复方案
- 代码示例
- 为什么这样修复会有效

### 7. Verification (验证)
怎样验证已修复?
- 修复后应该如何测试
- 什么样的结果表明已修复

## 使用示例

### 示例1: SQL Injection

\`\`\`markdown
## SQL Injection in User Search

**Finding ID:** AR-005  
**Severity:** High  
**Confidence:** High

### Location

File: src/main/java/com/app/UserService.java
Line: 48

### Evidence Chain

1. Discovery: Direct string concatenation with user input
2. Parameter Source: request.getParameter("id")
3. Validation Check: No validation found
4. Control Analysis: No PreparedStatement used
5. Conclusion: Confirmed SQL Injection

...
\`\`\`

### 示例2: Weak Encryption

\`\`\`markdown
## Weak Encryption Key

**Finding ID:** AR-004  
**Severity:** High  
**Confidence:** High

### Evidence Chain

1. Discovery: Hard-coded encryption key "secret123"
2. Parameter Source: config file (not externalized)
3. Validation Check: No key strength validation
4. Control Analysis: No HSM/KMS integration
5. Conclusion: Weak encryption key confirmed

...
\`\`\`

## 常见错误

❌ **错误**: "SQL injection vulnerability found"
✅ **正确**: 完整的证据链展示为什么确认是SQL注入

❌ **错误**: 混合发现和结论
✅ **正确**: 清晰的分离 - 发现 → 分析 → 结论

❌ **错误**: "Should use PreparedStatement"
✅ **正确**: "Use PreparedStatement because: xxx (具体原因)"

❌ **错误**: 没有代码位置
✅ **正确**: 精确的文件名、行号、代码片段

## 审核重点

审核人会关注:

1. **证据完整性**: 是否所有信息都有证据支持?
2. **逻辑清晰性**: 从发现到结论的推理过程清晰吗?
3. **可验证性**: 我能独立复现这个问题吗?
4. **根因准确性**: 理由是否准确?
5. **修复正确性**: 建议的修复是否真的有效?

如果任何部分不清晰，审核人会要求补充信息。
`;

export default {
  generateFindingMarkdown,
  generateFindingJSON,
  FindingTemplateGuide
};
