# Tính năng Chat User ↔ Admin (Socket.io)

Thêm tính năng chat real-time giữa người dùng và admin. Tất cả admin đều có thể thấy và trả lời tin nhắn. Sử dụng Socket.io + PostgreSQL để lưu lịch sử chat.

## Kiến trúc tổng quan

```
User (client) ──── HTTP/WS ──── Server (Socket.io) ──── Admin (client)
                                      │
                                 PostgreSQL (lưu message)
```

**Luồng hoạt động:**
- User gửi tin nhắn → Server nhận → Broadcast đến **tất cả admin** đang online
- Admin reply → Server nhận → Gửi về đúng room của user đó
- Mỗi user có 1 **room riêng** (room id = `user_${userId}`)
- Tất cả admin **join tất cả room user** khi connect
- Lịch sử chat được lưu vào DB và tải lại khi mở chat

## Proposed Changes

---

### Backend (Server)

#### [MODIFY] package.json
Thêm dependency: `socket.io`

#### [NEW] src/models/ChatMessage.ts
TypeORM entity lưu tin nhắn:
```
- id (PK)
- userId (FK → users)
- content (text)
- senderRole: 'user' | 'admin'
- senderId (admin id hoặc user id)
- senderName (string)
- createdAt
```

#### [NEW] src/services/chatService.ts
- `saveMessage(data)` → lưu DB
- `getMessagesByUser(userId)` → lấy lịch sử chat của user
- `getConversationList()` → lấy danh sách user đã chat (dùng cho admin)

#### [NEW] src/routes/chatRoutes.ts
```
GET /api/v1/chat/history/:userId   (protect - admin hoặc chính user đó)
GET /api/v1/chat/conversations     (protect - admin only)
```

#### [MODIFY] src/routes/index.ts
Đăng ký `chatRoutes`

#### [NEW] src/socket/chatSocket.ts
Setup Socket.io handler:
- Event `join_admin` → admin join tất cả room user hiện có
- Event `send_message` (user) → lưu DB + emit `new_message` đến room user + broadcast đến admin room
- Event `admin_reply` (admin) → lưu DB + emit `new_message` đến room user cụ thể

#### [MODIFY] src/index.ts
Khởi tạo `http.Server` + `Socket.io`, gắn vào app Express

---

### Frontend (Client)

#### [MODIFY] client/package.json
Thêm dependency: `socket.io-client`

#### [NEW] src/lib/socket.ts
Khởi tạo socket client singleton, tự động gắn token auth

#### [NEW] src/app/(private)/chat/page.tsx
**Trang chat cho user:**
- Floating chat button xuất hiện trên tất cả trang (hoặc page riêng)
- Hiển thị lịch sử tin nhắn với admin
- Input gửi tin nhắn
- Hiển thị trạng thái "Admin đang online/offline"

> [!NOTE]
> Sẽ làm dưới dạng **floating widget** gắn vào layout chính thay vì page riêng để UX tốt hơn

#### [MODIFY] src/app/(private)/layout.tsx hoặc root layout
Thêm `ChatWidget` floating button

#### [NEW] src/components/chat/ChatWidget.tsx
- Floating button góc phải màn hình
- Mở ra cửa sổ chat
- Kết nối socket khi user đã đăng nhập

#### [NEW] src/app/(admin)/admin/chat/page.tsx
**Trang chat admin:**
- Sidebar trái: danh sách user đã chat (có badge tin nhắn mới)
- Sidebar phải: lịch sử chat với user được chọn
- Input reply tin nhắn
- Real-time update khi có tin nhắn mới

#### [MODIFY] src/app/(admin)/admin/layout.tsx
Thêm menu item "Chat" vào sidebar admin

---

## Open Questions

> [!IMPORTANT]
> **Authentication Socket**: Dùng JWT token từ cookie/localStorage để xác thực socket connection. Cần xác nhận cách lưu token hiện tại (thấy dùng `js-cookie`).

> [!NOTE]
> **Floating Chat Widget**: Sẽ hiển thị ở góc phải màn hình cho user đã đăng nhập. Áp dụng cho layout `(private)`. Admin sẽ có trang riêng `/admin/chat`.

## Verification Plan

### Tự động
- Server build không lỗi TypeScript
- Client build không lỗi

### Thủ công
1. User đăng nhập → thấy floating chat button
2. User gửi tin nhắn
3. Admin vào `/admin/chat` → thấy tin nhắn của user real-time
4. Admin reply → User nhận được ngay
5. Nhiều tab admin đều nhận được tin nhắn
6. Reload trang → lịch sử chat vẫn còn
