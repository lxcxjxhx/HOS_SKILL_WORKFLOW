/**
 * 格式清洗正则脚本
 * 从「夏瑾 天琴座 Beta 2.8」提取
 */

import type { RegexScript } from '../types';

/** 包裹最新指示 */
export const REGEX_WRAP_LATEST: RegexScript = {
  name: '包裹最新指示',
  findRegex: '^([\\\\s\\\\S]*)$',
  replaceString: '<最新互动>\n$1\n</最新互动>',
  placement: [1],
  disabled: false,
  markdownOnly: false,
  promptOnly: true,
  runOnEdit: true,
  substituteRegex: 0,
  minDepth: 1,
  maxDepth: 1,
  trimStrings: [],
};

/** 移除额外 tag */
export const REGEX_REMOVE_EXTRA_TAGS: RegexScript = {
  name: '移除额外tag',
  findRegex: '/^[\\\\s\\\\S]*?(我将进行符合需求的创作：|</thinking>|#+ 正式创作|<\\\\/preparation>)|(<!--[\\\\s\\\\S]*?-->\\\\s?)|<content>\\\\s*##[\\\\s\\\\S]*?---|<thinking>[\\\\s\\\\S]*?</thinking>/g',
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

/** 八股抹除 — 核心反重复正则 */
export const REGEX_ANTICLICHE: RegexScript = {
  name: '八股抹除',
  findRegex: `/而(?=是)|(?<=[，"。\\\\s])不是[\\\\S]*?[，, 。]|(个动作|个反应|个认知|个笑容)|突然|忽然|一(丝+)|(、?)不容置疑([的地]?)|(、?)(不易|难以)(觉察|察觉)([的地]?)|(微|几)不可(查|察|闻)([的地]?)|[，,]([^，,]*?)指(关节|节|尖)(.*?)白([^，,]*?)(?=[。，,])|(?<=[\\\\s"。])([^，"]*?)(一抹|弧度)([^，]*?)[。，]|[，,]([^，,"]*?)(一抹|弧度)([^，]*?)(?=[。，,])|(?<=[\\\\s"。])(.*?)(语气|话像)([^。]*?)[。，]/g`,
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

export const FORMAT_CLEANUP_SCRIPTS: RegexScript[] = [
  REGEX_WRAP_LATEST,
  REGEX_REMOVE_EXTRA_TAGS,
  REGEX_ANTICLICHE,
];
