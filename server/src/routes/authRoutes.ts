import { Router } from "express";
import { register, login, refresh, logout, getMe, updateProfile, loginFacebook } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/facebook", loginFacebook);

router.post("/logout", protect(), logout);
router.get("/me", protect(), getMe);
router.put("/me",protect(), updateProfile);

export default router;