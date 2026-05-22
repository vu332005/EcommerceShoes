import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyToken } from "../utils/jwtHelper";
import { saveMessage, markAsRead, markAdminMessagesAsRead } from "../services/chatService";

// Lưu map: userId -> Set<socketId> (user có thể mở nhiều tab)
const onlineUsers = new Map<number, Set<string>>();
// Set các socketId của admin đang online
const onlineAdmins = new Set<string>();

// Room name cho admin để nhận broadcast
const ADMIN_ROOM = "admin_room";

export const initChatSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      // Production: dùng FRONTEND_URL | Dev: localhost:3000
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Render hỗ trợ WebSocket native — ưu tiên websocket, fallback sang polling
    transports: ["websocket", "polling"],
    path: "/socket.io",
  });

  // Middleware xác thực JWT cho socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }
    try {
      const decoded = verifyToken(token) as any;
      (socket as any).user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error("Unauthorized: Invalid token"));
    }
  });

  // sau khi qua middleware
  // -> sẽ chạy event nayhf -> phần làm 2 luồng cho user / admin
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user as { id: number; role: string };
    console.log(`[Socket] ${user.role} #${user.id} connected: ${socket.id}`);

    // Đăng ký sự kiện đánh dấu đã xem tin nhắn
    socket.on(
      "mark_messages_read",
      async (data: { userId: number; readerRole: "user" | "admin" }) => {
        try {
          if (data.readerRole === "admin") {
            await markAsRead(data.userId);
          } else {
            await markAdminMessagesAsRead(data.userId);
          }

          const payload = {
            userId: data.userId,
            readerRole: data.readerRole,
          };

          // Broadcast về phòng của user
          const userRoom = `user_${data.userId}`;
          io.to(userRoom).emit("messages_read", payload);

          // Broadcast đến phòng của admin
          io.to(ADMIN_ROOM).emit("messages_read", payload);
        } catch (err) {
          console.error("[Socket] mark_messages_read error:", err);
        }
      }
    );

    // ADMIM
    if (user.role === "admin") {
      // Admin join vào admin_room để nhận mọi tin nhắn từ user
      socket.join(ADMIN_ROOM);
      onlineAdmins.add(socket.id);

      // Thông báo cho tất cả user rằng có admin online
      io.emit("admin_status", { online: onlineAdmins.size > 0 });

      // Admin lắng nghe event reply tin nhắn
      socket.on(
        "admin_reply",
        async (data: {
          userId: number;
          content: string;
          senderName: string;
        }) => {
          try {
            const saved = await saveMessage({
              userId: data.userId,
              content: data.content,
              senderRole: "admin",
              senderId: user.id,
              senderName: data.senderName,
            });

            const msgPayload = {
              id: saved.id,
              content: saved.content,
              senderRole: "admin" as const,
              senderId: user.id,
              senderName: data.senderName,
              createdAt: saved.createdAt,
            };

            // Gửi về room của user đó
            const userRoom = `user_${data.userId}`;
            io.to(userRoom).emit("new_message", msgPayload);

            // Broadcast đến tất cả admin khác (để đồng bộ)
            socket.to(ADMIN_ROOM).emit("new_message_from_admin", {
              ...msgPayload,
              userId: data.userId,
            });
          } catch (err) {
            console.error("[Socket] admin_reply error:", err);
            socket.emit("error_message", { message: "Gửi tin nhắn thất bại" });
          }
        },
      );

      socket.on("disconnect", () => {
        onlineAdmins.delete(socket.id);
        console.log(`[Socket] Admin #${user.id} disconnected`);
        // Nếu không còn admin nào online -> thông báo
        io.emit("admin_status", { online: onlineAdmins.size > 0 });
      });
    } else {
      // USER
      const userRoom = `user_${user.id}`;
      socket.join(userRoom);

      // Đăng ký user online
      if (!onlineUsers.has(user.id)) {
        onlineUsers.set(user.id, new Set());
      }
      onlineUsers.get(user.id)!.add(socket.id);

      // Gửi trạng thái admin cho user vừa connect
      socket.emit("admin_status", { online: onlineAdmins.size > 0 });

      // User gửi tin nhắn
      socket.on(
        "send_message",
        async (data: { content: string; senderName: string }) => {
          try {
            const saved = await saveMessage({
              userId: user.id,
              content: data.content,
              senderRole: "user",
              senderId: user.id,
              senderName: data.senderName,
            });

            const msgPayload = {
              id: saved.id,
              content: saved.content,
              senderRole: "user" as const,
              senderId: user.id,
              senderName: data.senderName,
              userId: user.id,
              createdAt: saved.createdAt,
            };

            // Echo lại cho chính user (confirm gửi thành công)
            /*
      - luồng lý do tại sao cần thêm sự kiện new_message cho chính mình
      FE: User ấn gửi -> FE tạo một tin nhắn có cờ pending: true (hiển thị mờ mờ hoặc có chữ "Đang gửi...") -> Cập nhật lên UI ngay lập tức -> Bắn send_message lên server.
      Server: Nhận lệnh -> Lưu DB mất ~100ms -> Bắn echo new_message về FE báo "Lưu xong rồi nhé!".
      FE: Nhận được new_message -> Tìm cái tin nhắn pending hồi nãy -> Xóa chữ "Đang gửi...", cập nhật ID thật, đổi thành trạng thái "Đã gửi" (pending: false).
      Nếu server không echo về, FE sẽ vĩnh viễn bị treo ở trạng thái pending: true (Đang gửi...).
            */

            socket.emit("new_message", msgPayload);

            // Broadcast đến tất cả admin trong admin_room
            io.to(ADMIN_ROOM).emit("new_user_message", msgPayload);
          } catch (err) {
            console.error("[Socket] send_message error:", err);
            socket.emit("error_message", { message: "Gửi tin nhắn thất bại" });
          }
        },
      );

      socket.on("disconnect", () => {
        const sockets = onlineUsers.get(user.id);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) onlineUsers.delete(user.id);
        }
        console.log(`[Socket] User #${user.id} disconnected`);
      });
    }
  });

  console.log("[Socket] Chat socket initialized");
  return io;
};
