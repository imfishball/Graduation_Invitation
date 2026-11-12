/**
 * Dữ liệu Thiệp Mời Dự Lễ Tốt Nghiệp Online
 * Cử nhân: Nguyễn Vũ Xuân Mai
 * Trường Đại học Công nghệ Thông tin - ĐHQG TPHCM (UIT)
 */

export const GRADUATION_INFO = {
  university: 'Đại học Quốc gia TP. Hồ Chí Minh (ĐHQG-HCM)',
  date: 'Thứ Sáu, 27 tháng 11, 2026',
  dateISO: '2026-11-27T15:00:00+07:00',
  time: '15:00 – 17:00',
  hall: 'Trường Đại học Công nghệ Thông tin',
  venue: 'Trường Đại học Công nghệ Thông tin - ĐHQG TPHCM',
  address: 'Khu phố 6, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh',
  googleMapsUrl:
    'https://maps.google.com/?q=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+C%C3%B4ng+ngh%E1%BB%87+Th%C3%B4ng+tin+-+%C4%90HQG-HCM,+Khu+ph%E1%BB%91+6,+Linh+Trung,+Th%E1%BB%A7+%C4%90%E1%BB%A9c',
  googleCalendarUrl:
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=L%E1%BB%85+T%E1%BB%91t+Nghi%E1%BB%87p+-+Nguy%E1%BB%85n+V%C5%A9+Xu%C3%A2n+Mai&dates=20261127T080000Z/20261127T100000Z&details=Tr%C3%A2n+tr%E1%BB%8Dng+k%C3%ADnh+m%E1%BB%9Di+b%E1%BA%A1n+%C4%91%E1%BA%BFn+chung+vui+v%C3%A0+ch%E1%BB%A5p+%E1%BA%A3nh+k%E1%BB%B7+ni%E1%BB%87m+t%E1%BB%91t+nghi%E1%BB%87p+c%C3%B9ng+Xu%C3%A2n+Mai+(15%3A00+%E2%80%93+17%3A00)+t%E1%BA%A1i+Tr%C6%B0%E1%BB%9Dng+%C4%90H+C%C3%B4ng+ngh%E1%BB%87+Th%C3%B4ng+tin+-+%C4%90HQG+TPHCM&location=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+C%C3%B4ng+ngh%E1%BB%87+Th%C3%B4ng+tin+-+%C4%90HQG+TP.HCM,+Khu+ph%E1%BB%91+6,+Linh+Trung,+Th%E1%BB%A7+%C4%90%E1%BB%A9c,+TP.HCM',
}

export const NAV_LINKS = [
  { label: 'Trang Chủ', href: '#top' },
  { label: 'Thời Gian & Địa Điểm', href: '#about' },
  { label: 'Gửi Lời Chúc', href: '#contact' },
  { label: 'Hành Trình', href: '#adventures' },
  { label: 'Kỷ Yếu', href: '#instagram' },
]

export const HERO = {
  script: "Hi, I'm Xuân Mai",
  cta: {
    primary: 'Xác nhận tham dự',
    secondary: 'Thời gian & Địa điểm',
    secondaryShort: 'Xem lịch lễ',
  },
  stats: [
    { value: '4 Năm', label: 'Thanh xuân trọn vẹn' },
    { value: '1 Hành trình', label: 'Nỗ lực & trưởng thành' },
    { value: 'Vô vàn', label: 'Yêu thương & Biết ơn' },
  ],
  feature: {
    eyebrow: 'Khoảnh khắc trọng đại',
    location: 'UIT ĐHQG-HCM • 15:00 – 17:00',
    title: 'Gặp Gỡ & Chụp Ảnh Kỷ Niệm Tốt Nghiệp',
  },
}

