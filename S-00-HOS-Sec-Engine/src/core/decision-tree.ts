import { DecisionNode, DecisionCondition, PhaseResult } from '../types/process';

/**
 * 决策树评估结果
 */
export interface DecisionResult {
  /** 是否找到匹配的条件 */
  matched: boolean;
  /** 匹配条件对应的下一阶段 ID */
  nextPhase: string | null;
  /** 匹配条件的描述 */
  matchDescription: string;
  /** 所有条件的评估详情 */
  evaluations: DecisionEvaluation[];
}

/**
 * 单个条件的评估结果
 */
export interface DecisionEvaluation {
  condition: DecisionCondition;
  matched: boolean;
  reason: string;
}

/**
 * 决策树引擎
 * 根据阶段执行结果，自动决定下一个要执行的阶段
 */
export class DecisionTree {
  private nodes: Map<string, DecisionNode> = new Map();

  /**
   * 注册决策节点
   */
  registerNode(node: DecisionNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * 批量注册决策节点
   */
  registerNodes(nodes: DecisionNode[]): void {
    for (const node of nodes) {
      this.registerNode(node);
    }
  }

  /**
   * 根据阶段结果执行决策
   * @param sourcePhase 源阶段 ID
   * @param phaseResult 阶段执行结果
   * @returns 决策结果
   */
  evaluate(sourcePhase: string, phaseResult: PhaseResult): DecisionResult {
    // 查找匹配的决策节点
    const node = this.findNodeForPhase(sourcePhase);
    if (!node) {
      return {
        matched: false,
        nextPhase: null,
        matchDescription: `未找到阶段 ${sourcePhase} 对应的决策节点`,
        evaluations: [],
      };
    }

    // 评估所有条件
    const evaluations: DecisionEvaluation[] = [];
    for (const condition of node.conditions) {
      const evalResult = this.evaluateCondition(condition, phaseResult);
      evaluations.push(evalResult);
    }

    // 查找第一个匹配的条件
    const matchedEval = evaluations.find(e => e.matched);
    if (matchedEval) {
      return {
        matched: true,
        nextPhase: matchedEval.condition.nextPhase,
        matchDescription: matchedEval.reason,
        evaluations,
      };
    }

    // 无匹配条件，使用默认
    return {
      matched: false,
      nextPhase: node.defaultNext,
      matchDescription: node.defaultNext
        ? `无匹配条件，使用默认下一阶段: ${node.defaultNext}`
        : '无匹配条件，且无默认下一阶段，流程结束',
      evaluations,
    };
  }

  /**
   * 查找与指定阶段关联的决策节点
   */
  private findNodeForPhase(phaseId: string): DecisionNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.sourcePhase === phaseId) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(condition: DecisionCondition, result: PhaseResult): DecisionEvaluation {
    const rule = condition.rule;

    // 解析规则表达式并评估
    try {
      // 内置规则解析器
      if (rule.includes('result.hasFindings()')) {
        const matched = result.findings.length > 0;
        return {
          condition,
          matched,
          reason: matched
            ? `发现 ${result.findings.length} 个问题`
            : '未发现任何问题',
        };
      }

      if (rule.includes('result.hasCriticalVulnerability()')) {
        const matched = result.findings.some(f => f.severity === 'critical' || f.severity === 'high');
        return {
          condition,
          matched,
          reason: matched
            ? '发现高危漏洞'
            : '未发现高危漏洞',
        };
      }

      if (rule.includes('result.hasVulnerability()')) {
        const matched = result.findings.length > 0;
        return {
          condition,
          matched,
          reason: matched
            ? `发现 ${result.findings.length} 个漏洞`
            : '未发现漏洞',
        };
      }

      if (rule.includes('result.hasAccess()')) {
        const matched = result.status === 'success' && result.findings.some(f =>
          f.type === 'rce' || f.type === 'command-injection' || f.type === 'auth-bypass'
        );
        return {
          condition,
          matched,
          reason: matched
            ? '已获取访问权限'
            : '未获取访问权限',
        };
      }

      if (rule.includes('result.hasS3Bucket()')) {
        const matched = result.findings.some(f => f.type === 's3-misconfiguration');
        return {
          condition,
          matched,
          reason: matched
            ? '发现 S3 存储桶配置问题'
            : '未发现 S3 存储桶',
        };
      }

      // WAF 相关规则
      if (rule.includes('result.hasWaf()')) {
        const matched = result.findings.some(f => f.type === 'waf-detected');
        return {
          condition,
          matched,
          reason: matched
            ? '检测到 WAF 保护'
            : '未检测到 WAF',
        };
      }

      if (rule.includes('result.isCloudflare()')) {
        const matched = result.findings.some(f =>
          f.type === 'waf-detected' && f.description.includes('Cloudflare')
        );
        return {
          condition,
          matched,
          reason: matched
            ? '检测到 Cloudflare WAF'
            : '非 Cloudflare 保护',
        };
      }

      if (rule.includes('result.hasWafBypassTool()')) {
        const matched = result.findings.some(f => f.type === 'waf-bypass-recommendation');
        return {
          condition,
          matched,
          reason: matched
            ? '有可用的 WAF 绕过建议'
            : '无 WAF 绕过建议',
        };
      }

      // 未知规则，回退到检查是否有 findings
      const matched = result.findings.length > 0;
      return {
        condition,
        matched,
        reason: matched
          ? `阶段完成，发现 ${result.findings.length} 个问题`
          : '阶段完成，无发现',
      };
    } catch (error) {
      return {
        condition,
        matched: false,
        reason: `规则评估异常: ${error}`,
      };
    }
  }

  /**
   * 清除所有决策节点
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * 获取已注册的决策节点数量
   */
  getNodeCount(): number {
    return this.nodes.size;
  }
}

/** 全局单例 */
export const decisionTree = new DecisionTree();