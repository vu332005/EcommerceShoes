import { Router } from "express";
import { getList, getNewArrivals, getDetail, getRelated } from "../controllers/productController";

const router = Router();

// Các route tĩnh
router.get("/new-arrivals", getNewArrivals);
router.get("/", getList);

// Các route động (:id) - luôn đặt sau cùng
router.get("/:id", getDetail);
router.get("/:id/related", getRelated);

export default router;