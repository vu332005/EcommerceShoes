import React from "react";
import { Message } from "@/types/chat";
import { formatChatTime } from "@/lib/chat";

interface ChatMessageBubbleProps {
  message: Message;
  /** true = tin nhắn của mình (bên phải), false = tin nhắn đối phương (bên trái) */
  isOwnMessage: boolean;
  /** Chữ hiện trên avatar (vd: "A", "K") — fallback khi không có ảnh */
  avatarLabel?: string;
  /** Gradient CSS cho avatar fallback */
  avatarGradient?: string;
  /** URL ảnh avatar thật của đối phương */
  avatarUrl?: string;
  /** Có hiện avatar không (chỉ hiện ở tin cuối cùng trong cụm) */
  showAvatar?: boolean;
  /** Có phải là tin nhắn cuối cùng của cả hội thoại không */
  isLastMessage?: boolean;
}

/**
 * Component hiển thị 1 tin nhắn (bubble).
 * Dùng chung cho cả ChatWidget và Admin Chat Page.
 */
export default function ChatMessageBubble({
  message,
  isOwnMessage,
  avatarLabel,
  avatarGradient = "linear-gradient(135deg, #E31D2B, #c0152e)",
  avatarUrl,
  showAvatar = false,
  isLastMessage = false,
}: ChatMessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Avatar bên trái (tin nhắn đối phương / user) — chỉ hiện ở tin cuối cụm */}
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 mt-auto overflow-hidden">
          {showAvatar ? (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt={avatarLabel || "avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-semibold text-xs"
                style={{ background: avatarGradient }}
              >
                {avatarLabel}
              </div>
            )
          ) : (
            /* Placeholder giữ layout căn lề, trong suốt */
            <div className="w-full h-full" />
          )}
        </div>
      )}

      <div className={`max-w-[70%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Bubble nội dung */}
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm ${isOwnMessage
            ? "rounded-br-sm text-white"
            : "rounded-bl-sm text-gray-800 bg-white border border-gray-100"
            } ${message.pending ? "opacity-60" : ""}`}
          style={
            isOwnMessage
              ? { background: "linear-gradient(135deg, #E31D2B, #c0152e)" }
              : {}
          }
        >
          {message.content}
        </div>

        {/* Trạng thái tin nhắn đã gửi/đang gửi/đã xem */}
        {isOwnMessage && isLastMessage && (
          <div className="flex justify-end mt-1 px-1">
            {message.pending ? (
              <span className="text-[10px] text-gray-400 italic">Đang gửi...</span>
            ) : message.isRead ? (
              <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium animate-fadeIn">
                <span>Đã xem</span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E31D2B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-[1px]"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 font-light">Đã gửi</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