export const POSTS = [
  {
    slug: 'ngay-dau-vao-truong',
    location: 'Sân Tòa A • UIT',
    title: 'Ngày Đầu Tiên Đến Trường',
    excerpt: 'Khoảng sân Tòa A rợp bóng cây và dãy ghế đá thân quen từ những ngày đầu nhập học.',
    image: '/assets/post-amalfi.jpg',
    alt: 'Khoảng sân xanh mát trước Tòa A Trường ĐH CNTT (UIT) với hàng ghế đá UIT Career Day',
  },
  {
    slug: 'hanh-lang-giang-duong',
    location: 'Dãy Giảng Đường C • UIT',
    title: 'Hành Lang Giờ Lên Lớp',
    excerpt: 'Những buổi sáng rảo bước qua hành lang khu C để kịp giờ điểm danh giảng đường.',
    image: '/assets/post-santorini.jpg',
    alt: 'Hành lang khu C109 - C113 rợp bóng cọ tại Trường Đại học Công nghệ Thông tin',
  },
  {
    slug: 'goc-ban-da-do-an',
    location: 'Hàng Cây & Bàn Đá • UIT',
    title: 'Góc Bàn Đá Chạy Đồ Án',
    excerpt: 'Góc ghế đá quen thuộc dưới tán cây xanh, nơi tụi mình vừa ôn thi vừa trò chuyện xuyên trưa.',
    image: '/assets/post-bali.jpg',
    alt: 'Dãy bàn đá sinh viên dưới hàng cây xanh bên tòa nhà màu xanh đặc trưng của UIT',
  },
  {
    slug: 'chieu-nang-san-the-thao',
    location: 'Sân Thể Thao • UIT',
    title: 'Chiều Nắng Trên Sân Bóng',
    excerpt: 'Những buổi chiều tan học rộn rã tiếng cười ở sân thể thao giải tỏa mọi căng thẳng deadline.',
    image: '/assets/post-marrakech.jpg',
    alt: 'Sân bóng chuyền xanh biếc rợp tán cây tại khu thể thao Trường ĐH CNTT (UIT)',
  },
  {
    slug: 'toa-b-mua-nang-xanh',
    location: 'Khuôn Viên Tòa B • UIT',
    title: 'Tòa B Mùa Rợp Bóng Xanh',
    excerpt: 'Ánh nắng xuyên qua vòm lá xanh biếc trước Tòa B, chứng kiến biết bao mùa thi trưởng thành.',
    image: '/assets/post-iceland.jpg',
    alt: 'Tòa nhà B Trường Đại học Công nghệ Thông tin ẩn hiện dưới tán cây xanh mát',
  },
  {
    slug: 'mai-truong-uit-than-thuong',
    location: 'Tòa Nhà Chính • UIT',
    title: 'Ngước Nhìn Mái Trường UIT',
    excerpt: 'Tòa nhà kính và hàng cờ bay trong nắng nhẹ, gói trọn bốn năm thanh xuân rực rỡ.',
    image: '/assets/post-uit-flags.jpg',
    alt: 'Tòa nhà kính Trường Đại học Công nghệ Thông tin và hàng cờ tung bay dưới bầu trời nắng nhẹ',
  },
]

export const ABOUT = {
  script: 'lời chào nhỏ',
}

export const INSTAGRAM = {
  script: 'góc kỷ niệm',
  handle: '@xuanmai.uit',
  photos: [
    {
      location: 'Tự hào màu áo cử nhân UIT K17',
      image: '/assets/ig-k17-stairs.jpg',
      width: 1200,
      height: 1200,
      alt: 'Xuân Mai trong lễ phục cử nhân, đội mũ tốt nghiệp cùng dải băng UIT K17 trên bậc thang trường',
    },
    {
      location: 'Cùng nhau bước lên bậc thang mới',
      image: '/assets/ig-duo-stairs.jpg',
      width: 1200,
      height: 1200,
      alt: 'Hai nữ cử nhân UIT K17 trong tà áo tốt nghiệp xanh đỏ cùng sánh bước lên bậc thang giảng đường',
    },
    {
      location: 'Nắng vàng sân trường quen thuộc',
      image: '/assets/ig-campus-sun.jpg',
      width: 1200,
      height: 1200,
      alt: 'Ánh nắng ban mai chiếu rọi qua lối đi và khu vườn xanh mát tại khuôn viên UIT',
    },
    {
      location: 'Nụ cười rạng rỡ bên bó hoa hồng',
      image: '/assets/ig-friends-roses.jpg',
      width: 1200,
      height: 1200,
      alt: 'Xuân Mai ôm bó hoa hồng phấn cùng bạn thân rạng rỡ trong lễ phục cử nhân trước cổng UIT',
    },
    {
      location: 'Phút ngẫu hứng qua khung kính UIT',
      image: '/assets/ig-mirror-crew.jpg',
      width: 1381,
      height: 921,
      alt: 'Nhóm bạn UIT K17 chụp ảnh kỷ niệm qua ô kính giảng đường phía trước bức tranh máy bay',
    },
    {
      location: 'Thanh xuân có bạn đồng hành',
      image: '/assets/ig-friends-group.jpg',
      width: 1500,
      height: 1000,
      alt: 'Xuân Mai và nhóm bạn UIT K17 rạng rỡ trong lễ phục tốt nghiệp tạo dáng trái tim trước cổng trường',
    },
    {
      location: 'Giang tay đón chặng đường mới',
      image: '/assets/ig-friends-wings.jpg',
      width: 1500,
      height: 1000,
      alt: 'Xuân Mai trong tà áo trắng cùng nhóm bạn UIT K17 giang rộng vòng tay rạng rỡ trước cổng trường',
    },
    {
      location: 'Bầu trời UIT những ngày mơ ước',
      image: '/assets/ig-uit-airplane.jpg',
      width: 1200,
      height: 1200,
      alt: 'Chiếc máy bay lướt qua bầu trời trong veo phía trên tòa nhà Trường Đại học Công nghệ Thông tin (UIT)',
    },
  ],
}

