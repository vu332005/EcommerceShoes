import React from "react";
import { Conversation } from "@/types/chat";

interface AdminChatHeaderProps {
  conversation: Conversation;
}

/**
 * Header phía trên khu vực chat khi admin đã chọn 1 conversation.
 * Hiển thị avatar, tên, email của user.
 */
export default function AdminChatHeader({
  conversation,
}: AdminChatHeaderProps) {
  const displayName =
    conversation.user?.fullName || `User #${conversation.userId}`;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #E31D2B, #c0152e)",
        }}
      >
        {conversation.user?.avatarUrl ? (
          <img
            src={conversation.user.avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{displayName}</p>
        <p className="text-gray-400 text-xs">
          {conversation.user?.email || ""}
        </p>
      </div>
    </div>
  );
}
