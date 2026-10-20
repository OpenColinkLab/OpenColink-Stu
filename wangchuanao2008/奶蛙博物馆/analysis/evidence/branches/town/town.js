// 奶蛙小镇 · 模拟内核
// 全部在浏览器里跑：没有后端、没有联网模型。
// 对话 = 角色声库 + 记忆检索（哈希向量 + 余弦）拼出来的；记忆存在本地。
// 旅行与物品互动为预设内容，不接入 AI 生成。

/* ---------------------------------------------------------------- 向量 */
const DIM = 1024;

function fnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function hashEmbed(text) {
  const v = new Float32Array(DIM);
  const s = String(text || '').toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i < s.length; i++) {
    const gram = s.slice(Math.max(0, i - 1), i + 1);
    const h = fnv1a(gram);
    v[h % DIM] += h & 0x80000000 ? -1 : 1;
  }
  let n = 0;
  for (let i = 0; i < DIM; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < DIM; i++) v[i] /= n;
  return v;
}

export function cosine(a, b) {
  let d = 0;
  for (let i = 0; i < DIM; i++) d += a[i] * b[i];
  return d;
}

/* ---------------------------------------------------------------- 居民 */
export const RESIDENTS = [
  {
    key: 'azheng',
    name: '阿蒸',
    identity:
      '阿蒸是奶白大街拐角早点铺的老板娘。它记性很好，认人靠咳嗽的尾音、步幅的大小，还有谁习惯站在门口哪一块砖上。蒸笼的火候和老街坊的早饭，都是它每天惦记的事。',
    plan: '照看好蒸笼的火候，顺便打听街上每一只奶蛙今天都去了哪。',
    tics: ['蒸笼上还压着一笼', '面醒到八分了', '门口那块地砖我又擦了一遍', '今早的白气起得比往常早'],
    asks: ['你今天吃过没？', '要不要来一屉？', '豆浆还热着，喝不喝？', '上回你说爱吃咸的，还是吗？'],
    reacts: {
      food: ['那你说说，咸的还是甜的？', '馅儿得现剁才对味。', '火候差一寸，味儿差一里。', '发面得看天气，今天这湿度刚好。'],
      screen: ['屏幕上的脸再标准，也得吃早饭。', '那玩意儿一天亮二十四个钟头，不累吗。', '我只看它亮着没亮着，别的不关心。'],
      face: ['你那个表情我倒见过一次，就在蒸汽最浓的时候。', '脸都一样，可我认得出影子。', '不用学谁，你站我这门口，我就认得你。'],
      default: ['嗯，我听着呢。', '你说的这个我记下了。', '街口那家修鞋的也这么讲。', '你说慢点，我这手上还忙着。'],
    },
  },
  {
    key: 'dengzai',
    name: '灯仔',
    identity:
      '灯仔是巨幕控制室的放映员，管着广场上方的电子屏。它话少、手稳，每天都要仔细核对屏幕的颜色。喝完一杯豆浆，它就又去看那张熟悉的脸。',
    plan: '核对今天屏幕上那张脸，确认它和昨天一模一样，并且打听街上有没有谁不太对劲。',
    tics: ['我对了一遍色，还差半格', '控制室那盏暖灯又闪了', '巨幕不能停机', '今天的灰阶比昨天浅一点'],
    asks: ['你看见屏幕今天偏色了吗？', '你说，那张脸跟昨天一样吗？', '你过来的时候，抬头看了没有？', '你觉得我是不是盯得太紧了？'],
    reacts: {
      food: ['先不急吃，我得回去盯一眼屏幕。', '行，但别耽误我对色。', '你吃你的，我喝口豆浆就走。', '早饭我一般站着吃。'],
      screen: ['只要屏幕上的脸不变，全城就不会乱。', '我核对过三十七遍，一格都不能差。', '差半格我也看得出来，你信不信。', '屏幕一停，街上的人就会开始乱想。'],
      face: ['……你也听说了？我还没敢查。', '别跟我提那个表情，我睡不着。', '如果它真的不一样，那标准算什么。', '我宁可相信是屏幕坏了。'],
      default: ['嗯。', '我记下了。', '这事儿我得再核一遍。', '我话少，你别介意。'],
    },
  },
  {
    key: 'duoyige',
    name: '多一格',
    identity:
      '多一格是在街上被拍到的那只奶蛙。外形和全城任何一只都没有可辨差异，唯一的不同在笑与不笑之间：它多出一档过渡——半眯着眼，说不清是困还是得意。没人知道它从哪来。',
    plan: '找个信得过的奶蛙，问问自己脸上多出来的那一格到底算不算错，顺便偷偷练习表情。',
    tics: ['我最近在练一个表情', '半眯着眼，你试试看', '这个角度像不像笑', '我刚才那一下是不是太过了'],
    asks: ['你说，这样算不算笑？', '你看见我刚才那一下了吗？', '你会不会也有多出来的一格？', '你会不会觉得我这样很奇怪？'],
    reacts: {
      food: ['吃东西的时候，脸好像会自己动。', '我边吃边练，别管我。', '热的东西会让人眯眼睛，这算不算。'],
      screen: ['屏幕上的那张脸，我学不会。', '它太标准了，标准到没有缝。', '我盯着它看了一整天，它一次都没变过。'],
      face: ['对，就那一格。多出来的那一格。', '我不想跟它一样，可我也不想吓到谁。', '每天早上我都会在玻璃前面站一会儿。', '我不是故意不一样的。'],
      default: ['嗯……我记着了。', '你这句话我想留一会儿。', '我刚才是不是又眯眼了？', '那你先别说，让我自己想想。'],
    },
  },
];

/* ---------------------------------------------------------------- 目的地 */
// 合成位置 shot 用底图比例表示：x/y 是脚底落点，h 是奶蛙高度占底图高度的比例。
export const DESTINATIONS = [
  {
    key: 'beach', name: '海边', item: 'shell', backdrop: 'assets/travel-beach.webp',
    quote: '海很大，口袋很小。',
    shot: { x: 0.3, y: 0.905, h: 0.58 },
  },
  {
    key: 'forest', name: '森林', item: 'leaf', backdrop: 'assets/travel-forest.webp',
    quote: '带回一把不用充电的伞。',
    shot: { x: 0.5, y: 0.9, h: 0.56 },
  },
  {
    key: 'market', name: '集市', item: 'carton', backdrop: 'assets/travel-market.webp',
    quote: '没买东西，但有了一个家。',
    shot: { x: 0.36, y: 0.92, h: 0.54 },
  },
];

export const ITEMS = {
  shell: { key: 'shell', name: '贝壳', file: 'assets/item-shell.png' },
  leaf: { key: 'leaf', name: '树叶', file: 'assets/item-leaf.png' },
  carton: { key: 'carton', name: '纸箱', file: 'assets/item-carton.png' },
};

export const PERSONALITIES = {
  quiet: { key: 'quiet', name: '安静型' },
  lively: { key: 'lively', name: '活泼型' },
  business: { key: 'business', name: '经营型' },
};

// 固定映射：阿蒸偏经营，灯仔偏安静，多一格偏活泼。没有对应性格的按顺序补一类。
const PERSONALITY_BY_KEY = { azheng: 'business', dengzai: 'quiet', duoyige: 'lively' };
const PERSONALITY_ORDER = ['quiet', 'lively', 'business'];

export function personalityFor(resident, index) {
  return PERSONALITY_BY_KEY[resident.key] || PERSONALITY_ORDER[index % PERSONALITY_ORDER.length];
}

/* ---------------------------------------------------------------- 数值养成 */
// 七项数值，全部 0–100。好感是两两关系值，面板上同时显示平均值。
export const STATS = [
  { key: 'stamina', name: '体力' },
  { key: 'intellect', name: '智力' },
  { key: 'charm', name: '魅力' },
  { key: 'strength', name: '力量' },
  { key: 'affinity', name: '好感' },
  { key: 'mood', name: '情绪' },
  { key: 'skill', name: '技能熟练度' },
];
export const STAT_KEYS = ['stamina', 'intellect', 'charm', 'strength', 'mood', 'skill'];
const STAT_MIN = 0;
const STAT_MAX = 100;

const START_STATS = {
  azheng: { stamina: 62, intellect: 54, charm: 58, strength: 56, mood: 66, skill: 46 },
  dengzai: { stamina: 50, intellect: 68, charm: 40, strength: 44, mood: 52, skill: 52 },
  duoyige: { stamina: 56, intellect: 46, charm: 62, strength: 48, mood: 70, skill: 38 },
};
const START_AFFINITY = {
  azheng: { dengzai: 52, duoyige: 55 },
  dengzai: { azheng: 50, duoyige: 44 },
  duoyige: { azheng: 56, dengzai: 46 },
};

export function clampStat(v) {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(v * 10) / 10));
}

export function moodLabel(v) {
  if (v >= 78) return '非常好';
  if (v >= 60) return '不错';
  if (v >= 42) return '平静';
  if (v >= 25) return '低落';
  return '很差';
}

// 行动 → 数值增减。行动即现有行为：交谈、玩物品、旅行、休息/活动。
export const STAT_ACTIONS = {
  talk: { label: '交谈', deltas: { stamina: -2, charm: 1, mood: 3, skill: 1 } },
  playOther: { label: '玩别人的东西', deltas: { affinityTo: null } },  trip: { label: '旅行', deltas: { stamina: -8, intellect: 3, mood: 5, skill: 1 } },
  idle: { label: '活动', deltas: { stamina: -0.8, mood: -0.2 } },
  chat: { label: '交谈中', deltas: { stamina: -1.2, mood: 0.5 } },
  rest: { label: '休息', deltas: { stamina: 4, mood: 1.5 } },
};

// 玩物品单独一张表（给玩家看行动名）
export const PLAY_RULE = { label: '玩物品', deltas: { stamina: -3, skill: 3, charm: 1, mood: 4 } };

// 玩别人的东西：对物主加好感
export const PLAY_OTHER_AFFINITY = 4;

export const UNLOCK_KINDS = { job: '职业', talent: '天赋', story: '剧情', talk: '特殊对话' };

function avgAffinity(frog) {
  const vals = Object.values(frog.affinity || {});
  if (!vals.length) return 50;
  return vals.reduce((n, v) => n + v, 0) / vals.length;
}

// 阈值解锁表。only 限定某只奶蛙；其余对所有居民生效。
export const UNLOCKS = [
  { id: 'skill40', kind: 'job', name: '熟练师傅', desc: '技能熟练度 ≥ 40', test: (s) => s.skill >= 40 },
  { id: 'int55', kind: 'talent', name: '一眼看穿', desc: '智力 ≥ 55', test: (s) => s.intellect >= 55 },
  { id: 'charm55', kind: 'talent', name: '招人喜欢', desc: '魅力 ≥ 55', test: (s) => s.charm >= 55 },
  { id: 'str55', kind: 'talent', name: '扛得动', desc: '力量 ≥ 55', test: (s) => s.strength >= 55 },
  { id: 'stam85', kind: 'talent', name: '不知疲倦', desc: '体力 ≥ 85', test: (s) => s.stamina >= 85 },
  {
    id: 'mood75', kind: 'story', name: '心情特别好的一天', desc: '情绪 ≥ 75', test: (s) => s.mood >= 75,
    line: '这天它心情特别好，见谁都点一下头。',
  },
  {
    id: 'aff60', kind: 'story', name: '街坊都认得它', desc: '平均好感 ≥ 60', test: (s) => s.affinity >= 60,
    line: '街坊都认得它了，路过的人会停下来跟它说两句。',
  },
  {
    id: 'zheng_skill60', kind: 'job', name: '掌勺', only: 'azheng', desc: '技能熟练度 ≥ 60',
    test: (s) => s.skill >= 60,
  },
  {
    id: 'deng_int65', kind: 'job', name: '总放映师', only: 'dengzai', desc: '智力 ≥ 65',
    test: (s) => s.intellect >= 65,
  },
  {
    id: 'dyg_face', kind: 'story', only: 'duoyige', name: '那一格表情终于有了名字',
    desc: '魅力 ≥ 60 且技能熟练度 ≥ 50', test: (s) => s.charm >= 60 && s.skill >= 50,
    line: '那一格表情终于有了名字——大家管它叫「多一格的笑」。',
  },
  {
    id: 'zheng_talk', kind: 'talk', only: 'azheng', name: '老街坊的招呼', desc: '技能熟练度 ≥ 60',
    test: (s) => s.skill >= 60,
    lines: ['老街坊，今天还是老样子？', '你站门口那块砖上，我就知道是你。', '粥还温着，坐下吃口再走。'],
  },
  {
    id: 'deng_talk', kind: 'talk', only: 'dengzai', name: '对色的执念', desc: '智力 ≥ 65',
    test: (s) => s.intellect >= 65,
    lines: ['今天那半格我还是看得出来。', '屏幕没事，我核过了。', '你别学我，盯久了眼睛会花。'],
  },
  {
    id: 'dyg_talk', kind: 'talk', only: 'duoyige', name: '半眯着的笑', desc: '魅力 ≥ 60 且技能熟练度 ≥ 50',
    test: (s) => s.charm >= 60 && s.skill >= 50,
    lines: ['你看，这样算不算笑了。', '我把那一格练熟了，你要不要看。', '他们管这个叫多一格的笑。'],
  },
];

// 等级：由技能熟练度划分，用于面板显示
export function rankOf(skill) {
  const tiers = [[70, '上手'], [50, '熟练'], [30, '入门']];
  for (const [min, name] of tiers) if (skill >= min) return name;
  return '生手';
}

/* ---------------------------------------------------------------- 日常状态 */
// 新增四项独立状态（0–100）。「心情」直接复用已有的 mood，不另立重复计数器。
// hunger / fatigue / clothing 越高越糟；health 越高越好。
export const CONDITIONS = [
  { key: 'hunger', name: '饥饿', higherIsWorse: true },
  { key: 'fatigue', name: '疲劳', higherIsWorse: true },
  { key: 'mood', name: '心情', higherIsWorse: false },
  { key: 'health', name: '健康', higherIsWorse: false },
  { key: 'hygiene', name: '卫生', higherIsWorse: false },
  { key: 'clothing', name: '衣着', higherIsWorse: false },
];
export const CONDITION_KEYS = ['hunger', 'fatigue', 'health', 'hygiene', 'clothing'];

const START_CONDITIONS = {
  azheng: { hunger: 34, fatigue: 18, health: 88, hygiene: 78, clothing: 80 },
  dengzai: { hunger: 28, fatigue: 24, health: 82, hygiene: 84, clothing: 86 },
  duoyige: { hunger: 40, fatigue: 14, health: 90, hygiene: 70, clothing: 72 },
};

// 每 5 秒的状态变化
const CONDITION_RATE = {
  hungerAwake: 1.2, hungerAsleep: 0.3,
  fatigueAwake: 0.6, fatigueRest: -2.5,
  clothing: -0.15,
  hygiene: -0.45,
  healthHungry: -0.8, healthTired: -0.6, healthRecover: 0.15,
};

// 低状态 debuff：effects 是每 5 秒的持续影响；refuse 表示拒绝互动；speed 是移动倍率。
export const DEBUFFS = [
  { id: 'hungry', name: '饿着', when: (c) => c.hunger >= 70, effects: { mood: -0.4, health: -0.3 } },
  { id: 'starving', name: '饿坏了', when: (c) => c.hunger >= 90, refuse: true, effects: { mood: -0.8, health: -0.8 } },
  { id: 'tired', name: '累了', when: (c) => c.fatigue >= 70, speed: 0.65, effects: { mood: -0.2 } },
  { id: 'exhausted', name: '精疲力竭', when: (c) => c.fatigue >= 90, refuse: true, speed: 0.5, effects: { mood: -0.4 } },
  { id: 'weak', name: '虚弱', when: (c) => c.health <= 40, speed: 0.75, effects: { stamina: -0.3 } },
  { id: 'sick', name: '生病', when: (c) => c.health <= 20, refuse: true, speed: 0.6, effects: { mood: -0.6, stamina: -0.5 } },
  { id: 'grubby', name: '遬遢', when: (c) => c.clothing <= 40, effects: { charm: -0.3, mood: -0.2 } },
  { id: 'dirty', name: '脏兮兮', when: (c) => c.clothing <= 15, effects: { charm: -0.6, mood: -0.4 } },
  { id: 'filthy', name: '不干净', when: (c) => c.hygiene <= 25, effects: { charm: -0.4, mood: -0.3 } },
  { id: 'blue', name: '心情很差', when: (c) => c.mood <= 30, refuse: true, effects: { stamina: -0.3 } },
];

