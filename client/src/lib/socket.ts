import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// return socket instance
// its like phone line or direct connnection between client and server
export const getSocket = (token: string): Socket => {
  if (!socket || !socket.connected) {
    // Dùng NEXT_PUBLIC_SOCKET_URL riêng biệt (trỏ thẳng tới server, không có /api/v1)
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

    socket = io(socketUrl, {
      path: "/socket.io",
      auth: { token }, // send token to authenticate
      autoConnect: true, // auto connect to server when getSocket() is called
      reconnection: true, // allow to auto reconnect if connection is lost
      reconnectionAttempts: 5, // maximum number of attempts after 5 times still cannot connect -> stop reconnection
      reconnectionDelay: 1000, // delay between attempts in milliseconds
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
