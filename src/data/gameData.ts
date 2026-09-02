import { GachaItem, Player, RoundData, KeywordPairData } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', number: '01', name: 'MINH', isHost: true, isUser: true, isReady: true, score: 0, currentDelta: 0 },
  { id: 'p2', number: '02', name: 'VY', isHost: false, isUser: false, isReady: true, score: 0, currentDelta: 0 },
  { id: 'p3', number: '03', name: 'AN', isHost: false, isUser: false, isReady: false, score: 0, currentDelta: 0 },
  { id: 'p4', number: '04', name: 'NAM', isHost: false, isUser: false, isReady: true, score: 0, currentDelta: 0 },
  { id: 'p5', number: '05', name: 'LINH', isHost: false, isUser: false, isReady: false, score: 0, currentDelta: 0 },
];

/**
 * 12 Exact Keyword Pairs & Tailored Questions
 */
export const KEYWORD_PAIRS: KeywordPairData[] = [
  {
    pairId: 1,
    majorityWord: 'CHUỐI',
    impostorWord: 'DƯA LEO',
    topic: 'Nông Sản & Thực Phẩm',
    questions: [
      'Bạn thường dùng thứ này vào lúc nào?',
      'Điều đầu tiên bạn nghĩ đến khi thấy thứ này là gì?',
    ],
    sampleAnswersMajority: [
      'Ăn trước khi tập thể thao',
      'Màu vàng thơm ngọt',
      'Bóc vỏ ăn ngay rất tiện',
      'Để bàn thờ ngày rằm',
      'Xay sinh tố rất ngon',
      'Trái cây phổ biến ở chợ',
      'Tráng miệng sau bữa cơm',
    ],
    sampleAnswersImpostor: [
      'Ăn kèm với đồ nướng',
      'Thường thái lát mỏng',
      'Rất mát và giòn',
      'Đắp mặt nạ dưỡng ẩm',
      'Chấm muối ăn sống',
    ],
  },
  {
    pairId: 2,
    majorityWord: 'TRỨNG',
    impostorWord: 'KHOAI TÂY',
    topic: 'Ẩm Thực Thường Ngày',
    questions: [
      'Bạn thích ăn thứ này theo cách nào nhất?',
      'Bạn thường gặp thứ này ở đâu?',
    ],
    sampleAnswersMajority: [
      'Chiên hoặc luộc lòng đào',
      'Có trong mọi tủ lạnh',
      'Ăn cùng mì tôm đêm muộn',
      'Làm bánh ngọt rất cần',
      'Vỏ ngoài dễ vỡ',
      'Bữa sáng nhanh gọn',
      'Kho thịt rất đậm đà',
    ],
    sampleAnswersImpostor: [
      'Chiên giòn chấm tương cà',
      'Nấu súp cùng cà rốt',
      'Nghiền nhuyễn với bơ sữa',
      'Có ở hàng ăn nhanh',
      'Củ tròn tròn trong bếp',
    ],
  },
  {
    pairId: 3,
    majorityWord: 'KEM',
    impostorWord: 'SỮA CHUA',
    topic: 'Đồ Tráng Miệng & Giải Khát',
    questions: [
      'Bạn thích dùng thứ này vào thời điểm nào?',
      'Bạn nghĩ thứ này có cảm giác như thế nào?',
    ],
    sampleAnswersMajority: [
      'Mùa hè nóng bức ăn đã nhất',
      'Ngọt ngào, mát lạnh tê lưỡi',
      'Đi dạo phố Tràng Tiền',
      'Có que hoặc đựng trong ốc quế',
      'Dễ bị chảy nếu không ăn nhanh',
      'Nhiều vị socola, vani, dâu',
      'Món yêu thích của trẻ con',
    ],
    sampleAnswersImpostor: [
      'Ăn sau bữa trưa tốt cho tiêu hóa',
      'Có vị chua nhẹ thanh mát',
      'Thường đóng trong hũ nhỏ',
      'Trộn cùng hoa quả dầm',
      'Mềm mịn và tốt cho sức khỏe',
    ],
  },
  {
    pairId: 4,
    majorityWord: 'TRÀ SỮA',
    impostorWord: 'MATCHA',
    topic: 'Thức Uống Hiện Đại',
    questions: [
      'Bạn thường mua thứ này ở đâu?',
      'Bạn sẽ chọn thứ này khi nào?',
    ],
    sampleAnswersMajority: [
      'Order lúc 3 giờ chiều cùng đồng nghiệp',
      'Thêm topping trân châu đường đen',
      'Giảm 50% đường 70% đá',
      'Ở quán trà sữa gần trường',
      'Mỗi lần thèm đồ ngọt',
      'Uống bằng ống hút to',
      'Cứ rảnh rỗi là tụ tập uống',
    ],
    sampleAnswersImpostor: [
      'Màu xanh lá đặc trưng',
      'Hơi có vị chát nhẹ ở hậu vị',
      'Quán cà phê phong cách Nhật',
      'Uống nóng hoặc đá đều thơm',
      'Pha cùng sữa tươi rất hợp',
    ],
  },
  {
    pairId: 5,
    majorityWord: 'BẮP RANG',
    impostorWord: 'SNACK',
    topic: 'Đồ Ăn Vặt Vui Vẻ',
    questions: [
      'Bạn thường ăn thứ này trong hoàn cảnh nào?',
      'Thứ này khiến bạn liên tưởng đến hoạt động gì?',
    ],
    sampleAnswersMajority: [
      'Vừa xem phim rạp vừa bốc',
      'Mùi bơ ngào ngạt thơm lừng',
      'Vị phô mai hoặc caramel ngọt',
      'Đựng trong xô giấy to',
      'Ăn liên tục không dừng được',
      'Có hạt nổ xốp giòn',
      'Đi cinema cuối tuần',
    ],
    sampleAnswersImpostor: [
      'Mở gói nhâm nhi khi cày phim',
      'Rất nhiều vị cay mặn ngọt',
      'Bánh bim bim giòn rụm',
      'Mua ở cửa hàng tiện lợi',
      'Thường dính bột ở đầu ngón tay',
    ],
  },
  {
    pairId: 6,
    majorityWord: 'ẾCH',
    impostorWord: 'CÓC',
    topic: 'Sinh Vật Quen Thuộc',
    questions: [
      'Bạn thường gặp con vật này ở đâu?',
      'Điều gì khiến bạn nhớ đến con vật này?',
    ],
    sampleAnswersMajority: [
      'Ở ruộng lúa sau cơn mưa rào',
      'Kêu ộp ộp râm ran đêm hè',
      'Món lẩu măng cay rất ngon',
      'Nhảy rất xa và bơi rất giỏi',
      'Da trơn bóng',
      'Truyện ngụ ngôn ngồi đáy giếng',
      'Thịt trắng dai như thịt gà',
    ],
    sampleAnswersImpostor: [
      'Da sần sùi có nhiều nốt',
      'Nghiến răng trời mưa',
      'Cậu ông Trời trong cổ tích',
      'Nhảy chậm hơn trên cạn',
      'Ngồi núp dưới góc vườn ẩm',
    ],
  },
  {
    pairId: 7,
    majorityWord: 'VỊT',
    impostorWord: 'NGỖNG',
    topic: 'Gia Cầm Thân Thuộc',
    questions: [
      'Bạn nghĩ đến âm thanh gì khi nghe từ này?',
      'Bạn thường gặp con vật này ở đâu?',
    ],
    sampleAnswersMajority: [
      'Tiếng quạc quạc bơi dưới ao',
      'Món nướng lá móc mật thơm nức',
      'Dáng đi lạch bà lạch bạch',
      'Cùng đàn bơi lội dưới sông',
      'Thịt chấm nước tương tỏi ớt',
      'Có trứng lộn rất bổ dưỡng',
      'Được nuôi theo đàn ở quê',
    ],
    sampleAnswersImpostor: [
      'Cổ rất dài và hung dữ',
      'Hay rượt đuổi người lạ',
      'Tiếng kêu to vang cả xóm',
      'Biểu tượng trông nhà ở quê',
      'Bộ lông trắng to lớn',
    ],
  },
  {
    pairId: 8,
    majorityWord: 'RÙA',
    impostorWord: 'ỐC SÊN',
    topic: 'Thế Giới Loài Vật',
    questions: [
      'Đặc điểm nổi bật nhất của nó là gì?',
      'Bạn liên tưởng đến tốc độ như thế nào?',
    ],
    sampleAnswersMajority: [
      'Di chuyển chậm chạp thong dong',
      'Có mai cứng cáp bảo vệ',
      'Sống rất thọ hàng trăm năm',
      'Biểu tượng Hồ Gươm lịch sử',
      'Tứ linh Long Lân Quy Phụng',
      'Bò từng bước kiên trì',
      'Rụt đầu vào trong khi sợ',
    ],
    sampleAnswersImpostor: [
      'Bò để lại vệt nhớt trên lá',
      'Có hai cái râu nhỏ trên đầu',
      'Mang vỏ xoắn ốc trên lưng',
      'Thường xuất hiện sau trời mưa',
      'Rất mềm và sợ ánh nắng gắt',
    ],
  },
  {
    pairId: 9,
    majorityWord: 'GIƯỜNG',
    impostorWord: 'VÕNG',
    topic: 'Đồ Dùng Nghỉ Ngơi',
    questions: [
      'Bạn thường sử dụng thứ này khi nào?',
      'Bạn thích thứ này trong hoàn cảnh nào?',
    ],
    sampleAnswersMajority: [
      'Nằm ngủ say giấc mỗi đêm',
      'Có nệm êm ái và chăn ấm',
      'Nơi bình yên nhất sau ngày dài',
      'Đặt ở trong phòng ngủ',
      'Nằm xem điện thoại lướt web',
      'Khó rời khỏi vào sáng sớm',
      'Trải ga sạch sẽ thơm tho',
    ],
    sampleAnswersImpostor: [
      'Mắc giữa hai thân cây mát rượi',
      'Đung đưa ngủ trưa kẽo kẹt',
      'Tiếng hát ru ầu ơ của bà',
      'Thường mang đi cắm trại picnic',
      'Làm bằng sợi dù hoặc vải lưới',
    ],
  },
  {
    pairId: 10,
    majorityWord: 'XE ĐẠP',
    impostorWord: 'XE MÁY',
    topic: 'Phương Tiện Giao Thông',
    questions: [
      'Bạn thường dùng nó để đi đâu?',
      'Điều đầu tiên bạn nghĩ đến khi sử dụng nó là gì?',
    ],
    sampleAnswersMajority: [
      'Đạp quanh hồ Tây đón gió sớm',
      'Vừa đi vừa rèn luyện sức khỏe',
      'Có hai bàn đạp và dây xích',
      'Phương tiện thân thiện môi trường',
      'Gắn liền với thời học sinh áo trắng',
      'Đi chậm rãi ngắm phố xá',
      'Bóp chuông kính coong vui tai',
    ],
    sampleAnswersImpostor: [
      'Phải đổ xăng mới chạy được',
      'Phương tiện phổ biến nhất Việt Nam',
      'Đội mũ bảo hiểm khi lưu thông',
      'Luồn lách qua giờ cao điểm',
      'Vặn tay ga là vọt đi nhanh',
    ],
  },
  {
    pairId: 11,
    majorityWord: 'BÚT CHÌ',
    impostorWord: 'BÚT MỰC',
    topic: 'Dụng Cụ Học Tập & Làm Việc',
    questions: [
      'Bạn thường dùng thứ này để làm gì?',
      'Bạn thường thấy nó ở đâu?',
    ],
    sampleAnswersMajority: [
      'Vẽ phác thảo hoặc tô trắc nghiệm',
      'Có thể tẩy xóa dễ dàng bằng gôm',
      'Cần gọt nhọn khi bị cùn',
      'Thân làm bằng gỗ nhẹ',
      'Để trong hộp bút của học sinh',
      'Viết ra nét màu xám chì',
      'Dễ gãy ngòi nếu làm rơi',
    ],
    sampleAnswersImpostor: [
      'Dùng để ký hợp đồng tài liệu',
      'Nét viết màu xanh hoặc đen',
      'Có thể bị lem nếu chạm tay vào',
      'Dùng hết là phải thay ruột mới',
      'Cài trên túi áo sơ mi',
    ],
  },
  {
    pairId: 12,
    majorityWord: 'BA LÔ',
    impostorWord: 'VALI',
    topic: 'Hành Trang Đi Lại',
    questions: [
      'Bạn thường mang thứ này trong trường hợp nào?',
      'Bạn thường bỏ gì vào bên trong?',
    ],
    sampleAnswersMajority: [
      'Đeo trên hai vai đi học, đi làm',
      'Đựng laptop và tài liệu hàng ngày',
      'Có nhiều ngăn khóa kéo tiện lợi',
      'Rất linh hoạt khi đi phượt',
      'Làm bằng vải dù bền bỉ',
      'Đeo trước ngực khi đông người',
      'Vừa vặn cho chuyến đi 1-2 ngày',
    ],
    sampleAnswersImpostor: [
      'Kéo bánh xe lạch cạch ở sân bay',
      'Có cần kéo dài rút gọn',
      'Đựng nhiều quần áo cho chuyến đi dài',
      'Có khóa số bảo mật an toàn',
      'Vỏ nhựa cứng chịu lực tốt',
    ],
  },
];

