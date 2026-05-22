import api from "@/lib/axios";
import { Message, Conversation } from "@/types/chat";

export const chatService = {
  /**
   * Lấy lịch sử chat theo userId
   * Dùng bởi: useChatHistory (user-side & admin-side)
   */
  getHistory: async (userId: number): Promise<Message[]> => {
    const res = await api.get(`/chat/history/${userId}`);
    return res.data.messages || [];
  },

  /**
   * Lấy danh sách tất cả conversations (dành cho admin)
   * Dùng bởi: AdminChatPage
   */
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get("/chat/conversations");
    return res.data.conversations || [];
  },
};
