// src/index.ts
import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { initChatSocket } from "./socket/chatSocket";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Bọc Express app trong HTTP server để Socket.io có thể dùng chung
const httpServer = http.createServer(app);

// Khởi tạo Socket.io chat
initChatSocket(httpServer);

// Khởi động Database trước, sau đó mới start Server
const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Socket.io ready on ws://localhost:${PORT}`);
  });
};

startServer();