# Thiệp Mời Dự Lễ Tốt Nghiệp — Nguyễn Vũ Xuân Mai | UIT

Website thiệp mời tốt nghiệp trực tuyến xây dựng bằng **React 18 + Vite**, hỗ trợ cá nhân hóa lời mời theo từng người nhận, trình tạo link cho chủ thiệp (`?host=1`), bảng lưu bút & lời chúc, bản đồ hướng dẫn khuôn viên UIT, đếm ngược thời gian thực và nhạc nền.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Build production vào dist/
npm run preview    # Xem trước bản build tại http://localhost:4173
```

## Tính năng chính

- **Trang bìa thiệp mời (`CoverCard`)**: Mở màn dạng thiệp dọc kèm hiệu ứng mở thiệp mượt mà.
- **Cá nhân hóa link (`?i=...`) & Host Studio (`?host=1`)**: Tạo link mời riêng cho từng đối tượng (Bạn bè, Bạn thân, Anh/Chị/Em, Thầy/Cô, Bố Mẹ, Cô Chú) với hai mức độ thân thiết (Xã giao / Thân thiết) và chỉnh sửa câu chữ trực tiếp trước khi sao chép link.
- **Thời gian & Địa điểm**: Đồng hồ đếm ngược, lịch tháng 11/2026 đánh dấu ngày lễ, bản đồ khuôn viên UIT tương tác và nút mở Google Maps / Google Calendar.
- **Bảng lưu bút & lời chúc**: Xác nhận tham dự / gửi lời chúc từ xa theo xưng hô được cá nhân hóa và dán giấy note lên bảng kỷ niệm.
- **Hành trình & Kỷ yếu**: Trình bày câu chuyện thanh xuân và băng ảnh Polaroid tương tác.
- **Bảo vệ nội dung hiển thị**: Chặn chuột phải, chặn bôi đen/sao chép trang (trừ ô nhập liệu), chặn kéo ảnh và các phím tắt xem nguồn / mở DevTools.

## Cấu trúc mã nguồn

```text
src/
  App.jsx                 Bố cục trang chính và khóa/mở thiệp
  data.js                 Thông tin buổi lễ, nội dung section và album ảnh
  personalization.js      Xưng hô, mẫu lời mời theo nhóm người nhận & mã hóa link
  invitationContext.jsx   State dùng chung cho chế độ khách / chủ thiệp
  hooks.js                Scroll mượt, reveal, scroll spy và bảo vệ nội dung
  components/             Header, CoverCard, Hero, CountdownTimer, About, Newsletter,
                          Adventures, Instagram, Footer, HostInviteTool, WaterRipple...
  styles/                 Design tokens, base CSS, components và responsive sections
public/
  assets/                 Ảnh khuôn viên UIT, kỷ yếu, bản đồ, nhạc nền và SVG trang trí
```