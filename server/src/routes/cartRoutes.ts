import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, syncCart } from "../controllers/cartController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// router.use(protect("admin"));
router.use(protect)

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:id", removeCartItem);
router.post("/sync", syncCart);

export default router;