// 状态好带来的 buff，其中「精神饱满」会额外触发事件
export const BUFFS = [
  { id: 'cheerful', name: '心情很好', when: (c) => c.mood >= 80, effects: { mood: 0.2 }, chatBoost: 1.5 },
  { id: 'sturdy', name: '结实', when: (c) => c.health >= 90, restBoost: 1.5 },
  {
    id: 'energetic', name: '精神饱满',
    when: (c) => c.hunger <= 20 && c.fatigue <= 20 && c.health >= 80 && c.clothing >= 70 && c.mood >= 70,
    effects: { skill: 0.3, mood: 0.3 }, eventChance: 0.05,
  },
];

// 玩家照顾动作（手动触发）。冷却以模拟秒计。
const CARE_ACTIONS = {
  feed: {
    label: '喂一顿', cooldown: 45,
    line: (f) => `${f.name} 吃得很安静。`,
    apply: (t, f) => {
      f.conditions.hunger = clampStat(f.conditions.hunger - 55);
      f.stats.stamina = clampStat(f.stats.stamina + 4);
      t.applyStats(f, '被喂了一顿', { mood: 6 });
      const d = {};
      for (const o of t.agents) if (o.id !== f.id) d[o.id] = 2;
      t.applyStats(f, '被喂了一顿·好感', { affinityTo: d }, { silent: true });
      f.rest = Math.max(f.rest, 4);
      f.target = null;
    },
  },
  sleep: {
    label: '睡一觉', cooldown: 90,
    line: (f) => `${f.name} 打了个盹，精神回来一些。`,
    apply: (t, f) => {
      f.conditions.fatigue = clampStat(f.conditions.fatigue - 60);
      f.stats.stamina = clampStat(f.stats.stamina + 35);
      t.applyStats(f, '睡了一觉', { mood: 4 });
      f.rest = 18;
      f.target = null;
      f.act = null;
      f.sleepUntil = t.t + 18;
    },
  },
  groom: {
    label: '洗澡', cooldown: 60,
    line: (f) => `${f.name} 洗好了，站在那里挺直了一点。`,
    apply: (t, f) => {
      f.conditions.hygiene = clampStat(f.conditions.hygiene + 70);
      f.conditions.clothing = clampStat(f.conditions.clothing + 30);
      t.applyStats(f, '洗了个澡', { mood: 4, charm: 1 });
    },
  },
};
export const CARE_KINDS = Object.keys(CARE_ACTIONS);

/* ---------------------------------------------------------------- 时间 / 季节 / 日历 */
export const DAY_SECONDS = 120; // 1 游戏日 = 120 模拟秒（1 游戏小时 = 5 秒）
export const SEASON_DAYS = 7;
export const SEASONS = [
  { key: 'spring', name: '春', tint: 'rgba(226, 240, 214, 0.16)' },
  { key: 'summer', name: '夏', tint: 'rgba(255, 238, 200, 0.18)' },
  { key: 'autumn', name: '秋', tint: 'rgba(246, 222, 186, 0.20)' },
  { key: 'winter', name: '冬', tint: 'rgba(226, 236, 246, 0.22)' },
];
export const WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
// 每个季节的最后一天是节日
export const FESTIVALS = {
  spring: { name: '开春集', note: '广场上多摆了几个摊，大家都往人多的地方走。' },
  summer: { name: '长昼祭', note: '白天特别长，河边一直有人。' },
  autumn: { name: '收货日', note: '商铺忙着进新货，打工的活最多。' },
  winter: { name: '围炉夜', note: '天黑得早，大家都想待在暖处。' },
};

export function timeOf(t) {
  const safe = Number.isFinite(t) && t >= 0 ? t : 0;
  const totalDays = Math.floor(safe / DAY_SECONDS);
  const inDay = safe - totalDays * DAY_SECONDS;
  const hours = (inDay / DAY_SECONDS) * 24;
  const hour = Math.floor(hours);
  const minute = Math.floor((hours - hour) * 60);
  const day = totalDays + 1;
  const rawIndex = Math.floor(totalDays / SEASON_DAYS);
  const seasonIndex = ((rawIndex % SEASONS.length) + SEASONS.length) % SEASONS.length;
  const dayInSeason = totalDays % SEASON_DAYS;
  const isFestival = dayInSeason === SEASON_DAYS - 1;
  return {
    day, inDay, hour, minute, hours,
    clock: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    weekday: WEEKDAYS[totalDays % 7],
    seasonIndex, season: SEASONS[seasonIndex],
    dayInSeason: dayInSeason + 1,
    festival: isFestival ? FESTIVALS[SEASONS[seasonIndex].key] : null,
    night: hour >= 19 || hour < 6,
    dark: hour >= 20 || hour < 5,
  };
}

// 一天的作息段（游戏小时）
export const SLOTS = [
  { key: 'wake', name: '起床', from: 6, to: 8 },
  { key: 'breakfast', name: '早饭', from: 8, to: 9 },
  { key: 'morning', name: '上午', from: 9, to: 12 },
  { key: 'lunch', name: '午饭', from: 12, to: 13 },
  { key: 'afternoon', name: '下午', from: 13, to: 17 },
  { key: 'dusk', name: '傍晚', from: 17, to: 19 },
  { key: 'dinner', name: '晚饭', from: 19, to: 21 },
  { key: 'evening', name: '夜里', from: 21, to: 22 },
  { key: 'sleep', name: '睡觉', from: 22, to: 6 },
];
export function slotAt(hour) {
  return SLOTS.find((s) => (s.from < s.to ? hour >= s.from && hour < s.to : hour >= s.from || hour < s.to)) || SLOTS[0];
}

// 日程倾向
export const TENDENCIES = [
  { key: 'work', name: '偏向打工' },
  { key: 'leisure', name: '偏向休闲' },
  { key: 'social', name: '偏向社交' },
];

// 地点：屋外站位落在广场铺装区；家/河边/树下复用已有的“离场”机制
export const SPOTS = {
  shop: { key: 'shop', name: '早点铺', x: 7, y: 6.5 },
  cafe: { key: 'cafe', name: '街角咖啡', x: 19.5, y: 11 },
  flower: { key: 'flower', name: '花店', x: 19.5, y: 6 },
  tower: { key: 'tower', name: '钟楼下', x: 12.5, y: 5 },
  screen: { key: 'screen', name: '巨幕下', x: 13.5, y: 4 },
  plaza: { key: 'plaza', name: '广场', x: 12, y: 9 },
  home: { key: 'home', name: '家门口', x: 5.5, y: 10.5 },
  river: { key: 'river', name: '河边', x: 6, y: 7 },
  tree: { key: 'tree', name: '树下', x: 18, y: 6.5 },
};

// 活动定义：效果按每 5 秒结算；onscreen 的走到目标点做动作，offscreen 的走到底缘离场
export const ACTIVITIES = {
  wake: { name: '刚起床', spot: 'plaza', onscreen: true, stay: 5, per: { stamina: 0.8 },
    lines: ['醒了，先站一会儿。', '今天不知道会不会有人来。'] },
  eat: { name: '吃饭', spot: 'shop', onscreen: true, stay: 10, cost: 2, per: { hunger: -19, mood: 0.6 },
    lines: ['先吃口热的。', '这笼蒸得刚好。'] },
  bread: { name: '啃便宜面包', spot: 'shop', onscreen: true, stay: 8, per: { hunger: -14, mood: -1 },
    lines: ['钱不够，先啃个面包。', '面包也行。'] },
  work: { name: '打工', spot: 'shop', onscreen: true, stay: 24, per: { stamina: -1.2, skill: 0.6, coins: 12 },
    lines: ['手上活儿还多。', '先把这一轮做完。'] },
  read: { name: '看书', spot: 'tree', onscreen: true, stay: 22, per: { intellect: 0.9, mood: 0.4 },
    lines: ['树底下风小。', '这一页看第三遍了。'] },
  walk: { name: '散步', spot: 'river', onscreen: true, stay: 18, per: { stamina: 0.6, mood: 0.7, hunger: 0.3 },
    lines: ['河边没什么人。', '走一圈就回去。'] },
  chat: { name: '找人说话', spot: 'cafe', onscreen: true, stay: 18, per: { mood: 0.7 },
    lines: ['坐这儿等熟人。', '有人来就聊两句。'] },
  daze: { name: '发呆', spot: 'plaza', onscreen: true, stay: 14, per: { mood: 0.4, stamina: 0.5 },
    lines: ['什么都不想干。', '站一会儿就好了。'] },
  bathe: { name: '洗澡', spot: 'home', onscreen: true, stay: 10, per: { hygiene: 22, mood: 0.7 },
    lines: ['洗一下清爽点。'] },
  sleep: { name: '睡觉', spot: 'home', onscreen: true, untilMorning: true, per: { stamina: 1.2, fatigue: -1.0, hunger: 0.15 },
    lines: ['睡吧。', '明天早点起。'] },
};
// 每只奶蛙的工作点
const WORK_SPOT = { azheng: 'shop', dengzai: 'screen', duoyige: 'plaza' };
// 初始日程倾向：经营→打工，安静→休闲，活泼→社交
const TENDENCY_BY_KEY = { azheng: 'work', dengzai: 'leisure', duoyige: 'social' };
// 活动做完时的额外结算
const END_DELTAS = {
  '吃饭': { mood: 1 },
  '打工': { skill: 1.5, charm: 1 },
  '看书': { intellect: 1.5 },
  '散步': { mood: 1.5 },
  '找人说话': { charm: 1 },
  '发呆': { mood: 1 },
  '洗澡': { charm: 1 },
  '睡觉': { stamina: 4, fatigue: -4 },
};

/* ---------------------------------------------------------------- 材料与装备 */
export const MATERIALS = {
  shell: { key: 'shell', name: '贝壳', file: 'assets/item-shell.png' },
  leaf: { key: 'leaf', name: '树叶', file: 'assets/item-leaf.png' },
  carton: { key: 'carton', name: '纸箱', file: 'assets/item-carton.png' },
  rope: { key: 'rope', name: '麻绳', file: 'assets/mat-rope.png' },
  cloth: { key: 'cloth', name: '布料', file: 'assets/mat-cloth.png' },
  wood: { key: 'wood', name: '木片', file: 'assets/mat-wood.png' },
};
export const MATERIAL_KEYS = Object.keys(MATERIALS);

// 每次旅行回来会带回的材料
export const TRIP_DROPS = {
  beach: { shell: 2, rope: 1 },
  forest: { leaf: 2, wood: 2 },
  market: { carton: 1, cloth: 2 },
};
export const TRIP_COINS = 12;

export const EQUIP_SLOTS = [
  { key: 'head', name: '头部' },
  { key: 'neck', name: '颈部' },
  { key: 'hand', name: '手持' },
];
export const SLOT_KEYS = EQUIP_SLOTS.map((s) => s.key);

// cost 是制作所需材料；price 是小卖部现成品的价格（0 表示只可制作）
// bonuses 是属性加成；look.w 是道具宽度占奶蛙身高的比例，cy 是中心高度（向上为负），dx 是横向偏移
export const EQUIPMENT = {
  hat: {
    key: 'hat', name: '草帽', slot: 'head', file: 'assets/equip-hat.png',
    cost: { leaf: 2, rope: 1 }, price: 18,
    bonuses: { charm: 3 }, desc: '淡奶白编织草帽，配黄油色缎带。',
    look: { w: 0.42, cy: -1.05, dx: 0, dy: 0 },
  },
  scarf: {
    key: 'scarf', name: '围巾', slot: 'neck', file: 'assets/equip-scarf.png',
    cost: { cloth: 2, rope: 1 }, price: 0,
    bonuses: { charm: 2, mood: 3 }, desc: '奶白毛线围巾，针脚不太齐。',
    look: { w: 0.38, cy: -0.76, dx: 0, dy: 0 },
  },
  necklace: {
    key: 'necklace', name: '珠子项链', slot: 'neck', file: 'assets/equip-necklace.png',
    cost: { shell: 2, rope: 1 }, price: 0,
    bonuses: { mood: 4 }, desc: '细麻绳穿的淡琥珀小珠。',
    look: { w: 0.30, cy: -0.77, dx: 0, dy: 0 },
  },
  bag: {
    key: 'bag', name: '帆布包', slot: 'hand', file: 'assets/equip-bag.png',
    cost: { carton: 1, cloth: 2 }, price: 0,
    bonuses: { strength: 3, skill: 1 }, desc: '奶白帆布挂包，能装不少东西。',
    look: { w: 0.26, cy: -0.46, dx: 0.24, dy: 0 },
  },
  stick: {
    key: 'stick', name: '木杖', slot: 'hand', file: 'assets/equip-stick.png',
    cost: { wood: 3 }, price: 0,
    bonuses: { stamina: 4, skill: 2 }, desc: '光滑的浅色木手杖。',
    look: { w: 0.52, cy: -0.34, dx: 0.30, dy: 0 },
  },
  rattle: {
    key: 'rattle', name: '沙沙铃', slot: 'hand', file: 'assets/equip-rattle.png',
    cost: { shell: 2, wood: 1 }, price: 22,
    bonuses: { skill: 3, charm: 1 }, desc: '壳身里装着细沙，摇起来有声音。',
    look: { w: 0.20, cy: -0.46, dx: 0.26, dy: 0 },
  },
};
export const EQUIPMENT_KEYS = Object.keys(EQUIPMENT);

// 小卖部：材料统一价格
const MATERIAL_PRICE = { shell: 3, leaf: 2, carton: 3, rope: 2, cloth: 4, wood: 3 };
export function materialPrice(key) {
  return MATERIAL_PRICE[key] || 3;
}

const START_MATERIALS = { leaf: 2, rope: 1, cloth: 1 };
export const START_COINS = 40;

// 穿戴触发的剧情 / 特殊对话
export const EQUIP_UNLOCKS = [
  {
    id: 'eq_hat_necklace', kind: 'story', only: 'duoyige', name: '终于有一格是自己挑的',
    when: (e) => e.head === 'hat' && e.neck === 'necklace',
    line: '帽子和项链都是自己挑的，它在玻璃前站了很久。',
  },
  {
    id: 'eq_scarf', kind: 'talk', only: 'dengzai', name: '这条围巾是我自己缝的',
    when: (e) => e.neck === 'scarf',
    lines: ['这条围巾是我自己缝的，针脚不太齐。', '围上之后，对色的时候眼睛没那么累了。'],
  },
  {
    id: 'eq_bag', kind: 'story', only: 'azheng', name: '老板娘开始进货了',
    when: (e) => e.hand === 'bag',
    line: '它背上了自己做的帆布包，说是从今天起要自己进货。',
  },
  {
    id: 'eq_full', kind: 'story', name: '整整齐齐出门的一天',
    when: (e) => !!e.head && !!e.neck && !!e.hand,
    line: '头、颈、手都齐了，它出门的时候比平时挺直一点。',
  },
];

// 台词池：普通解锁 + 穿戴解锁
const UNLOCK_LINES = {};
for (const u of UNLOCKS) if (u.kind === 'talk' && u.lines) UNLOCK_LINES[u.id] = u.lines;
for (const u of EQUIP_UNLOCKS) if (u.kind === 'talk' && u.lines) UNLOCK_LINES[u.id] = u.lines;

// 状态良好时的额外事件
const BONUS_EVENTS = [
  { id: 'sweep', text: '起了个大早，顺手把门口擦了一遍。', deltas: { skill: 3, stamina: -3 }, memory: '今天状态很好，我把门口擦了一遍，心里很舒坦。' },
  { id: 'chat', text: '路上碰到街坊，多聊了两句。', deltas: { charm: 2, mood: 4 }, affinityAll: 3, memory: '今天精神好，和街坊多聊了两句，大家都挺高兴。' },
  { id: 'seen', text: '在广场上做了件小事，被大家看见了。', deltas: { charm: 3, mood: 4 }, memory: '今天做了件小事，居然被大家看见了，有点飘飘的。' },
  { id: 'trip', text: '忽然想出门看看。', deltas: { mood: 3 }, selfTrip: true },
];

