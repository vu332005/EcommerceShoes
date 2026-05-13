# Hoàn tất triển khai tính năng Chat Real-time

Quá trình tích hợp tính năng chat giữa Người dùng (User) và Quản trị viên (Admin) bằng Socket.io đã hoàn thành toàn bộ ở cả Backend và Frontend.

## Những gì đã thay đổi

### 1. Database & TypeORM Models
- Đã tạo Entity `ChatMessage` để lưu trữ dữ liệu các tin nhắn.
- Đã tạo và chạy thành công file migration `AddChatMessages` sinh ra bảng `chat_messages` trong CSDL PostgreSQL.

### 2. Backend (Express + Socket.io)
- Tích hợp `socket.io` vào HTTP server trong `index.ts`.
- Bổ sung xác thực (Auth) qua Middleware của socket để lấy các token xác minh người gửi là Admin hay User.
- Xử lý các Event của socket bao gồm:
  - `send_message`: người dùng gửi tin nhắn
  - `admin_reply`: admin trả lời tin nhắn
  - Broadcast số lượng tin nhắn, trạng thái "online" của admin để người dùng phía ngoài theo dõi.
- Tạo một số API REST để tải về lịch sử chat (`/api/v1/chat/history`) và các phiên chat đang có (cho Admin: `/api/v1/chat/conversations`).

### 3. Frontend (Client)
- Tích hợp kết nối đơn tầng (Singleton Connection) ở thư viện `socket.io-client` trong mục `lib/socket.ts` để chắc chắn ta không kết nối tạo lại khi ứng dụng React tự Render nhiều lần.
- Cập nhật biến môi trường `.env.local` với cấu hình của Socket API (port 4000).
- Tạo và nhúng Floating Widget vào góc phải màn hình của Layout góc ở `app/layout.tsx`. Giờ đây mọi User đã đăng nhập đều thấy được nút chat.
- Hoàn thiện giao diện Chat Admin tại đường dẫn `(admin)/admin/chat`. Có phân chia chi tiết khu vực hội thoại và các khách hàng nhắn tin tới.

## Cách Kiểm Tra (Test)
Bạn có thể tiến hành test trên trình duyệt theo các bước sau:
1. Mở cửa sổ trình duyệt (Customer) bằng tài khoản User, bạn sẽ thấy xuất hiện 1 **nút Chat màu đỏ góc phải phía dưới màn hình**. Click vào để mở khung thoại và gửi thử tin nhắn.
2. Mở một Tab Khác trên trình duyệt (Incognito/Guest) bằng tài khoản Admin. Truy cập vào Dashboard `localhost:3000/admin`.
3. Nhấp vào mục **Chat hỗ trợ** vừa được thêm vào trên thanh bên (sidebar). Ở đó sẽ thấy tin nhắn của vị khách User gửi đến.
4. Gửi reply từ tài khoản Admin sẽ thấy cập nhật ngay lập tức tại Tab của người dùng cũ cùng tốc độ phản hồi tin nhắn tự động từ Socket.
