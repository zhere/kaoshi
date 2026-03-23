export const users = [
  { id: 1, username: 'admin', password: 'admin123', name: '系统管理员', role: 'super_admin', department: '信息部', phone: '13800138000', email: 'admin@power.com', status: 'active' },
  { id: 2, username: 'manager1', password: '123456', name: '张三', role: 'admin', department: '安全部', phone: '13800138001', email: 'zhangsan@power.com', status: 'active' },
  { id: 3, username: 'manager2', password: '123456', name: '李四', role: 'admin', department: '培训部', phone: '13800138002', email: 'lisi@power.com', status: 'active' },
  { id: 4, username: 'emp001', password: '123456', name: '王五', role: 'employee', department: '运维部', phone: '13800138003', email: 'wangwu@power.com', status: 'active', employeeId: 'EMP001' },
  { id: 5, username: 'emp002', password: '123456', name: '赵六', role: 'employee', department: '检修部', phone: '13800138004', email: 'zhaoliu@power.com', status: 'active', employeeId: 'EMP002' },
  { id: 6, username: 'emp003', password: '123456', name: '钱七', role: 'employee', department: '运维部', phone: '13800138005', email: 'qianqi@power.com', status: 'active', employeeId: 'EMP003' },
]

export const categories = [
  { id: 1, name: '安全生产法规', description: '国家安全生产相关法律法规' },
  { id: 2, name: '电气安全', description: '电气作业安全规范' },
  { id: 3, name: '高处作业', description: '高处作业安全规范' },
  { id: 4, name: '消防安全', description: '消防安全知识' },
  { id: 5, name: '应急处置', description: '突发事件应急处置' },
  { id: 6, name: '设备操作', description: '电力设备操作规范' },
]