// 三类性格 × 三件纪念品的固定动作与台词。
// pose 数值以"奶蛙身高"为单位：itemDx/itemDy 是物品相对奶蛙脚底的位移，itemScale 是物品缩放。
export const REACTIONS = {
  quiet: {
    carton: { line: '这样就好，我待在旁边。', pose: { itemScale: 1.0, itemDx: 0.0, itemDy: -0.06, frogScale: 0.94, rot: 0 } },
    shell: { line: '……里面有海的声音。', pose: { itemScale: 1.45, itemDx: 0.3, itemDy: -0.62, frogScale: 1.0, rot: 0 } },
    leaf: { line: '下雨也不怕了。', pose: { itemScale: 1.5, itemDx: 0.0, itemDy: -1.18, frogScale: 1.0, rot: 0 } },
  },
  lively: {
    carton: { line: '看，我的新帽子！', pose: { itemScale: 1.05, itemDx: 0.0, itemDy: -1.02, frogScale: 1.0, rot: -7 } },
    shell: { line: '喂——你听得见吗！', pose: { itemScale: 1.15, itemDx: 0.33, itemDy: -0.5, frogScale: 1.05, rot: 0 } },
    leaf: { line: '举高点，再举高点！', pose: { itemScale: 1.35, itemDx: 0.07, itemDy: -1.3, frogScale: 1.06, rot: 9 } },
  },
  business: {
    carton: { line: '好位置，就摆这儿。', pose: { itemScale: 1.22, itemDx: 0.0, itemDy: -0.12, frogScale: 1.0, rot: 0 } },
    shell: { line: '来看看，海边来的贝壳！', pose: { itemScale: 1.3, itemDx: 0.32, itemDy: -0.78, frogScale: 1.0, rot: -4 } },
    leaf: { line: '招牌就写：新鲜树叶。', pose: { itemScale: 1.4, itemDx: 0.03, itemDy: -1.1, frogScale: 1.0, rot: 4 } },
  },
};

// 摆放候选点：全部落在广场空地上，避开广场中央的十字通道（第 6–8 行、第 11–15 列）。
export const PLACE_SLOTS = [
  { x: 5.5, y: 4.5 }, { x: 9.5, y: 4.5 }, { x: 17.5, y: 4.5 }, { x: 21.5, y: 4.5 },
  { x: 5.5, y: 10.5 }, { x: 5.5, y: 13.5 }, { x: 21.5, y: 10.5 }, { x: 21.5, y: 13.5 },
  { x: 9.5, y: 13.5 }, { x: 17.5, y: 13.5 }, { x: 9.5, y: 3.5 }, { x: 17.5, y: 3.5 },
];

/* ---------------------------------------------------------------- 地图 */
// The walkable simulation plane is projected onto the open plaza, not the surrounding buildings.
export const MAP = Array.from({ length: 15 }, (_, y) =>
  y === 0 || y === 14 ? '#'.repeat(26) : '#' + '.'.repeat(24) + '#',
);

export const MAP_W = MAP[0].length;
export const MAP_H = MAP.length;

export function tileAt(tx, ty) {
  if (ty < 0 || ty >= MAP_H || tx < 0 || tx >= MAP_W) return '#';
  return MAP[ty][tx];
}

/** 某个连续坐标能不能站人（带一点身位内缩，避免贴墙） */
export function walkable(x, y, inset = 0.34) {
  const pts = [
    [x - inset, y - inset],
    [x + inset, y - inset],
    [x - inset, y + inset],
    [x + inset, y + inset],
  ];
  return pts.every(([px, py]) => tileAt(Math.floor(px), Math.floor(py)) === '.');
}

