import { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService"; // Import style functional
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AppDataSource } from "../config/db";
import { Product } from "../models/Product";

//USER

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
const productRepo = AppDataSource.getRepository(Product);

// ADMIN

export const getAdminProducts = catchAsync(async (req: Request, res: Response) => {
  const data = await productService.getAllProducts();
  res.status(200).json({ status: "success", data });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const data = await productService.createProduct(req.body);
  res.status(201).json({ status: "success", message: "Tạo sản phẩm thành công", data });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = await productService.updateProduct(id, req.body);
  res.status(200).json({ status: "success", message: "Cập nhật thành công", data });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await productService.deleteProduct(id);
  res.status(200).json({ status: "success", message: "Đã xóa sản phẩm" });
});

export const createVariant = catchAsync(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const data = await productService.createVariant(productId, req.body);
  res.status(201).json({ status: "success", message: "Đã thêm biến thể", data });
});

export const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const variantId = Number(req.params.variantId);
  const data = await productService.updateVariant(variantId, req.body);
  res.status(200).json({ status: "success", message: "Cập nhật biến thể thành công", data });
});

export const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  const variantId = Number(req.params.variantId);
  await productService.deleteVariant(variantId);
  res.status(200).json({ status: "success", message: "Đã xóa biến thể" });
});