export const questions = [
  {
    id: 1,
    type: 'single',
    category: 1,
    difficulty: 'easy',
    content: '《安全生产法》规定，生产经营单位的（）是本单位安全生产的第一责任人。',
    options: ['安全总监', '主要负责人', '安全员', '班组长'],
    answer: 'B',
    analysis: '根据《安全生产法》第五条规定，生产经营单位的主要负责人是本单位安全生产的第一责任人，对本单位的安全生产工作全面负责。',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    type: 'single',
    category: 1,
    difficulty: 'medium',
    content: '根据《安全生产法》，生产经营单位发生生产安全事故后，事故现场有关人员应当立即报告（）。',
    options: ['本单位负责人', '当地安全监管部门', '当地人民政府', '公安机关'],
    answer: 'A',
    analysis: '根据《安全生产法》第八十三条规定，生产经营单位发生生产安全事故后，事故现场有关人员应当立即报告本单位负责人。',
    createTime: '2024-01-15 10:05:00'
  },
  {
    id: 3,
    type: 'single',
    category: 2,
    difficulty: 'easy',
    content: '电气设备停电检修时，必须采取的安全技术措施不包括（）。',
    options: ['停电', '验电', '装设接地线', '设置警示标志'],
    answer: 'D',
    analysis: '电气设备停电检修的安全技术措施包括：停电、验电、装设接地线、悬挂标示牌和装设遮栏。设置警示标志属于安全组织措施。',
    createTime: '2024-01-15 10:10:00'
  },
  {
    id: 4,
    type: 'single',
    category: 2,
    difficulty: 'medium',
    content: '在电气设备上工作，保证安全的组织措施不包括（）。',
    options: ['工作票制度', '工作许可制度', '工作监护制度', '停电制度'],
    answer: 'D',
    analysis: '保证安全的组织措施包括：工作票制度、工作许可制度、工作监护制度、工作间断、转移和终结制度。停电制度属于技术措施。',
    createTime: '2024-01-15 10:15:00'
  },
  {
    id: 5,
    type: 'single',
    category: 2,
    difficulty: 'hard',
    content: '在10kV及以下的带电杆塔上进行工作，工作人员距最下层高压带电导线垂直距离不得小于（）米。',
    options: ['0.5', '0.7', '1.0', '1.5'],
    answer: 'B',
    analysis: '根据《电力安全工作规程》，在10kV及以下的带电杆塔上进行工作，工作人员距最下层高压带电导线垂直距离不得小于0.7米。',
    createTime: '2024-01-15 10:20:00'
  },
  {
    id: 6,
    type: 'single',
    category: 3,
    difficulty: 'easy',
    content: '高处作业是指在坠落高度基准面（）米及以上有可能坠落的高处进行的作业。',
    options: ['1.5', '2', '2.5', '3'],
    answer: 'B',
    analysis: '根据《高处作业分级》GB/T3608-2008规定，高处作业是指在坠落高度基准面2米及以上有可能坠落的高处进行的作业。',
    createTime: '2024-01-15 10:25:00'
  },
  {
    id: 7,
    type: 'single',
    category: 3,
    difficulty: 'medium',
    content: '安全带的正确使用方法是（）。',
    options: ['低挂高用', '高挂低用', '平挂平用', '随意使用'],
    answer: 'B',
    analysis: '安全带应高挂低用，防止坠落时产生较大的冲击力，减轻对人体的伤害。低挂高用会增加坠落距离和冲击力。',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 8,
    type: 'single',
    category: 4,
    difficulty: 'easy',
    content: '灭火器上的压力表指针指在（）区域时，表示压力正常。',
    options: ['红色', '黄色', '绿色', '蓝色'],
    answer: 'C',
    analysis: '灭火器压力表有三个区域：红色区域表示压力不足，需要充装；绿色区域表示压力正常；黄色区域表示压力过高，需要注意。',
    createTime: '2024-01-15 10:35:00'
  },
  {
    id: 9,
    type: 'single',
    category: 4,
    difficulty: 'medium',
    content: '电气设备着火时，应首先（）。',
    options: ['使用泡沫灭火器灭火', '使用水灭火', '切断电源', '拨打119'],
    answer: 'C',
    analysis: '电气设备着火时，应首先切断电源，然后使用干粉灭火器或二氧化碳灭火器灭火。严禁使用水或泡沫灭火器，因为水导电会造成触电。',
    createTime: '2024-01-15 10:40:00'
  },
  {
    id: 10,
    type: 'single',
    category: 5,
    difficulty: 'medium',
    content: '发现有人触电时，首先应（）。',
    options: ['立即进行人工呼吸', '立即进行胸外按压', '使触电者尽快脱离电源', '拨打120'],
    answer: 'C',
    analysis: '发现有人触电时，首先应使触电者尽快脱离电源，然后再进行急救。在未脱离电源前，救护人员不得直接接触触电者。',
    createTime: '2024-01-15 10:45:00'
  },
  {
    id: 11,
    type: 'single',
    category: 5,
    difficulty: 'hard',
    content: '心肺复苏抢救时，胸外按压与人工呼吸的比例为（）。',
    options: ['15:1', '15:2', '30:1', '30:2'],
    answer: 'D',
    analysis: '根据最新心肺复苏指南，成人胸外按压与人工呼吸的比例为30:2，即30次胸外按压后进行2次人工呼吸。',
    createTime: '2024-01-15 10:50:00'
  },
  {
    id: 12,
    type: 'single',
    category: 6,
    difficulty: 'easy',
    content: '操作票应由（）填写。',
    options: ['监护人', '操作人', '值班负责人', '工作负责人'],
    answer: 'B',
    analysis: '操作票应由操作人填写，监护人审核，值班负责人批准后方可执行。',
    createTime: '2024-01-15 10:55:00'
  },
  {
    id: 13,
    type: 'single',
    category: 6,
    difficulty: 'medium',
    content: '倒闸操作必须由两人执行，其中一人（），一人（）。',
    options: ['操作，监护', '监护，操作', '指挥，操作', '操作，指挥'],
    answer: 'A',
    analysis: '倒闸操作必须由两人执行，其中一人操作，一人监护。监护人应由技术水平较高、经验丰富的人员担任。',
    createTime: '2024-01-15 11:00:00'
  },
  {
    id: 14,
    type: 'multiple',
    category: 1,
    difficulty: 'medium',
    content: '生产经营单位的安全生产管理机构以及安全生产管理人员履行下列职责（）。',
    options: ['组织或者参与拟订本单位安全生产规章制度、操作规程和生产安全事故应急救援预案', '组织或者参与本单位安全生产教育和培训，如实记录安全生产教育和培训情况', '督促落实本单位重大危险源的安全管理措施', '组织或者参与本单位应急救援演练'],
    answer: 'ABCD',
    analysis: '根据《安全生产法》第二十五条规定，安全生产管理机构和人员应履行以上全部职责。',
    createTime: '2024-01-15 11:05:00'
  },
  {
    id: 15,
    type: 'multiple',
    category: 2,
    difficulty: 'hard',
    content: '在电气设备上工作，保证安全的技术措施包括（）。',
    options: ['停电', '验电', '装设接地线', '悬挂标示牌和装设遮栏'],
    answer: 'ABCD',
    analysis: '根据《电力安全工作规程》，保证安全的技术措施包括：停电、验电、装设接地线、悬挂标示牌和装设遮栏。',
    createTime: '2024-01-15 11:10:00'
  },
  {
    id: 16,
    type: 'multiple',
    category: 3,
    difficulty: 'medium',
    content: '高处作业前应检查的内容包括（）。',
    options: ['安全带是否完好', '脚手架是否牢固', '作业人员身体状况', '天气情况'],
    answer: 'ABCD',
    analysis: '高处作业前应检查安全带是否完好、脚手架是否牢固、作业人员身体状况是否良好、天气是否适合作业等。',
    createTime: '2024-01-15 11:15:00'
  },
  {
    id: 17,
    type: 'multiple',
    category: 4,
    difficulty: 'medium',
    content: '下列哪些火灾不能用水扑救（）。',
    options: ['电器火灾', '油类火灾', '金属火灾', '档案资料火灾'],
    answer: 'ABCD',
    analysis: '电器火灾用水会导致触电；油类火灾用水会使火势扩大；金属火灾用水会产生化学反应；档案资料火灾用水会造成资料损毁。',
    createTime: '2024-01-15 11:20:00'
  },
  {
    id: 18,
    type: 'multiple',
    category: 5,
    difficulty: 'hard',
    content: '触电急救的基本原则是（）。',
    options: ['迅速脱离电源', '就地进行抢救', '准确进行救治', '坚持抢救到底'],
    answer: 'ABCD',
    analysis: '触电急救的基本原则是：迅速脱离电源、就地进行抢救、准确进行救治、坚持抢救到底。',
    createTime: '2024-01-15 11:25:00'
  },
  {
    id: 19,
    type: 'multiple',
    category: 6,
    difficulty: 'medium',
    content: '倒闸操作中发生疑问时，应（）。',
    options: ['立即停止操作', '向值班负责人报告', '弄清问题后进行操作', '不准擅自更改操作票'],
    answer: 'ABCD',
    analysis: '倒闸操作中发生疑问时，应立即停止操作，向值班负责人报告，弄清问题后进行操作，不准擅自更改操作票。',
    createTime: '2024-01-15 11:30:00'
  },
  {
    id: 20,
    type: 'judge',
    category: 1,
    difficulty: 'easy',
    content: '生产经营单位可以与从业人员订立协议，免除或者减轻其对从业人员因生产安全事故伤亡依法应承担的责任。',
    options: ['正确', '错误'],
    answer: 'B',
    analysis: '根据《安全生产法》第五十二条规定，生产经营单位不得以任何形式与从业人员订立协议，免除或者减轻其对从业人员因生产安全事故伤亡依法应承担的责任。',
    createTime: '2024-01-15 11:35:00'
  },
  {
    id: 21,
    type: 'judge',
    category: 2,
    difficulty: 'easy',
    content: '验电时，必须用电压等级合适而且合格的验电器，在装设接地线或合接地刀闸处对各相分别验电。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '根据《电力安全工作规程》，验电时必须用电压等级合适而且合格的验电器，在装设接地线或合接地刀闸处对各相分别验电。',
    createTime: '2024-01-15 11:40:00'
  },
  {
    id: 22,
    type: 'judge',
    category: 2,
    difficulty: 'medium',
    content: '在停电的低压配电装置和低压导线上工作，可以不用填写工作票。',
    options: ['正确', '错误'],
    answer: 'B',
    analysis: '在停电的低压配电装置和低压导线上工作，也需要填写工作票，这是保证安全的组织措施之一。',
    createTime: '2024-01-15 11:45:00'
  },
  {
    id: 23,
    type: 'judge',
    category: 3,
    difficulty: 'easy',
    content: '高处作业人员应每年进行一次体检，患有高血压、心脏病、贫血病、癫痫病等不适宜高处作业疾病的人员，不得从事高处作业。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '高处作业人员应定期体检，患有不适宜高处作业疾病的人员不得从事高处作业，这是保障作业人员安全的重要措施。',
    createTime: '2024-01-15 11:50:00'
  },
  {
    id: 24,
    type: 'judge',
    category: 4,
    difficulty: 'easy',
    content: '灭火器应放置在明显、便于取用的地点，且不得影响安全疏散。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '灭火器应放置在明显、便于取用的地点，且不得影响安全疏散，这是灭火器设置的基本要求。',
    createTime: '2024-01-15 11:55:00'
  },
  {
    id: 25,
    type: 'judge',
    category: 5,
    difficulty: 'medium',
    content: '触电者脱离电源后，若神志清醒，应让其就地平躺，严密观察，暂时不要站立或走动。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '触电者脱离电源后，若神志清醒，应让其就地平躺，严密观察，暂时不要站立或走动，防止出现延迟性反应。',
    createTime: '2024-01-15 12:00:00'
  },
  {
    id: 26,
    type: 'judge',
    category: 6,
    difficulty: 'easy',
    content: '操作票应填写设备的双重名称，即设备名称和编号。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '操作票应填写设备的双重名称，即设备名称和编号，以防止误操作。',
    createTime: '2024-01-15 12:05:00'
  },
  {
    id: 27,
    type: 'single',
    category: 1,
    difficulty: 'hard',
    content: '根据《安全生产法》，生产经营单位未采取措施消除事故隐患的，责令立即消除或者限期消除，处（）的罚款。',
    options: ['一万元以上五万元以下', '五万元以上十万元以下', '十万元以上五十万元以下', '五十万元以上一百万元以下'],
    answer: 'C',
    analysis: '根据《安全生产法》第一百零二条规定，生产经营单位未采取措施消除事故隐患的，责令立即消除或者限期消除，处十万元以上五十万元以下的罚款。',
    createTime: '2024-01-16 09:00:00'
  },
  {
    id: 28,
    type: 'single',
    category: 2,
    difficulty: 'hard',
    content: '在35kV带电设备附近工作，工作人员的正常活动范围与带电设备的安全距离应不小于（）米。',
    options: ['0.6', '0.8', '1.0', '1.5'],
    answer: 'C',
    analysis: '根据《电力安全工作规程》，35kV带电设备的安全距离应不小于1.0米。',
    createTime: '2024-01-16 09:05:00'
  },
  {
    id: 29,
    type: 'multiple',
    category: 2,
    difficulty: 'hard',
    content: '工作票签发人的安全责任包括（）。',
    options: ['工作必要性和安全性', '工作票上所填安全措施是否正确完备', '所派工作负责人和工作班人员是否适当和充足', '工作是否安全完成'],
    answer: 'ABC',
    analysis: '工作票签发人的安全责任包括：工作必要性和安全性、工作票上所填安全措施是否正确完备、所派工作负责人和工作班人员是否适当和充足。',
    createTime: '2024-01-16 09:10:00'
  },
  {
    id: 30,
    type: 'judge',
    category: 3,
    difficulty: 'medium',
    content: '高处作业时，安全带应系挂在施工作业处上方的牢固挂点上，严禁系挂在移动或不牢固的物件上。',
    options: ['正确', '错误'],
    answer: 'A',
    analysis: '高处作业时，安全带应系挂在施工作业处上方的牢固挂点上，严禁系挂在移动或不牢固的物件上，这是保证高处作业安全的重要措施。',
    createTime: '2024-01-16 09:15:00'
  }
]

