import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (!socket || !socket.connected) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
    const socketUrl = apiUrl.replace('/api/v1', '');
    
    socket = io(socketUrl, {
      path: "/socket.io",
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
