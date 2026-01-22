import { Request, Response } from "express";
import { registerService, loginService, refreshTokenService, logoutService, getMeService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/authMiddleware";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  res.status(201).json({ status: "success", data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await loginService(req.body);
  res.status(200).json({ status: "success", data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await refreshTokenService(refreshToken);
  res.status(200).json({ status: "success", data: result });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  await logoutService(req.user.id);
  res.status(200).json({ status: "success", message: "Đăng xuất thành công" });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await getMeService(req.user.id);
  res.status(200).json({ status: "success", data: result });
});