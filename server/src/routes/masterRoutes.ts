import { Router } from "express";
import { getCategories, getBrands, getSizes, getColors } from "../controllers/masterController";

const router = Router();

router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/sizes", getSizes);
router.get("/colors", getColors);

export default router;