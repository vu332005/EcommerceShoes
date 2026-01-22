export interface Category {
  id: number;
  name: string;
}

// Thêm: Kiểu dữ liệu Màu sắc
export interface Color {
  id: number;
  name: string;
  hexCode: string; // Ví dụ: #FFFFFF
}

// Thêm: Kiểu dữ liệu Kích cỡ
export interface Size {
  id: number;
  value: string; // API trả về "value", không phải "name"
}
// ----------------

export interface Brand {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  color?: { id: number; name: string; hexCode: string };
  size?: { id: number; value: string };
  stockQuantity: number;
  priceOverride?: number;    
  images?: ProductImage[];   
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[]; // Mảng các biến thể
  createdAt: string;
}

// Định nghĩa tham số gửi lên API để lọc (Filter Params)
export interface ProductParams {
  page?: number;
  limit?: number;
  keyword?: string;
  brand_id?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
}

// Định nghĩa dữ liệu API trả về (gồm danh sách và phân trang)
export interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}