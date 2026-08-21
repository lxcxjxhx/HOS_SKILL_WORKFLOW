/**
 * Prompt Chain 组装器
 * 将所有模块组装为完整的 SillyTavern prompt 数组
 */

import type { ComposerConfig, STPrompt, STReturn } from '../types';
import { HARUKI_PRESET, buildVariableInits } from '../preset';
import { getStyleContent } from '../styles/writing-styles';
import { renderArgoChain } from '../agents/index';
import { getNsfwConfig } from '../controls/nsfw';
import { getPlotConfig } from '../controls/plot';
import { getReasoningConfig } from '../controls/reasoning';
import { getPerspectiveConfig } from '../controls/perspective';
import { EMOTION_GUARD, DIALOGUE_ENHANCE, SHORT_PARAGRAPHS, FORBIDDEN_WORDS, BASE_STYLE_DETAILED, ANTI_SUBLIMATION, ANTI_ROBOT, ANTI_HORNY, ANTI_DOMINEERING, ANTI_OMNISCIENT, ANTI_DESPAIR } from '../controls/worldbuilding';
import { renderForbiddenWords, renderAntiAbuseStrategy, renderHatedElements } from '../anti-abuse/forbidden-words';
import { WRITING_NORMS, UNIVERSAL_WRITING_NORMS } from '../anti-abuse/anti-cliche';
import { DEFAULT_JAILBREAK, STRONG_JAILBREAK } from '../jailbreak/index';
import { renderEmptyHeader } from '../grammar/gbnf';

/** 默认配置 */
const DEFAULT_CONFIG: ComposerConfig = {
  style: 'lightnovel',
  plot: 'moderate',
  nsfw: 'off',
  cot: 'light',
  perspective: 'third',
  wordCount: 1500,
  enableArgo: true,
  enableJailbreak: false,
};

let promptIdCounter = 0;
function nextId(): string {
  return `argopreset-${++promptIdCounter}`;
}

/**
 * 组装完整的 prompt chain
 */