export const examTemplates = [
  {
    id: 1,
    name: '安全生产知识考试模板',
    description: '用于员工安全生产基础知识考核',
    categories: [1, 4, 5],
    difficulty: 'mixed',
    questionCount: 20,
    passScore: 60,
    duration: 30,
    createTime: '2024-01-10 10:00:00',
    creator: 'admin'
  },
  {
    id: 2,
    name: '电气安全操作考试模板',
    description: '用于电气作业人员安全操作考核',
    categories: [2, 6],
    difficulty: 'medium',
    questionCount: 30,
    passScore: 70,
    duration: 45,
    createTime: '2024-01-12 14:00:00',
    creator: 'manager1'
  },
  {
    id: 3,
    name: '高处作业安全考试模板',
    description: '用于高处作业人员安全知识考核',
    categories: [3],
    difficulty: 'medium',
    questionCount: 15,
    passScore: 60,
    duration: 20,
    createTime: '2024-01-15 09:00:00',
    creator: 'manager2'
  }
]

export const exams = [
  {
    id: 1,
    name: '2024年第一季度安全生产考试',
    templateId: 1,
    status: 'ongoing',
    startTime: '2024-03-01 09:00:00',
    endTime: '2024-03-31 18:00:00',
    duration: 30,
    totalScore: 100,
    passScore: 60,
    questionCount: 20,
    questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    createTime: '2024-02-28 10:00:00',
    creator: 'admin',
    qrcode: 'EXAM_001_2024Q1'
  },
  {
    id: 2,
    name: '电气安全操作专项考试',
    templateId: 2,
    status: 'upcoming',
    startTime: '2024-04-01 09:00:00',
    endTime: '2024-04-15 18:00:00',
    duration: 45,
    totalScore: 100,
    passScore: 70,
    questionCount: 30,
    questions: [3, 4, 5, 12, 13, 15, 21, 22, 28, 29],
    createTime: '2024-03-20 14:00:00',
    creator: 'manager1',
    qrcode: 'EXAM_002_ELEC'
  },
  {
    id: 3,
    name: '新员工入职安全培训考试',
    templateId: 1,
    status: 'ended',
    startTime: '2024-02-01 09:00:00',
    endTime: '2024-02-28 18:00:00',
    duration: 30,
    totalScore: 100,
    passScore: 60,
    questionCount: 20,
    questions: [1, 2, 6, 8, 10, 14, 17, 20, 24, 26],
    createTime: '2024-01-30 10:00:00',
    creator: 'admin',
    qrcode: 'EXAM_003_NEW'
  }
]

