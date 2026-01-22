import { Request, Response, NextFunction } from "express";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
    //nếu lỗi -> next -> nó sẽ tự nhảy về middleware xử lý lỗi mà ta đã tạo trong app
  };
};

/*
- như 1 wrapper -> giúp không phải viết try - catch lặp đi lặp lại
*/