import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { getChatHistory, getConversations } from "../controllers/chatController";

const router = Router();

// Lấy lịch sử chat của 1 user (user tự xem hoặc admin xem)
router.get("/history/:userId", protect("customer", "admin"), getChatHistory);

// Lấy danh sách tất cả conversation (admin only)
router.get("/conversations", protect("admin"), getConversations);

export default router;
