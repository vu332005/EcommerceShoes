import { RefObject } from "react";

/**
 * Format thời gian tin nhắn — chỉ hiển thị giờ:phút (múi giờ Việt Nam)
 * Dùng cho ChatWidget (user-side)
 */
export function formatChatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/**
 * Format thời gian tin nhắn — hiển thị giờ:phút (múi giờ Việt Nam)
 * Dùng cho Admin Chat Page
 */
export function formatChatTimeWithDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/**
 * Auto-scroll container xuống cuối (dùng cho message list)
 */
export function scrollToBottom(ref: RefObject<HTMLDivElement | null>): void {
  if (ref.current) {
    const container = ref.current.parentElement;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }
}
