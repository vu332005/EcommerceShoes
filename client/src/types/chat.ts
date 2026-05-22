/**
 * Các interface dùng chung cho tính năng chat
 * (dùng bởi cả ChatWidget phía user và Admin Chat Page)
 */

export interface Message {
  id?: number;
  content: string;
  senderRole: "user" | "admin";
  senderName: string;
  userId?: number;
  createdAt: Date | string;
  pending?: boolean;
  isRead?: boolean;
}

export interface Conversation {
  userId: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
  } | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