export const examRecords = [
  {
    id: 1,
    examId: 1,
    userId: 4,
    userName: '王五',
    department: '运维部',
    answers: { 1: 'B', 2: 'A', 3: 'D', 4: 'D', 5: 'B', 6: 'B', 7: 'B', 8: 'C', 9: 'C', 10: 'C', 11: 'D', 12: 'B', 13: 'A', 14: 'ABCD', 15: 'ABCD', 16: 'ABCD', 17: 'ABCD', 18: 'ABCD', 19: 'ABCD', 20: 'B' },
    score: 85,
    isPass: true,
    correctCount: 17,
    wrongCount: 3,
    submitTime: '2024-03-05 14:30:00',
    duration: 25
  },
  {
    id: 2,
    examId: 1,
    userId: 5,
    userName: '赵六',
    department: '检修部',
    answers: { 1: 'B', 2: 'A', 3: 'D', 4: 'D', 5: 'A', 6: 'B', 7: 'B', 8: 'C', 9: 'C', 10: 'A', 11: 'D', 12: 'B', 13: 'A', 14: 'ABCD', 15: 'ABC', 16: 'ABCD', 17: 'ABC', 18: 'ABCD', 19: 'ABCD', 20: 'B' },
    score: 72,
    isPass: true,
    correctCount: 14,
    wrongCount: 6,
    submitTime: '2024-03-06 10:15:00',
    duration: 28
  },
  {
    id: 3,
    examId: 1,
    userId: 6,
    userName: '钱七',
    department: '运维部',
    answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'A', 7: 'A', 8: 'C', 9: 'A', 10: 'D', 11: 'C', 12: 'A', 13: 'B', 14: 'AB', 15: 'AB', 16: 'AB', 17: 'AB', 18: 'AB', 19: 'AB', 20: 'A' },
    score: 45,
    isPass: false,
    correctCount: 9,
    wrongCount: 11,
    submitTime: '2024-03-07 16:45:00',
    duration: 30
  },
  {
    id: 4,
    examId: 3,
    userId: 4,
    userName: '王五',
    department: '运维部',
    answers: { 1: 'B', 2: 'A', 6: 'B', 8: 'C', 10: 'C', 14: 'ABCD', 17: 'ABCD', 20: 'B', 24: 'A', 26: 'A' },
    score: 90,
    isPass: true,
    correctCount: 9,
    wrongCount: 1,
    submitTime: '2024-02-15 11:20:00',
    duration: 18
  },
  {
    id: 5,
    examId: 3,
    userId: 5,
    userName: '赵六',
    department: '检修部',
    answers: { 1: 'B', 2: 'A', 6: 'B', 8: 'C', 10: 'A', 14: 'ABCD', 17: 'ABC', 20: 'B', 24: 'A', 26: 'A' },
    score: 80,
    isPass: true,
    correctCount: 8,
    wrongCount: 2,
    submitTime: '2024-02-20 09:30:00',
    duration: 22
  }
]