/**
 * Generates dynamic game rounds with random keyword pairs,
 * tailored questions, and fair impostor assignments.
 */
export function generateGameRounds(players: Player[], roundCount = 5): RoundData[] {
  // Shuffle keyword pairs without duplicates
  const shuffledPairs = [...KEYWORD_PAIRS].sort(() => Math.random() - 0.5);
  const selectedPairs = shuffledPairs.slice(0, Math.min(roundCount, KEYWORD_PAIRS.length));

  const validPlayers = players.length > 0 ? players : INITIAL_PLAYERS;

  // Track previous impostors to ensure fairness and avoid consecutive repeats
  const impostorSequence: string[] = [];
  let lastImpostorId = '';

  return selectedPairs.map((pair, roundIndex) => {
    // Pick random tailored question for this pair
    const question =
      pair.questions[Math.floor(Math.random() * pair.questions.length)] || pair.questions[0];

    // Pick fair impostor: candidates who were not the last round's impostor (if >= 2 players)
    const candidates =
      validPlayers.length > 1
        ? validPlayers.filter((p) => p.id !== lastImpostorId)
        : validPlayers;

    // Pick random from candidates
    const chosenImpostor = candidates[Math.floor(Math.random() * candidates.length)] || validPlayers[0];
    lastImpostorId = chosenImpostor.id;
    impostorSequence.push(chosenImpostor.id);

    // Build default answers for all players
    const defaultAnswers: Record<string, string> = {};
    validPlayers.forEach((p, pIdx) => {
      if (p.id === chosenImpostor.id) {
        defaultAnswers[p.id] =
          pair.sampleAnswersImpostor[pIdx % pair.sampleAnswersImpostor.length] || 'Nhận thấy khá đặc biệt';
      } else {
        defaultAnswers[p.id] =
          pair.sampleAnswersMajority[pIdx % pair.sampleAnswersMajority.length] || 'Rất gần gũi và quen thuộc';
      }
    });

    return {
      roundNumber: roundIndex + 1,
      pairId: pair.pairId,
      majorityWord: pair.majorityWord,
      impostorWord: pair.impostorWord,
      topic: pair.topic,
      question,
      defaultAnswers,
      impostorPlayerId: chosenImpostor.id,
    };
  });
}

