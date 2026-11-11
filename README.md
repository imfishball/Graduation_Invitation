# Thiệp Mời Dự Lễ Tốt Nghiệp Trực Tuyến — Nguyễn Vũ Xuân Mai | UIT

Một website **thiệp mời lễ tốt nghiệp mang phong cách nhật ký thủ công** (*Bullet Journal & Handmade Keepsake*), giúp biến lời mời tốt nghiệp thành một không gian kỷ niệm giàu cảm xúc thay cho một bức ảnh hay dòng tin nhắn thông thường.

---

## Ý tưởng & Trải nghiệm cốt lõi

Thay vì chỉ thông báo ngày giờ buổi lễ, website được thiết kế như một cuốn nhật ký thu nhỏ lưu giữ cột mốc bốn năm thanh xuân tại Trường Đại học Công nghệ Thông tin (UIT – ĐHQG TP.HCM):

- **Tấm thiệp bìa mở màn (`CoverCard`)**: Người nhận mở link sẽ thấy trang bìa thiệp dọc tối giản, kèm nút mở thiệp tạo cảm giác trân trọng như đang cầm và mở một tấm thiệp giấy thật ngoài đời.
- **Đếm ngược & Bản đồ hướng dẫn đến UIT**: Tích hợp đồng hồ đếm ngược thời gian thực tới lễ tốt nghiệp (**Thứ Sáu, 27/11/2026 · 15:00 – 17:00**), lịch tháng đánh dấu ngày lễ, bản đồ khuôn viên UIT tương tác (hỗ trợ xem chỉ dẫn theo từng cổng/tuyến xe) cùng nút lưu nhanh vào Google Calendar và Google Maps.
- **Bảng Lưu Bút & Lời Chúc (Bullet Journal Pinboard)**: Khách mời có thể chọn màu giấy note yêu thích, xác nhận tham dự trực tiếp hoặc gửi lời chúc từ xa rồi "dán" ngay tờ giấy note lên bảng kỷ niệm chung với hiệu ứng thả tim và pháo giấy chúc mừng.
- **Nhìn lại dấu ấn thanh xuân & Góc kỷ yếu Polaroid**: Kể lại hành trình 4 năm giảng đường qua những góc sân UIT thân quen cùng băng ảnh Polaroid kéo ngang tương tác mượt mà và nhạc nền dịu nhẹ.

---

## Hỗ trợ cá nhân hóa lời mời theo từng người nhận

Một điểm nhấn đặc biệt của website là **khả năng cá nhân hóa xưng hô và lời nhắn theo từng đối tượng khách mời**:

- Khi gửi thiệp cho **Thầy/Cô**, **Bố Mẹ & Gia đình**, **Cô Chú / Ông Bà**, **Anh/Chị/Em khóa dưới**, **Bạn bè** hay **Bạn thân**, mỗi mối quan hệ lại cần một cách xưng hô và sắc thái cảm xúc riêng (*em – Thầy/Cô*, *con – Bố Mẹ*, *mình – bạn*...).
- Hệ thống hỗ trợ tạo các **đường dẫn mời riêng** được mã hóa gọn qua tham số liên kết (`?i=...`), tự động đồng bộ toàn bộ câu chữ trên bìa thiệp, màn hình chào đầu trang, đôi dòng tâm sự, câu hỏi xác nhận tham dự và lời cảm ơn cuối trang theo đúng vai vế người nhận — đồng thời vẫn giữ nguyên **bản thiệp mẫu mặc định** khi chia sẻ link gốc chung cho mọi người.

---

## Chạy dự án trên máy

```bash
npm install
npm run dev        # Khởi chạy môi trường phát triển (http://localhost:5173)
npm run build      # Đóng gói bản production vào thư mục dist/
npm run preview    # Xem trước bản build production (http://localhost:4173)
```

## Công nghệ sử dụng

- **React 18** + **Vite 5**
- **Lenis** (cuộn mượt) & **canvas-confetti** (hiệu ứng chúc mừng khi gửi lưu bút)
- **CSS thuần theo Design Tokens** tối ưu hiển thị đa thiết bị (Desktop, Tablet và Mobile)