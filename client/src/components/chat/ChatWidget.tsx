"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import api from "@/lib/axios";

interface Message {
  id?: number;
  content: string;
  senderRole: "user" | "admin";
  senderName: string;
  createdAt: Date | string;
  pending?: boolean;
}

export default function ChatWidget() {
  const { user, accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("admin_status", ({ online }: { online: boolean }) => {
      setIsAdminOnline(online);
    });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => {
        // Nếu là echo từ server cho tin nhắn của mình -> replace pending
        if (msg.senderRole === "user") {
          const pendingIdx = prev.findIndex(
            (m) => m.pending && m.content === msg.content
          );
          if (pendingIdx !== -1) {
            const newArr = [...prev];
            newArr[pendingIdx] = { ...msg, pending: false };
            return newArr;
          }
        }
        return [...prev, msg];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("admin_status");
      socket.off("new_message");
    };
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Tải lịch sử chat khi mở widget
  useEffect(() => {
    if (!isOpen || !user || messages.length > 0) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/chat/history/${user.id}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Lỗi tải lịch sử chat:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [isOpen, user]);

  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;

    const content = inputText.trim();
    setInputText("");

    // Optimistic UI: hiện ngay tin nhắn pending
    const pendingMsg: Message = {
      content,
      senderRole: "user",
      senderName: user?.full_name || "Bạn",
      createdAt: new Date(),
      pending: true,
    };
    setMessages((prev) => [...prev, pendingMsg]);

    socketRef.current.emit("send_message", {
      content,
      senderName: user?.full_name || "Khách hàng",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // Không render widget cho admin hoặc chưa đăng nhập
  if (!isAuthenticated || !user || user.role === "admin") return null;

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: "linear-gradient(135deg, #E31D2B, #c0152e)" }}
        title="Chat với Admin"
      >
        {isOpen ? (
          // Icon X
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Icon chat bubble
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

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
          {/* HEADER */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "linear-gradient(135deg, #E31D2B, #c0152e)" }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-red-600"
                style={{ background: isAdminOnline ? "#22c55e" : "#94a3b8" }}
              />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Hỗ trợ khách hàng</p>
              <p className="text-white/75 text-xs">
                {isAdminOnline ? "● Admin đang trực tuyến" : "○ Admin ngoại tuyến"}
              </p>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: "#f8f9fa" }}>
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#E31D2B" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Xin chào! Có thể giúp gì cho bạn?</p>
                <p className="text-gray-400 text-xs mt-1">Hãy gửi tin nhắn để được hỗ trợ</p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.senderRole === "user";
              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                      <span className="text-red-600 text-xs font-bold">A</span>
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                        isUser
                          ? "rounded-br-sm text-white"
                          : "rounded-bl-sm text-gray-800 bg-white border border-gray-100"
                      } ${msg.pending ? "opacity-60" : ""}`}
                      style={isUser ? { background: "linear-gradient(135deg, #E31D2B, #c0152e)" } : {}}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-0.5 ${isUser ? "text-right" : "text-left"}`}>
                      {formatTime(msg.createdAt)}
                      {msg.pending && " · Đang gửi..."}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="px-3 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-red-300 transition-colors">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                style={{ background: inputText.trim() ? "linear-gradient(135deg, #E31D2B, #c0152e)" : "#e5e7eb" }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={inputText.trim() ? "white" : "#9ca3af"} strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
