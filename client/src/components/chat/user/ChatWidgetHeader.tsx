import React from "react";

interface ChatWidgetHeaderProps {
  isAdminOnline: boolean;
}

/**
 * Header của ChatWidget — hiện logo, trạng thái admin online/offline.
 */
export default function ChatWidgetHeader({
  isAdminOnline,
}: ChatWidgetHeaderProps) {
  return (
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
          {isAdminOnline
            ? "● Admin đang trực tuyến"
            : "○ Admin ngoại tuyến"}
        </p>
      </div>
    </div>
  );
}
