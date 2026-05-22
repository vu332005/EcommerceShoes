"use client";

import { useState, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { Message } from "@/types/chat";

interface UseChatHistoryReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  /** Tải lịch sử chat theo userId */
  fetchHistory: (userId: number) => Promise<void>;
}

/**
 * Hook tải lịch sử chat từ API.
 * Dùng chung cho cả ChatWidget (user-side) và Admin Chat Page.
 */
export function useChatHistory(): UseChatHistoryReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async (userId: number) => {
    setIsLoading(true);
    try {
      const messages = await chatService.getHistory(userId);
      setMessages(messages);
    } catch (err) {
      console.error("Lỗi tải lịch sử chat:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, setMessages, isLoading, fetchHistory };
}
