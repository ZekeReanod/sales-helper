/**
 * REANOD 产品知识中心 - 默认知识库
 *
 * 来源：E:\知识库\REANOD 产品中心（Product Center）\*.pdf
 * 共 16 个产品/套餐，所有报价均来自原始资料
 *
 * 数据结构：
 *   id          - 唯一标识
 *   category    - 分类（建站/广告/社媒/整合/B2C/AI/其他）
 *   name        - 产品名称
 *   shortName   - 简称（列表展示用）
 *   price       - 主价格（人民币）
 *   priceType   - 价格类型（fixed=固定/tiered=阶梯/custom=定制）
 *   priceDetail - 价格详情（多版本说明）
 *   keywords    - 触发关键词（用于智能匹配客户需求）
 *   targetCustomer - 目标客户描述
 *   features    - 核心功能列表
 *   description - 完整产品描述
 *
 * 修改/增删/扩充：在 Web 端的「知识中心」面板里操作，会自动写入 localStorage，
 * 下次刷新页面会读取 localStorage 优先。如果想重置默认数据，在管理界面点"恢复默认"。
 */

const DEFAULT_KNOWLEDGE_BASE = [
  // ============ 建站产品（B2B）============
  {
    id: 'kb_website_php_en',
    category: '建站',
    name: 'PHP定制站-单英文',
    shortName: 'PHP定制站（单英文）',
    price: '16800',
    priceDisplay: '¥16,800',
    priceType: 'fixed',
    priceDetail: '网站次年续费价格2000元/年；增加小语种（阿语、中文等）：2000元/个，其他小语种1000元/个',
    keywords: ['建站', '网站', '定制站', 'PHP', '单英文', '营销型网站', '独立站', '英文站', 'B2B建站', 'wordpress', '定制建站'],
    targetCustomer: 'B2B外贸企业，需要专业营销型英文网站，预算在1-2万，追求性价比',
    features: [
      '网站国际化定制设计（国际风格）',
      '定制Banner广告图 5张',
      '产品上传/图片尺寸处理 50/100',
      '响应式网站 + 美国高速服务器 + .com域名 + SSL证书（20G空间）',
      'HTML5技术 + 炫酷特效 + 移动友好',
      '智慧营销系统（访客交互/谷歌搜索/询盘管理/邮件营销/海关数据/CRM/电子宣传册）',
      'SEO营销功能（90%静态页面 + Title/Keywords/Description + H标签优化 + 自定义URL）',
      '数据分析系统（数据统计 + 关键词排名系统）',
      '1+4服务小组电话会议，200余项上线前内部验收标准',
      '每月数据备份'
    ],
    description: '【瑞诺国际外贸云定制网站-单英文版】主打高级页面定制，打造企业专属营销型网站。适合只需要英文站的B2B外贸企业。网站包含完整的智慧营销系统（询盘管理、邮件营销、海关数据、CRM等）和SEO营销功能。响应式设计适配移动端，使用美国高速服务器提升海外访问速度。资料交付标准：电子版、可复制编辑；首屏资料由公司负责填充；普通产品页面上线数量根据合同签订的产品服务资料数量；所有版本网站基础框架页面不超过15个。',
    bestFor: '预算1-2万，只需要英文站的B2B外贸企业',
    notSuitable: '需要多语种网站（推荐多语种版）、需要品牌定制（推荐大客户定制）'
  },
  {
    id: 'kb_website_php_multi',
    category: '建站',
    name: 'PHP定制站-多语种',
    shortName: 'PHP定制站（多语种）',
    price: '19800',
    priceDisplay: '¥19,800',
    priceType: 'fixed',
    priceDetail: '1个主语种 + 5个小语种；AI智能翻译500W字符；每增加10万字符翻译增加100元',
    keywords: ['建站', '网站', '定制站', 'PHP', '多语种', '小语种', '多语言', '营销型网站', '独立站', 'B2B建站', '104种语言', 'AI翻译'],
    targetCustomer: 'B2B外贸企业，目标市场覆盖多个国家，需要多语言营销型网站',
    features: [
      '所有「PHP定制站-单英文」的功能',
      '多语言管理：104种小语种网站任意选择，1+5（即1主语种+5小语种）',
      'AI智能翻译：网站自带翻译字符数量500W',
      'AI助手系统：AI图片优化 5*10张、AI智能抠图 50张、AI内容创建、邮件内容优化、AI本地化翻译',
      '智能数据获客：LinkedIn、搜索引擎、Google Map、海关数据',
      '网站管理系统：logo/icon自定义、图片webp格式、水印功能、访问控制、后台多语言系统、第三方代码写入、产品批量导入、智能询盘系统、客户管理系统、微信绑定、智能数据备份'
    ],
    description: '【瑞诺国际外贸云定制网站-多语种版】在单英文版基础上增加多语种支持，1+5（即1个主语种+5个小语种）。整合AI助手系统（图片优化、内容创建、邮件优化、AI翻译），让多语言内容生产更高效。智能数据获客集成LinkedIn、搜索引擎、Google Map、海关数据四大渠道。适合做多个海外市场的B2B外贸企业。',
    bestFor: '覆盖3-6个国家市场、需要小语种网站的B2B外贸企业',
    notSuitable: '只需要英文站（选单英文版即可）、需要品牌级定制（推荐大客户定制）'
  },
  {
    id: 'kb_website_saas',
    category: '建站',
    name: 'SaaS云站-模板站',
    shortName: 'SaaS云站',
    price: '9800-13800',
    priceDisplay: '启航版 ¥9,800 / 品牌版 ¥13,800',
    priceType: 'tiered',
    priceDetail: '启航版 9,800元（1+8语种 / 100w字符）；品牌版 13,800元（1+12语种 / 200w字符）；每增加10万字符翻译加100元',
    keywords: ['建站', '网站', '云站', 'SaaS', '模板站', '智能建站', '快速建站', '低成本', '多语言', '多语种', 'B2B建站', '104种语言'],
    targetCustomer: '预算有限的B2B外贸企业，需要快速上线一个多语言营销型网站',
    features: [
      '多语言管理：104种小语种网站任意选择（启航版1+8 / 品牌版1+12）',
      '谷歌系统翻译',
      '定制设计国际风格Banner广告图 3张',
      '海量主题随心选（多套国际风格主题）',
      '响应式网站+美国高速服务器+.com域名+SSL证书',
      '智能营销系统：SEO智能监控、产品SEO评分、智能外链策略、关键词AI分析、关键词库、AI内容扫描、提交搜索引擎、自动化网站地图',
      '智能获客系统：Facebook 50条主页、LinkedIn 50个关键词、Google Map 每100个关键词、海关数据',
      '智能广告系统：Google/Facebook广告费用消耗数据展示、广告提交系统',
      '客户管理与自动化营销：客户管理、自动化营销、EDM邮件 5000封'
    ],
    description: '【瑞诺国际智能云站】SaaS模式快速建站，主打"让网站运营更简单，让搜索引擎更喜欢"。相比PHP定制站价格更低、上线更快。分为两档：启航版（1+8语种，9,800元）和品牌版（1+12语种，13,800元）。包含完整的智能营销、智能获客、智能广告系统。适合预算有限但需要快速建立多语言营销网站的企业。备注：瑞诺云平台主语种可为英语或中文（中文网站因采用美国服务器，不支持国内备案）。',
    bestFor: '预算1万以内、追求快速上线、需要多语种的中小企业',
    notSuitable: '需要深度品牌定制（选大客户定制）、需要长期内容创作运营（选整合营销）'
  },
  {
    id: 'kb_website_enterprise',
    category: '建站',
    name: '大客户定制网站',
    shortName: '品牌定制网站',
    price: '36800',
    priceDisplay: '¥36,800',
    priceType: 'fixed',
    priceDetail: '多语种网站 5个；AI智能翻译800W字符；每增加10万字符翻译增加100元',
    keywords: ['建站', '网站', '大客户', '品牌定制', '定制站', '品牌站', '出海方案', '营销型网站', '独立站', '高端建站', 'B2B建站', '中国出海'],
    targetCustomer: '中大型B2B外贸企业、品牌出海企业，需要深度品牌定制和完整出海方案',
    features: [
      '【项目调研】市场与行业分析1份 + 品牌与产品定位 + 竞争对手分析3家 + 用户画像分析',
      '【项目策划】网站导航架构策划1份 + 网站内页架构策划1份 + 产品分类梳理 + 网页内容模块策划 + 首屏原型设计1份 + 关键词分析与布局1份',
      '【视觉服务】网站视觉设计策划 + 首页设计2稿 + 内页设计 + 交互设计 + 广告图设计5张',
      '【网站基本配置】产品上传/图片尺寸处理 100/200 + 响应式网站 + 美国高速服务器 + .com域名 + SSL证书 50G',
      '【小语种网站】小语种网站推荐 + 多语言管理104种 5个 + AI智能翻译 800W',
      '【完整SEO营销】页面静态化 + Title/Keywords/Description + H标签优化 + 自定义URL + 图片Alt/Title + 404页面',
      '【智能营销系统】访客交互 + 关键词库 + 关键词AI发现 + 站点地图 + Robots协议 + Canonical标签 + 301重定向 + Cookies协议',
      '【智能数据分析】数据报告中心 + 访客数据统计 + 关键词排名系统',
      '【智能数据获客】LinkedIn + 搜索引擎 + Google Map + 海关数据',
      '【AI助手】AI图片优化5*10张 + AI智能抠图50张 + AI内容创建 + 邮件内容优化 + AI本地化翻译',
      '【网站管理系统】logo/icon自定义 + 图片webp + 水印 + 访问控制 + 后台多语言 + 第三方代码 + 产品批量导入 + 智能询盘 + 客户管理 + 微信绑定',
      '【网站安全与售后】后台指导培训 + 技术维护 + 异常状态处理 + 智能数据备份 + 日常运营监测 + 云安全中心'
    ],
    description: '【瑞诺国际品牌定制外贸营销网站】"为中国出海，与品牌同行"——瑞诺国际为您打造专属品牌出海方案。这不是单纯的建站服务，而是从市场调研到品牌策划、从视觉设计到技术开发、从SEO到智能获客、从AI助手到售后运维的完整品牌出海解决方案。适合已经有一定规模、需要深度品牌打造的中大型B2B外贸企业。',
    bestFor: '中大型B2B、品牌出海企业、追求深度品牌定制的客户',
    notSuitable: '预算低于3万（选SaaS云站或PHP定制站）、只需要英文站（选PHP单英文）'
  },

  // ============ 广告产品（B2B）============
  {
    id: 'kb_ads_google',
    category: '广告',
    name: 'Google Ads 广告代投放',
    shortName: 'Google Ads',
    price: '起充1000',
    priceDisplay: '起充 ¥1,000',
    priceType: 'tiered',
    priceDetail: '服务费标准（阶梯）：广告费 ¥10,000 封顶服务费 ¥1,000；超出部分按 30% 收取服务费\n示例：广告费10,000 → 服务费1,000（合计4,000）；广告费20,000 → 服务费1,000+30%×10,000=4,000（合计7,000）',
    keywords: ['Google', '谷歌', 'google ads', '谷歌广告', '搜索广告', 'SEM', '竞价', '海外推广', '外贸推广', 'Google推广', 'Gmail广告', 'YouTube广告'],
    targetCustomer: 'B2B外贸企业，需要在Google搜索/Gmail/YouTube/联盟网站投放广告获取询盘',
    features: [
      '覆盖Google搜索广告、Gmail广告、YouTube广告、Google联盟网站广告',
      '7*24小时广告监控与优化',
      '专业的广告文案策划与关键词分析',
      '广告效果数据报告（曝光/点击/转化）',
      '针对B2B行业的关键词定向和受众定向'
    ],
    description: 'Google Ads 是 B2B 外贸最主流的付费推广渠道。本服务包含：1）账户搭建与关键词规划；2）广告创意制作与A/B测试；3）受众定向（地区/语言/兴趣/再营销）；4）转化追踪（GA4集成）；5）7*24小时监控与优化。适合追求快速见效、需要精准获客的B2B外贸企业。',
    bestFor: '需要快速获客、预算灵活的客户',
    notSuitable: '预算极低（建议先做SEO）、追求长期自然流量（建议搭配SEO）'
  },
  {
    id: 'kb_ads_facebook',
    category: '广告',
    name: 'Facebook Ads 广告代投放',
    shortName: 'Facebook Ads',
    price: '起充1000',
    priceDisplay: '起充 ¥1,000',
    priceType: 'tiered',
    priceDetail: '服务费标准（阶梯）：广告费 ¥10,000 封顶服务费 ¥1,000；超出部分按 30% 收取服务费\nFacebook需扣除 6% 税费和 1% 附加税',
    keywords: ['Facebook', '脸书', 'facebook ads', 'FB广告', '社交广告', '海外推广', '外贸推广', 'B2B推广', 'B2C推广'],
    targetCustomer: 'B2B/B2C企业，需要在Facebook（全球最大社交平台）投放广告',
    features: [
      '覆盖Facebook、Instagram、Messenger、Audience Network',
      'Facebook Pixel集成与转化追踪',
      '受众分析（兴趣/行为/类似受众）',
      '广告创意策划与素材制作',
      'A/B测试与广告效果优化'
    ],
    description: 'Facebook Ads 是全球最大的社交广告平台，月活近30亿。本服务包含：1）BM（Business Manager）搭建与Pixel安装；2）受众分析与定向（兴趣/行为/类似受众/再营销）；3）广告创意策划与素材制作；4）A/B测试；5）转化追踪与效果优化。适合B2C（消费品）和部分B2B（品牌曝光）企业。',
    bestFor: 'B2C消费品、追求品牌曝光、需要受众定向营销',
    notSuitable: '纯工业品B2B（LinkedIn更合适）、预算极低（建议先做内容）'
  },
  {
    id: 'kb_ads_linkedin',
    category: '广告',
    name: 'LinkedIn Ads 广告代投放',
    shortName: 'LinkedIn Ads',
    price: '起充1000',
    priceDisplay: '起充 ¥1,000',
    priceType: 'tiered',
    priceDetail: '服务费标准（阶梯）：广告费 ¥10,000 封顶服务费 ¥1,000；超出部分按 20% 收取服务费',
    keywords: ['LinkedIn', '领英', 'linkedin ads', 'B2B广告', '海外推广', '外贸推广', '工业品推广', '决策人广告', 'InMail'],
    targetCustomer: 'B2B外贸企业（尤其是工业品、大客户），需要精准触达海外决策人',
    features: [
      '按职位/职级/公司规模/行业精准定向决策人',
      'InMail消息广告（直达决策人邮箱）',
      'Sponsored Content（动态广告）',
      'Lead Gen Forms（线索表单）',
      'LinkedIn受众洞察与匹配'
    ],
    description: 'LinkedIn 是 B2B 外贸最精准的广告平台，可以按职位（CEO/采购/技术总监）、公司规模、行业精准定向。本服务适合客单价高、决策周期长的工业品、机械、设备、原料类B2B企业。LinkedIn用户质量高但CPC（单次点击成本）也较高，更适合高客单价产品。',
    bestFor: '工业品、设备、大客户销售、客单价高的B2B',
    notSuitable: 'B2C消费品（Facebook更合适）、预算极低'
  },
  {
    id: 'kb_ads_tiktok',
    category: '广告',
    name: 'TikTok Ads 广告代投放',
    shortName: 'TikTok Ads',
    price: '起充1000',
    priceDisplay: '起充 ¥1,000',
    priceType: 'tiered',
    priceDetail: '服务费标准（阶梯）：广告费 ¥10,000 封顶服务费 ¥1,000；超出部分按 20% 收取服务费',
    keywords: ['TikTok', '抖音国际版', 'tiktok ads', '短视频广告', '海外推广', '外贸推广', 'B2C推广', '年轻受众'],
    targetCustomer: 'B2C企业、品牌出海企业，需要触达年轻海外消费者',
    features: [
      'TikTok For Business账户搭建',
      'Pixel像素追踪与转化设置',
      'Spark Ads原生广告（与达人合作）',
      '信息流广告（In-Feed Ads）',
      'TopView广告（开屏曝光）',
      '受众定向（兴趣/行为/类似受众）'
    ],
    description: 'TikTok Ads 适合面向年轻消费者（18-35岁）的B2C产品和品牌出海。覆盖全球150+国家，月活超10亿。TikTok广告形式多样：信息流原生广告、开屏TopView、品牌挑战赛、达人合作Spark Ads等。本服务包含TikTok For Business账户搭建、Pixel追踪、受众定向、创意优化。',
    bestFor: 'B2C消费品、面向年轻消费者的品牌、追求病毒式传播',
    notSuitable: '传统工业品B2B（LinkedIn更合适）、40岁以上用户为主的产品'
  },
  {
    id: 'kb_ads_yandex',
    category: '广告',
    name: 'Yandex Ads 广告代投放',
    shortName: 'Yandex Ads',
    price: '起充1000',
    priceDisplay: '起充 ¥1,000',
    priceType: 'tiered',
    priceDetail: '服务费标准（阶梯）：广告费 ¥10,000 封顶服务费 ¥1,000；超出部分按 20% 收取服务费\n注：Yandex.Metrica 是俄罗斯主流网站分析工具',
    keywords: ['Yandex', '俄罗斯', '俄语市场', 'yandex ads', '东欧推广', 'CIS市场', '海外推广', '外贸推广'],
    targetCustomer: 'B2B/B2C企业，目标市场为俄罗斯、乌克兰、白俄罗斯、哈萨克斯坦等俄语区国家',
    features: [
      'Yandex搜索广告（俄罗斯市场份额超60%）',
      'Yandex Direct广告平台投放',
      'Yandex.Metrica数据分析与转化追踪',
      'Yandex受众定向（兴趣/行为/再营销）',
      '俄语广告文案本地化'
    ],
    description: 'Yandex 是俄罗斯最大的搜索引擎，市场份额超60%（Google在俄罗斯被限制）。如果客户的目标市场包含俄罗斯、独联体国家、东欧，Yandex Ads 是必投渠道。Yandex.Metrica 是俄罗斯主流网站分析工具，可与Google Analytics配合使用。',
    bestFor: '目标市场为俄罗斯、CIS国家、东欧的B2B/B2C',
    notSuitable: '主要做欧美市场（Google/Facebook更合适）、非俄语国家'
  },

  // ============ 社媒运营推广 ============
  {
    id: 'kb_social_basic',
    category: '社媒',
    name: '社媒运营推广（Facebook为主）',
    shortName: '社媒运营（基础）',
    price: '39800-59800',
    priceDisplay: '标准版 ¥39,800 / 旗舰版 ¥59,800',
    priceType: 'tiered',
    priceDetail: 'Facebook Ads充值：标准版10,000元 / 旗舰版20,000元（免开户费）；首充后每增加10,000元赠送500元；二次充值政策：10,000-20,000元服务费20%，20,001-30,000元服务费18%，30,000以上服务费15%；Facebook需扣除6%税费+1%附加税',
    keywords: ['社媒', '社交媒体', 'Facebook', 'FB运营', '社媒运营', 'Instagram', '领英', 'LinkedIn', '海外推广', '代运营', '内容运营'],
    targetCustomer: 'B2B/B2C企业，需要系统化运营Facebook/Instagram/LinkedIn等海外社交媒体',
    features: [
      '【Facebook营销推广】广告策划 + BMI绑定设置 + Pixel关联 + 受众分析 + 竞品分析 + 创意策划 3-5组 + 内容策划1次/月 + 贴文运营 2-3条/周 + 群组营销 20-30个群组 + 粉丝承诺1500-3000+ + 表单承诺80-160封+',
      '【Instagram营销推广】竞品分析 + 内容策划 + 贴文运营 + 话题标签',
      '【领英营销推广】竞品分析 + 内容策划 + 贴文运营 + 好友添加 500-800+',
      '【智能营销云站】瑞诺国际智能营销SAAS云站，1+8(标准版)/1+12(旗舰版)多语种',
      '【数据分析与报告】广告投放报告 1次/季度'
    ],
    description: '【瑞诺国际社媒营销服务清单】系统性运营Facebook + Instagram + LinkedIn三大社媒平台。包含广告充值（免开户费）、FB代运营、IG运营、LinkedIn运营。分两档：标准版（10,000元广告充值+基础运营，¥39,800）和旗舰版（20,000元广告充值+深度运营，¥59,800）。适合需要快速建立海外品牌存在感、获取社交媒体线索的企业。',
    bestFor: '需要快速建立海外品牌、获取社媒线索的B2B/B2C',
    notSuitable: '追求品牌级深度运营（选大客户社媒）、纯SEM即可（选广告产品）'
  },

  // ============ 整合营销 ============
  {
    id: 'kb_integrated_basic',
    category: '整合',
    name: '整合营销（建站+SEO+GEO+社媒）',
    shortName: '整合营销（启航/智慧/品牌版）',
    price: '39800-79800',
    priceDisplay: '启航版 ¥39,800 / 智慧版 ¥59,800 / 品牌版 ¥79,800',
    priceType: 'tiered',
    priceDetail: '广告充值：启航版无；智慧版Facebook 5,000元；品牌版Google 10,000元 + Facebook 10,000元；SEO首页排名保证：启航版40% / 智慧版50% / 品牌版55%；综合曝光量：50,000+ / 80,000+ / 200,000+',
    keywords: ['整合营销', '建站+SEO', 'SEO', '搜索引擎优化', 'GEO', 'AI优化', '社媒', '整合推广', '海外推广', '外贸营销', '全网营销', 'Google首页', 'B2B营销'],
    targetCustomer: '中大型B2B企业，需要建站+SEO+GEO+社媒全链路整合营销',
    features: [
      '【智能营销云站】SAAS云站，1+15/1+25/1+35语种，30-50款产品资料上传',
      '【智能数字广告】Google + Facebook广告充值（按版本）',
      '【搜索引擎优化】综合曝光量 50,000+ - 200,000+；Google首页排名保证 40%-55%',
      '【站内优化】精细化优化 20-40个页面；Header标签/Title/Alt优化；URL路径优化；访客体验优化；CTA行动号召；Canonical/Schema/Sitemap/Robots/重定向',
      '【站外优化】外链策略搭建 80-120+；高质量外链平台数量 ≥1,500-2,500条',
      '【GEO优化】（智慧版/品牌版）AI平台词条曝光排名承诺 30-60条；FAQ问答知识库 90-150组+；创建LLMS文件；AI平台内容发布（Reddit/Mideum）；AI平台词条监控（Chatgpt/Gemini）；AI调教改进',
      '【小语种优化】图片视频小语种关键词排名；小语种关键词分析扩展布局；本地化调整与优化；外链发布',
      '【社交媒体获客】Facebook/LinkedIn/YouTube/TikTok主页运营；潜在客户销售线索收集 50-120条；LinkedIn长文发布 6篇；贴图海报设计 8张',
      '【数据分析报告】定期流量曝光分析；阶段性工作成果；竞价广告月度工作报告'
    ],
    description: '【瑞诺国际整合营销服务清单】"建站+SEO+GEO+社媒"四位一体的全链路整合营销方案。三档：启航版（¥39,800，基础整合）/ 智慧版（¥59,800，加GEO优化+广告）/ 品牌版（¥79,800，高曝光+深度运营）。GEO优化是2025年新趋势——针对ChatGPT、Gemini等AI平台的词条优化，让客户在AI回答中也能找到你。适合需要全链路获客的中大型B2B企业。',
    bestFor: '需要建站+SEO+社媒+GEO全链路的中大型B2B企业',
    notSuitable: '预算低于3万（选单产品组合）、只需要SEM快速获客（选广告产品）'
  },

  // ============ 大客户套餐 ============
  {
    id: 'kb_social_enterprise',
    category: '社媒',
    name: '大客户社媒运营推广',
    shortName: '大客户社媒（远航/品牌版）',
    price: '126800-176800',
    priceDisplay: '远航版 ¥126,800 / 品牌版 ¥176,800',
    priceType: 'tiered',
    priceDetail: '广告充值：远航版 Facebook 20,000 + LinkedIn 20,000 + TikTok 10,000（合计50,000元）；品牌版增加 YouTube 10,000（合计80,000元）；粉丝承诺：3000+/5000+；Facebook线索：300+/400+',
    keywords: ['大客户', '社媒', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok', '抖音', '海外推广', '品牌出海', '代运营', '深度运营', '整合社媒'],
    targetCustomer: '大型B2B/B2C企业、品牌出海企业，需要多平台深度社媒运营+广告',
    features: [
      '【SNS营销服务平台】Facebook + LinkedIn + YouTube + TikTok + 抖音 全平台',
      '【多平台广告投放】FB + LinkedIn + YouTube + TikTok 同步投放（远航版50,000元起 / 品牌版80,000元起）',
      '【成效保证】品牌曝光 200W/400W；粉丝承诺 3000+/5000+；Facebook线索 300+/400+',
      '【策略层面】行业分析1份 + 受众分析1份 + 竞品分析8-10家 + 社媒广告策略 + 文案策划 季度+月度 + 热门话题 + 品牌加持 + 营销策划 1-2次/年',
      '【过程监控】SNS大数据监控（实时）+ 广告数据报表 1份/周 + 运营数据报告 12份/年 + 舆情跟踪监测',
      '【内容创作与发布】广告着陆页 + 账号搭建 + 海外形象 + 需求定位 + 用户营销 + 内容营销 150-200条/年 + 传播转化 + 场景打造 + 热点营销 + 展会营销 + 领英深度内容 5-10篇/年 + 群组营销 150-260次/年 + 主动营销 2000-2500次 + 国内主流节日海报 5-8张',
      '【领英专栏】长期曝光（专栏内容可被Google等搜索引擎索引，提高搜索结果可见性）'
    ],
    description: '【瑞诺国际社交媒体营销服务清单】"为中国出海，与品牌同行"——面向大型企业的多平台深度社媒运营方案。两档：远航版（¥126,800，含FB/LinkedIn/TikTok广告50,000元）和品牌版（¥176,800，加YouTube广告10,000元）。覆盖5大平台（FB/LinkedIn/YouTube/TikTok/抖音），从策略到执行到监控的全流程服务。适合需要深度品牌出海、多平台布局的大客户。',
    bestFor: '大型B2B/B2C企业、品牌出海、多平台布局',
    notSuitable: '预算有限（选标准社媒运营）、只需要单一平台（选单平台广告）'
  },
  {
    id: 'kb_integrated_enterprise',
    category: '整合',
    name: '大客户整合营销（建站+SEO+GEO+社媒）',
    shortName: '大客户整合营销',
    price: '178000-238000',
    priceDisplay: '远航版 ¥178,000 / 品牌版 ¥238,000',
    priceType: 'tiered',
    priceDetail: '广告充值：Google 30,000元（远航版和品牌版均含）；Facebook 10,000/20,000元；LinkedIn 10,000/20,000元；高级专属服务团队；成效保证：品牌曝光 200W/400W，Google首页排名 50%/55%，GEO引用网站页面量 25+/35+，外链搭建 1500+/1800+，社媒主页粉丝 3000+/4500+，Facebook线索 120+/300+',
    keywords: ['大客户', '整合营销', '建站', 'SEO', 'GEO', '社媒', '中国出海', '品牌同行', '全链路营销', '深度运营', '高级服务团队'],
    targetCustomer: '大型B2B企业、品牌出海企业，需要"自然运营+广告投放+SEO&GEO+社交媒体"全链路深度整合',
    features: [
      '【自然运营】SEO优化（谷歌排名提升）+ GEO优化（生成式AI优化，提高被AI推荐引用机会）+ SNS优化（Facebook/LinkedIn）',
      '【广告投放】Google广告 30,000元（双版本均含）+ Facebook广告 10,000-20,000元 + LinkedIn广告 10,000-20,000元',
      '【营销项目组】高级专属服务团队，向专而行，精益求精',
      '【成效保证】品牌曝光 200W-400W；Google首页排名 50%-55%；Google Image排名 ✓；GEO引用网站页面量 25+/35+；外链搭建 1500+/1800+；社媒主页粉丝 3000+/4500+；Facebook线索 120+/300+',
      '【SEO&GEO深度】行业分析 + 受众分析 + 竞品分析（SEO 5-6家 + GEO 3-5家）+ 网站专业验收 + 技术SEO + 关键词库 + GEO关键词挖掘 + 营销策略制定 + 关键词布局 + SEO为主页面优化 40-45个 + GEO为主页面优化',
      '【内容生产】新闻&blog新增 100-150篇/年；行业垂直文章和GEO内容建设（含PDF）；PDF优化；展会营销；谷歌排名监控；核心AI问答数据监控；外链权威建设 150-180+；站外高质量文章博客客创建 40-60篇；付费外链',
      '【SNS部分】竞品分析 6-10家 + 海外形象 + 用户画像 + 热门话题 + 文案策划 + 内容运营 100-150条/年 + 热点营销 + 展会营销 + 深度内容发布 4-8篇/年 + 领英专栏发布 + 互动与营销 200-300订阅者/年 + 群组营销 100-150次/年 + 主动营销 2000-2500次',
      '【品牌权威背书】品牌宣传PR通稿 1篇 + 传播故事 1-2个主题 + 品牌策划 1-2次/年',
      '【广告深度】Google广告 + 社交媒体广告 + 广告营销策略 + 数据分析（询盘复盘 + 转化路径分析 + 数据报告分析 12份/年）',
      '【服务流程】每月数据报表 + 季度运营报告 + 12份数据报告/年 + 舆情监测'
    ],
    description: '【瑞诺国际整合营销服务清单】"为中国出海，与品牌同行"——这是公司最高规格的全链路整合营销方案。从自然运营（SEO+GEO+SNS）+ 广告投放（Google+FB+LinkedIn）+ 高级专属团队 + 品牌权威背书（PR通稿+传播故事）+ 深度数据复盘。两档：远航版（¥178,000）和品牌版（¥238,000）。品牌版在每个维度都比远航版更深度。适合已经有一定规模、需要深度品牌出海和全链路获客的大型企业。',
    bestFor: '大型B2B企业、品牌出海、需要"自然+广告+深度整合"全方位服务的客户',
    notSuitable: '预算有限（选基础整合营销）、单一渠道即可（选单产品）'
  },

  // ============ B2C产品 ============
  {
    id: 'kb_b2c_2cshop',
    category: 'B2C',
    name: '2Cshop 跨境电商商城站',
    shortName: '2Cshop商城站',
    price: '3800-16800',
    priceDisplay: '基础版 ¥3,800 / 标准版 ¥8,800 / 高级版 ¥16,800（plus版 ¥14,800）',
    priceType: 'tiered',
    priceDetail: '基础版3,800/标准版8,800/高级版16,800；plus版14,800（含FAQ/独立站/PayPal/Google/VR等更多功能）；附加费：FAQ(2,000)、B2B2C多商家(2,000)、Google Shopping(2,000)等',
    keywords: ['B2C', '跨境电商', '电商', '商城站', '2Cshop', '独立站商城', 'DTC', 'shopify', '建站', 'PayPal', 'Facebook电商', 'TikTok电商'],
    targetCustomer: '跨境电商卖家、B2C品牌出海企业，需要建立独立商城站',
    features: [
      '【版本选择】基础版(¥3,800) / 标准版(¥8,800) / 高级版(¥16,800)',
      '【plus版】¥14,800：FAQ功能 + 独立站 + PayPal支付 + Google数据打通 + Pinterest/Instagram营销',
      '【支付集成】PayPal集成',
      '【平台对接】Facebook、Instagram、TikTok、Google广告对接',
      '【SEO友好】内置SEO优化',
      '【模板丰富】20套精美模板，3banner(PC)设计',
      '【多语种】支持多语言切换',
      '【ERP集成】与ERP系统集成',
      '【营销工具】SaleSmartly集成、301跳转、1688采集',
      '【AI能力】AI自动生成商品描述、AI图片生成'
    ],
    description: '【2Cshop 跨境电商建站】专注B2C跨境电商独立商城站建设。三个版本满足不同预算需求。plus版独有FAQ/独立站/PayPal/VR/AI等高级功能。支持PayPal支付、与ERP集成、对接Facebook/Instagram/TikTok/Google等广告平台。',
    bestFor: '跨境电商卖家、B2C品牌、独立站商城',
    notSuitable: '纯B2B（选建站产品）、需要品牌级营销（选整合营销）'
  },
  {
    id: 'kb_b2c_marketing',
    category: 'B2C',
    name: '2Cshop 建站 + 社媒运营推广',
    shortName: '2Cshop营销套餐',
    price: '49800-79800',
    priceDisplay: '基础版 ¥49,800 / 旗舰版 ¥79,800',
    priceType: 'tiered',
    priceDetail: '广告充值：基础版Facebook 10,000元；旗舰版Facebook 20,000元 + Google Ads 20,000元；3-5个广告账户；ROI承诺30/50；服务费阶梯：10,000-20,000元15%，20,001-30,000元12%，30,000以上10%',
    keywords: ['B2C', '跨境电商', '2Cshop', 'Facebook营销', 'Google Ads', 'YouTube', 'Instagram', 'TikTok', '建站+推广', '电商营销'],
    targetCustomer: 'B2C跨境电商企业，需要"建站+多平台广告投放"一站式服务',
    features: [
      '【建站】2Cshop建站服务（高级版）',
      '【Facebook Ads】基础版10,000元 / 旗舰版20,000元',
      '【Google Ads】仅旗舰版含 20,000元',
      '【3-5个广告账户】',
      '【YouTube视频广告】旗舰版含 1个',
      '【Instagram运营】800+ / 1000+ 粉丝',
      '【AM代运营】账户代运营',
      '【ROI承诺】基础版30 / 旗舰版50',
      '【代投折扣】Facebook 6%+1% / Google 6% / TikTok 7%'
    ],
    description: '【2Cshop建站+社媒运营推广套餐】一站式跨境电商营销方案：建站 + Facebook Ads + Google Ads + Instagram + YouTube + TikTok多平台投放。两档：基础版（¥49,800）和旗舰版（¥79,800）。基础版主投Facebook，旗舰版加入Google和YouTube。适合已经准备好产品、需要快速打开海外市场的B2C跨境电商企业。',
    bestFor: 'B2C跨境电商、需要多平台广告投放的企业',
    notSuitable: '纯B2B（选其他产品）、预算低于4万'
  },

  // ============ AI产品 ============
  {
    id: 'kb_ai_xiaonuo',
    category: 'AI',
    name: '小诺AI获客智能体',
    shortName: '小诺AI智能体',
    price: '25800',
    priceDisplay: '¥25,800（AI智体） + ¥9,800（大数据查询，可选）',
    priceType: 'fixed',
    priceDetail: 'AI智体25,800元；大数据查询系统9,800元（可选）',
    keywords: ['AI', '人工智能', 'AI获客', '智能体', 'AI Agent', '自动开发客户', 'AI邮件', 'AI客户开发', '小诺', '智能获客', '询盘'],
    targetCustomer: 'B2B外贸企业，需要AI自动化获客，降低人工开发客户成本',
    features: [
      '【自动找准客户】AI画像建模，智能生成关键词矩阵，自动构建关键词神经信息网络，实现对海量采购商数据的智能化全域检索与聚合；多维打标，客户价值量化、AI评分与报告，高潜买家推荐',
      '【自动找准KP】智能体独有资源，结合网址、社媒信息的综合解析，自动识别采购决策人及核心KP，并结合深度验证机制，确保联系人信息的真实、有效与精准',
      '【自动写信发信】根据常规营销节奏，智能制定四轮营销策略，自动为核心KP撰写并发送高匹配度个性化营销邮件，实现"千人千面"的智能化外联',
      '【自动识别意向】智能体实时监测回邮内容，通过自然语言识别算法对高频敏感词、积极语义与交互信号进行识别与打分，自动将高意向信息与关键客户推送给您',
      '【自动汇报成果】智能体看板，数据仪表盘与日报系统，邮件触达率、意向反馈率、核心客户转化情况、AI分析报告',
      '【大数据查询系统】（可选¥9,800）进出口数据查询与分析，社媒获客、LBS地图获客，负责人挖掘'
    ],
    description: '【小诺AI获客智能体】"搜得准 获客快"——AI驱动的自动化B2B获客系统。5大核心能力：自动找客户、自动找决策人、自动写信、自动识别意向、自动汇报。完全替代人工搜索+邮件群发，大幅提升获客效率。适合需要大量开发海外新客户的B2B外贸企业，尤其是客单价在几千-几万美金的中等客户。',
    bestFor: '需要规模化开发海外客户、希望降低人工成本的B2B外贸企业',
    notSuitable: '客单价超高（建议大客户销售跟进）、品牌已经成熟（建议品牌广告）'
  }
];

// 按分类索引（加速匹配）
const KNOWLEDGE_CATEGORIES = {
  '建站': '建站',
  '网站': '建站',
  '广告': '广告',
  'SEM': '广告',
  '社媒': '社媒',
  '社交': '社媒',
  '整合': '整合',
  '全链路': '整合',
  'B2C': 'B2C',
  '电商': 'B2C',
  'AI': 'AI',
  '智能体': 'AI'
};

// 全局暴露（浏览器端）
if (typeof window !== 'undefined') {
  window.DEFAULT_KNOWLEDGE_BASE = DEFAULT_KNOWLEDGE_BASE;
  window.KNOWLEDGE_CATEGORIES = KNOWLEDGE_CATEGORIES;
}