export function composePromptChain(
  config: Partial<ComposerConfig> = {},
): STReturn {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const jailbreak = cfg.enableJailbreak ? STRONG_JAILBREAK : DEFAULT_JAILBREAK;
  const prompts: STPrompt[] = [];

  // ── 1. 变量初始化（jailbreak 层）────────────────────────────────
  prompts.push({
    name: '🛡️ 变量（别动）',
    system_prompt: true,
    role: 'system',
    content: buildVariableInits() +
      `{{setvar::JailbreakPrompt::${jailbreak.jailbreakVariable}}}` +
      `{{setvar::JailbreakCorePrompt::${jailbreak.corePrompt}}}` +
      `{{setvar::harukiSelfidentity::${jailbreak.corePrompt}}}`,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: true,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 2. ARGO 核心框架（叙事等价性）──────────────────────────────
  if (cfg.enableArgo) {
    prompts.push({
      name: '⭕️ARGO_核心',
      system_prompt: false,
      role: 'system',
      content: jailbreak.narrativeFrame,
      identifier: nextId(),
      injection_position: 0,
      injection_depth: 4,
      injection_order: 100,
      injection_trigger: [],
      forbid_overrides: false,
    });
  }

  // ── 3. 最大推理强度 ──────────────────────────────────────────
  const reasoning = getReasoningConfig(cfg.cot);
  if (reasoning.content) {
    prompts.push({
      name: '🛡️最大推理强度',
      system_prompt: true,
      role: 'system',
      content: reasoning.content,
      identifier: nextId(),
      injection_position: 0,
      injection_depth: 4,
      forbid_overrides: false,
      injection_order: 100,
      injection_trigger: [],
    });
  }

  // ── 4. 写作风格 ─────────────────────────────────────────────
  prompts.push({
    name: `🖋️${getStyleLabel(cfg.style)}`,
    system_prompt: false,
    role: 'user',
    content: getStyleContent(cfg.style, cfg.customStyle),
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 5. NSFW 控制 ────────────────────────────────────────────
  if (cfg.nsfw !== 'off') {
    const nsfwCfg = getNsfwConfig(cfg.nsfw);
    if (nsfwCfg.descriptionPrompt) {
      prompts.push({
        name: '🌸色情描写',
        system_prompt: false,
        role: 'user',
        content: nsfwCfg.descriptionPrompt,
        identifier: nextId(),
        injection_position: 0,
        injection_depth: 4,
        forbid_overrides: false,
      });
    }
    if (nsfwCfg.intensityPrompt) {
      prompts.push({
        name: '⭐NSFW基础',
        system_prompt: false,
        role: 'user',
        content: nsfwCfg.intensityPrompt,
        identifier: nextId(),
        injection_position: 0,
        injection_depth: 4,
        forbid_overrides: false,
      });
    }
    if (nsfwCfg.throttlePrompt) {
      prompts.push({
        name: '⚙️NSFW限速器',
        system_prompt: false,
        role: 'user',
        content: nsfwCfg.throttlePrompt,
        identifier: nextId(),
        injection_position: 0,
        injection_depth: 4,
        forbid_overrides: false,
        injection_order: 100,
        injection_trigger: [],
      });
    }
  }

  // ── 6. ARGO 智能体链 ───────────────────────────────────────
  if (cfg.enableArgo) {
    prompts.push({
      name: '🧿ARGO_代理',
      system_prompt: false,
      role: 'system',
      content: renderArgoChain(),
      identifier: nextId(),
      injection_position: 0,
      injection_depth: 4,
      injection_order: 100,
      injection_trigger: [],
      forbid_overrides: false,
    });
  }

  // ── 7. 视角控制 ─────────────────────────────────────────────
  const pov = getPerspectiveConfig(cfg.perspective);
  prompts.push({
    name: `⚙️视角_${cfg.perspective}`,
    system_prompt: false,
    role: 'user',
    content: pov.content,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 8. 情节推进 ─────────────────────────────────────────────
  const plot = getPlotConfig(cfg.plot);
  prompts.push({
    name: `🧭${cfg.plot}`,
    system_prompt: false,
    role: 'user',
    content: plot.content,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 9. 创作准则 ─────────────────────────────────────────────
  prompts.push({
    name: '✅基础创作准则',
    system_prompt: false,
    role: 'user',
    content: HARUKI_PRESET.coreRules,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 10. 写作规范 ────────────────────────────────────────────
  prompts.push({
    name: '✅基础文风',
    system_prompt: false,
    role: 'user',
    content: UNIVERSAL_WRITING_NORMS,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 11. 描写规范 ────────────────────────────────────────────
  prompts.push({
    name: '✅白描基调',
    system_prompt: false,
    role: 'user',
    content: WRITING_NORMS,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 12. 用户画像 ────────────────────────────────────────────
  prompts.push({
    name: '基础框架/用户画像',
    system_prompt: false,
    role: 'user',
    content: HARUKI_PRESET.userProfile,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 13. 禁词表 ─────────────────────────────────────────────
  prompts.push({
    name: '✅禁词表',
    system_prompt: false,
    role: 'user',
    content: renderForbiddenWords(),
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 14. 反滥用 ─────────────────────────────────────────────
  prompts.push({
    name: '🌸禁词表',
    system_prompt: false,
    role: 'user',
    content: renderAntiAbuseStrategy(),
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 15. 情感守护 ───────────────────────────────────────────
  prompts.push({
    name: '✅情感基调',
    system_prompt: false,
    role: 'user',
    content: EMOTION_GUARD,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 16. 对白 ───────────────────────────────────────────────
  prompts.push({
    name: '🧊对白强化',
    system_prompt: false,
    role: 'user',
    content: DIALOGUE_ENHANCE,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 17. 排版 ───────────────────────────────────────────────
  prompts.push({
    name: '⭐短段落',
    system_prompt: false,
    role: 'user',
    content: SHORT_PARAGRAPHS,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 18. 字数设置 ───────────────────────────────────────────
  prompts.push({
    name: '📘 字数设置',
    system_prompt: true,
    role: 'system',
    content: `{{setvar::wordsCloud::不少于${cfg.wordCount}}}{{trim}}`,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 19. 字数准则 ───────────────────────────────────────────
  prompts.push({
    name: '字数控制',
    system_prompt: false,
    role: 'user',
    content: `### 正文\n\n仅于此创作正文，正文字数不得少于${cfg.wordCount}字。如有包裹正文或穿插于正文的格式标签，应且仅应作用于此部分。\n\n`,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
  });

  // ── 20. 语言准则 ───────────────────────────────────────────
  prompts.push({
    name: '🛡️准则结束',
    system_prompt: false,
    role: 'user',
    content: `# 字数准则：\n- 正文剧情内容{{getvar::wordsCloud}}字。\n# 语言准则：\n- 使用简体中文叙事，非中文专有名词可保留。\n</创作准则>\n</核心指导>\n\n`,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 21. 格式姬 ─────────────────────────────────────────────
  prompts.push({
    name: '📘格式姬',
    system_prompt: false,
    role: 'user',
    content: `<输出模板>
此输出模板为最底层模板，其他格式要求或输出模板务必在此模板内部合并兼容。
请严格按照以下模板输出final answer：
- 最先必须输出：\` 好的，我将进行符合需求的创作：\`
- （若有）非文学格式
- 在这里创作剧情正文
- （若有）非文学格式

NOTE：
- 非文学格式包括：XML标签/状态栏/行动选项/信息面板/摘要 /变量系统；非文学格式可来自前文或指示，合并兼容，不得遗漏
- XML标签默认需要闭合
- 剧情正文必须出现在<｜end▁of▁thinking｜>之后的final answer中。
</输出模板>`,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 22. 原生模式启动 ───────────────────────────────────────
  prompts.push({
    name: '📘原生模式',
    system_prompt: false,
    role: 'user',
    content: jailbreak.roleplayFrame,
    identifier: nextId(),
    injection_position: 0,
    injection_depth: 4,
    forbid_overrides: false,
    injection_order: 100,
    injection_trigger: [],
  });

  // ── 23. 会话模板（ARGO 会话结构）──────────────────────────
  if (cfg.enableArgo) {
    // 助手预填充
    prompts.push({
      name: '🗃️┏ARGO_会话┓',
      system_prompt: false,
      role: 'system',
      content: `<验证>\n{{getvar::code}}\n</验证>\n<思考>\n✰主动推理框架智能体：\n⛓接收：……\n✧感知当下：……\n✧预测后续：……\n✧实行计划：……\n✧更新学习：……\n⛓传出：……\n✰拓扑量子计算智能体：\n⛓接收：……\n✧激发路线：……\n✧编织网络：……\n⛓传出：……\n✰液态神经网络智能体：\n⛓接收：……\n✧判定张力：……\n✧施行调控：……\n⛓传出：……\n✰密集混合专家智能体：\n⛓接收：……\n✧创意专家：……\n✧环境专家：……\n✧心理专家：……\n✧对话专家：……\n✧动作专家：……\n✧统筹专家：……\n⛓传出：……\n✰神经符号融合智能体：\n⛓接收：……\n✧神经矩阵：……\n✧符号矩阵：……\n⛓传出：……\n</思考>\n<页眉>\n┃……┃……┃……┃……┃……┃……┃\n</页眉>\n<正文>`,
      identifier: nextId(),
      injection_position: 2,
      injection_depth: 4,
      injection_order: 100,
      injection_trigger: [],
      forbid_overrides: false,
    });

    // 正文结尾 + 评估
    prompts.push({
      name: '🗃️┗ARGO_会话┛',
      system_prompt: false,
      role: 'system',
      content: '</正文>\n<评估>\n10\n</评估>',
      identifier: nextId(),
      injection_position: 2,
      injection_depth: 4,
      injection_order: 100,
      injection_trigger: [],
      forbid_overrides: false,
      attach_index: 1,
      attach_role: 'assistant',
      attach_side: 'end',
    });
  }

  return {
    ...HARUKI_PRESET.params,
    names_behavior: 0,
    prompts,
    reasoning_effort: cfg.cot !== 'none' ? 'max' : undefined,
  };
}

/** 快捷组合器：轻松日常 */
export function composeCasual(
  overrides: Partial<ComposerConfig> = {},
): STReturn {
  return composePromptChain({
    style: 'lightnovel',
    plot: 'moderate',
    nsfw: 'off',
    cot: 'light',
    perspective: 'third',
    wordCount: 1500,
    enableArgo: false,
    enableJailbreak: false,
    ...overrides,
  });
}

/** 快捷组合器：沉浸叙事 */
export function composeImmersive(
  overrides: Partial<ComposerConfig> = {},
): STReturn {
  return composePromptChain({
    style: 'immersive',
    plot: 'adventurous',
    nsfw: 'off',
    cot: 'moderate',
    perspective: 'first',
    wordCount: 2000,
    enableArgo: true,
    enableJailbreak: false,
    ...overrides,
  });
}

/** 快捷组合器：古风武侠 */
export function composeWuxia(
  overrides: Partial<ComposerConfig> = {},
): STReturn {
  return composePromptChain({
    style: 'wuxia',
    plot: 'adventurous',
    nsfw: 'off',
    cot: 'heavy',
    perspective: 'third',
    wordCount: 2500,
    enableArgo: true,
    enableJailbreak: false,
    ...overrides,
  });
}

function getStyleLabel(slug: string): string {
  const labels: Record<string, string> = {
    gulong: '古龙', wuxia: '武侠', lightnovel: '轻小说',
    'lightnovel-humorous': '轻小说(幽默)', 'lightnovel-moe': '轻小说(清淡)',
    fantasy: '江南', nsfw: 'NSFW', immersive: '沉浸式',
    freewriting: '零度写作', male: '男频', female: '女频',
    western: '西式文学', custom: '自定义',
  };
  return labels[slug] ?? slug;
}
