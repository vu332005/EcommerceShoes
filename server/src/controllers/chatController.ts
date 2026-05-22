import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import {
  getMessagesByUser,
  getConversationList,
  markAsRead,
  markAdminMessagesAsRead,
} from "../services/chatService";

// lấy lịch sử tin nhắn -> User chỉ xem được lịch sử của chính mình, admin xem được tất cả
export const getChatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthRequest;
    const targetUserId = parseInt(req.params.userId);

    // User chỉ được xem lịch sử của chính mình
    if (
      authReq.user.role !== "admin" &&
      String(authReq.user.id) !== String(targetUserId) // id ng xem # id của user sở hữu chat
    ) {
      return res.status(403).json({
        message: `Không có quyền truy cập. UserID in token: ${authReq.user.id}, requested: ${targetUserId}`,
      });
    }

    const messages = await getMessagesByUser(targetUserId);

    // Nếu admin vào xem -> đánh dấu tin nhắn của user là đã đọc
    if (authReq.user.role === "admin") {
      await markAsRead(targetUserId);
    } else {
      // Nếu user vào xem -> đánh dấu tin nhắn của admin là đã đọc
      await markAdminMessagesAsRead(targetUserId);
    }

    return res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// get conversation list for managment (admin only)
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversations = await getConversationList();
    return res.json({ conversations });
  } catch (err) {
    next(err);
  }
};
