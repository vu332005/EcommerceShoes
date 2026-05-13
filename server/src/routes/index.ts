import { Router } from "express";
import authRoutes from "./authRoutes";
import masterRoutes from "./masterRoutes"
import productRoutes from "./productRoutes"
import cartRoutes from "./cartRoutes"
import orderRoutes from "./orderRoutes";
import uploadRoutes from "./uploadRoutes"
import chatRoutes from "./chatRoutes"

const router = Router();
router.use("/auth", authRoutes); // các api dùng để auth
router.use("/master", masterRoutes);
router.use("/product", productRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/upload",uploadRoutes)
router.use("/chat", chatRoutes)

export default router;