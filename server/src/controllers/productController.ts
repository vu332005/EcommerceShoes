import { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService"; // Import style functional
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

// lấy dsach


/*
eg : GET /products?page=2&min_price=100000
- các tham số được lưu trong req.query dưới dạng chuỗi -> ta cần ph sdung dlieu chính xác (số / chuỗi)
*/
export const getList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const params = {
    page: Number(req.query.page) || 1, // chuyển page -> số nếu ng dùng gửi sai mặc định là 1
    limit: Number(req.query.limit) || 12,
    keyword: req.query.keyword as string,
    min_price: req.query.min_price ? Number(req.query.min_price) : undefined,
    max_price: req.query.max_price ? Number(req.query.max_price) : undefined,
    sort: req.query.sort as string,
    tag_ids: req.query.tag_ids as string,
    category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
  };

  const result = await productService.getProducts(params);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

//  Get New Arrivals
export const getNewArrivals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = req.query.limit ? Number(req.query.limit) : 8;
  const data = await productService.getNewArrivals(limit);
  
  res.status(200).json({
    status: 'success',
    results: data.length,
    data: data
  });
});

// Get Detail
export const getDetail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  const product = await productService.getProductDetail(id);
  
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

// Get Related
export const getRelated = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  
  // Check sản phẩm gốc trước
  const product = await productService.getProductDetail(id);
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm gốc', 404));
  }

  const related = await productService.getRelatedProducts(id, product.categoryId);
  
  res.status(200).json({
    status: 'success',
    results: related.length,
    data: related
  });
});