export const statistics = {
  totalExams: 3,
  totalQuestions: 30,
  totalUsers: 6,
  totalRecords: 5,
  averageScore: 74.4,
  passRate: 80,
  departmentStats: [
    { name: '运维部', count: 15, averageScore: 78, passRate: 85 },
    { name: '检修部', count: 10, averageScore: 72, passRate: 75 },
    { name: '安全部', count: 8, averageScore: 82, passRate: 90 },
    { name: '培训部', count: 5, averageScore: 75, passRate: 80 }
  ],
  wrongQuestionStats: [
    { questionId: 5, content: '在10kV及以下的带电杆塔上进行工作...', wrongCount: 8, wrongRate: 40 },
    { questionId: 11, content: '心肺复苏抢救时，胸外按压与人工呼吸的比例为...', wrongCount: 6, wrongRate: 30 },
    { questionId: 15, content: '在电气设备上工作，保证安全的技术措施包括...', wrongCount: 5, wrongRate: 25 }
  ],
  monthlyStats: [
    { month: '2024-01', examCount: 1, userCount: 2, averageScore: 85 },
    { month: '2024-02', examCount: 1, userCount: 2, averageScore: 85 },
    { month: '2024-03', examCount: 1, userCount: 3, averageScore: 67 }
  ]
}

