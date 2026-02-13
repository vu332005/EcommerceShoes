import { Router } from "express";
import { checkout } from "../controllers/orderController";
import { protect } from "../middlewares/authMiddleware";
import { getMyOrders } from "../controllers/orderController";
import * as adminOrderController from "../controllers/adminOrderController";

const router = Router();

// Route Checkout -> Bắt buộc đăng nhập
router.post("/checkout", protect(), checkout);
router.get("/my-orders", protect(), getMyOrders);

router.get("/admin/all", protect("admin"), adminOrderController.getOrders); // Lấy danh sách
router.get("/admin/:id", protect("admin"), adminOrderController.getDetail); // Lấy chi tiết
router.put("/admin/:id/status", protect("admin"), adminOrderController.updateStatus); // Cập nhật trạng thái
export default router;