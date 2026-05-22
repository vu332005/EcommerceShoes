import React from "react";

interface ChatFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Nút floating ở góc phải dưới để mở/đóng ChatWidget.
 * Hiển thị icon chat bubble khi đóng, icon X khi mở.
 */
export default function ChatFloatingButton({
  isOpen,
  onClick,
}: ChatFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{ background: "linear-gradient(135deg, #E31D2B, #c0152e)" }}
      title="Chat với Admin"
    >
      {isOpen ? (
        // Icon X (đóng)
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        // Icon chat bubble (mở)
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )}
    </button>
  );
}
