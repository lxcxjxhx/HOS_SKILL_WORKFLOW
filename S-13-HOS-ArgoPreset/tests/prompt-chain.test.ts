/**
 * Prompt Chain 组装器单元测试
 */

import { composePromptChain, composeCasual, composeImmersive, composeWuxia } from '../src/composer/prompt-chain';
import { validatePromptChain, renderPromptsSummary } from '../src/output/render';
import { compileRegexScripts, applyRegexScripts } from '../src/regex/index';
import { renderArgoChain } from '../src/agents/index';
import { ARGO_GBNF } from '../src/grammar/gbnf';

describe('composePromptChain', () => {
  it('should produce a valid prompt chain with default config', () => {
    const result = composePromptChain();
    expect(result.prompts.length).toBeGreaterThan(0);
    expect(result.temperature).toBe(1);
    expect(result.openai_max_context).toBe(2000000);
  });

  it('should include ARGO agents when enableArgo is true', () => {
    const result = composePromptChain({ enableArgo: true });
    const hasArgo = result.prompts.some(p => p.name.includes('ARGO'));
    expect(hasArgo).toBe(true);
  });

  it('should exclude ARGO agents when enableArgo is false', () => {
    const result = composePromptChain({ enableArgo: false });
    const hasArgo = result.prompts.some(p => p.name.includes('ARGO'));
    expect(hasArgo).toBe(false);
  });

  it('should include NSFW prompts when nsfw is not off', () => {
    const result = composePromptChain({ nsfw: 'standard' });
    const hasNsfw = result.prompts.some(p => p.name.includes('NSFW') || p.name.includes('色情'));
    expect(hasNsfw).toBe(true);
  });

  it('should not include NSFW prompts when nsfw is off', () => {
    const result = composePromptChain({ nsfw: 'off' });
    const hasNsfw = result.prompts.some(p => p.name.includes('色情描写'));
    expect(hasNsfw).toBe(false);
  });

  it('should have unique identifiers', () => {
    const result = composePromptChain();
    const ids = result.prompts.map(p => p.identifier);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('composeCasual', () => {
  it('should produce a casual preset', () => {
    const result = composeCasual();
    expect(result.prompts.length).toBeGreaterThan(0);
  });
});

describe('composeImmersive', () => {
  it('should produce an immersive preset with ARGO', () => {
    const result = composeImmersive();
    const hasArgo = result.prompts.some(p => p.name.includes('ARGO'));
    expect(hasArgo).toBe(true);
  });
});

describe('composeWuxia', () => {
  it('should produce a wuxia preset with heavy reasoning', () => {
    const result = composeWuxia();
    expect(result.reasoning_effort).toBe('max');
  });
});

describe('validatePromptChain', () => {
  it('should return no issues for a valid chain', () => {
    const result = composePromptChain();
    const issues = validatePromptChain(result);
    expect(issues).toHaveLength(0);
  });

  it('should report issues for an empty chain', () => {
    const issues = validatePromptChain({ prompts: [], temperature: 1, frequency_penalty: 0, presence_penalty: 0, top_p: 1, top_k: 0, top_a: 1, min_p: 0, repetition_penalty: 1, max_context_unlocked: true, openai_max_context: 2000000, openai_max_tokens: 65535, names_behavior: 0, stream_openai: true } as any);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('renderPromptsSummary', () => {
  it('should render a readable summary', () => {
    const result = composePromptChain();
    const summary = renderPromptsSummary(result);
    expect(summary).toContain('Prompts');
    expect(summary.length).toBeGreaterThan(50);
  });
});

describe('renderArgoChain', () => {
  it('should render all 5 agent layers', () => {
    const chain = renderArgoChain();
    expect(chain).toContain('主动推理框架智能体');
    expect(chain).toContain('拓扑量子计算智能体');
    expect(chain).toContain('液态神经网络智能体');
    expect(chain).toContain('密集混合专家智能体');
    expect(chain).toContain('神经符号融合智能体');
  });
});

describe('ARGO GBNF', () => {
  it('should contain all structural elements', () => {
    expect(ARGO_GBNF).toContain('verification');
    expect(ARGO_GBNF).toContain('reasoning');
    expect(ARGO_GBNF).toContain('header');
    expect(ARGO_GBNF).toContain('main');
    expect(ARGO_GBNF).toContain('evaluation');
  });
});

describe('regex compilation', () => {
  it('should compile valid regex scripts', () => {
    const scripts = [
      { name: 'test', findRegex: '/test/g', replaceString: 'replaced', placement: [2], disabled: false, markdownOnly: true, promptOnly: false, runOnEdit: true, substituteRegex: 0, minDepth: null, maxDepth: null, trimStrings: [] },
    ];
    const compiled = compileRegexScripts(scripts);
    expect(compiled.length).toBe(1);
  });

  it('should skip disabled scripts', () => {
    const scripts = [
      { name: 'disabled', findRegex: '/test/g', replaceString: '', placement: [2], disabled: true, markdownOnly: true, promptOnly: false, runOnEdit: true, substituteRegex: 0, minDepth: null, maxDepth: null, trimStrings: [] },
    ];
    const compiled = compileRegexScripts(scripts);
    expect(compiled.length).toBe(0);
  });

  it('should apply regex to text', () => {
    const scripts = [
      { name: 'test', findRegex: '/hello/g', replaceString: 'world', placement: [2], disabled: false, markdownOnly: true, promptOnly: false, runOnEdit: true, substituteRegex: 0, minDepth: null, maxDepth: null, trimStrings: [] },
    ];
    const compiled = compileRegexScripts(scripts);
    const result = applyRegexScripts('hello hello', compiled);
    expect(result).toBe('world world');
  });
});