export const materials = [
  {
    id: 1,
    title: '安全生产法解读',
    description: '详细解读《安全生产法》的核心条款和实际应用',
    type: 'pdf',
    url: '/materials/safety_law.pdf',
    category: 1,
    fileSize: 2048,
    duration: 30,
    createTime: '2024-01-10 10:00:00',
    creator: 'admin'
  },
  {
    id: 2,
    title: '电气安全操作规程',
    description: '电气作业安全操作规范和注意事项',
    type: 'pdf',
    url: '/materials/electrical_safety.pdf',
    category: 2,
    fileSize: 1536,
    duration: 25,
    createTime: '2024-01-12 14:00:00',
    creator: 'manager1'
  },
  {
    id: 3,
    title: '高处作业安全培训视频',
    description: '高处作业安全知识和实操演示',
    type: 'video',
    url: '/materials/height_work.mp4',
    category: 3,
    fileSize: 51200,
    duration: 45,
    createTime: '2024-01-15 09:00:00',
    creator: 'manager2'
  },
  {
    id: 4,
    title: '消防安全知识手册',
    description: '消防安全基础知识和应急处理方法',
    type: 'pdf',
    url: '/materials/fire_safety.pdf',
    category: 4,
    fileSize: 1024,
    duration: 20,
    createTime: '2024-01-18 11:00:00',
    creator: 'admin'
  },
  {
    id: 5,
    title: '触电急救演示视频',
    description: '触电事故应急处置和急救方法演示',
    type: 'video',
    url: '/materials/first_aid.mp4',
    category: 5,
    fileSize: 30720,
    duration: 30,
    createTime: '2024-01-20 15:00:00',
    creator: 'manager1'
  },
  {
    id: 6,
    title: '电力设备操作规范',
    description: '电力设备安全操作流程和注意事项',
    type: 'pdf',
    url: '/materials/equipment_operation.pdf',
    category: 6,
    fileSize: 2560,
    duration: 35,
    createTime: '2024-01-22 10:00:00',
    creator: 'admin'
  }
]

