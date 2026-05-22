import React, { useEffect, useRef, useCallback, ReactNode } from "react";
import { Message } from "@/types/chat";
import { scrollToBottom } from "@/lib/chat";
import ChatMessageBubble from "./ChatMessageBubble";

/** Ngưỡng break group: 5 phút (ms) */
const GROUP_BREAK_MS = 5 * 60 * 1000;

/** Hiện timestamp separator TRƯỚC tin nhắn khi:
 *  - Là tin đầu tiên trong conversation, hoặc
 *  - Cách tin trước ≥ 5 phút
 */
function shouldShowTimeHeader(
  current: Message,
  prev: Message | undefined
): boolean {
  if (!prev) return true;
  const tCur = new Date(current.createdAt).getTime();
  const tPrev = new Date(prev.createdAt).getTime();
  return tCur - tPrev >= GROUP_BREAK_MS;
}

/** Kiểm tra có nên show avatar đối phương không (tin cuối trong cụm liên tiếp) */
function shouldShowAvatar(
  current: Message,
  next: Message | undefined,
  isOwnMessage: boolean
): boolean {
  if (isOwnMessage) return false;
  if (!next) return true;
  if (next.senderRole !== current.senderRole) return true;
  const tCur = new Date(current.createdAt).getTime();
  const tNext = new Date(next.createdAt).getTime();
  return tNext - tCur >= GROUP_BREAK_MS;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  /** Role hiện tại: "user" (widget) hoặc "admin" (admin page) */
  currentRole: "user" | "admin";
  /** Nội dung hiển thị khi chưa có tin nhắn */
  emptyStateContent?: ReactNode;
  /** Chữ hiện trên avatar đối phương (fallback) */
  otherAvatarLabel?: string;
  /** Gradient cho avatar đối phương (fallback) */
  otherAvatarGradient?: string;
  /** URL ảnh avatar thật của user */
  otherAvatarUrl?: string;
  /** Chữ hiện trên avatar bản thân (chỉ admin hiện) */
  ownAvatarLabel?: string;
  /** Custom format time */
  formatTime?: (date: Date | string) => string;
}

/**
 * Container hiển thị danh sách messages + auto-scroll + loading/empty state.
 * Dùng chung cho cả ChatWidget và Admin Chat Page.
 *
 * Group logic:
 *  - Timestamp separator: căn giữa, hiện sau tin cuối cụm của đối phương
 *  - Avatar đối phương: chỉ hiện ở tin cuối cụm
 */
export default function ChatMessageList({
  messages,
  isLoading,
  currentRole,
  emptyStateContent,
  otherAvatarLabel,
  otherAvatarGradient,
  otherAvatarUrl,
  ownAvatarLabel,
  formatTime,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const doScroll = useCallback(() => {
    scrollToBottom(messagesEndRef);
  }, []);

  useEffect(() => {
    doScroll();
  }, [messages, doScroll]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3"
      style={{ background: "#f8f9fa" }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && messages.length === 0 && (
        emptyStateContent || (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Chưa có tin nhắn nào</p>
          </div>
        )
      )}

      {/* Danh sách tin nhắn */}
      {messages.map((msg, idx) => {
        const isOwnMessage = msg.senderRole === currentRole;
        const prev = idx > 0 ? messages[idx - 1] : undefined;
        const next = idx < messages.length - 1 ? messages[idx + 1] : undefined;

        const showAvatar = shouldShowAvatar(msg, next, isOwnMessage);
        const showTimeHeader = shouldShowTimeHeader(msg, prev);
        const isLastMessage = idx === messages.length - 1;

        // Spacing: lớn hơn khi đổi người gửi hoặc đầu list
        const isGroupStart =
          !prev || prev.senderRole !== msg.senderRole ||
          new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() >= GROUP_BREAK_MS;

        const marginTop = isGroupStart ? "mt-3" : "mt-0.5";

        // Dùng key ổn định: server messages có id duy nhất, pending messages dùng idx
        const key = msg.id != null ? `msg-${msg.id}` : `pending-${idx}`;

        const timeStr = formatTime
          ? formatTime(msg.createdAt)
          : new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

        return (
          <React.Fragment key={key}>
            {/* Timestamp separator — căn giữa, hiện TRƯỚC tin đầu group mới */}
            {showTimeHeader && (
              <div className="flex items-center justify-center my-2">
                <span className="text-[10px] text-gray-400 bg-gray-200/70 px-2.5 py-0.5 rounded-full">
                  {timeStr}
                </span>
              </div>
            )}

            <div className={showTimeHeader ? "mt-0" : marginTop}>
              <ChatMessageBubble
                message={msg}
                isOwnMessage={isOwnMessage}
                avatarLabel={isOwnMessage ? ownAvatarLabel : otherAvatarLabel}
                avatarGradient={isOwnMessage ? undefined : otherAvatarGradient}
                avatarUrl={isOwnMessage ? undefined : otherAvatarUrl}
                showAvatar={showAvatar}
                isLastMessage={isLastMessage}
              />
            </div>
          </React.Fragment>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
