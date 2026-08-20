/**
 * ARGO UI 美化正则脚本
 * 从「ARGO 1.3」提取
 */

import type { RegexScript } from '../types';

/** 验证_美化 — 移除验证标签 */
export const REGEX_BEAUTIFY_VERIFY: RegexScript = {
  name: '验证_美化',
  findRegex: '/<验证>\\s*([^]*?)\\s*(</验证>|$)/g',
  replaceString: '',
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: false,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

/** 思考_美化 — 将 <思考> 标签渲染为可折叠的彩虹 UI */
export const REGEX_BEAUTIFY_THINKING: RegexScript = {
  name: '思考_美化',
  findRegex: '/<思考>\\s*([^]*?)\\s*(</思考>|$)/g',
  replaceString: `<details class="reasoning">
    <summary class="reasoning_toggle">
        <span class="reasoning_arrow_left">▶</span>
        <span class="reasoning_line_left"></span>
        <span class="reasoning_name">ARGO</span>
        <span class="reasoning_line_right"></span>
        <span class="reasoning_arrow_right">◀</span>
    </summary>
    <div class="reasoning_content">
        $1
    </div>
</details>`,
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: false,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

/** 页眉_美化 — 将 <页眉> 标签渲染为彩虹渐变页眉 */
export const REGEX_BEAUTIFY_HEADER: RegexScript = {
  name: '页眉_美化',
  findRegex: '/<页眉>\\s*([^]*?)\\s*(</页眉>|$)/g',
  replaceString: `<div class="header">
    <div class="header_base">
        <div class="header_content">
            $1
        </div>
    </div>
</div>`,
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: false,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

/** 正文_美化 — 将 <正文> 标签渲染为呼吸光效正文区 */
export const REGEX_BEAUTIFY_BODY: RegexScript = {
  name: '正文_美化',
  findRegex: '/<正文>\\s*([^]*?)\\s*(</正文>|$)/g',
  replaceString: `<div class="main">
    <div class="main_base">
        <div class="main_content">
            $1
        </div>
    </div>
</div>`,
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: false,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

/** 评估_美化 — 移除评估标签 */
export const REGEX_BEAUTIFY_EVAL: RegexScript = {
  name: '评估_美化',
  findRegex: '/<评估>\\s*([^]*?)\\s*(</评估>|$)/g',
  replaceString: '',
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: false,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

export const ARGO_BEAUTIFIER_SCRIPTS: RegexScript[] = [
  REGEX_BEAUTIFY_VERIFY,
  REGEX_BEAUTIFY_THINKING,
  REGEX_BEAUTIFY_HEADER,
  REGEX_BEAUTIFY_BODY,
  REGEX_BEAUTIFY_EVAL,
];
