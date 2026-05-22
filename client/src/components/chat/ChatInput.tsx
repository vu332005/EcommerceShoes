import React, { useState } from "react";

interface ChatInputProps {
  /** Callback khi gửi tin nhắn */
  onSend: (content: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Component ô nhập tin nhắn + nút "Gửi".
 * Tự quản lý state inputText, parent chỉ cần nhận onSend callback.
 * Dùng chung cho cả ChatWidget và Admin Chat Page.
 */
export default function ChatInput({
  onSend,
  placeholder = "Nhập tin nhắn...",
}: ChatInputProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSend(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-3 py-3 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-red-300 transition-colors">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            background: inputText.trim()
              ? "linear-gradient(135deg, #E31D2B, #c0152e)"
              : "#e5e7eb",
            color: inputText.trim() ? "white" : "#9ca3af",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
