"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import api from "@/lib/axios";

interface Message {
  id?: number;
  content: string;
  senderRole: "user" | "admin";
  senderName: string;
  userId?: number;
  createdAt: Date | string;
}

interface Conversation {
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

export default function AdminChatPage() {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, []);

  // Kết nối socket
  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    // Nhận tin nhắn mới từ user
    socket.on("new_user_message", (msg: Message) => {
      // Cập nhật tin nhắn nếu đang xem conversation của user này
      if (selectedUserId === msg.userId) {
        setMessages((prev) => [...prev, msg]);
      }

      // Cập nhật sidebar conversations
      setConversations((prev) => {
        const exists = prev.find((c) => c.userId === msg.userId);
        if (exists) {
          return prev
            .map((c) =>
              c.userId === msg.userId
                ? {
                    ...c,
                    lastMessage: msg.content,
                    lastMessageAt: new Date().toISOString(),
                    unreadCount:
                      selectedUserId === msg.userId ? 0 : c.unreadCount + 1,
                  }
                : c,
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime(),
            );
        }
        // User mới chưa có conversation
        return [
          {
            userId: msg.userId!,
            user: {
              id: msg.userId!,
              fullName: msg.senderName,
              email: "",
              avatarUrl: undefined,
            },
            lastMessage: msg.content,
            lastMessageAt: new Date().toISOString(),
            unreadCount: selectedUserId === msg.userId ? 0 : 1,
          },
          ...prev,
        ];
      });
    });

    // Nhận echo từ reply của admin (đồng bộ giữa nhiều tab admin)
    socket.on("new_message_from_admin", (msg: Message & { userId: number }) => {
      if (selectedUserId === msg.userId) {
        setMessages((prev) => {
          const pendingIdx = prev.findIndex(
            (m) => !m.id && m.content === msg.content,
          );
          if (pendingIdx !== -1) {
            const arr = [...prev];
            arr[pendingIdx] = msg;
            return arr;
          }
          // Tin nhắn từ tab admin khác
          if (!prev.find((m) => m.id === msg.id)) {
            return [...prev, msg];
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off("new_user_message");
      socket.off("new_message_from_admin");
    };
  }, [accessToken, selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Tải danh sách conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error("Lỗi tải conversations:", err);
      } finally {
        setIsLoadingConvs(false);
      }
    };
    fetchConversations();
  }, []);

  // Tải tin nhắn khi chọn user
  const handleSelectUser = async (convUserId: number) => {
    setSelectedUserId(convUserId);
    setMessages([]);
    setIsLoadingMsgs(true);

    // Đánh dấu đã đọc trong UI
    setConversations((prev) =>
      prev.map((c) => (c.userId === convUserId ? { ...c, unreadCount: 0 } : c)),
    );

    try {
      const res = await api.get(`/chat/history/${convUserId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedUserId || !socketRef.current) return;

    const content = inputText.trim();
    setInputText("");

    // Optimistic UI
    const optimistic: Message = {
      content,
      senderRole: "admin",
      senderName: user?.full_name || "Admin",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);

    socketRef.current.emit("admin_reply", {
      userId: selectedUserId,
      content,
      senderName: user?.full_name || "Admin",
    });

    // Cập nhật last message trong sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === selectedUserId
          ? {
              ...c,
              lastMessage: content,
              lastMessageAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const selectedConv = conversations.find((c) => c.userId === selectedUserId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* SIDEBAR - Danh sách User */}
      <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-base">Hộp thư</h2>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {conversations.length} cuộc hội thoại
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConvs ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Chưa có tin nhắn</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.userId === selectedUserId;
              const displayName = conv.user?.fullName || `User #${conv.userId}`;
              const initials = displayName.charAt(0).toUpperCase();

              return (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectUser(conv.userId)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all border-b border-gray-100/50 hover:bg-white ${
                    isSelected ? "bg-white border-l-2 border-l-red-500" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        background: `linear-gradient(135deg, #E31D2B, #c0152e)`,
                      }}
                    >
                      {conv.user?.avatarUrl ? (
                        <img
                          src={conv.user.avatarUrl}
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        {displayName}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}
                    >
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #E31D2B, #c0152e)",
                }}
              >
                {selectedConv?.user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {selectedConv?.user?.fullName || `User #${selectedUserId}`}
                </p>
                <p className="text-gray-400 text-xs">
                  {selectedConv?.user?.email || ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
              style={{ background: "#f9fafb" }}
            >
              {isLoadingMsgs ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      {!isAdmin && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2 flex-shrink-0 mt-auto"
                          style={{
                            background:
                              "linear-gradient(135deg, #4f46e5, #7c3aed)",
                          }}
                        >
                          {selectedConv?.user?.fullName
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="max-w-[65%]">
                        {!isAdmin && (
                          <p className="text-[11px] text-gray-400 mb-1 ml-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            isAdmin
                              ? "rounded-br-sm text-white"
                              : "rounded-bl-sm text-gray-800 bg-white border border-gray-100"
                          }`}
                          style={
                            isAdmin
                              ? {
                                  background:
                                    "linear-gradient(135deg, #E31D2B, #c0152e)",
                                }
                              : {}
                          }
                        >
                          {msg.content}
                        </div>
                        <p
                          className={`text-[10px] text-gray-400 mt-0.5 ${isAdmin ? "text-right" : "text-left"}`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center ml-2 flex-shrink-0 mt-auto">
                          <span className="text-red-600 text-xs font-bold">
                            A
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-red-300 transition-colors">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Trả lời ${selectedConv?.user?.fullName || "khách hàng"}...`}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #E31D2B, #c0152e)",
                  }}
                >
                  Gửi
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg
                width="36"
                height="36"
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
            <h3 className="text-gray-700 font-semibold text-lg">
              Hỗ trợ khách hàng
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Chọn một cuộc hội thoại để bắt đầu trả lời
            </p>
            {conversations.length === 0 && !isLoadingConvs && (
              <p className="text-gray-400 text-xs mt-4 bg-gray-100 px-4 py-2 rounded-full">
                Chưa có khách hàng nào nhắn tin
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
