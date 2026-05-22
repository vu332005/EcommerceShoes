import React from "react";
import { Conversation } from "@/types/chat";
import { formatChatTimeWithDate } from "@/lib/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 1 item trong sidebar danh sách conversations.
 * Hiển thị avatar, tên, tin nhắn cuối, thời gian, badge unread.
 */
export default function ConversationItem({
  conversation: conv,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const displayName = conv.user?.fullName || `User #${conv.userId}`;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all border-b border-gray-100/50 hover:bg-white ${
        isSelected ? "bg-white border-l-2 border-l-red-500" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #E31D2B, #c0152e)",
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
            className={`text-sm truncate ${
              conv.unreadCount > 0
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-700"
            }`}
          >
            {displayName}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
            {formatChatTimeWithDate(conv.lastMessageAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate mt-0.5 ${
            conv.unreadCount > 0
              ? "text-gray-700 font-medium"
              : "text-gray-400"
          }`}
        >
          {conv.lastMessage || "Chưa có tin nhắn"}
        </p>
      </div>
    </button>
  );
}
