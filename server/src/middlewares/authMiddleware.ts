import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: any;
}



// export const protect = (role: any)  => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) return next(new AppError("Vui lòng đăng nhập", 401));

//   try {
//     const decoded = verifyToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
//   }
// }; 
// }
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Vui lòng đăng nhập", 401));

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
  }
}; 