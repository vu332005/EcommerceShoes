import { Router } from "express";
import { checkout } from "../controllers/orderController";
import { protect } from "../middlewares/authMiddleware";
import { getMyOrders } from "../controllers/orderController";
const router = Router();

// Route Checkout (Bắt buộc đăng nhập)
router.post("/checkout", protect, checkout);

router.get("/my-orders", protect, getMyOrders);
export default router;