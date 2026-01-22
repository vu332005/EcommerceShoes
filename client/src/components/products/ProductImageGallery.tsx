"use client";

import { useState, useEffect } from "react";
import { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: ProductImage[];
  thumbnailUrl: string;
}

export default function ProductImageGallery({
  images,
  thumbnailUrl,
}: GalleryProps) {
  // Hàm helper để xử lý đường dẫn ảnh
  const getFullImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url; // Link online giữ nguyên
    return `/images/${url}`; // Ảnh local thêm /images/
  };

  const displayImages =
    images.length > 0 ? images : [{ id: 0, imageUrl: thumbnailUrl }];

  // Lưu URL đầy đủ vào state
  // activeImage -> biến lưu đường dẫn của ảnh to hiện giữa màn hình -> mặc định lấy ảnh đầu danh sách
  const [activeImage, setActiveImage] = useState(
    getFullImageUrl(displayImages[0].imageUrl || thumbnailUrl)
  );

  // sync khi mà danh sách ảnh thay đổi
  useEffect(() => {
    if (images.length > 0) {
      setActiveImage(getFullImageUrl(images[0].imageUrl));
    } else {
      setActiveImage(getFullImageUrl(thumbnailUrl));
    }
  }, [images, thumbnailUrl]);

  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh lớn */}
      <div className="aspect-square w-full overflow-hidden rounded-lg border bg-gray-100 relative">
        <img
          src={activeImage}
          alt="Product Main"
          className="h-full w-full object-cover object-center transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/600x600?text=No+Image";
          }}
        />
      </div>

      {/* Danh sách ảnh nhỏ */}
      {displayImages.length > 1 && ( // danh sách chỉ hiện khi có 2 ảnh trở lên
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img: any, index: number) => {
            const fullUrl = getFullImageUrl(img.imageUrl); // chuẩn hóa url ảnh
            return (
              <button
                key={img.id || index}
                onClick={() => setActiveImage(fullUrl)} // bấm vào ảnh con nào -> set ảnh đó làm ảnh lớn
                className={cn(
                  "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  activeImage === fullUrl
                    ? "border-blue-600 opacity-100 ring-2 ring-blue-100" // ảnh chọn
                    : "border-transparent opacity-70 hover:opacity-100" // không chọn
                )}
              >
                <img
                  src={fullUrl}
                  alt={`Thumbnail ${index}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // xử lý nếu ảnh lỗi
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100?text=Error";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
