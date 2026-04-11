// src/index.ts
import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Khởi động Database trước, sau đó mới start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
};

startServer();