export const ROUNDS_DATA: RoundData[] = generateGameRounds(INITIAL_PLAYERS, 5);

export const GACHA_ITEMS: GachaItem[] = [
  {
    id: 0,
    title: 'GIẢM 100K HỌC PHÍ',
    subtitle: 'Voucher Đặc Biệt',
    isPrize: true,
    code: '92-100K-A7F3',
    badge: 'GIẢI NHẤT',
    description: 'Áp dụng cho mọi khóa học viết / thiết kế / sáng tạo nội dung trong mùa Thu 2026.',
    color: '#9E1B1E',
    textColor: '#FDFBF7',
  },
  {
    id: 1,
    title: '2/9 này độc lập, tự do... nhưng chưa chắc tự chủ tài chính =))',
    subtitle: 'Lời Chúc Vui',
    isPrize: false,
    description: 'Chúc bạn sớm độc lập về công việc, tự do về thời gian và tự chủ về tài chính!',
    color: '#F4E9D5',
    textColor: '#1A2129',
  },
  {
    id: 2,
    title: 'GIẢM 50K HỌC PHÍ',
    subtitle: 'Voucher Khuyến Học',
    isPrize: true,
    code: '92-50K-V9B2',
    badge: 'GIẢI NHÌ',
    description: 'Voucher giảm trực tiếp khi đăng ký combo lớp học hoặc ấn phẩm văn hóa.',
    color: '#3B4D36',
    textColor: '#FDFBF7',
  },
  {
    id: 3,
    title: 'Tổ quốc ghi công, deadline ghi sổ! Chúc bạn nghỉ lễ không ai réo!',
    subtitle: 'Lời Chúc 2/9',
    isPrize: false,
    description: 'Tắt Slack, tắt email, bật chế độ nghỉ lễ toàn diện cùng gia đình và bạn bè.',
    color: '#EFE2C6',
    textColor: '#1A2129',
  },
  {
    id: 4,
    title: 'FREE 1 BUỔI WRITING 1:1',
    subtitle: 'Suất Mentor Độc Quyền',
    isPrize: true,
    code: '92-WRITE-1ON1',
    badge: 'QUÀ TẶNG VÀNG',
    description: '1 buổi coaching 1:1 định hình văn phong, sửa bài viết luận / sáng tạo cùng chuyên gia.',
    color: '#C48A2C',
    textColor: '#161C22',
  },
  {
    id: 5,
    title: 'Năm xưa phá xiềng xích, năm nay phá tan sự lười biếng!',
    subtitle: 'Khẩu Hiệu Truyền Cảm Hứng',
    isPrize: false,
    description: 'Chúc bạn luôn tràn đầy chí khí hào hùng, học gì hiểu nấy, làm gì thắng đó.',
    color: '#F4E9D5',
    textColor: '#1A2129',
  },
  {
    id: 6,
    title: 'Chúc bạn 2/9 ăn phở không hành thì đời vẫn ngọt ngào!',
    subtitle: 'Lời Chúc Đậm Chất Hà Nội',
    isPrize: false,
    description: 'Một tô phở gầu giòn, một ly cà phê trứng giữa sớm mùa thu Hà Nội.',
    color: '#E8DBC0',
    textColor: '#1A2129',
  },
  {
    id: 7,
    title: 'Lá cờ đỏ thắm trên tay, ví tiền dày cộp mỗi ngày trôi qua!',
    subtitle: 'Phúc Khí Mùa Thu',
    isPrize: false,
    description: 'Chúc bạn công danh thăng tiến rực rỡ như sắc cờ Tổ quốc ngày đại lễ.',
    color: '#F4E9D5',
    textColor: '#1A2129',
  },
  {
    id: 8,
    title: 'Tự do muôn năm, cà phê sữa đá muôn năm!',
    subtitle: 'Tinh Thần Sài Gòn 2/9',
    isPrize: false,
    description: 'Ngồi ngắm đường phố cờ hoa rợp trời bên ly cà phê đậm đà thơm ngát.',
    color: '#DCCDB2',
    textColor: '#1A2129',
  },
  {
    id: 9,
    title: 'Chúc bạn tìm được "người khác biệt" của đời mình trong mùa thu này!',
    subtitle: 'Duyên Phận 2/9',
    isPrize: false,
    description: 'Kẻ khác biệt trong game thì bị vote ra, còn người đặc biệt ngoài đời thì phải giữ chặt!',
    color: '#F4E9D5',
    textColor: '#1A2129',
  },
];

/**
 * Initialize Gacha Turn Queue & Spins:
 * - Excludes HOST from Gacha queue & gives 0 spins
 * - Highest scoring non-host player gets 2 spins
 * - All other non-host players get 1 spin
 */
export function initializeGachaState(players: Player[]): {
  gachaQueue: string[];
  playerSpins: Record<string, number>;
  firstPlayerId: string | null;
} {
  const nonHostPlayers = players.filter((p) => !p.isHost);
  const sortedNonHosts = [...nonHostPlayers].sort((a, b) => b.score - a.score);

  const playerSpins: Record<string, number> = {};
  const gachaQueue: string[] = sortedNonHosts.map((p) => p.id);

  // Set 0 spins for hosts
  players.forEach((p) => {
    if (p.isHost) {
      playerSpins[p.id] = 0;
    }
  });

  sortedNonHosts.forEach((p, index) => {
    if (index === 0) {
      // Champion among non-hosts gets 2 spins
      playerSpins[p.id] = 2;
    } else {
      // Other players get 1 spin
      playerSpins[p.id] = 1;
    }
  });

  return {
    gachaQueue,
    playerSpins,
    firstPlayerId: gachaQueue[0] || null,
  };
}

