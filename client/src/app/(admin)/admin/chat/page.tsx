"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Message, Conversation } from "@/types/chat";
import { formatChatTimeWithDate } from "@/lib/chat";
import { useAdminChatSocket } from "@/components/chat/hooks/useAdminChatSocket";
import { useChatHistory } from "@/components/chat/hooks/useChatHistory";
import { chatService } from "@/services/chatService";
import ChatSidebar from "@/components/chat/admin/ChatSidebar";
import AdminChatHeader from "@/components/chat/admin/AdminChatHeader";
import AdminEmptyState from "@/components/chat/admin/AdminEmptyState";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";

/**
 * Admin Chat Page — quản lý hội thoại với khách hàng.
 * Layout: Sidebar (danh sách conversations) + Main area (messages + input).
 *
 * Orchestrator: compose các component con, quản lý state conversations & selectedUserId.
 */
export default function AdminChatPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);

  // Hooks
  const { messages, setMessages, isLoading: isLoadingMsgs, fetchHistory } = useChatHistory();
  const { sendReply, socketRef } = useAdminChatSocket(
    selectedUserId,
    setMessages,
    setConversations
  );

  // Tải danh sách conversations khi mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversations = await chatService.getConversations();
        setConversations(conversations);
      } catch (err) {
        console.error("Lỗi tải conversations:", err);
      } finally {
        setIsLoadingConvs(false);
      }
    };
    fetchConversations();
  }, []);

  // Chọn user → load lịch sử chat + đánh dấu đã đọc
  const handleSelectUser = async (convUserId: number) => {
    setSelectedUserId(convUserId);
    setMessages([]);

    // Đánh dấu đã đọc trong UI
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === convUserId ? { ...c, unreadCount: 0 } : c
      )
    );

    // Phát sự kiện đã đọc thời gian thực
    if (socketRef.current) {
      socketRef.current.emit("mark_messages_read", {
        userId: convUserId,
        readerRole: "admin",
      });
    }

    await fetchHistory(convUserId);
  };

  // Gửi reply — optimistic UI + emit socket + cập nhật sidebar
  const handleSend = (content: string) => {
    if (!selectedUserId) return;

    // Optimistic UI
    const optimistic: Message = {
      content,
      senderRole: "admin",
      senderName: user?.full_name || "Admin",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);

    sendReply(selectedUserId, content, user?.full_name || "Admin");

    // Cập nhật last message trong sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === selectedUserId
          ? {
            ...c,
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
          }
          : c
      )
    );
  };

  const selectedConv = conversations.find((c) => c.userId === selectedUserId);

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* SIDEBAR — Danh sách conversations */}
      <ChatSidebar
        conversations={conversations}
        selectedUserId={selectedUserId}
        isLoading={isLoadingConvs}
        onSelectUser={handleSelectUser}
      />

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedUserId && selectedConv ? (
          <>
            <AdminChatHeader conversation={selectedConv} />

            <ChatMessageList
              messages={messages}
              isLoading={isLoadingMsgs}
              currentRole="admin"
              otherAvatarLabel={
                selectedConv.user?.fullName?.charAt(0).toUpperCase() || "U"
              }
              otherAvatarGradient="linear-gradient(135deg, #4f46e5, #7c3aed)"
              otherAvatarUrl={selectedConv.user?.avatarUrl}
              formatTime={formatChatTimeWithDate}
            />

            <ChatInput
              onSend={handleSend}
              placeholder={`Trả lời ${selectedConv.user?.fullName || "khách hàng"}...`}
            />
          </>
        ) : (
          <AdminEmptyState
            hasConversations={conversations.length > 0}
            isLoading={isLoadingConvs}
          />
        )}
      </div>
    </div>
  );
}
