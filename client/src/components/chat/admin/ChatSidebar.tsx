import React from "react";
import { Conversation } from "@/types/chat";
import ConversationItem from "./ConversationItem";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedUserId: number | null;
  isLoading: boolean;
  onSelectUser: (userId: number) => void;
}

/**
 * Sidebar danh sách conversations trong Admin Chat Page.
 * Bao gồm header (tiêu đề + badge), danh sách, loading/empty state.
 */
export default function ChatSidebar({
  conversations,
  selectedUserId,
  isLoading,
  onSelectUser,
}: ChatSidebarProps) {
  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );

  return (
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
        {isLoading ? (
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
          conversations.map((conv) => (
            <ConversationItem
              key={conv.userId}
              conversation={conv}
              isSelected={conv.userId === selectedUserId}
              onClick={() => onSelectUser(conv.userId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
