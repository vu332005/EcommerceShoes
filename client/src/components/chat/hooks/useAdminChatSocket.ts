"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { Message, Conversation } from "@/types/chat";

interface UseAdminChatSocketReturn {
  socketRef: React.RefObject<Socket | null>;
  /** Admin gửi reply tới user */
  sendReply: (userId: number, content: string, senderName: string) => void;
}

/**
 * Hook quản lý socket connection cho Admin Chat Page.
 * Lắng nghe: new_user_message, new_message_from_admin
 * Cung cấp: sendReply() để admin trả lời user
 */
export function useAdminChatSocket(
  selectedUserId: number | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
): UseAdminChatSocketReturn {
  const { accessToken } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    // Nhận tin nhắn mới từ user
    socket.on("new_user_message", (msg: Message) => {
      // Cập nhật tin nhắn nếu đang xem conversation của user này
      if (selectedUserId === msg.userId) {
        setMessages((prev) => {
          // Dedup: không append nếu id đã tồn tại
          if (msg.id != null && prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Tự động thông báo đã xem vì admin đang mở cuộc trò chuyện này
        socket.emit("mark_messages_read", {
          userId: msg.userId!,
          readerRole: "admin",
        });
      }

      // Cập nhật sidebar conversations
      setConversations((prev) => {
        const exists = prev.find((c) => c.userId === msg.userId);
        if (exists) {
          return prev
            .map((c) =>
              c.userId === msg.userId
                ? {
                    ...c,
                    lastMessage: msg.content,
                    lastMessageAt: new Date().toISOString(),
                    unreadCount:
                      selectedUserId === msg.userId ? 0 : c.unreadCount + 1,
                  }
                : c
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
            );
        }
        // User mới chưa có conversation
        return [
          {
            userId: msg.userId!,
            user: {
              id: msg.userId!,
              fullName: msg.senderName,
              email: "",
              avatarUrl: undefined,
            },
            lastMessage: msg.content,
            lastMessageAt: new Date().toISOString(),
            unreadCount: selectedUserId === msg.userId ? 0 : 1,
          },
          ...prev,
        ];
      });
    });

    // Nhận echo từ reply của admin (đồng bộ giữa nhiều tab admin)
    socket.on(
      "new_message_from_admin",
      (msg: Message & { userId: number }) => {
        if (selectedUserId === msg.userId) {
          setMessages((prev) => {
            const pendingIdx = prev.findIndex(
              (m) => !m.id && m.content === msg.content
            );
            if (pendingIdx !== -1) {
              const arr = [...prev];
              arr[pendingIdx] = msg;
              return arr;
            }
            // Tin nhắn từ tab admin khác
            if (!prev.find((m) => m.id === msg.id)) {
              return [...prev, msg];
            }
            return prev;
          });
        }
      }
    );

    // Nhận sự kiện đã xem tin nhắn từ đối phương thời gian thực
    socket.on(
      "messages_read",
      ({
        userId: readUserId,
        readerRole,
      }: {
        userId: number;
        readerRole: "user" | "admin";
      }) => {
        if (selectedUserId === readUserId) {
          setMessages((prev) =>
            prev.map((m) => {
              if (readerRole === "admin" && m.senderRole === "user") {
                return { ...m, isRead: true };
              }
              if (readerRole === "user" && m.senderRole === "admin") {
                return { ...m, isRead: true };
              }
              return m;
            })
          );
        }

        // Đồng bộ sidebar unreadCount về 0 khi admin đọc cuộc trò chuyện
        if (readerRole === "admin") {
          setConversations((prev) =>
            prev.map((c) =>
              c.userId === readUserId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      }
    );

    return () => {
      socket.off("new_user_message");
      socket.off("new_message_from_admin");
      socket.off("messages_read");
    };
  }, [accessToken, selectedUserId, setMessages, setConversations]);

  const sendReply = useCallback(
    (userId: number, content: string, senderName: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("admin_reply", {
        userId,
        content,
        senderName,
      });
    },
    []
  );

  return { socketRef, sendReply };
}
