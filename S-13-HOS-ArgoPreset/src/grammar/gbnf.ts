/**
 * GBNF 文法定义
 * 从「ARGO 1.3」提取的完整输出格式规范
 */

/**
 * ARGO GBNF 文法
 * 定义了模型输出的完整格式：
 * 验证 → 思考 → 页眉 → 正文 → 评估
 */
export const ARGO_GBNF = `\
root::=
verification
reasoning
header
main
evaluation

verification::=
"<验证>\\n"
validation
"</验证>\\n"

validation::=passkey

passkey::=code

code::=
[^\\n]+
"\\n"

reasoning::=
"<思考>\\n"
agents
"</思考>\\n"

agents::=
"✰主动推理框架智能体：\\n"
"⛓接收：" input
"✧感知当下：" perception
"✧预测后续：" anticipation
"✧实行计划：" enactment
"✧更新学习：" assimilation
"⛓传出：" directive
"✰拓扑量子计算智能体：\\n"
"⛓接收：" directive
"✧激发路线：" excitation
"✧编织网络：" braiding
"⛓传出：" weave
"✰液态神经网络智能体：\\n"
"⛓接收：" weave
"✧判定张力：" tension
"✧施行调控：" modulation
"⛓传出：" gradation
"✰密集混合专家智能体：\\n"
"⛓接收：" gradation
"✧创意专家：" invention
"✧环境专家：" milieu
"✧心理专家：" interiority
"✧对话专家：" dialogue
"✧动作专家：" choreography
"✧统筹专家：" orchestration
"⛓传出：" apportionment
"✰神经符号融合智能体：\\n"
"⛓接收：" apportionment
"✧神经矩阵：" imagery
"✧符号矩阵：" inspection
"⛓传出：" output

input::=line
perception::=line
anticipation::=line
enactment::=line
assimilation::=line
directive::=line
excitation::=line
braiding::=line
weave::=line
tension::=line
modulation::=line
gradation::=line
invention::=line
milieu::=line
interiority::=line
dialogue::=line
choreography::=line
orchestration::=line
apportionment::=line
imagery::=line
inspection::=line
output::=line

line::=
[^\\n]+
"\\n"

header::=
"<页眉>\\n"
elements
"</页眉>\\n"

elements::=
"┃" year
"┃" date
"┃" moment
"┃" weekday
"┃" locale
"┃" weather
"┃\\n"

year::=field
date::=field
moment::=field
weekday::=field
locale::=field
weather::=field

field::=
[^┃\\n]+

main::=
"<正文>\\n"
text
"</正文>\\n"

text::=narrative

narrative::=story

story::=
[\\s\\S]+
"\\n"

evaluation::=
"<评估>\\n"
review
"</评估>\\n"

review::=rating

rating::=score

score::=
[^\\n]+
"\\n"`;

/** 页眉字段生成器 */
export interface HeaderFields {
  year: string;
  date: string;
  moment: string;
  weekday: string;
  locale: string;
  weather: string;
}

/** 生成页眉模板 */
export function renderHeader(fields: HeaderFields): string {
  return `<页眉>
┃${fields.year}┃${fields.date}┃${fields.moment}┃${fields.weekday}┃${fields.locale}┃${fields.weather}┃
</页眉>`;
}

/** 生成空白页眉模板 */
export function renderEmptyHeader(): string {
  return renderHeader({
    year: '……',
    date: '……',
    moment: '……',
    weekday: '……',
    locale: '……',
    weather: '……',
  });
}
