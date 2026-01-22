import { Request, Response, NextFunction } from "express";
import * as masterService from "../services/masterService"; // bộ
import { catchAsync } from "../utils/catchAsync";

// Get Categories
export const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await masterService.getAllCategoriesService();
  
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories
  });
});

// Get Brands
export const getBrands = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const brands = await masterService.getTagsByTypeService('brand');
  
  res.status(200).json({
    status: 'success',
    results: brands.length,
    data: brands
  });
});

// Get Sizes
export const getSizes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sizes = await masterService.getTagsByTypeService('size');
  
  res.status(200).json({
    status: 'success',
    results: sizes.length,
    data: sizes
  });
});

// Get Colors
export const getColors = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const colors = await masterService.getTagsByTypeService('color');
  
  res.status(200).json({
    status: 'success',
    results: colors.length,
    data: colors
  });
});