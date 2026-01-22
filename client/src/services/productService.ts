import axiosInstance from "@/lib/axios";
import { ProductParams, ProductResponse, Product } from "@/types/product";

export const productService = {
  getProducts: async (params: ProductParams): Promise<ProductResponse> => {
    try {
      const res = await axiosInstance.get("/product", { params });
      
      const apiResponse = res.data; 
      const rawData = apiResponse?.data?.data || []; // lấy ra mảng dlieu thực sự

      console.log(`Đã lấy được ${rawData.length} sản phẩm từ API`);

      // Map dữ liệu để khớp với Frontend (Xử lý trường hợp thiếu field)
      const products: Product[] = rawData.map((item: any) => ({
        id: item.id,
        name: item.name || "Sản phẩm không tên",
        
        // Xử lý giá: Backend trả basePrice, Frontend dùng price
        price: Number(item.basePrice || item.price || 0),
        
        // Xử lý ảnh: Nếu là tên file thì thêm đường dẫn, nếu link thì giữ nguyên
        thumbnailUrl: item.thumbnailUrl 
          ? (item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `/images/${item.thumbnailUrl}`)
          : "/images/placeholder.png",
        
        // Xử lý Brand và Category (Backend log cho thấy brand bị thiếu)
        category: item.category || { id: 0, name: "Khác" },

        brand: item.brand || { id: 0, name: "N/A" }, // note
        
        // description: item.description || "",
        // variants: item.variants || [],
        // images: item.images || []
      }));

      return products;
    } catch (error) {
      console.error("Lỗi mapping sản phẩm:", error);
      return [];
    }
  },

getProductDetail: async (id: number): Promise<Product | null> => {
    try {
      const res = await axiosInstance.get(`/product/${id}`);
      const item = res.data.data;
      if (!item) return null;
      
      return {
        ...item,
        // Map các trường quan trọng để tránh undefined
        price: Number(item.basePrice || 0),

        // nếu rỗng -> ảnh mặc định / ảnh online -> giữ nguyễn / ảnh local -> thêm images để truy cập
        thumbnailUrl: item.thumbnailUrl 
          ? (item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `/images/${item.thumbnailUrl}`) 
          : "/images/placeholder.png",

        brand: item.brand || { id: 0, name: "N/A" }, // 

        images: item.images || [], 
        variants: item.variants || []
      };
    } catch (error) {
      return null;
    }
  },

  // getRelatedProducts: async (id: number): Promise<Product[]> => {
  //   try {
  //     const res = await axiosInstance.get(`/product/${id}/related`);
  //     const list = res.data?.data || [];
  //     return list.map((item: any) => ({
  //       ...item,
  //       price: Number(item.basePrice || 0),
  //       brand: item.brand || { id: 0, name: "N/A" }
  //     }));
  //   } catch (error) {
  //     return [];
  //   }
  // }
};