export const NEWSLETTER = {
  script: 'gửi gắm tâm tình',
  title: 'Bảng Lưu Bút & Lời Chúc',
  cta: 'Dán Note Lên Bảng',
  placeholderName: 'Ví dụ: Minh Anh K17',
  roles: ['Bạn bè', 'Gia đình & Người thân', 'Khác'],
  noteColors: [
    { id: 'rose', label: 'Hồng Đào', swatch: '#fadcd7' },
    { id: 'butter', label: 'Vàng Kem', swatch: '#faecae' },
    { id: 'mint', label: 'Xanh Bạc Hà', swatch: '#d3ebd7' },
    { id: 'sky', label: 'Xanh Trời', swatch: '#d4e5f7' },
    { id: 'cream', label: 'Kem Vani', swatch: '#fff4d2' },
  ],
}

export const INITIAL_GUESTBOOK = [
  {
    id: 'msg-1',
    name: 'Bố Mẹ & Gia Đình',
    role: 'Gia đình',
    attendance: 'attending',
    noteColor: 'rose',
    fastener: 'tape-stripe',
    doodle: 'star',
    message:
      'Bố Mẹ rất tự hào về con gái! Chúc con vững bước chặng đường mới, cả nhà luôn bên con.',
    time: 'Hôm qua lúc 18:30',
  },
  {
    id: 'msg-2',
    name: 'Nhóm Bạn Lab 402',
    role: 'Bạn thân UIT K17',
    attendance: 'attending',
    noteColor: 'butter',
    fastener: 'tape-dots',
    doodle: 'heart',
    message:
      'Chúc mừng tốt nghiệp nha Mai! Thứ Sáu 27/11 đúng 15h00 tụi tao ôm hoa tới UIT chụp ảnh nha!',
    time: 'Hôm qua lúc 20:15',
  },
  {
    id: 'msg-3',
    name: 'Thầy Cố vấn Học tập',
    role: 'Giảng viên UIT',
    attendance: 'attending',
    noteColor: 'mint',
    fastener: 'pushpin',
    doodle: 'flower',
    message:
      'Chúc mừng tân cử nhân Xuân Mai! Chúc em luôn giữ tinh thần ham học hỏi và vươn xa hơn nữa.',
    time: 'Hôm nay lúc 08:45',
  },
  {
    id: 'msg-4',
    name: 'Hoàng Quân K17',
    role: 'Bạn cùng khóa UIT',
    attendance: 'attending',
    noteColor: 'sky',
    fastener: 'tape-grid',
    doodle: 'sparkle',
    message:
      'Chúc Mai tốt nghiệp thật rực rỡ và nhiều niềm vui! Hẹn gặp bạn chiều 27/11 ở sân trường UIT nhé.',
    time: 'Hôm nay lúc 10:15',
  },
]

export const FOOTER = {
  title: 'Lời Cảm Ơn',
  author: 'Nguyễn Vũ Xuân Mai',
}

export const COVER = {
  eyebrow: 'Graduate Ceremony',
  monogram: 'M',
  script: 'Thiệp Mời',
  name: 'Nguyễn Vũ Xuân Mai',
  subtitle: 'Lễ Tốt Nghiệp · Khóa K17',
  dateParts: ['27', '11', '2026'],
  cta: 'Mở thiệp',
}