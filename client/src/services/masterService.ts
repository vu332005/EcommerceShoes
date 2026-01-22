import axiosInstance from "@/lib/axios";
import { Brand, Category } from "@/types/product";

export const masterService = {
  // GET /master/brands
  getBrands: async (): Promise<Brand[]> => {
    const res = await axiosInstance.get("/master/brands");
    // Backend: res.status(200).json({ status: 'success', results: ..., data: brands })
    return res.data.data;
  },

  // GET /master/categories 
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosInstance.get("/master/categories");
    return res.data.data;
  },
};