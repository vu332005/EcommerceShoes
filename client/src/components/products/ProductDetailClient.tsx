"use client";
// component này quản lý thư viện ảnh bên trái - thông tin/ nút chọn màu bên phải
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import { useMemo } from "react";

export default function ProductDetailClient({ product }: { product: Product }) {
  //
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  console.log("Dữ liệu ảnh từ API:", product.images);

  // Logic lọc ảnh theo màu
  const filteredImages = useMemo(() => {
    if (!selectedColorId) return product.images; // Chưa chọn màu thì hiện tất cả

    //!!
    // Lọc ra các ảnh có color_id trùng với màu đang chọn HOẶC ảnh chung (color_id null)
    const imagesByColor = product.images.filter(
      (img: any) => img.color === null || img.color?.id === selectedColorId
    );

    // Nếu màu đó không có ảnh riêng, fallback về hiển thị tất cả
    return imagesByColor.length > 0 ? imagesByColor : product.images;
  }, [product.images, selectedColorId]);

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
      {/* Truyền danh sách ảnh ĐÃ LỌC vào Gallery */}
      <ProductImageGallery
        images={filteredImages}
        thumbnailUrl={product.thumbnailUrl}
      />

      {/* Truyền hàm setColor xuống Info để khi bấm nút thì cập nhật lên đây */}
      <ProductInfo product={product} onColorSelect={setSelectedColorId} />
    </div>
  );
}
