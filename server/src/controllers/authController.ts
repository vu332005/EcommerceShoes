import { Request, Response } from "express";
import { registerService, loginService, refreshTokenService, logoutService, getMeService, updateProfileService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import { loginFacebookService } from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AppError } from "../utils/AppError";

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
  if (!req.user) throw new AppError("Người dùng không tồn tại", 401);
  await logoutService(req.user.id);
  res.status(200).json({ status: "success", message: "Đăng xuất thành công" });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Người dùng không tồn tại", 401);

  const result = await getMeService(req.user.id);
  res.status(200).json({ status: "success", data: result });
});

export const updateProfile = catchAsync(async(req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Người dùng không tồn tại", 401);
  const result = await updateProfileService(req.user.id, req.body);

  res.status(200).json({
    status: "success",
    message: "cập nhật hồ sơ thành công",
    data: result
  })
})

export const loginFacebook = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) throw new Error("Thiếu Access Token");
  
  const result = await loginFacebookService(accessToken);
  
  res.status(200).json({ 
    status: "success", 
    message: "Đăng nhập Facebook thành công",
    data: result 
  });
});