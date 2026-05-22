import React from "react";

interface AdminEmptyStateProps {
  hasConversations: boolean;
  isLoading: boolean;
}

/**
 * Empty state hiển thị ở khu vực chat chính khi admin chưa chọn conversation nào.
 */
export default function AdminEmptyState({
  hasConversations,
  isLoading,
}: AdminEmptyStateProps) {
  return (
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
      {!hasConversations && !isLoading && (
        <p className="text-gray-400 text-xs mt-4 bg-gray-100 px-4 py-2 rounded-full">
          Chưa có khách hàng nào nhắn tin
        </p>
      )}
    </div>
  );
}