export const templateMaterials = [
  { templateId: 1, materialIds: [1, 4, 5], required: true },
  { templateId: 2, materialIds: [2, 6], required: true },
  { templateId: 3, materialIds: [3], required: false }
]

export const userMaterials = [
  { userId: 4, materialId: 1, status: 'completed', progress: 100, completeTime: '2024-03-01 10:00:00' },
  { userId: 4, materialId: 2, status: 'completed', progress: 100, completeTime: '2024-03-02 14:00:00' },
  { userId: 4, materialId: 4, status: 'learning', progress: 60, completeTime: null },
  { userId: 5, materialId: 1, status: 'completed', progress: 100, completeTime: '2024-03-03 09:00:00' },
  { userId: 5, materialId: 4, status: 'completed', progress: 100, completeTime: '2024-03-04 11:00:00' },
  { userId: 6, materialId: 1, status: 'learning', progress: 30, completeTime: null }
]

export const pointsRecords = [
  { id: 1, userId: 4, type: 'study', action: '完成学习资料', points: 10, description: '完成学习资料《安全生产法解读》', createTime: '2024-03-01 10:00:00' },
  { id: 2, userId: 4, type: 'study', action: '完成学习资料', points: 10, description: '完成学习资料《电气安全操作规程》', createTime: '2024-03-02 14:00:00' },
  { id: 3, userId: 4, type: 'exam', action: '考试及格', points: 30, description: '2024年第一季度安全生产考试及格', createTime: '2024-03-05 14:30:00' },
  { id: 4, userId: 5, type: 'study', action: '完成学习资料', points: 10, description: '完成学习资料《安全生产法解读》', createTime: '2024-03-03 09:00:00' },
  { id: 5, userId: 5, type: 'study', action: '完成学习资料', points: 10, description: '完成学习资料《消防安全知识手册》', createTime: '2024-03-04 11:00:00' },
  { id: 6, userId: 5, type: 'exam', action: '考试及格', points: 30, description: '2024年第一季度安全生产考试及格', createTime: '2024-03-06 10:15:00' },
  { id: 7, userId: 6, type: 'exam', action: '考试参与', points: 10, description: '参与2024年第一季度安全生产考试', createTime: '2024-03-07 16:45:00' },
  { id: 8, userId: 4, type: 'study', action: '完成全部关联资料', points: 20, description: '完成安全生产知识考试全部学习资料', createTime: '2024-03-02 14:30:00' }
]

export const pointsRules = {
  completeMaterial: 10,
  completeAllMaterials: 20,
  examPass: 30,
  examFail: 10,
  examFullScore: 50,
  continuous7Days: 50,
  continuous30Days: 200
}

export const userPoints = [
  { userId: 1, points: 0, totalPoints: 0, learningDays: 0, lastLearnDate: null },
  { userId: 2, points: 0, totalPoints: 0, learningDays: 0, lastLearnDate: null },
  { userId: 3, points: 0, totalPoints: 0, learningDays: 0, lastLearnDate: null },
  { userId: 4, points: 70, totalPoints: 70, learningDays: 5, lastLearnDate: '2024-03-05' },
  { userId: 5, points: 50, totalPoints: 50, learningDays: 3, lastLearnDate: '2024-03-06' },
  { userId: 6, points: 10, totalPoints: 10, learningDays: 1, lastLearnDate: '2024-03-07' }
]
