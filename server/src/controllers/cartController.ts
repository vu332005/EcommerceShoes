import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as cartService from "../services/cartService";

export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await cartService.getCartService(req.user.id);
  res.status(200).json({ status: "success", data: result });
});

export const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const { variantId, quantity } = req.body;
  const result = await cartService.addToCartService(req.user.id, variantId, quantity || 1);
  res.status(200).json({ status: "success", message: "Đã thêm vào giỏ 123123", data: result });
});

export const updateCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const { itemId, quantity } = req.body;
  const result = await cartService.updateCartItemService(req.user.id, itemId, quantity);
  res.status(200).json({ status: "success", message: "Cập nhật thành công1123", data: result });
});

export const removeCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await cartService.removeCartItemService(req.user.id, Number(id));
  res.status(200).json({ status: "success", message: "Đã xóa sản phẩm123", data: result });
});

// export const syncCart = catchAsync(async (req: AuthRequest, res: Response) => {
//   const { items } = req.body; 
//   const result = await cartService.syncCartService(req.user.id, items);
//   res.status(200).json({ status: "success", message: "Đồng bộ thành công", data: result });
// });