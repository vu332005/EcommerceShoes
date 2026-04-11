import { Router } from "express";
import { getList, getDetail } from "../controllers/productController";
import { protect } from "../middlewares/authMiddleware";
import { createProduct, updateProduct, deleteProduct, getAdminProducts, createVariant, updateVariant, deleteVariant } from "../controllers/productController";

const router = Router();

// --- ROUTE TĨNH & ADMIN ---
// router.get("/new-arrivals", getNewArrivals);
router.get("/admin/all", protect("admin"), getAdminProducts);
router.post("/", protect("admin"), createProduct);

// --- VARIANT ROUTES (ADMIN) ---
router.post("/:productId/variants", protect("admin"), createVariant);
router.put("/variants/:variantId", protect("admin"), updateVariant);
router.delete("/variants/:variantId", protect("admin"), deleteVariant);

// --- PUBLIC LIST ---
router.get("/", getList);

// --- ROUTE ĐỘNG (:id) - Đặt cuối cùng ---
router.put("/:id", protect("admin"), updateProduct);
router.delete("/:id", protect("admin"), deleteProduct);
router.get("/:id", getDetail);
// router.get("/:id/related", getRelated);

export default router;