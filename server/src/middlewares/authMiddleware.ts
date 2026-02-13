import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";
import { AppError } from "../utils/AppError";

// interface UserPayload extends JwtPayload {
//   id: number;
//   role: string;
// }

// export interface AuthRequest extends Request {
//   user?: UserPayload;
// }

export interface AuthRequest extends Request {
  user: any; 
}

// ...role -> để sau nếu thêm role -> Ví dụ dùng: protect('admin', 'mod') -> cho Admin hoặc Mod. 
export const protect = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let token;
    
    // Lấy token từ header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError("Vui lòng đăng nhập", 401));

    try {
      // Verify token
      const decoded = verifyToken(token) as any;
      
      // Gán user vào req -> ở các Controller phía sau getCart, createOrder,.. mới dùng được req.user.id.
      // * Ép kiểu req thành AuthRequest để gán được thuộc tính user
      (req as AuthRequest).user = decoded;

      // Check quyền (Nếu có truyền roles)
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return next(new AppError("Bạn không có quyền truy cập", 403));
      }

      next();
    } catch (error) {
      return next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
    }
  };
};