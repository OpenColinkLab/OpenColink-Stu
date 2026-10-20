// 艺术家生平故事(示例)
const ARTIST_BIO = {
  "Claude Monet": {
    name: "克劳德·莫奈",
    life: "1840–1926",
    portrait: "assets/context/monet-portrait.jpg",
    story: "莫奈五岁时全家从巴黎搬到诺曼底海港勒阿弗尔,他在那里学会了用木炭给路人画讽刺肖像赚零花钱,十几岁时已小有名气。真正改变他的是遇见风景画家布丹,后者带他到户外对着真实的天空、海浪和云层作画。莫奈后来说:'布丹打开了我的眼睛。'<br><br>1870年代,莫奈和一群年轻画家(后来被嘲讽为'印象派')拒绝沙龙的学院规矩,坚持画瞬间的光、雾气、水面反光这些'不正经'的东西。批评家嘲笑他们的画'像未完成的草稿',但莫奈不在乎。他扛着画架到塞纳河边、到火车站、到麦田,有时为了捕捉特定时刻的光线,他会在同一地点画几十遍。<br><br>晚年他在吉维尼买下一栋房子和一片地,亲手设计了日本式拱桥、引水种睡莲,然后用近三十年反复画那片池塘。视力衰退、白内障让色彩在他眼里扭曲成红与黄,但他继续画,直到几乎看不见。那些巨幅睡莲——水、光、倒影融成一片——后来被认为预示了抽象绘画的到来。"
  },
  "Jean-Honoré Fragonard": {
    name: "让-奥诺雷·弗拉戈纳尔",
    life: "1732–1806",
    portrait: "assets/context/fragonard-portrait.jpg",
    story: "弗拉戈纳尔出生在法国南部格拉斯一个手套商人家庭,少年时被送到巴黎当公证员学徒,但他对法律文件毫无兴趣,成天在纸边画小人。母亲只好把他送去学画,没想到六年后他就拿了罗马奖,被公费送到意大利深造。<br><br>在罗马的几年里,他不像其他学生那样老老实实临摹古代雕塑,而是到蒂沃利花园写生,画光影、喷泉和柏树。回到巴黎后,他原本可以安稳地画历史画、当院士,但他更喜欢画那些'不登大雅之堂'的题材:秋千上的少女、偷情的情侣、蓬松的小狗、花园里的密会。<br><br>他的笔触快得出奇,有时一幅画几小时就完成,色彩明艳、构图大胆,像在画布上跳舞。贵族们喜欢他的画里那种轻盈、甜蜜、有点顽皮的气氛,订单不断。但法国大革命后,洛可可式的享乐主义突然不合时宜了。弗拉戈纳尔晚年几乎被遗忘,穷困潦倒,1806年在卢浮宫附近的陋室里去世。直到19世纪末,人们才重新发现他的天才。"
  },
  "Édouard Manet": {
    name: "爱德华·马奈",
    life: "1832–1883",
    story: "马奈出生于巴黎一个法官家庭,父亲希望他学法律或当海军,他两次报考海军学校都失败了,只好去学画。他跟随学院派画家库蒂尔学了六年,却始终怀疑那套陈规。他坚持'画我所见,而非别人想看的东西'。<br><br>1863年的《草地上的午餐》和1865年的《奥林匹亚》在落选者沙龙和官方沙龙接连引发丑闻——批评家们愤怒于他把现代巴黎人当古典题材来画。但正是这些争议让他成了后来印象派的旗帜性人物,尽管他从未参加印象派画展,也始终想被官方沙龙接纳。<br><br>1866年的《吹笛少年》几乎删掉了所有空间暗示:平涂的灰色背景、无影的地面,少年像纸牌一样立在画面上。这种彻底的平面性源自西班牙绘画与日本浮世绘的启发,比印象派更早地预告了现代绘画的解放。"
  }
};

Object.assign(ARTIST_BIO, {
  "Unknown": {name:"无名创作者",life:"身份不可考",story:"这些作品没有留下可确认的个人署名。史前洞窟和岩刻往往由许多人跨越数代完成，创作者可能同时是猎人、仪式参与者、观察者与讲故事的人。<br><br>“未知”并不等于没有作者，而是提醒我们：艺术史最早的部分属于群体记忆，而非现代意义上的个人名家。"},
  "Gothic Architecture": {name:"哥特式建筑工匠群体",life:"约12–14世纪",story:"中世纪大教堂不是一位建筑师独立完成的作品，而是石匠、木匠、玻璃匠、雕刻师与工程师跨越数代协作的结果。许多人终其一生只负责一部分，甚至看不到建筑完工。<br><br>他们用飞扶壁把重量导向外部，让墙体可以开出巨大彩窗。那些匿名工匠留下的签名，常藏在高处石块和梁架上，只有修复时才会重新被看到。"},
  "Wassily Kandinsky": {name:"瓦西里·康定斯基",life:"1866–1944",portrait:"assets/context/artists/Wassily_Kandinsky.jpg",story:"康定斯基原本是受过严格训练的法学家，三十岁才放弃大学教职去慕尼黑学画。传说他有一次把自己的画倒放，突然发现当形象无法辨认时，色彩和线条反而更有力量。<br><br>他把颜色与声音联系起来：黄色像小号，蓝色像大提琴，圆形最接近深沉的蓝。后来他在包豪斯任教，用点、线、面建立一套近乎音乐理论的抽象语言。"},
  "Katsushika Hokusai": {name:"葛饰北斋",life:"1760–1849",portrait:"assets/context/artists/Katsushika_Hokusai.jpg",story:"北斋一生至少改过三十次名字，也搬过九十多次家，据说是因为从不打扫，屋子乱到无法居住便直接搬走。六十多岁时他才创作《富岳三十六景》，包括后来闻名世界的《神奈川冲浪里》。<br><br>他晚年自称“画狂老人”，坚信自己活到一百岁就能把每一根线画活。临终前仍叹息：如果上天再给我十年，我就能成为真正的画家。"},
  "El Lissitzky": {name:"埃尔·李西茨基",life:"1890–1941",portrait:"assets/context/artists/El_Lissitzky.jpg",story:"李西茨基最初学习建筑，后来把建筑式思维带进海报、书籍和展览。他发明“Proun”系列，让二维几何图形看起来像可以进入的空间。<br><br>他认为艺术家不该只制作挂在墙上的漂亮东西，而应像工程师一样改变社会。字体、摄影、红黑构图和大胆留白，经他之手成为现代平面设计的基础语法。"},
  "Pablo Picasso": {name:"巴勃罗·毕加索",life:"1881–1973",portrait:"assets/context/artists/Pablo_Picasso.jpg",story:"毕加索的父亲是美术教师，传说看到十三岁的儿子画得比自己好后便把画笔交给了他。年轻时他在巴黎极度贫穷，甚至烧掉自己的画取暖，却不断改换风格。<br><br>他与布拉克共同发展立体主义，把人物拆成多个视角重新拼装。毕加索创作欲惊人，一生留下数万件作品，也常把旧纸片、报纸甚至自行车零件变成艺术。"},
  "Edvard Munch": {name:"爱德华·蒙克",life:"1863–1944",portrait:"assets/context/artists/Edvard_Munch.jpg",story:"蒙克童年接连失去母亲和姐姐，父亲又笃信宗教、性格严厉。疾病、死亡和焦虑因此反复进入他的画。他说：“疾病、疯狂和死亡是守护我摇篮的黑天使。”<br><br>《呐喊》的灵感来自一次黄昏散步：天空变得血红，他感到“一声巨大的尖叫穿过自然”。他不是在画一个人尖叫，而是在画焦虑本身。"},
  "Vincent van Gogh": {name:"文森特·梵高",life:"1853–1890",portrait:"assets/context/artists/Vincent_van_Gogh.jpg",story:"梵高做过画商、教师和传教士，二十七岁才决定成为艺术家。他靠弟弟提奥寄钱生活，并用数百封信详细记录颜色、材料和情绪。<br><br>他在十年间完成约九百幅油画，却生前几乎卖不出去。圣雷米疗养院时期，即使精神状况反复，他仍把柏树、星空和麦田画成旋转燃烧的生命。"},
  "Alexandros of Antioch": {name:"安条克的亚历山德罗斯",life:"约公元前2世纪",portrait:"assets/context/artists/Alexandros_of_Antioch.jpg",story:"关于亚历山德罗斯的生平几乎没有可靠记录。他的名字来自《米洛斯的维纳斯》出土时附近的一块基座铭文，后来基座却遗失了。<br><br>学者据风格和铭文推测，他活跃于希腊化晚期。今天人们熟悉的是雕像缺失的双臂，而艺术家的身份反倒像作品一样留下了谜。"},
  "Cimabue": {name:"契马布埃",life:"约1240–1302",portrait:"assets/context/artists/Cimabue.jpg",story:"契马布埃被视为把意大利绘画从拜占庭程式带向自然观察的重要人物。瓦萨里讲过一个著名故事：他偶然看见牧童乔托在石头上画羊，便收他为徒。<br><br>故事未必完全可靠，却象征着一个时代的交接。契马布埃仍使用金色背景，但人物开始拥有重量、表情和空间感。"},
  "Leonardo da Vinci": {name:"列奥纳多·达·芬奇",life:"1452–1519",portrait:"assets/context/artists/Leonardo_da_Vinci.jpg",story:"达·芬奇既画画，也研究解剖、飞行、机械、水流和植物。他习惯用镜像文字记笔记，留下数千页手稿，却经常开新项目而不完成旧项目。<br><br>为了《最后的晚餐》获得更丰富细节，他不用可靠的湿壁画法，而在干墙上实验油性颜料。结果作品很快开始剥落，却也成为艺术史上最著名的技术冒险之一。"},
  "Michelangelo": {name:"米开朗基罗",life:"1475–1564",portrait:"assets/context/artists/Michelangelo.jpg",story:"米开朗基罗总说自己首先是雕塑家，却被教皇命令去画西斯廷天顶。他在高架台上工作四年，颜料滴到脸上，身体长期后仰，甚至写诗抱怨这份苦差。<br><br>他性格孤僻、生活节俭，却对大理石有近乎宗教般的迷恋。他认为雕像本来就藏在石头里，雕刻只是把多余部分去掉。"},
  "Raphael": {name:"拉斐尔",life:"1483–1520",portrait:"assets/context/artists/Raphael.jpg",story:"拉斐尔以温和、善于交际闻名，与孤傲的米开朗基罗形成鲜明对比。他年轻时便在佛罗伦萨吸收达·芬奇与米开朗基罗的成果，随后受教皇邀请装饰梵蒂冈。<br><br>《雅典学院》中，他把古代哲人画成文艺复兴名人的模样，甚至把自己悄悄放进画面右侧。三十七岁早逝时，罗马为之震动。"},
  "François Boucher": {name:"弗朗索瓦·布歇",life:"1703–1770",portrait:"assets/context/artists/Franois_Boucher.jpg",story:"布歇是路易十五时代最受欢迎的画家，也是蓬巴杜夫人的宠儿。他把神话、室内生活和田园幻想画成粉蓝、玫瑰与珍珠般的世界。<br><br>批评者指责他的牧羊人衣服太干净、自然过于甜美，布歇却毫不掩饰人工美感。他还设计挂毯、舞台和瓷器，是一位真正的视觉总监。"},
  "Utagawa Hiroshige": {name:"歌川广重",life:"1797–1858",portrait:"assets/context/artists/Utagawa_Hiroshige.jpg",story:"广重出身江户消防武士家庭，年轻时一边履行消防职责一边学习木版画。他不以英雄和美女见长，而把骤雨、积雪、桥梁和旅人变成诗意主角。<br><br>《东海道五十三次》令他成名。他常用大胆裁切和高视点构图，后来深深影响莫奈、梵高与惠斯勒。"},
  "Utagawa Kuniyoshi": {name:"歌川国芳",life:"1798–1861",portrait:"assets/context/artists/Utagawa_Kuniyoshi.jpg",story:"国芳擅长武者、妖怪和巨型动物，是江户时代最有想象力的插画家之一。他尤其爱猫，工作室里常有猫爬上衣服和画桌，甚至为去世的猫设佛坛。<br><br>幕府审查严格时，他会用双关和动物拟人绕过禁令。那些夸张动态和奇幻怪物，今天看起来很像漫画和游戏概念设计。"},
  "Jean-Antoine Watteau": {name:"让-安托万·华托",life:"1684–1721",portrait:"assets/context/artists/Jean-Antoine_Watteau.jpg",story:"华托出生在边境小城，年轻时独自到巴黎谋生，曾在作坊里批量临摹廉价宗教画。他后来创造“雅宴画”：衣着华美的人在花园中恋爱、演奏、离别。<br><br>这些场景看似轻快，却总带一层将散未散的忧伤。华托患肺结核，三十六岁便去世，这份短暂感也渗进了画面。"},
  "Jean-Baptiste Monnoyer": {name:"让-巴蒂斯特·蒙努瓦耶",life:"1636–1699",portrait:"assets/context/artists/Jean-Baptiste_Monnoyer.jpg",story:"蒙努瓦耶专画豪华花卉，曾为凡尔赛宫和戈布兰织毯工坊设计装饰。他熟悉不同花期，却常把现实中不会同时开放的花放进同一束。<br><br>这种“永不凋谢的花园”比植物学更讲究节奏、色彩与宫廷气派。晚年他移居伦敦，也影响了英国装饰艺术。"},
  "Nicolas Lancret": {name:"尼古拉·朗克雷",life:"1690–1743",portrait:"assets/context/artists/Nicolas_Lancret.jpg",story:"朗克雷原本学习雕版，后来转向绘画并追随华托的雅宴画风。他尤其擅长把舞蹈、游戏、野餐和四季活动安排进优雅花园。<br><br>他的作品常被误认成华托，但人物动作更清晰、叙事更像舞台。宫廷客户喜欢从中辨认当时的服装、礼仪和娱乐。"}
});

Object.assign(ARTIST_BIO, {
  "Rembrandt":{name:"伦勃朗·凡·莱因",life:"1606–1669",story:"伦勃朗年轻时在阿姆斯特丹迅速成名，订单多到需要雇佣学生模仿自己的笔触。他却不满足于漂亮的表面，常让颜料堆成厚厚的光，甚至故意把画面画得“不够完成”。<br><br>他一生画了大量自画像，从年轻时的得意到晚年的衰老，像是在用自己的脸记录时间。晚年破产后，他仍继续画画，工作室成了他最后的避难所。"},
  "Jean-François Millet":{name:"让-弗朗索瓦·米勒",life:"1814–1875",story:"米勒出生在诺曼底农民家庭，后来进入巴黎学习绘画。成名后，他仍选择住在巴比松村，和农民一起生活，清晨观察他们弯腰、休息和收工的动作。<br><br>城市批评家曾觉得他的画太沉重、太像社会宣言，但米勒坚持说自己只是画眼前的人，以及劳动留下的姿势。"},
  "Théodore Géricault":{name:"泰奥多尔·籍里柯",life:"1791–1824",story:"籍里柯为了画大型历史画，曾到医院研究病人的面孔，也研究马匹的肌肉和动作。他喜欢亲自接触题材，画马时甚至骑马摔伤。<br><br>创作《梅杜萨之筏》前，他采访幸存者、制作木筏模型，并让朋友躺在画室里模拟漂流者。为了追求真实，他把画室变成了临时实验室。"},
  "Francisco Goya":{name:"弗朗西斯科·戈雅",life:"1746–1828",story:"戈雅早年为宫廷画肖像和挂毯草图，后来一次重病导致听力永久丧失。失聪后，他的画越来越自由、尖锐，开始记录战争、迷信和人性的阴暗面。<br><br>晚年他把房子里的墙壁画满黑色幻想，被称为“黑画”。这些作品并不是为公众展览，而像是一个人留给自己的梦魇笔记。"},
  "Eugène Delacroix":{name:"欧仁·德拉克罗瓦",life:"1798–1863",story:"德拉克罗瓦每天给自己规定固定的绘画时间，哪怕心情很差也不停止。他在日记里记录颜色、文学和音乐，把画画当成一种需要纪律维持的生活。<br><br>他喜欢到动物园观察老虎和狮子，回到画室凭速写和记忆重建它们的力量。旅行北非后，他带回大量水彩和服饰观察，改变了自己对光线和色彩的理解。"},
  "John Everett Millais":{name:"约翰·埃弗里特·米莱",life:"1829–1896",story:"米莱斯十一岁进入皇家学院，是学院历史上最年轻的学生之一。画《奥菲莉亚》时，他让模特在装满水的浴缸里长时间保持姿势，浴缸加热灯熄灭后模特因此生病，米莱斯不得不赔偿医药费。<br><br>他坚持把植物逐一画得准确，常带着放大镜在户外工作。前拉斐尔派的细节热情，几乎变成了植物学家的耐心。"},
  "Gustave Caillebotte":{name:"古斯塔夫·卡耶博特",life:"1848–1894",story:"卡耶博特家境富裕，生活上不依靠卖画，因此能坚持自己真正感兴趣的题材。他收藏莫奈、雷诺阿等人的作品，也用自己的钱帮助印象派朋友。<br><br>他喜欢从阳台、街角和高处观察巴黎，把城市当成几何实验场。去世后，他把大批收藏遗赠给法国，改变了公众看到印象派的方式。"},
  "Paul Cézanne":{name:"保罗·塞尚",life:"1839–1906",story:"塞尚性格孤僻，常常画一只苹果画到朋友等得不耐烦。他认为“我欠自然以真理”，宁愿慢慢观察，也不愿用漂亮的笔触敷衍过去。<br><br>他与印象派一起展出，却始终觉得自己的方向不同：不是只捕捉瞬间，而是要在不断变化的视觉中找出稳定的结构。"},
  "Georges Seurat":{name:"乔治·修拉",life:"1859–1891",story:"修拉是点彩源法（分割主义）的创始人。他用细密的并置色点取代混合颜料，让色彩在观者眼中自行调和，以近乎科学的耐心重建光与形体。<br><br>《大碗岛的星期天下午》耗时两年反复修改，把休闲人群、树影与河面组织成一幅静止而发光的现代生活图景。"},
  "Henri Rousseau":{name:"亨利·卢梭",life:"1844–1910",story:"卢梭曾是海关职员，四十多岁才全心画画。巴黎人给他起了“海关员卢梭”的绰号，他却毫不介意，自信地把自己的画送进前卫艺术家的圈子。<br><br>他从未真正去过热带雨林，画中的异国植物主要来自植物园、动物园和插图，但他用极其认真的方式把想象画成了自己的现实。"},
"Edward Hopper":{name:"爱德华·霍普",life:"1882–1967",story:"霍普在纽约和巴黎学习绘画，长期从事插画工作，直到中年才逐渐以油画建立自己的声誉。他擅长描绘空旷街道、旅馆房间和深夜餐馆，将现代生活中的孤独转化为安静而清晰的光线。<br><br>他与妻子乔·诺维森共同生活和工作，许多作品的模特与评论记录都与两人的日常密切相关。霍普本人很少解释画面的故事，正是这种沉默留下了作品持久的开放性。"},
"Pieter Bruegel the Elder":{name:"老彼得·勃鲁盖尔",life:"约1525–1569",story:"勃鲁盖尔以乡村生活、季节劳动和民间节庆闻名。他曾前往意大利学习，却没有照搬古典风格，而是把阿尔卑斯山的旅行经验、北方村镇和普通人的日常重新组织进画面。<br><br>他的作品常采用高视点和宽阔全景，在大量人物活动中同时容纳季节、劳动、天气与社会观察。"},
"Gustav Klimt":{name:"古斯塔夫·克里姆特",life:"1862–1918",story:"克里姆特早年接受建筑装饰训练，后来与维也纳学院传统决裂，参与创立维也纳分离派。他把绘画、壁画和装饰设计结合起来，以金箔、几何纹样和丰富的平面结构塑造独特的视觉语言。<br><br>他很少公开谈论作品含义，更强调让画面直接产生感受。肖像中的人物、珠宝与装饰背景因此常常处于现实与象征之间。"},
"Hans Holbein the Younger":{name:"小汉斯·霍尔拜因",life:"约1497–1543",story:"霍尔拜因在德国和瑞士接受训练，后来定居英国并成为亨利八世的宫廷画家。他以极其准确的肖像观察记录人物的服饰、身份和表情，作品同时具有文献价值与心理刻画。<br><br>他还设计首饰、器物和宫廷装饰，说明文艺复兴时期的画家并不只负责架上绘画，而是参与完整的视觉生产。"}
});

Object.assign(ARTIST_BIO,{
  "Edward Hopper":{name:"爱德华·霍普",life:"1882–1967",story:"霍普在纽约和巴黎学习绘画，长期从事插画工作，直到中年才逐渐以油画建立自己的声誉。他擅长描绘空旷街道、旅馆房间和深夜餐馆，将现代生活中的孤独转化为安静而清晰的光线。<br><br>他与妻子乔·诺维森共同生活和工作，许多作品的模特与评论记录都与两人的日常密切相关。霍普本人很少解释画面的故事，正是这种沉默留下了作品持久的开放性。"},
  "Pieter Bruegel the Elder":{name:"老彼得·勃鲁盖尔",life:"约1525–1569",story:"勃鲁盖尔以乡村生活、季节劳动和民间节庆闻名。他曾前往意大利学习，却没有照搬古典风格，而是把阿尔卑斯山的旅行经验、北方村镇和普通人的日常重新组织进画面。<br><br>他的作品常采用高视点和宽阔全景，在大量人物活动中同时容纳季节、劳动、天气与社会观察。"},
  "Gustav Klimt":{name:"古斯塔夫·克里姆特",life:"1862–1918",story:"克里姆特早年接受建筑装饰训练，后来与维也纳学院传统决裂，参与创立维也纳分离派。他把绘画、壁画和装饰设计结合起来，以金箔、几何纹样和丰富的平面结构塑造独特的视觉语言。<br><br>他很少公开谈论作品含义，更强调让画面直接产生感受。肖像中的人物、珠宝与装饰背景因此常常处于现实与象征之间。"},
  "Hans Holbein the Younger":{name:"小汉斯·霍尔拜因",life:"约1497–1543",story:"霍尔拜因在德国和瑞士接受训练，后来定居英国并成为亨利八世的宫廷画家。他以极其准确的肖像观察记录人物的服饰、身份和表情，作品同时具有文献价值与心理刻画。<br><br>他还设计首饰、器物和宫廷装饰，说明文艺复兴时期的画家并不只负责架上绘画，而是参与完整的视觉生产。"}
});

Object.assign(ARTIST_BIO,{
  "Gustave Courbet":{name:"古斯塔夫·库尔贝",life:"1819–1877",story:"库尔贝是法国现实主义的重要代表。他拒绝把乡村劳动者和普通人的生活理想化为神话题材，坚持以与历史画同等的尺度描绘当下社会。<br><br>《石工》以两名劳动者和满地碎石构成沉重的日常场景，作品的直接性曾被视为对学院传统的挑战。"},
  "Ilya Repin":{name:"伊里亚·列宾",life:"1844–1930",story:"列宾是俄国现实主义画家与巡回展览运动的重要人物。他长期观察普通人的劳动、迁徙与社会处境，把肖像观察和历史叙事结合起来。<br><br>《伏尔加河上的纤夫》源于他对河岸纤夫的实地观察，队列、绳索和疲惫的身体共同构成对劳动制度的现实记录。"},
  "Honoré Daumier":{name:"奥诺雷·杜米埃",life:"1808–1879",story:"杜米埃既是画家、版画家，也是尖锐的社会观察者。他常以夸张但富有同情心的形体描绘巴黎市民、法庭人物和公共交通中的普通人。<br><br>《三等车厢》把拥挤、疲惫和沉默放在画面中心，使一节普通车厢成为现代社会阶层经验的缩影。"},
  "Winslow Homer":{name:"温斯洛·霍默",life:"1836–1910",story:"霍默从插画和战地报道起步，后来转向描绘美国乡村、海岸与日常生活。他善于以清晰的构图和结实的色块捕捉户外动作，让普通人的活动具有纪念碑般的可读性。<br><br>《抢球》描绘乡村学校男孩牵手奔跑的游戏瞬间，轻快动作背后保留了美国乡村生活的真实尺度。"},
  "Toshusai Sharaku":{name:"东洲斋写乐",life:"活动于约1794–1795",story:"东洲斋写乐在江户剧场文化中留下了一批极具辨识度的役者大首绘。关于他的真实身份和生平仍有争论，但这些作品以夸张而精准的表情、手势和服饰，把歌舞伎舞台的瞬间张力压缩到一张纸面上。"},
  "Tsukioka Yoshitoshi":{name:"月冈芳年",life:"1839–1892",story:"月冈芳年是日本晚期浮世绘的重要画家，擅长历史、武者和怪异题材。他在传统木版画的线刻与套色基础上强化了动作、戏剧光线和视觉冲击，连接了江户版画传统与明治时期的新图像文化。<br><br>《金太郎捕鲤鱼》以儿童英雄与巨鲤的对抗组织纵向动势，水纹、鱼鳞和人物身体共同构成一条贯穿画面的力量线。"},
  "Pierre-Auguste Renoir":{name:"皮埃尔-奥古斯特·雷诺阿",life:"1841–1919",story:"雷诺阿是法国印象派的重要画家，擅长以明亮色彩、松散笔触和人物之间的亲密关系描绘现代生活。他关注光线落在皮肤、衣料和户外空气上的瞬间变化，剧院、舞会和城市休闲因此成为他反复探索的题材。<br><br>《包厢》《布吉瓦尔之舞》和《伞》分别把观看、舞蹈与街头人群组织成不同的印象派节奏。"},
  "Berthe Morisot":{name:"贝尔特·莫里索",life:"1841–1895",story:"贝尔特·莫里索是印象派核心成员之一。她以轻快而富有触感的笔触描绘家庭、花园、船上活动和女性日常，将未完成感转化为光线与空气的真实经验。<br><br>她长期参加印象派展览，在快速变化的色层中保留人物姿态和空间关系的清晰度。"},
  "Mary Cassatt":{name:"玛丽·卡萨特",life:"1844–1926",story:"玛丽·卡萨特是活跃于法国印象派圈子的美国画家，尤其擅长描绘儿童、母女关系和室内生活。她借鉴日本版画的裁切与平面构图，又以印象派的色彩和笔触处理织物、家具与人物姿态。<br><br>《蓝色扶手椅上的小女孩》把儿童的松弛姿势放在一组蓝色椅子构成的室内节奏中。"}
});

const WORKS = [{"zh":"构成八号奶蛙","en":"Composition VIII Milk Frog","url":"https://router-files.neta.art/files/20a862e1-d8ae-4ac7-b705-01f2bb26a64a/d1ff0fbd-6c4b-4a5e-8a26-46ea51687613.jpg","era":"modern","orig":"仿 构成 VIII","artist":"Wassily Kandinsky","year":"1923","story":"康定斯基1923年的《构成 VIII》以圆、三角、网格、弧线和斜线组织出近似乐谱的视觉节奏。这一改编没有把完整角色贴在画面上，而是将奶蛙拆解为嵌入构图的眼形圆环、黄赭与乳白碎片、短口线和深色末端；画面先保持康定斯基的抽象秩序，随后才显出奶蛙。","originalImage":"assets/context/works/w01.jpg"},{"zh":"睡莲中的奶蛙","en":"Frog Among Water Lilies","url":"https://router-files.neta.art/files/db494077-952f-4da5-b8dd-7686eb7941d4/50058f95-82e4-4dcf-89c1-409a92af27b1.jpg","era":"impressionism","orig":"仿 睡莲","artist":"Claude Monet","year":"1916","originalImage":"assets/context/monet-waterlilies.jpg","story":"莫奈晚年在吉维尼的花园里挖池、引水、种睡莲，用近三十年反复描绘同一片水面。他要画的不是莲，而是光与倒影在水上的流动，以至于取消了地平线，让观者仿佛悬浮于池上。这批《睡莲》共约250幅，是他在白内障几近失明、又痛失爱妻与长子后完成的，被视为通向抽象艺术的桥梁。"},{"zh":"神奈川冲浪奶蛙","en":"The Great Wave Frog","url":"https://router-files.neta.art/files/5612bc3c-f088-4894-bdc6-6ec84056287d/faae9e15-0297-45aa-90fc-97ca152db9bf.jpg","era":"ukiyoe","orig":"仿 神奈川冲浪里","artist":"Katsushika Hokusai","year":"c. 1831","story":"葛饰北斋的《神奈川冲浪里》约作于1831年，是《富岳三十六景》系列的一幅木版画。巨浪以\"普鲁士蓝\"这种当时新进口的颜料印成，浪爪如利齿般扑向船只，而远处的富士山静默渺小。这幅画随浮世绘流入欧洲，深深影响了梵高、莫奈与德彪西，成为\"日本主义\"浪潮的象征。","originalImage":"assets/context/works/w03.jpg"},{"zh":"三个音乐家奶蛙","en":"The Milk Frog Musicians","url":"https://public.cohub.run/s/157e937b-95da-4c17-add4-f916e37c3574/neta-studio-upload/image_01KZGVXAQDTAQF3BQ6R1DSPQCV.jpg","era":"modern","orig":"仿 三个音乐家","artist":"Pablo Picasso","year":"1921","story":"毕加索以彼此嵌套的平面色块塑造三位演奏者，让人物、乐器和空间像剪贴纸一样互相穿插。这个版本把中央丑角重新组织成奶蛙的识别锚点，同时保留原作合成立体主义的断裂肢体、菱格衣片与压缩空间。","originalImage":"assets/context/works/w05.jpg"},{"zh":"撑阳伞的奶蛙","en":"Frog with a Parasol","url":"https://router-files.neta.art/files/b0147313-53a0-423f-924a-1db5d0c19621/1b2e1bc4-75c1-4632-80f9-c8cca5c3ae57.jpg","era":"impressionism","orig":"仿 撑阳伞的女人","artist":"Claude Monet","year":"1875","story":"《撑阳伞的女人》是莫奈1875年在阿让特伊描绘妻子卡蜜儿与儿子让的户外写生。人物从低处仰视，衣裙与面纱被风掀动，草叶与云影皆是快速的笔触——这正是印象派的核心：捕捉某个转瞬即逝的光线与空气的瞬间。卡蜜儿四年后病逝，画中这抹明媚遂成追忆。","originalImage":"assets/context/works/w06.jpg"},{"zh":"呐喊的奶蛙","en":"The Frog Scream","url":"https://router-files.neta.art/files/b7c6d734-f6d7-4076-a246-adb65223d459/d97df347-d862-4b3d-b283-455439db1e10.jpg","era":"modern","orig":"仿 呐喊","artist":"Edvard Munch","year":"1893","story":"蒙克的《呐喊》作于1893年，灵感来自他某次黄昏散步时\"感到天空突然变得血红\"，一声穿透自然的尖叫向他袭来。扭曲的桥、翻涌的橙红天空与骷髅般的面孔，画的不是听见尖叫，而是那份弥漫的现代性焦虑。它是表现主义的开山之作，蒙克共画了四个版本。","originalImage":"assets/context/works/w07.jpg"},{"zh":"星月奶蛙夜","en":"The Starry Frog Night","url":"https://router-files.neta.art/files/441e3c6c-0790-4f67-af81-81ce3e5288ee/3e95ae62-0fcf-4701-990f-8680f0337980.jpg","era":"postimpressionism","orig":"仿 星月夜","artist":"Vincent van Gogh","year":"1889","story":"梵高1889年在圣雷米的圣保罗精神疗养院中，凭记忆与想象画下这片旋涡般的夜空。柏树如火焰般刺向星群，村庄安睡于山谷——现实中他的病房并无此景。画作生前几乎无人问津，如今却成为最广为人知的画之一，那些翻卷的星流甚至被后人拿来比附湍流的物理。","originalImage":"assets/context/works/w08.jpg"},{"zh":"米洛斯的奶蛙","en":"Venus de Milo Frog","url":"https://router-files.neta.art/files/dfcc7219-5912-4a4b-8692-4e1a7c285632/8cbfffda-c93c-4e34-924d-5a1f8468936b.jpg","era":"ancient","orig":"仿 米洛斯的维纳斯","artist":"Alexandros of Antioch","year":"c. 130 BCE","story":"《米洛斯的维纳斯》约作于公元前130年，1820年由一位农夫在爱琴海米洛斯岛上掘出。这尊希腊化时期的大理石像被认为是爱与美的女神阿芙洛狄忒，双臂在出土时或之后遗失，反而留下无尽想象。它现藏卢浮宫，是古典理想美的化身。","originalImage":"assets/context/works/w10.jpg"},{"zh":"哥特奶蛙圣母院","en":"Notre-Dame in Frog Gothic","url":"https://router-files.neta.art/files/8de94e33-a81f-46af-9403-df18104a50cc/7c53c1de-fee5-4174-b1f7-76c3f5208994.jpg","era": "gothic","orig":"仿 巴黎圣母院","artist":"Gothic Architecture","year":"c. 1345","story":"巴黎圣母院始建于1163年，历时近两百年方成，是哥特建筑的杰作。飞扶壁将穹顶的重量向外导引，让高墙得以镂空为巨大的玫瑰花窗，阳光透过彩色玻璃洒入中殿。2019年的大火烧毁了尖塔与木构屋顶，全球随即展开修复。","originalImage":"assets/context/works/w11.jpg"},{"zh":"圣母子与奶蛙","en":"Madonna and Frog Child","url":"https://router-files.neta.art/files/1ecba054-2183-4b7f-96a1-ae9c95090b79/772af387-8105-412b-a662-2349b4eb5b70.jpg","era":"medieval","orig":"仿 宝座圣母像","artist":"Cimabue","year":"c. 1280","story":"契马布埃约1280年的《宝座圣母像》属拜占庭向文艺复兴过渡的时代。金色背景、扁平的空间与庄严的正面姿态仍是中世纪程式，但圣母衣褶间已透出一丝对体积与柔和的追求。契马布埃据传是乔托的老师，而乔托将把绘画彻底推向写实。","originalImage":"assets/context/works/w12.jpg"},{"zh":"阿尔塔米拉的奶蛙","en":"Milk Frogs of Altamira","url":"https://router-files.neta.art/files/4ccf7852-16e9-4169-914f-2436c6e23138/2b87318a-7b74-432d-8649-fbf810c572e0.jpg","era":"prehistoric","orig":"仿 阿尔塔米拉洞窟壁画","artist":"Unknown","year":"c. 36,000 BCE","story":"西班牙阿尔塔米拉洞窟的壁画约作于公元前3.6万至1.4万年间，1879年由一位业余考古学家的小女儿在洞中抬头发现。天顶上以赭红与黑炭绘满野牛，古人巧妙利用岩石的天然鼓起来塑造牛背的体积，栩栩如生。起初学界拒不相信史前人有此技艺，斥之为伪作，直到多年后才获正名，被誉为\"史前的西斯廷\"。","originalImage":"assets/context/works/w14.jpg"},{"zh":"最后的晚餐奶蛙","en":"The Frog Supper","url":"https://router-files.neta.art/files/8c3bd824-68fd-44bc-93a3-cca3f85d2bb7/167088ba-ccfe-4cfd-b4a9-a4d320689e2e.jpg","era":"renaissance","orig":"仿 最后的晚餐","artist":"Leonardo da Vinci","year":"1495–1498","story":"达·芬奇约1495至1498年为米兰圣玛利亚感恩教堂餐厅所作的《最后的晚餐》，凝固了耶稣说出\"你们中有一人要出卖我\"的刹那，十二门徒各现惊愕、疑惑、愤怒。他大胆采用干壁画法以求细节，却使颜料很快剥落，此后数百年屡经修复。","originalImage":"assets/context/works/w15.jpg"},{"zh":"创造奶蛙","en":"The Creation of Frog","url":"https://router-files.neta.art/files/2dd3d1aa-eeb1-4bcf-88c5-7791631bb2ab/1f031e8f-e028-43e1-a890-0aa1c2cc2ed0.jpg","era":"renaissance","orig":"仿 创造亚当","artist":"Michelangelo","year":"1508–1512","story":"米开朗基罗1508至1512年独自仰卧脚手架，画满西斯廷礼拜堂的天顶。《创造亚当》中，上帝与亚当的指尖将触未触，那道缝隙里蓄满了赋予生命的张力。有解剖学者指出，上帝身后的红袍轮廓酷似人类大脑的剖面。","originalImage":"assets/context/works/w16.jpg"},{"zh":"雅典学院的核心奶蛙","en":"Frog at the School of Athens","url":"https://router-files.neta.art/files/5bb77e8c-9218-4a3c-b03a-121524a020db/1e8697ae-7f52-44b3-938e-c62186512dd6.jpg","era":"renaissance","orig":"仿 雅典学院（中央）","artist":"Raphael","year":"1509–1511","story":"拉斐尔1509至1511年为梵蒂冈签字厅所绘的《雅典学院》，把跨越数百年的古代哲人聚于一堂：中央柏拉图指天、亚里士多德指地，象征理念与现实之争。据信画中许多面孔借用了同代人——沉思的赫拉克利特便是米开朗基罗的模样。","originalImage":"assets/context/works/w17.jpg"},{"zh":"岩画手印奶蛙","en":"Milk Frog of Cueva de las Manos","url":"https://router-files.neta.art/files/28f1cb22-97f8-48a2-92dc-d69f915577cb/9322c6a5-d83f-4ef8-8d3e-d42d3029bb76.jpg","era":"prehistoric","orig":"仿 手印洞岩画","artist":"Unknown","year":"c. 7,300 BCE","story":"阿根廷巴塔哥尼亚的\"手洞\"岩画约作于公元前7300年，绵延数千年。史前人将手贴壁，口含颜料管吹喷，留下数百个镂空的手印——绝大多数是左手，因多数人用右手持管。这是人类最早的\"我曾在此\"的印记之一。","originalImage":"assets/context/works/w18.jpg"},{"zh":"塞拉山奔跑奶蛙","en":"Running Milk Frog of Sierra","url":"https://router-files.neta.art/files/22623f6e-254a-4748-ae5e-d52a19d352e8/0907b219-d92b-4e7d-8911-bb541dc825af.jpg","era":"prehistoric","orig":"仿 塞拉山岩画","artist":"Unknown","year":"c. 5,500 BCE","story":"西班牙地中海沿岸的岩画（约公元前5500年及以后）以小巧灵动的人形著称，描绘狩猎、采蜜与舞蹈。与洞窟深处的巨兽不同，它们画在开敞的岩棚上，充满叙事与群体动作，记录了从狩猎向农耕过渡的生活。","originalImage":"assets/context/works/w20.jpg"},{"zh":"石阵仪式奶蛙","en":"Ritual Milk Frog at Stonehenge","url":"https://router-files.neta.art/files/d7c1eed0-e37e-4cff-a1af-7766bc96538f/54558fe5-13cd-42e0-98cb-bcef367f2871.png","era":"prehistoric","orig":"仿 巨石阵冬至仪式","artist":"Unknown","year":"c. 2,500 BCE","story":"英格兰的巨石阵约建于公元前2500年，巨大的砂岩由数十公里外运来立起。其主轴精确对准夏至日出与冬至日落，说明它既是仪式圣所，也是观测天时的历法装置。建造者如何搬运并竖起这些数十吨的巨石，至今仍是谜。","originalImage":"assets/context/works/w21.jpg"},{"zh":"岩刻游行奶蛙","en":"Procession Milk Frog of Valcamonica","url":"https://router-files.neta.art/files/95aabdf0-0282-44bb-ba29-496fad66afd4/dc8680f1-7e98-4e43-b0a4-971664253de7.png","era":"prehistoric","orig":"仿 卡莫尼卡岩刻","artist":"Unknown","year":"c. 1,000 BCE","story":"意大利卡莫尼卡山谷的岩刻绵延约八千年，多达数十万幅，是欧洲规模最大的史前岩刻群。人们在冰川磨光的岩面上凿刻战士、耕作、房屋与仪式游行，如同一部刻在石头上的漫长编年史。","originalImage":"assets/context/works/w22.jpg"},{"zh":"雪中桥奶蛙","en":"Milk Frog on a Snow Bridge","url":"https://router-files.neta.art/files/a8e6d0a1-de6c-424b-8cb1-02e8f6e7cf5b/b4ffea37-78d5-4d08-aec4-a75953d3f5ea.png","era":"ukiyoe","orig":"仿 广重雪中桥","artist":"Utagawa Hiroshige","year":"c. 1857","story":"广重的雪景以靛蓝、灰白和桥上微小的行旅人物制造寂静的纵深。裹在冬衣中的奶蛙沿桥而行，成为雪幕中唯一温暖的色点。","originalImage":"assets/context/works/w28.jpg"},{"zh":"甲州石班泽奶蛙","en":"Kajikazawa in Kai Province Milk Frog","url":"https://router-files.neta.art/files/6e2ca851-23b4-4db2-b2f5-a20a314c1ee8/fa8ec236-3605-4d1f-8f6a-f6eb9db8b4d3.png","era":"ukiyoe","orig":"仿 甲州石班泽","artist":"Katsushika Hokusai","year":"c. 1831","story":"葛饰北斋《甲州石班泽》的历史名作改编，保留富士山、水平水纹、岩岸与垂钓人物关系；采用成熟态奶蛙。","originalImage":"assets/context/works/ukiyoe-kajikazawa.jpg"},{"zh":"大桥安宅骤雨奶蛙","en":"Sudden Shower over Shin-Ohashi Bridge Milk Frog","url":"https://router-files.neta.art/files/876a9d08-c248-4451-8c5a-d9b4ff1ab2dc/e4c8a1b5-af38-4672-87da-071b8c785c3b.png","era":"ukiyoe","orig":"仿 大桥安宅骤雨","artist":"Utagawa Hiroshige","year":"1857","story":"歌川广重《大桥安宅骤雨》的历史名作改编，保留斜向桥梁、密集雨线、伞阵与河面；采用成熟态奶蛙。","originalImage":"assets/context/works/ukiyoe-shower.jpg"},{"zh":"三代目大谷鬼次奶蛙","en":"Otani Oniji III Milk Frog","url":"https://router-files.neta.art/files/f91abb2a-0b9a-4e6f-aebe-ff57e91dc6d8/0fa15b3e-b036-4557-a73a-42ca86990de5.png","era":"ukiyoe","orig":"仿 三代目大谷鬼次之奴江户兵卫","artist":"Toshusai Sharaku","year":"1794","story":"东洲斋写乐《三代目大谷鬼次之奴江户兵卫》的历史名作改编，保留大首绘裁切、条纹衣装、双手前伸与戏剧性斜视；采用成熟态奶蛙。","originalImage":"assets/context/works/ukiyoe-sharaku.jpg"},{"zh":"泷夜叉姬与骷髅妖怪奶蛙","en":"Takiyasha the Witch and the Skeleton Spectre Milk Frog","url":"https://router-files.neta.art/files/1090068f-09df-4cc5-85e5-f8b658636c68/f1a013a0-5632-4a0c-9f4a-d7c5f534080d.png","era":"ukiyoe","orig":"仿 泷夜叉姬与骷髅妖怪","artist":"Utagawa Kuniyoshi","year":"c. 1844–1846","story":"歌川国芳《泷夜叉姬与骷髅妖怪》的历史名作改编，保留完整三联画、左栏卷轴、中央武者与跨栏骷髅；采用成熟态奶蛙。","originalImage":"assets/context/works/ukiyoe-takiyasha.jpg"},{"zh":"金太郎捕鲤鱼奶蛙","en":"Kintaro Captures the Carp Milk Frog","url":"https://router-files.neta.art/files/dc725658-12ea-4b5a-8767-2aea05f8c077/e3c4edaf-3b0a-41dd-81c9-d3e27f476308.png","era":"ukiyoe","orig":"仿 金太郎捕鲤鱼","artist":"Tsukioka Yoshitoshi","year":"1885","story":"月冈芳年《金太郎捕鲤鱼》的历史名作改编，保留巨鲤斜向跃动、激流、上方人物与纵向水纹；采用幼态奶蛙。","originalImage":"assets/context/works/ukiyoe-kintaro.jpg"},{"zh":"干草堆奶蛙","en":"Milk Frog Haystacks","url":"https://router-files.neta.art/files/bdaa075e-65aa-4414-be4b-63ffaa2d5b14/52ac175f-35f1-4c97-bcbb-4815f2c2ade9.png","era":"impressionism","orig":"仿 干草堆","artist":"Claude Monet","year":"1890–1891","story":"莫奈的《干草堆》系列在同一组乡村景物中追踪季节、天气与时刻变化。这个版本保留互补色的振动与暮光中的草垛，让一只小小的奶蛙农夫成为光色秩序中的尺度。","originalImage":"assets/context/works/w30.jpg"},{"zh":"拾穗者奶蛙","en":"Milk Frog Gleaners","url":"https://router-files.neta.art/files/4bc87e21-aac8-4cf6-9e07-92914e9d894b/2c000d1b-076c-4b80-9821-2637cc525a6b.png","era":"realism","orig":"仿 拾穗者","artist":"Jean-François Millet","year":"1857","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-gleaners.jpg"},{"zh":"梅杜萨之筏奶蛙","en":"Milk Frog Raft of the Medusa","url":"https://router-files.neta.art/files/9c018a9a-42bf-42a8-b44f-ea6db6aaf5c6/678faed6-daf6-41c1-8b11-d652952bbd4b.png","era":"romanticism","orig":"仿 梅杜萨之筏","artist":"Théodore Géricault","year":"1819","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-medusa.jpg"},{"zh":"雨天的巴黎街道奶蛙","en":"Milk Frog Paris Street; Rainy Day","url":"https://router-files.neta.art/files/d2c5a4a3-1eb6-48e0-88da-7024b831324c/14c6323c-4be5-4054-b2f9-375c01dbec98.png","era":"impressionism","orig":"仿 雨天的巴黎街道","artist":"Gustave Caillebotte","year":"1877","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-paris-rain.jpg"},{"zh":"包厢奶蛙","en":"The Theatre Box Milk Frog","url":"https://router-files.neta.art/files/c87c1cae-9242-47f7-89eb-b010456e3dc7/56ce19e5-162c-406b-9cc4-a779b849cbc9.png","era":"impressionism","orig":"仿 包厢","artist":"Pierre-Auguste Renoir","year":"1874","story":"皮埃尔-奥古斯特·雷诺阿《包厢》的历史名作改编，保留前景剧院包厢人物、后方男子、望远镜、栏杆与暗色剧场背景；采用成熟态奶蛙。","originalImage":"assets/context/works/impressionism-renoir-loge.jpg"},{"zh":"布吉瓦尔之舞奶蛙","en":"Dance at Bougival Milk Frog","url":"https://router-files.neta.art/files/dbe03078-c8e2-49cd-95e0-51d73e99140e/91c9ee23-6bfb-49e6-9dc5-32031926f722.png","era":"impressionism","orig":"仿 布吉瓦尔之舞","artist":"Pierre-Auguste Renoir","year":"1883","story":"雷诺阿《布吉瓦尔之舞》的历史名作改编，保留双人拥舞、手臂环抱、草地舞场与背景人群；采用成熟态奶蛙。","originalImage":"assets/context/works/impressionism-renoir-bougival.jpg"},{"zh":"伞奶蛙","en":"The Umbrellas Milk Frog","url":"https://router-files.neta.art/files/3366ece5-6e48-43d5-9a29-51e74db0a485/ac5b153c-4d16-476f-b76c-47f7574bf8cd.png","era":"impressionism","orig":"仿 伞","artist":"Pierre-Auguste Renoir","year":"约1881–1886","story":"雷诺阿《伞》的历史名作改编，保留重叠伞群、前景人物、儿童与湿润街景；采用成熟态奶蛙。","originalImage":"assets/context/works/impressionism-renoir-umbrellas.jpg"},{"zh":"蓝色扶手椅上的小女孩奶蛙","en":"Little Girl in a Blue Armchair Milk Frog","url":"https://router-files.neta.art/files/f7822141-09a8-4bef-a032-134e0978b363/d70d431f-a1a9-4952-a3d5-23dcfd8406fc.png","era":"impressionism","orig":"仿 蓝色扶手椅上的小女孩","artist":"Mary Cassatt","year":"1878","story":"玛丽·卡萨特《蓝色扶手椅上的小女孩》的历史名作改编，保留斜躺的儿童姿势、蓝色扶手椅、室内空间与小狗；采用幼态奶蛙。","originalImage":"assets/context/works/impressionism-cassatt-blue-armchair.jpg"},{"zh":"沉睡的吉普赛人奶蛙","en":"The Sleeping Milk Frog","url":"https://router-files.neta.art/files/93c7e76a-b709-45a6-accc-ec47e55d0e9b/5f9da0d4-06c8-416e-912f-5acb65f0fdd0.png","era":"modern","orig":"仿 沉睡的吉普赛人","artist":"Henri Rousseau","year":"1897","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。"},{"zh":"奥菲莉亚奶蛙","en":"Ophelia Milk Frog","url":"https://router-files.neta.art/files/0d891dd3-9455-4f35-b250-ce142e223e8f/80e8c443-002b-47f8-a048-22fcf06e8350.png","era":"pre-raphaelite","orig":"仿 奥菲莉亚","artist":"John Everett Millais","year":"1851–1852","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-ophelia.jpg"},{"zh":"1808年5月3日奶蛙","en":"The Third of May Milk Frog","url":"https://router-files.neta.art/files/590e4c58-560f-4454-b36c-9997f2ab1ade/ed0856cd-f09c-45f8-8cac-e6c1fd070216.png","era":"romanticism","orig":"仿 1808年5月3日","artist":"Francisco Goya","year":"1814","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-may3.jpg"},{"zh":"吹笛少年奶蛙","en":"The Fifer Milk Frog","url":"https://router-files.neta.art/files/7d162de6-02c8-414c-9494-b8848c14f1e2/e0b4482f-1b7e-44fa-b24b-f7742e32a1fe.png","era": "realism","orig":"仿 吹笛少年","artist":"Édouard Manet","year":"1866","story":"爱德华·马奈《吹笛少年》的历史名作改编，保留平涂灰底、黑衣金扣、红裤、白腰带与军帽流苏，双手持笛姿势不变；采用幼态奶蛙。","originalImage":"assets/context/works/war-fifer.jpg"},{"zh": "荷拉斯兄弟之誓奶蛙", "en": "Oath of the Horatii Milk Frog", "url": "https://router-files.neta.art/files/cec6832d-c600-4446-89f3-2aaeefbce09d/5a764b55-c8ef-449f-853b-e495b351b65f.png", "era": "neoclassicism", "orig": "仿 荷拉斯兄弟之誓", "artist": "Jacques-Louis David", "year": "1784", "story": "雅克-路易·大卫《荷拉斯兄弟之誓》的历史名作改编，保留石拱背景、三兄弟伸手、父亲举剑与右侧哀恸女性群像；采用成熟态奶蛙。", "originalImage": "assets/context/works/war-horatii.jpg"},{"zh": "雷卡米埃夫人奶蛙", "en": "Madame Récamier Milk Frog", "url": "https://router-files.neta.art/files/f78f56d9-3c71-4ae9-954d-603ef6be7482/ce281fcc-dea5-47c5-b33b-919e483fdf30.png", "era": "neoclassicism", "orig": "仿 雷卡米埃夫人", "artist": "Jacques-Louis David", "year": "1800", "story": "雅克-路易·大卫《雷卡米埃夫人》的历史名作改编，保留弧形贵妃榻、白色高腰长裙、落地油灯与素墙；卧姿贵妇换为成熟态奶蛙，一手优雅扬起，神态安详直视观者。", "originalImage": "assets/context/works/original-recamier.jpg"},{"zh": "翻越阿尔卑斯奶蛙", "en": "Napoleon Crossing the Alps Milk Frog", "url": "https://router-files.neta.art/files/8617b973-4155-4b64-83cd-cd3f35b809c6/9314be59-d603-47ba-bf85-10567179b60f.png", "era": "neoclassicism", "orig": "仿 翻越阿尔卑斯", "artist": "Jacques-Louis David", "year": "1801", "story": "雅克-路易·大卫《拿破仑翻越阿尔卑斯山圣伯纳隘口》的历史名作改编，保留昂首跃起的战马、蓝金军装、双角帽、斗篷与 BONAPARTE 刻石；骑手换为成熟态奶蛙，手指山顶，气定神闲。", "originalImage": "assets/context/works/original-napoleon.jpg"},{"zh": "苏格拉底之死奶蛙", "en": "The Death of Socrates Milk Frog", "url": "https://router-files.neta.art/files/bc3adffd-6389-4ae2-a7b8-8f751f7e6be1/79773946-e353-41ba-b9a8-2b83ba4492e4.png", "era": "neoclassicism", "orig": "仿 苏格拉底之死", "artist": "Jacques-Louis David", "year": "1787", "story": "雅克-路易·大卫《苏格拉底之死》的历史名作改编，保留石牢、举指问天的手势、红衣侍者递毒杯与两侧恸哭门徒；苏格拉底换为成熟态奶蛙，目光坚定向上。", "originalImage": "assets/context/works/original-socrates.jpg"},{"zh": "贝尔坦先生奶蛙", "en": "Portrait of Monsieur Bertin Milk Frog", "url": "https://router-files.neta.art/files/90755386-e87b-4bc7-a7ec-d94f4a2bf296/2ca24563-5a14-459e-a83e-6081eecae3cd.png", "era": "neoclassicism", "orig": "仿 贝尔坦先生肖像", "artist": "Jean-Auguste-Dominique Ingres", "year": "1832", "story": "安格尔《路易-弗朗索瓦·贝尔坦先生肖像》的历史名作改编，保留坐姿重心、黑外套白领巾、双手放大腿与希腊回纹墙裙；报业大亨换为成熟态奶蛙，目光坚定直视观者。", "originalImage": "assets/context/works/original-bertin.jpg"},{"zh": "视察雅法疫病院奶蛙", "en": "Bonaparte Visiting the Plague Victims of Jaffa Milk Frog", "url": "https://router-files.neta.art/files/7749027e-4cc0-48cb-90a2-b7894ec06c0f/3f255dcb-1799-4da8-a9c4-e3f8fbd1a761.png", "era": "neoclassicism", "orig": "仿 拿破仑视察雅法疫病院", "artist": "Antoine-Jean Gros", "year": "1804", "story": "格罗《拿破仑视察雅法疫病院》的历史名作改编，保留摩尔式拱厅、病员群像与远处的雅法城景；统帅换为成熟态奶蛙，伸手抚慰跪地病员。", "originalImage": "assets/context/works/original-jaffa.jpg"},{"zh": "贝利撒留受施奶蛙", "en": "Belisarius Receiving Alms Milk Frog", "url": "https://router-files.neta.art/files/932790b8-9bf5-403b-89f5-e558e3fbf2cd/8925e77e-244c-432c-860a-8331983e137a.png", "era": "neoclassicism", "orig": "仿 贝利撒留受施", "artist": "Jacques-Louis David", "year": "1781", "story": "大卫《贝利撒留受施》的历史名作改编，保留红披风士兵的惊愕、盲眼老将受施、立柱与远景方尖碑；引路童子换为幼态奶蛙，牵着老将的手引路。", "originalImage": "assets/context/works/original-belisarius.jpg"},{"zh": "马拉之死奶蛙", "en": "The Death of Marat Milk Frog", "url": "https://router-files.neta.art/files/30ddd6c0-a225-4dc2-a78c-235a9fb6ed3b/a8584880-b32e-42d3-b5f9-93e39d8a517d.png", "era": "neoclassicism", "orig": "仿 马拉之死", "artist": "Jacques-Louis David", "year": "1793", "story": "大卫《马拉之死》的历史名作改编，保留浴缸、白布缠头、持信与落笔的手、地上匕首与刻着 À MARAT 的木箱；马拉换为成熟态奶蛙，垂目长眠，庄重如初。", "originalImage": "assets/context/works/original-marat.jpg"},{"zh": "秋千奶蛙", "en": "The Swing Milk Frog", "url": "https://router-files.neta.art/files/07884dd1-0f6e-4c8e-a70f-9cc8c76aad66/aee062cd-54c0-4490-beb5-81cab1347159.png", "era": "rococo", "orig": "仿 秋千", "artist": "Jean-Honoré Fragonard", "year": "1767", "story": "弗拉戈纳尔《秋千》的历史名作改编，保留密林光斑、踢鞋瞬间、拉绳老仆、仰卧求婚者与丘比特雕像；秋千上的少女换为成熟态奶蛙，粉裙蕾丝帽，回眸俏皮。", "originalImage": "assets/context/works/original-swing.jpg"},{"zh": "画家与她的女儿奶蛙", "en": "Self-Portrait with Her Daughter Milk Frog", "url": "https://router-files.neta.art/files/2c4b8e03-f216-49d3-be2e-4507149930b1/75077c62-8216-4872-8787-ea0aea10661d.png", "era": "rococo", "orig": "仿 画家与她的女儿", "artist": "Élisabeth Vigée Le Brun", "year": "1786", "story": "维热·勒布伦《画家与她的女儿朱莉》的历史名作改编，保留墨绿沙发、白裙蓝绸袖与母亲的环抱；女儿朱莉换为幼态奶蛙，小手托脸，依偎母亲怀中。", "originalImage": "assets/context/works/original-lebrun.jpg"},{"zh": "读书少女奶蛙", "en": "A Young Girl Reading Milk Frog", "url": "https://router-files.neta.art/files/8bdc5d39-4345-49ab-baf2-d02c25120ba9/92c2165f-8388-40eb-878c-24bb624c287d.png", "era": "rococo", "orig": "仿 读书少女", "artist": "Jean-Honoré Fragonard", "year": "约1769", "story": "弗拉戈纳尔《读书少女》的历史名作改编，保留明黄长裙、白色蕾丝领口、紫色蝴蝶结与紫粉靠垫；少女换为成熟态奶蛙，侧坐窗台捧读红皮书，神色专注。", "originalImage": "assets/context/works/original-reader.jpg"},{"zh": "拿陀螺的男孩奶蛙", "en": "Boy with a Top Milk Frog", "url": "https://router-files.neta.art/files/25133efd-701e-4b59-876c-1ad0eccc3578/e0f57016-327f-4e06-88e1-eaa8af8f0de3.png", "era": "rococo", "orig": "仿 拿陀螺的男孩", "artist": "Jean-Baptiste-Siméon Chardin", "year": "1738", "story": "夏尔丹《拿陀螺的男孩》的历史名作改编，保留伏案俯视陀螺的专注姿态与桌面蓝书、墨水羽毛笔、卷轴和半开抽屉；男孩换为幼态奶蛙，穿棕外套蓝背心，目不转睛。", "originalImage": "assets/context/works/original-top.jpg"},{"zh": "小丑吉尔奶蛙", "en": "Pierrot (Gilles) Milk Frog", "url": "https://router-files.neta.art/files/c07a503c-8938-49fc-b28a-eacc74ad98c8/eebd88c7-b401-4543-bdd6-0353f6a0d0ea.png", "era": "rococo", "orig": "仿 小丑吉尔（皮埃罗）", "artist": "Antoine Watteau", "year": "约1718–1719", "story": "华托《小丑吉尔》的历史名作改编，保留耸立中央的白色皮埃罗戏服、棕檐帽、粉缎带鞋与驴、面具人物和红衣人组；小丑换为成熟态奶蛙，双手垂立，神色木然。", "originalImage": "assets/context/works/original-gilles.jpg"},{"zh": "梅兹坦奶蛙", "en": "Mezzetin Milk Frog", "url": "https://router-files.neta.art/files/253fea17-ef05-4b92-ac20-22e1f4bfaf9d/1db24f5f-99ad-4b95-ad2c-edb395913aac.png", "era": "rococo", "orig": "仿 梅兹坦", "artist": "Antoine Watteau", "year": "约1718–1720", "story": "华托《梅兹坦》的历史名作改编，保留条纹戏服、粉帽、石凳与雾园雕像；弹琴歌唱的喜剧演员换为成熟态奶蛙，仰头而歌，指拨琴弦。", "originalImage": "assets/context/works/original-mezzetin.jpg"},{"zh": "破壶奶蛙", "en": "The Broken Pitcher Milk Frog", "url": "https://router-files.neta.art/files/9e8b552f-b298-4e8a-b160-b3141868d4ec/8b042d1e-d63b-41b8-b6aa-2879e72bcabb.png", "era": "rococo", "orig": "仿 破壶", "artist": "Jean-Baptiste Greuze", "year": "1773", "story": "格勒兹《破壶》的历史名作改编，保留椭圆构图、白裙玫瑰、发带、破壶与暗瓮；天真少女换为成熟态奶蛙，怀抱破壶直视观者。", "originalImage": "assets/context/works/original-pitcher.jpg"},{"zh": "肥皂泡奶蛙", "en": "Soap Bubbles Milk Frog", "url": "https://router-files.neta.art/files/9c3d8408-090b-4e68-acc1-f437aab8d057/b7026ae9-2b57-4428-b42f-e4f3ca548135.png", "era": "rococo", "orig": "仿 肥皂泡", "artist": "Jean-Baptiste-Siméon Chardin", "year": "约1733–1734", "story": "夏尔丹《肥皂泡》的历史名作改编，保留石窗台、皂液杯、麦秆与悬空的肥皂泡；吹泡男孩换为幼态奶蛙，鼓着腮帮专注吹气。", "originalImage": "assets/context/works/original-soap.jpg"},{"zh": "门闩奶蛙", "en": "The Lock Milk Frog", "url": "https://router-files.neta.art/files/b6b6abe5-62e9-4e0d-ad2e-1532788ad77e/319a8bac-3858-4cf8-9ed1-ab550b6bcabd.png", "era": "rococo", "orig": "仿 门闩", "artist": "Jean-Honoré Fragonard", "year": "约1777", "story": "弗拉戈纳尔《门闩》的历史名作改编，保留插闩回望的男子、深红床帐、桌上的苹果与强烈明暗；卧姿女子换为成熟态奶蛙，一手举向头侧，娇嗔后仰。", "originalImage": "assets/context/works/original-bolt.jpg"},{"zh": "跳舞的卡玛戈奶蛙", "en": "La Camargo Dancing Milk Frog", "url": "https://router-files.neta.art/files/b61e93fc-405c-4729-a7fc-ca73ec3ab0ba/69209bbc-dab3-4649-99fe-e2413f908731.png", "era": "rococo", "orig": "仿 跳舞的卡玛戈", "artist": "Nicolas Lancret", "year": "约1730", "story": "朗克雷《跳舞的卡玛戈》的历史名作改编，保留白裙花环、红衣舞伴、旁观乐手与树影花园；名伶卡玛戈换为成熟态奶蛙，单足点地，双臂舒展。", "originalImage": "assets/context/works/original-camargo.jpg"},{"zh": "前线的俘虏奶蛙", "en": "Prisoners from the Front Milk Frog", "url": "https://router-files.neta.art/files/24164368-847f-40ec-b8b7-80c35d3f2316/9764057e-e4c3-499f-8465-c717319e53cf.png", "era": "realism", "orig": "仿 前线的俘虏", "artist": "Winslow Homer", "year": "1866", "story": "温斯洛·霍默《前线的俘虏》的历史名作改编，保留北军军官与三名俘虏的对峙、树桩荒原地平线与灰色天光；军官与年轻俘虏换为成熟态奶蛙。", "originalImage": "assets/context/works/war-prisoners.jpg"},{"zh": "罗利的童年奶蛙", "en": "The Boyhood of Raleigh Milk Frog", "url": "https://router-files.neta.art/files/03ccf517-7088-45dc-a377-1a7967ed7666/9bd18c81-23fc-46ad-9aa6-1bb60800c50a.png", "era": "pre-raphaelite", "orig": "仿 罗利的童年", "artist": "John Everett Millais", "year": "1870", "story": "约翰·埃弗里特·米莱《罗利的童年》的历史名作改编，保留听故事的双孩、讲述的水手、玩具帆船与海景；两个男孩换为幼态奶蛙。", "originalImage": "assets/context/works/war-raleigh.jpg"},{"zh": "巴拉克拉瓦奶蛙", "en": "Balaclava Milk Frog", "url": "https://router-files.neta.art/files/a78d619e-7bfe-4705-a3cc-3999f70cb5bc/22e2fe21-d724-42fe-82ea-829683d83b2d.png", "era": "realism", "orig": "仿 巴拉克拉瓦", "artist": "Elizabeth Thompson", "year": "1876", "story": "伊丽莎白·汤普森《巴拉克拉瓦》的历史名作改编，保留散兵线牵马队列、倒地人马与阴郁灰调；仅最前一人为成熟态奶蛙，面与嘴线按形象规范精修。", "originalImage": "assets/context/works/war-balaclava.jpg"},{"zh": "吕根岛白垩崖奶蛙", "en": "Chalk Cliffs on Rügen Milk Frog", "url": "https://router-files.neta.art/files/7c25518d-45a1-4aad-a184-a1f41047747a/18c013d4-4e62-429c-9e35-f7e44cedf3f0.png", "era": "romanticism", "orig": "仿 吕根岛的白垩崖", "artist": "Caspar David Friedrich", "year": "约1818", "story": "卡斯帕·大卫·弗里德里希《吕根岛的白垩崖》的历史名作改编，保留双崖框景、红裙女子与俯身男子；右侧站立观海者换为穿深色大衣的成熟态奶蛙背影。", "originalImage": "assets/context/works/grand-cliffs.jpg"},{"zh": "望月的两人奶蛙", "en": "Two Men Contemplating the Moon Milk Frog", "url": "https://router-files.neta.art/files/b58902a1-290a-4af4-9a63-a0e4535c2839/2fe08b28-d399-4672-a21b-f9981fdab82a.png", "era": "romanticism", "orig": "仿 望月的两人", "artist": "Caspar David Friedrich", "year": "约1825–1830", "story": "卡斯帕·大卫·弗里德里希《望月的两人》的历史名作改编，保留老橡树、新月、暮色与拄杖长者；两位观月者均为成熟态奶蛙背影：长者披斗篷拄杖，幼者手搭其肩。", "originalImage": "assets/context/works/rom-twomen.jpg"},{"zh": "吉萨的狮身人面像奶蛙", "en": "The Great Sphinx of Gizeh Milk Frog", "url": "https://router-files.neta.art/files/d2c55cd0-0d81-4f57-bb0e-9fb6cbfb4bfa/06ed4b9d-d96e-40c6-95fb-ff1e36389677.png", "era": "romanticism", "orig": "仿 吉萨的狮身人面像与金字塔", "artist": "David Roberts", "year": "1839", "story": "大卫·罗伯茨《吉萨的狮身人面像与金字塔》的历史名作改编，保留斯芬克斯、金字塔群、驼队与暖沙漠调；前景旅人换为包头巾的成熟态奶蛙，仰望巨像。", "originalImage": "assets/context/works/grand-sphinx.jpg"},{"zh": "卢浮宫废墟的想象图奶蛙", "en": "Imaginary View of the Grande Galerie in Ruins Milk Frog", "url": "https://router-files.neta.art/files/217acfa5-aee3-4c5d-84ba-81ecb4a04341/a890a32a-67b8-4028-8ac0-bbaa85e0d4f5.png", "era": "romanticism", "orig": "仿 卢浮宫大画廊废墟想象图", "artist": "Hubert Robert", "year": "1796", "story": "于贝尔·罗贝尔《卢浮宫大画廊废墟想象图》的历史名作改编，保留破顶画廊、光柱、废墟与雕像群；光柱中的漫游者换为成熟态奶蛙。", "originalImage": "assets/context/works/grand-ruins.jpg"},{"zh": "纳尔尼桥奶蛙", "en": "The Bridge at Narni Milk Frog", "url": "https://router-files.neta.art/files/8b4ae25f-4e8d-4a3d-9f4c-2945b5fcfb84/0de82fe6-a53e-4750-9898-412fe3ce0894.png", "era": "romanticism", "orig": "仿 纳尔尼桥", "artist": "Jean-Baptiste-Camille Corot", "year": "1827", "story": "卡米耶·柯罗《纳尔尼桥》的历史名作改编，保留断拱古桥、河谷、牧人与银绿晨光；前景卧地旅人换为成熟态奶蛙。", "originalImage": "assets/context/works/grand-narni.jpg"},{"zh": "巨石阵黎明奶蛙", "en": "Stonehenge at Dawn Milk Frog", "url": "https://router-files.neta.art/files/7ea133c8-984f-44f2-b91c-0559ba2fa10c/5a53a699-1962-4773-ae44-fd186353fe92.png", "era": "prehistoric", "orig": "仿 巨石阵黎明全景", "artist": "Neolithic Builders", "year": "约公元前2500年", "story": "巨石阵黎明全景的改编，保留剪影石环、雾与霜草、蓝金渐变天空；霜草间加入独自面朝巨石的幼态奶蛙背影。", "originalImage": "assets/context/works/grand-stonehenge.jpg"},{"zh": "海洋边的僧侣奶蛙", "en": "Monk by the Sea Milk Frog", "url": "https://router-files.neta.art/files/78c5a2bd-16ca-4d20-a8ff-3b086863627d/3b037c65-b605-44f7-84e5-7bb631c9f825.png", "era": "romanticism", "orig": "仿 海洋边的僧侣", "artist": "Caspar David Friedrich", "year": "1808–1810", "story": "卡斯帕·大卫·弗里德里希《海洋边的僧侣》的历史名作改编，保留空海、低平地平线与占据画面的云天；沙丘上的僧侣换为长袍背影的成熟态奶蛙。", "originalImage": "assets/context/works/grand-monk.jpg"},{"zh":"自由引导人民奶蛙","en":"Milk Frog Leading the People","url":"https://router-files.neta.art/files/208810ca-c16b-4885-8ff9-31ec2dabfc9e/a3c063d3-8845-4788-8a1a-c66158f002a9.png","era":"romanticism","orig":"仿 自由引导人民","artist":"Eugène Delacroix","year":"1830","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-liberty.jpg"},{"zh":"雾海上的旅人奶蛙","en":"Wanderer above the Sea of Fog Milk Frog","url":"https://router-files.neta.art/files/3cc36334-dcdc-4ef3-921d-718906fc5376/f0111305-bb86-4fc8-b027-bb5543135abd.png","era":"romanticism","orig":"仿 雾海上的旅人","artist":"Caspar David Friedrich","year":"1818","story":"卡斯帕·大卫·弗里德里希《雾海上的旅人》的历史名作改编，保留背影构图、雾海、岩脊与远峰；采用成熟态奶蛙。","originalImage":"assets/context/works/rom-wanderer.jpg"},{"zh":"但丁之舟奶蛙","en":"The Barque of Dante Milk Frog","url":"https://router-files.neta.art/files/b81a9ce9-8734-42c6-b9a0-9b9bf35ce02f/e5666b2e-3956-4816-93c1-de56662a991a.png","era":"romanticism","orig":"仿 但丁之舟","artist":"Eugène Delacroix","year":"1822","story":"欧仁·德拉克罗瓦《但丁之舟》的历史名作改编，保留船体、受难者与燃烧城市天际，但丁换为成熟态奶蛙。","originalImage":"assets/context/works/rom-dante.jpg"},{"zh":"梦魇奶蛙","en":"The Nightmare Milk Frog","url":"https://router-files.neta.art/files/23bdc975-3c6c-4e42-b57b-05d8f9384b24/b3ea7a51-049e-4edc-ad2e-3df1f7c65e74.png","era":"romanticism","orig":"仿 梦魇","artist":"Henry Fuseli","year":"1781","story":"亨利·富塞利《梦魇》的历史名作改编，保留沉睡女子、马头幽灵与红幔，梦魇魔换为蹲伏在女子躯干上的成熟态奶蛙。","originalImage":"assets/context/works/rom-nightmare.jpg"},{"zh":"干草车奶蛙","en":"The Hay Wain Milk Frog","url":"https://router-files.neta.art/files/a9229e70-2de1-4e30-99dc-91d3412069bc/6440c3f5-c02e-4b39-9a0e-191fd1677205.png","era":"romanticism","orig":"仿 干草车","artist":"John Constable","year":"1821","story":"约翰·康斯太勃尔《干草车》的历史名作改编，保留农舍、橡树、马匹与暴云天空，车上骑手换为幼态奶蛙。","originalImage":"assets/context/works/rom-haywain.jpg"},{"zh":"墓园孤儿奶蛙","en":"Orphan Girl at the Cemetery Milk Frog","url":"https://router-files.neta.art/files/11b9786b-2e37-4fd9-8c27-51165cf17aa2/4922794f-064a-4a13-ae64-aaf182f058e0.png","era":"romanticism","orig":"仿 墓园孤儿","artist":"Eugène Delacroix","year":"约1824","story":"欧仁·德拉克罗瓦《墓园孤儿》的历史名作改编，保留白上衣、棕披巾、墓园十字架与暮色天空；幼态奶蛙视线向上。","originalImage":"assets/context/works/rom-orphan.jpg"},{"zh":"浪子回头奶蛙","en":"The Return of the Milk Frog","url":"https://router-files.neta.art/files/98a0475c-52fe-4fb5-b90e-6dd0d2c599d1/57d39942-8604-4a24-a1e2-a55f042fdeaa.png","era":"baroque","orig":"仿 浪子回头","artist":"Rembrandt","year":"c. 1669","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-prodigal.jpg"},{"zh":"向日葵奶蛙","en":"Sunflower Milk Frog","url":"https://router-files.neta.art/files/6d7132e0-c7d0-443f-a28d-1e241a22c661/d8f91af4-7158-47f4-b861-f071f474be5d.png","era":"postimpressionism","orig":"仿 向日葵","artist":"Vincent van Gogh","year":"1888","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-sunflowers.jpg"},{"zh":"圣维克多山奶蛙","en":"Milk Frog and Mont Sainte-Victoire","url":"https://router-files.neta.art/files/44a6dbdf-af67-4b14-a74b-18a00aeeb217/0c5e0f75-faa7-40e3-869c-51e1f66e51f2.png","era":"postimpressionism","orig":"仿 圣维克多山","artist":"Paul Cézanne","year":"c. 1904–1906","story":"该作品为历史名作改编，保留原作的构图、人物关系、动作和画面语言。","originalImage":"assets/context/works/original-cezanne.jpg"},{"zh":"玩纸牌的奶蛙","en":"The Card Players Milk Frog","url":"https://router-files.neta.art/files/435168b9-a213-4025-841e-a2fd2059b2e9/fc0abcad-d5a2-499f-b574-41da57ec3715.png","era":"postimpressionism","orig":"仿 玩纸牌者","artist":"Paul Cézanne","year":"约1892–1895","story":"保罗·塞尚《玩纸牌者》的历史名作改编，保留双人隔桌对坐、桌上的酒瓶与沉稳的暖色背景；采用成熟态奶蛙。","originalImage":"assets/context/works/postim-cezanne-cardplayers.jpg"},{"zh":"大碗岛的星期天下午奶蛙","en":"A Sunday on La Grande Jatte Milk Frog","url":"https://router-files.neta.art/files/a76226fa-5bf3-46ea-aa6e-4ae8f1d996d7/4c323aa2-d0ec-4f53-873f-dc0361f0af3c.png","era":"postimpressionism","orig":"仿 大碗岛的星期天下午","artist":"Georges Seurat","year":"1884–1886","story":"乔治·修拉《大碗岛的星期天下午》的历史名作改编，保留全景人群、草地阴影带、河面与帆船；采用成熟态奶蛙。","originalImage":"assets/context/works/postim-seurat-jatte.jpg"},{"zh":"罗纳河上的星夜奶蛙","en":"Starry Night Over the Rhône Milk Frog","url":"https://router-files.neta.art/files/df01a366-9524-4ad4-a7ca-d76cfa2a8a1f/a5a97fb9-c0db-46d0-9a53-73b9b744d25c.png","era":"postimpressionism","orig":"仿 罗纳河上的星夜","artist":"Vincent van Gogh","year":"1888","story":"文森特·梵高《罗纳河上的星夜》的历史名作改编，保留星空、河面光斑与岸边挽手双人；采用成熟态奶蛙。","originalImage":"assets/context/works/postim-vangogh-rhone.jpg"},{"zh":"夜游者奶蛙","en":"Milk Frog Nighthawks","url":"https://router-files.neta.art/files/e8e97a28-a0fd-4fe2-88f2-73ce3674ca8d/312270ba-8a5f-44b5-963b-234dd83355c5.png","era":"modern","orig":"仿 夜游者","artist":"Edward Hopper","year":"1942","story":"爱德华·霍普《夜游者》的历史名作改编，保留深夜餐馆、弧形吧台、角窗、三位顾客和中央服务员位置。"},{"zh":"雪中猎人奶蛙","en":"Milk Frog Hunters in the Snow","url":"https://router-files.neta.art/files/4978473f-db66-483a-b13d-10804e00405a/eecacb66-1966-4783-82d3-34b9b767ba02.png","era":"renaissance","orig":"仿 雪中猎人","artist":"Pieter Bruegel the Elder","year":"1565","story":"老彼得·勃鲁盖尔《雪中猎人》的历史名作改编，保留左侧下坡猎人、猎犬、裸树、结冰河面和远山村庄。"},{"zh":"阿黛尔的肖像奶蛙","en":"Milk Frog Portrait of Adele","url":"https://router-files.neta.art/files/027d8905-384d-4ddf-9bf1-09dcf44999fd/5eb502df-ee30-4f91-85aa-497187e2560e.png","era":"modern","orig":"仿 阿黛尔·布洛赫-鲍尔肖像一号","artist":"Gustav Klimt","year":"1907–1908","story":"古斯塔夫·克里姆特《阿黛尔·布洛赫-鲍尔肖像一号》的历史名作改编，保留正面半身肖像、金色背景和马赛克几何装饰。"},{"zh":"大使们奶蛙","en":"Milk Frog Ambassadors","url":"https://router-files.neta.art/files/0094507e-c768-415d-ac73-c0a594472f2d/520a49e4-f385-48b7-8212-7774996a8b69.png","era":"renaissance","orig":"仿 大使们","artist":"Hans Holbein the Younger","year":"1533","story":"小汉斯·霍尔拜因《大使们》的历史名作改编，保留双人全身构图、绿色帷幕、科学仪器桌和前景斜置骷髅。"},{"zh":"纳芙蒂蒂头像奶蛙","en":"Nefertiti Bust Milk Frog","url":"https://router-files.neta.art/files/41aaf56d-8e89-4762-8151-d00141af79fb/97dc3435-ceaa-4acb-87a5-8c914fa088a6.jpg","era":"ancient","orig":"仿 纳芙蒂蒂头像","artist":"Thutmose","year":"c. 1345 BCE","story":"古埃及《纳芙蒂蒂头像》的历史名作改编，保留三分之四胸像、蓝绿色高冠、彩绘项圈、黑色背景和石灰岩质感。","originalImage":"assets/context/works/original-nefertiti.jpg"},{"zh":"德尔斐御者奶蛙","en":"Charioteer of Delphi Milk Frog","url":"https://router-files.neta.art/files/e44f438f-b213-4540-9246-ac803d681a7a/122576ea-6ce1-4b8b-89b0-685b91de59f5.jpg","era":"ancient","orig":"仿 德尔斐御者","artist":"Unknown","year":"c. 478 BCE","story":"古希腊《德尔斐御者》的历史名作改编，保留正面全身站姿、窄头带、垂直褶衣、缰绳和灰绿色古铜包浆。","originalImage":"assets/context/works/original-charioteer.jpg"},{"zh":"萨莫色雷斯的胜利女神奶蛙","en":"Nike of Samothrace Milk Frog","url":"https://router-files.neta.art/files/a221b832-0cfb-4b79-91c5-789d51789548/19714d1c-e3f8-482e-b224-0ac2f7a47334.png","era":"ancient","orig":"仿 萨莫色雷斯的胜利女神","artist":"Unknown","year":"约公元前190年","story":"《萨莫色雷斯的胜利女神》的历史名作改编，保留迎风前倾的跨步动势、后掠双翼、翻卷衣褶与船首基座，肩部保留原作断臂残缺；采用成熟态奶蛙白石雕像。","originalImage":"assets/context/works/anc3-nike.jpg"},{"zh":"休息的拳击手奶蛙","en":"Boxer at Rest Milk Frog","url":"https://router-files.neta.art/files/a11598f5-8d09-415b-913c-0347de693f78/30fb05bf-7c37-47d4-9cec-c6b998cce152.png","era":"ancient","orig":"仿 休息的拳击手","artist":"Unknown","year":"约公元前330–50年","story":"《休息的拳击手》的历史名作改编，保留疲惫坐姿、转头凝视、双手缠带与铜绿包浆；采用成熟态奶蛙青铜像。","originalImage":"assets/context/works/anc3-boxer.jpg"},{"zh":"拉奥孔群像奶蛙","en":"Laocoon and His Sons Milk Frog","url":"https://router-files.neta.art/files/0797cdc4-6cbd-45f6-93e2-27582b36e5cc/3a5e8bc2-5089-48ba-b66b-aff8045ec786.png","era":"ancient","orig":"仿 拉奥孔群像","artist":"Agesander, Athenodoros and Polydorus","year":"约公元前40–30年","story":"《拉奥孔群像》的历史名作改编，保留巨蛇缠绕、双子、断臂残缺语言与台座，中央父亲换为成熟态奶蛙。","originalImage":"assets/context/works/anc3-laocoon.jpg"},{"zh":"汉谟拉比法典石碑奶蛙","en":"Code of Hammurabi Milk Frog","url":"https://router-files.neta.art/files/58cdb6fa-bf78-4391-bbe3-19e6807ca4cf/81d2a752-d711-4180-8f6f-642b2c2c10c9.png","era":"ancient","orig":"仿 汉谟拉比法典石碑","artist":"Unknown","year":"约公元前1754年","story":"《汉谟拉比法典石碑》的历史名作改编，保留太阳神、权杖符号、楔形文字与闪长岩质感，站立法老换为幼态奶蛙。","originalImage":"assets/context/works/anc3-hammurabi.jpg"},{"zh":"第一门的奥古斯都奶蛙","en":"Augustus of Prima Porta Milk Frog","url":"https://router-files.neta.art/files/27c9bdfd-6d85-4ac3-8dab-de94b07f8ff2/94648243-2d9d-4c04-9649-9b3a67ba12b5.png","era":"ancient","orig":"仿 第一门的奥古斯都","artist":"Unknown","year":"约公元前20年","story":"《第一门的奥古斯都》的历史名作改编，保留抬臂演讲手势、胸甲浮雕、披风、小爱神与台座铭文；仅替换头部，采用成熟态奶蛙。","originalImage":"assets/context/works/anc3-augustus.jpg"},{"zh":"新石器彩陶纹样奶蛙","en":"Neolithic Painted Pottery Milk Frog","url":"https://router-files.neta.art/files/b3e222e7-dd16-445d-9604-74b9aebc3190/854b518d-e017-485c-a6f4-b28870548667.jpg","era":"china-pre-qin","orig":"仿 新石器彩陶纹样","artist":"Unknown","year":"新石器时代","story":"作品以新石器时代彩陶为原型，将圆腹器形、矿物颜料和重复几何纹样组织成早期器物图像。奶蛙被压缩为器壁上的平面纹样，强调身体轮廓与集体装饰之间的关系。"},{"zh":"神人兽面纹玉琮奶蛙","en":"Liangzhu Jade Cong Milk Frog","url":"https://router-files.neta.art/files/62af469f-4e2b-46be-af15-8e3c6a650002/55e0b5ca-3207-49b4-bee4-74bcf4332d67.png","era":"china-pre-qin","orig":"仿 神人兽面纹玉琮","artist":"Unknown","year":"约公元前3300—2300年","story":"作品以良渚文化玉琮为原型，将方圆相套的器形、层叠纹带和神人兽面浅浮雕转译为奶蛙的玉雕身份。放大的黑色瞳孔成为中心面具的视觉锚点。"},{"zh":"四羊方尊奶蛙","en":"Four-Ram Fangzun Milk Frog","url":"https://router-files.neta.art/files/5db69cf4-49a6-443e-8600-c5045de0f16a/120426e0-a5ee-462d-9924-5087513223e1.png","era":"china-pre-qin","orig":"仿 四羊方尊","artist":"Unknown","year":"约公元前13世纪","story":"作品以商代四羊方尊为原型，保留方尊的高颈、方体、圈足、饕餮纹和雷纹结构，将四个转角的羊首改铸为奶蛙首，讨论礼器威严与角色身份之间的转换。"},{"zh":"以马忤斯的晚餐奶蛙","en":"Milk Frog Supper at Emmaus","url":"https://router-files.neta.art/files/123ab25a-fdf5-46f6-93f1-e5ee4b05fa58/7c054faa-166b-40fe-9bd3-004b0af43748.png","era":"baroque","orig":"仿 以马忤斯的晚餐","artist":"Caravaggio","year":"1601","story":"卡拉瓦乔《以马忤斯的晚餐》的历史名作改编，保留中央人物、两侧门徒、白桌布、水果和戏剧性明暗对照。","originalImage":"assets/context/works/original-emmaus.jpg"},{"zh":"绘画的艺术奶蛙","en":"Milk Frog in The Art of Painting","url":"https://router-files.neta.art/files/bc43ffa7-d266-4b29-a9ea-c982699318a4/713861a5-f99f-4357-b118-a7e583931f69.png","era":"baroque","orig":"仿 绘画的艺术","artist":"Johannes Vermeer","year":"c. 1666–1668","story":"约翰内斯·维米尔《绘画的艺术》的历史名作改编，保留左侧帷幕、背对观者的画家、中央模特、地图、吊灯和棋盘地面。","originalImage":"assets/context/works/original-art-of-painting.jpg"},{"zh":"布商同业公会理事奶蛙","en":"Milk Frog Syndics","url":"https://router-files.neta.art/files/18dd2d09-d1cd-4195-b67f-3b63e7f3d41c/9977d7e0-258e-4b48-a7ff-2120aedabb6b.png","era":"baroque","orig":"仿 布商同业公会理事","artist":"Rembrandt","year":"1662","story":"伦勃朗《布商同业公会理事》的历史名作改编，保留五人围桌、红色桌布、深色木墙、打开的书和左侧暖光。","originalImage":"assets/context/works/original-syndics.jpg"},{"zh":"绘画寓意的自画像奶蛙","en":"Milk Frog as the Allegory of Painting","url":"https://router-files.neta.art/files/7f3bb123-ecf3-496f-84e6-39e13e8010da/b9fa594c-02e1-4eca-a855-593f339b48bd.png","era":"baroque","orig":"仿 作为绘画寓意的自画像","artist":"Artemisia Gentileschi","year":"c. 1638–1639","story":"阿尔泰米西娅·真蒂莱斯基《作为绘画寓意的自画像》的历史名作改编，保留抬臂作画、画笔、调色板、绿色衣袖和斜向身体关系。","originalImage":"assets/context/works/original-artemisia.jpg"},{"zh":"油灯前的抹大拉奶蛙","en":"Milk Frog with the Smoking Flame","url":"https://router-files.neta.art/files/e223eacb-d5f6-4881-a804-9ec10c30ffaf/e31233f8-4852-4eb7-9861-336c8d515a5e.png","era":"baroque","orig":"仿 油灯前的抹大拉","artist":"Georges de La Tour","year":"c. 1635–1640","story":"乔治·德·拉·图尔《油灯前的抹大拉》的历史名作改编，保留侧身坐姿、骷髅、油灯、书本、绳索和红棕色暗背景。","originalImage":"assets/context/works/original-magdalen.jpg"},{"zh":"秦始皇陵跪射俑奶蛙","en":"Qin Kneeling Archer Milk Frog","url":"https://router-files.neta.art/files/ff211f78-2ab9-46aa-95bc-2be3e89893af/a5bf9d3a-3b31-46d1-b439-f63f42ee4cc5.png","era":"china-qin-han","orig":"仿 秦始皇陵跪射俑","artist":"Unknown","year":"约公元前210年","story":"作品以秦始皇陵跪射俑为原型，保留一膝着地、另一膝抬起、身体转向和双手持弓的战备姿态。奶蛙的圆钝头身被译入陶俑体量，铠甲片和火烧土色构成秦俑的沉着质感。"},{"zh":"长信宫灯奶蛙","en":"Changxin Palace Lamp Milk Frog","url":"https://router-files.neta.art/files/8fa5c7ab-89c8-4d1e-a924-830c426e6bd8/938681e1-ed72-43b3-8875-b558309427d3.png","era":"china-qin-han","orig":"仿 长信宫灯","artist":"Unknown","year":"约公元前2世纪","story":"作品以西汉长信宫灯为原型，保留跪坐宫女托举灯盘、长袖兼作烟道、灯罩可启闭的器物结构。奶蛙身份被铸入鎏金铜像，使宫廷照明、工艺技术和人物姿态合为一体。"},{"zh":"击鼓说唱俑奶蛙","en":"Eastern Han Storyteller Milk Frog","url":"https://router-files.neta.art/files/685c4490-89df-42ae-90a4-b0c96892ccb0/bc765551-38c1-4587-81e7-80fbdf14b9bd.png","era":"china-qin-han","orig":"仿 击鼓说唱俑","artist":"Unknown","year":"约公元2世纪","story":"作品以东汉击鼓说唱俑为原型，保留一手举槌、一手抱鼓、身体前倾的表演动作。宽腹、张力十足的四肢和灰陶表面共同记录了汉代俑像对民间表演与身体节奏的兴趣。"},{"zh":"洛神赋图奶蛙","en":"Milk Frog in the Nymph of the Luo River","url":"https://router-files.neta.art/files/81a91836-6881-4f79-9de2-241707c61d16/6a04de9a-0edd-45ac-8277-1011bff5e844.png","era":"china-wei-jin","orig":"仿 洛神赋图","artist":"Gu Kaizhi","year":"约4世纪","story":"作品以东晋顾恺之传《洛神赋图》为原型，保留水岸、流云、飘带、侍从与马匹组成的连续叙事，将奶蛙置于长卷人物画的中心位置。"},{"zh":"云冈石窟北魏佛像奶蛙","en":"Northern Wei Yungang Milk Frog","url":"https://router-files.neta.art/files/ada3f2b3-e01e-4c19-b146-ab41c71987f5/89ad5644-a88f-4233-b5a0-7b1dc5e1c447.png","era":"china-wei-jin","orig":"仿 云冈石窟北魏佛像","artist":"Unknown","year":"约5世纪","story":"作品以北魏云冈石窟佛像为原型，保留石窟龛像、圆形背光、袈裟层次和砂岩凿痕，将奶蛙的简洁脸部身份转译为石雕造像。"},{"zh":"唐三彩骆驼载乐俑奶蛙","en":"Tang Sancai Camel Musicians Milk Frog","url":"https://router-files.neta.art/files/66f939ae-2d60-4bd2-803f-bd8442a76678/85d3d313-e2a3-4b97-9200-8df0bb754346.png","era":"china-sui-tang","orig":"仿 唐三彩骆驼载乐俑","artist":"Unknown","year":"约8世纪","story":"作品以唐代三彩骆驼载乐俑为原型，保留骆驼、鞍具、乐队与琥珀绿釉色，将中央乐师改作奶蛙，突出丝路交流和唐代器物的动势。"},{"zh":"贝娅塔·贝亚特丽克斯奶蛙","en":"Beata Beatrix Milk Frog","url":"https://router-files.neta.art/files/b146251c-37df-4038-b120-1a0523fed0af/0b28761f-70bb-43a9-aa92-28fa821763e7.png","era":"pre-raphaelite","orig":"仿 贝娅塔·贝亚特丽克斯","artist":"Dante Gabriel Rossetti","year":"约1870–1872","story":"但丁·加百列·罗塞蒂《贝娅塔·贝亚特丽克斯》的历史名作改编，保留闭眼仰首的出神姿态、深绿长袍、红色鸽子与罂粟、右侧日晷和远景人物。","originalImage":"assets/context/works/original-beata-beatrix.jpg"},{"zh":"水晶球奶蛙","en":"The Crystal Ball Milk Frog","url":"https://router-files.neta.art/files/8c9221bb-b38c-4d10-89f8-6655ba8353b8/3ef4514f-fd5a-44e4-b5d5-f9fab483ba25.png","era":"pre-raphaelite","orig":"仿 水晶球","artist":"John William Waterhouse","year":"约1902","story":"约翰·威廉·沃特豪斯《水晶球》的历史名作改编，保留低头凝视水晶球的侧面视线、连续深红长裙、拱形窗、骷髅与书桌、棋盘地面和右侧椅子。","originalImage":"assets/context/works/original-crystal-ball.jpg"},{"zh":"看哪，主的婢女奶蛙","en":"Ecce Ancilla Domini! Milk Frog","url":"https://router-files.neta.art/files/9a0072a0-3bf1-4551-97bc-8b4941ea94f7/911eb0e1-ca21-45f9-9f7e-2ab47da76308.png","era":"pre-raphaelite","orig":"仿 Ecce Ancilla Domini!","artist":"Dante Gabriel Rossetti","year":"1849–1850","story":"但丁·加百列·罗塞蒂《Ecce Ancilla Domini!》的历史名作改编，保留白色室内、蓝色挂毯、左侧白衣天使与百合、右侧坐姿主体、红色床架和低垂不安的表情。","originalImage":"assets/context/works/original-ecce-ancilla.jpg"},{"zh":"圣西塞莉亚奶蛙","en":"Saint Cecilia Milk Frog","url":"https://router-files.neta.art/files/0bf4baf3-4bf5-47ea-968f-5ded4fac7fb9/65970063-52dd-428f-8ad2-549219b4b5d5.png","era":"pre-raphaelite","orig":"仿 圣西塞莉亚","artist":"John William Waterhouse","year":"1895","story":"约翰·威廉·沃特豪斯《圣西塞莉亚》的历史名作改编，保留横向花园、右侧石椅上的闭眼仰首姿态、膝上书本、左侧两位音乐家、玫瑰花园、海港与远山。","originalImage":"assets/context/works/original-saint-cecilia.jpg"},{"zh":"玫瑰之魂奶蛙","en":"The Soul of the Rose Milk Frog","url":"https://router-files.neta.art/files/db4b2d59-4e86-4ca5-a747-f52a000ba43f/22a57801-8785-430b-9b43-60d158ec207f.png","era":"pre-raphaelite","orig":"仿 玫瑰之魂","artist":"John William Waterhouse","year":"1903","story":"约翰·威廉·沃特豪斯《玫瑰之魂》的历史名作改编，保留侧身嗅闻玫瑰的动作、闭眼的感官沉浸表情、蓝灰花纹披肩、玫瑰花丛、石墙、拱形开口、红色屋顶与右下陶盆。","originalImage":"assets/context/works/original-soul-of-the-rose.jpg"},{"zh":"圣巴塞洛缪节前夕的胡格诺派奶蛙","en":"A Huguenot Milk Frog","url":"https://router-files.neta.art/files/e420786a-40c3-46d0-88f9-911fb48880ac/6c0cd509-72e6-41c8-b135-0c15787e503f.png","era":"pre-raphaelite","orig":"仿 圣巴塞洛缪节前夕的胡格诺派","artist":"John Everett Millais","year":"1851–1852","story":"约翰·埃弗特·米莱《圣巴塞洛缪节前夕的胡格诺派》的历史名作改编，保留成熟态侧面梨形头身、窗边拥抱、白色手帕、紫黑服装、花园藤叶与砖墙。","originalImage":"assets/context/works/original-huguenot.jpg"},{"zh":"废墟中的爱奶蛙","en":"Love Among the Ruins Milk Frog","url":"https://router-files.neta.art/files/81b6f437-fe24-412d-b35b-8685ce53a6dc/5be28f9c-9430-471a-ad97-f813d97bbbab.png","era":"pre-raphaelite","orig":"仿 废墟中的爱","artist":"Edward Burne-Jones","year":"1873","story":"爱德华·伯恩-琼斯《废墟中的爱》的历史名作改编，保留成熟态侧面梨形头身、蓝色长袍、废墟石墙、拥抱姿势、散落花朵与冷色柔光。","originalImage":"assets/context/works/original-love-among-ruins.jpg"},{"zh":"释放令，1746奶蛙","en":"The Order of Release, 1746 Milk Frog","url":"https://router-files.neta.art/files/f25a4241-1970-49fe-bea4-f99eb3b8b0d4/18503372-ef23-462d-a6bd-14ba2b6bc507.png","era":"pre-raphaelite","orig":"仿 释放令，1746","artist":"John Everett Millais","year":"1853","story":"约翰·埃弗特·米莱《释放令，1746》的历史名作改编，保留成熟态奶蛙的弯身归来、夫妻拥抱、释放文件、孩子、狗、门口与温暖室内光线。","originalImage":"assets/context/works/original-order-release.jpg"},{"zh":"蓝色凉亭奶蛙","en":"The Blue Bower Milk Frog","url":"https://router-files.neta.art/files/3966f4a7-59a2-47e3-89a3-799da73256d9/239c5f25-c7fe-4229-93ab-a922b1f64bd0.png","era":"pre-raphaelite","orig":"仿 蓝色凉亭","artist":"Dante Gabriel Rossetti","year":"1865","story":"但丁·加百列·罗塞蒂《蓝色凉亭》的历史名作改编，保留成熟态侧面梨形头身、蓝绿色花卉背景、绿色披肩、胸前饰物和下方弦乐器。","originalImage":"assets/context/works/original-blue-bower.jpg"},{"zh":"夏洛特夫人奶蛙","en":"The Lady of Shalott Milk Frog","url":"https://router-files.neta.art/files/1d1ee455-b6a1-4578-924c-7eb2da3fd94e/8d31d808-7a4a-4f13-9908-8e2034343589.jpg","orig":"仿 夏洛特夫人","artist":"John William Waterhouse","year":"1888","story":"约翰·威廉·沃特豪斯《夏洛特夫人》的历史名作改编，保留黑船、蜡烛、织毯、河面、森林与命运感的横向构图。","originalImage":"assets/context/works/batch3-lady-shalott.jpg","era":"pre-raphaelite"},{"zh":"普罗塞耳皮娜奶蛙","en":"Proserpine Milk Frog","url":"https://router-files.neta.art/files/cece2d08-88a9-4648-b108-814634425530/c544d29d-6408-48f3-84ef-1df56850884a.jpg","orig":"仿 普罗塞耳皮娜","artist":"Dante Gabriel Rossetti","year":"1874","story":"但丁·加百列·罗塞蒂《普罗塞耳皮娜》的历史名作改编，保留绿色披肩、石榴、油灯、藤蔓与狭长垂直构图。","originalImage":"assets/context/works/batch3-proserpine.jpg","era":"pre-raphaelite"},{"zh":"金色阶梯奶蛙","en":"The Golden Stairs Milk Frog","url":"https://router-files.neta.art/files/141cbf80-0ff0-47b5-890e-a30d6a1f006a/31e96d7a-c54e-45aa-9bc6-9ca2be61de1a.jpg","orig":"仿 金色阶梯","artist":"Edward Burne-Jones","year":"1880–1890","story":"爱德华·伯恩-琼斯《金色阶梯》的历史名作改编，保留阶梯、白衣行列、乐器、建筑开口与节奏化的人物间距。","originalImage":"assets/context/works/batch3-golden-stairs.jpg","era":"pre-raphaelite"},{"zh":"乔托哀悼基督奶蛙","en":"Giotto Lamentation Milk Frog","url":"https://router-files.neta.art/files/2d2d0cc1-f40e-4bb8-a59e-d741ddc668ea/1fa523b8-65d8-4b78-8808-2bf7bcfebbf7.jpg","era":"medieval","orig":"仿 哀悼基督","artist":"Giotto","year":"约1305","story":"乔托《哀悼基督》的历史名作改编，保留斯克罗威尼礼拜堂湿壁画的蓝色天空、斜向岩坡、天使群、哀悼人群和中央怀抱姿势。","originalImage":"assets/context/works/original-giotto-lamentation.jpg"},{"zh":"契马布埃圣三位一体圣母子奶蛙","en":"Cimabue Santa Trinita Maesta Milk Frog","url":"https://router-files.neta.art/files/07ffa754-b809-462b-ae5e-d4571f788cc7/4e360ca0-c36a-4cdf-8853-1ef154ce27ec.jpg","era":"medieval","orig":"仿 圣三位一体圣母子","artist":"Cimabue","year":"约1280–1290","story":"契马布埃《圣三位一体圣母子》的历史名作改编，保留高大宝座、蓝色圣母披风、金地、天使与下方先知群像。","originalImage":"assets/context/works/original-cimabue-trinita.jpg"},{"zh":"乔托逃往埃及奶蛙","en":"Giotto Flight into Egypt Milk Frog","url":"https://router-files.neta.art/files/2cada310-cb05-4d15-9492-f3d4eecccdb6/dd782a43-f032-4ae4-82b1-08939648846c.jpg","era":"medieval","orig":"仿 逃往埃及","artist":"Giotto","year":"约1304–1306","story":"乔托《逃往埃及》的正式馆藏改编，保留原作的圣家族行进关系、山地道路、驴与陪行人物的中世纪叙事构图；采用幼态奶蛙。","originalImage":"assets/context/works/medieval2-giotto-flight-egypt.jpg"},{"zh":"杜乔进入耶路撒冷奶蛙","en":"Duccio Entry into Jerusalem Milk Frog","url":"https://router-files.neta.art/files/49ba8665-a482-447c-bc2a-bacc3ea64ee3/aa20b49e-c8d8-4b85-ab83-58fb29853685.jpg","era":"medieval","orig":"仿 进入耶路撒冷","artist":"Duccio","year":"约1308–1311","story":"杜乔《进入耶路撒冷》的正式馆藏改编，保留城门、树木、群众、驴与中心人物的中世纪金地构图；采用成熟态奶蛙。","originalImage":"assets/context/works/medieval2-duccio-entry-jerusalem.jpg"},{"zh":"圣乔治屠龙奶蛙","en":"Saint George and the Dragon Milk Frog","url":"https://router-files.neta.art/files/3d69d6cf-d63d-4e3e-86d3-0ab2a4dff614/ce721f75-fe73-4f48-87e4-bbec42b50718.jpg","era":"medieval","orig":"仿 圣乔治屠龙","artist":"Medieval tradition","year":"中世纪传统","story":"中世纪圣乔治屠龙图像传统的正式馆藏改编，保留骑士、长矛、巨龙、受困公主与城堡背景的叙事关系；采用成熟态奶蛙。","originalImage":"assets/context/works/medieval2-burne-jones-st-george.jpg"},{"zh":"石工奶蛙","en":"The Stone Breakers Milk Frog","url":"https://router-files.neta.art/files/12efdc37-a59b-4346-9a1a-07d293c3b135/9fe237ab-e884-4f45-9b96-9f4dcb76cabc.png","era":"realism","orig":"仿 石工","artist":"Gustave Courbet","year":"1849–1850","story":"古斯塔夫·库尔贝《石工》的历史名作改编，保留两名石工、碎石地面、低视点与沉重的乡村劳动场景；采用成熟态奶蛙。","originalImage":"assets/context/works/original-stone-breakers.jpg"},{"zh":"伏尔加河上的纤夫奶蛙","en":"Barge Haulers on the Volga Milk Frog","url":"https://router-files.neta.art/files/c61aba4b-57ad-45db-b5db-6e7c8cb61a24/14e875f5-9102-4c66-ad25-ba5ba0bb3eaa.png","era":"realism","orig":"仿 伏尔加河上的纤夫","artist":"Ilya Repin","year":"1870–1873","story":"伊里亚·列宾《伏尔加河上的纤夫》的历史名作改编，保留河岸、纤夫队列、绳索、船只与向前下压的劳动节奏；采用成熟态奶蛙。","originalImage":"assets/context/works/original-barge-haulers.jpg"},{"zh":"三等车厢奶蛙","en":"The Third-Class Carriage Milk Frog","url":"https://router-files.neta.art/files/b8d8b0b4-f6be-497d-922b-ce2c3ee0df07/7b0f49a8-930e-4889-ae5d-0682dcff937f.png","era":"realism","orig":"仿 三等车厢","artist":"Honoré Daumier","year":"约1862–1864","story":"奥诺雷·杜米埃《三等车厢》的历史名作改编，保留拥挤车厢、三位前景乘客、低沉光线与沉默的人群关系；采用成熟态奶蛙。","originalImage":"assets/context/works/original-third-class-carriage.jpg"},{"zh":"晚钟奶蛙","en":"The Angelus Milk Frog","url":"https://router-files.neta.art/files/8e7e7335-7ef8-4f22-8246-5daaa34d49ac/0d35703a-bb8c-4551-b742-2d09cebd13ca.png","era":"realism","orig":"仿 晚钟","artist":"Jean-François Millet","year":"1857–1859","story":"让-弗朗索瓦·米勒《晚钟》的历史名作改编，保留低地平线、收割后的田野、远处教堂尖塔、农具与祈祷姿态；采用成熟态奶蛙。","originalImage":"assets/context/works/original-angelus.jpg"},{"zh":"抢球奶蛙","en":"Snap the Whip Milk Frog","url":"https://router-files.neta.art/files/f2b39b40-ecb1-4ff7-af43-a634370ceaae/e0bf7540-ec94-4ba1-ba3e-c856a42f68c1.png","era":"realism","orig":"仿 抢球","artist":"Winslow Homer","year":"1872","story":"温斯洛·霍默《抢球》的历史名作改编，保留乡村校舍、石墙、牵手成链的奔跑动作与开阔草地；采用幼态奶蛙。","originalImage":"assets/context/works/original-snap-the-whip.jpg"}];

// The China museum is sourced from the approved Studio collection. Keep this
// separate from the older general collection data so a re-publish cannot
// accidentally surface withdrawn or candidate works.
const CHINA_MEDIA_URLS = {
  "新石器彩陶纹样奶蛙":"https://router-files.neta.art/files/b3e222e7-dd16-445d-9604-74b9aebc3190/854b518d-e017-485c-a6f4-b28870548667.jpg",
  "神人兽面纹玉琮奶蛙":"https://router-files.neta.art/files/62af469f-4e2b-46be-af15-8e3c6a650002/55e0b5ca-3207-49b4-bee4-74bcf4332d67.png",
  "四羊方尊奶蛙":"https://router-files.neta.art/files/5db69cf4-49a6-443e-8600-c5045de0f16a/120426e0-a5ee-462d-9924-5087513223e1.png",
  "秦始皇陵跪射俑奶蛙":"https://router-files.neta.art/files/ff211f78-2ab9-46aa-95bc-2be3e89893af/a5bf9d3a-3b31-46d1-b439-f63f42ee4cc5.png",
  "长信宫灯奶蛙":"https://router-files.neta.art/files/8fa5c7ab-89c8-4d1e-a924-830c426e6bd8/938681e1-ed72-43b3-8875-b558309427d3.png",
  "击鼓说唱俑奶蛙":"https://router-files.neta.art/files/685c4490-89df-42ae-90a4-b0c96892ccb0/bc765551-38c1-4587-81e7-80fbdf14b9bd.png",
  "洛神赋图奶蛙":"https://router-files.neta.art/files/81a91836-6881-4f79-9de2-241707c61d16/6a04de9a-0edd-45ac-8277-1011bff5e844.png",
  "云冈石窟北魏佛像奶蛙":"https://router-files.neta.art/files/ada3f2b3-e01e-4c19-b146-ab41c71987f5/89ad5644-a88f-4233-b5a0-7b1dc5e1c447.png",
  "唐三彩骆驼载乐俑奶蛙":"https://router-files.neta.art/files/66f939ae-2d60-4bd2-803f-bd8442a76678/85d3d313-e2a3-4b97-9200-8df0bb754346.png"
};

const CHINA_WORKS_SYNC = WORKS.filter(w=>w.era.startsWith('china-')).map(w=>({...w,url:CHINA_MEDIA_URLS[w.zh]||w.url})).concat([
  {
    "zh":"竹林七贤与荣启期砖画奶蛙","en":"Seven Sages and Rong Qiqi Brick Relief Milk Frog","url":"https://router-files.neta.art/files/a2f5ed49-5538-4e64-828b-9889ef667b93/aa985133-fbb3-48bd-99ac-bf394800021e.png","era":"china-wei-jin","orig":"仿 竹林七贤与荣启期砖画","artist":"Unknown","year":"约6世纪","story":"作品以南朝墓室砖画《竹林七贤与荣启期》为原型，保留长条砖面、竹林、树石、乐器和八位人物的分段节奏，让每位高士都成为姿态不同的奶蛙。","intro":"《竹林七贤与荣启期》以砖面上的连续人物和树石分隔出隐逸叙事。不同人物的坐姿、器物与视线在狭长画面中彼此呼应，形成一种缓慢展开的精神肖像。","curatorial":"砖画的重点不在单个角色的体积，而在人物间距、竹林枝干和器物动作构成的节奏。奶蛙被置入同一平面语言，身份差异服从砖面分段与留白。","trivia":"砖画中的人物身份主要依靠题名、器物和姿态辨认，画面把历史人物与理想化的隐逸生活并置在一起。"
  },
  {
    "zh":"游春图奶蛙","en":"Spring Outing Milk Frog","url":"https://router-files.neta.art/files/87ec9cb3-d3c0-4dd2-9a8c-f497eaa27d19/ebc9f639-cdad-4385-94aa-afeb08463b46.png","era":"china-sui-tang","orig":"仿 游春图","artist":"Zhan Ziqian","year":"约7世纪","story":"作品以展子虔《游春图》为原型，保留青绿山水、远山、春水、人物与舟桥的游览秩序，将奶蛙安置在山水之间。","intro":"《游春图》以青绿设色、山水层次和微小人物组织早期山水画的观看路径。近岸、远山与水面共同构成春日郊游的展开空间。","curatorial":"湖石、树木和人物被压缩为精确的尺度关系，颜色先建立山水秩序，再让游春活动浮现。奶蛙保持小型而明确的识别度，不抢夺山水的主景位置。","trivia":"《游春图》常被视为早期独立山水画的重要例证，现存本子的作者与年代仍有传承和鉴定讨论。"
  },
  {
    "zh":"簪花仕女图奶蛙","en":"Ladies with Flowers Milk Frog","url":"https://router-files.neta.art/files/d1383bb8-24d2-4937-9ab0-7bb655aa6030/28cb7ba9-d698-40e6-8a20-7ca0c107718a.png","era":"china-sui-tang","orig":"仿 簪花仕女图","artist":"Zhou Fang","year":"约8世纪","story":"作品以周昉传《簪花仕女图》为原型，保留仕女、花枝、犬鸟、长裙与庭院式留白，将奶蛙纳入唐代仕女画的从容仪态。","intro":"《簪花仕女图》以细密线描、柔和设色和从容缓慢的仕女姿态，记录唐代宫廷女性的装束与闲适游赏。人物、花枝和小动物共同构成静谧的庭院叙事。","curatorial":"工笔线条把衣纹、花饰和面部表情控制在同一层次，奶蛙的形体也应服从这种平面、精细而克制的秩序。画面的留白让视线在仕女与花木之间缓慢移动。","trivia":"《簪花仕女图》的作者传统上归于周昉，现存作品的摹本性质与具体年代一直是研究重点。"
  },
  {
    "zh":"韩熙载夜宴图奶蛙","en":"Han Xizai’s Night Revels Milk Frog","url":"https://router-files.neta.art/files/bf59dc99-f6c4-4570-96de-e63df95223a1/1281f3db-6bd2-4cee-a292-521972387c8e.png","era":"china-song","orig":"仿 韩熙载夜宴图","artist":"Gu Hongzhong","year":"约10世纪","story":"作品以五代顾闳中传《韩熙载夜宴图》为原型，保留听乐、观舞、休息与送客的连续场景，将奶蛙融入夜宴人物群像。","intro":"《韩熙载夜宴图》把一场夜宴拆成听乐、观舞、休息、清吹和送客等连续片段。屏风、帷幕与室内器物像舞台节点一样，带领观者在长卷中往返。","curatorial":"人物的动作和视线比单一中心更重要，奶蛙在不同段落中承担尺度与节奏的转换。设色、衣纹和器物共同维持五代宴饮图的室内密度。","trivia":"传为顾闳中奉命夜访韩熙载后据观察绘制，但现存本子的时代和传摹关系仍需结合画面与文献判断。"
  },
  {
    "zh":"定窑白釉孩儿枕奶蛙","en":"Ding Ware Child Pillow Milk Frog","url":"https://router-files.neta.art/files/2bc215b6-f2b2-405d-aabf-b0205f22ba64/5243bbbc-60eb-4a9c-ba9c-26b3d421e3f5.png","era":"china-song","orig":"仿 定窑白釉孩儿枕","artist":"Unknown","year":"约11—12世纪","story":"作品以北宋定窑白釉孩儿枕为原型，保留孩童伏卧、枕体结构、白釉与器物阴影，将奶蛙置于宋代瓷塑的静谧体量中。","intro":"白釉孩儿枕把一个伏卧的孩童转化为兼具实用与观赏性的瓷塑。枕面、衣纹、支撑姿态和白釉反光共同构成安静而精确的器物形象。","curatorial":"奶蛙的圆钝形体与定窑白釉共享柔和的轮廓和克制的阴影，重点是瓷胎、釉面与枕体结构的关系，而非现代角色的立体光泽。","trivia":"孩儿枕既是实用器，也具有陈设意味；不同窑口的造型、釉色和孩童姿态形成了丰富的宋代瓷塑谱系。"
  },
  {
    "zh":"清明上河图奶蛙","en":"Along the River During the Qingming Festival Milk Frog","url":"https://router-files.neta.art/files/f99fba78-6f8f-4d66-9d6c-6a6968a65283/b01aed42-2c07-4269-9d8b-152f1094fb6a.png","era":"china-song","orig":"仿 清明上河图","artist":"Zhang Zeduan","year":"约12世纪","story":"作品以北宋张择端《清明上河图》为原型，保留城门、虹桥、舟船、街市、行旅与长卷的连续观看，将奶蛙作为城市叙事中的微小角色。","intro":"《清明上河图》以长卷展开北宋城市从郊外、河道到城门和街市的连续景观。桥梁、舟船、店铺与行人把宏大的城市生活拆解为无数可追踪的细节。","curatorial":"奶蛙只占据城市尺度中的一个微小位置，衣食住行的密度才是画面的主角。线描、设色和建筑透视共同建立一种可步行、可回看的都市秩序。","trivia":"《清明上河图》现存本的作者和版本关系历来受到重视，画中人物、店铺和交通细节也持续为社会史研究提供线索。"
  },
  {
    "zh":"寒江独钓图奶蛙（写意）","en":"Fishing Alone on a Cold River Milk Frog","url":"https://router-files.neta.art/files/a4c43351-dc82-4ac3-b80d-c5f5984c179b/f6f97740-aad8-4ee5-8d54-06850d71709a.png","era":"china-song","orig":"仿 寒江独钓图","artist":"Ma Yuan","year":"约13世纪","story":"作品以南宋马远《寒江独钓图》为原型，保留大片空江、孤舟、钓者与极简构图，以写意墨线和淡墨留白呈现奶蛙。","intro":"《寒江独钓图》用一叶扁舟、一位垂钓者和大面积空白制造寒江的辽阔。可见之物极少，观看却被水面、雾气和未画之境不断延伸。","curatorial":"写意的力量来自墨线的速度、浓淡和停顿，而不是细密塑形。奶蛙与孤舟共享小尺度，让它成为寒江中一个有分量却不喧闹的落笔。","trivia":"马远善于以边角构图和大片留白制造山水的余韵，《寒江独钓图》正是这一观看方式的典型。"
  },
  {
    "zh":"富春山居图奶蛙","en":"Dwelling in the Fuchun Mountains Milk Frog","url":"https://router-files.neta.art/files/62a83f2e-037e-4ccb-8b58-4e7d10378735/237526d5-58ac-4281-b803-75756afaecdc.png","era":"china-ming-qing","orig":"仿 富春山居图","artist":"Huang Gongwang","year":"约14世纪","story":"作品以元代黄公望《富春山居图》为原型，保留江岸、山峦、树木、渔舟与长卷的疏密变化，让奶蛙进入元代文人山水的笔墨结构。","intro":"《富春山居图》不是对某一处景物的机械记录，而是黄公望在富春江经验上反复经营的山水长卷。山体、树丛、沙洲和江面在披麻皴与淡墨中缓慢展开。","curatorial":"奶蛙沿着山水的笔墨节奏出现，体量服从江岸与远山的尺度变化。干湿相间的皴擦、留白和淡设色共同构成元代文人画的呼吸。","trivia":"《富春山居图》后来分为两段，前段《剩山图》与后段《无用师卷》的流传经历本身也是作品历史的一部分。"
  },
  {
    "zh":"百骏图奶蛙","en":"One Hundred Horses Milk Frog","url":"https://router-files.neta.art/files/76da33f6-abba-4950-95d5-34885510c009/eca3b348-0b55-49fb-ad35-9daeade30b5d.png","era":"china-ming-qing","orig":"仿 百骏图","artist":"Giuseppe Castiglione","year":"约18世纪","story":"作品以清代郎世宁《百骏图》为原型，保留群马、牧者、树石与开阔牧场，将奶蛙安置在中西合璧的宫廷绘画空间中。","intro":"《百骏图》以大量马匹的姿态差异、牧场空间和树石配置展开一幅动态的宫廷动物画。郎世宁将西方明暗、透视与中国工笔设色结合，形成独特的视觉秩序。","curatorial":"奶蛙保持小型并服从马群的方向与尺度，细线、设色和体积关系服务于整体牧场空间。作品的观看重点是中西技法在同一画面中的协商。","trivia":"郎世宁以意大利传教士身份进入清宫，中文名为郎世宁；他在宫廷画院中长期参与动物、人物和纪实题材创作。"
  },
  {
    "zh":"荷花与鸭奶蛙（写意）","en":"Lotus and Ducks Milk Frog","url":"https://router-files.neta.art/files/5102aa99-45d8-4168-9f22-5d68d7193e63/0985951e-85b0-43ca-85c6-d30105f4841a.png","era":"china-ming-qing","orig":"仿 荷花与鸭","artist":"Bada Shanren","year":"约17世纪","story":"作品以八大山人花鸟画为原型，保留荷叶、荷花、鸭与大面积纸面留白，以写意墨色和简练笔触安置奶蛙。","intro":"八大山人的花鸟画常以极少的形象承载强烈的情绪和观看距离。荷花、荷叶与鸭被置于大片空白中，笔墨的顿挫和形象的孤立共同形成写意张力。","curatorial":"奶蛙不能被画成光滑的现代玩偶，而应以墨、赭色和纸面吸收组成简略形体。它与鸭、荷叶共享同一笔墨世界，靠留白而不是体积光获得存在感。","trivia":"八大山人是朱耷的号，清初画家常以花鸟、山水和题跋寄托复杂的身世感，作品中的鸟兽姿态也常被特别讨论。"
  },
  {
    "zh":"奔马奶蛙（变体形态版）","en":"Galloping Horse Milk Frog","url":"https://public.cohub.run/s/157e937b-95da-4c17-add4-f916e37c3574/neta-studio-upload/image_01M1B0SGM225NWZ1RES7G16153.webp","era":"china-modern","orig":"仿 奔马","artist":"Xu Beihong","year":"20世纪","story":"作品以徐悲鸿《奔马》为原型，保留水墨奔马的速度、鬃尾和运动姿态，采用获准的奶蛙马形态变体完成身份转换。","intro":"徐悲鸿的奔马以简洁而有力量的水墨线条捕捉马匹奔跑时的骨骼、肌肉和气势。蹄、鬃、尾与躯干在疾速中形成一条连续的动作线。","curatorial":"这件作品使用获准的奶蛙马形态变体，身份转换服务于奔跑的运动结构。浓墨、飞白和水分变化承担速度，不用现代软陶式的圆润体积覆盖笔墨。","trivia":"徐悲鸿长期研究马的解剖和动态，常以速写积累运动经验，再用高度概括的水墨完成最终形象。"
  },
  {
    "zh":"虾趣奶蛙","en":"Shrimp Frolic Milk Frog","url":"https://router-files.neta.art/files/f929c484-6176-4e7b-8a78-404c09eb01a4/68c4a1be-ce86-48d7-8d35-528e323d06b4.png","era":"china-modern","orig":"仿 虾","artist":"Qi Baishi","year":"20世纪","story":"作品以齐白石《虾》为原型，保留透明水墨、长须、游动方向与空纸关系，将奶蛙作为水面边缘的轻小观察者。","intro":"齐白石画虾不靠繁复背景，而以墨色浓淡、线条弹性和留白表现水中透明的生命。几只虾的方向变化让空纸获得了流动感。","curatorial":"奶蛙保持小尺度，笔墨密度与虾须、虾身共享纸面扩散，成为画面边缘的轻声回应。写意的空处同样是形象的一部分。","trivia":"齐白石曾长期观察案头水族并反复练习虾的结构，最终以极少笔墨建立了可辨识的虾形。"
  },
  {
    "zh":"蛙声十里出山泉奶蛙","en":"Ten Miles of Frog Calls from Mountain Springs Milk Frog","url":"https://router-files.neta.art/files/eaa5098d-584d-4d69-8c78-b7c1f16ff411/994c3dab-fa31-492c-aeec-a97bee54dd8c.png","era":"china-modern","orig":"仿 蛙声十里出山泉","artist":"Qi Baishi","year":"20世纪","story":"作品以齐白石《蛙声十里出山泉》为原型，保留山泉、蝌蚪、山石与空白的声音感，将奶蛙收束在水墨山谷的边角。","intro":"《蛙声十里出山泉》不直接描绘成蛙，而用奔流的泉水和水中的蝌蚪让声音在画外发生。山石、瀑布与长幅留白把听觉想象延伸到远处。","curatorial":"奶蛙作为小型角落角色加入，不代替原作的蝌蚪叙事，也不把画面变成角色海报。浓淡墨线和水流方向共同维持听觉性的写意空间。","trivia":"这件作品常被认为是齐白石晚年应邀创作的代表作之一，题目本身就要求观者从未画出的青蛙想象声音。"
  },
  {
    "zh":"万山红遍奶蛙","en":"Red in All the Mountains Milk Frog","url":"https://router-files.neta.art/files/3648678d-6358-4082-afe5-9c7ae405ce5d/de875283-523e-40fb-a31d-44033caaa145.png","era":"china-modern","orig":"仿 万山红遍","artist":"Li Keran","year":"20世纪","story":"作品以李可染《万山红遍》为原型，保留层叠山势、赭红秋色、江面与留白，用中国山水的积墨和朱砂关系呈现奶蛙。","intro":"《万山红遍》以毛泽东诗意和北方山水经验为基础，把秋色山林组织成沉厚而有节奏的空间。红色山体、黑色树群与江面共同形成强烈的远近层次。","curatorial":"奶蛙应被压进山水笔墨的尺度和色层中，不以独立高光跳出画面。积墨、积色与树群的节奏比角色轮廓更能决定这件改编的成立。","trivia":"李可染在山水创作中重视写生与积墨，反复经营的红色山水系列成为其晚年艺术面貌的重要部分。"
  },
  {
    "zh":"江山如此多娇奶蛙","en":"So Many Beauties, Mountains and Rivers Milk Frog","url":"https://router-files.neta.art/files/7fbf91ba-0967-4b96-b173-ffca45f3a177/3e49bf66-2a18-4b3a-81ed-faaad8fb2d7f.png","era":"china-modern","orig":"仿 江山如此多娇","artist":"Fu Baoshi & Guan Shanyue","year":"1959","story":"作品以傅抱石、关山月《江山如此多娇》为原型，保留群山、云海、瀑布、长城与旭日的宏阔构图，将奶蛙纳入山水尺度。","intro":"《江山如此多娇》以群山、云海、瀑布、长城和旭日组成新中国山水画的宏阔图景。两位画家在传统笔墨与时代公共形象之间建立了新的山水叙事。","curatorial":"奶蛙在宏大景观中保持微小而清晰的存在，作为尺度参照而不是主题中心。山体皴擦、云气留白与日光色层继续承担画面的主导力量。","trivia":"这件作品为人民大会堂创作，题名取自毛泽东《沁园春·雪》，其公共展示语境与画面尺度密切相关。"
  },
  {
    "zh":"鹰石山花奶蛙","en":"Eagle, Rock and Mountain Flowers Milk Frog","url":"https://router-files.neta.art/files/6715d3cc-611b-4d2b-900c-3d4cec5ef569/3fe72e84-9d88-4f37-9db0-1685b3938e1d.png","era":"china-modern","orig":"仿 鹰石山花图","artist":"Pan Tianshou","year":"20世纪","story":"作品以潘天寿《鹰石山花图》为原型，保留巨石、苍鹰、山花和大写意构图，将奶蛙压缩为枝石之间的落笔。","intro":"潘天寿以巨石、苍鹰和山花建立强烈的构图张力，画面常在险峻的欹侧与稳固的题跋之间取得平衡。粗线、焦墨和鲜明花色共同形成大写意的骨力。","curatorial":"奶蛙保持小而重的笔墨感，像枝石间自然出现的一笔，而不是被贴上的完整玩偶。墨块、赭色和纸面留白共同决定它与主体的结合。","trivia":"潘天寿重视指墨、篆刻和书法式用笔，鹰、石与花卉反复出现于其晚年大写意创作中。"
  },
  {
    "zh":"女史箴图奶蛙（工笔）","en":"Admonitions of the Instructress to the Court Ladies Milk Frog","url":"https://router-files.neta.art/files/fe561cc4-be0c-45f7-afe6-1b8fb930320a/3af151cc-8f21-471e-95bb-5a3375e829ba.png","era":"china-wei-jin","orig":"仿 女史箴图","artist":"Gu Kaizhi","year":"约4世纪","story":"作品以顾恺之传《女史箴图》为原型，保留长卷分段、人物姿态、器物与工笔线描，将奶蛙以工笔方式置入具体叙事段落。","intro":"《女史箴图》依据张华《女史箴》的训诫文字展开一组宫廷女性故事。人物、屏风、帷帐和器物以连续段落组织观看，细线勾勒让姿态承担叙事。","curatorial":"工笔版奶蛙使用清楚但不突兀的线描、平面设色和纸绢吸收，体量服从段落中的人物尺度。它是叙事角色，不是现代软陶玩偶。","trivia":"现存《女史箴图》多被认为是唐代摹本，原作已失；长卷的观看顺序和各段图像来源一直是艺术史研究的重要议题。"
  },
  {
    "zh":"芙蓉锦鸡图奶蛙（枝条角落版）","en":"Hibiscus and Golden Pheasant Milk Frog","url":"https://router-files.neta.art/files/f36c72b0-05c0-4ce1-83e2-ce41a4f6c55a/e434dedc-0a2a-4fbd-8534-39f17c8b80c2.jpg","era":"china-song","orig":"仿 芙蓉锦鸡图","artist":"Zhao Ji","year":"约12世纪","story":"作品以宋徽宗赵佶《芙蓉锦鸡图轴》为原型，奶蛙缩入上方枝条角落，以工笔花鸟的细线和平面设色与花枝相接。","intro":"《芙蓉锦鸡图》以芙蓉、锦鸡和秋日花木构成精致的工笔花鸟空间。鸟的姿态、枝叶的转折与题跋留白共同维持画面的静定秩序。","curatorial":"奶蛙被安置在枝条上方的边角，不抢夺锦鸡与花木的中心关系。细线、平涂矿物色和绢面吸收使它成为原画内部的一处小叙事。","trivia":"宋徽宗赵佶以书画与宫廷艺术收藏闻名，工笔花鸟中对禽鸟姿态和花木细节的精密观察尤其突出。"
  },
  {
    "zh":"早春图奶蛙（山石笔墨融合版）","en":"Early Spring Milk Frog","url":"https://router-files.neta.art/files/5d10743c-a578-461c-bb41-30054b11b531/3d255614-fadd-4564-9908-b31eabc60558.png","era":"china-song","orig":"仿 早春图","artist":"Guo Xi","year":"约11世纪","story":"作品以北宋郭熙《早春图》为原型，奶蛙以小型墨赭笔触融入左下近景山石，服从北宋山水的绢面和皴擦。","intro":"《早春图》通过主峰、溪谷、树木、瀑布和远近烟霭组织早春山水。山体的皴擦与绢面留白让季节变化在沉静的空间中逐步显现。","curatorial":"奶蛙与近景山石共享墨色、纸绢纹理和笔触，但保留清楚的头身轮廓、奶油腹部和眼环。融合意味着同一画面语言，不意味着把身份抹掉。","trivia":"郭熙在《林泉高致》中讨论山水观看与四时变化，《早春图》常被视为其北宋山水观念的代表。"
  },
  {
    "zh":"万壑松风图奶蛙（山石笔墨版）","en":"Wind in Pines Among a Myriad Valleys Milk Frog","url":"https://router-files.neta.art/files/41e77b57-c4f7-4720-97ab-531f7c1aa81a/000da1cf-489b-418c-8baf-22192bc2df6d.png","era":"china-song","orig":"仿 万壑松风图","artist":"Li Tang","year":"约12世纪","story":"作品以南宋李唐《万壑松风图》为原型，奶蛙融入左下近景山石，以北宋山水笔墨处理。","intro":"《万壑松风图》以高山、飞瀑、松林和峡谷构成宏大的山水声场。垂直山体与水流方向将观看从近景岩石引向深处的松风。","curatorial":"奶蛙保持小而清晰的身份，墨赭色层与近景岩石共享纸面扩散和笔触方向。它是山水中的尺度节点，而不是跳出画面的现代玩偶。","trivia":"李唐的山水由北宋雄浑传统转向南宋院体的新构图，山石和松树的组织方式具有强烈的结构感。"
  },
  {
    "zh":"捣练图奶蛙（红衣小孩转化版）","en":"Court Ladies Preparing Silk Milk Frog","url":"https://router-files.neta.art/files/4e47e7be-e57f-4ef0-9466-d6ff6537f5df/b5326b41-1ec0-42a0-a2af-e9c97381c5e7.png","era":"china-sui-tang","orig":"仿 捣练图","artist":"Zhang Xuan","year":"约8世纪","story":"作品以张萱传《捣练图》为原型，将原画红衣小孩直接转为红衣奶蛙，保留工笔人物画的尺度、动作和线描。","intro":"《捣练图》描绘宫廷女性捣练、展开和熨烫丝帛的连续劳动。长幅中的服饰、工具、姿态和白练共同构成唐代人物画的生活叙事。","curatorial":"奶蛙不是额外加入的角色，而是红衣小孩位置上的身份转化。红衣、绢面、细线和人物尺度共同把它留在唐代工笔的视觉秩序中。","trivia":"《捣练图》现存本一般被视为宋徽宗时期的摹本，传统上归于唐代张萱，作品记录了宫廷女性劳动与服饰细节。"
  },
  {
    "zh":"照夜白图奶蛙（骑马版）","en":"Night-Shining White Milk Frog","url":"https://router-files.neta.art/files/7dbe4c76-9926-48ba-ad19-72add0009029/2115cc65-e40b-4cbe-8ddd-4d1855c953c0.png","era":"china-sui-tang","orig":"仿 照夜白图","artist":"Han Gan","year":"约8世纪","story":"作品以唐代韩干《照夜白图》为原型，奶蛙骑在马背上，以工笔绢本语言完成身份转换。","intro":"《照夜白图》以拴系中的骏马表现宫廷名马的精神与力量。马首、鬃毛、缰绳和身体轮廓在绢地上形成强烈的横向张力。","curatorial":"奶蛙骑在马背上，体量足以成为清楚的骑者，却仍服从骏马的主体尺度。工笔线条、平面赭色和绢面吸收让骑者与马共享同一媒介。","trivia":"韩干以画马闻名，传说曾观察宫廷名马和真实马匹的动态，以细致线描与设色记录其体态。"
  },
  {
    "zh":"虢国夫人游春图奶蛙（骑行者转化工笔版）","en":"The Spring Outing of the Guo State Lady Milk Frog","url":"https://router-files.neta.art/files/7d5b44cf-941e-4913-be8f-623459185d63/4edf13a3-7761-4fe0-81f4-eca20b0b532b.png","era":"china-sui-tang","orig":"仿 虢国夫人游春图","artist":"Zhang Xuan","year":"约8世纪","story":"作品以张萱传《虢国夫人游春图》为原型，将右侧骑行队列中的一名骑行者转化为同尺度的唐代工笔奶蛙。","intro":"《虢国夫人游春图》以马匹、骑者、鞍具和服饰展开春日出行的队列节奏。人物并非孤立肖像，而是在移动中的社会群像。","curatorial":"奶蛙保留骑行姿态和原人物尺度，细线、平涂和红色鞍具把它纳入队列。它的身份通过头身比例和面部标记显现，而不是依靠现代立体光影。","trivia":"作品传统上归于张萱，现存本与后世摹本关系复杂；画中的马匹和骑行服饰为研究唐代生活提供了重要图像材料。"
  },
  {
    "zh":"步辇图奶蛙（红衣人物转化工笔版）","en":"Emperor Taizong Receiving the Tibetan Envoy Milk Frog","url":"https://router-files.neta.art/files/d69b4820-3bb1-444f-b971-2f5715cf6061/69a1bfbb-d676-4368-860e-c09145e6c4d9.png","era":"china-sui-tang","orig":"仿 步辇图","artist":"Yan Liben","year":"约7世纪","story":"作品以阎立本《步辇图》为原型，将画面中间偏左的红衣人物直接转化为红衣奶蛙，保留原人物位置和站姿。","intro":"《步辇图》围绕唐太宗接见吐蕃使者的礼仪场面展开，人物、仪仗和空间留白共同形成外交叙事。不同服饰和姿态被安排在一条稳定的横向秩序中。","curatorial":"红衣奶蛙直接占据原人物的位置，与周围人物共享线描、平面设色、绢面颗粒和站姿尺度。它是礼仪场景中的身份变体，不是后贴的角色图标。","trivia":"《步辇图》传统上归于阎立本，现存本的摹传关系受到长期讨论；画面常被视为唐代宫廷外交图像的重要例证。"
  },
  {
    "zh":"梅花图奶蛙（写意梅枝版）","en":"Plum Blossom Milk Frog","url":"https://router-files.neta.art/files/cc17032d-30d7-455a-9139-45150860bd51/46fff7a1-2f99-462b-832b-88105b9375ef.png","era":"china-ming-qing","orig":"仿 梅花图","artist":"Jin Nong","year":"约18世纪","story":"作品以清代金农《梅花图》为原型，奶蛙融入梅枝，以写意墨色、赭色和纸面留白完成身份转化。","intro":"金农的梅花画以古拙枝干、疏密花朵和题跋留白建立清代文人花卉的独特节奏。枝条的墨色变化和花朵的简括形态共同构成画面骨架。","curatorial":"奶蛙趴在梅枝之间，与枝干共享干湿墨色和纸面吸收。写意不是把奶蛙化成模糊色点，而是在简练笔触中保留清楚的头身和面部标记。","trivia":"金农是扬州八怪的重要成员，梅花、隶书题跋和古拙用笔构成其晚年艺术面貌的代表性部分。"
  },
  {
    "zh":"桃源仙境图奶蛙（人物转化工笔版）","en":"The Peach Blossom Spring Milk Frog","url":"https://router-files.neta.art/files/467608bc-b920-49f7-904d-f5495b110947/e5563dad-b6ea-4aa2-92f4-af27eeceb3e9.png","era":"china-ming-qing","orig":"仿 桃源仙境图","artist":"Qiu Ying","year":"约16世纪","story":"作品以明代仇英《桃源仙境图》右段为原型，将右侧人物群中的一名小行旅直接转化为同尺度的明代工笔奶蛙。","intro":"《桃源仙境图》以青绿山水、楼阁、桃林和行旅人物展开理想化的桃源景观。远山、流水与人物群像共同形成可游可居的明代山水空间。","curatorial":"奶蛙直接替换右侧人物群中的一名小行旅，服从同一尺度、线描和平涂矿物色。它作为人物身份变体留在队列中，而不是独立坐在前景石头上的立体角色。","trivia":"仇英以工笔人物、青绿山水和历史题材闻名，明代职业画家常以精细设色和复杂场景满足宫廷与收藏家的观看需求。"
  }
]);

const ORIGINAL_IMAGES = {
  "构成八号奶蛙":"assets/context/works/w01.jpg",
  "睡莲中的奶蛙":"assets/context/works/w02.jpg",
  "神奈川冲浪奶蛙":"assets/context/works/w03.jpg",
  "三个音乐家奶蛙":"assets/context/works/w05.jpg",
  "撑阳伞的奶蛙":"assets/context/works/w06.jpg",
  "呐喊的奶蛙":"assets/context/works/w07.jpg",
  "星月奶蛙夜":"assets/context/works/w08.jpg",
  "拉斯科洞窟的奶蛙":"assets/context/works/w09.jpg",
  "米洛斯的奶蛙":"assets/context/works/w10.jpg",
  "哥特奶蛙圣母院":"assets/context/works/w11.jpg",
  "圣母子与奶蛙":"assets/context/works/w12.jpg",
  "潜水者墓奶蛙":"assets/context/works/w13.jpg",
  "阿尔塔米拉的奶蛙":"assets/context/works/w14.jpg",
  "最后的晚餐奶蛙":"assets/context/works/w15.jpg",
  "创造奶蛙":"assets/context/works/w16.jpg",
  "雅典学院的核心奶蛙":"assets/context/works/w17.jpg",
  "岩画手印奶蛙":"assets/context/works/w18.jpg",
  "肖维洞窟奔跑奶蛙":"assets/context/works/w19.jpg",
  "塞拉山奔跑奶蛙":"assets/context/works/w20.jpg",
  "石阵仪式奶蛙":"assets/context/works/w21.jpg",
  "岩刻游行奶蛙":"assets/context/works/w22.jpg",
  "洞窟攀岩奶蛙":"assets/context/works/w23.jpg",
  "秋千奶蛙":"assets/context/works/w24.jpg",
  "化妆室奶蛙":"assets/context/works/w25.jpg",
  "凯风快晴奶蛙":"assets/context/works/w26.jpg",
  "东海道奶蛙":"assets/context/works/w27.jpg",
  "雪中桥奶蛙":"assets/context/works/w28.jpg",
  "干草堆奶蛙":"assets/context/works/w30.jpg",
  "舟发西苔岛奶蛙":"assets/context/works/w31.jpg",
  "音乐课奶蛙":"assets/context/works/w32.jpg",
  "花饰静物奶蛙":"assets/context/works/w33.jpg",
  "夜间咖啡馆奶蛙":"assets/context/works/w34.jpg",
  "喷泉浇花奶蛙":"assets/context/works/w35.jpg",
  "秘密情书奶蛙":"assets/context/works/w36.jpg",
};
[...WORKS,...CHINA_WORKS_SYNC].forEach(w=>{
  const localOriginals={
    "浪子回头奶蛙":"assets/context/works/original-prodigal.jpg",
    "拾穗者奶蛙":"assets/context/works/original-gleaners.jpg",
    "梅杜萨之筏奶蛙":"assets/context/works/original-medusa.jpg",
    "1808年5月3日奶蛙":"assets/context/works/original-may3.jpg",
    "自由引导人民奶蛙":"assets/context/works/original-liberty.jpg",
    "雾海上的旅人奶蛙":"assets/context/works/rom-wanderer.jpg",
    "但丁之舟奶蛙":"assets/context/works/rom-dante.jpg",
    "梦魇奶蛙":"assets/context/works/rom-nightmare.jpg",
    "干草车奶蛙":"assets/context/works/rom-haywain.jpg",
    "墓园孤儿奶蛙":"assets/context/works/rom-orphan.jpg",
    "奥菲莉亚奶蛙":"assets/context/works/original-ophelia.jpg",
    "雨天的巴黎街道奶蛙":"assets/context/works/original-paris-rain.jpg",
    "向日葵奶蛙":"assets/context/works/original-sunflowers.jpg",
    "圣维克多山奶蛙":"assets/context/works/original-cezanne.jpg",
    "沉睡的吉普赛人奶蛙":"assets/context/works/original-sleeping-gypsy.jpg",
    "夜游者奶蛙":"assets/context/works/original-nighthawks.jpg",
    "雪中猎人奶蛙":"assets/context/works/original-hunters-snow.jpg",
    "阿黛尔的肖像奶蛙":"assets/context/works/original-adele.jpg",
    "大使们奶蛙":"assets/context/works/original-ambassadors.jpg",
    "新石器彩陶纹样奶蛙":"assets/context/works/original-neolithic-pottery.jpg",
    "神人兽面纹玉琮奶蛙":"assets/context/works/original-liangzhu-cong.jpg",
    "四羊方尊奶蛙":"assets/context/works/original-four-rams-zun.jpg",
    "秦始皇陵跪射俑奶蛙":"assets/context/works/original-kneeling-archer.jpg",
    "长信宫灯奶蛙":"assets/context/works/original-lamp.jpg",
    "击鼓说唱俑奶蛙":"assets/context/works/original-han-entertainer.jpg",
    "洛神赋图奶蛙":"assets/context/works/original-luoshen.jpg",
    "云冈石窟北魏佛像奶蛙":"assets/context/works/original-yungang-buddha.jpg",
    "竹林七贤与荣启期砖画奶蛙":"assets/context/works/original-seven-sages.jpg",
    "唐三彩骆驼载乐俑奶蛙":"assets/context/works/original-tangcamel.jpg",
    "竹林七贤与荣启期砖画奶蛙":"assets/context/works/original-seven-sages.jpg",
    "游春图奶蛙":"assets/context/works/original-spring-outing.jpg",
    "簪花仕女图奶蛙":"assets/context/works/original-ladies-flowers.jpg",
    "清明上河图奶蛙":"assets/context/works/original-qingming.jpg",
    "寒江独钓图奶蛙（写意）":"assets/context/works/original-cold-river.jpg",
    "富春山居图奶蛙":"assets/context/works/original-fuchun.jpg",
    "百骏图奶蛙":"assets/context/works/original-hundred-horses.jpg",
    "虾趣奶蛙":"assets/context/works/original-shrimp.jpg",
    "女史箴图奶蛙（工笔）":"assets/context/works/original-luoshen-scroll.jpg",
    "韩熙载夜宴图奶蛙":"assets/context/works/original-night-revels.jpg",
    "乔托逃往埃及奶蛙":"assets/context/works/medieval2-giotto-flight-egypt.jpg",
    "杜乔进入耶路撒冷奶蛙":"assets/context/works/medieval2-duccio-entry-jerusalem.jpg",
    "圣乔治屠龙奶蛙":"assets/context/works/medieval2-burne-jones-st-george.jpg",
    "贝娅塔·贝亚特丽克斯奶蛙":"assets/context/works/original-beata-beatrix.jpg",
    "水晶球奶蛙":"assets/context/works/original-crystal-ball.jpg",
    "看哪，主的婢女奶蛙":"assets/context/works/original-ecce-ancilla.jpg",
    "圣西塞莉亚奶蛙":"assets/context/works/original-saint-cecilia.jpg",
    "玫瑰之魂奶蛙":"assets/context/works/original-soul-of-the-rose.jpg",
    "圣巴塞洛缪节前夕的胡格诺派奶蛙":"assets/context/works/original-huguenot.jpg",
    "废墟中的爱奶蛙":"assets/context/works/original-love-among-ruins.jpg",
    "释放令，1746奶蛙":"assets/context/works/original-order-release.jpg",
    "蓝色凉亭奶蛙":"assets/context/works/original-blue-bower.jpg",
    "石工奶蛙":"assets/context/works/original-stone-breakers.jpg",
    "伏尔加河上的纤夫奶蛙":"assets/context/works/original-barge-haulers.jpg",
    "三等车厢奶蛙":"assets/context/works/original-third-class-carriage.jpg",
    "晚钟奶蛙":"assets/context/works/original-angelus.jpg",
    "抢球奶蛙":"assets/context/works/original-snap-the-whip.jpg",
    "泷夜叉姬与骷髅妖怪奶蛙":"assets/context/works/ukiyoe-takiyasha.jpg",
    "金太郎捕鲤鱼奶蛙":"assets/context/works/ukiyoe-kintaro.jpg",
    "包厢奶蛙":"assets/context/works/impressionism-renoir-loge.jpg",
    "布吉瓦尔之舞奶蛙":"assets/context/works/impressionism-renoir-bougival.jpg",
    "伞奶蛙":"assets/context/works/impressionism-renoir-umbrellas.jpg",
    "蓝色扶手椅上的小女孩奶蛙":"assets/context/works/impressionism-cassatt-blue-armchair.jpg",
    "玩纸牌的奶蛙":"assets/context/works/postim-cezanne-cardplayers.jpg",
    "大碗岛的星期天下午奶蛙":"assets/context/works/postim-seurat-jatte.jpg",
    "罗纳河上的星夜奶蛙":"assets/context/works/postim-vangogh-rhone.jpg",
    "萨莫色雷斯的胜利女神奶蛙":"assets/context/works/anc3-nike.jpg",
    "休息的拳击手奶蛙":"assets/context/works/anc3-boxer.jpg",
    "拉奥孔群像奶蛙":"assets/context/works/anc3-laocoon.jpg",
    "汉谟拉比法典石碑奶蛙":"assets/context/works/anc3-hammurabi.jpg",
    "第一门的奥古斯都奶蛙":"assets/context/works/anc3-augustus.jpg"
  };
  if(localOriginals[w.zh])w.originalImage=localOriginals[w.zh];
});

// Each work keeps its own introduction, critical note and artwork anecdote.
const WORK_INTRO={
  "构成八号奶蛙":"《构成八号》是康定斯基成熟抽象时期的代表作，以圆形、三角形、直线与弧线组成一幅不依赖具体形象的视觉乐章。作品强调色彩和几何关系本身的表现力。",
  "睡莲中的奶蛙":"《睡莲》属于莫奈晚年持续创作的系列。他以吉维尼花园中的池塘为主题，将水面、睡莲、天空倒影和空气光线压缩在同一片观看空间中。",
  "神奈川冲浪奶蛙":"《神奈川冲浪里》是北斋《富岳三十六景》中的名作。巨浪、舟船与远处富士山构成鲜明尺度对照，画面表现了自然力量与人的脆弱。",
  "三个音乐家奶蛙":"《三个音乐家》描绘三位穿着戏剧服装的演奏者，是毕加索综合立体主义时期的重要作品。人物、乐器和背景被拆分后重新组合，形成富有拼贴感的平面空间。",
  "撑阳伞的奶蛙":"莫奈的《撑阳伞的女人》描绘户外草地上的人物，画面从低处仰视天空与伞面。人物并非被安排在静止的肖像姿态中，而是处于风、光与空气的变化之中。",
  "呐喊的奶蛙":"《呐喊》是蒙克围绕焦虑主题创作的代表性图像。桥上的人物、血红色天空和波动的线条共同构成心理空间，现实景物由此转化为情绪的视觉象征。",
  "星月奶蛙夜":"《星月夜》创作于梵高在圣雷米疗养期间。画面将夜空、星辰、柏树与村庄组织成上下对照的空间，现实风景在旋转笔触中获得强烈的精神性。",
  "米洛斯的奶蛙":"《米洛斯的维纳斯》是一件希腊化时期的大理石雕像，现藏于卢浮宫。作品以裸身、扭转的躯干和理想化比例表现古典雕塑关于身体与美的观念。",
  "哥特奶蛙圣母院":"巴黎圣母院是法国哥特建筑的重要实例，始建于十二世纪。尖拱、飞扶壁、肋拱顶和玫瑰窗共同塑造了向上延伸、充满彩色光线的宗教空间。",
  "圣母子与奶蛙":"契马布埃的圣母像延续金色背景和庄严正面的圣像传统，同时开始加强人物的体积、衣褶和情感关系。作品体现了意大利绘画从中世纪走向文艺复兴的过渡。",
  "阿尔塔米拉的奶蛙":"阿尔塔米拉洞窟壁画以野牛、马和鹿等动物为主要题材，创作者利用洞壁天然起伏表现身体的立体感。它是史前艺术中最具代表性的动物形象遗存之一。",
  "最后的晚餐奶蛙":"《最后的晚餐》表现耶稣宣布门徒中有人将背叛自己的瞬间。达·芬奇以透视线、手势和人物分组控制叙事节奏，使餐桌成为一场集中爆发的心理剧场。",
  "创造奶蛙":"《创造亚当》位于西斯廷礼拜堂天顶，是米开朗基罗最为人熟知的构图之一。上帝与亚当的手指相向而未触，象征生命、意识与神圣力量之间的传递。",
  "雅典学院的核心奶蛙":"《雅典学院》将古希腊哲学家置于宏伟建筑内部，中央的柏拉图与亚里士多德分别指向理念与现实。作品以理想化空间呈现文艺复兴的人文主义秩序。",
  "岩画手印奶蛙":"《手印洞岩画》由大量负形手印和赭红色痕迹组成，是史前人类留下身体存在证明的典型方式。个体印记在反复覆盖中转化为集体性的图像。",
  "塞拉山奔跑奶蛙":"塞拉山岩画描绘狩猎、舞蹈与采集等活动，人物以简洁线条和连续姿态出现。作品关注行动与群体关系，具有鲜明的叙事性。",
  "石阵仪式奶蛙":"巨石阵由大型石块按照明确轴线和环形关系排列而成，兼具纪念性、仪式性与天文观测意味。它将人工结构嵌入开阔地景，形成强烈的空间秩序。",
  "岩刻游行奶蛙":"卡莫尼卡山谷岩刻记录了武器、农耕、房屋和人物活动，图像以线性刻痕直接进入岩石表面。不同年代的叠加使它同时成为艺术与历史档案。",
  "洞窟攀岩奶蛙":"肖维洞窟壁画集中表现奔跑、攀爬和群体动物，画面常借助岩壁形状和轮廓重叠制造运动感。洞窟的黑暗环境也是作品观看方式的一部分。",
  "雪中桥奶蛙":"广重的雪景以桥梁、旅人和大面积留白构成安静的空间。低饱和蓝灰色调与精确的线性构图，使短暂天气成为具有诗意的日常景观。",
  "干草堆奶蛙":"莫奈的《干草堆》系列以同一组乡村堆垛为对象，观察不同时间、季节和天气下的光色变化。固定物体因此成为研究视觉感知的载体。",
  "拾穗者奶蛙":"米勒的《拾穗者》描绘收割后在田地中拾取遗穗的三位农妇。作品把普通劳动者置于宏大画面中心，使乡村生活获得严肃而具有社会意义的表现。",
  "梅杜萨之筏奶蛙":"《梅杜萨之筏》取材于法国海军护卫舰失事后的真实事件，描绘幸存者在海上等待救援的时刻。籍里柯将新闻事件转化为规模宏大的历史画。",
  "雨天的巴黎街道奶蛙":"《雨天的巴黎街道》展现奥斯曼改造后的巴黎大道。伞、路面、建筑和人物在透视网格中展开，现代城市的秩序感与陌生感同时成为主题。",
  "沉睡的吉普赛人奶蛙":"《沉睡的吉普赛人》描绘月光下熟睡的旅人与一头狮子。静止人物、异域动物和沙漠环境被安排在平面化的梦境空间中，形成超现实的叙事氛围。",
  "奥菲莉亚奶蛙":"米莱斯的《奥菲莉亚》取材于莎士比亚戏剧，表现人物溺水前后的静止瞬间。河流中的植物被细致描绘，文学悲剧与自然景观因此紧密交织。",
  "1808年5月3日奶蛙":"戈雅的《1808年5月3日》记录马德里起义者遭到枪决的历史场景。白衣人物面对枪口，成为画面中最强烈的光源与道德焦点。",
  "自由引导人民奶蛙":"《自由引导人民》以1830年法国七月革命为背景，寓言化的自由女神带领不同社会阶层越过街垒。现实事件与象征人物在同一画面中汇合。",
  "浪子回头奶蛙":"伦勃朗的《浪子回头》取材于《新约》寓言，描绘浪子归来并得到父亲接纳的瞬间。画面将复杂叙事压缩为一次拥抱与几道温暖的光。",
  "向日葵奶蛙":"梵高的《向日葵》系列以花瓶中的向日葵为主题，涵盖盛放、衰败与枯萎的不同状态。黄色系色彩被推向饱和强度，静物因此具有鲜明的生命感。",
  "圣维克多山奶蛙":"圣维克多山是塞尚反复描绘的故乡景观。山体、树木、房屋与天空被归纳为相互支撑的色面，风景由此成为关于结构和观看的长期研究。"
};
const WORK_EDITORIAL={
  "构成八号奶蛙":"画面以圆、三角、斜线和网格构成非叙事性的视觉节奏。冷暖色块彼此牵制，几何形并非自然物的替代，而是独立的精神与听觉秩序。",
  "睡莲中的奶蛙":"莫奈取消明确地平线，把水面、倒影与睡莲组织成连续的色彩场。短促笔触不再描摹物体边界，而是捕捉光线在观看过程中的流动。",
  "神奈川冲浪奶蛙":"巨浪形成压迫性的弧线，远处富士山以极小尺度稳定画面。平面化构图、有限色版与大胆裁切，体现浮世绘对现代视觉设计的影响。",
  "三个音乐家奶蛙":"毕加索将人物、乐器与空间拆解为相互嵌合的平面。重叠的轮廓压缩了深度，却强化了形体之间的节奏，呈现综合立体主义的结构意识。",
  "撑阳伞的奶蛙":"仰视构图让人物被天空包围，伞面、裙摆与草地形成连续的风感。莫奈以明亮色斑记录户外光线，使人物更像瞬间天气中的视觉印象。",
  "呐喊的奶蛙":"桥梁的斜向透视与起伏的天空共同制造不稳定感。形体被情绪化地拉伸，色彩不再服务于再现，而成为焦虑、孤独与存在压力的直接表达。",
  "星月奶蛙夜":"旋涡状笔触将夜空转化为具有运动感的能量场，静止的村庄与翻涌的天体形成对照。柏树承担垂直轴线，使画面在动荡中保持支撑。",
  "米洛斯的奶蛙":"雕像以扭转的身体和稳定的重心体现希腊化时期的动态理想。残缺的双臂并未削弱作品，反而使观看从确定姿态转向对动作与身份的想象。",
  "哥特奶蛙圣母院":"哥特建筑以尖拱、肋架和飞扶壁释放墙体重量，使垂直高度与彩色光线成为空间的主角。结构技术在此同时承担了宗教象征功能。",
  "圣母子与奶蛙":"金色背景和正面构图延续拜占庭圣像传统，但衣褶、身量与目光已显露对真实体积的关注。作品位于中世纪程式与文艺复兴自然主义的过渡处。",
  "阿尔塔米拉的奶蛙":"洞窟壁画借助岩面起伏塑造动物体积，赭红、黑色与岩石本色形成克制的色彩体系。图像与洞穴环境共同构成一种早期的空间绘画。",
  "最后的晚餐奶蛙":"达·芬奇以中央透视线汇聚人物关系，将一句预言造成的瞬间反应分配给十二个不同姿态。戏剧性来自手势、视线与沉默之间的连续叙事。",
  "创造奶蛙":"上帝与亚当的手指在即将接触的瞬间停驻，负空间因此成为生命获得传递的张力来源。宏大的天顶构图被集中到一处极细微的动作。",
  "雅典学院的核心奶蛙":"拱券建筑建立理性而稳定的空间框架，哲人群像则在其中形成思想的对话。中央人物的相反手势，将理念世界与经验世界并置为画面的核心命题。",
  "岩画手印奶蛙":"大量负形手印以重复、覆盖和并置形成群体性的时间痕迹。它们不追求单一主体的肖像，而以身体留下的轮廓确认人与岩壁之间的关系。",
  "塞拉山奔跑奶蛙":"纤细的人形和连续动作构成开放的叙事空间。与洞窟巨兽的体量感不同，作品强调群体行动、速度与日常生活的可读性。",
  "石阵仪式奶蛙":"巨石的重复排列将自然地景转化为具有方向性的仪式空间。作品的形式力量来自重量、间距和天体运行之间的长期对应。",
  "岩刻游行奶蛙":"刻痕以简化的人形、武器和队列记录社会活动。岩面不是被动背景，而是承载不同年代图像叠加的时间性媒介。",
  "洞窟攀岩奶蛙":"洞窟绘画依靠黑暗、火光与岩壁共同完成观看。动物轮廓的重叠和局部擦痕，使静态图像获得运动与现场感。",
  "雪中桥奶蛙":"广重用大面积留白和低饱和蓝灰色制造雪景的寂静。桥梁的斜线引导视线穿越画面，微小旅人则成为尺度与时间的提示。",
  "干草堆奶蛙":"干草堆作为固定母题被置于不同光线与季节中观察。形体的色彩边缘随着时间变化，说明印象派关注的是观看条件，而非物体的恒定外观。",
  "拾穗者奶蛙":"三位劳动者弯腰拾取遗落麦穗，低视点强调身体的重量与劳动的重复性。沉稳的土色调削弱戏剧修辞，使社会现实进入大型绘画的尺度。",
  "梅杜萨之筏奶蛙":"漂流者被组织成向远方信号逐步升高的金字塔，绝望与希望因此在同一构图中并存。粗粝的肉身、海浪与天空共同强化历史事件的现场感。",
  "雨天的巴黎街道奶蛙":"宽阔街道、伞面和湿润路面构成现代城市的几何秩序。人物被安排在透视网格中，既显得匿名，又体现都市生活的流动与疏离。",
  "沉睡的吉普赛人奶蛙":"沉睡人物、狮子与月光被安排在近乎舞台化的平面空间中。作品以简化而精确的轮廓，把现实观察与异域想象结合为梦境式叙事。",
  "奥菲莉亚奶蛙":"水面上的花草被逐一辨认，人物的静止与环境的繁茂形成反差。前拉斐尔派以细密自然观察承载文学叙事，使死亡呈现为缓慢而明亮的转化。",
  "1808年5月3日奶蛙":"夜色中的枪决队列与白衣人物形成道德对照。强光集中照亮受难者，粗重笔触和不稳定空间拒绝将战争美化为英雄叙事。",
  "自由引导人民奶蛙":"自由的寓言人物跨过 barricade 与尸体向前推进，三角形构图把不同阶层汇聚到同一行动方向。烟雾、旗帜与城市背景共同构成革命的公共舞台。",
  "浪子回头奶蛙":"暗背景中，父亲的手与浪子低垂的身体成为情感焦点。伦勃朗用厚重的暖色光线取代戏剧动作，让宽恕通过触觉、姿态和沉默发生。",
  "向日葵奶蛙":"向日葵被压缩在花瓶与画面边界之间，饱和黄色综合了花瓣、背景和光线。重复的花形在盛放与凋萎之间形成关于时间的静物寓言。",
  "圣维克多山奶蛙":"山体、树木与房屋被拆分为相互支撑的色面，空间不依赖单一透视点而逐层建立。塞尚以结构化观看连接印象派与现代绘画。"
};
const WORK_TRIVIA={
  "构成八号奶蛙":"据说康定斯基会把颜色与乐器对应，画室里常用音乐来检验画面的节奏。",
  "睡莲中的奶蛙":"莫奈亲自挖池种莲，晚年仍反复回到同一片水面作画；据说他最在意的是倒影，不是花本身。",
  "神奈川冲浪奶蛙":"这幅画里的富士山小得几乎被浪吞没，却因此成为画面最稳定的视觉锚点。",
  "三个音乐家奶蛙":"画中人物身份一直存在不同解读，毕加索似乎故意让面具、乐器和人物彼此混淆。",
  "撑阳伞的奶蛙":"莫奈从低处仰拍妻子与儿子，画面像一帧被风突然截取的家庭快照。",
  "呐喊的奶蛙":"蒙克曾写下黄昏天空变红、自然仿佛传来尖叫；这段文字后来成了作品最著名的传闻来源。",
  "星月奶蛙夜":"画中的村庄并非疗养院窗外的准确景色，梵高把记忆、想象和南法夜色重新拼成了它。",
  "米洛斯的奶蛙":"雕像出土时双臂已经缺失，究竟是在古代还是出土前后损坏，至今仍有争论。",
  "哥特奶蛙圣母院":"巴黎圣母院的玫瑰窗不是单纯装饰，它们同时承担采光、叙事和组织信徒视线的作用。",
  "圣母子与奶蛙":"契马布埃与乔托的师徒故事主要来自后世记载，真假难以确认，却象征了绘画观念的转折。",
  "阿尔塔米拉的奶蛙":"洞窟壁画最初被不少学者当成伪作，直到更多史前遗址被发现后才获得承认。",
  "最后的晚餐奶蛙":"达·芬奇采用干壁画实验来保留修改空间，代价是作品很早就开始出现剥落。",
  "创造奶蛙":"有人认为上帝身后的红色形体暗示了人脑，但这一解读始终属于艺术史中的有趣推测。",
  "雅典学院的核心奶蛙":"拉斐尔把同时代艺术家画进古代哲人群像，画面因此像一场跨越时代的朋友圈聚会。",
  "岩画手印奶蛙":"手印多为左手，因为右手常要拿着吹喷颜料的管子；它们像史前时代的签名。",
  "塞拉山奔跑奶蛙":"这类岩画常被称为“地中海岩画艺术”，小型人物的动作感在史前图像中十分突出。",
  "石阵仪式奶蛙":"巨石阵的主轴与冬至日落方向对应，关于它是否兼具历法功能的讨论延续至今。",
  "岩刻游行奶蛙":"卡莫尼卡山谷的岩刻跨越数千年，同一片岩面上常能看到不同时代的图像叠层。",
  "洞窟攀岩奶蛙":"肖维洞窟深处留有火炬擦痕和脚印，说明观看和作画本身也可能是仪式的一部分。",
  "雪中桥奶蛙":"广重常用突然截断的树枝、桥梁和屋檐制造画外空间，后来影响了不少欧洲画家。",
  "干草堆奶蛙":"莫奈为追踪光线变化同时推进多幅画，有时会根据天气在几块画布之间来回切换。",
  "拾穗者奶蛙":"“拾穗”原本是收割后捡拾剩余麦穗的权利，这个日常动作在当时带有鲜明的社会阶层意味。",
  "梅杜萨之筏奶蛙":"籍里柯采访幸存者并在画室制作木筏模型，创作过程几乎像一次历史现场调查。",
  "雨天的巴黎街道奶蛙":"卡耶博特家境优渥，曾购买并收藏印象派作品；他把巴黎街道当成了自己的城市实验室。",
  "沉睡的吉普赛人奶蛙":"卢梭并未真正去过热带雨林，作品里的异域植物主要来自植物园、动物园和图像资料。",
  "奥菲莉亚奶蛙":"米莱斯为了画出水中花草，让模特长时间躺在加热浴缸里，灯熄灭后还引发了赔偿趣闻。",
  "1808年5月3日奶蛙":"画中白衣人物的姿态常被视为对宗教受难图像的转写，使现实暴力带上了悲剧性的象征意味。",
  "自由引导人民奶蛙":"德拉克罗瓦未必亲历街垒战斗，但他用当代新闻般的城市背景把寓言人物拉回了现实政治。",
  "浪子回头奶蛙":"画面里父亲的两只手被认为有意画得不同：一只偏阳刚，一只偏柔和，强化了宽恕的复杂性。",
  "向日葵奶蛙":"梵高曾把向日葵系列设想为迎接高更的房间装饰，希望黄色花朵能制造一种“太阳”的气氛。",
  "圣维克多山奶蛙":"塞尚一生反复画圣维克多山，后来甚至有人把这座山称为他个人绘画方法的实验场。",
  "夜游者奶蛙":"霍普很少解释《夜游者》的具体故事，画中深夜餐馆的玻璃窗因此成为都市孤独的经典象征。",
  "雪中猎人奶蛙":"《雪中猎人》属于布鲁盖尔的四季系列，据说原本共有六幅，如今只保存下五幅。",
  "阿黛尔的肖像奶蛙":"这幅肖像在二战期间被纳粹掠夺，后来经过漫长诉讼才回到阿黛尔家族后人手中。",
  "大使们奶蛙":"画面前景的拉长物体只有从侧面观看才显出骷髅形状，是艺术史上著名的变形透视谜题。"
};
Object.assign(WORK_INTRO,{
  "萨莫色雷斯的胜利女神奶蛙":"《萨莫色雷斯的胜利女神》以迎风前倾的身体和后掠双翼表现胜利降临的瞬间，衣褶在风中翻卷。奶蛙替代原作残缺的身体，肩部同样以断臂平面收束。",
  "休息的拳击手奶蛙":"《休息的拳击手》以疲惫的坐姿和转头凝视刻画赛后的一刻，双手缠带仍是拳击装备。奶蛙青铜像保留了铜绿包浆与不对称的身体重量。",
  "拉奥孔群像奶蛙":"《拉奥孔群像》以三人与巨蛇的缠绕组织出痛苦与挣扎的螺旋结构。奶蛙替代中央父亲，与两个大理石人子共同维持原作的叙事张力。",
  "汉谟拉比法典石碑奶蛙":"《汉谟拉比法典石碑》顶部浮雕表现国王向太阳神沙玛什领受权杖的场面。幼态奶蛙站立法老位置，浅浮雕、闪长岩与楔形文字均保持原作语言。",
  "第一门的奥古斯都奶蛙":"《第一门的奥古斯都》以演讲手势、胸甲浮雕与小爱神组织帝王的理想化形象。奶蛙仅替换头部，身体与铭文保持原作大理石语言。",
  "雾海上的旅人奶蛙":"弗里德里希《雾海上的旅人》以背面站立人物面对雾海与远峰，把崇高感压缩在背影与风景之间。成熟态奶蛙穿同一深色外套、持同一手杖，背影读为圆钝后脑与连续肩背。",
  "但丁之舟奶蛙":"德拉克罗瓦《但丁之舟》以摇晃木船、受难者与燃烧城市天际组织地狱入口的恐惧。成熟态奶蛙保留红帽白袍的但丁角色与抬手示警。",
  "梦魇奶蛙":"富塞利《梦魇》以沉睡女子、蹲伏梦魇魔与马头幽灵制造哥特式压迫。成熟态奶蛙蹲伏在女子躯干上，维持原作的压迫性蹲姿与凝视。",
  "干草车奶蛙":"康斯太勃尔《干草车》以干草车、农舍、橡树与暴云天空组织英国乡村的日常秩序。幼态奶蛙坐上干草车，身体服从夏日的散碎光斑。",
  "墓园孤儿奶蛙":"德拉克罗瓦《墓园孤儿》以半身像、目光上抬与墓园暮色组织少女的不安。幼态奶蛙穿同一白衣棕巾，视线向上。",
  "纳芙蒂蒂头像奶蛙":"古埃及《纳芙蒂蒂头像》约创作于公元前1345年，以彩绘石灰岩塑造王后的高冠、长颈与克制的三分之四侧面。作品将王权形象与极度精炼的肖像形式结合。",
  "德尔斐御者奶蛙":"《德尔斐御者》约铸于公元前478年，是古希腊早期古典时期保存最完整的青铜像之一。御者以正面站姿、垂直褶衣和手中缰绳呈现胜利后的克制与秩序。",
  "夜游者奶蛙":"爱德华·霍普的《夜游者》描绘深夜仍灯火通明的城市餐馆，四位人物隔着玻璃被置于同一静止场景中。明亮室内与空旷街道形成强烈反差。",
  "雪中猎人奶蛙":"布鲁盖尔的《雪中猎人》是四季系列中的冬景作品。猎人从前景归来，远处村庄、冰面和山谷展开为一幅俯瞰式乡村全景。",
  "阿黛尔的肖像奶蛙":"克里姆特的《阿黛尔·布洛赫-鲍尔肖像一号》将人物肖像置于金色装饰背景中。几何纹样、珠宝与织物相互融合，使人物既具体又近似圣像。",
  "大使们奶蛙":"霍尔拜因的《大使们》是一幅双人肖像，人物之间陈列着天球仪、科学仪器、乐器与书籍。前景的变形物体为画面加入关于知识、时间与死亡的隐喻。"
});
Object.assign(WORK_EDITORIAL,{
  "墓园孤儿奶蛙":"低地平线与暮色天空把不安收束在少女抬起的视线上；十字架与远处树影提供叙事锚点。少女的宽眼与紧凑身形在同一视线方向中延续原作的紧张。"
});
Object.assign(WORK_TRIVIA,{
  "墓园孤儿奶蛙":"这幅小画常被视为德拉克罗瓦《希奥岛的屠杀》人物研究的独立成品，目光方向与服饰在两作中几乎一致。"
});
Object.assign(WORK_EDITORIAL,{
  "雾海上的旅人奶蛙":"背影让人物与风景合为一片崇高：雾海与岩脊占画面下三分之二，天空留出高度。后脑轮廓和手杖让身份在“未看见面”的缺席中成立。",
  "但丁之舟奶蛙":"德拉克罗瓦的紧张来自船体的横向颠簸与受难者的斜向动作线。但丁的抬手在红帽白袍秩序中制造焦点，但不打破船体与水面的平衡。",
  "梦魇奶蛙":"富塞利用红幔、暗色和马头幽灵把压塞压缩到女子躯干上的小梦魇魔。蹲伏的梦魇魔与凝视让压迫感通过身体重量和视线传递。",
  "干草车奶蛙":"康斯太勃尔的干草车靠河中静止与云天动态拉出乡村的时间感。车中人物的小尺寸服从干草车的车体重量与树木轮廓。"
});
Object.assign(WORK_TRIVIA,{
  "雾海上的旅人奶蛙":"《雾海上的旅人》被反复解读为浪漫主义崇高的视觉宣言；弗里德里希对人物身份始终未做明确记载，使其成为现代观看的象征。",
  "但丁之舟奶蛙":"《但丁之舟》是德拉克罗瓦在沙龙的首次重大成功，也是他从学院走向浪漫主义的起点。",
  "梦魇奶蛙":"《梦魇》在1782年皇家学院展览上引发轰动，梦魇魔的形象后来被反复复制和戏仿。",
  "干草车奶蛙":"《干草车》在巴黎沙龙获1824年金质奖章，其天空画法对法国浪漫主义和巴比松派都有直接影响。"
});
Object.assign(WORK_EDITORIAL,{
  "萨莫色雷斯的胜利女神奶蛙":"白石雕像的前倾对角线由跨步的双腿和后掠双翼共同锁定，衣褶沿身体侧面翻卷形成风的方向。断肩平面与残缺的手臂共同构成雕像的当前形态，腹部石面在光下产生柔和的过渡。",
  "休息的拳击手奶蛙":"铜绿与铜红的包浆覆盖全身，缠带刻痕和指节弧度体现青铜铸造的精度。不对称坐姿让头部转向成为整件作品的视觉重心，疲惫感由身体重量自然传递。",
  "拉奥孔群像奶蛙":"巨蛇从中央身体缠绕至两侧双子，螺旋动势在大理石上达到极限张力。后仰躯干与蛇体形成对抗，两个大理石人子的表情维持原作的惊惧层次。",
  "汉谟拉比法典石碑奶蛙":"浅浮雕让国王的身体轮廓在闪长岩表面上以细密刻线呈现，权杖符号位于两者之间成为叙事支点。下方楔形文字维持碑面的仪式性密度。",
  "第一门的奥古斯都奶蛙":"胸甲浮雕的人物群像与奶蛙头部的简洁表面形成对照，披风褶皱和小爱神维持原作的肖像性。头部的浅刻细节服从大理石的克制。"
});
Object.assign(WORK_TRIVIA,{
  "萨莫色雷斯的胜利女神奶蛙":"雕像于1863年在萨莫色雷斯岛被发现，原为纪念海战胜利而立于山巅神殿喷泉之上，头与双臂始终未寻回。",
  "休息的拳击手奶蛙":"雕像耳部有镶嵌铜铸伤疤的痕迹，拳击手缠带为当时运动装备；1885年在罗马奎里纳莱山出土时仍保持完整。",
  "拉奥孔群像奶蛙":"1506年在罗马出土时米开朗基罗亲往观摩，其断裂右臂曾引发数百年争论，直到近代考古才复原为向后弯折的姿态。",
  "汉谟拉比法典石碑奶蛙":"石碑刻有282条法律条文，是现存最完整的美索不达米亚法典；1901年由法国考古队在伊朗苏萨发掘。",
  "第一门的奥古斯都奶蛙":"雕像1863年出土于罗马近郊利维亚别墅，胸甲上的帕提亚归旗浮雕被视为奥古斯都和平宣传的核心图像。"
});
Object.assign(WORK_EDITORIAL,{
  "纳芙蒂蒂头像奶蛙":"高冠、胸像角度和黑色负空间共同强化轮廓。彩绘表面并不追求华丽体量，而以有限色块、细长比例和不对称视线建立庄严感。",
  "德尔斐御者奶蛙":"长袍褶线把视线稳定地引向地面，正面姿态与微妙重心变化形成静中有动的平衡。青铜包浆让形体呈现沉着而冷静的古典力量。",
  "夜游者奶蛙":"霍普以锐利的建筑透视和大面积玻璃切开夜色，室内光线越清晰，人物之间的隔绝感越强。画面的沉默来自可见却无法互通的城市关系。",
  "雪中猎人奶蛙":"高视点把归来的猎人、结冰水面和远山组织成层层递进的空间。冷灰、褐绿与白色构成冬季的整体色调，细节则维持乡村生活的秩序感。",
  "阿黛尔的肖像奶蛙":"克里姆特以金色平面压缩传统肖像的空间深度，再以眼神、手势和脸部的柔软体积恢复人物存在。装饰并未遮蔽主体，而是将身份转化为视觉符号。",
  "大使们奶蛙":"双人肖像采用近乎正面的稳定构图，丰富器物构成知识与权力的图像清单。前景的斜向变形打破秩序，使死亡意识突然穿入理性世界。"
});
Object.assign(WORK_TRIVIA,{
  "纳芙蒂蒂头像奶蛙":"头像于1912年在阿玛尔纳的图特摩斯作坊遗址出土，其保存完整的彩绘与未完成的一侧眼睛，至今仍引发关于用途和制作过程的讨论。",
  "德尔斐御者奶蛙":"雕像原本属于一组更大的战车纪念群像。地震掩埋反而保护了青铜，使它逃过古代大量青铜雕塑被熔化重铸的命运。"
});
Object.assign(WORK_INTRO,{
  "新石器彩陶纹样奶蛙":"作品以新石器时代彩陶为原型，将圆腹器形、矿物颜料和重复几何纹样组织成早期器物图像。奶蛙被压缩为器壁上的平面纹样，强调身体轮廓与集体装饰之间的关系。",
  "神人兽面纹玉琮奶蛙":"作品以良渚文化玉琮为原型，将方圆相套的器形、层叠纹带和神人兽面浅浮雕转译为奶蛙的玉雕身份。放大的黑色瞳孔成为中心面具的视觉锚点。",
  "四羊方尊奶蛙":"作品以商代四羊方尊为原型，保留方尊的高颈、方体、圈足、饕餮纹和雷纹结构，将四个转角的羊首改铸为奶蛙首。"
});
Object.assign(WORK_EDITORIAL,{
  "新石器彩陶纹样奶蛙":"赭红、黑色与陶土本色构成克制的平面秩序，重复纹样把奶蛙从单一角色转化为器物表面的集体记号。观看重点在器形、节奏和手工痕迹的相互制约。",
  "神人兽面纹玉琮奶蛙":"玉琮的方形外轮廓与圆形内孔形成稳定的天地结构，浅浮雕在光线移动时才逐渐显现。放大的黑瞳为严整的神面加入了克制而明确的角色识别。",
  "四羊方尊奶蛙":"方尊以重量、对称和密集纹饰建立礼器的威严，四个转角的奶蛙首将动物性图腾转化为统一身份。青铜包浆让细部在暗部中保持层次。"
});
Object.assign(WORK_TRIVIA,{
  "新石器彩陶纹样奶蛙":"新石器彩陶常在烧制前以矿物颜料绘制，器物出窑后颜色会因火候和土质产生细微差异。",
  "神人兽面纹玉琮奶蛙":"玉琮的方圆形制曾被后世解释为沟通天地的象征，但其具体用途仍有多种学术观点。",
  "四羊方尊奶蛙":"四羊方尊出土后因器形和纹饰复杂而成为商代青铜礼器的代表，四角羊首同时承担装饰与结构作用。"
});
Object.assign(ARTIST_BIO,{
  "Thutmose":{name:"图特摩斯",life:"约公元前14世纪",story:"图特摩斯是阿玛尔纳时期的宫廷雕塑家，其作坊遗址出土了《纳芙蒂蒂头像》和大量王室肖像习作。有关他的生平记录极少，但这些作品显示出作坊对比例、彩绘和人物观察的精密训练。"}
});
Object.assign(WORK_INTRO,{
  "以马忤斯的晚餐奶蛙":"卡拉瓦乔的《以马忤斯的晚餐》把一场认出身份的瞬间压缩在餐桌周围。中央人物的手势、两侧门徒的惊愕和白桌布上的食物共同构成戏剧的视觉中心。",
  "绘画的艺术奶蛙":"维米尔的《绘画的艺术》把画家、模特、地图和画布安排在一个安静的室内。左侧帷幕像舞台入口，背对观者的画家则把观看本身纳入作品。",
  "布商同业公会理事奶蛙":"伦勃朗的《布商同业公会理事》描绘阿姆斯特丹布商行会的管理者。五个人围绕红桌布展开，姿态和目光让集体肖像具有即时的现场感。",
  "绘画寓意的自画像奶蛙":"阿尔泰米西娅·真蒂莱斯基以自己的形象表现绘画寓意，人物向左上方伸展，画笔、调色板和绿色衣袖共同形成强烈的行动对角线。",
  "油灯前的抹大拉奶蛙":"乔治·德·拉·图尔的《油灯前的抹大拉》以单一火焰照亮沉思中的人物。骷髅、书本和绳索把时间、死亡与内省压缩在一张安静的桌面上。"
});
Object.assign(WORK_EDITORIAL,{
  "以马忤斯的晚餐奶蛙":"卡拉瓦乔用近距离视点和强烈明暗把观者拉到桌边。人物手臂向外突破画面，食物与布料的触感强化了神迹发生的当下性。",
  "绘画的艺术奶蛙":"维米尔以柔和侧光和精确透视建立室内秩序。地图与棋盘地面提供稳定结构，帷幕和背影则保留观看的距离。",
  "布商同业公会理事奶蛙":"深色木墙、红桌布和白领构成低调而有重量的色彩体系。不同人物的坐姿、转身和直视让一张正式团体肖像保持叙事张力。",
  "绘画寓意的自画像奶蛙":"斜向构图把绘画从静态职业转化为身体动作。手臂、画笔与调色板在深色背景中形成连续路径，体现巴洛克对运动和瞬间的偏爱。",
  "油灯前的抹大拉奶蛙":"拉图尔把大面积暗部留给沉默，把唯一火焰变成画面的时间刻度。硬朗剪影与温暖反光共同制造内省而克制的戏剧。"
});
Object.assign(WORK_TRIVIA,{
  "以马忤斯的晚餐奶蛙":"卡拉瓦乔把左侧门徒的手臂画得几乎伸出画面，制造观者被拉入餐桌现场的错觉。",
  "绘画的艺术奶蛙":"维米尔画中的地图是真实的荷兰地图类型，画家用它把私人工作室与更大的地理世界连接起来。",
  "布商同业公会理事奶蛙":"画面右侧人物像是刚刚抬头迎接来访者，使正式团体肖像出现了瞬间性的动作。",
  "绘画寓意的自画像奶蛙":"这件作品长期被认为是阿尔泰米西娅以自己的姿态回应艺术家身份与职业尊严的宣言。",
  "油灯前的抹大拉奶蛙":"拉图尔反复描绘抹大拉与火焰主题，不同版本在骷髅、镜子和火光关系上各有变化。"
});
Object.assign(ARTIST_BIO,{
  "Caravaggio":{name:"卡拉瓦乔",life:"1571–1610",story:"卡拉瓦乔以强烈的明暗对照和把普通人带入宗教画而改变了巴洛克绘画。他常让人物穿着当时人的衣服、站在近距离的暗室里，使神圣事件像发生在观者眼前。"},
  "Johannes Vermeer":{name:"约翰内斯·维米尔",life:"1632–1675",story:"维米尔一生作品数量不多，却以室内光线、安静人物和精确色彩闻名。他常在同一间房里安排地图、乐器、地砖和窗光，让日常空间拥有近乎仪式性的秩序。"},
  "Artemisia Gentileschi":{name:"阿尔泰米西娅·真蒂莱斯基",life:"1593–约1656",story:"阿尔泰米西娅是十七世纪最重要的女性画家之一。她把强烈的巴洛克动作、明暗和心理张力带入历史与寓意题材，也以自己的经历重新定义女性在画面中的主体位置。"},
  "Georges de La Tour":{name:"乔治·德·拉·图尔",life:"1593–1652",story:"乔治·德·拉·图尔擅长在深色背景中使用单一烛火或油灯。他的沉默人物和简化构图把巴洛克戏剧收束为一束光、一件物体和一次内在凝视。"}
});
Object.assign(WORK_INTRO,{
  "秦始皇陵跪射俑奶蛙":"作品以秦始皇陵跪射俑为原型，保留一膝着地、另一膝抬起、身体转向和双手持弓的战备姿态。奶蛙的圆钝头身被译入陶俑体量，铠甲片和火烧土色构成秦俑的沉着质感。",
  "长信宫灯奶蛙":"作品以西汉长信宫灯为原型，保留跪坐宫女托举灯盘、长袖兼作烟道、灯罩可启闭的器物结构。奶蛙身份被铸入鎏金铜像，使宫廷照明、工艺技术和人物姿态合为一体。",
  "击鼓说唱俑奶蛙":"作品以东汉击鼓说唱俑为原型，保留一手举槌、一手抱鼓、身体前倾的表演动作。宽腹、张力十足的四肢和灰陶表面共同记录了汉代俑像对民间表演与身体节奏的兴趣。"
});
Object.assign(WORK_EDITORIAL,{
  "秦始皇陵跪射俑奶蛙":"跪射俑的斜向躯干和前伸双臂形成明确的动作轴线，铠甲的重复单元则把运动稳定在严整的军阵秩序中。陶土颗粒和残留色层让身体与装备保持同一物质性。",
  "长信宫灯奶蛙":"长信宫灯将人物、灯具和烟道组织为连续的垂直结构，灯光功能并非附加装饰，而是器物造型的核心。鎏金表面在暗部的磨损强化了汉代工艺的精密与使用痕迹。",
  "击鼓说唱俑奶蛙":"说唱俑以夸张的抬臂、弯腿和前倾躯干制造连续节奏，静止陶塑因此保留了舞台表演的时间感。鼓面和鼓槌为视觉焦点，身体体量则承载民间娱乐的现场气息。"
});
Object.assign(WORK_TRIVIA,{
  "秦始皇陵跪射俑奶蛙":"秦俑原本大多带有彩绘，出土后颜料与空气接触会迅速褪去，考古保护因此必须争分夺秒。",
  "长信宫灯奶蛙":"长信宫灯的铭文记录了它曾属于长信宫，袖管可以导烟，使实用功能与人物服饰自然结合。",
  "击鼓说唱俑奶蛙":"汉代说唱俑常被称为俳优俑，夸张动作并不只是滑稽表现，也留下了当时表演艺术的身体记忆。"
});
Object.assign(WORK_INTRO,{
  "洛神赋图奶蛙":"作品以东晋顾恺之传《洛神赋图》为原型，保留水岸、流云、飘带、侍从与马匹组成的连续叙事，将奶蛙置于长卷人物画的中心位置。",
  "云冈石窟北魏佛像奶蛙":"作品以北魏云冈石窟佛像为原型，保留石窟龛像、圆形背光、袈裟层次和砂岩凿痕，将奶蛙的简洁脸部身份转译为石雕造像。",
  "竹林七贤与荣启期砖画奶蛙":"作品以南朝墓室砖画《竹林七贤与荣启期》为原型，保留长条砖面、竹林、树石、乐器和八位人物的分段节奏，让每位高士都成为姿态不同的奶蛙。"
});
Object.assign(WORK_EDITORIAL,{
  "洛神赋图奶蛙":"细线勾勒、淡赭设色和水面留白共同建立长卷的流动空间。飘带与马匹的方向线把中心人物连接到画外，使神话叙事在连续观看中展开。",
  "云冈石窟北魏佛像奶蛙":"正面坐像、圆形背光和层层衣褶形成稳定的垂直秩序。砂岩的风化孔隙与刀凿痕迹保留了石窟造像从人工形体回到山体环境的过程。",
  "竹林七贤与荣启期砖画奶蛙":"长条砖画以人物间距、竹林枝干和器物动作组织节奏，留白比细节更能拉开高士之间的精神距离。重复的奶蛙身份成为跨人物的视觉韵律。"
});
Object.assign(WORK_TRIVIA,{
  "洛神赋图奶蛙":"现存《洛神赋图》多为后世摹本，顾恺之原作已不存，长卷的观看顺序因此本身也成为研究对象。",
  "云冈石窟北魏佛像奶蛙":"云冈石窟早期造像曾有鲜艳彩绘与金色痕迹，今天看到的石色并非它们最初的完整面貌。",
  "竹林七贤与荣启期砖画奶蛙":"砖画中的人物身份主要依靠题名、器物和姿态辨认，画面把历史人物与理想化的隐逸生活并置在一起。"
});
Object.assign(ARTIST_BIO,{
  "Gu Kaizhi":{name:"顾恺之",life:"约345–406",story:"顾恺之是东晋重要画家、文学家与理论家，传统上被认为重视人物精神与气韵的传达。他提出以形写神，强调人物的眼神和内在状态；《洛神赋图》虽无真迹传世，后世摹本仍保存了这一长卷叙事传统。"}
});

Object.assign(ARTIST_BIO, {
  "Jacques-Louis David": {name:"雅克-路易·大卫",life:"1748–1825",story:"大卫出生于巴黎一个商人家庭,九岁丧父,由当建筑师的叔辈抚养。他脸上有一道剑伤留下的瘤,说话困难,便把全部激烈都放进了画里。在罗马研习时他背弃了洛可可的甜腻,宣称'我要让古代复活'。<br><br>1784年的《荷拉斯兄弟之誓》用直线、硬光和罗马美德宣告了新古典主义的到来;大革命后他成为雅各宾派的官方画家,甚至投票处死了国王。热月政变入狱、拿破仑加冕首席画师,人生几起几落,最终在滑铁卢之后流亡布鲁塞尔,客死他乡。<br><br>他教出了热拉尔、格罗、安格尔——整个十九世纪上半叶的法国画坛几乎都是他的学生。"},
  "Antonio Canova": {name:"安东尼奥·卡诺瓦",life:"1757–1822",story:"卡诺瓦生于威尼斯共和国的 Possagno,祖父是石匠,他从小在采石场边长大,用黄油雕狮子招待贵族晚宴的传说流传至今。到罗马后他以'让大理石生出皮肉'的天赋征服了整个欧洲,教皇、拿破仑全家都向他订件。<br><br>他为拿破仑妹妹宝琳娜·波吉塞雕的'作为胜利维纳斯的宝琳娜'让整个罗马排队去看;《丘比特之吻唤醒普赛克》则把神话最温柔的一瞬凝进石头。他坚持新古典的克制:先做泥稿与石膏模,再以'七道抛光'让大理石发出皮肤般的光。<br><br>晚年他婉拒了罗马圣路加学院院长之外的一切头衔,临终前还在为故乡设计一座教堂。他的墓志铭写着:在这里安息着欧洲雕像艺术在他手中重登巅峰的卡诺瓦。"}
});

Object.assign(ARTIST_BIO, {
  "Jean-Auguste-Dominique Ingres": {name:"让-奥古斯特-多米尼克·安格尔",life:"1780–1867",story:"安格尔生于法国蒙托邦,父亲是画家兼音乐家。他十二岁进图卢兹学院,十七岁到大卫门下,却与老师的革命激情相反,一生信奉秩序与素描。<br><br>他痴迷拉斐尔与古代,'素描是艺术的良心'是他的信条。1824年《路易十三的誓言》与德拉克洛瓦的《希阿岛的屠杀》同台亮相,新古典与浪漫主义就此开战,安格尔成了前者的大将。《大宫女》多出来的三节脊椎曾遭讥笑,他答:'我追求的是美,不是解剖。'<br><br>晚年的安格尔终于被学院加冕,却说'我六十岁才学会画画'。他一生守护线条,直到最后一张铅笔肖像,仍精确如初。<br><br>《贝尔坦先生肖像》里那位双手撑膝、目光如鹰的报业大亨,被公认为'一个时代的肖像'——资产阶级的自信与傲慢都坐进了那把扶手椅。"},
  "Antoine-Jean Gros": {name:"安托万-让·格罗",life:"1771–1835",story:"格罗生于巴黎,十四岁进大卫画室,是大卫最钟爱的学生之一。大革命期间他旅居意大利,在热那亚为约瑟芬画像,由此被引荐给拿破仑,成了随军画家。<br><br>1804年《拿破仑视察雅法疫病院》让他一夜成名:统帅触碰病员的姿态把宣传画成了史诗,东方的拱廊与鼠疫的阴影里,浪漫主义的色彩已经破土——他无意间成了老师的新古典与浪漫主义之间的桥梁。<br><br>此后他画《埃劳战役》《金字塔战役》,荣誉等身。但老师大卫流亡后,他夹在两种美学之间日渐痛苦。1835年,人们在塞纳河发现他的遗体,口袋里写着'厌倦了人生'的纸条。德拉克洛瓦说:格罗死于没有勇气离开大卫。"}
});

Object.assign(ARTIST_BIO, {
  "Élisabeth Vigée Le Brun": {name:"伊丽莎白·维热·勒布伦",life:"1755–1842",story:"勒布伦生于巴黎,父亲是一位粉彩肖像画家,在她十二岁时死于手术感染。她继承了父亲的画箱,十九岁就开始靠肖像养活全家,二十三岁被召入凡尔赛——因为王后玛丽·安托瓦内特说:'这个女人懂我。'<br><br>此后十年她为王后画了三十多幅肖像,也为整个欧洲的宫廷作画。1789年大革命爆发,她抱着女儿连夜出逃,流亡十三年,从罗马到圣彼得堡,所到之处仍被奉为上宾。<br><br>《画家与她的女儿》画于1786年:她把对女儿朱莉的爱直接画进了拥抱里,温柔得在当时一片矫饰的宫廷肖像中显得突兀。这幅画让她入选皇家学院——在一个女性画家凤毛麟角的时代。她一生作画六百多幅,晚年在回忆录里写:'我画画,是因为我快乐。'"}
});
Object.assign(WORK_INTRO,{
  "唐三彩骆驼载乐俑奶蛙":"作品以唐代三彩骆驼载乐俑为原型，保留骆驼、鞍具、乐队与琥珀绿釉色，将中央乐师改作奶蛙，突出丝路交流和唐代器物的动势。",
  "贝娅塔·贝亚特丽克斯奶蛙":"罗塞蒂把贝娅塔描绘成闭眼仰首、介于现实与精神世界之间的形象。奶蛙保留这份出神状态，让红鸽、罂粟与日晷继续承担原作的象征关系。",
  "水晶球奶蛙":"沃特豪斯把低头凝视水晶球的女子置于拱窗、骷髅与棋盘地面的幽暗室内。奶蛙的侧面视线沿着水晶球下落，使红裙与窗外黑树林共同构成一种静默的预兆。",
  "看哪，主的婢女奶蛙":"罗塞蒂用白墙、蓝色挂毯和红色床架压缩出一间近乎无装饰的宗教室内。圣母的低垂视线与天使递来的百合保持原作的紧张关系，人物不是被动肖像，而是正在接收一个改变命运的消息。",
  "圣西塞莉亚奶蛙":"沃特豪斯把圣西塞莉亚置于花园、海港与远山之间，让闭眼仰首的姿态和左侧音乐家形成安静的听觉空间。奶蛙保留膝上书本、石椅、花朵和晚光，使人物的沉思仍然从原作的音乐关系中生长出来。",
  "玫瑰之魂奶蛙":"沃特豪斯把人物贴近玫瑰的嗅闻动作放在花园、石墙和蓝灰披肩的密集色彩中。奶蛙的闭眼让感官动作成为画面的中心，花枝、建筑和披肩共同维持原作的纵向节奏。",
  "圣巴塞洛缪节前夕的胡格诺派奶蛙":"米莱将拥抱、手帕和即将发生的宗教暴力压缩在一处花园角落。男子的俯身保护动作保留了原作的亲密关系，紫黑服装、藤叶和砖墙则维持画面的紧张背景。",
  "废墟中的爱奶蛙":"伯恩-琼斯把相拥的两人置于冷色废墟与花枝之间，拥抱者的厚重侧身轮廓承接了人物关系的重量。蓝袍、石墙和散落花朵保持原作的静谧悲剧感。",
  "释放令，1746奶蛙":"米莱把归来、拥抱和释放文件组织成同一瞬间。归来者的弯身姿态与深色服装保留了原作的家庭情感和历史压力。",
  "蓝色凉亭奶蛙":"罗塞蒂用蓝绿色花卉背景、深绿披肩和下方弦乐器构成装饰性肖像。人物的侧向视线保持了肖像的安静重量。"
});
Object.assign(WORK_EDITORIAL,{
  "贝娅塔·贝亚特丽克斯奶蛙":"深绿长袍把主体从背景中托起，闭合的眼睑与抬起的头部形成垂直的精神轴线。右侧红鸽携罂粟进入画面，左、右远景人物与日晷共同构成时间、死亡与超验之间的暗示。"
});
Object.assign(WORK_TRIVIA,{
  "贝娅塔·贝亚特丽克斯奶蛙":"罗塞蒂以已故妻子伊丽莎白·西达尔为贝娅塔的形象来源之一，作品因此常被同时阅读为文学人物、私人哀悼与精神幻象。",
  "水晶球奶蛙":"《水晶球》把神秘象征放进日常室内：骷髅、书本、伞和棋盘地面与手中的透明球体并置，形成维多利亚时代常见的沉思与死亡意象。",
  "看哪，主的婢女奶蛙":"这件作品是罗塞蒂早期宗教画的重要尝试，画面刻意回避学院派宏大叙事，以白色空间、日常尺度和不安的姿势表现报喜时刻的心理压力。",
  "圣西塞莉亚奶蛙":"沃特豪斯1895年创作《圣西塞莉亚》。圣塞西莉亚是音乐的主保圣人，传说她在婚礼当天于心中向天主歌唱，因此常被画成手持管风琴或聆听天乐的形象。沃特豪斯把这一传统题材移到户外：玫瑰、石椅、远方的海港与两位演奏者共同把圣乐变成一场可听见的沉思。",
  "玫瑰之魂奶蛙":"《玫瑰之魂》延续了维多利亚绘画对花园、气味和文学感受的兴趣。人物靠近玫瑰的动作很小，却让整幅画从静态肖像转为一段具体的感官经验。",
  "圣巴塞洛缪节前夕的胡格诺派奶蛙":"这幅作品的白色手帕不是普通装饰，而是画面叙事的核心：女子试图为男子系上标志，他却拒绝佩戴。两人的手势因此同时表达爱情、信仰与危险。",
  "废墟中的爱奶蛙":"伯恩-琼斯的作品来自罗伯特·勃朗宁的诗歌，画面将被毁的建筑与仍然相拥的恋人并置，形成爱情超越时间的象征。",
  "释放令，1746奶蛙":"《释放令，1746》描绘的是苏格兰士兵获释归来的一刻，白色文件把私人团聚与历史事件连接起来。",
  "蓝色凉亭奶蛙":"《蓝色凉亭》中的弦乐器、花卉背景和人物服饰共同构成罗塞蒂式的感官装饰空间。"
});
Object.assign(WORK_EDITORIAL,{
  "唐三彩骆驼载乐俑奶蛙":"骆驼的垂直颈线与鞍上乐队形成上下交错的结构，三彩釉色在几何鞍具和人物动作之间产生节奏。奶蛙位于群像前景，成为器物动势的视觉支点。"
});
Object.assign(WORK_TRIVIA,{
  "唐三彩骆驼载乐俑奶蛙":"唐三彩骆驼载乐俑常被视为丝绸之路交流的图像见证，骆驼与乐队组合也记录了长安都市文化的开放性。"
});
Object.assign(WORK_INTRO,{
  "石工奶蛙":"库尔贝的《石工》把两名劳动者置于满地碎石和低压缩的乡村背景中。成熟态奶蛙替代其中一名石工，保留弯身、工具与沉重的劳动尺度。",
  "伏尔加河上的纤夫奶蛙":"列宾的《伏尔加河上的纤夫》沿伏尔加河岸展开一列疲惫的纤夫。成熟态奶蛙位于队列前端，绳索、沙岸、河面与船只共同保留原作的社会现实感。",
  "三等车厢奶蛙":"杜米埃的《三等车厢》描绘拥挤车厢中沉默而疲惫的乘客。成熟态奶蛙置于中央前景，与母亲和孩子、右侧乘客共同构成压缩的群像。",
  "晚钟奶蛙":"米勒的《晚钟》以收割后的田野、远处教堂和晚霞中的两名农人构成安静的祈祷场景。成熟态奶蛙保留右侧人物的低头与双手合拢姿态。",
  "抢球奶蛙":"霍默的《抢球》描绘乡村校舍前男孩们牵手奔跑的游戏。幼态奶蛙进入链条中央，以短粗四肢、侧向视线和圆润体量延续动作的轻快感。"
});
Object.assign(WORK_EDITORIAL,{
  "石工奶蛙":"低视点、碎石前景和两名劳动者的错位姿势共同构成画面的重量。奶蛙的黄色体量被压进库尔贝的褐灰土色与粗粝笔触中，身份转换不改变原作的劳动关系。",
  "伏尔加河上的纤夫奶蛙":"纤夫队列沿绳索形成横向与斜向的复合节奏，疲惫身体的重复才是画面的主角。奶蛙位于最前端，成为观者进入队列和社会现实的尺度入口。",
  "三等车厢奶蛙":"车厢内部的横向长凳和前景三人把视线压低，暗色木墙包围着各自沉默的乘客。奶蛙的成熟体量与杜米埃粗重的形体塑造共享同一室内空气。",
  "晚钟奶蛙":"低地平线把人物压在广阔天空与田野之间，篮子、农具和远处尖塔提供叙事锚点。奶蛙的弯身祈祷姿态延续米勒将劳动转为庄严仪式的观看方式。",
  "抢球奶蛙":"霍默用牵手形成的连续线条把一群男孩组织成瞬间的波形动作，红色校舍稳住背景。幼态奶蛙只替换链条中的一个节点，保留游戏的集体节奏和乡村尺度。"
});
Object.assign(WORK_TRIVIA,{
  "石工奶蛙":"《石工》在第二次世界大战期间毁于轰炸，今天主要通过照片和复制品为人所知。",
  "伏尔加河上的纤夫奶蛙":"列宾曾沿伏尔加河旅行并观察纤夫，画面中的队列因此既是绘画构图，也是对真实劳动处境的记录。",
  "三等车厢奶蛙":"杜米埃曾以石版画和绘画反复描绘公共交通，把现代城市中的阶层差异带进日常场景。",
  "晚钟奶蛙":"《晚钟》最初曾有不同的构图设想，米勒后来把两名农人的祈祷动作收束为田野中央最安静的视觉事件。",
  "抢球奶蛙":"《抢球》最初为哈珀杂志委托的插图构想，后来发展成霍默最受欢迎的美国乡村生活画面之一。"
});
Object.assign(WORK_INTRO,{
  "甲州石班泽奶蛙":"葛饰北斋《甲州石班泽》以富士山、水平水纹、岩岸和垂钓者构成辽阔的名所风景。成熟态奶蛙替换站立的渔夫，保留原作的水势与人物关系。",
  "大桥安宅骤雨奶蛙":"歌川广重《大桥安宅骤雨》把斜向木桥、骤密雨线、伞下旅人和远处河面压缩在一张竖幅中。成熟态奶蛙进入前景旅人的位置，成为雨幕中的暖色尺度。",
  "三代目大谷鬼次奶蛙":"东洲斋写乐《三代目大谷鬼次之奴江户兵卫》以大首绘裁切、条纹衣装和双手前伸的舞台姿势制造紧张感。成熟态奶蛙保留役者的戏剧性斜视与身体占幅。"
});
Object.assign(WORK_EDITORIAL,{
  "甲州石班泽奶蛙":"北斋用富士山的稳定轮廓压住连续水纹和斜向岩岸，垂钓线把人物动作引向画外。人物的体量被处理成同一套平面套色中的一笔，不抢走富士山的主轴。",
  "大桥安宅骤雨奶蛙":"广重以桥栏和雨丝建立密集的斜向节奏，伞面则切出几个短暂的行旅剪影。圆钝轮廓、低头姿态和深色伞面共同服从骤雨的速度。",
  "三代目大谷鬼次奶蛙":"写乐把役者的脸、手和条纹衣装推到纸面前方，夸张不是写实误差而是舞台表演的视觉语法。眼神和手势方向保持夸张的舞台表现力。"
});
Object.assign(WORK_TRIVIA,{
  "甲州石班泽奶蛙":"《甲州石班泽》属于北斋《富岳三十六景》，画中富士山的轮廓和水面横线形成了极强的远近尺度对照。",
  "大桥安宅骤雨奶蛙":"《大桥安宅骤雨》是广重《名所江户百景》中的一幅，后来因大胆裁切和密集雨线深受欧洲画家关注。",
  "三代目大谷鬼次奶蛙":"写乐的创作活动集中在很短的时期，正因为役者大首绘的表情极为鲜明，他的真实身份至今仍是艺术史上的谜题。"
});
Object.assign(WORK_INTRO,{
  "泷夜叉姬与骷髅妖怪奶蛙":"歌川国芳《泷夜叉姬与骷髅妖怪》以完整三联画展开妖怪叙事：左栏人物持卷，中央武者仰望，巨大骷髅跨越中右栏。成熟态奶蛙保留左栏角色位置与卷轴动作。",
  "金太郎捕鲤鱼奶蛙":"月冈芳年《金太郎捕鲤鱼》以纵向构图和巨鲤斜向跃动制造力量线。幼态奶蛙沿鱼身抱持，水纹、鱼鳞和激流共同维持原作的速度。"
});
Object.assign(WORK_EDITORIAL,{
  "泷夜叉姬与骷髅妖怪奶蛙":"国芳让黑色格栅、彩色织物和白色骷髅形成强烈的三联画对照。奶蛙的成熟体量、卷轴和衣物被压进同一套木版线刻与套色，不作为独立贴图出现。",
  "金太郎捕鲤鱼奶蛙":"芳年以鱼鳞、斜向水带和纵长裁切组织视觉冲力。奶蛙与鲤鱼共享纸面、墨线和套色层次，四肢接触点服从鱼身透视与原作的动势。"
});
Object.assign(WORK_TRIVIA,{
  "泷夜叉姬与骷髅妖怪奶蛙":"国芳常把历史传说、武者戏剧和怪异形象组合在一起，巨大骷髅跨栏出现的设计成为江户版画中极具冲击力的场面。",
  "金太郎捕鲤鱼奶蛙":"金太郎是日本民间传说中的儿童英雄，芳年用巨鲤、激流和纵向构图把儿童力量放大成一场神话般的水上搏斗。"
});
Object.assign(WORK_INTRO,{
  "包厢奶蛙":"雷诺阿《包厢》把前景女主人、后方男子和剧院栏杆组织成一场关于观看的室内戏剧。成熟态奶蛙保留前景位置、晚礼服与剧场暗背景。",
  "布吉瓦尔之舞奶蛙":"雷诺阿《布吉瓦尔之舞》以一对贴近旋转的舞者和户外人群构成运动中的肖像。成熟态奶蛙替代男舞者，保留环抱、手牵手和身体重心。",
  "伞奶蛙":"雷诺阿《伞》用重叠的蓝灰伞面、前景人物和儿童组织街头人群。成熟态奶蛙位于左下前景，成为湿润空气中的暖色形体。",
  "蓝色扶手椅上的小女孩奶蛙":"卡萨特《蓝色扶手椅上的小女孩》把松弛的儿童姿势放在一组蓝色椅子之间。幼态奶蛙保留斜躺姿势、白色衣物逻辑和室内小狗。"
});
Object.assign(WORK_EDITORIAL,{
  "包厢奶蛙":"雷诺阿用黑色皮草、奶油礼服、花束和后方望远镜把剧院的观看关系压缩到包厢一角。奶蛙的黄色体量服从柔和的暖冷笔触，不跳出画面。",
  "布吉瓦尔之舞奶蛙":"两名舞者的手臂和腰部形成旋转轴，背景人物与树影则以松散色斑维持空间。成熟态奶蛙的重心和服装笔触承接原作的身体节奏。",
  "伞奶蛙":"伞面构成连续的弧形遮蔽，前景人物在湿润空气中被不同方向的短笔触切开。奶蛙的轮廓、衣物和伞下阴影共享同一层印象派色光。",
  "蓝色扶手椅上的小女孩奶蛙":"卡萨特以蓝色家具的重复形体包围儿童，斜躺姿势打破室内的规整秩序。幼态奶蛙的短粗四肢和奶油腹部融入椅垫的宽笔触与暗部。"
});
Object.assign(WORK_TRIVIA,{
  "包厢奶蛙":"《包厢》是雷诺阿早期把现代城市休闲生活带入大幅绘画的重要作品，剧院既是观看场所，也是社交场所。",
  "布吉瓦尔之舞奶蛙":"雷诺阿常从熟悉的模特和朋友中寻找人物，画面中的舞蹈既像公共娱乐，也像一段被光线截取的私人亲密时刻。",
  "伞奶蛙":"《伞》经历了较长的创作过程，画面中不同阶段的笔触和人物处理方式并不完全一致，反而留下了丰富的时间层次。",
  "蓝色扶手椅上的小女孩奶蛙":"卡萨特从日本版画中吸收了大胆裁切和平面化空间，这件作品的室内构图因此显得既亲密又不寻常。"
});
Object.assign(WORK_INTRO,{
  "玩纸牌的奶蛙":"塞尚《玩纸牌者》以两位隔桌对坐的劳动者、桌上的酒瓶和沉缓的暖色背景，把乡村牌局提升为纪念性绘画。成熟态奶蛙替代右侧持牌者，保留前倾专注的姿势。",
  "大碗岛的星期天下午奶蛙":"修拉《大碗岛的星期天下午》以两年时间把休闲人群、苹地阴影带、河面与帆船组织成点彩全景。成熟态奶蛙立于中景苹地上，轮廓由并置色点构成。"
});
Object.assign(WORK_EDITORIAL,{
  "玩纸牌的奶蛙":"塞尚用平行的结构笔触和克制的蓝褚色调让身体、衣料和背景共同成为稳定体量。奶蛙的黄色体量同样被分割成小面，服从画面的重量与静止。",
  "大碗岛的星期天下午奶蛙":"修拉以细密色点让光线在观者眼中自行调和，阴影带把苹地切分成明暗节奏。奶蛙由与周围相同的点彩构成，轮廓在观看距离中与苹地融为一体。"
});
Object.assign(WORK_TRIVIA,{
  "玩纸牌的奶蛙":"塞尚以当地农民为模特多次重画牌局，同一题材存世多个版本，成为他探索稳定结构的典型实验场。",
  "大碗岛的星期天下午奶蛙":"修拉为《大碗岛的星期天下午》绘制了大量预备素描和色稿，最终画面以数百万个色点构成，被认为是分割主义的宣言之作。",
  "罗纳河上的星夜奶蛙":"梵高在罗纳河畔夜游时直接写生完成此画，煤气灯与星光同时映入水面，成为他夜间绘画的早期代表。"
});

// ===== 纯原作文案覆写：作品介绍与作品鉴赏均只讨论原作 =====
const WORK_TEXT_FIX = {
  "雷卡米埃夫人奶蛙":{intro:"雅克-路易·大卫1800年为巴黎名媛朱丽叶特·雷卡米埃绘制的肖像。她以半卧姿态斜倚在弧形贵妃榻上，身着白色高腰长裙，赤裸双臂自然垂落，画面仅有一盏落地油灯与素净墙面。",editorial:"人物与沙发构成一条贯通画面的弧线，白裙的冷调在素墙上延展出安静的空间。大卫放弃了旧式华服与道具堆叠，以极简的古典主义语言把观者的目光集中在她回眸的视线，以及身体勾勒出的轮廓上。"},
  "翻越阿尔卑斯奶蛙":{intro:"大卫1801年绘制的拿破仑骑马像，共五个版本。画面描绘拿破仑率军翻越阿尔卑斯山圣伯纳隘口的场面，岩壁上刻有他的名字。",editorial:"马匹前蹄腾空形成升腾的对角线，绿色斗篷被风掀起，与灰白雪山构成鲜明冷暖对比。历史上拿破仑是骑着骡子翻山的，但大卫有意选择更适合英雄叙事的跃马姿态。"},
  "苏格拉底之死奶蛙":{intro:"大卫1787年创作的历史画，描绘古希腊哲学家苏格拉底在雅典法庭被判死刑后饮下毒堇汁的场景，画面取材柏拉图的《斐多篇》。",editorial:"全画以苏格拉底的席位为绝对中心：他右手高指上天，左手接过毒杯，身体笔直如雕塑。门徒的溃散姿态从他向两侧递减排列，理性与悲痛的对照被组织成几何般精确的画面结构。"},
  "贝尔坦先生奶蛙":{intro:"安格尔1832年在巴黎创作的肖像，画中人是《辩论日报》创办人路易-弗朗索瓦·贝尔坦，1833年在沙龙展出后引起轰动。",editorial:"安格尔以近乎雕塑般的体量处理坐姿：双腿向外张开、双手稳稳压在大腿上，形成稳定的三角形。灰白发丝与浓眉的光泽、黑外套的哑光织纹构成细腻的肌理对照，把一位报业巨头的强势性格留在体态里。"},
  "视察雅法疫病院奶蛙":{intro:"格罗1804年创作的巨幅历史画，描绘拿破仑1799年远征中东期间在雅法巡视鼠疫患者的场面，前景是摩尔式拱厅与病员群像。",editorial:"画面上半部笼罩在昏暗拱厅里，光源从右下射入，掠过病人的裸背与统帅伸出触碰患处的右手。格罗有意把统帅置于疫病现场的中心，使军事征服的姿态带上了宗教抚慰的意味。"},
  "贝利撒留受施奶蛙":{intro:"大卫1781年创作的历史画，取材拜占庭名将贝利撒留晚年失明乞讨的故事。画面右侧是惊讶施舍的士兵，前景是牵引老将的引路童子。",editorial:"大卫以立柱与远景方尖碑框起画面纵深，让失明老将与惊愕士兵在光线两侧形成反差。老将的乱发与士兵笔挺的红披风、鎏金头盔互相映照，把历史的无常压缩在两人相遇的瞬间。"},
  "马拉之死奶蛙":{intro:"大卫1793年创作的纪念性油画，描绘法国大革命时期雅各宾派领袖马拉在浴缸中被刺杀后的景象，木箱与信件保留了现场细节。",editorial:"马拉垂下的手臂与笔尖几乎触到地面，白色缠头巾、浴巾与浅色肌肤在暗绿背景中形成冷调的垂直结构。大卫抹去了伤口的血污与病痛的痕迹，让被刺杀的躯体呈现出近乎圣像的安详。"},
  "秋千奶蛙":{intro:"弗拉戈纳尔1767年创作的风俗画，据传受一位贵族赞助人之命而作：画中少女在密林间荡起秋千，一只鞋子踢飞在空中，左下方坐着她的情人。",editorial:"秋千的绳索把画面切成一条斜向动线，少女踢飞的粉鞋与仰卧者伸出的手臂在空中接住这条急坠的弧线。光斑透过树冠落下，把密林变成柔软的半透明舞台，轻盈与戏谑藏在严谨的构图里。"},
  "画家与她的女儿奶蛙":{intro:"伊丽莎白·维热·勒布伦1786年创作的自画像，画中她与女儿朱莉相拥，曾于1787年在巴黎沙龙展出。",editorial:"两条手臂在画面中央形成环抱的闭合曲线，母亲的深色衣袍与女儿的白色裙装互相衬托。画家把视线从画布转向观者，既是自我凝视，也是对观众的问候。"},
  "读书少女奶蛙":{intro:"弗拉戈纳尔约1769年创作的半身肖像。画中少女侧坐窗台，捧着一本小书，明黄色长裙与紫粉靠垫形成明快的色彩关系。",editorial:"少女的坐姿把身体扭转成朝向画外的一侧，视线完全落在书页上，观者被她有意识地忽略。宽阔的笔触让裙裾与靠垫化作流动的色块，把「阅读」变成一种自我封闭的专注状态。"},
  "望月的两人奶蛙":{intro:"弗里德里希约1819至1820年创作的风景画，描绘两位男子在暮色林中凝视新月的场面，是画家晚期反复重构的题材之一。",editorial:"老橡树弯曲的枝干从上方压入画面，与地上的碎石小径构成一上一下的框景。高大的男人拄杖与同伴并肩背对观者，位置略作错开，让视线沿着他的肩线直上天空中的一弯新月。"},
  "海洋边的僧侣奶蛙":{intro:"弗里德里希约1808至1810年创作的风景画，画中一名僧侣伫立在空旷的沙丘上，面朝无垠海面，作品1810年在柏林展出。",editorial:"画面上几乎水平的三条色带——沙丘、海面与天空——把人的存在压成一个极小的人影。画家取消了传统风景画中景与远景的层次，观者与僧侣一同被迫面对空无一物的地平线。"},
  "萨莫色雷斯的胜利女神奶蛙":{intro:"《萨莫色雷斯的胜利女神》约作于公元前190年，为纪念海战胜利而立于萨莫色雷斯岛神殿。雕像表现胜利女神降临船首的瞬间，头与双臂已经缺失。",editorial:"雕像以迎风前倾的跨步动势和后掠双翼形成对角线结构，湿衣贴身、褶皱翻卷，在大理石上呈现风的方向与速度，是希腊化时期戏剧性与崇高的典范。"},
  "休息的拳击手奶蛙":{intro:"《休息的拳击手》为公元前4世纪希腊化时期青铜原作，1885年出土于罗马奎里纳莱山，表现一名赛后间歇的老年拳击手。",editorial:"人物疲惫坐定、头部侧转直视观者，双手关节缠着皮制拳套。铜绿与铜红包浆下肌肉解剖精确，不对称的坐姿让疲惫感由身体重量自然传递，是古代肖像性雕塑的罕见真迹。"},
  "拉奥孔群像奶蛙":{intro:"《拉奥孔群像》约作于公元前40—30年，表现特洛伊祭司拉奥孔与两个儿子被海蛇缠死的瞬间，1506年出土于罗马。",editorial:"三条蛇的螺旋缠绕把三具身体组织成向心又外扩的张力结构：中央父亲后仰嘶喊，两侧儿子挣扎欲脱。痛苦被克制在肌肉的极限与衣褶的静止之间，成为西方艺术中'崇高痛苦'的原型。"},
  "汉谟拉比法典石碑奶蛙":{intro:"《汉谟拉比法典石碑》约刻于公元前1754年，闪长岩石碑高逾两米，顶部浮雕表现巴比伦国王汉谟拉比向太阳神沙玛什领受权杖与法环。",editorial:"国王肃立、太阳神端坐，两者目光在同一水平线相遇，神与人通过权杖符号建立契约关系。碑身下半部以楔形文字刻有282条法律，浮雕的浅刻与铭文的密度共同构成王权合法性的视觉宣言。"},
  "第一门的奥古斯都奶蛙":{intro:"《第一门的奥古斯都》为公元前20年左右的罗马皇帝大理石雕像，1863年出土于罗马近郊利维亚别墅，现藏梵蒂冈。",editorial:"皇帝抬臂演讲，胸甲浮雕刻画帕提亚归还军旗的场景，披风绕臂垂落，身旁小爱神暗示其神圣血统。理想化的面容与写实的身姿并置，是罗马政治肖像与希腊理想美结合的典范。"},
  "乔托哀悼基督奶蛙":{intro:"乔托约于1305年在帕多瓦斯克罗威尼礼拜堂绘制《哀悼基督》湿壁画，描绘基督遗体从十字架放下后众人哀悼的场景。",editorial:"斜向岩脊把画面分为天与地：上方天使翻飞呼号，下方人群围拢遗体。圣母怀抱基督的姿势构成情感核心，人物第一次拥有了真实的体重与空间位置，乔托由此把绘画从中世纪图标推向戏剧舞台。"},
  "契马布埃圣三位一体圣母子奶蛙":{intro:"契马布埃约于1280—1290年为佛罗伦萨圣三位一体教堂绘制这幅宝座圣母像，是拜占庭传统晚期的大型祭坛画。",editorial:"高大宝座沿中轴对称展开，蓝色圣母披风覆盖金色背景，天使列于两侧，下方先知半身像藏于宝座结构中。程式化的正面构图仍属中世纪，但衣褶的体积感和目光的柔和已预示文艺复兴的曙光。"},
  "乔托逃往埃及奶蛙":{intro:"乔托约于1304—1306年在帕多瓦礼拜堂绘制《逃往埃及》，描绘圣家族为躲避希律王迫害连夜迁徙的场景。",editorial:"队伍沿山道蜿蜒下行，玛利亚怀抱婴儿骑驴，约瑟手持行囊引路，随行者构成行进的节奏。山岩第一次成为有重量的立体背景而非金色平面，人物的行进关系赋予圣经叙事以现实的身体感。"},
  "杜乔进入耶路撒冷奶蛙":{intro:"杜乔约于1308—1311年为锡耶纳主教座堂绘制《进入耶路撒冷》，属其巨作《圣母荣光图》背面场景之一。",editorial:"基督骑驴缓行入城，城门内居民攀树张望、铺衣于地，人群的动势与树木的斜线构成叙事节奏。金地背景延续拜占庭传统，但人物已拥有各自的姿态与情绪，预示锡耶纳画派的抒情方向。"},
  "圣乔治屠龙奶蛙":{intro:"圣乔治屠龙是流传最广的中世纪圣徒传奇：骑士乔治途经受恶龙胁迫的城邦，以长枪刺穿恶龙救下公主。",editorial:"骑士、公主、恶龙与城堡各居其位：枪的斜线连接骑士与龙首，公主立于远处等待，城堡背景交代世俗空间。善恶对峙被组织成清晰的叙事几何，成为中世纪骑士精神图像的标准范式。"},
  "石工奶蛙":{intro:"库尔贝1849—1850年创作《石工》，描绘两名在路边砸石的劳工：一位老者与一位少年，画面基于真实场景写生。",editorial:"低视点让碎石几乎顶到画面边缘，两人弯身的姿势形成重复的劳动节拍，粗粝的褐灰土色拒绝一切美化。库尔贝以此宣告'画我所见'，把被学院排斥的体力劳动提升为大型绘画的主题。"},
  "伏尔加河上的纤夫奶蛙":{intro:"列宾1870—1873年创作《伏尔加河上的纤夫》，描绘沿河拖曳货船的十一名纤夫，基于其在伏尔加河的实地写生。",editorial:"队列沿绳索向观者走来，各人姿态、年龄与神情皆不相同：领头的坚毅、中段的疲惫、末尾的麻木。沙岸的横向延展与压迫性的天空把社会现实压入史诗尺度，成为俄国现实主义的高峰。"},
  "三等车厢奶蛙":{intro:"杜米埃约于1862—1864年绘制《三等车厢》，描绘巴黎铁路三等车厢内的普通乘客。",editorial:"横向长凳上坐着哺乳的母亲、抱行李的老妇与昏睡的孩童，暗色木墙包围着各自沉默的身体。粗重的形体与克制的明暗不加修饰，把都市底层的疲惫固定为一种公共肖像。"},
  "晚钟奶蛙":{intro:"米勒1857—1859年创作《晚钟》，描绘暮色中听到教堂钟声而驻足祈祷的一对农人夫妇。",editorial:"低地平线压出广阔天空，两人隔空相对的剪影立于收割后的田野，篮中土豆、叉具与远处尖塔构成叙事锚点。钟声不可见，却通过静止的身体充满整个画面，是米勒'农民史诗'最安静的篇章。"},
  "抢球奶蛙":{intro:"霍默1872年创作《抢球》，描绘乡村校舍前一群男孩牵手成链奔跑嬉戏的场景。",editorial:"牵手的链条形成波形动线，红色校舍与开阔草地稳住背景。霍默以清晰的轮廓与结实的色块捕捉户外阳光下的瞬间动作，把美国乡村童年提升为具有纪念碑感的题材。"},
  "雾海上的旅人奶蛙":{intro:"弗里德里希1818年创作《雾海上的旅人》，描绘一位背对观者立于山巅的旅人，俯瞰翻涌的雾海与若隐若现的远峰。",editorial:"背影让人物与风景合为一片崇高：雾海与岩脊占画面下三分之二，天空留出高度。旅人的手杖与站姿提供唯一的稳定点，观者被邀请进入'未看见面'的凝视本身，成为浪漫主义崇高的视觉宣言。"},
  "但丁之舟奶蛙":{intro:"德拉克罗瓦1822年创作《但丁之舟》，取材但丁《神曲》，描绘维吉尔引导但丁渡过地狱之河斯提克斯的场景。",editorial:"摇晃的船体沿横向颠簸，受难者的斜向动作线刺破水面的暗绿，远处燃烧的城市天际透出橙红。紧张的动势与原色的对撞宣告浪漫主义向学院秩序的挑战，也是德拉克罗瓦沙龙首战成名的作品。"},
  "梦魇奶蛙":{intro:"富塞利1781年创作《梦魇》，描绘沉睡女子胸前蹲伏梦魇魔、马首幽灵自帷幔探出的哥特式场景。",editorial:"红幔的深红压住画面上部，女子的白色躯体与梦魇魔的暗色蹲姿形成明暗对照，马首的凝视制造第二重视线。梦境的恐怖不靠叙事而靠身体的重量与视线的压迫传递，此画在1782年皇家学院展览引发轰动。"},
  "干草车奶蛙":{intro:"康斯太勃尔1821年创作《干草车》，描绘萨福克郡斯陶尔河畔农舍前马拉干草车涉水的日常场景。",editorial:"河面的静止与暴云天空的动态拉出乡村的时间感：马车、农舍与橡树构成稳定的横向结构，云层的笔触则快速掠过。对天空'天气感'的忠实记录在1824年巴黎沙龙震动法国画坛，直接影响巴比松派。"},
  "墓园孤儿奶蛙":{intro:"德拉克罗瓦约于1824年创作《墓园孤儿》，描绘一位立于暮色墓园中的少女半身像。",editorial:"低地平线与暮色天空把不安收束在少女抬起的视线上，十字架与远处树影提供叙事锚点。宽大的眼睛与紧裹的披巾把恐惧内化为凝视，常被视为《希奥岛的屠杀》人物研究的独立成品。"},
  "贝娅塔·贝亚特丽克斯奶蛙":{intro:"罗塞蒂约于1870—1872年创作《贝娅塔·贝亚特丽克斯》，以但丁深恋的贝雅特丽齐之死为主题的自创象征图像。",editorial:"闭眼仰首的出神姿态把死亡表现为升华的瞬间：红色鸽子衔来罂粟落于她的手，身后日晷与远景廊桥暗示时间与佛罗伦萨。深绿长袍与金红的光晕构成前拉斐尔派典型的神秘抒情。"},
  "水晶球奶蛙":{intro:"沃特豪斯约于1902年创作《水晶球》，描绘一位低头凝视水晶球的女子，身旁置着骷髅与摊开的书。",editorial:"连续的深红长裙沿拱形窗垂直落下，水晶球、骷髅与书构成占卜的三重符号。侧面的视线把观者排除在外，中世纪室内的静默与窗外的光共同制造沉思的张力。"},
  "看哪，主的婢女奶蛙":{intro:"罗塞蒂1849—1850年创作《看哪，主的婢女》，描绘圣母领报的瞬间：天使加百列向玛利亚传达神意。",editorial:"白色室内几乎无装饰，蓝色挂毯与红色床架构成仅有的色彩锚点。天使递出百合，玛利亚低垂双眼缩于床角，把'领报'表现为一次不敢直视的相遇，颠覆传统祭坛画的庄重程式。"},
  "圣西塞莉亚奶蛙":{intro:"沃特豪斯1895年创作《圣西塞莉亚》，描绘音乐主保圣人圣西西莉亚在玫瑰花园中闭目聆听天乐的场景。",editorial:"横向展开的花园里，右侧石椅上的闭眼仰首与膝上书本构成静谧核心，左侧两位音乐家与海港远山拉开空间层次。玫瑰的繁茂与聆听的静止形成对照，把'听见不可见之物'画成可视的沉思。"},
  "玫瑰之魂奶蛙":{intro:"沃特豪斯1903年创作《玫瑰之魂》，取材但丁暗恋贝雅特丽齐的轶事，描绘女子侧身嗅闻石墙上垂落的玫瑰。",editorial:"侧身探出的动作与闭眼的沉浸感把嗅觉转译为姿态：蓝灰披肩融入石墙，红色屋顶与右下陶盆稳住构图。拱形开口外泄的光让花园的边界消失，瞬间之美被固定在花瓣与呼吸之间。"},
  "圣巴塞洛缪节前夕的胡格诺派奶蛙":{intro:"米莱1851—1852年创作《圣巴塞洛缪节前夕的胡格诺派》，描绘1572年圣巴塞洛缪之夜大屠杀前夜，一对新教与天主教恋人诀别的场景。",editorial:"窗边的拥抱包裹着致命细节：女子正把标记新教徒的白手帕系上情人手臂。紫黑服装、花园藤叶与砖墙维持低沉的色调，私人的诀别与即将来临的宗教暴力在同一角落对峙。"},
  "废墟中的爱奶蛙":{intro:"伯恩-琼斯1873年创作《废墟中的爱》，描绘一对恋人在古典废墟中相拥的场景。",editorial:"蓝袍与石墙的冷色把拥抱置于时间的废墟之上：断柱与藤蔓环绕两人，散落的花朵暗示美好之短暂。伯恩-琼斯以拉长的形体与柔和的轮廓，把但丁式的爱情观画成静谧的挽歌。"},
  "释放令，1746奶蛙":{intro:"米莱1853年创作《释放令，1746》，描绘1746年詹姆斯党起义后，妻子持释放令迎接被囚丈夫归来的场景。",editorial:"门槛处妻子弯身撕开释放令的封蜡，丈夫疲惫低头，孩子拽着父亲的腰带，狗仰首摇尾。多重视线交汇于文件这一焦点，家庭的情感与历史的压力被压缩在同一瞬间。"},
  "蓝色凉亭奶蛙":{intro:"罗塞蒂1865年创作《蓝色凉亭》，为其以简·莫里斯为缪斯的装饰性肖像系列之一。",editorial:"蓝绿色花卉背景平铺如织物，绿色披肩与胸前饰物构成色彩的回声，下方弦乐器暗示音乐与闲暇。人物侧向的视线避开观者，把肖像画成一种私人的冥想。"},
  "夏洛特夫人奶蛙":{intro:"沃特豪斯1888年创作《夏洛特夫人》，取材丁尼生诗歌，描绘被诅咒的夏洛特夫人乘船前往亚瑟王宫廷的死亡航行。",editorial:"黑船持三支蜡烛、载着织毯，夫人松开船链仰望远方。河面的横向流动与森林的垂直压迫构成命运感构图，链条的垂落把'启程即死亡'凝固在离岸的瞬间。"},
  "普罗塞耳皮娜奶蛙":{intro:"罗塞蒂1874年创作《普罗塞耳皮娜》，描绘被冥王掳至地府的春之女神普罗塞耳皮娜手持石榴的场景。",editorial:"狭长的垂直构图强化囚禁感：石榴是地府之食，也是她与人间唯一的联系。绿色披肩、油灯与背景藤蔓构成封闭的暗色系统，她侧目望向画外，把神话画成私密的忧郁肖像。"},
  "金色阶梯奶蛙":{intro:"伯恩-琼斯1880—1890年创作《金色阶梯》，描绘一列白衣少女持乐器沿旋梯缓缓走下的场景。",editorial:"阶梯的斜线承载节奏化的人物间距，乐器与飘带提供听觉的暗示。建筑开口的深色背景让白衣行列如音符般落下，把'下降'画成一首无声的乐曲，是伯恩-琼斯装饰性构图的极致。"},
  "甲州石班泽奶蛙":{intro:"葛饰北斋约1831年创作《甲州石班泽》，属《富岳三十六景》系列，描绘富士山下溪流中渔夫垂钓芦鱼的场景。",editorial:"富士山的稳定轮廓压住连续的水纹与斜切岩岸，垂钓线把人物动作引向画外。蓝灰的层次把'远山—溪水—人'组织成克制的三角关系，是名所绘中山水秩序的典范。"},
  "大桥安宅骤雨奶蛙":{intro:"广重1857年创作《大桥安宅骤雨》，属《名所江户百景》系列，描绘骤雨袭向新大桥上行人的场景。",editorial:"斜向的桥栏与密集的雨线建立双重节奏，伞面切出几个短暂的行旅剪影。雨以粗黑的平行线直接压印纸面，远景的河面与屋影退成灰蓝，把'骤雨的速度'变成版画语言本身。"},
  "三代目大谷鬼次奶蛙":{intro:"写乐1794年创作《三代目大谷鬼次之奴江户兵卫》，为其役者大首绘系列的代表作之一。",editorial:"大首绘的极端裁切把役者的脸与双手推到纸面前方：交错的手指、张开的十指与斜视的目光制造舞台的紧张。夸张不是失真，而是把表演的'演'翻译为版画的视觉语法。"},
  "泷夜叉姬与骷髅妖怪奶蛙":{intro:"国芳约于1844—1846年创作《泷夜叉姬与骷髅妖怪》，三联画取材妖魔讨伐传说，描绘妖姬召唤巨骷髅袭击宅邸的场景。",editorial:"三联的跨栏构图让巨大骷髅从中右两栏跃出：左栏人物持卷念咒，中央武者仰攻。黑色格栅、彩色织物与白骨形成三重质感对照，是国芳'武者绘'想象力与恐怖美学的巅峰。"},
  "金太郎捕鲤鱼奶蛙":{intro:"芳年1885年创作《金太郎捕鲤鱼》，描绘传说英雄金太郎赤身与巨鲤搏斗的场景。",editorial:"巨鲤的斜向跃动与激流的纵向水纹构成力量线，人物沿鱼身抱持、四肢紧扣。鱼鳞的弧线与水花把搏斗的动能推向纸面边缘，芳年以此展示'动'的版画极限。"},
  "包厢奶蛙":{intro:"雷诺阿1874年在首届印象派画展展出《包厢》，描绘剧院包厢中盛装观剧的女子与其身后持望远镜的男子。",editorial:"黑色皮草与奶油色礼服的对照把观看关系压缩到包厢一角：她在看戏，他在看她。黑色条纹的背景如剧场幕布，笔触保留着速写的生动，是雷诺阿'现代生活'肖像的宣言。"},
  "布吉瓦尔之舞奶蛙":{intro:"雷诺阿1883年创作《布吉瓦尔之舞》，描绘塞纳河畔小镇户外舞场上旋转起舞的一对男女。",editorial:"两名舞者的手臂与腰部形成旋转轴，背景人群与树影以松散色斑维持空间深度。草帽、白衣与红裙的色彩在阳光下震颤，把乡村舞会的瞬间画成持续的旋动。"},
  "伞奶蛙":{intro:"雷诺阿约于1881—1886年创作《伞》，描绘巴黎街头雨中撑伞的人群。",editorial:"重叠的蓝灰伞面构成连续的弧形遮蔽，前景人物被不同方向的短笔触从人群中'切'出。右侧小女孩直视观者，为匿名的都市洪流提供一个人性的锚点。"},
  "蓝色扶手椅上的小女孩奶蛙":{intro:"卡萨特1878年创作《蓝色扶手椅上的小女孩》，描绘一名斜躺在大张蓝色扶手椅间的女孩与她的小狗。",editorial:"蓝色家具的重复形体从四面包围松弛的儿童身体，斜躺的姿势打破室内的规整秩序。卡萨特以独特的低视角与大面积蓝灰，把'儿童的无聊'画成现代性的一瞬。"},
  "玩纸牌的奶蛙":{intro:"塞尚约于1892—1895年创作《玩纸牌者》系列，描绘两名劳动者隔桌对坐打牌的场景。",editorial:"平行的结构笔触与克制的蓝褚色调让身体、衣料与背景共同成为稳定体量：弧形的背部、垂落的手臂与桌面的酒瓶构成金字塔式秩序。塞尚把日常牌局提升为具有纪念碑感的构造。"},
  "大碗岛的星期天下午奶蛙":{intro:"修拉1884—1886年创作《大碗岛的星期天下午》，以两年时间在画布上完成点彩全景。",editorial:"休闲人群、草地阴影带、河面与帆船被组织成水平的层次，一切轮廓都由并置的色点构成。树影的深绿把阳光切成规律的光斑，人物如剪影般静止，把'现代休闲'画成永恒的秩序。"},
  "罗纳河上的星夜奶蛙":{intro:"梵高1888年创作《罗纳河上的星夜》，描绘阿尔勒罗纳河畔的夜空与河上煤气灯的倒影。",editorial:"天空的大星与河面的光斑以厚涂的笔触上下呼应，岸边挽手的双人提供人间的温度。蓝与黄的互补在夜色中震颤，星空第一次成为可以直接触摸的颜料现场。"},
  "吹笛少年奶蛙":{intro:"马奈1866年创作《吹笛少年》，描绘皇家卫队乐队中持横笛的少年乐手。",editorial:"平涂的灰色背景删掉了所有空间暗示：无影的地面、单薄的轮廓，少年如纸牌人偶般立于画面。红裤、黑衣与金扣的色彩平列源自西班牙绘画与浮世绘，比印象派更早预告了现代绘画的平面性解放。"},
  "荷拉斯兄弟之誓奶蛙":{intro:"大卫1784年创作《荷拉斯兄弟之誓》，描绘罗马三兄弟在父亲面前宣誓保卫城邦、其姊妹哀恸的场景。",editorial:"石拱背景把舞台切成三段：左侧三兄弟伸手握剑，中央父亲高举武器，右侧女性群像瘫软哀哭。男性的直线与女性的曲线形成道德对比，新古典主义的理性构图在此确立为革命时代的视觉语言。"},
  "前线的俘虏奶蛙":{intro:"霍默1866年创作《前线的俘虏》，描绘美国内战末期北军军官押解南军俘虏回营的场景。",editorial:"北军军官挺立与俘虏垂头的姿态对比构成叙事核心，树桩与荒原的地平线交代战争对土地的剥离。灰色天光下没有英雄主义，只有胜者与败者各自的沉默，是内战绘画最克制的记录之一。"},
  "罗利的童年奶蛙":{intro:"米莱1870年创作《罗利的童年》，描绘少年沃尔特·雷利与兄长听水手讲述航海传说的场景。",editorial:"水手的讲述、双童的聆听与玩具帆船构成叙事三角，海平线自左侧窗口涌入。传说的远方与花园的现实在同一画面并置，把'帝国的起点'画成一场童年的想象。"},
  "巴拉克拉瓦奶蛙":{intro:"伊丽莎白·汤普森1876年创作《巴拉克拉瓦》，描绘克里米亚战争中轻骑兵撤离战场后残部的场景。",editorial:"人与马的疲惫队列沿浅坡散开，硝烟的灰黄统一全画。没有冲锋的 heroics，只有'残局'的沉重，汤普森以此成为最早进入英国艺术主流的女战争画家之一。"},
  "吕根岛白垩崖奶蛙":{intro:"弗里德里希约1818年创作《吕根岛白垩崖》，描绘波罗的海吕根岛白垩崖顶两人俯瞰大海的场景。",editorial:"白垩崖的锋利斜线自两侧切入，把海平线压缩成远处的窄带。崖顶人物的背影再次成为'观看'的替身，崖壁的白色与海的蓝构成冷峻的崇高，是弗里德里希海滨风景的代表作。"},
  "吉萨的狮身人面像奶蛙":{intro:"大卫·罗伯茨1839年在埃及旅行期间写生吉萨狮身人面像，后制成版画广泛传播。",editorial:"狮身人面像半埋于黄沙、只露上半身，前景贝都因人的小尺度反衬巨像的远古。罗伯茨以准确的考古态度与浪漫的光色结合，把埃及遗迹带给欧洲观众，引发十九世纪的'埃及热'。"},
  "卢浮宫废墟的想象图奶蛙":{intro:"罗贝尔1796年创作《卢浮宫废墟的想象图》，想象伟大的博物馆在久远未来化为废墟的样子。",editorial:"大柱廊坍塌、藤蔓穿廊而过，渺小的人物在废墟中穿行拾荒。罗贝尔把'当下的辉煌'提前画成'未来的遗迹'，以废墟美学反思艺术与时间的关系，充满启蒙时代末期的清醒。"},
  "纳尔尼桥奶蛙":{intro:"柯罗1827年创作《纳尔尼桥》，描绘罗马近郊纳尔尼古桥遗迹与溪谷的风景。",editorial:"古桥的拱券斜跨画面，前后景的树木以银灰的调子统一。柯罗不追求明信片式的清晰，而以柔和的空气感让遗迹、溪流与农人共享同一片呼吸，预示巴比松派的自然主义方向。"},
  "巨石阵黎明奶蛙":{intro:"巨石阵约建于公元前2500年，其主轴对准夏至日出与冬至日落，兼具仪式与天文功能。",editorial:"巨石的重复排列把自然地景转化为方向性的仪式空间：重量、间距与天体运行之间形成跨越千年的对应。建造者如何搬运数十吨的巨石至今成谜，黎明时分的巨石阵仍是人类时间感的最大物证。"},
  "构成八号奶蛙":{intro:"康定斯基1923年创作《构成 VIII》，是其包豪斯时期抽象构图的总结之作。",editorial:"画面以圆、三角、斜线和网格构成非叙事性的视觉节奏：冷暖色块彼此牵制，左上的大圆如太阳般统领全局。几何形不再描摹自然，而是独立的精神秩序，康定斯基称这种秩序'近似音乐'。"},
  "新石器彩陶纹样奶蛙":{intro:"新石器时代彩陶约出现于公元前5000—3000年的黄河流域，先民在陶坯上以矿物颜料绘制几何纹样。",editorial:"圆腹器形与重复的漩涡、网格纹样共同构成最早的器物美学：纹样沿器身转动展开，无始无终。矿物颜料的赭红与黑在素陶上保持千年，是集体记忆先于文字的视觉证据。"},
  "神人兽面纹玉琮奶蛙":{intro:"良渚文化玉琮约制作于公元前3300—2300年，外方内圆，是史前中国最重要的祭祀礼器之一。",editorial:"玉琮的四角以浅浮雕刻神人兽面纹：层叠的纹带沿垂直方向重复，中心面孔的双圈眼睛构成视觉锚点。方圆相套的形制象征'天圆地方'，无金属工具时代的治玉精度至今令人惊叹。"},
  "四羊方尊奶蛙":{intro:"四羊方尊约铸于商代晚期（约公元前13世纪），1938年出土于湖南宁乡，是商代青铜礼器的巅峰之作。",editorial:"高颈、方体、圈足的礼器结构上，四个转角的羊首以分铸法凸出器面：卷角与胸饰的雷纹、饕餮纹共享同一套铸造语言。羊的温顺与礼器的威严在方尊上合为一体，'臻于极致的青铜典范'。"},
  "秦始皇陵跪射俑奶蛙":{intro:"秦始皇陵跪射俑出土于兵马俑二号坑，约制作于公元前210年前后，是保存最完整的秦俑之一。",editorial:"一膝着地、一膝抬起、双手持弓的战备姿态精确到甲片的编缀方向。铠甲片、发髻与鞋底的针脚都以陶土如实塑造，火烧土色的沉着质感让两千年前的士兵仍保持着临战的专注。"},
  "长信宫灯奶蛙":{intro:"长信宫灯为西汉鎏金铜灯（约公元前2世纪），1968年出土于满城汉墓，灯上铭文'长信'指窦太后居所长信宫。",editorial:"跪坐宫女双手执灯，右袖自然垂落兼作虹管吸烟导烟入体内，环保设计超前两千年。灯罩可启闭以调光调向，宫女的姿态、衣纹与鎏金的光泽把宫廷照明、工艺与人体美学合为一体。"},
  "洛神赋图奶蛙":{intro:"顾恺之《洛神赋图》（宋摹本）取材曹植《洛神赋》，描绘曹植与洛水女神相遇、相恋而终须离别的连续叙事。",editorial:"长卷沿水岸展开：流云、飘带与树木分隔场景，人物反复出现的'同一人'构成时间维度。洛神的飘带如'吴带当风'的先声，人神殊途的怅惘被画成绵延的山水平面，是中国叙事画的源头之一。"},
  "云冈石窟北魏佛像奶蛙":{intro:"云冈石窟由北魏皇室开凿于约5世纪，昙曜五窟的大佛融合犍陀罗与凉州样式。",editorial:"大佛结跏趺坐于穹隆形洞窟，圆形背光与层层衣褶形成稳定的垂直秩序。砂岩的风化孔隙与刀凿痕迹记录了造像从山体中'显现'的过程，帝王面貌与佛陀慈悲在此重叠，是佛教中国化的起点。"},
  "唐三彩骆驼载乐俑奶蛙":{intro:"唐三彩骆驼载乐俑约制作于8世纪盛唐，1957年出土于西安鲜于庭诲墓，是丝路乐舞的立体记录。",editorial:"骆驼昂首嘶鸣、四足踏稳，驼背上乐伎持琵琶、箜篌等胡汉乐器合奏。琥珀与绿釉的流动浸润让每件乐器都有不同的釉色节奏，把'丝路上的音乐会'凝固为盛唐气象的物证。"},
  "竹林七贤与荣启期砖画奶蛙":{intro:"《竹林七贤与荣启期砖画》为南朝大型墓室拼镶砖画（约6世纪），1960年出土于南京西善桥。",editorial:"八位高士以银杏、垂柳分隔，各具姿态：抚琴、饮酒、长啸、沉思。人物以凸起的线条在砖面上'阴刻正印'，衣纹如行云流水，把魏晋名士的精神自由画进墓室，是南朝绘画唯一的实物遗存。"},
  "游春图奶蛙":{intro:"展子虔《游春图》（隋，约7世纪，宋摹本）是现存最早的山水卷轴画，描绘贵族春日出游的场景。",editorial:"'丈山、尺树、寸马、分人'的比例体系首次确立：青绿山石沿对角抬升，朱线勾勒的人物小如豆点却各有姿态。水面的波纹与桃杏的点染让春天成为画面的主角，山水自此脱离人物背景的地位。"},
  "簪花仕女图奶蛙":{intro:"周昉《簪花仕女图》（唐，约8世纪）描绘五位盛装宫廷贵妇与侍女在庭园中赏花闲步的场景。",editorial:"贵妇体态丰腴、纱衣透体，大髻簪牡丹、荷花、海棠各不相同。猗猗的鹤与小巧的犬提供空间的错落，朱砂与石绿的敷色历经千年仍保持艳度，是唐代仕女画'以肥为美'的典范。"},
  "韩熙载夜宴图奶蛙":{intro:"顾闳中《韩熙载夜宴图》（五代，约10世纪，宋摹本）受南唐后主之命夜入韩府目识心记绘成，记录韩熙载夜宴的全过程。",editorial:"长卷以听乐、观舞、歇息、清吹、送别五段连环展开，屏风与床榻既分隔又连接场景。韩熙载在各段反复出现而神情始终沉郁，声色之下是政治自保的清醒，是中国人物画叙事与心理刻画的巅峰。"},
  "定窑白釉孩儿枕奶蛙":{intro:"定窑白釉孩儿枕为北宋定窑名品（约11—12世纪），以俯卧孩儿为枕座，故宫博物院藏有同类珍品。",editorial:"孩儿俯卧侧首、双臂抱枕，背部即枕面。定窑白釉温润如象牙，衣纹以刻花与篦划轻描，姿态的憨态与釉色的静气相得益彰，是宋代'日用即道'美学的绝佳注脚。"},
  "清明上河图奶蛙":{intro:"张择端《清明上河图》（北宋，约12世纪）描绘汴京汴河两岸清明时节的都市全景，是中国最著名的风俗画长卷。",editorial:"卷首郊野的疏柳渐入虹桥的鼎沸：船过桥的险情、桥头的人群、街市的店铺以'移步换景'组织成连续的戏剧。五百余人物各司其职，桥梁结构与商铺招牌均可考古，是北宋城市生活的百科全书。"},
  "寒江独钓图奶蛙（写意）":{intro:"马远《寒江独钓图》（南宋，约13世纪）描绘一叶扁舟上独坐垂钓的渔父，其余皆为空白。",editorial:"船身与人物的寥寥数墨占据画面不足十分之一，四周的空白即是江、是天、是雪、是无限。'马一角'的裁切把留白升格为主角，钓线垂入虚空的 一点，成为中国绘画'计白当黑'的极简典范。"},
  "富春山居图奶蛙":{intro:"黄公望《富春山居图》（元，约1350年）为其晚年为无用师所绘，历经火殉分卷，前段《剩山图》与后段《无用师卷》分藏两岸。",editorial:"长卷以披麻皴与浅绛设色展开富春江两岸的四季：山脚的村居、江面的渔舟与山巅的空亭交替出现。笔墨的干湿浓淡即时间本身，七百年后观者仍能沿卷'游'完全程，是中国文人画的巅峰。"},
  "百骏图奶蛙":{intro:"郎世宁《百骏图》（清，约18世纪）为意大利传教士画家在如意馆绘制的长卷，描绘牧马人放牧百匹骏马的场面。",editorial:"郎世宁以西洋解剖与透视塑造马匹的体积，又以中国绢本与长卷形制承载：每一匹马的毛色、姿态与远近皆不重复。中西画法在骏马的皮毛上达成罕见的和解，是清宫'中西合璧'的代表作。"},
  "荷花与鸭奶蛙（写意）":{intro:"八大山人《荷花与鸭》（约17世纪）为其花鸟写意的典型图式：残荷、孤鸭与大面积空白。",editorial:"荷茎的书法性线条撑起画面，翻白眼的鸭子以最少的墨块获得最多的性格。'白眼向人'是遗民对时代的沉默抗议，空白愈多、孤傲愈重，把文人画的'写意'推向情绪的极简。"},
  "奔马奶蛙（变体形态版）":{intro:"徐悲鸿20世纪30—40年代创作奔马系列，以水墨融合西画解剖，塑造民族危亡之际的精神图腾。",editorial:"马的胸廓与后腿以精确的解剖结构支撑，鬃尾则以飞白的书法笔势疾扫。一足腾空、一足踏地的瞬间的'动势'来自对速写与解剖的双重提炼，奔马自此成为'前进的中国'的象征。"},
  "虾趣奶蛙":{intro:"齐白石晚年精画河虾，以'妙在似与不似之间'的花笔墨法把虾的透明感画到极致。",editorial:"淡墨掷笔成躯、浓墨点睛，虾身的五节墨色由深至浅自然过渡，前程的一对长钳以书法性线条写出。虾群的疏密、游向与须的颤动构成水中的空间感，白石老人自评'吾画虾数十年始得其神'。"},
  "蛙声十里出山泉奶蛙":{intro:"《蛙声十里出山泉》为齐白石1951年应老舍之请、据查初白诗句创作的名作。",editorial:"画面只有山涧、蝌蚪与远山：'蛙声'不可画，便以顺流而下的蝌蚪让观者自己'听'见十里外的父母。以蝌蚪代蛙声的转译是中国诗画'通感'的教科书案例，也是白石晚年智慧的结晶。"},
  "万山红遍奶蛙":{intro:"李可染20世纪60年代创作《万山红遍》系列，据毛泽东'看万山红遍，层林尽染'词意，以朱砂积染写出秋山。",editorial:"传统山水忌大面积用火红，李可染以朱砂层层积染、黑红相衬：逆光的山体、白墙的村居与飞瀑的留白构成红色秩序中的呼吸。'为祖国河山立传'的雄心与个人风格的成熟在此重合。"},
  "江山如此多娇奶蛙":{intro:"傅抱石与关山月1959年为北京人民大会堂合作《江山如此多娇》，毛泽东题词，是新中国国家壁画的象征。",editorial:"旭日东升于雪山之巅，长城、黄河与江南四季同框于同一全景。傅抱石的'抱石皴'与关山月的写实岭南笔法在巨制中互补，把'江山'画成时间（四季）与空间（南北）的共同体。"},
  "鹰石山花奶蛙":{intro:"潘天寿20世纪中期创作鹰石山花图式，以指墨与笔墨并用塑造苍鹰与山岩的雄强。",editorial:"苍鹰踞于方折的山石之上，指墨的毛涩边缘让羽毛获得金属般的质地。构图取'造险'与'破险'：巨石倾而不倒，山花的纤秀反衬鹰的沉雄，把花鸟画提升到山水的纪念碑尺度。"},
  "女史箴图奶蛙（工笔）":{intro:"顾恺之《女史箴图》（唐摹本）取材张华《女史箴》，以连环画面规劝宫廷女性的德行，原作藏大英博物馆。",editorial:"人物以'春蚕吐丝'般的细线勾勒，衣纹飘举如生。各段场景间以箴文分隔，镜像、梳妆与狩猎的场景把道德训诫画成生活的侧影，是中国最早的卷轴人物画实物之一。"},
  "芙蓉锦鸡图奶蛙（枝条角落版）":{intro:"宋徽宗赵佶《芙蓉锦鸡图》以'瘦金体'题诗，是宋代院体花鸟的典范。",editorial:"芙蓉自右下斜出，锦鸡回首凝视双蝶，构图的'角落—中心'张力来自枝条的弹性。设色富丽而线条精准，'诗书画印'四位一体的形式在此确立，院体画的理性之美达到顶点。"},
  "早春图奶蛙（山石笔墨融合版）":{intro:"郭熙《早春图》（北宋，1072年）作于巨碑式绢本上，是北方山水画派的巅峰之作。",editorial:"以'卷云皴'塑造的山体如春冰初融：主峰居中、侧岭环抱，山腰的雾气让'早春'的生机以留白呈现。'高远、深远、平远'三远法在此完备，郭熙在《林泉高致》中把山水画上升为哲学。"},
  "万壑松风图奶蛙（山石笔墨版）":{intro:"李唐《万壑松风图》（北宋，1124年）为其晚年巨作，南北宋山水转型的关键作品。",editorial:"斧劈皴如刀削斧凿，万松扎根于嶙峋山壑：主峰的静与瀑布的动构成山水的呼吸。李唐南渡后把这种刚硬的笔法带入南宋，'小斧劈'由此催生马夏的边角山水，是承前启后的里程碑。"},
  "捣练图奶蛙（红衣小孩转化版）":{intro:"张萱《捣练图》（宋摹本）描绘唐代宫廷妇女捣练、缝纫与熨烫白练的劳动场景。",editorial:"长卷按工序分段：捣、缝、熨各司其职，蹲于地下的红衣小童为劳动的节奏提供童趣的插入点。石绿与朱砂的配色、丰腴的面庞与精确的动作，是盛唐仕女画'绮罗人物'的标准样本。"},
  "照夜白图奶蛙（骑马版）":{intro:"韩干《照夜白图》（唐）描绘玄宗爱马'照夜白'拴于木桩上的雄姿，是唐代鞍马画的传世名作。",editorial:"骏马昂首嘶鸣、四蹄腾踏，圆睁的目光与绷紧的缰绳把'静中之动'推到极限。以细劲的铁线描配以轻微的晕染，肌肉的起伏在白描的克制中获得雕塑感，'韩马'自此成为画马的标准。"},
  "虢国夫人游春图奶蛙（骑行者转化工笔版）":{intro:"张萱《虢国夫人游春图》（宋摹本）描绘杨贵妃之姊虢国夫人盛装骑马出游的场面。",editorial:"人马队列疏密有致：淡妆的贵妇与女侍皆着男装胡服，'游春'无春景而春意自现。线描的圆熟与设色的典雅把盛唐贵族的自信画成从容的行进，是唐代'绮罗人物'的姊妹名作。"},
  "步辇图奶蛙（红衣人物转化工笔版）":{intro:"阎立本《步辇图》（宋摹本）描绘吐蕃使者禄东赞朝见唐太宗、请求通婚的历史场景。",editorial:"太宗乘宫女所抬步辇居右，禄东赞恭立居左，典礼官的红衣成为构图的视觉枢纽。人物比例以尊卑定大小，这是外交史实的图像记录，也是初唐人物画'纪功颂德'功能的典范。"},
  "梅花图奶蛙（写意梅枝版）":{intro:"金农《梅花图》属扬州八怪以梅自况的写意传统，以'漆书'笔法入画。",editorial:"梅枝以方拙的浓墨横点写出，花朵以圈白法留出呼吸。金农的梅'不疏不密'，拙中寓秀，把文人的孤高画成近乎图案的秩序，扬州八怪的'怪'正在这种不肯流俗的笔法里。"},
  "桃源仙境图奶蛙（人物转化工笔版）":{intro:"仇英《桃源仙境图》（明，16世纪）取材陶渊明《桃花源记》，青绿重彩的桃源全景。",editorial:"峰峦以石青石绿层层积染，三位高士临流而坐、白衣如雪。'仙境'不靠云雾而靠色彩的纯度与现实隔离，仇英以工匠的精微完成文人的理想，是明代青绿山水的绝响。"},
};
[...WORKS,...CHINA_WORKS_SYNC].forEach(w=>{
  const fix=WORK_TEXT_FIX[w.zh];
  if(fix){
    WORK_INTRO[w.zh]=fix.intro;
    WORK_EDITORIAL[w.zh]=fix.editorial;
    w.intro=fix.intro;w.curatorial=fix.editorial;w.story=fix.intro;
  }
});

[...WORKS,...CHINA_WORKS_SYNC].forEach(w=>{w.intro=WORK_INTRO[w.zh]||w.intro||w.story;w.curatorial=WORK_EDITORIAL[w.zh]||w.curatorial||w.story;w.trivia=WORK_TRIVIA[w.zh]||w.trivia||'关于这件作品的相关逸事仍在博物馆资料中持续核对。';});
// 内部备选字段 story 只作为兜底来源；若仍残留改编措辞，用已清理的介绍覆盖，确保任何路径都不会露出改编描述。
[...WORKS,...CHINA_WORKS_SYNC].forEach(w=>{
  const t=w.story||'';
  if(/奶蛙|成熟态|幼态|改编|换为|换成/.test(t))w.story=w.intro||'';
});

const UI_TEXT={
  zh:{menu:'菜单',visit:'参观中国馆',preface:'序言',collection:'典藏',era:'年代',visitNav:'造访',threeD:'3D 展馆',town:'奶蛙小镇',maker:'制造所',explore:'探索典藏',collectionTitle:'典藏系列',permanent:'The Permanent Collection',original:'原作',artist:'艺术家',period:'年代',close:'关闭',lang:'切换英文'},
  en:{menu:'Menu',visit:'Visit China Museum',preface:'Preface',collection:'Collection',era:'Timeline',visitNav:'Visit',threeD:'3D Gallery',town:'Milk Frog Town',maker:'The Workshop',explore:'Explore Collection',collectionTitle:'The Collection',permanent:'The Permanent Collection',original:'Original',artist:'Artist',period:'Period',close:'Close',lang:'切换中文'}
};
const ERA_LABEL_EN={all:'All',recent:'Recent',prehistoric:'Prehistoric',ancient:'Classical',medieval:'Medieval',gothic:'Gothic',renaissance:'Renaissance',baroque:'Baroque','18c':'18th–19th Century',neoclassicism:'Neoclassicism',rococo:'Rococo',realism:'Realism',romanticism:'Romanticism','pre-raphaelite':'Pre-Raphaelite',ukiyoe:'Ukiyo-e',impressionism:'Impressionism',postimpressionism:'Post-Impressionism',modern:'Modern',contemporary:'Contemporary','china-pre-qin':'Prehistoric and Pre-Qin','china-qin-han':'Qin and Han','china-wei-jin':'Wei, Jin and Northern and Southern Dynasties','china-sui-tang':'Sui and Tang','china-song':'Five Dynasties and Song','china-ming-qing':'Yuan, Ming and Qing','china-modern':'Modern China'};
let currentLang='zh';

function syncPageLock(){
  const modalOpen=document.querySelector('.lightbox.open,.quiz.open,.artist-modal.open,.menu-drawer.open,.update-log.open,.feedback-panel.open,.archive-panel.open,.profile-panel.open,.identity-maker.open,.china-gate.open');
  document.body.style.overflow=modalOpen?'hidden':'';
}

const ERAS = [
  ["all","全部"],
  ["prehistoric","史前"],
  ["ancient","古典"],
  ["medieval","中世纪"],
  ["renaissance","文艺复兴"],
  ["baroque","巴洛克"],
  ["neoclassicism","新古典主义"],
  ["rococo","洛可可"],
  ["realism","现实主义"],
  ["romanticism","浪漫主义"],
  ["pre-raphaelite","拉斐尔前派"],
  ["ukiyoe","浮世绘"],
  ["impressionism","印象派"],
  ["postimpressionism","后印象派"],
  
  
  ["modern","现代"],
  ["china-pre-qin","史前与先秦"],
  ["china-qin-han","秦汉"],
  ["china-wei-jin","魏晋南北朝"],
  ["china-sui-tang","隋唐"],
  ["china-song","五代两宋"],
  ["china-ming-qing","元明清"],
  ["china-modern","近现代"],
];
const ERA_LABEL = Object.fromEntries(ERAS.map(e=>e));
const ERA_ORDER = ERAS.map(e=>e[0]);
// accession-number prefixes per era (museum-style catalogue codes)
const ERA_CODE = {
  prehistoric:'PRE', ancient:'ANT', medieval:'MED', renaissance:'REN',
  baroque:'BAR', neoclassicism:'NEO', rococo:'ROC', realism:'REA', romanticism:'ROM', 'pre-raphaelite':'PRA', ukiyoe:'UKI', impressionism:'IMP',
  postimpressionism:'PIM', grand:'GRD', modern:'MOD',
  'china-pre-qin':'CNQ', 'china-qin-han':'QH', 'china-wei-jin':'WJN',
  'china-sui-tang':'SUT', 'china-song':'SNG', 'china-ming-qing':'MQR', 'china-modern':'CNM'
};

// record acquisition order (later = newer) before any era sorting
const ACQUISITION_DATES = {
  "构成八号奶蛙": "2026-08-08",
  "哥特奶蛙圣母院": "2026-08-08",
  "阿尔塔米拉的奶蛙": "2026-08-08",
  "岩画手印奶蛙": "2026-08-08",
  "塞拉山奔跑奶蛙": "2026-08-08",
  "石阵仪式奶蛙": "2026-08-08",
  "岩刻游行奶蛙": "2026-08-08",
  "米洛斯的奶蛙": "2026-08-08",
  "圣母子与奶蛙": "2026-08-08",
  "最后的晚餐奶蛙": "2026-08-08",
  "创造奶蛙": "2026-08-08",
  "雅典学院的核心奶蛙": "2026-08-08",
  "神奈川冲浪奶蛙": "2026-08-08",
  "雪中桥奶蛙": "2026-08-08",
  "睡莲中的奶蛙": "2026-08-08",
  "撑阳伞的奶蛙": "2026-08-08",
  "干草堆奶蛙": "2026-08-08",
  "星月奶蛙夜": "2026-08-08",
  "向日葵奶蛙": "2026-08-08",
  "圣维克多山奶蛙": "2026-08-08",
  "三个音乐家奶蛙": "2026-08-08",
  "呐喊的奶蛙": "2026-08-08",
  "玩纸牌的奶蛙": "2026-08-25",
  "乔托逃往埃及奶蛙": "2026-08-31",
  "杜乔进入耶路撒冷奶蛙": "2026-08-31",
  "圣乔治屠龙奶蛙": "2026-08-31",
  "石工奶蛙": "2026-08-31",
  "伏尔加河上的纤夫奶蛙": "2026-08-31",
  "三等车厢奶蛙": "2026-08-31",
  "晚钟奶蛙": "2026-08-31",
  "抢球奶蛙": "2026-08-31",
  "拾穗者奶蛙": "2026-08-31",
  "梅杜萨之筏奶蛙": "2026-08-31",
  "自由引导人民奶蛙": "2026-08-31",
  "纳芙蒂蒂头像奶蛙": "2026-08-31",
  "德尔斐御者奶蛙": "2026-08-31",
  "乔托哀悼基督奶蛙": "2026-08-31",
  "契马布埃圣三位一体圣母子奶蛙": "2026-08-31",
  "雪中猎人奶蛙": "2026-08-31",
  "大使们奶蛙": "2026-08-31",
  "浪子回头奶蛙": "2026-08-31",
  "以马忤斯的晚餐奶蛙": "2026-08-31",
  "绘画的艺术奶蛙": "2026-08-31",
  "布商同业公会理事奶蛙": "2026-08-31",
  "绘画寓意的自画像奶蛙": "2026-08-31",
  "油灯前的抹大拉奶蛙": "2026-08-31",
  "雨天的巴黎街道奶蛙": "2026-08-31",
  "奥菲莉亚奶蛙": "2026-08-31",
  "贝娅塔·贝亚特丽克斯奶蛙": "2026-08-31",
  "水晶球奶蛙": "2026-08-31",
  "看哪，主的婢女奶蛙": "2026-08-31",
  "圣西塞莉亚奶蛙": "2026-08-31",
  "玫瑰之魂奶蛙": "2026-08-31",
  "圣巴塞洛缪节前夕的胡格诺派奶蛙": "2026-08-31",
  "废墟中的爱奶蛙": "2026-08-31",
  "释放令，1746奶蛙": "2026-08-31",
  "蓝色凉亭奶蛙": "2026-08-31",
  "夏洛特夫人奶蛙": "2026-08-31",
  "普罗塞耳皮娜奶蛙": "2026-08-31",
  "金色阶梯奶蛙": "2026-08-31",
  "沉睡的吉普赛人奶蛙": "2026-08-31",
  "夜游者奶蛙": "2026-08-31",
  "阿黛尔的肖像奶蛙": "2026-08-31",
  "甲州石班泽奶蛙": "2026-09-01",
  "大桥安宅骤雨奶蛙": "2026-09-01",
  "三代目大谷鬼次奶蛙": "2026-09-01",
  "泷夜叉姬与骷髅妖怪奶蛙": "2026-09-01",
  "金太郎捕鲤鱼奶蛙": "2026-09-01",
  "包厢奶蛙": "2026-09-01",
  "布吉瓦尔之舞奶蛙": "2026-09-01",
  "伞奶蛙": "2026-09-01",
  "蓝色扶手椅上的小女孩奶蛙": "2026-09-01",
  "大碗岛的星期天下午奶蛙": "2026-09-01",
  "罗纳河上的星夜奶蛙": "2026-09-01",
  "萨莫色雷斯的胜利女神奶蛙": "2026-09-01",
  "休息的拳击手奶蛙": "2026-09-01",
  "拉奥孔群像奶蛙": "2026-09-01",
  "汉谟拉比法典石碑奶蛙": "2026-09-01",
  "第一门的奥古斯都奶蛙": "2026-09-01",
  "雾海上的旅人奶蛙": "2026-09-01",
  "但丁之舟奶蛙": "2026-09-01",
  "梦魇奶蛙": "2026-09-01",
  "干草车奶蛙": "2026-09-01",
  "吹笛少年奶蛙": "2026-09-04",
  "荷拉斯兄弟之誓奶蛙": "2026-09-04",
  "前线的俘虏奶蛙": "2026-09-04",
  "罗利的童年奶蛙": "2026-09-04",
  "巴拉克拉瓦奶蛙": "2026-09-04",
  "墓园孤儿奶蛙": "2026-09-04",
  "吕根岛白垩崖奶蛙": "2026-09-07",
  "吉萨的狮身人面像奶蛙": "2026-09-07",
  "卢浮宫废墟的想象图奶蛙": "2026-09-07",
  "纳尔尼桥奶蛙": "2026-09-07",
  "巨石阵黎明奶蛙": "2026-09-07",
  "海洋边的僧侣奶蛙": "2026-09-08",
  "1808年5月3日奶蛙": "2026-09-18",
  "望月的两人奶蛙": "2026-09-18",
  "雷卡米埃夫人奶蛙": "2026-09-20",
  "翻越阿尔卑斯奶蛙": "2026-09-20",
  "苏格拉底之死奶蛙": "2026-09-20",
  "新石器彩陶纹样奶蛙": "2026-08-31",
  "神人兽面纹玉琮奶蛙": "2026-08-31",
  "四羊方尊奶蛙": "2026-08-31",
  "秦始皇陵跪射俑奶蛙": "2026-09-01",
  "长信宫灯奶蛙": "2026-09-01",
  "击鼓说唱俑奶蛙": "2026-09-01",
  "洛神赋图奶蛙": "2026-09-01",
  "云冈石窟北魏佛像奶蛙": "2026-09-01",
  "唐三彩骆驼载乐俑奶蛙": "2026-09-01",
  "竹林七贤与荣启期砖画奶蛙": "2026-09-01",
  "女史箴图奶蛙（工笔）": "2026-09-01",
  "游春图奶蛙": "2026-09-01",
  "簪花仕女图奶蛙": "2026-09-01",
  "捣练图奶蛙（红衣小孩转化版）": "2026-09-01",
  "照夜白图奶蛙（骑马版）": "2026-09-01",
  "虢国夫人游春图奶蛙（骑行者转化工笔版）": "2026-09-01",
  "步辇图奶蛙（红衣人物转化工笔版）": "2026-09-01",
  "韩熙载夜宴图奶蛙": "2026-09-01",
  "定窑白釉孩儿枕奶蛙": "2026-09-01",
  "清明上河图奶蛙": "2026-09-01",
  "寒江独钓图奶蛙（写意）": "2026-09-01",
  "早春图奶蛙（山石笔墨融合版）": "2026-09-01",
  "万壑松风图奶蛙（山石笔墨版）": "2026-09-01",
  "芙蓉锦鸡图奶蛙（枝条角落版）": "2026-09-01",
  "富春山居图奶蛙": "2026-09-01",
  "梅花图奶蛙（写意梅枝版）": "2026-09-01",
  "桃源仙境图奶蛙（人物转化工笔版）": "2026-09-01",
  "百骏图奶蛙": "2026-09-01",
  "荷花与鸭奶蛙（写意）": "2026-09-01",
  "奔马奶蛙（变体形态版）": "2026-09-01",
  "虾趣奶蛙": "2026-09-01",
  "蛙声十里出山泉奶蛙": "2026-09-01",
  "万山红遍奶蛙": "2026-09-01",
  "江山如此多娇奶蛙": "2026-09-01",
  "鹰石山花奶蛙": "2026-09-01",
};
WORKS.forEach((w,i)=>{w.entry=i;if(!w.entryDate)w.entryDate=ACQUISITION_DATES[w.zh]||'2026-08-08';});
CHINA_WORKS_SYNC.forEach((w,i)=>{if(w.entry===undefined){w.entry=100000+i;if(!w.entryDate)w.entryDate=ACQUISITION_DATES[w.zh]||'2026-09-01';}});

// order works by era then keep given order
WORKS.sort((a,b)=>ERA_ORDER.indexOf(a.era)-ERA_ORDER.indexOf(b.era));

// assign a running accession number within each era: MFM · PRE-01, PRE-02 …
const eraCounters = {};
WORKS.forEach(w=>{
  const code = ERA_CODE[w.era] || 'GEN';
  eraCounters[code] = (eraCounters[code]||0) + 1;
  w.acc = `MFM · ${code}-${String(eraCounters[code]).padStart(2,'0')}`;
});

const MAIN_WORKS=WORKS.filter(w=>!w.era.startsWith('china-'));
const CHINA_WORKS=CHINA_WORKS_SYNC.slice().sort((a,b)=>ERA_ORDER.indexOf(a.era)-ERA_ORDER.indexOf(b.era));
const CHINA_ORIGINALS={
  "竹林七贤与荣启期砖画奶蛙":"assets/context/works/original-seven-sages.jpg",
  "游春图奶蛙":"assets/context/works/original-spring-outing.jpg",
  "簪花仕女图奶蛙":"assets/context/works/original-ladies-flowers.jpg",
  "韩熙载夜宴图奶蛙":"assets/context/works/original-night-revels.jpg",
  "定窑白釉孩儿枕奶蛙":"assets/context/works/original-child-pillow.jpg",
  "清明上河图奶蛙":"assets/context/works/original-qingming.jpg",
  "寒江独钓图奶蛙（写意）":"assets/context/works/original-cold-river.jpg",
  "富春山居图奶蛙":"assets/context/works/original-fuchun-scroll.jpg",
  "百骏图奶蛙":"assets/context/works/original-hundred-steeds.jpg",
  "荷花与鸭奶蛙（写意）":"assets/context/works/original-lotus-ducks.jpg",
  "虾趣奶蛙":"assets/context/works/original-shrimp.jpg",
  "女史箴图奶蛙（工笔）":"assets/context/works/original-luoshen-scroll.jpg"
};
CHINA_WORKS.forEach(w=>{if(CHINA_ORIGINALS[w.zh])w.originalImage=CHINA_ORIGINALS[w.zh];});
const chinaEraCounters={};
CHINA_WORKS.forEach(w=>{
  const code=ERA_CODE[w.era]||'GEN';
  chinaEraCounters[code]=(chinaEraCounters[code]||0)+1;
  w.acc=`MFM · ${code}-${String(chinaEraCounters[code]).padStart(2,'0')}`;
});

// Split eras into true historical periods and art movements.
// PERIODS: broad time-based classification; MOVEMENTS: stylistic schools.
const PERIOD_MAP = {
  prehistoric: 'prehistoric', ancient: 'ancient', medieval: 'medieval',
  gothic: 'gothic', renaissance: 'renaissance', baroque: 'baroque',
  '18c': '18c', modern: 'modern', contemporary: 'contemporary',
  'china-pre-qin': 'china-pre-qin', 'china-qin-han': 'china-qin-han',
  'china-wei-jin': 'china-wei-jin', 'china-sui-tang': 'china-sui-tang',
  'china-song': 'china-song', 'china-ming-qing': 'china-ming-qing', 'china-modern': 'china-modern'
};
const MOVEMENT_MAP = {
  neoclassicism: 'neoclassicism', rococo: 'rococo', realism: 'realism',
  romanticism: 'romanticism', 'pre-raphaelite': 'pre-raphaelite',
  ukiyoe: 'ukiyoe', impressionism: 'impressionism', postimpressionism: 'postimpressionism'
};
// Map each work's era to its period group and movement group.
function getPeriod(era){
  if(PERIOD_MAP[era])return era;
  // Movement-dominated works map to their containing period for period view
  const movementToPeriod={
    neoclassicism:'18c', rococo:'18c', realism:'18c',
    romanticism:'18c', 'pre-raphaelite':'18c', ukiyoe:'18c',
    impressionism:'18c', postimpressionism:'18c'
  };
  return movementToPeriod[era]||'modern';
}
function getMovement(era){
  return MOVEMENT_MAP[era]||null;
}

const ENTRY_FILTERS = [['all','全部'],['week','近一周'],['month','近一个月'],['year','近一年']];
const PERIOD_FILTERS_WEST = [['recent','推荐'],['all','全部'],['prehistoric','史前'],['ancient','古典'],['medieval','中世纪'],['gothic','哥特'],['renaissance','文艺复兴'],['baroque','巴洛克'],['18c','18–19世纪'],['modern','现代'],['contemporary','当代']];
const PERIOD_FILTERS_CHINA = [['recent','推荐'],['all','全部'],['china-pre-qin','史前与先秦'],['china-qin-han','秦汉'],['china-wei-jin','魏晋南北朝'],['china-sui-tang','隋唐'],['china-song','五代两宋'],['china-ming-qing','元明清'],['china-modern','近现代']];
const MOVEMENT_FILTERS = [['recent','推荐'],['all','全部'],['prehistoric','史前'],['ancient','古典'],['medieval','中世纪'],['gothic','哥特'],['renaissance','文艺复兴'],['baroque','巴洛克'],['rococo','洛可可'],['neoclassicism','新古典主义'],['romanticism','浪漫主义'],['realism','现实主义'],['pre-raphaelite','拉斐尔前派'],['impressionism','印象派'],['postimpressionism','后印象派'],['ukiyoe','浮世绘'],['modern','现代']];
// Chinese works are classified by medium/technique, not Western movements.
const CHINA_MOVEMENT_FILTERS = [['recent','推荐'],['all','全部'],['pottery','陶器/青铜'],['sancai','三彩'],['sculpture','雕塑'],['mural','壁画/石刻'],['gongbi','工笔'],['xieyi','写意'],['others','其他']];

function getFiltersForMode(mode,isChina,entries){
  let list;
  if(mode==='entry')list=ENTRY_FILTERS;
  else if(mode==='movement')list=isChina?CHINA_MOVEMENT_FILTERS:MOVEMENT_FILTERS;
  else list=isChina?PERIOD_FILTERS_CHINA:PERIOD_FILTERS_WEST;
  // Keep 最近/全部 always; drop category tabs that currently hold no works.
  return list.filter(function(pair){
    const k=pair[0];
    if(k==='recent'||k==='all')return true;
    return entries.some(function(w){return matchesFilter(w,k,mode,isChina);});
  });
}

// ---------------------------------------------------------------
// 推荐位：馆长指定的推荐作品，按本数组顺序出现在“推荐”标签最前面。
// 留空时自动回退为「最新入馆优先」，标签不会空白。
// 填入示例：['雷卡米埃夫人奶蛙','苏格拉底之死奶蛙']
// ---------------------------------------------------------------
const RECOMMENDED_WORKS = {
  era: [
    '萨莫色雷斯的胜利女神奶蛙',
    '岩刻游行奶蛙',
    '乔托哀悼基督奶蛙',
    '大使们奶蛙',
    '绘画的艺术奶蛙',
    '梅杜萨之筏奶蛙'
  ],
  movement: [
    '吕根岛白垩崖奶蛙',
    '拾穗者奶蛙',
    '睡莲中的奶蛙',
    '大碗岛的星期天下午奶蛙',
    '神奈川冲浪奶蛙',
    '星月奶蛙夜'
  ]
};

function recommendedRank(workName, mode){
  const list = (RECOMMENDED_WORKS && RECOMMENDED_WORKS[mode]) || [];
  const i = list.indexOf(workName);
  return i < 0 ? 9999 : i;
}

// Shared matcher used by both the filter bar and the gallery.
function matchesFilter(w,key,mode,isChina){
  if(key==='all')return true;
  // 推荐 is an ordering tab: every work stays visible, curated picks float to the front.
  if(key==='recent')return true;
  if(key==='week')return isWithinDays(w.entryDate,7);
  if(key==='month')return isWithinDays(w.entryDate,30);
  if(key==='year')return isWithinDays(w.entryDate,365);
  if(mode==='movement'){
    if(isChina)return getChinaMovement(w)===key;
    // 流派标签既收流派作品，也收没有流派的时期作品（史前/古典/中世纪/…）
    if(getMovement(w.era)===key)return true;
    return PERIOD_MAP[key] ? getPeriod(w.era)===key : false;
  }
  return getPeriod(w.era)===key;
}

function isWithinDays(dateStr,days){
  if(!dateStr)return false;
  const d=new Date(dateStr);
  if(isNaN(d.getTime()))return false;
  return (Date.now()-d.getTime())<days*24*60*60*1000;
}

function buildFilters(container,entries,filterHandler,isChina){
  const subFilters=getFiltersForMode(sortMode,isChina,entries);
  container.replaceChildren();
  subFilters.forEach(([k,label])=>{
    const b=document.createElement('button');b.textContent=label;b.dataset.filter=k;
    if(k==='recent')b.classList.add('active');
    b.onclick=()=>{container.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterHandler(k);};
    container.appendChild(b);
  });
}

// Build one shared card shape for both museum collections.
function createCard(w,mode){
  const c=document.createElement('article');
  c.className='card';c.dataset.era=w.era;c.dataset.workName=w.zh;
  if(w.entryDate)c.dataset.entryDate=w.entryDate;
  c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label',`查看作品：${w.zh}`);
  c.innerHTML=`
    <div class="card-frame"><img loading="lazy" src="${w.url}" alt="${w.zh}"><span class="card-view">View Work</span></div>
    <div class="card-meta"><div class="card-era"><span>${mode==='movement'&&getMovement(w.era)?ERA_LABEL[w.era]:ERA_LABEL[getPeriod(w.era)]||ERA_LABEL[w.era]}</span><span class="card-acc">${w.acc}</span></div>
      <h3>${w.zh}</h3><div class="en">${w.en}</div><div class="card-submeta"><span>${w.artist}</span><span>${w.year}</span></div>
      <div class="orig"><span>${w.orig} · ${w.artist}</span><span class="yr">${w.year}</span></div></div>`;
  let dragged=false,startX=0,startY=0;
  c.addEventListener('pointerdown',e=>{dragged=false;startX=e.clientX;startY=e.clientY;});
  c.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>10)dragged=true;});
  c.onclick=()=>{if(!dragged)openLightbox(w);};
  c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(w);}};
  return c;
}

const gal=document.getElementById('gallery');
const chinaGal=document.getElementById('chinaGallery');
function renderGallery(){
  const prevGallery=activeGallery,prevPage=activePage;
  // Always sort newest first when sortMode is entry; for other modes keep canonical order
  // but the 'recent' filter will pick the newest entries regardless of mode.
  const byNewest=(a,b)=>(b.entryDate||'').localeCompare(a.entryDate||'');
  const orderedMain=sortMode==='entry'?MAIN_WORKS.slice().sort(byNewest):MAIN_WORKS;
  const orderedChina=sortMode==='entry'?CHINA_WORKS.slice().sort(byNewest):CHINA_WORKS;
  gal.replaceChildren(...orderedMain.map(w=>createCard(w,sortMode)));
  chinaGal.replaceChildren(...orderedChina.map(w=>createCard(w,sortMode)));
  buildFilters(fbar,MAIN_WORKS,applyFilter,false);
  buildFilters(chinaFbar,CHINA_WORKS,applyChinaFilter,true);
  activeEra=sortMode==='entry'?'all':'recent';activePage=1;
  if(prevGallery===chinaGal){activeGallery=chinaGal;activeWorks=CHINA_WORKS;activePagination=chinaPagination;renderCollection();}
  else{activeGallery=gal;activeWorks=MAIN_WORKS;activePagination=pagination;renderCollection();}
}
const fbar=document.getElementById('filters');
const chinaFbar=document.getElementById('chinaFilters');
let activeGallery=gal;
let activeWorks=MAIN_WORKS;
let sortMode='entry';
buildFilters(fbar,MAIN_WORKS,applyFilter);
buildFilters(chinaFbar,CHINA_WORKS,applyChinaFilter);

// scroll reveal and desktop pagination
const io=new IntersectionObserver((es)=>{
  es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{threshold:.15});
const pagination=document.getElementById('pagination');
const chinaPagination=document.getElementById('chinaPagination');
let activePagination=pagination;
const desktopPages=matchMedia('(min-width:721px)');
const pageSize=6;
let activeEra='all';
let activePage=1;
// Classify Chinese works by medium/technique for the movement view.
function getChinaMovement(w){
  const zh=w.zh;
  // 石刻 / 砖画 / 石窟造像
  if(/石窟|砖画|岩刻/.test(zh))return 'mural';
  // 器物：陶、玉、青铜
  if(/彩陶|玉琮|方尊/.test(zh))return 'pottery';
  // 三彩釉陶
  if(/三彩/.test(zh))return 'sancai';
  // 立体雕塑：俑、铜像、灯具
  if(/跪射俑|说唱俑|宫灯/.test(zh))return 'sculpture';
  // 写意
  if(/写意/.test(zh))return 'xieyi';
  if(/奔马|虾趣|蛙声|万山|江山|鹰石/.test(zh))return 'xieyi';
  // 工笔
  if(/工笔|游春图|仕女|夜宴|捣练|照夜白|虢国|步辇|洛神|女史箴|梅花|桃源|寒江|早春|万壑|芙蓉|孩儿枕|清明|富春|百骏|荷花/.test(zh))return 'gongbi';
  return 'others';
}

function matchingCards(){
  const works = activeGallery===chinaGal ? CHINA_WORKS : MAIN_WORKS;
  let result = [...activeGallery.querySelectorAll('.card')].filter(function(card){
    const w = works.find(function(x){return x.zh===card.dataset.workName;});
    if(!w)return false;
    return matchesFilter(w,activeEra,sortMode,activeGallery===chinaGal);
  });
  // 最近 and 按入馆 always read newest-first
  if(activeEra==='recent'){
    result.sort(function(a,b){
      const tab=sortMode==='movement'?'movement':'era';
      const ra=recommendedRank(a.dataset.workName||'',tab);
      const rb=recommendedRank(b.dataset.workName||'',tab);
      if(ra!==rb)return ra-rb;
      return (b.dataset.entryDate||'').localeCompare(a.dataset.entryDate||'');
    });
  }else if(sortMode==='entry'){
    result.sort(function(a,b){
      return (b.dataset.entryDate||'').localeCompare(a.dataset.entryDate||'');
    });
  }
  return result;
}
function renderCollection({scroll=false}={}){
  const matching=matchingCards();
  const isDesktop=desktopPages.matches;
  const visiblePageSize=isDesktop?pageSize:6;
  const pageCount=Math.max(1,Math.ceil(matching.length/visiblePageSize));
  activePage=Math.min(activePage,pageCount);
  const pageStart=(activePage-1)*visiblePageSize;
  activeGallery.querySelectorAll('.card').forEach(c=>{
    const match=matching.indexOf(c)>=0;
    const index=matching.indexOf(c);
    const show=match&&(index>=pageStart&&index<pageStart+visiblePageSize);
    c.classList.toggle('hide',!show);
    c.classList.remove('in');
  });
  activePagination.replaceChildren();
  if(pageCount>1){
    const makeButton=(label,page,disabled=false,current=false)=>{
      const b=document.createElement('button');
      b.type='button';b.textContent=label;b.disabled=disabled;
      b.setAttribute('aria-label',label==='‹'?'上一页':label==='›'?'下一页':`第${page}页`);
      if(current)b.setAttribute('aria-current','page');
      const go=()=>{if(b.disabled)return;activePage=page;renderCollection({scroll:true});};
      b.onclick=go;
      b.onpointerup=e=>{if(e.pointerType==='touch'){e.preventDefault();go();}};
      activePagination.appendChild(b);
    };
    makeButton('‹',Math.max(1,activePage-1),activePage===1);
    for(let page=1;page<=pageCount;page++)makeButton(String(page),page,false,page===activePage);
    makeButton('›',Math.min(pageCount,activePage+1),activePage===pageCount);
  }
  activePagination.hidden=pageCount<=1;
  requestAnimationFrame(()=>activeGallery.querySelectorAll('.card:not(.hide)').forEach((c,i)=>{
    c.style.transitionDelay=(i%3)*90+'ms';io.observe(c);
  }));
  if(scroll)(activeGallery===chinaGal?document.querySelector('#chinaPage'):document.querySelector('#collection')).scrollIntoView({behavior:'smooth',block:'start'});
}
function applyFilter(era){
  activeEra=era;activePage=1;activeGallery=gal;activeWorks=MAIN_WORKS;activePagination=pagination;renderCollection();
}
function applyChinaFilter(era){
  activeEra=era;activePage=1;activeGallery=chinaGal;activeWorks=CHINA_WORKS;activePagination=chinaPagination;renderCollection();
}
desktopPages.addEventListener('change',()=>{activePage=1;renderCollection()});
(function(){
  const st=document.getElementById('sortToggle');
  const cst=document.getElementById('chinaSortToggle');
  const setSort=mode=>{
    if(sortMode===mode)return;
    sortMode=mode;
    [st,cst].forEach(t=>{if(t)t.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.sort===mode));});
    activePage=1;renderGallery();
  };
  [st,cst].forEach(t=>{if(t)t.querySelectorAll('button').forEach(btn=>{btn.onclick=()=>setSort(btn.dataset.sort);});});
})();
renderGallery();

// Night mode toggle (black-blue UI), remembered across visits.
(function(){
  const toggle=document.getElementById('themeToggle');
  if(!toggle)return;
  const KEY='milkfrog-theme';
  const apply=night=>{
    document.body.classList.toggle('night',night);
    toggle.setAttribute('aria-label',night?'切换日间模式':'切换夜间模式');
    toggle.setAttribute('title',night?'日间模式':'夜间模式');
  };
  let night=false;
  try{night=localStorage.getItem(KEY)==='night';}catch(e){}
  apply(night);
  toggle.addEventListener('click',()=>{
    night=!night;
    apply(night);
    try{localStorage.setItem(KEY,night?'night':'day');}catch(e){}
  });
})();

// ================= QUIZ : 奶蛙鉴定所 =================
(function(){
  const quiz=document.getElementById('quiz');
  const openBtn=document.getElementById('giftToggle');
  if(!quiz||!openBtn)return;

  const QUESTIONS=[
    {q:'如果你在博物馆里发现一扇禁止进入的门，你会？',
      opts:['进去看看','先拍照','假装没看见','找馆长投诉']},
    {q:'馆长送你一件礼物，你第一反应是？',
      opts:['这是什么','好可爱','能吃吗','先收下再说']},
    {q:'如果必须在身上带一样东西生活一年，你选？',
      opts:['枕头','零食','手机','一只不知道有什么用的小蛙']},
    {q:'你觉得自己比较像？',
      opts:['一种生物','一件物品','一种天气','一个暂时无法解释的现象']}
  ];

  // 12 只奶蛙鉴定结果（形象均为奶蛙本蛙）
  const FROGS=[
    {img:'assets/quiz/f01.jpg',name:'雨天会自己长出来的蘑菇蛙',no:'N-0182',rare:4,habitat:'潮湿的窗台',
      comment:['“没有发现任何攻击性。”','“但也没有发现什么用。”','“建议继续观察。”']},
    {img:'assets/quiz/f02.jpg',name:'只在凌晨 3:17 出现的蛙',no:'N-0317',rare:5,habitat:'无人的走廊尽头',
      comment:['“白天从未被目击。”','“出现时间非常准时。”','“不建议熬夜等它。”']},
    {img:'assets/quiz/f03.jpg',name:'据说会帮人保管秘密的蛙',no:'N-0456',rare:4,habitat:'信箱深处',
      comment:['“它知道很多事。”','“但从不说。”','“口风极严。”']},
    {img:'assets/quiz/f04.jpg',name:'已经绝版但本人不知道的蛙',no:'N-0001',rare:5,habitat:'库房最里面那叠箱子',
      comment:['“十分稀有。”','“它对此毫无自觉。”','“请勿告知。”']},
    {img:'assets/quiz/f05.jpg',name:'混进博物馆 27 年还没被发现的蛙',no:'N-1997',rare:5,habitat:'一根没人注意的大理石柱旁',
      comment:['“登记在册上找不到它。”','“但它确实一直在。”','“已补办入馆手续。”']},
    {img:'assets/quiz/f06.jpg',name:'看起来很贵但没人知道为什么的蛙',no:'N-0888',rare:4,habitat:'玻璃展柜里的丝绒垫上',
      comment:['“估值很高。”','“依据不明。”','“仍建议投保。”']},
    {img:'assets/quiz/f07.jpg',name:'只喜欢坐电梯的蛙',no:'N-0026',rare:3,habitat:'上下往返的电梯间',
      comment:['“从不说自己要去哪层。”','“似乎不为抵达，只为乘坐。”','“已为它预留专梯。”']},
    {img:'assets/quiz/f08.jpg',name:'来自馆长童年记忆的蛙',no:'N-0079',rare:5,habitat:'旧玩具箱的最底层',
      comment:['“馆长看到它时沉默了很久。”','“未作进一步说明。”','“建议妥善保存。”']},
    {img:'assets/quiz/f09.jpg',name:'被误认为是雕塑的蛙',no:'N-0210',rare:4,habitat:'展厅中央的基座上',
      comment:['“一动不动。”','“曾有观众为它鼓掌。”','“它假装没听见。”']},
    {img:'assets/quiz/f10.jpg',name:'一生只旅行一次的蛙',no:'N-0143',rare:4,habitat:'行李箱旁边',
      comment:['“那一次去了哪里，没有人知道。”','“它也不再提。”','“行李从未拆开。”']},
    {img:'assets/quiz/f11.jpg',name:'疑似拥有房产但拒绝提供证明的蛙',no:'N-0621',rare:4,habitat:'不肯透露的某处',
      comment:['“相关文件未能出示。”','“它表示不方便说。”','“此项仍在核实。”']},
    {img:'assets/quiz/f12.jpg',name:'会在别人睡觉时偷偷换位置的蛙',no:'N-0413',rare:3,habitat:'每天都不太一样的角落',
      comment:['“早上总在另一个地方。”','“目前无法预测下一步。”','“建议多拍几张存档。”']},
    {img:'assets/quiz/f13.jpg',name:'把纸箱当房子住的蛙',habitat:'一个尺寸刚好的纸箱里',sig:'“对房型十分满意。”'},
    {img:'assets/quiz/f14.jpg',name:'拿了一张没人看得懂的证书的蛙',habitat:'歪掉的相框旁边',sig:'“证书内容无人能读懂。”'},
    {img:'assets/quiz/f15.jpg',name:'从早到晚都在伸懒腰的蛙',habitat:'下午阳光最好的那块',sig:'“从未真正清醒过。”'},
    {img:'assets/quiz/f16.jpg',name:'只收集门票却从不入场的蛙',habitat:'一堆旧门票的中间',sig:'“票很多，从未使用。”'},
    {img:'assets/quiz/f17.jpg',name:'半夜偷偷把灯打开的蛙',habitat:'一盏本不该亮的台灯下',sig:'“白天从不开灯。”'},
    {img:'assets/quiz/f18.jpg',name:'影子和本人对不上的蛙',habitat:'墙上那块不太对的阴影里',sig:'“影子形状与本体不符。”'},
    {img:'assets/quiz/f19.jpg',name:'总装作很忙的蛙',habitat:'一张摆着文件的小书桌后',sig:'“桌上文件从未翻动。”'},
    {img:'assets/quiz/f20.jpg',name:'晴天也在室内撑伞的蛙',habitat:'窗边干燥的地板上',sig:'“防备心理偏高。”'},
    {img:'assets/quiz/f21.jpg',name:'总躲在帘子后面偷看的蛙',habitat:'一块重重的展厅帘幕后',sig:'“只露出半个身子。”'},
    {img:'assets/quiz/f22.jpg',name:'一直坐在空展厅正中央的蛙',habitat:'空无一物的展厅中央',sig:'“周围什么都没有。”'},
    {img:'assets/quiz/f23.jpg',name:'自己给自己过生日的蛙',habitat:'一块小蛋糕旁边',sig:'“没有邀请其他客人。”'},
    {img:'assets/quiz/f24.jpg',name:'被泡在标本瓶里但不介意的蛙',habitat:'一只泡着液体的玻璃瓶里',sig:'“神情从容。”'},
    {img:'assets/quiz/f25.jpg',name:'满墙都是自己画像的蛙',habitat:'一面挂满自己胖像的墙前',sig:'“每幅都长得一样。”'},
    {img:'assets/quiz/f26.jpg',name:'一边看“请勿触碰”一边触碰的蛙',habitat:'一块“请勿触碰”的牌子旁',sig:'“仍在触碰中。”'},
    {img:'assets/quiz/f27.jpg',name:'把自己埋进落叶堆的蛙',habitat:'一堆干燥的秋叶里',sig:'“只露出一个头。”'},
    {img:'assets/quiz/f28.jpg',name:'站上体重秤出现不可能数字的蛙',habitat:'一台老式体重秤上',sig:'“读数超出量程。”'},
    {img:'assets/quiz/f29.jpg',name:'把一盆小苗当成挚友的蛙',habitat:'一盆小植物旁边',sig:'“两者形影不离。”'},
    {img:'assets/quiz/f30.jpg',name:'只在一束阳光里晒太阳的蛙',habitat:'高窗洒下的那束光里',sig:'“阳光移走后也跟着移。”'}
  ];

  // 共享评语池：与每只蛙自带的评语随机拼接，制造千变万化的结果
  const COMMENT_POOL=[
    '“没有发现任何攻击性。”','“也没有发现什么用。”','“建议继续观察。”',
    '“表情长期保持不变。”','“对外界反应极少。”','“喜好不明。”',
    '“作息与人类不同步。”','“不回应呼唤。”','“偷偷长胖了一点。”',
    '“目光难以解读。”','“坐姿非常稳。”','“似乎在思考什么，也可能没有。”',
    '“不接受采访。”','“拒绝称重。”','“尚未发现天敌。”',
    '“摆放位置可能自行变化。”','“建议多拍几张存档。”','“目前一切正常。”',
    '“不建议打扰。”','“已列入重点关怀名单。”','“具体来历仍待核实。”',
    '“会在没人时发呆。”','“对食物没有明显偏好。”','“偶尔会叹气，原因不详。”'
  ];

  function pickN(arr,n){
    const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a.slice(0,n);
  }
  function randNo(){
    const L='ABCDEFGHJKLMNPRSTWXYZ';
    const pre=Math.random()<0.55?'N':L[Math.floor(Math.random()*L.length)];
    return pre+'-'+String(Math.floor(Math.random()*9999)+1).padStart(4,'0');
  }
  function randRare(){
    const r=Math.random();return r<0.12?5:r<0.5?4:3;
  }
  let lastIdx=-1;

  // stages
  const stages={};
  quiz.querySelectorAll('.quiz-stage').forEach(s=>stages[s.dataset.stage]=s);
  const actions=document.getElementById('quizActions');
  const primaryBtn=document.getElementById('quizPrimary');
  const primaryLabel=document.getElementById('quizPrimaryLabel');
  const saveIco=primaryBtn.querySelector('.ico-save');
  const againBtn=document.getElementById('quizAgain');
  function show(name){
    Object.entries(stages).forEach(([k,el])=>el.hidden=(k!==name));
    quiz.classList.toggle('showing-result',name==='result');
    // footer bar behaviour per stage
    if(name==='intro'){
      actions.hidden=false;saveIco.hidden=true;primaryLabel.textContent='开始鉴定';
      againBtn.hidden=true;primaryBtn.dataset.act='start';
    }else if(name==='result'){
      actions.hidden=false;saveIco.hidden=true;primaryLabel.textContent='进入博物馆';
      againBtn.hidden=false;primaryBtn.dataset.act='save';
    }else{ // questions / loading
      actions.hidden=true;
    }
  }
  let answers=[],idx=0,current=null;

  function openQuiz(){quiz.classList.add('open');quiz.setAttribute('aria-hidden','false');syncPageLock();reset();}
  function closeQuiz(){quiz.classList.remove('open');quiz.setAttribute('aria-hidden','true');syncPageLock();}
  function reset(){answers=[];idx=0;show('intro');}

  const stepEl=document.getElementById('quizStep');
  const barEl=document.getElementById('quizBar');
  const qEl=document.getElementById('quizQ');
  const optsEl=document.getElementById('quizOpts');
  const LETTERS=['A','B','C','D'];

  function renderQ(){
    const item=QUESTIONS[idx];
    stepEl.textContent=idx+1;
    barEl.style.width=((idx+1)/QUESTIONS.length*100)+'%';
    qEl.textContent=item.q;
    optsEl.innerHTML='';
    item.opts.forEach((opt,i)=>{
      const b=document.createElement('button');
      b.className='quiz-opt';b.type='button';
      b.innerHTML='<b>'+LETTERS[i]+'</b><span>'+opt+'</span>';
      b.onclick=()=>{answers.push(i);next();};
      optsEl.appendChild(b);
    });
  }
  function next(){
    idx++;
    if(idx<QUESTIONS.length){renderQ();}
    else{analyse();}
  }

  function analyse(){
    show('loading');
    // pick a frog image/name, avoiding an immediate repeat
    let i=Math.floor(Math.random()*FROGS.length);
    if(FROGS.length>1){while(i===lastIdx)i=Math.floor(Math.random()*FROGS.length);}
    lastIdx=i;
    current=FROGS[i];
    // randomise everything else so the card almost never repeats:
    // museum number, rarity stars, and a 3-line comment = 1 signature + 2 random pool lines
    current.no=randNo();
    current.rare=randRare();
    const extra=pickN(COMMENT_POOL,2);
    current.comment=[current.comment&&current.comment[0]?current.comment[0]:current.sig].concat(extra);
    document.getElementById('quizAnalyse').textContent='鉴定中……';
    setTimeout(()=>{fillResult();show('result');},1700);
  }

  function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n);}

  function fillResult(){
    document.getElementById('specImg').src=current.img;
    document.getElementById('specName').textContent='「'+current.name+'」';
    document.getElementById('specNo').textContent=current.no;
    document.getElementById('specRare').textContent=stars(current.rare);
    document.getElementById('specHabitat').textContent=current.habitat;
    document.getElementById('specComment').innerHTML=current.comment.map(c=>'<div>'+c+'</div>').join('');
    window.dispatchEvent(new CustomEvent('mfm:quiz-result',{detail:{name:current.name,no:current.no,rare:stars(current.rare),habitat:current.habitat,img:current.img,comment:current.comment.slice()}}));
  }

  // ---- events ----
  openBtn.addEventListener('click',openQuiz);
  document.getElementById('quizClose').addEventListener('click',closeQuiz);
  quiz.addEventListener('click',e=>{if(e.target===quiz)closeQuiz();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&quiz.classList.contains('open'))closeQuiz();});
  function startQuiz(){answers=[];idx=0;show('questions');renderQ();}
  primaryBtn.addEventListener('click',()=>{
    if(primaryBtn.dataset.act==='save')saveCard();
    else startQuiz();
  });
  againBtn.addEventListener('click',reset);

  // ---- save card as PNG (canvas compositing, same-origin images = no taint) ----
  function saveCard(){
    if(!current)return;
    const W=1080,PAD=64;
    const img=new Image();
    img.onload=()=>{
      const cw=W-PAD*2;
      const ih=Math.round(cw*img.height/img.width);
      const isNight=document.body.classList.contains('night');
      const c=document.createElement('canvas');
      const ctx=c.getContext('2d');
      // measure text blocks first to size the canvas
      const gold='#a8894f';
      const ink=isNight?'#f4ede0':'#241f18';
      const soft=isNight?'#9fb2c9':'#6a6156';
      let y=0;
      // temp height, we'll compute precisely below
      const lineName=wrapText(ctx,'「'+current.name+'」',cw-40,'600 48px "Songti SC",serif');
      const commentLines=current.comment;
      const H = PAD /*top*/ + 64 /*badge*/ + 28 + ih + 40
        + 34 /*you*/ + lineName.length*60 + 30
        + 3*64 /*rows*/ + 30
        + 54 /*note title*/ + commentLines.length*40 + 40 + PAD;
      c.width=W;c.height=H;
      // bg
      const g=ctx.createLinearGradient(0,0,0,H);
      if(isNight){g.addColorStop(0,'#16233b');g.addColorStop(1,'#101a2e');}
      else{g.addColorStop(0,'#fffdf8');g.addColorStop(1,'#f1ead9');}
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      // border
      ctx.strokeStyle=isNight?'rgba(201,177,131,.4)':'rgba(168,137,79,.4)';
      ctx.lineWidth=2;ctx.strokeRect(6,6,W-12,H-12);
      // badge bar
      ctx.fillStyle=gold;ctx.fillRect(0,0,W,64);
      ctx.fillStyle='#fff';ctx.font='600 24px "Songti SC",serif';ctx.textAlign='center';
      ctx.fillText('鉴 定 完 成',W/2,42);
      y=64+28;
      // image
      roundImage(ctx,img,PAD,y,cw,ih,14);
      y+=ih+40;
      // you are
      ctx.textAlign='center';ctx.fillStyle=gold;ctx.font='22px "Songti SC",serif';
      ctx.fillText('你是——',W/2,y+6);y+=44;
      // name (wrapped)
      ctx.fillStyle=ink;ctx.font='600 48px "Songti SC",serif';
      lineName.forEach(ln=>{ctx.fillText(ln,W/2,y);y+=60;});
      y+=8;
      // rows
      const rows=[['馆藏编号',current.no],['稀有度',stars(current.rare)],['出没地点',current.habitat]];
      ctx.textAlign='left';
      rows.forEach(r=>{
        ctx.strokeStyle='rgba(128,128,128,.22)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();
        ctx.fillStyle=gold;ctx.font='20px "Songti SC",serif';
        ctx.fillText(r[0],PAD+4,y+40);
        ctx.fillStyle=ink;ctx.font='24px "Songti SC",serif';ctx.textAlign='right';
        ctx.fillText(r[1],W-PAD-4,y+40);ctx.textAlign='left';
        y+=64;
      });
      y+=26;
      // note box
      const boxTop=y-6;
      const boxH=54+commentLines.length*40+10;
      ctx.fillStyle=isNight?'rgba(201,177,131,.1)':'rgba(168,137,79,.08)';
      roundRect(ctx,PAD,boxTop,cw,boxH,10);ctx.fill();
      ctx.fillStyle=gold;ctx.font='18px "Songti SC",serif';
      ctx.fillText('馆 长 评 语',PAD+22,boxTop+34);
      ctx.fillStyle=soft;ctx.font='24px "Songti SC",serif';
      let cy=boxTop+34+40;
      commentLines.forEach(ln=>{ctx.fillText(ln,PAD+22,cy);cy+=40;});
      // export
      c.toBlob(blob=>{
        const a=document.createElement('a');
        a.download='奶蛙鉴定-'+current.no+'.png';
        a.href=URL.createObjectURL(blob);
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      },'image/png');
    };
    img.onerror=()=>alert('图片还在加载，稍后再试一次。');
    img.src=current.img;
  }
  function wrapText(ctx,text,maxW,font){
    ctx.font=font;const chars=[...text];let lines=[],line='';
    chars.forEach(ch=>{
      if(ctx.measureText(line+ch).width>maxW&&line){lines.push(line);line=ch;}
      else line+=ch;
    });
    if(line)lines.push(line);return lines;
  }
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }
  function roundImage(ctx,img,x,y,w,h,r){
    ctx.save();roundRect(ctx,x,y,w,h,r);ctx.clip();ctx.drawImage(img,x,y,w,h);ctx.restore();
  }
})();

// Footer easter egg: faint cutouts appear only over empty dark space.
const footer=document.getElementById('footer');
const frogTrail=document.getElementById('frogTrail');
const frogAssets=[
  'assets/hover-frogs/frog-01.png',
  'assets/hover-frogs/frog-02.png',
  'assets/hover-frogs/frog-03.png',
  'assets/hover-frogs/frog-04.png'
];
const museumBgm=new Audio('assets/audio/museum-bgm.mp3');
museumBgm.preload='auto';
museumBgm.loop=true;
museumBgm.volume=.28;
const frogSound=new Audio('assets/audio/frog-hover.mp3');
frogSound.preload='auto';
frogSound.volume=.42;
const activeFrogSounds=new Set();

// The hero VIDEO plays muted+looping on load (muted autoplay is always allowed), purely as visuals.
// The BGM (nocturne) is a SEPARATE audio loop, independent of the video: it starts muted so the
// browser lets it autoplay, then unmutes on the visitor's first interaction (move/scroll/click/touch).
// Because it's decoupled, the video ending, looping, or being paused never affects the music.
let bgmUnmuted=false;   // has the first gesture unmuted it yet
let bgmWanted=true;     // has the visitor chosen to keep it on (corner toggle)
museumBgm.muted=true;
museumBgm.play().catch(()=>{});
function startBgm(){
  // resume the loop only when the visitor wants it and no laughter is playing
  if(bgmWanted&&!activeFrogSounds.size){museumBgm.play().catch(()=>{});}
}
function unlockBgm(){
  if(bgmUnmuted||!bgmWanted)return;
  museumBgm.muted=false;
  const p=museumBgm.play();
  if(p&&p.then){
    p.then(()=>{
      // playback actually started under a valid user gesture -> lock it in, stop listening
      bgmUnmuted=true;
      unlockEvents.forEach(type=>window.removeEventListener(type,unlockBgm));
    }).catch(()=>{
      // no activation yet (e.g. a bare mousemove) -> roll back to muted, KEEP listening
      // so the next real gesture (click/scroll/key/touch) can unlock it. Never gets stuck.
      museumBgm.muted=true;
      museumBgm.play().catch(()=>{});
    });
  }
}
const unlockEvents=['mousemove','pointerdown','click','keydown','scroll','wheel','touchstart'];
unlockEvents.forEach(type=>window.addEventListener(type,unlockBgm,{passive:true}));
// Corner button: manual pause / resume of the music.
const bgmToggle=document.getElementById('bgmToggle');
if(bgmToggle){
  bgmToggle.addEventListener('click',()=>{
    bgmWanted=!bgmWanted;
    bgmToggle.dataset.state=bgmWanted?'on':'off';
    bgmToggle.setAttribute('aria-label',bgmWanted?'暂停背景音乐':'播放背景音乐');
    if(bgmWanted){museumBgm.muted=false;bgmUnmuted=true;startBgm();}
    else museumBgm.pause();
  });
}

// The archive is data-first so later tracks can be added without changing the player markup.
const MUSIC_TRACKS=[
  {title:'Nocturne No. 2 in E Flat Major, Op. 9, No. 2',src:'assets/audio/museum-bgm.mp3'},
  {title:'Waltz No.19 in A minor, Op.posth.',src:'assets/audio/waltz-no19.mp3'}
];
let musicTrackIndex=0;
const trackTitle=document.getElementById('trackTitle');
const trackMeta=document.getElementById('trackMeta');
const musicPrev=document.getElementById('musicPrev');
const musicNext=document.getElementById('musicNext');
function selectMusicTrack(index){
  musicTrackIndex=(index+MUSIC_TRACKS.length)%MUSIC_TRACKS.length;
  const track=MUSIC_TRACKS[musicTrackIndex];
  if(museumBgm.src!==new URL(track.src,document.baseURI).href){museumBgm.src=track.src;museumBgm.load();}
  if(trackTitle)trackTitle.textContent=track.title;
  if(trackMeta)trackMeta.textContent=`馆内背景音乐 · ${String(musicTrackIndex+1).padStart(2,'0')} / ${String(MUSIC_TRACKS.length).padStart(2,'0')}`;
  if(bgmWanted){museumBgm.muted=false;bgmUnmuted=true;museumBgm.play().catch(()=>{});}
}
musicPrev?.addEventListener('click',()=>selectMusicTrack(musicTrackIndex-1));
musicNext?.addEventListener('click',()=>selectMusicTrack(musicTrackIndex+1));
selectMusicTrack(0);
function playFrogSound(){
  museumBgm.pause();
  if(activeFrogSounds.size>=8){
    const oldest=activeFrogSounds.values().next().value;
    oldest.pause();
    activeFrogSounds.delete(oldest);
  }
  const sound=frogSound.cloneNode();
  sound.volume=.42;
  activeFrogSounds.add(sound);
  const cleanup=()=>{
    activeFrogSounds.delete(sound);
    if(!activeFrogSounds.size)startBgm();
  };
  sound.addEventListener('ended',cleanup,{once:true});
  sound.addEventListener('error',cleanup,{once:true});
  sound.play().catch(cleanup);
}
function spawnTrailFrog(clientX,clientY,withSound=true){
  const box=footer.getBoundingClientRect();
  const frog=document.createElement('img');
  frog.className='trail-frog';
  frog.src=frogAssets[Math.floor(Math.random()*frogAssets.length)];
  frog.alt='';
  frog.style.left=`${clientX-box.left}px`;
  frog.style.top=`${clientY-box.top}px`;
  frog.style.setProperty('--rot',`${-14+Math.random()*28}deg`);
  frogTrail.appendChild(frog);
  if(withSound)playFrogSound();
  frog.addEventListener('animationend',()=>frog.remove(),{once:true});
  while(frogTrail.children.length>10)frogTrail.firstElementChild.remove();
}
let lastTrailAt=0;
footer.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||event.target.closest('.footer-content,.easter-note'))return;
  const now=performance.now();
  if(now-lastTrailAt<180)return;
  lastTrailAt=now;
  spawnTrailFrog(event.clientX,event.clientY);
});

// Mobile footer scene: loop laughter as soon as the brown footer enters the viewport.
const coarsePointer=matchMedia('(pointer:coarse)');
let mobileLaughLoop=null;
let mobileFrogTimer=0;
function randomFooterPoint(){
  const box=footer.getBoundingClientRect();
  const x=box.left+box.width*(.12+Math.random()*.76);
  const y=box.top+box.height*(.12+Math.random()*.76);
  spawnTrailFrog(x,y,false);
}
function startMobileFooter(){
  if(!coarsePointer.matches||mobileLaughLoop)return;
  museumBgm.pause();
  mobileLaughLoop=frogSound.cloneNode();
  mobileLaughLoop.loop=true;
  mobileLaughLoop.volume=.5;
  activeFrogSounds.add(mobileLaughLoop);
  mobileLaughLoop.play().catch(()=>{});
  randomFooterPoint();
  mobileFrogTimer=setInterval(randomFooterPoint,1250);
}
function stopMobileFooter(){
  clearInterval(mobileFrogTimer);
  mobileFrogTimer=0;
  if(mobileLaughLoop){
    mobileLaughLoop.pause();
    mobileLaughLoop.currentTime=0;
    activeFrogSounds.delete(mobileLaughLoop);
    mobileLaughLoop=null;
  }
  startBgm();
}
new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.isIntersecting?startMobileFooter():stopMobileFooter());
},{threshold:.01}).observe(footer);
footer.addEventListener('click',event=>{
  if(!coarsePointer.matches||event.target.closest('a,button'))return;
  spawnTrailFrog(event.clientX,event.clientY,true);
});

// lightbox
const lb=document.getElementById('lightbox');
function workIntro(w){
  return currentLang==='en'
    ?`${w.orig.replace(/^仿\s*/, '')} is introduced here through its subject, historical setting and visible details. The note identifies what the viewer encounters before turning to interpretation.`
    :w.intro;
}
function workEditorial(w){
  return currentLang==='en'
    ?`The composition of ${w.orig.replace(/^仿\s*/, '')} is considered through structure, color, space and the conditions of looking. This note focuses on the work itself rather than the artist’s biography.`
    :w.curatorial;
}
function workTrivia(w){
  return currentLang==='en'
    ?`A small story associated with ${w.orig.replace(/^仿\s*/, '')}: the work has gathered a number of memorable details, interpretations and studio legends over time.`
    :w.trivia;
}

function openLightbox(w){
  const favorite=document.getElementById('lbFavorite');
  if(favorite){favorite.dataset.workName=w.zh;favorite.dataset.workUrl=w.url;}
  const lbImgEl=document.getElementById('lbImg');
  const lbImgBox=document.querySelector('.lb-img');
  function sizeLightboxImage(){
    if(!lbImgEl.naturalWidth||!lbImgEl.naturalHeight||!lbImgBox)return;
    const mobile=window.innerWidth<=720;
    const maxW=Math.min(window.innerWidth*(mobile?.88:.64),760);
    const maxH=Math.min(window.innerHeight*(mobile?.52:.82),760);
    const ratio=lbImgEl.naturalWidth/lbImgEl.naturalHeight;
    let width=maxW,height=width/ratio;
    if(height>maxH){height=maxH;width=height*ratio;}
    lbImgBox.style.width=Math.round(width)+'px';
    lbImgBox.style.height=Math.round(height)+'px';
  }
  lbImgEl.onload=sizeLightboxImage;
  lbImgEl.src=w.url;
  if(lbImgEl.complete)sizeLightboxImage();
  document.getElementById('lbEra').textContent=(currentLang==='en'?ERA_LABEL_EN:ERA_LABEL)[w.era]||w.era;
  const accEl=document.getElementById('lbAcc');
  if(accEl)accEl.textContent=w.acc||'';
  document.getElementById('lbZh').textContent=currentLang==='en'?w.en:w.zh;
  document.getElementById('lbEn').textContent=currentLang==='en'?w.zh:w.en;
  document.getElementById('lbOrig').textContent=currentLang==='en'?'After the original work':w.orig;
  const artistEl=document.getElementById('lbArtist');
  const artistRow=document.getElementById('artistRow');
  artistEl.textContent=w.artist;
  // 如果有生平,让艺术家名可点击
  if(ARTIST_BIO[w.artist]){
    artistEl.style.cursor='pointer';
    artistEl.style.textDecoration='underline';
    artistEl.style.textDecorationColor='var(--gold-soft)';
    const openBio=()=>openArtistBio(w.artist);
    artistEl.onclick=openBio;
    if(artistRow){
      artistRow.setAttribute('role','button');artistRow.tabIndex=0;
      artistRow.setAttribute('aria-label',`查看艺术家资料：${w.artist}`);
      artistRow.onclick=openBio;
      artistRow.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openBio();}};
    }
  }else{
    artistEl.style.cursor='default';
    artistEl.style.textDecoration='none';
    artistEl.onclick=null;
    if(artistRow){artistRow.removeAttribute('role');artistRow.removeAttribute('tabindex');artistRow.removeAttribute('aria-label');artistRow.onclick=null;artistRow.onkeydown=null;}
  }
  document.getElementById('lbYear').textContent=w.year;
  const storyEl=document.getElementById('lbStory');
  if(storyEl){
    const introEl=document.getElementById('lbIntro');
    const intro=workIntro(w);
    if(introEl){introEl.innerHTML=intro;introEl.style.display=intro?'block':'none';}
    const editorial=workEditorial(w);
    storyEl.innerHTML=editorial;
    storyEl.classList.add('work-editorial');
    storyEl.style.display=editorial?'block':'none';
  }
  // Desktop keeps double-click; touch devices use a discoverable single tap.
  const flipper=document.getElementById('lbFlip');
  const backStory=document.getElementById('lbBackStory');
  if(flipper&&backStory){
    const backKicker=document.getElementById('lbBackKicker');
    if(backKicker)backKicker.textContent=currentLang==='en'?"ARTWORK ANECDOTE":"作品轶事";
    flipper.classList.remove('flipped');
    backStory.innerHTML=workTrivia(w);
    const originalImageWrap=document.getElementById('lbOriginalImageWrap');
    const originalImage=document.getElementById('lbOriginalImage');
    if(originalImageWrap&&originalImage){
      originalImageWrap.classList.toggle('visible',!!w.originalImage);
      originalImage.src=w.originalImage||'';
      originalImage.alt=w.originalImage?`${w.orig}参考图`:'';
      originalImage.onerror=()=>originalImageWrap.classList.remove('visible');
    }
    const toggleFlip=()=>flipper.classList.toggle('flipped');
    const touchFlip=matchMedia('(pointer:coarse)').matches||window.innerWidth<=720;
    flipper.onclick=touchFlip?toggleFlip:null;
    flipper.ondblclick=touchFlip?null:toggleFlip;
    flipper.tabIndex=0;
    flipper.setAttribute('role','button');
    flipper.setAttribute('aria-label',currentLang==='en'?'Show artwork story':'查看作品故事');
    flipper.onkeydown=e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleFlip();}
    };
    const frontHint=flipper.querySelector('.lb-img-front .flip-hint');
    const backPanel=flipper.querySelector('.lb-img-back');
    const backHint=flipper.querySelector('.lb-img-back .flip-hint');
    flipper.classList.remove('hint-hidden');
    if(frontHint)frontHint.textContent=currentLang==='en'?(touchFlip?'Tap for story':'Double-click for story'):(touchFlip?'轻触查看作品故事':'双击查看作品故事');
    if(backHint)backHint.textContent=currentLang==='en'?(touchFlip?'Tap to return':'Double-click to return'):(touchFlip?'轻触返回':'双击返回');
    if(backPanel){
      backPanel.onscroll=()=>{if(backPanel.scrollTop>8)flipper.classList.add('hint-hidden');};
    }
  }
  lb.classList.add('open');syncPageLock();
}
function closeLightbox(){lb.classList.remove('open');syncPageLock();}
document.getElementById('lbClose').onclick=closeLightbox;
lb.onclick=e=>{if(e.target===lb)closeLightbox()};
addEventListener('keydown',e=>{if(e.key==="Escape")closeLightbox()});

// ---- 艺术家生平模态框 ----
const artistModal=document.getElementById('artistModal');
function openArtistBio(artistName){
  const bio=ARTIST_BIO[artistName];
  if(!bio)return;
  document.getElementById('artistName').textContent=currentLang==='en'?artistName:bio.name;
  document.getElementById('artistLife').textContent=bio.life;
  document.getElementById('artistStory').innerHTML=currentLang==='en'
    ?`${artistName} was an influential artist whose life and practice helped shape the visual language of the period. This biographical profile highlights the experiences, working habits and historical circumstances behind the works represented in the museum.`
    :bio.story;
  const portraitWrap=document.getElementById('artistPortraitWrap');
  const portrait=document.getElementById('artistPortrait');
  if(portraitWrap&&portrait){
    portraitWrap.classList.toggle('visible',!!bio.portrait);
    portrait.src=bio.portrait||'';
    portrait.alt=bio.portrait?bio.name:'';
    const content=artistModal.querySelector('.artist-modal-content');
    if(content)content.classList.toggle('has-portrait',!!bio.portrait);
  }
  artistModal.classList.add('open');syncPageLock();
}
function closeArtistBio(){artistModal.classList.remove('open');syncPageLock();}
document.getElementById('artistClose').onclick=closeArtistBio;
artistModal.onclick=e=>{if(e.target===artistModal)closeArtistBio()};
addEventListener('keydown',e=>{if(e.key==="Escape"&&artistModal.classList.contains('open'))closeArtistBio()});
// ===== 中英文切换 =====
(function(){
  const btn=document.getElementById('langToggle');
  if(!btn)return;
  function setLang(lang){
    currentLang=lang;
    const en=lang==='en',t=UI_TEXT[lang];
    const word=document.querySelector('.header-word');if(word)word.textContent=t.menu;
    const visit=document.querySelector('.visit-btn');if(visit)visit.textContent=t.visit;
    const gateKicker=document.getElementById('chinaGateKicker');if(gateKicker)gateKicker.textContent=en?'CHINA MUSEUM · TIMELINE':'中国馆 · 时间长廊';
    const gateTitle=document.getElementById('chinaGateTitle');if(gateTitle)gateTitle.textContent=en?'Chinese Art History':'中国艺术史';
    const gateCopy=document.getElementById('chinaGateCopy');if(gateCopy)gateCopy.textContent=en?'Thirty-five approved works now trace Chinese art from Neolithic pottery and ritual bronze through painting, sculpture and modern ink.':'35件正式馆藏现已接入中国艺术史时间长廊，从新石器彩陶、商代礼器一路展开至古代绘画、雕塑与近现代水墨。';
    const gateEnter=document.getElementById('chinaGateEnter');if(gateEnter)gateEnter.textContent=en?'Enter China Museum':'进入中国馆';
    const chinaDrawerLabel=document.getElementById('chinaDrawerLabel');if(chinaDrawerLabel)chinaDrawerLabel.textContent=en?'Visit China Museum':'参观中国馆';
    const chinaDrawerHint=document.getElementById('chinaDrawerHint');if(chinaDrawerHint)chinaDrawerHint.textContent=en?'Enter the Prehistoric and Pre-Qin hall':'进入史前与先秦第一厅';
    const chinaMobileVisit=document.getElementById('chinaMobileVisit');if(chinaMobileVisit)chinaMobileVisit.textContent=en?'Visit China Museum':'参观中国馆';
    const nav=[...document.querySelectorAll('header nav a')];
    const navTexts=[t.threeD,t.town,t.maker];
    nav.forEach((a,i)=>{if(navTexts[i])a.textContent=navTexts[i];});
    const brandSub=document.querySelector('.brand-lockup span');if(brandSub)brandSub.textContent=en?'MUSEUM':'奶　　蛙';
    const heroTitle=document.querySelector('.hero-caption h1');if(heroTitle)heroTitle.innerHTML=en?'A Quiet Gaze<br>Across Art History':'跨越艺术史的<br>静默凝视';
    const explore=document.querySelector('.hero-caption a');if(explore)explore.textContent=t.explore;
    const intro=document.querySelector('.intro p');
    if(intro)intro.innerHTML=en
      ?'<span class="intro-line">Across thirty thousand years of looking,</span><span class="intro-line">the <em>Milk Frog</em> inhabits humanity’s greatest canvases.</span><span class="intro-line">From cave fire to Impressionist afternoons,</span><span class="intro-line">a rounded, quiet presence <em>remains.</em></span>'
      :'<span class="intro-line">穿越三万年的凝视，</span><span class="intro-line"><em>奶蛙</em>栖身于人类最伟大的画布之中。</span><span class="intro-line">从洞窟的火光到印象派的午后，</span><span class="intro-line">一个圆润而沉静的身影，<em>始终在场</em>。</span>';
    const sig=document.querySelector('.intro .sig');if(sig)sig.textContent=en?'— The Milk Frog Curator':'— 奶蛙馆长';
    const ch=document.querySelector('#collection .collection-head h2');if(ch)ch.textContent=t.collectionTitle;
    const sub=document.querySelector('#collection .collection-head .sub');if(sub)sub.textContent=t.permanent;
    const chinaTitle=document.querySelector('#chinaPage .collection-head h2');if(chinaTitle)chinaTitle.textContent=en?'China Museum':'中国馆';
    const chinaSub=document.querySelector('#chinaPage .collection-head .sub');if(chinaSub)chinaSub.textContent=en?'The Chinese Milk Frog Collection':'中国奶蛙典藏系列';
    const chinaBackLabel=document.querySelector('#chinaBack span');if(chinaBackLabel)chinaBackLabel.textContent=en?'Back to Western Museum':'返回西方馆';
    document.querySelectorAll('#filters button,#chinaFilters button').forEach(b=>{b.textContent=en?(ERA_LABEL_EN[b.dataset.era]||b.textContent):(ERA_LABEL[b.dataset.era]||b.textContent);});
    document.querySelectorAll('.card').forEach(card=>{
      const w=[...WORKS,...CHINA_WORKS].find(item=>item.zh===card.dataset.workName);if(!w)return;
      const era=card.querySelector('.card-era span:first-child');if(era)era.textContent=en?(ERA_LABEL_EN[w.era]||w.era):(ERA_LABEL[w.era]||w.era);
      const h=card.querySelector('h3');if(h)h.textContent=en?w.en:w.zh;
      const sec=card.querySelector('.en');if(sec)sec.textContent=en?w.zh:w.en;
      const orig=card.querySelector('.orig span:first-child');if(orig)orig.textContent=en?`After the original · ${w.artist}`:`${w.orig} · ${w.artist}`;
    });
    document.querySelectorAll('.lb-text .row span:first-child').forEach((el,i)=>{el.textContent=[t.original,t.artist,t.period][i]||el.textContent;});
    const storyLabels=document.querySelectorAll('.lb-story-label');
    if(storyLabels[0])storyLabels[0].textContent=en?'Work Introduction':'作品介绍';
    if(storyLabels[1])storyLabels[1].textContent=en?'Curatorial Note':'作品鉴赏';
    const footerBrand=document.querySelector('.fbrand');if(footerBrand)footerBrand.innerHTML=en?'MILK FROG <em>MUSEUM</em>':'奶蛙<em>博物馆</em>';
    const fheads=document.querySelectorAll('.fcol h4');['Visit','Museum','Contact'].forEach((x,i)=>{if(fheads[i])fheads[i].textContent=en?x:['参观','展馆','联系'][i];});
    const easter=document.querySelector('.easter-note span');if(easter)easter.textContent=en?'Please help protect the Milk Frog’s official image and keep the museum welcoming, playful and respectful. Thank you for sharing responsibly.':'请勿再发布丑化、恶搞奶蛙的非官方表情包，奶蛙的形象需要大家共同守护，建议分享正版素材。请大家遵守一起维护积极愉快的氛围，感谢配合。';
    btn.setAttribute('aria-label',t.lang);btn.setAttribute('title',t.lang);
    document.documentElement.lang=lang;document.body.classList.toggle('lang-en',en);
    document.title=en?'Milk Frog Museum · Musée du Milk Frog':'奶蛙博物馆 · Musée du Milk Frog';
    try{localStorage.setItem('milkfrog-lang',lang);}catch(e){}
  }
  let saved='zh';try{saved=localStorage.getItem('milkfrog-lang')||'zh';}catch(e){}
  btn.addEventListener('click',()=>setLang(currentLang==='zh'?'en':'zh'));
  setLang(saved);
})();

// The China museum is a separate collection surface, not a modal inside the western hall.
(function(){
  const page=document.getElementById('chinaPage');
  const openButton=document.getElementById('chinaVisit');
  const mobileButton=document.getElementById('chinaMobileVisit');
  const backButton=document.getElementById('chinaBack');
  if(!page||!openButton||!backButton)return;
  const open=()=>{
    page.hidden=false;document.body.classList.add('china-view');
    activeGallery=chinaGal;activeWorks=CHINA_WORKS;activePagination=chinaPagination;activeEra=sortMode==='entry'?'all':'recent';activePage=1;
    chinaFbar.querySelectorAll('button').forEach((button,i)=>button.classList.toggle('active',i===0));
    renderCollection();window.scrollTo({top:0,behavior:'smooth'});
  };
  const close=()=>{
    page.hidden=true;document.body.classList.remove('china-view');
    activeGallery=gal;activeWorks=MAIN_WORKS;activePagination=pagination;activeEra=sortMode==='entry'?'all':'recent';activePage=1;
    fbar.querySelectorAll('button').forEach((button,i)=>button.classList.toggle('active',i===0));
    renderCollection();window.scrollTo({top:0,behavior:'smooth'});
  };
  openButton.addEventListener('click',open);
  if(mobileButton)mobileButton.addEventListener('click',open);
  backButton.addEventListener('click',close);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('china-view'))close();});
})();

// Mobile visitors first enter through the film, then receive the full browsing surface.
(function(){
  const entry=document.getElementById('mobileEntry');
  const enterButton=document.getElementById('mobileEnter');
  const entryVideo=document.getElementById('mobileEntryVideo');
  const mobile=matchMedia('(max-width:720px)');
  if(!entry||!enterButton||!mobile.matches){if(entry)entry.setAttribute('aria-hidden','true');return;}
  document.body.classList.add('mobile-entry-active');
  const heroVideo=document.getElementById('heroVideo');
  if(heroVideo&&heroVideo.dataset.mobileSrc){
    heroVideo.src=heroVideo.dataset.mobileSrc;
    heroVideo.poster=heroVideo.dataset.mobilePoster||heroVideo.poster;
    heroVideo.load();
  }
  const resumeHero=()=>{
    if(heroVideo){
      heroVideo.muted=true;heroVideo.autoplay=true;heroVideo.playsInline=true;
      const playback=heroVideo.play();
      if(playback&&playback.catch)playback.catch(()=>{});
    }
  };
  entryVideo.play().catch(()=>{});
  const enter=(event)=>{
    if(entry.classList.contains('entering')){resumeHero();return;}
    resumeHero();
    let passthrough=null;
    if(event&&event.target!==enterButton&&typeof event.clientX==='number'){
      entry.style.display='none';
      passthrough=document.elementFromPoint(event.clientX,event.clientY)?.closest('button,a');
      entry.style.display='';
    }
    entry.classList.add('entering');
    entry.setAttribute('aria-hidden','true');
    setTimeout(()=>{
      entry.hidden=true;
      document.body.classList.remove('mobile-entry-active');
      if(entryVideo)entryVideo.pause();
      resumeHero();
      if(passthrough&&document.contains(passthrough))passthrough.click();
    },760);
  };
  entry.addEventListener('pointerup',enter,{passive:true});
  entry.addEventListener('click',enter);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!entry.hidden)entryVideo.play().catch(()=>{});});
  enterButton.addEventListener('click',()=>enter());
})();

// Header drawers reuse the existing controls so every entry point stays in sync.
(function(){
  const menu=document.getElementById('menuDrawer');
  const menuToggle=document.getElementById('menuToggle');
  const menuClose=document.getElementById('menuClose');
  const drawerScrim=document.getElementById('drawerScrim');
  const log=document.getElementById('updateLog');
  const logToggle=document.getElementById('logToggle');
  const logClose=document.getElementById('logClose');
  const logScrim=document.getElementById('logScrim');
  const feedback=document.getElementById('feedbackPanel');
  const feedbackToggle=document.getElementById('feedbackToggle');
  const feedbackTopToggle=document.getElementById('feedbackTopToggle');
  const feedbackClose=document.getElementById('feedbackClose');
  const feedbackScrim=document.getElementById('feedbackScrim');
  const archive=document.getElementById('archivePanel');
  const archiveScrim=document.getElementById('archiveScrim');
  const archiveClose=document.getElementById('archiveClose');
  if(!menu||!log||!feedback||!archive)return;
  function setDrawer(el,scrim,open){
    el.classList.toggle('open',open);el.setAttribute('aria-hidden',String(!open));
    scrim.classList.toggle('open',open);scrim.setAttribute('aria-hidden',String(!open));
    syncPageLock();
  }
  function closeAll(){setDrawer(menu,drawerScrim,false);setDrawer(log,logScrim,false);setDrawer(feedback,feedbackScrim,false);setDrawer(archive,archiveScrim,false);}
  menuToggle.addEventListener('click',()=>{setDrawer(log,logScrim,false);setDrawer(menu,drawerScrim,!menu.classList.contains('open'));});
  menuClose.addEventListener('click',()=>setDrawer(menu,drawerScrim,false));
  drawerScrim.addEventListener('click',()=>setDrawer(menu,drawerScrim,false));
  logToggle.addEventListener('click',()=>{setDrawer(menu,drawerScrim,false);setDrawer(log,logScrim,!log.classList.contains('open'));});
  logClose.addEventListener('click',()=>setDrawer(log,logScrim,false));
  logScrim.addEventListener('click',()=>setDrawer(log,logScrim,false));
  const openFeedback=()=>{setDrawer(log,logScrim,false);setDrawer(menu,drawerScrim,false);setDrawer(feedback,feedbackScrim,!feedback.classList.contains('open'));};
  feedbackToggle.addEventListener('click',openFeedback);
  if(feedbackTopToggle)feedbackTopToggle.addEventListener('click',openFeedback);
  feedbackClose.addEventListener('click',()=>setDrawer(feedback,feedbackScrim,false));
  feedbackScrim.addEventListener('click',()=>setDrawer(feedback,feedbackScrim,false));
  archiveClose.addEventListener('click',()=>setDrawer(archive,archiveScrim,false));
  archiveScrim.addEventListener('click',()=>setDrawer(archive,archiveScrim,false));
  const feedbackForm=document.getElementById('feedbackForm');
  const feedbackText=document.getElementById('feedbackText');
  const feedbackFiles=document.getElementById('feedbackFiles');
  const feedbackFilesList=document.getElementById('feedbackFilesList');
  const feedbackStatus=document.getElementById('feedbackStatus');
  const feedbackSubmit=document.getElementById('feedbackSubmit');
  const feedbackFrame=document.getElementById('feedbackSubmitFrame');
  let selectedFiles=[];
  const formatBytes=bytes=>bytes<1024*1024?`${Math.ceil(bytes/1024)} KB`:`${(bytes/1024/1024).toFixed(1)} MB`;
  function renderFeedbackFiles(){
    feedbackFilesList.replaceChildren();
    selectedFiles.forEach((file,index)=>{
      const item=document.createElement('div');item.className='feedback-file';
      if(file.type.startsWith('image/')){const image=document.createElement('img');image.src=URL.createObjectURL(file);image.alt='';item.appendChild(image);}
      const name=document.createElement('span');name.className='feedback-file-name';name.textContent=file.name;
      const size=document.createElement('span');size.className='feedback-file-size';size.textContent=formatBytes(file.size);
      const remove=document.createElement('button');remove.type='button';remove.className='feedback-file-remove';remove.setAttribute('aria-label',`删除${file.name}`);remove.textContent='×';remove.onclick=()=>{selectedFiles.splice(index,1);renderFeedbackFiles();};
      item.append(name,size,remove);feedbackFilesList.appendChild(item);
    });
  }
  feedbackFiles.addEventListener('change',()=>{
    const incoming=[...feedbackFiles.files];
    selectedFiles=[...selectedFiles,...incoming].filter((file,index,self)=>index===self.findIndex(x=>x.name===file.name&&x.size===file.size&&x.lastModified===file.lastModified));
    if(selectedFiles.length>6)selectedFiles=selectedFiles.slice(0,6);
    renderFeedbackFiles();
    feedbackFiles.value='';
  });
  let submitting=false;
  feedbackForm.addEventListener('submit',event=>{
    const value=feedbackText.value.trim();
    const total=selectedFiles.reduce((sum,file)=>sum+file.size,0);
    if(!value){event.preventDefault();feedbackStatus.textContent='请先写下你的意见。';feedbackText.focus();return;}
    if(selectedFiles.some(file=>file.size>10*1024*1024)||total>20*1024*1024){event.preventDefault();feedbackStatus.textContent='单个文件不能超过 10 MB，附件总量不能超过 20 MB。';return;}
    const transfer=new DataTransfer();selectedFiles.forEach(file=>transfer.items.add(file));feedbackFiles.files=transfer.files;
    submitting=true;feedbackSubmit.disabled=true;feedbackStatus.textContent='正在投递意见……';
  });
  feedbackFrame.addEventListener('load',()=>{
    if(!submitting)return;
    submitting=false;feedbackSubmit.disabled=false;feedbackText.value='';selectedFiles=[];renderFeedbackFiles();feedbackStatus.textContent='意见已投递到馆长邮箱，谢谢。';
  });
  menu.querySelectorAll('[data-drawer-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.drawerAction;
    if(action==='theme')document.getElementById('themeToggle').click();
    if(action==='quiz')document.getElementById('giftToggle').click();
    if(action==='profile'){closeAll();window.MFM_IDENTITY?.openProfile();return;}
    if(action==='language')document.getElementById('langToggle').click();
    if(action==='feedback'){closeAll();openFeedback();return;}
    if(action==='china')document.getElementById('chinaVisit').click();
    if(action==='worlds'){closeAll();document.getElementById('worlds')?.scrollIntoView({behavior:'smooth'});return;}
    if(action==='log'){closeAll();setDrawer(log,logScrim,true);return;}
    if(action==='archive'){closeAll();setDrawer(archive,archiveScrim,true);return;}
    closeAll();
  }));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&(menu.classList.contains('open')||log.classList.contains('open')||feedback.classList.contains('open')))closeAll();});
})();
