/**
 * 反八股正则脚本（clewd 兼容）
 * 从「夏瑾 天琴座 Beta 2.8」提取
 */

import type { RegexScript } from '../types';

/** clewd 正则 — Human/Assistant 标签替换 */
export const REGEX_CLEWD_LABELS: RegexScript[] = [
  {
    name: 'clewd_Human替换',
    findRegex: '"/Human: /gs"',
    replaceString: '"User: "',
    placement: [2],
    disabled: false,
    markdownOnly: true,
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
    trimStrings: [],
  },
  {
    name: 'clewd_Assistant替换',
    findRegex: '"/Assistant: /gs"',
    replaceString: '"Haruki: "',
    placement: [2],
    disabled: false,
    markdownOnly: true,
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
    trimStrings: [],
  },
];

/** SPreset 正则绑定 — 八股抹除 4.24 */
export const REGEX_SPRESET_ANTICLICHE: RegexScript = {
  name: 'SPreset_八股抹除_4.24',
  findRegex: `/而(?=是)|(?<=[，"。\\s])不是[\\S]*?[，, 。]|(个动作|个反应|个认知|个笑容)|突然|忽然|一(丝+)|(、?)不容置疑([的地]?)|(、?)(不易|难以)(觉察|察觉)([的地]?)|(微|几)不可(查|察|闻)([的地]?)|[，,]([^，,]*?)指(关节|节|尖)(.*?)白([^，,]*?)(?=[。，,])|(?<=[\\s"。])([^，"]*?)(一抹|弧度)([^，]*?)[。，]|[，,]([^，,"]*?)(一抹|弧度)([^，]*?)(?=[。，,])|(?<=[\\s"。])(.*?)(语气|话像)([^。]*?)[。，]/g`,
  replaceString: '',
  placement: [2],
  disabled: false,
  markdownOnly: true,
  promptOnly: true,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
  trimStrings: [],
};

export const ANTI_CLICHE_SCRIPTS: RegexScript[] = [
  ...REGEX_CLEWD_LABELS,
  REGEX_SPRESET_ANTICLICHE,
];
