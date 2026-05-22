"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Message } from "@/types/chat";
import { useChatSocket } from "@/components/chat/hooks/useChatSocket";
import { useChatHistory } from "@/components/chat/hooks/useChatHistory";
import ChatFloatingButton from "./ChatFloatingButton";
import ChatWidgetHeader from "./ChatWidgetHeader";
import ChatMessageList from "../ChatMessageList";
import ChatInput from "../ChatInput";
``
/**
 * Chat Widget hiển thị cho user (khách hàng).
 * Floating button + cửa sổ chat popup ở góc phải dưới.
 *
 * Orchestrator: chỉ compose các component con và quản lý state mở/đóng.
 */
export default function ChatWidget() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  // Hooks
  const { messages, setMessages, isLoading, fetchHistory } = useChatHistory();
  const { isAdminOnline, sendMessage, socketRef } = useChatSocket(setMessages);

  // Tải lịch sử chat khi mở widget lần đầu
  useEffect(() => {
    if (!isOpen || !user || messages.length > 0) return;
    fetchHistory(user.id);
  }, [isOpen, user, messages.length, fetchHistory]);

  // Đánh dấu đã đọc các tin nhắn của admin gửi cho mình khi mở chat hoặc có tin nhắn mới
  useEffect(() => {
    if (isOpen && user && socketRef.current) {
      socketRef.current.emit("mark_messages_read", {
        userId: user.id,
        readerRole: "user",
      });
    }
  }, [isOpen, user, messages.length, socketRef]);

  // Gửi tin nhắn — optimistic UI + emit socket
  const handleSend = (content: string) => {
    if (!user) return;

    // Optimistic UI: hiện ngay tin nhắn pending
    const pendingMsg: Message = {
      content,
      senderRole: "user",
      senderName: user.full_name || "Bạn",
      createdAt: new Date(),
      pending: true,
    };
    setMessages((prev) => [...prev, pendingMsg]);

    sendMessage(content, user.full_name || "Khách hàng");
  };

  // Không render widget cho admin hoặc chưa đăng nhập
  if (!isAuthenticated || !user || user.role === "admin") return null;

  // Empty state cho widget
  const widgetEmptyState = (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#E31D2B"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">Xin chào! Có thể giúp gì cho bạn?</p>
      <p className="text-gray-400 text-xs mt-1">
        Hãy gửi tin nhắn để được hỗ trợ
      </p>
    </div>
  );

  return (
    <>
      {/* FLOATING BUTTON */}
      <ChatFloatingButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            height: "480px",
            background: "#fff",
            border: "1px solid #f0f0f0",
            animation: "slideUp 0.25s ease-out",
          }}
        >
          <ChatWidgetHeader isAdminOnline={isAdminOnline} />

          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            currentRole="user"
            emptyStateContent={widgetEmptyState}
            otherAvatarLabel="A"
          />

          <ChatInput
            onSend={handleSend}
            placeholder="Nhập tin nhắn..."
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
