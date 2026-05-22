"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/lib/socket"; // get socket instance
import { Socket } from "socket.io-client";
import { Message } from "@/types/chat";

interface UseChatSocketReturn {
  isConnected: boolean;
  isAdminOnline: boolean;
  socketRef: React.RefObject<Socket | null>;
  /** Gửi tin nhắn từ user tới admin */
  sendMessage: (content: string, senderName: string) => void;
}

/**
 * Hook quản lý socket connection cho ChatWidget (user-side).
 * Lắng nghe: connect, disconnect, admin_status, new_message
 * Cung cấp: sendMessage() để gửi tin nhắn
 */
export function useChatSocket(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): UseChatSocketReturn {
  const { accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !isAuthenticated) return;

    const socket = getSocket(accessToken);
    //assign socket instance to ref so it can be reused , ensuring only one connnection exists and it wont be recreating\
    // have to use socketRef bc sendMessage func is not in this effect
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("admin_status", ({ online }: { online: boolean }) => {
      setIsAdminOnline(online);
    });

    // Nhận tin nhắn mới (cả echo từ server và tin từ admin)
    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => {
        // Nếu là echo từ server cho tin nhắn của mình -> replace pending
        if (msg.senderRole === "user") {
          const pendingIdx = prev.findIndex(
            (m) => m.pending && m.content === msg.content
          );
          if (pendingIdx !== -1) {
            const newArr = [...prev];
            newArr[pendingIdx] = { ...msg, pending: false };
            return newArr;
          }
        }
        return [...prev, msg];
      });
    });

    // Nhận sự kiện đã xem tin nhắn thời gian thực
    socket.on(
      "messages_read",
      ({
        userId: readUserId,
        readerRole,
      }: {
        userId: number;
        readerRole: "user" | "admin";
      }) => {
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
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("admin_status");
      socket.off("new_message");
      socket.off("messages_read");
    };
  }, [accessToken, isAuthenticated, setMessages]);
  // setMessages is set func in useState take from useChatHistory
  // set func... in useState always stable identity in component life-cycle -> không bị tạo mới khi re-render -> nó sẽ kbh làm useEffect chạy lại
  // -> reason why add setMessage in dependence array just to solve eslint warning "react-hooks/exhaustive-deps"

  const sendMessage = useCallback(
    (content: string, senderName: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("send_message", { content, senderName });
    },
    []
  );

  return { isConnected, isAdminOnline, socketRef, sendMessage };
}
