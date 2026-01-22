import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;