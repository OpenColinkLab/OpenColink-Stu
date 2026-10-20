(() => {
  'use strict';

  const ARTWORKS = [
    {
      id: 'qin-01', room: 'qin', roomLabel: '秦汉厅 · QIN & HAN', title: '马王堆T形帛画奶蛙',
      original: '原作：西汉马王堆T形帛画', image: 'assets/paintings/qin-mawang-banner.webp',
      description: '完整保留帛画中的天界、人间与地下结构，将下方中央祭祀人物转化为正面帛画奶蛙。矿物色、丝帛磨损与汉代图像秩序仍是作品的主体。',
      side: 'left', z: 11.7, height: 2.38
    },
    {
      id: 'qin-02', room: 'qin', roomLabel: '秦汉厅 · QIN & HAN', title: '东汉铜奔马奶蛙',
      original: '原作：东汉铜奔马', image: 'assets/paintings/qin-bronze-horse.webp',
      description: '奔马的速度、腾空姿态与青铜锈色保持不变，奶蛙以正面骑手的身份坐于马背。角色被翻译为同一件汉代青铜器上的铸造语言。',
      side: 'right', z: 11.1, height: 1.72
    },
    {
      id: 'qin-03', room: 'qin', roomLabel: '秦汉厅 · QIN & HAN', title: '马踏匈奴奶蛙',
      original: '原作：霍去病墓石刻《马踏匈奴》', image: 'assets/paintings/qin-stone-horse.webp',
      description: '粗犷花岗岩、纪念碑式马身与户外光线被保留下来，马下人物替换为同材质的成熟态奶蛙，让角色成为石刻叙事的一部分。',
      side: 'left', z: 7.3, height: 1.72
    },
    {
      id: 'qin-04', room: 'qin', roomLabel: '秦汉厅 · QIN & HAN', title: '武氏祠车马画像石奶蛙',
      original: '原作：武氏祠汉画像石车马图', image: 'assets/paintings/qin-wu-shrine.webp',
      description: '双层车马图、拓片纸纹与墨色密度完整保存；下层车中驭手成为持缰的奶蛙剪影，以极小尺度嵌入宏大的出行队列。',
      side: 'right', z: 6.8, height: 1.72
    },
    {
      id: 'rom-01', room: 'romantic', roomLabel: '浪漫主义厅 · ROMANTICISM', title: '干草车奶蛙',
      original: '约翰·康斯太勃尔《干草车》，1821', image: 'assets/paintings/rom-hay-wain.webp',
      description: '农舍、橡树、浅河、马匹和暴云天空构成英国乡野的湿润空气。幼态奶蛙代替车上骑手，与康斯太勃尔破碎、闪烁的笔触融为一体。',
      side: 'left', z: 2.2, height: 1.78
    },
    {
      id: 'rom-02', room: 'romantic', roomLabel: '浪漫主义厅 · ROMANTICISM', title: '雾海上的旅人奶蛙',
      original: '卡斯帕·大卫·弗里德里希《雾海上的旅人》，1818', image: 'assets/paintings/rom-wanderer.webp',
      description: '成熟态奶蛙以完全背影站上岩峰，面对雾海、山脊和远处群山。看不见面孔，让观看者仍能进入原作关于孤独与崇高的凝视。',
      side: 'right', z: 1.7, height: 2.2
    },
    {
      id: 'rom-03', room: 'romantic', roomLabel: '浪漫主义厅 · ROMANTICISM', title: '但丁之舟奶蛙',
      original: '欧仁·德拉克罗瓦《但丁之舟》，1822', image: 'assets/paintings/rom-dante.webp',
      description: '翻涌水面、燃烧城市与攀附船身的受难者仍保持原作的剧烈动势。披红兜帽的奶蛙占据但丁的位置，成为风暴中的情绪中心。',
      side: 'left', z: -2.1, height: 1.72
    },
    {
      id: 'rom-04', room: 'romantic', roomLabel: '浪漫主义厅 · ROMANTICISM', title: '梦魇奶蛙',
      original: '亨利·富塞利《梦魇》，1781', image: 'assets/paintings/rom-nightmare.webp',
      description: '奶蛙低伏在沉睡者胸腹上，取代原作梦魇魔的位置。红幔、幽暗马头和舞台般的明暗对照，使熟悉的形象进入不安的夜间寓言。',
      side: 'right', z: -2.7, height: 1.72
    },
    {
      id: 'rom-05', room: 'romantic', roomLabel: '浪漫主义厅 · ROMANTICISM', title: '墓园孤儿奶蛙',
      original: '欧仁·德拉克罗瓦《墓园孤儿》，约1824', image: 'assets/paintings/rom-orphan.webp',
      description: '墓碑、十字架与低矮暮色构成寂静背景。幼态奶蛙披着原作人物的白衣与棕色披巾，仰望画外，保留了肖像中未被回答的紧张。',
      side: 'left', z: -6.1, height: 2.2
    },
    {
      id: 'war-01', room: 'war', roomLabel: '战争名作厅 · WAR & MEMORY', title: '荷拉斯兄弟之誓奶蛙',
      original: '雅克-路易·大卫《荷拉斯兄弟之誓》，1784', image: 'assets/paintings/war-horatii.webp',
      description: '三重拱券、伸展的手臂与高举的剑维持新古典主义的严整秩序。四个奶蛙角色取代父亲和兄弟，将誓言、纪律与牺牲重新置于凝视之下。',
      side: 'right', z: -7.0, height: 1.8
    },
    {
      id: 'war-02', room: 'war', roomLabel: '战争名作厅 · WAR & MEMORY', title: '吹笛少年奶蛙',
      original: '爱德华·马奈《吹笛少年》，1866', image: 'assets/paintings/war-fifer.webp',
      description: '单一人物、灰色平面背景与制服的黑红色块被完整保留。幼态奶蛙举起短笛，以马奈近乎无纵深的现代绘画方式站立。',
      side: 'left', z: -11.0, height: 2.25
    },
    {
      id: 'war-03', room: 'war', roomLabel: '战争名作厅 · WAR & MEMORY', title: '前线的俘虏奶蛙',
      original: '温斯洛·霍默《前线的俘虏》，1866', image: 'assets/paintings/war-prisoners.webp',
      description: '军官与俘虏在烧焦树桩和烟雾天际之间对峙。两名成熟态奶蛙进入各自阵营，克制的户外光线让权力关系比戏剧动作更突出。',
      side: 'right', z: -11.7, height: 1.68
    },
    {
      id: 'war-04', room: 'war', roomLabel: '战争名作厅 · WAR & MEMORY', title: '巴拉克拉瓦奶蛙',
      original: '伊丽莎白·汤普森《巴拉克拉瓦》，1876', image: 'assets/paintings/war-balaclava.webp',
      description: '散兵线、牵马队列与倒地人马在阴郁灰调中向远方延伸。前景奶蛙保留沉重军装与缰绳，光滑面部与泥泞战场形成冷静反差。',
      side: 'left', z: -15.7, height: 1.52
    },
    {
      id: 'war-05', room: 'war', roomLabel: '战争名作厅 · WAR & MEMORY', title: '罗利的童年奶蛙',
      original: '约翰·埃弗里特·米莱《罗利的童年》，1870', image: 'assets/paintings/war-raleigh.webp',
      description: '老水手指向海面，两个幼态奶蛙坐在岸边倾听远方故事。玩具船、羽饰帽与远处帆影，把战争主题推回到冒险想象形成之前。',
      side: 'right', z: -16.5, height: 1.72
    },
    { id: 'west-06', room: 'west', era: '印象派', title: '睡莲中的奶蛙', original: '克劳德·莫奈《睡莲》，1916', image: 'assets/paintings/add-water-lilies.webp', description: '莫奈晚年的水面取消地平线，让花、云与倒影汇入光色流动。奶蛙被置入这片没有明确边界的池塘。', height: 1.82 },
    { id: 'west-07', room: 'west', era: '浮世绘', title: '神奈川冲浪奶蛙', original: '葛饰北斋《神奈川冲浪里》，约1831', image: 'assets/paintings/add-great-wave.webp', description: '巨浪、船只与远方富士山维持原作的三层尺度，奶蛙进入普鲁士蓝构成的浪涛秩序。', height: 1.72 },
    { id: 'west-08', room: 'west', era: '后印象派', title: '星月奶蛙夜', original: '文森特·梵高《星月夜》，1889', image: 'assets/paintings/add-starry-night.webp', description: '旋涡星空、柏树与沉睡村庄保留梵高的夜间节奏，奶蛙成为湍动天空下的安静尺度。', height: 1.7 },
    { id: 'west-09', room: 'west', era: '文艺复兴', title: '最后的晚餐奶蛙', original: '列奥纳多·达·芬奇《最后的晚餐》，1495—1498', image: 'assets/paintings/add-last-supper.webp', description: '长桌、中央透视与门徒群组仍围绕那句预言展开，奶蛙进入文艺复兴最著名的叙事瞬间。', height: 1.62 },
    { id: 'west-10', room: 'west', era: '现实主义', title: '拾穗者奶蛙', original: '让-弗朗索瓦·米勒《拾穗者》，1857', image: 'assets/paintings/add-gleaners.webp', description: '弯腰劳动的身体与远处丰收形成社会尺度的对照，奶蛙保留原作沉稳、低伏的动作关系。', height: 1.82 },
    { id: 'west-11', room: 'west', era: '浪漫主义', title: '梅杜萨之筏奶蛙', original: '泰奥多尔·籍里柯《梅杜萨之筏》，1819', image: 'assets/paintings/add-medusa.webp', description: '木筏上的绝望与远方求救姿态沿对角线攀升，奶蛙被置入浪漫主义最激烈的海难叙事。', height: 1.75 },
    { id: 'west-12', room: 'west', era: '前拉斐尔派', title: '奥菲莉亚奶蛙', original: '约翰·埃弗里特·米莱《奥菲莉亚》，1851—1852', image: 'assets/paintings/add-ophelia.webp', description: '可辨认的花草、水面与静止身体共同承载文学叙事，奶蛙在繁茂自然中保持原作的悬浮姿态。', height: 1.82 },
    { id: 'west-13', room: 'west', era: '巴洛克', title: '浪子回头奶蛙', original: '伦勃朗《浪子回头》，约1669', image: 'assets/paintings/add-prodigal.webp', description: '暗背景中的手、低垂身体与暖色光线集中成宽恕的触觉，奶蛙被纳入伦勃朗晚年的沉默。', height: 1.82 },
    { id: 'china-05', room: 'qin', era: '史前与先秦', title: '新石器彩陶纹样奶蛙', original: '原型：新石器时代彩陶', image: 'assets/paintings/add-pottery.webp', description: '圆腹器形、矿物颜料与重复几何纹样构成早期器物图像，奶蛙被压缩为器壁上的平面身份。', height: 1.85 },
    { id: 'china-06', room: 'qin', era: '史前与先秦', title: '四羊方尊奶蛙', original: '原型：商代四羊方尊', image: 'assets/paintings/add-fangzun.webp', description: '高颈、方体、圈足和繁密雷纹得到保留，转角羊首被改铸为奶蛙首，礼器威严与角色身份并置。', height: 1.78 },
    { id: 'china-07', room: 'qin', era: '秦汉', title: '秦始皇陵跪射俑奶蛙', original: '原型：秦始皇陵跪射俑', image: 'assets/paintings/add-archer.webp', description: '一膝着地、身体转向与持弓姿态构成沉着的战备动作，奶蛙头身被译入陶俑体量。', height: 2.05 },
    { id: 'china-08', room: 'qin', era: '秦汉', title: '长信宫灯奶蛙', original: '原型：西汉长信宫灯', image: 'assets/paintings/add-lamp.webp', description: '跪坐、托灯与长袖烟道结合为精密器物结构，奶蛙身份被铸入鎏金铜像。', height: 2.05 },
    { id: 'china-09', room: 'qin', era: '魏晋南北朝', title: '洛神赋图奶蛙', original: '原型：顾恺之传《洛神赋图》', image: 'assets/paintings/add-luoshen.webp', description: '水岸、流云、飘带与人物组成连续长卷叙事，奶蛙进入洛水相遇的视觉节奏。', height: 2.05 },
    { id: 'china-10', room: 'qin', era: '隋唐', title: '唐三彩骆驼载乐俑奶蛙', original: '原型：唐三彩骆驼载乐俑', image: 'assets/paintings/add-tang-camel.webp', description: '骆驼、鞍具、乐队与琥珀绿釉保留丝路器物的动势，中央乐师被改作奶蛙。', height: 2.05 },
    { id: 'west-14', room: 'west', era: '现代主义', title: '构成八号奶蛙', original: '原型：康定斯基《构成 VIII》，1923', image: 'assets/paintings/add-construct-composition-viii.webp', description: '圆、三角、网格和弧线像一段视觉乐谱，奶蛙被拆成嵌入抽象秩序的眼形圆环与色块。', height: 1.82 },
    { id: 'west-15', room: 'west', era: '印象派', title: '撑阳伞的奶蛙', original: '原型：莫奈《撑阳伞的女人》，1875', image: 'assets/paintings/add-monet-parasol-milk-frog.webp', description: '风掀动衣裙与面纱，草叶和云影保持快速笔触，奶蛙成为户外光线里短暂而明亮的身影。', height: 1.82 },
    { id: 'west-16', room: 'west', era: '表现主义', title: '呐喊的奶蛙', original: '原型：蒙克《呐喊》，1893', image: 'assets/paintings/add-munch-scream-milk-frog.webp', description: '扭曲的桥、血红天空和尖锐的面孔把现代焦虑推向画面中心，奶蛙成为这声尖叫的发出者。', height: 1.82 },
    { id: 'west-17', room: 'west', era: '后印象派', title: '星月夜的奶蛙', original: '原型：梵高《星月夜》，1889', image: 'assets/paintings/add-van-gogh-starry-night-milk-frog.webp', description: '旋涡星空与燃烧般的柏树保留夜间节奏，奶蛙沿着翻卷的笔触成为天空下的安静尺度。', height: 1.82 },
    { id: 'west-18', room: 'west', era: '古代希腊', title: '米洛斯的奶蛙', original: '原型：米洛斯的维纳斯，约公元前130年', image: 'assets/paintings/add-venus-de-milo-milk-frog.webp', description: '大理石的理想比例与缺失的双臂留下想象空间，奶蛙被转译成一尊站立的希腊化雕像。', height: 1.82 },
    { id: 'west-19', room: 'west', era: '现代主义', title: '三个音乐家奶蛙', original: '原型：毕加索《三个音乐家》，1921', image: 'assets/paintings/add-picasso-musicians-milk-frog.webp', description: '平面色块、乐器与人物彼此嵌套，奶蛙把合成立体主义的断裂空间变成一组舞台合奏。', height: 1.82 },
    { id: 'china-11', room: 'qin', era: '史前', title: '阿尔塔米拉的奶蛙', original: '原型：阿尔塔米拉洞窟壁画', image: 'assets/paintings/add-altamira-milk-frogs.webp', description: '赭红、炭黑和岩壁起伏保留史前洞窟的手感，奶蛙与野兽形体共同回到最早的图像现场。', height: 1.9 },
    { id: 'china-12', room: 'qin', era: '中世纪', title: '哥特奶蛙圣母院', original: '原型：巴黎圣母院，约1345年', image: 'assets/paintings/add-notre-dame-milk-frog.webp', description: '尖拱、飞扶壁与玫瑰窗构成垂直向上的建筑秩序，奶蛙成为哥特空间里的守望者。', height: 1.82 },
    { id: 'china-13', room: 'qin', era: '中世纪', title: '圣母子与奶蛙', original: '原型：契马布埃《宝座圣母像》，约1280年', image: 'assets/paintings/add-madonna-frog-child.webp', description: '金色背景、正面姿态与过渡时期的体积感并置，奶蛙进入中世纪圣像的庄严构图。', height: 1.9 },
    { id: 'china-14', room: 'qin', era: '隋唐', title: '洛神长卷奶蛙', original: '原型：顾恺之传《洛神赋图》', image: 'assets/paintings/add-luoshen.webp', description: '水岸、流云、飘带与人物形成连续长卷，奶蛙沿着洛水相遇的视觉节奏展开。', height: 1.9 },
    { id: 'china-15', room: 'qin', era: '先秦', title: '四羊方尊再铸奶蛙', original: '原型：商代四羊方尊', image: 'assets/paintings/add-fangzun.webp', description: '方体、圈足、羊首与雷纹维持礼器威严，奶蛙被想象成一次新的青铜铸造。', height: 1.78 },
    { id: 'china-16', room: 'qin', era: '秦汉', title: '跪射俑奶蛙', original: '原型：秦始皇陵跪射俑', image: 'assets/paintings/add-archer.webp', description: '一膝着地、身体转向与持弓姿态形成沉着的战备动作，奶蛙被压入陶俑体量。', height: 1.9 }
  ];

  // Normalized x/y rectangles enclosing the visible milk frogs in each painting.
  // They are intentionally generous enough for play, but exclude ordinary figures and scenery.
  const FROG_HIT_ZONES = {
    'qin-01': [{ x: .36, y: .34, w: .29, h: .38 }],
    'qin-02': [{ x: .43, y: .15, w: .25, h: .47 }],
    'qin-03': [{ x: .38, y: .24, w: .26, h: .43 }],
    'qin-04': [{ x: .36, y: .24, w: .27, h: .48 }],
    'rom-01': [{ x: .36, y: .22, w: .22, h: .39 }],
    'rom-02': [{ x: .39, y: .36, w: .24, h: .32 }],
    'rom-03': [{ x: .28, y: .18, w: .27, h: .34 }],
    'rom-04': [{ x: .56, y: .22, w: .28, h: .29 }],
    'rom-05': [{ x: .38, y: .25, w: .26, h: .4 }],
    'war-01': [
      { x: .08, y: .35, w: .18, h: .5 },
      { x: .2, y: .38, w: .17, h: .48 },
      { x: .31, y: .36, w: .16, h: .5 },
      { x: .51, y: .34, w: .2, h: .52 }
    ],
    'war-02': [{ x: .36, y: .16, w: .3, h: .62 }],
    'war-03': [{ x: .28, y: .22, w: .38, h: .48 }],
    'war-04': [{ x: .4, y: .23, w: .23, h: .48 }],
    'war-05': [{ x: .22, y: .35, w: .27, h: .38 }, { x: .43, y: .37, w: .26, h: .34 }],
    'west-06': [{ x: .38, y: .38, w: .25, h: .32 }],
    'west-07': [{ x: .37, y: .39, w: .25, h: .31 }],
    'west-08': [{ x: .36, y: .29, w: .29, h: .35 }],
    'west-09': [{ x: .39, y: .38, w: .24, h: .3 }],
    'west-10': [{ x: .37, y: .32, w: .28, h: .38 }],
    'west-11': [{ x: .39, y: .22, w: .25, h: .34 }],
    'west-12': [{ x: .34, y: .3, w: .3, h: .36 }],
    'west-13': [{ x: .55, y: .26, w: .28, h: .32 }],
    'china-05': [{ x: .34, y: .25, w: .32, h: .42 }],
    'china-06': [{ x: .34, y: .25, w: .32, h: .42 }],
    'china-07': [{ x: .36, y: .2, w: .3, h: .48 }],
    'china-08': [{ x: .37, y: .2, w: .29, h: .45 }],
    'china-09': [{ x: .38, y: .26, w: .27, h: .38 }],
    'china-10': [{ x: .37, y: .2, w: .29, h: .45 }],
    'west-14': [{ x: .38, y: .32, w: .3, h: .36 }], 'west-15': [{ x: .35, y: .27, w: .3, h: .42 }],
    'west-16': [{ x: .35, y: .23, w: .3, h: .45 }], 'west-17': [{ x: .34, y: .26, w: .32, h: .4 }],
    'west-18': [{ x: .36, y: .18, w: .3, h: .52 }], 'west-19': [{ x: .35, y: .25, w: .32, h: .45 }],
    'china-11': [{ x: .36, y: .28, w: .3, h: .42 }], 'china-12': [{ x: .36, y: .25, w: .3, h: .45 }],
    'china-13': [{ x: .35, y: .25, w: .3, h: .45 }], 'china-14': [{ x: .36, y: .25, w: .3, h: .45 }],
    'china-15': [{ x: .36, y: .25, w: .3, h: .45 }], 'china-16': [{ x: .36, y: .22, w: .3, h: .48 }]
  };

  const FLOOR_INFO = {
    west: { level: '1F', zh: '西方博物馆', en: 'WESTERN MUSEUM', baseY: 0, count: 24 },
    china: { level: '2F', zh: '中国博物馆', en: 'CHINA MUSEUM', baseY: 14, count: 16 }
  };

  const state = {
    started: false,
    mobile: matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window,
    yaw: 0,
    pitch: 0,
    keys: {},
    velocity: new THREE.Vector3(),
    moveStick: { x: 0, y: 0 },
    lookPointer: null,
    lookLast: { x: 0, y: 0 },
    lookMoved: 0,
    desktopLook: null,
    hoveredArt: null,
    currentFloor: 'west',
    panelOpen: false,
    eggBarrage: null,
    lastEggColor: -1,
    muted: true
  };

  const canvas = document.getElementById('scene');
  const loading = document.getElementById('loading');
  const loadingBar = document.getElementById('loadingBar');
  const loadingValue = document.getElementById('loadingValue');
  const entry = document.getElementById('entry');
  const header = document.getElementById('museumHeader');
  const reticle = document.getElementById('reticle');
  const inspectPrompt = document.getElementById('inspectPrompt');
  const roomCaption = document.getElementById('roomCaption');
  const artPanel = document.getElementById('artPanel');
  const mapPanel = document.getElementById('mapPanel');
  const scrim = document.getElementById('scrim');
  const audio = document.getElementById('ambientAudio');
  const frogLaughAudio = document.getElementById('frogLaughAudio');
  const soundButton = document.getElementById('soundButton');
  const clearPaintButton = document.getElementById('clearPaintButton');
  const mobileControls = document.getElementById('mobileControls');
  const mobileInspect = document.getElementById('mobileInspect');
  const mobileThrow = document.getElementById('mobileThrow');
  const floorSwitcher = document.getElementById('floorSwitcher');
  const discoveryNote = document.getElementById('discoveryNote');
  const discoveryText = document.getElementById('discoveryText');
  const discoveryCount = document.getElementById('discoveryCount');

  let renderer;
  let scene;
  let camera;
  let clock;
  let raycaster;
  let artMeshes = [];
  let sculpture;
  const hiddenFrogs = [];
  const roamingAgents = [];
  const EGG_COLORS = ['#ef3158', '#ffb21c', '#22c98a', '#2f8cff', '#a855f7', '#ff5bbd', '#44d7e8'];
  const eggs = [];
  const fragments = [];
  const impactSurfaces = [];
  const paintSplats = [];
  const splatMaterials = new Map();
  const eggGeometry = new THREE.SphereGeometry(1, 20, 14);
  const fragmentGeometry = new THREE.TetrahedronGeometry(.055, 0);
  const splatGeometry = new THREE.PlaneGeometry(1, 1);

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    document.getElementById('errorMessage').hidden = false;
    document.getElementById('errorMessage').style.display = 'grid';
    loading.classList.add('hidden');
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, state.mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !state.mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171815);
  scene.fog = new THREE.FogExp2(0x171815, 0.012);
  camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.08, 80);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.65, 34.5);
  scene.add(camera);
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  raycaster.far = 4.6;

  buildMuseum();
  bindEvents();
  updateFloorUI('west');
  animate();

  function material(color, roughness = .8, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function box(name, size, position, mat, cast = false, receive = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    return mesh;
  }

  function buildMuseum() {
    const ambient = new THREE.HemisphereLight(0xf2eee2, 0x343630, 2.15);
    scene.add(ambient);
    buildFloor('west');
    buildFloor('china');
    createEntranceSculpture();
    createHiddenFrogs();
    createRoamingAgents();
    canvas.dataset.sculptureCount = '4';
    canvas.dataset.hiddenFrogCount = String(hiddenFrogs.length);
    canvas.dataset.roamingAgentCount = String(roamingAgents.length);

    const manager = new THREE.LoadingManager();
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      loadingBar.style.width = '100%';
      loadingValue.textContent = '100%';
      setTimeout(() => loading.classList.add('hidden'), 320);
    };
    manager.onProgress = (_, loaded, total) => {
      const progress = Math.round((loaded / total) * 100);
      loadingBar.style.width = `${progress}%`;
      loadingValue.textContent = `${progress}%`;
    };
    manager.onLoad = reveal;
    manager.onError = (url) => console.warn('Texture failed:', url);
    const loader = new THREE.TextureLoader(manager);
    ARTWORKS.forEach((art, index) => createArtwork(art, index, loader));
    setTimeout(reveal, 12000);
  }

  function buildFloor(floorId) {
    const info = FLOOR_INFO[floorId];
    const y = info.baseY;
    const isChina = floorId === 'china';
    const wallMat = material(isChina ? 0xd5d0c3 : 0xd9d7cf, .93);
    const trimMat = material(isChina ? 0x9a825c : 0x8b7550, .55, .28);
    const endMat = material(isChina ? 0x3c332a : 0x282925, .94);
    const floorMat = material(isChina ? 0x40382f : 0x33342f, .7, .03);
    const ceilingMat = material(0x20211e, .96);
    const brassMat = material(0x9d844f, .45, .58);

    const surfaces = [
      box(`${floorId}-floor`, [18, .18, 104], [0, y - .09, 0], floorMat),
      box(`${floorId}-ceiling`, [18, .2, 104], [0, y + 5.1, 0], ceilingMat),
      box(`${floorId}-left-wall`, [.22, 5.1, 104], [-9, y + 2.55, 0], wallMat),
      box(`${floorId}-right-wall`, [.22, 5.1, 104], [9, y + 2.55, 0], wallMat),
      box(`${floorId}-end-wall`, [18, 5.1, .22], [0, y + 2.55, -52], endMat),
      box(`${floorId}-entry-wall`, [18, 5.1, .22], [0, y + 2.55, 52], wallMat)
    ];
    surfaces.forEach((surface) => {
      surface.userData.impactSurface = true;
      surface.userData.floorId = floorId;
      impactSurfaces.push(surface);
    });

    box(`${floorId}-baseboard-left`, [.32, .34, 104], [-8.82, y + .18, 0], trimMat);
    box(`${floorId}-baseboard-right`, [.32, .34, 104], [8.82, y + .18, 0], trimMat);
    box(`${floorId}-cornice-left`, [.38, .28, 104], [-8.78, y + 4.82, 0], trimMat);
    box(`${floorId}-cornice-right`, [.38, .28, 104], [8.78, y + 4.82, 0], trimMat);
    for (let z = 46; z >= -46; z -= 8.5) {
      box(`${floorId}-beam`, [16.4, .07, .05], [0, y + 4.82, z], brassMat, false, false);
      const light = new THREE.PointLight(isChina ? 0xffdfb8 : 0xffebd1, 19, 12, 2);
      light.position.set((Math.round(z) % 2 ? -1 : 1) * 2.6, y + 4.52, z);
      scene.add(light);
    }

    [-25, -8, 9, 26].forEach((z) => createBench(0, z, y));
    [-29, -12, 5, 22].forEach((z) => createClassicWallPanel(-8.72, y, z, 1));
    [-26, -9, 8, 25].forEach((z) => createClassicWallPanel(8.72, y, z, -1));
    createRunnerRug(y);
    createPilasters(y, trimMat);
    if (isChina) {
      createSculptureHall(y);
      createSculptureCollection(y);
    }
    createWallText(info.zh, `${info.level} · ${info.en} · ${info.count} WORKS`, [0, y + 3.15, -51.82], 0, 6.4, 1.25, true);
  }

  function createPortal(z, wallMat, number, label) {
    box('portal-left', [3, 5, .24], [-4.5, 2.5, z], wallMat);
    box('portal-right', [3, 5, .24], [4.5, 2.5, z], wallMat);
    box('portal-top', [6, 1.05, .24], [0, 4.48, z], wallMat);
    createWallText(number, label, [0, 4.06, z + .14], 0, 2.8, .48, false);
  }

  function createWallText(title, subtitle, position, rotationY, width, height, invert) {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1200;
    textureCanvas.height = 300;
    const context = textureCanvas.getContext('2d');
    context.clearRect(0, 0, 1200, 300);
    context.textAlign = 'center';
    context.fillStyle = invert ? '#eee9dc' : '#24251f';
    context.font = '500 76px serif';
    context.fillText(title, 600, 118);
    context.fillStyle = invert ? '#b6ad99' : '#8d794f';
    context.font = '500 24px sans-serif';
    context.fillText(subtitle, 600, 184);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
    plane.position.set(...position);
    plane.rotation.y = rotationY;
    scene.add(plane);
  }

  function createArtwork(art, index, loader) {
    const isChina = art.room === 'qin';
    const floorId = isChina ? 'china' : 'west';
    const floorArts = ARTWORKS.filter((item) => (item.room === 'qin') === isChina);
    const floorIndex = floorArts.indexOf(art);
    const side = floorIndex % 2 === 0 ? 'left' : 'right';
    const slot = Math.floor(floorIndex / 2);
    const slotCount = Math.ceil(floorArts.length / 2);
    const z = 34 - slot * (68 / Math.max(1, slotCount - 1));
    const baseY = FLOOR_INFO[floorId].baseY;
    const x = side === 'left' ? -8.82 : 8.82;
    const rotationY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    art.floorId = floorId;
    art.side = side;
    art.z = z;
    const texture = loader.load(art.image, (loaded) => {
      const aspect = loaded.image.width / loaded.image.height;
      const width = art.height * aspect;
      painting.scale.x = width;
      frame.scale.x = width + .16;
      backing.scale.x = width + .28;
      art.previewSrc = loaded.image.currentSrc || loaded.image.src;
      painting.userData.art.previewSrc = art.previewSrc;
      painting.userData.art.imageElement = loaded.image;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const group = new THREE.Group();
    group.position.set(x, baseY + 2.4, z);
    group.rotation.y = rotationY;
    scene.add(group);

    const backing = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material(0x161712, .52, .18));
    backing.scale.set(art.height * 1.35 + .28, art.height + .28, .10);
    backing.position.z = -.065;
    backing.castShadow = true;
    group.add(backing);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material(0xa99058, .38, .66));
    frame.scale.set(art.height * 1.35 + .16, art.height + .16, .075);
    frame.position.z = -.005;
    frame.castShadow = true;
    group.add(frame);

    const painting = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: true })
    );
    painting.scale.set(art.height * 1.35, art.height, 1);
    painting.position.z = .04;
    painting.userData.art = { ...art, number: String(index + 1).padStart(2, '0'), mesh: painting };
    group.add(painting);
    artMeshes.push(painting);

    const label = new THREE.Mesh(new THREE.PlaneGeometry(.44, .19), material(0xebe8df, .94));
    label.position.set(0, -(art.height / 2 + .22), .042);
    group.add(label);

  }

  function glassMaterial() {
    return new THREE.MeshPhysicalMaterial({ color: 0xbad2d0, roughness: .08, metalness: .08, transmission: .32, transparent: true, opacity: .18, thickness: .04, side: THREE.DoubleSide, depthWrite: false });
  }

  function createSculptureHall(baseY) {
    const glass = glassMaterial();
    const trim = material(0x9a825c, .45, .38);
    const y = baseY;
    const wallHeight = 3.6;
    // Glass vestibule at the deep end of 2F. The center remains open as a walking aisle.
    box('sculpture-hall-left-glass', [.08, wallHeight, 14], [-7.0, y + wallHeight / 2, -43], glass, false, false);
    box('sculpture-hall-right-glass', [.08, wallHeight, 14], [7.0, y + wallHeight / 2, -43], glass, false, false);
    box('sculpture-hall-back-glass', [14, wallHeight, .08], [0, y + wallHeight / 2, -50], glass, false, false);
    box('sculpture-hall-header', [14, .18, .18], [0, y + 3.55, -36], trim, false, false);
    createWallText('雕塑馆', 'SCULPTURE GALLERY · 4 OBJECTS', [0, y + 3.05, -35.9], 0, 4.6, .8, true);
  }

  function sculpturePedestal(baseY, x, z, label) {
    const stone = material(0xb9aa8b, .72, .08);
    const dark = material(0x30251d, .64, .12);
    const group = new THREE.Group();
    group.position.set(x, baseY, z);
    group.userData.displayLabel = label;
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.85, .18, 1.5), stone);
    step.position.y = .09;
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.45, .72, 1.1), dark);
    plinth.position.y = .54;
    plinth.castShadow = true;
    group.add(plinth);
    const glass = glassMaterial();
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.25, 2.55, 1.9), glass);
    top.position.y = 1.8;
    top.userData.impactSurface = true;
    top.userData.floorId = 'china';
    impactSurfaces.push(top);
    group.add(top);
    const metal = material(0x796f5a, .38, .48);
    [[-1.12, 1.8, -0.95], [1.12, 1.8, -0.95], [-1.12, 1.8, .95], [1.12, 1.8, .95]].forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 2.55, 8), metal);
      post.position.set(px, py, pz);
      group.add(post);
    });
    scene.add(group);
    return group;
  }

  function makeBronzeHorse() {
    const group = new THREE.Group();
    const bronze = material(0x7f6843, .34, .72);
    const dark = material(0x463b2d, .42, .6);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.31, .9, 8, 18), bronze);
    body.rotation.z = Math.PI / 2;
    body.position.y = .98;
    group.add(body);
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .52, 8, 14), bronze);
    neck.position.set(.38, 1.28, 0); neck.rotation.z = -.62; group.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), bronze);
    head.scale.set(1.2, .72, .7); head.position.set(.62, 1.57, 0); group.add(head);
    [-.28, .08, .38, .7].forEach((z, index) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, .62, 12), dark);
      leg.position.set(index % 2 ? .26 : -.28, .48 + (index % 2) * .08, z - .38);
      leg.rotation.z = (index % 2 ? -.1 : .1); group.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.1, .55, 12), dark);
    tail.position.set(-.55, 1.05, 0); tail.rotation.z = -1.4; group.add(tail);
    group.scale.setScalar(.92);
    return group;
  }

  function makeFangzun() {
    const group = new THREE.Group();
    const bronze = material(0x6c684d, .4, .62);
    const patina = material(0x839078, .52, .28);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, .25, .82), bronze); base.position.y = .84; group.add(base);
    const body = new THREE.Mesh(new THREE.BoxGeometry(.72, .85, .62), bronze); body.position.y = 1.35; group.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.38, .52, .55, 4), patina); neck.position.y = 2.03; group.add(neck);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(.72, .14, .68), bronze); rim.position.y = 2.34; group.add(rim);
    [-1, 1].forEach((side) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(.12, .38, 8), patina);
      horn.position.set(side * .43, 1.8, .12); horn.rotation.z = side * .8; group.add(horn);
    });
    return group;
  }

  function makePalaceLamp() {
    const group = new THREE.Group();
    const gold = material(0xb18b45, .32, .76);
    const dark = material(0x55432a, .5, .42);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .55, 8, 16), gold); body.position.y = 1.18; group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), gold); head.scale.y = 1.15; head.position.y = 1.68; group.add(head);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.08, .52, 6, 12), gold); arm.position.set(.25, 1.45, .02); arm.rotation.z = -.9; group.add(arm);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, .24, 16), dark); lamp.position.set(.48, 1.67, .02); group.add(lamp);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(.34, .32, 16), gold); shade.position.set(.48, 1.94, .02); group.add(shade);
    return group;
  }

  function makeKneelingArcher() {
    const group = new THREE.Group();
    const terracotta = material(0x9a7758, .88);
    const dark = material(0x4c3d31, .82);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .48, 8, 16), terracotta); body.position.set(0, 1.12, 0); body.rotation.z = -.1; group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), terracotta); head.position.set(.02, 1.62, 0); group.add(head);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.18, .48, 8, 12), terracotta); thigh.position.set(-.24, .72, 0); thigh.rotation.z = Math.PI / 2; group.add(thigh);
    const knee = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), terracotta); knee.position.set(.14, .42, 0); group.add(knee);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(.42, .035, 8, 24, Math.PI), dark); bow.position.set(.4, 1.2, .1); bow.rotation.z = Math.PI / 2; group.add(bow);
    const string = new THREE.Mesh(new THREE.BoxGeometry(.02, .8, .02), dark); string.position.set(.4, 1.2, .1); group.add(string);
    return group;
  }

  function createSculptureCollection(baseY) {
    const displays = [
      { x: -3.7, z: -40.5, label: '铜奔马奶蛙', make: makeBronzeHorse },
      { x: 3.7, z: -40.5, label: '四羊方尊奶蛙', make: makeFangzun },
      { x: -3.7, z: -47.0, label: '长信宫灯奶蛙', make: makePalaceLamp },
      { x: 3.7, z: -47.0, label: '跪射俑奶蛙', make: makeKneelingArcher }
    ];
    displays.forEach((item) => {
      const pedestal = sculpturePedestal(baseY, item.x, item.z, item.label);
      const model = item.make();
      model.position.y = .78;
      pedestal.add(model);
    });
  }

  function createClassicWallPanel(x, baseY, z, side) {
    const panel = material(0x29251f, .82);
    const trim = material(0xa78c5c, .5, .3);
    const offset = side * .045;
    box('wall-panel', [.045, .72, 3.7], [x + offset, baseY + .72, z], panel, false, true);
    box('wall-panel-top', [.09, .09, 3.95], [x + side * .08, baseY + 1.1, z], trim, false, false);
    box('wall-panel-bottom', [.09, .09, 3.95], [x + side * .08, baseY + .34, z], trim, false, false);
    box('wall-panel-front', [.09, .82, .09], [x + side * .08, baseY + .72, z - 1.91], trim, false, false);
    box('wall-panel-back', [.09, .82, .09], [x + side * .08, baseY + .72, z + 1.91], trim, false, false);
  }

  function createPilasters(baseY, trimMat) {
    [-46, 46].forEach((z) => {
      [-1, 1].forEach((side) => {
        const x = side * 8.7;
        box('pilaster-shaft', [.28, 4.25, .42], [x, baseY + 2.35, z], trimMat, false, false);
        box('pilaster-capital', [.5, .18, .72], [x, baseY + 4.48, z], trimMat, false, false);
        box('pilaster-base', [.46, .18, .65], [x, baseY + .25, z], trimMat, false, false);
      });
    });
  }

  function createRunnerRug(baseY) {
    const rug = material(0x3b1f25, .92);
    box('gallery-runner-rug', [4.4, .028, 96], [0, baseY + .025, 0], rug, false, true);
    const border = material(0xa78c5c, .58, .2);
    box('gallery-runner-border-left', [.06, .04, 96], [-2.08, baseY + .055, 0], border, false, false);
    box('gallery-runner-border-right', [.06, .04, 96], [2.08, baseY + .055, 0], border, false, false);
  }

  function createVisitorModel(color, accent) {
    const visitor = new THREE.Group();
    const coat = material(color, .84);
    const skin = material(0xc7956e, .9);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.19, 14, 10), skin);
    head.position.y = 1.55;
    visitor.add(head);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .46, 6, 12), coat);
    torso.position.y = 1.02;
    visitor.add(torso);
    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .38, 5, 8), coat);
      arm.position.set(side * .27, 1.08, 0);
      arm.rotation.z = side * -.18;
      visitor.add(arm);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .42, 5, 8), accent);
      leg.position.set(side * .12, .54, 0);
      visitor.add(leg);
    });
    visitor.traverse((part) => { part.castShadow = true; });
    return visitor;
  }

  function createRoamingFrogModel() {
    const frog = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ map: createSculptureTexture(), roughness: .72 });
    const body = new THREE.Mesh(createPearGeometry(), skin);
    body.scale.set(.34, .42, .28);
    body.position.y = .48;
    frog.add(body);
    const eyeMat = material(0x20241d, .42);
    [-.14, .14].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), eyeMat);
      eye.position.set(x, .78, .2);
      frog.add(eye);
    });
    frog.traverse((part) => { part.castShadow = true; });
    return frog;
  }

  function createRoamingAgent(floorId, kind, route, color, name) {
    const agent = kind === 'visitor' ? createVisitorModel(color, 0x30251d) : createRoamingFrogModel();
    agent.position.set(route[0][0], FLOOR_INFO[floorId].baseY, route[0][1]);
    agent.userData.roaming = { floorId, kind, route, target: 1, wait: kind === 'visitor' ? 1.2 : .5, name, phase: Math.random() * Math.PI * 2, mode: 'walk', fleeUntil: 0, fleeFrom: null };
    agent.traverse((part) => {
      part.userData.roamingAgent = agent;
      part.userData.floorId = floorId;
    });
    scene.add(agent);
    roamingAgents.push(agent);
  }

  function createRoamingAgents() {
    createRoamingAgent('west', 'visitor', [[-3.8, 28], [-3.8, 11], [-3.8, -8], [-3.8, -27]], 0x596a7a, '蓝衣观众');
    createRoamingAgent('west', 'visitor', [[3.8, 21], [3.8, 3], [3.8, -15], [3.8, -33]], 0x7d5546, '棕衣观众');
    createRoamingAgent('west', 'visitor', [[-3.5, 16], [-3.5, -3], [-3.5, -22], [-3.5, 30]], 0x6a7550, '绿衣观众');
    createRoamingAgent('west', 'frog', [[-1.6, 24], [1.6, 15], [-1.6, 4], [1.6, -16]], null, '漫游奶蛙');
    createRoamingAgent('west', 'frog', [[1.7, 8], [-1.7, -10], [1.7, -28], [-1.7, 23]], null, '漫游奶蛙');
    createRoamingAgent('china', 'visitor', [[-3.8, 28], [-3.8, 8], [-3.8, -15], [-3.8, -37]], 0x4f6370, '蓝衣观众');
    createRoamingAgent('china', 'visitor', [[3.8, 22], [3.8, 2], [3.8, -18], [3.8, -39]], 0x775447, '棕衣观众');
    createRoamingAgent('china', 'visitor', [[-3.4, 17], [-3.4, -5], [-3.4, -27], [-3.4, 31]], 0x6d7654, '绿衣观众');
    createRoamingAgent('china', 'frog', [[-1.7, 24], [1.7, 13], [-1.7, -13], [1.7, -35]], null, '漫游奶蛙');
    createRoamingAgent('china', 'frog', [[1.7, 5], [-1.7, -20], [1.7, -42], [-1.7, 18]], null, '漫游奶蛙');
  }

  function scareRoamingAgent(agent, point) {
    const data = agent.userData.roaming;
    if (!data || data.kind !== 'frog') return;
    data.mode = 'flee';
    data.fleeUntil = performance.now() + 2200;
    data.fleeFrom = point.clone();
  }

  function updateRoamingAgents(delta) {
    if (!state.started || state.panelOpen) return;
    roamingAgents.forEach((agent) => {
      const data = agent.userData.roaming;
      if (data.floorId !== state.currentFloor) { agent.visible = false; return; }
      agent.visible = true;
      if (data.kind === 'frog' && data.mode !== 'flee' && camera.position.distanceTo(agent.position) < 1.25) {
        data.mode = 'flee';
        data.fleeUntil = performance.now() + 1600;
        data.fleeFrom = camera.position.clone();
      }
      if (data.mode === 'flee') {
        const source = data.fleeFrom || camera.position;
        const dx = agent.position.x - source.x;
        const dz = agent.position.z - source.z;
        const distance = Math.hypot(dx, dz) || 1;
        agent.position.x += dx / distance * (data.kind === 'frog' ? 1.5 : .8) * delta;
        agent.position.z += dz / distance * (data.kind === 'frog' ? 1.5 : .8) * delta;
        agent.rotation.y = Math.atan2(dx, dz);
        if (performance.now() > data.fleeUntil) { data.mode = 'walk'; data.wait = .5; data.fleeFrom = null; }
        return;
      }
      data.wait -= delta;
      if (data.wait > 0) {
        if (data.kind === 'visitor') {
          data.mode = 'watch';
          const wallDirection = agent.position.x < 0 ? -Math.PI / 2 : Math.PI / 2;
          agent.rotation.y = THREE.MathUtils.lerp(agent.rotation.y, wallDirection, Math.min(1, delta * 3));
          const companion = roamingAgents.find((other) => other !== agent && other.visible && other.userData.roaming.kind === 'visitor' && other.userData.roaming.floorId === state.currentFloor && agent.position.distanceTo(other.position) < 1.2);
          if (companion) {
            data.mode = 'talk';
            agent.rotation.y = Math.atan2(companion.position.x - agent.position.x, companion.position.z - agent.position.z);
          }
        }
        return;
      }
      data.mode = 'walk';
      const target = data.route[data.target];
      const dx = target[0] - agent.position.x;
      const dz = target[1] - agent.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < .18) {
        data.target = (data.target + 1) % data.route.length;
        data.wait = data.kind === 'visitor' ? 1.5 + Math.random() * 2.5 : .7 + Math.random() * 1.4;
        return;
      }
      let steerX = dx / Math.max(distance, .001);
      let steerZ = dz / Math.max(distance, .001);
      roamingAgents.forEach((other) => {
        if (other === agent || !other.visible || other.userData.roaming.floorId !== state.currentFloor) return;
        const ox = agent.position.x - other.position.x;
        const oz = agent.position.z - other.position.z;
        const separation = Math.hypot(ox, oz);
        if (separation > 0 && separation < .85) {
          steerX += ox / separation * (.85 - separation) * 1.8;
          steerZ += oz / separation * (.85 - separation) * 1.8;
        }
      });
      const steerLength = Math.hypot(steerX, steerZ) || 1;
      const speed = data.kind === 'visitor' ? .72 : .92;
      agent.position.x += steerX / steerLength * speed * delta;
      agent.position.z += steerZ / steerLength * speed * delta;
      agent.rotation.y = Math.atan2(steerX, steerZ);
      if (data.kind === 'visitor') {
        const stride = data.mode === 'walk' ? Math.sin(clock.elapsedTime * 8 + data.phase) * .04 : 0;
        agent.children.forEach((part, index) => { if (index === 2 || index === 3) part.rotation.z = stride * (index === 2 ? 1 : -1); });
      } else agent.position.y = Math.abs(Math.sin(clock.elapsedTime * 4 + data.phase)) * .035;
    });
  }

  function createHiddenFrog(floorId, x, y, z, label) {
    const frog = new THREE.Group();
    frog.position.set(x, y, z);
    frog.scale.setScalar(.16);
    const skin = new THREE.MeshStandardMaterial({ map: createSculptureTexture(), roughness: .72 });
    const body = new THREE.Mesh(createPearGeometry(), skin);
    body.scale.set(.72, .82, .58);
    body.castShadow = true;
    frog.add(body);
    const eyeMat = material(0x20241d, .42);
    [-.31, .31].forEach((eyeX) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 10), eyeMat);
      eye.position.set(eyeX, .52, .42);
      frog.add(eye);
    });
    frog.userData.hiddenFrog = { floorId, found: false, label };
    scene.add(frog);
    hiddenFrogs.push(frog);
  }

  function createHiddenFrogs() {
    createHiddenFrog('west', -.32, .08, 26.15, '一楼长椅下');
    createHiddenFrog('west', .58, .1, 8.15, '一楼壁柱旁');
    createHiddenFrog('west', -.36, .08, -8.85, '一楼长椅后');
    createHiddenFrog('west', .45, .1, -25.6, '一楼尽端角落');
    createHiddenFrog('china', -.32, 14.08, 26.15, '二楼长椅下');
    createHiddenFrog('china', .58, 14.1, 8.15, '二楼壁柱旁');
    createHiddenFrog('china', -.36, 14.08, -8.85, '二楼长椅后');
    createHiddenFrog('china', .45, 14.1, -25.6, '二楼尽端角落');
  }

  function updateHiddenFrogs() {
    if (!state.started || state.panelOpen) return;
    hiddenFrogs.forEach((frog) => {
      const hidden = frog.userData.hiddenFrog;
      if (hidden.found || hidden.floorId !== state.currentFloor) return;
      if (camera.position.distanceTo(frog.position) < 2.15) {
        hidden.found = true;
        const foundCount = hiddenFrogs.filter((item) => item.userData.hiddenFrog.found).length;
        discoveryText.textContent = `发现隐藏奶蛙 · ${hidden.label}`;
        discoveryCount.textContent = `${foundCount} / ${hiddenFrogs.length}`;
        discoveryNote.classList.add('visible');
        clearTimeout(updateHiddenFrogs.timer);
        updateHiddenFrogs.timer = setTimeout(() => discoveryNote.classList.remove('visible'), 2600);
      }
    });
  }

  function createBench(x, z, baseY = 0) {
    const wood = material(0x66503d, .62);
    const metal = material(0x34342f, .35, .72);
    box('bench-seat', [3.2, .12, .68], [x, baseY + .56, z], wood, true);
    box('bench-leg', [.09, .52, .48], [x - 1.15, baseY + .27, z], metal, true);
    box('bench-leg', [.09, .52, .48], [x + 1.15, baseY + .27, z], metal, true);
  }

  function createSculptureTexture() {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    const context = textureCanvas.getContext('2d');
    context.fillStyle = '#d7ad39';
    context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

    // The front of SphereGeometry's UV map is centered around x=256.
    const center = 256;
    context.fillStyle = '#eee4c5';
    context.beginPath();
    context.ellipse(center, 382, 94, 108, 0, 0, Math.PI * 2);
    context.fill();

    [center - 58, center + 58].forEach((x) => {
      context.strokeStyle = '#99ad72';
      context.lineWidth = 13;
      context.beginPath();
      context.arc(x, 183, 31, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = '#24231f';
      context.beginPath();
      context.arc(x, 183, 15, 0, Math.PI * 2);
      context.fill();
    });

    context.strokeStyle = '#2a2821';
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(center - 12, 245);
    context.lineTo(center + 12, 245);
    context.stroke();

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function createPearGeometry() {
    const geometry = new THREE.SphereGeometry(1, 56, 40);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const lowerWeight = (1 - y) * .5;
      const width = .88 + lowerWeight * .18;
      position.setX(i, position.getX(i) * width);
      position.setZ(i, position.getZ(i) * (.96 + lowerWeight * .04));
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  function createEntranceSculpture() {
    sculpture = new THREE.Group();
    sculpture.position.set(0, 1.2, 12.9);
    const yellow = new THREE.MeshStandardMaterial({ map: createSculptureTexture(), roughness: .62, metalness: 0 });
    const limbMaterial = material(0xd7ad39, .62);

    const body = new THREE.Mesh(createPearGeometry(), yellow);
    body.scale.set(.94, 1.14, .72);
    body.position.y = .04;
    body.castShadow = true;
    sculpture.add(body);

    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .62, 8, 20), limbMaterial);
      arm.position.set(side * .91, -.28, .02);
      arm.rotation.z = side * -.06;
      arm.castShadow = true;
      sculpture.add(arm);

      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .38, 8, 20), limbMaterial);
      leg.position.set(side * .38, -.94, .01);
      leg.castShadow = true;
      sculpture.add(leg);

      const foot = new THREE.Mesh(new THREE.SphereGeometry(.27, 24, 16), limbMaterial);
      foot.scale.set(1.18, .52, 1.35);
      foot.position.set(side * .4, -1.18, .22);
      foot.castShadow = true;
      sculpture.add(foot);
    });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.48, .42, 48), material(0xd7d4ca, .9));
    plinth.position.y = -1.5;
    plinth.receiveShadow = true;
    sculpture.add(plinth);
    scene.add(sculpture);
  }

  function bindEvents() {
    document.getElementById('enterButton').addEventListener('click', startVisit);
    document.getElementById('homeButton').addEventListener('click', () => switchFloor('west'));
    document.querySelectorAll('[data-floor]').forEach((button) => button.addEventListener('click', () => switchFloor(button.dataset.floor)));
    document.getElementById('mapButton').addEventListener('click', openMap);
    document.getElementById('mapClose').addEventListener('click', () => closePanels(true));
    document.getElementById('panelClose').addEventListener('click', () => closePanels(true));
    scrim.addEventListener('click', () => closePanels(false));
    inspectPrompt.addEventListener('click', inspectCurrent);
    mobileInspect.addEventListener('click', inspectCurrent);
    mobileThrow.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      mobileThrow.setPointerCapture(event.pointerId);
      startEggBarrage(innerWidth / 2, innerHeight / 2);
    });
    mobileThrow.addEventListener('pointerup', stopEggBarrage);
    mobileThrow.addEventListener('pointercancel', stopEggBarrage);
    soundButton.addEventListener('click', toggleSound);
    clearPaintButton.addEventListener('click', clearPaintSplats);

    addEventListener('resize', resize);
    addEventListener('keydown', (event) => {
      state.keys[event.code] = true;
      if (event.code === 'KeyE' || event.code === 'Enter') inspectCurrent();
      if (event.code === 'KeyM') openMap();
      if (event.code === 'Escape') closePanels(false);
    });
    addEventListener('keyup', (event) => { state.keys[event.code] = false; });

    canvas.addEventListener('pointerdown', (event) => {
      if (!state.started || state.panelOpen) return;
      if (!state.mobile && event.button === 2) {
        event.preventDefault();
        canvas.setPointerCapture(event.pointerId);
        startEggBarrage(event.clientX, event.clientY);
        return;
      }
      if (state.mobile || event.button !== 0) return;
      state.desktopLook = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', (event) => {
      if (state.eggBarrage) {
        state.eggBarrage.x = event.clientX;
        state.eggBarrage.y = event.clientY;
      }
      const look = state.desktopLook;
      if (!look || look.id !== event.pointerId || state.panelOpen) return;
      const moveX = event.clientX - look.x;
      const moveY = event.clientY - look.y;
      look.moved += Math.abs(moveX) + Math.abs(moveY);
      state.yaw -= moveX * .004;
      state.pitch -= moveY * .0035;
      state.pitch = THREE.MathUtils.clamp(state.pitch, -1.25, 1.25);
      look.x = event.clientX;
      look.y = event.clientY;
    });
    const endDesktopLook = (event) => {
      const look = state.desktopLook;
      if (!look || look.id !== event.pointerId) return;
      state.desktopLook = null;
      canvas.classList.remove('dragging');
      if (look.moved < 8) inspectAt(event.clientX, event.clientY);
    };
    canvas.addEventListener('pointerup', (event) => { stopEggBarrage(); endDesktopLook(event); });
    canvas.addEventListener('pointercancel', (event) => { stopEggBarrage(); endDesktopLook(event); });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    if (state.mobile) bindMobileControls();
  }

  function startVisit() {
    clearPaintSplats();
    state.started = true;
    frogLaughAudio?.load();
    entry.classList.add('hidden');
    header.classList.add('visible');
    state.muted = false;
    soundButton.classList.remove('muted');
    soundButton.setAttribute('aria-label', '暂停环境音乐');
    audio.volume = .24;
    audio.play().catch(() => {
      state.muted = true;
      soundButton.classList.add('muted');
      soundButton.setAttribute('aria-label', '播放环境音乐');
    });
    header.setAttribute('aria-hidden', 'false');
    floorSwitcher.classList.add('visible');
    floorSwitcher.setAttribute('aria-hidden', 'false');
    roomCaption.classList.add('visible');
    if (state.mobile) {
      mobileControls.classList.add('active');
      mobileControls.setAttribute('aria-hidden', 'false');
      updateOrientationNote();
    }
  }

  function bindMobileControls() {
    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('joystickKnob');
    let stickId = null;
    const updateStick = (event) => {
      const rect = joystick.getBoundingClientRect();
      let x = event.clientX - (rect.left + rect.width / 2);
      let y = event.clientY - (rect.top + rect.height / 2);
      const length = Math.hypot(x, y);
      const max = 29;
      if (length > max) { x = x / length * max; y = y / length * max; }
      state.moveStick.x = x / max;
      state.moveStick.y = y / max;
      knob.style.transform = `translate(${x}px, ${y}px)`;
    };
    joystick.addEventListener('pointerdown', (event) => {
      stickId = event.pointerId;
      joystick.setPointerCapture(stickId);
      updateStick(event);
    });
    joystick.addEventListener('pointermove', (event) => { if (event.pointerId === stickId) updateStick(event); });
    const resetStick = (event) => {
      if (event.pointerId !== stickId) return;
      stickId = null;
      state.moveStick.x = state.moveStick.y = 0;
      knob.style.transform = 'translate(0, 0)';
    };
    joystick.addEventListener('pointerup', resetStick);
    joystick.addEventListener('pointercancel', resetStick);

    canvas.addEventListener('pointerdown', (event) => {
      if (!state.started || state.panelOpen) return;
      state.lookPointer = event.pointerId;
      state.lookLast.x = event.clientX;
      state.lookLast.y = event.clientY;
      state.lookMoved = 0;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== state.lookPointer || state.panelOpen) return;
      const moveX = event.clientX - state.lookLast.x;
      const moveY = event.clientY - state.lookLast.y;
      state.lookMoved += Math.abs(moveX) + Math.abs(moveY);
      state.yaw -= moveX * .005;
      state.pitch -= moveY * .004;
      state.pitch = THREE.MathUtils.clamp(state.pitch, -1.12, 1.12);
      state.lookLast.x = event.clientX;
      state.lookLast.y = event.clientY;
    });
    const endLook = (event) => {
      if (event.pointerId !== state.lookPointer) return;
      state.lookPointer = null;
      if (state.lookMoved < 9) inspectAt(event.clientX, event.clientY);
    };
    canvas.addEventListener('pointerup', endLook);
    canvas.addEventListener('pointercancel', endLook);
    addEventListener('orientationchange', updateOrientationNote);
    addEventListener('resize', updateOrientationNote);
  }

  function updateOrientationNote() {
    document.getElementById('orientationNote').classList.toggle('visible', innerHeight > innerWidth && state.started);
  }

  function inspectCurrent() {
    if (!state.hoveredArt || state.panelOpen) return;
    openArtwork(state.hoveredArt.userData.art);
  }

  function inspectAt(clientX, clientY) {
    if (state.panelOpen) return;
    const point = new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(point, camera);
    const previousFar = raycaster.far;
    raycaster.far = 14;
    const activeArtMeshes = artMeshes.filter((mesh) => mesh.userData.art.floorId === state.currentFloor);
    const hits = raycaster.intersectObjects(activeArtMeshes, false);
    raycaster.far = previousFar;
    if (hits.length) openArtwork(hits[0].object.userData.art);
  }

  function getMuseumCategory(art) {
    if (art.era) return `${art.floorId === 'china' ? '中国馆' : '西方馆'} · ${art.era}`;
    if (art.room === 'qin') return '中国馆 · 秦汉 / QIN & HAN';
    if (art.id === 'war-01') return '西方馆 · 新古典主义 / NEOCLASSICISM';
    if (art.id === 'war-05') return '西方馆 · 前拉斐尔派 / PRE-RAPHAELITE';
    if (art.room === 'war') return '西方馆 · 现实主义 / REALISM';
    return '西方馆 · 浪漫主义 / ROMANTICISM';
  }

  function openArtwork(art) {
    stopEggBarrage();
    state.panelOpen = true;
    document.getElementById('panelImage').src = art.previewSrc || art.image;
    document.getElementById('panelImage').alt = art.title;
    document.getElementById('panelRoom').textContent = getMuseumCategory(art);
    document.getElementById('panelTitle').textContent = art.title;
    document.getElementById('panelOriginal').textContent = art.original;
    document.getElementById('panelDescription').textContent = art.description;
    document.getElementById('panelNumber').textContent = `MFM · 3D · ${art.number} / ${String(ARTWORKS.length).padStart(2, '0')}`;
    artPanel.classList.add('open');
    artPanel.setAttribute('aria-hidden', 'false');
    scrim.classList.add('visible');
  }

  function openMap() {
    if (!state.started) return;
    stopEggBarrage();
    state.panelOpen = true;
    mapPanel.classList.add('open');
    mapPanel.setAttribute('aria-hidden', 'false');
    scrim.classList.add('visible');
  }

  function closePanels(resume) {
    const wasOpen = state.panelOpen;
    state.panelOpen = false;
    artPanel.classList.remove('open');
    mapPanel.classList.remove('open');
    artPanel.setAttribute('aria-hidden', 'true');
    mapPanel.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('visible');
    if (resume && wasOpen) canvas.focus();
  }

  function toggleSound() {
    state.muted = !state.muted;
    soundButton.classList.toggle('muted', state.muted);
    soundButton.setAttribute('aria-label', state.muted ? '播放环境音乐' : '暂停环境音乐');
    if (state.muted) audio.pause();
    else {
      audio.volume = .24;
      audio.play().catch(() => { state.muted = true; soundButton.classList.add('muted'); });
    }
  }

  function switchFloor(floorId) {
    const info = FLOOR_INFO[floorId];
    if (!info) return;
    stopEggBarrage();
    state.currentFloor = floorId;
    camera.position.set(0, info.baseY + 1.65, 34.5);
    state.yaw = 0;
    state.pitch = 0;
    state.velocity.set(0, 0, 0);
    closePanels(false);
    updateFloorUI(floorId);
  }

  function updateFloorUI(floorId) {
    const info = FLOOR_INFO[floorId];
    roomCaption.innerHTML = `<span>${info.level} · ${info.zh}</span><small>${info.en} · ${info.count} WORKS</small>`;
    document.getElementById('currentFloor').textContent = `${info.level} · ${info.zh}`;
    document.querySelectorAll('[data-floor]').forEach((button) => button.classList.toggle('active', button.dataset.floor === floorId));
  }

  function updateMovement(delta) {
    if (!state.started || state.panelOpen) return;
    camera.rotation.y = state.yaw;
    camera.rotation.x = state.pitch;

    let forwardInput = 0;
    let sideInput = 0;
    if (state.keys.KeyW || state.keys.ArrowUp) forwardInput += 1;
    if (state.keys.KeyS || state.keys.ArrowDown) forwardInput -= 1;
    if (state.keys.KeyD || state.keys.ArrowRight) sideInput += 1;
    if (state.keys.KeyA || state.keys.ArrowLeft) sideInput -= 1;
    forwardInput += -state.moveStick.y;
    sideInput += state.moveStick.x;

    const inputLength = Math.hypot(forwardInput, sideInput);
    if (inputLength > 1) { forwardInput /= inputLength; sideInput /= inputLength; }
    const speed = state.keys.ShiftLeft || state.keys.ShiftRight ? 5 : 3.1;
    const targetX = (Math.sin(state.yaw) * -forwardInput + Math.cos(state.yaw) * sideInput) * speed;
    const targetZ = (Math.cos(state.yaw) * -forwardInput - Math.sin(state.yaw) * sideInput) * speed;
    const damping = 1 - Math.exp(-11 * delta);
    state.velocity.x = THREE.MathUtils.lerp(state.velocity.x, targetX, damping);
    state.velocity.z = THREE.MathUtils.lerp(state.velocity.z, targetZ, damping);

    camera.position.x += state.velocity.x * delta;
    camera.position.z += state.velocity.z * delta;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8.35, 8.35);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -50.7, 50.7);
    camera.position.y = FLOOR_INFO[state.currentFloor].baseY + 1.65;
  }

  function randomEggColor() {
    let index = Math.floor(Math.random() * EGG_COLORS.length);
    if (index === state.lastEggColor) index = (index + 1) % EGG_COLORS.length;
    state.lastEggColor = index;
    return EGG_COLORS[index];
  }

  function startEggBarrage(x, y) {
    if (!state.started || state.panelOpen) return;
    stopEggBarrage();
    state.eggBarrage = { x, y, timer: 0 };
    throwEgg(x, y);
    state.eggBarrage.timer = setInterval(() => {
      const barrage = state.eggBarrage;
      if (!barrage || state.panelOpen) return;
      throwEgg(barrage.x + (Math.random() - .5) * 18, barrage.y + (Math.random() - .5) * 18);
    }, 105);
  }

  function stopEggBarrage() {
    if (state.eggBarrage?.timer) clearInterval(state.eggBarrage.timer);
    state.eggBarrage = null;
  }

  function clearPaintSplats() {
    stopEggBarrage();
    paintSplats.splice(0).forEach((splat) => scene.remove(splat));
    canvas.dataset.splatCount = '0';
    canvas.dataset.impactHistory = '[]';
    canvas.dataset.lastEggImpact = '';
    canvas.dataset.lastFrogLaugh = '';
    canvas.dataset.frogLaughCount = '0';
  }

  function getImpactTargets() {
    const agentMeshes = [];
    roamingAgents.forEach((agent) => {
      if (agent.userData.roaming.floorId !== state.currentFloor) return;
      agent.traverse((part) => { if (part.isMesh) agentMeshes.push(part); });
    });
    return [
      ...artMeshes.filter((mesh) => mesh.userData.art.floorId === state.currentFloor),
      ...impactSurfaces.filter((mesh) => mesh.userData.floorId === state.currentFloor),
      ...agentMeshes
    ];
  }

  function throwEgg(clientX = innerWidth / 2, clientY = innerHeight / 2) {
    if (!state.started || state.panelOpen) return;
    const point = new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(point, camera);
    const previousFar = raycaster.far;
    raycaster.far = 70;
    const targetHit = raycaster.intersectObjects(getImpactTargets(), false)[0] || null;
    raycaster.far = previousFar;
    const targetName = targetHit ? (targetHit.object.userData.art?.id || targetHit.object.name) : 'miss';
    canvas.dataset.lastEggTarget = targetName;
    const direction = targetHit ? targetHit.point.clone().sub(camera.position).normalize() : raycaster.ray.direction.clone();
    const color = randomEggColor();
    const recentColors = JSON.parse(canvas.dataset.eggColors || '[]');
    recentColors.push(color);
    canvas.dataset.eggColors = JSON.stringify(recentColors.slice(-12));
    const eggMaterial = new THREE.MeshStandardMaterial({ color, roughness: .3, metalness: .08 });
    const mesh = new THREE.Mesh(eggGeometry, eggMaterial);
    mesh.scale.set(.11, .145, .11);
    mesh.position.copy(camera.position).addScaledVector(direction, .72);
    mesh.castShadow = !state.mobile;
    mesh.receiveShadow = true;
    mesh.userData.velocity = direction.multiplyScalar(14.5);
    mesh.userData.velocity.y += .18;
    mesh.userData.floorY = FLOOR_INFO[state.currentFloor].baseY + .14;
    mesh.userData.age = 0;
    mesh.userData.color = color;
    mesh.userData.targetHit = targetHit ? {
      object: targetHit.object,
      point: targetHit.point.clone(),
      uv: targetHit.uv ? targetHit.uv.clone() : null,
      faceNormal: targetHit.face ? targetHit.face.normal.clone() : new THREE.Vector3(0, 1, 0)
    } : null;
    mesh.userData.targetStart = mesh.position.clone();
    mesh.userData.targetStartedAt = performance.now();
    mesh.userData.targetDuration = targetHit ? THREE.MathUtils.clamp(mesh.position.distanceTo(targetHit.point) / 14.5 * 1000, 320, 720) : 0;
    scene.add(mesh);
    eggs.push(mesh);
    mobileThrow.querySelector('i').style.background = color;
    if (eggs.length > 40) removeEgg(0);
  }

  function removeEgg(index) {
    const egg = eggs[index];
    scene.remove(egg);
    egg.material.dispose();
    eggs.splice(index, 1);
  }

  function frogWasHit(surfaceHit) {
    const art = surfaceHit?.object?.userData?.art;
    if (!art || !surfaceHit.uv) return false;
    const zones = FROG_HIT_ZONES[art.id] || [];
    const x = surfaceHit.uv.x;
    const y = 1 - surfaceHit.uv.y;
    return zones.some((zone) => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h);
  }

  function playFrogLaugh(artId) {
    if (!frogLaughAudio) return;
    frogLaughAudio.pause();
    frogLaughAudio.currentTime = 0;
    frogLaughAudio.volume = .7;
    frogLaughAudio.play().catch(() => {});
    canvas.dataset.lastFrogLaugh = artId;
    canvas.dataset.frogLaughCount = String(Number(canvas.dataset.frogLaughCount || 0) + 1);
    canvas.dataset.bgmStillPlaying = String(!audio.paused);
  }

  function breakEgg(egg, position, surfaceHit = null) {
    const color = egg.userData.color;
    for (let j = 0; j < 10; j++) {
      const shell = new THREE.Mesh(
        fragmentGeometry,
        new THREE.MeshStandardMaterial({ color: j % 3 === 0 ? 0xfff3d1 : color, roughness: .5 })
      );
      shell.position.copy(position);
      shell.userData.velocity = new THREE.Vector3((Math.random() - .5) * 3.1, Math.random() * 2.7 + .35, (Math.random() - .5) * 3.1);
      shell.userData.age = 0;
      scene.add(shell);
      fragments.push(shell);
    }
    if (surfaceHit) {
      const impactName = surfaceHit.object.userData.art?.id || surfaceHit.object.name;
      canvas.dataset.lastEggImpact = impactName;
      const impactHistory = JSON.parse(canvas.dataset.impactHistory || '[]');
      impactHistory.push(impactName);
      canvas.dataset.impactHistory = JSON.stringify(impactHistory.slice(-30));
      const roamingAgent = surfaceHit.object.userData.roamingAgent;
      if (roamingAgent) {
        scareRoamingAgent(roamingAgent, position);
      } else {
        createPaintSplat(surfaceHit, color);
        if (frogWasHit(surfaceHit)) playFrogLaugh(surfaceHit.object.userData.art.id);
      }
    }
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function traceOrganicBlob(context, random, centerX, centerY, radius, points = 44) {
    const outline = [];
    for (let index = 0; index < points; index++) {
      const angle = index / points * Math.PI * 2;
      const pulse = .78 + random() * .35 + Math.sin(angle * 5 + random() * 2) * .06;
      outline.push({ x: centerX + Math.cos(angle) * radius * pulse, y: centerY + Math.sin(angle) * radius * pulse });
    }
    const first = outline[0];
    const last = outline[outline.length - 1];
    context.beginPath();
    context.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
    outline.forEach((point, index) => {
      const next = outline[(index + 1) % outline.length];
      context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
    });
    context.closePath();
  }

  function createSplatTexture(color, variant) {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext('2d');
    const random = seededRandom(variant * 92821 + parseInt(color.slice(1), 16));
    const base = new THREE.Color(color);
    const dark = base.clone().multiplyScalar(.52).getStyle();
    const light = base.clone().lerp(new THREE.Color(0xffffff), .44).getStyle();

    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (let index = 0; index < 14; index++) {
      const angle = random() * Math.PI * 2;
      const start = 23 + random() * 22;
      const length = 58 + random() * 72;
      context.strokeStyle = index % 4 === 0 ? dark : color;
      context.globalAlpha = .72 + random() * .24;
      context.lineWidth = 2 + random() * 7;
      context.beginPath();
      context.moveTo(128 + Math.cos(angle) * start, 128 + Math.sin(angle) * start);
      const bend = (random() - .5) * .5;
      context.quadraticCurveTo(128 + Math.cos(angle + bend) * length * .72, 128 + Math.sin(angle + bend) * length * .72, 128 + Math.cos(angle) * length, 128 + Math.sin(angle) * length);
      context.stroke();
    }

    context.globalAlpha = .96;
    context.fillStyle = dark;
    traceOrganicBlob(context, random, 128, 128, 58);
    context.fill();
    const wetGradient = context.createRadialGradient(108, 102, 5, 128, 128, 67);
    wetGradient.addColorStop(0, light);
    wetGradient.addColorStop(.22, color);
    wetGradient.addColorStop(.78, color);
    wetGradient.addColorStop(1, dark);
    context.fillStyle = wetGradient;
    traceOrganicBlob(context, random, 128, 128, 54);
    context.fill();

    for (let index = 0; index < 34; index++) {
      const angle = random() * Math.PI * 2;
      const distance = 62 + random() * 69;
      const radius = 1.2 + Math.pow(random(), 2) * 7;
      context.globalAlpha = .7 + random() * .3;
      context.fillStyle = index % 6 === 0 ? dark : color;
      context.beginPath();
      context.ellipse(128 + Math.cos(angle) * distance, 128 + Math.sin(angle) * distance, radius * (1 + random() * 1.5), radius, angle, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = .38;
    context.strokeStyle = light;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(116, 113, 27, 3.65, 5.15);
    context.stroke();
    context.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function getSplatMaterial(color) {
    const variant = Math.floor(Math.random() * 4);
    const key = `${color}-${variant}`;
    if (!splatMaterials.has(key)) {
      splatMaterials.set(key, new THREE.MeshStandardMaterial({
        map: createSplatTexture(color, variant),
        transparent: true,
        alphaTest: .025,
        depthWrite: false,
        roughness: .22,
        metalness: .03,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3
      }));
    }
    return splatMaterials.get(key);
  }

  function createPaintSplat(hit, color) {
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
    const localNormal = hit.faceNormal || hit.face?.normal || new THREE.Vector3(0, 1, 0);
    const normal = localNormal.clone().applyMatrix3(normalMatrix).normalize();
    const splat = new THREE.Mesh(splatGeometry, getSplatMaterial(color));
    splat.position.copy(hit.point).addScaledVector(normal, .025);
    splat.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    splat.rotateZ(Math.random() * Math.PI * 2);
    const size = .7 + Math.random() * .9;
    splat.scale.set(size * (.9 + Math.random() * .42), size, 1);
    splat.renderOrder = 4;
    splat.userData.floorId = state.currentFloor;
    scene.add(splat);
    paintSplats.push(splat);
    if (paintSplats.length > 220) scene.remove(paintSplats.shift());
    canvas.dataset.splatCount = String(paintSplats.length);
  }

  function updateEggs(delta) {
    const impactTargets = getImpactTargets();
    for (let i = eggs.length - 1; i >= 0; i--) {
      const egg = eggs[i];
      const velocity = egg.userData.velocity;
      const previous = egg.position.clone();
      egg.userData.age += delta;
      if (egg.userData.targetHit) {
        const progress = Math.min(1, (performance.now() - egg.userData.targetStartedAt) / egg.userData.targetDuration);
        egg.position.lerpVectors(egg.userData.targetStart, egg.userData.targetHit.point, progress);
        egg.rotation.x += delta * 12;
        egg.rotation.z += delta * 9;
        if (progress >= 1) {
          const hit = egg.userData.targetHit;
          breakEgg(egg, hit.point, hit);
          removeEgg(i);
        }
        continue;
      }

      velocity.y -= 1.4 * delta;
      egg.position.addScaledVector(velocity, delta);
      egg.rotation.x += velocity.z * delta * 2.2;
      egg.rotation.z -= velocity.x * delta * 2.2;
      {
        const travel = egg.position.clone().sub(previous);
        const distance = travel.length();
        if (distance > 0) {
          const impactRay = new THREE.Raycaster(previous, travel.normalize(), 0, distance + .18);
          const hits = impactRay.intersectObjects(impactTargets, false);
          if (hits.length) {
            breakEgg(egg, hits[0].point, hits[0]);
            removeEgg(i);
            continue;
          }
        }
      }

      const hitRoom = egg.position.y <= egg.userData.floorY || Math.abs(egg.position.x) >= 8.78 || Math.abs(egg.position.z) >= 51.78;
      if (hitRoom || egg.userData.age > 5) {
        breakEgg(egg, egg.position);
        removeEgg(i);
      }
    }
  }

  function updateFragments(delta) {
    const floorY = FLOOR_INFO[state.currentFloor].baseY + .04;
    for (let i = fragments.length - 1; i >= 0; i--) {
      const fragment = fragments[i];
      fragment.userData.age += delta;
      fragment.userData.velocity.y -= 7.8 * delta;
      fragment.position.addScaledVector(fragment.userData.velocity, delta);
      fragment.rotation.x += delta * 8;
      fragment.rotation.y += delta * 6;
      if (fragment.position.y < floorY) {
        fragment.position.y = floorY;
        fragment.userData.velocity.multiplyScalar(.5);
        fragment.userData.velocity.y = Math.abs(fragment.userData.velocity.y) * .3;
      }
      fragment.material.opacity = Math.max(0, 1 - Math.max(0, fragment.userData.age - 1.3) / .7);
      fragment.material.transparent = true;
      if (fragment.userData.age > 2) {
        scene.remove(fragment);
        fragment.material.dispose();
        fragments.splice(i, 1);
      }
    }
  }

  function updateTarget() {
    if (!state.started || state.panelOpen) {
      state.hoveredArt = null;
      reticle.classList.remove('target');
      inspectPrompt.classList.remove('visible');
      mobileInspect.classList.remove('available');
      return;
    }
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const activeArtMeshes = artMeshes.filter((mesh) => mesh.userData.art.floorId === state.currentFloor);
    const hits = raycaster.intersectObjects(activeArtMeshes, false);
    state.hoveredArt = hits.length ? hits[0].object : null;
    const hasTarget = Boolean(state.hoveredArt);
    reticle.classList.toggle('target', hasTarget);
    inspectPrompt.classList.toggle('visible', hasTarget && state.started && !state.mobile);
    inspectPrompt.setAttribute('aria-hidden', String(!hasTarget));
    mobileInspect.classList.toggle('available', hasTarget);
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), .05);
    updateMovement(delta);
    updateEggs(delta);
    updateFragments(delta);
    updateHiddenFrogs();
    updateRoamingAgents(delta);
    updateTarget();
    if (sculpture) sculpture.rotation.y = Math.sin(clock.elapsedTime * .28) * .08;
    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, state.mobile ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight);
  }
})();