function openTiles() {
  const out = [];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (MAP[y][x] === '.') out.push({ x: x + 0.5, y: y + 0.5 });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- 话题 */
const TOPIC_KEYS = {
  food: ['蒸', '包', '吃', '豆', '饭', '早点', '面', '味', '馅', '喝'],
  screen: ['屏', '巨幕', '控制室', '对色', '放映', '灯', '亮'],
  face: ['表情', '脸', '眯', '笑', '一样', '不一样', '标准'],
};

function topicOf(text) {
  let best = 'default';
  let bestN = 0;
  for (const [k, words] of Object.entries(TOPIC_KEYS)) {
    const n = words.reduce((c, w) => c + (text.includes(w) ? 1 : 0), 0);
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

function clampText(s, n = 180) {
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

let uid = 0;
function nextId(prefix) {
  uid += 1;
  return `${prefix}_${Date.now().toString(36)}${uid.toString(36)}`;
}

/* ---------------------------------------------------------------- 小镇 */
export const TALK_INTERVAL = 3.2; // 每句话之间的秒数
const REST_TIME = 6; // 一次对话结束后各自缓一缓
const SPEED = 1.5; // 每秒走多少格
export const TRIP_EXIT = { x: 12.5, y: 13.4 }; // 出门/回镇都走广场下缘

export const ITEM_BASE = 0.52; // 纪念品在广场上的基准大小（相对奶蛙身高）

// 自己出门：第一次在一分钟内，之后每隔两三分钟可能再想出门
const AUTO_TRIP_FIRST = [600, 900];
const AUTO_TRIP_NEXT = [900, 1500];

function rand([lo, hi]) {
  return lo + Math.random() * (hi - lo);
}

// 点开旅行中的头像时，「此刻它在做什么」。按目的地 × 性格给固定内容，不接 AI。
const LOOK_IN = {
  beach: {
    quiet: ['它把贝壳贴在耳朵上，听了很久。', '它站在水边，等浪退回去，再往前一步。'],
    lively: ['它对着海喊了一声，然后自己被吓了一跳。', '它在沙滩上踩出一串脚印，又回头把它们数了一遍。'],
    business: ['它在数遮阳伞下的空位，盘算着摆个摊。', '它跟卖椰子的人聊了半天，什么都没买。'],
  },
  forest: {
    quiet: ['它蹲在树根边上，看一只虫爬过去。', '它把手放在树皮上，站着没动。'],
    lively: ['它绕着同一棵树跑了三圈，说是在认路。', '它对着树洞喊了一句，等回声。'],
    business: ['它在数哪棵树底下最凉快，说这是好位置。', '它捡了三种叶子比较，挑了最平整的。'],
  },
  market: {
    quiet: ['它站在摊位旁边，看别人挑东西。', '它把纸箱扶正了两次。'],
    lively: ['它钻进了纸箱里，只露出两只眼睛。', '它学摊主吆喝，被人夸嗓门好。'],
    business: ['它跟摊主聊起了进货价。', '它在比较两个纸箱，最后挑了结实的那个。'],
  },
  road: {
    quiet: ['它正在走上坡路，一步一步。', '它把东西抱在怀里，低头走路。'],
    lively: ['它一路小跑，还回头看同伴在哪。', '它边走边哼，调子没找着。'],
    business: ['它算了算时间，说天黑前能到。', '它把带的东西重新摆了一遍，好拿。'],
  },
};

/* ---------------------------------------------------------------- 行李 / 技能 / 纪念物事件 */
// 行李：出发前最多带 3 件，也可不带。每件都有对应的旅途情节，没有唯一正确搭配。
export const LUGGAGE = [
  { key: 'umbrella', name: '雨伞' },
  { key: 'riceball', name: '饭团' },
  { key: 'camera', name: '相机' },
];
export const LUGGAGE_KEYS = LUGGAGE.map((l) => l.key);
export const LUGGAGE_MAX = 3;

const DEST_WHO = { beach: '卖椰子的', forest: '采蘑菇的', market: '摆摊的' };

const LUGGAGE_EVENTS = {
  umbrella: [
    '半路下起雨，它把伞撑给躲雨的{who}，自己淋湿了半边。',
    '太阳太晒，它把伞借给在路边打盹的{who}，自己挪到树影里等。',
  ],
  riceball: [
    '它把饭团掰了一半给饿着的{who}，两个人坐在台阶上吃完。',
    '走累了，它坐在路边把饭团吃掉，说这样才有力气往回走。',
  ],
  camera: [
    '它给{who}拍了一张，对方看了很久，说没见过自己这么好看。',
    '它想给自己拍一张，只拍到了半边脸，但它说这张最好。',
  ],
};

// 技能：不是每次都能学到；跟谁学、经历了什么都要对得上这趟旅行。
export const SKILLS = {
  baking: {
    key: 'baking', name: '烘焙',
    who: { market: '面包摊的老板', beach: '海边小店的老板娘', forest: '林间小屋的主人' },
    story: '跟着揉了一下午的面团，手腕酸，但记住了手感。',
  },
  gardening: {
    key: 'gardening', name: '园艺',
    who: { market: '卖花的姑娘', forest: '林子里的园丁', beach: '种防风林的老先生' },
    story: '学了怎么把苗扶正，还知道了什么时候该浇水。',
  },
  photo: {
    key: 'photo', name: '摄影',
    who: { market: '挎相机的旅人', beach: '拍浪的人', forest: '等鸟的人' },
    story: '被教着等了三分钟才按快门，说好照片都是等出来的。',
  },
  craft: {
    key: 'craft', name: '手工',
    who: { market: '修伞的师傅', beach: '编网的人', forest: '做木勺的人' },
    story: '帮着递了半天工具，看会了怎么把一个扣打得又牢又平。',
  },
};
export const SKILL_KEYS = Object.keys(SKILLS);

const LUGGAGE_SKILL = { camera: 'photo', riceball: 'baking', umbrella: 'craft' };
const SKILL_CHANCE = 0.32;          // 空手也会偶尔学到
const SKILL_CHANCE_LUGGAGE = 0.62;  // 带了相关行李明显更容易

// 纪念物在广场上偶尔触发的小事件（点击互动不变，事件是额外的）
export const SOUVENIR_EVENTS = {
  shell: {
    key: 'tide', name: '潮声',
    start: '贝壳里响起潮声，几只奶蛙围了过来。',
    line: '把贝壳贴近耳朵，里面有海。',
    effect: 'tide',
  },
  leaf: {
    key: 'fireflies', name: '萤火虫',
    start: '树叶擞开来，夜里飞来几只萤火虫。',
    line: '叶子是别处捡的，萤火虫围上了它。',
    effect: 'fireflies',
  },
  carton: {
    key: 'music', name: '小音乐会',
    start: '有人把纸箱当鼓敲了两下，声音意外地好。',
    line: '纸箱当成鼓，敲起来意外的响。',
    effect: 'music',
  },
};

const EVENT_REACTIONS = {
  tide: {
    quiet: ['……真的有海的声音。', '再听一次。'],
    lively: ['里面有海！你听你听！', '我耳朵凉凉的！'],
    business: ['这个要是能卖就好了。', '想听的排好队。'],
  },
  fireflies: {
    quiet: ['……它们自己会亮。', '别出声。'],
    lively: ['亮一下！再亮一下！', '我追到它了——没追到。'],
    business: ['看看可以，别把它抓回去。', '这要是能装起来就好了。'],
  },
  music: {
    quiet: ['……节奏还行。', '再来一遍。'],
    lively: ['我来敲！我来敲！', '这个是鼓！'],
    business: ['下次得收钱。', '谁还带了别的响的？'],
  },
};

// 学过的手艺会在广场上表现出来：去对应的地方帮一手（坐标由底图位置反算，会走出广场网格）
export const SKILL_WORK = {
  baking: {
    key: 'baking', place: '早点铺', role: '帮厨', spot: { x: -0.96, y: 12.52 },
    lines: {
      quiet: ['……火候刚好。', '这一笼我来看着。'],
      lively: ['我揉的面！我揉的面！', '再蒸一笼好不好！'],
      business: ['今天的面发得不错。', '摆前面一点，好卖。'],
    },
  },
  gardening: {
    key: 'gardening', place: '花店', role: '照看花草', spot: { x: 28.41, y: 2.98 },
    lines: {
      quiet: ['……浇过水了。', '这盆挪到半阴处。'],
      lively: ['又冒了一片新叶子！', '你看它朝哪边长！'],
      business: ['这几盆可以摆到门口。', '长得整齐才有人买。'],
    },
  },
  photo: {
    key: 'photo', place: '广场', role: '拍照', spot: { x: 6.2, y: -0.19 },
    lines: {
      quiet: ['……等一下，光正好。', '再等三分钟。'],
      lively: ['笑一个！看我！', '我给你拍一张！'],
      business: ['一张一张来，排好队。', '这个角度最好看。'],
    },
  },
  craft: {
    key: 'craft', place: '修伞摊', role: '做手工', spot: { x: 12.54, y: 18.46 },
    lines: {
      quiet: ['……这个扣要收紧。', '再磨一下就平了。'],
      lively: ['我修好了！你看！', '这个能当帽子吗？'],
      business: ['修一件收两枚。', '材料得省着用。'],
    },
  },
};
export const SKILL_WORK_KEYS = Object.keys(SKILL_WORK);

const WORK_GAP = [60, 120];      // 两次"上班"之间
const WORK_DURATION = 20;        // 在岗位上待多久
const WORK_LINE_INTERVAL = 4.2;

const EVENT_ITEM_COOLDOWN = [90, 150];  // 同一件纪念物两次事件之间
const EVENT_GLOBAL_GAP = [70, 120];     // 两次事件之间至少隔这么久
const EVENT_ENJOY_TIME = 14;            // 围过来之后待多久
const EVENT_LINE_INTERVAL = 3.2;

// 结伴汇报的声库：三类性格各有一套起头/补充/打趣/收尾，最后一句带回东西与感言
const DEST_THING = { beach: '海', forest: '树', market: '摊位' };

const JOINT_VOICE = {
  quiet: {
    open: ['……我们回来了。{dest}比我想的安静。', '我们回来了。我数过路，一路都很稳。'],
    add: ['它一路上话没停。我在{thing}那儿站了很久。', '我走得慢，它回头等了我五次。'],
    tease: ['……它讲得太夸张了。', '没有那么热闹。别信它。'],
    end: ['东西在这儿：{item}。{quote}', '带回来一个{item}——{quote}'],
  },
  lively: {
    open: ['我们回来啦！{dest}超级好玩！', '回来了回来了！我跟你讲，{dest}太有意思了！'],
    add: ['我还对着{thing}练了一个新表情！', '它走得好慢，我一路都在等它！'],
    tease: ['它一路上都不说话，急死我了。', '你别看它这样，它偷偷笑了！'],
    end: ['喏，{item}！{quote}', '给你看{item}——{quote}'],
  },
  business: {
    open: ['我们回来了。{dest}这趟不亏。', '回来了，路上都还顺。'],
    add: ['我把来回的时间记下了，一趟两刻钟。', '那边的{item}成色不错，我挑了个好的。'],
    tease: ['它说它不累，回来就坐下了。', '它嘴上嫌远，走得比谁都快。'],
    end: ['东西我先收着：{item}。{quote}', '带回来一个{item}——{quote}'],
  },
};

// 自己旅行回来时的第一人称汇报（需求里的感言原样保留）
const REPORT_LINES = {
  beach: [
    '我回来了。我去了海边，给你带了贝壳——海很大，口袋很小。',
    '我回来了。海边风大，我捡了个贝壳给你——海很大，口袋很小。',
  ],
  forest: [
    '我回来了。森林里很安静，我带了片树叶——带回一把不用充电的伞。',
    '我回来了。树太多了，我只拿了一片叶子——带回一把不用充电的伞。',
  ],
  market: [
    '我回来了。集市很热闹，我把纸箱扛回来了——没买东西，但有了一个家。',
    '我回来了。我在集市转了一圈，带回来一个纸箱——没买东西，但有了一个家。',
  ],
};
const ACT_STAY = 0.7; // 抵达后停留多久
const ACT_PLAY = 3.6; // 动作与台词持续多久（加上停留共约 4.3 秒）

// 纪念物装饰：每只奶蛙一个槽，可替换，不消耗原物品、不占普通装备槽
// dy/scale 以奶蛙身高为单位（脚底为 0，向上为负）
export const DECO = {
  carton: { key: 'carton', name: '纸箱头套', dy: -0.94, scale: 0.46, rot: -6 },
  shell: { key: 'shell', name: '贝壳挂饰', dy: -0.56, scale: 0.4, rot: 0 },
  leaf: { key: 'leaf', name: '叶帽', dy: -0.84, scale: 0.5, rot: -4 },
};
const ACT_COOLDOWN_FROG = 45; // 同一只奶蛙对同一件东西的冷却
const ACT_COOLDOWN_ITEM = 10; // 同一件东西被别的奶蛙接手的冷却
const AUTO_RADIUS = 1.9; // 自由游走时触发互动的距离
// 这些日程是"闲着"的，可以被互动/上班/围观打断；打工、看书、吃饭、睡觉等不打断
const FREE_PLAN_KEYS = ['wake', 'daze', 'walk', 'chat'];
const TRIP_WALK_OUT = 1.6; // 出门过渡时长
const TRIP_AWAY = [28, 46]; // 在外停留（游戏内约 6–9 小时）
const TRIP_WALK_BACK = 1.2;

export class Town {
  constructor(saved) {
    this.agents = [];
    this.journal = [];
    this.story = null;
    this.frozen = false;
    this.t = 0;
    this.day = 1;
    this.lastSaid = null;
    this.reset(saved);
  }

  reset(saved) {
    const open = openTiles();
    const spawn = [
      { x: 8.5, y: 7.5 },
      { x: 10, y: 7.5 },
      { x: 17, y: 10.5 },
    ];
    this.agents = RESIDENTS.map((r, i) => ({
      ...r,
      id: r.key,
      idx: i,
      personality: personalityFor(r, i),
      x: spawn[i].x,
      y: spawn[i].y,
      dir: 'down',
      frame: 0,
      moving: false,
      hidden: false,
      state: 'wander',
      target: null,
      partnerId: null,
      talkTimer: 0,
      maxTurns: 8,
      turn: 0,
      memories: [],
      rest: 0,
      think: Math.random() * 0.6,
      stats: { ...(START_STATS[r.key] || { stamina: 55, intellect: 50, charm: 50, strength: 50, mood: 60, skill: 40 }) },
      conditions: { ...(START_CONDITIONS[r.key] || { hunger: 32, fatigue: 16, health: 86, hygiene: 78, clothing: 80 }) },
      tendency: TENDENCY_BY_KEY[r.key] || 'leisure',
      ateSlot: null,
      plan: null,
      planSlot: null,
      away: null,
      equipped: { head: null, neck: null, hand: null },
      careAt: { feed: 0, sleep: 0, groom: 0 },
      sleepUntil: 0,
      affinity: { ...(START_AFFINITY[r.key] || {}) },
      unlocked: [],
      statLog: [],
      act: null,
      autoTripAt: 0,
      visited: {},
      skills: [],
      deco: null, // 纪念物装饰槽
      personalitySet: false, // 是否由用户手动选过互动性格
    }));
    this.journal = [];
    this.story = null;
    this.t = 0;
    this.day = 1;
    this.open = open;
    this.backpack = {}; // 名字 -> [{ id, item, from, quote, at }]
    this.placed = []; // [{ id, item, x, y, owner }]
    this.album = []; // [{ id, kind, key, frog, item, dest, title, caption, image, at }]
    this.photoCache = {}; // key -> dataURL，同组合复用同一张图
    this.photoQueue = []; // 交给渲染层合成
    this.trip = null;
    this.cooldown = {}; // `${frog}|${item}` -> until
    this.itemCooldown = {}; // itemId -> until
    this.slotUse = {}; // slot index -> itemId
    this.messages = []; // 奶蛙自己出门回来后的汇报
    this.event = null; // 纪念物触发的广场小事件
    this.itemEventAt = {}; // itemId -> 下次可触发时间
    this.nextEventAt = 0; // 两次事件之间的全局间隔
    this.work = null; // 奶蛙去广场上用一次学过的技能
    this.nextWorkAt = 0;
    this.unlockLog = []; // 阈值解锁记录
    this.events = []; // 状态良好触发的额外事件
    this.materials = { ...START_MATERIALS }; // 材料仓库存量
    this.owned = {}; // 已制作/购买、尚未穿戴的装备
    for (const k of EQUIPMENT_KEYS) this.owned[k] = 0;
    this.coins = START_COINS;
    this.clock = timeOf(0);
    this.statAcc = 0;
    for (const a of this.agents) this.backpack[a.name] = [];
    if (saved) this.load(saved);
    // 刷新时还在路上的，接着走完
    if (this.trip) this.resumeTrip();
    // 没存过下次出门时间（或保存时已经过了），就重新随机安排一个
    for (const a of this.agents) {
      if (!a.visited) a.visited = {};
      if (!Number.isFinite(a.autoTripAt) || a.autoTripAt <= this.t) {
        a.autoTripAt = this.t + rand(AUTO_TRIP_FIRST);
      }
    }
    // 开局就已达标的项只入账不报喜，避免刷屏气泡
    for (const a of this.agents) this.evaluateUnlocks(a, { silent: true });
  }

  load(saved) {
    for (const a of this.agents) {
      const m = saved.memories?.[a.name];
      if (Array.isArray(m)) {
        a.memories = m.map((x) => ({ text: x.text, importance: x.importance, at: x.at, vec: hashEmbed(x.text) }));
      }
      // 互动性格：存档优先；无法匹配时按稳定 key 固定分配，用户选过就以选择为准
      const savedPersonality = saved.personality?.[a.name];
      if (savedPersonality && PERSONALITIES[savedPersonality]) {
        a.personality = savedPersonality;
        a.personalitySet = !!(saved.personalitySet?.[a.name]);
      } else {
        a.personality = personalityFor(a, a.idx);
      }
      const savedDeco = saved.deco?.[a.name];
      if (savedDeco && DECO[savedDeco]) a.deco = savedDeco;
      const sv = saved.travel?.[a.name];
      if (sv) {
        if (Number.isFinite(sv.autoTripAt)) a.autoTripAt = sv.autoTripAt;
        if (sv.visited && typeof sv.visited === 'object') a.visited = sv.visited;
      }
      const bag = saved.backpack?.[a.name];
      if (Array.isArray(bag)) this.backpack[a.name] = bag;
      const sv2 = saved.stats?.[a.name];
      if (sv2) {
        for (const k of STAT_KEYS) if (Number.isFinite(sv2[k])) a.stats[k] = clampStat(sv2[k]);
      }
      const af = saved.affinity?.[a.name];
      if (af && typeof af === 'object') {
        for (const [id, v] of Object.entries(af)) if (Number.isFinite(v)) a.affinity[id] = clampStat(v);
      }
      if (Array.isArray(saved.unlocked?.[a.name])) a.unlocked = saved.unlocked[a.name].slice();
      if (Array.isArray(saved.statLog?.[a.name])) a.statLog = saved.statLog[a.name].slice(0, 14);
      const cd = saved.conditions?.[a.name];
      if (cd) {
        for (const k of CONDITION_KEYS) if (Number.isFinite(cd[k])) a.conditions[k] = clampStat(cd[k]);
      }
      if (saved.tendency?.[a.name] && TENDENCIES.some((t) => t.key === saved.tendency[a.name])) {
        a.tendency = saved.tendency[a.name];
      }
      // 刷新前在哪里、是不是在路上，都要接着上次的状态
      const pos = saved.positions?.[a.name];
      if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) && walkable(pos.x, pos.y)) {
        a.x = pos.x;
        a.y = pos.y;
      }
      if (pos && pos.dir) a.dir = pos.dir;
      if (saved.away?.[a.name]) a.hidden = true;
      if (Array.isArray(saved.skills?.[a.name])) {
        a.skills = saved.skills[a.name].filter((x) => x && SKILLS[x.key]).map((x) => ({
          key: x.key, name: SKILLS[x.key].name, count: Math.max(1, x.count || 1),
          firstAt: x.firstAt || 0, lastAt: x.lastAt || 0,
          experiences: Array.isArray(x.experiences) ? x.experiences.slice(0, 3) : [],
        }));
      }
      const ca = saved.careAt?.[a.name];
      if (ca && typeof ca === 'object') for (const k of ['feed', 'sleep', 'groom']) if (Number.isFinite(ca[k])) a.careAt[k] = ca[k];
      const eq = saved.equipped?.[a.name];
      if (eq && typeof eq === 'object') {
        for (const slot of SLOT_KEYS) {
          const id = eq[slot];
          a.equipped[slot] = id && EQUIPMENT[id] ? id : null;
        }
      }
    }
    this.journal = (saved.journal || []).slice(-400);
    this.story = saved.story || null;
    this.t = Number.isFinite(saved.elapsed) ? Math.max(0, saved.elapsed) : Math.max(0, ((saved.day || 1) - 1) * 120);
    this.day = 1 + Math.floor(this.t / 120);
    this.placed = Array.isArray(saved.placed) ? saved.placed : [];
    this.album = Array.isArray(saved.album)
      ? saved.album.map((a) => ({ ...a, image: (saved.photoCache && saved.photoCache[a.key]) || a.image || '' }))
      : [];
    this.messages = Array.isArray(saved.messages) ? saved.messages.slice(0, 20) : [];
    this.trip = saved.trip && saved.trip.dest ? saved.trip : null;
    this.itemEventAt = saved.itemEventAt && typeof saved.itemEventAt === 'object' ? saved.itemEventAt : {};
    this.nextEventAt = Number.isFinite(saved.nextEventAt) ? saved.nextEventAt : 0;
    this.nextWorkAt = Number.isFinite(saved.nextWorkAt) ? saved.nextWorkAt : 0;
    this.work = null; // 上班状态不跨刷新，间隔保留即可
    this.event = null; // 事件不跨刷新，冷却保留即可
    this.unlockLog = Array.isArray(saved.unlockLog) ? saved.unlockLog.slice(0, 30) : [];
    this.events = Array.isArray(saved.events) ? saved.events.slice(0, 20) : [];
    if (saved.materials && typeof saved.materials === 'object') {
      this.materials = { ...START_MATERIALS };
      for (const k of MATERIAL_KEYS) if (Number.isFinite(saved.materials[k])) this.materials[k] = Math.max(0, saved.materials[k]);
    }
    if (saved.owned && typeof saved.owned === 'object') {
      for (const k of EQUIPMENT_KEYS) if (Number.isFinite(saved.owned[k])) this.owned[k] = Math.max(0, saved.owned[k]);
    }
    if (Number.isFinite(saved.coins)) this.coins = Math.max(0, saved.coins);
    this.photoCache = saved.photoCache && typeof saved.photoCache === 'object' ? saved.photoCache : {};
    this.slotUse = {};
    for (const p of this.placed) if (p.slot !== undefined) this.slotUse[p.slot] = p.id;
  }

  snapshot() {
    const memories = {};
    const personality = {};
    const travel = {};
    const skills = {};
    const personalitySet = {};
    const deco = {};
    const stats = {};
    const affinity = {};
    const unlocked = {};
    const statLog = {};
    const conditions = {};
    const careAt = {};
    const equipped = {};
    const tendency = {};
    const positions = {};
    const away = {};
    for (const a of this.agents) {
      memories[a.name] = a.memories.map(({ text, importance, at }) => ({ text, importance, at }));
      personality[a.name] = a.personality;
      personalitySet[a.name] = !!a.personalitySet;
      deco[a.name] = a.deco || null;
      travel[a.name] = { autoTripAt: a.autoTripAt, visited: a.visited || {} };
      skills[a.name] = (a.skills || []).map((x) => ({ ...x }));
      stats[a.name] = { ...a.stats };
      affinity[a.name] = { ...a.affinity };
      unlocked[a.name] = a.unlocked.slice();
      statLog[a.name] = a.statLog.slice(0, 14);
      conditions[a.name] = { ...a.conditions };
      careAt[a.name] = { ...a.careAt };
      equipped[a.name] = { ...a.equipped };
      tendency[a.name] = a.tendency;
      positions[a.name] = { x: a.x, y: a.y, dir: a.dir };
      if (a.hidden) away[a.name] = true;
    }
    return {
      memories, personality, personalitySet, deco, travel, skills, stats, affinity, unlocked, statLog, conditions, careAt, equipped, tendency,
      positions, away,
      trip: this.trip,
      materials: { ...this.materials },
      owned: { ...this.owned },
      coins: this.coins,
      unlockLog: this.unlockLog.slice(0, 30),
      events: this.events.slice(0, 20),
      journal: this.journal.slice(-400),
      story: this.story, day: this.day, elapsed: this.t,
      backpack: this.backpack,
      placed: this.placed,
      album: this.album.slice(0, 12).map(({ image, ...rest }) => rest),
      photoCache: this.photoCache,
      messages: this.messages.slice(0, 20),
      itemEventAt: { ...this.itemEventAt },
      nextEventAt: this.nextEventAt,
      nextWorkAt: this.nextWorkAt,
    };
  }

  byId(id) {
    return this.agents.find((a) => a.id === id);
  }

  byName(name) {
    return this.agents.find((a) => a.name === name);
  }

  recall(agent, query, k = 3) {
    if (!agent.memories.length) return [];
    const q = hashEmbed(query);
    const now = this.t;
    return agent.memories
      .map((m) => ({ m, score: cosine(q, m.vec) * 2 + m.importance * 0.09 - Math.min(1.2, (now - m.at) / 900) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((s) => s.m);
  }

  /* ------------------------------------------------------------ 数值 */
  statsView(frog) {
    const out = { affinity: Math.round(avgAffinity(frog) * 10) / 10 };
    for (const k of STAT_KEYS) out[k] = this.effective(frog, k);
    return out;
  }

  affinityTo(frog, otherName) {
    const other = this.byName(otherName);
    if (!other) return 0;
    return frog.affinity[other.id] ?? 50;
  }

  /** 先把行动作用于数值，再检查阈值解锁 */
  applyStats(frog, action, deltas, opts = {}) {
    if (!frog || !deltas) return;
    const applied = {};
    for (const k of STAT_KEYS) {
      if (!Number.isFinite(deltas[k])) continue;
      const next = clampStat(frog.stats[k] + deltas[k]);
      if (next !== frog.stats[k]) applied[k] = Math.round((next - frog.stats[k]) * 10) / 10;
      frog.stats[k] = next;
    }
    if (deltas.affinityTo) {
      for (const [id, amt] of Object.entries(deltas.affinityTo)) {
        const before = frog.affinity[id] ?? 50;
        const next = clampStat(before + amt);
        if (next !== before) applied[`好感·${this.byId(id)?.name || id}`] = Math.round((next - before) * 10) / 10;
        frog.affinity[id] = next;
      }
    }
    if (!opts.silent && Object.keys(applied).length) {
      frog.statLog.unshift({ at: Math.round(this.t), day: this.day, action, deltas: applied });
      if (frog.statLog.length > 14) frog.statLog.pop();
    }
    this.evaluateUnlocks(frog);
  }

  evaluateUnlocks(frog, opts = {}) {
    const view = this.statsView(frog);
    for (const u of UNLOCKS) {
      if (u.only && u.only !== frog.key) continue;
      if (frog.unlocked.includes(u.id)) continue;
      let hit = false;
      try { hit = !!u.test(view); } catch { hit = false; }
      if (!hit) continue;
      frog.unlocked.push(u.id);
      const entry = {
        id: u.id, kind: u.kind, kindLabel: UNLOCK_KINDS[u.kind] || u.kind,
        name: u.name, frog: frog.name, day: this.day, at: Math.round(this.t),
        line: u.line || null,
      };
      this.unlockLog.unshift(entry);
      if (this.unlockLog.length > 30) this.unlockLog.pop();
      if (!opts.silent) {
        this.lastSaid = {
          agentId: frog.id,
          text: `解锁${entry.kindLabel}：${entry.name}`,
          until: this.t + 4,
        };
      }
    }
  }

  /** 每 5 秒结算一次：属性代谢 + 日常状态变化 + debuff/buff 持续影响 */
  metabolism() {
    for (const a of this.agents) {
      if (a.hidden) continue;
      const asleep = a.rest > 0;
      if (asleep) {
        const boost = this.activeBuffs(a).some((b) => b.restBoost) ? 1.5 : 1;
        this.applyStats(a, STAT_ACTIONS.rest.label, {
          stamina: STAT_ACTIONS.rest.deltas.stamina * boost,
          mood: STAT_ACTIONS.rest.deltas.mood,
        }, { silent: true });
      } else if (a.state === 'talk') {
        this.applyStats(a, STAT_ACTIONS.chat.label, STAT_ACTIONS.chat.deltas, { silent: true });
      } else {
        this.applyStats(a, STAT_ACTIONS.idle.label, STAT_ACTIONS.idle.deltas, { silent: true });
      }

      // 状态漂移
      const c = a.conditions;
      c.hunger = clampStat(c.hunger + (asleep ? CONDITION_RATE.hungerAsleep : CONDITION_RATE.hungerAwake));
      c.fatigue = clampStat(c.fatigue + (asleep ? CONDITION_RATE.fatigueRest : CONDITION_RATE.fatigueAwake));
      c.clothing = clampStat(c.clothing + CONDITION_RATE.clothing);
      c.hygiene = clampStat(c.hygiene + CONDITION_RATE.hygiene);
      let dh = CONDITION_RATE.healthRecover;
      if (c.hunger >= 70) dh = CONDITION_RATE.healthHungry;
      else if (c.fatigue >= 85) dh = CONDITION_RATE.healthTired;
      c.health = clampStat(c.health + dh);

      // debuff / buff 持续影响
      const effects = {};
      for (const d of this.activeDebuffs(a)) for (const [k, v] of Object.entries(d.effects || {})) effects[k] = (effects[k] || 0) + v;
      for (const b of this.activeBuffs(a)) for (const [k, v] of Object.entries(b.effects || {})) effects[k] = (effects[k] || 0) + v;
      if (Object.keys(effects).length) this.applyStats(a, '状态影响', effects, { silent: true });

      // 状态好才有额外事件
      const evChance = this.activeBuffs(a).reduce((n, b) => n + (b.eventChance || 0), 0);
      if (evChance && Math.random() < evChance) this.bonusEvent(a);
    }
  }

  unlockLines(frog) {
    const out = [];
    for (const id of frog.unlocked) {
      const lines = UNLOCK_LINES[id];
      if (lines) out.push(...lines);
    }
    return out;
  }

  /* ------------------------------------------------------------ 材料 / 装备 */
  addMaterials(drops) {
    for (const [k, n] of Object.entries(drops || {})) {
      if (!MATERIALS[k]) continue;
      this.materials[k] = (this.materials[k] || 0) + n;
    }
  }

  canCraft(id) {
    const eq = EQUIPMENT[id];
    if (!eq) return { ok: false, reason: '没有这个配方。' };
    for (const [k, n] of Object.entries(eq.cost)) {
      if ((this.materials[k] || 0) < n) {
        return { ok: false, reason: `材料不够：${MATERIALS[k] ? MATERIALS[k].name : k} ×${n}` };
      }
    }
    return { ok: true };
  }

  craft(id, frogId) {
    const eq = EQUIPMENT[id];
    const check = this.canCraft(id);
    if (!check.ok) return check;
    for (const [k, n] of Object.entries(eq.cost)) this.materials[k] -= n;
    this.owned[id] = (this.owned[id] || 0) + 1;
    const frog = (frogId && this.byId(frogId)) || this.agents[0];
    if (frog) this.lastSaid = { agentId: frog.id, text: `做好了一件${eq.name}`, until: this.t + 3.5 };
    return { ok: true, item: eq };
  }

  buyMaterial(key, qty = 1) {
    if (!MATERIALS[key]) return { ok: false, reason: '小卖部没有这种材料。' };
    const cost = materialPrice(key) * qty;
    if (this.coins < cost) return { ok: false, reason: `奶币不够（需要 ${cost}，现有 ${this.coins}）。` };
    this.coins -= cost;
    this.addMaterials({ [key]: qty });
    return { ok: true, cost };
  }

  buyItem(id) {
    const eq = EQUIPMENT[id];
    if (!eq || !eq.price) return { ok: false, reason: '这件东西小卖部不卖。' };
    if (this.coins < eq.price) return { ok: false, reason: `奶币不够（需要 ${eq.price}，现有 ${this.coins}）。` };
    this.coins -= eq.price;
    this.owned[id] = (this.owned[id] || 0) + 1;
    return { ok: true, cost: eq.price, item: eq };
  }

  equipBonus(frog) {
    const out = {};
    for (const slot of SLOT_KEYS) {
      const id = frog.equipped ? frog.equipped[slot] : null;
      if (!id || !EQUIPMENT[id]) continue;
      for (const [k, v] of Object.entries(EQUIPMENT[id].bonuses)) out[k] = (out[k] || 0) + v;
    }
    return out;
  }

  /** 基础值 + 装备加成，供面板显示与阈值判定使用 */
  effective(frog, key) {
    return clampStat(frog.stats[key] + (this.equipBonus(frog)[key] || 0));
  }

  equipItem(frogId, id) {
    const frog = this.byId(frogId);
    const eq = EQUIPMENT[id];
    if (!frog || !eq) return { ok: false, reason: '没有这件装备。' };
    if ((this.owned[id] || 0) <= 0) return { ok: false, reason: `背包里没有${eq.name}，先制作或购买。` };
    const current = frog.equipped[eq.slot];
    if (current) this.owned[current] = (this.owned[current] || 0) + 1;
    this.owned[id] -= 1;
    frog.equipped[eq.slot] = id;
    this.evaluateEquipUnlocks(frog);
    this.evaluateUnlocks(frog);
    this.lastSaid = { agentId: frog.id, text: `${frog.name} 换上了${eq.name}`, until: this.t + 3.5 };
    return { ok: true, item: eq, replaced: current || null };
  }

  unequipSlot(frogId, slot) {
    const frog = this.byId(frogId);
    if (!frog) return { ok: false, reason: '找不到这只奶蛙。' };
    const id = frog.equipped ? frog.equipped[slot] : null;
    if (!id) return { ok: false, reason: '这个位置是空的。' };
    frog.equipped[slot] = null;
    this.owned[id] = (this.owned[id] || 0) + 1;
    this.evaluateUnlocks(frog);
    return { ok: true, item: EQUIPMENT[id] };
  }

  evaluateEquipUnlocks(frog) {
    const worn = { ...frog.equipped };
    for (const u of EQUIP_UNLOCKS) {
      if (u.only && u.only !== frog.key) continue;
      if (frog.unlocked.includes(u.id)) continue;
      let hit = false;
      try { hit = !!u.when(worn); } catch { hit = false; }
      if (!hit) continue;
      frog.unlocked.push(u.id);
      const entry = {
        id: u.id, kind: u.kind, kindLabel: UNLOCK_KINDS[u.kind] || u.kind,
        name: u.name, frog: frog.name, day: this.day, at: Math.round(this.t), line: u.line || null,
      };
      this.unlockLog.unshift(entry);
      if (this.unlockLog.length > 30) this.unlockLog.pop();
      this.lastSaid = { agentId: frog.id, text: `解锁${entry.kindLabel}：${entry.name}`, until: this.t + 4 };
    }
  }

  /* ------------------------------------------------------------ 日常状态 */
  conditionView(frog) {
    return { ...frog.stats, ...frog.conditions, mood: this.effective(frog, 'mood') };
  }

  activeDebuffs(frog) {
    const c = this.conditionView(frog);
    return DEBUFFS.filter((d) => d.when(c));
  }

  activeBuffs(frog) {
    const c = this.conditionView(frog);
    return BUFFS.filter((b) => b.when(c));
  }

  /** 状态太差就拒绝互动（不搭话、不玩东西、不出门） */
  /** 现在能不能被叫去玩东西 / 上班 / 围观：闲逛，或正在做闲事 */
  isFreeForInteraction(a) {
    if (!a || a.hidden || a.act || a.rest > 0 || this.tripOf(a.id)) return false;
    if (a.state === 'wander') return true;
    if (a.state === 'plan' && a.plan && a.plan.onscreen && a.plan.phase === 'do' && FREE_PLAN_KEYS.includes(a.plan.key)) return true;
    return false;
  }

  refuses(frog) {
    return this.activeDebuffs(frog).some((d) => d.refuse);
  }

  speedFactor(frog) {
    let f = 1;
    for (const d of this.activeDebuffs(frog)) if (d.speed) f = Math.min(f, d.speed);
    return f;
  }

  chatBoost(frog) {
    let b = 1;
    for (const x of this.activeBuffs(frog)) if (x.chatBoost) b = Math.max(b, x.chatBoost);
    return b;
  }

  /** 玩家照顾动作：喂一顿 / 睡一觉 / 换洗 */
  care(frogId, kind) {
    const frog = this.byId(frogId);
    const spec = CARE_ACTIONS[kind];
    if (!frog || !spec) return { ok: false, reason: '不认识这个动作。' };
    if (this.trip && this.trip.frogId === frog.id) return { ok: false, reason: `${frog.name} 出门了，等它回来。` };
    const until = frog.careAt[kind] || 0;
    if (until > this.t) return { ok: false, reason: `${spec.label}还得等 ${Math.ceil(until - this.t)} 秒。` };
    frog.careAt[kind] = this.t + spec.cooldown;
    spec.apply(this, frog);
    this.lastSaid = { agentId: frog.id, text: spec.line(frog), until: this.t + 3.5 };
    return { ok: true, label: spec.label };
  }

  careReady(frog, kind) {
    return (frog.careAt[kind] || 0) <= this.t;
  }

  /** 状态良好时的额外事件 */
  bonusEvent(frog) {
    const ev = BONUS_EVENTS[Math.floor(Math.random() * BONUS_EVENTS.length)];
    if (ev.selfTrip) {
      if (this.trip || frog.state !== 'wander' || frog.rest > 0 || frog.act || frog.hidden) return;
      const r = this.startSelfTrip(frog);
      if (!r.ok) return;
    } else {
      this.applyStats(frog, '额外事件', ev.deltas || {});
      if (ev.affinityAll) {
        const d = {};
        for (const o of this.agents) if (o.id !== frog.id) d[o.id] = ev.affinityAll;
        this.applyStats(frog, '额外事件·好感', { affinityTo: d }, { silent: true });
        for (const o of this.agents) {
          if (o.id === frog.id) continue;
          this.applyStats(o, `被${frog.name}搭了话`, { affinityTo: { [frog.id]: ev.affinityAll } }, { silent: true });
        }
      }
    }
    this.events.unshift({ id: nextId('event'), frog: frog.name, text: ev.text, at: Math.round(this.t), day: this.day });
    if (this.events.length > 20) this.events.pop();
    this.coins += 2;
    this.lastSaid = { agentId: frog.id, text: ev.text, until: this.t + 4.5 };
    if (ev.memory) {
      frog.memories.unshift({ text: ev.memory, importance: 6, at: this.t, vec: hashEmbed(ev.memory) });
      if (frog.memories.length > 60) frog.memories.pop();
    }
  }

  /* ------------------------------------------------------------ 说话 */
  line(agent, other, history) {
    const last = history.length ? history[history.length - 1] : null;
    const topic = topicOf(last ? last.text : '');
    const bank = agent.reacts[topic] || agent.reacts.default;
    const parts = [];
    // 已解锁的特殊对话优先出场
    const special = this.unlockLines(agent);
    if (special.length && Math.random() < 0.34) {
      parts.push(special[Math.floor(Math.random() * special.length)]);
    } else {
      parts.push(bank[Math.floor(Math.random() * bank.length)]);
    }
    const mem = this.recall(agent, `${agent.name} 和 ${other.name} 说过什么`, 1)[0];
    if (mem && Math.random() < 0.34) {
      parts.push(`我还记得，${clampText(mem.text.replace(/^我/, ''), 30)}。`);
    }
    if (Math.random() < 0.45) {
      parts.push(agent.asks[Math.floor(Math.random() * agent.asks.length)]);
    }
    if (!history.length) parts.unshift(`${agent.tics[Math.floor(Math.random() * agent.tics.length)]}。`);
    return clampText(parts.join(''));
  }

  /* ------------------------------------------------------------ 记忆 */
  remember(agent, other, history) {
    const firstClause = (t) =>
      String(t).split(/[。；]/)[0].replace(/^我/, '').replace(/[，、\s…]+$/g, '').trim().slice(0, 22);
    const mine = history.filter((h) => h.from === agent.name).map((h) => h.text);
    const theirs = history.filter((h) => h.from === other.name).map((h) => h.text);
    const bits = [];
    if (theirs.length) bits.push(`${other.name}提到了「${firstClause(theirs[0])}」`);
    if (mine.length) bits.push(`我告诉它「${firstClause(mine[0])}」`);
    const feel = ['我还挺喜欢这次说话的', '我有点没跟上它的思路', '我心里记下了它说的那句话'][
      Math.floor(Math.random() * 3)
    ];
    const text = clampText(`我和${other.name}在街口说了会儿话。${bits.join('，')}。${feel}。`, 150);
    const importance = Math.max(3, Math.min(9, 4 + Math.floor(history.length / 3)));
    agent.memories.unshift({ text, importance, at: this.t, vec: hashEmbed(text) });
    if (agent.memories.length > 60) agent.memories.pop();
    return text;
  }

  /* ------------------------------------------------------------ 每日剧情 */
  writeStory() {
    const window = this.journal.filter((j) => this.t - j.at < 150).slice(-3);
    const src = window.length ? window : this.journal.slice(-3);
    const opens = ['天还没亮透，', '白气最先从街角起来，', '午后街上没什么风，', '灯还亮着的时候，'];
    const tails = [
      '三只奶蛙谁也没提那张屏幕。',
      '街上还是那一张脸，只是有人多停了半拍。',
      '没有人觉得这有什么奇怪。',
      '故事就停在这一格上，没往下走。',
    ];
    if (!src.length) {
      this.story = '街上没什么动静，三只奶蛙各自走了一圈，又各自走回去了。屏幕上的脸一直亮着，谁也没抬头看。';
      return this.story;
    }
    const body = src.map((p) => `${p.from}：${String(p.text).split(/[。；]/)[0].replace(/^我/, '')}`).join('；');
    this.story = clampText(
      `${opens[Math.floor(Math.random() * opens.length)]}${body}。${tails[Math.floor(Math.random() * tails.length)]}`
        .replace(/[，。；]{2,}/g, '。'),
      260,
    );
    return this.story;
  }

  /* ------------------------------------------------------------ 旅行 */
  tripOf(frogId) {
    if (!this.trip) return null;
    const ids = this.trip.frogIds || [this.trip.frogId];
    return ids.includes(frogId) ? this.trip : null;
  }

  /** 出门/回镇时每只奶蛙站的位置（结伴时错开，避免叠在一起） */
  exitSpot(trip, i) {
    const two = (trip.frogIds?.length || 1) > 1;
    if (!two) return { ...TRIP_EXIT };
    return i === 0
      ? { x: TRIP_EXIT.x - 0.42, y: TRIP_EXIT.y }
      : { x: TRIP_EXIT.x + 0.42, y: TRIP_EXIT.y };
  }

  /** 找一只同样闲着的邻居一起出门 */
  pickPartner(leader) {
    const cands = this.agents.filter(
      (a) => a !== leader && !a.hidden && !a.away && !a.act && !a.plan &&
        a.state === 'wander' && a.rest <= 0 && !this.tripOf(a.id) && !this.refuses(a),
    );
    if (!cands.length) return null;
    cands.sort(
      (x, y) => Math.hypot(x.x - leader.x, x.y - leader.y) - Math.hypot(y.x - leader.x, y.y - leader.y),
    );
    return cands[0];
  }

  /** 结伴汇报：两人轮流讲同一段旅途，互相补充、打趣，最后一句带回东西与感言 */
  jointScript(leader, partner, dest, beats = []) {
    const fill = (s) =>
      s
        .replace(/\{dest\}/g, dest.name)
        .replace(/\{item\}/g, ITEMS[dest.item].name)
        .replace(/\{quote\}/g, dest.quote)
        .replace(/\{thing\}/g, DEST_THING[dest.key] || '那边');
    const L = JOINT_VOICE[leader.personality] || JOINT_VOICE.quiet;
    const P = JOINT_VOICE[partner.personality] || JOINT_VOICE.quiet;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // 行李情节插在中间，两人交替说，最多两条，保持对话紧凑
    const beatTurns = beats.slice(0, 2).map((b, i) => ({
      who: (i % 2 === 0 ? partner : leader).name,
      text: b.text,
    }));
    return [
      { who: leader.name, text: fill(pick(L.open)) },
      { who: partner.name, text: fill(pick(P.add)) },
      ...beatTurns,
      { who: partner.name, text: fill(pick(P.tease)) },
      { who: leader.name, text: fill(pick(L.end)) },
    ];
  }

  startTrip(frogId, destKey, opts = {}) {
    const frog = this.byId(frogId);
    const dest = DESTINATIONS.find((d) => d.key === destKey);
    if (!frog || !dest) return { ok: false, reason: '找不到这只奶蛙或这个目的地。' };
    if (this.trip) return { ok: false, reason: '已经有一只奶蛙在路上。' };
    if (this.refuses(frog)) return { ok: false, reason: `${frog.name} 状态不好，先照顾一下再出门。` };
    // 出门旅游优先于日程：打断当前计划
    if (frog.plan) {
      frog.plan = null;
      frog.state = 'wander';
      frog.target = null;
    }
    if (frog.state !== 'wander' || frog.rest > 0) return { ok: false, reason: `${frog.name} 现在走不开。` };
    if (frog.act) return { ok: false, reason: `${frog.name} 正在玩别的东西。` };

    // 结伴：同伴走不开就自己去
    let partner = opts.partnerId ? this.byId(opts.partnerId) : null;
    if (partner) {
      const ok = partner !== frog && !partner.hidden && !partner.away && !partner.act && !partner.plan &&
        partner.state === 'wander' && partner.rest <= 0 && !this.refuses(partner);
      if (!ok) partner = null;
    }

    const ids = partner ? [frog.id, partner.id] : [frog.id];
    const homes = ids.map((id) => {
      const f = this.byId(id);
      return { x: f.x, y: f.y };
    });
    this.trip = {
      frogId: frog.id, frogIds: ids, dest: destKey, phase: 'leaving', timer: 0, t0: this.t,
      self: !!opts.self, home: homes[0], homes,
      luggage: this.normalizeLuggage(opts.luggage),
    };
    ids.forEach((id, i) => {
      const f = this.byId(id);
      f.plan = null;
      f.act = null;
      f.rest = 0;
      f.state = 'trip';
      f.target = { ...this.exitSpot(this.trip, i) };
    });
    return { ok: true, dest, self: !!opts.self, joint: !!partner };
  }

  /** 行李：只保留认识的、最多 3 件 */
  normalizeLuggage(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const k of list) if (LUGGAGE_KEYS.includes(k) && !out.includes(k)) out.push(k);
    return out.slice(0, LUGGAGE_MAX);
  }

  /** 这趟旅行里，带的行李各自带来一段情节 */
  luggageEvents(luggage, dest) {
    const who = DEST_WHO[dest] || '路过的人';
    const beats = [];
    for (const key of luggage || []) {
      const pool = LUGGAGE_EVENTS[key];
      if (!pool || !pool.length) continue;
      const text = pool[Math.floor(Math.random() * pool.length)].replace(/\{who\}/g, who);
      beats.push({ key, name: (LUGGAGE.find((l) => l.key === key) || {}).name || '', text });
    }
    return beats;
  }

  /** 这趟能不能学到东西：带相关行李更容易，没带也有小概率；结伴时避免两只学同一个 */
  rollSkill(frog, dest, luggage, taken = []) {
    const pool = [];
    for (const l of luggage || []) if (LUGGAGE_SKILL[l]) pool.push(LUGGAGE_SKILL[l]);
    if (dest === 'forest') pool.push('gardening');
    const focused = [...new Set(pool)];
    const candidates = focused.length ? focused : SKILL_KEYS.slice();
    const chance = focused.length ? SKILL_CHANCE_LUGGAGE : SKILL_CHANCE;
    if (Math.random() > chance) return null;
    const known = new Set((frog.skills || []).map((x) => x.key));
    let pick = candidates.filter((k) => !taken.includes(k));
    if (!pick.length) pick = candidates;
    const fresh = pick.filter((k) => !known.has(k));   // 优先学没学过的
    const from = fresh.length ? fresh : pick;
    return from[Math.floor(Math.random() * from.length)];
  }

  /** 学会（或再学一次）一项技能：重复获得只补充经历，不重复创建 */
  learnSkill(frog, key, dest) {
    const def = SKILLS[key];
    if (!def) return null;
    frog.skills = frog.skills || [];
    const destName = (DESTINATIONS.find((d) => d.key === dest) || {}).name || '';
    const who = (def.who && def.who[dest]) || '路过的人';
    const exp = { at: this.t, day: this.day, where: destName, who, story: def.story };
    let skill = frog.skills.find((x) => x.key === key);
    const isNew = !skill;
    if (isNew) {
      skill = { key, name: def.name, count: 1, firstAt: this.t, lastAt: this.t, experiences: [exp] };
      frog.skills.push(skill);
    } else {
      skill.count += 1;
      skill.lastAt = this.t;
      skill.experiences = [exp, ...skill.experiences].slice(0, 3);
    }
    return { key, name: def.name, who, story: def.story, where: destName, isNew, count: skill.count };
  }

  /** 自己挑一个地方出门：优先去没去过的，偶尔拉上一个闲着的邻居 */
  startSelfTrip(frog) {
    const unvisited = DESTINATIONS.filter((d) => !frog.visited || !frog.visited[d.key]);
    const pool = unvisited.length ? unvisited : DESTINATIONS;
    const dest = pool[Math.floor(Math.random() * pool.length)];
    const partner = Math.random() < 0.45 ? this.pickPartner(frog) : null;
    const res = this.startTrip(frog.id, dest.key, { self: true, partnerId: partner?.id });
    if (!res.ok) {
      // 眼下走不开，过一会儿再想
      frog.autoTripAt = this.t + rand([20, 50]);
      return res;
    }
    frog.lastSaidBy = 'self';
    return res;
  }

  /** 点开旅行中的头像：它此刻在目的地（或路上）做什么 */
  tripLookIn(frogId) {
    const trip = this.tripOf(frogId);
    if (!trip) return null;
    const frog = this.byId(frogId);
    const dest = DESTINATIONS.find((d) => d.key === trip.dest);
    if (!frog || !dest) return null;
    const elapsed = Math.max(0, this.t - (trip.t0 || this.t));
    const bank = trip.phase === 'away' ? LOOK_IN[trip.dest] : LOOK_IN.road;
    const pool = (bank && (bank[frog.personality] || bank.quiet)) || [];
    // 每 8 秒换一句，同一帧内稳定，不会闪
    const seed = Math.floor(this.t / 8) + frog.name.length;
    const lines = pool.length
      ? [pool[seed % pool.length], pool[(seed + 1) % pool.length]].filter((v, i, a) => a.indexOf(v) === i)
      : ['它正在忙着。'];
    return {
      dest: dest.key, destName: dest.name, phase: trip.phase,
      hours: Math.max(1, Math.round(elapsed / 5)),
      joint: (trip.frogIds || []).length > 1,
      lines,
    };
  }

  /** 刷新后接着走：把还在路上的奶蛙恢复到正确的阶段与位置 */
  resumeTrip() {
    const trip = this.trip;
    if (!trip || !trip.dest) {
      this.trip = null;
      return;
    }
    if (!Array.isArray(trip.frogIds)) trip.frogIds = [trip.frogId];
    if (!Array.isArray(trip.homes)) trip.homes = [trip.home || { ...TRIP_EXIT }];
    const frogs = trip.frogIds.map((id) => this.byId(id)).filter(Boolean);
    if (!frogs.length) {
      this.trip = null;
      return;
    }
    frogs.forEach((f, i) => {
      f.plan = null;
      f.act = null;
      f.rest = 0;
      f.state = 'trip';
      const spot = this.exitSpot(trip, i);
      const home = trip.homes[i] || trip.homes[0] || { x: f.x, y: f.y };
      if (trip.phase === 'away') {
        f.hidden = true;
        f.x = spot.x;
        f.y = spot.y;
        f.target = null;
      } else if (trip.phase === 'leaving') {
        f.hidden = false;
        f.target = { ...spot };
      } else {
        f.hidden = false;
        f.target = { ...home };
      }
    });
    if (!Number.isFinite(trip.timer)) trip.timer = 0;
    if (trip.phase === 'done') trip.timer = Math.min(trip.timer, 0.6);
  }

  stepTrip(dt) {
    const trip = this.trip;
    if (!trip) return;
    const ids = trip.frogIds || [trip.frogId];
    const frogs = ids.map((id) => this.byId(id)).filter(Boolean);
    if (!frogs.length) {
      this.trip = null;
      return;
    }
    trip.timer -= dt;

    if (trip.phase === 'leaving') {
      // 一起走到广场下缘。target 丢了就重新给，避免卡在半路
      let all = true;
      frogs.forEach((f, i) => {
        const spot = this.exitSpot(trip, i);
        if (!f.target) f.target = { ...spot };
        this.stepMove(f, dt, true);
        if (Math.hypot(f.x - spot.x, f.y - spot.y) > 0.22) all = false;
      });
      if (all) {
        frogs.forEach((f, i) => {
          const spot = this.exitSpot(trip, i);
          f.x = spot.x;
          f.y = spot.y;
          f.dir = 'down';
          f.target = null;
          f.plan = null;
          f.hidden = true;
          f.state = 'trip';
        });
        trip.phase = 'away';
        trip.timer = rand(TRIP_AWAY);
        const names = frogs.map((f) => f.name);
        this.lastSaid = {
          agentId: frogs[0].id,
          text: trip.self
            ? (frogs.length > 1 ? '我们先出门一趟。' : '我先出门一趟。')
            : `${names.join('和')} 出门了。`,
          until: this.t + 2.2,
        };
      }
      return;
    }

    if (trip.phase === 'away') {
      if (trip.timer <= 0) {
        trip.phase = 'returning';
        trip.timer = TRIP_WALK_BACK;
        frogs.forEach((f, i) => {
          const spot = this.exitSpot(trip, i);
          f.hidden = false;
          f.x = spot.x;
          f.y = spot.y;
          f.target = { ...(trip.homes[i] || trip.homes[0]) };
        });
      }
      return;
    }

    if (trip.phase === 'returning') {
      let all = true;
      frogs.forEach((f, i) => {
        const home = trip.homes[i] || trip.homes[0];
        if (!f.target) f.target = { ...home };
        this.stepMove(f, dt, true);
        if (Math.hypot(f.x - home.x, f.y - home.y) > 0.22) all = false;
      });
      if (all) {
        for (const f of frogs) f.target = null;
        trip.phase = 'done';
        trip.timer = 0.6;
      }
      return;
    }

    // done：发牌
    if (trip.phase === 'done' && trip.timer <= 0) {
      const dest = DESTINATIONS.find((d) => d.key === trip.dest);
      const leader = frogs[0];
      const partner = frogs[1] || null;
      const souvenir = { id: nextId('souvenir'), item: dest.item, from: dest.name, quote: dest.quote, at: this.t };
      this.backpack[leader.name].push(souvenir);

      for (const f of frogs) {
        f.visited = f.visited || {};
        f.visited[dest.key] = (f.visited[dest.key] || 0) + 1;
        f.autoTripAt = this.t + rand(AUTO_TRIP_NEXT);
        const tripRule = STAT_ACTIONS.trip;
        this.applyStats(f, `${dest.name}旅行`, tripRule.deltas);
        f.conditions.clothing = clampStat(f.conditions.clothing - 6);
      }
      // 材料与奶币是这一趟共同的收获，只入账一次
      this.addMaterials(TRIP_DROPS[dest.key]);
      this.coins += TRIP_COINS;

      // 行李决定这趟路上发生了什么（不设唯一正确搭配）
      const luggage = Array.isArray(trip.luggage) ? trip.luggage : [];
      const beats = this.luggageEvents(luggage, dest.key);
      // 技能：不是每次旅行都学到；结伴时两只可能学到不同的
      const learned = [];
      for (const f of frogs) {
        const key = this.rollSkill(f, dest.key, luggage, learned.map((x) => x.key));
        if (key) {
          const got = this.learnSkill(f, key, dest.key);
          if (got) learned.push({ frog: f.name, ...got });
        }
      }

      // 汇报一律记录（玩家自己派出去的也要留下行李与技能，只是不弹卡打扰）
      const beatTexts = beats.map((b) => b.text);
      const skillBrief = learned.map((s) => ({ frog: s.frog, name: s.name, who: s.who, isNew: s.isNew }));
      let report = null;
      if (partner) {
        const turns = this.jointScript(leader, partner, dest, beats);
        report = {
          id: nextId('msg'), kind: 'joint',
          frogs: [leader.name, partner.name], frog: leader.name,
          dest: dest.key, destName: dest.name, item: dest.item, quote: dest.quote,
          turns, line: turns[0].text, at: this.t, day: this.day,
          luggage: luggage.slice(), beats: beatTexts, skills: learned,
          self: !!trip.self,
          photoKey: `travel|${leader.name}+${partner.name}|${dest.key}`, read: !trip.self,
        };
      } else {
        const lines = REPORT_LINES[dest.key] || [];
        const line = lines.length ? lines[Math.floor(Math.random() * lines.length)] : `我回来了，给你带了${ITEMS[dest.item].name}。`;
        report = {
          id: nextId('msg'), kind: 'solo', frog: leader.name, dest: dest.key, destName: dest.name,
          item: dest.item, quote: dest.quote, line, at: this.t, day: this.day,
          luggage: luggage.slice(), beats: beatTexts, skills: learned,
          self: !!trip.self,
          photoKey: `travel|${leader.name}|${dest.key}`, read: !trip.self,
        };
      }
      this.messages.unshift(report);
      if (this.messages.length > 20) this.messages.pop();

      this.photoQueue.push({
        kind: 'travel', frog: leader.name, frogs: frogs.map((f) => f.name),
        dest: dest.key, destName: dest.name,
        item: dest.item, quote: dest.quote, souvenirId: souvenir.id, self: !!trip.self,
        beats: beatTexts, skills: skillBrief,
      });
      this.lastSaid = {
        agentId: leader.id,
        text: trip.self
          ? (partner ? '我们回来了，给你讲路上。' : '我回来了，给你看一样东西。')
          : dest.quote,
        until: this.t + 4,
      };
      for (const f of frogs) {
        f.state = 'wander';
        f.rest = 1.2;
        f.think = 1.2;
        f.plan = null;
      }
      this.trip = null;
      return report;
    }
    if (trip.timer <= 0) trip.timer = 0;
  }

  /* ------------------------------------------------------------ 互动性格 / 纪念物装饰 */
  /** 用户手动选互动性格：决定物品互动的动作与台词，与日程倾向互不覆盖 */
  setPersonality(frogId, key) {
    const frog = this.byId(frogId);
    if (!frog || !PERSONALITIES[key]) return { ok: false, reason: '没有这个性格。' };
    frog.personality = key;
    frog.personalitySet = true;
    // 正在进行的互动作废重来，下次互动即生效
    if (frog.act) this.endAct(frog, false);
    return { ok: true, personality: key, name: PERSONALITIES[key].name };
  }

  /** 戴上：只记物品类型，不消耗也不移除广场上的那件 */
  setDeco(frogId, itemKey) {
    const frog = this.byId(frogId);
    if (!frog || !DECO[itemKey]) return { ok: false, reason: '不能戴这个。' };
    const owned = this.placed.some((p) => p.item === itemKey) ||
      Object.values(this.backpack).some((bag) => bag.some((e) => e.item === itemKey));
    if (!owned) return { ok: false, reason: '还没带回这种纪念物。' };
    frog.deco = itemKey;
    return { ok: true, deco: itemKey, name: DECO[itemKey].name };
  }

  clearDeco(frogId) {
    const frog = this.byId(frogId);
    if (!frog) return { ok: false };
    frog.deco = null;
    return { ok: true };
  }

  /* ------------------------------------------------------------ 技能上手：去店里帮一手 */
  maybeStartWork() {
    const now = this.t;
    if (this.work || this.event || this.trip) { this.nextWorkAt = now + 20; return null; }
    const cands = this.agents.filter((a) => this.isFreeForInteraction(a) && (a.skills || []).length > 0);
    if (!cands.length) { this.nextWorkAt = now + 40; return null; }
    const frog = cands[Math.floor(Math.random() * cands.length)];
    const skill = frog.skills[Math.floor(Math.random() * frog.skills.length)];
    const def = SKILL_WORK[skill.key];
    if (!def) { this.nextWorkAt = now + 40; return null; }
    this.work = {
      id: nextId('work'), frogId: frog.id, skill: skill.key, skillName: skill.name,
      place: def.place, role: def.role, phase: 'go', timer: 12, lineTimer: 0,
      home: { x: frog.x, y: frog.y }, spot: { ...def.spot }, startedAt: now,
    };
    frog.plan = null;
    frog.act = null;
    frog.rest = 0;
    frog.state = 'work';
    frog.freeWalk = true;
    frog.target = { ...def.spot };
    this.nextWorkAt = now + rand(WORK_GAP);
    return this.work;
  }

  sayWorkLine(w, f, first) {
    const def = SKILL_WORK[w.skill];
    const bank = def.lines[f.personality] || def.lines.quiet;
    const text = first
      ? `${f.name}来${def.place}${def.role}。`
      : bank[Math.floor(Math.random() * bank.length)];
    this.lastSaid = { agentId: f.id, text, until: this.t + 4 };
  }

  stepWork(dt) {
    const w = this.work;
    if (!w) return;
    const f = this.byId(w.frogId);
    if (!f || f.hidden || this.tripOf(w.frogId)) { this.endWork(); return; }
    w.timer -= dt;
    if (w.phase === 'go') {
      f.state = 'work';
      if (!f.target) f.target = { ...w.spot };
      this.stepMove(f, dt, true);
      if (Math.hypot(f.x - w.spot.x, f.y - w.spot.y) < 0.4 || w.timer <= 0) {
        f.x = w.spot.x;
        f.y = w.spot.y;
        f.target = null;
        f.dir = 'down';
        w.phase = 'do';
        w.timer = WORK_DURATION;
        w.lineTimer = 0.6;
        this.sayWorkLine(w, f, true);
      }
      return;
    }
    if (w.phase === 'do') {
      f.state = 'work';
      f.dir = 'down';
      w.lineTimer -= dt;
      if (w.lineTimer <= 0) {
        w.lineTimer = WORK_LINE_INTERVAL;
        this.sayWorkLine(w, f, false);
      }
      if (w.timer <= 0) {
        w.phase = 'back';
        w.timer = 14;
        f.target = { ...w.home };
      }
      return;
    }
    // back：从店里走回广场
    f.state = 'work';
    if (!f.target) f.target = { ...w.home };
    this.stepMove(f, dt, true);
    if (Math.hypot(f.x - w.home.x, f.y - w.home.y) < 0.4 || w.timer <= 0) this.endWork();
  }

  endWork() {
    const w = this.work;
    if (!w) return;
    const f = this.byId(w.frogId);
    if (f) {
      f.freeWalk = false;
      if (f.state === 'work') {
        f.state = 'wander';
        f.target = null;
        f.rest = 2;
        f.think = 1.2;
      }
    }
    this.work = null;
  }

  /* ------------------------------------------------------------ 纪念物小事件 */
  /** 围着纪念物站一圈的位置 */
  ringSpots(item, count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = (i / Math.max(1, count)) * Math.PI * 2 + 0.5;
      let x = item.x + Math.cos(a) * 1.62;
      let y = item.y + Math.sin(a) * 1.62 * 0.8;
      x = Math.min(24.4, Math.max(1.6, x));
      y = Math.min(13.4, Math.max(1.6, y));
      if (!walkable(x, y)) { x = Math.min(24, item.x + 1.3); y = Math.min(13, item.y + 0.7); }
      out.push({ x, y });
    }
    return out;
  }

  /** 已摆放的纪念物偶尔触发小事件；同时只开一场，带冷却 */
  maybeStartEvent() {
    const now = this.t;
    if (this.event) { this.nextEventAt = now + 20; return null; }
    const cands = this.placed.filter((it) => SOUVENIR_EVENTS[it.item] && (this.itemEventAt[it.id] || 0) <= now);
    if (!cands.length) { this.nextEventAt = now + 25; return null; }
    const item = cands[Math.floor(Math.random() * cands.length)];
    // 只有当前在小镇的奶蛙能参与：出差的、藏着的、正在忙的都不算
    const free = this.agents.filter((a) => this.isFreeForInteraction(a));
    if (free.length < 2) { this.nextEventAt = now + 30; return null; }
    const near = free.filter((a) => Math.hypot(a.x - item.x, a.y - item.y) < 7);
    const participants = (near.length >= 2 ? near : free).slice(0, 3);
    const spots = this.ringSpots(item, participants.length);
    const def = SOUVENIR_EVENTS[item.item];
    this.event = {
      id: nextId('event'), itemId: item.id, item: item.item, key: def.key, name: def.name,
      phase: 'gather', timer: 8, lineTimer: 0, turn: 0,
      participants: participants.map((a) => a.id), spots, startedAt: now,
    };
    participants.forEach((f, i) => {
      f.plan = null;
      f.act = null;
      f.rest = 0;
      f.state = 'event';
      f.target = { ...spots[i] };
    });
    this.itemEventAt[item.id] = now + rand(EVENT_ITEM_COOLDOWN);
    this.nextEventAt = now + rand(EVENT_GLOBAL_GAP);
    return this.event;
  }

  stepEvent(dt) {
    const ev = this.event;
    if (!ev) return;
    const item = this.placed.find((p) => p.id === ev.itemId);
    if (!item) { this.endEvent(); return; }
    ev.timer -= dt;
    const def = SOUVENIR_EVENTS[item.item];
    const alive = ev.participants.filter((id) => {
      const f = this.byId(id);
      return f && !f.hidden && !this.tripOf(id);
    });
    if (alive.length < 2) { this.endEvent(); return; }

    if (ev.phase === 'gather') {
      let all = true;
      ev.participants.forEach((id, i) => {
        const f = this.byId(id);
        if (!f || f.hidden) return;
        f.state = 'event';
        if (!f.target) f.target = { ...ev.spots[i] };
        this.stepMove(f, dt, true);
        if (Math.hypot(f.x - ev.spots[i].x, f.y - ev.spots[i].y) > 0.28) all = false;
      });
      if (all || ev.timer <= 0) {
        ev.phase = 'enjoy';
        ev.timer = EVENT_ENJOY_TIME;
        ev.lineTimer = 0.7;
        ev.turn = 0;
        this.lastSaid = { agentId: alive[0], text: def.line, until: this.t + 4 };
      }
      return;
    }

    if (ev.phase === 'enjoy') {
      ev.participants.forEach((id) => {
        const f = this.byId(id);
        if (!f || f.hidden) return;
        f.state = 'event';
        f.dir = Math.abs(item.x - f.x) > Math.abs(item.y - f.y)
          ? (item.x > f.x ? 'right' : 'left')
          : (item.y > f.y ? 'down' : 'up');
      });
      ev.lineTimer -= dt;
      if (ev.lineTimer <= 0) {
        ev.lineTimer = EVENT_LINE_INTERVAL;
        const id = ev.participants[ev.turn % ev.participants.length];
        ev.turn += 1;
        const f = this.byId(id);
        if (f && !f.hidden) {
          const bank = EVENT_REACTIONS[def.key] || {};
          const lines = bank[f.personality] || bank.quiet || [def.line];
          this.lastSaid = { agentId: f.id, text: lines[Math.floor(Math.random() * lines.length)], until: this.t + 3.4 };
        }
      }
      if (ev.timer <= 0) this.endEvent();
    }
  }

  endEvent() {
    const ev = this.event;
    if (!ev) return;
    for (const id of ev.participants) {
      const f = this.byId(id);
      if (!f) continue;
      if (f.state === 'event') {
        f.state = 'wander';
        f.target = null;
        f.rest = 1.6;
        f.think = 1.0;
      }
    }
    this.event = null;
  }

  /* ------------------------------------------------------------ 物品互动 */
  spotFree(x, y, self) {
    for (const o of this.agents) {
      if (o === self || o.hidden) continue;
      if (Math.hypot(o.x - x, o.y - y) < 1.15) return false;
    }
    // 其它已摆放的物品也要留出距离
    for (const it of this.placed) {
      if (Math.hypot(it.x - x, it.y - y) < 0.95) return false;
    }
    return true;
  }

  standPointFor(frog, item) {
    const dx = frog.x - item.x;
    const dy = frog.y - item.y;
    const d = Math.hypot(dx, dy) || 1;
    const first = { x: item.x + (dx / d) * 1.35, y: item.y + (dy / d) * 1.35 };
    if (walkable(first.x, first.y) && this.spotFree(first.x, first.y, frog)) return first;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x = item.x + Math.cos(a) * 1.35;
      const y = item.y + Math.sin(a) * 1.35;
      if (walkable(x, y) && this.spotFree(x, y, frog)) return { x, y };
    }
    return null;
  }

  canInteract(frog, item) {
    if (!frog || !item) return false;
    if (this.refuses(frog)) return false;
    if (!this.isFreeForInteraction(frog)) return false;
    const key = `${frog.name}|${item.item}`;
    if ((this.cooldown[key] || 0) > this.t) return false;
    if ((this.itemCooldown[item.id] || 0) > this.t) return false;
    return true;
  }

  startInteraction(frogId, itemId) {
    const frog = this.byId(frogId);
    const item = this.placed.find((p) => p.id === itemId);
    if (!frog || !item) return { ok: false, reason: '找不到这只奶蛙或这件东西。' };
    if (!this.canInteract(frog, item)) return { ok: false, reason: `${frog.name} 现在不方便过去。` };
    const stand = this.standPointFor(frog, item);
    if (!stand) return { ok: false, reason: '那只奶蛙挤不过去，换个位置试试。' };
    const personality = PERSONALITIES[frog.personality] ? frog.personality : 'quiet';
    const reaction = REACTIONS[personality][item.item];
    const acting = this.agents.filter((a) => a.act && a.act.itemId === item.id).length;
    if (acting >= 3) return { ok: false, reason: '这件东西旁边已经挤了三只，等一会儿。' };
    frog.plan = null;   // 停下手里的闲事
    frog.act = {
      itemId, item: item.item, itemOwner: item.owner, personality,
      itemAt: { x: item.x, y: item.y },
      line: reaction.line, pose: reaction.pose,
      stand, phase: 'approach', timer: 3.2, progress: 0, facing: 'down',
    };
    frog.state = 'act';
    frog.target = { ...stand };
    return { ok: true, personality, reaction };
  }

  stepAct(frog, dt) {
    const act = frog.act;
    if (!act) {
      frog.state = 'wander';
      return;
    }
    const item = this.placed.find((p) => p.id === act.itemId);
    if (!item || frog.hidden) {
      this.endAct(frog, false);
      return;
    }
    // 物品被挪走时任务作废（收回由上面的 !item 分支处理）
    if (act.itemAt && Math.hypot(item.x - act.itemAt.x, item.y - act.itemAt.y) > 0.8) {
      this.endAct(frog, false);
      return;
    }
    if (act.phase === 'approach') {
      this.stepMove(frog, dt, true);
      act.timer -= dt;
      const near = Math.hypot(frog.x - act.stand.x, frog.y - act.stand.y) < 0.16;
      if (near || act.timer <= 0) {
        frog.x = act.stand.x;
        frog.y = act.stand.y;
        frog.target = null;
        act.phase = 'stay';
        act.timer = ACT_STAY;
        act.facing = Math.abs(item.x - frog.x) > Math.abs(item.y - frog.y)
          ? item.x > frog.x ? 'right' : 'left'
          : item.y > frog.y ? 'down' : 'up';
        frog.dir = act.facing;
      }
      return;
    }
    if (act.phase === 'stay') {
      act.timer -= dt;
      frog.dir = act.facing;
      if (act.timer <= 0) {
        act.phase = 'play';
        act.timer = ACT_PLAY;
        act.progress = 0;
        this.lastSaid = { agentId: frog.id, text: act.line, until: this.t + ACT_PLAY + 0.6 };
        this.photoQueue.push({
          kind: 'play', frog: frog.name, item: act.item, owner: act.itemOwner,
          personality: act.personality, line: act.line,
        });
      }
      return;
    }
    if (act.phase === 'play') {
      act.timer -= dt;
      act.progress = Math.min(1, Math.max(0, 1 - act.timer / ACT_PLAY));
      frog.dir = act.facing;
      if (act.timer <= 0) this.endAct(frog, true);
    }
  }

  endAct(frog, completed) {
    const act = frog.act;
    frog.act = null;
    frog.state = 'wander';
    frog.rest = 2.2;
    frog.think = 1.4;
    frog.target = null;
    if (!act) return;
    if (completed) {
      this.cooldown[`${frog.name}|${act.item}`] = this.t + ACT_COOLDOWN_FROG;
      // 完成才给整件物品上冷却；被取消（物品被挪走/收回）不锁物品
      this.itemCooldown[act.itemId] = this.t + ACT_COOLDOWN_ITEM;
      const rule = PLAY_RULE;
      this.applyStats(frog, rule.label, rule.deltas);
      this.coins += 1;
      // 玩别人的东西：对物主加好感
      if (act.itemOwner && act.itemOwner !== frog.name) {
        const owner = this.byName(act.itemOwner);
        if (owner) {
          this.applyStats(frog, `玩了${owner.name}的东西`, { affinityTo: { [owner.id]: PLAY_OTHER_AFFINITY } });
        }
      }
    } else if (this.itemCooldown[act.itemId] > this.t + ACT_COOLDOWN_ITEM) {
      this.itemCooldown[act.itemId] = this.t + ACT_COOLDOWN_ITEM;
    }
  }

  /* ------------------------------------------------------------ 背包与摆放 */
  /** 摆放位置是否可用：要在广场可走地面上，且不跟别的东西/奶蛙挤在一起 */
  canPlaceAt(x, y, ignoreItemId = null) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (!walkable(x, y, 0.3)) return false;
    for (const it of this.placed) {
      if (it.id === ignoreItemId) continue;
      if (Math.hypot(it.x - x, it.y - y) < 0.9) return false;
    }
    for (const a of this.agents) {
      if (a.hidden) continue;
      if (Math.hypot(a.x - x, a.y - y) < 0.7) return false;
    }
    return true;
  }

  /** 由放置者自己挑位置放下 */
  placeAt(ownerName, souvenirId, x, y) {
    const bag = this.backpack[ownerName] || [];
    const idx = bag.findIndex((e) => e.id === souvenirId);
    if (idx < 0) return { ok: false, reason: '背包里没有这件东西。' };
    if (!this.canPlaceAt(x, y)) return { ok: false, reason: '这里放不下，换个空一点的地方。' };
    const entry = bag.splice(idx, 1)[0];
    const placed = {
      id: nextId('placed'), item: entry.item, from: entry.from, quote: entry.quote,
      owner: ownerName, x, y,
    };
    this.placed.push(placed);
    return { ok: true, placed };
  }

  /** 挪动已经放在广场上的东西 */
  movePlaced(itemId, x, y) {
    const item = this.placed.find((p) => p.id === itemId);
    if (!item) return { ok: false, reason: '这件东西不在广场上。' };
    if (!this.canPlaceAt(x, y, itemId)) return { ok: false, reason: '这里放不下，换个空一点的地方。' };
    // 物品被挪走：正在玩它的奶蛙任务作废
    for (const a of this.agents) if (a.act && a.act.itemId === itemId) this.endAct(a, false);
    item.x = x;
    item.y = y;
    return { ok: true, placed: item };
  }

  freeSlot() {
    for (let i = 0; i < PLACE_SLOTS.length; i++) {
      const s = PLACE_SLOTS[i];
      if (this.slotUse[i]) continue;
      if (!walkable(s.x, s.y)) continue;
      if (this.placed.some((p) => Math.hypot(p.x - s.x, p.y - s.y) < 1.6)) continue;
      return { index: i, ...s };
    }
    return null;
  }

  placeFromBackpack(ownerName, souvenirId) {
    const bag = this.backpack[ownerName] || [];
    const idx = bag.findIndex((e) => e.id === souvenirId);
    if (idx < 0) return { ok: false, reason: '背包里没有这件东西。' };
    const slot = this.freeSlot();
    if (!slot) return { ok: false, reason: '广场上的位置摆满了，先收回一件。' };
    const entry = bag.splice(idx, 1)[0];
    const placed = { id: nextId('placed'), item: entry.item, from: entry.from, quote: entry.quote, owner: ownerName, slot: slot.index, x: slot.x, y: slot.y };
    this.placed.push(placed);
    this.slotUse[slot.index] = placed.id;
    return { ok: true, placed };
  }

  retrieveToBackpack(itemId) {
    const idx = this.placed.findIndex((p) => p.id === itemId);
    if (idx < 0) return { ok: false, reason: '这件东西已经不在广场上了。' };
    const item = this.placed[idx];
    // 物品被收回：正在玩它的奶蛙任务作废
    for (const a of this.agents) if (a.act && a.act.itemId === itemId) this.endAct(a, false);
    this.placed.splice(idx, 1);
    if (item.slot !== undefined) delete this.slotUse[item.slot];
    const owner = this.byName(item.owner) ? item.owner : this.agents[0].name;
    if (!this.backpack[owner]) this.backpack[owner] = [];
    this.backpack[owner].push({
      id: nextId('souvenir'), item: item.item, from: item.from, quote: item.quote, at: this.t,
    });
    return { ok: true, owner };
  }

  placeSouvenir(souvenirId) {
    const owner = this.bagOwnerOf(souvenirId);
    if (!owner) return { ok: false, reason: '背包里没有这件东西。' };
    return this.placeFromBackpack(owner, souvenirId);
  }

  /** 找到某件纪念品现在在谁的包里 */
  bagOwnerOf(souvenirId) {
    for (const [name, bag] of Object.entries(this.backpack)) {
      if (bag.some((e) => e.id === souvenirId)) return name;
    }
    return null;
  }

  takePhotoRequests() {
    const q = this.photoQueue;
    this.photoQueue = [];
    return q;
  }

  markMessageRead(id) {
    const m = this.messages.find((x) => x.id === id);
    if (m) m.read = true;
  }

  /** 同一只奶蛙（或同一对）+ 同一目的地，复用同一张图 */
  photoKey(req) {
    if (req.kind !== 'travel') return `play|${req.frog}|${req.item}|${req.personality}`;
    const who = (req.frogs && req.frogs.length > 1 ? req.frogs.join('+') : req.frog);
    return `travel|${who}|${req.dest}`;
  }

  addAlbumPhoto(entry) {
    const existing = this.album.findIndex((a) => a.key === entry.key);
    if (existing >= 0) {
      const prev = this.album.splice(existing, 1)[0];
      this.album.unshift({ ...prev, ...entry, id: prev.id });
    } else {
      this.album.unshift({ id: nextId('photo'), ...entry });
    }
    if (this.album.length > 12) {
      const dropped = this.album.slice(12);
      this.album = this.album.slice(0, 12);
      for (const d of dropped) delete this.photoCache[d.key];
    }
    if (!this.photoCache[entry.key]) this.photoCache[entry.key] = entry.image;
    return this.album;
  }

  /* ------------------------------------------------------------ 日程 */
  time() { return timeOf(this.t); }

  secondsUntilMorning() {
    const t = timeOf(this.t);
    const hours = t.hour < 6
      ? 6 - t.hour - t.minute / 60
      : 24 - t.hour + 6 - t.minute / 60;
    return Math.max(20, hours * (DAY_SECONDS / 24));
  }

  /** 需求优先，其次看作息段与倾向；有 30% 概率偏离倾向，不完全锁死 */
  planActivity(a, time) {
    const c = a.conditions;
    if (c.fatigue >= 78) return 'sleep';
    if (c.hunger >= 58) return this.coins >= (ACTIVITIES.eat.cost || 0) ? 'eat' : 'bread';
    if (c.hygiene <= 40) return 'bathe';
    if (this.effective(a, 'mood') <= 30) return 'daze';
    const slot = slotAt(time.hour);
    if (time.festival && ['morning', 'afternoon', 'dusk'].includes(slot.key)) return 'chat';
    const deviate = Math.random() < 0.3;
    const tend = deviate
      ? TENDENCIES[Math.floor(Math.random() * TENDENCIES.length)].key
      : a.tendency;
    switch (slot.key) {
      case 'sleep': return 'sleep';
      case 'wake': return 'wake';
      case 'breakfast':
      case 'lunch':
      case 'dinner': {
        // 同一餐段只吃一次，否则吃完会立刻再排一次、反复扣钱
        if (a.ateSlot === slot.key) return this.effective(a, 'mood') <= 45 ? 'daze' : 'chat';
        return this.coins >= (ACTIVITIES.eat.cost || 0) ? 'eat' : 'bread';
      }
      case 'morning':
        if (tend === 'work') return 'work';
        if (tend === 'leisure') return 'read';
        return 'chat';
      case 'afternoon':
        if (tend === 'work') return 'work';
        if (tend === 'leisure') return 'walk';
        return 'chat';
      case 'dusk':
        return tend === 'social' ? 'chat' : 'walk';
      case 'evening':
        return tend === 'work' ? 'work' : 'daze';
      default:
        return 'daze';
    }
  }

  assignPlan(a, time) {
    const key = this.planActivity(a, time);
    const act = ACTIVITIES[key];
    const spotKey = key === 'work' ? WORK_SPOT[a.key] || 'plaza' : act.spot;
    const spot = SPOTS[spotKey] || SPOTS.plaza;
    a.plan = {
      key, name: act.name, spot: spot.key,
      onscreen: !spot.offscreen,
      phase: 'go', timer: 0, tick: 0,
      home: { x: a.x, y: a.y },
      slot: slotAt(time.hour).key,
      line: act.lines[Math.floor(Math.random() * act.lines.length)],
    };
    if (key === 'eat' || key === 'bread') a.ateSlot = slotAt(time.hour).key;
    a.state = key === 'chat' ? 'wander' : 'plan';
    if (spot.offscreen) {
      a.target = { ...TRIP_EXIT };
    } else {
      // 同一地点的奶蛙错开站位，避免叠在一起
      const off = (a.idx - 1) * 1.7;
      a.target = { x: spot.x + off, y: spot.y + (a.idx - 1) * 0.55 };
    }
    a.think = 0;
    a.moving = false;
  }

  applyActivityTick(a, act) {
    const statDeltas = {};
    const condDeltas = {};
    for (const [k, v] of Object.entries(act.per || {})) {
      if (STAT_KEYS.includes(k)) statDeltas[k] = v;
      else if (CONDITION_KEYS.includes(k)) condDeltas[k] = v;
      // coins 单独处理
    }
    if (Object.keys(statDeltas).length) this.applyStats(a, act.name, statDeltas, { silent: true });
    for (const [k, v] of Object.entries(condDeltas)) a.conditions[k] = clampStat(a.conditions[k] + v);
    if (act.per && act.per.coins) this.coins += act.per.coins;
    this.evaluateUnlocks(a);
  }

  finishPlan(a, act) {
    if (act.earn) this.coins += act.earn;
    const endDeltas = END_DELTAS[act.name] || {};
    const statDeltas = {};
    for (const [k, v] of Object.entries(endDeltas)) {
      if (CONDITION_KEYS.includes(k)) a.conditions[k] = clampStat(a.conditions[k] + v);
      else statDeltas[k] = v;
    }
    if (Object.keys(statDeltas).length) this.applyStats(a, a.plan.name + '结束', statDeltas, { silent: true });
    a.plan = null;
    a.state = 'wander';
    a.rest = 2;
    a.think = 0.6;
    a.target = null;
  }

  stepPlan(a, dt) {
    const p = a.plan;
    const act = ACTIVITIES[p.key];
    const spot = SPOTS[p.spot];
    if (p.phase === 'go') {
      this.stepMove(a, dt, true);
      if (!a.target) { this.finishPlan(a, act); return; }
      const near = Math.abs(a.x - a.target.x) < 0.28 && Math.abs(a.y - a.target.y) < 0.28;
      if (!near) return;
      a.target = null;
      p.phase = 'do';
      p.tick = 0;
      if (spot.offscreen) {
        a.hidden = true;
        p.timer = p.key === 'sleep' ? this.secondsUntilMorning() : spot.away || 14;
      } else {
        p.timer = act.untilMorning ? this.secondsUntilMorning() : act.stay || 12;
        this.lastSaid = { agentId: a.id, text: `${p.line}（${act.name}）`, until: this.t + 4 };
      }
      if (act.cost) this.coins = Math.max(0, this.coins - act.cost);
      return;
    }
    if (p.phase === 'do') {
      p.timer -= dt;
      p.tick += dt;
      if (p.tick >= 5) {
        p.tick -= 5;
        this.applyActivityTick(a, act);
      }
      if (p.timer > 0) return;
      if (spot.offscreen) {
        a.hidden = false;
        a.x = TRIP_EXIT.x;
        a.y = TRIP_EXIT.y;
        p.phase = 'back';
        a.target = { ...p.home };
        return;
      }
      this.finishPlan(a, act);
      return;
    }
    // back：从广场下缘走回原位
    this.stepMove(a, dt, true);
    if (!a.target) { this.finishPlan(a, act); return; }
    if (Math.abs(a.x - a.target.x) < 0.32 && Math.abs(a.y - a.target.y) < 0.32) {
      a.target = null;
      this.finishPlan(a, act);
    }
  }

  /** 可以就地搭话：闲聊/发呆/刚起床/吃饭这类停下来做的事 */
  canSocialize(a) {
    if (a.act || a.rest > 0 || a.hidden || a.away || a.state === 'talk') return false;
    if (!a.plan) return a.state === 'wander';
    if (a.plan.phase !== 'do') return false;
    return ['chat', 'daze', 'wake', 'eat'].includes(a.plan.key);
  }

  /* ------------------------------------------------------------ 推进 */
  step(dt) {
    if (this.frozen) return;
    this.t += dt;
    this.day = 1 + Math.floor(this.t / 120);

    // 数值结算：每 5 秒一次
    this.statAcc += dt;
    if (this.statAcc >= 5) {
      this.statAcc -= 5;
      this.metabolism();
    }
    const timeNow = timeOf(this.t);
    this.clock = timeNow;

    // 行为后果：体力见底必须歇一会儿；疲劳/健康极差时强制休息
    for (const a of this.agents) {
      if (a.hidden || a.act || a.state === 'talk' || a.state === 'trip') continue;
      if (a.plan) continue;
      if (this.effective(a, 'stamina') < 15 && a.rest <= 0) {
        a.rest = Math.max(a.rest, 6);
        a.target = null;
        this.applyStats(a, '体力见底，歇一会儿', { mood: -1 });
      } else if ((a.conditions.fatigue >= 90 || a.conditions.health <= 20) && a.rest <= 0) {
        a.rest = Math.max(a.rest, 10);
        a.target = null;
      }
    }

    if (this.trip) this.stepTrip(dt);

    // 纪念物的广场小事件
    this.stepEvent(dt);
    if (!this.event && this.t >= this.nextEventAt) this.maybeStartEvent();

    // 学过手艺的会去店里帮一手
    this.stepWork(dt);
    if (!this.work && !this.event && this.t >= this.nextWorkAt) this.maybeStartWork();

    // 自己决定出趟门
    if (!this.trip) {
      for (const a of this.agents) {
        if (a.hidden || a.act || a.rest > 0 || a.state !== 'wander' || a.plan) continue;
        if (timeOf(this.t).night) continue;
        if (Number.isFinite(a.autoTripAt) && this.t >= a.autoTripAt) {
          this.startSelfTrip(a);
          break;
        }
      }
    }

    for (const a of this.agents) {
      a.moving = false;
      if (a.hidden) {
        // 在家/在外：日程计时仍要推进，否则睡下去就醒不来。
        // 但出差中的奶蛙不跑日程——旧代码会在这里把它提前拉回广场。
        if (a.plan && !this.tripOf(a.id)) this.stepPlan(a, dt);
        continue;
      }
      if (a.state === 'trip') continue;
      if (a.state === 'event') continue;   // 围在纪念物旁边时由 stepEvent 驱动
      if (a.state === 'work') continue;    // 在店里帮忙时由 stepWork 驱动
      if (a.act) {
        this.stepAct(a, dt);
        continue;
      }
      if (a.rest > 0) {
        a.rest -= dt;
        continue;
      }
      if (a.state === 'talk') {
        this.stepTalk(a, dt);
        continue;
      }
      if (a.plan) {
        const slotNow = slotAt(timeNow.hour).key;
        const interruptible = !['sleep', 'bathe', 'eat', 'bread'].includes(a.plan.key) && a.plan.phase !== 'back';
        if (a.plan.slot !== slotNow && interruptible && a.rest <= 0) {
          // 换段了：重新安排，避免早餐时段被上一件事占满
          const act = ACTIVITIES[a.plan.key];
          a.plan = null;
          a.state = 'wander';
          a.target = null;
          this.assignPlan(a, timeNow);
          continue;
        }
        this.stepPlan(a, dt);
        continue;
      }
      // 没有日程：按当前作息段安排一个
      if (a.state === 'wander' && !a.away) {
        this.assignPlan(a, timeNow);
        continue;
      }
      this.stepMove(a, dt);
    }

    // 相遇：只有停下来做事的（闲聊/发呆/刚起/吃饭）才会搭话
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a = this.agents[i];
        const b = this.agents[j];
        if (!this.canSocialize(a) || !this.canSocialize(b)) continue;
        if (this.effective(a, 'mood') < 20 || this.effective(b, 'mood') < 20) continue;
        if (this.refuses(a) || this.refuses(b)) continue;
        const boost = Math.max(this.chatBoost(a), this.chatBoost(b));
        if (Math.hypot(a.x - b.x, a.y - b.y) < 1.7 && Math.random() < 0.06 * boost) {
          this.startTalk(a, b);
        }
      }
    }

    // 轻微避让：闲逛的奶蛙不要叠在一起（正在互动或说话的保持不动）
    for (const a of this.agents) {
      if (a.hidden || a.state !== 'wander' || a.act) continue;
      for (const b of this.agents) {
        if (a === b || b.hidden) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.0001 && d < 1.05) {
          const push = (1.05 - d) * 0.5;
          const nx = a.x + (dx / d) * push;
          const ny = a.y + (dy / d) * push;
          if (walkable(nx, a.y)) a.x = nx;
          if (walkable(a.x, ny)) a.y = ny;
        }
      }
    }

    // 自由游走时靠近摆放物品，也会自己凑上去玩
    if (this.placed.length) {
      for (const a of this.agents) {
        if (!this.isFreeForInteraction(a)) continue;
        if (this.refuses(a)) continue;
        for (const item of this.placed) {
          if (Math.hypot(a.x - item.x, a.y - item.y) < AUTO_RADIUS && this.canInteract(a, item)) {
            if (Math.random() < 0.045 * dt * 60) {
              this.startInteraction(a.id, item.id);
            }
            break;
          }
        }
      }
    }
  }

  startTalk(a, b) {
    const cx = Math.min(22, Math.max(4, (a.x + b.x) / 2));
    const cy = Math.min(11, Math.max(4, (a.y + b.y) / 2));
    a.x = cx - 1.6; a.y = cy + 0.8;
    b.x = cx + 1.6; b.y = cy - 0.8;
    a.state = 'talk';
    b.state = 'talk';
    a.partnerId = b.id;
    b.partnerId = a.id;
    a.talkTimer = 0.5;
    b.talkTimer = 999;
    a.turn = 0;
    b.turn = 0;
    const turns = 6 + Math.floor(Math.random() * 5);
    a.maxTurns = turns;
    b.maxTurns = turns;
    a.history = [];
    b.history = [];
    a.faceTo = b;
    b.faceTo = a;
  }

  stepTalk(a, dt) {
    const b = this.byId(a.partnerId);
    if (!b) {
      a.state = 'wander';
      return;
    }
    a.dir = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? (b.x > a.x ? 'right' : 'left') : b.y > a.y ? 'down' : 'up';
    a.talkTimer -= dt;
    if (a.talkTimer > 0) return;

    const history = a.history.concat([]);
    const text = this.line(a, b, history);
    const entry = { from: a.name, to: b.name, text, day: this.day, at: this.t };
    a.history.push(entry);
    b.history.push(entry);
    this.journal.push(entry);
    this.lastSaid = { agentId: a.id, text, until: this.t + TALK_INTERVAL };
    if (this.journal.length > 400) this.journal.shift();
    a.turn++;
    a.talkTimer = Infinity;

    if (a.history.length >= a.maxTurns) {
      const talkRule = STAT_ACTIONS.talk;
      this.applyStats(a, talkRule.label, talkRule.deltas);
      this.applyStats(b, talkRule.label, talkRule.deltas);
      // 交谈会拉近彼此的好感
      this.applyStats(a, '和' + b.name + '说上话', { affinityTo: { [b.id]: 3 } }, { silent: true });
      this.applyStats(b, '和' + a.name + '说上话', { affinityTo: { [a.id]: 3 } }, { silent: true });
      this.remember(a, b, a.history);
      this.remember(b, a, a.history);
      for (const p of [a, b]) {
        p.state = p.plan ? (p.plan.key === 'chat' ? 'wander' : 'plan') : 'wander';
        p.partnerId = null;
        p.rest = REST_TIME * (0.6 + Math.random() * 0.8);
        p.target = null;
        p.history = [];
      }
      return;
    }
    b.talkTimer = TALK_INTERVAL;
  }

  stepMove(a, dt, force = false) {
    if (!a.target || (Math.abs(a.target.x - a.x) < 0.12 && Math.abs(a.target.y - a.y) < 0.12)) {
      if (force) return;
      a.think -= dt;
      if (a.think > 0) return;
      a.think = 0.4 + Math.random() * 0.8;
      a.target = this.open[Math.floor(Math.random() * this.open.length)];
      if (Math.hypot(a.target.x - a.x, a.target.y - a.y) < 3) return (a.target = null);
      return;
    }
    const dx = a.target.x - a.x;
    const dy = a.target.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const step = Math.min(SPEED * this.speedFactor(a) * dt, dist);
    const nx = a.x + (dx / dist) * step;
    const ny = a.y + (dy / dist) * step;
    // 去店铺门口"上班"时允许走出广场网格（坐标由底图反算）
    const free = a.freeWalk === true;
    let moved = false;
    if (free || walkable(nx, a.y)) {
      a.x = nx;
      moved = true;
    }
    if (free || walkable(a.x, ny)) {
      a.y = ny;
      moved = true;
    }
    if (!moved) {
      a.target = null;
      return;
    }
    a.moving = true;
    a.frame = Math.floor(this.t * 6) % 3;
    if (Math.abs(dx) > Math.abs(dy)) a.dir = dx > 0 ? 'right' : 'left';
    else a.dir = dy > 0 ? 'down' : 'up';
  }
}

export function loadSaved() {
  try {
    const raw = localStorage.getItem('naiwa-town-v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTown(town) {
  try {
    localStorage.setItem('naiwa-town-v1', JSON.stringify(town.snapshot()));
  } catch {
    /* 忽略隐私模式等 */
  }
}
