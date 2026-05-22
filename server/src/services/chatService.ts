import { AppDataSource } from "../config/db";
import { ChatMessage } from "../models/ChatMessage";
import { User } from "../models/User";

const chatRepo = AppDataSource.getRepository(ChatMessage);
const userRepo = AppDataSource.getRepository(User);

export interface SaveMessageData {
  userId: number;
  content: string;
  senderRole: "user" | "admin";
  senderId: number;
  senderName: string;
}

// nhân dlieu từ socket
// Lưu tin nhắn vào DB
export const saveMessage = async (
  data: SaveMessageData,
): Promise<ChatMessage> => {
  const message = chatRepo.create({
    userId: data.userId,
    content: data.content,
    senderRole: data.senderRole,
    senderId: data.senderId,
    senderName: data.senderName,
  });
  return chatRepo.save(message);
};

// Lấy lịch sử chat của 1 user (mới nhất trước, giới hạn 100 tin)
export const getMessagesByUser = async (
  userId: number,
): Promise<ChatMessage[]> => {
  return chatRepo.find({
    where: { userId },
    order: { createdAt: "ASC" },
    take: 100,
  });
};

// Đánh dấu tất cả tin nhắn của user là đã đọc (khi admin mở chat)
export const markAsRead = async (userId: number): Promise<void> => {
  await chatRepo.update(
    { userId, senderRole: "user", isRead: false },
    { isRead: true },
  );
};

// Đánh dấu tất cả tin nhắn của admin gửi cho user này là đã đọc (khi user mở chat)
export const markAdminMessagesAsRead = async (userId: number): Promise<void> => {
  await chatRepo.update(
    { userId, senderRole: "admin", isRead: false },
    { isRead: true },
  );
};

// Lấy danh sách user đã nhắn tin (dùng cho admin sidebar)
// Trả về: thông tin user + tin nhắn cuối + số tin chưa đọc
export const getConversationList = async () => {
  const result = await chatRepo.query(`
    SELECT 
      user_id AS "userId", 
      MAX(created_at) AS "lastMessageAt",
      (SELECT content FROM chat_messages cm WHERE cm.user_id = chat_messages.user_id ORDER BY created_at DESC LIMIT 1) AS "lastMessage",
      (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_id = chat_messages.user_id AND sender_role = 'user' AND is_read = false) AS "unreadCount"
    FROM chat_messages
    GROUP BY user_id
    ORDER BY "lastMessageAt" DESC
  `);

  // Lấy thông tin user cho từng conversation
  const conversationsWithUser = await Promise.all(
    result.map(async (conv: any) => {
      const user = await userRepo.findOne({
        where: { id: conv.userId },
        select: ["id", "fullName", "email", "avatarUrl"],
      });
      return {
        userId: conv.userId,
        user: user
          ? {
              id: user.id,
              fullName: user.fullName || user.email,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }
          : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: parseInt(conv.unreadCount || "0"),
      };
    }),
  );

  return conversationsWithUser;
};
