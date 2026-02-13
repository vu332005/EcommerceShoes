"use client";

import { CartItem as ICartItem } from "@/services/cart.service";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";

interface Props {
  item: ICartItem;
  onUpdateQty: (newQty: number) => void;
  onRemove: () => void;
}

export default function CartItem({ item, onUpdateQty, onRemove }: Props) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // xử lý ảnh
  const getSafeImageUrl = (url: string) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url; // Ảnh online

    // Nếu đã có /images/ ở đầu thì xóa đi để chuẩn hóa
    const cleanPath = url.startsWith("/images/")
      ? url.replace("/images/", "")
      : url;

    // Thêm lại tiền tố chuẩn
    return `/images/${cleanPath}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-6 border-b border-gray-100 last:border-0 relative">
      {/* btn xóa trên điện thoại*/}
      <button
        onClick={onRemove}
        className="absolute top-4 right-0 sm:hidden text-gray-400 hover:text-red-500 p-1"
      >
        <X size={18} />
      </button>

      {/* ảnh spham */}
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={getSafeImageUrl(item.thumbnailUrl)}
          alt={item.productName}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback khi ảnh lỗi
            const target = e.target as HTMLImageElement;
            target.srcset = ""; // nextjs tự động tạo nh kích cỡ ảnh khác nhau (srcset) để tối ưu cho đth/mtinh -> khi ảnh gốc lỗi
            // -> trình duyệt cố load các ảnh trong srcset -> ta cho bằng rỗng để ngắt việc cố load các phiên bản lỗi khác của ảnh đó
            target.src = "https://placehold.co/100x100?text=No+Image";
          }}
        />
      </div>

      {/* thông tin spham */}
      <div className="flex flex-1 flex-col justify-between w-full sm:w-auto h-full min-h-[112px]">
        <div>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 pr-6 sm:pr-0">
            {item.productName}
          </h3>
          <div className="mt-1 text-sm text-gray-500 space-x-2">
            {item.color && (
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                {item.color}
              </span>
            )}
            {item.size && (
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                {item.size}
              </span>
            )}
          </div>
        </div>

        {/* điều chỉnh số lg / giá tiền */}
        <div className="flex items-end justify-between mt-4 sm:mt-0">
          <div className="flex items-center rounded border border-gray-300">
            <button
              onClick={() => onUpdateQty(Math.max(1, item.quantity - 1))}
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-medium text-black">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-red-800">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-gray-400">
                {formatPrice(item.price)} / cái
              </p>
            )}
          </div>
        </div>
      </div>

      {/* btn xóa trên desktop*/}
      <button
        onClick={onRemove}
        className="hidden sm:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        title="Xóa sản phẩm"
      >
        <X size={20} />
      </button>
    </div>
  );
}
